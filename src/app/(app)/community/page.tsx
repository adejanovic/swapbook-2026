'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useCollection } from '@/lib/store/collection';
import { ALBUM_GROUPS, TOTAL_STICKERS } from '@/lib/data/stickers';
import { StickerTile } from '@/components/StickerTile';
import { ProgressBar } from '@/components/ProgressBar';
import { StickerSheet } from '@/components/StickerSheet';
import { Icons } from '@/components/Icons';
import { supabase } from '@/lib/supabase/client';
import type { Sticker } from '@/types';

const MEMBER_COLORS = ['#C8F265', '#F2B05E', '#8FB8FF', '#E58CFF', '#7FE8C2', '#FF9C7A'];

interface RealMember {
  userId: string;
  name: string;
  handle: string;
  pct: number;
  dupes: number;
  color: string;
  collection: Record<string, number>;
}

interface RealGroup {
  id: string;
  name: string;
}

export default function CommunityPage() {
  const collection = useCollection(s => s.collection);
  const qty = useCallback((code: string) => collection[code]?.qty ?? 0, [collection]);
  const [tab, setTab] = useState<'they-have' | 'you-have'>('they-have');
  const [sheetCard, setSheetCard] = useState<Sticker | null>(null);

  const [members, setMembers] = useState<RealMember[]>([]);
  const [groups, setGroups] = useState<RealGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const db = supabase();
      const { data: { user } } = await db.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: myMemberships } = await db
        .from('group_members')
        .select('group_id, groups(id, name)')
        .eq('user_id', user.id);

      if (!myMemberships || myMemberships.length === 0) {
        setLoading(false);
        return;
      }

      const realGroups: RealGroup[] = myMemberships
        .map((m: { group_id: string; groups: unknown }) => {
          const g = m.groups as { id: string; name: string } | null;
          return g ? { id: g.id, name: g.name } : null;
        })
        .filter((g): g is RealGroup => g !== null);

      setGroups(realGroups);
      const firstGroupId = realGroups[0]?.id ?? null;
      setActiveGroupId(firstGroupId);

      const groupIds = realGroups.map(g => g.id);

      const { data: allMemberships } = await db
        .from('group_members')
        .select('user_id, profiles(display_name, handle)')
        .in('group_id', groupIds)
        .neq('user_id', user.id);

      if (!allMemberships || allMemberships.length === 0) {
        setLoading(false);
        return;
      }

      const seen = new Set<string>();
      const uniqueMembers: Array<{ userId: string; name: string; handle: string }> = [];
      allMemberships.forEach((m: { user_id: string; profiles: unknown }) => {
        if (seen.has(m.user_id)) return;
        seen.add(m.user_id);
        const p = m.profiles as { display_name?: string; handle?: string } | null;
        uniqueMembers.push({
          userId: m.user_id,
          name: p?.display_name || p?.handle || 'Unknown',
          handle: p?.handle || 'unknown',
        });
      });

      const memberIds = uniqueMembers.map(m => m.userId);
      const { data: memberCollectionRows } = await db
        .from('collections')
        .select('user_id, sticker_code, qty')
        .in('user_id', memberIds);

      const collMap: Record<string, Record<string, number>> = {};
      memberIds.forEach(id => { collMap[id] = {}; });
      (memberCollectionRows || []).forEach((row: { user_id: string; sticker_code: string; qty: number }) => {
        if (collMap[row.user_id]) collMap[row.user_id][row.sticker_code] = row.qty;
      });

      const built: RealMember[] = uniqueMembers.map((m, i) => {
        const coll = collMap[m.userId] ?? {};
        let owned = 0, dupes = 0;
        for (const g of ALBUM_GROUPS) {
          for (const c of g.cards) {
            const q = coll[c.code] ?? 0;
            if (q > 0) owned++;
            if (q > 1) dupes += q - 1;
          }
        }
        return {
          userId: m.userId,
          name: m.name,
          handle: m.handle,
          pct: Math.round((owned / TOTAL_STICKERS) * 100),
          dupes,
          color: MEMBER_COLORS[i % MEMBER_COLORS.length],
          collection: coll,
        };
      });

      setMembers(built);
      setLoading(false);
    };

    load();
  }, []);

  const allCards = useMemo(() => ALBUM_GROUPS.flatMap(g => g.cards), []);
  const myMissing = useMemo(() => new Set(allCards.filter(c => qty(c.code) === 0).map(c => c.code)), [allCards, qty]);
  const myDupes = useMemo(() => new Set(allCards.filter(c => qty(c.code) > 1).map(c => c.code)), [allCards, qty]);

  const matched = (m: RealMember) =>
    allCards.filter(c => (m.collection[c.code] ?? 0) > 1 && myMissing.has(c.code)).map(c => c.code);

  const theyNeed = (m: RealMember) =>
    allCards.filter(c => (m.collection[c.code] ?? 0) === 0 && myDupes.has(c.code)).map(c => c.code);

  const displayedMembers = activeGroupId
    ? members
    : members;

  return (
    <div>
      <div style={{ padding: '6px 18px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 500, color: '#878B96', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {groups.length} {groups.length === 1 ? 'GROUP' : 'GROUPS'} · {members.length} COLLECTORS
          </div>
          <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.035em', color: '#EBEDF0', lineHeight: 1.05, marginTop: 4 }}>
            Community
          </div>
        </div>
        <button style={{ appearance: 'none', border: 0, cursor: 'pointer', width: 36, height: 36, borderRadius: 36, background: 'rgba(255,255,255,0.06)', color: '#EBEDF0', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
          <Icons.plus s={16} />
        </button>
      </div>

      {/* Group chips */}
      {groups.length > 0 && (
        <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' as never, touchAction: 'pan-x' }}>
          {groups.map((g, i) => {
            const active = activeGroupId === g.id;
            const color = MEMBER_COLORS[i % MEMBER_COLORS.length];
            return (
              <div key={g.id} onClick={() => setActiveGroupId(g.id)} style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 12,
                background: active ? '#23262F' : '#15171C',
                boxShadow: `inset 0 0 0 1px ${active ? color : 'rgba(255,255,255,0.07)'}`,
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: 6, background: color }} />
                <div style={{ fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 600, fontSize: 13, color: '#EBEDF0' }}>{g.name}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab toggle */}
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ background: '#15171C', borderRadius: 14, padding: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {(['they-have', 'you-have'] as const).map((k, i) => (
            <button key={k} onClick={() => setTab(k)} style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              height: 34, borderRadius: 10,
              background: tab === k ? '#23262F' : 'transparent',
              color: tab === k ? '#EBEDF0' : '#878B96',
              fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 600, fontSize: 12.5,
            }}>{i === 0 ? 'They have yours' : 'You have theirs'}</button>
          ))}
        </div>
      </div>

      {/* Member list */}
      <div style={{ padding: '0 14px 24px', display: 'flex', flexDirection: 'column', gap: 10, touchAction: 'pan-y' }}>
        {loading ? (
          <div style={{ padding: '20px 16px', borderRadius: 14, background: '#15171C', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)', color: '#878B96', fontSize: 13, textAlign: 'center' }}>
            Loading collectors…
          </div>
        ) : displayedMembers.length === 0 ? (
          <div style={{ padding: '20px 16px', borderRadius: 14, background: '#15171C', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)', color: '#878B96', fontSize: 13, lineHeight: 1.5, textAlign: 'center' }}>
            No collectors in this group yet. Invite friends using the + button.
          </div>
        ) : (
          displayedMembers.map(m => {
            const ms = tab === 'they-have' ? matched(m) : theyNeed(m);
            const sample = ms.slice(0, 4).map(code => allCards.find(c => c.code === code)).filter((x): x is Sticker => Boolean(x));
            return (
              <div key={m.userId} style={{ background: '#15171C', borderRadius: 18, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 40, background: m.color, color: '#0B0B0E', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 17 }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 15, color: '#EBEDF0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.name} · @{m.handle}
                    </div>
                    <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, maxWidth: 100 }}>
                        <ProgressBar pct={m.pct} color={m.color} h={3} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#878B96' }}>{m.pct}%</div>
                      <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#F2B05E' }}>+{m.dupes}</div>
                    </div>
                  </div>
                  <div style={{
                    background: ms.length ? (tab === 'they-have' ? 'rgba(200,242,101,0.14)' : 'rgba(242,176,94,0.16)') : '#1C1F26',
                    color: ms.length ? (tab === 'they-have' ? '#C8F265' : '#F2B05E') : '#878B96',
                    fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 17,
                    padding: '6px 12px', borderRadius: 12,
                  }}>{ms.length}</div>
                </div>
                {sample.length > 0 ? (
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {sample.map(c => (
                      <div key={c.code} onClick={() => setSheetCard(c)} style={{ cursor: 'pointer' }}>
                        <StickerTile sticker={c} overrideQty={tab === 'they-have' ? 0 : qty(c.code)} disableTap />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#878B96', lineHeight: 1.4 }}>
                    {tab === 'they-have' ? 'No matches with your missing list yet.' : 'You have nothing they need right now.'}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <StickerSheet card={sheetCard} open={!!sheetCard} onClose={() => setSheetCard(null)} />
    </div>
  );
}
