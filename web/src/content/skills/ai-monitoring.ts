import type { SkillContent } from "../types";

/**
 * AI Monitoring — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const aiMonitoring: SkillContent = {
  overview: `
AI Monitoring is the discipline of observing an AI system — specifically an LLM-powered application — in production to answer questions that traditional software monitoring was never built to answer: was this specific answer correct, is output quality drifting over the last two weeks, did the underlying model change behavior overnight because a provider silently updated it, how much does this one feature cost per user per day across three different model providers, and which specific step in a five-stage agent pipeline caused a bad final answer.

Traditional observability — the discipline covered by the **Logging**, **Metrics**, **Tracing**, **Prometheus**, **Grafana**, and **OpenTelemetry** skills — answers "is the system up, is it fast, did it error." Those questions matter just as much for an LLM system as for any other service: a RAG endpoint still needs uptime, p95 latency, and error-rate dashboards. But an LLM system can be perfectly up, fast, and error-free while being systematically wrong — confidently hallucinating, retrieving irrelevant context, or drifting toward a worse answer distribution — and none of that shows up as a 500 status code or an elevated CPU graph. AI Monitoring is the layer that sits on top of traditional observability and answers the quality question traditional tooling has no opinion on.

Concretely, AI Monitoring covers four overlapping concerns: (1) **request-level tracing** through a multi-step pipeline (retrieval, generation, tool calls, sub-agent calls) so a bad output can be traced back to the step that caused it; (2) **quality metrics over time** — output quality scores, hallucination rate, user feedback signals (thumbs up/down, edits, regenerations) — tracked the way you'd track error rate, but for correctness instead of availability; (3) **drift detection** — noticing when the distribution of inputs shifts, or when a model's behavior changes after a provider pushes a silent update to a model alias; and (4) **cost and usage accounting** — tracking spend per request, per user, per feature, across however many model providers a system calls.

Key characteristics: it is inherently probabilistic (there is no single "correct" answer to grade against for most generative tasks, unlike a database query that either returns the right row or doesn't); it depends on either human feedback signals or automated judges (see the **Evaluation** and **Hallucination** skills) rather than deterministic assertions; it must track a moving target, because both the input distribution (what users ask) and the model itself (what the provider serves behind a model name) change without your code changing at all; and it composes with, rather than replaces, traditional observability — a production LLM system needs both stacks running side by side. Purpose-built platforms in this space — see the **LangSmith** and **Langfuse** skills — implement large parts of this discipline out of the box, but the concepts here apply whether you adopt one of those platforms, build your own instrumentation on top of OpenTelemetry, or do some mix of both.
`,

  history: `
AI Monitoring as a named discipline is young — it emerged directly out of the gap that opened up once teams started shipping GPT-3.5/GPT-4-era applications to real users around 2022–2023 and discovered that their existing APM stack (Datadog, New Relic, a Prometheus/Grafana setup) told them nothing about whether the answers were any good.

| Year | Milestone |
|------|-----------|
| 2020–2021 | Early GPT-3 API applications ship with essentially no observability beyond raw request logging; teams debug by manually reading through log files of prompts and completions |
| 2022 | ChatGPT-driven demand pushes many more teams into production with LLM features; the gap between "the server is up" and "the answers are good" becomes a widely shared pain point |
| 2023 | The first dedicated LLM observability products (LangSmith, Langfuse, and others) launch, introducing the trace/span/generation data model as a purpose-built alternative to grepping logs; "LLMOps" becomes a common label for this emerging practice area |
| 2023–2024 | Hallucination detection, LLM-as-judge scoring, and dataset-based regression evaluation become standard features across observability platforms, moving the category from pure tracing toward quality measurement |
| 2024 | Concern about silent model updates (a provider changing what a fixed model alias actually points to, or updating a model's weights/behavior without a version bump visible to API consumers) pushes teams to build behavioral drift checks — periodic golden-set re-runs — as a defensive practice |
| 2024–2025 | Cost-per-request and cost-per-user tracking mature into standard dashboard features as multi-provider, multi-model architectures become common and CFOs start asking pointed questions about LLM API spend |
| 2025+ | Agent-specific monitoring (tool-call sequences, multi-agent handoffs, plan-execution divergence) becomes the fastest-growing sub-area as agentic systems move from demos to production |

Treat the exact feature-availability dates above as directional. My knowledge cutoff is early 2026 and this space moves quickly; verify current-state claims against a platform's own changelog before quoting a date in an interview or design doc.
`,

  "why-it-exists": `
Before AI Monitoring existed as a distinct practice, teams applied the only observability model they had: traditional APM. That model was built around a set of assumptions that simply don't hold for LLM systems.

Traditional observability assumes: a request either succeeds or fails (a status code), the thing you care about is measurable objectively (latency in milliseconds, error rate as a fraction), and the system's behavior for a given input is stable over time unless you deploy new code. None of those assumptions survive contact with an LLM system. A request can return HTTP 200 with a confidently wrong answer. "Quality" has no objective ground truth for most generative tasks — grading it requires either a human or another model acting as a judge. And the system's behavior can change without a single line of your code changing, because the model behind a fixed API endpoint or model name is itself a moving target controlled by a third party.

AI Monitoring exists to fill exactly that gap: it is what observability looks like once you accept that "did the request succeed" and "was the request any good" are two entirely different questions, and that the second one needs its own instrumentation, its own metrics, its own alerting logic, and often its own dedicated tooling (see the **LangSmith** and **Langfuse** skills) layered on top of — not instead of — the traditional stack (**Logging**, **Metrics**, **Tracing**, **Prometheus**, **Grafana**, **OpenTelemetry**).
`,

  "problem-it-solves": `
Concretely, AI Monitoring removes:

- **Blindness to quality regressions that don't throw errors**: a prompt tweak, a silent provider-side model update, or a subtly broken retrieval index can all degrade answer quality while every traditional dashboard stays green. Without quality-specific monitoring, the first signal a team gets is angry users or a support ticket spike, days after the regression started.
- **Inability to localize a bad answer inside a multi-step pipeline**: in a RAG or agent system, a wrong final answer could stem from bad retrieval, a bad tool call, a hallucinating generation step, or a broken reranker. Flat application logs don't show the causal tree; request-level tracing does.
- **Cost opacity across models, users, and features**: without per-request cost attribution, "why did our OpenAI bill triple last month" is answered by reading a billing dashboard days later, not by looking at a per-feature cost breakdown the moment it started climbing.
- **Silent model drift**: providers periodically update what a model alias serves (behind the scenes weight updates, routing changes, or a deprecation forcing a fallback model) without necessarily surfacing that to API consumers in a way you'd notice unless you're actively watching for behavioral change on a fixed golden set.
- **Input distribution shift going unnoticed**: if the population of what users are asking shifts (a new user segment, a new feature driving different query types), a system tuned and evaluated against the old distribution can quietly perform worse on the new one, with no infrastructure signal indicating anything is wrong.
- **Feedback signals going uncollected or unused**: thumbs up/down, edits, regenerations, and abandonment are rich quality signals that, without dedicated monitoring, either aren't captured at all or are captured but never aggregated into a trend anyone watches.

What AI Monitoring deliberately does **not** solve: it is not itself an evaluation methodology (see the **Evaluation** skill for how to design a judge or a rubric — monitoring is where you deploy and track those judgments over time, not where you invent them); it is not a hallucination-prevention technique (see the **Hallucination** skill for mitigation strategies — monitoring detects and measures the rate, it doesn't reduce it by itself); it is not a cost-reduction technique by itself (see the **Cost Optimization** skill for caching, routing, and budget strategies — monitoring gives you the visibility that makes those decisions possible, it doesn't implement them); and it does not replace traditional infrastructure observability — a system can have excellent quality monitoring and still fall over from a database connection leak that only **Metrics**, **Tracing**, and **Prometheus**/**Grafana** would catch.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the distinction between traditional software observability (uptime, latency, error rate) and AI-specific observability (quality, hallucination rate, drift, cost) and articulate why an LLM system needs both.
2. Instrument a multi-step pipeline (retrieval, generation, tool calls) with request-level tracing that captures span-level attributes sufficient to localize the cause of a bad answer.
3. Design and track a quality metric over time — from a human feedback signal, an automated judge score, or both — and distinguish a real regression from normal variance.
4. Detect input distribution drift and model-behavior drift using a fixed golden/canary set re-run on a schedule, and explain why silent provider-side model updates make this necessary even with no code changes on your side.
5. Build per-request, per-user, and per-feature cost attribution across multiple model providers, and connect that to alerting thresholds.
6. Design an alerting strategy for quality regressions that avoids both alert fatigue (from noisy, low-signal thresholds) and dangerously slow detection (from thresholds too loose to catch a real regression).
7. Choose between adopting a purpose-built platform (**LangSmith**, **Langfuse**) versus building custom instrumentation on **OpenTelemetry** primitives, and articulate the tradeoffs of each path.
8. Identify the production-checklist items that separate a system with real AI monitoring from one that only has traditional infrastructure monitoring and assumes that's sufficient.

By this point in the platform's LLM-observability sequence, you should also be able to place this page precisely relative to **LangSmith** and **Langfuse** (which implement much of this discipline as a product) and relative to **Evaluation**/**Hallucination** (which define what "quality" and "hallucination" even mean, upstream of monitoring them).
`,

  prerequisites: `
- **Required**: comfort building an application that calls an LLM API, and a basic mental model of what a prompt, a completion, and a token are. See the **Python** skill if you need general programming footing first.
- **Required**: the traditional observability foundations — the **Logging**, **Metrics**, and **Tracing** skills — since AI Monitoring is explicitly a layer built on top of, and using the same vocabulary as, that stack. If you don't yet know what a span, a histogram, or a structured log line is, start there.
- **Strongly recommended**: **OpenTelemetry**, since it supplies the vendor-neutral trace/span/attribute model that most AI-specific instrumentation (including this page's worked example) is built on or maps onto.
- **Strongly recommended**: **Evaluation** and **Hallucination**, which define the methodology (LLM-as-judge design, rubric scoring, hallucination taxonomy) that AI Monitoring deploys and tracks over time — this page assumes you can at least sketch what "a quality score" means and focuses on how to operationalize measuring it continuously in production.
- **Helpful**: **Prometheus** and **Grafana**, since a common architecture emits AI-specific metrics into the same time-series store and dashboarding tool already running for infrastructure metrics.
- **Helpful**: **LangSmith** and **Langfuse**, purpose-built platforms that implement large parts of this discipline; this page treats them as one valid implementation path among several, not the only one.
- **Helpful**: **Cost Optimization** and **Latency**, the two adjacent skills that this page's cost- and performance-tracking sections feed directly into — monitoring surfaces the numbers, those skills tell you what to do about them.

Dependency links: **Logging/Metrics/Tracing** (general observability) → **OpenTelemetry** (vendor-neutral instrumentation standard) → this page (the AI-specific layer) → **LangSmith**/**Langfuse** (purpose-built implementations) → **Evaluation**/**Hallucination** (the methodology this page's quality metrics are built from) → **Cost Optimization**/**Latency** (what you do with the numbers this page surfaces).
`,

  "beginner-concepts": `
### The four things AI Monitoring tracks that traditional monitoring doesn't

~~~text
Traditional observability          AI Monitoring adds
------------------------           -------------------
Is it up? (uptime)                 Is the answer correct? (quality score)
Is it fast? (latency, p95)         Is it hallucinating? (hallucination rate)
Did it error? (error rate)         Did users like it? (feedback signal)
How much CPU/memory?               How much does this cost per request/user?
                                    Has the input distribution shifted? (drift)
                                    Has the model's behavior changed? (drift)
~~~

Both columns matter for the same production system. A RAG chatbot that answers in 200ms with zero errors is still a failure if it's confidently making up policy details that don't exist — that's a quality problem no uptime dashboard will ever surface.

### The smallest possible quality-tracking setup

Before reaching for a platform, the core idea can be built with almost nothing: log a request identifier, the output, and a quality signal, then look at the trend.

~~~python
import time
import json

def log_interaction(request_id: str, question: str, answer: str, user_feedback: int | None):
    """The absolute minimum viable AI-monitoring record.
    user_feedback: 1 (thumbs up), -1 (thumbs down), or None (no signal yet)."""
    record = {
        "request_id": request_id,
        "timestamp": time.time(),
        "question": question,
        "answer": answer,
        "feedback": user_feedback,
    }
    # In a real system this goes to a database or an observability platform,
    # not a print statement — but the SHAPE of the record is what matters here.
    print(json.dumps(record))
~~~

Even this minimal version answers a question traditional logs can't: "what fraction of answers this week got a thumbs-down, and is that fraction going up." That single ratio, tracked over time, is the seed of everything more sophisticated in this page.

### Request-level tracing: the unit of work

An LLM request is rarely one call. A typical RAG request is: embed the query, retrieve documents, optionally rerank, construct a prompt, call the LLM, maybe call a tool, and return an answer. AI Monitoring's tracing layer captures each of those as a nested span under one trace, exactly the way **Tracing** and **OpenTelemetry** model a multi-service backend request — the difference is which attributes get attached to each span (token counts, retrieved document IDs, a quality score) rather than the mechanism itself.

~~~python
# Conceptual shape — see Internal Working for the full OpenTelemetry-based example
trace = start_trace(name="rag_answer")
with trace.span("retrieve") as span:
    docs = retriever.search(query)
    span.set_attribute("num_docs_retrieved", len(docs))
with trace.span("generate") as span:
    answer = llm.generate(prompt_with(docs))
    span.set_attribute("tokens_used", answer.usage.total_tokens)
~~~

### Quality metrics are not a single number

Unlike error rate (binary: did it 5xx or not), quality is usually a composite: an automated correctness score, a hallucination flag, a relevance score for retrieved context, and a human feedback signal, tracked separately because they catch different failure modes — a retrieval-relevance drop and a generation hallucination look identical from the user's perspective (a bad answer) but require completely different fixes.

### Cost as a first-class metric

Every LLM call has a token-based cost. The beginner-level habit to build immediately: log input tokens, output tokens, and the model used on every single call, even before you build any dashboard on top of it — that raw data is what every cost-tracking feature described later in this page depends on, and it cannot be reconstructed retroactively if you didn't capture it at the time.
`,

  "intermediate-concepts": `
### Tracing a full pipeline with span attributes

~~~python
from opentelemetry import trace

tracer = trace.get_tracer("rag-pipeline")

def answer_question(question: str, user_id: str) -> str:
    with tracer.start_as_current_span("rag_request") as root:
        root.set_attribute("user_id", user_id)

        with tracer.start_as_current_span("retrieval") as span:
            docs = retriever.search(question, top_k=5)
            span.set_attribute("retrieval.num_docs", len(docs))
            span.set_attribute("retrieval.top_score", docs[0].score if docs else 0.0)

        with tracer.start_as_current_span("generation") as span:
            prompt = build_prompt(question, docs)
            response = llm_client.generate(prompt)
            span.set_attribute("generation.model", response.model)
            span.set_attribute("generation.input_tokens", response.usage.input_tokens)
            span.set_attribute("generation.output_tokens", response.usage.output_tokens)
            span.set_attribute("generation.cost_usd", estimate_cost(response))

        root.set_attribute("final_answer_length", len(response.text))
        return response.text
~~~

This is the same span-nesting discipline as any distributed trace (see **OpenTelemetry**), with attributes chosen specifically to answer AI-relevant questions later: which retrieval call fed which generation, how many tokens and dollars each step cost, and — once a quality score is attached asynchronously — which step's attributes correlate with low scores.

### Attaching quality scores after the fact

Quality judgments (human feedback, an LLM-as-judge score, an automated hallucination check) usually can't be computed synchronously in the request path without adding unacceptable latency, so the common pattern is: trace the request now, score it asynchronously (a background job, a batch judge pass, or a UI feedback event days later), and join the score back to the trace by request ID.

~~~python
def score_trace_async(request_id: str, answer: str, retrieved_docs: list[str]) -> None:
    """Runs out-of-band — e.g. a queue consumer or a scheduled batch job —
    not in the user-facing request path."""
    judge_score = llm_as_judge_score(answer, retrieved_docs)   # see Evaluation skill
    hallucination_flag = check_hallucination(answer, retrieved_docs)  # see Hallucination skill
    attach_score(request_id, name="judge_correctness", value=judge_score)
    attach_score(request_id, name="hallucination_detected", value=hallucination_flag)
~~~

Decoupling scoring from the request path is the single most important intermediate-level design decision in this whole discipline: it keeps monitoring overhead off user-facing latency (see the **Latency** skill) while still producing a fully joined, queryable record.

### Tracking quality over time, not just per-request

A single request's quality score tells you almost nothing on its own — the real value is the trend. The standard pattern is a rolling aggregate, sliced by dimensions that matter for root-causing a regression:

~~~python
def rolling_quality_by_dimension(scores: list[dict], window_hours: int = 24) -> dict:
    """scores: [{"timestamp": ..., "model": ..., "prompt_version": ..., "score": ...}, ...]
    Returns average score per (model, prompt_version) pair within the window."""
    cutoff = time.time() - window_hours * 3600
    buckets: dict[tuple, list[float]] = {}
    for s in scores:
        if s["timestamp"] < cutoff:
            continue
        key = (s["model"], s["prompt_version"])
        buckets.setdefault(key, []).append(s["score"])
    return {k: sum(v) / len(v) for k, v in buckets.items()}
~~~

Slicing by model and prompt version (and, in a fuller system, by user segment, feature, and time-of-day) is what turns "quality dropped" into "quality dropped specifically for prompt-version-7 on gpt-4o-mini since Tuesday" — an actionable finding instead of a vague alarm.

### Feedback signals beyond thumbs-up/down

Explicit feedback (a thumbs-up button) has notoriously low response rates — most users never click it. Implicit signals are usually higher-volume and worth tracking alongside explicit ones: whether a user immediately regenerated the answer (a strong negative signal), whether they edited the AI's output before using it, whether they abandoned the session right after a response, and dwell time on the answer before the next action. None of these are perfect proxies for quality individually, but tracked together and trended over time, they triangulate toward the same underlying signal traditional APM has no concept of at all.

### Cost attribution across dimensions

~~~python
def cost_report(traces: list[dict]) -> dict:
    """Aggregate cost per user and per feature from traced generation records."""
    per_user: dict[str, float] = {}
    per_feature: dict[str, float] = {}
    for t in traces:
        per_user[t["user_id"]] = per_user.get(t["user_id"], 0.0) + t["cost_usd"]
        per_feature[t["feature"]] = per_feature.get(t["feature"], 0.0) + t["cost_usd"]
    return {"per_user": per_user, "per_feature": per_feature}
~~~

The intermediate-level habit that separates teams who get surprised by their bill from those who don't: attribute cost to a feature and a user at write time (tag every generation span with feature and user_id), not as a reconciliation exercise against a provider's billing dashboard after the invoice arrives.
`,

  "advanced-concepts": `
### Detecting input distribution drift

Drift detection asks: is the population of what's coming into the system today meaningfully different from the population it was designed and evaluated against? For text inputs, a common lightweight approach compares embedding-space statistics of a rolling window of recent inputs against a reference window (e.g. the inputs used during the last evaluation cycle).

~~~python
import numpy as np

def embedding_drift_score(reference_embeddings: np.ndarray, recent_embeddings: np.ndarray) -> float:
    """A simple centroid-distance drift proxy: how far has the mean of
    recent input embeddings moved from the reference mean.
    Production systems often use a proper statistical test (e.g. MMD or a
    population stability index) instead of a raw centroid distance —
    this is illustrative, not a rigorous drift statistic."""
    ref_centroid = reference_embeddings.mean(axis=0)
    recent_centroid = recent_embeddings.mean(axis=0)
    return float(np.linalg.norm(ref_centroid - recent_centroid))
~~~

A rising drift score doesn't automatically mean quality has degraded — it means the input population changed, which is a signal to re-run evaluation on a fresh sample rather than trusting old eval numbers still apply. The two failure modes to guard against: treating drift as itself a quality problem (it isn't, necessarily) and ignoring it entirely (in which case a system silently evaluated on stale data looks fine on paper while failing on the traffic it actually receives today).

### Detecting silent model behavior changes

Providers periodically update what a fixed model alias (e.g. a "latest" tag, or even a dated model name that gets a silent quality patch) actually serves, without necessarily calling attention to it in a way that shows up in your integration. The defense is a **golden set / canary set**: a fixed, versioned set of representative inputs with known-good expected properties (not necessarily exact-match answers, but expected behaviors — length, tone, factual claims that should or shouldn't appear), re-run on a schedule against production traffic's exact model configuration.

~~~python
def run_canary_check(golden_set: list[dict], llm_client, judge) -> dict:
    """Re-run a fixed golden set against the current model config and
    compare scores against the last known-good baseline."""
    results = []
    for item in golden_set:
        answer = llm_client.generate(item["prompt"])
        score = judge.score(answer, item.get("expected_properties", {}))
        results.append({"id": item["id"], "score": score})
    avg = sum(r["score"] for r in results) / len(results)
    return {"average_score": avg, "results": results}

# Compare avg against the stored baseline from the last run; alert if it
# drops beyond a defined threshold — see Alerting-relevant material in Monitoring section.
~~~

Running this on a schedule (daily or on every deploy) turns "did the provider quietly change something" from an unanswerable question into a measured, versioned comparison. This is the closest analogue in AI Monitoring to a canary deployment in traditional software delivery — same idea, applied to a dependency you don't control instead of your own code.

### Localizing quality regressions in a multi-step pipeline

When an end-to-end quality score drops, the advanced-level move is decomposing it by pipeline stage rather than treating the pipeline as a black box: score retrieval relevance independently of generation faithfulness, so a regression can be attributed to "the reranker started returning worse documents" versus "the model started ignoring good context" — two entirely different fixes.

| Stage | What to score independently | Typical automated signal |
|---|---|---|
| Retrieval | Are the retrieved documents actually relevant to the query? | Relevance judge score, retrieval recall against a labeled set |
| Reranking | Did reranking improve or hurt the ordering? | Rank-correlation against a labeled ideal ordering |
| Generation | Is the answer faithful to the retrieved context (not hallucinating beyond it)? | Faithfulness/groundedness judge score — see the **Hallucination** skill |
| Tool calls | Did the model call the right tool, with the right arguments? | Exact-match or schema-validity checks on tool-call payloads |
| End-to-end | Would a user consider this answer good? | Human feedback, holistic LLM-as-judge score |

### Statistical rigor: is this a real regression or noise

LLM outputs are stochastic, and quality scores from an automated judge carry their own measurement noise. A senior-level habit is applying basic statistical discipline before declaring a regression: compare score distributions (not single point averages) across a large-enough sample, account for judge score variance by re-scoring a subsample with a different judge or temperature setting, and prefer a sustained multi-day trend over a single bad hour before triggering a page. Treating every daily fluctuation as an incident produces the same alert-fatigue failure mode as a poorly tuned traditional metrics alert (see the **Metrics** and **Prometheus** skills for the general discipline this borrows from).

### Multi-agent and tool-call specific monitoring

Agentic systems add a monitoring dimension traditional single-call LLM apps don't have: did the agent's actual execution path match its stated plan, how many tool calls did it make before terminating, and did it loop or retry excessively. Tracking "tool calls per successful completion" and "plan-vs-execution divergence" as first-class metrics is the emerging edge of this discipline — see the **Agent Observability** area of the platform's catalog for a deeper treatment of agent-specific tracing patterns, of which quality/drift monitoring (this page) is one layer.
`,

  "internal-working": `
Every AI-monitoring pipeline, regardless of whether it's built on a purpose-built platform or bespoke OpenTelemetry instrumentation, does the same four things: capture a structured trace of the request, attach quality/cost signals (synchronously or asynchronously), aggregate those signals over time and across dimensions, and evaluate the aggregates against alerting rules.

~~~mermaid
flowchart LR
    A["Request enters pipeline\\n(retrieval, generation, tools)"] --> B["Instrumentation captures\\ntrace + span attributes"]
    B --> C["Synchronous attributes\\n(tokens, latency, model, cost)"]
    B --> D["Async scoring job\\n(LLM-as-judge, hallucination check,\\nhuman feedback join)"]
    C --> E["Trace store /\\ntime-series store"]
    D --> E
    E --> F["Aggregation\\n(rolling averages, sliced by\\nmodel/prompt-version/feature)"]
    F --> G["Dashboards"]
    F --> H["Alerting rules\\n(regression thresholds)"]
    F --> I["Golden-set canary runs\\n(scheduled, compares to baseline)"]
~~~

Step by step:

1. **Trace capture happens inline, on the critical path, but cheaply.** Span creation and attribute-setting (token counts, model name, retrieved document IDs) are lightweight, in-memory operations — the same low-overhead instrumentation discipline as any OpenTelemetry-based tracing, so this step should never meaningfully affect user-facing latency (see the **Latency** skill for why this matters and how to verify it).
2. **Quality scoring happens off the critical path.** Running an LLM-as-judge call or a hallucination check synchronously inside the user's request would add a second LLM call's worth of latency and cost to every request — nearly always unacceptable. Instead, scoring runs asynchronously (a background worker, a queue consumer, a scheduled batch job over the last N hours of traces) and joins back to the original trace by request ID.
3. **Storage splits by access pattern**, mirroring the trace-store-vs-metrics-store split familiar from traditional observability (see **Tracing** vs **Metrics**/**Prometheus**): full trace detail (inputs, outputs, retrieved documents) goes to a store optimized for point lookups by request ID and free-text/vector search ("show me this specific bad trace"), while aggregated quality/cost numbers go to a time-series-friendly store optimized for windowed aggregation ("average quality score per hour, per model, for the last 30 days").
4. **Aggregation is where root-causing happens.** Sliced correctly (by model, prompt version, feature, time window, user segment), a raw stream of individually-scored traces becomes an answerable question: did quality drop for everyone, or just for one prompt version, one model, one user segment.
5. **Alerting evaluates aggregates against thresholds**, exactly like a traditional Prometheus alerting rule, but on quality/cost/drift metrics instead of latency/error-rate — see the Monitoring section below for the concrete alerting patterns and their failure modes.
6. **Golden-set canary runs operate on a separate schedule**, independent of live traffic, specifically to catch model-behavior drift that live-traffic scoring alone might miss if the input distribution itself is also shifting at the same time (you need a fixed input set to isolate "did the model change" from "did the traffic change").

The practical consequence of this design: instrumentation overhead in the request path stays low (comparable to any well-designed tracing setup), while the actual quality-measurement work — the expensive part — happens asynchronously, at a cadence and cost the team controls independently of request volume.
`,

  architecture: `
### Reference production architecture

~~~mermaid
flowchart TB
    subgraph App["Application"]
        Pipeline["RAG/agent pipeline\\n(instrumented with OTel spans)"]
    end
    subgraph Ingest["Ingestion"]
        Collector["OTel Collector /\\nplatform SDK ingestion"]
    end
    subgraph Storage["Storage layer"]
        TraceStore[("Trace store\\nfull request/response detail")]
        MetricsStore[("Time-series store\\nquality/cost/latency aggregates")]
    end
    subgraph Scoring["Async scoring"]
        Judge["LLM-as-judge /\\nhallucination checker"]
        Feedback["Human feedback\\nUI events (thumbs, edits)"]
    end
    subgraph Ops["Operations"]
        Dash["Dashboards\\n(Grafana / platform UI)"]
        Alerts["Alerting rules\\n(quality regression, drift, cost spike)"]
        Canary["Scheduled golden-set\\ncanary job"]
    end

    Pipeline -->|spans + attributes| Collector
    Collector --> TraceStore
    Collector --> MetricsStore
    TraceStore --> Judge
    Feedback --> TraceStore
    Judge -->|scores joined back| TraceStore
    Judge --> MetricsStore
    MetricsStore --> Dash
    MetricsStore --> Alerts
    Canary --> MetricsStore
~~~

- **Ingestion**: either a purpose-built platform SDK (**LangSmith**, **Langfuse**) or a generic OpenTelemetry Collector, depending on whether the team adopted a dedicated product or built on vendor-neutral primitives.
- **Trace store**: holds full request/response detail for point-lookup debugging ("show me this exact bad trace") — optimized for lookup by ID and, often, semantic/text search across historical traces.
- **Time-series store**: holds aggregated quality, cost, and latency numbers optimized for windowed queries ("average quality score per hour") — frequently the same **Prometheus**-style store already running for infrastructure metrics, extended with AI-specific metric names.
- **Async scoring**: the component that actually computes quality judgments — an LLM-as-judge call, a rule-based hallucination checker, or a join against human feedback UI events — running independently of the request path.
- **Golden-set canary job**: a scheduled process, decoupled from live traffic, specifically for detecting model-behavior drift against a fixed reference set.
- **Dashboards and alerts**: read from the time-series store, exactly as a traditional infra dashboard does, just with AI-specific metric names (quality score, hallucination rate, cost per request) alongside the traditional ones (latency, error rate).

### Application-side project layout

~~~text
myservice/
├── src/myservice/
│   ├── pipelines/
│   │   └── rag.py              # instrumented with OTel spans per stage
│   ├── observability/
│   │   ├── tracing.py          # span/attribute helpers, one place all instrumentation flows through
│   │   ├── scoring.py          # async judge/hallucination-check job
│   │   └── canary.py           # scheduled golden-set runner
│   └── core/
│       └── cost.py             # per-provider token-to-dollar conversion
└── tests/
    └── golden_set.jsonl        # versioned canary inputs + expected properties
~~~

Keeping the golden set under version control alongside the code (rather than only inside a platform's UI) means a model or prompt regression can be bisected with the same git-blame discipline used for any other code regression.
`,

  "data-flow": `
Tracing one RAG request end to end, including the asynchronous quality-scoring path that runs after the user already has their answer:

~~~mermaid
sequenceDiagram
    participant User
    participant App as App server
    participant Retr as Retriever
    participant LLM as LLM Provider
    participant Ingest as Trace/metrics ingestion
    participant Judge as Async judge worker
    participant Alert as Alerting rules

    User->>App: POST /ask {"question": "..."}
    App->>App: start trace, span "retrieval"
    App->>Retr: similarity_search(question)
    Retr-->>App: relevant docs
    App->>App: span.set_attribute(num_docs, top_score)
    App->>App: span "generation"
    App->>LLM: chat completion request
    LLM-->>App: answer + token usage
    App->>App: span.set_attribute(tokens, cost, model)
    App-->>User: HTTP 200 {"answer": "..."}
    App->>Ingest: async flush trace + attributes
    Note over Ingest,Judge: Scoring happens AFTER the response was already returned
    Ingest->>Judge: dequeue trace for scoring
    Judge->>LLM: judge call: score(answer, retrieved_docs)
    Judge->>Ingest: attach quality_score, hallucination_flag
    Ingest->>Alert: update rolling aggregates
    Alert-->>Alert: evaluate thresholds (quality drop? cost spike?)
~~~

The key detail this diagram makes explicit: the user's response is never blocked on quality scoring. Quality judgments, cost aggregation, and alerting all happen after the fact, which is precisely why this instrumentation layer can add real analytical depth without adding latency to the thing users actually experience — the tradeoff is that a genuinely bad answer is detected minutes to hours after it happened, not before it reaches the user, which is why monitoring complements but never replaces upstream safeguards like input/output guardrails.
`,

  "production-usage": `
### Choosing a platform versus building on OpenTelemetry primitives

Most teams starting out adopt a purpose-built platform (**LangSmith** or **Langfuse**) because it ships the trace/span/generation data model, a dashboard, dataset-based evaluation, and cost tracking out of the box — see those two skills for the direct comparison between them. Teams move toward custom instrumentation on top of **OpenTelemetry** when they already have significant investment in an existing observability stack (**Prometheus**/**Grafana**, a specific trace backend), need AI-specific metrics to live alongside infrastructure metrics in one pane of glass, or have compliance/data-residency requirements a given platform's cloud offering can't satisfy without self-hosting it — a decision with the same shape as the cloud-vs-self-hosted tradeoff covered in the **Langfuse** skill.

### Environment and configuration for a canary/golden-set job

~~~bash
export MONITORING_JUDGE_MODEL="gpt-4o-mini"   # pin a specific judge model, don't float to "latest"
export MONITORING_GOLDEN_SET_PATH="tests/golden_set.jsonl"
export MONITORING_CANARY_SCHEDULE="0 6 * * *"   # daily at 06:00 — run before peak traffic
~~~

Non-negotiables for production:

1. **Tag every span with model, prompt version, and feature** at write time — this is what makes later slicing ("which prompt version regressed") possible; it cannot be reconstructed retroactively from raw text alone.
2. **Never score quality synchronously in the request path** — async scoring keeps monitoring overhead off user-facing latency (see the **Latency** skill).
3. **Pin the judge model version explicitly**, don't let a judge float to a provider's "latest" alias — otherwise a judge-model update silently changes what "quality score dropped" even means, confounding a real regression with a judge-side change.
4. **Version the golden/canary set under source control**, not only inside a platform's UI, so its own history is auditable the same way application code is.
5. **Attribute cost at write time** (tag every generation with user_id and feature) rather than reconciling against a provider billing dashboard after the invoice arrives.

### Typical project layout addition

A thin observability module (as shown in Architecture) that owns span creation, cost calculation, and the async scoring job keeps monitoring plumbing out of pipeline business logic — the pipeline calls a wrapped tracer/cost helper, not raw platform SDK calls scattered through every function.
`,

  "industry-examples": `
Public, verifiable "who does exactly what" specifics are thin for a discipline this young and this tied to internal tooling most companies don't publish details about — treat the patterns below as illustrative of well-documented adoption categories rather than a definitive named-customer list; verify specifics against a given platform's own published case studies before quoting a company by name.

- **Customer-support AI products**: teams running LLM-based support deflection commonly track hallucination rate and thumbs-down rate as primary quality metrics, since a wrong policy answer (e.g. an invented refund window) is a direct liability, not just an inconvenience — this is one of the most frequently cited categories driving investment in hallucination-specific monitoring, distinct from generic quality scoring.
- **Regulated-industry RAG deployments** (financial services, healthcare-adjacent products): teams here disproportionately invest in groundedness/faithfulness scoring (is the answer actually supported by retrieved source documents) because an ungrounded answer is a compliance risk, not just a quality nit — see the **Hallucination** skill for the taxonomy this maps onto.
- **Multi-model, multi-provider platforms**: internal LLM gateway teams serving many downstream product teams commonly build centralized cost-per-feature and cost-per-team dashboards specifically because, without them, a single team's runaway prompt or retry loop can spike the whole organization's bill before anyone notices.
- **Agentic coding and workflow-automation products**: as agent-based products (multi-step tool-calling systems) have matured, monitoring has expanded to track tool-call success rate, plan-vs-execution divergence, and loop/retry counts as first-class metrics distinct from single-call quality scoring — an emerging pattern rather than a settled one.

Pattern to notice: the specific quality metric a team invests in most heavily tracks the specific failure mode that's most expensive for their product — hallucination rate for support bots, groundedness for regulated RAG, cost attribution for multi-tenant platforms, tool-call correctness for agents.
`,

  "best-practices": `
1. **Tag every span with model, prompt version, and feature at write time.** This is the single habit that makes every later slicing question ("which prompt version regressed") answerable instead of an archaeology project.
2. **Never score quality synchronously in the user-facing request path.** Async scoring is what keeps monitoring overhead from becoming a latency regression — see the **Latency** skill.
3. **Separate quality scoring by pipeline stage** (retrieval relevance vs generation faithfulness vs tool-call correctness) rather than one holistic end-to-end score alone — a single score tells you something is wrong, stage-level scores tell you what and where.
4. **Maintain a versioned golden/canary set** and re-run it on a schedule independent of live traffic — this is the only reliable way to distinguish "the model provider changed something" from "our traffic changed."
5. **Pin the judge model version explicitly** rather than letting it float to "latest" — a floating judge confounds real regressions with judge-side changes, making trend data untrustworthy.
6. **Combine explicit and implicit feedback signals.** Thumbs-up/down response rates are usually low; regeneration rate, edit rate, and abandonment rate are higher-volume proxies worth tracking alongside explicit feedback, not instead of it.
7. **Alert on sustained trend, not single-sample noise.** LLM outputs and judge scores are stochastic; a single bad hour is not the same evidence as a three-day downward trend — apply the same discipline used to avoid alert fatigue in traditional metrics (see **Metrics**, **Prometheus**).
8. **Attribute cost per request, per user, and per feature from day one.** Retrofitting cost attribution onto historical traces that weren't tagged at write time is rarely possible.
9. **Keep quality monitoring and cost/latency monitoring in the same team's field of view**, even if they live in different tools — a "faster and cheaper" change that quietly hurt quality is a regression, not a win, and should never ship unnoticed because the two dashboards live in different tabs nobody cross-checks.
10. **Treat drift detection as a distinct concern from quality scoring.** A drift alert says "the input population or the model changed" — it is a prompt to re-evaluate, not itself proof that quality dropped; conflating the two produces both false alarms and missed regressions.
11. **Build monitoring for agentic systems around plan-vs-execution divergence and tool-call correctness**, not just a single end-to-end quality score — an agent that took a bizarre path to a correct-looking answer is still a monitoring finding worth surfacing.
12. **Choose a platform (LangSmith, Langfuse) or a custom OpenTelemetry-based build based on your actual constraints** (existing stack investment, compliance needs, budget) rather than defaulting to whichever tool is most hyped this quarter — see Comparisons.
`,

  "anti-patterns": `
### Treating "no errors" as "quality is fine"

~~~python
# WRONG — dashboards only show latency and error rate; nobody is watching quality
def health_check():
    return {"status": "ok", "p95_latency_ms": 240, "error_rate": 0.001}

# RIGHT — quality is tracked as a first-class metric alongside infra metrics
def health_check():
    return {
        "status": "ok",
        "p95_latency_ms": 240,
        "error_rate": 0.001,
        "avg_quality_score_24h": rolling_quality_score(window_hours=24),
        "hallucination_rate_24h": rolling_hallucination_rate(window_hours=24),
    }
~~~

A system can be perfectly "healthy" by every traditional signal while systematically producing wrong answers — that gap is the entire reason this discipline exists.

### Scoring quality synchronously in the request path

~~~python
# WRONG — adds a second LLM call's worth of latency to every single request
def answer_question(q):
    answer = llm.generate(q)
    score = llm_as_judge_score(answer)   # blocks the response on a judge call
    return answer

# RIGHT — score asynchronously, after the response is already returned
def answer_question(q):
    answer = llm.generate(q)
    enqueue_for_async_scoring(request_id, answer)   # non-blocking
    return answer
~~~

### Letting the judge model float to "latest"

~~~python
# WRONG — judge behavior can silently shift, confounding real regressions
judge_score = judge_client.score(answer, model="gpt-4o-latest")

# RIGHT — pin the exact judge model version
judge_score = judge_client.score(answer, model="gpt-4o-2024-08-06")
~~~

If the judge itself changes behavior, a "quality regression" alert might just be measuring a judge update, not a real drop — and you'll waste a debugging session looking for a regression in your own system that isn't there.

### Reacting to single-sample noise as an incident

~~~python
# WRONG — one bad hour triggers a page
if hourly_avg_quality < threshold:
    page_oncall()

# RIGHT — require a sustained trend before alerting
if rolling_avg_quality(window_hours=24) < threshold and \\
   rolling_avg_quality(window_hours=72) < threshold:
    page_oncall()
~~~

LLM outputs are stochastic; treating every noisy sample as signal produces the same alert-fatigue failure mode a poorly tuned Prometheus rule produces for latency spikes.

### No golden set — relying entirely on live-traffic scoring to catch model drift

Without a fixed, versioned reference set, a live-traffic-only monitoring setup cannot distinguish "the model changed" from "the traffic changed" — both look identical as a quality-score movement. Maintain a golden set specifically to isolate one variable at a time.

### Cost tracking that only exists inside a billing dashboard

Waiting for a provider's monthly invoice to discover a cost spike means the spike has already been running, unattributed, for weeks. Tag cost to user/feature at write time so a spike is visible the same day it starts, not the month after.
`,

  performance: `
### Rule zero: monitoring overhead should be invisible to your users

The entire architecture in Internal Working exists to keep quality scoring off the request's critical path. If a monitoring rollout coincides with a latency regression, check, in order of likelihood:

1. **Synchronous judge/scoring calls in the request path** — the single most common cause; move scoring to an async worker or scheduled batch job.
2. **Overly verbose span attributes** (capturing full raw documents or huge payloads on every span) — bloats ingestion payload size and storage; truncate or sample large content, and rely on trace-store-level offload for genuinely large payloads (the same pattern covered in the **Langfuse** skill's performance section).
3. **Too many spans per request** — one span per token or per tiny sub-step is unnecessary; group logically related work into a single span, mirroring the same granularity guidance as general **Tracing**.

### Measurement first, then optimize

Before optimizing anything, measure: how much wall-clock time and cost does the async scoring pipeline itself add at your actual trace volume, what fraction of traces get scored (sampling everything is rarely necessary — see Scalability), and what the marginal cost of one more judge call is at your current model choice. Optimizing an unmeasured scoring pipeline is exactly the anti-pattern the **Performance**-first discipline in adjacent skills warns against generally.

### Practical numbers

Exact throughput and cost figures for a given async-scoring setup depend heavily on judge model choice, sampling rate, and trace volume — not something I can state with confidence as a generic number at this cutoff. Load-test your specific scoring pipeline against your expected trace volume, and track the async scoring queue's own lag as a metric (how far behind live traffic is quality scoring running) rather than assuming it's keeping up.
`,

  scalability: `
AI Monitoring's scaling story splits along the same lines as its architecture: the request-path instrumentation (spans, attributes) must scale with request volume cheaply, while the async scoring pipeline is where real cost and throughput constraints show up.

~~~mermaid
flowchart LR
    A["Request volume grows"] --> B["Span/attribute capture\\n(cheap, scales linearly, stays on request path)"]
    A --> C["Async scoring queue\\n(the real bottleneck at scale)"]
    C --> D{"Score every trace?"}
    D -->|No| E["Sample a representative\\nsubset (e.g. 5-20%)"]
    D -->|Yes| F["Scale judge worker\\nconcurrency/cost accordingly"]
~~~

- **Span/attribute capture**: scales linearly and cheaply with request volume, the same way general tracing overhead does — rarely the bottleneck.
- **Async scoring**: the actual constraint at high volume, since every scored trace costs a judge-model call's worth of latency and money. Most production systems sample rather than scoring every single trace, choosing a rate that balances statistical confidence in the aggregate trend against judge cost.
- **Golden-set canary runs**: fixed-size and scheduled, so they don't scale with traffic volume at all — this is one of their advantages as a drift-detection method independent of live-traffic scaling concerns.
- **Time-series/metrics store**: scales the same way any metrics backend does — see **Prometheus** for cardinality-explosion risks if you tag metrics with too many high-cardinality dimensions (e.g. raw user IDs as a metric label instead of a bounded segment).

### Known ceilings and answers

| Bottleneck | Answer |
|---|---|
| Judge-scoring cost/throughput at high trace volume | Sample rather than scoring every trace; use a cheaper/faster judge model for the bulk of scoring and a stronger judge for a smaller audited subsample |
| Scoring queue falling behind live traffic | Scale async worker concurrency; monitor queue lag itself as a metric |
| High-cardinality metric labels (e.g. per-user-ID metrics) overwhelming a time-series store | Bucket into segments rather than raw IDs for aggregate dashboards; keep per-user detail in the trace store, not the metrics store |
| Golden-set canary runs becoming stale as the product evolves | Periodically refresh the golden set to reflect current real usage patterns, while keeping enough historical continuity to compare trend over time |
`,

  security: `
### AI-monitoring-specific attack surface

1. **Traces and quality-scoring logs capture full request/response payloads by default.** If your application handles PII, financial data, or health data, that data flows into whatever monitoring store you're using — self-hosted or vendor. Redact or scrub sensitive fields at the instrumentation boundary, the same guidance covered in depth in the **Langfuse** skill's security section, which applies identically here.
2. **Judge models see user data too.** An LLM-as-judge call sends the original input and output (and often retrieved context) to a judge model — potentially a different provider than the one serving the original request. Confirm your data-handling policy covers this second model call, not just the primary generation call.
3. **Golden/canary sets can themselves leak sensitive patterns** if built from real production failures without scrubbing — treat a golden set with the same handling rigor as any other dataset containing real user-derived content.
4. **Cost and usage dashboards can leak business-sensitive information** (which features are expensive, which users are heavy users) if access isn't scoped appropriately — treat cost dashboards as an internal-access-controlled surface, not something exposed broadly by default.
5. **Alerting webhooks and integrations** (paging systems, Slack notifications) that include trace excerpts in the alert payload can inadvertently forward sensitive content to a third-party notification channel — scrub payloads before they leave your monitoring boundary into an external alerting integration.

### Supply chain and deployment hygiene

- If using a hosted platform (**LangSmith**, **Langfuse**), review its data-residency and retention policies against your compliance requirements before sending production traffic through it.
- If self-hosting the monitoring stack, patch and pin versions the same way you would any other production infrastructure — see the **Langfuse** skill's deployment section for a concrete example of this discipline applied to a self-hosted observability stack.
- Rotate API keys used for judge-model calls and platform ingestion the same way you would any other credential — see the **Secrets Management** skill.

See the dedicated **Secrets Management** and general security skills for depth on the practices this section leans on.
`,

  testing: `
Testing an AI-monitoring setup splits into two concerns: testing that instrumentation is wired correctly (spans exist, attributes are populated), and testing the scoring/alerting logic itself in isolation from a live judge model.

~~~python
# tests/test_monitoring.py
import pytest
from unittest.mock import patch, MagicMock
from myservice.observability.tracing import answer_question

def test_span_attributes_populated_on_success(monkeypatch):
    """Every generation span must carry the fields cost/quality tracking depends on."""
    with patch("myservice.observability.tracing.llm_client") as mock_llm:
        mock_llm.generate.return_value = MagicMock(
            text="answer", model="gpt-4o-mini",
            usage=MagicMock(input_tokens=40, output_tokens=12),
        )
        recorded = answer_question("What is the refund policy?", user_id="u1")
        span = recorded["spans"]["generation"]
        assert span["model"] == "gpt-4o-mini"
        assert span["input_tokens"] == 40 and span["output_tokens"] == 12

def test_quality_regression_alert_requires_sustained_trend():
    """A single bad hour must NOT trigger an alert; a 3-day trend must."""
    from myservice.observability.alerting import should_alert
    single_bad_hour = {"24h_avg": 0.55, "72h_avg": 0.91}
    sustained_drop = {"24h_avg": 0.55, "72h_avg": 0.58}
    assert should_alert(single_bad_hour, threshold=0.7) is False
    assert should_alert(sustained_drop, threshold=0.7) is True
~~~

### The senior testing doctrine for AI monitoring

- **Test instrumentation correctness deterministically** — assert that spans and attributes are populated as expected, without depending on a live model call; mock the provider response the same way you would for any other external dependency.
- **Test alerting logic against synthetic score sequences**, not live traffic — the point is to verify the threshold/trend logic itself (does it correctly distinguish noise from a real regression), which is a pure-logic test that shouldn't need a real judge model.
- **Treat a golden-set canary run as its own testable pipeline** — write a test that the canary job correctly flags a synthetic, deliberately-degraded response as below threshold, so you trust the mechanism before relying on it in production.
- **Do not assert against a live judge model's exact score in a unit test** — judge scores are inherently somewhat non-deterministic (temperature, model updates); assert on your system's handling of a score (does it correctly aggregate, alert, attribute cost) rather than the score's exact value.
`,

  debugging: `
### The toolbox, in escalation order

1. **Open the specific trace first**, not the aggregate dashboard — a quality-regression alert should always be root-caused by opening a handful of the specific traces that scored low, exactly the workflow the **LangSmith** and **Langfuse** skills' trace views are built around.
2. **Check whether the regression is stage-specific** — compare retrieval-relevance scores against generation-faithfulness scores for the affected traces; a drop that's isolated to one stage narrows the fix dramatically versus a holistic end-to-end score alone.
3. **Rule out judge-side drift before blaming your system** — re-run a small sample through a pinned, known-good judge model version; if scores recover, your judge model quietly changed, not your application.
4. **Check the golden-set canary history** — if the canary set's score also dropped at the same time as live-traffic quality, that points toward a provider-side model change rather than something in your own prompt, retrieval index, or code.
5. **Check for input distribution drift** — compare the embedding-space statistics (or even simple query-length/topic distribution) of recent traffic against a reference window; a shift here can produce a quality drop even with an unchanged model and unchanged code.
6. **Cross-check cost and latency dashboards for the same window** — a quality regression that coincides with a cost or latency change (e.g. a fallback to a cheaper model during a provider outage) often has an immediately obvious cause once you look at all three together instead of quality in isolation.
7. **Check the scoring pipeline's own health last** — if quality scores stopped updating entirely (rather than dropping), the scoring worker or queue may be stalled, not the underlying system's quality.

~~~python
import logging
logging.getLogger("ai_monitoring").setLevel(logging.DEBUG)  # see instrumentation/scoring logs
~~~
`,

  monitoring: `
This is the section that names, precisely, what to measure and how to instrument it — the operational core of the whole page.

### The metrics to track, and why each exists

| Metric | What it catches | Instrumentation source |
|---|---|---|
| Quality score (judge or human) | Wrong/unhelpful answers that don't error | Async LLM-as-judge or human feedback, joined to trace |
| Hallucination rate | Confidently invented facts not supported by context | Faithfulness/groundedness checker — see the **Hallucination** skill |
| User feedback rate (explicit + implicit) | Real user-perceived quality, including regeneration/edit/abandonment | UI events joined to trace by request ID |
| Retrieval relevance | Bad context feeding a downstream generation failure | Relevance judge on retrieved documents, independent of generation score |
| Cost per request/user/feature | Runaway spend, inefficient prompts, retry loops | Token usage x per-token pricing, tagged by user_id/feature at write time |
| Input distribution drift | Traffic shift invalidating stale evaluation assumptions | Embedding-space or feature-distribution comparison, rolling vs reference window |
| Model behavior drift | Silent provider-side model updates | Scheduled golden-set canary re-run vs stored baseline |
| Latency and error rate | The traditional layer this page complements, not replaces | Standard **Metrics**/**Tracing**/**Prometheus** instrumentation |

### Instrumenting the worked example: a RAG request with a quality-score callback

~~~python
from opentelemetry import trace
from dataclasses import dataclass
from typing import Callable

tracer = trace.get_tracer("ai-monitoring-example")

@dataclass
class QualitySignal:
    trace_id: str
    retrieval_relevance: float
    generation_faithfulness: float
    hallucination_detected: bool
    cost_usd: float

def answer_with_monitoring(
    question: str,
    user_id: str,
    feature: str,
    retriever,
    llm_client,
    on_quality_score: Callable[[QualitySignal], None],
) -> str:
    """Trace a full RAG request and register an async quality-scoring
    callback — the callback runs off the critical path in a real system
    (a queue consumer), shown inline here for clarity."""
    with tracer.start_as_current_span("rag_request") as root:
        root.set_attribute("user_id", user_id)
        root.set_attribute("feature", feature)
        trace_id = format(root.get_span_context().trace_id, "032x")

        with tracer.start_as_current_span("retrieval") as span:
            docs = retriever.search(question, top_k=5)
            span.set_attribute("retrieval.num_docs", len(docs))

        with tracer.start_as_current_span("generation") as span:
            prompt = build_prompt(question, docs)
            response = llm_client.generate(prompt)
            span.set_attribute("generation.model", response.model)
            span.set_attribute("generation.input_tokens", response.usage.input_tokens)
            span.set_attribute("generation.output_tokens", response.usage.output_tokens)
            cost = estimate_cost(response)
            span.set_attribute("generation.cost_usd", cost)

        # In production this is enqueued for an async worker, NOT called
        # synchronously here — shown inline only to make the data flow explicit.
        enqueue_async_scoring(trace_id, question, response.text, docs, cost, on_quality_score)

        return response.text


def enqueue_async_scoring(trace_id, question, answer, docs, cost, on_quality_score):
    """Illustrative synchronous stand-in for what a queue consumer does later."""
    relevance = score_retrieval_relevance(question, docs)          # see Evaluation skill
    faithfulness, hallucinated = score_faithfulness(answer, docs)  # see Hallucination skill
    on_quality_score(QualitySignal(
        trace_id=trace_id,
        retrieval_relevance=relevance,
        generation_faithfulness=faithfulness,
        hallucination_detected=hallucinated,
        cost_usd=cost,
    ))
~~~

### Alerting without alert fatigue

- **Require a sustained trend** (e.g. both a 24-hour and a 72-hour rolling average below threshold) before paging — a single noisy hour is expected variance, not an incident.
- **Alert on drift and on quality regression as separate alerts**, since they point to different investigations (drift → re-evaluate; regression → root-cause the pipeline stage).
- **Tie cost alerts to a rate of change, not just an absolute threshold** — a sudden 5x jump in cost-per-request for one feature is worth paging on even if it's still under an absolute daily budget cap.
- **Route quality alerts to the team that owns the prompt/pipeline, not a generic on-call rotation** built for infrastructure incidents — a quality regression is usually a product/prompt engineering fix, not an infra fix, and routing it to the wrong team delays resolution.
`,

  deployment: `
### A minimal async scoring worker (illustrative)

~~~dockerfile
# Illustrative shape of a scoring worker deployment, not a specific
# platform's official image — verify against your chosen stack's docs.
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
ENV MONITORING_JUDGE_MODEL="gpt-4o-mini-2024-07-18"
ENV MONITORING_QUEUE_URL="redis://queue:6379/0"
CMD ["python", "-m", "myservice.observability.scoring_worker"]
~~~

Why each choice matters: pinning the judge model to a dated version (not a floating alias) keeps quality-trend data comparable over time; separating the scoring worker into its own deployable unit means it can scale independently of the main application and its own outage never affects user-facing latency, since it was never on the critical path to begin with.

### Scheduled canary job

~~~bash
# crontab entry, or the equivalent scheduled-job config in your orchestrator
0 6 * * * python -m myservice.observability.canary --golden-set tests/golden_set.jsonl
~~~

Running the canary before peak traffic hours means a detected regression (in either the model or the golden set's expected properties) is caught and can be investigated before the bulk of the day's traffic sees it, though it does not block traffic the way a true canary deployment in traditional software delivery would — see Common Mistakes for the important distinction between this pattern and a true blocking canary.

### Application-side deployment

- Set the judge model version and golden-set path via environment configuration validated at startup — fail fast if missing rather than silently skipping quality scoring.
- Ensure the scoring worker and the main application scale independently — a scoring backlog should never block or slow the request-serving tier.
- Wire alerting rules into whatever paging system already handles infrastructure alerts (see **Prometheus**/**Grafana**), but route AI-quality alerts to the team that owns prompts/pipelines specifically, not a generic infra on-call.
`,

  "production-checklist": `
Before an AI-monitoring setup is considered production-ready:

- [ ] Every generation span tagged with model, prompt version, and feature at write time
- [ ] Quality scoring runs fully asynchronously, never blocking the user-facing request path
- [ ] Judge model version pinned explicitly, never floating to a "latest" alias
- [ ] A versioned golden/canary set exists, checked into source control, and runs on a schedule
- [ ] Retrieval relevance and generation faithfulness scored independently, not only a single end-to-end score
- [ ] Explicit feedback (thumbs up/down) AND at least one implicit signal (regeneration/edit/abandonment) tracked
- [ ] Cost attributed per user and per feature at write time, not reconciled after the invoice arrives
- [ ] Alerting requires a sustained trend (multi-window comparison), not single-sample noise
- [ ] Drift detection (input distribution) and model-behavior detection (canary) treated as distinct alerts from quality regressions
- [ ] Sensitive payload fields redacted before reaching trace storage or a judge-model call
- [ ] Scoring worker scales independently of the request-serving tier and its outage cannot affect user latency
- [ ] Dashboards exist for quality score, hallucination rate, and cost-per-feature, not just latency/error-rate
- [ ] Quality alerts route to the team owning prompts/pipelines, not a generic infra on-call
- [ ] A documented escalation path exists for "the golden-set canary regressed" distinct from "live-traffic quality regressed"
`,

  "common-mistakes": `
1. **Assuming traditional observability (uptime, latency, error rate) is sufficient for an LLM system** — it answers "is it up," never "is it right," and the gap between those questions is the entire premise of this discipline.
2. **Scoring quality synchronously in the request path** — adds a second model call's worth of latency to every request; always score asynchronously.
3. **Letting the judge model float to "latest"** — confounds real regressions in your system with judge-side behavior changes, making trend data untrustworthy.
4. **Alerting on single-sample noise** — LLM outputs and judge scores are stochastic; require a sustained trend before paging, or you'll train the team to ignore every alert.
5. **No golden/canary set** — without a fixed reference, you cannot distinguish "the model provider changed something" from "our traffic distribution changed"; both look identical as a live-traffic quality-score movement.
6. **Treating a scheduled canary job as a true blocking canary deployment** — a scheduled re-run detects drift after the fact; it does not gate traffic the way a true progressive rollout does. Don't oversell what the pattern actually protects against.
7. **Not attributing cost at write time** — waiting for a monthly invoice to discover a spend spike means it ran unattributed for weeks before anyone noticed.
8. **Treating drift detection and quality regression as the same alert** — drift says the population changed; regression says quality dropped; conflating them produces both false alarms and missed real regressions.
9. **Relying only on explicit feedback (thumbs up/down)** — response rates are typically low; implicit signals (regeneration, edits, abandonment) are higher-volume and should be tracked alongside, not skipped.
10. **Scoring the whole pipeline with one holistic number** instead of per-stage scores — makes every regression a multi-hour investigation instead of an immediate "it's the reranker" or "it's the generation step" finding.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Quality dashboard shows no new data | Async scoring worker stalled or queue backed up | Check scoring queue lag as its own metric; scale worker concurrency |
| "Quality regression" alert but nothing seems wrong on inspection | Judge model silently updated (floating alias) | Pin judge model to a dated version; re-score a sample with the pinned version to confirm |
| Cost dashboard under-reports spend for some requests | Token usage not captured for a custom/self-hosted or fallback model call | Manually populate usage fields for any non-auto-instrumented provider call |
| Constant paging on quality alerts, team starts ignoring them | Alert threshold triggers on single-sample noise | Require a sustained multi-window trend before alerting |
| Drift score rising but quality metrics look fine | Input population shifted, but the system still handles the new distribution well | Treat as a signal to re-run evaluation on fresh data, not itself proof of a regression |
| Golden-set canary score dropped, live traffic looks unaffected | Canary set may be stale or unrepresentative of current real traffic | Periodically refresh the golden set while preserving enough history for trend comparison |
| Trace exists but has no quality score attached | Async scoring job crashed or the trace ID join failed | Check scoring worker logs; verify request-ID join logic between trace store and scoring pipeline |
| Sensitive data visible in a trace or a judge-model call payload | No redaction applied before instrumentation or scoring | Redact/scrub at the instrumentation boundary, before trace capture and before the judge call |

The habit that matters: check whether the scoring pipeline itself is healthy before assuming a metric movement reflects reality — a stalled worker and a real regression look similar from a dashboard at a glance, but require completely different fixes.
`,

  faqs: `
**Q: Isn't this just the same thing as LangSmith or Langfuse?**
Those are two purpose-built platforms that implement large parts of this discipline as a product — see the **LangSmith** and **Langfuse** skills. This page covers the underlying concepts (what to measure, why, and how), which apply whether you adopt one of those platforms, build custom instrumentation on **OpenTelemetry**, or some mix of both.

**Q: Do I need a dedicated platform, or can I build this myself on Prometheus/Grafana?**
Either is viable. A custom build on **OpenTelemetry** plus **Prometheus**/**Grafana** works well if you already have that stack and want AI metrics alongside infra metrics in one pane of glass. A dedicated platform gets you trace-level detail, dataset-based evaluation, and prompt-linked tracing out of the box faster. See Comparisons for the tradeoffs.

**Q: How is "hallucination rate" different from "quality score"?**
Hallucination rate is a specific, narrower signal — did the model state something not supported by its retrieved context or the facts — and is one input into a broader quality score, which can also fail for other reasons (irrelevant retrieval, wrong tone, incomplete answer) that aren't hallucinations at all. See the **Hallucination** skill for the full taxonomy.

**Q: Can I just use my error-rate/latency dashboards and skip AI-specific monitoring?**
No — a system can be perfectly healthy by every traditional signal while systematically producing wrong answers. That gap is the entire reason this discipline exists; traditional observability and AI monitoring are complementary, not substitutes for each other.

**Q: How often should I re-run the golden/canary set?**
Commonly daily, or on every deploy that touches the prompt or model configuration, whichever is more frequent — the goal is catching a provider-side silent model update before it accumulates days of unnoticed live-traffic degradation.

**Q: Will monitoring slow down my application?**
Negligibly, if scoring is properly asynchronous — span/attribute capture is cheap and stays on the critical path, but quality scoring (which is the expensive part, often another LLM call) must run off it. If you observe a latency regression after adding monitoring, check for a synchronous judge call first.

**Q: What's the single most important metric to start with if I can only track one?**
There isn't a universal answer, but a defensible default is a combined feedback/regression-rate signal (thumbs-down rate plus regeneration rate) alongside cost-per-request — cheap to instrument, hard to fake, and directly tied to what users actually experience, while you build out judge-based and drift-based monitoring in parallel.

**Q: Does AI monitoring replace the need for guardrails or content moderation?**
No — monitoring observes and measures what already happened; it does not intercept or block a request in-flight by default. Guardrails and moderation belong in the request path itself, and monitoring is how you'd notice if those guardrails were failing over time.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between traditional software observability and AI monitoring?* Traditional observability answers "is it up, is it fast, did it error"; AI monitoring adds "was the answer correct, is it hallucinating, did users like it, how much does it cost, has the model or input distribution drifted" — questions traditional tooling has no opinion on.
2. *Why should quality scoring happen asynchronously rather than in the request path?* Scoring (an LLM-as-judge call, a hallucination check) is itself expensive — often another model call's worth of latency and cost — so running it synchronously would add unacceptable latency to every user-facing request; it's decoupled and joined back by request ID instead.
3. *What is a golden set / canary set, and what does it protect against?* A fixed, versioned set of representative inputs re-run on a schedule against production's exact model configuration, specifically to detect when a provider silently changes a model's behavior — something live-traffic-only monitoring can't isolate from ordinary traffic-distribution changes.
4. *Why track both explicit and implicit feedback signals?* Explicit feedback (thumbs up/down) typically has a low response rate; implicit signals (regeneration, edits, abandonment) are higher-volume proxies that, tracked together, triangulate a fuller picture of perceived quality.
5. *How do you attribute cost per feature across multiple model providers?* Tag every generation span with the feature and user at write time, convert token usage to dollars per the relevant provider's pricing, and aggregate by tag — not by reconciling against separate provider billing dashboards after the fact.

**Senior:**

6. *Design the monitoring architecture for a multi-step RAG pipeline where you need to localize which stage caused a quality regression.* Trace each stage (retrieval, reranking, generation, tool calls) as separate spans; score retrieval relevance and generation faithfulness independently rather than one holistic score; slice aggregates by model, prompt version, and pipeline stage so a regression narrows to a specific cause rather than a vague "quality dropped."
7. *How do you distinguish a real quality regression from noise in an LLM-as-judge score?* Require a sustained trend across multiple time windows (e.g. both 24h and 72h rolling averages below threshold) rather than reacting to a single sample; account for judge-model variance by periodically cross-checking with a second judge or human spot-check.
8. *A provider silently updates a model behind a fixed alias. How would your monitoring catch this, and how would you confirm it wasn't your own system that regressed?* A scheduled golden-set canary run against the exact production model config would show a score drop on a fixed input set even with zero code changes on your side; cross-check the canary drop against live-traffic quality — if both dropped simultaneously with no deploy on your end, that points strongly at a provider-side change rather than your own pipeline.
9. *How would you build alerting for cost that avoids both alert fatigue and slow detection?* Alert on rate-of-change (e.g. a sudden multi-x jump in cost-per-request for one feature) in addition to absolute thresholds, tie alerts to the specific tag (feature/user/model) that spiked rather than a global aggregate, and route to the team owning that specific feature.
10. *What's the risk of using the same LLM as both the production model and the judge model?* Self-preference/self-evaluation bias — a model may systematically rate its own outputs more favorably than an independent judge would; mitigate by using a different model family as judge, or periodically cross-checking judge scores against human review, per the general guidance in the **Evaluation** and **Hallucination** skills.
11. *How does agent-based monitoring differ from single-call LLM monitoring?* Agents add plan-vs-execution divergence, tool-call correctness, and loop/retry-count as first-class metrics beyond a single end-to-end quality score, since a wrong final answer in an agentic system could stem from any step in a variable-length execution path rather than one fixed generation call.
12. *When would you build custom AI-monitoring instrumentation on OpenTelemetry instead of adopting LangSmith or Langfuse?* When there's significant existing investment in a specific observability stack that AI metrics need to live alongside, when compliance/data-residency requirements aren't satisfied by a given platform's offering without heavy self-hosting effort, or when the specific AI-metric needs are narrow enough that a full platform's overhead isn't justified — a senior answer names the actual constraint driving the choice.
`,

  "coding-questions": `
### 1. A sustained-trend alerting function (tests correct handling of noisy signals)

~~~python
def should_alert(quality_windows: dict, threshold: float) -> bool:
    """quality_windows: {"24h_avg": float, "72h_avg": float}
    Only alert if BOTH the short and long window are below threshold —
    this filters out single-sample noise while still catching a real,
    sustained regression within a reasonable detection latency."""
    return quality_windows["24h_avg"] < threshold and quality_windows["72h_avg"] < threshold

assert should_alert({"24h_avg": 0.55, "72h_avg": 0.91}, threshold=0.7) is False  # noisy blip
assert should_alert({"24h_avg": 0.55, "72h_avg": 0.58}, threshold=0.7) is True   # sustained drop
~~~

Complexity note: O(1) — the exercise tests judgment about what constitutes signal versus noise, not algorithmic complexity. Follow-up: extend this to also require a minimum sample size per window before alerting, since a low-traffic window's average is statistically unreliable regardless of how far it is from the threshold.

### 2. Per-feature cost attribution with a rate-of-change alert (tests aggregation + drift-style reasoning)

~~~python
from collections import defaultdict

def cost_spike_alert(traces: list[dict], multiplier: float = 3.0) -> list[str]:
    """traces: [{"feature": str, "cost_usd": float, "day": str}, ...]
    Flags any feature whose most recent day's total cost is more than
    the multiplier times its trailing 7-day daily average."""
    by_feature_day: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for t in traces:
        by_feature_day[t["feature"]][t["day"]] += t["cost_usd"]

    flagged = []
    for feature, day_costs in by_feature_day.items():
        days_sorted = sorted(day_costs)
        if len(days_sorted) < 2:
            continue
        latest_day = days_sorted[-1]
        history = [day_costs[d] for d in days_sorted[:-1]]
        avg_history = sum(history) / len(history)
        if avg_history > 0 and day_costs[latest_day] > multiplier * avg_history:
            flagged.append(feature)
    return flagged

# Complexity: O(n) over trace records to bucket, O(f) over features to evaluate.
~~~

Follow-up: discuss why this alert should fire on rate-of-change rather than an absolute daily budget alone — a feature that's always expensive but stable isn't a monitoring finding, while a sudden multiplier jump (a retry loop, a broken cache, a prompt bug inflating token count) is exactly what you want surfaced quickly.

### 3. Localizing a regression to a pipeline stage (design/reasoning question, not pure code)

Given per-trace scores for retrieval relevance and generation faithfulness, write the logic that decides which stage most likely caused an end-to-end quality drop:

~~~python
def localize_regression(traces: list[dict]) -> str:
    """traces: [{"retrieval_relevance": float, "generation_faithfulness": float}, ...]
    Compares recent averages against stored baselines to isolate the
    stage responsible for a quality drop."""
    avg_relevance = sum(t["retrieval_relevance"] for t in traces) / len(traces)
    avg_faithfulness = sum(t["generation_faithfulness"] for t in traces) / len(traces)

    baseline_relevance, baseline_faithfulness = 0.85, 0.90  # from historical baseline store
    relevance_drop = baseline_relevance - avg_relevance
    faithfulness_drop = baseline_faithfulness - avg_faithfulness

    if relevance_drop > 0.1 and relevance_drop > faithfulness_drop:
        return "retrieval"
    if faithfulness_drop > 0.1 and faithfulness_drop > relevance_drop:
        return "generation"
    return "inconclusive — investigate both stages and check for input drift"
~~~

Discussion: this only works because retrieval relevance and generation faithfulness were scored independently in the first place — a single holistic end-to-end quality score would show the same aggregate drop with no way to tell which stage caused it, which is exactly the Advanced Concepts point about per-stage decomposition.
`,

  "hands-on-labs": `
### Lab 1 — Instrument a single LLM call with cost and token tracking (beginner, ~45 min)
Take any script that calls an LLM API once, wrap it with OpenTelemetry spans capturing model, input/output tokens, and computed cost, and log the record to a file or simple database. Deliverable: a small script producing one structured record per call, with cost correctly computed from token counts. Skills: span/attribute basics, cost calculation.

### Lab 2 — Instrument a RAG pipeline with per-stage tracing and an async quality-score callback (intermediate, ~2h)
Build a small retrieval-augmented pipeline and instrument it with nested spans for retrieval and generation, then add an async (queue-simulated) scoring step that independently scores retrieval relevance and generation faithfulness for each trace. Deliverable: three traces for three different questions, each showing correctly nested spans and two independent stage-level scores. Skills: multi-stage tracing, async scoring pattern, stage-level score decomposition.

### Lab 3 — Build a golden-set canary job and detect a synthetic model regression (intermediate/advanced, ~3h)
Create a 15–20 item golden set with expected properties, write a scheduled runner that scores current outputs against a stored baseline, and deliberately simulate a model regression (e.g. swap in a worse model or corrupt a prompt) to confirm your canary job correctly flags the drop. Deliverable: a short write-up showing the before/after canary scores and the alert firing correctly. Skills: canary design, drift detection, alerting logic.

### Lab 4 — Build cost and quality dashboards with sustained-trend alerting (production, ~4h)
Aggregate traced records from Labs 1–3 into per-feature cost dashboards and per-model/prompt-version quality dashboards (using Grafana or an equivalent), then implement an alerting rule requiring a sustained multi-window trend before firing, and a separate rate-of-change cost alert. Deliverable: a dashboard screenshot plus the alerting-rule logic and a short note on why each alert is tuned the way it is (what noise it avoids, what regression it still catches). Skills: aggregation, dashboarding, alert-fatigue-aware alerting design, the full production-checklist discipline.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-engineering and platform roles):

1. **A quality-and-cost observability layer for a RAG service** — Instrument a RAG pipeline end to end with per-stage tracing (retrieval, generation), an async scoring worker computing relevance and faithfulness scores, per-feature/per-user cost attribution, and a Grafana dashboard combining traditional latency/error metrics with quality/cost metrics in one view. Demonstrates: full-stack AI monitoring, the integration of AI-specific and traditional observability.

2. **A model-drift canary system** — Build a scheduled job that re-runs a versioned golden set against a production model configuration, stores historical scores, and alerts when the current run deviates meaningfully from baseline — with a companion input-distribution drift check comparing recent live traffic against a reference window. Demonstrates: drift detection methodology, the distinction between model drift and traffic drift, scheduled-job design independent of live traffic.

3. **A multi-tenant cost governance platform** — For an internal LLM gateway serving multiple teams, build per-team/per-feature cost dashboards, a rate-of-change cost-spike alert, and a budget-cap enforcement mechanism, plus a quality-monitoring layer ensuring cost optimizations (cheaper model routing, caching — see **Cost Optimization**) don't silently degrade quality. Demonstrates: cost attribution at scale, the interplay between cost and quality monitoring, platform/infrastructure-role-relevant governance design.

Each project: instrumented end to end (not just "traces exist" but dashboards that answer a real operational question), a short README explaining what became a span vs a separate async-scored signal and why, and an explicit note on how alerting thresholds were chosen to avoid both alert fatigue and slow detection.
`,

  "case-studies": `
### The "everything was green except the answers" story

A recurring pattern reported across teams shipping RAG chatbots: uptime, latency, and error-rate dashboards stayed fully healthy for weeks while user complaints about wrong or unhelpful answers quietly accumulated, because nobody had instrumented a quality signal distinct from those infrastructure metrics. Lesson: a system can be perfectly healthy by every traditional measure while failing at the one thing that actually matters to users — quality monitoring has to be built deliberately, it is never a byproduct of infrastructure monitoring.

### The silent model update that looked like a regression in our own code

A commonly cited scenario: a team spends a debugging session convinced a recent prompt change caused a quality drop, only to discover — via a golden-set canary re-run against an older stored baseline — that the drop also appears when re-running the pre-change prompt against the current model, proving the regression originated with a provider-side model behavior change, not the prompt edit under suspicion. Lesson: without a fixed, versioned reference set, teams waste real debugging time chasing a regression in their own code that was never there.

### The cost spike traced to a retry loop, not usage growth

A frequent pattern in cost-attribution postmortems: a sudden multi-x jump in spend for one feature, initially assumed to be organic usage growth, turns out on inspection of per-feature cost dashboards to be a silent retry loop (a broken error-handling path re-calling the LLM on every timeout) rather than more real user traffic. Lesson: cost attributed and alerted on per-feature, at write time, catches this kind of bug within a day; waiting for a monthly invoice catches it weeks late, after the cost has already been incurred.

### The judge model that agreed with itself

A cautionary pattern in evaluation design: a team using the same model family for both production generation and LLM-as-judge scoring found their quality scores stayed suspiciously high even as informal user complaints rose, eventually tracing it to self-preference bias in the judge — the judge model rated outputs from its own model family more favorably than an independent model or human reviewer did. Lesson: cross-check automated judge scores against a different model family or periodic human review, per the general caution in the **Evaluation** and **Hallucination** skills — don't let convenient judge-model reuse quietly bias your entire quality trend line.

Treat the specifics of these case studies as illustrative of well-documented failure patterns rather than verified, named company case studies — cross-check against a specific vendor's own published customer stories before citing a company by name.
`,

  comparisons: `
| Dimension | Custom OpenTelemetry-based build | LangSmith | Langfuse | Traditional APM only (Datadog/New Relic) |
|---|---|---|---|---|
| Captures quality/hallucination/drift | Yes, if you build the scoring/canary layer yourself | Yes, built-in datasets/evaluators | Yes, built-in datasets/evaluators | No — has no concept of answer correctness |
| Captures uptime/latency/error rate | Yes, via standard OTel exporters | Partial/secondary focus | Partial/secondary focus | Yes, this is its core strength |
| Cost-per-request/user/feature tracking | Build it yourself on span attributes | Built-in | Built-in | No — not model/token-aware |
| Self-hosting | Fully under your control | Limited/enterprise-only historically | First-class (Docker/Kubernetes) | Yes, for most APM vendors |
| Integration with existing infra dashboards | Native — same Prometheus/Grafana stack | Separate product/UI | Separate product/UI | Native, but blind to AI-specific signals |
| Setup effort | Highest — you build scoring, canaries, dashboards | Low — much of this discipline ships out of the box | Low — much of this discipline ships out of the box | Low, but solves a different (narrower) problem |

**How seniors choose**: if the team already has significant investment in **Prometheus**/**Grafana**/**OpenTelemetry** and wants AI-specific metrics living in the same pane of glass as infrastructure metrics, a custom build on those primitives is often worth the extra setup effort. If the team wants dataset-based evaluation, prompt-linked tracing, and quality dashboards with minimal setup, **LangSmith** or **Langfuse** (see those skills for the direct comparison between the two) get there faster. Traditional APM alone is never sufficient on its own for an LLM system — it should be run alongside, not instead of, one of the other three options, since it has no concept of answer quality at all. Verify current feature parity before treating this table as exhaustive — this category ships new capabilities frequently.
`,

  "related-technologies": `
- **Logging, Metrics, Tracing** — the traditional observability foundations this whole discipline is built on top of and complements rather than replaces; see those skills for the general vocabulary (spans, histograms, structured logs) reused throughout this page.
- **Prometheus, Grafana** — the common time-series-store-and-dashboard pairing many teams extend with AI-specific metrics rather than adopting a separate tool exclusively.
- **OpenTelemetry** — the vendor-neutral tracing standard underlying this page's worked example, and the substrate a custom AI-monitoring build is most commonly constructed on.
- **LangSmith, Langfuse** — purpose-built platforms implementing large parts of this discipline as a product; see those two skills for what "buy" looks like versus the "build" approach this page's concepts also support.
- **Evaluation** — the methodology (LLM-as-judge design, rubric scoring, dataset-based testing) that this page's quality metrics are built from and deployed continuously in production; read that skill for how to design the judge, this page for how to run it forever.
- **Hallucination** — the specific failure mode (confabulation, ungrounded claims) this page's hallucination-rate metric tracks; that skill covers the taxonomy and mitigation, this page covers detecting and trending it in production.
- **Cost Optimization** — what to do with the cost-attribution numbers this page surfaces (caching, model routing, budget policy); this page gives you the visibility, that skill gives you the levers.
- **Latency** — the adjacent production concern (TTFT, streaming) that any monitoring instrumentation must be careful never to regress; this page's async-scoring discipline exists specifically to protect it.
- **Agent Observability** — the agent-specific extension of this discipline (tool-call tracing, plan-vs-execution divergence) for multi-step autonomous systems, layered on top of the general concepts covered here.
- **AI Harness** — automated evaluation pipelines that score AI systems continuously; a close sibling concern to this page's async scoring pattern, often implemented by the same infrastructure.

On this platform, a natural learning path: **Logging/Metrics/Tracing/OpenTelemetry** (general observability foundations) → this page (the AI-specific layer) → **LangSmith**/**Langfuse** (purpose-built implementations) → **Evaluation**/**Hallucination** (the methodology this page's metrics are built from) → **Cost Optimization**/**Latency** (acting on what this page surfaces).
`,

  "latest-updates": `
As of this writing (knowledge cutoff early 2026), AI monitoring has been maturing quickly from "just tracing" toward a fuller quality-and-drift discipline: dataset-based evaluation, LLM-as-judge scoring, and cost dashboards have become close to standard features across the dedicated observability platforms (**LangSmith**, **Langfuse**), and OpenTelemetry-compatible ingestion has broadened how teams building custom instrumentation can interoperate with those platforms rather than choosing one exclusively.

Agent-specific monitoring (tool-call tracing, plan-vs-execution divergence, multi-agent handoff visualization) is the area moving fastest and least settled right now — expect the concrete tooling and best practices here to look different within a year or two of this writing. Drift-detection methodology for LLM inputs and outputs specifically (as opposed to the more mature, longer-established literature on drift detection for traditional ML classifiers) is also still an area where practices vary team to team rather than having converged on one standard approach.

I hold three things with low confidence and you should verify them before relying on them: the exact current feature parity between LangSmith, Langfuse, and newer entrants on agent-specific tracing; whether any provider has published an official, queryable "model version changed" signal (as opposed to teams having to infer it via their own canary sets); and current best-practice consensus on drift-detection statistics for text/embedding inputs specifically, which is less mature than the equivalent literature for structured/tabular ML monitoring. Treat every specific tool capability or "X now supports Y" claim on this page as directional unless independently verified against current official documentation.
`,

  "future-roadmap": `
Where this discipline is likely heading, and what's worth betting career time on:

- **Convergence toward OpenTelemetry as the common substrate**: the direction of the category is toward AI-specific observability tools consuming and emitting standard OTel data rather than fully proprietary formats, reducing lock-in and letting teams reuse existing tracing infrastructure across both AI-specific and traditional monitoring — the same trend already underway in the **Langfuse** skill's own trajectory. Investing in genuinely understanding **OpenTelemetry** pays off regardless of which specific AI-monitoring vendor or approach wins.
- **Evaluation-as-continuous-monitoring, not ad hoc**: the industry trend is toward treating dataset-based evaluation and canary/golden-set runs as an always-on production process (a CI-gate-like discipline) rather than a one-off pre-launch check — the general discipline in the **Evaluation** and **AI Harness** skills is the transferable, durable part of this shift.
- **Agent-specific monitoring maturing into its own sub-discipline**: as agentic systems move from demos to production, expect plan-vs-execution divergence, tool-call correctness, and multi-agent handoff tracing to get dedicated tooling support comparable to what request-level RAG tracing has today — see **Agent Observability** for where this is heading.
- **Standardized drift-detection statistics for LLM systems**: expect more settled, widely-adopted statistical methods (beyond the illustrative centroid-distance approach shown in Advanced Concepts) for input and output drift specifically for generative text systems, closing the maturity gap with the longer-established traditional ML monitoring literature.
- **Deeper cost-quality tradeoff tooling**: as model routing and caching (see **Cost Optimization**) become more sophisticated, expect monitoring tooling to more tightly couple cost dashboards with quality dashboards so a cost-saving change that silently degrades quality is caught automatically rather than requiring a human to cross-check two separate tools.

The safest career bet is the transferable mental model — trace-based root-causing, the distinction between drift and regression, async scoring architecture, sustained-trend alerting discipline — over deep expertise in any single vendor's specific dashboard UI, since these concepts carry across whichever specific platform or in-house build a given employer has standardized on.
`,

  "cheat-sheet": `
~~~text
AI MONITORING ESSENTIALS

The four AI-specific layers (on top of Logging/Metrics/Tracing/Prometheus/Grafana/OpenTelemetry)
  1. Request-level tracing  -> localize a bad answer to a pipeline stage
  2. Quality over time      -> quality score, hallucination rate, feedback signal
  3. Drift detection        -> input distribution shift + silent model behavior change
  4. Cost tracking          -> per request / per user / per feature, across providers

Tracing a pipeline (OpenTelemetry-based)
  with tracer.start_as_current_span("retrieval") as span:
      docs = retriever.search(query)
      span.set_attribute("retrieval.num_docs", len(docs))
  with tracer.start_as_current_span("generation") as span:
      resp = llm.generate(prompt)
      span.set_attribute("generation.model", resp.model)
      span.set_attribute("generation.cost_usd", estimate_cost(resp))

Quality scoring — ALWAYS async, never in the request path
  enqueue_for_async_scoring(request_id, answer, context)
  # worker: judge_score = llm_as_judge_score(answer, context)
  #         attach_score(request_id, name, value)

Golden-set / canary drift detection
  run_canary_check(golden_set, llm_client, judge)   # scheduled, e.g. daily
  compare avg_score against stored baseline -> alert on sustained deviation

Alerting — require a SUSTAINED trend, never single-sample noise
  should_alert = (24h_avg < threshold) AND (72h_avg < threshold)
  cost_alert  -> rate of change (e.g. 3x trailing daily avg), not just absolute cap

Cost attribution
  tag every generation span with: user_id, feature, model
  cost = input_tokens * price_in + output_tokens * price_out
  aggregate per user / per feature at write time, not from a billing dashboard later

Per-stage quality decomposition (don't rely on one holistic score)
  retrieval relevance   -> independent score
  generation faithfulness -> independent score (see Hallucination skill)
  tool-call correctness  -> exact-match / schema validity (agentic systems)

Feedback signals
  explicit: thumbs up/down            (low response rate)
  implicit: regeneration, edits, abandonment, dwell time  (higher volume proxies)

Build vs buy
  Custom OpenTelemetry build -> fits existing Prometheus/Grafana stack, more setup
  LangSmith / Langfuse       -> datasets, evaluators, prompt-linked tracing out of the box

Production non-negotiables
  - pin the judge model version (never "latest")
  - version the golden set in source control
  - keep scoring fully off the critical path
  - redact sensitive fields before trace/judge-call capture
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What does AI Monitoring add on top of traditional observability? | Quality score, hallucination rate, drift detection, and per-request/user/feature cost tracking — none of which uptime/latency/error-rate dashboards capture |
| Why must quality scoring run asynchronously? | It typically requires another model call (an LLM-as-judge); running it synchronously would add unacceptable latency to every user-facing request |
| What is a golden set / canary set for? | A fixed, versioned reference input set re-run on a schedule to detect a silent provider-side model behavior change, isolated from ordinary traffic-distribution shifts |
| Why decompose quality into per-stage scores (retrieval vs generation) instead of one holistic score? | A single end-to-end score tells you something is wrong; per-stage scores tell you what and where, turning a vague regression into an actionable finding |
| What's the difference between drift and a quality regression? | Drift means the input population or the model itself changed; a regression means the quality score actually dropped — conflating them causes both false alarms and missed real issues |
| Why require a sustained trend before alerting on quality? | LLM outputs and judge scores are stochastic; reacting to single-sample noise causes alert fatigue, the same failure mode as a poorly tuned traditional metrics alert |
| Why pin the judge model version explicitly? | A floating judge model can silently change behavior, confounding a real regression in your system with a change in how the judge itself scores |
| Why attribute cost at write time instead of from a billing dashboard later? | A cost spike tagged by user/feature at write time is visible the same day it starts; waiting for a monthly invoice means weeks of unattributed, unnoticed spend |
| What are implicit feedback signals, and why track them alongside explicit ones? | Regeneration, edits, and abandonment — higher-volume proxies for perceived quality than thumbs-up/down, which typically has a low response rate |
| When would you build custom instrumentation on OpenTelemetry instead of adopting LangSmith/Langfuse? | When there's significant existing investment in a Prometheus/Grafana/OTel stack, when compliance needs aren't met by a given platform's offering, or when needs are narrow enough that a full platform isn't justified |
| What does AI monitoring NOT do? | It doesn't invent the evaluation methodology (Evaluation), reduce hallucinations (Hallucination), or cut costs by itself (Cost Optimization) — it gives visibility that those other disciplines act on |
| What's the risk of using the same model as both production generation and judge? | Self-preference bias — the judge may rate its own model family's outputs more favorably than an independent judge or human reviewer would |
| What's the practical consequence of async scoring for user-facing latency? | Instrumentation overhead stays low and off the critical path; the tradeoff is that a bad answer is detected minutes to hours later, not before it reaches the user |
| What's a red flag that the scoring pipeline itself, not system quality, has a problem? | Quality scores stop updating entirely rather than dropping — check the async worker/queue health before assuming the metric reflects reality |
| Name one metric specific to monitoring agentic (tool-calling) systems. | Plan-vs-execution divergence, or tool-call success/correctness rate — beyond a single end-to-end quality score |
`,

  mcqs: `
1. What is the primary gap AI Monitoring fills that traditional observability (Logging/Metrics/Tracing) does not?
   A) It measures CPU and memory more precisely
   B) It answers whether the output was correct, tracks drift, and attributes cost — none of which traditional dashboards capture
   C) It replaces the need for error-rate and latency monitoring entirely
   D) It only applies to non-LLM systems
   **Answer: B** — A system can be fully healthy by every traditional signal while systematically producing wrong answers; AI Monitoring exists specifically to close that gap.

2. Why should quality scoring (e.g. LLM-as-judge) run asynchronously rather than inside the request path?
   A) Async code is always faster in Python
   B) It typically requires another model call, which would add unacceptable latency to every user-facing request if run synchronously
   C) Synchronous scoring is not technically possible
   D) Judges only work correctly on a delay
   **Answer: B** — Decoupling scoring from the request path keeps monitoring overhead off user-facing latency, joining scores back to the trace by request ID afterward.

3. What specifically does a golden/canary set protect against that live-traffic-only quality monitoring cannot reliably catch alone?
   A) High latency
   B) Distinguishing a silent provider-side model behavior change from an ordinary shift in input traffic
   C) Database connection leaks
   D) Judge model cost overruns
   **Answer: B** — A fixed, versioned reference set isolates "did the model change" from "did the traffic change," since both look identical as a live-traffic quality-score movement without a controlled reference.

4. Why alert on a sustained multi-window trend rather than a single below-threshold sample?
   A) Sustained trends are always easier to compute
   B) LLM outputs and judge scores are stochastic; single-sample noise causes false alarms and alert fatigue
   C) Single-sample alerts are technically impossible to implement
   D) Multi-window trends detect regressions faster
   **Answer: B** — Requiring agreement across multiple time windows (e.g. 24h and 72h averages) filters expected variance from a genuine, sustained quality regression.

5. What is the main risk of decomposing quality into only one holistic end-to-end score instead of per-stage scores (retrieval relevance, generation faithfulness, etc.)?
   A) It's computationally more expensive
   B) A regression can't be localized to a specific pipeline stage, turning root-causing into a much longer investigation
   C) Holistic scores are always inaccurate
   D) It prevents cost tracking
   **Answer: B** — Per-stage scoring is what turns "quality dropped" into "retrieval got worse" or "generation started hallucinating" — an actionable finding rather than a vague alarm.

6. Why should cost be attributed to user_id and feature at write time rather than reconciled from a provider's billing dashboard later?
   A) Billing dashboards are always inaccurate
   B) Write-time attribution makes a cost spike visible the same day it starts, rather than weeks later after an invoice arrives, by which point the spend already happened
   C) Providers don't offer billing dashboards
   D) It's required for the LLM API to function
   **Answer: B** — Tagging cost by feature/user at write time is what turns cost tracking into a same-day alerting signal instead of a monthly post-mortem exercise.
`,

  "revision-notes": `
AI Monitoring is the layer of observability specific to AI/LLM systems, sitting on top of — not replacing — traditional software observability (**Logging**, **Metrics**, **Tracing**, **Prometheus**, **Grafana**, **OpenTelemetry**). Where traditional monitoring answers "is it up, is it fast, did it error," AI Monitoring answers "was the answer correct, is it hallucinating, did users like it, how much did it cost, and has the input distribution or the model itself changed" — questions traditional tooling has no concept of, because a request can return HTTP 200 with a confidently wrong answer.

The discipline rests on four pillars: request-level tracing through a multi-step pipeline (retrieval, generation, tool calls) so a bad answer can be localized to the specific stage that caused it; quality metrics tracked over time from human feedback and/or automated LLM-as-judge scoring, decomposed per pipeline stage rather than one holistic number; drift detection, which splits into input distribution shift (the population of what users ask changes) and model behavior drift (a provider silently updates what a fixed model alias serves), the latter detected via a versioned golden/canary set re-run on a schedule since live-traffic-only monitoring can't isolate one variable from the other; and cost tracking attributed per request, user, and feature at write time, across however many model providers a system calls.

The architectural throughline that makes this work in production without hurting the user experience: span/attribute capture stays cheap and on the critical path (the same low-overhead instrumentation discipline as any OpenTelemetry-based tracing), while the expensive part — quality scoring, which usually means another model call — runs fully asynchronously and joins back to the trace by request ID afterward. Alerting on the resulting aggregates must require a sustained multi-window trend, never single-sample noise, to avoid the same alert-fatigue failure mode a poorly tuned traditional metrics alert produces.

Purpose-built platforms (**LangSmith**, **Langfuse**) implement large parts of this discipline as a product, competing on framework integration depth versus openness/self-hosting respectively (see those skills for the direct comparison); teams with heavy existing investment in a **Prometheus**/**Grafana**/**OpenTelemetry** stack, or specific compliance needs, often build custom instrumentation on those vendor-neutral primitives instead. Either path implements the same underlying concepts covered here.

What AI Monitoring deliberately does not do: it doesn't invent evaluation methodology (see **Evaluation**), it doesn't reduce hallucinations by itself (see **Hallucination**), and it doesn't cut costs by itself (see **Cost Optimization**) — it produces the visibility those adjacent disciplines act on, and it must never regress the very **Latency** it's trying to help protect by adding synchronous overhead to the request path.
`,

  "learning-roadmap": `
### Week 1 — Foundations and the conceptual gap
Read Overview through Prerequisites, making sure the distinction between traditional observability and AI-specific monitoring is fully internalized. Skim the **Logging**, **Metrics**, and **Tracing** skills if any of that vocabulary is unfamiliar. Milestone: you can explain, in one paragraph, why a system can be "fully healthy" on every traditional dashboard while systematically producing wrong answers.

### Week 2 — Tracing and quality scoring
Work through Beginner through Advanced Concepts and Internal Working. Complete Hands-on Lab 1 (single-call cost/token tracking) and Lab 2 (a RAG pipeline with per-stage tracing and an async quality-score callback). Milestone: a traced pipeline where retrieval relevance and generation faithfulness are scored independently, joined back to the original trace.

### Week 3 — Drift detection and alerting discipline
Read the drift and alerting-relevant parts of Advanced Concepts and the Monitoring section closely. Complete Hands-on Lab 3: build a golden-set canary job and deliberately simulate a regression to confirm it fires correctly. Milestone: you can explain, with a concrete example, the difference between a drift alert and a quality-regression alert, and why conflating them causes real problems.

### Week 4 — Production hardening and cost governance
Read Production Usage, Security, Deployment, and the Production Checklist. Complete Hands-on Lab 4: build cost and quality dashboards with sustained-trend alerting. Milestone: you can defend every item on the production checklist with a concrete reason, and you've internalized why async scoring, judge-model pinning, and versioned golden sets are non-negotiable rather than nice-to-haves.

Next platform skill: once the general discipline feels solid, deepen the "what to measure" methodology in **Evaluation** and **Hallucination**, contrast the "build vs buy" decision directly against **LangSmith** and **Langfuse**, and connect the cost numbers this page surfaces to concrete action in **Cost Optimization**.
`,

  "official-docs": `
- **OpenTelemetry documentation** — the vendor-neutral tracing/span/attribute model most custom AI-monitoring instrumentation is built on; start here for the underlying primitives this page's worked examples use. See the **OpenTelemetry** skill for the deeper treatment.
- **LangSmith documentation** and **Langfuse documentation** — the two purpose-built platforms implementing large parts of this discipline as a product; see the **LangSmith** and **Langfuse** skills for platform-specific depth.
- **Prometheus documentation** and **Grafana documentation** — for teams extending an existing metrics/dashboard stack with AI-specific metrics rather than adopting a separate tool; see the **Prometheus** and **Grafana** skills.
- **Provider API documentation (OpenAI, Anthropic, and others) usage/billing sections** — the source of truth for token-to-cost conversion rates that per-request cost attribution depends on; verify current pricing directly since it changes.

Verify exact URLs and current doc structure directly rather than relying on this list, since documentation sites reorganize and this is a fast-moving category.
`,

  books: `
No dedicated book exists specifically titled "AI Monitoring" as of this writing — it is an emerging discipline best learned from platform docs, adjacent literature, and hands-on practice rather than a single settled text. For the surrounding concepts, these are worth reading:

1. **"Observability Engineering" by Charity Majors, Liz Fong-Jones, George Miranda** — the best general treatment of why trace-based, high-cardinality observability beats coarse dashboards; the philosophy this page's tracing-first approach directly borrows from.
2. **"Distributed Tracing in Practice" by Austin Parker et al.** — foundational for the trace/span mental model underlying both traditional tracing and this page's request-level pipeline tracing.
3. **A current, well-reviewed book on LLM application evaluation or LLMOps** — covers the broader lifecycle (of which continuous monitoring is one slice); check publication date carefully, since this space moves fast and older titles go stale quickly.
4. **"Designing Data-Intensive Applications" by Martin Kleppmann** — not AI-specific, but essential background for understanding the transactional-vs-analytical storage split (trace store vs time-series metrics store) this page's architecture depends on.

Given how fast this category moves, treat the official docs of whichever platform or stack you adopt (**LangSmith**, **Langfuse**, or **OpenTelemetry**-based tooling) as the primary living reference for anything specific.
`,

  blogs: `
- **The official LangSmith and Langfuse blogs** — product updates and worked examples directly from teams building purpose-built platforms in this exact space; high-signal for concrete instrumentation patterns.
- **General LLMOps and AI-engineering blogs** from teams that have shipped production RAG/agent systems — useful for the surrounding practices (evaluation design, drift detection, cost governance) independent of any one specific tool.
- **The OpenTelemetry project blog** — useful for tracking how the broader tracing ecosystem is evolving to accommodate AI-specific semantic conventions, which affects how portable custom AI-monitoring instrumentation stays over time.
- **Engineering blogs from companies running LLM products at scale** — search for posts specifically on "LLM observability," "hallucination detection in production," or "model drift monitoring" for the most concrete, battle-tested detail, and verify any specific claim before repeating it.

Be selective: this is a fast-moving, marketing-heavy space — prioritize posts with actual instrumentation code and concrete before/after metrics over pure opinion pieces.
`,

  "research-papers": `
There is no single, settled body of academic literature specifically titled "AI monitoring" for production LLM systems — it's an applied, engineering-driven discipline rather than a mature research subfield, though it draws on several adjacent, more established research areas:

- **Distributed tracing research**: Google's Dapper paper ("Dapper, a Large-Scale Distributed Systems Tracing Infrastructure") is the intellectual ancestor of the trace/span model this page's request-level tracing reuses — foundational reading regardless of the AI-specific application.
- **LLM-as-judge and evaluation bias research**: papers addressing position bias, verbosity bias, and self-preference bias in using LLMs to evaluate other LLMs' outputs are directly relevant to this page's quality-scoring pipeline; cross-reference with the **Evaluation** and **Hallucination** skills, which treat this literature in more depth.
- **Concept drift and dataset shift research (traditional ML)**: the longer-established literature on detecting distribution shift in classical ML systems (population stability index, maximum mean discrepancy, and related statistical tests) is the closest rigorous foundation for the input-drift-detection concepts sketched in Advanced Concepts, even though most of that literature predates LLM-specific applications and needs adaptation for text/embedding inputs.
- **Hallucination detection and faithfulness/groundedness research**: a fast-growing body of work specifically on detecting whether a generated answer is supported by retrieved context — directly relevant to this page's faithfulness scoring; see the **Hallucination** skill for a fuller treatment.

If you need paper titles and authors for a citation, search current academic databases directly rather than trusting a title I might misremember — I will not invent a paper title or author list here.
`,

  videos: `
- **Conference talks specifically on "LLM observability" or "production AI monitoring"** from AI-engineering-focused conferences — search for recent talks by name rather than relying on a fixed list, since the specific tooling landscape changes year to year and older talks reference platform UIs that have since changed.
- **Official product walkthroughs from LangSmith and Langfuse** — the most reliable way to see trace/dataset/evaluation dashboards in action, since screenshots in written docs age faster than the product itself.
- **Talks on distributed tracing and observability engineering generally** (not AI-specific) — useful for internalizing the trace/span mental model this page's AI-specific layer builds on, from speakers associated with the observability engineering community.
- **Talks specifically on hallucination detection or LLM evaluation** — search current conference archives, since this sub-area is evolving quickly and last year's best talk on the topic may already be dated.

Search current platforms directly for the most up-to-date walkthroughs rather than relying on a fixed list here — video content in this fast-moving space goes stale within a year.
`,

  "github-repos": `
- **open-telemetry/opentelemetry-python** (or the relevant language SDK) — the tracing primitives this page's worked example builds on; read directly to understand what a span and its attributes actually are under the hood.
- **langfuse/langfuse** and **langfuse/langfuse-python** — see the **Langfuse** skill for full detail; worth browsing here specifically for how an open-source platform implements the async scoring and dataset/evaluator pattern this page describes conceptually.
- **langchain-ai/langsmith-sdk** (or the equivalent current SDK repository) — see the **LangSmith** skill; useful for the same reason as the Langfuse SDK, from the other major platform's perspective.
- **Repositories implementing LLM-as-judge evaluation harnesses** (search "llm as judge" or "llm evaluation harness" on GitHub) — worked examples of the scoring pattern this page's Monitoring section instruments; verify these are current and actively maintained before relying on one.
- **Repositories implementing drift detection for embeddings or text distributions** (search "embedding drift detection" or "text distribution shift") — closest available open-source starting points for the drift-detection concepts sketched in Advanced Concepts, since this specific sub-area lacks one canonical, widely-adopted library the way traditional ML drift detection does.
- **prometheus/prometheus** and **grafana/grafana** — for teams extending an existing metrics stack with AI-specific metric names rather than adopting a separate platform.

Verify these repositories are still actively maintained and check recent commit activity before building production instrumentation on any of them, since this space has significant churn.
`,

  "practice-problems": `
Ordered by the skill each focuses on:

1. **Tracing design (design practice)**: given a description of a five-stage agentic pipeline (router, retriever, reranker, generator, tool-caller), sketch exactly which parts become spans, what attributes each should carry, and where an async quality-scoring callback should attach.
2. **Drift-vs-regression diagnosis (diagnostic practice)**: given a scenario where both a golden-set canary score and live-traffic quality dropped simultaneously with no code deploy, walk through the reasoning that points to a provider-side model change rather than an application-side bug.
3. **Alerting threshold design (methodology practice)**: given a noisy hourly quality-score time series, design a sustained-trend alerting rule (choose window sizes, thresholds, and minimum sample-size requirements) and justify the choice against both false-alarm risk and detection-latency risk.
4. **Cost attribution and spike detection (implementation practice)**: given a stream of per-request cost records tagged by user and feature, implement a rate-of-change cost-spike detector and explain why rate-of-change catches a retry-loop bug that an absolute daily budget cap would miss until much later.
5. **Per-stage quality decomposition (design practice)**: given an end-to-end quality score that dropped, design the instrumentation changes needed to determine whether the cause is retrieval relevance, generation faithfulness, or a tool-call error, without re-architecting the whole pipeline.
6. **External practice sets**: LangSmith's and Langfuse's own official cookbook/example repositories (see GitHub Repositories) double as practice material for the async scoring and dataset-evaluation patterns central to this page — work through them and then adapt each example to a different pipeline shape to test real understanding rather than copy-paste familiarity.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph App["Application layer"]
        Pipeline["Multi-step pipeline\\n(retrieval, generation, tools)\\ninstrumented with OTel spans"]
    end
    subgraph Ingest["Ingestion"]
        Collector["OTel Collector or\\nplatform SDK (LangSmith/Langfuse)"]
    end
    subgraph Storage["Storage"]
        TraceStore[("Trace store\\nfull request/response detail")]
        MetricsStore[("Time-series store\\nquality/cost/latency aggregates")]
    end
    subgraph Async["Async scoring (off critical path)"]
        Judge["LLM-as-judge /\\nfaithfulness + relevance checkers"]
        Feedback["Human feedback UI events"]
        Canary["Scheduled golden-set canary job"]
    end
    subgraph Ops["Operations"]
        Dash["Dashboards\\n(Grafana or platform UI)"]
        Alerts["Alerting\\n(sustained-trend quality,\\ndrift, cost-spike rules)"]
    end

    Pipeline -->|spans + attributes| Collector
    Collector --> TraceStore
    Collector --> MetricsStore
    TraceStore --> Judge
    Feedback --> TraceStore
    Judge -->|scores joined back by request ID| TraceStore
    Judge --> MetricsStore
    Canary --> MetricsStore
    MetricsStore --> Dash
    MetricsStore --> Alerts
~~~

This reflects the reference architecture discussed in Internal Working and Architecture: cheap, on-critical-path span capture feeding both a trace store (for point-lookup debugging) and a metrics store (for windowed aggregation), with the expensive quality-scoring work — judge calls, human feedback joins, scheduled canary runs — kept entirely off the request's critical path and joined back asynchronously.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((AI Monitoring))
    Foundations
      Traditional observability vs AI-specific layer
      Logging/Metrics/Tracing as the base
      OpenTelemetry as the substrate
    Request-level tracing
      Trace/span per pipeline stage
      Span attributes: model, tokens, cost
      Localizing a bad answer to a stage
    Quality over time
      LLM-as-judge scoring
      Human feedback (explicit + implicit)
      Per-stage decomposition
      Hallucination rate
    Drift detection
      Input distribution shift
      Model behavior drift
      Golden set / canary jobs
      Silent provider model updates
    Cost tracking
      Per request
      Per user
      Per feature
      Multi-provider attribution
    Alerting
      Sustained trend vs single-sample noise
      Drift alerts vs regression alerts
      Cost rate-of-change alerts
    Architecture
      Async scoring off critical path
      Trace store vs metrics store split
      Scaling via sampling
    Ecosystem
      LangSmith
      Langfuse
      Evaluation
      Hallucination
      Cost Optimization
      Latency
      Agent Observability
~~~
`,
};

export default aiMonitoring;
