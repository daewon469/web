"use client";

import BlueStrip from "@/components/BlueStrip";
import CustomFilterModal, { type CustomFilterValue } from "@/components/CustomFilterModal";
import { ListHomeWebTopBannerCarousel } from "@/components/FeedBanner";
import HomePopup from "@/components/HomePopup";
import KakaoMapPanel from "@/components/KakaoMapPanel";
import ListHomeSearchRow from "@/components/ListHomeSearchRow";
import ListPostGrid, { type WebFeedBannerConfig } from "@/components/ListPostGrid";
import PostcardSSlider from "@/components/PostcardSSlider";
import RegionCategoryTabs from "@/components/RegionCategoryTabs";
import ReferralModal from "@/components/ReferralModal";
import { Auth, Posts, UIConfig, type Post, type UIConfigWebBannerSection } from "@/lib/api";
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

const EMPTY_CUSTOM_FILTER: CustomFilterValue = {
  provinces: [],
  industries: [],
  roles: [],
};

function parseRoleFlag(v: unknown) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return false;
  return s === "1" || s === "true" || s === "y" || s === "yes" || s === "on";
}

function hasRoleData(useValue: unknown, feeValue: unknown) {
  return parseRoleFlag(useValue) || Boolean(String(feeValue ?? "").trim());
}

function postMatchesCustomFilter(p: Post, f: CustomFilterValue) {
  const provs = (f.provinces || []).map((s) => String(s ?? "").trim()).filter(Boolean);
  const inds = (f.industries || []).map((s) => String(s ?? "").trim()).filter(Boolean);
  const roles = (f.roles || []).map((s) => String(s ?? "").trim()).filter(Boolean);

  const hasProvFilter = provs.length > 0 && !provs.includes("전체");
  const hasIndFilter = inds.length > 0;
  const hasRoleFilter = roles.length > 0;

  if (!hasProvFilter && !hasIndFilter && !hasRoleFilter) return true;

  if (hasProvFilter) {
    const sp = toProvinceShort((p as Post & { province?: string }).province);
    if (!sp || !provs.includes(sp)) return false;
  }

  if (hasIndFilter) {
    const indRaw = String((p as Post & { job_industry?: string }).job_industry ?? "").trim();
    if (!indRaw) return false;
    const indList = indRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (indList.length === 0) return false;
    if (!indList.some((ind) => inds.includes(ind))) return false;
  }

  if (hasRoleFilter) {
    const wants = new Set(roles);
    const row = p as Post & Record<string, unknown>;
    const hasTotal = hasRoleData(row.total_use, row.total_fee);
    const hasBranchOnly = parseRoleFlag(row.branch_use);
    const hasLeaderOrTeam =
      hasRoleData(row.leader_use, row.leader_fee) || hasRoleData(row.team_use, row.team_fee);
    const hasMemberOrEach =
      hasRoleData(row.member_use, row.member_fee) || hasRoleData(row.each_use, row.each_fee);
    const ok =
      (wants.has("총괄") && hasTotal) ||
      (wants.has("본부장") && hasBranchOnly) ||
      (wants.has("팀장") && hasLeaderOrTeam) ||
      (wants.has("팀원") && hasMemberOrEach) ||
      (wants.has("기타") && Boolean(String(row.other_role_name ?? "").trim()));
    if (!ok) return false;
  }

  return true;
}

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
  const [webTopBanner, setWebTopBanner] = useState<UIConfigWebBannerSection>({
    enabled: true,
    items: [],
    cols_per_row: 3,
    rotation_count: 3,
    height: 160,
    resize_mode: "contain",
    auto_play_ms: 4000,
  });
  const [webFeedBanner, setWebFeedBanner] = useState<UIConfigWebBannerSection>({
    enabled: true,
    items: [],
    cols_per_row: 3,
    interval_rows: 3,
    rotation_count: 3,
    height: 160,
    resize_mode: "contain",
  });
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [customFilterOpen, setCustomFilterOpen] = useState(false);
  const [customFilter, setCustomFilter] = useState<CustomFilterValue>(EMPTY_CUSTOM_FILTER);
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
  const isCustomViewActive = useMemo(() => {
    const provinces = customFilter.provinces.map((value) => value.trim()).filter(Boolean);
    const industries = customFilter.industries.map((value) => value.trim()).filter(Boolean);
    const roles = customFilter.roles.map((value) => value.trim()).filter(Boolean);
    return (
      (provinces.length > 0 && !provinces.includes("전체")) ||
      industries.length > 0 ||
      roles.length > 0
    );
  }, [customFilter]);
  const effectiveRegionParams = useMemo(
    () =>
      isCustomViewActive
        ? { province: undefined, city: undefined, regions: undefined }
        : regionParams,
    [isCustomViewActive, regionParams],
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

  const resetCustomFilter = useCallback(() => {
    setCustomFilter(EMPTY_CUSTOM_FILTER);
    setSelectedRegions([{ province: "전체", city: "전체" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const changeRegions = useCallback((regions: RegionObj[]) => {
    setCustomFilter(EMPTY_CUSTOM_FILTER);
    setSelectedRegions(regions);
  }, []);

  const applyCustomFilter = useCallback((value: CustomFilterValue) => {
    const active =
      value.provinces.some((item) => item.trim() && item.trim() !== "전체") ||
      value.industries.some((item) => item.trim()) ||
      value.roles.some((item) => item.trim());
    setCustomFilter(value);
    if (active) setSelectedRegions([{ province: "전체", city: "전체" }]);
  }, []);

  useEffect(() => {
    UIConfig.get().then((res) => {
      if (res.status !== 0) return;
      const wt = res.config.web_top_banner;
      if (wt) {
        setWebTopBanner({
          enabled: wt.enabled !== false,
          items: (wt.items ?? []).filter((b) => String(b.image_url ?? "").trim()),
          cols_per_row: 3,
          rotation_count: wt.rotation_count === 5 ? 5 : 3,
          height: wt.height ?? 160,
          resize_mode:
            wt.resize_mode === "cover" || wt.resize_mode === "stretch"
              ? wt.resize_mode
              : "contain",
          auto_play_ms: wt.auto_play_ms ?? 4000,
        });
      }
      const wb = res.config.web_banner;
      if (wb) {
        setWebFeedBanner({
          enabled: wb.enabled !== false,
          items: (wb.items ?? []).filter((b) => String(b.image_url ?? "").trim()),
          cols_per_row: 3,
          interval_rows: wb.interval_rows === 5 ? 5 : 3,
          rotation_count: wb.rotation_count === 5 ? 5 : 3,
          height: wb.height ?? 160,
          resize_mode:
            wb.resize_mode === "cover" || wb.resize_mode === "stretch"
              ? wb.resize_mode
              : "contain",
        });
      }
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
        const requestLimit = isCustomViewActive ? 333 : 20;
        const listPromise = Posts.list({
          username: username ?? undefined,
          limit: requestLimit,
          cursor: reset ? undefined : cursor,
          status: "published",
          province: effectiveRegionParams.province,
          city: effectiveRegionParams.city,
          regions: effectiveRegionParams.regions,
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
        setCursor(items.length >= requestLimit ? next_cursor : undefined);
        if (slideItems) setSlidePosts(normalizeItems(slideItems));
      } catch {
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [cursor, refreshing, effectiveRegionParams, isCustomViewActive],
  );

  const refresh = useCallback(async () => {
    setCursor(undefined);
    setRefreshing(true);
    setError(null);
    try {
      const { username } = getSession();
      const requestLimit = isCustomViewActive ? 333 : 20;
      const [{ items, next_cursor }, slideItems, likedIds] = await Promise.all([
        Posts.list({
          username: username ?? undefined,
          limit: requestLimit,
          status: "published",
          province: effectiveRegionParams.province,
          city: effectiveRegionParams.city,
          regions: effectiveRegionParams.regions,
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
      setCursor(items.length >= requestLimit ? next_cursor : undefined);
      setSlidePosts(normalizeItems(slideItems));
    } catch {
      setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setRefreshing(false);
    }
  }, [effectiveRegionParams, isCustomViewActive]);

  useEffect(() => {
    setCursor(undefined);
    load(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [effectiveRegionParams, isCustomViewActive]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const orderedPosts = useMemo(() => {
    const feed = splitSlideAndFeedPosts(posts).feed;
    return feed.filter((p) => postMatchesCustomFilter(p, customFilter));
  }, [posts, customFilter]);

  const postcardS = useMemo(() => {
    const ordered = orderSlidePosts(slidePosts, slidePostIds);
    if (isNationwide) return ordered;
    return ordered.filter((p) => postMatchesRegionParams(p, regionParams));
  }, [slidePosts, slidePostIds, isNationwide, regionParams]);

  const showWebTopBanners =
    webTopBanner.enabled && webTopBanner.items.some((b) => String(b.image_url ?? "").trim());

  const feedBannerConfig = useMemo<WebFeedBannerConfig | undefined>(() => {
    if (!webFeedBanner.enabled) return undefined;
    if (!webFeedBanner.items.some((b) => String(b.image_url ?? "").trim())) return undefined;
    return {
      enabled: true,
      items: webFeedBanner.items,
      intervalRows: webFeedBanner.interval_rows === 5 ? 5 : 3,
      rotationCount: webFeedBanner.rotation_count === 5 ? 5 : 3,
      resizeMode: webFeedBanner.resize_mode,
      maxHeight: webFeedBanner.height ?? 160,
      onReferralClick: openReferralModal,
    };
  }, [webFeedBanner, openReferralModal]);

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
      <CustomFilterModal
        open={customFilterOpen}
        value={customFilter}
        onClose={() => setCustomFilterOpen(false)}
        onApply={applyCustomFilter}
      />

      <div className="relative -mx-3 flex flex-col lg:mx-0">
        <div className="-mx-3 lg:mx-0">
          <BlueStrip
            mode={isCustomViewActive ? "custom" : isNationwide ? "nationwide" : "region"}
            regionLabel={regionStripLabel}
            onResetRegion={resetRegionFilter}
            onResetCustom={isCustomViewActive ? resetCustomFilter : undefined}
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
            <RegionCategoryTabs
              selectedRegions={selectedRegions}
              onChangeRegions={changeRegions}
            />

            <ListHomeSearchRow onCustomView={() => setCustomFilterOpen(true)} />

            {!error && postcardS.length > 0 && (
              <PostcardSSlider posts={postcardS} onPostLikedChange={setSlidePostLiked} />
            )}

            {showWebTopBanners && (
              <ListHomeWebTopBannerCarousel
                items={webTopBanner.items}
                rotationCount={webTopBanner.rotation_count === 5 ? 5 : 3}
                colsPerRow={3}
                autoPlayMs={webTopBanner.auto_play_ms ?? 4000}
                defaultResizeMode={webTopBanner.resize_mode}
                maxHeight={webTopBanner.height ?? 160}
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
                showSlides={false}
                webFeedBanner={feedBannerConfig}
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
