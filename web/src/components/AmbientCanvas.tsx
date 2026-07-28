"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useWebglAccent } from "@/lib/webgl";

/**
 * App-wide background accent: the same knowledge-graph scene as the
 * dashboard hero, but centered, slower, and faded to a texture rather than a
 * focal point. Mounted once in AppShell so every non-dashboard route feels
 * consistent with the hero instead of going flat the moment you navigate.
 *
 * Deliberately idle-deferred: this is decoration, not content, so it waits
 * until the browser is idle (or ~1.2s, whichever first) before triggering
 * the three.js chunk at all — real navigation/interaction stays off its
 * critical path, and in dev this keeps it out of a route's first compile.
 */

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

function useIdle(timeoutMs: number): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setIdle(true));
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setIdle(true), timeoutMs);
    return () => window.clearTimeout(id);
  }, [timeoutMs]);

  return idle;
}

export function AmbientCanvas() {
  const idle = useIdle(1200);
  const { accent, animate } = useWebglAccent();

  if (!idle || !accent) return null;

  return (
    <div className="ambient-canvas" aria-hidden="true">
      <HeroScene accent={accent} animate={animate} variant="ambient" />
    </div>
  );
}
