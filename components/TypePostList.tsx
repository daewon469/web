"use client";

import { Auth, Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatDate(iso?: string) {
  if (!iso) return "";
  const s = String(iso);
  const candidate = s.includes("T") ? s.replace("T", " ") : s;
  return candidate.length >= 16 ? candidate.slice(0, 16) : candidate.slice(0, 10);
}

export default function TypePostList({
  postType,
  title,
  linkMode = "detail",
  writeHref,
  writeLabel = "글 작성",
  adminWriteHref,
  pageSize = 15,
}: {
  postType: number;
  title: string;
  linkMode?: "detail" | "external";
  writeHref?: string;
  writeLabel?: string;
  adminWriteHref?: string;
  pageSize?: number;
}) {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsLoggedIn(session.isLogin);
    if (!session.isLogin || !session.username || !adminWriteHref) {
      setIsAdmin(false);
      return;
    }
    Auth.getMyPageSummary(session.username).then((res) => {
      setIsAdmin(res.status === 0 && !!res.admin_acknowledged);
    });
  }, [adminWriteHref]);

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
        setCurrentPage(1);
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "목록을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    })();
  }, [postType]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const showWrite =
    (writeHref && isLoggedIn) || (adminWriteHref && isLoggedIn && isAdmin);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-[#0B1B3A]">{title}</h1>
        {showWrite && (
          <Link
            href={adminWriteHref && isAdmin ? adminWriteHref : writeHref!}
            className="shrink-0 rounded-full bg-[#4A6CF7] px-3 py-1.5 text-sm font-semibold text-white"
          >
            {writeLabel}
          </Link>
        )}
      </div>

      {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && items.length === 0 && !error && (
        <p className="py-12 text-center text-gray-500">등록된 글이 없습니다.</p>
      )}

      <div className="divide-y divide-[#ddd] overflow-hidden rounded-xl border border-black bg-white">
        {paginatedItems.map((post) => {
          const inner = (
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
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

      {!loading && totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`rounded-md border border-black px-3 py-1.5 text-sm font-semibold ${
                currentPage === page ? "bg-[#4A6CF7] text-white" : "bg-white"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
