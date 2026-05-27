# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 구조

두 개의 독립적인 Next.js 앱으로 구성된 모노레포:

```
service.supabase.v2/
├── main/        # 사용자 앱 (포트 3000)
└── admin/       # 관리자 앱 (포트 3001)
```

Supabase 스키마는 **대시보드에서 직접 관리** (로컬 CLI 마이그레이션 미사용).

---

## 명령어

### main/

```bash
cd main
npm run dev      # 개발 서버 (포트 3000)
npm run build    # 프로덕션 빌드 + TypeScript 검사
npm run lint     # ESLint
```

### admin/

```bash
cd admin
npm run dev      # 개발 서버 (포트 3001)
npm run build    # 프로덕션 빌드
npm run pretty   # Prettier 포맷
```

---

## main/ 아키텍처

**기술 스택:** Next.js 14 (App Router) · Tailwind CSS v3 · shadcn/ui (base-nova) · Recoil · Axios · @supabase/ssr · Toss Payments

### 라우트 그룹 구조

```
src/app/
├── login/            # /login — 인증 상태면 /dashboard 리다이렉트 (미들웨어 처리)
├── register/         # /register — 인증 상태면 /dashboard 리다이렉트 (미들웨어 처리)
├── (dashboard)/      # /dashboard — 비인증 시 /login 리다이렉트
├── (public)/         # /main, /main/[slug] — 공개 접근
├── api/
│   ├── orders/create/    # 주문 생성 API
│   └── payments/confirm/ # Toss Payments 결제 승인 API (멱등성 보장)
└── payments/
    ├── success/      # 결제 성공 페이지
    └── fail/         # 결제 실패 페이지
```

### 인증 흐름

```
브라우저 요청
  → middleware.ts              # 모든 요청 인터셉트
  → lib/supabase/middleware.ts # updateSession()으로 세션 갱신 + 리다이렉트 결정
  → 보호 라우트: /dashboard    # 비인증 시 /login으로 리다이렉트
  → 인증 라우트: /login, /register # 인증 상태면 /dashboard로 리다이렉트
```

서버 컴포넌트는 `lib/supabase/server.ts`의 `createClient()` (async)를 사용.
클라이언트 컴포넌트는 `lib/supabase/client.ts`의 `createClient()`를 사용.

### 상태 관리 (Recoil)

`AuthProvider` (컴포넌트)가 `supabase.auth.onAuthStateChange()`를 구독하여 Recoil atoms를 동기화:

- `authAtom.ts` — `sessionAtom`, `authUserAtom`, `authLoadingAtom`
- `userAtom.ts` — `userProfileAtom` (profiles 테이블 데이터)
- `uiAtom.ts` — `sidebarOpenAtom`, `toastAtom`
- `authSelector.ts` — `isAuthenticatedSelector`, `isAdminSelector` (파생 상태)

커스텀 훅 `useAuth()`, `useUser()`로 컴포넌트에서 접근.

### Axios 인스턴스

`lib/axios/interceptors.ts`가 매 요청마다 Supabase `access_token`을 `Authorization: Bearer` 헤더에 자동 주입. 401 응답 시 `refreshSession()` 후 재시도, 실패 시 `/login` 리다이렉트.

### Toss Payments 결제 흐름

```
사용자 → BuyButton 클릭
  → POST /api/orders/create     # Supabase에 orders 레코드 생성 (status: pending)
  → Toss Payments SDK 호출      # 결제창 띄움
  → /payments/success?paymentKey=...&orderId=...&amount=...
  → POST /api/payments/confirm  # Toss API 승인 요청
      - pending→confirming 원자적 상태 전환 (중복 confirm 방지)
      - Toss 승인 성공 시 status: paid (payment_key, paid_at 기록)
      - Toss 승인 실패 시 status: pending으로 롤백
  → /payments/fail              # 실패/취소 시
```

- `lib/toss/payments.ts` — Toss Payments 클라이언트 설정
- `lib/supabase/products.ts` — 상품 조회 함수
- `lib/supabase/storage.ts` — Supabase Storage 연동
- `types/product.types.ts` — 상품 타입 정의
- `components/products/BuyButton.tsx` — 결제 버튼 컴포넌트 (useRef로 중복 confirm 방지)
- `components/products/CategoryFilter.tsx` — 카테고리 필터
- `components/products/ProductCard.tsx` — 상품 카드

### shadcn/ui 주의사항

- **base-nova 스타일** 사용 — `@base-ui/react/button` 기반으로 `asChild` prop 없음
- 링크 버튼은 `<Button asChild>` 대신 `<Link className={buttonVariants()}>` 패턴 사용
- `form` 컴포넌트는 레지스트리에 없어 `src/components/ui/form.tsx`에 수동 생성됨
- `toast` 대신 `sonner` 사용
- `globals.css`에서 `@import "shadcn/tailwind.css"` 제거 필요 (Tailwind v4 전용)
- `tailwind.config.ts`에 모든 shadcn CSS 변수를 `var(--color-name)` 형태로 매핑

---

## admin/ 아키텍처

**기술 스택:** Next.js 14 (App Router) · @tanstack/react-query · Axios · @supabase/ssr

Tailwind, Recoil 미사용. 경량 관리자 전용 구성.

### 인증 경로

- `/sign/in`, `/sign/up` — 공개
- `/auth/callback` — OAuth 콜백
- 그 외 모든 경로 — 보호 (비인증 시 `/sign/in` 리다이렉트)

### 관리자 권한 보호

`src/libs/supabase/auth.ts`의 `requireAdmin()` 헬퍼가 모든 페이지 및 Server Action에 적용됨:

```ts
// 페이지/Server Action 최상단에 반드시 호출
const user = await requireAdmin()
```

### 상품 관리 페이지 (구현 완료)

```
src/app/
├── page.tsx              # 상품 목록 (전체 조회)
├── products/
│   ├── new/page.tsx      # 상품 등록
│   └── [id]/edit/page.tsx # 상품 편집/삭제
```

- `src/libs/supabase/products.ts` — 상품 CRUD 함수

### admin vs frontend 미들웨어 차이

admin의 `updateSession()`은 `{ supabaseResponse, user }`를 반환하여 미들웨어에서 분리 처리. frontend는 리다이렉트 로직이 `updateSession()` 내부에 포함.

### 디렉토리 관례

- `src/libs/` (admin) vs `src/lib/` (frontend) — 네이밍 차이 주의
- admin은 `cookies()`를 동기로 호출 (Next.js 14 패턴), frontend는 `await cookies()`

---

## 환경변수

### main/ 환경변수 파일 구조

Next.js는 `npm run dev` 시 `.env.development`를, `npm run build` 시 `.env.production`을 자동으로 적용합니다.

```
main/
├── .env                  # 공통 (git 추적) — Supabase 공개 키
├── .env.development      # 개발 전용 (git 추적) — Toss 테스트 키
└── .env.production       # 운영 전용 (gitignore) — Toss 라이브 키 (절대 커밋 금지)
```

```env
# main/.env  (공통)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# main/.env.development  (npm run dev 시 자동 적용)
TOSS_SECRET_KEY=test_sk_...   # 테스트 키

# main/.env.production  (npm run build 시 자동 적용 — gitignore)
TOSS_SECRET_KEY=live_sk_...   # 라이브 키 — 절대 NEXT_PUBLIC_ 접두사 사용 금지
```

> **주의**: `TOSS_SECRET_KEY`는 서버 사이드 전용입니다. `NEXT_PUBLIC_` 접두사를 붙이면 클라이언트에 노출됩니다.

### admin/ 환경변수

```env
# admin/.env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Supabase 스키마

대시보드 SQL Editor에서 직접 실행:

**profiles 테이블** (필수)

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 회원가입 시 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
