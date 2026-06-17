"use client";

import AdPostDetail from "@/components/AdPostDetail";
import CommentsSection from "@/components/CommentsSection";
import Heart from "@/components/Heart";
import JobPostDetail from "@/components/JobPostDetail";
import { Posts, resolveMediaUrl, type Post } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function backHrefFor(post: Post) {
  switch (post.post_type) {
    case 3:
      return "/list3";
    case 4:
      return "/list4";
    case 5:
      return "/list5";
    case 6:
      return "/list6";
    case 7:
      return "/list7";
    case 2:
      return "/list2";
    default:
      return "/list";
  }
}

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

  const backHref = backHrefFor(post);
  const showComments = [3, 5, 6, 7].includes(Number(post.post_type ?? 1));

  if (post.post_type === 1) {
    return (
      <div className="flex flex-col gap-4">
        <JobPostDetail post={post} />
        {showComments && <CommentsSection postId={post.id} />}
      </div>
    );
  }

  if (post.post_type === 4) {
    return (
      <div className="flex flex-col gap-4">
        <AdPostDetail post={post} backHref={backHref} />
      </div>
    );
  }

  const imageUri = resolveMediaUrl(post.image_url);

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Link href={backHref} className="text-sm text-[#4A6CF7]">
          ← 목록으로
        </Link>
        <Heart postId={post.id} postLiked={post.liked} size={26} />
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

      {showComments && <CommentsSection postId={post.id} />}
    </article>
  );
}
