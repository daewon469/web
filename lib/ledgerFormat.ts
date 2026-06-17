const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatKstDatetime(iso?: string | null) {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return String(iso).slice(0, 19).replace("T", " ");
  const kst = new Date(ms + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}-${pad2(kst.getUTCMonth() + 1)}-${pad2(kst.getUTCDate())} ${pad2(kst.getUTCHours())}:${pad2(kst.getUTCMinutes())}:${pad2(kst.getUTCSeconds())}`;
}

export function displayPointReason(reason: string) {
  const r = (reason || "").toLowerCase();
  if (r.includes("signup")) return "가입축하";
  if (r.includes("referral")) return "추천인 가입";
  if (r.includes("attendance")) return "출석체크";
  if (r.includes("recruit_post")) return "구인글 등록";
  if (r.startsWith("user_grade_reward_")) {
    const g = Number(String(r).split("_").pop());
    const labels: Record<number, string> = {
      0: "등업 달성(아마추어)",
      1: "등업 달성(세미프로)",
      2: "등업 달성(프로)",
      3: "등업 달성(마스터)",
      4: "등업 달성(레전드)",
    };
    return labels[g] ?? "등업 달성";
  }
  return reason;
}

export function displayCashReason(reason: string) {
  const r = (reason || "").toLowerCase();
  if (r.includes("referral")) return "추천인 가입";
  return reason;
}
