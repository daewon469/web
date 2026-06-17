import { Suspense } from "react";
import SimpleTypeWriteClient from "@/components/SimpleTypeWriteClient";

export default function Write6Page() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <SimpleTypeWriteClient postType={6} title="문의/건의" listPath="/list6" />
    </Suspense>
  );
}
