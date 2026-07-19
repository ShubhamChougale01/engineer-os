import type { CheatSheetData } from "./types";

const logging: CheatSheetData = {
  title: "The Ultimate Logging Cheat Sheet",
  subtitle: "Structured logging · correlation IDs · retention/sampling · the three pillars",
  sections: [
    {
      title: "Structured Logging Basics",
      color: "violet",
      rows: [
        { term: "Structured (JSON), not free text", desc: "Consistent, machine-parseable fields -- reliably searchable at scale", code: "{\"timestamp\": \"...\", \"level\": \"ERROR\", \"event\": \"payment_failed\", \"order_id\": 456}" },
        { term: "Log levels", desc: "Use consistently across the ENTIRE codebase", code: "DEBUG < INFO < WARN < ERROR < CRITICAL" },
        { term: "Effective messages", desc: "Specific + actionable, not vague", code: "// WRONG: \"error occurred\"\n// RIGHT: \"payment_gateway_timeout\" + order_id + gateway + retry_attempt" },
      ],
    },
    {
      title: "Correlation IDs (cross-service debugging)",
      color: "blue",
      rows: [
        { term: "One ID, threaded everywhere", desc: "Generated at request start, propagated to EVERY downstream call", code: "correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))" },
        { term: "Why it matters", desc: "Reconstructs a request's ENTIRE journey across many services", code: "// Query: correlation_id:abc-123 -- get every related log line, in order" },
      ],
    },
    {
      title: "Log Aggregation Architecture",
      color: "emerald",
      rows: [
        { term: "The ELK pattern", desc: "App writes locally -> shipper forwards -> indexed storage -> search UI", code: "Service logs -> Filebeat/Fluentd -> Elasticsearch -> Kibana" },
        { term: "App's job ends at local, structured logs", desc: "A separate layer handles shipping + aggregation", code: "" },
      ],
    },
    {
      title: "Retention & Sampling",
      color: "amber",
      rows: [
        { term: "Tier by log level and value", desc: "DEBUG: short retention. ERROR/CRITICAL: longer. Audit: often legally mandated.", code: "" },
        { term: "NEVER sample errors", desc: "Always log ERROR/CRITICAL at full rate -- sample only high-volume, low-value events", code: "if level >= ERROR: always_log()\nelse: log_if(random() < sample_rate)" },
      ],
    },
    {
      title: "Security: Never Log Sensitive Data",
      color: "rose",
      rows: [
        { term: "NEVER log", desc: "Passwords, full card numbers, API keys/secrets -- not even transiently", code: "// Logs are retained long, widely accessed, sometimes shipped to 3rd parties" },
        { term: "Audit logging = a distinct category", desc: "Immutable, long/legally-mandated retention -- who did what, when", code: "{\"actor\": \"admin_42\", \"action\": \"modify_permission\", \"outcome\": \"success\"}" },
      ],
    },
    {
      title: "The Three Pillars: Pick the Right One",
      color: "cyan",
      rows: [
        { term: "Need per-event diagnostic detail", desc: "-> LOGGING (this skill)", code: "" },
        { term: "Need an efficient aggregate signal", desc: "-> METRICS -- see the Metrics skill (a counter beats parsing logs)", code: "" },
        { term: "Need cross-service timing breakdown", desc: "-> TRACING -- see the Tracing skill", code: "" },
        { term: "OpenTelemetry unifies all three", desc: "Shared trace/span IDs link logs directly to distributed traces", code: "" },
      ],
    },
  ],
};

export default logging;
