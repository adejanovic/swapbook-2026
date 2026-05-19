'use client';
import { useRouter } from 'next/navigation';
import { ALBUM_GROUPS } from '@/lib/data/stickers';
import { TeamBadge } from '@/components/TeamBadge';

export default function WelcomePage() {
  const router = useRouter();
  const groups = ALBUM_GROUPS.slice(0, 12);

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(80% 60% at 50% 0%, rgba(200,242,101,0.15), transparent 70%), #0A0B0E',
      paddingTop: 56,
    }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '20px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          transform: 'rotate(-8deg) scale(1.15) translateY(20px)',
          padding: '0 30px',
        }}>
          {groups.map(g => (
            <TeamBadge key={g.team} team={g.team} size={56} soft />
          ))}
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 30%, #0A0B0E 95%)',
        }} />
      </div>

      <div style={{ padding: '0 24px 40px' }}>
        <div style={{
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', fontSize: 11, color: '#C8F265',
          letterSpacing: '0.18em', fontWeight: 500,
        }}>SWAPBOOK · 2026</div>
        <div style={{
          fontFamily: 'var(--font-bricolage, Bricolage Grotesque, sans-serif)', fontWeight: 800, fontSize: 40,
          letterSpacing: '-0.04em', color: '#EBEDF0', lineHeight: 0.96, marginTop: 10,
        }}>Your album,<br/>without the spreadsheet.</div>
        <div style={{
          marginTop: 14, color: '#878B96', fontSize: 14, lineHeight: 1.45,
          fontFamily: 'var(--font-inter, Inter, sans-serif)', maxWidth: 320,
        }}>
          Track 980 stickers across 50 teams. Mark duplicates with one extra tap, then let your friends see what you have spare.
        </div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => router.push('/register')}
            style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              height: 52, borderRadius: 16, background: '#C8F265', color: '#0A1500',
              fontFamily: 'var(--font-inter, Inter, sans-serif)', fontWeight: 700, fontSize: 15,
            }}
          >Create your album</button>
          <button
            onClick={() => router.push('/login')}
            style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              height: 52, borderRadius: 16, background: 'transparent', color: '#EBEDF0',
              fontFamily: 'var(--font-inter, Inter, sans-serif)', fontWeight: 600, fontSize: 14,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
            }}
          >Sign in</button>
        </div>
      </div>
    </div>
  );
}
