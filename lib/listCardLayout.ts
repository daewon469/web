/** 1유형 목록 카드 높이(px) */
export const LIST_CARD_HEIGHT_TYPE1 = 250;

/** S유형 목록 카드 높이(px) — 1유형보다 길게 */
export const LIST_CARD_HEIGHT_TYPE_S = 350;

/** 1유형 제목 영역 고정 높이(px) — 1줄/2줄 동일 */
export const TYPE1_TITLE_HEIGHT_PX = 52;

/** arealike(areasite) 1·2유형 이미지 크기(px) */
export const TYPE1_IMAGE_PX = 100;
export const TYPE2_IMAGE_PX = 70;

/** 1·2유형 목록 3열 그리드 */
export const LIST_CARD_GRID_CLASS = "grid grid-cols-3 gap-1.5";

/** 목록 중앙 블록 최대 너비(px) — 1024=5xl, 1280=7xl, 값을 키우면 더 넓게 */
export const LIST_PAGE_CONTENT_MAX_PX = 1280;

/** 목록 중앙 블록 좌우 패딩(px) */
export const LIST_PAGE_CONTENT_PX = 0;

/** 왼쪽 배너 (중앙 본문 기준) */
export const LIST_BANNER_WIDTH_PX = 300;
export const LIST_BANNER_HEIGHT_PX = 80;

/** 본문 왼쪽 여백이 배너 너비 이상일 때만 사이드바 배너 표시 */
export function hasListBannerGutter(leftGutterPx: number) {
  return leftGutterPx >= LIST_BANNER_WIDTH_PX;
}
