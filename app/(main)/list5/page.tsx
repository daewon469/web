"use client";

import TypePostList from "@/components/TypePostList";

export default function NoticeListPage() {
  return (
    <TypePostList
      postType={5}
      title="공지사항"
      adminWriteHref="/write5"
      writeLabel="글 작성"
    />
  );
}
