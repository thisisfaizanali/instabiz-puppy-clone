import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// The app's own rules from the reference robots.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
