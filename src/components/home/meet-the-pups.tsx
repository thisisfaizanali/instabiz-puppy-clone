import Link from "next/link";
import { PuppyCard } from "@/components/puppy-card";
import { Teddy } from "@/components/teddy";
import { getPuppies } from "@/lib/puppies";

export function MeetThePups() {
  return (
    <section
      data-tone="light"
      className="tp-scene tp-meet"
      style={{ "--sky-top": "#fff1d8", "--sky-bottom": "#fbe3b4" } as React.CSSProperties}
      aria-labelledby="meet-title"
    >
      <div className="tp-meet__stage">
        <header className="tp-meet__head gutter">
          <div>
            <h2 id="meet-title" className="font-plush text-huge">
              Meet the pups
            </h2>
            <p className="text-lede mt-3 max-w-[44ch] text-[var(--ink-soft)]">
              Real puppies, real photos, looking for their families right now.
            </p>
          </div>
          <Link className="btn btn-primary shrink-0" href="/puppies">
            See all available puppies
          </Link>
        </header>
        <div className="tp-meet__hall">
          <ol className="tp-meet__track" aria-label="Puppies looking for a family">
            {getPuppies().map((puppy, i) => (
              <PuppyCard key={puppy.slug} puppy={puppy} index={i} />
            ))}
            <li className="tp-door tp-door--all">
              <Link className="tp-door__link" href="/puppies">
                <span className="tp-door__frame tp-door__frame--all">
                  <span className="font-plush tp-door__all">Meet them all</span>
                </span>
              </Link>
            </li>
          </ol>
          <Teddy pose="sit" className="tp-meet__teddy" />
        </div>
      </div>
    </section>
  );
}
