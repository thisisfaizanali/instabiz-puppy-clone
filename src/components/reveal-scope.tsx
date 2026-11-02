"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { curtainDown } from "./route-curtain";

// Plays the entrance of every [data-reveal] inside as it scrolls into view. Only elements still below the fold
// get data-armed (the hidden state), so the server HTML and anything already on screen never hide or flash.
// While the route curtain covers the page, entrances queue up and play as it lifts.
export function RevealScope({ children, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = ref.current!;
    const pending = () => scope.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])");

    if (prefersReducedMotion()) {
      const showAll = () => pending().forEach((el) => (el.dataset.revealed = "true"));
      showAll();
      const mutations = new MutationObserver(showAll);
      mutations.observe(scope, { childList: true, subtree: true });
      return () => mutations.disconnect();
    }

    const queued = new Set<HTMLElement>();
    const reveal = (el: HTMLElement) => {
      el.dataset.revealed = "true";
      io.unobserve(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (curtainDown()) queued.add(el);
          else reveal(el);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    const arm = (el: HTMLElement) => {
      if (el.dataset.armed) return io.observe(el);
      const box = el.getBoundingClientRect();
      if (box.top < innerHeight && box.bottom > 0 && !curtainDown()) {
        el.dataset.revealed = "true";
        return;
      }
      el.dataset.armed = "true";
      io.observe(el);
    };
    pending().forEach(arm);
    // Streamed and client-rendered content arrives later.
    const mutations = new MutationObserver(() => pending().forEach(arm));
    mutations.observe(scope, { childList: true, subtree: true });
    const flush = () => {
      queued.forEach(reveal);
      queued.clear();
    };
    addEventListener("tp:arrived", flush);
    // Backstop in case the arrival event was missed.
    let timer: ReturnType<typeof setTimeout>;
    const poll = () => (curtainDown() ? (timer = setTimeout(poll, 400)) : flush());
    timer = setTimeout(poll, 1600);
    return () => {
      clearTimeout(timer);
      removeEventListener("tp:arrived", flush);
      io.disconnect();
      mutations.disconnect();
    };
  }, []);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}
