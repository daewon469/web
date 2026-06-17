# 분양프로 웹 마이그레이션 로드맵

> 모바일 앱(`daewonapp_b`) → 웹(`daewonweb_b`) 이전 계획 및 진행 현황  
> API 서버: `https://api.daewon469.com` (`myapi_b`)  
> 최종 갱신: 2026-06-17

---

## 개요

| 항목 | 내용 |
|------|------|
| 모바일 | Expo 53 + React Native (`daewonapp_b`) |
| 웹 | Next.js 16 App Router + React 19 + Tailwind v4 (`daewonweb_b`) |
| 전략 | 동일 API 재사용, UI/네비게이션만 웹에 맞게 포팅 |
| 홈 화면 | `/` → `/list` (구인 현장 피드) |

---

## 전체 Phase 계획 (최초 수립)

### Phase 1 — 기반

| 항목 | 내용 |
|------|------|
| API 레이어 | `lib/api.ts`, `lib/session.ts`, `lib/authErrors.ts` |
| 공통 레이아웃 | 상단 `TopBar`, 앱 색상 (`#0B1B3A`, `#4A6CF7`) |
| 핵심 화면 | `/list` 구인 목록, `/login` 로그인, `/[id]` 상세 |
| 환경 설정 | `NEXT_PUBLIC_API_URL` |

### Phase 2 — 인증·회원

| 항목 | 내용 |
|------|------|
| 회원가입 | `/signup` (휴대폰 인증, 지역, 추천코드) |
| 계정 복구 | 아이디 찾기, 비밀번호 재설정 |
| 로그인 가드 | 비로그인 시 구인등록 등 차단 |
| 하단 네비 | 지도/제목/지역/맞춤/관심 (`BottomBar`) |

### Phase 3 — 메인 피드 확장

| 항목 | 내용 |
|------|------|
| 필터 | 지역저장, 맞춤저장, 관심현장 |
| 검색 | 제목 검색, 지도 검색 (Kakao Map) |
| 피드 UX | 무한 스크롤, 새로고침, 배너/팝업 |
| 구인 작성 | `/write` 기본 폼 |

### Phase 4 — 게시판 유형별

| post_type | 모바일 | 설명 |
|-----------|--------|------|
| 1 | `list`, `write` | 구인글 (메인) |
| 2 | `list2` | 분양 뉴스 |
| 3 | `list3`, `write3` | 커뮤니티 |
| 4 | `list4`, `write4` | 광고 |
| 5 | `list5`, `write5` | 공지사항 |
| 6 | `list6`, `write6` | 문의/건의 |
| 7 | `list7`, `write7` | 분양대행 문의 |

→ 각 유형별 목록·작성·수정·내 글 관리 화면 포팅

### Phase 5 — 마이페이지·부가 기능

| 항목 | 내용 |
|------|------|
| 마이메뉴 | 요약, 등급, 추천코드, 메뉴 허브 |
| 포인트/캐시 | 내역, 출석체크 |
| 추천 | 내 추천 목록, 랭킹, 인맥 네트워크 |
| 알림 | 수신 목록, 읽음 처리, 관리자 발송 내역 |
| 관리자 | 회원 관리, 오늘의 현황, 배너/팝업 설정 등 |

### Phase 6 — 웹 전용 최적화

| 항목 | 내용 |
|------|------|
| 반응형 | 모바일 우선 → 데스크톱 레이아웃(사이드바 등) |
| SEO | 게시글·목록 메타태그, OG 이미지 |
| PWA | 오프라인·홈 화면 추가 (선택) |
| 성능 | 이미지 최적화, 캐싱 전략 |

---

## 현재 진행 단계

**종합 판단: Phase 1~5 완료, Phase 6 잔여**  
(핵심 기능·결제·피드 UX 모두 사용 가능)

```
Phase 1  ████████████████████  100%
Phase 2  ████████████████████  100%
Phase 3  ████████████████████  100%
Phase 4  ████████████████████  100%
Phase 5  ████████████████████  100%
Phase 6  ░░░░░░░░░░░░░░░░░░░░    0%
```

---

## Phase별 상세 현황

### Phase 1 — 기반 ✅ 완료

| 기능 | 경로 | 상태 |
|------|------|------|
| API 클라이언트 | `lib/api.ts` | ✅ |
| 세션 (localStorage) | `lib/session.ts` | ✅ |
| 에러 메시지 | `lib/authErrors.ts` | ✅ |
| 상단바 | `components/TopBar.tsx` | ✅ |
| 구인 목록 | `/list` | ✅ |
| 로그인 | `/login` | ✅ |
| 게시글 상세 | `/[id]` | ✅ |
| 환경 변수 | `.env.local` | ✅ |

---

### Phase 2 — 인증·회원 ✅ 완료

| 기능 | 경로 | 상태 | 비고 |
|------|------|------|------|
| 회원가입 | `/signup` | ✅ | 휴대폰 인증·지역·추천코드 |
| 로그인 | `/login` | ✅ | |
| 하단 네비 | `BottomBar` | ✅ | 5탭 |
| 제목 검색 | `/textsearch` | ✅ | 추천현장 UIConfig 연동 |
| 관심현장 | `/like` | ✅ | |
| 마이메뉴 (기초) | `/myboard` | ✅ | 로그아웃, 요약 |
| 아이디 찾기 | `/findid` | ✅ | 휴대폰 인증 |
| 비밀번호 재설정 | `/resetpassword` | ✅ | 휴대폰 인증 |
| 프로필 수정 | `/signup?mode=edit` | ✅ | 마이메뉴 링크 |

---

### Phase 3 — 메인 피드 확장 ✅ 완료

| 기능 | 경로 | 상태 | 비고 |
|------|------|------|------|
| 지역저장 설정 | `/areasite` | ✅ | |
| 지역저장 목록 | `/arealike` | ✅ | |
| 맞춤저장 설정 | `/customsite` | ✅ | |
| 맞춤저장 목록 | `/customlike` | ✅ | |
| 지도 검색 | `/list?openMap=1` | ✅ | Kakao Map JS |
| 구인글 작성 (기초) | `/write` | ✅ | Phase 4에서 확장 |
| 포인트 | `/points` | ✅ | 출석체크 포함 |
| 캐시 | `/cash` | ✅ | |
| 무한 스크롤 | `/list` | ✅ | cursor + IntersectionObserver |
| 새로고침 | `/list` | ✅ | 새로고침 버튼 |
| 피드/상단 배너 | `/list` | ✅ | `UIConfig` 연동, 추천 모달 클릭 |
| 홈 팝업 | `/list` | ✅ | `HomePopup`, 오늘 숨김 |
| 배너/팝업 관리 UI | `/banneradmin`, `/popupadmin` 등 | ✅ | 오너 전용 |

---

### Phase 4 — 게시판 유형별 ✅ 완료

| 기능 | 경로 | 상태 | 비고 |
|------|------|------|------|
| 구인 목록/상세 | `/list`, `/[id]` | ✅ | |
| 구인 작성·수정 | `/write`, `/write?id=` | ✅ | 이미지 업로드, 임시저장 |
| 내 구인글 관리 | `/mypage` | ✅ | 재등록·수정·마감·삭제 |
| 관심(좋아요) | `Heart` 컴포넌트 | ✅ | 목록·상세 |
| 분양 뉴스 | `/list2` | ✅ | 외부 링크 |
| 커뮤니티 목록 | `/list3` | ✅ | 글 작성 링크 |
| 광고 목록 | `/list4` | ✅ | 카테고리 필터 |
| 공지사항 | `/list5` | ✅ | 관리자 글 작성 |
| 문의/건의 | `/list6` | ✅ | |
| 분양대행 문의 | `/list7` | ✅ | |
| 커뮤니티 작성 | `/write3` | ✅ | |
| 광고 작성 | `/write4` | ✅ | 지도·업무항목 포함 |
| 공지/문의 작성 | `/write5`~`/write7` | ✅ | write5 관리자 전용 |
| 내 커뮤니티/광고 관리 | `/mypage3`, `/mypage4` | ✅ | |
| 댓글 | `CommentsSection` | ✅ | post_type 3,5,6,7 상세 |
| 지도 주소 입력 (작성) | `/write`, `/write4` | ✅ | `MapLocationField`, Kakao Map |

---

### Phase 5 — 마이페이지·부가 기능 ✅ 완료

| 기능 | 모바일 경로 | 웹 | 상태 |
|------|-------------|-----|------|
| 추천 회원 목록 | `/referrals` | `/referrals` | ✅ |
| 추천 랭킹 | `/referralranking` | `/referralranking` | ✅ |
| 추천 인맥 | `/referralnetwork` | `/referralnetwork` | ✅ |
| 알림 목록 | `/noti` | `/noti` | ✅ |
| 상단바 알림 뱃지 | `Topbar` | `TopBar` | ✅ |
| 마이메뉴 추천 섹션 | `myboard` | `/myboard` | ✅ |
| 추천 문구 복사 | `ReferralModal` | `/myboard`, `/list` | ✅ |
| 추천 공유 | `ReferralModal` | Web Share API + 문자 링크 | ✅ |
| 회원 관리 | `/adminusers` | `/adminusers` | ✅ |
| 오늘의 현황 | `/todaystatus` | `/todaystatus` | ✅ |
| 배너/팝업 관리 | `/banneradmin`, `/topbanneradmin`, `/popupadmin` | ✅ | |
| 제목검색 추천현장 관리 | `/titlesearchadmin` | ✅ | 관리자 전용 |
| 토스 결제/충전 | `/payment/toss` | ✅ | success/fail 콜백 |

---

### Phase 6 — 웹 전용 최적화 ⬜ 미착수

| 항목 | 상태 |
|------|------|
| 데스크톱 반응형 레이아웃 | ❌ |
| 게시글 SEO (`generateMetadata`) | ❌ |
| PWA (`manifest`, service worker) | ❌ |
| sitemap / robots.txt | ❌ |

---

## 구현된 웹 라우트 목록 (46개)

| 경로 | 설명 |
|------|------|
| `/` | → `/list` 리다이렉트 |
| `/list` | 구인 현장 (배너·팝업·무한스크롤) |
| `/list2` | 분양 뉴스 |
| `/list3` | 커뮤니티 |
| `/list4` | 광고 |
| `/list5` | 공지사항 |
| `/list6` | 문의/건의 목록 |
| `/list7` | 분양대행 문의 목록 |
| `/login` | 로그인 |
| `/signup` | 회원가입 · `?mode=edit` 프로필 수정 |
| `/findid` | 아이디 찾기 |
| `/resetpassword` | 비밀번호 재설정 |
| `/write` | 구인글 등록·수정 |
| `/write3` | 커뮤니티 작성 |
| `/write4` | 광고 작성 |
| `/write5` | 공지 작성 (관리자) |
| `/write6` | 문의/건의 작성 |
| `/write7` | 분양대행 문의 작성 |
| `/[id]` | 게시글 상세 (댓글 포함) |
| `/textsearch` | 제목 검색 |
| `/like` | 관심현장 |
| `/areasite` | 지역저장 설정 |
| `/arealike` | 지역저장 목록 |
| `/customsite` | 맞춤저장 설정 |
| `/customlike` | 맞춤저장 목록 |
| `/myboard` | 마이메뉴 |
| `/mypage` | 내 구인글 관리 |
| `/mypage3` | 내 커뮤니티글 관리 |
| `/mypage4` | 내 광고글 관리 |
| `/points` | 포인트 내역 |
| `/cash` | 캐시 내역 · 충전 링크 |
| `/payment/toss` | 토스 캐시 충전 |
| `/payment/toss/success` | 결제 성공 콜백 |
| `/payment/toss/fail` | 결제 실패 콜백 |
| `/referrals` | 내 추천 회원 목록 |
| `/referralranking` | 추천인 랭킹 |
| `/referralnetwork` | 추천 인맥 네트워크 |
| `/noti` | 알림 (수신·읽음·관리자 발송) |
| `/todaystatus` | 오늘의 현황 (관리자) |
| `/adminusers` | 회원 관리 |
| `/banneradmin` | 피드 배너 관리 (오너) |
| `/topbanneradmin` | 상단 배너 관리 (오너) |
| `/popupadmin` | 홈 팝업 관리 (오너) |
| `/titlesearchadmin` | 제목검색 추천현장 관리 (관리자) |

---

## 공통 컴포넌트·라이브러리

```
lib/
  api.ts              # Auth, Posts, Points, Cash, Referral, Notify API
  session.ts          # localStorage 세션
  authErrors.ts       # 한국어 에러 메시지
  regions.ts          # 지역 데이터
  regionUtils.ts      # 지역 코드 변환
  customSiteOptions.ts
  ledgerFormat.ts     # 포인트/캐시 표시
  upload.ts           # 이미지 base64 업로드
  map.ts              # 카카오맵 URL·좌표 타입
  site.ts             # SITE_URL
  referral.ts         # 추천 문구
  ui_banner_actions.ts

components/
  TopBar.tsx          # 상단 네비 (알림 탭·미읽음 뱃지)
  BottomBar.tsx       # 하단 5탭
  PostCard.tsx        # 구인 카드
  Heart.tsx           # 관심 등록
  CommentsSection.tsx # 댓글·답글
  ReferralModal.tsx   # 추천 공유 모달
  KakaoMapPanel.tsx   # 지도 검색
  KakaoMapPicker.tsx  # 작성 시 지도 클릭·역지오코딩
  MapLocationField.tsx
  TypePostList.tsx    # 유형별 목록 (페이지네이션)
  MyTypePostsClient.tsx
  SimpleTypeWriteClient.tsx
  FeedBanner.tsx      # 피드·상단 배너
  HomePopup.tsx       # 홈 팝업
  BannerAdminClient.tsx
  PopupAdminClient.tsx
  TitleSearchAdminClient.tsx
  TossPaymentClient.tsx
  AdWritePageClient.tsx
  RegionSelectModal.tsx
  CustomRegionMultiSelect.tsx
  TableGrid.tsx
```

---

## API 연동 현황 (`lib/api.ts`)

| 모듈 | 구현된 메서드 | 미구현 (모바일 대비) |
|------|---------------|----------------------|
| `Auth` | logIn, signUp, phone 인증, findUsernameByPhone, resetPasswordByPhone, getUser, getMyPageSummary, updateUser, logOut | deleteUser |
| `Posts` | list, get, create, createByType, update, remove, searchTitle, listLiked, listCustom, listByType, mylist, like, unlike, changeStatus, recreate | — |
| `Comments` | list, create, reply, update, remove | — |
| `UIConfig` | get, update | — |
| `Stats` | today | — |
| `AdminUsers` | list, getDetail, notifyUser, setRestrictions | — |
| `OwnerUsers` | grantPoints, setAdminAcknowledged | — |
| `Points` | list, attendanceStatus, attendanceClaim | — |
| `Cash` | list | — |
| `Orders` | createTossCashOrder | — |
| `Payments` | confirmToss | — |
| `Referral` | listByReferrer, ranking, network | — |
| `Notify` | getAllNotifications, getUnreadCount, markNotificationRead, markAllNotificationsReadByUser, getAdminSentNotifications | — |

---

## 권장 다음 작업 순서

1. **Phase 6** — SEO 메타태그, 반응형 데스크톱 레이아웃, PWA

---

## 작업 이력

### 2026-06-17 — Phase 3·5 마무리

| 임무 | 산출물 | 상태 |
|------|--------|------|
| A. 피드 UX | `/list` 새로고침, 자동 무한스크롤, 배너 추천모달 | ✅ |
| B. 추천 공유 | `ReferralModal`, Web Share + 문자 | ✅ |
| C. 토스 결제 | `/payment/toss`, success/fail, API `Orders`/`Payments` | ✅ |
| D. 백엔드 | `pay/toss?platform=web` 웹 리다이렉트 | ✅ |
| E. 빌드 | `npm run build` 46 라우트 통과 | ✅ |

### 2026-06-17 — Phase 5 제목검색 추천현장

| 임무 | 산출물 | 상태 |
|------|--------|------|
| A. 관리 화면 | `/titlesearchadmin`, `TitleSearchAdminClient` | ✅ |
| B. 제목검색 UX | `/textsearch` 추천현장 노출 | ✅ |
| C. 마이메뉴 | 관리자 메뉴 링크 | ✅ |
| D. 빌드 | `npm run build` 43 라우트 통과 | ✅ |

### 2026-06-17 — Phase 4 지도·Phase 5 팝업 관리

| 임무 | 산출물 | 상태 |
|------|--------|------|
| A. 지도 주소 | `lib/map.ts`, `KakaoMapPicker`, `MapLocationField` | ✅ |
| B. 작성 연동 | `/write`, `/write4` 지도 필드·payload | ✅ |
| C. 팝업 관리 | `/popupadmin`, `PopupAdminClient`, `/myboard` 링크 | ✅ |
| D. 빌드 | `npm run build` 42 라우트 통과 | ✅ |

### 2026-06-17 — Phase 5 관리자·Phase 3 피드 UX

| 임무 | 산출물 | 상태 |
|------|--------|------|
| A. API | `Stats`, `UIConfig`, `AdminUsers`, `OwnerUsers` | ✅ |
| B. 관리자 화면 | `/todaystatus`, `/adminusers`, `/banneradmin`, `/topbanneradmin` | ✅ |
| C. 피드 UX | `/list` 무한스크롤, 배너 삽입, `HomePopup` | ✅ |
| D. 마이메뉴 | 관리자 섹션 (권한별 메뉴) | ✅ |
| E. 빌드 | `npm run build` 41 라우트 통과 | ✅ |

### 2026-06-17 — Phase 4·2 (권장 순서 1~2)

| 임무 | 산출물 | 상태 |
|------|--------|------|
| A. API | `createByType`, `Comments` 모듈 | ✅ |
| B. 게시판 | `list5`~`list7`, `write3`~`write7`, `mypage3`/`mypage4` | ✅ |
| C. 댓글 | `CommentsSection`, 상세 연동 | ✅ |
| D. 인증 | `/findid`, `/resetpassword`, `/signup?mode=edit` | ✅ |
| E. 빌드 | `npm run build` 37 라우트 통과 | ✅ |

### 2026-06-17 — Phase 5 핵심 (임무형 지휘)

| 임무 | 산출물 | 상태 |
|------|--------|------|
| A. API 확장 | `lib/api.ts` — `Referral`, `Notify` 모듈·타입 | ✅ |
| B. 추천·알림 화면 | `/referrals`, `/referralranking`, `/referralnetwork`, `/noti` | ✅ |
| C. TopBar 알림 | 알림 탭, `getUnreadCount` 뱃지, `notify-updated` 연동 | ✅ |
| D. 마이메뉴 추천 | `/myboard` 추천 섹션, 문구 클립보드 복사 | ✅ |
| E. 빌드 검증 | `npm run build` 25 라우트 통과 | ✅ |

---

## 참고 — 모바일 앱 규모

- 화면(라우트): **50개 이상** (`daewonapp_b/app/`)
- 웹 구현 완료: **약 44개 화면** (전체의 ~70%)
- 비즈니스 핵심 경로(구인 조회·등록·로그인·필터): **대체로 사용 가능**

---

## 실행 방법

```bash
cd c:\business\daewonweb_b
npm run dev
# http://localhost:3000
```

환경 변수 (`.env.local`):

```
NEXT_PUBLIC_API_URL=https://api.daewon469.com
NEXT_PUBLIC_KAKAO_MAP_JS_KEY=...
NEXT_PUBLIC_SITE_URL=https://daewon469.com
```
