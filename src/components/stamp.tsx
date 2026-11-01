import type { ReactNode } from "react";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Line icons drawn on a 64x64 grid, shared by the passport stamps and the "why choose us" list.
export const stampIcons = {
  heart: (
    <>
      <path d="M32 54C16 43 8 34 8 24c0-7 5.4-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 6.6 0 12 5 12 12 0 10-8 19-24 30z" {...line} />
      <path d="M22 30h7l3-7 4 13 3-6h7" {...line} />
    </>
  ),
  plane: (
    <>
      <path d="M6 36l22-3 12-17h6l-6 17 12-1 6-7h3l-2 10 2 10h-3l-6-7-12-1 6 17h-6L28 37 6 36z" {...line} />
      <path d="M8 50c10 4 20 4 30 0" {...line} strokeDasharray="2 7" />
    </>
  ),
  chat: (
    <>
      <path d="M10 14h44v28H30l-12 10v-10h-8z" {...line} />
      <path d="M22 28h0M32 28h0M42 28h0" {...line} strokeWidth={5} />
    </>
  ),
  globe: (
    <>
      <circle cx="32" cy="32" r="22" {...line} />
      <path d="M10 32h44M32 10c-8 8-8 36 0 44M32 10c8 8 8 36 0 44" {...line} />
    </>
  ),
};

export type Stamp = {
  title: string;
  text: string;
  shape: "round" | "ticket" | "oval" | "scallop";
  ink: string;
  tilt: string;
  icon: ReactNode;
};

// A passport page entry: an inked stamp with its caption underneath.
export function StampEntry({ stamp, index }: { stamp: Stamp; index: number }) {
  return (
    <li
      className="tp-entry"
      style={{ "--ink-stamp": stamp.ink, "--tilt": stamp.tilt, "--i": index } as React.CSSProperties}
    >
      <span className={`tp-stamp tp-stamp--${stamp.shape}`}>
        <svg viewBox="0 0 64 64" className="tp-stamp__icon" aria-hidden="true">
          {stamp.icon}
        </svg>
        <span className="tp-stamp__title font-plush">{stamp.title}</span>
      </span>
      <p className="tp-entry__text">{stamp.text}</p>
    </li>
  );
}
