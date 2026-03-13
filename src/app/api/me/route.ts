import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import getDb from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const db = getDb();
  const user = db.prepare('SELECT id, email, username, avatar_seed, bio, created_at FROM users WHERE id = ?').get(session.userId);
  return NextResponse.json({ user: user || null });
}
