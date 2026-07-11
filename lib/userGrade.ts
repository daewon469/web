export type UserGrade = -1 | 0 | 1 | 2 | 3 | 4 | 5;

export const USER_GRADE_LABEL: Record<UserGrade, string> = {
  [-1]: "일반회원",
  0: "아마추어",
  1: "세미프로",
  2: "프로",
  3: "마스터",
  4: "챌린저",
  5: "레전드",
};

export function normalizeUserGrade(value: unknown): UserGrade | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  if (n === -1 || n === 0 || n === 1 || n === 2 || n === 3 || n === 4 || n === 5) {
    return n as UserGrade;
  }
  return null;
}

export function getUserGradeLabel(value: unknown): string {
  const g = normalizeUserGrade(value);
  return g === null ? "일반회원" : USER_GRADE_LABEL[g];
}

export type UserGradeIconMeta =
  | {
      type: "ion";
      name: "trophy" | "ribbon" | "heart" | "diamond" | "person" | "leaf";
      color: string;
      badgeBgColor?: string;
      iconScale?: number;
      noOutline?: boolean;
    }
  | {
      type: "text";
      text: string;
      color: string;
      badgeBgColor?: string;
      noOutline?: boolean;
    };

export function getUserGradeIconMeta(value: unknown): UserGradeIconMeta {
  const g = normalizeUserGrade(value) ?? -1;
  switch (g) {
    case 5:
      return { type: "ion", name: "trophy", color: "#FFD600" };
    case 4:
      return { type: "ion", name: "ribbon", color: "#FF6D00" };
    case 3:
      return { type: "text", text: "♠", color: "#111" };
    case 2:
      return { type: "ion", name: "heart", color: "#E53935" };
    case 1:
      return { type: "ion", name: "diamond", color: "#50B6FF" };
    case -1:
      return {
        type: "ion",
        name: "person",
        color: "#fff",
        badgeBgColor: "#4A6CF7",
        iconScale: 0.7,
      };
    case 0:
    default:
      return { type: "ion", name: "leaf", color: "#00B200", noOutline: true };
  }
}
