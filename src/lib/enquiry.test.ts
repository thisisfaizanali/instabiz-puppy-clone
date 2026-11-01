import assert from "node:assert/strict";
import { test } from "node:test";
import { resendConfig, validateEnquiry } from "./enquiry.ts";

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

test("resend is configured only with both variables, and warns when just one is set", () => {
  assert.deepEqual(resendConfig({ RESEND_API_KEY: "re_test", ENQUIRY_TO_EMAIL: "team@example.com" }), {
    ok: true,
    key: "re_test",
    to: "team@example.com",
  });
  assert.deepEqual(resendConfig({}), { ok: false });
  assert.deepEqual(resendConfig({ RESEND_API_KEY: " ", ENQUIRY_TO_EMAIL: "" }), { ok: false });
  const noTo = resendConfig({ RESEND_API_KEY: "re_test" });
  assert.ok(!noTo.ok && noTo.warning?.includes("ENQUIRY_TO_EMAIL"));
  const noKey = resendConfig({ ENQUIRY_TO_EMAIL: "team@example.com" });
  assert.ok(!noKey.ok && noKey.warning?.includes("RESEND_API_KEY"));
});
