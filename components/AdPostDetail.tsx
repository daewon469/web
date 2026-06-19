"use client";

import AddressMapSection from "@/components/AddressMapSection";
import { resolveMediaUrl, type Post } from "@/lib/api";
import Image from "next/image";

const sectionClass = "rounded-lg border border-black bg-[#f9f9f9] p-4";

function formatPhone(num?: string | null) {
  if (!num) return "-";
  const digits = num.replace(/[^0-9]/g, "");
  if (/^1(?:5|6|8)\d{2}\d{4}$/.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.startsWith("02")) {
    if (digits.length === 9) return digits.replace(/^(02)(\d{3})(\d{4})$/, "$1-$2-$3");
    if (digits.length === 10) return digits.replace(/^(02)(\d{4})(\d{4})$/, "$1-$2-$3");
    return digits;
  }
  if (digits.startsWith("01")) {
    if (digits.length === 10) return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
    if (digits.length === 11) return digits.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
    return digits;
  }
  if (digits.startsWith("0")) {
    if (digits.length === 10) return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
    if (digits.length === 11) return digits.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
    return digits;
  }
  return digits;
}

export default function AdPostDetail({ post }: { post: Post }) {
  const imageUri = resolveMediaUrl(post.image_url);
  const highlightColor =
    post.highlight_color === "white" || post.highlight_color === "black"
      ? "#000"
      : post.highlight_color || "#000";

  return (
    <article className="flex flex-col gap-1 bg-white">
      <div className="overflow-hidden rounded-lg border border-black">
        <div className="flex items-center justify-between bg-[#f9f9f9] p-4">
          <span className="font-semibold">{post.author?.username}</span>
          <span className="text-sm text-gray-600">
            {new Date(post.created_at).toLocaleString("ko-KR")}
          </span>
        </div>

        {imageUri && (
          <div className="border-t border-black">
            <Image
              src={imageUri}
              alt=""
              width={800}
              height={500}
              className="block w-full object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="border-t border-black bg-[#f9f9f9] p-4">
          <h1 className="text-2xl font-bold text-[#0B1B3A]">{post.title}</h1>
        </div>
      </div>

      {post.highlight_content && (
        <div className={sectionClass}>
          <p className="text-base font-bold" style={{ color: highlightColor }}>
            {post.highlight_content}
          </p>
        </div>
      )}

      {(post.agent || post.agency_call) && (
        <div className={sectionClass}>
          <p className="text-base">
            {post.agent ?? "연락처"} :{" "}
            <span className="font-semibold">{formatPhone(post.agency_call)}</span>
          </p>
        </div>
      )}

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-bold text-[#0B1B3A]">상세 내용</h2>
        <div
          className="whitespace-pre-wrap text-base leading-8 text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <AddressMapSection
        title="사업지 주소"
        placeholder="사업지 주소"
        address={post.business_address}
        lat={post.business_lat}
        lng={post.business_lng}
        pickerKind="business"
      />
    </article>
  );
}
