import assert from "node:assert/strict";
import { test } from "node:test";
import { goneHomeTickets } from "../data/gone-home.ts";
import { getAdjacentPuppies, getBreeds, getPuppies, getPuppy } from "./puppies.ts";

// Expected counts are taken from the reference /puppies filters.
test("counts per origin match the reference", () => {
  assert.equal(getPuppies().length, 15);
  assert.equal(getPuppies({ origin: "imported" }).length, 15);
  assert.equal(getPuppies({ origin: "local" }).length, 0);
});

test("counts per breed match the reference", () => {
  const counts = Object.fromEntries(getBreeds().map((b) => [b.slug, getPuppies({ breed: b.slug }).length]));
  assert.deepEqual(counts, { maltipoo: 6, pomeranian: 4, poodle: 2, cavapoo: 2, "shih-tzu": 2 });
});

test("getPuppy returns undefined for an unknown slug", () => {
  assert.equal(getPuppy("maltipoo-max-male")?.name, "Max");
  assert.equal(getPuppy("no-such-puppy"), undefined);
});

test("gone-home puppies are separate records in /gone-home order", () => {
  const gone = getPuppies({ status: "gone-home" });
  assert.equal(gone.length, 27);
  assert.equal(gone[0].slug, "pomeranian-ace-boy");
  assert.equal(gone.at(-1)?.slug, "maltipo");
  assert.equal(getPuppy("poodle-leo-male")?.status, "gone-home");
  assert.ok(gone.every((p) => goneHomeTickets[p.slug]));
  assert.equal(Object.keys(goneHomeTickets).length, 27);
});

// Previous pup / Next pup pairs read from the reference detail pages.
test("adjacent puppies match the reference, wrapping at both ends", () => {
  const adjacent = (slug: string) => {
    const a = getAdjacentPuppies(slug);
    return [a?.previous.slug, a?.next.slug];
  };
  assert.deepEqual(adjacent("maltipoo-max-male"), ["korean-teacup-pomeranian-male", "korean-teacup-maltipoo-female"]);
  assert.deepEqual(adjacent("maltipoo-mia-girl"), ["poodle-leo-male", "maltipoo-sadie-girl"]);
  assert.deepEqual(adjacent("maltipo"), ["puppy", "pomeranian-ace-boy"]);
  assert.equal(getAdjacentPuppies("no-such-puppy"), undefined);
});

test("unknown filter values match nothing, empty values match everything", () => {
  assert.equal(getPuppies({ breed: "bogus" }).length, 0);
  assert.equal(getPuppies({ breed: "Maltipoo" }).length, 0);
  assert.equal(getPuppies({ origin: "bogus" }).length, 0);
  assert.equal(getPuppies({ breed: "" }).length, 15);
});
