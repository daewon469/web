"use client";

import KakaoMapMini from "@/components/KakaoMapMini";
import { buildKakaoMapUrl } from "@/lib/map";
import { parseCoord } from "@/lib/kakaoMaps";

const inputClass =
  "w-full rounded-xl border border-black bg-white px-3 py-3 text-[15px] text-gray-900 outline-none";

export default function AddressMapSection({
  title,
  placeholder,
  address,
  lat,
  lng,
}: {
  title: string;
  placeholder: string;
  address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
}) {
  const numLat = parseCoord(lat);
  const numLng = parseCoord(lng);
  const hasMap = numLat != null && numLng != null;
  const mapUrl = hasMap ? buildKakaoMapUrl(numLat, numLng, address || title) : null;

  return (
    <section className="overflow-hidden rounded-lg border border-black bg-[#f9f9f9]">
      <h2 className="px-4 pt-4 text-lg font-bold text-[#0B1B3A]">{title}</h2>
      <div className="flex flex-col gap-2 p-4">
        <input
          readOnly
          tabIndex={-1}
          value={address ?? ""}
          placeholder={placeholder}
          className={`${inputClass} placeholder:text-gray-500`}
        />
        {hasMap && mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-black bg-white"
          >
            <KakaoMapMini lat={numLat} lng={numLng} />
          </a>
        )}
      </div>
    </section>
  );
}
