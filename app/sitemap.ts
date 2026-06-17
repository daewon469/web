import type { MetadataRoute } from "next";
import { fetchRecentPostIds } from "@/lib/serverApi";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = [
  "/list",
  "/list2",
  "/list3",
  "/list4",
  "/list5",
  "/list6",
  "/list7",
  "/textsearch",
  "/login",
  "/signup",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/list" ? "hourly" : "daily",
    priority: path === "/list" ? 1 : 0.7,
  }));

  const posts = await fetchRecentPostIds(80);
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...postEntries];
}
