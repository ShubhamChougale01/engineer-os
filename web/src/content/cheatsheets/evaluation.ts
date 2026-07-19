import type { CheatSheetData } from "./types";

const evaluationCheatSheet: CheatSheetData = {
  title: "Evaluation",
  subtitle: "Benchmarks, LLM-as-judge, eval harnesses",
  sections: [
    {
      title: "Why Spot-Checking Fails",
      color: "violet",
      rows: [
        { term: "Probabilistic + prompt-sensitive", desc: "A few good examples ≠ real performance" },
        { term: "Fix", desc: "Systematic, representative evaluation harness" },
      ],
    },
    {
      title: "Choosing a Method",
      color: "blue",
      rows: [
        { term: "Exact-match", desc: "Single objectively-correct answer exists" },
        { term: "LLM-as-judge", desc: "Genuinely open-ended output, validate vs humans" },
        { term: "Human evaluation", desc: "Periodic calibration + high-stakes decisions" },
      ],
    },
    {
      title: "Standardized Benchmarks",
      color: "emerald",
      rows: [
        { term: "MMLU", desc: "57-subject general knowledge/reasoning" },
        { term: "HumanEval", desc: "Code generation — functional correctness" },
        { term: "Genuine limit", desc: "Says little about YOUR specific app's task" },
        { term: "Benchmark contamination", desc: "Test data in training data -> inflated scores" },
      ],
    },
    {
      title: "LLM-as-Judge Biases",
      color: "amber",
      rows: [
        { term: "Position bias", desc: "Favors a position, not actual quality — randomize order!" },
        { term: "Verbosity bias", desc: "Favors longer responses unfairly" },
        { term: "Self-preference bias", desc: "Favors outputs stylistically like its own" },
        { term: "Always validate", desc: "Check correlation against real human ratings" },
      ],
    },
    {
      title: "Scoring Approach",
      color: "rose",
      rows: [
        { term: "Pairwise > absolute", desc: "\"Which is better\" is more consistent than a 1-5 scale" },
      ],
    },
    {
      title: "Evaluation as Deployment Gate",
      color: "cyan",
      rows: [
        {
          term: "Pattern",
          desc: "",
          code: "if candidate_score >= baseline_score - margin:\n    deploy()\nelse:\n    block_and_alert()",
        },
      ],
    },
  ],
};

export default evaluationCheatSheet;
