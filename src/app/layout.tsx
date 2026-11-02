import type { Metadata } from "next";
import { Figtree, Fraunces, Shantell_Sans } from "next/font/google";
import { MobileBar } from "@/components/mobile-bar";
import { MotionProvider } from "@/components/motion-provider";
import { PawTrail } from "@/components/paw-trail";
import { RouteCurtain } from "@/components/route-curtain";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { shareImage } from "@/lib/metadata";
import { site } from "@/lib/site";
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

const title = "TeddyPups U.A.E. — Premium teacup puppies in Dubai";
const description =
  "Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders.";

// The home page's tags; every other page sets its own canonical, title and share tags.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { title, description, images: shareImage },
  twitter: { card: "summary_large_image", title, description, images: shareImage },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${fraunces.variable} ${shantell.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <RouteCurtain />
        <a
          href="#main"
          className="sr-only-focusable fixed top-4 left-4 z-[100] rounded-full bg-cocoa px-5 py-3 font-semibold text-milk"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="relative flex-1 pt-[var(--header-h)] outline-none">
          <MotionProvider>{children}</MotionProvider>
        </main>
        <SiteFooter />
        <MobileBar />
        <PawTrail />
        <SmoothScroll />
      </body>
    </html>
  );
}
