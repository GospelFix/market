import { createClient } from '@/lib/supabase/server'
import { Product } from '@/types/product.types'

export async function getProducts(category?: string): Promise<Product[]> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('[getProductBySlug] error:', error.message, error.code)
    return null
  }
  return data
}
