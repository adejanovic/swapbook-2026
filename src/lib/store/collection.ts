'use client';
import { create } from 'zustand';
import { ALBUM_GROUPS } from '@/lib/data/stickers';
import type { Sticker } from '@/types';

interface RecentCard {
  card: Sticker;
  team: string;
  ts: number;
  qty: number;
}

interface CollectionState {
  collection: Record<string, { qty: number; ts: number }>;
  isLoaded: boolean;

  load: (userId?: string) => Promise<void>;
  qty: (code: string) => number;
  setQty: (code: string, qty: number) => Promise<void>;
  cycle: (code: string) => Promise<void>;
  reset: () => Promise<void>;

  ownedCount: () => number;
  dupeTotal: () => number;
  teamsCompleted: () => number;
  recentCards: (limit?: number) => RecentCard[];
  teamProgress: (team: string) => { owned: number; total: number; pct: number };
}

const STORAGE_KEY = 'swapbook2026_v1';

function loadLocal(): Record<string, { qty: number; ts: number }> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveLocal(s: Record<string, { qty: number; ts: number }>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export const useCollection = create<CollectionState>((set, get) => ({
  collection: {},
  isLoaded: false,

  load: async (userId?: string) => {
    if (userId) {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { data } = await supabase()
          .from('collections')
          .select('sticker_code, qty, updated_at')
          .eq('user_id', userId);
        if (data) {
          const map: Record<string, { qty: number; ts: number }> = {};
          data.forEach((r) => {
            map[r.sticker_code] = { qty: r.qty, ts: new Date(r.updated_at).getTime() };
          });
          set({ collection: map, isLoaded: true });
          saveLocal(map);
          return;
        }
      } catch { /* fall through to local */ }
    }
    set({ collection: loadLocal(), isLoaded: true });
  },

  qty: (code) => get().collection[code]?.qty ?? 0,

  setQty: async (code, qty) => {
    const prev = get().collection;
    const next = { ...prev };
    if (qty <= 0) {
      delete next[code];
    } else {
      next[code] = { qty, ts: Date.now() };
    }
    set({ collection: next });
    saveLocal(next);

    try {
      const { supabase } = await import('@/lib/supabase/client');
      const db = supabase();
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;
      if (qty <= 0) {
        await db.from('collections').delete().match({ sticker_code: code, user_id: user.id });
      } else {
        await db.from('collections').upsert(
          { sticker_code: code, qty, updated_at: new Date().toISOString(), user_id: user.id },
          { onConflict: 'user_id,sticker_code' }
        );
      }
    } catch { /* offline-capable */ }
  },

  cycle: async (code) => {
    const cur = get().qty(code);
    await get().setQty(code, cur + 1);
  },

  reset: async () => {
    set({ collection: {} });
    saveLocal({});
    try {
      const { supabase } = await import('@/lib/supabase/client');
      const db = supabase();
      const { data: { user } } = await db.auth.getUser();
      if (user) await db.from('collections').delete().eq('user_id', user.id);
    } catch { /* offline-capable */ }
  },

  ownedCount: () => {
    const col = get().collection;
    let n = 0;
    for (const g of ALBUM_GROUPS) for (const c of g.cards) if ((col[c.code]?.qty ?? 0) > 0) n++;
    return n;
  },

  dupeTotal: () => {
    const col = get().collection;
    let n = 0;
    for (const g of ALBUM_GROUPS) for (const c of g.cards) {
      const q = col[c.code]?.qty ?? 0;
      if (q > 1) n += q - 1;
    }
    return n;
  },

  teamsCompleted: () => {
    const col = get().collection;
    return ALBUM_GROUPS.filter(g =>
      g.cards.every(c => (col[c.code]?.qty ?? 0) > 0)
    ).length;
  },

  recentCards: (limit = 6) => {
    const col = get().collection;
    const all: RecentCard[] = [];
    for (const g of ALBUM_GROUPS) {
      for (const c of g.cards) {
        const s = col[c.code];
        if (s?.ts) all.push({ card: c, team: g.team, ts: s.ts, qty: s.qty });
      }
    }
    return all.sort((a, b) => b.ts - a.ts).slice(0, limit);
  },

  teamProgress: (teamName: string) => {
    const col = get().collection;
    const g = ALBUM_GROUPS.find(x => x.team === teamName);
    if (!g) return { owned: 0, total: 0, pct: 0 };
    const owned = g.cards.filter(c => (col[c.code]?.qty ?? 0) > 0).length;
    return { owned, total: g.cards.length, pct: Math.round(owned / g.cards.length * 100) };
  },
}));
