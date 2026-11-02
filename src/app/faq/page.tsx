import { RevealScope } from "@/components/reveal-scope";
import { NoticeBoard } from "@/components/faq/notice-board";
import { faqs } from "@/data/faq";
import { pageMetadata } from "@/lib/metadata";
import { whatsappLink } from "@/lib/site";

export const metadata = pageMetadata(
  "/faq",
  "Questions & answers",
  "Answers about TeddyPups puppies: health checks and vaccinations, meeting local puppies, imported teacup breeds and delivery.",
);

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  return (
    <RevealScope data-page="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage).replace(/</g, "\\u003c") }}
      />
      <section
        data-tone="dark"
        className="tp-scene tp-faqroom overflow-hidden"
        style={{ "--sky-top": "#a95e32", "--sky-bottom": "#331c11" } as React.CSSProperties}
        aria-labelledby="faq-title"
      >
        <div className="gutter relative mx-auto max-w-[110rem] pb-24 pt-10 md:pt-16">
          <header className="max-w-4xl">
            <h1 id="faq-title" className="font-plush text-giant">
              Questions &amp; answers
            </h1>
            <p className="text-lede mt-6 max-w-[52ch] text-[var(--ink-soft)]">
              Can&apos;t find what you&apos;re looking for? Message us on WhatsApp — our team is available 24/7.
            </p>
          </header>
          <div className="mt-12 md:mt-16">
            <NoticeBoard faqs={faqs} askHref={whatsappLink("Hi TeddyPups! I have a question:")} />
          </div>
        </div>
      </section>
    </RevealScope>
  );
}
