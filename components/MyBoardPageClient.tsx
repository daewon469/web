"use client";

import ReferralModal from "@/components/ReferralModal";
import MyBoardRowIcon, { type MyBoardRowIconName } from "@/components/MyBoardRowIcon";
import UserGradeBadge from "@/components/UserGradeBadge";
import { API_URL, Auth, Posts, Referral, type Post } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/authErrors";
import { getSession, setLoggedOut } from "@/lib/session";
import { getUserGradeLabel } from "@/lib/userGrade";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

type Summary = {
  signup_date: string | null;
  user_grade: number;
  point_balance: number;
  cash_balance: number;
  referral_code: string | null;
  referral_count: number;
  posts: { type1: number; type3: number; type4: number; type6?: number };
};

function formatPostDateTime(d: unknown) {
  const dt = new Date(String(d ?? ""));
  if (Number.isNaN(dt.getTime())) return "";
  const date = dt.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  const time = dt.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 min-w-0 flex-col rounded-xl border border-black bg-white p-3 shadow-sm ${className}`}
    >
      <h2 className="mb-1.5 shrink-0 text-[15px] font-bold text-[#111] sm:text-base">{title}</h2>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

function Row({
  label,
  icon,
  href,
  onClick,
}: {
  label: ReactNode;
  icon: MyBoardRowIconName;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex w-full items-center justify-between gap-2 border-t border-[#ddd] py-2 text-left text-[13px] font-medium leading-snug text-[#111] hover:bg-gray-50 sm:text-[14px]";

  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <MyBoardRowIcon name={icon} className="shrink-0 text-[#4A6CF7]" />
        <span className="min-w-0">{label}</span>
      </span>
      <MyBoardRowIcon name="chevron" size={18} className="shrink-0 text-[#666]" />
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={className}>
      {content}
    </Link>
  );
}

function BoardPreviewCard({
  title,
  moreHref,
  emptyText,
  items,
  resolveHref,
}: {
  title: ReactNode;
  moreHref: string;
  emptyText: string;
  items: Post[];
  resolveHref: (post: Post) => { href: string; external?: boolean };
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-black bg-white">
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <h2 className="text-base font-bold text-black sm:text-lg">{title}</h2>
        <Link
          href={moreHref}
          className="flex shrink-0 items-center text-xs font-medium text-[#4A6CF7] sm:text-sm"
        >
          더보기
          <span aria-hidden className="ml-0.5">
            ›
          </span>
        </Link>
      </div>
      <div className="mx-[25px] h-px shrink-0 bg-black" aria-hidden />
      <div className="min-h-0 flex-1 divide-y divide-[#ddd] overflow-hidden">
        {items.length === 0 ? (
          <p className="px-2.5 py-3 text-[12px] text-[#666]">{emptyText}</p>
        ) : (
          items.map((post) => {
            const { href, external } = resolveHref(post);
            const row = (
              <div className="flex h-7 items-center px-2">
                <span className="mr-1.5 h-1 w-1 shrink-0 rounded-full bg-black" aria-hidden />
                <span className="flex-1 truncate text-[13px] text-black sm:text-[14px]">
                  {post.title}
                </span>
                <span className="ml-1.5 shrink-0 text-[10px] text-[#666]">
                  {formatPostDateTime((post as Post & { created_at?: string }).created_at)}
                </span>
              </div>
            );
            if (external) {
              return (
                <a
                  key={post.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-gray-50"
                >
                  {row}
                </a>
              );
            }
            return (
              <Link key={post.id} href={href} className="block hover:bg-gray-50">
                {row}
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

function StarIcon({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l7.1-1.01L12 2z" />
    </svg>
  );
}

function WalletIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4A6CF7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v9a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3V7" />
      <path d="M16 14h4" />
    </svg>
  );
}

export default function MyBoardPageClient() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [referralNetworkCount, setReferralNetworkCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [news, setNews] = useState<Post[]>([]);
  const [community, setCommunity] = useState<Post[]>([]);

  useEffect(() => {
    const session = getSession();
    if (!session.isLogin || !session.username) {
      router.replace("/login");
      return;
    }
    setUsername(session.username);

    (async () => {
      try {
        const [res, newsRes, comRes] = await Promise.all([
          Auth.getMyPageSummary(session.username!),
          Posts.listByType(2, { status: "published", limit: 3 }).catch(() => ({ items: [] as Post[] })),
          Posts.listByType(3, { status: "published", limit: 3 }).catch(() => ({ items: [] as Post[] })),
        ]);
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
        setIsAdmin(!!res.admin_acknowledged);
        setIsOwner(!!res.is_owner);
        setNews((newsRes.items ?? []).slice(0, 3));
        setCommunity((comRes.items ?? []).slice(0, 3));

        try {
          const count = await Referral.networkCount(session.username!, { max_depth: 20 });
          setReferralNetworkCount(count);
        } catch {
          setReferralNetworkCount(0);
        }
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

  const handleDeleteAccount = async () => {
    if (!username) return;
    if (
      !confirm(
        "정말로 회원을 탈퇴하시겠습니까?\n탈퇴 후에는 포인트는 소멸되고, 저장기능은 복구할 수 없습니다.",
      )
    ) {
      return;
    }
    try {
      const res = await Auth.deleteUser(username);
      if (res.status === 0) {
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        setLoggedOut();
        alert("회원 탈퇴가 정상적으로 처리되었습니다.");
        router.replace("/list");
        return;
      }
      alert("회원 탈퇴 중 문제가 발생했습니다.");
    } catch {
      alert("서버 통신 중 문제가 발생했습니다.");
    }
  };

  const handleExportUsersExcel = () => {
    window.open(`${API_URL}/community/users/export`, "_blank", "noopener,noreferrer");
  };

  const handlePushSettings = () => {
    alert("브라우저 알림 설정은 기기/브라우저 설정에서 변경할 수 있습니다.");
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

  const inquiryCount = summary.posts.type6 ?? 0;
  const referralCode = summary.referral_code || "없음";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2.5 pb-6">
      <ReferralModal
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        referralCode={summary.referral_code}
      />

      {/* 상단: 사용자 카드 + 분양뉴스/수다 (5:5) */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-stretch">
        <section className="min-w-0 flex-1 rounded-2xl border border-black bg-white px-5 pb-3 pt-5 shadow-sm">
          <div className="mb-3 flex items-center">
            <div className="mr-3">
              <UserGradeBadge
                grade={summary.user_grade}
                size={56}
                bgColor={summary.user_grade === -1 ? undefined : "#f8f9fa"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline">
                <p className="text-xl font-bold text-[#111]">{username}</p>
                <p className="ml-1 text-[13px] text-[#666]">
                  ({getUserGradeLabel(summary.user_grade)})
                </p>
              </div>
              <div className="mt-1 flex items-center">
                <StarIcon color="#4A6CF7" className="shrink-0" />
                <p className="ml-1 text-[13px] font-medium text-[#666]">
                  추천인코드 {referralCode}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#ddd] pt-3">
            <Link
              href="/points"
              className="flex items-center justify-between rounded-[10px] border border-[#ddd] bg-[#f8f9fa] p-3"
            >
              <span className="flex items-center gap-1.5 text-[17px] font-bold text-black">
                <StarIcon color="#FFD700" />
                포인트
              </span>
              <span className="text-lg font-bold text-black">
                {summary.point_balance.toLocaleString()}점
              </span>
            </Link>
            <Link
              href="/cash"
              className="flex items-center justify-between rounded-[10px] border border-[#ddd] bg-[#f8f9fa] p-3"
            >
              <span className="flex items-center gap-1.5 text-base font-bold text-black">
                <WalletIcon />
                캐시
              </span>
              <span className="text-lg font-bold text-black">
                {summary.cash_balance.toLocaleString()}원
              </span>
            </Link>
          </div>
        </section>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <BoardPreviewCard
            title="분양 뉴스"
            moreHref="/list2"
            emptyText="아직 등록된 분양 뉴스가 없습니다."
            items={news}
            resolveHref={(post) => ({
              href: post.agent?.trim() || `/${post.id}`,
              external: Boolean(post.agent?.trim()),
            })}
          />
          <BoardPreviewCard
            title={
              <>
                분<span className="text-sm">양인</span> 수<span className="text-sm">다</span>
              </>
            }
            moreHref="/list3"
            emptyText="아직 등록된 커뮤니티 글이 없습니다."
            items={community}
            resolveHref={(post) => ({ href: `/${post.id}` })}
          />
        </div>
      </div>

      {/* 1~5 나란히 */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        <SectionCard title="1. 포인트 관리">
          <Row
            icon="key"
            label={
              <>
                추천하기{" "}
                <span className="font-normal text-[#666]">(코드 {referralCode})</span>
              </>
            }
            onClick={() => setReferralModalOpen(true)}
          />
          <Row icon="trophy" label="추천인 랭킹" href="/referralranking" />
          <Row
            icon="people"
            label={
              <>
                내가 추천한 회원{" "}
                <span className="font-normal text-[#666]">({summary.referral_count}명)</span>
              </>
            }
            href="/referrals"
          />
          <Row
            icon="network"
            label={
              <>
                나의 추천인 인맥{" "}
                <span className="font-normal text-[#666]">({referralNetworkCount}명)</span>
              </>
            }
            href="/referralnetwork"
          />
          <Row icon="star" label="적립/사용 내역" href="/points" />
        </SectionCard>

        <SectionCard title="2. 캐시 관리">
          <Row icon="wallet" label="캐시 충전" href="/payment/toss" />
          <Row icon="receipt" label="충전/사용 내역" href="/cash" />
        </SectionCard>

        <SectionCard title="3. 글 관리">
          <Row
            icon="work"
            label={
              <>
                내 구인글 <span className="font-normal text-[#666]">({summary.posts.type1})</span>
              </>
            }
            href="/mypage"
          />
          <Row
            icon="chats"
            label={
              <>
                내 수다글 <span className="font-normal text-[#666]">({summary.posts.type3})</span>
              </>
            }
            href="/mypage3"
          />
          <Row
            icon="campaign"
            label={
              <>
                내 광고글 <span className="font-normal text-[#666]">({summary.posts.type4})</span>
              </>
            }
            href="/mypage4"
          />
          <Row
            icon="message"
            label={
              <>
                내 문의글 <span className="font-normal text-[#666]">({inquiryCount})</span>
              </>
            }
            href="/mypage6"
          />
          <Row icon="list" label="내 알림 내역" href="/noti" />
        </SectionCard>

        <SectionCard title="4. 설정">
          <Row icon="create" label="내 정보 수정" href="/signup?mode=edit" />
          <Row icon="location" label="지역저장 설정" href="/areasite" />
          <Row icon="options" label="맞춤저장 설정" href="/customsite" />
          <Row icon="notifications" label="푸시알림 설정" onClick={handlePushSettings} />
        </SectionCard>

        <SectionCard title="5. 고객센터">
          <Row icon="help" label="공지사항" href="/list5" />
          <Row icon="message" label="문의 및 건의사항" href="/write6" />
          <Row
            icon="business"
            label="분양대행 문의"
            href={`/write7?presetTitle=${encodeURIComponent("(주)대원파트너스 분양대행 문의")}`}
          />
          <Row icon="logout" label="로그아웃" onClick={handleLogout} />
          <Row icon="person-remove" label="회원탈퇴" onClick={handleDeleteAccount} />
        </SectionCard>
      </div>

      {/* 6~7: 1~5와 동일한 카드 너비(5열 기준 1칸), 높이 맞춤 */}
      {(isAdmin || isOwner) && (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch">
          {isAdmin && (
            <div className="flex min-w-0 w-full sm:w-[calc(50%-0.3125rem)] lg:w-[calc((100%-2.5rem)/5)]">
              <SectionCard title="6. 관리자 메뉴" className="h-full w-full">
                <Row icon="notifications" label="공지사항 관리" href="/mypage5" />
                <Row icon="message" label="문의 및 건의사항 확인" href="/list6" />
                <Row
                  icon="people"
                  label={
                    <>
                      회원 관리 <span className="font-normal text-[#666]">(관리자용)</span>
                    </>
                  }
                  href="/adminusers"
                />
                <Row icon="search" label="제목검색 추천현장 관리" href="/titlesearchadmin" />
                <Row icon="albums" label="슬라이드 현장 관리" href="/slidepostsadmin" />
                <Row icon="stats" label="오늘의 현황" href="/todaystatus" />
              </SectionCard>
            </div>
          )}

          {isOwner && (
            <div className="flex min-w-0 w-full sm:w-[calc(50%-0.3125rem)] lg:w-[calc((100%-2.5rem)/5)]">
              <SectionCard title="7. 오너 메뉴" className="h-full w-full">
                <Row
                  icon="people"
                  label={
                    <>
                      회원 관리 <span className="font-normal text-[#666]">(오너용)</span>
                    </>
                  }
                  href="/adminusers"
                />
                <Row icon="message" label="분양대행 문의 확인" href="/list7" />
                <Row icon="image" label="상단배너 관리 (모바일)" href="/topbanneradmin" />
                <Row icon="images" label="하단배너 관리 (모바일)" href="/banneradmin" />
                <Row icon="image" label="데스크탑 상단배너 관리" href="/webtopbanneradmin" />
                <Row icon="images" label="데스크탑 하단배너 관리" href="/webbanneradmin" />
                <Row icon="albums" label="팝업창 관리" href="/popupadmin" />
                <Row icon="download" label="엑셀 다운로드" onClick={handleExportUsersExcel} />
              </SectionCard>
            </div>
          )}
        </div>
      )}

      <footer className="px-4 py-5 text-center text-[11px] leading-4 text-[#666]">
        <p>(주)대원파트너스 대표이사 김대원</p>
        <p>경기도 평택시 고덕면 도시지원1길 116, 113호(지1지식산업센터)</p>
        <p>사업자등록번호 219-87-04066</p>
        <p>통신판매업신고번호 제 2026-경기송탄-0005호</p>
        <p>이메일 daewon469@naver.com</p>
        <p>고객센터 031-664-1119</p>
      </footer>
    </div>
  );
}
