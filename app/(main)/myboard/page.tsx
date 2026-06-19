import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import MyBoardPageClient from "@/components/MyBoardPageClient";

export const metadata: Metadata = pageMetadata("마이메뉴", "포인트·캐시·내 글·설정을 관리하세요.");

export default function MyBoardPage() {
  return <MyBoardPageClient />;
}
