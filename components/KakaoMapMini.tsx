"use client";

import { ensureKakaoMapsSdk, levelFromZoom, loadKakaoMaps, parseCoord } from "@/lib/kakaoMaps";
import { useEffect, useRef, useState } from "react";

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{ relayout: () => void } | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const numLat = parseCoord(lat);
  const numLng = parseCoord(lng);

  useEffect(() => {
    let cancelled = false;
    ensureKakaoMapsSdk()
      .then(() => {
        if (!cancelled) setSdkReady(true);
      })
      .catch(() => {
        if (!cancelled) setSdkReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !mapRef.current || numLat == null || numLng == null) return;

    loadKakaoMaps((maps) => {
      if (!mapRef.current) return;
      const center = new maps.LatLng(numLat, numLng);
      const map = new maps.Map(mapRef.current, {
        center,
        level: levelFromZoom(zoom),
      });
      map.setDraggable(false);
      map.setZoomable(false);
      new maps.Marker({ position: center, map });
      mapInstanceRef.current = map;

      requestAnimationFrame(() => map.relayout());
    });

    return () => {
      mapInstanceRef.current = null;
      if (mapRef.current) mapRef.current.replaceChildren();
    };
  }, [sdkReady, numLat, numLng, zoom]);

  if (numLat == null || numLng == null) return null;

  const mapBox = (
    <div
      ref={mapRef}
      className="w-full overflow-hidden rounded-xl border border-black bg-white"
      style={{ height, pointerEvents: onClick ? "none" : "auto" }}
    />
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {mapBox}
      </button>
    );
  }

  return mapBox;
}
