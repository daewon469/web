"use client";

import NavIcon, { type NavIconName } from "@/components/NavIcon";
import { Auth } from "@/lib/api";
import { isListHomePath, isListMapOpen, LIST_HOME_PATH } from "@/lib/paths";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const TOP_BG = "#0B1B3A";
const BOTTOM_BG = "#EEF3FF";
const BOTTOM_FG = "#1A2B5F";
const TAB_ICON_SIZE = 23;

const topTabs = [
  { id: "write", label: "구인등록", icon: "create" as const, href: "/write", requiresLogin: true },
  { id: "partner", label: "협력업체", icon: "people" as const },
  { id: "home", label: "첫화면", icon: "home" as const, href: LIST_HOME_PATH },
  { id: "ad", label: "광고", icon: "megaphone" as const, href: "/list4", loginOnly: true },
  { id: "myboard", label: "내페이지", icon: "person" as const, href: "/myboard", loginHref: "/check2", loginLabel: "회원가입" },
] as const;

const bottomTabs = [
  { id: "map", label: "지도검색", icon: "map" as const, href: "/list?openMap=1", requiresLogin: true },
  { id: "search", label: "제목검색", icon: "search" as const, href: "/textsearch", requiresLogin: true },
  { id: "area", label: "지역현장", icon: "location" as const, href: "/areasite" },
  { id: "custom", label: "맞춤저장", icon: "options-outline" as const, dynamic: "custom" as const, requiresLogin: true },
  { id: "like", label: "관심현장", icon: "heart" as const, href: "/like", requiresLogin: true },
] as const;

function TabButton({
  icon,
  label,
  active,
  onClick,
  href,
  color = "#ffffff",
  mutedOpacity = 0.75,
}: {
  icon: NavIconName;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  color?: string;
  mutedOpacity?: number;
}) {
  const textColor = active ? color : color;
  const opacity = active ? 1 : mutedOpacity;
  const className =
    "flex w-[68px] shrink-0 flex-col items-center justify-center gap-0 px-0 py-1 transition-opacity hover:opacity-90 sm:w-[76px]";
  const content = (
    <>
      <span className="flex h-[26px] items-center justify-center" style={{ color: textColor, opacity }}>
        <NavIcon name={icon} size={TAB_ICON_SIZE} className="text-current" />
      </span>
      <span
        className="text-[11px] font-bold leading-none sm:text-[12px]"
        style={{ color: textColor, opacity }}
      >
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}

export default function ListHomeToolbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const mapOpen = isListMapOpen(searchParams);

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

  const handleTopTab = (tab: (typeof topTabs)[number]) => {
    if (tab.id === "partner") {
      router.push("/list4");
      return;
    }
    if (tab.id === "write") {
      if (!ensureLogin()) return;
      router.push("/write");
      return;
    }
    if (tab.id === "home") {
      if (isListHomePath(pathname)) {
        window.location.reload();
        return;
      }
      router.replace(LIST_HOME_PATH);
      return;
    }
    if (tab.id === "ad") {
      if (!isLogin) {
        router.push("/login");
        return;
      }
      alert("업데이트 예정입니다.");
      return;
    }
    if (tab.id === "myboard") {
      router.push(isLogin ? "/myboard" : "/check2");
    }
  };

  const handleBottomTab = async (tab: (typeof bottomTabs)[number]) => {
    if ("requiresLogin" in tab && tab.requiresLogin && !ensureLogin()) return;

    if ("dynamic" in tab && tab.dynamic === "custom") {
      const { username } = getSession();
      if (!username) {
        router.push("/customsite");
        return;
      }
      try {
        const res = await Auth.getUser(username);
        const inds = res.user?.custom_industry_codes ?? [];
        const regs = res.user?.custom_region_codes ?? [];
        const has =
          (Array.isArray(inds) && inds.some((s) => String(s ?? "").trim())) ||
          (Array.isArray(regs) && regs.some((s) => String(s ?? "").trim()));
        router.push(has ? "/customlike" : "/customsite");
      } catch {
        router.push("/customsite");
      }
      return;
    }

    if ("href" in tab && tab.href) router.push(tab.href);
  };

  const isTopActive = (tab: (typeof topTabs)[number]) => {
    if (tab.id === "home") return isListHomePath(pathname) && !mapOpen;
    if (tab.id === "partner") {
      return pathname === "/list4" || pathname.startsWith("/list4/");
    }
    if (tab.id === "myboard") {
      return isLogin
        ? pathname === "/myboard" || pathname.startsWith("/myboard/")
        : pathname === "/check2" || pathname.startsWith("/check2/");
    }
    if (tab.id === "ad") {
      if (!isLogin) return pathname === "/login";
      return false;
    }
    if (tab.id === "write") {
      return pathname === "/write" || pathname.startsWith("/write/");
    }
    return false;
  };

  const isBottomActive = (tab: (typeof bottomTabs)[number]) => {
    if (tab.id === "map") return mapOpen;
    if (tab.id === "search") {
      return pathname === "/textsearch" || pathname.startsWith("/textsearch/");
    }
    if (tab.id === "area") {
      return (
        pathname === "/areasite" ||
        pathname.startsWith("/areasite/") ||
        pathname === "/arealike" ||
        pathname.startsWith("/arealike/")
      );
    }
    if (tab.id === "custom") {
      return (
        pathname === "/customsite" ||
        pathname.startsWith("/customsite/") ||
        pathname === "/customlike" ||
        pathname.startsWith("/customlike/")
      );
    }
    if (tab.id === "like") {
      return pathname === "/like" || pathname.startsWith("/like/");
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black">
      <div className="relative flex h-14 w-full justify-center">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/2"
          style={{ backgroundColor: TOP_BG }}
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/2"
          style={{ backgroundColor: BOTTOM_BG }}
        />
        <div className="relative z-10 flex h-14 max-w-[780px] items-stretch justify-center">
          <div className="flex items-stretch" style={{ backgroundColor: TOP_BG }}>
            {topTabs.map((tab) => {
              const label =
                tab.id === "ad" && !isLogin
                  ? "로그인"
                  : tab.id === "myboard" && !isLogin
                    ? tab.loginLabel
                    : tab.label;
              const icon =
                tab.id === "ad" && !isLogin ? ("log-in" as const) : tab.icon;
              return (
                <TabButton
                  key={tab.id}
                  icon={icon}
                  label={label}
                  active={isTopActive(tab)}
                  onClick={() => handleTopTab(tab)}
                />
              );
            })}
          </div>

          <div
            className="relative w-3 shrink-0 sm:w-4"
            aria-hidden
            style={{
              background: `linear-gradient(to bottom right, ${TOP_BG} 49%, #000 49%, #000 51%, ${BOTTOM_BG} 51%)`,
            }}
          />

          <div
            className="flex items-stretch border-t border-[#d8e2ff]"
            style={{ backgroundColor: BOTTOM_BG }}
          >
            {bottomTabs.map((tab) => (
              <TabButton
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                color={BOTTOM_FG}
                mutedOpacity={0.7}
                active={isBottomActive(tab)}
                onClick={() => void handleBottomTab(tab)}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
