import assert from "node:assert/strict";
import { test } from "node:test";
import { frameOf, legs, paths, poses } from "./teddy-shape.ts";

// Attributes read from the server-rendered Teddy SVGs on the reference home page.
test("resting poses draw the same attributes as the reference", () => {
  const sit = frameOf(poses.sit);
  assert.equal(sit.body, "translate(0 -2) rotate(-24 196 206) translate(196 0) scale(1 1) translate(-196 0)");
  const snug = frameOf(poses.snug);
  assert.equal(snug.body, "translate(0 0) rotate(0 196 206) translate(196 0) scale(1 1) translate(-196 0)");
  assert.equal(snug.tail, "rotate(-20 84 150)");
  assert.equal(snug.bf, "translate(94 192) rotate(0)");
  assert.equal(snug.side, 0);
  assert.equal(snug.shadow, "translate(0 0) scale(1 1)");
});

test("shapes match the reference paths", () => {
  assert.ok(paths.tail.startsWith("M70.0 110.0Q78.1 105.0 80.9 113.7Q90.5 114.8 86.7 123.2"));
  assert.ok(legs.backFar.startsWith("M-14 -14 C-14 4 -12 18 -12 27 C-12 34 -7 36 0 36 C9 36 13 33"));
  assert.ok(legs.back.startsWith("M-15 -14 C-15 4 -12 16 -12 25"));
});
