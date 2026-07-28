"use client";

import { useEffect, useState } from "react";

/**
 * Shared client-side gate for any WebGL/three.js decoration: resolves the
 * current --accent CSS var into a color three.js can parse, tracks the
 * light/dark toggle (which swaps .dark on <html>), and respects
 * prefers-reduced-motion. Returns accent === null until a WebGL context is
 * confirmed available, so callers can render nothing until then.
 */

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

export function useWebglAccent() {
  const [accent, setAccent] = useState<string | null>(null);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (!webglAvailable()) return;
    setAccent(readAccent());

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

  return { accent, animate };
}
