"use client";

import ReferralModal from "@/components/ReferralModal";
import { API_URL, Auth, Referral } from "@/lib/api";
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

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-black bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-bold text-[#111]">{title}</h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function Row({
  label,
  sub,
  href,
  onClick,
}: {
  label: ReactNode;
  sub?: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex w-full items-center justify-between border-t border-[#ddd] py-2.5 text-left text-[15px] font-bold text-[#111] hover:bg-gray-50";

  const content = (
    <>
      <span>{label}</span>
      {sub != null && sub !== "" && (
        <span className="text-sm font-normal text-[#666]">{sub}</span>
      )}
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
        setIsAdmin(!!res.admin_acknowledged);
        setIsOwner(!!res.is_owner);

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

  return (
    <div className="flex flex-col gap-2.5 pb-6">
      <ReferralModal
        open={referralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        referralCode={summary.referral_code}
      />

      {/* 내 정보 카드 */}
      <section className="rounded-2xl border border-black bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xl font-bold text-[#111]">{username}</p>
          <p className="mt-1 text-xs text-[#666]">
            회원등급: {getUserGradeLabel(summary.user_grade)}
          </p>
          <p className="text-xs text-[#666]">
            가입일: {summary.signup_date || "정보 없음"}
          </p>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#ddd] pt-4">
          <Link
            href="/points"
            className="flex items-center justify-between rounded-[10px] border border-[#ddd] bg-[#f8f9fa] p-3"
          >
            <span className="text-[17px] font-bold text-black">포인트</span>
            <span className="text-lg font-bold text-black">
              {summary.point_balance.toLocaleString()}점
            </span>
          </Link>
          <Link
            href="/cash"
            className="flex items-center justify-between rounded-[10px] border border-[#ddd] bg-[#f8f9fa] p-3"
          >
            <span className="text-base font-bold text-black">캐시</span>
            <span className="text-lg font-bold text-black">
              {summary.cash_balance.toLocaleString()}원
            </span>
          </Link>
        </div>
      </section>

      <SectionCard title="1. 포인트 관리">
        <Row
          label={
            <>
              추천하기{" "}
              <span className="font-normal text-[#666]">
                (추천인코드 {summary.referral_code || "없음"})
              </span>
            </>
          }
          onClick={() => setReferralModalOpen(true)}
        />
        <Row
          label={
            <>
              내가 추천한 회원{" "}
              <span className="font-normal text-[#666]">({summary.referral_count}명)</span>
            </>
          }
          href="/referrals"
        />
        <Row label="추천인 랭킹" href="/referralranking" />
        <Row
          label={
            <>
              나의 추천인 인맥{" "}
              <span className="font-normal text-[#666]">({referralNetworkCount}명)</span>
            </>
          }
          href="/referralnetwork"
        />
        <Row label="적립/사용 내역" href="/points" />
      </SectionCard>

      <SectionCard title="2. 캐시 관리">
        <Row label="캐시 충전" href="/payment/toss" />
        <Row label="충전/사용 내역" href="/cash" />
      </SectionCard>

      <SectionCard title="3. 글 관리">
        <Row
          label={
            <>
              내 구인글 <span className="font-normal text-[#666]">({summary.posts.type1})</span>
            </>
          }
          href="/mypage"
        />
        <Row
          label={
            <>
              내 수다글 <span className="font-normal text-[#666]">({summary.posts.type3})</span>
            </>
          }
          href="/mypage3"
        />
        <Row
          label={
            <>
              내 광고글 <span className="font-normal text-[#666]">({summary.posts.type4})</span>
            </>
          }
          href="/mypage4"
        />
        <Row
          label={
            <>
              내 문의글 <span className="font-normal text-[#666]">({inquiryCount})</span>
            </>
          }
          href="/mypage6"
        />
        <Row label="내 알림 내역" href="/noti" />
      </SectionCard>

      <SectionCard title="4. 설정">
        <Row label="내 정보 수정" href="/signup?mode=edit" />
        <Row label="지역저장 설정" href="/areasite" />
        <Row label="맞춤저장 설정" href="/customsite" />
        <Row label="푸시알림 설정" onClick={handlePushSettings} />
      </SectionCard>

      <SectionCard title="5. 고객센터">
        <Row label="공지사항" href="/list5" />
        <Row label="문의 및 건의사항" href="/write6" />
        <Row
          label="(주)대원파트너스 분양대행 문의"
          href={`/write7?presetTitle=${encodeURIComponent("(주)대원파트너스 분양대행 문의")}`}
        />
        <Row label="로그아웃" onClick={handleLogout} />
        <Row label="회원탈퇴" onClick={handleDeleteAccount} />
      </SectionCard>

      {isAdmin && (
        <SectionCard title="6. 관리자 메뉴">
          <Row label="공지사항 관리" href="/mypage5" />
          <Row label="문의 및 건의사항 확인" href="/list6" />
          <Row
            label={
              <>
                회원 관리 <span className="font-normal text-[#666]">(관리자용)</span>
              </>
            }
            href="/adminusers"
          />
          <Row label="제목검색 추천현장 관리" href="/titlesearchadmin" />
          <Row label="슬라이드 현장 관리" href="/slidepostsadmin" />
          <Row label="오늘의 현황" href="/todaystatus" />
        </SectionCard>
      )}

      {isOwner && (
        <SectionCard title="7. 오너 메뉴">
          <Row
            label={
              <>
                회원 관리 <span className="font-normal text-[#666]">(오너용)</span>
              </>
            }
            href="/adminusers"
          />
          <Row label="분양대행 문의 확인" href="/list7" />
          <Row label="상단배너 관리" href="/topbanneradmin" />
          <Row label="하단배너 관리" href="/banneradmin" />
          <Row label="팝업창 관리" href="/popupadmin" />
          <Row label="엑셀 다운로드" onClick={handleExportUsersExcel} />
        </SectionCard>
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
