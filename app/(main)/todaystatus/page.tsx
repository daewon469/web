"use client";

import { Stats, type TodayStatusResponse } from "@/lib/api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-black bg-white px-4 py-3">
      <p className="text-sm font-bold text-gray-700">{label}</p>
      <p className={`mt-1 text-xl font-black ${accent ? "text-[#4A6CF7]" : "text-[#0B1B3A]"}`}>
        {value}
      </p>
    </div>
  );
}

export default function TodayStatusPage() {
  const [data, setData] = useState<TodayStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await Stats.today();
    setData(res);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
    const timer = window.setInterval(load, 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/myboard" className="text-sm text-[#4A6CF7]">
        ← 마이메뉴
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0B1B3A]">오늘의 현황</h1>
          {data?.date && <p className="text-sm text-gray-500">({data.date})</p>}
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-bold"
        >
          새로고침
        </button>
      </div>

      {loading && <p className="py-12 text-center text-gray-500">불러오는 중...</p>}

      {!loading && data && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="전체 회원" value={String(data.total_users)} />
          <StatCard label="오늘 신규회원" value={String(data.new_users)} accent />
          <StatCard label="전체 방문자수" value={String(data.total_visitors ?? 0)} />
          <StatCard label="오늘 방문자수" value={String(data.today_visitors ?? 0)} accent />
          <StatCard label="전체 구인글" value={String(data.total_job_posts ?? 0)} />
          <StatCard label="오늘 구인글" value={String(data.today_job_posts ?? 0)} accent />
          <StatCard label="전체 광고글" value={String(data.total_ad_posts ?? 0)} />
          <StatCard label="오늘 광고글" value={String(data.today_ad_posts ?? 0)} accent />
          <StatCard label="전체 수다글" value={String(data.total_chat_posts ?? 0)} />
          <StatCard label="오늘 수다글" value={String(data.today_chat_posts ?? 0)} accent />
        </div>
      )}
    </div>
  );
}
