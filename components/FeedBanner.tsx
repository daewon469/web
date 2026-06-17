"use client";

import { resolveMediaUrl, type UIConfigBannerItem } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export function TopBannerStrip({ items }: { items: UIConfigBannerItem[] }) {
  const item = items.find((it) => String(it.image_url ?? "").trim());
  if (!item) return null;
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;

  const inner = (
    <Image
      src={src}
      alt=""
      width={800}
      height={70}
      className="w-full object-contain"
      style={{ height: item.height ?? 70 }}
      unoptimized
    />
  );

  const link = String(item.link_url ?? "").trim();
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
        {inner}
      </a>
    );
  }
  return <div className="overflow-hidden rounded-xl">{inner}</div>;
}

export function FeedBannerCard({ item }: { item: UIConfigBannerItem }) {
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;

  const inner = (
    <Image
      src={src}
      alt=""
      width={600}
      height={item.height ?? 110}
      className="w-full rounded-xl object-contain bg-gray-100"
      style={{ height: item.height ?? 110 }}
      unoptimized
    />
  );

  const link = String(item.link_url ?? "").trim();
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  if (item.click_action === "referral_modal") {
    return (
      <Link href="/myboard" className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
