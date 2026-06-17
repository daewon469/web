import { Suspense } from "react";
import ListPageClient from "./ListPageClient";

export default function ListPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <ListPageClient />
    </Suspense>
  );
}
