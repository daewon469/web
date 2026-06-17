"use client";

import PostCard from "@/components/PostCard";
import { Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const CATEGORIES = ["전체", "광고", "대출", "급매물", "중고장터"] as const;

function mapCategory(job?: string | null) {
  const v = String(job ?? "").trim();
  if (v === "광고업체") return "광고";
  if (CATEGORIES.includes(v as (typeof CATEGORIES)[number])) return v;
  return "광고";
}

export default function AdListPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { username } = getSession();
        const res = await Posts.listByType(4, {
          status: "published",
          limit: 100,
          username: username ?? undefined,
        });
        setItems(res.items);
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "광고 목록을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (category === "전체") return items;
    return items.filter((p) => mapCategory(p.job_industry) === category);
  }, [items, category]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#0B1B3A]">광고</h1>
        {getSession().isLogin && (
          <Link href="/write4" className="text-sm font-bold text-[#4A6CF7]">
            광고 등록
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
              category === c
                ? "border-[#4A6CF7] bg-[#4A6CF7] text-white"
                : "border-gray-300 bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && filtered.length === 0 && !error && (
        <p className="py-12 text-center text-gray-500">광고가 없습니다.</p>
      )}
      {!loading && filtered.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
