/**
 * The Backend Tower's inside: what holds the glass city up. A "dollhouse" section (the front
 * half of every floor is open) so the camera can look in while the facade is cut away.
 *
 *   steel frame      columns + beams                  the framework (FastAPI)
 *   brick core       central shaft                    Academy (Python underneath)
 *   cable riser      corner riser + roof antenna      Signal Tower (HTTP on the wire)
 *   junction room    floor 1 switchboard + handlers   Router Station
 *   checkpoint       amber gate in the lobby          Gatehouse (validation)
 *   scaffolding      unfinished top floors + crane    districts still being built
 *
 * Everything is unlit (custom shader + basic materials), like the rest of the city.
 */
import * as THREE from "three";

export const TOWER = { x: 46, z: -26, w: 18, d: 18, floor: 8, floors: 5 } as const;
export const TOWER_H = TOWER.floor * TOWER.floors; // finished height (the glass facade)
/** An opening through every floor slab (offsets from the tower center): the camera rides
 * up through it from the lobby to the roof, so the tour stays inside the building. */
export const STAIRWELL = { x: -5, z: 5, half: 2.6 } as const;
/** The entrance lane (offset from the tower center): street → door → checkpoint. Off to the
 * right so the stairwell camera sees the gate from a few meters away. */
export const LANE_X = 3;
const TOP = TOWER_H + 2 * TOWER.floor; // scaffolding goes two floors higher

/** Light groups the story switches on one by one. */
export const GROUPS = {
  frame: 0,
  core: 1,
  signal: 2,
  router: 3,
  gate: 4,
  build: 5,
} as const;
export const GROUP_COUNT = 6;

export interface InteriorLook {
  steel: number[];
  brick: number[];
  mortar: number[];
  slab: number[];
  scaffold: number[];
  rim: number[];
  wire: number;
  device: number;
  gate: number;
  day: number;
}

export const INTERIOR_LOOKS: Record<"dark" | "light", InteriorLook> = {
  dark: {
    steel: [0.055, 0.075, 0.15],
    brick: [0.42, 0.16, 0.12],
    mortar: [0.1, 0.05, 0.06],
    slab: [0.05, 0.07, 0.15],
    scaffold: [0.32, 0.36, 0.52],
    rim: [0.3, 0.52, 0.95],
    wire: 0x3ee6ff,
    device: 0x9b7bff,
    gate: 0xffb547,
    day: 0,
  },
  light: {
    // deeper than the sunny surface so the inside reads as a shaded structure, not glare
    steel: [0.3, 0.34, 0.48],
    brick: [0.62, 0.3, 0.22],
    mortar: [0.78, 0.72, 0.68],
    slab: [0.58, 0.56, 0.58],
    scaffold: [0.46, 0.48, 0.62],
    rim: [0.08, 0.13, 0.34],
    wire: 0x0086c2,
    device: 0x5b3fd0,
    gate: 0xe07800,
    day: 1,
  },
};

const KIND = { steel: 0, brick: 1, slab: 2, scaffold: 3 } as const;

const STRUCT_VERT = /* glsl */ `
#include <common>
#include <fog_pars_vertex>
attribute float aKind;
attribute float aGroup;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec2 vUv;
varying float vKind;
varying float vGroup;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
  vKind = aKind;
  vGroup = aGroup;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const STRUCT_FRAG = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uKind[4];
uniform vec3 uMortar;
uniform vec3 uRim;
uniform float uLit[${GROUP_COUNT}];
uniform float uDay;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec2 vUv;
varying float vKind;
varying float vGroup;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  int k = int(vKind + 0.5);
  int g = int(vGroup + 0.5);
  float lit = uLit[0];
  for (int i = 1; i < ${GROUP_COUNT}; i++) if (i == g) lit = uLit[i];
  vec3 col = uKind[0];
  if (k == 1) col = uKind[1];
  else if (k == 2) col = uKind[2];
  else if (k == 3) col = uKind[3];

  bool side = abs(vNormalW.y) < 0.5;
  if (k == 1 && side) {
    // bricks: running bond in world space, mortar lines, a little color variation per brick
    float u = abs(vNormalW.x) > 0.5 ? vWorld.z : vWorld.x;
    float row = floor(vWorld.y / 0.42);
    vec2 b = vec2(u / 0.92 + mod(row, 2.0) * 0.5, vWorld.y / 0.42);
    vec2 f = fract(b);
    float mortar = step(f.x, 0.07) + step(f.y, 0.12);
    col *= 0.82 + 0.3 * hash(floor(b));
    col = mix(col, uMortar, clamp(mortar, 0.0, 1.0));
  }
  if (k == 2 && !side) {
    // floor slabs: faint 2 m grid
    vec2 f = fract(vWorld.xz / 2.0);
    col *= 1.0 - 0.18 * (step(f.x, 0.03) + step(f.y, 0.03));
  }
  // simple directional shading so boxes read in 3D
  float shade = vNormalW.y > 0.5 ? 1.22 : (vNormalW.x > 0.5 ? 1.0 : (vNormalW.z > 0.5 ? 0.86 : 0.7));
  col *= shade;
  // dark until the story reaches this part, then it powers up
  col *= mix(mix(0.32, 0.72, uDay), 1.0, lit);
  // crisp edges: steel reads as lit metal, bricks and slabs get a softer outline
  vec2 fw = max(fwidth(vUv), vec2(1e-4));
  vec2 edge = min(vUv, 1.0 - vUv) / fw;
  float rim = 1.0 - smoothstep(0.6, 1.6, min(edge.x, edge.y));
  float rimAmt = k == 0 ? 0.85 : (k == 3 ? 0.6 : 0.35);
  vec3 rimCol = mix(uRim * (0.22 + 0.55 * lit), uRim, uDay);
  col = mix(col, rimCol, rim * rimAmt);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}
`;

interface Piece {
  x: number;
  y: number; // bottom
  z: number;
  w: number;
  h: number;
  d: number;
  kind: number;
  group: number;
}

export interface InteriorRoutes {
  /** Street → door → checkpoint (packets that bounce turn back here). */
  toGate: THREE.Vector3[];
  /** Checkpoint → lobby → riser → floor 1 → junction. */
  toJunction: THREE.Vector3[];
  /** Junction → each handler. */
  handlers: THREE.Vector3[][];
  /** Straight up the riser to the roof antenna (ambient signal traffic). */
  riser: THREE.Vector3[];
}

export interface Interior {
  group: THREE.Group;
  routes: InteriorRoutes;
  /** Where the checkpoint is (bounce point). */
  gate: THREE.Vector3;
  update(elapsed: number, lit: number[]): void;
  dispose(): void;
}

export function createInterior(look: InteriorLook, lowFx: boolean): Interior {
  const { x: cx, z: cz, w, d, floor } = TOWER;
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(v: T) => (disposables.push(v), v);
  const pieces: Piece[] = [];
  const add = (p: Piece) => pieces.push(p);
  const halfW = w / 2 - 0.4;
  const halfD = d / 2 - 0.4;
  const colX = [-halfW, -halfW / 3, halfW / 3, halfW];
  const colZ = [-halfD, -halfD / 3, halfD / 3, halfD];
  const levels = TOWER.floors + 2;

  // ---- steel frame ----
  colX.forEach((ox, i) => {
    colZ.forEach((oz, j) => {
      // unfinished floors: only some perimeter columns have gone all the way up yet
      const perimeter = i === 0 || i === 3 || j === 0 || j === 3;
      const top = !perimeter ? TOWER_H : (i + j) % 2 === 0 ? TOP : TOWER_H + floor;
      add({
        x: cx + ox,
        y: 0,
        z: cz + oz,
        w: 0.7,
        h: top,
        d: 0.7,
        kind: KIND.steel,
        group: GROUPS.frame,
      });
    });
  });
  // floor slabs with the stairwell opening, and the beams under them (the ceiling below)
  const hole = {
    x0: STAIRWELL.x - STAIRWELL.half,
    x1: STAIRWELL.x + STAIRWELL.half,
    z0: STAIRWELL.z - STAIRWELL.half,
    z1: STAIRWELL.z + STAIRWELL.half,
  };
  const slab = (x0: number, x1: number, z0: number, z1: number, top: number, g: number) =>
    add({
      x: cx + (x0 + x1) / 2,
      y: top - 0.25,
      z: cz + (z0 + z1) / 2,
      w: x1 - x0,
      h: 0.25,
      d: z1 - z0,
      kind: KIND.slab,
      group: g,
    });
  for (let lv = 1; lv < levels; lv++) {
    const top = lv * floor;
    const g = lv > TOWER.floors ? GROUPS.build : GROUPS.frame;
    for (const oz of colZ) {
      add({
        x: cx,
        y: top - 0.85,
        z: cz + oz,
        w: w - 0.8,
        h: 0.6,
        d: 0.45,
        kind: KIND.steel,
        group: g,
      });
    }
    for (const ox of colX) {
      add({
        x: cx + ox,
        y: top - 0.85,
        z: cz,
        w: 0.45,
        h: 0.6,
        d: d - 0.8,
        kind: KIND.steel,
        group: g,
      });
    }
    if (lv <= TOWER.floors) {
      slab(-halfW, halfW, -halfD, hole.z0, top, g);
      slab(-halfW, halfW, hole.z1, halfD, top, g);
      slab(-halfW, hole.x0, hole.z0, hole.z1, top, g);
      slab(hole.x1, halfW, hole.z0, hole.z1, top, g);
    }
  }
  // stairwell rails: a thin guard around the opening on every floor
  for (let lv = 1; lv <= TOWER.floors; lv++) {
    const y = lv * floor + 1;
    add({
      x: cx + STAIRWELL.x,
      y,
      z: cz + hole.z0,
      w: STAIRWELL.half * 2,
      h: 0.08,
      d: 0.08,
      kind: KIND.steel,
      group: GROUPS.frame,
    });
    add({
      x: cx + hole.x1,
      y,
      z: cz + STAIRWELL.z,
      w: 0.08,
      h: 0.08,
      d: STAIRWELL.half * 2,
      kind: KIND.steel,
      group: GROUPS.frame,
    });
  }

  // ---- floor 2: network room (Signal Tower): server racks along the back wall ----
  const rackXs = [-5.6, -4.3, -3.0, 5.0, 6.3, 7.6];
  const rackZ = -halfD + 1.3;
  for (const rx of rackXs) {
    add({
      x: cx + rx,
      y: 2 * floor,
      z: cz + rackZ,
      w: 1.1,
      h: 3.4,
      d: 1.2,
      kind: KIND.steel,
      group: GROUPS.signal,
    });
  }
  // ---- floor 3: the Data Vaults, still being fitted out: shelving + a barrier ----
  for (const [sx, sz] of [
    [4.6, -7.4],
    [6.4, -7.4],
    [4.6, -5.2],
    [6.4, -5.2],
  ] as const) {
    add({
      x: cx + sx,
      y: 3 * floor,
      z: cz + sz,
      w: 1.3,
      h: 2.8,
      d: 0.7,
      kind: KIND.scaffold,
      group: GROUPS.build,
    });
  }
  add({
    x: cx - 1,
    y: 3 * floor + 1,
    z: cz + 1.8,
    w: 9,
    h: 0.12,
    d: 0.12,
    kind: KIND.scaffold,
    group: GROUPS.build,
  });
  // ---- floor 4: the Citadel, still being fitted out: a barred room ----
  for (let b = 0; b <= 8; b++) {
    add({
      x: cx + 3.4 + b * 0.62,
      y: 4 * floor,
      z: cz - 3.6,
      w: 0.1,
      h: 3.6,
      d: 0.1,
      kind: KIND.steel,
      group: GROUPS.build,
    });
    add({
      x: cx + 3.4,
      y: 4 * floor,
      z: cz - 3.6 - b * 0.62,
      w: 0.1,
      h: 3.6,
      d: 0.1,
      kind: KIND.steel,
      group: GROUPS.build,
    });
  }

  // cross bracing on the back wall (diagonals approximated by stepped short beams)
  for (let lv = 0; lv < TOWER.floors; lv++) {
    for (let s = 0; s < 6; s++) {
      const t = (s + 0.5) / 6;
      add({
        x: cx - halfW + t * ((halfW * 2) / 3),
        y: lv * floor + t * (floor - 0.6),
        z: cz - halfD,
        w: 0.9,
        h: 0.35,
        d: 0.3,
        kind: KIND.steel,
        group: GROUPS.frame,
      });
    }
  }
  // ground slab of the lobby
  add({
    x: cx,
    y: 0.02,
    z: cz,
    w: w - 0.8,
    h: 0.12,
    d: d - 0.8,
    kind: KIND.slab,
    group: GROUPS.gate,
  });

  // ---- brick core (Academy) ----
  const core = { x: cx + 1.2, z: cz - 2.2, s: 4.6 };
  add({
    x: core.x,
    y: 0,
    z: core.z,
    w: core.s,
    h: TOWER_H,
    d: core.s,
    kind: KIND.brick,
    group: GROUPS.core,
  });

  // ---- scaffolding on the unfinished floors (districts still being built) ----
  const pipe = lowFx ? 4.5 : 3;
  for (let s = -halfW; s <= halfW + 0.01; s += pipe) {
    for (const [px, pz] of [
      [cx + s, cz + halfD + 1],
      [cx + halfW + 1, cz + s],
    ] as const) {
      add({
        x: px,
        y: TOWER_H,
        z: pz,
        w: 0.14,
        h: TOP - TOWER_H,
        d: 0.14,
        kind: KIND.scaffold,
        group: GROUPS.build,
      });
    }
  }
  for (let y = TOWER_H + 2; y <= TOP; y += 2.6) {
    add({
      x: cx,
      y,
      z: cz + halfD + 1,
      w: w + 1,
      h: 0.12,
      d: 0.12,
      kind: KIND.scaffold,
      group: GROUPS.build,
    });
    add({
      x: cx + halfW + 1,
      y,
      z: cz,
      w: 0.12,
      h: 0.12,
      d: d + 1,
      kind: KIND.scaffold,
      group: GROUPS.build,
    });
  }
  // tower crane
  const crane = { x: cx + halfW + 4, z: cz - halfD + 1 };
  add({
    x: crane.x,
    y: 0,
    z: crane.z,
    w: 1.1,
    h: TOP + 10,
    d: 1.1,
    kind: KIND.scaffold,
    group: GROUPS.build,
  });
  add({
    x: crane.x - 9,
    y: TOP + 10,
    z: crane.z,
    w: 26,
    h: 0.7,
    d: 0.8,
    kind: KIND.scaffold,
    group: GROUPS.build,
  });
  add({
    x: crane.x + 5,
    y: TOP + 8.5,
    z: crane.z,
    w: 2.4,
    h: 1.5,
    d: 1.6,
    kind: KIND.scaffold,
    group: GROUPS.build,
  });

  // instanced structure
  const box = own(new THREE.BoxGeometry(1, 1, 1));
  const aKind = new Float32Array(pieces.length);
  const aGroup = new Float32Array(pieces.length);
  const mat = own(
    new THREE.ShaderMaterial({
      vertexShader: STRUCT_VERT,
      fragmentShader: STRUCT_FRAG,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uKind: {
            value: [look.steel, look.brick, look.slab, look.scaffold].map(
              (c) => new THREE.Vector3(c[0], c[1], c[2]),
            ),
          },
          uMortar: { value: new THREE.Vector3(...(look.mortar as [number, number, number])) },
          uRim: { value: new THREE.Vector3(...(look.rim as [number, number, number])) },
          uLit: { value: Array.from({ length: GROUP_COUNT }, () => 0) },
          uDay: { value: look.day },
        },
      ]),
    }),
  );
  const mesh = new THREE.InstancedMesh(box, mat, pieces.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  pieces.forEach((p, i) => {
    m4.compose(new THREE.Vector3(p.x, p.y + p.h / 2, p.z), q, new THREE.Vector3(p.w, p.h, p.d));
    mesh.setMatrixAt(i, m4);
    aKind[i] = p.kind;
    aGroup[i] = p.group;
  });
  box.setAttribute("aKind", new THREE.InstancedBufferAttribute(aKind, 1));
  box.setAttribute("aGroup", new THREE.InstancedBufferAttribute(aGroup, 1));
  group.add(mesh);

  // ---- glowing parts: wires, devices, checkpoint ----
  const glow = (color: number) =>
    own(new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true }));
  const wireMat = glow(look.wire);
  const deviceMat = glow(look.device);
  const gateMat = glow(look.gate);
  const glowParts: {
    mat: THREE.MeshBasicMaterial;
    group: number;
    base: THREE.Color;
    gain: number;
  }[] = [];
  const glowing = (mat: THREE.MeshBasicMaterial, g: number, gain: number) =>
    glowParts.push({ mat, group: g, base: mat.color.clone(), gain });
  glowing(wireMat, GROUPS.signal, look.day ? 1 : 1.8);
  glowing(deviceMat, GROUPS.router, look.day ? 1 : 1.6);
  glowing(gateMat, GROUPS.gate, look.day ? 0.9 : 1.05);

  const tube = (points: THREE.Vector3[], radius: number, material: THREE.Material) => {
    const curve = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < points.length; i++)
      curve.add(new THREE.LineCurve3(points[i - 1]!, points[i]!));
    const geo = own(new THREE.TubeGeometry(curve, points.length * 8, radius, 6, false));
    const m = new THREE.Mesh(geo, material);
    group.add(m);
    return m;
  };
  const boxAt = (
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    material: THREE.Material,
  ) => {
    const m = new THREE.Mesh(own(new THREE.BoxGeometry(sx, sy, sz)), material);
    m.position.set(x, y + sy / 2, z);
    group.add(m);
    return m;
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(cx + x, y, cz + z);
  const lane = 0.35;
  const f1 = floor + 0.9;
  const riserAt = { x: -halfW + 1.6, z: -halfD + 1.6 };
  const gateZ = halfD - 3.5;
  const gate = V(LANE_X, lane, gateZ);

  // cable riser: three cables up the back corner to a roof antenna (Signal Tower)
  for (const o of [-0.35, 0, 0.35]) {
    tube(
      [V(riserAt.x + o, 0.1, riserAt.z), V(riserAt.x + o, TOWER_H + 6, riserAt.z)],
      0.09,
      wireMat,
    );
  }
  boxAt(cx + riserAt.x, TOWER_H, cz + riserAt.z, 0.3, 12, 0.3, wireMat); // mast
  const ring = new THREE.Mesh(own(new THREE.TorusGeometry(1.6, 0.08, 8, 40)), wireMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(cx + riserAt.x, TOWER_H + 11, cz + riserAt.z);
  group.add(ring);

  // junction room on floor 1 (Router Station): switchboard + three handlers
  // front-right of floor 1, in clear view of the stairwell (the core would hide the back)
  const junction = V(halfW - 2.6, f1, -1);
  boxAt(junction.x, floor, junction.z - 0.9, 2.6, 2.4, 1.2, deviceMat);
  // all on the back half of floor 1 (the front of every floor is cut open)
  const handlerSpots = [V(halfW - 1.6, f1, 3.8), V(2.4, f1, 4.6), V(halfW - 1.6, f1, -5.2)];
  handlerSpots.forEach((h) => boxAt(h.x, floor, h.z, 1.3, 1.1, 1.3, deviceMat));
  // status LEDs on the switchboard
  const ledMat = glow(look.wire);
  glowing(ledMat, GROUPS.router, look.day ? 1 : 2.4);
  for (let i = 0; i < 6; i++) {
    boxAt(junction.x - 0.9 + i * 0.36, floor + 1.6, junction.z - 0.28, 0.16, 0.16, 0.05, ledMat);
  }

  // lobby checkpoint (Gatehouse): posts, lintel, and a scanning curtain
  for (const sx of [-2.4, 2.4]) boxAt(cx + LANE_X + sx, 0, cz + gateZ, 0.45, 4.6, 0.45, gateMat);
  boxAt(cx + LANE_X, 4.6, cz + gateZ, 5.25, 0.45, 0.45, gateMat);
  const curtainMat = own(
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(look.gate),
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: look.day ? THREE.NormalBlending : THREE.AdditiveBlending,
    }),
  );
  const curtain = new THREE.Mesh(own(new THREE.PlaneGeometry(4.4, 4.5)), curtainMat);
  curtain.position.set(cx + LANE_X, 2.3, cz + gateZ);
  group.add(curtain);
  // the entrance: a lit door frame in the facade, visible from the street
  const doorZ = TOWER.d / 2 + 0.06;
  boxAt(cx + LANE_X - 1.8, 0, cz + doorZ, 0.25, 4, 0.12, wireMat);
  boxAt(cx + LANE_X + 1.8, 0, cz + doorZ, 0.25, 4, 0.12, wireMat);
  boxAt(cx + LANE_X, 4, cz + doorZ, 3.85, 0.25, 0.12, wireMat);

  // ceiling cable trays on every finished floor, fanning out from the riser
  for (let lv = 0; lv < TOWER.floors; lv++) {
    const y = (lv + 1) * floor - 1.15;
    tube([V(riserAt.x, y, riserAt.z), V(halfW - 1, y, riserAt.z)], 0.06, wireMat);
    tube([V(riserAt.x, y, riserAt.z), V(riserAt.x, y, halfD - 1)], 0.06, wireMat);
    tube([V(-0.6, y, riserAt.z), V(-0.6, y, halfD - 1)], 0.05, wireMat);
  }
  // blinking status lights on the server racks
  const rackLedMat = glow(look.wire);
  glowing(rackLedMat, GROUPS.signal, look.day ? 1 : 2.6);
  for (const rx of rackXs) {
    for (let i = 0; i < 5; i++) {
      boxAt(
        cx + rx - 0.25 + (i % 2) * 0.5,
        2 * floor + 0.5 + i * 0.55,
        cz + rackZ + 0.62,
        0.22,
        0.08,
        0.04,
        rackLedMat,
      );
    }
  }
  // the vault door (floor 3) and the Citadel's lock (floor 4), dim until they open
  const vaultMat = glow(look.device);
  glowing(vaultMat, GROUPS.build, look.day ? 1 : 1.4);
  const vaultRing = new THREE.Mesh(own(new THREE.TorusGeometry(1.7, 0.16, 10, 44)), vaultMat);
  vaultRing.position.set(cx - 2.6, 3 * floor + 2.1, cz - halfD + 0.3);
  group.add(vaultRing);
  const vaultWheel = new THREE.Mesh(own(new THREE.TorusGeometry(0.6, 0.07, 6, 6)), vaultMat);
  vaultWheel.position.copy(vaultRing.position);
  group.add(vaultWheel);
  const lock = new THREE.Mesh(own(new THREE.TorusGeometry(0.4, 0.08, 8, 24)), vaultMat);
  lock.position.set(cx + 5.8, 4 * floor + 1.9, cz - 3.5);
  group.add(lock);

  // cables along floor 1 from the riser to the junction and on to each handler
  tube([V(riserAt.x, f1, riserAt.z), V(junction.x - cx, f1, riserAt.z), junction], 0.07, wireMat);
  handlerSpots.forEach((h) => tube([junction, V(h.x - cx, f1, junction.z - cz), h], 0.05, wireMat));

  const routes: InteriorRoutes = {
    toGate: [V(LANE_X, lane, halfD + 34), V(LANE_X, lane, halfD + 0.5), gate],
    toJunction: [
      gate,
      // between the core and the stairwell, then along the side wall to the riser
      V(LANE_X, lane, 1.4),
      V(-halfW + 1.6, lane, 1.4),
      V(riserAt.x, lane, riserAt.z + 0.6),
      V(riserAt.x, f1, riserAt.z + 0.6),
      V(junction.x - cx, f1, riserAt.z + 0.6),
      junction,
    ],
    handlers: handlerSpots.map((h) => [
      junction,
      V(h.x - cx, f1, junction.z - cz),
      V(h.x - cx, f1 + 0.6, h.z - cz),
    ]),
    riser: [V(riserAt.x, 0.3, riserAt.z), V(riserAt.x, TOWER_H + 11, riserAt.z)],
  };

  const lit = mat.uniforms.uLit!.value as number[];
  return {
    group,
    routes,
    gate,
    update(elapsed, groupLit) {
      for (let i = 0; i < GROUP_COUNT; i++) lit[i] = groupLit[i] ?? 0;
      for (const p of glowParts) {
        const on = groupLit[p.group] ?? 0;
        p.mat.color.copy(p.base).multiplyScalar((0.18 + 0.82 * on) * p.gain);
        p.mat.opacity = 0.35 + 0.65 * on;
      }
      curtainMat.opacity =
        (0.02 + 0.04 * (0.5 + 0.5 * Math.sin(elapsed * 3))) * (groupLit[GROUPS.gate] ?? 0);
      ring.rotation.z = elapsed * 0.6;
      vaultWheel.rotation.z = elapsed * 0.25;
      rackLedMat.opacity = (0.55 + 0.45 * Math.sin(elapsed * 6)) * (groupLit[GROUPS.signal] ?? 0);
    },
    dispose() {
      disposables.forEach((x) => x.dispose());
    },
  };
}
