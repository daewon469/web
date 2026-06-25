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

function buildWorkItems(post: Post) {
  const rows = [
    { use: post.item1_use, label: post.item1_type || "업무1", value: post.item1_sup },
    { use: post.item2_use, label: post.item2_type || "업무2", value: post.item2_sup },
    { use: post.item3_use, label: post.item3_type || "업무3", value: post.item3_sup },
    { use: post.item4_use, label: post.item4_type || "업무4", value: post.item4_sup },
  ];
  return rows.filter((row) => row.use);
}

export default function AdPostDetail({ post }: { post: Post }) {
  const imageUri = resolveMediaUrl(post.image_url);
  const highlightColor =
    post.highlight_color === "white" || post.highlight_color === "black"
      ? "#000"
      : post.highlight_color || "#000";

  const workItems = buildWorkItems(post);
  const hasContact = Boolean(post.agent?.trim() || post.agency_call?.trim());

  const infoSections: { key: string; content: ReactNode }[] = [];

  if (post.job_industry?.trim()) {
    infoSections.push({
      key: "job",
      content: <InfoRow label="업무 분류" value={post.job_industry} />,
    });
  }

  if (post.company_agency?.trim()) {
    infoSections.push({
      key: "company",
      content: <InfoRow label="상호" value={post.company_agency} />,
    });
  }

  if (workItems.length > 0) {
    infoSections.push({
      key: "work",
      content: workItems.map((item, index) => (
        <p key={item.label} className={index > 0 ? "mt-3 text-base" : "text-base"}>
          {item.label} :{" "}
          <span className="font-semibold">{item.value?.trim() ? item.value : "-"}</span>
        </p>
      )),
    });
  }

  if (hasContact) {
    infoSections.push({
      key: "contact",
      content: (
        <>
          {post.agent ? <InfoRow label="담당자" value={post.agent} /> : null}
          {post.agency_call ? (
            <InfoRow
              label="연락처"
              value={formatPhone(post.agency_call)}
              className={post.agent ? "mt-3 text-base" : "text-base"}
            />
          ) : null}
        </>
      ),
    });
  }

  return (
    <article className="flex flex-col gap-1 bg-[#f5f5f5] lg:gap-4">
      <div className="flex min-w-0 items-center justify-between rounded-lg border border-black bg-[#f9f9f9] p-4">
        <span className="font-semibold">{post.author?.username}</span>
        <span className="text-sm text-gray-600">
          {new Date(post.created_at).toLocaleString("ko-KR")}
        </span>
      </div>

      <DetailSection>
        <h1 className="break-words text-2xl font-bold text-[#0B1B3A] lg:text-3xl">{post.title}</h1>

        {imageUri ? (
          <div className="relative mt-3 flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-lg border border-black bg-black lg:min-h-[480px]">
            <Image
              src={imageUri}
              alt=""
              fill
              className="object-contain"
              unoptimized
              sizes="(min-width: 1024px) 960px, 100vw"
              priority
            />
          </div>
        ) : null}

        {post.highlight_content ? (
          <p
            className="mt-3 break-words border-t border-black/15 pt-3 text-base font-bold lg:mt-4 lg:text-lg"
            style={{ color: highlightColor }}
          >
            {post.highlight_content}
          </p>
        ) : null}
      </DetailSection>

      {infoSections.map((section) => (
        <DetailSection key={section.key}>{section.content}</DetailSection>
      ))}

      <DetailSection className="min-w-0">
        <div
          className="break-words whitespace-pre-wrap text-base leading-8 text-gray-900 lg:text-[17px] [&_*]:max-w-full"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </DetailSection>

      <AddressMapSection
        title="사업지 주소"
        placeholder="사업지 주소"
        address={post.business_address}
        lat={post.business_lat}
        lng={post.business_lng}
        pickerKind="business"
      />
    </article>
  );
}
