import { breeds, puppies } from "../data/puppies.ts";

// Filter values usually come straight from search params, so they are plain strings.
// As on the reference, an empty value means no filter and an unknown value matches nothing.
export function getPuppies({ origin, breed }: { origin?: string; breed?: string } = {}) {
  return puppies.filter(
    (p) =>
      (!origin || p.origin === origin) &&
      (!breed || (p.breeds as string[]).includes(breed)),
  );
}

export function getPuppy(slug: string) {
  return puppies.find((p) => p.slug === slug);
}

export function getBreeds() {
  return breeds;
}
