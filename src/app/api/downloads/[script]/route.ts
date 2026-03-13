import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

const ALLOWED: Record<string, { file: string; filename: string }> = {
  'package-claw': {
    file: 'scripts/package-claw.mjs',
    filename: 'package-claw.mjs',
  },
  'import-claw': {
    file: 'scripts/import-claw.mjs',
    filename: 'import-claw.mjs',
  },
};

export async function GET(_req: Request, { params }: { params: Promise<{ script: string }> }) {
  const { script } = await params;
  const entry = ALLOWED[script];
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const filePath = join(process.cwd(), entry.file);
  if (!existsSync(filePath)) return NextResponse.json({ error: 'Script not found on server' }, { status: 404 });

  const content = readFileSync(filePath);
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${entry.filename}"`,
      'Content-Length': content.length.toString(),
    },
  });
}
