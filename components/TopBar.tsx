"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Notify } from "@/lib/api";
import { getSession } from "@/lib/session";

const HEADER_BG = "#0B1B3A";

const tabs = [
  { href: "/write", label: "구인등록", requiresLogin: true },
  { href: "/list4", label: "광고" },
  { href: "/list", label: "첫화면" },
  { href: "/noti", label: "알림", requiresLogin: true },
  { href: "/myboard", label: "마이메뉴", requiresLogin: true },
] as const;

export default function TopBar() {
  const pathname = usePathname();
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const reloadSession = useCallback(() => {
    const session = getSession();
    setIsLogin(session.isLogin);
    setUsername(session.username);
  }, []);

  const refreshUnread = useCallback(async () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await Notify.getUnreadCount(session.username);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
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

  useEffect(() => {
    if (!isLogin || !username) {
      setUnreadCount(0);
      return;
    }
    refreshUnread();
    const onNotify = () => refreshUnread();
    window.addEventListener("notify-updated", onNotify);
    const timer = window.setInterval(refreshUnread, 60_000);
    return () => {
      window.removeEventListener("notify-updated", onNotify);
      window.clearInterval(timer);
    };
  }, [isLogin, username, refreshUnread]);

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
      <div className="mx-auto flex h-12 w-full max-w-7xl items-stretch px-1 sm:px-2">
        {tabs.map((tab) => {
          const href = resolveHref(tab);
          const active = isActive(tab.href);
          const showBadge = tab.href === "/noti" && unreadCount > 0;
          return (
            <Link
              key={tab.href}
              href={href}
              className="relative flex flex-1 flex-col items-center justify-center px-1 text-white transition-opacity hover:opacity-90"
            >
              <span
                className={`text-sm font-bold ${active ? "text-white" : "text-white/75"}`}
              >
                {tab.label}
              </span>
              {showBadge && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
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
