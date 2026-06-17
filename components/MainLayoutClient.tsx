"use client";

import BottomBar from "@/components/BottomBar";
import DesktopSideNav from "@/components/DesktopSideNav";
import TopBar from "@/components/TopBar";
import { usePathname } from "next/navigation";

const HIDE_BOTTOM_BAR = ["/login", "/signup"];
const HIDE_TOP_BAR = ["/login", "/signup"];
const HIDE_SIDE_NAV = ["/login", "/signup"];

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomBar = !HIDE_BOTTOM_BAR.includes(pathname);
  const showTopBar = !HIDE_TOP_BAR.includes(pathname);
  const showSideNav = !HIDE_SIDE_NAV.includes(pathname);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f5]">
      {showTopBar && (
        <div className="lg:hidden">
          <TopBar />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-3 py-4 lg:px-6">
        {showSideNav && <DesktopSideNav />}
        <main className="min-w-0 flex-1 lg:max-w-3xl xl:max-w-4xl">{children}</main>
      </div>
      {showBottomBar && (
        <div className="lg:hidden">
          <BottomBar />
        </div>
      )}
    </div>
  );
}
