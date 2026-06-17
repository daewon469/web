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

export default function FindIdPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

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
        setError(null);
        alert("인증번호를 발송했습니다.");
        return;
      }
      setError("인증번호 발송에 실패했습니다.");
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

  const findId = async () => {
    if (!verified || !verificationId) return setError("휴대폰 인증을 완료해주세요.");
    setError(null);
    setResult(null);
    try {
      const res = await Auth.findUsernameByPhone(phoneNumber.trim(), verificationId);
      if (res.status === 0 && res.items?.length) {
        setResult(res.items.join(", "));
        return;
      }
      setError("해당 번호로 가입된 아이디가 없습니다.");
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "아이디 찾기에 실패했습니다."));
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-[#0B1B3A]">아이디 찾기</h1>

      <div className="flex flex-col gap-4">
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
              disabled={!sent || !phoneCode.trim()}
              className="border-l border-black px-3 py-2 text-sm font-bold text-[#4A6CF7] disabled:opacity-50"
            >
              확인
            </button>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {result && (
          <div className="rounded-lg bg-[#EEF4FF] px-3 py-3 text-sm">
            <p className="font-bold text-[#0B1B3A]">찾은 아이디(닉네임)</p>
            <p className="mt-1 text-[#4A6CF7]">{result}</p>
          </div>
        )}

        <button
          type="button"
          onClick={findId}
          className="rounded-2xl bg-[#4A6CF7] py-3 font-bold text-white"
        >
          아이디 찾기
        </button>
      </div>

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인으로
        </Link>
        {" · "}
        <button type="button" onClick={() => router.push("/resetpassword")} className="text-blue-600 hover:underline">
          비밀번호 찾기
        </button>
      </p>
    </div>
  );
}
