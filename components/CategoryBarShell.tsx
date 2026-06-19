"use client";

import { type ReactNode } from "react";

type CategoryBarShellProps = {
  children: ReactNode;
  sticky?: boolean;
  stickyTopClass?: string;
  zIndexClass?: string;
};

export default function CategoryBarShell({
  children,
  sticky = true,
  stickyTopClass = "top-14 lg:top-0",
  zIndexClass = "z-40",
}: CategoryBarShellProps) {
  return (
    <div className={`relative ${sticky ? `sticky ${stickyTopClass} ${zIndexClass}` : ""}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-[calc(0.75rem+max(0px,(100vw-80rem)/2))] w-screen border-b border-[#E1E4EA] bg-white lg:-left-[calc(1.5rem+14rem+1.5rem+max(0px,(100vw-80rem)/2))]"
      />
      <div className="relative flex items-center">{children}</div>
    </div>
  );
}

export function CategoryTabButton({
  active,
  label,
  onClick,
  accent = false,
  className = "",
  labelClassName = "",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  accent?: boolean;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center py-2.5 ${
        active ? "border-b-[3px] border-[#0099FF]" : "border-b-[3px] border-transparent"
      } ${className}`}
    >
      <span
        className={`${labelClassName || "text-[13px] sm:text-[14px]"} ${
          accent
            ? "font-bold text-[#FF8A3D]"
            : active
              ? labelClassName
                ? "font-black"
                : "font-black text-[#0099FF]"
              : labelClassName
                ? ""
                : "text-[#666]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
