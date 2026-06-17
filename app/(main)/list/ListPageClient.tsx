"use client";

import { FeedBannerCard, TopBannerStrip } from "@/components/FeedBanner";
import HomePopup from "@/components/HomePopup";
import KakaoMapPanel from "@/components/KakaoMapPanel";
import PostCard from "@/components/PostCard";
import { Posts, UIConfig, type Post, type UIConfigBannerItem } from "@/lib/api";
import { getSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [topBanners, setTopBanners] = useState<UIConfigBannerItem[]>([]);
  const [feedBanner, setFeedBanner] = useState<{
    enabled: boolean;
    interval: number;
    items: UIConfigBannerItem[];
  }>({ enabled: false, interval: 10, items: [] });

  useEffect(() => {
    UIConfig.get().then((res) => {
      if (res.status !== 0) return;
      const tb = res.config.top_banner;
      if (tb?.enabled) setTopBanners(tb.items ?? []);
      setFeedBanner({
        enabled: !!res.config.banner?.enabled,
        interval: Number(res.config.banner?.interval_posts ?? 10) || 10,
        items: res.config.banner?.items ?? [],
      });
    });
  }, []);

  const load = useCallback(async (reset: boolean) => {
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
      });
      setPosts((prev) => (reset ? items : [...prev, ...items]));
      setCursor(items.length >= 20 ? next_cursor : undefined);
    } catch {
      setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor]);

  useEffect(() => {
    load(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const openMap = searchParams.get("openMap");
    if (openMap === "1" || openMap === "true") {
      const session = getSession();
      if (!session.isLogin) {
        router.replace("/login");
        return;
      }
      setMapOpen(true);
    }
  }, [searchParams, router]);

  const feed = useMemo(
    () => buildFeed(posts, feedBanner.enabled, feedBanner.interval, feedBanner.items),
    [posts, feedBanner],
  );

  const closeMap = () => {
    setMapOpen(false);
    if (searchParams.get("openMap")) {
      router.replace("/list");
    }
  };

  return (
    <>
      <HomePopup />
      <div className="flex flex-col gap-3">
        {topBanners.length > 0 && <TopBannerStrip items={topBanners} />}

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0B1B3A]">구인 현장</h1>
          {getSession().isLogin && (
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="rounded-lg bg-[#1A2B5F] px-3 py-1.5 text-sm font-bold text-white"
            >
              지도검색
            </button>
          )}
        </div>

        {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}

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

        {!loading &&
          !error &&
          feed.map((row) =>
            row.kind === "post" ? (
              <PostCard key={row.post.id} post={row.post} />
            ) : (
              <FeedBannerCard key={row.key} item={row.item} />
            ),
          )}

        {cursor && !loading && !error && (
          <button
            type="button"
            onClick={() => load(false)}
            disabled={loadingMore}
            className="rounded-xl border border-gray-300 bg-white py-3 font-bold disabled:opacity-50"
          >
            {loadingMore ? "불러오는 중..." : "더 보기"}
          </button>
        )}
      </div>

      <KakaoMapPanel open={mapOpen} onClose={closeMap} posts={posts} />
    </>
  );
}
