import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { getProductById, updateProduct } from '@/libs/supabase/products';
import { requireAdmin } from '@/libs/supabase/auth';

const CATEGORIES = ['landing', 'dashboard', 'ecommerce', 'portfolio', 'blog'];

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  await requireAdmin();

  const product = await getProductById(id);
  if (!product) notFound();

  async function handleUpdate(formData: FormData) {
    'use server';
    await requireAdmin();
    const includesRaw = formData.get('includes') as string;
    const includes = includesRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    await updateProduct(id, {
      slug: formData.get('slug') as string,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      thumbnail_url: (formData.get('thumbnail_url') as string) || null,
      demo_url: (formData.get('demo_url') as string) || null,
      includes: includes.length > 0 ? includes : null,
      file_path: (formData.get('file_path') as string) || null,
      is_active: formData.get('is_active') === 'on',
    });

    revalidatePath('/');
    redirect('/');
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← 목록
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>상품 편집</h1>
      </div>

      <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="상품명 *" name="name" required defaultValue={product.name} />
        <Field label="슬러그 *" name="slug" required defaultValue={product.slug} />
        <div>
          <label style={labelStyle}>카테고리 *</label>
          <select name="category" required style={inputStyle} defaultValue={product.category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <Field label="가격 (원) *" name="price" type="number" required defaultValue={String(product.price)} />
        <Field label="설명" name="description" multiline defaultValue={product.description ?? ''} />
        <Field label="썸네일 URL" name="thumbnail_url" defaultValue={product.thumbnail_url ?? ''} />
        <Field label="데모 URL" name="demo_url" defaultValue={product.demo_url ?? ''} />
        <div>
          <label style={labelStyle}>포함 항목 (줄바꿈으로 구분)</label>
          <textarea
            name="includes"
            rows={4}
            style={inputStyle}
            defaultValue={(product.includes ?? []).join('\n')}
          />
        </div>
        <Field label="Storage 파일 경로" name="file_path" defaultValue={product.file_path ?? ''} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="is_active" id="is_active" defaultChecked={product.is_active} />
          <label htmlFor="is_active" style={{ fontSize: 14 }}>활성화</label>
        </div>

        <button
          type="submit"
          style={{
            background: '#111827', color: '#fff', padding: '10px 0',
            borderRadius: 8, fontWeight: 600, fontSize: 15, border: 'none',
            cursor: 'pointer', marginTop: 8,
          }}
        >
          저장하기
        </button>
      </form>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };

function Field({ label, name, type = 'text', required, defaultValue, multiline }: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea name={name} rows={3} style={inputStyle} defaultValue={defaultValue} />
      ) : (
        <input type={type} name={name} required={required} style={inputStyle} defaultValue={defaultValue} />
      )}
    </div>
  );
}
