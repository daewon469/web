"use client";

import Heart from "@/components/Heart";
import CommentsSection from "@/components/CommentsSection";
import PostAddressMaps from "@/components/PostAddressMaps";
import { Posts, resolveMediaUrl, type Post } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PostDetail({ id }: { id: number }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await Posts.get(id);
        if (!cancelled) setPost(data);
      } catch {
        if (!cancelled) setError("게시글을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  if (error || !post) {
    return (
      <div className="rounded-lg bg-white p-6 text-center">
        <p className="text-red-600">{error ?? "게시글을 찾을 수 없습니다."}</p>
        <Link href="/list" className="mt-4 inline-block text-[#4A6CF7] underline">
          목록으로
        </Link>
      </div>
    );
  }

  const imageUri = resolveMediaUrl(post.image_url);
  const showComments = [3, 5, 6, 7].includes(Number(post.post_type ?? 1));
  const backHref =
    post.post_type === 3
      ? "/list3"
      : post.post_type === 4
        ? "/list4"
        : post.post_type === 5
          ? "/list5"
          : post.post_type === 6
            ? "/list6"
            : post.post_type === 7
              ? "/list7"
              : post.post_type === 2
                ? "/list2"
                : "/list";

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Link href={backHref} className="text-sm text-[#4A6CF7]">
          ← 목록으로
        </Link>
        {post.post_type === 1 && <Heart postId={post.id} postLiked={post.liked} size={26} />}
      </div>
      <h1 className="text-2xl font-bold text-[#0B1B3A]">{post.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {post.author?.username} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
      </p>

      {imageUri && (
        <Image
          src={imageUri}
          alt=""
          width={600}
          height={400}
          className="mt-4 w-full rounded-lg object-cover"
          unoptimized
        />
      )}

      <div
        className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.post_type === 1 && (
        <PostAddressMaps
          workplaceAddress={post.workplace_address}
          workplaceLat={post.workplace_lat}
          workplaceLng={post.workplace_lng}
          businessAddress={post.business_address}
          businessLat={post.business_lat}
          businessLng={post.business_lng}
        />
      )}

      {showComments && <CommentsSection postId={post.id} />}
    </article>
  );
}
