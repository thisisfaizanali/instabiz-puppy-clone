// The number people call, and the separate one WhatsApp messages go to.
const phoneNumber = "971500000000";
const whatsappNumber = "919898124987";
const socialHref = "https://www.instabizweb.com/";

export const site = {
  name: "TeddyPups U.A.E.",
  shortName: "TeddyPups",
  // Origin for absolute URLs (metadataBase, JSON-LD, shared links, enquiry emails): SITE_URL,
  // then the production domain Vercel provides, then local dev. A getter, so the env vars are
  // only read where it's used, which is server code; client components never touch it.
  get url() {
    if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    return "http://localhost:3000";
  },
  phone: {
    display: "+971 50 000 0000",
    href: `tel:+${phoneNumber}`,
  },
  // Every WhatsApp link on the site is this one, whatever the page.
  whatsapp: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Insta Biz Web, I'd like to discuss a project.")}`,
  email: "info@instabizweb.com",
  address: "Downtown Dubai, United Arab Emirates",
  // The reference points all three at its parent site.
  socials: [
    { label: "Instagram", href: socialHref },
    { label: "TikTok", href: socialHref },
    { label: "Facebook", href: socialHref },
  ],
  nav: [
    { label: "Home", href: "/" },
    { label: "Puppies", href: "/puppies" },
    { label: "Happy families", href: "/happy-families" },
    { label: "How it works", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
    { label: "Visit & contact", href: "/contact" },
  ],
} as const;
