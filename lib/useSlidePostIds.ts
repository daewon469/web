"use client";

import { UIConfig } from "@/lib/api";
import { useEffect, useState } from "react";

/** 첫화면 슬라이드(5유형) 노출 순서 — UIConfig slide_posts.post_ids */
export function useSlidePostIds() {
  const [slidePostIds, setSlidePostIds] = useState<number[]>([]);

  useEffect(() => {
    UIConfig.get().then((res) => {
      if (res.status !== 0) return;
      setSlidePostIds(
        Array.from(
          new Set(
            (res.config.slide_posts?.post_ids ?? [])
              .map((v) => Number(v))
              .filter((n) => Number.isFinite(n) && n > 0),
          ),
        ),
      );
    });
  }, []);

  return slidePostIds;
}
