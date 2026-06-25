"use client";

import BlueStrip from "@/components/BlueStrip";
import ListPostGrid from "@/components/ListPostGrid";
import { Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { splitSlideAndFeedPosts } from "@/lib/postCardFormat";
import { useSlidePosts } from "@/lib/useSlidePosts";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function LikePage() {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const likedIds = useMemo(() => new Set(items.map((p) => Number(p.id))), [items]);
  const slideFilter = useCallback(
    (p: Post) => likedIds.has(Number(p.id)) || !!p.liked,
    [likedIds],
  );
  const slidePosts = useSlidePosts(slideFilter);
  const feedItems = useMemo(() => splitSlideAndFeedPosts(items).feed, [items]);

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

  const isEmpty = items.length === 0 && slidePosts.length === 0;

  return (
    <div className="flex flex-col gap-1.5 bg-[#f5f5f5]">
      <div className="-mx-3 flex flex-col lg:mx-0">
        <BlueStrip mode="like" />

        <div className="flex flex-col gap-1.5">
          {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!loading && !error && isEmpty && (
            <p className="py-12 text-center text-gray-500">관심 등록한 현장이 없습니다.</p>
          )}
          {!loading && !error && (
            <ListPostGrid slideItems={slidePosts} feedItems={feedItems} />
          )}
        </div>
      </div>
    </div>
  );
}
