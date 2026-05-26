import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createProduct } from '@/libs/supabase/products';
import { requireAdmin } from '@/libs/supabase/auth';

const CATEGORIES = ['landing', 'dashboard', 'ecommerce', 'portfolio', 'blog'];

export default async function NewProductPage() {
  await requireAdmin();

  async function handleCreate(formData: FormData) {
    'use server';
    await requireAdmin();
    const includesRaw = formData.get('includes') as string;
    const includes = includesRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    await createProduct({
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
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>상품 등록</h1>
      </div>

      <form action={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="상품명 *" name="name" required />
        <Field label="슬러그 *" name="slug" required placeholder="예: cafe24-landing-dark" />
        <div>
          <label style={labelStyle}>카테고리 *</label>
          <select name="category" required style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <Field label="가격 (원) *" name="price" type="number" required placeholder="0" />
        <Field label="설명" name="description" multiline />
        <Field label="썸네일 URL" name="thumbnail_url" placeholder="https://..." />
        <Field label="데모 URL" name="demo_url" placeholder="https://..." />
        <div>
          <label style={labelStyle}>포함 항목 (줄바꿈으로 구분)</label>
          <textarea
            name="includes"
            rows={4}
            style={inputStyle}
            placeholder={'HTML 파일\nCSS 파일\nFigma 소스'}
          />
        </div>
        <Field label="Storage 파일 경로" name="file_path" placeholder="templates/filename.zip" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="is_active" id="is_active" defaultChecked />
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
          등록하기
        </button>
      </form>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };

function Field({ label, name, type = 'text', required, placeholder, multiline }: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {multiline ? (
        <textarea name={name} rows={3} style={inputStyle} placeholder={placeholder} />
      ) : (
        <input type={type} name={name} required={required} style={inputStyle} placeholder={placeholder} />
      )}
    </div>
  );
}
