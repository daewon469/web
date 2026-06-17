import { Suspense } from "react";
import AdWritePageClient from "@/components/AdWritePageClient";

export default function Write4Page() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <AdWritePageClient />
    </Suspense>
  );
}
