"use client";

import BlueStrip from "@/components/BlueStrip";
import ListPostGrid from "@/components/ListPostGrid";
import { Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import {
  normalizePostLiked,
  orderSlidePosts,
  splitSlideAndFeedPosts,
} from "@/lib/postCardFormat";
import {
  LIST_PAGE_CONTENT_MAX_PX,
  LIST_PAGE_CONTENT_PX,
} from "@/lib/listCardLayout";
import { usePostLikedSync } from "@/lib/usePostLikedSync";
import { useSlidePostIds } from "@/lib/useSlidePostIds";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function LikePage() {
  const router = useRouter();
  const slidePostIds = useSlidePostIds();
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
      setItems(liked.map((p) => normalizePostLiked({ ...p, liked: true })));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "관심현장을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  /** 첫화면에서 관심 등록 후 돌아왔을 때 서버 목록과 맞춤 */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  /** 첫화면 등 다른 페이지에서 관심 해제 시 목록에서 제거 */
  usePostLikedSync(
    useCallback((postId, liked) => {
      if (!liked) {
        setItems((prev) => prev.filter((p) => Number(p.id) !== postId));
      }
    }, []),
  );

  const handleLikedChange = useCallback((postId: number, liked: boolean) => {
    if (!liked) {
      setItems((prev) => prev.filter((p) => Number(p.id) !== postId));
      return;
    }
    setItems((prev) =>
      prev.map((p) => (Number(p.id) === postId ? { ...p, liked: true } : p)),
    );
  }, []);

  const slideItems = useMemo(() => {
    const { slide } = splitSlideAndFeedPosts(items);
    return orderSlidePosts(slide, slidePostIds);
  }, [items, slidePostIds]);

  const feedItems = useMemo(() => splitSlideAndFeedPosts(items).feed, [items]);

  const isEmpty = slideItems.length === 0 && feedItems.length === 0;

  return (
    <div className="flex flex-col gap-1.5 bg-[#f5f5f5]">
      <div className="-mx-3 flex flex-col lg:mx-0">
        <BlueStrip mode="like" />

        <div
          className="mx-auto flex w-full flex-col gap-1.5"
          style={{
            maxWidth: LIST_PAGE_CONTENT_MAX_PX,
            paddingLeft: LIST_PAGE_CONTENT_PX,
            paddingRight: LIST_PAGE_CONTENT_PX,
          }}
        >
          {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!loading && !error && isEmpty && (
            <p className="py-12 text-center text-gray-500">관심 등록한 현장이 없습니다.</p>
          )}
          {!loading && !error && !isEmpty && (
            <ListPostGrid
              slideItems={slideItems}
              feedItems={feedItems}
              onSlidePostLikedChange={handleLikedChange}
              onFeedPostLikedChange={handleLikedChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
