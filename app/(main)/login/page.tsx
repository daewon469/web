"use client";

import { Auth } from "@/lib/api";
import { getApiErrorMessage, LOGIN_FAIL_MESSAGE } from "@/lib/authErrors";
import { setLoggedIn } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await Auth.logIn(username, password);
      if (res.status === 0 && res.token) {
        setLoggedIn(username, res.token);
        window.dispatchEvent(new Event("session-updated"));
        router.replace("/list");
        return;
      }
      setError(
        res.status === 1 ? (res.detail ?? LOGIN_FAIL_MESSAGE) : LOGIN_FAIL_MESSAGE,
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, LOGIN_FAIL_MESSAGE));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-[#0B1B3A]">로그인</h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 닉네임</label>
          <input
            type="text"
            placeholder="닉네임을 입력해 주세요."
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-black bg-[#f9f9f9] px-3 py-3 outline-none focus:ring-2 focus:ring-[#4A6CF7]"
          />
        </div>

        <div>
          <label className="mb-2 block pl-1 text-[15px]">※ 비밀번호</label>
          <div className="flex items-center rounded-xl border border-black bg-[#f9f9f9]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력해 주세요."
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3 outline-none"
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

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-[#4A6CF7] py-3 text-center font-bold text-white disabled:opacity-60"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <Link href="/signup" className="text-blue-600 hover:underline">
          회원가입
        </Link>
        <div className="flex gap-3">
          <Link href="/findid" className="text-gray-600 hover:underline">
            아이디 찾기
          </Link>
          <Link href="/resetpassword" className="text-gray-600 hover:underline">
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  );
}
