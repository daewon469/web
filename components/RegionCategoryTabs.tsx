"use client";

import CustomRegionMultiSelect from "@/components/CustomRegionMultiSelect";
import CategoryBarShell, { CategoryTabButton } from "@/components/CategoryBarShell";
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

export default function RegionCategoryTabs({ selectedRegions, onChangeRegions }: Props) {
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
      <CategoryBarShell stickyTopClass="top-[6.25rem] z-40 lg:top-11">
        <div className="flex w-full overflow-x-auto">
          {QUICK_REGION_OPTIONS.map((label) => (
            <CategoryTabButton
              key={label}
              layout="auto"
              active={label === "전국" ? isNationwide : selectedProvinceShorts.includes(label)}
              label={label}
              onClick={() => toggleQuickRegion(label)}
              className="[&_span]:whitespace-nowrap [&_span]:text-[13px] sm:[&_span]:text-[14px]"
            />
          ))}
          <CategoryTabButton
            layout="auto"
            active={false}
            label="세부보기"
            accent
            onClick={() => setModalOpen(true)}
            className="[&_span]:whitespace-nowrap [&_span]:text-[13px] sm:[&_span]:text-[14px]"
          />
        </div>
      </CategoryBarShell>

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
