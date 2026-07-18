"use client";

import ReferralBonusTable from "@/components/ReferralBonusTable";
import { Referral } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { useEffect, useState } from "react";

function maskNickname(value: string) {
  const chars = Array.from(value ?? "");
  if (chars.length <= 2) return chars.join("");
  return `${chars.slice(0, 2).join("")}${"*".repeat(chars.length - 2)}`;
}

export default function ReferralRankingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<
    { rank: number; nickname: string; referral_count: number }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await Referral.ranking();
        setItems(res.status === 0 ? res.items ?? [] : []);
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "추천 랭킹을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-black bg-white p-4">
        <h1 className="text-lg font-bold">추천인 랭킹</h1>
      </div>

      <div className="rounded-2xl border border-black bg-white p-4">
        <h2 className="text-lg font-extrabold">※ 추천인 포인트 보너스 지급</h2>
        <div className="mt-2.5">
          <ReferralBonusTable />
        </div>
      </div>
      <p className="text-center text-sm font-bold text-[#111]">
        ※ 포인트는 유료전환 시 캐시처럼 사용됩니다.
      </p>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <p className="py-8 text-center text-gray-500">랭킹 데이터가 없습니다.</p>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-black bg-white">
          <div className="grid grid-cols-[54px_1fr_90px] gap-2 border-b border-gray-200 bg-[#F8F9FA] px-4 py-3 text-sm font-extrabold text-[#4A6CF7]">
            <span>등수</span>
            <span>닉네임</span>
            <span className="text-right">추천인</span>
          </div>
          {items.map((it) => (
            <div
              key={`${it.rank}-${it.nickname}`}
              className="grid grid-cols-[54px_1fr_90px] gap-2 border-b border-gray-100 px-4 py-3 last:border-b-0"
            >
              <span className="font-bold text-gray-600">{it.rank}</span>
              <span className="font-bold">{maskNickname(it.nickname)}</span>
              <span className="text-right font-bold">{it.referral_count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
