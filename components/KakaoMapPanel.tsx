"use client";

import PostCard from "@/components/PostCard";
import { Posts, type Post } from "@/lib/api";
import { getSession } from "@/lib/session";
import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const KAKAO_KEY =
  process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? "6b463e22639b1f1c21a652838d95a99f";
const MAP_PAGE_SIZE = 500;
const MAP_CHUNK_SIZE = 100;

type MarkerMode = "workplace" | "business";

type MapMarker = {
  id: number;
  lat: number;
  lng: number;
  title: string;
  post: Post;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function KakaoMapPanel({ open, onClose }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<{
    setBounds: (b: unknown) => void;
    setCenter: (c: unknown) => void;
  } | null>(null);
  const markerObjs = useRef<{ setMap: (v: null) => void; setImage: (img: unknown) => void }[]>(
    [],
  );
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
      let nextCursor: string | undefined;
      let loaded = 0;
      const acc: Post[] = [];

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
        items.forEach((p) => {
          if (!acc.some((x) => x.id === p.id)) acc.push(p);
        });
        if (!nextCursor) break;
      }
      setMapItems(acc);
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

  const selectedPost = useMemo(
    () => (selectedId != null ? mapItems.find((p) => p.id === selectedId) ?? null : null),
    [mapItems, selectedId],
  );

  const markerKey = `${markerMode}|${markers.map((m) => `${m.id}:${m.lat},${m.lng}`).join("|")}|${selectedId}`;

  useEffect(() => {
    if (!open || !sdkReady || !mapRef.current) return;

    const kakao = (window as { kakao?: { maps: Record<string, unknown> } }).kakao;
    if (!kakao?.maps) return;

    (kakao.maps.load as (cb: () => void) => void)(() => {
      if (!mapRef.current) return;
      const maps = kakao.maps as {
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (
          el: HTMLElement,
          opts: { center: unknown; level: number },
        ) => { setBounds: (b: unknown) => void; setCenter: (c: unknown) => void };
        Marker: new (opts: {
          position: unknown;
          map: unknown;
          image?: unknown;
        }) => { setMap: (v: null) => void; setImage: (img: unknown) => void };
        MarkerImage: new (
          src: string,
          size: unknown,
          opts?: { offset: unknown },
        ) => unknown;
        Size: new (w: number, h: number) => unknown;
        Point: new (x: number, y: number) => unknown;
        LatLngBounds: new () => { extend: (ll: unknown) => void };
        event: {
          addListener: (target: unknown, type: string, cb: () => void) => void;
        };
      };

      const defaultImg = new maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
        new maps.Size(24, 35),
        { offset: new maps.Point(12, 35) },
      );
      const selectedImg = new maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
        new maps.Size(24, 35),
        { offset: new maps.Point(12, 35) },
      );

      const center =
        markers.length > 0
          ? new maps.LatLng(markers[0].lat, markers[0].lng)
          : new maps.LatLng(36.5, 127.9);

      if (!mapObj.current) {
        mapObj.current = new maps.Map(mapRef.current, {
          center,
          level: markers.length ? 8 : 12,
        });
        maps.event.addListener(mapObj.current, "click", () => setSelectedId(null));
      }

      const map = mapObj.current;
      markerObjs.current.forEach((m) => m.setMap(null));
      markerObjs.current = [];

      const bounds = new maps.LatLngBounds();
      markers.forEach((m) => {
        const pos = new maps.LatLng(m.lat, m.lng);
        const marker = new maps.Marker({
          position: pos,
          map,
          image: m.id === selectedId ? selectedImg : defaultImg,
        });
        bounds.extend(pos);
        maps.event.addListener(marker, "click", () => setSelectedId(m.id));
        markerObjs.current.push(marker);
      });

      if (markers.length > 1) map.setBounds(bounds);
      else if (markers.length === 1) map.setCenter(new maps.LatLng(markers[0].lat, markers[0].lng));
    });
  }, [open, sdkReady, markerKey, markers, selectedId]);

  useEffect(() => {
    if (!open) {
      mapObj.current = null;
      markerObjs.current = [];
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="fixed inset-0 z-[200] flex flex-col bg-white lg:left-56">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-[#0B1B3A] px-4">
          <span className="font-bold text-white">
            지도검색 ({markers.length}개 현장)
          </span>
          <button type="button" onClick={onClose} className="font-bold text-white">
            닫기
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div ref={mapRef} className="absolute inset-0" />

          {mapLoading && markers.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center bg-white/80 text-gray-600">
              전국 현장 불러오는 중...
            </p>
          )}

          {!mapLoading && markers.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center bg-white/80 text-gray-600">
              좌표가 있는 구인글이 없습니다.
            </p>
          )}

          <div className="absolute left-3 top-3 z-10 flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => {
                setMarkerMode("workplace");
                setSelectedId(null);
              }}
              className={`px-3 py-2 text-xs font-bold ${
                markerMode === "workplace"
                  ? "bg-[#4A6CF7] text-white"
                  : "bg-white text-gray-800"
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
              className={`border-l border-gray-200 px-3 py-2 text-xs font-bold ${
                markerMode === "business"
                  ? "bg-[#4A6CF7] text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              현장사업지 기준
            </button>
          </div>

          {selectedPost && (
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <div className="overflow-hidden rounded-xl border border-black bg-white shadow-lg">
                <PostCard post={selectedPost} />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-bold text-white"
                >
                  카드 닫기
                </button>
                <Link
                  href={`/${selectedPost.id}`}
                  className="rounded-lg bg-[#4A6CF7] px-4 py-2 text-sm font-bold text-white"
                >
                  상세보기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
