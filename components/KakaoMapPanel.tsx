"use client";

import type { Post } from "@/lib/api";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

const KAKAO_KEY =
  process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? "6b463e22639b1f1c21a652838d95a99f";

type Props = {
  open: boolean;
  onClose: () => void;
  posts: Post[];
};

export default function KakaoMapPanel({ open, onClose, posts }: Props) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<{ setBounds: (b: unknown) => void } | null>(null);
  const markerObjs = useRef<{ setMap: (v: null) => void }[]>([]);
  const [sdkReady, setSdkReady] = useState(false);

  const markers = useMemo(
    () =>
      posts
        .map((p) => {
          const lat = p.workplace_lat ?? p.business_lat;
          const lng = p.workplace_lng ?? p.business_lng;
          if (lat == null || lng == null) return null;
          return { id: p.id, lat, lng, title: p.title };
        })
        .filter(Boolean) as { id: number; lat: number; lng: number; title: string }[],
    [posts],
  );

  const markerKey = markers.map((m) => `${m.id}:${m.lat},${m.lng}`).join("|");

  useEffect(() => {
    if (!open || !sdkReady || !mapRef.current) return;

    const kakao = (window as { kakao?: { maps: Record<string, unknown> } }).kakao;
    if (!kakao?.maps) return;

    (kakao.maps.load as (cb: () => void) => void)(() => {
      if (!mapRef.current) return;
      const maps = kakao.maps as {
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (el: HTMLElement, opts: { center: unknown; level: number }) => {
          setBounds: (b: unknown) => void;
        };
        Marker: new (opts: { position: unknown; map: unknown }) => unknown;
        LatLngBounds: new () => { extend: (ll: unknown) => void };
        event: { addListener: (target: unknown, type: string, cb: () => void) => void };
      };

      const center =
        markers.length > 0
          ? new maps.LatLng(markers[0].lat, markers[0].lng)
          : new maps.LatLng(36.5, 127.9);

      const map = new maps.Map(mapRef.current, {
        center,
        level: markers.length ? 8 : 12,
      });
      mapObj.current = map;

      markerObjs.current.forEach((m) => m.setMap(null));
      markerObjs.current = [];

      const bounds = new maps.LatLngBounds();
      markers.forEach((m) => {
        const pos = new maps.LatLng(m.lat, m.lng);
        const marker = new maps.Marker({ position: pos, map });
        bounds.extend(pos);
        maps.event.addListener(marker, "click", () => router.push(`/${m.id}`));
        markerObjs.current.push(marker as { setMap: (v: null) => void });
      });

      if (markers.length > 1) map.setBounds(bounds);
    });
  }, [open, sdkReady, markerKey, markers, router]);

  if (!open) return null;

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="fixed inset-0 z-[200] flex flex-col bg-white">
        <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-[#0B1B3A] px-4">
          <span className="font-bold text-white">지도검색 ({markers.length}개 현장)</span>
          <button type="button" onClick={onClose} className="font-bold text-white">
            닫기
          </button>
        </div>
        <div ref={mapRef} className="relative flex-1">
          {markers.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center bg-white/90 text-gray-600">
              좌표가 있는 구인글이 없습니다.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
