import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () => matchMedia(query).matches;

// Tracks a media query; `server` is what it reports on the server and during hydration.
export function useMediaQuery(media: string, server: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(media);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => matchMedia(media).matches,
    () => server,
  );
}

// Reports reduced motion on the server and during hydration, so motion only starts once the client confirms it.
export const useReducedMotion = () => useMediaQuery(query, true);
