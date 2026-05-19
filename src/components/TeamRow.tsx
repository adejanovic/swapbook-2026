'use client';
import { useCollection } from '@/lib/store/collection';
import { teamColor } from '@/lib/data/teams';

import { TeamBadge } from './TeamBadge';
import { StickerTile } from './StickerTile';
import { ProgressBar } from './ProgressBar';
import { Icons } from './Icons';
import type { StickerGroup, Sticker } from '@/types';

interface Props {
  group: StickerGroup;
  expanded: boolean;
  onToggle: () => void;
  onStickerLong?: (sticker: Sticker) => void;
}

export function TeamRow({ group, expanded, onToggle, onStickerLong }: Props) {
  const collection = useCollection(s => s.collection);
  const owned = group.cards.filter(c => (collection[c.code]?.qty ?? 0) > 0).length;
  const tp = { owned, total: group.cards.length, pct: Math.round(owned / group.cards.length * 100) };
  const ring = teamColor(group.team);

  return (
    <div style={{
      borderRadius: 16, background: '#15171C',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
      overflow: 'hidden',
    }}>
      <button onClick={onToggle} style={{
        appearance: 'none', border: 0, background: 'transparent',
        width: '100%', padding: '12px 14px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 12,
        alignItems: 'center', cursor: 'pointer', color: '#EBEDF0',
      }}>
        <TeamBadge team={group.team} size={40} />
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 16,
            letterSpacing: '-0.02em', color: '#EBEDF0',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{group.team}</div>
          <div style={{ marginTop: 3 }}>
            <ProgressBar pct={tp.pct} color={ring} h={3} />
          </div>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500,
          color: tp.pct === 100 ? '#C8F265' : '#878B96',
          minWidth: 44, textAlign: 'right',
        }}>{tp.owned}/{tp.total}</div>
        <div style={{
          color: '#878B96', transition: 'transform .2s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <Icons.chevDown s={16} />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '4px 12px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {group.cards.map((c) => (
              <StickerTile key={c.code} sticker={c} onLongPress={onStickerLong} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
