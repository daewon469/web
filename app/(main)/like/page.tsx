"use client";

import BlueStrip from "@/components/BlueStrip";
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
    <div className="flex flex-col gap-1.5 bg-[#f5f5f5]">
      <div className="-mx-3 flex flex-col lg:mx-0">
        <BlueStrip mode="like" />

        <div className="flex flex-col gap-1.5 px-2.5">
          {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="py-12 text-center text-gray-500">관심 등록한 현장이 없습니다.</p>
          )}
          {!loading && items.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
    </div>
  );
}
