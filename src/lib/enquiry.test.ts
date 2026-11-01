import assert from "node:assert/strict";
import { test } from "node:test";
import { validateEnquiry } from "./enquiry.ts";

const valid = {
  name: "Aisha",
  phone: "+971 50 123 4567",
  email: "aisha@example.com",
  area: "Dubai Marina",
  message: "Hi! I'd love to know more about Leo (Poodle).",
  puppy: "poodle-leo-male",
  website: "",
};

test("valid input passes, trimmed", () => {
  const check = validateEnquiry({ ...valid, name: "  Aisha  " });
  assert.ok(check.ok && !check.spam);
  assert.equal(check.enquiry.name, "Aisha");
  assert.equal(check.enquiry.puppy, "poodle-leo-male");
  // Email, area, message and puppy are optional.
  assert.ok(validateEnquiry({ name: "Aisha", phone: "0501234567" }).ok);
});

test("missing name", () => {
  const check = validateEnquiry({ ...valid, name: "   " });
  assert.ok(!check.ok && check.errors.name);
});

test("too-short name", () => {
  const check = validateEnquiry({ ...valid, name: "A" });
  assert.ok(!check.ok && check.errors.name);
  assert.ok(validateEnquiry({ ...valid, name: "Al" }).ok);
});

test("bad phone", () => {
  for (const phone of ["", "12345", "call me", "+971 50 123 4567 8901 23", "+971-50-abc"]) {
    const check = validateEnquiry({ ...valid, phone });
    assert.ok(!check.ok && check.errors.phone, phone);
  }
  assert.ok(validateEnquiry({ ...valid, phone: "(050) 123-4567" }).ok);
});

test("bad email", () => {
  for (const email of ["aisha", "aisha@", "aisha@example", "a b@example.com"]) {
    const check = validateEnquiry({ ...valid, email });
    assert.ok(!check.ok && check.errors.email, email);
  }
});

test("honeypot filled is spam, whatever else is sent", () => {
  assert.deepEqual(validateEnquiry({ website: "https://spam.example" }), { ok: true, spam: true });
});

test("overlong message, name and area", () => {
  const check = validateEnquiry({ ...valid, message: "x".repeat(2001), name: "x".repeat(81), area: "x".repeat(81) });
  assert.ok(!check.ok);
  assert.deepEqual(Object.keys(check.errors).sort(), ["area", "message", "name"]);
  assert.ok(validateEnquiry({ ...valid, message: "x".repeat(2000) }).ok);
});
