export type UserGrade = -1 | 0 | 1 | 2 | 3 | 4;

export const USER_GRADE_LABEL: Record<UserGrade, string> = {
  [-1]: "일반회원",
  0: "아마추어",
  1: "세미프로",
  2: "프로",
  3: "마스터",
  4: "레전드",
};

export function getUserGradeLabel(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (n === -1 || n === 0 || n === 1 || n === 2 || n === 3 || n === 4) {
    return USER_GRADE_LABEL[n as UserGrade];
  }
  return "일반회원";
}
