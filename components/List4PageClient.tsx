"use client";

import { Posts, resolveMediaUrl, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAIN_CATEGORIES = ["광고", "대출", "급매물", "중고장터"] as const;
const SPECIAL_CATEGORY = "광고하기";
const PRIMARY = "#0099FF";

type MainCategory = (typeof MAIN_CATEGORIES)[number];
type Category = MainCategory | typeof SPECIAL_CATEGORY;

function mapJobToCategory(job?: string | null): MainCategory {
  const v = String(job ?? "").trim();
  if (v === "광고업체") return "광고";
  if (MAIN_CATEGORIES.includes(v as MainCategory)) return v as MainCategory;
  return "광고";
}

function orderPosts(items: Post[]): Post[] {
  const toTime = (v: unknown) => {
    const t = Date.parse(String(v ?? ""));
    return Number.isFinite(t) ? t : 0;
  };
  const byNewest = (a: Post, b: Post) => {
    const diff = toTime(b.created_at) - toTime(a.created_at);
    return diff !== 0 ? diff : (b.id ?? 0) - (a.id ?? 0);
  };
  const type1 = items.filter((p) => p.card_type === 1).sort(byNewest);
  const type2 = items.filter((p) => p.card_type === 2).sort(byNewest);
  const type3 = items.filter((p) => p.card_type === 3).sort(byNewest);
  return [...type1, ...type2, ...type3];
}

function AdCardTitleOnly({ item }: { item: Post }) {
  const companyName = item.company_agency?.trim();

  return (
    <Link
      href={`/${item.id}`}
      className="block h-full rounded-xl border border-black bg-white px-2.5 py-3"
    >
      {companyName && (
        <p className="truncate text-[12px] font-semibold" style={{ color: PRIMARY }}>
          {companyName}
        </p>
      )}
      <p
        className={`line-clamp-2 text-[14px] font-bold leading-snug text-[#222] ${
          companyName ? "mt-1" : ""
        }`}
      >
        {item.title}
      </p>
    </Link>
  );
}

function AdCardSlim({ item }: { item: Post }) {
  const imageUri = resolveMediaUrl(item.image_url);
  const companyName = item.company_agency?.trim();

  return (
    <Link
      href={`/${item.id}`}
      className="block h-full overflow-hidden rounded-[14px] border border-black bg-white"
    >
      {imageUri ? (
        <Image
          src={imageUri}
          alt=""
          width={400}
          height={300}
          className="block aspect-[4/3] w-full bg-[#DDD] object-cover"
          unoptimized
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-[#DDD]" />
      )}
      <div className="flex flex-col justify-center px-2.5 py-2.5">
        {companyName && (
          <p className="truncate text-[12px] font-semibold" style={{ color: PRIMARY }}>
            {companyName}
          </p>
        )}
        <p
          className={`line-clamp-2 text-[14px] font-bold leading-snug text-[#222] ${
            companyName ? "mt-1" : ""
          }`}
        >
          {item.title}
        </p>
      </div>
    </Link>
  );
}

function CategoryTabs({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="sticky top-14 z-40 border-b border-[#E1E4EA] bg-white lg:top-0 relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
      <div className="flex items-center">
        {MAIN_CATEGORIES.map((c) => {
          const isActive = c === active;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`flex flex-1 items-center justify-center py-2.5 ${
                isActive ? "border-b-[3px] border-[#0099FF]" : "border-b-[3px] border-transparent"
              }`}
            >
              <span
                className={`text-[15px] ${isActive ? "font-black text-[#0099FF]" : "text-[#666]"}`}
              >
                {c}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(SPECIAL_CATEGORY)}
          className="flex flex-1 items-center justify-center py-2.5"
        >
          <span className="text-base font-bold text-[#FF8A3D]">글 작성</span>
        </button>
      </div>
    </div>
  );
}

export default function List4PageClient() {
  const router = useRouter();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const activeCategory = MAIN_CATEGORIES[categoryIndex];
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);
  const loadMoreElRef = useRef<HTMLDivElement | null>(null);

  const orderedItemsByCategory = useMemo(() => {
    const out = {} as Record<MainCategory, Post[]>;
    MAIN_CATEGORIES.forEach((c) => {
      const filtered = items.filter((p) => mapJobToCategory(p.job_industry) === c);
      out[c] = orderPosts(filtered);
    });
    return out;
  }, [items]);

  const activeItems = orderedItemsByCategory[activeCategory] ?? [];

  const fetchItems = useCallback(async (reset: boolean) => {
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }

    try {
      const currentCursor = reset ? undefined : cursor;
      const res = await Posts.listByType(4, {
        status: "published",
        limit: 100,
        cursor: currentCursor,
      });
      const nextItems = res.items ?? [];

      if (reset) {
        setItems(nextItems);
        setCursor(res.next_cursor || undefined);
        setHasMore(Boolean(res.next_cursor));
      } else {
        setItems((prev) => {
          const byId = new Map<number, Post>();
          [...prev, ...nextItems].forEach((p) => byId.set(p.id, p));
          return Array.from(byId.values());
        });
        const nextCursor = res.next_cursor || undefined;
        if (!nextCursor || nextItems.length === 0 || nextCursor === currentCursor) {
          setCursor(undefined);
          setHasMore(false);
        } else {
          setCursor(nextCursor);
          setHasMore(true);
        }
      }
    } catch (e: unknown) {
      if (reset) {
        setError(getApiErrorMessage(e, "광고 목록을 불러오지 못했습니다."));
      }
    } finally {
      if (reset) setLoading(false);
      else {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [cursor]);

  const reload = useCallback(async () => {
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setCursor(undefined);
    setHasMore(true);
    setLoading(true);
    setError(null);
    try {
      const res = await Posts.listByType(4, {
        status: "published",
        limit: 100,
      });
      setItems(res.items ?? []);
      setCursor(res.next_cursor || undefined);
      setHasMore(Boolean(res.next_cursor));
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "광고 목록을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryIndex]);

  useEffect(() => {
    const el = loadMoreElRef.current;
    if (!el || !hasMore || !cursor || loading || loadingMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchItems(false);
      },
      { rootMargin: "220px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, cursor, loading, loadingMore, error, fetchItems]);

  const handleChangeCategory = useCallback(
    (c: Category) => {
      if (c === SPECIAL_CATEGORY) {
        const session = getSession();
        if (!session.isLogin || !session.username) {
          alert("로그인이 필요합니다.");
          return;
        }
        router.push(`/write4?job_industry=${encodeURIComponent(activeCategory)}`);
        return;
      }
      const idx = MAIN_CATEGORIES.indexOf(c as MainCategory);
      if (idx >= 0) setCategoryIndex(idx);
    },
    [activeCategory, router],
  );

  return (
    <div className="-mx-3 -mt-4 flex flex-col bg-[#f5f5f5] lg:mx-0 lg:mt-0">
      <CategoryTabs active={activeCategory} onChange={handleChangeCategory} />

      <div className="px-2 pb-6 pt-2">
        {loading && items.length === 0 && (
          <p className="py-12 text-center text-gray-500">불러오는 중...</p>
        )}
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!loading && !error && activeItems.length === 0 && (
          <p className="py-12 text-center text-gray-500">광고가 없습니다.</p>
        )}

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {activeItems.map((item) =>
            item.card_type === 3 ? (
              <AdCardTitleOnly key={item.id} item={item} />
            ) : (
              <AdCardSlim key={item.id} item={item} />
            ),
          )}
        </div>

        {loadingMore && (
          <p className="py-4 text-center text-sm text-gray-500">더 불러오는 중...</p>
        )}
        {hasMore && cursor && !loading && !error && (
          <div ref={loadMoreElRef} className="h-4" aria-hidden />
        )}
      </div>
    </div>
  );
}
