import type { Metadata } from "next";
import { resolveMediaUrl, type Post } from "./api";
import { SITE_URL } from "./site";

export const SITE_NAME = "분양프로";
export const SITE_DESCRIPTION =
  "분양상담사 구인구직에 최적화된 커뮤니티. 구인 현장 조회, 등록, 지역·맞춤 필터, 추천·포인트 혜택.";

function stripText(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function defaultMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: ["분양", "구인", "분양상담사", "현장", "분양프로"],
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}

export function pageMetadata(title: string, description?: string): Metadata {
  const desc = description ?? SITE_DESCRIPTION;
  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: desc,
    },
  };
}

export function buildPostMetadata(post: Post): Metadata {
  const title = post.title;
  const description = stripText(post.content || post.title);
  const image = resolveMediaUrl(post.image_url);
  const url = `${SITE_URL}/${post.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: post.created_at,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}
