"use client";

import BlueStrip from "@/components/BlueStrip";
import { ListHomeTopBannerRow } from "@/components/FeedBanner";
import HomePopup from "@/components/HomePopup";
import KakaoMapPanel from "@/components/KakaoMapPanel";
import ListHomeSearchRow from "@/components/ListHomeSearchRow";
import ListPostGrid from "@/components/ListPostGrid";
import PostcardSSlider from "@/components/PostcardSSlider";
import RegionViewPanel from "@/components/RegionViewPanel";
import ReferralModal from "@/components/ReferralModal";
import { Auth, Posts, UIConfig, type Post, type UIConfigBannerItem } from "@/lib/api";
import {
  fetchLikedPostIds,
  fetchPostsByIds,
  fetchSlideListPosts,
  filterSlideListPosts,
  mergeSlidePosts,
  normalizePostLiked,
  orderSlidePosts,
  overlayLikedPosts,
  postMatchesRegionParams,
  splitSlideAndFeedPosts,
} from "@/lib/postCardFormat";
import { ensureKakaoMapsSdk } from "@/lib/kakaoMaps";
import {
  LIST_PAGE_CONTENT_MAX_PX,
  LIST_PAGE_CONTENT_PX,
} from "@/lib/listCardLayout";
import {
  type RegionObj,
  selectedRegionsToPostListParams,
  toProvinceShort,
} from "@/lib/regionUtils";
import { getSession } from "@/lib/session";
import { usePostLikedSync } from "@/lib/usePostLikedSync";
import { useSlidePostIds } from "@/lib/useSlidePostIds";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

export default function ListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapMounted, setMapMounted] = useState(false);
  const [mapSearchOpen, setMapSearchOpen] = useState(false);
  const openMapParam = searchParams.get("openMap");
  const mapOpenFromUrl = openMapParam === "1" || openMapParam === "true";
  const [topBanners, setTopBanners] = useState<UIConfigBannerItem[]>([]);
  const [topBannerResizeMode, setTopBannerResizeMode] = useState<
    "contain" | "cover" | "stretch"
  >("contain");
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<RegionObj[]>([
    { province: "전체", city: "전체" },
  ]);
  const slidePostIds = useSlidePostIds();
  const [slidePosts, setSlidePosts] = useState<Post[]>([]);
  const setSlidePostLiked = useCallback((postId: number, liked: boolean) => {
    setSlidePosts((prev) =>
      prev.map((p) => (Number(p.id) === postId ? { ...p, liked } : p)),
    );
  }, []);
  const setFeedPostLiked = useCallback((postId: number, liked: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (Number(p.id) === postId ? { ...p, liked } : p)),
    );
  }, []);

  /** 관심현장 등 다른 페이지에서 해제한 항목 반영 */
  usePostLikedSync(
    useCallback((postId, liked) => {
      setPosts((prev) =>
        prev.map((p) => (Number(p.id) === postId ? { ...p, liked } : p)),
      );
      setSlidePosts((prev) =>
        prev.map((p) => (Number(p.id) === postId ? { ...p, liked } : p)),
      );
    }, []),
  );

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

  const resetRegionFilter = useCallback(() => {
    setSelectedRegions([{ province: "전체", city: "전체" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    UIConfig.get().then((res) => {
      if (res.status !== 0) return;
      const tb = res.config.top_banner;
      const enabled = tb?.enabled !== false;
      const items = (tb?.items ?? []).filter((b) => String(b.image_url ?? "").trim());
      setTopBanners(enabled ? items : []);
      setTopBannerResizeMode((() => {
        const rm = String(tb?.resize_mode ?? "contain");
        return rm === "cover" || rm === "stretch" ? rm : "contain";
      })());
    });
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
        if (likedIds) {
          setPosts((prev) => {
            const next = overlayLikedPosts(prev, likedIds);
            return hasSamePostOrderAndLikedState(prev, next) ? prev : next;
          });
        }
        setSlidePosts((prev) => {
          const overlaid = normalizeItems(prev);
          const next = valid.length > 0 ? mergeSlidePosts(overlaid, valid) : overlaid;
          return hasSamePostOrderAndLikedState(prev, next) ? prev : next;
        });
      } catch {
        /* 목록은 이미 표시 중 — 누락분만 조용히 실패 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slidePostIds, slidePosts]);

  const load = useCallback(
    async (reset: boolean) => {
      if (reset) {
        if (refreshing) setRefreshing(true);
        else setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      try {
        const { username } = getSession();
        const listPromise = Posts.list({
          username: username ?? undefined,
          limit: 20,
          cursor: reset ? undefined : cursor,
          status: "published",
          province: regionParams.province,
          city: regionParams.city,
          regions: regionParams.regions,
        });
        const slidePromise = reset
          ? fetchSlideListPosts({
              username: username ?? undefined,
              maxItems: 20,
            })
          : null;
        const likedPromise = username ? fetchLikedPostIds(username) : Promise.resolve(null);

        const [{ items, next_cursor }, slideItems, likedIds] = await Promise.all([
          listPromise,
          slidePromise ?? Promise.resolve(null),
          likedPromise,
        ]);
        const normalizeItems = (value: Post[]) =>
          likedIds ? overlayLikedPosts(value, likedIds) : value.map(normalizePostLiked);

        setPosts((prev) =>
          reset ? normalizeItems(items) : [...prev, ...normalizeItems(items)],
        );
        setCursor(items.length >= 20 ? next_cursor : undefined);
        if (slideItems) setSlidePosts(normalizeItems(slideItems));
      } catch {
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [cursor, refreshing, regionParams],
  );

  const refresh = useCallback(async () => {
    setCursor(undefined);
    setRefreshing(true);
    setError(null);
    try {
      const { username } = getSession();
      const [{ items, next_cursor }, slideItems, likedIds] = await Promise.all([
        Posts.list({
          username: username ?? undefined,
          limit: 20,
          status: "published",
          province: regionParams.province,
          city: regionParams.city,
          regions: regionParams.regions,
        }),
        fetchSlideListPosts({
          username: username ?? undefined,
          maxItems: 20,
        }),
        username ? fetchLikedPostIds(username) : Promise.resolve(null),
      ]);
      const normalizeItems = (value: Post[]) =>
        likedIds ? overlayLikedPosts(value, likedIds) : value.map(normalizePostLiked);
      setPosts(normalizeItems(items));
      setCursor(items.length >= 20 ? next_cursor : undefined);
      setSlidePosts(normalizeItems(slideItems));
    } catch {
      setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setRefreshing(false);
    }
  }, [regionParams]);

  useEffect(() => {
    setCursor(undefined);
    load(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [regionParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const reoverlayLikedPosts = async () => {
      const { username } = getSession();
      if (!username) return;
      try {
        const likedIds = await fetchLikedPostIds(username);
        setPosts((prev) => overlayLikedPosts(prev, likedIds));
        setSlidePosts((prev) => overlayLikedPosts(prev, likedIds));
      } catch {
        /* 세션 갱신 중 좋아요 동기화 실패는 다음 목록 로드에서 복구 */
      }
    };

    window.addEventListener("session-updated", reoverlayLikedPosts);
    return () => window.removeEventListener("session-updated", reoverlayLikedPosts);
  }, []);

  useEffect(() => {
    const reoverlayLikedPostsOnVisible = async () => {
      if (document.visibilityState !== "visible") return;
      const { isLogin, username } = getSession();
      if (!isLogin || !username) return;

      const likedIds = await fetchLikedPostIds(username);
      setPosts((prev) => overlayLikedPosts(prev, likedIds));
      setSlidePosts((prev) => overlayLikedPosts(prev, likedIds));
    };

    document.addEventListener("visibilitychange", reoverlayLikedPostsOnVisible);
    return () => document.removeEventListener("visibilitychange", reoverlayLikedPostsOnVisible);
  }, []);

  useEffect(() => {
    void ensureKakaoMapsSdk();
  }, []);

  useEffect(() => {
    if (!mapOpenFromUrl) {
      setMapSearchOpen(false);
      return;
    }
    const session = getSession();
    if (!session.isLogin) {
      router.replace("/login");
      return;
    }
    setMapSearchOpen(true);
    setMapMounted(true);
  }, [mapOpenFromUrl, router]);

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

  const openReferralModal = useCallback(async () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.push("/login");
      return;
    }
    try {
      const res = await Auth.getMyPageSummary(session.username);
      setReferralCode(res.referral_code ?? null);
    } catch {
      setReferralCode(null);
    }
    setReferralModalOpen(true);
  }, [router]);

  const orderedPosts = useMemo(() => splitSlideAndFeedPosts(posts).feed, [posts]);

  const postcardS = useMemo(() => {
    const ordered = orderSlidePosts(slidePosts, slidePostIds);
    if (isNationwide) return ordered;
    return ordered.filter((p) => postMatchesRegionParams(p, regionParams));
  }, [slidePosts, slidePostIds, isNationwide, regionParams]);

  const showTopBanners = topBanners.length > 0;

  const closeMap = useCallback(() => {
    setMapSearchOpen(false);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("openMap");
    const qs = next.toString();
    const href = qs ? `/list?${qs}` : "/list";
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", href);
    }
    router.replace(href, { scroll: false });
  }, [router, searchParams]);

  return (
    <>
      <HomePopup />
      <ReferralModal
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        referralCode={referralCode}
      />

      <div className="relative -mx-3 flex flex-col lg:mx-0">
        <div className="-mx-3 lg:mx-0">
          <BlueStrip
            mode={isNationwide ? "nationwide" : "region"}
            regionLabel={regionStripLabel}
            onResetRegion={resetRegionFilter}
          />
        </div>

        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: LIST_PAGE_CONTENT_MAX_PX,
            paddingLeft: LIST_PAGE_CONTENT_PX,
            paddingRight: LIST_PAGE_CONTENT_PX,
          }}
        >
          <div className="flex min-w-0 flex-col gap-1.5">
            <RegionViewPanel
              selectedRegions={selectedRegions}
              onChangeRegions={setSelectedRegions}
            />

            <ListHomeSearchRow />

            {!error && postcardS.length > 0 && (
              <PostcardSSlider
                posts={postcardS}
                variant="carousel"
                autoPlayMs={2000}
                maxItems={3}
                onPostLikedChange={setSlidePostLiked}
              />
            )}

            {showTopBanners && (
              <ListHomeTopBannerRow
                items={topBanners}
                defaultResizeMode={topBannerResizeMode}
                maxItems={3}
                onReferralClick={openReferralModal}
              />
            )}

            {loading && !refreshing && (
              <p className="py-12 text-center text-gray-500">불러오는 중...</p>
            )}

            {!loading && error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
                {error}
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="mt-2 block w-full text-sm font-medium text-[#4A6CF7] underline"
                >
                  다시 시도
                </button>
              </div>
            )}

            {!loading && !error && posts.length === 0 && postcardS.length === 0 && (
              <p className="py-12 text-center text-gray-500">등록된 구인글이 없습니다.</p>
            )}

            {!error && (
              <ListPostGrid
                feedItems={orderedPosts}
                onFeedPostLikedChange={setFeedPostLiked}
              />
            )}

            {loadingMore && (
              <p className="py-4 text-center text-sm text-gray-500">더 불러오는 중...</p>
            )}

            {cursor && !loading && !error && (
              <div ref={loadMoreRef} className="h-4" aria-hidden />
            )}
          </div>
        </div>
      </div>

      {mapMounted && <KakaoMapPanel open={mapSearchOpen} onClose={closeMap} />}
    </>
  );
}
