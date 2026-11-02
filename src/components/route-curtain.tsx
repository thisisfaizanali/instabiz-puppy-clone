"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { pawPath } from "./paw";

type State = "intro" | "covering" | "covered" | "snap" | "lifting" | "idle";

// Milliseconds into the intro's rest timer, or Infinity once the intro has finished.
function introElapsed() {
  const rest = document
    .querySelector(".tp-curtain")
    ?.getAnimations()
    .find((a) => (a as CSSAnimation).animationName === "tp-curtain-rest");
  return rest && rest.playState !== "finished" && typeof rest.currentTime === "number" ? rest.currentTime : Infinity;
}

// True while the curtain hides the page, so entrances wait for it to lift.
export function curtainDown() {
  const state = document.querySelector<HTMLElement>(".tp-curtain")?.dataset.state;
  return (state === "intro" && introElapsed() < 560) || state === "covering" || state === "covered" || state === "snap";
}

// Paw prints left behind by the runner: [left %, top px, rotation].
const prints = [
  [18, 6, -76],
  [27, -4, -84],
  [36, 7, -72],
  [45, -3, -86],
  [54, 6, -74],
];

// A blanket that lifts off the page on first load, and drops over it between pages while a puppy runs across.
// The intro is pure CSS, so the page still uncovers itself if JavaScript never runs.
export function RouteCurtain() {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef<string | null>(null);
  const coveredAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastPath = useRef(pathname);
  const fromKeyboard = useRef(false);
  const lift = useRef(() => {});

  useEffect(() => {
    const curtain = ref.current!;
    const root = document.documentElement;
    const set = (state: State) => {
      curtain.dataset.state = state;
      if (state === "idle") delete root.dataset.curtain;
      else root.dataset.curtain = state;
    };
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

    const uncover = () => {
      const state = curtain.dataset.state;
      if (state === "idle" || state === "lifting") return;
      clear();
      target.current = null;
      set("lifting");
      dispatchEvent(new Event("tp:arrived"));
      if (fromKeyboard.current) {
        fromKeyboard.current = false;
        document.getElementById("main")?.focus({ preventScroll: true });
      }
      later(() => set("idle"), 460);
    };

    const go = (href: string) => {
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.search === location.search) {
        target.current = null;
        scrollTo({ top: 0, behavior: "instant" });
        later(uncover, 120);
        return;
      }
      router.push(url.pathname + url.search + url.hash);
      // Never hold the page hostage if the navigation stalls.
      later(uncover, 6000);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
      if (!link || (link.target && link.target !== "_self")) return;
      if (link.hasAttribute("download") || link.dataset.noCurtain !== undefined) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || /^\/(admin|api|media|_next)(\/|$)/.test(url.pathname)) return;
      // Same-page hash links scroll instead.
      if (url.pathname === location.pathname && (url.hash || url.search !== location.search)) return;
      if (prefersReducedMotion()) return;

      e.preventDefault();
      e.stopPropagation();
      fromKeyboard.current = e.detail === 0;
      router.prefetch(url.pathname + url.search);
      dispatchEvent(new Event("tp:navigate"));
      target.current = url.href;
      const state = curtain.dataset.state;
      if (state === "covered" || state === "snap") return go(url.href);
      if (state === "covering") return;
      clear();
      if (state === "intro" && introElapsed() < 1080) {
        set("covered");
        coveredAt.current = performance.now();
        go(url.href);
        return;
      }
      set("covering");
      later(() => {
        set("covered");
        coveredAt.current = performance.now();
        if (target.current) go(target.current);
      }, 300);
    };

    // Back and forward: drop the curtain instantly while the page swaps.
    const onPopState = () => {
      if (prefersReducedMotion() || location.pathname === lastPath.current) return;
      clear();
      set("snap");
      coveredAt.current = performance.now();
      later(uncover, 1400);
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      clear();
      set("idle");
    };

    if (curtain.dataset.state === "intro") {
      const elapsed = introElapsed();
      later(() => dispatchEvent(new Event("tp:arrived")), Math.max(0, 560 - elapsed));
      later(() => curtain.dataset.state === "intro" && set("idle"), Math.max(0, 1080 - elapsed));
    }
    if (prefersReducedMotion()) set("idle");

    addEventListener("click", onClick, true);
    addEventListener("popstate", onPopState);
    addEventListener("pageshow", onPageShow);
    lift.current = uncover;
    return () => {
      clear();
      delete root.dataset.curtain;
      removeEventListener("click", onClick, true);
      removeEventListener("popstate", onPopState);
      removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  // The new page has committed: give it a beat, then lift.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const state = ref.current?.dataset.state;
    if (state !== "covered" && state !== "snap" && state !== "covering") return;
    const wait = state === "covering" ? 340 : Math.max(0, 140 - (performance.now() - coveredAt.current));
    const timer = setTimeout(() => requestAnimationFrame(() => lift.current()), wait);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div ref={ref} className="tp-curtain" data-state="intro" aria-hidden="true">
      <div className="tp-curtain__blanket">
        <svg className="tp-curtain__edge tp-curtain__edge--top" width="100%" height="40" preserveAspectRatio="none">
          <defs>
            <pattern id="tp-curtain-scallop" width="76" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V27A38 25 0 0 1 76 27V40Z" fill="#fbe3b4" />
              <path d="M0 27A38 25 0 0 1 76 27" fill="none" stroke="#2a170e" strokeWidth="3" />
              <path
                d="M11 33A27 19 0 0 1 65 33"
                fill="none"
                stroke="#2a170e"
                strokeWidth="1.6"
                strokeDasharray="3.5 5.5"
                strokeLinecap="round"
                opacity=".42"
              />
            </pattern>
          </defs>
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
        <div className="tp-curtain__stage">
          <div className="tp-curtain__prints">
            {prints.map(([left, top, turn], i) => (
              <svg
                key={i}
                viewBox="0 0 64 64"
                className="tp-curtain__print"
                style={{ left: `${left}%`, top: `${top}px`, rotate: `${turn + 90}deg`, animationDelay: `${0.16 + 0.12 * i}s` }}
              >
                <path d={pawPath} />
              </svg>
            ))}
          </div>
          <div className="tp-curtain__runner">
            <Runner />
          </div>
          <p className="tp-curtain__note font-scrawl">every puppy is family</p>
        </div>
        <svg className="tp-curtain__edge tp-curtain__edge--bottom" width="100%" height="40" preserveAspectRatio="none">
          <rect width="100%" height="40" fill="url(#tp-curtain-scallop)" />
        </svg>
      </div>
    </div>
  );
}

// Teddy mid-gallop; the curtain styles swing the legs, tail and ears.
function Runner() {
  return (
    <svg viewBox="0 0 300 240" className="tp-runner" aria-hidden="true" focusable="false" style={{ overflow: "visible" }}>
      <ellipse cx="150" cy="230" rx="86" ry="7" fill="#2a170e" opacity="0.12" className="tp-runner__shadow" />
      <g className="tp-runner__body">
        <g className="tp-runner__leg tp-runner__leg--bf" style={{ transformOrigin: "94px 192px" }}>
          <g transform="translate(94 192)">
            <path d="M-14 -14 C-14 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 14 4 14 -14Z" fill="#e4a352" />
            <path d="M-14 -14 C-14 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 14 4 14 -14" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
            <path d="M-3.5 29 v5 M4.5 29 v5" stroke="#2a170e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          </g>
        </g>
        <g className="tp-runner__leg tp-runner__leg--ff" style={{ transformOrigin: "168px 192px" }}>
          <g transform="translate(168 192)">
            <path d="M-11 -14 C-11 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 11 4 11 -14Z" fill="#e4a352" />
            <path d="M-11 -14 C-11 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33 13 27 C13 18 11 4 11 -14" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
            <path d="M-3.5 29 v5 M4.5 29 v5" stroke="#2a170e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          </g>
        </g>
        <g className="tp-runner__tail" style={{ transformOrigin: "84px 150px" }}>
          <path d="M86 152 C80 146 76 140 74 136" stroke="#2a170e" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          <path d="M86 152 C80 146 76 140 74 136" stroke="#f2be6b" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M70.0 110.0Q78.1 105.0 80.9 113.7Q90.5 114.8 86.7 123.2Q93.4 129.9 84.7 134.0Q85.2 143.1 75.8 141.0Q70.0 148.3 64.2 141.0Q54.8 143.1 55.3 134.0Q46.6 129.9 53.3 123.2Q49.5 114.8 59.1 113.7Q61.9 105.0 70.0 110.0Z" fill="#f2be6b" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
        </g>
        <g className="tp-runner__leg tp-runner__leg--bn" style={{ transformOrigin: "110px 194px" }}>
          <g transform="translate(110 194)">
            <path d="M-15 -14 C-15 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 15 4 15 -14Z" fill="#f2be6b" />
            <path d="M-15 -14 C-15 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 15 4 15 -14" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
            <path d="M-3.5 27 v5 M4.5 27 v5" stroke="#2a170e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          </g>
        </g>
        <path d="M76.8 175.6Q69.0 167.9 78.2 160.7Q76.6 151.8 90.3 147.3Q95.2 138.9 110.9 137.9Q121.6 131.3 136.7 134.0Q151.1 130.5 162.9 136.4Q178.7 136.4 185.3 144.5Q199.7 148.2 199.7 157.1Q210.3 163.7 203.9 171.9Q208.7 180.4 197.0 186.3Q195.3 195.2 180.3 198.0Q172.3 205.7 156.6 204.8Q143.7 210.0 130.0 205.6Q114.5 207.4 105.1 200.2Q89.7 198.3 86.3 189.6Q73.6 184.3 76.8 175.6Z" fill="#f2be6b" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M182.7 196.4Q169.4 196.9 166.6 183.0Q156.1 174.1 162.3 161.5Q159.6 147.6 171.9 142.2Q178.2 129.7 191.0 134.0Q203.3 128.7 210.5 140.8Q223.1 145.2 221.3 159.3Q228.4 171.5 218.5 181.0Q216.6 195.1 203.2 195.7Q193.3 205.1 182.7 196.4Z" fill="#f2be6b" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
        <g className="tp-runner__leg tp-runner__leg--fn" style={{ transformOrigin: "186px 194px" }}>
          <g transform="translate(186 194)">
            <path d="M-12 -14 C-12 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 12 4 12 -14Z" fill="#f2be6b" />
            <path d="M-12 -14 C-12 4 -12 16 -12 25 C-12 32 -7 34 0 34 C9 34 13 31 13 25 C13 16 12 4 12 -14" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
            <path d="M-3.5 27 v5 M4.5 27 v5" stroke="#2a170e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          </g>
        </g>
        <g className="tp-runner__head">
          <path d="M178 146 Q212 162 246 146 L246 154 Q212 170 178 154 Z" fill="#a24a1a" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M212 160 C212 156 206 155 206 159.4 C206 163 212 166.6 212 168.4 C212 166.6 218 163 218 159.4 C218 155 212 156 212 160 Z" fill="#fbe3b4" stroke="#2a170e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M177.1 78.7Q186.9 70.8 186.6 87.4Q196.0 89.9 189.9 105.5Q195.2 117.3 185.5 126.0Q184.7 142.8 175.2 141.2Q168.7 156.5 162.9 145.3Q153.1 153.2 153.4 136.6Q144.0 134.1 150.1 118.5Q144.8 106.7 154.5 98.0Q155.3 81.2 164.8 82.8Q171.3 67.5 177.1 78.7Z" fill="#e4a352" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" className="tp-runner__ear" style={{ transformOrigin: "174px 82px" }} />
          <path d="M246.9 78.7Q252.7 67.5 259.2 82.8Q268.7 81.2 269.5 98.0Q279.2 106.7 273.9 118.5Q280.0 134.1 270.6 136.6Q270.9 153.2 261.1 145.3Q255.3 156.5 248.8 141.2Q239.3 142.8 238.5 126.0Q228.8 117.3 234.1 105.5Q228.0 89.9 237.4 87.4Q237.1 70.8 246.9 78.7Z" fill="#e4a352" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" className="tp-runner__ear tp-runner__ear--r" style={{ transformOrigin: "250px 82px" }} />
          <path d="M212.0 54.0Q223.4 48.2 231.5 57.5Q244.5 56.1 248.1 67.5Q260.7 70.7 259.1 82.4Q269.4 89.7 263.0 100.0Q269.4 110.3 259.1 117.6Q260.7 129.3 248.1 132.5Q244.5 143.9 231.5 142.5Q223.4 151.8 212.0 146.0Q200.6 151.8 192.5 142.5Q179.5 143.9 175.9 132.5Q163.3 129.3 164.9 117.6Q154.6 110.3 161.0 100.0Q154.6 89.7 164.9 82.4Q163.3 70.7 175.9 67.5Q179.5 56.1 192.5 57.5Q200.6 48.2 212.0 54.0Z" fill="#f2be6b" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M195.0 52.0Q190.7 45.8 200.0 43.5Q203.2 36.9 212.0 40.0Q220.8 36.9 224.0 43.5Q233.3 45.8 229.0 52.0Q233.3 58.2 224.0 60.5Q220.8 67.1 212.0 64.0Q203.2 67.1 200.0 60.5Q190.7 58.2 195.0 52.0Z" fill="#f2be6b" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M188 120 C188 106 200 100 212 100 C224 100 236 106 236 120 C236 133 225 140 212 140 C199 140 188 133 188 120 Z" fill="#fbe3b4" />
          <circle cx="181" cy="116" r="7" fill="#f9b9a6" opacity="0.85" />
          <circle cx="243" cy="116" r="7" fill="#f9b9a6" opacity="0.85" />
          <path d="M186.5 101 Q194 91.5 201.5 101 M222.5 101 Q230 91.5 237.5 101" stroke="#2a170e" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          <path d="M204.5 111.5 Q212 107.2 219.5 111.5 Q218.2 118.4 212 120 Q205.8 118.4 204.5 111.5 Z" fill="#2a170e" />
          <path d="M212 120 V124.5 M212 124.5 Q207.2 129.6 202.8 125.2 M212 124.5 Q216.8 129.6 221.2 125.2" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          <path d="M207.6 127.4 Q212 136.6 216.4 127.4 Z" fill="#e98c8c" stroke="#2a170e" strokeWidth="2.2" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}
