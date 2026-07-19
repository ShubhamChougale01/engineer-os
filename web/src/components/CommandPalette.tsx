"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORY_BY_ID } from "@/data/catalog";
import { useEnabledSkills } from "@/lib/settings";
import { StatusBadge } from "./StatusBadge";

/**
 * Global command palette (Ctrl/⌘+K). Simple subsequence + substring matching
 * over the skill catalog — fast enough for a few hundred entries without a
 * search dependency. Meilisearch/Typesense replaces this in phase 2 when
 * full-text content search lands.
 */

function score(query: string, skill: { name: string; slug: string; description: string }): number {
  const q = query.toLowerCase();
  const name = skill.name.toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (skill.slug.includes(q)) return 50;
  if (skill.description.toLowerCase().includes(q)) return 30;
  return 0;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { skills } = useEnabledSkills();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return skills.slice(0, 8);
    return skills
      .map((s) => ({ s, sc: score(query, s) }))
      .filter((r) => r.sc > 0)
      .sort((a, b) => b.sc - a.sc)
      .slice(0, 10)
      .map((r) => r.s);
  }, [query, skills]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (slug: string) => {
    onClose();
    router.push(`/skills/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface-raised shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={16} className="text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
              if (e.key === "Enter" && results[active]) go(results[active].slug);
            }}
            placeholder="Search skills…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ink-faint"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-faint">No skills match “{query}”</li>
          )}
          {results.map((s, i) => (
            <li key={s.slug}>
              <button
                onClick={() => go(s.slug)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                  i === active ? "bg-accent-soft text-accent" : "text-ink"
                }`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="truncate text-xs text-ink-faint">
                  {CATEGORY_BY_ID[s.categoryId]?.name}
                </span>
                <span className="ml-auto">
                  <StatusBadge status={s.status} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
