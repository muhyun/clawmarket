import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getSessionFromRequest } from '@/lib/auth';
import getDb from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as {
    id: string; seller_id: string; name: string; file_path: string | null; price: number;
  } | undefined;

  if (!artifact) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Must be buyer or seller
  const isSeller = artifact.seller_id === session.userId;
  const isPurchased = db.prepare('SELECT id FROM purchases WHERE buyer_id = ? AND artifact_id = ?')
    .get(session.userId, id);

  if (!isSeller && !isPurchased) {
    return NextResponse.json({ error: 'Purchase required' }, { status: 403 });
  }

  if (!artifact.file_path) {
    return NextResponse.json({ error: 'No file uploaded for this artifact yet' }, { status: 404 });
  }

  const fullPath = join(process.cwd(), artifact.file_path);
  if (!existsSync(fullPath)) {
    return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
  }

  const buffer = readFileSync(fullPath);
  const filename = `${artifact.name.replace(/[^a-z0-9_-]/gi, '_')}.clawpkg`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    },
  });
}
