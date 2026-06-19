/** URL pathname을 비교용으로 정규화 (trailing slash·쿼리 제거) */
export function normalizePathname(pathname: string): string {
  const base = pathname.split("?")[0].split("#")[0];
  if (!base || base === "/") return "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function isListHomePath(pathname: string): boolean {
  return normalizePathname(pathname) === "/list";
}
