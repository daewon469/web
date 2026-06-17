"use client";

import BottomBar from "@/components/BottomBar";
import TopBar from "@/components/TopBar";
import { usePathname } from "next/navigation";

const HIDE_BOTTOM_BAR = ["/login", "/signup"];
const HIDE_TOP_BAR = ["/login", "/signup"];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showBottomBar = !HIDE_BOTTOM_BAR.includes(pathname);
  const showTopBar = !HIDE_TOP_BAR.includes(pathname);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f5]">
      {showTopBar && <TopBar />}
      <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-4">{children}</div>
      {showBottomBar && <BottomBar />}
    </div>
  );
}
