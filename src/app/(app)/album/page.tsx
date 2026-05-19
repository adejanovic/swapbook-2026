'use client';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection } from '@/lib/store/collection';
import { ALBUM_GROUPS, TOTAL_STICKERS } from '@/lib/data/stickers';
import { TeamRow } from '@/components/TeamRow';
import { ProgressBar } from '@/components/ProgressBar';
import { StickerSheet } from '@/components/StickerSheet';
import { Icons } from '@/components/Icons';
import type { Sticker } from '@/types';

function AlbumContent() {
  const searchParams = useSearchParams();
  const focusTeam = searchParams.get('team');

  const collection = useCollection(s => s.collection);
  const qty = useCallback((code: string) => collection[code]?.qty ?? 0, [collection]);
  const ownedCount = useMemo(() => {
    let n = 0;
    for (const g of ALBUM_GROUPS) for (const c of g.cards) if ((collection[c.code]?.qty ?? 0) > 0) n++;
    return n;
  }, [collection]);

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all'|'missing'|'dupes'|'done'>('all');
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    focusTeam ? new Set([focusTeam]) : new Set()
  );
  const [sheetCard, setSheetCard] = useState<Sticker | null>(null);

  useEffect(() => {
    if (focusTeam) setExpanded(prev => new Set([...prev, focusTeam]));
  }, [focusTeam]);

  const pct = Math.round(ownedCount / TOTAL_STICKERS * 100);

  const filtered = ALBUM_GROUPS.filter(g => {
    if (q && !`${g.team} ${g.abbr}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'missing' && g.cards.every(c => qty(c.code) > 0)) return false;
    if (filter === 'dupes' && !g.cards.some(c => qty(c.code) > 1)) return false;
    if (filter === 'done' && !g.cards.every(c => qty(c.code) > 0)) return false;
    return true;
  });

  const toggleTeam = useCallback((team: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(team) ? n.delete(team) : n.add(team);
      return n;
    });
  }, []);

  const pills: [string, string][] = [['all','All'],['missing','Missing'],['dupes','Duplicates'],['done','Done']];

  return (
    <div>
      <div style={{ padding: '6px 18px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 500, color: '#878B96', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          ALBUM · 50 TEAMS
        </div>
        <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.035em', color: '#EBEDF0', lineHeight: 1.05, marginTop: 4 }}>
          Browse
        </div>
      </div>

      {/* Progress card */}
      <div style={{ margin: '0 14px' }}>
        <div style={{ background: '#15171C', borderRadius: 18, padding: '14px 16px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em', color: '#EBEDF0', lineHeight: 1 }}>
                {ownedCount}
              </span>
              <span style={{ color: '#878B96', fontWeight: 500, fontSize: 14 }}>of {TOTAL_STICKERS}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, fontWeight: 600, color: '#C8F265', letterSpacing: '0.02em' }}>{pct}%</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar pct={pct} color="#C8F265" h={4} />
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ padding: '14px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#15171C', borderRadius: 14, padding: '10px 14px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
          <span style={{ color: '#878B96', display: 'flex' }}><Icons.search s={18} /></span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Team or country code"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', color: '#EBEDF0', fontFamily: 'var(--font-inter, sans-serif)', fontSize: 14 }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ appearance: 'none', border: 0, background: 'transparent', color: '#878B96', cursor: 'pointer', display: 'flex' }}>
              <Icons.close s={18} />
            </button>
          )}
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6, overflowX: 'auto' }}>
          {pills.map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k as typeof filter)} style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              padding: '8px 14px', borderRadius: 999,
              background: filter === k ? '#EBEDF0' : 'transparent',
              color: filter === k ? '#0A0B0E' : '#878B96',
              boxShadow: filter === k ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.07)',
              fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 600, fontSize: 13,
              whiteSpace: 'nowrap',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Team rows */}
      <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(g => (
          <TeamRow
            key={g.team}
            group={g}
            expanded={expanded.has(g.team)}
            onToggle={() => toggleTeam(g.team)}
            onStickerLong={setSheetCard}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '20px 16px', borderRadius: 14, background: '#15171C', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)', color: '#878B96', fontSize: 13, textAlign: 'center' }}>
            No teams match.
          </div>
        )}
      </div>

      <StickerSheet card={sheetCard} open={!!sheetCard} onClose={() => setSheetCard(null)} />
    </div>
  );
}

export default function AlbumPage() {
  return (
    <Suspense fallback={null}>
      <AlbumContent />
    </Suspense>
  );
}
