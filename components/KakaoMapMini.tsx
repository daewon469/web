"use client";

import { buildKakaoMapPreviewHtml, parseCoord } from "@/lib/kakaoMaps";
import { useMemo } from "react";

type Props = {
  lat: number | string | null | undefined;
  lng: number | string | null | undefined;
  zoom?: number;
  height?: number;
  onClick?: () => void;
};

export default function KakaoMapMini({
  lat,
  lng,
  zoom = 16,
  height = 200,
  onClick,
}: Props) {
  const numLat = parseCoord(lat);
  const numLng = parseCoord(lng);

  const html = useMemo(() => {
    if (numLat == null || numLng == null) return "";
    return buildKakaoMapPreviewHtml(numLat, numLng, zoom);
  }, [numLat, numLng, zoom]);

  if (!html) return null;

  const map = (
    <iframe
      title="카카오 지도 미리보기"
      srcDoc={html}
      className="w-full overflow-hidden rounded-xl border border-black bg-white"
      style={{ height, pointerEvents: onClick ? "none" : "auto" }}
      loading="lazy"
    />
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {map}
      </button>
    );
  }

  return map;
}
