import type { CheatSheetData } from "./types";

const aiMonitoring: CheatSheetData = {
  title: "The Ultimate AI Monitoring Cheat Sheet",
  subtitle: "Quality, drift, cost, and tracing toolbelt for LLM systems in production",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "AI Monitoring", desc: "Observability layer specific to quality/drift/cost, on top of traditional APM", code: "Not: is it up, is it fast, did it error\nBut: was it correct, is it hallucinating,\nhas the model/input drifted, what did it cost" },
        { term: "Traditional vs AI-specific", desc: "The two layers a production LLM system needs, together", code: "Logging/Metrics/Tracing/Prometheus/Grafana\n  -> uptime, latency, error rate\nAI Monitoring\n  -> quality, hallucination, drift, cost" },
        { term: "Trace", desc: "Root container for one end-to-end request", code: "with tracer.start_as_current_span('rag_request'):\n    ..." },
        { term: "Span", desc: "One pipeline stage: retrieval, generation, tool call", code: "with tracer.start_as_current_span('retrieval') as s:\n    s.set_attribute('num_docs', len(docs))" },
        { term: "Span attributes", desc: "Fields that make later slicing possible", code: "model, prompt_version, feature, user_id,\ninput_tokens, output_tokens, cost_usd" },
        { term: "Quality score", desc: "A judgment attached to a trace after the fact", code: "attach_score(trace_id, name='judge_correctness',\n  value=0.86)" },
        { term: "Why 200 OK isn't enough", desc: "A request can succeed and still be wrong", code: "# no error, no elevated latency,\n# still a hallucinated / irrelevant answer" },
      ],
    },
    {
      title: "Tracing a Pipeline",
      color: "blue",
      rows: [
        { term: "Instrument with OTel", desc: "Vendor-neutral span/attribute model", code: "from opentelemetry import trace\ntracer = trace.get_tracer('rag-pipeline')" },
        { term: "Nest spans per stage", desc: "Retrieval, generation, tool calls as children of one trace", code: "with tracer.start_as_current_span('rag_request'):\n  with tracer.start_as_current_span('retrieval'): ...\n  with tracer.start_as_current_span('generation'): ..." },
        { term: "Tag model + cost", desc: "Non-negotiable for later cost/quality slicing", code: "span.set_attribute('generation.model', resp.model)\nspan.set_attribute('generation.cost_usd', cost)" },
        { term: "Platform alternative", desc: "LangSmith / Langfuse implement this out of the box", code: "# see LangSmith and Langfuse skills\n# trace/span/generation model, dashboards included" },
        { term: "Keep overhead off critical path", desc: "Span creation is cheap; never block on scoring", code: "# span.set_attribute() is in-memory, fast\n# NEVER call a judge model synchronously here" },
      ],
    },
    {
      title: "Quality, Feedback & Async Scoring",
      color: "emerald",
      rows: [
        { term: "Score asynchronously", desc: "Judge calls cost latency; never run in request path", code: "def answer(q):\n    ans = llm.generate(q)\n    enqueue_for_async_scoring(trace_id, ans)  # non-blocking\n    return ans" },
        { term: "Per-stage decomposition", desc: "Score retrieval and generation independently", code: "relevance = score_retrieval_relevance(q, docs)\nfaithfulness, hallucinated = score_faithfulness(ans, docs)" },
        { term: "LLM-as-judge", desc: "Use a pinned model version, not a floating alias", code: "judge_client.score(answer, model='gpt-4o-2024-08-06')\n# NOT model='gpt-4o-latest'" },
        { term: "Explicit feedback", desc: "Thumbs up/down — typically low response rate", code: "langfuse.score(trace_id=t, name='thumbs_up', value=1)" },
        { term: "Implicit feedback", desc: "Regeneration, edits, abandonment — higher volume proxy", code: "# track: did user regenerate? edit output?\n# abandon session right after this answer?" },
        { term: "Hallucination rate", desc: "Fraction of answers not grounded in retrieved context", code: "# see Hallucination skill for taxonomy + mitigation" },
        { term: "Self-preference bias risk", desc: "Same model as judge and generator can over-rate itself", code: "# use a different model family as judge,\n# or periodically cross-check with human review" },
      ],
    },
    {
      title: "Drift Detection",
      color: "amber",
      rows: [
        { term: "Input distribution drift", desc: "The population of what users ask has shifted", code: "drift = norm(recent_embeddings.mean(0)\n            - reference_embeddings.mean(0))" },
        { term: "Model behavior drift", desc: "Provider silently changed what a model alias serves", code: "# detect via a fixed golden set, NOT live traffic alone" },
        { term: "Golden / canary set", desc: "Fixed, versioned inputs re-run on a schedule", code: "run_canary_check(golden_set, llm_client, judge)\n# compare avg_score vs stored baseline" },
        { term: "Schedule", desc: "Daily, or on every deploy touching prompt/model config", code: "0 6 * * * python -m obs.canary --golden-set g.jsonl" },
        { term: "Drift != regression", desc: "Drift is a signal to re-evaluate, not proof of bad quality", code: "# alert on drift and on quality regression\n# as SEPARATE alerts" },
        { term: "Version the golden set", desc: "Check into source control alongside code", code: "tests/golden_set.jsonl  # git history = auditable" },
      ],
    },
    {
      title: "Cost Tracking",
      color: "rose",
      rows: [
        { term: "Tag at write time", desc: "user_id + feature + model on every generation span", code: "span.set_attribute('user_id', uid)\nspan.set_attribute('feature', 'support_chat')" },
        { term: "Token to dollar", desc: "Multiply captured usage by per-model pricing", code: "cost = in_tok * price_in + out_tok * price_out" },
        { term: "Per-feature aggregation", desc: "Sum cost grouped by feature/user, not from an invoice later", code: "per_feature[t['feature']] += t['cost_usd']" },
        { term: "Rate-of-change alert", desc: "Catches retry loops / bugs, not just organic growth", code: "if today_cost > 3 * trailing_7d_avg:\n    flag_feature(feature)" },
        { term: "Zero-cost bug", desc: "Custom/self-hosted or fallback models need manual usage", code: "# if cost == 0, usage wasn't populated\n# for a non-auto-instrumented call" },
        { term: "Cross-check cost vs quality", desc: "A cheaper model swap may quietly hurt quality", code: "# always view cost dashboards next to\n# quality dashboards for the same window" },
      ],
    },
    {
      title: "Alerting & Anti-Patterns",
      color: "cyan",
      rows: [
        { term: "Sustained trend, not noise", desc: "Require multiple windows below threshold", code: "alert = (avg_24h < t) and (avg_72h < t)\n# a single bad hour is expected variance" },
        { term: "Route to the right team", desc: "Quality alerts go to prompt/pipeline owners, not infra on-call", code: "# a regression is usually a prompt/product fix,\n# not an infra fix" },
        { term: "WRONG: sync scoring in request path", desc: "Adds a second model call's latency to every request", code: "# WRONG: score = judge.score(ans); return ans\n# RIGHT: enqueue_for_async_scoring(id, ans); return ans" },
        { term: "WRONG: floating judge model", desc: "Confounds regressions with judge-side changes", code: "# WRONG: model='latest'\n# RIGHT: model='gpt-4o-2024-08-06' (pinned)" },
        { term: "WRONG: no golden set", desc: "Can't isolate model drift from traffic drift", code: "# without a fixed reference set, both look\n# identical as a live-traffic score movement" },
        { term: "WRONG: one holistic score only", desc: "Can't localize which pipeline stage regressed", code: "# score retrieval relevance AND generation\n# faithfulness separately, not just end-to-end" },
        { term: "Redact before capture", desc: "PII flows into traces and judge-call payloads by default", code: "# scrub sensitive fields BEFORE trace()/judge call\n# monitoring does not redact for you" },
        { term: "Build vs buy", desc: "Custom OTel build vs LangSmith/Langfuse platform", code: "# custom: fits existing Prometheus/Grafana stack\n# platform: datasets/evaluators/cost dashboards built-in" },
      ],
    },
  ],
};

export default aiMonitoring;
