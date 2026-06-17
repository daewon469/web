import { SITE_URL } from "./site";

export function buildReferralMessage(referralCode: string) {
  return `분양프로 설치 링크
${SITE_URL}

내 추천인코드: ${referralCode}

안녕하세요! (__) (^.^)

<분양프로>는 분양상담사 구인구직에 최적화된 어플입니다.

무료로 구인등록 하시고, 다양한 포인트 혜택도 누려보세요!

지금 웹에서 <분양프로>를 이용해 보세요^^
`;
}
