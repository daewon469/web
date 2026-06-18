"use client";

import BlueStrip from "@/components/BlueStrip";
import { FeedBannerCard, TopBannerStrip } from "@/components/FeedBanner";
import HomePopup from "@/components/HomePopup";
import KakaoMapPanel from "@/components/KakaoMapPanel";
import NewsPreview from "@/components/NewsPreview";
import PostCard from "@/components/PostCard";
import ReferralModal from "@/components/ReferralModal";
import RegionViewPanel from "@/components/RegionViewPanel";
import { Auth, Posts, UIConfig, type Post, type UIConfigBannerItem } from "@/lib/api";
import { ensureKakaoMapsSdk } from "@/lib/kakaoMaps";
import {
  type RegionObj,
  selectedRegionsToPostListParams,
} from "@/lib/regionUtils";
import { getSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type FeedItem =
  | { kind: "post"; post: Post }
  | { kind: "banner"; item: UIConfigBannerItem; key: string };

function buildFeed(
  posts: Post[],
  bannerEnabled: boolean,
  interval: number,
  bannerItems: UIConfigBannerItem[],
): FeedItem[] {
  const banners = bannerEnabled
    ? bannerItems.filter((b) => String(b.image_url ?? "").trim())
    : [];
  const out: FeedItem[] = [];
  let slot = 0;
  posts.forEach((post, idx) => {
    out.push({ kind: "post", post });
    const count = idx + 1;
    if (banners.length && count % Math.max(1, interval) === 0) {
      const item = banners[slot % banners.length];
      out.push({ kind: "banner", item, key: `banner-${post.id}-${slot}` });
      slot += 1;
    }
  });
  return out;
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
  const openMapParam = searchParams.get("openMap");
  const mapOpen = openMapParam === "1" || openMapParam === "true";
  const [selectedRegions, setSelectedRegions] = useState<RegionObj[]>([
    { province: "전체", city: "전체" },
  ]);
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const regionParams = useMemo(
    () => selectedRegionsToPostListParams(selectedRegions),
    [selectedRegions],
  );
  const isNationwide = useMemo(
    () => selectedRegions.some((r) => r.province === "전체"),
    [selectedRegions],
  );

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
    });
  }, []);

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
      const { items, next_cursor } = await Posts.list({
        username: username ?? undefined,
        limit: 20,
        status: "published",
        province: regionParams.province,
        city: regionParams.city,
        regions: regionParams.regions,
      });
      setPosts(items);
      setCursor(items.length >= 20 ? next_cursor : undefined);
    } catch {
      setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setRefreshing(false);
    }
  }, [regionParams]);

  useEffect(() => {
    setCursor(undefined);
    load(true);
  }, [regionParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void ensureKakaoMapsSdk();
  }, []);

  useEffect(() => {
    if (!mapOpen) return;
    const session = getSession();
    if (!session.isLogin) {
      router.replace("/login");
      return;
    }
    setMapMounted(true);
  }, [mapOpen, router]);

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

  const feed = useMemo(
    () => buildFeed(posts, feedBanner.enabled, feedBanner.interval, feedBanner.items),
    [posts, feedBanner],
  );

  const closeMap = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("openMap");
    const qs = next.toString();
    router.replace(qs ? `/list?${qs}` : "/list", { scroll: false });
  };

  const resetRegionFilter = () => {
    setSelectedRegions([{ province: "전체", city: "전체" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <HomePopup />
      <ReferralModal
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        referralCode={referralCode}
      />

      <div className="-mx-3 flex flex-col gap-1.5 lg:mx-0">
        <BlueStrip
          mode={isNationwide ? "nationwide" : "region"}
          onResetRegion={resetRegionFilter}
        />

        {topBanners.length > 0 && (
          <div className="px-2.5">
            <TopBannerStrip
              items={topBanners}
              onReferralClick={openReferralModal}
              defaultResizeMode={topBannerResizeMode}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 px-2.5">
          <NewsPreview />

          <RegionViewPanel
            selectedRegions={selectedRegions}
            onChangeRegions={setSelectedRegions}
          />

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

          {!error &&
            feed.map((row) =>
              row.kind === "post" ? (
                <PostCard key={row.post.id} post={row.post} />
              ) : (
                <FeedBannerCard
                  key={row.key}
                  item={row.item}
                  onReferralClick={openReferralModal}
                  defaultResizeMode={feedBanner.resize_mode}
                />
              ),
            )}

          {loadingMore && (
            <p className="py-4 text-center text-sm text-gray-500">더 불러오는 중...</p>
          )}

          {cursor && !loading && !error && <div ref={loadMoreRef} className="h-4" aria-hidden />}
        </div>
      </div>

      {mapMounted && <KakaoMapPanel open={mapOpen} onClose={closeMap} />}
    </>
  );
}
