"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Client-side persistence (localStorage) for bookmarks, per-section progress
 * and theme. Phase 2 swaps this module for API-backed persistence — every
 * consumer goes through these hooks, so the swap is one file.
 *
 * A tiny pub/sub keeps multiple components using the same key in sync
 * within the tab (the native `storage` event only fires across tabs).
 */

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  // Hydrate after mount to avoid SSR/client markup mismatch.
  useEffect(() => {
    setValue(readJSON(key, fallback));
    const listener = () => setValue(readJSON(key, fallback));
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.get(key)?.delete(listener);
      window.removeEventListener("storage", listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(readJSON(key, fallback)) : next;
      window.localStorage.setItem(key, JSON.stringify(resolved));
      emit(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, update] as const;
}

/* ---------- Bookmarks ---------- */

export function useBookmarks() {
  const [slugs, setSlugs] = useStoredState<string[]>("aeos:bookmarks", []);
  const toggle = useCallback(
    (slug: string) =>
      setSlugs((prev) => (prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug])),
    [setSlugs],
  );
  return { slugs, toggle, isBookmarked: (slug: string) => slugs.includes(slug) };
}

/* ---------- Per-section progress ---------- */

/** progress shape: { [skillSlug]: string[] of completed sectionIds } */
export function useProgress() {
  const [progress, setProgress] = useStoredState<Record<string, string[]>>("aeos:progress", {});

  const toggleSection = useCallback(
    (slug: string, sectionId: string) =>
      setProgress((prev) => {
        const done = new Set(prev[slug] ?? []);
        done.has(sectionId) ? done.delete(sectionId) : done.add(sectionId);
        return { ...prev, [slug]: [...done] };
      }),
    [setProgress],
  );

  return { progress, toggleSection };
}

/* ---------- Continue learning ---------- */

export interface LastVisited {
  slug: string;
  at: number;
}

export function useLastVisited() {
  const [visits, setVisits] = useStoredState<LastVisited[]>("aeos:last-visited", []);
  const record = useCallback(
    (slug: string) =>
      setVisits((prev) => [{ slug, at: Date.now() }, ...prev.filter((v) => v.slug !== slug)].slice(0, 10)),
    [setVisits],
  );
  return { visits, record };
}
