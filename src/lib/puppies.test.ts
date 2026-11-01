import assert from "node:assert/strict";
import { test } from "node:test";
import { getBreeds, getPuppies, getPuppy } from "./puppies.ts";

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

test("unknown filter values match nothing, empty values match everything", () => {
  assert.equal(getPuppies({ breed: "bogus" }).length, 0);
  assert.equal(getPuppies({ breed: "Maltipoo" }).length, 0);
  assert.equal(getPuppies({ origin: "bogus" }).length, 0);
  assert.equal(getPuppies({ breed: "" }).length, 15);
});
