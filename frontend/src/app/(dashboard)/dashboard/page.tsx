import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, role, created_at')
        .eq('id', user.id)
        .single()
    : { data: null }

  const displayName = profile?.full_name ?? user?.email ?? '사용자'
  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">안녕하세요, {displayName}님</h1>
        <p className="text-muted-foreground mt-1">대시보드에 오신 것을 환영합니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>이메일</CardDescription>
            <CardTitle className="text-base">{user?.email ?? '-'}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>권한</CardDescription>
            <CardTitle className="text-base">
              {profile?.role === 'admin' ? '관리자' : '일반 사용자'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>가입일</CardDescription>
            <CardTitle className="text-base">{joinedAt}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>시작하기</CardTitle>
          <CardDescription>서비스를 활용하는 방법을 알아보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            여기에 주요 기능 링크나 온보딩 안내를 추가하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
