"use client";

import { Auth } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession, setLoggedOut } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const GRADE_LABELS: Record<number, string> = {
  [-1]: "일반회원",
  0: "아마추어",
  1: "세미프로",
  2: "프로",
  3: "마스터",
  4: "레전드",
};

export default function MyBoardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    signup_date: string | null;
    user_grade: number;
    point_balance: number;
    cash_balance: number;
    referral_code: string | null;
    referral_count: number;
    posts: { type1: number; type3: number; type4: number; type6?: number };
  } | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);

    (async () => {
      try {
        const res = await Auth.getMyPageSummary(session.username!);
        if (res.status !== 0) {
          setError("회원 정보를 불러올 수 없습니다.");
          return;
        }
        setSummary({
          signup_date: res.signup_date,
          user_grade: res.user_grade ?? -1,
          point_balance: res.point_balance ?? 0,
          cash_balance: res.cash_balance ?? 0,
          referral_code: res.referral_code ?? null,
          referral_count: res.referral_count ?? 0,
          posts: res.posts,
        });
      } catch (e: unknown) {
        setError(getApiErrorMessage(e, "회원 정보를 불러오는데 실패했습니다."));
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = () => {
    if (!confirm("정말 로그아웃할까요?")) return;
    setLoggedOut();
    Auth.logOut();
    router.replace("/login");
  };

  if (loading) {
    return <p className="py-12 text-center text-gray-500">불러오는 중...</p>;
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl bg-white p-6 text-center text-red-600">
        {error ?? "정보를 불러올 수 없습니다."}
      </div>
    );
  }

  const menuItems = [
    { label: "내 구인글", count: summary.posts.type1, href: "/mypage", soon: false },
    { label: "내 커뮤니티글", count: summary.posts.type3, href: "/mypage3", soon: true },
    { label: "내 광고글", count: summary.posts.type4, href: "/mypage4", soon: true },
    { label: "포인트", count: summary.point_balance, href: "/points", soon: false },
    { label: "캐시", count: summary.cash_balance, href: "/cash", soon: false },
    { label: "분양 뉴스", count: null, href: "/list2", soon: false },
    { label: "커뮤니티", count: null, href: "/list3", soon: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-[#0B1B3A]">마이메뉴</h1>
        <p className="mt-2 text-sm text-gray-600">
          {username} · {GRADE_LABELS[summary.user_grade] ?? "일반회원"}
        </p>
        {summary.signup_date && (
          <p className="text-xs text-gray-500">가입일: {summary.signup_date}</p>
        )}
        {summary.referral_code && (
          <p className="mt-2 text-sm">
            추천코드: <span className="font-bold text-[#4A6CF7]">{summary.referral_code}</span>
            <span className="ml-2 text-gray-500">(추천 {summary.referral_count}명)</span>
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.soon ? "#" : item.href}
            onClick={item.soon ? (e) => e.preventDefault() : undefined}
            className="flex items-center justify-between border-b border-gray-100 px-5 py-4 last:border-b-0 hover:bg-gray-50"
          >
            <span className="font-medium">{item.label}</span>
            <span className="text-sm text-gray-500">
              {item.count != null ? item.count.toLocaleString() : ""}
              {item.soon && <span className="ml-2 text-xs text-gray-400">(준비 중)</span>}
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl border border-gray-300 bg-white py-3 font-bold text-gray-700"
      >
        로그아웃
      </button>
    </div>
  );
}
