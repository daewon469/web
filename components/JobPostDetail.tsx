"use client";

import AddressMapSection from "@/components/AddressMapSection";
import { resolveMediaUrl, type Post } from "@/lib/api";
import Image from "next/image";

const sectionClass = "rounded-lg border border-black bg-[#f9f9f9] p-4";

function formatPhone(num?: string | null) {
  if (!num) return "-";
  const digits = num.replace(/[^0-9]/g, "");
  if (/^1(?:5|6|8)\d{2}\d{4}$/.test(digits)) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.startsWith("02")) {
    if (digits.length === 9) return digits.replace(/^(02)(\d{3})(\d{4})$/, "$1-$2-$3");
    if (digits.length === 10) return digits.replace(/^(02)(\d{4})(\d{4})$/, "$1-$2-$3");
    return digits;
  }
  if (digits.startsWith("01")) {
    if (digits.length === 10) return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
    if (digits.length === 11) return digits.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
    return digits;
  }
  if (digits.startsWith("0")) {
    if (digits.length === 10) return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
    if (digits.length === 11) return digits.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
    return digits;
  }
  return digits;
}

function feeLineText(v?: string | null) {
  const s = String(v ?? "").trim();
  return s || "유선문의";
}

function wonOrSupport(v?: string | null) {
  const s = String(v ?? "").trim();
  return s || "지원";
}

function wonOrBlank(v?: string | null) {
  return String(v ?? "").trim();
}

export default function JobPostDetail({ post }: { post: Post }) {
  const imageUri = resolveMediaUrl(post.image_url);
  const highlightColor =
    post.highlight_color === "white" || post.highlight_color === "black"
      ? "#000"
      : post.highlight_color || "#000";

  const welfareItems: { label: string; value?: string }[] = [];
  if (post.pay_use) welfareItems.push({ label: "일비", value: wonOrSupport(post.pay_sup) });
  if (post.meal_use) welfareItems.push({ label: "케터링", value: post.meal_sup ? "지원" : "미지원" });
  if (post.house_use) welfareItems.push({ label: "숙소", value: post.house_sup || "지원" });
  if (post.item1_use && post.item1_type) {
    welfareItems.push({ label: post.item1_type, value: wonOrBlank(post.item1_sup) });
  }
  if (post.item2_use && post.item2_type) {
    welfareItems.push({ label: post.item2_type, value: wonOrBlank(post.item2_sup) });
  }
  if (post.item3_use && post.item3_type) {
    welfareItems.push({ label: post.item3_type, value: wonOrBlank(post.item3_sup) });
  }
  if (post.item4_use && post.item4_type) {
    welfareItems.push({ label: post.item4_type, value: wonOrBlank(post.item4_sup) });
  }

  const roles = [
    post.total_use ? "총괄" : null,
    post.branch_use ? "본부장" : null,
    post.hq_use ? "본부" : null,
    post.leader_use ? "팀장" : null,
    post.member_use ? "팀원" : null,
    post.team_use ? "팀" : null,
    post.each_use ? "각개" : null,
    post.other_role_name ? String(post.other_role_name) : null,
  ].filter(Boolean);

  const contactDigits = (post.agency_call ?? "").replace(/[^0-9]/g, "");

  return (
    <article className="flex flex-col gap-1 bg-white">
      <div className="overflow-hidden rounded-lg border border-black">
        <div className="flex items-center justify-between bg-[#f9f9f9] p-4">
          <span className="font-semibold">{post.author?.username}</span>
          <span className="text-sm text-gray-600">
            {new Date(post.created_at).toLocaleString("ko-KR")}
          </span>
        </div>

        {imageUri && (
          <div className="border-t border-black">
            <Image
              src={imageUri}
              alt=""
              width={800}
              height={500}
              className="block w-full object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="border-t border-black bg-[#f9f9f9] p-4">
          <h1 className="text-2xl font-bold text-[#0B1B3A]">{post.title}</h1>
        </div>
      </div>

      {post.highlight_content && (
        <div className={sectionClass}>
          <p className="text-base font-bold" style={{ color: highlightColor }}>
            {post.highlight_content}
          </p>
        </div>
      )}

      <div className={sectionClass}>
        <p className="text-base">
          업종 : <span className="font-semibold">{post.job_industry ?? "-"}</span>
        </p>
        <p className="mt-3 text-base">
          지역 :{" "}
          <span className="font-semibold">
            {post.province} {post.city}
          </span>
        </p>
      </div>

      <div className={sectionClass}>
        <p className="text-base">
          모집 : <span className="font-semibold">{roles.join("/") || "미정"}</span>
        </p>
        {post.total_use && (
          <p className="mt-3 text-[15px]">
            총괄 : <span className="font-semibold">{feeLineText(post.total_fee)}</span>
          </p>
        )}
        {post.branch_use && (
          <p className="mt-3 text-[15px]">
            본부장 : <span className="font-semibold">{feeLineText(post.branch_fee)}</span>
          </p>
        )}
        {post.hq_use && (
          <p className="mt-3 text-[15px]">
            본부 : <span className="font-semibold">{feeLineText(post.hq_fee)}</span>
          </p>
        )}
        {post.leader_use && (
          <p className="mt-3 text-[15px]">
            팀장 : <span className="font-semibold">{feeLineText(post.leader_fee)}</span>
          </p>
        )}
        {post.member_use && (
          <p className="mt-3 text-[15px]">
            팀원 : <span className="font-semibold">{feeLineText(post.member_fee)}</span>
          </p>
        )}
        {post.team_use && (
          <p className="mt-3 text-[15px]">
            팀 : <span className="font-semibold">{feeLineText(post.team_fee)}</span>
          </p>
        )}
        {post.each_use && (
          <p className="mt-3 text-[15px]">
            각개 : <span className="font-semibold">{feeLineText(post.each_fee)}</span>
          </p>
        )}
        {post.other_role_name && (
          <p className="mt-3 text-[15px]">
            {post.other_role_name} :{" "}
            <span className="font-semibold">{feeLineText(post.other_role_fee)}</span>
          </p>
        )}
      </div>

      <div className={sectionClass}>
        <p className="text-base">
          시행사 : <span className="font-semibold">{post.company_developer ?? "-"}</span>
        </p>
        <p className="mt-3 text-base">
          시공사 : <span className="font-semibold">{post.company_constructor ?? "-"}</span>
        </p>
        <p className="mt-3 text-base">
          신탁사 : <span className="font-semibold">{post.company_trustee ?? "-"}</span>
        </p>
        <p className="mt-3 text-base">
          대행사 : <span className="font-semibold">{post.company_agency ?? "-"}</span>
        </p>
      </div>

      <div className={sectionClass}>
        {welfareItems.length === 0 ? (
          <p className="text-base font-semibold">근무후생 : 유선문의</p>
        ) : (
          welfareItems.map((item, index) => (
            <p key={item.label} className={index > 0 ? "mt-3 text-base" : "text-base"}>
              {item.value ? (
                <>
                  {item.label} : <span className="font-semibold">{item.value}</span>
                </>
              ) : (
                <span className="font-semibold">{item.label}</span>
              )}
            </p>
          ))
        )}
      </div>

      <div className={sectionClass}>
        <div
          className="whitespace-pre-wrap text-base leading-8 text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <div className={sectionClass}>
        <p className="text-base">
          {post.agent} : <span className="font-semibold">{formatPhone(post.agency_call)}</span>
        </p>
        {contactDigits && (
          <div className="mt-3 flex gap-2">
            <a
              href={`tel:${contactDigits}`}
              className="flex-1 rounded-xl bg-[#4A6CF7] py-2.5 text-center text-sm font-bold text-white"
            >
              전화
            </a>
            <a
              href={`sms:${contactDigits}`}
              className="flex-1 rounded-xl border border-black py-2.5 text-center text-sm font-bold"
            >
              문자
            </a>
          </div>
        )}
      </div>

      <AddressMapSection
        title="모델하우스 주소"
        placeholder="근무지 주소"
        address={post.workplace_address}
        lat={post.workplace_lat}
        lng={post.workplace_lng}
        pickerKind="work"
      />

      <AddressMapSection
        title="현장사업지 주소"
        placeholder="사업지 주소"
        address={post.business_address}
        lat={post.business_lat}
        lng={post.business_lng}
        pickerKind="business"
      />
    </article>
  );
}
