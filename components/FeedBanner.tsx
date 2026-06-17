"use client";

import { resolveMediaUrl, type UIConfigBannerItem } from "@/lib/api";
import { isBannerReferralTarget } from "@/lib/ui_banner_actions";
import Image from "next/image";

type BannerProps = {
  item: UIConfigBannerItem;
  onReferralClick?: () => void;
};

function BannerImage({ item }: { item: UIConfigBannerItem }) {
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      width={800}
      height={item.height ?? 110}
      className="w-full object-contain"
      style={{ height: item.height ?? 110 }}
      unoptimized
    />
  );
}

export function TopBannerStrip({
  items,
  onReferralClick,
}: {
  items: UIConfigBannerItem[];
  onReferralClick?: () => void;
}) {
  const item = items.find((it) => String(it.image_url ?? "").trim());
  if (!item || !resolveMediaUrl(item.image_url)) return null;

  const inner = <BannerImage item={{ ...item, height: item.height ?? 70 }} />;

  if (isBannerReferralTarget(item)) {
    return (
      <button
        type="button"
        onClick={onReferralClick}
        className="block w-full overflow-hidden rounded-xl"
      >
        {inner}
      </button>
    );
  }

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

export function FeedBannerCard({ item, onReferralClick }: BannerProps) {
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;

  const inner = (
    <Image
      src={src}
      alt=""
      width={600}
      height={item.height ?? 110}
      className="w-full rounded-xl bg-gray-100 object-contain"
      style={{ height: item.height ?? 110 }}
      unoptimized
    />
  );

  if (isBannerReferralTarget(item)) {
    return (
      <button type="button" onClick={onReferralClick} className="block w-full">
        {inner}
      </button>
    );
  }

  const link = String(item.link_url ?? "").trim();
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}
