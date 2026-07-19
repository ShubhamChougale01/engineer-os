"use client";

import { useEffect } from "react";
import { Printer, X } from "lucide-react";
import type { CheatSheetData, CheatSection } from "@/content/cheatsheets/types";

const COLOR: Record<CheatSection["color"], string> = {
  violet: "bg-violet-500/15 text-violet-500 border-violet-500/30",
  blue: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  emerald: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  rose: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  cyan: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",
};

/**
 * Poster-style cheat sheet overlay — dense multi-column grid of
 * term / description / code rows, printable via the browser.
 */
export function CheatSheetModal({
  sheet,
  open,
  onClose,
}: {
  sheet: CheatSheetData;
  open: boolean;
  onClose: () => void;
}) {
  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:p-8 print:static print:bg-white print:p-0">
      <div className="relative w-full max-w-6xl rounded-2xl border border-line bg-surface shadow-2xl print:border-0 print:shadow-none">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-t-2xl border-b border-line bg-surface/95 px-5 py-3 backdrop-blur print:hidden">
          <div>
            <h2 className="text-base font-semibold leading-tight">{sheet.title}</h2>
            {sheet.subtitle && <p className="text-xs text-ink-faint">{sheet.subtitle}</p>}
          </div>
          <button
            onClick={() => window.print()}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:border-ink-faint hover:text-ink"
          >
            <Printer size={13} /> Print / PDF
          </button>
          <button
            onClick={onClose}
            aria-label="Close cheat sheet"
            className="rounded-lg p-2 text-ink-muted hover:bg-surface-raised"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sheet body — masonry-ish columns of dense sections */}
        <div className="columns-1 gap-4 p-4 md:columns-2 xl:columns-3 print:columns-3">
          {sheet.sections.map((section) => (
            <section
              key={section.title}
              className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-line bg-surface-raised"
            >
              <h3
                className={`border-b px-3 py-2 text-xs font-bold uppercase tracking-wider ${COLOR[section.color]}`}
              >
                {section.title}
              </h3>
              <table className="w-full border-collapse text-left">
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.term} className="border-b border-line/60 align-top last:border-0">
                      <td className="w-[34%] px-3 py-2">
                        <div className="text-[11px] font-bold leading-snug text-accent">
                          {row.term}
                        </div>
                        <div className="mt-0.5 text-[10.5px] leading-snug text-ink-muted">
                          {row.desc}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        {row.code && (
                          <pre className="overflow-x-auto whitespace-pre rounded-md bg-surface px-2 py-1.5 font-mono text-[10.5px] leading-[1.5] text-ink">
                            {row.code}
                          </pre>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
