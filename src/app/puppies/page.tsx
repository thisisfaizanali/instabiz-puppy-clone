import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { GoneHomeStrip } from "@/components/puppies/gone-home-strip";
import { PuppyFilters } from "@/components/puppies/puppy-filters";
import { PuppyListing } from "@/components/puppies/puppy-listing";
import { RevealScope } from "@/components/reveal-scope";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/puppies",
  "Available puppies",
  "Teacup and teddy bear puppies available now in Dubai and imported from trusted breeders — every listing shows real photos of the puppy.",
);

// Rendered per request so the filters and list come from the real URL in the first
// HTML, rather than a prerendered unfiltered list that swaps after hydration.
async function PuppyBrowser() {
  await connection();
  return (
    <div>
      <PuppyFilters />
      <PuppyListing />
    </div>
  );
}

export default function PuppiesPage() {
  return (
    <RevealScope>
      <section aria-labelledby="pups-title" className="tp-sketchbook">
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <div className="tp-sketchbook__head">
            <div className="tp-sketchbook__words">
              <p className="font-scrawl text-lg text-toffee-ink" data-reveal>
                from Teddy&apos;s sketchbook</p>
              <h1 id="pups-title" className="font-plush text-giant tp-sketchbook__title" data-reveal>
                Available puppies
                <svg aria-hidden="true" viewBox="0 0 400 24" preserveAspectRatio="none" className="tp-sketchbook__underline">
                  <path d="M4 15c40-9 70 5 112-2s70-9 112 0 74 8 116-1 38-4 52 1" pathLength={1} />
                </svg>
              </h1>
              <p className="tp-sketchbook__lede text-lede mt-6 max-w-[46ch] text-cocoa-soft" data-reveal>
                Every listing shows real photos of the actual puppy. Open a profile to see them all, then ask us about them on
                WhatsApp.
              </p>
            </div>
            <div className="tp-sketchbook__self" data-reveal>
              <Image
                src="/teddy/sit.svg"
                alt="Teddy, the TeddyPups puppy"
                width={300}
                height={240}
                unoptimized
                loading="eager"
                className="tp-sketchbook__teddy"
              />
              <span className="font-scrawl tp-sketchbook__caption">self-portrait</span>
            </div>
          </div>
          <div className="mt-12">
            <Suspense>
              <PuppyBrowser />
            </Suspense>
          </div>
        </div>
      </section>
      <GoneHomeStrip />
    </RevealScope>
  );
}
