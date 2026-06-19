# daewonweb_b 페이지·파일 가이드

> URL 경로 · 파일명 · 기능을 한눈에 보기 위한 목록  
> 기준: `app/(main)/` 라우트 + 주요 Client 컴포넌트 (2026-06 기준)

---

## post_type 대응 (앱·API 공통)

| post_type | 목록 | 글쓰기 | 비고 |
|-----------|------|--------|------|
| 1 | `/list` | `/write` | 구인글 (기본) |
| 2 | `/list2` | — | 분양 뉴스 (외부 링크) |
| 3 | `/list3` | `/write3` | 커뮤니티 |
| 4 | `/list4` | `/write4` | 광고 |
| 5 | `/list5` | `/write5` | 공지사항 (관리자) |
| 6 | `/list6` | `/write6` | 문의·건의 |
| 7 | `/list7` | `/write7` | 분양대행 문의 |

상세는 공통: `/[id]` → `app/(main)/[id]/`

---

## 1. 진입 · 레이아웃

| URL | page 파일 | 기능 |
|-----|-----------|------|
| `/` | `app/page.tsx` | 루트 → `/list` 리다이렉트 |
| (공통) | `components/MainLayoutClient.tsx` | 상단바·좌측 사이드·하단바·**공통 카테고리 바** |
| (공통) | `components/CommonCategoryBar.tsx` | 첫화면 / 지역현장 / 맞춤저장 / 지도검색 / 관심현장 / 광고 탭 |
| (공통) | `components/CategoryBarShell.tsx` | 카테고리 바 UI 껍데기 (흰색 full-bleed 배경) |
| (공통) | `lib/categoryNav.ts` | 공통 카테고리 탭 정의·활성 판별·이동 경로 |
| (공통) | `components/TopBar.tsx` | 모바일 상단 5탭 (구인등록·광고·첫화면·알림·마이메뉴) |
| (공통) | `components/DesktopSideNav.tsx` | PC 좌측 메뉴 (구인등록·광고·첫화면·검색·필터 등) |
| (공통) | `components/BottomBar.tsx` | 모바일 하단 5탭 (지도검색·제목검색·지역현장·맞춤저장·관심현장) |

---

## 2. 구인 · 탐색 (공통 카테고리 바 연동)

| URL | page 파일 | Client / 컴포넌트 | 기능 |
|-----|-----------|-------------------|------|
| `/list` | `app/(main)/list/page.tsx` | `list/ListPageClient.tsx` | **첫화면** — 전국 구인 피드, 뉴스 미리보기, 배너, 지도검색 오버레이 |
| `/list?openMap=1` | (동일) | `list/ListPageClient.tsx` + `KakaoMapPanel.tsx` | **지도검색** — 카카오맵 전국 현장 마커·카드 |
| `/areasite` | `app/(main)/areasite/page.tsx` | `RegionJobsPageClient.tsx` | **지역현장** — 지역 보기(전국·서울·경기…)+ 지역별 구인 목록 |
| `/arealike` | `app/(main)/arealike/page.tsx` | — | `/areasite` 리다이렉트 (구 지역저장 목록 대체) |
| `/customsite` | `app/(main)/customsite/page.tsx` | (페이지 내장) | **맞춤저장 설정** — 업종·지역·역할 필터 저장 |
| `/customlike` | `app/(main)/customlike/page.tsx` | (페이지 내장) | **맞춤저장 목록** — 저장 조건에 맞는 구인글 |
| `/like` | `app/(main)/like/page.tsx` | (페이지 내장) | **관심현장** — 좋아요한 구인글 목록 |
| `/list4` | `app/(main)/list4/page.tsx` | `List4PageClient.tsx` | **광고** — 카테고리(광고/대출/급매물/중고장터)·2열 카드 목록 |
| `/textsearch` | `app/(main)/textsearch/page.tsx` | (페이지 내장) | **제목검색** — 키워드로 구인글 검색 |

### 탐색 관련 공통 컴포넌트

| 파일 | 기능 |
|------|------|
| `components/RegionViewPanel.tsx` | 지역 보기 그리드 (전국·서울·경기 …) + 세부보기 모달 |
| `components/BlueStrip.tsx` | 상단 파란 안내줄 (전국 공지 티커 / 지역보기 중 안내) |
| `components/PostCard.tsx` | 구인 목록 카드 (썸네일·업종·역할·강조문구) |
| `components/KakaoMapPanel.tsx` | 지도검색 전체화면 패널 (portal) |
| `components/NewsPreview.tsx` | 첫화면 분양 뉴스 미리보기 |
| `components/FeedBanner.tsx` | 목록 중간·상단 배너 |
| `components/RegionSelectModal.tsx` | 구인등록 시 지역 선택 모달 |

---

## 3. 게시판 · 목록 (post_type별)

| URL | page 파일 | Client | 기능 |
|-----|-----------|--------|------|
| `/list2` | `app/(main)/list2/page.tsx` | `TypePostList.tsx` | 분양 뉴스 목록 (외부 링크 이동) |
| `/list3` | `app/(main)/list3/page.tsx` | `TypePostList.tsx` | 커뮤니티 목록 + 글작성 버튼 |
| `/list5` | `app/(main)/list5/page.tsx` | `TypePostList.tsx` | 공지사항 목록 (관리자 글작성) |
| `/list6` | `app/(main)/list6/page.tsx` | `TypePostList.tsx` | 문의·건의사항 목록 |
| `/list7` | `app/(main)/list7/page.tsx` | `TypePostList.tsx` | 분양대행 문의 확인 목록 |
| `/listboard` | `app/(main)/listboard/page.tsx` | (페이지 내장) | 분양 뉴스 + 커뮤니티 요약 보드 |

| 파일 | 기능 |
|------|------|
| `components/TypePostList.tsx` | 단순 제목 목록형 게시판 (페이지네이션) |

---

## 4. 글쓰기

| URL | page 파일 | Client | 기능 |
|-----|-----------|--------|------|
| `/write` | `app/(main)/write/page.tsx` | `write/WritePageClient.tsx` | **구인등록** — 업종·역할·수수료·지도·이미지 등 전체 폼 |
| `/write3` | `app/(main)/write3/page.tsx` | `SimpleTypeWriteClient.tsx` | 커뮤니티 글 작성·수정 |
| `/write4` | `app/(main)/write4/page.tsx` | `AdWritePageClient.tsx` | **광고 등록·수정** (카테고리·이미지·사업지 지도) |
| `/write5` | `app/(main)/write5/page.tsx` | `SimpleTypeWriteClient.tsx` | 공지사항 작성 (관리자) |
| `/write6` | `app/(main)/write6/page.tsx` | `SimpleTypeWriteClient.tsx` | 문의·건의 작성 |
| `/write7` | `app/(main)/write7/page.tsx` | `SimpleTypeWriteClient.tsx` | 분양대행 문의 작성 |

| 파일 | 기능 |
|------|------|
| `components/SimpleTypeWriteClient.tsx` | 제목·내용·이미지 단순 게시글 작성 공통 |
| `components/AdWritePageClient.tsx` | 광고(post_type 4) 전용 작성 폼 |
| `components/MapLocationField.tsx` | 주소 입력 + 미니 지도 (모델하우스/사업지) |

---

## 5. 상세

| URL | page 파일 | Client | 기능 |
|-----|-----------|--------|------|
| `/[id]` | `app/(main)/[id]/page.tsx` | `[id]/PostDetail.tsx` | 게시글 상세 (post_type별 분기) |

| 파일 | 기능 |
|------|------|
| `[id]/PostDetail.tsx` | post_type에 따라 아래 컴포넌트 선택 |
| `components/JobPostDetail.tsx` | 구인글(post_type 1) 상세 |
| `components/AdPostDetail.tsx` | 광고(post_type 4) 상세 |
| `components/CommentsSection.tsx` | 댓글 영역 |
| `components/Heart.tsx` | 관심(좋아요) 버튼 |
| `components/AddressMapSection.tsx` | 모델하우스·사업지 주소·지도 |

---

## 6. 마이메뉴 · 계정 · 포인트

| URL | page 파일 | 기능 |
|-----|-----------|------|
| `/myboard` | `app/(main)/myboard/page.tsx` | **마이메뉴** — 등급·포인트·캐시·추천·내 글 링크·로그아웃 |
| `/mypage` | `app/(main)/mypage/page.tsx` | `MyPageClient.tsx` — 내 구인글 목록·관리 |
| `/mypage3` | `app/(main)/mypage3/page.tsx` | 내 커뮤니티글 |
| `/mypage4` | `app/(main)/mypage4/page.tsx` | 내 광고글 |
| `/login` | `app/(main)/login/page.tsx` | 로그인 |
| `/signup` | `app/(main)/signup/page.tsx` | `SignupPageClient.tsx` — 회원가입 |
| `/findid` | `app/(main)/findid/page.tsx` | 아이디 찾기 (휴대폰 인증) |
| `/resetpassword` | `app/(main)/resetpassword/page.tsx` | 비밀번호 재설정 |
| `/noti` | `app/(main)/noti/page.tsx` | 알림함 (받은/보낸) |
| `/points` | `app/(main)/points/page.tsx` | 포인트 내역·출석 체크 |
| `/cash` | `app/(main)/cash/page.tsx` | 캐시 내역 |
| `/referrals` | `app/(main)/referrals/page.tsx` | 내 추천인 목록 |
| `/referralranking` | `app/(main)/referralranking/page.tsx` | 추천 랭킹 (닉네임 마스킹) |
| `/referralnetwork` | `app/(main)/referralnetwork/page.tsx` | 추천 네트워크 트리 |

| 파일 | 기능 |
|------|------|
| `app/(main)/mypage/MyPageClient.tsx` | 내 구인글 카드 목록 |
| `components/MyTypePostsClient.tsx` | 타입별 내 글 목록 (mypage3·4) |
| `components/ReferralModal.tsx` | 추천 코드 공유 모달 |

---

## 7. 결제

| URL | page 파일 | Client | 기능 |
|-----|-----------|--------|------|
| `/payment/toss` | `app/(main)/payment/toss/page.tsx` | `TossPaymentClient.tsx` | 토스 결제 요청 |
| `/payment/toss/success` | `app/(main)/payment/toss/success/page.tsx` | (페이지 내장) | 결제 성공 처리 |
| `/payment/toss/fail` | `app/(main)/payment/toss/fail/page.tsx` | (페이지 내장) | 결제 실패 안내 |

---

## 8. 관리자

| URL | page 파일 | Client | 기능 |
|-----|-----------|--------|------|
| `/adminusers` | `app/(main)/adminusers/page.tsx` | (페이지 내장) | 회원·관리자 계정 관리 |
| `/banneradmin` | `app/(main)/banneradmin/page.tsx` | `BannerAdminClient.tsx` | 상단·피드 배너 관리 |
| `/topbanneradmin` | `app/(main)/topbanneradmin/page.tsx` | `BannerAdminClient.tsx` | 상단 배너 전용 관리 |
| `/popupadmin` | `app/(main)/popupadmin/page.tsx` | `PopupAdminClient.tsx` | 홈 팝업 관리 |
| `/titlesearchadmin` | `app/(main)/titlesearchadmin/page.tsx` | `TitleSearchAdminClient.tsx` | 제목검색 키워드 관리 |
| `/todaystatus` | `app/(main)/todaystatus/page.tsx` | (페이지 내장) | 오늘 방문·통계 (관리) |

---

## 9. 광고 전용 (list4 하위)

| 파일 | 기능 |
|------|------|
| `components/List4PageClient.tsx` | 광고 목록 + 서브 카테고리 바(광고/대출/급매물/중고장터/글작성) + 2열 카드 |

---

## 10. lib · API (페이지가 의존하는 핵심)

| 파일 | 기능 |
|------|------|
| `lib/api.ts` | API 클라이언트 (Posts, Auth, Points, …) |
| `lib/session.ts` | 로그인 세션 (localStorage) |
| `lib/regionUtils.ts` | 지역 코드·필터·퀵 지역 옵션 |
| `lib/authErrors.ts` | API 오류 메시지 한글화 |
| `lib/seo.ts` | 메타·OG (상세 SEO) |
| `lib/serverApi.ts` | 서버 컴포넌트용 게시글 fetch |

---

## 빠른 찾기 (자주 쓰는 화면)

```
첫화면(전국)     → list/page.tsx + ListPageClient.tsx
지역현장         → areasite/page.tsx + RegionJobsPageClient.tsx
광고             → list4/page.tsx + List4PageClient.tsx
구인 상세        → [id]/page.tsx + JobPostDetail.tsx
구인 등록        → write/page.tsx + WritePageClient.tsx
마이메뉴         → myboard/page.tsx
공통 카테고리 바 → CommonCategoryBar.tsx + categoryNav.ts
```
