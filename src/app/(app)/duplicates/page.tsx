'use client';
import { useState, useMemo, useCallback } from 'react';
import { useCollection } from '@/lib/store/collection';
import { ALBUM_GROUPS } from '@/lib/data/stickers';
import { TeamBadge } from '@/components/TeamBadge';
import { StickerTile } from '@/components/StickerTile';
import { StickerSheet } from '@/components/StickerSheet';
import { Icons } from '@/components/Icons';
import type { Sticker } from '@/types';

export default function DuplicatesPage() {
  const collection = useCollection(s => s.collection);
  const qty = useCallback((code: string) => collection[code]?.qty ?? 0, [collection]);
  const dupeTotal = useMemo(() => {
    let n = 0;
    for (const g of ALBUM_GROUPS) for (const c of g.cards) {
      const q = collection[c.code]?.qty ?? 0;
      if (q > 1) n += q - 1;
    }
    return n;
  }, [collection]);
  const [sheetCard, setSheetCard] = useState<Sticker | null>(null);

  const dupesByTeam = ALBUM_GROUPS
    .map(g => ({ g, dupes: g.cards.filter(c => qty(c.code) > 1) }))
    .filter(x => x.dupes.length > 0);

  const copyAll = useCallback(() => {
    const txt = dupesByTeam.map(({ g, dupes }) =>
      `${g.team} (${g.abbr}): ${dupes.map(c => `${c.code}×${qty(c.code) - 1}`).join(', ')}`
    ).join('\n');
    navigator.clipboard?.writeText(txt || 'No duplicates yet');
  }, [dupesByTeam, qty]);

  return (
    <div>
      <div style={{ padding: '6px 18px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 500, color: '#878B96', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            VISIBLE TO YOUR NETWORK
          </div>
          <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.035em', color: '#EBEDF0', lineHeight: 1.05, marginTop: 4 }}>
            Duplicates
          </div>
        </div>
        <button onClick={copyAll} style={{
          appearance: 'none', border: 0, cursor: 'pointer',
          height: 36, padding: '0 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.06)', color: '#EBEDF0',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 600, fontSize: 12,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        }}>
          <Icons.share s={14} /> Share
        </button>
      </div>

      <div style={{ margin: '0 14px 14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(242,176,94,0.13), transparent 70%), #15171C',
          borderRadius: 18, padding: 16,
          boxShadow: 'inset 0 0 0 1px rgba(242,176,94,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 44, color: '#F2B05E', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {dupeTotal}
            </span>
            <span style={{ color: '#878B96', fontSize: 13, fontWeight: 500 }}>spare stickers</span>
          </div>
          <div style={{ marginTop: 6, color: '#878B96', fontSize: 12, lineHeight: 1.4 }}>
            Other collectors in your groups can see these — they&apos;ll show up as <b style={{ color: '#EBEDF0' }}>&ldquo;Marko has yours&rdquo;</b> on their album.
          </div>
        </div>
      </div>

      {dupesByTeam.length === 0 ? (
        <div style={{ padding: '0 14px' }}>
          <div style={{ padding: '20px 16px', borderRadius: 14, background: '#15171C', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)', color: '#878B96', fontSize: 13, textAlign: 'center' }}>
            No duplicates yet. Tap a collected sticker again to mark it as a duplicate.
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 14px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dupesByTeam.map(({ g, dupes }) => (
            <div key={g.team} style={{ background: '#15171C', borderRadius: 16, padding: 14, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <TeamBadge team={g.team} size={32} />
                <div style={{ flex: 1, fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 15, color: '#EBEDF0' }}>
                  {g.team}
                </div>
                <div style={{
                  background: 'rgba(242,176,94,0.16)', color: '#F2B05E',
                  fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 600,
                  padding: '4px 8px', borderRadius: 999,
                }}>+{dupes.reduce((a, c) => a + qty(c.code) - 1, 0)}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {dupes.map(c => (
                  <StickerTile key={c.code} sticker={c} onLongPress={setSheetCard} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <StickerSheet card={sheetCard} open={!!sheetCard} onClose={() => setSheetCard(null)} />
    </div>
  );
}
