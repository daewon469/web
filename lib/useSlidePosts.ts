"use client";

import { UIConfig, type Post } from "@/lib/api";
import {
  fetchPostsByIds,
  fetchSlideListPosts,
  filterSlideListPosts,
  orderSlidePosts,
} from "@/lib/postCardFormat";
import { getSession } from "@/lib/session";
import { useEffect, useMemo, useState } from "react";

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
        if (!cancelled) setSlidePosts(fetched);
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
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const fetched = await fetchPostsByIds(missing);
        const valid = filterSlideListPosts(fetched);
        if (cancelled || valid.length === 0) return;
        setSlidePosts((prev) => {
          const ids = new Set(prev.map((p) => Number(p.id)));
          const add = valid.filter((p) => !ids.has(Number(p.id)));
          return add.length > 0 ? [...prev, ...add] : prev;
        });
      } catch {
        /* 조용히 실패 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slidePostIds, slidePosts]);

  return useMemo(() => {
    const ordered = orderSlidePosts(slidePosts, slidePostIds);
    return filter ? ordered.filter(filter) : ordered;
  }, [slidePosts, slidePostIds, filter]);
}
