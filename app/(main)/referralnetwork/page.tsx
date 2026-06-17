"use client";

import { Referral } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function maskNickname(value: string) {
  const chars = Array.from(value ?? "");
  if (chars.length <= 2) return chars.join("");
  return `${chars.slice(0, 2).join("")}${"*".repeat(chars.length - 2)}`;
}

export default function ReferralNetworkPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<
    { nickname: string; depth: number; signup_date?: string | null }[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "more", cursor?: string | null) => {
      if (!username) return;
      if (mode === "initial") setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await Referral.network(username, {
          limit: 50,
          cursor: mode === "more" ? cursor : null,
          max_depth: 20,
        });
        if (res.status !== 0) throw new Error("서버 응답 오류");
        setTotalCount(Number(res.total_count ?? 0));
        setNextCursor(res.next_cursor ?? null);
        const next = res.items ?? [];
        setItems((prev) => (mode === "more" ? [...prev, ...next] : next));
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "인맥 목록을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [username],
  );

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);
  }, [router]);

  useEffect(() => {
    if (username) load("initial");
  }, [username, load]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/referrals" className="text-sm text-[#4A6CF7]">
        ← 내 추천 목록
      </Link>

      <div className="rounded-2xl border border-black bg-white p-4">
        <h1 className="text-lg font-bold">추천 인맥</h1>
        <p className="mt-1 text-sm text-gray-600">총 {totalCount}명</p>
      </div>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <p className="py-8 text-center text-gray-500">인맥 데이터가 없습니다.</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-black bg-white">
        {items.map((it, idx) => (
          <div
            key={`${it.nickname}-${it.depth}-${idx}`}
            className={`flex items-center justify-between px-4 py-3 ${
              idx < items.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <div>
              <span className="font-bold">{maskNickname(it.nickname)}</span>
              <span className="ml-2 text-xs text-[#4A6CF7]">{it.depth}단계</span>
            </div>
            <span className="text-xs text-gray-500">
              {it.signup_date ? String(it.signup_date).slice(0, 10) : ""}
            </span>
          </div>
        ))}
      </div>

      {nextCursor && !loadingMore && (
        <button
          type="button"
          onClick={() => load("more", nextCursor)}
          className="rounded-xl border border-gray-300 bg-white py-3 font-bold"
        >
          더 보기
        </button>
      )}
      {loadingMore && <p className="text-center text-gray-500">불러오는 중...</p>}
    </div>
  );
}
