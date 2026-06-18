"use client";

import { Posts, type Post } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatPostDateTime(d: unknown) {
  const dt = new Date(String(d ?? ""));
  if (Number.isNaN(dt.getTime())) return "";
  const date = dt.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  const time = dt.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

function BoardRow({
  post,
  href,
  external,
}: {
  post: Post;
  href: string;
  external?: boolean;
}) {
  const row = (
    <div className="flex h-8 items-center border-b border-[#ddd] px-2.5 last:border-b-0">
      <span className="mr-2 h-1 w-1 shrink-0 rounded-full bg-black" aria-hidden />
      <span className="flex-1 truncate text-[15px] text-black">{post.title}</span>
      <span className="ml-2 shrink-0 text-[11px] text-[#666]">
        {formatPostDateTime((post as Post & { created_at?: string }).created_at)}
      </span>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50">
        {row}
      </a>
    );
  }

  return (
    <Link href={href} className="block hover:bg-gray-50">
      {row}
    </Link>
  );
}

export default function ListBoardPage() {
  const [news, setNews] = useState<Post[]>([]);
  const [community, setCommunity] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [newsRes, comRes] = await Promise.all([
          Posts.listByType(2, { status: "published", limit: 30 }),
          Posts.listByType(3, { status: "published", limit: 50 }),
        ]);
        setNews(newsRes.items.slice(0, 7));
        setCommunity(comRes.items.slice(0, 8));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="py-3">
      {loading && <p className="py-8 text-center text-sm text-gray-500">불러오는 중...</p>}

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h1 className="text-[23px] font-bold text-black">분양 뉴스</h1>
          <Link href="/list2" className="flex items-center text-base font-medium text-[#4A6CF7]">
            더보기
            <span aria-hidden className="ml-0.5">
              ›
            </span>
          </Link>
        </div>

        {news.length === 0 && !loading ? (
          <p className="text-[13px] text-[#666]">아직 등록된 분양 뉴스가 없습니다.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black bg-white">
            {news.map((post) => (
              <BoardRow
                key={post.id}
                post={post}
                href={post.agent?.trim() || `/${post.id}`}
                external={Boolean(post.agent?.trim())}
              />
            ))}
          </div>
        )}
      </section>

      <hr className="my-2 border-[#ddd]" />

      <section className="mt-3">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[23px] font-bold text-black">
            분<span className="text-base">양인</span> 수
            <span className="text-base">다</span>
          </h2>
          <Link href="/list3" className="flex items-center text-base font-medium text-[#4A6CF7]">
            더보기
            <span aria-hidden className="ml-0.5">
              ›
            </span>
          </Link>
        </div>

        {community.length === 0 && !loading ? (
          <p className="text-[13px] text-[#666]">아직 등록된 커뮤니티 글이 없습니다.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black bg-white">
            {community.map((post) => (
              <BoardRow key={post.id} post={post} href={`/${post.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
