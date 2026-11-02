"use client";

import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { TeddyRig } from "@/lib/teddy-rig";
import { poses, W, type PoseName } from "@/lib/teddy-shape";
import { hearts, pickTrick, tricks, type Actor, type Beat, type Trick } from "@/lib/teddy-tricks";
import { pawPath } from "./paw";
import { TeddySvg } from "./teddy-svg";

type Point = { x: number; y: number };
type Box = [left: number, top: number, right: number, bottom: number];
type Rect = { left: number; top: number; right: number; bottom: number };
type Track = { kind: "page"; top: number } | { kind: "screen"; top: number } | { kind: "pin"; top: number; from: number; to: number };
type Stop = { x: number; track: Track; s: number; behind: boolean; sink: number; box: Box };
type Meta = { scene: HTMLElement | null; pose: PoseName; facing: number; act: string; looks: HTMLElement[]; track: HTMLElement | null };
type Layout = { lane: boolean; stops: Stop[]; meta: Meta[]; holds: [number, number][]; blend: number; mainTop: number };
type Place = { x: number; y: number; s: number; front: boolean; airborne: boolean; k: number; t: number; walked: number };
type Curve = { p0: Point; c1: Point; c2: Point; p1: Point };

// Teddy's feet in his 300x240 drawing, and the part of the drawing that must stay on screen for each pose.
const feet = { x: 150, y: 228 };
const wholeBox: Box = [48, 30, 288, 236];
const poseBoxes: Partial<Record<PoseName, Box>> = {
  sit: [50, 26, 284, 234],
  peek: [148, 34, 280, 163],
  snug: [148, 40, 280, 163],
  bow: [58, 56, 292, 236],
};
const boxOf = (pose: PoseName) => poseBoxes[pose] ?? wholeBox;
// How far a lane stop sinks below the bar, so only his head and paws peek over it.
const laneSink = feet.y - 159;
// Where on screen (as a share of the safe height) a stop holds still: phones, then wider screens.
const laneBand: [number, number] = [0.6, 0.86];
const wideBand: [number, number] = [0.42, 0.78];
const travelTricks = ["jump", "woof", "love", "sneeze"] as const;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => n * n * (3 - 2 * n);
const step = (lo: number, hi: number, n: number) => (hi === lo ? +(n >= hi) : smooth(clamp01((n - lo) / (hi - lo))));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpBox = (a: Box, b: Box, k: number): Box => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
const softMax = (n: number, lo: number, soft: number) => {
  const s = (n - lo) / soft;
  return s > 20 ? n : lo + soft * Math.log1p(Math.exp(s));
};
const softMin = (n: number, hi: number, soft: number) => -softMax(-n, -hi, soft);
const bezier = ({ p0, c1, c2, p1 }: Curve, t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * c1.x + c * c2.x + d * p1.x, y: a * p0.y + b * c1.y + c * c2.y + d * p1.y };
};
const set = (el: HTMLElement, key: string, value: string) => el.dataset[key] !== value && (el.dataset[key] = value);
const now = () => performance.now() / 1000;
const pick = <T,>(list: readonly T[], not: unknown) => {
  const options = list.filter((x) => x !== not);
  return options[Math.floor(Math.random() * options.length)];
};
const visible = (el: Element) => el.getClientRects().length > 0;

// Where a stop's feet are at a given scroll.
function feetAt(stop: Stop, scroll: number): Point {
  const t = stop.track;
  const top =
    t.kind === "page" ? t.top - scroll : t.kind === "screen" ? t.top : scroll < t.from ? t.top - (scroll - t.from) : scroll > t.to ? t.top - (scroll - t.to) : t.top;
  return { x: stop.x + feet.x * stop.s, y: top + feet.y * stop.s };
}

// Which stop the scroll is at (t = 0) or how far between stop k and the next (0 < t < 1).
function segment(holds: [number, number][], scroll: number) {
  if (!holds.length || scroll <= holds[0][1]) return { k: 0, t: 0 };
  for (let k = 0; k < holds.length - 1; k++) {
    const leave = holds[k][1];
    const arrive = holds[k + 1][0];
    if (scroll < arrive) return { k, t: clamp01((scroll - leave) / Math.max(1, arrive - leave)) };
    if (scroll <= holds[k + 1][1]) return { k: k + 1, t: 0 };
  }
  return { k: holds.length - 1, t: 0 };
}

// Nudges a scaled Teddy at (x, y) so the box of his drawing stays inside the safe area, softly at the edges.
function keepInside(x: number, y: number, s: number, box: Box, safe: Rect, soft = 8): Point {
  const left = (feet.x - box[0]) * s;
  const right = (box[2] - feet.x) * s;
  const up = (feet.y - box[1]) * s;
  const down = (box[3] - feet.y) * s;
  return {
    x: safe.right - safe.left > left + right ? softMin(softMax(x, safe.left + left, soft), safe.right - right, soft) : (safe.left + safe.right) / 2 - (right - left) / 2,
    y: safe.bottom - safe.top > up + down ? softMin(softMax(y, safe.top + up, soft), safe.bottom - down, soft) : safe.bottom - down,
  };
}

// A stop inside a sticky element rides along while it is pinned.
function trackOf(el: HTMLElement, rect: DOMRect): Track {
  let sticky: HTMLElement | null = null;
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement)
    if (getComputedStyle(p).position === "sticky") {
      sticky = p;
      break;
    }
  if (!sticky) return { kind: "page", top: rect.top + scrollY };
  const stickTop = parseFloat(getComputedStyle(sticky).top) || 0;
  const inside = rect.top - sticky.getBoundingClientRect().top;
  const was = sticky.style.position;
  sticky.style.position = "relative";
  const at = sticky.getBoundingClientRect();
  const parent = sticky.parentElement!;
  const end = parent.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(parent).paddingBottom) || 0);
  sticky.style.position = was;
  const from = at.top + scrollY - stickTop;
  const to = end + scrollY - at.height - stickTop;
  return to <= from ? { kind: "page", top: at.top + scrollY + inside } : { kind: "pin", top: stickTop + inside, from, to };
}

// The scroll range over which a stop sits inside the band of the screen.
function holdRange(stop: Stop, safe: Rect, band: [number, number]): [number, number] {
  if (stop.track.kind === "pin") return [stop.track.from, stop.track.to];
  const top = stop.track.top;
  const head = top + stop.box[1] * stop.s;
  const toe = top + stop.box[3] * stop.s;
  const mid = (head + toe) / 2;
  const h = safe.bottom - safe.top;
  let from = mid - (safe.top + band[1] * h);
  let to = mid - (safe.top + band[0] * h);
  from = Math.max(from, toe - safe.bottom);
  to = Math.min(to, head - safe.top);
  if (from > to) from = to = mid - (safe.top + h / 2);
  return [from, to];
}

// Shrinks neighbouring holds until each walk between stops gets at least its gap of scrolling.
function spaceHolds(ranges: [number, number][], gaps: number[], maxScroll: number) {
  const holds = ranges.map(([a, b]): [number, number] => (a <= b ? [a, b] : [(a + b) / 2, (a + b) / 2]));
  if (!holds.length) return holds;
  holds[0][0] = -Infinity;
  const last = holds[holds.length - 1];
  last[1] = Infinity;
  last[0] = Math.min(last[0], maxScroll - 1);
  for (let i = 0; i < holds.length - 1; i++) {
    const a = holds[i];
    const b = holds[i + 1];
    if (b[0] < a[1]) {
      const mid = (a[1] + b[0]) / 2;
      a[1] = Math.max(a[0], mid);
      b[0] = Math.min(b[1], mid);
      if (b[0] < a[1]) b[0] = a[1];
    }
    let short = (gaps[i] ?? 0) - (b[0] - a[1]);
    if (short > 0) {
      const fromA = Math.min(short / 2, a[1] - a[0]);
      const fromB = Math.min(short / 2, b[1] - b[0]);
      a[1] -= fromA;
      b[0] += fromB;
      short -= fromA + fromB;
      const more = Math.min(short, b[1] - b[0]);
      b[0] += more;
      short -= more;
      if (short > 0) a[1] -= Math.min(short, a[1] - a[0]);
    }
  }
  for (const h of holds) if (h[1] < h[0]) h[1] = h[0];
  return holds;
}

function barTop() {
  const bar = document.querySelector("[data-whatsapp-bar]");
  const rect = bar?.getClientRects().length ? bar.getBoundingClientRect() : null;
  return rect && rect.height ? rect.top : innerHeight - 6;
}

function measure(probe: HTMLElement): Layout {
  const lane = matchMedia("(max-width: 767px), (pointer: coarse) and (max-height: 519px)").matches;
  const vw = document.documentElement.clientWidth;
  const vh = probe.getBoundingClientRect().height || innerHeight;
  const header = document.getElementById("site-header")?.offsetHeight ?? 76;
  const bar = document.querySelector("[data-whatsapp-bar]");
  const safe = { left: 10, top: header + 10, right: vw - 10, bottom: vh - 10 - (bar?.getClientRects().length ? bar.getBoundingClientRect().height : 0) };
  const main = document.getElementById("main");
  const stops: Stop[] = [];
  const meta: Meta[] = [];
  const ranges: [number, number][] = [];

  const add = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const pose = (el.dataset.pose || "sit") as PoseName;
    const act = el.dataset.act ?? "";
    const drawn = rect.width / W;
    const s = act === "basket" || lane ? drawn : 1.12 * drawn;
    const anchor = pose === "peek" ? { x: feet.x, y: 159 } : feet;
    const track = trackOf(el, rect);
    if (track.kind !== "screen") track.top += anchor.y * (drawn - s);
    const stop: Stop = { x: rect.left + anchor.x * (drawn - s), track, s, behind: el.dataset.behind === "true", sink: 0, box: boxOf(pose) };
    const scene = el.closest<HTMLElement>("[data-pup-scene]");
    stops.push(stop);
    meta.push({
      scene,
      pose,
      facing: el.dataset.facing === "left" ? -1 : 1,
      act,
      looks: scene ? [...scene.querySelectorAll<HTMLElement>("[data-pup-look]")] : [],
      track: act === "treadmill" ? (scene?.querySelector<HTMLElement>("[data-treadmill]") ?? null) : null,
    });
    let range = holdRange(stop, safe, lane ? laneBand : wideBand);
    // On wide screens a stop lets go before its scene's top has scrolled far past, so he arrives with the scene.
    if (!lane && scene && stop.track.kind === "page" && act !== "basket" && act !== "peekaboo") {
      const h = safe.bottom - safe.top;
      const sceneIn = scene.getBoundingClientRect().top + scrollY - safe.top + 0.08 * h;
      const toeIn = stop.track.top + stop.box[3] * stop.s - safe.bottom;
      if (range[1] > sceneIn) {
        const to = Math.max(sceneIn, toeIn + 0.12 * h);
        range = [Math.max(toeIn, to - Math.max(range[1] - range[0], 0.2 * h)), to];
      }
    }
    ranges.push(range);
  };

  const spots = [...document.querySelectorAll<HTMLElement>("[data-pup-stop]")].filter(visible);
  if (lane) {
    // Phones: from the hero he runs along the bottom bar, peeking up from alternate sides at every scene.
    const lanes = spots.filter((el) => el.dataset.lane === "true");
    const first = lanes[0];
    const end = lanes.length > 1 ? lanes[lanes.length - 1] : undefined;
    if (first) add(first);
    const skip = meta[0]?.scene ?? null;
    const scenes = [...document.querySelectorAll<HTMLElement>("#main [data-pup-scene]")].filter((el) => el !== skip && visible(el));
    const s = Math.min(0.62, Math.max(0.5, vw / 650));
    const box = boxOf("peek");
    scenes.forEach((scene, i) => {
      const left = i % 2 === 0;
      stops.push({ x: left ? safe.left + 2 - box[0] * s : safe.right - 2 - box[2] * s, track: { kind: "screen", top: 0 }, s, behind: false, sink: laneSink, box });
      meta.push({ scene, pose: "peek", facing: left ? 1 : -1, act: "lane", looks: [], track: null });
      const r = scene.getBoundingClientRect();
      const from = r.top + scrollY - 0.42 * vh;
      const to = r.bottom + scrollY - 0.58 * vh;
      ranges.push(from <= to ? [from, to] : [(from + to) / 2, (from + to) / 2]);
    });
    if (end) add(end);
  } else spots.forEach(add);

  const gaps = stops.slice(1).map((b, i) => {
    const a = stops[i];
    const rise = (wideBand[1] - wideBand[0]) * vh;
    const least = (lane ? 0.32 : 0.5) * vh;
    return Math.min(1.4 * vh, Math.max(least, 1.15 * Math.hypot(Math.abs(b.x + feet.x * b.s - (a.x + feet.x * a.s)), rise)));
  });
  return {
    lane,
    stops,
    meta,
    holds: spaceHolds(ranges, gaps, document.documentElement.scrollHeight - innerHeight),
    blend: 0.12 * vh,
    mainTop: main ? main.getBoundingClientRect().top + scrollY : 0,
  };
}

// The arc from one stop to the next, bowed out sideways when the two stops sit almost on top of each other.
function arc(from: Point, to: Point, safe: Rect): Curve {
  const dx = to.x - from.x;
  const width = safe.right - safe.left;
  const reach = Math.max(0.45 * Math.abs(dx), 0);
  const dir = dx >= 0 ? 1 : -1;
  let c1 = { x: from.x + dir * reach, y: from.y };
  let c2 = { x: to.x - dir * reach, y: to.y };
  const least = 0.14 * width;
  if (Math.abs(dx) < least) {
    const bow = ((from.x + to.x) / 2 < (safe.left + safe.right) / 2 ? 1 : -1) * (least - Math.abs(dx)) * 0.9;
    c1 = { x: c1.x + bow, y: lerp(from.y, to.y, 0.2) };
    c2 = { x: c2.x + bow, y: lerp(from.y, to.y, 0.8) };
  }
  const inside = (p: Point) => ({ x: Math.min(safe.right, Math.max(safe.left, p.x)), y: Math.min(safe.bottom, Math.max(safe.top, p.y)) });
  return { p0: from, c1: inside(c1), c2: inside(c2), p1: to };
}

function arcLength(curve: Curve, upTo: number) {
  let length = 0;
  let prev = curve.p0;
  const n = Math.max(1, Math.ceil(32 * clamp01(upTo)));
  for (let i = 1; i <= n; i++) {
    const p = bezier(curve, (i / n) * clamp01(upTo));
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return length;
}

// Where Teddy is at a given scroll: holding at a stop, or partway along the arc to the next one.
function placeAt(stops: Stop[], holds: [number, number][], scroll: number, safe: Rect, blend: number): Place {
  const { k, t } = segment(holds, scroll);
  if (t <= 0 || k >= stops.length - 1) {
    const stop = stops[k];
    const at = feetAt(stop, scroll);
    const p = keepInside(at.x, at.y, stop.s, stop.box, safe);
    return { x: p.x, y: p.y, s: stop.s, front: !stop.behind, airborne: false, k, t: 0, walked: 0 };
  }
  const a = stops[k];
  const b = stops[k + 1];
  const leave = holds[k][1];
  const arrive = holds[k + 1][0];
  const span = Math.max(1, arrive - leave);
  const v = clamp01((scroll - leave) / span);
  const start = feetAt(a, leave);
  const end = feetAt(b, arrive);
  const curve = arc({ x: start.x, y: start.y - a.sink * a.s }, { x: end.x, y: end.y - b.sink * b.s }, safe);
  const w = v * v * v * (v * (6 * v - 15) + 10);
  const p = bezier(curve, w);
  const s = lerp(a.s, b.s, smooth(clamp01(v / 0.65)));
  // Near each end, follow the stop as it scrolls so leaving and arriving do not jump.
  const edge = Math.min(0.3, Math.max(0.06, blend / span));
  const stillA = 1 - step(0, edge, v);
  const stillB = step(1 - edge, 1, v);
  let y = p.y + stillA * (feetAt(a, scroll).y - start.y) + stillB * (feetAt(b, scroll).y - end.y);
  y += a.sink * a.s * (1 - step(0, 0.22, v)) + b.sink * b.s * step(0.78, 1, v);
  let airborne = false;
  // Hop out from behind something, and hop back in.
  if (a.behind && v < 0.36) {
    y -= Math.sin((v / 0.36) * Math.PI) * Math.min(64 * a.s, 72);
    airborne = v < 0.32;
  }
  if (b.behind && v > 0.68) {
    y -= Math.sin(((v - 0.68) / 0.32) * Math.PI) * Math.min(56 * b.s, 60);
    airborne = true;
  }
  if (a.sink && v < 0.2) airborne = true;
  const front = !((a.behind && v < 0.12) || (b.behind && v > 0.92));
  const box =
    v < 0.5
      ? lerpBox(a.box, wholeBox, step(0, a.sink ? 0.22 : a.behind ? 0.36 : 0.06, v))
      : lerpBox(wholeBox, b.box, step(b.sink ? 0.78 : b.behind ? 0.68 : 0.94, 1, v));
  const kept = keepInside(p.x, y, s, box, safe);
  return { x: kept.x, y: kept.y, s, front, airborne, k, t: v, walked: arcLength(curve, w) };
}

// Once the scroll rests partway into a hop, finish or undo the hop rather than hang in mid air.
function settle(stops: Stop[], holds: [number, number][], scroll: number) {
  const { k, t } = segment(holds, scroll);
  if (t <= 0 || k >= stops.length - 1) return scroll;
  const a = stops[k];
  const b = stops[k + 1];
  const out = a.sink ? 0.22 : 0.36 * +a.behind;
  const back = b.sink ? 0.78 : b.behind ? 0.68 : 1;
  let v = t;
  if (t < out) v = t < out / 2 ? 0 : out;
  else if (t > back) v = t > (1 + back) / 2 ? 1 : back;
  return v === t ? scroll : holds[k][1] + v * (holds[k + 1][0] - holds[k][1]);
}

function safeArea(layout: Layout): Rect {
  const vw = document.documentElement.clientWidth;
  const top = (document.getElementById("site-header")?.offsetHeight ?? 76) + 10;
  if (layout.lane) return { left: 10, top, right: vw - 10, bottom: barTop() + 40 };
  const bar = document.querySelector("[data-whatsapp-bar]");
  const bottom = bar?.getClientRects().length ? bar.getBoundingClientRect().top : innerHeight;
  return { left: 10, top, right: vw - 10, bottom: Math.min(innerHeight, bottom) - 10 };
}

function where(layout: Layout, scroll: number) {
  if (layout.lane) {
    const top = barTop();
    for (const stop of layout.stops) if (stop.track.kind === "screen") stop.track.top = top - 159 * stop.s;
  }
  return placeAt(layout.stops, layout.holds, scroll, safeArea(layout), layout.blend);
}

export type PupCue = { look?: Element; secs?: number; say?: string };

// Asks the travelling puppy, if he is resting in the scene that holds `look`, to glance at it and maybe say something.
export function cuePup(cue: PupCue) {
  dispatchEvent(new CustomEvent("pup:cue", { detail: cue }));
}

let teardown: (() => void) | null = null;

// On the home page Teddy leaves his resting spots and travels between them as the page scrolls, walking,
// hopping out from behind the quilt, leaving paw prints and reacting to the scenes he reaches. Phones get a
// shorter lane along the bottom bar. Nothing of this runs with reduced motion, or with fewer than two spots.
export function PupJourney() {
  const layerRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const bubbleAtRef = useRef<HTMLSpanElement>(null);
  const printsRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    teardown?.();
    const layer = layerRef.current!;
    const actorEl = actorRef.current!;
    const body = bodyRef.current!;
    const bubble = bubbleRef.current!;
    const bubbleAt = bubbleAtRef.current!;
    const probe = probeRef.current!;
    const svg = body.querySelector("svg")!;
    const root = document.documentElement;
    const prints = [...printsRef.current!.children] as HTMLElement[];
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let layout: Layout | null = null;
    let rig: TeddyRig | null = null;
    let live = false;
    let nextPrint = 0;
    let sayUntil = 0;
    let pointer: (Point & { t: number }) | null = null;
    let look: { el: Element; until: number } | null = null;
    let last = now();
    let lastScroll = scrollY;
    let prev: Point | null = null;
    let shown: Place | null = null;
    const drift = { x: 0, y: 0, s: 0 };
    let stillFor = 0;
    let at = -1;
    let arrivedAt = 0;
    let quietSince = 0;
    let queue: Beat[] = [];
    let lookedAt = 0;
    let lookIndex = -1;
    let treadmillX: number | null = null;
    let treadmillIdle = 0;
    let printSeg = -1;
    let printStep = 0;
    let basketAt = 0;
    let scrolledAt = now();
    let scrollDir = 1;
    let settling = false;
    let chase: Point | null = null;
    let barWas = 0;
    let laneWalked = 0;
    let layerTop = 0;

    const say = (text: string, t: number, secs = 1.4) => {
      bubble.textContent = text;
      bubble.dataset.show = "true";
      sayUntil = t + secs;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer = { x: e.clientX, y: e.clientY, t: now() };
    };
    const onCue = (e: Event) => {
      const cue = (e as CustomEvent<PupCue>).detail;
      const scene = at >= 0 ? layout?.meta[at]?.scene : null;
      if (!scene || (cue.look && !scene.contains(cue.look))) return;
      const t = now();
      if (cue.look) look = { el: cue.look, until: t + (cue.secs ?? 1.6) };
      if (cue.say) say(cue.say, t);
    };
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target;
      if (el instanceof HTMLElement && el.matches("a, button, input, textarea, select, summary")) look = { el, until: now() + 1.4 };
    };
    const actorFor = (m: Meta): Actor => ({
      d: rig!,
      rest: poses[m.pose],
      facing: m.facing,
      say: (text, secs) => say(text, now(), secs),
      hearts: () =>
        shown &&
        hearts(layer, shown.x - feet.x * shown.s + (rig!.facingDir > 0 ? 212 : W - 212) * shown.s, shown.y - (feet.y - 40) * shown.s - layerTop),
    });

    const tick = () => {
      if (!layout || !rig) return;
      const t = now();
      const dt = Math.min(0.05, t - last);
      last = t;
      const scroll = scrollY;
      const scrolled = scroll - lastScroll;
      lastScroll = scroll;
      if (Math.abs(scrolled) > 0.5) {
        scrolledAt = t;
        scrollDir = scrolled > 0 ? 1 : -1;
      }
      const d = rig;
      while (queue.length && queue[0][0] <= t) queue.shift()![1](t);
      const target = t - scrolledAt > 0.25 ? settle(layout.stops, layout.holds, scroll) : scroll;
      const v = where(layout, target);
      const from = layout.stops[v.k];
      const to = v.t > 0 ? layout.stops[v.k + 1] : from;
      const onBar = layout.lane && from.track.kind === "screen" && to?.track.kind === "screen";
      const fade = Math.exp(-dt / 0.28);
      drift.x *= fade;
      drift.y *= fade;
      drift.s *= fade;
      if (Math.abs(drift.x) < 0.05 && Math.abs(drift.y) < 0.05) drift.x = drift.y = 0;
      const isSettling = target !== scroll;
      if (isSettling !== settling && prev && !onBar) {
        drift.x = prev.x - v.x;
        drift.y = prev.y - v.y;
      }
      settling = isSettling;
      const s = v.s + drift.s;
      let x = v.x + drift.x;
      let y = v.y + drift.y;
      const bar = layout.lane ? barTop() : 0;
      let caughtUp = true;
      if (onBar) {
        // Along the bar he runs after his spot rather than teleporting with the scroll.
        chase ??= prev ? { x: prev.x, y: prev.y - barWas } : { x, y: y - bar };
        const k = 1 - Math.exp(-dt / 0.14);
        chase.x += (x - chase.x) * k;
        chase.y += (y - bar - chase.y) * k;
        caughtUp = Math.hypot(x - chase.x, y - bar - chase.y) < 1.5;
        x = chase.x;
        y = bar + chase.y;
      } else if (chase) {
        drift.x = (prev?.x ?? x) - v.x;
        drift.y = (prev?.y ?? y) - v.y;
        x = v.x + drift.x;
        y = v.y + drift.y;
        chase = null;
      }
      barWas = bar;
      shown = { ...v, x, y, s };
      set(layer, "anchor", onBar ? "bottom" : "top");
      layerTop = onBar ? layer.getBoundingClientRect().top : 0;
      const holding = v.t === 0 && caughtUp;
      const k = v.k;

      if (holding) {
        if (at !== k) {
          const m = layout.meta[k];
          queue = [];
          look = null;
          at = k;
          arrivedAt = t;
          quietSince = t;
          treadmillX = null;
          d.reset();
          d.setPose(m.pose);
          d.face(m.facing, 0.14);
          d.stride(0);
          d.wag(m.act === "basket" ? 0.3 : 0.7);
          d.jolt(0.4);
          basketAt = t + 2.4;
        }
        const m = layout.meta[k];
        if (m.track && !queue.length) {
          // On the treadmill he walks on the spot while the doors move, and stands when they stop.
          const left = m.track.getBoundingClientRect().left;
          const moved = treadmillX === null ? 0 : left - treadmillX;
          treadmillX = left;
          d.walkedTo(-left / s);
          if (Math.abs(moved) > 0.15) {
            treadmillIdle = 0;
            d.setPose("walk");
            d.stride(1);
            d.face(moved < 0 ? 1 : -1, 0.16);
          } else if ((treadmillIdle += dt) > 0.25) {
            d.setPose("stand");
            d.stride(0);
          }
        }
        if (m.act === "tilt" && !queue.length && t - arrivedAt > 1.2) d.cock(Math.sin(0.9 * t) > 0.35 ? 13 : Math.sin(0.9 * t) < -0.35 ? -10 : 0);
        if (m.act === "basket" && !queue.length && t > basketAt) {
          basketAt = t + 4.5 + 3 * Math.random();
          if (Math.random() < 0.7) d.jolt(0.55);
          else d.yawn(t, 0.7);
        }
        const busy = (look && look.until > t) || (pointer && t - pointer.t < 2.5);
        if (m.looks.length && !busy && t - arrivedAt > 0.8 && t - lookedAt > 1.7) {
          lookedAt = t;
          lookIndex = (lookIndex + 1) % (m.looks.length + 1);
          if (lookIndex < m.looks.length) look = { el: m.looks[lookIndex], until: t + 1.4 };
        }
        if (Math.abs(scrolled) > 0.5) quietSince = t;
        if (!queue.length && !m.track && m.act !== "basket" && t - quietSince > 9) {
          quietSince = t;
          queue = Math.random() < 0.55 ? tricks.tilt(actorFor(m), t) : [[t, () => d.wag(1)], [t + 2.4, () => d.wag(0.7)]];
        }
      } else {
        if (at !== -1) {
          at = -1;
          queue = [];
          d.reset();
        }
        const moved = prev ? Math.hypot(x - prev.x, y - prev.y) : 0;
        stillFor = moved > 0.25 ? 0 : stillFor + dt;
        let airborne = v.airborne;
        if (layout.lane && v.t > 0) {
          const a = layout.stops[k];
          const b = layout.stops[k + 1];
          if (a.sink && v.t < 0.22) airborne = scrollDir > 0;
          else if (b?.sink && v.t > 0.78) airborne = scrollDir < 0;
        }
        if (airborne) {
          d.setPose("hop");
          d.stride(0);
        } else if (stillFor > 0.3) {
          d.setPose("stand");
          d.stride(0);
          if (stillFor > 2.6 && stillFor - dt <= 2.6) say("coming?", t);
        } else {
          d.setPose("walk");
          d.stride(1);
        }
        d.walkedTo((onBar ? (laneWalked += moved) : v.walked) / Math.max(0.05, s));
        if (prev) {
          const dx = x - prev.x;
          if (Math.abs(dx) > 0.6 && Math.abs(dx) > 0.35 * Math.abs(y - prev.y)) d.face(dx > 0 ? 1 : -1, 0.16);
        }
        if (!layout.lane) {
          // A print every 34 drawn pixels walked, alternating front and back paw.
          const n = Math.floor(v.walked / (34 * s));
          if (printSeg === k && n !== printStep && !v.airborne && prev) {
            const back = n & 1;
            const paw = back ? 186 : 110;
            const px = x - feet.x * s + (d.facingDir > 0 ? paw : W - paw) * s;
            const py = y - feet.y * s + 226 * s + scroll - layout.mainTop + (back ? -4 : 4) * s;
            const angle = Math.atan2(y - prev.y + scrolled, x - prev.x) + Math.PI / 2;
            const size = 14 * Math.max(0.75, 1.5 * s);
            const print = prints[nextPrint++ % prints.length];
            print.style.transform = `translate(${(px - size / 2).toFixed(1)}px, ${(py - size / 2).toFixed(1)}px) rotate(${angle.toFixed(3)}rad)`;
            print.style.width = print.style.height = `${size.toFixed(1)}px`;
            print.animate([{ opacity: 0 }, { opacity: 0.45, offset: 0.08 }, { opacity: 0.45, offset: 0.5 }, { opacity: 0 }], { duration: 2600, easing: "ease-out" });
          }
          printSeg = k;
          printStep = n;
        }
      }
      prev = { x, y };
      layout.meta.forEach((m, i) => {
        if (!m.scene) return;
        set(m.scene, "here", String(holding && i === k));
        set(m.scene, "visited", String(i <= k || (i === k + 1 && v.t > 0.92)));
      });
      if (look && look.until > t) {
        const r = look.el.getBoundingClientRect();
        d.lookAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      } else d.lookAt(pointer && t - pointer.t < 2.5 ? pointer : null);
      actorEl.style.transform = `translate3d(${(x - feet.x * s).toFixed(2)}px, ${(y - feet.y * s - layerTop).toFixed(2)}px, 0)`;
      body.style.transform = `scale(${s.toFixed(4)})`;
      set(layer, "front", String(v.front));
      set(actorEl, "holding", String(holding));
      if (bubble.dataset.show === "true") {
        if (t > sayUntil) bubble.dataset.show = "false";
        const bx = (d.facingDir > 0 ? 214 : W - 214) * s;
        bubbleAt.style.transform = `translate(${bx.toFixed(1)}px, ${(30 * s).toFixed(1)}px)`;
      }
      d.tick(dt, t);
    };

    let clicks = 0;
    let clickedAt = 0;
    let lastTrick: string | null = null;
    const onClick = () => {
      if (!rig || !layout) return;
      const d = rig;
      const t = now();
      clicks = t - clickedAt < 0.7 ? clicks + 1 : 1;
      clickedAt = t;
      quietSince = t;
      if (at < 0) {
        // Mid-walk he only has a few quick tricks.
        const actor = actorFor(layout.meta[Math.max(0, shown?.k ?? 0)]);
        const trick = pick(travelTricks, lastTrick);
        lastTrick = trick;
        queue =
          trick === "jump"
            ? [[t, () => (d.hop(1.35), actor.say(pick(["wheee!", "boing!", "yip!"], null)))], [t + 0.5, () => d.hop(0.7)]]
            : trick === "woof"
              ? [[t, (n) => (d.woof(n), actor.say("woof!"))], [t + 0.4, (n) => d.woof(n)]]
              : trick === "love"
                ? [[t, () => (d.wag(1), d.hop(0.5), actor.hearts(), actor.say("I like you!"))]]
                : [[t, (n) => (d.jolt(1.4), d.hop(0.4), d.yawn(n, 0.22), actor.say("achoo!"))]];
        return;
      }
      const m = layout.meta[at];
      let trick: Trick;
      if (m.track) trick = pick(["woof", "hop", "love"] as const, lastTrick);
      else if (m.act === "basket") trick = pick(["tilt", "love", "sneeze", "woof"] as const, lastTrick);
      else if (m.pose === "peek") trick = pick(["peekaboo", "woof", "tilt", "sneeze"] as const, lastTrick);
      else {
        trick = pickTrick(lastTrick as Trick | null, clicks);
        // No room to run back and forth at a resting spot.
        if (trick === "zoomies") trick = "spin";
      }
      if (trick === "peekaboo" && queue.length) return;
      lastTrick = trick;
      d.reset();
      queue = tricks[trick](actorFor(m), t);
    };
    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !rig || at < 0) return;
      rig.petting(true);
      rig.wag(1);
    };
    const onPointerLeave = () => {
      if (!rig) return;
      rig.petting(false);
      if (at >= 0) rig.wag(layout?.meta[at]?.act === "basket" ? 0.3 : 0.7);
    };

    const start = () => {
      if (live || prefersReducedMotion()) return;
      const next = measure(probe);
      if (next.stops.length < 2) return;
      layout = next;
      live = true;
      root.dataset.pup = next.lane ? "lane" : "live";
      layer.hidden = false;
      const first = next.meta[0];
      rig = new TeddyRig(svg, first.pose, first.facing);
      lastScroll = scrollY;
      prev = null;
      scrolledAt = last = now();
      settling = false;
      chase = null;
      const t = last;
      const v = where(next, scrollY);
      if (v.k === 0 && v.t === 0 && first.act === "peekaboo") {
        // Arriving on the hero: duck under the quilt, pop up with a peekaboo and glance along the line of pups.
        at = 0;
        arrivedAt = t;
        const ducked = { ...poses.peek, headY: 120 };
        const friends = first.scene?.querySelectorAll("[data-pup-friend]") ?? [];
        const a = friends[0];
        const b = friends[friends.length - 1];
        const d = rig;
        queue = [
          [t + 0.1, () => d.setPose(ducked)],
          [t + 0.7, (n) => (d.setPose("peek"), d.jolt(1.2), say("peekaboo!", n, 1.6))],
          [t + 1.5, (n) => a && (look = { el: a, until: n + 0.8 })],
          [t + 2.3, (n) => b && (look = { el: b, until: n + 0.8 })],
          [t + 3.1, () => ((look = null), d.wag(1))],
        ];
      } else at = -1;
      addEventListener("pointermove", onPointerMove, { passive: true });
      addEventListener("pup:cue", onCue);
      addEventListener("focusin", onFocusIn);
      actorEl.addEventListener("click", onClick);
      actorEl.addEventListener("pointerenter", onPointerEnter);
      actorEl.addEventListener("pointerleave", onPointerLeave);
      frame.update(tick, true);
    };
    const stop = () => {
      if (!live) return;
      live = false;
      cancelFrame(tick);
      delete root.dataset.pup;
      layer.hidden = true;
      delete layer.dataset.anchor;
      layerTop = 0;
      layout?.meta.forEach((m) => {
        if (!m.scene) return;
        delete m.scene.dataset.here;
        delete m.scene.dataset.visited;
      });
      layout = null;
      rig = null;
      at = -1;
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pup:cue", onCue);
      removeEventListener("focusin", onFocusIn);
      actorEl.removeEventListener("click", onClick);
      actorEl.removeEventListener("pointerenter", onPointerEnter);
      actorEl.removeEventListener("pointerleave", onPointerLeave);
    };
    // Re-measure after layout changes, carrying his current spot over so he glides instead of jumping.
    const remeasure = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!live || !layout) return;
        const next = measure(probe);
        if (next.stops.length < 2) return stop();
        const was = shown;
        const laneChanged = next.lane !== layout.lane;
        layout = next;
        root.dataset.pup = next.lane ? "lane" : "live";
        if (laneChanged) at = -1;
        if (was) {
          const v = where(next, scrollY);
          drift.x = was.x - v.x;
          drift.y = was.y - v.y;
          drift.s = was.s - v.s;
        }
      }, 120);
    };
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    addEventListener("resize", remeasure);
    addEventListener("load", remeasure);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => (prefersReducedMotion() ? stop() : start());
    motion.addEventListener("change", onMotion);
    start();
    document.fonts?.ready.then(remeasure);

    const cleanup = () => {
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      removeEventListener("resize", remeasure);
      removeEventListener("load", remeasure);
      motion.removeEventListener("change", onMotion);
      if (teardown === cleanup) teardown = null;
    };
    teardown = cleanup;
    return cleanup;
  }, []);

  return (
    <>
      <div ref={probeRef} aria-hidden="true" className="pup-probe" />
      <div ref={printsRef} aria-hidden="true" className="pup-prints">
        {Array.from({ length: 24 }, (_, i) => (
          <svg key={i} viewBox="0 0 64 64">
            <path d={pawPath} />
          </svg>
        ))}
      </div>
      <div ref={layerRef} aria-hidden="true" className="pup-layer" hidden data-front="true">
        <div ref={actorRef} className="pup-actor">
          <div ref={bodyRef} className="pup-actor__body">
            <TeddySvg pose="peek" />
          </div>
          <span ref={bubbleAtRef} className="pup-bubble-at">
            <span ref={bubbleRef} className="pup-bubble" data-show="false" />
          </span>
        </div>
      </div>
    </>
  );
}
