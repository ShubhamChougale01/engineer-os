import type { CheatSheetData } from "./types";

const inferenceCheatSheet: CheatSheetData = {
  title: "Inference",
  subtitle: "KV caches, batching, speculative decoding",
  sections: [
    {
      title: "KV Cache",
      color: "violet",
      rows: [
        { term: "What it eliminates", desc: "Redundant K/V recomputation at every generation step" },
        { term: "Output guarantee", desc: "Mathematically identical to no-cache, just far faster" },
      ],
    },
    {
      title: "Prefill vs Decode",
      color: "blue",
      rows: [
        { term: "Prefill", desc: "Whole prompt at once — COMPUTE-bound" },
        { term: "Decode", desc: "One token at a time — MEMORY-bound (reads full KV cache)" },
      ],
    },
    {
      title: "Batching",
      color: "emerald",
      rows: [
        { term: "Static", desc: "Wait for a full batch, wait for ALL to finish" },
        { term: "Continuous (modern default)", desc: "New requests join as slots free up" },
      ],
    },
    {
      title: "Speculative Decoding",
      color: "amber",
      rows: [
        { term: "Mechanism", desc: "Small draft model proposes; large model verifies in parallel" },
        { term: "Key metric", desc: "Acceptance rate — measure empirically, task-dependent" },
      ],
    },
    {
      title: "PagedAttention",
      color: "rose",
      rows: [
        { term: "Inspired by", desc: "OS virtual memory paging" },
        { term: "Benefit", desc: "Fixed-size, non-contiguous pages -> less fragmentation, more concurrency" },
      ],
    },
    {
      title: "Reducing KV Cache Size",
      color: "cyan",
      rows: [
        { term: "Standard MHA", desc: "Separate K/V per head — most memory" },
        { term: "GQA", desc: "Shared K/V per group of heads — balanced (Llama 2/3)" },
        { term: "MQA", desc: "Shared K/V across all heads — least memory, more quality cost" },
      ],
    },
  ],
};

export default inferenceCheatSheet;
