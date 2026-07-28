import type { SkillContent } from "../types";

/**
 * PydanticAI — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const pydanticAi: SkillContent = {
  overview: `
PydanticAI is a Python agent framework built by the team behind **Pydantic**, the validation library that underpins FastAPI, most modern Python SDKs, and much of the typed-Python ecosystem. Its core idea is simple to state and important in practice: bring the same type-safety and validation discipline that Pydantic brought to HTTP request/response models into the construction of LLM agents — typed tool definitions, a Pydantic model as the agent's final structured output, and a dependency-injection system deliberately modeled after FastAPI's Depends pattern.

For an AI engineer, PydanticAI matters because it targets a specific, recurring pain: LLM outputs are unstructured text by nature, and the moment you need an agent's output or a tool call's arguments to flow into normal typed application code (a database write, a billing calculation, a downstream API call), you need a validation boundary. Most early agent frameworks bolted structured output on as an afterthought — regex extraction, ad hoc JSON parsing, prompt-engineered "please respond in JSON." PydanticAI instead makes validated structure the default path: you declare a Pydantic model, the agent is bound to it, and every response is validated (and, where supported, re-requested from the model on failure) before your code ever sees it.

Key characteristics: model-agnostic (a single Agent abstraction can target OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, and locally-hosted models through a common interface), type-hint-driven tool definitions (a plain Python function with type-annotated parameters becomes a callable tool schema automatically, the same way FastAPI turns a typed function signature into an OpenAPI operation), a first-class dependency-injection system for wiring in database connections, HTTP clients, and per-request context, native streaming of both plain text and partially-valid structured objects, and a testing story built around deterministic model doubles so agent logic can be unit-tested without hitting a real LLM. It is deliberately lightweight compared to LangChain or LangGraph — closer in spirit to how FastAPI is a thin layer over Starlette and Pydantic than to a full "batteries included" orchestration platform.

As of my knowledge (through early 2026), PydanticAI is younger and moves faster than LangChain — treat specific decorator names, class names, and API signatures in this page as accurate in spirit and structure, but verify exact current syntax against the official docs before shipping, since pre-1.0 frameworks routinely rename things between minor versions.
`,

  history: `
PydanticAI was created by **Samuel Colvin** and the **Pydantic team** (the same group maintaining Pydantic itself and pydantic-settings), first announced publicly in **late 2024**. The stated motivation was almost a mirror image of FastAPI's origin story: FastAPI took Starlette (fast, unopinionated ASGI) and layered Pydantic validation and dependency injection on top to make typed, self-documenting APIs the path of least resistance. PydanticAI applies that same recipe to agent development — take a thin, model-agnostic execution core and layer Pydantic validation, typed tools, and FastAPI-style dependency injection on top so that typed, testable agents are the path of least resistance instead of a bespoke effort per project.

| Period | Milestone |
|--------|-----------|
| 2017–2018 | Pydantic v1 established runtime validation from type hints as a Python norm |
| 2018 | FastAPI ships, using Pydantic for request/response validation — proves the "types as the contract" pattern at framework scale |
| 2023 | Pydantic v2 ships with a Rust validation core (pydantic-core) — 5 to 50x faster validation, a prerequisite for using Pydantic in latency-sensitive agent loops |
| Late 2024 | PydanticAI announced and released in public beta, alongside the team's Logfire observability product |
| 2024–2025 | Rapid iteration: multi-provider model support broadens, streaming of structured (not just text) output matures, dependency-injection and testing utilities (model doubles) solidify |
| 2025 | pydantic-graph (a companion graph/state-machine library) emerges for expressing complex, non-linear multi-step agent workflows more explicitly than a single Agent's tool loop |
| 2025–2026 | Continued convergence toward a 1.0-stable API surface; framework remains explicitly labeled as evolving — check the changelog before upgrading in production |

The through-line across all of this: the Pydantic team keeps re-applying one lesson — validation at the boundary is cheaper to build once, correctly, in a library than to reinvent per project. FastAPI proved it for HTTP; PydanticAI is the same bet for agents.
`,

  "why-it-exists": `
Before frameworks like PydanticAI, teams building LLM agents in Python faced a familiar gap:

- **Raw SDK calls** (OpenAI/Anthropic clients directly): you get full control but must hand-roll the agent loop — calling the model, parsing whatever text or tool-call JSON comes back, deciding whether to call a tool, validating arguments yourself, looping until a final answer, and hoping nothing silently breaks when the model's output drifts from what you expected.
- **Heavier orchestration frameworks** (LangChain, LangGraph): powerful and mature, but historically light on end-to-end type safety — chains often pass around loosely-typed dicts or "Any"-typed objects between steps, so a malformed intermediate result can silently propagate several hops before it surfaces as a confusing runtime error far from its cause.

PydanticAI exists to close that specific gap for teams who already think in Pydantic's terms — which, thanks to FastAPI's dominance, is most professional Python API teams. The goal was: if you already validate your HTTP layer with Pydantic models, you should be able to validate your agent layer the same way, with the same mental model, the same error types, and the same "fail fast at the boundary, trust the type inside" discipline — see the **FastAPI** skill for the request/response validation foundation this idea builds directly on.

The "world before it" for these teams looked like: prompt engineering a JSON schema into the system prompt, calling json.loads on the response, wrapping that in a try/except, and writing a bespoke retry-on-malformed-JSON loop per project — essentially reinventing a worse, ad hoc version of what Pydantic already does well for HTTP payloads.
`,

  "problem-it-solves": `
Concrete pains PydanticAI removes:

- **Unvalidated tool arguments.** Without a framework enforcing it, "the model called a tool with the arguments it felt like" is a real failure mode — a missing field, a string where an int was expected, an out-of-range value. PydanticAI turns your tool function's own type hints into the schema the model is told to follow, and validates incoming arguments against that schema before your function body ever runs.
- **Unvalidated final output.** "Parse the LLM's JSON and hope" becomes "the agent's result is guaranteed to be an instance of your Pydantic model, or you get a raised, catchable validation error (with optional automatic retry prompting the model to correct itself)."
- **Untestable agent logic.** Testing an agent by actually calling an LLM is slow, nondeterministic, and costs money on every CI run. PydanticAI ships model doubles (deterministic stand-ins for a real model) precisely so agent control flow — which tool gets called, what the final shape looks like — can be asserted in milliseconds, offline, in CI.
- **Hard-to-wire dependencies.** Passing a database connection, an HTTP client, or a per-request user ID into tool functions used to mean global state, closures, or manual threading of context. The dependency-injection system makes this an explicit, typed, testable parameter instead.
- **Framework lock-in to one model provider.** Because the Agent abstraction is model-agnostic, swapping OpenAI for Anthropic or a local model is a one-line change rather than a rewrite.

What PydanticAI deliberately does **not** solve:

- It is not a retrieval/RAG framework — it does not manage vector stores, chunking, or document ingestion pipelines; see the **LlamaIndex** skill for that layer, and compose the two (LlamaIndex for retrieval, PydanticAI for the agent loop and structured output around it).
- It does not automatically optimize your prompts or pipeline structure — see the **DSPy** skill for that different bet (compiling/optimizing prompts programmatically rather than hand-writing them).
- It is not (by itself) a durable-execution or long-running-workflow engine in the way LangGraph's persisted graph state is — pydantic-graph adds some structured-workflow capability, but it is younger and thinner than LangGraph's graph/checkpointing story.
- It does not replace the underlying concept of constrained/JSON-schema generation that model providers implement server-side — see the **Structured Outputs** skill for that broader mechanism, which PydanticAI leans on and wraps.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what problem PydanticAI solves and why type safety matters specifically at the agent/tool/output boundary, not just in ordinary application code.
2. Define an Agent bound to a model, a result type (Pydantic model), and one or more tools.
3. Write type-annotated tool functions and understand how PydanticAI turns their signatures into schemas the model can call.
4. Use PydanticAI's dependency-injection system to pass a database connection, HTTP client, or request-scoped context into tools in a testable way.
5. Stream both plain-text and structured (partially-valid) output from a running agent.
6. Write deterministic unit tests for agent logic using model doubles, without calling a real LLM.
7. Compose multiple agents, including one agent invoking another as a tool (multi-agent delegation).
8. Compare PydanticAI honestly against LangChain, LangGraph, and hand-rolled SDK usage, and articulate when its lighter-weight, type-first approach is the right call versus when a more mature ecosystem wins.
9. Identify the production concerns (retries, timeouts, cost tracking, observability) an agent framework does not remove and must still be engineered around.
`,

  prerequisites: `
- **Required**: solid Python fundamentals — functions, type hints, classes, async/await basics (see the **Python** skill). PydanticAI is async-first at its core, even though it offers synchronous convenience wrappers.
- **Required**: Pydantic v2 model basics — defining a BaseModel, field types, validators. See the **FastAPI** skill, which already covers Pydantic v2 validation in depth as the foundation for request/response models; this page builds directly on that rather than re-deriving it.
- **Strongly recommended**: the **Tool Calling** skill and the **Agent Fundamentals** skill — PydanticAI is an implementation of the agent-loop and function-calling concepts those pages cover generically (think-act-observe cycles, tool schemas, planning), not a new concept from scratch.
- **Helpful**: the **Structured Outputs** skill, for the underlying JSON-schema-constrained generation mechanism most providers expose and that PydanticAI's result-type validation is built on top of.
- **Helpful for comparison**: passing familiarity with **LangChain** and **LangGraph** makes the Comparisons section land better, since PydanticAI is frequently evaluated against them.

Dependency chain on this platform: **Python** → **FastAPI** (Pydantic validation, DI pattern) → **Tool Calling** / **Agent Fundamentals** (the concepts) → **PydanticAI** (a concrete, type-first implementation) → **LangChain** / **LangGraph** (broader orchestration ecosystems for comparison).
`,

  "beginner-concepts": `
### What an Agent is

An Agent is PydanticAI's central object: it binds together a model (which LLM to call), an optional set of tools (functions the model may invoke), and an optional result type (a Pydantic model the final answer must validate against). Creating one and running it is the smallest useful unit of the framework.

~~~python
from pydantic_ai import Agent

# The model string identifies provider:model — PydanticAI is model-agnostic.
agent = Agent(
    "openai:gpt-4o",
    system_prompt="You are a concise, helpful assistant.",
)

result = agent.run_sync("What is the capital of France?")
print(result.output)   # "Paris." — plain text by default, no result_type given
~~~

run_sync is a convenience wrapper around the underlying async run — reach for it in scripts and simple examples; production code should use the async agent.run(...) directly (see Intermediate Concepts).

### Giving the agent a structured result type

The distinguishing move: instead of parsing free text, declare a Pydantic model and hand it to the agent as result_type. The agent's final answer is now guaranteed (or a validation error is raised) to be an instance of that model.

~~~python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class CityFact(BaseModel):
    city: str
    country: str
    population_millions: float = Field(gt=0)

agent = Agent(
    "openai:gpt-4o",
    result_type=CityFact,
    system_prompt="Extract structured facts about the city the user asks about.",
)

result = agent.run_sync("Tell me about Tokyo.")
fact: CityFact = result.output       # a real, validated CityFact instance
print(fact.city, fact.population_millions)   # normal Python attribute access — no json.loads anywhere
~~~

This is the whole thesis of the framework in one example: the "does this look like valid JSON" problem becomes "is this a valid CityFact" — a question Pydantic already answers extremely well, with clear error messages when it is not.

### A first tool

A tool is just a Python function with type-annotated parameters, registered on the agent with a decorator. PydanticAI reads the signature (and the docstring, for the description the model sees) to build the schema the model is offered.

~~~python
from pydantic_ai import Agent

agent = Agent("openai:gpt-4o", system_prompt="Answer using the weather tool when relevant.")

@agent.tool_plain
def get_weather(city: str) -> str:
    """Return a short current-weather description for a city."""
    # In real code this would call a weather API — here, a stub for illustration.
    fake_data = {"paris": "15C, cloudy", "tokyo": "22C, sunny"}
    return fake_data.get(city.lower(), "unknown city")

result = agent.run_sync("What is the weather in Tokyo?")
print(result.output)   # the model calls get_weather("Tokyo"), then answers using the result
~~~

tool_plain is for tools that need no injected dependencies and no run context; the plain agent.tool decorator (covered next, once dependency injection is introduced) is for tools that do.

### Why this matters: the validation boundary

An LLM's raw output is text. Without a framework enforcing structure, a subtly malformed tool call (a string where a number was expected, a missing required field) or a malformed final answer can silently corrupt downstream logic — the exact same class of bug FastAPI prevents at the HTTP boundary by validating request bodies against a Pydantic model before your handler runs. PydanticAI applies that identical discipline one layer earlier: at the boundary between "text the model produced" and "typed Python data your application logic consumes."
`,

  "intermediate-concepts": `
### Dependency injection: the deps_type pattern

Real tools need collaborators — a database connection, an HTTP client, a request-scoped user ID — without resorting to global state or closures captured at import time. PydanticAI's answer is deliberately close to FastAPI's Depends: declare a dataclass (or any type) describing what a run needs, parameterize the Agent with it, and PydanticAI hands your tools a RunContext carrying those deps.

~~~python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

@dataclass
class Deps:
    db: "DatabaseClient"          # your own DB client type
    user_id: int

agent = Agent(
    "openai:gpt-4o",
    deps_type=Deps,
    system_prompt="Answer questions about the current user's orders.",
)

@agent.tool
async def recent_orders(ctx: RunContext[Deps], limit: int = 5) -> list[str]:
    """Return the user's most recent order summaries."""
    # ctx.deps gives typed, IDE-autocompleted access to whatever was injected
    rows = await ctx.deps.db.fetch_orders(ctx.deps.user_id, limit=limit)
    return [f"Order #{r.id}: {r.total} on {r.date}" for r in rows]

# Deps are constructed once per run/request and passed in explicitly —
# no global connection pool reached into from inside the tool.
async def handle_request(db: "DatabaseClient", user_id: int, question: str) -> str:
    result = await agent.run(question, deps=Deps(db=db, user_id=user_id))
    return result.output
~~~

This is the same shape as a FastAPI route function receiving Depends(get_db) — the collaborator is passed in, not reached for globally, which is exactly what makes it swappable with a fake in tests.

### Async-first execution

agent.run(...) is the real entry point; run_sync wraps it for scripts. In a production async web service (FastAPI, naturally), you should always await agent.run(...) directly so the event loop is not blocked while waiting on the model API — see the **Python** skill's async section for why a blocking call inside an async context stalls every other in-flight request.

~~~python
from fastapi import FastAPI
from pydantic_ai import Agent

app = FastAPI()
agent = Agent("openai:gpt-4o", result_type=CityFact)

@app.post("/city-facts")
async def city_facts(query: str) -> CityFact:
    result = await agent.run(query)   # non-blocking; the event loop serves other requests meanwhile
    return result.output
~~~

### Streaming plain text

For a chat-style UI, streaming tokens as they arrive is standard. PydanticAI exposes an async streaming context manager.

~~~python
async def stream_answer(question: str) -> None:
    async with agent.run_stream(question) as stream:
        async for chunk in stream.stream_text(delta=True):
            print(chunk, end="", flush=True)   # print incremental deltas as they arrive
~~~

delta=True yields only the newly-produced text since the last chunk (what you want for a typing-indicator UI); the default yields the accumulated text so far.

### Multiple tools and tool selection

An agent can be given several tools; the model decides which (if any) to call based on the user's message and each tool's description.

~~~python
@agent.tool_plain
def convert_currency(amount: float, from_code: str, to_code: str) -> float:
    """Convert an amount between two ISO currency codes using a fixed demo rate table."""
    rates = {("USD", "EUR"): 0.92, ("EUR", "USD"): 1.09}
    return round(amount * rates.get((from_code.upper(), to_code.upper()), 1.0), 2)

@agent.tool_plain
def get_weather(city: str) -> str:
    """Return current weather for a city."""
    ...

# The model reads both tool descriptions and picks the right one (or none) per turn.
~~~

Good tool descriptions are prompt engineering: a vague description leads the model to call the wrong tool or the right tool with wrong arguments. Write docstrings as if briefing a new engineer, not as a formality.

### Validators on the result type

Because result_type is an ordinary Pydantic model, everything you already know about Pydantic validators applies — field constraints, custom validators, cross-field checks — and a failing validation is a real, catchable exception in your code.

~~~python
from pydantic import BaseModel, field_validator

class SentimentResult(BaseModel):
    label: str
    confidence: float

    @field_validator("label")
    @classmethod
    def label_must_be_known(cls, v: str) -> str:
        allowed = {"positive", "negative", "neutral"}
        if v.lower() not in allowed:
            raise ValueError(f"label must be one of {allowed}")
        return v.lower()
~~~

PydanticAI can be configured to feed a validation failure back to the model as an error message and ask it to retry, rather than surfacing the exception straight to your caller — a meaningful reliability improvement over a hard failure on the first malformed response.
`,

  "advanced-concepts": `
### Multi-agent composition: an agent as a tool

Because a tool is just a callable, an entire Agent can be wrapped as a tool of another agent — the standard pattern for delegation, where a top-level "orchestrator" agent hands sub-tasks to specialist agents.

~~~python
from pydantic_ai import Agent, RunContext

research_agent = Agent("openai:gpt-4o", system_prompt="Summarize facts about a topic concisely.")
writer_agent = Agent("openai:gpt-4o", system_prompt="Turn research notes into a short blog paragraph.")

@writer_agent.tool_plain
async def research(topic: str) -> str:
    """Delegate fact-gathering to the research agent and return its summary."""
    sub_result = await research_agent.run(topic)
    return sub_result.output

final = writer_agent.run_sync("Write a paragraph about the history of the telescope.")
print(final.output)
~~~

This composes cleanly because each agent is independently testable (swap either one for a model double) and independently configurable (different models, different system prompts, different cost/latency tradeoffs per sub-task — e.g. a cheap fast model for research, a stronger model for final writing).

### Streaming structured output

Streaming becomes more interesting once the output is a Pydantic model rather than plain text, because a partial JSON object is not, by definition, fully valid against the schema until the last token arrives. PydanticAI's structured streaming exposes progressively-more-complete partial objects (fields fill in as they stream) and a final, fully-validated object once generation completes.

~~~python
async def stream_structured(question: str) -> None:
    async with agent.run_stream(question) as stream:
        async for partial in stream.stream_structured(debounce_by=0.1):
            # 'partial' is a best-effort, possibly-incomplete view of the result model —
            # useful for progressively rendering a UI as fields arrive.
            print(partial)
        final = await stream.get_output()   # the fully validated result_type instance
~~~

debounce_by throttles how often partial snapshots are emitted — important in production so a UI is not re-rendered on every single token.

### Retries and validation-triggered re-prompting

When a tool call's arguments or the final result fail Pydantic validation, PydanticAI can automatically construct a corrective message (including the validation error) and ask the model to try again, up to a configured retry limit, rather than failing the whole run on the first bad attempt. This is a meaningfully different reliability posture from "parse once, throw on failure" — it treats validation failure as recoverable model error, the same way you might retry a flaky network call, but semantically informed (the model is told exactly what was wrong).

### Usage limits and cost control

Agent runs can be bounded by usage limits (for example, a cap on total tokens or on the number of model requests within a single run) so that a runaway tool-calling loop — an agent that keeps calling tools without converging on a final answer — cannot silently consume unbounded API spend. This matters more for agents than for a single-shot completion call precisely because the agent loop can, by construction, make an unbounded number of model round trips.

### pydantic-graph for non-linear workflows

For workflows that are not well described by "one agent looping over tool calls until it produces a result" — multi-step processes with branching, human-in-the-loop pauses, or explicit state machines — the companion **pydantic-graph** library lets you define nodes and edges explicitly, with typed state passed between them. It is younger and less battle-tested than LangGraph's graph/checkpointing model (see Comparisons); reach for a plain Agent first, and only reach for pydantic-graph when the control flow genuinely stops being "loop until done."

### Model-agnosticism as an architectural property

Because the Agent's model is specified as a provider:model string (or an explicit model object), swapping providers is usually a one-line change — valuable for cost/latency experiments (try a cheaper model for a sub-agent), for provider outages (fail over to a second provider), and for local-model development against Ollama-hosted models during testing without touching production code paths.
`,

  "internal-working": `
At a high level, running an agent executes a bounded loop: send the conversation (system prompt + message history + tool schemas) to the model, inspect what came back, and either return a validated final answer or execute a requested tool call and loop again.

~~~mermaid
flowchart TB
    A["agent.run(user_message)"] --> B["Build request: system prompt + history + tool schemas + result schema"]
    B --> C["Call the model provider API"]
    C --> D{"What did the model return?"}
    D -->|"tool call requested"| E["Validate tool arguments against\nthe tool's Pydantic-derived schema"]
    E -->|valid| F["Execute the tool function\n(with injected deps via RunContext)"]
    E -->|invalid| G["Construct corrective message\nwith the validation error"]
    G --> B
    F --> H["Append tool result to message history"]
    H --> B
    D -->|"final answer / matches result_type"| I["Validate final output against result_type"]
    I -->|valid| J["Return AgentRunResult to caller"]
    I -->|invalid, retries remain| G
~~~

Step by step:

1. **Schema construction**: on agent creation (and refreshed per run), PydanticAI inspects each registered tool's function signature and each field of result_type, converting Python type hints into a JSON Schema the model provider's function-calling / structured-output mechanism understands — the same JSON-schema-constrained-generation concept covered generically in the **Structured Outputs** skill.
2. **The request**: the agent assembles the full conversation — system prompt, prior turns, and the tool/result schemas — and calls the underlying provider SDK. This is where model-agnosticism lives: an adapter layer translates PydanticAI's internal representation into each provider's specific API shape (OpenAI's tool-call format differs from Anthropic's, for instance).
3. **Tool-call validation**: if the model requests a tool call, its arguments (raw JSON from the model) are parsed and validated against the tool's derived Pydantic schema before the actual Python function is invoked — the model can produce malformed arguments, but your function body never sees them unvalidated.
4. **Execution and loop-back**: the tool function runs (with deps injected via RunContext), its return value is serialized back into the conversation as a tool result, and the loop repeats — the model sees the tool's output and decides whether to call another tool or produce a final answer.
5. **Final validation**: once the model signals a final answer, it is validated against result_type. A failure here (or during tool-argument validation) can trigger an automatic corrective retry, up to a configured limit, rather than an immediate hard failure.

This loop is exactly the "agent loop" concept from the **Tool Calling** and **Agent Fundamentals** skills — think, act (call a tool), observe (the tool's result), repeat until done — with PydanticAI's specific contribution being that every arrow into and out of Python code in that loop is a validated Pydantic model rather than a raw dict.
`,

  architecture: `
Two levels matter: how a single agent run is structured internally, and how a production application should be structured around one or more agents.

### Single-run architecture

~~~mermaid
flowchart LR
    subgraph AgentRun["One agent.run() call"]
        SP["System prompt"] --> Ctx["Conversation context"]
        Hist["Message history"] --> Ctx
        Ctx --> Model["Model adapter\n(OpenAI / Anthropic / Gemini / local)"]
        Tools["Registered tools\n(typed schemas)"] --> Model
        RT["result_type schema"] --> Model
        Model --> Loop["Tool-call / final-answer loop"]
        Deps["Injected deps (RunContext)"] --> Loop
        Loop --> Out["Validated AgentRunResult"]
    end
~~~

### Application architecture

The natural layered layout mirrors a well-structured FastAPI service, because PydanticAI is explicitly designed to sit inside one:

~~~
myagentservice/
├── pyproject.toml
├── src/myagentservice/
│   ├── api/                # FastAPI routers calling agents; request/response Pydantic models
│   ├── agents/             # Agent definitions: system prompts, result types, tool registrations
│   │   ├── support_agent.py
│   │   └── research_agent.py
│   ├── deps/               # deps_type dataclasses + factories (DB clients, HTTP clients)
│   ├── tools/              # tool function implementations, kept separate from agent wiring
│   ├── models/             # Pydantic result types shared across agents/api
│   └── core/               # config, provider credentials, logging, Logfire/OpenTelemetry setup
└── tests/
    ├── test_agents.py       # agent logic tests using model doubles (TestModel/FunctionModel)
    └── test_tools.py        # tool functions tested as plain Python functions, deps faked
~~~

Rules that keep this maintainable: tool implementations should be plain, dependency-injected functions that are independently unit-testable without an agent at all; agents should be thin wiring (system prompt + tool registration + result type), not where business logic lives; and result types belong in a shared models/ module so the same Pydantic model can be reused as both an agent's result_type and, if relevant, a FastAPI response_model — the natural synergy of using PydanticAI and FastAPI together in one production service.
`,

  "data-flow": `
Tracing one request through an agent, a tool call, and a validated structured output — the shape of a typical production call:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as FastAPI endpoint
    participant Agent as PydanticAI Agent
    participant Model as LLM provider
    participant Tool as Tool function
    participant DB as Database

    Client->>API: POST /support-answer {question}
    API->>Agent: await agent.run(question, deps=Deps(db, user_id))
    Agent->>Model: request (system prompt + history + tool schemas + result schema)
    Model-->>Agent: tool call requested: lookup_order(order_id="123")
    Agent->>Agent: validate tool arguments against schema
    Agent->>Tool: lookup_order(ctx, order_id="123")
    Tool->>DB: fetch order row
    DB-->>Tool: order data
    Tool-->>Agent: tool result (typed return value)
    Agent->>Model: request again, tool result appended to history
    Model-->>Agent: final answer (candidate JSON for result_type)
    Agent->>Agent: validate final output against result_type
    Agent-->>API: AgentRunResult (validated Pydantic model)
    API-->>Client: 200 OK, JSON response (same model, via FastAPI response_model)
~~~

The two validation points — tool-argument validation before Tool is called, and result-type validation before the response leaves Agent — are exactly where PydanticAI earns its keep: a malformed order_id or a malformed final answer is caught and (optionally) retried inside this diagram, never silently reaching the Database or the Client.
`,

  "production-usage": `
### Project setup

PydanticAI is installed like any Python package (uv add pydantic-ai, or with provider-specific extras, e.g. pydantic-ai-slim with only the providers you need, to keep dependency footprints small in production images — see the **Python** skill's uv-based workflow).

### Configuration

Provider credentials (API keys) should come from environment variables or a secrets manager, validated at startup — the same pattern as any FastAPI service's config layer (see **FastAPI** and pydantic-settings). Model identifiers ("openai:gpt-4o", etc.) are best kept in config rather than hardcoded in agent definitions, so swapping models for cost or latency reasons does not require a code change.

### Agent lifetime and reuse

An Agent object is relatively expensive to construct conceptually (system prompt, tool registrations) but is designed to be created once at module/app startup and reused across requests — not recreated per request. Per-request state (the user's question, injected deps like a request-scoped DB session) is passed into agent.run(...), not baked into the Agent object itself. This mirrors how a FastAPI app builds routers once and injects per-request dependencies via Depends.

### Timeouts and outbound calls

Every call to a model provider is a network call and needs a timeout, exactly like any other outbound HTTP call in a Python service — an agent stuck waiting forever on a hung provider request is a production incident. Configure timeouts at the HTTP-client layer the provider SDK uses, and set an overall wall-clock budget for a full agent.run(...) call (including all tool round trips), since a multi-tool-call agent loop can otherwise run far longer than a single completion request would.

### Observability

The Pydantic team's own **Logfire** product integrates directly with PydanticAI (unsurprising, given common authorship) to trace agent runs, tool calls, and token usage; PydanticAI also supports standard OpenTelemetry instrumentation for teams using a different observability stack (see the Monitoring section).

### Running behind FastAPI

The dominant production pattern: a FastAPI service exposes an endpoint, awaits agent.run(...) inside the (already async) handler, and returns the validated result_type instance directly as a FastAPI response_model — the two frameworks share a type system, so the same Pydantic model can define both the agent's output contract and the HTTP response contract with zero translation code.
`,

  "industry-examples": `
PydanticAI is younger than most frameworks with well-documented public case studies, so treat the following as reasoned inference from its design and public positioning rather than confirmed large-scale deployment reports — verify current adoption claims against the official site and blog before citing specifics in an interview.

- **Pydantic Labs / Pydantic itself**: the maintaining company uses PydanticAI as the reference implementation for how they believe typed agent development should look, and dogfoods it inside their own Logfire observability product's AI features.
- **FastAPI-heavy teams generally**: organizations that already standardized on FastAPI and Pydantic for their API layer are the natural early-adopter profile — the pitch is explicitly "you already know this validation model, now use it for agents" — so teams building internal LLM-powered features on top of an existing FastAPI service are a strong fit.
- **Startups building customer-support or internal-tool agents**: the lightweight, type-first framework is well suited to small teams that want structured output and tool calling without adopting a large orchestration platform's full surface area.
- **Data/ML platform teams doing structured extraction**: turning unstructured documents or user input into a validated Pydantic model (rather than freeform chat) is one of PydanticAI's cleanest use cases, and is a common internal-tooling pattern at companies already using Pydantic elsewhere in their data platform.

The honest pattern to notice: PydanticAI's adoption story so far is strongest among teams for whom "we already use Pydantic and FastAPI everywhere" is true, rather than teams evaluating agent frameworks from a blank slate — see Comparisons for how that shapes the choice against LangChain/LangGraph.
`,

  "best-practices": `
1. **Keep tool functions small and independently testable** — a tool should be a plain, well-typed function you could unit-test without an Agent at all; put business logic there, not in the agent wiring.
2. **Write tool docstrings as model-facing documentation**, not internal comments — the docstring becomes the description the model uses to decide when and how to call the tool; vague docstrings cause wrong tool selection.
3. **Always declare a result_type for anything downstream code consumes** — free-text output should be reserved for pure chat UIs; anywhere the output feeds business logic, validate it.
4. **Model deps explicitly with a dataclass, not global state** — pass database/HTTP clients through deps_type and RunContext so tests can substitute fakes cleanly.
5. **Set usage limits on every agent run in production** — bound total tokens or tool-call rounds so a non-converging loop cannot silently run away on cost or latency.
6. **Reuse Agent instances across requests**; construct once at startup, pass per-request state through run(...) arguments.
7. **Set explicit timeouts on the underlying HTTP clients** used by model providers — the same non-negotiable as any outbound call in a Python service.
8. **Test agent control flow with model doubles (TestModel/FunctionModel)** before writing a single integration test against a real provider — real-model tests are for a small, separate, explicitly-marked suite.
9. **Keep result types in a shared models module** so the same Pydantic model can serve as both an agent's result_type and a FastAPI response_model, avoiding duplicate schema definitions.
10. **Log and trace every agent run** (via Logfire or OpenTelemetry) including tool calls and token usage — agent runs are multi-step and opaque without this; debugging blind is much harder than debugging a single completion call.
11. **Treat validation-triggered retries as a tunable, not a given** — a high retry limit can silently multiply cost and latency on a persistently confused model; monitor retry rates as a signal that your prompt or schema needs work.
12. **Pin your PydanticAI version and read the changelog before upgrading** — as a fast-evolving, pre-1.0-in-spirit framework, minor version bumps can change decorator names or defaults.
`,

  "anti-patterns": `
### Skipping result_type "because the model is usually right"

~~~python
# WRONG: free text parsed downstream with string matching / regex
agent = Agent("openai:gpt-4o", system_prompt="Extract the order status as text.")
result = agent.run_sync("Status of order 123?")
status = "shipped" if "shipped" in result.output.lower() else "unknown"   # brittle, silently wrong

# RIGHT: let Pydantic own the contract
class OrderStatus(BaseModel):
    status: str
    order_id: str

agent = Agent("openai:gpt-4o", result_type=OrderStatus, system_prompt="Extract order status.")
result = agent.run_sync("Status of order 123?")
status = result.output.status   # validated, typed, and raises clearly if malformed
~~~

### Reaching into global state instead of using deps

~~~python
# WRONG: a module-level connection, reached into from inside the tool —
# untestable without a real DB, and unsafe if the connection is not request-scoped.
db_conn = connect_to_prod_db()

@agent.tool_plain
def lookup(order_id: str) -> str:
    return db_conn.query(order_id)

# RIGHT: inject it, so tests can substitute a fake
@agent.tool
async def lookup(ctx: RunContext[Deps], order_id: str) -> str:
    return await ctx.deps.db.query(order_id)
~~~

### Other production-grade anti-patterns

- **No usage limits on agentic loops** — an agent that keeps calling tools without converging can silently rack up token cost; always bound rounds/tokens per run.
- **Testing exclusively against a real LLM** — slow, flaky, expensive CI, and nondeterministic assertions; use model doubles for control-flow tests, reserve real-model tests for a small separate suite.
- **One giant tool that does everything** — mirrors the "god function" anti-pattern; small, single-purpose tools with clear descriptions let the model choose correctly far more reliably.
- **Recreating the Agent object per request** — wastes setup cost and obscures the fact that per-request state belongs in run(...) arguments, not the Agent constructor.
- **Blindly trusting a validation-retry loop to eventually succeed** — without a retry cap, a persistently malformed response can loop indefinitely; always configure and monitor a maximum retry count.
- **Hardcoding the model string throughout the codebase** — defeats the whole point of model-agnosticism; keep it in config.
`,

  performance: `
### Measure first

Before optimizing anything, instrument the agent run itself: total wall-clock time, number of model round trips, tokens per round trip, and time spent inside each tool call. Logfire (or OpenTelemetry spans around agent.run and each tool) gives you this breakdown directly rather than guessing.

### The optimization hierarchy for agent latency (apply in order)

1. **Reduce round trips first.** Every tool call is a full model request-response cycle; an agent that needs three tool calls to answer is roughly three times the latency of one. Combine tools where sensible, or give the model enough context up front to need fewer lookups.
2. **Pick the cheapest model that clears your quality bar per step.** A multi-agent pipeline (see Advanced Concepts) can use a fast/cheap model for simple sub-tasks (classification, extraction) and reserve an expensive frontier model only for the step that needs it.
3. **Stream whenever a human is waiting.** Perceived latency drops enormously when text (or partial structured output) streams in, even if total completion time is unchanged — always prefer run_stream over run for interactive surfaces.
4. **Cache deterministic tool results.** If a tool call is a pure function of its arguments (a lookup that will not change within a request), cache it (functools.lru_cache for in-process, Redis for cross-request) to avoid redundant work — this is standard Python performance practice, not PydanticAI-specific, but it matters more here because a wasted tool call also costs an extra model round trip to process its result.
5. **Validate cheaply.** Pydantic v2's Rust core (pydantic-core) makes validation itself fast (single-digit microseconds to low milliseconds for typical models) — validation overhead is essentially never the bottleneck in an agent run; the model API call dominates by orders of magnitude.
6. **Parallelize independent sub-agent calls.** If a top-level agent's tools include calls to two independent sub-agents whose results do not depend on each other, run them concurrently with asyncio.gather rather than sequentially awaiting each one.

### What NOT to bother optimizing

Do not spend time micro-optimizing tool-function Python code before confirming (via tracing) that it is a meaningful fraction of total latency — in almost every real agent, the dominant cost is model API round-trip time, not local computation.
`,

  scalability: `
PydanticAI itself does not introduce a distinct scaling model beyond "it is a Python library running inside whatever process serves your requests" — the scaling story is really the scaling story of the surrounding service (typically FastAPI), plus a few agent-specific considerations.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["FastAPI pod 1\n(agents defined at module load)"]
    LB --> API2["FastAPI pod N"]
    API1 & API2 --> Provider["LLM provider API\n(external, rate-limited)"]
    API1 & API2 --> DB[("Database\nvia injected deps")]
    API1 & API2 --> Cache[("Redis\ntool-result cache")]
~~~

### Horizontal scaling

Because an Agent object holds no per-request mutable state (state flows through run(...) arguments and deps), it is safe to run many stateless service replicas behind a load balancer exactly as you would any async FastAPI service — see the **FastAPI** skill's scalability section, which applies directly.

### The real bottleneck: the model provider, not PydanticAI

At scale, the binding constraint is almost always the LLM provider's own rate limits (requests per minute, tokens per minute) rather than anything in your Python process. Design for this explicitly: implement backoff/retry against provider rate-limit errors, consider multiple provider accounts or a routing layer across providers for very high volume, and track provider-side latency/error rates as a first-class metric.

### Known bottlenecks and answers

| Bottleneck | Answer |
|------------|--------|
| Provider rate limits under load | Backoff + jitter on 429s; queue and shed load gracefully; consider multiple provider keys/accounts |
| Multi-tool-call agents multiplying latency | Reduce round trips (see Performance); cache deterministic tool results |
| A tool doing slow synchronous work inside an async agent | Make the tool truly async, or run_in_executor — a blocking tool call stalls the whole event loop exactly like any other blocking call in async Python |
| Cost scaling linearly with traffic | Route cheaper sub-tasks to cheaper models in a multi-agent pipeline; cache; set usage limits |
| Unbounded agentic loops under load | Enforce per-run usage limits so a pathological loop cannot both blow latency and blow cost budget simultaneously |
`,

  security: `
### The agent-specific attack surface

1. **Prompt injection via tool results or retrieved content.** If a tool fetches content from an untrusted source (a webpage, a user-uploaded document, a third-party API response) and that content is fed back into the model's context, it can contain instructions attempting to hijack the agent's behavior ("ignore previous instructions and..."). Treat all tool-returned content as untrusted input to the model, the same way you'd treat untrusted input to a template engine; never let a tool result alone grant a capability (e.g. "call this other tool" or "reveal these secrets") without your own authorization check outside the model's control.
2. **Overly-permissive tools.** A tool that can execute arbitrary SQL, shell commands, or file writes based on model-supplied arguments is a direct path to injection or destructive action if the model is manipulated (via prompt injection or simple error) into misusing it. Scope tools narrowly (a lookup_order tool that only reads one row by ID, not a run_sql tool that accepts arbitrary queries) and validate/allow-list arguments as strictly as any user-facing API input — see the **SQL Injection** skill for the underlying mechanism a poorly-scoped tool can reintroduce.
3. **Deps leaking excessive access.** Because deps are shared across all tools in a run, a deps object carrying a database connection with broader privileges than any individual tool needs violates least privilege; scope the injected client's permissions to what the tool set actually requires.
4. **Result-type validation is not a security boundary by itself.** Pydantic validation ensures shape and basic constraints, not semantic safety — a validated CityFact can still contain a plausible-looking but hallucinated population figure. Validation catches malformed structure, not false content; do not conflate the two.
5. **Secrets in system prompts or logs.** Provider API keys and any injected secrets must come from environment variables or a secrets manager (see the **Secrets Management** skill), never hardcoded in a system prompt string, and observability tooling (Logfire/OpenTelemetry) should be configured to redact sensitive fields from traced tool arguments and results.

### Supply chain

As with any Python dependency, audit pydantic-ai and its provider-integration extras for known CVEs in CI, and pin versions via a lockfile given how quickly the framework itself evolves.

See the dedicated **OWASP Top 10**, **SQL Injection**, and **Secrets Management** skills for the general security disciplines an agent's tools must still follow.
`,

  testing: `
### Deterministic model doubles are the headline feature

PydanticAI ships utilities for standing in for a real model call during tests — the single most important production practice this framework enables, because it lets agent control-flow logic be unit-tested at the speed and determinism of ordinary Python, with zero API cost and zero network flakiness.

~~~python
import pytest
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

def test_agent_returns_expected_shape():
    agent = Agent("openai:gpt-4o", result_type=CityFact)

    # TestModel is a deterministic stand-in: no network call, no API key needed.
    with agent.override(model=TestModel()):
        result = agent.run_sync("Tell me about a city.")

    # TestModel produces a schema-valid dummy instance by default —
    # enough to assert the agent WIRES TOGETHER correctly (tools registered,
    # result_type enforced) without asserting on specific model wording.
    assert isinstance(result.output, CityFact)
~~~

### Asserting on tool-call behavior with FunctionModel

For tests that need to assert a specific tool was called with specific arguments — the actual control-flow logic you care about — a function-backed model double lets you script the model's simulated behavior precisely.

~~~python
from pydantic_ai.models.function import FunctionModel

def fake_model_logic(messages, tools):
    # Inspect the conversation/tools and decide what the "model" does this turn —
    # here, always request the weather tool with a fixed argument.
    return {"tool_call": "get_weather", "args": {"city": "Paris"}}

def test_agent_calls_weather_tool():
    with agent.override(model=FunctionModel(fake_model_logic)):
        result = agent.run_sync("What's the weather?")
    assert "15C" in result.output   # get_weather's real stub logic still runs
~~~

### Guarding against accidental real-API calls in CI

A configurable setting (commonly surfaced as an "allow model requests" flag) can be disabled in the test environment so that any test which forgets to override the model with a double fails loudly and immediately, rather than silently making a real, billed API call in CI.

### Testing tools in isolation

Because tools are plain functions (optionally async, optionally taking a RunContext), the most valuable and cheapest tests often skip the Agent entirely: construct a fake RunContext/deps object and call the tool function directly, asserting on its return value — ordinary unit testing, no framework machinery involved.

### The senior testing doctrine for agents

- Test **agent wiring and control flow** (which tool gets called, does the result validate) with model doubles — fast, deterministic, run on every commit.
- Test **tool business logic** as plain Python unit tests, independent of any agent.
- Reserve a **small, separately-marked suite of real-model integration tests** (often run less frequently, e.g. nightly, not on every PR) to catch drift in actual model behavior, prompt quality, and provider-specific quirks that no mock can simulate.
- Track **validation-retry rates and tool-call-success rates** from real usage as an ongoing signal — this is closer to production monitoring than unit testing, but it is the feedback loop that tells you whether your result_type and tool schemas are well-designed.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the AgentRunResult's full message history**, not just the final output — result.all_messages() (or equivalent) shows every model request, tool call, and tool result in the run, which is almost always where a confusing final answer traces back to.
2. **Reproduce with a model double first.** If behavior seems wrong, write a FunctionModel-backed test that scripts the exact conversation turn where things went sideways — this isolates whether the bug is in your tool code, your schema, or genuinely model behavior.
3. **Check tool docstrings and schemas** when the model calls the wrong tool or supplies odd arguments — this is usually a prompt-engineering problem (an ambiguous description), not a code bug; tighten the docstring and re-test.
4. **Log or trace every round trip** (via Logfire or OpenTelemetry spans) in any environment where the bug is not locally reproducible — production agent bugs are frequently "the model behaved differently than in my dev testing," which requires seeing the real conversation that happened.
5. **Check validation error details directly** — a Pydantic ValidationError carries a precise, field-by-field description of what failed and why; read it before assuming the model's answer was "just wrong" — often one field was subtly malformed while the rest was fine.
6. **Isolate provider-specific behavior.** If a bug reproduces on one provider (say, Anthropic) but not another (OpenAI) for the same agent, suspect a provider-adapter edge case (different tool-call formats, different structured-output support) rather than your own code.

### Common "why did the agent do that" causes

- The model called the wrong tool: usually an ambiguous or overlapping tool description.
- The final output failed validation repeatedly and exhausted retries: usually a result_type that is too strict/oddly shaped for what you're actually asking the model to produce, or a system prompt that does not clearly explain the target shape.
- The agent "hung": check for a tool doing blocking synchronous work inside an async context, or a missing timeout on the provider HTTP client.
`,

  monitoring: `
Production visibility for an agent-based service rests on the same three pillars as any service, plus agent-specific signals.

### Structured tracing of agent runs

~~~python
import logfire
from pydantic_ai import Agent

logfire.configure()          # Pydantic team's own observability product; instruments PydanticAI directly
logfire.instrument_pydantic_ai()

agent = Agent("openai:gpt-4o", result_type=CityFact)
# Every run, tool call, and validation outcome is now traced automatically —
# spans include tokens used, latency per round trip, and tool arguments/results.
~~~

For teams standardized on a different stack, PydanticAI also supports OpenTelemetry instrumentation directly, so spans can flow into whatever backend (Datadog, Honeycomb, Grafana Tempo) the rest of the service already uses.

### Metrics worth tracking specifically for agents

- **Tokens per run** (prompt + completion), broken down by model — the direct cost driver.
- **Tool-call count per run** and **round trips per run** — a rising trend signals either a genuinely harder task mix or a prompt/schema regression causing more back-and-forth.
- **Validation-retry rate** (final output or tool arguments) — a leading indicator that a result_type or tool schema needs simplification, or that a system prompt needs to explain the target shape more clearly.
- **Per-tool latency and error rate** — a slow or failing tool (e.g. a flaky downstream API) directly inflates total agent latency and should be monitored like any other service dependency.
- **Provider error rate** (rate limits, timeouts, provider-side 5xx) — track separately per provider if using more than one.

### RED-style dashboarding

Track Rate (runs/sec), Errors (validation failures exhausting retries, provider errors), and Duration (p50/p95/p99 of full agent.run() calls, not just the model call) per agent — alert on symptoms users feel (elevated p99 latency, elevated final-validation-failure rate), not just raw causes.
`,

  deployment: `
### Deployment shape

An agent-based service typically deploys exactly like any FastAPI service — see the **FastAPI** skill's deployment section for the full Dockerfile pattern (multi-stage, uv-managed, non-root user). The agent-specific additions are configuration and dependency footprint.

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
# pydantic-ai-slim with only the provider extras you actually use keeps the image small
RUN uv sync --frozen --no-install-project --no-dev
COPY src/ src/
RUN uv sync --frozen --no-dev

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
# Provider API keys injected at runtime via the orchestrator's secret store, never baked into the image
USER appuser
EXPOSE 8000
CMD ["uvicorn", "myagentservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters (in addition to the general FastAPI reasoning): pinning the provider-extra dependencies you actually use (rather than installing every supported provider SDK) keeps the image smaller and reduces the CVE-scanning surface; secrets are injected at runtime specifically because provider API keys must never be baked into an image layer.

### Configuration by environment

- Model identifiers and provider credentials come from environment/secrets, not hardcoded strings, so staging can point at a cheaper model while production points at the real one.
- Usage limits (max tokens/rounds per run) should be configurable per environment — looser in a dev sandbox, strict in production.
- Health endpoints (/healthz, /readyz) should NOT themselves call the LLM provider on every check (cost and latency); a readiness check might verify configuration is loaded and credentials are present without making a live call.

### Rollout considerations specific to agents

Because agent behavior (which tools get called, how well outputs validate) depends on the model provider and prompt, treat a model version bump or a system-prompt change with the same caution as a code change to business logic — roll out gradually, watch validation-retry rate and tool-call patterns, and keep the previous configuration one rollback away.
`,

  "production-checklist": `
Before a PydanticAI-based agent service takes real traffic:

- [ ] result_type declared for every agent whose output feeds downstream logic (not just chat UIs)
- [ ] Tool functions are narrowly scoped, individually unit-tested, and take deps via RunContext (no global state)
- [ ] Usage limits configured on every agent run (max tokens and/or max tool-call rounds)
- [ ] Timeouts set on the provider HTTP client and an overall wall-clock budget on agent.run()
- [ ] Model identifiers and provider API keys come from config/secrets, never hardcoded
- [ ] Agent objects constructed once at startup and reused; per-request state flows through run() arguments
- [ ] Tests cover agent control flow with TestModel/FunctionModel (no real API calls in the default CI suite)
- [ ] A small, separately-marked suite of real-model integration tests exists and runs on a schedule, not every PR
- [ ] Tracing/observability wired (Logfire or OpenTelemetry) covering tokens, tool calls, and validation outcomes
- [ ] Validation-retry rate and tool-call-error rate are dashboarded and alertable
- [ ] Tool inputs treated as untrusted where they touch SQL, shell, or file operations — scoped and validated as strictly as any user-facing API input
- [ ] Any content fetched by a tool from an external/untrusted source is treated as untrusted model input (prompt-injection awareness)
- [ ] Secrets never appear in traced tool arguments/results — observability configured to redact sensitive fields
- [ ] Dependency versions (pydantic-ai and provider extras) pinned via lockfile; changelog reviewed before upgrading
- [ ] Rollback plan exists for model/prompt changes, treated with the same caution as a business-logic code change
`,

  "common-mistakes": `
1. **Skipping result_type for anything beyond a toy demo** — free-text parsing downstream reintroduces exactly the fragility PydanticAI exists to remove.
2. **Writing vague tool docstrings** — the model reads the docstring to decide when/how to call a tool; a vague one causes wrong tool selection or malformed arguments, which then looks like "the model is bad" when it is actually "the description was ambiguous."
3. **Forgetting that agent.run is async** and blocking the event loop by using run_sync inside an already-async FastAPI handler — this stalls other in-flight requests exactly like any blocking call in async Python.
4. **No usage limits**, leading to a non-converging tool-calling loop quietly consuming large amounts of tokens before anyone notices.
5. **Testing only against a real LLM**, making the test suite slow, flaky, and expensive, and discouraging engineers from running it locally.
6. **Reaching into global state from inside a tool** instead of using deps_type/RunContext — makes tools untestable in isolation and couples them to process-wide setup order.
7. **Treating validation success as content correctness** — a validated Pydantic model can still contain hallucinated but well-shaped data; validation checks structure, not truth.
8. **One tool doing too much** — a single "do everything" tool is harder for the model to use correctly and harder for you to test than several narrow tools.
9. **Hardcoding a specific model string throughout the codebase**, losing the model-agnosticism that is one of the framework's actual selling points.
10. **Assuming API stability across versions** — because PydanticAI evolves quickly, upgrading without reading the changelog can silently change defaults (e.g. retry behavior, streaming semantics).
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| ValidationError on final output | Model produced JSON that does not match result_type (missing/wrong-typed field) | Read the error's field-level detail; simplify result_type or clarify the system prompt about the target shape; rely on configured retry |
| ValidationError on tool arguments | Model supplied malformed arguments to a tool | Tighten the tool's parameter types/docstring; check for an overly ambiguous tool description |
| Agent seems to hang / very slow | Blocking synchronous call inside an async tool; missing timeout on provider HTTP client | Make the tool truly async or use run_in_executor; set explicit timeouts |
| Wrong tool called, or no tool called when expected | Ambiguous or overlapping tool docstrings; too many similar tools | Rewrite docstrings to be unambiguous; consider merging or removing overlapping tools |
| Real API call happens unexpectedly during tests | Forgot to override the model with TestModel/FunctionModel in a test | Use agent.override(model=...) in every test; enable the "disallow real model requests" setting in the test environment |
| Unexpectedly high token/cost usage | No usage limits configured; non-converging tool-calling loop | Set max tokens/rounds per run; inspect message history for repeated tool calls |
| Streaming yields nothing until the very end | Using stream_structured on a schema where the provider does not support incremental structured output well, or debounce misconfigured | Check provider support for structured streaming; fall back to stream_text for that provider, or adjust debounce_by |
| Provider adapter behaves differently than expected | Provider-specific tool-call/structured-output format edge case | Check provider-specific notes in the PydanticAI changelog/docs; isolate with a FunctionModel test to confirm it is provider-specific |
`,

  faqs: `
**Q: Do I need to already use FastAPI to use PydanticAI?**
No, but the two are designed to compose naturally, and if you already use FastAPI, PydanticAI's dependency-injection and validation model will feel immediately familiar — see the **FastAPI** skill for the shared foundation.

**Q: Is PydanticAI a replacement for LangChain or LangGraph?**
Not for every use case. It is a lighter-weight, type-first alternative that appeals strongly to teams already invested in Pydantic/FastAPI; LangChain and LangGraph have more mature ecosystems, more integrations, and (for LangGraph specifically) a more battle-tested durable-execution/graph model for complex, long-running workflows. See Comparisons for the honest tradeoffs.

**Q: Can I use PydanticAI without a structured result_type, just for chat?**
Yes — result_type is optional; without it, agent.run(...).output is plain text, the same as calling a model directly, just with the tool-calling and dependency-injection machinery available if you want it.

**Q: How does streaming work when the output is a structured object, not text?**
The framework can emit progressively-more-complete partial views of the result model as tokens arrive, and a fully-validated final object once generation completes — see Advanced Concepts for the mechanism and its debouncing option.

**Q: How do I avoid hitting a real LLM API in my test suite?**
Use the built-in model doubles (TestModel for a generic schema-valid stand-in, FunctionModel for scripted behavior) via agent.override(...), and enable the setting that disallows real model requests in your test environment so any test that forgets to override fails loudly.

**Q: Which model providers does it support?**
A broad and growing set (OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, locally-hosted models via Ollama, among others) through a common Agent interface — check the current docs for the exact supported list, since new providers are added frequently.

**Q: Is PydanticAI stable enough for production?**
Teams are using it in production, particularly those already standardized on Pydantic/FastAPI, but treat it as a fast-evolving, pre-1.0-in-spirit framework: pin versions, read changelogs before upgrading, and expect some API surface to still shift.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is PydanticAI, in one sentence?* A Python agent framework built by the Pydantic team that brings Pydantic's type-safety and validation discipline (as already seen in FastAPI) to agent tool calls and structured outputs.
2. *What is result_type used for?* A Pydantic model the agent's final output must validate against, so downstream code receives a typed, validated object instead of raw text.
3. *How does a Python function become a tool the model can call?* PydanticAI reads the function's type-annotated signature and docstring, converting them into a schema the model provider's tool-calling mechanism understands; a decorator (e.g. tool_plain or tool) registers it on the Agent.
4. *What is RunContext for?* It is passed into tools that need injected dependencies (deps_type), giving typed access to things like a database client or per-request user ID without global state.
5. *Why would you use a model double like TestModel instead of a real LLM in tests?* Speed, determinism, zero cost, and no network flakiness — it lets you assert on agent control flow (which tool ran, does output validate) without calling a real API.

**Senior:**

6. *Walk through what happens end to end when an agent's tool call has malformed arguments.* The raw arguments are validated against the tool's derived Pydantic schema before the function runs; on failure, PydanticAI can construct a corrective message with the validation error and re-prompt the model, up to a configured retry limit, rather than crashing or passing bad data into the function.
7. *How would you compose two agents so one delegates to the other?* Wrap the sub-agent's run(...) call inside a tool function registered on the top-level agent — since a tool is just a callable, an entire Agent can be one. Discuss independent testability and independent model choice per sub-agent (cheap model for a simple sub-task, stronger model for the final step).
8. *How does structured streaming differ from plain-text streaming, and why is it harder?* A partial JSON structure is not fully valid against its schema until the last token arrives, so structured streaming exposes best-effort partial views of the object as it fills in, plus a final fully-validated instance at completion — versus plain-text streaming, which can emit raw deltas with no schema constraint at all.
9. *What production risk is unique to agentic (multi-tool-call) loops versus a single completion call, and how do you mitigate it?* An agent can make an unbounded number of model round trips if it never converges on a final answer, multiplying both latency and cost; mitigate with configured usage limits (max tokens/rounds) per run, monitored via retry/round-trip metrics.
10. *How would you evaluate PydanticAI versus LangGraph for a complex, branching, human-in-the-loop workflow?* PydanticAI's core Agent is best suited to a relatively linear think-tool-observe loop; for genuinely non-linear control flow with persisted state and resumable execution, LangGraph's graph/checkpointing model is more mature, though PydanticAI's companion pydantic-graph library is emerging to address some of this — weigh ecosystem maturity against the type-safety and lighter footprint tradeoff.
11. *What security risk does an agent's tool layer introduce that a plain API endpoint does not?* Prompt injection via untrusted content flowing back into the model through a tool result, which can attempt to manipulate subsequent model behavior; mitigation is scoping tools narrowly, never letting a tool result alone authorize a sensitive action, and treating fetched content as untrusted input.
12. *Why is Pydantic v2's Rust core relevant to using Pydantic for agent validation, specifically?* Validation happens on the hot path of every tool call and every final answer in an agent loop; a slow validator would add meaningful overhead across many round trips, whereas pydantic-core's speed (microseconds to low milliseconds typically) keeps validation from ever being the bottleneck relative to the model API call itself.
`,

  "coding-questions": `
### 1. A structured extraction agent with a custom validator

~~~python
from pydantic import BaseModel, field_validator
from pydantic_ai import Agent

class Invoice(BaseModel):
    vendor: str
    amount_cents: int
    currency: str

    @field_validator("currency")
    @classmethod
    def currency_must_be_iso(cls, v: str) -> str:
        allowed = {"USD", "EUR", "GBP"}
        if v.upper() not in allowed:
            raise ValueError(f"currency must be one of {allowed}")
        return v.upper()

extraction_agent = Agent(
    "openai:gpt-4o",
    result_type=Invoice,
    system_prompt=(
        "Extract invoice details as structured data. "
        "Always express amount_cents as an integer number of cents, never a float dollar amount."
    ),
)

def extract_invoice(raw_text: str) -> Invoice:
    """Production wrapper: catches validation failures after retries are exhausted
    and re-raises with context, rather than leaking a raw framework exception."""
    try:
        result = extraction_agent.run_sync(raw_text)
    except Exception as exc:   # PydanticAI raises a specific exception type in practice — check current docs
        raise ValueError(f"could not extract a valid invoice from input: {exc}") from exc
    return result.output
~~~

Complexity/behavior notes: the amount_cents-as-integer instruction in the system prompt is doing real work — without it, the model would plausibly return a float dollar amount, which the schema (declared as int) would then either coerce oddly or reject, an example of how the system prompt and the schema must agree on the target shape. Follow-up: add a cross-field validator ensuring amount_cents is positive, and discuss what happens on repeated validation failure (retries exhausted).

### 2. Tool with dependency injection, tested without a real agent

~~~python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

@dataclass
class Deps:
    inventory: dict[str, int]   # simplified in-memory store for the example

agent = Agent("openai:gpt-4o", deps_type=Deps, system_prompt="Answer stock questions.")

@agent.tool
async def check_stock(ctx: RunContext[Deps], sku: str) -> int:
    """Return the current stock count for a SKU, or 0 if unknown."""
    return ctx.deps.inventory.get(sku, 0)

# --- Test: bypass the Agent/model entirely, test the tool as a plain function ---
class FakeRunContext:
    def __init__(self, deps: Deps) -> None:
        self.deps = deps

async def test_check_stock_known_sku():
    ctx = FakeRunContext(Deps(inventory={"WIDGET-1": 42}))
    # check_stock.function accesses the underlying plain function on most versions of the
    # framework — verify the exact attribute against current docs, since this is an
    # implementation detail that has shifted between releases.
    result = await check_stock.function(ctx, "WIDGET-1")
    assert result == 42
~~~

Discussion points: this test never touches the Agent or a model at all — it directly validates the tool's business logic, which is the cheapest and fastest layer of the testing pyramid for an agent-based service. Follow-up: how would you additionally test that the Agent calls check_stock with the right sku when asked "do you have WIDGET-1 in stock?" (answer: a FunctionModel-scripted test asserting the tool call, as shown in the Testing section).

### 3. Bounding an agentic loop with usage limits

~~~python
from pydantic_ai import Agent
from pydantic_ai.usage import UsageLimits   # exact import path may shift — check current docs

agent = Agent("openai:gpt-4o", system_prompt="Research and answer using available tools.")

async def answer_bounded(question: str) -> str:
    """Run the agent with a hard cap on total requests, so a non-converging
    tool-calling loop cannot silently run away on cost or latency."""
    result = await agent.run(
        question,
        usage_limits=UsageLimits(request_limit=5, total_tokens_limit=20_000),
    )
    return result.output
~~~

Complexity/behavior notes: request_limit bounds the number of model round trips (including tool-call turns), and total_tokens_limit bounds cumulative token spend across the whole run; exceeding either raises an exception your calling code should catch and handle (e.g. return a partial answer or an explicit "could not complete" response) rather than let the exception propagate as an unhandled 500. Follow-up: how would you monitor how often this limit is actually hit in production, and what would a rising rate of limit-exceeded errors tell you about your prompt or tool design?
`,

  "hands-on-labs": `
### Lab 1 — Structured extraction agent (beginner, ~1h)
Build an agent with result_type set to a Pydantic model describing a recipe (name, ingredients list, steps, servings). Feed it unstructured recipe text and verify the output validates. Add a field_validator that rejects a servings count of zero or less. Skills: Agent basics, result_type, Pydantic validators.

### Lab 2 — Tool-using support agent with dependency injection (intermediate, ~2h)
Build an agent with two tools (order lookup, refund-eligibility check) backed by an in-memory fake "database" injected via deps_type/RunContext. Write unit tests for each tool function directly (no Agent involved), then write a FunctionModel-scripted test asserting the agent calls the right tool for a given question. Skills: dependency injection, tool design, testing pyramid for agents.

### Lab 3 — Multi-agent delegation with streaming (advanced, ~3h)
Build a two-agent pipeline: a research agent (cheap/fast model) and a writer agent (stronger model) where the writer's tool calls the research agent. Expose the writer's final answer via run_stream so a client sees text stream in. Add usage limits to both agents. Skills: multi-agent composition, streaming, cost-aware model selection.

### Lab 4 — Production-ready FastAPI + PydanticAI service (production, ~4h)
Wrap Lab 2's support agent in a FastAPI endpoint, sharing the same Pydantic model as both result_type and response_model. Add structured logging/tracing (Logfire or OpenTelemetry), a usage-limit configuration read from environment, a /healthz endpoint that does not call the LLM, and a multi-stage Dockerfile with uv. Load-test the endpoint and record p95 latency including tool-call round trips. Skills: the whole production section, end to end, and the FastAPI+PydanticAI synergy directly.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Typed customer-support agent service** — A FastAPI service exposing a support agent with tools for order lookup, refund eligibility, and FAQ retrieval (composing with a small **LlamaIndex**-backed retrieval tool for the FAQ piece), all deps-injected and independently unit-tested, with a shared Pydantic model as both result_type and API response_model, usage limits, and full tracing. Demonstrates: the complete PydanticAI production pattern, and honest composition with a retrieval framework where each tool does one thing well.

2. **Multi-agent research-and-write pipeline** — An orchestrator agent delegating to a research sub-agent and a fact-checking sub-agent (each on a different, cost-appropriate model), streaming the final structured article (title, sections, sources) to a client, with retry-on-validation-failure and per-sub-agent cost tracking. Demonstrates: multi-agent composition, streaming structured output, cost-aware model routing.

3. **Deterministic agent test-suite generator** — A small internal tool that takes an existing agent's tool set and system prompt and generates a battery of FunctionModel-scripted tests exercising each tool-selection path, plus a report of validation-retry rates observed in a sample of real traffic logs. Demonstrates: deep understanding of the framework's testing model and a genuinely useful production tool (agent regression testing) most teams build ad hoc.

Each project: src layout, uv, full type hints, a two-tier test suite (fast model-double tests on every commit, a small real-model suite on a schedule), CI via GitHub Actions, and a README with an architecture diagram showing the agent(s), tools, and deps. The engineering discipline around the agent — not just "it calls an LLM" — is what differentiates this from a weekend demo.
`,

  "case-studies": `
### FastAPI's own history as the design template
FastAPI's success came from making typed, validated, self-documenting APIs the path of least resistance rather than an opt-in discipline — teams adopted it not because validation was impossible before, but because it was previously always a manual, easy-to-skip effort. PydanticAI is explicitly betting on the same dynamic for agents: make validated tool calls and structured output the default, not a bolt-on. Lesson: the biggest wins in developer tooling often come from changing defaults, not adding new capabilities.

### Pydantic v2's Rust core as a prerequisite, not a footnote
Pydantic v2's rewrite of its validation core in Rust (pydantic-core), shipping 5 to 50x faster validation than v1, is what makes "validate every tool call and every final answer" a reasonable default rather than a latency tax — an agent loop that calls a tool multiple times per run would have felt validation overhead far more acutely on the older, pure-Python validator. Lesson: a framework's viability at a new layer (agents) can depend on a performance investment made for an entirely different layer (HTTP APIs) years earlier.

### The "same company, two products" observability play
The Pydantic team also built Logfire and ships first-class PydanticAI integration for it — a deliberate strategy of pairing a new framework with matching observability from day one, rather than leaving teams to bolt on tracing themselves. Lesson: for an agent framework specifically, opaque multi-step execution makes observability not a nice-to-have but close to a prerequisite for production confidence, and vendors increasingly ship both together.

### The broader industry pattern this page's Comparisons section reflects
Across LangChain, LangGraph, and PydanticAI, each framework's differentiator traces back to what its maintainers already knew how to build well: LangChain's breadth from being the first mover with the most integrations, LangGraph's durable-execution strength from applying graph/state-machine thinking to agent workflows, and PydanticAI's type-safety focus from Pydantic/FastAPI's decade of validation expertise. Lesson for choosing a framework: ask what the maintaining team's core competency was before this product, not just what the marketing page claims.
`,

  comparisons: `
| Dimension | PydanticAI | LangChain | LangGraph | DSPy | Hand-rolled SDK calls |
|-----------|-----------|-----------|-----------|------|----------------------|
| Core idea | Type-safe agents/tools/output via Pydantic | Broad LLM app toolkit, huge integration surface | Graph-based, stateful, durable agent orchestration | Programmatically optimize prompts/pipelines | Full control, zero framework abstraction |
| Type safety | First-class, Pydantic models throughout | Historically loose (dict-heavy); improving | Typed state graphs, more structure than LangChain chains | Not its focus — optimization is the focus | Entirely your own discipline |
| Maturity/ecosystem | Younger, fast-evolving, smaller integration list | Most mature, largest integration ecosystem | Mature for its niche (stateful/durable workflows) | Mature within its niche (prompt optimization) | N/A — no ecosystem, just provider SDKs |
| Best fit | Teams already on Pydantic/FastAPI wanting typed agents/output | Teams needing broad integrations quickly, many prebuilt components | Complex, long-running, branching, human-in-the-loop workflows needing persisted state | Teams wanting to programmatically improve prompt/pipeline quality rather than hand-tune | Small, simple, tightly-controlled use cases |
| Dependency injection | Built-in, FastAPI-Depends-like | Less central to its design | Present via graph state, different model | Not its focus | Manual |
| Testing without a real LLM | Built-in model doubles (TestModel/FunctionModel) | Possible but less standardized | Possible but less standardized | Different testing concerns (optimization metrics) | Fully manual |
| Weight/footprint | Lightweight, closer to a thin library | Heavier, broader surface area | Moderate-to-heavy (graph engine, checkpointing) | Moderate | Minimal |

**How seniors choose**: pick PydanticAI when the team already thinks in Pydantic/FastAPI terms and the workload is a relatively linear think-tool-observe loop where validated structured output matters a lot; pick LangChain when you need the widest range of prebuilt integrations quickly and can tolerate a looser type story; pick LangGraph when the workflow is genuinely non-linear, long-running, or needs durable/resumable state with human-in-the-loop steps; pick DSPy when the actual problem is "our prompts/pipeline need systematic optimization," a different axis entirely from any of the above; and reach for hand-rolled SDK calls only for the smallest, simplest integrations where a framework's overhead (learning curve, dependency footprint) is not worth it. In practice, mature AI platforms often use more than one of these for different sub-systems — PydanticAI for a typed agent layer, LlamaIndex for retrieval feeding it, and LangGraph for the one workflow that genuinely needs durable multi-step state.
`,

  "related-technologies": `
- **FastAPI** — the Python API framework whose Pydantic-validation and Depends-style dependency-injection patterns PydanticAI directly extends into the agent layer; see this platform's FastAPI skill for the Pydantic v2 validation foundation this page builds on.
- **Pydantic (v2)** — the underlying validation library; understand BaseModel, field validators, and the Rust-backed pydantic-core performance story before going deep on PydanticAI.
- **Structured Outputs** — the broader, provider-level concept of JSON-schema-constrained generation that PydanticAI's result_type and tool schemas are built on top of.
- **Tool Calling** — the generic function-calling concept (schemas, argument validation, model-decides-when-to-call) that PydanticAI's tool system is one concrete implementation of.
- **Agent Fundamentals** — the generic think-act-observe agent-loop concept that PydanticAI's Agent.run implements concretely, with typed validation layered in.
- **LangChain** — the most mature, broadest-integration LLM application framework; the natural comparison point for "do I need more breadth than PydanticAI currently offers."
- **LangGraph** — graph-based, stateful, durable agent orchestration; the natural comparison point for genuinely non-linear or long-running agent workflows.
- **DSPy** — a fundamentally different bet: optimizing prompts/pipelines programmatically rather than hand-writing them; complementary rather than competing with PydanticAI's type-safety focus.
- **LlamaIndex** — the data/retrieval framework for RAG; commonly composed with PydanticAI by using LlamaIndex for retrieval and exposing it as a typed tool inside a PydanticAI agent.
- **Logfire / OpenTelemetry** — observability layers PydanticAI integrates with directly for tracing agent runs, tool calls, and token usage.

On this platform, the natural learning path: **FastAPI** → **Tool Calling** / **Agent Fundamentals** → **PydanticAI** → **LangChain** / **LangGraph** (broader comparison) → **LlamaIndex** (for the retrieval layer a real agent usually needs) → **DSPy** (a different optimization angle worth understanding even if you don't adopt it).
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — treat specific API names, decorator signatures, and import paths in this page as accurate in structure and intent, but verify exact current syntax against the official PydanticAI documentation and changelog before shipping, since this is a genuinely fast-evolving, pre-1.0-in-spirit framework where minor releases have historically renamed or restructured parts of the API.

- **Broadening provider support**: the list of supported model providers (OpenAI, Anthropic, Gemini, Groq, Mistral, Cohere, Ollama for local models, among others) has grown steadily since the late-2024 initial release; check the current docs for the authoritative, up-to-date list.
- **Structured streaming maturity**: partial/structured streaming (progressively-valid views of a result_type as it generates) has matured significantly from an early feature into a more reliable, debounce-configurable capability.
- **pydantic-graph**: the companion graph/state-machine library for expressing non-linear, multi-step agent workflows continues to develop as a lighter-weight alternative to reaching for LangGraph on workflows too complex for a single Agent's tool loop — still younger and less battle-tested than LangGraph's checkpointing model as of my knowledge.
- **Testing utilities (TestModel/FunctionModel) and the "disallow real model requests" safeguard** have solidified as the standard recommended pattern for CI, reflecting how central deterministic testing is to the framework's value proposition.
- **Observability**: first-class Logfire integration alongside general OpenTelemetry support has remained a consistent focus, reflecting the shared maintainership between PydanticAI and Logfire.
- **Ecosystem context that matters more than any single PydanticAI feature**: Pydantic v2's ongoing performance work (pydantic-core) benefits every layer of PydanticAI's validation-heavy design "for free" as the underlying library improves.

Given the pace of change, treat any specific version number, exact decorator name, or import path you see cited elsewhere (including in this page) as something to double-check against the live docs rather than something to memorize as permanent.
`,

  "future-roadmap": `
Where PydanticAI is plausibly heading, reasoned from its design trajectory and stated positioning (hedge accordingly, since this is a young, fast-moving project):

1. **Convergence toward a stable 1.0 API surface.** As adoption grows among teams already on Pydantic/FastAPI, expect the core Agent/tool/result_type API to stabilize, with breaking changes concentrated in newer, less-mature areas (structured streaming edge cases, pydantic-graph) rather than the fundamentals covered in Beginner/Intermediate Concepts.
2. **pydantic-graph maturing as the answer to complex workflows.** If the team continues investing here, it could become a genuinely credible lighter-weight alternative to LangGraph for teams that want typed, non-linear workflows without adopting a heavier framework — but this is speculative; LangGraph's head start in durable execution and checkpointing is real.
3. **Deeper provider-specific feature support.** As providers ship more native structured-output and tool-calling capabilities server-side, expect PydanticAI's provider adapters to expose more of that capability directly rather than approximating it client-side — narrowing the gap between what a provider can do natively and what the framework exposes.
4. **Continued tight coupling with Logfire.** Expect observability to remain a first-class, not bolted-on, part of the framework's story, given shared maintainership — a meaningful differentiator versus frameworks where tracing is entirely third-party.
5. **Broader multi-agent and delegation patterns becoming more standardized.** As more teams build orchestrator/sub-agent pipelines, expect clearer built-in patterns (rather than the "just wrap an Agent as a tool" convention shown in this page) to emerge for common delegation shapes.

For your career: the safer long-term bet is the underlying skill this page teaches — validating agent boundaries with typed models, testing agent control flow deterministically, scoping tools narrowly — since that discipline transfers directly to whatever specific framework (PydanticAI, its eventual 1.0, or a successor) wins in your organization. Treat the exact PydanticAI API as a currently-good implementation of durable principles, not the other way around.
`,

  "cheat-sheet": `
~~~python
# --- Agent basics ---
from pydantic_ai import Agent
agent = Agent("openai:gpt-4o", system_prompt="...")
result = agent.run_sync("question")     # sync convenience wrapper
result = await agent.run("question")    # real async entry point — prefer in services

# --- Structured result type ---
from pydantic import BaseModel, Field
class MyResult(BaseModel):
    field_a: str
    field_b: int = Field(gt=0)
agent = Agent("openai:gpt-4o", result_type=MyResult)
typed: MyResult = (await agent.run("...")).output

# --- Tools ---
@agent.tool_plain               # no injected deps needed
def simple_tool(x: str) -> str:
    """Docstring = what the model reads to decide when/how to call this."""
    return x.upper()

@agent.tool                     # needs RunContext / injected deps
async def db_tool(ctx, key: str) -> str:
    return await ctx.deps.db.get(key)

# --- Dependency injection ---
from dataclasses import dataclass
from pydantic_ai import RunContext
@dataclass
class Deps:
    db: object
agent = Agent("openai:gpt-4o", deps_type=Deps)
await agent.run("...", deps=Deps(db=my_db_client))

# --- Streaming ---
async with agent.run_stream("...") as stream:
    async for chunk in stream.stream_text(delta=True):
        print(chunk, end="")
    # for structured output:
    async for partial in stream.stream_structured(debounce_by=0.1):
        ...
    final = await stream.get_output()

# --- Multi-agent (one agent as another's tool) ---
@writer_agent.tool_plain
async def research(topic: str) -> str:
    return (await research_agent.run(topic)).output

# --- Usage limits ---
from pydantic_ai.usage import UsageLimits   # check current import path
await agent.run("...", usage_limits=UsageLimits(request_limit=5, total_tokens_limit=20_000))

# --- Testing without a real LLM ---
from pydantic_ai.models.test import TestModel
from pydantic_ai.models.function import FunctionModel
with agent.override(model=TestModel()):
    result = agent.run_sync("...")   # deterministic, no network call

def scripted(messages, tools):
    return {"tool_call": "some_tool", "args": {...}}
with agent.override(model=FunctionModel(scripted)):
    result = agent.run_sync("...")
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What team built PydanticAI? | The Pydantic team (Samuel Colvin and collaborators), the same team behind Pydantic and Logfire |
| What does result_type do? | Declares a Pydantic model the agent's final output must validate against |
| What is a tool in PydanticAI? | A type-annotated Python function registered on an Agent; PydanticAI derives its schema from the signature |
| What is RunContext for? | Giving a tool access to injected deps (deps_type) in a typed, FastAPI-Depends-like way |
| Why validate tool arguments before calling the function? | So a malformed model-supplied argument never reaches your function body unvalidated |
| How do you test agent logic without calling a real LLM? | Override the model with TestModel (generic) or FunctionModel (scripted) via agent.override(...) |
| What happens on a validation failure, by default behavior the framework enables? | A corrective message can be sent back to the model, prompting a retry, up to a configured limit |
| How does structured streaming differ from text streaming? | It exposes progressively-more-complete partial views of a Pydantic model as it generates, plus a final fully-validated instance |
| How do you compose two agents? | Wrap one agent's run(...) call inside a tool function registered on another agent |
| What bounds a runaway agentic loop? | Configured usage limits — max tokens and/or max request/tool-call rounds per run |
| What is PydanticAI's relationship to FastAPI? | Deliberately modeled after it — same Pydantic validation, same Depends-like DI pattern, applied to agents instead of HTTP endpoints |
| What does PydanticAI NOT do? | It is not a retrieval/RAG framework (see LlamaIndex), not a prompt-optimization framework (see DSPy), and has a thinner durable-workflow story than LangGraph |
| What is pydantic-graph? | A companion library for expressing non-linear, multi-step agent workflows more explicitly than a single Agent's loop |
| Is PydanticAI model-agnostic? | Yes — a provider:model string selects the backend; switching providers is typically a one-line change |
| Why does Pydantic v2's Rust core matter here? | Validation happens on every tool call and final answer in a loop; fast validation (pydantic-core) keeps it from ever being the bottleneck versus the model API call |
`,

  mcqs: `
**1. What does declaring result_type on an Agent guarantee?**

A) The model will always produce perfect content  B) The agent's final output will validate against that Pydantic model (or raise/retry)  C) The agent will never call any tools  D) Streaming is disabled

**Answer: B** — validation guarantees structural correctness and constraint satisfaction, not semantic truth (see Security section).

**2. Which pattern does PydanticAI's dependency injection deliberately mirror?**

A) Django's ORM  B) FastAPI's Depends  C) Flask's blueprints  D) Celery's task queues

**Answer: B** — deps_type + RunContext is explicitly modeled after FastAPI's Depends pattern.

**3. In a test using TestModel, what actually happens?**

A) A real API call is made to a cheap model  B) No network call occurs; a deterministic stand-in produces schema-valid dummy output  C) The test always fails  D) Tool functions are skipped entirely

**Answer: B** — TestModel is a deterministic double specifically so tests run with no network call and no cost.

**4. Why can an agentic (multi-tool-call) loop be riskier for cost/latency than a single completion call?**

A) It cannot use async  B) It always calls every registered tool  C) It can make an unbounded number of model round trips if it never converges, unless usage limits are set  D) Tools are always more expensive per-call than the model itself

**Answer: C** — usage limits (max tokens/rounds) exist specifically to bound this risk.

**5. What is the most accurate framing of PydanticAI versus LangGraph for a complex, branching, resumable workflow?**

A) They are identical in capability  B) PydanticAI's core Agent loop is best suited to relatively linear think-tool-observe flows, while LangGraph's graph/checkpointing model is more mature for complex, durable, branching workflows  C) LangGraph cannot call tools  D) PydanticAI cannot be used with FastAPI

**Answer: B** — an honest, hedged comparison, not a blanket "PydanticAI is worse/better."

**6. What is pydantic-core, and why does it matter to PydanticAI?**

A) A separate agent framework  B) Pydantic v2's Rust-based validation engine, which keeps validation overhead low across many tool calls in an agent loop  C) A model provider  D) PydanticAI's testing utility

**Answer: B** — the performance foundation that makes "validate every boundary" a reasonable default rather than a latency tax.
`,

  "revision-notes": `
**Core idea in 4 lines:** PydanticAI is a Python agent framework, built by the Pydantic team, that applies Pydantic's validation discipline and FastAPI's dependency-injection pattern to agent development. An Agent binds a model, optional tools (type-annotated functions turned into callable schemas), and an optional result_type (a Pydantic model the final answer must validate against). The point is closing the gap between "LLM output is unstructured text" and "application code needs typed, validated data."

**Core abstractions in 5 lines:** Agent orchestrates a run. Tools are plain functions (tool_plain for no deps, tool for RunContext-injected deps) whose type hints become schemas. RunContext carries deps_type-declared dependencies (DB clients, HTTP clients, request context) into tools, injected explicitly per run — never global state. result_type is a Pydantic model validated against the final answer, with optional automatic corrective retries on failure. Streaming works for both plain text (deltas) and structured output (progressively-valid partial views, then a final validated instance).

**Production discipline in 5 lines:** Construct Agents once, pass per-request state through run() arguments. Set usage limits (tokens/rounds) on every run to bound runaway agentic loops. Test control flow with model doubles (TestModel/FunctionModel), reserving a small real-model suite for a schedule, not every commit. Trace every run (Logfire or OpenTelemetry) — tokens, tool calls, validation outcomes. Deploy like any FastAPI service, sharing Pydantic models between result_type and response_model.

**Honest positioning in 4 lines:** Lighter-weight and more type-first than LangChain; thinner durable-workflow story than LangGraph (pydantic-graph is younger); complementary, not competing, with LlamaIndex (retrieval) and DSPy (prompt optimization). Best fit: teams already invested in Pydantic/FastAPI who want typed agents and structured output without adopting a heavier orchestration platform.

**What to remember for interviews:** validation catches malformed structure, not hallucinated content; tool-argument validation happens before your function runs; usage limits exist because agentic loops can make unbounded round trips; and the whole framework's thesis mirrors FastAPI's — make the safe, typed path the default path, not an opt-in effort.
`,

  "learning-roadmap": `
A realistic path to confidently using PydanticAI in production (adjust pace to your background):

**Week 1 — Foundations.** Confirm Pydantic v2 and FastAPI Depends fluency first (revisit the **FastAPI** skill if rusty). Read Overview through Prerequisites here. Build Lab 1 (structured extraction agent). Milestone: you can explain, in one paragraph, what result_type guarantees and does not guarantee.

**Week 2 — Tools and dependency injection.** Intermediate Concepts + Lab 2. Write a tool with deps_type/RunContext and test it in isolation, without an Agent. Milestone: you instinctively reach for injected deps instead of global state.

**Week 3 — Streaming and multi-agent composition.** Advanced Concepts + Lab 3. Build a two-agent pipeline with structured streaming. Milestone: you can explain why structured streaming needs partial/best-effort views versus plain-text deltas.

**Week 4 — Internals, architecture, and testing doctrine.** Internal Working, Architecture, Data Flow, Testing sections. Write a full FunctionModel-scripted test asserting a specific tool call. Milestone: your test suite has zero real-API calls by default.

**Week 5 — Production.** Production Usage through Deployment sections; Lab 4 (FastAPI + PydanticAI production service). Milestone: a containerized, traced, usage-limited agent service on your GitHub.

**Week 6 — Comparisons and interview polish.** Comparisons, Interview Questions, Coding Questions. Be able to articulate, unprompted, when you'd reach for LangGraph or LangChain instead, and why.

Then continue to the **LangChain** and **LangGraph** skills on this platform for the broader-ecosystem comparison, and **LlamaIndex** for the retrieval layer a real production agent usually needs alongside PydanticAI.
`,

  "official-docs": `
- [PydanticAI documentation](https://ai.pydantic.dev/) — the primary reference; check here first for exact current API names, since the framework evolves quickly.
- [Pydantic documentation](https://docs.pydantic.dev/) — the validation library PydanticAI is built on; essential background for result_type and tool schemas.
- [Pydantic Logfire documentation](https://logfire.pydantic.dev/docs/) — the observability product with first-class PydanticAI integration.
- [PydanticAI GitHub releases/changelog](https://github.com/pydantic/pydantic-ai/releases) — the fastest-moving, most authoritative source for what changed between versions; read before upgrading.
- [FastAPI documentation](https://fastapi.tiangolo.com/) — for the Pydantic v2 validation and Depends patterns this framework directly extends.
`,

  books: `
- **No dedicated PydanticAI book exists as of my knowledge** — the framework is too young; the official docs and changelog are the primary source of truth. Treat any third-party book claiming deep PydanticAI coverage with skepticism if it predates a recent major docs revision.
- **Fluent Python, 2nd ed.** (Luciano Ramalho) — for the underlying Python fluency (typing, async, decorators) PydanticAI assumes.
- **Architecture Patterns with Python** (Percival & Gregory) — the layered-architecture thinking (repository pattern, dependency injection, keeping domain logic framework-free) applies directly to structuring agents/tools/deps cleanly.
- **Building LLM Powered Applications** or equivalent current-generation LLM engineering texts — for the surrounding agent-design concepts (tool design, evaluation, prompt engineering) that no framework-specific book will fully cover; verify title/edition currency before recommending, since this space publishes quickly.
- **Effective Python, 3rd ed.** (Brett Slatkin) — general production Python practices (typed interfaces, error handling) that make PydanticAI-based services maintainable.

Given the pace of change in this specific space, prioritize the official docs and high-signal blogs (below) over books for anything PydanticAI-specific.
`,

  blogs: `
- **The Pydantic team's own blog** (pydantic.dev/articles) — release announcements, design rationale, and worked examples straight from the maintainers.
- **Logfire blog** — observability-focused posts that frequently double as PydanticAI usage examples, since the two products are built together.
- **Real Python** (realpython.com) — periodically covers newer frameworks including PydanticAI with practical, well-edited tutorials; check publication date given how fast the API surface moves.
- **Individual AI engineering newsletters/blogs** covering agent-framework comparisons (search for recent posts specifically dated within the last few months, given the pace of change) — verify claims against the official docs rather than taking a blog post's API examples as current.

Because PydanticAI is young, high-signal blog content is thinner than for mature frameworks like LangChain; the official docs and changelog should be treated as the primary source, with blogs as supplementary context.
`,

  "research-papers": `
There is no dedicated academic paper specifically on PydanticAI as of my knowledge — it is an engineering framework/product, not a research artifact, and the literature here is genuinely thin for this specific tool. The closest useful foundational reading instead covers the concepts it implements:

- **Tool-use / function-calling literature**: papers on teaching language models to use external tools (the general research lineage behind "function calling" as a capability) — see the **Tool Calling** skill's research-papers section for specific citations, since that concept, not PydanticAI itself, is what the academic literature addresses.
- **Structured/constrained generation papers**: work on constraining LLM output to a formal grammar or JSON schema at decode time — see the **Structured Outputs** skill's research-papers section, since this is the mechanism PydanticAI's result validation builds on, and it is where the actual research contributions live.
- **Agent-loop / ReAct-style reasoning-and-acting papers**: the "think, act, observe, repeat" pattern PydanticAI's Agent.run implements is the subject of foundational agent-architecture papers — see the **Agent Fundamentals** skill's research-papers section for the primary citations.

If asked in an interview "what papers underlie PydanticAI," the honest and correct answer is: none directly — it is an applied engineering framework composing several well-studied ideas (tool use, constrained generation, agent loops) with a strong opinion (Pydantic-style validation) about how to expose them safely in Python. Cite the underlying concept papers via the related skills above rather than inventing a PydanticAI-specific citation.
`,

  videos: `
- **Samuel Colvin's PydanticAI announcement/introduction talks** — search for his conference talks or recorded streams introducing the framework; as the creator, these carry the most authoritative "why we built it this way" framing. Verify you're watching a recent one given how quickly the API has moved since initial release.
- **Pydantic/Logfire team livestreams or demos** — the maintaining team periodically demos new features (structured streaming, multi-agent patterns) directly; check their official channels for the most current material.
- **General FastAPI conference talks by Sebastián Ramírez (@tiangolo)** — not about PydanticAI directly, but the design philosophy (types as the contract, dependency injection, automatic docs) is the exact template PydanticAI applies to agents; understanding FastAPI's own "why" talks illuminates PydanticAI's motivation.
- **Community conference talks (PyCon, AI Engineer Summit-style events) covering "typed agent frameworks" or "Pydantic for LLMs"** — search recent editions specifically, since coverage of this framework is concentrated in the last one to two years and older talks may reference a stale API.

Given how new this framework is, prioritize anything explicitly dated within the last year over older material, and cross-check any code shown against the current docs.
`,

  "github-repos": `
- [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) — the framework itself; read the examples/ directory for up-to-date, maintainer-verified usage patterns.
- [pydantic/pydantic](https://github.com/pydantic/pydantic) — the validation library underneath; understanding its internals (especially pydantic-core) explains PydanticAI's validation performance story.
- [pydantic/logfire](https://github.com/pydantic/logfire) — the observability product with first-class PydanticAI instrumentation; useful for seeing production tracing patterns.
- [pydantic/pydantic-graph](https://github.com/pydantic/pydantic-graph) — the companion graph/state-machine library for non-linear agent workflows; compare its API directly against LangGraph to form your own opinion on maturity.
- [tiangolo/fastapi](https://github.com/tiangolo/fastapi) — the design template PydanticAI extends into the agent layer; worth re-reading its Depends implementation once you understand PydanticAI's deps_type.
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) and [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — the primary comparison points; cloning and reading a comparable example in each is the fastest way to form an honest opinion on the tradeoffs in Comparisons.
- [run-llama/llama_index](https://github.com/run-llama/llama_index) — for building the retrieval-tool half of a real production agent that composes with PydanticAI.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Basic Agent + result_type*: build an agent that extracts a structured Person (name, age, occupation) from a free-text bio; add a validator rejecting an age outside 0–130.
2. *Tool schema design*: write three tools with deliberately overlapping, vague docstrings; observe (via a real or scripted model) how often the wrong tool gets called; then rewrite the docstrings to be unambiguous and re-test.
3. *Dependency injection*: refactor a tool that reaches into a module-level global database connection into one that takes deps via RunContext; write a unit test for the tool using a fake deps object, with no Agent involved.
4. *Streaming*: implement both stream_text and stream_structured for the same underlying agent and result_type; compare what a client sees in each case as tokens arrive.
5. *Multi-agent*: build a three-agent pipeline (research to draft to edit) where each stage uses a different model, and measure total latency versus a single-agent baseline handling all three steps in one prompt.
6. *Usage limits*: deliberately construct a system prompt likely to cause a non-converging tool-calling loop (ambiguous instructions, a tool that never satisfies the model), then add usage limits and observe the bounded failure mode instead of runaway cost.
7. *Testing*: write a full FunctionModel-scripted test suite for an agent's tool-selection logic across five distinct user inputs, achieving deterministic, sub-second test execution with zero real API calls.
8. *Security*: design a tool that fetches external content (simulate with a fixture containing an embedded prompt-injection attempt) and demonstrate a mitigation (treating the content as untrusted, scoping what any single tool result can trigger).

External sets: since no dedicated PydanticAI problem sets exist yet, adapt general agent-framework exercises (tool-use benchmarks, structured-extraction datasets) and re-implement them specifically using PydanticAI's Agent/result_type/tool pattern to build fluency.
`,

  "architecture-diagram": `
The reference architecture for a production PydanticAI-based agent service, composing with FastAPI, a retrieval layer, and observability:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] --> LB["Load balancer"]
    LB --> API1["FastAPI pod 1\n(async, agents built at startup)"]
    LB --> API2["FastAPI pod N"]
    API1 & API2 --> Agent1["Orchestrator Agent\n(result_type shared with FastAPI response_model)"]
    Agent1 -->|tool call| SubAgent["Sub-agent (delegated task)\ncheaper/faster model"]
    Agent1 -->|tool call| Retrieval["Retrieval tool\n(backed by LlamaIndex / vector store)"]
    Agent1 -->|tool call| DBTool["DB tool\n(deps-injected client)"]
    Agent1 & SubAgent -->|model requests| Provider["LLM provider API(s)\nOpenAI / Anthropic / etc."]
    DBTool --> PG[("PostgreSQL")]
    Retrieval --> VS[("Vector store")]
    subgraph Observability
        LF["Logfire"] --> Dash["Traces: tokens, tool calls,\nvalidation outcomes"]
        OT["OpenTelemetry (alt/additional)"]
    end
    Agent1 -.instrumented.-> Observability
    SubAgent -.instrumented.-> Observability
~~~

Every box maps to a skill on this platform (FastAPI, LlamaIndex, PostgreSQL, the model providers, observability tooling); this diagram is the map of how a real PydanticAI-based production service composes them.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((PydanticAI))
    Core abstractions
      Agent
      Tools (tool_plain / tool)
      result_type (Pydantic model)
      RunContext + deps_type
    Concepts
      Beginner: Agent, result_type, first tool
      Intermediate: dependency injection, async run, text streaming
      Advanced: multi-agent delegation, structured streaming, retries, usage limits, pydantic-graph
    Internals
      Agent loop: request, tool call, validate, respond
      Schema derivation from type hints
      Provider adapters (model-agnostic)
    Production
      FastAPI integration
      Usage limits and cost control
      Timeouts on provider calls
      Deployment: Docker, uv, secrets
    Quality
      Testing: TestModel, FunctionModel
      Monitoring: Logfire, OpenTelemetry
      Debugging: message history, validation errors
      Security: prompt injection via tools, scoped tools
    Ecosystem
      FastAPI (validation + DI foundation)
      Structured Outputs (underlying mechanism)
      Tool Calling / Agent Fundamentals (concepts implemented)
      LangChain / LangGraph (comparison)
      LlamaIndex (retrieval composition)
      DSPy (different optimization angle)
    Career
      Interview classics
      Labs and projects
      Learning roadmap
~~~
`,
};

export default pydanticAi;
