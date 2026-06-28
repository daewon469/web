"use client";

import ListFeedCard from "@/components/ListFeedCard";
import PostcardSSlider from "@/components/PostcardSSlider";
import type { Post } from "@/lib/api";
import { LIST_CARD_GRID_CLASS } from "@/lib/listCardLayout";
import { groupFeedByCardType, splitSlideAndFeedPosts } from "@/lib/postCardFormat";
import { useMemo } from "react";

type Props = {
  /** 전체 목록 — S·1·2유형 자동 분리 */
  items?: Post[];
  /** 첫 화면처럼 S유형을 별도 조회할 때 */
  slideItems?: Post[];
  feedItems?: Post[];
  onSlidePostLikedChange?: (postId: number, liked: boolean) => void;
};

export default function ListPostGrid({ items, slideItems, feedItems, onSlidePostLikedChange }: Props) {
  const { slide, feed } = useMemo(() => {
    if (items) return splitSlideAndFeedPosts(items);
    return { slide: slideItems ?? [], feed: feedItems ?? [] };
  }, [items, slideItems, feedItems]);

  const feedGroups = useMemo(() => groupFeedByCardType(feed), [feed]);

  if (slide.length === 0 && feed.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {slide.length > 0 && (
        <PostcardSSlider posts={slide} onPostLikedChange={onSlidePostLikedChange} />
      )}
      {feedGroups.map((group) => (
        <div key={`feed-type-${group[0]?.card_type}`} className={LIST_CARD_GRID_CLASS}>
          {group.map((post) => (
            <div key={post.id} className="h-full min-w-0">
              <ListFeedCard post={post} grid />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
