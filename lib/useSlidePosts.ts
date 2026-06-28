"use client";

import { UIConfig, type Post } from "@/lib/api";
import {
  fetchLikedPostIds,
  fetchPostsByIds,
  fetchSlideListPosts,
  filterSlideListPosts,
  mergeSlidePosts,
  normalizePostLiked,
  orderSlidePosts,
  overlayLikedPosts,
} from "@/lib/postCardFormat";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useMemo, useState } from "react";

function hasSamePostOrderAndLikedState(prev: Post[], next: Post[]) {
  return (
    prev.length === next.length &&
    prev.every((post, index) => {
      const nextPost = next[index];
      if (!nextPost || Number(post.id) !== Number(nextPost.id)) return false;
      return normalizePostLiked(post).liked === normalizePostLiked(nextPost).liked;
    })
  );
}

/** 첫 화면과 동일하게 card_type=5 구인글을 별도 조회 (일반 목록 API에는 포함되지 않음) */
export function useSlidePosts(filter?: (post: Post) => boolean) {
  const [slidePostIds, setSlidePostIds] = useState<number[]>([]);
  const [slidePosts, setSlidePosts] = useState<Post[]>([]);

  useEffect(() => {
    UIConfig.get().then((res) => {
      if (res.status !== 0) return;
      setSlidePostIds(
        Array.from(
          new Set(
            (res.config.slide_posts?.post_ids ?? [])
              .map((v) => Number(v))
              .filter((n) => Number.isFinite(n) && n > 0),
          ),
        ),
      );
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { username } = getSession();
        const fetched = await fetchSlideListPosts({
          username: username ?? undefined,
          maxItems: 50,
        });
        const likedIds = username ? await fetchLikedPostIds(username) : null;
        const normalized = likedIds ? overlayLikedPosts(fetched, likedIds) : fetched;
        if (!cancelled) setSlidePosts(normalized);
      } catch {
        /* 조용히 실패 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slidePostIds.length === 0) return;
    const have = new Set(slidePosts.map((p) => Number(p.id)));
    const missing = slidePostIds.filter((id) => !have.has(id));

    let cancelled = false;
    (async () => {
      try {
        const { username } = getSession();
        const likedIds = username ? await fetchLikedPostIds(username) : null;
        const normalizeItems = (value: Post[]) =>
          likedIds ? overlayLikedPosts(value, likedIds) : value.map(normalizePostLiked);
        const fetched =
          missing.length > 0
            ? await fetchPostsByIds(missing, {
                username: username ?? undefined,
              })
            : [];
        const valid = normalizeItems(filterSlideListPosts(fetched));
        if (cancelled) return;
        setSlidePosts((prev) => {
          const overlaid = normalizeItems(prev);
          const next = valid.length > 0 ? mergeSlidePosts(overlaid, valid) : overlaid;
          return hasSamePostOrderAndLikedState(prev, next) ? prev : next;
        });
      } catch {
        /* 조용히 실패 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slidePostIds, slidePosts]);

  const setPostLiked = useCallback((postId: number, liked: boolean) => {
    setSlidePosts((prev) =>
      prev.map((p) => (Number(p.id) === postId ? { ...p, liked } : p)),
    );
  }, []);

  const posts = useMemo(() => {
    const ordered = orderSlidePosts(slidePosts, slidePostIds);
    return filter ? ordered.filter(filter) : ordered;
  }, [slidePosts, slidePostIds, filter]);

  return { posts, setPostLiked };
}
