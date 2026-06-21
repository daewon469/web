"use client";

import PostcardS from "@/components/PostcardS";
import type { Post } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  posts: Post[];
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export default function PostcardSSlider({ posts }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncActiveIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || posts.length === 0) return;
    const width = el.clientWidth;
    if (width <= 0) return;
    const idx = Math.round(el.scrollLeft / width);
    setActiveIndex(Math.max(0, Math.min(posts.length - 1, idx)));
  }, [posts.length]);

  const goTo = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const next = Math.max(0, Math.min(posts.length - 1, index));
      const width = el.clientWidth;
      if (width <= 0) return;
      el.scrollTo({ left: width * next, behavior: "smooth" });
    },
    [posts.length],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncActiveIndex();
    el.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", syncActiveIndex);
  }, [syncActiveIndex, posts.length]);

  if (posts.length === 0) return null;

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < posts.length - 1;

  return (
    <div className="flex flex-col gap-2">
      <div className="group relative">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {posts.map((post) => (
            <div key={post.id} className="w-full shrink-0 snap-center snap-always px-0.5">
              <PostcardS post={post} />
            </div>
          ))}
        </div>

        {posts.length > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 슬라이드"
              disabled={!canGoPrev}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canGoPrev) goTo(activeIndex - 1);
              }}
              className={`absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-md transition-all ${
                canGoPrev
                  ? "opacity-0 group-hover:opacity-100 hover:bg-black/80"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <ChevronIcon direction="left" />
            </button>

            <button
              type="button"
              aria-label="다음 슬라이드"
              disabled={!canGoNext}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canGoNext) goTo(activeIndex + 1);
              }}
              className={`absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-md transition-all ${
                canGoNext
                  ? "opacity-0 group-hover:opacity-100 hover:bg-black/80"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <ChevronIcon direction="right" />
            </button>
          </>
        )}
      </div>

      {posts.length > 1 && (
        <div className="flex items-center justify-center gap-1.5" aria-hidden>
          {posts.map((post, idx) => (
            <span
              key={post.id}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeIndex ? "w-4 bg-[#4A6CF7]" : "w-1.5 bg-black/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
