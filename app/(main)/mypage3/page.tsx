import MyTypePostsClient from "@/components/MyTypePostsClient";

export default function MyPage3() {
  return (
    <MyTypePostsClient postType={3} title="내 커뮤니티글" editPath="/write3" />
  );
}
