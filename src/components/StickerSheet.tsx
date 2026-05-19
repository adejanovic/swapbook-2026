'use client';
import { useCollection } from '@/lib/store/collection';
import { teamColor, teamLogo } from '@/lib/data/teams';
import { Icons } from './Icons';
import { TeamBadge } from './TeamBadge';
import type { Sticker } from '@/types';

interface Props {
  card: Sticker | null;
  open: boolean;
  onClose: () => void;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#15171C', borderRadius: 12, padding: '10px 12px',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#878B96', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ marginTop: 4, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 14, color: '#EBEDF0' }}>{value}</div>
    </div>
  );
}

export function StickerSheet({ card, open, onClose }: Props) {
  const qty = useCollection(s => card ? s.qty(card.code) : 0);
  const setQty = useCollection(s => s.setQty);
  const cycle = useCollection(s => s.cycle);

  if (!open || !card) return null;

  const status = qty === 0 ? 'missing' : qty === 1 ? 'owned' : 'dup';
  const ring = teamColor(card.team);
  const logo = teamLogo(card.team);
  const num = card.code.replace(/^[A-Z]+0*/, '') || '00';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 70,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', background: '#0F1116',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          boxShadow: '0 -20px 40px rgba(0,0,0,0.4)',
          padding: '10px 18px 34px',
          animation: 'sb-slideup .25s cubic-bezier(.2,.7,.2,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 12px' }}>
          <div style={{ width: 44, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.16)' }} />
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <TeamBadge team={card.team} size={48} soft />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#878B96', letterSpacing: '0.06em' }}>
              {card.code} · {card.team.toUpperCase()}
            </div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 22,
              letterSpacing: '-0.02em', lineHeight: 1.1, color: '#EBEDF0', marginTop: 2,
            }}>{(card.name || '').split(' - ')[0]}</div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{
            aspectRatio: '0.78 / 1', maxWidth: 200, margin: '0 auto',
            borderRadius: 14,
            background: status === 'missing'
              ? 'linear-gradient(180deg, #1C1F26, #15171C)'
              : `linear-gradient(180deg, ${ring}28, #15171C)`,
            boxShadow: `inset 0 0 0 1.5px ${status === 'missing' ? 'rgba(255,255,255,0.07)' : ring}`,
            position: 'relative', overflow: 'hidden',
            display: 'grid', placeItems: 'center',
          }}>
            {card.variant === 'foil' && status !== 'missing' && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(135deg, rgba(255,180,230,0.22), rgba(160,220,255,0.14) 30%, rgba(255,255,170,0.20) 55%, rgba(190,160,255,0.16) 80%)',
                mixBlendMode: 'screen',
              }} />
            )}
            {logo && status !== 'missing' && (
              <img src={logo} alt={card.team} style={{
                position: 'absolute', width: '55%', height: '55%', objectFit: 'contain', opacity: 0.15,
              }} />
            )}
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 58,
              letterSpacing: '-0.04em',
              color: status === 'missing' ? '#5A5E69' : 'rgba(255,255,255,0.9)',
              position: 'relative',
            }}>{num}</div>
          </div>
        </div>

        <div style={{
          marginTop: 22, display: 'flex', alignItems: 'center', gap: 16,
          background: '#15171C', borderRadius: 16, padding: 12,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        }}>
          <button
            onClick={() => setQty(card.code, Math.max(0, qty - 1))}
            style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              width: 44, height: 44, borderRadius: 44,
              background: '#23262F', color: '#EBEDF0',
              display: 'grid', placeItems: 'center',
            }}
          >
            <Icons.minus />
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 38,
              letterSpacing: '-0.04em', color: '#EBEDF0', lineHeight: 1,
            }}>{qty}</div>
            <div style={{
              marginTop: 2, fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
              color: status === 'missing' ? '#878B96' : status === 'owned' ? '#C8F265' : '#F2B05E',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {status === 'missing' ? 'Missing' : status === 'owned' ? 'Collected' : `${qty - 1} duplicate${qty - 1 > 1 ? 's' : ''}`}
            </div>
          </div>
          <button
            onClick={() => cycle(card.code)}
            style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              width: 44, height: 44, borderRadius: 44,
              background: '#C8F265', color: '#0A1500',
              display: 'grid', placeItems: 'center',
            }}
          >
            <Icons.plus />
          </button>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Meta label="Type" value={card.type || '—'} />
          <Meta label="Variant" value={(card.variant || 'base').toUpperCase()} />
        </div>

        {qty > 1 && (
          <div style={{
            marginTop: 14, padding: '12px 14px',
            background: 'rgba(242,176,94,0.10)', borderRadius: 14,
            boxShadow: 'inset 0 0 0 1px rgba(242,176,94,0.2)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ display: 'flex' }}>
              {['#C8F265','#8FB8FF','#E58CFF'].map((c, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: 24, background: c,
                  marginLeft: i ? -8 : 0, boxShadow: '0 0 0 2px #0F1116',
                }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#EBEDF0', lineHeight: 1.3 }}>
              <b style={{ color: '#F2B05E' }}>3 collectors</b> in your network are missing this one
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
