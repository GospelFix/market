import { redirect } from 'next/navigation';

import { createClient } from '@/libs/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign/in');
  }

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>GospelFix Admin</h1>
      <p style={{ color: '#6b7280' }}>안녕하세요, {user.email}</p>
    </main>
  );
}
