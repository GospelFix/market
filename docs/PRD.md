# service.supabase.v2 PRD

> **한 줄 요약**: Supabase 인증 + Next.js 14 기반의 사용자/관리자 분리 풀스택 스타터킷
> **작성일**: 2026-04-22 | **상태**: 개발 진행 중

---

## 1. 문제 정의

**해결하는 문제**

새 프로젝트를 시작할 때마다 인증 흐름, 관리자 분리, 상태 관리, API 클라이언트 설정을 처음부터 반복 구현해야 하는 비효율이 발생한다. 이 프로젝트는 Supabase 기반의 인증과 역할 분리(user/admin)가 적용된 모노레포 스타터킷으로, 새 서비스를 빠르게 시작할 수 있는 기반을 제공한다.

**성공 지표**

- 새 프로젝트 착수 시 인증/인가 구현 시간 0 (스타터킷 복사 후 바로 비즈니스 로직 개발 가능)
- 사용자 앱(frontend)과 관리자 앱(admin)이 독립적으로 배포 가능한 상태 유지

---

## 2. 사용자

**주요 사용자**

- **일반 사용자**: 회원가입 → 로그인 → 대시보드 접근
- **관리자**: 별도 admin 앱을 통해 사용자 및 데이터 관리

**핵심 사용 시나리오**

1. 사용자가 `/register`에서 이메일로 회원가입 → Supabase `auth.users` + `profiles` 테이블 자동 생성 → `/dashboard` 리다이렉트
2. 관리자가 `admin` 앱 `/sign/in`에서 로그인 → 전체 사용자/데이터 관리 화면 접근

---

## 3. 핵심 기능 (MVP)

### 인증 (frontend)

- **설명**: 이메일/비밀번호 기반 회원가입, 로그인, 로그아웃
- **동작**:
  - `middleware.ts` → `updateSession()`으로 세션 갱신 및 라우트 보호
  - 비인증 시 `/login` 리다이렉트 / 인증 상태에서 `/login` 접근 시 `/dashboard` 리다이렉트
  - Axios 인터셉터가 매 요청마다 `access_token` 자동 주입, 401 시 자동 갱신
- **완료 기준**: 로그인 → 대시보드 접근, 비인증 접근 시 로그인 페이지로 이동

### 프로필 관리

- **설명**: 회원가입 시 `profiles` 테이블 자동 생성 및 역할 부여
- **동작**:
  - `handle_new_user()` DB 트리거로 `auth.users` INSERT 시 자동으로 `profiles` 행 생성
  - `role` 필드: `user` (기본) / `admin`
- **완료 기준**: 회원가입 후 `profiles` 테이블에 해당 레코드 자동 생성 확인

### 상태 관리 (frontend)

- **설명**: Recoil atoms로 인증 상태 전역 관리
- **동작**:
  - `AuthProvider`가 `supabase.auth.onAuthStateChange()` 구독 → `sessionAtom`, `authUserAtom`, `userProfileAtom` 동기화
  - `useAuth()`, `useUser()` 훅으로 컴포넌트에서 접근
- **완료 기준**: 로그인/로그아웃 시 전체 앱 상태가 즉시 반영

### 관리자 앱 (admin)

- **설명**: 일반 frontend와 분리된 관리자 전용 Next.js 앱
- **동작**:
  - 포트 3001에서 독립 실행
  - `/sign/in`, `/sign/up`, `/auth/callback` 외 모든 라우트 보호
  - @tanstack/react-query 기반 데이터 패칭
- **완료 기준**: 관리자 로그인 후 보호 라우트 접근 가능, 비인증 시 `/sign/in` 리다이렉트

> ⚠️ **MVP 제외 항목 (v2 이후)**
>
> - OAuth (소셜 로그인)
> - 이메일 인증 커스터마이징
> - 관리자 페이지 상세 UI (사용자 목록, 통계 등)
> - 파일 업로드 (아바타 등)

---

## 4. 기술 명세

**기술 스택**

| 구분       | frontend                                | admin                   |
| ---------- | --------------------------------------- | ----------------------- |
| 프레임워크 | Next.js 14 (App Router)                 | Next.js 14 (App Router) |
| 스타일     | Tailwind CSS v3 + shadcn/ui (base-nova) | -                       |
| 상태 관리  | Recoil                                  | @tanstack/react-query   |
| HTTP       | Axios (인터셉터 포함)                   | Axios                   |
| 인증       | @supabase/ssr                           | @supabase/ssr           |
| 포트       | 3000                                    | 3001                    |

**주요 데이터 모델**

```sql
-- profiles 테이블
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**주요 파일 구조**

```
frontend/src/
├── app/
│   ├── (auth)/login, register   # 공개 라우트
│   └── dashboard/               # 보호 라우트
├── lib/
│   ├── supabase/client.ts       # 클라이언트 컴포넌트용
│   ├── supabase/server.ts       # 서버 컴포넌트용
│   ├── supabase/middleware.ts   # 세션 갱신 + 리다이렉트
│   └── axios/interceptors.ts   # 토큰 자동 주입
├── store/
│   ├── authAtom.ts              # 세션/유저 상태
│   ├── userAtom.ts              # 프로필 데이터
│   └── uiAtom.ts                # UI 상태
└── middleware.ts                 # 라우트 보호

admin/src/
├── app/
│   ├── sign/in, sign/up         # 공개 라우트
│   ├── auth/callback            # OAuth 콜백
│   └── (protected)/             # 보호 라우트
└── libs/                        # frontend의 lib/과 동일 역할
```

**환경변수**

```env
# frontend/.env.local, admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 5. 화면 흐름

**frontend**

```
/ (루트)
  ├── 비인증 → /login
  │     ├── 로그인 성공 → /dashboard
  │     └── 회원가입 링크 → /register → 가입 성공 → /dashboard
  └── 인증 → /dashboard
        └── 로그아웃 → /login
```

**admin**

```
/ (루트)
  ├── 비인증 → /sign/in
  │     ├── 로그인 성공 → / (대시보드)
  │     └── 회원가입 링크 → /sign/up
  └── 인증 → 관리자 대시보드
```

---

## 6. 개발 태스크 (체크리스트)

**Phase 1 - 기반 인프라**

- [x] 모노레포 구조 설정 (frontend/, admin/)
- [x] Supabase 프로젝트 연결 및 환경변수 설정
- [x] profiles 테이블 + 자동 생성 트리거 설정
- [x] 미들웨어 인증 흐름 구현 (frontend, admin)

**Phase 2 - 인증 기능**

- [x] 회원가입 / 로그인 / 로그아웃 페이지 (frontend)
- [x] Recoil 상태 관리 설정 (AuthProvider, atoms)
- [x] Axios 인터셉터 (토큰 주입 + 401 자동 갱신)
- [x] admin 로그인 / 회원가입 페이지

**Phase 3 - 대시보드 UI**

- [x] frontend 대시보드 기본 레이아웃
- [ ] admin 사용자 목록 페이지
- [ ] 프로필 수정 기능
- [ ] 관리자 역할 변경 기능

---

## 7. 리스크 & 결정 필요 사항

- **shadcn/ui base-nova 스타일**: `asChild` prop 없음 → `<Link className={buttonVariants()}>` 패턴 필수. 신규 개발자 온보딩 시 주의 필요
- **admin vs frontend 디렉토리 네이밍**: `src/libs/` (admin) vs `src/lib/` (frontend) 차이 — 통일 여부 결정 필요
- **Supabase 스키마 관리**: 현재 대시보드 직접 관리 방식 → 팀 규모 확장 시 마이그레이션 도구(Supabase CLI) 도입 검토
- **미결정**: admin 앱의 RLS 정책 설계 (관리자만 전체 데이터 접근 가능하도록)
