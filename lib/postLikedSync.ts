/** 목록·관심현장 등 페이지 간 관심(하트) 상태 동기화 */

export type PostLikedChangeDetail = {
  postId: number;
  liked: boolean;
};

const EVENT = "post-liked-changed";

export function dispatchPostLikedChange(postId: number, liked: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PostLikedChangeDetail>(EVENT, {
      detail: { postId, liked },
    }),
  );
}

export function subscribePostLikedChange(
  handler: (postId: number, liked: boolean) => void,
) {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<PostLikedChangeDetail>).detail;
    if (!detail) return;
    handler(detail.postId, detail.liked);
  };

  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
