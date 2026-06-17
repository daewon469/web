import { Suspense } from "react";
import MyPageClient from "./MyPageClient";

export default function MyPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <MyPageClient />
    </Suspense>
  );
}
