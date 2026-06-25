"use client";

import ListPostGrid from "@/components/ListPostGrid";
import { Posts, UIConfig, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import {
  fetchPostsByIds,
  postMatchesTitleQuery,
  splitSlideAndFeedPosts,
} from "@/lib/postCardFormat";
import { useSlidePosts } from "@/lib/useSlidePosts";
import { getSession } from "@/lib/session";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function TextSearchPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [items, setItems] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedEnabled, setRecommendedEnabled] = useState(true);
  const [recommendedItems, setRecommendedItems] = useState<Post[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const autoSearchedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await UIConfig.get();
        if (res.status !== 0) return;
        const ts = res.config.title_search ?? { enabled: true, recommended_post_ids: [] };
        const enabled = !!ts.enabled;
        setRecommendedEnabled(enabled);
        if (!enabled) {
          setRecommendedItems([]);
          return;
        }
        const ids = Array.from(
          new Set(
            (ts.recommended_post_ids ?? [])
              .map((v) => Number(v))
              .filter((n) => Number.isFinite(n) && n > 0),
          ),
        );
        if (ids.length === 0) {
          setRecommendedItems([]);
          return;
        }
        setRecommendedItems(await fetchPostsByIds(ids));
      } finally {
        setLoadingRecommended(false);
      }
    })();
  }, []);

  const runSearch = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;

    setQuery(q);
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
  }, []);

  useEffect(() => {
    const q = initialQuery.trim();
    if (!q || autoSearchedRef.current) return;
    autoSearchedRef.current = true;
    void runSearch(q);
  }, [initialQuery, runSearch]);

  const recommendedIds = useMemo(
    () => new Set(recommendedItems.map((p) => Number(p.id))),
    [recommendedItems],
  );
  const recommendedSlideFilter = useCallback(
    (p: Post) => recommendedIds.has(Number(p.id)),
    [recommendedIds],
  );
  const recommendedSlidePosts = useSlidePosts(recommendedSlideFilter);
  const recommendedFeedItems = useMemo(
    () => splitSlideAndFeedPosts(recommendedItems).feed,
    [recommendedItems],
  );

  const searchSlideFilter = useCallback(
    (p: Post) => postMatchesTitleQuery(p, query),
    [query],
  );
  const searchSlidePosts = useSlidePosts(searchSlideFilter);
  const searchFeedItems = useMemo(() => splitSlideAndFeedPosts(items).feed, [items]);
  const searchIsEmpty = items.length === 0 && searchSlidePosts.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#0B1B3A]">제목 검색</h1>

      {!searched && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-[#0B1B3A]">추천 현장</p>
          {loadingRecommended && (
            <p className="py-4 text-center text-gray-500">불러오는 중...</p>
          )}
          {!loadingRecommended && !recommendedEnabled && (
            <p className="py-4 text-center text-gray-500">추천 현장이 비활성화되어 있습니다.</p>
          )}
          {!loadingRecommended && recommendedEnabled && recommendedItems.length === 0 && (
            <p className="py-4 text-center text-gray-500">등록된 추천 현장이 없습니다.</p>
          )}
          {!loadingRecommended && recommendedEnabled && (
            <ListPostGrid
              slideItems={recommendedSlidePosts}
              feedItems={recommendedFeedItems}
            />
          )}
        </div>
      )}

      {loading && <p className="py-8 text-center text-gray-500">검색 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && searched && searchIsEmpty && !error && (
        <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
      )}

      {!loading && searched && (
        <ListPostGrid slideItems={searchSlidePosts} feedItems={searchFeedItems} />
      )}
    </div>
  );
}
