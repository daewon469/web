import PostDetail from "./PostDetail";

type Props = {
  params: Promise<{ id: string }>;
};

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
