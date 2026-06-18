"use client";

import CustomRegionMultiSelect from "@/components/CustomRegionMultiSelect";
import TableGrid from "@/components/TableGrid";
import {
  QUICK_REGION_OPTIONS,
  type QuickRegionLabel,
  type RegionObj,
  convertShortToFullProvince,
  toProvinceShort,
} from "@/lib/regionUtils";
import { useCallback, useMemo, useState } from "react";

type Props = {
  selectedRegions: RegionObj[];
  onChangeRegions: (regions: RegionObj[]) => void;
};

export default function RegionViewPanel({ selectedRegions, onChangeRegions }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const isNationwide = useMemo(
    () => (selectedRegions || []).some((r) => r.province === "전체"),
    [selectedRegions],
  );

  const selectedProvinceShorts = useMemo(() => {
    const regs = (selectedRegions || []).filter((r) => r.province !== "전체");
    return Array.from(new Set(regs.map((r) => toProvinceShort(r.province))));
  }, [selectedRegions]);

  const selectedRegionsForModal = useMemo<RegionObj[]>(() => {
    if (isNationwide) return [{ province: "전체", city: "전체" }];
    return selectedRegions.map((r) => ({
      province: toProvinceShort(r.province),
      city: r.city || "전체",
    }));
  }, [isNationwide, selectedRegions]);

  const toggleQuickRegion = useCallback(
    (label: QuickRegionLabel) => {
      if (label === "전국") {
        onChangeRegions([{ province: "전체", city: "전체" }]);
        return;
      }

      const full = convertShortToFullProvince(label);
      const regs = (selectedRegions || []).filter((r) => r.province !== "전체");
      const sameProv = regs.filter((r) => r.province === full);

      if (sameProv.length === 0) {
        onChangeRegions([...regs, { province: full, city: "전체" }]);
        return;
      }
      if (sameProv.some((r) => (r.city || "전체") === "전체")) {
        const next = regs.filter((r) => r.province !== full);
        onChangeRegions(
          next.length === 0 ? [{ province: "전체", city: "전체" }] : next,
        );
        return;
      }
      const others = regs.filter((r) => r.province !== full);
      onChangeRegions([...others, { province: full, city: "전체" }]);
    },
    [onChangeRegions, selectedRegions],
  );

  const applyRegionsFromModal = useCallback(
    (regions: RegionObj[]) => {
      const picked = (regions || []).filter(Boolean);
      const isApplyingNationwide =
        picked.length === 0 || picked.some((r) => String(r?.province ?? "").trim() === "전체");
      if (isApplyingNationwide) {
        onChangeRegions([{ province: "전체", city: "전체" }]);
        setModalOpen(false);
        return;
      }
      const mapped = picked.map((r) => ({
        province: convertShortToFullProvince(r.province),
        city: (r.city || "전체").trim() || "전체",
      }));
      onChangeRegions(mapped);
      setModalOpen(false);
    },
    [onChangeRegions],
  );

  return (
    <>
      <div className="rounded-[14px] border border-black bg-[#f9f9f9] px-1.5 pb-0.5 pt-0">
        <div className="flex min-h-[35px] items-center justify-between px-1">
          <span className="pl-2 text-base font-semibold text-black">지역 보기</span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mr-1 flex items-center text-xs font-semibold text-[#4A6CF7]"
          >
            세부보기
            <span aria-hidden className="ml-0.5">
              ›
            </span>
          </button>
        </div>
        <div className="-mt-2">
          <TableGrid
            items={QUICK_REGION_OPTIONS}
            columns={6}
            isActive={(v) =>
              v === "전국" ? isNationwide : selectedProvinceShorts.includes(v)
            }
            onToggle={(v) => toggleQuickRegion(v)}
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="닫기"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md">
            <CustomRegionMultiSelect
              selectedRegions={selectedRegionsForModal}
              onApply={applyRegionsFromModal}
              onClose={() => setModalOpen(false)}
              titleText="지역 세부보기"
              subtitleText="(복수선택 가능)"
              applyButtonText="보기"
            />
          </div>
        </div>
      )}
    </>
  );
}
