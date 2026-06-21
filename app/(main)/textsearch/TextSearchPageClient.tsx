"use client";

import PostCard from "@/components/PostCard";
import PostCard2 from "@/components/PostCard2";
import { Posts, UIConfig, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { useSearchParams } from "next/navigation";
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

async function fetchPostsByIds(ids: number[]) {
  const out: Post[] = [];
  const BATCH = 15;
  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const results = await Promise.allSettled(slice.map((id) => Posts.get(Number(id))));
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) out.push(r.value);
    });
  }
  const byId = new Map(out.map((p) => [Number(p.id), p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Post[];
}

export default function TextSearchPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [items, setItems] = useState<Post[]>([]);
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

  const orderedRecommendedItems = useMemo(
    () => orderPostsByCardType(recommendedItems),
    [recommendedItems],
  );
  const orderedItems = useMemo(() => orderPostsByCardType(items), [items]);

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
          {!loadingRecommended &&
            recommendedEnabled &&
            orderedRecommendedItems.map((post) => (
              <div key={post.id}>{renderListCard(post)}</div>
            ))}
        </div>
      )}

      {loading && <p className="py-8 text-center text-gray-500">검색 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && searched && items.length === 0 && !error && (
        <p className="py-8 text-center text-gray-500">검색 결과가 없습니다.</p>
      )}

      {!loading && orderedItems.map((post) => (
        <div key={post.id}>{renderListCard(post)}</div>
      ))}
    </div>
  );
}
