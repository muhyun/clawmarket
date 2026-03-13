import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getArtifactById } from '@/lib/artifacts';
import getDb from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  const artifact = getArtifactById(id, session?.userId);
  if (!artifact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ artifact });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const artifact = db.prepare('SELECT seller_id FROM artifacts WHERE id = ?').get(id) as { seller_id: string } | undefined;
  if (!artifact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (artifact.seller_id !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description); }
  if (body.price !== undefined) { fields.push('price = ?'); values.push(Math.max(0, parseInt(body.price) || 0)); }
  if (body.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(body.tags)); }
  if (body.skills !== undefined) { fields.push('skills = ?'); values.push(JSON.stringify(body.skills)); }
  if (body.personality !== undefined) { fields.push('personality = ?'); values.push(body.personality); }
  if (body.preview_config !== undefined) { fields.push('preview_config = ?'); values.push(JSON.stringify(body.preview_config)); }
  if (body.is_published !== undefined) { fields.push('is_published = ?'); values.push(body.is_published ? 1 : 0); }

  if (fields.length === 0) return NextResponse.json({ ok: true });

  fields.push('updated_at = ?');
  values.push(Math.floor(Date.now() / 1000));
  values.push(id);

  db.prepare(`UPDATE artifacts SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const artifact = db.prepare('SELECT seller_id FROM artifacts WHERE id = ?').get(id) as { seller_id: string } | undefined;
  if (!artifact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (artifact.seller_id !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  db.prepare('DELETE FROM artifacts WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
