"use client";

import { Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function TypePostListPage({
  postType,
  title,
  linkMode = "detail",
}: {
  postType: number;
  title: string;
  linkMode?: "detail" | "external";
}) {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { username } = getSession();
        const res = await Posts.listByType(postType, {
          status: "published",
          limit: 100,
          username: username ?? undefined,
        });
        setItems(res.items);
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "목록을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    })();
  }, [postType]);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold text-[#0B1B3A]">{title}</h1>
      {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && items.length === 0 && !error && (
        <p className="py-12 text-center text-gray-500">등록된 글이 없습니다.</p>
      )}
      <div className="overflow-hidden rounded-xl border border-black bg-white">
        {items.map((post) => {
          const inner = (
            <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 last:border-b-0 hover:bg-gray-50">
              <span className="h-1 w-1 shrink-0 rounded-full bg-black" />
              <span className="min-w-0 flex-1 truncate text-[15px]">{post.title}</span>
              <span className="shrink-0 text-[11px] text-gray-500">{formatDate(post.created_at)}</span>
            </div>
          );

          if (linkMode === "external" && post.agent) {
            return (
              <a
                key={post.id}
                href={post.agent}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={post.id} href={`/${post.id}`} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
