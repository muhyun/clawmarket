import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json({ error: 'Username: 3-20 chars, letters/numbers/_/-' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 });
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);
    const avatar_seed = Math.random().toString(36).slice(2, 10);

    db.prepare(
      'INSERT INTO users (id, email, username, password_hash, avatar_seed) VALUES (?, ?, ?, ?, ?)'
    ).run(id, email, username, password_hash, avatar_seed);

    const token = await signToken({ userId: id, email, username });

    const response = NextResponse.json({ user: { id, email, username, avatar_seed } }, { status: 201 });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
