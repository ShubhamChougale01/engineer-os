"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Layers, Sparkles } from "lucide-react";
import { CATEGORIES, SKILL_BY_SLUG } from "@/data/catalog";
import { TEMPLATE } from "@/data/template";
import { useBookmarks, useLastVisited, useProgress } from "@/lib/storage";
import { useEnabledSkills } from "@/lib/settings";
import { SkillCard } from "@/components/SkillCard";

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
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">
          Everything you need to become a Senior AI Engineer.
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          {SKILLS.length} skills across {CATEGORIES.length} categories — each one a complete{" "}
          {TEMPLATE.length}-section knowledge page from fundamentals to production and interviews.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-line bg-surface-raised p-4">
            <Icon size={16} className="mb-2 text-accent" />
            <div className="text-2xl font-semibold tabular-nums">{value}</div>
            <div className="text-xs text-ink-muted">{label}</div>
          </div>
        ))}
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
                className="group rounded-xl border border-line bg-surface-raised p-4 transition-colors hover:border-accent/50"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span>{c.emoji}</span>
                  <span className="font-medium">{c.name}</span>
                  <ArrowRight
                    size={14}
                    className="ml-auto text-ink-faint transition-transform group-hover:translate-x-0.5"
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
