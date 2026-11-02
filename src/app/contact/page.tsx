import Image from "next/image";
import { LetterForm } from "@/components/contact/letter-form";
import { Shopfront } from "@/components/contact/shopfront";
import { pageMetadata } from "@/lib/metadata";
import { getPuppies } from "@/lib/puppies";
import { site } from "@/lib/site";
import type { Puppy } from "@/lib/types";

export const metadata = pageMetadata(
  "/contact",
  "Visit & contact",
  "Visit TeddyPups in Downtown Dubai or get in touch on WhatsApp, by phone or email.",
);

const genderWords: Record<Puppy["gender"], string> = { male: "boy", female: "girl", "male-female": "boy & girl" };

// "Max (Maltipoo, boy)" for a named puppy, "Shih Tzu (girl)" otherwise, as on the reference.
function puppyLabel(p: Puppy) {
  const gender = genderWords[p.gender];
  return p.name ? `${p.name} (${p.breed}, ${gender})` : `${p.displayName} (${gender})`;
}

export default function ContactPage() {
  const puppies = getPuppies().map((p) => ({ slug: p.slug, label: puppyLabel(p) }));
  return (
    <div data-page="contact">
      <section
        data-tone="light"
        className="tp-scene"
        style={{ "--sky-top": "#fff9ee", "--sky-bottom": "#f9dca4" } as React.CSSProperties}
        aria-labelledby="contact-title"
      >
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 id="contact-title" className="font-plush text-giant max-w-[12ch] lg:col-span-7">
              Get in touch with us
            </h1>
            <p className="text-lede text-[var(--ink-soft)] lg:col-span-5 lg:pb-3">
              Have questions about our puppies or adoption process? Fill out the form, and our team will get back to
              you promptly. Whether ready to adopt or just seeking info, we&apos;d love to hear from you!
            </p>
          </header>
          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
              <LetterForm puppies={puppies} whatsappHref={site.whatsapp} />
              <Image
                src="/teddy/sit.svg"
                alt="Teddy, waiting for your letter"
                width={300}
                height={240}
                unoptimized
                className="ml-auto mr-6 -mt-3 block h-auto w-36 -scale-x-100 md:w-40"
              />
            </div>
            <div className="lg:col-span-5 lg:row-start-1">
              <Shopfront />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
