"use client";

import { buildReferralMessage } from "@/lib/referral";

type ReferralModalProps = {
  open: boolean;
  onClose: () => void;
  referralCode: string | null;
};

export default function ReferralModal({ open, onClose, referralCode }: ReferralModalProps) {
  if (!open) return null;

  const message = buildReferralMessage(referralCode?.trim() || "");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      alert("추천 문구가 클립보드에 복사되었습니다.");
    } catch {
      alert("추천 문구 복사에 실패했습니다.");
    }
  };

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
        onClose();
        return;
      }
      await onCopy();
    } catch {
      // 사용자가 공유 취소
    }
  };

  const onSms = () => {
    const body = encodeURIComponent(message);
    window.location.href = `sms:?body=${body}`;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-black bg-white p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-modal-title"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="referral-modal-title" className="text-base font-bold text-[#0B1B3A]">
            추천하기
          </h2>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-bold"
          >
            복사하기
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          {referralCode
            ? `추천인코드(${referralCode})가 함께 전송됩니다.`
            : "추천인코드가 함께 전송됩니다."}
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onShare}
            className="rounded-xl bg-[#FEE500] py-3 font-bold text-[#111]"
          >
            공유하기 (카톡 등)
          </button>
          <button
            type="button"
            onClick={onSms}
            className="rounded-xl bg-[#4A6CF7] py-3 font-bold text-white"
          >
            문자 추천
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white py-3 font-bold text-gray-700"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
