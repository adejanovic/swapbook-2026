interface Props {
  pct: number;
  color?: string;
  h?: number;
}

export function ProgressBar({ pct, color = '#C8F265', h = 4 }: Props) {
  return (
    <div style={{ height: h, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: 4, transition: 'width .25s' }} />
    </div>
  );
}
