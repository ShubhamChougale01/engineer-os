import type { CheatSheetData } from "./types";

const cdnCheatSheet: CheatSheetData = {
  title: "CDN",
  subtitle: "Content delivery at the edge",
  sections: [
    {
      title: "Why CDNs Exist",
      color: "violet",
      rows: [
        { term: "Latency floor", desc: "Physical distance = hard limit (speed of light)" },
        { term: "Edge PoP", desc: "Point of Presence — cached content near users" },
        { term: "Anycast routing", desc: "Same IP announced from many PoPs; routes to nearest" },
      ],
    },
    {
      title: "Cache-Control Strategy",
      color: "blue",
      rows: [
        { term: "Static, hashed assets", desc: "public, max-age=31536000, immutable" },
        { term: "Semi-dynamic pages", desc: "public, max-age=60, stale-while-revalidate=300" },
        { term: "Personalized content", desc: "private, no-store — never cache publicly" },
      ],
    },
    {
      title: "Origin Protection",
      color: "emerald",
      rows: [
        { term: "Origin shielding", desc: "Intermediate layer consolidates cache-miss traffic" },
        {
          term: "Request coalescing",
          desc: "One origin fetch serves all simultaneous waiters",
          code: "with per_key_lock(key):\n    if not cached: value = fetch(); cache(value)",
        },
        { term: "Cache stampede", desc: "Many requests hit origin at once when popular TTL expires" },
      ],
    },
    {
      title: "Invalidation Strategies",
      color: "amber",
      rows: [
        { term: "TTL-based expiration", desc: "Simple, bounded staleness window" },
        { term: "Explicit purge", desc: "API call, near-immediate, for urgent updates" },
        { term: "Content-hashed URLs", desc: "New content = new URL, no invalidation needed" },
        { term: "Stale-while-revalidate", desc: "Serve stale now, refresh in background" },
      ],
    },
    {
      title: "Security",
      color: "rose",
      rows: [
        { term: "DDoS mitigation", desc: "Distributed edge capacity absorbs/filters attack traffic" },
        { term: "WAF at the edge", desc: "Filters application-layer attacks before reaching origin" },
        { term: "Origin hiding", desc: "Keep origin IP unreachable directly from the internet" },
      ],
    },
    {
      title: "Edge Computing",
      color: "cyan",
      rows: [
        { term: "Edge functions", desc: "Run lightweight logic at the edge (Workers, Lambda@Edge)" },
        { term: "Good fit", desc: "A/B tests, auth checks, personalization on cacheable content" },
      ],
    },
  ],
};

export default cdnCheatSheet;
