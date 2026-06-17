"use client";

import { Auth } from "@/lib/api";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const primaryLinks = [
  { href: "/list", label: "첫화면", icon: "🏠" },
  { href: "/write", label: "구인등록", icon: "✏️", requiresLogin: true },
  { href: "/list4", label: "광고", icon: "📢" },
  { href: "/noti", label: "알림", icon: "🔔", requiresLogin: true },
  { href: "/myboard", label: "마이메뉴", icon: "👤", requiresLogin: true },
] as const;

const filterLinks = [
  { href: "/list?openMap=1", label: "지도검색", icon: "🗺️", requiresLogin: true, isMap: true },
  { href: "/textsearch", label: "제목검색", icon: "🔍", requiresLogin: true },
  { href: "/areasite", label: "지역저장", icon: "📍", requiresLogin: true, dynamic: "area" as const },
  { href: "/customsite", label: "맞춤저장", icon: "⚙️", requiresLogin: true, dynamic: "custom" as const },
  { href: "/like", label: "관심현장", icon: "❤️", requiresLogin: true },
] as const;

type NavLink = (typeof primaryLinks)[number] | (typeof filterLinks)[number];

export default function DesktopSideNav() {
  const pathname = usePathname();
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

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/list") return pathname === "/list" || pathname === "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  const ensureLogin = () => {
    if (isLogin) return true;
    alert("로그인이 필요합니다.");
    router.push("/login");
    return false;
  };

  const resolveHref = async (link: NavLink) => {
    if ("requiresLogin" in link && link.requiresLogin && !ensureLogin()) return null;
    if ("isMap" in link && link.isMap) return "/list?openMap=1";

    if ("dynamic" in link && link.dynamic === "area") {
      const { username } = getSession();
      if (!username) return "/areasite";
      try {
        const res = await Auth.getUser(username);
        const regs = res.user?.area_region_codes ?? [];
        const has = Array.isArray(regs) && regs.some((s) => String(s ?? "").trim());
        return has ? "/arealike" : "/areasite";
      } catch {
        return "/areasite";
      }
    }

    if ("dynamic" in link && link.dynamic === "custom") {
      const { username } = getSession();
      if (!username) return "/customsite";
      try {
        const res = await Auth.getUser(username);
        const inds = res.user?.custom_industry_codes ?? [];
        const regs = res.user?.custom_region_codes ?? [];
        const has =
          (Array.isArray(inds) && inds.some((s) => String(s ?? "").trim())) ||
          (Array.isArray(regs) && regs.some((s) => String(s ?? "").trim()));
        return has ? "/customlike" : "/customsite";
      } catch {
        return "/customsite";
      }
    }

    return link.href;
  };

  const renderLink = (link: NavLink) => {
    const active = isActive(link.href);
    const needsLogin = "requiresLogin" in link && link.requiresLogin && !isLogin;
    const targetHref =
      needsLogin ? "/login" : link.href.split("?")[0] === link.href ? link.href : link.href;

    if (needsLogin) {
      return (
        <Link
          key={link.label}
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10"
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      );
    }

    if ("dynamic" in link || ("isMap" in link && link.isMap)) {
      return (
        <button
          key={link.label}
          type="button"
          onClick={async () => {
            const href = await resolveHref(link);
            if (href) router.push(href);
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
            active ? "bg-[#4A6CF7] text-white" : "text-white/85 hover:bg-white/10"
          }`}
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </button>
      );
    }

    return (
      <Link
        key={link.label}
        href={targetHref}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
          active ? "bg-[#4A6CF7] text-white" : "text-white/85 hover:bg-white/10"
        }`}
      >
        <span>{link.icon}</span>
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-16 rounded-2xl bg-[#0B1B3A] p-3 shadow-sm">
        <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/50">메뉴</p>
        <nav className="flex flex-col gap-1">{primaryLinks.map(renderLink)}</nav>
        <p className="mt-4 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/50">
          검색·필터
        </p>
        <nav className="flex flex-col gap-1">{filterLinks.map(renderLink)}</nav>
      </div>
    </aside>
  );
}
