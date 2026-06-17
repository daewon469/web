"use client";

import KakaoMapMini from "@/components/KakaoMapMini";
import KakaoMapPicker from "@/components/KakaoMapPicker";
import type { MapLocation } from "@/lib/map";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-black bg-white px-3 py-3 text-left text-[15px] text-gray-900 outline-none";

export default function MapLocationField({
  label,
  placeholder = "주소 입력 또는 지도를 터치하세요",
  value,
  onChange,
  pickerHint,
  showSameAsWork = false,
  sameAsWork,
}: {
  label: string;
  placeholder?: string;
  value: MapLocation | null;
  onChange: (loc: MapLocation | null) => void;
  pickerHint?: string;
  showSameAsWork?: boolean;
  sameAsWork?: MapLocation | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p className="mb-2 text-[15px] font-bold">{label}</p>
      <button type="button" onClick={() => setOpen(true)} className="w-full">
        <input
          readOnly
          tabIndex={-1}
          value={value?.address ?? ""}
          placeholder={placeholder}
          className={`${inputClass} pointer-events-none placeholder:text-gray-500`}
        />
      </button>

      {value?.lat != null && value?.lng != null && (
        <div className="mt-2">
          <KakaoMapMini
            lat={value.lat}
            lng={value.lng}
            onClick={() => setOpen(true)}
          />
        </div>
      )}

      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-sm font-medium text-gray-500 underline"
        >
          주소 지우기
        </button>
      )}

      <KakaoMapPicker
        open={open}
        title={label}
        initial={value}
        hint={pickerHint}
        showSameAsWork={showSameAsWork}
        sameAsWork={sameAsWork}
        onClose={() => setOpen(false)}
        onConfirm={(loc) => {
          onChange(loc);
          setOpen(false);
        }}
      />
    </div>
  );
}
