# 어드민 인증 강화 플랜 (ADMIN_AUTH_HARDENING)

> 작성일 2026-06-25 · 대상 `chalkak-admin-client` (Next.js 14) + `chalkak-admin-server`
> 본 문서는 **설계 플래그**입니다. 본 브랜치(`fix/critical-audit-2026-06-25`)에서는
> 코드 전환을 수행하지 않습니다 — 서버 Set-Cookie / 미들웨어 서명검증 / RBAC와
> 협응이 필요한 변경이라 별도 스프린트에서 백엔드와 동시에 진행해야 합니다.

대응 보안 HIGH 2건 (`_workspace_security_audit_2026-06-25/sec-frontend.md`):
1. 어드민 JWT를 localStorage + 非HttpOnly 쿠키에 저장 → XSS 시 토큰 탈취 = 어드민 전면 장악
2. ADMIN 전용 파괴적 액션이 localStorage `admin_info.role` 값에만 의존 (클라 게이팅)

---

## (a) 현재 토큰 저장 / 미들웨어 검증 흐름

### 토큰 저장 — `src/lib/apiClient.ts`
- 로그인 성공 시 access token을 **두 곳에 동시 저장**:
  - `localStorage.setItem(TOKEN_KEY, token)` (`apiClient.ts:18-21` 부근)
  - `document.cookie = "admin_token=${token}; path=/; SameSite=Strict[; Secure]"`
    → **HttpOnly 아님** (JS `document.cookie`로 직접 set하므로 구조적으로 HttpOnly 불가)
- API 호출 시 `apiClient.ts:46-47`에서 localStorage 토큰을 읽어 `Authorization: Bearer ...` 헤더로 부착.
- `apiClient.ts:11-16` 주석에 HttpOnly 전환이 **명시적으로 보류**된 상태로 기록됨 (과거 ADM-C-SEC-001 미완).

### 역할(role) 출처 — `src/context/AuthContext.tsx:22-25`
- `admin_info` JSON을 **localStorage에서 파싱**하여 `admin.role`을 결정.
- 사용자가 DevTools로 편집 가능 → `admin_info.role`을 `"ADMIN"`으로 위조 가능.

### 위험 액션 게이팅 (전부 클라 `admin?.role === "ADMIN"` UI 숨김)
- 강제탈퇴 / 강제로그아웃: `Users/UserDangerZone.tsx:22,26`
- 포인트 적립/차감: `Users/UserDetailClient.tsx:46`, `Users/UserPointSection.tsx:14`
- 실시간 위치 좌표 열람: `LocationShares/LocationShareDetailClient.tsx:57`, `LocationShares/LiveLocationSection.tsx:32`
- PII CSV 다운로드: `common/CsvExportButton.tsx:89-90`
- 마스터 CRUD: `PlaceTypes`/`UserTitles`/`Terms`/`Faqs`/`OssLicenses` ListClient

### 미들웨어 검증 — `src/middleware.ts:7,12`
- `admin_token` 쿠키의 **존재 여부만** 확인. JWT 서명·만료·role을 **검증하지 않음**.
- 임의의 비어있지 않은 값으로 미들웨어 게이트 우회 가능 (이후 API는 토큰 불일치로 401이라
  데이터 누출은 없으나, 미들웨어는 실질적 인증 장치가 아님 — "쿠키 존재 체크"에 불과).

### 요약 위협 모델
- 어드민 화면 내 임의 XSS 1건 → `localStorage['admin_access_token']` 또는 `admin_token` 쿠키
  탈취 → 어드민 API 전권. 토큰이 JS로 읽히는 한 XSS = 전면 장악.
- localStorage role 위조 → 위험 액션 버튼 노출 (단, 서버가 재검증하면 실제 실행은 차단).

---

## (b) HttpOnly 전환 설계 (서버 Set-Cookie + 미들웨어 서명검증)

목표: **토큰을 JS가 읽을 수 없게** 하고, 미들웨어가 **존재가 아닌 유효성**을 검증.

### B-1. 서버 — HttpOnly 쿠키 발급 (`chalkak-admin-server`)
- 로그인 (`POST /admin/auth/login`) 응답에서 토큰을 body로 주는 대신 **Set-Cookie**:
  ```
  Set-Cookie: admin_token=<JWT>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=<exp>
  ```
- 리프레시 토큰을 쓴다면 별도 HttpOnly 쿠키(`admin_refresh`) + 좁은 Path(`/admin/auth/refresh`).
- 로그아웃 시 `Max-Age=0`으로 쿠키 만료 응답.
- 인증 필터를 `Authorization` 헤더 우선에서 **쿠키 우선**(혹은 둘 다 허용 후 헤더 제거)로 조정.

### B-2. 클라이언트 — 토큰 직접 보관 제거 (`apiClient.ts`)
- `localStorage.setItem(TOKEN_KEY, ...)` 및 `document.cookie = admin_token=...` **삭제**.
- fetch에 `credentials: "include"` 부여 → 브라우저가 HttpOnly 쿠키 자동 전송.
- `Authorization: Bearer` 부착 로직 제거 (쿠키 인증으로 일원화).
- **CSRF 대응 필수**: 쿠키 자동전송으로 전환하면 CSRF 노출 → 다음 중 하나
  - 서버가 발급하는 CSRF 토큰을 non-HttpOnly 쿠키 + `X-CSRF-Token` 헤더로 더블서밋, 또는
  - 모든 변이 요청에 `X-Requested-With: XMLHttpRequest` 강제 + 서버 검증 (client 앱 패턴과 통일).
  - (`sec-frontend.md` MEDIUM "CSRF 토큰 부재" 항목과 같은 작업으로 묶어 처리.)

### B-3. 미들웨어 — 존재 체크 → 서명·만료 검증 (`src/middleware.ts`)
- `admin_token` 쿠키의 **JWT 서명·만료를 검증**.
  - Edge 런타임 호환 `jose` 라이브러리로 `jwtVerify(token, secret)` (HS256 등 서버와 동일 알고리즘/시크릿).
  - 시크릿은 서버 전용 env (`ADMIN_JWT_SECRET`)로 주입, `NEXT_PUBLIC_` 금지.
- 검증 실패(서명 불일치/만료/부재) 시 `/login`으로 redirect.
- (선택) 페이지 단위 최소 role 게이트가 필요하면 검증된 claim의 `role`을 미들웨어에서 참조.
  단 이는 **UI 라우팅 방어선**일 뿐, 실제 권한 판정은 항상 서버(C 참조).

### B-4. 마이그레이션 순서 (브레이킹 회피)
1. 서버가 Set-Cookie(HttpOnly) **추가** 발급 + 기존 헤더 인증 **병행 유지**.
2. 클라가 쿠키 인증 + CSRF로 전환, localStorage/JS쿠키 쓰기 제거.
3. 미들웨어 JWT 검증 도입.
4. 안정화 후 서버에서 헤더 기반 인증 경로 제거.

---

## (c) role localStorage 의존 — 클라 게이팅의 위치

- 이번 CRITICAL 라운드의 **서버 RBAC 강화로 모든 ADMIN/OPERATOR 엔드포인트가 서버에서
  role을 재검증**한다 (백엔드 작업). 따라서 위조된 `admin_info.role`로 위험 버튼을 노출시켜도
  실제 호출은 **서버 403**으로 차단된다.
- 즉 **클라이언트 role 게이팅은 보안 경계가 아니라 UI 방어선(편의·실수 방지)** 으로만 취급한다.
  - 정상 운영자에게 권한 없는 버튼을 숨겨 오작동을 줄이는 UX 장치.
  - 위조 클라이언트에 대한 실제 방어는 **서버 RBAC 단일 진실원천**이 담당.
- 후속(선택, 비차단): `admin_info`를 localStorage 신뢰 출처로 쓰는 대신, HttpOnly 세션 확립 후
  `GET /admin/auth/me`로 **서버에서 role을 조회**해 메모리 컨텍스트에 보관하면 위조 표면이 줄어든다.
  (UI 게이팅 정확도 향상 목적이며, 권한 판정 자체는 여전히 각 엔드포인트 서버 재검증으로 보장.)

---

## 본 브랜치에서 한 것 / 안 한 것
- **안 함(의도적):** 토큰 저장 방식 전환, 미들웨어 JWT 검증, role 출처 변경 — 서버 협응 필요.
- **기록만:** 본 문서로 현재 흐름·전환 설계·게이팅 위치 명문화.
- 본 브랜치의 실제 코드 변경은 QA HIGH 6건 수정에 한정 (인증 흐름 불변).
</content>
</invoke>
