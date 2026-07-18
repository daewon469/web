"use client";

import { Referral } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
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
  const [rewardGranted, setRewardGranted] = useState<boolean | null>(null);
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
        setRewardGranted(typeof res.reward?.granted === "boolean" ? res.reward.granted : null);
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

  const showReward = totalCount >= 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-black bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-extrabold text-[#111]">나의 추천인 인맥</h1>
          <span className="rounded-full border border-black bg-[#EEF4FF] px-3 py-1 text-sm font-extrabold text-[#4A6CF7]">
            총 {totalCount}명
          </span>
        </div>
        <p className="mt-2 text-center text-sm font-extrabold text-[#111]">
          👥 인맥 <span className="font-black text-[#4A6CF7]">100명</span> 달성 시{" "}
          <span className="font-black text-[#DC2626]">1,000,000p</span> 지급 🎉
        </p>
        {showReward && (
          <p
            className={`mt-2 text-right text-sm font-black ${
              rewardGranted ? "text-[#1B8A3A]" : "text-[#B45309]"
            }`}
          >
            {rewardGranted ? "100만 포인트 지급 완료" : "100만 포인트 지급 대기"}
          </p>
        )}
      </div>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <p className="py-8 text-center text-gray-500">인맥 데이터가 없습니다.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-black bg-white">
          <div className="flex items-center border-b border-[#ddd] bg-[#F8F9FA] px-4 py-3 text-[13px] font-black text-[#4A6CF7]">
            <span className="w-[18px]" aria-hidden />
            <span className="flex-1">닉네임</span>
            <span className="w-[90px] text-right">인맥단계</span>
          </div>
          {items.map((it, idx) => (
            <div
              key={`${it.nickname}-${it.depth}-${idx}`}
              className={`px-4 py-3 ${idx > 0 ? "border-t border-[#ddd]" : ""}`}
            >
              <div className="flex items-center">
                <span className="w-[18px] text-[13px] font-black">※</span>
                <span className="flex-1 text-[15px] font-semibold">
                  {maskNickname(it.nickname)}
                </span>
                <span className="w-[90px] text-right text-[15px] font-bold">
                  {it.depth}단계
                </span>
              </div>
              {it.signup_date && (
                <p className="ml-[18px] mt-1 text-xs font-semibold text-gray-500">
                  가입일: {String(it.signup_date).slice(0, 10)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

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
