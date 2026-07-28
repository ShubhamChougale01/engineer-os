"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, CheckCircle2, ChevronLeft, Circle, ScrollText } from "lucide-react";
import type { Skill } from "@/data/catalog";
import { CATEGORY_BY_ID } from "@/data/catalog";
import { PHASES, TEMPLATE, type PhaseId, type SectionId } from "@/data/template";
import type { SkillContent } from "@/content/types";
import type { CheatSheetData } from "@/content/cheatsheets/types";
import { useBookmarks, useLastVisited, useProgress } from "@/lib/storage";
import { CheatSheetModal } from "./CheatSheetModal";
import { Markdown } from "./Markdown";
import { SkillIcon } from "./SkillIcon";
import { StatusBadge } from "./StatusBadge";

/**
 * The skill knowledge page: sticky phase-grouped TOC + all 50 sections.
 *
 * PERFORMANCE DESIGN (this page renders ~80KB of markdown + diagrams):
 * - <Section> is memoized: progress toggles and scroll-spy updates re-render
 *   ONE section (or none), never the whole page. Before this, every click
 *   re-parsed all 50 markdown sections.
 * - <LazyBody> renders a section's markdown only when it approaches the
 *   viewport (800px look-ahead). Initial render paints the visible ~3
 *   sections instead of 50; the rest hydrate as you scroll. Section shells
 *   (heading + anchor id) always render, so the TOC and #links still work.
 * - Mermaid diagrams additionally gate themselves (see Mermaid.tsx).
 */

/* ---------- Lazy section body ---------- */

function LazyBody({ eager, children }: { eager: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(eager);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [show]);

  if (show) return <>{children}</>;
  // Reserve approximate space so scroll position and TOC anchors stay sane.
  return <div ref={ref} className="min-h-[120px]" aria-hidden />;
}

/* ---------- One memoized section ---------- */

interface SectionProps {
  sectionId: SectionId;
  title: string;
  content: string | null;
  isDone: boolean;
  eager: boolean;
  onToggle: (sectionId: string) => void;
}

const Section = memo(function Section({
  sectionId,
  title,
  content,
  isDone,
  eager,
  onToggle,
}: SectionProps) {
  return (
    <section id={sectionId} className="scroll-mt-20">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => onToggle(sectionId)}
          aria-label={isDone ? "Mark as unread" : "Mark as read"}
          title={isDone ? "Mark as unread" : "Mark as read"}
          className={`btn-3d ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors ${
            isDone
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-surface-raised text-ink-faint hover:text-ink"
          }`}
        >
          {isDone ? <CheckCircle2 size={13} /> : <Circle size={13} />}
          {isDone ? "Read" : "Mark read"}
        </button>
      </div>
      {content ? (
        <LazyBody eager={eager}>
          <Markdown>{content}</Markdown>
        </LazyBody>
      ) : (
        <p className="rounded-lg border border-dashed border-line px-4 py-3 text-sm text-ink-faint">
          Content coming soon.
        </p>
      )}
    </section>
  );
});

/* ---------- The page ---------- */

export function SkillDetail({
  skill,
  content,
  cheatSheet,
}: {
  skill: Skill;
  content: SkillContent | null;
  cheatSheet?: CheatSheetData | null;
}) {
  const { isBookmarked, toggle } = useBookmarks();
  const { progress, toggleSection } = useProgress();
  const { record } = useLastVisited();
  const [activeSection, setActiveSection] = useState<string>(TEMPLATE[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);

  const done = useMemo(() => new Set(progress[skill.slug] ?? []), [progress, skill.slug]);
  const pct = Math.round((done.size / TEMPLATE.length) * 100);
  const bookmarked = isBookmarked(skill.slug);

  const onToggleSection = useCallback(
    (sectionId: string) => toggleSection(skill.slug, sectionId),
    [toggleSection, skill.slug],
  );

  useEffect(() => record(skill.slug), [skill.slug, record]);

  // Scroll-spy: highlight the section currently in view in the TOC.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
            return;
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    TEMPLATE.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const phases = useMemo(() => {
    const grouped = new Map<PhaseId, typeof TEMPLATE>();
    for (const s of TEMPLATE) {
      if (!grouped.has(s.phase)) grouped.set(s.phase, []);
      grouped.get(s.phase)!.push(s);
    }
    return [...grouped.entries()];
  }, []);

  // The first few sections render eagerly (above the fold); the rest lazily.
  const eagerIds = useMemo(() => new Set(TEMPLATE.slice(0, 3).map((s) => s.id)), []);

  return (
    <div className="flex gap-10">
      {/* Main content */}
      <article className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2 text-xs text-ink-faint">
          <Link href="/skills" className="flex items-center gap-1 hover:text-ink">
            <ChevronLeft size={13} /> Skills
          </Link>
          <span>/</span>
          <span>{CATEGORY_BY_ID[skill.categoryId]?.name}</span>
        </div>

        <div className="mb-1 flex items-center gap-3">
          <SkillIcon
            icon={skill.icon}
            fallback={CATEGORY_BY_ID[skill.categoryId]?.emoji ?? ""}
            className="h-7 w-7 shrink-0 text-ink-muted"
          />
          <h1 className="text-3xl font-semibold tracking-tight">{skill.name}</h1>
          <StatusBadge status={skill.status} />
          <button
            onClick={() => toggle(skill.slug)}
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            className={`btn-3d rounded-full bg-surface-raised p-2 ${bookmarked ? "text-accent" : "text-ink-faint hover:text-ink"}`}
          >
            <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          {cheatSheet && (
            <button
              onClick={() => setSheetOpen(true)}
              aria-label="Open cheat sheet"
              title="Cheat sheet"
              className="btn-3d flex items-center gap-1.5 rounded-xl bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-accent"
            >
              <ScrollText size={15} />
              Cheat sheet
            </button>
          )}
        </div>
        <p className="text-sm text-ink-muted">{skill.description}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="track-3d h-1.5 flex-1 overflow-hidden rounded-full">
            <div className="fill-3d h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-ink-faint">
            {done.size}/{TEMPLATE.length} sections
          </span>
        </div>

        {!content && (
          <div className="mt-8 rounded-xl border border-dashed border-line bg-surface-raised p-6 text-sm text-ink-muted">
            The full 50-section page for <strong>{skill.name}</strong> is on the buildout roadmap.
            The complete structure it will follow is below — check the tracker for progress.
          </div>
        )}

        <div className="mt-8 space-y-12">
          {phases.map(([phaseId, sections]) => (
            <div key={phaseId}>
              <h2 className="mb-4 border-b border-line pb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                {PHASES[phaseId]}
              </h2>
              <div className="space-y-10">
                {sections.map((section) => (
                  <Section
                    key={section.id}
                    sectionId={section.id}
                    title={section.title}
                    content={content ? content[section.id] : null}
                    isDone={done.has(section.id)}
                    eager={eagerIds.has(section.id)}
                    onToggle={onToggleSection}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Sticky TOC */}
      <nav className="toc-scroll sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto pr-2 lg:block">
        {phases.map(([phaseId, sections]) => (
          <div key={phaseId} className="mb-4">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              {PHASES[phaseId]}
            </div>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                      activeSection === s.id
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {done.has(s.id) && <CheckCircle2 size={11} className="shrink-0 text-emerald-500" />}
                    <span className="truncate">{s.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {cheatSheet && (
        <CheatSheetModal sheet={cheatSheet} open={sheetOpen} onClose={() => setSheetOpen(false)} />
      )}
    </div>
  );
}
