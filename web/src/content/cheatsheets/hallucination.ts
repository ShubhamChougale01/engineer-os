import type { CheatSheetData } from "./types";

const hallucinationCheatSheet: CheatSheetData = {
  title: "Hallucination",
  subtitle: "Why models confabulate and how to mitigate it",
  sections: [
    {
      title: "The Structural Cause",
      color: "violet",
      rows: [
        { term: "Root cause", desc: "Next-token prediction has no built-in fact-verification step" },
        { term: "Key insight", desc: "Confident-correct and confident-wrong use the SAME generation process" },
      ],
    },
    {
      title: "Two Types",
      color: "blue",
      rows: [
        { term: "Intrinsic (faithfulness)", desc: "Contradicts a GIVEN source document" },
        { term: "Extrinsic (factual)", desc: "Unsupported by ANY source at all" },
      ],
    },
    {
      title: "Primary Mitigation: RAG",
      color: "emerald",
      rows: [
        { term: "Mechanism", desc: "Retrieve real docs -> ground generation in them" },
        { term: "Genuine limit", desc: "Reduces, does NOT eliminate — model can still misrepresent retrieved content" },
      ],
    },
    {
      title: "Prompting-Based Mitigations",
      color: "amber",
      rows: [
        { term: "Chain-of-verification", desc: "Generate -> verification Qs -> answer -> revise" },
        { term: "Uncertainty acknowledgment", desc: "Instruct model to say \"I'm not sure\" rather than guess" },
      ],
    },
    {
      title: "Detection",
      color: "rose",
      rows: [
        { term: "Consistency-checking", desc: "Sample multiple responses, check agreement" },
        { term: "Limitation", desc: "Model can CONSISTENTLY be wrong — not foolproof" },
        { term: "Fact/citation verification", desc: "Check claims against trusted/retrieved sources" },
      ],
    },
    {
      title: "Non-Negotiables",
      color: "cyan",
      rows: [
        { term: "Match stakes", desc: "Don't maximize caution universally — kills usefulness" },
        { term: "Always measure", desc: "Never assume a mitigation \"just works\" — test it (Evaluation skill)" },
        { term: "Agentic workflows", desc: "Errors COMPOUND — verify intermediate steps, not just final output" },
      ],
    },
  ],
};

export default hallucinationCheatSheet;
