"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type Props = {
  mode: "nationwide" | "region" | "custom" | "like";
  regionLabel?: string;
  onResetRegion?: () => void;
};

const TICKER_LINES = [
  "포인트는 유료전환 시 캐시처럼 사용됩니다.",
  "추천인 인맥 100명 달성 시 1,000,000p 지급.",
];

const FULL_BLEED_CLASS =
  "-left-[calc(0.75rem+max(0px,(100vw-80rem)/2))] w-screen lg:-left-[calc(1.5rem+14rem+1.5rem+max(0px,(100vw-80rem)/2))]";

function spacedChars(text: string) {
  return Array.from(text).join(" ");
}

function BlueStripShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[22px]">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 bg-[#4A6CF7] ${FULL_BLEED_CLASS}`}
      />
      <div className="relative h-[22px]">{children}</div>
    </div>
  );
}

export default function BlueStrip({ mode, regionLabel, onResetRegion }: Props) {
  if (mode === "like") {
    return (
      <BlueStripShell>
        <div className="flex h-[22px] items-center px-4">
          <span className="text-[15px] font-extrabold leading-tight text-white">
            ※ &apos;관 심 현 장&apos; 을 보고 계십니다.
          </span>
        </div>
      </BlueStripShell>
    );
  }

  if (mode === "custom") {
    return (
      <BlueStripShell>
        <div className="flex h-[22px] items-center justify-between px-4">
          <span className="min-w-0 truncate text-[15px] font-extrabold leading-tight text-white">
            ※ &apos;맞 춤 저 장&apos; 을 보고 계십니다.
          </span>
          <Link
            href="/customsite"
            className="shrink-0 text-[15px] font-extrabold leading-tight text-white"
          >
            맞춤설정 하기
          </Link>
        </div>
      </BlueStripShell>
    );
  }

  if (mode === "region") {
    const label = regionLabel?.trim() || "지역";
    const message = spacedChars(`${label}현장입니다`);
    return (
      <BlueStripShell>
        <div className="flex h-[22px] items-center justify-between px-4">
          <span className="text-center text-[15px] font-extrabold leading-tight text-white">
            ※ &apos;{message}.&apos;
          </span>
          <button
            type="button"
            onClick={onResetRegion}
            className="text-[15px] font-extrabold leading-tight text-white"
          >
            전체지역 보기
          </button>
        </div>
      </BlueStripShell>
    );
  }

  return (
    <BlueStripShell>
      <div className="relative h-[22px] overflow-hidden px-4">
        <div className="blue-strip-ticker flex flex-col">
          {[...TICKER_LINES, TICKER_LINES[0]].map((line, idx) => (
            <div key={idx} className="flex h-[22px] shrink-0 items-center">
              <span className="truncate text-left text-[15px] font-extrabold leading-tight text-white">
                ※ {line}
              </span>
            </div>
          ))}
        </div>
        <style jsx>{`
          .blue-strip-ticker {
            animation: blue-strip-scroll 16s cubic-bezier(0.33, 1, 0.68, 1) infinite;
          }
          @keyframes blue-strip-scroll {
            0%,
            28% {
              transform: translateY(0);
            }
            33%,
            61% {
              transform: translateY(-22px);
            }
            66%,
            94% {
              transform: translateY(-44px);
            }
            100% {
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </BlueStripShell>
  );
}
