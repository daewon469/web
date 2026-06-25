import PostCard from "@/components/PostCard";
import PostCard2 from "@/components/PostCard2";
import type { Post } from "@/lib/api";

type Props = {
  post: Post;
  grid?: boolean;
};

export default function ListFeedCard({ post, grid }: Props) {
  if (post.card_type === 2) return <PostCard2 post={post} grid={grid} />;
  return <PostCard post={post} grid={grid} />;
}
