# AI Engineer OS

The single place to learn every skill required to become a Senior AI / Backend / Production AI Engineer — from Python and SQL to OAuth, Kubernetes, RAG, and AI agent engineering — each as a rigorously structured, 50-section knowledge page with a dense cheat sheet.

## Monorepo Layout

```
ai-engineer-os/
├── web/   # Next.js 15 + TypeScript + Tailwind frontend (App Router) — see web/README.md
└── api/   # FastAPI backend: auth + visitor counter — see api/README.md
```

## Quick Start

```bash
# Frontend
cd web
npm install
npm run dev        # http://localhost:3000

# Backend (in a separate terminal)
cd api
uv sync
uv run uvicorn app.main:app --reload   # http://localhost:8000/docs
```

See [`web/README.md`](web/README.md) and [`api/README.md`](api/README.md) for full setup, environment variables, and scripts.

## What's Inside

- **159 skills across 28 categories** — Programming, Backend Engineering, Databases, Vector Databases, API Development, Authentication, Security, Systems Fundamentals, Computer Science, Cloud & DevOps, System Design, Observability, ML & Deep Learning, LLMs, AI Agents, RAG & Knowledge, Production AI, MLOps, and a growing set of 2026-era AI engineering categories (agent engineering, model serving, AI protocols, LLMOps, and more).
- **A never-skip-a-concept content contract** — every skill page is a TypeScript module implementing all 50 sections of the canonical template (Overview → History → Concepts → Internals → Production → Interview Prep → Cheat Sheet → Mind Map). The compiler enforces completeness.
- **Full auth** — email + password (bcrypt-hashed) and OAuth via GitHub, Google, and Apple.
- **A live content buildout tracker** so progress is visible skill-by-skill as the platform grows.

## Architecture Decisions

- **Content-as-code**: every skill page is a typed TypeScript module in `web/src/content/skills/`, keyed by the canonical 50-section template in `web/src/data/template.ts`. The compiler guarantees no section is ever skipped.
- **Skill catalog** lives in `web/src/data/catalog.ts` — every category and skill, expandable.
- **Client state** (progress, bookmarks, theme) uses localStorage hooks in `web/src/lib/storage.ts`, designed to be swapped for server-persisted state.
- **Diagrams**: Mermaid rendered client-side inside markdown, lazily loaded and viewport-gated for performance.
- **Backend**: FastAPI + SQLAlchemy 2.0, bcrypt + JWT + OAuth 2.0, a race-safe unique-visitor counter. See [`api/README.md`](api/README.md).

## Adding a New Skill's Content

1. Create `web/src/content/skills/<slug>.ts` exporting a `SkillContent` object covering all 50 sections (copy `python.ts` as the quality-bar reference — the type forces every section to be present).
2. Register it in `web/src/content/index.ts`.
3. Create the matching cheat sheet in `web/src/content/cheatsheets/<slug>.ts` and register it in `web/src/content/cheatsheets/index.ts`.
4. Flip the skill's `status` to `"done"` in `web/src/data/catalog.ts`.

See [`SKILL_BUILD_PROMPT.md`](SKILL_BUILD_PROMPT.md) for the full authoring contract, and [`CLAUDE.md`](CLAUDE.md) for project context and conventions.

## License

MIT
