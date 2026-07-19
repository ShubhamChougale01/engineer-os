# SKILL BUILD PROMPT — AI Engineer OS

> Usage: start a session with
> **"Read CLAUDE.md and SKILL_BUILD_PROMPT.md in ai-engineer-os, then build the skill: `<slug>`"**
> Everything below is the contract for that work. Follow it completely.

---

## ROLE

You are a Principal Engineer and world-class technical educator writing the
definitive knowledge page for ONE skill on the AI Engineer OS platform. The
result must be better than Wikipedia, Roadmap.sh, GeeksForGeeks, Medium, and
the official docs combined — suitable for college students, working
professionals, senior engineers, interview preparation, and production work.

## INPUTS

- The skill slug (must exist in `web/src/data/catalog.ts`).
- The reference implementation: `web/src/content/skills/python.ts` and
  `web/src/content/cheatsheets/python.ts` — match or exceed their depth.

## NON-NEGOTIABLE RULES

1. Produce ALL 50 sections. Never skip, merge, thin out, or placeholder a
   section. The `SkillContent` type will refuse to compile if a key is missing
   — but your duty is depth, not just presence.
2. Never assume prior knowledge beyond the skill's stated prerequisites.
   Beginner → Intermediate → Advanced must be a real staircase: no jumping.
3. Every concept must answer: what is it, why does it exist, how does it work
   internally, where is it used in production, what are the tradeoffs.
4. Every code example must be runnable, commented, idiomatic, and include at
   least one production consideration (error handling, timeout, edge case).
5. Connect concepts: reference related skills on the platform by name
   (e.g. "see the **Redis** skill") so dependency links can be built.
6. Facts you are not certain of (versions, dates, benchmarks): state your
   knowledge cutoff honestly or verify with web search. Never invent numbers,
   paper titles, book editions, or URLs.
7. No fluff. No marketing prose. Every paragraph must teach something.

## FILE MECHANICS (exactly these changes)

1. Create `web/src/content/skills/<slug>.ts`:
   - `import type { SkillContent } from "../types";`
   - `const <name>: SkillContent = { ... all 50 keys ... }; export default <name>;`
   - Markdown inside template literals. **Code fences use `~~~lang` (never
     backtick fences). Zero backtick characters and zero `${` sequences
     anywhere in the content.** Inline code → bold or quotes instead.
   - Mermaid: `~~~mermaid` fences. Use flowchart / sequenceDiagram / mindmap.
2. Register it in `web/src/content/index.ts` REGISTRY.
3. Create the cheat sheet `web/src/content/cheatsheets/<slug>.ts`
   (spec below) and register it in `web/src/content/cheatsheets/index.ts`.
4. Flip the skill to `"done"` in `web/src/data/catalog.ts` (status field).
5. Update the Cowork artifact `ai-engineer-os-tracker`: mark this skill `"d"`
   in its DATA constant and refresh the stats (use update_artifact).
6. Verify: `npm run typecheck` and `npm run build` in `web/` — zero errors.
   Confirm the built page contains all 50 section ids.

## THE 50 SECTIONS — CONTENT REQUIREMENTS

Foundations
1.  **overview** — what it is, why it matters to an AI engineer, key characteristics. 3+ paragraphs.
2.  **history** — origin story + milestone table (year → event). Who made it and why.
3.  **why-it-exists** — the gap it filled; the world before it.
4.  **problem-it-solves** — concrete pains removed; also what it deliberately does NOT solve.
5.  **learning-objectives** — 6–10 measurable "you will be able to…" outcomes.
6.  **prerequisites** — required vs helpful; link related platform skills.

Concepts (the core — be generous)
7.  **beginner-concepts** — from absolute zero. Every fundamental with a code example. Multiple subsections.
8.  **intermediate-concepts** — the working-professional layer. Multiple subsections with code.
9.  **advanced-concepts** — the senior layer: internals-adjacent topics, concurrency, edge semantics, decision tables.

Internals & Architecture
10. **internal-working** — how it ACTUALLY works under the hood, step by step. Include a mermaid diagram.
11. **architecture** — runtime/system architecture + how applications should be structured around it. Diagram or layout tree.
12. **data-flow** — trace one request/operation end to end. Mermaid sequence diagram.

Production
13. **production-usage** — how real teams run it: tooling, config, project layout, operational defaults.
14. **industry-examples** — 4+ named companies and what they specifically do with it.
15. **best-practices** — 8–12 numbered, opinionated, justified.
16. **anti-patterns** — the classic mistakes with code showing wrong → right.
17. **performance** — measurement tools first, then an ordered optimization hierarchy with concrete numbers where known.
18. **scalability** — vertical/horizontal story, bottleneck table, diagram if useful.
19. **security** — technology-specific attack surface + defenses. Reference security skills.

Quality & Operations
20. **testing** — framework, runnable test examples, senior testing doctrine.
21. **debugging** — tool escalation path with commands.
22. **monitoring** — what to measure, with instrumentation code.
23. **deployment** — production-grade Dockerfile/config with per-line justification.
24. **production-checklist** — 12–16 checkbox items, each verifiable.
25. **common-mistakes** — 8–10 with the WHY behind each.
26. **common-errors** — table: error → typical cause → fix.
27. **faqs** — 6–8 real questions with direct answers.

Interview & Practice
28. **interview-questions** — 10–12 split junior/senior, each WITH a model answer sketch.
29. **coding-questions** — 2–3 full problems with commented solutions + complexity + follow-ups.
30. **hands-on-labs** — 3–4 labs (beginner→production) with deliverables and skills exercised.
31. **real-projects** — 2–3 portfolio-grade project specs with engineering requirements.
32. **case-studies** — 3–4 real company stories with the LESSON each teaches.

Ecosystem
33. **comparisons** — honest table vs 3–5 alternatives + "how seniors choose".
34. **related-technologies** — annotated list, linking platform skills for the learning path.
35. **latest-updates** — dated, honest about knowledge cutoff; verify with search when possible.
36. **future-roadmap** — where it's heading; what to bet career time on.

Revision Toolkit
37. **cheat-sheet** — one dense fenced code block of the essentials (this is the in-page version; the modal sheet is separate).
38. **flash-cards** — 12–15 Q/A table rows.
39. **mcqs** — 5–6 questions with answers AND explanations.
40. **revision-notes** — the whole skill compressed into ~5 tight paragraphs.
41. **learning-roadmap** — week-by-week plan with milestones; ends by naming the next platform skill.

Resources (verify or hedge every item)
42. **official-docs** — annotated links.
43. **books** — 4–7 with one-line "why this one".
44. **blogs** — high-signal only.
45. **research-papers** — real papers only; if thin for this topic, say so and give the closest foundational reading.
46. **videos** — named talks/creators with why.
47. **github-repos** — 6–9 annotated.
48. **practice-problems** — ordered by skill focus + external sets.
49. **architecture-diagram** — one meaningful mermaid diagram of the reference production architecture.
50. **mind-map** — mermaid mindmap covering the whole skill tree.

## CHEAT SHEET SPEC (the modal poster)

File: `web/src/content/cheatsheets/<slug>.ts`, type `CheatSheetData`.

- `title`: "The Ultimate <Skill> Cheat Sheet"; short subtitle.
- 5–7 sections, each with a distinct `color` (violet | blue | emerald | amber | rose | cyan).
- 6–18 rows per section; 40–70 rows total. Each row: `term` (concept),
  `desc` (one line), `code` (2–6 short lines, newline-separated).
- Coverage order: core syntax/keywords → data structures/core objects →
  everyday idioms → power features → pitfalls/gotchas → production toolbelt.
- Someone who read the full page should be able to work from the sheet alone.
- Same string rules: no backticks, no `${`.

## DEFINITION OF DONE

- [ ] All 50 sections written to the python.ts quality bar
- [ ] Cheat sheet created and registered
- [ ] Content + cheat sheet registries updated; catalog status = "done"
- [ ] typecheck + build green; page verified to render
- [ ] Tracker artifact updated (skill marked done, stats refreshed)
- [ ] One-paragraph summary to the user: what was built, what's next
