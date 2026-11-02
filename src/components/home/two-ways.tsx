import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { Flight, Skyline } from "@/components/flight";
import { Teddy } from "@/components/teddy";
import { showroomPhotos } from "@/data/showroom";
import { coverStyle } from "@/lib/media";
import { getPuppies } from "@/lib/puppies";

export function TwoWays() {
  const showroom = showroomPhotos[0];
  const flyer = getPuppies({ origin: "imported" }).find((p) => (p.collections as string[]).includes("korean-teacup"))!;
  const { props: flyerPhoto } = getImageProps({ src: flyer.media[0].url, alt: "", width: 50, height: 50 });
  return (
    <section
      data-pup-scene
      data-tone="light"
      className="tp-scene tp-paths"
      style={{ "--sky-top": "#fbe3b4", "--sky-bottom": "#f7d18d" } as React.CSSProperties}
      aria-labelledby="paths-title"
    >
      <div className="gutter mx-auto max-w-[110rem]">
        <h2 id="paths-title" className="tp-paths__title font-plush text-huge">
          Two ways to meet your puppy
        </h2>
        <div className="tp-fork">
          <div aria-hidden="true" className="tp-fork__post" />
          <article className="tp-way tp-way--left" aria-labelledby="way-local">
            <h3 id="way-local" className="tp-sign tp-sign--left font-plush">
              Puppies in Dubai
            </h3>
            <div className="tp-way__scene" data-pup-look>
              <Skyline className="tp-way__skyline" />
              <figure className="tp-window">
                <span className="tp-window__glass">
                  <Image
                    src={showroom.url}
                    alt={showroom.alt}
                    fill
                    sizes="(min-width: 1024px) 16rem, 60vw"
                    className="object-cover"
                    style={coverStyle(showroom)}
                  />
                </span>
                <figcaption className="font-scrawl">In our showroom</figcaption>
              </figure>
            </div>
            <p className="tp-way__text">
              See them, love them, take them home. Come meet our locally available puppies before you decide.
            </p>
            <Link className="btn btn-primary" href="/puppies?origin=local">
              Meet local puppies
            </Link>
          </article>
          <article className="tp-way tp-way--right" aria-labelledby="way-imported">
            <h3 id="way-imported" className="tp-sign tp-sign--right font-plush">
              Imported for you
            </h3>
            <div className="tp-way__scene" data-pup-look>
              <Flight label={`A plane bringing a ${flyer.breed} puppy from Korea to Dubai`} photo={flyerPhoto.src} />
            </div>
            <p className="tp-way__text">
              Exclusive Korean teacup puppies, delivered. Order from the world&apos;s most reputable breeders and let
              us handle the import.
            </p>
            <Link className="btn btn-primary" href="/puppies?origin=imported">
              See imported puppies
            </Link>
          </article>
          <Teddy pose="sit" className="tp-fork__teddy" />
        </div>
      </div>
    </section>
  );
}
