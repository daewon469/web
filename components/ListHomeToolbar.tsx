"use client";

import NavIcon, { type NavIconName } from "@/components/NavIcon";
import { Auth } from "@/lib/api";
import { isListHomePath, LIST_HOME_PATH } from "@/lib/paths";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const TOP_BG = "#0B1B3A";
const BOTTOM_BG = "#EEF3FF";
const BOTTOM_FG = "#1A2B5F";
const TAB_ICON_SIZE = 22;

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
    "flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1 transition-opacity hover:opacity-90";
  const content = (
    <>
      <span className="flex h-[24px] items-center justify-center" style={{ color: textColor, opacity }}>
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

  const handleTopTab = (tab: (typeof topTabs)[number]) => {
    if (tab.id === "partner") {
      alert("업데이트 예정입니다.");
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
      router.push("/list4");
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
    if (tab.id === "home") return isListHomePath(pathname);
    if ("href" in tab && tab.href) {
      return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black">
      <div className="flex h-14 w-full items-stretch">
        <div className="flex min-w-0 flex-[1_1_50%] items-stretch" style={{ backgroundColor: TOP_BG }}>
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
          className="relative w-5 shrink-0 sm:w-6"
          aria-hidden
          style={{
            background: `linear-gradient(to bottom right, ${TOP_BG} 49%, #000 49%, #000 51%, ${BOTTOM_BG} 51%)`,
          }}
        />

        <div
          className="flex min-w-0 flex-[1_1_50%] items-stretch border-t border-[#d8e2ff]"
          style={{ backgroundColor: BOTTOM_BG }}
        >
          {bottomTabs.map((tab) => (
            <TabButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              color={BOTTOM_FG}
              mutedOpacity={0.7}
              onClick={() => void handleBottomTab(tab)}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
