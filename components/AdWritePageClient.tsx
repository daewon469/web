"use client";

import MapLocationField from "@/components/MapLocationField";
import TableGrid from "@/components/TableGrid";
import { Posts, resolveMediaUrl } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import type { MapLocation } from "@/lib/map";
import { getSession } from "@/lib/session";
import { DEFAULT_PLACEHOLDER_IMAGE_PATH, uploadImageFile } from "@/lib/upload";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

const CATEGORIES = ["광고", "대출", "급매물", "중고장터"] as const;
const WORK_ROLES = ["업무1", "업무2", "업무3", "업무4"] as const;

type Category = (typeof CATEGORIES)[number];
type WorkRole = (typeof WORK_ROLES)[number];

const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";
const formGridClass = "grid grid-cols-1 gap-4 md:grid-cols-2";
const formFullClass = "md:col-span-2";

const labelClass = "mb-2 block text-[15px] font-bold";
const blueLabelClass = "mb-1.5 block text-[15px] font-bold text-[#4A6CF7]";

function formatPhone(value: string) {
  const digits = (value || "").replace(/[^0-9]/g, "");
  if (!digits) return "";

  if (/^1(?:5|6|8)\d{2}/.test(digits)) {
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`;
  }

  if (digits.startsWith("02")) {
    const rest = digits.slice(2);
    if (rest.length === 0) return "02";
    if (rest.length <= 3) return `02-${rest}`;
    if (rest.length <= 7) return `02-${rest.slice(0, 3)}-${rest.slice(3)}`;
    return `02-${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
  }

  if (digits.startsWith("0")) {
    const a = digits.slice(0, 3);
    const rest = digits.slice(3);
    if (rest.length === 0) return a;
    if (rest.length <= 3) return `${a}-${rest}`;
    if (rest.length <= 7) return `${a}-${rest.slice(0, 3)}-${rest.slice(3)}`;
    return `${a}-${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
  }

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export default function AdWritePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = Number(searchParams.get("id") || 0);
  const isEdit = Number.isFinite(editId) && editId > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("광고");
  const [companyAgency, setCompanyAgency] = useState("");
  const [agent, setAgent] = useState("");
  const [agencyCall, setAgencyCall] = useState("");
  const [highlight, setHighlight] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [business, setBusiness] = useState<MapLocation | null>(null);
  const [existingCardType, setExistingCardType] = useState<number | null>(null);
  const [selectedWorks, setSelectedWorks] = useState<Set<WorkRole>>(new Set());
  const [workText, setWorkText] = useState<Record<WorkRole, string>>({
    업무1: "",
    업무2: "",
    업무3: "",
    업무4: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adjustContentHeight = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(200, el.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    adjustContentHeight();
  }, [content, adjustContentHeight]);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin) router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (isEdit) return;
    const job = String(searchParams.get("job_industry") ?? "").trim();
    const normalized = job === "광고업체" ? "광고" : job;
    if (CATEGORIES.includes(normalized as Category)) {
      setCategory(normalized as Category);
    }
  }, [isEdit, searchParams]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const post = await Posts.get(editId);
        setTitle(post.title ?? "");
        setContent(post.content.replace(/<[^>]+>/g, "\n").trim());
        const job = String(post.job_industry ?? "").trim();
        const normalized = job === "광고업체" ? "광고" : job;
        if (CATEGORIES.includes(normalized as Category)) {
          setCategory(normalized as Category);
        }
        setCompanyAgency(post.company_agency ?? "");
        setAgent(post.agent ?? "");
        setAgencyCall(formatPhone(post.agency_call ?? ""));
        setHighlight(post.highlight_content ?? "");
        setImageUri(resolveMediaUrl(post.image_url) ?? post.image_url ?? null);
        setExistingCardType(typeof post.card_type === "number" ? post.card_type : null);

        if (post.business_lat != null && post.business_lng != null) {
          setBusiness({
            lat: post.business_lat,
            lng: post.business_lng,
            address: post.business_address,
            mapUrl: post.business_map_url,
          });
        }

        const nextSelected = new Set<WorkRole>();
        const nextText: Record<WorkRole, string> = {
          업무1: "",
          업무2: "",
          업무3: "",
          업무4: "",
        };
        if (post.item1_use) {
          nextSelected.add("업무1");
          nextText["업무1"] = post.item1_sup ?? "";
        }
        if (post.item2_use) {
          nextSelected.add("업무2");
          nextText["업무2"] = post.item2_sup ?? "";
        }
        if (post.item3_use) {
          nextSelected.add("업무3");
          nextText["업무3"] = post.item3_sup ?? "";
        }
        if (post.item4_use) {
          nextSelected.add("업무4");
          nextText["업무4"] = post.item4_sup ?? "";
        }
        setSelectedWorks(nextSelected);
        setWorkText(nextText);
      } catch {
        setError("글을 불러오지 못했습니다.");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [isEdit, editId]);

  const toggleWork = (role: WorkRole) => {
    setSelectedWorks((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("상세 내용을 입력해주세요.");
      return;
    }

    const session = getSession();
    if (!session.username) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        status: "published" as const,
        image_url: imageUri ?? undefined,
        card_type: isEdit ? (existingCardType ?? 1) : 1,
        post_type: 4,
        highlight_content: highlight.trim() || undefined,
        company_agency: companyAgency.trim() || undefined,
        agent: agent.trim() || undefined,
        agency_call: agencyCall.trim() || undefined,
        business_lat: business?.lat,
        business_lng: business?.lng,
        business_address: business?.address,
        business_map_url: business?.mapUrl,
        job_industry: category,
        item1_use: selectedWorks.has("업무1"),
        item1_sup: workText["업무1"].trim() || undefined,
        item2_use: selectedWorks.has("업무2"),
        item2_sup: workText["업무2"].trim() || undefined,
        item3_use: selectedWorks.has("업무3"),
        item3_sup: workText["업무3"].trim() || undefined,
        item4_use: selectedWorks.has("업무4"),
        item4_sup: workText["업무4"].trim() || undefined,
      };

      if (isEdit) {
        await Posts.update(editId, payload);
        alert("광고글이 수정되었습니다.");
      } else {
        await Posts.createByType(payload, session.username, 4);
        alert("광고글이 등록되었습니다.");
      }
      router.push("/list4");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "저장에 실패했습니다. 잠시 후 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-black bg-white p-4">
      <h1 className="mb-2 text-xl font-black text-[#0B1B3A]">
        {isEdit ? "광고글 수정" : "광고글 등록"}
      </h1>
      <p className="mb-4 text-lg font-bold text-[#666]">※ 광고글을 등록해주세요</p>

      <form onSubmit={onSubmit} className={`${formGridClass} gap-y-4`}>
        <div className={formFullClass}>
          <label className="mb-3 mt-2 block text-[15px] font-bold">광고 이미지</label>
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
            className="hidden"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
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

        <div>
          <label className={labelClass} htmlFor="ad-title">
            제목
          </label>
          <input
            id="ad-title"
            type="text"
            className={inputClass}
            placeholder="광고 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="ad-highlight">
            광고 한마디
          </label>
          <input
            id="ad-highlight"
            type="text"
            className={inputClass}
            placeholder="예) 건당 100원 발송 현장 바로 콜 뜨는 광고"
            maxLength={40}
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="ad-company">
            상호
          </label>
          <input
            id="ad-company"
            type="text"
            className={inputClass}
            placeholder="예) 대원파트너스"
            value={companyAgency}
            onChange={(e) => setCompanyAgency(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="ad-agent">
            담당자
          </label>
          <input
            id="ad-agent"
            type="text"
            className={inputClass}
            placeholder="예) 김대원 이사"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="ad-call">
            연락처
          </label>
          <input
            id="ad-call"
            type="tel"
            className={inputClass}
            placeholder="예) 010-1234-5678"
            value={agencyCall}
            onChange={(e) => setAgencyCall(formatPhone(e.target.value))}
          />
        </div>

        <div>
          <label className={labelClass}>업무 분류</label>
          <TableGrid
            items={CATEGORIES}
            columns={4}
            isActive={(v) => category === v}
            onToggle={(v) => setCategory(v)}
          />
        </div>

        <div className={formFullClass}>
          <label className={labelClass}>업무 상세 (최대 4개)</label>
          <TableGrid
            items={WORK_ROLES}
            columns={4}
            isActive={(v) => selectedWorks.has(v)}
            onToggle={toggleWork}
          />
          {WORK_ROLES.map((role) =>
            selectedWorks.has(role) ? (
              <div key={role} className="mt-3">
                <label className={blueLabelClass} htmlFor={`work-${role}`}>
                  {role}
                </label>
                <input
                  id={`work-${role}`}
                  type="text"
                  className={inputClass}
                  placeholder="예) 온라인 광고 집행, DM 발송 등"
                  value={workText[role]}
                  onChange={(e) =>
                    setWorkText((prev) => ({ ...prev, [role]: e.target.value }))
                  }
                />
              </div>
            ) : null,
          )}
        </div>

        <div className={formFullClass}>
          <label className={labelClass} htmlFor="ad-content">
            상세 내용
          </label>
          <textarea
            ref={contentRef}
            id="ad-content"
            rows={8}
            className={`${inputClass} min-h-[200px] resize-none overflow-hidden`}
            placeholder="상세 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={formFullClass}>
          <MapLocationField
            label="사업지 주소"
            placeholder="주소 입력 또는 지도를 터치하세요"
            value={business}
            onChange={setBusiness}
            pickerKind="business"
            showSameAsPeer={false}
          />
        </div>

        {error && (
          <p className={`rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ${formFullClass}`}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-2xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-60 ${formFullClass}`}
        >
          {submitting ? "저장 중..." : isEdit ? "수정" : "게시"}
        </button>
      </form>
    </div>
  );
}
