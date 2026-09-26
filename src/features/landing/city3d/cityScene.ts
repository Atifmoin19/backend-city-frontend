/**
 * Full Stack City in 3D (three.js). Imperative scene with a tiny API so React only mounts it.
 *
 * - Instanced towers with a procedural window shader; each district has a "lights on" level
 *   that the scroll story raises (the city comes back online).
 * - Wet street: planar reflection under a translucent asphalt layer (skipped in low-fx mode).
 * - Packets with light trails travel the streets: served (climb a tower), bounced (amber, at
 *   the Gatehouse), crashed (red sparks). Bloom makes the neon glow.
 * - The Backend Tower: its glass facade is cut away top to bottom as the story dives in,
 *   revealing the structure inside (interior.ts): the backend under the frontend.
 */
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import {
  createInterior,
  GROUP_COUNT,
  INTERIOR_LOOKS,
  LANE_X,
  STAIRWELL,
  TOWER,
  TOWER_H,
} from "./interior";

export type Outcome = "pass" | "bounce" | "crash";

export type CityStage = "built" | "compiled" | "frame";

export interface CityOptions {
  lowFx: boolean;
  still: boolean;
  theme: "dark" | "light";
  onResolve?: (o: Outcome) => void;
  /** Real load milestones, for the preloader: geometry built, shaders compiled, first frame. */
  onStage?: (s: CityStage) => void;
}

/** Night city vs Daybreak city. Colors are linear RGB for the shader / three.js. */
const LOOKS = {
  dark: {
    // Synthwave night: indigo zenith, magenta horizon, violet fog so far towers read as layers
    sky: [
      ["#03061a", 0],
      ["#0b1240", 0.1],
      ["#2a1560", 0.18],
      ["#5a1d6e", 0.235],
      ["#1a1440", 0.3],
      ["#1a1440", 1],
    ] as [string, number][] | null,
    background: 0x070b18,
    fog: 0x191338,
    fogDensity: 0.0068,
    horizon: ["rgba(255,70,190,0.42)", "rgba(62,230,255,0.2)", "rgba(0,0,0,0)"],
    additive: true,
    stars: true,
    base: [0.006, 0.01, 0.026],
    glass: [0.55, 0.65, 1.0],
    rim: [0.24, 0.36, 0.78],
    day: 0,
    // moonlit/neon-lit faces: the side toward downtown catches the glow
    sun: [0.07, 0.085, 0.21],
    front: [0.04, 0.05, 0.13],
    shade: [0.015, 0.02, 0.06],
    roof: [0.08, 0.1, 0.22],
    tints: null as number[][] | null,
    neutral: false,
    street: { block: "#0b1026", road: "#171f44", lane: "rgba(62,230,255,0.75)" },
    reflect: 0x8899bb,
    asphaltOpacity: 0.8,
    bloom: [0.7, 0.32, 0.45],
    exposure: 1.05,
    beam: { color: 0x3ee6ff, opacity: 0.055 },
    packet: { flow: 0x3ee6ff, pass: 0x4dff9a, bounce: 0xffb547, crash: 0xff4d6d, gain: 2.4 },
    crown: 2.2,
    wire: [0x3ee6ff, 2.4], // full stack: wiring seen through the glass [color, gain]
  },
  light: {
    // Golden-hour toy city: azure sky, coral horizon, warm fog for depth
    // [color, stop]: blue zenith, melting into the warm fog right at the horizon line
    sky: [
      ["#2553d6", 0],
      ["#5f8ff0", 0.1],
      ["#c9b8ec", 0.19],
      ["#f2d4d6", 0.26],
      ["#f2d4d6", 1],
    ] as [string, number][],
    background: 0xf3d7d6,
    fog: 0xf2d4d6,
    fogDensity: 0.0046,
    horizon: ["rgba(255,170,120,0.9)", "rgba(255,120,160,0.32)", "rgba(255,255,255,0)"],
    additive: false,
    stars: false,
    base: [0.5, 0.5, 0.6],
    glass: [0.02, 0.07, 0.3],
    rim: [0.03, 0.04, 0.15],
    day: 1,
    sun: [1.0, 0.76, 0.55],
    front: [0.9, 0.72, 0.76],
    shade: [0.3, 0.32, 0.74],
    roof: [1.0, 0.94, 0.86],
    tints: [
      [1.0, 1.0, 1.0],
      [0.45, 1.0, 0.72],
      [0.4, 0.82, 1.0],
      [1.0, 0.7, 0.35],
      [0.85, 0.82, 0.95],
    ],
    street: { block: "#f3e4d6", road: "#8e9bc4", lane: "rgba(255,255,255,0.85)" },
    reflect: 0xffffff,
    asphaltOpacity: 0.93,
    bloom: [0.32, 0.5, 0.82],
    exposure: 1.0,
    neutral: true,
    beam: { color: 0xfff1d0, opacity: 0.16 },
    packet: { flow: 0x00a3d9, pass: 0x0fbf6a, bounce: 0xff8a00, crash: 0xff2d55, gain: 1.05 },
    crown: 1.6,
    wire: [0x0068c9, 0.8],
  },
};

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

const TX = TOWER.x;
const TZ = TOWER.z;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * Camera stops for the scroll story, one per chapter (story/chapters.ts). `arc` lifts the
 * camera over rooftops between outdoor stops; inside the tower the moves stay level.
 */
const SW = { x: TX + STAIRWELL.x, z: TZ + STAIRWELL.z }; // the camera's way up, inside

const STOPS = [
  { pos: v3(0, 34, 62), look: v3(0, 4, -22), arc: 0 }, // hero: the whole city
  // ---- the surface: Frontend District ----
  { pos: v3(14, 11, 44), look: v3(-2, 17, -8), arc: 22 }, // among the glass
  { pos: v3(-64, 20, 24), look: v3(-30, 8, -18), arc: 18 }, // HTML: rows of blocks
  { pos: v3(-34, 11, -2), look: v3(-12, 16, -38), arc: 10 }, // CSS: windows light up
  { pos: v3(6, 6.5, 26), look: v3(6, 1.5, -50), arc: 12 }, // JavaScript: street traffic
  { pos: v3(18, 48, 34), look: v3(6, 0, -42), arc: 14 }, // components + state: from above
  // ---- the dive: Backend Tower ----
  { pos: v3(TX + 24, 34, TZ + 34), look: v3(TX, 22, TZ), arc: 16 }, // facade peels away
  { pos: v3(TX - 13, 9, TZ + 15), look: v3(TX - 4, 11, TZ + 3), arc: 0 }, // steel frame
  { pos: v3(TX + 0.3, 3.2, TZ + 3.4), look: v3(TX + 1.4, 3.8, TZ - 1), arc: 0 }, // brick core
  // ---- inside, floor by floor, rising through the stairwell ----
  // lobby: back from the gate; the rise to floor 1 still passes through the stairwell
  { pos: v3(SW.x, 2.8, TZ - 1.2), look: v3(TX + LANE_X, 2.4, TZ + 6.2), arc: 0 }, // lobby: gate
  { pos: v3(SW.x, 10.6, SW.z - 0.4), look: v3(TX + 6, 9.6, TZ - 1), arc: 0 }, // F1: junction
  { pos: v3(SW.x, 18.6, SW.z - 0.4), look: v3(TX - 2, 19.8, TZ - 7.6), arc: 0 }, // F2: racks
  { pos: v3(SW.x, 26.6, SW.z - 0.4), look: v3(TX - 2.6, 26.6, TZ - 8.3), arc: 0 }, // F3: vault
  { pos: v3(SW.x, 45, SW.z), look: v3(TX + 6, 52, TZ - 6), arc: 0 }, // roof: scaffolding
  // ---- the pull-out: full stack, the surface wired to the structure ----
  { pos: v3(TX + 44, 34, TZ + 80), look: v3(TX - 16, 14, TZ - 4), arc: 18 }, // glass closes
  { pos: v3(TX - 30, 64, TZ + 104), look: v3(TX - 22, 8, TZ - 18), arc: 6 }, // choose a side
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
  /** Travels inside the Backend Tower (its own spawn budget). */
  inside: boolean;
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
uniform vec3 uBase;
uniform vec3 uGlass;
uniform vec3 uRim;
uniform float uDay;
#ifdef CUTAWAY
uniform float uCut; // the Backend Tower's facade exists only below this height
uniform float uWire; // full stack: the wiring inside shows through the closed glass
uniform vec3 uWireColor;
#endif
// Daybreak only: sun-lit, front, shade and roof face colors
uniform vec3 uSun;
uniform vec3 uFront;
uniform vec3 uShade;
uniform vec3 uRoof;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vDistrict;
varying float vSeed;
varying vec2 vUv;
float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  #ifdef CUTAWAY
  if (vWorld.y > uCut) discard;
  #endif
  int d = int(vDistrict + 0.5);
  float lit = uLit[0];
  vec3 tint = uTint[0];
  if (d == 1) { lit = uLit[1]; tint = uTint[1]; }
  else if (d == 2) { lit = uLit[2]; tint = uTint[2]; }
  else if (d == 3) { lit = uLit[3]; tint = uTint[3]; }
  else if (d == 4) { lit = uLit[4]; tint = uTint[4]; }

  // Face color: night = one dark base; day = directional sun, with the district's color washed in
  vec3 face = vNormalW.x > 0.5 ? uSun : (vNormalW.z > 0.5 ? uFront : uShade);
  float wash = clamp(lit - 0.12, 0.0, 1.0);
  face = mix(face, face * tint * 1.35, wash * 0.55) + tint * wash * 0.07 * (1.0 - uDay);
  vec3 base = face;
  vec3 col = base;

  if (abs(vNormalW.y) < 0.5) {
    float u = abs(vNormalW.x) > 0.5 ? vWorld.z : vWorld.x;
    vec2 g = vec2(u / 0.8, vWorld.y / 1.05);
    vec2 f = fract(g);
    float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.28, f.y) * step(f.y, 0.72);
    float r = hash(vec3(floor(g), vSeed));
    float flick = 0.88 + 0.12 * sin(uTime * (0.4 + r * 1.6) + r * 40.0);

    // Night: sparse lit windows that multiply as the district comes online
    float onN = step(r, mix(0.14, 0.62, lit));
    vec3 wcN = mix(uGlass, tint, 0.4 + 0.6 * lit) * (0.4 + 0.75 * lit * r + 0.2 * lit) * flick;
    // a share of warm apartment lights for color contrast against the cool neon
    wcN = mix(wcN, vec3(1.0, 0.66, 0.34) * (0.55 + 0.4 * r) * flick, step(0.8, fract(r * 7.0)) * (1.0 - lit * 0.6));

    // Day: every pane is glass reflecting the sky; lit districts glow through as neon signage
    vec3 sky = mix(uGlass, vec3(0.32, 0.52, 1.0), f.y * 0.8);
    float neon = step(r, lit * 0.42);
    vec3 wcD = mix(sky, tint * 1.5 * flick, neon);
    float onD = step(r, 0.9);

    vec3 wc = mix(wcN, wcD, uDay);
    float on = mix(onN, onD, uDay);
    float slab = 1.0 - step(0.08, fract(vWorld.y / 4.2));
    col = mix(base, wc, win * on) * (1.0 - mix(0.5, 0.22, uDay) * slab);
    // Night: neon uplight from the streets, tinted by the district once it is online
    col += mix(vec3(0.03, 0.08, 0.16), tint * 0.2, lit) * (1.0 - smoothstep(0.0, 10.0, vWorld.y)) * (1.0 - uDay);
    // Day: soft ambient occlusion where towers meet the street
    col *= mix(1.0, mix(0.62, 1.0, smoothstep(0.0, 9.0, vWorld.y)), uDay);
  } else {
    vec3 roof = mix(uRoof, uRoof * tint * 1.2, clamp(lit - 0.12, 0.0, 1.0) * 0.6);
    col = mix(base * 1.5, roof, uDay);
  }
  // Crisp building definition: thin rim on every face edge, constant pixel width
  vec2 fw = max(fwidth(vUv), vec2(1e-4));
  vec2 edge = min(vUv, 1.0 - vUv) / fw;
  float rim = 1.0 - smoothstep(0.6, 1.6, min(edge.x, edge.y));
  vec3 rimColor = mix(mix(uRim, tint * 0.55, lit), uRim, uDay);
  col = mix(col, rimColor, rim * mix(0.85, 0.7, uDay));
  #ifdef CUTAWAY
  // a hot cutting line where the glass is being peeled away
  float band = 1.0 - smoothstep(0.0, 0.7, uCut - vWorld.y);
  col = mix(col, vec3(0.45, 0.95, 1.0) * mix(2.4, 1.0, uDay), band * step(0.0, uCut));
  // risers every 3 m with pulses climbing them, plus a glowing band at each floor slab
  if (uWire > 0.0 && abs(vNormalW.y) < 0.5) {
    float wu = abs(vNormalW.x) > 0.5 ? vWorld.z : vWorld.x;
    float riser = 1.0 - smoothstep(mix(0.04, 0.24, uDay), mix(0.14, 0.36, uDay), abs(fract(wu / 3.0) - 0.5) * 3.0);
    float pulse = smoothstep(0.82, 1.0, fract(vWorld.y / 9.0 - uTime * 0.45 + floor(wu / 3.0) * 0.37));
    float fy = fract(vWorld.y / 8.0);
    float floorBand = 1.0 - smoothstep(mix(0.01, 0.03, uDay), mix(0.05, 0.07, uDay), min(fy, 1.0 - fy));
    float wire = riser * (mix(0.45, 0.8, uDay) + 1.4 * pulse) + floorBand * mix(0.35, 0.6, uDay);
    col = mix(col, uWireColor, clamp(wire, 0.0, 1.0) * uWire);
  }
  #endif
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}
`;

export function createCityScene(canvas: HTMLCanvasElement, opts: CityOptions): CityScene {
  const rand = rng(20260925);
  const look = LOOKS[opts.theme];
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !opts.lowFx,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lowFx ? 1 : 1.5));
  // Neutral keeps Daybreak's pastels saturated; ACES gives the night neons their punch
  renderer.toneMapping = look.neutral ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = look.exposure;

  const scene = new THREE.Scene();
  scene.background = look.sky ? skyTexture(look.sky) : new THREE.Color(look.background);
  scene.fog = new THREE.FogExp2(look.fog, look.fogDensity);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.5, 600);
  const camPos = STOPS[0]!.pos.clone();
  const camLook = STOPS[0]!.look.clone();
  camera.position.copy(camPos);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);
  if (scene.background instanceof THREE.Texture) track(scene.background);

  // ---- sky: horizon glow + stars ----
  const glowTex = track(radialTexture(look.horizon));
  const horizon = new THREE.Mesh(
    track(new THREE.PlaneGeometry(520, 180)),
    track(
      new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        fog: false,
        blending: look.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
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
  if (look.stars)
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
  // the Backend Tower's footprint, plus the street its traffic arrives on
  const inTowerSpace = (x: number, z: number, w: number, d: number) => {
    const nearX = Math.abs(x - TX) < TOWER.w / 2 + w / 2 + 2.5;
    const onLot = nearX && Math.abs(z - TZ) < TOWER.d / 2 + d / 2 + 2.5;
    const onStreet = Math.abs(x - (TX + LANE_X)) < 4 + w / 2 && z > TZ && z < TZ + TOWER.d / 2 + 44;
    return onLot || onStreet;
  };
  for (let bx = -84; bx <= 84; bx += BLOCK) {
    for (let bz = -120; bz <= 24; bz += BLOCK) {
      const count = 1 + Math.floor(rand() * 3);
      for (let k = 0; k < count; k++) {
        const w = 1.8 + rand() * 3.2;
        const dpt = 1.8 + rand() * 3.2;
        const x = bx + (rand() * 2 - 1) * (halfBlock - w / 2);
        const z = bz + (rand() * 2 - 1) * (halfBlock - dpt / 2);
        if (inTowerSpace(x, z, w, dpt)) continue;
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
          uTint: {
            value: DISTRICTS.map((d, i) => {
              const t = look.tints?.[i] ?? d.tint;
              return new THREE.Vector3(t[0], t[1], t[2]);
            }),
          },
          uSun: { value: new THREE.Vector3(...look.sun) },
          uFront: { value: new THREE.Vector3(...look.front) },
          uShade: { value: new THREE.Vector3(...look.shade) },
          uRoof: { value: new THREE.Vector3(...look.roof) },
          uBase: { value: new THREE.Vector3(...look.base) },
          uGlass: { value: new THREE.Vector3(...look.glass) },
          uRim: { value: new THREE.Vector3(...look.rim) },
          uDay: { value: look.day },
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

  // ---- the Backend Tower: glass facade (cut away by the story) + the structure inside ----
  const facadeGeo = track(new THREE.BoxGeometry(1, 1, 1));
  facadeGeo.setAttribute("aDistrict", new THREE.InstancedBufferAttribute(new Float32Array([0]), 1));
  facadeGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array([42]), 1));
  const facadeMat = track(
    new THREE.ShaderMaterial({
      vertexShader: TOWER_VERT,
      fragmentShader: TOWER_FRAG,
      fog: true,
      defines: { CUTAWAY: "" },
      // shares the city's uniform objects (time, lights, theme); only the cut is its own
      uniforms: {
        ...towerMat.uniforms,
        uCut: { value: TOWER_H + 1 },
        uWire: { value: 0 },
        uWireColor: { value: new THREE.Color(look.wire[0]).multiplyScalar(look.wire[1]!) },
      },
    }),
  );
  const facade = new THREE.InstancedMesh(facadeGeo, facadeMat, 1);
  facade.setMatrixAt(
    0,
    m4.compose(
      new THREE.Vector3(TX, TOWER_H / 2, TZ),
      new THREE.Quaternion(),
      new THREE.Vector3(TOWER.w, TOWER_H, TOWER.d),
    ),
  );
  scene.add(facade);
  const interior = createInterior(INTERIOR_LOOKS[opts.theme], opts.lowFx);
  disposables.push(interior);
  scene.add(interior.group);
  const inside: number[] = Array.from({ length: GROUP_COUNT }, () => 0);

  // Gatehouse crown (amber = the gate that bounces bad requests)
  const crown = new THREE.Mesh(
    track(new THREE.TorusGeometry(3.6, 0.12, 8, 48)),
    track(
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb547).multiplyScalar(look.crown) }),
    ),
  );
  crown.rotation.x = Math.PI / 2;
  crown.position.set(gate.x, gateTower.h + 0.6, gate.y);
  scene.add(crown);

  // Search beams
  const beamMat = track(
    new THREE.MeshBasicMaterial({
      color: look.beam.color,
      transparent: true,
      opacity: opts.lowFx ? look.beam.opacity * 0.55 : look.beam.opacity,
      blending: look.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
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
      color: look.reflect,
      clipBias: 0.003,
    });
    reflector.rotation.x = -Math.PI / 2;
    scene.add(reflector);
  }
  const streetTex = track(streetTexture(look.street));
  streetTex.wrapS = streetTex.wrapT = THREE.RepeatWrapping;
  streetTex.repeat.set(groundSize / BLOCK, groundSize / BLOCK);
  const asphalt = new THREE.Mesh(
    track(new THREE.PlaneGeometry(groundSize, groundSize)),
    track(
      new THREE.MeshBasicMaterial({
        map: streetTex,
        transparent: true,
        opacity: opts.lowFx ? 1 : look.asphaltOpacity,
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
  const pk = look.packet;
  const COLORS = {
    flow: new THREE.Color(pk.flow).multiplyScalar(pk.gain),
    pass: new THREE.Color(pk.pass).multiplyScalar(pk.gain * 0.92),
    bounce: new THREE.Color(pk.bounce).multiplyScalar(pk.gain),
    crash: new THREE.Color(pk.crash).multiplyScalar(pk.gain),
  };
  const blend = look.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  const sparks: { p: THREE.Points; v: Float32Array; life: number }[] = [];
  // full stack: light lines from the surface's windows into the tower's wiring
  const links = createLinks();

  function launch(
    path: THREE.Vector3[],
    outcome: Outcome,
    bounceAt: number,
    speed: number,
    scale = 1,
    inside = false,
  ): Packet {
    const lengths = [0];
    for (let i = 1; i < path.length; i++)
      lengths.push(lengths[i - 1]! + path[i]!.distanceTo(path[i - 1]!));
    const color = COLORS.flow.clone();
    const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({ color }));
    head.scale.setScalar(scale);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    const trail = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: blend,
        depthWrite: false,
      }),
    );
    const start = path[0]!.clone();
    head.position.copy(start);
    scene.add(head, trail);
    const packet: Packet = {
      path,
      lengths,
      total: lengths.at(-1)!,
      dist: 0,
      dir: 1,
      speed,
      outcome,
      bounceAt,
      color,
      head,
      trail,
      history: Array.from({ length: TRAIL }, () => start.clone()),
      alive: true,
      fade: 1,
      inside,
    };
    packets.push(packet);
    return packet;
  }

  /** Inside the tower: door → checkpoint → riser → junction → a handler (or the antenna). */
  function spawnInteriorPacket() {
    const r = interior.routes;
    const r1 = rand();
    if (r1 < 0.2) {
      launch(r.riser, "pass", Infinity, 9 + rand() * 4, 0.5, true);
      return;
    }
    const handler = r.handlers[Math.floor(rand() * r.handlers.length)]!;
    const path = [...r.toGate, ...r.toJunction.slice(1), ...handler.slice(1)];
    const toGate = r.toGate.reduce((n, p, i) => (i ? n + p.distanceTo(r.toGate[i - 1]!) : 0), 0);
    const r2 = rand();
    const outcome: Outcome = r2 < 0.28 ? "bounce" : r2 < 0.36 ? "crash" : "pass";
    launch(path, outcome, toGate - 0.8, 8 + rand() * 3, 0.55, true);
  }

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
    const street = path[1]!.distanceTo(path[0]!);
    launch(path, outcome, street - 6, 16 + rand() * 10);
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
        blending: blend,
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

  /**
   * Glowing tubes that arc from windows on the surrounding towers to the Backend Tower's
   * floors: the frontend wired to the backend. Pulses run toward the tower.
   */
  function createLinks() {
    const mat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: blend,
        uniforms: {
          uGrow: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: COLORS.flow.clone() },
          // Daybreak has no glow to carry faint lines: keep them near-solid
          uMinAlpha: { value: look.day ? 0.9 : 0.4 },
        },
        vertexShader: /* glsl */ `
          varying float vT;
          void main() {
            vT = uv.x;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uGrow;
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uMinAlpha;
          varying float vT;
          void main() {
            if (vT > uGrow) discard;
            float pulse = smoothstep(0.75, 1.0, fract(vT * 3.0 - uTime * 0.7));
            float tip = smoothstep(uGrow - 0.08, uGrow, vT) * step(uGrow, 0.999);
            float a = uMinAlpha + 0.6 * pulse + tip;
            gl_FragColor = vec4(uColor * (0.8 + pulse + tip * 1.5), clamp(a, 0.0, 1.0));
          }`,
      }),
    );
    const group = new THREE.Group();
    group.visible = false;
    scene.add(group);
    const sources = towers
      .filter((t) => {
        const d = Math.hypot(t.x - TX, t.z - TZ);
        return t.h > 8 && d > 16 && d < 72 && t !== gateTower;
      })
      .sort(() => rand() - 0.5)
      .slice(0, opts.lowFx ? 12 : 28);
    const hw = TOWER.w / 2;
    const hd = TOWER.d / 2;
    sources.forEach((t, i) => {
      const dx = TX - t.x;
      const dz = TZ - t.z;
      // leave from the source tower's face that looks at the Backend Tower
      const sideX = Math.abs(dx) > Math.abs(dz);
      const y0 = t.h * (0.35 + rand() * 0.5);
      const from = sideX
        ? v3(t.x + Math.sign(dx) * (t.w / 2 + 0.05), y0, t.z)
        : v3(t.x, y0, t.z + Math.sign(dz) * (t.d / 2 + 0.05));
      // arrive on the matching facade face, at one of the floors
      const floorY = TOWER.floor * (i % TOWER.floors) + TOWER.floor * 0.5;
      const to = sideX
        ? v3(TX - Math.sign(dx) * (hw + 0.05), floorY, TZ + Math.max(-hd, Math.min(hd, -dz * 0.25)))
        : v3(
            TX + Math.max(-hw, Math.min(hw, -dx * 0.25)),
            floorY,
            TZ - Math.sign(dz) * (hd + 0.05),
          );
      const mid = from.clone().lerp(to, 0.5);
      mid.y = Math.max(from.y, to.y) + from.distanceTo(to) * 0.28;
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const tube = new THREE.Mesh(
        track(new THREE.TubeGeometry(curve, 40, look.day ? 0.28 : 0.22, 5, false)),
        mat,
      );
      group.add(tube);
    });
    return {
      setGrow(g: number) {
        mat.uniforms.uGrow!.value = g;
        group.visible = g > 0.001;
      },
      update(t: number) {
        mat.uniforms.uTime!.value = t;
      },
    };
  }

  // ---- post-processing ----
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const [bStrength, bRadius, bThreshold] = look.bloom as [number, number, number];
  const bloomBase = opts.lowFx ? bStrength * 0.65 : bStrength;
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), bloomBase, bRadius, bThreshold);
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
    targetPos.y += Math.sin(Math.PI * k) * STOPS[i + 1]!.arc;
    targetLook.copy(STOPS[i]!.look).lerp(STOPS[i + 1]!.look, k);
    targetPos.x += pointer.x * 3;
    targetPos.y += pointer.y * 1.6;
    // District lights: dark city, each open district switches on as the story reaches it
    const on = (from: number) => Math.min(1, Math.max(0, (p - from) / 0.8));
    // The surface: CSS lights the windows, then each district glows as the tour passes it
    const want = [
      0.16 + 0.3 * on(2.5),
      Math.max(0.12, on(2.4)),
      Math.max(0.12, on(3.4)),
      Math.max(0.12, on(4.4)),
      0.08,
    ];
    // Backend Tower: the facade is cut from the roof down during the dive (stop 6)...
    // ...and rebuilt from the ground up on the way out (stop 14)
    const cutT = smooth(Math.min(1, Math.max(0, (p - 5.55) / 0.95)));
    const closeT = smooth(Math.min(1, Math.max(0, (p - 13.15) / 0.75)));
    facadeMat.uniforms.uCut!.value = TOWER_H + 1 - (cutT - closeT) * (TOWER_H + 2);
    // full stack: the wiring shows through the glass, then the light lines reach out to it
    facadeMat.uniforms.uWire!.value = on(13.2);
    links.setGrow(smooth(Math.min(1, Math.max(0, (p - 13.4) / 1.1))));
    // ...then each part of the structure powers up as the camera reaches it
    inside[0] = on(5.6); // steel frame
    inside[1] = on(7.4); // brick core: Academy
    inside[4] = on(8.4); // lobby checkpoint: Gatehouse
    inside[3] = on(9.4); // junction room: Router Station
    inside[2] = on(10.4); // racks, riser, trays: Signal Tower
    inside[5] = on(11.4); // vault, Citadel, scaffolding: still being built
    // Inside the tower everything is close: calm the bloom (and Daybreak's exposure) so
    // lit parts glow instead of flooding the frame
    const inTower =
      smooth(Math.min(1, Math.max(0, p - 6.2))) *
      (1 - smooth(Math.min(1, Math.max(0, (p - 12.4) / 0.6))));
    bloom.strength = bloomBase * (1 - (look.day ? 0.75 : 0.35) * inTower);
    renderer.toneMappingExposure = look.exposure * (1 - (look.day ? 0.1 : 0) * inTower);
    return want;
  }

  const timer = new THREE.Timer();
  let raf = 0;
  let running = false;
  let spawnClock = 0;
  let interiorClock = 0;
  let firstFrame = true;
  const markFrame = () => {
    if (!firstFrame) return;
    firstFrame = false;
    // wait for the GPU to actually present the frame before calling it painted
    requestAnimationFrame(() => opts.onStage?.("frame"));
  };

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
    links.update(elapsed);
    interior.update(elapsed, inside);
    interiorClock += dt;
    const insideEvery = opts.lowFx ? 0.9 : 0.42;
    while (interiorClock > insideEvery) {
      interiorClock -= insideEvery;
      const busy = packets.reduce((n, pk) => n + (pk.inside ? 1 : 0), 0);
      const open = progress > 5.7 && progress < 13.9; // the facade is closed again after that
      if (open && busy < (opts.lowFx ? 8 : 16)) spawnInteriorPacket();
    }
    spawnClock += dt;
    const every = opts.lowFx ? 0.35 : 0.16;
    while (spawnClock > every) {
      spawnClock -= every;
      if (packets.length < (opts.lowFx ? 18 : 48)) spawnPacket();
    }
    updatePackets(dt);
    composer.render();
    markFrame();
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
    if (progress > 5.7 && progress < 13.9) {
      for (let i = 0; i < 10; i++) {
        spawnInteriorPacket();
        const p = packets.at(-1)!;
        p.dist = Math.min(p.bounceAt - 1, p.total) * (0.2 + rand() * 0.7);
      }
    }
    interior.update(0, inside);
    updatePackets(0.016);
    composer.render();
    markFrame();
  }

  opts.onStage?.("built");
  resize();
  renderer.compile(scene, camera); // compile shaders now, not on the first visible frame
  opts.onStage?.("compiled");
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
function streetTexture(c0: { block: string; road: string; lane: string }): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = c0.block;
  g.fillRect(0, 0, size, size);
  const street = (STREET / BLOCK) * size;
  g.fillStyle = c0.road;
  g.fillRect(0, 0, street, size);
  g.fillRect(0, 0, size, street);
  g.fillStyle = c0.lane;
  g.fillRect(street / 2 - 1, 0, 2, size);
  g.fillRect(0, street / 2 - 1, size, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Vertical sky gradient (top -> horizon) used as the Daybreak background. */
function skyTexture(stops: [string, number][]): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  stops.forEach(([color, at]) => grad.addColorStop(at, color));
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
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
