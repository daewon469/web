"use client";

import PostCard from "@/components/PostCard";
import { Auth, Posts, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { parseAreaCodesToPostListParams, uniq } from "@/lib/regionUtils";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AreaLikePage() {
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
      const codes = uniq(
        (res.user?.area_region_codes ?? []).map((s) => String(s ?? "").trim()).filter(Boolean),
      );
      const ok = codes.length > 0;
      setHasConfig(ok);
      if (!ok) {
        setItems([]);
        return;
      }
      const { province, city, regions } = parseAreaCodesToPostListParams(codes);
      const { items: fetched } = await Posts.list({
        username: session.username,
        limit: 50,
        status: "published",
        province,
        city,
        regions,
      });
      setItems(fetched);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "지역저장을 불러오지 못했습니다."));
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
          ※ &apos;지 역 저 장&apos; 을 보고 계십니다.
        </p>
        <Link
          href="/areasite"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[15px] font-extrabold text-white"
        >
          지역설정 하기
        </Link>
      </div>

      {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && !hasConfig && (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">지역저장 설정이 없습니다.</p>
          <Link href="/areasite" className="mt-3 inline-block text-[#4A6CF7] underline">
            지역 설정하러 가기
          </Link>
        </div>
      )}

      {!loading && hasConfig && items.length === 0 && !error && (
        <p className="py-12 text-center text-gray-500">해당 지역의 구인글이 없습니다.</p>
      )}

      {!loading && items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
