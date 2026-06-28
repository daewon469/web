"use client";

import { Posts } from "@/lib/api";
import { getSession } from "@/lib/session";
import { useEffect, useState } from "react";

type Props = {
  postId: number;
  postLiked?: boolean;
  size?: number;
  className?: string;
  /** 어두운 카드(5유형) — 흰 테두리/빨간 채움 SVG */
  variant?: "default" | "overlay";
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
  const [favorite, setFavorite] = useState(!!postLiked);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setFavorite(!!postLiked);
  }, [postId, postLiked]);

  const runToggle = async () => {
    if (loading || !username) {
      if (!username) alert("로그인이 필요합니다.");
      return;
    }

    const next = !favorite;
    setFavorite(next);
    setLoading(true);
    try {
      const res = next
        ? await Posts.like(postId, username)
        : await Posts.unlike(postId, username);
      if (res.ok === false) {
        setFavorite(!next);
        alert("관심 등록 처리에 실패했습니다.");
        return;
      }
      onChange?.(next);
    } catch {
      setFavorite(!next);
      alert("관심 등록 처리에 실패했습니다.");
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
      aria-label={favorite ? "관심 해제" : "관심 등록"}
      aria-pressed={favorite}
      style={variant === "default" ? { fontSize: size, lineHeight: 1 } : undefined}
    >
      <HeartIcon active={favorite} size={size} variant={variant} />
    </button>
  );
}
