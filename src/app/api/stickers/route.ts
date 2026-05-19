import { NextResponse } from 'next/server';
import { ALBUM_GROUPS } from '@/lib/data/stickers';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(ALBUM_GROUPS, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
