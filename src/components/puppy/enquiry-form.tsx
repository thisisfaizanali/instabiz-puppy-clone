"use client";

import { motion } from "motion/react";
import { type ComponentProps, useActionState, useEffect, useId, useRef, useTransition } from "react";
import { type EnquiryState, sendEnquiry } from "@/lib/send-enquiry";

const inputClass =
  "mt-1.5 h-12 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 text-base outline-none transition-[border-color,box-shadow] focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)] aria-[invalid=true]:border-[#b3261e]";

function Field({ label, error, hint, ...input }: ComponentProps<"input"> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[0.95rem] font-semibold">
        {label}
        {input.required ? (
          <span className="text-toffee-ink"> *</span>
        ) : (
          <span className="font-normal text-cocoa-soft"> (optional)</span>
        )}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={inputClass}
        {...input}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-cocoa-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

// The enquiry form from a puppy page. On success it swaps for the "Message received!" card,
// as on the reference. The action and validation are shared, so other enquiry forms can
// reuse them.
export function EnquiryForm({
  puppy,
  whatsappHref,
}: {
  // Slug, and the label used in the prefilled message, e.g. "Leo (Poodle)".
  puppy: { slug: string; label: string };
  whatsappHref: string;
}) {
  const [state, dispatch, actionPending] = useActionState<EnquiryState, FormData>(sendEnquiry, { ok: false });
  const [transitionPending, startTransition] = useTransition();
  const pending = actionPending || transitionPending;
  const formRef = useRef<HTMLFormElement>(null);
  const messageId = useId();

  // Each failed submit returns a new state object, so focus moves on every attempt.
  useEffect(() => {
    if (!state.ok && state.errors) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  const errors = state.errors ?? {};
  return (
    <>
      {!state.ok && (
        <form
          ref={formRef}
          // Before hydration this posts to the server action, so details never land in the URL.
          // Once hydrated, onSubmit takes over and the action runs in a transition instead,
          // which keeps the fields filled in when the server returns errors.
          action={dispatch}
          noValidate
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => dispatch(data));
          }}
        >
          {state.message && !state.ok && (
            <p role="alert" className="rounded-2xl bg-blush px-4 py-3 font-semibold">
              {state.message}
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" name="name" autoComplete="name" required minLength={2} maxLength={80} error={errors.name} />
            <Field
              label="Phone or WhatsApp"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              error={errors.phone}
              hint="With country code, e.g. +971 50 123 4567"
            />
            <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
            <Field
              label="Your area"
              name="area"
              autoComplete="address-level2"
              maxLength={80}
              error={errors.area}
              hint="e.g. Dubai Marina"
            />
          </div>
          <input type="hidden" name="puppy" value={puppy.slug} />
          <div>
            <label htmlFor={messageId} className="block text-[0.95rem] font-semibold">
              Message <span className="font-normal text-cocoa-soft">(optional)</span>
            </label>
            <textarea
              id={messageId}
              name="message"
              rows={4}
              maxLength={2000}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? `${messageId}-err` : undefined}
              className="mt-1.5 w-full rounded-2xl border-2 border-cocoa/60 bg-milk px-4 py-3 text-base outline-none focus:border-cocoa focus:shadow-[0_0_0_4px_rgb(242_190_107/0.6)] aria-[invalid=true]:border-[#b3261e]"
              defaultValue={`Hi! I'd love to know more about ${puppy.label}.`}
            />
            {errors.message && (
              <p id={`${messageId}-err`} className="mt-1 text-sm font-semibold text-[#b3261e]">
                {errors.message}
              </p>
            )}
          </div>
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
            {pending ? "Sending…" : "Send enquiry"}
          </button>
        </form>
      )}
      {state.ok && (
        <motion.div
          role="status"
          tabIndex={-1}
          // The submit button is gone once this shows, so focus lands here instead of the document.
          ref={(el) => el?.focus()}
          // The "Message received!" card flips down into place.
          initial={{ rotateX: -80, opacity: 0, y: -10 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 16 }}
          className="tp-sent rounded-[2rem] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-cocoa border-[3px] border-cocoa bg-honey p-8 text-center">
          <svg viewBox="0 0 120 84" className="tp-envelope mx-auto w-32" aria-hidden="true">
            <path d="M6 10h108v68H6z" fill="#fffdf8" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
            <path d="M6 10l54 40 54-40" fill="none" stroke="#2a170e" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="94" cy="62" r="12" fill="#c2622b" stroke="#2a170e" strokeWidth="2.5" />
          </svg>
          <p className="font-plush mt-4 text-[2rem]">Message received!</p>
          <p className="mx-auto mt-2 max-w-[38ch] text-cocoa-soft">
            Thank you — our team will get back to you promptly. For the quickest reply, message us on WhatsApp.
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">
            WhatsApp us
          </a>
        </motion.div>
      )}
    </>
  );
}
