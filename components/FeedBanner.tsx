"use client";

import { resolveMediaUrl, type UIConfigBannerItem } from "@/lib/api";
import { isBannerReferralTarget } from "@/lib/ui_banner_actions";
import type { ReactNode } from "react";

type BannerProps = {
  item: UIConfigBannerItem;
  onReferralClick?: () => void;
  defaultResizeMode?: "contain" | "cover" | "stretch";
  shellClassName?: string;
};

function resolveResizeMode(
  item: UIConfigBannerItem,
  defaultResizeMode: "contain" | "cover" | "stretch" = "contain",
) {
  const rm = String(item.resize_mode ?? defaultResizeMode);
  return rm === "cover" || rm === "stretch" ? rm : "contain";
}

function objectFitClass(mode: "contain" | "cover" | "stretch") {
  if (mode === "cover") return "object-cover";
  if (mode === "stretch") return "object-fill";
  return "object-contain";
}

const TOP_BANNER_MAX_HEIGHT = 130;
const FEED_BANNER_MAX_HEIGHT =130;

function ResponsiveBannerImage({
  src,
  resizeMode = "contain",
  maxHeight,
  className = "",
}: {
  src: string;
  resizeMode?: "contain" | "cover" | "stretch";
  maxHeight: number;
  className?: string;
}) {
  const fitClass = objectFitClass(resizeMode);
  const fillBox = resizeMode === "cover" || resizeMode === "stretch";

  return (
    <div
      className={`flex w-full items-center justify-center overflow-hidden bg-[#f2f2f2] ${className}`}
      style={{ height: maxHeight }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={
          fillBox
            ? `h-full w-full ${fitClass}`
            : `max-h-full max-w-full ${fitClass}`
        }
      />
    </div>
  );
}

function BannerShell({
  children,
  className,
  onClick,
  href,
}: {
  children: ReactNode;
  className: string;
  onClick?: () => void;
  href?: string;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

function TopBannerItem({
  item,
  onReferralClick,
  defaultResizeMode = "contain",
}: BannerProps) {
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;

  const resizeMode = resolveResizeMode(item, defaultResizeMode);
  const shellClass =
    "mx-auto mb-1.5 block w-full overflow-hidden border border-black bg-[#FFF6D2] shadow-md";
  const inner = (
    <ResponsiveBannerImage src={src} resizeMode={resizeMode} maxHeight={TOP_BANNER_MAX_HEIGHT} />
  );

  if (isBannerReferralTarget(item)) {
    return (
      <BannerShell className={shellClass} onClick={onReferralClick}>
        {inner}
      </BannerShell>
    );
  }

  const link = String(item.link_url ?? "").trim();
  return <BannerShell className={shellClass} href={link || undefined}>{inner}</BannerShell>;
}

export function TopBannerStrip({
  items,
  onReferralClick,
  defaultResizeMode = "contain",
}: {
  items: UIConfigBannerItem[];
  onReferralClick?: () => void;
  defaultResizeMode?: "contain" | "cover" | "stretch";
}) {
  const slots = items
    .filter((it) => String(it.image_url ?? "").trim())
    .slice(0, 2);

  if (slots.length === 0) return null;

  return (
    <div className="w-full">
      {slots.map((item, idx) => (
        <TopBannerItem
          key={`top-banner-${idx}`}
          item={item}
          onReferralClick={onReferralClick}
          defaultResizeMode={defaultResizeMode}
        />
      ))}
    </div>
  );
}

export function FeedBannerCard({
  item,
  onReferralClick,
  defaultResizeMode = "contain",
}: BannerProps) {
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;

  const resizeMode = resolveResizeMode(item, defaultResizeMode);
  const shellClass = "block w-full overflow-hidden rounded-xl border border-black bg-white";
  const inner = (
    <ResponsiveBannerImage src={src} resizeMode={resizeMode} maxHeight={FEED_BANNER_MAX_HEIGHT} />
  );

  if (isBannerReferralTarget(item)) {
    return (
      <BannerShell className={shellClass} onClick={onReferralClick}>
        {inner}
      </BannerShell>
    );
  }

  const link = String(item.link_url ?? "").trim();
  return <BannerShell className={shellClass} href={link || undefined}>{inner}</BannerShell>;
}
