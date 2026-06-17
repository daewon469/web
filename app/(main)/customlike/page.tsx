"use client";

import PostCard from "@/components/PostCard";
import { Auth, Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CustomLikePage() {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasConfig, setHasConfig] = useState(false);

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
        setItems([]);
        return;
      }
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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded bg-[#2F6BFF] py-1.5 pl-4 pr-28">
        <p className="truncate text-[15px] font-extrabold text-white">
          ※ &apos;맞 춤 저 장&apos; 을 보고 계십니다.
        </p>
        <Link
          href="/customsite"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[15px] font-extrabold text-white"
        >
          맞춤설정 하기
        </Link>
      </div>

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

      {!loading && hasConfig && items.length === 0 && !error && (
        <p className="py-12 text-center text-gray-500">맞춤 조건에 맞는 구인글이 없습니다.</p>
      )}

      {!loading && items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
