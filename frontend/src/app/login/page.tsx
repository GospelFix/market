'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next') ?? '/templates'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/templates'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="mt-1 text-sm text-muted-foreground">템플릿 마켓에 오신 걸 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(buttonVariants({ size: 'lg' }), 'w-full mt-1')}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{' '}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            회원가입
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/templates"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← 템플릿 둘러보기
          </Link>
        </div>
      </div>
    </div>
  )
}
