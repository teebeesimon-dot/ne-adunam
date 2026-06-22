import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.appUrl ?? "https://ne-adunam.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/create"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
