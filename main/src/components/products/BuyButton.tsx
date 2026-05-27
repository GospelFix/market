'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRecoilValue } from 'recoil'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { isAuthenticatedSelector } from '@/store/selectors/authSelector'
import { authUserAtom } from '@/store/atoms/authAtom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BuyButtonProps {
  productId: string
  productSlug: string
  productName: string
  price: number
}

export function BuyButton({ productId, productSlug, productName, price }: BuyButtonProps) {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector)
  const user = useRecoilValue(authUserAtom)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isAuthenticated || !user) {
      router.push(`/login?next=/main/${productSlug}`)
      return
    }

    setLoading(true)
    try {
      // 1단계: 서버에 pending 주문 생성
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, amount: price }),
      })

      if (!orderRes.ok) {
        const { error } = await orderRes.json()
        alert(error ?? '주문 생성에 실패했습니다.')
        return
      }

      const { orderId } = await orderRes.json()

      // 2단계: Toss 결제 요청
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey) {
        alert('결제 시스템 설정 오류입니다. 관리자에게 문의해주세요.')
        return
      }
      const tossPayments = await loadTossPayments(clientKey)
      const payment = tossPayments.payment({ customerKey: user.id })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: price },
        orderId,
        orderName: productName,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
      })
    } catch (err) {
      console.error(err)
      alert('결제 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
    >
      {loading ? '처리 중...' : `${price.toLocaleString('ko-KR')}원 구매하기`}
    </button>
  )
}
