import { AxiosError, isAxiosError } from "axios";

export const LOGIN_FAIL_MESSAGE = "아이디 또는 비밀번호를 확인하세요.";
export const NETWORK_FAIL_MESSAGE = "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
export const SERVER_FAIL_MESSAGE = "서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

function extractDetail(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (Array.isArray(detail) && detail.length > 0) {
    const first = String(detail[0] ?? "").trim();
    return first || null;
  }
  return null;
}

export function isNetworkError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    const msg = String((error as { message?: string })?.message ?? "").trim();
    return msg === "Network Error";
  }
  return !error.response;
}

export function getApiErrorMessage(error: unknown, fallback = SERVER_FAIL_MESSAGE): string {
  if (isNetworkError(error)) return NETWORK_FAIL_MESSAGE;

  if (!isAxiosError(error)) {
    const msg = String((error as { message?: string })?.message ?? "").trim();
    return msg && msg !== "Network Error" ? msg : fallback;
  }

  const ax = error as AxiosError;
  const detail = extractDetail(ax.response?.data);
  if (detail && detail !== "Network Error") return detail;

  const status = ax.response?.status;
  if (status === 400) return "입력 정보를 확인해 주세요.";
  if (status === 401) return LOGIN_FAIL_MESSAGE;
  if (status && status >= 500) return SERVER_FAIL_MESSAGE;

  return fallback;
}
