"use client";

import { UIConfig, resolveMediaUrl, type UIConfigResponse } from "@/lib/api";
import { uploadImageFile } from "@/lib/upload";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function PopupAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [widthPercent, setWidthPercent] = useState("92");
  const [height, setHeight] = useState("360");
  const [resizeMode, setResizeMode] = useState<"contain" | "cover" | "stretch">("contain");
  const [fullConfig, setFullConfig] = useState<UIConfigResponse["config"] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await UIConfig.get();
      if (res.status !== 0) {
        alert("팝업 설정을 불러올 수 없습니다.");
        return;
      }
      setFullConfig(res.config);
      const popup = res.config.popup;
      setEnabled(!!popup.enabled);
      setImageUrl(popup.image_url?.trim() || null);
      setLinkUrl(popup.link_url ?? "");
      setWidthPercent(String(popup.width_percent ?? 92));
      setHeight(String(popup.height ?? 360));
      const rm = String(popup.resize_mode ?? "contain");
      setResizeMode(rm === "cover" || rm === "stretch" ? rm : "contain");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onImage = async (file: File | null) => {
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImageFile(file);
      setImageUrl(url);
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
      const next: UIConfigResponse["config"] = {
        ...fullConfig,
        popup: {
          enabled,
          image_url: imageUrl,
          link_url: linkUrl.trim() || null,
          width_percent: Math.min(100, Math.max(40, Number(widthPercent) || 92)),
          height: Math.min(900, Math.max(200, Number(height) || 360)),
          resize_mode: resizeMode,
        },
      };
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

  const preview = resolveMediaUrl(imageUrl);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/myboard" className="text-sm text-[#4A6CF7]">
        ← 마이메뉴
      </Link>
      <h1 className="text-xl font-bold text-[#0B1B3A]">팝업 관리</h1>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}

      {!loading && (
        <>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            팝업 사용
          </label>

          <input type="file" accept="image/*" disabled={saving} onChange={(e) => onImage(e.target.files?.[0] ?? null)} />

          {preview && (
            <Image
              src={preview}
              alt=""
              width={400}
              height={360}
              className="w-full rounded-lg object-contain"
              unoptimized
            />
          )}

          <label className="flex flex-col gap-1 text-sm font-bold">
            링크 URL
            <input
              className="rounded-xl border border-black bg-[#f9f9f9] px-3 py-2"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-bold">
              너비 (%)
              <input
                className="rounded-xl border px-3 py-2"
                value={widthPercent}
                onChange={(e) => setWidthPercent(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              높이 (px)
              <input
                className="rounded-xl border px-3 py-2"
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-bold">
            이미지 맞춤
            <select
              className="rounded-xl border px-3 py-2"
              value={resizeMode}
              onChange={(e) =>
                setResizeMode(e.target.value as "contain" | "cover" | "stretch")
              }
            >
              <option value="contain">contain</option>
              <option value="cover">cover</option>
              <option value="stretch">stretch</option>
            </select>
          </label>

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
