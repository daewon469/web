"use client";

import TypePostList from "@/components/TypePostList";

export default function CommunityListPage() {
  return (
    <TypePostList
      postType={3}
      title="분양인 수다"
      writeHref="/write3"
      writeLabel="글 작성"
    />
  );
}
