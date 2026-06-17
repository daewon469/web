"use client";

import KakaoMapPanel from "@/components/KakaoMapPanel";
import PostCard from "@/components/PostCard";
import { Posts, type Post } from "@/lib/api";
import { getSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { username } = getSession();
      const { items } = await Posts.list({
        username: username ?? undefined,
        limit: 100,
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

  useEffect(() => {
    const openMap = searchParams.get("openMap");
    if (openMap === "1" || openMap === "true") {
      const session = getSession();
      if (!session.isLogin) {
        router.replace("/login");
        return;
      }
      setMapOpen(true);
    }
  }, [searchParams, router]);

  const closeMap = () => {
    setMapOpen(false);
    if (searchParams.get("openMap")) {
      router.replace("/list");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0B1B3A]">구인 현장</h1>
          {getSession().isLogin && (
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="rounded-lg bg-[#1A2B5F] px-3 py-1.5 text-sm font-bold text-white"
            >
              지도검색
            </button>
          )}
        </div>

        {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}

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

        {!loading && !error && posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      <KakaoMapPanel open={mapOpen} onClose={closeMap} posts={posts} />
    </>
  );
}
