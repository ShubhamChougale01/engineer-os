import type { CheatSheetData } from "./types";

const attentionCheatSheet: CheatSheetData = {
  title: "Attention",
  subtitle: "Query-key-value: the core mechanism",
  sections: [
    {
      title: "Query, Key, Value",
      color: "violet",
      rows: [
        { term: "Query", desc: "What am I looking for" },
        { term: "Key", desc: "What does this position represent (for matching)" },
        { term: "Value", desc: "What this position actually contributes" },
      ],
    },
    {
      title: "The Formula",
      color: "blue",
      rows: [
        {
          term: "Scaled dot-product attention",
          desc: "",
          code: "Attention(Q,K,V) = softmax(Q @ K.T / sqrt(d_k)) @ V",
        },
        { term: "Why sqrt(d_k)", desc: "Dot-product variance grows with d_k -> prevents softmax saturation" },
      ],
    },
    {
      title: "Attention Types",
      color: "emerald",
      rows: [
        { term: "Self-attention", desc: "Q, K, V all from the SAME sequence" },
        { term: "Cross-attention", desc: "Q from one sequence, K/V from a DIFFERENT one" },
        { term: "Multi-head", desc: "h heads at d_model/h each — comparable total cost, richer views" },
      ],
    },
    {
      title: "Masking",
      color: "amber",
      rows: [
        { term: "Causal mask", desc: "Blocks attention to future positions — essential for generation" },
        { term: "Padding mask", desc: "Blocks attention to meaningless padding tokens" },
        { term: "How applied", desc: "Set masked scores to -inf BEFORE softmax" },
      ],
    },
    {
      title: "Efficient Variants",
      color: "rose",
      rows: [
        { term: "Sparse attention", desc: "Restrict position pairs -> ~O(N), less flexibility" },
        { term: "Linear attention", desc: "Kernel reformulation -> O(N), some approximation" },
        { term: "FlashAttention", desc: "SAME exact math, hardware-optimized -> just faster" },
      ],
    },
    {
      title: "Interpretability Caveat",
      color: "cyan",
      rows: [
        { term: "Attention weights ≠ full explanation", desc: "FFN layers, residuals, other heads also contribute" },
        { term: "Best practice", desc: "Combine with ablation studies / probing, don't rely on attention alone" },
      ],
    },
  ],
};

export default attentionCheatSheet;
