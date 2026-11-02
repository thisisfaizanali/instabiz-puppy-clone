import Image from "next/image";
import { Paw } from "@/components/paw";
import { showroomPhotos } from "@/data/showroom";
import { coverStyle } from "@/lib/media";
import { site } from "@/lib/site";

// WhatsApp, phone and email, then the showroom card under its striped awning.
export function Shopfront() {
  const photo = showroomPhotos[3];
  return (
    <>
      <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full sm:w-auto">
        WhatsApp {site.phone.display}
      </a>
      <dl className="mt-10 space-y-6">
        <div>
          <dt className="font-scrawl text-[var(--ink-soft)]">call us</dt>
          <dd className="mt-1 text-lg font-semibold">
            <a className="link-ink" href={site.phone.href}>
              {site.phone.display}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-scrawl text-[var(--ink-soft)]">email</dt>
          <dd className="mt-1 break-all text-lg font-semibold">
            <a className="link-ink" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </dd>
        </div>
      </dl>
      <section aria-labelledby="visit-title" className="tp-shopfront mt-12">
        <svg viewBox="0 0 300 120" className="absolute -bottom-1 right-0 w-3/4 text-toffee/30" aria-hidden="true">
          <path
            d="M4 116h292M20 116V78h16v38M44 116V60h18v56M70 116V84h12v32M150 116V36l4-6v-14l3-4 3 4v14l4 6v80M118 116V70l12-8v54M174 116V64l14 8v44M200 116V82h18v34M226 116V56h14v60M248 116V88h22v28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="tp-visit relative p-7 pt-6">
          <div>
            <h2 id="visit-title" className="font-plush text-[2rem] leading-tight">
              Visit us in Downtown Dubai
            </h2>
            <p className="mt-3 max-w-[38ch] text-cocoa-soft">
              Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face.
            </p>
            <p className="mt-4 flex items-center gap-2 font-semibold">
              <Paw className="size-5 shrink-0 text-toffee-deep" />
              {site.address}
            </p>
            <a href={site.mapsHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-6 !bg-milk">
              Open in Google Maps
            </a>
          </div>
          <figure className="tp-visit__photo">
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              sizes="(min-width: 640px) 11rem, 90vw"
              className="object-cover"
              style={coverStyle(photo)}
            />
          </figure>
        </div>
      </section>
    </>
  );
}
