"use client";

import TitleSearchBar from "@/components/TitleSearchBar";
import { Auth, Points } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { isListHomePath, isListMapOpen, LIST_HOME_PATH } from "@/lib/paths";
import { getSession } from "@/lib/session";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ListHomeSearchRow() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [attendanceClaimed, setAttendanceClaimed] = useState(false);
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
    try {
      const res = await Points.attendanceStatus(username);
      setAttendanceClaimed(!!res.claimed);
    } catch {
      setAttendanceClaimed(false);
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
        alert(`출석체크 완료! 포인트가 지급되었습니다.`);
      }
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, "출석체크에 실패했습니다."));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 sm:gap-3">
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

      <div className="min-w-0 flex-1">
        <TitleSearchBar redirectOnSearch />
      </div>

      <button
        type="button"
        onClick={() => void handleCustomView()}
        className="shrink-0 rounded-lg border border-[#4A6CF7] bg-white px-2 py-1.5 text-xs font-bold text-[#4A6CF7] sm:px-3 sm:text-sm"
      >
        맞춤보기
      </button>

      {isLogin && !attendanceClaimed && (
        <button
          type="button"
          onClick={() => void handleAttendance()}
          disabled={claiming}
          className="shrink-0 rounded-lg bg-[#4A6CF7] px-2 py-1.5 text-xs font-bold text-white disabled:opacity-60 sm:px-3 sm:text-sm"
        >
          {claiming ? "처리중" : "출석체크"}
        </button>
      )}
    </div>
  );
}
