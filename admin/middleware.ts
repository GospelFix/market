import { type NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/libs/supabase/middleware';

// 로그인 없이 접근 가능한 공개 경로
const PUBLIC_PATHS = ['/sign/in', '/sign/up', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // 비로그인 상태에서 보호된 경로 접근 시 로그인 페이지로 리다이렉트
  if (!user && !isPublicPath) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/sign/in';
    return NextResponse.redirect(signInUrl);
  }

  // 로그인 상태에서 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  if (user && (pathname.startsWith('/sign/in') || pathname.startsWith('/sign/up'))) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 아래 경로는 제외:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
