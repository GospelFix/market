# GospelFix Market

**브랜드 홈페이지 & 브랜드몰 웹 템플릿 마켓플레이스**

바로 사용 가능한 고품질 Next.js 템플릿을 구매하고 즉시 다운로드하세요.

🌐 **라이브 서비스**: https://market-lime-kappa.vercel.app

---

## 어떤 서비스인가요?

GospelFix Market은 개발자와 기업이 웹 프로젝트를 빠르게 시작할 수 있도록 검증된 템플릿을 제공하는 마켓플레이스입니다.

- 랜딩페이지, 대시보드, 이커머스, 포트폴리오, 블로그 등 다양한 카테고리
- 구매 즉시 파일 다운로드
- Toss Payments 기반 안전한 결제 (카카오페이, 신용카드 등)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 템플릿 갤러리 | 카테고리별 필터로 원하는 템플릿 탐색 |
| 상세 페이지 | 데모 미리보기 + 포함 항목 확인 |
| 회원가입 / 로그인 | 이메일 인증 기반 |
| 결제 | Toss Payments (카카오페이, 카드 등) |
| 즉시 다운로드 | 결제 완료 후 바로 파일 수령 |
| 관리자 페이지 | 상품 등록 / 편집 / 삭제 |

---

## 프로젝트 구조

Next.js 14 기반 모노레포로, 사용자 앱과 관리자 앱이 독립적으로 구성되어 있습니다.

```
market/
├── main/    # 사용자 앱 (포트 3000) → https://market-lime-kappa.vercel.app
└── admin/   # 관리자 앱 (포트 3001)
```

---

## 기술 스택

**사용자 앱 (main)**
- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (인증 + DB + Storage)
- Toss Payments
- Recoil (상태 관리)
- Axios

**관리자 앱 (admin)**
- Next.js 14 (App Router)
- Supabase
- @tanstack/react-query
- Axios

---

## 로컬 실행

### 사전 준비

- Node.js 18+
- Supabase 프로젝트 생성 및 환경변수 설정

### 환경변수 설정

`main/.env` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TOSS_SECRET_KEY=test_sk_your-secret-key
```

`admin/.env` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 실행

```bash
# 사용자 앱
cd main
npm install
npm run dev     # http://localhost:3000

# 관리자 앱
cd admin
npm install
npm run dev     # http://localhost:3001
```

---

## 결제 흐름

```
상품 선택 → 로그인 → 구매 버튼
  → 주문 생성 (DB)
  → Toss Payments 결제창
  → 결제 완료
  → 서버 승인 검증
  → 파일 다운로드 URL 발급
```

> Toss Payments 테스트 환경에서는 `TOSS_SECRET_KEY=test_sk_...` 키를 사용하세요.

---

## Supabase 스키마

Supabase 대시보드 SQL Editor에서 아래 스키마를 실행하세요.

```sql
-- products 테이블
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  demo_url TEXT,
  includes TEXT[] DEFAULT '{}',
  file_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- orders 테이블
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'paid')),
  payment_key TEXT,
  download_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- 회원가입 시 자동 프로필 생성 트리거
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

---

## 라이선스

MIT
