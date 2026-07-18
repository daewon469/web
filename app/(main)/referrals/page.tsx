"use client";

import { Auth, Referral } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { formatKstDatetime } from "@/lib/ledgerFormat";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReferralsPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<{ id: number; referred_username: string; created_at: string | null }[]>([]);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);

    (async () => {
      try {
        const [listRes, summaryRes] = await Promise.all([
          Referral.listByReferrer(session.username!),
          Auth.getMyPageSummary(session.username!),
        ]);
        const nextItems = listRes.status === 0 ? listRes.items ?? [] : [];
        setItems(nextItems);
        const fromSummary =
          summaryRes.status === 0 ? summaryRes.referral_count ?? null : null;
        setReferralCount(fromSummary ?? nextItems.length);
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "추천 회원 목록을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-black bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold">내가 추천한 회원</h1>
          <span className="rounded-full border border-black bg-[#EEF4FF] px-3 py-1 text-sm font-extrabold text-[#4A6CF7]">
            {referralCount}명
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href="/referralranking" className="text-sm font-bold text-[#4A6CF7] underline">
            추천 랭킹
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/referralnetwork" className="text-sm font-bold text-[#4A6CF7] underline">
            추천 인맥
          </Link>
        </div>
      </div>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <p className="py-8 text-center text-gray-500">추천한 회원이 없습니다.</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-black bg-white">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between px-4 py-3 ${
              idx < items.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <span className="font-bold">{item.referred_username}</span>
            <span className="text-xs text-gray-500">{formatKstDatetime(item.created_at)}</span>
          </div>
        ))}
      </div>

      {username && (
        <p className="text-center text-xs text-gray-500">회원: {username}</p>
      )}
    </div>
  );
}
