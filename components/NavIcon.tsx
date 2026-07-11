import type { ReactNode } from "react";

export type NavIconName =
  | "create"
  | "megaphone"
  | "home"
  | "notifications"
  | "log-in"
  | "person"
  | "people"
  | "map"
  | "search"
  | "location"
  | "options-outline"
  | "heart"
  | "refresh";

type NavIconProps = {
  name: NavIconName;
  size?: number;
  className?: string;
};

type IconDef = {
  viewBox: string;
  filled?: boolean;
  strokeWidth?: number;
  nodes: ReactNode;
};

/** Ionicons(create / map / options-outline) + 기존 filled 아이콘 */
const icons: Record<NavIconName, IconDef> = {
  // Ionicons create (filled) — 앱 Topbar와 동일
  create: {
    viewBox: "0 0 512 512",
    filled: true,
    nodes: (
      <>
        <path d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z" />
        <path d="M386.34 193.66L264.45 315.79A41.08 41.08 0 01247.58 326l-25.9 8.67a35.92 35.92 0 01-44.33-44.33l8.67-25.9a41.08 41.08 0 0110.19-16.87l122.13-121.91a8 8 0 00-5.65-13.66H104a56 56 0 00-56 56v240a56 56 0 0056 56h240a56 56 0 0056-56V199.31a8 8 0 00-13.66-5.65z" />
      </>
    ),
  },
  // Ionicons map (filled) — 앱 BottomBar와 동일
  map: {
    viewBox: "0 0 512 512",
    filled: true,
    nodes: (
      <path d="M48.17 113.34A32 32 0 0032 141.24V438a32 32 0 0047 28.37c.43-.23.85-.47 1.26-.74l84.14-55.05a8 8 0 003.63-6.72V46.45a8 8 0 00-12.51-6.63zM212.36 39.31A8 8 0 00200 46v357.56a8 8 0 003.63 6.72l96 62.42A8 8 0 00312 466V108.67a8 8 0 00-3.64-6.73zM464.53 46.47a31.64 31.64 0 00-31.5-.88 12.07 12.07 0 00-1.25.74l-84.15 55a8 8 0 00-3.63 6.72v357.46a8 8 0 0012.52 6.63l107.07-73.46a32 32 0 0016.41-28v-296a32.76 32.76 0 00-15.47-28.21z" />
    ),
  },
  // Ionicons options-outline — 앱 BottomBar와 동일
  "options-outline": {
    viewBox: "0 0 512 512",
    filled: false,
    strokeWidth: 32,
    nodes: (
      <>
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
          d="M368 128h80M64 128h240M368 384h80M64 384h240M208 256h240M64 256h80"
        />
        <circle
          cx="336"
          cy="128"
          r="32"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
        />
        <circle
          cx="176"
          cy="256"
          r="32"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
        />
        <circle
          cx="336"
          cy="384"
          r="32"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
        />
      </>
    ),
  },
  people: {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: (
      <>
        <path d="M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.58-3.47-6.33-3.87z" />
        <circle cx="9" cy="8" r="4" />
        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.26a5.99 5.99 0 0 1 0 7.48c.42.16.86.26 1.33.26z" />
        <path d="M9 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
      </>
    ),
  },
  home: {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
  },
  megaphone: {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: (
      <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.5-1.5-3.26v6.52c.92-.76 1.5-1.93 1.5-3.26z" />
    ),
  },
  "log-in": {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: (
      <>
        <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5z" />
        <path d="M20 19h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
      </>
    ),
  },
  person: {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: (
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    ),
  },
  search: {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: (
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    ),
  },
  location: {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: (
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    ),
  },
  heart: {
    viewBox: "0 0 24 24",
    filled: true,
    nodes: (
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    ),
  },
  notifications: {
    viewBox: "0 0 24 24",
    filled: false,
    strokeWidth: 2,
    nodes: (
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
  },
  refresh: {
    viewBox: "0 0 24 24",
    filled: false,
    strokeWidth: 2,
    nodes: (
      <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </>
    ),
  },
};

export default function NavIcon({ name, size = 22, className = "" }: NavIconProps) {
  const icon = icons[name];
  const filled = icon.filled !== false;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? undefined : icon.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {icon.nodes}
    </svg>
  );
}
