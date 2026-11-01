import Link from "next/link";
import { Teddy } from "@/components/teddy";
import { familyPhotos, testimonial } from "@/data/happy-families";
import { FamilyWall } from "./family-wall";

// As on the reference home, captioned photos come first, then the rest in page order.
const photos = [...familyPhotos.filter((p) => p.caption), ...familyPhotos.filter((p) => !p.caption)];

export function HappyFamilies() {
  return (
    <section
      data-tone="dark"
      className="tp-scene tp-dusk"
      style={{ "--sky-top": "#a65a30", "--sky-bottom": "#4d2b19" } as React.CSSProperties}
      aria-labelledby="dusk-title"
    >
      <div className="tp-dusk__sky gutter">
        <div className="tp-dusk__head">
          <h2 id="dusk-title" className="font-plush text-huge">
            Happy families &amp; puppies
          </h2>
          <p className="text-lede mt-5 max-w-[50ch] text-[var(--ink-soft)]">
            We are truly honored to see our puppies become cherished members of loving families. These heartwarming
            moments have been shared by our valued clients who welcomed a Teddy Pup into their homes and hearts.
          </p>
        </div>
        <figure className="tp-dusk__note">
          <blockquote className="font-plush-text">“{testimonial.quote}”</blockquote>
          <figcaption className="font-scrawl">
            {testimonial.name}, {testimonial.place}
          </figcaption>
        </figure>
      </div>
      <div className="tp-photowall">
        <div className="tp-photowall__wall">
          <FamilyWall photos={photos} />
          <div className="tp-facade__ground">
            <span aria-hidden="true" className="tp-facade__door" />
            <span aria-hidden="true" className="tp-lamp">
              <span className="tp-lamp__light" />
            </span>
            <Link className="btn btn-primary tp-facade__cta" href="/happy-families">
              See every happy family
            </Link>
            <Teddy pose="sit" className="tp-dusk__teddy" />
          </div>
        </div>
        <div aria-hidden="true" className="tp-street__pavement" />
      </div>
    </section>
  );
}
