"use client";

import TitleSearchBar from "@/components/TitleSearchBar";
import { Auth } from "@/lib/api";
import { getSession, setLoggedOut } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV_BG = "#0B1B3A";

const utilityLinks = [
  { id: "logout", label: "로그아웃" },
  { id: "myboard", label: "마이페이지", href: "/myboard", requiresLogin: true },
  { id: "notice", label: "공지사항", href: "/list5", requiresLogin: false },
  { id: "cs", label: "고객센터", href: "/write6", requiresLogin: true },
] as const;

export default function ListHomeHeader() {
  const router = useRouter();
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

  return (
    <div className="-mx-3 mb-3 flex flex-col lg:mx-0">
      <div style={{ backgroundColor: NAV_BG }} className="px-3 py-2">
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          {utilityLinks.map((link) => {
            if (link.id === "logout") {
              if (!isLogin) {
                return (
                  <Link
                    key={link.id}
                    href="/login"
                    className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
                  >
                    로그인
                  </Link>
                );
              }
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
                >
                  {link.label}
                </button>
              );
            }

            if (link.requiresLogin) {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleProtectedNav(link.href)}
                  className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
                >
                  {link.label}
                </button>
              );
            }

            return (
              <Link
                key={link.id}
                href={link.href}
                className="text-xs font-medium text-white/85 hover:text-white sm:text-sm"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div
        style={{ backgroundColor: NAV_BG }}
        className="flex flex-col items-center gap-2 px-3 pb-4 pt-3"
      >
        <Image
          src="/icon_72.png"
          alt="분양프로"
          width={72}
          height={72}
          className="rounded-2xl"
          priority
        />
        <span className="text-lg font-bold tracking-tight text-white sm:text-xl">분양프로</span>
      </div>

      <div className="bg-[#f5f5f5] px-3 pb-1 pt-3">
        <TitleSearchBar redirectOnSearch />
      </div>
    </div>
  );
}
