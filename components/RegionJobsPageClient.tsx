"use client";

import BlueStrip from "@/components/BlueStrip";
import ListPostGrid from "@/components/ListPostGrid";
import RegionCategoryTabs from "@/components/RegionCategoryTabs";
import { Posts, type Post } from "@/lib/api";
import { normalizePostLiked, postMatchesRegionParams, splitSlideAndFeedPosts } from "@/lib/postCardFormat";
import { useSlidePosts } from "@/lib/useSlidePosts";
import {
  type RegionObj,
  selectedRegionsToPostListParams,
  toProvinceShort,
} from "@/lib/regionUtils";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function RegionJobsPageClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<RegionObj[]>([
    { province: "전체", city: "전체" },
  ]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const regionParams = useMemo(
    () => selectedRegionsToPostListParams(selectedRegions),
    [selectedRegions],
  );
  const isNationwide = useMemo(
    () => selectedRegions.some((r) => r.province === "전체"),
    [selectedRegions],
  );
  const regionStripLabel = useMemo(() => {
    if (isNationwide) return undefined;
    const first = selectedRegions.find((r) => r.province !== "전체");
    if (!first) return undefined;
    return toProvinceShort(first.province);
  }, [isNationwide, selectedRegions]);

  const load = useCallback(
    async (reset: boolean) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const { username } = getSession();
        const { items, next_cursor } = await Posts.list({
          username: username ?? undefined,
          limit: 20,
          cursor: reset ? undefined : cursor,
          status: "published",
          province: regionParams.province,
          city: regionParams.city,
          regions: regionParams.regions,
        });
        setPosts((prev) =>
          reset ? items.map(normalizePostLiked) : [...prev, ...items.map(normalizePostLiked)],
        );
        setCursor(items.length >= 20 ? next_cursor : undefined);
      } catch {
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, regionParams],
  );

  useEffect(() => {
    setCursor(undefined);
    load(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [regionParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !cursor || loading || loadingMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) load(false);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loading, loadingMore, error, load]);

  const resetRegionFilter = () => {
    setSelectedRegions([{ province: "전체", city: "전체" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const slideFilter = useCallback(
    (p: Post) => postMatchesRegionParams(p, regionParams),
    [regionParams],
  );
  const { posts: slidePosts, setPostLiked } = useSlidePosts(slideFilter);
  const feedItems = useMemo(() => splitSlideAndFeedPosts(posts).feed, [posts]);
  const setFeedPostLiked = useCallback((postId: number, liked: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (Number(p.id) === postId ? { ...p, liked } : p)),
    );
  }, []);
  const isEmpty = posts.length === 0 && slidePosts.length === 0;

  return (
    <div className="flex flex-col bg-[#f5f5f5]">
      <RegionCategoryTabs
        selectedRegions={selectedRegions}
        onChangeRegions={setSelectedRegions}
      />

      <div className="-mx-3 lg:mx-0">
        <BlueStrip
          mode={isNationwide ? "nationwide" : "region"}
          regionLabel={regionStripLabel}
          onResetRegion={resetRegionFilter}
        />
      </div>

      <div className="flex flex-col gap-1.5">
          {loading && (
            <p className="py-12 text-center text-gray-500">불러오는 중...</p>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
              {error}
              <button
                type="button"
                onClick={() => load(true)}
                className="mt-2 block w-full text-sm font-medium text-[#4A6CF7] underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && isEmpty && (
            <p className="py-12 text-center text-gray-500">등록된 구인글이 없습니다.</p>
          )}

          {!error && (
            <ListPostGrid
              slideItems={slidePosts}
              feedItems={feedItems}
              onSlidePostLikedChange={setPostLiked}
              onFeedPostLikedChange={setFeedPostLiked}
            />
          )}

          {loadingMore && (
            <p className="py-4 text-center text-sm text-gray-500">더 불러오는 중...</p>
          )}

          {cursor && !loading && !error && <div ref={loadMoreRef} className="h-4" aria-hidden />}
      </div>
    </div>
  );
}
