"use client";

import AddressMapSection from "@/components/AddressMapSection";
import { resolveMediaUrl, type Post } from "@/lib/api";
import Image from "next/image";
import type { ReactNode } from "react";

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

function DetailSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`${sectionClass} min-w-0 ${className}`.trim()}>{children}</section>
  );
}

function InfoRow({
  label,
  value,
  className = "text-base",
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <p className={`break-words ${className}`}>
      {label} : <span className="font-semibold">{value?.trim() ? value : "-"}</span>
    </p>
  );
}

function buildRoleFees(post: Post) {
  return [
    { label: "총괄", fee: post.total_fee, use: post.total_use },
    { label: "본부장", fee: post.branch_fee, use: post.branch_use },
    { label: "본부", fee: post.hq_fee, use: post.hq_use },
    { label: "팀장", fee: post.leader_fee, use: post.leader_use },
    { label: "팀원", fee: post.member_fee, use: post.member_use },
    { label: "팀", fee: post.team_fee, use: post.team_use },
    { label: "각개", fee: post.each_fee, use: post.each_use },
    { label: String(post.other_role_name ?? ""), fee: post.other_role_fee, use: !!post.other_role_name },
  ].filter((row) => row.use);
}

function buildWelfareItems(post: Post) {
  const items: { label: string; value?: string }[] = [];
  if (post.pay_use) items.push({ label: "일비", value: wonOrSupport(post.pay_sup) });
  if (post.meal_use) items.push({ label: "케터링", value: post.meal_sup ? "지원" : "미지원" });
  if (post.house_use) items.push({ label: "숙소", value: post.house_sup || "지원" });
  if (post.item1_use && post.item1_type) {
    items.push({ label: post.item1_type, value: wonOrBlank(post.item1_sup) });
  }
  if (post.item2_use && post.item2_type) {
    items.push({ label: post.item2_type, value: wonOrBlank(post.item2_sup) });
  }
  if (post.item3_use && post.item3_type) {
    items.push({ label: post.item3_type, value: wonOrBlank(post.item3_sup) });
  }
  if (post.item4_use && post.item4_type) {
    items.push({ label: post.item4_type, value: wonOrBlank(post.item4_sup) });
  }
  return items;
}

export default function JobPostDetail({ post }: { post: Post }) {
  const imageUri = resolveMediaUrl(post.image_url);
  const highlightColor =
    post.highlight_color === "white" || post.highlight_color === "black"
      ? "#000"
      : post.highlight_color || "#000";

  const welfareItems = buildWelfareItems(post);
  const roleFees = buildRoleFees(post);

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

  const companyRows = [
    { label: "시행사", value: post.company_developer },
    { label: "시공사", value: post.company_constructor },
    { label: "신탁사", value: post.company_trustee },
    { label: "대행사", value: post.company_agency },
  ];

  return (
    <article className="flex flex-col gap-1 bg-[#f5f5f5] lg:gap-4">
      <div className="flex min-w-0 items-center justify-between rounded-lg border border-black bg-[#f9f9f9] p-4">
        <span className="font-semibold">{post.author?.username}</span>
        <span className="text-sm text-gray-600">
          {new Date(post.created_at).toLocaleString("ko-KR")}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-1 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-4">
        <DetailSection className="flex h-full min-h-0 min-w-0 flex-col">
          <h1 className="shrink-0 break-words text-2xl font-bold text-[#0B1B3A] lg:text-3xl">
            {post.title}
          </h1>

          {imageUri ? (
            <div className="relative mt-3 flex min-h-[200px] w-full flex-1 items-center justify-center overflow-hidden rounded-lg border border-black bg-black">
              <Image
                src={imageUri}
                alt=""
                fill
                className="object-contain"
                unoptimized
                sizes="(min-width: 1024px) 480px, 100vw"
                priority
              />
            </div>
          ) : (
            <div className="hidden flex-1 lg:block" aria-hidden />
          )}

          {post.highlight_content ? (
            <p
              className="mt-3 shrink-0 break-words border-t border-black/15 pt-3 text-base font-bold lg:mt-4 lg:text-lg"
              style={{ color: highlightColor }}
            >
              {post.highlight_content}
            </p>
          ) : null}
        </DetailSection>

        <div className="flex h-full min-h-0 min-w-0 flex-col gap-1 lg:gap-4">
          <DetailSection>
            <InfoRow label="업종" value={post.job_industry} />
            <InfoRow
              label="지역"
              value={[post.province, post.city].filter(Boolean).join(" ")}
              className="mt-3 text-base"
            />
          </DetailSection>

          <DetailSection>
            <p className="text-base">
              모집 : <span className="font-semibold">{roles.join("/") || "미정"}</span>
            </p>
            {roleFees.map((row, index) => (
              <p key={row.label} className={index === 0 ? "mt-3 text-[15px]" : "mt-2 text-[15px]"}>
                {row.label} : <span className="font-semibold">{feeLineText(row.fee)}</span>
              </p>
            ))}
          </DetailSection>

          <DetailSection>
            {companyRows.map((row, index) => (
              <InfoRow
                key={row.label}
                label={row.label}
                value={row.value}
                className={index > 0 ? "mt-3 text-base" : "text-base"}
              />
            ))}
          </DetailSection>

          <DetailSection>
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
          </DetailSection>

          <DetailSection className="flex flex-1 flex-col">
            <p className="text-base">
              {post.agent} : <span className="font-semibold">{formatPhone(post.agency_call)}</span>
            </p>
          </DetailSection>
        </div>
      </div>

      <DetailSection className="min-w-0">
        <div
          className="break-words whitespace-pre-wrap text-base leading-8 text-gray-900 lg:text-[17px] [&_*]:max-w-full"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </DetailSection>

      <div className="flex min-w-0 flex-col gap-1 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-4">
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
      </div>
    </article>
  );
}
