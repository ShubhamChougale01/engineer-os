import type { CheatSheetData } from "./types";

const planning: CheatSheetData = {
  title: "Planning",
  subtitle: "Task decomposition, reactive vs. upfront planning, and plan revision",
  sections: [
    {
      title: "Strategy Selection",
      color: "violet",
      rows: [
        { term: "Reactive (ReAct-style)", desc: "One step at a time — best for unpredictable tasks" },
        { term: "Upfront (plan-and-execute)", desc: "Full plan before executing — best for structured, interdependent tasks" },
        { term: "Hybrid (hierarchical)", desc: "Upfront high-level plan + reactive execution within each phase" },
      ],
    },
    {
      title: "Plan-Execute-Replan",
      color: "blue",
      rows: [
        { term: "Trigger", desc: "A step's result contradicts a key plan assumption" },
        { term: "Replan", desc: "Generate a revised plan using prior results" },
        { term: "ALWAYS bound", desc: "max_replans — non-negotiable, per Agent Fundamentals" },
        { term: "Implementation substrate", desc: "LangGraph's cycles map naturally onto this pattern" },
      ],
    },
    {
      title: "Exploratory Planning",
      color: "amber",
      rows: [
        { term: "Tree-of-Thought", desc: "Generate N candidate plans, evaluate, select/synthesize the best" },
        { term: "Chain-of-Thought", desc: "One linear plan — cheaper, no comparison" },
        { term: "Cost", desc: "ToT multiplies cost by N — reserve for high-stakes/ambiguous decisions" },
      ],
    },
    {
      title: "Hierarchical Planning",
      color: "emerald",
      rows: [
        { term: "High-level plan", desc: "Phases (e.g., Research, Analysis, Writing)" },
        { term: "Detailed sub-plan", desc: "Per-phase decomposition — use when flat plans get unwieldy" },
      ],
    },
    {
      title: "Compounding Risk in Planning",
      color: "rose",
      rows: [
        { term: "Flawed premise", desc: "A hallucinated/outdated assumption compounds across every planned step" },
        { term: "Verify assumptions first", desc: "Before committing significant execution effort" },
        { term: "Guardrails on planned steps", desc: "Every planned action needs the same action-level scrutiny as reactive ones" },
      ],
    },
    {
      title: "When to Skip Planning Overhead",
      color: "cyan",
      rows: [
        { term: "Simple, single-step tasks", desc: "Don't over-plan — matches genuine task complexity" },
        { term: "Genuinely unpredictable tasks", desc: "Prefer reactive over upfront" },
      ],
    },
  ],
};

export default planning;
