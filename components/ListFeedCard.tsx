import PostCard from "@/components/PostCard";
import PostCard2 from "@/components/PostCard2";
import type { Post } from "@/lib/api";

type Props = {
  post: Post;
  grid?: boolean;
  onLikedChange?: (postId: number, liked: boolean) => void;
};

export default function ListFeedCard({ post, grid, onLikedChange }: Props) {
  if (post.card_type === 2) {
    return <PostCard2 post={post} grid={grid} onLikedChange={onLikedChange} />;
  }
  return <PostCard post={post} grid={grid} onLikedChange={onLikedChange} />;
}
