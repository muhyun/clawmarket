import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const artifactId = url.searchParams.get('artifactId');
  if (!artifactId) return NextResponse.json({ reviews: [] });

  const db = getDb();
  const reviews = db.prepare(`
    SELECT r.*, u.username AS reviewer_username, u.avatar_seed AS reviewer_avatar_seed
    FROM reviews r
    JOIN users u ON u.id = r.reviewer_id
    WHERE r.artifact_id = ?
    ORDER BY r.created_at DESC
  `).all(artifactId);
  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { artifactId, rating, comment } = await req.json();
    if (!artifactId || !rating) return NextResponse.json({ error: 'artifactId and rating required' }, { status: 400 });
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });

    const db = getDb();
    const purchase = db.prepare('SELECT id FROM purchases WHERE buyer_id = ? AND artifact_id = ?').get(session.userId, artifactId);
    if (!purchase) return NextResponse.json({ error: 'Must purchase before reviewing' }, { status: 403 });

    const existing = db.prepare('SELECT id FROM reviews WHERE reviewer_id = ? AND artifact_id = ?').get(session.userId, artifactId);
    if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });

    const id = uuidv4();
    db.prepare('INSERT INTO reviews (id, reviewer_id, artifact_id, rating, comment) VALUES (?, ?, ?, ?, ?)')
      .run(id, session.userId, artifactId, rating, comment || '');

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
