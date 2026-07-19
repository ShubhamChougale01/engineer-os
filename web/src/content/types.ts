import type { SectionId } from "@/data/template";

/**
 * A skill's full knowledge page: markdown content for EVERY section of the
 * 50-section template. Because this is a `Record<SectionId, string>`, omitting
 * any section is a compile error — the template can never be silently skipped.
 *
 * Markdown supports GFM (tables, task lists) and Mermaid code fences
 * (```mermaid) which render as live diagrams.
 */
export type SkillContent = Record<SectionId, string>;
