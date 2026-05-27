import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { confirmTossPayment } from "@/lib/toss/payments";

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "필수 파라미터 누락" },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "유효하지 않은 결제 금액입니다." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 인증된 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // DB에서 주문 정보 조회 (status 필터 없이)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (order.amount !== amount) {
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다." },
        { status: 400 },
      );
    }

    // 이미 결제 완료된 주문
    if (order.status === "paid") {
      return NextResponse.json({ success: true });
    }

    // Toss 승인 요청 중 — 잠시 후 재시도 유도
    if (order.status === "confirming") {
      return NextResponse.json(
        { error: "결제가 처리 중입니다. 잠시 후 다시 시도해주세요." },
        { status: 202 },
      );
    }

    // 중복 호출 방어: pending → confirming 으로 원자적 상태 변경
    const { data: locked } = await supabase
      .from("orders")
      .update({ status: "confirming" })
      .eq("order_id", orderId)
      .eq("status", "pending")
      .select("order_id");

    if (!locked || locked.length === 0) {
      return NextResponse.json(
        { error: "이미 처리 중이거나 완료된 주문입니다." },
        { status: 409 },
      );
    }

    // Toss 서버 결제 승인 — 실패 시 pending으로 복구
    try {
      await confirmTossPayment({ paymentKey, orderId, amount });
    } catch (tossError) {
      await supabase
        .from("orders")
        .update({ status: "pending" })
        .eq("order_id", orderId)
        .eq("status", "confirming");
      throw tossError;
    }

    // Toss 승인 성공 즉시 paid로 업데이트 (추가 작업과 분리)
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_key: paymentKey,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .eq("status", "confirming");

    if (updateError) {
      console.error("[payments/confirm] CRITICAL: Toss 승인 후 DB 업데이트 실패", {
        orderId,
        paymentKey: paymentKey.slice(0, 8) + "****",
        error: updateError,
      });
      return NextResponse.json(
        { error: "결제는 완료되었으나 내부 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[payments/confirm] 결제 처리 오류:", error);
    return NextResponse.json(
      { error: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
