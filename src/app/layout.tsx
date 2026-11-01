import type { Metadata } from "next";
import { Figtree, Fraunces, Shantell_Sans } from "next/font/google";
import { MobileBar } from "@/components/mobile-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const shantell = Shantell_Sans({
  variable: "--font-shantell",
  subsets: ["latin"],
  axes: ["BNCE", "INFM"],
});

export const metadata: Metadata = {
  title: {
    default: "TeddyPups U.A.E. — Premium teacup puppies in Dubai",
    template: "%s | TeddyPups U.A.E.",
  },
  description:
    "Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} ${shantell.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main"
          className="sr-only-focusable fixed top-4 left-4 z-[100] rounded-full bg-cocoa px-5 py-3 font-semibold text-milk"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="relative flex-1 pt-[var(--header-h)] outline-none">
          {children}
        </main>
        <SiteFooter />
        <MobileBar />
      </body>
    </html>
  );
}
