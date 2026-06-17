"use client";

import NavIcon, { type NavIconName } from "@/components/NavIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Notify } from "@/lib/api";
import { getSession } from "@/lib/session";

const HEADER_BG = "#0B1B3A";
const TAB_ICON_SIZE = 23;

const tabs = [
  { href: "/write", label: "구인등록", icon: "create" as const, requiresLogin: true },
  { href: "/list4", label: "광고", icon: "megaphone" as const },
  { href: "/list", label: "첫화면", icon: "home" as const },
  { href: "/noti", label: "알림", icon: "notifications" as const, requiresLogin: true },
  { href: "/myboard", label: "마이메뉴", icon: "person" as const, requiresLogin: true },
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

  const renderTab = (icon: NavIconName, label: string, href: string, active: boolean, badge?: number) => (
    <Link
      href={href}
      className="relative flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-white transition-opacity hover:opacity-90"
    >
      <span className="flex h-[26px] items-center justify-center">
        <NavIcon name={icon} size={TAB_ICON_SIZE} className={active ? "text-white" : "text-white/75"} />
      </span>
      <span className={`text-[13px] font-bold leading-none ${active ? "text-white" : "text-white/75"}`}>
        {label}
      </span>
      {badge != null && badge > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0B1B3A] bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: HEADER_BG }}>
      <div className="mx-auto flex h-14 w-full max-w-7xl items-stretch px-1 sm:px-2">
        {tabs.map((tab) => {
          const href = resolveHref(tab);
          const active = isActive(tab.href);
          const showBadge = tab.href === "/noti" && unreadCount > 0;
          return (
            <div key={tab.href} className="flex flex-1">
              {renderTab(tab.icon, tab.label, href, active, showBadge ? unreadCount : undefined)}
            </div>
          );
        })}
        {!isLogin && (
          <div className="flex flex-1">
            {renderTab("log-in", "로그인", "/login", pathname === "/login")}
          </div>
        )}
      </div>
    </header>
  );
}
