import type { CheatSheetData } from "./types";

const cachingSystemsCheatSheet: CheatSheetData = {
  title: "Caching (Systems)",
  subtitle: "Cache-aside, write-through, invalidation at scale",
  sections: [
    {
      title: "Caching Patterns",
      color: "violet",
      rows: [
        { term: "Cache-aside", desc: "App checks cache, falls back to DB on miss — the default" },
        { term: "Write-through", desc: "Write to cache + DB sync — strong consistency, slower writes" },
        { term: "Write-behind", desc: "Write to cache, DB async/batched — fast, real data-loss risk" },
      ],
    },
    {
      title: "Invalidation",
      color: "blue",
      rows: [
        {
          term: "Delete, don't update",
          desc: "Avoids race condition with concurrent writes",
          code: "db.update(id, data)\ncache.delete(f\"key:{id}\")",
        },
        { term: "TTL", desc: "Safety net even alongside explicit invalidation" },
      ],
    },
    {
      title: "Cache Stampede",
      color: "rose",
      rows: [
        { term: "The problem", desc: "Popular key expires -> many concurrent misses -> redundant DB queries" },
        { term: "Request coalescing", desc: "Per-key lock — only ONE query runs, shared with all waiters" },
        { term: "Probabilistic early expiration", desc: "Refresh slightly before TTL to spread out load" },
      ],
    },
    {
      title: "Shared vs Local Cache",
      color: "emerald",
      rows: [
        { term: "Shared (Redis)", desc: "One delete = invisible everywhere instantly" },
        { term: "Per-instance local", desc: "Must propagate invalidation to every instance — harder" },
        { term: "Prefer shared", desc: "For any data that actually changes" },
      ],
    },
    {
      title: "Cluster Scaling",
      color: "amber",
      rows: [
        { term: "Sharding", desc: "Split keys across nodes via consistent hashing" },
        { term: "Replication", desc: "Per-shard replicas for fault tolerance" },
      ],
    },
    {
      title: "Extras",
      color: "cyan",
      rows: [
        { term: "Negative caching", desc: "Cache \"not found\" too — stops repeated lookups for bad keys" },
        { term: "AI use case", desc: "Cache LLM inference/embedding results keyed on input hash" },
        { term: "vs Caching (CS)", desc: "This is distributed patterns/invalidation, not LRU/eviction" },
      ],
    },
  ],
};

export default cachingSystemsCheatSheet;
