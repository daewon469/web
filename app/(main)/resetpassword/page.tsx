"use client";

import { Auth } from "@/lib/api";
import { getApiErrorMessage, resolvePhoneVerifyMessage } from "@/lib/authErrors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const mobile = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const inputClass =
  "w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    if (!phoneNumber.trim()) return setError("전화번호를 입력해주세요.");
    setError(null);
    try {
      const res = await Auth.sendPhoneVerification(phoneNumber.trim());
      if (res.status === 0 && res.verification_id) {
        setVerificationId(res.verification_id);
        setSent(true);
        setVerified(false);
        setPhoneCode("");
        alert("인증번호를 발송했습니다.");
      }
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "인증번호 발송에 실패했습니다."));
    }
  };

  const verifyCode = async () => {
    if (!verificationId) return setError("먼저 인증번호를 발송해주세요.");
    if (!phoneCode.trim()) return setError("인증번호를 입력해주세요.");
    setError(null);
    try {
      const res = await Auth.verifyPhoneCode(verificationId, phoneCode.trim());
      if (res.status === 0 && res.verified) {
        setVerified(true);
        alert("휴대폰 인증이 완료되었습니다.");
        return;
      }
      setError(resolvePhoneVerifyMessage(res.status) ?? "인증에 실패했습니다.");
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "인증에 실패했습니다."));
    }
  };

  const resetPassword = async () => {
    if (!username.trim()) return setError("아이디(닉네임)를 입력해주세요.");
    if (!verified || !verificationId) return setError("휴대폰 인증을 완료해주세요.");
    if (!newPw || newPw.length < 2) return setError("새 비밀번호는 최소 2글자 이상이어야 합니다.");
    if (newPw !== newPw2) return setError("새 비밀번호가 일치하지 않습니다.");
    setError(null);
    try {
      const res = await Auth.resetPasswordByPhone(
        username.trim(),
        phoneNumber.trim(),
        verificationId,
        newPw,
        newPw2,
      );
      if (res.status === 0) {
        alert("비밀번호가 재설정되었습니다.");
        router.replace("/login");
        return;
      }
      setError(res.detail ?? "비밀번호 재설정에 실패했습니다.");
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "비밀번호 재설정에 실패했습니다."));
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-[#0B1B3A]">비밀번호 찾기</h1>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          아이디(닉네임)
          <input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <div>
          <label className="mb-2 block text-sm font-medium">휴대폰 번호</label>
          <div className="flex items-center rounded-xl border border-black bg-[#f9f9f9]">
            <input
              type="tel"
              placeholder="010-1234-5678"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(mobile(e.target.value));
                setVerificationId(null);
                setPhoneCode("");
                setSent(false);
                setVerified(false);
              }}
              className="flex-1 bg-transparent px-3 py-3 outline-none"
            />
            <button
              type="button"
              onClick={sendCode}
              disabled={!phoneNumber.trim()}
              className="border-l border-black px-3 py-2 text-sm font-bold text-[#4A6CF7] disabled:opacity-50"
            >
              {sent ? "재전송" : "인증"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">인증번호</label>
          <div className="flex items-center rounded-xl border border-black bg-[#f9f9f9]">
            <input
              type="text"
              inputMode="numeric"
              placeholder="인증번호 6자리"
              maxLength={6}
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              className="flex-1 bg-transparent px-3 py-3 outline-none"
            />
            <button
              type="button"
              onClick={verifyCode}
              disabled={!phoneCode.trim()}
              className="border-l border-black px-3 py-2 text-sm font-bold text-[#4A6CF7] disabled:opacity-50"
            >
              확인
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          새 비밀번호
          <input
            type="password"
            className={inputClass}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          새 비밀번호 확인
          <input
            type="password"
            className={inputClass}
            value={newPw2}
            onChange={(e) => setNewPw2(e.target.value)}
          />
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={resetPassword}
          className="rounded-2xl bg-[#4A6CF7] py-3 font-bold text-white"
        >
          비밀번호 재설정
        </button>
      </div>

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인으로
        </Link>
        {" · "}
        <Link href="/findid" className="text-blue-600 hover:underline">
          아이디 찾기
        </Link>
      </p>
    </div>
  );
}
