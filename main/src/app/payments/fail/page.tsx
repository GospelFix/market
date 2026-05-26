'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') ?? '결제가 취소되었습니다.'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <XCircle className="size-16 text-destructive" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">결제에 실패했습니다</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
      <div className="flex gap-3">
        <Link href="/templates" className={buttonVariants({ variant: 'outline' })}>
          템플릿 목록으로
        </Link>
        <button
          onClick={() => window.history.back()}
          className={buttonVariants()}
        >
          다시 시도하기
        </button>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
      <PaymentFailContent />
    </Suspense>
  )
}
