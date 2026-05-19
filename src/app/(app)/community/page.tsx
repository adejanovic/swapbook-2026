'use client';
import { useState, useMemo, useCallback } from 'react';
import { useCollection } from '@/lib/store/collection';
import { ALBUM_GROUPS } from '@/lib/data/stickers';
import { StickerTile } from '@/components/StickerTile';
import { ProgressBar } from '@/components/ProgressBar';
import { StickerSheet } from '@/components/StickerSheet';
import { Icons } from '@/components/Icons';
import type { Sticker, CommunityMember } from '@/types';

const COMMUNITY: CommunityMember[] = [
  { id: 'mara',  name: 'Marko · @marko_kn',    pct: 78, dupes: 142, location: 'Belgrade', color: '#C8F265' },
  { id: 'lea',   name: 'Lea · @lea.collects',  pct: 64, dupes: 96,  location: 'Berlin',   color: '#F2B05E' },
  { id: 'tomi',  name: 'Tomislav · @tomi06',   pct: 91, dupes: 213, location: 'Zagreb',   color: '#8FB8FF' },
  { id: 'noa',   name: 'Noa · @noa.album',     pct: 52, dupes: 71,  location: 'Tel Aviv', color: '#E58CFF' },
  { id: 'alex',  name: 'Alex · @alex_panel',   pct: 33, dupes: 28,  location: 'London',   color: '#7FE8C2' },
  { id: 'sam',   name: 'Sam · @sammy.cards',   pct: 86, dupes: 174, location: 'New York', color: '#FF9C7A' },
];

export default function CommunityPage() {
  const collection = useCollection(s => s.collection);
  const qty = useCallback((code: string) => collection[code]?.qty ?? 0, [collection]);
  const [tab, setTab] = useState<'they-have'|'you-have'>('they-have');
  const [sheetCard, setSheetCard] = useState<Sticker | null>(null);

  const allCards = useMemo(() => ALBUM_GROUPS.flatMap(g => g.cards), []);

  const memberDupes = useMemo(() => {
    const map: Record<string, string[]> = {};
    COMMUNITY.forEach((m, mi) => {
      const dup: string[] = [];
      allCards.forEach((c, i) => { if ((i * 7 + mi * 13) % 9 === 0) dup.push(c.code); });
      map[m.id] = dup;
    });
    return map;
  }, [allCards]);

  const myMissing = useMemo(() => new Set(allCards.filter(c => qty(c.code) === 0).map(c => c.code)), [allCards, qty]);
  const myDupes = useMemo(() => new Set(allCards.filter(c => qty(c.code) > 1).map(c => c.code)), [allCards, qty]);

  const matched = (m: CommunityMember) =>
    (memberDupes[m.id] || []).filter(code => myMissing.has(code));

  const theyNeed = (m: CommunityMember) => {
    const theirMissing = new Set<string>();
    allCards.forEach((c, i) => { if ((i * 11 + m.id.charCodeAt(0)) % 5 < 2) theirMissing.add(c.code); });
    return [...myDupes].filter(code => theirMissing.has(code));
  };

  return (
    <div>
      <div style={{ padding: '6px 18px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 500, color: '#878B96', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            3 GROUPS · 12 COLLECTORS
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
      <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[
          { name: 'Office squad', count: 6, color: '#C8F265', active: true },
          { name: 'Family',       count: 4, color: '#F2B05E', active: false },
          { name: 'School',       count: 2, color: '#8FB8FF', active: false },
          { name: '+ New',        count: null, color: '#878B96', active: false, muted: true },
        ].map(chip => (
          <div key={chip.name} style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: 12,
            background: chip.active ? '#23262F' : '#15171C',
            boxShadow: `inset 0 0 0 1px ${chip.active ? chip.color : 'rgba(255,255,255,0.07)'}`,
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}>
            {!chip.muted && <div style={{ width: 6, height: 6, borderRadius: 6, background: chip.color }} />}
            <div style={{ fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 600, fontSize: 13, color: chip.muted ? '#878B96' : '#EBEDF0' }}>{chip.name}</div>
            {chip.count != null && <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: '#878B96' }}>{chip.count}</div>}
          </div>
        ))}
      </div>

      {/* Tab toggle */}
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ background: '#15171C', borderRadius: 14, padding: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {(['they-have','you-have'] as const).map((k, i) => (
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
      <div style={{ padding: '0 14px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {COMMUNITY.map(m => {
          const ms = tab === 'they-have' ? matched(m) : theyNeed(m);
          const sample = ms.slice(0, 4).map(code => allCards.find(c => c.code === code)).filter((x): x is Sticker => Boolean(x));
          return (
            <div key={m.id} style={{ background: '#15171C', borderRadius: 18, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 40, background: m.color, color: '#0B0B0E', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 17 }}>
                  {m.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 15, color: '#EBEDF0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.name}
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
        })}
      </div>

      <StickerSheet card={sheetCard} open={!!sheetCard} onClose={() => setSheetCard(null)} />
    </div>
  );
}
