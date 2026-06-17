import { Suspense } from "react";
import SimpleTypeWriteClient from "@/components/SimpleTypeWriteClient";

export default function Write7Page() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <SimpleTypeWriteClient postType={7} title="분양대행 문의" listPath="/list7" />
    </Suspense>
  );
}
