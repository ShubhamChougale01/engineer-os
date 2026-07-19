import type { CheatSheetData } from "./types";

const reflection: CheatSheetData = {
  title: "Reflection",
  subtitle: "Generate-critique-revise cycles, self- vs. external critique, and Reflexion",
  sections: [
    {
      title: "Generate-Critique-Revise",
      color: "violet",
      rows: [
        { term: "Cycle", desc: "Generate → critique (explicit criteria) → revise → repeat" },
        { term: "Explicit criteria", desc: "\"Is this good?\" is vague — tie critique to concrete requirements" },
        { term: "ALWAYS bound", desc: "max_iterations — Agent Fundamentals' loop-safety guidance" },
      ],
    },
    {
      title: "Critique Types",
      color: "blue",
      rows: [
        { term: "Self-critique", desc: "Same model, same blind spots — fundamentally limited" },
        { term: "External critique", desc: "A genuinely separate model/agent/persona — catches more" },
        { term: "External verification", desc: "Check against REAL ground truth (tests, math, facts)" },
        { term: "Rule of thumb", desc: "Objectively checkable → verification; subjective → external critique" },
      ],
    },
    {
      title: "Why Self-Critique Is Limited",
      color: "rose",
      rows: [
        { term: "Same knowledge gap", desc: "Can't reliably flag an error it doesn't recognize as an error" },
        { term: "Connects to Hallucination", desc: "Confidently wrong at generation → confidently wrong at critique" },
      ],
    },
    {
      title: "Reflexion (Persisted)",
      color: "emerald",
      rows: [
        { term: "Episodic lesson", desc: "Store why a past attempt failed (Agent Memory)" },
        { term: "Informs future attempts", desc: "Applied to genuinely separate, later task instances" },
        { term: "Over-generalization risk", desc: "Don't let one atypical failure become a general rule" },
      ],
    },
    {
      title: "Cost & Safety",
      color: "amber",
      rows: [
        { term: "Diminishing returns", desc: "More iterations help less over time, while cost keeps adding up" },
        { term: "Calibrate depth", desc: "Shallow for low-stakes/high-volume; deep+verified for high-stakes" },
        { term: "Mitigates, not eliminates", desc: "Compounding-error risk — a revision can still miss or add errors" },
        { term: "Guardrails on revisions too", desc: "A revised action isn't automatically safe" },
      ],
    },
  ],
};

export default reflection;
