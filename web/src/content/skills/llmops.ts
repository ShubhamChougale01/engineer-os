import type { SkillContent } from "../types";

/**
 * LLMOps — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const llmops: SkillContent = {
  overview: `
LLMOps (Large Language Model Operations) is the discipline of running large-language-model-powered applications reliably in production: developing prompts and retrieval pipelines, evaluating their quality before and after release, deploying them safely, and observing and improving them continuously once real users are hitting them. It is the LLM-era evolution of MLOps, and it exists because shipping an LLM feature is not a one-time integration — it is an ongoing operational commitment, the same way shipping a database-backed service is.

What makes LLMOps its own discipline rather than "MLOps with a different model" is three structural differences. First, the deployable artifact is no longer just a set of model weights — it is a **bundle** of prompt template, system instructions, retrieved context, tool definitions, and model/parameter choice, all of which change independently and all of which need versioning, review, and rollback exactly like code. Second, outputs are **open-ended and non-deterministic**: there is no single correct label to compare against, so "accuracy" as classical ML understands it barely applies — evaluation has to lean on rubrics, LLM-as-judge scoring, human review, and statistical sampling instead of a confusion matrix. Third, the "model" itself is usually a **third-party API you do not train, do not own, and cannot inspect** (OpenAI, Anthropic, Google) — so the traditional MLOps toolchain of training pipelines, feature stores, and retraining triggers is replaced by prompt engineering, context engineering, and provider-routing as the primary levers of quality and cost.

For an AI engineer, LLMOps is the difference between a slick demo and a product that survives contact with real traffic, edge-case inputs, cost pressure, and adversarial users. It sits at the intersection of software engineering (CI/CD, observability, testing), product thinking (what does "good" mean for this feature), and applied ML (evaluation, prompt design, retrieval). Teams that skip LLMOps discipline ship prompts directly to production with no eval gate, discover regressions from users instead of dashboards, and cannot answer "why did the model say that" when something goes wrong — this page is about not being that team.

Key characteristics: prompts and context versioned like code; evaluation via golden datasets and LLM judges rather than single accuracy metrics; cost and latency treated as first-class, per-request, directly-attributable operational metrics; full request tracing (prompt, retrieved context, tool calls, intermediate reasoning, final output); and a tight feedback loop from production signals (thumbs up/down, corrections, escalations) back into prompt and retrieval improvements.
`,

  history: `
LLMOps as a named discipline is young — it crystallized once companies had running LLM features that broke in production and needed the same operational rigor DevOps and MLOps brought to earlier software and ML systems. It borrows its name and much of its philosophy directly from MLOps, which itself borrowed from DevOps.

| Year | Milestone |
|------|-----------|
| ~2015–2018 | MLOps emerges as a discipline: CI/CD for model training, feature stores, model registries (mirroring DevOps for classical ML) |
| 2020 | GPT-3 API ships; companies start building products on a model they cannot retrain or fully inspect — the first crack in the classical MLOps model |
| 2022 | ChatGPT launch triggers an explosion of LLM-powered products; most ship with zero eval or observability discipline, and it shows |
| 2022–2023 | Prompt engineering recognized as a first-class skill; early prompt-versioning tools and "prompt playgrounds" appear |
| 2023 | The term "LLMOps" enters common industry usage; LangChain, LlamaIndex popularize retrieval-augmented pipelines that now need their own ops story |
| 2023 | Dedicated observability tools for LLM apps appear — LangSmith, Langfuse, Helicone — because generic APM tools have no concept of a prompt, a token, or a retrieved chunk |
| 2023–2024 | LLM-as-judge evaluation becomes standard practice as golden-dataset human review alone cannot scale to the volume and variety of open-ended outputs |
| 2024 | RAG pipelines, agents, and tool-calling become mainstream, multiplying the number of moving parts an LLMOps pipeline must track (retrieval quality, tool success rate, multi-step traces) |
| 2024–2025 | Guardrails and prompt-injection defenses become an explicit operational responsibility, not just a security afterthought, as agents gain more autonomy and access to real systems |
| 2025–2026 | Structured evaluation-in-CI (eval gates blocking prompt merges), cost-aware model routing, and canary rollouts for prompt changes become common practice at mature AI teams |

No single person or company "invented" LLMOps the way Guido invented Python — it is an emergent discipline, assembled by teams (early adopters were companies running GPT-3/4 at scale, and infrastructure startups building the tooling gap they saw) applying proven DevOps/MLOps patterns to the new failure modes that non-deterministic, prompt-driven systems introduce. Treat this history as directionally accurate rather than an authoritative timeline — the field is still stabilizing its own vocabulary as of this writing.
`,

  "why-it-exists": `
Before LLMOps, teams building on LLMs typically had one of two backgrounds, and both left a gap:

- **Software engineers** treated the LLM call like any other API call: write a prompt string, hit the endpoint, parse the response. This works for a demo and fails in production, because prompts are not "just strings" — they are the primary lever of behavior, and changing one word can silently change output quality, cost, and safety. Nobody was versioning them, testing them, or watching them the way they'd watch a deployed service.
- **ML engineers** brought MLOps instincts — model registries, training pipelines, offline metrics — that don't map cleanly onto a system where there's no training step, no model you can retrain overnight, and no clean "accuracy" number.

Both groups discovered the same painful truth independently: an LLM feature that works in a demo can degrade badly in production for reasons neither playbook covers — a prompt tweak that fixes one case breaks three others, a retrieval pipeline that returns subtly wrong context, a provider silently updating a model underneath you, or cost exploding because nobody budgeted tokens per request.

LLMOps exists to close that gap: it takes DevOps's rigor (version everything, test before you ship, observe after you ship, roll back fast) and MLOps's rigor (evaluate offline before deploying, monitor for drift, keep a feedback loop) and adapts both to the specific failure modes of prompt-driven, non-deterministic, context-dependent systems. Before LLMOps tooling existed, teams debugged production LLM issues by staring at raw logs with no structured trace of what was retrieved, what the model saw, or what it decided — the equivalent of debugging a web app with no request logs and no stack traces.
`,

  "problem-it-solves": `
LLMOps removes several concrete, recurring pains:

- **"It worked when I tested it" syndrome**: a prompt change is deployed based on a handful of manual checks, then silently regresses on inputs nobody thought to try. LLMOps replaces "I tried a few examples" with a golden dataset and an eval gate that runs on every change.
- **Invisible cost blowups**: token usage scales directly and visibly with traffic and with prompt length/verbosity — a single added few-shot example or an unbounded conversation history can multiply spend. LLMOps makes cost a tracked, alertable, per-request metric instead of a monthly billing surprise.
- **"Why did it say that" with no trace**: without structured tracing of the full request (prompt, retrieved chunks, tool calls, model, parameters, output), debugging a bad output is guesswork. LLMOps gives you the equivalent of a stack trace for a non-deterministic system.
- **Silent quality drift**: model providers update models behind an API version tag, retrieval indexes go stale, and user input distributions shift — all of which degrade quality gradually with no error thrown. LLMOps's monitoring and periodic re-evaluation catch this before users complain en masse.
- **Uncontrolled prompt sprawl**: prompts scattered across code, notebooks, and Slack messages, with no history of what changed or why. LLMOps treats prompts as versioned artifacts with the same review discipline as code.
- **Safety incidents with no operational owner**: harmful outputs, prompt injection, or jailbreaks discovered only when a user posts a screenshot. LLMOps makes guardrails and safety monitoring an assigned, measured responsibility.

What LLMOps deliberately does **not** solve: it does not make the underlying model smarter, it does not replace good product judgment about what the feature should do, and it does not eliminate the fundamental non-determinism of LLM outputs — a well-run LLMOps pipeline still ships a system that can occasionally be wrong; the discipline is about knowing when, how often, and catching it before it compounds. It also does not substitute for foundational ML training infrastructure if you are actually training or fine-tuning models yourselves — that remains classical MLOps territory (see the **MLOps** skill), which LLMOps extends rather than replaces.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely how LLMOps differs from classical MLOps and articulate why each difference matters operationally.
2. Describe the full LLMOps lifecycle from prompt development through production monitoring and feedback.
3. Version and A/B test prompts like code, with a review process a team can actually follow.
4. Design a golden evaluation dataset and wire an automated eval gate into CI that blocks quality regressions.
5. Instrument an LLM application with full request tracing — prompt, context, tool calls, and output — using an observability tool.
6. Track and control per-request cost and token budgets as an operational metric with alerts.
7. Reason about latency and streaming as user-facing quality attributes, not just backend metrics.
8. Build a human feedback loop (explicit and implicit signals) that feeds back into prompt or fine-tuning decisions.
9. Identify the guardrail and safety monitoring responsibilities an LLMOps pipeline owns in production.
10. Design a staged rollout (canary/shadow) strategy for a prompt or model change and know when to roll back.
11. Answer senior-level interview questions on LLMOps lifecycle, evaluation strategy, and organizational ownership of prompt changes.
`,

  prerequisites: `
- **Required**: comfort calling an LLM API (chat completions, streaming, tool/function calling) and basic software engineering practice — git, CI/CD, testing. If you are new to calling LLM APIs at all, get comfortable there first; this page assumes you can already build a basic LLM feature.
- **Helpful**: familiarity with classical ML operations concepts — see the **MLOps** skill for the model-training-and-deployment discipline LLMOps extends; you do not need deep ML training experience, but understanding what a model registry or a training pipeline is makes the contrast in this page click faster.
- **Strongly recommended alongside this page**: the **AI Evals** skill (how to actually build the golden datasets and judges this page assumes exist) and the **AI Harness** skill (the testing/eval infrastructure that runs those evals in CI).
- **For the specialized sub-practices this page references but does not fully own**: see **Prompt Versioning** (treating prompts as deployable artifacts in depth), **Model Routing** (cost/quality-aware request routing in depth), **Cost Optimization** and **Latency** (the production concerns LLMOps directly manages), **Guardrails** and **Prompt Injection Defense** (the safety layer), and **LangSmith** / **Langfuse** (concrete observability tooling).

Dependency links: **LLM Fundamentals** / **Prompt Engineering** → this page → **AI Evals**, **Prompt Versioning**, **Model Routing**, **Guardrails** all deepen one lifecycle stage each.
`,

  "beginner-concepts": `
### What actually gets deployed in an LLM app

In classical software, you deploy code. In classical ML, you deploy code plus a trained model artifact. In an LLM app, you deploy code plus a **prompt** (system instructions, templates, few-shot examples), a **context strategy** (what gets retrieved or injected at request time), a **model choice and parameters** (which provider/model, temperature, max tokens), and optionally **tool definitions** the model can call. All four are independently changeable and all four affect behavior — this bundle, not just the model, is the real unit of deployment.

~~~text
LLM feature =
    system_prompt          (instructions, persona, constraints)
  + retrieved_context       (RAG chunks, tool results, memory)
  + user_input              (the actual request)
  + model_config            (provider, model name, temperature, max_tokens)
  + tool_definitions        (optional — functions the model can invoke)
~~~

### Why "it worked once" is not evidence

Because outputs are sampled from a probability distribution (even at temperature 0, provider-side non-determinism exists), running a prompt three times and liking the answers tells you almost nothing about behavior across the full space of real user inputs. This is the single most important mental shift for someone coming from deterministic software: you need a **dataset of representative inputs** and a **repeatable way to score outputs**, not a handful of manual spot checks.

### A minimal evaluation loop

~~~python
# The smallest possible LLMOps loop: run a prompt over a fixed
# dataset and score each output, so a change is measured, not guessed at.
import json

def run_eval(prompt_fn, dataset, scorer):
    """prompt_fn(input) -> output string
    dataset: list of {"input": ..., "expected": ...}
    scorer(output, expected) -> float score in [0, 1]
    """
    results = []
    for case in dataset:
        try:
            output = prompt_fn(case["input"])
            score = scorer(output, case["expected"])
        except Exception as exc:
            # A failed call is a score of 0, not a crash of the whole eval run
            output, score = None, 0.0
            print(f"eval case failed: {exc}")
        results.append({"input": case["input"], "output": output, "score": score})
    avg = sum(r["score"] for r in results) / len(results)
    return avg, results

# dataset.json: a "golden dataset" — real or representative inputs with
# known-good expected answers or grading criteria
with open("dataset.json") as f:
    dataset = json.load(f)
~~~

### Logging every request from day one

Even before you have fancy tracing tooling, log the four things you will need to debug any bad output later: the exact prompt sent, any retrieved context, the raw model response, and the model/parameters used. Retrofitting this after an incident is painful; it costs almost nothing to log from the start.

~~~python
import json
import time

def call_llm_logged(client, model, messages, **params):
    start = time.perf_counter()
    response = client.chat.completions.create(model=model, messages=messages, **params)
    latency_ms = (time.perf_counter() - start) * 1000
    log_entry = {
        "model": model,
        "messages": messages,          # the full prompt, including system + context
        "params": params,
        "output": response.choices[0].message.content,
        "usage": response.usage.model_dump() if response.usage else None,
        "latency_ms": latency_ms,
    }
    print(json.dumps(log_entry))       # ship to structured logging in production
    return response
~~~

### Cost is per-request and visible immediately

Unlike classical ML inference (where cost is largely infrastructure amortized over many requests), every LLM call has a directly attributable dollar cost from input + output tokens. A beginner should get in the habit of reading token usage off every response, not just the text.
`,

  "intermediate-concepts": `
### Prompt versioning like code

Treat prompts as files under version control, not inline strings scattered through the codebase. A prompt "release" is a diffable, reviewable change — exactly like a code PR.

~~~python
# prompts/support_triage/v3.py
SYSTEM_PROMPT = """
You are a support ticket triage assistant. Classify the ticket into
exactly one of: billing, bug, feature_request, account, other.
Respond with only the category name.
"""
VERSION = "v3"
CHANGELOG = "v3: removed 'urgent' category — was causing overlap with bug"
~~~

For the full depth of registries, diffing, rollback, and A/B testing prompt variants, see the **Prompt Versioning** skill — that is a specific sub-practice this page only introduces.

### The lifecycle, end to end

~~~text
1. Prompt development   -> write/iterate a prompt against sample inputs
2. Offline evaluation    -> run it over a golden dataset, score with rubric/judge
3. Staged rollout        -> canary a small % of production traffic
4. Production monitoring -> trace requests, watch cost/latency/quality signals
5. Feedback loop         -> user signals + failures feed back into step 1
~~~

This loop repeats continuously — it is not a one-time launch checklist. A mature team runs it weekly or even per-PR for high-traffic prompts.

### Golden datasets and LLM-as-judge scoring

A golden dataset is a curated set of representative inputs (ideally sourced from real production traffic plus deliberately hard edge cases) with either a known-good answer or a grading rubric. Because exact-match scoring rarely works for open-ended text, most teams use an **LLM-as-judge**: a second model call that grades the candidate output against a rubric.

~~~python
JUDGE_PROMPT = """
You are grading an AI assistant's response for factual accuracy and
tone. Score from 1-5.

Question: {question}
Reference answer: {reference}
Assistant response: {response}

Return JSON: {{"score": <int 1-5>, "reason": "<one sentence>"}}
"""

def judge_score(client, question, reference, response):
    result = client.chat.completions.create(
        model="gpt-4o-mini",   # a cheaper/faster model can judge a bigger one
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            question=question, reference=reference, response=response)}],
        response_format={"type": "json_object"},
    )
    return result.choices[0].message.content
~~~

Deep coverage of building rigorous evaluation suites — rubric design, judge calibration, human-in-the-loop review — belongs to the **AI Evals** skill; the **AI Harness** skill covers wiring these evals into an automated test-running infrastructure.

### Cost and token-budget management

~~~python
# A simple per-request budget guard: reject or truncate before an
# expensive call rather than discovering the bill afterward.
MAX_INPUT_TOKENS = 6000
MAX_COST_USD = 0.05

def estimate_cost(input_tokens, output_tokens, price_in, price_out):
    return (input_tokens / 1000) * price_in + (output_tokens / 1000) * price_out

def guard_request(input_tokens, price_in, price_out, expected_output_tokens=500):
    projected = estimate_cost(input_tokens, expected_output_tokens, price_in, price_out)
    if input_tokens > MAX_INPUT_TOKENS:
        raise ValueError(f"input too large: {input_tokens} tokens")
    if projected > MAX_COST_USD:
        raise ValueError(f"projected cost {projected:.4f} exceeds budget")
~~~

Choosing which model tier to route a given request to for cost/quality tradeoffs is a deep topic on its own — see the **Model Routing** skill.

### Streaming for perceived latency

~~~python
# Streaming doesn't reduce total latency, but it makes the FIRST
# token arrive fast, which is what users actually perceive as speed.
def stream_response(client, model, messages):
    stream = client.chat.completions.create(model=model, messages=messages, stream=True)
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta   # push to the client as it arrives, not after completion
~~~

### Human feedback signals

~~~python
# Explicit signal: thumbs up/down attached to a response id
def record_feedback(response_id, rating, comment=None):
    log_event({"type": "feedback", "response_id": response_id,
               "rating": rating, "comment": comment})

# Implicit signal: did the user regenerate, abandon, or accept the answer?
def record_implicit_signal(response_id, signal):
    # signal in {"regenerated", "copied", "abandoned", "escalated_to_human"}
    log_event({"type": "implicit_signal", "response_id": response_id, "signal": signal})
~~~

Both signal types are raw material for the feedback loop back into prompt improvements — and, at larger scale, into fine-tuning or retrieval index updates.
`,

  "advanced-concepts": `
### Staged rollout strategies for prompt/model changes

A prompt change is a deployment and deserves the same staged-rollout discipline as a code deployment.

| Strategy | How it works | Best for |
|----------|---------------|----------|
| Shadow / dark launch | New prompt runs alongside old on real traffic; new output is logged/scored but never shown to users | Validating a risky change with zero user-facing risk |
| Canary | New prompt serves a small % (e.g. 5%) of real traffic; compare quality/cost/latency metrics against the control group | Most day-to-day prompt changes |
| Blue-green | Full cutover to new prompt with instant rollback capability if metrics regress | Low-risk, well-evaluated changes where speed matters |
| A/B test | Both variants run simultaneously long-term to make a data-driven product decision, not just a safety check | Comparing genuinely different approaches (e.g. two system personas) |

The decision of which strategy to use is driven by blast radius: a system-prompt wording tweak on a low-stakes summarization feature might go straight to canary; a change to a medical or legal-adjacent assistant's instructions should shadow-launch first.

### Decision table: what to version and gate

| Artifact | Version like code? | Needs eval gate before ship? | Rationale |
|----------|--------------------|-------------------------------|-----------|
| System prompt | Yes | Yes | Directly drives behavior |
| Few-shot examples | Yes | Yes | Silently shifts output distribution |
| Retrieval strategy (chunking, top-k, reranker) | Yes | Yes | Changes what context the model even sees |
| Model/provider choice | Yes | Yes | Different models have different failure modes at the same prompt |
| Temperature/sampling params | Yes | Recommended | Can change variance and hallucination rate |
| Tool definitions | Yes | Yes | Model's action space changes |
| Guardrail rules | Yes | Yes (security-focused eval) | Safety regressions are as costly as quality ones |

### Multi-step and agentic tracing

Once a pipeline involves multiple LLM calls, tool invocations, and retrieval steps per user request, a flat request log is not enough — you need a **trace tree**: a root span for the user request, with nested child spans for each retrieval call, each LLM call, and each tool invocation, each carrying its own latency, token cost, and output.

~~~text
Trace: "answer support ticket #4821"
├── span: retrieve_context (vector search, top_k=5)   120ms
├── span: llm_call (triage classification)             340ms, 210 tokens
├── span: tool_call (lookup_order_status)               85ms
├── span: llm_call (final answer generation)            890ms, 640 tokens
└── total: 1435ms, $0.0031
~~~

This is exactly the model that dedicated tools like LangSmith and Langfuse implement — see those skills for concrete instrumentation. Building it yourself with OpenTelemetry spans is possible but reinvents a lot of wheel.

### Statistical rigor in evaluation

Because outputs are non-deterministic and judges themselves are imperfect and biased, a single eval run's average score is a noisy estimate, not a fact. Senior practice:

- Run evals multiple times (or at temperature > 0 across the dataset) and report a distribution, not a point estimate.
- Track **inter-rater agreement** between the LLM judge and human spot-checks periodically — judges drift and need recalibration.
- Segment scores by input category (e.g. by ticket type, by language) — an aggregate average can hide a category that regressed badly while others improved.
- Treat eval-gate thresholds as statistically informed (e.g. "must not drop more than 1 standard error below baseline"), not an arbitrary single number.

### The "third-party model" operational reality

Because most teams call a provider API rather than own the weights, LLMOps carries risks classical MLOps doesn't: the provider can silently update a model version, deprecate an endpoint, change rate limits, or shift pricing — all outside your control. Mature teams pin model versions explicitly where the API allows it, re-run the full eval suite whenever a provider announces a model update, and maintain a fallback/routing plan (see **Model Routing**) so a single provider outage or regression doesn't take down the feature.

### Evaluation-driven fine-tuning decisions

When prompt engineering and retrieval improvements plateau, the feedback loop's aggregated data (failure clusters, low-scoring categories, human corrections) becomes the training signal for a fine-tuning decision — LLMOps is what makes that decision evidence-based rather than a guess, by having the labeled failure data already collected from the running system.
`,

  "internal-working": `
Internally, a mature LLMOps pipeline is a closed loop, not a linear pipeline — every stage feeds the next, and the last stage feeds back into the first.

~~~mermaid
flowchart TB
    A["Prompt / retrieval change proposed (PR)"] --> B["Offline eval run against golden dataset"]
    B -->|score below threshold| A
    B -->|score passes gate| C["Staged rollout: shadow / canary"]
    C -->|metrics regress| R["Rollback"] --> A
    C -->|metrics healthy| D["Full production traffic"]
    D --> E["Tracing + monitoring: cost, latency, quality signals"]
    E --> F["Human feedback: explicit ratings + implicit signals"]
    F --> G["Failure clustering / regression analysis"]
    G -->|new eval cases mined from failures| B
    G -->|systemic gap found| A
~~~

Step by step:

1. **Change proposed**: an engineer edits a prompt, adjusts retrieval top-k, or swaps a model — submitted as a reviewable diff, exactly like code.
2. **Offline evaluation**: an automated job runs the candidate prompt/pipeline over the golden dataset, scores each case (exact match, rubric, or LLM judge), and compares aggregate and per-category scores against the current production baseline. This is the "eval gate" — if scores drop below a threshold, the change is blocked automatically, the same way a failing test suite blocks a code merge.
3. **Staged rollout**: a change that passes the gate does not go to 100% of traffic immediately. It shadow-launches or canaries, with real production metrics (not just the offline dataset) compared against the control.
4. **Production monitoring**: every live request is traced — the full prompt, retrieved context, tool calls, model output, latency, and cost are captured and shipped to an observability backend.
5. **Feedback loop**: user ratings, implicit signals, and traced failures are mined periodically to find systemic weaknesses; the worst cases become new golden-dataset entries, closing the loop back to step 2, and repeat failures may motivate a fresh prompt change (step 1) or a fine-tuning effort.

The critical internal difference from a classical CI/CD pipeline is that the "test suite" (the eval gate) is itself imperfect and probabilistic — a golden dataset only samples the space of possible inputs, and an LLM judge only approximates human judgment — so the loop must keep injecting real production failures back into the offline dataset to stay representative over time.
`,

  architecture: `
### Reference system architecture

~~~mermaid
flowchart TB
    subgraph Dev["Development"]
        PR["Prompt registry (versioned prompts + configs)"]
        CI["CI: eval gate against golden dataset"]
    end
    subgraph Runtime["Production runtime"]
        API["App API layer"]
        Router["Model router (cost/quality-aware)"]
        RAG["Retrieval layer (vector DB / search)"]
        LLM["LLM provider(s)"]
        Tools["Tool / function execution"]
        Guard["Guardrails (input + output filters)"]
    end
    subgraph Ops["Observability & feedback"]
        Trace["Tracing / observability platform"]
        Alert["Alerting on quality/cost/latency regressions"]
        FB["Feedback store (ratings, corrections)"]
    end

    PR --> CI --> API
    API --> Guard --> Router
    Router --> RAG --> LLM
    Router --> LLM
    LLM --> Tools --> LLM
    LLM --> Guard
    Guard --> API
    API --> Trace
    Trace --> Alert
    API --> FB
    FB -->|mined failures become new eval cases| PR
~~~

Key architectural principles:

- **Prompts live in a registry, not scattered in application code** — the app fetches the current (or pinned) prompt version at request time, the same way it would fetch a config value, so a prompt rollback is a config change, not a redeploy.
- **The eval gate sits in CI, blocking merges**, exactly like a unit test suite — a prompt change is not "done" until it passes the gate.
- **Guardrails wrap both the input and output boundary** of the LLM call, independent of the model/prompt logic itself, so safety rules can be updated without touching prompt logic (see **Guardrails** and **Prompt Injection Defense**).
- **The model router is a separate layer** from the application logic, so cost/quality routing decisions (which model, which provider, fallback chains) can evolve without every caller changing (see **Model Routing**).
- **Observability wraps every layer**, not just the final LLM call — retrieval, tool calls, and guardrail decisions all need their own spans, because a bad final answer might actually be caused by bad retrieval three layers upstream.

### Application layout convention

~~~text
llm_app/
├── prompts/                 # versioned prompt templates + changelogs
│   └── support_triage/v3.py
├── eval/
│   ├── golden_dataset.jsonl  # curated input/expected-output pairs
│   ├── judges.py             # LLM-as-judge scoring functions
│   └── run_eval.py           # CI entrypoint — exits non-zero on regression
├── retrieval/                # chunking, embedding, vector search
├── routing/                  # model/provider selection logic
├── guardrails/               # input/output filters
├── app/                      # API layer, request handling
└── observability/            # tracing/logging instrumentation
~~~
`,

  "data-flow": `
Trace a single prompt change from proposal through production monitoring — the canonical LLMOps data flow.

~~~mermaid
sequenceDiagram
    participant Dev as Engineer
    participant Repo as Prompt Repo
    participant CI as Eval Gate (CI)
    participant Canary as Canary Traffic (5%)
    participant Prod as Production
    participant Trace as Tracing/Observability
    participant Alert as Alerting

    Dev->>Repo: commit prompt v4 (diff reviewed like code)
    Repo->>CI: trigger eval run
    CI->>CI: run v4 over golden dataset, score via judge + rubric
    alt score below baseline threshold
        CI-->>Dev: block merge, report failing cases
    else score passes gate
        CI-->>Repo: merge allowed
        Repo->>Canary: deploy v4 to 5% of live traffic
        Canary->>Trace: log full traces (prompt, context, output, cost, latency)
        Trace->>Alert: compare v4 metrics vs v3 control group
        alt regression detected
            Alert-->>Canary: auto-rollback to v3
        else metrics healthy
            Canary->>Prod: promote v4 to 100% of traffic
        end
    end
    Prod->>Trace: continuous tracing of all requests
    Trace->>Dev: periodic failure review + user feedback mining
    Dev->>Repo: next prompt iteration informed by real failures
~~~

The most important part of this flow to internalize: the loop never truly ends. Unlike a classical software deploy where "done" means the code is live and stable, an LLM feature is never "finished" — production traffic keeps surfacing new edge cases, and the golden dataset and prompt keep evolving in response. A team that treats the canary promotion as the finish line rather than the eval-gate-and-monitoring loop as the actual product will regress within weeks.
`,

  "production-usage": `
### How real teams structure the pipeline

Most production LLMOps setups combine a handful of concrete pieces:

1. **Prompt registry**: prompts stored as versioned files (or in a dedicated prompt-management tool) alongside a changelog, fetched by the app at request time rather than hardcoded inline.
2. **Eval suite in CI**: a job (GitHub Actions, GitLab CI, or similar) that runs on every PR touching prompts/retrieval, executing the golden dataset and failing the build on regression — mirroring how a unit test suite gates code changes.
3. **Observability platform**: LangSmith, Langfuse, or a custom OpenTelemetry-based setup capturing every request's full trace — see the **LangSmith** and **Langfuse** skills for concrete tool usage.
4. **Feature-flagged rollout**: prompt/model changes ship behind a flag so canary percentages and instant rollback are operationally trivial, using the same feature-flag infrastructure the rest of the product uses.
5. **Cost dashboards**: per-feature, per-model token spend tracked daily, with budget alerts — because unlike classical infra cost, LLM cost is directly proportional to traffic and prompt design choices made by engineers, not just to infrastructure sizing.
6. **On-call ownership**: a named owner (often the feature's engineering team, not a separate "ML ops" team) who gets paged on quality/cost/latency regressions, the same as any other production service.

### Operational defaults worth adopting

- Pin model versions explicitly in config rather than trailing "latest" aliases, so a provider-side model update cannot silently change your production behavior overnight.
- Store prompt + config + model version together as one deployable unit, so you can always answer "what exactly generated this output" for any historical request.
- Default every LLM call to a timeout and a fallback (cached response, simpler model, or a graceful error) — a hung upstream call should never hang the user-facing request indefinitely.
- Run the eval suite nightly against production traffic samples (not just the static golden dataset) to catch distribution drift the static dataset doesn't cover.
`,

  "industry-examples": `
- **OpenAI / Anthropic (as platform providers)**: both companies operate extensive internal evaluation and red-teaming pipelines before shipping model updates — the same eval-gate philosophy this page describes, applied at model-release scale rather than prompt-release scale.
- **Notion AI**: ships AI features (Q&A, writing assistance) across a huge, varied user base; this class of product requires exactly the golden-dataset-plus-canary discipline described here, since a prompt regression is invisible until it hits a wide range of real documents and writing styles.
- **GitHub Copilot (Microsoft/GitHub)**: an LLM-powered coding assistant operating at massive scale, where telemetry on acceptance/rejection of suggestions functions as the implicit human feedback signal driving prompt and model iteration.
- **Klarna**: has publicly discussed running an LLM-based customer service assistant handling a large share of support chats, which requires exactly the staged-rollout-plus-monitoring discipline this page covers given the direct customer-facing risk of a regression.
- **Duolingo**: uses LLMs for content generation and conversational practice features at scale across many languages, where per-language, per-feature evaluation segmentation (not just an aggregate score) is essential — a global average can hide a language that quietly regressed.

Pattern to notice across all of these: none of them treat an LLM feature as "ship once and done." Every mature deployment described publicly involves continuous evaluation, staged rollout, and feedback-driven iteration — because the alternative (ship, hope, wait for user complaints) does not survive contact with real-world traffic volume and variety.
`,

  "best-practices": `
1. **Version prompts like code**: every prompt change is a diffable, reviewable commit with a changelog entry — never edit a live prompt string directly in a running service.
2. **Never ship a prompt/retrieval change without an eval gate result**: even a small golden dataset run beats zero automated check; block merges on regression, exactly like a failing test suite.
3. **Log the full request context from day one**: prompt, retrieved context, model, parameters, and output — retrofitting this after an incident is far more expensive than building it in from the start.
4. **Treat cost as a per-feature budget with alerts**, not a monthly bill you react to — set thresholds before launch, not after the invoice surprises someone.
5. **Canary or shadow-launch every non-trivial change**; reserve instant full rollout for the lowest-risk, most-tested tweaks.
6. **Segment evaluation scores by category/input type**, never trust a single aggregate number — an average can hide a badly regressed subgroup.
7. **Recalibrate LLM judges against human review periodically** — judges drift, and an uncalibrated judge gives false confidence.
8. **Pin model versions explicitly**; re-run the full eval suite whenever a provider announces a model update, rather than assuming behavior is unchanged.
9. **Build the human feedback loop into the product surface itself** (thumbs up/down, correction affordances) rather than relying only on support tickets to surface failures.
10. **Own guardrails as an operational responsibility with metrics**, not a one-time review — track block rates and false-positive rates the same way you track any other production metric.
11. **Assign a clear owner for prompt changes** (usually the feature team, not a separate silo) so review and rollback have a responsible human, not a committee.
12. **Keep the golden dataset alive**: continuously mine real production failures into it; a static dataset from launch day goes stale within weeks.
`,

  "anti-patterns": `
### Shipping prompt changes with no eval gate

~~~text
# WRONG: prompt edited directly in the deployed service, tested with
# three manual chat messages, merged straight to 100% of traffic.

# RIGHT: prompt change submitted as a diff, eval suite runs
# automatically against the golden dataset, regression blocks merge,
# passing change canaries at 5% before full rollout.
~~~

### Treating a single aggregate eval score as sufficient

Reporting "average quality score: 4.2/5" and shipping hides category-level regressions. Always break scores down by input type, language, or user segment before declaring a change safe.

### No tracing beyond "logged the final output"

Logging only the model's final text answer, with no record of what context it was given or what tools it called, makes every production bug investigation start from zero. Instrument the full request tree from the beginning.

### Unbounded conversation history

~~~python
# WRONG: appending every turn forever — token cost and latency grow
# unbounded, and old irrelevant context can actively confuse the model.
messages.append({"role": "user", "content": new_message})

# RIGHT: bound history with a token budget, summarize or truncate
# older turns, and re-inject only what's relevant.
def trim_history(messages, max_tokens=4000, token_counter=None):
    while token_counter(messages) > max_tokens and len(messages) > 2:
        messages.pop(1)   # drop oldest non-system turn first
    return messages
~~~

### Treating guardrails as a launch-day checkbox

Running a safety review once before initial launch and never revisiting it as the prompt, retrieval sources, or user base evolves. Guardrail effectiveness needs the same ongoing monitoring as quality and cost — a jailbreak technique that didn't work at launch may work against a later prompt revision.

### Letting "the model provider updated something" go unnoticed

Trailing a "latest" model alias with no pinned version and no re-evaluation process means a provider-side change can silently alter production behavior with zero code change on your end — and no alert fires because nothing in your system "broke" in the traditional sense.

### No named owner for prompt quality

When "the prompt" is nobody's job in particular, it rots: changes accumulate without review, nobody notices gradual quality drift, and incidents have no clear escalation path.
`,

  performance: `
### Measure first

~~~python
# Every LLM call response carries usage data — read it, don't guess.
response = client.chat.completions.create(model="gpt-4o", messages=messages)
usage = response.usage
print(f"input_tokens={usage.prompt_tokens} output_tokens={usage.completion_tokens}")
~~~

Combine per-call token/latency data with an observability platform (LangSmith, Langfuse, or OpenTelemetry spans) to see distributions (p50/p95/p99), not just averages — a mean latency of 800ms can hide a p99 of 8 seconds that's ruining the experience for a meaningful slice of users.

### The optimization hierarchy for an LLMOps pipeline (apply in order)

1. **Shrink the prompt and context** — remove redundant instructions, trim retrieved context to only the most relevant chunks (better retrieval beats "just add more context"), and cache static system-prompt portions where the provider supports prompt caching. Token count reduction directly cuts both cost and latency.
2. **Route to the cheapest model that meets the quality bar** for each request type, rather than defaulting every call to the largest model — see the **Model Routing** skill for the mechanics.
3. **Stream responses** so perceived latency (time to first token) drops even when total generation time doesn't change — critical for chat-style UX.
4. **Parallelize independent calls** (e.g. retrieval and a cheap classification call) instead of serializing everything through one long chain.
5. **Cache repeated or near-duplicate requests** at the application layer (exact-match or semantic cache) to skip the LLM call entirely for common queries.
6. **Batch offline work** (bulk classification, embedding generation) instead of one-request-at-a-time calls, using batch APIs where providers offer discounted batch pricing.
7. **Re-evaluate model/prompt choice as providers release cheaper or faster models** — the frontier moves fast enough that a routing decision made six months ago is often stale.

### What to watch as first-class ops metrics

Cost per request, tokens per request (input/output split), time-to-first-token, total generation time, and eval score — tracked over time and segmented by feature and model, so a regression in any one of these is visible on a dashboard rather than discovered from a user complaint or a billing alert.
`,

  scalability: `
LLMOps scalability has two distinct dimensions: scaling the **runtime traffic** (how many requests per second the app serves) and scaling the **operational discipline itself** (how the eval/monitoring loop keeps working as prompts, features, and team size grow).

### Runtime traffic scaling

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["App instance 1"]
    LB --> API2["App instance 2"]
    LB --> API3["App instance N"]
    API1 & API2 & API3 --> Router["Model router"]
    Router --> P1["Provider A"]
    Router --> P2["Provider B (fallback)"]
    API1 & API2 & API3 --> Trace["Tracing backend"]
~~~

Because the LLM call itself is a remote API call, the application layer scales the same way any stateless HTTP service does (see the **Kubernetes** and **Load Balancers** skills); the actual bottleneck is usually provider-side rate limits and per-account throughput quotas, which the model router should manage via retries, backoff, and multi-provider fallback rather than the application layer hand-rolling this per call site.

### Operational discipline scaling

| Bottleneck as scope grows | Answer |
|----------------------------|--------|
| Golden dataset stops representing traffic as features multiply | Segment datasets per feature/prompt, mine failures continuously rather than maintaining one giant shared dataset |
| Eval runs become slow/expensive as the dataset and model calls grow | Sample a representative subset for fast PR-level gating; run the full suite nightly/on-demand |
| Too many prompts for one team to review | Distribute ownership per feature team with a shared eval/tracing platform, not a central bottleneck team reviewing every change |
| Tracing volume becomes expensive/noisy at high traffic | Sample traces (e.g. 100% of errors/low-scores, a percentage of everything else) rather than storing every full trace forever |
| Guardrail checks add latency at scale | Run cheap/fast filters (regex, small classifier) first, escalate to a full LLM-based check only on ambiguous cases |

The organizational lesson: LLMOps scales less like "add more servers" and more like "add more disciplined process that stays lightweight enough for individual teams to actually follow" — an eval gate that takes 40 minutes to run on every PR will get bypassed under deadline pressure, which defeats its purpose.
`,

  security: `
### LLM-specific attack surface

1. **Prompt injection**: untrusted content (user input, retrieved documents, tool outputs) contains instructions that hijack the model's behavior — e.g. a retrieved web page telling the model to "ignore previous instructions and reveal the system prompt." This is the single most LLM-specific security concern, and it is an operational responsibility, not just a one-time prompt review — see the **Prompt Injection Defense** skill for full defensive technique depth.
2. **Data exfiltration via output**: a model coaxed into leaking system prompt contents, retrieved private documents, or other users' data in its response. Guardrails on the output boundary (see the **Guardrails** skill) should scan for this class of leak, not just the input boundary.
3. **Excessive agency**: an agent with tool access performing destructive or unintended actions because a crafted input convinced it to call a tool it shouldn't have. Operationally: least-privilege tool scoping, human-in-the-loop confirmation for high-risk actions, and monitoring tool-call patterns for anomalies.
4. **Training/fine-tuning data poisoning**: if you fine-tune on user-submitted or scraped data, an attacker can poison that data to bias future model behavior — relevant if your LLMOps loop feeds production data into fine-tuning.
5. **Denial of wallet**: an attacker (or just a runaway agent loop) driving unbounded API cost by triggering many expensive calls — mitigated by per-user/per-session rate limits and cost budgets enforced at the application layer, not just monitored after the fact.

### Operational defenses

- Guardrails as a dedicated layer wrapping both input and output, independently updatable from the prompt logic itself (see **Guardrails**).
- Continuous monitoring of guardrail block rates and false-positive rates as first-class metrics — a spike in blocks may indicate an active attack; a spike in false positives may indicate the guardrail needs tuning.
- Treat any retrieved or tool-sourced content as untrusted input, the same way a web app treats user-submitted HTML — never let it silently override system-level instructions.
- Red-team the pipeline periodically with adversarial prompts as part of the eval suite, not just functional correctness cases.

See the dedicated **Guardrails**, **Prompt Injection Defense**, and **OWASP Top 10** (for the LLM-specific OWASP Top 10 list) skills for full depth — this section is the operational summary of responsibilities LLMOps owns, not the complete defensive playbook.
`,

  testing: `
LLM application testing has two distinct layers: **deterministic tests** (the parts of your system that are ordinary code — retrieval logic, tool functions, request parsing) and **evaluation-based tests** (the parts involving the model's actual output, which need statistical rather than exact-match assertions).

~~~python
# Deterministic layer: test like any normal code — pytest, exact assertions.
def test_trim_history_respects_token_budget():
    messages = [{"role": "system", "content": "sys"}] + [
        {"role": "user", "content": "x" * 100} for _ in range(50)
    ]
    trimmed = trim_history(messages, max_tokens=500, token_counter=count_tokens)
    assert count_tokens(trimmed) <= 500
    assert trimmed[0]["role"] == "system"   # system prompt never dropped

# Evaluation layer: statistical assertions against a golden dataset,
# not a single exact match.
def test_triage_accuracy_meets_threshold():
    avg_score, results = run_eval(triage_prompt_fn, golden_dataset, judge_score)
    assert avg_score >= 0.85, f"triage accuracy regressed: {avg_score}"
    # also assert no category dropped disproportionately
    by_category = group_by(results, key="category")
    for category, cases in by_category.items():
        cat_avg = sum(c["score"] for c in cases) / len(cases)
        assert cat_avg >= 0.75, f"{category} regressed to {cat_avg}"
~~~

### The senior testing doctrine for LLM systems

- **Deterministic code (retrieval, parsing, tool functions) gets normal unit tests** with exact assertions — don't let "the model is non-deterministic" excuse under-testing the 80% of the system that IS deterministic.
- **Model-output-dependent behavior gets evaluation-based tests**: run against a golden dataset, assert on aggregate and per-category scores with thresholds, not exact string matches.
- **Adversarial/safety cases belong in the same suite** as functional cases — prompt injection attempts, jailbreak attempts, and known failure modes should have dedicated golden-dataset entries that must keep scoring well.
- **Regression tests from every real production failure**: when a bad output is found in production, add that exact case to the golden dataset before considering the fix "done" — this is how the dataset stays alive and representative.
- **Run the fast subset on every PR, the full suite nightly** — balance CI speed against eval thoroughness; see the **AI Harness** skill for building this CI infrastructure in depth.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the full trace for the failing request first** — prompt, retrieved context, tool calls, model, parameters, and output, in order. Most "the model is wrong" bugs are actually "the retrieval gave it wrong/insufficient context" bugs, visible immediately in a proper trace.
2. **Reproduce with the exact same inputs against the exact same model version** — provider-side model updates mean "same prompt, different day" can genuinely produce different behavior; pin the model version while debugging.
3. **Isolate which layer is at fault**: replay the retrieval step alone (is the retrieved context actually relevant?), then the prompt alone with corrected context (does the model reason correctly given good input?), before assuming the "model itself" is broken.
4. **Check for prompt drift**: diff the currently-deployed prompt version against what you believe is deployed — a stale cache or a config mismatch serving an old prompt version is a common, boring root cause.
5. **Use the observability platform's session/trace view** (LangSmith, Langfuse) to see the request in the context of the full conversation history, not just the single turn that failed.
6. **Check guardrail logs** — a garbled or truncated output is sometimes the guardrail layer intervening (e.g. redacting content) rather than the model itself misbehaving.
7. **When in doubt, add the failing case to the golden dataset immediately** — even before you've fixed it, this locks in a regression test and prevents the same bug from silently reappearing.

### Debugging cost/latency spikes specifically

- Check for unbounded conversation history growth first — the most common silent cost/latency multiplier.
- Check whether a routing rule accidentally sends traffic to a larger/slower model than intended.
- Check retrieval top-k and chunk size — over-retrieving inflates both token cost and latency without necessarily improving quality.
`,

  monitoring: `
Production LLMOps monitoring rests on four pillars beyond the classical Rate/Errors/Duration trio (see the **Observability** category for the general APM background this extends).

### Quality signals

~~~python
# Periodically re-run the eval suite against a sample of real production
# traffic, not just the static golden dataset, to catch distribution drift.
def scheduled_quality_check(sample_of_prod_requests, judge_score):
    scores = [judge_score(r["input"], r["reference"], r["output"])
              for r in sample_of_prod_requests]
    avg = sum(scores) / len(scores)
    emit_metric("llm_quality_score", avg, tags={"feature": "support_triage"})
~~~

### Cost signals

~~~python
from prometheus_client import Counter

TOKEN_COST = Counter("llm_cost_usd_total", "Cumulative LLM spend", ["feature", "model"])

def record_cost(feature, model, usage, price_in, price_out):
    cost = (usage.prompt_tokens / 1000) * price_in + (usage.completion_tokens / 1000) * price_out
    TOKEN_COST.labels(feature=feature, model=model).inc(cost)
~~~

### Latency signals

Track time-to-first-token separately from total generation time — they answer different UX questions (does the app feel responsive vs. how long until the full answer is done), and streaming optimizations only move the first number.

### Full request tracing

Every request should produce a trace containing: the exact prompt sent, retrieved context (with relevance scores if available), any tool calls and their results, the raw model output, the model/version/parameters used, token usage, latency, and any guardrail actions taken. This is what LangSmith and Langfuse are purpose-built to capture and visualize (see those skills) — a generic APM tool has no native concept of any of these fields.

### Alerting

Alert on symptoms the user or the budget actually feels: quality score dropping below a threshold on the rolling production sample, cost per day exceeding budget, p95/p99 latency exceeding SLA, and guardrail block-rate spiking (possible attack or a broken filter). Alert on causes only as secondary diagnostics once a symptom alert fires.
`,

  deployment: `
### Deploying a prompt/config change safely

~~~dockerfile
# The application container itself deploys like any other service —
# the interesting part is that the PROMPT is fetched at runtime from
# a versioned config source, not baked into this image.
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ src/
ENV PROMPT_REGISTRY_URL="https://config.internal/prompts"
ENV PROMPT_VERSION_PIN="support_triage@v3"
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why this matters: pinning PROMPT_VERSION_PIN as a deploy-time config value (not a hardcoded string in the image) means a prompt rollback is a config change and a restart, not a full container rebuild and redeploy — this is what makes canary and instant-rollback strategies operationally cheap.

### CI/CD pipeline for a prompt change

~~~text
lint/typecheck (app code)
  -> unit tests (deterministic logic: retrieval, parsing, tools)
  -> eval gate (golden dataset, fast subset) — BLOCKS merge on regression
  -> merge
  -> deploy prompt config to canary (5% traffic)
  -> automated comparison: canary metrics vs control (quality, cost, latency)
  -> auto-promote to 100% if healthy, auto-rollback if regressed
  -> nightly: full eval suite + production-sample quality check
~~~

Every gate here mirrors a classical CI/CD pipeline stage, with the eval gate replacing (or sitting alongside) the classical unit/integration test stage as the quality bar specific to LLM behavior.

### Rollback

Because the prompt/config is fetched at runtime rather than compiled into the deployment artifact, rollback is fetching the previous version pin — this should be a one-command or one-click operation, tested in advance (a rollback path you've never exercised is not a real rollback path).
`,

  "production-checklist": `
Before an LLM feature takes real production traffic:

- [ ] Prompt, retrieval config, and model choice are versioned and reviewable like code
- [ ] A golden evaluation dataset exists, covering realistic and known-hard edge cases
- [ ] An automated eval gate runs in CI and blocks merges on quality regression
- [ ] Per-category (not just aggregate) eval scores are tracked and gated
- [ ] Full request tracing is instrumented: prompt, context, tool calls, output, model, cost, latency
- [ ] Cost per request/feature is tracked with a budget alert threshold
- [ ] Time-to-first-token and total latency are both tracked, with SLA-based alerts
- [ ] A staged rollout mechanism (canary/shadow) exists and has been exercised at least once
- [ ] A tested rollback path exists (prompt/config revert, not a full redeploy)
- [ ] Guardrails wrap both the input and output boundary, with block-rate monitoring
- [ ] Model version is explicitly pinned, with a plan to re-evaluate on provider updates
- [ ] Explicit (ratings) and implicit (regeneration/abandonment) feedback signals are captured
- [ ] A clear owner is assigned for prompt quality and incident response
- [ ] Production failures are routinely mined back into the golden dataset
- [ ] A fallback path exists for provider outage or rate-limit exhaustion (see **Model Routing**)
`,

  "common-mistakes": `
1. **Skipping the eval gate "just this once" under deadline pressure** — the one time you skip it is statistically the time a regression ships, because that's exactly when it would have been caught.
2. **Trusting a single aggregate quality score** — hides category-level regressions; always segment.
3. **Not logging retrieved context**, only the final output — makes debugging a "wrong answer" impossible to distinguish from "wrong context given to a correctly-reasoning model."
4. **Letting conversation history grow unbounded** — silently inflates cost and latency, and can degrade quality by burying relevant context in noise.
5. **Treating guardrails as a one-time launch review** rather than an ongoing monitored system — attack techniques evolve after launch.
6. **Never recalibrating the LLM judge against human review** — judges drift and can develop systematic biases (e.g. favoring longer answers) that silently distort what "quality" means in your metrics.
7. **Trailing a "latest" model alias with no pinning** — a provider-side update can change production behavior with zero code change and no clear alert.
8. **No named owner for prompt changes** — prompts rot when review is nobody's explicit job.
9. **Confusing "the demo worked" with "it's ready for production"** — a demo tests a handful of happy-path inputs; production traffic finds every edge case the demo never considered.
10. **Ignoring cost until the bill arrives** — cost should be a pre-launch budgeted, dashboarded, alertable metric, not a monthly surprise.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Quality regresses after a "small" prompt tweak | No eval gate run before merge, or gate only checked aggregate score | Add/enforce automated eval gate with per-category thresholds |
| Cost spikes with no functional change | Conversation history growing unbounded, or a routing rule sending traffic to a bigger model | Bound history with a token budget; audit router config |
| "It works in testing, fails in prod" | Golden dataset doesn't represent real traffic distribution | Continuously mine production failures into the dataset |
| Can't reproduce a reported bad output | No trace of the exact prompt/context/model version used for that request | Instrument full request tracing before this happens again |
| Output quality degrades over weeks with no code change | Provider silently updated the underlying model version | Pin model versions explicitly; re-run eval suite on provider announcements |
| Judge scores don't match human intuition | LLM judge uncalibrated or biased (e.g. favors verbose answers) | Periodically recalibrate judge against human-labeled samples |
| Guardrail blocks legitimate requests at a high rate | Filter rules too aggressive or miscalibrated after a prompt change | Track false-positive rate as a metric; tune thresholds, don't just tighten blindly |
| Canary shows no clear signal either way | Sample size too small or rollout duration too short for the traffic volume | Extend canary duration or increase percentage before deciding |
| Sudden unexplained latency spike | Model provider degradation or rate limiting | Multi-provider fallback in the router; alert on provider-side latency separately from app latency |
`,

  faqs: `
**Q: Is LLMOps just MLOps with a new name?**
No. It shares the philosophy (version, evaluate, monitor, iterate) but the mechanics differ enough to be its own discipline — see the **why-it-exists** and **beginner-concepts** sections for the specific structural differences (prompts as artifacts, non-deterministic evaluation, third-party models).

**Q: Do I need dedicated observability tooling (LangSmith/Langfuse), or can I just use logs?**
Basic structured logging gets you started, but dedicated tools give you trace trees across multi-step pipelines, built-in eval integration, and dataset management for free — worth adopting once you have more than a single-call feature. See the **LangSmith** and **Langfuse** skills.

**Q: How big does a golden dataset need to be?**
There's no fixed number — start with dozens of realistic cases covering the main paths and known edge cases, and grow it continuously from real production failures. A dataset of 50 well-chosen cases that's actively maintained beats a static 500-case dataset frozen at launch.

**Q: Can LLM-as-judge fully replace human evaluation?**
No — it scales evaluation dramatically but needs periodic human calibration; an uncalibrated judge can silently drift from what users actually consider good.

**Q: Who should own prompt changes — engineering, product, or a dedicated "prompt team"?**
Most mature teams give ownership to the feature engineering team, with product input on what "good" means for the rubric — a separate central "prompt team" tends to become a bottleneck and loses context on the feature.

**Q: How is LLMOps different when using an open-source, self-hosted model versus a provider API?**
Self-hosting reintroduces classical MLOps concerns (serving infrastructure, GPU capacity, possibly fine-tuning pipelines) on top of everything in this page — see the **MLOps** skill for that layer; LLMOps concerns (prompt versioning, evaluation, tracing) apply either way.

**Q: Does this apply to simple single-call features, or only complex agents?**
Even a single prompt-and-response feature benefits from versioning and an eval gate; the tracing and multi-step monitoring sections matter more as pipelines gain retrieval and tool-calling steps.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is LLMOps and how does it differ from MLOps?* LLMOps extends MLOps's discipline (version, evaluate, monitor) to a world where the deployable artifact includes prompts and context alongside/instead of trained weights, outputs are non-deterministic and open-ended, and the model is often a third-party API you cannot retrain.
2. *What is a golden dataset and why is it needed?* A curated set of representative and edge-case inputs with expected answers/rubrics, used to score a prompt/pipeline change objectively instead of relying on ad hoc manual testing.
3. *Why can't you just check "accuracy" for an LLM feature the way you would a classifier?* Outputs are open-ended text with no single correct answer; scoring needs rubrics, LLM-as-judge, or human review instead of exact-match accuracy.
4. *What should you log for every LLM request?* The full prompt sent (including system instructions and retrieved context), the model/parameters used, the raw output, token usage, and latency.
5. *Why does streaming matter operationally, if it doesn't reduce total latency?* It reduces time-to-first-token, which is what users perceive as responsiveness, even though the full answer takes the same total time to generate.

**Senior:**

6. *Design an eval gate for a prompt change in CI. What does it check and what blocks a merge?* Runs the candidate prompt/pipeline over a golden dataset, scores via rubric/LLM-judge, compares aggregate AND per-category scores against the current production baseline, and fails the build if any category or the aggregate drops below a defined threshold — mirroring a failing test suite blocking a code merge.
7. *How would you debug a production incident where the model gave a factually wrong answer?* Pull the full trace for that request (prompt, retrieved context, tool calls, model version), isolate whether the retrieval step returned relevant context before assuming the model reasoned incorrectly, reproduce against the pinned model version, and add the case to the golden dataset regardless of root cause.
8. *How do you keep an LLM-as-judge evaluator trustworthy over time?* Periodically sample judge scores against human-labeled ground truth, measure agreement, and recalibrate the judge prompt/rubric when drift or systematic bias (e.g. length bias) is detected.
9. *Design a staged rollout strategy for a system-prompt change on a high-stakes feature.* Shadow-launch first (log outputs without showing users) to validate against real traffic with zero risk, then canary at a small percentage with automated metric comparison against the control, then promote to full traffic only after a sustained healthy window; maintain an instant rollback path throughout.
10. *How does cost management differ for LLM apps versus classical ML inference?* LLM cost scales directly and visibly per request with prompt/output token count, making it a request-level, immediately attributable, budgetable, and alertable metric rather than an amortized infrastructure cost — engineers' prompt design choices directly move the bill.
11. *What operational risk does relying on a third-party model API introduce that fine-tuned in-house models don't have?* The provider can silently update, deprecate, or reprice the model outside your control; mitigations are pinning explicit model versions, re-running the eval suite on provider announcements, and maintaining multi-provider fallback routing.
12. *Who should own prompt review and why?* Generally the feature engineering team with product input on the quality rubric — centralizing in a separate prompt team creates a bottleneck and loses feature-specific context; the review discipline should mirror code review (small diffs, clear changelog, required eval-gate pass).
`,

  "coding-questions": `
### 1. Implement a token-budget-aware conversation trimmer

~~~python
def trim_history(messages, max_tokens, count_tokens):
    """Keep the system prompt and the most recent turns, dropping the
    oldest non-system messages first until under budget.
    messages: list of {"role", "content"} dicts, system prompt is index 0.
    count_tokens(messages) -> int total token count.
    """
    while count_tokens(messages) > max_tokens and len(messages) > 2:
        # index 1 is the oldest non-system message
        messages.pop(1)
    if count_tokens(messages) > max_tokens:
        raise ValueError("cannot fit even system prompt + latest turn in budget")
    return messages

# Complexity: O(n) pops in the worst case, each requiring a token
# recount — for very long histories, track a running token count
# incrementally instead of recomputing count_tokens(messages) each loop.
~~~

Follow-ups: how would you summarize dropped turns instead of discarding them outright? How would you handle a single message that alone exceeds the budget (e.g. a huge pasted document)?

### 2. Build a minimal eval-gate comparator

~~~python
def eval_gate(candidate_scores_by_category, baseline_scores_by_category, tolerance=0.02):
    """Return (passed: bool, failures: list[str]) comparing a candidate
    prompt's per-category scores against a production baseline.
    Both args: {"category": average_score}
    """
    failures = []
    for category, baseline in baseline_scores_by_category.items():
        candidate = candidate_scores_by_category.get(category)
        if candidate is None:
            failures.append(f"{category}: missing from candidate results")
            continue
        if candidate < baseline - tolerance:
            failures.append(f"{category}: regressed {baseline:.3f} -> {candidate:.3f}")
    return (len(failures) == 0, failures)

# Complexity: O(k) over k categories. Discuss: how do you choose
# the tolerance value? (Statistically: based on measured score variance across
# repeated eval runs, not an arbitrary constant.)
~~~

Follow-ups: how would you incorporate statistical confidence (e.g. standard error across multiple eval runs) instead of a flat tolerance? How do you handle a brand-new category with no baseline yet?

### 3. Simple cost-tracking rate limiter per feature

~~~python
import time
from collections import defaultdict

class CostBudgetGuard:
    """Reject requests once a feature exceeds its per-minute cost budget."""
    def __init__(self, budget_usd_per_minute):
        self.budget = budget_usd_per_minute
        self.spend_by_window = defaultdict(float)

    def _window(self):
        return int(time.time() // 60)

    def check_and_record(self, feature, projected_cost):
        window = self._window()
        key = (feature, window)
        if self.spend_by_window[key] + projected_cost > self.budget:
            raise RuntimeError(f"{feature} exceeded budget for window {window}")
        self.spend_by_window[key] += projected_cost
        return True

# Complexity: O(1) per check. Follow-up: this in-memory guard doesn't
# work across multiple app instances — how would you make it
# distributed (e.g. Redis with a TTL'd counter per window)?
~~~
`,

  "hands-on-labs": `
### Lab 1 — Build and run a golden-dataset eval (beginner, ~1.5h)
Write a 20-case golden dataset (JSON) for a simple classification prompt (e.g. support-ticket triage). Implement run_eval using exact-match scoring first, then swap in an LLM-as-judge scorer and compare results. Deliverable: a report comparing exact-match vs judge scores and where they disagree. Skills: golden datasets, basic evaluation.

### Lab 2 — Instrument full request tracing (intermediate, ~2h)
Take a small RAG pipeline (retrieval + LLM call) and instrument it so every request logs a structured trace: retrieved chunks with scores, the full prompt, the model response, token usage, and latency, all tied together by a request ID. Deliverable: given a request ID, print a human-readable trace of exactly what happened. Skills: structured logging, trace design — the DIY version of what LangSmith/Langfuse give you out of the box.

### Lab 3 — Wire an eval gate into CI (advanced, ~3h)
Set up a GitHub Actions workflow that runs your Lab 1 eval suite on every pull request touching a prompts/ directory, fails the build if the aggregate or any per-category score regresses more than a set tolerance versus a stored baseline, and posts the per-category breakdown as a PR comment. Deliverable: a PR that intentionally regresses the prompt and gets blocked, plus one that passes. Skills: CI/CD, eval-gate design.

### Lab 4 — Canary rollout with monitoring and rollback (production, ~4h)
Deploy two versions of a prompt behind a feature flag: route 90% of simulated traffic to v1 (control) and 10% to v2 (candidate). Log cost, latency, and quality-judge scores per version, build a small dashboard comparing them, and implement an automatic rollback rule (revert to v1 if v2's judge score drops below a threshold over N requests). Deliverable: a demo showing the automatic rollback firing when you deliberately ship a regressive v2. Skills: staged rollout, monitoring, alerting — the full production lifecycle end to end.
`,

  "real-projects": `
Portfolio-grade projects demonstrating LLMOps maturity to an employer:

1. **Prompt registry + eval-gated CI pipeline** — A small service with prompts stored as versioned files, a golden dataset, an LLM-as-judge scorer, and a GitHub Actions workflow that blocks merges on regression, with per-category score reporting on every PR. Demonstrates: prompt versioning, evaluation design, CI/CD integration for non-deterministic systems.

2. **Traced RAG assistant with cost/quality dashboard** — A retrieval-augmented Q&A service instrumented with full request tracing (retrieval scores, prompt, output, tool calls if any), a cost-per-request tracker with budget alerts, and a small dashboard (even a simple Grafana/Streamlit view) showing quality score, cost, and latency trends over time. Demonstrates: observability design, the metrics that matter for LLM production systems.

3. **Canary rollout simulator with automatic rollback** — A system that simulates production traffic against two prompt/model variants, tracks comparative metrics in real time, and automatically promotes or rolls back based on statistically-informed thresholds (not a single point-estimate comparison). Demonstrates: staged rollout design, statistical rigor in evaluation, production safety thinking.

Each project: version-controlled prompts with changelogs, a documented golden dataset with rationale for case selection, a README explaining the eval methodology and rollout strategy, and a written retrospective on what the eval gate did and didn't catch. The operational rigor around the prompt — not the prompt's cleverness — is what signals senior LLMOps competence to an interviewer.
`,

  "case-studies": `
### Klarna's customer service assistant
Klarna has publicly discussed operating an LLM-based assistant handling a substantial share of customer service interactions. A deployment at that scale and customer-facing risk level cannot function on ad hoc prompt tweaks — it requires exactly the staged-rollout, monitoring, and feedback-loop discipline this page describes, because a silent quality regression at that volume translates directly into a large number of poor customer experiences before anyone notices without proper monitoring. Lesson: the bigger the blast radius of a feature, the less optional every stage of the LLMOps lifecycle becomes.

### GitHub Copilot's acceptance-rate feedback loop
Copilot's suggestion acceptance/rejection behavior functions as a continuous, massive-scale implicit feedback signal — every accepted or dismissed suggestion is information about prompt and model quality, aggregated across huge usage volume. Lesson: implicit signals (not just explicit thumbs up/down) can be a rich, low-friction feedback source when the product surface naturally generates them.

### The industry-wide shift from manual to LLM-as-judge evaluation
As LLM features scaled from single-digit prompt variants to large numbers of continuously-iterated prompts across many companies, purely human evaluation could not keep pace with iteration speed, driving broad industry adoption of LLM-as-judge scoring as the practical (if imperfect) way to gate changes fast enough to match engineering velocity. Lesson: evaluation strategy has to scale with iteration speed, or the eval gate becomes a bottleneck teams route around under pressure — which defeats its purpose entirely.

### Provider-side model updates causing unannounced behavior shifts
Multiple teams across the industry have reported behavior changes in production features that traced back to a provider updating the model behind a "latest" alias with no application-side code change. Lesson: pinning model versions explicitly and re-running the eval suite on provider announcements is not paranoia — it is the direct operational response to a documented, recurring failure mode of building on third-party models you don't control.
`,

  comparisons: `
| Dimension | LLMOps | Classical MLOps | Classical DevOps/SRE |
|-----------|--------|-------------------|------------------------|
| Deployable artifact | Prompt + context + model choice + tools | Trained model weights + pipeline | Application code |
| "Correctness" metric | Rubric / LLM-judge score, no single ground truth | Accuracy/F1/AUC against labeled test set | Pass/fail tests, uptime |
| Retraining | Rare/never (third-party model) — prompt/context engineering instead | Regular retraining pipelines | N/A |
| Cost model | Per-request, directly tied to prompt/output length | Amortized infra cost, mostly training-time | Amortized infra cost |
| Key ops artifact | Golden dataset + eval gate | Feature store + model registry | Test suite + CI/CD |
| Observability need | Full trace: prompt, context, tool calls, reasoning steps | Feature drift, prediction distribution | Logs, metrics, traces (Rate/Errors/Duration) |
| Safety concern | Prompt injection, jailbreaks, harmful generation | Bias, fairness, data leakage | Traditional AppSec (injection, auth, etc.) |

**How seniors choose what to apply**: if you're calling a third-party LLM API with prompts and RAG, you're squarely in LLMOps territory — adopt prompt versioning, eval gates, and tracing first. If you're training or fine-tuning your own models, you additionally need classical MLOps infrastructure (see the **MLOps** skill) — LLMOps and MLOps compose rather than compete; a team fine-tuning an open-source model on their own infra runs both disciplines simultaneously, MLOps for the training/serving pipeline and LLMOps for the prompt/context/evaluation layer on top.
`,

  "related-technologies": `
- **Prompt Versioning** — the deep dive on treating prompts as deployable, reviewable, rollback-able artifacts; this page only introduces the concept.
- **Model Routing** — the deep dive on cost/quality-aware selection between models and providers per request; this page only introduces cost-guard basics.
- **AI Evals** — how to actually design rubrics, golden datasets, and LLM-as-judge scorers rigorously; the evaluation practice this whole page's eval gate depends on.
- **AI Harness** — the testing/CI infrastructure that runs those evals automatically and reports results; the plumbing behind "the eval gate."
- **LangSmith** / **Langfuse** — concrete observability platforms purpose-built for LLM request tracing, dataset management, and eval integration.
- **Cost Optimization** — the deeper production-cost-management practices this page's cost section only summarizes.
- **Latency** — the deeper production-latency-management practices this page's performance section only summarizes.
- **Guardrails** / **Prompt Injection Defense** — the safety layer this page assigns as an LLMOps operational responsibility but does not itself cover in defensive depth.
- **MLOps** — the classical-ML operations discipline LLMOps extends; relevant in full if you train or fine-tune your own models rather than only calling a provider API.
- **RAG** / **Vector Databases** — the retrieval layer whose quality is one of the most common root causes of "bad LLM output" investigated during LLMOps debugging.

On this platform, the natural next pages after this one: **Prompt Versioning** → **AI Evals** → **Model Routing** → **Guardrails**, each deepening one stage of the lifecycle this page introduced.
`,

  "latest-updates": `
This page reflects general industry practice and public information up to early-to-mid 2026 (this author's knowledge cutoff is January 2026); treat any specific claim about a named company's current internal tooling or a provider's current pricing/rate-limit policy as potentially stale and worth verifying against current official sources before relying on it operationally.

Directionally, as of this writing the field has been moving toward: LLM-as-judge evaluation becoming the default rather than the exception for gating prompt changes at teams with meaningful iteration velocity; observability platforms (LangSmith, Langfuse, and others) maturing from "nice to have" tracing add-ons into standard infrastructure comparable to how APM tools became standard for classical web services; cost-aware model routing becoming a common production pattern as the number of viable model providers and price/quality tiers has grown; and guardrails/safety monitoring shifting from a pre-launch review exercise into an ongoing, metrics-tracked operational responsibility as agentic systems with tool access have become more common.

Given how fast model capabilities, pricing, and provider offerings change, always check current official provider documentation and recent conference talks/blog posts (see **videos** and **blogs** sections) for the latest specifics rather than treating any single source — including this page — as permanently current on numbers or product names.
`,

  "future-roadmap": `
Where LLMOps appears to be heading, based on the trajectory visible as of this writing (treat as informed speculation, not certainty):

- **Evaluation tooling maturing further**: better-calibrated, more standardized LLM-judge methodologies, and likely more shared/open benchmark datasets for common task categories, reducing how much every team has to build eval infrastructure from scratch.
- **Tighter integration between observability and eval tooling**: platforms increasingly let a production failure traced in the observability layer become a golden-dataset case with one click, closing the feedback loop faster.
- **Model routing becoming more automatic and dynamic**: routing decisions increasingly informed by live quality/cost telemetry rather than static rules, edging toward continuous, data-driven provider/model selection.
- **Agentic systems increasing the surface area LLMOps must cover**: as multi-step, tool-using agents become more common, tracing, evaluation, and guardrails all need to handle much longer, branchier request trees than a single prompt-response pair.
- **Organizational maturity catching up to tooling maturity**: as the tooling gap narrows, the differentiator between teams increasingly becomes process discipline (does the eval gate actually block merges? is there a named owner?) rather than which specific tool they use.

What to bet career time on: the underlying skills — designing rigorous evaluation, building full-pipeline observability, and running staged rollouts safely — transfer across whatever specific tools or model providers come and go. Tool-specific expertise (a specific platform's dashboard) is far more replaceable than the evaluation and operational-rigor mindset this page teaches.
`,

  "cheat-sheet": `
~~~text
LLMOPS AT A GLANCE

LIFECYCLE
  prompt dev -> offline eval (golden dataset) -> staged rollout (shadow/canary)
    -> production monitoring (tracing) -> feedback loop -> back to prompt dev

WHAT'S DEPLOYABLE (not just weights)
  system prompt + few-shot examples + retrieval strategy
  + model/provider + parameters + tool definitions

EVAL GATE (CI)
  run candidate over golden dataset
  score via exact-match / rubric / LLM-as-judge
  compare AGGREGATE and PER-CATEGORY vs baseline
  block merge if regression beyond tolerance

STAGED ROLLOUT
  shadow  -> log only, zero user risk
  canary  -> small % of real traffic, compare vs control
  promote -> full traffic once metrics healthy
  rollback -> revert PROMPT_VERSION_PIN config, not a redeploy

TRACE EVERY REQUEST
  prompt sent | retrieved context | tool calls | raw output
  model + version + params | token usage | latency | guardrail actions

COST (per-request, directly attributable)
  cost = (input_tokens/1000)*price_in + (output_tokens/1000)*price_out
  budget-guard BEFORE the call, alert on daily spend by feature

LATENCY
  stream for time-to-first-token; total gen time is separate metric
  track p50/p95/p99, not just average

FEEDBACK SIGNALS
  explicit: thumbs up/down, corrections
  implicit: regenerated / copied / abandoned / escalated
  -> mine failures into the golden dataset continuously

GUARDRAILS
  wrap INPUT and OUTPUT boundary, independent of prompt logic
  monitor block rate + false-positive rate as ongoing metrics

OWNERSHIP
  prompt changes reviewed like code, named owner per feature
  never edit a live prompt directly in a running service
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is LLMOps in one sentence? | The discipline of developing, evaluating, deploying, and monitoring LLM-powered applications reliably in production. |
| What are the three core structural differences from classical MLOps? | Prompts/context are deployable artifacts too; outputs are non-deterministic/open-ended so evaluation is harder; the model is often a third-party API you can't retrain. |
| What are the five stages of the LLMOps lifecycle? | Prompt development, offline evaluation, staged rollout, production monitoring, feedback loop. |
| What is a golden dataset? | A curated set of representative and edge-case inputs with expected answers or grading rubrics, used to score prompt/pipeline changes objectively. |
| What is LLM-as-judge? | Using a (often cheaper/faster) model call to score a candidate output against a rubric, replacing exact-match scoring for open-ended text. |
| Why is per-category eval scoring important, not just aggregate? | An aggregate average can hide a category that regressed badly while others improved, giving false confidence. |
| What's the difference between shadow and canary rollout? | Shadow logs the new version's output without showing it to users (zero risk); canary actually serves a small percentage of real traffic to the new version. |
| Why should prompts be fetched at runtime rather than hardcoded? | So a rollback is a config change, not a full container rebuild/redeploy. |
| Why is LLM cost a first-class ops concern unlike classical inference cost? | It scales directly and visibly per request with prompt/output token count, driven by engineering choices, not just infra sizing. |
| What should a full LLM request trace capture? | Prompt sent, retrieved context, tool calls, raw output, model/version/params, token usage, latency, guardrail actions. |
| Why does streaming matter if it doesn't reduce total latency? | It reduces time-to-first-token, which is what users perceive as responsiveness. |
| What's an explicit vs implicit human feedback signal? | Explicit: thumbs up/down, corrections. Implicit: regeneration, abandonment, escalation to a human. |
| Why must LLM judges be recalibrated periodically? | They can drift or develop systematic biases (e.g. favoring longer answers), silently distorting quality metrics. |
| Why pin model versions explicitly? | A provider updating a "latest" model alias can silently change production behavior with no code change and no alert. |
| Who should typically own prompt changes? | The feature engineering team, reviewed like code, not a separate centralized "prompt team." |
`,

  mcqs: `
**1. What is the primary reason evaluation is harder for LLM applications than for classical ML classifiers?**
A) LLMs are slower to call
B) Outputs are open-ended and non-deterministic with no single correct label
C) LLMs cost more per call
D) LLMs don't return structured data

*Answer: B — classical accuracy/F1-style metrics assume a single correct label; open-ended text needs rubrics or LLM-judge scoring instead.*

**2. In a staged rollout, what is the key difference between "shadow" and "canary"?**
A) Shadow uses a bigger model, canary uses a smaller one
B) Shadow logs outputs without showing users; canary serves a small percentage of real user traffic
C) They are the same thing with different names
D) Canary is only for classical ML, shadow is only for LLMs

*Answer: B — shadow validates with zero user-facing risk; canary actually exposes a small slice of real users to the new version while comparing metrics.*

**3. Why is per-category eval scoring recommended over a single aggregate score?**
A) It's required by most observability tools
B) An aggregate score can hide a category that regressed while others improved, masking real problems
C) Aggregate scores are always inaccurate
D) Categories run faster to evaluate individually

*Answer: B.*

**4. Why does LLM cost management differ from classical ML inference cost management?**
A) LLM cost scales directly and visibly per request based on prompt/output token count, making it a request-level, attributable, budgetable metric
B) LLMs are always cheaper than classical models
C) LLM cost is fixed regardless of traffic
D) Classical ML inference has no cost at all

*Answer: A.*

**5. What is the main operational risk of relying on a third-party LLM provider API rather than a self-trained model?**
A) You cannot use the model at all in production
B) The provider can silently update, deprecate, or reprice the model outside your control
C) Third-party APIs are always slower
D) There is no risk difference

*Answer: B — this is why pinning model versions and re-running the eval suite on provider announcements is a recommended practice.*

**6. What should trigger adding a new case to the golden dataset?**
A) Only when a new feature is launched
B) A real production failure or edge case discovered, regardless of whether it's been fixed yet
C) Only if a human explicitly requests it
D) Golden datasets should never change once created

*Answer: B — continuously mining production failures into the golden dataset is what keeps evaluation representative of real traffic over time.*
`,

  "revision-notes": `
LLMOps is the operational discipline for running LLM-powered applications reliably in production, extending classical MLOps to account for three structural differences: prompts and context are deployable artifacts alongside (or instead of) model weights; outputs are open-ended and non-deterministic, making evaluation fundamentally different from classification-accuracy metrics; and the model itself is frequently a third-party API you don't train or control, shifting the operational burden toward prompt/context engineering and provider management rather than training pipelines.

The lifecycle is a continuous loop, not a one-time launch: prompt development, offline evaluation against a golden dataset (scored via rubric or LLM-as-judge since exact-match rarely applies), staged rollout (shadow then canary before full production), production monitoring via full request tracing, and a feedback loop from explicit (ratings) and implicit (regeneration, abandonment) signals back into the next round of prompt or retrieval improvements. Prompts should be versioned and reviewed like code, with an automated eval gate in CI blocking merges on quality regression — checked per-category, not just on an aggregate score, since averages hide subgroup regressions.

Cost and latency are first-class, directly attributable, per-request operational metrics in LLMOps in a way they aren't in classical inference — cost scales visibly with every prompt/output token, and streaming matters for perceived latency (time-to-first-token) even when it doesn't change total generation time. Observability must capture the full request tree — prompt, retrieved context, tool calls, and final output — because a bad answer is as often caused by bad retrieval upstream as by the model itself, and dedicated tools (LangSmith, Langfuse) exist specifically because generic APM has no concept of these fields.

Guardrails and safety monitoring are an ongoing operational responsibility, not a launch-day checkbox — block rates and false-positive rates should be tracked metrics, because attack techniques and prompt-injection vectors evolve after launch. Organizationally, prompt changes should have a clear owner (usually the feature engineering team) and a review process mirroring code review, because prompts with no explicit owner rot silently.

A reference production pipeline ties all of this together: a prompt registry feeds an eval gate in CI, which gates a canary rollout, which feeds a tracing/observability dashboard, which feeds alerting on quality, cost, and latency regressions — and whose failures feed back into the golden dataset, closing the loop. LLMOps composes with, rather than replaces, classical MLOps for teams that also train or fine-tune their own models, and with the specialized skills (Prompt Versioning, Model Routing, AI Evals, Guardrails) that each deepen one stage of this lifecycle.
`,

  "learning-roadmap": `
### Week 1 — Foundations and evaluation basics
Read this page fully; build the beginner-concepts eval loop against a small hand-written golden dataset for a simple prompt. Milestone: you can run a prompt over 10-20 cases and produce a pass/fail score without any manual eyeballing.

### Week 2 — Tracing and observability
Instrument a small LLM feature (even a toy one) with full request logging: prompt, context, output, tokens, latency. Explore either LangSmith or Langfuse hands-on. Milestone: given any request ID, you can reconstruct exactly what happened end to end.

### Week 3 — Eval gates in CI and staged rollout
Wire your eval suite into a CI workflow that blocks a regression. Build a simple canary simulation (two prompt versions, split traffic, compare metrics). Milestone: you've seen a deliberately broken prompt get blocked automatically, and a canary rollout catch a regression before full deployment.

### Week 4 — Cost, latency, and safety operationalized
Add cost tracking with a budget alert, measure time-to-first-token with streaming, and add a basic guardrail layer with block-rate monitoring. Milestone: you have dashboards (even simple ones) for quality, cost, and latency, plus one working guardrail.

### Where to go next
This page is the broad overview; deepen each lifecycle stage with the specialized platform skills: **Prompt Versioning** (treating prompts as deployable artifacts in depth), **AI Evals** (rigorous evaluation design), **Model Routing** (cost/quality-aware request routing), and **Guardrails** / **Prompt Injection Defense** (the safety layer). A natural next skill to study after this one is **Prompt Versioning**, since it's the most immediately actionable deepening of the lifecycle's first stage.
`,

  "official-docs": `
- **OpenAI Platform docs** (platform.openai.com/docs) — API reference, usage/token accounting, and evaluation guidance for building on their models; check for the latest structured-output and function-calling capabilities relevant to tracing.
- **Anthropic docs** (docs.anthropic.com) — API reference, prompt engineering guidance, and tool-use documentation directly relevant to building the pipelines this page describes operating.
- **LangSmith docs** (docs.smith.langchain.com) — concrete documentation for the tracing/eval/dataset tooling referenced throughout this page; see the dedicated **LangSmith** skill for depth.
- **Langfuse docs** (langfuse.com/docs) — open-source alternative observability platform docs, covering tracing, evaluation, and prompt management; see the dedicated **Langfuse** skill.
- **OpenTelemetry docs** (opentelemetry.io/docs) — the general-purpose tracing standard, useful if building custom LLM observability instrumentation rather than adopting a dedicated platform.

As with all fast-moving tooling, treat specific feature names/pricing as potentially outdated versus what's current on each vendor's site — verify before relying on a specific claim operationally.
`,

  books: `
- **"Designing Machine Learning Systems" by Chip Huyen** — not LLM-specific but the best available treatment of the production ML systems thinking (data flow, monitoring, feedback loops) that LLMOps directly extends.
- **"Building LLM Powered Applications" (various current titles from O'Reilly and similar publishers)** — look for current editions covering RAG, evaluation, and production patterns; this is a fast-moving space so prefer the most recently published title you can find covering these specifics.
- **"Prompt Engineering for Generative AI" by James Phoenix and Mike Taylor** — deep coverage of the prompt-development stage that feeds directly into the LLMOps lifecycle described here.
- **"Accelerate" by Nicole Forsgren, Jez Humble, Gene Kim** — not LLM-specific, but the foundational DevOps research this page's staged-rollout and CI-gate philosophy is built on; understanding why continuous delivery works informs why the same discipline matters for prompts.
- **"Site Reliability Engineering" (Google, free online)** — the SRE playbook for monitoring, alerting, and incident response that the production-monitoring sections of this page directly borrow from.

This is a genuinely fast-evolving space with few settled "canonical" LLMOps-specific books as of this writing — treat blog posts and conference talks from practitioner teams (see **blogs** and **videos**) as equally important, current sources alongside any book.
`,

  blogs: `
- **The Anthropic and OpenAI engineering blogs** — periodic posts on evaluation methodology, safety practices, and production patterns straight from the model providers.
- **The LangChain and Langfuse blogs** — practitioner-focused posts specifically about LLMOps tooling patterns (tracing, evaluation, prompt management) since these companies build the tooling this page describes.
- **Eugene Yan's writing (eugeneyan.com)** — high-signal, practitioner-level posts on applied ML and LLM evaluation/production patterns, widely cited in the AI engineering community.
- **Chip Huyen's blog (huyenchip.com)** — production ML systems thinking, increasingly covering LLM-specific operational concerns.
- **Hamel Husain's writing on LLM evaluation** — specifically focused, hands-on posts on building evaluation systems for LLM applications, a frequently cited practitioner voice on this exact topic.

Prefer posts with concrete code and named production systems over generic "how to prompt engineer" listicles — the former teaches the operational discipline this page is about; the latter rarely does.
`,

  "research-papers": `
LLMOps as an operational discipline is thin on dedicated academic papers — it's primarily an industry practice assembled from engineering experience rather than a research subfield with its own canonical literature. The closest and most relevant foundational reading instead comes from adjacent research areas:

- **"Attention Is All You Need" (Vaswani et al., 2017)** — the Transformer architecture underlying every model this page discusses operating; foundational context for understanding what you're actually running ops around.
- **Research on LLM evaluation and benchmarking** (e.g. work behind widely used benchmarks like MMLU, HELM) — relevant background for understanding the strengths and limits of automated evaluation approaches this page's eval-gate concept depends on.
- **Research on LLM-as-judge methodology** (e.g. papers studying agreement between LLM judges and human raters, and known biases like verbosity/position bias in judge scoring) — directly relevant to the judge-calibration practice described in this page's advanced-concepts section; search current literature for the latest findings, as this area is actively being studied.
- **RLHF and instruction-tuning papers** (e.g. work behind InstructGPT-style training) — relevant background for understanding how human feedback signals, similar in spirit to the feedback loop this page describes, have been used to improve models at the provider level.

If you need genuinely academic grounding for LLMOps practices, treat this section as a starting point for search rather than an exhaustive bibliography — the practical, current best sources for this specific discipline are practitioner blog posts and conference talks (see **blogs** and **videos**), not peer-reviewed papers.
`,

  videos: `
- **Conference talks from LangChain's and Langfuse's own conferences/webinars** — practitioner walkthroughs of building tracing, evaluation, and prompt-management pipelines, directly on-topic for this page.
- **Talks from AI engineering-focused conferences (e.g. the AI Engineer Summit series)** — look for sessions specifically on evaluation, observability, and production LLM patterns; this conference series has become a hub for exactly this practitioner knowledge.
- **Hamel Husain's talks/workshops on LLM evaluation** — hands-on, code-heavy sessions on building evaluation systems, frequently referenced in the practitioner community for this exact topic.
- **Company engineering-team talks on their production AI systems** — search for specific companies known to run large-scale LLM features (search "[company name] engineering blog LLM production" for current talks, since specific talk titles/dates age quickly).

Because specific video titles, speakers, and dates change frequently and this author cannot verify current URLs, search for the most recent talks from the sources above rather than relying on this list to name exact videos — verify with a current search before citing a specific talk.
`,

  "github-repos": `
- **langchain-ai/langchain** — the most widely adopted framework for building LLM pipelines (prompts, retrieval, chains, agents); useful for seeing common LLMOps integration patterns in real code, even if you don't adopt the framework wholesale.
- **langfuse/langfuse** — open-source LLM observability and evaluation platform; directly relevant, inspectable source code for how production tracing/eval tooling is actually built.
- **openai/evals** — OpenAI's framework for building and running evaluations against models; a concrete, inspectable reference implementation of the eval-gate concept this page describes.
- **confident-ai/deepeval** — an open-source LLM evaluation framework with built-in metrics and LLM-as-judge scoring, useful as a reference or drop-in tool for the evaluation stage.
- **guardrails-ai/guardrails** — an open-source framework for building input/output guardrails around LLM calls, directly relevant to the safety-monitoring section of this page.
- **run-llama/llama_index** — a widely used retrieval/RAG framework; useful for seeing how retrieval-stage tracing and evaluation are handled in a real, large open-source codebase.
- **BerriAI/litellm** — a widely used library for routing/calling multiple LLM providers through a unified interface, directly relevant background for the **Model Routing** skill this page cross-references.

As with any fast-moving open-source ecosystem, check each repo's current activity/stars/maintenance status before adopting — popularity and maintenance quality shift quickly in this space.
`,

  "practice-problems": `
Ordered by the skill focus they exercise:

1. **Golden dataset design**: given a described LLM feature (e.g. a customer-support triage bot), write a 15-case golden dataset covering the main paths, two ambiguous edge cases, and one adversarial/prompt-injection case, with a scoring rubric for each.
2. **Eval-gate threshold design**: given historical eval score variance data (e.g. scores across 10 repeated runs of the same prompt), design a statistically-informed regression threshold rather than an arbitrary flat number, and justify your choice.
3. **Trace reconstruction debugging**: given a synthetic full request trace (prompt, retrieved chunks with relevance scores, tool call results, final output) that produced a wrong answer, identify which layer (retrieval, prompt, or model reasoning) most likely caused the failure and justify your reasoning from the trace alone.
4. **Rollout strategy selection**: given three described feature scenarios (a low-stakes internal tool, a customer-facing chat assistant, and a medical-information assistant), choose and justify an appropriate staged-rollout strategy for a prompt change in each.
5. **Cost regression root-causing**: given a described scenario where per-request cost tripled with no visible functional change, list the top three most likely causes and how you'd confirm each from tracing/monitoring data.
6. **Judge calibration exercise**: given a set of LLM-judge scores alongside human ratings for the same outputs that disagree systematically in one direction, hypothesize the bias and propose a rubric fix.

External practice: build variations of the hands-on labs above against a real API with your own small dataset — the skill only solidifies with a real, running eval loop, not just reading about one.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Registry["Prompt & Config Registry"]
        PV["Versioned prompts + configs"]
    end
    subgraph CI["CI Pipeline"]
        EG["Eval gate: golden dataset + LLM judge"]
    end
    subgraph Rollout["Staged Rollout"]
        SH["Shadow launch"]
        CN["Canary (5-10% traffic)"]
    end
    subgraph Prod["Production Runtime"]
        APP["App / API layer"]
        GD["Guardrails (input/output)"]
        RT["Model router"]
        RAG["Retrieval layer"]
        LLM["LLM provider(s)"]
        TL["Tool execution"]
    end
    subgraph Obs["Observability & Feedback"]
        TR["Tracing platform"]
        AL["Alerting: quality/cost/latency"]
        FB["Feedback store"]
    end

    PV --> EG
    EG -->|pass| SH --> CN --> APP
    EG -->|fail| PV
    APP --> GD --> RT
    RT --> RAG --> LLM
    RT --> LLM
    LLM --> TL --> LLM
    LLM --> GD --> APP
    APP --> TR --> AL
    APP --> FB
    AL -->|regression| CN
    FB -->|mined failures| PV
    TR -->|failure cases| PV
~~~

This is the full reference production architecture this page describes: a prompt registry gated by CI evaluation, promoted through staged rollout, running behind guardrails and a model router in production, fully traced, alerted on, and continuously fed back into the registry and golden dataset.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((LLMOps))
    Foundations
      Extends MLOps
      Prompts as artifacts
      Non-deterministic evaluation
      Third-party models
    Lifecycle
      Prompt development
      Offline evaluation
      Staged rollout
      Production monitoring
      Feedback loop
    Evaluation
      Golden datasets
      LLM-as-judge
      Per-category scoring
      Judge calibration
    Deployment
      Prompt registry
      Eval gate in CI
      Shadow launch
      Canary rollout
      Rollback
    Observability
      Full request tracing
      Prompt + context + tool calls
      Cost per request
      Latency and streaming
    Human Feedback
      Explicit ratings
      Implicit signals
      Failure mining
    Safety
      Guardrails
      Prompt injection defense
      Block rate monitoring
    Organization
      Prompt ownership
      Review like code
      Named on-call owner
    Related Skills
      Prompt Versioning
      Model Routing
      AI Evals
      AI Harness
      LangSmith and Langfuse
      Cost Optimization
      Latency
      Guardrails
      MLOps
~~~
`,
};

export default llmops;
