"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TossFailInner() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const msg = searchParams.get("message");

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-xl font-bold text-[#0B1B3A]">결제 실패</h1>
      <p className="text-sm text-gray-600">
        {msg || code || "결제가 취소되었거나 실패했습니다."}
      </p>
      <div className="flex gap-3">
        <Link
          href="/payment/toss"
          className="rounded-xl bg-[#4A6CF7] px-5 py-2.5 font-bold text-white"
        >
          다시 시도
        </Link>
        <Link
          href="/myboard"
          className="rounded-xl border border-gray-300 px-5 py-2.5 font-bold text-gray-700"
        >
          마이메뉴
        </Link>
      </div>
    </div>
  );
}

export default function TossFailPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <TossFailInner />
    </Suspense>
  );
}
