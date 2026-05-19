'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/dashboard');
  };

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#C8F265',
          letterSpacing: '0.18em', fontWeight: 500, marginBottom: 8,
        }}>SWAPBOOK · 2026</div>
        <div style={{
          fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 32,
          letterSpacing: '-0.04em', color: '#EBEDF0', lineHeight: 1,
        }}>Welcome back.</div>
        <div style={{ marginTop: 8, color: '#878B96', fontSize: 13, fontFamily: 'var(--font-inter, sans-serif)' }}>
          Sign in to sync your collection.
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#15171C', borderRadius: 20,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        padding: '28px 24px',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {error && (
            <div style={{
              background: 'rgba(255,107,107,0.10)', borderRadius: 12,
              boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.25)',
              padding: '12px 14px', color: '#FF6B6B',
              fontFamily: 'var(--font-inter, sans-serif)', fontSize: 13, lineHeight: 1.4,
            }}>{error}</div>
          )}

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </Field>

          <Field label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={eyeBtn}
                tabIndex={-1}
              >{showPw ? '🙈' : '👁️'}</button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              appearance: 'none', border: 0, cursor: loading ? 'not-allowed' : 'pointer',
              height: 52, borderRadius: 16,
              background: loading ? 'rgba(200,242,101,0.5)' : '#C8F265',
              color: '#0A1500',
              fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 700, fontSize: 15,
              transition: 'background .15s',
            }}
          >{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>

      {/* Footer links */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-inter, sans-serif)', fontSize: 13, color: '#878B96' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#C8F265', textDecoration: 'none', fontWeight: 600 }}>
            Create yours
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 600,
        color: '#878B96', textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  appearance: 'none', outline: 'none', border: 0, width: '100%',
  background: '#1C1F26', borderRadius: 12, padding: '13px 15px',
  color: '#EBEDF0', fontFamily: 'var(--font-inter, sans-serif)', fontSize: 15,
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
  transition: 'box-shadow .15s',
};

const eyeBtn: React.CSSProperties = {
  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
  appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
  fontSize: 16, lineHeight: 1, padding: 2,
};
