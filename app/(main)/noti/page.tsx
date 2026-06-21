"use client";

import { Auth, Notify, type NotificationItem } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { formatKstDatetime } from "@/lib/ledgerFormat";
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function NotiPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [list, setList] = useState<NotificationItem[]>([]);
  const [sentList, setSentList] = useState<NotificationItem[]>([]);
  const [canSeeSent, setCanSeeSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);
    setLoading(true);
    setError(null);
    try {
      const summary = await Auth.getMyPageSummary(session.username);
      const isAdmin = !!(summary?.admin_acknowledged || summary?.is_owner);
      setCanSeeSent(isAdmin);

      const rows = await Notify.getAllNotifications(session.username);
      setList(rows);

      if (isAdmin) {
        const sent = await Notify.getAdminSentNotifications(session.username, { limit: 200 });
        setSentList(sent.items ?? []);
      } else {
        setSentList([]);
      }
      window.dispatchEvent(new Event("notify-updated"));
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "알림을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const onPressItem = async (item: NotificationItem) => {
    if (!username) return;
    try {
      if (!item.is_read) {
        await Notify.markNotificationRead(item.id);
        setList((prev) =>
          prev.map((v) => (v.id === item.id ? { ...v, is_read: true } : v)),
        );
        window.dispatchEvent(new Event("notify-updated"));
      }
      const postId = item.data?.post_id;
      if (postId) router.push(`/${postId}`);
    } catch {
      alert("알림 처리에 실패했습니다.");
    }
  };

  const markAllRead = async () => {
    if (!username || markingAll) return;
    setMarkingAll(true);
    try {
      await Notify.markAllNotificationsReadByUser(username);
      setList((prev) => prev.map((v) => ({ ...v, is_read: true })));
      window.dispatchEvent(new Event("notify-updated"));
    } catch {
      alert("전체 읽음 처리에 실패했습니다.");
    } finally {
      setMarkingAll(false);
    }
  };

  const rows = tab === "inbox" ? list : sentList;
  const unread = list.filter((v) => !v.is_read).length;

  return (
    <div className="flex flex-col gap-4">
      {tab === "inbox" && unread > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll}
            className="text-sm font-bold text-[#4A6CF7] disabled:opacity-50"
          >
            {markingAll ? "처리 중..." : "전체 읽음"}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("inbox")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            tab === "inbox"
              ? "border-[#4A6CF7] bg-[#4A6CF7] text-white"
              : "border-black bg-white"
          }`}
        >
          받은 알림 {unread > 0 ? `(${unread})` : ""}
        </button>
        {canSeeSent && (
          <button
            type="button"
            onClick={() => setTab("sent")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              tab === "sent"
                ? "border-[#4A6CF7] bg-[#4A6CF7] text-white"
                : "border-black bg-white"
            }`}
          >
            보낸 내역
          </button>
        )}
      </div>

      {loading && <p className="py-8 text-center text-gray-500">불러오는 중...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!loading && rows.length === 0 && !error && (
        <p className="py-12 text-center text-gray-500">알림이 없습니다.</p>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => tab === "inbox" && onPressItem(item)}
            className={`rounded-xl border p-4 text-left ${
              item.is_read ? "border-gray-200 bg-white" : "border-[#4A6CF7]/40 bg-[#EEF4FF]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-[#0B1B3A]">{item.title}</p>
              <span className="shrink-0 text-[11px] text-gray-500">
                {formatKstDatetime(item.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{item.body}</p>
            {tab === "sent" && item.target_username && (
              <p className="mt-1 text-xs text-gray-500">수신: {item.target_username}</p>
            )}
            {tab === "inbox" && item.data?.post_id && (
              <p className="mt-2 text-xs text-[#4A6CF7]">게시글 보기 →</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
