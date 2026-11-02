"use client";

import { type ComponentProps, useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { Paw } from "@/components/paw";
import { type EnquiryState, sendEnquiry } from "@/lib/send-enquiry";

// An inline blank in the letter, sized in characters like the reference.
function Blank({
  name,
  label,
  error,
  size = 14,
  ...input
}: ComponentProps<"input"> & { name: string; label: string; error?: string; size?: number }) {
  return (
    <span className="tp-blank" style={{ "--size": `${size}ch` } as React.CSSProperties}>
      <input
        name={name}
        aria-label={label}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${name}-err` : undefined}
        {...input}
      />
    </span>
  );
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "writing" | "sealing" | "posting" | "sent";

// The /contact letter. On success it folds into an envelope, drops into the postbox and
// swaps for the sent card, with the reference timings: sealing at 0, posting at 750 ms,
// sent at 1750 ms. The container keeps its height until then so the page doesn't jump.
export function LetterForm({
  puppies,
  whatsappHref,
}: {
  puppies: { slug: string; label: string }[];
  whatsappHref: string;
}) {
  const [state, dispatch, actionPending] = useActionState<EnquiryState, FormData>(sendEnquiry, { ok: false });
  const [transitionPending, startTransition] = useTransition();
  const pending = actionPending || transitionPending;
  // A letter posted before hydration comes back already sent, so it skips the animation.
  const [postedEarly] = useState(state.ok);
  const [phase, setPhase] = useState<Phase>(postedEarly ? "sent" : "writing");
  const [minHeight, setMinHeight] = useState<number>();
  const postRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const selectId = useId();
  const noteId = useId();

  useEffect(() => {
    if (!state.ok || postedEarly) return;
    const timers = reducedMotion()
      ? [setTimeout(() => setPhase("sent"), 0)]
      : [
          setTimeout(() => {
            setMinHeight(postRef.current?.offsetHeight);
            setPhase("sealing");
          }, 0),
          setTimeout(() => setPhase("posting"), 750),
          setTimeout(() => {
            setMinHeight(undefined);
            setPhase("sent");
          }, 1750),
        ];
    return () => timers.forEach(clearTimeout);
  }, [state.ok, postedEarly]);

  // Focus the sent card, scrolling it out from under the sticky header if needed.
  useEffect(() => {
    const card = sentRef.current;
    if (phase !== "sent" || !card) return;
    card.focus({ preventScroll: true });
    const top = card.getBoundingClientRect().top;
    const header = 16 * parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
    if (top < header + 8) scrollBy({ top: top - header - 24, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [phase]);

  // Each failed submit returns a new state object, so focus moves on every attempt.
  useEffect(() => {
    if (!state.ok && state.errors) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  const errors = state.errors ?? {};
  const errorList = Object.entries(errors);
  return (
    <div ref={postRef} className="tp-post" data-phase={phase} style={{ minHeight }}>
      {phase !== "sent" && (
        <form
          ref={formRef}
          // Before hydration this posts to the server action, so details never land in the URL.
          // Once hydrated, onSubmit runs the action in a transition, keeping the letter filled in on errors.
          action={dispatch}
          noValidate
          className="tp-letterform"
          aria-hidden={phase !== "writing" || undefined}
          inert={phase !== "writing"}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => dispatch(data));
          }}
        >
          <span aria-hidden="true" className="tp-letter__stamp">
            <Paw className="size-9" />
          </span>
          <p className="font-scrawl tp-letterform__greeting">Dear TeddyPups,</p>
          {state.message && !state.ok && (
            <div role="alert" className="tp-letterform__alert">
              <p className="font-semibold">{state.message}</p>
              {errorList.length > 0 && (
                <ul>
                  {errorList.map(([field, message]) => (
                    <li key={field} id={`${field}-err`}>
                      {message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="tp-letterform__line">
            my name is{" "}
            <Blank
              name="name"
              label="Your name (required)"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              size={16}
              error={errors.name}
            />
            , and you can reach me on{" "}
            <Blank
              name="phone"
              label="Phone or WhatsApp number with country code (required)"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              size={15}
              placeholder="+971 50 123 4567"
              error={errors.phone}
            />{" "}
            or by email at{" "}
            <Blank
              name="email"
              label="Email (optional)"
              type="email"
              autoComplete="email"
              size={20}
              placeholder="optional"
              error={errors.email}
            />
            .
          </p>
          <p className="tp-letterform__line">
            I live in{" "}
            <Blank
              name="area"
              label="Your area (optional)"
              autoComplete="address-level2"
              maxLength={80}
              size={13}
              placeholder="e.g. Dubai Marina"
              error={errors.area}
            />
            , and I&apos;m curious about{" "}
            <span className="tp-blank tp-blank--select">
              <label htmlFor={selectId} className="sr-only">
                Puppy you&apos;re interested in (optional)
              </label>
              <select id={selectId} name="puppy" defaultValue="">
                <option value="">any puppy (not sure yet)</option>
                {puppies.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.label}
                  </option>
                ))}
              </select>
            </span>
            .
          </p>
          <label htmlFor={noteId} className="sr-only">
            Your message (optional)
          </label>
          <textarea
            id={noteId}
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="Anything else you'd like to tell us…"
            className="tp-letterform__note"
            aria-invalid={!!errors.message || undefined}
            aria-describedby={errors.message ? "message-err" : undefined}
          />
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <div className="tp-letterform__sign">
            <p className="font-scrawl">with love, a future puppy parent</p>
            <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-70">
              {pending ? "Sealing the envelope…" : "Post my letter"}
            </button>
          </div>
        </form>
      )}
      {(phase === "sealing" || phase === "posting") && (
        <div aria-hidden="true" className="tp-post__scene">
          <svg viewBox="0 0 160 112" className="tp-post__envelope">
            <rect x="4" y="18" width="152" height="90" rx="6" fill="#fffdf8" stroke="#2a170e" strokeWidth="4" />
            <path d="M6 104 64 62M154 104 96 62" fill="none" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" />
            <path
              className="tp-post__flap"
              d="M6 22 80 74 154 22"
              fill="#fbe3b4"
              stroke="#2a170e"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="80" cy="72" r="11" fill="#a24a1a" stroke="#2a170e" strokeWidth="3" />
          </svg>
          <svg viewBox="0 0 200 260" className="tp-post__box">
            <rect x="86" y="170" width="28" height="86" fill="#5a3a28" stroke="#2a170e" strokeWidth="4" />
            <path
              d="M30 70a70 54 0 0 1 140 0v104H30z"
              fill="#c2622b"
              stroke="#2a170e"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <rect x="58" y="86" width="84" height="14" rx="7" fill="#2a170e" />
            <path d="M44 128h112" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" opacity=".35" />
            <g className="tp-post__flag">
              <path d="M170 120V64" stroke="#2a170e" strokeWidth="5" strokeLinecap="round" />
              <path d="M170 64h22v16h-22" fill="#f2be6b" stroke="#2a170e" strokeWidth="4" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      )}
      {phase === "sent" && (
        <div ref={sentRef} tabIndex={-1} role="status" className="tp-post__sent">
          <svg viewBox="0 0 200 150" aria-hidden="true" className="tp-post__box tp-post__box--sent">
            <rect x="86" y="96" width="28" height="52" fill="#5a3a28" stroke="#2a170e" strokeWidth="4" />
            <path
              d="M30 50a70 44 0 0 1 140 0v52H30z"
              fill="#c2622b"
              stroke="#2a170e"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <rect x="58" y="58" width="84" height="12" rx="6" fill="#2a170e" />
            <path d="M170 92V22" stroke="#2a170e" strokeWidth="5" strokeLinecap="round" />
            <path d="M170 22h22v16h-22" fill="#f2be6b" stroke="#2a170e" strokeWidth="4" strokeLinejoin="round" />
          </svg>
          <p className="font-plush mt-4 text-[2rem]">Message received!</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-cocoa-soft">
            Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">
            WhatsApp us
          </a>
        </div>
      )}
    </div>
  );
}
