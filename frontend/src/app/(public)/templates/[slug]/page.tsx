import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/lib/supabase/products";
import { BuyButton } from "@/components/products/BuyButton";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} | 템플릿 마켓`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.thumbnail_url ? [product.thumbnail_url] : [],
      type: "website",
    },
  };
}

export default async function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* 데모 iframe */}
          <div className="overflow-hidden rounded-xl border bg-muted">
            {product.demo_url ? (
              <iframe
                src={product.demo_url}
                title={`${product.name} 데모`}
                className="h-[600px] w-full"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <div className="flex h-[600px] items-center justify-center text-muted-foreground">
                데모를 준비 중입니다
              </div>
            )}
          </div>

          {/* 사이드바: 상품 정보 */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {product.category}
              </span>
              <h1 className="mt-3 text-2xl font-bold leading-snug">
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
              )}
            </div>

            <div className="text-3xl font-bold text-primary">
              {product.price.toLocaleString("ko-KR")}원
            </div>

            {/* 포함 항목 */}
            {product.includes && product.includes.length > 0 && (
              <div className="rounded-xl border p-4">
                <p className="mb-3 text-sm font-semibold">포함 항목</p>
                <ul className="flex flex-col gap-2">
                  {product.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="size-4 shrink-0 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <BuyButton
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              price={product.price}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
