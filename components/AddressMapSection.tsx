"use client";

import BusinessIdPicker from "@/components/BusinessIdPicker";
import KakaoMapMini from "@/components/KakaoMapMini";
import WorkIdPicker from "@/components/WorkIdPicker";
import type { MapLocation } from "@/lib/map";
import { parseCoord } from "@/lib/kakaoMaps";
import { useMemo, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-black bg-white px-3 py-3 text-[15px] text-gray-900 outline-none";

export default function AddressMapSection({
  title,
  placeholder,
  address,
  lat,
  lng,
  pickerKind,
  showAddressInput = true,
}: {
  title: string;
  placeholder: string;
  address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  pickerKind: "work" | "business";
  showAddressInput?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const numLat = parseCoord(lat);
  const numLng = parseCoord(lng);
  const hasMap = numLat != null && numLng != null;

  const initial = useMemo<MapLocation | null>(() => {
    if (!hasMap) return null;
    return {
      lat: numLat,
      lng: numLng,
      address: address ?? undefined,
    };
  }, [address, hasMap, numLat, numLng]);

  return (
    <section className="overflow-hidden rounded-lg border border-black bg-[#f9f9f9]">
      <h2 className="px-4 pt-4 text-lg font-bold text-[#0B1B3A]">{title}</h2>
      <div className="flex flex-col gap-2 p-4">
        {showAddressInput && (
          <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
            <input
              readOnly
              tabIndex={-1}
              value={address ?? ""}
              placeholder={placeholder}
              className={`${inputClass} pointer-events-none placeholder:text-gray-500`}
            />
          </button>
        )}
        {hasMap && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block overflow-hidden rounded-xl border border-black bg-white"
          >
            <KakaoMapMini lat={numLat} lng={numLng} />
          </button>
        )}
      </div>

      {pickerKind === "work" ? (
        <WorkIdPicker open={open} initial={initial} onClose={() => setOpen(false)} />
      ) : (
        <BusinessIdPicker open={open} initial={initial} onClose={() => setOpen(false)} />
      )}
    </section>
  );
}
