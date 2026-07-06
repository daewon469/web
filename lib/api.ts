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

export type FindUsernameResponse = { status: number; items: string[] };
export type ResetPasswordResponse = { status: number; detail?: string | null };
export type UserUpdateResponse = { status: number; username?: string; detail?: string | null };

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
  company_agency?: string;
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
  post_type?: number;
  workplace_address?: string;
  workplace_map_url?: string;
  workplace_lat?: number;
  workplace_lng?: number;
  business_address?: string;
  business_map_url?: string;
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
  agency_call?: string;
  company_developer?: string;
  company_constructor?: string;
  company_trustee?: string;
  pay_use?: boolean;
  meal_use?: boolean;
  house_use?: boolean;
  pay_sup?: string;
  meal_sup?: boolean;
  house_sup?: string;
  item1_use?: boolean;
  item1_type?: string;
  item1_sup?: string;
  item2_use?: boolean;
  item2_type?: string;
  item2_sup?: string;
  item3_use?: boolean;
  item3_type?: string;
  item3_sup?: string;
  item4_use?: boolean;
  item4_type?: string;
  item4_sup?: string;
  workplace_address?: string;
  workplace_map_url?: string;
  workplace_lat?: number;
  workplace_lng?: number;
  business_address?: string;
  business_map_url?: string;
  business_lat?: number;
  business_lng?: number;
  post_type?: number;
  card_type?: number;
  company_agency?: string;
  is_owner?: boolean;
  community?: { is_owner?: boolean } | null;
  agent?: string;
};

export type PostPatch = Partial<PostInput>;

export type PostListCursor = string;

export type ReferralListItem = {
  id: number;
  referred_username: string;
  created_at: string | null;
};

export type ReferralListResponse = {
  status: number;
  items: ReferralListItem[];
};

export type ReferralRankingItem = {
  rank: number;
  nickname: string;
  referral_count: number;
};

export type ReferralRankingResponse = {
  status: number;
  items: ReferralRankingItem[];
};

export type ReferralNetworkItem = {
  nickname: string;
  depth: number;
  signup_date?: string | null;
  created_at?: string | null;
};

export type ReferralNetworkResponse = {
  status: number;
  total_count: number;
  items: ReferralNetworkItem[];
  next_cursor: string | null;
  reward?: { granted: boolean } | null;
};

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  type?: string;
  created_at?: string | null;
  data?: { post_id?: number; post_type?: number };
  is_read?: boolean;
  target_username?: string | null;
};

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

  findUsernameByPhone: async (
    phone_number: string,
    phone_verification_id: string,
  ): Promise<FindUsernameResponse> => {
    const { data } = await api.post<FindUsernameResponse>("/community/account/find-username", {
      phone_number: normalizePhoneDigits(phone_number),
      phone_verification_id,
    });
    return data ?? { status: 1, items: [] };
  },

  resetPasswordByPhone: async (
    username: string,
    phone_number: string,
    phone_verification_id: string,
    new_password: string,
    new_password_confirm: string,
  ): Promise<ResetPasswordResponse> => {
    const { data } = await api.post<ResetPasswordResponse>("/community/account/reset-password", {
      username,
      phone_number: normalizePhoneDigits(phone_number),
      phone_verification_id,
      new_password,
      new_password_confirm,
    });
    return data ?? { status: 1 };
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

  deleteUser: async (username: string) => {
    const { data } = await api.delete(`/community/user/${encodeURIComponent(username)}`);
    return data ?? { status: 1 };
  },

  updateUser: async (
    username: string,
    payload: {
      username?: string;
      password?: string;
      password_confirm?: string;
      name?: string;
      phone_number?: string;
      phone_verification_id?: string;
      region?: string;
      area_region_codes?: string[];
      custom_industry_codes?: string[];
      custom_region_codes?: string[];
      custom_role_codes?: string[];
    },
  ): Promise<UserUpdateResponse> => {
    const { data } = await api.put(`/community/user/${encodeURIComponent(username)}`, {
      ...payload,
      phone_number: payload.phone_number
        ? normalizePhoneDigits(payload.phone_number)
        : undefined,
      phone_verification_id: payload.phone_verification_id || undefined,
    });
    return data ?? { status: 1 };
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

  get: async (id: number, opts?: { username?: string }): Promise<Post> => {
    const params: Record<string, string> = {};
    if (opts?.username) params.username = opts.username;
    const { data } = await api.get(`/community/posts/${id}`, { params });
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

  createByType: async (
    payload: PostInput,
    username: string,
    postType: number,
  ): Promise<Post> => {
    const { data } = await api.post(
      `/community/posts/${encodeURIComponent(username)}/type/${postType}`,
      payload,
    );
    return data;
  },

  update: async (id: number, patch: PostPatch): Promise<Post> => {
    const { data } = await api.put(`/community/posts/${id}`, patch);
    return data;
  },

  changeStatus: async (id: number, status: StatusType): Promise<Post> => {
    const { data } = await api.put(`/community/posts/${id}`, { status });
    return data;
  },

  remove: async (id: number): Promise<{ ok: boolean; message: string }> => {
    const { data } = await api.delete(`/community/posts/${id}`);
    return data;
  },

  recreate: async (postId: number, username: string): Promise<Post> => {
    const { data } = await api.post(
      `/community/posts/${postId}/recreate/${encodeURIComponent(username)}`,
    );
    return data;
  },

  like: async (postId: number, username: string) => {
    try {
      const { data } = await api.post(
        `/community/posts/${postId}/like/${encodeURIComponent(username)}`,
      );
      return data ?? { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  unlike: async (postId: number, username: string) => {
    try {
      const { data } = await api.delete(
        `/community/posts/${postId}/like/${encodeURIComponent(username)}`,
      );
      return data ?? { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  listByType: async (
    postType: number,
    opts?: {
      username?: string;
      cursor?: PostListCursor;
      status?: "published" | "closed";
      limit?: number;
    },
  ): Promise<{ items: Post[]; next_cursor?: PostListCursor }> => {
    const params: Record<string, string | number> = { limit: opts?.limit ?? 50 };
    if (opts?.username) params.username = opts.username;
    if (opts?.cursor) params.cursor = opts.cursor;
    if (opts?.status) params.status = opts.status;
    try {
      const { data } = await api.get(`/community/posts/type/${postType}`, { params });
      return data ?? { items: [], next_cursor: undefined };
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 401) throw e;
      return { items: [], next_cursor: undefined };
    }
  },

  mylist: async (
    postType: number,
    username: string,
    params?: {
      cursor?: PostListCursor;
      limit?: number;
      status?: string;
    },
  ): Promise<{ items: Post[]; next_cursor?: PostListCursor }> => {
    const query: Record<string, string | number> = { limit: params?.limit ?? 20 };
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.status) query.status = params.status;
    const { data } = await api.get(
      `/community/posts/type/${postType}/my/${encodeURIComponent(username)}`,
      { params: query },
    );
    return data ?? { items: [], next_cursor: undefined };
  },
};

export const Referral = {
  listByReferrer: async (username: string): Promise<ReferralListResponse> => {
    const { data } = await api.get(
      `/community/referrals/by-referrer/${encodeURIComponent(username)}`,
    );
    return data ?? { status: 1, items: [] };
  },

  ranking: async (): Promise<ReferralRankingResponse> => {
    const { data } = await api.get("/community/referrals/ranking");
    return data ?? { status: 1, items: [] };
  },

  network: async (
    username: string,
    opts?: { limit?: number; cursor?: string | null; max_depth?: number },
  ): Promise<ReferralNetworkResponse> => {
    const { data } = await api.get(
      `/community/referrals/network/${encodeURIComponent(username)}`,
      {
        params: {
          limit: opts?.limit ?? 50,
          cursor: opts?.cursor ?? undefined,
          max_depth: opts?.max_depth ?? 20,
        },
      },
    );
    return (
      data ?? {
        status: 1,
        total_count: 0,
        items: [],
        next_cursor: null,
        reward: null,
      }
    );
  },

  networkCount: async (username: string, opts?: { max_depth?: number }): Promise<number> => {
    const { data } = await api.get(
      `/community/referrals/network/${encodeURIComponent(username)}`,
      {
        params: {
          limit: 1,
          max_depth: opts?.max_depth ?? 20,
        },
      },
    );
    if (data?.status !== 0) return 0;
    return Number(data?.total_count ?? 0);
  },
};

export const Notify = {
  getAllNotifications: async (username: string): Promise<NotificationItem[]> => {
    const { data } = await api.get(`/notify/my/${encodeURIComponent(username)}`);
    return Array.isArray(data) ? data : [];
  },

  getUnreadCount: async (username: string): Promise<number> => {
    const { data } = await api.get(
      `/notify/my/${encodeURIComponent(username)}/unread/count`,
    );
    return Number(data?.unread_count ?? 0);
  },

  markNotificationRead: async (notificationId: number) => {
    const { data } = await api.post(`/notify/read/${notificationId}`);
    return data;
  },

  markAllNotificationsReadByUser: async (username: string) => {
    const { data } = await api.post(`/notify/my/${encodeURIComponent(username)}/read-all`);
    return data;
  },

  getAdminSentNotifications: async (
    actorNickname: string,
    opts?: { limit?: number },
  ): Promise<{ items?: NotificationItem[] }> => {
    const { data } = await api.get(`/notify/sent/${encodeURIComponent(actorNickname)}`, {
      params: { limit: opts?.limit ?? 300 },
    });
    return data ?? { items: [] };
  },
};

export type Comment = {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  parent_id?: number | null;
  is_deleted?: boolean;
};

export const Comments = {
  list: async (
    postId: number,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: Comment[]; next_cursor?: string }> => {
    const { data } = await api.get(`/community/posts/${postId}/comments`, {
      params: { cursor, limit },
    });
    return data ?? { items: [] };
  },

  create: async (postId: number, username: string, content: string) => {
    try {
      const { data } = await api.post(
        `/community/posts/${postId}/comments/${encodeURIComponent(username)}`,
        { content },
      );
      return { ok: true as const, comment: data as Comment };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  },

  reply: async (
    postId: number,
    parentCommentId: number,
    username: string,
    content: string,
  ) => {
    try {
      const { data } = await api.post(
        `/community/posts/${postId}/comments/${encodeURIComponent(username)}`,
        { content, parent_id: parentCommentId },
      );
      return { ok: true as const, comment: data as Comment };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  },

  update: async (commentId: number, username: string, content: string) => {
    try {
      const { data } = await api.put(
        `/community/comments/${commentId}/${encodeURIComponent(username)}`,
        { content },
      );
      return { ok: true as const, comment: data as Comment };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  },

  remove: async (commentId: number, username: string) => {
    try {
      await api.delete(`/community/comments/${commentId}/${encodeURIComponent(username)}`);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  },
};

export type UIConfigBannerItem = {
  image_url: string;
  link_url?: string | null;
  click_action?: "link" | "referral_modal" | null;
  width_px?: number | null;
  width_percent?: number;
  height?: number;
  resize_mode?: "contain" | "cover" | "stretch";
};

export type UIConfigWebBannerSection = {
  enabled: boolean;
  items: UIConfigBannerItem[];
  cols_per_row?: number;
  rotation_count?: 3 | 5;
  interval_rows?: 3 | 5;
  height?: number;
  resize_mode?: "contain" | "cover" | "stretch";
  auto_play_ms?: number;
};

export type UIConfigResponse = {
  status: 0 | 1 | 3 | 8;
  config: {
    banner: {
      enabled: boolean;
      interval_posts: number;
      items: UIConfigBannerItem[];
      height?: number;
      resize_mode?: "contain" | "cover" | "stretch";
    };
    top_banner?: {
      enabled: boolean;
      items: UIConfigBannerItem[];
      height?: number;
      resize_mode?: "contain" | "cover" | "stretch";
    };
    web_top_banner?: UIConfigWebBannerSection;
    web_banner?: UIConfigWebBannerSection;
    popup: {
      enabled: boolean;
      image_url: string | null;
      link_url: string | null;
      width_percent?: number;
      height?: number;
      resize_mode?: "contain" | "cover" | "stretch";
    };
    title_search?: {
      enabled: boolean;
      recommended_post_ids: number[];
    };
    slide_posts?: {
      post_ids: number[];
    };
  };
};

const defaultUIConfig = (): UIConfigResponse["config"] => ({
  banner: { enabled: true, interval_posts: 10, items: [], height: 110, resize_mode: "contain" },
  top_banner: { enabled: true, items: [], height: 70, resize_mode: "contain" },
  web_top_banner: {
    enabled: true,
    items: [],
    cols_per_row: 3,
    rotation_count: 3,
    height: 160,
    resize_mode: "contain",
    auto_play_ms: 4000,
  },
  web_banner: {
    enabled: true,
    items: [],
    cols_per_row: 3,
    interval_rows: 3,
    rotation_count: 3,
    height: 160,
    resize_mode: "contain",
  },
  popup: {
    enabled: true,
    image_url: null,
    link_url: null,
    width_percent: 92,
    height: 360,
    resize_mode: "contain",
  },
  title_search: { enabled: true, recommended_post_ids: [] },
  slide_posts: { post_ids: [] },
});

export const UIConfig = {
  get: async (): Promise<UIConfigResponse> => {
    try {
      const { data } = await api.get("/community/ui-config");
      return data ?? { status: 8, config: defaultUIConfig() };
    } catch {
      return { status: 8, config: defaultUIConfig() };
    }
  },

  update: async (payload: UIConfigResponse["config"]): Promise<UIConfigResponse> => {
    const { data } = await api.put("/community/admin/ui-config", payload);
    return data ?? { status: 8, config: payload };
  },
};

export type TodayStatusResponse = {
  status: 0 | 1 | 3 | 8;
  date: string | null;
  new_users: number;
  total_users: number;
  total_visitors?: number;
  today_visitors?: number;
  total_job_posts?: number;
  today_job_posts?: number;
  total_ad_posts?: number;
  today_ad_posts?: number;
  total_chat_posts?: number;
  today_chat_posts?: number;
};

export const Stats = {
  today: async (): Promise<TodayStatusResponse> => {
    try {
      const { data } = await api.get("/community/stats/today");
      const raw = data ?? {};
      return {
        status: (raw.status ?? 8) as TodayStatusResponse["status"],
        date: raw.date ?? null,
        total_users: Number(raw.total_users ?? 0) || 0,
        new_users: Number(raw.new_users ?? 0) || 0,
        total_visitors: Number(raw.total_visitors ?? 0) || 0,
        today_visitors: Number(raw.today_visitors ?? raw.realtime_visitors ?? 0) || 0,
        total_job_posts: Number(raw.total_job_posts ?? 0) || 0,
        today_job_posts: Number(raw.today_job_posts ?? raw.new_sites ?? 0) || 0,
        total_ad_posts: Number(raw.total_ad_posts ?? 0) || 0,
        today_ad_posts: Number(raw.today_ad_posts ?? 0) || 0,
        total_chat_posts: Number(raw.total_chat_posts ?? 0) || 0,
        today_chat_posts: Number(raw.today_chat_posts ?? 0) || 0,
      };
    } catch {
      return {
        status: 8,
        date: null,
        total_users: 0,
        new_users: 0,
      };
    }
  },
};

export type AdminUserListItem = {
  id?: number | null;
  nickname: string;
  name?: string | null;
  signup_date?: string | null;
  admin_acknowledged?: boolean;
};

export type AdminUserListResponse = {
  status: 0 | 1 | 3 | 8;
  items: AdminUserListItem[];
  next_cursor: string | null;
};

export type AdminUserDetailResponse = {
  status: 0 | 1 | 3 | 8;
  user?: {
    nickname: string;
    name?: string | null;
    phone_number?: string | null;
    signup_date?: string | null;
    point_balance?: number;
    cash_balance?: number;
    user_grade?: number;
    is_owner?: boolean;
    admin_acknowledged?: boolean;
    referral_code?: string | null;
    referral_count?: number;
    posts?: { type1: number; type3: number; type4: number };
  };
  restrictions?: Array<{ post_type: number; restricted_until: string | null }>;
};

export const AdminUsers = {
  list: async (
    actorNickname: string,
    cursor?: string | null,
    limit?: number,
    q?: string | null,
  ): Promise<AdminUserListResponse> => {
    const { data } = await api.get("/community/admin/users", {
      params: {
        actor_nickname: actorNickname,
        cursor: cursor ?? undefined,
        limit: limit ?? 50,
        q: q?.trim() || undefined,
      },
    });
    return data ?? { status: 8, items: [], next_cursor: null };
  },

  getDetail: async (
    targetNickname: string,
    actorNickname: string,
  ): Promise<AdminUserDetailResponse> => {
    const { data } = await api.get(
      `/community/admin/users/${encodeURIComponent(targetNickname)}`,
      { params: { actor_nickname: actorNickname } },
    );
    return data ?? { status: 8 };
  },

  notifyUser: async (
    targetNickname: string,
    actorNickname: string,
    title: string,
    body: string,
  ) => {
    const { data } = await api.post(
      `/community/admin/users/${encodeURIComponent(targetNickname)}/notify`,
      { actor_nickname: actorNickname, title: title.trim(), body: body.trim() },
    );
    return data ?? { status: 8 };
  },

  setRestrictions: async (
    targetNickname: string,
    actorNickname: string,
    changes: Array<{ post_type: number; days: number }>,
    reason?: string,
  ) => {
    const { data } = await api.post(
      `/community/admin/users/${encodeURIComponent(targetNickname)}/restrictions`,
      {
        actor_nickname: actorNickname,
        changes,
        reason: reason?.trim() || undefined,
      },
    );
    return data ?? { status: 8 };
  },
};

export const OwnerUsers = {
  grantPoints: async (
    targetNickname: string,
    actorNickname: string,
    amount: number,
    reason: string,
  ) => {
    const { data } = await api.post(
      `/community/owner/users/${encodeURIComponent(targetNickname)}/points`,
      { actor_nickname: actorNickname, amount, reason: reason.trim() },
    );
    return data ?? { status: 8 };
  },

  setAdminAcknowledged: async (
    targetNickname: string,
    actorNickname: string,
    admin_acknowledged: boolean,
  ) => {
    const { data } = await api.post(
      `/community/owner/users/${encodeURIComponent(targetNickname)}/admin-acknowledged`,
      { actor_nickname: actorNickname, admin_acknowledged },
    );
    return data ?? { status: 8, admin_acknowledged: false };
  },
};

// -------------------- TossPayments --------------------
export const CASH_CHARGE_AMOUNTS = [10000, 30000, 50000, 80000, 100000] as const;

export type TossOrderCreateResponse = {
  status: number;
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
};

export const Orders = {
  createTossCashOrder: async (username: string, amount: number): Promise<TossOrderCreateResponse> => {
    const { data } = await api.post<TossOrderCreateResponse>("/orders/create", { username, amount });
    return data;
  },
};

export type TossConfirmResponse = {
  status: number;
  alreadyPaid?: boolean;
  orderId: string;
  amount: number;
  paymentKey?: string;
  approvedAt?: string | null;
  toss?: { method?: string; status?: string };
};

export const Payments = {
  confirmToss: async (payload: {
    paymentKey: string;
    orderId: string;
    amount: number;
  }): Promise<TossConfirmResponse> => {
    const { data } = await api.post<TossConfirmResponse>("/payments/toss/confirm", payload);
    return data;
  },
};
