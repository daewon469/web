"use client";

import RegionSelectModal from "@/components/RegionSelectModal";
import { Auth } from "@/lib/api";
import {
  getApiErrorMessage,
  resolvePhoneVerifyMessage,
  resolveSignupMessage,
} from "@/lib/authErrors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const mobile = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerificationId, setPhoneVerificationId] = useState<string | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [region, setRegion] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sendPhoneCode = async () => {
    if (!phoneNumber.trim()) {
      setError("전화번호를 입력해 주세요.");
      return;
    }
    setError(null);
    try {
      setSendingSms(true);
      const res = await Auth.sendPhoneVerification(phoneNumber.trim());
      if (res.status === 0 && res.verification_id) {
        setPhoneVerificationId(res.verification_id);
        setPhoneSent(true);
        setPhoneVerified(false);
        setPhoneCode("");
        setSuccess("인증번호를 발송했습니다.");
        return;
      }
      setError("인증번호 발송에 실패했습니다.");
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "인증번호 발송에 실패했습니다."));
    } finally {
      setSendingSms(false);
    }
  };

  const verifyPhoneCode = async () => {
    if (!phoneVerificationId) {
      setError("먼저 인증번호를 발송해주세요.");
      return;
    }
    if (!phoneCode.trim()) {
      setError("인증번호를 입력해 주세요.");
      return;
    }
    setError(null);
    try {
      setVerifyingCode(true);
      const res = await Auth.verifyPhoneCode(phoneVerificationId, phoneCode.trim());
      if (res.status === 0 && res.verified) {
        setPhoneVerified(true);
        setSuccess("휴대폰 인증이 완료되었습니다.");
        return;
      }
      const verifyMsg = resolvePhoneVerifyMessage(res.status);
      setError(verifyMsg ?? "인증에 실패했습니다. 다시 시도해주세요.");
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "인증에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setVerifyingCode(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim()) return setError("닉네임을 입력해 주세요.");
    if (username.trim().length < 2) return setError("닉네임은 최소 2글자 이상이어야 합니다.");
    if (!password || password.length < 2) return setError("비밀번호는 최소 2글자 이상이어야 합니다.");
    if (password !== passwordConfirm) return setError("비밀번호가 일치하지 않습니다.");
    if (!name.trim()) return setError("성함을 입력해 주세요.");
    if (!phoneVerified) return setError("휴대폰 인증을 완료해주세요.");
    if (!region.trim()) return setError("거주지역을 입력해 주세요!");

    try {
      setSubmitting(true);
      const res = await Auth.signUp(
        username.trim(),
        password,
        passwordConfirm,
        name.trim(),
        phoneNumber.trim(),
        phoneVerificationId ?? undefined,
        region.trim(),
        referralCode.trim() || undefined,
        false,
      );
      if (res.status === 0) {
        const bonus = Number(res.referral_bonus_referred_amount ?? 0);
        const msg =
          bonus > 0
            ? `회원가입 성공! 추천인 가입 포인트 ${bonus}점 지급`
            : "회원가입 성공!";
        setSuccess(msg);
        setTimeout(() => router.replace("/login"), 1500);
        return;
      }
      setError(resolveSignupMessage(res.status, res.detail));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "회원가입에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-[#0B1B3A]">회원가입</h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 닉네임 (한글가능)</label>
          <input
            type="text"
            placeholder="닉네임을 입력해 주세요."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 비밀번호</label>
          <div className="flex items-center rounded-xl border border-black bg-[#f9f9f9]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력해 주세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3 outline-none"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="px-3 py-2 text-sm text-gray-600"
            >
              {showPassword ? "숨기기" : "표시"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 비밀번호 확인</label>
          <div className="flex items-center rounded-xl border border-black bg-[#f9f9f9]">
            <input
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="비밀번호를 한번 더 입력해 주세요."
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3 outline-none"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((v) => !v)}
              className="px-3 py-2 text-sm text-gray-600"
            >
              {showPasswordConfirm ? "숨기기" : "표시"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 성함</label>
          <input
            type="text"
            placeholder="성함을 입력해 주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 핸드폰</label>
          <div className="flex items-center rounded-xl border border-black bg-[#f9f9f9]">
            <input
              type="tel"
              placeholder="예) 010-1234-5678"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(mobile(e.target.value));
                setPhoneVerificationId(null);
                setPhoneCode("");
                setPhoneSent(false);
                setPhoneVerified(false);
              }}
              className="flex-1 bg-transparent px-3 py-3 outline-none"
            />
            <button
              type="button"
              onClick={sendPhoneCode}
              disabled={sendingSms || !phoneNumber.trim()}
              className="border-l border-black px-3 py-2 text-sm font-bold text-[#4A6CF7] disabled:opacity-50"
            >
              {phoneVerified ? "완료" : phoneSent ? "재전송" : "인증"}
            </button>
          </div>
        </div>

        {phoneSent && !phoneVerified && (
          <div>
            <label className="mb-2 block pl-1 text-[15px]">※ 인증번호</label>
            <div className="flex items-center rounded-xl border border-black bg-[#f9f9f9]">
              <input
                type="text"
                inputMode="numeric"
                placeholder="인증번호 6자리"
                maxLength={6}
                value={phoneCode}
                onChange={(e) =>
                  setPhoneCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                className="flex-1 bg-transparent px-3 py-3 outline-none"
              />
              <button
                type="button"
                onClick={verifyPhoneCode}
                disabled={verifyingCode || !phoneCode.trim()}
                className="border-l border-black px-3 py-2 text-sm font-bold text-[#4A6CF7] disabled:opacity-50"
              >
                확인
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 지역</label>
          <button
            type="button"
            onClick={() => setRegionModalOpen(true)}
            className={`${inputClass} text-left ${!region ? "text-gray-500" : ""}`}
          >
            {region || "지역 선택"}
          </button>
        </div>

        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 추천인코드 (선택)</label>
          <input
            type="text"
            placeholder="코드번호 입력 (5자리)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-2xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-60"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인
        </Link>
      </p>

      <RegionSelectModal
        open={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        onSelect={(province, city) => {
          setRegion(city === "전체" ? province : `${province} ${city}`);
        }}
      />
    </div>
  );
}
