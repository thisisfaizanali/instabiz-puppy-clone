"use client";

import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { TeddyRig } from "@/lib/teddy-rig";
import { poses, type PoseName } from "@/lib/teddy-shape";
import { hearts, pickTrick, tricks, type Actor, type Beat, type Trick } from "@/lib/teddy-tricks";
import { TeddySvg } from "./teddy-svg";

const now = () => performance.now() / 1000;
const peekTricks: Trick[] = ["peekaboo", "woof", "tilt", "sneeze"];
const snugTricks: Trick[] = ["tilt", "love", "sneeze", "woof"];

// Teddy, alive: he breathes, blinks, wags, now and then tilts his head, follows the mouse with his eyes, does a
// trick when clicked and goes happy-eyed while the mouse rests on him. The server and reduced motion get him
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
    let pointer: { x: number; y: number; t: number } | null = null;
    let lastTrick: Trick | null = null;
    let clicks = 0;
    let clickedAt = 0;
    let playing = false;
    let playUntil = 0;
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
      if (playing !== t < playUntil) {
        playing = !playing;
        el.toggleAttribute("data-playing", playing);
      }
      rig.lookAt(pointer && t - pointer.t < 3 ? pointer : null);
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

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer = { x: e.clientX, y: e.clientY, t: now() };
    };
    // Clicks in quick succession build up to zoomies; a peeking or snug Teddy has his own few tricks.
    const onClick = () => {
      const t = now();
      clicks = t - clickedAt < 0.7 ? clicks + 1 : 1;
      clickedAt = t;
      const pool = pose === "peek" ? peekTricks : pose === "snug" ? snugTricks : null;
      const options = pool?.filter((name) => name !== lastTrick) ?? [];
      const trick = pool ? options[Math.floor(Math.random() * options.length)] : pickTrick(lastTrick, clicks);
      lastTrick = trick;
      rig.reset();
      queue = tricks[trick](actor, t);
      playUntil = queue[queue.length - 1][0] + 0.4;
      idleAt = t;
    };
    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rig.petting(true);
      rig.wag(1);
    };
    const onPointerLeave = () => {
      rig.petting(false);
      rig.wag(0.6);
    };
    addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("click", onClick);
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);

    return () => {
      run(false);
      el.removeAttribute("data-playing");
      io.disconnect();
      removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
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
