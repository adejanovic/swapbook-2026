'use client';
import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/lib/store/collection';
import { supabase } from '@/lib/supabase/client';
import { ALBUM_GROUPS, TOTAL_STICKERS } from '@/lib/data/stickers';
import { Icons } from '@/components/Icons';

interface UserMeta { display_name: string; handle: string; email: string; initial: string; }

export default function ProfilePage() {
  const router = useRouter();
  const collection = useCollection(s => s.collection);
  const reset = useCollection(s => s.reset);
  const [user, setUser] = useState<UserMeta | null>(null);

  useEffect(() => {
    supabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name  = user.user_metadata?.display_name || user.email || 'Guest';
      const handle = user.user_metadata?.handle || user.email?.split('@')[0] || 'user';
      setUser({
        display_name: name,
        handle,
        email: user.email || '',
        initial: name.charAt(0).toUpperCase(),
      });
    });
  }, []);

  const ownedCount = useMemo(() => {
    let n = 0;
    for (const g of ALBUM_GROUPS) for (const c of g.cards) if ((collection[c.code]?.qty ?? 0) > 0) n++;
    return n;
  }, [collection]);

  const dupeTotal = useMemo(() => {
    let n = 0;
    for (const g of ALBUM_GROUPS) for (const c of g.cards) {
      const q = collection[c.code]?.qty ?? 0;
      if (q > 1) n += q - 1;
    }
    return n;
  }, [collection]);

  const pct = Math.round(ownedCount / TOTAL_STICKERS * 100);

  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) reset();
  };

  const handleSignOut = async () => {
    await supabase().auth.signOut();
    router.push('/welcome');
  };

  const initial = user?.initial ?? '?';
  const displayName = user?.display_name ?? 'Guest';
  const handle = user?.handle ?? 'guest';

  return (
    <div>
      <div style={{ padding: '6px 18px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 500, color: '#878B96', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          @{handle}
        </div>
        <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.035em', color: '#EBEDF0', lineHeight: 1.05, marginTop: 4 }}>
          Profile
        </div>
      </div>

      <div style={{ margin: '0 14px' }}>
        <div style={{
          background: 'radial-gradient(80% 100% at 0% 0%, rgba(200,242,101,0.18), transparent 60%), linear-gradient(180deg, #1C1F26, #15171C)',
          borderRadius: 24, padding: 20,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 64,
              background: 'linear-gradient(135deg, #C8F265, #6FB341)',
              color: '#0A1500', display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 28,
            }}>{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 20, color: '#EBEDF0', letterSpacing: '-0.03em' }}>
                {displayName}
              </div>
              <div style={{ fontSize: 12, color: '#878B96', marginTop: 2 }}>
                {user ? `@${handle}` : 'Guest — progress saved locally'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <ProfileStat value={`${pct}%`} label="Complete" />
            <ProfileStat value={ownedCount} label="Collected" />
            <ProfileStat value={dupeTotal} label="Duplicates" />
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 14px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!user && (
          <SettingsRow
            icon={<Icons.user s={18} />}
            label="Create an account"
            hint="Sync across devices"
            onClick={() => router.push('/register')}
          />
        )}
        <SettingsRow icon={<Icons.share s={18} />} label="Share my profile" hint={`swap.bk/${handle}`} />
        <SettingsRow icon={<Icons.copy s={18} />} label="Export collection" hint="CSV" />
        <SettingsRow icon={<Icons.people s={18} />} label="Manage groups" hint="Groups" />
        <SettingsRow icon={<Icons.scan s={18} />} label="Scan a pack" hint="Beta" />
        <SettingsRow icon={<Icons.trash s={18} />} label="Reset album" danger onClick={handleReset} />
        {user && (
          <SettingsRow icon={<Icons.close s={18} />} label="Sign out" danger onClick={handleSignOut} />
        )}
      </div>
    </div>
  );
}

function ProfileStat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em', color: '#EBEDF0', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#878B96', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function SettingsRow({ icon, label, hint, danger, onClick }: {
  icon: React.ReactNode; label: string; hint?: string; danger?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', border: 0, cursor: 'pointer',
      background: '#15171C', borderRadius: 14, padding: '14px 16px',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: danger ? 'rgba(255,107,107,0.12)' : '#23262F',
        color: danger ? '#FF6B6B' : '#EBEDF0',
        display: 'grid', placeItems: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 600, fontSize: 14, color: danger ? '#FF6B6B' : '#EBEDF0' }}>
          {label}
        </div>
      </div>
      {hint && <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#878B96' }}>{hint}</div>}
      <div style={{ color: '#5A5E69' }}><Icons.chev s={14} /></div>
    </button>
  );
}
