import Link from "next/link";
import { PuppySketch } from "@/components/puppy-sketch";
import { getPuppies } from "@/lib/puppies";

// The first five gone-home puppies, in /gone-home order, as on the reference.
export function GoneHomeStrip() {
  return (
    <section aria-labelledby="gone-title" className="tp-gone-strip">
      <div className="gutter mx-auto flex max-w-[110rem] flex-col gap-10 md:flex-row md:items-center">
        <div className="md:w-1/3">
          <h2 id="gone-title" className="font-plush text-big">
            Already gone home
          </h2>
          <p className="mt-3 text-cocoa-soft">These puppies have found their families.</p>
          <Link className="btn btn-primary mt-6" href="/gone-home">
            See the puppies who&apos;ve gone home
          </Link>
        </div>
        <ul className="tp-gone-strip__row" aria-label="Some puppies who have gone home">
          {getPuppies({ status: "gone-home" })
            .slice(0, 5)
            .map((puppy, i) => (
              <li key={puppy.slug}>
                <PuppySketch puppy={puppy} index={i} sizes="9rem" small />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
