export function buildKakaoMapUrl(lat: number, lng: number, name = "위치") {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
}

export type MapLocation = {
  lat: number;
  lng: number;
  address?: string;
  mapUrl?: string;
};
