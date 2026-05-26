export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  price: number
  thumbnail_url: string | null
  demo_url: string | null
  includes: string[] | null
  file_path: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductCategory = {
  value: string
  label: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { value: 'all', label: '전체' },
  { value: 'landing', label: '랜딩페이지' },
  { value: 'dashboard', label: '대시보드' },
  { value: 'ecommerce', label: '이커머스' },
  { value: 'portfolio', label: '포트폴리오' },
  { value: 'blog', label: '블로그' },
]
