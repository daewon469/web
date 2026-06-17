"use client";

import { UIConfig, resolveMediaUrl, type UIConfigBannerItem, type UIConfigResponse } from "@/lib/api";
import { uploadImageFile } from "@/lib/upload";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type BannerKey = "banner" | "top_banner";

export default function BannerAdminClient({
  bannerKey,
  title,
}: {
  bannerKey: BannerKey;
  title: string;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [intervalPosts, setIntervalPosts] = useState("10");
  const [items, setItems] = useState<UIConfigBannerItem[]>([]);
  const [fullConfig, setFullConfig] = useState<UIConfigResponse["config"] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await UIConfig.get();
      if (res.status !== 0) {
        alert("설정을 불러올 수 없습니다.");
        return;
      }
      setFullConfig(res.config);
      const section = bannerKey === "banner" ? res.config.banner : res.config.top_banner;
      setEnabled(!!section?.enabled);
      if (bannerKey === "banner") {
        setIntervalPosts(String(res.config.banner.interval_posts ?? 10));
      }
      setItems(
        (section?.items ?? []).filter((it) => String(it.image_url ?? "").trim()),
      );
    } finally {
      setLoading(false);
    }
  }, [bannerKey]);

  useEffect(() => {
    load();
  }, [load]);

  const onAddImage = async (file: File | null) => {
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImageFile(file);
      setItems((prev) => [
        ...prev,
        {
          image_url: url,
          link_url: null,
          click_action: "link",
          height: bannerKey === "banner" ? 110 : 70,
          resize_mode: "contain",
        },
      ]);
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onSave = async () => {
    if (!fullConfig) return;
    setSaving(true);
    try {
      const next = { ...fullConfig };
      const section = {
        enabled,
        items,
        height: bannerKey === "banner" ? 110 : 70,
        resize_mode: "contain" as const,
        ...(bannerKey === "banner" ? { interval_posts: Number(intervalPosts) || 10 } : {}),
      };
      if (bannerKey === "banner") {
        next.banner = { ...next.banner, ...section };
      } else {
        next.top_banner = { ...(next.top_banner ?? { items: [] }), ...section };
      }
      const res = await UIConfig.update(next);
      if (res.status === 0) {
        alert("저장되었습니다.");
        await load();
      } else {
        alert("저장에 실패했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Link href="/myboard" className="text-sm text-[#4A6CF7]">
        ← 마이메뉴
      </Link>
      <h1 className="text-xl font-bold text-[#0B1B3A]">{title}</h1>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}

      {!loading && (
        <>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            배너 사용
          </label>

          {bannerKey === "banner" && (
            <label className="flex flex-col gap-1 text-sm font-bold">
              N개 글마다 배너 삽입
              <input
                className="rounded-xl border border-black bg-[#f9f9f9] px-3 py-2"
                value={intervalPosts}
                onChange={(e) => setIntervalPosts(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </label>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item, idx) => {
              const src = resolveMediaUrl(item.image_url);
              return (
                <div key={`${item.image_url}-${idx}`} className="rounded-xl border border-black p-3">
                  {src && (
                    <Image
                      src={src}
                      alt=""
                      width={400}
                      height={120}
                      className="mb-2 w-full rounded-lg object-contain"
                      unoptimized
                    />
                  )}
                  <input
                    className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
                    placeholder="링크 URL (선택)"
                    value={item.link_url ?? ""}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, link_url: e.target.value || null } : it,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-sm text-red-500"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>

          <input
            type="file"
            accept="image/*"
            disabled={saving}
            onChange={(e) => onAddImage(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </>
      )}
    </div>
  );
}
