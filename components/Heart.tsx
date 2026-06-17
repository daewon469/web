"use client";

import { Posts } from "@/lib/api";
import { getSession } from "@/lib/session";
import { useEffect, useState } from "react";

type Props = {
  postId: number;
  postLiked?: boolean;
  size?: number;
  className?: string;
};

export default function Heart({ postId, postLiked, size = 22, className }: Props) {
  const [username, setUsername] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(!!postLiked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(getSession().username);
  }, []);

  useEffect(() => {
    setFavorite(!!postLiked);
  }, [postLiked]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || !username) {
      if (!username) alert("로그인이 필요합니다.");
      return;
    }
    setLoading(true);
    try {
      if (!favorite) {
        const res = await Posts.like(postId, username);
        if (res.ok !== false) setFavorite(true);
      } else {
        const res = await Posts.unlike(postId, username);
        if (res.ok !== false) setFavorite(false);
      }
    } catch {
      alert("관심 등록 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={className}
      aria-label={favorite ? "관심 해제" : "관심 등록"}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {favorite ? "❤️" : "🤍"}
    </button>
  );
}
