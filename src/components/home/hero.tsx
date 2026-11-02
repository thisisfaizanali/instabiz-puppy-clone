import Link from "next/link";
import { Teddy } from "@/components/teddy";
import { getPuppies } from "@/lib/puppies";
import { site } from "@/lib/site";
import { type Friend, HeroLineup } from "./hero-lineup";

export function Hero() {
  const friends: Friend[] = getPuppies().map((p) => ({
    slug: p.slug,
    displayName: p.displayName,
    breed: p.breed,
    cover: p.media[0],
  }));
  return (
    <section
      data-pup-scene
      data-tone="light"
      className="tp-scene tp-hero"
      style={{ "--sky-top": "#fffdf8", "--sky-bottom": "#fff1d8", "--quilt": "#fff1d8" } as React.CSSProperties}
      aria-labelledby="hero-title"
    >
      <span aria-hidden="true" className="tp-hero__sun" />
      <div className="tp-hero__copy gutter">
        <p className="tp-hero__note font-scrawl">
          every puppy is family
          <svg
            viewBox="0 0 220 24"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-3 w-full text-toffee"
            aria-hidden="true"
          >
            <path
              d="M4 14c18-10 30 8 48-1s28-9 46 0 30 8 48-1 30-9 48 0 18 2 22 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
        <h1 id="hero-title" className="tp-hero__title font-plush">
          <span className="tp-hero__line">Premium teacup</span>
          <span className="tp-hero__line tp-hero__line--2">puppies in Dubai</span>
        </h1>
        <p className="tp-hero__lede">
          Meet your new best friend in our Dubai showroom, or order a rare miniature breed from trusted breeders
          worldwide.
        </p>
        <div className="tp-hero__actions">
          <Link className="btn btn-primary" href="/puppies">
            View available puppies
          </Link>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Enquire on WhatsApp
          </a>
        </div>
      </div>
      <div className="tp-hero__stage">
        <HeroLineup friends={friends} />
        <Teddy
          pose="peek"
          act="peekaboo"
          behind
          lane
          label="Teddy, the TeddyPups puppy, peeking over the quilt"
          className="tp-hero__teddy"
        />
        <div aria-hidden="true" className="tp-quilt">
          <svg className="tp-quilt__edge" width="100%" height="40" preserveAspectRatio="none">
            <defs>
              <pattern id="tp-scallop" width="76" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V27A38 25 0 0 1 76 27V40Z" style={{ fill: "var(--quilt)" }} />
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
            <rect width="100%" height="40" fill="url(#tp-scallop)" />
          </svg>
        </div>
      </div>
    </section>
  );
}
