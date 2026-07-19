import type { CheatSheetData } from "./types";

const apiGatewayCheatSheet: CheatSheetData = {
  title: "API Gateway",
  subtitle: "Single entry point: routing, auth, rate limits",
  sections: [
    {
      title: "What It Adds Over a Reverse Proxy",
      color: "violet",
      rows: [
        { term: "Centralized auth", desc: "Verify API key/JWT/OAuth once at the gateway" },
        { term: "Per-client rate limiting", desc: "Protect backend capacity, enable tiered plans" },
        { term: "Transformation", desc: "External contract <-> internal service formats" },
        { term: "API versioning", desc: "/v1/ and /v2/ run simultaneously, migrate on your schedule" },
      ],
    },
    {
      title: "Request Order (fail fast)",
      color: "blue",
      rows: [
        { term: "1. Auth", desc: "Reject invalid credentials immediately" },
        { term: "2. Rate limit", desc: "429 before any backend call is made" },
        { term: "3. Route", desc: "Path/version-based dispatch" },
        { term: "4. Transform", desc: "Shape response to external contract" },
      ],
    },
    {
      title: "Response Aggregation",
      color: "emerald",
      rows: [
        {
          term: "Parallel calls",
          desc: "Bounded by SLOWEST call, not the sum",
          code: "user, orders, recs = await asyncio.gather(\n  call_users(), call_orders(), call_inventory())",
        },
        { term: "Sequential (wrong)", desc: "Adds every backend's latency together" },
      ],
    },
    {
      title: "Rate Limiting Tiers",
      color: "amber",
      rows: [
        { term: "Free", desc: "e.g. 100 req/day" },
        { term: "Pro", desc: "e.g. 10,000 req/day" },
        { term: "Enterprise", desc: "Custom negotiated limit" },
        { term: "Token bucket", desc: "Common algorithm — allows burst tolerance" },
      ],
    },
    {
      title: "Anti-Patterns",
      color: "rose",
      rows: [
        { term: "Smart gateway, dumb pipes", desc: "Business logic creeps in -> org-wide bottleneck" },
        { term: "Fix", desc: "Keep gateway to auth/rate-limit/routing/transform only" },
      ],
    },
    {
      title: "Resilience & Specialization",
      color: "cyan",
      rows: [
        { term: "Circuit breaking", desc: "Fail fast/fallback on a persistently failing backend" },
        { term: "Backend-for-Frontend", desc: "Separate gateway per client type (mobile vs web)" },
      ],
    },
  ],
};

export default apiGatewayCheatSheet;
