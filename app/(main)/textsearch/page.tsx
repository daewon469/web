"use client";

import PostCard from "@/components/PostCard";
import { Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { FormEvent, useState } from "react";

export default function TextSearchPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const { username } = getSession();
      const { items: found } = await Posts.searchTitle(q, { username: username ?? undefined });
      setItems(found);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "검색에 실패했습니다."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#0B1B3A]">제목 검색</h1>

      <form onSubmit={search} className="flex gap-2">
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

      {loading && <p className="py-8 text-center text-gray-500">검색 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && searched && items.length === 0 && !error && (
        <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
      )}

      {!loading && items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
