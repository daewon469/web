"use client";

import ListFeedCard from "@/components/ListFeedCard";
import PostcardSSlider from "@/components/PostcardSSlider";
import { WebBannerThreeColRow } from "@/components/FeedBanner";
import type { Post, UIConfigBannerItem } from "@/lib/api";
import { LIST_CARD_GRID_CLASS } from "@/lib/listCardLayout";
import { groupFeedByCardType, splitSlideAndFeedPosts } from "@/lib/postCardFormat";
import { pickWebBannerRow, type WebBannerRotation } from "@/lib/webBannerUtils";
import { useMemo, type ReactNode } from "react";

export type WebFeedBannerConfig = {
  enabled: boolean;
  items: UIConfigBannerItem[];
  intervalRows: WebBannerRotation;
  rotationCount: WebBannerRotation;
  resizeMode?: "contain" | "cover" | "stretch";
  maxHeight?: number;
  onReferralClick?: () => void;
};

type Props = {
  items?: Post[];
  slideItems?: Post[];
  feedItems?: Post[];
  onSlidePostLikedChange?: (postId: number, liked: boolean) => void;
  onFeedPostLikedChange?: (postId: number, liked: boolean) => void;
  /** 슬라이드(S유형) 영역 렌더 여부 — false면 피드만 */
  showSlides?: boolean;
  webFeedBanner?: WebFeedBannerConfig;
};

function chunkPosts<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export default function ListPostGrid({
  items,
  slideItems,
  feedItems,
  onSlidePostLikedChange,
  onFeedPostLikedChange,
  showSlides = true,
  webFeedBanner,
}: Props) {
  const { slide, feed } = useMemo(() => {
    if (items) return splitSlideAndFeedPosts(items);
    return { slide: slideItems ?? [], feed: feedItems ?? [] };
  }, [items, slideItems, feedItems]);

  const feedGroups = useMemo(() => groupFeedByCardType(feed), [feed]);

  if ((showSlides ? slide.length : 0) === 0 && feed.length === 0) return null;

  const bannerEnabled =
    webFeedBanner?.enabled &&
    webFeedBanner.items.some((it) => String(it.image_url ?? "").trim());

  let bannerSlot = 0;
  let globalRow = 0;

  const renderGroup = (group: Post[]) => {
    if (!bannerEnabled) {
      return (
        <div className={LIST_CARD_GRID_CLASS}>
          {group.map((post) => (
            <div key={post.id} className="h-full min-w-0">
              <ListFeedCard post={post} grid onLikedChange={onFeedPostLikedChange} />
            </div>
          ))}
        </div>
      );
    }

    const rows = chunkPosts(group, 3);
    const nodes: ReactNode[] = [];

    rows.forEach((row, rowIdx) => {
      globalRow += 1;
      nodes.push(
        <div key={`feed-row-${group[0]?.id}-${rowIdx}`} className={LIST_CARD_GRID_CLASS}>
          {row.map((post) => (
            <div key={post.id} className="h-full min-w-0">
              <ListFeedCard post={post} grid onLikedChange={onFeedPostLikedChange} />
            </div>
          ))}
        </div>,
      );

      if (
        globalRow % webFeedBanner!.intervalRows === 0 &&
        webFeedBanner!.items.length > 0
      ) {
        const rowItems = pickWebBannerRow(
          webFeedBanner!.items,
          3,
          webFeedBanner!.rotationCount,
          bannerSlot,
        );
        bannerSlot += 1;
        if (rowItems.length > 0) {
          nodes.push(
            <WebBannerThreeColRow
              key={`feed-banner-${globalRow}-${bannerSlot}`}
              items={rowItems}
              onReferralClick={webFeedBanner!.onReferralClick}
              defaultResizeMode={webFeedBanner!.resizeMode}
              maxHeight={webFeedBanner!.maxHeight}
              shellClassName="block w-full overflow-hidden rounded-xl border border-black bg-white shadow-sm"
            />,
          );
        }
      }
    });

    return nodes;
  };

  return (
    <div className="flex flex-col gap-1.5">
      {showSlides && slide.length > 0 && (
        <PostcardSSlider posts={slide} onPostLikedChange={onSlidePostLikedChange} />
      )}
      {feedGroups.map((group) => (
        <div key={`feed-type-${group[0]?.card_type}`} className="flex flex-col gap-1.5">
          {renderGroup(group)}
        </div>
      ))}
    </div>
  );
}
