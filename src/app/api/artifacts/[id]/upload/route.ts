import { NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getSessionFromRequest } from '@/lib/auth';
import getDb from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const artifact = db.prepare('SELECT seller_id FROM artifacts WHERE id = ?').get(id) as { seller_id: string } | undefined;
  if (!artifact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (artifact.seller_id !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.endsWith('.clawpkg') ? '.clawpkg' : '.zip';
  const allowedTypes = ['application/zip', 'application/octet-stream', 'application/x-zip-compressed'];
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 413 });

  const uploadsDir = join(process.cwd(), 'uploads', 'artifacts');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

  const filename = `${id}${ext}`;
  const filePath = join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(filePath, buffer);

  db.prepare('UPDATE artifacts SET file_path = ?, updated_at = ? WHERE id = ?')
    .run(`uploads/artifacts/${filename}`, Math.floor(Date.now() / 1000), id);

  return NextResponse.json({ ok: true, file_path: `uploads/artifacts/${filename}` });
}
