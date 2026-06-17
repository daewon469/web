export function ensureKakaoMapsSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const w = window as { kakao?: { maps?: { load?: (fn: () => void) => void } } };
  if (w.kakao?.maps?.load) return Promise.resolve();

  if (ensureKakaoMapsSdk.promise) return ensureKakaoMapsSdk.promise;

  ensureKakaoMapsSdk.promise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="https://dapi.kakao.com/v2/maps/sdk.js"]`,
    );
    const script = existing ?? document.createElement("script");
    const done = () => {
      if (w.kakao?.maps?.load) resolve();
      else reject(new Error("Kakao Maps SDK failed to load"));
    };

    if (existing) {
      if (w.kakao?.maps?.load) {
        resolve();
        return;
      }
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", () => reject(new Error("Kakao Maps SDK failed to load")), {
        once: true,
      });
      return;
    }

    script.src = KAKAO_MAP_SDK_URL;
    script.async = true;
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => reject(new Error("Kakao Maps SDK failed to load")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return ensureKakaoMapsSdk.promise;
}
ensureKakaoMapsSdk.promise = null as Promise<void> | null;

export function parseCoord(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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
    relayout: () => void;
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
