import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "http://localhost:3000";
  return ["", "/forum", "/programme", "/metiers", "/intervenants", "/partenaires", "/faq", "/contact", "/inscription", "/mentions-legales", "/confidentialite"].map((path) => ({
    url: `${base}${path}`,
  }));
}
