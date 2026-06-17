export type RegionObj = { province: string; city: string };

export const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export const regionObjToCode = (r: RegionObj): string => {
  const p = (r?.province || "").trim();
  const c = (r?.city || "").trim() || "전체";
  if (!p) return "";
  if (p === "전체") return "전체";
  if (c === "전체") return p;
  return `${p} ${c}`;
};

export const regionCodeToObj = (code: string): RegionObj | null => {
  const v = (code || "").trim();
  if (!v) return null;
  if (v === "전체") return { province: "전체", city: "전체" };
  const parts = v.split(" ").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return { province: parts[0], city: "전체" };
  return { province: parts[0], city: parts.slice(1).join(" ") || "전체" };
};

export const parseAreaCodesToPostListParams = (codes: string[]) => {
  const cleaned = uniq(codes.map((s) => String(s ?? "").trim()).filter(Boolean));
  if (cleaned.includes("전체")) {
    return { province: undefined, city: undefined, regions: undefined };
  }
  if (cleaned.length <= 0) {
    return { province: undefined, city: undefined, regions: undefined };
  }
  if (cleaned.length === 1) {
    const one = cleaned[0];
    const parts = one.split(" ").map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return { province: one, city: undefined, regions: undefined };
    return { province: parts[0], city: parts.slice(1).join(" "), regions: undefined };
  }
  return { province: undefined, city: undefined, regions: cleaned.join(",") };
};
