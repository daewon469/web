"use client";

import { API_URL, CASH_CHARGE_AMOUNTS, Orders } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TossPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preset = Number(searchParams.get("amount") ?? 50000);
  const [amount, setAmount] = useState<number>(
    CASH_CHARGE_AMOUNTS.includes(preset as (typeof CASH_CHARGE_AMOUNTS)[number])
      ? preset
      : 50000,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
    }
  }, [router]);

  const startPayment = async () => {
    const session = getSession();
    const username = session.username;
    if (!username) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const order = await Orders.createTossCashOrder(username, amount);
      if (order.status !== 0) {
        setError("주문 생성에 실패했습니다.");
        return;
      }

      const url =
        `${API_URL}/pay/toss` +
        `?platform=web` +
        `&orderId=${encodeURIComponent(order.orderId)}` +
        `&amount=${encodeURIComponent(String(order.amount))}` +
        `&orderName=${encodeURIComponent(order.orderName)}` +
        `&customerName=${encodeURIComponent(order.customerName)}`;

      window.location.href = url;
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "결제를 시작할 수 없습니다."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#0B1B3A]">캐시 충전</h1>
      <p className="text-sm text-gray-600">토스페이먼츠로 안전하게 충전합니다.</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CASH_CHARGE_AMOUNTS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(v)}
            className={`rounded-xl border px-4 py-3 font-bold ${
              amount === v
                ? "border-[#4A6CF7] bg-[#EEF4FF] text-[#4A6CF7]"
                : "border-gray-300 bg-white text-gray-800"
            }`}
          >
            {v.toLocaleString()}원
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={startPayment}
        disabled={loading}
        className="rounded-xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-50"
      >
        {loading ? "결제 준비 중..." : `${amount.toLocaleString()}원 충전하기`}
      </button>
    </div>
  );
}
