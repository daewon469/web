"use client";

import type { MapLocation } from "@/lib/map";
import { useState } from "react";
import KakaoMapPicker from "./KakaoMapPicker";

export default function MapLocationField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MapLocation | null;
  onChange: (loc: MapLocation | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-[15px] font-bold">{label}</label>
      <div className="flex flex-col gap-2">
        <p className="min-h-[40px] rounded-xl border border-black bg-[#f9f9f9] px-3 py-2 text-sm text-gray-700">
          {value?.address || value
            ? `${value.address || "좌표 선택됨"} (${value.lat.toFixed(5)}, ${value.lng.toFixed(5)})`
            : "미설정"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex-1 rounded-xl border border-[#4A6CF7] py-2 text-sm font-bold text-[#4A6CF7]"
          >
            지도에서 선택
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
            >
              지우기
            </button>
          )}
        </div>
      </div>
      <KakaoMapPicker
        open={open}
        title={label}
        initial={value}
        onClose={() => setOpen(false)}
        onConfirm={(loc) => {
          onChange(loc);
          setOpen(false);
        }}
      />
    </div>
  );
}
