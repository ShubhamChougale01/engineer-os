import type { CheatSheetData } from "./types";

const langfuse: CheatSheetData = {
  title: "The Ultimate Langfuse Cheat Sheet",
  subtitle: "Tracing · evaluation · prompt management · self-hosting toolbelt",
  sections: [
    {
      title: "Setup & Core Objects",
      color: "violet",
      rows: [
        { term: "Install", desc: "Python and JS/TS SDKs", code: "pip install langfuse\nnpm install langfuse" },
        { term: "Env vars", desc: "Auth and target host", code: "LANGFUSE_PUBLIC_KEY=pk-lf-...\nLANGFUSE_SECRET_KEY=sk-lf-...\nLANGFUSE_HOST=https://cloud.langfuse.com" },
        { term: "Client init", desc: "One instance per process, not per request", code: "from langfuse import Langfuse\nlangfuse = Langfuse()" },
        { term: "Trace", desc: "Root container for one operation", code: "trace = langfuse.trace(\n  name='ask', user_id='u1', session_id='c1')" },
        { term: "Span", desc: "Nested timed unit of work", code: "span = trace.span(name='retrieve')\nspan.end(output={'num_docs': 3})" },
        { term: "Generation", desc: "Span specialized for an LLM call", code: "gen = trace.generation(\n  name='answer', model='gpt-4o-mini', input=prompt)\ngen.end(output=answer, usage={'input':40,'output':10,'total':50})" },
        { term: "Event", desc: "Zero-duration marker inside a trace", code: "trace.event(name='cache_hit')" },
        { term: "Score", desc: "Attach a quality judgment to a trace", code: "langfuse.score(trace_id=trace.id,\n  name='thumbs_up', value=1)" },
        { term: "Flush", desc: "Force-send buffered events before exit", code: "langfuse.flush()  # call at shutdown,\n# NEVER synchronously per-request" },
      ],
    },
    {
      title: "Instrumentation Patterns",
      color: "blue",
      rows: [
        { term: "@observe decorator", desc: "Infers trace/span tree from call stack", code: "from langfuse.decorators import observe\n\n@observe()\ndef pipeline(q): ..." },
        { term: "@observe as generation", desc: "Mark a wrapped function as an LLM call", code: "@observe(as_type='generation')\ndef call_llm(prompt): ..." },
        { term: "Update current observation", desc: "Attach usage/metadata inside a decorated fn", code: "from langfuse.decorators import langfuse_context\nlangfuse_context.update_current_observation(\n  usage={'input':10,'output':5})" },
        { term: "LangChain callback", desc: "One-line auto-instrumentation", code: "from langfuse.callback import CallbackHandler\nhandler = CallbackHandler()\nllm.invoke(prompt, config={'callbacks':[handler]})" },
        { term: "LlamaIndex integration", desc: "Similar callback-based auto-tracing", code: "from llama_index.core import set_global_handler\nset_global_handler('langfuse')" },
        { term: "Nested spans", desc: "Model a real multi-step pipeline", code: "s = trace.span(name='retrieve'); s.end(output=docs)\ng = trace.generation(name='answer'); g.end(output=ans)" },
        { term: "Error handling", desc: "Close a generation even on failure", code: "try:\n  out = call_provider(p)\nexcept Exception as e:\n  gen.end(level='ERROR', status_message=str(e)); raise\nelse:\n  gen.end(output=out)" },
        { term: "OTel ingestion", desc: "Newer versions accept OTel-formatted spans", code: "# Route existing OpenTelemetry spans into\n# Langfuse without a parallel instrumentation layer" },
      ],
    },
    {
      title: "Prompts, Datasets & Evaluation",
      color: "emerald",
      rows: [
        { term: "Fetch a prompt", desc: "Always by label, never 'latest' in prod", code: "prompt = langfuse.get_prompt(\n  'support-answer', label='production')" },
        { term: "Compile a prompt", desc: "Fill template variables", code: "compiled = prompt.compile(question=q, tone='friendly')" },
        { term: "Link generation to prompt", desc: "Enables 'which version produced this'", code: "trace.generation(..., prompt=prompt)" },
        { term: "Create a dataset", desc: "A fixed set of test inputs", code: "langfuse.create_dataset(name='refund-questions')" },
        { term: "Add dataset item", desc: "Input plus optional expected output", code: "langfuse.create_dataset_item(\n  dataset_name='refund-questions',\n  input={'q':'refund time?'}, expected_output='5 days')" },
        { term: "Run against a dataset", desc: "Link a run's trace back to the item", code: "for item in dataset.items:\n  trace = langfuse.trace(name='run')\n  item.link(trace, run_name='prompt-v3')" },
        { term: "Exact-match scoring", desc: "Simplest automated evaluator", code: "langfuse.score(trace_id=t.id, name='exact_match',\n  value=1.0 if out == expected else 0.0)" },
        { term: "LLM-as-judge", desc: "Use a strong model to grade output quality", code: "# ask a judge model to score correctness/tone,\n# attach result via langfuse.score(...)" },
        { term: "Session grouping", desc: "Group traces into one conversation", code: "langfuse.trace(name='turn', session_id='conv_9')" },
        { term: "User grouping", desc: "Product analytics, not just debugging", code: "langfuse.trace(name='ask', user_id='user_123')" },
      ],
    },
    {
      title: "Cost, Performance & Monitoring",
      color: "amber",
      rows: [
        { term: "Token usage", desc: "Required for cost to compute correctly", code: "gen.end(output=out, usage={'input':40,'output':12,'total':52})" },
        { term: "Zero-cost bug", desc: "Custom/self-hosted models need manual usage", code: "# If cost shows 0, you forgot to pass usage=\n# for a non-auto-instrumented model call" },
        { term: "Latency capture", desc: "Time around the provider call yourself", code: "start = perf_counter()\n... call ...\ngen.end(metadata={'latency_s': perf_counter()-start})" },
        { term: "RED metrics per route", desc: "Rate, Errors, Duration — track per prompt/model", code: "# avg score, p95 latency, cost/trace,\n# error rate, sliced by prompt version" },
        { term: "SDK debug logging", desc: "See ingestion errors during development", code: "import logging\nlogging.getLogger('langfuse').setLevel(logging.DEBUG)" },
        { term: "Fail-open behavior", desc: "An outage in Langfuse should not break your app", code: "# verify with a test: SDK should swallow\n# ingestion errors, not raise into your request path" },
        { term: "Structured log bridge", desc: "Correlate app logs with a trace URL", code: "log.info('trace_started', trace_id=trace.id,\n  user_id=user_id, session_id=session_id)" },
      ],
    },
    {
      title: "Gotchas & Anti-Patterns",
      color: "rose",
      rows: [
        { term: "Forgetting flush()", desc: "#1 cause of missing traces in short scripts", code: "def handler(event, ctx):\n  ... trace work ...\n  langfuse.flush()  # required in Lambda/CLI" },
        { term: "New trace per LLM call", desc: "Breaks the single-tree cost/latency view", code: "# WRONG: langfuse.trace() for every step\n# RIGHT: one trace, nested span()/generation()" },
        { term: "Hardcoded prompts", desc: "No version history, no rollback", code: "# WRONG: PROMPT = 'Answer: {q}'\n# RIGHT: langfuse.get_prompt(name, label='production')" },
        { term: "Fetching 'latest' in prod", desc: "Untested edits reach live traffic instantly", code: "# use label='production' explicitly, always" },
        { term: "Sync flush per-request", desc: "Adds latency the async design was meant to avoid", code: "# only flush at shutdown or in batch scripts" },
        { term: "No redaction", desc: "PII flows into trace storage by default", code: "# scrub sensitive fields BEFORE trace()/generation()\n# Langfuse does not redact for you" },
        { term: "Trusting judge scores blindly", desc: "Judge bias needs periodic human spot-checks", code: "# sample judged traces, compare to human review" },
        { term: "Session ID retrofitting", desc: "Cannot be added to historical traces later", code: "# pass user_id/session_id consistently from day one" },
      ],
    },
    {
      title: "Self-Hosting & Architecture",
      color: "cyan",
      rows: [
        { term: "Postgres role", desc: "Transactional: projects, prompts, API keys", code: "DATABASE_URL=postgresql://user:pass@host:5432/langfuse" },
        { term: "ClickHouse role", desc: "Analytical: trace/span/generation events at scale", code: "CLICKHOUSE_URL=http://clickhouse:8123" },
        { term: "Redis role", desc: "Queues ingestion work, caches hot reads", code: "# e.g. cached prompt fetches, ingestion queue" },
        { term: "Blob storage", desc: "Offloads large payloads (docs, images)", code: "# S3-compatible bucket for big inputs/outputs" },
        { term: "Docker Compose", desc: "Smallest self-hosted footprint", code: "docker compose up -d\n# pin exact image tags, not 'latest'" },
        { term: "Kubernetes/Helm", desc: "Production self-hosting at scale", code: "helm install langfuse langfuse/langfuse" },
        { term: "Cloud vs self-hosted", desc: "Choose based on compliance/cost, not defaults", code: "# self-host for data residency, lock-in avoidance,\n# cost at high volume; cloud for zero ops" },
        { term: "Network exposure", desc: "Never expose DBs directly to the internet", code: "# API server behind ingress/auth;\n# Postgres/ClickHouse/Redis on a private network" },
      ],
    },
  ],
};

export default langfuse;
