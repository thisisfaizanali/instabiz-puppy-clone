// Enquiry validation shared by every enquiry form. Field limits follow the reference
// form (name 2 to 80, area up to 80, message up to 2000); its server-side wording isn't
// visible, so the messages here are our own.

export type Enquiry = {
  name: string;
  phone: string;
  email: string;
  area: string;
  message: string;
  // Slug of the puppy the enquiry is about, if any.
  puppy: string;
};

export type EnquiryField = Exclude<keyof Enquiry, "puppy">;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export type EnquiryCheck =
  | { ok: true; enquiry: Enquiry; spam: false }
  // The hidden "website" field was filled in: a bot. Callers report success without sending.
  | { ok: true; spam: true }
  | { ok: false; errors: EnquiryErrors };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(raw: Record<string, unknown>): EnquiryCheck {
  const field = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string).trim() : "");
  if (field("website")) return { ok: true, spam: true };

  const enquiry: Enquiry = {
    name: field("name"),
    phone: field("phone"),
    email: field("email"),
    area: field("area"),
    message: field("message"),
    puppy: field("puppy"),
  };
  const errors: EnquiryErrors = {};

  if (!enquiry.name) errors.name = "Please tell us your name.";
  else if (enquiry.name.length < 2) errors.name = "Your name needs at least 2 letters.";
  else if (enquiry.name.length > 80) errors.name = "Please keep your name under 80 characters.";

  // Digits with optional +, spaces, dashes, dots and brackets; 7 to 15 digits as in E.164.
  const digits = enquiry.phone.replace(/\D/g, "");
  if (!enquiry.phone) errors.phone = "Please add a phone or WhatsApp number.";
  else if (!/^\+?[\d\s().-]+$/.test(enquiry.phone) || digits.length < 7 || digits.length > 15)
    errors.phone = "That number doesn't look right. Please include the country code, e.g. +971 50 123 4567.";

  if (enquiry.email && (enquiry.email.length > 254 || !emailPattern.test(enquiry.email)))
    errors.email = "That email doesn't look quite right.";

  if (enquiry.area.length > 80) errors.area = "Please keep your area under 80 characters.";

  if (enquiry.message.length > 2000) errors.message = "Please keep your message under 2,000 characters.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, enquiry, spam: false };
}
