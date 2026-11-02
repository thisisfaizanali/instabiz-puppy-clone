"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { coverStyle } from "@/lib/media";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import type { Media } from "@/lib/types";

export type Friend = { slug: string; displayName: string; breed: string; cover: Media };

// Lineup placement from the reference: horizontal position, width, how much peeks over the quilt, tilt.
const seats = [
  { x: "9%", w: "8.6rem", peek: 0.62, tilt: "-5deg" },
  { x: "22.5%", w: "10.4rem", peek: 0.8, tilt: "3deg" },
  { x: "35%", w: "9.2rem", peek: 0.7, tilt: "-2deg" },
  { x: "65%", w: "9.4rem", peek: 0.74, tilt: "3deg" },
  { x: "77.5%", w: "10.6rem", peek: 0.82, tilt: "-3deg" },
  { x: "91%", w: "8.4rem", peek: 0.6, tilt: "4deg" },
];
// Pause between one pup ducking and the next, cycled.
const gaps = [1900, 2500, 1700, 2300, 2000, 2800, 1800];

function seatStyle(i: number) {
  const s = seats[i];
  return { "--x": s.x, "--w": s.w, "--peek": s.peek, "--tilt": s.tilt, "--i": i } as React.CSSProperties;
}

const shuffle = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// After the opening peek, one pup at a time ducks under the quilt and pops back up, swapping in a pup who was
// not on show when there are more friends than seats. Pauses while off screen, hidden or being interacted with.
export function HeroLineup({ friends }: { friends: Friend[] }) {
  const count = Math.min(seats.length, friends.length);
  const [cast, setCast] = useState(() => friends.slice(0, count).map((_, i) => i));
  const [states, setStates] = useState<Record<number, "duck" | "pop" | undefined>>({});
  const [popped, setPopped] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [wings, setWings] = useState<number | null>(friends.length > count ? count : null);
  const listRef = useRef<HTMLUListElement>(null);
  const wingsRef = useRef<HTMLSpanElement>(null);
  const castRef = useRef(cast);

  useEffect(() => {
    castRef.current = cast;
  }, [cast]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !count || prefersReducedMotion()) return;
    const swaps = friends.length > count;
    let visible = true;
    let busyUntil = 0;
    let alive = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.35 });
    io.observe(list);
    const busy = () => (busyUntil = performance.now() + 1200);
    addEventListener("scroll", busy, { passive: true });
    addEventListener("pointerdown", busy, { passive: true });
    list.addEventListener("pointerover", busy, { passive: true });

    const offstage = () => friends.map((_, i) => i).filter((i) => !castRef.current.includes(i));
    const first = offstage();
    let bench = first.includes(count) ? [count, ...shuffle(first.filter((i) => i !== count))] : shuffle(first);
    let order: number[] = [];
    let last = -1;
    let beat = 0;
    let tries = 0;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    const next = () => {
      if (document.hidden || !visible || performance.now() <= busyUntil) return later(next, 900);
      if (!swaps) return duck();
      if (!bench.length) bench = shuffle(offstage());
      // Wait for the incoming photo so it never pops up blank.
      const img = wingsRef.current?.dataset.for === String(bench[0]) ? wingsRef.current.querySelector("img") : null;
      if (!img || !img.complete || !img.naturalWidth) {
        if (++tries < 15) return later(next, 400);
        bench.push(bench.shift()!);
        setWings(bench[0] ?? null);
        tries = 0;
        return later(next, 800);
      }
      tries = 0;
      img.decode().then(duck, duck);
    };

    const duck = () => {
      if (!order.length) {
        order = shuffle(
          [...list.children].map((el, i) => (el.getClientRects().length ? i : -1)).filter((i) => i >= 0),
        ).filter((seat, i, all) => !(i === 0 && seat === last && all.length > 1));
      }
      const seat = order.shift();
      if (seat === undefined) return later(next, 2000);
      last = seat;
      const incoming = swaps ? bench.shift()! : castRef.current[seat];
      setStates((s) => ({ ...s, [seat]: "duck" }));
      later(() => {
        if (swaps) {
          const outgoing = castRef.current[seat];
          setCast((c) => c.map((f, i) => (i === seat ? incoming : f)));
          bench.push(outgoing);
          setWings(bench[0] ?? null);
        }
        setStates((s) => ({ ...s, [seat]: "pop" }));
        setPopped(seat);
        later(() => setPopped((p) => (p === seat ? null : p)), 1800);
        later(() => setStates((s) => ({ ...s, [seat]: undefined })), 700);
      }, 360);
      later(next, gaps[beat++ % gaps.length]);
    };

    // Start once the opening peek has finished.
    const peeks = [...list.querySelectorAll(".tp-lineup__pup")]
      .flatMap((el) => el.getAnimations())
      .filter((a) => (a as CSSAnimation).animationName === "tp-peek");
    const start = () => alive && later(next, 250);
    Promise.all(peeks.map((a) => a.finished)).then(start, start);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      timers = [];
      io.disconnect();
      removeEventListener("scroll", busy);
      removeEventListener("pointerdown", busy);
      list.removeEventListener("pointerover", busy);
    };
  }, [friends, count]);

  const leave = (i: number) => () => setHovered((h) => (h === i ? null : h));

  return (
    <>
      <ul ref={listRef} className="tp-lineup" aria-label="Some of the puppies in our showroom">
        {cast.map((f, i) => {
          const friend = friends[f];
          return (
            <li key={i} className="tp-lineup__seat" style={seatStyle(i)}>
              <Link
                className="tp-lineup__pup"
                data-state={states[i]}
                aria-label={`Meet ${friend.displayName}, ${friend.breed}`}
                href={`/puppies/${friend.slug}`}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={leave(i)}
                onFocus={() => setHovered(i)}
                onBlur={leave(i)}
              >
                <span className="tp-lineup__photo">
                  <Image
                    key={friend.slug}
                    src={friend.cover.url}
                    alt={friend.cover.alt}
                    fill
                    sizes="11rem"
                    fetchPriority={i < 2 ? "high" : undefined}
                    className="object-cover"
                    style={coverStyle(friend.cover)}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul aria-hidden="true" className="tp-lineup tp-lineup--tags">
        {cast.map((f, i) => (
          <li key={i} className="tp-lineup__seat" style={seatStyle(i)}>
            <span
              className="tp-lineup__ghost"
              data-state={states[i]}
              data-tag={popped === i || hovered === i ? "show" : undefined}
            >
              <span className="tp-lineup__name font-scrawl">{friends[f].displayName}</span>
            </span>
          </li>
        ))}
      </ul>
      {wings !== null && (
        // Loads the next pup's photo ahead of the swap.
        <span ref={wingsRef} aria-hidden="true" className="tp-lineup__wings" data-for={wings}>
          <Image src={friends[wings].cover.url} alt="" width={176} height={220} sizes="11rem" loading="eager" />
        </span>
      )}
    </>
  );
}
