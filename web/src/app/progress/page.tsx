"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { CATEGORY_BY_ID, SKILL_BY_SLUG } from "@/data/catalog";
import { TEMPLATE } from "@/data/template";
import { useProgress } from "@/lib/storage";
import { useEnabledSkills } from "@/lib/settings";

export default function ProgressPage() {
  const { progress } = useProgress();
  const { isDisabled } = useEnabledSkills();
  const rows = Object.entries(progress)
    .map(([slug, sections]) => ({ skill: SKILL_BY_SLUG[slug], count: sections.length }))
    .filter((r) => r.skill && r.count > 0 && !isDisabled(r.skill.slug))
    .sort((a, b) => b.count - a.count);

  const totalRead = rows.reduce((n, r) => n + r.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Learning Progress</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {totalRead} sections read across {rows.length} skills.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-16 text-ink-faint">
          <TrendingUp size={24} />
          <p className="text-sm">
            Nothing tracked yet — open a skill and mark sections as read.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          {rows.map(({ skill, count }) => {
            const pct = Math.round((count / TEMPLATE.length) * 100);
            return (
              <Link
                key={skill.slug}
                href={`/skills/${skill.slug}`}
                className="flex items-center gap-4 border-b border-line bg-surface-raised px-4 py-3 last:border-0 hover:bg-surface"
              >
                <div className="w-40 shrink-0">
                  <div className="truncate text-sm font-medium">{skill.name}</div>
                  <div className="truncate text-[11px] text-ink-faint">
                    {CATEGORY_BY_ID[skill.categoryId]?.name}
                  </div>
                </div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                  {count}/{TEMPLATE.length} · {pct}%
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
