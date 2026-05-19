'use client';
import { useMemo } from 'react';
import { ALBUM_GROUPS } from '@/lib/data/stickers';
import { teamColor } from '@/lib/data/teams';
import { useCollection } from '@/lib/store/collection';

interface Props {
  size?: number;
  stroke?: number;
}

export function SegmentedRing({ size = 124, stroke = 10 }: Props) {
  const collection = useCollection(s => s.collection);
  const teamProgress = useMemo(() => (teamName: string) => {
    const g = ALBUM_GROUPS.find(x => x.team === teamName);
    if (!g) return { pct: 0 };
    const owned = g.cards.filter(c => (collection[c.code]?.qty ?? 0) > 0).length;
    return { pct: Math.round(owned / g.cards.length * 100) };
  }, [collection]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const segs = ALBUM_GROUPS.length;
  const gap = 1.2;
  const segLen = (360 - segs * gap) / segs;
  let acc = -90;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {ALBUM_GROUPS.map((g) => {
        const tp = teamProgress(g.team);
        const segArc = (segLen * tp.pct) / 100;
        const a = acc;
        const col = teamColor(g.team);
        acc += segLen + gap;
        return (
          <g key={g.team}>
            <circle cx={size/2} cy={size/2} r={r} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
              strokeDasharray={`${(segLen/360)*c} ${c}`}
              strokeDashoffset={-((a + 90) / 360) * c} />
            {segArc > 0 && (
              <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke={col} strokeWidth={stroke} strokeLinecap="butt"
                strokeDasharray={`${(segArc/360)*c} ${c}`}
                strokeDashoffset={-((a + 90) / 360) * c} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
