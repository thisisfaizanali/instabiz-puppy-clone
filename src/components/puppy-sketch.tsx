import Image from "next/image";
import Link from "next/link";
import { coverStyle } from "@/lib/media";
import { type Doodle, maskUrl, sketchFor } from "@/lib/sketch";
import type { Puppy } from "@/lib/types";
import { pawPath } from "./paw";

const statusLabels: Record<Puppy["status"], string> = {
  available: "Available",
  "gone-home": "Gone home",
};

function SketchDoodle({ doodle: d }: { doodle: Doodle }) {
  const line = { fill: "none", stroke: d.ink, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <g transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) rotate(${d.rot.toFixed(0)}) scale(${d.size.toFixed(2)})`}>
      <g className="tp-sketch__doodle">
        {d.kind === "sparkle" && (
          <path d="M0 -6c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6z" fill={d.ink} />
        )}
        {d.kind === "heart" && (
          <path
            d="M0 5C-4.6 1.8-6.4-.8-6.4-3.2c0-1.9 1.5-3.3 3.3-3.3 1.3 0 2.4.7 3.1 1.9.7-1.2 1.8-1.9 3.1-1.9 1.8 0 3.3 1.4 3.3 3.3C6.4-.8 4.6 1.8 0 5z"
            {...line}
          />
        )}
        {d.kind === "dashes" && <path d="M-5 -5l4 2M-6 0h5M-5 5l4 -2" {...line} />}
        {d.kind === "swirl" && (
          <path d="M0 0c1.6-.6 2.4 1.4.8 2.6-2 1.4-4.6-.4-4-3 .7-3 4.8-3.8 6.8-1.2 2.4 3-0.2 7.4-3.8 7.2" {...line} />
        )}
        {d.kind === "dots" && (
          <g fill={d.ink}>
            <circle cx="-4" cy="1" r="1.2" />
            <circle cx="0" cy="-2" r="1.2" />
            <circle cx="4" cy="1" r="1.2" />
          </g>
        )}
        {d.kind === "paw" && <path d={pawPath} transform="scale(.17) translate(-32 -34)" fill={d.ink} opacity={0.85} />}
      </g>
    </g>
  );
}

// A puppy drawn into Teddy's sketchbook: the photo inside a wobbly hand-drawn frame.
export function PuppySketch({
  puppy,
  sizes = "(min-width: 1536px) 17rem, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw",
  preload = false,
  small = false,
}: {
  puppy: Puppy;
  sizes?: string;
  preload?: boolean;
  // The gone-home strip: smaller, with a "gone home" sticker and no meta line.
  small?: boolean;
}) {
  const s = sketchFor(puppy.slug);
  const cover = puppy.media[0];
  const status = statusLabels[puppy.status];
  const label = `${puppy.displayName}${puppy.name ? `, ${puppy.breed}` : ""}, ${puppy.genderLabel.toLowerCase()}${puppy.age ? `, ${puppy.age}` : ""}, ${status.toLowerCase()}`;
  return (
    <Link
      href={`/puppies/${puppy.slug}`}
      className={`tp-sketch${small ? " tp-sketch--small" : ""}`}
      style={{ "--tilt": `${s.tilt.toFixed(2)}deg`, "--wash": s.wash.colour } as React.CSSProperties}
      aria-label={label}
    >
      <span className="tp-sketch__frame">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="tp-sketch__wash"
          style={{ translate: `${s.wash.dx.toFixed(1)}% ${s.wash.dy.toFixed(1)}%` }}
        >
          <path d={s.wash.d} />
        </svg>
        <span className="tp-sketch__photo" style={{ maskImage: maskUrl(s.mask), WebkitMaskImage: maskUrl(s.mask) }}>
          <Image src={cover.url} alt="" fill sizes={sizes} preload={preload} className="object-cover" style={coverStyle(cover)} />
        </span>
        <svg aria-hidden="true" viewBox="0 0 100 100" className="tp-sketch__ink">
          <path d={s.outline} pathLength={1} className="tp-sketch__line" />
          <path d={s.retrace} pathLength={1} className="tp-sketch__line tp-sketch__line--retrace" />
          {s.doodles.map((d, i) => (
            <SketchDoodle key={i} doodle={d} />
          ))}
        </svg>
        {small ? (
          <span className="tp-sketch__sticker tp-sketch__sticker--home font-scrawl">gone home ♥</span>
        ) : (
          <>
            <span className="tp-sketch__sticker font-scrawl">{status}</span>
            {puppy.media.some((m) => m.kind === "video") && <span className="tp-sketch__video">▶ video</span>}
          </>
        )}
      </span>
      <span className="tp-sketch__name font-plush">{puppy.displayName}</span>
      {!small && (
        <span className="tp-sketch__meta">
          {puppy.name ? `${puppy.breed} · ` : ""}
          {puppy.genderLabel.toLowerCase()}
          {puppy.age ? ` · ${puppy.age}` : ""}
        </span>
      )}
    </Link>
  );
}
