import type { CheatSheetData } from "./types";

const opentelemetry: CheatSheetData = {
  title: "The Ultimate OpenTelemetry Cheat Sheet",
  subtitle: "Vendor-neutral instrumentation · the Collector · semantic conventions · AI conventions",
  sections: [
    {
      title: "Core Value: Vendor Neutrality",
      color: "violet",
      rows: [
        { term: "Separates instrumentation from export", desc: "App calls the STABLE API -- export destination is swappable config", code: "App -> OTel API -> SDK -> Exporter -> Collector -> Backend" },
        { term: "Swap backends with ZERO code changes", desc: "Reconfigure the Collector, never touch instrumented app code", code: "" },
        { term: "History", desc: "OpenTracing + OpenCensus merged (2019) -- ending competing 'standards'", code: "" },
      ],
    },
    {
      title: "Unified API Across All Three Pillars",
      color: "blue",
      rows: [
        { term: "One consistent mental model", desc: "Tracer, Meter, Logger -- same pattern, three signal types", code: "tracer = trace.get_tracer('svc')\nmeter = metrics.get_meter('svc')" },
        { term: "Auto-correlation via active span", desc: "Logs/metrics emitted inside a span context get correlated automatically", code: "with tracer.start_as_current_span('handle_request'):\n    logging.info('processed')   # auto trace_id/span_id" },
      ],
    },
    {
      title: "The Collector",
      color: "emerald",
      rows: [
        { term: "Receive -> Process -> Export", desc: "Centralizes batching, sampling, filtering OUTSIDE the app", code: "receivers: {otlp}\nprocessors: {batch, tail_sampling}\nexporters: {otlp/tempo, prometheus}" },
        { term: "Agent vs Gateway topology", desc: "Agent: local, per-app. Gateway: centralized -- REQUIRED for tail-based sampling", code: "// Tail sampling needs to see a trace's COMPLETE outcome first" },
      ],
    },
    {
      title: "Semantic Conventions",
      color: "amber",
      rows: [
        { term: "Standardized attribute names", desc: "Use them EVERYWHERE, consistently -- not ad-hoc naming per service", code: "span.set_attribute('http.method', 'GET')   # NOT 'httpMethod' or 'method'" },
        { term: "Resource attributes", desc: "Same resource object across Tracer/Meter/Logger providers for one service", code: "Resource.create({'service.name': 'order-service', 'deployment.environment': 'prod'})" },
      ],
    },
    {
      title: "Migration Discipline",
      color: "rose",
      rows: [
        { term: "New services: OTel-native from day one", desc: "", code: "" },
        { term: "Existing vendor-instrumented services", desc: "Bridge/shim first -- migrate incrementally, NEVER all-at-once", code: "" },
        { term: "THE #1 anti-pattern", desc: "Instrumenting directly against a proprietary vendor SDK -- recreates lock-in", code: "" },
      ],
    },
    {
      title: "AI-Specific Conventions",
      color: "cyan",
      rows: [
        { term: "gen_ai.* namespace", desc: "Standardized LLM instrumentation -- model, tokens, provider", code: "span.set_attribute('gen_ai.system', 'openai')\nspan.set_attribute('gen_ai.request.model', 'gpt-5')\nspan.set_attribute('gen_ai.usage.prompt_tokens', 150)" },
        { term: "Interoperates with", desc: "LangSmith, Langfuse -- a shared vocabulary across AI observability tools", code: "" },
      ],
    },
  ],
};

export default opentelemetry;
