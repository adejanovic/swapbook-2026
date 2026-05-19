'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCollection } from '@/lib/store/collection';
import { ALBUM_GROUPS, TOTAL_STICKERS } from '@/lib/data/stickers';
import { teamColor } from '@/lib/data/teams';
import { TeamBadge } from '@/components/TeamBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { SegmentedRing } from '@/components/SegmentedRing';
import { StickerTile } from '@/components/StickerTile';
import { StickerSheet } from '@/components/StickerSheet';
import { Icons } from '@/components/Icons';
import type { Sticker } from '@/types';

export default function DashboardPage() {
  // Select raw collection — stable reference, only changes when stickers are added/removed
  const collection = useCollection(s => s.collection);

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

  const teamsCompleted = useMemo(() =>
    ALBUM_GROUPS.filter(g => g.cards.every(c => (collection[c.code]?.qty ?? 0) > 0)).length,
  [collection]);

  const recentCards = useMemo(() => {
    const all: { card: Sticker; qty: number; ts: number }[] = [];
    for (const g of ALBUM_GROUPS) for (const c of g.cards) {
      const s = collection[c.code];
      if (s?.ts) all.push({ card: c, qty: s.qty, ts: s.ts });
    }
    return all.sort((a, b) => b.ts - a.ts).slice(0, 5);
  }, [collection]);

  const teamProgress = useMemo(() => (teamName: string) => {
    const g = ALBUM_GROUPS.find(x => x.team === teamName);
    if (!g) return { owned: 0, total: 0, pct: 0 };
    const owned = g.cards.filter(c => (collection[c.code]?.qty ?? 0) > 0).length;
    return { owned, total: g.cards.length, pct: Math.round(owned / g.cards.length * 100) };
  }, [collection]);

  const [sheetCard, setSheetCard] = useState<Sticker | null>(null);

  const pct = Math.round(ownedCount / TOTAL_STICKERS * 100);

  const closest = ALBUM_GROUPS
    .map(g => ({ g, tp: teamProgress(g.team) }))
    .filter(x => x.tp.pct < 100 && x.tp.pct > 0)
    .sort((a, b) => b.tp.pct - a.tp.pct)
    .slice(0, 4);

  return (
    <div>
      <div style={{ padding: '6px 18px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 500, color: '#878B96', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            WORLD CUP 2026
          </div>
          <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.035em', color: '#EBEDF0', lineHeight: 1.05, marginTop: 4 }}>
            Your album
          </div>
        </div>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 40,
            background: 'linear-gradient(135deg, #C8F265, #6FB341)',
            color: '#0A1500', fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 16,
            display: 'grid', placeItems: 'center',
          }}>M</div>
        </Link>
      </div>

      {/* Hero card */}
      <div style={{ margin: '0 14px' }}>
        <div style={{
          position: 'relative',
          background: 'radial-gradient(120% 100% at 100% 0%, rgba(200,242,101,0.12), transparent 60%), linear-gradient(180deg, #1C1F26, #15171C)',
          borderRadius: 24, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
          padding: 18, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 500, color: '#878B96', letterSpacing: '0.14em' }}>COLLECTED</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 800, fontSize: 64, letterSpacing: '-0.05em', color: '#EBEDF0', lineHeight: 0.9 }}>
                  {ownedCount}
                </div>
                <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 500, fontSize: 22, color: '#878B96', letterSpacing: '-0.02em' }}>
                  / {TOTAL_STICKERS}
                </div>
              </div>
              <div style={{ marginTop: 10, fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 500, fontSize: 13, color: '#878B96' }}>
                <span style={{ color: '#C8F265', fontWeight: 700 }}>{pct}%</span> complete · {TOTAL_STICKERS - ownedCount} missing
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <SegmentedRing size={108} stroke={8} />
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 22, color: '#EBEDF0',
              }}>{pct}%</div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <Link href="/album" style={{
              flex: 1, height: 44, borderRadius: 14,
              background: '#C8F265', color: '#0A1500',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 700, fontSize: 14,
              textDecoration: 'none',
            }}>
              Open album <Icons.chev s={16} />
            </Link>
            <Link href="/duplicates" style={{
              flex: 1, height: 44, borderRadius: 14,
              background: 'rgba(255,255,255,0.06)', color: '#EBEDF0',
              fontFamily: 'var(--font-inter, sans-serif)', fontWeight: 600, fontSize: 14,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
            }}>
              Share duplicates
            </Link>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ margin: '14px 14px 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        <StatCard label="Missing" value={TOTAL_STICKERS - ownedCount} accent="#EBEDF0" />
        <StatCard label="Duplicates" value={dupeTotal} accent="#F2B05E" />
        <StatCard label="Teams done" value={teamsCompleted} accent="#C8F265" sub={`of ${ALBUM_GROUPS.length}`} />
      </div>

      {/* Recently added */}
      <div style={{ padding: '22px 14px 0' }}>
        <SectionTitle title="Recently added" hint={recentCards.length ? 'last 5' : undefined} />
        {recentCards.length === 0 ? (
          <EmptyState text="Tap stickers in the album to start collecting." />
        ) : (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -14px', padding: '4px 14px' }}>
            {recentCards.map(({ card, qty }) => (
              <div key={card.code} style={{ width: 96, flexShrink: 0 }}>
                <StickerTile sticker={card} overrideQty={qty} onLongPress={setSheetCard} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closest to done */}
      <div style={{ padding: '22px 14px 24px' }}>
        <SectionTitle title="Closest to done" hint="next up" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {closest.map(({ g, tp }) => (
            <Link key={g.team} href={`/album?team=${encodeURIComponent(g.team)}`} style={{
              background: '#15171C', borderRadius: 14,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
              padding: '10px 14px',
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 12,
              textDecoration: 'none',
            }}>
              <TeamBadge team={g.team} size={36} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 15, color: '#EBEDF0', letterSpacing: '-0.02em' }}>
                  {g.team}
                </div>
                <div style={{ marginTop: 5 }}>
                  <ProgressBar pct={tp.pct} color={teamColor(g.team)} h={3} />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, color: '#878B96', minWidth: 38, textAlign: 'right' }}>
                {tp.owned}/{tp.total}
              </div>
            </Link>
          ))}
          {closest.length === 0 && (
            <EmptyState text="No team started yet — your closest teams will appear here." />
          )}
        </div>
      </div>

      <StickerSheet card={sheetCard} open={!!sheetCard} onClose={() => setSheetCard(null)} />
    </div>
  );
}

function StatCard({ label, value, accent, sub }: { label: string; value: number | string; accent: string; sub?: string }) {
  return (
    <div style={{ background: '#15171C', borderRadius: 16, padding: '14px 12px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)' }}>
      <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em', color: accent, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#878B96', marginTop: 6, fontWeight: 600 }}>
        {label}{sub && <span style={{ color: '#5A5E69' }}> · {sub}</span>}
      </div>
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontFamily: 'var(--font-bricolage, sans-serif)', fontWeight: 700, fontSize: 18, color: '#EBEDF0', letterSpacing: '-0.02em' }}>
        {title}
      </div>
      {hint && <div style={{ fontSize: 11, color: '#878B96', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{hint}</div>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: '20px 16px', borderRadius: 14, background: '#15171C', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)', color: '#878B96', fontSize: 13, lineHeight: 1.4, textAlign: 'center' }}>
      {text}
    </div>
  );
}
