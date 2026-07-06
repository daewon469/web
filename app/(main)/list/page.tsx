import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import ListPageClient from "./ListPageClient";

export const metadata: Metadata = pageMetadata(
  "구인 현장",
  "전국 분양 구인 현장을 조회하고 관심 현장을 저장하세요.",
);

/** 홈(/list)은 ListHomeToolbar·ListHomeSearchRow에서 상단 UI 렌더 */
export default function ListPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <ListPageClient />
    </Suspense>
  );
}
