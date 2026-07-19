import type { CheatSheetData } from "./types";

const cachingCs: CheatSheetData = {
  title: "The Ultimate Caching Cheat Sheet",
  subtitle: "Locality of reference · eviction policies · invalidation · stampede mitigation",
  sections: [
    {
      title: "Why Caching Works",
      color: "violet",
      rows: [
        { term: "Locality of reference", desc: "Temporal (recent = likely again soon) + spatial (nearby = likely soon too)", code: "// No genuine locality in your workload = caching won't help much" },
        { term: "Hit ratio: THE metric", desc: "hits / (hits + misses) -- even small gains cut avg latency a lot", code: "" },
      ],
    },
    {
      title: "Eviction Policies",
      color: "blue",
      rows: [
        { term: "LRU", desc: "Evict least RECENTLY used -- strong general-purpose default", code: "OrderedDict.move_to_end(key); popitem(last=False)" },
        { term: "LFU", desc: "Evict least FREQUENTLY used -- better for stable popular-item sets", code: "// Can struggle to adapt when popularity genuinely shifts" },
        { term: "FIFO", desc: "Evict OLDEST inserted, ignores access pattern -- simplest, weakest", code: "" },
        { term: "Belady's algorithm", desc: "The THEORETICAL OPTIMUM -- unimplementable (needs future knowledge)", code: "// Used only as a benchmark for real policies" },
      ],
    },
    {
      title: "Write Policies",
      color: "emerald",
      rows: [
        { term: "Write-through", desc: "Write to cache + source together -- always consistent, slower writes", code: "" },
        { term: "Write-back", desc: "Write to cache only, sync source later -- fast, but DATA LOSS risk", code: "" },
        { term: "Write-around", desc: "Bypass cache entirely -- for data unlikely to be re-read soon", code: "" },
      ],
    },
    {
      title: "Invalidation (the hardest problem)",
      color: "amber",
      rows: [
        { term: "TTL expiration", desc: "Bounded staleness -- simple, no write-path coordination needed", code: "cache[key] = (value, time.time() + ttl_seconds)" },
        { term: "Proactive invalidation on write", desc: "Most accurate -- required for staleness-intolerant data", code: "update_database(id, data); cache.delete(key)" },
        { term: "The famous quip", desc: "Two hard things in CS: cache invalidation and naming things", code: "" },
      ],
    },
    {
      title: "Cache Stampede",
      color: "rose",
      rows: [
        { term: "The failure mode", desc: "A popular entry expires -> MANY concurrent requests all miss at once", code: "// A WELL-hit cache's biggest single risk" },
        { term: "Request coalescing", desc: "Only ONE request recomputes -- others wait and reuse the result", code: "" },
        { term: "Stale-while-revalidate", desc: "Serve the stale value immediately, refresh asynchronously", code: "" },
      ],
    },
    {
      title: "Hierarchies & Security",
      color: "cyan",
      rows: [
        { term: "Same pattern at every scale", desc: "Fastest layer first, fall back progressively, populate on a hit", code: "CPU: L1 -> L2 -> L3 -> RAM -> Disk\nWeb: Browser -> CDN -> Redis -> Database" },
        { term: "CDN's key insight", desc: "Applies locality to GEOGRAPHIC distance, not just time", code: "" },
        { term: "#1 caching security risk", desc: "Wrong cache key scoping in a SHARED cache leaks data across users", code: "// ALWAYS include user identity in the key for per-user data" },
        { term: "#1 common mistake", desc: "Unbounded cache = a real memory leak", code: "@lru_cache(maxsize=1000)   # ALWAYS set an explicit capacity" },
      ],
    },
  ],
};

export default cachingCs;
