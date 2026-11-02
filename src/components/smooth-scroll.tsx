"use client";

import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { prefersReducedMotion, useReducedMotion } from "@/lib/reduced-motion";

let lenis: Lenis | null = null;

// Wheel smoothing for mouse and trackpad users, plus smooth in-page anchor jumps for everyone.
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.detail === 0 || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href*='#']");
      if (!link || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
      if (url.hash.length < 2) return;
      const id = decodeURIComponent(url.hash.slice(1));
      const target = [...document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)].find(
        (el) => el.getClientRects().length,
      );
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth" });
      history.pushState(null, "", url.hash);
    };
    addEventListener("click", onClick);
    return () => removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 0.85,
      prevent: (node) => !!node.closest?.("dialog, [data-lenis-prevent]"),
      // An open dialog hides the page's overflow; leave the wheel alone until it closes.
      virtualScroll: () => getComputedStyle(root).overflowY !== "hidden",
    });
    lenis = instance;
    const settle = () => instance.scrollTo(instance.actualScroll, { immediate: true });
    addEventListener("tp:navigate", settle);
    addEventListener("popstate", settle);
    const tick = ({ timestamp }: { timestamp: number }) => instance.raf(timestamp);
    frame.read(tick, true);
    return () => {
      cancelFrame(tick);
      removeEventListener("tp:navigate", settle);
      removeEventListener("popstate", settle);
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);

  // The router resets the scroll on a new page; drop any glide still in flight so it cannot pull the page back.
  // Measure the new page first, or the scroll would be clamped to the previous page's height.
  useEffect(() => {
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(lenis.actualScroll, { immediate: true });
  }, [pathname]);

  return null;
}
