"use client";

import { useCallback, useEffect, useMemo } from "react";
import { SKILLS, type Skill } from "@/data/catalog";
import { API_BASE } from "./auth";
import { useStoredState } from "./storage";

/**
 * Admin-controlled platform flags, served by GET /api/v1/settings (public).
 * The last-known value is cached in localStorage so the UI renders correctly
 * before the fetch resolves (and keeps working if the API is down — in that
 * case everything defaults to enabled).
 */

export interface PlatformSettings {
  signup_enabled: boolean;
  disabled_skills: string[];
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  signup_enabled: true,
  disabled_skills: [],
};

let fetchedThisLoad = false; // refresh from the API once per page load

export function usePlatformSettings() {
  const [settings, setSettings] = useStoredState<PlatformSettings>(
    "aeos:platform-settings",
    DEFAULT_SETTINGS,
  );

  useEffect(() => {
    if (fetchedThisLoad) return;
    fetchedThisLoad = true;
    fetch(`${API_BASE}/api/v1/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings(data as PlatformSettings);
      })
      .catch(() => {}); // API offline → keep cached/default flags
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Admin-only: persist a partial update and adopt the server's response. */
  const save = useCallback(
    async (patch: Partial<PlatformSettings>, token: string) => {
      const res = await fetch(`${API_BASE}/api/v1/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = (data as { detail?: unknown }).detail;
        throw new Error(typeof detail === "string" ? detail : `Save failed (${res.status})`);
      }
      setSettings(data as PlatformSettings);
    },
    [setSettings],
  );

  return { settings, save };
}

/** The catalog as regular users see it: admin-disabled skills removed. */
export function useEnabledSkills() {
  const { settings } = usePlatformSettings();
  return useMemo(() => {
    const disabled = new Set(settings.disabled_skills);
    const skills: Skill[] = SKILLS.filter((s) => !disabled.has(s.slug));
    return { skills, isDisabled: (slug: string) => disabled.has(slug) };
  }, [settings.disabled_skills]);
}
