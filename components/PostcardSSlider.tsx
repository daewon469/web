"use client";

import PostcardS from "@/components/PostcardS";
import type { Post } from "@/lib/api";
import { LIST_CARD_GRID_CLASS } from "@/lib/listCardLayout";

type Props = {
  posts: Post[];
};

export default function PostcardSSlider({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <div className={LIST_CARD_GRID_CLASS}>
      {posts.map((post) => (
        <div key={post.id} className="min-w-0">
          <PostcardS post={post} />
        </div>
      ))}
    </div>
  );
}
