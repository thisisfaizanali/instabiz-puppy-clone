import { breeds, puppies } from "../data/puppies.ts";
import type { BreedSlug, Puppy } from "./types.ts";

// Filter values usually come straight from search params, so they are plain strings.
// As on the reference, an empty value means no filter and an unknown value matches nothing.
// Results keep reference order: /puppies order for available, /gone-home order for gone home.
export function getPuppies({
  origin,
  breed,
  status = "available",
}: { origin?: string; breed?: string; status?: Puppy["status"] } = {}) {
  return puppies.filter(
    (p) =>
      p.status === status &&
      (!origin || p.origin === origin) &&
      (!breed || (p.breeds as string[]).includes(breed)),
  );
}

// Resolves any detail route, available or gone home.
export function getPuppy(slug: string) {
  return puppies.find((p) => p.slug === slug);
}

// Previous pup / Next pup, as on the reference: cycles through the puppy's own
// status group in reference order and wraps at both ends.
export function getAdjacentPuppies(slug: string) {
  const puppy = getPuppy(slug);
  if (!puppy) return undefined;
  const group = getPuppies({ status: puppy.status });
  const i = group.indexOf(puppy);
  return {
    previous: group[(i - 1 + group.length) % group.length],
    next: group[(i + 1) % group.length],
  };
}

// Only breeds with an available puppy, matching the reference filter chips.
export function getBreeds() {
  const available = getPuppies();
  return breeds.filter((b) => available.some((p) => (p.breeds as BreedSlug[]).includes(b.slug)));
}
