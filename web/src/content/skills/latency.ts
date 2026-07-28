import type { SkillContent } from "../types";

/**
 * Latency — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const latency: SkillContent = {
  overview: `
Latency is how long a user or a downstream system waits between asking an AI system for something and getting a usable response. It sounds like a single number, but for LLM and AI-agent systems it is really a small family of measurements — time-to-first-token, inter-token latency, end-to-end completion time, and tail percentiles of each — and treating them as one blended number is the single most common mistake in this whole discipline. An AI engineer who cannot decompose "this feels slow" into "which specific stage of the pipeline is slow, and for whom" cannot fix it; they can only guess.

What makes latency a distinct, first-class engineering skill for AI systems (rather than a subset of general backend performance work) is that LLM-based systems have unusual latency shapes. A single call to a model is not a fast, fixed-cost operation like a database read — it is a variable-duration generative process whose cost scales with both the size of what you feed in (the prompt) and the size of what comes out (the completion), compounded by whatever else the system does around that call: retrieving documents for RAG, invoking tools, calling other services, and orchestrating multi-step agent loops. Latency engineering for AI systems is the discipline of finding where time is actually being spent across this whole pipeline, and applying the right technique to the right stage — not just "make the model faster" in the abstract.

This page treats latency as a system-level concern that spans the entire request lifecycle: the network hop from client to server, time spent queued behind other requests, the model's own prefill and decode phases, any retrieval step in a RAG pipeline, any tool-call round trip an agent makes, and the final network hop back to the user. The companion **Inference** skill goes deep on the model-serving mechanics that make prefill and decode fast (KV caching, continuous batching, PagedAttention, speculative decoding) — read this page for the broader system picture of where latency lives and how to budget it, and Inference for how one particular stage of that pipeline is actually accelerated internally.

Key characteristics of latency as a workload property: it is rarely one bottleneck but a chain of them, each stage's latency adding to (or, if parallelized correctly, not adding to) the total; it has a perception dimension that is separate from its raw-time dimension (streaming can make an unchanged total time feel dramatically faster); and it must be measured and budgeted at the tail (p95, p99), because averages hide exactly the failures users remember and complain about.
`,

  history: `
Latency as a named, tracked engineering concern predates LLMs by decades — web performance engineering, database query optimization, and distributed-systems tail-latency work (Dean & Barroso's "The Tail at Scale," Google, 2013) all built the vocabulary and measurement discipline that AI latency engineering now borrows directly. What changed with LLMs is the shape of the workload: a single "request" can now take seconds, not milliseconds, and its duration is itself variable and generative rather than fixed and lookup-like.

| Year | Milestone |
|------|-----------|
| ~2013 | "The Tail at Scale" formalizes why p99 latency, not average latency, is what determines real user experience in large distributed systems — the direct intellectual ancestor of TTFT/p95/p99 thinking applied to LLMs today |
| 2018–2020 | Early GPT-family models are small enough that a full response often returns in a blink; latency is barely a distinct concern from "is the API up" |
| 2020–2022 | GPT-3-class models make a single completion call take multiple seconds; product teams first have to reason about "how long will this feel" as a design constraint, not just a nicety |
| Nov 2022 | ChatGPT ships with token-by-token streaming as a default UX pattern, popularizing the idea that perceived latency and total latency are different, manageable things |
| 2022–2023 | Continuous batching (Orca) and KV caching become standard serving techniques, directly targeting inter-token latency and throughput under concurrent load |
| 2023 | PagedAttention (vLLM) and speculative decoding papers push inter-token latency and TTFT further down at the serving-engine level; see the **Inference** skill for the mechanics |
| 2023–2024 | RAG and tool-calling architectures become mainstream, adding retrieval round trips and tool-call round trips as new, often-overlooked latency sources sitting in front of and around the model call itself |
| 2024 | Prompt/prefix caching ships as a user-facing API feature at major providers, directly cutting TTFT for requests that repeat a long shared prefix |
| 2024–2025 | Real-time and voice AI products (see **Realtime AI**) push latency budgets down into the low hundreds of milliseconds end-to-end, forcing much more aggressive parallelization and smaller-model routing than text-chat products ever needed |
| 2025–2026 | Multi-step agentic systems (chained tool calls, sub-agents) make "latency of the whole pipeline," not "latency of one model call," the dominant concern for a growing share of production AI systems |

The throughline: as AI systems moved from single model calls to multi-stage pipelines (retrieval, tools, agents), the hard part of latency engineering shifted from "make one call faster" to "find and remove the sequential dependencies between calls that don't actually need to be sequential."
`,

  "why-it-exists": `
Before LLM-based products existed at scale, most user-facing latency work was about shaving milliseconds off operations that were already fast — a database query, a page render, a cache lookup. The tools and mental models (caching, indexing, CDN edge placement) assumed sub-100-millisecond operations as the norm, with anything over a second treated as a clear bug.

LLM systems broke that assumption. A single useful model response can legitimately take one to tens of seconds depending on prompt size, output length, and model choice — and that is not a bug, it is the physical reality of autoregressive generation (see **Inference**). Latency engineering for AI systems exists because the old playbook of "just make it faster" does not fully apply: you cannot always make a large model generate a long response instantly, so a second discipline had to develop alongside raw speed optimization — managing user *perception* of time (streaming), managing *where* time is spent across a multi-stage pipeline (parallelizing independent stages), and managing *which* stages are even necessary for a given latency budget (routing simple requests to smaller/faster models, trimming context, caching repeated work).

The gap this discipline closes: teams that only ever measured "average response time" and only ever tried "make the model call faster" consistently missed the real levers — a slow p99 caused by one queueing bottleneck, a retrieval step that could have run in parallel with a tool call but was written sequentially by default, or a UX that could have felt instant with streaming even though the underlying generation time was unchanged. Latency engineering exists to give AI engineers a complete, systematic map of where time actually goes in an AI pipeline, so effort is spent on the stage that is actually the bottleneck for the metric that actually matters to users.
`,

  "problem-it-solves": `
Latency engineering removes concrete, measurable pains:

- **Users waiting in silence**: a blank screen for the full duration of generation feels broken even if the model is objectively fast in tokens-per-second terms — streaming and other perceived-latency techniques directly address this.
- **Tail failures hidden by averages**: a system with a great average latency can still have a p99 that regularly violates a real product SLA, frustrating a meaningful fraction of every day's users while dashboards showing only the mean look fine.
- **Wasted sequential time**: pipelines that run retrieval, then a tool call, then generation, one after another by default, when some of those steps have no actual data dependency on each other and could run concurrently.
- **One-size-fits-all model selection**: sending every request, no matter how simple, through the same large, slow model, when a smaller/faster model (or a cache hit) would satisfy a meaningful fraction of traffic within the latency budget.
- **Unbounded context bloat**: prompts that accumulate irrelevant history or retrieved documents over time, silently inflating prefill time and cost with no user-facing benefit.
- **Repeated work across requests**: re-running prefill, retrieval, or tool calls for content that was already computed moments earlier for a different (or the same) user.

What latency engineering deliberately does **not** solve:

- It does not make a model more accurate, more aligned, or less prone to hallucination — that is the territory of **Evaluation**, **Hallucination**, and **Fine-Tuning**.
- It does not decide GPU fleet sizing, autoscaling policy, or multi-region routing on its own — those decisions are made using latency data, but the infrastructure itself is the **Serving** and **Scaling AI** skills' territory.
- It cannot make the fundamental sequential dependency of autoregressive decoding disappear (see **Inference**) — it can only reduce, hide, or route around its cost.
- It does not replace correctness or safety review of a faster path — a smaller model or a cache hit used to cut latency must still meet the product's quality bar, which is a separate, ongoing evaluation concern.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Define time-to-first-token (TTFT) and inter-token latency precisely, and explain why they are dominated by different stages of the pipeline (queueing/prefill vs decode).
2. Explain why streaming improves perceived latency even when total generation time is completely unchanged, and articulate the UX and engineering mechanics behind that claim.
3. Enumerate every stage of a realistic AI pipeline that can add latency — network round trip, queueing, prefill, decode, retrieval, tool-call round trips, orchestration/agent-loop overhead — and estimate, for a given architecture, which stage is likely dominant.
4. Apply prompt/prefix caching, smaller-model routing, speculative decoding, parallelization of independent steps, and context/prompt trimming as targeted fixes, matched to the specific bottleneck they address.
5. Set and defend latency SLOs using p50/p95/p99, and explain why tail percentiles — not averages — are the correct basis for a user-facing latency commitment.
6. Reason explicitly about the latency/quality/cost triangle: articulate what you give up (and what you don't have to) when you optimize for speed.
7. Identify sequential steps in an existing pipeline design that have no real data dependency and could be parallelized, and rewrite the pipeline to do so safely.
8. Diagnose a "slow" AI system by isolating which specific stage (network, queue, retrieval, tool call, prefill, decode) is responsible, rather than guessing at the whole pipeline.
9. Explain why optimizing for average latency while ignoring tail latency is a common, costly mistake, and describe how to catch it before it reaches production.
10. Design monitoring and alerting for an AI pipeline's latency that separates each stage's contribution, not just a single end-to-end number.
`,

  prerequisites: `
- **Required**: a working understanding of what an LLM inference call is (tokens in, tokens out, a prompt and a completion) and basic familiarity with how a client-server request/response cycle works. The **Inference** skill is a direct prerequisite for the prefill/decode material referenced throughout this page — read it first if terms like "prefill," "decode," "KV cache," or "TTFT" feel unfamiliar in isolation.
- **Helpful**: some exposure to the **RAG** and **Tool Calling** skills makes the retrieval-latency and tool-call-round-trip material concrete rather than abstract, since this page assumes you can picture what those steps look like in a real pipeline.
- **Helpful**: basic familiarity with percentiles (p50/p95/p99) as a statistical concept; this page explains them from first principles for AI-latency purposes, but prior exposure from general backend/SRE work will make the SLO section click faster.
- **Not required yet**: you do not need to have built an autoscaling or multi-region serving fleet — that operational layer is the **Serving** and **Scaling AI** skills' territory, referenced here only where it interacts directly with latency budgets.

Dependency map: **Inference** (model-level mechanics) and **RAG** / **Tool Calling** (pipeline stages that add latency) → this page (**Latency**, the system-level view that ties them together) → **Serving** / **Scaling AI** (the infrastructure that executes the fixes at scale) → **Realtime AI** (the discipline that pushes every technique on this page to its most demanding, lowest-budget extreme) → **Cost Optimization** (the sibling discipline that shares many of the same levers — caching, smaller models, trimmed context — but optimizes for dollars rather than milliseconds, and must be reconciled against latency goals rather than treated independently).
`,

  "beginner-concepts": `
### What "latency" actually measures

Latency is the time between a request being made and a response being available. For a single web page load, this is often one number. For an LLM response, it is more useful to think of it as a small timeline with named checkpoints:

~~~text
t0: user sends request
t1: request arrives at the server (network latency: t1 - t0)
t2: request starts being processed after any queueing (queue time: t2 - t1)
t3: first output token is available (prefill time: t3 - t2)
t4: last output token is available (decode time: t4 - t3)
t5: full response reaches the user (network latency again: t5 - t4)
~~~

Two named metrics come directly out of this timeline:

- **Time-to-first-token (TTFT)**: roughly t3 - t0 — how long the user waits before anything appears at all.
- **Inter-token latency (ITL)**, sometimes reported as its inverse, tokens-per-second: the time between each subsequent token once generation has started, i.e. how t4 - t3 is spent, divided across however many tokens were produced.

These two numbers are governed by different parts of the pipeline and must be measured and reasoned about separately — a system can have an excellent TTFT and a mediocre tokens-per-second, or the reverse, and a single blended "average response time" metric hides which one is actually the problem.

~~~python
# Minimal instrumentation showing the difference between TTFT and total time
import time

def timed_stream(model_stream):
    start = time.perf_counter()
    first_token_at = None
    token_count = 0

    for token in model_stream:
        now = time.perf_counter()
        if first_token_at is None:
            first_token_at = now
            print(f"TTFT: {first_token_at - start:.3f}s")
        token_count += 1
        yield token

    total = time.perf_counter() - start
    decode_time = total - (first_token_at - start)
    if token_count > 1:
        print(f"Inter-token latency: {decode_time / (token_count - 1):.4f}s/token")
    print(f"Total time: {total:.3f}s for {token_count} tokens")
~~~

### Why streaming feels faster even when it isn't

Total generation time is the same whether or not you stream — the model still has to produce every token. What changes with streaming is when the user first sees *something*. A response that takes 4 seconds total but shows its first word at 300 milliseconds feels dramatically faster than the same 4-second response delivered all at once at the 4-second mark, because human perception of "waiting" is dominated by the time until the first sign of progress, not the total duration. This is the same psychological principle behind progress bars and "typing..." indicators in messaging apps — visible progress reduces perceived wait time even when it does not reduce actual wait time.

~~~text
Non-streaming: [------------- 4.0s of silence -------------][full response appears]
Streaming:     [0.3s][t][t][t][t][t][t][t][t][t]...[t]  <- tokens appear continuously
               ^ user sees the FIRST token here, not at the end
~~~

### Where time gets spent in a simple (non-agentic, non-RAG) request

Even the simplest possible LLM call has multiple latency-contributing stages: the network round trip to reach the server, any time the request spends queued behind other in-flight requests, the prefill pass over the prompt, and the decode loop generating the completion. Every one of these adds to the number a user experiences, and every one of them is affected by a different lever — network latency by client/server geography and connection setup, queueing by server capacity and load, prefill by prompt length, and decode by completion length and per-token serving efficiency (see **Inference** for the deep mechanics of the last two).
`,

  "intermediate-concepts": `
### The full pipeline: where latency actually accumulates

A real production AI system is rarely just "one model call." A typical RAG or agentic pipeline has several sequential-looking stages, and the working professional's job is to know which of them are genuinely sequential (one depends on the output of the previous) and which are only sequential because someone wrote the code that way.

~~~text
User request
  -> network hop to your server
  -> (optional) auth / rate-limit check
  -> (optional) retrieval step: embed query, search vector store, fetch documents
  -> (optional) tool call(s): hit an external API, database, or function
  -> prompt assembly: combine system prompt + retrieved context + tool results + history
  -> model call: prefill (process the assembled prompt) + decode (generate the answer)
  -> (optional) post-processing: parsing, guardrail checks, formatting
  -> network hop back to the user
~~~

Every stage in that list adds latency. The two mistakes that dominate real systems: treating every stage as if it must run in the order written (see Advanced Concepts and the worked example later on this page for how to parallelize the ones that don't), and only ever measuring the last stage (the model call) while ignoring the others, because it is the most visible and the one with the most existing tooling.

### Retrieval latency in RAG pipelines

A RAG (retrieval-augmented generation) pipeline adds a retrieval step in front of the model call: embedding the query, searching a vector store (or hybrid/keyword search), and fetching the matched documents. This step has its own latency profile, mostly independent of the model call's — a slow vector database, an unoptimized index, or a network hop to a remote retrieval service can easily dominate total latency for a RAG request, especially if the retrieved context is small relative to the final generation. See the **RAG** skill for retrieval-quality tradeoffs; this page's concern is purely that retrieval is a distinct latency-contributing stage that must be measured on its own, not folded into "model latency."

### Tool-call round trips

An agent that calls external tools (a search API, a database query, a code execution sandbox) incurs the latency of that external call on top of the model's own generation time — and often more than once per turn, since many agent loops call the model, get a tool-call request back, execute the tool, and call the model again with the result. Each of those model-call-then-tool-call-then-model-call cycles is a full round trip, and if the tool itself is slow (a third-party API with unpredictable latency, a slow database query) it can dwarf the model's own TTFT and decode time entirely. See the **Tool Calling** skill for the correctness and safety side of this; this page's concern is that every tool call is a latency-adding, often highly variable, hop that must be budgeted for explicitly.

### Prompt/prefix caching

When many requests share an identical prefix — a long system prompt, a set of few-shot examples, a large document repeated across a conversation's turns — the model doesn't need to re-run the prefill computation for that shared portion every single time. Prompt (or prefix) caching stores the computed key/value state for the shared prefix and reuses it, meaning only the new, non-shared portion of the prompt needs to go through prefill again. This directly cuts TTFT for any workload with a large, stable shared prefix, which is extremely common in production: a long system prompt in a chat product, a fixed set of instructions in an agent, or a large document being repeatedly referenced across turns of the same conversation.

~~~text
Without prefix caching:  [long system prompt + user turn] -> full prefill EVERY request
With prefix caching:     [long system prompt] -> prefill ONCE, cached
                          [+ user turn]         -> prefill only the NEW tokens each request
~~~

### Smaller/faster models for latency-sensitive paths

Not every request needs the largest, most capable model available. A common, high-leverage pattern is routing: use a small, fast model (or a cheaper, lower-latency tier of the same model family) for requests that are simple, well within that model's competence, or explicitly latency-critical (e.g., a quick classification, an autocomplete suggestion, an initial "acknowledging" response), and reserve the larger model for requests that genuinely need its capability. This is the same lever the **Cost Optimization** skill uses for a different reason (dollars instead of milliseconds) — in practice the two goals are usually aligned, since a smaller model is both cheaper and faster, but the decision of *which* requests are safe to route to a smaller model must be validated against quality requirements (see **Evaluation**), not assumed.

### Parallelizing independent pipeline stages

The single highest-leverage, most commonly missed latency fix in multi-stage AI systems: stages that do not actually depend on each other's output are, by default, often written to run one after another anyway, simply because that is the easiest way to write the code. If a pipeline needs to retrieve documents from a vector store AND call an external pricing API AND check a user's permissions, and none of those three depends on the others' results, running them concurrently instead of sequentially can cut that portion of total latency down to roughly the duration of the *slowest* of the three, instead of the *sum* of all three. This page's worked example later demonstrates exactly this pattern with timing instrumentation.

### Reducing prompt and context size

Every token in the prompt costs prefill time and, in most serving engines, contributes to memory pressure that can indirectly slow other concurrent requests. Trimming irrelevant conversation history, summarizing rather than replaying full prior turns, retrieving fewer but more relevant documents instead of a larger, noisier set, and avoiding accidental prompt bloat (unused instructions, redundant formatting boilerplate) all directly reduce TTFT, independent of any change to the model or infrastructure.
`,

  "advanced-concepts": `
### Speculative decoding as a system-level latency lever

Speculative decoding (covered mechanically in the **Inference** skill) is worth restating here from a pure latency-outcome perspective: it reduces inter-token latency by producing more than one accepted token per full-model forward pass, using a cheap draft model to propose candidates that the full model verifies in parallel. From a system-design standpoint, the decision to enable it is a latency/complexity tradeoff — it helps most on predictable-output workloads (code completion, structured extraction, templated responses) where the draft model's guesses are frequently right, and can be latency-neutral or slightly negative on unpredictable, creative generation where guesses are frequently wrong. The correct engineering process is to measure the draft model's acceptance rate on your actual traffic before committing to it as a standing latency optimization.

### Disaggregating prefill and decode for tail latency

Because prefill is compute-bound (parallel work over the whole prompt) and decode is typically memory-bandwidth-bound (sequential, one token at a time), some high-scale serving architectures run the two phases on separately sized and tuned hardware pools ("disaggregated serving"), specifically so that a burst of long-prompt requests doing heavy prefill work does not stall the decode throughput of unrelated in-flight requests sharing the same GPU. This is a **Serving**-layer architectural decision, but its motivation is squarely a latency one: without disaggregation, a single GPU's decode-phase inter-token latency for many concurrent short requests can degrade visibly whenever a large prefill job is admitted alongside them.

### The queueing-theory shape of tail latency

Tail latency (p95, p99) in a system serving concurrent requests is not simply "the slow requests" — it is a predictable consequence of queueing behavior under variable load. Even a system whose average request is fast can have a bad p99 if request arrival is bursty and a a handful of requests get stuck waiting behind a few unusually large ones (long prompts, long generations, slow tool calls). This is the same phenomenon "The Tail at Scale" describes for distributed systems generally: variance compounds across a chain of dependent services, and the more hops (retrieval, tool calls, sub-agent calls) a request's fulfillment depends on, the more opportunities exist for one slow hop to dominate the whole request's tail latency — even if that hop is fast on average.

~~~text
A pipeline with 4 sequential stages, each with a 99th-percentile latency spike
1-in-100 of the time, has roughly a 1-in-25 chance that AT LEAST ONE stage
spikes for any given request -- so the pipeline's overall p99 is materially
worse than any single stage's p99, purely from stage COUNT, before considering
any actual per-stage slowness. Fewer sequential stages -> better tail latency,
independent of how fast each individual stage is on its own.
~~~

This is precisely why reducing the number of genuinely sequential stages (via parallelization of independent work, or eliminating unnecessary round trips) is often a bigger tail-latency lever than making any single stage faster.

### Latency budgets and hedged/parallel requests

A mature latency strategy sets an explicit **budget** per stage (e.g., "retrieval gets 150ms, the model call gets 2s, everything else gets 200ms") rather than leaving each stage to take however long it takes. Budgets make tradeoffs explicit: if retrieval is over budget, a system can choose to proceed with fewer or lower-confidence documents rather than blocking indefinitely; if a tool call is over budget, a system can time it out and let the model proceed without that tool's result, clearly flagged as such. Some latency-critical systems go further and issue redundant, hedged requests to a resource with unpredictable latency (e.g., call two independent retrieval backends and take whichever responds first) — a classic tail-latency-reduction technique from distributed systems, applicable here whenever a single stage's variance is the dominant contributor to a pipeline's own p99.

### Caching at multiple layers, not just the prompt prefix

Beyond prompt/prefix caching at the model layer, latency-sensitive AI systems commonly cache at other layers of the pipeline: retrieval results for repeated or near-duplicate queries, tool-call results for idempotent or slowly-changing external data, and even full model responses for identical or template-matched requests. Each of these is a different cache with a different invalidation policy and hit-rate profile, and conflating them (treating "we have caching" as a single fact about the system) makes it hard to reason about which cache is actually responsible for a given latency win or miss.

### Decision table: which technique fixes which bottleneck

| Symptom | Likely bottleneck | Primary fix |
|---------|--------------------|--------------|
| High TTFT, normal token-by-token speed | Long prompt, cold prefix cache, or queueing | Prefix/prompt caching, prompt trimming, admission control |
| Normal TTFT, slow token-by-token speed | Decode-phase inefficiency | Quantization, speculative decoding, smaller model, better batching (see **Inference**) |
| Fast model call, slow overall response | A non-model stage (retrieval, tool call, orchestration) dominates | Parallelize independent stages, cache the slow stage, set a timeout/budget |
| Good average latency, bad p99 | Tail-latency variance from queueing, a slow dependency, or bursty load | Hedged requests, timeouts with fallback, more capacity, fewer sequential stages |
| Latency fine at low traffic, degrades under load | Undersized serving capacity or missing continuous batching | See **Serving** and **Scaling AI** for capacity/autoscaling fixes |
`,

  "internal-working": `
Tracing what actually happens, stage by stage, for a single request through a realistic RAG-plus-tool-calling pipeline makes clear where every millisecond goes and which stages are genuine candidates for parallelization.

~~~mermaid
flowchart TD
    A["Request arrives at server"] --> B["Auth / rate-limit check"]
    B --> C{"Needs retrieval or tool calls?"}
    C -- yes, independent --> D["Run retrieval AND tool calls\nCONCURRENTLY (no data dependency)"]
    C -- no --> E["Skip straight to prompt assembly"]
    D --> F["Assemble prompt: system + retrieved docs\n+ tool results + history"]
    E --> F
    F --> G["Model call: PREFILL over assembled prompt"]
    G --> H["First token emitted -- this is TTFT"]
    H --> I["DECODE loop: one token per step"]
    I --> J["Stream each token to client\n(perceived latency win)"]
    J --> K{"Model requests a tool call\nmid-generation?"}
    K -- yes --> L["Execute tool, feed result back,\nresume generation (adds a round trip)"]
    L --> I
    K -- no --> M{"Stop condition met?"}
    M -- no --> I
    M -- yes --> N["Post-process, return final response"]
~~~

Step-by-step detail:

1. **Network + auth**: the request reaches the server and passes any authentication/rate-limiting check. Usually fast (single-digit to low double-digit milliseconds) unless the auth service itself is slow or remote.
2. **Independent-stage fan-out**: if retrieval and any tool calls needed for this turn have no dependency on each other's output, they should be issued concurrently here, not one after another — this is the single biggest structural lever this page teaches, worked through in the coding example below.
3. **Prompt assembly**: combining the system prompt, retrieved context, tool results, and conversation history into the final prompt sent to the model. Usually fast in itself, but the SIZE of what gets assembled here directly determines prefill cost in the next stage.
4. **Prefill**: the model processes the entire assembled prompt in one parallel pass. This is where TTFT is earned or lost — a bloated prompt, a cold prefix cache, or a queued request all show up here.
5. **First token / TTFT measured**: everything before this point is what a user experiences as "how long until anything happens."
6. **Decode loop with streaming**: each subsequent token is generated and streamed to the client immediately, which is what makes the remaining wait feel like continuous progress rather than more silence.
7. **Mid-generation tool calls**: if the model's agent loop calls a tool partway through a turn, that tool's round-trip latency is inserted directly into the user's total wait time, and generation typically pauses until the tool result returns — this is exactly why tool latency must be measured and budgeted like any other pipeline stage, not treated as free.
8. **Stop and return**: once a stop condition is met, any post-processing (parsing, guardrail checks, formatting) runs, and the final network hop delivers the response.

The critical structural insight from this trace: stages 2 (retrieval/tool fan-out) and 7 (mid-generation tool calls) are where most avoidable latency hides in real systems — not in the model call itself, which is comparatively well-instrumented and well-optimized by serving engines already (see **Inference**).
`,

  architecture: `
Latency-conscious architecture means designing the pipeline's stage graph so that only genuinely dependent steps are sequential, and giving every stage an explicit, monitored time budget rather than letting each one take however long it happens to take.

### Stage-dependency architecture

~~~mermaid
flowchart LR
    subgraph Parallel["Stages with NO data dependency on each other"]
        R["Retrieval\n(vector search)"]
        T1["Tool call 1\n(e.g. pricing API)"]
        T2["Tool call 2\n(e.g. user profile lookup)"]
    end
    Parallel --> Assemble["Prompt assembly\n(waits for ALL of the above)"]
    Assemble --> Model["Model call\n(prefill + decode)"]
    Model --> Post["Post-processing"]
~~~

The architectural discipline: before writing a pipeline, draw this graph explicitly and mark every edge as either a real data dependency (B genuinely needs A's output) or an accidental one (B just happens to be written after A in the code). Only real dependencies should be sequential in the implementation.

### Latency-budgeted service layout

~~~text
latency-aware-pipeline/
├── gateway/              # auth, rate limiting, request budget assignment
├── fanout/               # issues retrieval + tool calls concurrently,
│                         #   enforces a per-stage timeout/budget
├── prompt-assembler/     # combines results once fanout completes (or times out)
├── model-client/         # calls the inference engine, handles streaming,
│                         #   measures TTFT and inter-token latency
├── tool-executor/        # handles mid-generation tool calls the model requests,
│                         #   with its own timeout and fallback behavior
└── observability/        # per-stage latency histograms, p50/p95/p99 dashboards
                          #   (see Monitoring section)
~~~

Each component owns a measurable slice of the total latency budget, and the observability layer must be able to answer "which stage was slow for THIS request" for any individual slow request, not just report an aggregate number. This is what makes a system debuggable under real, variable production traffic rather than only understandable in the abstract.
`,

  "data-flow": `
Tracing one request end to end, including where concurrent (fanned-out) work happens and where a mid-generation tool call inserts an extra round trip:

~~~mermaid
sequenceDiagram
    participant Client
    participant GW as Gateway
    participant Ret as Retrieval
    participant Tool as Tool API
    participant Model as Model (inference engine)

    Client->>GW: request (prompt + context needs)
    GW->>GW: auth check, assign latency budget
    par Retrieval and tool call run concurrently
        GW->>Ret: search query
        GW->>Tool: fetch external data
    end
    Ret-->>GW: retrieved documents
    Tool-->>GW: tool result
    GW->>GW: assemble final prompt
    GW->>Model: send prompt (prefill starts)
    Model-->>GW: first token (TTFT measured here)
    GW-->>Client: stream token 1

    loop until stop condition
        Model-->>GW: next token (inter-token latency measured here)
        GW-->>Client: stream token N
        alt model requests a tool call mid-generation
            GW->>Tool: execute requested tool call
            Tool-->>GW: tool result (added round-trip latency)
            GW->>Model: resume generation with tool result
        end
    end

    GW-->>Client: close stream, final response
~~~

The detail worth internalizing: the "par" block is the single highest-value structural decision in this whole diagram. Writing the same logic as two sequential calls (retrieval, then wait, then tool call, then wait) instead of a fan-out costs the pipeline the full sum of both stages' latency instead of just the slower of the two — for no correctness benefit, since neither stage depends on the other's result.
`,

  "production-usage": `
Real teams manage latency as an ongoing operational discipline, not a one-time optimization pass — traffic patterns, prompt sizes, and third-party tool latencies all drift over time, so latency budgets and dashboards need continuous attention.

### Key configuration and design levers

- **Per-stage timeouts and fallbacks**: every external dependency (retrieval backend, tool API, sub-agent call) gets an explicit timeout, with a defined fallback behavior (proceed without that stage's result, return a cached/degraded answer, or fail fast) rather than an unbounded wait.
- **Streaming enabled by default** for any interactive, user-facing surface — see the **Streaming** skill for the transport-layer mechanics (chunked responses, Server-Sent Events, WebSockets) that carry tokens to the client as they're produced.
- **Explicit latency budgets per stage**, tracked and alerted independently, so a regression in retrieval latency doesn't get silently absorbed into a "model felt slow today" bug report.
- **Model routing by request type**: simple, well-scoped requests routed to a smaller/faster model or a cached response; complex requests routed to a larger model, matching latency cost to actual necessity (see the **Cost Optimization** skill for the closely related dollar-cost version of this same routing decision).
- **Prompt size discipline**: conversation history summarization, retrieval result count limits, and removal of unused boilerplate instructions, enforced as part of prompt-assembly code review, not left to accumulate.
- **Prefix/prompt caching enabled** wherever a stable shared prefix exists (system prompts, few-shot examples, repeated large documents) — see **Inference** for the mechanics.

### Typical production defaults

- p95 and p99 targets set per product surface (a live chat UI has a tighter TTFT target than an overnight batch summarization job), not one blanket number across every feature.
- A "degraded but fast" fallback path exists for when a non-essential stage (a slow tool, a slow retrieval backend) is unavailable or over budget, rather than the whole request failing or hanging.
- Latency dashboards broken down per pipeline stage, not just a single end-to-end number, so an on-call engineer can immediately see which stage regressed.

The overarching production principle: latency is a property of the whole pipeline's dependency graph, not of the model alone — most real latency incidents in mature AI products trace back to a non-model stage (a slow retrieval index, a flaky third-party tool API, an accidentally-sequential fan-out) rather than the model call itself.
`,

  "industry-examples": `
- **OpenAI and Anthropic**: both expose streaming as a default API behavior and prompt/prefix caching as a documented, user-facing feature specifically to give developers direct levers over TTFT and perceived latency for their own products.
- **Perplexity**: a search-and-answer product whose core UX depends on overlapping retrieval latency with early generation and streaming results progressively, because pure sequential "search fully, then generate fully" would make its core product feel unacceptably slow.
- **GitHub Copilot and other code-completion tools**: latency-critical by design — completions are only useful if they appear within a small fraction of a second of typing, which forces aggressive use of small/fast models, speculative decoding, and tight context windows rather than large-model, large-context calls.
- **Voice AI and real-time assistant products** (see the **Realtime AI** skill for the deep dive): operate under latency budgets of a few hundred milliseconds end-to-end, requiring parallelized speech recognition, retrieval, and generation stages, since sequential execution of even a modest pipeline would blow the entire budget.
- **Together AI, Fireworks AI, Groq**: infrastructure providers that compete directly on TTFT and tokens-per-second as headline product metrics, publishing latency benchmarks as a primary differentiator between otherwise similar hosted-model offerings.
- **E-commerce and customer-support chat products** (broadly, across many companies): commonly route simple, high-confidence queries (order status, FAQ-style questions) to a smaller/cached path and reserve full-size model calls for genuinely open-ended questions, directly trading model capability for latency and cost on the bulk of easy traffic.

Pattern to notice: every latency-sensitive AI product treats "where does time go across our whole pipeline" as a first-class design question from the start, rather than something to optimize only after a model call is already integrated.
`,

  "best-practices": `
1. **Measure TTFT, inter-token latency, and per-stage latency separately** — never rely on a single blended "response time" number; each is driven by a different part of the pipeline and can regress independently.
2. **Set latency SLOs at p95/p99, not the average** — averages hide exactly the tail failures that damage user trust; define and monitor against percentiles from day one.
3. **Draw the pipeline's dependency graph explicitly before writing it** — mark every edge as a real data dependency or an incidental one, and parallelize anything in the latter category.
4. **Enable streaming for any interactive, user-facing surface** — perceived latency dominates user satisfaction for chat-like products even when total generation time is unchanged.
5. **Give every external dependency (retrieval, tool call, sub-agent) an explicit timeout and a defined fallback** — an unbounded wait on one slow dependency should never be allowed to define the whole pipeline's tail latency.
6. **Route by request complexity, not uniformly** — send simple, well-scoped requests to a smaller/faster model or a cache; reserve larger models for requests that actually need their capability, after validating quality (see **Evaluation**).
7. **Enable prompt/prefix caching wherever a stable shared prefix exists** — a long system prompt or repeated large document should not be re-processed from scratch on every request.
8. **Trim context deliberately, not accidentally** — summarize conversation history, cap retrieved document counts, and remove unused prompt boilerplate as an ongoing discipline, not a one-time cleanup.
9. **Instrument every pipeline stage individually**, not just the model call — retrieval, tool calls, and orchestration overhead each need their own latency histograms and alerts.
10. **Load-test with realistic, variable request shapes** — synthetic uniform-length benchmarks understate real-world tail latency caused by a mix of short and long requests, slow and fast tool dependencies.
11. **Reconcile latency goals with the Cost Optimization and quality bars explicitly** — a faster path (smaller model, less context, more aggressive caching) must be validated against both, not adopted purely because it's faster.
12. **Treat a latency regression with the same urgency as a correctness bug** — for many products, a slow response is functionally equivalent to a broken one from the user's perspective.
`,

  "anti-patterns": `
### Writing independent stages sequentially by default

~~~text
WRONG:  retrieve documents -> wait -> call pricing tool -> wait -> assemble prompt
        total latency = retrieval_time + tool_time  (fully additive)

RIGHT:  issue retrieval AND the tool call concurrently, wait for both to complete
        total latency = max(retrieval_time, tool_time)  (bounded by the slower one)
~~~

This is the single most common, highest-cost latency anti-pattern in real AI pipelines — it costs nothing structurally to avoid (the two calls genuinely don't depend on each other) but is easy to fall into because sequential code is the default way most people write a first version.

### Optimizing average latency while ignoring the tail

~~~text
WRONG: "our average response time is 800ms, we're fine"
       -- meanwhile p99 is 12 seconds because one slow tool-call dependency
          occasionally stalls a small but real fraction of requests

RIGHT: track and alert on p95/p99 explicitly; a good average with a bad tail
       is not a healthy system, it is a system with a hidden, intermittent failure mode
~~~

### Buffering the full response before sending anything

~~~text
WRONG: generate the entire response server-side, send one response at the end
       -> user sees nothing until total generation time has fully elapsed

RIGHT: stream tokens as they're produced -> user sees progress starting at TTFT
~~~

### Unbounded waits on external dependencies

Calling a third-party tool, retrieval backend, or sub-agent with no timeout means that service's worst-case latency (or an outage) becomes your pipeline's worst-case latency, with no fallback. A single flaky dependency without a timeout can single-handedly define your system's p99 or even cause outright hangs.

### Sending every request through the largest available model regardless of complexity

Routing simple, low-stakes requests (a yes/no classification, a short lookup-style question) through the same large, slow model as complex open-ended requests wastes both latency and cost budget that a smaller model or cached path could have satisfied within the same quality bar — see **Cost Optimization** for the parallel dollar-cost argument.

### Letting context grow unchecked across a long conversation

Replaying full, untrimmed conversation history into every subsequent turn's prompt silently inflates prefill time (and cost) turn after turn, with no corresponding benefit once older turns are no longer relevant to the current question — summarization and deliberate history trimming are latency techniques, not just cost ones.
`,

  performance: `
### Measure first

- **TTFT** (p50/p95/p99): measured at both the client and the server boundary, to isolate network/queueing time from prefill time.
- **Inter-token latency / tokens-per-second**: time between streamed tokens once generation has started; report per-request and aggregate.
- **Per-stage latency**: retrieval time, tool-call time (per tool), prompt-assembly time, and post-processing time, each as its own histogram — not folded into "total time."
- **Queue depth and admission wait time**: how long a request waits before its model call even begins, a leading indicator of undersized serving capacity (see **Serving**).
- **Fan-out efficiency**: for any concurrently-issued stages, confirm the measured wall-clock time is close to the SLOWEST stage's time, not the sum — if it's closer to the sum, the "concurrent" code likely isn't actually running concurrently.

### The optimization hierarchy (apply in order)

1. **Fix accidental sequential dependencies first** — parallelizing independent retrieval/tool-call stages is usually the highest-leverage, lowest-risk latency fix available, and it requires no model or infrastructure change at all.
2. **Enable streaming** for any interactive surface not already streaming — a near-free perceived-latency win.
3. **Enable prompt/prefix caching** wherever a stable shared prefix exists, cutting repeated prefill work.
4. **Trim prompt and context size** to the real need — every unnecessary token costs prefill time and, often, money.
5. **Route simple requests to smaller/faster models or cached responses**, reserving large-model calls for requests that need them, after validating quality.
6. **Add timeouts and fallbacks for slow external dependencies**, converting an unbounded tail risk into a bounded, predictable one.
7. **Consider speculative decoding** for workloads with predictable continuations (see **Inference**), after measuring draft-model acceptance rate on real traffic.
8. **Tune serving-engine-level levers** (batching, quantization, KV cache sizing — see **Inference** and **Serving**) once the pipeline-level and application-level levers above are already applied; serving-engine tuning has diminishing returns if the pipeline itself has unnecessary sequential stages sitting in front of it.

### Numbers worth knowing (hedge heavily — hardware, provider, and traffic dependent)

- Network round trips within the same region are typically low tens of milliseconds; cross-region or cross-continent hops can add low hundreds of milliseconds — geography matters more than most teams initially assume for TTFT.
- A well-tuned prefix cache can turn a multi-hundred-millisecond-or-more prefill for a long shared system prompt into a near-negligible one for the cached portion — the exact saving depends entirely on prompt length and how much of it is actually shared.
- Parallelizing two independent stages that each take roughly the same amount of time can cut that portion of the pipeline's latency by close to half; parallelizing three or more stages of similar duration compounds the saving further, bounded by the single slowest stage.
- Tail latency (p99) in a multi-stage pipeline is very commonly several times worse than any individual stage's own p99, purely as a function of how many sequential, independently-variable stages the request depends on — reducing stage count is often a bigger tail-latency lever than speeding up any one stage.

Always verify current, specific numbers against your own measured traffic and your provider's current documentation rather than treating any figure above as a guarantee for your system.
`,

  scalability: `
Latency and scalability are related but distinct: scalability is about serving more concurrent requests without every request's latency degrading; latency engineering is about making each individual request as fast (and as fast-feeling) as it can be. They interact constantly — undersized capacity shows up first as degraded latency, especially at the tail, before it shows up as outright failures.

### How latency degrades under load

~~~mermaid
flowchart LR
    Low["Low traffic:\nrequests processed immediately"] --> Med["Moderate traffic:\nsome queueing, p95 starts rising"]
    Med --> High["High traffic:\nqueue depth grows, p99 rises sharply,\nsome requests time out"]
~~~

As concurrent load rises, queueing delay (time before a request's model call even begins) becomes an increasingly large share of total latency, well before raw per-token generation speed changes at all. This is why "the model got slower" complaints under load are very often actually "the queue got longer" — a capacity and scheduling problem, not a per-request generation-speed problem. See the **Serving** and **Scaling AI** skills for how capacity, autoscaling, and request scheduling (continuous batching, admission control) are provisioned to keep queueing delay bounded as load grows.

### Horizontal scaling of non-model stages

Retrieval backends, tool APIs, and orchestration services each have their own independent scalability story — a vector database that's fast at low query volume can itself become a queueing bottleneck under load, entirely separate from whether the model-serving fleet is well-scaled. A latency-conscious architecture scales every stage's capacity to its own traffic pattern, rather than assuming that scaling the model-serving layer alone is sufficient.

### Bottleneck table

| Bottleneck | Symptom | Fix |
|------------|---------|-----|
| Model-serving queue depth grows under load | Rising TTFT and p99 with normal tokens-per-second once generation starts | More serving capacity, better admission control (see **Serving**, **Scaling AI**) |
| Retrieval backend saturates under load | Retrieval-stage latency spikes independent of model latency | Scale/shard the retrieval backend, add caching, reduce query volume via better routing |
| Third-party tool API rate-limited or slow under load | Tool-call stage latency spikes, sometimes with outright failures | Add timeouts/fallbacks, cache idempotent tool results, negotiate higher rate limits |
| Accidental sequential fan-out compounds under load | Total latency scales worse than expected as traffic grows | Parallelize independent stages (fixes the constant-factor cost at any load level) |
| One slow stage dominates tail latency across a multi-stage pipeline | p99 much worse than any individual stage's own p99 | Reduce stage count, add hedged/redundant requests for the variable stage |
`,

  security: `
Latency-specific security concerns sit alongside, and are distinct from, general LLM application security, covered more fully in the **Guardrails** skill.

1. **Timing side channels**: differences in response latency (e.g., a cache hit responding faster than a cache miss, or a request matching a cached prefix responding faster) can, in principle, leak information about what content is cached or how a request was routed — worth considering carefully in multi-tenant systems where users should not be able to infer anything about other users' cached content or queries from timing alone.
2. **Denial-of-service via unbounded generation or unbounded tool-call chains**: a request with no max-tokens cap, or an agent loop with no bound on how many tool calls or sub-agent turns it can chain together, can consume disproportionate time and resources — always enforce hard limits at multiple levels (max tokens, max tool-call depth, max total request duration), not just as client-side suggestions.
3. **Timeout and fallback behavior must fail safely, not silently**: a retrieval or tool-call timeout that silently proceeds with stale, empty, or attacker-influenced fallback data can produce a response that looks normal but is subtly wrong or manipulable — fallback behavior needs the same security review as the primary path.
4. **Latency-based routing decisions must not become a quality/safety bypass**: routing a request to a smaller, faster model purely to hit a latency target, without validating that the smaller model meets the same safety and quality bar for that request type, can silently degrade output safety in the name of speed — routing rules belong under the same evaluation rigor as any other model-selection decision (see **Evaluation**, **Guardrails**).
5. **Caching layers (prompt, retrieval, tool-result) are a data-isolation concern in multi-tenant systems**: any cache shared across users or tenants for latency reasons must guarantee no cross-tenant leakage of cached content — a caching optimization built without tenant isolation in mind is a real vulnerability, not just a performance detail.

For broader application-level concerns — prompt injection, unsafe tool invocation, jailbreaks — see the **Guardrails** skill; this page covers only the surfaces specific to how latency-optimizing mechanisms (caching, routing, timeouts) can themselves introduce risk.
`,

  testing: `
Testing latency-affecting changes means verifying both that the change actually improves the targeted metric AND that it hasn't silently broken correctness or introduced a new tail-latency risk elsewhere in the pipeline.

~~~python
# Conceptual test: verify a "parallelize independent stages" refactor actually
# runs concurrently, not just that it "still works."
import time

def test_fanout_runs_concurrently(retrieval_fn, tool_fn, run_fanout):
    # Both dependencies are mocked to take a known, fixed duration.
    retrieval_fn.delay = 0.5
    tool_fn.delay = 0.5

    start = time.perf_counter()
    run_fanout(retrieval_fn, tool_fn)
    elapsed = time.perf_counter() - start

    # If truly concurrent, elapsed should be close to max(0.5, 0.5) = ~0.5s,
    # not the sum (~1.0s). Allow generous slack for scheduling overhead.
    assert elapsed < 0.8, (
        f"fanout took {elapsed:.2f}s -- looks sequential, not concurrent"
    )

# Conceptual test: verify a smaller-model routing decision doesn't silently
# regress quality on the request types it now handles.
def test_routed_small_model_meets_quality_bar(small_model, large_model, eval_set, threshold):
    small_scores = evaluate(small_model, eval_set)
    large_scores = evaluate(large_model, eval_set)
    gap = large_scores.mean() - small_scores.mean()
    assert gap < threshold, (
        f"small model routing would regress quality by {gap:.3f}, exceeds tolerance"
    )
~~~

### Senior testing doctrine for latency-sensitive systems

- **Test the SLOWEST realistic path, not the happy path** — include slow-tool, cold-cache, and long-prompt scenarios in any latency test suite, since these are exactly the scenarios that define your tail latency in production.
- **Assert on concurrency, not just correctness**, for any "parallelize this" refactor — a bug that silently makes concurrent code run sequentially again is easy to miss if the only test is "does it return the right answer."
- **Load-test with realistic, variable-length and variable-latency request distributions** — uniform synthetic benchmarks systematically understate tail latency.
- **Test timeout and fallback behavior explicitly**, including what happens when a dependency times out, not just when it succeeds quickly.
- **Regression-test both quality and latency together** whenever a latency optimization (smaller model, trimmed context, aggressive caching) changes what's actually sent to or returned from the model — a latency win that regresses quality is not a net win.
`,

  debugging: `
### Escalation path for a "this feels slow" report

1. **Reproduce with a single request first**, with timing at every stage boundary (network in, queue, retrieval, tool calls, prefill, decode, network out) — isolate whether the issue is inherent to one request type or only appears under concurrent load.
2. **Check TTFT vs inter-token latency separately** — a slow TTFT with fine tokens-per-second points at prefill, queueing, or a slow pre-model stage (retrieval, tool calls); slow tokens-per-second with fine TTFT points at decode-phase serving issues (see **Inference**).
3. **Check whether "concurrent" stages are actually running concurrently** — measure wall-clock time for a fan-out and compare it against the sum vs the max of its component stages; if it's close to the sum, something in the implementation (a shared lock, an accidental await in sequence, a single-threaded executor) is serializing work that should be parallel.
4. **Inspect per-stage latency histograms, not just an aggregate number** — identify which specific stage's distribution shifted before assuming the model itself regressed.
5. **Check queue depth and admission wait time** — a persistently deep queue with a normal per-token generation speed points at undersized serving capacity or a scheduling misconfiguration (see **Serving**), not a per-request algorithmic issue.
6. **Check for a specific slow or flaky external dependency** — a third-party tool API or retrieval backend having a bad day can single-handedly explain a p99 spike even when every other component is healthy; check that dependency's own latency dashboard directly.
7. **Verify prompt size hasn't silently grown** — an accumulating conversation history, an expanding retrieved-document count, or added-but-never-removed system prompt boilerplate are common, easy-to-miss causes of a slow creeping TTFT regression over time.

### Useful signals to log per request

Per-stage timestamps (network in, queue start/end, retrieval start/end, each tool call's start/end, prefill/first-token time, decode completion time, network out), prompt token count, retrieved document count, which tools were called and their individual latencies, and which model/route handled the request. These make retrospective debugging of "why was THIS request slow" a lookup instead of a guess.
`,

  monitoring: `
### What to measure

- **TTFT** (p50/p95/p99) — the queueing plus prefill plus any pre-model-stage experience.
- **Inter-token latency / tokens-per-second** (p50/p95/p99) — the decode experience.
- **Per-stage latency** for every distinct pipeline component (retrieval, each tool, prompt assembly, post-processing) — each with its own p50/p95/p99, not folded into one number.
- **Queue depth and admission wait time** — a leading indicator of capacity issues before they show up as user-facing latency.
- **Fan-out efficiency** — measured wall-clock time for concurrently-issued stages versus the theoretical best case (the slowest single stage), as a direct signal of whether "concurrent" code is actually behaving concurrently in production.
- **Timeout and fallback trigger rate** — how often each external dependency's timeout fires, a leading indicator of a degrading dependency before it becomes a full outage.
- **Cache hit rate** for prompt/prefix caches, retrieval caches, and any full-response caches — directly explains variance in TTFT across otherwise-similar requests.

### Instrumentation sketch

~~~python
import time

class StageTimer:
    """Collects per-stage timing for one request, for structured logging/metrics."""
    def __init__(self, metrics_client, request_id):
        self.metrics_client = metrics_client
        self.request_id = request_id
        self.stage_starts = {}
        self.stage_durations = {}

    def start(self, stage_name):
        self.stage_starts[stage_name] = time.perf_counter()

    def end(self, stage_name):
        start = self.stage_starts.get(stage_name)
        if start is None:
            return
        duration = time.perf_counter() - start
        self.stage_durations[stage_name] = duration
        self.metrics_client.observe(
            "pipeline_stage_seconds", duration, tags={"stage": stage_name}
        )

    def log_summary(self, logger):
        logger.info(
            "request_stage_timings",
            request_id=self.request_id,
            stages=self.stage_durations,
        )
~~~

### What to alert on

Alert on TTFT and inter-token latency p95/p99 crossing product-defined thresholds (these are what users feel), on any individual stage's p95/p99 regressing independent of the total (this localizes the fault immediately), on queue depth and admission wait time trending upward (predicts an imminent user-facing regression before it fully arrives), and on timeout/fallback trigger rates for any external dependency rising above baseline (an early warning that a specific dependency is degrading). See the **Serving** skill for how these signals feed autoscaling and capacity decisions at the fleet level.
`,

  deployment: `
Deployment of a latency-conscious AI pipeline concerns configuring timeouts, budgets, and concurrency correctly at the application layer, on top of whatever the serving engine itself provides (see **Inference** and **Serving** for the model-serving-specific deployment configuration).

~~~text
# Conceptual pipeline deployment configuration (illustrative)
stage_timeouts_ms:
  retrieval: 300
  tool_call_default: 500
  model_call: 15000          # overall ceiling for a single turn's generation
  total_request: 20000       # hard ceiling across the entire pipeline

fanout:
  retrieval_and_tools_concurrent: true   # explicit flag, verified by a concurrency test

fallback_behavior:
  retrieval_timeout: "proceed with fewer/no documents, flag as degraded"
  tool_timeout: "proceed without that tool's result, flag as degraded"
  model_call_timeout: "return partial streamed content if any, else a clear error"

caching:
  prefix_cache_enabled: true
  retrieval_cache_ttl_seconds: 60
  full_response_cache_enabled: false   # only for exact-match, template-style requests

routing:
  small_model_for: ["classification", "short_lookup", "acknowledgement"]
  large_model_for: ["open_ended", "multi_step_reasoning"]
~~~

Why each choice matters:

- **Per-stage timeouts** convert an unbounded worst case into a bounded, predictable one — every external dependency must have one, deliberately chosen, not left at a framework default.
- **The explicit fanout flag** exists specifically so a concurrency regression (someone accidentally reintroducing sequential execution) is a visible configuration/test failure, not a silent latency regression discovered later in production.
- **Fallback behavior** must be defined per stage and must fail toward a clearly-flagged degraded response rather than either an indefinite hang or a silent, unflagged quality drop.
- **Caching configuration** should be explicit about TTLs and exact-match requirements, since a stale or incorrectly-matched cache entry is a correctness bug wearing a latency-optimization disguise.
- **Routing rules** should be reviewed alongside the **Evaluation** skill's quality gates whenever they change, since they trade capability for speed on a defined slice of traffic.

### Health and readiness at the pipeline layer

A readiness check for a latency-sensitive pipeline should verify that every stage it depends on (retrieval backend, each tool API, the model-serving endpoint) is actually reachable and within its expected latency range — not just that the pipeline's own process is up, since a single degraded dependency can silently make the whole pipeline's tail latency unacceptable while every individual process reports healthy.
`,

  "production-checklist": `
- [ ] TTFT and inter-token latency tracked and alerted as SEPARATE SLAs (p95/p99), not one blended number
- [ ] Every external dependency (retrieval, each tool, sub-agent call) has an explicit timeout and a defined fallback
- [ ] Independent pipeline stages (no real data dependency) are verified, via a concurrency test, to actually run concurrently
- [ ] Prompt/prefix caching enabled wherever a stable shared prefix exists
- [ ] Conversation history and retrieved-context size actively managed (summarized/capped), not left to grow unbounded
- [ ] Model routing rules (smaller vs larger model) reviewed against the current quality bar, not just latency targets
- [ ] Streaming enabled for all interactive, user-facing generation endpoints
- [ ] Per-stage latency histograms visible in monitoring, not just an aggregate end-to-end number
- [ ] Cache hit rates (prompt, retrieval, response) visible and monitored
- [ ] A hard ceiling exists on total request duration and on agent tool-call/loop depth
- [ ] Load-tested with realistic, variable-length and variable-latency request distributions, not uniform synthetic prompts
- [ ] Readiness checks verify actual reachability and latency health of every pipeline dependency, not just process liveness
- [ ] Timeout and fallback behavior fails safely (clearly flagged as degraded), not silently or insecurely
- [ ] A rollback or kill-switch plan exists for any latency optimization (routing change, aggressive caching) that regresses quality in production
`,

  "common-mistakes": `
1. **Treating "response time" as one number** — TTFT, inter-token latency, and per-stage latency are governed by different parts of the pipeline; conflating them hides real, independently-movable regressions.
2. **Writing independent stages sequentially by default** — the most common, highest-cost structural mistake in multi-stage AI pipelines; almost always fixable with no correctness risk once identified.
3. **Optimizing the average and never checking the tail** — a good mean latency with a bad p99 is a system with a real, recurring failure mode that a mean-only dashboard actively hides.
4. **Leaving external dependencies without timeouts** — an unbounded wait on one slow or failed dependency becomes the pipeline's effective worst-case latency, or an outright hang.
5. **Letting conversation history or retrieved context grow without bound** — a slow, creeping TTFT regression that's easy to miss because no single request looks obviously wrong.
6. **Assuming a "concurrent" refactor is actually concurrent** without measuring it — a shared lock, an accidental sequential await, or a single-threaded executor can silently serialize work that was intended to run in parallel.
7. **Routing to a smaller/faster model purely for latency without re-validating quality** — a latency win that quietly degrades output quality on a slice of traffic is not a net win.
8. **Not budgeting latency per stage** — without an explicit budget, there's no principled way to decide whether a slow retrieval step should block the whole request or proceed with a fallback.
9. **Buffering the full response instead of streaming** — a large, easily-avoidable hit to perceived latency for no correctness benefit.
10. **Benchmarking with uniform, synthetic request shapes** — understates real-world tail latency, which is driven by the mix of unusually long, unusually slow, or unusually complex requests that real traffic actually contains.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| High TTFT, normal tokens-per-second | Long/bloated prompt, cold prefix cache, or request queueing | Enable/verify prefix caching, trim prompt size, check queue depth and serving capacity |
| Normal TTFT, poor tokens-per-second | Decode-phase serving inefficiency | See the **Inference** skill: check batching, quantization, KV cache sizing |
| Fast model call, slow overall response | A non-model pipeline stage (retrieval, tool call, orchestration) dominates | Instrument per-stage latency; parallelize independent stages; cache or optimize the slow stage |
| "Concurrent" fan-out is as slow as sequential would be | Accidental serialization (shared lock, blocking call inside an async context, single-threaded executor) | Write and pass a concurrency test asserting wall-clock time is close to the slowest stage, not the sum |
| Good average latency, bad p95/p99 | Queueing variance, a flaky slow dependency, or bursty traffic | Add timeouts/fallbacks/hedged requests; investigate the specific slow dependency; add capacity |
| Latency degrades under load but not at low traffic | Undersized serving/retrieval/tool capacity, missing continuous batching or autoscaling | See the **Serving** and **Scaling AI** skills for capacity and scheduling fixes |
| Response feels slow despite a fast total generation time | Streaming not enabled, or client buffering the full response before rendering | Enable streaming server-side and confirm the client renders tokens incrementally |
| Latency creeps up slowly over the life of a long conversation | Unbounded growth of conversation history or accumulated retrieved context in the prompt | Summarize/trim history, cap retrieved document count, audit prompt-assembly logic |
| A single slow tool call blows out the whole request's latency | No timeout on that tool call, or the model waits synchronously with no fallback | Add an explicit timeout and a defined fallback (proceed without that tool's result, flagged) |
`,

  faqs: `
**Q: Is TTFT the same thing as "latency"?**
No — TTFT is one specific, important metric (time until the first token appears), dominated by everything that happens before generation starts: network, queueing, any retrieval/tool-call stages, and prefill. "Latency" as a general term should always be qualified with which specific measurement you mean (TTFT, inter-token latency, total time, a particular stage's time), because they are affected by different things and can move independently.

**Q: If streaming doesn't reduce total generation time, is it actually worth the engineering effort?**
Yes, for almost any interactive product. Perceived latency — how fast something *feels* — is a real, measurable driver of user satisfaction and task completion, independent of raw total duration. A 4-second response that starts streaming at 300 milliseconds is a meaningfully better product experience than the same 4-second response delivered all at once, even though the underlying compute cost is identical.

**Q: We measured our average response time and it looks great — are we done?**
No. Averages systematically hide tail latency, and tail latency (p95/p99) is what a meaningful fraction of your real users actually experience on a bad day. Set and monitor SLOs at the tail, not just the mean, and specifically investigate what's causing your worst 1-5% of requests, since that is usually where a fixable, concrete bottleneck (a slow dependency, a queueing issue, an accidentally-sequential stage) is hiding.

**Q: Should I always parallelize every pipeline stage I can?**
Only stages with no real data dependency on each other's output. Parallelizing stages that DO depend on each other's results is either impossible (you'd be guessing at data you don't have yet) or introduces correctness bugs. The discipline is to explicitly identify which dependencies are real before parallelizing anything.

**Q: Does routing simple requests to a smaller model always help latency without hurting quality?**
It helps latency (and usually cost) whenever the smaller model is genuinely capable enough for the request types it's routed to — but that "genuinely capable enough" claim must be validated with real evaluation on your specific task and traffic, not assumed. See the **Evaluation** skill for how to validate a routing decision like this before shipping it.

**Q: What's the difference between this page and the Inference skill?**
This page covers the system-level view of where latency lives across an entire AI pipeline — network, queueing, retrieval, tool calls, orchestration, and the model call as one stage among several — and the pipeline-level techniques (parallelization, budgets, routing, caching) that manage it. The **Inference** skill goes deep on the mechanics that make the model call itself fast (KV caching, continuous batching, PagedAttention, speculative decoding, quantization) — read this page for the whole-pipeline picture and Inference for how one stage of it is engineered internally.

**Q: What's the difference between latency engineering and the Cost Optimization skill?**
They share several of the same levers (smaller models, caching, trimmed context) but optimize for different things — latency for time, cost for dollars — and those goals are usually aligned but not always identical (e.g., a larger batch size can improve cost-efficiency while adding queueing latency for individual requests). Treat them as related but distinct goals that need to be reconciled explicitly, not assumed to always move together.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is time-to-first-token (TTFT) and what does it measure?* The time from when a request is sent to when the first output token becomes available to the user; it's dominated by network, queueing, and prefill — everything that happens before generation visibly starts.
2. *Why does streaming improve perceived latency even if total generation time doesn't change?* Because users experience "waiting" primarily as the time until they see any progress, not the total elapsed time; streaming shows the first token far earlier than a buffered response would, even though both take the same total time to fully complete.
3. *Name three sources of latency in a RAG pipeline beyond the model call itself.* Retrieval (embedding the query, searching the vector store, fetching documents), network round trips to and from the client, and prompt assembly/post-processing overhead.
4. *Why should p95/p99 be tracked instead of just the average?* Averages hide tail behavior; a system can have a great average and a terrible p99 if a subset of requests hit a slow dependency, a queueing spike, or an unusually large prompt — and that tail is what a meaningful share of real users actually experience.
5. *What's the fastest, lowest-risk fix for a pipeline where retrieval and a tool call are currently run one after another but don't depend on each other?* Run them concurrently (parallelize the fan-out) instead of sequentially — total latency for that portion drops from the sum of both stages to roughly the slower of the two, with no change in correctness.

**Senior:**

6. *Explain why a multi-stage pipeline's p99 is often much worse than any individual stage's own p99.* Each additional sequential, independently-variable stage adds another chance for a tail-latency spike to occur somewhere in the chain; with enough stages, the probability that AT LEAST ONE of them spikes for a given request becomes much higher than any single stage's own spike probability — reducing stage count (via parallelization or elimination) is often a bigger tail-latency lever than speeding up any one stage.
7. *Design a latency budget for a customer-support agent that does retrieval, may call one or two tools, and then generates a response — what would you specify and why?* Explicit per-stage timeouts (e.g., retrieval 200-300ms, each tool call 300-500ms with concurrent execution where independent, model generation budgeted separately with streaming), defined fallback behavior for each stage's timeout, and separate p95/p99 SLOs for TTFT and total response time, reviewed against real traffic shape rather than synthetic assumptions.
8. *A team reports "the model got slower" under load, but per-token generation speed in their metrics looks unchanged — what's your first hypothesis and how would you verify it?* Queueing delay before the model call even starts is the likely culprit, not per-token generation speed; verify by checking queue depth / admission wait time metrics directly, separate from TTFT and tokens-per-second, since a growing queue inflates TTFT while inter-token latency for requests that ARE running stays normal.
9. *When is speculative decoding NOT a good latency lever, and how would you know before enabling it in production?* When the draft model's proposals are frequently wrong for the actual workload (highly creative, unpredictable generation) — the overhead of proposing and discarding draft tokens can erode or eliminate the expected speedup; measure the draft model's acceptance rate on real, representative traffic before committing to it.
10. *How do you decide whether a "faster" smaller-model routing decision is safe to ship?* Validate it against a task-specific evaluation set comparing the smaller and larger model's quality on the exact request types being routed, set an explicit acceptable-degradation threshold with product stakeholders, and monitor post-launch for quality regressions on that traffic slice — not by inference speed benchmarks alone.
11. *Explain the latency/quality/cost triangle and give a concrete example of a decision that trades one for another.* Improving one of latency, quality, or cost typically costs you some of another — for example, routing to a smaller model improves latency and cost but risks quality on requests the smaller model can't handle as well; using a larger, slower model with more retrieved context improves quality at the cost of latency and dollars; the senior skill is making this tradeoff explicit and measured rather than accidental.
12. *A pipeline has three independent stages you could parallelize, but one of them occasionally has very high variance (sometimes 50ms, sometimes 3 seconds). How would you approach this?* Give it its own timeout and fallback so its variance can't unboundedly inflate the pipeline's tail latency; investigate the root cause of its variance directly (its own queueing, GC pauses, an upstream dependency); consider a hedged/redundant request pattern if an alternative, lower-variance path exists for that specific stage.
`,

  "coding-questions": `
### 1. Detect an accidentally-sequential fan-out from timing data

~~~python
# Given measured start/end timestamps for a set of stages within one request,
# determine whether they were run concurrently or sequentially.
def classify_execution(stage_intervals: dict[str, tuple[float, float]]) -> str:
    """stage_intervals: {stage_name: (start_time, end_time)}.
    Returns 'concurrent' if stages meaningfully overlap in time, else 'sequential'."""
    intervals = sorted(stage_intervals.values())
    overlap_found = False
    for i in range(1, len(intervals)):
        prev_start, prev_end = intervals[i - 1]
        curr_start, curr_end = intervals[i]
        if curr_start < prev_end:   # this stage started before the previous one finished
            overlap_found = True
    return "concurrent" if overlap_found else "sequential"

# Example: retrieval runs 0.0-0.5s, tool call runs 0.05-0.55s -- clearly overlapping
stages = {"retrieval": (0.0, 0.5), "tool_call": (0.05, 0.55)}
print(classify_execution(stages))   # "concurrent"

# Example: retrieval runs 0.0-0.5s, tool call runs 0.5-1.0s -- no overlap at all
stages_seq = {"retrieval": (0.0, 0.5), "tool_call": (0.5, 1.0)}
print(classify_execution(stages_seq))   # "sequential"
~~~

Complexity: O(n log n) for the sort, O(n) for the scan. Follow-up: extend this to flag a *specific* pipeline run as a regression by comparing its overlap ratio against a historical baseline, so a code change that silently reintroduces sequential execution is caught automatically in CI or canary monitoring.

### 2. Estimate pipeline latency under sequential vs. parallel execution

~~~python
def sequential_total(stage_durations: list[float]) -> float:
    """If stages must run one after another, total time is the sum."""
    return sum(stage_durations)

def parallel_total(stage_durations: list[float]) -> float:
    """If stages have no dependency on each other, total time is bounded
    by the slowest one (assuming enough concurrency capacity to run them
    all at once)."""
    return max(stage_durations)

durations = [0.25, 0.40, 0.10]   # retrieval, tool call, permission check
print(sequential_total(durations))   # 0.75s
print(parallel_total(durations))     # 0.40s
# Parallelizing these three independent stages saves ~0.35s (~47%) off this
# portion of the pipeline, for zero change in correctness.
~~~

Complexity: O(n). Follow-up: extend this to a mixed dependency graph (some stages depend on others, some don't) and compute the true critical path — the longest chain of REAL dependencies — which is the actual latency floor no amount of parallelization can beat.

### 3. Compute p50/p95/p99 from a list of latency samples and simulate a tail-latency scenario

~~~python
import random

def percentile(samples: list[float], p: float) -> float:
    """Simple percentile calculation (linear interpolation not required for
    this illustrative version)."""
    if not samples:
        raise ValueError("no samples")
    ordered = sorted(samples)
    index = int(round((p / 100) * (len(ordered) - 1)))
    return ordered[index]

def simulate_pipeline_latencies(n_requests: int, stage_count: int, spike_prob: float) -> list[float]:
    """Each of stage_count stages normally takes ~50ms, but independently has
    a spike_prob chance of taking 2s instead, per request. Total latency for
    a request is the SUM across its stages (sequential pipeline)."""
    totals = []
    for _ in range(n_requests):
        total = 0.0
        for _ in range(stage_count):
            total += 2.0 if random.random() < spike_prob else 0.05
        totals.append(total)
    return totals

random.seed(0)
latencies = simulate_pipeline_latencies(n_requests=10000, stage_count=4, spike_prob=0.01)
print("p50:", percentile(latencies, 50))
print("p95:", percentile(latencies, 95))
print("p99:", percentile(latencies, 99))
# Even with only a 1% per-stage spike chance, a 4-stage sequential pipeline's
# p99 is noticeably worse than any single stage's own p99, because the
# request-level spike probability compounds across stages.
~~~

Complexity: O(n log n) per percentile call (due to sort; can be optimized with a running data structure at scale). Follow-up: rerun with stage_count=1 versus stage_count=8 holding spike_prob constant, and observe how dramatically p99 (not p50) degrades as stage count grows — this is the concrete, numeric version of the tail-latency compounding argument from Advanced Concepts.
`,

  "hands-on-labs": `
### Lab 1 — Measure TTFT and inter-token latency on a real streaming call (beginner, ~1h)
Using any LLM API that supports streaming, write a small script that records the timestamp of the first token and every subsequent token for several requests with varying prompt lengths. Plot TTFT against prompt length. Deliverable: a short chart plus a one-paragraph explanation of what you observed about the TTFT/prompt-length relationship. Skills: TTFT measurement, basic instrumentation discipline.

### Lab 2 — Find and fix an accidentally-sequential fan-out (intermediate, ~2h)
Take (or build) a small pipeline with two independent steps — e.g., a mock "retrieval" function and a mock "tool call" function, each with an artificial delay — written sequentially. Measure total latency, then rewrite the fan-out to run both concurrently (using async/await or threads, depending on your language), and measure again. Deliverable: before/after timing numbers and the code diff. Skills: identifying real vs incidental dependencies, concurrent programming basics, timing verification (see Coding Question 1 for the detection logic).

### Lab 3 — Build a tail-latency simulator (advanced, ~3h)
Extend Coding Question 3's simulation into a small tool that lets you vary stage count, per-stage spike probability, and spike magnitude, and plots p50/p95/p99 as stage count increases. Deliverable: a chart showing how tail latency compounds with pipeline depth, and a short write-up of what this implies for a real multi-stage agent pipeline design. Skills: percentile reasoning, the queueing-theory intuition behind tail-latency compounding.

### Lab 4 — End-to-end latency budget for a real RAG-plus-tool pipeline (production, ~4h)
Stand up (or use an existing) small RAG pipeline with at least one retrieval step and one tool call, add per-stage instrumentation (see the Monitoring section's StageTimer sketch), and set explicit timeouts and fallback behavior for each external dependency. Load-test with a realistic, variable-length request generator and report p50/p95/p99 for TTFT, inter-token latency, and each pipeline stage individually. Identify and fix the largest remaining latency bottleneck. Deliverable: a short report including your latency budget document, the dashboards/histograms you built, and what you changed as a result. Skills: the entire page, applied end to end.
`,

  "real-projects": `
Portfolio-grade projects demonstrating latency-engineering fluency:

1. **Pipeline latency profiler and visualizer** — A tool that instruments an arbitrary multi-stage AI pipeline (retrieval, tool calls, model call) with per-stage timers, then renders a waterfall-style chart showing exactly where time went for any individual request, plus aggregate p50/p95/p99 per stage across many requests. Demonstrates: precise instrumentation discipline and the ability to communicate latency data clearly, which is exactly the skill needed to debug a real production latency incident.

2. **Sequential-to-parallel pipeline refactor with before/after benchmarks** — Take a realistic multi-stage pipeline (retrieval + two independent tool calls + model generation) implemented naively (sequentially), identify the real vs incidental dependencies, refactor to parallelize the independent stages, and publish rigorous before/after latency benchmarks including tail percentiles under simulated variable load. Demonstrates: the single highest-leverage latency skill on this page, backed by real measured numbers rather than a claim.

3. **Latency-aware model router** — A small routing layer that sends simple/well-scoped requests to a smaller, faster model and complex requests to a larger one, instrumented to report both the latency savings AND a quality comparison (via a task-specific eval set) between the routed and non-routed paths. Demonstrates: the senior-level judgment of treating a latency optimization as something that must be validated against quality, not assumed safe.

Each project: clear methodology write-up, reproducible measurement scripts, and honest before/after numbers — the discipline of measuring rather than assuming is what distinguishes strong latency-engineering portfolio work, exactly as it does for the closely related **Inference** and **Cost Optimization** skills.
`,

  "case-studies": `
### ChatGPT's streaming UX as a deliberate perceived-latency decision
When ChatGPT launched, its token-by-token streaming interface was as much a UX decision as a technical one — total generation time for a long response was not dramatically different from what a non-streaming interface would have taken, but showing tokens as they were produced made the product feel responsive in a way that shaped user expectations for the entire category of chat products that followed. Lesson: perceived latency is a first-class product design lever, not just an engineering afterthought, and it can matter as much as raw speed for user satisfaction.

### Prompt caching as a provider-level latency and cost feature
Major LLM providers exposing prompt/prefix caching directly to API users turned an internal serving optimization (reusing KV cache state for a shared prefix) into a headline, user-facing product feature, because so many real production workloads (long system prompts, repeated document context) have a large, stable shared prefix. Lesson: a latency optimization discovered at the serving-engine layer can become a durable competitive and pricing feature once it's exposed thoughtfully to developers who understand their own traffic's prefix-sharing patterns.

### Voice/real-time AI products pushing sequential pipelines toward parallel-by-necessity design
Real-time voice assistants operate under latency budgets tight enough (a few hundred milliseconds end-to-end) that a naively sequential pipeline — transcribe, then retrieve, then generate, then synthesize speech — simply cannot fit the budget; production systems in this space are forced to overlap stages aggressively (starting generation on partial transcription, streaming synthesis before generation fully completes) as a hard requirement rather than a nice-to-have optimization. Lesson: extremely tight latency budgets are a forcing function that reveals which pipeline dependencies were ever truly sequential in the first place — see the **Realtime AI** skill for the deep dive.

### Tail-latency incidents traced to a single unbounded third-party dependency
A recurring pattern across many production AI systems: a p99 latency incident that looks mysterious in aggregate dashboards turns out, on a per-request investigation, to be caused by a single external tool or retrieval dependency occasionally taking many seconds with no timeout in place, silently defining the whole pipeline's worst case for a small but real fraction of requests. Lesson: an unbounded wait on any single external dependency is a latent tail-latency incident waiting to happen, and it is one of the cheapest, most valuable fixes (a timeout plus a fallback) available in latency engineering.
`,

  comparisons: `
| Approach | Effect on TTFT | Effect on inter-token latency | Effect on tail latency (p99) | Implementation cost | Quality risk |
|----------|------------------|-------------------------------|-------------------------------|------------------------|-----------------|
| Streaming responses | None (doesn't reduce TTFT itself) | None on raw speed | None on raw numbers, but dramatically improves PERCEIVED experience | Low | None |
| Prompt/prefix caching | Large reduction for shared-prefix requests | None directly | Reduces variance from cold-cache prefill spikes | Low-moderate | None (if cache correctness verified) |
| Parallelizing independent stages | Large reduction if pre-model stages were sequential | None (model call unaffected) | Large reduction, especially as stage count grows | Low-moderate (mostly a code-structure change) | None (if dependencies correctly identified) |
| Routing to a smaller/faster model | Reduces prefill and decode time for routed requests | Reduces decode time for routed requests | Reduces tail risk for routed traffic | Moderate (needs evaluation validation) | Real, must be measured per task |
| Speculative decoding | None directly | Reduces decode time on predictable workloads | Workload-dependent | Moderate-high (see **Inference**) | None if implemented correctly (preserves output distribution) |
| Context/prompt trimming | Reduces prefill time | None directly | Reduces variance from occasionally-huge prompts | Low (ongoing discipline) | Some risk if trimming removes needed information |
| Timeouts + fallback for external dependencies | No change to happy-path TTFT | No change | Large reduction — bounds the worst case | Low | Low, if fallback behavior is clearly flagged |
| More serving/retrieval/tool capacity (scaling) | Reduces queueing-driven TTFT under load | Indirect (less contention) | Large reduction under load | Higher (infra cost, see **Scaling AI**) | None |

**How seniors choose**: streaming and per-stage timeouts/fallbacks are close to unconditional wins — ship them almost everywhere with interactive surfaces or external dependencies. Parallelizing independent stages is the highest-leverage structural fix and should be checked on every new multi-stage pipeline design, not treated as a later optimization pass. Prefix caching is adopted wherever a stable shared prefix genuinely exists. Model routing and aggressive context trimming are adopted only after validating quality impact — they are real tradeoffs, not free lunches, unlike the first three.
`,

  "related-technologies": `
- **Inference** — the model-serving mechanics sibling: KV caching, continuous batching, PagedAttention, speculative decoding, quantization. This page's "model call" stage is exactly what Inference goes deep on internally.
- **Serving** — the infrastructure sibling: fleet provisioning, autoscaling, request scheduling, multi-node deployment. Latency SLOs defined on this page are what Serving's capacity and scheduling decisions are provisioned to meet.
- **Streaming** — the transport-layer mechanics (chunked HTTP responses, Server-Sent Events, WebSockets) that actually carry incrementally-generated tokens to a client; the wire-protocol implementation of the perceived-latency technique covered on this page.
- **Realtime AI** — takes every technique on this page (parallelization, caching, smaller models, tight budgets) to its most demanding extreme, for voice and other sub-second-budget interactive products.
- **RAG** — the retrieval-quality sibling; this page treats retrieval purely as a latency-contributing pipeline stage, while RAG covers how to make that retrieval step accurate and relevant.
- **Tool Calling** — the correctness/safety sibling for external tool invocation; this page treats tool calls purely as latency-adding, variable-duration round trips that need timeouts and budgets.
- **Cost Optimization** — the closely related dollar-cost sibling, sharing several of the same levers (smaller models, caching, trimmed context) but optimizing for a different objective that must be explicitly reconciled with latency goals, not assumed identical.
- **Scaling AI** — covers how capacity itself is grown to keep queueing-driven latency bounded as traffic increases; this page defines the SLOs that scaling decisions are made to satisfy.
- **Evaluation** — the discipline for validating that any latency optimization touching model choice or context (routing, trimming, caching) hasn't silently regressed output quality.

Natural next pages on this platform: this page (**Latency**) → **Inference** and **Serving** for the model/infrastructure mechanics → **Realtime AI** for the most demanding real-world application of these ideas → **Cost Optimization** and **Scaling AI** for the closely related, often-jointly-optimized sibling concerns.
`,

  "latest-updates": `
Verified against my knowledge through early 2026; check the vLLM, SGLang, and TensorRT-LLM project pages, major provider API documentation, and recent systems papers for anything newer.

- **Prompt/prefix caching is now a standard, user-facing API feature** at major LLM providers, directly monetizing the shared-prefix latency win described in Intermediate Concepts — verify current pricing and cache-lifetime details against live documentation, since these terms evolve.
- **Disaggregated prefill/decode serving** (separately sized hardware pools for the two phases, see Advanced Concepts and the **Inference** skill) has moved from research proposal toward production adoption at large-scale deployments, specifically to protect decode-phase inter-token latency from being disrupted by concurrent heavy-prefill traffic.
- **Real-time and voice AI products** have pushed end-to-end latency budgets down into the low hundreds of milliseconds, popularizing aggressive pipeline-stage overlap (starting generation on partial input, streaming speech synthesis before generation fully completes) as a mainstream architecture pattern rather than a research curiosity — see the **Realtime AI** skill for specifics.
- **Agentic and multi-step tool-calling architectures have become mainstream**, making tool-call round-trip latency and multi-turn agent-loop overhead an increasingly common source of production latency incidents, distinct from and often larger than the underlying model call's own latency.
- **Latency-aware model routing** (sending different request types to different-sized models) has matured from an ad hoc cost-saving trick into a first-class architectural pattern at many AI products, now commonly paired with explicit evaluation gates rather than adopted on faith.

As with any fast-moving infrastructure area, verify specific benchmark numbers, current provider caching/pricing details, and current serving-engine feature support against live documentation rather than treating any figure on this page as current.
`,

  "future-roadmap": `
Where latency engineering for AI systems is heading, and what's worth betting career time on:

1. **Pipeline-level latency thinking will keep growing in importance relative to pure model-call speed**, as agentic, multi-tool, multi-step architectures become the norm rather than the exception — the skill of mapping a pipeline's true dependency graph and parallelizing what can be parallelized will matter more, not less, as pipelines get more complex.
2. **Real-time and voice AI's extreme latency budgets will keep pushing techniques (aggressive stage overlap, streaming at every layer, hedged requests) from a niche specialty into mainstream best practice** for ordinary chat and agent products too, as user expectations for responsiveness rise across the board.
3. **Latency-aware routing will keep maturing as a first-class architectural pattern**, increasingly paired with automated, continuous evaluation gates rather than one-time manual validation, as the cost of getting a routing decision wrong (on either latency or quality) becomes better understood industry-wide.
4. **Tail-latency discipline (p95/p99 budgeting, hedged requests, explicit per-stage timeouts) will keep migrating from elite distributed-systems teams into standard AI-engineering practice**, as more of the classic distributed-systems playbook proves directly applicable to multi-stage AI pipelines.
5. **The mechanics/pipeline split will hold**: the **Inference** skill's serving-engine techniques (KV caching, batching, speculative decoding) will keep evolving inside serving engines, while this page's pipeline-level disciplines (dependency-graph parallelization, budgets, routing, caching at every layer) remain the durable, engine-agnostic skill that transfers across whatever specific model or serving stack a team happens to be using.

For your career: understanding how to map any AI pipeline's real dependency graph, measure it honestly at the tail, and apply the right fix to the right stage is more durable than memorizing any single provider's current latency numbers or any single serving engine's current feature set — pipelines, providers, and engines change; the underlying discipline of finding and removing unnecessary sequential waiting does not.
`,

  "cheat-sheet": `
~~~text
# --- Core metrics ---
TTFT (time to first token):  network + queueing + prefill + any pre-model stages
                              -- everything before the user sees ANYTHING
Inter-token latency (ITL):   time between streamed tokens once generation started
                              -- dominated by decode phase (see Inference skill)
Track BOTH separately, plus PER-STAGE latency -- never one blended number.
ALWAYS measure at p50/p95/p99 -- averages hide the tail failures users feel.

# --- Why streaming helps ---
Total generation time UNCHANGED by streaming.
Perceived latency changes A LOT: user sees progress at TTFT, not at completion.
-> stream for any interactive, user-facing surface, near-unconditional win.

# --- Where latency actually lives in a real pipeline ---
network in -> auth/queue -> [retrieval] + [tool calls] (often WRONGLY sequential)
  -> prompt assembly -> prefill -> first token (TTFT) -> decode loop (streamed)
  -> [mid-generation tool calls insert MORE round trips] -> network out

# --- #1 highest-leverage fix: parallelize independent stages ---
Sequential:  total = stage_A + stage_B + stage_C   (sum)
Parallel:    total = max(stage_A, stage_B, stage_C)  (slowest one only)
-- only valid when stages have NO real data dependency on each other.
-- VERIFY concurrency with a timing test; don't assume async code is actually concurrent.

# --- Tail latency compounds with pipeline depth ---
More sequential stages -> more chances for ONE of them to spike ->
  pipeline p99 is often MUCH worse than any single stage's own p99.
Fewer stages (via parallelization/elimination) often beats speeding up one stage.

# --- Key techniques, matched to the bottleneck they fix ---
High TTFT, normal ITL       -> prefix/prompt caching, trim prompt, check queue depth
Normal TTFT, poor ITL       -> quantization, speculative decoding, better batching (Inference)
Fast model, slow overall    -> parallelize/cache/optimize the NON-model stage that dominates
Good avg, bad p99           -> timeouts + fallbacks, hedged requests, more capacity
Slow creeping TTFT over time -> unbounded context/history growth -- trim it

# --- Timeouts and fallbacks (non-negotiable for any external dependency) ---
Every retrieval call, tool call, sub-agent call NEEDS an explicit timeout.
Fallback must FAIL SAFE and be CLEARLY FLAGGED (degraded response), never silent.
No timeout = that dependency's worst case becomes YOUR pipeline's worst case.

# --- Latency / quality / cost triangle ---
Smaller/faster model:   latency DOWN, cost DOWN, quality RISK (must validate via Evaluation)
More context/bigger model: quality UP (maybe), latency UP, cost UP
Caching:                 latency DOWN, cost DOWN, quality unaffected (if correctness verified)
-- Every latency lever has a tradeoff somewhere; make it explicit, don't assume free lunches.

# --- Monitoring must-haves ---
Per-stage latency histograms (not just end-to-end) | queue depth / admission wait
Fan-out efficiency (concurrent wall-clock ~= slowest stage, not the sum)
Cache hit rates (prefix / retrieval / response) | timeout/fallback trigger rate per dependency
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What does TTFT measure? | Time from request sent to the first output token appearing -- dominated by network, queueing, and prefill |
| What does inter-token latency measure? | Time between consecutive streamed tokens once generation has started -- dominated by decode |
| Why does streaming feel faster if total time is unchanged? | Perceived latency is dominated by time-to-first-progress, not total duration; streaming shows the first token far earlier |
| What is the single highest-leverage structural latency fix? | Parallelizing pipeline stages that have no real data dependency on each other |
| How do you verify a "concurrent" refactor is actually concurrent? | Measure wall-clock time and confirm it's close to the slowest stage, not the sum of all stages |
| Why does tail latency (p99) get much worse as pipeline stage count grows? | Each additional sequential, independently-variable stage adds another chance for a spike; the probability at least one spikes compounds |
| Why track p95/p99 instead of just the average? | Averages hide tail failures -- the slow requests that a real fraction of users actually experience |
| What should every external dependency (tool call, retrieval, sub-agent) have? | An explicit timeout and a clearly-flagged fallback behavior |
| What does prompt/prefix caching fix? | Repeated prefill cost for a stable, shared prompt prefix across many requests |
| What is the latency/quality/cost triangle? | Improving one (e.g. latency via a smaller model) typically trades against another (quality or cost); tradeoffs must be explicit and validated, not assumed free |
| Name two non-model pipeline stages that commonly dominate latency in RAG/agent systems | Retrieval (vector search) and tool-call round trips |
| This page vs the Inference skill | This page: whole-pipeline view (network, retrieval, tools, model call as one stage). Inference: the model-serving mechanics that make the model-call stage itself fast |
| This page vs the Cost Optimization skill | Shares levers (caching, smaller models, trimmed context) but optimizes time, not dollars -- goals usually align but must be reconciled explicitly |
`,

  mcqs: `
**1. Which phase of an LLM request does TTFT primarily measure?**

A) Decode  B) Network, queueing, and prefill  C) Post-processing only  D) Tokenization speed

**Answer: B** — TTFT covers everything that happens before the first output token appears, which is dominated by network transit, queueing, and the prefill pass.

**2. Why does streaming improve perceived latency even though total generation time is unchanged?**

A) It actually reduces total generation time  B) Users experience waiting based on time-to-first-progress, not total duration  C) It uses a faster model automatically  D) It skips the decode phase

**Answer: B**

**3. Two pipeline stages have no data dependency on each other but are written sequentially. What is the effect on total latency?**

A) No effect, sequential and concurrent are always the same speed  B) Total latency equals the sum of both stages instead of the slower one alone  C) It automatically parallelizes at runtime  D) It reduces cost but not latency

**Answer: B**

**4. Why can a multi-stage pipeline's p99 be much worse than any individual stage's own p99?**

A) p99 is always equal to the sum of all stages' p50s  B) Each additional sequential, independently-variable stage adds another chance for a spike, compounding the overall probability of at least one occurring  C) p99 only applies to single-stage systems  D) This never happens in practice

**Answer: B**

**5. What is the correct response to a slow, unbounded third-party tool-call dependency in a latency-sensitive pipeline?**

A) Nothing, tool latency doesn't count toward user-facing latency  B) Add an explicit timeout with a clearly-flagged fallback behavior  C) Always retry indefinitely until it succeeds  D) Switch to a larger model

**Answer: B**

**6. Routing simple requests to a smaller, faster model reduces latency and cost. What must also happen before shipping this change?**

A) Nothing further is needed once latency improves  B) Validate the smaller model's quality on the specific routed request types against an acceptable threshold  C) Disable streaming for those requests  D) Increase the context window for those requests

**Answer: B**
`,

  "revision-notes": `
**Core metrics in 4 lines:** Latency for AI systems is not one number — TTFT (network + queueing + prefill, everything before the first token appears) and inter-token latency (decode-phase, per-token speed once generation has started) are governed by different stages and must be tracked separately. Both should be measured at p50/p95/p99, because averages hide the tail failures that define real user pain. Every pipeline stage beyond the model call itself (network, retrieval, tool calls, orchestration) also needs its own latency measurement, not folding into one blended total.

**Perceived vs actual latency in 2 lines:** Streaming responses do not change total generation time, but they dramatically improve perceived latency, because users experience waiting as time-to-first-progress rather than total duration — a near-unconditional win for any interactive surface.

**The structural fix that matters most, in 3 lines:** Multi-stage AI pipelines (RAG retrieval, tool calls, model generation) are very often written with independent stages running sequentially by accident, costing the sum of their durations instead of just the slowest one. Parallelizing genuinely independent stages is usually the single highest-leverage, lowest-risk latency fix available, and it must be verified with an actual concurrency test, not assumed from the presence of async code.

**Tail latency in 3 lines:** Tail latency (p99) in a multi-stage pipeline is commonly much worse than any individual stage's own p99, because each additional sequential stage compounds the chance that at least one of them spikes for a given request — reducing stage count (via parallelization or elimination) is often a bigger tail-latency lever than speeding up any one stage. Timeouts and fallbacks on every external dependency convert an unbounded worst case into a bounded, predictable one.

**Tradeoffs and scope in 3 lines:** Techniques like smaller-model routing and aggressive context trimming reduce latency (and often cost) but carry a real quality risk that must be validated, not assumed — this is the latency/quality/cost triangle. This page covers the whole-pipeline, system-level view of where latency lives; the **Inference** skill covers the model-serving mechanics (KV cache, batching, speculative decoding) that make the model-call stage itself fast, and **Cost Optimization** covers the closely related, dollar-denominated sibling goal that shares many of the same levers.
`,

  "learning-roadmap": `
A realistic path to strong latency-engineering fluency (assumes basic familiarity with LLM calls; **Inference** is a helpful parallel read):

**Week 1 — Metrics and perception.** Read Beginner and Intermediate Concepts closely; do Hands-on Lab 1 (measure TTFT on a real streaming call). Milestone: you can explain, without notes, why TTFT and inter-token latency are different and why streaming helps perception even with unchanged total time.

**Week 2 — Mapping a real pipeline's dependency graph.** Read Internal Working, Architecture, and Data Flow; do Coding Question 1 (detect sequential vs concurrent execution from timing data). Milestone: given any pipeline description, you can draw its true dependency graph and mark which edges are real versus incidental.

**Week 3 — Fixing the structural bottleneck.** Read Advanced Concepts and the RAG/tool-call latency material in Intermediate Concepts; do Hands-on Lab 2 (find and fix an accidentally-sequential fan-out) and Coding Question 2. Milestone: you've measured a real before/after latency improvement from parallelizing independent stages.

**Week 4 — Tail latency and budgets.** Work through Advanced Concepts' queueing-theory section and Coding Question 3; do Hands-on Lab 3 (the tail-latency simulator). Milestone: you can explain, with a concrete simulated example, why pipeline p99 compounds with stage count and why timeouts/fallbacks matter.

**Week 5 — Production application.** Read Production Usage, Performance, Monitoring, Deployment, and the Production Checklist; do Hands-on Lab 4, instrumenting and load-testing a real pipeline end to end. Milestone: a working, load-tested pipeline with measured p50/p95/p99 for TTFT, inter-token latency, and every stage individually.

**Week 6 — Interview and portfolio polish.** Work through Interview Questions and Real Projects; pick one Real Project to build fully. Milestone: explain TTFT vs inter-token latency, why streaming helps perception, why parallelization is the top structural fix, and why tail latency compounds with stage count — each with a concrete numeric example, unprompted.

Then continue to **Inference** (if not already covered) for the model-serving mechanics this page references throughout, and to **Serving** / **Scaling AI** for the infrastructure that executes these fixes at production scale, and **Realtime AI** for the most demanding real-world application of everything on this page.
`,

  "official-docs": `
- [Anthropic API documentation — prompt caching and streaming](https://docs.anthropic.com/) — direct, user-facing documentation of prefix caching and streaming, two of this page's core techniques, from a frontier model provider; verify current details since caching features evolve.
- [OpenAI API documentation — streaming responses](https://platform.openai.com/docs) — covers streaming implementation from the consumer-facing side of the mechanics this page describes.
- [vLLM documentation](https://docs.vllm.ai/) — the reference serving-engine documentation for continuous batching and PagedAttention, the model-serving-layer mechanics that underlie this page's TTFT/inter-token latency discussion; see the **Inference** skill for the deep dive.
- [Google SRE workbook — latency chapters](https://sre.google/workbook/table-of-contents/) — not LLM-specific, but the canonical source for percentile-based SLO thinking (p50/p95/p99) that this page's SLO section directly builds on.
- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) — the transport-layer mechanics behind streaming responses; see the **Streaming** skill for the full treatment.
`,

  books: `
- **Designing Data-Intensive Applications** — Martin Kleppmann. Not LLM-specific, but its treatment of latency, percentiles, and tail-latency-causing variance in distributed systems is the direct conceptual foundation for everything in this page's Advanced Concepts and Scalability sections.
- **The Site Reliability Engineering books (Google SRE Book and SRE Workbook)** — the canonical source for SLO/SLI thinking, percentile-based latency targets, and the operational discipline of alerting on tail behavior rather than averages.
- **Designing Machine Learning Systems** — Chip Huyen. Covers serving and latency tradeoffs in the broader ML-systems context; useful grounding for the production mindset this page assumes, even though it predates the most recent LLM-specific pipeline patterns.
- **Computer Systems: A Programmer's Perspective** — Bryant & O'Hallaron. Not LLM-specific, but its treatment of concurrency and memory hierarchy is useful background for understanding why certain latency techniques (parallel fan-out, caching layers) work the way they do.

Honest note: a dedicated, mature book specifically on "LLM pipeline latency engineering" does not yet exist as a distinct category as of this writing — the field is young and moves fast. The strongest material right now is the distributed-systems classics above (whose lessons transfer directly) combined with primary sources: provider documentation and the papers listed below.
`,

  blogs: `
- **Anthropic and OpenAI engineering blogs** — occasional deep dives on production inference latency, streaming, and prompt-caching design from frontier-model providers.
- **vLLM and SGLang project blogs** — direct source for serving-engine-level latency techniques (continuous batching, PagedAttention, speculative decoding) referenced throughout this page's model-call stage.
- **Together AI, Fireworks AI, and Groq engineering blogs** — infrastructure providers that publish latency benchmarks and techniques as a core part of their product positioning, useful for grounding TTFT/tokens-per-second numbers in real, current figures.
- **High Scalability** and similar distributed-systems engineering blogs — not LLM-specific, but a reliable source of tail-latency and queueing-theory case studies that transfer directly to multi-stage AI pipeline design.

Verify recency on all of these — both AI-serving-engine content and general distributed-systems content age at different rates, and specific benchmark numbers should always be checked against current sources.
`,

  "research-papers": `
This is a genuinely thin category for a paper specifically titled about "AI pipeline latency" — the topic sits at the intersection of well-covered distributed-systems research and fast-moving LLM-serving research, so the most relevant reading is drawn from both:

- **"The Tail at Scale"** (Dean & Barroso, 2013, Communications of the ACM) — the foundational paper on why tail latency, not average latency, determines real user experience in large systems; the direct intellectual ancestor of this page's tail-latency and SLO material.
- **"Efficient Memory Management for Large Language Model Serving with PagedAttention"** (Kwon et al., 2023) and **"Fast Inference from Transformers via Speculative Decoding"** (Leviathan et al., 2023) — the primary sources for the model-serving-layer techniques (see the **Inference** skill for the full treatment) that determine the model-call stage's contribution to this page's latency budget.
- **"Orca: A Distributed Serving System for Transformer-Based Generative Models"** (Yu et al., 2022, OSDI) — the paper generally credited with introducing continuous/iteration-level batching, directly relevant to queueing-driven latency under load.

Honest note: unlike Inference's tightly-clustered 2022-2024 systems-research literature, "system-level AI pipeline latency" as covered on this page is more of an applied engineering discipline synthesized from distributed-systems fundamentals plus current serving-engine research than a single well-defined research subfield with its own dedicated paper trail — treat the distributed-systems classic above as the closest foundational reading, and the Inference skill's paper list as the model-call-specific complement.
`,

  videos: `
- **Conference talks on tail latency and SLOs from SRECon, Strange Loop, or similar distributed-systems conferences** — search current listings for recent recordings; the underlying "Tail at Scale" material this page draws on has been the subject of many recorded talks over the years.
- **vLLM, SGLang, and TensorRT-LLM project talks** — walkthroughs of the serving-engine techniques (continuous batching, PagedAttention, speculative decoding) that determine the model-call stage's latency contribution; search for the most recent recorded talk, since specific conference names/years vary.
- **Provider-hosted developer conference sessions on streaming and prompt caching** (from Anthropic, OpenAI, and similar) — practical, API-level walkthroughs of the perceived-latency and prefix-caching techniques covered on this page.

Honest note: verify speaker names, exact talk titles, and publication dates against current listings before citing a specific talk — this is a fast-moving conference/talk landscape without a small number of canonical, timeless videos the way some other topics have.
`,

  "github-repos": `
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — the reference continuous-batching and PagedAttention implementation; the clearest grounding for the model-call stage of the latency pipeline described on this page.
- [sgl-project/sglang](https://github.com/sgl-project/sglang) — an alternative modern serving engine with its own scheduling and caching design, useful for comparison.
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) and [run-llama/llama_index](https://github.com/run-llama/llama_index) — widely-used RAG/agent orchestration frameworks; useful for studying (and critiquing) how retrieval and tool-call stages are structured by default, including where accidental sequential dependencies commonly creep in.
- [openai/openai-python](https://github.com/openai/openai-python) and [anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python) — official SDKs whose streaming client implementations are a good reference for correct incremental-token handling.
- [prometheus/client_python](https://github.com/prometheus/client_python) — a standard metrics client library commonly used to instrument the per-stage latency histograms described in the Monitoring section.
- [locustio/locust](https://github.com/locustio/locust) — a load-testing tool well-suited to generating the realistic, variable-length/variable-latency request distributions this page repeatedly emphasizes as necessary for honest latency benchmarking.

Reading the vLLM scheduler source directly, alongside a RAG/agent framework's default orchestration code, is a high-signal way to move from "understands pipeline latency conceptually" to "can spot an accidental sequential dependency on sight."
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Metrics fluency*: given a raw list of per-request timestamps (request received, first token, last token), compute TTFT, total time, and inter-token latency for each request, then compute p50/p95/p99 across the set (extend Coding Question 3).
2. *Dependency-graph reasoning*: given a written description of a pipeline (e.g., "fetch user profile, then check permissions, then retrieve documents, then call a pricing tool, then generate"), identify which steps have a REAL data dependency on a previous step's output and which could run concurrently, and redraw the pipeline as a dependency graph.
3. *Concurrency verification*: given timing data from a supposedly-parallelized pipeline (extend Coding Question 1), determine whether it is actually running concurrently, and if not, hypothesize what implementation detail (shared lock, blocking call in an async context) could explain the discrepancy.
4. *Tail-latency compounding*: using the simulator from Coding Question 3 / Hands-on Lab 3, determine the stage count at which a pipeline's p99 exceeds a given product SLA, holding per-stage spike probability constant, and propose which stages to eliminate or parallelize first.
5. *Budget design*: given a product's overall latency SLA (e.g., "p95 response time under 3 seconds") and a pipeline with retrieval, two tool calls, and a model call, propose an explicit per-stage timeout budget that sums (accounting for necessary sequential dependencies and possible parallel fan-out) to meet the SLA with reasonable margin.
6. *End-to-end tradeoff design*: design (on paper) the latency, quality, and cost tradeoffs for two different products — a low-latency-budget voice assistant and a higher-latency-tolerant document-analysis tool — justifying different choices (model size, context size, caching aggressiveness, parallelization requirements) for each against this page's concepts.

External sets: the vLLM and SGLang GitHub issue trackers (real production latency-tuning questions and their resolutions), and the Google SRE Workbook's latency and SLO exercises for percentile-based reasoning practice that transfers directly to this domain.
`,

  "architecture-diagram": `
The reference architecture for a latency-conscious production AI pipeline — the shape this page's techniques compose into, sitting on top of the model-serving layer the **Inference** and **Serving** skills cover in depth:

~~~mermaid
flowchart TB
    Client["Client (chat UI, voice app, API consumer)"] --> GW["Gateway: auth, rate limiting,\nlatency budget assignment"]

    GW --> Fanout{"Independent stages?"}
    Fanout -->|yes, parallel| Ret["Retrieval\n(vector search, own timeout)"]
    Fanout -->|yes, parallel| Tool1["Tool call 1\n(own timeout + fallback)"]
    Fanout -->|no dependency| Tool2["Tool call 2\n(own timeout + fallback)"]

    Ret --> Assemble["Prompt assembly\n(waits for fastest-of-budget or all)"]
    Tool1 --> Assemble
    Tool2 --> Assemble

    Assemble --> Engine["Inference engine\n(prefill + decode, see Inference skill)"]
    Engine -->|first token: TTFT| Stream["Streaming layer\n(SSE / chunked / WebSocket)"]
    Engine -->|mid-generation tool request| ToolMid["Tool executor\n(own timeout + fallback,\nadds a round trip)"]
    ToolMid --> Engine

    Stream --> Client

    Engine -.metrics: TTFT, ITL, per-stage latency.-> Obs["Monitoring\n(per-stage histograms, p95/p99 alerts)"]
    Ret -.metrics.-> Obs
    Tool1 -.metrics.-> Obs
    Tool2 -.metrics.-> Obs
~~~

Everything inside the Fanout/Retrieval/Tool boxes and the Gateway's budget assignment is this page's core territory; the Inference engine's internal prefill/decode mechanics are the **Inference** skill's domain, and how many instances of this whole diagram run, how they're load-balanced, and how they autoscale is the **Serving** and **Scaling AI** skills' domain.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Latency))
    Core metrics
      TTFT
        network + queue + prefill
      Inter-token latency
        decode-phase, tokens per second
      Per-stage latency
        retrieval, tool calls, orchestration
      Percentiles
        p50 vs p95 vs p99
        tail is what users feel
    Perceived latency
      Streaming
        unchanged total time, faster FEEL
      Progress signals
    Pipeline sources
      Network round trips
      Queueing
      Prefill
      Decode
      Retrieval step (RAG)
      Tool-call round trips
      Orchestration / agent loop overhead
    Techniques
      Prompt / prefix caching
      Smaller / faster models for simple paths
      Speculative decoding
      Parallelizing independent stages
      Trimming prompt / context size
      Timeouts and fallbacks
      Hedged / redundant requests
    Tail latency
      Compounds with stage count
      Queueing theory intuition
      Fewer stages often beats faster stages
    Tradeoffs
      Latency / quality / cost triangle
      Routing must be validated, not assumed
    Pitfalls
      Average-only metrics
      Accidental sequential fan-out
      Unbounded external dependencies
      Unchecked context growth
    Ecosystem
      Inference
      Serving
      Streaming
      Realtime AI
      RAG
      Tool Calling
      Cost Optimization
      Scaling AI
    Career
      Interview classics
      Dependency-graph reasoning
      Reading path
~~~
`,
};

export default latency;
