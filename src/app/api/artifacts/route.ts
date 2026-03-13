import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { listArtifacts } from '@/lib/artifacts';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { ClawPersonality, PreviewConfig } from '@/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get('search') || undefined;
  const personality = url.searchParams.get('personality') || undefined;
  const sortBy = (url.searchParams.get('sort') || 'newest') as 'newest' | 'price_asc' | 'price_desc' | 'popular';
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const session = await getSessionFromRequest(req);
  const artifacts = listArtifacts({ search, personality, sortBy, limit, offset, buyerId: session?.userId });
  return NextResponse.json({ artifacts });
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, description, price, tags, skills, personality, preview_config } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description required' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    db.prepare(`
      INSERT INTO artifacts (id, seller_id, name, description, price, tags, skills, personality, preview_config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      session.userId,
      name,
      description,
      Math.max(0, parseInt(price) || 0),
      JSON.stringify(Array.isArray(tags) ? tags : []),
      JSON.stringify(Array.isArray(skills) ? skills : []),
      (personality as ClawPersonality) || 'balanced',
      JSON.stringify((preview_config as PreviewConfig) || {}),
      now,
      now
    );

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
