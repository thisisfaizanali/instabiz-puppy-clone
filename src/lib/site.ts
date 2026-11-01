// The business number, used for calls and WhatsApp.
const phoneNumber = "971541676733";

// A wa.me link that opens WhatsApp with the message already typed.
export function whatsappLink(message: string) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

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
    display: "+971 54 167 6733",
    href: `tel:+${phoneNumber}`,
  },
  whatsapp: whatsappLink("Hi TeddyPups! I'd love to know more about your puppies."),
  email: "teddypupsadmin@gmail.com",
  address: "Downtown Dubai, United Arab Emirates",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/teddypups.worldwide/" },
    { label: "TikTok", href: "https://www.tiktok.com/@teddypupsuae" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61567496944539" },
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
