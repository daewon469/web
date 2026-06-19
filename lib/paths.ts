/** URL pathname을 비교용으로 정규화 (trailing slash·쿼리 제거) */
export function normalizePathname(pathname: string): string {
  const base = pathname.split("?")[0].split("#")[0];
  if (!base || base === "/") return "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function isListHomePath(pathname: string): boolean {
  return normalizePathname(pathname) === "/list";
}

export function isListMapOpen(search: string | URLSearchParams): boolean {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  const value = params.get("openMap");
  return value === "1" || value === "true";
}

export const LIST_HOME_PATH = "/list";
