"use client";

import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { TeddyRig } from "@/lib/teddy-rig";
import { poses, type PoseName } from "@/lib/teddy-shape";
import { hearts, tricks, type Actor, type Beat } from "@/lib/teddy-tricks";
import { TeddySvg } from "./teddy-svg";

const now = () => performance.now() / 1000;

// Teddy, alive: he breathes, blinks, wags and now and then tilts his head. The server and reduced motion get him
// still in his resting pose. A resting spot on the home page hands him over to the travelling puppy instead.
export function PupBuddy({
  pose = "sit",
  facing = "right",
  act,
  label,
  className = "",
  style,
  asStop = false,
}: {
  pose?: PoseName;
  facing?: "left" | "right";
  act?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  asStop?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current!;
    const bubble = bubbleRef.current!;
    const dir = facing === "left" ? -1 : 1;
    const rig = new TeddyRig(el.querySelector("svg")!, pose, dir);
    rig.wag(0.6);
    let queue: Beat[] = [];
    let last = now();
    let idleAt = last;
    let sayUntil = 0;
    const actor: Actor = {
      d: rig,
      rest: poses[pose],
      facing: dir,
      say: (text, secs = 1.4) => {
        bubble.textContent = text;
        bubble.dataset.show = "true";
        sayUntil = now() + secs;
      },
      hearts: () => hearts(el, el.clientWidth * (dir > 0 ? 0.7 : 0.3), 0.25 * el.clientHeight),
    };

    const tick = () => {
      const t = now();
      const dt = Math.min(0.05, t - last);
      last = t;
      while (queue.length && queue[0][0] <= t) queue.shift()![1](t);
      if (act === "tilt" && !queue.length) rig.cock(Math.sin(0.9 * t) > 0.35 ? 13 : Math.sin(0.9 * t) < -0.35 ? -10 : 0);
      if (!queue.length && t - idleAt > 9) {
        idleAt = t;
        queue = Math.random() < 0.5 ? tricks.tilt(actor, t) : [[t, () => rig.wag(1)], [t + 2.2, () => rig.wag(0.6)]];
      }
      if (bubble.dataset.show === "true" && t > sayUntil) bubble.dataset.show = "false";
      rig.tick(dt, t);
    };

    // Only animate while on screen, and not at all while the travelling puppy has taken over the resting spots.
    let running = false;
    const run = (on: boolean) => {
      if (asStop && document.documentElement.dataset.pup) on = false;
      if (on === running) return;
      running = on;
      if (on) {
        last = now();
        frame.update(tick, true);
      } else cancelFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    io.observe(el);

    return () => {
      run(false);
      io.disconnect();
    };
  }, [reduced, pose, facing, act, asStop]);

  return (
    <div ref={ref} className={`pup-buddy ${className}`} style={style} data-live={reduced ? undefined : ""} data-facing={facing}>
      {/* Remounted when motion turns on or off, so the rig always starts from a freshly drawn pose. */}
      <TeddySvg key={String(reduced)} pose={pose} facing={facing} label={label} />
      <span ref={bubbleRef} aria-hidden="true" className="pup-bubble" data-show="false" />
    </div>
  );
}
