"use client";

import { buildKakaoMapUrl, type MapLocation } from "@/lib/map";
import { KAKAO_MAP_SDK_URL, levelFromZoom, loadKakaoMaps } from "@/lib/kakaoMaps";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  initial?: MapLocation | null;
  hint?: string;
  showSameAsWork?: boolean;
  sameAsWork?: MapLocation | null;
  onClose: () => void;
  onConfirm: (loc: MapLocation) => void;
};

export default function KakaoMapPicker({
  open,
  title,
  initial,
  hint = "주소를 검색하거나 지도를 터치해 위치를 선택하세요.",
  showSameAsWork = false,
  sameAsWork,
  onClose,
  onConfirm,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<{
    setCenter: (c: unknown) => void;
    setLevel: (n: number) => void;
  } | null>(null);
  const markerRef = useRef<{ setPosition: (p: unknown) => void } | null>(null);
  const mapsApiRef = useRef<import("@/lib/kakaoMaps").KakaoMapsApi | null>(null);
  const placesRef = useRef<InstanceType<
    import("@/lib/kakaoMaps").KakaoMapsApi["services"]["Places"]
  > | null>(null);
  const geocoderRef = useRef<InstanceType<
    import("@/lib/kakaoMaps").KakaoMapsApi["services"]["Geocoder"]
  > | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<MapLocation | null>(initial ?? null);
  const [resolving, setResolving] = useState(false);
  const [searching, setSearching] = useState(false);

  const toLocation = useCallback((lat: number, lng: number, address?: string): MapLocation => {
    const addr = address?.trim() || "";
    return {
      lat,
      lng,
      address: addr || undefined,
      mapUrl: buildKakaoMapUrl(lat, lng, addr || "위치"),
    };
  }, []);

  const moveMarker = useCallback(
    (lat: number, lng: number, address?: string, zoom = 17) => {
      const maps = mapsApiRef.current;
      const map = mapInstanceRef.current;
      if (!maps || !map) return;
      const pos = new maps.LatLng(lat, lng);
      if (markerRef.current) markerRef.current.setPosition(pos);
      map.setCenter(pos);
      map.setLevel(levelFromZoom(zoom));
      const loc = toLocation(lat, lng, address);
      setPicked(loc);
      if (address) setQuery(address);
      return loc;
    },
    [toLocation],
  );

  const reverseGeocode = useCallback(
    (lat: number, lng: number, fallback = "") => {
      const geocoder = geocoderRef.current;
      const maps = mapsApiRef.current;
      if (!geocoder || !maps) {
        moveMarker(lat, lng, fallback);
        return;
      }
      setResolving(true);
      geocoder.coord2Address(lng, lat, (result, status) => {
        setResolving(false);
        if (status !== maps.services.Status.OK || !result?.length) {
          moveMarker(lat, lng, fallback);
          return;
        }
        const r0 = result[0];
        const addr =
          r0.road_address?.address_name || r0.address?.address_name || fallback || "";
        moveMarker(lat, lng, addr);
      });
    },
    [moveMarker],
  );

  useEffect(() => {
    if (!open) return;
    setPicked(initial ?? null);
    setQuery(initial?.address ?? "");
  }, [open, initial]);

  useEffect(() => {
    if (!open) {
      mapInstanceRef.current = null;
      markerRef.current = null;
      mapsApiRef.current = null;
      placesRef.current = null;
      geocoderRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !sdkReady || !mapRef.current) return;

    loadKakaoMaps((maps) => {
      if (!mapRef.current) return;
      mapsApiRef.current = maps;

      const startLat = initial?.lat ?? 37.5665;
      const startLng = initial?.lng ?? 126.978;
      const center = new maps.LatLng(startLat, startLng);

      if (!mapInstanceRef.current) {
        const map = new maps.Map(mapRef.current, {
          center,
          level: levelFromZoom(initial ? 16 : 8),
        });
        mapInstanceRef.current = map;
        markerRef.current = new maps.Marker({ position: center, map });
        placesRef.current = new maps.services.Places();
        geocoderRef.current = new maps.services.Geocoder();

        maps.event.addListener(map, "click", (mouseEvent) => {
          const lat = mouseEvent.latLng.getLat();
          const lng = mouseEvent.latLng.getLng();
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          moveMarker(lat, lng);
          reverseGeocode(lat, lng);
        });
      }

      if (initial) {
        moveMarker(initial.lat, initial.lng, initial.address, 16);
      }
    });
  }, [open, sdkReady, initial, moveMarker, reverseGeocode]);

  const runSearch = () => {
    const q = query.trim();
    if (!q) {
      alert("주소를 입력하세요.");
      return;
    }
    const places = placesRef.current;
    const maps = mapsApiRef.current;
    if (!places || !maps) return;

    setSearching(true);
    places.keywordSearch(q, (data, status) => {
      setSearching(false);
      if (status !== maps.services.Status.OK || !data?.length) {
        alert("검색 결과가 없습니다.");
        return;
      }
      const p = data[0];
      const lat = Number(p.y);
      const lng = Number(p.x);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        alert("좌표를 확인할 수 없습니다.");
        return;
      }
      const addr = p.road_address_name || p.address_name || q;
      moveMarker(lat, lng, addr, 17);
      reverseGeocode(lat, lng, addr);
    });
  };

  const applySameAsWork = () => {
    if (!sameAsWork?.lat || !sameAsWork?.lng) {
      alert("모델하우스 주소를 먼저 입력해주세요.");
      return;
    }
    const loc = moveMarker(
      sameAsWork.lat,
      sameAsWork.lng,
      sameAsWork.address,
      15,
    );
    if (loc) onConfirm(loc);
  };

  if (!open) return null;

  return (
    <>
      <Script
        src={KAKAO_MAP_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="fixed inset-0 z-[210] flex flex-col bg-white lg:left-56">
        <div className="flex h-12 shrink-0 items-center justify-between border-b bg-[#0B1B3A] px-4">
          <span className="font-bold text-white">{title}</span>
          <div className="flex items-center gap-3">
            {showSameAsWork && (
              <button
                type="button"
                onClick={applySameAsWork}
                className="text-sm font-bold text-[#7eb8ff]"
              >
                모델하우스와 동일
              </button>
            )}
            <button type="button" onClick={onClose} className="font-bold text-white">
              닫기
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b p-3">
          <input
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4A6CF7]"
            placeholder="주소를 입력하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={searching}
            className="rounded-xl bg-[#1ec800] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {searching ? "검색중" : "검색"}
          </button>
        </div>

        <p className="border-b px-4 py-2 text-sm text-gray-600">
          {hint}
          {resolving && " 주소 조회 중..."}
        </p>
        {picked?.address && (
          <p className="truncate border-b px-4 py-2 text-sm font-medium">{picked.address}</p>
        )}

        <div ref={mapRef} className="min-h-0 flex-1" />

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
