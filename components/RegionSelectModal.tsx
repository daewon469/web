"use client";

import { PROVINCES, REGION_MAP } from "@/lib/regions";
import { useEffect, useState } from "react";

type Step = "province" | "city";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (province: string, city: string) => void;
};

export default function RegionSelectModal({ open, onClose, onSelect }: Props) {
  const [step, setStep] = useState<Step>("province");
  const [province, setProvince] = useState("전체");

  useEffect(() => {
    if (!open) {
      setStep("province");
      setProvince("전체");
    }
  }, [open]);

  if (!open) return null;

  const handleProvince = (p: string) => {
    setProvince(p);
    if (p === "전체") {
      onSelect("전체", "");
      onClose();
      return;
    }
    onSelect(p, "");
    if ((REGION_MAP[p]?.length ?? 0) > 1) {
      setStep("city");
    } else {
      onClose();
    }
  };

  const handleCity = (c: string) => {
    onSelect(province, c);
    onClose();
    setStep("province");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <button type="button" className="absolute inset-0" aria-label="닫기" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center gap-2">
          {step === "city" && (
            <button
              type="button"
              onClick={() => setStep("province")}
              className="text-lg text-black"
            >
              ←
            </button>
          )}
          <h2 className="text-base font-bold">
            {step === "province" ? "지역 선택" : "시·군·구 선택"}
          </h2>
        </div>

        {step === "province" && (
          <p className="mb-3 text-xs text-gray-600">전체 선택 시 전국 검색이 적용됩니다.</p>
        )}

        <div className="flex flex-wrap justify-between gap-y-2">
          {step === "province" &&
            PROVINCES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleProvince(p)}
                className={`w-[30%] rounded-lg border px-2 py-2.5 text-sm ${
                  province === p
                    ? "border-[#4A6CF7] bg-[#4A6CF7] font-bold text-white"
                    : "border-gray-300 text-black"
                }`}
              >
                {p}
              </button>
            ))}

          {step === "city" &&
            REGION_MAP[province]?.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCity(c)}
                className="w-[30%] rounded-lg border border-gray-300 px-2 py-2.5 text-sm text-black hover:border-[#4A6CF7] hover:bg-[#4A6CF7] hover:text-white"
              >
                {c}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
