import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 서버 컴포넌트 / API Route / Server Action에서 사용하는 Supabase 클라이언트
 * Next.js cookies()를 통해 세션을 읽고 쓴다
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<CookieMethodsServer['setAll']>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 호출 시 set은 무시됨 (미들웨어가 처리)
          }
        },
      },
    },
  );
}
