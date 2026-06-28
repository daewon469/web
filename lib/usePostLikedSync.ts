"use client";

import { subscribePostLikedChange } from "@/lib/postLikedSync";
import { useEffect } from "react";

/** 다른 화면에서 바뀐 관심 상태를 이 페이지에 반영 */
export function usePostLikedSync(
  handler: (postId: number, liked: boolean) => void,
) {
  useEffect(() => subscribePostLikedChange(handler), [handler]);
}
