import type { CheatSheetData } from "./types";

const prometheus: CheatSheetData = {
  title: "The Ultimate Prometheus Cheat Sheet",
  subtitle: "Pull-based scraping · PromQL · alerting/Alertmanager · service discovery",
  sections: [
    {
      title: "Pull-Based Collection Model",
      color: "violet",
      rows: [
        { term: "Prometheus scrapes YOU", desc: "You don't push -- Prometheus pulls /metrics on a schedule", code: "// Failed scrape = an immediately actionable health signal" },
        { term: "Why pull, not push?", desc: "Direct target-health detection, centralized collection config", code: "" },
        { term: "Pushgateway = a narrow exception", desc: "ONLY for genuinely short-lived batch jobs, never a general substitute", code: "" },
      ],
    },
    {
      title: "PromQL Essentials",
      color: "blue",
      rows: [
        { term: "rate()", desc: "Per-second rate, correctly handles counter RESETS on restart", code: "rate(http_requests_total[5m])" },
        { term: "Aggregation", desc: "Combine across instances/labels", code: "sum(rate(http_requests_total[5m])) by (job)" },
        { term: "histogram_quantile()", desc: "The CORRECT percentile calc -- aggregates buckets, not raw %iles", code: "histogram_quantile(0.95, sum(rate(bucket[5m])) by (le))" },
        { term: "NEVER average pre-computed percentiles", desc: "Mathematically meaningless across instances", code: "" },
      ],
    },
    {
      title: "Alerting Rules & Alertmanager",
      color: "emerald",
      rows: [
        { term: "ALWAYS use 'for'", desc: "Requires the condition SUSTAINED -- avoids false alarms on blips", code: "- alert: HighErrorRate\n  expr: rate(errors[5m]) > 0.05\n  for: 5m" },
        { term: "Alertmanager's job (separate!)", desc: "Dedup, GROUP related alerts, ROUTE by severity", code: "route:\n  group_by: [alertname, cluster]\n  routes: [{match: {severity: critical}, receiver: pagerduty}]" },
      ],
    },
    {
      title: "Recording Rules",
      color: "amber",
      rows: [
        { term: "Pre-compute expensive/frequent queries", desc: "Store as a new, simple metric -- avoid recomputing every dashboard load", code: "- record: job:http_requests:rate5m\n  expr: sum(rate(http_requests_total[5m])) by (job)" },
      ],
    },
    {
      title: "Service Discovery",
      color: "rose",
      rows: [
        { term: "NEVER hardcode static targets in dynamic envs", desc: "Kubernetes pods come/go constantly -- static lists go stale immediately", code: "scrape_configs:\n  - kubernetes_sd_configs: [{role: pod}]" },
      ],
    },
    {
      title: "Cardinality & Scaling",
      color: "cyan",
      rows: [
        { term: "THE #1 failure mode: cardinality explosion", desc: "Monitor prometheus_tsdb_head_series", code: "// Fix: redesign labels to be bounded -- NOT just add more capacity" },
        { term: "Base Prometheus is single-node", desc: "No native HA, clustering, or indefinite retention", code: "" },
        { term: "Extend ONLY when genuinely needed", desc: "Long retention / multi-cluster query / HA -> Thanos, Cortex, or Mimir", code: "// Over-engineering this for a small single-cluster deployment is a real anti-pattern" },
      ],
    },
  ],
};

export default prometheus;
