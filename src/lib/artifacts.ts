import getDb from './db';
import type { Artifact } from '@/types';

interface RawArtifact {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  tags: string;
  skills: string;
  personality: string;
  file_path: string | null;
  preview_config: string;
  download_count: number;
  is_published: number;
  created_at: number;
  updated_at: number;
  seller_username?: string;
  seller_avatar_seed?: string;
  avg_rating?: number;
  review_count?: number;
}

function parseArtifact(raw: RawArtifact, buyerId?: string): Artifact {
  return {
    ...raw,
    tags: JSON.parse(raw.tags || '[]'),
    skills: JSON.parse(raw.skills || '[]'),
    preview_config: JSON.parse(raw.preview_config || '{}'),
    is_published: !!raw.is_published,
    file_path: raw.file_path ?? undefined,
  } as Artifact;
}

export function listArtifacts(opts: {
  search?: string;
  personality?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  limit?: number;
  offset?: number;
  buyerId?: string;
} = {}): Artifact[] {
  const db = getDb();
  const { search, personality, sortBy = 'newest', limit = 20, offset = 0, buyerId } = opts;

  let query = `
    SELECT a.*,
      u.username AS seller_username,
      u.avatar_seed AS seller_avatar_seed,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count
      ${buyerId ? `, MAX(CASE WHEN p.buyer_id = ? THEN 1 ELSE 0 END) AS is_purchased` : ''}
    FROM artifacts a
    JOIN users u ON u.id = a.seller_id
    LEFT JOIN reviews r ON r.artifact_id = a.id
    ${buyerId ? `LEFT JOIN purchases p ON p.artifact_id = a.id AND p.buyer_id = ?` : ''}
    WHERE a.is_published = 1
  `;

  const params: (string | number)[] = [];
  if (buyerId) {
    params.push(buyerId, buyerId);
  }

  if (search) {
    query += ` AND (a.name LIKE ? OR a.description LIKE ? OR a.tags LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (personality) {
    query += ` AND a.personality = ?`;
    params.push(personality);
  }

  query += ` GROUP BY a.id`;

  const orderMap: Record<string, string> = {
    newest: 'a.created_at DESC',
    price_asc: 'a.price ASC',
    price_desc: 'a.price DESC',
    popular: 'a.download_count DESC',
  };
  query += ` ORDER BY ${orderMap[sortBy] || orderMap.newest}`;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params) as RawArtifact[];
  return rows.map(r => parseArtifact(r));
}

export function getArtifactById(id: string, buyerId?: string): Artifact | null {
  const db = getDb();
  const query = `
    SELECT a.*,
      u.username AS seller_username,
      u.avatar_seed AS seller_avatar_seed,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count
      ${buyerId ? `, MAX(CASE WHEN p.buyer_id = ? THEN 1 ELSE 0 END) AS is_purchased` : ''}
    FROM artifacts a
    JOIN users u ON u.id = a.seller_id
    LEFT JOIN reviews r ON r.artifact_id = a.id
    ${buyerId ? `LEFT JOIN purchases p ON p.artifact_id = a.id AND p.buyer_id = ?` : ''}
    WHERE a.id = ?
    GROUP BY a.id
  `;
  const params = buyerId ? [buyerId, buyerId, id] : [id];
  const row = db.prepare(query).get(...params) as RawArtifact | undefined;
  return row ? parseArtifact(row) : null;
}

export function getArtifactsByUser(sellerId: string): Artifact[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT a.*,
      u.username AS seller_username,
      u.avatar_seed AS seller_avatar_seed,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM artifacts a
    JOIN users u ON u.id = a.seller_id
    LEFT JOIN reviews r ON r.artifact_id = a.id
    WHERE a.seller_id = ?
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `).all(sellerId) as RawArtifact[];
  return rows.map(r => parseArtifact(r));
}

export function getPurchasedArtifacts(buyerId: string): Artifact[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT a.*,
      u.username AS seller_username,
      u.avatar_seed AS seller_avatar_seed,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(DISTINCT r.id) AS review_count,
      1 AS is_purchased
    FROM purchases p
    JOIN artifacts a ON a.id = p.artifact_id
    JOIN users u ON u.id = a.seller_id
    LEFT JOIN reviews r ON r.artifact_id = a.id
    WHERE p.buyer_id = ?
    GROUP BY a.id
    ORDER BY p.created_at DESC
  `).all(buyerId) as RawArtifact[];
  return rows.map(r => parseArtifact(r));
}
