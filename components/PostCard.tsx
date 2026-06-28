"use client";

import Heart from "@/components/Heart";
import Image from "next/image";
import Link from "next/link";
import { resolveMediaUrl, type Post } from "@/lib/api";
import { LIST_CARD_HEIGHT_TYPE1, TYPE1_IMAGE_PX, TYPE1_TITLE_HEIGHT_PX } from "@/lib/listCardLayout";

function simpleProvince(p?: string) {
  if (!p) return "";
  const map: Record<string, string> = {
    충청북도: "충북",
    충청남도: "충남",
    경상북도: "경북",
    경상남도: "경남",
    전라북도: "전북",
    전라남도: "전남",
    강원도: "강원",
  };
  if (map[p]) return map[p];
  return p.replace(/(특별시|광역시|자치시|자치도|특별자치도|도|특별자치시)$/g, "");
}

function formatProvinceCity(province: string, city: string) {
  const prov = simpleProvince(province?.trim() ?? "");
  const rawCity = city == null ? "" : String(city).trim();
  const c = rawCity.toLowerCase() === "null" ? "" : rawCity;
  const cityOk = !!c && c !== "전체";
  return [prov, cityOk ? c : ""].filter(Boolean).join(" ");
}

function Type1ListImage({ src }: { src: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded bg-neutral-200"
      style={{ width: TYPE1_IMAGE_PX, height: TYPE1_IMAGE_PX }}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        unoptimized
        sizes={`${TYPE1_IMAGE_PX}px`}
      />
    </div>
  );
}

function formatRoles(post: Post) {
  const roles = [
    post.total_use ? "총괄" : null,
    post.branch_use ? "본부장" : null,
    post.hq_use ? "본부" : null,
    post.leader_use ? "팀장" : null,
    post.member_use ? "팀원" : null,
    post.team_use ? "팀" : null,
    post.each_use ? "각개" : null,
    post.other_role_name ? String(post.other_role_name) : null,
  ].filter(Boolean);

  const fees = [
    post.total_use ? post.total_fee : null,
    post.branch_use ? post.branch_fee : null,
    post.hq_use ? post.hq_fee : null,
    post.leader_use ? post.leader_fee : null,
    post.member_use ? post.member_fee : null,
    post.team_use ? post.team_fee : null,
    post.each_use ? post.each_fee : null,
    post.other_role_name ? post.other_role_fee : null,
  ].filter((f) => f?.trim());

  const roleText = roles.join("/") || "미정";
  const feeText = fees.length ? "/" + fees.join("/") : "";
  return roleText + feeText;
}

/** customlike·areasite 목록과 동일한 1유형 행 레이아웃 */
function Type1ListRow({
  post,
  imageUri,
  industryProvinceCity,
  showHeart,
  onLikedChange,
}: {
  post: Post;
  imageUri: string | null;
  industryProvinceCity: string;
  showHeart: boolean;
  onLikedChange?: (liked: boolean) => void;
}) {
  return (
    <>
      {showHeart && (
        <Heart
          postId={post.id}
          postLiked={post.liked}
          onChange={onLikedChange}
          className="absolute right-2 top-12 z-10"
        />
      )}
      <div className="flex items-center gap-2 p-2">
        {imageUri && <Type1ListImage src={imageUri} />}
        <div className="min-w-0 flex-1 pr-6">
          <h2
            className="line-clamp-2 text-lg font-bold leading-snug text-black"
            style={{ minHeight: TYPE1_TITLE_HEIGHT_PX }}
          >
            {post.title}
          </h2>
          <p className="mt-1 truncate text-[15px] font-bold text-[#003366]">
            {industryProvinceCity}
          </p>
          <p className="truncate text-[15px] font-bold text-[#8B0000]">{formatRoles(post)}</p>
        </div>
      </div>
      {post.highlight_content && (
        <p
          className="truncate px-2 pb-2 text-sm font-bold"
          style={{ color: post.highlight_color ?? "#333" }}
        >
          {post.highlight_content}
        </p>
      )}
    </>
  );
}

export default function PostCard({
  post,
  showHeart = true,
  compact = false,
  grid = false,
  onLikedChange,
}: {
  post: Post;
  showHeart?: boolean;
  compact?: boolean;
  grid?: boolean;
  onLikedChange?: (postId: number, liked: boolean) => void;
}) {
  const imageUri = resolveMediaUrl(post.image_url);
  const industryProvinceCity = `${post.job_industry ?? ""}/${formatProvinceCity(post.province, post.city)}`;
  const handleLikedChange = (liked: boolean) => onLikedChange?.(post.id, liked);

  if (grid) {
    return (
      <Link
        href={`/${post.id}`}
        className="relative block h-full rounded-lg border border-black bg-white shadow-md transition-shadow hover:shadow-lg"
      >
        <Type1ListRow
          post={post}
          imageUri={imageUri}
          industryProvinceCity={industryProvinceCity}
          showHeart={showHeart}
          onLikedChange={handleLikedChange}
        />
      </Link>
    );
  }

  if (compact) {
    return (
      <Link
        href={`/${post.id}`}
        style={{ height: LIST_CARD_HEIGHT_TYPE1 }}
        className="relative flex flex-col overflow-hidden rounded-lg border border-black bg-white shadow-md transition-shadow hover:shadow-lg"
      >
        {showHeart && (
          <Heart
            postId={post.id}
            postLiked={post.liked}
            onChange={handleLikedChange}
            size={18}
            className="absolute right-1 top-1 z-10"
          />
        )}
        {imageUri ? (
          <Image
            src={imageUri}
            alt=""
            width={200}
            height={150}
            className="h-[58%] w-full shrink-0 object-cover"
            unoptimized
          />
        ) : (
          <div className="h-[58%] w-full shrink-0 bg-neutral-200" />
        )}
        <div className="flex min-h-0 flex-1 flex-col p-1.5">
          <h2 className="line-clamp-2 text-sm font-bold leading-snug text-black">{post.title}</h2>
          <p className="mt-1 truncate text-xs font-bold text-[#003366]">{industryProvinceCity}</p>
          <p className="truncate text-xs font-bold text-[#8B0000]">{formatRoles(post)}</p>
          {post.highlight_content && (
            <p
              className="mt-auto truncate pt-1 text-[11px] font-bold"
              style={{ color: post.highlight_color ?? "#333" }}
            >
              {post.highlight_content}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${post.id}`}
      className="relative block rounded-lg border border-black bg-white shadow-md transition-shadow hover:shadow-lg"
    >
      <Type1ListRow
        post={post}
        imageUri={imageUri}
        industryProvinceCity={industryProvinceCity}
        showHeart={showHeart}
        onLikedChange={handleLikedChange}
      />
    </Link>
  );
}
