"use client";

import PostcardS from "@/components/PostcardS";
import type { Post } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  posts: Post[];
};

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

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncActiveIndex();
    el.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", syncActiveIndex);
  }, [syncActiveIndex, posts.length]);

  if (posts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
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
