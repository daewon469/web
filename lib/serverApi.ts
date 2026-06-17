import { API_URL, type Post } from "./api";

export async function fetchPostServer(id: number): Promise<Post | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  try {
    const res = await fetch(`${API_URL}/community/posts/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Post;
  } catch {
    return null;
  }
}

export async function fetchRecentPostIds(limit = 50): Promise<{ id: number; created_at: string }[]> {
  try {
    const res = await fetch(
      `${API_URL}/community/posts?limit=${limit}&status=published`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: Post[] };
    return (data.items ?? []).map((p) => ({ id: p.id, created_at: p.created_at }));
  } catch {
    return [];
  }
}
