"use client";

import Link from "next/link";
import { CATEGORIES } from "@/data/catalog";
import { useEnabledSkills } from "@/lib/settings";
import { StatusBadge } from "@/components/StatusBadge";

/**
 * The master roadmap: categories in recommended learning order.
 * Category order in the catalog IS the path — fundamentals first,
 * production AI last. Per-role roadmaps (Backend / AI / MLOps tracks)
 * are a planned enhancement.
 */
export default function RoadmapPage() {
  const { skills: enabledSkills } = useEnabledSkills();
  const stages = CATEGORIES.map((c) => ({
    category: c,
    skills: enabledSkills.filter((s) => s.categoryId === c.id),
  })).filter((st) => st.skills.length > 0); // skip fully disabled categories
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Learning Roadmap</h1>
        <p className="mt-1 text-sm text-ink-muted">
          The recommended path from fundamentals to production AI engineering. Work top to bottom;
          within a stage, pick the tools your target role uses.
        </p>
      </div>

      <ol className="relative space-y-6 border-l border-line pl-6">
        {stages.map(({ category: c, skills }, i) => {
          return (
            <li key={c.id} className="relative">
              <span className="tile-3d absolute -left-[39px] flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <div className="surface-3d surface-3d-hover rounded-2xl p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span>{c.emoji}</span>
                  <h2 className="font-medium">{c.name}</h2>
                </div>
                <p className="mb-3 text-xs text-ink-muted">{c.description}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/skills/${s.slug}`}
                      className="btn-3d flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1 text-xs text-ink-muted transition-colors hover:text-accent"
                    >
                      {s.name}
                      {s.status === "done" && <StatusBadge status="done" />}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
