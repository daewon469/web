"use client";

import { UIConfig, resolveMediaUrl } from "@/lib/api";
import { useEffect, useState } from "react";

const POPUP_HIDE_KEY = "uiPopupDontShowDate";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function objectFitClass(mode: "contain" | "cover" | "stretch") {
  if (mode === "cover") return "object-cover";
  if (mode === "stretch") return "object-fill";
  return "object-contain";
}

export default function HomePopup() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<{
    image_url: string | null;
    link_url: string | null;
    resize_mode?: "contain" | "cover" | "stretch";
  } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await UIConfig.get();
      const popup = res.config?.popup;
      if (!popup?.enabled || !popup.image_url) return;
      const hidden = localStorage.getItem(POPUP_HIDE_KEY);
      if (hidden === todayKey()) return;
      setConfig(popup);
      setVisible(true);
    })();
  }, []);

  if (!visible || !config?.image_url) return null;

  const src = resolveMediaUrl(config.image_url);
  if (!src) return null;

  const resizeMode = (() => {
    const rm = String(config.resize_mode ?? "contain");
    return rm === "cover" || rm === "stretch" ? rm : "contain";
  })() as "contain" | "cover" | "stretch";

  const hideToday = () => {
    localStorage.setItem(POPUP_HIDE_KEY, todayKey());
    setVisible(false);
  };

  const onImageClick = () => {
    const link = String(config.link_url ?? "").trim();
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-[min(100%,32rem)] rounded-xl bg-white p-2 shadow-xl sm:max-w-lg lg:max-w-xl">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
        >
          닫기
        </button>
        <button type="button" onClick={onImageClick} className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className={`block h-auto max-h-[75vh] w-full rounded-lg bg-[#f2f2f2] ${objectFitClass(resizeMode)}`}
          />
        </button>
        <button
          type="button"
          onClick={hideToday}
          className="mt-2 w-full text-center text-xs text-gray-500 underline"
        >
          오늘 다시 보지 않기
        </button>
      </div>
    </div>
  );
}
