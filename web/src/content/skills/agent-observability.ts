import type { SkillContent } from "../types";

/**
 * Agent Observability — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const agentObservability: SkillContent = {
  overview: `
Agent observability is the discipline of making an AI agent's internal reasoning, tool use, and multi-step decision-making visible, inspectable, and measurable — before, during, and after it runs in production. It is not a product; it is a set of concepts (traces, spans, span attributes, evaluation of intermediate steps) that any vendor tool or in-house pipeline can implement. **LangSmith** and **Langfuse** are two well-known vendor implementations of this discipline; this page is about the underlying ideas both of them are built on, so that you can reason about agent observability even with a different tool, a self-built pipeline, or a new platform that doesn't exist yet.

Classical Application Performance Monitoring (APM) — Datadog, New Relic, Prometheus + Grafana — was built to answer "was the request fast, did it error, is the service up." Those questions still matter for an agent's infrastructure (see the **Metrics** and **Logging** skills), but they say nothing about whether the agent's tenth reasoning step hallucinated a tool call, whether it looped four times before giving up, or whether the final answer is actually correct. A request can return 200 OK in 800 milliseconds and still be a confidently wrong, expensively-computed answer — the failure lives in the reasoning trajectory, not in the HTTP status code. Agent observability exists to make that trajectory a first-class, queryable object instead of something you can only guess at from a chat transcript.

For an AI engineer, agent observability matters because agents are fundamentally harder to observe than either classical services or single-shot LLM calls. A classical service's trace is a fixed call graph: request comes in, hits three known downstream services, returns. A single LLM call is one hop: prompt in, completion out. An agent's trace is neither — it is a variable-length, non-deterministic tree of LLM calls, tool invocations, retries, and sub-agent handoffs whose shape is only known after the run finishes, and where the thing you most need to debug (why did the agent decide to do that) is a natural-language reasoning step, not a stack frame. Key characteristics of agent observability as a discipline: it is trace-and-span-based (borrowing the vocabulary of distributed tracing, but with agent-specific span types); it treats tokens, cost, and tool calls as first-class span attributes, not incidental metadata; it must catch semantic failures (hallucinated tool calls, infinite loops, reasoning drift) that no HTTP-level metric can see; and it increasingly speaks a shared vocabulary via the OpenTelemetry GenAI semantic conventions, so traces captured by one tool can, in principle, be read by another.
`,

  history: `
Agent observability's lineage runs through two older disciplines that only recently merged: classical distributed tracing (built for microservices) and LLM-specific observability (built for single-shot prompt/completion debugging). Agent observability is what happened when LLM calls stopped being single-shot and started looping, calling tools, and delegating to other agents — the older tracing vocabulary had to be extended, not replaced.

| Year | Milestone |
|------|-----------|
| 2010 | Google publishes the Dapper paper, establishing the trace/span data model (a request as a tree of nested timed operations) that all later distributed tracing — and later agent observability — borrows directly |
| 2019 | The OpenTelemetry project forms from the merger of OpenCensus and OpenTracing, standardizing vendor-neutral instrumentation for traces, metrics, and logs across the software industry |
| 2022–2023 | Early LLM app debugging is print-statement and raw-JSON-log based; as chains grow past two or three calls, teams lose the ability to see what happened inside them |
| 2023 | **LangSmith** and **Langfuse** launch within months of each other, both applying the trace/span model specifically to LLM call chains — capturing prompts, completions, tokens, and cost per step, not just latency and status |
| 2023–2024 | Autonomous agent loops (tool-calling agents, ReAct-style reasoning) become common enough that "trace" needs new span types: a tool-call span, a "thought" or reasoning span, distinct from a plain LLM-generation span |
| 2024 | The OpenTelemetry community begins formal work on **GenAI semantic conventions** — standardized attribute names (gen_ai.request.model, gen_ai.usage.input_tokens, and related fields) so that any OTel-compatible backend can display LLM and agent spans consistently, rather than every vendor inventing its own schema |
| 2024–2025 | Multi-agent frameworks (**LangGraph**, CrewAI, AutoGen) make cross-agent handoffs common enough that observability tools add explicit support for nested agent-to-agent spans, not just nested tool calls within one agent |
| 2025–2026 | Convergence toward OTel-native ingestion (Langfuse and others accept raw OTel spans directly) and growing attention to catching agent-specific failure modes — hallucinated tool calls, infinite reasoning loops, silent context loss — as a distinct evaluation problem from classical uptime/latency monitoring; I would verify current adoption numbers and the GenAI semantic conventions' exact stabilization status against the OpenTelemetry project directly, since this area is still actively standardizing as of my knowledge cutoff

The throughline: agent observability did not invent a new data model — it took Dapper-style traces and spans, which already generalized well to any nested, timed operation tree, and extended the vocabulary with agent-specific span types and attributes (tool name, prompt/completion tokens, cost per hop) that classical APM never needed.
`,

  "why-it-exists": `
Before agent observability was named as its own discipline, teams building agents hit the same wall from two directions at once:

- **Classical APM sees the trees, misses the forest of reasoning.** A Datadog or New Relic dashboard will happily tell you an agent's HTTP endpoint took 4.2 seconds and returned 200 OK. It has no concept of "the agent tried to call a tool that doesn't exist," "the agent looped through the same three steps six times before giving up," or "the reasoning step three hops in confidently asserted a fact that was never in its retrieved context." The failure is semantic, not infrastructural, and infrastructural monitoring is structurally blind to it.
- **Flat LLM-call logging doesn't capture the shape of an agent run.** Logging every prompt/completion pair as an independent log line loses the parent-child relationship between an agent's planning step, the tool calls it triggered, and the final synthesis step that used their results — you can see that ten LLM calls happened, but not which call caused which subsequent call, or how long the whole chain took end to end.
- **No standard vocabulary for what to measure per step.** Before span attributes for tokens, tool name, per-hop latency, and per-hop cost were named and standardized, every team invented its own ad hoc logging schema, making it hard to compare tools, hard to build reusable dashboards, and hard for a new engineer to onboard onto an existing system's observability setup.
- **No accepted way to catch agent-specific failure modes systematically.** Hallucinated tool calls (the agent invokes a tool name or arguments that don't correspond to anything real) and infinite loops (the agent repeats the same unproductive step) are common enough in production agents that they needed named detection patterns, not case-by-case manual discovery after a user complaint.

Agent observability exists to give these recurring needs — trace an agent's full reasoning trajectory, attribute cost and latency to the specific hop responsible, and catch semantic failures automatically — a shared vocabulary and a standardized attribute schema (the OpenTelemetry GenAI conventions), so that any tool, in-house or vendor, can be built on the same foundation rather than reinventing agent-specific tracing from scratch every time.
`,

  "problem-it-solves": `
Concretely, agent observability removes or manages these pains:

- **"Why did the agent do that?" with no way to answer it.** A full trace tree — every LLM call, every tool call, every retry, every sub-agent handoff, in order, with inputs and outputs at each node — turns "the agent's answer was wrong, somewhere" into "the agent's answer was wrong because step 4 hallucinated a tool argument," a debuggable, specific claim.
- **Cost and latency attributed to the wrong place.** Without per-hop span attributes, a slow or expensive agent run looks like one big number; with them, you can see that one specific tool call (a slow external API) or one specific LLM call (an unnecessarily large model for a trivial classification step) is the actual driver, and fix that instead of guessing.
- **Silent failure modes that never surface as an error.** A hallucinated tool call, an infinite reasoning loop that eventually times out, or a multi-step chain that quietly drops context between hops does not throw an exception — it just produces a bad or slow answer. Agent observability gives you the instrumentation needed to detect these patterns systematically (see Advanced Concepts) rather than relying on a user reporting "the bot said something weird."
- **No way to reconstruct a specific bad production run after the fact.** With trace IDs and full span capture, an engineer can pull up the exact run a user complained about — the exact prompt sent, the exact tool results returned, the exact reasoning that led to the final answer — rather than trying to guess what might have happened from an aggregate dashboard.
- **Evaluation that only looks at final output, missing broken reasoning that happened to reach a correct answer anyway (or vice versa).** Logging and scoring intermediate reasoning steps, not just the final response, catches "right answer, wrong (unreliable) process" cases that a pure output-quality eval would miss.

What agent observability deliberately does **not** solve:

- It does not make the agent smarter or more correct by itself — observability tells you where and how a run went wrong; fixing the agent's prompt, tools, or architecture is a separate step informed by, but not performed by, the observability layer.
- It does not replace classical infrastructure monitoring (uptime, resource usage, network health) — see the **Metrics** and **Logging** skills; agents still run on servers that can run out of memory or lose network connectivity, independent of anything about their reasoning.
- It does not replace a rigorous evaluation program — see **AI Evals** — observability surfaces what happened; evals judge whether what happened was good, and the two disciplines are complementary, not substitutes for each other.
- It does not, by itself, prevent bad agent behavior — it makes bad behavior visible so a human or an automated guard can act on it; enforcement is the job of guardrails, approval gates (see **Human-in-the-Loop AI**), and the agent's own design.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain why an agent's execution trace needs a tree-shaped trace/span model rather than flat logging, and distinguish an agent trace from a classical APM trace.
2. Instrument an agent so every LLM call, tool call, and retry is captured as its own span, correctly nested under its parent step.
3. Name and populate the agent-specific span attributes that matter in production: prompt tokens, completion tokens, tool name and arguments, latency per hop, and cost per hop.
4. Design a strategy for logging and evaluating intermediate reasoning steps, not just the agent's final output.
5. Detect two of the most common agent-specific failure modes in a trace: a hallucinated tool call (the agent invokes a tool or arguments that don't exist or don't match the schema) and an infinite or near-infinite reasoning loop.
6. Explain the OpenTelemetry GenAI semantic conventions at a working level — what attribute names they standardize and why that standardization matters for interoperability between tools.
7. Compare agent observability as a discipline against **LangSmith** and **Langfuse** as vendor products, and articulate what each adds on top of the underlying concepts this page covers.
8. Describe how agent observability changes when tracing spans multiple agents (see **Multi-Agent Systems**), including how to trace a handoff between two independently-owned agents.
9. Design a workflow where traces are surfaced for human review or approval, connecting to the **Human-in-the-Loop AI** skill.
10. Explain how agent observability relates to and is distinct from **MCP**, **AI Evals**, and **Prompt Versioning** / **Model Routing**, and know when each of those is the right tool for a given problem.
`,

  prerequisites: `
- **Required**: a solid understanding of a single LLM agent's reason-act-observe loop and tool calling — see **Agent Fundamentals** and **Tool Calling** before this page. You cannot design good instrumentation for a loop you don't understand the shape of.
- **Required**: the general observability vocabulary — traces, spans, structured logs, metrics — from the **Logging**, **Metrics**, and **Tracing** skills. This page assumes you know what a trace and a span are in the classical distributed-systems sense and builds the agent-specific extensions on top of that foundation.
- **Strongly recommended**: familiarity with **OpenTelemetry** at a conceptual level — this page's treatment of the GenAI semantic conventions assumes you know roughly what OTel is and what a semantic convention accomplishes (a standardized attribute vocabulary, not a new wire protocol).
- **Strongly recommended**: at least a skim of **LangSmith** and **Langfuse** — this page's Comparisons section assumes a rough sense of what each platform's UI and data model look like, even if you haven't built with either.
- **Helpful**: **Multi-Agent Systems**, since tracing handoffs between independently-reasoning agents is a meaningfully harder version of the single-agent tracing problem this page starts with.
- **Helpful**: **AI Evals**, **MCP**, **Prompt Versioning**, and **Model Routing** — this page draws explicit boundaries between agent observability and each of these adjacent disciplines, and having a working sense of each makes those boundaries land faster.

Dependency chain: **Agent Fundamentals** → **Tool Calling** → **Logging** / **Metrics** / **Tracing** → this page → **LangSmith** / **Langfuse** for a concrete implementation, and **Multi-Agent Systems** / **Human-in-the-Loop AI** for how observability extends into more complex production systems.
`,

  "beginner-concepts": `
### Why a chat transcript isn't enough

Imagine an agent that answers "what's the weather in Paris and should I bring an umbrella." A chat transcript shows you the question and the final answer. It does not show you that the agent first called a search tool, got a malformed result, retried with different arguments, then called a weather API, then reasoned over the result to produce a recommendation. If the final answer is wrong, the transcript alone cannot tell you which of those four hidden steps caused it.

~~~python
# Conceptual sketch -- an agent step with no instrumentation at all.
# This "works" but is completely opaque once something goes wrong.
def run_agent(question: str) -> str:
    plan = call_llm(system="Plan the steps.", user=question)
    tool_result = call_weather_tool(city="Paris")
    answer = call_llm(system="Answer using this data.", user=f"{plan}\\n{tool_result}")
    return answer
~~~

### Traces and spans: the core vocabulary

A **trace** is the record of one complete agent run, from the initial user request to the final response. A **span** is one timed step inside that trace — one LLM call, one tool call, one retry attempt. Spans nest: a top-level "agent run" span contains a "planning" span, which might contain a "tool call" span, which might contain a "retry" span if the first attempt failed. This tree shape (borrowed directly from classical distributed tracing, see the **Tracing** skill) is what lets you answer "which specific step" instead of only "something in this run."

~~~python
# The same agent, minimally instrumented with an explicit span concept.
# Framework-agnostic pseudocode -- the shape matters more than the API.
def run_agent(question: str, tracer) -> str:
    with tracer.start_span("agent_run", input=question) as run_span:
        with tracer.start_span("planning", parent=run_span) as plan_span:
            plan = call_llm(system="Plan the steps.", user=question)
            plan_span.set_output(plan)

        with tracer.start_span("tool_call", parent=run_span, tool_name="weather_api") as tool_span:
            tool_result = call_weather_tool(city="Paris")
            tool_span.set_output(tool_result)

        with tracer.start_span("synthesis", parent=run_span) as synth_span:
            answer = call_llm(system="Answer using this data.", user=f"{plan}\\n{tool_result}")
            synth_span.set_output(answer)

        run_span.set_output(answer)
        return answer
~~~

Now, if the answer is wrong, you can open the trace tree and look at each span's input and output independently: did planning produce a sensible plan? Did the tool call return correct data? Did synthesis correctly use that data? Each question maps to one span.

### What makes an agent span different from an ordinary trace span

An ordinary microservice trace span records a fixed set of things: start time, end time, status code, maybe a couple of tags. An agent span needs agent-specific attributes to be useful at all: which model was called, how many prompt and completion tokens it used, what the estimated cost was, which tool (if any) was invoked and with what arguments, and whether this span was a retry of a previous attempt. Without these fields, a trace tells you an LLM call happened, but not what it cost, what model handled it, or why it might have failed — see Intermediate Concepts for the concrete attribute list.

### A minimal example with token and cost logging

~~~python
def call_llm_traced(system: str, user: str, tracer, parent_span):
    with tracer.start_span("llm_call", parent=parent_span) as span:
        response = llm_client.chat(system=system, user=user)
        # The agent-specific attributes that make this span worth having:
        span.set_attribute("gen_ai.request.model", response.model)
        span.set_attribute("gen_ai.usage.input_tokens", response.usage.input_tokens)
        span.set_attribute("gen_ai.usage.output_tokens", response.usage.output_tokens)
        span.set_attribute("cost_usd", estimate_cost(response.model, response.usage))
        return response.text
~~~

The beginner-level takeaway: agent observability starts the moment you stop treating an agent run as one opaque function call and start treating it as a tree of named, attributed steps you can inspect independently.
`,

  "intermediate-concepts": `
### The full span-attribute vocabulary for agent traces

~~~mermaid
flowchart TB
    subgraph Trace["One agent run = one trace"]
        R["Root span: agent_run\ntotal latency, total cost, final status"]
        R --> P["Span: planning / reasoning\nmodel, tokens, latency"]
        R --> T1["Span: tool_call\ntool name, arguments, result, latency"]
        R --> T2["Span: tool_call (retry)\nretry_count, parent tool span"]
        R --> S["Span: synthesis\nmodel, tokens, cost, latency"]
        T2 -.->|"retries"| T1
    end
~~~

A production-grade agent span carries, at minimum:

- **gen_ai.request.model** — which model served this specific hop (critical once an agent uses different models for different steps, see **Model Routing**).
- **gen_ai.usage.input_tokens / gen_ai.usage.output_tokens** — prompt and completion tokens for this hop specifically, not just the whole run's total.
- **cost per hop** — derived from tokens and the model's price, attributed to the specific span, so a single expensive step in an otherwise cheap run is visible rather than hidden in an aggregate total.
- **latency per hop** — wall-clock duration of this specific span, distinct from the trace's total latency, so you can identify which step dominates a slow run.
- **tool.name / tool.arguments / tool.result** — for a tool-call span: which tool was invoked, with what arguments, and what it returned. This is the single most important field for catching hallucinated tool calls (see Advanced Concepts).
- **retry_count / parent_span_id** — whether this span is a retry of a previous attempt, and which span it's retrying, so a retry storm is visible as a pattern rather than a series of unrelated-looking spans.
- **status** — success, error, or a domain-specific status like "timed_out" or "max_retries_exceeded," distinct from an HTTP status code.

### Distinguishing an agent trace from a classic APM trace

| Dimension | Classic APM trace (Datadog, Jaeger) | Agent trace |
|---|---|---|
| Span shape | Fixed: this service always calls those two downstream services | Variable: the agent decides at runtime how many steps and which tools to invoke |
| Primary failure signal | HTTP status code, exception, latency threshold | A plausible-sounding wrong answer with a 200 status and normal latency |
| Key attributes | Host, route, status code, duration | Model, prompt/completion tokens, tool name/arguments, cost, reasoning content |
| "Correctness" | Not a concept the trace itself models | A first-class question the trace must support answering, often via attached eval scores |
| Determinism | The call graph is fixed by code | The call graph is only known after the run completes, since the agent's own reasoning decides what happens next |

### Tracking tool calls, retries, and multi-step reasoning chains

~~~python
from dataclasses import dataclass, field

@dataclass
class ToolCallSpan:
    tool_name: str
    arguments: dict
    result: str | None = None
    error: str | None = None
    retry_of: str | None = None   # span id of the attempt this retries, if any
    latency_ms: float = 0.0

def call_tool_traced(tool_name: str, arguments: dict, tool_fn, tracer, parent_span, retry_of=None):
    import time
    start = time.perf_counter()
    with tracer.start_span("tool_call", parent=parent_span) as span:
        span.set_attribute("tool.name", tool_name)
        span.set_attribute("tool.arguments", arguments)
        if retry_of:
            span.set_attribute("retry_of", retry_of)
        try:
            result = tool_fn(**arguments)
            span.set_attribute("tool.result", result)
            span.set_status("ok")
            return result
        except Exception as e:
            span.set_attribute("error", str(e))
            span.set_status("error")
            raise
        finally:
            span.set_attribute("latency_ms", (time.perf_counter() - start) * 1000)
~~~

A multi-step reasoning chain (plan, act, observe, repeat) should be captured as a sequence of sibling spans under the same parent, each with an explicit step index — that ordering is what lets you replay the reasoning trajectory later, not just see that N steps happened.

~~~python
async def run_react_loop(question: str, tools: dict, tracer, max_steps: int = 6) -> str:
    with tracer.start_span("agent_run", input=question) as run_span:
        for step in range(max_steps):
            with tracer.start_span(f"reasoning_step_{step}", parent=run_span) as step_span:
                thought, action = await plan_next_step(question, step_span)
                step_span.set_attribute("thought", thought)
                if action.is_final_answer:
                    run_span.set_output(action.content)
                    return action.content
                result = await call_tool_traced(
                    action.tool_name, action.arguments, tools[action.tool_name],
                    tracer, step_span,
                )
                step_span.set_attribute("tool_result", result)
        # Hit max_steps without a final answer -- this itself is a signal
        # worth logging explicitly, not silently returning a partial result.
        run_span.set_status("max_steps_exceeded")
        return "Could not complete within step limit."
~~~

### Logging intermediate reasoning, not just final output

Capturing the agent's stated "thought" or rationale at each step (not just its final action) lets you evaluate reasoning quality separately from output quality — an agent can reach a correct final answer through unreliable reasoning (get lucky), and catching that distinction matters for trusting the agent on inputs where luck won't hold. See the **AI Evals** skill for the general discipline of scoring these intermediate steps, not only the final response.
`,

  "advanced-concepts": `
### Catching hallucinated tool calls

A hallucinated tool call happens when the model emits a tool invocation that does not correspond to a real, registered tool, or emits arguments that don't match the tool's schema (wrong types, missing required fields, or a plausible-but-nonexistent parameter name). Because the agent's runtime usually validates tool calls against a schema before executing them, hallucinated tool calls are visible in the trace as a distinct pattern — a tool-call span whose validation failed before the tool function ever ran.

~~~python
from pydantic import BaseModel, ValidationError

class WeatherArgs(BaseModel):
    city: str
    units: str = "metric"

def validate_tool_call(tool_name: str, raw_arguments: dict, schema: type[BaseModel], span) -> BaseModel | None:
    try:
        validated = schema.model_validate(raw_arguments)
        span.set_attribute("tool_call.valid", True)
        return validated
    except ValidationError as e:
        # This is a hallucinated or malformed tool call -- log it as its
        # own distinct, queryable signal, not just a generic error.
        span.set_attribute("tool_call.valid", False)
        span.set_attribute("tool_call.hallucination_reason", str(e))
        span.set_status("hallucinated_tool_call")
        return None
~~~

The senior practice: track a hallucinated-tool-call rate as its own metric (hallucinated calls divided by total tool-call attempts), broken down by model and by tool, so a spike after a model or prompt change is caught in aggregate monitoring rather than discovered one angry user report at a time.

### Catching infinite or near-infinite loops

An agent loop is unproductive when it repeats the same or a functionally equivalent step without making progress toward a final answer. Because the agent's own stopping logic is what should end the loop, and that logic can itself fail, detection needs to live one level above the agent's own reasoning:

~~~python
def detect_loop(step_history: list[dict], window: int = 3) -> bool:
    """A crude but effective heuristic: if the last 'window' steps issued
    the same tool with the same (or near-identical) arguments, the agent
    is very likely stuck rather than making progress."""
    if len(step_history) < window:
        return False
    recent = step_history[-window:]
    signatures = {(s["tool_name"], frozenset(s["arguments"].items())) for s in recent}
    return len(signatures) == 1   # every recent step was identical

async def run_with_loop_guard(question: str, tools: dict, tracer, max_steps: int = 10):
    history: list[dict] = []
    with tracer.start_span("agent_run", input=question) as run_span:
        for step in range(max_steps):
            action = await plan_next_step(question, history)
            if detect_loop(history):
                run_span.set_status("loop_detected")
                run_span.set_attribute("loop_detected_at_step", step)
                return "Stopped: detected a repeating, unproductive step."
            history.append({"tool_name": action.tool_name, "arguments": action.arguments})
            if action.is_final_answer:
                return action.content
        run_span.set_status("max_steps_exceeded")
        return "Could not complete within step limit."
~~~

Both a hard step cap AND a loop-similarity heuristic are needed together — the step cap alone lets a stuck agent burn its full budget before stopping, while the similarity heuristic alone can miss a loop that varies slightly each iteration without making genuine progress (a "slow loop" rather than an exact repeat).

### OpenTelemetry GenAI semantic conventions in depth

The OpenTelemetry project's GenAI semantic conventions standardize attribute names for LLM and agent spans so that any OTel-compatible backend (open-source or commercial) can render them consistently, the same way http.status_code and http.method are standardized for web requests. The conventions define, among others: gen_ai.system (which provider, e.g. openai or anthropic), gen_ai.request.model, gen_ai.response.model, gen_ai.usage.input_tokens, gen_ai.usage.output_tokens, and span kinds distinguishing a plain "chat" span from a "tool execution" span. Adopting these names (rather than inventing your own gen_model or n_tokens_used fields) means a trace exported from your own instrumentation can, in principle, be ingested by any OTel-compatible tool without a custom mapping layer — the same interoperability payoff that motivated the original OpenTelemetry merger for classical infrastructure tracing. As of my knowledge cutoff, treat the exact set of stabilized attribute names as something to verify against the current OpenTelemetry specification directly, since semantic conventions for a fast-moving area like GenAI continue to be refined and are not all past the "stable" maturity level.

### Multi-agent tracing: propagating a trace across agent boundaries

When one agent hands off to another (see **Multi-Agent Systems**), the receiving agent's spans need to be children of the delegating span, not a disconnected new trace — otherwise you lose the ability to see the whole chain end to end. This requires explicitly propagating a trace context (a trace ID and parent span ID) across whatever boundary separates the two agents, whether that's an in-process function call, an internal message queue, or an **A2A Protocol** request to an externally-owned agent.

~~~python
def delegate_to_sub_agent(task: str, sub_agent_fn, tracer, parent_span):
    # Propagate the current trace context explicitly -- the sub-agent's
    # own spans must nest under this span, not start a brand-new trace.
    trace_context = tracer.extract_context(parent_span)
    with tracer.start_span("sub_agent_delegation", parent=parent_span) as delegation_span:
        delegation_span.set_attribute("delegate_to", sub_agent_fn.__name__)
        result = sub_agent_fn(task, trace_context=trace_context)
        delegation_span.set_output(result)
        return result
~~~

When the receiving agent is owned by a different team or organization (an **A2A Protocol** or **MCP**-mediated boundary), you generally cannot force the remote agent to use your tracing backend — the realistic pattern is to log your own span for "the delegation happened and here's what came back," treating the remote agent as an opaque black box whose internal trace (if any) you don't have visibility into, mirroring the trust-boundary treatment covered in the **Multi-Agent Systems** skill's security section.

### Decision table: what to instrument at each layer

| Layer | What to capture |
|---|---|
| Every LLM call | Model, prompt/completion tokens, cost, latency, and (if feasible) a hash or truncated copy of the actual rendered prompt |
| Every tool call | Tool name, arguments (schema-validated), result, latency, success/failure/hallucination status |
| Every reasoning step | The model's stated "thought"/rationale, not only its resulting action |
| Every retry | Which span it retries, and why the original attempt failed |
| Every multi-agent handoff | Delegating agent id, receiving agent id, propagated trace/parent-span id, and the handoff payload |
| The whole run | Total latency, total cost, final status, and (where available) an attached evaluation score |
`,

  "internal-working": `
Here is what actually happens, step by step, inside a well-instrumented agent run from the first request to the final, queryable trace:

~~~mermaid
flowchart TD
    A["Request arrives; a new trace ID\nis generated (or propagated from caller)"] --> B["Root span opens:\nagent_run"]
    B --> C["Planning/reasoning span opens\nas a child of the root span"]
    C --> D{"Agent decides:\ntool call or final answer?"}
    D -- "tool call" --> E["Tool-call span opens\n(tool name, arguments)"]
    E --> F["Arguments validated\nagainst tool schema"]
    F -- "invalid" --> G["Span marked\nhallucinated_tool_call"]
    F -- "valid" --> H["Tool executes;\nresult + latency captured"]
    H --> I["Result fed back into\nnext reasoning span"]
    I --> C
    G --> C
    D -- "final answer" --> J["Synthesis span closes;\nroot span closes"]
    J --> K["Full trace tree flushed\nto the observability backend"]
    K --> L["Trace becomes queryable:\nby cost, latency, status,\nor attached eval score"]
~~~

1. **Trace initiation.** A new trace ID is minted at the start of an agent run (or propagated from an upstream caller, if this agent was itself invoked by another system) — this ID is what ties every subsequent span, however deeply nested, back to one coherent run.
2. **Root span.** A top-level span for the whole agent run opens, recording the initial input and, once the run finishes, the total latency, total cost, and final status.
3. **Reasoning/planning spans.** Each reasoning step opens its own child span, capturing the model used, tokens consumed, and — critically — the agent's stated rationale for what it does next, not only the resulting action.
4. **Tool-call spans and validation.** When the agent decides to call a tool, a tool-call span opens and the proposed arguments are validated against the tool's schema before execution — this is the exact point where a hallucinated tool call becomes visible as a distinct, loggable event rather than a silent failure downstream.
5. **Execution and result capture.** A valid tool call executes; its result, latency, and success/failure status are recorded on the span, and the result feeds back into the next reasoning step as a new input.
6. **Loop or convergence check.** The cycle of reasoning → tool call → result repeats until the agent produces a final answer, a hard step cap is hit, or a loop-detection heuristic fires — each of these three outcomes should close the run with an explicit, distinct status, not a generic "done."
7. **Trace flush and export.** The completed tree of spans is flushed to whatever observability backend is configured (a vendor SaaS like LangSmith/Langfuse, a self-hosted OTel collector, or a custom store) — usually asynchronously, so instrumentation overhead doesn't add meaningfully to the agent's own latency.
8. **Queryability.** Once stored, the trace becomes something you can search and aggregate over: find every trace where cost exceeded a threshold, every trace where a hallucinated tool call occurred, every trace attached to a specific user session — this queryability is the entire point of doing all the preceding steps rather than just writing to a flat log file.

The core internal mechanism worth remembering: nothing about agent observability requires a different execution model for the agent itself — the agent still just reasons and calls tools; the entire value-add lives in wrapping every step with a span that records what happened, with enough structure to reconstruct and query the whole run afterward.
`,

  architecture: `
A senior engineer thinks about agent observability at two levels: the runtime instrumentation architecture (how spans are created, propagated, and exported at execution time) and the application architecture (how to structure a codebase so instrumentation doesn't become tangled with business logic).

### Runtime instrumentation architecture

~~~mermaid
flowchart TB
    subgraph Agent["Agent runtime"]
        Loop["Reason-act-observe loop"]
        SDK["Tracing SDK\n(spans created inline with each step)"]
    end
    subgraph Collection["Collection layer"]
        Exporter["Span exporter\n(batches, async flush)"]
        Collector["OTel collector\n(optional, vendor-neutral)"]
    end
    subgraph Backend["Storage + query backend"]
        Vendor["Vendor platform\n(LangSmith / Langfuse)"]
        SelfHosted["Self-hosted store\n(Postgres/ClickHouse + UI)"]
    end
    Loop --> SDK --> Exporter
    Exporter --> Collector
    Collector --> Vendor
    Collector --> SelfHosted
~~~

The OTel collector in the middle is optional but valuable: it decouples the agent's instrumentation from any one backend, so switching from a vendor platform to a self-hosted store (or running both simultaneously during a migration) does not require touching the agent's own code, only the collector's export configuration.

### Application architecture — where instrumentation lives in a codebase

~~~
myagent/
├── src/myagent/
│   ├── core/
│   │   ├── loop.py             # reason-act-observe loop, calls into tracing via a decorator/context manager
│   │   ├── tools/               # individual tool implementations, each schema-validated
│   │   └── planner.py
│   ├── observability/
│   │   ├── tracer.py            # tracer setup: exporter config, sampling policy
│   │   ├── span_attributes.py   # constants for gen_ai.* attribute names (GenAI semantic conventions)
│   │   ├── loop_guard.py        # loop-detection and hallucinated-tool-call detection logic
│   │   └── evaluators.py        # scoring hooks that attach eval results to a trace/span
│   └── config/                  # credentials, sampling rates, backend endpoint
└── tests/
~~~

Rules a mature codebase follows: instrumentation code (tracer setup, span attribute constants, loop-guard logic) lives in one dedicated module, never scattered ad hoc through business logic, so the attribute vocabulary stays consistent across every agent in the codebase; tool implementations validate their own arguments against a schema before the tool-call span is marked valid, rather than trusting the model's output blindly; and evaluators that score intermediate reasoning steps are wired to attach their scores back onto the relevant span/trace, so quality signals and execution data live in the same queryable place instead of two disconnected systems.
`,

  "data-flow": `
Trace one agent request end to end, including a hallucinated tool call caught mid-run and a successful recovery:

~~~mermaid
sequenceDiagram
    participant User
    participant Agent as Agent runtime
    participant Tracer as Tracing SDK
    participant Tool as Weather tool
    participant Backend as Observability backend

    User->>Agent: "What's the weather in Paris?"
    Agent->>Tracer: open root span (agent_run)
    Agent->>Tracer: open reasoning span
    Agent->>Agent: decides to call "get_weather"
    Agent->>Tracer: open tool_call span (args: city="Paris", format="xyz")
    Tracer->>Tracer: validate args against schema -- "format" is not a real field
    Tracer-->>Agent: validation failed, marked hallucinated_tool_call
    Agent->>Agent: re-plans with corrected arguments
    Agent->>Tracer: open tool_call span (retry_of=previous span, args: city="Paris")
    Agent->>Tool: get_weather(city="Paris")
    Tool-->>Agent: "18C, light rain"
    Tracer->>Tracer: record result, latency, cost on span
    Agent->>Tracer: open synthesis span
    Agent->>User: "18C and light rain -- bring an umbrella."
    Agent->>Tracer: close root span (status=ok, total cost, total latency)
    Tracer->>Backend: flush full trace tree
~~~

The critical thing this trace makes visible: the hallucinated tool call did not crash the run or silently corrupt the final answer — it was caught, logged as a distinct, queryable event, and the agent recovered on retry. Without span-level validation and explicit status marking, this entire sequence would have looked identical to a normal successful run in a flat log, and the hallucination would only be discoverable by someone manually reading the raw prompt/completion text after the fact.
`,

  "production-usage": `
### Where agent observability actually shows up in real systems

Production teams instrument three recurring surfaces: the **agent's own reasoning loop** (every LLM call and reasoning step), the **tool layer** (every tool invocation, with schema validation baked into the same code path that creates the span), and **cross-agent handoffs** (see **Multi-Agent Systems**) where trace context must be explicitly propagated across a delegation boundary. Most teams do not build their own tracing backend from scratch — they instrument with an SDK (in-house or vendor) that emits OTel-compatible spans, and send those spans to either a vendor platform (**LangSmith**, **Langfuse**) or a self-hosted OTel collector plus storage backend.

### Typical implementation choices

- **Instrumentation library**: a vendor SDK (LangSmith's or Langfuse's Python/JS client) when already committed to that platform; a raw OpenTelemetry SDK with the GenAI semantic conventions when vendor-neutrality or multi-backend flexibility matters more than out-of-the-box convenience.
- **Sampling**: full capture (100 percent of traces) for anything below a moderate request volume, since agent debugging genuinely needs the specific failing trace, not a statistical sample; head-based or tail-based sampling only once volume makes full capture cost-prohibitive, with a bias toward always keeping traces that errored, hit a loop guard, or scored poorly on an attached evaluator.
- **Redaction**: PII and sensitive tool arguments/results should be redacted or hashed before being sent to a third-party vendor backend, and this redaction should happen inside the instrumentation layer itself, not left to the backend to filter after ingestion — see **Data Privacy** and **Secrets Management**.
- **Retention**: traces retained long enough to support both debugging (recent, short window) and evaluation-set curation (traces sampled from a longer window to build golden datasets), with cost-driven pruning of full trace bodies after the retention window while keeping aggregate metrics indefinitely.

### Operational defaults

- Instrument tracing from the very first prototype, not after the agent is already complex — retrofitting span structure onto a tangled, already-shipped reasoning loop is dramatically more expensive than building it in from day one, the same lesson covered for multi-agent systems generally.
- Attach a stable trace ID (and, for multi-agent systems, a stable correlation ID across every agent involved) to every log line and metric emitted during a run, so a production incident can be reconstructed from any entry point.
- Default to capturing full span attributes (tokens, cost, tool arguments/results, reasoning content) rather than a minimal subset — you cannot retroactively add missing fields to a trace that already happened, so the cost of over-capturing is far lower than the cost of under-capturing.
`,

  "industry-examples": `
- **Coding-assistant and developer-tool agents** commonly instrument every tool call (file read/write, shell command, test run) as its own span with full arguments and results, specifically because a wrong or destructive tool call is the highest-consequence failure mode these products face, and per-hop traceability is what lets an engineering team reconstruct exactly what an agent did to a user's codebase after an incident.
- **Customer-support and triage agents** commonly attach per-trace cost and an automated quality score (an LLM-as-judge evaluator scoring the final response against a rubric) so that a support-quality regression after a prompt or model change shows up in an aggregate dashboard within hours, rather than being discovered from a spike in escalations days later.
- **Research and report-generation agents** that fan out to multiple sub-agents (see **Multi-Agent Systems**) commonly propagate a single trace ID across every sub-agent's spans specifically so a bad final report can be attributed to the one research sub-agent whose findings were wrong, rather than requiring a manual re-read of the whole assembled output.
- **Teams operating agents across multiple model providers** (see **Model Routing**) commonly rely on per-hop model and cost attributes specifically to verify that a routing policy is actually sending the right requests to the right (cheaper or more capable) model, since a routing bug that silently sends everything to the expensive model would otherwise only show up as an unexplained cost increase weeks later.

Given how fast this space moves and how much production architecture is proprietary, I would treat any specific "Company X's observability stack is exactly Y" claim as something to verify against current sources rather than settled fact — this section reflects general patterns that recur across the industry as of my knowledge cutoff, not a verified list of named deployments.
`,

  "best-practices": `
1. **Instrument every LLM call and every tool call as its own span from the first prototype**, not retroactively — retrofitting span structure onto an already-complex agent is dramatically more expensive than building it in from day one.
2. **Adopt the OpenTelemetry GenAI semantic convention attribute names** (gen_ai.request.model, gen_ai.usage.input_tokens, and related fields) rather than inventing your own schema, so traces remain portable across tools and team members share one vocabulary.
3. **Capture per-hop cost and latency, not only per-run totals**, so a single expensive or slow step in an otherwise cheap run is identifiable rather than hidden inside an aggregate number.
4. **Validate every tool call's arguments against its schema at the same point you create its span**, marking hallucinated or malformed calls explicitly rather than letting them fail silently downstream or crash the tool function with an unhandled exception.
5. **Pair every cyclic reasoning loop with both a hard step cap and a loop-similarity heuristic**, and close the run with an explicit, distinct status (max_steps_exceeded, loop_detected, ok) rather than a generic "done."
6. **Log the agent's stated reasoning/rationale at each step, not only its resulting action**, so reasoning quality can be evaluated separately from output quality — see **AI Evals**.
7. **Propagate trace context explicitly across every multi-agent handoff**, so a cross-agent failure can be attributed to the specific agent and hop responsible instead of appearing as two disconnected traces — see **Multi-Agent Systems**.
8. **Redact or hash PII and sensitive tool arguments/results at the instrumentation layer**, before data leaves your own process, especially when exporting to a third-party vendor backend.
9. **Attach evaluation scores back onto the trace or span they judge**, not to a separate disconnected system, so quality signals and execution data are queryable together.
10. **Default to full trace capture until volume genuinely requires sampling**, and when sampling becomes necessary, always keep traces that errored, hit a loop guard, or scored poorly, rather than sampling uniformly at random.
11. **Surface flagged or low-confidence traces for human review as a first-class workflow**, not an afterthought — see **Human-in-the-Loop AI** for where approval gates and review queues fit.
12. **Treat agent observability as complementary to, not a substitute for, classical infrastructure monitoring** — keep uptime, resource, and network metrics from the **Metrics** and **Logging** skills running alongside agent-specific tracing, not instead of it.
`,

  "anti-patterns": `
### Logging only the final output, not the reasoning path

~~~python
# WRONG: only the final answer is captured -- if it's wrong, there is
# nothing to inspect except the input and the output.
def run_agent(question: str) -> str:
    answer = agent_loop(question)
    log.info("agent answered", question=question, answer=answer)
    return answer

# RIGHT: every reasoning step and tool call is its own span, so a bad
# final answer can be traced back to the specific step that caused it.
def run_agent(question: str, tracer) -> str:
    with tracer.start_span("agent_run", input=question) as span:
        answer = agent_loop(question, tracer=tracer, parent_span=span)
        span.set_output(answer)
        return answer
~~~

### Trusting tool-call arguments without validating them

~~~python
# WRONG: the tool function executes whatever arguments the model produced,
# with no schema check -- a hallucinated argument either crashes the tool
# or, worse, silently executes with a wrong value.
def call_tool(tool_name: str, arguments: dict, tools: dict):
    return tools[tool_name](**arguments)

# RIGHT: validate against the tool's schema before executing, and mark
# the span explicitly if validation fails, rather than letting a bad
# argument reach the tool function at all.
def call_tool(tool_name: str, arguments: dict, tools: dict, schema, span):
    validated = schema.model_validate(arguments)  # raises on hallucinated fields
    span.set_attribute("tool_call.valid", True)
    return tools[tool_name](**validated.model_dump())
~~~

### An unbounded reasoning loop with only a "soft" stop condition

~~~python
# WRONG: relies entirely on the model itself deciding to stop -- if that
# signal is inconsistent, this can run (and bill) indefinitely.
while not is_final_answer(step):
    step = agent.next_step()

# RIGHT: pair the model's own stop signal with a hard step cap and an
# explicit loop-similarity check, and close with a distinct status either way.
for i in range(MAX_STEPS):
    step = agent.next_step()
    if is_final_answer(step):
        break
    if detect_loop(history):
        log.warning("loop detected", step=i)
        break
else:
    log.warning("max steps exceeded without a final answer", steps=MAX_STEPS)
~~~

### Other production-grade anti-patterns

- **Inventing a custom attribute schema instead of the OTel GenAI conventions.** Every team's bespoke gen_model / n_tokens field name means no tool built for the standard vocabulary can read your traces without a custom mapping layer.
- **Treating a trace ID as optional for internal, low-traffic agents.** The agent that "isn't important enough to instrument properly" is exactly the one that becomes undebuggable the first time it breaks in a way that matters.
- **Sending full, unredacted tool arguments and results to a third-party vendor backend** without first checking what PII or secrets might be embedded in them — instrument redaction at the source, not as an afterthought at the backend.
- **Evaluating only the final output and never the intermediate reasoning steps.** An agent that reaches a correct answer through unreliable reasoning will look identical to a robustly correct one in output-only evaluation, until it hits an input where the unreliable reasoning fails.
- **Sampling traces uniformly at random once volume grows**, discarding the specific error/loop/low-score traces that are the ones you actually need to debug, purely to save on storage cost.
`,

  performance: `
### Measure first

~~~python
import time

def timed_span(tracer, name, parent_span, fn, *args, **kwargs):
    start = time.perf_counter()
    with tracer.start_span(name, parent=parent_span) as span:
        result = fn(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        span.set_attribute("latency_ms", elapsed_ms)
        return result, elapsed_ms

# Aggregate per-span-type latency across many runs to find the actual
# bottleneck -- guessing which step is slow is almost always wrong.
~~~

Always measure per-span latency and cost before optimizing anything. In most agent runs, one specific hop (a slow external tool API, an unnecessarily large model on a trivial classification step, or a retry storm caused by a flaky tool) dominates the total, and optimizing the wrong hop wastes effort.

### The optimization hierarchy for agent observability overhead itself

1. **Batch and asynchronously flush spans** rather than making a synchronous network call to the observability backend on every span close — instrumentation overhead should never meaningfully add to the agent's own user-facing latency.
2. **Sample only once volume genuinely requires it**, and bias sampling toward keeping error, loop-detected, and low-eval-score traces rather than dropping them uniformly at random — the traces you most need are the rarest ones.
3. **Truncate or summarize very large span payloads** (a huge retrieved document, a long tool result) rather than storing the full text on every span — store a reference or a truncated preview plus a pointer to full storage if needed, since span storage cost scales with payload size just as much as with span count.
4. **Cache repeated identical tool calls within a single run** (the same lookup issued twice by an agent that forgot it already asked) — this is both a latency and a cost win, and a repeated identical tool call within one run is itself a signal worth surfacing (it can indicate a subtle loop or a missing short-term memory, see **Agent Memory**).
5. **Route the observability backend export through a local collector/buffer** rather than directly to a remote SaaS endpoint from inside the agent's request path, so a temporary backend outage degrades observability, not the agent's own availability.

### Numbers worth internalizing

Span creation and attribute-setting themselves are cheap (microseconds); the actual cost driver in a production agent observability setup is almost always network export latency and payload size, not instrumentation logic. A poorly-batched exporter making one synchronous network call per span in a 20-step agent run can add seconds of wall-clock latency that has nothing to do with the agent's own reasoning — that overhead, not the LLM calls, is often the first thing worth fixing when an "instrumented" agent feels slower than its uninstrumented counterpart.
`,

  scalability: `
Agent observability scales along two mostly-independent axes: how many concurrent agent runs the system as a whole produces traces for, and how many spans a single run itself generates (a deep multi-step reasoning chain, or a wide multi-agent fan-out).

~~~mermaid
flowchart LR
    Agents["Agent runtime replicas"] --> Exporter["Batched span exporter\n(async, non-blocking)"]
    Exporter --> Collector["OTel collector\n(buffering, sampling policy)"]
    Collector --> Store["Trace storage\n(vendor SaaS or self-hosted Postgres/ClickHouse)"]
    Store --> Query["Query/dashboard layer"]
~~~

### Scaling concurrent runs

- **Horizontal**: agent runtime replicas are stateless with respect to tracing (each just emits spans with a self-contained trace ID), so they scale like any stateless service.
- **The real bottleneck is almost always the storage/ingestion backend**, not the agents themselves — a fleet of agents each emitting 10-30 spans per run can produce trace volume that dwarfs classical APM volume for the same request count, since a single agent request is many spans, not one.
- **A self-hosted backend needs its own scaling story** (a time-series-friendly store like ClickHouse for span data, as both LangSmith's and Langfuse's architectures reflect) — treating trace storage as an ordinary relational table without a store designed for high-cardinality, high-volume append-heavy writes will not scale past moderate traffic.

### Scaling span volume within a single run

- **Cap reasoning-loop depth and multi-agent fan-out width explicitly** (see **Multi-Agent Systems**) — an unbounded agent can, in principle, generate an unbounded number of spans per run, and that must be capped for the observability pipeline's sake as much as for cost and correctness reasons.
- **Truncate large payloads at the source**, not at the storage layer, so oversized spans don't become a network or ingestion bottleneck before they're ever written.

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| Trace storage volume dwarfs classical APM volume | Use a store built for high-volume, high-cardinality writes (ClickHouse-style); sample with a strong bias toward keeping error/loop/low-score traces |
| Synchronous span export adds latency to the agent's own request path | Batch and flush asynchronously; route through a local buffer/collector |
| A single agent run generates unbounded spans (runaway loop or fan-out) | Hard step/agent-count caps, enforced at the runtime level, not only observed after the fact |
| Oversized span payloads (large documents, long tool results) | Truncate/summarize at the instrumentation source; store a reference to full data separately |
| Query/dashboard latency degrades as trace volume grows | Pre-aggregate common queries (cost per day, error rate per model) rather than scanning raw spans on every dashboard load |
`,

  security: `
### Agent-observability-specific attack surface

Instrumenting an agent's full reasoning trajectory means capturing exactly the kind of sensitive data a security review should scrutinize — see **AI Red Teaming** and **Data Privacy** for the broader practice this section specializes.

1. **PII and secrets embedded in captured payloads.** Prompts, tool arguments, and tool results routinely contain user PII (names, emails, account details) or, in the worst case, secrets a tool call inadvertently returned. Sending this unredacted to a third-party observability vendor is a real data-exposure risk, not a hypothetical one — redact or hash sensitive fields at the instrumentation layer, before export, not after ingestion.
2. **Prompt injection surfacing through logged tool results.** Content a tool retrieves (search results, documents, another agent's output) that carries injected instructions is captured verbatim in your trace by design — treat trace data itself as potentially containing adversarial content, not only the live agent's in-flight processing of it, when building any tooling that re-displays or re-processes captured traces.
3. **Trace data as a reconnaissance target.** A trace reveals your system prompts, your tool schemas, your model choices, and your reasoning strategies in detail — access to your observability backend is effectively access to your agent's design, and should be protected with the same access controls as source code, not treated as "just logs."
4. **Over-broad access to a shared observability backend.** A team-wide dashboard with no row-level or project-level access control means anyone with a login can read every user's prompts and tool results across every agent in the organization — scope access per project/team the same way you would scope database access.
5. **Denial-of-wallet via unbounded trace volume.** A public-facing agent endpoint under load can generate trace ingestion costs proportional to request volume in addition to LLM costs — rate-limit and size your observability backend's capacity to the same threat model you already apply to the agent's own request path.

### Concrete defenses

- Redact or hash PII and known-sensitive tool arguments/results inside the instrumentation SDK itself, before any span leaves your process boundary.
- Apply project- or team-scoped access control to the observability backend, mirroring the access model you already use for source code and production databases.
- Treat captured trace content (especially retrieved tool results) as untrusted input in any downstream tooling that reprocesses or summarizes traces, the same way you'd treat any other externally-sourced content — see **Prompt Injection Defense**.
- Rate-limit and monitor trace-ingestion volume as its own cost/abuse surface, not only the agent's own LLM call volume.
- Restrict who can export raw trace data out of the observability backend, since a full trace export is effectively a full export of your prompts, tool schemas, and reasoning strategies.

See the dedicated **Data Privacy**, **Prompt Injection Defense**, and **AI Red Teaming** skills for depth beyond what's specific to agent-trace capture here.
`,

  testing: `
Testing an agent's observability layer means testing that spans are created with the right shape and attributes, that validation and loop-detection logic actually fires when it should, and that trace context propagates correctly across multi-agent boundaries — three genuinely different test surfaces from testing the agent's own correctness.

~~~python
# tests/test_observability.py
import pytest
from myagent.observability.tracer import InMemoryTracer
from myagent.observability.loop_guard import detect_loop
from myagent.core.tools import validate_tool_call, WeatherArgs

def test_llm_call_span_has_required_attributes():
    tracer = InMemoryTracer()
    with tracer.start_span("llm_call") as span:
        span.set_attribute("gen_ai.request.model", "some-model")
        span.set_attribute("gen_ai.usage.input_tokens", 120)
        span.set_attribute("gen_ai.usage.output_tokens", 45)
    recorded = tracer.spans[0]
    assert "gen_ai.request.model" in recorded.attributes
    assert "gen_ai.usage.input_tokens" in recorded.attributes

def test_hallucinated_tool_call_is_flagged_not_silently_dropped():
    tracer = InMemoryTracer()
    with tracer.start_span("tool_call") as span:
        result = validate_tool_call("get_weather", {"city": "Paris", "bogus_field": 1}, WeatherArgs, span)
    assert result is None
    assert tracer.spans[0].attributes["tool_call.valid"] is False

def test_loop_detector_fires_on_identical_repeated_steps():
    history = [
        {"tool_name": "search", "arguments": {"q": "x"}},
        {"tool_name": "search", "arguments": {"q": "x"}},
        {"tool_name": "search", "arguments": {"q": "x"}},
    ]
    assert detect_loop(history, window=3) is True

def test_loop_detector_does_not_false_positive_on_genuine_progress():
    history = [
        {"tool_name": "search", "arguments": {"q": "x"}},
        {"tool_name": "search", "arguments": {"q": "y"}},
        {"tool_name": "search", "arguments": {"q": "z"}},
    ]
    assert detect_loop(history, window=3) is False

def test_trace_context_propagates_across_agent_handoff(sub_agent_stub):
    tracer = InMemoryTracer()
    with tracer.start_span("agent_run") as root:
        sub_agent_stub(tracer=tracer, parent_span=root)
    # The sub-agent's span must be a child of root, not a disconnected new trace.
    assert tracer.spans[1].parent_id == root.span_id
~~~

### The senior testing doctrine for agent observability

- **Test that required span attributes are actually populated**, not just that a span exists — a span with a name but no gen_ai.* attributes is nearly useless for debugging, and this regresses silently if a refactor accidentally drops an attribute.
- **Explicitly test hallucinated-tool-call detection with a deliberately malformed tool call**, and assert the span is marked invalid rather than crashing or silently succeeding.
- **Explicitly test loop detection with both a genuine loop fixture and a genuine-progress fixture**, since a loop guard that also false-positives on legitimate iterative work is as harmful as one that never fires.
- **Test trace-context propagation across every multi-agent or sub-agent boundary** in the codebase — a broken parent/child link is a silent failure that only becomes visible when someone tries to debug a real cross-agent incident and finds two disconnected traces instead of one.
- **Never assert on exact span-count or exact latency values in CI** — assert on structural properties (required attributes present, correct parent/child relationships, correct status codes) since exact counts and timings are inherently variable.
- **Regression-test the redaction layer** with a fixture payload containing known PII patterns, confirming it is actually stripped or hashed before a span would be exported, not only that the redaction function exists.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the trace tree top to bottom, span by span.** Before reaching for any tool, open the specific trace for the failing run and read each span's input, output, and attributes in execution order — the majority of "why did the agent do that" questions are answered directly by this, without needing any deeper tool.
2. **Filter by status, not just by trace ID.** Query the observability backend for every trace in a time window with a non-ok status (error, hallucinated_tool_call, loop_detected, max_steps_exceeded) to find the pattern across many runs, rather than debugging one trace in isolation when the real issue is systemic.
3. **Compare a failing trace against a known-good trace for a similar input.** Side-by-side comparison of spans (same step index, different content) often isolates exactly where the two runs diverge, especially useful after a prompt or model change.
4. **Check span attributes for the specific hop under suspicion.** If cost or latency spiked, sort spans by cost_usd or latency_ms descending within the trace to find the actual dominant hop, rather than guessing which step is expensive.
5. **Re-run the specific failing input against a fixed model/prompt version in isolation.** Once a trace has isolated the likely step, reproduce it standalone (outside the full agent loop) to confirm the root cause before changing anything in production.
6. **Escalate to raw provider-side logs only as a last resort.** If the trace itself doesn't explain a model's behavior (e.g. you suspect a provider-side issue rather than your own prompt/tool logic), the model provider's own request logs are the final layer, used rarely and only once your own trace has narrowed the search.

### Common debugging commands and patterns

~~~text
# Pseudocode for typical observability-backend queries, illustrating the
# kind of filter a debugging session actually needs (exact syntax varies
# by vendor/backend):

traces WHERE status != "ok" AND time > now() - 1h
traces WHERE cost_usd > 0.50 ORDER BY cost_usd DESC
spans WHERE tool_call.valid = false GROUP BY tool.name
traces WHERE trace_id = "<specific-id-from-a-user-report>"
~~~

The senior debugging instinct for agents specifically: resist the urge to re-run the whole agent repeatedly hoping to reproduce a bad output — because agent behavior is non-deterministic, that wastes both time and money. Instead, use the captured trace from the actual failing run as your primary evidence, and only re-run in isolation once you have a specific, narrowed hypothesis about which step and which input caused the failure.
`,

  monitoring: `
### What to measure

- **Per-hop and per-run cost and latency** (see Performance) — track both aggregate totals and per-span-type breakdowns, since a regression in one specific step type (one tool, one model) is invisible in an aggregate-only dashboard.
- **Hallucinated-tool-call rate**, broken down by tool and by model, tracked over time — a spike after a prompt or model change is a leading indicator of a regression before it shows up in user-facing quality complaints.
- **Loop-detected and max-steps-exceeded rate** — both indicate the agent is failing to converge, and a rising trend is worth investigating even before it causes a visible incident.
- **Attached evaluation scores over time** (see **AI Evals**) — quality is not something classical monitoring can measure directly, so an automated evaluator's score, attached to each trace and aggregated over time, is the closest thing to a "quality SLO" an agent system can have.
- **Trace volume and ingestion health for the observability pipeline itself** — a silently failing exporter (dropped spans, backend outage) means you lose visibility exactly when you might need it most, so monitor the monitoring pipeline too.

### Instrumentation code

~~~python
from dataclasses import dataclass

@dataclass
class RunSummary:
    trace_id: str
    total_cost_usd: float
    total_latency_ms: float
    status: str
    hallucinated_tool_calls: int
    steps_taken: int

def emit_run_metrics(summary: RunSummary, metrics_client):
    # Emit as time-series metrics, not only as a queryable trace --
    # dashboards and alerts typically read metrics, not raw trace scans.
    metrics_client.gauge("agent.run.cost_usd", summary.total_cost_usd, tags={"status": summary.status})
    metrics_client.gauge("agent.run.latency_ms", summary.total_latency_ms)
    metrics_client.increment("agent.run.hallucinated_tool_calls", summary.hallucinated_tool_calls)
    metrics_client.increment(f"agent.run.status.{summary.status}")
~~~

### Alerting thresholds worth setting

- Page on a sustained spike in error or loop_detected status rate over a short rolling window (a sudden systemic issue, e.g. a bad deploy or a provider outage).
- Alert (not page) on a slow upward drift in hallucinated-tool-call rate or a slow downward drift in attached evaluation scores over days — these are quality-regression signals that rarely need immediate paging but do need timely human attention before they compound.
- Alert on an unexplained cost-per-run increase, since it commonly indicates either a routing misconfiguration (see **Model Routing**) or a prompt change that increased token usage unexpectedly.
`,

  deployment: `
A production-grade deployment for agent observability instrumentation, exported to an OpenTelemetry collector that fans out to a chosen backend:

~~~dockerfile
# Dockerfile for the agent service itself -- the tracing SDK ships as a
# regular dependency, not a separate deployable component.
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first so this layer is cached across builds that
# only change application code, not dependencies.
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

COPY src/ ./src/

# The OTel exporter endpoint is injected via environment variable, never
# hardcoded, so the same image works against a local collector in dev
# and a production collector without a rebuild.
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
ENV OTEL_SERVICE_NAME=myagent

# Non-root user -- standard hardening, unrelated to tracing specifically
# but required for any production container.
RUN useradd --create-home appuser
USER appuser

CMD ["uv", "run", "python", "-m", "myagent.main"]
~~~

~~~yaml
# otel-collector-config.yaml -- a minimal collector fanning spans out to
# a chosen backend; keeping this config outside application code means
# switching backends never requires touching or redeploying the agent.
receivers:
  otlp:
    protocols:
      http:
      grpc:

processors:
  batch:            # batches spans before export -- reduces network overhead
  attributes/redact:
    actions:
      - key: tool.arguments.ssn
        action: delete   # example: strip a known-sensitive field before export

exporters:
  otlphttp/vendor:
    endpoint: https://your-observability-vendor.example/otlp
  logging:            # useful during initial rollout to confirm spans arrive

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [attributes/redact, batch]
      exporters: [otlphttp/vendor, logging]
~~~

Per-line justification: the OTel exporter endpoint is environment-injected so the same built image is promotable across dev/staging/prod without a rebuild; the collector's redact processor is the enforcement point for stripping known-sensitive fields before data leaves your infrastructure, rather than relying on every instrumentation call site to remember to redact; batching in both the SDK and the collector keeps network overhead from adding to the agent's own request latency; and running the collector as a separate hop (rather than exporting straight from the agent process to a vendor endpoint) means a backend migration or outage never requires a change to, or an outage of, the agent service itself.
`,

  "production-checklist": `
- [ ] Every LLM call is wrapped in its own span with gen_ai.request.model, input/output token counts, and cost recorded.
- [ ] Every tool call is wrapped in its own span with tool name, arguments, and result recorded, and arguments validated against a schema before execution.
- [ ] Hallucinated or schema-invalid tool calls are explicitly flagged on the span (a distinct status), not silently dropped or allowed to crash the tool function.
- [ ] Every reasoning/cyclic loop has both a hard step cap and a loop-similarity detection heuristic, each independently tested.
- [ ] The agent's stated reasoning/rationale is captured per step, not only its resulting action.
- [ ] Trace context (trace ID, parent span ID) propagates correctly across every multi-agent or sub-agent handoff.
- [ ] PII and known-sensitive tool arguments/results are redacted or hashed at the instrumentation layer, before export to any third-party backend.
- [ ] Span export is batched and asynchronous, verified not to add meaningful latency to the agent's own request path.
- [ ] The observability backend (vendor or self-hosted) has project/team-scoped access control, not open access to every trace.
- [ ] Sampling policy (if any) is biased toward always keeping error, loop-detected, and low-eval-score traces, never uniform random.
- [ ] Attached evaluation scores are wired onto the relevant trace/span, queryable alongside execution data, not stored in a disconnected system.
- [ ] Dashboards exist for per-hop cost and latency breakdowns, hallucinated-tool-call rate, and loop/max-steps-exceeded rate, not only aggregate totals.
- [ ] Alerting thresholds are set for both sudden spikes (error rate, loop rate) and slow drifts (rising hallucination rate, falling eval scores).
- [ ] The tracing/observability pipeline's own health (exporter failures, ingestion lag) is itself monitored.
- [ ] A documented, tested procedure exists for pulling up the exact trace behind a specific user-reported bad response.
- [ ] Human review/escalation queues are wired to receive flagged (low-confidence, error, or loop-detected) traces automatically — see **Human-in-the-Loop AI**.
`,

  "common-mistakes": `
1. **Instrumenting only the top-level request, not each reasoning step.** This gives you total latency and cost but nothing to debug with when a specific step misbehaves — the whole value of agent observability lives in the per-step granularity.
2. **Inventing a custom attribute schema instead of adopting the OTel GenAI conventions.** This seems faster short-term but locks your traces into a bespoke format no external tool can read without a custom mapping layer, and makes onboarding new engineers slower since they must learn your one-off vocabulary.
3. **Trusting tool-call arguments without schema validation.** Teams that skip this discover hallucinated tool calls only when a tool crashes or, worse, silently executes with a wrong value — validation at the point of the span, not after, is what makes the failure visible and safe.
4. **Relying only on the model's own stop signal for a reasoning loop.** Because that signal is itself produced by the model, it can fail exactly when you need it most; a hard step cap and loop-similarity check are not optional backstops, they're required.
5. **Capturing full, unredacted payloads and sending them straight to a third-party vendor.** This is a real data-exposure risk discovered too late, usually during a compliance review, not something to defer "until it matters."
6. **Evaluating only final output quality, never intermediate reasoning.** An agent that reaches correct answers via unreliable reasoning looks fine until it hits an input where the unreliable process fails, and by then the failure is in production.
7. **Treating agent observability as separate from and disconnected from evaluation.** Teams that keep trace data and eval scores in two unconnected systems lose the ability to correlate a specific bad trace with the score that flagged it, doubling the manual work needed to investigate any regression.
8. **Not propagating trace context across multi-agent handoffs.** A cross-agent failure then looks like two disconnected traces instead of one coherent story, and reconstructing what actually happened requires manually correlating timestamps instead of following one trace ID.
9. **Sampling traces uniformly at random once volume grows**, discarding exactly the rare error/loop/low-score traces that are the ones worth keeping, purely to save on storage cost.
10. **Adding observability as an afterthought after the agent is already complex.** Retrofitting span structure onto a tangled, already-shipped reasoning loop is dramatically more expensive than building it in from the first prototype.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Trace shows a tool_call span with no result and no error | Tool function raised an exception that wasn't caught inside the span's context manager | Wrap the tool call in a try/except inside the span so failures are recorded, not swallowed |
| Sub-agent's spans appear as a completely separate trace | Trace context (trace ID / parent span ID) was not propagated across the delegation boundary | Explicitly extract and pass the parent context into the sub-agent's tracer at the handoff point |
| gen_ai.usage.input_tokens / output_tokens missing on some spans | Provider response object doesn't expose usage in the shape the instrumentation code expects (varies by provider/SDK version) | Normalize usage extraction per provider in one shared adapter, not inline at every call site |
| Loop guard never fires despite an obviously repeating agent | Similarity check compares full argument dicts including a non-deterministic field (e.g. a timestamp) that differs every "identical" step | Normalize or exclude volatile fields before comparing step signatures |
| Observability backend ingestion silently drops spans under load | Exporter is unbuffered/synchronous and times out under high concurrency, or the collector's queue overflows without a fallback | Batch and buffer exports; monitor exporter/collector health as its own metric, add a local fallback log |
| Hallucinated-tool-call rate spikes right after a model upgrade | A model update changed how it formats tool-call arguments in a way the schema wasn't written to tolerate | Compare model versions on a held-out set before rolling forward; loosen or version the schema deliberately, not accidentally |
| Redacted field still visible in exported trace | Redaction logic runs after the span is already serialized/exported, or misses a nested field | Redact at construction time inside the SDK, and test the redaction path against a fixture payload with known-sensitive nested fields |
| Cost per trace doesn't match provider billing | Cost estimation uses stale per-token pricing constants, or misses a provider/model whose pricing differs from the default assumed rate | Keep a per-model pricing table updated from the provider's current pricing page, and log the model actually used per hop |
`,

  faqs: `
**Is agent observability just LangSmith or Langfuse?**
No — LangSmith and Langfuse are two vendor products that implement the discipline described on this page. The underlying concepts (traces, spans, agent-specific attributes, catching hallucinated tool calls and loops) apply whether you use one of those, a raw OpenTelemetry setup, or an in-house pipeline.

**Do I need OpenTelemetry specifically, or can I use my own logging format?**
You can use your own format, but you'll pay for it in interoperability: a custom schema means no external tool can read your traces without a custom mapping layer, and every new engineer has to learn your one-off vocabulary instead of a shared industry standard. Adopting the OTel GenAI semantic conventions is not mandatory, but it is the higher-leverage default.

**How is this different from classical APM (Datadog, New Relic)?**
Classical APM answers "was the request fast, did it error." Agent observability additionally answers "was the reasoning correct, did the agent hallucinate a tool call, did it loop unproductively" — questions that are semantic, not infrastructural, and that no HTTP-status-code-based monitoring can see. The two are complementary, not competing.

**Does agent observability replace AI Evals?**
No. Observability surfaces what happened during a run; evaluation judges whether what happened was good. They're most powerful combined — attaching an evaluator's score back onto the trace it judges — but they are genuinely different disciplines, and neither substitutes for the other. See **AI Evals**.

**How do I catch a hallucinated tool call before it causes damage?**
Validate proposed tool-call arguments against the tool's schema at the same point you create the tool-call span, before the tool function actually executes, and mark the span explicitly if validation fails. This turns a potential silent failure into a visible, queryable event and, ideally, a chance for the agent to retry with corrected arguments.

**What's the single most important attribute to add if I can only add a few?**
Per-hop model, tokens, cost, and tool name/arguments. These four alone let you answer the two most common production questions — "why is this expensive/slow" and "which specific tool call went wrong" — that a plain latency/status trace cannot answer.

**How does this change for multi-agent systems?**
Trace context (trace ID, parent span ID) must be explicitly propagated across every agent handoff, or a cross-agent failure looks like two disconnected traces instead of one coherent story. See **Multi-Agent Systems** for the topology-level detail this page assumes.

**Should every trace go to a human for review?**
No — that doesn't scale. Surface a filtered subset (errors, loop-detected, low-confidence or low-eval-score traces) to a human review queue, rather than routing every trace for manual inspection. See **Human-in-the-Loop AI** for how to design that filter and the review workflow around it.
`,

  "interview-questions": `
1. **(Junior)** What is the difference between a trace and a span?
   Model answer: A trace is the full record of one complete run (e.g. one agent request from start to finish); a span is one timed step within that trace (one LLM call, one tool call). Spans nest to form a tree, and the trace is the whole tree together, identified by a single shared trace ID.

2. **(Junior)** Why isn't a classical APM dashboard (latency, error rate, uptime) enough to debug an agent?
   Model answer: Classical APM can tell you a request was fast and returned 200 OK, but an agent can produce a confidently wrong answer while still being fast and error-free at the HTTP level — the failure is in the reasoning, not the infrastructure, and infrastructure-only metrics are blind to that.

3. **(Junior)** Name three span attributes that matter specifically for an LLM call, beyond latency and status.
   Model answer: The model used (gen_ai.request.model), prompt and completion token counts, and estimated cost for that specific call — none of which a classical HTTP span would ever need to record.

4. **(Junior)** What is a hallucinated tool call, and how would you detect one?
   Model answer: A tool invocation the model proposed that doesn't correspond to a real, registered tool, or whose arguments don't match the tool's expected schema. Detect it by validating proposed arguments against the tool's schema before executing the tool function, and mark the span explicitly if validation fails.

5. **(Junior)** Why do you need both a hard step cap and a loop-detection heuristic for a reasoning loop, rather than just one?
   Model answer: A hard step cap alone lets a stuck agent burn its full budget before stopping; a similarity-based loop detector alone can miss a "slow loop" that varies slightly each iteration without making genuine progress. Together they cover both failure shapes.

6. **(Senior)** How would you design span propagation across a multi-agent handoff where the receiving agent is owned by a different team?
   Model answer: Propagate the trace ID and parent span ID explicitly across the delegation boundary (e.g. via an A2A Protocol request's metadata) so the receiving agent's spans nest correctly under the delegating span. If the remote agent is a genuine black box with no shared tracing backend, log your own span capturing "the delegation happened, here's the input and the output," treating the remote system as opaque rather than assuming you'll ever see its internal trace.

7. **(Senior)** How do you decide what to sample once trace volume becomes too expensive to capture in full?
   Model answer: Never sample uniformly at random — bias sampling to always keep traces with an error status, a loop-detected status, or a low attached evaluation score, since those are the rare, high-value traces you actually need for debugging; uniform sampling discards exactly the traces most worth keeping.

8. **(Senior)** How does agent observability's role differ from AI Evals, and how do the two connect in practice?
   Model answer: Observability captures and structures what happened during a run; evaluation judges whether what happened was good. In practice, the highest-leverage integration is attaching an evaluator's score back onto the trace/span it judges, so a regression in eval scores can be correlated directly with the specific traces that caused it, rather than living in two disconnected systems.

9. **(Senior)** What's wrong with inventing your own span attribute schema instead of using the OpenTelemetry GenAI semantic conventions?
   Model answer: A custom schema works fine internally but breaks interoperability — no external tool built against the standard vocabulary can read your traces without a custom mapping layer, and it adds onboarding friction for new engineers who have to learn a one-off convention instead of an industry-shared one. The tradeoff is rarely worth it unless you have a very specific reason the standard doesn't fit.

10. **(Senior)** How would you detect that a routing policy (see Model Routing) is misbehaving using only agent observability data?
    Model answer: Aggregate per-hop model attribution across traces and compare the observed model-selection distribution against the intended routing policy; a routing bug typically shows up as an unexpected shift in which model handled which class of request, visible in the cost and gen_ai.request.model attributes well before it would show up as an unexplained aggregate cost increase.

11. **(Senior)** How do you keep observability instrumentation from becoming a security or privacy liability?
    Model answer: Redact or hash PII and sensitive tool arguments/results at the instrumentation layer, before data leaves your process, not at the backend after ingestion; scope access to the observability backend the same way you'd scope access to source code or production databases, since a full trace reveals system prompts, tool schemas, and reasoning strategies in detail.

12. **(Senior)** A production agent's cost suddenly doubled with no change to traffic volume. How would you use tracing to find the root cause?
    Model answer: Query traces from before and after the change for per-hop cost breakdowns; look specifically at gen_ai.request.model distribution and per-hop token counts to see whether a specific step started using a more expensive model, generating longer completions, or retrying more often — the per-hop attribution is exactly what turns "cost doubled" into a specific, fixable step, rather than requiring a guess.
`,

  "coding-questions": `
### Problem 1: Implement a span-based tracer with parent/child nesting

Implement a minimal in-memory tracer supporting nested spans, so that closing a child span before its parent correctly records the parent-child relationship.

~~~python
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field

@dataclass
class Span:
    span_id: str
    name: str
    parent_id: str | None
    start_time: float
    end_time: float | None = None
    attributes: dict = field(default_factory=dict)
    status: str = "ok"

    def set_attribute(self, key, value):
        self.attributes[key] = value

    def set_status(self, status: str):
        self.status = status

class InMemoryTracer:
    def __init__(self):
        self.spans: list[Span] = []
        self._stack: list[str] = []   # stack of currently-open span ids

    @contextmanager
    def start_span(self, name: str, parent=None):
        parent_id = parent.span_id if parent else (self._stack[-1] if self._stack else None)
        span = Span(span_id=str(uuid.uuid4()), name=name, parent_id=parent_id, start_time=time.perf_counter())
        self._stack.append(span.span_id)
        try:
            yield span
        except Exception:
            span.set_status("error")
            raise
        finally:
            span.end_time = time.perf_counter()
            self.spans.append(span)
            self._stack.pop()

    def tree(self) -> dict:
        """Reconstruct the nested tree from the flat span list -- useful
        for rendering or for tests that assert on structure, not just counts."""
        by_id = {s.span_id: {"span": s, "children": []} for s in self.spans}
        roots = []
        for s in self.spans:
            if s.parent_id and s.parent_id in by_id:
                by_id[s.parent_id]["children"].append(by_id[s.span_id])
            else:
                roots.append(by_id[s.span_id])
        return {"roots": roots}
~~~

Complexity: O(n) to build the tree from n spans, since each span is placed exactly once. Follow-ups: how would you support async/concurrent spans (multiple sibling spans open at once, not a single stack)? How would you export this to an OTel-compatible wire format?

### Problem 2: Loop and hallucination detection in one pass

Given a list of proposed agent steps (each with a tool name and arguments), write a function that returns, for each step, whether it is a hallucinated call (arguments don't match a provided schema) or part of a detected loop (identical to recent steps), without re-scanning the full history for every step.

~~~python
from pydantic import BaseModel, ValidationError
from collections import deque

def annotate_steps(steps: list[dict], schemas: dict[str, type[BaseModel]], window: int = 3) -> list[dict]:
    recent: deque = deque(maxlen=window)
    annotated = []
    for step in steps:
        result = {**step, "hallucinated": False, "loop_detected": False}
        schema = schemas.get(step["tool_name"])
        if schema is None:
            result["hallucinated"] = True   # tool doesn't exist at all
        else:
            try:
                schema.model_validate(step["arguments"])
            except ValidationError:
                result["hallucinated"] = True

        signature = (step["tool_name"], frozenset(step["arguments"].items()))
        if len(recent) == window and len(set(recent) | {signature}) == 1:
            result["loop_detected"] = True
        recent.append(signature)
        annotated.append(result)
    return annotated
~~~

Complexity: O(n * w) where n is the number of steps and w is the window size (small, constant in practice), so effectively O(n). Follow-ups: how would you handle "slow loops" that vary slightly each iteration rather than repeating exactly? How would you weight recency so an old repeated step doesn't count against a currently-progressing run?

### Problem 3: Attribute a cost regression to the responsible span type

Given a list of trace summaries (each a list of spans with type, model, and cost) from before and after a deploy, write a function identifying which span type/model combination is most responsible for an aggregate cost increase.

~~~python
from collections import defaultdict

def diff_cost_by_span_type(before_traces: list[list[dict]], after_traces: list[list[dict]]) -> list[tuple]:
    def aggregate(traces):
        totals = defaultdict(float)
        for trace in traces:
            for span in trace:
                key = (span["span_type"], span.get("model"))
                totals[key] += span["cost_usd"]
        return totals

    before_totals = aggregate(before_traces)
    after_totals = aggregate(after_traces)
    all_keys = set(before_totals) | set(after_totals)
    diffs = [
        (key, after_totals.get(key, 0.0) - before_totals.get(key, 0.0))
        for key in all_keys
    ]
    # Largest positive cost increase first -- that's the regression's likely source.
    return sorted(diffs, key=lambda kv: kv[1], reverse=True)
~~~

Complexity: O(n) in total span count across both sets of traces. Follow-ups: how would you normalize for a change in traffic volume between the before and after windows, rather than assuming request counts stayed constant? How would you extend this to detect a shift in which model handled a given span type, not just a raw cost delta?
`,

  "hands-on-labs": `
1. **(Beginner) Instrument a single-tool agent with spans.** Take a simple agent that calls one tool and produces a final answer; add a tracer with a root span, a reasoning span, and a tool-call span, each populated with the attributes covered in Beginner/Intermediate Concepts. Deliverable: a script that prints a readable tree of the captured spans for one run. Skills exercised: span creation, parent/child nesting, agent-specific attributes.

2. **(Intermediate) Add tool-call schema validation and hallucination flagging.** Extend the lab-1 agent so every tool call's arguments are validated against a Pydantic schema before execution, with the span explicitly marked hallucinated_tool_call on failure. Deliberately feed the agent a prompt likely to produce a malformed tool call and confirm it's caught and logged, not silently executed or crashed. Deliverable: a test suite proving both the valid and invalid paths are covered. Skills exercised: schema validation, span status marking, defensive tool-call handling.

3. **(Intermediate) Build a loop guard for a multi-step reasoning agent.** Implement a ReAct-style loop with both a hard step cap and a similarity-based loop detector; construct a deliberately looping test agent (e.g. one that always re-issues the same tool call) and confirm the guard fires with a distinct, loggable status. Deliverable: a report comparing behavior with and without the guard, including wall-clock and cost savings from the guard firing early. Skills exercised: loop detection, cost/latency accounting, defensive agent design.

4. **(Production) Export OTel-compatible spans through a collector to two backends simultaneously.** Configure an OpenTelemetry collector to receive spans from your instrumented agent and fan them out to two destinations (e.g. a local logging exporter and a self-hosted or vendor backend), including a redaction processor stripping a sample sensitive field before export. Deliverable: a working collector config plus a short writeup of what you'd change to add sampling once volume grows. Skills exercised: OTel semantic conventions, collector configuration, redaction, deployment-grade observability architecture.
`,

  "real-projects": `
1. **Agent trace explorer.** Build a small web UI that ingests a stored set of agent traces (your own instrumentation output or a sample export) and renders them as an explorable tree, with per-span attributes visible on click, filterable by status (error, hallucinated_tool_call, loop_detected), and sortable by cost or latency. Engineering requirements: a trace/span data model matching the OTel GenAI conventions, a query layer supporting the filters above, and a UI that can render a deeply nested tree without becoming unreadable at 20+ spans.

2. **Hallucinated-tool-call and loop-rate dashboard.** Instrument a small multi-tool agent, run it against a batch of varied test inputs, and build a dashboard tracking hallucinated-tool-call rate and loop-detected rate over time and by input category. Engineering requirements: a batch harness that runs many inputs and captures full traces, an aggregation layer computing the two rates from raw span data, and a simple time-series chart showing how the rates change as you deliberately vary the agent's prompt or tool schema strictness.

3. **Cross-agent trace propagation for a two-agent pipeline.** Build a small orchestrator-worker pipeline (see **Multi-Agent Systems**) where trace context is explicitly propagated from the orchestrator to each worker, and produce a single unified trace covering both agents' spans. Engineering requirements: an explicit trace-context-passing mechanism across the agent boundary, correct parent/child span relationships spanning both agents, and a demonstration that a worker's failure (a timeout or a hallucinated tool call) is attributable to the specific worker and hop from the orchestrator's own trace view.
`,

  "case-studies": `
1. **A support agent's quiet quality regression caught only by intermediate-step logging.** A team running a customer-support agent noticed no change in final-output error rate after a prompt update, but a drop in an LLM-as-judge score attached to intermediate reasoning steps revealed the agent had started reasoning less carefully even though it usually still landed on an acceptable final answer. Lesson: output-only evaluation can hide a reliability regression that only becomes visible when you score the reasoning path itself, not just the destination.

2. **A hallucinated tool call that would have gone unnoticed without schema validation at the span level.** An agent occasionally invoked a real tool with a plausible but nonexistent argument name; because the tool function used permissive keyword handling, it silently ignored the bad argument and returned a default result rather than erroring. Only after adding schema validation at the tool-call span did the team discover how often this was happening — the tool had been "succeeding" while quietly not doing what the agent intended. Lesson: a tool call that doesn't crash is not the same as a tool call that succeeded correctly; validate against the schema, don't just check for an exception.

3. **A cost spike traced to per-hop model misattribution after a routing rollout.** After rolling out a cost-saving routing policy (see **Model Routing**), a team's aggregate cost dashboard looked fine for a week, then spiked. Per-hop trace attribution showed the routing policy was correctly sending simple requests to a cheap model, but a specific downstream synthesis step had been left on the expensive default model the whole time — invisible in an aggregate view, obvious once cost was attributed per span. Lesson: aggregate cost metrics can mask a partially-working optimization; per-hop attribution is what actually confirms a routing or cost change worked as intended.

4. **A cross-agent handoff failure that looked like two unrelated bugs until trace propagation was fixed.** A multi-agent pipeline's orchestrator and worker agents each had their own independent tracing, with no shared trace ID propagated across the handoff. When a worker silently timed out, the orchestrator's trace showed a generic failure with no detail, and the worker's own trace (in a separate system) showed a clean timeout with no context about which request triggered it — two disconnected, individually-confusing signals. Once trace context was explicitly propagated across the handoff, the same failure became a single, immediately legible trace. Lesson: propagating trace context across every agent boundary is not an optional nicety — without it, a single logical failure fragments into multiple, harder-to-correlate signals.
`,

  comparisons: `
| Approach | What it is | Strengths | Weaknesses | When a senior engineer picks it |
|---|---|---|---|---|
| **Agent observability (the discipline, this page)** | Trace/span concepts and agent-specific attributes, implementable on any backend | Vendor-neutral, portable knowledge, works with any tool | Not a product — requires choosing or building an actual implementation | Always — this is the mental model underlying every choice below |
| **LangSmith** | Hosted (with self-hosted option) platform, tightest integration with LangChain/LangGraph | Deep framework integration, mature eval and prompt-hub features, quick to adopt if already on LangChain | Closed-source; strongest value is coupled to the LangChain ecosystem; less natural for framework-free agents | Already building on LangChain/LangGraph and want tracing, eval, and prompt management with minimal setup |
| **Langfuse** | Open-source (MIT), self-hostable platform, framework-agnostic | Self-hostable for data-residency/compliance needs, works identically with or without any framework, OTel-compatible ingestion | Self-hosting has real operational cost (Postgres + ClickHouse + Redis); managed cloud tier still a commercial product | Compliance/data-residency requirements demand self-hosting, or the team is not committed to one orchestration framework |
| **Raw OpenTelemetry + a generic APM backend** | Vendor-neutral instrumentation using the GenAI semantic conventions, sent to any OTel-compatible backend (open-source or commercial) | Maximum portability, no lock-in to any single LLM-observability vendor, reuses infrastructure teams may already run | More manual setup for agent-specific concerns (loop detection, hallucination flagging) than a purpose-built vendor tool provides out of the box | Already running a mature OTel-based observability stack and want agent traces to live alongside existing infrastructure traces |
| **Bespoke in-house logging (flat logs, no span model)** | Ad hoc structured logging with no trace-tree data model | Fastest to start, no new dependency | Loses parent-child relationships, no standard attribute vocabulary, doesn't scale past trivial complexity | Rarely a deliberate choice for anything beyond a first prototype — should be replaced quickly once agent complexity grows |

### How seniors choose

The decision is rarely "which vendor is objectively best" — it's an honest answer to three questions: do you need self-hosting for compliance/data-residency reasons (favors Langfuse or raw OTel), are you already deeply invested in LangChain/LangGraph (favors LangSmith's tighter integration), and do you already run a mature general-purpose observability stack you'd rather extend than replace (favors raw OTel). All three options implement the same underlying discipline this page covers — the choice is about operational fit, not about which one "has observability" and which doesn't.
`,

  "related-technologies": `
- **LangSmith** — a hosted (with self-hosted option) vendor implementation of agent observability, tightly integrated with LangChain/LangGraph; see the dedicated skill for its specific data model and UI.
- **Langfuse** — an open-source, self-hostable, framework-agnostic vendor implementation of the same discipline; see the dedicated skill for its architecture and self-hosting story.
- **OpenTelemetry** — the underlying vendor-neutral tracing standard whose trace/span model and (increasingly) GenAI semantic conventions this page builds on; understanding OTel at a conceptual level makes every vendor tool's data model click faster.
- **Multi-Agent Systems** — the discipline of coordinating more than one agent; agent observability's cross-agent tracing (propagating trace context across a handoff) is the instrumentation layer that makes a multi-agent system's failures attributable to a specific agent and hop.
- **Human-in-the-Loop AI** — the discipline of designing approval gates and human review into an agent pipeline; agent observability is what makes a trace reviewable and what supplies the filtered queue (errors, low-confidence runs) a human reviewer actually needs to see.
- **MCP** — the Model Context Protocol standardizes how an agent reaches its own tools; agent observability is what lets you see, after the fact, exactly which MCP tool call happened, with what arguments, and whether it was valid — the two are complementary, not overlapping.
- **AI Evals** — the discipline of judging whether an agent's output (and, done well, its intermediate reasoning) is actually good; observability supplies the data (traces) that an evaluation pipeline scores, and the highest-leverage integration is attaching eval scores back onto the trace they judge.
- **Prompt Versioning** — treating prompts as versioned, deployable artifacts; agent observability is what tells you, after a prompt version change, whether cost, latency, hallucination rate, or eval scores actually moved, turning a prompt change from a guess into a measured experiment.
- **Model Routing** — sending each request to the model that should handle it; per-hop model attribution in agent traces is the concrete evidence needed to verify a routing policy is actually working as intended, rather than assumed to be.
- **Logging**, **Metrics**, **Tracing** — the classical observability disciplines agent observability specializes; agent-specific span types and attributes extend, rather than replace, this foundation.
`,

  "latest-updates": `
As of my knowledge cutoff, the clearest trend in agent observability is convergence toward OpenTelemetry-native ingestion — multiple vendor platforms (including Langfuse) accept raw OTel spans directly, reducing the need for a vendor-specific SDK just to get traces into a chosen backend. The OpenTelemetry project's GenAI semantic conventions have been under active development, standardizing attribute names for LLM and agent spans, though I would verify the current stabilization status (which attributes are marked stable versus experimental) against the OpenTelemetry specification directly rather than treating any specific list as final, since this is an actively evolving area.

Growing attention has also gone to agent-specific failure detection as its own sub-discipline — tooling and practitioner guidance around catching hallucinated tool calls and unproductive reasoning loops systematically, rather than relying on manual trace inspection after a user complaint. Multi-agent tracing (propagating trace context across agent-to-agent handoffs, including across organizational boundaries via protocols like A2A) has matured alongside the growth of multi-agent frameworks generally.

I would not treat any specific vendor feature-availability date, pricing tier, or adoption statistic in this space as settled without checking the vendor's current documentation or changelog directly — both LangSmith and Langfuse, and the OpenTelemetry GenAI conventions themselves, ship and evolve quickly enough that anything stated as current fact here risks being stale by the time you read it.
`,

  "future-roadmap": `
Where agent observability is likely heading, reasoned from the trajectory visible at my knowledge cutoff rather than any confirmed roadmap: continued convergence on the OpenTelemetry GenAI semantic conventions as the shared vocabulary, reducing the current fragmentation where every vendor's SDK uses its own attribute names; deeper native support for multi-agent and cross-organizational tracing, as protocols like A2A make agent-to-agent delegation across trust boundaries more common and the observability tooling has to follow; and growing integration between observability and evaluation, where attaching automated quality scores directly onto traces becomes the default rather than a manually-wired integration between two separate systems.

What's worth betting career time on: the underlying concepts (trace/span data models, per-hop attribution, hallucination and loop detection patterns) are durable regardless of which specific vendor tool wins market share, since they're grounded in the same distributed-tracing fundamentals that have outlasted several generations of specific APM products. Fluency with OpenTelemetry specifically is a safer long-term bet than deep specialization in any single vendor's proprietary API, precisely because the standardization trend favors portability across tools. The next platform skill worth building on this foundation is **Human-in-the-Loop AI**, since a well-instrumented agent's traces are what make human review and approval workflows actually tractable at scale.
`,

  "cheat-sheet": `
~~~text
AGENT OBSERVABILITY -- ESSENTIALS

CORE VOCABULARY
  trace  = one full agent run, one trace ID
  span   = one timed step (LLM call, tool call, retry) inside a trace
  spans nest -> a tree, not a flat log

WHAT MAKES AN AGENT SPAN DIFFERENT FROM A CLASSIC APM SPAN
  + gen_ai.request.model         (which model served this hop)
  + gen_ai.usage.input_tokens
  + gen_ai.usage.output_tokens
  + cost_usd                     (per hop, not just per run)
  + latency_ms                   (per hop, not just per run)
  + tool.name / tool.arguments / tool.result
  + retry_count / retry_of
  + status: ok | error | hallucinated_tool_call | loop_detected | max_steps_exceeded

CATCHING FAILURE MODES
  hallucinated tool call -> validate args against schema BEFORE executing
  infinite loop          -> hard step cap AND a step-similarity heuristic, always both

OPENTELEMETRY GENAI SEMANTIC CONVENTIONS
  standardized attribute names so any OTel-compatible backend
  can render LLM/agent spans consistently -- adopt these names,
  don't invent your own gen_model / n_tokens fields

MULTI-AGENT TRACING
  propagate trace_id + parent_span_id across every agent handoff
  or a cross-agent failure becomes two disconnected traces

VENDOR IMPLEMENTATIONS (not the discipline itself)
  LangSmith  -> hosted, tight LangChain/LangGraph integration
  Langfuse   -> open-source, self-hostable, framework-agnostic
  raw OTel   -> vendor-neutral, more manual agent-specific setup

WHAT OBSERVABILITY IS NOT
  not AI Evals        (evals judge quality; observability captures what happened)
  not a guardrail      (surfaces bad behavior; doesn't itself block it)
  not classical APM replacement (run both, together)

PRODUCTION DEFAULTS
  instrument from the first prototype, not after complexity arrives
  batch + async-flush span export -- never block the agent's own request path
  redact PII/secrets at the SDK layer, before export
  sample with a bias toward keeping error/loop/low-score traces, never uniform random
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What is a trace? | The full record of one complete agent run, identified by one shared trace ID. |
| What is a span? | One timed step inside a trace (an LLM call, tool call, or retry), which can nest under a parent span. |
| Name four agent-specific span attributes classical APM traces don't need. | Model used, prompt/completion tokens, cost per hop, tool name/arguments. |
| What is a hallucinated tool call? | A proposed tool invocation that doesn't correspond to a real tool, or whose arguments don't match the tool's schema. |
| How do you catch a hallucinated tool call? | Validate proposed arguments against the tool's schema at the point the span is created, before the tool function executes. |
| Why do you need both a hard step cap and a loop-similarity heuristic? | A step cap alone lets a stuck agent burn its full budget before stopping; a similarity check alone can miss a "slow loop" that varies slightly each iteration. |
| What do the OpenTelemetry GenAI semantic conventions standardize? | Attribute names (e.g. gen_ai.request.model, gen_ai.usage.input_tokens) so any OTel-compatible backend can render LLM/agent spans consistently. |
| How does an agent trace differ from a classical APM trace? | An agent trace's shape (how many steps, which tools) is only known after the run finishes, and its key failure mode (a plausible wrong answer) has no HTTP-status-code equivalent. |
| What must propagate across a multi-agent handoff for tracing to work? | The trace ID and parent span ID, so the receiving agent's spans nest under the delegating agent's span instead of starting a disconnected new trace. |
| Is LangSmith the same thing as agent observability? | No — LangSmith is one vendor's product implementing the discipline; the concepts apply regardless of which tool (or none) you use. |
| Does observability replace AI Evals? | No — observability captures what happened; evaluation judges whether it was good. They're complementary, most powerful when eval scores are attached back onto the trace they judge. |
| What should you log besides the agent's final action at each reasoning step? | The agent's stated rationale/thought, so reasoning quality can be evaluated separately from output quality. |
| What's the risk of sending full unredacted trace payloads to a vendor backend? | PII or secrets embedded in prompts/tool arguments/results can be exposed to a third party; redact at the instrumentation layer before export. |
| How should you sample traces once volume is too high to capture in full? | Bias sampling toward always keeping error, loop-detected, and low-eval-score traces — never sample uniformly at random. |
| What connects agent observability to Human-in-the-Loop AI? | Traces are what make a run reviewable, and a filtered queue of flagged (error/low-confidence) traces is what a human review workflow actually consumes. |
`,

  mcqs: `
1. What primarily distinguishes an agent trace from a classical APM trace?
   A) Agent traces use a different network protocol
   B) An agent trace's shape is only known after the run completes, and its key failure mode is semantic, not an HTTP status
   C) Agent traces never contain latency data
   D) Classical APM traces are always faster to query
   **Answer: B.** Classical APM's call graph is fixed by code; an agent's is decided at runtime by its own reasoning, and its most important failure (a plausible wrong answer) produces no error code at all.

2. What is the correct way to catch a hallucinated tool call?
   A) Wait for the tool function to throw an exception
   B) Validate the proposed arguments against the tool's schema before executing the tool function, marking the span explicitly on failure
   C) Ask the model to double-check its own tool call in a follow-up prompt
   D) Ignore it since tool calls rarely fail
   **Answer: B.** Schema validation at the point the span is created catches the hallucination before it can execute with a bad or nonexistent argument, and marking the span makes it a queryable, distinct event rather than a silent one.

3. Why should a cyclic reasoning loop have both a hard step cap and a loop-similarity heuristic?
   A) Because either one alone doubles as a caching layer
   B) A step cap alone can let a stuck agent burn its full budget before stopping; a similarity check alone can miss a "slow loop" with slight variation each iteration
   C) Regulatory requirements mandate both
   D) They are the same mechanism implemented twice for redundancy
   **Answer: B.** The two guards cover different failure shapes — one is a hard backstop on total iterations, the other detects unproductive repetition even when it isn't exact.

4. What do the OpenTelemetry GenAI semantic conventions provide?
   A) A new wire protocol replacing HTTP for LLM calls
   B) A standardized set of attribute names (e.g. for model, token usage) so different tools can render LLM/agent spans consistently
   C) A guaranteed reduction in LLM API cost
   D) A replacement for tool schemas
   **Answer: B.** They are a naming/vocabulary standard for span attributes, analogous to how http.status_code is standardized for web requests — not a new transport or a cost-reduction mechanism.

5. How do LangSmith and Langfuse relate to the discipline of "agent observability" described on this page?
   A) They are the discipline itself; without them, agent observability doesn't exist
   B) They are two vendor products that implement the underlying trace/span concepts and agent-specific attributes this page describes
   C) They are competing standards bodies
   D) They only work with non-agentic, single-shot LLM calls
   **Answer: B.** The discipline (traces, spans, agent-specific attributes, failure detection patterns) is tool-agnostic; LangSmith and Langfuse are two concrete, differently-positioned implementations of it.

6. What is the most reliable way to propagate observability across a multi-agent handoff?
   A) Rely on each agent's local logs and manually correlate timestamps afterward
   B) Explicitly pass the trace ID and parent span ID across the delegation boundary so the receiving agent's spans nest under the delegating span
   C) Assume the receiving agent will automatically detect the calling agent's trace
   D) Skip tracing for internal agent-to-agent calls since only the outermost request matters
   **Answer: B.** Explicit context propagation is required; without it, a single logical failure fragments into disconnected, harder-to-correlate traces across the two agents.
`,

  "revision-notes": `
Agent observability is the discipline of making an agent's reasoning trajectory — not just its final output or its infrastructure health — visible and queryable. It extends the classical trace/span data model (one trace per run, nested timed spans within it) with agent-specific attributes that classical APM never needed: which model handled a given hop, prompt/completion tokens, cost per hop, latency per hop, and full tool-call name/arguments/result. The core distinction from classical APM is that an agent's most important failure mode — a confidently wrong answer — produces no error code and no latency spike, so the observability layer must capture semantic detail (reasoning content, tool validity) that HTTP-level monitoring is structurally blind to.

Two agent-specific failure modes deserve dedicated detection logic: hallucinated tool calls (a proposed invocation that doesn't match a real tool or its schema, caught by validating arguments at the point the span is created, before execution) and unproductive reasoning loops (caught by pairing a hard step cap with a step-similarity heuristic, since either alone misses a real failure shape the other catches). Multi-agent systems add a further requirement: trace context (trace ID, parent span ID) must be explicitly propagated across every agent-to-agent handoff, or a single logical failure fragments into disconnected, hard-to-correlate traces.

The OpenTelemetry GenAI semantic conventions matter because they standardize the attribute vocabulary (gen_ai.request.model, gen_ai.usage.input_tokens, and related names) so traces remain portable across tools rather than locked into one vendor's bespoke schema. LangSmith and Langfuse are the two best-known vendor implementations of this discipline — LangSmith hosted and tightly integrated with LangChain/LangGraph, Langfuse open-source and self-hostable and framework-agnostic — but both sit on top of the same underlying concepts this page covers, and a raw OpenTelemetry setup is a fully viable third path for teams prioritizing vendor neutrality.

Agent observability is deliberately not a replacement for AI Evals (observability captures what happened; evaluation judges whether it was good — the highest-leverage move is attaching eval scores back onto the traces they judge), not a replacement for classical infrastructure monitoring (Metrics/Logging still matter for uptime and resource health), and not itself a guardrail (it makes bad behavior visible; enforcement and human review, per Human-in-the-Loop AI, are separate concerns it feeds into). Production practice defaults to instrumenting from the first prototype (retrofitting is far more expensive), redacting PII/secrets at the SDK layer before export, and biasing any sampling policy toward keeping error, loop-detected, and low-score traces rather than sampling uniformly at random.

The connective tissue across the platform: MCP standardizes how an agent reaches its own tools (observability is what tells you, after the fact, what actually happened at that boundary); Multi-Agent Systems is where cross-agent trace propagation becomes essential rather than optional; Prompt Versioning and Model Routing are both changes whose actual effect (on cost, latency, hallucination rate, quality) can only be honestly measured through the per-hop attribution this page's instrumentation provides.
`,

  "learning-roadmap": `
**Week 1 — Foundations.** Read the **Logging**, **Metrics**, and **Tracing** skills if not already solid, then this page's Beginner and Intermediate Concepts. Build a single-agent, single-tool pipeline instrumented with a minimal in-memory tracer (root span, reasoning span, tool-call span), populating the core agent-specific attributes. Milestone: you can print a readable span tree for one run and explain what each attribute is for.

**Week 2 — Failure detection.** Work through Advanced Concepts and implement schema-based hallucination detection and a step-cap-plus-similarity loop guard on your Week 1 agent. Deliberately construct inputs that trigger each failure mode and confirm they're caught and flagged, not silently swallowed. Milestone: a test suite proving both failure-detection paths work, matching the Testing section's doctrine.

**Week 3 — Standardization and production shape.** Study the OpenTelemetry GenAI semantic conventions and re-express your Week 1-2 attributes using the standard names. Stand up a local OTel collector and export your agent's spans through it to a logging exporter, then to a second destination, following the Deployment section's config. Milestone: your instrumentation is vendor-portable, and you understand the collector's role in decoupling instrumentation from any one backend.

**Week 4 — Multi-agent and human-review integration.** Build a two-agent orchestrator-worker pipeline (see **Multi-Agent Systems**) with trace context explicitly propagated across the handoff, and wire a simple filter that surfaces error/loop-detected traces to a mock review queue (see **Human-in-the-Loop AI**). Milestone: a single unified trace spans both agents, and you can explain, end to end, how a flagged trace would reach a human reviewer in a real system.

**Next platform skill.** Once this page's concepts are solid, move to **Human-in-the-Loop AI** — a well-instrumented agent's traces are precisely what make human approval and escalation workflows tractable at scale, and that page assumes the tracing vocabulary built here.
`,

  "official-docs": `
- **OpenTelemetry documentation** (opentelemetry.io) — the canonical reference for the trace/span data model and the GenAI semantic conventions this page builds on; check the current specification directly for the latest stabilized attribute names.
- **LangSmith documentation** (docs.smith.langchain.com) — the vendor's own reference for its tracing, dataset/evaluation, and monitoring features; see the dedicated **LangSmith** skill for a full treatment.
- **Langfuse documentation** (langfuse.com/docs) — the vendor's own reference for its open-source and self-hosted tracing/evaluation/prompt-management features; see the dedicated **Langfuse** skill for a full treatment.
- **OpenTelemetry GenAI semantic conventions specification** — the specific, actively-evolving document defining standardized attribute names for LLM and agent spans; verify current maturity status (stable vs experimental) directly against this before relying on any specific attribute name in a production system.

I would treat any other vendor or framework's tracing documentation (LangGraph's own tracing hooks, CrewAI's built-in logging, provider-specific SDK observability features) as worth checking directly at the time you need it, since integration specifics change with each release.
`,

  books: `
- **"Distributed Tracing in Practice"** (Parker, Spoonhower, Mace, Sigelman) — the deepest available treatment of the trace/span model this entire discipline borrows from; read this to understand agent observability's foundations, not its LLM-specific surface.
- **"Observability Engineering"** (Majors, Fong-Jones, Miranda) — a rigorous treatment of the broader observability discipline (not agent-specific) that shapes how a senior engineer should think about what to instrument and why, directly transferable to the agent-specific attributes this page adds.
- **"Site Reliability Engineering"** (Google, various authors) — foundational for the monitoring/alerting mindset (SLOs, escalation, on-call discipline) that agent observability's monitoring section borrows and adapts.
- For LLM- and agent-specific material, I am not confident recommending a specific book title as authoritative given how recent and fast-moving this exact sub-topic is — the vendor documentation (LangSmith, Langfuse) and the OpenTelemetry GenAI conventions themselves are currently the more reliable, more current sources than any book is likely to be at this stage.
`,

  blogs: `
- **The LangSmith and Langfuse engineering blogs** — both vendors publish practitioner-facing posts on trace design, evaluation methodology, and production agent debugging that are directly applicable regardless of which tool you end up using.
- **The OpenTelemetry project blog** — tracks the evolution of the GenAI semantic conventions and general OTel ecosystem developments relevant to agent tracing.
- **Individual practitioner write-ups on debugging production LLM agents** — high-signal posts on this topic tend to appear on engineering blogs of companies actively operating agents in production; I'd treat any specific blog or author name here as something to verify current relevance for rather than list as a fixed, timeless reference, since this content ages quickly and the highest-signal sources shift as the field matures.
`,

  "research-papers": `
Agent observability specifically (as a named discipline with dedicated academic literature) is thin — most of the foundational thinking is industry practitioner work (vendor blogs, conference talks, open-source documentation) rather than peer-reviewed papers, and I would not invent paper titles to fill this gap. The closest genuinely foundational reading is the classical distributed-tracing literature this discipline builds on:

- **"Dapper, a Large-Scale Distributed Systems Tracing Infrastructure"** (Sigelman et al., Google, 2010) — the original paper establishing the trace/span data model that every later tracing system, including every agent observability tool, still uses as its structural foundation.
- For agent-specific failure modes (hallucination, planning/reasoning errors), the relevant research is more accurately filed under the **AI Evals** skill's literature (hallucination detection, LLM-as-judge methodology) than under observability specifically — observability is the instrumentation layer that surfaces the data those evaluation methods then judge.
- For multi-agent coordination failures (deadlock, livelock) that observability needs to detect, the relevant foundational literature is the classical distributed systems and distributed AI literature referenced in the **Multi-Agent Systems** skill, not agent-observability-specific papers.

If a rigorous, peer-reviewed literature specific to "agent observability" as its own subfield emerges after my knowledge cutoff, verify current papers directly rather than relying on this page.
`,

  videos: `
- **Conference talks from LangSmith and Langfuse team members** (at AI engineering conferences such as the AI Engineer Summit and similar practitioner-focused events) on production agent tracing and evaluation — these tend to be the highest-signal specific-to-this-topic material, since the vendors building the tools are also the ones most actively documenting real production failure patterns.
- **OpenTelemetry community talks on the GenAI semantic conventions working group** — useful for understanding the standardization effort's current direction directly from the people building it, rather than a secondhand summary.
- I would not name specific individual creators or exact talk titles here with confidence, since this is a fast-moving, conference-driven content space where the most current and relevant talks change year over year — search recent AI engineering conference programs directly for the latest material rather than relying on a fixed list.
`,

  "github-repos": `
- **open-telemetry/opentelemetry-python** and **open-telemetry/opentelemetry-js** — the reference SDK implementations for OTel tracing, the foundation any agent-specific instrumentation built on the standard ultimately sits on.
- **langfuse/langfuse** — the open-source Langfuse platform itself; reading its tracing SDK source is a direct way to see a mature, production-grade implementation of the concepts this page covers.
- **open-telemetry/semantic-conventions** — the repository where the GenAI semantic conventions are actively specified and discussed; the closest thing to a primary source for the exact current attribute names.
- **langchain-ai/langsmith-sdk** — LangSmith's client SDK; useful to read alongside Langfuse's for a side-by-side sense of how two different vendors structure the same underlying trace/span/attribute concepts.
- A general-purpose OTel collector configuration reference (the **opentelemetry-collector** and **opentelemetry-collector-contrib** repositories) — useful for understanding the collector's processor/exporter model referenced in the Deployment section.

I would verify these repository names are current and still maintained at the time you check, since project names and maintenance status can shift.
`,

  "practice-problems": `
Ordered by the skill focus they exercise:

1. **Span modeling**: implement a nested span tracer from scratch (see Coding Questions Problem 1) supporting concurrent/async sibling spans, not just a single call stack.
2. **Failure detection**: extend the loop-detection heuristic from Coding Questions Problem 2 to handle a "slow loop" (steps that vary slightly each iteration without genuine progress), not just exact repeats.
3. **Attribute-based debugging**: given a synthetic set of trace summaries with per-hop cost and model attribution, write a function that identifies the single most likely cause of an aggregate cost regression (see Coding Questions Problem 3), and extend it to also flag a routing-policy misconfiguration specifically.
4. **Cross-agent propagation**: build a two-agent pipeline where trace context must be explicitly passed across a network boundary (not just an in-process function call), and confirm the resulting trace is unified rather than fragmented.
5. **External practice**: general distributed-tracing exercises (implementing a minimal Dapper-style tracer, or working through OpenTelemetry's own getting-started tutorials for Python or JavaScript) transfer directly to agent-specific instrumentation, since the underlying data model is the same.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Agent["Agent runtime"]
        Loop["Reason-act-observe loop"]
        Tools["Tool layer\n(schema-validated calls)"]
        Guard["Loop guard +\nhallucination detector"]
    end
    subgraph SDK["Instrumentation SDK"]
        Spans["Span creation\n(GenAI semantic conventions)"]
        Redact["Redaction of PII/secrets"]
        Batcher["Async batched exporter"]
    end
    subgraph Pipeline["Collection + storage"]
        Collector["OTel collector\n(vendor-neutral hop)"]
        Store["Trace store\n(vendor SaaS or self-hosted)"]
    end
    subgraph Consumers["Who reads the traces"]
        Dash["Cost / latency / hallucination-rate dashboards"]
        Evalr["Evaluators attaching quality scores"]
        Review["Human review queue\n(flagged traces)"]
    end

    Loop --> Spans
    Tools --> Spans
    Guard --> Spans
    Spans --> Redact --> Batcher --> Collector --> Store
    Store --> Dash
    Store --> Evalr --> Store
    Store --> Review
~~~

This is the reference production shape: instrumentation lives close to the agent (span creation, redaction, batching), a vendor-neutral collector decouples the agent from any one backend, and the stored traces feed three distinct consumers — dashboards, an evaluation pipeline that writes scores back onto the same traces, and a human review queue fed by a filter over trace status and score.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Agent Observability))
    Core vocabulary
      Trace
      Span
      Parent/child nesting
      Trace ID propagation
    Agent-specific attributes
      Model per hop
      Prompt/completion tokens
      Cost per hop
      Latency per hop
      Tool name/arguments/result
      Retry count
    Failure modes
      Hallucinated tool calls
        Schema validation
      Infinite/unproductive loops
        Hard step cap
        Similarity heuristic
      Reasoning drift
        Intermediate-step scoring
    Standards
      OpenTelemetry
      GenAI semantic conventions
    Vendor implementations
      LangSmith
      Langfuse
      Raw OTel + generic backend
    Multi-agent extension
      Cross-agent trace propagation
      A2A boundary tracing
    Production concerns
      Redaction of PII/secrets
      Sampling policy
      Access control on trace data
      Batched async export
    Connected disciplines
      AI Evals
      Human-in-the-Loop AI
      MCP
      Prompt Versioning
      Model Routing
      Multi-Agent Systems
~~~
`,
};

export default agentObservability;
