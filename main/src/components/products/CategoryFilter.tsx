'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/types/product.types'

interface CategoryFilterProps {
  currentCategory: string
}

export function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    router.push(`/templates?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PRODUCT_CATEGORIES.map((cat) => {
        const isActive =
          cat.value === 'all'
            ? currentCategory === 'all'
            : currentCategory === cat.value

        return (
          <button
            key={cat.value}
            onClick={() => handleSelect(cat.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            )}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
