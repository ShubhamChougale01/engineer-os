/**
 * The canonical 50-section knowledge template.
 *
 * EVERY skill page follows exactly this structure. The `SectionId` union is
 * used by `SkillContent` (src/content/types.ts) so TypeScript itself refuses
 * to compile a skill that skips a section — the "never miss a concept"
 * guarantee is enforced by the compiler, not by convention.
 */

export interface SectionDef {
  id: SectionId;
  title: string;
  /** Grouping used for the sticky table of contents. */
  phase: PhaseId;
}

export type PhaseId =
  | "foundations"
  | "concepts"
  | "internals"
  | "production"
  | "quality"
  | "practice"
  | "ecosystem"
  | "revision"
  | "resources";

export const PHASES: Record<PhaseId, string> = {
  foundations: "Foundations",
  concepts: "Concepts (Beginner → Advanced)",
  internals: "Internals & Architecture",
  production: "Production",
  quality: "Quality & Operations",
  practice: "Interview & Practice",
  ecosystem: "Ecosystem & Comparisons",
  revision: "Revision Toolkit",
  resources: "Resources",
};

export type SectionId =
  | "overview" | "history" | "why-it-exists" | "problem-it-solves"
  | "learning-objectives" | "prerequisites"
  | "beginner-concepts" | "intermediate-concepts" | "advanced-concepts"
  | "internal-working" | "architecture" | "data-flow"
  | "production-usage" | "industry-examples" | "best-practices" | "anti-patterns"
  | "performance" | "scalability" | "security"
  | "testing" | "debugging" | "monitoring" | "deployment" | "production-checklist"
  | "common-mistakes" | "common-errors" | "faqs"
  | "interview-questions" | "coding-questions" | "hands-on-labs"
  | "real-projects" | "case-studies"
  | "comparisons" | "related-technologies" | "latest-updates" | "future-roadmap"
  | "cheat-sheet" | "flash-cards" | "mcqs" | "revision-notes" | "learning-roadmap"
  | "official-docs" | "books" | "blogs" | "research-papers" | "videos"
  | "github-repos" | "practice-problems"
  | "architecture-diagram" | "mind-map";

export const TEMPLATE: SectionDef[] = [
  { id: "overview", title: "Overview", phase: "foundations" },
  { id: "history", title: "History", phase: "foundations" },
  { id: "why-it-exists", title: "Why It Exists", phase: "foundations" },
  { id: "problem-it-solves", title: "Problem It Solves", phase: "foundations" },
  { id: "learning-objectives", title: "Learning Objectives", phase: "foundations" },
  { id: "prerequisites", title: "Prerequisites", phase: "foundations" },

  { id: "beginner-concepts", title: "Beginner Concepts", phase: "concepts" },
  { id: "intermediate-concepts", title: "Intermediate Concepts", phase: "concepts" },
  { id: "advanced-concepts", title: "Advanced Concepts", phase: "concepts" },

  { id: "internal-working", title: "Internal Working", phase: "internals" },
  { id: "architecture", title: "Architecture", phase: "internals" },
  { id: "data-flow", title: "Data Flow", phase: "internals" },

  { id: "production-usage", title: "Production Usage", phase: "production" },
  { id: "industry-examples", title: "Industry Examples", phase: "production" },
  { id: "best-practices", title: "Best Practices", phase: "production" },
  { id: "anti-patterns", title: "Anti-Patterns", phase: "production" },
  { id: "performance", title: "Performance", phase: "production" },
  { id: "scalability", title: "Scalability", phase: "production" },
  { id: "security", title: "Security", phase: "production" },

  { id: "testing", title: "Testing", phase: "quality" },
  { id: "debugging", title: "Debugging", phase: "quality" },
  { id: "monitoring", title: "Monitoring", phase: "quality" },
  { id: "deployment", title: "Deployment", phase: "quality" },
  { id: "production-checklist", title: "Production Checklist", phase: "quality" },
  { id: "common-mistakes", title: "Common Mistakes", phase: "quality" },
  { id: "common-errors", title: "Common Errors", phase: "quality" },
  { id: "faqs", title: "FAQs", phase: "quality" },

  { id: "interview-questions", title: "Interview Questions", phase: "practice" },
  { id: "coding-questions", title: "Coding Questions", phase: "practice" },
  { id: "hands-on-labs", title: "Hands-on Labs", phase: "practice" },
  { id: "real-projects", title: "Real Projects", phase: "practice" },
  { id: "case-studies", title: "Real Company Case Studies", phase: "practice" },

  { id: "comparisons", title: "Comparisons", phase: "ecosystem" },
  { id: "related-technologies", title: "Related Technologies", phase: "ecosystem" },
  { id: "latest-updates", title: "Latest Updates", phase: "ecosystem" },
  { id: "future-roadmap", title: "Future Roadmap", phase: "ecosystem" },

  { id: "cheat-sheet", title: "Cheat Sheet", phase: "revision" },
  { id: "flash-cards", title: "Flash Cards", phase: "revision" },
  { id: "mcqs", title: "MCQs", phase: "revision" },
  { id: "revision-notes", title: "Revision Notes", phase: "revision" },
  { id: "learning-roadmap", title: "Learning Roadmap", phase: "revision" },

  { id: "official-docs", title: "Official Documentation", phase: "resources" },
  { id: "books", title: "Books", phase: "resources" },
  { id: "blogs", title: "Blogs", phase: "resources" },
  { id: "research-papers", title: "Research Papers", phase: "resources" },
  { id: "videos", title: "Videos", phase: "resources" },
  { id: "github-repos", title: "GitHub Repositories", phase: "resources" },
  { id: "practice-problems", title: "Practice Problems", phase: "resources" },
  { id: "architecture-diagram", title: "Architecture Diagram", phase: "resources" },
  { id: "mind-map", title: "Mind Map", phase: "resources" },
];

export const SECTION_BY_ID: Record<SectionId, SectionDef> = Object.fromEntries(
  TEMPLATE.map((s) => [s.id, s]),
) as Record<SectionId, SectionDef>;
