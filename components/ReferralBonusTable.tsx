import { REFERRAL_GRADE_BONUS_ROWS } from "@/lib/userGrade";

const GRADE_COLORS: Record<string, string> = {
  레전드: "#A67C00",
  챌린저: "#C2410C",
  마스터: "#36454F",
  프로: "#E11D48",
  세미프로: "#4A6CF7",
  아마추어: "#1B8A3A",
  일반회원: "#6B7280",
};

export default function ReferralBonusTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="grid grid-cols-[18px_minmax(76px,1fr)_minmax(90px,1fr)_minmax(112px,1.2fr)] items-center border-b border-gray-200 bg-[#F8F9FA] px-3 py-2 text-[13px] font-black text-[#4A6CF7]">
        <span aria-hidden />
        <span>등급</span>
        <span className="text-right">추천인 명수</span>
        <span className="text-right">추가지급</span>
      </div>
      {REFERRAL_GRADE_BONUS_ROWS.map((row) => (
        <div
          key={row.grade}
          className="grid grid-cols-[18px_minmax(76px,1fr)_minmax(90px,1fr)_minmax(112px,1.2fr)] items-center border-b border-gray-100 px-3 py-2 text-sm font-bold last:border-b-0"
        >
          <span className="text-[#111]" aria-hidden>
            ※
          </span>
          <span style={{ color: GRADE_COLORS[row.grade] ?? "#111" }}>{row.grade}</span>
          <span className="text-right text-[#111]">{row.count}</span>
          <span className="text-right text-[#111]">{row.bonus}</span>
        </div>
      ))}
    </div>
  );
}
