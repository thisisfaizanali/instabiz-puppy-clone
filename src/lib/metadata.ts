import type { Metadata } from "next";
import { site } from "./site.ts";

// The logo is the share image, as on the reference.
export const shareImage = "/brand/logo.png";

// Canonical, Open Graph and Twitter tags for a page, with the same tags as the reference.
// Relative URLs resolve against metadataBase, so they always point at this site.
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const fullTitle = `${title} | ${site.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      siteName: site.name,
      locale: "en_AE",
      type: "website",
      images: shareImage,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: shareImage },
  };
}
