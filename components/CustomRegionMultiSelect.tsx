"use client";

import { PROVINCES, REGION_MAP } from "@/lib/regions";
import type { RegionObj } from "@/lib/regionUtils";
import { useEffect, useMemo, useState } from "react";

const keyOf = (r: RegionObj) => `${r.province}__${r.city}`;
const SELECTED_REGION_BG = "#EEF3FF";

const normalize = (r: RegionObj): RegionObj | null => {
  const p = (r.province || "").trim();
  const c = (r.city || "").trim() || "전체";
  if (!p) return null;
  return { province: p, city: c };
};

type Props = {
  selectedRegions: RegionObj[];
  onApply: (regions: RegionObj[]) => void | Promise<void>;
  loading?: boolean;
  onClose?: () => void;
  titleText?: string;
  subtitleText?: string;
  applyButtonText?: string;
};

export default function CustomRegionMultiSelect({
  selectedRegions,
  onApply,
  loading,
  onClose,
  titleText = "지역저장 설정",
  subtitleText = "(복수선택 가능)",
  applyButtonText,
}: Props) {
  const [localSelected, setLocalSelected] = useState<RegionObj[]>([]);
  const [activeProvince, setActiveProvince] = useState("서울");

  useEffect(() => {
    const normalized = (selectedRegions || [])
      .map((r) => normalize(r))
      .filter(Boolean) as RegionObj[];
    setLocalSelected(
      Array.from(new Map(normalized.map((r) => [keyOf(r), r] as const)).values()),
    );
  }, [selectedRegions]);

  const hasAll = localSelected.some((r) => r.province === "전체");
  const cities = REGION_MAP[activeProvince] || ["전체"];

  const provinceSelectedCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of localSelected) {
      if (!r.province) continue;
      m.set(r.province, (m.get(r.province) || 0) + 1);
    }
    return m;
  }, [localSelected]);

  const toggle = (province: string, city: string) => {
    const norm = normalize({ province, city });
    if (!norm) return;

    if (norm.province === "전체") {
      setLocalSelected(hasAll ? [] : [{ province: "전체", city: "전체" }]);
      return;
    }

    setLocalSelected((prev) => {
      const withoutAll = prev.filter((x) => x.province !== "전체");
      const sameProv = withoutAll.filter((x) => x.province === norm.province);
      const others = withoutAll.filter((x) => x.province !== norm.province);

      if (norm.city === "전체") {
        const already = sameProv.some((x) => x.city === "전체");
        return already ? others : [...others, { province: norm.province, city: "전체" }];
      }

      const filteredSame = sameProv.filter((x) => x.city !== "전체");
      const exists = filteredSame.some((x) => x.city === norm.city);
      const nextSame = exists
        ? filteredSame.filter((x) => x.city !== norm.city)
        : [...filteredSame, { province: norm.province, city: norm.city }];
      return [...others, ...nextSame];
    });
  };

  const isCityActive = (province: string, city: string) =>
    localSelected.some((r) => r.province === province && r.city === city);

  return (
    <div className="rounded-2xl border border-black bg-white p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-black text-black">{titleText}</h2>
          <span className="text-[11px] font-semibold text-gray-400">{subtitleText}</span>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="mt-0.5 text-sm font-bold text-gray-600">
            닫기
          </button>
        )}
      </div>

      <p className="mb-2 text-sm font-black text-[#111]">대분류</p>
      <div className="flex flex-wrap gap-1.5">
        {PROVINCES.map((p) => {
          const count = provinceSelectedCount.get(p) || 0;
          const active = activeProvince === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                if (p === "전체") {
                  toggle("전체", "전체");
                  return;
                }
                setActiveProvince(p);
              }}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                active || count > 0
                  ? "border-[#4A6CF7] bg-[#4A6CF7] text-white"
                  : "border-gray-300 text-black"
              }`}
            >
              {p}
              {count > 0 ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <div className="my-3 border-t border-[#d1d5db]" />

      {activeProvince !== "전체" && (
        <>
          <p className="mb-2 text-sm font-black text-[#111]">세부분류</p>
          <div className="flex flex-wrap gap-1.5">
            {cities.map((c) => {
              const active = isCityActive(activeProvince, c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(activeProvince, c)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                    active
                      ? "border-[#4A6CF7] bg-[#4A6CF7] text-white"
                      : "border-gray-300 text-black"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="my-3 border-t border-[#d1d5db]" />
        </>
      )}

      <p className="mb-2 text-sm font-black text-[#111]">선택지역</p>
      {localSelected.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-[#d8e2ff] p-2.5">
          {localSelected.map((r) => (
            <span
              key={keyOf(r)}
              className="inline-flex items-center gap-1 rounded-full border border-black px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: SELECTED_REGION_BG }}
            >
              {r.province === "전체" ? "전국" : r.city === "전체" ? r.province : `${r.province} ${r.city}`}
              <button
                type="button"
                onClick={() =>
                  setLocalSelected((prev) => prev.filter((x) => keyOf(x) !== keyOf(r)))
                }
                className="text-gray-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#d8e2ff] px-3 py-2.5 text-xs text-gray-500">
          선택된 지역이 없습니다.
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setLocalSelected([])}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-300 py-3 font-black disabled:opacity-60"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={() => onApply(localSelected)}
          disabled={loading}
          className="flex-1 rounded-xl bg-[#4A6CF7] py-3 font-black text-white disabled:opacity-60"
        >
          {loading ? "저장 중..." : applyButtonText ?? `저장 (${localSelected.length})`}
        </button>
      </div>
    </div>
  );
}
