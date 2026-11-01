import Image from "next/image";
import Link from "next/link";
import { pawPath } from "@/components/paw";
import { Teddy } from "@/components/teddy";
import { showroomPhotos, showroomVideo } from "@/data/showroom";
import { coverStyle } from "@/lib/media";
import { getBreeds } from "@/lib/puppies";
import { site } from "@/lib/site";
import { Clip } from "./clip";

const steps = [
  {
    title: "Choose your breed",
    text: "Select your preferred breed or tell us what you're looking for. We'll guide you based on availability and your lifestyle.",
  },
  {
    title: "Get photos & details",
    text: "Our team will share real photos, health details, and all necessary information directly on WhatsApp.",
  },
  {
    title: "Secure & safe delivery",
    text: "Once confirmed, we handle everything professionally and ensure your puppy reaches you safely and stress-free.",
  },
];

export function Journey() {
  return (
    <section
      data-tone="light"
      className="tp-scene tp-chat"
      style={{ "--sky-top": "#f7d18d", "--sky-bottom": "#f0b866" } as React.CSSProperties}
      aria-labelledby="journey-title"
    >
      <div className="tp-chat__grid gutter">
        <div className="tp-chat__story">
          <h2 id="journey-title" className="font-plush text-huge">
            Your puppy journey
          </h2>
          <p className="text-lede mt-5 max-w-[42ch] text-[var(--ink-soft)]">
            A premium, step-by-step concierge experience. We make adoption simple, secure, and purely joyful.
          </p>
          <ol className="tp-chat__steps">
            {steps.map((step, i) => (
              // The reference renders the last step active before any scrolling.
              <li
                key={step.title}
                className="tp-chat__step"
                data-done={i < steps.length - 1 || undefined}
                data-active={i === steps.length - 1 || undefined}
              >
                <span className="tp-chat__num font-plush" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="font-plush tp-chat__title">{step.title}</h3>
                <p className="tp-chat__text">{step.text}</p>
              </li>
            ))}
          </ol>
          <Link className="btn btn-ghost tp-chat__cta" href="/how-it-works">
            How it works
          </Link>
        </div>
        <div className="tp-chat__side">
          <div className="tp-phone" aria-label={`A WhatsApp conversation with ${site.name}`} role="group">
            <div className="tp-phone__bar">
              <Image src="/brand/logo.png" alt="" width={40} height={40} className="tp-phone__avatar" />
              <span>
                <span className="tp-phone__name">{site.name}</span>
                <span className="tp-phone__status">online</span>
              </span>
            </div>
            <div className="tp-phone__screen">
              <p className="tp-msg tp-msg--me">Hi TeddyPups! I&apos;d love to know more about your puppies.</p>
              <div className="tp-msg-group">
                <div className="tp-msg tp-msg--them">
                  <p>{steps[0].text}</p>
                  <ul className="tp-chips" aria-label="Breeds we have now">
                    {getBreeds().map((breed) => (
                      <li key={breed.slug}>
                        <Link href={`/puppies?breed=${breed.slug}`}>{breed.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="tp-msg-group">
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <div className="tp-snaps">
                    {showroomPhotos.map((photo) => (
                      <span key={photo.url} className="tp-snaps__one">
                        <Image
                          src={photo.url}
                          alt={photo.alt}
                          fill
                          sizes="9rem"
                          className="object-cover"
                          style={coverStyle(photo)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="tp-msg tp-msg--them tp-msg--media">
                  <Clip video={showroomVideo} />
                </div>
                <p className="tp-msg tp-msg--them">{steps[1].text}</p>
              </div>
              <div className="tp-msg-group">
                <div className="tp-msg tp-msg--them">
                  <p>{steps[2].text}</p>
                  <svg viewBox="0 0 220 70" className="tp-route" aria-hidden="true">
                    <path d="M14 52 C 60 6, 120 70, 170 28" className="tp-route__line" />
                    <circle cx="14" cy="52" r="5" className="tp-route__dot" />
                    <path d="M164 32 l12 -12 l12 12 v14 h-24 z" className="tp-route__home" />
                    <path d="M176 42 c-2-3-7-2-6 2c1 3 6 5 6 5s5-2 6-5c1-4-4-5-6-2z" className="tp-route__heart" />
                    <path d={pawPath} transform="translate(70 22) scale(.3) rotate(70 32 32)" className="tp-route__paw" />
                    <path d={pawPath} transform="translate(104 38) scale(.3) rotate(100 32 32)" className="tp-route__paw" />
                  </svg>
                </div>
              </div>
            </div>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="tp-phone__compose">
              <span>Say hello on WhatsApp</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </a>
          </div>
          <Teddy pose="sit" className="tp-chat__teddy" />
        </div>
      </div>
    </section>
  );
}
