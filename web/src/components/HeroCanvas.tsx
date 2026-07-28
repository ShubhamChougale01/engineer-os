"use client";

import dynamic from "next/dynamic";
import { useWebglAccent } from "@/lib/webgl";

/**
 * Gate + loader for the WebGL hero.
 *
 * three.js is a heavy dependency, so it is code-split and only requested on the
 * client, after mount, and only where a WebGL context actually exists. If any
 * of that fails the hero silently keeps its CSS-gradient look — nothing here is
 * load-bearing for content.
 */

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export function HeroCanvas() {
  const { accent, animate } = useWebglAccent();

  if (!accent) return null;

  return (
    <div className="hero-canvas" aria-hidden="true">
      <HeroScene accent={accent} animate={animate} />
    </div>
  );
}
