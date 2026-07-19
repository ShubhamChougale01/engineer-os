import type { CheatSheetData } from "./types";

const metrics: CheatSheetData = {
  title: "The Ultimate Metrics Cheat Sheet",
  subtitle: "Metric types · cardinality · percentiles · RED/USE · SLOs & error budgets",
  sections: [
    {
      title: "The Four Metric Types",
      color: "violet",
      rows: [
        { term: "Counter", desc: "Only ever increases -- totals (requests, errors)", code: "Counter('requests_total', ..., ['endpoint']).labels(endpoint='/api').inc()" },
        { term: "Gauge", desc: "Up or down -- current state (queue depth, memory)", code: "Gauge('active_connections', '...').inc() / .dec()" },
        { term: "Histogram", desc: "Distribution via buckets -- latency, size", code: "Histogram('duration_seconds', ...).observe(0.045)" },
        { term: "Summary (generally AVOID)", desc: "Client-side %ile -- doesn't aggregate correctly across instances", code: "// Use Histogram instead in any multi-instance system" },
      ],
    },
    {
      title: "Percentiles > Averages",
      color: "blue",
      rows: [
        { term: "Averages hide tail latency", desc: "A few very slow requests barely shift an average", code: "// 95% at 50ms + 5% at 3000ms -> avg looks ~fine, masks a real problem" },
        { term: "Use p50/p95/p99 instead", desc: "Reveals what the slowest fraction of users actually feel", code: "" },
        { term: "NEVER average pre-computed percentiles", desc: "Mathematically meaningless across instances", code: "// Aggregate the underlying HISTOGRAM BUCKETS first, then compute the %ile" },
      ],
    },
    {
      title: "Cardinality (THE cost concern)",
      color: "emerald",
      rows: [
        { term: "Every unique label combo = a separate time series", desc: "", code: "" },
        { term: "WRONG: unbounded label values", desc: "Raw user IDs, full URLs, timestamps -> combinatorial explosion", code: "labels(user_id=raw_id)   # millions of time series" },
        { term: "RIGHT: bounded, categorical dimensions", desc: "", code: "labels(user_tier=tier)   # a handful of time series" },
      ],
    },
    {
      title: "Structured Frameworks",
      color: "amber",
      rows: [
        { term: "RED method (services)", desc: "Rate, Errors, Duration", code: "" },
        { term: "USE method (resources)", desc: "Utilization, Saturation, Errors", code: "" },
      ],
    },
    {
      title: "SLIs, SLOs & Error Budgets",
      color: "rose",
      rows: [
        { term: "SLI", desc: "The ACTUAL measured metric (e.g. % requests < 200ms)", code: "" },
        { term: "SLO", desc: "The TARGET for that SLI (e.g. 99.9%)", code: "" },
        { term: "Error budget", desc: "The remaining allowed margin -- drives REAL prioritization decisions", code: "// Burning too fast? Prioritize reliability over new features." },
      ],
    },
    {
      title: "Alerting",
      color: "cyan",
      rows: [
        { term: "Naive single-threshold alerts", desc: "Either too noisy OR too slow to detect sustained issues", code: "" },
        { term: "Multi-window, multi-burn-rate", desc: "Short window (fast, severe) + long window (sustained, low-noise)", code: "" },
      ],
    },
  ],
};

export default metrics;
