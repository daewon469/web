"use client";

import ListHomeToolbar from "@/components/ListHomeToolbar";
import { normalizePathname } from "@/lib/paths";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const HIDE_CHROME = ["/login", "/signup"];

function ToolbarFallback() {
  return <div className="h-14 w-full border-b border-black bg-[#0B1B3A]" aria-hidden />;
}

export default function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const showChrome = !HIDE_CHROME.includes(path);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f5f5f5]">
      {showChrome && (
        <Suspense fallback={<ToolbarFallback />}>
          <ListHomeToolbar />
        </Suspense>
      )}

      <div
        className={`mx-auto flex w-full max-w-7xl flex-1 px-3 pb-4 lg:px-6 ${showChrome ? "pt-0" : "pt-4"}`}
      >
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
