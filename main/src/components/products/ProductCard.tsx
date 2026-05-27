import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Product } from '@/types/product.types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/main/${product.slug}`} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              미리보기 없음
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
            {product.category}
          </span>
        </div>
        <CardContent className="pt-4">
          <p className="font-medium leading-snug line-clamp-2">{product.name}</p>
          {product.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="border-t">
          <span className="text-sm font-semibold text-primary">
            {product.price.toLocaleString('ko-KR')}원
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
