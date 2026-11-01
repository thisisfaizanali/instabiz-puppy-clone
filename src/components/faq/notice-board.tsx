"use client";

import Image from "next/image";
import { Fragment, useId, useState } from "react";
import { AccordionItem } from "@/components/accordion";
import type { FaqItem } from "@/lib/types";

// Tilts and pin colours cycle down the board, as on the reference.
const tilts = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.7, -1.9, 1.4];
const pins = ["var(--color-toffee)", "var(--color-sky-deep)", "#d9a13c", "#c45a6a"];

// Stable ids from the question text, so the accordion's aria wiring survives reordering.
const faqId = (question: string) =>
  question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>));
}

export function NoticeBoard({ faqs, askHref }: { faqs: FaqItem[]; askHref: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const inputId = useId();
  const q = query.trim().toLowerCase();
  const notes = faqs
    .map((faq) => ({ ...faq, id: faqId(faq.question) }))
    .filter((faq) => !q || `${faq.question} ${faq.answer}`.toLowerCase().includes(q));

  return (
    <div className="tp-notes" data-open={openId || q ? "" : undefined}>
      <aside className="tp-notes__side" aria-label="Find a question">
        <label htmlFor={inputId} className="font-scrawl tp-notes__label">
          sniff out a question
        </label>
        <div className="tp-notes__search">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="tp-notes__lens">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="delivery, Korea, vaccinated…"
            autoComplete="off"
          />
        </div>
        <p className="tp-notes__count" aria-live="polite">
          {query.trim()
            ? `${notes.length} ${notes.length === 1 ? "note" : "notes"} found`
            : `${faqs.length} notes on the board`}
        </p>
        <div className="tp-notes__teddy">
          <span aria-hidden="true" className="tp-notes__bubble font-plush">
            <span className="tp-notes__q">?</span>
            <span className="tp-notes__a">!</span>
          </span>
          <Image src="/teddy/sit.svg" alt="Teddy, reading the notes" width={300} height={240} unoptimized className="block h-auto w-full" />
        </div>
        <a href={askHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp tp-notes__ask">
          Ask your own question
        </a>
      </aside>
      <div className="tp-notes__board">
        <ul className="tp-notes__list">
          {notes.map((note, i) => {
            // A search unfolds every note whose answer matches, on top of the one picked by hand.
            const open = openId === note.id || (!!q && note.answer.toLowerCase().includes(q));
            return (
              <li
                key={note.id}
                className="tp-note"
                data-unfolded={open || undefined}
                style={
                  { "--tilt": `${tilts[i % tilts.length]}deg`, "--pin": pins[i % pins.length] } as React.CSSProperties
                }
              >
                <span aria-hidden="true" className="tp-note__pin" />
                <AccordionItem
                  id={note.id}
                  open={open}
                  onToggle={() => setOpenId(openId === note.id ? null : note.id)}
                  className={{ heading: "tp-note__q", answer: "tp-note__answer" }}
                  summary={
                    <>
                      <span className="font-plush-text">
                        <Highlight text={note.question} query={query} />
                      </span>
                      <span aria-hidden="true" className="tp-note__chevron" />
                    </>
                  }
                >
                  <div className="tp-note__flap">
                    <p>
                      <Highlight text={note.answer} query={query} />
                    </p>
                  </div>
                </AccordionItem>
              </li>
            );
          })}
        </ul>
        {!notes.length && (
          <div className="tp-note tp-note--empty">
            <span aria-hidden="true" className="tp-note__pin" />
            <p className="font-plush-text text-[1.2rem] font-bold">No note about “{query.trim()}” yet.</p>
            <p className="mt-2">
              <a href={askHref} target="_blank" rel="noopener noreferrer" className="link-ink">
                Ask us on WhatsApp
              </a>{" "}
              and we&apos;ll answer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
