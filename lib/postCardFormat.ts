import type { Post } from "@/lib/api";

export function simpleProvince(p?: string) {
  if (!p) return "";
  const map: Record<string, string> = {
    충청북도: "충북",
    충청남도: "충남",
    경상북도: "경북",
    경상남도: "경남",
    전라북도: "전북",
    전라남도: "전남",
    강원도: "강원",
  };
  if (map[p]) return map[p];
  return p.replace(/(특별시|광역시|자치시|자치도|특별자치도|도|특별자치시)$/g, "");
}

export function formatProvinceCity(province: string, city: string) {
  const prov = simpleProvince(province?.trim() ?? "");
  const rawCity = city == null ? "" : String(city).trim();
  const c = rawCity.toLowerCase() === "null" ? "" : rawCity;
  const cityOk = !!c && c !== "전체";
  return [prov, cityOk ? c : ""].filter(Boolean).join(" ");
}

export function formatRoles(post: Post) {
  const roles = [
    post.total_use ? "총괄" : null,
    post.branch_use ? "본부장" : null,
    post.hq_use ? "본부" : null,
    post.leader_use ? "팀장" : null,
    post.member_use ? "팀원" : null,
    post.team_use ? "팀" : null,
    post.each_use ? "각개" : null,
    post.other_role_name ? String(post.other_role_name) : null,
  ].filter(Boolean);

  const fees = [
    post.total_use ? post.total_fee : null,
    post.branch_use ? post.branch_fee : null,
    post.hq_use ? post.hq_fee : null,
    post.leader_use ? post.leader_fee : null,
    post.member_use ? post.member_fee : null,
    post.team_use ? post.team_fee : null,
    post.each_use ? post.each_fee : null,
    post.other_role_name ? post.other_role_fee : null,
  ].filter((f) => f?.trim());

  const roleText = roles.join("/") || "미정";
  const feeText = fees.length ? "/" + fees.join("/") : "";
  return roleText + feeText;
}

/** Postcard_S 신유형 — API card_type 값과 맞출 때 수정 */
export const CARD_TYPE_S = 5;
