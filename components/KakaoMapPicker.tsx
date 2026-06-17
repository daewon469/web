"use client";

import { buildKakaoMapUrl, type MapLocation } from "@/lib/map";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const KAKAO_KEY =
  process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? "6b463e22639b1f1c21a652838d95a99f";

type Props = {
  open: boolean;
  title: string;
  initial?: MapLocation | null;
  onClose: () => void;
  onConfirm: (loc: MapLocation) => void;
};

export default function KakaoMapPicker({ open, title, initial, onClose, onConfirm }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<{ setMap: (v: null) => void; setPosition: (p: unknown) => void } | null>(
    null,
  );
  const [sdkReady, setSdkReady] = useState(false);
  const [picked, setPicked] = useState<MapLocation | null>(initial ?? null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (open) setPicked(initial ?? null);
  }, [open, initial]);

  useEffect(() => {
    if (!open || !sdkReady || !mapRef.current) return;

    const kakao = (window as { kakao?: { maps: Record<string, unknown> } }).kakao;
    if (!kakao?.maps) return;

    (kakao.maps.load as (cb: () => void) => void)(() => {
      if (!mapRef.current) return;
      const maps = kakao.maps as {
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (el: HTMLElement, opts: { center: unknown; level: number }) => unknown;
        Marker: new (opts: { position: unknown; map: unknown }) => {
          setMap: (v: null) => void;
          setPosition: (p: unknown) => void;
        };
        event: {
          addListener: (
            target: unknown,
            type: string,
            cb: (e: { latLng: { getLat: () => number; getLng: () => number } }) => void,
          ) => void;
        };
        services: {
          Geocoder: new () => {
            coord2Address: (
              lng: number,
              lat: number,
              cb: (
                result: Array<{
                  road_address?: { address_name: string };
                  address?: { address_name: string };
                }>,
                status: string,
              ) => void,
            ) => void;
          };
          Status: { OK: string };
        };
      };

      const start = initial
        ? new maps.LatLng(initial.lat, initial.lng)
        : new maps.LatLng(37.5665, 126.978);

      const map = new maps.Map(mapRef.current, { center: start, level: 4 });

      const placeMarker = (lat: number, lng: number, address?: string) => {
        const pos = new maps.LatLng(lat, lng);
        if (markerRef.current) {
          markerRef.current.setPosition(pos);
        } else {
          markerRef.current = new maps.Marker({ position: pos, map });
        }
        setPicked({
          lat,
          lng,
          address,
          mapUrl: buildKakaoMapUrl(lat, lng, address || "위치"),
        });
      };

      if (initial) placeMarker(initial.lat, initial.lng, initial.address);

      maps.event.addListener(map, "click", (mouseEvent) => {
        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();
        setResolving(true);
        placeMarker(lat, lng);
        try {
          const geocoder = new maps.services.Geocoder();
          geocoder.coord2Address(lng, lat, (result, status) => {
            setResolving(false);
            if (status !== maps.services.Status.OK || !result[0]) return;
            const addr =
              result[0].road_address?.address_name || result[0].address?.address_name || "";
            placeMarker(lat, lng, addr);
          });
        } catch {
          setResolving(false);
        }
      });
    });
  }, [open, sdkReady, initial]);

  if (!open) return null;

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="fixed inset-0 z-[210] flex flex-col bg-white">
        <div className="flex h-12 items-center justify-between border-b bg-[#0B1B3A] px-4">
          <span className="font-bold text-white">{title}</span>
          <button type="button" onClick={onClose} className="font-bold text-white">
            닫기
          </button>
        </div>
        <p className="border-b px-4 py-2 text-sm text-gray-600">
          지도를 탭해 위치를 선택하세요.
          {resolving && " 주소 조회 중..."}
        </p>
        {picked?.address && (
          <p className="truncate border-b px-4 py-2 text-sm font-medium">{picked.address}</p>
        )}
        <div ref={mapRef} className="flex-1" />
        <div className="flex gap-2 border-t p-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-3 font-bold">
            취소
          </button>
          <button
            type="button"
            disabled={!picked}
            onClick={() => picked && onConfirm(picked)}
            className="flex-1 rounded-xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-50"
          >
            확인
          </button>
        </div>
      </div>
    </>
  );
}
