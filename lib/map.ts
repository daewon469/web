export function buildKakaoMapUrl(lat: number, lng: number, name = "위치") {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
}

export type MapLocation = {
  lat: number;
  lng: number;
  address?: string;
  mapUrl?: string;
};

/** 구인등록 시 주소 미선택 기본값 */
export const DEFAULT_WORKPLACE_LOCATION: MapLocation = {
  lat: 37.497942,
  lng: 127.027621,
  address: "강남역",
  mapUrl: buildKakaoMapUrl(37.497942, 127.027621, "강남역"),
};

export const DEFAULT_BUSINESS_LOCATION: MapLocation = {
  lat: 37.566295,
  lng: 126.977945,
  address: "서울 시청",
  mapUrl: buildKakaoMapUrl(37.566295, 126.977945, "서울 시청"),
};

function hasMapCoords(loc: MapLocation | null | undefined) {
  return loc?.lat != null && loc?.lng != null;
}

export function resolveWorkplaceForSubmit(
  loc: MapLocation | null | undefined,
  isNewPost: boolean,
): MapLocation | null {
  if (hasMapCoords(loc)) return loc!;
  return isNewPost ? DEFAULT_WORKPLACE_LOCATION : null;
}

export function resolveBusinessForSubmit(
  loc: MapLocation | null | undefined,
  isNewPost: boolean,
): MapLocation | null {
  if (hasMapCoords(loc)) return loc!;
  return isNewPost ? DEFAULT_BUSINESS_LOCATION : null;
}
