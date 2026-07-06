import type { UIConfigBannerItem } from "@/lib/api";

export type WebBannerRotation = 3 | 5;

export function chunkBannerRows(items: UIConfigBannerItem[], colsPerRow: number): UIConfigBannerItem[][] {
  const valid = items.filter((it) => String(it.image_url ?? "").trim());
  const rows: UIConfigBannerItem[][] = [];
  for (let i = 0; i < valid.length; i += colsPerRow) {
    rows.push(valid.slice(i, i + colsPerRow));
  }
  return rows;
}

export function pickWebBannerRow(
  items: UIConfigBannerItem[],
  colsPerRow: number,
  rotationCount: WebBannerRotation,
  slotIndex: number,
): UIConfigBannerItem[] {
  const valid = items.filter((it) => String(it.image_url ?? "").trim());
  if (valid.length === 0) return [];
  const pages = Math.min(rotationCount, Math.max(1, Math.ceil(valid.length / colsPerRow)));
  const page = ((slotIndex % pages) + pages) % pages;
  const start = page * colsPerRow;
  const row = valid.slice(start, start + colsPerRow);
  while (row.length < colsPerRow && valid.length > 0) {
    row.push(valid[row.length % valid.length]);
  }
  return row.slice(0, colsPerRow);
}
