import type { UIConfigBannerItem } from "@/lib/api";

export function chunkBannerRows(items: UIConfigBannerItem[], colsPerRow: number): UIConfigBannerItem[][] {
  const valid = items.filter((it) => String(it.image_url ?? "").trim());
  const rows: UIConfigBannerItem[][] = [];
  for (let i = 0; i < valid.length; i += colsPerRow) {
    rows.push(valid.slice(i, i + colsPerRow));
  }
  return rows;
}
