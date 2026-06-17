"use client";

import { buildKakaoMapUrl, type MapLocation } from "@/lib/map";
import { ensureKakaoMapsSdk, levelFromZoom, loadKakaoMaps } from "@/lib/kakaoMaps";
import { useCallback, useEffect, useRef, useState } from "react";

export type KakaoMapPickerVariant = "write" | "detail";

type SameAsOption = {
  label: string;
  location?: MapLocation | null;
  missingMessage: string;
};

type Props = {
  open: boolean;
  variant?: KakaoMapPickerVariant;
  title: string;
  initial?: MapLocation | null;
  hint?: string;
  sameAs?: SameAsOption | null;
  onClose: () => void;
  onConfirm?: (loc: MapLocation) => void;
};

export default function KakaoMapPicker({
  open,
  variant = "write",
  title,
  initial,
  hint,
  sameAs,
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
  const onConfirmRef = useRef(onConfirm);
  const onCloseRef = useRef(onClose);

  const [sdkReady, setSdkReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<MapLocation | null>(initial ?? null);
  const [resolving, setResolving] = useState(false);
  const [searching, setSearching] = useState(false);

  const isWrite = variant === "write";
  const headerTitle = isWrite ? "화면 터치시 자동 입력." : "주소 검색 & 위치 선택";

  useEffect(() => {
    onConfirmRef.current = onConfirm;
    onCloseRef.current = onClose;
  }, [onConfirm, onClose]);

  const toLocation = useCallback((lat: number, lng: number, address?: string): MapLocation => {
    const addr = address?.trim() || "";
    return {
      lat,
      lng,
      address: addr || undefined,
      mapUrl: buildKakaoMapUrl(lat, lng, addr || "위치"),
    };
  }, []);

  const commitPick = useCallback(
    (loc: MapLocation | undefined, autoClose: boolean) => {
      if (!loc) return;
      if (isWrite && autoClose) {
        onConfirmRef.current?.(loc);
        onCloseRef.current();
      }
    },
    [isWrite],
  );

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
    (lat: number, lng: number, fallback = "", autoClose = false) => {
      const geocoder = geocoderRef.current;
      const maps = mapsApiRef.current;
      if (!geocoder || !maps) {
        commitPick(moveMarker(lat, lng, fallback), autoClose);
        return;
      }
      setResolving(true);
      geocoder.coord2Address(lng, lat, (result, status) => {
        setResolving(false);
        if (status !== maps.services.Status.OK || !result?.length) {
          commitPick(moveMarker(lat, lng, fallback), autoClose);
          return;
        }
        const r0 = result[0];
        const addr =
          r0.road_address?.address_name || r0.address?.address_name || fallback || "";
        commitPick(moveMarker(lat, lng, addr), autoClose);
      });
    },
    [commitPick, moveMarker],
  );

  useEffect(() => {
    if (!open) return;
    setPicked(initial ?? null);
    setQuery(initial?.address ?? "");
    setMapKey((k) => k + 1);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSdkReady(false);
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

      const map = new maps.Map(mapRef.current, {
        center,
        level: levelFromZoom(initial?.lat != null ? 15 : 8),
      });
      mapInstanceRef.current = map;
      markerRef.current = new maps.Marker({ position: center, map });
      placesRef.current = new maps.services.Places();
      if (isWrite) {
        geocoderRef.current = new maps.services.Geocoder();
      }

      if (isWrite) {
        maps.event.addListener(map, "click", (mouseEvent) => {
          const lat = mouseEvent.latLng.getLat();
          const lng = mouseEvent.latLng.getLng();
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          reverseGeocode(lat, lng, "", true);
        });
      }

      if (initial?.lat != null && initial?.lng != null) {
        moveMarker(initial.lat, initial.lng, initial.address, 15);
      }

      requestAnimationFrame(() => map.relayout());
    });
  }, [open, sdkReady, mapKey, initial, isWrite, moveMarker, reverseGeocode]);

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
      if (isWrite) {
        reverseGeocode(lat, lng, addr, true);
        return;
      }
      moveMarker(lat, lng, addr, 17);
      onCloseRef.current();
    });
  };

  const applySameAs = () => {
    const src = sameAs?.location;
    if (!src?.lat || !src?.lng || !src.address) {
      alert(sameAs?.missingMessage ?? "주소를 먼저 입력해주세요.");
      return;
    }
    const loc = moveMarker(src.lat, src.lng, src.address, 15);
    commitPick(loc, true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[210] flex flex-col bg-white">
        <div className="flex h-12 shrink-0 items-center justify-between border-b bg-[#0B1B3A] px-4">
          <span className="text-sm font-bold text-white sm:text-base">{headerTitle}</span>
          <div className="flex items-center gap-3">
            {isWrite && sameAs && (
              <button
                type="button"
                onClick={applySameAs}
                className="text-sm font-bold text-[#7eb8ff]"
              >
                {sameAs.label}
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

        {isWrite && (
          <p className="border-b px-4 py-2 text-sm text-gray-600">
            {hint ?? title}
            {resolving && " 주소 조회 중..."}
          </p>
        )}
        {picked?.address && (
          <p className="truncate border-b px-4 py-2 text-sm font-medium">{picked.address}</p>
        )}

        <div key={mapKey} ref={mapRef} className="min-h-0 flex-1" />
      </div>
  );
}
