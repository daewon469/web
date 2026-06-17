"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/session";

const HEADER_BG = "#0B1B3A";

const tabs = [
  { href: "/write", label: "구인등록", requiresLogin: true },
  { href: "/list4", label: "광고" },
  { href: "/list", label: "첫화면" },
  { href: "/myboard", label: "마이메뉴", requiresLogin: true },
] as const;

export default function TopBar() {
  const pathname = usePathname();
  const [isLogin, setIsLogin] = useState(false);

  const reloadSession = useCallback(() => {
    setIsLogin(getSession().isLogin);
  }, []);

  useEffect(() => {
    reloadSession();
    window.addEventListener("storage", reloadSession);
    window.addEventListener("session-updated", reloadSession);
    return () => {
      window.removeEventListener("storage", reloadSession);
      window.removeEventListener("session-updated", reloadSession);
    };
  }, [reloadSession]);

  const resolveHref = (tab: (typeof tabs)[number]) => {
    if ("requiresLogin" in tab && tab.requiresLogin && !isLogin) return "/login";
    return tab.href;
  };

  const isActive = (href: string) => {
    if (href === "/list") return pathname === "/list" || pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: HEADER_BG }}>
      <div className="mx-auto flex h-12 max-w-3xl items-stretch px-1 sm:px-2">
        {tabs.map((tab) => {
          const href = resolveHref(tab);
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center px-1 text-white transition-opacity hover:opacity-90"
            >
              <span
                className={`text-sm font-bold ${active ? "text-white" : "text-white/75"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
        {!isLogin && (
          <Link
            href="/login"
            className="flex flex-1 flex-col items-center justify-center px-1 text-sm font-bold text-[#4A6CF7]"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
