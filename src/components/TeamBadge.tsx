import { teamColor, teamColorSoft, teamFlag, teamLogo } from '@/lib/data/teams';

interface Props {
  team: string;
  size?: number;
  soft?: boolean;
}

export function TeamBadge({ team, size = 44, soft = false }: Props) {
  const ring = teamColor(team);
  const fill = soft ? teamColorSoft(team) : '#0F1116';
  const logo = teamLogo(team);
  const flag = teamFlag(team);
  const pad = Math.round(size * 0.14);

  return (
    <div style={{
      width: size, height: size, borderRadius: size,
      display: 'grid', placeItems: 'center',
      background: fill,
      boxShadow: `inset 0 0 0 2px ${ring}`,
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {logo ? (
        <img
          src={logo}
          alt={team}
          style={{ width: size - pad * 2, height: size - pad * 2, objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.54), lineHeight: 1, userSelect: 'none' }}>{flag}</span>
      )}
    </div>
  );
}
