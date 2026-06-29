# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev       # or: yarn dev

# Build & production
npm run build
npm run start

# Lint
npm run lint
```

No test framework is configured.

## Architecture

This is a **Next.js 14 App Router** admin dashboard built on the [TailAdmin](https://tailadmin.com/) free template, using React 18, TypeScript, and Tailwind CSS.

### Page layout flow

Every page follows this pattern:
1. `src/app/layout.tsx` (root) — client component; shows a 1-second `<Loader>` on initial render, then renders children
2. Each page wraps its content in `<DefaultLayout>` (`src/components/Layouts/DefaultLayout.tsx`)
3. `DefaultLayout` composes `<Sidebar>` + `<Header>` + a `<main>` content area

### Key directories

- `src/app/` — App Router pages; each `page.tsx` imports a component from `src/components/` and wraps it in `DefaultLayout`
- `src/components/` — UI components grouped by feature (Charts, Dashboard, Header, Sidebar, Tables, etc.)
- `src/hooks/` — `useLocalStorage` (generic) and `useColorMode` (reads/writes `color-theme` key to localStorage)
- `src/types/` — TypeScript interfaces for data shapes (brand, product, chat, etc.)
- `src/css/` — `satoshi.css` (Satoshi font face declarations) and `style.css` (global overrides)

### Dark mode

Dark mode uses Tailwind's `class` strategy. `useColorMode` adds/removes the `dark` class on `document.body` and persists the preference in localStorage. The `<body>` in `layout.tsx` uses `suppressHydrationWarning` to avoid SSR mismatch from the localStorage read.

### Sidebar navigation

Menu items are defined as a static `menuGroups` array at the top of `src/components/Sidebar/index.tsx`. To add a new route, append an entry there. The active item is tracked via `useLocalStorage("selectedMenu", ...)`.

### Browser-only components

Components that depend on browser APIs (`MapOne`, `ChartThree`) are imported with `dynamic(..., { ssr: false })` in `src/components/Dashboard/E-commerce.tsx`. Apply the same pattern to any new component that uses `window` or DOM APIs at import time.

### Path alias

`@` maps to `src/` (configured in `tsconfig.json`). Use `@/components/...`, `@/hooks/...`, etc.

### Tailwind customization

`tailwind.config.ts` extends the default theme with the `Satoshi` font family, a large set of custom spacing/size tokens (e.g. `w-72.5`, `p-6.5`), custom color tokens (`primary`, `bodydark`, `boxdark`, `meta-*`, etc.), and extended z-index values up to `999999`. Use these existing tokens rather than arbitrary values.

---

## 구현 이력

### 포토 어디게 게임 운영 (2026-06-29)

- `src/app/geo-quiz/{config,excluded-articles,stats,plays}/page.tsx` (신규) — 게임 설정·출제 제외 블록리스트·통계 대시보드·플레이 데이터 관리 4페이지
- `src/components/GeoQuiz/*` (신규 8개) — `GeoQuizConfigClient`(보상포인트·감쇠상수·MAX점수·문항수 폼), `GeoQuizExcludedArticleClient`+`GeoQuizExcludedCreateModal`, `GeoQuizStatsClient`(요약카드+일별추이바+일별랭킹), `GeoQuizPlayClient`+상세/점수정정/삭제 모달
- `src/lib/api/geoQuiz.ts` (신규) — admin-server geoQuiz 엔드포인트 10개 매핑
- `src/types/admin.ts` (확장), `src/components/Sidebar/index.tsx` (확장) — 사이드바 "리텐션 운영" 그룹에 4메뉴 추가
- 변경 액션(설정 저장·블록 등록/해제·점수 정정·삭제)은 `useAuth().admin.role === "ADMIN"`만 노출, OPERATOR/VIEWER 읽기 전용
- **출제 관리 2탭 확장 (2026-06-29)** — `/geo-quiz/excluded-articles`를 "출제 관리"로 확장: "출제 제외"(블록) / "출제 지정"(featured 큐레이션) 2탭(`GeoQuizArticleManageClient` 래퍼 + `GeoQuizFeaturedArticleClient` + `GeoQuizFeaturedCreateModal`). 출제 지정에 **큐레이션 모드 활성 배너**(지정 적격 글 1개라도 있으면 그 목록 안에서만 출제, 비면 자동 풀, 블록 우선). `lib/api/geoQuiz.ts` featured 3함수(`listFeatured/createFeatured/removeFeatured`), `GeoQuizFeaturedArticle` 타입. 라우트·사이드바 불변
- **출제 지정 bulk 일괄 등록 (2026-06-29):** `GeoQuizFeaturedCreateModal` 재작성 — 단건 articleId 입력 → **다건 ID 입력(쉼표·공백·줄바꿈 구분, 비숫자 토큰 무시·중복 자동 제거·최대 200건) + 공통 사유 1개**. `geoQuizApi.createFeaturedBulk({items:[{articleId,reason?}]})` 호출 후 모달 내 결과 요약(등록/이미 등록/실패 카운트 + skip ID 목록 + 실패 항목 메시지) 표시. `GeoQuizFeaturedBulkResult` 타입 추가. 단건 `createFeatured`는 하위호환 보존. 부모 버튼 라벨 "+ 출제 지정 등록 (일괄)"

### 인기검색어 수정/긴급삭제 (2026-06-01)

- `src/components/Keywords/PopularKeywordEditModal.tsx` (신규) — 키워드/순위 수정 폼 모달 (ESC·오버레이 닫기)
- `src/components/Keywords/PopularKeywordDeleteModal.tsx` (신규) — 긴급삭제 확인 모달 (이중확인 입력 + 재정렬 토글 + 사유 입력, ESC·오버레이 닫기 불가)
- `src/components/Keywords/KeywordClient.tsx` (수정) — 인기검색어 테이블에 **[편집] / [긴급삭제]** 액션 컬럼 추가, `key={kw.popularKeywordId}` 교체
- `src/types/admin.ts` (수정) — `PopularKeyword.popularKeywordId: number`, `PopularKeywordUpdatePayload`, `PopularKeywordDeletePayload` 추가
- `src/lib/api/keywords.ts` (수정) — `updatePopularKeyword()`, `deletePopularKeyword()` 추가

### 개인정보 마스킹 시스템 (2026-06-09)

**공용 컴포넌트**
- `src/components/common/MaskedField.tsx` (신규) — `masked=true`이면 마스킹 값 + EyeOff 아이콘 버튼, `masked=false`이면 값만 표시. `e.stopPropagation()`으로 row 클릭과 분리.
- `src/components/common/UnmaskModal.tsx` (신규) — 사유 입력(5~500자, 글자수 카운터) + `POST /unmask-grants` 호출. 성공 시 `onSuccess(expiresAt)` 콜백. ESC·배경 클릭으로 닫기.
- `src/lib/api/unmask.ts` (신규) — `unmaskApi.createGrant(targetType, targetId, reason)`

**타입 추가 (`src/types/admin.ts`)**
- `AdminUser`: `emailMasked: boolean`, `phoneNumberMasked: boolean`
- `AdminUserAccount`: `emailMasked: boolean`, `lastLoginIpMasked: boolean`
- `AuditLog`: `requestIpMasked: boolean`
- `UnmaskTargetType = 'USER' | 'ADMIN_USER' | 'AUDIT_LOG'`

**적용 페이지**
- `UserDetailClient.tsx` — 이메일·전화번호 `MaskedField` 적용 (`targetType='USER'`)
- `UserListClient.tsx` — 이메일 컬럼 `MaskedField` 적용
- `AdminUserListClient.tsx` — 이메일·IP 컬럼 `MaskedField` 적용, IP 컬럼 신규 추가 (col 8→9)
- `AuditLogListClient.tsx` — requestIp 컬럼 `MaskedField` 적용 (`targetType='AUDIT_LOG'`)
