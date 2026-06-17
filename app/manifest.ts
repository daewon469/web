import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "분양프로",
    short_name: "분양프로",
    description: "분양상담사 구인구직 커뮤니티",
    start_url: "/list",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#0B1B3A",
    lang: "ko",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
