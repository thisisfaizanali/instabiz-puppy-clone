"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/lightbox";
import type { Media } from "@/lib/types";

// Polaroid placement from the reference, one per print on the wall.
const prints = [
  { tilt: "-2.2deg", tape: "#f6d79a", side: "center" },
  { tilt: "1.6deg", tape: "#f9cdbf", side: "left" },
  { tilt: "-0.9deg", tape: "#cfe5f6", side: "right" },
  { tilt: "2.4deg", tape: "#f6d79a", side: "tl" },
  { tilt: "-1.5deg", tape: "#e9dcc4", side: "center" },
  { tilt: "0.8deg", tape: "#f6d79a", side: "right" },
  { tilt: "-2.6deg", tape: "#f9cdbf", side: "left" },
  { tilt: "1.2deg", tape: "#cfe5f6", side: "center" },
];

// The first photos are pinned to the wall; the lightbox pages through all of them.
export function FamilyWall({ photos }: { photos: Media[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="tp-photowall__prints" aria-label="Photos from TeddyPups families">
        {photos.slice(0, prints.length).map((photo, i) => (
          <li key={photo.url}>
            <button
              type="button"
              className="tp-photowall__print"
              aria-label={`Open photo ${i + 1} of ${photos.length}: ${photo.caption}`}
              onClick={() => setOpen(i)}
            >
              <span
                className="tp-polaroid"
                style={{ "--tilt": prints[i].tilt, "--tape": prints[i].tape, "--i": i } as React.CSSProperties}
              >
                <span aria-hidden="true" className={`tp-tape tp-tape--${prints[i].side}`} />
                <span className="tp-polaroid__photo">
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                    style={{ backgroundColor: photo.color }}
                  />
                </span>
                <span className="tp-polaroid__caption font-scrawl">{photo.caption}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox photos={photos} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
