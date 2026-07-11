"use client";

import { getUserGradeIconMeta } from "@/lib/userGrade";

type Props = {
  grade?: number | null;
  size?: number;
  bgColor?: string;
};

function GradeGlyph({
  name,
  color,
  size,
}: {
  name: "trophy" | "ribbon" | "heart" | "diamond" | "person" | "leaf";
  color: string;
  size: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: color,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "person":
      return (
        <svg {...common}>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.10.0.2.4 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <path d="M19 3H5L2 9l10 12L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62zM11 10v6.68L5.44 10H11zm2 0h5.56L13 16.68V10zm6.26-2h-2.65l-1.5-3h2.65l1.5 3zM6.89 5h2.65l-1.5 3H5.39l1.5-3z" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
        </svg>
      );
    case "ribbon":
      return (
        <svg {...common}>
          <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function UserGradeBadge({ grade, size = 56, bgColor }: Props) {
  const meta = getUserGradeIconMeta(grade);
  const scale = meta.type === "ion" ? (meta.iconScale ?? 0.68) : 0.78;
  const glyphSize = Math.min(Math.floor(size * scale), size - 10);
  const noOutline = Boolean(meta.noOutline);

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#111]"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor ?? meta.badgeBgColor ?? "#D9D9D9",
      }}
    >
      {meta.type === "text" ? (
        <span
          className="font-black leading-none"
          style={{
            fontSize: Math.min(Math.floor(size * 0.78), size - 12),
            color: meta.color,
            textShadow: noOutline ? undefined : "0 0 1px #111",
          }}
        >
          {meta.text}
        </span>
      ) : (
        <span className="relative inline-flex items-center justify-center">
          {!noOutline && (
            <span className="absolute inset-0 flex items-center justify-center opacity-100">
              <GradeGlyph name={meta.name} color="#111" size={glyphSize + 2} />
            </span>
          )}
          <GradeGlyph name={meta.name} color={meta.color} size={glyphSize} />
        </span>
      )}
    </span>
  );
}
