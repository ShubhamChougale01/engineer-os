"use client";

import { BookMarked } from "lucide-react";
import { SKILL_BY_SLUG } from "@/data/catalog";
import { useBookmarks } from "@/lib/storage";
import { useEnabledSkills } from "@/lib/settings";
import { SkillCard } from "@/components/SkillCard";

export default function BookmarksPage() {
  const { slugs } = useBookmarks();
  const { isDisabled } = useEnabledSkills();
  const skills = slugs.map((s) => SKILL_BY_SLUG[s]).filter((s) => s && !isDisabled(s.slug));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="mt-1 text-sm text-ink-muted">Skills you've saved for quick access.</p>
      </div>
      {skills.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-16 text-ink-faint">
          <BookMarked size={24} />
          <p className="text-sm">No bookmarks yet — hit the bookmark icon on any skill.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <SkillCard key={s.slug} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
