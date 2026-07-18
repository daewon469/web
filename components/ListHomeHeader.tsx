"use client";

import TitleSearchBar from "@/components/TitleSearchBar";
import { Auth, Notify } from "@/lib/api";
import { isListHomePath, isListMapOpen, LIST_HOME_PATH } from "@/lib/paths";
import { getSession, setLoggedOut } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV_BG = "#0B1B3A";

const utilityLinks = [
  { id: "write", label: "구인등록", href: "/write", requiresLogin: true },
  { id: "logout", label: "로그아웃" },
  { id: "myboard", label: "마이페이지", href: "/myboard", requiresLogin: true },
  { id: "notice", label: "공지사항", href: "/list5", requiresLogin: false },
  { id: "cs", label: "고객센터", href: "/write6", requiresLogin: true },
] as const;

function formatNotiLabel(count: number) {
  if (count <= 0) return "알림";
  return `알림(${count > 99 ? "99+" : count})`;
}

export default function ListHomeHeader() {
  const router = useRouter();
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

  const handleLogout = () => {
    if (!confirm("정말 로그아웃할까요?")) return;
    setLoggedOut();
    Auth.logOut();
    router.replace("/login");
  };

  const handleProtectedNav = (href: string) => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    router.push(href);
  };

  const handleNotiClick = () => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    router.push("/noti");
  };

  const handleLogoClick = () => {
    const onListHome = isListHomePath(pathname);
    const mapOpen =
      typeof window !== "undefined" && isListMapOpen(window.location.search);

    if (onListHome && !mapOpen) {
      window.location.reload();
      return;
    }

    router.replace(LIST_HOME_PATH);
  };

  const renderNotiButton = () => (
    <button
      key="noti"
      type="button"
      onClick={handleNotiClick}
      className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
    >
      {formatNotiLabel(unreadCount)}
    </button>
  );

  const renderUtilityLinks = () =>
    utilityLinks.flatMap((link) => {
      if (link.id === "logout") {
        if (!isLogin) {
          return [
            <Link
              key={link.id}
              href="/login"
              className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
            >
              로그인
            </Link>,
          ];
        }
        return [
          <button
            key={link.id}
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
          >
            {link.label}
          </button>,
        ];
      }

      if (link.requiresLogin) {
        const node = (
          <button
            key={link.id}
            type="button"
            onClick={() => handleProtectedNav(link.href)}
            className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
          >
            {link.label}
          </button>
        );
        if (link.id === "myboard") {
          return [node, renderNotiButton()];
        }
        return [node];
      }

      return [
        <Link
          key={link.id}
          href={link.href}
          className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
        >
          {link.label}
        </Link>,
      ];
    });

  return (
    <div className="w-full" style={{ backgroundColor: NAV_BG }}>
      <div className="px-4 pb-3 pt-1 sm:px-6">
        <div className="relative left-[-80px] mx-auto max-w-7xl">
          <div className="mr-[30px] flex translate-x-[80px] items-center justify-end gap-2 sm:gap-3 leading-none">
            {renderUtilityLinks()}
          </div>
          <div className="-mt-3.5 ml-[100px] flex items-center justify-start gap-2 sm:-mt-4">
            <button
              type="button"
              onClick={handleLogoClick}
              className="shrink-0 rounded-xl"
              aria-label="첫화면"
            >
              <Image
                src="/icon718.png"
                alt="분양프로"
                width={1024}
                height={258}
                className="h-10 w-auto"
                priority
              />
            </button>
            <div className="w-[min(100%,240px)] sm:w-[420px] md:w-[560px] lg:w-[640px] xl:w-[550px]">
              <TitleSearchBar redirectOnSearch />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
