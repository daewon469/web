import type { ReactNode } from "react";

export type MyBoardRowIconName =
  | "key"
  | "people"
  | "trophy"
  | "network"
  | "star"
  | "wallet"
  | "receipt"
  | "work"
  | "chats"
  | "campaign"
  | "message"
  | "list"
  | "create"
  | "location"
  | "options"
  | "notifications"
  | "help"
  | "business"
  | "logout"
  | "person-remove"
  | "search"
  | "albums"
  | "stats"
  | "image"
  | "images"
  | "download"
  | "chevron";

const paths: Record<MyBoardRowIconName, ReactNode> = {
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8M15 8l3 3M17 6l2 2" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" />
    </>
  ),
  network: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" />
      <path d="M6 7v4h12V7M12 11v6" />
    </>
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  wallet: (
    <>
      <path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v9a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3V7" />
      <path d="M16 14h4" />
    </>
  ),
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6" />,
  work: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
    </>
  ),
  chats: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 14a7 7 0 0 1 7-7h7a4 4 0 0 1 4 4v4Z" />
      <path d="M8 11h8M8 15h5" />
    </>
  ),
  campaign: (
    <>
      <path d="M3 11v3a2 2 0 0 0 2 2h3l8 4V5L8 9H5a2 2 0 0 0-2 2Z" />
      <path d="M8 16v4M19 8a5 5 0 0 1 0 9" />
    </>
  ),
  message: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 14V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v7Z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  create: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  options: (
    <>
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="13" cy="18" r="2" />
    </>
  ),
  notifications: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M10 20h4" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
    </>
  ),
  business: (
    <>
      <path d="M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M18 13h.01M18 17h.01M2 21h20" />
    </>
  ),
  logout: <path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />,
  "person-remove": (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 4 2M17 19h6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  albums: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M8 2h8M2 8v8" />
    </>
  ),
  stats: <path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2 20h22" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 20" />
    </>
  ),
  images: (
    <>
      <rect x="5" y="5" width="16" height="15" rx="2" />
      <path d="M3 17V3h15M21 15l-4-4L7 20" />
    </>
  ),
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  chevron: <path d="m9 18 6-6-6-6" />,
};

export default function MyBoardRowIcon({
  name,
  size = 20,
  className = "",
}: {
  name: MyBoardRowIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
