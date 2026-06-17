"use client";

import KakaoMapMini from "@/components/KakaoMapMini";
import { buildKakaoMapUrl } from "@/lib/map";

export default function PostAddressMaps({
  workplaceAddress,
  workplaceLat,
  workplaceLng,
  businessAddress,
  businessLat,
  businessLng,
}: {
  workplaceAddress?: string | null;
  workplaceLat?: number | null;
  workplaceLng?: number | null;
  businessAddress?: string | null;
  businessLat?: number | null;
  businessLng?: number | null;
}) {
  const hasWork =
    workplaceLat != null && workplaceLng != null && Number.isFinite(workplaceLat);
  const hasBiz =
    businessLat != null && businessLng != null && Number.isFinite(businessLat);

  if (!hasWork && !hasBiz) return null;

  const renderBlock = (
    title: string,
    address: string | null | undefined,
    lat: number,
    lng: number,
  ) => (
    <section className="overflow-hidden rounded-xl border border-black bg-white">
      <h2 className="px-4 pt-4 text-lg font-bold text-[#0B1B3A]">{title}</h2>
      <div className="p-4">
        {address && <p className="mb-2 text-sm text-gray-700">{address}</p>}
        <KakaoMapMini lat={lat} lng={lng} />
        <a
          href={buildKakaoMapUrl(lat, lng, address || title)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-bold text-[#4A6CF7] underline"
        >
          카카오맵에서 보기
        </a>
      </div>
    </section>
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      {hasWork &&
        renderBlock("모델하우스 주소", workplaceAddress, workplaceLat!, workplaceLng!)}
      {hasBiz &&
        renderBlock("현장사업지 주소", businessAddress, businessLat!, businessLng!)}
    </div>
  );
}
