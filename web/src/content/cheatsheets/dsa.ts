import type { CheatSheetData } from "./types";

const dsa: CheatSheetData = {
  title: "The Ultimate Data Structures Cheat Sheet",
  subtitle: "Complexity tradeoffs · collision handling · tree balancing · production composition",
  sections: [
    {
      title: "Core Structures & Strongest Operation",
      color: "violet",
      rows: [
        { term: "Array", desc: "O(1) indexed access, O(n) insert/delete in the middle", code: "arr[2]         # O(1)\narr.insert(1, x) # O(n) -- shifts everything after" },
        { term: "Linked list", desc: "O(1) insert/delete GIVEN a reference, O(n) indexed access", code: "node.next = new_node   # O(1) rewiring" },
        { term: "Hash table", desc: "O(1) avg lookup/insert/delete -- trades away ORDERING", code: "d[key] = value   # O(1) average" },
        { term: "Balanced tree", desc: "O(log n) everything, PLUS maintains sorted order", code: "" },
      ],
    },
    {
      title: "Decision Framework",
      color: "blue",
      rows: [
        { term: "Indexed access", desc: "-> array", code: "" },
        { term: "Frequent arbitrary insert/delete", desc: "-> linked list (or a tree)", code: "" },
        { term: "Key lookup, ordering doesn't matter", desc: "-> hash table", code: "" },
        { term: "Key lookup + sorted order/range queries", desc: "-> balanced tree", code: "" },
        { term: "Repeated min/max access", desc: "-> heap", code: "" },
        { term: "Many-to-many relationships", desc: "-> graph", code: "" },
      ],
    },
    {
      title: "Trees, Heaps & Graphs",
      color: "emerald",
      rows: [
        { term: "CRITICAL gotcha: naive BST + sorted insertion", desc: "Degenerates to a LINKED LIST -- O(n), not O(log n)", code: "// Fix: use a self-balancing tree (AVL, red-black)" },
        { term: "Heap invariant", desc: "Parent smaller (min) or larger (max) than children", code: "heapq.heappush(heap, x); heapq.heappop(heap)   # O(log n)" },
        { term: "Adjacency list vs matrix", desc: "List: space-efficient for SPARSE graphs. Matrix: O(1) edge check, O(V^2) space", code: "" },
        { term: "BFS vs DFS", desc: "BFS = shortest path, level-by-level (queue). DFS = full exploration (stack/recursion)", code: "" },
      ],
    },
    {
      title: "Hashing & Security",
      color: "amber",
      rows: [
        { term: "Collision resolution", desc: "Chaining (linked list per slot) or open addressing (probe next slots)", code: "" },
        { term: "Load factor drives resizing", desc: "Too full -> more collisions -> average degrades toward O(n)", code: "// Production tables auto-resize past a load-factor threshold" },
        { term: "Hash-flooding DoS (real, historical)", desc: "Attacker crafts colliding keys -> O(1) avg becomes O(n) worst case", code: "// Mitigation: randomized hash seed at process startup" },
      ],
    },
    {
      title: "Advanced & Composed Structures",
      color: "rose",
      rows: [
        { term: "Trie", desc: "Prefix tree -- O(prefix length) autocomplete, not O(dataset size)", code: "" },
        { term: "Bloom filter", desc: "NEVER false negatives, CAN have false positives -- fast pre-check", code: "// Great before an expensive definitive lookup" },
        { term: "Skip list", desc: "Layered 'express lane' lists -- O(log n), simpler than a balanced tree", code: "// Redis sorted sets = skip list + hash table" },
        { term: "HNSW (vector search)", desc: "Layered GRAPHS -- same idea as skip lists, applied to similarity search", code: "// See the FAISS skill" },
      ],
    },
    {
      title: "Production Composition Patterns",
      color: "cyan",
      rows: [
        { term: "LRU cache", desc: "Hash table (O(1) lookup) + doubly linked list (O(1) reorder/evict)", code: "// Neither structure ALONE gives O(1) for all three operations" },
        { term: "B-tree (database indexes)", desc: "A TREE of small sorted ARRAYS -- sized to disk pages", code: "// Minimizes expensive disk reads per lookup" },
        { term: "Big O's blind spot", desc: "Ignores constant factors + cache locality", code: "// O(n) array scan can beat O(log n) tree search for SMALL n in practice" },
      ],
    },
  ],
};

export default dsa;
