import type { CheatSheetData } from "./types";

const transformersCheatSheet: CheatSheetData = {
  title: "Transformers",
  subtitle: "The architecture behind modern AI",
  sections: [
    {
      title: "Why Transformers Replaced RNNs",
      color: "violet",
      rows: [
        { term: "RNN limitation", desc: "Sequential — h_t needs h_{t-1}, can't parallelize" },
        { term: "Self-attention", desc: "All position pairs computed at once — fully parallel" },
      ],
    },
    {
      title: "Core Attention Math",
      color: "blue",
      rows: [
        {
          term: "Scaled dot-product attention",
          desc: "sqrt(d_k) scaling prevents softmax saturation",
          code: "scores = (Q @ K.T) / sqrt(d_k)\nweights = softmax(scores)\noutput = weights @ V",
        },
        { term: "Multi-head attention", desc: "Multiple parallel attention 'views' — richer relationships" },
      ],
    },
    {
      title: "Positional Encoding",
      color: "emerald",
      rows: [
        { term: "Required!", desc: "Self-attention is permutation-invariant — no inherent order" },
        { term: "Method", desc: "Sinusoidal or learned, added to each input embedding" },
      ],
    },
    {
      title: "Block Structure",
      color: "amber",
      rows: [
        {
          term: "Post-norm (original)",
          desc: "",
          code: "x = LayerNorm(x + Attention(x))\nx = LayerNorm(x + FeedForward(x))",
        },
        { term: "Pre-norm", desc: "More stable for very deep (modern LLM-scale) stacks" },
      ],
    },
    {
      title: "Architecture Variants",
      color: "rose",
      rows: [
        { term: "Encoder-only (BERT)", desc: "Bidirectional — understanding/classification" },
        { term: "Decoder-only (GPT)", desc: "Causal masking — generation, DOMINANT for LLMs" },
        { term: "Encoder-decoder (T5)", desc: "Both — genuine seq2seq (translation)" },
      ],
    },
    {
      title: "Practical Constraints",
      color: "cyan",
      rows: [
        { term: "Quadratic cost", desc: "O(N^2); doubling context ~quadruples attention cost" },
        { term: "Fixes", desc: "Sparse/sliding-window/linear attention, KV-caching" },
        { term: "Why decoder-only dominates", desc: "One objective + prompting handles many tasks" },
      ],
    },
  ],
};

export default transformersCheatSheet;
