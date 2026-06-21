"use client";

import BlueStrip from "@/components/BlueStrip";
import PostCard from "@/components/PostCard";
import PostCard2 from "@/components/PostCard2";
import RegionCategoryTabs from "@/components/RegionCategoryTabs";
import { Posts, type Post } from "@/lib/api";
import {
  type RegionObj,
  selectedRegionsToPostListParams,
  toProvinceShort,
} from "@/lib/regionUtils";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function orderPostsByCardType(items: Post[]): Post[] {
  const type1 = items.filter((p) => p.card_type === 1);
  const type2 = items.filter((p) => p.card_type === 2);
  const type3 = items.filter((p) => p.card_type === 3);
  return [...type1, ...type2, ...type3];
}

function renderListCard(post: Post) {
  if (post.card_type === 2) return <PostCard2 post={post} />;
  return <PostCard post={post} />;
}

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
        setPosts((prev) => (reset ? items : [...prev, ...items]));
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

  const orderedPosts = useMemo(() => orderPostsByCardType(posts), [posts]);

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

      <div className="flex flex-col gap-1.5 px-2.5">
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

          {!loading && !error && posts.length === 0 && (
            <p className="py-12 text-center text-gray-500">등록된 구인글이 없습니다.</p>
          )}

          {!error && orderedPosts.map((post) => <div key={post.id}>{renderListCard(post)}</div>)}

          {loadingMore && (
            <p className="py-4 text-center text-sm text-gray-500">더 불러오는 중...</p>
          )}

          {cursor && !loading && !error && <div ref={loadMoreRef} className="h-4" aria-hidden />}
      </div>
    </div>
  );
}
