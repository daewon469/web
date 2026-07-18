"use client";

import Heart from "@/components/Heart";
import { resolveMediaUrl, type Post } from "@/lib/api";
import { formatProvinceCity, formatRoles } from "@/lib/postCardFormat";
import { LIST_CARD_HEIGHT_TYPE_S } from "@/lib/listCardLayout";
import Link from "next/link";

type Props = {
  post: Post;
  showHeart?: boolean;
  onLikedChange?: (postId: number, liked: boolean) => void;
};

/** 밝은 메쉬 위 현장 한마디 — 미지정 시 검정 */
function resolveSlideHighlightColor(color?: string | null) {
  const raw = String(color ?? "").trim();
  if (!raw) return "#111";
  return raw;
}

export default function PostcardS({ post, showHeart = true, onLikedChange }: Props) {
  const imageUri = resolveMediaUrl(post.image_url);
  const industryProvinceCity = `${post.job_industry ?? ""}/${formatProvinceCity(post.province, post.city)}`;

  return (
    <div className="relative w-full" style={{ height: LIST_CARD_HEIGHT_TYPE_S }}>
      <Link
        href={`/${post.id}`}
        className="absolute inset-0 overflow-hidden rounded-xl border border-black bg-black"
      >
      {imageUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUri} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] bg-white px-2 py-1.5"
        aria-hidden
      >
        <div className="flex flex-col gap-0 border-b border-black pb-1">
          <p className="line-clamp-2 text-base font-bold leading-tight text-black">{post.title}</p>
          {post.highlight_content ? (
            <p
              className="line-clamp-1 text-[15px] font-bold leading-tight"
              style={{ color: resolveSlideHighlightColor(post.highlight_color) }}
            >
              {post.highlight_content}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-white px-2 py-1.5"
        aria-hidden
      >
        <div className="flex flex-col gap-0 border-t border-black pt-1">
          <p className="truncate text-[15px] font-bold leading-tight text-[#0B57D0]">
            {industryProvinceCity}
          </p>
          <p className="truncate text-[15px] font-bold leading-tight text-[#C62828]">
            {formatRoles(post)}
          </p>
        </div>
      </div>
      </Link>
      {showHeart && (
        <Heart
          postId={post.id}
          postLiked={post.liked}
          size={22}
          onChange={(liked) => onLikedChange?.(post.id, liked)}
          className="pointer-events-auto absolute right-2 top-2 z-20"
        />
      )}
    </div>
  );
}
