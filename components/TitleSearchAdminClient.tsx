"use client";

import { Posts, UIConfig, type Post } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

async function fetchPostsByIds(ids: number[]) {
  const out: Post[] = [];
  const BATCH = 15;
  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const results = await Promise.allSettled(slice.map((id) => Posts.get(Number(id))));
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) out.push(r.value);
    });
  }
  const byId = new Map(out.map((p) => [Number(p.id), p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Post[];
}

export default function TitleSearchAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [recommended, setRecommended] = useState<Post[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[]>([]);

  const recommendedIds = useMemo(
    () =>
      Array.from(
        new Set(
          recommended
            .map((p) => Number(p.id))
            .filter((n) => Number.isFinite(n) && n > 0),
        ),
      ),
    [recommended],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await UIConfig.get();
      if (res.status !== 0) {
        alert("설정을 불러올 수 없습니다.");
        return;
      }
      const ts = res.config.title_search ?? { enabled: true, recommended_post_ids: [] };
      setEnabled(!!ts.enabled);
      const ids = Array.from(
        new Set(
          (ts.recommended_post_ids ?? [])
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n) && n > 0),
        ),
      );
      if (ids.length === 0) {
        setRecommended([]);
        return;
      }
      setRecommended(await fetchPostsByIds(ids));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = async () => {
    const q = searchText.trim();
    if (!q) {
      alert("제목 검색어를 입력하세요.");
      return;
    }
    setSearching(true);
    try {
      const res = await Posts.searchTitle(q, { post_type: 1, limit: 50 });
      setSearchResults(res.items ?? []);
    } catch {
      alert("검색에 실패했습니다.");
    } finally {
      setSearching(false);
    }
  };

  const onAddFromSearch = (post: Post) => {
    const id = Number(post.id);
    if (!Number.isFinite(id) || id <= 0) return;
    if (recommendedIds.includes(id)) {
      alert("이미 추가된 게시글입니다.");
      return;
    }
    setRecommended((prev) => [...prev, post]);
  };

  const onRemove = (id: number) => {
    setRecommended((prev) => prev.filter((p) => Number(p.id) !== Number(id)));
  };

  const onMove = (index: number, direction: "up" | "down") => {
    setRecommended((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const current = await UIConfig.get();
      if (current.status !== 0) {
        alert("저장에 실패했습니다.");
        return;
      }
      const nextConfig = {
        ...current.config,
        title_search: {
          enabled: !!enabled,
          recommended_post_ids: recommendedIds,
        },
      };
      const res = await UIConfig.update(nextConfig);
      if (res.status === 0) {
        alert("제목검색 추천현장이 저장되었습니다.");
        await load();
      } else {
        alert("저장에 실패했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#0B1B3A]">제목검색 추천현장 관리</h1>

      <button
        type="button"
        onClick={() => setEnabled((p) => !p)}
        disabled={saving}
        className={`rounded-xl border border-black px-4 py-3 text-left font-bold ${
          enabled ? "bg-[#4A6CF7] text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        추천현장 노출: {enabled ? "ON" : "OFF"}
      </button>

      <div>
        <p className="mb-2 text-sm font-bold">제목 검색으로 추가</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-black bg-white px-3 py-2"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="예: 반포래미안"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button
            type="button"
            onClick={onSearch}
            disabled={saving || searching}
            className="rounded-xl border border-black bg-[#FFF6D2] px-4 py-2 font-bold disabled:opacity-50"
          >
            {searching ? "검색중" : "검색"}
          </button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">검색 결과</p>
          {searchResults.map((p) => {
            const id = Number(p.id);
            const already = recommendedIds.includes(id);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-black p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.title}</p>
                  <p className="text-sm text-gray-500">ID: {p.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddFromSearch(p)}
                  disabled={saving || already}
                  className="shrink-0 rounded-xl border border-black bg-[#EAF0FF] px-3 py-2 text-sm font-bold disabled:opacity-50"
                >
                  {already ? "추가됨" : "추가"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {loading && <p className="py-4 text-center text-gray-500">불러오는 중...</p>}

      <p className="font-bold">현재 추천현장: {recommended.length}개</p>

      {recommended.map((p, index) => {
        const isFirst = index === 0;
        const isLast = index === recommended.length - 1;
        return (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-black p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{p.title}</p>
              <p className="text-sm text-gray-500">ID: {p.id}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onMove(index, "up")}
                disabled={saving || isFirst}
                className="h-7 w-7 rounded border border-black bg-[#EAF0FF] font-bold disabled:opacity-50"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(index, "down")}
                disabled={saving || isLast}
                className="h-7 w-7 rounded border border-black bg-[#EAF0FF] font-bold disabled:opacity-50"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => onRemove(Number(p.id))}
              disabled={saving}
              className="shrink-0 rounded-xl border border-black bg-red-100 px-3 py-2 text-sm font-bold disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onSave}
        disabled={saving || loading}
        className="rounded-xl bg-[#4A6CF7] py-3 font-bold text-white disabled:opacity-50"
      >
        {saving ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}
