"use client";

import { useRef, useState } from "react";
import type { Media } from "@/lib/types";

// A muted, looping clip that only plays when asked, as on the reference.
export function Clip({ video }: { video: Media }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const v = ref.current!;
    if (v.paused) void v.play();
    else v.pause();
  }

  return (
    <div className="tp-clip">
      <video
        ref={ref}
        src={video.url}
        poster={video.poster?.url}
        muted
        loop
        playsInline
        preload="none"
        aria-label={video.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="tp-clip__play"
        aria-pressed={playing}
        aria-label={playing ? "Pause video" : "Play video"}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={playing ? "M7 5h3v14H7zM14 5h3v14h-3z" : "M8 5v14l11-7z"} />
        </svg>
      </button>
    </div>
  );
}
