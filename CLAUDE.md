# CLAUDE.md — AI Engineer OS

Context file for Claude (and any AI assistant) working on this repository.

## What this project is

**AI Engineer OS** — a learning platform that will contain everything needed to
become a Senior AI / Backend / Production AI Engineer. 159 skills across 28
categories (134 core + 25 "2026 additions" covering evals, context engineering,
agent engineering, model serving, AI protocols, safety, LLMOps, observability
platforms, and modern frameworks); every skill gets an identical, complete **50-section knowledge page**
plus a poster-style **cheat sheet**. Nothing important is ever skipped — the
section template is enforced by the TypeScript compiler.

## Monorepo layout

```
ai-engineer-os/
├── CLAUDE.md                  ← you are here
├── SKILL_BUILD_PROMPT.md      ← THE prompt used to author each new skill
├── web/                       ← Next.js 15 + TS + Tailwind (App Router)
│   └── src/
│       ├── app/               ← pages: / (dashboard), /skills, /skills/[slug],
│       │                        /roadmaps, /bookmarks, /progress, /auth
│       ├── components/        ← AppShell, SkillDetail, CheatSheetModal,
│       │                        CommandPalette (Ctrl+K), Markdown (+Mermaid), …
│       ├── data/
│       │   ├── template.ts    ← the canonical 50-section template (SectionId union)
│       │   └── catalog.ts     ← all categories + skills + contentStatus
│       ├── content/
│       │   ├── types.ts       ← SkillContent = Record<SectionId, string>
│       │   ├── index.ts       ← skill content registry (lazy loaders)
│       │   ├── skills/        ← one .ts file per completed skill (python.ts = reference)
│       │   └── cheatsheets/   ← types.ts, index.ts (registry), one .ts per sheet
│       └── lib/storage.ts     ← localStorage hooks: bookmarks, progress, theme
└── api/                       ← FastAPI backend, managed with uv
    └── app/
        ├── main.py            ← app factory
        ├── core/              ← config, db, security (bcrypt + JWT)
        ├── models/            ← SQLAlchemy models
        └── api/v1/            ← routers: health, auth (register/login/me/OAuth)
```

## Golden rules

1. **Never break the 50-section contract.** `SkillContent` is
   `Record<SectionId, string>` — every skill file must fill all 50 keys or it
   won't compile. Never weaken this type.
2. **Content markdown conventions** (inside skill .ts template literals):
   - Code blocks use `~~~lang` fences (NOT backtick fences — avoids escaping).
   - No backticks and no `${` sequences anywhere in content strings.
   - Mermaid diagrams: `~~~mermaid` fences; they render live.
3. **Adding a skill's content** takes exactly four changes:
   a. `web/src/content/skills/<slug>.ts` (all 50 sections),
   b. register in `web/src/content/index.ts`,
   c. cheat sheet: `web/src/content/cheatsheets/<slug>.ts` + register in its `index.ts`,
   d. flip the skill's `status` to `"done"` in `web/src/data/catalog.ts`.
   Then update the "ai-engineer-os-tracker" artifact (mark the skill done).
4. **Quality bar** = `python.ts`. Match or beat its depth per section. Follow
   `SKILL_BUILD_PROMPT.md` verbatim when authoring skills.
5. **Verify before finishing**: `npm run typecheck` and `npm run build` in
   `web/` must pass with zero errors.
6. Slugs are kebab-case and must match `catalog.ts` exactly.
7. Passwords are bcrypt-hashed server-side; JWTs signed with `AEOS_JWT_SECRET`.
   Never store or log plaintext passwords. OAuth credentials come from env vars
   (see `api/.env.example`) — never hardcode.

## Commands

```bash
# web
cd web && npm install && npm run dev     # http://localhost:3000
npm run typecheck && npm run build       # must be green before delivery

# api (uv-managed)
cd api && uv sync
uv run uvicorn app.main:app --reload     # http://localhost:8000/docs
uv run pytest
```

## Design system (web)

Colors via CSS variables in `globals.css` (`--surface`, `--ink`, `--accent`, `--line`),
consumed through Tailwind (`bg-surface`, `text-ink-muted`, `border-line`, `text-accent`).
Dark mode = `.dark` class on `<html>`, default dark, persisted at `aeos:theme`.
Icons: lucide-react. Keep components small, typed, client components only when interactive.

## Current status

- Platform UI complete (dashboard, catalog, skill pages, cheat sheet modal,
  search palette, bookmarks, progress, roadmap, auth).
- Skills done: **python**, **javascript** (content + cheat sheets). Remaining
  157 tracked in the "ai-engineer-os-tracker" artifact.
- Backend: health + auth implemented; phase 2 will add synced progress/bookmarks,
  PostgreSQL, and AI chat.
- Admin console at `/admin` (nav link + page render only for admins; writes
  enforced server-side via `require_admin`). Admins = emails in
  `AEOS_ADMIN_EMAILS` (JSON list), promoted on sign-in/up. Flags live in the
  `app_settings` table, read publicly via `GET /api/v1/settings`, written via
  `PUT /api/v1/admin/settings`:
  - `signup_enabled` — off hides the sign-in/up entry and blocks new
    registrations server-side (`/auth` stays reachable by direct URL so
    admins can't lock themselves out).
  - `disabled_skills` — slugs hidden from catalog, search, roadmap,
    dashboard, bookmarks, progress, and the skill page itself
    (`useEnabledSkills()` in `web/src/lib/settings.ts`).

## Phase 2 (planned, do not start unless asked)

PostgreSQL + Alembic migrations, Redis caching/rate-limits, Celery jobs,
Meilisearch full-text search, AI tutor (SSE streaming), synced user state.
