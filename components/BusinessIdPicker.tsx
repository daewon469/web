"use client";

import KakaoMapPicker from "@/components/KakaoMapPicker";
import type { MapLocation } from "@/lib/map";

type Props = {
  open: boolean;
  initial?: MapLocation | null;
  onClose: () => void;
};

export default function BusinessIdPicker({ open, initial, onClose }: Props) {
  return (
    <KakaoMapPicker
      open={open}
      variant="detail"
      title="현장사업지 주소"
      initial={initial}
      onClose={onClose}
    />
  );
}
