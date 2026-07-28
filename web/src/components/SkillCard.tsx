"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { Skill } from "@/data/catalog";
import { TEMPLATE } from "@/data/template";
import { useBookmarks, useProgress } from "@/lib/storage";
import { StatusBadge } from "./StatusBadge";

export function SkillCard({ skill, index = 0 }: { skill: Skill; index?: number }) {
  const { isBookmarked, toggle } = useBookmarks();
  const { progress } = useProgress();
  const done = progress[skill.slug]?.length ?? 0;
  const pct = Math.round((done / TEMPLATE.length) * 100);
  const bookmarked = isBookmarked(skill.slug);
  // Cap the stagger so a long grid doesn't leave the last row waiting seconds
  // to appear — it wraps every 8 cards instead of growing unbounded.
  const delay = (index % 8) * 0.05;

  return (
    <div
      className="surface-3d surface-3d-hover group relative rounded-2xl p-4 transition-all duration-300"
      style={{
        animation: `reveal-up 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
      }}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <Link
          href={`/skills/${skill.slug}`}
          className="font-medium after:absolute after:inset-0 transition-colors group-hover:text-accent"
        >
          {skill.name}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(skill.slug);
          }}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className={`btn-3d relative z-10 rounded-full p-1.5 transition-all duration-200 ${
            bookmarked
              ? "bg-accent-soft text-accent"
              : "text-ink-faint opacity-0 group-hover:opacity-100"
          } group-hover:scale-110`}
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
        <div className="track-3d mt-2 h-1.5 overflow-hidden rounded-full">
          <div
            className="fill-3d h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
