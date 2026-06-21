"use client";

import BlueStrip from "@/components/BlueStrip";
import PostCard from "@/components/PostCard";
import PostCard2 from "@/components/PostCard2";
import { Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export default function LikePage() {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { items: liked } = await Posts.listLiked({
        username: session.username,
        limit: 50,
      });
      setItems(liked.map((p) => ({ ...p, liked: true })));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "관심현장을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const orderedItems = useMemo(() => orderPostsByCardType(items), [items]);

  return (
    <div className="flex flex-col gap-1.5 bg-[#f5f5f5]">
      <div className="-mx-3 flex flex-col lg:mx-0">
        <BlueStrip mode="like" />

        <div className="flex flex-col gap-1.5 px-2.5">
          {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="py-12 text-center text-gray-500">관심 등록한 현장이 없습니다.</p>
          )}
          {!loading && orderedItems.map((post) => (
            <div key={post.id}>{renderListCard(post)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
