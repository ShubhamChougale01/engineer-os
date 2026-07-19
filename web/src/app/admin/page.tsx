"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search, ShieldCheck, UserPlus } from "lucide-react";
import { CATEGORIES, SKILLS } from "@/data/catalog";
import { API_BASE, useAuth, type AuthUser } from "@/lib/auth";
import { usePlatformSettings } from "@/lib/settings";

/**
 * Admin console. The nav link only renders for admins, and this page
 * verifies the role against GET /auth/me — but the real enforcement is
 * server-side: PUT /admin/settings requires an admin JWT. Non-admins who
 * guess the URL see a generic not-found view.
 */

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-accent" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function NotFoundView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-ink-muted">The page you are looking for does not exist.</p>
      <Link href="/" className="text-sm text-accent hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

export default function AdminPage() {
  const { token } = useAuth();
  const { settings, save } = usePlatformSettings();
  const [access, setAccess] = useState<"pending" | "admin" | "denied">("pending");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Verify the role server-side — the cached session isn't trusted here.
  useEffect(() => {
    if (token === null) {
      // localStorage hydrates after mount; give it a beat before denying.
      const t = setTimeout(() => setAccess((a) => (a === "pending" ? "denied" : a)), 400);
      return () => clearTimeout(t);
    }
    fetch(`${API_BASE}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u: AuthUser | null) => setAccess(u?.is_admin ? "admin" : "denied"))
      .catch(() => setAccess("denied"));
  }, [token]);

  const disabled = useMemo(() => new Set(settings.disabled_skills), [settings.disabled_skills]);

  const persist = async (patch: Parameters<typeof save>[0]) => {
    setError(null);
    try {
      await save(patch, token!);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saving failed");
    }
  };

  const toggleSkill = (slug: string) => {
    const next = new Set(disabled);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    void persist({ disabled_skills: [...next] });
  };

  const setCategory = (categoryId: string, enable: boolean) => {
    const next = new Set(disabled);
    SKILLS.filter((s) => s.categoryId === categoryId).forEach((s) =>
      enable ? next.delete(s.slug) : next.add(s.slug),
    );
    void persist({ disabled_skills: [...next] });
  };

  if (access === "pending") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-faint">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }
  if (access === "denied") return <NotFoundView />;

  const q = query.trim().toLowerCase();
  const enabledCount = SKILLS.length - disabled.size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldCheck size={22} className="text-accent" /> Admin
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Platform controls. Changes apply immediately for every visitor.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
          {error}
        </p>
      )}

      {/* Sign-up control */}
      <section className="rounded-xl border border-line bg-surface-raised p-5">
        <div className="flex items-center gap-3">
          <UserPlus size={18} className="text-accent" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Sign up / Sign in</h2>
            <p className="text-xs text-ink-muted">
              When off, the sign-in entry disappears from the sidebar and new registrations are
              rejected by the server. Existing users (including you) can still sign in at{" "}
              <code className="rounded bg-surface px-1">/auth</code> by direct link, so admins are
              never locked out.
            </p>
          </div>
          <Toggle
            on={settings.signup_enabled}
            onChange={(next) => void persist({ signup_enabled: next })}
            label="Allow sign up and sign in"
          />
        </div>
      </section>

      {/* Skill enable/disable */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="text-sm font-semibold">Skills</h2>
            <p className="text-xs text-ink-muted">
              Disabled skills vanish from the catalog, search, roadmap, and dashboard for users.{" "}
              <span className="tabular-nums">
                {enabledCount}/{SKILLS.length}
              </span>{" "}
              enabled.
            </p>
          </div>
          <label className="relative sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter skills…"
              className="w-full rounded-lg border border-line bg-surface-raised py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-ink-faint focus:border-accent"
            />
          </label>
        </div>

        {CATEGORIES.map((c) => {
          const skills = SKILLS.filter(
            (s) =>
              s.categoryId === c.id &&
              (!q || s.name.toLowerCase().includes(q) || s.slug.includes(q)),
          );
          if (skills.length === 0) return null;
          const catDisabled = skills.filter((s) => disabled.has(s.slug)).length;
          return (
            <div key={c.id} className="rounded-xl border border-line bg-surface-raised">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <span className="text-sm font-medium">
                  {c.emoji} {c.name}
                </span>
                <span className="text-[11px] tabular-nums text-ink-faint">
                  {skills.length - catDisabled}/{skills.length} enabled
                </span>
                <div className="ml-auto flex gap-2 text-[11px]">
                  <button
                    onClick={() => setCategory(c.id, true)}
                    className="rounded border border-line px-2 py-0.5 text-ink-muted hover:border-accent hover:text-accent"
                  >
                    Enable all
                  </button>
                  <button
                    onClick={() => setCategory(c.id, false)}
                    className="rounded border border-line px-2 py-0.5 text-ink-muted hover:border-rose-500/50 hover:text-rose-500"
                  >
                    Disable all
                  </button>
                </div>
              </div>
              <ul className="grid gap-x-6 px-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map((s) => {
                  const off = disabled.has(s.slug);
                  return (
                    <li key={s.slug} className="flex items-center gap-3 py-1.5">
                      <span
                        className={`min-w-0 flex-1 truncate text-sm ${
                          off ? "text-ink-faint line-through" : "text-ink"
                        }`}
                      >
                        {s.name}
                      </span>
                      <Toggle
                        on={!off}
                        onChange={() => toggleSkill(s.slug)}
                        label={`${off ? "Enable" : "Disable"} ${s.name}`}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
