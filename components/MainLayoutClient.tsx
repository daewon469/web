"use client";

import ListHomeToolbar from "@/components/ListHomeToolbar";
import { normalizePathname } from "@/lib/paths";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const HIDE_CHROME = ["/login", "/signup"];
const MYBOARD_MENU_PATHS = [
  "/myboard",
  "/points",
  "/cash",
  "/payment/toss",
  "/referrals",
  "/referralranking",
  "/referralnetwork",
  "/mypage",
  "/mypage3",
  "/mypage4",
  "/mypage5",
  "/mypage6",
  "/noti",
  "/areasite",
  "/customsite",
  "/list5",
  "/list6",
  "/list7",
  "/write6",
  "/write7",
  "/adminusers",
  "/titlesearchadmin",
  "/slidepostsadmin",
  "/todaystatus",
  "/topbanneradmin",
  "/banneradmin",
  "/webtopbanneradmin",
  "/webbanneradmin",
  "/popupadmin",
] as const;

function ToolbarFallback() {
  return <div className="h-14 w-full border-b border-black bg-[#0B1B3A]" aria-hidden />;
}

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const showChrome = !HIDE_CHROME.includes(path);
  const isMyboardMenuPath = MYBOARD_MENU_PATHS.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
  const isMyboardSubPage = isMyboardMenuPath && path !== "/myboard";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f5]">
      {showChrome && (
        <Suspense fallback={<ToolbarFallback />}>
          <ListHomeToolbar />
        </Suspense>
      )}

      <div
        className={`mx-auto flex w-full flex-1 px-3 pb-4 lg:px-6 ${
          isMyboardSubPage ? "max-w-4xl" : "max-w-7xl"
        } ${
          showChrome ? (isMyboardMenuPath ? "pt-3" : "pt-0") : "pt-4"
        }`}
      >
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
