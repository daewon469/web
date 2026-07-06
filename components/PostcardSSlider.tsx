"use client";

import PostcardS from "@/components/PostcardS";
import type { Post } from "@/lib/api";
import { LIST_CARD_GRID_CLASS, LIST_CARD_HEIGHT_TYPE_S } from "@/lib/listCardLayout";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  posts: Post[];
  onPostLikedChange?: (postId: number, liked: boolean) => void;
  /** grid: 3열 그리드, carousel: 가로 슬라이드(홈) */
  variant?: "grid" | "carousel";
  autoPlayMs?: number;
  maxItems?: number;
};

export default function PostcardSSlider({
  posts,
  onPostLikedChange,
  variant = "grid",
  autoPlayMs = 0,
  maxItems,
}: Props) {
  const visiblePosts = maxItems ? posts.slice(0, maxItems) : posts;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: width * index, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (variant !== "carousel" || !autoPlayMs || visiblePosts.length <= 1) return;

    const id = window.setInterval(() => {
      const next = (activeIndexRef.current + 1) % visiblePosts.length;
      activeIndexRef.current = next;
      setActiveIndex(next);
      scrollToIndex(next);
    }, autoPlayMs);

    return () => window.clearInterval(id);
  }, [autoPlayMs, scrollToIndex, variant, visiblePosts.length]);

  if (visiblePosts.length === 0) return null;

  if (variant === "carousel") {
    return (
      <div className="relative w-full">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
            const next = Math.max(0, Math.min(visiblePosts.length - 1, idx));
            activeIndexRef.current = next;
            if (next !== activeIndex) setActiveIndex(next);
          }}
        >
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              className="w-full shrink-0 snap-center"
              style={{ height: LIST_CARD_HEIGHT_TYPE_S }}
            >
              <PostcardS post={post} onLikedChange={onPostLikedChange} />
            </div>
          ))}
        </div>
        {visiblePosts.length > 1 && (
          <div className="mt-1 flex justify-center gap-1.5">
            {visiblePosts.map((post, idx) => (
              <button
                key={`dot-${post.id}`}
                type="button"
                aria-label={`슬라이드 ${idx + 1}`}
                onClick={() => {
                  activeIndexRef.current = idx;
                  setActiveIndex(idx);
                  scrollToIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? "w-4 bg-[#4A6CF7]" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={LIST_CARD_GRID_CLASS}>
      {visiblePosts.map((post) => (
        <div key={post.id} className="relative min-w-0">
          <PostcardS post={post} onLikedChange={onPostLikedChange} />
        </div>
      ))}
    </div>
  );
}
