import { Teddy } from "@/components/teddy";
import { getBreeds } from "@/lib/puppies";
import { JourneyChat } from "./journey-chat";

export function Journey() {
  return (
    <JourneyChat
      breeds={getBreeds().map(({ slug, name }) => ({ slug, name }))}
      teddy={<Teddy pose="sit" className="tp-chat__teddy" />}
    />
  );
}
