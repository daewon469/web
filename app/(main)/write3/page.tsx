import { Suspense } from "react";
import SimpleTypeWriteClient from "@/components/SimpleTypeWriteClient";

export default function Write3Page() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <SimpleTypeWriteClient postType={3} title="커뮤니티" listPath="/list3" />
    </Suspense>
  );
}
