"use client";

import { UIConfig, resolveMediaUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const POPUP_HIDE_KEY = "uiPopupDontShowDate";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function HomePopup() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<{
    image_url: string | null;
    link_url: string | null;
    height?: number;
    width_percent?: number;
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
      <div
        className="relative max-w-lg rounded-xl bg-white p-2 shadow-xl"
        style={{ width: `${config.width_percent ?? 92}%` }}
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
        >
          닫기
        </button>
        <button type="button" onClick={onImageClick} className="block w-full">
          <Image
            src={src}
            alt=""
            width={600}
            height={config.height ?? 360}
            className="w-full rounded-lg object-contain"
            style={{ maxHeight: config.height ?? 360 }}
            unoptimized
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
