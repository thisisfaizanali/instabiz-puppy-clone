"use client";

import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { pawPath } from "./paw";

type Print = { x: number; y: number; angle: number; born: number };

// A trail of fading paw prints behind the mouse, left and right paw in turn. Mouse only, never with reduced
// motion; the frame loop only runs while prints are still fading.
export function PawTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const paw = new Path2D(pawPath);
    const prints: Print[] = [];
    let dpr = 1;
    let running = false;
    let lastX = NaN;
    let lastY = NaN;
    let travelled = 0;
    let side = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    };
    resize();
    const draw = () => {
      const t = performance.now();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = prints.length - 1; i >= 0; i--) {
        const p = prints[i];
        const age = t - p.born;
        if (age > 1000) {
          prints.splice(i, 1);
          continue;
        }
        const fade = age < 600 ? 1 : 1 - (age - 600) / 400;
        ctx.globalAlpha = 0.42 * fade * fade;
        ctx.setTransform(0.27 * dpr, 0, 0, 0.27 * dpr, p.x * dpr, p.y * dpr);
        ctx.rotate(p.angle);
        ctx.translate(-32, -34);
        ctx.fillStyle = "#c2622b";
        ctx.fill(paw);
      }
      if (!prints.length) {
        running = false;
        cancelFrame(draw);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (Number.isNaN(lastX)) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      travelled += Math.hypot(dx, dy);
      if (travelled >= 46) {
        travelled = 0;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const offset = 7 * (side = -side);
        prints.push({ x: e.clientX + Math.cos(angle) * offset + 14, y: e.clientY + Math.sin(angle) * offset + 16, angle, born: performance.now() });
        if (prints.length > 14) prints.shift();
        if (!running) {
          running = true;
          frame.render(draw, true);
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };
    addEventListener("pointermove", onPointerMove, { passive: true });
    addEventListener("resize", resize);
    return () => {
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("resize", resize);
      cancelFrame(draw);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] size-full" />;
}
