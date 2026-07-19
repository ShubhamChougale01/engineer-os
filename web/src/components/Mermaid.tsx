"use client";

import { memo, useEffect, useId, useRef, useState } from "react";

/**
 * Client-only Mermaid renderer, optimized for pages with many diagrams:
 *
 * 1. VIEWPORT-GATED: the ~1MB mermaid library is not even imported, and no
 *    rendering happens, until the diagram scrolls near the viewport
 *    (IntersectionObserver, 600px look-ahead). Opening a page no longer pays
 *    for diagrams the user hasn't reached.
 * 2. SVG CACHE: rendered SVG is cached per chart source (module-level Map),
 *    so revisits and re-mounts are instant.
 * 3. SINGLETON INIT: the library loads once and initializes once per theme,
 *    not per diagram.
 *
 * Render errors degrade gracefully to the raw diagram source.
 */

const svgCache = new Map<string, string>();
let mermaidReady: Promise<typeof import("mermaid").default> | null = null;
let initializedTheme: string | null = null;

function loadMermaid(dark: boolean) {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then((m) => m.default);
  }
  return mermaidReady.then((mermaid) => {
    const theme = dark ? "dark" : "neutral";
    if (initializedTheme !== theme) {
      mermaid.initialize({ startOnLoad: false, theme, securityLevel: "strict" });
      initializedTheme = theme;
    }
    return mermaid;
  });
}

export const Mermaid = memo(function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(() => svgCache.get(chart) ?? null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);

  // Step 1: wait until the diagram is near the viewport.
  useEffect(() => {
    if (svg || visible) return;
    const el = placeholderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }, // start rendering slightly before arrival
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [svg, visible]);

  // Step 2: render once visible.
  useEffect(() => {
    if (!visible || svg) return;
    let cancelled = false;
    const dark = document.documentElement.classList.contains("dark");
    loadMermaid(dark)
      .then((mermaid) => mermaid.render(`m${id}`, chart))
      .then((result) => {
        if (cancelled) return;
        svgCache.set(chart, result.svg);
        setSvg(result.svg);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, svg, chart, id]);

  if (error) {
    return (
      <pre>
        <code>{chart}</code>
      </pre>
    );
  }

  if (svg) {
    return <div className="mermaid-container my-4" dangerouslySetInnerHTML={{ __html: svg }} />;
  }

  return (
    <div
      ref={placeholderRef}
      className="mermaid-container my-4 flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-line text-xs text-ink-faint"
    >
      diagram loads when visible…
    </div>
  );
});
