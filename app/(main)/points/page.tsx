"use client";

import { Points } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { displayPointReason, formatKstDatetime } from "@/lib/ledgerFormat";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function PointsPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<{ id: number; reason: string; amount: number; created_at: string | null }[]>([]);
  const [attendanceClaimed, setAttendanceClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (u: string) => {
    setLoading(true);
    setError(null);
    try {
      const [ledger, attendance] = await Promise.all([
        Points.list(u),
        Points.attendanceStatus(u),
      ]);
      if (ledger.status === 0) setItems(ledger.items || []);
      setAttendanceClaimed(!!attendance.claimed);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "포인트 내역을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);
    load(session.username);
  }, [router, load]);

  const claimAttendance = async () => {
    if (!username || claiming || attendanceClaimed) return;
    setClaiming(true);
    try {
      const res = await Points.attendanceClaim(username);
      if (res.status === 0) {
        setAttendanceClaimed(true);
        await load(username);
      }
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, "출석체크에 실패했습니다."));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/myboard" className="text-sm text-[#4A6CF7]">
          ← 마이메뉴
        </Link>
      </div>

      <div className="rounded-2xl border border-black bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold">포인트 적립/사용 내역</h1>
          <span className="rounded-full border border-black bg-[#EEF4FF] px-3 py-1 text-sm font-extrabold text-[#4A6CF7]">
            최근 {items.length}건
          </span>
        </div>

        {!attendanceClaimed && username && (
          <button
            type="button"
            onClick={claimAttendance}
            disabled={claiming}
            className="mt-4 w-full rounded-xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-60"
          >
            {claiming ? "처리 중..." : "출석체크 (+포인트)"}
          </button>
        )}
        {attendanceClaimed && (
          <p className="mt-4 text-center text-sm text-green-700">오늘 출석체크 완료</p>
        )}
      </div>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <p className="py-8 text-center text-gray-500">내역이 없습니다.</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-black bg-white">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-3 px-4 py-3 ${
              idx < items.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-bold">{displayPointReason(item.reason)}</p>
              <p className="text-xs text-gray-500">{formatKstDatetime(item.created_at)}</p>
            </div>
            <p
              className={`shrink-0 font-extrabold ${
                item.amount >= 0 ? "text-[#1B9E77]" : "text-[#D64545]"
              }`}
            >
              {item.amount >= 0 ? "+" : ""}
              {item.amount.toLocaleString()}P
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
