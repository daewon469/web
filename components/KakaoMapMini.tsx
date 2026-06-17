"use client";

import { KAKAO_MAP_SDK_URL, levelFromZoom, loadKakaoMaps } from "@/lib/kakaoMaps";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
  onClick?: () => void;
};

export default function KakaoMapMini({ lat, lng, zoom = 16, height = 200, onClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;
    loadKakaoMaps((maps) => {
      if (!mapRef.current) return;
      const center = new maps.LatLng(lat, lng);
      const map = new maps.Map(mapRef.current, {
        center,
        level: levelFromZoom(zoom),
      });
      map.setDraggable(false);
      map.setZoomable(false);
      const marker = new maps.Marker({ position: center, map });
      marker.setMap(map);
    });
  }, [sdkReady, lat, lng, zoom]);

  const inner = (
    <div
      ref={mapRef}
      className="w-full overflow-hidden rounded-xl border border-black bg-white"
      style={{ height }}
    />
  );

  return (
    <>
      <Script
        src={KAKAO_MAP_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      {onClick ? (
        <button type="button" onClick={onClick} className="block w-full text-left">
          {inner}
        </button>
      ) : (
        inner
      )}
    </>
  );
}
