"use client";

import PostCard from "@/components/PostCard";
import { Posts, type Post } from "@/lib/api";
import { getSession } from "@/lib/session";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { KAKAO_MAP_SDK_URL } from "@/lib/kakaoMaps";

const MAP_PAGE_SIZE = 500;
const MAP_CHUNK_SIZE = 100;

const SEL_DOT_HTML =
  '<div style="width:12px;height:12px;border-radius:999px;background:rgba(239,68,68,0.98);' +
  "box-shadow:0 0 0 2px rgba(255,255,255,0.95),0 6px 18px rgba(0,0,0,0.28);" +
  'transform:translate(0.8px,-21px);"></div>';

type MarkerMode = "workplace" | "business";

type MapMarker = {
  id: number;
  lat: number;
  lng: number;
  title: string;
  post: Post;
};

type KakaoMapsLite = {
  LatLng: new (lat: number, lng: number) => unknown;
  Map: new (
    el: HTMLElement,
    opts: { center: unknown; level: number },
  ) => {
    setBounds: (b: unknown) => void;
    setCenter: (c: unknown) => void;
    setLevel: (n: number) => void;
    relayout: () => void;
  };
  Marker: new (opts: { position: unknown; map?: unknown }) => { setMap: (v: unknown) => void };
  CustomOverlay: new (opts: {
    position: unknown;
    content: string;
    xAnchor: number;
    yAnchor: number;
    zIndex: number;
  }) => { setMap: (v: unknown) => void };
  LatLngBounds: new () => { extend: (ll: unknown) => void };
  event: {
    addListener: (target: unknown, type: string, cb: () => void) => void;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
};

function buildMarkerSignature(mode: MarkerMode, list: MapMarker[]) {
  return `${mode}|${list.map((m) => `${m.id}@${m.lat},${m.lng}`).join("|")}`;
}

export default function KakaoMapPanel({ open, onClose }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<InstanceType<KakaoMapsLite["Map"]> | null>(null);
  const mapsApiRef = useRef<KakaoMapsLite | null>(null);
  const markerObjs = useRef<InstanceType<KakaoMapsLite["Marker"]>[]>([]);
  const overlayObjs = useRef<InstanceType<KakaoMapsLite["CustomOverlay"]>[]>([]);
  const lastMarkerSignature = useRef("");
  const suppressMapClickRef = useRef(false);
  const selectedIdRef = useRef<number | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [mapItems, setMapItems] = useState<Post[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [markerMode, setMarkerMode] = useState<MarkerMode>("workplace");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const loadingRef = useRef(false);

  const loadNationwideForMap = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setMapLoading(true);
    try {
      const { username } = getSession();
      setMapItems([]);
      let nextCursor: string | undefined;
      let loaded = 0;

      while (loaded < MAP_PAGE_SIZE) {
        const { items, next_cursor } = await Posts.list({
          username: username ?? undefined,
          cursor: nextCursor,
          status: "published",
          limit: Math.min(MAP_CHUNK_SIZE, MAP_PAGE_SIZE - loaded),
        });
        if (!items.length) break;
        loaded += items.length;
        nextCursor = next_cursor;

        setMapItems((prev) => {
          const byId = new Map<number, Post>();
          [...prev, ...items].forEach((p) => byId.set(p.id, p));
          return Array.from(byId.values());
        });

        if (!nextCursor) break;
      }
    } catch {
      setMapItems([]);
    } finally {
      loadingRef.current = false;
      setMapLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    if (mapItems.length === 0) loadNationwideForMap();
  }, [open, mapItems.length, loadNationwideForMap]);

  const markerCounts = useMemo(() => {
    const business = mapItems.filter((p) => p.business_lat && p.business_lng).length;
    const workplace = mapItems.filter((p) => p.workplace_lat && p.workplace_lng).length;
    return { business, workplace };
  }, [mapItems]);

  useEffect(() => {
    if (!open) return;
    if (markerMode === "business" && markerCounts.business === 0 && markerCounts.workplace > 0) {
      setMarkerMode("workplace");
      return;
    }
    if (markerMode === "workplace" && markerCounts.workplace === 0 && markerCounts.business > 0) {
      setMarkerMode("business");
    }
  }, [open, markerMode, markerCounts.business, markerCounts.workplace]);

  const markers = useMemo(() => {
    const isBiz = markerMode === "business";
    return mapItems
      .map((post) => {
        const lat = isBiz ? post.business_lat : post.workplace_lat;
        const lng = isBiz ? post.business_lng : post.workplace_lng;
        if (lat == null || lng == null) return null;
        return { id: post.id, lat, lng, title: post.title, post };
      })
      .filter(Boolean) as MapMarker[];
  }, [mapItems, markerMode]);

  const markerSignature = useMemo(
    () => buildMarkerSignature(markerMode, markers),
    [markerMode, markers],
  );

  const selectedPost = useMemo(
    () => (selectedId != null ? mapItems.find((p) => p.id === selectedId) ?? null : null),
    [mapItems, selectedId],
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const clearMarkers = useCallback(() => {
    markerObjs.current.forEach((m) => m.setMap(null));
    markerObjs.current = [];
    overlayObjs.current.forEach((o) => o.setMap(null));
    overlayObjs.current = [];
    lastMarkerSignature.current = "";
  }, []);

  const updateSelectionOverlays = useCallback(
    (list: MapMarker[], selected: number | null) => {
      const maps = mapsApiRef.current;
      const map = mapObj.current;
      if (!maps || !map) return;

      overlayObjs.current.forEach((o) => o.setMap(null));
      overlayObjs.current = [];

      list.forEach((m) => {
        if (m.id !== selected) return;
        const pos = new maps.LatLng(m.lat, m.lng);
        const overlay = new maps.CustomOverlay({
          position: pos,
          content: SEL_DOT_HTML,
          xAnchor: 0.5,
          yAnchor: 1.0,
          zIndex: 10,
        });
        overlay.setMap(map);
        overlayObjs.current.push(overlay);
      });
    },
    [],
  );

  const renderMarkers = useCallback(
    (list: MapMarker[], selected: number | null) => {
      const maps = mapsApiRef.current;
      const map = mapObj.current;
      if (!maps || !map || list.length === 0) return;

      const sig = buildMarkerSignature(markerMode, list);
      const sameSignature =
        sig === lastMarkerSignature.current && markerObjs.current.length === list.length;

      if (sameSignature) {
        updateSelectionOverlays(list, selected);
        return;
      }

      clearMarkers();

      const bounds = new maps.LatLngBounds();
      list.forEach((m) => {
        const pos = new maps.LatLng(m.lat, m.lng);
        const marker = new maps.Marker({ position: pos });
        marker.setMap(map);
        maps.event.addListener(marker, "click", () => {
          suppressMapClickRef.current = true;
          setTimeout(() => {
            suppressMapClickRef.current = false;
          }, 0);
          setSelectedId(m.id);
        });
        markerObjs.current.push(marker);
        bounds.extend(pos);
      });

      updateSelectionOverlays(list, selected);
      lastMarkerSignature.current = sig;

      if (list.length === 1) {
        map.setCenter(new maps.LatLng(list[0].lat, list[0].lng));
        map.setLevel(4);
      } else {
        map.setBounds(bounds);
      }
    },
    [clearMarkers, markerMode, updateSelectionOverlays],
  );

  useEffect(() => {
    if (!open || !sdkReady || !mapRef.current) return;

    const kakao = (window as { kakao?: { maps: KakaoMapsLite & { load: (cb: () => void) => void } } })
      .kakao;
    if (!kakao?.maps?.load) return;

    kakao.maps.load(() => {
      if (!mapRef.current) return;
      mapsApiRef.current = kakao.maps;

      if (!mapObj.current) {
        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(36.5, 127.9),
          level: 7,
        });
        mapObj.current = map;
        kakao.maps.event.addListener(map, "click", () => {
          if (suppressMapClickRef.current) {
            suppressMapClickRef.current = false;
            return;
          }
          setSelectedId(null);
        });
        requestAnimationFrame(() => map.relayout());
      }

      if (markers.length > 0) {
        renderMarkers(markers, selectedIdRef.current);
      } else {
        clearMarkers();
      }
    });
  }, [open, sdkReady, markerSignature, markers, renderMarkers, clearMarkers]);

  useEffect(() => {
    if (!open || !sdkReady || !mapObj.current || markers.length === 0) return;
    updateSelectionOverlays(markers, selectedId);
  }, [open, sdkReady, selectedId, markers, updateSelectionOverlays]);

  useEffect(() => {
    if (!open) {
      mapObj.current = null;
      mapsApiRef.current = null;
      clearMarkers();
    }
  }, [open, clearMarkers]);

  if (!open) return null;

  return (
    <>
      <Script
        src={KAKAO_MAP_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:left-56">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-[#0B1B3A] px-4">
          <span className="font-bold text-white">지도검색</span>
          <button type="button" onClick={onClose} className="font-bold text-white">
            닫기
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div ref={mapRef} className="absolute inset-0" />

          {mapLoading && mapItems.length === 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-[18px] z-10 flex justify-center">
              <div
                className="h-6 w-6 animate-spin rounded-full border-2 border-[#2F6BFF] border-t-transparent"
                aria-label="전국 현장 불러오는 중"
              />
            </div>
          )}

          <div className="absolute left-3 top-3 z-10 flex overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => {
                setMarkerMode("workplace");
                setSelectedId(null);
              }}
              className={`px-3 py-2.5 text-[13px] font-black ${
                markerMode === "workplace"
                  ? "bg-[#2F6BFF] text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              모델하우스 기준
            </button>
            <button
              type="button"
              onClick={() => {
                setMarkerMode("business");
                setSelectedId(null);
              }}
              className={`border-l border-gray-200 px-3 py-2.5 text-[13px] font-black ${
                markerMode === "business"
                  ? "bg-[#2F6BFF] text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              현장사업지 기준
            </button>
          </div>

          {selectedPost && (
            <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 z-10">
              <div className="pointer-events-auto overflow-hidden rounded-xl border border-black bg-white">
                <PostCard post={selectedPost} />
              </div>
              <div className="pointer-events-auto mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="mr-1.5 rounded-[10px] bg-[#2F6BFF] px-3.5 py-2.5 text-sm font-black text-white"
                >
                  카드 닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
