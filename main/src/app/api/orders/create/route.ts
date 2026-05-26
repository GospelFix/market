import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { productId, amount } = await request.json();

    if (!productId || !amount) {
      return NextResponse.json(
        { error: "필수 파라미터 누락" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

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

    // 상품 가격 서버에서 재검증 (클라이언트 위변조 방지)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price, is_active")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (product.price !== amount) {
      return NextResponse.json(
        { error: "결제 금액이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    // 동일 상품 중복 구매 방지
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("status", "paid")
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json(
        { error: "이미 구매한 상품입니다." },
        { status: 409 },
      );
    }

    // 고유 주문 ID 생성 (Toss 요구사항: 영문/숫자/특수문자 6~64자)
    const orderId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("orders").insert({
      user_id: user.id,
      product_id: productId,
      order_id: orderId,
      amount,
      status: "pending",
    });

    if (insertError) {
      return NextResponse.json(
        { error: "주문 생성에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ orderId });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
