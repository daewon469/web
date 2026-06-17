"use client";

import PostCard from "@/components/PostCard";
import { Posts, type Post } from "@/lib/api";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useState } from "react";

export default function ListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { username } = getSession();
      const { items } = await Posts.list({
        username: username ?? undefined,
        limit: 50,
        status: "published",
      });
      setPosts(items);
    } catch {
      setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold text-[#0B1B3A]">구인 현장</h1>

      {loading && (
        <p className="py-12 text-center text-gray-500">불러오는 중...</p>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
          {error}
          <button
            type="button"
            onClick={load}
            className="mt-2 block w-full text-sm font-medium text-[#4A6CF7] underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="py-12 text-center text-gray-500">등록된 구인글이 없습니다.</p>
      )}

      {!loading &&
        !error &&
        posts.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
