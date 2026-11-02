// Teddy, drawn side-on in a 300x240 box from wobbly blobs, and posed by a handful of numbers.

export const W = 300;
export const H = 240;
export const ink = "#2a170e";
export const fur = "#f2be6b";
export const furShade = "#e4a352";
export const cream = "#fbe3b4";
export const collar = "#a24a1a";
export const blush = "#f9b9a6";
export const eyeY = 98;
export const floorY = 228;

// A closed blob around an ellipse: `bumps` soft scallops that bulge out by `wobble`.
function blob(cx: number, cy: number, rx: number, ry: number, bumps: number, wobble: number, start = -Math.PI / 2, deg = 0) {
  const rot = (deg * Math.PI) / 180;
  const at = (a: number, out: number) => {
    const x = Math.cos(a) * (rx + out);
    const y = Math.sin(a) * (ry + (ry / rx) * out);
    return `${(cx + x * Math.cos(rot) - y * Math.sin(rot)).toFixed(1)} ${(cy + x * Math.sin(rot) + y * Math.cos(rot)).toFixed(1)}`;
  };
  let d = "";
  for (let i = 0; i < bumps; i++) {
    const a0 = start + (i / bumps) * Math.PI * 2;
    const a1 = start + ((i + 1) / bumps) * Math.PI * 2;
    d += `${i === 0 ? `M${at(a0, 0)}` : ""}Q${at((a0 + a1) / 2, 2.1 * wobble)} ${at(a1, 0)}`;
  }
  return `${d}Z`;
}

const bodyPivot: [number, number] = [196, 206];
export const headPivot: [number, number] = [212, 100];
const shoulderN: [number, number] = [186, 194];
const shoulderF: [number, number] = [168, 192];
const hipN: [number, number] = [110, 194];
const hipF: [number, number] = [94, 192];
const tailBase: [number, number] = [84, 150];
const earLPivot: [number, number] = [174, 82];
const earRPivot: [number, number] = [250, 82];
export const joints = { shoulderN, shoulderF, hipN, hipF, tailBase };

export const paths = {
  body: blob(140, 170, 64, 36, 15, 3.4, 0.95 * Math.PI),
  chest: blob(192, 166, 30, 32, 9, 3.2, 0.6 * Math.PI),
  tail: blob(70, 126, 17, 16, 9, 3.2),
  tailStem: "M86 152 C80 146 76 140 74 136",
  haunch: blob(110, 204, 30, 24, 10, 3.2, Math.PI),
  haunchPaw: "M112 214 C126 212 142 214 146 221 C148 226 144 229 136 229 L116 229 C108 229 104 224 106 219 Z",
  head: blob(212, 100, 51, 46, 16, 3.6),
  topknot: blob(212, 52, 17, 12, 8, 2.9, Math.PI),
  earL: blob(170, 112, 19, 34, 10, 3.2, -Math.PI / 2, 12),
  earR: blob(254, 112, 19, 34, 10, 3.2, -Math.PI / 2, -12),
  muzzle: "M188 120 C188 106 200 100 212 100 C224 100 236 106 236 120 C236 133 225 140 212 140 C199 140 188 133 188 120 Z",
  nose: "M204.5 111.5 Q212 107.2 219.5 111.5 Q218.2 118.4 212 120 Q205.8 118.4 204.5 111.5 Z",
  mouth: "M212 120 V124.5 M212 124.5 Q207.2 129.6 202.8 125.2 M212 124.5 Q216.8 129.6 221.2 125.2",
  mouthOpen: "M203 126 Q212 122 221 126 Q219 138 212 139 Q205 138 203 126 Z",
  tongue: "M207.6 127.4 Q212 136.6 216.4 127.4 Z",
  collar: "M178 146 Q212 162 246 146 L246 154 Q212 170 178 154 Z",
  tag: "M212 160 C212 156 206 155 206 159.4 C206 163 212 166.6 212 168.4 C212 166.6 218 163 218 159.4 C218 155 212 156 212 160 Z",
  ledgePaws:
    "M175 159 C175 148 181 142 190 142 C199 142 205 148 205 159 Z M219 159 C219 148 225 142 234 142 C243 142 249 148 249 159 Z",
  ledgeToes: "M186 153 v-4.5 M194 153 v-4.5 M230 153 v-4.5 M238 153 v-4.5",
  shadow: { cx: 150, cy: 230, rx: 92, ry: 7 },
};

// A leg hanging from its joint at the origin, `len` long.
function leg(width: number, len: number) {
  const a = width / 2;
  return `M${-a} -14 C${-a} 4 -12 ${len - 18} -12 ${len - 9} C-12 ${len - 2} -7 ${len} 0 ${len} C9 ${len} 13 ${len - 3} 13 ${len - 9} C13 ${len - 18} ${a} 4 ${a} -14`;
}

export const legs = {
  front: leg(24, floorY - shoulderN[1]),
  frontFar: leg(22, floorY - shoulderF[1]),
  back: leg(30, floorY - hipN[1]),
  backFar: leg(28, floorY - hipF[1]),
};

export const toes = (len: number) => `M-3.5 ${len - 7} v5 M4.5 ${len - 7} v5`;

const stand = {
  bodyRot: 0,
  bodyX: 0,
  bodyY: 0,
  stretch: 1,
  headX: 0,
  headY: 0,
  headRot: 0,
  earL: 0,
  earR: 0,
  tail: 0,
  fn: 0,
  ff: 0,
  bn: 0,
  bf: 0,
  sit: 0,
  eyes: 1,
  happy: 0,
  tongue: 0,
  mouth: 0,
  front: 0,
};
export type Pose = typeof stand;

export const poses = {
  stand,
  walk: { ...stand, tail: -6, tongue: 1 },
  sit: { ...stand, bodyRot: -24, bodyY: -2, headX: -10, headY: -6, tail: 34, sit: 1, tongue: 1 },
  peek: { ...stand, headY: 4, earL: -6, earR: 6, tail: -20, front: 1, tongue: 1 },
  snug: { ...stand, headY: 9, headRot: 4, earL: 3, earR: -3, tail: -20, front: 1, tongue: 0 },
  lie: { ...stand, bodyRot: -5, bodyY: 22, headX: 12, headY: 40, headRot: 3, fn: -84, ff: -80, sit: 1, tail: 58, tongue: 0 },
  sleep: { ...stand, bodyRot: -5, bodyY: 22, headX: 14, headY: 44, headRot: -8, fn: -84, ff: -80, sit: 1, tail: 64, eyes: 0, earL: 4, earR: -4 },
  settle: { ...stand, bodyRot: -5, bodyY: 22, headX: 10, headY: 16, fn: -84, ff: -80, sit: 1, tail: 40, tongue: 1 },
  hop: { ...stand, bodyRot: -9, stretch: 1.06, headY: -6, fn: -42, ff: -32, bn: 40, bf: 30, earL: -26, earR: 26, tail: -24, tongue: 1 },
  sniff: { ...stand, bodyRot: 7, headX: 16, headY: 32, headRot: 9, tail: -14, fn: 6, ff: 4 },
  bow: { ...stand, bodyRot: 15, bodyY: 2, headX: 14, headY: 30, fn: -58, ff: -52, tail: -32, happy: 1, tongue: 1 },
  beg: { ...stand, bodyRot: -36, bodyY: -6, headX: -18, headY: -18, sit: 1, fn: -70, ff: -64, tail: 30, happy: 1, tongue: 1 },
} satisfies Record<string, Pose>;
export type PoseName = keyof typeof poses;

const keys = Object.keys(stand) as (keyof Pose)[];

export function mixPose(from: Pose, to: Pose, k: number): Pose {
  const out = { ...from };
  for (const key of keys) out[key] = from[key] + (to[key] - from[key]) * k;
  return out;
}

// What is moving on top of the pose: the walk cycle, the clock, the wag, where the eyes look, the blink and the ears.
export const still = { phase: 0, stride: 0, time: 0, wag: 0, gazeX: 0, gazeY: 0, blink: 0, ear: 0 };
export type Motion = typeof still;

const r2 = (n: number) => Math.round(100 * n) / 100;
const rotate = (deg: number, [x, y]: [number, number]) => `rotate(${r2(deg)} ${x} ${y})`;

// Every attribute the drawing needs for a pose plus the motion on top of it.
export function frameOf(p: Pose, m: Motion = still) {
  const near = Math.sin(m.phase);
  const far = Math.sin(m.phase + Math.PI);
  const swing = 20 + 10 * m.stride;
  const step = (1 - Math.cos(2 * m.phase)) / 2;
  const walking = +(m.stride > 0.01);
  const breath = Math.sin(2.4 * m.time) * (1 - walking);
  const bodyY = p.bodyY - step * (2.5 + 4 * m.stride) * walking + 0.6 * breath;
  const bodyRot = p.bodyRot + 1.6 * Math.sin(m.phase) * walking;
  const upright = -p.bodyRot;
  const wagSize = 5 + 17 * m.wag;
  const wagRate = 1.2 + 2.6 * m.wag;
  const tail = p.tail + Math.sin(m.time * wagRate * Math.PI * 2) * wagSize;
  const nod = (-(1 - Math.cos(2 * m.phase - 0.7)) / 2) * (2 + 3 * m.stride) * walking + 0.9 * breath;
  return {
    body: `translate(${r2(p.bodyX)} ${r2(bodyY)}) ${rotate(bodyRot, bodyPivot)} translate(${bodyPivot[0]} 0) scale(${r2(p.stretch)} 1) translate(${-bodyPivot[0]} 0)`,
    fn: `translate(${shoulderN[0]} ${shoulderN[1]}) rotate(${r2(p.fn + upright + near * swing * walking)})`,
    ff: `translate(${shoulderF[0]} ${shoulderF[1]}) rotate(${r2(p.ff + upright + far * swing * walking)})`,
    bn: `translate(${hipN[0]} ${hipN[1]}) rotate(${r2(p.bn + far * swing * walking)})`,
    bf: `translate(${hipF[0]} ${hipF[1]}) rotate(${r2(p.bf + near * swing * walking)})`,
    tail: rotate(tail, tailBase),
    haunch: `translate(0 ${r2(-(0.06 * p.bodyRot))})`,
    head: `translate(${r2(p.headX)} ${r2(p.headY + nod)}) ${rotate(p.headRot + 1.4 * Math.sin(m.phase) * walking, headPivot)}`,
    earL: rotate(p.earL + m.ear + 4 * Math.sin(2 * m.phase) * walking, earLPivot),
    earR: rotate(p.earR - m.ear - 4 * Math.sin(2 * m.phase) * walking, earRPivot),
    eyes: `translate(${r2(3.4 * m.gazeX)} ${r2(2.6 * m.gazeY)})`,
    blink: `translate(0 ${r2(eyeY * m.blink * 0.92)}) scale(1 ${r2(1 - 0.92 * m.blink)})`,
    openEyes: r2(Math.max(0, p.eyes - p.happy)),
    happyEyes: r2(Math.min(p.happy, p.eyes)),
    shutEyes: r2(1 - p.eyes),
    tongue: r2(p.tongue * (1 - p.mouth)),
    mouth: r2(p.mouth),
    backLegs: r2(1 - p.sit),
    haunchOpacity: r2(p.sit * (1 - p.front)),
    side: r2(1 - p.front),
    ledge: r2(p.front),
    shadow: `translate(${r2(0.6 * p.bodyX)} 0) scale(${r2(1 - 0.05 * step * walking)} 1)`,
    shadowOpacity: r2(0.12 * (1 - p.front)),
  };
}
export type Frame = ReturnType<typeof frameOf>;
