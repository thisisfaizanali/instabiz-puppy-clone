import Image from "next/image";
import Link from "next/link";
import { Teddy } from "@/components/teddy";
import { coverStyle } from "@/lib/media";
import { getPuppies } from "@/lib/puppies";
import { site } from "@/lib/site";

export function ClosingCta() {
  const [waiting] = getPuppies();
  const cover = waiting.media[0];
  return (
    <section
      data-tone="dark"
      className="tp-scene tp-home"
      style={{ "--sky-top": "#2f1a10", "--sky-bottom": "#24130b" } as React.CSSProperties}
      aria-labelledby="cta-title"
    >
      <div className="tp-home__copy gutter">
        <h2 id="cta-title" className="font-plush text-huge">
          Ready to meet your new best friend?
        </h2>
        <p className="tp-home__lede">
          Bring home a healthy, happy teacup or designer puppy with expert guidance every step of the way. We help you
          find the right match and ensure a smooth, safe delivery across the UAE.
        </p>
      </div>
      <div className="tp-house">
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--left" />
        <span aria-hidden="true" className="tp-house__lamp" />
        <div className="tp-house__doorway">
          <span className="tp-house__inside">
            <Image
              src={cover.url}
              alt={`${waiting.displayName}, waiting inside`}
              fill
              sizes="16rem"
              className="object-cover"
              style={coverStyle(cover)}
            />
          </span>
          <span aria-hidden="true" className="tp-house__door">
            <span className="tp-house__peep" />
            <span className="tp-house__knob" />
          </span>
        </div>
        <span aria-hidden="true" className="tp-house__plant tp-house__plant--right" />
        <span aria-hidden="true" className="tp-house__mat font-scrawl">
          welcome home
        </span>
        <Teddy pose="bow" className="tp-house__teddy" />
      </div>
      <div className="tp-home__actions gutter">
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          Enquire on WhatsApp
        </a>
        <Link className="btn btn-ghost tp-home__ghost" href="/contact">
          Visit &amp; contact
        </Link>
      </div>
    </section>
  );
}
