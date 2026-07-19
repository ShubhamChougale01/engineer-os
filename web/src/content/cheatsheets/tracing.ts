import type { CheatSheetData } from "./types";

const tracing: CheatSheetData = {
  title: "The Ultimate Tracing Cheat Sheet",
  subtitle: "Spans & traces · context propagation · sampling · AI pipeline debugging",
  sections: [
    {
      title: "Spans & Traces",
      color: "violet",
      rows: [
        { term: "Span", desc: "One named, timed operation -- start, duration, parent/child links", code: "with tracer.start_as_current_span('charge_payment') as span:\n    span.set_attribute('order.id', order_id)" },
        { term: "Trace", desc: "The FULL tree of spans for ONE request", code: "// Root span -> child spans -> grandchild spans, all sharing one trace_id" },
        { term: "Waterfall view", desc: "Reveals the ACTUAL bottleneck instantly -- no manual timestamp cross-referencing", code: "" },
      ],
    },
    {
      title: "Context Propagation",
      color: "blue",
      rows: [
        { term: "Synchronous HTTP", desc: "Often automatic via the traceparent header", code: "" },
        { term: "Asynchronous boundaries (THE common gap)", desc: "Queues, background jobs -- NOT automatic, needs explicit work", code: "inject(carrier)   # at PUBLISH time\nextract(message['trace_context'])   # at PROCESS time" },
        { term: "Missing propagation = an invisible gap", desc: "That service's work disappears from the trace entirely", code: "" },
      ],
    },
    {
      title: "Sampling",
      color: "emerald",
      rows: [
        { term: "Head-based", desc: "Decide at request START -- simple, may miss interesting traces", code: "" },
        { term: "Tail-based", desc: "Decide AFTER completion -- ALWAYS keep errors/slow requests", code: "if trace.has_error or trace.duration_ms > 1000: return True" },
        { term: "Production best practice", desc: "Low baseline rate (~1%) + tail-based rules for errors/slow requests", code: "" },
      ],
    },
    {
      title: "Instrumentation Design",
      color: "amber",
      rows: [
        { term: "Span granularity", desc: "Meaningful operations (DB query, API call) -- not whole request, not every function", code: "" },
        { term: "Semantic conventions", desc: "Use OpenTelemetry's standard attribute names consistently", code: "span.set_attribute('db.system', 'postgresql')" },
        { term: "Never log sensitive data in attributes", desc: "Same discipline as the Logging skill", code: "" },
      ],
    },
    {
      title: "Cross-Pillar Integration",
      color: "rose",
      rows: [
        { term: "Link traces to logs", desc: "Include trace_id + span_id in structured logs", code: "logging.info(msg, extra={'trace_id': trace_id, 'span_id': span_id})" },
        { term: "Payoff", desc: "Jump from 'this span is slow' straight to its detailed log context", code: "" },
      ],
    },
    {
      title: "AI Pipeline Application",
      color: "cyan",
      rows: [
        { term: "Span per pipeline stage", desc: "vector_search, llm_generation, tool_call -- each its own span", code: "with tracer.start_as_current_span('llm_generation') as span:\n    span.set_attribute('model', 'gpt-5')" },
        { term: "Payoff", desc: "Instantly reveals which stage (retrieval vs generation) is the REAL bottleneck", code: "// See the Agent Observability skill for deeper AI-specific application" },
      ],
    },
  ],
};

export default tracing;
