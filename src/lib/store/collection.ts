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
  userId: string | null;

  load: (userId: string) => Promise<void>;
  applyRealtimeChange: (event: 'INSERT' | 'UPDATE' | 'DELETE', row: Record<string, unknown>) => void;
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

export const useCollection = create<CollectionState>((set, get) => ({
  collection: {},
  isLoaded: false,
  userId: null,

  load: async (userId: string) => {
    set({ userId });
    const { supabase } = await import('@/lib/supabase/client');
    const { data, error } = await supabase()
      .from('collections')
      .select('sticker_code, qty, updated_at')
      .eq('user_id', userId);
    if (error) {
      console.error('[collection] load failed:', error.message);
      set({ isLoaded: true });
      return;
    }
    const map: Record<string, { qty: number; ts: number }> = {};
    (data || []).forEach((r) => {
      map[r.sticker_code] = { qty: r.qty, ts: new Date(r.updated_at).getTime() };
    });
    set({ collection: map, isLoaded: true });
  },

  applyRealtimeChange: (event, row) => {
    const col = { ...get().collection };
    if (event === 'DELETE') {
      const code = row.sticker_code as string;
      delete col[code];
    } else {
      const code = row.sticker_code as string;
      const qty = row.qty as number;
      const ts = new Date(row.updated_at as string).getTime();
      col[code] = { qty, ts };
    }
    set({ collection: col });
  },

  qty: (code) => get().collection[code]?.qty ?? 0,

  setQty: async (code, qty) => {
    const userId = get().userId;
    if (!userId) {
      console.error('[collection] setQty called with no userId — user not loaded yet');
      return;
    }

    // Optimistic in-memory update for responsive UI
    const next = { ...get().collection };
    if (qty <= 0) {
      delete next[code];
    } else {
      next[code] = { qty, ts: Date.now() };
    }
    set({ collection: next });

    // Write to Supabase — userId already known, no extra auth roundtrip
    const { supabase } = await import('@/lib/supabase/client');
    const db = supabase();
    let writeError: unknown = null;
    if (qty <= 0) {
      const { error } = await db.from('collections').delete().match({ sticker_code: code, user_id: userId });
      writeError = error;
    } else {
      const { error } = await db.from('collections').upsert(
        { sticker_code: code, qty, updated_at: new Date().toISOString(), user_id: userId },
        { onConflict: 'user_id,sticker_code' }
      );
      writeError = error;
    }
    if (writeError) {
      console.error('[collection] write failed:', writeError);
    }
  },

  cycle: async (code) => {
    await get().setQty(code, get().qty(code) + 1);
  },

  reset: async () => {
    const userId = get().userId;
    set({ collection: {} });
    if (!userId) return;
    const { supabase } = await import('@/lib/supabase/client');
    const { error } = await supabase().from('collections').delete().eq('user_id', userId);
    if (error) console.error('[collection] reset failed:', error.message);
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
