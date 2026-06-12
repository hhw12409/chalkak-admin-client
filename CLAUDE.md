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
