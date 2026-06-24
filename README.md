# WC26 Bracket

Copa do Mundo 2026 — bracket interativo, draft de XI e ranking local.

## Features

- **Bracket**: fase de grupos + mata-mata com palpites e avanço automático
- **Draft**: monte seu XI 4-3-3 e simule partidas
- **Ranking**: leaderboard local (importe brackets via link)
- **Bolão**: compare palpites entre amigos (local-first)
- **Share**: links JWT assinados (`/api/share`, `/b/[hash]`)

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
# Required in production for signed share links
BRACKET_SHARE_SECRET=your_secret

# Optional — live WC results via API-Sports
API_FOOTBALL_KEY=your_key

# Optional — Supabase catalog (projetoCopa)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Share URLs and SEO (sitemap, robots)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

Without `API_FOOTBALL_KEY`, the app uses static seed data and manual group scores.  
Without `BRACKET_SHARE_SECRET`, share tokens work in dev but are not cryptographically verified.

## Local-First Limits

- Predictions and ranking are stored in **browser localStorage**
- No server-side user accounts or sync between devices
- Share links encode predictions in a signed JWT — no server persistence needed

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm sync:worldcup` | Sync matches/teams from worldcup26.ir → `src/data/` |
| `pnpm sync:squads` | Sync player squads → `src/data/squads.json` |
| `pnpm check:players` | Validate player data integrity |
| `pnpm icons:pwa` | Regenerate PWA PNG icons from SVG source |

### Data sync workflow

1. Set `API_FOOTBALL_KEY` in `.env.local` if you want live API-Sports data
2. Run `pnpm sync:worldcup` to refresh `matches.ts` and `teams.ts`
3. Run `pnpm sync:squads` to refresh squad rosters
4. Run `pnpm check:players` to validate before committing

## Deploy (Vercel)

- Package manager: **pnpm** (see `vercel.json`)
- Set `BRACKET_SHARE_SECRET` and `NEXT_PUBLIC_BASE_URL` in project env vars
- Analytics: [@vercel/analytics](https://vercel.com/docs/analytics) enabled in layout

## PWA

Icons are PNG (`public/icons/icon-192.png`, `icon-512.png`). Regenerate from SVG with `pnpm icons:pwa`.
