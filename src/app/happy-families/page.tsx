import Image from "next/image";
import { RevealScope } from "@/components/reveal-scope";
import { FamilyPhotoWall } from "@/components/happy-families/family-photo-wall";
import { familyPhotos, testimonial } from "@/data/happy-families";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/happy-families",
  "Happy families",
  "Real photos shared by TeddyPups families after welcoming their new puppy home.",
);

export default function HappyFamiliesPage() {
  return (
    <RevealScope>
      <section aria-labelledby="families-title" className="tp-memories">
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <div className="tp-memories__head">
            <div>
              <p className="font-scrawl text-lg text-toffee-ink" data-reveal>
                our wall of happy endings</p>
              <h1 id="families-title" className="font-plush text-giant tp-memories__title" data-reveal>
                Happy families
                <svg viewBox="0 0 48 44" className="tp-memories__heart" aria-hidden="true">
                  <path
                    d="M24 40C10 30 4 22 4 14.5 4 8.7 8.6 4 14.3 4c4.1 0 7.6 2.4 9.7 6 2.1-3.6 5.6-6 9.7-6C39.4 4 44 8.7 44 14.5 44 22 38 30 24 40z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </h1>
              <p className="text-lede mt-6 max-w-[50ch] text-cocoa-soft" data-reveal>
                Nothing makes us happier than seeing our puppies in loving homes! Here are some beautiful moments shared by
                our amazing clients after welcoming their furry friends.
              </p>
              <p className="font-scrawl mt-5 text-lg text-toffee-ink" data-reveal>{familyPhotos.length} moments and counting</p>
            </div>
            <figure className="tp-memories__note" data-reveal>
              <span aria-hidden="true" className="tp-tape tp-tape--center" style={{ "--tape": "#cfe5f6" } as React.CSSProperties} />
              <blockquote className="font-plush-text">“{testimonial.quote}”</blockquote>
              <figcaption className="font-scrawl">
                {testimonial.name}, {testimonial.place}
              </figcaption>
            </figure>
          </div>
          <div className="mt-16 md:mt-20">
            <FamilyPhotoWall photos={familyPhotos} />
          </div>
          <div className="tp-memories__foot">
            {/* Mirrored to face the wall. Not a <Teddy> resting spot, which would hide on small screens. */}
            <Image
              src="/teddy/sit.svg"
              alt="Teddy, admiring the wall"
              width={300}
              height={240}
              unoptimized
              className="h-auto w-36 -scale-x-100 md:w-44"
            />
            <p className="font-scrawl text-lg text-cocoa-soft">every one of them was a Teddy Pup once</p>
          </div>
        </div>
      </section>
    </RevealScope>
  );
}
