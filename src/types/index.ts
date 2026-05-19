export interface Sticker {
  code: string;
  order: number;
  album_order?: number;
  team: string;
  name: string;
  type: string | null;
  variant: string;
}

export interface StickerGroup {
  team: string;
  abbr: string;
  flag: string;
  cards: Sticker[];
  count: number;
}

export interface TeamData {
  color: string;
  flag: string;
  soft: string;
  logo?: string;
}

export interface Profile {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface CollectionRow {
  user_id: string;
  sticker_code: string;
  qty: number;
  updated_at: string;
}

export type StickerStatus = 'missing' | 'owned' | 'dup';

export interface CommunityMember {
  id: string;
  name: string;
  pct: number;
  dupes: number;
  location: string;
  color: string;
}
