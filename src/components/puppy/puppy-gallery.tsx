"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/lightbox";
import { coverStyle } from "@/lib/media";
import type { Media } from "@/lib/types";

// A puppy's photos and videos as a storybook page, with prev/next, a counter and thumbnails.
// Opening the page shows the same item full screen in the lightbox, where the arrow keys step.
export function PuppyGallery({ name, media }: { name: string; media: Media[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = media.length;
  const item = media[index];
  const go = (i: number) => setIndex(((i % count) + count) % count);
  const label = (i: number) => `${name}, ${media[i].kind === "video" ? "video" : "photo"} ${i + 1} of ${count}`;

  return (
    <div>
      <div className="tp-storypage relative aspect-[4/5] md:aspect-[5/6]">
        <button
          type="button"
          className="absolute inset-0 block size-full"
          onClick={() => setOpen(true)}
          aria-label={`Open ${label(index)} full screen`}
        >
          {item.kind === "video" ? (
            <video
              key={item.url}
              src={item.url}
              poster={item.poster?.url}
              className="size-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              aria-label={item.alt}
            />
          ) : (
            <Image
              key={item.url}
              src={item.url}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 55vw, 92vw"
              quality={85}
              preload={index === 0}
              className="object-cover"
              style={coverStyle(item)}
            />
          )}
        </button>
        {count > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex justify-between">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <span className="self-center rounded-full bg-cocoa/80 px-3 py-1 text-sm font-semibold text-milk">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="grid size-12 place-items-center rounded-full border-2 border-cocoa bg-milk/95 text-xl font-bold"
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        )}
      </div>
      {count > 1 && (
        <ul className="mt-3 flex gap-3 overflow-x-auto px-1 pt-2 pb-2 [scrollbar-width:thin]" aria-label={`All photos of ${name}`}>
          {media.map((m, i) => {
            const thumb = m.kind === "video" ? m.poster : m;
            return (
              <li key={m.url} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={label(i)}
                  aria-current={i === index}
                  className={`relative block h-24 w-20 overflow-hidden rounded-[0.9rem] border-[3px] transition-transform duration-300 md:h-28 md:w-24 ${i === index ? "-translate-y-1 -rotate-3 border-toffee-deep" : "border-cocoa/30 hover:-rotate-2 hover:border-cocoa"}`}
                >
                  {thumb && <Image src={thumb.url} alt="" fill sizes="96px" className="object-cover" style={coverStyle(thumb)} />}
                  {m.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-cocoa/30 text-lg text-milk">▶</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Lightbox
        photos={media}
        index={open ? index : null}
        onIndexChange={go}
        onClose={() => setOpen(false)}
        label={`${name} photos`}
        title={label}
      />
    </div>
  );
}
