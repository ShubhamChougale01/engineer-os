"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Layers, Sparkles } from "lucide-react";
import { CATEGORIES, SKILL_BY_SLUG } from "@/data/catalog";
import { TEMPLATE } from "@/data/template";
import { useBookmarks, useLastVisited, useProgress } from "@/lib/storage";
import { useEnabledSkills } from "@/lib/settings";
import { SkillCard } from "@/components/SkillCard";
import { HeroCanvas } from "@/components/HeroCanvas";

export default function Dashboard() {
  const { progress } = useProgress();
  const { slugs: bookmarks } = useBookmarks();
  const { visits } = useLastVisited();
  const { skills: SKILLS, isDisabled } = useEnabledSkills();

  const ready = SKILLS.filter((s) => s.status === "done").length;
  const sectionsRead = Object.values(progress).reduce((n, arr) => n + arr.length, 0);
  const started = Object.entries(progress).filter(([, v]) => v.length > 0).length;

  const continueLearning = visits
    .map((v) => SKILL_BY_SLUG[v.slug])
    .filter((s) => s && !isDisabled(s.slug))
    .slice(0, 3);

  const stats = [
    { icon: Layers, label: "Skills in catalog", value: SKILLS.length },
    { icon: Sparkles, label: "Full pages ready", value: ready },
    { icon: BookOpen, label: "Skills started", value: started },
    { icon: CheckCircle2, label: "Sections completed", value: sectionsRead },
  ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-line bg-surface-raised/90 p-8 shadow-[var(--shadow-lg)] hero-3d">
        <div className="hero-blob one" aria-hidden="true" />
        <div className="hero-blob two" aria-hidden="true" />
        <div className="hero-blob three" aria-hidden="true" />
        <HeroCanvas />
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.45fr_1fr]">
          <div className="space-y-8">
            <span
              className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent animate-in fade-in duration-500"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            >
              AI engineer curriculum
            </span>
            <h1
              className="text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-6xl leading-[1.1]"
              style={{
                animation: "reveal-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both",
              }}
            >
              Everything you need to become a Senior AI Engineer.
            </h1>
            <p
              className="max-w-2xl text-base leading-8 text-ink-muted font-light"
              style={{
                animation: "reveal-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s both",
              }}
            >
              {SKILLS.length} skills across {CATEGORIES.length} categories — each one a complete {TEMPLATE.length}-section knowledge page from fundamentals to production and interviews.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-3d surface-3d-glass rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-faint">Built for mastery</p>
                <p className="mt-2 text-lg font-semibold text-ink">Practical guides, diagrams, and production-ready examples.</p>
              </div>
              <div className="surface-3d surface-3d-glass rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-faint">Interactive path</p>
                <p className="mt-2 text-lg font-semibold text-ink">Track progress, save bookmarks, and discover career-ready skills.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="surface-3d surface-3d-glass surface-3d-hover rounded-3xl p-4">
                <span className="tile-3d mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white">
                  <Icon size={18} />
                </span>
                <div className="text-3xl font-semibold tabular-nums">{value}</div>
                <div className="text-xs text-ink-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {continueLearning.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Continue learning
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {continueLearning.map((s) => (
              <SkillCard key={s.slug} skill={s} />
            ))}
          </div>
        </section>
      )}

      {bookmarks.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Bookmarked
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks
              .map((slug) => SKILL_BY_SLUG[slug])
              .filter((s) => s && !isDisabled(s.slug))
              .slice(0, 6)
              .map((s) => (
                <SkillCard key={s.slug} skill={s} />
              ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Categories
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const skills = SKILLS.filter((s) => s.categoryId === c.id);
            if (skills.length === 0) return null; // every skill disabled by admin
            const readyCount = skills.filter((s) => s.status === "done").length;
            return (
              <Link
                key={c.id}
                href={`/skills?category=${c.id}`}
                className="surface-3d surface-3d-hover group rounded-2xl p-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="tile-3d flex h-7 w-7 items-center justify-center rounded-lg text-sm">
                    {c.emoji}
                  </span>
                  <span className="font-medium">{c.name}</span>
                  <ArrowRight
                    size={14}
                    className="ml-auto text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </div>
                <p className="line-clamp-1 text-xs text-ink-muted">{c.description}</p>
                <p className="mt-2 text-[11px] text-ink-faint">
                  {skills.length} skills · {readyCount} ready
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
