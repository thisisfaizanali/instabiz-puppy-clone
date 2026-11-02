import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () => matchMedia(query).matches;

// Reports reduced motion on the server and during hydration, so motion only starts once the client confirms it.
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const media = matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    prefersReducedMotion,
    () => true,
  );
}
