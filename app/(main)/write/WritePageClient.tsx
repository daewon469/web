"use client";

import RegionSelectModal from "@/components/RegionSelectModal";
import TableGrid from "@/components/TableGrid";
import { Posts, resolveMediaUrl, type Post, type PostInput } from "@/lib/api";
import { WRITE_INDUSTRY_OPTIONS, WRITE_ROLE_OPTIONS } from "@/lib/customSiteOptions";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { uploadImageFile } from "@/lib/upload";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const ROLE_FIELD_MAP: Record<string, { use: keyof PostInput; fee: keyof PostInput; label: string }> = {
  총괄: { use: "total_use", fee: "total_fee", label: "총괄" },
  본부장: { use: "branch_use", fee: "branch_fee", label: "본부장" },
  본부: { use: "hq_use", fee: "hq_fee", label: "본부" },
  팀장: { use: "leader_use", fee: "leader_fee", label: "팀장" },
  팀원: { use: "member_use", fee: "member_fee", label: "팀원" },
  팀: { use: "team_use", fee: "team_fee", label: "팀" },
  각개: { use: "each_use", fee: "each_fee", label: "각개" },
};

const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
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
        setImageUrl(post.image_url ?? null);
        setImagePreview(resolveMediaUrl(post.image_url));
      } catch {
        setError("글을 불러오지 못했습니다.");
      } finally {
        setLoadingPost(false);
      }
    })();
  }, [isEdit, editId]);

  const buildPayload = (status: "published" | "closed"): PostInput => {
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
      status,
      card_type: 1,
      image_url: imageUrl ?? undefined,
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
    const payload = buildPayload(status);

    try {
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
      setImageUrl(url);
      setImagePreview(url);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "이미지 업로드에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  return (
    <div className="rounded-2xl border border-black bg-white p-4">
      <h1 className="mb-4 text-xl font-black text-[#0B1B3A]">
        {isEdit ? "구인글 수정" : "구인글 등록"}
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit("published");
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="mb-2 block text-[15px] font-bold">※ 제목 (필수)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">대표 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          {imagePreview && (
            <Image
              src={imagePreview}
              alt=""
              width={200}
              height={200}
              className="mt-2 h-32 w-32 rounded object-cover"
              unoptimized
            />
          )}
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
            onToggle={(v) =>
              setIndustries((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
            }
          />
        </div>

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
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">강조 문구</label>
          <input
            type="text"
            value={highlightContent}
            onChange={(e) => setHighlightContent(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">담당자</label>
          <input type="text" value={agent} onChange={(e) => setAgent(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">연락처</label>
          <input
            type="tel"
            value={agencyCall}
            onChange={(e) => setAgencyCall(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[15px] font-bold">상세 내용 (필수)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={`${inputClass} resize-y`}
          />
        </div>

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
