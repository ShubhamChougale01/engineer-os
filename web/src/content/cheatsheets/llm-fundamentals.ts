import type { CheatSheetData } from "./types";

const llmFundamentalsCheatSheet: CheatSheetData = {
  title: "LLM Fundamentals",
  subtitle: "Tokens, context windows, sampling, scaling laws",
  sections: [
    {
      title: "Tokenization",
      color: "violet",
      rows: [
        { term: "Subword tokens (BPE)", desc: "NOT characters, NOT words — the actual unit of cost/context" },
        { term: "Rough heuristic", desc: "~4 chars or ~0.75 words/token (English) — varies a lot" },
        { term: "Character-level tasks", desc: "Counting letters/reversing strings is structurally hard" },
      ],
    },
    {
      title: "Context Window",
      color: "blue",
      rows: [
        { term: "Definition", desc: "Max tokens = INPUT + OUTPUT combined" },
        { term: "Why limited", desc: "Quadratic attention cost (see Transformers/Attention)" },
      ],
    },
    {
      title: "Sampling Parameters",
      color: "emerald",
      rows: [
        { term: "Temperature", desc: "0 = deterministic; higher = flatter dist, more random" },
        { term: "Top-k", desc: "Fixed candidate count" },
        { term: "Top-p (nucleus)", desc: "Adaptive — smallest set exceeding cumulative prob p" },
        { term: "Frequency/presence penalty", desc: "Discourages repetition / topic reuse" },
      ],
    },
    {
      title: "Scaling Laws",
      color: "amber",
      rows: [
        { term: "Kaplan et al. (2020)", desc: "Loss decreases predictably (power law) with size/data/compute" },
        { term: "Chinchilla (2022)", desc: "Many early large models under-trained — smaller+more data often wins" },
        { term: "Practical limit", desc: "Predicts loss, not every downstream capability — still validate per task" },
      ],
    },
    {
      title: "Practical Defaults",
      color: "rose",
      rows: [
        { term: "Deterministic tasks", desc: "Code, extraction: temp 0-0.3" },
        { term: "Creative tasks", desc: "temp 0.7-1.0 + top-p" },
        { term: "Model sizing", desc: "Match model size to task — don't default to the biggest" },
      ],
    },
  ],
};

export default llmFundamentalsCheatSheet;
