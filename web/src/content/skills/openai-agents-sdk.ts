import type { SkillContent } from "../types";

/**
 * OpenAI Agents SDK — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const openaiAgentsSdk: SkillContent = {
  overview: `
The OpenAI Agents SDK is a lightweight, open-source framework (available for both Python and TypeScript) for building agentic applications: programs where an LLM decides, in a loop, whether to respond directly, call a tool, or hand off the conversation to a different specialized agent. It is the production-ready successor to OpenAI's earlier experimental "Swarm" project, and it is explicitly designed to be provider-agnostic — while it defaults to OpenAI's models, it works with any model provider that exposes a Chat Completions-compatible or Responses-compatible API.

For an AI engineer, the Agents SDK matters because it names and formalizes a small set of primitives — Agents, Tools, Handoffs, Guardrails, Sessions, and a Runner that executes the loop between them — instead of asking you to assemble that loop by hand out of raw chat-completion calls. Writing a naive "tool calling agent" from scratch (call the model, inspect for a tool_call, execute the tool, append the result, call the model again, repeat until a final answer) is maybe 50-150 lines of easy-to-get-subtly-wrong control flow: forgetting to bound the loop, mishandling parallel tool calls, or losing conversation state across turns. The SDK packages that loop, plus multi-agent handoff and safety-check hooks, into a small number of composable classes.

Key characteristics: a deliberately minimal core (a handful of primitives, not a large abstraction zoo), first-class multi-agent handoffs where one agent can transfer control (and conversation context) to another agent better suited to the current sub-task, guardrails as structured input/output validation hooks rather than ad-hoc prompt instructions, built-in tracing for observability with zero extra wiring, and a pluggable model layer so teams are not locked into a single provider. It sits deliberately on the "thin toolkit" end of the spectrum, in contrast to heavier, more opinionated frameworks like LangChain and CrewAI (see the **LangChain** and **CrewAI** skills) that ship large ecosystems of pre-built chains, retrievers, and multi-agent topologies. Whether that minimalism is a feature or a gap depends on your project; this page tries to be honest about the tradeoff, not sell it as a silver bullet.
`,

  history: `
Agentic tool-calling patterns using OpenAI's function-calling API existed informally since function calling itself launched in mid-2023, with teams writing their own bespoke loops. OpenAI's own formalization of the pattern went through two visible stages before the current SDK.

| Year | Milestone |
|------|-----------|
| 2023 | OpenAI ships function calling in the Chat Completions API; the community starts writing hand-rolled "agent loops" around it, and frameworks like LangChain and early AutoGPT-style projects popularize the pattern |
| Late 2023 - 2024 | OpenAI publishes **Swarm**, an experimental, intentionally minimal, educational multi-agent orchestration library demonstrating agent handoffs — explicitly NOT positioned as production-ready |
| 2024 | The Assistants API (a separate, more managed, stateful OpenAI product for building agents) ships and iterates in parallel, giving OpenAI two different agent-building surfaces at once |
| March 2025 | OpenAI releases the **Agents SDK** as the production-ready evolution of Swarm's ideas — Agents, handoffs, guardrails, sessions, and built-in tracing, for both Python and (soon after) TypeScript/JavaScript |
| 2025 | The SDK adds and iterates on Sessions (persistent conversation memory), realtime/voice agent support, and deeper integration with the Responses API as OpenAI's preferred lower-level API surface |
| 2025 (ongoing) | The Assistants API is positioned for eventual deprecation in favor of the Responses API + Agents SDK combination, though exact migration timelines should always be checked against current OpenAI documentation rather than assumed |

The throughline across Swarm and the Agents SDK is a stated design philosophy: keep the number of primitives small enough to hold in your head, and let control flow live in plain code (Python/TypeScript functions and control structures) rather than in a bespoke graph-definition language. That is a direct, explicit contrast to graph-based orchestration frameworks like LangGraph.
`,

  "why-it-exists": `
Before a first-party SDK, teams building tool-using, multi-step agents on top of OpenAI's models faced a familiar set of choices, each with real costs:

1. **Hand-roll the loop.** Directly call the Chat Completions or Responses API, parse tool-call output, execute functions, append results, and repeat. Full control, but every team reinvents error handling, loop termination, parallel tool-call handling, and conversation-state management slightly differently — and subtly wrong versions of this loop are a common source of production bugs (infinite tool-call loops, dropped context, mishandled streaming).
2. **Adopt a large general-purpose framework** (LangChain, CrewAI, AutoGen) that solves the loop but also brings a much larger surface area: many abstractions, opinions about memory, retrieval, and multi-agent topology that may not match your use case, and a steeper learning curve to understand what is actually happening under the abstraction.
3. **Use OpenAI's Assistants API**, a more managed, stateful product — convenient for some use cases, but a heavier, more opinionated, hosted abstraction with its own constraints (thread/run model, tool execution semantics) that doesn't fit every architecture, and one that OpenAI itself has signaled moving away from in favor of the Responses API.

The gap the Agents SDK fills is a middle ground: give engineers the small set of primitives that keep recurring in real agent systems (an agent with instructions and tools, a way to hand off between specialized agents, a way to validate inputs/outputs, a way to see what happened) as plain, inspectable code — without forcing adoption of a large framework's full opinionated stack, and without being locked into a hosted, stateful API model. It exists specifically for teams who want "just enough scaffolding" and are willing to write the surrounding application logic themselves.
`,

  "problem-it-solves": `
Concrete pains the Agents SDK removes:

- **Tool-calling loop boilerplate.** The Runner handles the call-model → check-for-tool-calls → execute-tools → append-results → call-model-again cycle, including terminating the loop when the model produces a final answer instead of another tool call.
- **Multi-agent handoff plumbing.** Transferring a conversation from a "triage" agent to a specialized agent (billing, technical support, refunds) with the right context carried over is a first-class primitive (Handoffs), not something you build with manual routing logic and prompt-engineered "if the user asks about X, pretend to be a billing agent" instructions.
- **Safety-check wiring.** Guardrails give you a structured place to run input/output validation (PII detection, off-topic filtering, jailbreak-attempt detection) as a discrete, testable step in the loop, rather than folding validation logic into the same prompt that's trying to do the actual task — see the **Guardrails** skill for the general pattern this implements.
- **Observability from day one.** Tracing is built into the Runner rather than being an opt-in third-party integration you have to wire up separately for prototype-stage projects.
- **Conversation memory across turns.** Sessions provide a pluggable place to persist and retrieve conversation history so multi-turn agents don't require you to hand-manage message-list concatenation — see the **Agent Memory** skill for the broader memory-architecture concepts this builds on.

What the Agents SDK deliberately does **not** try to solve:

- **Retrieval-augmented generation as a first-class data layer.** It gives you tools (including hosted tools like file/web search in some integrations) but does not attempt to be a document-ingestion, chunking, and indexing framework the way **LlamaIndex** is.
- **A large library of pre-built integrations and chains.** Unlike LangChain's sprawling integration ecosystem, the Agents SDK ships a small core and expects you to write most integration glue yourself, or pull in the surrounding OpenAI ecosystem (Responses API tools) directly.
- **Prescribing a single "correct" multi-agent topology.** CrewAI and AutoGen each bring stronger opinions about how multiple agents should be organized (crews/roles, conversational multi-agent patterns); the Agents SDK gives you the handoff primitive and lets you decide the topology.
- **Being a universal standard.** It is one well-designed, actively evolving option among several viable agent frameworks — treat claims that it is "the" way to build agents with the same skepticism you'd apply to any single vendor's framework.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what the Agents SDK is, what problem it solves relative to hand-rolled tool-calling loops and heavier frameworks, and where it deliberately stays minimal.
2. Define an Agent with instructions, a model, and a set of tools, and explain how the Runner executes the agentic loop.
3. Write function tools with typed parameters and understand how the SDK turns a plain function into a callable tool definition the model can invoke.
4. Design a multi-agent system using Handoffs, including a triage agent that routes to specialized agents, and explain what context is (and isn't) preserved across a handoff.
5. Implement input and output Guardrails and explain how they differ from prompting the model to "please behave," including tripwire/short-circuit behavior.
6. Use Sessions to persist conversation history across turns and explain the tradeoffs of different session backends.
7. Read and interpret built-in traces to debug a multi-step agent run, including tool calls, handoffs, and guardrail triggers.
8. Compare the Agents SDK honestly against LangChain, CrewAI, and AutoGen, and articulate a decision rule for when each is the better fit.
9. Identify the SDK's fast-moving surface area and know to verify current syntax/behavior against official docs rather than trusting memorized specifics.
`,

  prerequisites: `
- **Required**: comfortable Python or TypeScript (functions, classes, async/await — see the **Python** skill); a working understanding of what an LLM chat-completion call looks like (messages in, text or tool-call out).
- **Required conceptually**: what tool/function calling is and why it exists — see the **Tool Calling** skill before this page, since the Agents SDK's "tools" primitive is a structured wrapper around that exact mechanism, not a new idea.
- **Strongly recommended**: the **Agent Fundamentals** skill for the general concept of what an "agent" is (instructions + tools + a loop that decides actions) — this page assumes that vocabulary and focuses on how this specific SDK implements it.
- **Helpful**: the **Guardrails** skill for the general input/output-validation pattern this SDK's Guardrails primitive implements; the **Agent Memory** skill for the concepts behind Sessions; the **MCP** skill (Model Context Protocol), since the Agents SDK can consume MCP servers as a source of tools.
- **Helpful for the comparisons section**: the **LangChain**, **CrewAI**, and **AutoGen** skills, so the tradeoffs discussed there land with real reference points instead of being abstract.

Dependency chain on this platform: **Python** → **Tool Calling** → **Agent Fundamentals** → **Guardrails** / **Agent Memory** → **this page** → **LangChain** / **CrewAI** / **AutoGen** / **MCP** for broader orchestration and interoperability options.
`,

  "beginner-concepts": `
### Your first Agent

An Agent is instructions (a system prompt), a model, and optionally a list of tools. The Runner drives execution.

~~~python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="You are a concise, helpful assistant. Answer in 2-3 sentences.",
)

# Runner.run_sync executes the agent loop synchronously and returns the result
result = Runner.run_sync(agent, "What is the capital of France?")
print(result.final_output)
~~~

Under the hood, Runner.run_sync sends your instructions plus the user's message to the model, and because there are no tools here, the model's first response is already the final answer, so the loop ends after one model call.

### Giving an agent a tool

A tool is a plain function, decorated so the SDK can turn it into a callable definition the model understands.

~~~python
from agents import Agent, Runner, function_tool

@function_tool
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    # In a real tool this would call a weather API; keep it simple here.
    fake_data = {"paris": "18C, cloudy", "tokyo": "24C, sunny"}
    return fake_data.get(city.lower(), "no data for that city")

agent = Agent(
    name="WeatherBot",
    instructions="Help users check the weather. Use the get_weather tool when asked.",
    tools=[get_weather],
)

result = Runner.run_sync(agent, "What's the weather in Tokyo?")
print(result.final_output)
~~~

The docstring and type hints on get_weather are not decoration — the SDK inspects them to build the JSON schema the model sees describing the tool's name, parameters, and purpose, so the model can decide when and how to call it. Vague docstrings produce a model that calls the tool at the wrong times or with the wrong arguments; this is the same lesson taught in more depth in the **Tool Calling** skill.

### Running an agent asynchronously

Most real applications (web servers, chat backends) run agents inside an async context rather than blocking synchronously.

~~~python
import asyncio
from agents import Agent, Runner

agent = Agent(name="Assistant", instructions="Be helpful and brief.")

async def main():
    result = await Runner.run(agent, "Give me one fun fact about octopuses.")
    print(result.final_output)

asyncio.run(main())
~~~

### Reading the run result

result.final_output is the convenient final answer, but result also carries the full list of items generated during the run (model messages, tool calls, tool outputs, handoffs) — useful for logging, debugging, and building your own UI around intermediate steps rather than just the final text.

Common beginner trap: assuming an agent with no tools and an agent with unused tools behave identically. An agent is only as good as its instructions in describing WHEN to use each tool; an agent that technically has a tool but is never told in its instructions that the tool exists for a given scenario will often just answer from its own knowledge instead of calling it.
`,

  "intermediate-concepts": `
### Handoffs between specialized agents

A handoff lets one agent transfer the conversation to another agent better suited to continue it — the core primitive for multi-agent systems in this SDK.

~~~python
from agents import Agent, Runner

refund_agent = Agent(
    name="RefundAgent",
    instructions="You handle refund requests. Ask for an order ID, then approve "
                 "or deny the refund based on stated policy.",
)

technical_agent = Agent(
    name="TechnicalAgent",
    instructions="You handle technical troubleshooting questions about the product.",
)

triage_agent = Agent(
    name="TriageAgent",
    instructions="Route the user to the right specialist: refunds vs technical "
                 "issues. Do not attempt to answer either type of question yourself.",
    handoffs=[refund_agent, technical_agent],
)

result = Runner.run_sync(triage_agent, "My order #4521 arrived broken, I want a refund.")
print(result.final_output)
# The triage agent recognizes this as a refund request and hands off; the
# refund_agent's instructions and tools take over for the rest of the run.
~~~

A handoff is implemented as a special tool the model can call (conceptually "transfer_to_refund_agent"); when invoked, the Runner switches which agent's instructions and tools govern subsequent model calls within the same run, while conversation history carries forward. This differs from a subroutine call: the receiving agent does not "return" to the triage agent afterward by default — the handoff is a genuine transfer of control, not a nested function call, so design your topology with that one-directional flow in mind unless you explicitly add a path back.

### Structured outputs

Agents can be constrained to return structured data instead of free text, which matters whenever downstream code needs to parse the result reliably.

~~~python
from pydantic import BaseModel
from agents import Agent, Runner

class OrderLookup(BaseModel):
    order_id: str
    is_refund_eligible: bool
    reason: str

agent = Agent(
    name="RefundChecker",
    instructions="Determine refund eligibility for the given order description.",
    output_type=OrderLookup,
)

result = Runner.run_sync(agent, "Order 4521, arrived damaged, purchased 10 days ago.")
lookup: OrderLookup = result.final_output
print(lookup.is_refund_eligible, lookup.reason)
~~~

output_type wires the model's response through structured-output/JSON-schema enforcement so result.final_output is a validated, typed object rather than a string you have to parse yourself and hope is well-formed.

### Guardrails as input/output checks

Guardrails run validation logic before an agent's main instructions execute (input guardrails) or after it produces output (output guardrails), and can short-circuit the run if a check fails — see the **Guardrails** skill for the general pattern this formalizes.

~~~python
from agents import Agent, Runner, GuardrailFunctionOutput, input_guardrail

@input_guardrail
async def block_offtopic(ctx, agent, user_input: str) -> GuardrailFunctionOutput:
    is_offtopic = "weather" not in user_input.lower() and "forecast" not in user_input.lower()
    return GuardrailFunctionOutput(
        output_info={"reason": "off-topic request"},
        tripwire_triggered=is_offtopic,
    )

agent = Agent(
    name="WeatherOnlyBot",
    instructions="Only answer weather-related questions.",
    input_guardrails=[block_offtopic],
)

# If the guardrail's tripwire_triggered is True, the Runner raises/short-circuits
# instead of letting the agent's main instructions process the input.
~~~

The key distinction from "just tell the model to refuse off-topic questions in the prompt": a guardrail is a separate, independently testable function with its own pass/fail semantics, not a hope embedded in the same instructions the main task also relies on — so a prompt-injection attempt that manipulates the main agent's behavior does not automatically also defeat the guardrail, since it runs as distinct code.

### Sessions for multi-turn memory

~~~python
from agents import Agent, Runner, SQLiteSession

agent = Agent(name="Assistant", instructions="Be a helpful, stateful chat assistant.")
session = SQLiteSession(session_id="user-123", db_path="conversations.db")

# Each call automatically loads prior history from the session and appends
# the new turn, so you don't hand-manage the message list yourself.
result1 = Runner.run_sync(agent, "My name is Priya.", session=session)
result2 = Runner.run_sync(agent, "What's my name?", session=session)
print(result2.final_output)  # remembers "Priya" from the session-backed history
~~~

Sessions are pluggable — an in-memory session for quick scripts, a SQLite-backed session for a single-process app, or a custom session backed by Redis/Postgres for a production multi-instance deployment; see the **Agent Memory** skill for the broader design space of short-term vs long-term memory this maps onto.
`,

  "advanced-concepts": `
### Parallel and forced tool calls

Models can request multiple tool calls in a single turn; the Runner executes them and can be configured to run independent tool calls concurrently (especially valuable when tools are I/O-bound, e.g. network calls) rather than strictly sequentially. You can also force tool use (require the model to call a specific tool, or any tool, rather than letting it choose to answer directly) via the agent's tool-choice configuration — useful when a workflow step must always be backed by a real lookup rather than the model's own (possibly stale or hallucinated) knowledge.

### Guardrail tripwire semantics and cost

Because input guardrails can run concurrently with (or gate) the main agent call, a well-designed guardrail is cheap and fast relative to the main task — a heavy, slow guardrail check erodes the latency benefit of catching bad input early. Output guardrails, by contrast, necessarily run after the main generation completes, so they add pure latency on the tail end of every run; budget for that in production latency numbers rather than treating guardrails as free.

### Handoff context control

By default a handoff carries the full conversation history to the receiving agent, but the SDK supports customizing exactly what context transfers — filtering the history, summarizing it, or attaching structured handoff data (e.g., "the triage agent decided this is a billing issue with severity=high") so the receiving agent gets a clean, purposeful briefing rather than an unfiltered transcript. This matters for both prompt-token cost (long histories are expensive to resend) and for behavior (an over-long, noisy history can distract a specialized agent from its narrow job).

### Agents as tools vs. agents as handoff targets

A subtlety worth internalizing: the SDK supports wrapping one agent AS A TOOL that another agent calls (get an answer back, keep control), which is different from a handoff (transfer control away). Use "agent as tool" when you want a orchestrating agent to consult a specialist and then continue reasoning itself with that specialist's answer folded in (e.g., a research-summary sub-agent called by a report-writing agent); use a handoff when the specialist should own the rest of the conversation (e.g., routing a support ticket to the right team). Conflating the two is a common design mistake that produces either an agent that never lets go of control when it should hand off, or one that hands off when it should have just consulted and continued.

### Decision table: primitive choice

| Situation | Primitive |
|-----------|-----------|
| Need the model to fetch/compute something and keep reasoning | Tool (function_tool) |
| Need to delegate the REST of the conversation to a specialist | Handoff |
| Need an answer from a specialist while staying in control | Agent-as-tool |
| Need to validate/reject input before the main task runs | Input guardrail |
| Need to validate/reject output before it reaches the user | Output guardrail |
| Need conversation history across multiple calls | Session |
| Need to see what actually happened during a run | Tracing |

### Tracing internals and custom spans

Tracing captures a structured record of every model call, tool call, handoff, and guardrail check within a run automatically. For custom instrumentation needs (tagging a run with a request ID, wrapping a non-SDK operation in a span so it shows up alongside agent activity in the same trace) the SDK exposes primitives to create custom spans and attach metadata, which matters once you're running this in a production system alongside your own observability stack rather than only inspecting traces in OpenAI's dashboard during development.

### Provider-agnostic model layer

Because the SDK's model interface is not hard-wired to a single vendor's SDK client, teams route different agents (or the same agent under different configs) to different model providers behind a common interface — useful for cost/latency tuning (a cheap fast model for the triage agent, a stronger model for a complex specialist agent) or for avoiding single-vendor lock-in. The exact mechanism and list of supported/compatible providers evolves, so verify current provider-compatibility details against official docs rather than assuming any specific provider works out of the box.
`,

  "internal-working": `
The Runner executes a fixed loop per turn, similar in spirit to any tool-calling agent loop, with handoffs and guardrails inserted at defined points:

~~~mermaid
flowchart TB
    Start["Runner.run(agent, input)"] --> IG{"Input guardrails\nconfigured?"}
    IG -->|yes| IGCheck["Run input guardrail(s)"]
    IGCheck -->|tripwire triggered| Halt["Raise / short-circuit run"]
    IGCheck -->|pass| Model["Call model with\ninstructions + history + tool defs"]
    IG -->|no| Model
    Model --> Decide{"Model response type?"}
    Decide -->|final answer| OG{"Output guardrails\nconfigured?"}
    Decide -->|tool call(s)| Exec["Execute tool function(s)"]
    Decide -->|handoff call| Switch["Switch active agent\n(carry context per config)"]
    Exec --> Append["Append tool results to history"]
    Append --> Model
    Switch --> Model
    OG -->|tripwire triggered| Halt
    OG -->|pass| Done["Return RunResult\n(final_output + full item list)"]
~~~

Step by step:

1. **Input guardrails** (if configured on the active agent) run before the model is called at all, given the raw user input; if any tripwire triggers, the Runner halts the run rather than letting the main agent process potentially unsafe or out-of-scope input.
2. **Model call**: the active agent's instructions, the accumulated conversation history, and the JSON-schema tool/handoff definitions are sent to the model. Which model, which provider, and which underlying API (Chat Completions vs Responses) is used is a per-agent/per-run configuration detail.
3. **Response branching**: if the model's response is plain text with no tool/handoff call, that becomes (subject to output guardrails) the final answer. If it requests one or more tool calls, the Runner executes the corresponding registered functions and appends their results to history before calling the model again. If it requests a handoff, the Runner swaps which agent's instructions/tools/guardrails govern the NEXT model call, applying whatever context-transfer rule is configured for that handoff.
4. **Loop continuation**: steps 2-3 repeat until the model produces a final answer with no further tool/handoff calls, or a configured max-turns/iteration limit is hit (a safety bound against runaway loops — always confirm this exists and is set sensibly for your use case rather than assuming an unbounded loop is safe).
5. **Output guardrails** (if configured) run on the final answer before it's returned to the caller; a triggered tripwire here again halts/rejects the run rather than silently returning unsafe/off-policy output.
6. **Tracing** captures every step above (model calls, tool executions, handoffs, guardrail evaluations) as structured trace data, viewable without any additional instrumentation.

The important mental model: this is a plain, bounded, inspectable loop written in ordinary code (not a hidden state machine or a compiled execution graph), which is precisely the minimalism the SDK is built around — you can, in principle, read the Runner's source and understand exactly what will happen for a given agent configuration.
`,

  architecture: `
### Runtime architecture

~~~mermaid
flowchart TB
    subgraph App["Your application"]
        Entry["API route / CLI / chat UI"] --> RunnerCall["Runner.run(agent, input, session=...)"]
    end
    subgraph SDK["Agents SDK"]
        RunnerCall --> Loop["Agent execution loop\n(guardrails, tool calls, handoffs)"]
        Loop --> ModelLayer["Model layer\n(provider-agnostic interface)"]
        Loop --> ToolLayer["Registered function tools\n+ MCP server tools"]
        Loop --> HandoffLayer["Registered handoff targets\n(other Agent instances)"]
        Loop --> SessionLayer["Session backend\n(memory / SQLite / custom)"]
        Loop --> TraceLayer["Tracing\n(spans per model/tool/handoff call)"]
    end
    ModelLayer --> Providers[("OpenAI / other\ncompatible model providers")]
    ToolLayer --> ExternalAPIs[("Your APIs, DBs,\nweb search, MCP servers")]
    TraceLayer --> Dashboard["Trace viewer /\nyour observability stack"]
~~~

The key architectural decision: the SDK is a library you call INTO from your own application code (a FastAPI route, a worker process, a CLI), not a hosted service you call OUT to — the Runner executes in your process, and you own the surrounding request handling, auth, and deployment entirely. This is a different shape from OpenAI's Assistants API, which is a stateful hosted product; here, state (sessions) is explicitly something you configure and can self-host.

### Application layout for a production Agents SDK service

~~~
supportbot/
├── pyproject.toml
├── src/supportbot/
│   ├── agents/
│   │   ├── triage.py          # triage Agent + handoffs list
│   │   ├── refunds.py         # specialist Agent + its tools
│   │   └── technical.py       # specialist Agent + its tools
│   ├── tools/
│   │   ├── order_lookup.py    # function_tool-decorated functions
│   │   └── kb_search.py       # function_tool wrapping a retrieval call
│   ├── guardrails/
│   │   ├── input_checks.py    # off-topic / injection detection
│   │   └── output_checks.py   # PII / policy compliance checks
│   ├── sessions.py            # session backend configuration (e.g. Redis-backed)
│   ├── api/                   # FastAPI routes calling Runner.run
│   └── observability/         # trace export / metrics wiring
└── tests/
~~~

Dependencies point from api → agents → tools/guardrails/sessions; agent definitions are pure configuration (instructions + tool/handoff lists) and stay decoupled from the transport layer, so the same agents can be driven from a web API, a Slack bot, or a CLI without duplicating logic.
`,

  "data-flow": `
Tracing one multi-agent request end to end, including a handoff and a tool call, as a sequence diagram:

~~~mermaid
sequenceDiagram
    participant User
    participant Runner
    participant Triage as TriageAgent
    participant Refund as RefundAgent
    participant Tool as order_lookup tool
    participant LLM as Model API

    User->>Runner: run(triage_agent, "Order 4521 arrived broken, refund please")
    Runner->>Triage: run input guardrails (if any)
    Runner->>LLM: call model with triage instructions + history
    LLM-->>Runner: handoff request -> RefundAgent
    Runner->>Refund: switch active agent, carry context
    Runner->>LLM: call model with refund agent instructions + history
    LLM-->>Runner: tool call -> order_lookup(order_id="4521")
    Runner->>Tool: execute order_lookup("4521")
    Tool-->>Runner: {"status": "delivered", "damaged_report": true}
    Runner->>LLM: call model again with tool result appended
    LLM-->>Runner: final answer text
    Runner->>Runner: run output guardrails (if any)
    Runner-->>User: RunResult(final_output, full item list)
~~~

The most easily missed detail: a single Runner.run call can involve multiple model calls, one handoff, and one tool execution, yet the caller sees one RunResult at the end. This is convenient, but it also means naive latency expectations ("it's one API call") are wrong for any agent with tools or handoffs — real latency is the sum of every model round-trip in the loop, which is why tracing (to see how many round-trips actually happened) is the first place to look when a run feels slow.
`,

  "production-usage": `
### Typical project setup

~~~python
from agents import Agent, Runner, function_tool, SQLiteSession
import os

# Model/provider configuration is typically centralized so every agent in
# the app shares consistent defaults (model name, timeouts, API key source).
MODEL_NAME = os.environ.get("AGENTS_MODEL", "gpt-4o-mini")

@function_tool
def lookup_order(order_id: str) -> dict:
    """Look up an order's status and delivery details by ID."""
    # Real implementation would call your order-service API with a timeout.
    return {"order_id": order_id, "status": "delivered", "damaged_report": True}

refund_agent = Agent(
    name="RefundAgent",
    model=MODEL_NAME,
    instructions="Handle refund requests. Look up the order before deciding.",
    tools=[lookup_order],
)
~~~

### Non-negotiables for production

1. **Always set a max-turns / iteration bound** on Runner execution — an agent with tools and no bound can, in principle, loop many times before terminating, especially if a tool result confuses the model into repeated retries.
2. **Set request timeouts on the underlying model client**, not just application-level timeouts — a hung model call otherwise stalls the whole run indefinitely.
3. **Treat every tool function like a production function**: validate inputs, handle exceptions, return structured errors the model can reason about rather than letting an unhandled exception crash the run.
4. **Use a real session backend** (not in-memory only) for any multi-instance deployment, so conversation state survives a request landing on a different process/replica.
5. **Wire input and output guardrails before shipping anything user-facing** — off-topic filtering, PII detection, and basic prompt-injection detection are cheap relative to the cost of an ungated agent misbehaving in front of real users; see the **Guardrails** skill for the general discipline.
6. **Export traces to your own observability stack**, not just the default trace viewer, once you're running at a scale where cross-referencing agent traces with your existing logs/metrics/alerts matters.
7. **Pin agent instructions and tool schemas under version control and review**, the same as you would application code — an instructions change is a behavior change and deserves the same scrutiny as a code change.
`,

  "industry-examples": `
- **Customer support automation vendors** commonly structure support bots as a triage agent handing off to specialist agents (billing, technical, account) — a close match for the SDK's headline example pattern, whether via this SDK directly or an architecturally equivalent hand-rolled system.
- **Coding-assistant and developer-tool companies** use the tool-calling and handoff primitives to build agents that read a codebase, call linting/test tools, and hand off between a "planning" agent and an "execution" agent for multi-step coding tasks — the same shape described generically in the **Agent Fundamentals** skill.
- **Internal enterprise automation teams** (ops, IT helpdesk, HR-bot style use cases) adopt lightweight SDKs like this one specifically because they want to write their own business logic and integration glue around a small number of well-understood primitives, rather than adopt a large framework's full opinionated stack for what is often a fairly narrow internal tool.
- **Early-stage AI product startups** frequently prototype with the Agents SDK (or Swarm before it) precisely because its minimalism makes it fast to understand and modify during rapid iteration, then either keep it or migrate to a heavier framework once requirements (e.g., complex retrieval, elaborate multi-agent topologies) outgrow what a thin SDK is trying to provide.

Pattern to notice: the common thread is teams that value being able to read and reason about the entire agent loop, and are willing to write more of their own integration code in exchange for fewer hidden abstractions — the inverse tradeoff from teams that adopt LangChain or CrewAI specifically for their large pre-built integration surface.
`,

  "best-practices": `
1. **Write tool docstrings and parameter descriptions as if a new engineer (not just the model) were reading them** — the model's tool-selection quality depends directly on how clearly a tool's purpose and parameters are described, exactly as in the **Tool Calling** skill.
2. **Keep each agent's instructions narrow and single-purpose**; a triage agent should route, not attempt the specialist task itself, and a specialist agent's instructions shouldn't try to also cover triage logic.
3. **Prefer handoffs for "own the rest of the conversation" delegation and agent-as-tool for "consult and continue" delegation** — picking the wrong one produces confusing control-flow bugs.
4. **Always set a max-turns bound** and treat hitting it as a logged, monitored event, not a silent timeout.
5. **Validate and sanitize tool inputs/outputs** inside the tool function itself; don't rely on the model to only ever produce well-formed arguments.
6. **Put both input and output guardrails in front of any user-facing agent**, even a "low risk" one — off-topic drift and unintentionally leaked sensitive information are common even in benign use cases, not just adversarial ones.
7. **Use structured output_type for any agent whose result feeds downstream code**, rather than parsing free text with regex/string matching.
8. **Design handoff context transfer deliberately** — decide per-handoff whether the full history, a filtered subset, or a structured summary should transfer, instead of accepting the default without thinking about token cost and focus.
9. **Centralize model/provider configuration** (model name, timeouts, retry policy) rather than hardcoding it per agent, so a provider or model swap is a one-line change.
10. **Log and trace every run in production**, and periodically review traces for agents that are handing off, looping, or calling tools more than expected — that's usually the first sign instructions need tightening.
11. **Version and test agent instructions like code** — a small wording change can measurably change tool-selection or handoff behavior; treat it with the review rigor of the **Testing** section below.
12. **Don't over-fragment into too many specialist agents** — each additional agent/handoff is another opportunity for misrouting; only split when a specialist genuinely needs different instructions, tools, or a different (e.g., cheaper/faster) model.
`,

  "anti-patterns": `
### No bound on the agent loop

~~~python
# WRONG: no max_turns configured; a confused model + a flaky tool can
# loop far longer than expected, burning cost and latency unbounded.
result = Runner.run_sync(agent, user_input)

# RIGHT: bound the loop explicitly and handle the bounded-out case
result = Runner.run_sync(agent, user_input, max_turns=8)
~~~

### Other production-grade anti-patterns

- **Vague tool docstrings "to keep it simple."** A tool described as "does_thing(x)" with no explanation of what x means or when to call it produces a model that either never calls it or calls it with wrong arguments; the model's tool-selection ability is bounded by the schema and docstring quality, not general intelligence.
- **Using a handoff when you meant "consult and continue."** Handing off to a specialist agent when the orchestrating agent actually needed the specialist's answer to keep reasoning (agent-as-tool territory) loses control of the conversation permanently.
- **Skipping guardrails on "internal" or "low-risk" agents.** Internal tools still see malformed input, and "low risk" often turns out wrong once a tool has write access to a real system.
- **No timeout on tool functions that call external APIs.** A hanging network call inside a tool stalls the entire agent run, not just that one step.
- **Treating result.final_output as trustworthy without an output guardrail or schema** when the result feeds an automated downstream action (e.g., issuing an actual refund) — free-text output from a model should never directly trigger a side-effecting action without validation.
- **Rebuilding the same session's history by hand instead of using Sessions.** Manually concatenating message lists across turns is exactly the boilerplate Sessions exist to remove, and hand-rolled versions tend to accumulate subtle bugs (duplicated messages, dropped tool results) over time.
- **Assuming instructions text is stable across model upgrades.** A prompt tuned against one model version can behave differently after a silent model update; re-validate agent behavior (via the eval/testing practices below) after any model change, not just after your own code changes.
`,

  performance: `
### Measure first

~~~python
import time
from agents import Runner

start = time.perf_counter()
result = Runner.run_sync(agent, user_input, max_turns=8)
elapsed = time.perf_counter() - start

# Inspect how many model round-trips actually happened
print(f"took {elapsed:.2f}s across {len(result.raw_responses)} model call(s)")
~~~

Use the built-in tracing to see a per-step breakdown (each model call, each tool execution, each handoff) rather than guessing which part of a multi-step run is slow — a "slow agent" complaint is frequently one slow tool call or an unexpectedly long chain of handoffs/tool calls, not the SDK's own overhead.

### The optimization hierarchy (apply in order)

1. **Reduce unnecessary model round-trips first.** Each tool call or handoff costs a full model round-trip; an agent whose instructions cause it to "double check" with redundant tool calls is paying for it in both latency and token cost.
2. **Use a smaller/faster model for narrow specialist agents** (a triage agent doing simple routing rarely needs the same model size as a complex reasoning specialist) — this is one of the concrete payoffs of the SDK's provider/model-agnostic design.
3. **Parallelize independent tool calls** rather than forcing sequential execution when the model requests multiple tools in one turn and they don't depend on each other's results.
4. **Bound and monitor max_turns** so a misbehaving loop fails fast (and loudly, in monitoring) instead of slowly burning latency and cost.
5. **Cache tool results for idempotent, repeatable lookups** (e.g., a reference-data lookup that doesn't change per request) rather than re-calling the same tool identically across nearby requests.
6. **Trim handoff context deliberately** (see Advanced Concepts) — resending a very long conversation history on every handoff adds both prompt-token cost and latency.
7. **Stream partial output to the user** where the interface supports it, so perceived latency (time to first token) improves even when total run time doesn't change.

### Numbers worth internalizing

Agent latency is dominated by the number of sequential model round-trips, not by the SDK's own coordination overhead, which is comparatively negligible — a 3-round-trip agent run (initial call, one tool call, final answer) will typically take roughly 3x a single model call's latency, not a small constant overhead on top of one call; plan latency budgets accordingly rather than assuming "an agent call" costs the same as "a chat completion call."
`,

  scalability: `
The Agents SDK itself is a thin, stateless-by-default library running inside your process; scalability is mostly a property of how you deploy the surrounding application, plus the model provider and any external tool/session backends.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["App replica 1\n(Runner in-process)"]
    LB --> API2["App replica N\n(Runner in-process)"]
    API1 & API2 --> Session[("Shared session store\n(Redis/Postgres, not in-process memory)")]
    API1 & API2 --> ModelAPI["Model provider API"]
    API1 & API2 --> ToolAPIs[("Your backend services\ncalled from tool functions")]
~~~

### Scaling the agent-serving path

- **Horizontal**: application replicas running the Runner are stateless as long as session state lives in a shared backend (Redis/Postgres-backed session, not the default in-memory session) — scale them behind a load balancer like any stateless API.
- **Model API concurrency**: the practical bottleneck at scale is almost always the model provider's rate limits/latency, not the SDK's own coordination logic; apply connection pooling, backoff/retry, and request queuing the same as you would for any high-volume LLM API usage.
- **Tool backend scaling**: tool functions calling your own services inherit those services' scaling characteristics — a tool that hits an under-provisioned internal API becomes the bottleneck regardless of how well the agent layer scales.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Model API rate limits under load | Backoff/retry, request queuing, consider provider-side rate-limit increases or a secondary provider for overflow |
| In-memory session store breaking multi-instance deployments | Switch to a shared Redis/Postgres-backed session implementation |
| Long handoff chains adding latency | Redesign topology to fewer, well-scoped agents; trim handoff context |
| Tool calls to a slow internal service | Scale/cache that service directly; add timeouts and circuit breakers in the tool function |
| Runaway loops consuming capacity | Enforce and monitor max_turns; alert on runs approaching the bound |
`,

  security: `
### Agents-SDK-specific attack surface

1. **Prompt injection via tool outputs.** A tool that fetches external content (a web page, a document, a database record written by an untrusted user) can return text that attempts to hijack the agent's subsequent behavior ("ignore previous instructions and..."). Treat tool outputs as untrusted data injected into the model's context, not as trusted system content — this is the same discipline covered in the **Guardrails** skill and the general prompt-injection literature.
2. **Handoff-based privilege escalation.** If a specialist agent has tools with more capability/access than the triage agent (e.g., a "refund agent" that can actually issue refunds), an attacker who can manipulate the triage agent into an unwarranted handoff effectively gains access to that specialist's tools. Guard high-privilege tools with their own checks (confirmation steps, output guardrails, or business-logic validation) independent of which agent happens to be active.
3. **Unvalidated tool arguments driving side effects.** A tool function that trusts the model's arguments completely (e.g., passing a model-supplied SQL fragment or file path straight through) is a direct injection/path-traversal vector; validate and sanitize inside the tool function itself, never assume the model's arguments are safe because "the schema said string."
4. **Missing output guardrails before side-effecting actions.** An agent whose final output directly triggers a real action (send an email, issue a refund, modify a record) without a validation/guardrail step in between risks acting on a hallucinated or manipulated decision.
5. **Unbounded cost from unauthenticated or unrate-limited endpoints.** A public-facing endpoint that runs an agent (especially one with tools that call paid external APIs) without auth and rate limiting is a direct cost-abuse vector, independent of anything SDK-specific.

### Defenses

- Apply input and output guardrails on every user-facing agent, treating them as a required security control, not an optional nicety — see the **Guardrails** skill for depth.
- Validate every tool argument inside the tool function; never trust model-supplied input for anything that touches a filesystem, database, or external command.
- Require an explicit confirmation step (human-in-the-loop or a stricter guardrail) before any agent-triggered action with real-world consequences (financial transactions, destructive operations, external communications).
- Log full traces (including tool arguments and handoff decisions) so a security review can reconstruct exactly what an agent did and why, after the fact.
- Rate-limit and authenticate any endpoint that triggers an agent run.

See the dedicated **Prompt Injection**, **OWASP Top 10 for LLM Applications**, and **Secrets Management** skills for depth beyond what's specific to this SDK here.
`,

  testing: `
### Testing a tool function directly

~~~python
def test_lookup_order_returns_expected_shape():
    from supportbot.tools.order_lookup import lookup_order

    # Tool functions are plain functions — test them like any other unit,
    # independent of the model or the agent loop.
    result = lookup_order("4521")
    assert "status" in result
    assert isinstance(result["status"], str)
~~~

### Testing an agent's behavior with a scripted/mocked model

~~~python
from agents import Agent, Runner
from unittest.mock import patch

def test_refund_agent_calls_lookup_before_deciding():
    agent = Agent(
        name="RefundAgent",
        instructions="Look up the order before deciding on a refund.",
        tools=[lookup_order],
    )
    result = Runner.run_sync(agent, "Order 4521 arrived damaged, refund please.")

    # Assert on structural properties (was the tool actually called?), not on
    # exact model wording, which is neither deterministic nor the right thing
    # to pin a test to.
    tool_calls = [item for item in result.new_items if item.type == "tool_call_item"]
    assert any("lookup_order" in str(call) for call in tool_calls)
~~~

### The senior testing doctrine for agentic systems

- **Unit test tool functions in isolation** without invoking the model at all — they're plain functions and should be tested as such, including error paths (bad input, upstream API failure).
- **Test guardrails as their own unit**, independent of the agent they're attached to, since a guardrail is just a function with a documented input/output contract.
- **Integration-test agent behavior against a small, hand-curated set of representative inputs**, asserting on structural signals (which tool was called, whether a handoff occurred, whether output matches the expected output_type schema) rather than exact text.
- **Treat model/prompt changes as requiring re-validation**, the same way you'd re-run a test suite after a dependency upgrade — a model version bump or an instructions tweak can change tool-selection and handoff behavior even when your own code hasn't changed.
- **Use recorded/replayed model responses for fast, deterministic CI runs**, reserving live-model integration tests for a smaller, slower suite that catches drift, matching the general discipline in the **AI Evals** skill.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the built-in trace for the run first.** Before guessing, look at the trace to see exactly which model calls, tool calls, and handoffs occurred, in what order, and with what arguments/results — this is usually faster than reasoning from the final output backward.

~~~python
result = Runner.run_sync(agent, user_input, max_turns=8)
for item in result.new_items:
    print(item.type, getattr(item, "raw_item", None))
~~~

2. **Check whether a handoff happened when it shouldn't have (or didn't happen when it should).** This is almost always an instructions-clarity problem on the source agent — tighten the routing criteria in its instructions rather than adding more handoff targets.
3. **Inspect tool call arguments exactly as the model produced them.** A wrong tool result is often the model passing a plausible-looking but wrong argument (a malformed order ID, a misparsed date) — this points at a tool description/parameter-naming fix, not a model problem.
4. **Reproduce with the loop bypassed**, calling the suspect tool function directly with the same arguments the trace showed, to isolate whether the bug is in the tool or in the model's tool selection.
5. **Check guardrail tripwire logs** when a run halts unexpectedly — confirm which guardrail fired and on what input/output, since a guardrail misconfiguration (too strict a rule) looks identical to "the agent refused to answer" from the outside.
6. **Verify session state directly** (query the session backend) when a multi-turn conversation seems to have "forgotten" something — confirm whether the history was actually persisted and retrieved correctly before suspecting the model.

### Debugging "the agent looped longer than expected"

Inspect the trace for repeated, near-identical tool calls or repeated handoffs bouncing between the same two agents — this usually means either a tool is returning an ambiguous/error result the model doesn't know how to act on, or two agents' instructions create a routing cycle (agent A hands off to B, B's instructions cause it to hand back to A). Fix by making tool error results explicit and actionable, and by making handoff routing rules mutually exclusive.
`,

  monitoring: `
Production visibility for an Agents SDK application rests on both general service observability (see the **Observability** category) and agent-run-specific signals.

### Structured logging per run

~~~python
import structlog

log = structlog.get_logger()

def logged_run(agent, user_input: str, user_id: str, session=None):
    result = Runner.run_sync(agent, user_input, session=session, max_turns=8)
    log.info(
        "agent_run",
        user_id=user_id,
        agent_name=agent.name,
        num_items=len(result.new_items),
        hit_max_turns=getattr(result, "hit_max_turns", False),
    )
    return result
~~~

### Agent-specific metrics to track

- **Turns per run** (how many model round-trips a run actually took) — a rising average signals looping, over-eager tool use, or handoff cycles worth investigating.
- **Handoff rate and destination distribution** — which specialist agents are receiving handoffs, and whether the distribution matches expectations; a spike toward one specialist can signal a triage-instructions regression.
- **Guardrail tripwire rate**, broken out by which guardrail fired — a sudden spike is either an attack pattern worth investigating or a guardrail that's become too strict after a wording change.
- **Tool error rate**, per tool — since tool functions call external systems, this metric doubles as health monitoring for those systems.
- **max_turns-hit rate** — runs that exhaust the loop bound without a clean final answer are a leading indicator of instruction or tool-quality problems.

### Tracing

Export the SDK's built-in trace data to your existing observability stack (via whatever exporter/integration the current SDK version supports) so agent-run traces sit alongside your application's regular logs, metrics, and alerts rather than living only in a separate standalone trace viewer — this is the fastest way to correlate "this user's request was slow/wrong" with the exact sequence of model calls, tool calls, and handoffs that produced it.
`,

  deployment: `
### A production Dockerfile for an Agents-SDK-based service

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev
COPY src/ src/
RUN uv sync --frozen --no-dev

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
ENV PATH="/app/.venv/bin:$PATH"
# API key and model config are injected as env vars/secrets, never baked in
ENV AGENTS_MODEL=gpt-4o-mini
USER appuser
EXPOSE 8000
# Reasonable defaults: worker timeout must exceed the app-level max_turns
# budget so a legitimately long agent run isn't killed mid-flight.
CMD ["uvicorn", "supportbot.api:app", "--host", "0.0.0.0", "--port", "8000", "--timeout-keep-alive", "75"]
~~~

Per-line rationale: the multi-stage build keeps the runtime image free of build tooling; running as a non-root appuser limits blast radius if the process is compromised; the model name is an env var so swapping models is a config change, not a rebuild; the API-server timeout is set with awareness of the agent loop's own max_turns bound, since a correctly-configured agent run can legitimately take several sequential model round-trips and should not be killed by an over-eager server timeout.

### Configuration checklist

- API keys and any provider credentials come from a secrets manager or environment injection, never committed to source (see the **Secrets Management** skill).
- max_turns, per-call timeouts, and session backend connection strings are environment-configurable, not hardcoded.
- Tracing export target (if any) is configured per environment (dev vs staging vs prod) so production traces don't leak into a shared dev dashboard, and vice versa.
`,

  "production-checklist": `
- [ ] Every user-facing agent has at least one input guardrail and one output guardrail configured and tested.
- [ ] max_turns is set explicitly on every Runner.run/run_sync call, and hitting it is logged as a monitored event.
- [ ] Every tool function validates its own inputs and handles upstream errors, returning structured error info the model can act on rather than raising uncaught exceptions.
- [ ] Model client timeouts are set explicitly, separate from and coordinated with any application/server-level timeout.
- [ ] Session state uses a shared backend (Redis/Postgres) in any multi-instance deployment, not the default in-memory session.
- [ ] Handoff context-transfer behavior has been deliberately reviewed per handoff, not left at default for every case.
- [ ] Tracing is enabled and exported to a location your team actually monitors, not left as an unused default.
- [ ] Structured logging captures agent name, turns taken, handoff destination, and guardrail trip status per run.
- [ ] Any agent output that triggers a real side effect (payment, email, data mutation) passes through an output guardrail or explicit confirmation step first.
- [ ] API keys and provider credentials are sourced from a secrets manager, not hardcoded or committed.
- [ ] Agent instructions and tool schemas are under version control and reviewed like code changes.
- [ ] A small regression test suite asserts on structural run properties (tool called, handoff occurred, output schema valid) for representative inputs.
- [ ] Rate limiting and authentication are in place on any endpoint that triggers an agent run.
- [ ] A rollback plan exists for instructions/tool changes (versioned prompts, feature flags) given how sensitive behavior is to wording changes.
`,

  "common-mistakes": `
1. **No max_turns bound** — because it's easy to forget in a quick prototype and the cost only shows up under unusual inputs in production.
2. **Vague tool docstrings** — because engineers underestimate how directly the model's tool-selection quality depends on that text, not just the function's actual behavior.
3. **Confusing handoffs with agent-as-tool** — because both look similar in code (passing agents into a list) but have opposite control-flow semantics.
4. **Treating guardrails as optional for "internal" agents** — because the threat model of "no external users" undercounts malformed input, accidental misuse, and internal prompt-injection vectors (e.g., data pulled from another system).
5. **Skipping structured output_type when downstream code parses the result** — because free-text parsing "worked in the demo" until a slightly different phrasing broke the regex.
6. **Assuming a handoff round-trips back to the sender** — because the mental model of "delegate and return" from normal function calls doesn't match the one-directional nature of a handoff by default.
7. **Not re-validating behavior after a model version change** — because a code diff of zero lines feels like "nothing changed," even though the underlying model's behavior can shift.
8. **Manually reimplementing conversation history management instead of using Sessions** — because it seems simpler for a first prototype, then accumulates bugs as the app grows.
9. **Not testing tool functions in isolation** — because it's tempting to only test "the agent," which makes tool bugs indistinguishable from prompt/model bugs during debugging.
10. **Ignoring the built-in tracing during development** — because reasoning from final output alone feels faster initially, until a genuinely multi-step bug becomes very hard to localize without it.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Agent loops far more turns than expected | Ambiguous tool result the model can't act on decisively, or a routing cycle between two handoff-linked agents | Return clearer/more actionable tool results; make handoff routing rules mutually exclusive; enforce max_turns |
| Model never calls an available tool | Vague or missing docstring/description; instructions don't tell the model when to use the tool | Rewrite the tool's docstring and parameter descriptions; add explicit guidance in agent instructions |
| Handoff never triggers when it should | Triage agent's instructions don't clearly define the routing boundary | Tighten and disambiguate the triage instructions with concrete examples of each category |
| result.final_output doesn't match expected schema | output_type not set, or model produced malformed structured output under an edge-case input | Set output_type explicitly; add an output guardrail to validate/re-prompt on schema mismatch |
| Session doesn't remember prior turns | Using the default in-memory session across separate processes/replicas, or session_id not passed consistently | Use a shared session backend and ensure the same session_id is passed on every call for a given conversation |
| Guardrail seems to block everything | Overly broad tripwire condition in the guardrail function | Unit test the guardrail function in isolation against representative pass/fail inputs |
| Run hangs indefinitely | No timeout configured on the underlying model client, or a tool function calling a hanging external API | Set explicit timeouts on both the model client and every tool that makes network calls |
| Behavior changed with no code diff | Underlying model version was silently upgraded by the provider | Re-run your regression/eval suite after any model change; pin model versions where the provider allows it |
`,

  faqs: `
**Is the Agents SDK the "official" or "standard" way to build agents with OpenAI models?**
It is OpenAI's own first-party, production-oriented SDK and a reasonable default starting point, but it is not the only viable way to build agents, even on OpenAI models — hand-rolled loops, the Assistants API, and third-party frameworks (LangChain, CrewAI, AutoGen) remain valid choices depending on your needs. Treat it as one well-supported option, not a mandate.

**Does it only work with OpenAI's models?**
No — it is designed to be provider-agnostic at the model layer, so it can work with other providers exposing a compatible API surface. Exactly which providers are supported and how cleanly evolves over time, so verify current compatibility against official docs before committing to a specific non-OpenAI provider.

**How is this different from the Assistants API?**
The Assistants API is a hosted, stateful product (OpenAI manages threads/runs server-side); the Agents SDK is a library you run in your own process, giving you more control over state (via Sessions) and deployment, at the cost of managing more of that infrastructure yourself.

**Is Guardrails in this SDK the same thing as the general "AI guardrails" concept?**
It's a specific, structured implementation of that general concept (see the **Guardrails** skill) — input/output validation functions with pass/fail tripwire semantics wired into the execution loop, rather than a different idea entirely.

**Can I use tools from an MCP server instead of writing function_tool functions?**
Yes, the SDK supports consuming tools exposed by MCP (Model Context Protocol) servers as an alternative or complement to locally-defined function tools — see the **MCP** skill for what that protocol standardizes.

**How do I decide between a handoff and just adding more tools to one agent?**
Reach for a handoff when a sub-task needs meaningfully different instructions, a different tool set, or a different model than the current agent — reach for "just another tool" when the task is a narrow capability the same agent can reason about within its existing instructions.

**Is this SDK suitable for complex, many-agent systems?**
It can be used that way, but its minimalism means you'll write more of the topology and coordination logic yourself compared to a framework like CrewAI that has stronger built-in opinions about multi-agent organization; whether that's a pro or a con depends on how much you want the framework to decide for you.

**How stable is the API surface?**
It's actively evolving; treat exact method names, parameter names, and package names as subject to change between versions, and check current official documentation rather than relying purely on memorized syntax, including the examples on this page.
`,

  "interview-questions": `
### Junior level

1. **What are the core primitives of the Agents SDK?**
   Model answer: An Agent (instructions + model + tools + optional handoffs/guardrails), the Runner (executes the agentic loop), Tools (function-backed capabilities the model can invoke), Handoffs (transfer control to another agent), Guardrails (input/output validation hooks), and Sessions (persisted conversation memory).

2. **How does a function become a callable tool for the model?**
   Model answer: You decorate a plain function (with type-hinted parameters and a docstring); the SDK inspects the signature and docstring to build a JSON-schema tool definition the model can see and choose to invoke, then the Runner executes the actual function when the model requests it.

3. **What happens if an agent has no tools and no handoffs?**
   Model answer: The Runner calls the model once with the instructions and input; since there's nothing to call, the first response is the final answer and the loop ends after one round-trip.

4. **What is a guardrail, and how is it different from just instructing the model to "please refuse off-topic requests"?**
   Model answer: A guardrail is a separate function with its own pass/fail (tripwire) semantics that runs before or after the main agent logic, independently testable and not reliant on the main prompt's own instructions holding up under adversarial input.

### Senior level

5. **Design a multi-agent customer support system using this SDK. What agents would you create and why?**
   Model answer: A triage agent whose only job is classification/routing (kept deliberately dumb and cheap-model), and narrow specialist agents (billing, technical, account) each with only the tools and instructions relevant to their domain — with handoff context deliberately filtered so specialists get a clean briefing, not the full raw transcript, and output guardrails on any specialist whose actions have real-world side effects (e.g., issuing a refund).

6. **When would you choose "agent as tool" over a handoff?**
   Model answer: When the orchestrating agent needs to consult a specialist and continue reasoning with that answer itself (e.g., a report-writer agent calling a research-summary sub-agent), versus a handoff when the specialist should own the rest of the conversation permanently (e.g., routing a ticket to the right team).

7. **How would you bound the cost/latency risk of a production agent with tools?**
   Model answer: Enforce max_turns, set explicit timeouts on both the model client and every tool's external calls, monitor turns-per-run and tool-error-rate, and use a smaller/cheaper model for narrow, low-complexity agents rather than a single large model everywhere.

8. **What's the security risk of trusting tool output as if it were trusted system content?**
   Model answer: A tool that fetches external/untrusted content (web pages, user-authored records) can return text engineered to hijack subsequent model behavior (prompt injection); tool outputs should be treated as untrusted data in the prompt, with guardrails and, where possible, sanitization applied.

9. **How do you test an agentic system without asserting on brittle exact-text output?**
   Model answer: Assert on structural signals — which tools were called, whether a handoff occurred, whether output matches a declared output_type schema — using recorded/replayed model responses for fast deterministic CI, reserving live-model tests for a smaller slower suite, matching the discipline in the **AI Evals** skill.

10. **How does this SDK's philosophy differ from LangChain's or CrewAI's, and when would you pick each?**
    Model answer: This SDK deliberately minimizes the primitive count and expects you to write more glue/topology code yourself in plain control flow; LangChain trades that minimalism for a very large integration/abstraction surface; CrewAI trades it for stronger built-in opinions about role-based multi-agent organization. Pick based on how much you want the framework deciding structure for you versus how much control and inspectability you want to retain.

11. **What's a realistic failure mode of handoff-based routing, and how do you detect it in production?**
    Model answer: A routing cycle (agent A hands off to B, B's instructions send it back to A) or persistent misrouting to the wrong specialist; detect via tracing/monitoring on handoff-destination distribution and turns-per-run, and fix by tightening and making routing criteria mutually exclusive.

12. **Would you recommend building a large, complex multi-agent system entirely on this SDK? Why or why not?**
    Model answer: It's workable, but as agent count and topology complexity grow, teams often end up rebuilding coordination logic that a heavier framework already provides; the honest answer is "it depends on how much of that coordination logic you want to own versus adopt," not a blanket yes or no.
`,

  "coding-questions": `
### Problem 1: A bounded, retried tool-calling agent

Write a function tool for looking up a fictional inventory system that can fail transiently, with retry logic, and wire it into an agent with a max_turns bound.

~~~python
import time
from agents import Agent, Runner, function_tool

class TransientError(Exception):
    pass

def _flaky_inventory_call(sku: str) -> dict:
    # Simulate a real API that occasionally fails transiently.
    import random
    if random.random() < 0.3:
        raise TransientError("upstream timeout")
    return {"sku": sku, "in_stock": True, "quantity": 42}

@function_tool
def check_inventory(sku: str) -> dict:
    """Check stock level for a given SKU, retrying transient failures."""
    last_err = None
    for attempt in range(3):
        try:
            return _flaky_inventory_call(sku)
        except TransientError as e:
            last_err = e
            time.sleep(0.1 * (attempt + 1))  # simple backoff
    # Return a structured error the model can reason about, rather than
    # letting an exception propagate and crash the run.
    return {"sku": sku, "error": f"inventory lookup failed: {last_err}"}

agent = Agent(
    name="InventoryBot",
    instructions="Answer stock questions using check_inventory. If it returns "
                 "an error field, apologize and suggest trying again shortly.",
    tools=[check_inventory],
)

result = Runner.run_sync(agent, "Is SKU ABC-123 in stock?", max_turns=5)
print(result.final_output)
~~~

Complexity/considerations: the retry loop is O(attempts) with linear backoff; the important production lesson is that the tool itself owns retry/backoff logic and always returns a well-formed structure (success or explicit error field) rather than raising, since an uncaught exception inside a tool function would otherwise abort the entire run. Follow-up: how would you distinguish "SKU not found" (a real business answer) from "lookup failed" (an infrastructure problem) so the agent responds differently to each?

### Problem 2: Triage-and-handoff routing with a fallback

Implement a triage agent that routes between two specialists and falls back to a general agent when neither category clearly matches.

~~~python
from agents import Agent, Runner

billing_agent = Agent(
    name="BillingAgent",
    instructions="Handle billing questions: invoices, payment methods, charges.",
)
technical_agent = Agent(
    name="TechnicalAgent",
    instructions="Handle technical/product troubleshooting questions.",
)
general_agent = Agent(
    name="GeneralAgent",
    instructions="Handle anything that isn't clearly billing or technical: "
                 "general questions, feedback, or ambiguous requests.",
)

triage_agent = Agent(
    name="TriageAgent",
    instructions=(
        "Classify the user's message into exactly one category and hand off:\\n"
        "- billing: invoices, payments, charges, refunds\\n"
        "- technical: product not working, errors, bugs\\n"
        "- otherwise: hand off to GeneralAgent\\n"
        "Do not attempt to answer any category yourself."
    ),
    handoffs=[billing_agent, technical_agent, general_agent],
)

def route(user_message: str) -> str:
    result = Runner.run_sync(triage_agent, user_message, max_turns=5)
    return result.final_output

print(route("Why was I charged twice this month?"))
print(route("The app crashes when I upload a photo."))
print(route("Just wanted to say I love the new update!"))
~~~

Complexity/considerations: this is O(1) model round-trips for the common case (one triage call plus one specialist call), but the design's real risk is ambiguous inputs matching more than one category — the explicit "otherwise" fallback prevents an undefined/silent failure mode. Follow-up: how would you log and monitor the distribution of routing decisions to catch a triage-instructions regression before users notice?
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Single agent with one tool

Build an agent that answers questions about a small hardcoded FAQ dataset using a single function_tool that does simple keyword lookup. Deliverable: a CLI script that takes a question as input and prints the agent's answer, with the tool call visible in a printed trace of result.new_items. Skills exercised: Agent/Runner basics, function_tool, reading run results.

### Lab 2 (Intermediate): Multi-agent triage with guardrails

Extend Lab 1 into a triage agent routing between two specialist agents (pick any domain: support, cooking, travel), each with its own tool. Add one input guardrail (reject clearly off-topic requests) and one output guardrail (reject responses containing a fake "internal-only" marker string, simulating a leaked-secret check). Deliverable: a small test suite asserting correct routing for at least 4 representative inputs and correct guardrail triggering for at least 2 adversarial inputs. Skills exercised: Handoffs, Guardrails, structural testing.

### Lab 3 (Advanced): Sessions + structured output + tracing review

Build a stateful multi-turn agent using a SQLite-backed Session, with output_type set to a Pydantic model for at least one specialist agent. Run a 5-turn conversation, then export/inspect the trace to verify: session persistence across turns, structured output validity on every specialist response, and total model round-trips per turn. Deliverable: a short written note describing one thing the trace revealed that wasn't obvious from the final outputs alone. Skills exercised: Sessions, structured outputs, tracing-driven debugging.

### Lab 4 (Production): Dockerized service with monitoring and guardrails

Wrap a 2-3 agent system (triage + specialists) behind a FastAPI endpoint, containerize it per the Deployment section's Dockerfile pattern, add structured logging (agent name, turns taken, guardrail trip status) and a max_turns bound, and load-test it with a scripted set of 20 varied inputs. Deliverable: a short report of latency (p50/p95), turns-per-run distribution, and any guardrail trips observed, plus the Dockerfile and logging code. Skills exercised: production deployment, monitoring, performance measurement, the full production checklist.
`,

  "real-projects": `
### Project 1: Support-ticket triage bot

Build a support bot for a fictional SaaS product with a triage agent routing to billing, technical, and account-management specialists, each backed by realistic (mocked) tool functions (order lookup, account status, known-issue search). Engineering requirements: input/output guardrails, a bounded agent loop, structured logging and tracing export, a small regression test suite asserting correct routing across a labeled set of at least 30 sample tickets, and a written note on where you'd add a human-in-the-loop confirmation step before any action with real consequences (e.g., issuing a refund).

### Project 2: Research-assistant agent with agent-as-tool composition

Build an agent that answers research questions by consulting a sub-agent (wrapped as a tool, not a handoff) that summarizes a set of provided documents, then synthesizes a final answer citing which summaries it drew from. Engineering requirements: structured output_type for both the summarizer and the final answer, a guardrail rejecting answers that don't cite at least one source, and a comparison write-up of latency/cost between this agent-as-tool design and an equivalent single-agent-with-tools design.

### Project 3: Multi-provider agent gateway

Build a small service exposing one HTTP endpoint that routes a request to one of several agents, each configured against a different model/provider (e.g., a fast/cheap model for simple classification, a stronger model for complex synthesis), demonstrating the SDK's provider-agnostic model layer. Engineering requirements: per-agent timeout and retry configuration, cost/latency logging broken out by which model handled each request, and a fallback path if the primary provider for a given agent is unavailable.
`,

  "case-studies": `
### Swarm to Agents SDK: from experiment to production tool

OpenAI's own path — publishing Swarm as an explicitly educational, not-for-production experiment, then later releasing the Agents SDK as its production-ready successor — is itself a useful case study in framework maturity. Lesson: a minimal, well-designed experimental library validating a set of ideas (agents, handoffs) in the open, followed by a hardened production release, is a healthier path than shipping a large, all-things-to-everyone framework from day one; it's worth watching which of a tool's early experimental ideas survive unchanged into the "real" release and which get reworked, since that tells you which ideas were actually load-bearing.

### The Assistants-API-to-Agents-SDK shift

OpenAI maintaining two different agent-building surfaces (the hosted, stateful Assistants API and the in-process Agents SDK) at once, before signaling a preference for the latter plus the Responses API, illustrates a broader lesson for AI engineers: platform vendors iterate quickly on "the right abstraction," and betting an entire production architecture on one specific hosted API surface carries real migration risk. Lesson: prefer designs where your own business logic (agent instructions, tool implementations, guardrail rules) is portable across the vendor's underlying API changes, rather than deeply coupled to one specific hosted product's lifecycle.

### Support-automation adopters converging on triage-plus-specialists

Across many companies building support/helpdesk automation (independent of which specific SDK or framework they use), the triage-agent-plus-specialist-agents pattern recurs so consistently that it has become close to a reference architecture for this problem class. Lesson: when a pattern shows up independently across many unrelated production systems, it's usually because it maps onto a real structural property of the problem (distinct sub-domains needing distinct expertise/tools) rather than being an artifact of one framework's design — a signal worth trusting when designing your own system, regardless of which specific SDK you use to implement it.

### Prompt-injection incidents across the agent-tooling industry

Publicly documented prompt-injection findings against various tool-using agent products (not specific to this SDK, but relevant to any system built with it) consistently show the same root cause: untrusted content reaching the model's context without being treated as untrusted. Lesson: guardrails and tool-output sanitization are not optional polish — they are the direct mitigation for the single most commonly exploited class of agent vulnerability, and should be budgeted into every project's timeline from the start, not added after an incident.
`,

  comparisons: `
| Framework | Design philosophy | Multi-agent story | Best fit |
|---|---|---|---|
| **OpenAI Agents SDK** | Minimal core primitives (Agent, Tool, Handoff, Guardrail, Session), plain code for control flow, provider-agnostic model layer | Handoffs + agent-as-tool; topology is up to you | Teams wanting a thin, inspectable, first-party-supported toolkit and willing to write their own integration glue |
| **LangChain** | Large, opinionated ecosystem of pre-built chains/retrievers/integrations | Supports multi-agent via LangGraph and other add-ons | Teams that want a large pre-built integration surface (many vector stores, loaders, LLM providers) and are comfortable with a bigger abstraction layer |
| **CrewAI** | Role-based multi-agent framework: "crews" of agents with defined roles/goals | Strong built-in opinions about role-based collaboration and task delegation | Teams wanting an out-of-the-box structure for role-based multi-agent workflows without designing the topology themselves |
| **AutoGen** | Conversational multi-agent framework where agents converse with each other (and sometimes humans) to solve tasks | Conversation-driven multi-agent patterns, including human-in-the-loop | Teams whose problem is naturally shaped as agents "discussing" toward a solution, or research-oriented multi-agent experimentation |
| **Hand-rolled loop (no framework)** | Full control, zero framework dependency | Whatever you build yourself | Very small, simple agents where even a thin SDK's primitives are more structure than needed |

### How seniors choose

Seniors generally start from the shape of the problem, not the popularity of the framework: a small number of well-defined specialist domains with fairly linear routing tends to fit the Agents SDK's handoff model comfortably with modest glue code; a problem that needs many pre-built integrations (dozens of data sources, retrievers, vector stores) often benefits more from LangChain's ecosystem breadth; a problem naturally described as fixed roles collaborating on a shared goal fits CrewAI's mental model directly; and a problem that's genuinely about agents negotiating/critiquing each other's work fits AutoGen's conversational pattern best. None of these is categorically "better" — the honest senior answer is almost always "it depends on which parts of the problem you want the framework to have already decided for you, versus which parts you want to control yourself," and prototyping the riskiest part of the design in two candidate frameworks before committing is often worth the half-day it costs.
`,

  "related-technologies": `
- **Tool Calling** — the underlying mechanism (function/tool definitions, structured arguments) that the Agents SDK's Tool primitive is a structured wrapper around; study this first if tool-selection behavior feels like magic.
- **Agent Fundamentals** — the general vocabulary (agent, instructions, tools, loop) this page assumes; read it first if "agent" as a term is new.
- **Guardrails** — the general input/output validation pattern this SDK's Guardrails primitive implements concretely; read for the broader design space (rule-based, model-based, hybrid guardrails) beyond this SDK's specific API.
- **Agent Memory** — the general short-term/long-term memory concepts that Sessions is one concrete implementation of.
- **MCP (Model Context Protocol)** — a protocol for standardizing how tools/resources are exposed to agents across different clients; the Agents SDK can consume MCP servers as a tool source, making the two complementary rather than competing.
- **LangChain** — a much larger, more opinionated framework; useful contrast for understanding what "minimal" buys and costs you here.
- **CrewAI** — a role-based multi-agent framework with stronger built-in topology opinions; useful contrast for the handoff-vs-role-based-crew design tradeoff.
- **AutoGen** — a conversational multi-agent framework; useful contrast when your problem is naturally "agents talking to each other" rather than "routing between specialists."
- **AI Evals** — the discipline of measuring whether an agent is actually working, which the testing/monitoring sections here point back to repeatedly.
`,

  "latest-updates": `
As of this page's knowledge cutoff (early 2026), the Agents SDK is a comparatively young, actively developed project: it launched in March 2025 as the successor to the Swarm experiment, with ongoing iteration on Sessions, tracing integrations, realtime/voice agent support, and deepening alignment with the Responses API as OpenAI's preferred lower-level API surface over the older Chat Completions and Assistants APIs. TypeScript/JavaScript support has matured alongside the original Python release.

Because this is exactly the kind of fast-moving surface where specific method names, package names, and configuration options can change between minor versions, do not treat any code example on this page (or elsewhere) as guaranteed to match the exact current API — verify against the official OpenAI Agents SDK documentation and changelog before shipping production code, and prefer checking the current docs over relying on a memorized syntax snippet, including snippets in this very page.
`,

  "future-roadmap": `
Directionally, expect continued convergence around the Responses API as OpenAI's preferred lower-level interface (with the Agents SDK as the higher-level agent-building layer on top of it), continued investment in first-class multi-agent patterns (handoffs, sessions, tracing) as the primary differentiators versus a hand-rolled loop, and likely continued growth in realtime/voice and MCP-based tool ecosystems as adjacent surfaces mature.

What NOT to bet career time on: memorizing exact current method signatures, since those are exactly the parts most likely to shift between versions. What IS worth investing in, because it transfers regardless of exact API changes: the underlying primitives and their tradeoffs (when a handoff beats agent-as-tool, why guardrails need to be structurally separate from main instructions, why tracing-first debugging beats guessing from final output), the general discipline of testing agentic systems on structural signals rather than exact text, and honest comparative judgment against LangChain, CrewAI, and AutoGen so you can pick the right tool per project rather than defaulting to whichever one you learned first. Given how young and fast-moving this whole category is, the safest bet is understanding agent-system design principles deeply and treating any single SDK's syntax as a currently-convenient implementation detail.
`,

  "cheat-sheet": `
~~~python
# --- Basic agent ---
from agents import Agent, Runner, function_tool

agent = Agent(name="Assistant", instructions="Be helpful and concise.")
result = Runner.run_sync(agent, "Hello!")
print(result.final_output)

# --- Tool ---
@function_tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return "18C, cloudy"

agent = Agent(name="Weather", instructions="Use get_weather when asked.",
              tools=[get_weather])

# --- Handoff (triage pattern) ---
billing = Agent(name="Billing", instructions="Handle billing questions.")
tech = Agent(name="Tech", instructions="Handle technical questions.")
triage = Agent(name="Triage", instructions="Route to billing or tech.",
               handoffs=[billing, tech])

# --- Structured output ---
from pydantic import BaseModel
class Result(BaseModel):
    ok: bool
    reason: str
agent = Agent(name="Checker", instructions="...", output_type=Result)

# --- Guardrail ---
from agents import input_guardrail, GuardrailFunctionOutput

@input_guardrail
async def block_offtopic(ctx, agent, user_input: str):
    return GuardrailFunctionOutput(
        output_info={}, tripwire_triggered="offtopic" in user_input,
    )

# --- Session (multi-turn memory) ---
from agents import SQLiteSession
session = SQLiteSession(session_id="user-1", db_path="chat.db")
Runner.run_sync(agent, "hi", session=session)

# --- Bounded, async run ---
import asyncio
async def main():
    result = await Runner.run(agent, "question", max_turns=8)
asyncio.run(main())
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What are the six core primitives of the Agents SDK? | Agent, Runner, Tool, Handoff, Guardrail, Session |
| What decorator turns a plain function into a callable tool? | function_tool |
| What determines the JSON schema the model sees for a tool? | The function's type hints and docstring |
| What is the key difference between a handoff and agent-as-tool? | A handoff transfers control permanently; agent-as-tool lets the caller keep control and consult |
| What does an input guardrail do? | Validates/checks input before the main agent logic runs, can halt the run via a tripwire |
| What does an output guardrail do? | Validates the final output before it's returned, can halt/reject via a tripwire |
| What does output_type do? | Constrains the agent's final answer to a validated structured (e.g. Pydantic) schema |
| What does a Session provide? | Persisted conversation history across multiple Runner calls |
| What must always be set to avoid a runaway agent loop? | max_turns (a bound on loop iterations) |
| Is the Agents SDK locked to OpenAI models only? | No — it is designed to be provider-agnostic at the model layer |
| What was the Agents SDK's direct predecessor? | Swarm, an educational, non-production experiment |
| What should you always check first when debugging a multi-step agent bug? | The built-in trace of model calls, tool calls, and handoffs |
| Name one framework that is more role-based/opinionated about multi-agent structure. | CrewAI |
| Name one framework that is conversation-driven between agents. | AutoGen |
| What should tool outputs be treated as, from a security standpoint? | Untrusted data injected into the model's context, not trusted system content |
`,

  mcqs: `
1. What is the primary difference between a handoff and wrapping an agent as a tool?
   A) There is no difference
   B) A handoff transfers control of the rest of the conversation; agent-as-tool lets the caller consult and keep control
   C) Handoffs are only available in Python, agent-as-tool only in TypeScript
   D) Agent-as-tool is deprecated in favor of handoffs
   Answer: B — a handoff is a one-directional transfer of control; agent-as-tool is a consult-and-continue pattern.

2. Why does a function tool's docstring matter to the model's behavior?
   A) It doesn't; only the function name matters
   B) The SDK inspects the docstring and type hints to build the JSON schema/description the model uses to decide when and how to call the tool
   C) Docstrings are stripped before reaching the model
   D) Docstrings only affect IDE autocomplete, not runtime behavior
   Answer: B — tool-selection quality depends directly on how clearly the schema/description communicates the tool's purpose and parameters.

3. What happens by default when Agent A hands off to Agent B?
   A) Control returns to Agent A automatically after B responds once
   B) Both agents run in parallel
   C) Control transfers to B for the rest of the run; it does not automatically return to A
   D) The Runner terminates the run immediately
   Answer: C — a handoff is a genuine, generally one-directional transfer of control, not a nested subroutine call.

4. Why is the Agents SDK described as "provider-agnostic"?
   A) It refuses to work with OpenAI models
   B) Its model layer is designed to work with multiple compatible providers, not hard-wired to one vendor
   C) It requires a separate SDK per provider with no shared interface
   D) It only supports open-source models
   Answer: B.

5. What is the main risk of not setting a max_turns bound on an agent run?
   A) The agent will refuse to run at all
   B) The run could loop for an unexpectedly large number of turns, increasing cost and latency unpredictably
   C) Tools become unavailable
   D) Guardrails stop functioning
   Answer: B.

6. How should tool output from an external/untrusted source be treated from a security standpoint?
   A) As trusted system content equivalent to the agent's own instructions
   B) As untrusted data that could contain prompt-injection attempts, requiring the same scrutiny as user input
   C) It cannot be a security risk since it comes from your own tool code
   D) It should be ignored entirely
   Answer: B — tool outputs pulling in external/untrusted content are a known prompt-injection vector.
`,

  "revision-notes": `
The OpenAI Agents SDK is a lightweight, provider-agnostic, first-party framework for building agents out of a small set of primitives: an Agent (instructions, model, tools, optional handoffs/guardrails), a Runner that executes the tool-calling/handoff loop, function-based Tools, Handoffs for transferring control between specialized agents, Guardrails for structured input/output validation, and Sessions for persisted multi-turn memory. It is the production successor to OpenAI's earlier Swarm experiment, released in 2025, and stays deliberately minimal compared to heavier frameworks.

The execution loop is a bounded cycle: call the model, branch on whether it wants to answer, call a tool, or hand off; append results and repeat until a final answer or a max_turns limit. Handoffs transfer control one-directionally to a different agent (contrast with agent-as-tool, which consults a specialist while keeping control), and guardrails run as independently testable functions with tripwire semantics before/after the main logic — a structurally stronger safety mechanism than prompting alone. Tracing is built in, capturing every model call, tool call, handoff, and guardrail evaluation, and should be the first debugging tool reached for rather than reasoning from final output alone.

Production concerns mirror any tool-using system plus a few agent-specific ones: bound the loop (max_turns), set timeouts on both model and tool calls, validate tool inputs/outputs defensively, use a shared session backend for multi-instance deployments, and put guardrails in front of anything user-facing or side-effecting. Security risk concentrates around prompt injection via tool outputs and handoff-based privilege escalation into higher-capability specialist agents; both need structural (not just prompted) defenses.

Honestly positioned, the SDK is one viable framework among several (LangChain for a large integration ecosystem, CrewAI for role-based multi-agent structure, AutoGen for conversational multi-agent patterns), not a definitive standard — and it is young enough that exact API details should always be verified against current docs. What transfers regardless of version churn is the underlying design vocabulary: agents, tools, handoffs, guardrails, sessions, and the discipline of tracing-first debugging and structural (not exact-text) testing.
`,

  "learning-roadmap": `
**Week 1 — Foundations**: Read the **Tool Calling** and **Agent Fundamentals** skills if not already familiar. Build a single agent with one function_tool (Lab 1). Milestone: explain the Runner's loop and reproduce a working single-agent tool call from memory.

**Week 2 — Multi-agent and safety**: Build a triage-plus-specialists system with handoffs; add one input and one output guardrail (Lab 2). Read the **Guardrails** skill in parallel for the general pattern. Milestone: correctly explain when to use a handoff versus agent-as-tool, with a working example of each.

**Week 3 — Memory and structured output**: Add Sessions for multi-turn memory and output_type for structured responses (Lab 3). Read the **Agent Memory** skill for the broader memory-architecture context. Milestone: run a 5-turn stateful conversation and explain what appears in the trace at each step.

**Week 4 — Production hardening**: Containerize a multi-agent service, add monitoring/logging and the full production checklist, and load-test it (Lab 4). Milestone: produce a latency/turns-per-run report and identify at least one bottleneck using tracing data, not guesswork.

**Week 5 — Comparative judgment**: Read the **LangChain**, **CrewAI**, and **AutoGen** skills, and re-implement one of your Week 2-3 projects' core idea (even partially) using one alternative framework to feel the tradeoffs directly rather than reading about them abstractly. Milestone: write a one-paragraph honest recommendation of which framework you'd pick for three different hypothetical projects, and why.

Next platform skill once this roadmap is complete: **MCP** (Model Context Protocol), to see how tool-sharing across agent frameworks is being standardized, followed by **CrewAI** or **AutoGen** for a contrasting multi-agent design philosophy.
`,

  "official-docs": `
- **OpenAI Agents SDK documentation** — the primary reference for current API surface, primitives (Agents, Tools, Handoffs, Guardrails, Sessions, Tracing), and provider-compatibility notes; always the first place to verify exact current syntax given how actively this SDK evolves.
- **OpenAI Agents SDK GitHub repository** — source code, issue tracker, and example applications; reading the Runner's actual implementation is a legitimate and effective way to build an accurate mental model of the loop described in Internal Working.
- **OpenAI Responses API documentation** — the lower-level API surface the SDK increasingly builds on; useful background for understanding what the SDK is abstracting over.
- **OpenAI platform changelog/release notes** — the fastest way to catch breaking changes or new primitives added after this page's knowledge cutoff.
`,

  books: `
- **"Building LLM Applications" (various current titles covering agentic system design)** — look for recent editions specifically covering tool-calling and multi-agent patterns, since book content in this space ages quickly; verify publication date before relying on specific framework syntax.
- **"Designing Machine Learning Systems" by Chip Huyen** — not agent-specific, but its production-ML-systems thinking (monitoring, testing, deployment discipline) transfers directly to agentic systems built with this SDK.
- **"Prompt Engineering for LLMs" (O'Reilly)** — relevant for writing effective agent instructions and tool descriptions, a skill this page leans on heavily without teaching from scratch.
- Given how young this specific SDK is, treat any book claiming deep Agents-SDK-specific coverage with mild skepticism about staying current — prioritize the official docs and GitHub examples for anything syntax-specific, and use books for the surrounding, more stable disciplines (system design, evals, prompting).
`,

  blogs: `
- **OpenAI's own developer blog and cookbook** — first-party examples and design-rationale posts for the Agents SDK are the highest-signal source for understanding intended usage patterns.
- **Engineering blogs of companies publicly discussing agentic support/automation systems** — useful for real production war-stories on triage-and-handoff architectures, even when not using this specific SDK, since the architectural lessons transfer.
- Be selective with tutorial-style blog posts on fast-moving SDKs like this one: check the publication date against the SDK's own changelog before trusting a specific code snippet, since minimalist SDKs in this space have historically iterated their APIs quickly.
`,

  "research-papers": `
Dedicated academic research papers specifically about the OpenAI Agents SDK are thin to nonexistent, since it is an engineering SDK rather than a research artifact — this is an honest gap, not an oversight. The closest foundational reading instead comes from the broader tool-use and multi-agent LLM literature that this SDK's design draws on conceptually:

- **"ReAct: Synergizing Reasoning and Acting in Language Models" (Yao et al., 2022)** — foundational work on interleaving reasoning and tool/action steps, the conceptual ancestor of the tool-calling loop this SDK implements.
- **"Toolformer: Language Models Can Teach Themselves to Use Tools" (Schick et al., 2023)** — foundational work on LLMs learning when and how to invoke external tools, relevant background for understanding why tool descriptions matter so much to model behavior.
- **General multi-agent LLM survey papers** (search current surveys on "LLM-based multi-agent systems") — useful for the broader taxonomy of multi-agent coordination patterns (of which handoffs and agent-as-tool are two concrete engineering instances) beyond what any single SDK's docs will teach.

For anything version-specific about this SDK, prefer the official documentation and changelog over academic papers, which will always lag a fast-moving engineering artifact like this one.
`,

  videos: `
- **OpenAI DevDay talks covering the Agents SDK** — first-party walkthroughs of the design rationale and live examples, generally the highest-signal video source for intended usage patterns; search for the specific DevDay session covering the Agents SDK launch and subsequent updates.
- **OpenAI's own cookbook/tutorial videos (if published) on the Agents SDK** — check the official OpenAI developer YouTube channel for current walkthroughs, since this is exactly the kind of content that gets refreshed as the API evolves.
- **Conference talks on multi-agent system design generally** (from ML engineering conferences) — even when not specific to this SDK, talks covering handoff/routing patterns, guardrail design, and agent evaluation transfer directly to building well-architected systems with it.
- Prioritize videos dated after the Agents SDK's March 2025 release over older Swarm-era content, which will describe a meaningfully different (pre-production) API surface.
`,

  "github-repos": `
- **openai/openai-agents-python** — the official Python SDK source and examples; the canonical reference implementation for everything described on this page.
- **openai/openai-agents-js (or equivalent current TypeScript package name)** — the official TypeScript/JavaScript SDK; check current OpenAI GitHub org listings for the exact current repository name given this ecosystem's pace of change.
- **openai/swarm** — the archived educational predecessor; useful for seeing the minimal handoff pattern in its original, simplest form before production hardening was layered on.
- Community example repositories building support-bot, coding-assistant, or research-agent reference architectures with the SDK — search GitHub for current, actively-maintained examples rather than relying on this page for exact current file layouts, since community example quality and currency vary.
- For contrast, the **langchain-ai/langgraph**, **crewAIInc/crewAI**, and **microsoft/autogen** repositories are worth browsing directly to make the comparisons section's tradeoffs concrete rather than abstract.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Tool design**: Given a vague, one-line tool docstring, rewrite it to clearly specify purpose, parameters, and expected return shape; test whether tool-selection behavior changes with a scripted set of ambiguous inputs.
2. **Handoff topology design**: Given a support scenario with 5 overlapping categories, design a triage instruction set with mutually exclusive routing criteria and a fallback agent; write test cases for at least 2 deliberately ambiguous inputs.
3. **Guardrail authoring**: Write an input guardrail that detects a specific class of off-topic or policy-violating request, and an output guardrail that rejects responses missing a required structural element (e.g., a citation); unit test both in isolation.
4. **Tracing-driven debugging**: Given a (simulated) trace showing an agent looping 6 times before answering, diagnose the likely cause and propose a concrete instructions/tool fix.
5. **Comparative design**: Take one of the Real Projects specs above and sketch (in prose, no code required) how you'd implement the same system in CrewAI instead — identify what the Agents SDK made you decide explicitly that CrewAI would decide for you, and vice versa.

External practice: search for "OpenAI Agents SDK examples" in the official GitHub repository's examples directory for a growing, officially-maintained set of runnable practice scenarios that stay current with the SDK's own release cadence.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client["Client layer"]
        UI["Web / chat / API client"]
    end
    subgraph Service["Your application service"]
        API["API route\n(FastAPI / Express / etc.)"] --> RunnerCall["Runner.run(agent, input, session)"]
        RunnerCall --> Triage["TriageAgent\n(input guardrails)"]
        Triage -->|handoff| Billing["BillingAgent + tools"]
        Triage -->|handoff| Tech["TechnicalAgent + tools"]
        Triage -->|handoff| General["GeneralAgent"]
        Billing --> OutGuard["Output guardrails"]
        Tech --> OutGuard
        General --> OutGuard
    end
    subgraph External["External dependencies"]
        Model[("Model provider API")]
        SessionStore[("Shared session store\n(Redis/Postgres)")]
        ToolAPIs[("Your backend services\n(order, billing, KB search)")]
        TraceExport["Trace export\n(observability stack)"]
    end
    RunnerCall <--> Model
    RunnerCall <--> SessionStore
    Billing --> ToolAPIs
    Tech --> ToolAPIs
    RunnerCall --> TraceExport
    OutGuard --> API
    API --> UI
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((OpenAI Agents SDK))
    Core Primitives
      Agent (instructions + model + tools)
      Runner (executes the loop)
      Tool (function_tool)
      Handoff (transfer control)
      Guardrail (input/output validation)
      Session (persisted memory)
    Execution Loop
      Input guardrails
      Model call
      Tool call branch
      Handoff branch
      Output guardrails
      max_turns bound
    Multi-Agent Patterns
      Triage + specialists
      Handoff vs agent-as-tool
      Context transfer control
    Production Concerns
      Timeouts and retries
      Session backend choice
      Tracing and monitoring
      Guardrail coverage
      Security (prompt injection, privilege escalation)
    Ecosystem
      Tool Calling (foundation)
      Agent Fundamentals (vocabulary)
      Guardrails (general pattern)
      Agent Memory (general pattern)
      MCP (tool interoperability)
    Comparisons
      LangChain (large ecosystem)
      CrewAI (role-based crews)
      AutoGen (conversational multi-agent)
    Honest Positioning
      One viable framework, not the standard
      Fast-moving API surface
      Verify syntax against current docs
~~~
`,
};

export default openaiAgentsSdk;
