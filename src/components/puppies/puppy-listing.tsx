"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { PupBuddy } from "@/components/pup-buddy";
import { PuppySketch } from "@/components/puppy-sketch";
import { getPuppies } from "@/lib/puppies";
import { whatsappLink } from "@/lib/site";
import { usePuppyFilters } from "./puppy-filters";

const spring = { type: "spring", stiffness: 260, damping: 26 } as const;
const hidden = { opacity: 0, scale: 0.86 };
const noSubscription = () => () => {};

const askHref = whatsappLink("Hi TeddyPups! I'm looking for a puppy — what do you have at the moment?");

// Count line, then the matching sketches or, when nothing matches, Teddy's empty state.
export function PuppyListing() {
  const { filters, filtered, clear } = usePuppyFilters();
  const results = getPuppies(filters);
  // The server HTML and hydration keep the plain list, so it shows without JS. Once hydrated, the cards
  // come in with a spring and later filter changes enter, leave and reflow the same way.
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);
  const sketches = results.map((puppy, i) => ({ puppy, card: <PuppySketch puppy={puppy} index={i} preload={i < 3} /> }));
  return (
    <>
      <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">
        {results.length === 1 ? "1 puppy" : `${results.length} puppies`} {filtered ? "match" : "looking for a home"}
      </p>
      {results.length ? (
        hydrated ? (
          <motion.ul layout className="tp-sketches mt-8">
            <AnimatePresence mode="popLayout">
              {sketches.map(({ puppy, card }) => (
                <motion.li
                  key={puppy.slug}
                  layout
                  initial={hidden}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ ...hidden, transition: { duration: 0.2 } }}
                  transition={spring}
                >
                  {card}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <ul className="tp-sketches mt-8">
            {sketches.map(({ puppy, card }) => (
              <li key={puppy.slug}>{card}</li>
            ))}
          </ul>
        )
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <PupBuddy pose="sit" act="tilt" className="mx-auto w-44 md:w-52" label="Teddy, tilting his head" />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="mt-3 max-w-[48ch] text-cocoa-soft">
              Tell us what you&apos;re hoping for and we&apos;ll let you know what&apos;s in our showroom or what we can bring in for
              you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={askHref} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                Ask on WhatsApp
              </a>
              <button type="button" onClick={clear} className="btn btn-ghost">
                Show all puppies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
