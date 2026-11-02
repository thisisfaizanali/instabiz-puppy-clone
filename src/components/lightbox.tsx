"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Media } from "@/lib/types";

// The width a photo needs when it fits the viewer, so the sharp copy is not larger than it has to be.
const fitWidth = (media: Media) => Math.ceil(Math.min(innerWidth, Math.max(1, innerHeight - 150) * (media.width / media.height)));

// Shows the copy already loaded for the page at once, then swaps to the sharp one when it has decoded.
function ViewerImage({ media, pageSizes, quality }: { media: Media; pageSizes: string; quality: number }) {
  const [sharp, setSharp] = useState(false);
  return (
    <>
      <Image
        src={media.url}
        alt=""
        fill
        sizes={pageSizes}
        quality={quality}
        loading="eager"
        className={sharp ? "tp-viewer__first tp-viewer__first--done" : "tp-viewer__first"}
        style={{ objectFit: "contain", objectPosition: "50% 50%", backgroundColor: "transparent" }}
      />
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={`${fitWidth(media)}px`}
        quality={quality}
        loading="eager"
        className="tp-viewer__sharp object-contain"
        data-sharp={sharp || undefined}
        onLoad={(e) => {
          e.currentTarget.decode().catch(() => {}).then(() => setSharp(true));
        }}
      />
    </>
  );
}

// Fetches the next and previous photos ahead, so a slide never opens on an empty frame.
function Neighbours({ photos, at, quality }: { photos: Media[]; at: number; quality: number }) {
  const n = photos.length;
  if (n < 2) return null;
  return (
    <span aria-hidden="true" className="sr-only">
      {[...new Set([(at - 1 + n) % n, (at + 1) % n])]
        .filter((i) => photos[i].kind === "image")
        .map((i) => (
          <Image key={photos[i].url} src={photos[i].url} alt="" fill sizes={`${fitWidth(photos[i])}px`} quality={quality} loading="eager" />
        ))}
    </span>
  );
}

// Slides carry the direction they travel: they enter from the way you are heading and leave the other way.
const slides: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 70 * dir, rotate: 5 * dir, scale: 0.92 }),
  center: { opacity: 1, x: 0, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 26 } },
  exit: (dir: number) => ({ opacity: 0, x: -70 * dir, rotate: -5 * dir, scale: 0.92, transition: { duration: 0.22 } }),
};

// Full-screen photo and video viewer on a native modal <dialog>. The parent owns which item
// is open; closing the dialog hands focus back to whatever opened it. Swipe or drag sideways to step.
export function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  label = "Photo viewer",
  title,
  pageSizes,
  quality = 75,
  fade = false,
}: {
  photos: Media[];
  // Open item, or null when closed.
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  label?: string;
  // Header text for the open item; defaults to "2 / 9" plus the caption.
  title?: (index: number) => string;
  // The `sizes` the page already loads these photos with, so its copy doubles as the first frame.
  pageSizes: string;
  quality?: number;
  // Fade and scale the photo in instead of sliding it in from the side.
  fade?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [dir, setDir] = useState(1);
  const open = index !== null;

  useEffect(() => {
    const dialog = ref.current!;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
  }, [open]);

  const photo = open ? photos[index] : undefined;
  const step = (by: number) => {
    if (!open) return;
    setDir(by);
    onIndexChange((index + by + photos.length) % photos.length);
  };
  const media =
    photo?.kind === "video" ? (
      <video src={photo.url} poster={photo.poster?.url} controls autoPlay playsInline className="size-full object-contain" />
    ) : (
      photo && <ViewerImage media={photo} pageSizes={pageSizes} quality={quality} />
    );
  const drag = {
    drag: "x",
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.6,
    onDragEnd: (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -80) step(1);
      else if (info.offset.x > 80) step(-1);
    },
  } as const;

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-lenis-prevent
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
      // Escape, the Android back gesture and other close requests arrive as cancel. Keep the dialog open
      // and let the parent close it, so its state stays the single source of truth.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // A click on the backdrop lands on the dialog itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
    >
      {photo && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="font-scrawl text-lg">
              {title ? (
                title(index!)
              ) : (
                <>
                  {index! + 1} / {photos.length}
                  {photo.caption && ` — ${photo.caption}`}
                </>
              )}
            </p>
            <button
              type="button"
              className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className={fade ? "relative flex-1 touch-pan-y" : "relative flex-1 overflow-hidden"}>
            {fade ? (
              <motion.div
                key={photo.url}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                {...drag}
              >
                {media}
              </motion.div>
            ) : (
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={photo.url}
                  custom={dir}
                  variants={slides}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 touch-pan-y"
                  {...drag}
                >
                  {media}
                </motion.div>
              </AnimatePresence>
            )}
            <Neighbours photos={photos} at={index!} quality={quality} />
          </div>
          {photos.length > 1 && (
            <div className="flex justify-center gap-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button type="button" className="h-12 rounded-full border-2 border-milk px-6 font-semibold" onClick={() => step(-1)}>
                Previous
              </button>
              <button type="button" className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa" onClick={() => step(1)}>
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
