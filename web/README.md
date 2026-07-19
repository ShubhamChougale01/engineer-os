# AI Engineer OS — Web

The frontend for **AI Engineer OS**: a Next.js 15 (App Router) application that renders every skill on the platform as a structured, 50-section knowledge page, complete with dense poster-style cheat sheets, progress tracking, bookmarks, and a command palette.

## Features

- **159 skills across 28 categories** — Programming, Backend, Databases, Vector Databases, API Development, Authentication, Security, Cloud & DevOps, System Design, LLMs, AI Agents, RAG, Production AI, MLOps, and more.
- **Compiler-enforced content contract** — every skill page is a `Record<SectionId, string>` covering all 50 required sections (Overview, History, Internals, Production Usage, Security, Interview Questions, Cheat Sheet, Mind Map, and more). Omitting a section is a TypeScript compile error, not a runtime surprise.
- **Cheat sheet modal** — a dedicated, color-coded, poster-style cheat sheet per skill, opened from a one-click icon next to the bookmark button.
- **Mermaid diagrams** rendered live inside markdown, lazily loaded and viewport-gated for performance.
- **Dark-mode-first UI** with a command palette, sticky table of contents, scroll-spy navigation, and per-section progress tracking.
- **Auth-aware** — sign in/up with email+password or GitHub / Google / Apple OAuth, backed by the FastAPI service in `../api`.
- **Unique visitor counter**, bookmarks, and reading progress — all backed by `localStorage` today, designed to be swapped for server-persisted state.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Markdown | react-markdown + remark-gfm |
| Diagrams | Mermaid |
| Icons | lucide-react |

## Prerequisites

- Node.js 20+
- The [`api`](../api) service running locally (for auth and the visitor counter) — optional for just browsing content

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack)
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server with Turbopack |
| `npm run dev:webpack` | Start the dev server with the classic webpack compiler |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run preview` | `build` + `start` in one step — the fastest way to browse content locally |
| `npm run lint` | Run `next lint` |
| `npm run typecheck` | Run `tsc --noEmit` |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

## Project Structure

```
web/src/
├── app/                    # Next.js App Router pages (dashboard, skills, auth, admin, ...)
├── components/             # SkillDetail, CheatSheetModal, Mermaid, AppShell, ...
├── content/
│   ├── skills/<slug>.ts        # one file per skill — the full 50-section page
│   ├── cheatsheets/<slug>.ts   # one file per skill — the cheat sheet data
│   ├── index.ts                # lazy-loaded skill content registry
│   └── cheatsheets/index.ts    # lazy-loaded cheat sheet registry
├── data/
│   ├── catalog.ts          # every category + skill + its content status
│   └── template.ts         # the canonical 50-section template (SectionId union)
└── lib/                    # storage hooks (bookmarks, progress, auth), settings
```

## Adding a New Skill

1. Create `src/content/skills/<slug>.ts` exporting a `SkillContent` object with all 50 sections (copy `python.ts` as the quality-bar reference — the `SkillContent` type will refuse to compile if a section is missing).
2. Register it in `src/content/index.ts`.
3. Create `src/content/cheatsheets/<slug>.ts` and register it in `src/content/cheatsheets/index.ts`.
4. Flip the skill's `status` to `"done"` in `src/data/catalog.ts`.

See [`SKILL_BUILD_PROMPT.md`](../SKILL_BUILD_PROMPT.md) at the repo root for the full authoring contract.

## License

MIT
