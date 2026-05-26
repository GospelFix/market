'use client';

import { useState } from 'react';

import { createClient } from '@/libs/supabase/client';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('가입 확인 이메일을 발송했습니다. 이메일을 확인해 주세요.');
    }

    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 400, margin: '100px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>회원가입</h1>

      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="패스워드 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        {message && <p style={{ color: 'green', fontSize: 14 }}>{message}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '회원가입'}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 14, color: '#6b7280' }}>
        이미 계정이 있으신가요? <a href="/sign/in">로그인</a>
      </p>
    </main>
  );
}
