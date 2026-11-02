"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { pawPath } from "@/components/paw";
import { cuePup } from "@/components/pup-journey";
import { showroomPhotos, showroomVideo } from "@/data/showroom";
import { coverStyle } from "@/lib/media";
import { useMediaQuery, useReducedMotion } from "@/lib/reduced-motion";
import { site } from "@/lib/site";
import { Clip } from "./clip";

const steps = [
  {
    title: "Choose your breed",
    text: "Select your preferred breed or tell us what you're looking for. We'll guide you based on availability and your lifestyle.",
  },
  {
    title: "Get photos & details",
    text: "Our team will share real photos, health details, and all necessary information directly on WhatsApp.",
  },
  {
    title: "Secure & safe delivery",
    text: "Once confirmed, we handle everything professionally and ensure your puppy reaches you safely and stress-free.",
  },
];

// On wide screens with motion allowed, each step lights up as it scrolls past and its reply arrives in the
// phone after a moment of typing. Elsewhere every step and message shows at once.
export function JourneyChat({ breeds, teddy }: { breeds: { slug: string; name: string }[]; teddy: ReactNode }) {
  const wide = useMediaQuery("(min-width: 1024px)", false);
  const still = useReducedMotion() || !wide;
  const [step, setStep] = useState(-1);
  const [typing, setTyping] = useState(false);
  const stepsRef = useRef<HTMLOListElement>(null);
  const seen = useRef(-1);
  const phoneRef = useRef<HTMLDivElement>(null);
  const current = still ? steps.length - 1 : step;

  useEffect(() => {
    if (still || !stepsRef.current) return;
    const items = [...stepsRef.current.children];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setStep(items.indexOf(entry.target));
      },
      { rootMargin: "-28% 0px -62% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [still]);

  useEffect(() => {
    if (still) return;
    const forward = step > seen.current;
    seen.current = step;
    if (!forward || step < 0) return;
    setTyping(true);
    const timer = setTimeout(() => {
      setTyping(false);
      // Teddy, resting by the phone, glances at the reply that just arrived.
      const reply = phoneRef.current?.querySelector(`[data-step="${step}"]`);
      if (reply) cuePup({ look: reply, secs: 1.4, say: step === 1 ? "ooh, photos!" : step === 2 ? "home soon!" : undefined });
    }, 750);
    return () => clearTimeout(timer);
  }, [step, still]);

  const show = (i: number) => (i < current || (i === current && !typing) ? "true" : "false");

  return (
    <section
      data-pup-scene
      data-tone="light"
      className="tp-scene tp-chat"
      style={{ "--sky-top": "#f7d18d", "--sky-bottom": "#f0b866" } as React.CSSProperties}
      aria-labelledby="journey-title"
    >
      <div className="tp-chat__grid gutter">
        <div className="tp-chat__story">
          <h2 id="journey-title" className="font-plush text-huge">
            Your puppy journey
          </h2>
          <p className="text-lede mt-5 max-w-[42ch] text-[var(--ink-soft)]">
            A premium, step-by-step concierge experience. We make adoption simple, secure, and purely joyful.
          </p>
          <ol ref={stepsRef} className="tp-chat__steps">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="tp-chat__step"
                data-done={i < current || undefined}
                data-active={i === current || undefined}
              >
                <span className="tp-chat__num font-plush" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="font-plush tp-chat__title">{step.title}</h3>
                <p className="tp-chat__text">{step.text}</p>
              </li>
            ))}
          </ol>
          <Link className="btn btn-ghost tp-chat__cta" href="/how-it-works">
            How it works
          </Link>
        </div>
        <div className="tp-chat__side">
          <div ref={phoneRef} className="tp-phone" aria-label={`A WhatsApp conversation with ${site.name}`} role="group">
            <div className="tp-phone__bar">
              <Image src="/brand/logo.png" alt="" width={40} height={40} className="tp-phone__avatar" />
              <span>
                <span className="tp-phone__name">{site.name}</span>
                <span className="tp-phone__status">{typing ? "typing…" : "online"}</span>
              </span>
            </div>
            <div className="tp-phone__screen">
              <p className="tp-msg tp-msg--me">Hi TeddyPups! I&apos;d love to know more about your puppies.</p>
              <div className="tp-msg-group" data-step={0} data-show={show(0)}>
                <div className="tp-msg tp-msg--them">
                  <p>{steps[0].text}</p>
                  <ul className="tp-chips" aria-label="Breeds we have now">
                    {breeds.map((breed) => (
                      <li key={breed.slug}>
                        <Link href={`/puppies?breed=${breed.slug}`}>{breed.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="tp-msg-group" data-step={1} data-show={show(1)}>
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <div className="tp-snaps">
                    {showroomPhotos.map((photo) => (
                      <span key={photo.url} className="tp-snaps__one">
                        <Image
                          src={photo.url}
                          alt={photo.alt}
                          fill
                          sizes="9rem"
                          className="object-cover"
                          style={coverStyle(photo)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <Clip video={showroomVideo} />
                </div>
                <p className="tp-msg tp-msg--them">{steps[1].text}</p>
              </div>
              <div className="tp-msg-group" data-step={2} data-show={show(2)}>
                <div className="tp-msg tp-msg--them">
                  <p>{steps[2].text}</p>
                  <svg viewBox="0 0 220 70" className="tp-route" aria-hidden="true">
                    <path d="M14 52 C 60 6, 120 70, 170 28" className="tp-route__line" />
                    <circle cx="14" cy="52" r="5" className="tp-route__dot" />
                    <path d="M164 32 l12 -12 l12 12 v14 h-24 z" className="tp-route__home" />
                    <path d="M176 42 c-2-3-7-2-6 2c1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2z" className="tp-route__heart" />
                    <path d={pawPath} transform="translate(70 22) scale(.3) rotate(70 32 32)" className="tp-route__paw" />
                    <path d={pawPath} transform="translate(104 38) scale(.3) rotate(100 32 32)" className="tp-route__paw" />
                  </svg>
                </div>
              </div>
              <p className="tp-typing" data-show={typing ? "true" : "false"} aria-hidden="true">
                <span />
                <span />
                <span />
              </p>
            </div>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="tp-phone__compose">
              <span>Say hello on WhatsApp</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </a>
          </div>
          {teddy}
        </div>
      </div>
    </section>
  );
}
