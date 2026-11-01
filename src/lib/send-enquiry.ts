"use server";

import { type EnquiryErrors, resendConfig, validateEnquiry } from "./enquiry";
import { getPuppy } from "./puppies";

export type EnquiryState = {
  ok: boolean;
  // Form-level message, shown above the fields.
  message?: string;
  errors?: EnquiryErrors;
};

// Validates, then emails the enquiry through the Resend HTTP API. Without both RESEND_API_KEY
// and ENQUIRY_TO_EMAIL (local dev) the enquiry is logged instead and the form still succeeds.
// Inputs are kept on failure: once hydrated, the form submits through a transition.
export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const check = validateEnquiry(Object.fromEntries(formData));
  if (!check.ok) return { ok: false, message: "Please check the highlighted fields.", errors: check.errors };
  if (check.spam) return { ok: true };

  const { enquiry } = check;
  const puppy = enquiry.puppy ? getPuppy(enquiry.puppy) : undefined;
  const about = puppy ? `${puppy.displayName}${puppy.name ? ` (${puppy.breed})` : ""}` : "";
  const text = [
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    enquiry.email && `Email: ${enquiry.email}`,
    enquiry.area && `Area: ${enquiry.area}`,
    puppy && `Puppy: ${about}, /puppies/${puppy.slug}`,
    enquiry.message && `\n${enquiry.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  const resend = resendConfig(process.env);
  if (!resend.ok) {
    if (resend.warning) console.warn(resend.warning);
    console.info(`Enquiry received (email not configured, not emailed):\n${text}`);
    return { ok: true };
  }

  const failed = {
    ok: false,
    message: "Sorry, we couldn't send your enquiry just now. Please try again, or message us on WhatsApp.",
  };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resend.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "TeddyPups enquiries <onboarding@resend.dev>",
        to: [resend.to],
        reply_to: enquiry.email || undefined,
        subject: about ? `New enquiry about ${about}` : `New enquiry from ${enquiry.name}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error(`Resend rejected an enquiry: ${res.status} ${await res.text()}`);
      return failed;
    }
  } catch (error) {
    console.error("Could not reach Resend:", error);
    return failed;
  }
  return { ok: true };
}
