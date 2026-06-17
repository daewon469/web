"use client";

import BusinessMapPicker from "@/components/BusinessMapPicker";
import KakaoMapMini from "@/components/KakaoMapMini";
import WorkMapPicker from "@/components/WorkMapPicker";
import type { MapLocation } from "@/lib/map";
import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-black bg-white px-3 py-3 text-left text-[15px] text-gray-900 outline-none";

export default function MapLocationField({
  label,
  placeholder = "주소 입력 또는 지도를 터치하세요",
  value,
  onChange,
  pickerKind,
  peerLocation,
  showSameAsPeer = false,
}: {
  label: string;
  placeholder?: string;
  value: MapLocation | null;
  onChange: (loc: MapLocation | null) => void;
  pickerKind: "work" | "business";
  peerLocation?: MapLocation | null;
  showSameAsPeer?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const initial = value;
  const handleConfirm = (loc: MapLocation) => {
    onChange(loc);
    setOpen(false);
  };

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
          <KakaoMapMini lat={value.lat} lng={value.lng} onClick={() => setOpen(true)} />
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

      {pickerKind === "work" ? (
        <WorkMapPicker
          open={open}
          initial={initial}
          business={peerLocation}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      ) : (
        <BusinessMapPicker
          open={open}
          initial={initial}
          work={peerLocation}
          showSameAsWorkButton={showSameAsPeer}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
