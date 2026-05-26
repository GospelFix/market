import Link from 'next/link';
import { getProducts, deleteProduct } from '@/libs/supabase/products';
import { requireAdmin } from '@/libs/supabase/auth';
import { revalidatePath } from 'next/cache';

export default async function HomePage() {
  const user = await requireAdmin();

  const products = await getProducts();

  async function handleDelete(formData: FormData) {
    'use server';
    await requireAdmin();
    const id = formData.get('id') as string;
    if (!id) return;
    await deleteProduct(id);
    revalidatePath('/');
  }

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>상품 관리</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>{user.email}</p>
        </div>
        <Link
          href="/products/new"
          style={{
            background: '#111827',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + 상품 등록
        </Link>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: '#374151', fontWeight: 600 }}>상품명</th>
              <th style={{ padding: '10px 12px', color: '#374151', fontWeight: 600 }}>카테고리</th>
              <th style={{ padding: '10px 12px', color: '#374151', fontWeight: 600 }}>가격</th>
              <th style={{ padding: '10px 12px', color: '#374151', fontWeight: 600 }}>활성</th>
              <th style={{ padding: '10px 12px', color: '#374151', fontWeight: 600 }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', fontWeight: 500 }}>
                  <div>{product.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>{product.slug}</div>
                </td>
                <td style={{ padding: '12px', color: '#6b7280' }}>{product.category}</td>
                <td style={{ padding: '12px', fontWeight: 600 }}>
                  {product.price.toLocaleString('ko-KR')}원
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    background: product.is_active ? '#d1fae5' : '#fee2e2',
                    color: product.is_active ? '#065f46' : '#991b1b',
                  }}>
                    {product.is_active ? '활성' : '비활성'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      href={`/products/${product.id}/edit`}
                      style={{ color: '#2563eb', fontSize: 13, textDecoration: 'none' }}
                    >
                      편집
                    </Link>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        style={{ color: '#dc2626', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => {}}
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  등록된 상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
