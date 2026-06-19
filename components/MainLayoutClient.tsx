"use client";

import BottomBar from "@/components/BottomBar";
import CommonCategoryBar from "@/components/CommonCategoryBar";
import ListHomeHeader from "@/components/ListHomeHeader";
import { shouldShowCommonCategoryBar } from "@/lib/categoryNav";
import { normalizePathname } from "@/lib/paths";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const HIDE_CHROME = ["/login", "/signup"];

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const showChrome = !HIDE_CHROME.includes(path);
  const showCommonCategoryBar = shouldShowCommonCategoryBar(path);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f5]">
      {showChrome && <ListHomeHeader />}

      <div
        className={`mx-auto flex w-full max-w-7xl flex-1 px-3 pb-4 lg:px-6 ${showChrome ? "pt-0" : "pt-4"}`}
      >
        <main className="min-w-0 flex-1">
          {showCommonCategoryBar && (
            <Suspense fallback={null}>
              <CommonCategoryBar />
            </Suspense>
          )}
          {children}
        </main>
      </div>

      {showChrome && (
        <div className="lg:hidden">
          <BottomBar />
        </div>
      )}
    </div>
  );
}
