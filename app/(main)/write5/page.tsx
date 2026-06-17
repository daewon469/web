import { Suspense } from "react";
import SimpleTypeWriteClient from "@/components/SimpleTypeWriteClient";

export default function Write5Page() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-gray-500">불러오는 중...</p>}>
      <SimpleTypeWriteClient
        postType={5}
        title="공지사항"
        listPath="/list5"
        requireAdmin
      />
    </Suspense>
  );
}
