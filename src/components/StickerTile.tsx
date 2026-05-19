'use client';
import { useCallback, useRef } from 'react';
import { useCollection } from '@/lib/store/collection';
import { teamColor, teamLogo } from '@/lib/data/teams';
import { Icons } from './Icons';
import type { Sticker } from '@/types';

interface Props {
  sticker: Sticker;
  overrideQty?: number;
  onLongPress?: (sticker: Sticker) => void;
  disableTap?: boolean;
}

function shortName(name: string): string {
  const n = (name || '').split(' - ')[0];
  if (n.length <= 14) return n;
  return n.split(' ').slice(0, 2).join(' ');
}

export function StickerTile({ sticker, overrideQty, onLongPress, disableTap = false }: Props) {
  const storeQty = useCollection(s => s.qty(sticker.code));
  const cycle = useCollection(s => s.cycle);
  const setQty = useCollection(s => s.setQty);

  const qty = overrideQty !== undefined ? overrideQty : storeQty;
  const status = qty === 0 ? 'missing' : qty === 1 ? 'owned' : 'dup';
  const foil = sticker.variant?.toLowerCase() === 'foil';
  const num = sticker.code.replace(/^[A-Z]+0*/, '') || '—';
  const logo = teamLogo(sticker.team);
  const color = teamColor(sticker.team);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const onPointerDown = useCallback(() => {
    didLongPress.current = false;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      if (overrideQty === undefined) setQty(sticker.code, 0);
      onLongPress?.(sticker);
    }, 520);
  }, [sticker, setQty, onLongPress, overrideQty]);

  const onPointerUp = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const onClick = useCallback(() => {
    if (didLongPress.current || disableTap) return;
    if (overrideQty === undefined) cycle(sticker.code);
  }, [sticker.code, cycle, disableTap, overrideQty]);

  const bg = status === 'missing'
    ? 'linear-gradient(180deg, #1C1F26, #15171C)'
    : status === 'owned'
      ? 'linear-gradient(180deg, rgba(200,242,101,0.20), rgba(200,242,101,0.06))'
      : 'linear-gradient(180deg, rgba(242,176,94,0.22), rgba(242,176,94,0.06))';

  const ring = status === 'missing' ? 'rgba(255,255,255,0.07)'
    : status === 'owned' ? '#C8F265' : '#F2B05E';

  return (
    <button
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (overrideQty === undefined) setQty(sticker.code, 0);
        onLongPress?.(sticker);
      }}
      style={{
        appearance: 'none', border: 0, padding: 0,
        position: 'relative', aspectRatio: '0.78 / 1',
        borderRadius: 10, background: bg,
        boxShadow: `inset 0 0 0 1px ${ring}`,
        cursor: 'pointer', overflow: 'hidden', textAlign: 'left',
        transition: 'transform .12s', width: '100%',
      }}
    >
      {foil && status !== 'missing' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(135deg, rgba(255,180,230,0.18) 0%, rgba(160,220,255,0.10) 30%, rgba(255,255,170,0.16) 55%, rgba(190,160,255,0.12) 80%)',
          mixBlendMode: 'screen',
        }} />
      )}

      <div style={{
        position: 'absolute', top: 6, left: 6, right: 6, height: '55%',
        borderRadius: 6,
        background: status === 'missing'
          ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 4px, transparent 4px 8px)'
          : `linear-gradient(180deg, ${color}28, transparent 80%)`,
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {status === 'missing' ? (
          <span style={{ fontSize: 26, color: '#5A5E69', opacity: 0.5 }}>—</span>
        ) : logo ? (
          <>
            <img src={logo} alt={sticker.team}
              style={{ width: '70%', height: '70%', objectFit: 'contain', opacity: 0.22 }} />
            <span style={{
              position: 'absolute',
              fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
              fontSize: 18, letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.9)',
            }}>{num}</span>
          </>
        ) : (
          <span style={{
            fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
            fontSize: 22, letterSpacing: '-0.04em', color: 'rgba(255,255,255,0.92)',
          }}>{num}</span>
        )}
      </div>

      <div style={{
        position: 'absolute', left: 6, right: 6, bottom: 6,
        display: 'flex', flexDirection: 'column', gap: 1,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          color: status === 'missing' ? '#5A5E69' : '#878B96', letterSpacing: '0.04em',
        }}>{sticker.code}</div>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 600,
          color: status === 'missing' ? '#878B96' : '#EBEDF0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{shortName(sticker.name)}</div>
      </div>

      {qty > 1 && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          background: '#F2B05E', color: '#1B1100',
          borderRadius: 8, padding: '2px 6px',
          fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 11,
          letterSpacing: '-0.02em',
        }}>×{qty - 1}</div>
      )}
      {qty === 1 && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 18, height: 18, borderRadius: 18,
          background: '#C8F265', color: '#0B1300',
          display: 'grid', placeItems: 'center',
        }}>
          <Icons.check s={10} />
        </div>
      )}
      {foil && status === 'missing' && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          padding: '1px 5px', borderRadius: 4,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 600,
          color: '#A8ADBA', letterSpacing: '0.08em',
          background: 'rgba(168,173,186,0.12)',
        }}>FOIL</div>
      )}
    </button>
  );
}
