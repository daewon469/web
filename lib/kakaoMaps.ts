export const KAKAO_MAP_JS_KEY =
  process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? "6b463e22639b1f1c21a652838d95a99f";

export const KAKAO_MAP_SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_JS_KEY}&autoload=false&libraries=services`;

export function levelFromZoom(zoom?: number) {
  if (typeof zoom !== "number" || !Number.isFinite(zoom)) return 3;
  const level = Math.round(21 - zoom);
  return Math.min(14, Math.max(1, level));
}

export type KakaoMapsApi = {
  LatLng: new (lat: number, lng: number) => unknown;
  Map: new (
    el: HTMLElement,
    opts: { center: unknown; level: number },
  ) => {
    setCenter: (c: unknown) => void;
    setLevel: (n: number) => void;
    setDraggable: (v: boolean) => void;
    setZoomable: (v: boolean) => void;
  };
  Marker: new (opts: { position: unknown; map?: unknown }) => {
    setMap: (v: unknown) => void;
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
    Places: new () => {
      keywordSearch: (
        query: string,
        cb: (
          data: Array<{ y: string; x: string; road_address_name?: string; address_name?: string }>,
          status: string,
        ) => void,
      ) => void;
    };
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

export function loadKakaoMaps(cb: (maps: KakaoMapsApi) => void) {
  const kakao = (window as { kakao?: { maps: { load: (fn: () => void) => void } & KakaoMapsApi } })
    .kakao;
  if (!kakao?.maps?.load) return;
  kakao.maps.load(() => cb(kakao.maps as KakaoMapsApi));
}
