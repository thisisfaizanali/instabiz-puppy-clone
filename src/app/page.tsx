import { ClosingCta } from "@/components/home/closing-cta";
import { FaqPreview } from "@/components/home/faq-preview";
import { HappyFamilies } from "@/components/home/happy-families";
import { Hero } from "@/components/home/hero";
import { Journey } from "@/components/home/journey";
import { MeetThePups } from "@/components/home/meet-the-pups";
import { PupJourney } from "@/components/pup-journey";
import { Trust } from "@/components/home/trust";
import { TwoWays } from "@/components/home/two-ways";
import { shareImage } from "@/lib/metadata";
import { site } from "@/lib/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: site.name,
    description: site.description,
    url: site.url,
    logo: `${site.url}${shareImage}`,
    image: `${site.url}${shareImage}`,
    telephone: site.phone.display,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    sameAs: site.socials.map((s) => s.href),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so the data can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <MeetThePups />
      <TwoWays />
      <Journey />
      <Trust />
      <HappyFamilies />
      <FaqPreview />
      <ClosingCta />
      <PupJourney />
    </>
  );
}
