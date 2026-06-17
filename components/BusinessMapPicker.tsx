"use client";

import KakaoMapPicker from "@/components/KakaoMapPicker";
import type { MapLocation } from "@/lib/map";

type Props = {
  open: boolean;
  initial?: MapLocation | null;
  work?: MapLocation | null;
  showSameAsWorkButton?: boolean;
  onClose: () => void;
  onConfirm: (loc: MapLocation) => void;
};

export default function BusinessMapPicker({
  open,
  initial,
  work,
  showSameAsWorkButton = true,
  onClose,
  onConfirm,
}: Props) {
  return (
    <KakaoMapPicker
      open={open}
      variant="write"
      title="현장사업지 주소"
      initial={initial}
      sameAs={
        showSameAsWorkButton && work
          ? {
              label: "모델하우스와 동일",
              location: work,
              missingMessage: "근무지 주소를 먼저 입력해주세요.",
            }
          : null
      }
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
