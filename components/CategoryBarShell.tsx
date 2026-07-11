"use client";

import { CATEGORY_BAR_BLEED_CLASS } from "@/lib/categoryNav";
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
        className={`pointer-events-none absolute inset-y-0 border-b border-[#E1E4EA] bg-white ${CATEGORY_BAR_BLEED_CLASS}`}
      />
      <div className="relative flex items-stretch">{children}</div>
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
  layout = "equal",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  accent?: boolean;
  className?: string;
  labelClassName?: string;
  layout?: "equal" | "auto";
}) {
  const layoutClass = layout === "auto" ? "shrink-0 px-2.5" : "flex-1";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center py-2.5 ${layoutClass} ${active ? "border-b-[3px] border-[#0099FF]" : "border-b-[3px] border-transparent"} ${className}`}
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
