"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";

// Where reduced motion parks the plane, part way along the route.
const parked = 0.62;

// Puts the plane on the route at `t` (0 to 1) with its nose along the direction of travel,
// fading it in over the first stretch.
function place(route: SVGPathElement | null, plane: SVGGElement | null, t: number) {
  if (!route || !plane) return;
  const length = route.getTotalLength();
  const at = Math.min(length, Math.max(0, t * length));
  const point = route.getPointAtLength(at);
  const ahead = route.getPointAtLength(Math.min(length, at + 1));
  const behind = route.getPointAtLength(Math.max(0, at - 1));
  const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
  plane.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${angle.toFixed(1)})`);
  plane.style.opacity = String(Math.min(1, Math.max(0, (t - 0.11) / 0.06)));
}

// The Korea to Dubai route with the plane flying along it as you scroll past, optionally with a puppy in the porthole.
// Without JS or with reduced motion it sits part way along.
export function Flight({ label, photo }: { label: string; photo?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: box, offset: ["start 95%", "end 25%"] });

  useMotionValueEvent(scrollYProgress, "change", (t) => {
    if (!reduced) place(route.current, plane.current, t);
  });
  useEffect(() => place(route.current, plane.current, reduced ? parked : scrollYProgress.get()), [reduced, scrollYProgress]);

  return (
    <div ref={box} className="tp-flight">
      <svg viewBox="0 0 660 300" role="img" aria-label={label}>
        {photo && (
          <defs>
            <clipPath id="tp-flight-porthole">
              <circle r="25" />
            </clipPath>
          </defs>
        )}
        <path ref={route} d="M40 250 C 170 40, 470 20, 620 168" className="tp-flight__route" />
        <circle cx="40" cy="250" r="7" className="tp-flight__dot" />
        <circle cx="620" cy="168" r="7" className="tp-flight__dot" />
        <text x="40" y="284" textAnchor="middle" className="tp-flight__label">
          Korea
        </text>
        <text x="620" y="202" textAnchor="middle" className="tp-flight__label">
          Dubai
        </text>
        <g ref={plane} transform="translate(410 70)">
          <g transform="translate(-126 -78)">
            <path d="M28 60 L8 26 L34 26 L60 54 Z" className="tp-flight__wing" />
            <path d="M108 112 L142 156 L172 156 L158 112 Z" className="tp-flight__wing tp-flight__wing--far" />
            <path
              d="M20 80 C20 52 52 44 80 44 L168 44 C200 44 224 60 232 80 C224 100 200 112 168 112 L80 112 C52 112 20 104 20 80 Z"
              className="tp-flight__body"
            />
            <path d="M104 44 L138 2 L168 2 L154 44 Z" className="tp-flight__wing" />
            <path d="M206 64 C215 67 221 73 224 80" className="tp-flight__line" />
          </g>
          {photo && (
            <g transform="translate(10 2)">
              <image
                href={photo}
                x="-25"
                y="-25"
                width="50"
                height="50"
                clipPath="url(#tp-flight-porthole)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle r="25" className="tp-flight__porthole" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

// Downtown Dubai's skyline as a single line drawing.
export function Skyline({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 300 120" className={className} aria-hidden="true">
      <path
        d="M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
