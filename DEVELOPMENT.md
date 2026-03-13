# Development

## Tech Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **SQLite** via `better-sqlite3`
- **JWT** auth via `jose` (httpOnly cookie)

## Getting Started

```bash
npm install
npm run seed      # load demo data
npm run dev       # start on http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run seed` | Seed demo artifacts and users |
| `node scripts/package-claw.mjs` | Export an OpenClaw config as `.clawpkg` |
| `node scripts/import-claw.mjs <file>` | Install a `.clawpkg` into OpenClaw |

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, sets `auth_token` cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/me` | Current user info |
| GET/POST | `/api/artifacts` | List or create artifacts |
| GET/PATCH/DELETE | `/api/artifacts/[id]` | Read, update, or delete an artifact |
| POST | `/api/artifacts/[id]/upload` | Upload `.clawpkg` file |
| GET | `/api/artifacts/[id]/download` | Download (requires purchase or seller) |
| GET/POST | `/api/purchases` | List or create purchases |
| GET/POST | `/api/reviews` | List or create reviews |

## DB Schema

```
users       (id, email, username, password_hash, avatar_seed, bio, created_at)
artifacts   (id, seller_id, name, description, price[cents], tags, skills,
             personality, file_path, preview_config, download_count,
             is_published, created_at, updated_at)
purchases   (id, buyer_id, artifact_id, amount, status, created_at)
reviews     (id, reviewer_id, artifact_id, rating 1-5, comment, created_at)
```

## Claw Personalities

`aggressive` · `balanced` · `defensive` · `creative` · `analytical` · `helper`

Each personality has a unique color and emoji in the Claw Tank visualizer.
