import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Paw } from "@/components/paw";
import { PupBuddy } from "@/components/pup-buddy";
import { RevealScope } from "@/components/reveal-scope";
import { EnquiryForm } from "@/components/puppy/enquiry-form";
import { PuppyGallery } from "@/components/puppy/puppy-gallery";
import { StoryRibbon } from "@/components/puppy/story-ribbon";
import { puppies } from "@/data/puppies";
import { coverStyle } from "@/lib/media";
import { getAdjacentPuppies, getPuppy } from "@/lib/puppies";
import { site } from "@/lib/site";
import type { Puppy } from "@/lib/types";

const genderWords: Record<Puppy["gender"], string> = { male: "boy", female: "girl", "male-female": "boy & girl" };

const comesWith = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];

const homeSteps = [
  ["Reserve your puppy", "Tell us which puppy has captured your heart."],
  ["Personalized consultation", "We finalize details with you and share updates on your puppy's journey."],
  ["Import and arrival", "We manage health checks, travel arrangements, and documentation."],
  ["Welcome home", "We help your new puppy settle in and ensure a smooth transition into your home."],
];

export function generateStaticParams() {
  return puppies.map((p) => ({ slug: p.slug }));
}

// "Leo, Poodle puppy", or "Maltipoo puppy (girl)" for a puppy without a name.
function pageTitle(p: Puppy) {
  return p.name ? `${p.displayName}, ${p.breed} puppy` : `${p.breed} puppy (${genderWords[p.gender]})`;
}

export async function generateMetadata({ params }: PageProps<"/puppies/[slug]">): Promise<Metadata> {
  const puppy = getPuppy((await params).slug);
  if (!puppy) return {};
  const where = puppy.origin === "local" ? "in Dubai" : "imported";
  const video = puppy.media.some((m) => m.kind === "video") ? " and video" : "";
  const title = pageTitle(puppy);
  const description = `Meet ${puppy.name || `this ${puppy.breed}`}: ${puppy.breed}, ${genderWords[puppy.gender]}, ${puppy.age} old, ${where}. Real photos${video} from ${site.name}`;
  // The cover photo is the share image, as on the reference.
  const cover = puppy.media[0].poster ?? puppy.media[0];
  const image = { url: cover.url, width: cover.width, height: cover.height, alt: cover.alt };
  return {
    title,
    description,
    alternates: { canonical: `/puppies/${puppy.slug}` },
    openGraph: { title, description, images: image },
    twitter: { card: "summary_large_image", title, description, images: image },
  };
}

function Chapter({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="tp-chapter">
      <span aria-hidden="true" className="tp-chapter__n font-plush">
        {n}
      </span>
      <span className="font-scrawl">{children}</span>
    </p>
  );
}

function PupLink({ puppy, label }: { puppy: Puppy; label: string }) {
  const cover = puppy.media[0];
  return (
    <Link
      className="group flex items-center gap-5 rounded-[2rem] border-[3px] border-cocoa bg-milk p-4 transition-transform duration-500 hover:-rotate-1 sm:last:flex-row-reverse sm:last:text-right"
      href={`/puppies/${puppy.slug}`}
    >
      <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[999px_999px_0.6rem_0.6rem] border-[3px] border-cocoa bg-honey-soft">
        <Image src={cover.url} alt={cover.alt} fill sizes="80px" className="object-cover" style={coverStyle(cover)} />
      </span>
      <span>
        <span className="font-scrawl block text-sm text-cocoa-soft">{label}</span>
        <span className="font-plush text-[1.6rem]">{puppy.displayName}</span>
      </span>
    </Link>
  );
}

// The shell is shared by every puppy link, so the params read sits behind Suspense,
// with the same empty placeholder as the reference.
export default function PuppyPage({ params }: PageProps<"/puppies/[slug]">) {
  return (
    <Suspense fallback={<div className="gutter mx-auto min-h-[80vh] max-w-[110rem] pt-16" aria-busy="true" />}>
      <PuppyStory params={params} />
    </Suspense>
  );
}

async function PuppyStory({ params }: Pick<PageProps<"/puppies/[slug]">, "params">) {
  const { slug } = await params;
  const puppy = getPuppy(slug);
  if (!puppy) notFound();
  const { previous, next } = getAdjacentPuppies(slug)!;

  const available = puppy.status === "available";
  const url = `${site.url}/puppies/${puppy.slug}`;
  const gender = genderWords[puppy.gender];
  // "Max" or "this Maltipoo"; the enquiry message uses "Max (Maltipoo)" or just "Maltipoo".
  const called = puppy.name || `this ${puppy.breed}`;
  const label = puppy.name ? `${puppy.name} (${puppy.breed})` : puppy.breed;
  // Only imported puppies are listed today; the reference's text for a local puppy isn't visible.
  const showHomeSteps = available && puppy.origin === "imported";
  const rows = [
    ["Breed", puppy.breed],
    ["Boy or girl", gender[0].toUpperCase() + gender.slice(1)],
    ["Age", puppy.age],
    ["Colour", puppy.colour],
    ["Where", puppy.origin === "local" ? "In Dubai" : "Imported for you"],
  ].filter(([, value]) => value);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Puppies", item: `${site.url}/puppies` },
      { "@type": "ListItem", position: 2, name: puppy.displayName, item: url },
    ],
  };

  return (
    <article
      className="tp-storybook"
      style={{
        background: `linear-gradient(180deg, color-mix(in oklab, ${puppy.media[0].color} 24%, var(--color-milk)) 0, var(--color-milk) 85%)`,
      }}
    >
      <script
        type="application/ld+json"
        // Escape "<" so the data can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <StoryRibbon />
      <div className="gutter mx-auto max-w-[110rem] pt-8 pb-20 md:pt-12">
        <nav aria-label="Breadcrumb" className="text-[0.95rem] font-semibold text-cocoa-soft">
          <Link className="link-ink" href={available ? "/puppies" : "/gone-home"}>
            {available ? "Available puppies" : "Gone home"}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{puppy.displayName}</span>
        </nav>
        <Chapter n={1}>{available ? "hello, it's me" : "the day they went home"}</Chapter>
        <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            <PuppyGallery name={puppy.displayName} media={puppy.media} />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <RevealScope className="lg:sticky lg:top-[calc(var(--header-h)+5.5rem)]">
              <div className="tp-tag tp-board mt-16 !rounded-[2.2rem_2.2rem_2.2rem_0.6rem] !p-7 md:!p-9 lg:mt-20" data-reveal>
                <span aria-hidden="true" className="tp-tag__ring" />
                <PupBuddy
                  pose="peek"
                  className="absolute -top-[4.8rem] right-6 w-[9.5rem]"
                  label={`Teddy, peeking over ${puppy.displayName}'s tag`}
                />
                {available ? (
                  <span className="chip">
                    <Paw className="size-4 text-toffee" />
                    Available
                  </span>
                ) : (
                  <span className="inline-grid -rotate-6 place-items-center rounded-full border-[3px] border-current px-3 py-1 font-scrawl text-sm tracking-wide text-toffee-deep uppercase">
                    Gone home ♥
                  </span>
                )}
                <h1 className="font-plush mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">{puppy.displayName}</h1>
                {puppy.name && <p className="mt-2 text-lg font-semibold text-cocoa-soft">{puppy.breed}</p>}
                <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
                  {rows.map(([term, value]) => (
                    <div key={term}>
                      <dt className="font-scrawl text-sm text-cocoa-soft">{term}</dt>
                      <dd className="mt-0.5 text-[1.05rem] font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 flex flex-col gap-3">
                  <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                    {available ? `Ask about ${puppy.name || "this puppy"} on WhatsApp` : "Ask about a puppy like this"}
                  </a>
                  <a href={`#enquire-${puppy.slug}`} className="btn btn-ghost">
                    Send an enquiry
                  </a>
                </div>
              </div>
              <div className="tp-paper mt-8 -rotate-1">
                <Chapter n={2}>what comes with {called}</Chapter>
                <h2 className="font-plush mt-1 text-[1.9rem]">Every Teddy Pup comes</h2>
                <ul className="mt-4 space-y-2.5">
                  {comesWith.map((item) => (
                    <li key={item} className="flex items-start gap-3 font-semibold">
                      <svg viewBox="0 0 32 32" className="mt-0.5 size-6 shrink-0 text-toffee-deep" aria-hidden="true">
                        <path
                          d="M5 17l7 7L27 8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealScope>
          </div>
        </div>
        {showHomeSteps && (
          <section aria-labelledby={`home-steps-${puppy.slug}`} className="mt-20">
            <Chapter n={3}>the way home</Chapter>
            <h2 id={`home-steps-${puppy.slug}`} className="font-plush text-big mt-3">
              Coming home from abroad
            </h2>
            <ol className="tp-trail tp-trail--row tp-trail--paws mt-10">
              {homeSteps.map(([title, text], i) => (
                <li key={title}>
                  <span aria-hidden="true" className="tp-trail__num font-plush">
                    {i + 1}
                  </span>
                  <h3 className="font-plush-text text-xl leading-tight font-bold">{title}</h3>
                  <p className="mt-2 max-w-[38ch] text-cocoa-soft">{text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
        <section
          id={`enquire-${puppy.slug}`}
          aria-labelledby={`enquire-title-${puppy.slug}`}
          className="tp-letter mt-20 grid gap-10 lg:grid-cols-12"
        >
          <span aria-hidden="true" className="tp-letter__stamp">
            <Paw className="size-9" />
          </span>
          <div className="lg:col-span-4">
            <Chapter n={showHomeSteps ? 4 : 3}>dear TeddyPups…</Chapter>
            <h2 id={`enquire-title-${puppy.slug}`} className="font-plush text-big mt-2">
              {available ? `Ask about ${puppy.name || "this puppy"}` : "Looking for a puppy like this?"}
            </h2>
            <p className="mt-4 text-cocoa-soft">
              Leave your details and our team will get back to you promptly — or message us on WhatsApp for the quickest
              reply.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <EnquiryForm puppy={{ slug: puppy.slug, label }} />
          </div>
        </section>
        <nav aria-label="More puppies" className="mt-16 grid gap-4 sm:grid-cols-2">
          <PupLink puppy={previous} label="Previous pup" />
          <PupLink puppy={next} label="Next pup" />
        </nav>
      </div>
    </article>
  );
}
