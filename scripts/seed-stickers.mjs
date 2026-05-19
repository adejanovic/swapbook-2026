// Run: node --env-file=.env.local scripts/seed-stickers.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dir, '../src/lib/data/stickers.ts');
const src = readFileSync(dataFile, 'utf8');
const jsonMatch = src.match(/= (\[[\s\S]+?\]);\s*\n\nexport const TOTAL/);
if (!jsonMatch) { console.error('Could not parse stickers data'); process.exit(1); }
const ALBUM_GROUPS = JSON.parse(jsonMatch[1]);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rows = ALBUM_GROUPS.flatMap(g =>
  g.cards.map(c => ({
    code:        c.code,
    album_order: c.order,
    team:        c.team,
    name:        c.name,
    type:        c.type ?? null,
    variant:     c.variant ?? 'Base',
  }))
);

const { error } = await supabase.from('stickers').upsert(rows, { onConflict: 'code' });
if (error) { console.error(error); process.exit(1); }
console.log(`Seeded ${rows.length} stickers across ${ALBUM_GROUPS.length} teams`);
