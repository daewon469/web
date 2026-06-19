"use client";

import BottomBar from "@/components/BottomBar";
import CommonCategoryBar from "@/components/CommonCategoryBar";
import DesktopSideNav from "@/components/DesktopSideNav";
import ListHomeHeader from "@/components/ListHomeHeader";
import TopBar from "@/components/TopBar";
import { shouldShowCommonCategoryBar } from "@/lib/categoryNav";
import { isListHomePath, normalizePathname } from "@/lib/paths";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const HIDE_BOTTOM_BAR = ["/login", "/signup"];
const HIDE_TOP_BAR = ["/login", "/signup", "/list"];
const HIDE_SIDE_NAV = ["/login", "/signup"];

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const isListHome = isListHomePath(pathname);
  const showBottomBar = !HIDE_BOTTOM_BAR.includes(path);
  const showTopBar = !HIDE_TOP_BAR.includes(path);
  const showSideNav = !HIDE_SIDE_NAV.includes(path);
  const showCommonCategoryBar = shouldShowCommonCategoryBar(path) && !isListHome;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f5]">
      {isListHome && <ListHomeHeader />}

      {showTopBar && (
        <div className="lg:hidden">
          <TopBar />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-3 py-4 lg:px-6">
        {showSideNav && (
          <Suspense fallback={<aside className="hidden w-56 shrink-0 lg:block" aria-hidden />}>
            <DesktopSideNav />
          </Suspense>
        )}
        <main className="min-w-0 flex-1 lg:max-w-3xl xl:max-w-4xl">
          {isListHome && (
            <Suspense fallback={null}>
              <CommonCategoryBar />
            </Suspense>
          )}
          {showCommonCategoryBar && (
            <div className="-mt-4 lg:mt-0">
              <Suspense fallback={null}>
                <CommonCategoryBar />
              </Suspense>
            </div>
          )}
          {children}
        </main>
      </div>

      {showBottomBar && (
        <div className="lg:hidden">
          <BottomBar />
        </div>
      )}
    </div>
  );
}
