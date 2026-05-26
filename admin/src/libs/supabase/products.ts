import { createClient } from '@/libs/supabase/server';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  thumbnail_url: string | null;
  demo_url: string | null;
  includes: string[] | null;
  file_path: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createProduct(payload: Omit<Product, 'id' | 'created_at'>) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').insert(payload);
  if (error) throw error;
}

export async function updateProduct(id: string, payload: Partial<Omit<Product, 'id' | 'created_at'>>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
