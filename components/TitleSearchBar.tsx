"use client";

import NavIcon from "@/components/NavIcon";
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
    <form onSubmit={handleSubmit} className={`relative w-full min-w-0 ${className}`.trim()}>
      <input
        type="search"
        placeholder="현장을 검색하세요."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border-2 border-[#4A6CF7] bg-white py-3 pl-4 pr-12 outline-none ring-2 ring-[#4A6CF7]/30 focus:border-[#4A6CF7] focus:ring-[#4A6CF7]/40"
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="검색"
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#4A6CF7] hover:bg-[#EEF3FF] disabled:opacity-50"
      >
        <NavIcon name="search" size={22} />
      </button>
    </form>
  );
}
