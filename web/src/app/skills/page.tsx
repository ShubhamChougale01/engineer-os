"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/data/catalog";
import { useEnabledSkills } from "@/lib/settings";
import { SkillCard } from "@/components/SkillCard";

function SkillsBrowser() {
  const params = useSearchParams();
  const { skills: SKILLS } = useEnabledSkills();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(params.get("category") ?? "all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SKILLS.filter(
      (s) =>
        (category === "all" || s.categoryId === category) &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.slug.includes(q) ||
          s.description.toLowerCase().includes(q)),
    );
  }, [query, category, SKILLS]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every skill follows the same 50-section template — nothing important is ever skipped.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter skills…"
            className="w-full rounded-lg border border-line bg-surface-raised py-2 pl-9 pr-3 text-sm outline-none placeholder:text-ink-faint focus:border-accent"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      {category === "all" && !query ? (
        CATEGORIES.map((c) => {
          const skills = SKILLS.filter((s) => s.categoryId === c.id);
          if (skills.length === 0) return null; // every skill disabled by admin
          return (
            <section key={c.id}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                {c.emoji} {c.name}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map((s) => (
                  <SkillCard key={s.slug} skill={s} />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SkillCard key={s.slug} skill={s} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-ink-faint">
              No skills match your filters.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense>
      <SkillsBrowser />
    </Suspense>
  );
}
