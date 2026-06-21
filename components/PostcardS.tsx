"use client";

import Heart from "@/components/Heart";
import { resolveMediaUrl, type Post } from "@/lib/api";
import { formatProvinceCity, formatRoles } from "@/lib/postCardFormat";
import Link from "next/link";

type Props = {
  post: Post;
  showHeart?: boolean;
};

export default function PostcardS({ post, showHeart = true }: Props) {
  const imageUri = resolveMediaUrl(post.image_url);
  const industryProvinceCity = `${post.job_industry ?? ""}/${formatProvinceCity(post.province, post.city)}`;

  return (
    <Link
      href={`/${post.id}`}
      className="relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-black bg-black shadow-md"
    >
      {imageUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUri} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] bg-gradient-to-b from-black/90 via-black/55 to-transparent px-3 pb-10 pt-3"
        aria-hidden
      >
        <p className="line-clamp-2 text-lg font-bold leading-snug text-white">{post.title}</p>
        <p className="mt-1 truncate text-[15px] font-bold text-[#7eb8ff]">{industryProvinceCity}</p>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/92 via-black/60 to-transparent px-3 pb-3 pt-12"
        aria-hidden
      >
        <p className="truncate text-[15px] font-bold text-[#ffb4b4]">{formatRoles(post)}</p>
        {post.highlight_content ? (
          <p
            className="mt-1 truncate text-sm font-bold"
            style={{ color: post.highlight_color ?? "#fff" }}
          >
            {post.highlight_content}
          </p>
        ) : null}
      </div>

      {showHeart && (
        <Heart
          postId={post.id}
          postLiked={post.liked}
          className="absolute right-2 top-14 z-10"
        />
      )}
    </Link>
  );
}
