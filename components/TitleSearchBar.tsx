"use client";

import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type TitleSearchBarProps = {
  /** true면 검색 시 /textsearch?q= 로 이동 (첫화면용) */
  redirectOnSearch?: boolean;
  onSearch?: (query: string) => void | Promise<void>;
  loading?: boolean;
  defaultQuery?: string;
  className?: string;
};

export default function TitleSearchBar({
  redirectOnSearch = false,
  onSearch,
  loading = false,
  defaultQuery = "",
  className = "",
}: TitleSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  const ensureLogin = () => {
    const session = getSession();
    if (session.isLogin) return true;
    alert("로그인이 필요합니다.");
    router.push("/login");
    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (!ensureLogin()) return;

    if (redirectOnSearch) {
      router.push(`/textsearch?q=${encodeURIComponent(q)}`);
      return;
    }

    await onSearch?.(q);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`.trim()}>
      <input
        type="search"
        placeholder="제목을 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-[#4A6CF7] px-5 font-bold text-white disabled:opacity-60"
      >
        검색
      </button>
    </form>
  );
}
