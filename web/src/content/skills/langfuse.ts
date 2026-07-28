import type { SkillContent } from "../types";

/**
 * Langfuse — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const langfuse: SkillContent = {
  overview: `
Langfuse is an open-source LLM engineering platform for tracing, evaluation, prompt management, and metrics. It gives AI engineers the equivalent of what application performance monitoring (APM) gives backend engineers, but shaped around the specific unit of work in an LLM system: a **trace** — a tree of nested spans, generations, and events that captures a full request through a chain, agent, or RAG pipeline, including every intermediate LLM call, tool call, retrieval step, input/output payload, token count, latency, and cost.

Langfuse is positioned deliberately as **framework-agnostic and self-hostable**. It ships a Python and a JS/TS SDK that work with raw API calls, with LangChain, with LlamaIndex, or with nothing at all — you can wrap a single function call and get a trace. And because the entire stack (application server, Postgres, ClickHouse, Redis, S3-compatible blob storage) is open source under the MIT license, teams that need to keep prompts, completions, and user data inside their own network boundary can run the whole thing themselves instead of sending traffic to a third-party SaaS.

For an AI engineer, Langfuse answers three recurring production questions: "why did this agent produce a bad answer three steps deep in a chain," "how much is this feature costing us per user per day across three different model providers," and "did last week's prompt change actually improve quality, or did it just look better in the one example I tried." Debugging, cost accounting, and evaluation are the three pillars of the product, and all three are built on top of the same trace data model.

Key characteristics: open-source core (MIT-licensed self-hosted edition plus a managed cloud offering with additional enterprise features), OpenTelemetry-adjacent tracing model (traces containing nested spans/generations/events), a prompt registry with versioning and labels, dataset-based evaluation with support for LLM-as-judge scoring, session and user-level grouping for product analytics, and multi-provider cost tracking in a single dashboard. It occupies the same problem space as LangSmith — see the **LangSmith** skill for the direct comparison — but competes primarily on openness, self-hosting, and framework neutrality rather than deep integration with one specific orchestration library.
`,

  history: `
Langfuse was built by **Marc Klingen, Clemens Rawert, and Max Deichmann**, founders who had previously worked on developer tooling and ran into the same wall repeatedly while building early LLM applications in 2022 to 2023: existing APM and logging tools had no concept of a prompt, a token, or a multi-step chain, and the emerging LLM-specific tools were closed, US-hosted-only SaaS products that many teams (especially in Europe, and especially anyone under GDPR or financial/health data rules) could not adopt for compliance reasons.

| Year | Milestone |
|------|-----------|
| 2022 | Founders building LLM products hit the observability gap firsthand; early internal tooling for tracing prompts and completions |
| 2023 | Langfuse launches publicly as an open-source LLM observability tool; YC-backed; core tracing SDK for Python and JS ships |
| 2023 | LangChain and LlamaIndex integrations land — one-line callback handlers auto-instrument popular framework calls |
| 2024 | Prompt management (versioned prompt registry) and Datasets/Evaluation features ship, expanding Langfuse from "just tracing" to a full LLMOps platform |
| 2024 | Self-hosting story matures: Docker Compose and Kubernetes/Helm deployment guides, ClickHouse added as the analytical store behind Postgres for traces at scale |
| 2024–2025 | LLM-as-judge evaluators, session/user analytics, and OpenTelemetry-compatible ingestion (accepting OTel spans directly) broaden interoperability with the wider observability ecosystem |
| 2025+ | Continued expansion of managed cloud tiers, deeper agent-tracing support (multi-agent graphs, tool-call visualization), and evaluation pipeline features |

Treat the exact feature-availability dates above as directional, not authoritative — verify specifics like which quarter a given feature GA'd against the official changelog before quoting a date in an interview or a design doc. My knowledge cutoff is early 2026 and Langfuse ships frequently.
`,

  "why-it-exists": `
Before dedicated LLM observability tools, teams building on top of GPT-3.5/GPT-4-era APIs debugged LLM applications the way they debugged everything else: print statements, ad-hoc logging to files, and manually pasting prompts into spreadsheets to track what changed. That approach breaks down fast for LLM systems specifically because:

- A single user-facing request can fan out into a dozen LLM calls (retrieval, reranking, generation, tool calls, sub-agent calls), and a bug or a bad answer could originate at any layer — flat logs don't show the tree structure.
- Cost and latency are driven by tokens, not just wall-clock time, and providers price differently per model — nothing in traditional APM understood "prompt tokens" or "completion tokens" as first-class metrics.
- Quality is not "did it 500," it's "was the answer good," which traditional monitoring has no opinion on at all — you need evaluation, not just uptime metrics.
- Prompts change constantly, and without versioning, nobody can answer "what prompt produced this specific bad trace from last Tuesday."

Langfuse exists to fill that gap with an **open, framework-agnostic** answer, at a moment (2023) when the emerging alternative — LangSmith — was tightly coupled to LangChain and closed-source. Some teams wanted the LLM-observability category to exist without committing to a single orchestration framework or a single vendor's servers holding their prompts and user data. That's the gap Langfuse filled: the same problem LangSmith solves, but open-source, self-hostable, and usable whether or not you use LangChain at all.
`,

  "problem-it-solves": `
Concretely, Langfuse removes:

- **Blind multi-step debugging**: instead of grepping logs across services, you open one trace and see every span — retrieval call, LLM generation, tool call — nested in the order they executed, each with its own input, output, latency, and (for generations) token usage and cost.
- **Cost opacity across providers**: if your app calls OpenAI for one step and Anthropic for another, Langfuse aggregates cost per trace, per user, per feature, in one dashboard, instead of you reconciling three separate billing pages.
- **Prompt version chaos**: the prompt registry gives every prompt a version history and labels (e.g. "production," "staging"), so a prompt change is an auditable, rollback-able event instead of an edit to a string literal buried in application code.
- **Ad-hoc quality checks**: datasets and evaluators let you run a fixed set of test inputs against a new prompt or model and score the outputs (including via LLM-as-judge), so "did this change help" becomes a repeatable measurement instead of a vibe check.
- **Vendor and framework lock-in** for teams that need it: self-hosting means prompts, completions, and possibly PII never leave your infrastructure, and the SDK works identically whether your app is raw API calls, LangChain, or LlamaIndex.

What Langfuse deliberately does **not** solve: it is not an LLM gateway or router (it doesn't decide which model to call or manage failover between providers — see tools built for that purpose), it is not a training or fine-tuning platform, and it does not replace application-level guardrails or content moderation — it observes and evaluates what already ran, it does not intercept or block requests in the request path by default (though tracing SDKs can be used alongside separate guardrail logic). It also is not a general-purpose APM — it will not replace Prometheus/Grafana/Datadog for your non-LLM infrastructure; teams typically run Langfuse alongside general observability tooling, not instead of it.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what a trace, span, generation, and event are in Langfuse's data model, and map that model explicitly onto OpenTelemetry's trace/span concepts.
2. Instrument a Python application with the Langfuse SDK, both via the LangChain/LlamaIndex integrations and via direct decorator-based instrumentation for framework-free code.
3. Read a captured trace to diagnose where in a multi-step chain latency, cost, or a bad output originated.
4. Set up a dataset, attach evaluators (including an LLM-as-judge evaluator), and track a quality score over time across prompt or model changes.
5. Create and version a prompt in the Langfuse prompt registry, fetch it at runtime, and roll back a bad version.
6. Group traces by session and user to support product-analytics questions ("how many turns does a typical conversation take," "which users hit errors most") in addition to debugging.
7. Describe the two viable deployment models — Langfuse Cloud vs self-hosted (Postgres + ClickHouse + Redis + object storage) — and articulate when self-hosting is worth the operational cost.
8. Compare Langfuse honestly against LangSmith and articulate the criteria a senior engineer would use to choose between them.
9. Identify the security-relevant surfaces of a self-hosted Langfuse deployment: API key handling, PII in captured payloads, and network exposure.
`,

  prerequisites: `
- **Required**: comfort writing Python (or JS/TS) applications that call an LLM API; basic familiarity with what a prompt, a completion, and a token are. See the **Python** skill if you need that foundation first.
- **Required**: a conceptual understanding of what an LLM chain or agent is — i.e. that a single user request can trigger multiple LLM calls in sequence. The **LLMOps** skill covers the broader lifecycle Langfuse instruments and is worth reading in parallel.
- **Helpful**: familiarity with the **OpenTelemetry** skill — Langfuse's trace/span/generation model deliberately parallels OTel's trace/span model, and understanding one makes the other click faster.
- **Helpful**: exposure to the **LangChain**, **LlamaIndex**, or **DSPy** skills, since Langfuse is commonly wired into one of these frameworks via a callback handler or instrumentation hook, though none of them is required — the SDK works standalone.
- **Helpful for the evaluation sections**: the **AI Evals** and **AI Harness** skills cover evaluator design (LLM-as-judge, rubric scoring, human-in-the-loop review) in more general depth than this page does.
- **Helpful for self-hosting**: basic Docker/Kubernetes literacy, and the **Secrets Management** skill for how to store the API keys a self-hosted deployment issues.

Dependency links: **Python/JS fundamentals** → **LLMOps concepts** → this page → pairs naturally with **LangSmith** (direct alternative), **OpenTelemetry** (shared mental model), **ClickHouse** (self-hosting internals).
`,

  "beginner-concepts": `
### What you are actually instrumenting

Every LLM application does the same shape of work: it receives an input, makes one or more calls to a model (or a retriever, or a tool), and produces an output. Langfuse's job is to capture that shape as structured data instead of scattered log lines.

### The core objects: trace, span, generation, event

~~~text
Trace                         <- one end-to-end operation (e.g. one user request)
 ├─ Span: "retrieve_context"   <- a unit of work with a start/end time
 │   └─ Generation: "rerank"  <- a span that specifically wraps an LLM call
 ├─ Generation: "answer_llm"   <- captures model, input, output, tokens, cost, latency
 └─ Event: "cache_hit"         <- a point-in-time annotation, no duration
~~~

- A **trace** is the root container — usually one per incoming request or one per conversation turn.
- A **span** is any nested unit of work with a start and end time — a retrieval step, a tool call, a data-processing step.
- A **generation** is a special kind of span specifically for an LLM call — Langfuse auto-captures model name, input/output, token counts, and cost when you use a supported SDK wrapper.
- An **event** is a zero-duration marker inside a trace — useful for logging a discrete fact ("guardrail triggered") without modeling it as a timed operation.

### The simplest possible instrumentation

~~~python
from langfuse import Langfuse

# Reads LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST from env by default
langfuse = Langfuse()

trace = langfuse.trace(name="support-question", user_id="user_123")

generation = trace.generation(
    name="answer_llm",
    model="gpt-4o-mini",
    input=[{"role": "user", "content": "How do I reset my password?"}],
)

# ... call your actual LLM provider here ...
answer = "Go to Settings > Security > Reset Password."

generation.end(
    output=answer,
    usage={"input": 42, "output": 11, "total": 53},  # token counts
)

langfuse.flush()  # ensure buffered events are sent before the process exits
~~~

### Why flush matters

The SDK batches events client-side and sends them asynchronously for performance — forgetting to call flush (or shut down the client cleanly) in a short-lived script (a Lambda, a CLI tool, a batch job) is the single most common reason "my traces never show up in the dashboard." Long-running servers (a FastAPI app) don't need manual flush calls in the request path because the background thread keeps sending, but you still want a shutdown hook to flush on process exit.

### Scores — attaching quality judgments to a trace

~~~python
langfuse.score(
    trace_id=trace.id,
    name="user_thumbs_up",
    value=1,          # numeric or boolean scores are common
    comment="User clicked thumbs up in the UI",
)
~~~

Scores are how both human feedback (a thumbs-up button) and automated evaluators (LLM-as-judge, exact-match) attach a number to a trace, which is what makes "track quality over time" possible later.
`,

  "intermediate-concepts": `
### Nesting spans to model a real pipeline

~~~python
from langfuse import Langfuse

langfuse = Langfuse()

trace = langfuse.trace(name="rag-answer", user_id="user_123", session_id="conv_9")

retrieval_span = trace.span(name="retrieve_context", input={"query": "refund policy"})
docs = ["Refunds are processed within 5 business days..."]  # your retriever call
retrieval_span.end(output={"num_docs": len(docs)})

generation = trace.generation(
    name="answer_llm",
    model="claude-sonnet-4-5",
    input=[{"role": "user", "content": "What is the refund policy?"}],
    metadata={"retrieved_docs": docs},
)
answer = "Refunds take 5 business days once approved."
generation.end(output=answer, usage={"input": 120, "output": 14, "total": 134})

langfuse.flush()
~~~

The trace now shows a parent-child tree: retrieval span, then generation, both under one trace — exactly what you need to answer "was the bad answer caused by bad retrieval or by the model ignoring good context."

### The decorator: the low-friction path for framework-free code

~~~python
from langfuse.decorators import observe, langfuse_context

@observe(as_type="generation")
def call_llm(prompt: str) -> str:
    # your actual provider call
    response = client.chat.completions.create(
        model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}]
    )
    langfuse_context.update_current_observation(
        usage={"input": response.usage.prompt_tokens,
               "output": response.usage.completion_tokens},
    )
    return response.choices[0].message.content

@observe()  # wraps the whole pipeline as a trace automatically
def answer_question(question: str) -> str:
    context = retrieve(question)          # nested @observe spans compose automatically
    return call_llm(f"Context: {context}\\nQuestion: {question}")
~~~

The @observe decorator infers the trace/span tree from your call stack — nested decorated functions become nested spans without manually threading trace objects through every function signature. This is the pattern most teams reach for once they've understood the manual trace/span/generation API above.

### LangChain integration

~~~python
from langfuse.callback import CallbackHandler
from langchain_openai import ChatOpenAI

langfuse_handler = CallbackHandler()   # reads keys from env
llm = ChatOpenAI(model="gpt-4o-mini")

response = llm.invoke(
    "Summarize this support ticket.",
    config={"callbacks": [langfuse_handler]},   # every internal LC call now traced
)
~~~

One callback handler auto-captures every chain step, tool call, and retriever call LangChain runs internally — no manual span code needed. See the **LangChain** skill for what a callback handler actually is under the hood.

### Prompt management: fetch, don't hardcode

~~~python
prompt = langfuse.get_prompt("support-answer-v2")   # fetches latest "production"-labeled version
compiled = prompt.compile(question="How do I cancel?", tone="friendly")

generation = trace.generation(
    name="answer_llm", model="gpt-4o-mini",
    input=compiled,
    prompt=prompt,   # links this generation back to the exact prompt version used
)
~~~

Linking a generation to the prompt object it used means every trace in the dashboard can be filtered by "which prompt version produced this," which is the foundation of the evaluation workflow covered in Advanced Concepts.

### Sessions and users for product analytics, not just debugging

Passing session_id and user_id consistently (as in the RAG example above) turns Langfuse from a pure debugging tool into a lightweight product-analytics surface: you can see "how many turns does a typical conversation take," "which users generate the most cost," and "which sessions ended in a low score" — questions that matter to product managers, not just engineers.
`,

  "advanced-concepts": `
### Datasets and repeatable evaluation

A **dataset** is a fixed set of input (and optionally expected-output) pairs you run repeatedly against different prompt or model versions to measure whether a change actually helped.

~~~python
dataset = langfuse.create_dataset(name="refund-questions")
langfuse.create_dataset_item(
    dataset_name="refund-questions",
    input={"question": "How long do refunds take?"},
    expected_output="5 business days",
)

# Later, run your pipeline against every item and log a trace + score per item
for item in dataset.items:
    trace = langfuse.trace(name="dataset-run")
    answer = answer_question(item.input["question"])
    item.link(trace, run_name="prompt-v3-2026-07-20")
    langfuse.score(trace_id=trace.id, name="exact_match",
                    value=1.0 if answer.strip() == item.expected_output else 0.0)
~~~

Running the same dataset against prompt-v2 and prompt-v3 and comparing average scores is how a change stops being a guess and becomes a measured decision — the same discipline the **AI Evals** skill covers in general, applied through Langfuse's specific dataset/run/score primitives.

### LLM-as-judge evaluators

Beyond exact-match, Langfuse supports running an LLM as an automatic grader against traces — asking a strong model to score a generation for correctness, toxicity, or a custom rubric, and attaching the result as a score. This scales evaluation past what a human can manually review, at the cost of being only as reliable as the judge model and prompt — the **AI Evals** and **AI Harness** skills cover the general pitfalls (judge bias, prompt sensitivity, position bias) that apply here too.

### Traces vs OpenTelemetry spans — the explicit parallel

| Langfuse concept | OpenTelemetry equivalent | Difference |
|---|---|---|
| Trace | Trace | Same idea: one root container per operation |
| Span | Span | Same idea: nested timed unit of work |
| Generation | Span with LLM-specific semantic conventions | Langfuse adds first-class fields: model, token usage, cost, prompt link |
| Event | Span Event | Same idea: zero-duration annotation |
| Score | No direct OTel equivalent | Langfuse-specific: a quality judgment attached after the fact |

Because of this overlap, Langfuse can ingest OpenTelemetry-formatted trace data directly in newer versions, meaning teams already emitting OTel spans from a polyglot service mesh can route LLM-relevant spans into Langfuse without a separate parallel instrumentation layer. See the **OpenTelemetry** skill for the general trace/span/context-propagation model this borrows from.

### Cost tracking across providers — how it actually computes cost

Langfuse maintains a table of per-token pricing for major providers/models and multiplies it against the token usage captured on each generation. When you use a provider-native SDK wrapper (OpenAI, Anthropic) usage is captured automatically from the API response; for custom or self-hosted models you must supply usage numbers yourself (as in the manual generation.end example above) or cost will show as zero/unknown. This is a common gotcha: cost dashboards silently under-report for any generation where usage wasn't populated.

### Multi-agent and tool-call tracing

For agentic systems where an LLM decides to call tools, spawn sub-agents, or loop, Langfuse models each tool call as its own span and each sub-agent invocation as a nested trace or span depending on how you structure the instrumentation — the practical decision (nested span vs new trace) depends on whether you want the sub-agent's cost to roll up into the parent's total, which most teams do want, favoring nested spans within one trace over separate traces per sub-agent call.

### Self-hosted architecture trade-offs

At small scale, Postgres alone can hold everything. At production scale, high trace volume overwhelms a single OLTP database for analytical queries (aggregating cost across millions of generations), which is why the self-hosted architecture separates **Postgres** (application state: users, projects, prompts, API keys) from **ClickHouse** (the columnar store that holds trace/observation events themselves and answers dashboard aggregation queries fast). See the **ClickHouse** skill for why a columnar OLAP store is the right tool for that specific workload.
`,

  "internal-working": `
At a high level, every SDK call does the same three things: build a structured event locally, buffer it, and ship it asynchronously to the Langfuse ingestion API, which persists it and makes it queryable in the dashboard.

~~~mermaid
flowchart LR
    A["Your app code\\n(SDK call: trace/span/generation)"] --> B["SDK client-side buffer\\n(batches events)"]
    B --> C["Background thread/task\\nflushes batches async"]
    C --> D["Langfuse ingestion API\\n(HTTP, auth via API keys)"]
    D --> E["Postgres\\n(projects, users, prompts, API keys)"]
    D --> F["ClickHouse\\n(trace/span/generation events at scale)"]
    F --> G["Dashboard queries\\n(cost, latency, score aggregations)"]
~~~

Step by step:

1. **Event construction**: calling trace(), span(), or generation() on the SDK builds a structured object in memory — no network call happens yet. The @observe decorator does the same thing implicitly by inspecting the call stack.
2. **Buffering**: the SDK queues events client-side rather than making one HTTP request per span — this is why a single traced request doesn't add meaningful latency to your application; the network cost is amortized across a batch and happens off the request's critical path.
3. **Async flush**: a background thread (Python) or the event loop (JS) periodically flushes the buffer to the Langfuse ingestion endpoint. Calling flush() manually forces this immediately — necessary in short-lived processes that would otherwise exit before the background flush fires.
4. **Ingestion and storage**: the ingestion API authenticates the request against the project's API key pair, validates the event shape, and writes it. Application metadata (projects, users, prompt versions, API keys) lives in Postgres; the high-volume trace/span/generation event stream is written to ClickHouse, which is built for exactly this kind of append-heavy, aggregation-heavy workload.
5. **Read path**: the dashboard, the prompt registry fetch (get_prompt), and evaluation queries all read back through this same split — prompt content and versions come from Postgres, trace exploration and cost/latency aggregation come from ClickHouse.

The practical consequence of this design: instrumentation overhead in your application is low (buffered, async, off the critical path), but there is inherent eventual consistency — a trace you just emitted may take a moment to appear in the dashboard, which occasionally confuses people debugging in real time.
`,

  architecture: `
### System architecture (self-hosted deployment)

~~~mermaid
flowchart TB
    subgraph App["Your application"]
        SDK["Langfuse SDK\\n(Python/JS) or OTel exporter"]
    end
    subgraph LangfuseStack["Langfuse server stack"]
        API["Web/API server\\n(ingestion + dashboard UI)"]
        Redis[("Redis\\nqueues, caching")]
        PG[("Postgres\\nprojects, users, prompts, API keys")]
        CH[("ClickHouse\\ntrace/span/generation events")]
        S3[("S3-compatible blob storage\\nlarge payloads, media")]
    end
    SDK -->|HTTPS, API key auth| API
    API --> Redis
    API --> PG
    API --> CH
    API --> S3
~~~

- **Web/API server**: serves both the ingestion endpoints the SDKs talk to and the dashboard UI engineers use.
- **Postgres**: the transactional store — projects, org membership, API keys, prompt definitions and versions, dataset definitions.
- **ClickHouse**: the analytical store — the actual trace/span/generation/event stream, sized for millions of rows and fast aggregation (cost per day, p95 latency per route).
- **Redis**: queues ingestion work and caches hot reads.
- **Blob storage (S3-compatible)**: large inputs/outputs (e.g. big documents, images) are offloaded here rather than stored inline in the database.

### Application-side architecture

The pattern that keeps instrumentation maintainable as an app grows:

~~~
myservice/
├── src/myservice/
│   ├── api/                 # FastAPI routes — start a trace per request here
│   ├── llm/
│   │   ├── client.py        # thin wrapper around provider SDKs + @observe
│   │   └── prompts.py       # wraps langfuse.get_prompt() with a typed interface
│   ├── pipelines/           # RAG/agent pipelines — nested spans via @observe
│   └── core/
│       └── observability.py # Langfuse client singleton, flush-on-shutdown hook
└── tests/
~~~

Rules that keep this clean: instantiate one Langfuse client per process (not per request), start exactly one trace per logical unit of work (usually one per incoming request or one per conversation turn, not one per LLM call), and keep prompt-fetching behind a small wrapper so swapping prompt versions never requires an application code change.
`,

  "data-flow": `
Tracing one request through an SDK-wrapped RAG call, from the user's HTTP request to a queryable trace in the dashboard:

~~~mermaid
sequenceDiagram
    participant User
    participant App as App server (FastAPI)
    participant SDK as Langfuse SDK
    participant Retr as Retriever
    participant LLM as LLM Provider
    participant Ingest as Langfuse ingestion API
    participant CH as ClickHouse

    User->>App: POST /ask {"question": "..."}
    App->>SDK: trace = langfuse.trace(name="ask", user_id, session_id)
    App->>SDK: span = trace.span(name="retrieve_context")
    App->>Retr: similarity_search(question)
    Retr-->>App: relevant docs
    App->>SDK: span.end(output={"num_docs": n})
    App->>SDK: generation = trace.generation(model, input, prompt=prompt_obj)
    App->>LLM: chat completion request
    LLM-->>App: answer + token usage
    App->>SDK: generation.end(output=answer, usage=tokens)
    Note over SDK: event buffered locally, not sent yet
    SDK-->>Ingest: async batch flush (background thread)
    Ingest->>CH: write trace/span/generation rows
    App-->>User: HTTP 200 {"answer": "..."}
    Note over User,CH: Dashboard queries CH later — trace visible with slight delay
~~~

The key thing this diagram makes explicit: the user's response is returned as soon as the LLM call finishes — the Langfuse flush happens asynchronously and is never on the critical path of the user-facing request. If your app crashes before flush completes, that trace is lost, which is why production services register a shutdown hook that calls flush before exiting rather than relying solely on the background timer.
`,

  "production-usage": `
### Choosing cloud vs self-hosted

Most teams start on **Langfuse Cloud** (the managed offering) because it requires zero infrastructure — sign up, get an API key pair, start sending traces. Teams move to **self-hosted** when they have a specific requirement: data residency (traces/prompts must stay in a specific region or never leave company infrastructure), a compliance mandate (GDPR, HIPAA-adjacent requirements) that a third-party SaaS complicates, or cost at high trace volume where self-hosting infrastructure is cheaper than a hosted per-seat/per-event pricing tier. Verify current Langfuse Cloud pricing tiers and self-hosting license terms against the official site before committing — pricing details change and are outside what I can state with confidence at this cutoff.

### Environment and configuration

~~~bash
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_HOST="https://cloud.langfuse.com"   # or your self-hosted URL
~~~

Non-negotiables for production:

1. **One client instance per process**, instantiated at startup, not per request — recreating it per request adds overhead and risks orphaned buffered events on crash.
2. **A shutdown hook that flushes** — register with your framework's lifespan/shutdown event so buffered traces aren't lost when a process exits or a container is rolled.
3. **Never log raw secrets keys to stdout** — treat LANGFUSE_SECRET_KEY like any other credential; see the **Secrets Management** skill for how to source it from a vault rather than a plaintext .env in production.
4. **Redact or truncate sensitive payloads before they reach a generation's input/output** if your prompts or completions can contain PII you're not allowed to persist even inside your own infrastructure.

### Typical project layout addition

A thin observability module (as shown in Architecture) that owns client creation, prompt fetching, and the @observe decorator usage keeps Langfuse calls out of business logic — pipelines call a wrapped LLM client, not the Langfuse SDK directly, so swapping or removing the observability layer later doesn't require touching every call site.
`,

  "industry-examples": `
Public, verifiable "who uses Langfuse and how" specifics are thinner than for a decade-old technology like Python, since Langfuse is a young (2023-founded) company — treat company names below as illustrative of the pattern of adoption (self-hosted, open-source, compliance-driven, or startup teams wanting framework neutrality) rather than a definitive, verified customer list; confirm current logos against Langfuse's own case studies page before quoting a specific company in a report.

- **European and regulated-industry startups**: teams building LLM products under GDPR or financial-services compliance commonly cite self-hosting as the deciding factor over a US-only SaaS competitor — Langfuse's open-source MIT-licensed self-hosted edition is built specifically for this audience.
- **YC-backed and early-stage AI startups**: Langfuse's own go-to-market has heavily targeted small, fast-moving AI teams who want tracing and prompt management without committing to a specific orchestration framework, since many early LLM startups roll their own lightweight agent code rather than adopting LangChain wholesale.
- **Teams already invested in LangChain or LlamaIndex**: the one-line callback handler integration makes Langfuse a common "bolt-on" observability layer for teams who chose a framework for orchestration but did not want that framework's own closed observability offering.
- **Platform/infrastructure teams building internal LLM gateways**: because the SDK is framework-agnostic, some organizations standardize on Langfuse as the observability layer behind an internal multi-team LLM gateway, instrumenting the gateway once rather than requiring every downstream team to adopt a specific framework's tracing.

Pattern to notice: Langfuse's adoption story tracks closely with teams who have a concrete reason to avoid vendor lock-in or a specific framework dependency — the same reasoning that drives adoption of any open-source alternative to a category-defining commercial product.
`,

  "best-practices": `
1. **Instantiate the Langfuse client once per process**, not per request — avoid the overhead and potential for dropped events from constant client churn.
2. **One trace per logical unit of work** (a request, a conversation turn) — resist the urge to create a new trace per LLM call; use nested spans/generations instead so cost and latency roll up correctly.
3. **Always register a flush-on-shutdown hook** in short-lived processes and containers — the single most common cause of "missing traces" is a process exiting before the async buffer drains.
4. **Link generations to prompt objects** via the prompt parameter rather than hardcoding prompt strings — this is what makes "which prompt version caused this" answerable later.
5. **Pass user_id and session_id consistently** from day one — retrofitting them onto historical traces is not possible, and you will want the product-analytics view eventually even if you don't today.
6. **Keep a thin wrapper module around the SDK** rather than sprinkling langfuse.trace()/span() calls through business logic — makes it possible to swap or remove the observability layer without touching pipeline code.
7. **Populate usage/token counts explicitly for any non-auto-instrumented model call** (self-hosted models, custom providers) — otherwise cost dashboards silently show zero for that traffic.
8. **Build a dataset from real production failures**, not just synthetic examples — the most valuable eval sets are the traces that actually went wrong.
9. **Use LLM-as-judge evaluators as a first-pass filter, not a final verdict** — spot-check judge scores against human review periodically to catch judge drift or bias, per the general guidance in the **AI Evals** skill.
10. **Redact or avoid capturing sensitive payloads** you are not allowed to persist, even in a self-hosted deployment — tracing captures full inputs/outputs by default, which is exactly the kind of data compliance policies scrutinize.
11. **Separate the analytical store's operational burden from day one if self-hosting** — plan for ClickHouse's operational requirements (backups, disk growth) with the same seriousness as Postgres; see the **ClickHouse** skill.
12. **Version-label prompts explicitly** ("production," "staging," "canary") rather than always fetching "latest" — an untested prompt change should never silently reach production traffic just because it was the most recently saved version.
`,

  "anti-patterns": `
### Creating a new trace per LLM call instead of nesting

~~~python
# WRONG — three unrelated traces; you cannot see the whole request as one unit
retrieval_trace = langfuse.trace(name="retrieve")
generation_trace = langfuse.trace(name="generate")

# RIGHT — one trace, nested span + generation
trace = langfuse.trace(name="answer_question")
span = trace.span(name="retrieve")
span.end(output=docs)
generation = trace.generation(name="generate", model="gpt-4o-mini")
generation.end(output=answer)
~~~

Splitting one logical request into multiple unrelated traces destroys the ability to see cost, latency, and failure causality as a single tree — the entire value of tracing.

### Forgetting to flush in short-lived processes

~~~python
# WRONG — a Lambda/CLI script that exits before the background flush runs
def handler(event, context):
    trace = langfuse.trace(name="job")
    process(event)
    # process exits here — buffered events may never be sent

# RIGHT
def handler(event, context):
    trace = langfuse.trace(name="job")
    process(event)
    langfuse.flush()
~~~

### Hardcoding prompts instead of using the registry

~~~python
# WRONG — no version history, no rollback, no link between trace and prompt version
PROMPT = "You are a helpful assistant. Answer: {question}"

# RIGHT
prompt = langfuse.get_prompt("assistant-answer", label="production")
compiled = prompt.compile(question=question)
~~~

Once a prompt is hardcoded, "what changed between the good trace and the bad one" becomes a git-blame archaeology exercise instead of a two-click dashboard comparison.

### Treating LLM-as-judge scores as ground truth

Trusting an automatic judge score without ever spot-checking it against human review lets judge bias (position bias, verbosity bias, the judge's own blind spots) silently drive product decisions. Sample and human-review a slice of judged traces regularly — see the **AI Evals** skill for the general failure modes.

### Capturing everything without redaction

Instrumenting a customer-support bot's traces with full raw user messages (names, emails, account numbers) and never redacting before it hits storage — even self-hosted storage — is a compliance liability. Redact at the instrumentation boundary, not as an afterthought.

### Not labeling prompt versions

Always fetching "latest" rather than a labeled version ("production") means an untested edit reaches live traffic the moment someone saves it in the prompt UI — no staging gate at all.
`,

  performance: `
### Rule zero: instrumentation overhead should be invisible to your users

Langfuse's SDKs buffer and flush asynchronously specifically so tracing does not add meaningful latency to the request path. If you observe a latency regression after adding instrumentation, the most likely causes, in order of likelihood, are:

1. **Synchronous flush calls in the request path** — only call flush() at process shutdown or in short-lived scripts, never per-request in a long-running server.
2. **Overly large payloads** (huge documents, images) captured as raw input/output on every generation — this bloats network payloads to the ingestion API and storage; truncate or reference large content instead of inlining it, or rely on the SDK's/self-hosted blob storage offload for genuinely large media.
3. **Too many trace/span objects per request** — one span per token or per tiny sub-step is overkill; group logically related work into a single span.

### Dashboard and query performance (self-hosted)

- Dashboard aggregation queries (cost per day, latency percentiles) run against ClickHouse, which is built for exactly this columnar aggregation workload — if these queries are slow, the more common cause is an undersized ClickHouse deployment (disk IO, memory) than anything on the SDK side. See the **ClickHouse** skill for sizing guidance for high-cardinality, high-volume event data.
- Postgres handles the transactional side (prompt fetches, API key auth) — this is a low-volume path relative to trace ingestion and rarely the bottleneck unless connection pooling is misconfigured.

### Practical numbers

Exact throughput/latency benchmarks for self-hosted Langfuse depend heavily on deployment size (single Docker Compose box vs a Kubernetes cluster with dedicated ClickHouse nodes) and are not something I can state with confidence at this cutoff — load-test your specific deployment against your expected trace volume rather than relying on a generic published number.
`,

  scalability: `
Langfuse's scaling story splits along its two storage backends.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["Langfuse API server (replica 1)"]
    LB --> API2["Langfuse API server (replica 2)"]
    API1 & API2 --> Redis[("Redis — queues, cache")]
    API1 & API2 --> PG[("Postgres — low volume, transactional")]
    API1 & API2 --> CH[("ClickHouse cluster — high volume trace events")]
~~~

- **API/web server tier**: stateless, scales horizontally behind a load balancer like any typical web service — see the **Kubernetes** and **Load Balancers** skills for the general pattern.
- **Postgres**: holds low-volume transactional data (projects, prompts, API keys) — rarely the bottleneck; standard Postgres scaling advice applies if it becomes one.
- **ClickHouse**: holds the high-volume trace/span/generation event stream and is the component that determines how much trace volume a self-hosted deployment can absorb — this is precisely the workload ClickHouse (a columnar OLAP store) is designed for, and it's why Langfuse's self-hosted architecture moved from Postgres-only to a Postgres+ClickHouse split as the product matured. See the **ClickHouse** skill for how it scales (sharding, replication, and why columnar storage beats row storage for aggregation-heavy queries).
- **Redis**: queues ingestion work between the API tier and the storage tier, and caches hot reads (like frequently-fetched prompts) — a bottleneck here shows up as ingestion lag, not dashboard slowness.

### Known ceilings and answers

| Bottleneck | Answer |
|---|---|
| High trace ingestion volume overwhelming a single-node deployment | Scale ClickHouse (the documented self-hosting guides cover multi-node ClickHouse setups); scale API replicas |
| Large raw payloads (documents, images) in traces | Offload to S3-compatible blob storage rather than inlining; truncate captured input/output where full content isn't needed |
| Postgres becoming a bottleneck | Rare in practice given low relative volume; standard connection-pool and read-replica techniques apply if it happens |
| Managed cloud hitting a pricing/volume ceiling for your traffic | Compare self-hosting cost at your specific volume against the cloud tier's pricing — this crossover point is workload-specific, verify against current pricing |
`,

  security: `
### Langfuse-specific attack surface

1. **API keys are the primary credential**: a public/secret key pair authenticates SDK traffic to a project. Treat the secret key exactly like a database credential — never commit it, never log it, source it from a vault or your platform's secret manager rather than a plaintext .env checked into git. See the **Secrets Management** skill for the general pattern, which applies directly here.
2. **Traces capture full request/response payloads by default**: if your application handles PII, financial data, or health data, that data flows into whatever Langfuse instance you're using — self-hosted or cloud. Redact or scrub sensitive fields at the instrumentation boundary (before calling trace()/generation()) rather than assuming Langfuse will do it for you; it will not.
3. **Self-hosted network exposure**: the Langfuse web/API server, Postgres, ClickHouse, and Redis should not be exposed directly to the public internet — put the API server behind your standard ingress/auth layer and keep the databases on a private network, exactly as you would for any other stateful backend service.
4. **Multi-tenancy boundaries**: if you self-host Langfuse for multiple internal teams or products, projects provide logical separation, but verify your specific version's project-isolation guarantees against the official docs before treating it as a hard security boundary for genuinely untrusted tenants.
5. **Prompt injection is not Langfuse's problem to solve**: Langfuse observes what a prompt/completion contained after the fact; it does not sanitize or block malicious input before it reaches your model. Prompt-injection defenses belong in your application layer, not the observability layer — see relevant security skills for that topic specifically.

### Supply chain and deployment hygiene

- Pin Docker image versions/digests for self-hosted deployments rather than tracking "latest," and review release notes before upgrading a production instance.
- Keep the self-hosted stack (Postgres, ClickHouse, Redis, the Langfuse server image) patched against known CVEs the same way you would any other piece of production infrastructure.
- Rotate API keys on a schedule and immediately on suspected leakage, same as any other credential.

See the dedicated **Secrets Management** and **OWASP Top 10** skills for depth on the general practices this section leans on.
`,

  testing: `
Testing an application that uses Langfuse splits into two concerns: testing your application logic without depending on Langfuse being reachable, and (occasionally) testing that instrumentation itself is wired correctly.

~~~python
# tests/test_llm_client.py
import pytest
from unittest.mock import patch, MagicMock
from myservice.llm.client import answer_question

def test_answer_question_does_not_require_live_langfuse(monkeypatch):
    """Business logic should not fail if Langfuse is unreachable."""
    monkeypatch.setenv("LANGFUSE_PUBLIC_KEY", "pk-lf-test")
    monkeypatch.setenv("LANGFUSE_SECRET_KEY", "sk-lf-test")
    monkeypatch.setenv("LANGFUSE_HOST", "http://localhost:1")  # unreachable on purpose

    with patch("myservice.llm.client.call_provider", return_value="mock answer"):
        result = answer_question("How do I cancel?")

    assert result == "mock answer"
~~~

### The senior testing doctrine for observability code

- **Application logic must degrade gracefully if the observability backend is unreachable** — a Langfuse outage should never take down your product; the SDKs are designed to fail open (swallow ingestion errors rather than raising), but verify this assumption for your SDK version rather than taking it on faith, and add a test that proves it.
- **Don't assert against Langfuse internals in unit tests** — mock the LLM provider call itself and assert on your application's return value, not on what got sent to Langfuse.
- **Reserve a genuine integration test (against a local self-hosted instance or a test project) for verifying the trace/span tree shape is what you expect** — run this in CI sparingly (it's slower and needs network access), not on every commit.
- **Evaluation runs (datasets) are themselves a form of testing** — treat a dataset run against a new prompt version as a CI gate before promoting that prompt's label to "production," not just a manual dashboard check.
`,

  debugging: `
### The toolbox, in escalation order

1. **Open the trace in the Langfuse dashboard first** — this is the entire point of the tool: see the full span/generation tree, inputs, outputs, and timing for the specific request that misbehaved, rather than grepping application logs.
2. **Check whether the trace appeared at all** — if it's missing, the most common causes are: forgot to call flush() in a short-lived process, wrong/mismatched API keys, or the SDK silently swallowed a network error (check SDK debug logging).

~~~python
import logging
logging.getLogger("langfuse").setLevel(logging.DEBUG)  # see SDK-level ingestion logs
~~~

3. **Compare cost/token fields against your provider's own dashboard** if numbers look wrong — a zero-cost generation almost always means usage wasn't populated for that call (common with self-hosted/custom models that aren't auto-instrumented).
4. **Use dataset runs to bisect a regression** — if a specific prompt or model version started producing worse answers, re-run your evaluation dataset against the previous and current versions and compare scores side by side rather than guessing from a handful of manually inspected traces.
5. **Check session/user grouping** when a "bad experience" report from a specific user doesn't match a single trace — pull all traces for that session_id/user_id to see the whole conversation, not just one turn.
6. **For self-hosted deployments, check ClickHouse and Postgres health directly** (disk space, query latency) when the dashboard itself is slow or traces are delayed — the API layer being healthy doesn't guarantee the storage layer is.
`,

  monitoring: `
Monitoring splits into two layers: monitoring your application's use of Langfuse (is instrumentation healthy), and using Langfuse itself as the monitoring tool for your LLM system's quality/cost/latency.

### Langfuse as your LLM monitoring layer

~~~python
# Attach a score any time you have a quality signal — automated or human
langfuse.score(trace_id=trace.id, name="llm_judge_correctness", value=0.86)
langfuse.score(trace_id=trace.id, name="user_thumbs_up", value=1)
~~~

Track over time, per prompt version and per model: average score, p95 latency per generation, cost per trace and per user, and error rate (generations that raised or returned an empty output). These are the RED-style metrics of an LLM system, and the dashboard is built specifically to slice them by prompt version, model, and time window.

### Monitoring the instrumentation layer itself

- **SDK ingestion errors**: enable SDK-level logging (as in Debugging) in non-production environments to catch silent ingestion failures before they hide a monitoring gap in production.
- **Flush health at shutdown**: log a warning if flush() times out or reports unsent events on graceful shutdown — a slow but silent data-loss signal otherwise.
- **Self-hosted infrastructure**: monitor Postgres, ClickHouse, and Redis with your standard infrastructure monitoring stack (see the general **Monitoring**/observability skills) — Langfuse's own health depends on all three being healthy.

### Structured logging around Langfuse calls

~~~python
import structlog
log = structlog.get_logger()

log.info("trace_started", trace_id=trace.id, user_id=user_id, session_id=session_id)
~~~

Logging the trace_id alongside your application's own structured logs lets you jump from a log line straight to the corresponding Langfuse trace URL, bridging your general observability stack (see the **OpenTelemetry** skill) and Langfuse's LLM-specific view.
`,

  deployment: `
### Self-hosted deployment (Docker Compose sketch)

~~~dockerfile
# This is illustrative of the shape of a self-hosted stack, not the official
# Langfuse Docker Compose file verbatim — check the current official
# self-hosting guide before deploying, as service names/images change.
version: "3.8"
services:
  langfuse-server:
    image: langfuse/langfuse:latest    # pin an exact tag in production, not "latest"
    environment:
      DATABASE_URL: "postgresql://user:pass@postgres:5432/langfuse"
      CLICKHOUSE_URL: "http://clickhouse:8123"
      NEXTAUTH_SECRET: "set-a-strong-random-secret-here"
    depends_on: [postgres, clickhouse, redis]
    ports: ["3000:3000"]
  postgres:
    image: postgres:16
    volumes: ["pg-data:/var/lib/postgresql/data"]
  clickhouse:
    image: clickhouse/clickhouse-server:latest
    volumes: ["ch-data:/var/lib/clickhouse"]
  redis:
    image: redis:7
volumes:
  pg-data:
  ch-data:
~~~

Why each choice matters: pinning exact image tags (not latest) makes upgrades deliberate rather than accidental; persistent volumes for Postgres and ClickHouse are non-negotiable (losing either loses your trace history/prompt history respectively); Redis needs no persistent volume in most setups since it's a queue/cache, not a system of record.

### Application-side deployment

- Set LANGFUSE_HOST to your self-hosted URL (or the cloud URL) via environment configuration, validated at startup — fail fast if keys are missing rather than silently running unobserved.
- Ensure your application's shutdown sequence calls flush() before the process actually terminates — wire this into your framework's lifespan/shutdown hooks (e.g. FastAPI's lifespan context manager), not an afterthought.

### Kubernetes / Helm

For production self-hosting at scale, most teams move from Docker Compose to a Kubernetes deployment using Langfuse's published Helm chart, which separates the web/API server, ClickHouse, Postgres, and Redis into independently scalable deployments/statefulsets — verify the current chart's structure against Langfuse's official self-hosting documentation, since Helm chart layouts evolve.
`,

  "production-checklist": `
Before a self-hosted (or cloud) Langfuse integration takes real production traffic:

- [ ] LANGFUSE_PUBLIC_KEY/SECRET_KEY sourced from a secret manager, not a plaintext .env in git
- [ ] Exactly one Langfuse client instantiated per process, not per request
- [ ] Flush-on-shutdown hook wired into the framework's lifespan/shutdown event
- [ ] One trace per logical request/conversation-turn; nested spans/generations for sub-steps
- [ ] user_id and session_id populated consistently from day one
- [ ] Prompts fetched via the registry with an explicit label (e.g. "production"), never "always latest"
- [ ] Token usage explicitly populated for any non-auto-instrumented model call
- [ ] Sensitive payload fields redacted or truncated before reaching trace input/output
- [ ] SDK configured to fail open (verified) — a Langfuse outage does not break your product
- [ ] (Self-hosted) Postgres and ClickHouse on persistent volumes with a backup policy
- [ ] (Self-hosted) API server, Postgres, ClickHouse, Redis not directly exposed to the public internet
- [ ] (Self-hosted) Docker image tags pinned to a specific version, not latest
- [ ] At least one evaluation dataset exists and is run before promoting a prompt/model change to production
- [ ] Dashboards/alerts exist for cost-per-day and p95 latency per route, not just uptime
`,

  "common-mistakes": `
1. **Forgetting flush() in short-lived processes** — traces silently vanish because the background sender never got a chance to run before the process exited.
2. **Creating a new trace per LLM call** instead of nesting spans/generations under one trace — destroys the ability to see a request as a single causal tree.
3. **Hardcoding prompts** instead of using the prompt registry — loses version history and the trace-to-prompt-version link that makes debugging regressions possible.
4. **Not populating token usage for custom/self-hosted models** — cost dashboards silently show zero, and teams wrongly conclude "this model is free."
5. **Fetching "latest" prompt version everywhere** instead of a labeled version — an unreviewed edit reaches production the moment it's saved.
6. **Capturing full raw payloads without redaction** on data you're not allowed to persist, even in your own self-hosted instance — a compliance issue waiting to be discovered.
7. **Trusting LLM-as-judge scores uncritically** without periodic human spot-checks — judge bias silently steers prompt/model decisions.
8. **Under-provisioning ClickHouse in a self-hosted deployment** — the API server and Postgres look healthy while dashboard queries slowly time out because the analytical store is undersized for trace volume.
9. **Assuming Langfuse blocks or filters bad output** — it observes and scores after the fact; it is not a guardrail or content-moderation layer.
10. **Not distinguishing session_id from trace granularity early** — retrofitting consistent session/user grouping onto months of historical traces is not possible; get the ID scheme right on day one.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Traces never appear in the dashboard | Missing flush() in a short-lived process | Call langfuse.flush() before process exit, or use a framework shutdown hook |
| 401/403 from the ingestion API | Wrong or mismatched public/secret key pair, or wrong LANGFUSE_HOST | Verify keys and host match the target project (cloud vs self-hosted URL) |
| Cost shows as 0 for some generations | Token usage not populated for a non-auto-instrumented call | Manually pass usage={...} on generation.end() |
| Trace tree looks flat instead of nested | Spans/generations created against the wrong parent, or a new trace started per call | Ensure child spans are created via trace.span()/trace.generation(), not a fresh langfuse.trace() each time |
| Dashboard/query latency high on self-hosted | Undersized ClickHouse for current trace volume | Scale ClickHouse (more nodes/resources); check disk IO |
| Prompt compile() raises a missing-variable error | Prompt template expects a variable not passed to compile() | Match compile() kwargs to the prompt's declared variables |
| Application slows down after adding tracing | Synchronous/manual flush() called in the request path | Only flush at shutdown or in short-lived scripts, never per-request |
| Sensitive data visible in a trace you didn't expect | No redaction applied before capturing input/output | Redact/scrub at the instrumentation boundary before calling trace()/generation() |

The habit that matters: check the trace in the dashboard first — most "why is this wrong" questions are answered by simply looking at what actually got captured before assuming an SDK bug.
`,

  faqs: `
**Q: Do I need LangChain to use Langfuse?**
No. LangChain and LlamaIndex integrations are convenience callback handlers; the core SDK (manual trace/span/generation calls, or the @observe decorator) works with any Python or JS/TS application, framework-free.

**Q: Langfuse or LangSmith — which should I pick?**
It depends on your constraints. If you're deep in the LangChain ecosystem and don't need self-hosting or framework neutrality, LangSmith's tighter integration may be simpler. If you need to self-host for data residency/compliance, want to avoid vendor lock-in, use multiple frameworks (or none), or are cost-sensitive at scale, Langfuse's open-source model is the stronger fit. See the Comparisons section and the **LangSmith** skill for the full breakdown.

**Q: Does self-hosting mean I never pay anything?**
No — self-hosting is free of Langfuse license fees for the open-source edition, but you pay in infrastructure cost (Postgres, ClickHouse, Redis, compute) and operational burden (upgrades, backups, scaling). Whether that's cheaper than the managed cloud tier depends on your trace volume; verify current cloud pricing before deciding.

**Q: Will tracing slow down my application?**
Negligibly, if used correctly — the SDK buffers and flushes asynchronously off the request's critical path. The main way to accidentally add latency is calling flush() synchronously inside a request handler; don't.

**Q: What happens to a trace if Langfuse itself is down?**
Well-behaved SDKs are designed to fail open (swallow ingestion errors rather than crashing your app), but verify this behavior for your specific SDK version with a test rather than assuming it — an observability outage should never become a product outage.

**Q: Can Langfuse replace my general APM (Datadog, Prometheus/Grafana)?**
No — it's purpose-built for LLM-specific data (prompts, tokens, generations, scores). Most teams run it alongside general infrastructure observability, not instead of it.

**Q: How do I keep an untested prompt edit from reaching production?**
Use labels ("staging" vs "production") in the prompt registry and always fetch by label in application code, never "latest" — promote a version to the "production" label only after a dataset evaluation run confirms it didn't regress quality.

**Q: Is Langfuse only for chat/agent apps?**
No — any LLM call benefits, including single-shot classification, summarization, or extraction pipelines. The trace/span model scales down to "one generation, no nesting" just as well as it scales up to a multi-agent graph.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is a trace in Langfuse, and how does it differ from a span?* A trace is the root container for one end-to-end operation (e.g. one request); a span is any nested timed unit of work inside it. A generation is a specialized span for an LLM call that also captures model, tokens, and cost.
2. *Why would you call flush() explicitly?* The SDK buffers events and sends them asynchronously in the background; a short-lived process (script, Lambda) can exit before that background send fires, so flush() forces it before the process ends.
3. *What's the difference between hardcoding a prompt string and using Langfuse's prompt management?* The registry gives version history, labels (production/staging), rollback, and links each generation back to the exact prompt version that produced it — a hardcoded string has none of that.
4. *How does Langfuse know how much an LLM call cost?* It multiplies captured token usage by a per-model pricing table; for auto-instrumented provider SDKs usage is captured automatically, for custom/self-hosted models you must supply usage manually.
5. *What is a score, and where does it come from?* A numeric or boolean judgment attached to a trace — from human feedback (a UI thumbs-up), an automated evaluator (exact-match), or an LLM-as-judge grader.

**Senior:**

6. *Compare Langfuse's trace/span model to OpenTelemetry's.* Conceptually near-identical (trace containing nested spans), with Langfuse adding LLM-specific semantics (generation as a specialized span with model/tokens/cost/prompt-link) and a scoring concept OTel doesn't have natively. Strong answers mention that newer Langfuse versions can ingest OTel-formatted spans directly, letting teams reuse existing OTel instrumentation.
7. *Design the self-hosting architecture for a team ingesting a very high volume of traces.* Split transactional data (Postgres: projects, prompts, keys) from the high-volume analytical event stream (ClickHouse: traces/spans/generations); scale the API tier horizontally behind a load balancer; offload large payloads to S3-compatible storage; monitor ClickHouse disk/IO as the primary scaling constraint.
8. *How would you prove a prompt change actually improved quality, not just anecdotally?* Build/maintain a dataset of representative inputs (ideally drawn from real production failures), run it against both prompt versions, score outputs (exact-match and/or LLM-as-judge), and compare aggregate scores before promoting the new version's label to production.
9. *What are the risks of relying solely on LLM-as-judge scoring?* Judge bias (verbosity/position bias), judge-prompt sensitivity, and the judge model's own blind spots on the same failure modes it's grading for; mitigate with periodic human spot-checks and, where possible, exact-match or rubric-based checks alongside the judge.
10. *When would you choose Langfuse over LangSmith, and vice versa?* Choose Langfuse when self-hosting/data residency, framework neutrality, or open-source licensing matter; choose LangSmith when you're fully committed to LangChain and want the tightest possible integration with that ecosystem and don't need to self-host. A senior answer names the actual constraint driving the choice rather than a blanket preference.
11. *How do you keep tracing overhead off the user-facing request path?* Rely on the SDK's async buffering/background flush by default; never call flush() synchronously inside a request handler; only force-flush at process shutdown or in short-lived batch jobs.
12. *How would you handle PII in traces for a regulated industry?* Redact/scrub sensitive fields at the instrumentation boundary before calling trace()/generation(), self-host to keep data in-network if required, and treat API keys and stored trace data with the same rigor as any other PII-bearing system (see the Secrets Management and Security sections).
`,

  "coding-questions": `
### 1. A minimal tracing wrapper around a provider call (tests understanding of the generation lifecycle)

~~~python
from langfuse import Langfuse
from time import perf_counter

langfuse = Langfuse()

def traced_llm_call(trace, prompt_text: str, call_provider) -> str:
    """Wrap any provider call in a Langfuse generation, capturing latency
    even if the provider itself doesn't return timing info."""
    generation = trace.generation(name="llm_call", model="gpt-4o-mini", input=prompt_text)
    start = perf_counter()
    try:
        output, usage = call_provider(prompt_text)
    except Exception as exc:
        # Still close the generation on failure so the trace isn't left dangling
        generation.end(output=None, level="ERROR", status_message=str(exc))
        raise
    else:
        generation.end(output=output, usage=usage,
                        metadata={"latency_s": round(perf_counter() - start, 3)})
        return output
~~~

Complexity note: this is O(1) overhead per call — the point of the exercise is correctness under failure (always closing the generation) rather than algorithmic complexity. Follow-up: extend it to retry with backoff while still producing exactly one generation per logical attempt, nested under a parent span representing "the whole retry loop."

### 2. Aggregate cost per user from a batch of trace records (tests data modeling over the trace/generation tree)

~~~python
from collections import defaultdict

def cost_per_user(traces: list[dict]) -> dict[str, float]:
    """Each trace dict looks like:
    {"user_id": str, "generations": [{"cost": float}, ...]}
    Sum cost across all generations, grouped by user."""
    totals: dict[str, float] = defaultdict(float)
    for trace in traces:
        user = trace.get("user_id", "unknown")
        totals[user] += sum(g["cost"] for g in trace["generations"])
    return dict(totals)

# Complexity: O(n) over total generations across all traces.
assert cost_per_user([
    {"user_id": "u1", "generations": [{"cost": 0.002}, {"cost": 0.001}]},
    {"user_id": "u2", "generations": [{"cost": 0.01}]},
]) == {"u1": 0.003, "u2": 0.01}
~~~

Follow-up: extend to also compute p95 latency per user, and discuss why this kind of aggregation is exactly what a columnar store like ClickHouse is built to do fast at millions of rows, versus a naive Python loop over all history each time.

### 3. Deciding nested-span vs new-trace for a sub-agent call (design/reasoning question, not pure code)

Given an orchestrator agent that spawns a sub-agent to handle a tool call, write the instrumentation choice and justify it:

~~~python
# Preferred: nested span under the parent trace, so the sub-agent's
# cost/latency roll up into the parent request's totals.
def run_subagent(parent_trace, task: str) -> str:
    sub_span = parent_trace.span(name="subagent_call", input={"task": task})
    result = subagent.run(task)
    sub_span.end(output=result)
    return result
~~~

Discussion: creating a brand-new trace() per sub-agent call would make each sub-agent invocation appear as an unrelated top-level operation in the dashboard, breaking the "one trace = one user-facing request" mental model and making total-cost-per-request queries wrong. The only case for a separate trace is when the sub-agent call is genuinely independent of the parent request's lifecycle (e.g. an async background job triggered by, but not part of, the original request).
`,

  "hands-on-labs": `
### Lab 1 — Instrument a single LLM call (beginner, ~45 min)
Take any script that calls an LLM API once, wrap it with a manual trace()/generation() pair (or the @observe decorator), populate token usage, and confirm the trace appears in the dashboard with correct cost. Deliverable: a screenshot of the trace plus the diff that added instrumentation. Skills: the core trace/span/generation model, flush semantics.

### Lab 2 — Instrument a RAG pipeline with nested spans (intermediate, ~2h)
Build a small retrieval-augmented pipeline (a toy document search + LLM answer step) and instrument it with one trace per question containing a retrieval span and an answer generation, both linked to a versioned prompt fetched from the registry. Deliverable: three traces showing three different questions, each with a visibly correct nested tree. Skills: nested spans, prompt registry, session/user grouping.

### Lab 3 — Build and run an evaluation dataset (intermediate/advanced, ~3h)
Create a dataset of 15–20 representative questions (ideally drawn from real or realistic failure cases), run your pipeline from Lab 2 against two different prompt versions, score each run with both an exact/rubric check and an LLM-as-judge evaluator, and produce a comparison of average scores between the two prompt versions. Deliverable: a short write-up recommending which prompt version to promote to "production" and why. Skills: datasets, evaluators, LLM-as-judge, prompt labeling.

### Lab 4 — Self-host Langfuse and cut over a service to it (production, ~4h)
Stand up a self-hosted Langfuse stack locally with Docker Compose (server, Postgres, ClickHouse, Redis), point an application at it via LANGFUSE_HOST, and verify traces, prompts, and datasets all work end to end against the self-hosted instance instead of the cloud. Add a flush-on-shutdown hook and a redaction step for one sensitive field. Deliverable: a short architecture note explaining the Postgres/ClickHouse split and what you'd need to change to run this in Kubernetes at real scale. Skills: the entire self-hosting architecture, security/redaction practices, production checklist items.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-engineering roles):

1. **Multi-provider LLM cost dashboard** — A small service that routes requests across two or three LLM providers (e.g. OpenAI and Anthropic) for different tasks, fully instrumented with Langfuse so cost, latency, and token usage are visible per provider, per user, and per feature in one dashboard. Demonstrates: multi-provider instrumentation, cost tracking, session/user grouping.

2. **Prompt-regression-testing pipeline** — A CI-integrated workflow: every pull request that changes a prompt automatically runs a Langfuse dataset evaluation (exact-match plus LLM-as-judge) comparing the new prompt against the current "production"-labeled version, and blocks the merge if the average score regresses beyond a threshold. Demonstrates: datasets, evaluators, prompt labeling, CI integration — directly relevant to teams that treat prompts as code.

3. **Self-hosted Langfuse behind an internal LLM gateway** — Stand up self-hosted Langfuse (Postgres + ClickHouse + Redis via Kubernetes/Helm) behind a small internal gateway service that multiple teams' applications call, with per-team API keys, redaction middleware for known-sensitive fields, and a runbook for scaling ClickHouse as trace volume grows. Demonstrates: self-hosting architecture, security/redaction, scalability planning — directly relevant to platform/infrastructure roles.

Each project: instrumented end to end (not just "traces exist" but cost/latency/score dashboards that answer a real question), a short README explaining the trace/span design decisions made (what became a trace vs a span vs a separate trace), and — for project 3 — an explicit note on what self-hosting bought the team versus staying on the managed cloud tier.
`,

  "case-studies": `
### The compliance-driven self-hosting decision

A recurring pattern among teams in regulated industries (health, finance) or under GDPR is choosing Langfuse specifically because self-hosting keeps prompts and completions inside their own network boundary — a requirement a closed, single-region SaaS competitor cannot satisfy without a costly custom enterprise agreement. Lesson: for regulated data, "can we self-host it" is sometimes the entire selection criterion, ahead of any feature comparison.

### The framework-neutrality decision

Teams building agentic systems with a custom or lightweight orchestration layer (not LangChain, not LlamaIndex) repeatedly report choosing Langfuse over a framework-coupled alternative specifically because the SDK's manual trace/span/generation API and the @observe decorator work identically regardless of what's orchestrating the calls. Lesson: observability tooling that assumes one framework becomes a migration cost the moment a team's architecture diverges from that framework — framework-agnostic instrumentation ages better.

### The "we didn't know our cost was this high" story pattern

A common trajectory reported anecdotally across small AI teams: shipping a feature without cost instrumentation, discovering weeks later via the provider's own billing dashboard that a specific feature or user cohort is disproportionately expensive, and only then retrofitting Langfuse's per-user/per-feature cost tracking to find the actual driver (often an unbounded retry loop or an unexpectedly verbose prompt). Lesson: instrument cost from day one rather than discovering it from a surprise invoice — the general software lesson "measure before you optimize" applies just as much to token spend as to CPU time.

### Prompt-versioning saving a rollback

A frequently cited scenario in Langfuse's own community writing: a prompt edit intended as a small tone improvement silently degraded factual accuracy; because the prompt was versioned and labeled rather than hardcoded, the team rolled the "production" label back to the previous version in the dashboard within minutes, and used the trace data captured during the bad window to build a regression test in their evaluation dataset so it couldn't happen again silently. Lesson: versioning turns a prompt regression from an emergency hotfix into a two-click rollback plus a permanent regression test.

Treat the specifics of these case studies as illustrative of well-documented adoption patterns rather than verified, named case studies — cross-check against Langfuse's own published customer stories before citing a specific company by name.
`,

  comparisons: `
| Dimension | Langfuse | LangSmith | Arize Phoenix | Helicone | Weights & Biases (Weave) |
|---|---|---|---|---|---|
| Open source | Yes (MIT, self-hostable) | No (closed, LangChain-owned) | Yes (open source core) | Yes (open source core) | Partially (Weave has OSS elements; core platform closed) |
| Framework coupling | Framework-agnostic; deep LangChain/LlamaIndex hooks available | Deepest with LangChain/LangGraph specifically | Framework-agnostic | Mostly proxy-based, framework-agnostic | Framework-agnostic, ML-experiment lineage |
| Self-hosting | First-class (Docker/Kubernetes/Helm) | Limited/enterprise-only historically | Yes | Yes | Limited |
| Prompt management | Versioned registry with labels | Yes, tightly tied to LangChain prompt objects | Lighter-weight | Minimal | Not the primary focus |
| Evaluation | Datasets + evaluators incl. LLM-as-judge | Datasets + evaluators, deeply integrated with LangChain eval tooling | Strong on embeddings/RAG-specific eval | Lighter-weight | Strong on experiment tracking/comparison |
| Primary strength | Openness, self-hosting, framework neutrality | Tightest LangChain/LangGraph integration | RAG/embedding-specific observability | Simplicity, proxy-based drop-in | ML-experiment lineage, broader than just LLMs |

**How seniors choose**: if the team is fully committed to LangChain/LangGraph and doesn't need self-hosting, LangSmith's tighter integration reduces friction. If the team needs data residency/compliance, wants to avoid vendor lock-in, uses multiple or no frameworks, or is cost-sensitive at high trace volume, Langfuse's open-source and self-hostable model wins. If the primary pain is RAG/embedding-quality diagnosis specifically, Arize Phoenix's specialization is worth a look. If the team already lives in Weights & Biases for ML experiment tracking, Weave keeps LLM traces in the same system as model training runs. Verify current feature parity for any specific capability before treating this table as exhaustive — both Langfuse and LangSmith ship new features frequently and the gap narrows and widens over time.
`,

  "related-technologies": `
- **LangSmith** — the direct commercial alternative, tightly integrated with LangChain; see the **LangSmith** skill for the full head-to-head.
- **OpenTelemetry** — the general distributed-tracing standard Langfuse's trace/span/generation model parallels, and which newer Langfuse versions can ingest directly; see the **OpenTelemetry** skill for the underlying trace/span/context-propagation concepts.
- **LangChain** — the orchestration framework Langfuse most commonly instruments via a one-line callback handler; see the **LangChain** skill.
- **LlamaIndex** — another commonly-instrumented orchestration/RAG framework with its own Langfuse integration; see the **LlamaIndex** skill.
- **DSPy** — a programmatic prompt-optimization framework that can also be traced through Langfuse for visibility into its compiled pipelines; see the **DSPy** skill.
- **ClickHouse** — the columnar analytical database behind Langfuse's self-hosted trace storage at scale; see the **ClickHouse** skill for why it's the right tool for this workload.
- **LLMOps** — the broader operational lifecycle (deployment, monitoring, evaluation, iteration) that Langfuse instruments a specific slice of; see the **LLMOps** skill for the full picture.
- **AI Evals / AI Harness** — general evaluation methodology (LLM-as-judge design, rubric scoring, human review workflows) that Langfuse's datasets/evaluators feature implements a specific, opinionated version of.
- **Prompt Versioning** — general prompt-versioning concepts; Langfuse's prompt registry is one concrete implementation of those ideas, distinct in specifics (labels, SDK fetch API) from the general skill.
- **Secrets Management** — how to handle the LANGFUSE_PUBLIC_KEY/SECRET_KEY pair safely, especially in a self-hosted deployment; see the **Secrets Management** skill.

On this platform, a natural learning path: **LLMOps** (the big picture) → **OpenTelemetry** (the general tracing mental model) → this page → **LangSmith** (the direct comparison) → **AI Evals** (deepen the evaluation side) → **ClickHouse** (understand the self-hosting internals).
`,

  "latest-updates": `
As of this writing (knowledge cutoff early 2026), Langfuse has been actively expanding from a pure tracing tool into a fuller LLMOps platform: prompt management, datasets/evaluation, session/user analytics, and improved multi-agent trace visualization have all matured over the 2024–2025 window, and OpenTelemetry-compatible ingestion has broadened how existing instrumentation (from other OTel-based tooling) can feed into Langfuse without a parallel instrumentation layer.

I hold three things with low confidence and you should verify them against the official changelog/docs before relying on them: the exact current self-hosted architecture version/requirements (Postgres/ClickHouse/Redis version pins change), the current Langfuse Cloud pricing tiers and what exactly is gated behind self-hosted vs cloud vs enterprise, and the precise current feature parity gap (if any) against LangSmith on any specific capability (e.g. specific agent-graph visualizations, specific evaluator types). Treat every specific version number, pricing figure, or "X ships in version Y" claim elsewhere on this page as directional unless you have independently verified it.

Given how fast this category moves, before making an architecture or vendor decision based on this page, check: the official Langfuse GitHub repository's recent releases, the official self-hosting docs, and the official pricing page.
`,

  "future-roadmap": `
The LLM observability category (Langfuse, LangSmith, and peers) is converging on a similar feature set: tracing, evaluation, prompt management, and cost tracking are becoming table stakes rather than differentiators. Where the category is likely heading, and what's worth betting career time on:

- **Deeper agent and multi-agent tracing**: as more production systems become multi-step agents rather than single LLM calls, visualizing and evaluating an agent's decision tree (not just a linear chain) is where tooling is investing. Understanding trace/span design for agentic systems (this page's Advanced Concepts section) is a durable skill regardless of which specific tool wins.
- **Tighter OpenTelemetry convergence**: the industry direction is toward LLM observability tools consuming and emitting standard OTel data rather than a fully proprietary format, which reduces lock-in and lets teams reuse existing tracing infrastructure. Investing in genuinely understanding OpenTelemetry (see that skill) pays off across whichever specific LLM observability vendor you end up using.
- **Evaluation becoming continuous rather than ad hoc**: the trend across the category is toward evaluation-as-CI-gate (dataset runs blocking a prompt/model promotion) rather than a manual one-off check — the general discipline covered in the **AI Evals** skill is the transferable skill here, more durable than any one vendor's specific evaluator UI.
- **Open-source vs commercial dynamics**: Langfuse's bet is that openness and self-hostability remain a durable differentiator for a meaningful slice of the market (regulated industries, cost-sensitive high-volume teams, framework-agnostic architectures) even as feature parity narrows with closed competitors. Whether that slice grows or shrinks relative to teams happy to default to a single framework's native tooling is a genuinely open question I can't predict with confidence at this cutoff.

The safest career bet is the transferable mental model — trace/span data modeling, evaluation discipline, cost-per-request accounting — over deep expertise in any single vendor's specific UI, since the underlying concepts (this page's Concepts and Internals sections) carry across Langfuse, LangSmith, and whatever comes next.
`,

  "cheat-sheet": `
~~~text
LANGFUSE ESSENTIALS

Setup
  export LANGFUSE_PUBLIC_KEY=pk-lf-...
  export LANGFUSE_SECRET_KEY=sk-lf-...
  export LANGFUSE_HOST=https://cloud.langfuse.com   # or self-hosted URL
  langfuse = Langfuse()                              # one instance per process

Core objects
  trace       = langfuse.trace(name=..., user_id=..., session_id=...)
  span        = trace.span(name=...)          ; span.end(output=...)
  generation  = trace.generation(name=..., model=..., input=...)
                generation.end(output=..., usage={"input":n,"output":n,"total":n})
  event       = trace.event(name=...)          # zero-duration marker
  score       = langfuse.score(trace_id=..., name=..., value=...)

Decorator (framework-free instrumentation)
  from langfuse.decorators import observe
  @observe()                    # infers trace/span tree from call stack
  @observe(as_type="generation")

Framework integration
  from langfuse.callback import CallbackHandler
  handler = CallbackHandler()
  llm.invoke(prompt, config={"callbacks": [handler]})   # LangChain

Prompt registry
  prompt = langfuse.get_prompt("name", label="production")
  compiled = prompt.compile(question=..., tone=...)
  generation = trace.generation(..., prompt=prompt)      # links generation to version

Datasets / evaluation
  dataset = langfuse.create_dataset(name=...)
  langfuse.create_dataset_item(dataset_name=..., input=..., expected_output=...)
  item.link(trace, run_name="prompt-v3")
  langfuse.score(trace_id=trace.id, name="exact_match", value=1.0)

Lifecycle
  langfuse.flush()              # call at process shutdown / short-lived scripts
                                 # NEVER synchronously per-request in a server

Self-hosted stack
  Postgres    -> projects, users, prompts, API keys (transactional)
  ClickHouse  -> trace/span/generation events (analytical, high volume)
  Redis       -> queues + cache
  S3-compat   -> large payload offload

OTel parallel
  Trace = Trace | Span = Span | Generation = LLM-flavored Span | Event = Span Event
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What is a Langfuse trace? | The root container for one end-to-end operation, e.g. one request or conversation turn, holding nested spans/generations/events |
| What distinguishes a generation from a plain span? | A generation is a span specialized for an LLM call — it captures model, token usage, cost, and can link to a prompt version |
| Why must you call flush() in a short-lived process? | The SDK buffers and sends events asynchronously; a process that exits before the background send fires will lose those events |
| What does the @observe decorator do? | Infers the trace/span tree automatically from the Python call stack, avoiding manual trace/span object threading |
| How does Langfuse compute cost for a generation? | Multiplies captured token usage by a per-model pricing table; auto-captured for supported provider SDKs, manual otherwise |
| What is the prompt registry for? | Versioning and labeling prompts (e.g. "production"/"staging") so generations can be linked to the exact prompt version used |
| What is a Langfuse score? | A numeric or boolean quality judgment attached to a trace — from human feedback or an automated/LLM-as-judge evaluator |
| Why split Postgres and ClickHouse in self-hosted deployments? | Postgres holds low-volume transactional data; ClickHouse is a columnar store built for high-volume, aggregation-heavy trace event data |
| How does Langfuse's model relate to OpenTelemetry? | Traces/spans map closely to OTel traces/spans; generation adds LLM-specific fields; newer versions can ingest OTel-formatted spans directly |
| What is a dataset used for? | A fixed set of test inputs (often expected outputs) run repeatedly against different prompt/model versions to measure quality changes |
| Main reason a team chooses Langfuse over LangSmith? | Need for self-hosting/data residency, framework neutrality, open-source licensing, or cost at scale |
| Main reason a team chooses LangSmith over Langfuse? | Deep existing commitment to LangChain/LangGraph and no self-hosting requirement |
| What should never be assumed about a Langfuse outage? | That it will take down your application — SDKs are designed to fail open, but verify this for your version with a test |
| Where should sensitive payload redaction happen? | At the instrumentation boundary, before calling trace()/generation() — Langfuse does not redact for you |
| What's the risk of always fetching the "latest" prompt version? | An unreviewed prompt edit can silently reach production traffic with no staging gate |
`,

  mcqs: `
1. What is the correct relationship between a trace, a span, and a generation in Langfuse?
   A) They are unrelated top-level objects
   B) A trace is the root; spans and generations nest inside it; a generation is a span specialized for LLM calls
   C) A generation is the root; traces nest inside it
   D) Spans and generations are the same thing with different names
   **Answer: B** — A trace is the root container for one operation; spans are nested timed units of work within it, and a generation is specifically a span that captures LLM-call fields like model, tokens, and cost.

2. Why might traces fail to appear in the dashboard from a short Python script?
   A) The dashboard has a display bug
   B) The script never imported Langfuse
   C) The script exited before the SDK's background flush sent the buffered events
   D) Traces always appear instantly with no buffering
   **Answer: C** — The SDK buffers and sends events asynchronously; a short-lived process must call flush() explicitly before exit or risk losing unsent events.

3. In a self-hosted deployment, which component holds the high-volume trace/span/generation event stream?
   A) Postgres
   B) Redis
   C) ClickHouse
   D) The web/API server's in-memory cache
   **Answer: C** — ClickHouse is the columnar analytical store designed for high-volume, aggregation-heavy event data; Postgres holds the lower-volume transactional metadata (projects, prompts, keys).

4. What is the main practical risk of relying solely on an LLM-as-judge evaluator score?
   A) It runs too slowly to be useful
   B) It cannot be attached to a trace as a score
   C) Judge bias (verbosity, position bias) or judge-prompt sensitivity can silently skew results without human spot-checks
   D) It only works with LangChain
   **Answer: C** — LLM-as-judge is powerful but inherits the judge model's own biases and blind spots; periodic human review is recommended alongside it.

5. What is the primary reason a team would choose Langfuse's self-hosted edition over Langfuse Cloud or LangSmith?
   A) Self-hosting is always faster
   B) Data residency/compliance requirements, avoiding vendor lock-in, or cost at very high trace volume
   C) Self-hosting is required to use the prompt registry at all
   D) LangSmith cannot be used with LangChain
   **Answer: B** — These are the concrete drivers covered in Production Usage and Comparisons; the prompt registry works on both cloud and self-hosted editions.

6. What should you check first when a generation's cost shows as zero in the dashboard?
   A) Whether the Langfuse server is down
   B) Whether token usage was populated for that generation, especially for custom/non-auto-instrumented models
   C) Whether the trace has a session_id
   D) Whether the prompt was fetched from the registry
   **Answer: B** — Cost is computed from captured token usage; if usage wasn't populated (common for custom models), cost silently shows as zero rather than raising an error.
`,

  "revision-notes": `
Langfuse is an open-source, framework-agnostic, self-hostable LLM engineering platform covering tracing, evaluation, prompt management, and cost tracking. Its core data model — trace containing nested spans, generations (LLM-specific spans with model/token/cost fields), and events, plus scores attached after the fact — deliberately parallels OpenTelemetry's trace/span model, and newer versions can ingest OTel-formatted data directly, which is why understanding one clarifies the other.

Instrumentation happens either through the LangChain/LlamaIndex callback handlers (one line, auto-captures internal framework calls) or through direct SDK usage: manual trace()/span()/generation() calls, or the @observe decorator, which infers the trace/span tree from the Python call stack. Events are buffered client-side and flushed asynchronously so instrumentation overhead stays off the request's critical path — the most common production mistake is forgetting to call flush() explicitly in short-lived processes, causing traces to silently vanish.

Beyond debugging, Langfuse's datasets/evaluators feature (including LLM-as-judge scoring) turns "did this prompt change help" into a repeatable measurement rather than a guess, and the prompt registry's versioning/labeling turns prompt changes into an auditable, rollback-able event instead of a code edit. Session and user grouping extend the tool from pure debugging into lightweight product analytics.

Architecturally, self-hosted Langfuse splits transactional metadata (Postgres: projects, prompts, API keys) from the high-volume analytical trace event stream (ClickHouse), with Redis for queuing/caching and S3-compatible storage for large payloads — this split is what lets it scale to high trace volume, and it's the trade-off teams accept operational burden for in exchange for data residency, vendor-lock-in avoidance, or cost control at scale.

Against LangSmith, the honest comparison is not "better" or "worse" but differently optimized: LangSmith integrates most tightly with LangChain/LangGraph specifically and is closed-source; Langfuse is framework-agnostic, open-source, and self-hostable, at the cost of a potentially less deeply-integrated experience for teams fully committed to one framework. Choose based on the actual constraint (compliance, lock-in, framework choice, cost) rather than a general preference, and verify current feature parity before treating any comparison as permanent — this category ships fast.
`,

  "learning-roadmap": `
### Week 1 — Foundations and manual instrumentation
Read Overview through Prerequisites. Set up a free Langfuse Cloud project (fastest path to a working dashboard). Complete Hands-on Lab 1: instrument a single LLM call manually with trace()/generation(), confirm token usage and cost appear correctly. Milestone: you can explain trace vs span vs generation vs event without looking it up.

### Week 2 — Nested pipelines, prompts, and frameworks
Work through Intermediate and Advanced Concepts. Complete Hands-on Lab 2: instrument a small RAG pipeline with nested spans and a versioned prompt fetched from the registry. If you use LangChain or LlamaIndex, also wire up the corresponding callback handler on a toy chain. Milestone: a multi-step pipeline produces a correctly nested trace tree in the dashboard, and swapping a prompt version doesn't require a code change.

### Week 3 — Evaluation discipline
Read the datasets/evaluation parts of Advanced Concepts plus the AI Evals skill in parallel. Complete Hands-on Lab 3: build a dataset from realistic failure cases, run it against two prompt versions, score with both exact-match and an LLM-as-judge evaluator, and write a recommendation. Milestone: you can defend a prompt-promotion decision with data, not just a vibe check.

### Week 4 — Production hardening and self-hosting
Read Production Usage, Security, Deployment, and the Production Checklist. Complete Hands-on Lab 4: stand up a self-hosted stack locally, migrate a service to it, add a flush-on-shutdown hook and one redaction rule. Milestone: you can articulate, with specifics, when self-hosting is worth its operational cost versus staying on managed cloud — and you've internalized the Postgres/ClickHouse split well enough to reason about scaling.

Next platform skill: once tracing and evaluation feel natural in Langfuse specifically, go deepen the general discipline in the **AI Evals** and **AI Harness** skills, then contrast this whole page directly against the **LangSmith** skill to solidify when each tool is the right call.
`,

  "official-docs": `
- **Langfuse documentation** (docs.langfuse.com) — the primary reference for SDK usage, self-hosting guides, and feature documentation; start here for anything version-specific, since this page's specifics should be verified against it.
- **Langfuse GitHub repository** — source code, issue tracker, and release notes; the most reliable place to verify a specific feature's current status or a recent breaking change.
- **Langfuse self-hosting guide** — Docker Compose and Kubernetes/Helm deployment instructions, including the current Postgres/ClickHouse/Redis architecture requirements.
- **Langfuse API reference** — the ingestion API and SDK method signatures for trace/span/generation/score objects.
- **Langfuse Python SDK reference** and **Langfuse JS/TS SDK reference** — language-specific method documentation, including the @observe decorator and framework integration helpers.

Verify exact URLs and current doc structure directly rather than relying on this list, since documentation sites reorganize.
`,

  books: `
No dedicated book exists specifically on Langfuse — it is a young, fast-moving product best learned from official docs and hands-on use rather than a book, which would be stale within months. For the surrounding concepts, these are worth reading:

1. **"Designing Data-Intensive Applications" by Martin Kleppmann** — not Langfuse-specific, but essential for understanding the transactional-vs-analytical storage split (Postgres vs ClickHouse) underlying self-hosted Langfuse's architecture.
2. **"Distributed Tracing in Practice" by Austin Parker et al.** — the best general treatment of the trace/span mental model that Langfuse's data model parallels; read this to deeply understand what a "trace" and "span" fundamentally are, independent of any one vendor.
3. **Any current, well-reviewed book on LLM application engineering / building LLM-powered products** — covers the broader lifecycle (prompting, evaluation, deployment) that Langfuse instruments a slice of; check publication date carefully, since this space moves fast and older titles go stale quickly.
4. **"Observability Engineering" by Charity Majors, Liz Fong-Jones, George Miranda** — general observability philosophy (why trace-based debugging beats log-grepping) that applies directly to why Langfuse's trace view is more useful than scattered application logs.

Given how fast Langfuse itself ships features, treat its own official docs and changelog as the primary "book" for anything product-specific.
`,

  blogs: `
- **The official Langfuse blog** (on their docs/marketing site) — product updates, feature deep-dives, and worked examples directly from the team building it; the highest-signal source for anything Langfuse-specific.
- **The Langfuse GitHub Discussions / issues** — not a blog in the traditional sense, but often the fastest place to see how the maintainers and community actually reason about edge cases (e.g. "how should I model sub-agent tracing").
- **General LLMOps and AI-engineering blogs** (e.g. writing from teams building production RAG/agent systems) — useful for the surrounding practices (evaluation design, prompt versioning discipline) that apply regardless of which specific tool implements them.
- **The LangChain blog** — useful context even though it's LangSmith's parent company's blog, since many posts on agent/chain design patterns are directly relevant to how you'd structure Langfuse instrumentation around the same patterns.

Be selective: this is a fast-moving, marketing-heavy space — prioritize posts with actual code and trace-off comparisons over pure opinion pieces, and verify any specific claim against official docs before repeating it.
`,

  "research-papers": `
There is no substantial body of academic research specifically about Langfuse as a product — it is commercial/open-source engineering tooling, not a research subject. The closest genuinely foundational reading is in the adjacent research areas its features draw on:

- **Foundational distributed tracing research**: Google's Dapper paper ("Dapper, a Large-Scale Distributed Systems Tracing Infrastructure") is the intellectual ancestor of the trace/span model that both OpenTelemetry and Langfuse use — worth reading to understand where the concept originated, decades before LLM-specific tooling existed.
- **LLM-as-judge evaluation research**: papers on using LLMs to evaluate other LLMs' outputs (search for work specifically addressing judge bias, position bias, and self-preference bias in LLM evaluators) are the closest real research grounding for Langfuse's LLM-as-judge evaluator feature — read these before trusting judge scores uncritically, and cross-reference with the **AI Evals** skill's treatment of the same literature.
- **General RAG and agent evaluation research**: papers on evaluating retrieval-augmented generation and multi-step agent systems inform what a good Langfuse dataset/evaluator setup should actually measure, even though they don't reference Langfuse itself.

If you need paper titles and authors for a citation, search current academic databases directly rather than trusting a title I might misremember — I will not invent a paper title or author list here.
`,

  videos: `
- **Official Langfuse product demo / walkthrough videos** (published by the Langfuse team, typically on YouTube or embedded in their docs) — the most reliable way to see the dashboard and SDK in action, since screenshots in written docs age faster than the product.
- **Conference talks on LLM observability/LLMOps** from AI-engineering-focused conferences — search for recent talks specifically covering "LLM observability" or "tracing LLM applications" rather than general AI talks, since the specific tooling landscape (Langfuse, LangSmith, and peers) changes year to year.
- **LangChain/LlamaIndex integration walkthroughs** — short tutorial videos showing the callback-handler integration in practice are useful for seeing the one-line setup work end to end.

Search current platforms directly for the most up-to-date walkthroughs rather than relying on a fixed list here — video content in this space goes stale within a year as the UI and feature set evolve.
`,

  "github-repos": `
- **langfuse/langfuse** — the main monorepo: web/API server, dashboard UI, and self-hosting deployment files. Start here to understand the actual architecture, not just the docs' description of it.
- **langfuse/langfuse-python** — the Python SDK source; read this directly when you want to understand exactly what get_prompt(), @observe, or generation.end() do internally rather than guessing from docs.
- **langfuse/langfuse-js** — the JS/TS SDK equivalent, for teams instrumenting Node/browser-adjacent LLM applications.
- **langchain-ai/langchain** — useful to read alongside Langfuse's callback handler integration, to see exactly which internal LangChain events get surfaced as spans.
- **run-llama/llama_index** — same reasoning for the LlamaIndex integration.
- **open-telemetry/opentelemetry-python** (or the relevant language SDK) — worth browsing to see the OTel trace/span implementation Langfuse's model parallels and, in newer versions, can ingest from directly.
- **ClickHouse/ClickHouse** — the database itself; worth a skim if you're self-hosting Langfuse at scale and need to understand what you're actually operating.
- **Example/cookbook repositories** (search "langfuse examples" or "langfuse cookbook" on GitHub) — worked end-to-end integration examples across different frameworks and use cases; verify these are current, since example repos rot faster than core SDKs.

Star/watch the main langfuse/langfuse repo if you're actively building on it — release notes there are the fastest way to track breaking changes.
`,

  "practice-problems": `
Ordered by the skill each focuses on:

1. **Trace/span modeling (design practice)**: given a description of a multi-agent customer-support system (router agent, two specialist sub-agents, a final summarizer), sketch on paper exactly which parts become traces, spans, and generations, and justify each nesting decision.
2. **Cost debugging (diagnostic practice)**: given a sample set of trace records where several generations show zero cost, identify which are custom/non-auto-instrumented model calls and write the fix that populates usage correctly.
3. **Evaluation design (methodology practice)**: given a prompt change for a summarization feature, design a dataset (what inputs, what expected outputs or rubric) and choose between exact-match, rubric scoring, and LLM-as-judge for this specific task, justifying the choice.
4. **Self-hosting capacity planning (architecture practice)**: given an expected trace volume (e.g. X requests/day, Y generations per request), reason through whether a single-node Docker Compose deployment or a multi-node ClickHouse setup is appropriate, and what metrics you'd monitor to know you need to scale.
5. **Security/redaction practice**: given a sample trace payload containing a customer's email and account number in the input field, write the redaction logic that should run before this payload ever reaches trace()/generation().
6. **External practice sets**: Langfuse's own official cookbook/examples repositories (see GitHub Repositories) double as practice material — work through them and then modify each example to instrument a slightly different pipeline shape than the one shown, to test real understanding rather than copy-paste familiarity.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Clients["Application layer"]
        App1["Service A\\n(LangChain callback handler)"]
        App2["Service B\\n(direct SDK / @observe)"]
    end
    subgraph Langfuse["Langfuse (self-hosted or cloud)"]
        API["Web / Ingestion API"]
        Redis[("Redis\\nqueue + cache")]
        PG[("Postgres\\nprojects, prompts, API keys")]
        CH[("ClickHouse\\ntraces, spans, generations")]
        S3[("S3-compatible storage\\nlarge payloads")]
        UI["Dashboard UI\\ntraces, cost, evaluation views"]
    end
    App1 -->|HTTPS + API key| API
    App2 -->|HTTPS + API key| API
    API --> Redis
    API --> PG
    API --> CH
    API --> S3
    UI --> PG
    UI --> CH
~~~

This reflects the reference production architecture discussed in Internal Working, Architecture, and Scalability: a stateless API tier fronting a transactional store (Postgres) for metadata and a columnar analytical store (ClickHouse) for the high-volume trace event stream, with Redis for queuing/caching and S3-compatible storage for large payload offload.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Langfuse))
    Foundations
      Open-source, self-hostable
      Framework-agnostic
      vs LangSmith positioning
    Core data model
      Trace
      Span
      Generation
      Event
      Score
    Instrumentation
      Manual SDK calls
      @observe decorator
      LangChain callback handler
      LlamaIndex integration
      OTel-compatible ingestion
    Prompt management
      Versioning
      Labels (production/staging)
      Link generation to prompt
    Evaluation
      Datasets
      Evaluators
      LLM-as-judge
      Scores over time
    Product analytics
      Session grouping
      User grouping
      Cost per user/feature
    Architecture
      Postgres (transactional)
      ClickHouse (analytical, high volume)
      Redis (queue/cache)
      S3-compatible blob storage
    Deployment
      Langfuse Cloud
      Self-hosted (Docker/Kubernetes)
    Operations
      Security and redaction
      Performance (async flush)
      Scalability (ClickHouse sizing)
    Ecosystem
      LangSmith comparison
      LLMOps lifecycle
      AI Evals / AI Harness
      OpenTelemetry parallel
      Secrets Management for keys
~~~
`,
};

export default langfuse;
