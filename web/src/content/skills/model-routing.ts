import type { SkillContent } from "../types";

/**
 * Model Routing — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const modelRouting: SkillContent = {
  overview: `
Model routing is the practice of dynamically choosing which model handles a given request, instead of sending every request in a system to the same fixed model. A router sits between your application and the pool of available models — small and large, cheap and expensive, general and specialized — and decides, per request, which one should actually answer.

The problem routing solves is an economic and quality one at the same time. A frontier model (the biggest, most capable model a provider offers) is expensive per token and often slower than a smaller sibling model. If every request in a production system — including "what is the capital of France"-grade queries — goes to the frontier model, you are paying frontier prices for work a model ten times cheaper could do correctly. Conversely, if you route everything to the cheapest available model to save money, you will silently fail on the subset of requests that need real reasoning, long context, tool use, or domain expertise, and users will notice quality drops before your dashards do. Model routing is the deliberate middle path: match request difficulty and requirements to model capability and cost, request by request.

For an AI engineer, model routing is not a nice-to-have layered on top of a finished system — it is a core piece of production LLM architecture, sitting right next to prompt design and evaluation. It touches cost engineering (see the Cost Optimization skill), latency engineering (see the Latency skill), reliability engineering (failover across providers), and the serving layer itself (see the vLLM, Ollama, and SGLang skills for how the actual model instances a router points at are hosted). Multi-model products — coding assistants, customer support copilots, agentic pipelines — all route today, whether the team calls it that explicitly or has just hard-coded a few if-statements.

Key characteristics of a model routing layer: it operates per-request (not per-deployment), it is informed by signals about the request (complexity, required capabilities, historical outcomes) and about the models (cost, latency, quality, context window, tool support), it typically sits behind a single application-facing interface so callers do not need to know which model actually ran, and it must be observable — a routing decision that silently degrades quality is worse than no routing at all, because nobody is looking at the "one model" scenario anymore.
`,

  history: `
Model routing as a named discipline is young — it emerged directly out of the economics of the 2023–2025 LLM API era, but the underlying idea (send cheap work to cheap resources, expensive work to expensive resources) is an old systems-engineering pattern borrowed from load balancing, database read/write splitting, and CDN tiering.

| Year | Milestone |
|------|-----------|
| 2020–2022 | GPT-3-era APIs offer only a handful of model sizes (ada/babbage/curie/davinci); developers manually pick one per use case at design time, not per request |
| 2023 | OpenAI ships GPT-3.5-turbo alongside GPT-4 at a large price/latency gap; teams start hand-writing "if short and simple, use 3.5" logic — the first informal routers |
| 2023 | Anthropic, then most providers, publish multiple tiers (small/medium/large) explicitly positioned for cost-tiered routing |
| 2024 | "LLM cascades" and "model routing" appear as named research topics; papers formalize cascade routing (cheap model first, escalate on low confidence) and learned routers (a classifier trained to predict which downstream model handles a query best) |
| 2024 | RouteLLM and similar open-source routing frameworks are released, framing routing as a first-class, swappable component rather than ad hoc glue code |
| 2024–2025 | Commercial "model gateway" products (unified multi-provider API layers) ship built-in routing, semantic caching, and fallback as standard features, not custom builds |
| 2025+ | Agent frameworks begin doing routing implicitly per-step: a planning step goes to a frontier model, a tool-call formatting step goes to a smaller model, inside a single agent run |

The throughline: as the number and price spread of available models grew, and as LLM calls moved from "one experimental call" to "millions of calls a day in a real product," the cost and latency delta between "always use the best model" and "route intelligently" became too large for any serious production team to ignore. Routing moved from a manual, per-feature decision made by a developer at design time to an automated, per-request decision made by a system at run time.
`,

  "why-it-exists": `
Before routing, LLM-backed systems were built around a single model choice made once, at design time, by a developer reading a menu of options and picking "the one we'll use." That decision usually erred toward the strongest available model, because nobody wants to be the engineer whose product looks dumb in a demo.

That single-model-for-everything world had two failure modes that model routing exists to close:

- **Overspending on easy requests.** The overwhelming majority of real traffic to a production LLM system — classification, extraction, short factual lookups, formatting, simple rewrites — does not need frontier-level reasoning. Sending all of it to the most expensive model multiplies your bill by the ratio between frontier and small-model pricing (often 10-30x) for zero measurable quality gain on that traffic.
- **Underspending on hard requests.** The inverse mistake — picking a cheap model as the single default to control cost — silently breaks on the minority of requests that actually need deep reasoning, large context windows, or reliable tool use. These failures are worse than the overspend case because they are invisible until a user complains or a downstream system consumes bad output.

Model routing exists because these two failure modes are opposites, and a fixed single-model architecture cannot solve both at once. The moment the model marketplace offered more than one usable size/price point — which happened quickly once every major provider shipped small, medium, and large model tiers, and once open-weight models became competitive for narrow tasks — routing became the natural architecture: keep the decision, but make it per-request and automatic instead of a one-time developer choice baked into the product.
`,

  "problem-it-solves": `
Model routing concretely removes:

- **Fixed cost per request regardless of difficulty.** Without routing, a one-line classification call and a multi-step legal-reasoning call cost the same per token-unit if they hit the same model. Routing lets cost track difficulty.
- **Fixed latency regardless of SLA.** A user-facing autocomplete feature and a background report-generation job have wildly different latency tolerances; routing can send the former to the fastest model available and the latter to the most capable one, independent of each other.
- **All-or-nothing capability matching.** Some requests need a 200K-token context window, function calling, or code-specific training; a single fixed model either always pays for that capability (waste, when unused) or never has it (failure, when needed). Routing matches capability to requirement per request.
- **Single point of provider failure.** With one hard-coded model/provider, an outage or rate-limit event takes down the whole feature. A router with failover can shift traffic to a backup provider automatically.

What model routing deliberately does **not** solve:

- **It does not fix a bad prompt.** Routing a poorly specified request to a stronger model often just gets a more articulate wrong answer. Prompt quality and routing are complementary, not substitutes — see the Prompt Versioning skill.
- **It does not replace evaluation.** Routing needs a notion of "did the cheap model's answer succeed," and that notion has to come from an evaluation or confidence signal (see the Evaluation and AI Evals skills); routing without a quality signal is just guessing which model to use.
- **It does not eliminate the need to call a model at all.** For genuinely repeated or near-duplicate queries, the right answer is often to skip inference entirely via semantic caching (see the Semantic Caching skill), which routing complements but does not replace.
- **It does not make a weak model strong.** Routing chooses among existing models; it cannot grant a small model capabilities it fundamentally lacks (e.g., a tiny model still cannot reliably do 50-step multi-hop reasoning even if you route to it with high confidence thresholds).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what a model router is and articulate the specific cost/latency/quality problem it solves in a multi-model production system.
2. Name and compare the core routing decision axes: cost, latency, quality/capability, context length, and tool-use/structured-output support.
3. Describe and implement rule-based routing using request-type and complexity heuristics.
4. Describe and implement classifier-based routing, including how to train or bootstrap a lightweight complexity/intent classifier.
5. Describe and implement cascade/fallback routing, including how to define a confidence or quality check that triggers escalation.
6. Design a worked routing layer that sends factual queries to a small model, complex reasoning to a frontier model, and code-heavy requests to a code-specialized model.
7. Reason about multi-provider routing tradeoffs — cost/redundancy/capability gains versus the lowest-common-denominator cost of an abstraction layer.
8. Explain how semantic caching complements routing by avoiding model calls entirely for repeated queries.
9. Design latency-aware and reliability/failover routing for SLA-bound and outage-prone production systems.
10. Instrument a routing layer so routing decisions and their downstream cost/quality outcomes are observable, and explain the tradeoff between routing sophistication and system debuggability.
`,

  prerequisites: `
- **Required**: comfort calling LLM APIs directly (a single fixed model, single provider) and a basic understanding of what makes one LLM call more expensive or slower than another (model size, output tokens, context length).
- **Required**: basic familiarity with what an evaluation or quality-check signal looks like — you don't need deep evals expertise, but you need to accept that "is this answer good enough" is itself a measurable, non-trivial problem. See the **Evaluation** and **AI Evals** skills.
- **Helpful**: exposure to the **LLMOps** skill for the broader lifecycle model routing sits inside (versioning, monitoring, deployment of LLM-backed features).
- **Helpful**: familiarity with the **Prompt Versioning** skill — a model swap frequently requires a matching prompt variant, since prompts are not universally portable across models.
- **Helpful**: basic knowledge of at least one serving stack (see the **vLLM**, **Ollama**, or **SGLang** skills) if you plan to route across self-hosted open-weight models rather than only hosted provider APIs.
- **Not required**: no machine learning training experience is needed to start with rule-based or cascade routing; it becomes useful once you build a learned classifier-based router.

Dependency links: **LLM Fundamentals** and **Prompt Versioning** → this page → **Cost Optimization**, **Latency**, **Semantic Caching**, and the serving-layer skills (**vLLM**, **Ollama**, **SGLang**) all connect directly to routing decisions made here.
`,

  "beginner-concepts": `
### What "routing" means at the simplest level

At its core, a router is just a function: given a request, return which model should handle it. The simplest possible router is a single if-statement.

~~~python
def route(request: str) -> str:
    """The simplest possible router: length as a complexity proxy."""
    if len(request) < 80:
        return "small-model"       # cheap, fast, good enough for short asks
    return "frontier-model"        # expensive, slow, reserved for harder asks

model_name = route(user_message)
response = call_model(model_name, user_message)
~~~

This is naive (length is a weak proxy for difficulty — "explain quantum entanglement" is short but hard), but it demonstrates the whole shape of routing: a decision function, a pool of named models, and a dispatch call. Every more sophisticated router in this page is a refinement of this same shape.

### The three things every model has that matter for routing

~~~text
Model            Cost ($/1M output tokens)   Typical latency (time to first token)   Capability tier
small/fast model  low (for example, $0.15)    very low                                good at short, factual, formatting tasks
mid-size model    medium                      medium                                  good general-purpose default
frontier model    high (for example, $15+)    higher                                  best at multi-step reasoning, ambiguity
~~~

Every routing decision is, at its core, a tradeoff among these three axes plus a fourth: does the model actually support what the request needs (large context, function calling, vision, code specialization)?

### A pool of models behind one interface

~~~python
MODEL_POOL = {
    "small": {"name": "gpt-4o-mini", "cost_per_1k_out": 0.0006, "context": 128_000},
    "mid":   {"name": "gpt-4o",      "cost_per_1k_out": 0.010,  "context": 128_000},
    "large": {"name": "claude-opus", "cost_per_1k_out": 0.075,  "context": 200_000},
}

def call_model(tier: str, prompt: str) -> str:
    """One function callers use; the tier abstracts away which real model runs."""
    config = MODEL_POOL[tier]
    # error handling: never let a bad tier name silently pick a default model
    if tier not in MODEL_POOL:
        raise ValueError(f"Unknown routing tier: {tier}")
    return send_to_provider(config["name"], prompt)
~~~

The point of this pattern: application code calls "call_model(tier, prompt)" and never needs to know or care which literal model string is behind "small" today. That indirection is what lets you swap models, add providers, or change routing logic without touching every call site — the same reason web services put a load balancer in front of servers instead of hard-coding IP addresses.

### Why not always use the best model?

Two concrete reasons a beginner should internalize immediately: (1) cost scales linearly with volume — a frontier model that is 20x the price of a small model, run on 100,000 requests/day, is the difference between a $50/day bill and a $1,000/day bill for traffic that mostly does not need the extra capability; (2) latency compounds in interactive products — a chat UI where every reply takes 4 seconds instead of 0.5 seconds feels broken even if the answer quality is identical for 90% of turns.
`,

  "intermediate-concepts": `
### Rule-based routing by request type

The most common production starting point: classify the request by an explicit, cheap-to-compute signal (an API parameter, a regex, a keyword match, a length threshold, a detected language) and map that signal to a model tier.

~~~python
import re

def rule_based_route(request: dict) -> str:
    """Route by request metadata and cheap heuristics — no model call needed
    to make the routing decision itself."""
    text = request["message"]

    # Explicit feature flag always wins — lets product override routing per endpoint
    if request.get("force_tier"):
        return request["force_tier"]

    # Code-heavy detection: cheap regex, not a model call
    if re.search(r"code fence|def |class |import |SELECT |function\\(", text):
        return "code-specialized"

    # Long input needs a model with sufficient context window
    if len(text) > 6000:
        return "large-context"

    # Short, simple-looking requests default to the cheap tier
    if len(text.split()) < 40:
        return "small"

    return "mid"
~~~

Rule-based routing is transparent, debuggable, and requires no training data — every decision traces to a readable condition. Its weakness is that it cannot capture nuanced difficulty ("this 20-word question requires five-step reasoning") — heuristics based on length or keywords are proxies for complexity, not measurements of it.

### Classifier-based routing

A small, cheap model (or a lightweight traditional ML classifier) is trained or prompted to predict which downstream model tier a request needs, before the "real" call is made.

~~~python
def classify_complexity(request: str, classifier_model: str = "small-model") -> str:
    """Use a cheap model call to PREDICT which downstream tier is needed.
    This costs a small amount of latency/money up front to save more downstream."""
    system_prompt = (
        "Classify the difficulty of the user request as exactly one word: "
        "'simple' (factual lookup, formatting, short rewrite), "
        "'moderate' (multi-step but bounded reasoning), or "
        "'complex' (open-ended reasoning, ambiguity, multi-hop analysis)."
    )
    verdict = call_model(classifier_model, system_prompt + "\\n\\nRequest: " + request)
    verdict = verdict.strip().lower()

    # Defensive default: unknown/unexpected classifier output routes to the
    # SAFER (more capable) tier, not the cheaper one — fail toward quality.
    return {"simple": "small", "moderate": "mid"}.get(verdict, "large")
~~~

The key production lesson embedded above: when a classifier's output is unexpected or malformed, default to the more capable tier, not the cheaper one. A misrouted request that goes to a stronger-than-needed model wastes money; a misrouted request that goes to a weaker-than-needed model produces a wrong answer a user sees. Fail toward quality, not toward savings.

### Cascade / fallback routing

Instead of predicting difficulty ahead of time, cascade routing tries the cheap model first and escalates only if a confidence or quality check fails.

~~~python
def cascade_route(request: str) -> str:
    """Try cheap first; escalate on failure. No upfront classification call —
    the cheap model's own output tells you whether escalation is needed."""
    cheap_answer = call_model("small", request)

    if passes_confidence_check(cheap_answer):
        return cheap_answer

    # Escalate: the cheap model's output was low-confidence or failed a check
    strong_answer = call_model("large", request)
    log_escalation(request, reason="low_confidence_cascade")
    return strong_answer

def passes_confidence_check(answer: str) -> bool:
    """A real confidence check combines several signals: model-reported
    confidence/logprobs if available, output length sanity, refusal detection,
    and structural validation (e.g. did requested JSON actually parse)."""
    if not answer or "I'm not sure" in answer or "I cannot" in answer:
        return False
    return True
~~~

Cascades trade a little latency (the cheap model's wasted attempt, on the escalation path) for meaningfully lower average cost, since most requests never trigger escalation. The confidence check is the load-bearing piece — a weak confidence check turns a cascade into "always use the cheap model," and an overly strict one turns it into "always escalate," defeating the purpose either way.

### Combining strategies

Production routers rarely use exactly one strategy. A common layered design: rule-based routing handles obvious cases cheaply (code detection, explicit overrides), a classifier handles the ambiguous middle, and a cascade acts as a safety net that escalates whenever the chosen tier's own output looks wrong — three layers, each catching what the previous one missed.
`,

  "advanced-concepts": `
### Multi-signal routing decision tables

Senior routing design treats the decision as a small multi-criteria table rather than a single if-chain, because the axes interact.

| Signal | Example value | Effect on routing |
|--------|---------------|--------------------|
| Estimated complexity | "complex" (from classifier) | pushes toward frontier tier |
| Required context length | 150K tokens | filters out any model with a smaller window, regardless of cost tier |
| Tool/function-call need | request needs structured JSON tool calls | filters to models with reliable tool-use support |
| Latency SLA | interactive chat, p95 < 2s | filters to fastest available model meeting quality floor |
| Historical accuracy for this task type | small model has 92% pass rate on this intent | can justify keeping cheap tier even for moderate complexity |
| Cost budget remaining this period | near monthly cap | can force cheaper tier as a circuit breaker |

A production router evaluates constraints (context length, tool support) as hard filters first — a model without enough context window is disqualified outright, no matter how cheap or fast — and only then optimizes cost/latency/quality among the remaining candidates.

### Learned routers and the RouteLLM-style approach

Beyond a hand-written classifier prompt, a learned router is trained on historical (request, model, outcome) triples to predict, for a new request, which model tier achieves the best quality-per-dollar. This requires a labeled dataset of "which model would have been good enough here," which in practice comes from running both a cheap and an expensive model on a sample of traffic and comparing outputs with an evaluator (see the Evaluation skill) or with human preference data. The advantage over a prompted classifier: a trained router can be a small, fast, cheap-to-run model itself (even a lightweight non-LLM classifier), avoiding the latency and cost of an LLM-based pre-classification call on every single request.

### Escalation confidence signals, ranked by reliability

1. **Structural validation** (did the required JSON schema actually parse, did the requested fields exist) — cheap, deterministic, highest signal for structured-output tasks.
2. **Self-reported uncertainty / refusal detection** — the model says "I'm not sure" or refuses; moderately reliable, but models vary in how honestly they signal uncertainty.
3. **Log-probabilities / token-level confidence** (when the provider exposes them) — a genuine confidence signal, but not available from every provider or every model.
4. **A second, independent model as judge** — call another model to grade the first model's answer; most reliable in aggregate, but adds cost and latency, so it is usually reserved for high-stakes escalation checks rather than every request.
5. **Downstream task success** (did the code compile, did the customer not re-ask the same question) — the truest signal, but arrives too late to prevent the bad answer from being shown; useful for retraining the router, not for real-time escalation.

### Cost/quality Pareto reasoning

A mature routing team doesn't just pick "the cheapest model that seems okay." It plots quality (from evals) against cost per request for each candidate model on representative traffic samples, and picks routing thresholds that sit on the Pareto frontier — the set of models where you cannot get better quality without paying more, and cannot save money without losing quality. Routing thresholds set below this frontier are pure waste; thresholds set on it are the actual routing policy worth deploying.

### Interaction with prompt variants

A model swap inside a router is rarely prompt-neutral: a prompt tuned for a frontier model's instruction-following may underperform on a smaller model that needs more explicit formatting instructions or few-shot examples. Mature routing systems pair each model tier with its own prompt variant (see the Prompt Versioning skill) rather than sending one universal prompt to every tier — routing without prompt-per-tier is a common source of "the small model looks worse than it should" complaints that are actually a prompt-mismatch problem, not a capability problem.

### Statefulness across a multi-turn or multi-step interaction

In agentic or multi-turn systems, routing decisions are not always independent per call. A planning step might route to a frontier model, then subsequent tool-formatting or summarization steps within the same agent run route to a smaller model — routing at the step level, not just the request level. This requires the router to track which step of a pipeline it is serving, since the same underlying user message can require different tiers depending on which sub-task is currently executing.
`,

  "internal-working": `
Internally, a model routing layer executes a consistent pipeline, whether it is three lines of rule-based code or a trained classifier with a cascade fallback behind it.

~~~mermaid
flowchart TD
    A["Incoming request"] --> B["Extract signals:\nlength, keywords, metadata,\nrequired context/tools"]
    B --> C{"Hard constraint filter:\ncontext length, tool support"}
    C -->|fails all candidates| D["Reject or force largest\ncapable model"]
    C -->|candidates remain| E["Complexity estimate:\nrule, classifier, or\nhistorical stats"]
    E --> F["Select model tier\n(cost/latency/quality tradeoff)"]
    F --> G["Call selected model"]
    G --> H{"Confidence / quality check\npassed?"}
    H -->|yes| I["Return response"]
    H -->|no, escalate| J["Call stronger model"]
    J --> I
    G --> K["Log: request signals,\nchosen tier, latency,\ncost, outcome"]
    J --> K
~~~

Step by step:

1. **Signal extraction** happens first and is cheap by design — length, regex matches, request metadata (an explicit endpoint or feature flag), and any declared requirements (needs function calling, needs a 100K-token document attached) are computed without calling any model.
2. **Hard constraint filtering** removes any candidate model that structurally cannot serve the request — insufficient context window, no tool-use support, wrong modality (text-only model given an image). This step is a filter, not a preference — a model failing here is disqualified regardless of how cheap or fast it is.
3. **Complexity estimation** produces the actual difficulty signal, via whichever strategy the system uses (rule, classifier call, or a cascade's own first attempt).
4. **Tier selection** picks the specific model among the remaining, qualified candidates that best matches the cost/latency/quality tradeoff for this request's estimated difficulty and the caller's SLA.
5. **The call and confidence check** execute the request against the chosen model and, if the architecture includes a cascade, evaluate whether the result is good enough or needs escalation.
6. **Logging** captures every decision (signals in, tier chosen, latency, cost, and — once known — outcome quality) so the routing policy itself can be audited and improved; this is the step naive routers skip and mature ones treat as non-negotiable (see Monitoring).

The critical internal property to understand: routing decisions and model calls are logically separate stages. A router that conflates "decide which model" with "call the model" cannot be tested, cached, or audited independently — production routers keep the decision function pure and side-effect-free wherever possible, so it can be unit tested against fixed inputs without hitting any real API.
`,

  architecture: `
A production model routing layer is best understood at two levels: where it sits in the request path, and how the internal components are structured.

### Request-path architecture

~~~mermaid
flowchart LR
    Client["Client / application code"] --> GW["Model Gateway\n(single API surface)"]
    GW --> Router["Router:\nsignal extraction +\ntier selection + cascade logic"]
    Router --> Cache["Semantic cache check\n(skip model call entirely\non a hit)"]
    Cache -->|miss| Pool["Model pool"]
    Cache -->|hit| Client
    subgraph Pool["Model pool (multi-provider)"]
        S["Small/fast model"]
        M["Mid-size model"]
        L["Frontier model"]
        Cd["Code-specialized model"]
    end
    Pool --> Router
    Router --> Client
    Router --> Obs["Observability:\nrouting decisions,\ncost, latency, outcomes"]
~~~

The router sits behind a single gateway interface so calling code never addresses a specific provider or model directly — this is the same "one stable interface, swappable backend" pattern used by load balancers and database connection poolers. Semantic caching (see the Semantic Caching skill) is checked before any model in the pool is touched, since a cache hit is strictly cheaper and faster than even the smallest model call.

### Component layout for an application built around routing

~~~text
llm-gateway/
├── router/
│   ├── signals.py          # cheap feature extraction: length, regex, metadata
│   ├── rules.py             # rule-based routing table
│   ├── classifier.py        # classifier-based routing (prompted or trained model)
│   ├── cascade.py           # confidence checks + escalation logic
│   └── policy.py            # combines rules/classifier/cascade into one decision
├── providers/
│   ├── openai_client.py
│   ├── anthropic_client.py
│   └── self_hosted_client.py   # e.g. vLLM/Ollama/SGLang-served open-weight models
├── cache/
│   └── semantic_cache.py    # embedding-based lookup before any model call
├── observability/
│   ├── logging.py           # structured logs of every routing decision
│   └── metrics.py           # cost/latency/quality per tier, per route reason
└── config/
    └── model_pool.yaml      # declarative list of models, costs, context windows, tiers
~~~

Rules to enforce: the routing policy module never imports a provider client directly (it returns a tier/model name, not a response); provider clients are interchangeable behind a common call signature; the model pool configuration is data, not code, so adding or retiring a model is a config change, not a redeploy of routing logic.
`,

  "data-flow": `
Tracing one request end to end through a routing layer, including the fallback/escalation path:

~~~mermaid
sequenceDiagram
    participant U as User/App
    participant GW as Gateway
    participant R as Router
    participant Cch as Semantic Cache
    participant Sm as Small Model
    participant Lg as Frontier Model
    participant Obs as Observability

    U->>GW: request (text, metadata)
    GW->>Cch: check for near-duplicate cached answer
    Cch-->>GW: miss
    GW->>R: extract signals + classify complexity
    R->>R: hard-constraint filter (context, tools)
    R->>R: select tier: "small" (estimated simple)
    R->>Sm: call small model
    Sm-->>R: draft answer
    R->>R: confidence/quality check
    alt check fails
        R->>Lg: escalate — call frontier model
        Lg-->>R: strong answer
        R->>Obs: log escalation event + reason
    else check passes
        R->>Obs: log tier=small, no escalation
    end
    R-->>GW: final answer
    GW->>Cch: store answer for future near-duplicates
    GW-->>U: response
~~~

The most misunderstood part of this flow is that the routing decision and the escalation decision are two distinct checkpoints, not one. The first checkpoint (which tier to try first) happens before any model call and is informed only by static or classifier signals; the second checkpoint (whether to escalate) happens after a real model call and is informed by the actual output quality. A router that only implements the first checkpoint (pure classifier-based routing with no cascade) will systematically fail on cases the classifier misjudged as simple; a router that only implements the second (pure cascade, always starting cheap) pays the latency cost of the cheap attempt on every single request, even ones an obvious rule could have routed straight to the frontier model. Mature systems run both checkpoints together — classify first to skip the cheap attempt for obviously-hard requests, cascade to catch misclassifications on the rest.
`,

  "production-usage": `
### How real routing layers are configured

Production teams keep the model pool as external, versioned configuration rather than inline code, so operational changes (a provider raises prices, a new model version ships, a provider has an outage) do not require a code deploy.

~~~yaml
# model_pool.yaml — declarative, hot-reloadable model pool config
tiers:
  small:
    provider: openai
    model: gpt-4o-mini
    cost_per_1k_output: 0.0006
    context_window: 128000
    supports_tools: true
    typical_ttft_ms: 250
  mid:
    provider: anthropic
    model: claude-haiku
    cost_per_1k_output: 0.004
    context_window: 200000
    supports_tools: true
    typical_ttft_ms: 400
  frontier:
    provider: anthropic
    model: claude-opus
    cost_per_1k_output: 0.075
    context_window: 200000
    supports_tools: true
    typical_ttft_ms: 900
  code:
    provider: self_hosted   # served via vLLM/SGLang — see those skills
    model: qwen2.5-coder-32b
    cost_per_1k_output: 0.0002
    context_window: 32000
    supports_tools: false
routing_policy: cascade_with_classifier
escalation_confidence_threshold: 0.7
fallback_provider_on_outage: openai
~~~

### Operational defaults mature teams converge on

- **Routing tiers are named abstractly** ("small"/"mid"/"frontier"/"code"), never as literal provider model strings in application code — this is what lets a provider's model version bump or a full provider swap happen without touching callers.
- **Every routing decision is logged with its inputs** — the signals that led to the choice — not just the choice itself, so a bad routing outcome can be traced back to why the router thought that tier was right.
- **Escalation is capped**, both in depth (never escalate more than once per request in most designs — escalate straight to the strongest safe option rather than stepping tier by tier) and in cost (a per-request or per-session budget ceiling that forces a cheaper tier if exceeded).
- **Prompt variants are versioned per tier** (see the Prompt Versioning skill) so a routing change and a prompt change are never silently conflated when debugging a quality regression.
- **A/B or shadow-routing** is standard before rolling out a new routing policy: run the new policy's decisions in parallel with the old one on a sample of live traffic, compare cost and quality, without actually serving the new policy's chosen model to users, until confidence is established.
`,

  "industry-examples": `
- **OpenAI and Anthropic API consumers building customer support copilots**: a very common pattern is routing simple FAQ-style questions to a small/fast model and routing anything involving account-specific multi-step troubleshooting or policy exceptions to a larger model, often with a rule-based first pass (detected intent) and a cascade safety net.
- **Coding assistant products** (the category that includes tools like GitHub Copilot-style assistants and various IDE plugins): route lightweight completions (single-line, boilerplate) to fast, cheap, often code-specialized models, while multi-file refactors, architecture questions, and long-context codebase reasoning route to frontier models — the latency requirement for inline autocomplete alone forces this split, independent of cost.
- **Unified LLM gateway / "model router" products** (the commercial category that emerged specifically to sell routing-as-a-service across OpenAI, Anthropic, Google, and open-weight models): their entire value proposition is doing exactly the routing, caching, and failover described on this page so individual product teams do not each rebuild it.
- **Search and RAG-heavy consumer products**: route a query-understanding/classification step to a small model, the actual answer-generation step to a mid or large model depending on how much retrieved context needs synthesis, and any final safety/compliance check to a separate specialized (often smaller, purpose-tuned) model — a single user query can touch three different tiers internally.
- **Enterprise AI platforms running mixed self-hosted and hosted models**: route requests that touch sensitive data to self-hosted open-weight models served via vLLM/SGLang for data-residency reasons, and route everything else to whichever hosted provider currently has the best cost/quality tradeoff — routing driven by compliance constraints, not just cost/latency/quality.

The pattern to notice across all of these: nobody treats routing as optional once traffic volume and model-price spread both grow past a small threshold — the ROI of even simple rule-based routing is usually realized within the first production month.
`,

  "best-practices": `
1. **Start with rule-based routing before building a classifier.** A few well-chosen heuristics (length, keyword/regex detection, explicit metadata) capture most of the easy wins and are far easier to debug than a learned model; only add classifier-based routing once you have evidence rules are misrouting a meaningful share of traffic.
2. **Fail toward quality, not toward savings, on ambiguous signals.** When a classifier's output is unexpected or a confidence check is borderline, default to the more capable tier — a wasted dollar is recoverable, a bad answer shown to a user often is not.
3. **Treat context length and tool-use support as hard filters, evaluated before cost/latency optimization.** A cheaper model that cannot fit the input or cannot reliably call the required tool is not a candidate at all, not just a lower-ranked one.
4. **Version prompts per model tier, not just per feature.** A prompt tuned for a frontier model routinely underperforms on a smaller model without its own tailored variant (see the Prompt Versioning skill).
5. **Cap escalation depth and cost per request.** Escalate at most once, straight to the appropriate stronger tier, rather than stepping through every tier in sequence — sequential escalation multiplies both latency and cost on the hardest requests.
6. **Log every routing decision with the signals that produced it**, not just the final model name, so quality regressions can be traced back to why the router made that call.
7. **Run new routing policies in shadow mode before serving them**, comparing cost and quality against the current policy on live traffic samples without exposing the new policy's choices to real users until validated.
8. **Check semantic cache before touching the model pool at all** (see the Semantic Caching skill) — a cache hit is strictly cheaper and faster than even your smallest model tier.
9. **Keep the routing decision function pure and side-effect-free**, separate from the code that actually calls a model — this is what makes routing logic unit-testable without hitting real APIs.
10. **Build failover across providers, not just across tiers.** A router that only escalates in capability but never fails over across providers is still a single point of failure during a provider outage.
11. **Re-evaluate routing thresholds whenever model prices or capabilities change.** Provider price cuts and new model releases shift the cost/quality Pareto frontier; a routing policy tuned six months ago may now be routing too conservatively or too aggressively.
12. **Keep the model pool as external configuration**, not inline code, so operational changes do not require a redeploy of routing logic itself.
`,

  "anti-patterns": `
### Routing purely by string length

~~~python
# WRONG: length is a weak, easily-gamed proxy for difficulty
def route_bad(text):
    return "small" if len(text) < 100 else "large"

# BETTER: combine multiple signals, and treat length as one weak input,
# not the sole determinant
def route_better(text, metadata):
    if metadata.get("requires_tools") or metadata.get("context_tokens", 0) > 100_000:
        return "large"   # hard constraint overrides any length heuristic
    if is_code_like(text):
        return "code"
    if len(text) < 100 and not looks_open_ended(text):
        return "small"
    return "mid"
~~~

"explain the halting problem" is short but hard; "please reformat this 3,000-word document into bullet points" is long but easy. Length alone consistently misroutes both directions.

### Other production-grade anti-patterns

- **Silently defaulting to the cheapest tier on classifier failure.** If the complexity classifier errors out or times out, some routers fall back to "small" to avoid blocking the request — this quietly converts every classifier outage into a quality outage. Fail toward the safer, more capable tier instead.
- **No confidence check on cascades — treating "the cheap model responded" as "the cheap model succeeded."** A cascade without a real quality check is not a cascade; it is just "always use the cheap model," with extra code.
- **Hard-coding literal provider model names throughout application code.** This makes swapping a model or provider a multi-file find-and-replace instead of a one-line config change, and it is the single most common reason routing logic becomes unmaintainable.
- **Escalating through every tier sequentially** (small → mid → large) instead of jumping straight to the appropriate stronger tier on escalation — this multiplies latency and cost on exactly the requests where both are already highest.
- **Sharing one prompt across all tiers.** Deploying the frontier-tuned prompt unchanged to the small-model tier and concluding "the small model just isn't good enough" when the real issue is prompt mismatch.
- **No logging of routing decisions**, only of final responses — when a quality complaint comes in, there is no way to tell which tier handled it or why, making the routing policy impossible to audit or improve.
- **Routing sophistication that outpaces the team's ability to debug it.** A five-signal learned router with silent fallback behavior that nobody on the team can explain in one sentence is a liability, not a feature — see Common Mistakes.
`,

  performance: `
### Measure the routing layer itself before optimizing model calls

~~~bash
# Instrument routing decision latency separately from model call latency —
# the two are easy to conflate and have very different optimization levers
router_decision_latency_ms   # should be single-digit to low-double-digit ms for rule-based routing
model_call_latency_ms        # dominated by the chosen model's own latency
~~~

A rule-based or lightweight-classifier router should add negligible latency (single-digit milliseconds); if your routing decision itself takes longer than the cheapest model call would have, the router has become the bottleneck it was meant to avoid.

### The optimization hierarchy for a routing layer, in order

1. **Cache before routing.** A semantic cache hit skips the router and every model call entirely — always the cheapest and fastest possible outcome (see the Semantic Caching skill).
2. **Cheap, deterministic signals before any model-based classification.** Regex/length/metadata checks cost microseconds; only fall through to a classifier model call for genuinely ambiguous requests.
3. **Batch classifier calls where possible.** If complexity classification is itself an LLM call, and traffic allows a small buffering window, batching several requests into one classifier call amortizes the classification overhead.
4. **Cap cascade depth.** Every additional escalation hop adds a full model call's worth of latency on top of the failed cheap attempt — one escalation hop is usually the right ceiling for interactive use cases.
5. **Prefer parallel confidence checks over sequential ones** when a check itself requires an extra call (e.g., a judge-model quality check) — run it concurrently with any post-processing rather than purely after.
6. **Warm and pin frequently-used small models** on self-hosted serving infrastructure (see the vLLM/SGLang skills) so the fast tier's latency advantage is not eroded by cold starts.

### Numbers worth internalizing

Frontier-model API latency (time to first token) is commonly several times that of a well-optimized small model; a cascade's wasted first attempt therefore typically costs tens to a few hundred milliseconds on the escalation path — usually still net-cheaper in total cost than routing every request straight to the frontier tier, but real and worth measuring on your own traffic rather than assuming.
`,

  scalability: `
Model routing scales the same way any stateless decision layer scales — horizontally, with its own bottleneck considerations distinct from the models it routes to.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> R1["Router instance 1"]
    LB --> R2["Router instance 2"]
    LB --> R3["Router instance N"]
    R1 & R2 & R3 --> Cache[("Shared semantic cache\n(Redis / vector store)")]
    R1 & R2 & R3 --> Pool["Multi-provider model pool"]
    R1 & R2 & R3 --> Metrics[("Shared metrics/logging store")]
~~~

### Single-instance scaling

The router itself should be stateless per request — any needed state (semantic cache, historical routing outcomes, per-tenant budget counters) lives in a shared store (Redis, a vector database, a metrics backend), not in router process memory. This lets you run any number of router instances behind a load balancer with no coordination between them.

### Beyond one instance

- **Shared cache and shared rate/budget counters**: if per-tenant cost budgets or rate limits inform routing (forcing a cheaper tier when a budget is near its cap), that counter must be shared across all router instances, not local to one — otherwise routing decisions become inconsistent depending on which instance handled the request.
- **Provider-side rate limits are the real ceiling**, not the router. A router can decide "call the frontier model" far faster than the frontier provider can actually serve requests during a spike; production routers need to track per-provider rate-limit headroom and route around a provider that is close to its limit, not just around one that is fully down.
- **Classifier-based routing at very high volume**: if complexity classification itself uses an LLM call, that call's own throughput becomes a scaling bottleneck; teams at high volume often replace a prompted-LLM classifier with a small, dedicated, self-hosted classification model precisely to remove this dependency.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Classifier LLM call throughput at high volume | Replace with a small dedicated/self-hosted classifier, or a non-LLM model |
| Per-tenant budget enforcement across instances | Shared counter store (Redis) with atomic increment/check |
| Provider-side rate limiting during traffic spikes | Track headroom per provider; route around near-limit providers before they fail |
| Shared semantic cache becoming a hot spot | Shard by embedding cluster or tenant; standard cache-scaling techniques apply |
`,

  security: `
### Routing-specific attack surface

1. **Prompt injection influencing routing decisions.** If routing signals are derived from untrusted request content (e.g., a user-supplied "complexity hint" field, or text that a naive router parses for keywords like "urgent" or "simple"), an attacker can manipulate the router into sending a request to a weaker, less-scrutinized model tier to evade safety checks that only the stronger tier enforces, or conversely force expensive frontier-tier calls to run up cost (a routing-layer denial-of-wallet attack). Never let user-controlled fields directly select a model tier without validation; treat routing hints as advisory signals subject to server-side policy, not authoritative instructions.
2. **Data residency and cross-provider leakage.** Routing across multiple providers means request content physically leaves your infrastructure to different companies' servers. A router that is unaware of data classification can send sensitive content to a provider or region that violates compliance requirements. Routing policy must treat data sensitivity as a hard filter — comparable to context-length or tool-support filtering — restricting sensitive requests to approved (often self-hosted) tiers only.
3. **Cost-based denial of service.** An attacker who discovers how to reliably trigger escalation (e.g., by phrasing requests to always fail the cheap tier's confidence check) can force every request onto the most expensive tier, inflating cost. Rate-limit and budget-cap escalation paths per tenant/session, and monitor escalation-rate anomalies as a security signal, not only a cost signal.
4. **Provider credential sprawl.** A multi-provider router necessarily holds API keys/credentials for every provider in the pool — a larger secret-management surface than a single-provider system. Store and rotate these via a secrets manager (see the Secrets Management skill), never inline in routing configuration.

### Defenses

- Validate and sanitize any routing signal derived from user input before it influences tier selection; never trust a client-supplied "tier" field without server-side policy checks layered on top.
- Apply data-classification-aware hard filters in the router, identical in mechanism to context-length filtering, before cost/latency optimization runs.
- Monitor escalation rate per tenant and alert on anomalies — a sudden spike in cascade escalations from one source is both a cost risk and a potential probing/attack signal.
- Rotate and scope provider credentials narrowly (least privilege per provider), and audit which router instances/environments hold which keys.

See the dedicated **Prompt Injection**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond routing-specific concerns.
`,

  testing: `
Because the routing decision function should be pure (signals in, tier out), it is straightforwardly unit-testable without ever calling a real model.

~~~python
import pytest
from router.policy import rule_based_route

def test_short_factual_query_routes_small():
    request = {"message": "What is the capital of France?"}
    assert rule_based_route(request) == "small"

def test_code_snippet_routes_to_code_tier():
    request = {"message": "def foo():\\n    return 1\\n\\nWhy does this fail?"}
    assert rule_based_route(request) == "code-specialized"

@pytest.mark.parametrize("message,expected", [
    ("hi", "small"),
    ("Explain the tradeoffs of eventual consistency in distributed databases " * 10, "mid"),
])
def test_length_based_fallback(message, expected):
    assert rule_based_route({"message": message}) == expected

def test_forced_tier_override_always_wins():
    request = {"message": "anything", "force_tier": "frontier"}
    assert rule_based_route(request) == "frontier"
~~~

### Testing the cascade/escalation path

~~~python
def test_cascade_escalates_on_low_confidence(monkeypatch):
    """Fake the cheap model's response to force the confidence check to fail,
    then assert escalation actually happened — without calling any real API."""
    monkeypatch.setattr("router.cascade.call_model",
                         lambda tier, req: "I'm not sure" if tier == "small" else "42")
    result = cascade_route("hard question")
    assert result == "42"   # came from the escalated frontier call, not the cheap one
~~~

### Senior testing doctrine for routing

- Test the routing decision function in isolation from provider calls — fakes/stubs for "call_model," never real network calls, in unit tests.
- Separately, run periodic **shadow evaluations**: replay a sample of real traffic through a candidate routing policy change and compare resulting cost and quality (via an evaluator, see the Evaluation skill) against the current policy, before rolling the change out.
- Test the failure-toward-quality property explicitly: assert that malformed or unexpected classifier output routes to the safer tier, not the cheaper one — this is exactly the kind of property that regresses silently if untested.
- Test hard constraint filtering (context length, tool support) as its own suite, independent from cost/latency optimization tests, since a bug here causes outright failures rather than just suboptimal cost.
`,

  debugging: `
### The escalation-order toolbox

1. **Read the routing decision log first, not the model's response.** A confusing or wrong answer is often explained entirely by "the router picked the wrong tier for this request" — check the logged signals and chosen tier before assuming the model itself is at fault.
2. **Reproduce with the routing function in isolation.** Feed the exact logged request and metadata into the routing decision function directly (no model call) to confirm whether the tier choice itself was wrong, or whether the chosen model then produced a bad answer despite a correct routing choice — these are different bugs with different fixes.
3. **Check whether a cascade escalation fired, and why.** If escalation logging shows a request escalated when it should not have (or failed to escalate when it should have), inspect the confidence check function directly against the cheap model's actual logged output.
4. **Check for prompt-tier mismatch.** If a small-tier model's answers look unexpectedly bad, verify it received its own tuned prompt variant and not the frontier-tier prompt (see the Prompt Versioning skill) — this is one of the most common "the model seems dumb" reports that is actually a routing/prompt wiring bug.
5. **Check provider-side status and rate limits.** A router that appears to be misrouting everything to one tier may actually be failing over due to a provider outage or rate-limit response from its preferred tier — check provider status pages and rate-limit response logs before assuming a routing logic bug.
6. **Diff routing policy versions.** If a regression coincides with a routing policy or model-pool config change, diff the config directly — most real-world routing regressions trace to a threshold, model-pool entry, or prompt-variant change, not a logic bug in the router code itself.

### Debugging a suspected classifier-based router failure

~~~text
1. Pull the exact request text and metadata from logs.
2. Re-run it through classify_complexity() directly, logging the raw model output
   (not just the parsed verdict) — malformed output is the most common cause of
   misclassification.
3. Compare against the fallback-on-unknown-output behavior: did it correctly default
   to the safer tier, or did a parsing bug cause a silent wrong default?
~~~
`,

  monitoring: `
Production visibility into a routing layer rests on tracking the decision and the outcome together — monitoring only model-level metrics (as if there were one model) hides exactly the information routing exists to manage.

### Structured logging of every decision

~~~python
import structlog

log = structlog.get_logger()

log.info(
    "routing_decision",
    request_id=request_id,
    signals={"length": len(text), "detected_code": is_code, "context_tokens": ctx_tokens},
    chosen_tier="small",
    routing_strategy="cascade_with_classifier",
    escalated=False,
    latency_ms=elapsed_ms,
    cost_usd=estimated_cost,
)
~~~

Every field here matters for a later debugging or auditing session: the signals explain WHY the tier was chosen, the strategy explains HOW, and escalated/latency/cost let you reconstruct the tradeoff that was actually made for this specific request.

### Metrics to track per tier and per route reason

- **Request volume per tier** — confirms the routing distribution matches expectations (if "frontier" is receiving 80% of traffic, the routing policy is not doing its job).
- **Escalation rate** in cascade systems — a rising escalation rate signals either genuinely harder incoming traffic or a regression in the cheap tier's quality (a model version change, a prompt regression).
- **Cost per tier and total blended cost per request** — the single number that proves routing is paying for itself versus a naive single-model baseline.
- **Quality/outcome per tier**, from whatever evaluator or user-feedback signal is available (see the Evaluation skill) — routing without a quality feedback loop can silently drift toward "cheap but wrong" without anyone noticing until user complaints arrive.
- **Latency per tier and end-to-end, including router overhead itself.**

### The specific failure mode to watch for

Routing logic itself becoming a silent quality bottleneck: because a router's job is to make LLM calls invisible and automatic, a routing bug (a misconfigured threshold, a stale model-pool entry, a broken confidence check) degrades quality without throwing any error — there is no exception, no failed request, just a steadily worse answer distribution. The only way to catch this is dedicated monitoring on the tier distribution and per-tier outcome quality over time, treated as a first-class production metric, not an afterthought bolted onto general LLM monitoring.
`,

  deployment: `
### A routing layer's deployment surface is mostly configuration, not code

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ src/

# ---- runtime stage ----
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
COPY config/model_pool.yaml /app/config/model_pool.yaml
ENV PATH="/app/.venv/bin:$PATH"
# Provider credentials injected at runtime, never baked into the image
# (see the Secrets Management skill) — this image holds routing LOGIC only.
CMD ["uvicorn", "gateway.main:app", "--host", "0.0.0.0", "--port", "8080"]
~~~

Why each choice matters: the model pool config is copied in as data (not compiled into code) so that adding a model tier or changing a cost figure does not require rebuilding the image; credentials are injected at runtime via the platform's secret store rather than baked in, since a routing gateway typically holds credentials for several providers at once and image layers can leak.

### Deployment topology considerations specific to routing

- **The router and the semantic cache should scale independently** from any self-hosted model tier — the router is lightweight and CPU-bound; a self-hosted model tier (see the vLLM/SGLang skills) is GPU-bound and scales on entirely different economics.
- **Rolling out a routing policy change should be gradual**, ideally behind the same kind of canary/percentage rollout used for any other production logic change — a bad routing threshold pushed to 100% of traffic instantly changes the cost and quality profile of the entire system.
- **Config hot-reload** (or at minimum, a fast redeploy path) for the model-pool file is valuable operationally, since provider price changes and outages need a fast response — you do not want a full CI/CD pipeline between "provider X is down" and "traffic fails over."
- **Health checks should include provider reachability**, not just the router process being up — a router that reports healthy while its only configured provider is down for two tiers is a false positive on the exact failure mode routing failover exists to catch.
`,

  "production-checklist": `
Before a model routing layer takes real traffic:

- [ ] Model pool defined as external, versioned configuration (not hard-coded model names in application code)
- [ ] Hard constraint filters implemented for context length and tool/structured-output support, evaluated before cost optimization
- [ ] Rule-based routing covers the obvious, high-volume cases (explicit overrides, code detection, length-based defaults)
- [ ] Classifier or cascade logic in place for the ambiguous middle, with a documented fallback that defaults to the safer/more capable tier on unexpected output
- [ ] Confidence/quality check for any cascade escalation path is real (structural validation, refusal detection, or judge-model check) — not just "the model responded"
- [ ] Escalation depth capped (at most one hop in most designs) and per-request/session cost budget enforced
- [ ] Semantic cache checked before any model in the pool is called
- [ ] Prompt variants versioned per model tier, not shared blindly across tiers
- [ ] Provider failover configured for outage/rate-limit conditions, tested against a simulated provider failure
- [ ] Structured logging of every routing decision (signals, chosen tier, escalation, latency, cost)
- [ ] Metrics dashboards for tier distribution, escalation rate, cost per tier, and per-tier outcome quality
- [ ] Shadow-mode testing completed for the current routing policy before it was promoted to full traffic
- [ ] Provider credentials stored in a secrets manager, scoped per provider, rotated on a schedule
- [ ] Data-classification-aware routing filters in place for any sensitive-content restrictions
- [ ] Runbook exists for "a provider is down" and "cost has spiked unexpectedly," each traceable via the routing decision logs
`,

  "common-mistakes": `
1. **Routing by a single weak proxy (length) instead of combining signals** — produces predictable, embarrassing misroutes on short-but-hard and long-but-easy requests.
2. **No confidence check behind a cascade** — a cascade without a real quality gate is just "always call the cheap model," silently.
3. **Defaulting to the cheap tier on classifier failure** — turns every classifier hiccup into a quality regression instead of a cost blip; should default to the safer tier instead.
4. **Sharing one prompt across all tiers** — the most common reason a small model "seems worse than it should," when the actual issue is the prompt was never adapted for it (see Prompt Versioning).
5. **Hard-coding literal provider/model names in application code** — turns every model swap into a multi-file change instead of a config edit.
6. **No logging of routing decisions, only of final responses** — makes quality complaints impossible to root-cause back to a specific tier or reason.
7. **Escalating through every tier sequentially instead of jumping to the right stronger tier** — multiplies latency and cost precisely on the hardest, most escalation-prone requests.
8. **Ignoring provider-side rate limits when choosing a tier** — a router that always wants the frontier model on hard requests can itself trigger provider throttling during traffic spikes if it does not track headroom.
9. **Treating routing as "set it and forget it"** — provider pricing and model capability shift continuously; a threshold tuned once and never revisited drifts off the cost/quality Pareto frontier over months.
10. **Over-engineering the router before evidence justifies it** — building a trained classifier and multi-signal decision table before simple rule-based routing has even been measured against a single-model baseline; complexity should be earned by demonstrated misrouting, not assumed upfront.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| All traffic silently lands on one tier | A misconfigured rule, a classifier always returning the same label, or a hard-constraint filter eliminating every candidate but one | Check routing decision logs for the signals feeding the decision; unit test the routing function directly against known inputs |
| Escalation rate near 100% | Confidence check is too strict, or the cheap tier's model/prompt regressed | Log raw cheap-tier output alongside the confidence verdict; compare against a known-good baseline |
| Escalation rate near 0% despite known hard traffic | Confidence check is too lenient, or hard requests are being misclassified as simple upstream | Audit classifier output on a sample of known-hard requests; tighten the check |
| Small-tier answers noticeably worse than expected | Prompt not adapted for the smaller model (shared prompt across tiers) | Create and version a tier-specific prompt variant |
| Cost spike with no traffic volume increase | Routing thresholds drifted, or a provider price change was not reflected in the model-pool config | Re-pull current provider pricing into config; re-check thresholds against the updated cost/quality frontier |
| Requests failing outright instead of routing around an outage | No provider failover configured, or failover only covers within-tier not cross-provider | Add explicit cross-provider failover for each tier, tested against a simulated outage |
| Routing decisions inconsistent across instances for the same tenant | Per-tenant budget/rate state kept in router process memory instead of a shared store | Move counters to a shared store (Redis) with atomic operations |
| Router itself adds noticeable latency | Classifier is an LLM call on every request with no batching or caching of repeated signals | Move to a lightweight/self-hosted classifier, or batch classifier calls where traffic allows |

The habit that matters: treat a routing anomaly as a two-part question — was the DECISION wrong (check signals and logic), or was the decision RIGHT but the chosen model's OUTPUT wrong (check the model/prompt) — these require different fixes and conflating them wastes debugging time.
`,

  faqs: `
**Q: Do I need routing if I only use one provider?**
Often yes — most providers offer multiple model sizes/tiers themselves, so single-provider routing (choosing among that provider's small/medium/large models) still captures most of the cost and latency benefit, even without multi-provider complexity.

**Q: Is routing only about saving money?**
No — cost is the most visible axis, but latency-aware routing (fastest model for an SLA-bound feature) and reliability/failover routing (avoiding a single point of provider failure) are equally production-critical and sometimes matter more than cost for user-facing latency-sensitive features.

**Q: Rule-based, classifier-based, or cascade — which should I build first?**
Rule-based, almost always. It requires no training data, is fully debuggable, and typically captures the majority of easy wins. Add a classifier or cascade only once you have evidence (from logs or evals) that rules are misrouting a meaningful share of traffic.

**Q: How is routing different from semantic caching?**
They are complementary, not competing. Semantic caching avoids calling any model at all for a repeated or near-duplicate query; routing decides which model to call for the queries that do need a real inference call. A mature system checks the cache first, then routes. See the Semantic Caching skill.

**Q: Does routing across multiple providers actually save money in practice, or does the abstraction layer eat the gains?**
It generally saves money, but the abstraction has a real cost: building to a lowest-common-denominator interface across providers means losing access to provider-specific features (a particular structured-output mode, a specific tool-calling format, a unique context-caching mechanism) that only exist on one provider's API. Teams should quantify both sides — the savings from routing versus the capability lost by abstracting — rather than assuming multi-provider routing is free.

**Q: How do I know if my routing policy is actually working?**
Track blended cost per request and per-tier outcome quality over time, and compare both against a single-model baseline on the same traffic. If blended cost is meaningfully lower and per-tier quality metrics are stable or improving, the policy is earning its complexity; if quality is silently degrading on the cheaper tiers, the routing thresholds need retuning.

**Q: Should routing logic be sophisticated (learned, multi-signal) or simple?**
Only as sophisticated as your team can debug. A learned router with silent fallback behavior nobody can explain in a sentence is a liability. The tradeoff between routing sophistication and system debuggability is a real, ongoing design decision, not a one-time choice — see Advanced Concepts and Monitoring.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What problem does model routing solve?* It matches request cost/latency/quality needs to the right model instead of sending every request to a single fixed model — avoiding both overspending on easy requests and underspending (quality failures) on hard ones.
2. *Name the core routing decision axes.* Cost, latency, quality/capability needed, context length required, and specific tool-use/structured-output support.
3. *What is rule-based routing?* Routing decided by explicit, cheap-to-compute heuristics (length, keyword/regex detection, request metadata) without calling any model to make the decision itself.
4. *What is cascade routing?* Try a cheap model first; escalate to a stronger model only if the cheap model's output fails a confidence or quality check.
5. *Why shouldn't a router default to the cheapest tier when a classifier's output is unexpected?* Because a wasted dollar on an over-capable model is recoverable, but a wrong answer shown to a user (from an under-capable model) often is not — routers should fail toward quality, not toward savings.

**Senior:**

6. *Design a routing layer for a support copilot handling FAQ questions and complex account troubleshooting.* Cover: signal extraction (intent detection, length), hard filters (does the request need tool calls to look up account data), tier selection (small for FAQ, frontier for multi-step troubleshooting), a cascade safety net with a real confidence check, per-tier prompt variants, and observability on tier distribution and escalation rate.
7. *What is the tradeoff of building a multi-provider abstraction layer for routing?* Gains: cost optimization, redundancy against outages, capability diversity. Cost: a lowest-common-denominator interface loses provider-specific features (unique structured-output modes, provider-specific tool-calling formats, provider-specific caching mechanisms) — strong answers name specific lost capabilities, not just "some flexibility is lost."
8. *How would you build a confidence check for a cascade if the provider does not expose log-probabilities?* Combine structural validation (did required JSON parse, do expected fields exist), refusal/uncertainty phrase detection, and — for high-stakes cases — an independent judge-model check; rank these by reliability and cost, and explain why structural validation is both cheapest and most reliable when applicable.
9. *How do you prevent routing logic itself from becoming a silent quality bottleneck?* Dedicated monitoring on tier distribution and per-tier outcome quality over time (not just aggregate model metrics), shadow-mode testing before rolling out policy changes, and treating a routing regression as invisible-by-default unless specifically instrumented for.
10. *When would you NOT build a learned/classifier-based router, and just stick with rules?* When traffic volume or price spread does not justify the added complexity and debugging burden, or when the team lacks the evaluation infrastructure to validate a learned router's decisions — routing sophistication should be earned by demonstrated misrouting, not assumed.
11. *How does routing interact with prompt versioning?* A model swap is rarely prompt-neutral; different tiers often need their own tuned prompt variant (formatting, few-shot examples, instruction explicitness), and routing systems that share one prompt across tiers commonly misattribute prompt-mismatch quality issues to model capability.
12. *Design a failover strategy for a provider outage mid-traffic.* Detect via error rate/timeout monitoring on the affected provider, redirect new requests to a configured backup provider offering an equivalent-tier model, alert on the failover event, and track cost/quality impact of running on the fallback provider until the primary recovers.
`,

  "coding-questions": `
### 1. Rule-based router with hard constraint filtering (tests decision-table thinking)

~~~python
from dataclasses import dataclass

@dataclass
class ModelSpec:
    name: str
    cost_per_1k_out: float
    context_window: int
    supports_tools: bool

POOL = {
    "small": ModelSpec("gpt-4o-mini", 0.0006, 128_000, True),
    "mid":   ModelSpec("gpt-4o",      0.010,  128_000, True),
    "large": ModelSpec("claude-opus", 0.075,  200_000, True),
}

def route(text: str, needs_tools: bool, context_tokens: int) -> str:
    """Filter by hard constraints first, THEN pick cheapest qualifying tier."""
    candidates = [
        tier for tier, spec in POOL.items()
        if spec.context_window >= context_tokens
        and (not needs_tools or spec.supports_tools)
    ]
    if not candidates:
        # No model can serve this request — a real system would raise or
        # queue for a larger/custom model rather than silently degrade.
        raise ValueError("No model in the pool satisfies these constraints")

    # Among qualifying candidates, prefer the cheapest UNLESS the request
    # looks complex (a simple length heuristic for this exercise).
    if len(text.split()) > 150:
        return max(candidates, key=lambda t: POOL[t].cost_per_1k_out)  # most capable
    return min(candidates, key=lambda t: POOL[t].cost_per_1k_out)      # cheapest
~~~

Complexity: O(number of tiers) per call — trivial, since the whole point is that this decision must be cheap. Follow-up: extend to weight cost against a per-tier historical accuracy score rather than a pure length heuristic.

### 2. Cascade with a structural confidence check (tests error handling + escalation logic)

~~~python
import json

def cascade_json_extraction(text: str) -> dict:
    """Try the cheap model for structured extraction; escalate only if the
    output fails to parse as valid JSON matching the expected schema."""
    cheap_output = call_model("small", build_extraction_prompt(text))

    try:
        parsed = json.loads(cheap_output)
        if "name" in parsed and "amount" in parsed:
            return parsed          # structural check passed — no escalation needed
    except json.JSONDecodeError:
        pass   # fall through to escalation; do not raise here

    # Escalate: cheap tier failed the structural check
    strong_output = call_model("large", build_extraction_prompt(text))
    parsed = json.loads(strong_output)   # let this raise — a frontier-model
                                          # parse failure is a real error to surface
    log_escalation(text, reason="cheap_tier_invalid_json")
    return parsed
~~~

Complexity: O(1) model calls in the common case, O(2) on escalation. Follow-up: they'll ask how to avoid escalating forever if the frontier model ALSO fails the check — answer: cap at one escalation and raise/alert rather than looping.

### 3. Weighted tier selection under a per-session budget (production-flavored)

~~~python
class BudgetAwareRouter:
    """Forces a cheaper tier once a session's spend approaches its cap —
    a circuit breaker pattern applied to cost instead of failure rate."""
    def __init__(self, session_budget_usd: float):
        self.budget = session_budget_usd
        self.spent = 0.0

    def route(self, preferred_tier: str, estimated_cost: dict[str, float]) -> str:
        if self.spent + estimated_cost[preferred_tier] <= self.budget:
            return preferred_tier
        # Preferred tier would blow the budget — degrade to the cheapest
        # tier that still fits, rather than failing the request outright.
        affordable = [t for t, c in estimated_cost.items()
                      if self.spent + c <= self.budget]
        if not affordable:
            raise RuntimeError("Session budget exhausted — no tier fits")
        return min(affordable, key=lambda t: estimated_cost[t])

    def record_spend(self, tier: str, actual_cost: float) -> None:
        self.spent += actual_cost
~~~

Discussion points: how this interacts with a cascade (an escalation that would blow the budget should be blocked, logged, and surfaced rather than silently happening), and how per-tenant budgets need shared state (Redis) across router instances in a horizontally scaled deployment.
`,

  "hands-on-labs": `
### Lab 1 — Rule-based router (beginner, about 1.5h)
Build a router that accepts a request dict (text + metadata) and returns a tier name using only cheap heuristics: length, a regex for code detection, and an explicit override field. Write unit tests for at least 6 distinct input cases. Deliverable: the routing function plus its test suite, with no real model calls involved. Skills: signal extraction, pure decision functions, unit testing without network dependencies.

### Lab 2 — Cascade with a real confidence check (intermediate, about 2.5h)
Using any two real model tiers (a small and a large model from a provider you have access to), implement cascade routing for a structured-extraction task (extract name/date/amount from free text as JSON). The confidence check must be structural (does the cheap tier's output parse as valid JSON matching the schema). Log every escalation with its reason. Deliverable: a report showing the escalation rate on a sample of at least 30 varied inputs, and the blended cost versus an always-frontier baseline. Skills: cascade logic, structural validation, cost measurement.

### Lab 3 — Multi-provider routing with failover (advanced, about 4h)
Build a router spanning at least two providers (or one provider plus a self-hosted model via Ollama/vLLM — see those skills) with a declared model-pool config file, hard constraint filtering (context length, tool support), and provider failover triggered by a simulated timeout/error on the primary provider. Deliverable: a demonstration that killing access to the primary provider mid-run causes automatic failover with no dropped requests, plus a written note on which provider-specific features were lost by routing through a common interface. Skills: multi-provider abstraction, failover logic, config-driven architecture.

### Lab 4 — Instrument and monitor a routing layer (production, about 3h)
Take Lab 2 or 3's router, wrap it behind a small FastAPI gateway, add structured logging of every routing decision (signals, chosen tier, escalation, cost, latency), expose Prometheus-style metrics for tier distribution and escalation rate, and build a simple dashboard (even a script that prints a summary table) showing blended cost per request over a batch of test traffic compared to an always-frontier baseline. Skills: the full monitoring section applied end to end, tying routing decisions to measurable production outcomes.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-platform and LLMOps roles):

1. **Cost-aware LLM gateway** — A gateway service implementing rule-based routing, a cascade fallback with a real confidence check, semantic caching ahead of the model pool, and per-tenant budget enforcement. Demonstrates: routing architecture, cost engineering, and integration with a cache layer — directly relevant to LLMOps and platform-engineering roles.

2. **Multi-provider failover router** — A router spanning at least two hosted providers and one self-hosted model (via vLLM or Ollama), with declarative model-pool configuration, hard constraint filtering, and automatic failover tested against simulated provider outages. Include a written comparison of provider-specific features lost by the common abstraction layer. Demonstrates: multi-provider architecture, reliability engineering, and honest tradeoff analysis.

3. **Routing policy evaluator** — A tool that replays a labeled traffic sample through multiple candidate routing policies (a rule-based one, a classifier-based one, a cascade) and reports cost and quality (via an LLM-as-judge or rubric-based evaluator) for each, plotting the cost/quality Pareto frontier across policies. Demonstrates: evaluation-driven routing design, the exact workflow real teams use before promoting a routing policy change to production.

Each project: config-driven model pool, structured logging of every routing decision, a test suite covering the routing decision function in isolation from real model calls, and a README explaining the cost/quality tradeoff the routing policy achieves versus a single-model baseline — that comparison is what makes a routing project credible to a senior interviewer.
`,

  "case-studies": `
### Support copilots: routing by intent before routing by difficulty
A common pattern across customer-support AI products is a two-stage split: an intent classifier (often a small, fast model or even a non-LLM classifier) first determines whether a request is a known FAQ pattern or an open-ended account issue, and only the latter gets routed into a difficulty-based cascade toward larger models. Lesson: routing decisions do not have to be single-stage — intent-based routing and difficulty-based routing solve different problems and are often layered.

### Coding assistants: latency forces routing independent of cost
Inline code-completion features route to fast, often smaller or code-specialized models purely because of latency requirements — a completion that arrives after the developer has already typed past it is useless regardless of its quality. Meanwhile, multi-file refactor or "explain this codebase" requests in the same product route to frontier models because the interaction is not latency-sensitive in the same way. Lesson: latency-aware routing and quality-aware routing can point in genuinely different directions for the same product, requiring separate routing policies per feature within one application, not one global policy.

### The rise of dedicated "model gateway" products
The emergence of commercial products whose entire value proposition is unified multi-provider routing, caching, and failover reflects how quickly routing went from "something one team built as an internal tool" to "infrastructure worth buying rather than building" once enough companies independently rebuilt the same cascade-and-fallback logic. Lesson: routing is now recognized as a distinct infrastructure layer, comparable to a load balancer or API gateway, not a one-off feature of any single LLM product.

### Cascade routing research formalizing an intuitive practice
Academic and industry work on "LLM cascades" took a pattern many teams were already doing informally (try cheap, escalate on failure) and gave it a rigorous framing — defining confidence thresholds, quantifying the cost/quality tradeoff curve, and comparing cascade routing against single-model and classifier-based baselines. Lesson: a genuinely simple engineering idea (try the cheap thing first) can still benefit enormously from formal analysis once it is deployed at scale, because the confidence-threshold tuning is where most of the real value or waste lives.
`,

  comparisons: `
| Dimension | Rule-based routing | Classifier-based routing | Cascade routing | No routing (single model) |
|-----------|--------------------|--------------------------|------------------|-----------------------------|
| Setup cost | Very low | Medium (needs a classifier, prompted or trained) | Low-medium (needs a confidence check) | None |
| Debuggability | Highest — every decision traces to a readable condition | Medium — depends on classifier transparency | Medium — depends on confidence-check quality | Trivial (nothing to debug) |
| Handles nuanced difficulty | Poorly (proxies only) | Well, if classifier is well-tuned | Well, since real model output informs the decision | N/A |
| Added latency | Near zero | Small (classifier call) unless self-hosted/cheap | Only on escalation path | None |
| Cost efficiency | Good for obvious cases | Best when tuned on real traffic | Good; wastes a little on escalation attempts | Worst, if using a frontier model for everything |
| Failure mode when wrong | Misroutes obvious edge cases | Misroutes on classifier blind spots | Escalates too much/little if confidence check is miscalibrated | No misrouting risk, but no cost/latency benefit either |

**How seniors choose**: start with rule-based routing and measure against a single-model baseline; add a cascade once you have a genuine, cheap confidence signal available; add classifier-based routing only once traffic volume and price spread justify the added complexity and you have the evaluation infrastructure to validate it. Most mature production systems layer all three — rules for the obvious cases, a classifier or cascade for the ambiguous middle — rather than picking exactly one strategy.
`,

  "related-technologies": `
- **LLMOps** — the broader lifecycle model routing sits inside: versioning, deployment, and monitoring of LLM-backed features, of which routing is one component.
- **Prompt Versioning** — a routed model frequently needs its own tuned prompt variant; routing and prompt versioning are usually built and changed together.
- **Cost Optimization** and **Latency** — the two production goals routing most directly serves; routing is one of the primary levers for both.
- **Semantic Caching** — the complementary technique that avoids calling any model at all for repeat or near-duplicate queries, checked before routing runs.
- **vLLM**, **Ollama**, and **SGLang** — the serving layer routing sits in front of when routing includes self-hosted, open-weight model tiers.
- **Evaluation** and **AI Evals** — how routing quality tradeoffs actually get measured; a routing policy without an evaluation signal is unvalidated by definition.
- **Secrets Management** — multi-provider routing means holding credentials for every provider in the pool, widening the secret-management surface.

On this platform, a natural learning path: **LLMOps** → **Prompt Versioning** → **Model Routing** (this page) → **Semantic Caching** → **Cost Optimization** / **Latency** → the serving-layer skills (**vLLM**, **Ollama**, **SGLang**) for teams adding self-hosted tiers to their model pool.
`,

  "latest-updates": `
Knowledge cutoff for this page is January 2026; treat anything below as accurate as of that point and verify current provider offerings and pricing directly before making cost-sensitive decisions, since model pricing and lineups change frequently.

As of this cutoff: every major hosted LLM provider offers multiple model sizes explicitly positioned for cost-tiered routing (small/fast, mid-size general-purpose, and frontier tiers), open-source routing frameworks exist that formalize learned, classifier-based routing as a swappable component, and commercial "model gateway" products bundle routing, semantic caching, and multi-provider failover as standard, off-the-shelf features rather than custom-built infrastructure. Cascade/fallback routing (try cheap, escalate on low confidence) is well-established as both an academic framing and a common production pattern.

Directions actively developing at this cutoff: routing at the level of individual steps within an agentic pipeline (rather than only per top-level request) is becoming more common as agent frameworks mature; and routing policies that factor in real-time provider rate-limit headroom (not just cost/latency/quality) are increasingly treated as a first-class signal given how often popular frontier models experience demand-driven throttling.

Always verify current model pricing, context-window sizes, and tool-use support directly against each provider's own documentation before finalizing a routing policy — these are exactly the facts that go stale fastest and that this page will not attempt to hard-code precise current numbers for.
`,

  "future-roadmap": `
Where model routing is heading, and what is worth betting career time on:

- **Step-level and agent-level routing** will likely become the default rather than the exception — as agentic systems become the dominant application pattern, routing per sub-task within a single agent run (planning vs. tool-formatting vs. summarization, each potentially a different tier) is a more sophisticated and more valuable skill than simple per-request routing.
- **Learned routers will keep improving** as more production traffic generates the (request, model, outcome) data needed to train them well; expect routing-as-a-trained-model to become more common relative to hand-written classifier prompts, especially at high traffic volumes where classifier latency/cost matters.
- **Routing and evaluation infrastructure will converge further** — a routing policy is only as good as the quality signal used to validate it, and the tooling for evaluating routing decisions specifically (not just evaluating raw model outputs) is likely to mature into its own sub-discipline, closely tied to the Evaluation and AI Evals skills.
- **Provider-side routing features may reduce (but not eliminate) the need for custom routing layers** — as providers themselves offer more built-in tiering and even automatic model-selection features, some routing logic will move from application code into provider APIs, but multi-provider, cost-optimization, and failover use cases will keep custom routing layers relevant for the foreseeable future.
- **What to bet on**: the underlying skill of designing a good confidence/quality signal (the hardest and most durable part of routing) will remain valuable regardless of how the specific routing framework or provider landscape shifts — invest in evaluation literacy alongside routing mechanics, not in memorizing any one framework's API.
`,

  "cheat-sheet": `
~~~text
MODEL ROUTING — ESSENTIALS

Core idea: pick the right model per request, not one model for everything.
  Overspend risk:  always use frontier model  -> high cost, wasted on easy requests
  Underspend risk: always use cheap model     -> silent quality failures on hard requests

DECISION AXES (evaluate roughly in this order)
  1. Hard filters FIRST: context length required, tool/structured-output support needed
  2. Then optimize: cost, latency, quality/capability needed for the estimated difficulty

STRATEGIES
  Rule-based      : cheap heuristics (length, regex, metadata) -> tier. No model call needed.
  Classifier-based: small/cheap model predicts difficulty -> tier. Costs a little latency/$ upfront.
  Cascade/fallback: try cheap tier first; escalate to strong tier only if confidence check fails.
  Combine all three in production: rules for obvious cases, classifier/cascade for the ambiguous middle.

CONFIDENCE CHECK SIGNALS (most to least reliable, generally)
  structural validation (did JSON parse) > refusal/uncertainty detection >
  logprobs (if exposed) > independent judge-model check > downstream task success (too late for real-time)

FAIL TOWARD QUALITY
  Unknown classifier output or borderline confidence -> route to the SAFER, more capable tier.
  A wasted dollar is recoverable; a bad answer shown to a user often is not.

MULTI-PROVIDER ROUTING
  Gains: cost optimization, redundancy against outages, capability diversity.
  Cost: lowest-common-denominator interface loses provider-specific features.

COMPLEMENTARY TECHNIQUE
  Semantic caching: check BEFORE routing. A cache hit skips the model pool entirely.

PRODUCTION MUST-HAVES
  - Model pool as external config, never hard-coded model names in app code
  - Prompt versioned PER TIER, not shared across tiers
  - Cap escalation depth (usually one hop) and per-request/session cost budget
  - Log every routing decision: signals in, tier chosen, escalated?, latency, cost
  - Monitor tier distribution + per-tier outcome quality, not just aggregate model metrics
  - Provider failover on outage/rate-limit, tested against simulated failure

WATCH OUT FOR
  - Routing sophistication outpacing team's ability to debug it
  - Routing logic becoming a SILENT quality bottleneck (no exception thrown, just worse answers)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is model routing? | Dynamically choosing which model handles a given request instead of using one fixed model for everything. |
| What are the core routing decision axes? | Cost, latency, quality/capability needed, context length required, tool-use/structured-output support. |
| What is rule-based routing? | Routing decided by explicit, cheap heuristics (length, regex, metadata) with no model call needed to decide. |
| What is classifier-based routing? | Using a small, cheap model (or lightweight classifier) to predict which downstream model tier a request needs. |
| What is cascade/fallback routing? | Try a cheap model first; escalate to a stronger model only if the cheap model's output fails a confidence check. |
| Why fail toward quality on ambiguous routing signals? | A wasted dollar on an over-capable model is recoverable; a wrong answer shown to a user often is not. |
| What should be checked before cost/latency optimization in routing? | Hard constraints — context length required and tool/structured-output support — as filters, not preferences. |
| How does semantic caching relate to routing? | It is complementary: caching avoids calling any model at all for repeated/similar queries, checked before routing runs. |
| What is the main cost of multi-provider routing abstraction? | Losing provider-specific features behind a lowest-common-denominator interface. |
| Why should prompts be versioned per model tier? | A prompt tuned for a frontier model often underperforms on a smaller model without its own tailored variant. |
| What is the most reliable low-cost confidence check for structured outputs? | Structural validation — does the output actually parse and match the expected schema. |
| Why cap cascade escalation depth? | Each escalation hop adds a full model call's latency/cost on top of the failed attempt; capping avoids compounding this. |
| What is a silent routing failure mode to monitor for? | Routing logic degrading quality without throwing any error — no exception, just a steadily worse answer distribution. |
| What should trigger reliability/failover routing? | Provider outage or rate-limit responses, detected via error rate/timeout monitoring on that provider. |
| What is the tradeoff between routing sophistication and debuggability? | More signals/learned routers can improve accuracy but make failures harder to trace; complexity should be earned by evidence, not assumed. |
`,

  mcqs: `
**1. A router sends a short but conceptually hard question ("explain the halting problem") to the cheap tier because it used length as the only signal. What is the most direct fix?**
A) Remove the cheap tier entirely
B) Combine length with additional signals (keyword detection, a classifier, or a cascade confidence check)
C) Always route short requests to the frontier tier
D) Disable routing and use a single model

*Answer: B.* Length alone is a weak proxy for difficulty; combining signals or adding a cascade catches cases length misjudges, without discarding the cost benefits of routing entirely.

**2. A cascade router treats "the cheap model responded" as success, with no further check. What is wrong with this design?**
A) Nothing — a response means success
B) It is not actually a cascade — it is equivalent to always using the cheap model, since escalation never triggers
C) It will escalate too often
D) It violates provider terms of service

*Answer: B.* Without a real confidence/quality check, escalation never fires, so the "cascade" provides no quality safety net at all.

**3. A classifier-based router's complexity classifier returns an unexpected, unparseable label. What should the router do?**
A) Route to the small/cheap tier by default to control cost
B) Drop the request
C) Route to the safer, more capable tier by default
D) Retry the same classifier call indefinitely

*Answer: C.* Failing toward quality (the more capable tier) is safer than failing toward savings, since a wasted dollar is recoverable but a bad answer shown to a user often is not.

**4. What should be evaluated as a hard filter before cost/latency optimization in a routing decision?**
A) Provider brand preference
B) Context length required and tool/structured-output support
C) The time of day
D) The user's typing speed

*Answer: B.* A model that cannot fit the required context or cannot reliably perform required tool calls is disqualified outright, regardless of cost or latency advantages.

**5. Why is semantic caching described as complementary to, not a replacement for, model routing?**
A) They solve unrelated problems and never interact
B) Caching decides which model to call; routing decides whether to call one
C) Caching avoids calling any model for repeated/similar queries, while routing decides which model to use for the queries that do need a real inference call
D) Caching is only relevant for image models

*Answer: C.* A mature system checks the cache first (skipping the model pool entirely on a hit) and only routes the remaining, non-cached queries.

**6. What is the primary tradeoff of building a multi-provider routing abstraction layer?**
A) It always increases latency with no benefit
B) Cost/redundancy/capability gains versus losing provider-specific features behind a lowest-common-denominator interface
C) It is illegal under most provider terms of service
D) It requires no additional credential management

*Answer: B.* Multi-provider routing buys cost optimization, redundancy, and capability diversity, but the shared interface typically cannot expose every provider-specific feature, and it also expands the credential/secret-management surface.
`,

  "revision-notes": `
Model routing is the practice of choosing which model handles each request dynamically, instead of hard-coding one model for an entire system. It exists because a single fixed model cannot serve both ends of the traffic distribution well: sending everything to the most expensive, most capable model wastes money on the majority of requests that do not need it, while sending everything to the cheapest model risks silent quality failures on the minority of requests that genuinely need deep reasoning, large context, or reliable tool use. The core decision axes a router balances are cost, latency, quality/capability needed, required context length, and specific tool-use or structured-output support — with context length and tool support typically treated as hard filters evaluated before any cost/latency optimization runs.

Three core strategies cover most production routing: rule-based routing uses cheap, explicit heuristics (length, keyword/regex detection, request metadata) to pick a tier with no model call needed for the decision itself; classifier-based routing uses a small, cheap model (or lightweight trained classifier) to predict which downstream tier a request needs before the real call is made; and cascade/fallback routing tries the cheapest model first and escalates to a stronger model only if the cheap model's output fails a confidence or quality check. Mature production systems typically layer all three — rules catch the obvious cases, a classifier or cascade handles the ambiguous middle — rather than committing to exactly one strategy.

A worked routing layer classifies incoming request complexity, then routes simple factual queries to a small/cheap model, complex open-ended reasoning to a frontier model, and code-heavy requests to a code-specialized model — with a cascade safety net that escalates whenever the chosen tier's own output looks wrong, using structural validation, refusal detection, or an independent judge-model check as the confidence signal, roughly in that order of cost-effectiveness. Multi-provider routing extends this across OpenAI, Anthropic, open-weight, and self-hosted models for cost, redundancy, or capability reasons, but it comes with a real cost: an abstraction layer built to a lowest-common-denominator interface loses access to provider-specific features, and it expands the credential-management surface since the router now holds keys for every provider in the pool.

Semantic caching is a complementary technique, not a substitute — it is checked before routing runs and avoids calling any model at all for repeated or near-duplicate queries, while routing decides which model to call for everything that is not a cache hit. Latency-aware routing sends traffic to the fastest available model or region when an SLA matters more than absolute best quality (as in inline code completion), while reliability/failover routing automatically shifts traffic to a backup provider on an outage or rate-limit event, preventing a single provider from being a single point of failure for the whole feature.

The production discipline that separates a working routing layer from a fragile one is observability: every routing decision should be logged with the signals that produced it, tier distribution and per-tier outcome quality should be tracked as first-class metrics (not just aggregate model metrics), and new routing policies should run in shadow mode before serving real traffic. The single biggest risk of routing done poorly is that it degrades quality silently — no exception is thrown, there is just a steadily worse answer distribution — which is exactly why the tradeoff between routing sophistication and system debuggability must be managed deliberately: complexity should be earned by demonstrated misrouting on real traffic, not assumed upfront.
`,

  "learning-roadmap": `
### Week 1 — Foundations and rule-based routing
Read Overview through Prerequisites. Build a rule-based router (Lab 1): length/regex/metadata heuristics mapping to named tiers, with a unit test suite covering at least 6 distinct input cases. Milestone: a working, fully-tested routing decision function with zero real model calls in its tests.

### Week 2 — Cascade routing and confidence checks
Study Beginner through Advanced Concepts, focusing on confidence-check design. Build Lab 2: a cascade router against two real model tiers with a structural JSON-validation confidence check, logging every escalation. Milestone: a measured escalation rate and blended cost comparison against an always-frontier baseline on at least 30 varied inputs.

### Week 3 — Multi-provider routing and failover
Study Internal Working, Architecture, Data Flow, and Security. Build Lab 3: a router spanning at least two providers (or one hosted + one self-hosted via Ollama/vLLM) with declarative model-pool config and tested failover on a simulated provider outage. Milestone: a demonstration of automatic failover with zero dropped requests, plus a written note on lost provider-specific features.

### Week 4 — Production hardening and observability
Study Production Usage through Production Checklist, plus Monitoring and Debugging. Build Lab 4: wrap the router in a gateway with structured logging of every decision, Prometheus-style metrics for tier distribution and escalation rate, and a summary dashboard. Milestone: complete the full production checklist against your own routing layer.

### Beyond week 4
Work through the Coding Questions and Interview Questions sections until you can produce each model answer sketch unprompted. Attempt one of the Real Projects end to end (the cost-aware LLM gateway or the multi-provider failover router are the strongest portfolio pieces). Next platform skill to study: **Semantic Caching**, since it is the natural complement that sits directly in front of the routing layer you just built.
`,

  "official-docs": `
- **OpenAI API documentation — Models** — the canonical reference for current model tiers, pricing, and context windows from one major provider; essential for keeping any routing policy's cost assumptions current, since pricing changes over time.
- **Anthropic API documentation — Models overview** — same purpose for Anthropic's model lineup; compare tier naming and capability descriptions directly against OpenAI's to understand how "small/mid/frontier" concepts map across providers.
- **Provider rate-limit and error documentation** (both OpenAI and Anthropic publish these) — required reading before implementing reliability/failover routing, since failover logic depends on correctly identifying rate-limit versus outage error responses.
- **RouteLLM project documentation** (open-source routing framework) — a concrete reference implementation of classifier-based/learned routing, useful for seeing how a real system frames the routing-as-a-trained-classifier problem.

Always cross-check exact current pricing, context-window sizes, and tool-use support directly against each provider's live documentation — these are the fastest-changing facts relevant to a routing policy and this page intentionally avoids hard-coding numbers likely to go stale.
`,

  books: `
- **"Designing Data-Intensive Applications" by Martin Kleppmann** — not routing-specific, but the load-balancing, caching, and failover chapters are the direct conceptual ancestors of model routing patterns; read it to understand why routing looks the way it does as a systems-design problem.
- **"Building Machine Learning Powered Applications" by Emmanuel Ameisen** — useful for the broader discipline of matching model choice to product requirements, a mindset directly transferable to routing design.
- **"Site Reliability Engineering" (Google, various authors)** — the failover, circuit-breaker, and graceful-degradation chapters map almost directly onto reliability/failover routing for LLM providers.
- **"Release It!" by Michael Nygard** — the definitive book on circuit breakers, timeouts, and bulkheads; every pattern in it applies directly to routing across unreliable upstream model providers.

Model routing as a named discipline is too young to have a dedicated canonical textbook as of this page's knowledge cutoff; the strongest preparation comes from general distributed-systems and reliability engineering texts applied to the LLM-routing context, plus the research papers listed below.
`,

  blogs: `
- **Provider engineering blogs (OpenAI, Anthropic)** — periodically publish guidance on model selection and cost/latency tradeoffs across their own tiers; high-signal for understanding how a provider intends its own model lineup to be used.
- **Company engineering blogs from teams running high-volume LLM products** (customer-support platforms, coding-assistant products) — frequently publish detailed post-mortems and design write-ups on their routing and cascade architectures; search for "LLM routing," "model cascade," or "cost-aware LLM gateway" alongside a specific company name for the most concrete, numbers-backed accounts.
- **The RouteLLM project's accompanying blog/paper writeups** — good high-signal reading on framing routing as a learned classification problem with measurable cost/quality tradeoffs.

Be selective: routing content on generic content-mill blogs is often thin restatements of "use a cheap model for easy stuff." Prioritize posts with concrete numbers (measured escalation rates, blended cost figures, before/after comparisons) over purely conceptual pieces.
`,

  "research-papers": `
Research specifically on LLM routing and cascades is a real, if still-young, literature as of this page's knowledge cutoff — thinner than mature ML subfields but genuinely foundational work exists:

- **"FrugalGPT" and related LLM-cascade papers** — formalize the cascade pattern (cheap model first, escalate on low confidence), quantify cost/quality tradeoff curves, and compare cascades against single-model and classifier-based baselines. Read this first if you want the formal framing behind Cascade/Fallback Routing on this page.
- **RouteLLM's accompanying paper** — frames routing as a learned classification problem: predicting, per query, which of two models will produce an acceptable answer, trained on preference/outcome data. The most directly applicable paper to Classifier-Based Routing on this page.
- **Mixture-of-experts (MoE) literature** (e.g. the Switch Transformer and related work) — not request-level routing across separate models, but the closest-adjacent, much more mature research area: routing at the sub-model level (which expert layer handles which token) uses very similar cost/capacity tradeoff reasoning and is worth reading for intuition even though it operates inside a single model rather than across a model pool.

If this list feels thin compared to, say, the transformer-architecture literature, that is accurate — routing-as-a-named-discipline is genuinely newer. The closest, most foundational adjacent reading beyond the papers above is the general literature on ensemble methods and cost-sensitive learning in classical machine learning, which established the cost/accuracy tradeoff framing that LLM cascade papers directly inherit.
`,

  videos: `
- **Conference talks from major LLM providers on model selection and cost optimization** (search recent OpenAI DevDay and Anthropic developer conference talks) — these frequently include concrete guidance on when to use each tier the provider offers, directly informing rule-based routing thresholds.
- **Engineering talks from high-volume LLM product companies on "LLM gateway" or "model routing" architecture** — search by these terms alongside recent conference names (a general systems/infra conference, or an AI-engineering-focused conference); these talks tend to include real cost and escalation-rate numbers, which are the most valuable content for this topic.
- **RouteLLM project talks/demos** (if available from the project's own channels) — a concrete walkthrough of a learned router in action, useful for seeing Classifier-Based Routing implemented end to end rather than only described.

Given how fast the specific speaker/talk landscape changes, prioritize searching by topic ("LLM model routing," "LLM cascade routing," "cost-aware LLM gateway") on your video platform of choice over relying on any single named talk from this page, and check the publication date against this page's knowledge cutoff before trusting cost figures mentioned.
`,

  "github-repos": `
- **RouteLLM** — an open-source framework specifically for learned/classifier-based routing between models; the most directly relevant repository to this entire skill page, and a strong reference implementation to read before building your own classifier-based router.
- **LiteLLM** — a widely used unified API layer across many LLM providers; while not a routing framework per se, it is the kind of abstraction layer described in Multi-Provider Routing, and its provider-adapter code is instructive for understanding the lowest-common-denominator tradeoff firsthand.
- **LangChain / LangGraph** (routing-related modules) — agent-framework code that implements step-level routing within multi-step pipelines; useful for seeing routing applied at the sub-task level described in Advanced Concepts.
- **vLLM**, **Ollama**, **SGLang** repositories — not routers themselves, but the serving-layer projects a self-hosted routing tier points at; understanding their model-loading and serving APIs is necessary if your routing pool includes self-hosted models.
- **Semantic-caching libraries** (e.g. GPTCache and similar projects) — the complementary caching layer that should sit in front of any routing implementation; worth reading alongside a routing repo rather than in isolation.
- **Any open-source "LLM gateway" project on GitHub** (search this term directly, as the specific most-starred project changes over time) — these consistently bundle routing, caching, and failover together and are excellent for seeing the full architecture described on this page implemented in one codebase.

Verify current star counts, maintenance status, and API details directly on GitHub before depending on any of these in production — this list reflects categories of tooling relevant as of this page's knowledge cutoff, not a guarantee of current maintenance status.
`,

  "practice-problems": `
Ordered by the skill focus each problem exercises:

1. **Signal extraction** — Given a batch of 50 sample requests, hand-label each as simple/moderate/complex, then write rule-based heuristics and measure agreement against your labels. Focus: understanding how weak length/keyword proxies really are before trusting them in production.
2. **Confidence-check design** — Given a set of cheap-model outputs for a structured-extraction task, write a structural validator and measure how many outputs it correctly flags as needing escalation versus a hand-labeled ground truth. Focus: building a real, defensible confidence signal.
3. **Cascade cost/quality tradeoff** — Given cost and quality numbers for a small and large model on a sample workload, calculate the blended cost of always-small, always-large, and cascade-with-escalation-rate-X, and find the escalation rate at which cascade routing stops being worth its complexity versus just using the large model directly. Focus: quantitative tradeoff reasoning, not just conceptual understanding.
4. **Hard-filter design** — Given a model pool with varying context windows and tool-support flags, write the filtering logic that eliminates disqualified candidates before any cost optimization runs, and unit test it against edge cases (a request that no model in the pool can serve). Focus: correctly separating hard constraints from soft optimization.
5. **Failover simulation** — Simulate a provider outage (mock a client to always raise a timeout) and verify your router correctly and quickly fails over to a backup provider without dropping the request. Focus: reliability-routing correctness under a genuinely broken dependency.
6. **External practice sets** — General distributed-systems load-balancing and circuit-breaker exercises (from any systems-design interview practice resource) transfer directly to routing/failover design and are excellent supplementary practice, since dedicated LLM-routing problem sets are still uncommon given how young the discipline is.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Client application"] --> GW["LLM Gateway\n(single stable API surface)"]

    GW --> Cache{"Semantic cache\nhit?"}
    Cache -->|yes| Client

    Cache -->|no| Router["Router"]
    Router --> Signals["Signal extraction:\nlength, regex, metadata,\ndeclared requirements"]
    Signals --> Filter{"Hard constraint filter:\ncontext length, tool support"}
    Filter -->|no candidates qualify| Reject["Reject / route to largest\ncapable fallback"]
    Filter -->|candidates remain| Complexity["Complexity estimate:\nrule / classifier / cascade-first-attempt"]

    Complexity --> Select["Tier selection\n(cost/latency/quality tradeoff)"]

    Select --> Small["Small/fast model"]
    Select --> Mid["Mid-size model"]
    Select --> Large["Frontier model"]
    Select --> Code["Code-specialized model"]

    Small --> Check{"Confidence/quality\ncheck passed?"}
    Mid --> Check
    Code --> Check
    Check -->|no, escalate| Large
    Check -->|yes| Respond["Return response"]
    Large --> Respond

    subgraph Providers["Multi-provider pool"]
        Small
        Mid
        Large
        Code
    end

    Router -.-> Failover["Failover:\nprovider outage/rate-limit\n-> backup provider"]
    Failover -.-> Providers

    Respond --> CacheWrite["Write to semantic cache"]
    CacheWrite --> Client

    Router --> Obs["Observability:\nrouting decisions, cost,\nlatency, escalation, outcomes"]
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Model Routing))
    Why it exists
      Frontier model for everything = wasteful
      Cheap model for everything = quality risk
      Match capability to requirement per request
    Decision axes
      Cost
      Latency
      Quality / capability needed
      Context length required
      Tool-use / structured-output support
    Strategies
      Rule-based
        Length / regex / metadata heuristics
      Classifier-based
        Small model predicts required tier
        Learned routers (RouteLLM-style)
      Cascade / fallback
        Try cheap first
        Confidence check
        Escalate on failure
    Worked example
      Simple factual query -> small model
      Complex reasoning -> frontier model
      Code-heavy request -> code-specialized model
    Multi-provider routing
      Cost / redundancy / capability gains
      Lowest-common-denominator tradeoff
      Credential surface grows
    Complementary techniques
      Semantic caching (skip model entirely)
      Prompt versioning per tier
    Reliability
      Failover on outage / rate limit
      Provider headroom tracking
    Production concerns
      Log every routing decision
      Monitor tier distribution + outcome quality
      Avoid silent quality bottleneck
      Sophistication vs debuggability tradeoff
    Related skills
      LLMOps
      Prompt Versioning
      Cost Optimization
      Latency
      Semantic Caching
      vLLM / Ollama / SGLang
      Evaluation / AI Evals
~~~
`,
};

export default modelRouting;
