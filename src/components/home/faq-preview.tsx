import Link from "next/link";
import { Teddy } from "@/components/teddy";
import { faqs } from "@/data/faq";

const starPath = "M20 3c1.6 9.4 7.6 15.4 17 17-9.4 1.6-15.4 7.6-17 17-1.6-9.4-7.6-15.4-17-17 9.4-1.6 15.4-7.6 17-17z";

// Star positions and sizes from the reference night sky.
const stars = [
  { left: "8%", top: "12%", width: 16.2 },
  { left: "22%", top: "30%", width: 9 },
  { left: "41%", top: "8%", width: 12.6 },
  { left: "57%", top: "22%", width: 8.1 },
  { left: "72%", top: "6%", width: 14.4 },
  { left: "88%", top: "18%", width: 10.8 },
  { left: "95%", top: "42%", width: 9 },
  { left: "4%", top: "58%", width: 10.8 },
  { left: "34%", top: "70%", width: 7.2 },
  { left: "63%", top: "84%", width: 9.9 },
  { left: "83%", top: "66%", width: 12.6 },
];

export function FaqPreview() {
  return (
    <section
      data-pup-scene
      data-tone="dark"
      className="tp-scene tp-night"
      style={{ "--sky-top": "#4d2b19", "--sky-bottom": "#2f1a10" } as React.CSSProperties}
      aria-labelledby="questions-title"
    >
      <div aria-hidden="true" className="pointer-events-none tp-night__stars">
        {stars.map((star, i) => (
          <svg
            key={star.left}
            viewBox="0 0 40 40"
            className="tp-twinkle absolute text-honey"
            style={{ ...star, animationDelay: `${(i * 0.4).toFixed(2)}s` }}
            aria-hidden="true"
          >
            <path d={starPath} fill="currentColor" />
          </svg>
        ))}
      </div>
      <div className="tp-night__grid gutter">
        <div className="tp-night__intro">
          <h2 id="questions-title" className="font-plush text-huge">
            Questions, answered
          </h2>
          <Link className="btn btn-ghost tp-night__cta" href="/faq">
            Read all questions
          </Link>
          <div className="tp-night__pup">
            <span aria-hidden="true" className="tp-night__wonder font-plush">
              ?
            </span>
            <Teddy pose="sit" act="tilt" className="tp-night__teddy" />
          </div>
        </div>
        <dl className="tp-night__list">
          {faqs.slice(0, 3).map((faq, i) => (
            <div key={faq.question} className="tp-qa" data-pup-look={i < 2 ? "" : undefined}>
              <dt className="font-plush tp-qa__q">
                <svg viewBox="0 0 40 40" className="tp-qa__star" aria-hidden="true">
                  <path d={starPath} fill="currentColor" />
                </svg>
                {faq.question}
              </dt>
              <dd className="tp-qa__a">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
