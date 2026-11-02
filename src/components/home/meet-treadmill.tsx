"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Teddy } from "@/components/teddy";
import { useReducedMotion } from "@/lib/reduced-motion";

// On wide screens with motion allowed, the section pins and scrolling walks the row of doors past, each door
// opening as it crosses the left third. Everywhere else it stays the static grid of open doors.
export function MeetTreadmill({ head, children, ...props }: ComponentProps<"section"> & { head: ReactNode }) {
  const rangeRef = useRef<HTMLDivElement>(null);
  const hallRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const [travel, setTravel] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const wide = matchMedia("(min-width: 1024px)").matches;
      setPinned(wide && !reduced);
      const track = trackRef.current;
      const hall = hallRef.current;
      if (hall && track && wide && !reduced) {
        // Size the doors to fit the space left under the heading.
        const stage = hall.parentElement!;
        const header = stage.querySelector<HTMLElement>(".tp-meet__head");
        const plate = Math.max(64, ...[...track.querySelectorAll<HTMLElement>(".tp-door__plate")].map((el) => el.offsetHeight));
        const floor = hall.querySelector<HTMLElement>(".tp-meet__floor")?.offsetHeight ?? 0;
        const room = stage.clientHeight - (header ? header.offsetTop + header.offsetHeight : 0) - floor - plate - 40;
        const width = Math.max(128, Math.min(256, 0.15 * innerWidth, room / 1.3));
        hall.style.setProperty("--door-w", `${width.toFixed(0)}px`);
      } else hall?.style.removeProperty("--door-w");
      setTravel(track ? Math.max(0, track.scrollWidth - innerWidth) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (hallRef.current?.parentElement) ro.observe(hallRef.current.parentElement);
    addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", measure);
    };
  }, [reduced]);

  const { scrollYProgress } = useScroll({ target: rangeRef, offset: ["start start", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 170, damping: 32, mass: 0.35 });
  const x = useTransform(eased, [0, 1], [0, -travel]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const hall = hallRef.current;
    if (!pinned || !track || !hall) return;
    const place = (offset: number) => {
      hall.style.setProperty("--floor-x", `${offset.toFixed(1)}px`);
      const line = 0.36 * innerWidth;
      for (const door of track.children as HTMLCollectionOf<HTMLElement>) {
        const open = door.offsetLeft + offset < line;
        if ((door.dataset.open === "true") !== open) door.dataset.open = String(open);
      }
    };
    place(x.get());
    const stop = x.on("change", place);
    return () => {
      stop();
      for (const door of track.children as HTMLCollectionOf<HTMLElement>) door.dataset.open = "true";
      hall.style.removeProperty("--floor-x");
    };
  }, [pinned, x]);

  // Keyboard focus on a door off to the side scrolls the page until that door is walked into view.
  const onFocus = (e: React.FocusEvent) => {
    const range = rangeRef.current;
    const door = (e.target as HTMLElement).closest<HTMLElement>(".tp-door");
    if (!pinned || !range || !door || !travel) return;
    (range.firstElementChild as HTMLElement).scrollLeft = 0;
    const want = Math.min(travel, Math.max(0, door.offsetLeft - 0.3 * innerWidth));
    const top = range.getBoundingClientRect().top + scrollY;
    const span = range.offsetHeight - innerHeight;
    scrollTo({ top: top + (want / travel) * span, behavior: "instant" });
  };

  return (
    <section {...props} data-pinned={pinned || undefined}>
      <div
        ref={rangeRef}
        data-pin-range
        style={{ height: pinned ? `calc(100vh + ${Math.round(travel * 0.8)}px)` : undefined } as React.CSSProperties}
      >
        <div className="tp-meet__stage" onScroll={(e) => (e.currentTarget.scrollLeft = 0)}>
          {head}
          <div ref={hallRef} className="tp-meet__hall">
            <motion.ol
              ref={trackRef}
              style={pinned ? { x } : undefined}
              className="tp-meet__track"
              aria-label="Puppies looking for a family"
              data-treadmill
              onFocus={onFocus}
            >
              {children}
            </motion.ol>
            <div aria-hidden="true" className="tp-meet__floor" />
            {/* Pinned, Teddy walks on the spot while the doors go by. */}
            <Teddy pose={pinned ? "walk" : "sit"} act={pinned ? "treadmill" : undefined} className="tp-meet__teddy" />
          </div>
        </div>
      </div>
    </section>
  );
}
