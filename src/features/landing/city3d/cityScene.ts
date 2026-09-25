/**
 * Backend City in 3D (three.js). Imperative scene with a tiny API so React only mounts it.
 *
 * - Instanced towers with a procedural window shader; each district has a "lights on" level
 *   that the scroll story raises (the city comes back online).
 * - Wet street: planar reflection under a translucent asphalt layer (skipped in low-fx mode).
 * - Packets with light trails travel the streets: served (climb a tower), bounced (amber, at
 *   the Gatehouse), crashed (red sparks). Bloom makes the neon glow.
 */
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export type Outcome = "pass" | "bounce" | "crash";

export interface CityOptions {
  lowFx: boolean;
  still: boolean;
  onResolve?: (o: Outcome) => void;
}

export interface CityScene {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  start(): void;
  stop(): void;
  resize(): void;
  dispose(): void;
}

/** Districts in world space. Index 0 = generic city. */
const DISTRICTS = [
  { key: "city", center: new THREE.Vector2(0, 0), radius: 0, tint: [0.55, 0.65, 1.0] },
  { key: "academy", center: new THREE.Vector2(-38, -4), radius: 15, tint: [0.3, 1.0, 0.6] },
  { key: "signal", center: new THREE.Vector2(-12, -34), radius: 14, tint: [0.25, 0.9, 1.0] },
  { key: "gatehouse", center: new THREE.Vector2(20, -10), radius: 14, tint: [0.25, 0.9, 1.0] },
  { key: "construction", center: new THREE.Vector2(34, -62), radius: 26, tint: [0.45, 0.5, 0.7] },
] as const;

/** Camera stops for the scroll story: overview, Academy, Signal Tower, Gatehouse, pull-back. */
const STOPS = [
  { pos: new THREE.Vector3(0, 34, 62), look: new THREE.Vector3(0, 4, -22) },
  { pos: new THREE.Vector3(-72, 24, 28), look: new THREE.Vector3(-36, 6, -8) },
  { pos: new THREE.Vector3(-44, 30, 0), look: new THREE.Vector3(-10, 8, -36) },
  { pos: new THREE.Vector3(56, 22, 20), look: new THREE.Vector3(18, 10, -12) },
  { pos: new THREE.Vector3(6, 62, 58), look: new THREE.Vector3(14, 0, -40) },
];
export const STAGE_COUNT = STOPS.length;

const BLOCK = 12; // street grid pitch
const STREET = 3;

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (x: number) => x * x * (3 - 2 * x);

interface Tower {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  district: number;
}

interface Packet {
  path: THREE.Vector3[];
  lengths: number[];
  total: number;
  dist: number;
  dir: 1 | -1;
  speed: number;
  outcome: Outcome;
  bounceAt: number;
  color: THREE.Color;
  head: THREE.Mesh;
  trail: THREE.Line;
  history: THREE.Vector3[];
  alive: boolean;
  fade: number;
}

const TOWER_VERT = /* glsl */ `
#include <common>
#include <fog_pars_vertex>
attribute float aDistrict;
attribute float aSeed;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vDistrict;
varying float vSeed;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
  vDistrict = aDistrict;
  vSeed = aSeed;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const TOWER_FRAG = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
uniform float uLit[5];
uniform vec3 uTint[5];
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vDistrict;
varying float vSeed;
varying vec2 vUv;
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  int d = int(vDistrict + 0.5);
  float lit = uLit[0];
  vec3 tint = uTint[0];
  if (d == 1) { lit = uLit[1]; tint = uTint[1]; }
  else if (d == 2) { lit = uLit[2]; tint = uTint[2]; }
  else if (d == 3) { lit = uLit[3]; tint = uTint[3]; }
  else if (d == 4) { lit = uLit[4]; tint = uTint[4]; }
  vec3 base = vec3(0.006, 0.01, 0.026);
  vec3 col = base;
  if (abs(vNormalW.y) < 0.5) {
    float u = abs(vNormalW.x) > 0.5 ? vWorld.z : vWorld.x;
    vec2 g = vec2(u / 0.8, vWorld.y / 1.05);
    vec2 f = fract(g);
    float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.28, f.y) * step(f.y, 0.72);
    float r = hash(vec3(floor(g), vSeed));
    float on = step(r, mix(0.03, 0.5, lit));
    float flick = 0.88 + 0.12 * sin(uTime * (0.4 + r * 1.6) + r * 40.0);
    vec3 wc = mix(vec3(0.55, 0.65, 1.0), tint, 0.4 + 0.6 * lit) * (0.4 + 0.75 * lit * r + 0.2 * lit) * flick;
    // floor slabs every 4 m give the facade structure between window rows
    float slab = 1.0 - step(0.08, fract(vWorld.y / 4.2));
    col = mix(base, wc, win * on) * (1.0 - 0.5 * slab);
    // soft vertical gradient on the facade: lighter near the street glow
    col += vec3(0.004, 0.014, 0.026) * (1.0 - smoothstep(0.0, 8.0, vWorld.y));
  } else {
    col = base * 1.5;
  }
  // Crisp building definition: thin rim on every face edge, constant pixel width
  vec2 fw = max(fwidth(vUv), vec2(1e-4));
  vec2 edge = min(vUv, 1.0 - vUv) / fw;
  float rim = 1.0 - smoothstep(0.6, 1.6, min(edge.x, edge.y));
  vec3 rimColor = mix(vec3(0.16, 0.22, 0.42), tint * 0.55, lit);
  col = mix(col, rimColor, rim * 0.85);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}
`;

export function createCityScene(canvas: HTMLCanvasElement, opts: CityOptions): CityScene {
  const rand = rng(20260925);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !opts.lowFx,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lowFx ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b18);
  scene.fog = new THREE.FogExp2(0x0a1022, 0.0082);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.5, 600);
  const camPos = STOPS[0]!.pos.clone();
  const camLook = STOPS[0]!.look.clone();
  camera.position.copy(camPos);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  // ---- sky: horizon glow + stars ----
  const glowTex = track(
    radialTexture(["rgba(62,230,255,0.35)", "rgba(178,124,255,0.12)", "rgba(0,0,0,0)"]),
  );
  const horizon = new THREE.Mesh(
    track(new THREE.PlaneGeometry(520, 180)),
    track(
      new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  horizon.position.set(0, 20, -220);
  scene.add(horizon);

  const starGeo = track(new THREE.BufferGeometry());
  const starPos = new Float32Array(900);
  for (let i = 0; i < 300; i++) {
    const a = rand() * Math.PI * 2;
    const r = 260 + rand() * 40;
    starPos.set([Math.cos(a) * r, 40 + rand() * 160, Math.sin(a) * r - 60], i * 3);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  scene.add(
    new THREE.Points(
      starGeo,
      track(
        new THREE.PointsMaterial({
          color: 0xbfd0ff,
          size: 0.9,
          sizeAttenuation: true,
          fog: false,
          transparent: true,
          opacity: 0.7,
        }),
      ),
    ),
  );

  // ---- towers ----
  const towers: Tower[] = [];
  const districtOf = (x: number, z: number) => {
    for (let i = 1; i < DISTRICTS.length; i++) {
      const d = DISTRICTS[i]!;
      if (Math.hypot(x - d.center.x, z - d.center.y) < d.radius) return i;
    }
    return 0;
  };
  const halfBlock = (BLOCK - STREET) / 2;
  for (let bx = -84; bx <= 84; bx += BLOCK) {
    for (let bz = -120; bz <= 24; bz += BLOCK) {
      const count = 1 + Math.floor(rand() * 3);
      for (let k = 0; k < count; k++) {
        const w = 1.8 + rand() * 3.2;
        const dpt = 1.8 + rand() * 3.2;
        const x = bx + (rand() * 2 - 1) * (halfBlock - w / 2);
        const z = bz + (rand() * 2 - 1) * (halfBlock - dpt / 2);
        const district = districtOf(x, z);
        const centerBoost = Math.max(0, 1 - Math.hypot(x, z + 30) / 90);
        const h = 3 + rand() * rand() * 30 * (0.5 + centerBoost) + (district ? 4 : 0);
        towers.push({ x, z, w, d: dpt, h, district });
      }
    }
  }
  // The Gatehouse gets one landmark tower
  const gate = DISTRICTS[3]!.center;
  const gateTower: Tower = { x: gate.x, z: gate.y, w: 5, d: 5, h: 34, district: 3 };
  towers.push(gateTower);

  const box = track(new THREE.BoxGeometry(1, 1, 1));
  const towerMat = track(
    new THREE.ShaderMaterial({
      vertexShader: TOWER_VERT,
      fragmentShader: TOWER_FRAG,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uTime: { value: 0 },
          uLit: { value: DISTRICTS.map(() => 0.2) },
          uTint: { value: DISTRICTS.map((d) => new THREE.Vector3(...d.tint)) },
        },
      ]),
    }),
  );
  const mesh = new THREE.InstancedMesh(box, towerMat, towers.length);
  const aDistrict = new Float32Array(towers.length);
  const aSeed = new Float32Array(towers.length);
  const m4 = new THREE.Matrix4();
  towers.forEach((t, i) => {
    m4.compose(
      new THREE.Vector3(t.x, t.h / 2, t.z),
      new THREE.Quaternion(),
      new THREE.Vector3(t.w, t.h, t.d),
    );
    mesh.setMatrixAt(i, m4);
    aDistrict[i] = t.district;
    aSeed[i] = rand() * 100;
  });
  box.setAttribute("aDistrict", new THREE.InstancedBufferAttribute(aDistrict, 1));
  box.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 1));
  scene.add(mesh);

  // Gatehouse crown (amber = the gate that bounces bad requests)
  const crown = new THREE.Mesh(
    track(new THREE.TorusGeometry(3.6, 0.12, 8, 48)),
    track(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb547).multiplyScalar(2.2) })),
  );
  crown.rotation.x = Math.PI / 2;
  crown.position.set(gate.x, gateTower.h + 0.6, gate.y);
  scene.add(crown);

  // Search beams
  const beamMat = track(
    new THREE.MeshBasicMaterial({
      color: 0x3ee6ff,
      transparent: true,
      opacity: opts.lowFx ? 0.03 : 0.055,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const beamGeo = track(new THREE.ConeGeometry(7, 90, 24, 1, true));
  beamGeo.translate(0, -45, 0);
  const beams = [
    { x: gate.x, z: gate.y, y: gateTower.h },
    { x: -12, z: -34, y: 30 },
  ].map(({ x, z, y }) => {
    const b = new THREE.Mesh(beamGeo, beamMat);
    b.position.set(x, y, z);
    b.rotation.x = Math.PI; // point up
    scene.add(b);
    return b;
  });

  // ---- ground: reflection + wet asphalt + glowing streets ----
  const groundSize = 520;
  let reflector: Reflector | null = null;
  if (!opts.lowFx) {
    reflector = new Reflector(new THREE.PlaneGeometry(groundSize, groundSize), {
      textureWidth: 512,
      textureHeight: 512,
      color: 0x8899bb,
      clipBias: 0.003,
    });
    reflector.rotation.x = -Math.PI / 2;
    scene.add(reflector);
  }
  const streetTex = track(streetTexture());
  streetTex.wrapS = streetTex.wrapT = THREE.RepeatWrapping;
  streetTex.repeat.set(groundSize / BLOCK, groundSize / BLOCK);
  const asphalt = new THREE.Mesh(
    track(new THREE.PlaneGeometry(groundSize, groundSize)),
    track(
      new THREE.MeshBasicMaterial({
        map: streetTex,
        transparent: true,
        opacity: opts.lowFx ? 1 : 0.8,
        color: 0xffffff,
      }),
    ),
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.y = 0.02;
  // align the texture's street lines with the tower grid
  streetTex.offset.set(0.5 - ((groundSize / 2 / BLOCK) % 1) + STREET / 2 / BLOCK, 0.5);
  scene.add(asphalt);

  // ---- packets ----
  const packets: Packet[] = [];
  const TRAIL = 30;
  const headGeo = track(new THREE.SphereGeometry(0.42, 12, 12));
  const openTowers = towers.filter((t) => t.district >= 1 && t.district <= 3);
  const streetX = (x: number) => Math.round(x / BLOCK) * BLOCK + BLOCK / 2;
  const streetZ = (z: number) => Math.round(z / BLOCK) * BLOCK + BLOCK / 2;
  const COLORS = {
    flow: new THREE.Color(0x3ee6ff).multiplyScalar(2.4),
    pass: new THREE.Color(0x4dff9a).multiplyScalar(2.2),
    bounce: new THREE.Color(0xffb547).multiplyScalar(2.4),
    crash: new THREE.Color(0xff4d6d).multiplyScalar(2.4),
  };
  const sparks: { p: THREE.Points; v: Float32Array; life: number }[] = [];

  function spawnPacket() {
    const t = openTowers[Math.floor(rand() * openTowers.length)]!;
    const zs = streetZ(t.z);
    const xs = streetX(t.x);
    const y = 0.35;
    const path = [
      new THREE.Vector3(-110, y, zs),
      new THREE.Vector3(xs, y, zs),
      new THREE.Vector3(xs, y, t.z),
      new THREE.Vector3(t.x, y, t.z),
      new THREE.Vector3(t.x, t.h + 0.6, t.z),
    ];
    const lengths = [0];
    for (let i = 1; i < path.length; i++)
      lengths.push(lengths[i - 1]! + path[i]!.distanceTo(path[i - 1]!));
    const r = rand();
    const outcome: Outcome =
      t.district === 3
        ? r < 0.3
          ? "bounce"
          : r < 0.4
            ? "crash"
            : "pass"
        : r < 0.06
          ? "crash"
          : "pass";
    const color = COLORS.flow.clone();
    const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({ color }));
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    const trail = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const start = path[0]!.clone();
    head.position.copy(start);
    scene.add(head, trail);
    packets.push({
      path,
      lengths,
      total: lengths.at(-1)!,
      dist: 0,
      dir: 1,
      speed: 16 + rand() * 10,
      outcome,
      bounceAt: lengths[1]! - 6,
      color,
      head,
      trail,
      history: Array.from({ length: TRAIL }, () => start.clone()),
      alive: true,
      fade: 1,
    });
  }

  function pointAt(p: Packet, d: number, out: THREE.Vector3) {
    const dd = Math.max(0, Math.min(p.total, d));
    let i = 1;
    while (i < p.lengths.length - 1 && p.lengths[i]! < dd) i++;
    const a = p.path[i - 1]!;
    const b = p.path[i]!;
    const seg = p.lengths[i]! - p.lengths[i - 1]!;
    return out.copy(a).lerp(b, seg > 0 ? (dd - p.lengths[i - 1]!) / seg : 0);
  }

  function burst(at: THREE.Vector3, color: THREE.Color, n: number) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set([at.x, at.y, at.z], i * 3);
      vel.set([(rand() - 0.5) * 10, rand() * 8, (rand() - 0.5) * 10], i * 3);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color,
        size: 0.35,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scene.add(pts);
    sparks.push({ p: pts, v: vel, life: 1 });
  }

  function removePacket(p: Packet) {
    scene.remove(p.head, p.trail);
    (p.head.material as THREE.Material).dispose();
    p.trail.geometry.dispose();
    (p.trail.material as THREE.Material).dispose();
  }

  const tmp = new THREE.Vector3();
  function updatePackets(dt: number) {
    for (const p of packets) {
      if (!p.alive) continue;
      p.dist += p.dir * p.speed * dt;
      if (p.dir === 1 && p.outcome === "bounce" && p.dist >= p.bounceAt) {
        p.dir = -1;
        p.color.copy(COLORS.bounce);
        opts.onResolve?.("bounce");
      }
      if (p.dir === 1 && p.dist >= p.total) {
        pointAt(p, p.total, tmp);
        if (p.outcome === "crash") {
          burst(tmp, COLORS.crash, opts.lowFx ? 10 : 26);
          opts.onResolve?.("crash");
        } else {
          burst(tmp, COLORS.pass, opts.lowFx ? 4 : 10);
          opts.onResolve?.("pass");
        }
        p.alive = false;
      }
      if (p.dir === -1) {
        p.fade -= dt * 0.8;
        if (p.fade <= 0 || p.dist <= 0) p.alive = false;
      }
      pointAt(p, p.dist, tmp);
      p.head.position.copy(tmp);
      (p.head.material as THREE.MeshBasicMaterial).color.copy(p.color).multiplyScalar(p.fade);
      p.history.pop();
      p.history.unshift(tmp.clone());
      const pos = p.trail.geometry.getAttribute("position") as THREE.BufferAttribute;
      const col = p.trail.geometry.getAttribute("color") as THREE.BufferAttribute;
      p.history.forEach((h, i) => {
        pos.setXYZ(i, h.x, h.y, h.z);
        const k = (1 - i / TRAIL) ** 1.6 * p.fade;
        col.setXYZ(i, p.color.r * k, p.color.g * k, p.color.b * k);
      });
      pos.needsUpdate = true;
      col.needsUpdate = true;
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      if (!packets[i]!.alive) {
        removePacket(packets[i]!);
        packets.splice(i, 1);
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]!;
      s.life -= dt * 1.2;
      const pos = s.p.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let k = 0; k < pos.count; k++) {
        s.v[k * 3 + 1]! -= 14 * dt;
        pos.setXYZ(
          k,
          pos.getX(k) + s.v[k * 3]! * dt,
          pos.getY(k) + s.v[k * 3 + 1]! * dt,
          pos.getZ(k) + s.v[k * 3 + 2]! * dt,
        );
      }
      pos.needsUpdate = true;
      (s.p.material as THREE.PointsMaterial).opacity = Math.max(0, s.life);
      if (s.life <= 0) {
        scene.remove(s.p);
        s.p.geometry.dispose();
        (s.p.material as THREE.Material).dispose();
        sparks.splice(i, 1);
      }
    }
  }

  // ---- post-processing ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), opts.lowFx ? 0.45 : 0.7, 0.32, 0.45);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- story state ----
  let progress = 0;
  const pointer = new THREE.Vector2();
  const targetPos = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  const lit = towerMat.uniforms.uLit!.value as number[];

  function storyTargets() {
    const p = Math.max(0, Math.min(STOPS.length - 1, progress));
    const i = Math.min(STOPS.length - 2, Math.floor(p));
    const k = smooth(p - i);
    targetPos.copy(STOPS[i]!.pos).lerp(STOPS[i + 1]!.pos, k);
    targetPos.y += Math.sin(Math.PI * k) * 22;
    targetLook.copy(STOPS[i]!.look).lerp(STOPS[i + 1]!.look, k);
    targetPos.x += pointer.x * 3;
    targetPos.y += pointer.y * 1.6;
    // District lights: dark city, each open district switches on as the story reaches it
    const want = [
      0.16 + 0.12 * Math.min(1, p / 4),
      Math.min(1, Math.max(0.12, p - 0.35)),
      Math.min(1, Math.max(0.12, p - 1.35)),
      Math.min(1, Math.max(0.12, p - 2.35)),
      0.08,
    ];
    return want;
  }

  const timer = new THREE.Timer();
  let raf = 0;
  let running = false;
  let spawnClock = 0;

  function frame(now?: number) {
    timer.update(now);
    const dt = Math.min(0.05, timer.getDelta());
    const elapsed = timer.getElapsed();
    const want = storyTargets();
    for (let i = 0; i < lit.length; i++)
      lit[i] = lit[i]! + (want[i]! - lit[i]!) * Math.min(1, dt * 3);
    camPos.lerp(targetPos, Math.min(1, dt * 2.4));
    camLook.lerp(targetLook, Math.min(1, dt * 2.4));
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    towerMat.uniforms.uTime!.value = elapsed;
    beams.forEach((b, i) => {
      b.rotation.z = Math.sin(elapsed * 0.25 + i * 2) * 0.35;
      b.rotation.x = Math.PI + Math.cos(elapsed * 0.2 + i) * 0.25;
    });
    crown.rotation.z += dt * 0.4;
    spawnClock += dt;
    const every = opts.lowFx ? 0.35 : 0.16;
    while (spawnClock > every) {
      spawnClock -= every;
      if (packets.length < (opts.lowFx ? 18 : 48)) spawnPacket();
    }
    updatePackets(dt);
    composer.render();
    if (running) raf = requestAnimationFrame(frame);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 62 : 48; // portrait phones need a wider lens
    camera.updateProjectionMatrix();
  }

  function renderStill() {
    const want = storyTargets();
    want.forEach((v, i) => (lit[i] = v));
    camPos.copy(targetPos);
    camLook.copy(targetLook);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    for (let i = 0; i < 30; i++) {
      spawnPacket();
      const p = packets.at(-1)!;
      p.dist = p.total * (0.2 + rand() * 0.6);
    }
    updatePackets(0.016);
    composer.render();
  }

  resize();
  if (opts.still) renderStill();
  else {
    // Pre-warm traffic so the live legend starts counting immediately
    for (let i = 0; i < (opts.lowFx ? 10 : 26); i++) {
      spawnPacket();
      const p = packets.at(-1)!;
      p.dist = p.total * rand() * 0.9;
    }
  }

  return {
    setProgress(p) {
      progress = p;
      if (opts.still) renderStill();
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    start() {
      if (opts.still || running) return;
      running = true;
      timer.reset();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resize,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      packets.forEach(removePacket);
      sparks.forEach((s) => {
        s.p.geometry.dispose();
        (s.p.material as THREE.Material).dispose();
      });
      reflector?.dispose();
      disposables.forEach((d) => d.dispose());
      composer.dispose();
      renderer.dispose();
    },
  };
}

/** Night asphalt: dark blocks, slightly lighter streets with faint cyan lane lines. */
function streetTexture(): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#070b16";
  g.fillRect(0, 0, size, size);
  const street = (STREET / BLOCK) * size;
  g.fillStyle = "#0d1428";
  g.fillRect(0, 0, street, size);
  g.fillRect(0, 0, size, street);
  g.fillStyle = "rgba(62,230,255,0.55)";
  g.fillRect(street / 2 - 1, 0, 2, size);
  g.fillRect(0, street / 2 - 1, size, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function radialTexture(stops: string[]): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(256, 256, 10, 256, 256, 256);
  stops.forEach((s, i) => grad.addColorStop(i / (stops.length - 1), s));
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}
