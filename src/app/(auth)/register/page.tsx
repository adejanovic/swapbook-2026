'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle]           = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  // Sanitise handle as the user types
  const onHandleChange = (v: string) => {
    setHandle(v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (handle.length < 3) { setError('Handle must be at least 3 characters.'); return; }

    setLoading(true);
    const { error } = await supabase().auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, handle },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) { setError(error.message); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <div style={{
          fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 28,
          letterSpacing: '-0.03em', color: '#EBEDF0', marginBottom: 12,
        }}>Check your inbox</div>
        <div style={{
          fontFamily: 'var(--font-inter, sans-serif)', fontSize: 14, color: '#878B96', lineHeight: 1.5,
          marginBottom: 28,
        }}>
          We sent a confirmation link to <b style={{ color: '#EBEDF0' }}>{email}</b>.<br/>
          Click it to activate your account and start filling your album.
        </div>
        <Link href="/login" style={{
          height: 52, borderRadius: 16, background: '#C8F265', color: '#0A1500',
          fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 700, fontSize: 15,
          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>Back to sign in</Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#C8F265',
          letterSpacing: '0.18em', fontWeight: 500, marginBottom: 8,
        }}>SWAPBOOK · 2026</div>
        <div style={{
          fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 32,
          letterSpacing: '-0.04em', color: '#EBEDF0', lineHeight: 1,
        }}>Create your album.</div>
        <div style={{ marginTop: 8, color: '#878B96', fontSize: 13, fontFamily: 'var(--font-inter, sans-serif)' }}>
          Free. Syncs across devices. Share with friends.
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#15171C', borderRadius: 20,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        padding: '28px 24px',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {error && (
            <div style={{
              background: 'rgba(255,107,107,0.10)', borderRadius: 12,
              boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.25)',
              padding: '12px 14px', color: '#FF6B6B',
              fontFamily: 'var(--font-inter, sans-serif)', fontSize: 13, lineHeight: 1.4,
            }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Your name">
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Alex"
                required
                autoComplete="given-name"
                style={inputStyle}
              />
            </Field>

            <Field label="@handle">
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  color: '#5A5E69', fontFamily: 'var(--font-mono, monospace)', fontSize: 14,
                  pointerEvents: 'none',
                }}>@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={e => onHandleChange(e.target.value)}
                  placeholder="alexkn"
                  required
                  autoComplete="username"
                  style={{ ...inputStyle, paddingLeft: 26 }}
                />
              </div>
            </Field>
          </div>

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
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
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

          <Field label="Confirm password">
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
              style={{
                ...inputStyle,
                boxShadow: confirmPw && confirmPw !== password
                  ? 'inset 0 0 0 1px rgba(255,107,107,0.5)'
                  : confirmPw && confirmPw === password
                    ? 'inset 0 0 0 1px rgba(200,242,101,0.4)'
                    : inputStyle.boxShadow,
              }}
            />
          </Field>

          {/* Password strength hint */}
          {password.length > 0 && (
            <PasswordStrength password={password} />
          )}

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
          >{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-inter, sans-serif)', fontSize: 13, color: '#878B96' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#C8F265', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
        <Link href="/dashboard" style={{
          fontFamily: 'var(--font-inter, sans-serif)', fontSize: 12, color: '#5A5E69', textDecoration: 'none',
        }}>
          Continue as guest →
        </Link>
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

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password) || /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password) || password.length >= 12,
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['#FF6B6B', '#F2B05E', '#C8F265'];
  const labels = ['Weak', 'Fair', 'Strong'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i < score ? colors[score - 1] : 'rgba(255,255,255,0.08)',
            transition: 'background .2s',
          }} />
        ))}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 600,
        color: score > 0 ? colors[score - 1] : '#5A5E69',
        letterSpacing: '0.06em', minWidth: 44, textAlign: 'right',
      }}>{score > 0 ? labels[score - 1] : ''}</div>
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
