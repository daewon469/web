"use client";

import Heart from "@/components/Heart";
import { resolveMediaUrl, type Post } from "@/lib/api";
import { formatProvinceCity, formatRoles } from "@/lib/postCardFormat";
import { LIST_CARD_HEIGHT_TYPE_S } from "@/lib/listCardLayout";
import Link from "next/link";

type Props = {
  post: Post;
  showHeart?: boolean;
};

/** 슬라이드 카드(어두운 배경)용 현장 한마디 색 — 검은색이면 흰색 */
function resolveSlideHighlightColor(color?: string | null) {
  const raw = String(color ?? "").trim();
  if (!raw) return "#fff";
  const lower = raw.toLowerCase();
  if (lower === "black" || lower === "#000" || lower === "#000000" || lower === "#111111") {
    return "#fff";
  }
  return raw;
}

export default function PostcardS({ post, showHeart = true }: Props) {
  const imageUri = resolveMediaUrl(post.image_url);
  const industryProvinceCity = `${post.job_industry ?? ""}/${formatProvinceCity(post.province, post.city)}`;

  return (
    <Link
      href={`/${post.id}`}
      className="relative block w-full overflow-hidden rounded-xl border border-black bg-black shadow-md transition-shadow hover:shadow-lg"
      style={{ height: LIST_CARD_HEIGHT_TYPE_S }}
    >
      {showHeart && (
        <Heart
          postId={post.id}
          postLiked={post.liked}
          className="absolute right-2 top-2 z-10"
        />
      )}

      {imageUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUri} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] bg-gradient-to-b from-black/90 via-black/55 to-transparent px-2 pb-4 pt-1.5"
        aria-hidden
      >
        <p className="line-clamp-2 text-base font-bold leading-snug text-white">{post.title}</p>
        {post.highlight_content ? (
          <p
            className="mt-0.5 line-clamp-1 text-[15px] font-bold leading-snug"
            style={{ color: resolveSlideHighlightColor(post.highlight_color) }}
          >
            {post.highlight_content}
          </p>
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/92 via-black/60 to-transparent px-2 pb-1.5 pt-4"
        aria-hidden
      >
        <p className="truncate text-[15px] font-bold text-[#7eb8ff]">{industryProvinceCity}</p>
        <p className="mt-0.5 truncate text-[15px] font-bold text-[#ffb4b4]">{formatRoles(post)}</p>
      </div>
    </Link>
  );
}
