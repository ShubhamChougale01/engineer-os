import type { CheatSheetData } from "./types";

const vectorSearchCheatSheet: CheatSheetData = {
  title: "Vector Search",
  subtitle: "ANN algorithms: HNSW, IVF, quantization",
  sections: [
    {
      title: "Why Not Brute-Force",
      color: "violet",
      rows: [
        { term: "Brute-force cost", desc: "Grows LINEARLY with collection size — fails at scale" },
        { term: "ANN search", desc: "Trades a small, controlled accuracy loss for dramatic speed" },
        { term: "Recall@k", desc: "Fraction of true top-k neighbors actually found" },
      ],
    },
    {
      title: "HNSW (dominant algorithm)",
      color: "blue",
      rows: [
        { term: "Structure", desc: "Multi-layer graph — sparse top (navigation), dense bottom (precision)" },
        { term: "ef_search", desc: "Tunable — higher = better recall, slower search" },
      ],
    },
    {
      title: "IVF (partition-based)",
      color: "emerald",
      rows: [
        { term: "Structure", desc: "k-means clusters; search only the most relevant ones" },
        { term: "nprobe", desc: "Tunable — how many clusters to search" },
        { term: "Best fit", desc: "Massive scale, memory-constrained (often + quantization)" },
      ],
    },
    {
      title: "Quantization",
      color: "amber",
      rows: [
        { term: "Product quantization", desc: "Replace sub-vectors with nearest codebook index" },
        { term: "Benefit", desc: "Often 10x+ memory compression" },
        { term: "Cost", desc: "Reduced similarity precision — validate recall!" },
      ],
    },
    {
      title: "Tuning Discipline",
      color: "rose",
      rows: [
        { term: "Never assume defaults", desc: "Build a brute-force ground truth, measure ACTUAL recall" },
        { term: "Tune per application", desc: "Match parameters to real accuracy/latency requirements" },
      ],
    },
    {
      title: "Production Extras",
      color: "cyan",
      rows: [
        { term: "Hybrid search", desc: "Vector similarity + keyword (BM25) for exact-match needs" },
        { term: "Filtered search", desc: "Integrate metadata/access filters INTO the search, not after" },
      ],
    },
  ],
};

export default vectorSearchCheatSheet;
