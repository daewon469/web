import axios, { AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getSession } from "./session";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.daewon469.com";

export const resolveMediaUrl = (raw?: string | null): string | null => {
  const u = String(raw ?? "").trim();
  if (!u) return null;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/static/")) return `${API_URL}${u}`;
  if (u.startsWith("static/")) return `${API_URL}/${u}`;
  return u
    .replace(/^https?:\/\/api\.smartgauge\.co\.kr(\/|$)/i, `${API_URL}$1`)
    .replace(/^https?:\/\/smartgauge\.co\.kr(\/|$)/i, `${API_URL}$1`);
};

export type LoginResponse =
  | { status: 0; user_id: number; token: string }
  | { status: 1; detail?: string };

export type PhoneSendResponse = { status: number; verification_id?: string; expires_in_sec?: number };
export type PhoneVerifyResponse = { status: number; verified: boolean };

export type SignupResponse = {
  status: number;
  detail?: string;
  referral_bonus_referred_amount?: number;
};

export type User = {
  username: string;
  name: string | null;
  phone_number: string | null;
  region: string | null;
  custom_industry_codes: string[];
  custom_region_codes: string[];
  area_region_codes: string[];
  custom_role_codes?: string[];
};

export type PointLedgerItem = {
  id: number;
  reason: string;
  amount: number;
  created_at: string | null;
};

export type PointLedgerResponse = {
  status: number;
  items: PointLedgerItem[];
};

export type AttendanceStatusResponse = {
  status: number;
  claimed: boolean;
};

export type CashLedgerItem = {
  id: number;
  reason: string;
  amount: number;
  created_at: string | null;
};

export type CashLedgerResponse = {
  status: number;
  items: CashLedgerItem[];
};

export type StatusType = "published" | "closed";

export type PostInput = {
  title: string;
  content: string;
  image_url?: string;
  province?: string;
  city?: string;
  job_industry?: string;
  status?: StatusType;
  agency_call?: string;
  agent?: string;
  highlight_color?: string;
  highlight_content?: string;
  total_use?: boolean;
  branch_use?: boolean;
  hq_use?: boolean;
  leader_use?: boolean;
  member_use?: boolean;
  team_use?: boolean;
  each_use?: boolean;
  total_fee?: string;
  branch_fee?: string;
  hq_fee?: string;
  leader_fee?: string;
  member_fee?: string;
  team_fee?: string;
  each_fee?: string;
  other_role_name?: string | null;
  other_role_fee?: string | null;
  card_type?: number;
  workplace_lat?: number;
  workplace_lng?: number;
  business_lat?: number;
  business_lng?: number;
};

export type UserResponse = {
  status: number;
  user?: User;
};

export type MyPageSummaryResponse = {
  status: number;
  signup_date: string | null;
  user_grade?: number;
  is_owner?: boolean;
  posts: {
    type1: number;
    type3: number;
    type4: number;
    type6?: number;
  };
  point_balance?: number;
  cash_balance?: number;
  admin_acknowledged?: boolean;
  referral_code?: string | null;
  referral_count?: number;
};

export type Post = {
  id: number;
  author: { id: number; username: string; avatarUrl?: string };
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  job_industry?: string;
  province: string;
  city: string;
  status: string;
  liked: boolean;
  highlight_color?: string;
  highlight_content?: string;
  total_use?: boolean;
  branch_use?: boolean;
  hq_use?: boolean;
  leader_use?: boolean;
  member_use?: boolean;
  team_use?: boolean;
  each_use?: boolean;
  total_fee?: string;
  branch_fee?: string;
  hq_fee?: string;
  leader_fee?: string;
  member_fee?: string;
  team_fee?: string;
  each_fee?: string;
  other_role_name?: string | null;
  other_role_fee?: string | null;
  workplace_lat?: number;
  workplace_lng?: number;
  business_lat?: number;
  business_lng?: number;
  post_type?: number;
};

export type PostListCursor = string;

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === "undefined") return config;
  const { token } = getSession();
  if (token?.trim()) {
    if (!config.headers) config.headers = new AxiosHeaders();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const normalizePhoneDigits = (value: string) => (value || "").replace(/[^0-9]/g, "");

export const Auth = {
  logIn: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/community/login", {
      username,
      password,
    });
    return data;
  },

  sendPhoneVerification: async (phone_number: string): Promise<PhoneSendResponse> => {
    const { data } = await api.post<PhoneSendResponse>("/community/phone/send", {
      phone_number: normalizePhoneDigits(phone_number),
    });
    return data;
  },

  verifyPhoneCode: async (
    verification_id: string,
    code: string,
  ): Promise<PhoneVerifyResponse> => {
    const { data } = await api.post<PhoneVerifyResponse>("/community/phone/verify", {
      verification_id,
      code,
    });
    return data;
  },

  signUp: async (
    username: string,
    password: string,
    password_confirm: string,
    name?: string,
    phone_number?: string,
    phone_verification_id?: string,
    region?: string,
    referral_code?: string,
    marketing_consent?: boolean,
  ): Promise<SignupResponse> => {
    const { data } = await api.post<SignupResponse>("/community/signup", {
      username,
      password,
      password_confirm,
      name,
      phone_number: phone_number ? normalizePhoneDigits(phone_number) : undefined,
      phone_verification_id,
      region,
      referral_code: referral_code?.trim() || undefined,
      marketing_consent: !!marketing_consent,
    });
    return data;
  },

  logOut: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isLogin", "false");
      window.dispatchEvent(new Event("session-updated"));
    }
  },

  getUser: async (username: string): Promise<UserResponse> => {
    const { data } = await api.get(`/community/user/${encodeURIComponent(username)}`);
    return data;
  },

  getMyPageSummary: async (username: string): Promise<MyPageSummaryResponse> => {
    const { data } = await api.get(`/community/mypage/${encodeURIComponent(username)}`);
    return (
      data ?? {
        status: 1,
        signup_date: null,
        posts: { type1: 0, type3: 0, type4: 0, type6: 0 },
      }
    );
  },

  updateUser: async (
    username: string,
    payload: {
      area_region_codes?: string[];
      custom_industry_codes?: string[];
      custom_region_codes?: string[];
      custom_role_codes?: string[];
    },
  ) => {
    const { data } = await api.put(`/community/user/${encodeURIComponent(username)}`, payload);
    return data;
  },
};

export const Points = {
  list: async (username: string): Promise<PointLedgerResponse> => {
    const { data } = await api.get(`/community/points/${encodeURIComponent(username)}`);
    return data ?? { status: 1, items: [] };
  },

  attendanceStatus: async (username: string): Promise<AttendanceStatusResponse> => {
    const { data } = await api.get(
      `/community/points/attendance/status/${encodeURIComponent(username)}`,
    );
    return data ?? { status: 1, claimed: false };
  },

  attendanceClaim: async (username: string): Promise<AttendanceStatusResponse> => {
    const { data } = await api.post(
      `/community/points/attendance/claim/${encodeURIComponent(username)}`,
    );
    return data ?? { status: 1, claimed: false };
  },
};

export const Cash = {
  list: async (username: string): Promise<CashLedgerResponse> => {
    const { data } = await api.get(`/community/cash/${encodeURIComponent(username)}`);
    return data ?? { status: 1, items: [] };
  },
};

export const Posts = {
  list: async (opts?: {
    username?: string;
    cursor?: PostListCursor;
    status?: "published" | "closed";
    limit?: number;
    province?: string;
    city?: string;
    regions?: string;
  }): Promise<{ items: Post[]; next_cursor?: PostListCursor }> => {
    const params: Record<string, string | number> = { limit: opts?.limit ?? 50 };
    if (opts?.username) params.username = opts.username;
    if (opts?.cursor) params.cursor = opts.cursor;
    if (opts?.status) params.status = opts.status;
    if (opts?.province) params.province = opts.province;
    if (opts?.city) params.city = opts.city;
    if (opts?.regions) params.regions = opts.regions;
    try {
      const { data } = await api.get("/community/posts", { params });
      return data ?? { items: [], next_cursor: undefined };
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 401) throw e;
      return { items: [], next_cursor: undefined };
    }
  },

  get: async (id: number): Promise<Post> => {
    const { data } = await api.get(`/community/posts/${id}`);
    return data;
  },

  searchTitle: async (
    q: string,
    opts?: {
      post_type?: number;
      cursor?: PostListCursor;
      limit?: number;
      username?: string;
    },
  ): Promise<{ items: Post[]; next_cursor?: PostListCursor }> => {
    const params: Record<string, string | number> = {
      q: (q || "").trim(),
      post_type: opts?.post_type ?? 1,
      limit: opts?.limit ?? 50,
    };
    if (opts?.cursor) params.cursor = opts.cursor;
    if (opts?.username) params.username = opts.username;
    const { data } = await api.get("/community/posts/search/title", { params });
    return data ?? { items: [], next_cursor: undefined };
  },

  listLiked: async (opts: {
    username: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ items: Post[]; next_cursor?: PostListCursor }> => {
    const params: Record<string, string | number> = {};
    if (opts.cursor) params.cursor = opts.cursor;
    if (opts.limit) params.limit = opts.limit;
    const { data } = await api.get(
      `/community/posts/liked/${encodeURIComponent(opts.username)}`,
      { params },
    );
    return data ?? { items: [], next_cursor: undefined };
  },

  listCustom: async (opts?: {
    username?: string;
    cursor?: PostListCursor;
    limit?: number;
    status?: "published" | "closed";
  }): Promise<{ items: Post[]; next_cursor?: PostListCursor }> => {
    const params: Record<string, string | number> = { limit: opts?.limit ?? 50 };
    if (opts?.username) params.username = opts.username;
    if (opts?.cursor) params.cursor = opts.cursor;
    if (opts?.status) params.status = opts.status;
    try {
      const { data } = await api.get("/community/posts/custom", { params });
      return data ?? { items: [], next_cursor: undefined };
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 401) throw e;
      return { items: [], next_cursor: undefined };
    }
  },

  create: async (payload: PostInput, username: string): Promise<Post> => {
    const { data } = await api.post(`/community/posts/${encodeURIComponent(username)}`, payload);
    return data;
  },
};
