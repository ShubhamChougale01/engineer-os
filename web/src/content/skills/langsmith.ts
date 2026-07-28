import type { SkillContent } from "../types";

/**
 * LangSmith — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const langsmith: SkillContent = {
  overview: `
LangSmith is a platform for tracing, evaluating, and monitoring applications built on large language models. It was created by the LangChain team and ships as a hosted SaaS product (with a self-hosted enterprise option), designed to answer the question every AI engineer eventually asks in production: "why did the model do that, and is it still doing that reliably at scale?"

Where classical Application Performance Monitoring (APM) tools like Datadog or New Relic answer "was the request fast, did it error," LangSmith answers a harder set of questions specific to LLM applications: what exact prompt was sent, what did the model retrieve before answering, which tool calls fired and in what order, how many tokens and dollars did this cost, and — critically — was the output actually GOOD. A single user-facing request in a modern LLM app is rarely one model call; it is a tree of retrieval steps, sub-agent calls, tool invocations, and re-prompts, and you need to see that whole tree to debug a quality regression.

LangSmith's three pillars are tracing (capturing every step of a run as a structured, inspectable tree), datasets and evaluation (curating example inputs/expected outputs and scoring your application's outputs against them, including with LLM-as-judge evaluators), and monitoring (dashboards over production traffic — latency, cost, error rate, and human/automated feedback scores). It layers on top of, but does not require, the LangChain and LangGraph frameworks: its Python and JavaScript SDKs can instrument any LLM call site via a decorator or context manager, so teams using raw OpenAI/Anthropic SDKs, LlamaIndex, or custom agent loops can adopt it too — though the tightest, most automatic integration remains with LangChain and LangGraph, whose internals emit LangSmith-compatible trace events natively. For the framework itself, see the **LangChain** and **LangGraph** skills; for how LangSmith fits into the wider discipline of running LLM systems in production, see the **LLMOps** skill.

Key characteristics: trace-first (everything is a nested run/span tree, not a flat log line), evaluation-native (datasets and evaluators are first-class objects, not an afterthought bolted onto logs), commercial and hosted-first (a generous free tier exists, but production usage at scale is a paid product), and framework-adjacent (built by LangChain's maintainers, so LangChain/LangGraph apps get tracing essentially "for free" via environment variables, while non-LangChain apps use an explicit SDK).
`,

  history: `
LangSmith was built by **Harrison Chase** and the **LangChain, Inc.** team as the natural next step after LangChain (the orchestration framework) exposed a painful gap: as soon as developers chained more than two or three LLM calls together, they lost the ability to see what was actually happening inside the chain. Print-statement debugging of a multi-step agent quickly becomes unworkable — LangSmith was built to give that invisible execution tree a UI.

| Period | Milestone |
|--------|-----------|
| 2022 | LangChain (the framework) launches and rapidly becomes the default way to build LLM chains and agents in Python and JavaScript |
| 2023 (Feb) | LangChain, Inc. is founded; internal tracing tooling used to debug LangChain's own chains during rapid framework growth |
| 2023 (mid) | LangSmith enters private beta as a hosted tracing and debugging platform for LangChain applications |
| 2023 (Jul) | LangSmith opens to public beta; adds dataset creation from traces and initial evaluation chains |
| 2023–2024 | Evaluation becomes a first-class feature: off-the-shelf and custom evaluators, including LLM-as-judge graders, plus a dataset/experiment comparison UI |
| 2024 | LangGraph (the graph-based agent framework) ships with LangSmith as its default observability layer; annotation queues and a Prompt Hub (prompt versioning/registry) are introduced |
| 2024–2025 | Monitoring dashboards mature (latency percentiles, cost tracking, feedback-score trends); self-hosted/hybrid deployment options expand for enterprise customers who cannot send data to a third-party SaaS |
| 2025+ | Continued investment in agent-specific evaluation (multi-turn, tool-use trajectories) and production monitoring; exact current feature/pricing tiers should be checked against the official docs since this platform iterates quickly |

The throughline: LangSmith was not designed top-down as a generic observability product — it grew out of the LangChain team's own dogfooding pain of debugging their own increasingly complex chains, which is why its data model (runs, traces, datasets, evaluators) maps so naturally onto how LangChain and LangGraph execute internally.
`,

  "why-it-exists": `
Before LangSmith (and tools like it), teams building LLM applications debugged them the way people debugged software in the 1990s: print statements, ad hoc logging, and squinting at raw JSON dumps of prompts and completions in a terminal. That approach breaks down almost immediately for LLM apps for a specific reason that classical software debugging does not have: **the "bug" is often not a crash, it is a plausible-sounding wrong answer**, and finding it requires reconstructing the entire reasoning path — what was retrieved, what the prompt actually contained after templating, what intermediate tool result the model saw — not just a stack trace.

Classical APM (Datadog, New Relic, Prometheus + Grafana) was built for a different failure mode: services that are up or down, fast or slow, erroring or not. Those signals still matter for LLM apps (see the **Metrics** and **Logging** skills), but they say nothing about whether the RAG pipeline retrieved the right document, whether the agent picked the correct tool, or whether a prompt-template change silently degraded answer quality for a subset of inputs. A request can return 200 OK in 400ms and still be wrong.

LangSmith exists to close that gap for the specific shape of LLM applications: deeply nested, non-deterministic, natural-language-in-and-out call trees where "correctness" itself needs to be measured, not just inferred from latency and error codes. It fills the space between classical observability platforms (see the **Tracing** skill for the general distributed-tracing concepts LangSmith specializes) and classical ML evaluation tooling (which was built for batch model metrics, not live multi-step chains).
`,

  "problem-it-solves": `
Concrete pains LangSmith removes:

- **"What actually got sent to the model?"** — Prompt templates, few-shot examples, retrieved context, and conversation history are assembled at runtime; LangSmith captures the exact rendered prompt for every call, not just your template source.
- **"Where in this 12-step agent did it go wrong?"** — The trace tree shows every LLM call, retrieval, and tool invocation in order, with inputs/outputs at each node, so you can bisect a bad final answer down to the exact step that introduced the error.
- **"Did my prompt change make things better or worse, on average, not just anecdotally?"** — Datasets plus evaluators let you re-run a fixed set of examples against two prompt/model versions and compare aggregate scores side by side, instead of eyeballing a handful of manual tests.
- **"Is quality degrading in production, quietly?"** — Feedback scores (thumbs up/down, corrections, automated evaluators run online) tracked over time surface regressions that would otherwise only show up as vague user complaints.
- **"How much is this feature costing us, per request and in aggregate?"** — Per-step and per-trace token counts and cost are captured automatically for supported model providers.

What LangSmith deliberately does **not** solve: it is not a general-purpose APM replacement (you still want classical infra metrics, log aggregation, and uptime monitoring alongside it — see the **Metrics**, **Logging**, and **Tracing** skills for that layer); it is not a model training or fine-tuning platform; it does not host or serve your models; and it is not a replacement for a rigorous human evaluation program — LLM-as-judge evaluators are a scalable proxy, not a perfect substitute for domain-expert review, and should be validated against human judgments before being trusted (see the **AI Evals** skill).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain why LLM applications need trace-tree observability, not just latency/error-rate APM, and articulate the specific failure modes classical monitoring misses.
2. Instrument a Python or JavaScript application — both LangChain/LangGraph-based and framework-free — to send traces to LangSmith.
3. Read a LangSmith trace tree to isolate which step (retrieval, tool call, sub-chain) produced a bad output.
4. Build a golden dataset from production traces or hand-written examples, and run both heuristic and LLM-as-judge evaluators against it.
5. Compare two experiments (e.g. prompt v1 vs v2, or model A vs model B) on the same dataset and interpret aggregate score deltas correctly.
6. Wire up a human feedback loop (thumbs up/down, corrections) that attaches feedback to specific traces for later analysis.
7. Use the Prompt Hub to version, tag, and roll back prompts independently of application deploys.
8. Set up an annotation queue so a human reviewer team can triage flagged production traces.
9. Read a production monitoring dashboard (latency percentiles, error rate, cost per trace, feedback trend) and know which threshold breach should page someone versus just get logged.
10. Articulate LangSmith's honest scope: strongest with LangChain/LangGraph, usable but more manual with other stacks, and not a substitute for classical infra observability or human evaluation.
`,

  prerequisites: `
- **Required**: comfort writing Python or JavaScript, and a basic mental model of what an LLM API call looks like (prompt in, completion out, token-based pricing). If you have never called an LLM API directly, spend an hour with the raw OpenAI or Anthropic SDK first.
- **Helpful, not required**: familiarity with the **LangChain** and/or **LangGraph** skills — LangSmith's tracing integrates most automatically with those frameworks, and several examples on this page use LangChain/LangGraph syntax. You can still learn LangSmith without them via its framework-agnostic SDK.
- **Helpful**: the general observability vocabulary from the **Logging**, **Metrics**, and **Tracing** skills (spans, traces, percentiles, structured logs) — LangSmith reuses these concepts, specialized for LLM call trees.
- **Helpful**: the **AI Evals** and **AI Harness** skills for the deeper theory of what makes a good evaluator and how to design a rigorous evaluation harness beyond what any single vendor tool provides out of the box.
- **Helpful, for context**: the **LLMOps** skill, which places LangSmith as one piece (the tracing/eval/monitoring piece) of the full lifecycle of shipping and operating LLM applications.

Dependency links: **Python/JavaScript basics** → **LangChain**/**LangGraph** (optional but synergistic) → this page → **AI Evals**, **AI Harness**, and **LLMOps** deepen the evaluation and lifecycle story further.
`,

  "beginner-concepts": `
### What a "run" and a "trace" are

In LangSmith, every unit of work — an LLM call, a retriever lookup, a tool invocation, or an entire chain — is logged as a **run**. A run has a type (llm, chain, tool, retriever), inputs, outputs, start/end timestamps, and optional metadata. A **trace** is the full tree of runs produced by a single top-level invocation: one user request might produce a trace containing a chain run, which contains a retriever run and three LLM runs as children.

### Getting an API key and the minimal setup

~~~bash
pip install langsmith
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=ls__your_key_here
export LANGCHAIN_PROJECT=my-first-project
~~~

If your app already uses LangChain, those four environment variables are often the ENTIRE integration — every chain, agent, and LLM call in the process starts emitting traces automatically, with zero code changes.

### Tracing a plain Python function with the SDK

For non-LangChain code, LangSmith provides a decorator that wraps any function as a traced run:

~~~python
from langsmith import traceable
from openai import OpenAI

client = OpenAI()

@traceable(run_type="llm")   # marks this as an LLM-type run in the trace tree
def ask(question: str) -> str:
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": question}],
    )
    return resp.choices[0].message.content

@traceable(run_type="chain")  # a parent run; ask() becomes its child automatically
def answer_with_context(question: str, context: str) -> str:
    return ask(f"Context: {context}\\n\\nQuestion: {question}")

answer_with_context("What is LangSmith?", "LangSmith is an LLM observability platform.")
~~~

Nesting is automatic: because ask() is called from inside answer_with_context(), and both are decorated with @traceable, LangSmith reconstructs the parent-child relationship from the call stack — you did not have to pass any trace ID by hand.

### Reading your first trace in the UI

After running the snippet above, the LangSmith UI shows a project with one trace. Clicking it reveals a tree: the chain run at the top, the LLM run nested beneath it, with the exact rendered prompt, the raw model response, latency in milliseconds, and token counts — all without writing a single log statement yourself.

### Basic metadata and tags

~~~python
@traceable(run_type="chain", tags=["support-bot", "v1"], metadata={"user_tier": "free"})
def handle_ticket(ticket: str) -> str:
    ...
~~~

Tags and metadata let you filter and group traces later (e.g. "show me every trace tagged support-bot from users on the free tier") — the equivalent of structured logging fields, attached to the trace instead of a log line.
`,

  "intermediate-concepts": `
### Datasets: turning examples into a reusable asset

A **dataset** in LangSmith is a named collection of example input/output pairs. You can create one from scratch, import from a CSV, or — most powerfully — promote real production traces into dataset examples once you have identified interesting or problematic cases.

~~~python
from langsmith import Client

client = Client()
dataset = client.create_dataset(dataset_name="support-qa-golden-set")

client.create_example(
    inputs={"question": "How do I reset my password?"},
    outputs={"answer": "Go to Settings > Security > Reset Password."},
    dataset_id=dataset.id,
)
~~~

### Running an evaluation

An **evaluator** is a function that scores a run's output against the dataset's expected output (or against a rubric, with no expected output needed at all). LangSmith ships built-in evaluators (exact match, embedding similarity) and lets you register custom ones, including LLM-as-judge:

~~~python
from langsmith.evaluation import evaluate, LangChainStringEvaluator

def is_helpful(run, example) -> dict:
    """Simple heuristic evaluator: does the answer mention a concrete next step?"""
    output = run.outputs.get("answer", "")
    score = 1 if any(w in output.lower() for w in ["go to", "click", "step"]) else 0
    return {"key": "actionable", "score": score}

results = evaluate(
    lambda inputs: {"answer": answer_with_context(inputs["question"], "")},
    data="support-qa-golden-set",
    evaluators=[is_helpful, LangChainStringEvaluator("qa")],  # "qa" = LLM-as-judge correctness grader
    experiment_prefix="support-bot-v1",
)
~~~

This produces an **experiment** — a run of your whole dataset through your app, scored by every evaluator — that shows up in the UI as a row you can compare against future experiments (v2 of the prompt, a different model, etc.) side by side, per-example and in aggregate.

### Human feedback on live traces

Beyond offline evaluation, LangSmith captures feedback tied to a specific trace at runtime — the classic thumbs up/down pattern:

~~~python
from langsmith import Client

client = Client()

def on_thumbs_down(run_id: str, correction: str) -> None:
    client.create_feedback(
        run_id=run_id,
        key="user_thumbs",
        score=0,
        comment=correction,
    )
~~~

Because feedback is attached to the run_id, you can later filter traces by "score = 0" and jump straight into the exact trace tree that produced a complaint — connecting subjective user signal directly to the technical root cause.

### Prompt Hub basics

The Prompt Hub is a version-controlled registry for prompts, separate from your application code:

~~~python
from langsmith import Client

client = Client()
prompt = client.pull_prompt("my-org/support-answer-prompt", include_model=True)
# prompt is now a runnable template; swapping versions doesn't require redeploying the app
~~~

Storing prompts in the Hub (instead of hardcoded strings) lets non-engineers iterate on wording, lets you A/B two prompt versions against the same dataset, and gives you a rollback path when a prompt change regresses quality.

### Filtering and querying traces

The UI and SDK both support querying by tag, metadata, run type, latency, and feedback score — e.g. "show me every trace over 5 seconds that also got a thumbs-down in the last 24 hours," which is usually the fastest path to your highest-impact bug.
`,

  "advanced-concepts": `
### Trace sampling and cost control at scale

Tracing every single production request is not free — LangSmith bills on trace volume at scale, and even self-hosted deployments pay in storage/compute. Senior teams sample:

~~~python
import random
from langsmith import traceable

@traceable(run_type="chain")
def handle_request(payload: dict) -> dict:
    # Always trace errors and a random 5% sample of successful requests;
    # this keeps cost bounded while preserving statistical visibility.
    ...
~~~

A common pattern is 100% tracing in staging/pre-prod, and a much lower sampling rate (1–10%) in production, boosted to 100% temporarily when investigating an incident — the same tradeoff classical distributed tracing makes (see the **Tracing** skill).

### Multi-turn and agent trajectory evaluation

Evaluating a single-turn Q&A pair is straightforward; evaluating a multi-turn agent (did it pick the right sequence of tools, did it recover from a failed API call, did it terminate instead of looping) is harder. LangSmith supports evaluating full **trajectories** — the sequence of tool calls and intermediate states across an entire agent run — not just the final answer, which matters heavily for LangGraph-style agents where the path matters as much as the destination.

### LLM-as-judge: design and pitfalls

An LLM-as-judge evaluator is itself a prompted model call, which means it inherits LLM failure modes: judge models can be inconsistent across runs, biased toward longer or more confident-sounding answers, and miscalibrated on domains outside their training distribution. Senior practice:

1. Validate the judge against a human-labeled sample before trusting it at scale (compute agreement rate).
2. Use a structured rubric prompt (numeric scale + explicit criteria) rather than an open-ended "is this good?" question.
3. Prefer a stronger/different model as judge than the model under evaluation, to reduce self-preference bias.
4. Re-validate periodically — if the underlying judge model version changes, your score baseline can silently shift.

See the **AI Evals** skill for the deeper theory here; LangSmith gives you the plumbing to run the evaluator at scale, not the guarantee that any given evaluator design is sound.

### Comparing experiments statistically, not just eyeballing deltas

A 2-point aggregate score improvement across 50 dataset examples may or may not be a real effect. Senior teams pair LangSmith's experiment comparison view with basic statistical rigor: look at per-example score deltas (did most examples improve slightly, or did one example swing the average), and treat small datasets (<30 examples) as directional signal, not proof.

### Custom run trees and manual trace construction

For architectures LangSmith cannot auto-instrument (custom C++ inference servers, non-Python/JS services), the run tree can be built manually via the REST API — POST a run with a parent_run_id to explicitly wire the tree, which is the same mechanism @traceable uses under the hood via contextvars-based propagation (conceptually parallel to OpenTelemetry's context propagation — see the **Tracing** skill).

### Self-hosted vs SaaS tradeoffs

LangSmith offers a hosted SaaS product and a self-hosted/hybrid deployment for enterprises with data-residency or compliance requirements. Self-hosting trades operational burden (you run and scale the ingestion/storage/UI stack) for data control; exact feature parity between tiers changes over time and should be checked against current docs rather than assumed.
`,

  "internal-working": `
At a mechanical level, LangSmith's tracing works by propagating a **run context** through your call stack and shipping structured run records to a collector API, which the UI then renders as a tree.

~~~mermaid
flowchart LR
    A["Your code calls a traced function\\n(@traceable or LangChain internals)"] --> B["SDK creates a Run object:\\nid, parent_run_id, inputs, start_time"]
    B --> C["Run context propagated via\\ncontextvars (Python) / AsyncLocalStorage (JS)"]
    C --> D["Nested traced calls read the\\ncurrent context -> set their parent_run_id"]
    D --> E["On completion: outputs, end_time,\\ntoken usage attached to the Run"]
    E --> F["Runs batched and POSTed\\nto LangSmith ingestion API"]
    F --> G["Backend stores runs,\\nreconstructs the tree by parent_run_id"]
    G --> H["UI renders the trace tree,\\ncost/latency rollups, and eval scores"]
~~~

Step by step:

1. **Context creation**: when a @traceable-decorated function (or a LangChain Runnable) is invoked, the SDK generates a unique run ID and checks whether a run is already active in the current context — if so, the new run's parent_run_id is set to the active run's ID, forming the parent-child edge.
2. **Context propagation**: Python uses contextvars (the same mechanism asyncio relies on) so that nested calls — even across await boundaries — inherit the correct "current run" without you passing anything explicitly. This is why nesting "just works" for both sync and async code.
3. **Capture**: inputs are serialized at call time, outputs at return time (or streamed incrementally for streaming LLM calls); latency is measured wall-clock; token usage and cost are parsed from the model provider's response metadata when using a supported client wrapper.
4. **Batched shipping**: rather than one HTTP call per run (which would add latency to every LLM call), the SDK batches run creation/update events and ships them asynchronously in the background, so tracing overhead on the request path is minimal — typically single-digit milliseconds of added latency, though exact overhead depends on batch size, network, and payload size.
5. **Server-side reconstruction**: the backend uses parent_run_id to assemble the full tree, computes rollups (total tokens, total cost, total latency for the trace), and makes it queryable by project, tag, metadata, and feedback score.
6. **Evaluation runs** work similarly but in the opposite direction: the evaluate() SDK call pulls dataset examples, invokes your target function once per example (each invocation traced normally), then invokes each evaluator function (itself optionally traced) and writes the resulting scores back attached to that experiment.
`,

  architecture: `
### Where LangSmith sits relative to your application

~~~mermaid
flowchart TB
    subgraph App["Your application process"]
        Code["App code / LangChain / LangGraph"]
        SDK["LangSmith SDK\\n(@traceable, callbacks, run tree)"]
    end
    Code --> SDK
    SDK -->|"async batched HTTP"| Ingest["LangSmith ingestion API"]
    subgraph Platform["LangSmith platform (SaaS or self-hosted)"]
        Ingest --> Store[("Run/trace store")]
        Store --> EvalEngine["Evaluation engine\\n(dataset runs, LLM-as-judge)"]
        Store --> Monitor["Monitoring dashboards\\n(latency, cost, feedback)"]
        Store --> Hub["Prompt Hub"]
        Store --> Queue["Annotation queues"]
    end
    Monitor --> UI["Web UI"]
    EvalEngine --> UI
    Hub --> UI
    Queue --> UI
    UI --> Human["Engineers / reviewers"]
~~~

The SDK is a thin, mostly-asynchronous client living inside your process — it never sits on the critical path of serving a user response (traces are shipped in the background), so a LangSmith outage should degrade to "no tracing," not "app is down." Confirm this failure mode for your exact SDK version and configuration before relying on it in production.

### Application-side layout for a well-instrumented LLM service

~~~
myllmapp/
├── src/myllmapp/
│   ├── api/              # FastAPI routes — request in, response out
│   ├── chains/            # LangChain/LangGraph chains, or plain traced functions
│   ├── prompts/           # prompt templates (or pulled from LangSmith Prompt Hub)
│   ├── eval/
│   │   ├── datasets.py    # scripts to build/update golden datasets
│   │   └── evaluators.py  # custom heuristic + LLM-as-judge evaluators
│   └── observability/
│       └── langsmith.py   # project name, tags, sampling config, feedback wiring
└── tests/
    └── eval/              # CI job: run evaluate() against the golden dataset on every PR
~~~

Rule of thumb: keep evaluator code in the same repo as the app (versioned together with prompts and chain logic) so a prompt change and its corresponding eval-suite update land in the same pull request — this is the LLM-app equivalent of keeping unit tests next to the code they test.
`,

  "data-flow": `
Tracing a single chat request through a LangChain app instrumented with LangSmith, end to end:

~~~mermaid
sequenceDiagram
    participant User
    participant API as App API (FastAPI)
    participant Chain as LangChain/LangGraph chain
    participant Retr as Retriever
    participant LLM as LLM provider
    participant SDK as LangSmith SDK (in-process)
    participant LS as LangSmith backend

    User->>API: POST /chat {question}
    API->>Chain: invoke(question)
    Chain->>SDK: start chain run (parent)
    Chain->>Retr: retrieve(question)
    Retr->>SDK: start + end retriever run (child)
    Chain->>LLM: complete(prompt + context)
    LLM-->>Chain: completion + token usage
    Chain->>SDK: start + end LLM run (child)
    Chain->>SDK: end chain run (parent), attach final output
    SDK-->>LS: async batched POST of run tree
    Chain-->>API: final answer
    API-->>User: 200 OK {answer}
    Note over LS: Backend links runs by parent_run_id,\\nrenders as a trace tree in the UI
    User->>API: thumbs down + correction
    API->>LS: create_feedback(run_id, score=0, comment)
    Note over LS: Feedback attaches to the exact trace\\nthat produced the disliked answer
~~~

Two things matter about this diagram: first, the trace shipping happens off the user-facing path — the user gets their answer before or concurrently with the trace reaching LangSmith's backend, so tracing should not add meaningful latency to the response. Second, the feedback loop closes the gap between "the model said something" and "a human said whether that was good," reattached to the exact trace, which is the foundational data LangSmith's evaluation and monitoring features are built on.
`,

  "production-usage": `
### Project structure and environment separation

Real teams use separate LangSmith **projects** per environment (dev, staging, prod) and often per major feature, using the LANGCHAIN_PROJECT environment variable or explicit project= arguments — this keeps a developer's local experimentation traces from polluting production dashboards.

~~~bash
# staging
export LANGCHAIN_PROJECT=support-bot-staging
# production
export LANGCHAIN_PROJECT=support-bot-prod
~~~

### CI-integrated evaluation

Mature teams run the evaluate() SDK call as a CI step on every pull request that touches a prompt or chain, gating merges on aggregate score thresholds against the golden dataset — the LLM-app equivalent of a unit test suite.

~~~bash
# .github/workflows/eval.yml (sketch)
- run: uv run python -m myllmapp.eval.run_ci_eval --dataset support-qa-golden-set --min-score 0.85
~~~

### Sampling and cost defaults

Common operational defaults: 100% trace sampling below some request-volume threshold, dropping to a configured percentage (often single digits) above it; always-trace-on-error regardless of sampling rate, so failures are never silently dropped from visibility.

### Tagging conventions

Consistent tags (environment, feature, prompt-version, model-name) turn the trace store into a queryable dataset in its own right — teams commonly tag every trace with the exact prompt-hub version and model ID so a later regression can be traced back to "which version was live when."

### Feedback wiring at the product layer

Thumbs up/down UI elements in the product call create_feedback with the run_id captured from the response (usually returned in a response header or body field by the API layer), closing the loop between end users and the trace store without requiring users to know anything about LangSmith.
`,

  "industry-examples": `
- **LangChain, Inc. (LangSmith's own maker)** dogfoods LangSmith to debug and evaluate LangChain and LangGraph itself during development — the product exists because the team needed exactly this tooling for their own increasingly complex chains.
- **Enterprise support/chat-bot teams** (across many companies building customer-support or internal-knowledge chatbots on LangChain/LangGraph) use LangSmith's dataset + evaluation workflow to regression-test prompt and retrieval changes before shipping, and its annotation queues to route uncertain or flagged conversations to human reviewers.
- **RAG-heavy applications** (documentation Q&A, internal search assistants) commonly use LangSmith's trace tree specifically to debug retrieval quality — inspecting exactly which chunks were retrieved and whether the final answer used them correctly, which is otherwise invisible from the outside.
- **Agentic/tool-using applications** built with LangGraph use LangSmith's trajectory-level tracing to debug why an agent looped, chose the wrong tool, or failed to terminate — a class of bug that is effectively invisible without a full call-tree view.

Because LangSmith's docs and case studies are the primary public source for these usage patterns and change over time, treat specific company names and numbers from marketing material as directional rather than verified facts — this page describes general, widely-corroborated usage patterns rather than citing specific confidential deployment details.
`,

  "best-practices": `
1. **Separate LangSmith projects per environment** (dev/staging/prod) so production dashboards are never polluted by local experimentation traces.
2. **Tag every trace with prompt version, model name, and environment** — without this, a later regression is nearly impossible to bisect against "what changed."
3. **Build your golden dataset from real production traces**, not just hand-written examples — production traffic surfaces edge cases synthetic examples miss.
4. **Validate every LLM-as-judge evaluator against human labels before trusting it** — an uncalibrated judge is worse than no automated evaluation, because it creates false confidence.
5. **Run evaluation in CI on every prompt/chain change**, gating merges on a score threshold, the same way you gate on unit tests.
6. **Sample production traces rather than tracing 100% at high volume**, but always trace on error regardless of sampling rate.
7. **Wire user feedback (thumbs up/down) directly to run_id**, so subjective signal is always one click away from the technical trace that produced it.
8. **Keep prompts in the Prompt Hub (or equivalent version control), not hardcoded in application code**, so prompt iteration doesn't require a full redeploy and can be independently rolled back.
9. **Use annotation queues to route only the traces worth human attention** (low-confidence, flagged, or randomly sampled) rather than asking reviewers to read everything.
10. **Set explicit latency, cost, and error-rate alert thresholds tied to user-facing symptoms**, not internal implementation details.
11. **Redact or avoid sending sensitive PII into traced inputs/outputs** where compliance requires it — treat trace payloads as sensitive data, same as any other application log (see the **Security** section below).
12. **Compare experiments on the same dataset over time, not just once** — a single before/after comparison catches obvious regressions; ongoing tracking catches slow drift.
`,

  "anti-patterns": `
### Tracing production at 100% with no cost awareness

~~~python
# Wrong: tracing every request unconditionally at high volume
@traceable(run_type="chain")
def handle_request(payload):
    ...  # fine at low volume, expensive and noisy at scale

# Better: sample, always trace errors
import random

def handle_request(payload):
    should_trace = random.random() < 0.05 or is_high_priority(payload)
    with trace_context(enabled=should_trace):
        try:
            return _handle(payload)
        except Exception:
            force_trace_this_run()  # always keep failures
            raise
~~~

### Treating LLM-as-judge scores as ground truth

Trusting an unvalidated judge model's score as if it were a verified label is the single most common evaluation anti-pattern — it produces confident-looking dashboards that quietly measure the judge model's biases instead of your application's real quality. Always spot-check judge scores against human review, especially before making a ship/no-ship decision based on them.

### Hardcoding prompts in application code instead of the Prompt Hub

~~~python
# Wrong: prompt buried in code, changes require a full deploy and code review cycle
PROMPT = "You are a helpful assistant. Answer: {question}"

# Better: pull from a versioned registry so non-engineers can iterate
# and rollbacks don't require a redeploy
prompt = client.pull_prompt("my-org/support-answer-prompt")
~~~

### Building a golden dataset once and never updating it

A dataset frozen at launch stops reflecting real user traffic within weeks; the fix is a standing process to periodically promote new interesting/failing production traces into the dataset.

### Evaluating only the final answer of a multi-step agent

Scoring only the last output hides WHERE a multi-step agent went wrong — a wrong final answer might stem from a bad tool call three steps earlier. Evaluate the trajectory, not just the terminal output, for agentic systems.

### Ignoring cost rollups until the bill arrives

Not reviewing per-trace and aggregate cost data until a monthly invoice surprise is a common and avoidable mistake — cost dashboards exist specifically so a runaway retry loop or an unexpectedly verbose prompt gets caught in hours, not a month later.
`,

  performance: `
### Measure before you optimize

Use LangSmith's own latency breakdown per run (time spent in each child span of the trace tree) before guessing where time is going — it is usually one specific step (a slow retriever, a large-context LLM call, an unnecessary sequential tool call) rather than uniform overhead.

~~~python
# Inspect where time actually went in a given trace via the SDK
from langsmith import Client

client = Client()
run = client.read_run(run_id="...")
for child in client.list_runs(project_name="my-project", parent_run_id=run.id):
    print(child.name, (child.end_time - child.start_time).total_seconds())
~~~

### The optimization hierarchy for LLM-app latency (apply in order)

1. **Reduce sequential LLM calls** — parallelize independent retrieval/tool calls (fan-out then join) instead of a strictly sequential chain; the trace tree makes serial dependencies visible at a glance.
2. **Reduce prompt/context size** — trimming unnecessary retrieved context or history directly cuts both latency and cost, since LLM latency scales with input+output tokens.
3. **Stream partial output** to the user instead of waiting for the full completion — perceived latency drops even when total latency is unchanged.
4. **Cache repeated sub-calls** (e.g. a retriever query seen before, a deterministic tool call) — LangSmith's trace history is a good source for identifying which sub-calls repeat across requests.
5. **Choose a smaller/faster model for sub-tasks** that don't need the largest model's reasoning (e.g. a routing or classification step) — reserve the most expensive model for the step that actually needs it.

### Tracing overhead itself

The SDK ships traces asynchronously and batches network calls, so the added latency on the user-facing path is typically small, but it is not zero — under very high request volume or very tight latency budgets, measure the actual added overhead in your environment rather than assuming it is negligible, and consider sampling if it becomes measurable.
`,

  scalability: `
LangSmith needs to scale along two axes: the volume of traces your application sends, and the size/frequency of evaluation runs against your datasets.

### Trace ingestion at scale

~~~mermaid
flowchart LR
    App1["App instance 1"] --> Batch["SDK-side batching\\n+ async shipping"]
    App2["App instance 2"] --> Batch
    App3["App instance N"] --> Batch
    Batch --> Ingest["LangSmith ingestion API"]
    Ingest --> Store[("Trace store")]
~~~

Each application instance batches and ships its own traces independently — horizontal scaling of your app (more instances/replicas) does not require any special LangSmith-side coordination, since the SDK is stateless from the app's perspective.

### Known bottlenecks and mitigations

| Bottleneck | Mitigation |
|------------|------------|
| High-volume production tracing cost/storage | Sample below 100%; always trace on error; shorter retention windows for low-value traces |
| Very large trace payloads (huge retrieved context, long conversation history) | Truncate or summarize what gets logged into the trace, especially for repeated large context blocks |
| Evaluation runs over large datasets taking a long time | Parallelize evaluator calls (the SDK supports concurrent evaluation); run the full dataset only in CI/nightly, a smaller smoke-test subset on every commit |
| Self-hosted deployment scaling | Follow the vendor's sizing guidance for ingestion/storage/UI components — treat it as its own service with its own capacity planning, not a fire-and-forget sidecar |

### Vertical vs horizontal, from the app's perspective

There is little "vertical scaling" concept on the app side — your app scales horizontally as usual (see the **Scalability** and **Kubernetes** skills), and the LangSmith SDK's async batching means tracing does not become a bottleneck to that horizontal scaling. On the LangSmith platform side (especially if self-hosted), ingestion and storage scale as their own service with their own capacity planning — treat that the same way you would any high-write-volume telemetry backend.
`,

  security: `
### Trace payloads are sensitive data

Traces routinely contain full prompts, retrieved documents, and model outputs — which means they can contain PII, secrets, or proprietary business data if your application handles any of that. Treat trace ingestion exactly like any other logging pipeline that might capture sensitive content (see the **Logging** skill): redact or mask sensitive fields before they are traced, rather than after.

~~~python
from langsmith import traceable
from langsmith.run_helpers import get_current_run_tree

@traceable(run_type="chain")
def handle_pii_sensitive_request(payload: dict) -> dict:
    run = get_current_run_tree()
    if run:
        # Redact before it ever leaves the process, not after
        run.inputs = {**payload, "ssn": "[REDACTED]"}
    return process(payload)
~~~

### API keys and access control

LangSmith API keys grant broad read/write access to your organization's traces, datasets, and prompts — treat them as secrets: source from environment variables or a vault (see the **Secrets Management** skill), never commit them, and scope keys per project/service where the platform supports it so a leaked key from one service doesn't expose every trace across your organization.

### Data residency and self-hosting

Organizations with strict data-residency, HIPAA, or similar compliance requirements should evaluate LangSmith's self-hosted/hybrid deployment options rather than assuming the default SaaS offering meets their compliance bar — verify the exact current compliance posture (SOC 2, data residency regions, etc.) against LangSmith's official trust/security documentation rather than relying on general assumptions, since compliance certifications and offerings change over time.

### Prompt injection surfaces in traced content

Because traces capture retrieved documents and tool outputs verbatim, a prompt-injection payload embedded in retrieved content will also show up in your trace store — useful for detection (you can search traces for injection patterns after the fact) but also a reminder that the trace store itself now holds a copy of that potentially adversarial content. See the **OWASP Top 10** and **AI Harness** skills for the broader prompt-injection and adversarial-input threat model.
`,

  testing: `
LangSmith's evaluate() function is effectively pytest for LLM behavior — a runnable, repeatable test suite scored against a fixed dataset instead of hardcoded assertions.

~~~python
# tests/eval/test_support_bot.py
from langsmith.evaluation import evaluate
from myllmapp.chains import answer_with_context

def correctness_evaluator(run, example) -> dict:
    expected = example.outputs["answer"].lower()
    actual = run.outputs.get("answer", "").lower()
    # A cheap heuristic stand-in; a real suite would also include an LLM-as-judge grader
    score = 1 if expected[:20] in actual else 0
    return {"key": "contains_expected_fact", "score": score}

def test_support_bot_meets_quality_bar():
    results = evaluate(
        lambda inputs: {"answer": answer_with_context(inputs["question"], "")},
        data="support-qa-golden-set",
        evaluators=[correctness_evaluator],
        experiment_prefix="ci-run",
    )
    # Fail the CI job if aggregate score drops below the agreed bar
    avg_score = results.to_pandas()["feedback.contains_expected_fact"].mean()
    assert avg_score >= 0.85, f"Quality regression: {avg_score:.2f} < 0.85"
~~~

### The senior testing doctrine for LLM apps

- Maintain **two tiers**: a small, fast smoke-test dataset run on every commit, and a larger comprehensive dataset run nightly or pre-release.
- Test the **trajectory**, not just the final answer, for agents — assert on which tools were called, not only what was said at the end.
- Combine **heuristic evaluators** (cheap, deterministic, fast feedback) with **LLM-as-judge evaluators** (more nuanced, slower, costlier) — use heuristics to gate every PR, judges for deeper periodic review.
- Version your dataset alongside your code — a dataset change should go through the same review as a code change, since it defines what "correct" means for CI.
- Track **flakiness**: LLM outputs are non-deterministic, so a single failing example is weaker evidence than a low aggregate score across many examples; consider running each example multiple times if variance is high.
`,

  debugging: `
### The escalation path for a bad output

1. **Open the trace** for the exact request that produced the bad output (search by user ID, timestamp, or a correlation ID logged alongside the request) — this is almost always the fastest first step, faster than trying to reproduce locally from a description.
2. **Read the tree top-down**: check the final LLM call's exact rendered prompt first — many "model bugs" are actually a prompt-templating bug (wrong variable interpolated, missing context, stale instructions).
3. **Check the retriever step** (if RAG) for what was actually retrieved — a wrong or missing document is a more common root cause than the model reasoning poorly over correct context.
4. **Check tool-call arguments and results** for agentic flows — a tool called with the wrong arguments, or one that silently returned an error the agent didn't notice, is a frequent culprit.
5. **Compare against a similar successful trace** — LangSmith's project view lets you filter to similar requests that succeeded, which often isolates exactly what differs.
6. **Reproduce with the exact captured inputs** in a local script — because the trace captured the literal rendered prompt, you can copy it verbatim rather than guessing at what the templating produced.
7. **If it's systemic, not a one-off**: pull the failing case into your golden dataset immediately, so the fix can be verified with an evaluation run instead of a single manual retest.

### Debugging evaluation runs specifically

- If an evaluator's scores look wrong, inspect the evaluator's own trace (evaluator calls are traced too) to see exactly what it was given and what it returned — a common bug is the evaluator receiving a differently-shaped output than expected after a schema change.
- If an LLM-as-judge evaluator seems inconsistent, check whether its underlying model version changed recently, or whether its rubric prompt is ambiguous enough to admit multiple readings.
`,

  monitoring: `
LangSmith's monitoring dashboards give you the LLM-app-specific view that sits alongside (not instead of) classical infra monitoring (see the **Metrics** and **Tracing** skills for that layer).

### What to track on the dashboard

~~~python
# Metadata attached at trace time is what later becomes dashboard-filterable
@traceable(run_type="chain", metadata={"model": "gpt-4o-mini", "prompt_version": "v3"})
def handle_request(payload: dict) -> dict:
    ...
~~~

- **Latency percentiles (p50/p95/p99)** per trace and per step — the same RED-style discipline as classical APM, but broken down by chain step so you know whether it's the LLM call, the retriever, or a tool that is slow.
- **Error rate** per project, ideally sliced by tag (model version, prompt version, feature) so a regression tied to a specific deploy is visible immediately.
- **Cost per trace and aggregate cost** over time — token usage times provider pricing, rolled up so a runaway cost spike (e.g. an accidental retry loop, or a prompt bloat) is caught quickly.
- **Feedback score trend** (thumbs up/down rate, average correction rate, average LLM-as-judge score on sampled live traffic) — the closest thing to a live quality metric, tracked the same way you'd track an error-rate SLO.

### Alerting discipline

Alert on user-facing symptoms — sustained feedback-score drop, error-rate spike, p99 latency breach — rather than internal implementation counters; a token-count anomaly is useful context inside an investigation, not usually worth its own page.

### Where LangSmith monitoring ends and classical monitoring begins

LangSmith does not replace infrastructure-level monitoring (CPU, memory, queue depth, database health) — those still belong to Prometheus/Grafana/Datadog-style tooling (see the **Metrics** skill). The two should be correlated during an incident: "was the LangSmith feedback score drop caused by a model provider outage visible in classical infra metrics, or a prompt regression visible only in the trace tree?"
`,

  deployment: `
LangSmith itself is typically consumed as a hosted SaaS dependency — there is no application container to deploy for it in the common case. What you deploy is your own application, configured to point at LangSmith.

~~~dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ src/
# LangSmith config supplied at runtime via env vars, never baked into the image
ENV LANGCHAIN_TRACING_V2=true
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "myllmapp.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: the API key and project name are injected as environment variables at deploy time (via your secret manager / orchestrator), never hardcoded in the image, so the same image can run against a staging or production LangSmith project purely by changing env vars; tracing is enabled by an env var flag so it can be toggled per environment without a code change or rebuild.

### Self-hosted deployment note

If your organization runs LangSmith self-hosted (for data residency or compliance reasons), that is a separate deployment concern entirely — you are then responsible for the ingestion/storage/UI service's own container orchestration, scaling, and backup strategy, following the vendor's official self-hosting guide rather than improvising, since the exact self-hosted architecture and requirements evolve with product versions.

### CI/CD integration point

Insert an evaluation gate into your pipeline: lint → typecheck → unit tests → **LangSmith evaluation against the golden dataset** → build → deploy. Failing the evaluation gate on a significant score regression is the LLM-app equivalent of a failing test suite blocking a merge.
`,

  "production-checklist": `
Before an LLM application backed by LangSmith takes real production traffic:

- [ ] Separate LangSmith projects configured for dev/staging/prod
- [ ] Every trace tagged with environment, prompt version, and model name
- [ ] Golden dataset exists and includes at least a handful of real production-derived examples, not only hand-written ones
- [ ] At least one heuristic evaluator AND one validated LLM-as-judge evaluator wired into CI
- [ ] Evaluation step runs automatically on every prompt/chain-affecting pull request
- [ ] Sampling strategy defined for production tracing volume (with always-trace-on-error preserved)
- [ ] User-facing feedback (thumbs up/down or correction) wired to create_feedback with the correct run_id
- [ ] Prompts sourced from the Prompt Hub (or equivalent version control), not hardcoded strings
- [ ] Annotation queue configured for routing flagged/low-confidence traces to human reviewers
- [ ] Monitoring dashboard alert thresholds set for latency p95/p99, error rate, and feedback-score trend
- [ ] Cost-per-trace and aggregate cost dashboards reviewed and a budget/anomaly alert configured
- [ ] Sensitive-field redaction applied before tracing, for any PII/secret-bearing inputs or outputs
- [ ] API keys sourced from a secret manager, scoped per project/service where possible
- [ ] Runbook exists: who gets paged on a feedback-score drop vs. an error-rate spike, and what the first debugging step is (open the trace)
`,

  "common-mistakes": `
1. **Not separating environments** — dev experimentation traces mixed into the production project makes dashboards useless; always split by project.
2. **Treating LLM-as-judge scores as ground truth** — an unvalidated judge produces confident-looking but potentially wrong signal; validate against human labels first.
3. **Never updating the golden dataset** — a dataset frozen at launch stops reflecting real traffic within weeks; treat it as a living asset with an update process.
4. **Evaluating only the final answer of a multi-step agent** — hides which step actually introduced the error; evaluate the trajectory.
5. **Hardcoding prompts instead of using the Prompt Hub** — makes iteration slower and rollback harder than it needs to be.
6. **Tracing 100% of high-volume production traffic with no sampling plan** — leads to unexpectedly high cost and noisy dashboards.
7. **Ignoring per-trace cost data until the invoice arrives** — a runaway retry loop or bloated prompt should be caught in hours via the cost dashboard, not a month later.
8. **Not attaching feedback to run_id** — decoupled feedback (e.g. logged separately in your own database) loses the direct link to the trace that produced it, defeating the point of the feedback loop.
9. **Skipping evaluation in CI** — relying on manual spot-checks before shipping a prompt change instead of gating on a repeatable dataset run.
10. **Assuming feature parity between the LangChain/LangGraph integration and the framework-agnostic SDK** — the framework-agnostic path requires more manual instrumentation; confirm what your specific stack actually captures automatically versus what you must wire yourself.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|-----------------|----------------|-----|
| No traces appearing in the UI | LANGCHAIN_TRACING_V2 not set to true, or API key missing/invalid | Verify env vars are set in the actual runtime process, not just your shell |
| Traces appear but with no parent-child nesting | Nested calls not decorated with @traceable, or context lost across a process/thread boundary | Decorate every function in the call chain you want visible; check context propagation across threads/async boundaries |
| Evaluation run fails with a schema mismatch | Target function's output shape doesn't match what the evaluator expects | Align the evaluator's expected keys with the target function's actual return shape |
| Feedback not showing up on a trace | Wrong or stale run_id passed to create_feedback | Capture run_id from the actual response of the traced call, not a cached/previous one |
| Unexpectedly high LangSmith cost/usage | 100% tracing at high production volume, or very large trace payloads (big context blocks) | Introduce sampling; truncate large fields before tracing |
| Prompt Hub pull returns a stale/wrong version | Pulling without pinning a specific version tag | Pin an explicit version/tag rather than always pulling "latest" in production |
| LLM-as-judge scores fluctuate run to run | Judge model non-determinism, or an ambiguous rubric prompt | Use a stricter structured rubric; consider averaging over multiple judge calls for high-stakes decisions |
| Self-hosted ingestion falling behind under load | Under-provisioned ingestion/storage tier for current trace volume | Scale the self-hosted deployment per vendor sizing guidance; consider sampling as a stopgap |

The general habit: open the trace first. Nearly every "the model is behaving strangely" report resolves faster by reading the exact captured prompt/context than by guessing from the bug description.
`,

  faqs: `
**Q: Do I need to use LangChain or LangGraph to use LangSmith?**
No — the langsmith SDK's @traceable decorator (Python) or equivalent wrapper (JavaScript) can instrument any function in any stack, including raw OpenAI/Anthropic SDK calls or custom agent loops. That said, LangChain and LangGraph applications get tracing with just environment variables and no code changes, because their internals emit LangSmith-compatible events natively — that is the tightest integration path. See the **LangChain** and **LangGraph** skills.

**Q: How is LangSmith different from Langfuse?**
Both are LLM tracing/evaluation/monitoring platforms with similar core concepts (traces, datasets, evaluators, feedback). The meaningful difference is philosophy and ownership: LangSmith is built and commercially operated by the LangChain team, with the deepest, most automatic integration for LangChain/LangGraph specifically, and is SaaS-first (with a self-hosted enterprise tier). Langfuse is open-source from day one and framework-agnostic by design — it does not privilege any particular orchestration framework, and self-hosting is a first-class, well-documented path rather than an enterprise add-on. See the comparisons section below for a fuller breakdown.

**Q: Does LangSmith replace classical APM tools like Datadog?**
No. LangSmith specializes in the LLM-call-tree-and-quality layer; you still want classical infrastructure monitoring (CPU, memory, queue depth, uptime) from tools covered in the **Metrics**, **Logging**, and **Tracing** skills. The two are complementary, not substitutes.

**Q: Is LLM-as-judge evaluation trustworthy on its own?**
Treat it as a scalable proxy, not a verified ground truth. Validate any judge evaluator against a human-labeled sample before relying on it for ship/no-ship decisions, and re-validate if the underlying judge model changes. See the **AI Evals** skill for the deeper methodology.

**Q: What does tracing cost, and is there a free tier?**
LangSmith has historically offered a free tier suitable for individual developers and small projects, with paid tiers for higher trace volume and team features. Exact pricing, quotas, and tier boundaries change over time and are outside this page's knowledge cutoff — check the official pricing page before making a budget decision.

**Q: Can I self-host LangSmith?**
Yes, a self-hosted/hybrid deployment option exists for organizations with data-residency or compliance requirements that preclude sending data to the SaaS product. Exact feature parity between the hosted and self-hosted offerings should be verified against current docs, as it is a moving target.

**Q: How does LangSmith relate to LLMOps as a discipline?**
LangSmith is a concrete tool implementing a slice of LLMOps — specifically the tracing, evaluation, and monitoring slice. LLMOps as a discipline also covers prompt/model deployment strategy, cost governance, and the broader operational lifecycle; see the **LLMOps** skill for that wider view.

**Q: Should evaluation and annotation review always be automated?**
No — the annotation queue feature exists precisely because some fraction of traces (flagged, low-confidence, high-stakes) warrant human review that no automated evaluator should fully replace. The right ratio of automated to human review is a judgment call specific to your risk tolerance and domain.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is a "trace" in LangSmith, and how does it differ from a single log line?* A trace is the full tree of nested runs (LLM calls, retrievals, tool calls) produced by one top-level request, showing the entire execution path, inputs/outputs at every step, and timing — a flat log line typically shows only one point in that path.
2. *How do you add LangSmith tracing to a function that isn't part of LangChain?* Decorate it with @traceable from the langsmith SDK; nesting across calls is automatic via context propagation as long as every function you want visible is also decorated.
3. *What is a dataset in LangSmith, and why would you build one from production traces?* A named collection of input/expected-output examples used for evaluation; building it from real production traces (rather than only hand-written examples) ensures it reflects actual user behavior and edge cases.
4. *What's the difference between a heuristic evaluator and an LLM-as-judge evaluator?* A heuristic evaluator is a deterministic function (exact match, keyword check, embedding similarity threshold); an LLM-as-judge evaluator prompts a model to score the output against a rubric — more nuanced but non-deterministic and itself in need of validation.
5. *Why would you tag traces with a prompt version and model name?* So that a later quality regression can be filtered/attributed to exactly which prompt or model version was live at the time, instead of guessing.

**Senior:**

6. *How would you validate that an LLM-as-judge evaluator is trustworthy before using it to gate deploys?* Run it against a sample scored independently by human reviewers, compute agreement rate, iterate on the rubric prompt until agreement is acceptable, and periodically re-validate since judge-model updates can silently shift the baseline.
7. *Design a production monitoring setup for an LLM app using LangSmith.* Separate projects per environment; tags for prompt/model version; dashboards for latency percentiles, error rate, cost per trace, and feedback-score trend; alerting tied to user-facing symptoms (feedback drop, error spike, p99 breach); sampling strategy for high-volume traffic with always-trace-on-error.
8. *How do you evaluate a multi-step agent, not just its final answer?* Evaluate the trajectory — the sequence of tool calls and intermediate decisions — in addition to (or instead of) only the terminal output, since a wrong final answer often traces back to an earlier wrong tool choice or misread intermediate result.
9. *What are the tradeoffs between LangSmith SaaS and self-hosting?* SaaS is lower operational burden and faster to adopt; self-hosting gives data residency/compliance control at the cost of operating the ingestion/storage/UI stack yourself — the right choice depends on regulatory constraints and existing platform team capacity.
10. *How would you keep tracing cost bounded at high production volume without losing visibility into failures?* Sample below 100% for successful requests, but always trace on error; consider boosting sampling temporarily during an active incident investigation.
11. *What's a common trap when comparing two experiments (prompt v1 vs v2) on a small dataset?* Treating a small aggregate score delta on a small dataset (<30 examples) as statistically meaningful; look at per-example deltas and consider it directional signal rather than proof without a larger sample.
12. *How does LangSmith's tracing interact with sensitive data, and what would you do about it?* Trace payloads capture full prompts/outputs, which may include PII or secrets; redact sensitive fields in-process before the trace is shipped, treat trace payloads with the same sensitivity as application logs, and use scoped API keys.
`,

  "coding-questions": `
### 1. Instrument a two-step RAG pipeline with nested tracing

~~~python
from langsmith import traceable

# Fake retriever and LLM call for illustration
def fake_retrieve(query: str) -> list[str]:
    return [f"doc about {query}"]

def fake_llm(prompt: str) -> str:
    return f"answer based on: {prompt[:40]}"

@traceable(run_type="retriever")
def retrieve(query: str) -> list[str]:
    return fake_retrieve(query)

@traceable(run_type="llm")
def generate(prompt: str) -> str:
    return fake_llm(prompt)

@traceable(run_type="chain", tags=["rag-pipeline", "v1"])
def answer_question(question: str) -> str:
    """Top-level traced entry point; retrieve() and generate() nest under it automatically."""
    docs = retrieve(question)
    context = "\\n".join(docs)
    prompt = f"Context: {context}\\nQuestion: {question}"
    return generate(prompt)

result = answer_question("What is LangSmith?")
~~~

Complexity note: instrumentation adds O(1) overhead per traced call (batched async network shipping); the trace tree depth equals your call-stack nesting depth. Follow-up: add error handling so a retriever timeout is still traced and visible, not silently swallowed.

### 2. Write a heuristic evaluator plus a run of evaluate() against a dataset

~~~python
from langsmith.evaluation import evaluate

def length_and_keyword_evaluator(run, example) -> dict:
    """Checks the answer is non-trivial length AND mentions an expected keyword."""
    output = run.outputs.get("answer", "")
    expected_keyword = example.outputs.get("expected_keyword", "")
    long_enough = len(output.split()) >= 5
    has_keyword = expected_keyword.lower() in output.lower()
    score = 1 if (long_enough and has_keyword) else 0
    return {"key": "meets_basic_quality_bar", "score": score}

def run_ci_eval() -> float:
    results = evaluate(
        lambda inputs: {"answer": answer_question(inputs["question"])},
        data="rag-golden-set",
        evaluators=[length_and_keyword_evaluator],
        experiment_prefix="ci",
    )
    df = results.to_pandas()
    avg = df["feedback.meets_basic_quality_bar"].mean()
    if avg < 0.8:
        raise SystemExit(f"Quality gate failed: {avg:.2f} < 0.8")
    return avg
~~~

Complexity: O(n) evaluator calls for n dataset examples, parallelizable since examples are independent. Follow-up: add a second, LLM-as-judge evaluator and discuss how you'd validate it before trusting its score in the same gate.

### 3. Build a minimal feedback-attachment endpoint

~~~python
from fastapi import FastAPI
from pydantic import BaseModel
from langsmith import Client

app = FastAPI()
ls_client = Client()

class FeedbackPayload(BaseModel):
    run_id: str
    thumbs_up: bool
    comment: str | None = None

@app.post("/feedback")
def submit_feedback(payload: FeedbackPayload) -> dict:
    """Attach user feedback directly to the trace that produced the answer."""
    try:
        ls_client.create_feedback(
            run_id=payload.run_id,
            key="user_thumbs",
            score=1 if payload.thumbs_up else 0,
            comment=payload.comment,
        )
    except Exception as exc:
        # Never let a feedback-logging failure break the user-facing flow
        return {"status": "feedback_failed", "error": str(exc)}
    return {"status": "ok"}
~~~

Discussion points: why feedback submission is deliberately best-effort and non-blocking; how you'd validate that run_id belongs to the requesting user/session before trusting client-supplied IDs in a real system.
`,

  "hands-on-labs": `
### Lab 1 — Trace a simple LLM call end to end (beginner, ~45min)
Set up a LangSmith account and API key, instrument a single function calling the OpenAI or Anthropic API directly with @traceable, and find the resulting trace in the UI. Deliverable: a screenshot (or description) of the trace tree and the exact captured prompt. Skills exercised: basic SDK setup, reading a trace.

### Lab 2 — Build a golden dataset and run your first evaluation (intermediate, ~2h)
Write 15–20 example question/expected-answer pairs for a small Q&A or support-bot use case, create a LangSmith dataset from them, write one heuristic evaluator and one LLM-as-judge evaluator, and run evaluate() to produce an experiment. Deliverable: a short write-up comparing the two evaluators' scores and where they disagreed. Skills exercised: datasets, evaluators, experiment comparison.

### Lab 3 — Wire a human feedback loop into a small app (intermediate, ~2h)
Build a minimal FastAPI chat endpoint backed by a traced LLM call, add a /feedback endpoint that calls create_feedback with the run_id, and build a tiny frontend (or curl script) that simulates thumbs up/down. Deliverable: demonstrate filtering traces in the UI by feedback score. Skills exercised: feedback attachment, trace querying.

### Lab 4 — CI-gated evaluation for a prompt change (production, ~3h)
Take Lab 2's dataset and evaluator, wire evaluate() into a CI script that fails the build if the aggregate score drops below a threshold, then deliberately introduce a prompt regression and confirm the CI gate catches it. Deliverable: a CI config plus a before/after experiment comparison showing the caught regression. Skills exercised: the full evaluation lifecycle, CI integration, the production checklist end to end.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate LangSmith fluency to employers:

1. **Regression-tested RAG assistant** — A documentation Q&A bot (LangChain or framework-free) with a golden dataset built from real questions, both heuristic and validated LLM-as-judge evaluators, and a CI pipeline that blocks merges on quality regression. Demonstrates: dataset curation, evaluator design and validation, CI-gated LLM quality control.

2. **Multi-tool agent with trajectory evaluation** — A LangGraph agent that uses 3+ tools (search, calculator, a mock internal API), instrumented with LangSmith, with an evaluation suite that scores the tool-call trajectory (not just the final answer) against expected tool sequences. Demonstrates: agentic trace design, trajectory-level evaluation, debugging multi-step reasoning failures.

3. **Production monitoring dashboard replica** — A small internal tool that pulls run/feedback data via the LangSmith SDK and renders latency percentiles, cost-per-trace, and feedback-score trend over time, plus an alert rule that fires on a feedback-score drop. Demonstrates: the SDK's query API, production monitoring thinking, alerting discipline transferable to any observability stack.

Each project: instrumented from day one (not bolted on afterward), a documented golden dataset with a stated update process, at least one validated LLM-as-judge evaluator with its human-agreement validation shown, and a README explaining the trace-tree architecture with a diagram.
`,

  "case-studies": `
### The LangChain team's own dogfooding
LangSmith was built because the LangChain maintainers needed to debug their own increasingly complex chains and could not do so with print statements once chains nested more than a couple of levels deep. Lesson: the strongest product-market fit signal is often "we built this because we desperately needed it ourselves" — and it explains why LangSmith's data model maps so cleanly onto LangChain/LangGraph's internal execution model.

### RAG debugging via trace trees
A recurring pattern across teams building retrieval-augmented applications: a wrong final answer is very often actually a retrieval bug (wrong or missing document), not a reasoning bug — but this is invisible without seeing exactly what was retrieved at that step. Teams that adopt trace-tree debugging report much faster root-causing of "the bot said something wrong" tickets than teams still eyeballing raw request/response logs. Lesson: for multi-step LLM apps, the majority of "the model is dumb" complaints are actually pipeline bugs one step upstream of generation.

### The shift from ad hoc manual testing to dataset-driven evaluation
Teams that start with "someone manually tries five prompts and eyeballs the outputs" and later adopt a golden-dataset-plus-evaluator workflow consistently report catching regressions earlier and shipping prompt changes with more confidence — because a repeatable, scored comparison replaces subjective impression. Lesson: the leap from anecdote to dataset-driven evaluation is usually the single highest-leverage process change a team building on LLMs can make.

### Annotation queues as a scaling mechanism for human review
As traffic grows, no team can manually review every conversation; annotation queues that route only flagged, low-confidence, or randomly sampled traces to human reviewers let a small review team maintain meaningful oversight without reading everything. Lesson: human review does not disappear as automated evaluation matures — it gets more targeted.
`,

  comparisons: `
| Dimension | LangSmith | Langfuse | Arize Phoenix | Helicone | Classical APM (Datadog/New Relic) |
|-----------|-----------|----------|---------------|----------|------------------------------------|
| Origin / ownership | Built and operated by LangChain, Inc. | Open-source from day one, commercial hosting available | ML-observability vendor (Arize), open-source core | Lightweight, proxy-based LLM observability | General-purpose infra observability vendors |
| Framework affinity | Tightest with LangChain/LangGraph; SDK works framework-agnostic too | Framework-agnostic by design; no framework is privileged | Framework-agnostic, strong OpenTelemetry alignment | Framework-agnostic, proxy/gateway style | Not LLM-specific; needs custom instrumentation for LLM concepts |
| Self-hosting | Enterprise self-hosted/hybrid option | First-class, well-documented, common even for small teams | Open-source self-hosting available | Available | Self-hosted options vary by vendor |
| Evaluation features | Datasets, experiments, LLM-as-judge, trajectory eval | Datasets, evaluators, LLM-as-judge, comparable core feature set | Strong on embedding/drift analysis, evaluation features | Lighter-weight; less evaluation-suite depth | None — not built for LLM quality evaluation |
| Prompt management | Prompt Hub (versioning/registry) | Prompt management features present | Present but less central | Not a primary focus | N/A |
| Classical infra signals (CPU, uptime, error codes) | Not the focus; complements infra tools | Not the focus; complements infra tools | Not the focus | Not the focus | This is the core strength |
| Pricing model | Commercial SaaS-first, free tier for small usage | Open-source free self-hosted; paid managed cloud tiers | Open-core, paid enterprise features | Usage-based, lighter cost profile | Enterprise infra pricing, unrelated to LLM-specific features |

**How seniors choose**: if the application is built on LangChain or LangGraph and the team is comfortable with a commercial SaaS dependency, LangSmith's near-zero-friction integration is compelling — tracing is close to free to turn on. If the team wants framework independence, open-source control, or must self-host by default (compliance, cost, or philosophy), Langfuse is the natural pick — the honest comparison being that Langfuse trades some of LangSmith's LangChain-specific automatic instrumentation for architectural neutrality and open-source ownership. Either way, this observability layer sits ALONGSIDE classical infra tools (Datadog, Prometheus/Grafana — see the **Metrics** and **Tracing** skills), not instead of them; teams commonly run both a classical APM stack and an LLM-specific platform like LangSmith or Langfuse simultaneously.
`,

  "related-technologies": `
- **LangChain** — the orchestration framework LangSmith integrates with most tightly; understanding LangChain's Runnable/chain abstractions makes LangSmith's trace tree immediately legible. See the **LangChain** skill.
- **LangGraph** — the graph-based agent framework built by the same team; LangSmith is its default observability layer, especially for multi-step, stateful agent trajectories. See the **LangGraph** skill.
- **Langfuse** — the leading open-source, framework-agnostic alternative; see the Comparisons section above for the detailed tradeoff.
- **OpenTelemetry** — the vendor-neutral tracing standard whose span/trace concepts LangSmith's run/trace model parallels; some LLM observability tools (including parts of the ecosystem) are converging on OTel-compatible export. See the **Tracing** skill.
- **Prometheus / Grafana, Datadog** — classical metrics and APM platforms that remain necessary alongside LangSmith for infra-level signals. See the **Metrics** skill.
- **Structured logging tooling** — the general discipline LangSmith's trace capture specializes for LLM call trees. See the **Logging** skill.
- **AI Evals / AI Harness** — the deeper theory of evaluator design, rubric construction, and judge-model validation that LangSmith's evaluation features implement at the tooling level. See the **AI Evals** and **AI Harness** skills.
- **LLMOps** — the broader operational lifecycle (deployment, prompt management, cost governance, incident response) that tracing/evaluation/monitoring is one slice of. See the **LLMOps** skill.

On this platform, the natural next pages after LangSmith: **Langfuse** (compare the open-source path) → **AI Evals** (deepen evaluation methodology) → **LLMOps** (zoom out to the full lifecycle) → **LangGraph** (if you haven't yet, to see the agent framework LangSmith instruments most natively).
`,

  "latest-updates": `
LangSmith iterates quickly, and this page's author's knowledge has a cutoff of early-to-mid 2026 training data — treat anything below as directionally accurate as of that period and verify current specifics (pricing tiers, newest features, exact self-hosting requirements) against the official LangSmith documentation and changelog before making a purchasing or architecture decision.

As of that cutoff, the broad trend lines were: continued investment in agent-specific and trajectory-level evaluation (reflecting LangGraph's growth as a multi-step agent framework), maturing production monitoring dashboards (cost, latency, feedback trend), an expanding Prompt Hub feature set, and ongoing expansion of self-hosted/hybrid deployment options for enterprise compliance needs. Exact version numbers, newly shipped features, and current pricing tiers are exactly the kind of fast-moving detail this page will NOT get right by the time you read it — check the official docs and changelog directly.
`,

  "future-roadmap": `
Directionally (and with the same honest hedge as the previous section — verify against current sources before betting career time), a few trends look durable rather than speculative:

- **Evaluation is moving from single-turn to trajectory- and multi-agent-level assessment**, because agentic architectures (LangGraph and its peers) are becoming the default shape of serious LLM applications, and single-answer scoring increasingly under-serves that reality.
- **The tracing/observability layer for LLM apps is converging toward OpenTelemetry compatibility** across the industry, which would make trace data more portable between vendors — worth watching if vendor lock-in is a concern for your architecture.
- **LLM-as-judge methodology is maturing** (better-validated rubrics, more attention to judge-model bias and calibration) as more teams depend on it for real ship/no-ship decisions rather than treating it as a novelty.
- **The commercial-vs-open-source split (LangSmith vs Langfuse and similar) will likely persist** rather than converge, since it reflects a genuine philosophical difference (tight framework integration and hosted convenience vs. framework neutrality and self-hosted control), not just a temporary feature gap.

What to bet career time on regardless of which specific vendor wins: the underlying skill of designing a rigorous evaluation harness (datasets, evaluator validation, trajectory assessment) transfers across LangSmith, Langfuse, and whatever comes next — the tool is more replaceable than the methodology. See the **AI Evals** and **AI Harness** skills for that durable core.
`,

  "cheat-sheet": `
~~~python
# --- Setup ---
# pip install langsmith
# export LANGCHAIN_TRACING_V2=true
# export LANGCHAIN_API_KEY=ls__...
# export LANGCHAIN_PROJECT=my-project

# --- Trace any function ---
from langsmith import traceable

@traceable(run_type="chain", tags=["v1"], metadata={"env": "prod"})
def my_chain(question: str) -> str:
    return sub_step(question)   # nested calls auto-parent via context

@traceable(run_type="llm")
def sub_step(question: str) -> str:
    ...

# --- Datasets ---
from langsmith import Client
client = Client()
ds = client.create_dataset(dataset_name="golden-set")
client.create_example(inputs={"q": "..."}, outputs={"a": "..."}, dataset_id=ds.id)

# --- Evaluation ---
from langsmith.evaluation import evaluate

def my_evaluator(run, example) -> dict:
    return {"key": "correct", "score": int(run.outputs["a"] == example.outputs["a"])}

evaluate(my_chain, data="golden-set", evaluators=[my_evaluator], experiment_prefix="v1")

# --- Feedback ---
client.create_feedback(run_id="...", key="user_thumbs", score=1, comment="great answer")

# --- Prompt Hub ---
prompt = client.pull_prompt("my-org/my-prompt", include_model=True)

# --- Query traces ---
for run in client.list_runs(project_name="my-project", error=True):
    print(run.id, run.error)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is a "run" in LangSmith? | A single logged unit of work — an LLM call, tool call, retriever call, or chain — with inputs, outputs, and timing. |
| What is a "trace"? | The full tree of runs produced by one top-level invocation, showing the entire execution path. |
| How do you trace a non-LangChain function? | Decorate it with @traceable from the langsmith SDK. |
| How does nesting between traced calls work? | Automatically, via context propagation (contextvars in Python) that tracks the "current" parent run. |
| What is a "dataset" used for? | A named collection of input/expected-output examples used to run repeatable evaluations. |
| What is an "experiment" in LangSmith? | One run of your app against a full dataset, scored by one or more evaluators — comparable against other experiments. |
| What is LLM-as-judge evaluation? | Using a prompted model call to score another model's output against a rubric, instead of (or alongside) a deterministic heuristic. |
| Why must LLM-as-judge evaluators be validated? | They inherit LLM failure modes (inconsistency, bias) and can produce confident but wrong scores if untested against human judgment. |
| What is the Prompt Hub? | A version-controlled registry for prompts, decoupled from application code, supporting versioning and rollback. |
| What is an annotation queue for? | Routing flagged or low-confidence production traces to human reviewers for targeted manual review. |
| How is feedback attached to a trace? | Via create_feedback(run_id=..., key=..., score=...), linking a score/comment directly to the run that produced it. |
| Why sample production traces instead of tracing 100%? | To bound cost and noise at high volume, while still always tracing errors for visibility. |
| What does LangSmith NOT replace? | Classical infra APM (CPU, uptime, queue depth) and rigorous human evaluation — it complements, not substitutes, both. |
| How does LangSmith differ from Langfuse at a philosophical level? | LangSmith is commercial, LangChain-team-built, tightest with LangChain/LangGraph; Langfuse is open-source, framework-agnostic by design. |
| What should you check before evaluating trajectory in an agent? | Whether the evaluator scores intermediate tool calls/decisions, not just the final answer, since errors often occur upstream of the terminal output. |
`,

  mcqs: `
**1. What does a LangSmith "trace" represent?**
A) A single log line
B) The full tree of nested runs from one top-level request
C) A dataset of examples
D) A deployed model version

Answer: B. A trace is the reconstructed tree of parent/child runs (chain, LLM, retriever, tool) produced by one invocation — not a single flat log line.

**2. How does the @traceable decorator determine parent-child relationships between nested calls?**
A) You must manually pass a parent_run_id argument every time
B) Via context propagation (e.g. contextvars) that tracks the currently active run
C) By analyzing the source code statically before execution
D) It cannot nest; every traced call is top-level

Answer: B. The SDK propagates the "current run" context automatically through the call stack, so nested @traceable calls become children without explicit wiring.

**3. Why should an LLM-as-judge evaluator be validated against human labels before being trusted for ship/no-ship decisions?**
A) It is required by LangSmith's terms of service
B) Judge models can be inconsistent and biased, so unvalidated scores can be confidently wrong
C) LangSmith does not allow LLM-as-judge evaluators without validation
D) Human labels are always more expensive, so validation is discouraged

Answer: B. LLM-as-judge evaluators are themselves LLM calls and inherit LLM failure modes (inconsistency, bias toward certain answer styles) — validating against human judgment first prevents false confidence.

**4. What is the main architectural difference between LangSmith and Langfuse?**
A) LangSmith cannot trace anything outside LangChain
B) Langfuse is open-source and framework-agnostic by design; LangSmith is commercial and tightest with LangChain/LangGraph, though its SDK does support other stacks
C) Langfuse only works with LangGraph
D) There is no meaningful difference

Answer: B. LangSmith's SDK does support non-LangChain apps, but its deepest, most automatic integration is with LangChain/LangGraph; Langfuse was built from the start to be framework-neutral and open-source, with self-hosting as a first-class path.

**5. Why should production trace sampling still always trace on error?**
A) It doesn't matter — errors are rare enough to ignore
B) Failures are the highest-value traces to have visibility into, so they should never be silently dropped by a sampling rule
C) LangSmith requires 100% error tracing by policy
D) Sampling only applies to successful requests by definition

Answer: B. Sampling exists to bound cost/noise on the (usually much larger) volume of successful requests; failures are comparatively rare and disproportionately valuable for debugging, so they should bypass the sampling rate.

**6. What is the primary reason classical APM tools (Datadog, New Relic) are insufficient on their own for debugging LLM application quality issues?**
A) They cannot measure latency
B) They don't capture the reasoning/retrieval/tool-call tree needed to see WHY an output was wrong, only whether the request was fast/erroring
C) They are too expensive to use for AI applications
D) They only work with Python

Answer: B. Classical APM answers "was it fast, did it error" but has no concept of prompts, retrieved context, or tool-call trees — which is exactly what's needed to debug a plausible-but-wrong LLM output.
`,

  "revision-notes": `
LangSmith is a platform for tracing, evaluating, and monitoring LLM applications, built by the LangChain team. Its core insight is that classical APM (latency, error rate) cannot debug LLM quality issues, because a wrong answer is usually not a crash — it requires seeing the entire trace tree (retrieval, tool calls, intermediate LLM calls) to find where in a multi-step pipeline things actually went wrong.

Tracing works by wrapping functions (@traceable) or using native LangChain/LangGraph integration; nested calls automatically become parent-child runs via context propagation, and the resulting tree — with exact rendered prompts, outputs, latency, and token cost per step — is what you inspect in the UI. Datasets and evaluation turn ad hoc manual testing into a repeatable process: curate a golden dataset (ideally seeded from real production traces), run heuristic and/or LLM-as-judge evaluators against your app's outputs, and compare experiments (prompt v1 vs v2, model A vs B) on aggregate and per-example scores. LLM-as-judge evaluators must be validated against human labels before being trusted, since they inherit LLM inconsistency and bias.

Production usage adds a monitoring layer (latency percentiles, error rate, cost per trace, feedback-score trend) and a human feedback loop, where thumbs up/down or corrections attach directly to the run_id of the trace that produced them — closing the gap between subjective user signal and the technical root cause. The Prompt Hub versions prompts independently of application deploys, and annotation queues route flagged or low-confidence traces to human reviewers, scaling manual oversight without requiring anyone to read everything.

Honest scope: LangSmith's tightest, most automatic integration is with LangChain and LangGraph specifically; other stacks use the framework-agnostic SDK with more manual instrumentation. It does not replace classical infra observability (Metrics, Logging, Tracing skills still matter) or a rigorous human evaluation program (see AI Evals, AI Harness). Its closest competitor, Langfuse, trades some of that LangChain-specific convenience for open-source ownership and framework neutrality — a real philosophical difference, not just a feature checklist gap.

Career-durable takeaway: the specific vendor (LangSmith, Langfuse, or a future entrant) is more replaceable than the underlying discipline of building a rigorous, validated evaluation harness and a real production feedback loop — invest in understanding that discipline (see LLMOps) more than in memorizing any one tool's UI.
`,

  "learning-roadmap": `
**Week 1 — Foundations and first traces.** Set up a LangSmith account, instrument a plain Python function with @traceable, and if you know LangChain, also enable tracing on a small chain via environment variables alone. Milestone: you can find and read a trace tree in the UI for a request you triggered yourself.

**Week 2 — Datasets and your first evaluation.** Build a 15–20 example golden dataset for a small use case, write one heuristic evaluator, run evaluate(), and read the resulting experiment. Milestone: you can explain, with a concrete example, what an experiment score actually measures and what it doesn't.

**Week 3 — LLM-as-judge and validation discipline.** Add an LLM-as-judge evaluator, hand-label a sample of the same examples yourself, and compute agreement between your labels and the judge's scores. Milestone: you have direct evidence of where your judge evaluator agrees and disagrees with human judgment, not just a trust-it-blindly score.

**Week 4 — The feedback loop and Prompt Hub.** Wire a thumbs up/down endpoint that calls create_feedback with a real run_id, and move at least one prompt into the Prompt Hub with two versions you can compare. Milestone: you can filter traces by feedback score and trace a specific complaint back to its exact trace.

**Week 5 — Production discipline.** Set up separate projects for dev/staging/prod, add tagging conventions, define a sampling strategy, and wire evaluate() into a CI script that fails on regression. Milestone: you have a working, if small, CI-gated LLM quality pipeline.

**Week 6 — Trajectory evaluation and next steps.** If you know LangGraph, build a small multi-tool agent and write a trajectory-level evaluator (scoring the sequence of tool calls, not just the final answer). Milestone: you can articulate, with your own example, why final-answer-only evaluation misses agent bugs.

Next platform skill: once this roadmap is complete, move to the **Langfuse** skill to see the open-source, framework-agnostic alternative and form your own opinion on the tradeoff, then to **AI Evals** to deepen the evaluation methodology beyond what any single vendor tool provides.
`,

  "official-docs": `
- **LangSmith documentation** (docs.smith.langchain.com) — the primary source for setup guides, SDK reference, and the evaluation/tracing API; check this first for anything version-specific, since this page's specifics may lag actual current behavior.
- **LangSmith changelog / release notes** — the authoritative source for "what's new," more reliable than any third-party summary (including the Latest Updates section above) for current feature status.
- **LangChain Python and JavaScript SDK reference** — relevant because LangSmith tracing for LangChain apps is largely configured through LangChain's own documented environment variables and callback system.
- **LangGraph documentation** — relevant for trajectory-level tracing and evaluation specifics, since LangGraph is the framework LangSmith's agent-evaluation features are most directly built around.
- **LangSmith pricing page** — check directly for current tiers and quotas rather than relying on this page's necessarily dated summary.

Always prefer the live docs over this page for exact API signatures, current pricing, and newly shipped features — this page teaches the durable concepts and mental models, not a frozen snapshot of an evolving product's exact surface area.
`,

  books: `
There is no single canonical, long-established book specifically about LangSmith — it is a fast-moving commercial product, and dedicated books tend to lag product changes quickly. The more durable reading path is books on the surrounding disciplines LangSmith implements tooling for:

- **"Designing Machine Learning Systems" by Chip Huyen** — why this one: the best general treatment of the production ML lifecycle (including monitoring and evaluation), directly transferable to thinking about LLM app observability even though it predates the LLM-specific tooling wave.
- **"Building LLM Powered Applications" (community/publisher texts, check current editions)** — why this one: covers the broader practice of building production LLM apps, of which tracing/evaluation is one piece; verify the specific title and edition currently in print, as this space publishes quickly.
- **General software observability texts** (e.g. distributed tracing and SRE-focused books) — why these: the underlying observability concepts (traces, spans, percentiles, alerting discipline) LangSmith specializes for LLM apps are the same concepts covered by classical SRE/observability literature; see the reading lists in the **Tracing** and **Metrics** skills for specific titles.

Honest note: for LangSmith specifically, the official docs and changelog will be more current and more reliable than any book, which is why this page leans on official docs and hands-on labs rather than book recommendations for the vendor-specific content.
`,

  blogs: `
- **The official LangChain blog** — the highest-signal source for LangSmith feature announcements, worked examples, and the team's own reasoning about evaluation methodology; check this before any third-party summary.
- **Engineering blogs of companies building production LangChain/LangGraph applications** — search for recent posts describing real production tracing/evaluation setups; these tend to be more concrete and battle-tested than vendor marketing content, though they age quickly, so prefer posts from the last year or two over older ones.
- **General LLMOps and AI evaluation blog communities** (e.g. posts specifically about evaluator design, LLM-as-judge validation, and RAG debugging) — high-signal because the underlying methodology (how to validate a judge, how to build a golden dataset) is more durable than any single vendor's specific UI, and applies whether you land on LangSmith or an alternative.

Be skeptical of any blog post's specific numbers (cost figures, latency benchmarks, pricing) without a recent date attached — this space changes fast enough that a two-year-old benchmark is close to useless for a purchasing decision today.
`,

  "research-papers": `
LangSmith itself, as a commercial product, is not the subject of academic research papers — it is tooling, not a novel algorithm or architecture. The closest and most relevant research grounding is in the underlying evaluation methodology it operationalizes:

- **Work on LLM-as-judge evaluation and its calibration/bias properties** — the academic literature studying how well LLM judges agree with human raters, and where they systematically diverge (e.g. length bias, self-preference bias when a model judges its own outputs), is the most directly relevant research area for understanding LangSmith's evaluator features critically rather than trusting them by default.
- **Distributed tracing and observability research** (the systems literature behind tools like Dapper at Google, and the broader OpenTelemetry standardization effort) — foundational for understanding why trace-tree-based debugging works, even though it predates LLM-specific applications. See the **Tracing** skill for pointers into this literature.
- **RAG evaluation research** — papers studying how to evaluate retrieval quality and groundedness separately from generation quality are directly relevant to interpreting a LangSmith RAG trace correctly (was the failure retrieval or generation).

If this section feels thinner than others on this page, that's an honest reflection of the field: LangSmith-the-product sits downstream of research, applying established evaluation and observability ideas in a packaged tool, rather than being itself a research contribution. For rigorous grounding, go to the **AI Evals** skill's research-papers section, which covers LLM evaluation methodology in more depth.
`,

  videos: `
- **LangChain's own official YouTube channel and conference talks** (e.g. their developer-day style events) — the most direct source for walkthroughs of LangSmith's tracing, evaluation, and Prompt Hub features straight from the team that builds it.
- **Talks from AI engineering conferences** (search recent editions of events focused on applied LLM engineering) that cover production LLM observability and evaluation in general — many feature practitioners discussing LangSmith, Langfuse, or comparable tools alongside their own war stories.
- **Independent AI engineering YouTube creators** who publish hands-on walkthroughs of building and evaluating LangChain/LangGraph applications — useful for seeing an unfiltered, warts-and-all instrumentation session rather than a polished vendor demo.

Because specific video titles and URLs age and move quickly (and this page should never invent a URL it hasn't verified), search the official LangChain channel and recent AI-engineering conference talk archives directly for the most current, concrete recommendations rather than relying on a fixed list here.
`,

  "github-repos": `
- **langchain-ai/langsmith-sdk** — the official Python/JavaScript SDK source; reading it directly clarifies exactly how @traceable, context propagation, and the evaluate() function work under the hood.
- **langchain-ai/langchain** — the orchestration framework whose internals emit LangSmith-compatible trace events natively; essential reading if you want to understand the "zero-code tracing" integration path.
- **langchain-ai/langgraph** — the agent framework LangSmith's trajectory-evaluation features are most directly built around; useful for understanding what a multi-step agent trace actually looks like structurally.
- **langfuse/langfuse** — the leading open-source alternative; reading its source is a genuinely useful way to see an independently-designed take on the same core problem (traces, datasets, evaluators, feedback), and clarifies by contrast what LangSmith does differently.
- **open-telemetry/opentelemetry-python** (and the JS equivalent) — the vendor-neutral tracing standard whose span/context-propagation model parallels LangSmith's run-tree design; useful background for understanding the mechanics generically.
- **Example/cookbook repos** — search for official LangChain "cookbook" or example repositories demonstrating end-to-end LangSmith evaluation pipelines; these tend to be the fastest way to see a complete, working setup rather than piecing one together from docs alone.

Star/fork counts and exact repo names shift over time; use these as a starting search list and verify current names/locations on GitHub directly, since organizations occasionally rename or restructure repos.
`,

  "practice-problems": `
Ordered by skill focus, from foundational tracing mechanics to full evaluation-pipeline design:

1. **Instrumentation basics**: instrument a 3-step function pipeline (fetch → transform → summarize) with @traceable and confirm correct parent-child nesting in the UI.
2. **Tag and metadata design**: design a tagging scheme (environment, feature, prompt version, model) for a hypothetical multi-feature LLM product, and justify why each tag earns its place.
3. **Dataset construction**: given a sample of 100 real (fictional) production traces, describe your process for selecting 20 of them to seed a golden dataset, including how you'd ensure edge-case coverage.
4. **Evaluator design**: write both a heuristic and an LLM-as-judge evaluator for a summarization task, then design the human-labeling process you'd use to validate the judge evaluator before trusting it.
5. **Experiment comparison**: given two experiments' per-example scores (hypothetical data), determine whether the aggregate improvement is likely a real effect or noise, and justify your reasoning about sample size.
6. **Trajectory evaluation**: design an evaluator for a 4-tool agent that scores whether the correct subset and order of tools were called, independent of whether the final answer happened to be correct.
7. **Production monitoring design**: sketch the dashboard and alert thresholds you'd configure for a support-bot LangSmith project, justifying each threshold against a user-facing symptom.
8. **Cost/sampling tradeoff**: given a hypothetical traffic volume and per-trace cost, calculate a sampling rate that keeps monthly tracing cost under a target budget while always tracing errors.
9. **External practice sets**: LangChain and LangSmith's own official tutorials and quickstarts (docs.smith.langchain.com) are the best-maintained, most current hands-on exercises available — work through them directly for API-accurate practice that keeps pace with product changes.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client["Client / end user"]
        U["User request"]
        FB["Thumbs up/down feedback"]
    end

    subgraph AppLayer["Application (FastAPI + LangChain/LangGraph or custom)"]
        API["API layer"]
        Chain["Chain / agent logic"]
        Retr["Retriever"]
        LLMc["LLM provider call"]
        SDK["LangSmith SDK\\n(@traceable / native callbacks)"]
    end

    subgraph LangSmithPlatform["LangSmith platform"]
        Ingest["Ingestion API"]
        Store[("Run / trace store")]
        Eval["Evaluation engine"]
        Mon["Monitoring dashboards"]
        Hub["Prompt Hub"]
        Queue["Annotation queues"]
        UIweb["Web UI"]
    end

    subgraph OfflineLoop["Offline evaluation loop"]
        DS[("Golden dataset")]
        CI["CI pipeline: evaluate() gate"]
    end

    U --> API --> Chain
    Chain --> Retr
    Chain --> LLMc
    Chain --> SDK
    Retr --> SDK
    LLMc --> SDK
    SDK -->|"async batched"| Ingest --> Store

    FB --> API --> Ingest

    Store --> Mon --> UIweb
    Store --> Eval
    DS --> Eval --> UIweb
    CI --> Eval
    Hub --> Chain
    Store --> Queue --> UIweb

    UIweb --> Reviewer["Engineer / human reviewer"]
    Reviewer -->|"promote interesting traces"| DS
~~~

This reference architecture shows the two loops that matter: the **online loop** (a real user request flowing through the app, traced asynchronously into LangSmith, with feedback attached to the same run_id) and the **offline loop** (production traces promoted into a golden dataset, evaluated in CI, feeding back into prompt/chain changes) — the two loops meet at the human reviewer, who both consumes the monitoring dashboard and annotation queue and feeds new examples back into the dataset that CI evaluates against.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((LangSmith))
    Foundations
      What it is
        Tracing + Eval + Monitoring platform
        Built by LangChain team
      Why it exists
        LLM apps need trace trees, not just latency/errors
        Quality bugs are not crashes
    Tracing
      Runs and traces
      @traceable decorator
      Context propagation
      Native LangChain/LangGraph integration
      Trace tree UI
    Evaluation
      Datasets
        Built from production traces
      Evaluators
        Heuristic
        LLM-as-judge
        Trajectory-level for agents
      Experiments
        Compare prompt/model versions
    Production
      Monitoring dashboards
        Latency percentiles
        Error rate
        Cost per trace
        Feedback trend
      Human feedback loop
        Thumbs up/down tied to run_id
      Prompt Hub
        Versioning and rollback
      Annotation queues
        Human review at scale
    Ecosystem
      LangChain and LangGraph
      Langfuse comparison
      Classical observability
        Metrics, Logging, Tracing skills
      AI Evals and AI Harness
      LLMOps lifecycle
    Honest limits
      Tightest with LangChain/LangGraph
      SDK works elsewhere, more manual
      Not a replacement for infra APM
      Validate LLM-as-judge before trusting it
      Verify pricing/tiers against current docs
~~~
`,
};

export default langsmith;
