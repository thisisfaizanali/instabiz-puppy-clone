// Hand-drawn frame for a puppy sketch card, ported from the reference so every
// puppy gets the same wobbly outline, wash, tilt and doodles there and here.
// Everything is seeded from the slug, so server and client always agree.

type Point = [number, number];

export type Doodle = {
  kind: "sparkle" | "heart" | "dashes" | "swirl" | "dots" | "paw";
  x: number;
  y: number;
  rot: number;
  size: number;
  ink: string;
};

const washColours = ["#f2be6b", "#f9cdbf", "#bfddf5", "#fbe3b4", "#e8c39a"];
const inkColours = ["#c2622b", "#a24a1a", "#2a170e", "#d4893f"];
const doodleKinds: Doodle["kind"][] = ["sparkle", "heart", "dashes", "swirl", "dots", "paw"];

// FNV-1a hash of the slug feeding a mulberry32 generator.
function seeded(slug: string) {
  let h = 0x811c9dc5;
  for (const c of slug) h = Math.imul(h ^ c.charCodeAt(0), 0x1000193);
  let a = h >>> 0;
  return () => {
    let t = (a = (a + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// Points on a wobbly circle around (50, 50), optionally just an arc.
function blob(rand: () => number, radius: number, wobble: number, count = 40, start = 0, sweep = 2 * Math.PI) {
  const phase = [6.28 * rand(), 6.28 * rand(), 6.28 * rand()];
  const squash = 1 + (rand() - 0.5) * 0.05;
  const closed = sweep >= 2 * Math.PI;
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const a = start + (i / (closed ? count : count - 1)) * sweep;
    const r =
      radius +
      wobble * (0.55 * Math.sin(2 * a + phase[0]) + 0.3 * Math.sin(3 * a + phase[1]) + 0.15 * Math.sin(5 * a + phase[2]));
    points.push([50 + Math.cos(a) * r * squash, 50 + (Math.sin(a) * r) / squash]);
  }
  return points;
}

const f = (n: number) => n.toFixed(2);

// Catmull-Rom through the points, written as cubic Beziers.
function smoothPath(points: Point[], closed: boolean) {
  const n = points.length;
  const at = (i: number) => points[closed ? (i + n) % n : Math.min(n - 1, Math.max(0, i))];
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

// The draw order matters: each call consumes the generator exactly as the reference does.
export function sketchFor(slug: string) {
  const rand = seeded(slug);
  const mask = smoothPath(blob(rand, 45.5, 2.6), true);
  const outline = smoothPath(blob(rand, 47.8, 3.1), true);
  const start = rand() * Math.PI * 2;
  const retrace = smoothPath(blob(rand, 49, 3.4, 30, start, Math.PI * (1.15 + 0.5 * rand())), false);
  const wash = {
    d: smoothPath(blob(rand, 46.5, 3.6), true),
    dx: (rand() - 0.5) * 9,
    dy: 3 + 4 * rand(),
    colour: washColours[Math.floor(rand() * washColours.length)],
  };
  const tilt = (rand() - 0.5) * 5;
  // Arcs (in multiples of pi) around the frame where doodles may sit, shuffled.
  const arcs = [
    [0.86, 1.08],
    [1.16, 1.42],
    [-0.08, 0.16],
  ]
    .map((arc) => ({ arc, key: rand() }))
    .sort((a, b) => a.key - b.key)
    .map((s) => s.arc);
  const count = 2 + Math.floor(2 * rand());
  const used = new Set<Doodle["kind"]>();
  const doodles: Doodle[] = [];
  for (let i = 0; i < count; i++) {
    let kind = doodleKinds[Math.floor(rand() * doodleKinds.length)];
    if (used.has(kind)) kind = doodleKinds.find((k) => !used.has(k))!;
    used.add(kind);
    const [from, to] = arcs[i];
    const a = Math.PI * (from + rand() * (to - from));
    const r = 55 + 4 * rand();
    doodles.push({
      kind,
      x: 50 + Math.cos(a) * r,
      y: 50 + Math.sin(a) * r,
      rot: (rand() - 0.5) * 50,
      size: 0.85 + 0.35 * rand(),
      ink: inkColours[Math.floor(rand() * inkColours.length)],
    });
  }
  return { mask, outline, retrace, wash, tilt, doodles };
}

// The photo is clipped to the mask blob through a CSS mask image.
export function maskUrl(d: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
