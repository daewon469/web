"use client";

import NavIcon, { type NavIconName } from "@/components/NavIcon";
import { Auth } from "@/lib/api";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const BAR_BG = "#EEF3FF";
const BAR_FG = "#1A2B5F";
const TAB_ICON_SIZE = 23;

const tabs = [
  { href: "/list?openMap=1", label: "지도검색", icon: "map" as const, requiresLogin: true, isMap: true },
  { href: "/textsearch", label: "제목검색", icon: "search" as const, requiresLogin: true },
  { href: "/areasite", label: "지역저장", icon: "location" as const, requiresLogin: true, dynamic: "area" as const },
  { href: "/customsite", label: "맞춤저장", icon: "options-outline" as const, requiresLogin: true, dynamic: "custom" as const },
  { href: "/like", label: "관심현장", icon: "heart" as const, requiresLogin: true },
] as const;

export default function BottomBar() {
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

  const ensureLogin = () => {
    if (isLogin) return true;
    alert("로그인이 필요합니다.");
    router.push("/login");
    return false;
  };

  const resolveHref = async (tab: (typeof tabs)[number]) => {
    if ("requiresLogin" in tab && tab.requiresLogin && !ensureLogin()) return null;

    if ("isMap" in tab && tab.isMap) {
      return "/list?openMap=1";
    }

    if ("dynamic" in tab && tab.dynamic === "area") {
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

    if ("dynamic" in tab && tab.dynamic === "custom") {
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

    return tab.href;
  };

  const renderButton = (icon: NavIconName, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
      style={{ color: BAR_FG }}
    >
      <span className="flex h-[26px] items-center justify-center">
        <NavIcon name={icon} size={TAB_ICON_SIZE} />
      </span>
      <span className="text-[13px] font-bold leading-none">{label}</span>
    </button>
  );

  return (
    <nav
      className="sticky bottom-0 z-50 border-t border-[#d8e2ff]"
      style={{ backgroundColor: BAR_BG }}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-stretch lg:hidden">
        {tabs.map((tab) =>
          renderButton(tab.icon, tab.label, async () => {
            const href = await resolveHref(tab);
            if (href) router.push(href);
          }),
        )}
      </div>
    </nav>
  );
}
