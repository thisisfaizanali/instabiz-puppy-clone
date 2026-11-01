import assert from "node:assert/strict";
import { test } from "node:test";
import { sketchFor } from "./sketch.ts";

// Values read from Max's card on the reference /puppies page.
test("sketch frame matches the reference for the same slug", () => {
  const s = sketchFor("maltipoo-max-male");
  assert.equal(s.tilt.toFixed(2), "0.36");
  assert.equal(s.wash.colour, "#f2be6b");
  assert.equal(`${s.wash.dx.toFixed(1)}% ${s.wash.dy.toFixed(1)}%`, "-4.0% 4.9%");
  assert.ok(s.wash.d.startsWith("M96.73 50.00C96.38 52.37 95.89 54.67 95.32 56.94"));
  assert.ok(s.outline.startsWith("M99.83 50.00C99.55 52.49 99.05 54.95 98.42 57.34"));
  assert.ok(s.retrace.startsWith("M37.52 95.79C36.56 95.50 33.64 94.73 31.77 94.02"));
  assert.deepEqual(
    s.doodles.map((d) => [d.kind, d.x.toFixed(1), d.y.toFixed(1), d.rot.toFixed(0), d.size.toFixed(2)]),
    [
      ["swirl", "-7.0", "64.1", "-9", "0.85"],
      ["paw", "6.7", "16.0", "-10", "0.95"],
    ],
  );
});
