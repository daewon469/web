"use client";

import { UIConfig, resolveMediaUrl, type UIConfigBannerItem, type UIConfigResponse } from "@/lib/api";
import { uploadImageFile } from "@/lib/upload";
import type { WebBannerRotation } from "@/lib/webBannerUtils";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type BannerKey = "web_top_banner" | "web_banner";

const COLS_PER_ROW = 3;

export default function WebBannerAdminClient({
  bannerKey,
  title,
}: {
  bannerKey: BannerKey;
  title: string;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [rotationCount, setRotationCount] = useState<WebBannerRotation>(3);
  const [intervalRows, setIntervalRows] = useState<WebBannerRotation>(3);
  const [autoPlayMs, setAutoPlayMs] = useState("4000");
  const [items, setItems] = useState<UIConfigBannerItem[]>([]);
  const [fullConfig, setFullConfig] = useState<UIConfigResponse["config"] | null>(null);

  const maxItems = rotationCount * COLS_PER_ROW;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await UIConfig.get();
      if (res.status !== 0) {
        alert("설정을 불러올 수 없습니다.");
        return;
      }
      setFullConfig(res.config);
      const section =
        bannerKey === "web_top_banner" ? res.config.web_top_banner : res.config.web_banner;
      setEnabled(section?.enabled !== false);
      setRotationCount(section?.rotation_count === 5 ? 5 : 3);
      if (bannerKey === "web_banner") {
        setIntervalRows(section?.interval_rows === 5 ? 5 : 3);
      }
      if (bannerKey === "web_top_banner") {
        setAutoPlayMs(String(section?.auto_play_ms ?? 4000));
      }
      setItems((section?.items ?? []).filter((it) => String(it.image_url ?? "").trim()));
    } finally {
      setLoading(false);
    }
  }, [bannerKey]);

  useEffect(() => {
    load();
  }, [load]);

  const onAddImage = async (file: File | null) => {
    if (!file) return;
    if (items.length >= maxItems) {
      alert(`최대 ${maxItems}개(회전 ${rotationCount} × 3열)까지 등록할 수 있습니다.`);
      return;
    }
    try {
      setSaving(true);
      const url = await uploadImageFile(file);
      setItems((prev) => [
        ...prev,
        {
          image_url: url,
          link_url: null,
          click_action: "link",
          height: 160,
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
      const trimmed = items.slice(0, maxItems);
      const base = {
        enabled,
        items: trimmed,
        cols_per_row: COLS_PER_ROW,
        rotation_count: rotationCount,
        height: 160,
        resize_mode: "contain" as const,
      };
      if (bannerKey === "web_top_banner") {
        next.web_top_banner = {
          ...(next.web_top_banner ?? { items: [] }),
          ...base,
          auto_play_ms: Number(autoPlayMs) || 0,
        };
      } else {
        next.web_banner = {
          ...(next.web_banner ?? { items: [] }),
          ...base,
          interval_rows: intervalRows,
        };
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
      <h1 className="text-xl font-bold text-[#0B1B3A]">{title}</h1>
      <p className="text-sm text-[#666]">
        웹 홈 전용입니다. 1행에 3개씩 표시되며, 회전 수·삽입 간격을 선택할 수 있습니다.
      </p>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}

      {!loading && (
        <>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            배너 사용
          </label>

          <label className="flex flex-col gap-1 text-sm font-bold">
            회전 수 (1행 3개 × N회전)
            <select
              className="rounded-xl border border-black bg-[#f9f9f9] px-3 py-2"
              value={rotationCount}
              onChange={(e) => {
                const next = e.target.value === "5" ? 5 : 3;
                setRotationCount(next);
                setItems((prev) => prev.slice(0, next * COLS_PER_ROW));
              }}
            >
              <option value={3}>3회전 (최대 9개)</option>
              <option value={5}>5회전 (최대 15개)</option>
            </select>
          </label>

          {bannerKey === "web_banner" && (
            <label className="flex flex-col gap-1 text-sm font-bold">
              피드 삽입 간격 (N줄마다 1행 배너)
              <select
                className="rounded-xl border border-black bg-[#f9f9f9] px-3 py-2"
                value={intervalRows}
                onChange={(e) => setIntervalRows(e.target.value === "5" ? 5 : 3)}
              >
                <option value={3}>3줄마다</option>
                <option value={5}>5줄마다</option>
              </select>
            </label>
          )}

          {bannerKey === "web_top_banner" && (
            <label className="flex flex-col gap-1 text-sm font-bold">
              자동 회전 간격(ms, 0=끔)
              <input
                className="rounded-xl border border-black bg-[#f9f9f9] px-3 py-2"
                value={autoPlayMs}
                onChange={(e) => setAutoPlayMs(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </label>
          )}

          <p className="text-xs text-[#666]">
            등록 {items.length} / {maxItems} (행 단위: 3개씩 채워짐)
          </p>

          <div className="flex flex-col gap-3">
            {items.map((item, idx) => {
              const src = resolveMediaUrl(item.image_url);
              const rowNo = Math.floor(idx / COLS_PER_ROW) + 1;
              const colNo = (idx % COLS_PER_ROW) + 1;
              return (
                <div key={`${item.image_url}-${idx}`} className="rounded-xl border border-black p-3">
                  <p className="mb-2 text-xs font-bold text-[#4A6CF7]">
                    {rowNo}행 {colNo}열
                  </p>
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
            disabled={saving || items.length >= maxItems}
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
