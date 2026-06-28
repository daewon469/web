"use client";

import BlueStrip from "@/components/BlueStrip";
import ListPostGrid from "@/components/ListPostGrid";
import { Auth, Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import {
  type CustomMatchConfig,
  postMatchesCustomConfig,
  splitSlideAndFeedPosts,
} from "@/lib/postCardFormat";
import { useSlidePosts } from "@/lib/useSlidePosts";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CustomLikePage() {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasConfig, setHasConfig] = useState(false);
  const [customConfig, setCustomConfig] = useState<CustomMatchConfig | null>(null);

  const slideFilter = useCallback(
    (p: Post) => (customConfig ? postMatchesCustomConfig(p, customConfig) : false),
    [customConfig],
  );
  const { posts: slidePosts, setPostLiked } = useSlidePosts(slideFilter);
  const feedItems = useMemo(() => splitSlideAndFeedPosts(items).feed, [items]);
  const setFeedPostLiked = useCallback((postId: number, liked: boolean) => {
    setItems((prev) =>
      prev.map((p) => (Number(p.id) === postId ? { ...p, liked } : p)),
    );
  }, []);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await Auth.getUser(session.username);
      const inds = res.user?.custom_industry_codes ?? [];
      const regs = res.user?.custom_region_codes ?? [];
      const roles = res.user?.custom_role_codes ?? [];
      const has =
        inds.some((s) => String(s).trim()) ||
        regs.some((s) => String(s).trim()) ||
        (roles ?? []).some((s) => String(s).trim());
      setHasConfig(has);
      if (!has) {
        setCustomConfig(null);
        setItems([]);
        return;
      }
      setCustomConfig({
        industryCodes: inds.map((s) => String(s)),
        regionCodes: regs.map((s) => String(s)),
        roleCodes: (roles ?? []).map((s) => String(s)),
      });
      const { items: fetched } = await Posts.listCustom({
        username: session.username,
        limit: 50,
        status: "published",
      });
      setItems(fetched);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "맞춤저장을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const isEmpty = items.length === 0 && slidePosts.length === 0;

  return (
    <div className="flex flex-col gap-1.5 bg-[#f5f5f5]">
      <div className="-mx-3 flex flex-col lg:mx-0">
        <BlueStrip mode="custom" />

        <div className="flex flex-col gap-1.5">
          {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {!loading && !hasConfig && (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">맞춤저장 설정이 없습니다.</p>
              <Link href="/customsite" className="mt-3 inline-block text-[#4A6CF7] underline">
                맞춤 설정하러 가기
              </Link>
            </div>
          )}

          {!loading && hasConfig && isEmpty && !error && (
            <p className="py-12 text-center text-gray-500">맞춤 조건에 맞는 구인글이 없습니다.</p>
          )}

          {!loading && !error && hasConfig && (
            <ListPostGrid
              slideItems={slidePosts}
              feedItems={feedItems}
              onSlidePostLikedChange={setPostLiked}
              onFeedPostLikedChange={setFeedPostLiked}
            />
          )}
        </div>
      </div>
    </div>
  );
}
