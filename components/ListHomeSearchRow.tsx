"use client";

import TitleSearchBar from "@/components/TitleSearchBar";
import { Auth, Points } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { isListHomePath, isListMapOpen, LIST_HOME_PATH } from "@/lib/paths";
import { getSession } from "@/lib/session";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const OUTLINE_TEXT_SHADOW =
  "0 1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 -1px 0 #000, 1px 1px 0 #000, -1px -1px 0 #000";

function MobileCustomButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="맞춤 보기"
      className="flex h-[46px] w-[46px] shrink-0 flex-col items-center justify-center rounded-full border border-black/25 bg-[#2F6BFF] shadow-[0_4px_6px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90 active:opacity-90"
    >
      <span className="text-center text-[13px] font-black leading-[14px] text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.35)]">
        맞춤
      </span>
      <span className="text-center text-[13px] font-black leading-[14px] text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.35)]">
        보기
      </span>
    </button>
  );
}

function MobileAttendanceButton({
  amount,
  loading,
  onClick,
}: {
  amount: number;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="출석체크"
      className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full border border-black/25 bg-[#E53935] shadow-[0_4px_8px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90 active:opacity-90 disabled:opacity-70"
    >
      <span
        className="text-center text-sm font-black leading-[15px] text-[#FFD400]"
        style={{ textShadow: OUTLINE_TEXT_SHADOW }}
      >
        출첵
      </span>
      <span
        className="mt-0.5 text-center text-xs font-black leading-[13px] text-[#FFD400]"
        style={{ textShadow: OUTLINE_TEXT_SHADOW }}
      >
        {loading ? "..." : amount.toLocaleString("ko-KR")}
      </span>
    </button>
  );
}

export default function ListHomeSearchRow() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [attendanceClaimed, setAttendanceClaimed] = useState(false);
  const [attendanceAmount, setAttendanceAmount] = useState(200);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const reloadSession = useCallback(() => {
    const session = getSession();
    setIsLogin(session.isLogin);
    setUsername(session.username);
  }, []);

  const refreshAttendance = useCallback(async () => {
    if (!username) {
      setAttendanceClaimed(false);
      return;
    }
    setAttendanceLoading(true);
    try {
      const res = await Points.attendanceStatus(username);
      setAttendanceClaimed(!!res.claimed);
      setAttendanceAmount(res.amount ?? 200);
    } catch {
      setAttendanceClaimed(false);
    } finally {
      setAttendanceLoading(false);
    }
  }, [username]);

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
      setAttendanceClaimed(false);
      return;
    }
    refreshAttendance();
  }, [isLogin, username, refreshAttendance]);

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

  const handleCustomView = async () => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    const u = username ?? getSession().username;
    if (!u) {
      router.push("/customsite");
      return;
    }
    try {
      const res = await Auth.getUser(u);
      const inds = res.user?.custom_industry_codes ?? [];
      const regs = res.user?.custom_region_codes ?? [];
      const has =
        (Array.isArray(inds) && inds.some((s) => String(s ?? "").trim())) ||
        (Array.isArray(regs) && regs.some((s) => String(s ?? "").trim()));
      router.push(has ? "/customlike" : "/customsite");
    } catch {
      router.push("/customsite");
    }
  };

  const handleAttendance = async () => {
    if (!isLogin) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    if (!username || claiming || attendanceClaimed) return;
    setClaiming(true);
    try {
      const res = await Points.attendanceClaim(username);
      if (res.status === 0) {
        setAttendanceClaimed(true);
        alert(`출석체크 완료! 포인트 ${res.amount ?? attendanceAmount}점이 지급되었습니다.`);
      } else if (res.status === 2) {
        setAttendanceClaimed(true);
        alert("오늘은 이미 출석체크를 완료했습니다.");
      }
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, "출석체크에 실패했습니다."));
    } finally {
      setClaiming(false);
    }
  };

  const showAttendance = isLogin && !attendanceClaimed;

  return (
    <div className="relative flex min-h-[52px] items-center py-2">
      <button
        type="button"
        onClick={handleLogoClick}
        className="relative z-10 shrink-0 rounded-xl"
        aria-label="첫화면"
      >
        <Image
          src="/icon_72.png"
          alt="분양프로"
          width={44}
          height={44}
          className="rounded-xl sm:h-12 sm:w-12"
          priority
        />
      </button>

      <div className="pointer-events-none absolute inset-x-0 flex justify-center px-28 sm:px-36">
        <div className="pointer-events-auto w-1/3 min-w-[160px] max-w-sm">
          <TitleSearchBar redirectOnSearch />
        </div>
      </div>

      <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2.5">
        <MobileCustomButton onClick={() => void handleCustomView()} />
        {showAttendance && (
          <MobileAttendanceButton
            amount={attendanceAmount}
            loading={attendanceLoading || claiming}
            onClick={() => void handleAttendance()}
          />
        )}
      </div>
    </div>
  );
}
