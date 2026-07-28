"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookMarked,
  Command,
  LayoutDashboard,
  Library,
  Map,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  TrendingUp,
  UserCircle,
  X,
} from "lucide-react";
import { AmbientCanvas } from "./AmbientCanvas";
import { CommandPalette } from "./CommandPalette";
import { VisitorCounter } from "./VisitorCounter";
import { useAuth } from "@/lib/auth";
import { usePlatformSettings } from "@/lib/settings";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/skills", label: "Skills", icon: Library },
  { href: "/roadmaps", label: "Roadmap", icon: Map },
  { href: "/bookmarks", label: "Bookmarks", icon: BookMarked },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("aeos:theme", next ? "dark" : "light");
  };
  return { dark, toggle };
}

function AccountLink() {
  const { user } = useAuth();
  const { settings } = usePlatformSettings();
  // Admin turned auth off → no sign-in entry for anonymous visitors.
  // (Signed-in users keep their account entry; /auth stays reachable by URL.)
  if (!user && !settings.signup_enabled) return null;
  return (
    <Link
      href="/auth"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
    >
      {user ? (
        <>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-ink">{user.name}</span>
            <span className="block truncate text-[10px] text-ink-faint">{user.email}</span>
          </span>
        </>
      ) : (
        <>
          <UserCircle size={16} />
          Sign in
        </>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  // The Admin entry exists only for admins; the page double-checks via the API.
  const nav = user?.is_admin ? [...NAV, { href: "/admin", label: "Admin", icon: ShieldCheck }] : NAV;

  // Global ⌘K / Ctrl+K shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navItems = nav.map(({ href, label, icon: Icon }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileNav(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          active
            ? "bg-accent-soft text-accent font-medium"
            : "text-ink-muted hover:bg-surface-raised hover:text-ink"
        }`}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  });

  const isDashboard = pathname === "/";
  // The skill detail route already loads mermaid + react-markdown + a large
  // content file — skip the decorative canvas there so its cold compile and
  // runtime cost stay dedicated to actual content.
  const isSkillDetail = pathname.startsWith("/skills/");

  return (
    <div className="flex min-h-screen">
      {/* Every other route gets a faded version of the hero's knowledge-graph
          as a background texture; the dashboard already has its own
          full-strength scene inside the hero section. */}
      {!isDashboard && !isSkillDetail && <AmbientCanvas />}

      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="tile-3d flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white">
            AI
          </span>
          <span className="text-sm font-semibold tracking-tight">Engineer OS</span>
        </Link>
        <nav className="flex flex-col gap-1">{navItems}</nav>
        <div className="mt-auto">
          <AccountLink />
          <div className="mt-3 px-2 text-[11px] text-ink-faint">
            v0.2 · content buildout in progress
          </div>
        </div>
      </aside>

      {/* Mobile nav drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-surface p-4">
            <button
              onClick={() => setMobileNav(false)}
              aria-label="Close navigation"
              className="btn-3d mb-4 rounded-xl p-2 text-ink-muted hover:bg-surface-raised"
            >
              <X size={18} />
            </button>
            <nav className="flex flex-col gap-1">{navItems}</nav>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur">
          <button
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
            className="btn-3d rounded-xl p-2 text-ink-muted hover:bg-surface-raised md:hidden"
          >
            <Menu size={18} />
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex flex-1 max-w-md items-center gap-2 rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm text-ink-faint hover:border-ink-faint"
          >
            <Command size={14} />
            Search skills…
            <kbd className="ml-auto rounded border border-line px-1.5 text-[10px]">Ctrl K</kbd>
          </button>
          <VisitorCounter />
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="btn-3d ml-auto rounded-full bg-surface-raised p-2 text-ink-muted hover:text-accent"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
