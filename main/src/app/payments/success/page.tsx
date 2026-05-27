"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Mail, MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTACT_EMAIL = "thdbsgh3443@kakao.com";
const CONTACT_KAKAO = "https://pf.kakao.com/_CqKlX";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setError("결제 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 202) return; // 처리 중 — 성공 화면 유지
        if (data.error) setError(data.error);
      })
      .catch(() => setError("결제 확인 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-destructive">{error}</p>
        <Link href="/main" className={buttonVariants({ variant: "outline" })}>
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <CheckCircle className="size-16 text-green-500" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">결제가 완료되었습니다!</h1>
        <p className="mt-2 text-muted-foreground">
          구매해주셔서 감사합니다.
          <br />
          아래 채널로 문의주시면 빠르게 제작을 시작합니다.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-muted/40 p-6 flex flex-col gap-3">
        <p className="text-sm font-semibold text-center text-foreground">
          상담 채널
        </p>
        <a
          href={CONTACT_KAKAO}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "gap-2 w-full")}
        >
          <MessageCircle className="size-4" />
          카카오톡 채널로 문의하기
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "gap-2 w-full",
          )}
        >
          <Mail className="size-4" />
          {CONTACT_EMAIL}
        </a>
        <p className="text-xs text-center text-muted-foreground">
          영업일 기준 1일 이내 답변드립니다.
        </p>
      </div>

      <Link href="/main" className={buttonVariants({ variant: "ghost" })}>
        목록으로 돌아가기
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
