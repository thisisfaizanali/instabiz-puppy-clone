"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Media } from "@/lib/types";

// Full-screen photo viewer on a native modal <dialog>. The parent owns which photo is open;
// closing the dialog hands focus back to whatever opened it.
export function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: Media[];
  // Open photo, or null when closed.
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const dialog = ref.current!;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
    };
  }, [open]);

  const photo = open ? photos[index] : undefined;
  const step = (by: number) => open && onIndexChange((index + by + photos.length) % photos.length);

  return (
    <dialog
      ref={ref}
      aria-label="Photo viewer"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-cocoa/95 p-0 text-milk backdrop:bg-cocoa/70"
      // Escape, the Android back gesture and other close requests arrive as cancel. Keep the dialog open
      // and let the parent close it, so its state stays the single source of truth.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
    >
      {photo && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="font-scrawl text-lg">
              {index! + 1} / {photos.length}
              {photo.caption && ` — ${photo.caption}`}
            </p>
            <button
              type="button"
              className="h-11 rounded-full bg-milk px-5 font-semibold text-cocoa"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <Image key={photo.url} src={photo.url} alt={photo.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="flex justify-center gap-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button type="button" className="h-12 rounded-full border-2 border-milk px-6 font-semibold" onClick={() => step(-1)}>
              Previous
            </button>
            <button type="button" className="h-12 rounded-full bg-honey px-6 font-semibold text-cocoa" onClick={() => step(1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
