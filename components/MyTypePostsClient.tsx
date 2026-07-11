"use client";

import { Auth, Posts, type Post, type StatusType } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Tab = StatusType | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "published", label: "게시내역" },
  { key: "closed", label: "마감내역" },
];

export default function MyTypePostsClient({
  postType,
  title,
  editPath,
}: {
  postType: number;
  title: string;
  editPath: string;
}) {
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [actorIsOwner, setActorIsOwner] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [repostingId, setRepostingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setMe(session.username);
    Auth.getMyPageSummary(session.username).then((res) => {
      setActorIsOwner(res.status === 0 && !!res.is_owner);
    });
  }, [router]);

  const fetchList = useCallback(
    async (reset: boolean, currentCursor?: string) => {
      if (!me) return;
      setLoading(true);
      setError(null);
      try {
        const { items: list, next_cursor } = await Posts.mylist(postType, me, {
          status: tab === "all" ? undefined : tab,
          cursor: reset ? undefined : currentCursor,
          limit: 20,
        });
        setItems((prev) => (reset ? list : [...prev, ...list]));
        setCursor(next_cursor);
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "목록을 불러오지 못했습니다."));
      } finally {
        setLoading(false);
      }
    },
    [me, tab, postType],
  );

  useEffect(() => {
    if (!me) return;
    setCursor(undefined);
    setItems([]);
    fetchList(true);
  }, [tab, me, fetchList]);

  const onDelete = async (post: Post) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const prev = items;
    setItems((p) => p.filter((i) => i.id !== post.id));
    try {
      await Posts.remove(post.id);
    } catch {
      alert("삭제에 실패했습니다.");
      setItems(prev);
    }
  };

  const onChangeStatus = async (post: Post, status: StatusType) => {
    const prev = items;
    setItems((p) => p.map((i) => (i.id === post.id ? { ...i, status } : i)));
    try {
      await Posts.changeStatus(post.id, status);
    } catch {
      alert("상태 변경에 실패했습니다.");
      setItems(prev);
    }
  };

  const onRecreate = async (post: Post) => {
    if (!me || !confirm("동일한 글을 복사해서 새 글로 등록할까요?")) return;
    setRepostingId(post.id);
    try {
      await Posts.recreate(post.id, me);
      alert("재등록되었습니다.");
      setCursor(undefined);
      await fetchList(true);
    } catch (e: unknown) {
      alert(getApiErrorMessage(e, "재등록에 실패했습니다."));
    } finally {
      setRepostingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Link href="/myboard" className="text-sm text-[#4A6CF7]">
        ← 마이메뉴
      </Link>
      <h1 className="text-xl font-bold text-[#0B1B3A]">{title}</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              tab === t.key
                ? "border-[#4A6CF7] bg-[#4A6CF7] text-white"
                : "border-black bg-white text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && items.length === 0 && (
        <p className="py-12 text-center text-gray-500">내 글이 없습니다.</p>
      )}

      {items.map((item) => {
        const canDelete =
          typeof item.community?.is_owner === "boolean"
            ? item.community.is_owner
            : Boolean(item.is_owner ?? actorIsOwner);

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-black bg-white p-4 shadow-sm"
          >
            <h2 className="text-base font-bold">{item.title}</h2>
            <p className="mt-1 text-sm font-medium text-[#4A6CF7]">
              작성자 {item.author?.username ?? "-"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-gray-700">
              {item.content.replace(/<[^>]+>/g, "")}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {item.status === "published" ? "게시중" : "마감"} · {item.created_at?.slice(0, 10)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <ActionBtn
                label={repostingId === item.id ? "재등록 중..." : "재등록"}
                onClick={() => onRecreate(item)}
                disabled={repostingId === item.id}
              />
              <ActionBtn
                label="수정"
                onClick={() => router.push(`${editPath}?id=${item.id}`)}
              />
              <ActionBtn
                label="마감"
                onClick={() => onChangeStatus(item, "closed")}
                disabled={item.status === "closed"}
              />
              <ActionBtn
                label="게시"
                onClick={() => onChangeStatus(item, "published")}
                disabled={item.status === "published"}
              />
              {canDelete && (
                <ActionBtn label="삭제" danger onClick={() => onDelete(item)} />
              )}
            </div>
          </div>
        );
      })}

      {cursor && !loading && (
        <button
          type="button"
          onClick={() => fetchList(false, cursor)}
          className="rounded-xl border border-gray-300 bg-white py-3 font-bold"
        >
          더 보기
        </button>
      )}
      {loading && <p className="py-4 text-center text-gray-500">불러오는 중...</p>}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold disabled:opacity-35 ${
        danger ? "border-red-400 text-red-500" : "border-black text-black"
      }`}
    >
      {label}
    </button>
  );
}
