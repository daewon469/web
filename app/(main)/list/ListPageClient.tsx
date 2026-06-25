"use client";

import BlueStrip from "@/components/BlueStrip";
import { ListBannerSidebar } from "@/components/FeedBanner";
import HomePopup from "@/components/HomePopup";
import KakaoMapPanel from "@/components/KakaoMapPanel";
import ListPostGrid from "@/components/ListPostGrid";
import NewsPreview from "@/components/NewsPreview";
import ReferralModal from "@/components/ReferralModal";
import { Auth, Posts, UIConfig, type Post, type UIConfigBannerItem } from "@/lib/api";
import {
  fetchPostsByIds,
  fetchSlideListPosts,
  filterSlideListPosts,
  orderSlidePosts,
  splitSlideAndFeedPosts,
} from "@/lib/postCardFormat";
import { ensureKakaoMapsSdk } from "@/lib/kakaoMaps";
import {
  hasListBannerGutter,
  LIST_BANNER_WIDTH_PX,
  LIST_PAGE_CONTENT_MAX_PX,
  LIST_PAGE_CONTENT_PX,
} from "@/lib/listCardLayout";
import { getSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
  const [feedBanner, setFeedBanner] = useState<{
    enabled: boolean;
    interval: number;
    items: UIConfigBannerItem[];
    resize_mode: "contain" | "cover" | "stretch";
  }>({ enabled: false, interval: 10, items: [], resize_mode: "contain" });
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [slidePostIds, setSlidePostIds] = useState<number[]>([]);
  const [slidePosts, setSlidePosts] = useState<Post[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const contentColumnRef = useRef<HTMLDivElement | null>(null);
  const [sidebarBannerVisible, setSidebarBannerVisible] = useState(false);

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
      setFeedBanner({
        enabled: !!res.config.banner?.enabled,
        interval: Number(res.config.banner?.interval_posts ?? 10) || 10,
        items: res.config.banner?.items ?? [],
        resize_mode: (() => {
          const rm = String(res.config.banner?.resize_mode ?? "contain");
          return rm === "cover" || rm === "stretch" ? rm : "contain";
        })(),
      });
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
        });
        const slidePromise = reset
          ? fetchSlideListPosts({
              username: username ?? undefined,
              maxItems: 20,
            })
          : null;

        const [{ items, next_cursor }, slideItems] = await Promise.all([
          listPromise,
          slidePromise ?? Promise.resolve(null),
        ]);

        setPosts((prev) => (reset ? items : [...prev, ...items]));
        setCursor(items.length >= 20 ? next_cursor : undefined);
        if (slideItems) setSlidePosts(slideItems);
      } catch {
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [cursor, refreshing],
  );

  const refresh = useCallback(async () => {
    setCursor(undefined);
    setRefreshing(true);
    setError(null);
    try {
      const { username } = getSession();
      const [{ items, next_cursor }, slideItems] = await Promise.all([
        Posts.list({
          username: username ?? undefined,
          limit: 20,
          status: "published",
        }),
        fetchSlideListPosts({
          username: username ?? undefined,
          maxItems: 20,
        }),
      ]);
      setPosts(items);
      setCursor(items.length >= 20 ? next_cursor : undefined);
      setSlidePosts(slideItems);
    } catch {
      setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setCursor(undefined);
    load(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const postcardS = useMemo(
    () => orderSlidePosts(slidePosts, slidePostIds),
    [slidePosts, slidePostIds],
  );

  const headerFeedBanners = useMemo(
    () =>
      feedBanner.enabled
        ? feedBanner.items.filter((b) => String(b.image_url ?? "").trim())
        : [],
    [feedBanner],
  );

  const showBannerRow = topBanners.length > 0 || headerFeedBanners.length > 0;

  useLayoutEffect(() => {
    if (!showBannerRow) {
      setSidebarBannerVisible(false);
      return;
    }
    const el = contentColumnRef.current;
    if (!el) return;

    const update = () => {
      setSidebarBannerVisible(hasListBannerGutter(el.getBoundingClientRect().left));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showBannerRow]);

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
        <BlueStrip mode="nationwide" />

        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: LIST_PAGE_CONTENT_MAX_PX,
            paddingLeft: LIST_PAGE_CONTENT_PX,
            paddingRight: LIST_PAGE_CONTENT_PX,
          }}
        >
          <div className="grid">
            {showBannerRow && sidebarBannerVisible && (
              <aside
                aria-label="배너"
                className="z-20 col-start-1 row-start-1 block self-start justify-self-start"
                style={{
                  width: LIST_BANNER_WIDTH_PX,
                  marginLeft: "calc((100% - 100vw) / 2)",
                }}
              >
                <div className="flex flex-col gap-1">
                  <ListBannerSidebar
                    topItems={topBanners}
                    feedItems={headerFeedBanners}
                    topResizeMode={topBannerResizeMode}
                    feedResizeMode={feedBanner.resize_mode}
                    onReferralClick={openReferralModal}
                  />
                </div>
              </aside>
            )}

            <div
              ref={contentColumnRef}
              className="col-start-1 row-start-1 flex min-w-0 flex-col gap-1.5"
            >
              <NewsPreview />

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

              {!loading && !error && posts.length === 0 && (
                <p className="py-12 text-center text-gray-500">등록된 구인글이 없습니다.</p>
              )}

              {!error && (
                <ListPostGrid slideItems={postcardS} feedItems={orderedPosts} />
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
      </div>

      {mapMounted && <KakaoMapPanel open={mapSearchOpen} onClose={closeMap} />}
    </>
  );
}
