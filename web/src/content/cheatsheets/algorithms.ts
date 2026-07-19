import type { CheatSheetData } from "./types";

const algorithms: CheatSheetData = {
  title: "The Ultimate Algorithms Cheat Sheet",
  subtitle: "Big O · sorting · DP/greedy/graph techniques · NP-hardness · security",
  sections: [
    {
      title: "Big O Growth Rates",
      color: "violet",
      rows: [
        { term: "Fastest to slowest", desc: "", code: "O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)" },
        { term: "Binary search REQUIRES sorted input", desc: "O(log n) -- halves the search space each step", code: "// O(n) linear search has no such precondition" },
        { term: "Big O ignores constant factors", desc: "An O(n) array scan can beat O(log n) tree search for SMALL n", code: "// See the Data Structures skill for cache-locality depth" },
      ],
    },
    {
      title: "Sorting Complexity",
      color: "blue",
      rows: [
        { term: "Merge sort", desc: "O(n log n) GUARANTEED, O(n) space -- stable", code: "" },
        { term: "Quicksort", desc: "O(n log n) average, O(n^2) worst case (bad pivot choice)", code: "pivot = random.choice(arr)   # defends against adversarial worst case" },
        { term: "Heapsort", desc: "O(n log n) guaranteed, O(1) space -- fully in-place", code: "" },
      ],
    },
    {
      title: "Technique Selection Framework",
      color: "emerald",
      rows: [
        { term: "Overlapping subproblems", desc: "-> Dynamic programming (memoize!)", code: "// Naive Fibonacci: O(2^n). Memoized: O(n)." },
        { term: "Independent, combinable subproblems", desc: "-> Divide and conquer", code: "" },
        { term: "PROVEN locally-optimal choice", desc: "-> Greedy -- but verify correctness for YOUR problem variant first", code: "// Greedy coin change fails for non-canonical denominations" },
        { term: "Connectivity / shortest path / flow", desc: "-> Graph algorithms (BFS, DFS, Dijkstra, MST)", code: "" },
      ],
    },
    {
      title: "Graph Algorithms",
      color: "amber",
      rows: [
        { term: "Dijkstra's shortest path", desc: "Always processes the closest unvisited node next (min-heap)", code: "// ONLY valid for NON-NEGATIVE edge weights" },
        { term: "Negative weights?", desc: "Dijkstra's core assumption breaks -- use Bellman-Ford instead", code: "" },
        { term: "BFS vs DFS", desc: "BFS = shortest path in unweighted graphs (queue). DFS = full exploration (stack)", code: "" },
      ],
    },
    {
      title: "NP-Hardness & Amortized Analysis",
      color: "rose",
      rows: [
        { term: "NP-complete problem recognized?", desc: "STOP chasing an efficient exact algorithm", code: "// Pursue approximation algorithms or heuristics instead" },
        { term: "Connects directly to vector search", desc: "Exact high-dim nearest-neighbor is too costly -> HNSW approximates", code: "// See the FAISS skill" },
        { term: "Amortized analysis", desc: "Averages cost over a long OPERATION SEQUENCE, not one operation", code: "// Dynamic array append: usually O(1), occasionally O(n) resize -- still O(1) amortized" },
      ],
    },
    {
      title: "Security & Common Bugs",
      color: "cyan",
      rows: [
        { term: "ReDoS", desc: "Nested-quantifier regex -> exponential time on crafted input", code: "// A real, historically-exploited DoS vector" },
        { term: "#1 accidental complexity bug", desc: "A linear op (count(), 'in' check) hidden INSIDE a loop = O(n^2)", code: "if items.count(x) > 1: ...   # inside a loop over items -- O(n^2)!" },
        { term: "Fix", desc: "Use a hash-based structure (set/Counter) for O(1) membership/counting", code: "from collections import Counter; counts = Counter(items)" },
      ],
    },
  ],
};

export default algorithms;
