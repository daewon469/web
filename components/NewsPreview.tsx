"use client";

import { Posts, type Post } from "@/lib/api";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
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

export default function NewsPreview() {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { items: list } = await Posts.listByType(2, { status: "published" });
        setItems(list.slice(0, 3));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading && items.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-500">불러오는 중...</p>;
  }

  if (items.length === 0) return null;

  const handleClick = () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.push("/login");
      return;
    }
    router.push("/listboard");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-xl border border-black bg-white text-left shadow-sm"
    >
      <div className="px-4">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-base font-semibold text-black">분양 뉴스</span>
          <span className="flex items-center text-xs font-normal text-[#4A6CF7]">
            더보기
            <span aria-hidden className="ml-0.5">
              ›
            </span>
          </span>
        </div>

        {items.map((post) => (
          <div
            key={post.id}
            className="flex h-[27px] items-center border-t border-black/50"
          >
            <span className="flex-1 truncate text-[15px] text-black">• {post.title}</span>
            <span className="ml-2 shrink-0 text-xs text-[#666]">
              {formatPostDateTime((post as Post & { created_at?: string }).created_at)}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}
