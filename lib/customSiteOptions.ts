export const REGION_OPTIONS = [
  "전국",
  "서울",
  "경기",
  "인천",
  "강원",
  "제주",
  "부산",
  "울산",
  "대구",
  "광주",
  "대전",
  "세종",
  "경남",
  "경북",
  "전남",
  "전북",
  "충남",
  "충북",
] as const;

export const INDUSTRY_OPTIONS = [
  "아파트",
  "상가",
  "오피스",
  "오피스텔",
  "도시형생활주택",
  "레지던스",
  "호텔",
  "리조트",
  "지식산업센터",
  "타운하우스",
  "토지",
  "기타",
] as const;

export const ROLE_OPTIONS = ["총괄", "본부장", "팀장", "팀원", "기타"] as const;

export const WRITE_INDUSTRY_OPTIONS = INDUSTRY_OPTIONS;
export const WRITE_ROLE_OPTIONS = ["총괄", "본부장", "본부", "팀장", "팀원", "팀", "각개", "기타"] as const;
