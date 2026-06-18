"use client";

import RegionSelectModal from "@/components/RegionSelectModal";
import MapLocationField from "@/components/MapLocationField";
import TableGrid from "@/components/TableGrid";
import { Posts, resolveMediaUrl, type Post, type PostInput } from "@/lib/api";
import { WRITE_INDUSTRY_OPTIONS, WRITE_ROLE_OPTIONS } from "@/lib/customSiteOptions";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import type { MapLocation } from "@/lib/map";
import {
  DEFAULT_BUSINESS_LOCATION,
  DEFAULT_WORKPLACE_LOCATION,
  resolveBusinessForSubmit,
  resolveWorkplaceForSubmit,
} from "@/lib/map";
import { uploadDefaultPlaceholderImage, uploadImageFile, DEFAULT_PLACEHOLDER_IMAGE_PATH } from "@/lib/upload";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ROLE_FIELD_MAP: Record<string, { use: keyof PostInput; fee: keyof PostInput; label: string }> = {
  총괄: { use: "total_use", fee: "total_fee", label: "총괄" },
  본부장: { use: "branch_use", fee: "branch_fee", label: "본부장" },
  본부: { use: "hq_use", fee: "hq_fee", label: "본부" },
  팀장: { use: "leader_use", fee: "leader_fee", label: "팀장" },
  팀원: { use: "member_use", fee: "member_fee", label: "팀원" },
  팀: { use: "team_use", fee: "team_fee", label: "팀" },
  각개: { use: "each_use", fee: "each_fee", label: "각개" },
};

const TOKING_COLORS = [
  "black",
  "#E11D48",
  "#2563EB",
  "#14B8A6",
  "#F97316",
  "#A855F7",
  "#71717A",
] as const;

const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";

const blueLabelClass = "mb-1.5 block text-[15px] font-bold text-[#4A6CF7]";

function normalizeTokingColor(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "#111111";
  const lower = raw.toLowerCase();
  if (lower === "white" || lower === "#fff" || lower === "#ffffff") return "#111111";
  return raw;
}

function roleFeeLabel(role: string) {
  if (role === "본부장") return "본부장 수수료";
  if (role === "본부") return "본부 수수료";
  if (role === "팀") return "팀 수수료";
  if (role === "각개") return "각개 수수료";
  return `${role} 수수료`;
}

function rolesFromPost(post: Post) {
  const roles: string[] = [];
  const fees: Record<string, string> = {};
  for (const [label, map] of Object.entries(ROLE_FIELD_MAP)) {
    if ((post as Record<string, unknown>)[map.use]) {
      roles.push(label);
      const fee = (post as Record<string, unknown>)[map.fee];
      if (fee) fees[label] = String(fee);
    }
  }
  if (post.other_role_name) {
    roles.push("기타");
    fees["기타"] = post.other_role_fee ?? "";
  }
  return { roles, fees };
}

export default function WritePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = Number(searchParams.get("id") || 0);
  const isEdit = Number.isFinite(editId) && editId > 0;

  const [loadingPost, setLoadingPost] = useState(isEdit);
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
  const [highlightColor, setHighlightColor] = useState("#111111");
  const [companyDeveloper, setCompanyDeveloper] = useState("");
  const [companyConstructor, setCompanyConstructor] = useState("");
  const [companyTrustee, setCompanyTrustee] = useState("");
  const [companyAgency, setCompanyAgency] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [workplace, setWorkplace] = useState<MapLocation | null>(() =>
    isEdit ? null : DEFAULT_WORKPLACE_LOCATION,
  );
  const [business, setBusiness] = useState<MapLocation | null>(() =>
    isEdit ? null : DEFAULT_BUSINESS_LOCATION,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const post = await Posts.get(editId);
        setTitle(post.title);
        setContent(post.content.replace(/<[^>]+>/g, "\n").trim());
        setProvince(post.province);
        setCity(post.city || "전체");
        setRegionLabel(
          post.city && post.city !== "전체" ? `${post.province} ${post.city}` : post.province,
        );
        setIndustries(
          (post.job_industry || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
        const { roles: r, fees: f } = rolesFromPost(post);
        setRoles(r);
        setFees(f);
        setOtherRoleName(post.other_role_name ?? "");
        setAgencyCall(post.agency_call ?? "");
        setAgent(post.agent ?? "");
        setHighlightContent(post.highlight_content ?? "");
        setHighlightColor(normalizeTokingColor(post.highlight_color));
        setCompanyDeveloper(post.company_developer ?? "");
        setCompanyConstructor(post.company_constructor ?? "");
        setCompanyTrustee(post.company_trustee ?? "");
        setCompanyAgency(post.company_agency ?? "");
        setImageUri(resolveMediaUrl(post.image_url) ?? post.image_url ?? null);
        if (post.workplace_lat != null && post.workplace_lng != null) {
          setWorkplace({
            lat: post.workplace_lat,
            lng: post.workplace_lng,
            address: post.workplace_address,
            mapUrl: post.workplace_map_url,
          });
        }
        if (post.business_lat != null && post.business_lng != null) {
          setBusiness({
            lat: post.business_lat,
            lng: post.business_lng,
            address: post.business_address,
            mapUrl: post.business_map_url,
          });
        }
      } catch {
        setError("글을 불러오지 못했습니다.");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [isEdit, editId]);

  const buildPayload = (status: "published" | "closed", resolvedImageUrl?: string): PostInput => {
    const resolvedWorkplace = resolveWorkplaceForSubmit(workplace, !isEdit);
    const resolvedBusiness = resolveBusinessForSubmit(business, !isEdit);

    const payload: PostInput = {
      title: title.trim(),
      content: content.trim(),
      province: province === "전체" ? "전체" : province,
      city: city || "전체",
      job_industry: industries.length ? industries.join(",") : undefined,
      agency_call: agencyCall.trim() || undefined,
      agent: agent.trim() || undefined,
      highlight_content: highlightContent.trim() || undefined,
      highlight_color: highlightContent.trim() ? highlightColor : undefined,
      company_agency: companyAgency.trim() || undefined,
      status,
      card_type: 1,
      image_url: resolvedImageUrl,
      workplace_lat: resolvedWorkplace?.lat,
      workplace_lng: resolvedWorkplace?.lng,
      workplace_address: resolvedWorkplace?.address,
      workplace_map_url: resolvedWorkplace?.mapUrl,
      business_lat: resolvedBusiness?.lat,
      business_lng: resolvedBusiness?.lng,
      business_address: resolvedBusiness?.address,
      business_map_url: resolvedBusiness?.mapUrl,
    };

    const extra = payload as Record<string, unknown>;
    if (companyDeveloper.trim()) extra.company_developer = companyDeveloper.trim();
    if (companyConstructor.trim()) extra.company_constructor = companyConstructor.trim();
    if (companyTrustee.trim()) extra.company_trustee = companyTrustee.trim();

    for (const role of roles) {
      if (role === "기타") {
        payload.other_role_name = otherRoleName.trim() || "기타";
        payload.other_role_fee = fees["기타"]?.trim() || undefined;
        continue;
      }
      const map = ROLE_FIELD_MAP[role];
      if (!map) continue;
      extra[map.use] = true;
      const fee = fees[role]?.trim();
      if (fee) extra[map.fee] = fee;
    }
    return payload;
  };

  const submit = async (status: "published" | "closed") => {
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

    try {
      const resolvedImageUrl = imageUri ?? (await uploadDefaultPlaceholderImage());
      const payload = buildPayload(status, resolvedImageUrl);

      if (isEdit) {
        await Posts.update(editId, payload);
        router.replace(`/${editId}`);
      } else {
        const created = await Posts.create(payload, session.username);
        router.replace(`/${created.id}`);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, isEdit ? "수정에 실패했습니다." : "등록에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const onImageChange = async (file: File | null) => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      setImageUri(url);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "이미지 업로드에 실패했습니다."));
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasUserImage = Boolean(imageUri);

  if (loadingPost) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  return (
    <div className="rounded-2xl border border-black bg-white p-4">
      <h1 className="mb-2 text-xl font-black text-[#0B1B3A]">
        {isEdit ? "구인글 수정" : "구인글 등록"}
      </h1>
      <p className="mb-4 text-lg font-bold text-[#666]">※ 구인등록은 하루 1회 가능합니다.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit("published");
        }}
        className="flex flex-col gap-4"
      >
        {/* 소개 이미지 */}
        <div>
          <label className="mb-3 mt-2 block text-[15px] font-bold">소개 이미지</label>
          <div className="relative mb-2 overflow-hidden rounded-xl bg-[#f2f2f2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUri ?? DEFAULT_PLACEHOLDER_IMAGE_PATH}
              alt=""
              className="mx-auto block h-[260px] w-full rounded-xl object-contain"
            />
            {hasUserImage && (
              <button
                type="button"
                onClick={() => setImageUri(null)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-lg font-bold text-white"
                aria-label="이미지 제거"
              >
                ×
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
            className="w-full rounded-2xl bg-[#4A6CF7] px-4 py-3 text-center font-bold text-white disabled:opacity-60"
          >
            이미지를 선택해주세요. ( 클 릭 )
          </button>
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-2 block text-[15px] font-bold">제목 (필수)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* 현장 한마디 */}
        <div>
          <label className="mb-2 block text-base font-bold">현장 한마디</label>
          <div className="mb-2.5 flex flex-wrap gap-2.5">
            {TOKING_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setHighlightColor(c)}
                className="h-7 w-7 rounded-full border-2"
                style={{
                  backgroundColor: c,
                  borderColor: highlightColor === c ? "#000" : "transparent",
                }}
                aria-label={`색상 ${c}`}
              />
            ))}
          </div>
          <input
            type="text"
            value={highlightContent}
            maxLength={31}
            onChange={(e) => setHighlightContent(e.target.value)}
            className={inputClass}
            style={{ color: highlightColor }}
          />
        </div>

        {/* 업종 */}
        <div>
          <label className="mb-2 block text-[15px] font-bold">업종</label>
          <TableGrid
            items={WRITE_INDUSTRY_OPTIONS}
            columns={3}
            isActive={(v) => industries.includes(v)}
            onToggle={(v) =>
              setIndustries((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
            }
          />
        </div>

        {/* 지역 */}
        <div>
          <label className="mb-2 block text-[15px] font-bold">지역</label>
          <button
            type="button"
            onClick={() => setRegionModalOpen(true)}
            className={`${inputClass} text-left ${!regionLabel ? "text-gray-500" : ""}`}
          >
            {regionLabel || "지역을 선택하세요"}
          </button>
        </div>

        {/* 모집 */}
        <div>
          <label className="mb-2 block text-[15px] font-bold">모집</label>
          <TableGrid
            items={WRITE_ROLE_OPTIONS}
            columns={4}
            isActive={(v) => roles.includes(v)}
            onToggle={(v) =>
              setRoles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
            }
          />
          {roles.map((role) =>
            role === "기타" ? (
              <div key={role} className="mt-3">
                <label className={blueLabelClass}>직접입력</label>
                <input
                  type="text"
                  value={otherRoleName}
                  onChange={(e) => setOtherRoleName(e.target.value)}
                  placeholder="예) 층별, 기본급"
                  className={`${inputClass} mb-2`}
                />
                <label className={blueLabelClass}>수수료</label>
                <input
                  type="text"
                  value={fees["기타"] ?? ""}
                  onChange={(e) => setFees((prev) => ({ ...prev, 기타: e.target.value }))}
                  placeholder="예) 300~500, 3%"
                  disabled={!otherRoleName.trim()}
                  className={inputClass}
                />
              </div>
            ) : (
              <div key={role} className="mt-3">
                <label className={blueLabelClass}>{roleFeeLabel(role)}</label>
                <input
                  type="text"
                  value={fees[role] ?? ""}
                  onChange={(e) => setFees((prev) => ({ ...prev, [role]: e.target.value }))}
                  placeholder="예) 300~500, 3%"
                  className={inputClass}
                />
              </div>
            ),
          )}
        </div>

        {/* 시행사 / 시공사 / 신탁사 / 대행사 */}
        <div>
          <label className="mb-2 block text-[15px] font-bold">시행사</label>
          <input
            type="text"
            value={companyDeveloper}
            onChange={(e) => setCompanyDeveloper(e.target.value)}
            placeholder="예) ○ ○ 시 행"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-[15px] font-bold">시공사</label>
          <input
            type="text"
            value={companyConstructor}
            onChange={(e) => setCompanyConstructor(e.target.value)}
            placeholder="예) ○ ○ 건 설"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-[15px] font-bold">신탁사</label>
          <input
            type="text"
            value={companyTrustee}
            onChange={(e) => setCompanyTrustee(e.target.value)}
            placeholder="예) ○ ○ 신 탁"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-2 block text-[15px] font-bold">대행사</label>
          <input
            type="text"
            value={companyAgency}
            onChange={(e) => setCompanyAgency(e.target.value)}
            placeholder="예) 대원파트너스"
            className={inputClass}
          />
        </div>

        {/* 상세 내용 */}
        <div>
          <label className="mb-2 block text-[15px] font-bold">상세 내용 (필수)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="내용을 입력하세요"
            className={`${inputClass} min-h-[200px] resize-y`}
          />
        </div>

        {/* 담당자 / 연락처 */}
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

        {/* 모델하우스 / 현장사업지 */}
        <MapLocationField
          label="모델하우스 주소"
          placeholder="주소 입력 또는 지도를 터치하세요"
          value={workplace}
          onChange={setWorkplace}
          pickerKind="work"
          peerLocation={business}
        />
        <MapLocationField
          label="현장사업지 주소"
          placeholder="주소 입력 또는 지도를 터치하세요"
          value={business}
          onChange={setBusiness}
          pickerKind="business"
          peerLocation={workplace}
          showSameAsPeer
        />

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit("closed")}
            className="flex-1 rounded-2xl border border-gray-300 py-3 font-bold disabled:opacity-60"
          >
            임시 저장
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-2xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-60"
          >
            {submitting ? "저장 중..." : isEdit ? "수정" : "게시"}
          </button>
        </div>
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
