"use client";

import { resolveMediaUrl, type UIConfigBannerItem } from "@/lib/api";
import { LIST_BANNER_HEIGHT_PX } from "@/lib/listCardLayout";
import { isBannerReferralTarget } from "@/lib/ui_banner_actions";
import { chunkBannerRows, type WebBannerRotation } from "@/lib/webBannerUtils";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

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

const TOP_BANNER_MAX_HEIGHT = 160;

const FEED_BANNER_MAX_HEIGHT = 160;

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

const INLINE_BANNER_WIDTH =
  "w-[min(100%,200px)] sm:w-[min(100%,240px)] shrink-0";

const SIDEBAR_BANNER_WIDTH = "w-full";

function TopBannerItem({
  item,
  onReferralClick,
  defaultResizeMode = "contain",
  shellClassName,
  maxHeight = TOP_BANNER_MAX_HEIGHT,
}: BannerProps & { maxHeight?: number }) {
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;

  const resizeMode = resolveResizeMode(item, defaultResizeMode);
  const shellClass =
    shellClassName ??
    `block overflow-hidden border border-black bg-[#FFF6D2] shadow-md ${INLINE_BANNER_WIDTH}`;
  const inner = (
    <ResponsiveBannerImage src={src} resizeMode={resizeMode} maxHeight={maxHeight} />
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

export function WebBannerThreeColRow({
  items,
  onReferralClick,
  defaultResizeMode = "contain",
  maxHeight = TOP_BANNER_MAX_HEIGHT,
  shellClassName = "block w-full overflow-hidden border border-black bg-[#FFF6D2] shadow-sm",
}: {
  items: UIConfigBannerItem[];
  onReferralClick?: () => void;
  defaultResizeMode?: "contain" | "cover" | "stretch";
  maxHeight?: number;
  shellClassName?: string;
}) {
  const slots = items.filter((it) => String(it.image_url ?? "").trim()).slice(0, 3);
  if (slots.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {slots.map((item, idx) => (
        <TopBannerItem
          key={`web-banner-col-${idx}-${item.image_url}`}
          item={item}
          onReferralClick={onReferralClick}
          defaultResizeMode={defaultResizeMode}
          shellClassName={shellClassName}
          maxHeight={maxHeight}
        />
      ))}
    </div>
  );
}

/** 웹 홈 상단 배너 — 1행 3개, 회전(3·5행) 캐러셀 */
export function ListHomeWebTopBannerCarousel({
  items,
  rotationCount = 3,
  colsPerRow = 3,
  autoPlayMs = 4000,
  onReferralClick,
  defaultResizeMode = "contain",
  maxHeight = TOP_BANNER_MAX_HEIGHT,
}: {
  items: UIConfigBannerItem[];
  rotationCount?: WebBannerRotation;
  colsPerRow?: number;
  autoPlayMs?: number;
  onReferralClick?: () => void;
  defaultResizeMode?: "contain" | "cover" | "stretch";
  maxHeight?: number;
}) {
  const rows = useMemo(() => {
    const all = chunkBannerRows(items, colsPerRow);
    return all.slice(0, rotationCount);
  }, [colsPerRow, items, rotationCount]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (rows.length <= 1 || !autoPlayMs) return;
    const id = window.setInterval(() => {
      const next = (activeRef.current + 1) % rows.length;
      activeRef.current = next;
      setActiveIndex(next);
      scrollToIndex(next);
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlayMs, rows.length, scrollToIndex]);

  if (rows.length === 0) return null;

  if (rows.length === 1) {
    return (
      <WebBannerThreeColRow
        items={rows[0]}
        onReferralClick={onReferralClick}
        defaultResizeMode={defaultResizeMode}
        maxHeight={maxHeight}
      />
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
          const next = Math.max(0, Math.min(rows.length - 1, idx));
          activeRef.current = next;
          if (next !== activeIndex) setActiveIndex(next);
        }}
      >
        {rows.map((row, pageIdx) => (
          <div key={`web-top-page-${pageIdx}`} className="w-full shrink-0 snap-center">
            <WebBannerThreeColRow
              items={row}
              onReferralClick={onReferralClick}
              defaultResizeMode={defaultResizeMode}
              maxHeight={maxHeight}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-center gap-1.5">
        {rows.map((_, idx) => (
          <button
            key={`web-top-dot-${idx}`}
            type="button"
            aria-label={`배너 ${idx + 1}`}
            onClick={() => {
              activeRef.current = idx;
              setActiveIndex(idx);
              scrollToIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all ${
              idx === activeIndex ? "w-4 bg-[#4A6CF7]" : "w-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function ListHomeTopBannerRow({
  items,
  onReferralClick,
  defaultResizeMode = "contain",
  maxItems = 3,
}: {
  items: UIConfigBannerItem[];
  onReferralClick?: () => void;
  defaultResizeMode?: "contain" | "cover" | "stretch";
  maxItems?: number;
}) {
  const slots = items
    .filter((it) => String(it.image_url ?? "").trim())
    .slice(0, maxItems);

  if (slots.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {slots.map((item, idx) => (
        <TopBannerItem
          key={`home-top-banner-${idx}`}
          item={item}
          onReferralClick={onReferralClick}
          defaultResizeMode={defaultResizeMode}
          shellClassName="block w-full overflow-hidden border border-black bg-[#FFF6D2] shadow-sm"
        />
      ))}
    </div>
  );
}

export function TopBannerStrip({
  items,
  onReferralClick,
  defaultResizeMode = "contain",
  maxItems = 2,
}: {
  items: UIConfigBannerItem[];
  onReferralClick?: () => void;
  defaultResizeMode?: "contain" | "cover" | "stretch";
  maxItems?: number;
}) {
  const slots = items
    .filter((it) => String(it.image_url ?? "").trim())
    .slice(0, maxItems);

  if (slots.length === 0) return null;

  return (
    <>
      {slots.map((item, idx) => (
        <TopBannerItem
          key={`top-banner-${idx}`}
          item={item}
          onReferralClick={onReferralClick}
          defaultResizeMode={defaultResizeMode}
        />
      ))}
    </>
  );
}

export function FeedBannerCard({
  item,
  onReferralClick,
  defaultResizeMode = "contain",
  shellClassName,
  maxHeight = FEED_BANNER_MAX_HEIGHT,
}: BannerProps & { maxHeight?: number }) {
  const src = resolveMediaUrl(item.image_url);
  if (!src) return null;

  const resizeMode = resolveResizeMode(item, defaultResizeMode);
  const shellClass =
    shellClassName ??
    `block overflow-hidden rounded-xl border border-black bg-white ${INLINE_BANNER_WIDTH}`;
  const inner = (
    <ResponsiveBannerImage src={src} resizeMode={resizeMode} maxHeight={maxHeight} />
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

const SIDEBAR_BANNER_HEIGHT = LIST_BANNER_HEIGHT_PX;

export function ListBannerSidebar({
  topItems,
  feedItems,
  topResizeMode = "contain",
  feedResizeMode = "contain",
  onReferralClick,
}: {
  topItems: UIConfigBannerItem[];
  feedItems: UIConfigBannerItem[];
  topResizeMode?: "contain" | "cover" | "stretch";
  feedResizeMode?: "contain" | "cover" | "stretch";
  onReferralClick?: () => void;
}) {
  const topSlots = topItems.filter((it) => String(it.image_url ?? "").trim());
  const feedSlots = feedItems.filter((it) => String(it.image_url ?? "").trim());

  if (topSlots.length === 0 && feedSlots.length === 0) return null;

  const shellClass = `block overflow-hidden border border-black bg-white shadow-sm ${SIDEBAR_BANNER_WIDTH}`;

  return (
    <>
      {topSlots.map((item, idx) => (
        <TopBannerItem
          key={`sidebar-top-${idx}`}
          item={item}
          onReferralClick={onReferralClick}
          defaultResizeMode={topResizeMode}
          shellClassName={`${shellClass} bg-[#FFF6D2]`}
          maxHeight={SIDEBAR_BANNER_HEIGHT}
        />
      ))}
      {feedSlots.map((item, idx) => (
        <FeedBannerCard
          key={`sidebar-feed-${idx}`}
          item={item}
          onReferralClick={onReferralClick}
          defaultResizeMode={feedResizeMode}
          shellClassName={`${shellClass} rounded-xl`}
          maxHeight={SIDEBAR_BANNER_HEIGHT}
        />
      ))}
    </>
  );
}
