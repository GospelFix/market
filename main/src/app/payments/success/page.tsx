'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Download, Loader2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const confirmedRef = useRef(false)

  useEffect(() => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setError('결제 정보가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setDownloadUrl(data.downloadUrl)
        }
      })
      .catch(() => setError('결제 확인 중 오류가 발생했습니다.'))
      .finally(() => setLoading(false))
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-destructive">{error}</p>
        <Link href="/templates" className={buttonVariants({ variant: 'outline' })}>
          템플릿 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <CheckCircle className="size-16 text-green-500" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">결제가 완료되었습니다!</h1>
        <p className="mt-2 text-muted-foreground">
          구매해주셔서 감사합니다. 아래 버튼으로 파일을 다운로드하세요.
        </p>
      </div>
      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
        >
          <Download className="size-4" />
          파일 다운로드
        </a>
      )}
      <Link href="/templates" className={buttonVariants({ variant: 'ghost' })}>
        템플릿 목록으로 돌아가기
      </Link>
    </div>
  )
}
