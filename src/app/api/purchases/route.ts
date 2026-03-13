import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getPurchasedArtifacts } from '@/lib/artifacts';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const artifacts = getPurchasedArtifacts(session.userId);
  return NextResponse.json({ artifacts });
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { artifactId } = await req.json();
    if (!artifactId) return NextResponse.json({ error: 'artifactId required' }, { status: 400 });

    const db = getDb();
    const artifact = db.prepare('SELECT id, seller_id, price FROM artifacts WHERE id = ? AND is_published = 1').get(artifactId) as {
      id: string; seller_id: string; price: number;
    } | undefined;

    if (!artifact) return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    if (artifact.seller_id === session.userId) {
      return NextResponse.json({ error: 'Cannot purchase your own artifact' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM purchases WHERE buyer_id = ? AND artifact_id = ?').get(session.userId, artifactId);
    if (existing) return NextResponse.json({ error: 'Already purchased' }, { status: 409 });

    const id = uuidv4();
    db.prepare(
      'INSERT INTO purchases (id, buyer_id, artifact_id, amount, status) VALUES (?, ?, ?, ?, ?)'
    ).run(id, session.userId, artifactId, artifact.price, 'completed');

    db.prepare('UPDATE artifacts SET download_count = download_count + 1 WHERE id = ?').run(artifactId);

    return NextResponse.json({ id, message: 'Purchase successful' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
