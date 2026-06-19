import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import TextSearchPageClient from "./TextSearchPageClient";

export const metadata: Metadata = pageMetadata(
  "제목 검색",
  "구인글 제목으로 현장을 검색하세요.",
);

export default function TextSearchPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <TextSearchPageClient />
    </Suspense>
  );
}
