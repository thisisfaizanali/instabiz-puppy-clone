"use client";

import { PupBuddy } from "@/components/pup-buddy";
import { Skyline } from "@/components/flight";
import { useTabs } from "@/components/tabs";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const tints = ["#fbe3b4", "#fde6de", "#e3f0fb", "#e6f2df"];

const journeys = [
  {
    key: "local",
    label: "In Dubai",
    hint: "meet in person",
    heading: "Meet your puppy in person",
    body: "Step into our Downtown Dubai showroom and experience the joy of choosing your puppy face-to-face. We source healthy, well-socialized puppies from trusted local breeders, ensuring they're raised with care, proper nutrition, and veterinary checks.",
    note: null,
    steps: [
      {
        title: "Explore our puppies",
        text: "Browse our website to view the available puppies. Each listing includes photos, breed details, age, and health information.",
        icon: (
          <>
            <circle cx="21" cy="21" r="12" {...line} />
            <path d="m30 30 10 10" {...line} />
            <path
              d="M21 27c-3-2-4.4-3.6-4.4-5.2a2.2 2.2 0 0 1 4.4-.4 2.2 2.2 0 0 1 4.4.4c0 1.6-1.4 3.2-4.4 5.2z"
              fill="currentColor"
            />
          </>
        ),
      },
      {
        title: "Choose your puppy",
        text: "Once you find a puppy you love, open their profile for more information or to enquire further. You can also reach out to us directly if you have any questions.",
        icon: (
          <>
            <path
              d="M24 40C11 31 6 24.5 6 17.8 6 12.4 10.2 8 15.4 8c3.7 0 6.8 2.1 8.6 5.3C25.8 10.1 28.9 8 32.6 8 37.8 8 42 12.4 42 17.8 42 24.5 37 31 24 40z"
              {...line}
            />
            <path d="m17 22 5 5 9-10" {...line} />
          </>
        ),
      },
      {
        title: "Meet before you choose",
        text: "Spend time bonding before making your decision.",
        icon: (
          <>
            <path d="M14 18c-3-6-1-10 3-10s5 4 4 8M34 18c3-6 1-10-3-10s-5 4-4 8" {...line} />
            <ellipse cx="24" cy="27" rx="13" ry="12" {...line} />
            <circle cx="19.5" cy="25" r="1.6" fill="currentColor" />
            <circle cx="28.5" cy="25" r="1.6" fill="currentColor" />
            <path d="M22 31h4l-2 2z" {...line} fill="currentColor" strokeWidth={1.6} />
          </>
        ),
      },
      {
        title: "Pick-up or delivery",
        text: "Pick up your puppy from us or have them delivered to your home within Dubai. Our delivery service is safe and reliable, ensuring your puppy arrives comfortably.",
        icon: (
          <>
            <path d="M5 30V18h22v12M27 22h8l6 6v2H27" {...line} />
            <path d="M5 30h36" {...line} />
            <circle cx="13" cy="33" r="3.4" {...line} />
            <circle cx="34" cy="33" r="3.4" {...line} />
            <path
              d="M16 26c-2.3-1.6-3.4-2.8-3.4-4a1.7 1.7 0 0 1 3.4-.4 1.7 1.7 0 0 1 3.4.4c0 1.2-1.1 2.4-3.4 4z"
              fill="currentColor"
            />
          </>
        ),
      },
    ],
  },
  {
    key: "imported",
    label: "Imported",
    hint: "order upon request",
    heading: "Order upon request",
    body: "Looking for a truly exceptional companion? Our Order Upon Request service gives you access to some of the world's most sought-after teacup breeds — ethically sourced from the most reputable, certified breeders across Europe, Korea, and beyond.",
    note: "From Korean teacup poodles to rare Maltese, Pom, and Yorkie lines, we bring the world's finest puppies to Dubai, just for you.",
    steps: [
      {
        title: "Reserve your puppy",
        text: "Browse our selection of available breeds and place a reservation for the teacup puppy that captures your heart. Our reservation-only model ensures that each puppy is specifically sourced to meet your preferences.",
        icon: (
          <>
            <rect x="7" y="10" width="34" height="30" rx="5" {...line} />
            <path d="M7 19h34M16 6v8M32 6v8" {...line} />
            <path d="m17 29 5 5 9-9" {...line} />
          </>
        ),
      },
      {
        title: "Personalized consultation",
        text: "Once your reservation is confirmed, we will work closely with you to finalize details and provide updates on your puppy's journey.",
        icon: (
          <>
            <path d="M6 12a5 5 0 0 1 5-5h16a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-9l-6 5v-5h-1a5 5 0 0 1-5-5z" {...line} />
            <path d="M36 17h1a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-1v5l-6-5h-6a5 5 0 0 1-4-2" {...line} />
          </>
        ),
      },
      {
        title: "Import and arrival",
        text: "We manage all aspects of the import process, including health checks, travel arrangements, and necessary documentation. Your puppy will be carefully transported and will arrive ready to join your family.",
        icon: (
          <path
            transform="matrix(-1 0 0 1 48 0)"
            d="M4 27l13-1.5 8-10h4l-4 9.5 9-.8 4-4.7h3l-2 6.6 2 6.6h-3l-4-4.7-9-.8 4 9.5h-4l-8-10L4 29z"
            {...line}
          />
        ),
      },
      {
        title: "Welcome home",
        text: "Upon arrival, we provide support to help your new puppy acclimate to their new environment. Our team is available for any additional assistance and to ensure a smooth transition into your home.",
        icon: (
          <>
            <path d="M6 23 24 8l18 15M11 19v21h26V19" {...line} />
            <path
              d="M24 35c-4.6-3.2-6.8-5.7-6.8-8.2a3.4 3.4 0 0 1 6.8-.8 3.4 3.4 0 0 1 6.8.8c0 2.5-2.2 5-6.8 8.2z"
              fill="currentColor"
            />
          </>
        ),
      },
    ],
  },
];

const keys = journeys.map((j) => j.key);

function Postcard({ kind }: { kind: string }) {
  if (kind === "imported") {
    return (
      <div aria-hidden="true" className="tp-postcard tp-postcard--sky">
        <svg viewBox="0 0 320 150" className="tp-postcard__route" preserveAspectRatio="none">
          <path d="M28 128C90 20 230 20 292 118" />
        </svg>
        <svg viewBox="0 0 64 40" className="tp-postcard__plane" aria-hidden="true">
          <path
            d="M4 22l20-2 12-14h6l-6 14 14-1 6-7h4l-3 10 3 10h-4l-6-7-14-1 6 14h-6L24 24 4 22z"
            {...line}
            fill="#fffdf8"
          />
        </svg>
        <span className="font-scrawl tp-postcard__from">Europe · Korea</span>
        <span className="font-scrawl tp-postcard__to">Dubai</span>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="tp-postcard">
      <span className="tp-postcard__sun" />
      <Skyline className="tp-postcard__city" />
      <span className="font-scrawl tp-postcard__to tp-postcard__to--left">Downtown Dubai</span>
    </div>
  );
}

// "Two ways home": a two-way switch between the local and imported journeys.
export function Journeys() {
  const { ready, index, tabProps, panelProps } = useTabs(keys);
  return (
    <section className="tp-journeys" aria-labelledby="two-ways-title" data-ready={ready || undefined}>
      <div className="tp-journeys__top">
        <div>
          <p className="font-scrawl tp-journeys__kicker">choose your way</p>
          <h2 id="two-ways-title" className="font-plush text-big">
            Two ways home
          </h2>
        </div>
        <div className="tp-journeys__pick">
          <div
            role="tablist"
            aria-label="Ways to bring your puppy home"
            className="tp-switch"
            style={{ "--at": index, "--n": journeys.length } as React.CSSProperties}
          >
            <span aria-hidden="true" className="tp-switch__thumb" />
            {journeys.map((j, i) => (
              <button key={j.key} {...tabProps(j.key, i)} className="tp-switch__tab">
                <span className="font-plush tp-switch__label">{j.label}</span>
                <span className="tp-switch__hint">{j.hint}</span>
              </button>
            ))}
          </div>
          <PupBuddy pose="sit" className="tp-journeys__teddy" label="Teddy, waiting to see which way you pick" />
        </div>
      </div>
      {journeys.map((j) => (
        <div key={j.key} {...panelProps(j.key)} className="tp-journey">
          <div className="tp-journey__head">
            <div>
              <h3 className="font-plush tp-journey__title">{j.heading}</h3>
              <p className="text-lede mt-4 text-[var(--ink-soft)]">{j.body}</p>
              {j.note && <p className="font-scrawl mt-4 text-toffee-ink">{j.note}</p>}
            </div>
            <Postcard kind={j.key} />
          </div>
          <ol className="tp-steps">
            {j.steps.map((step, i) => (
              <li
                key={step.title}
                className="tp-step"
                style={{ "--i": i, "--tint": tints[i % tints.length] } as React.CSSProperties}
              >
                <span aria-hidden="true" className="tp-step__icon">
                  <svg viewBox="0 0 48 48">{step.icon}</svg>
                </span>
                <span className="tp-step__num font-plush">Step {i + 1}</span>
                <h4 className="font-plush-text tp-step__title">{step.title}</h4>
                <p className="tp-step__text">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
