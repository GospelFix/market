import { Suspense } from 'react'
import { Metadata } from 'next'
import { getProducts } from '@/lib/supabase/products'
import { ProductCard } from '@/components/products/ProductCard'
import { CategoryFilter } from '@/components/products/CategoryFilter'

export const metadata: Metadata = {
  title: '템플릿 갤러리 | 마켓',
  description: '고품질 웹 템플릿을 구매하세요. 랜딩페이지, 대시보드, 이커머스 등 다양한 템플릿을 제공합니다.',
}

interface TemplatesPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const { category } = await searchParams
  const currentCategory = category ?? 'all'
  const products = await getProducts(currentCategory)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">템플릿 갤러리</h1>
          <p className="mt-2 text-muted-foreground">
            바로 사용 가능한 고품질 웹 템플릿
          </p>
        </div>

        <div className="mb-8">
          <Suspense>
            <CategoryFilter currentCategory={currentCategory} />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            해당 카테고리의 템플릿이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
