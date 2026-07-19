"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { Skill } from "@/data/catalog";
import { TEMPLATE } from "@/data/template";
import { useBookmarks, useProgress } from "@/lib/storage";
import { StatusBadge } from "./StatusBadge";

export function SkillCard({ skill }: { skill: Skill }) {
  const { isBookmarked, toggle } = useBookmarks();
  const { progress } = useProgress();
  const done = progress[skill.slug]?.length ?? 0;
  const pct = Math.round((done / TEMPLATE.length) * 100);
  const bookmarked = isBookmarked(skill.slug);

  return (
    <div className="group relative rounded-xl border border-line bg-surface-raised p-4 transition-colors hover:border-accent/50">
      <div className="mb-1 flex items-start justify-between gap-2">
        <Link href={`/skills/${skill.slug}`} className="font-medium after:absolute after:inset-0">
          {skill.name}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(skill.slug);
          }}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className={`relative z-10 rounded p-1 transition-colors ${
            bookmarked ? "text-accent" : "text-ink-faint opacity-0 group-hover:opacity-100"
          }`}
        >
          <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="mb-3 line-clamp-2 text-xs text-ink-muted">{skill.description}</p>
      <div className="flex items-center gap-2">
        <StatusBadge status={skill.status} />
        {pct > 0 && (
          <span className="ml-auto text-[10px] tabular-nums text-ink-faint">{pct}% read</span>
        )}
      </div>
      {pct > 0 && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
