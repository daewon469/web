"use client";

import PostCard from "@/components/PostCard";
import { Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function LikePage() {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { items: liked } = await Posts.listLiked({
        username: session.username,
        limit: 50,
      });
      setItems(liked.map((p) => ({ ...p, liked: true })));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "관심현장을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded bg-[#2F6BFF] py-1.5 text-center text-[15px] font-extrabold text-white">
        ※ &apos;관 심 현 장&apos; 을 보고 계십니다.
      </div>

      {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="py-12 text-center text-gray-500">관심 등록한 현장이 없습니다.</p>
      )}
      {!loading && items.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
