# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 구조

두 개의 독립적인 Next.js 앱으로 구성된 모노레포:

```
service.supabase.v2/
├── frontend/    # 사용자 앱 (포트 3000)
└── admin/       # 관리자 앱 (포트 3001)
```

Supabase 스키마는 **대시보드에서 직접 관리** (로컬 CLI 마이그레이션 미사용).

---

## 명령어

### frontend/
```bash
cd frontend
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

## frontend/ 아키텍처

**기술 스택:** Next.js 14 (App Router) · Tailwind CSS v3 · shadcn/ui (base-nova) · Recoil · Axios · @supabase/ssr

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

### admin vs frontend 미들웨어 차이

admin의 `updateSession()`은 `{ supabaseResponse, user }`를 반환하여 미들웨어에서 분리 처리. frontend는 리다이렉트 로직이 `updateSession()` 내부에 포함.

### 디렉토리 관례

- `src/libs/` (admin) vs `src/lib/` (frontend) — 네이밍 차이 주의
- admin은 `cookies()`를 동기로 호출 (Next.js 14 패턴), frontend는 `await cookies()`

---

## 환경변수

```env
# frontend/.env.local, admin/.env.local 동일
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
