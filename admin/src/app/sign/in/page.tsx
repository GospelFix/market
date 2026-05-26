'use client';

import { useState } from 'react';

import { createClient } from '@/libs/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // 이메일/패스워드 로그인
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  };

  // Google OAuth 로그인
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // Kakao OAuth 로그인
  const handleKakaoSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main style={{ maxWidth: 400, margin: '100px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>로그인</h1>

      <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="패스워드"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '이메일로 로그인'}
        </button>
      </form>

      <hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={handleGoogleSignIn}>Google로 로그인</button>
        <button
          onClick={handleKakaoSignIn}
          style={{ backgroundColor: '#fee500', color: '#000' }}
        >
          Kakao로 로그인
        </button>
      </div>

      <p style={{ marginTop: 24, fontSize: 14, color: '#6b7280' }}>
        계정이 없으신가요? <a href="/sign/up">회원가입</a>
      </p>
    </main>
  );
}
