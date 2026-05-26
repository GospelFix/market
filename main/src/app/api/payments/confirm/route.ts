import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmTossPayment } from '@/lib/toss/payments'
import { createSignedDownloadUrl } from '@/lib/supabase/storage'

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
    }

    const supabase = await createClient()

    // 인증된 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // DB에서 주문 정보 조회 및 금액 검증
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products(file_path)')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (order.amount !== amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 })
    }

    // 중복 호출 방어: pending → confirming 으로 원자적 상태 변경
    const { count } = await supabase
      .from('orders')
      .update({ status: 'confirming' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .select('id', { count: 'exact', head: true })

    if (!count || count === 0) {
      return NextResponse.json({ error: '이미 처리 중이거나 완료된 주문입니다.' }, { status: 409 })
    }

    // Toss 서버 결제 승인
    await confirmTossPayment({ paymentKey, orderId, amount })

    // Storage 서명 URL 생성
    const filePath = order.products?.file_path
    let downloadUrl: string | null = null
    if (filePath) {
      downloadUrl = await createSignedDownloadUrl(filePath)
    }

    // orders 테이블 업데이트
    await supabase
      .from('orders')
      .update({
        payment_key: paymentKey,
        status: 'paid',
        download_url: downloadUrl,
        paid_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)

    return NextResponse.json({ success: true, downloadUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
