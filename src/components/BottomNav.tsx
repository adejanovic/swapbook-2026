'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './Icons';

const TABS = [
  { href: '/dashboard', label: 'Home',    Icon: Icons.home    },
  { href: '/album',     label: 'Album',   Icon: Icons.book    },
  { href: '/duplicates',label: 'Spares',  Icon: Icons.copy    },
  { href: '/community', label: 'Friends', Icon: Icons.people  },
  { href: '/profile',   label: 'You',     Icon: Icons.user    },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0,
      paddingBottom: 28, paddingTop: 6, zIndex: 40,
      background: 'linear-gradient(180deg, transparent 0%, rgba(10,11,14,0.85) 30%, #0A0B0E 70%)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        margin: '0 14px',
        background: 'rgba(28,31,38,0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: 22,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07), 0 12px 30px rgba(0,0,0,0.4)',
        padding: '8px 6px',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      }}>
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              textDecoration: 'none',
              padding: '6px 0 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: active ? '#C8F265' : '#878B96',
              transition: 'color .15s',
            }}>
              <div style={{
                width: 36, height: 24, borderRadius: 12,
                background: active ? 'rgba(200,242,101,0.14)' : 'transparent',
                display: 'grid', placeItems: 'center',
                transition: 'background .15s',
              }}>
                <Icon s={18} />
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.01em' }}>
                {label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
