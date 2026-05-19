import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await db
    .from('collections')
    .select('sticker_code, qty, updated_at')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { code, qty } = body as { code: string; qty: number };
  if (!code || typeof qty !== 'number') return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  if (qty <= 0) {
    await db.from('collections').delete().match({ user_id: user.id, sticker_code: code });
    return NextResponse.json({ ok: true });
  }

  const { error } = await db.from('collections').upsert(
    { user_id: user.id, sticker_code: code, qty, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,sticker_code' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
