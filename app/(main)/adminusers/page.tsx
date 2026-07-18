"use client";

import {
  AdminUsers,
  Auth,
  OwnerUsers,
  type AdminUserListItem,
} from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [actor, setActor] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<AdminUserListItem | null>(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [restrictDays, setRestrictDays] = useState({ p1: "", p3: "", p4: "" });

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setActor(session.username);
    Auth.getMyPageSummary(session.username).then((res) => {
      const admin = res.status === 0 && !!res.admin_acknowledged;
      const owner = res.status === 0 && !!res.is_owner;
      setIsOwner(owner);
      if (!admin && !owner) router.replace("/myboard");
    });
  }, [router]);

  useEffect(() => {
    const t = window.setTimeout(() => setQuery(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!actor) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await AdminUsers.list(actor, null, 50, query || null);
        if (cancelled) return;
        if (res.status === 3) {
          router.replace("/myboard");
          return;
        }
        if (res.status !== 0) throw new Error("목록을 불러올 수 없습니다.");
        setItems(res.items ?? []);
        setCursor(res.next_cursor);
      } catch (e: unknown) {
        if (!cancelled) setError(getApiErrorMessage(e, "회원 목록을 불러오지 못했습니다."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actor, query, router]);

  const loadMore = async () => {
    if (!actor || !cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await AdminUsers.list(actor, cursor, 50, query || null);
      if (res.status === 0) {
        setItems((prev) => [...prev, ...(res.items ?? [])]);
        setCursor(res.next_cursor);
      }
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "더 불러오지 못했습니다."));
    } finally {
      setLoadingMore(false);
    }
  };

  const sendNotify = async () => {
    if (!actor || !selected) return;
    const res = await AdminUsers.notifyUser(
      selected.nickname,
      actor,
      notifyTitle,
      notifyBody,
    );
    if (res.status === 0) {
      alert("알림을 보냈습니다.");
      setSelected(null);
    } else {
      alert("알림 전송에 실패했습니다.");
    }
  };

  const grantPoints = async () => {
    if (!actor || !selected || !isOwner) return;
    const amount = Number(grantAmount.replace(/[^0-9]/g, ""));
    if (!amount) return alert("포인트 금액을 입력하세요.");
    const res = await OwnerUsers.grantPoints(
      selected.nickname,
      actor,
      amount,
      grantReason || "관리자 지급",
    );
    if (res.status === 0) {
      alert("포인트를 지급했습니다.");
      setSelected(null);
    } else {
      alert("포인트 지급에 실패했습니다.");
    }
  };

  const toggleAdmin = async () => {
    if (!actor || !selected || !isOwner) return;
    const next = !selected.admin_acknowledged;
    const res = await OwnerUsers.setAdminAcknowledged(selected.nickname, actor, next);
    if (res.status === 0) {
      setItems((prev) =>
        prev.map((u) =>
          u.nickname === selected.nickname ? { ...u, admin_acknowledged: next } : u,
        ),
      );
      setSelected((s) => (s ? { ...s, admin_acknowledged: next } : s));
      alert(next ? "관리자로 지정했습니다." : "관리자 권한을 해제했습니다.");
    } else {
      alert("처리에 실패했습니다.");
    }
  };

  const applyRestrictions = async () => {
    if (!actor || !selected) return;
    const changes: Array<{ post_type: number; days: number }> = [];
    if (restrictDays.p1) changes.push({ post_type: 1, days: Number(restrictDays.p1) });
    if (restrictDays.p3) changes.push({ post_type: 3, days: Number(restrictDays.p3) });
    if (restrictDays.p4) changes.push({ post_type: 4, days: Number(restrictDays.p4) });
    if (!changes.length) return alert("제한 일수를 입력하세요.");
    const res = await AdminUsers.setRestrictions(selected.nickname, actor, changes);
    if (res.status === 0) {
      alert("글쓰기 제한을 적용했습니다.");
      setRestrictDays({ p1: "", p3: "", p4: "" });
    } else {
      alert("제한 적용에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#0B1B3A]">회원 관리</h1>

      <input
        className="rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none"
        placeholder="닉네임·이름 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}

      <div className="overflow-hidden rounded-xl border border-black bg-white">
        {items.map((user) => (
          <button
            key={user.nickname}
            type="button"
            onClick={() => setSelected(user)}
            className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
          >
            <div>
              <p className="font-bold">{user.nickname}</p>
              {user.name && <p className="text-xs text-gray-500">{user.name}</p>}
            </div>
            <span className="text-xs text-gray-500">
              {user.admin_acknowledged ? "관리자" : ""}
              {user.signup_date ? ` · ${user.signup_date}` : ""}
            </span>
          </button>
        ))}
      </div>

      {cursor && !loading && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="rounded-xl border border-gray-300 py-3 font-bold disabled:opacity-50"
        >
          {loadingMore ? "불러오는 중..." : "더 보기"}
        </button>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold">{selected.nickname}</h2>
            <p className="text-sm text-gray-500">{selected.name}</p>

            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm font-bold text-[#4A6CF7]">알림 보내기</p>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="제목"
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
              />
              <textarea
                className="min-h-[72px] rounded-lg border px-3 py-2 text-sm"
                placeholder="내용"
                value={notifyBody}
                onChange={(e) => setNotifyBody(e.target.value)}
              />
              <button
                type="button"
                onClick={sendNotify}
                className="rounded-lg bg-[#4A6CF7] py-2 text-sm font-bold text-white"
              >
                알림 전송
              </button>

              <p className="text-sm font-bold text-[#4A6CF7]">글쓰기 제한 (일수)</p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="rounded-lg border px-2 py-2 text-sm"
                  placeholder="구인"
                  value={restrictDays.p1}
                  onChange={(e) => setRestrictDays((d) => ({ ...d, p1: e.target.value }))}
                />
                <input
                  className="rounded-lg border px-2 py-2 text-sm"
                  placeholder="커뮤니티"
                  value={restrictDays.p3}
                  onChange={(e) => setRestrictDays((d) => ({ ...d, p3: e.target.value }))}
                />
                <input
                  className="rounded-lg border px-2 py-2 text-sm"
                  placeholder="광고"
                  value={restrictDays.p4}
                  onChange={(e) => setRestrictDays((d) => ({ ...d, p4: e.target.value }))}
                />
              </div>
              <button
                type="button"
                onClick={applyRestrictions}
                className="rounded-lg border border-black py-2 text-sm font-bold"
              >
                제한 적용
              </button>

              {isOwner && (
                <>
                  <p className="text-sm font-bold text-[#4A6CF7]">오너 전용</p>
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    placeholder="포인트 금액"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                  />
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    placeholder="지급 사유"
                    value={grantReason}
                    onChange={(e) => setGrantReason(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={grantPoints}
                    className="rounded-lg border border-[#4A6CF7] py-2 text-sm font-bold text-[#4A6CF7]"
                  >
                    포인트 지급
                  </button>
                  <button
                    type="button"
                    onClick={toggleAdmin}
                    className="rounded-lg border border-black py-2 text-sm font-bold"
                  >
                    {selected.admin_acknowledged ? "관리자 해제" : "관리자 지정"}
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
