import type { CheatSheetData } from "./types";

const grafana: CheatSheetData = {
  title: "The Ultimate Grafana Cheat Sheet",
  subtitle: "Data-source-agnostic dashboards · variables · LGTM stack · design discipline",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Grafana = query-and-render LAYER", desc: "NOT a data store itself (except its own Loki/Tempo/Mimir)", code: "Dashboard -> Panels -> each panel queries a configured Data Source" },
        { term: "Data-source-agnostic", desc: "Same UX across Prometheus, Elasticsearch, cloud metrics, dozens more", code: "" },
        { term: "Performance is bounded by the data source", desc: "A slow/down Prometheus = a slow/broken dashboard, no fallback", code: "" },
      ],
    },
    {
      title: "Panel Type Selection",
      color: "blue",
      rows: [
        { term: "Time series", desc: "How a value changes over TIME -- rate, latency trend", code: "" },
        { term: "Gauge", desc: "A single CURRENT value against a threshold", code: "" },
        { term: "Heatmap", desc: "A full DISTRIBUTION's evolution -- not just a percentile line", code: "" },
        { term: "Table / Stat", desc: "Ranked/tabular data, or one prominent headline number", code: "" },
      ],
    },
    {
      title: "Dashboard Variables (Templating)",
      color: "emerald",
      rows: [
        { term: "ONE dashboard, MANY contexts", desc: "Switch service/env via a dropdown -- never hand-build duplicates", code: "{\"name\": \"service\", \"query\": \"label_values(http_requests_total, service)\"}" },
        { term: "Use in queries", desc: "", code: "rate(http_requests_total{service=\"$service\"}[5m])" },
      ],
    },
    {
      title: "Dashboard Design Discipline",
      color: "amber",
      rows: [
        { term: "AVOID dashboard sprawl", desc: "40+ unfocused panels INCREASE cognitive load during incidents", code: "// More panels != better. Curate around a specific question." },
        { term: "Structure around frameworks", desc: "RED (services), USE (resources), SLO/error-budget (reliability)", code: "// See the Metrics skill" },
        { term: "Periodic curation", desc: "Tie reviews to incident retrospectives -- remove low-value panels", code: "" },
      ],
    },
    {
      title: "Alerting: A Genuine Architectural Choice",
      color: "rose",
      rows: [
        { term: "Grafana-native alerting", desc: "Unified across MULTIPLE heterogeneous data sources", code: "" },
        { term: "Prometheus Alertmanager", desc: "Prometheus-centric, established -- keep if already invested", code: "// Decide based on YOUR data source topology, not a default" },
      ],
    },
    {
      title: "The LGTM Stack & Best Practices",
      color: "cyan",
      rows: [
        { term: "Loki + Grafana + Tempo + Mimir", desc: "One integrated, open-standard-based observability platform", code: "" },
        { term: "Exemplars", desc: "Click a metric spike -> jump straight to a real, linked trace", code: "// Bridges aggregate metrics with per-request tracing depth" },
        { term: "Dashboard as code", desc: "Version-controlled JSON + provisioning -- reviewable, no silent drift", code: "// Never manual-only UI configuration for production dashboards" },
      ],
    },
  ],
};

export default grafana;
