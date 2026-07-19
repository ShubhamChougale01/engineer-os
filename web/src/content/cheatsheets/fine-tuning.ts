import type { CheatSheetData } from "./types";

const fineTuningCheatSheet: CheatSheetData = {
  title: "Fine-Tuning",
  subtitle: "SFT, LoRA, RLHF: adapting models",
  sections: [
    {
      title: "When to Fine-Tune",
      color: "violet",
      rows: [
        { term: "Escalation path", desc: "Only after prompting is genuinely, thoroughly exhausted" },
        { term: "Genuinely justified when", desc: "Consistency at scale, domain knowledge gap, context limits" },
      ],
    },
    {
      title: "SFT vs Alignment",
      color: "blue",
      rows: [
        { term: "SFT", desc: "Imitate FIXED demonstration examples — task adaptation" },
        { term: "RLHF", desc: "Reward model from human preference comparisons + RL" },
        { term: "DPO", desc: "Simpler alternative — single objective, no separate reward model" },
      ],
    },
    {
      title: "Parameter-Efficient Fine-Tuning",
      color: "emerald",
      rows: [
        { term: "LoRA", desc: "Freeze original weights, train only small low-rank matrices" },
        { term: "QLoRA", desc: "LoRA + quantized frozen weights — fits on modest hardware" },
        { term: "Why it works", desc: "Task adaptation often has low 'intrinsic rank'" },
      ],
    },
    {
      title: "Catastrophic Forgetting",
      color: "amber",
      rows: [
        { term: "The risk", desc: "Too-aggressive fine-tuning erases general capabilities" },
        { term: "Mitigation", desc: "Lower learning rate, fewer epochs, use LoRA" },
        { term: "Always evaluate", desc: "BOTH target task AND general benchmarks" },
      ],
    },
    {
      title: "RLHF's Three Stages",
      color: "rose",
      rows: [
        { term: "1. SFT", desc: "Fine-tune on high-quality demonstrations" },
        { term: "2. Reward model", desc: "Train on human preference comparisons" },
        { term: "3. RL fine-tuning", desc: "Optimize policy against the reward model" },
      ],
    },
    {
      title: "Data Discipline",
      color: "cyan",
      rows: [
        { term: "Quality > quantity", desc: "Garbage in, garbage out — small curated beats large noisy" },
      ],
    },
  ],
};

export default fineTuningCheatSheet;
