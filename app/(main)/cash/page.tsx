"use client";

import { Cash } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { displayCashReason, formatKstDatetime } from "@/lib/ledgerFormat";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CashPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<{ id: number; reason: string; amount: number; created_at: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await Cash.list(session.username!);
        if (res.status === 0) setItems(res.items || []);
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "캐시 내역을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/myboard" className="text-sm text-[#4A6CF7]">
        ← 마이메뉴
      </Link>

      <div className="rounded-2xl border border-black bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold">캐시 충전/사용 내역</h1>
          <span className="rounded-full border border-black bg-[#EEF4FF] px-3 py-1 text-sm font-extrabold text-[#4A6CF7]">
            최근 {items.length}건
          </span>
        </div>
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
              <p className="truncate font-bold">{displayCashReason(item.reason)}</p>
              <p className="text-xs text-gray-500">{formatKstDatetime(item.created_at)}</p>
            </div>
            <p
              className={`shrink-0 font-extrabold ${
                item.amount >= 0 ? "text-[#1B9E77]" : "text-[#D64545]"
              }`}
            >
              {item.amount >= 0 ? "+" : ""}
              {item.amount.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
