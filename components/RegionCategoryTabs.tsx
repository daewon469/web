"use client";

import CategoryBarShell, { CategoryTabButton } from "@/components/CategoryBarShell";
import CustomRegionMultiSelect from "@/components/CustomRegionMultiSelect";
import {
  QUICK_REGION_OPTIONS,
  type QuickRegionLabel,
  type RegionObj,
  convertShortToFullProvince,
  toProvinceShort,
} from "@/lib/regionUtils";
import { Fragment, useCallback, useMemo, useState } from "react";

type Props = {
  selectedRegions: RegionObj[];
  onChangeRegions: (regions: RegionObj[]) => void;
};

/** 이 라벨 뒤에 슬래시(/) 구분선 표시 */
const SLASH_AFTER = new Set<QuickRegionLabel>(["제주", "세종"]);

export default function RegionCategoryTabs({ selectedRegions, onChangeRegions }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

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

  const selectedRegionsForModal = useMemo<RegionObj[]>(() => {
    if (isNationwide) return [{ province: "전체", city: "전체" }];
    return selectedRegions.map((r) => ({
      province: toProvinceShort(r.province),
      city: r.city || "전체",
    }));
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

  const applyRegionsFromModal = useCallback(
    (regions: RegionObj[]) => {
      const picked = (regions || []).filter(Boolean);
      const isApplyingNationwide =
        picked.length === 0 ||
        picked.some((r) => String(r?.province ?? "").trim() === "전체");
      if (isApplyingNationwide) {
        onChangeRegions([{ province: "전체", city: "전체" }]);
        setModalOpen(false);
        return;
      }
      onChangeRegions(
        picked.map((r) => ({
          province: convertShortToFullProvince(r.province),
          city: (r.city || "전체").trim() || "전체",
        })),
      );
      setModalOpen(false);
    },
    [onChangeRegions],
  );

  return (
    <>
      <CategoryBarShell sticky={false}>
        {QUICK_REGION_OPTIONS.map((label) => (
          <Fragment key={label}>
            <CategoryTabButton
              active={activeProvinceShort === label}
              label={label}
              onClick={() => selectQuickRegion(label)}
              className="min-w-0 px-0 [&_span]:whitespace-nowrap [&_span]:text-[11px] sm:[&_span]:text-[14px]"
            />
            {SLASH_AFTER.has(label) ? (
              <span
                aria-hidden
                className="shrink-0 select-none px-0.5 text-[11px] font-medium text-[#999] sm:text-[14px]"
              >
                /
              </span>
            ) : null}
          </Fragment>
        ))}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 whitespace-nowrap px-1.5 py-2.5 text-[11px] font-semibold text-[#4A6CF7] sm:px-2 sm:text-[13px]"
        >
          세부보기&gt;
        </button>
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
