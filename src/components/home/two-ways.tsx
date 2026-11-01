import Image, { getImageProps } from "next/image";
import Link from "next/link";
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
            <div className="tp-way__scene">
              <svg viewBox="0 0 300 120" className="tp-way__skyline" aria-hidden="true">
                <path
                  d="M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
            <div className="tp-way__scene">
              <div className="tp-flight">
                <svg viewBox="0 0 660 300" role="img" aria-label={`A plane bringing a ${flyer.breed} puppy from Korea to Dubai`}>
                  <defs>
                    <clipPath id="tp-flight-porthole">
                      <circle r="25" />
                    </clipPath>
                  </defs>
                  <path d="M40 250 C 170 40, 470 20, 620 168" className="tp-flight__route" />
                  <circle cx="40" cy="250" r="7" className="tp-flight__dot" />
                  <circle cx="620" cy="168" r="7" className="tp-flight__dot" />
                  <text x="40" y="284" textAnchor="middle" className="tp-flight__label">
                    Korea
                  </text>
                  <text x="620" y="202" textAnchor="middle" className="tp-flight__label">
                    Dubai
                  </text>
                  <g transform="translate(410 70)">
                    <g transform="translate(-126 -78)">
                      <path d="M28 60 L8 26 L34 26 L60 54 Z" className="tp-flight__wing" />
                      <path d="M108 112 L142 156 L172 156 L158 112 Z" className="tp-flight__wing tp-flight__wing--far" />
                      <path
                        d="M20 80 C20 52 52 44 80 44 L168 44 C200 44 224 60 232 80 C224 100 200 112 168 112 L80 112 C52 112 20 104 20 80 Z"
                        className="tp-flight__body"
                      />
                      <path d="M104 44 L138 2 L168 2 L154 44 Z" className="tp-flight__wing" />
                      <path d="M206 64 C215 67 221 73 224 80" className="tp-flight__line" />
                    </g>
                    <g transform="translate(10 2)">
                      <image
                        href={flyerPhoto.src}
                        x="-25"
                        y="-25"
                        width="50"
                        height="50"
                        clipPath="url(#tp-flight-porthole)"
                        preserveAspectRatio="xMidYMid slice"
                      />
                      <circle r="25" className="tp-flight__porthole" />
                    </g>
                  </g>
                </svg>
              </div>
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
