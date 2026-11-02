"use client";

import Image from "next/image";
import { useState } from "react";
import { Polaroid } from "@/components/home/family-wall";
import { Lightbox } from "@/components/lightbox";
import { Paw } from "@/components/paw";
import type { Media } from "@/lib/types";

// Every family photo as a polaroid in masonry columns; each opens the lightbox at that photo.
export function FamilyPhotoWall({ photos }: { photos: Media[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="tp-wall" aria-label="Photos from TeddyPups families">
        {photos.map((photo, i) => (
          <li
            key={photo.url}
            className="tp-wall__item"
            data-reveal
            style={{ "--d": `${(i % 4) * 60}ms` } as React.CSSProperties}
          >
            <button
              type="button"
              className="tp-wall__print"
              aria-label={`Open photo ${i + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ""}`}
              onClick={() => setOpen(i)}
            >
              <Polaroid index={i} caption={photo.caption}>
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading={i < 2 ? "eager" : "lazy"}
                  fetchPriority={i < 2 ? "high" : undefined}
                  sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
                  style={{ width: "100%", height: "auto", backgroundColor: photo.color }}
                />
              </Polaroid>
              <Paw className="tp-wall__paw" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox photos={photos} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
