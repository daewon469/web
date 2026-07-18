"use client";

import TitleSearchBar from "@/components/TitleSearchBar";
import { Points } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import {
  LIST_PAGE_CONTENT_MAX_PX,
  listHomeSearchWidthCss,
} from "@/lib/listCardLayout";
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

type Props = {
  onCustomView?: () => void;
};

export default function ListHomeSearchRow({ onCustomView }: Props = {}) {
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

  const handleCustomView = () => {
    if (onCustomView) {
      onCustomView();
      return;
    }
    router.push("/customsite");
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
    <div
      className="mx-auto w-full py-2"
      style={{ maxWidth: LIST_PAGE_CONTENT_MAX_PX }}
    >
      <div className="flex w-full items-center justify-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={handleLogoClick}
          className="shrink-0 rounded-xl"
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

        <div
          className="shrink-0"
          style={{ width: listHomeSearchWidthCss("100%") }}
        >
          <TitleSearchBar redirectOnSearch />
        </div>

        <MobileCustomButton onClick={handleCustomView} />
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
