import type { SkillContent } from "../types";

const openaiAgentsSdk: SkillContent = {
  overview: `
The OpenAI Agents SDK is OpenAI's own official, lightweight, production-oriented framework for building agentic applications, built around a deliberately small set of primitives: **Agents** (an LLM configured with instructions, tools, and optionally a specific model), **Handoffs** (a mechanism letting one agent transfer control of a conversation to another, specialized agent), **Guardrails** (input/output validation checks, directly connecting to the platform's own **Guardrails** skill), and **Sessions** (built-in conversation-state management across multiple agent turns). Where **LangChain** and **CrewAI** are third-party frameworks each with their own opinionated abstractions, the OpenAI Agents SDK is maintained directly by the LLM provider itself, giving it particularly tight, native integration with OpenAI's own model capabilities (function calling, structured outputs, and the Responses API).

The SDK's design philosophy deliberately favors a SMALL, minimal core (a spiritual successor to OpenAI's earlier, explicitly experimental "Swarm" project) over the broader, more general-purpose abstraction surface of frameworks like LangChain — it's built around the conviction that a lightweight, Python-native set of primitives, with excellent tracing/observability built in from the start, is often preferable to a heavier, more all-encompassing framework, directly reflecting a genuine, deliberate design tradeoff in the broader agent-framework ecosystem.

Key characteristics: **Agents**, an LLM plus instructions, tools, and configuration; **Handoffs**, a first-class primitive for one agent to transfer an in-progress conversation to another, specialized agent, directly extending **Agent Fundamentals**' multi-agent decomposition concept; **Guardrails**, built-in input/output validation directly connecting to the platform's own **Guardrails** skill; **Sessions**, built-in multi-turn conversation-state management; and **native tracing**, first-class, built-in observability without requiring a separate third-party tool.
`,

  history: `
| Year | Milestone |
|------|-----------|
| Oct 2023 | **OpenAI's "Swarm"** is released as an explicitly experimental, educational, lightweight multi-agent orchestration framework, demonstrating a minimal-primitives design philosophy (agents and "handoffs") without being positioned for production use |
| Mar 2025 | **OpenAI Agents SDK** launches as the official, production-ready successor to Swarm, retaining its core "agents and handoffs" philosophy while adding genuine production capabilities: built-in guardrails, sessions, tracing, and tighter integration with OpenAI's Responses API |
| 2025 | The SDK gains adoption specifically among teams building primarily on OpenAI's own models, valuing its lightweight footprint and native tracing over the broader, multi-provider abstraction surface of frameworks like LangChain |
| 2025 | Continued expansion of built-in guardrail types, handoff patterns, and tracing/observability integrations, positioning the SDK as OpenAI's own recommended path for building agentic applications on top of its models |

The OpenAI Agents SDK's history directly reflects a deliberate design lineage — from Swarm's explicitly experimental, minimal-primitives exploration toward a genuinely production-ready framework retaining that same minimalist philosophy, standing in contrast to the broader, more general-purpose abstraction surfaces of third-party frameworks like **LangChain**.
`,

  "why-it-exists": `
The OpenAI Agents SDK exists because many teams building agentic applications specifically on OpenAI's models found third-party frameworks like LangChain's broad, multi-provider abstraction surface to be more general-purpose (and thus, at times, more complex) than genuinely necessary for their specific use case, while wanting genuinely production-ready primitives (not Swarm's explicitly experimental status) with excellent, built-in observability and tight integration with OpenAI's own latest model capabilities.

The SDK solves this by providing a deliberately SMALL set of well-designed primitives — Agents, Handoffs, Guardrails, and Sessions — directly built and maintained by the model provider itself, with native tracing and tight integration with OpenAI's Responses API, letting teams building specifically on OpenAI's models adopt a lightweight, focused framework rather than a heavier, more general-purpose one designed to abstract across many different model providers.
`,

  "problem-it-solves": `
The OpenAI Agents SDK addresses the **"how do we build production-ready agentic applications on OpenAI's models with a lightweight, minimal-primitive framework and excellent built-in observability, without adopting a heavier, more general-purpose, multi-provider abstraction"** challenge.

Concretely, the SDK's abstractions provide:

- **Agents**, a straightforward, minimal primitive combining an LLM, instructions, and tools — directly reusing **Agent Fundamentals**' own tool-use and structured-tool-calling concepts.
- **Handoffs**, a first-class mechanism for one specialized agent to transfer an in-progress conversation to another, directly extending **Agent Fundamentals**' multi-agent decomposition concept with a particularly lightweight, native implementation.
- **Built-in Guardrails**, directly reusing the platform's own **Guardrails** skill's input/output validation concepts as a first-class SDK feature, rather than something bolted on separately.
- **Sessions**, built-in multi-turn conversation-state management, directly connecting to the general memory concepts covered across **LangChain** and **Agent Memory**.
- **Native tracing**, built-in observability without requiring a separate third-party tool, directly addressing the "black box" debugging risk covered in the **LangChain** skill.

What the SDK does **not** solve, or solves only partially: it's deliberately minimal and most tightly optimized for OpenAI's own models — teams needing to remain flexible across many different LLM providers, or requiring the considerably broader integration ecosystem and community tooling of a framework like LangChain, may find its narrower scope a genuine limitation rather than an advantage; and it inherits every underlying reliability challenge covered throughout the LLMs category (hallucination, prompt sensitivity).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the OpenAI Agents SDK's core primitives: Agents, Handoffs, Guardrails, and Sessions.
2. Construct a simple multi-agent system using handoffs to route between specialized agents.
3. Implement input/output guardrails using the SDK's built-in guardrail mechanism.
4. Explain how the SDK's native tracing addresses the "black box" debugging risk covered in the LangChain skill.
5. Compare the OpenAI Agents SDK's minimal-primitive philosophy against LangChain's and CrewAI's broader abstraction surfaces.
6. Recognize when the SDK's OpenAI-specific optimization is an advantage versus a genuine limitation for a given project's requirements.
7. Answer senior-level interview questions on the SDK's design philosophy and its tradeoffs versus alternative frameworks.
`,

  prerequisites: `
- **Required**: **Agent Fundamentals** (the agent loop, tool use, and multi-agent decomposition concepts the SDK concretely implements), **Guardrails** (the input/output validation concepts the SDK builds in natively).
- **Very helpful**: familiarity with **LangChain** and **CrewAI**, providing useful comparative context for the SDK's deliberately minimal design philosophy.

Dependency chain: **Agent Fundamentals** → **LangChain** → **LangGraph** → **CrewAI** → this page (OpenAI Agents SDK) → **AutoGen** and the remaining framework-specific skills.
`,

  "beginner-concepts": `
### A simple single agent

~~~python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="You are a helpful, concise assistant.",
)
result = Runner.run_sync(agent, "What's the capital of France?")
print(result.final_output)
~~~

This directly implements the basic agent structure covered in **Agent Fundamentals** — an LLM with instructions (analogous to a system prompt, connecting to the **Prompt Engineering** skill), executed via the SDK's \`Runner\`.

### Adding a tool

~~~python
from agents import Agent, function_tool

@function_tool
def get_weather(location: str) -> str:
    """Get the current weather for a location."""
    return weather_api.query(location)

agent = Agent(
    name="Weather Assistant",
    instructions="Help users with weather questions.",
    tools=[get_weather],
)
~~~

Directly analogous to the tool-decorator pattern in **LangChain** and **CrewAI**, this turns a plain Python function into a structured tool the agent can invoke — directly reusing **Agent Fundamentals**' own structured tool-calling guidance.

### Handoffs: transferring control between specialized agents

~~~python
billing_agent = Agent(name="Billing Agent", instructions="Handle billing questions.")
technical_agent = Agent(name="Technical Agent", instructions="Handle technical support questions.")

triage_agent = Agent(
    name="Triage Agent",
    instructions="Determine if a question is about billing or technical support, and hand off accordingly.",
    handoffs=[billing_agent, technical_agent],
)
~~~

The triage agent can dynamically HAND OFF the conversation to whichever specialized agent is appropriate, directly extending **Agent Fundamentals**' multi-agent decomposition concept — a lightweight, native alternative to **CrewAI**'s role/task/crew abstraction or a custom **LangGraph** routing graph.
`,

  "intermediate-concepts": `
### Guardrails: built-in input/output validation

~~~python
from agents import Agent, GuardrailFunctionOutput, input_guardrail

@input_guardrail
def block_off_topic_requests(context, agent, input_text):
    is_off_topic = classify_off_topic(input_text)
    return GuardrailFunctionOutput(
        output_info={"is_off_topic": is_off_topic},
        tripwire_triggered=is_off_topic,
    )

agent = Agent(
    name="Support Agent",
    instructions="...",
    input_guardrails=[block_off_topic_requests],
)
~~~

This directly implements the platform's own **Guardrails** skill's input-validation concept as a first-class, built-in SDK feature — a \`tripwire_triggered\` result halts execution before the agent processes a request that fails the guardrail check.

### Sessions: multi-turn conversation memory

~~~python
from agents import Agent, Runner, SQLiteSession

session = SQLiteSession("conversation_123")
result1 = Runner.run_sync(agent, "My name is Alex.", session=session)
result2 = Runner.run_sync(agent, "What's my name?", session=session)
# The agent correctly recalls "Alex" -- session automatically
# manages conversation history across turns, directly connecting
# to the memory concepts covered in LangChain and Agent Memory
~~~

### Native tracing: built-in observability

~~~
Every agent run, tool call, and handoff is automatically
traced by the SDK, viewable via OpenAI's own tracing
dashboard -- directly addressing the "black box" debugging
risk covered in the LangChain skill, but WITHOUT requiring
a separate third-party tool (like LangSmith) to be
integrated, since tracing is a native, built-in SDK feature.
~~~

### Structured outputs via the SDK

~~~python
from pydantic import BaseModel

class WeatherReport(BaseModel):
    location: str
    temperature_celsius: float
    conditions: str

agent = Agent(name="Weather Agent", instructions="...", output_type=WeatherReport)
~~~

Directly reuses the **Prompt Engineering** skill's own structured-output treatment, letting an agent's final output be a validated, typed object rather than raw text, with tight integration into OpenAI's own native structured-output model capability.
`,

  "advanced-concepts": `
### Handoffs versus CrewAI's delegation versus LangGraph's conditional edges

~~~
All three frameworks solve a genuinely similar problem --
routing control between specialized agents/nodes based on
the current situation -- but with meaningfully different
design tradeoffs: the SDK's Handoffs are lightweight and
NATIVE, directly built into the Agent primitive itself;
CrewAI's delegation is embedded within its higher-level
role/task/crew framing; LangGraph's conditional edges offer
the most EXPLICIT, precise, arbitrary control at the cost of
more upfront graph-design effort.
~~~

### Guardrails as a first-class SDK citizen, not an afterthought

~~~
Unlike frameworks where safety/validation logic is often
layered on TOP of the core agent abstraction (e.g., a
separate validation step wrapped around a LangChain chain),
the OpenAI Agents SDK treats Guardrails as a genuinely
FIRST-CLASS primitive directly analogous to Agents and
Handoffs themselves -- directly reflecting the platform's own
Guardrails skill's guidance that safety validation should be
a core architectural concern, not a bolted-on afterthought.
~~~

### The tradeoff of OpenAI-specific optimization

~~~
The SDK's tight integration with OpenAI's own model
capabilities (the Responses API, native structured outputs,
native tracing) is a genuine strength for teams committed to
OpenAI's models, but represents a genuine LIMITATION for teams
needing multi-provider flexibility -- a senior engineer
evaluates this tradeoff explicitly rather than assuming
either "always use the native SDK" or "always use a
multi-provider framework" is universally correct.
~~~

### Combining the SDK with lower-level orchestration for complex workflows

~~~
For workflows requiring LangGraph's more explicit conditional
branching, cycles, or fine-grained state management beyond
what handoffs comfortably express, a hybrid approach --
embedding OpenAI Agents SDK agents as components within a
broader orchestration layer -- can combine the SDK's tight
model integration with more explicit external structural
control, directly analogous to the CrewAI-in-LangGraph
hybrid pattern covered in the CrewAI skill.
~~~
`,

  "internal-working": `
Tracing a triage-and-handoff execution across two specialized agents:

~~~mermaid
sequenceDiagram
    participant User
    participant Runner
    participant Triage as Triage Agent
    participant Billing as Billing Agent

    User->>Runner: run(triage_agent, "I was overcharged")
    Runner->>Triage: process input
    Triage->>Triage: input_guardrails check\n(directly the Guardrails skill's\ninput-validation concept)
    Triage->>Triage: reasoning: this is a\nbilling question
    Triage->>Runner: handoff(billing_agent)
    Runner->>Billing: transfer control,\ncontinue conversation
    Billing->>Billing: plan-act-observe\n(directly Agent Fundamentals'\nloop, using Billing Agent's\nown instructions/tools)
    Billing->>Runner: final_output
    Runner->>User: final result
~~~

1. **The \`Runner\` orchestrates execution**, starting with the designated entry-point agent (here, the triage agent).
2. **Any configured input guardrails run first**, directly implementing the platform's own **Guardrails** skill's input-validation concept as a first-class check before the agent's core logic even begins.
3. **The triage agent's own reasoning (directly its plan step, per Agent Fundamentals) determines a handoff is appropriate**, transferring control to the billing agent.
4. **The billing agent then runs its own full plan-act-observe loop**, using its own distinct instructions and tools, ultimately producing the final output returned to the user.

**Why this matters**: this trace demonstrates precisely how the SDK's lightweight primitives (Agent, Guardrail, Handoff) compose into a genuinely multi-agent system, with each piece directly, concretely implementing a concept already established in **Agent Fundamentals** and **Guardrails** — the SDK's own contribution is providing a particularly minimal, native, well-integrated implementation of these concepts specifically for OpenAI's models.
`,

  architecture: `
A senior AI engineer thinks about OpenAI Agents SDK architecture in terms of deliberately evaluating whether its OpenAI-specific optimization and minimal-primitive philosophy genuinely fit a project's requirements, and designing handoff chains that reflect a task's genuine specialization structure.

### Evaluating the SDK's fit for a given project

~~~mermaid
flowchart TB
    Project["A given agentic project"] --> Q{"Committed to OpenAI's\nmodels specifically?\nValue minimal footprint\nand native tracing?"}
    Q -->|Yes| SDK["OpenAI Agents SDK is\na strong, lightweight fit"]
    Q -->|"No -- need multi-provider\nflexibility or broader\nintegration ecosystem"| Alternative["Consider LangChain/\nLangGraph/CrewAI instead"]
~~~

### Designing handoff chains reflecting genuine specialization

A senior practitioner designs handoffs the same way they'd design **CrewAI** roles — reflecting genuinely distinct, well-specialized responsibilities, rather than arbitrary or overlapping agent boundaries.
`,

  "data-flow": `
Tracing a request through an SDK-based system with an output guardrail and a session:

~~~mermaid
sequenceDiagram
    participant User
    participant Runner
    participant Session as SQLiteSession
    participant Agent
    participant OutputGuardrail as Output Guardrail

    User->>Runner: run(agent, "...", session=session)
    Runner->>Session: load prior conversation history
    Session->>Runner: accumulated context
    Runner->>Agent: process with full context
    Agent->>Agent: plan-act-observe loop\n(tools, reasoning)
    Agent->>OutputGuardrail: check final output\nbefore returning
    OutputGuardrail->>Runner: validated (or tripwire\ntriggered -- halt)
    Runner->>Session: persist this turn
    Runner->>User: final result
~~~

The critical detail: the SESSION automatically manages multi-turn conversation state (directly connecting to **LangChain**'s and the platform's own **Agent Memory** skill's memory treatment), while the OUTPUT GUARDRAIL provides a final, first-class validation checkpoint before any result reaches the user — directly implementing **Guardrails**' own output-validation concept as a native, built-in SDK capability rather than an external, bolted-on step.
`,

  "production-usage": `
### A representative production multi-agent system with guardrails and tracing

~~~python
from agents import Agent, Runner, input_guardrail, output_guardrail

triage_agent = Agent(
    name="Triage Agent",
    instructions="Route the user's request to the appropriate specialist.",
    handoffs=[billing_agent, technical_agent, refunds_agent],
    input_guardrails=[block_prompt_injection_attempts],
)

result = await Runner.run(
    triage_agent,
    user_message,
    session=session,
)
# Tracing is automatic -- viewable in OpenAI's tracing
# dashboard without any additional integration effort.
~~~

### Non-negotiables for production OpenAI Agents SDK applications

1. **Evaluate the OpenAI-specific optimization tradeoff explicitly** before committing — a genuine strength for OpenAI-only projects, a genuine limitation for multi-provider needs.
2. **Design handoffs reflecting genuinely distinct specializations**, directly reusing **CrewAI**'s own role-differentiation guidance.
3. **Implement both input AND output guardrails** for production systems, directly reusing **Guardrails**' own defense-in-depth guidance.
4. **Leverage native tracing from the start**, since it's built-in and requires no separate integration effort.
5. **Apply Agent Fundamentals' safety practices** (bounded iterations, autonomy calibration) even within the SDK's lightweight primitives.

### Common production patterns

- **Triage-and-handoff systems**, routing incoming requests to specialized agents based on category.
- **Guardrail-gated agents**, with both input (pre-processing) and output (pre-response) validation checkpoints.
- **Session-backed conversational agents**, maintaining multi-turn context automatically.
`,

  "industry-examples": `
- **OpenAI's own reference implementations and cookbook examples** demonstrate the SDK's intended production patterns directly.
- **Teams building customer-support and internal-tooling agents specifically on OpenAI's models**, valuing the SDK's lightweight footprint and native tracing over a heavier, multi-provider framework.
- **Growing adoption alongside (and sometimes in place of) LangChain/CrewAI** specifically among OpenAI-committed teams prioritizing minimal dependencies and tight model integration.
`,

  "best-practices": `
1. **Evaluate the OpenAI-specific optimization tradeoff explicitly**, rather than defaulting to the SDK without considering multi-provider needs.
2. **Design handoffs reflecting genuinely distinct specializations**, directly reusing role-differentiation discipline from **CrewAI**.
3. **Implement both input and output guardrails**, directly reusing **Guardrails**' defense-in-depth principle.
4. **Leverage native tracing from the start**, since it's a built-in, low-effort observability win.
5. **Apply Agent Fundamentals' bounded-iteration and autonomy-calibration guidance** even within the SDK's lightweight abstractions.
6. **Use Sessions for genuine multi-turn conversational needs**, managing context growth explicitly for very long conversations.
7. **Consider a hybrid approach with LangGraph** for workflows needing more explicit structural control than handoffs comfortably provide.
`,

  "anti-patterns": `
### Adopting the SDK without considering its OpenAI-specific optimization tradeoff

~~~
# WRONG — committing to the OpenAI Agents SDK for a project
# genuinely requiring multi-provider model flexibility,
# without evaluating this tradeoff explicitly
# RIGHT — evaluate whether OpenAI-specific optimization is
# genuinely acceptable for the project's actual requirements
# before adopting the SDK
~~~

### Poorly-differentiated handoff targets

~~~
# WRONG — defining multiple specialized agents with vague,
# overlapping instructions that don't genuinely differ,
# directly analogous to CrewAI's own role-differentiation
# anti-pattern
# RIGHT — design handoffs reflecting genuinely distinct,
# well-specialized responsibilities
~~~

### Skipping output guardrails

~~~
# WRONG — implementing only input guardrails, missing
# the output-validation checkpoint before a response
# reaches the user
# RIGHT — implement both input AND output guardrails,
# directly reusing Guardrails' defense-in-depth guidance
~~~

### Other production-grade anti-patterns

- **Not leveraging native tracing**, missing an essentially free observability win the SDK provides out of the box.
- **Skipping Agent Fundamentals' bounded-iteration guidance**, assuming the SDK's lightweight primitives don't need the same safety discipline as heavier frameworks.
- **Not managing session/context growth explicitly** for very long-running conversations.
`,

  performance: `
### Rule zero: the SDK's minimal footprint is a genuine performance/simplicity advantage specifically for OpenAI-committed projects

For teams genuinely committed to OpenAI's models, the SDK's lightweight primitives avoid the overhead (both cognitive and computational) of a heavier, more general-purpose, multi-provider framework.

### The performance hierarchy (apply in order)

1. **Design handoff chains reflecting genuine task specialization**, avoiding unnecessary agent hops for tasks a single, well-instructed agent could handle.
2. **Leverage Sessions' built-in context management** rather than building custom memory-handling logic.
3. **Apply Agent Fundamentals' bounded-iteration guidance** to avoid unnecessary, costly agent loop iterations.
4. **Use native structured outputs** where appropriate, directly connecting to the **Inference** skill's own treatment of reducing unnecessary parsing/retry overhead.

### Micro-level facts worth knowing

- Each handoff transfers conversation control but doesn't necessarily incur additional LLM calls beyond what a single-agent system would require for equivalent reasoning — directly connecting to the **Inference** skill's own per-call cost treatment.
- Native tracing has minimal performance overhead compared to the effort/latency of integrating and maintaining a separate third-party tracing tool.
`,

  scalability: `
The OpenAI Agents SDK's lightweight, native design directly determines how confidently an OpenAI-committed organization can scale into additional specialized agent capabilities via new handoff targets.

### How disciplined handoff design enables scaling

~~~mermaid
flowchart LR
    DistinctHandoffs["Genuinely distinct,\nwell-specialized handoff\ntargets"] --> Modular["Modular system --\nnew capabilities added\nas new handoff targets"]
    Modular --> ConfidentScaling["Confident scaling to\nadditional specialized\ncapabilities"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A workflow requiring precise conditional branching or cycles beyond handoffs | Consider a hybrid with LangGraph, or migrate to LangGraph entirely |
| Need for multi-provider model flexibility | The SDK's OpenAI-specific optimization is a genuine limitation here — consider LangChain instead |
| Poorly-differentiated handoff targets producing redundant agent behavior | Redesign handoff targets to be genuinely distinct, directly reusing CrewAI's role-differentiation guidance |
| Growing conversation context approaching limits in a long-running session | Manage session/context growth explicitly (summarization/truncation) |
`,

  security: `
### OpenAI Agents SDK-specific security considerations, directly extending Agent Fundamentals and Guardrails

~~~
The SDK's first-class Guardrails primitive is precisely the
concrete tool for implementing Agent Fundamentals' and the
platform's own Guardrails skill's defense-in-depth guidance --
input guardrails should screen for prompt injection and
off-topic/malicious requests BEFORE an agent processes them,
and output guardrails should validate responses before they
reach the user, directly mirroring the layered, defense-in-
depth approach covered in the Guardrails skill.
~~~

### Essential SDK-related security practices

1. **Implement both input and output guardrails**, directly reusing **Guardrails**' defense-in-depth principle as a first-class SDK feature.
2. **Treat tool results and handed-off conversation context as untrusted input**, directly reusing the **LangChain** skill's own prompt-injection guidance.
3. **Limit tool permissions per agent to the minimum genuinely necessary** for that agent's specific specialization.
4. **Apply action-level guardrails for high-risk tool calls**, directly reusing **Agent Fundamentals**' own treatment.

See **Agent Fundamentals**, **Guardrails**, and **LangChain** for the broader security context this connects to.
`,

  testing: `
### Testing handoff routing behavior

~~~python
def test_billing_questions_hand_off_to_billing_agent():
    result = Runner.run_sync(triage_agent, "I was overcharged on my last invoice")
    assert result.last_agent.name == "Billing Agent"
~~~

### Testing guardrail enforcement

~~~python
def test_input_guardrail_blocks_off_topic_requests():
    result = Runner.run_sync(agent, "Completely unrelated off-topic request")
    assert result.guardrail_tripwire_triggered
~~~

### The senior testing doctrine

- Test handoff routing explicitly against representative inputs for every specialized agent, directly analogous to testing tool-selection accuracy covered in the **LangChain** skill.
- Test both input and output guardrails independently, verifying each correctly triggers on representative violating inputs/outputs.
- Test session-based multi-turn behavior, verifying context is correctly maintained (and appropriately managed) across turns.
- Use native tracing during test runs to directly inspect handoff and tool-call behavior, leveraging the SDK's built-in observability advantage.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check native tracing first**, directly inspecting the exact sequence of agent runs, handoffs, and tool calls without needing a separate tool.
2. **Check handoff routing logic** if the wrong specialized agent handled a request.
3. **Check guardrail configuration** if an expected validation didn't trigger (or triggered unexpectedly).
4. **Check session configuration** if multi-turn context isn't being maintained as expected.

### Debugging common OpenAI Agents SDK-related symptoms

- "The wrong agent handled a request" — check native tracing to see the triage agent's actual handoff decision and reasoning.
- "A guardrail didn't trigger as expected" — verify the guardrail function's logic against the specific input/output that should have triggered it.
- "Multi-turn context seems lost" — check the session configuration and whether it's being correctly passed to every \`Runner.run\` call.
- "Two agents produce similar behavior despite different instructions" — check for insufficiently differentiated agent instructions, directly analogous to **CrewAI**'s own role-differentiation debugging guidance.
`,

  monitoring: `
### Key signals to track

- **Native trace data** (agent runs, handoffs, tool calls, guardrail results), directly leveraging the SDK's built-in observability.
- **Handoff frequency and routing accuracy**, directly connecting to **LangChain**'s own tool-selection accuracy monitoring guidance.
- **Guardrail trigger rates**, watching for unexpectedly high or low trigger frequency (a signal of miscalibrated guardrail logic).
- **Session/context growth** for long-running conversational applications.

### Tools

**OpenAI's native tracing dashboard** provides built-in observability without requiring separate integration; general LLM observability tools may still be layered on for additional cross-framework analysis in hybrid systems.

### Alerting priorities

Alert on a significant increase in guardrail tripwire triggers (a signal of increased adversarial or malformed input), and on unexpected handoff routing patterns diverging from historical baselines.
`,

  deployment: `
### A representative deployment configuration

~~~python
triage_agent = build_triage_agent_from_config()  # instructions,
                                                    # handoffs, and
                                                    # guardrails as
                                                    # version-controlled config

async def handle_request(user_message, session_id):
    session = SQLiteSession(session_id)
    result = await Runner.run(triage_agent, user_message, session=session)
    return result.final_output
~~~

### CI/CD pipeline considerations

Treat agent instructions, handoff configuration, and guardrail definitions as genuine, version-controlled application configuration, with automated evaluation (directly connecting to the **Evaluation** skill) against representative tasks as a deployment gate. See the **CI/CD** skill and the platform's later **LLMOps** skill for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production OpenAI Agents SDK application takes real traffic:

- [ ] OpenAI-specific optimization tradeoff explicitly evaluated and accepted for this project's requirements
- [ ] Handoff targets genuinely distinct, well-specialized, directly reusing CrewAI's role-differentiation discipline
- [ ] Both input and output guardrails implemented, directly reusing Guardrails' defense-in-depth principle
- [ ] Native tracing verified and actively monitored
- [ ] Agent Fundamentals' bounded-iteration and autonomy-calibration guidance applied
- [ ] Session/context growth managed explicitly for long-running conversational applications
- [ ] Automated evaluation against a representative test set as a deployment gate
`,

  "common-mistakes": `
1. **Adopting the SDK without evaluating its OpenAI-specific optimization tradeoff** against genuine multi-provider needs.
2. **Poorly-differentiated handoff targets**, directly analogous to CrewAI's own role-differentiation anti-pattern.
3. **Implementing only input guardrails, skipping output guardrails.**
4. **Not leveraging native tracing**, missing a low-effort, built-in observability win.
5. **Skipping Agent Fundamentals' bounded-iteration guidance**, assuming lightweight primitives don't need the same safety discipline.
6. **Not managing session/context growth explicitly** for very long conversations.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Wrong agent handles a request | Triage agent's handoff reasoning misclassifies the request | Check native tracing, clarify triage instructions and handoff descriptions |
| Guardrail doesn't trigger as expected | Guardrail logic doesn't correctly detect the violating input/output | Test guardrail logic explicitly against representative violating cases |
| Multi-turn context appears lost | Session not consistently passed across Runner.run calls | Verify session object is correctly threaded through every call |
| Two agents behave similarly despite different roles | Insufficiently differentiated agent instructions | Rewrite instructions to be genuinely distinct, per-specialization |
| Debugging a complex multi-agent run is difficult | Native tracing not being actively used/monitored | Check the tracing dashboard for the full execution sequence |
| Unexpected cost/latency for a simple task | Unnecessary handoffs or unbounded agent iterations | Simplify handoff chains; apply Agent Fundamentals' bounded-iteration guidance |
`,

  faqs: `
**What is the OpenAI Agents SDK?**
OpenAI's own official, lightweight framework for building agentic applications, built around Agents, Handoffs, Guardrails, and Sessions.

**How does the SDK relate to OpenAI's earlier "Swarm" project?**
The SDK is the production-ready successor to Swarm, retaining its minimal "agents and handoffs" philosophy while adding genuine production capabilities (guardrails, sessions, native tracing).

**What is a Handoff?**
A first-class mechanism letting one agent transfer an in-progress conversation to another, specialized agent, directly extending Agent Fundamentals' multi-agent decomposition concept.

**How do the SDK's Guardrails relate to the platform's own Guardrails skill?**
They directly implement the same input/output validation concepts as a first-class, built-in SDK primitive rather than a separately bolted-on mechanism.

**How does the SDK compare to LangChain or CrewAI?**
The SDK is deliberately more minimal and tightly optimized for OpenAI's own models, trading some multi-provider flexibility and broader integration ecosystem for a lighter footprint and native tracing/model integration.

**When should I choose the OpenAI Agents SDK over alternatives?**
When a project is genuinely committed to OpenAI's models and values a minimal, native, well-integrated framework with built-in observability over a heavier, more general-purpose, multi-provider abstraction.
`,

  "interview-questions": `
### Junior level

1. **What is the OpenAI Agents SDK?**
   Model answer: OpenAI's own official, lightweight agent framework built around Agents, Handoffs, Guardrails, and Sessions.

2. **What is a Handoff?**
   Model answer: a mechanism for one agent to transfer an in-progress conversation to another, specialized agent.

3. **How does the SDK's Guardrails feature relate to the broader concept of guardrails?**
   Model answer: it's a first-class, built-in implementation of the same input/output validation concepts covered generally in the platform's Guardrails skill.

4. **What is a Session in the OpenAI Agents SDK?**
   Model answer: built-in, automatic multi-turn conversation-state management.

### Senior level

5. **Explain precisely why the OpenAI Agents SDK's design philosophy differs from LangChain's, and identify a genuine scenario favoring each.**
   Model answer: the OpenAI Agents SDK deliberately favors a SMALL, minimal core of well-integrated primitives (Agents, Handoffs, Guardrails, Sessions) specifically optimized for OpenAI's own models, prioritizing a lightweight footprint and native, built-in observability over broad, general-purpose abstraction; LangChain, by contrast, deliberately favors a BROADER abstraction surface (chains, LCEL, a large integration ecosystem spanning many LLM providers and vector databases) prioritizing FLEXIBILITY and multi-provider portability over minimalism; a genuine scenario favoring the OpenAI Agents SDK: a startup building entirely on OpenAI's models, wanting to minimize dependencies and get native tracing/observability without additional third-party tooling, and unlikely to need multi-provider flexibility in the foreseeable future; a genuine scenario favoring LangChain: an enterprise building a platform that must support multiple different LLM providers (for cost, redundancy, or compliance reasons) and needing to integrate with a wide variety of vector databases and external tools across many different teams' use cases, where LangChain's broader, more general-purpose abstraction and larger integration ecosystem directly provides value the SDK's more minimal, OpenAI-specific design doesn't.

6. **A team's OpenAI Agents SDK-based triage system occasionally hands off a request to the wrong specialized agent. Diagnose this and propose a fix, directly connecting your answer to a concept covered in the CrewAI skill.**
   Model answer: this is directly analogous to the ROLE-DIFFERENTIATION and TOOL-SELECTION-ACCURACY issues covered in the **CrewAI** and **LangChain** skills respectively — the triage agent's handoff decision fundamentally depends on the underlying model correctly interpreting the incoming request against the AVAILABLE HANDOFF TARGETS' descriptions/instructions, and if these are vague, overlapping, or insufficiently distinct (directly the same failure mode as CrewAI's poorly-differentiated agent roles), the triage agent may genuinely struggle to route correctly; the fix is to make each handoff TARGET agent's instructions and the triage agent's own understanding of when to route to each one maximally CLEAR and DISTINCT — directly reusing CrewAI's own role-differentiation discipline — and to systematically test handoff routing accuracy against a representative, diverse set of inputs (directly reusing this page's own testing guidance), using native tracing to inspect exactly why a misrouted case was handled incorrectly rather than assuming the issue lies elsewhere.

7. **Explain why the SDK treating Guardrails as a first-class primitive (rather than a bolted-on afterthought) reflects good architectural practice, connecting your answer to the platform's own Guardrails skill.**
   Model answer: the platform's own **Guardrails** skill establishes that safety/validation logic should be treated as a core, deliberate architectural concern from the START of system design — not something added reactively after a problem is discovered in production; by making \`input_guardrails\` and \`output_guardrails\` genuinely first-class parameters directly on the \`Agent\` primitive itself (rather than, say, requiring a developer to manually wrap a separate validation function around an agent's input/output as an afterthought), the SDK's design actively encourages this correct, proactive architectural discipline — a developer configuring an agent is naturally prompted to consider "what input/output guardrails does this agent need" as part of the agent's OWN definition, rather than guardrails being an easily-forgotten, separate concern bolted on elsewhere in the surrounding application code; this is a genuine example of a framework's API DESIGN choices actively encouraging (or discouraging) a particular best practice, beyond merely making that practice technically possible.

8. **A production system built on the OpenAI Agents SDK needs to add support for a non-OpenAI model provider due to a new compliance requirement. What does this reveal about the SDK's fundamental design tradeoff, and how would you address it?**
   Model answer: this scenario directly surfaces the genuine LIMITATION side of the SDK's core design tradeoff — its tight integration with OpenAI's own model capabilities (the Responses API, native structured outputs, native tracing) is precisely what makes it lightweight and well-integrated for OpenAI-committed projects, but this same tight integration means it's not designed, out of the box, to be provider-agnostic the way a framework like LangChain explicitly is; addressing this requires either: (a) accepting a genuinely larger migration effort to a multi-provider framework (LangChain/LangGraph) if the compliance requirement represents a lasting, structural shift away from OpenAI-only operation, or (b) if only a SPECIFIC subset of functionality genuinely needs non-OpenAI model support, considering a hybrid architecture where the OpenAI Agents SDK continues handling the OpenAI-specific portions of the system while a separate, provider-agnostic component (potentially LangChain-based) handles the newly-required non-OpenAI portions — directly analogous to the hybrid CrewAI-in-LangGraph pattern covered in the **CrewAI** skill, where genuinely different frameworks are composed together, each handling the part of the problem it's best suited for, rather than assuming one framework must handle 100% of the system.

9. **Compare the OpenAI Agents SDK's Handoffs against LangGraph's conditional edges for implementing a routing decision, and explain which is the better fit for a simple two-way billing-versus-technical-support triage system versus a complex, five-category system with per-category human review requirements.**
   Model answer: Handoffs are a LIGHTWEIGHT, native primitive directly built into the Agent abstraction — a triage agent's own reasoning (an LLM call) decides which specialized agent to hand off to, with relatively little additional structural/configuration overhead beyond defining the specialized agents themselves; LangGraph's conditional edges provide a more EXPLICIT, code-level routing mechanism — the routing decision can be based on precise, arbitrary logic (not necessarily requiring an additional LLM call to decide), and the graph's structure makes exactly which paths exist and how they connect directly visible and inspectable in code; for the SIMPLE two-way billing-versus-technical triage system, Handoffs are a genuinely excellent, lightweight fit — the routing decision is naturally suited to an LLM's own reasoning (interpreting a natural-language request), and the SDK's minimal setup overhead is a genuine advantage for this straightforward case; for the COMPLEX five-category system with per-category human review requirements (directly analogous to the content-moderation example covered in the **LangGraph** skill), LangGraph's conditional edges combined with precisely-placed \`interrupt_before\` checkpoints provide considerably more explicit, reliable control over exactly which categories require human review — expressing "these two specific categories, and only these two, require human review" as a precise, code-level rule is a more natural fit for LangGraph's explicit graph model than relying on handoff-based routing logic to also encode this precise, per-category checkpoint policy correctly and consistently.

10. **A team wants to build a customer-support system on the OpenAI Agents SDK with a triage agent handing off to three specialists, and needs to guarantee that no specialist agent ever processes a request containing detected PII without explicit redaction first. Design this using the SDK's primitives.**
    Model answer: I'd implement this as an INPUT GUARDRAIL applied UNIFORMLY across every agent in the system (the triage agent AND all three specialist agents, since a handoff could otherwise bypass a guardrail only configured on the triage agent) — the guardrail function would run a PII-detection check against the incoming request, and if PII is detected, either (a) trigger the tripwire and halt processing entirely, returning a message asking the user to resubmit without sensitive information, or (b) — if the system design calls for graceful handling rather than a hard block — perform automatic redaction of the detected PII before allowing the request to proceed to the agent's core processing, with a note preserved in the guardrail's \`output_info\` for any needed downstream logging/auditing; critically, I would apply this guardrail to EVERY agent in the handoff chain, not just the triage agent, specifically because a handoff transfers the conversation but a PII-detection guardrail scoped only to the entry-point triage agent wouldn't necessarily re-run for the specialist agent that ultimately processes the (potentially PII-containing) request — directly reflecting the platform's own Guardrails skill's guidance that action-level and input-level safety checks need to be applied at every point they're genuinely relevant, not merely once at a system's initial entry point.
`,

  "coding-questions": `
### 1. Build a triage agent with two handoff targets

~~~python
from agents import Agent, Runner

billing_agent = Agent(name="Billing Agent", instructions="Handle billing questions clearly and empathetically.")
technical_agent = Agent(name="Technical Agent", instructions="Handle technical support questions with step-by-step guidance.")

triage_agent = Agent(
    name="Triage Agent",
    instructions="Classify the user's request as billing or technical, and hand off to the appropriate specialist.",
    handoffs=[billing_agent, technical_agent],
)

def handle_request(user_message):
    result = Runner.run_sync(triage_agent, user_message)
    return result.final_output
# Follow-up: how would you test that billing-related requests
# are correctly routed to the billing agent, not the technical one?
~~~

### 2. Implement an input guardrail blocking a specific request pattern

~~~python
from agents import Agent, GuardrailFunctionOutput, input_guardrail

@input_guardrail
def block_pii_requests(context, agent, input_text):
    contains_pii = detect_pii(input_text)
    return GuardrailFunctionOutput(
        output_info={"contains_pii": contains_pii},
        tripwire_triggered=contains_pii,
    )

agent = Agent(name="Support Agent", instructions="...", input_guardrails=[block_pii_requests])
# Follow-up: why should this guardrail be applied to EVERY
# agent in a handoff chain, not just the entry-point agent?
~~~

### 3. Build a session-backed multi-turn conversation

~~~python
from agents import Agent, Runner, SQLiteSession

def build_conversational_agent():
    return Agent(name="Assistant", instructions="Remember context across the conversation.")

async def handle_conversation_turn(agent, user_message, conversation_id):
    session = SQLiteSession(conversation_id)
    result = await Runner.run(agent, user_message, session=session)
    return result.final_output
# Follow-up: what production concern arises if this
# conversation runs for hundreds of turns, and how would
# you address it?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a single agent with a custom tool
Build an agent equipped with one custom tool, verifying it correctly invokes the tool for relevant requests. Deliverable: a working, tested agent. Skills exercised: basic Agent and tool-use setup.

### Lab 2 (Intermediate): Build a triage-and-handoff system
Build a triage agent routing between at least three specialized handoff targets, verifying routing accuracy across representative inputs. Deliverable: a working, tested multi-agent handoff system. Skills exercised: applied handoff design and testing.

### Lab 3 (Advanced): Implement input and output guardrails
Build an agent with both input and output guardrails, verifying each correctly triggers on representative violating cases. Deliverable: a working, tested guardrail-protected agent. Skills exercised: applied defense-in-depth guardrail design.

### Lab 4 (Production): Build a session-backed, traced multi-agent support system
Build a full triage-and-handoff system with sessions for multi-turn memory and native tracing actively monitored. Deliverable: a working, production-oriented system with a documented trace of a representative multi-turn interaction. Skills exercised: applied production-readiness across all SDK primitives.
`,

  "real-projects": `
### 1. A customer-support triage system
Engineering requirements: a triage agent handing off to distinct specialist agents, both input and output guardrails, and session-backed multi-turn memory.

### 2. An internal-tooling assistant with PII protection
Engineering requirements: uniform input guardrails across every agent in a handoff chain, detecting and handling PII consistently regardless of which specialist ultimately processes a request.

### 3. A hybrid OpenAI-Agents-SDK-and-LangGraph system
Engineering requirements: an outer LangGraph graph providing precise, per-category conditional branching and human-review checkpoints, with OpenAI Agents SDK agents embedded for well-defined, OpenAI-native sub-tasks.
`,

  "case-studies": `
### From Swarm's experimental minimalism to the Agents SDK's production readiness
OpenAI's explicit framing of Swarm as an educational, non-production experiment, followed by the Agents SDK's introduction as its genuinely production-ready successor retaining the same minimal-primitives philosophy, directly demonstrates a deliberate, disciplined product-development path — validating a design philosophy in a low-stakes, explicitly experimental context before committing to a production-grade release. Lesson: releasing an explicitly experimental, low-stakes version of a new idea first (rather than committing immediately to a production-grade release) can be a genuinely valuable way to validate a design philosophy's core value before investing in the additional engineering rigor production readiness requires.

### The genuine ecosystem value of a model-provider-native framework alongside third-party frameworks
The OpenAI Agents SDK's emergence alongside already-established third-party frameworks (LangChain, CrewAI) demonstrates that a model provider building its OWN official, tightly-integrated framework can coexist productively alongside a broader, more general-purpose third-party ecosystem, each serving genuinely different practitioner needs (deep, native integration with one provider's models, versus broad, provider-agnostic flexibility). Lesson: a maturing ecosystem often benefits from BOTH provider-native and provider-agnostic tooling options existing simultaneously, rather than one approach necessarily displacing the other.
`,

  comparisons: `
| Aspect | OpenAI Agents SDK | LangChain | CrewAI |
|--------|---------------------------|-----------------|--------------|
| Provider scope | OpenAI-native, tightly integrated | Multi-provider | Multi-provider |
| Core abstraction | Agents + Handoffs | Chains + AgentExecutor | Roles + Tasks + Crew |
| Built-in guardrails | Yes, first-class primitive | Requires separate integration | Requires separate integration |
| Built-in tracing | Yes, native | Via LangSmith (separate tool) | Via verbose logging / external tools |
| Best fit | OpenAI-committed, minimal-footprint projects | Broad, multi-provider, large ecosystem needs | Naturally role-decomposable "team" tasks |

**How seniors choose**: default to the OpenAI Agents SDK for projects genuinely committed to OpenAI's models valuing minimal footprint and native observability; choose LangChain/LangGraph for multi-provider flexibility or complex, explicit workflow control; choose CrewAI for naturally role-decomposable team tasks not requiring OpenAI-specific optimization.
`,

  "related-technologies": `
- **Agent Fundamentals** — the agent loop, tool use, and multi-agent decomposition concepts the SDK concretely, natively implements.
- **Guardrails** — the input/output validation concepts the SDK builds in as a first-class primitive.
- **LangChain**, **LangGraph**, **CrewAI** — alternative, differently-scoped agent frameworks this page directly compares against.
- **Agent Memory** — covered later in this category, directly connecting to the SDK's own Sessions concept.

Learning path: **Agent Fundamentals** → **LangChain** → **LangGraph** → **CrewAI** → this page (OpenAI Agents SDK) → **AutoGen** → the remaining skills in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- The OpenAI Agents SDK continues to mature as OpenAI's officially recommended path for building agentic applications on its models, with continued expansion of built-in guardrail types and tracing capabilities.
- Continued adoption specifically among OpenAI-committed teams valuing minimal footprint and native model integration over broader, multi-provider frameworks.
- Given continued, active SDK evolution, verify current best-practice recommendations against OpenAI's up-to-date official documentation.
`,

  "future-roadmap": `
Where the OpenAI Agents SDK is heading, and what's worth betting career time on:

- **Continued tight integration with OpenAI's latest model capabilities**, as the SDK and the underlying models are developed by the same organization.
- **Continued growth of native guardrail types and tracing/observability capabilities** as first-class, built-in features.
- **Continued positioning of the SDK as a lightweight, OpenAI-native alternative** to broader, multi-provider frameworks, rather than attempting to replace them universally.
- **What to bet on**: deeply understanding the general principle of minimal, well-designed agent primitives (agents, handoffs, guardrails, sessions) and evaluating provider-specific optimization tradeoffs deliberately — these transfer directly across SDK versions and inform sound architectural judgment even when working with alternative frameworks.
`,

  "cheat-sheet": `
~~~
# ---- Core primitives ----
Agent(name, instructions, tools=[...], handoffs=[...],
      input_guardrails=[...], output_guardrails=[...])
Runner.run_sync(agent, input_text)   # or await Runner.run(...)
~~~

~~~
# ---- Tools ----
@function_tool
def my_tool(arg: str) -> str:
    """Clear docstring -- shapes tool selection."""
    return do_something(arg)
~~~

~~~
# ---- Handoffs (lightweight multi-agent routing) ----
triage = Agent(name="Triage", instructions="...",
                handoffs=[specialist_a, specialist_b])
# Directly extends Agent Fundamentals' multi-agent
# decomposition -- design handoffs like CrewAI roles:
# genuinely distinct, not overlapping.
~~~

~~~
# ---- Guardrails (first-class, not bolted on) ----
@input_guardrail / @output_guardrail
def check(context, agent, data):
    return GuardrailFunctionOutput(output_info={...},
                                     tripwire_triggered=bool)
# Apply to EVERY agent in a handoff chain, not just entry point!
~~~

~~~
# ---- Sessions (built-in multi-turn memory) ----
session = SQLiteSession(conversation_id)
Runner.run_sync(agent, msg, session=session)
~~~

~~~
# ---- When to choose the SDK ----
Committed to OpenAI models + want minimal footprint +
    native tracing            -> OpenAI Agents SDK
Need multi-provider / broader
    ecosystem                 -> LangChain / LangGraph
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is the OpenAI Agents SDK? | OpenAI's own lightweight agent framework: Agents, Handoffs, Guardrails, Sessions. |
| What preceded it? | Swarm — an explicitly experimental, minimal multi-agent framework. |
| What is a Handoff? | One agent transferring an in-progress conversation to another specialized agent. |
| How are Guardrails different from other frameworks' approach? | First-class SDK primitive, not a bolted-on afterthought. |
| What does a Session provide? | Built-in, automatic multi-turn conversation-state management. |
| What is the SDK's core design tradeoff? | Tight OpenAI-native integration and minimalism vs. multi-provider flexibility. |
| Why must PII/safety guardrails apply to every handoff target? | A handoff could bypass a guardrail scoped only to the entry-point agent. |
| SDK Handoffs vs. LangGraph conditional edges? | Handoffs = lightweight, LLM-reasoning-driven; LangGraph = explicit, precise, code-level. |
| Why does the SDK have native tracing? | Built directly by the model provider — no separate tool integration needed. |
| When is the SDK NOT the right choice? | Genuine multi-provider requirements or need for a broader integration ecosystem. |
`,

  mcqs: `
1. What is the OpenAI Agents SDK built around?
   A) A single monolithic chain abstraction  B) Agents, Handoffs, Guardrails, and Sessions  C) Only a vector database integration  D) A GUI-based workflow builder
   **Answer: B** — the SDK's deliberately minimal core set of primitives.

2. What project directly preceded the OpenAI Agents SDK?
   A) LangChain  B) Swarm, an explicitly experimental multi-agent framework  C) AutoGen  D) CrewAI
   **Answer: B** — the SDK is Swarm's production-ready successor.

3. What is a Handoff in the OpenAI Agents SDK?
   A) A database migration  B) A mechanism for one agent to transfer an in-progress conversation to another, specialized agent  C) A caching layer  D) A type of guardrail
   **Answer: B** — directly extending Agent Fundamentals' multi-agent decomposition concept.

4. Why should PII-detection or safety guardrails typically be applied to every agent in a handoff chain, not just the entry-point agent?
   A) It doesn't matter which agent has it  B) A handoff could otherwise bypass a guardrail scoped only to the entry point, letting unsafe input reach a specialist unchecked  C) Guardrails only work on the first agent  D) Handoffs automatically inherit guardrails
   **Answer: B** — defense-in-depth requires applying the check everywhere it's relevant.

5. What is the core tradeoff of the OpenAI Agents SDK's design compared to LangChain?
   A) There is no tradeoff  B) Tight OpenAI-native integration and a minimal footprint, versus LangChain's broader multi-provider flexibility and larger ecosystem  C) The SDK doesn't support tools  D) LangChain has no memory support
   **Answer: B** — a genuine, deliberate design tradeoff to evaluate per project.
`,

  "revision-notes": `
The OpenAI Agents SDK is OpenAI's own official, lightweight agent framework, built around a deliberately SMALL set of primitives: AGENTS (an LLM plus instructions, tools, configuration), HANDOFFS (a first-class mechanism for one agent to transfer an in-progress conversation to another, specialized agent — directly extending **Agent Fundamentals**' multi-agent decomposition concept), GUARDRAILS (input/output validation, directly implementing the platform's own **Guardrails** skill's concepts as a FIRST-CLASS primitive, not a bolted-on afterthought), and SESSIONS (built-in, automatic multi-turn conversation-state management).

The SDK is the production-ready successor to OpenAI's earlier "SWARM" project, an explicitly experimental, educational exploration of the same minimal "agents and handoffs" design philosophy — the SDK retains this minimalist core while adding genuine production capabilities: guardrails, sessions, and NATIVE TRACING (built-in observability without requiring a separate third-party tool like LangSmith, directly addressing the "black box" debugging risk covered in the **LangChain** skill).

A critical, frequently-tested architectural comparison is the SDK's CORE DESIGN TRADEOFF versus broader, multi-provider frameworks (LangChain, CrewAI): the SDK's tight, native integration with OpenAI's own model capabilities (the Responses API, native structured outputs, native tracing) provides a genuinely lightweight, well-integrated experience for OpenAI-committed projects, but represents a genuine LIMITATION for projects requiring multi-provider flexibility or the broader integration ecosystem of frameworks like LangChain — a senior engineer evaluates this tradeoff explicitly rather than assuming either approach is universally correct.

HANDOFFS should be designed reflecting genuinely DISTINCT, well-specialized responsibilities, directly reusing **CrewAI**'s own role-differentiation discipline — poorly-differentiated handoff targets produce the same redundant-behavior failure mode covered in that skill. A frequently-tested security detail: input/safety GUARDRAILS (e.g., PII detection) should be applied to EVERY agent in a handoff chain, not just the entry-point triage agent, since a handoff could otherwise bypass a guardrail scoped only to the system's initial entry point, directly reflecting the **Guardrails** skill's own defense-in-depth guidance applied precisely wherever it's genuinely relevant.

The SDK inherits every safety practice covered in **Agent Fundamentals**: bounded agent iterations, deliberate autonomy calibration, and action-level guardrails for high-risk tool calls — these are not optional extras specific to heavier frameworks, but general agent-safety principles applicable even within the SDK's lightweight primitives.

Comparing HANDOFFS against **LangGraph**'s conditional edges: handoffs are lightweight and rely on an agent's own LLM-driven reasoning to decide routing, well-suited to simpler, natural-language-interpretable routing decisions; LangGraph's conditional edges provide more explicit, precise, code-level control, better suited to complex, precisely-specified branching and checkpoint requirements (e.g., specific categories requiring human review) that benefit from being expressed as exact, deterministic logic rather than relying on an LLM's own interpretation.

A senior AI engineer evaluates the SDK's OpenAI-specific optimization tradeoff explicitly before adoption, designs handoffs reflecting genuine specialization, implements BOTH input and output guardrails uniformly across a handoff chain, leverages native tracing from the start, and applies Agent Fundamentals' bounded-iteration and autonomy-calibration guidance even within the SDK's minimal primitives — this foundational understanding directly sets up the platform's remaining framework skill (**AutoGen**) and capability skills (**Agent Memory**, **Planning**, **Reflection**, **Tool Calling**, **MCP**) covered throughout the rest of this category.
`,

  "learning-roadmap": `
**Week 1 — Core primitives**: building a single agent with a custom tool. Milestone: complete Lab 1, with a working, tested agent.

**Week 2 — Handoffs**: building a triage-and-handoff system across at least three specialized agents. Milestone: complete Lab 2, with verified routing accuracy.

**Week 3 — Guardrails**: implementing both input and output guardrails uniformly across a handoff chain. Milestone: complete Lab 3, with verified guardrail enforcement.

**Week 4 — Production readiness**: building a session-backed, natively-traced multi-agent support system. Milestone: complete Lab 4, with a documented multi-turn interaction trace.

Next platform skill once this roadmap is complete: **AutoGen**, covering Microsoft's own multi-agent conversation-centric framework.
`,

  "official-docs": `
- **OpenAI's official Agents SDK documentation** — the authoritative, actively-maintained reference for Agents, Handoffs, Guardrails, and Sessions.
- **OpenAI's Swarm repository (archived/educational)** — useful historical context for the SDK's minimal-primitives design lineage.
`,

  books: `
- Given the SDK's relative recency (2025), dedicated book-length treatments remain limited; official documentation and OpenAI's own cookbook examples are the most current, authoritative references.
`,

  blogs: `
- **OpenAI's official developer blog** — release notes and design-philosophy discussions directly from the maintaining team.
- **Community tutorials comparing the OpenAI Agents SDK against LangChain and CrewAI** widely available across AI engineering educational content providers.
`,

  "research-papers": `
- The OpenAI Agents SDK is primarily an engineering framework rather than a research contribution; its design directly builds on the **ReAct** paper's foundational agent-loop pattern (covered in **Agent Fundamentals**) and general multi-agent hand-off/routing concepts.
`,

  videos: `
- **OpenAI's own developer conference talks and tutorials** on the Agents SDK's design and usage.
- **Community-produced tutorials and comparisons** across the OpenAI Agents SDK, LangChain, and CrewAI.
`,

  "github-repos": `
- **openai/openai-agents-python** — the official, primary OpenAI Agents SDK repository.
- **openai/swarm** (archived) — the experimental predecessor project.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Handoff design**: given a described multi-category support task, design genuinely distinct handoff targets.
2. **Guardrail placement**: given a described safety requirement, decide where (which agents) guardrails must be applied to avoid a bypass.
3. **Framework selection**: given a described project's requirements, decide whether the OpenAI Agents SDK, LangChain, LangGraph, or CrewAI is the best fit, and justify the choice.
4. **Routing accuracy debugging**: given a described misrouting issue, diagnose the likely cause and propose a fix.
5. **External practice sets**: OpenAI's own official cookbook examples for hands-on practice across agents, handoffs, guardrails, and sessions.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph CorePrimitives["SDK Core Primitives"]
        Agents["Agent (instructions, tools)"]
        Handoffs["Handoffs"]
        Guardrails["Guardrails (input/output)"]
        Sessions["Sessions"]
    end
    subgraph Observability["Native Observability"]
        Tracing["Built-in Tracing Dashboard"]
    end
    subgraph Comparison["Framework Positioning"]
        OpenAINative["OpenAI-native, minimal"]
        MultiProvider["vs. LangChain/CrewAI\n(multi-provider, broader)"]
    end
    CorePrimitives --> Observability
    CorePrimitives --> Comparison
~~~
`,

  "mind-map": `
~~~mindmap
  root((OpenAI Agents SDK))
    Foundations
      Overview
      History from Swarm
      Why it exists
      Problem it solves
    Core Primitives
      Agent
      Handoffs
      Guardrails
      Sessions
    Handoffs
      Multi-agent routing
      Role differentiation like CrewAI
      Vs LangGraph conditional edges
    Guardrails
      First class not bolted on
      Input and output
      Applied across handoff chain
    Native Tracing
      Built in observability
      No separate tool needed
    Design Tradeoff
      OpenAI native optimization
      Vs multi provider flexibility
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default openaiAgentsSdk;
