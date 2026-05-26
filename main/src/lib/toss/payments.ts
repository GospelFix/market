const TOSS_API_URL = 'https://api.tosspayments.com/v1/payments/confirm'

export async function confirmTossPayment({
  paymentKey,
  orderId,
  amount,
}: {
  paymentKey: string
  orderId: string
  amount: number
}) {
  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) {
    throw new Error('[결제] TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.')
  }
  const encoded = Buffer.from(`${secretKey}:`).toString('base64')

  const response = await fetch(TOSS_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? '결제 승인에 실패했습니다.')
  }

  return response.json()
}
