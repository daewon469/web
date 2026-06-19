import MyTypePostsClient from "@/components/MyTypePostsClient";

export default function MyPage5() {
  return (
    <MyTypePostsClient postType={5} title="내 공지사항" editPath="/write5" />
  );
}
