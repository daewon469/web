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

export const Auth = {
  logIn: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/community/login", {
      username,
      password,
    });
    return data;
  },
};

export const Posts = {
  list: async (opts?: {
    username?: string;
    cursor?: PostListCursor;
    status?: "published" | "closed";
    limit?: number;
  }): Promise<{ items: Post[]; next_cursor?: PostListCursor }> => {
    const params: Record<string, string | number> = { limit: opts?.limit ?? 50 };
    if (opts?.username) params.username = opts.username;
    if (opts?.cursor) params.cursor = opts.cursor;
    if (opts?.status) params.status = opts.status;
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
};
