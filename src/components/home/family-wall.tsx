"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/lightbox";
import type { Media } from "@/lib/types";

// Polaroid placement from the reference: tilt and tape side repeat every 8 prints, tape colour every 5.
const tilts = ["-2.2deg", "1.6deg", "-0.9deg", "2.4deg", "-1.5deg", "0.8deg", "-2.6deg", "1.2deg"];
const sides = ["center", "left", "right", "tl", "center", "right", "left", "center"];
const tapes = ["#f6d79a", "#f9cdbf", "#cfe5f6", "#f6d79a", "#e9dcc4"];

// A taped polaroid print; the photo goes in as children.
export function Polaroid({ index, caption, children }: { index: number; caption: string; children: React.ReactNode }) {
  return (
    <span
      className="tp-polaroid"
      style={
        { "--tilt": tilts[index % 8], "--tape": tapes[index % 5], "--i": index } as React.CSSProperties
      }
    >
      <span aria-hidden="true" className={`tp-tape tp-tape--${sides[index % 8]}`} />
      <span className="tp-polaroid__photo">{children}</span>
      <span className="tp-polaroid__caption font-scrawl">{caption}</span>
    </span>
  );
}

// The first photos are pinned to the wall; the lightbox pages through all of them.
export function FamilyWall({ photos }: { photos: Media[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="tp-photowall__prints" aria-label="Photos from TeddyPups families">
        {photos.slice(0, 8).map((photo, i) => (
          <li key={photo.url}>
            <button
              type="button"
              className="tp-photowall__print"
              aria-label={`Open photo ${i + 1} of ${photos.length}: ${photo.caption}`}
              onClick={() => setOpen(i)}
            >
              <Polaroid index={i} caption={photo.caption}>
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 42vw"
                  style={{ backgroundColor: photo.color }}
                />
              </Polaroid>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox photos={photos} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
