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

test("gender and collection counts match the reference", () => {
  assert.equal(getPuppies({ gender: "male" }).length, 6);
  assert.equal(getPuppies({ gender: "female" }).length, 10);
  assert.equal(getPuppies({ breed: "poodle", gender: "male" }).length, 1);
  assert.equal(getPuppies({ breed: "poodle", gender: "female" }).length, 2);
  assert.equal(getPuppies({ collection: "korean-teacup" }).length, 5);
  assert.equal(getPuppies({ origin: "imported", collection: "korean-teacup" }).length, 5);
  assert.equal(getPuppies({ collection: "korean-teacup", breed: "pomeranian" }).length, 3);
  assert.equal(getPuppies({ collection: "korean-teacup", breed: "pomeranian", gender: "male" }).length, 1);
  assert.equal(getPuppies({ collection: "korean-teacup", breed: "pomeranian", gender: "female" }).length, 2);
  assert.equal(getPuppies({ collection: "korean-teacup", breed: "shih-tzu" }).length, 0);
});

test("maltipoo, then girls, then korean teacup, then clearing maltipoo gives 6, 4, 1, 4", () => {
  assert.equal(getPuppies({ breed: "maltipoo" }).length, 6);
  assert.equal(getPuppies({ breed: "maltipoo", gender: "female" }).length, 4);
  assert.equal(getPuppies({ breed: "maltipoo", gender: "female", collection: "korean-teacup" }).length, 1);
  assert.equal(getPuppies({ gender: "female", collection: "korean-teacup" }).length, 4);
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
