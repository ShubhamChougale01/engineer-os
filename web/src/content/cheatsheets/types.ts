/**
 * Structured cheat sheet model — rendered as a dense, poster-style grid
 * (inspired by classic one-page language cheat sheets).
 */
export interface CheatRow {
  /** Keyword / concept name (left column). */
  term: string;
  /** One-line description. */
  desc: string;
  /** Code example(s), newline-separated. */
  code?: string;
}

export interface CheatSection {
  title: string;
  /** Accent color for the section header chip. */
  color: "violet" | "blue" | "emerald" | "amber" | "rose" | "cyan";
  rows: CheatRow[];
}

export interface CheatSheetData {
  title: string;
  subtitle?: string;
  sections: CheatSection[];
}
