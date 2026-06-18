"use client";

import NavIcon, { type NavIconName } from "@/components/NavIcon";
import { Auth } from "@/lib/api";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const primaryLinks = [
  { href: "/write", label: "구인등록", icon: "create" as const, requiresLogin: true },
  { href: "/list4", label: "광고", icon: "megaphone" as const },
  { href: "/list", label: "첫화면", icon: "home" as const },
  { href: "/noti", label: "알림", icon: "notifications" as const, requiresLogin: true },
  { href: "/myboard", label: "마이메뉴", icon: "person" as const, requiresLogin: true },
] as const;

const filterLinks = [
  { href: "/list?openMap=1", label: "지도검색", icon: "map" as const, requiresLogin: true, isMap: true },
  { href: "/textsearch", label: "제목검색", icon: "search" as const, requiresLogin: true },
  { href: "/areasite", label: "지역저장", icon: "location" as const, requiresLogin: true, dynamic: "area" as const },
  { href: "/customsite", label: "맞춤저장", icon: "options-outline" as const, requiresLogin: true, dynamic: "custom" as const },
  { href: "/like", label: "관심현장", icon: "heart" as const, requiresLogin: true },
] as const;

type NavLink = (typeof primaryLinks)[number] | (typeof filterLinks)[number];

export default function DesktopSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const mapOpen =
    searchParams.get("openMap") === "1" || searchParams.get("openMap") === "true";

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

  const isActive = (link: NavLink) => {
    const href = link.href;
    const [base, query] = href.split("?");
    const onList = pathname === "/list" || pathname === "/";
    if (base === "/list") {
      if (!onList) return false;
      const wantsMap = query?.includes("openMap");
      return wantsMap ? mapOpen : !mapOpen;
    }
    if ("dynamic" in link && link.dynamic === "area") {
      return pathname === "/areasite" || pathname === "/arealike";
    }
    if ("dynamic" in link && link.dynamic === "custom") {
      return pathname === "/customsite" || pathname === "/customlike";
    }
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

  const renderIcon = (name: NavIconName) => (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      <NavIcon name={name} size={20} />
    </span>
  );

  const renderLink = (link: NavLink) => {
    const active = isActive(link);
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
          {renderIcon(link.icon)}
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
          {renderIcon(link.icon)}
          <span>{link.label}</span>
        </button>
      );
    }

    if (link.href === "/list") {
      return (
        <button
          key={link.label}
          type="button"
          onClick={() => router.replace("/list")}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
            active ? "bg-[#4A6CF7] text-white" : "text-white/85 hover:bg-white/10"
          }`}
        >
          {renderIcon(link.icon)}
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
        {renderIcon(link.icon)}
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-4 rounded-2xl bg-[#0B1B3A] p-3 shadow-sm lg:top-4">
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
