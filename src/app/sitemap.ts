import type { MetadataRoute } from "next";
import { puppies } from "@/data/puppies";
import { site } from "@/lib/site";

const staticRoutes = ["/", "/puppies", "/gone-home", "/happy-families", "/how-it-works", "/faq", "/contact"];

// As on the reference: the static pages, then every puppy with its cover photo.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map((path) => ({ url: `${site.url}${path}` })),
    ...puppies.map((puppy) => {
      const cover = puppy.media[0].poster ?? puppy.media[0];
      return { url: `${site.url}/puppies/${puppy.slug}`, images: [`${site.url}${cover.url}`] };
    }),
  ];
}
