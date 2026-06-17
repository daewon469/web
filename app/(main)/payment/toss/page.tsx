import TossPaymentClient from "@/components/TossPaymentClient";
import { Suspense } from "react";

export default function TossPaymentPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <TossPaymentClient />
    </Suspense>
  );
}
