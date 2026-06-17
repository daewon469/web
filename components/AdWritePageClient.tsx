"use client";

import MapLocationField from "@/components/MapLocationField";
import { Posts, resolveMediaUrl } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import type { MapLocation } from "@/lib/map";
import { getSession } from "@/lib/session";
import { uploadImageFile } from "@/lib/upload";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const CATEGORIES = ["광고", "대출", "급매물", "중고장터"] as const;
const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";

export default function AdWritePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = Number(searchParams.get("id") || 0);
  const isEdit = Number.isFinite(editId) && editId > 0;

  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("광고");
  const [companyAgency, setCompanyAgency] = useState("");
  const [agent, setAgent] = useState("");
  const [agencyCall, setAgencyCall] = useState("");
  const [highlight, setHighlight] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [business, setBusiness] = useState<MapLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin) router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const post = await Posts.get(editId);
        setTitle(post.title);
        setContent(post.content.replace(/<[^>]+>/g, "\n").trim());
        const job = String(post.job_industry ?? "").trim();
        if (job === "광고업체") setCategory("광고");
        else if (CATEGORIES.includes(job as (typeof CATEGORIES)[number])) {
          setCategory(job as (typeof CATEGORIES)[number]);
        }
        setCompanyAgency(post.company_agency ?? "");
        setAgent(post.agent ?? "");
        setAgencyCall(post.agency_call ?? "");
        setHighlight(post.highlight_content ?? "");
        setImageUrl(post.image_url ?? null);
        setImagePreview(resolveMediaUrl(post.image_url));
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

  const onImage = async (file: File | null) => {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    try {
      const url = await uploadImageFile(file);
      setImageUrl(url);
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    const session = getSession();
    if (!session.username) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        status: "published" as const,
        image_url: imageUrl ?? undefined,
        card_type: 1,
        post_type: 4,
        job_industry: category,
        company_agency: companyAgency.trim() || undefined,
        agent: agent.trim() || undefined,
        agency_call: agencyCall.trim() || undefined,
        highlight_content: highlight.trim() || undefined,
        business_lat: business?.lat,
        business_lng: business?.lng,
        business_address: business?.address,
        business_map_url: business?.mapUrl,
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
      setError(getApiErrorMessage(err, "저장에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Link href="/list4" className="text-sm text-[#4A6CF7]">
        ← 광고 목록
      </Link>
      <h1 className="text-xl font-bold text-[#0B1B3A]">
        {isEdit ? "광고 수정" : "광고 등록"}
      </h1>

      <label className="flex flex-col gap-1 text-sm font-bold">
        카테고리
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        제목
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        내용
        <textarea
          className={`${inputClass} min-h-[180px]`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        업체명
        <input
          className={inputClass}
          value={companyAgency}
          onChange={(e) => setCompanyAgency(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        담당자
        <input className={inputClass} value={agent} onChange={(e) => setAgent(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        연락처
        <input
          className={inputClass}
          value={agencyCall}
          onChange={(e) => setAgencyCall(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        강조 문구
        <input className={inputClass} value={highlight} onChange={(e) => setHighlight(e.target.value)} />
      </label>

      <MapLocationField
        label="업체/현장 위치"
        placeholder="주소 입력 또는 지도를 터치하세요"
        value={business}
        onChange={setBusiness}
        pickerKind="business"
        showSameAsPeer={false}
      />

      <div>
        <p className="mb-2 text-sm font-bold">이미지</p>
        <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0] ?? null)} />
        {imagePreview && (
          <Image
            src={imagePreview}
            alt=""
            width={400}
            height={240}
            className="mt-3 w-full rounded-lg object-cover"
            unoptimized
          />
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-50"
      >
        {submitting ? "저장 중..." : isEdit ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}
