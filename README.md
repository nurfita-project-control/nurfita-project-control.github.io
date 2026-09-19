# Nurfita Project Control

Mobile-first project control and reporting application for PT Nurfita Karya Mandiri.

The public repository contains interface code and non-production sample data only.
Production schedules, costs, contract references, photos, and reports are stored in
Supabase and protected by authentication plus Row Level Security.

## Architecture

- Next.js static export
- GitHub Pages hosting
- Mobile-first dashboard and daily input
- HK read-only progress portal
- Supabase database, authentication, and photo storage in the next integration phase

## Development

```bash
pnpm install
pnpm dev
```

## Production build

```bash
pnpm lint
pnpm build
```

The static production output is generated in `out/` and deployed through GitHub Actions.
