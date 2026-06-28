"use client";

import PostcardS from "@/components/PostcardS";
import type { Post } from "@/lib/api";
import { LIST_CARD_GRID_CLASS } from "@/lib/listCardLayout";

type Props = {
  posts: Post[];
  onPostLikedChange?: (postId: number, liked: boolean) => void;
};

export default function PostcardSSlider({ posts, onPostLikedChange }: Props) {
  if (posts.length === 0) return null;

  return (
    <div className={LIST_CARD_GRID_CLASS}>
      {posts.map((post) => (
        <div key={post.id} className="relative min-w-0">
          <PostcardS post={post} onLikedChange={onPostLikedChange} />
        </div>
      ))}
    </div>
  );
}
