"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { API_BASE } from "@/lib/auth";

/**
 * Unique-visitor counter (digits only, zero-padded to 6).
 *
 * Contract with the backend (/api/v1/visitors):
 * - POST /register is called ONLY on the Dashboard ("/") — it registers a
 *   first-time visitor and returns the total. It is idempotent per browser:
 *   the HttpOnly UUID cookie means refreshes and revisits never increment.
 * - Every other page calls GET /count, which can never increment.
 *
 * credentials: "include" is required so the identifying cookie rides along
 * cross-origin (frontend :3000 → API :8000). If the API is unreachable the
 * component renders nothing — the header stays clean.
 */
export function VisitorCounter() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);
  const registered = useRef(false); // guards StrictMode double-effect in dev

  useEffect(() => {
    const isHome = pathname === "/";
    // Register once per app load, and only from the Dashboard. Other pages
    // (and Home after the first registration) just read the total.
    const path =
      isHome && !registered.current ? "/api/v1/visitors/register" : "/api/v1/visitors/count";
    const method = path.endsWith("/register") ? "POST" : "GET";
    if (method === "POST") registered.current = true;

    const ctrl = new AbortController();
    fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { count: number } | null) => {
        if (data && typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        /* API offline — render nothing */
      });
    return () => ctrl.abort();
  }, [pathname]);

  if (count === null) return null;

  return (
    <span
      title={String(count)}
      className="select-none rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 font-mono text-xs tabular-nums tracking-widest text-ink-muted"
    >
      {String(count).padStart(6, "0")}
    </span>
  );
}
