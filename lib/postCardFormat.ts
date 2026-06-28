import { Posts, type Post } from "@/lib/api";
import { regionCodeToObj, toProvinceShort } from "@/lib/regionUtils";

/** Postcard_S 신유형 — API card_type 값과 맞출 때 수정 */
export const CARD_TYPE_S = 5;

/** 목록 슬라이드(5유형)는 구인글(post_type=1)만 대상 */
export const JOB_POST_TYPE = 1;

export function isCardTypeS(cardType: unknown) {
  return Number(cardType) === CARD_TYPE_S;
}

export function isSlideListPost(post: Post) {
  return Number(post.post_type) === JOB_POST_TYPE && isCardTypeS(post.card_type);
}

export function filterSlideListPosts(items: Post[]) {
  return items.filter(isSlideListPost);
}

export function orderPostsByCardType(items: Post[]): Post[] {
  const type1 = items.filter((p) => p.card_type === 1);
  const type2 = items.filter((p) => p.card_type === 2);
  const type3 = items.filter((p) => p.card_type === 3);
  return [...type1, ...type2, ...type3];
}

/** 1·2·3유형을 각각 별도 3열 그리드로 렌더할 때 사용 */
export function groupFeedByCardType(items: Post[]): Post[][] {
  return [1, 2, 3]
    .map((type) => items.filter((p) => Number(p.card_type) === type))
    .filter((group) => group.length > 0);
}

/** S유형(슬라이드)과 1·2·3유형 피드를 분리 */
export function splitSlideAndFeedPosts(items: Post[]) {
  const slide = filterSlideListPosts(items);
  const feed = orderPostsByCardType(items.filter((p) => !isCardTypeS(p.card_type)));
  return { slide, feed };
}

export function orderSlidePosts(items: Post[], slidePostIds: number[]): Post[] {
  const slide = items.filter(isSlideListPost);
  if (slidePostIds.length === 0) return slide;
  const byId = new Map(slide.map((p) => [Number(p.id), p]));
  const ordered = slidePostIds
    .map((id) => byId.get(id))
    .filter(Boolean) as Post[];
  const rest = slide.filter((p) => !slidePostIds.includes(Number(p.id)));
  return [...ordered, ...rest];
}

export function postMatchesRegionParams(
  post: Post,
  params: { province?: string; city?: string; regions?: string },
): boolean {
  if (!params.province && !params.city && !params.regions) return true;

  const postProv = toProvinceShort(post.province);
  const postCity = String(post.city ?? "").trim();

  if (params.regions) {
    const codes = params.regions.split(",").map((s) => s.trim()).filter(Boolean);
    return codes.some((code) => {
      const obj = regionCodeToObj(code);
      if (!obj || obj.province === "전체") return true;
      const wantProv = toProvinceShort(obj.province);
      if (postProv !== wantProv && post.province !== obj.province) return false;
      if (!obj.city || obj.city === "전체") return true;
      return postCity === obj.city;
    });
  }

  const wantProv = toProvinceShort(params.province ?? "");
  if (postProv !== wantProv && post.province !== params.province) return false;
  if (params.city) return postCity === params.city;
  return true;
}

export type CustomMatchConfig = {
  industryCodes: string[];
  regionCodes: string[];
  roleCodes: string[];
};

export function postMatchesCustomConfig(post: Post, config: CustomMatchConfig): boolean {
  const industries = config.industryCodes.map((s) => s.trim()).filter(Boolean);
  const regions = config.regionCodes.map((s) => s.trim()).filter(Boolean);
  const roles = config.roleCodes.map((s) => s.trim()).filter(Boolean);

  const industryOk =
    industries.length === 0 ||
    industries.some((code) => String(post.job_industry ?? "").trim() === code);

  const regionOk =
    regions.length === 0 ||
    regions.some((code) => {
      if (code === "전체") return true;
      const obj = regionCodeToObj(code);
      if (!obj) return false;
      if (obj.province === "전체") return true;
      const postProv = toProvinceShort(post.province);
      const wantProv = toProvinceShort(obj.province);
      if (postProv !== wantProv && post.province !== obj.province) return false;
      if (!obj.city || obj.city === "전체") return true;
      return String(post.city ?? "").trim() === obj.city;
    });

  const roleOk =
    roles.length === 0 ||
    roles.some((role) => {
      if (role === "총괄") return !!post.total_use;
      if (role === "본부장") return !!post.branch_use;
      if (role === "팀장") return !!post.leader_use;
      if (role === "팀원") return !!post.member_use;
      if (role === "기타") return !!String(post.other_role_name ?? "").trim();
      return false;
    });

  return industryOk && regionOk && roleOk;
}

export function postMatchesTitleQuery(post: Post, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return String(post.title ?? "").toLowerCase().includes(q);
}

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

/** API liked 필드 정규화 (boolean·숫자·문자열) */
export function isPostLiked(liked: unknown): boolean {
  return liked === true || liked === 1 || liked === "1" || liked === "true";
}

export function normalizePostLiked<T extends Post>(post: T): T {
  return { ...post, liked: isPostLiked(post.liked) };
}

export async function fetchPostsByIds(
  ids: number[],
  opts?: { username?: string },
): Promise<Post[]> {
  const out: Post[] = [];
  const BATCH = 15;
  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      slice.map((id) => Posts.get(Number(id), { username: opts?.username })),
    );
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) out.push(normalizePostLiked(r.value));
    });
  }
  const byId = new Map(out.map((p) => [Number(p.id), p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Post[];
}

/** post_type=1 구인글 중 card_type=5만 조회 */
export async function fetchSlideListPosts(opts?: {
  username?: string;
  maxItems?: number;
}): Promise<Post[]> {
  const maxItems = opts?.maxItems ?? 20;
  const { items } = await Posts.listByType(JOB_POST_TYPE, {
    username: opts?.username,
    status: "published",
    limit: 50,
  });
  return filterSlideListPosts(items).map(normalizePostLiked).slice(0, maxItems);
}

/** UIConfig slide_post_ids 또는 card_type=5 구인글을 슬라이더용으로 조회 */
export async function resolveSlidePosts(slidePostIds: number[]): Promise<Post[]> {
  const items = await fetchSlideListPosts({ maxItems: 50 });

  if (slidePostIds.length === 0) {
    return items.slice(0, 20);
  }

  const byId = new Map(items.map((p) => [Number(p.id), p]));
  const missing = slidePostIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    const fetched = filterSlideListPosts(await fetchPostsByIds(missing));
    fetched.forEach((p) => byId.set(Number(p.id), p));
  }

  return slidePostIds
    .map((id) => byId.get(id))
    .filter((p): p is Post => !!p && isSlideListPost(p));
}
