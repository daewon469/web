import { Auth } from "@/lib/api";
import { getSession } from "@/lib/session";

export const COMMON_CATEGORY_TABS = [
  { id: "home", label: "첫화면", requiresLogin: false },
  { id: "area", label: "지역현장", requiresLogin: false },
  { id: "custom", label: "맞춤저장", requiresLogin: true },
  { id: "map", label: "지도검색", requiresLogin: true },
  { id: "like", label: "관심현장", requiresLogin: true },
  { id: "ad", label: "광고", requiresLogin: false },
] as const;

export const COMMON_CATEGORY_TAB_TEXT_CLASS = "text-[17px] sm:text-[18px] font-bold text-black";

/** main(max-w-7xl) 좌·우 패딩 기준 카테고리 바·파란띠 full-bleed */
export const CATEGORY_BAR_BLEED_CLASS =
  "-left-[calc(0.75rem+max(0px,(100vw-80rem)/2))] w-screen lg:-left-[calc(1.5rem+max(0px,(100vw-80rem)/2))]";

export type CommonCategoryTabId = (typeof COMMON_CATEGORY_TABS)[number]["id"];

const COMMON_CATEGORY_PATHS = [
  "/list",
  "/list4",
  "/like",
  "/areasite",
  "/arealike",
  "/customsite",
  "/customlike",
] as const;

export function shouldShowCommonCategoryBar(pathname: string): boolean {
  return (COMMON_CATEGORY_PATHS as readonly string[]).includes(pathname);
}

export function getActiveCommonCategoryTab(
  pathname: string,
  mapOpen: boolean,
): CommonCategoryTabId {
  if (pathname === "/list4") return "ad";
  if (pathname === "/like") return "like";
  if (pathname === "/areasite" || pathname === "/arealike") return "area";
  if (pathname === "/customsite" || pathname === "/customlike") return "custom";
  if ((pathname === "/list" || pathname === "/") && mapOpen) return "map";
  return "home";
}

export function commonCategoryRequiresLogin(id: CommonCategoryTabId): boolean {
  return COMMON_CATEGORY_TABS.find((tab) => tab.id === id)?.requiresLogin ?? false;
}

export async function resolveCommonCategoryHref(id: CommonCategoryTabId): Promise<string> {
  switch (id) {
    case "home":
      return "/list";
    case "ad":
      return "/list4";
    case "map":
      return "/list?openMap=1";
    case "like":
      return "/like";
    case "area":
      return "/areasite";
    case "custom": {
      const { username } = getSession();
      if (!username) return "/customsite";
      try {
        const res = await Auth.getUser(username);
        const inds = res.user?.custom_industry_codes ?? [];
        const regs = res.user?.custom_region_codes ?? [];
        const has =
          (Array.isArray(inds) && inds.some((s) => String(s ?? "").trim())) ||
          (Array.isArray(regs) && regs.some((s) => String(s ?? "").trim()));
        return has ? "/customlike" : "/customsite";
      } catch {
        return "/customsite";
      }
    }
  }
}
