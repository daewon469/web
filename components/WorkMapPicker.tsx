"use client";

import KakaoMapPicker from "@/components/KakaoMapPicker";
import type { MapLocation } from "@/lib/map";

type Props = {
  open: boolean;
  initial?: MapLocation | null;
  business?: MapLocation | null;
  onClose: () => void;
  onConfirm: (loc: MapLocation) => void;
};

export default function WorkMapPicker({
  open,
  initial,
  business,
  onClose,
  onConfirm,
}: Props) {
  return (
    <KakaoMapPicker
      open={open}
      variant="write"
      title="모델하우스 주소"
      initial={initial}
      sameAs={
        business
          ? {
              label: "현장사업지와 동일",
              location: business,
              missingMessage: "사업지 주소를 먼저 입력해주세요.",
            }
          : null
      }
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
