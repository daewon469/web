"use client";

import { Auth, Posts, resolveMediaUrl } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { uploadImageFile } from "@/lib/upload";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";

export default function SimpleTypeWriteClient({
  postType,
  title,
  listPath,
  requireAdmin = false,
}: {
  postType: number;
  title: string;
  listPath: string;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = Number(searchParams.get("id") || 0);
  const presetTitle = searchParams.get("presetTitle") ?? "";
  const isEdit = Number.isFinite(editId) && editId > 0;

  const [allowed, setAllowed] = useState(!requireAdmin);
  const [checking, setChecking] = useState(requireAdmin);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [postTitle, setPostTitle] = useState(presetTitle);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }

    if (!requireAdmin) {
      setAllowed(true);
      setChecking(false);
      return;
    }

    (async () => {
      try {
        const res = await Auth.getMyPageSummary(session.username!);
        const isAdmin = res.status === 0 && !!res.admin_acknowledged;
        if (!isAdmin) {
          alert("관리자만 작성할 수 있습니다.");
          router.replace(listPath);
          return;
        }
        setAllowed(true);
      } catch {
        router.replace(listPath);
      } finally {
        setChecking(false);
      }
    })();
  }, [router, requireAdmin, listPath]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const post = await Posts.get(editId);
        setPostTitle(post.title);
        setContent(post.content.replace(/<[^>]+>/g, "\n").trim());
        setImageUrl(post.image_url ?? null);
        setImagePreview(resolveMediaUrl(post.image_url));
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
    if (!postTitle.trim()) return alert("제목을 입력하세요.");
    if (!content.trim()) return alert("내용을 입력하세요.");

    const session = getSession();
    if (!session.username) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: postTitle.trim(),
        content: content.trim(),
        status: "published" as const,
        image_url: imageUrl ?? undefined,
        post_type: postType,
      };

      if (isEdit) {
        await Posts.update(editId, payload);
        alert("수정 완료!");
      } else {
        await Posts.createByType(payload, session.username, postType);
        alert("등록 완료!");
      }
      router.push(listPath);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "저장에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  if (checking || !allowed) {
    return <p className="py-12 text-center text-gray-500">확인 중...</p>;
  }

  if (loadingPost) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Link href={listPath} className="text-sm text-[#4A6CF7]">
        ← 목록
      </Link>
      <h1 className="text-xl font-bold text-[#0B1B3A]">
        {isEdit ? `${title} 수정` : `${title} 작성`}
      </h1>

      <label className="flex flex-col gap-1 text-sm font-bold">
        제목
        <input
          className={inputClass}
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        내용
        <textarea
          className={`${inputClass} min-h-[200px]`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-bold">이미지 (선택)</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImage(e.target.files?.[0] ?? null)}
        />
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
