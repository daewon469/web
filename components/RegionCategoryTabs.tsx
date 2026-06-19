"use client";

import CategoryBarShell, { CategoryTabButton } from "@/components/CategoryBarShell";
import {
  QUICK_REGION_OPTIONS,
  type QuickRegionLabel,
  type RegionObj,
  convertShortToFullProvince,
  toProvinceShort,
} from "@/lib/regionUtils";
import { useCallback, useMemo } from "react";

type Props = {
  selectedRegions: RegionObj[];
  onChangeRegions: (regions: RegionObj[]) => void;
};

export default function RegionCategoryTabs({ selectedRegions, onChangeRegions }: Props) {
  const isNationwide = useMemo(
    () => (selectedRegions || []).some((r) => r.province === "전체"),
    [selectedRegions],
  );

  const activeProvinceShort = useMemo(() => {
    if (isNationwide) return "전국" as QuickRegionLabel;
    const first = (selectedRegions || []).find((r) => r.province !== "전체");
    if (!first) return "전국" as QuickRegionLabel;
    return toProvinceShort(first.province) as QuickRegionLabel;
  }, [isNationwide, selectedRegions]);

  const selectQuickRegion = useCallback(
    (label: QuickRegionLabel) => {
      if (label === "전국") {
        onChangeRegions([{ province: "전체", city: "전체" }]);
        return;
      }
      onChangeRegions([
        { province: convertShortToFullProvince(label), city: "전체" },
      ]);
    },
    [onChangeRegions],
  );

  return (
    <CategoryBarShell stickyTopClass="top-[6.25rem] z-40 lg:top-11">
      <div className="flex w-full overflow-x-auto">
        {QUICK_REGION_OPTIONS.map((label) => (
          <CategoryTabButton
            key={label}
            layout="auto"
            active={activeProvinceShort === label}
            label={label}
            onClick={() => selectQuickRegion(label)}
            className="[&_span]:whitespace-nowrap [&_span]:text-[13px] sm:[&_span]:text-[14px]"
          />
        ))}
      </div>
    </CategoryBarShell>
  );
}
