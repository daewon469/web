import type { Metadata } from "next";
import { fetchPostServer } from "@/lib/serverApi";
import { buildPostMetadata, pageMetadata } from "@/lib/seo";
import PostDetail from "./PostDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return pageMetadata("게시글");
  }
  const post = await fetchPostServer(postId);
  if (!post) return pageMetadata("게시글");
  return buildPostMetadata(post);
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId)) {
    return (
      <div className="rounded-lg bg-white p-6 text-center text-red-600">
        잘못된 게시글 주소입니다.
      </div>
    );
  }
  return <PostDetail id={postId} />;
}
