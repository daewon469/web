"use client";

import { Payments } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function TossSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("결제 승인 처리 중...");
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const paymentKey = searchParams.get("paymentKey") ?? "";
    const orderId = searchParams.get("orderId") ?? "";
    const amount = Number(searchParams.get("amount") ?? 0);

    if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) {
      setMessage("결제 정보가 올바르지 않습니다.");
      setDone(true);
      return;
    }

    (async () => {
      try {
        const res = await Payments.confirmToss({ paymentKey, orderId, amount });
        if (res.status === 0) {
          setMessage("캐시 충전이 완료되었습니다.");
          setTimeout(() => router.replace("/myboard"), 1500);
        } else {
          setMessage("결제 승인 처리에 실패했습니다.");
          setDone(true);
        }
      } catch (e: unknown) {
        setMessage(getApiErrorMessage(e, "결제 승인에 실패했습니다."));
        setDone(true);
      }
    })();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-lg font-bold text-[#0B1B3A]">{message}</p>
      {done && (
        <Link href="/myboard" className="text-sm font-bold text-[#4A6CF7] underline">
          마이메뉴로 돌아가기
        </Link>
      )}
    </div>
  );
}

export default function TossSuccessPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">처리 중...</p>}>
      <TossSuccessInner />
    </Suspense>
  );
}
