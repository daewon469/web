export type RegionObj = { province: string; city: string };

export const QUICK_REGION_OPTIONS = [
  "전국",
  "서울",
  "경기",
  "인천",
  "강원",
  "제주",
  "부산",
  "울산",
  "대구",
  "광주",
  "대전",
  "세종",
  "경남",
  "경북",
  "전남",
  "전북",
  "충남",
  "충북",
] as const;

export type QuickRegionLabel = (typeof QUICK_REGION_OPTIONS)[number];

export const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export const toProvinceShort = (name?: string) => {
  let short = String(name ?? "")
    .trim()
    .replace(/특별시|광역시|특별자치시|특별자치도|도/g, "");
  short = short
    .replace(/^충청/, "충")
    .replace(/^경상/, "경")
    .replace(/^전라/, "전");
  return short;
};

export const convertShortToFullProvince = (short: string): string => {
  const map: Record<string, string> = {
    전체: "전체",
    서울: "서울특별시",
    경기: "경기도",
    인천: "인천광역시",
    강원: "강원특별자치도",
    충북: "충청북도",
    충남: "충청남도",
    대전: "대전광역시",
    세종: "세종특별자치시",
    경북: "경상북도",
    경남: "경상남도",
    부산: "부산광역시",
    대구: "대구광역시",
    전북: "전북특별자치도",
    전남: "전라남도",
    광주: "광주광역시",
    울산: "울산광역시",
    제주: "제주특별자치도",
  };
  return map[short] || short;
};

const regionToCode = (r: RegionObj) => {
  const p = toProvinceShort(r.province);
  const c = (r.city || "").trim() || "전체";
  if (!p || p === "전체") return "전체";
  return c === "전체" ? p : `${p} ${c}`;
};

export const selectedRegionsToPostListParams = (selectedRegions: RegionObj[]) => {
  const regs = (selectedRegions || []).filter(Boolean);
  const nationwide = regs.some((r) => r.province === "전체");
  if (nationwide || regs.length === 0) {
    return { province: undefined as string | undefined, city: undefined as string | undefined, regions: undefined as string | undefined };
  }
  if (regs.length === 1) {
    const province = toProvinceShort(regs[0].province);
    const city = regs[0].city === "전체" ? undefined : regs[0].city;
    return { province, city, regions: undefined as string | undefined };
  }
  return {
    province: undefined as string | undefined,
    city: undefined as string | undefined,
    regions: regs.map(regionToCode).filter(Boolean).join(","),
  };
};

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
