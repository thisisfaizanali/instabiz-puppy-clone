import Image from "next/image";
import Link from "next/link";
import { Flight, Skyline } from "@/components/flight";
import { Journeys } from "@/components/how-it-works/journeys";
import { type Stamp, StampEntry, stampIcons } from "@/components/stamp";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata(
  "/how-it-works",
  "How it works",
  "Meet a local puppy in our Downtown Dubai showroom or reserve a premium teacup breed imported for you — every step, from choosing to coming home.",
);

const contents = [
  { href: "#two-ways", label: "Two ways home" },
  { href: "#promise", label: "Our premium puppy promise" },
  { href: "#delivery", label: "Delivery & collection" },
  { href: "#why", label: "Why choose us" },
];

const promise: Stamp[] = [
  {
    title: "Hand-selected breeders",
    text: "We work only with breeders who uphold the highest ethical and health standards.",
    shape: "round",
    ink: "#a24a1a",
    tilt: "-8deg",
    icon: stampIcons.heart,
  },
  {
    title: "Full transparency",
    text: "Photos, videos, and health certificates are shared before your puppy travels.",
    shape: "ticket",
    ink: "#1f6b45",
    tilt: "5deg",
    icon: stampIcons.plane,
  },
  {
    title: "Safe, stress-free delivery",
    text: "We handle every detail of the import process, so your puppy arrives happy, healthy, and ready to love you.",
    shape: "oval",
    ink: "#5a3a28",
    tilt: "-4deg",
    icon: stampIcons.chat,
  },
];

const delivery = [
  {
    title: "Take your puppy home the same day",
    text: "Local puppies are available immediately — visit, fall in love, and go home together.",
  },
  {
    title: "Delivery within Dubai",
    text: "Prefer to stay home? We deliver your puppy to your door within Dubai, safely and comfortably.",
  },
  {
    title: "Safe international cargo",
    text: "We handle all the paperwork and ensure comfortable travel so your puppy arrives happy and stress-free.",
  },
  {
    title: "Worldwide delivery",
    text: "We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.",
  },
];

const reasons = [
  {
    title: "International cargo",
    text: "We safely deliver puppies to loving homes all around the world. Our trusted international cargo partners ensure your new furry friend travels comfortably and arrives safely, no matter the distance.",
    icon: stampIcons.plane,
  },
  {
    title: "Support 24/7",
    text: "Our team is available 24/7 to answer your questions and assist you through every step of the adoption process. From choosing your puppy to post-delivery support — we're just a message away.",
    icon: stampIcons.chat,
  },
  {
    title: "Health guarantee",
    text: "All our puppies come with a verified health certificate from licensed vets. We ensure every puppy is vaccinated, dewormed, and thoroughly checked before joining your family.",
    icon: stampIcons.heart,
  },
];

export default function HowItWorksPage() {
  return (
    <div data-page="how">
      <section
        data-tone="light"
        className="tp-scene"
        style={{ "--sky-top": "#fffbf3", "--sky-bottom": "#f6cc85" } as React.CSSProperties}
        aria-labelledby="how-title"
      >
        <div className="gutter mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="grid gap-8 md:grid-cols-12 md:items-end">
            <h1 id="how-title" className="font-plush text-giant md:col-span-7">
              How it works
            </h1>
            <p className="text-lede text-[var(--ink-soft)] md:col-span-5 md:pb-4">
              Whether you choose to visit us locally or order a premium breed from overseas, TeddyPups is here to make
              the experience unforgettable.
            </p>
          </header>
          <nav aria-label="On this page" className="mt-10 flex flex-wrap gap-2">
            {contents.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className="chip h-11 border-2 border-cocoa !bg-milk px-4 hover:!bg-honey-soft"
              >
                <span className="font-plush text-toffee">{i + 1}</span> {item.label}
              </a>
            ))}
          </nav>
          <div id="two-ways">
            <Journeys />
          </div>
          <section id="promise" aria-labelledby="promise-title" className="tp-paper mt-24 -rotate-[0.6deg]">
            <p aria-hidden="true" className="font-scrawl text-lg text-toffee-ink">
              puppy passport
            </p>
            <h2 id="promise-title" className="font-plush text-huge mt-1 max-w-[16ch]">
              Our premium puppy promise
            </h2>
            <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {promise.map((stamp, i) => (
                <StampEntry key={stamp.title} stamp={stamp} index={i} />
              ))}
            </ul>
          </section>
          <section id="delivery" aria-labelledby="delivery-title" className="mt-24 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 id="delivery-title" className="font-plush text-huge">
                Delivery &amp; collection
              </h2>
              <p className="text-lede mt-5 text-[var(--ink-soft)]">
                From a same-day visit in Downtown Dubai to a flight from Korea, every puppy travels comfortably and
                arrives safely.
              </p>
              <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {delivery.map((item) => (
                  <li key={item.title}>
                    <h3 className="font-plush-text text-[1.3rem] font-bold leading-snug">{item.title}</h3>
                    <p className="mt-1.5 text-[var(--ink-soft)]">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[clamp(14rem,30vw,22rem)] lg:col-span-6">
              <Skyline className="absolute inset-x-0 bottom-0 w-full text-cocoa/25" />
              <Flight label="A plane flying puppies from Korea to Dubai" />
            </div>
          </section>
          <section id="why" aria-labelledby="why-title" className="mt-24 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="why-title" className="font-plush text-huge">
                Why choose us
              </h2>
              <p className="text-lede mt-6 text-[var(--ink-soft)]">
                We&apos;re here to help you find a new family member. From the moment you visit our site to the joyful
                day your puppy arrives at your door, we&apos;re with you every step of the way. Our mission is to make
                the entire adoption process smooth, transparent, and full of love.
              </p>
            </div>
            <ul className="space-y-8 lg:col-span-6 lg:col-start-7">
              {reasons.map((reason) => (
                <li key={reason.title} className="flex gap-5">
                  <svg viewBox="0 0 64 64" className="size-14 shrink-0 text-toffee-deep" aria-hidden="true">
                    {reason.icon}
                  </svg>
                  <div>
                    <h3 className="font-plush text-[1.7rem]">{reason.title}</h3>
                    <p className="mt-2 text-[var(--ink-soft)]">{reason.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section
            aria-labelledby="care-title"
            className="tp-board mt-24 grid items-center gap-8 md:grid-cols-[1fr_auto] md:!p-12"
          >
            <div>
              <h2 id="care-title" className="font-plush text-big">
                Unique and high quality puppies
              </h2>
              <p className="text-lede measure mt-5 text-cocoa-soft">
                When you choose TeddyPups, you can trust that you&apos;re getting a puppy of the highest quality. We
                also provide guidance and support to new pet owners, offering advice on training, nutrition, and
                general care to ensure a smooth transition for you and your new furry friend.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                  Ask us on WhatsApp
                </a>
                <Link className="btn btn-ghost" href="/puppies">
                  See available puppies
                </Link>
              </div>
            </div>
            <Image
              src="/teddy/bow.svg"
              alt="Teddy, ready to play"
              width={300}
              height={240}
              unoptimized
              className="mx-auto h-auto w-48 -scale-x-100 md:w-56"
            />
          </section>
        </div>
      </section>
    </div>
  );
}
