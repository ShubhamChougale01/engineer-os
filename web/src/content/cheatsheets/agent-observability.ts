import type { CheatSheetData } from "./types";

const agentObservability: CheatSheetData = {
  title: "The Ultimate Agent Observability Cheat Sheet",
  subtitle: "Traces & spans · agent-specific attributes · failure detection · OTel GenAI · vendor tools · production toolbelt",
  sections: [
    {
      title: "Core Vocabulary",
      color: "violet",
      rows: [
        { term: "Trace", desc: "The full record of one complete agent run, identified by one shared trace ID", code: "trace_id = uuid4()\n# every span in this run carries trace_id" },
        { term: "Span", desc: "One timed step inside a trace: an LLM call, a tool call, a retry", code: "span = tracer.start_span('tool_call', parent=root)" },
        { term: "Parent / child nesting", desc: "Spans nest into a tree, not a flat log line", code: "root -> planning -> tool_call -> retry" },
        { term: "Root span", desc: "The top-level span for the whole agent run", code: "with tracer.start_span('agent_run') as root: ..." },
        { term: "Span attribute", desc: "A named field recorded on a span (model, tokens, cost, tool name)", code: "span.set_attribute('gen_ai.request.model', name)" },
        { term: "Span status", desc: "ok, error, or a domain-specific status distinct from HTTP codes", code: "span.set_status('hallucinated_tool_call')\nspan.set_status('loop_detected')" },
        { term: "Correlation / trace ID propagation", desc: "Carrying the same trace ID across every hop, including agent-to-agent", code: "ctx = tracer.extract_context(parent_span)\nsub_agent(task, trace_context=ctx)" },
        { term: "Agent trace vs classical APM trace", desc: "Agent trace shape is runtime-decided; failure is semantic, not a status code", code: "APM: 200 OK, 400ms -> looks fine\nAgent: 200 OK, wrong answer -> invisible to APM" },
      ],
    },
    {
      title: "Agent-Specific Span Attributes",
      color: "blue",
      rows: [
        { term: "gen_ai.request.model", desc: "Which model served this specific hop", code: "span.set_attribute('gen_ai.request.model', 'model-x')" },
        { term: "gen_ai.usage.input_tokens", desc: "Prompt tokens for this hop", code: "span.set_attribute('gen_ai.usage.input_tokens', 120)" },
        { term: "gen_ai.usage.output_tokens", desc: "Completion tokens for this hop", code: "span.set_attribute('gen_ai.usage.output_tokens', 45)" },
        { term: "cost_usd", desc: "Estimated cost attributed to this specific span, not just the whole run", code: "span.set_attribute('cost_usd', estimate_cost(model, usage))" },
        { term: "latency_ms", desc: "Wall-clock duration of this specific span", code: "span.set_attribute('latency_ms', elapsed_ms)" },
        { term: "tool.name / tool.arguments / tool.result", desc: "What tool was called, with what args, and what came back", code: "span.set_attribute('tool.name', 'get_weather')\nspan.set_attribute('tool.arguments', {'city': 'Paris'})" },
        { term: "retry_count / retry_of", desc: "Whether this span is a retry, and of which prior attempt", code: "span.set_attribute('retry_of', prev_span.span_id)" },
        { term: "thought / rationale", desc: "The agent's stated reasoning at a step, not only its action", code: "span.set_attribute('thought', 'need weather before recommending')" },
        { term: "tool_call.valid", desc: "Whether proposed arguments passed schema validation", code: "span.set_attribute('tool_call.valid', False)" },
        { term: "Full attribute set to add first", desc: "The four highest-leverage fields if you can only add a few", code: "model, tokens, cost_usd, tool.name/arguments" },
      ],
    },
    {
      title: "Catching Failure Modes",
      color: "emerald",
      rows: [
        { term: "Hallucinated tool call", desc: "A proposed call that doesn't match a real tool or its schema", code: "try:\n  schema.model_validate(args)\nexcept ValidationError:\n  span.set_status('hallucinated_tool_call')" },
        { term: "Validate BEFORE executing", desc: "Never let unvalidated arguments reach the tool function", code: "validated = Schema.model_validate(raw_args)\nresult = tool_fn(**validated.model_dump())" },
        { term: "Infinite / unproductive loop", desc: "Repeating the same step without making progress", code: "def detect_loop(history, window=3):\n  sigs = {(s['tool'], frozenset(s['args'].items()))\n          for s in history[-window:]}\n  return len(sigs) == 1" },
        { term: "Hard step cap", desc: "A backstop even if the positive stop signal never fires", code: "for i in range(MAX_STEPS):\n    if done: break\nelse:\n    span.set_status('max_steps_exceeded')" },
        { term: "Loop guard needs BOTH", desc: "Step cap alone burns budget; similarity alone misses slow loops", code: "if detect_loop(history) or i == MAX_STEPS - 1:\n    stop_and_log()" },
        { term: "Reasoning drift", desc: "Correct final answer via unreliable intermediate reasoning", code: "score_each_step(thought)  # not just final output" },
        { term: "Hallucination rate metric", desc: "Track per tool, per model, over time -- a leading indicator", code: "hallucinated_calls / total_tool_call_attempts" },
        { term: "Loop-detected rate metric", desc: "Rising trend signals convergence failure before user complaints", code: "loop_detected_runs / total_runs" },
      ],
    },
    {
      title: "OpenTelemetry & Standards",
      color: "amber",
      rows: [
        { term: "OpenTelemetry (OTel)", desc: "Vendor-neutral tracing standard; trace/span model + exporters", code: "OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318" },
        { term: "GenAI semantic conventions", desc: "Standardized attribute names for LLM/agent spans across tools", code: "gen_ai.system\ngen_ai.request.model\ngen_ai.usage.input_tokens" },
        { term: "Why adopt standard names", desc: "Any OTel-compatible backend renders your spans without a custom mapper", code: "# use gen_ai.request.model\n# not your own model_used field" },
        { term: "OTel collector", desc: "A vendor-neutral hop that fans spans out to one or more backends", code: "receivers: [otlp]\nexporters: [otlphttp/vendorA, logging]" },
        { term: "Redaction processor", desc: "Strip PII/secrets in the collector before export, not after ingestion", code: "processors:\n  attributes/redact:\n    actions:\n      - key: tool.arguments.ssn\n        action: delete" },
        { term: "Span kinds", desc: "Distinguishes a plain chat span from a tool-execution span", code: "span_kind = 'tool_execution' | 'chat' | 'agent'" },
        { term: "Verify before quoting", desc: "GenAI conventions are still evolving -- check current stabilization", code: "# check opentelemetry.io/docs directly" },
      ],
    },
    {
      title: "Multi-Agent & Human Review",
      color: "rose",
      rows: [
        { term: "Propagate context across handoffs", desc: "Trace ID + parent span ID must cross every agent boundary", code: "ctx = tracer.extract_context(parent_span)\nresult = sub_agent_fn(task, trace_context=ctx)" },
        { term: "Cross-org / A2A boundary", desc: "Remote agent is a black box -- log the delegation, not its internals", code: "span.set_attribute('delegate_to', remote_agent_id)\nspan.set_output(remote_response)" },
        { term: "Unified vs fragmented trace", desc: "Missing propagation turns one failure into two disconnected traces", code: "# bad: orchestrator trace + separate worker trace\n# good: one trace_id spans both" },
        { term: "Filtered review queue", desc: "Route only flagged traces to humans -- never every trace", code: "WHERE status IN\n ('error','loop_detected','low_score')" },
        { term: "Approval gate trigger", desc: "High-consequence actions pause for human sign-off before executing", code: "if action.is_high_consequence:\n    await request_human_approval(trace_id)" },
        { term: "Attach eval score to trace", desc: "Quality signals and execution data live in one queryable place", code: "trace.set_attribute('eval_score', judge_score)" },
      ],
    },
    {
      title: "Debugging & Monitoring Queries",
      color: "cyan",
      rows: [
        { term: "Filter by non-ok status", desc: "Find the pattern across many runs, not just one trace", code: "traces WHERE status != 'ok' AND time > now() - 1h" },
        { term: "Sort by cost/latency", desc: "Find the actual dominant hop instead of guessing", code: "spans WHERE trace_id = X ORDER BY cost_usd DESC" },
        { term: "Group hallucinations by tool", desc: "Spot which specific tool/model combo regressed", code: "spans WHERE tool_call.valid = false GROUP BY tool.name" },
        { term: "Pull up a reported bad run", desc: "Reproduce from the actual trace, not by re-running blindly", code: "traces WHERE trace_id = '<id-from-user-report>'" },
        { term: "Cost/latency dashboard", desc: "Per-hop breakdown, not just aggregate totals", code: "gauge('agent.run.cost_usd', total, tags={'status': s})" },
        { term: "Alert vs page thresholds", desc: "Page on sudden spikes; alert (don't page) on slow drifts", code: "page: error_rate spike this hour\nalert: eval_score drifting down over days" },
        { term: "Async batched export", desc: "Never let span export add latency to the agent's own request path", code: "processors: [batch]\n# flush spans off the hot path" },
        { term: "Sampling bias", desc: "Keep error/loop/low-score traces; never sample uniformly at random", code: "if status != 'ok' or eval_score < THRESHOLD:\n    always_keep(trace)" },
      ],
    },
    {
      title: "Vendors & Related Skills",
      color: "violet",
      rows: [
        { term: "LangSmith", desc: "Hosted (or self-hosted) platform, tightest LangChain/LangGraph integration", code: "# vendor implementation, not the discipline itself" },
        { term: "Langfuse", desc: "Open-source, self-hostable, framework-agnostic, OTel-native ingestion", code: "# Postgres + ClickHouse + Redis self-hosted stack" },
        { term: "Raw OTel + generic backend", desc: "Maximum portability, more manual agent-specific setup", code: "# no vendor lock-in; you build the loop/hallucination guards" },
        { term: "This page is NOT a vendor", desc: "Traces/spans/attributes/failure detection apply to any tool", code: "# LangSmith, Langfuse, or in-house -- same concepts" },
        { term: "Not AI Evals", desc: "Observability captures what happened; evals judge if it was good", code: "trace.attach(eval_score)  # the connective move" },
        { term: "Not a guardrail", desc: "Surfaces bad behavior; enforcement is a separate layer", code: "# see Human-in-the-Loop AI for enforcement" },
        { term: "Related platform skills", desc: "Cross-references worth knowing by name", code: "Multi-Agent Systems, Human-in-the-Loop AI,\nMCP, AI Evals, Prompt Versioning, Model Routing" },
      ],
    },
  ],
};

export default agentObservability;
