import { ClosingCta } from "@/components/home/closing-cta";
import { FaqPreview } from "@/components/home/faq-preview";
import { HappyFamilies } from "@/components/home/happy-families";
import { Hero } from "@/components/home/hero";
import { Journey } from "@/components/home/journey";
import { MeetThePups } from "@/components/home/meet-the-pups";
import { Trust } from "@/components/home/trust";
import { TwoWays } from "@/components/home/two-ways";

export default function Home() {
  return (
    <>
      <Hero />
      <MeetThePups />
      <TwoWays />
      <Journey />
      <Trust />
      <HappyFamilies />
      <FaqPreview />
      <ClosingCta />
    </>
  );
}
