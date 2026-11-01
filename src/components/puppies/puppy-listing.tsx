"use client";

import Image from "next/image";
import { PuppySketch } from "@/components/puppy-sketch";
import { getPuppies } from "@/lib/puppies";
import { whatsappLink } from "@/lib/site";
import { usePuppyFilters } from "./puppy-filters";

const askHref = whatsappLink("Hi TeddyPups! I'm looking for a puppy — what do you have at the moment?");

// Count line, then the matching sketches or, when nothing matches, Teddy's empty state.
export function PuppyListing() {
  const { filters, filtered, clear } = usePuppyFilters();
  const results = getPuppies(filters);
  return (
    <>
      <p className="font-scrawl mt-10 text-lg text-[var(--ink-soft)]" aria-live="polite">
        {results.length === 1 ? "1 puppy" : `${results.length} puppies`} {filtered ? "match" : "looking for a home"}
      </p>
      {results.length ? (
        <ul className="tp-sketches mt-8">
          {results.map((puppy, i) => (
            <li key={puppy.slug}>
              <PuppySketch puppy={puppy} preload={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="tp-sketchpad mt-10 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
          <div className="mx-auto w-44 md:w-52">
            <Image src="/teddy/sit.svg" alt="Teddy, tilting his head" width={300} height={240} unoptimized className="block h-auto w-full" />
          </div>
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
