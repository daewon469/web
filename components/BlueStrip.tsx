"use client";

import { CATEGORY_BAR_BLEED_CLASS } from "@/lib/categoryNav";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  mode: "nationwide" | "region" | "custom" | "like";
  regionLabel?: string;
  onResetRegion?: () => void;
};

const TICKER_LINES = [
  "포인트는 유료전환 시 캐시처럼 사용됩니다.",
  "추천인 인맥 100명 달성 시 1,000,000p 지급.",
];

const TICKER_HEIGHT = 22;
const TICKER_DWELL_MS = 4500;
const TICKER_TRANSITION_MS = 600;

function spacedChars(text: string) {
  return Array.from(text).join(" ");
}

function BlueStripShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[22px]">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 bg-[#4A6CF7] ${CATEGORY_BAR_BLEED_CLASS}`}
      />
      <div className="relative h-[22px]">{children}</div>
    </div>
  );
}

function NationwideTicker() {
  const [index, setIndex] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [animating, setAnimating] = useState(false);
  const indexRef = useRef(0);
  const animatingRef = useRef(false);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = TICKER_LINES[index % TICKER_LINES.length] ?? "";
  const next = TICKER_LINES[(index + 1) % TICKER_LINES.length] ?? current;

  useEffect(() => {
    if (TICKER_LINES.length <= 1) return;

    let cancelled = false;
    indexRef.current = 0;
    setIndex(0);
    setOffsetY(0);

    const clearTimers = () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      dwellTimerRef.current = null;
      transitionTimerRef.current = null;
    };

    const runStep = () => {
      if (cancelled) return;
      dwellTimerRef.current = setTimeout(() => {
        if (cancelled || animatingRef.current) return;
        animatingRef.current = true;
        setAnimating(true);
        setOffsetY(-TICKER_HEIGHT);

        transitionTimerRef.current = setTimeout(() => {
          if (cancelled) return;
          animatingRef.current = false;
          setAnimating(false);
          setOffsetY(0);
          const nextIndex = (indexRef.current + 1) % TICKER_LINES.length;
          indexRef.current = nextIndex;
          setIndex(nextIndex);
          runStep();
        }, TICKER_TRANSITION_MS);
      }, TICKER_DWELL_MS);
    };

    runStep();

    return () => {
      cancelled = true;
      animatingRef.current = false;
      clearTimers();
    };
  }, []);

  return (
    <div className="relative h-[22px] overflow-hidden px-4">
      <div
        className="flex flex-col"
        style={{
          transform: `translateY(${offsetY}px)`,
          transition: animating
            ? `transform ${TICKER_TRANSITION_MS}ms linear`
            : "none",
        }}
      >
        <div className="flex h-[22px] shrink-0 items-center">
          <span className="truncate text-left text-[15px] font-extrabold leading-tight text-white">
            ※ {current}
          </span>
        </div>
        <div className="flex h-[22px] shrink-0 items-center">
          <span className="truncate text-left text-[15px] font-extrabold leading-tight text-white">
            ※ {next}
          </span>
        </div>
      </div>
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
      <NationwideTicker />
    </BlueStripShell>
  );
}
