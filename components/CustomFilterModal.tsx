"use client";

import TableGrid from "@/components/TableGrid";
import { useEffect, useMemo, useState } from "react";

export type CustomFilterValue = {
  provinces: string[];
  industries: string[];
  roles: string[];
};

type Props = {
  open: boolean;
  value: CustomFilterValue;
  onClose: () => void;
  onApply: (value: CustomFilterValue) => void;
};

const ROLE_OPTIONS = ["총괄", "본부장", "팀장", "팀원", "기타"] as const;
const REGION_OPTIONS = [
  "전국",
  "서울",
  "경기",
  "인천",
  "강원",
  "제주",
  "부산",
  "울산",
  "대구",
  "광주",
  "대전",
  "세종",
  "경남",
  "경북",
  "전남",
  "전북",
  "충남",
  "충북",
] as const;
const INDUSTRY_OPTIONS = [
  "아파트",
  "상가",
  "오피스",
  "오피스텔",
  "도시형생활주택",
  "레지던스",
  "호텔",
  "리조트",
  "지식산업센터",
  "타운하우스",
  "토지",
  "기타",
] as const;

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export default function CustomFilterModal({ open, value, onClose, onApply }: Props) {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setProvinces(uniq((value?.provinces || []).map((s) => String(s ?? "").trim()).filter(Boolean)));
    setIndustries(uniq((value?.industries || []).map((s) => String(s ?? "").trim()).filter(Boolean)));
    setRoles(uniq((value?.roles || []).map((s) => String(s ?? "").trim()).filter(Boolean)));
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const hasNationwide = useMemo(() => provinces.includes("전체"), [provinces]);
  const selectedProvinces = useMemo(() => provinces.filter((p) => p !== "전체"), [provinces]);

  const toggleProvince = (label: (typeof REGION_OPTIONS)[number]) => {
    if (label === "전국") {
      setProvinces((prev) => (prev.includes("전체") ? [] : ["전체"]));
      return;
    }
    const p = label.trim();
    if (!p) return;
    setProvinces((prev) => {
      const withoutAll = prev.filter((x) => x !== "전체");
      const exists = withoutAll.includes(p);
      return exists ? withoutAll.filter((x) => x !== p) : [...withoutAll, p];
    });
  };

  const toggleIndustry = (label: (typeof INDUSTRY_OPTIONS)[number]) => {
    const v = label.trim();
    setIndustries((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const toggleRole = (label: (typeof ROLE_OPTIONS)[number]) => {
    const v = label.trim();
    setRoles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const resetAll = () => {
    setProvinces([]);
    setIndustries([]);
    setRoles([]);
  };

  const apply = () => {
    onApply({
      provinces: uniq((provinces || []).map((s) => s.trim()).filter(Boolean)),
      industries: uniq((industries || []).map((s) => s.trim()).filter(Boolean)),
      roles: uniq((roles || []).map((s) => s.trim()).filter(Boolean)),
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-3.5">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[560px] rounded-[14px] border border-black bg-white p-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-black text-[#111]">
            맞춤 보기 <span className="text-xs font-extrabold text-[#888]">(필터)</span>
          </h2>
          <button type="button" onClick={onClose} className="text-sm font-extrabold text-[#666]">
            닫기
          </button>
        </div>

        <p className="mt-1.5 text-[15px] font-black text-[#111]">
          지역 <span className="text-[8px] font-medium text-[#666]">(복수선택 가능 / 미선택시 전체)</span>
        </p>
        <TableGrid
          items={REGION_OPTIONS}
          columns={6}
          isActive={(v) => (v === "전국" ? hasNationwide : selectedProvinces.includes(v))}
          onToggle={toggleProvince}
        />

        <p className="mt-3.5 text-[15px] font-black text-[#111]">
          업종 <span className="text-[8px] font-medium text-[#666]">(복수선택 가능 / 미선택시 전체)</span>
        </p>
        <TableGrid
          items={INDUSTRY_OPTIONS}
          columns={3}
          isActive={(v) => industries.includes(v)}
          onToggle={toggleIndustry}
        />

        <p className="mt-3.5 text-[15px] font-black text-[#111]">
          모집 <span className="text-[8px] font-medium text-[#666]">(복수선택 가능 / 미선택시 전체)</span>
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-black bg-white">
          <div className="flex">
            {ROLE_OPTIONS.map((r, idx) => {
              const active = roles.includes(r);
              const last = idx === ROLE_OPTIONS.length - 1;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={`flex-1 truncate py-3 text-center text-[13px] font-black ${
                    last ? "" : "border-r border-black"
                  } ${active ? "bg-[#4A6CF7] text-white" : "bg-white text-[#111]"}`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={resetAll}
            className="flex-1 rounded-[14px] border border-gray-300 bg-white py-3.5 text-center text-base font-black text-[#111]"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 rounded-[14px] bg-[#4A6CF7] py-3.5 text-center text-base font-black text-white"
          >
            보 기
          </button>
        </div>
      </div>
    </div>
  );
}
