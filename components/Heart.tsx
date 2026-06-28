"use client";

import { Posts } from "@/lib/api";
import { isPostLiked } from "@/lib/postCardFormat";
import { dispatchPostLikedChange } from "@/lib/postLikedSync";
import { getSession } from "@/lib/session";
import { useEffect, useState } from "react";

type Props = {
  postId: number;
  postLiked?: boolean;
  size?: number;
  className?: string;
  /** 어두운 카드(5유형) — 흰 테두리/빨간 채움 SVG */
  variant?: "default" | "overlay";
  /** API 성공 후 부모 post.liked 갱신용 */
  onChange?: (liked: boolean) => void;
};

function HeartIcon({
  active,
  size,
  variant,
}: {
  active: boolean;
  size: number;
  variant: "default" | "overlay";
}) {
  if (variant === "overlay") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden
        className="block"
      >
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          fill={active ? "#e53935" : "#ffffff"}
          stroke="#111"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return <span aria-hidden>{active ? "❤️" : "🤍"}</span>;
}

export default function Heart({
  postId,
  postLiked,
  size = 22,
  className,
  variant = "default",
  onChange,
}: Props) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const liked = isPostLiked(postLiked);

  useEffect(() => {
    const syncSession = () => setUsername(getSession().username);
    syncSession();
    window.addEventListener("session-updated", syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("session-updated", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const runToggle = async () => {
    if (loading || !username) {
      if (!username) alert("로그인이 필요합니다.");
      return;
    }

    const next = !liked;
    setLoading(true);
    try {
      const res = next
        ? await Posts.like(postId, username)
        : await Posts.unlike(postId, username);
      if (res.ok === false) {
        alert(next ? "관심 등록에 실패했습니다." : "관심 해제에 실패했습니다.");
        return;
      }
      onChange?.(next);
      dispatchPostLikedChange(postId, next);
    } catch {
      alert(next ? "관심 등록에 실패했습니다." : "관심 해제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const stopBubble = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <button
      type="button"
      onMouseDown={stopBubble}
      onTouchStart={stopBubble}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void runToggle();
      }}
      disabled={loading}
      className={`touch-manipulation select-none ${className ?? ""}`}
      aria-label={liked ? "관심 해제" : "관심 등록"}
      aria-pressed={liked}
      style={variant === "default" ? { fontSize: size, lineHeight: 1 } : undefined}
    >
      <HeartIcon active={liked} size={size} variant={variant} />
    </button>
  );
}
