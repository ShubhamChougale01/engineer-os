"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Gate + loader for the WebGL hero.
 *
 * three.js is a heavy dependency, so it is code-split and only requested on the
 * client, after mount, and only where a WebGL context actually exists. If any
 * of that fails the hero silently keeps its CSS-gradient look — nothing here is
 * load-bearing for content.
 */

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const FALLBACK_ACCENT = "#a78bfa";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function readAccent(): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  if (!raw) return FALLBACK_ACCENT;
  // globals.css stores accent as bare space-separated RGB channels (for
  // Tailwind's <alpha-value> syntax), which three.js cannot parse as-is.
  // Anything already in a CSS color form is passed straight through.
  if (/^\d+\s+\d+\s+\d+$/.test(raw)) return `rgb(${raw.replace(/\s+/g, ",")})`;
  return raw;
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroCanvas() {
  const [accent, setAccent] = useState<string | null>(null);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (!webglAvailable()) return;
    setAccent(readAccent());

    // The theme toggle swaps .dark on <html>, which changes --accent.
    const observer = new MutationObserver(() => setAccent(readAccent()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const motion = window.matchMedia(REDUCED_MOTION);
    const syncMotion = () => setAnimate(!motion.matches);
    syncMotion();
    motion.addEventListener("change", syncMotion);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", syncMotion);
    };
  }, []);

  if (!accent) return null;

  return (
    <div className="hero-canvas" aria-hidden="true">
      <HeroScene accent={accent} animate={animate} />
    </div>
  );
}
