"use client";

import { Comments, type Comment } from "@/lib/api";
import { formatKstDatetime } from "@/lib/ledgerFormat";
import { getSession } from "@/lib/session";
import { useCallback, useEffect, useState } from "react";

type CommentNode = Comment & { children: CommentNode[] };

function buildTree(items: Comment[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  items.forEach((c) => map.set(c.id, { ...c, children: [] }));

  map.forEach((node) => {
    if (node.parent_id) {
      const parent = map.get(node.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function CommentsSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<CommentNode | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Comments.list(postId, undefined, 100);
      const sorted = [...res.items].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      setComments(sorted);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const session = getSession();
    setUsername(session.username);
    load();
  }, [load]);

  const onSubmit = async () => {
    const content = text.trim();
    if (!content) return;
    if (!username) {
      alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    setSubmitting(true);
    try {
      const res = replyTarget
        ? await Comments.reply(postId, replyTarget.id, username, content)
        : await Comments.create(postId, username, content);
      if (!res.ok || !res.comment) {
        alert(res.error ?? "댓글 등록에 실패했습니다.");
        return;
      }
      setComments((prev) => [...prev, res.comment]);
      setText("");
      setReplyTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveEdit = async (commentId: number) => {
    if (!username || !editingText.trim()) return;
    const res = await Comments.update(commentId, username, editingText.trim());
    if (res.ok && res.comment) {
      setComments((prev) => prev.map((c) => (c.id === res.comment.id ? res.comment : c)));
      setEditingId(null);
      setEditingText("");
    } else {
      alert("수정에 실패했습니다.");
    }
  };

  const onDelete = async (commentId: number) => {
    if (!username || !confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    const res = await Comments.remove(commentId, username);
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, is_deleted: true, content: "" } : c,
        ),
      );
    }
  };

  const renderNode = (node: CommentNode, depth = 0) => {
    const isMine = username === node.username;
    const deleted = node.is_deleted;

    return (
      <div key={node.id} className={depth > 0 ? "ml-4 border-l border-gray-200 pl-3" : ""}>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold">{node.username}</span>
            <span className="text-[11px] text-gray-500">{formatKstDatetime(node.created_at)}</span>
          </div>

          {editingId === node.id ? (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="min-h-[72px] w-full rounded-lg border border-black px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSaveEdit(node.id)}
                  className="rounded-lg bg-[#4A6CF7] px-3 py-1.5 text-xs font-bold text-white"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditingText("");
                  }}
                  className="rounded-lg border px-3 py-1.5 text-xs"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-800">
              {deleted ? "(삭제된 댓글)" : node.content}
            </p>
          )}

          {!deleted && editingId !== node.id && (
            <div className="mt-2 flex gap-3 text-xs text-[#4A6CF7]">
              {username && (
                <button type="button" onClick={() => setReplyTarget(node)}>
                  답글
                </button>
              )}
              {isMine && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(node.id);
                      setEditingText(node.content);
                    }}
                  >
                    수정
                  </button>
                  <button type="button" onClick={() => onDelete(node.id)}>
                    삭제
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  const tree = buildTree(comments);

  return (
    <section className="mt-6 border-t border-gray-200 pt-6">
      <h2 className="text-lg font-bold text-[#0B1B3A]">댓글 {comments.length}</h2>

      {loading && <p className="mt-3 text-sm text-gray-500">댓글 불러오는 중...</p>}

      <div className="mt-3 flex flex-col gap-2">
        {tree.map((node) => renderNode(node))}
        {!loading && tree.length === 0 && (
          <p className="text-sm text-gray-500">첫 댓글을 남겨보세요.</p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-black bg-[#f9f9f9] p-3">
        {replyTarget && (
          <p className="mb-2 text-xs text-gray-600">
            {replyTarget.username}님에게 답글 ·{" "}
            <button type="button" className="text-[#4A6CF7]" onClick={() => setReplyTarget(null)}>
              취소
            </button>
          </p>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={username ? "댓글을 입력하세요" : "로그인 후 댓글 작성 가능"}
          disabled={!username || submitting}
          className="min-h-[80px] w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4A6CF7] disabled:bg-gray-100"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!username || submitting || !text.trim()}
          className="mt-2 rounded-lg bg-[#4A6CF7] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "등록 중..." : replyTarget ? "답글 등록" : "댓글 등록"}
        </button>
      </div>
    </section>
  );
}
