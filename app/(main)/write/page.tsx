"use client";

import RegionSelectModal from "@/components/RegionSelectModal";
import TableGrid from "@/components/TableGrid";
import { Posts, type PostInput } from "@/lib/api";
import { WRITE_INDUSTRY_OPTIONS, WRITE_ROLE_OPTIONS } from "@/lib/customSiteOptions";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const ROLE_FIELD_MAP: Record<
  string,
  { use: keyof PostInput; fee: keyof PostInput }
> = {
  총괄: { use: "total_use", fee: "total_fee" },
  본부장: { use: "branch_use", fee: "branch_fee" },
  본부: { use: "hq_use", fee: "hq_fee" },
  팀장: { use: "leader_use", fee: "leader_fee" },
  팀원: { use: "member_use", fee: "member_fee" },
  팀: { use: "team_use", fee: "team_fee" },
  각개: { use: "each_use", fee: "each_fee" },
};

const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [regionLabel, setRegionLabel] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [fees, setFees] = useState<Record<string, string>>({});
  const [otherRoleName, setOtherRoleName] = useState("");
  const [agencyCall, setAgencyCall] = useState("");
  const [agent, setAgent] = useState("");
  const [highlightContent, setHighlightContent] = useState("");
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleIndustry = (v: string) => {
    setIndustries((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const toggleRole = (v: string) => {
    setRoles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    if (!title.trim()) return setError("제목을 입력해 주세요.");
    if (!content.trim()) return setError("상세 내용을 입력해 주세요.");
    if (!province.trim()) return setError("지역을 선택해 주세요.");

    setSubmitting(true);
    setError(null);

    const payload: PostInput = {
      title: title.trim(),
      content: content.trim(),
      province: province === "전체" ? "전체" : province,
      city: city || "전체",
      job_industry: industries.length ? industries.join(",") : undefined,
      agency_call: agencyCall.trim() || undefined,
      agent: agent.trim() || undefined,
      highlight_content: highlightContent.trim() || undefined,
      highlight_color: highlightContent.trim() ? "#8B0000" : undefined,
      status: "published",
      card_type: 1,
    };

    for (const role of roles) {
      if (role === "기타") {
        payload.other_role_name = otherRoleName.trim() || "기타";
        payload.other_role_fee = fees["기타"]?.trim() || undefined;
        continue;
      }
      const map = ROLE_FIELD_MAP[role];
      if (!map) continue;
      (payload as Record<string, unknown>)[map.use] = true;
      const fee = fees[role]?.trim();
      if (fee) (payload as Record<string, unknown>)[map.fee] = fee;
    }

    try {
      const created = await Posts.create(payload, session.username);
      router.replace(`/${created.id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "구인글 등록에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black bg-white p-4">
      <h1 className="mb-4 text-xl font-black text-[#0B1B3A]">구인글 등록</h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-[15px] font-bold">※ 제목 (필수)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">※ 지역 (필수)</label>
          <button
            type="button"
            onClick={() => setRegionModalOpen(true)}
            className={`${inputClass} text-left ${!regionLabel ? "text-gray-500" : ""}`}
          >
            {regionLabel || "지역 선택"}
          </button>
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">업종</label>
          <TableGrid
            items={WRITE_INDUSTRY_OPTIONS}
            columns={3}
            isActive={(v) => industries.includes(v)}
            onToggle={toggleIndustry}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">모집</label>
          <TableGrid
            items={WRITE_ROLE_OPTIONS}
            columns={4}
            isActive={(v) => roles.includes(v)}
            onToggle={toggleRole}
          />
          {roles.filter((r) => r !== "기타").map((role) => (
            <input
              key={role}
              type="text"
              value={fees[role] ?? ""}
              onChange={(e) => setFees((prev) => ({ ...prev, [role]: e.target.value }))}
              placeholder={`${role} 수수료`}
              className={`${inputClass} mt-2`}
            />
          ))}
          {roles.includes("기타") && (
            <div className="mt-2 flex flex-col gap-2">
              <input
                type="text"
                value={otherRoleName}
                onChange={(e) => setOtherRoleName(e.target.value)}
                placeholder="기타 모집명"
                className={inputClass}
              />
              <input
                type="text"
                value={fees["기타"] ?? ""}
                onChange={(e) => setFees((prev) => ({ ...prev, 기타: e.target.value }))}
                placeholder="기타 수수료"
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">강조 문구</label>
          <input
            type="text"
            value={highlightContent}
            onChange={(e) => setHighlightContent(e.target.value)}
            placeholder="예) 급구 / 고수익"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">담당자</label>
          <input
            type="text"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            placeholder="예) 김대원 이사"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">연락처</label>
          <input
            type="tel"
            value={agencyCall}
            onChange={(e) => setAgencyCall(e.target.value)}
            placeholder="예) 010-1234-5678"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">상세 내용 (필수)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={8}
            className={`${inputClass} resize-y`}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-60"
        >
          {submitting ? "등록 중..." : "게시"}
        </button>
      </form>

      <RegionSelectModal
        open={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        onSelect={(p, c) => {
          setProvince(p);
          setCity(c === "전체" || !c ? "전체" : c);
          setRegionLabel(c === "전체" || !c ? p : `${p} ${c}`);
        }}
      />
    </div>
  );
}
