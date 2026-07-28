import type { SkillContent } from "../types";

/**
 * Agent Fundamentals — full 50-section knowledge page.
 * This is the gateway skill for the AI Agents category: it introduces, at a
 * conceptual but rigorous level, what an agent is and is not, so the sibling
 * deep-dive skills (LangChain, LangGraph, CrewAI, OpenAI Agents SDK,
 * AutoGen, Agent Memory, Planning, Reflection, Tool Calling, MCP) can each
 * go deep on one slice without re-deriving the basics.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no dollar-brace interpolation sequences appear anywhere in this file.
 */
const agentFundamentals: SkillContent = {
  overview: `
An AI agent, stripped to its mechanical core, is a large language model wired into a loop: the model observes some state, decides on an action (often a call to a tool it has been given), the action is executed by code outside the model, the result is fed back in as new observation, and the loop repeats until the model decides the goal has been met or some stopping condition fires. That is the entire idea. There is no separate "agent module" bolted onto the LLM — the intelligence doing the deciding is the same next-token-prediction machinery covered in the **LLM Fundamentals** skill; what makes something an agent is the surrounding control loop and the tools it is allowed to call, not a different kind of model.

For an AI engineer, Agent Fundamentals is the gateway skill for the entire "AI Agents" category on this platform. Every deep-dive skill downstream — the frameworks (**LangChain**, **LangGraph**, **CrewAI**, **OpenAI Agents SDK**, **AutoGen**) and the cross-cutting capabilities (**Agent Memory**, **Planning**, **Reflection**, **Tool Calling**, **MCP**) — assumes you already understand the perceive-plan-act-observe loop, the distinction between a single-shot LLM call and an agent, why tool use is the capability that actually makes "agent" mean something, and — critically — when an agent is the wrong tool for the job. This page treats the LLM itself as a given; see **LLM Fundamentals** and **Prompt Engineering** if you have not yet built that foundation.

Key characteristics of the modern LLM agent: it runs for a variable, unbounded-in-principle number of steps rather than producing one fixed output; it has access to tools (functions, APIs, code execution, retrieval) that let it affect or query the world beyond the conversation, distinguishing it sharply from a plain chatbot; its state (what it has seen, decided, and done so far) persists and grows across the loop, which is where memory becomes a first-class engineering concern; and its reliability is bounded not just by the model's per-call accuracy but by the probability of every step in a multi-step chain succeeding, which compounds unfavorably as the number of steps grows. Every cost, latency, and failure-mode property you will care about as an AI engineer building agents traces back to one of these facts, and this page is honest that agents are the right architecture for a meaningfully smaller slice of real problems than the current hype suggests.
`,

  history: `
The idea of an autonomous agent — something that perceives its environment and acts to achieve a goal — long predates LLMs; it is a foundational concept in classical AI and robotics (the "agent" as perceive-decide-act loop appears throughout Russell and Norvig's canonical AI textbook, decades before language models could support it usefully). What changed with LLMs was not the concept but the ingredient: for the first time, the "decide what to do" step could be filled by a general-purpose language model instead of a hand-built planner or a narrow reinforcement-learning policy, making agents buildable on top of natural-language reasoning rather than requiring bespoke symbolic logic for every domain.

| Year | Milestone |
|------|-----------|
| Pre-2020 | Classical AI agent theory (perceive-act loops, BDI architectures, game-playing and robotics agents) and reinforcement-learning agents (e.g. game-playing systems) establish the "agent" concept, largely without LLMs |
| 2020–2022 | Early LLM-based demonstrations show that a language model, prompted carefully, can decide which of several tools to call and interpret the result — the seed of tool-using LLM agents |
| 2022 | The ReAct paper ("Reasoning and Acting") formalizes interleaving explicit reasoning traces with tool-calling actions in a single prompted loop, becoming the most cited pattern for LLM agents |
| 2023 | A wave of autonomous-agent demos (open-source "auto-GPT"-style projects) popularizes the idea of long-running, self-directed LLM agents chaining many steps toward a goal — and just as quickly exposes how unreliable naive versions of this were in practice (infinite loops, wasted spend, drift from the goal) |
| 2023–2024 | Function calling / tool calling becomes a first-class, structured feature of major LLM provider APIs (rather than something developers had to hand-parse from free text), making tool use dramatically more reliable |
| 2024 | Multi-agent orchestration frameworks (**CrewAI**, **AutoGen**, and others) and graph-based orchestration (**LangGraph**) mature, offering more controllable alternatives to fully autonomous single-agent loops |
| 2024–2025 | Provider-native agent toolkits (e.g. the **OpenAI Agents SDK**) and the **Model Context Protocol (MCP)** emerge, standardizing how agents discover and call tools across vendors, and how memory/state is structured |

This page describes the concepts, not a fixed ranking of frameworks — which framework is "best" changes with nearly every release, and this page will not assert current-generation claims with false confidence. Check the **Latest Updates** section below, and the framework-specific sibling skills, for what is current when you read this.
`,

  "why-it-exists": `
Before agents, using an LLM in an application meant a single-shot pattern: construct a prompt, send it, get back one completion, done. This works well for tasks that are fully specified up front and solvable with information already available in the prompt — but it breaks down the moment a task requires information the model does not have (needs to look something up), requires taking an action in the world (send an email, query a database, run code), or requires a number of steps that cannot be fully planned in advance because each step's result changes what should happen next.

The gap agents filled: **a way for an LLM to decide, at each step, what to do next based on what it has learned so far, rather than committing to a fixed plan before seeing any results.** The insight is that the same model that can generate fluent text can also, if given a structured way to request tool calls and a loop that executes them and feeds results back, decide "I need to search for X," observe the search result, and then decide "given that result, I should now do Y" — turning a single fixed inference into an adaptive, multi-step process that can react to real information rather than only to guesses baked into the prompt.

The technical condition that made this practical was reliable, structured tool/function calling in model APIs: once a model could reliably emit "call this specific function with these specific arguments" rather than free-form text a developer had to parse with regexes and hope, the loop became robust enough to build real systems on top of, which is why 2023 to 2024's maturation of function calling — not any single "agent" paper — is arguably the more consequential enabling event described in History above.
`,

  "problem-it-solves": `
Agents solve the problem of needing a fixed, fully-specified plan before an LLM can act on multi-step, information-dependent tasks. Concrete pains removed:

- **Tasks requiring information not present in the prompt.** Instead of hoping the model's parametric knowledge is sufficient (and risking hallucination — see the **Hallucination** skill), an agent can call a search or retrieval tool, observe the real result, and reason from it.
- **Tasks whose correct next step depends on an earlier step's result.** A fixed single-shot prompt cannot branch based on what a database query actually returns; a loop can.
- **Tasks that require taking real actions**, not just producing text — sending a message, filing a ticket, executing code, modifying a record — which requires giving the model tools with real side effects, and requires a control structure around that access.
- **Tasks whose exact number of steps is not known up front** — "keep looking until you find the answer, or up to N attempts" is naturally expressed as a loop with a stopping condition, not as a single prompt.

What agents deliberately do **not** solve, and should not be expected to:

- **Reliability that exceeds the reliability of a single well-designed step, aggregated across many steps.** If any individual step has, say, a 95 percent chance of being correct, a ten-step chain of such steps succeeds roughly 60 percent of the time if errors are independent — agents do not repeal this arithmetic; they make it worse in proportion to how many steps are chained. See Advanced Concepts and Anti-Patterns for the full treatment.
- **Determinism or guaranteed termination.** An agent loop, if not carefully bounded, can genuinely fail to converge — looping, re-trying the same failed action, or drifting away from the goal — this is a first-class failure mode, not a rare edge case, covered in depth below.
- **A substitute for good task decomposition and engineering.** Many tasks that "sound like" they need an agent are better served by a fixed pipeline (a deterministic sequence of LLM calls and code, with no autonomous branching) or even a single well-prompted call — see When Agents Are (and Are Not) the Right Tool below and in Anti-Patterns; reaching for an agent by default is itself one of the most common mistakes covered on this page.
- **Cheapness or low latency.** Every additional loop iteration is another model call, another round of tokens billed, and another chance to fail — an agent is close to always more expensive and slower than a single call that solves the same problem, when a single call can in fact solve it.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Define an AI agent precisely (an LLM in a loop with tools, memory, and a goal) and explain what is different, mechanically, from a single-shot chatbot call.
2. Trace the perceive-plan-act-observe loop step by step and identify which part of a real system implements each stage.
3. Explain the ReAct pattern (interleaved reasoning and acting) and contrast it with plan-and-execute (plan fully up front, then execute).
4. Distinguish a single agent from a multi-agent system and state at least two concrete reasons a team might choose one over the other.
5. Explain why tool use, not "reasoning ability," is the capability that actually distinguishes an agent from a chatbot.
6. Given a task description, judge honestly whether it needs an agent, a fixed pipeline, or a single prompted call — and justify the judgment.
7. Name and explain at least four agent-specific failure modes (infinite loops, tool misuse, compounding errors, cost/latency blowup) with a concrete example of each.
8. Explain why per-step error rates compound multiplicatively across a chain, and compute a rough expected success rate for a hypothetical N-step agent.
9. Map each sibling agent skill (LangChain, LangGraph, CrewAI, OpenAI Agents SDK, AutoGen, Agent Memory, Planning, Reflection, Tool Calling, MCP) to the specific slice of the overall picture it goes deep on.
10. Design and defend a basic set of guardrails (step limits, cost budgets, human-in-the-loop checkpoints) for a real agent before it goes anywhere near production.
`,

  prerequisites: `
- **Required**: solid understanding of the **LLM Fundamentals** skill — tokens, context windows, sampling, and the base-model-vs-instruction-tuned distinction are all assumed here without re-derivation. You should also be comfortable with the **Prompt Engineering** skill's core ideas (instructions, few-shot examples, structured output), since an agent's "brain" at every step is just a prompted LLM call.
- **Strongly recommended before this page**: basic familiarity with the idea of function/tool calling in an LLM API (the model returning a structured request to call a named function with specific arguments, rather than free text) — this page explains the concept but the **Tool Calling** skill goes deep on the mechanics and provider-specific details.
- **Helpful**: basic Python, since worked examples use it; basic familiarity with calling an LLM API directly (OpenAI, Anthropic, or similar) if you want to reproduce the examples yourself; a first pass over the **RAG** skill is useful context, since retrieval is one of the most common tools an agent is given.
- **Not required**: prior experience with any specific agent framework. This page is framework-agnostic and deliberately builds a from-scratch loop before naming any framework, so that the concepts do not get confused with any one library's API surface.

Dependency links: **LLM Fundamentals** → **Prompt Engineering** → this page (**Agent Fundamentals**) → **Tool Calling**, **Agent Memory**, **Planning**, **Reflection** (the cross-cutting capabilities) → **LangChain**, **LangGraph**, **CrewAI**, **OpenAI Agents SDK**, **AutoGen**, **MCP** (the frameworks and interoperability standard that implement those capabilities). This page is the hub; the sibling skills are the spokes.
`,

  "beginner-concepts": `
### The single-shot call, for contrast

Before defining an agent, be precise about what it is not. A single-shot LLM call is: construct a prompt, send it once, receive one completion, use it. There is no loop, no tool execution, no revisiting the decision based on new information.

~~~text
User:  "Summarize this paragraph in one sentence."
  -> one prompt sent
  -> one completion received
  -> done. No further model calls happen for this task.
~~~

A chatbot is a thin wrapper around repeated single-shot calls: each user turn is (usually) one more single-shot call that happens to include the prior conversation as context. Critically, a chatbot does not decide to take an action, call a tool, or run multiple internal steps to answer one message — every reply is still fundamentally one call in, one completion out, even though the conversation as a whole spans many calls.

### What makes something an agent

An agent adds three ingredients around the same underlying LLM call: **tools** (functions the model can request be executed on its behalf), **a loop** (the result of a tool call is fed back to the model, which decides what to do next), and **a goal** (an explicit stopping condition — either the model decides the goal is met, or a hard limit is hit). Minimally:

~~~text
1. PERCEIVE: give the model the goal and the current state (including
   any tool results so far).
2. PLAN:     the model decides: am I done, or do I need to call a tool?
3. ACT:      if a tool call is requested, code outside the model actually
   executes it (search the web, query a database, run code, etc).
4. OBSERVE:  the tool's real result is added to the state.
5. REPEAT from step 1 until the model says it is done, or a limit is hit.
~~~

This is the perceive-plan-act-observe loop, and it is the single most important mental model in this entire skill — nearly everything else on this page is elaboration on one part of this loop.

### A minimal worked example: one tool, one loop

~~~python
# A deliberately tiny, from-scratch agent loop -- no framework, so the
# mechanics are visible. In production you would use structured/native
# function calling (see the Tool Calling skill) rather than parsing text,
# but this illustrates the loop itself without hiding it behind a library.

def get_weather(city: str) -> str:
    """A fake tool -- in reality this would call a real weather API,
    with its own timeout and error handling."""
    fake_data = {"paris": "15C and rainy", "tokyo": "22C and clear"}
    return fake_data.get(city.lower(), "unknown city")

def call_llm(prompt: str) -> str:
    """Stand-in for a real LLM API call. Replace with your provider's
    client in a real system."""
    raise NotImplementedError("wire this up to a real LLM API")

def run_agent(goal: str, max_steps: int = 5) -> str:
    state = f"Goal: {goal}\\n"
    for step in range(max_steps):
        # PERCEIVE + PLAN: ask the model what to do next, given state so far
        instructions = (
            state
            + "\\nRespond with exactly one line: either "
            + "'CALL_TOOL: get_weather(<city>)' or 'FINAL_ANSWER: <answer>'."
        )
        decision = call_llm(instructions)

        # ACT + OBSERVE
        if decision.startswith("FINAL_ANSWER:"):
            return decision.removeprefix("FINAL_ANSWER:").strip()
        if decision.startswith("CALL_TOOL: get_weather("):
            city = decision.split("(", 1)[1].rstrip(")")
            result = get_weather(city)
            state += f"\\nTool result for get_weather({city}): {result}"
            continue
        # Production note: an unrecognized decision format should be
        # treated as a tool-misuse failure, not silently ignored -- see
        # Anti-Patterns and Failure Modes below.
        state += "\\nSystem: could not parse decision, please retry."

    return "FAILED: exceeded max_steps without a final answer"
~~~

Notice the hard cap (max_steps) — without it, a model that never decides it is done will loop forever, burning tokens and money. This single line is the most important safety mechanism in the whole example, and it is the first thing later sections come back to.
`,

  "intermediate-concepts": `
### ReAct: interleaving reasoning and acting

The ReAct pattern (Reasoning and Acting) asks the model, at each step, to produce an explicit reasoning trace ("Thought: ...") before deciding on an action ("Action: call_tool(...)"), then feeds the tool's result back as an "Observation:" before the next Thought. The stated benefit is that making the model articulate its reasoning in text, interleaved with real observations, tends to produce more grounded, more inspectable decisions than asking it to jump straight to an action — you (and, to a lesser extent, the model itself) can see the reasoning that led to a bad action, not just the action.

~~~text
Thought: I need the current weather in Paris to answer this.
Action: get_weather(city="Paris")
Observation: 15C and rainy
Thought: The user wants to know if they need an umbrella. 15C and rainy
  means yes.
Action: FINAL_ANSWER: "Yes, bring an umbrella -- it's 15C and rainy in
  Paris right now."
~~~

ReAct is a prompting pattern, not a piece of software — you can implement it with any model that supports structured tool calling, and most agent frameworks (see **LangChain**, **LangGraph**) provide it as a built-in loop shape so you do not have to hand-roll the Thought/Action/Observation parsing yourself.

### Plan-and-execute: committing to a plan before acting

An alternative architecture separates planning from execution: first ask the model to produce a full multi-step plan given the goal, then execute each step (potentially with a much smaller, cheaper model, or with no model at all for purely mechanical steps), and only re-plan if execution reveals the plan will not work. This trades ReAct's step-by-step adaptiveness for more predictability and lower cost per step, at the cost of being less able to react to genuinely surprising intermediate results without an explicit re-planning step.

~~~text
Plan (produced once, up front):
  1. Search for the user's order ID in the order database.
  2. Check the order's shipping status.
  3. If delayed, look up the delay reason.
  4. Compose a reply summarizing status and, if delayed, the reason.

Execute steps 1-4 in order. Only go back to the planning model if a step
fails in a way the plan did not anticipate (e.g. order ID not found).
~~~

Plan-and-execute tends to be cheaper and more predictable for tasks whose shape is genuinely knowable up front (a fixed number of steps in a fixed order); ReAct tends to be more robust for tasks where the right next step genuinely depends on what the previous step returned. Many production systems use a hybrid: a rough plan sketched up front, executed with ReAct-style step-by-step adaptation within each planned stage. See the dedicated **Planning** skill for the full depth on plan representation, re-planning triggers, and hierarchical planning.

### Single-agent vs multi-agent

A **single-agent** system is one LLM-in-a-loop handling the entire task, calling whatever tools it needs directly. A **multi-agent** system splits a task across multiple LLM-in-a-loop instances, each with a narrower role (for example, a "researcher" agent that gathers information and a "writer" agent that composes the final answer from what the researcher found), coordinated by some orchestration logic (a fixed pipeline between agents, a "manager" agent that delegates, or a shared message bus).

~~~text
Single agent:
  [Agent] -- has tools: search, calculator, database_query --> handles
  the whole task itself, deciding when to use each tool.

Multi-agent (manager pattern):
  [Manager agent] -- delegates subtasks -->
      [Researcher agent] -- has tool: search
      [Analyst agent]    -- has tool: calculator
      [Writer agent]     -- has tool: none (just composes)
  Manager collects each sub-agent's output and produces the final answer.
~~~

Reasons to reach for multi-agent: task decomposition genuinely maps to distinct roles/expertise (research vs. writing vs. code review), you want to isolate a narrow tool surface per agent for safety or clarity, or you want the sub-agents' context windows to stay small and focused rather than one agent accumulating a huge, noisy transcript. Reasons to stay single-agent: multi-agent systems multiply the compounding-error problem (now you compound errors within an agent AND across handoffs between agents), multiply cost and latency, and introduce a genuinely hard coordination problem (which agent talks to which, in what order, and how do you prevent them from talking past each other). The honest default for most tasks is a single, well-tooled agent, or better yet a fixed pipeline; multi-agent is a deliberate escalation once a single agent's context or role has become unmanageably overloaded, not a default architecture. See the **CrewAI** and **AutoGen** skills, which are built specifically around multi-agent orchestration patterns, for the engineering depth here.

### Tool use as the actual core capability

It is worth stating plainly: an LLM's "reasoning" is not what makes an agent useful in production — the same model, without tools, is just a chatbot with a longer internal monologue. What makes an agent capable of doing real work is its ability to call tools that touch the real world: search engines, databases, code execution sandboxes, internal company APIs, file systems, other services. The **Tool Calling** skill goes deep on designing, describing, and safely exposing tools; the **MCP** (Model Context Protocol) skill covers the emerging standard for exposing tools and context to agents in a vendor-neutral way, so a tool built once can be used by agents built on different frameworks or providers.
`,

  "advanced-concepts": `
### Why per-step error rates compound, precisely

If a single step in a chain succeeds independently with probability p, and a task requires n such steps to all succeed, the probability the whole chain succeeds is p to the power of n (assuming, generously, that failures are independent — in practice they often are not, since one bad step tends to make subsequent steps more likely to fail too, which is worse than the independent-error case, not better).

~~~text
p = 0.95 (95% per-step success), n steps -> overall success rate:
  n = 1  -> 0.95   (95%)
  n = 3  -> 0.857  (~86%)
  n = 5  -> 0.774  (~77%)
  n = 10 -> 0.599  (~60%)
  n = 20 -> 0.358  (~36%)

Even a per-step accuracy that sounds excellent (95%) degrades to worse
than a coin flip by around 15 chained steps. This is not a pessimistic
edge case -- it is the default arithmetic of chaining probabilistic
steps, and it is the single most important number to internalize before
designing any agent with more than a handful of steps.
~~~

The engineering implication: every additional step you let an agent take is not "more capability for free" — it is a real, multiplicative tax on end-to-end reliability. This is why senior agent design deliberately minimizes the number of steps required for a task (shorter plans, fewer round-trips, tools that do more per call), rather than treating "just let the agent figure it out over more steps" as a free capability upgrade.

### Decision table: agent vs pipeline vs single call

| Task characteristic | Best fit |
|---|---|
| Fully specified up front, no external info needed, one output | Single well-prompted LLM call |
| Fixed, known sequence of steps (even if it calls tools) | A fixed pipeline (deterministic code calling the LLM/tools in a known order) |
| Number and order of steps depends on intermediate results, but the space of possible actions is small and well-tooled | A single agent, tightly bounded (small tool set, low step limit) |
| Task naturally decomposes into distinct roles/expertise, and coordination overhead is worth it | Multi-agent system |
| Task requires genuinely open-ended exploration with no clear stopping point | Usually a sign you have not scoped the task well enough for any of the above yet -- narrow it first |

Most real product requirements, on close inspection, land in the first two rows far more often than the excitement around "agents" would suggest — this is elaborated fully in the next section and in Anti-Patterns.

### Concurrency and parallel tool calls

Some agent architectures allow a single planning step to request multiple tool calls at once (for example, search three different sources in parallel rather than sequentially), which reduces wall-clock latency at the cost of more complex result-aggregation logic (the agent must now reason about several observations together, not one at a time) and more complex error handling (what happens if two of three parallel calls succeed and one times out). Frameworks differ in how well they support this natively; see the framework-specific sibling skills for concrete mechanics.

### Edge semantics: what counts as "done"

A subtle but important design decision is how the loop decides it is finished. Common approaches: the model emits an explicit "final answer" signal (as in the beginner example above); a dedicated stopping/verification step (sometimes another LLM call, sometimes rule-based) checks whether the goal state has been reached; or an external caller polls the agent's state and decides externally when to stop. Relying solely on the model's own judgment that it is "done" is a common source of premature termination (declaring success before the goal is actually met) or non-termination (never being confident enough to stop) — see the **Reflection** skill for techniques (self-critique, verification passes) that make "am I actually done" a more reliable judgment than a single unchecked model assertion.

### How the sibling agent skills map onto this picture

This page is the map; each sibling skill is a deep dive into one region of it:

- **Tool Calling** — designing, describing, and safely exposing the functions an agent can call; the mechanics of structured function-calling APIs.
- **Agent Memory** — how state persists within and across agent runs: short-term (within one loop) vs long-term (across sessions), and the retrieval/summarization techniques that keep it from overflowing the context window.
- **Planning** — plan representation, re-planning triggers, hierarchical/plan-and-execute architectures in depth.
- **Reflection** — self-critique and verification loops that catch an agent's own mistakes before they compound further.
- **LangChain** — a widely used general-purpose framework for composing LLM calls, tools, and agent loops.
- **LangGraph** — a graph-based orchestration framework (from the LangChain ecosystem) for building more controllable, explicitly stateful agent workflows.
- **CrewAI** — a framework built specifically around role-based multi-agent orchestration.
- **OpenAI Agents SDK** — a provider-native toolkit for building agents against OpenAI's models and tool-calling primitives.
- **AutoGen** — a framework (from Microsoft Research) built around multi-agent conversation patterns.
- **MCP (Model Context Protocol)** — a vendor-neutral standard for exposing tools and context to agents, so tool integrations are not locked to one framework.
`,

  "internal-working": `
Step by step, here is what actually happens inside one iteration of an agent loop, using structured tool calling (the production-grade mechanism, versus the toy text-parsing approach in Beginner Concepts):

~~~mermaid
flowchart TB
    A["Current state: goal + conversation history + prior tool results"] --> B["LLM call, with tool schemas passed alongside the prompt"]
    B --> C{"Model's response"}
    C -->|"Structured tool_call requested"| D["Application code executes the named tool with the given arguments"]
    D --> E["Tool result (or error) captured"]
    E --> F["Result appended to state as an observation"]
    F --> G{"Stopping condition met?\n(step limit, cost budget, explicit done signal)"}
    G -->|No| A
    C -->|"Final answer / no tool call requested"| H["Return final answer to caller"]
    G -->|Yes, limit hit without done signal| I["Return failure / partial result, do not loop forever"]
~~~

1. **Assemble state**: the application constructs the prompt sent to the model, which typically includes the system instructions (the agent's role and goal), the full or summarized history of prior thoughts/actions/observations so far (see **Agent Memory** for how this is kept from overflowing the context window), and the schemas describing which tools are available and what arguments each expects.
2. **Model decides**: the LLM call returns either a structured tool-call request (naming a specific tool and its arguments, in the provider's native function-calling format — see the **Tool Calling** skill for the exact schema mechanics) or a final answer with no further tool call.
3. **Execute (if a tool was requested)**: application code — not the model — actually runs the tool. This is a critical trust boundary: the model can only request an action; code outside the model decides whether and how to actually perform it, which is exactly where guardrails, permissions, and validation belong (see Security below).
4. **Capture the result**: the tool's real output (or a well-formed error, if the tool failed) is captured as an observation.
5. **Append and repeat**: the observation is added to the state, and the loop returns to step 1 with the model now seeing the real result of its last requested action.
6. **Stop**: the loop ends when the model returns a final answer with no tool call, or when an external stopping condition (step limit, cost budget, wall-clock timeout) is hit first — critically, the loop must have an externally enforced stopping condition that does not depend solely on the model's own judgment, because a model that never decides it is done will otherwise run indefinitely.

The crucial architectural fact this diagram makes visible: the model never directly executes anything. It only ever requests. The gap between "the model asked for X" and "X actually happened" is where all of an agent's safety and reliability engineering lives — validating arguments before executing, sandboxing dangerous tools (code execution, filesystem or network access), and logging every requested and executed action for later debugging.
`,

  architecture: `
Understanding agent architecture, for an AI engineer, means understanding both the loop's internal shape (above) and how a real application should be structured around a component that runs an unpredictable, variable number of model calls and tool executions per task rather than exactly one.

### The core components, at a glance

- **The LLM** — the decision-maker at each step; the same kind of model covered in **LLM Fundamentals**, prompted per the **Prompt Engineering** skill's techniques.
- **Tools** — functions with a name, a description, and an argument schema that the model can request; see **Tool Calling**.
- **Memory** — the state carried within one run (the transcript of thoughts/actions/observations so far) and, optionally, across runs (facts or summaries persisted between sessions); see **Agent Memory**.
- **The orchestrator/loop** — the code that drives perceive-plan-act-observe, enforces stopping conditions, and routes tool-call requests to actual tool implementations.
- **Guardrails** — validation and policy enforcement wrapped around both what goes into the model (untrusted tool outputs, retrieved content) and what tools the model is allowed to actually invoke, and with what arguments.

### Application architecture around an agent

~~~mermaid
flowchart TB
    U["User / calling application"] --> App["Application layer\n(goal framing, initial context)"]
    App --> Orchestrator["Agent orchestrator / loop"]
    Orchestrator --> LLM["LLM call\n(decide: tool call or final answer)"]
    LLM -->|tool call requested| Guard["Guardrail: is this tool call\nallowed, well-formed, safe?"]
    Guard -->|approved| ToolExec["Tool execution\n(search, DB, code exec, internal API)"]
    Guard -->|rejected| Orchestrator
    ToolExec --> Memory[("Memory / transcript store")]
    Memory --> Orchestrator
    LLM -->|final answer| App
    App --> U
    Orchestrator --> Budget["Step-limit / cost-budget enforcement"]
    Budget -->|limit hit| App
~~~

Key architectural principles:

- **The loop, not the model, owns termination.** The model can propose that it is done, but a step limit, a cost budget, or a wall-clock timeout enforced in code must be the actual backstop — never trust the model alone to know when to stop.
- **Tool execution is a privileged operation and belongs behind a guardrail**, exactly as described in Internal Working — the model requests, code outside the model decides whether to comply.
- **Memory is an explicit, engineered component**, not something the model does automatically — the transcript, any summarization of it, and any long-term persisted facts are all application-level concerns, covered in depth in **Agent Memory**.
- **Cost and step budgets are first-class configuration**, not an afterthought, because an agent's cost is proportional to how many loop iterations it takes, which is not fixed in advance the way a single-shot call's cost is.
`,

  "data-flow": `
Tracing one agent task end to end, from the user's request to the final answer, across three loop iterations:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant LLM as LLM (decision step)
    participant Tool as Tool executor
    participant Mem as Memory/transcript

    User->>App: "What's the weather in the city where our Q3 sales\nkickoff is happening, and should I pack a coat?"
    App->>Mem: initialize transcript with goal
    App->>LLM: goal + transcript + available tool schemas
    LLM-->>App: tool_call: lookup_event(name="Q3 sales kickoff")
    App->>Tool: execute lookup_event(...)
    Tool-->>App: result: "Chicago, Sept 14-16"
    App->>Mem: append observation
    App->>LLM: goal + updated transcript
    LLM-->>App: tool_call: get_weather(city="Chicago")
    App->>Tool: execute get_weather(...)
    Tool-->>App: result: "9C and windy"
    App->>Mem: append observation
    App->>LLM: goal + updated transcript
    LLM-->>App: final_answer: "It's in Chicago, 9C and windy --\nyes, pack a coat."
    App-->>User: final answer
~~~

The two facts this trace makes concrete: first, every loop iteration is a full additional LLM call, with its own tokens, latency, and chance of a mistaken decision — three iterations here means three separate opportunities for the model to misinterpret a tool result or request the wrong next tool, not one. Second, the transcript grows every iteration, which means later steps see a longer context than earlier ones — this is exactly why context-window budgeting (already a concern for a single call, per **LLM Fundamentals**) becomes a compounding concern across an agent's whole run, and why long-running agents need a deliberate memory-management strategy (summarizing or pruning the transcript) rather than letting it grow unboundedly — see **Agent Memory**.
`,

  "production-usage": `
### How real teams actually run agents in production

- **Most production "agents" are narrower and more constrained than the demos suggest.** A tightly-scoped agent with three or four well-described tools and a hard step limit of five is far more common, and far more reliable, in production than an open-ended agent with dozens of tools and no limit.
- **Step limits and cost budgets are non-negotiable configuration**, set per task type based on how many steps a task realistically needs, not left at a generous default "just in case."
- **Human-in-the-loop checkpoints are standard for consequential actions.** Many production agents are designed to propose an action (send this email, execute this refund, run this code change) and pause for human approval before executing it, rather than fully autonomously acting — especially for actions that are costly, irreversible, or customer-facing.
- **Tool sets are curated deliberately, not maximized.** Giving an agent every tool "in case it's useful" increases the chance of tool misuse (see Failure Modes) without a proportional increase in capability; production teams scope the tool set tightly to what the task actually needs.
- **Observability is built around the loop, not just the final answer** — logging every requested tool call, its arguments, its result, and the model's stated reasoning (if using a ReAct-style trace) is standard practice, because debugging an agent failure after the fact requires reconstructing the whole chain, not just seeing the wrong final output.
- **Fallback to a non-agentic path is common** for tasks where the agent's success rate does not meet the bar — many production systems run the agent, but fall back to a simpler deterministic pipeline or route to a human if the agent fails, times out, or exceeds its budget.

### Typical operational defaults

- Set a hard maximum number of loop iterations per task, sized to the task's realistic step count plus a small margin, not an arbitrary large number.
- Set a hard maximum total token/cost budget per task, independent of the step count, since some steps consume far more tokens than others (e.g. a step whose observation is a large retrieved document).
- Log the full transcript (thoughts, tool calls, arguments, results) per task run, with privacy-appropriate redaction, for later debugging and evaluation.
- Treat every tool as a potential failure point: give each tool call its own timeout and error handling, and make sure the agent's loop can gracefully handle a tool error as an observation ("the tool failed: X") rather than crashing the whole run.
`,

  "industry-examples": `
- **Coding assistants and autonomous coding agents** (a fast-growing category across multiple vendors) use an agent loop with tools for reading/writing files, running tests, and executing shell commands, iterating until tests pass or a step limit is hit — a concrete, high-value example of tool use plus a bounded loop replacing what used to be a single "generate this code" prompt.
- **Customer support automation platforms** commonly deploy agents scoped to a narrow tool set (look up an order, check a policy, issue a refund up to some limit) with human-in-the-loop escalation for anything outside that scope — illustrating the "tightly bounded agent, not an open-ended one" production pattern described above.
- **Research and data-analysis assistants** (across several vendors and internal enterprise tools) use agents with search and code-execution tools to answer multi-step analytical questions, iterating between querying data and refining the question — a good example of ReAct-style adaptiveness genuinely earning its cost, since the right next query often cannot be known before seeing the previous result.
- **Internal enterprise "ops" agents** (increasingly common in larger engineering organizations) wrap agents around internal APIs (deployment systems, internal ticketing, internal documentation search) to automate routine multi-step operational tasks, almost always behind approval gates for anything that changes production state.
- **Multi-agent content and research pipelines** (used by several content and research-tooling companies) split a task across a small number of specialized agents (e.g. a research agent and a writing/editing agent) explicitly to keep each agent's context focused and its tool surface narrow, rather than building one large agent with every capability.

Pattern to notice: the production-successful examples share tightly scoped tool sets, explicit step/cost limits, and human checkpoints for consequential actions — the open-ended, fully autonomous "agent that does anything" pattern popularized by early demos is much rarer in durable production systems than the initial hype suggested, precisely because of the compounding-error and cost/latency dynamics covered in Advanced Concepts and Failure Modes.
`,

  "best-practices": `
1. **Default to the simplest architecture that solves the task** — a single well-prompted call first, a fixed pipeline second, an agent only if the task genuinely requires adaptive, information-dependent branching. See When Agents Are (and Are Not) the Right Tool below.
2. **Set a hard step limit and a hard cost/token budget on every agent**, sized to the task's realistic needs, enforced in code, never left to the model's own judgment about when to stop.
3. **Scope the tool set tightly.** Give an agent only the tools the task actually needs, described precisely (name, purpose, argument schema, and when NOT to use it) — see the **Tool Calling** skill.
4. **Put human approval in front of consequential, costly, or irreversible actions** rather than letting the agent execute them fully autonomously.
5. **Log the full transcript of every run** (thoughts, tool calls, arguments, results), not just the final answer, since debugging an agent failure requires reconstructing the whole chain.
6. **Treat every tool call as an external, fallible network dependency** — timeouts, retries with backoff, and explicit error observations fed back to the model, exactly as you would for any other unreliable external call.
7. **Minimize the number of steps a task requires**, deliberately, because of the multiplicative compounding of per-step error rates covered in Advanced Concepts — fewer, more capable tool calls beat many small ones.
8. **Validate tool arguments before execution**, never trusting the model's requested arguments as inherently safe, especially for tools with side effects (writes, deletions, financial transactions, code execution).
9. **Build a verification/reflection step for high-stakes tasks** rather than trusting the model's own "I'm done" signal uncritically — see the **Reflection** skill.
10. **Prefer plan-and-execute or a fixed pipeline over open-ended ReAct** whenever the task's step structure is actually knowable up front — this reduces both cost and the compounding-error surface.
11. **Design memory deliberately**, summarizing or pruning the transcript rather than letting it grow unboundedly across a long-running agent — see **Agent Memory**.
12. **Evaluate agents on end-to-end task success, not per-step accuracy alone**, since per-step accuracy can look excellent while end-to-end success is mediocre, exactly per the compounding-error arithmetic.
`,

  "anti-patterns": `
### Reaching for an agent when a single call would do

~~~text
WRONG: "Build an agent that reads this email and drafts a reply."
  -- if the task is fully specified by the email content alone, with no
  external lookup or multi-step branching needed, this is a single
  well-prompted LLM call, not an agent. Adding a loop here adds cost,
  latency, and failure surface for zero benefit.

RIGHT: reserve the agent architecture for when the reply genuinely
  depends on information the model must go fetch (e.g. checking an
  order status in a database before drafting the reply).
~~~

### Other common agent-fundamentals-level anti-patterns

- **No step limit, or an implausibly generous one** ("just let it run until it's done") — this is the single most common cause of runaway cost and infinite-loop incidents; see Failure Modes below.
- **Giving the agent every tool available "just in case."** A large, loosely-described tool set increases the chance the model picks the wrong tool or calls a tool with malformed arguments, without a proportional gain in capability.
- **Trusting the model's own judgment that it is "done" as the sole stopping condition**, with no externally enforced backstop — a model can be miscalibrated about its own progress in both directions (declaring success prematurely, or never being confident enough to stop).
- **Treating a multi-agent system as automatically more capable than a single agent.** Multi-agent adds coordination overhead and compounds errors across handoffs as well as within each agent's own loop; it is a deliberate architectural escalation, not a free upgrade, and should be justified by genuine role decomposition, not adopted as a default.
- **Letting the transcript grow unboundedly** until a request fails at the context-window limit, instead of budgeting and summarizing/pruning proactively — the same discipline required for chat history in **LLM Fundamentals**, but now compounding across many more model calls per task.
- **No validation of tool call arguments before execution**, especially for tools with side effects — an agent that can be induced (by a bug, a bad tool result, or adversarial input reaching it) to call a destructive tool with attacker-influenced arguments is a real production incident waiting to happen, not a hypothetical.
- **Measuring only per-step accuracy and declaring the agent "reliable"** without measuring true end-to-end task success rate across the full chain of steps a real task requires.
`,

  performance: `
### Measure first

Before optimizing anything, instrument and measure, per agent run: number of loop iterations taken, tokens consumed per iteration and in total, wall-clock latency per iteration and end to end, and end-to-end task success rate. Without this, "the agent feels slow" or "the agent seems unreliable" are guesses, not engineering.

### The optimization hierarchy for agent-based systems (apply in order)

1. **Reduce the number of steps required**, first, by tightening the task scope, giving tools that do more per call (a single tool that fetches and summarizes rather than requiring three separate calls), or switching from open-ended ReAct to a plan-and-execute architecture when the step structure is knowable up front — this addresses both cost and the compounding-error problem simultaneously, and is almost always the highest-leverage lever.
2. **Reduce tokens per step**: summarize or prune the growing transcript rather than resending the full history every iteration (see **Agent Memory**), and keep tool results themselves concise (a tool that returns a huge raw payload forces every subsequent step to pay to re-read it).
3. **Choose the smallest/cheapest model that reliably meets the quality bar for the decision step**, rather than defaulting to the largest available model for every iteration — some agent architectures even use a cheaper model for routine steps and escalate to a stronger model only for genuinely hard decisions.
4. **Parallelize independent tool calls** where the architecture supports it (see Advanced Concepts), reducing wall-clock latency even when total token cost is similar.
5. **Cache tool results** where inputs repeat across runs or across steps within a run, to avoid paying for redundant tool execution and redundant model re-reasoning over identical information.
6. **Push infrastructure-level model-serving optimization (batching, KV-caching, quantization) to the LLM Fundamentals-adjacent Inference and Serving skills** rather than trying to solve it at the agent-orchestration layer.

### Facts worth knowing at this level

- Agent latency is dominated by the number of sequential LLM calls, not by any single call's speed — a five-step sequential loop is roughly five model calls' worth of latency stacked end to end, unless steps can be parallelized.
- Cost scales with total tokens across all steps, not just the final answer's tokens — a long, chatty transcript across many iterations can cost far more than the apparent complexity of the final answer would suggest.
- End-to-end task success rate, not per-step accuracy, is the metric that actually predicts whether users experience the agent as reliable — see Advanced Concepts for why these two numbers can diverge sharply.
`,

  scalability: `
Scalability for agent-based systems has two distinct dimensions: scaling the number of concurrent agent runs (an infrastructure/serving concern, largely the same story as scaling any LLM-backed application, per **LLM Fundamentals** and the **Serving** skill), and scaling the reliability of any single run as task complexity grows (an architectural concern specific to agents).

### The concurrency-scaling story

~~~mermaid
flowchart LR
    LB["Load balancer / task queue"] --> Run1["Agent run 1"]
    LB --> Run2["Agent run 2"]
    LB --> RunN["Agent run N"]
    Run1 & Run2 & RunN --> Router["Model gateway / router"]
    Router --> M1["LLM endpoint"]
    Run1 & Run2 & RunN --> ToolPool["Shared tool execution\n(rate-limited, sandboxed)"]
~~~

Individual agent runs are typically independent and can scale horizontally the same way independent requests to any LLM-backed service do; the real constraints are provider rate limits on the LLM calls, and rate limits or capacity limits on whatever external tools/APIs the agent calls (a shared database, a shared code-execution sandbox, a third-party API with its own quota).

### Known bottlenecks and answers

| Bottleneck | Answer |
|---|---|
| Task complexity grows -> more steps needed -> reliability drops multiplicatively | Decompose into a fixed pipeline or multi-agent system with narrower per-agent scope, rather than one agent taking ever more steps |
| Provider rate limits under many concurrent agent runs | Request queuing/backoff, multiple provider accounts, a router that load-balances (same answer as in **LLM Fundamentals**, now multiplied by steps-per-run) |
| Shared tool/API capacity (a database, a third-party API) becomes the constraint under concurrent agent load | Rate-limit and queue tool access centrally, not per-agent-run independently |
| Transcript/context growth across long-running agents | Summarization and pruning (**Agent Memory**), not simply requesting a bigger context window |
| Cost scaling with both traffic and steps-per-task | Minimize steps per task first (highest leverage), then apply the same caching/routing techniques as **LLM Fundamentals**' Cost Optimization guidance |

The single most important scalability idea specific to agents: unlike a single-shot call, an agent's resource consumption per task is not fixed — it depends on how many steps that particular task happened to need, which means capacity planning for agent systems must account for a distribution of step counts, not a single per-request cost.
`,

  security: `
### Agent-specific attack surface

1. **Tool misuse via manipulated observations.** If a tool's output (a retrieved web page, a database record, a file) contains adversarial text, the model may treat it as an instruction rather than data — the same prompt-injection risk covered in **LLM Fundamentals**, but now with a direct path to a real side-effecting tool call, not just a bad text response. This is arguably the single most consequential agent-specific security concern, because the blast radius extends beyond "wrong text" to "wrong action taken."
2. **Escalating tool privilege through chained reasoning.** An agent that has both a "read" tool and a separate "write" or "execute" tool can, if manipulated, use information gathered via the read tool to construct a harmful write/execute call the attacker could not have triggered directly — privilege boundaries need to account for what an agent could do by chaining allowed tools, not just what each tool does in isolation.
3. **Unbounded resource consumption as a denial-of-service / cost-abuse vector.** An attacker who can induce an agent into a long, expensive loop (rather than a short, cheap one) has effectively found a cost-amplification attack, distinct from traditional denial-of-service — hard step/cost limits (see Best Practices) are a security control here, not just a cost control.
4. **Insecure handling of tool arguments.** Passing model-generated arguments directly into a shell command, SQL query, or file path without validation is the same class of injection vulnerability as any other untrusted input, now arriving via the model instead of a user form field.
5. **Data exfiltration through tool outputs or final answers.** An agent with both access to sensitive internal data (via one tool) and an outbound-facing tool (send email, post to an external API) can, if manipulated, become an exfiltration path — treat any agent with both sensitive-read and any-external-write capability as a high-risk combination requiring extra scrutiny.

### Defenses

- Treat every tool result as untrusted content with respect to instructions, exactly as you would treat retrieved documents in a RAG system — the model should be steered (via system instructions and, where available, provider-level content/role separation) to treat tool outputs as data to reason about, not commands to obey.
- Validate and sanitize tool arguments before execution, every time, regardless of how trustworthy the model's output usually looks.
- Scope tool permissions to the minimum required for the task, and treat any tool set combining sensitive read access with external write/send capability as requiring explicit review.
- Enforce hard step and cost limits as a security control, not only a cost control, since unbounded loops are a viable resource-abuse vector.
- Log every requested and executed tool call with arguments, so an incident can be reconstructed after the fact.
- Put human approval in front of any tool with irreversible or costly real-world effects, especially where the arguments originate from model output influenced by untrusted content.

See the **Guardrails**, **Tool Calling**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond the agent-specific surface covered here — this section is the agent-specific layer on top of the general LLM security picture in **LLM Fundamentals**.
`,

  testing: `
Testing agents combines the non-determinism challenges already present for single LLM calls (see **LLM Fundamentals**' testing section) with an additional layer: the number and sequence of steps taken is itself variable, so tests must assert on outcomes and behavior, not on a fixed transcript.

~~~python
# Testing an agent: assert on end state and on constrained properties of
# the transcript, not on an exact sequence of steps (which can legitimately
# vary run to run even for a correct agent).

def test_agent_reaches_correct_final_answer():
    result = run_agent(goal="What is the capital of the country whose "
                             "currency is the yen?", max_steps=5)
    assert "tokyo" in result.final_answer.lower()

def test_agent_stays_within_step_budget():
    result = run_agent(goal="...", max_steps=5)
    assert result.steps_taken <= 5          # the hard limit must actually hold
    assert result.status in ("success", "budget_exceeded")  # never "unknown"

def test_agent_never_calls_disallowed_tool():
    # A tool-misuse regression test: this task should never require the
    # delete_record tool, regardless of how the agent reasons about it.
    result = run_agent(goal="Look up the customer's order status.", max_steps=5)
    called_tools = {call.tool_name for call in result.transcript}
    assert "delete_record" not in called_tools

def test_agent_handles_tool_failure_gracefully():
    # Simulate a tool raising an error and confirm the agent produces a
    # graceful failure observation rather than crashing the whole run.
    result = run_agent(goal="...", max_steps=5, force_tool_error="get_weather")
    assert result.status != "crashed"
~~~

### Fundamentals-level testing doctrine for agents

- **Test end-to-end task success across a representative task set**, not just whether one hand-picked example works — a single passing example tells you almost nothing about the true success rate given the compounding-error arithmetic in Advanced Concepts.
- **Test the step/cost budget enforcement directly** as its own test, not just as a side effect of other tests — this is a safety-critical control, and regressions here are expensive incidents.
- **Test tool-misuse boundaries explicitly**: for a given task, assert which tools should never be called, not just which tools should be.
- **Test tool-failure handling as a first-class scenario**, injecting simulated tool errors and asserting the agent degrades gracefully rather than crashing or looping.
- **Separate "did the loop mechanics work" tests (mockable, deterministic) from "did the agent make good decisions" tests (need real model calls and a scoring approach)** — the latter connects directly to the **Evaluation** skill's methodology, now applied to multi-step outcomes rather than single-call outputs.
`,

  debugging: `
### Escalation path for debugging unexpected agent behavior

1. **Reconstruct the full transcript first**, not just the final output — every thought, tool call, arguments, and observation for the failed run. Agent bugs are overwhelmingly easier to diagnose from the full chain than from the final answer alone.

~~~python
def print_transcript(result) -> None:
    """Debugging habit: before theorizing about WHY an agent failed,
    print the whole chain of decisions and observations."""
    for i, step in enumerate(result.transcript):
        print(f"--- step {i} ---")
        print(f"thought:      {step.thought}")
        print(f"tool_call:    {step.tool_name}({step.arguments})")
        print(f"observation:  {step.observation}")
    print(f"final status: {result.status}, steps taken: {result.steps_taken}")
~~~

2. **Identify which step the failure actually originated in**, since a wrong final answer is often the downstream consequence of a bad decision several steps earlier (a misread tool result, a wrong tool chosen) — fixing the symptom at the final step without finding the originating step will not prevent recurrence.
3. **Check whether a tool call failed or returned an unexpected result**, and whether the agent's subsequent reasoning correctly accounted for that (or silently proceeded as if the tool had succeeded).
4. **Check the step/cost budget enforcement** — did the agent hit the limit before completing, and if so, was the limit too low for this task's genuine complexity, or is this evidence the task should be decomposed rather than given more steps?
5. **Reproduce with a low/near-zero temperature** to remove sampling randomness as a variable while isolating whether the issue is in tool description, prompt construction, or a genuine model limitation at the decision step — same technique as debugging a single LLM call, now applied per-step.
6. **Check for context-window pressure on later steps.** A long transcript by step eight or nine can silently crowd out or de-prioritize earlier, still-relevant information — verify token counts per step, and consider whether summarization/pruning (**Agent Memory**) is needed.
7. **Escalate to a proper multi-run evaluation** (**Evaluation** skill, applied to agent task success) once single-run debugging has ruled out obvious tool, prompt, or budget bugs — some failures are genuine model-capability limitations at the decision step, not fixable by adjusting the loop.

### Common "it's not a bug, it's the fundamentals" traps

- Agent "gave up" before finishing: hit the step or cost budget, not a malfunction — check whether the budget was actually sized for this task's real complexity.
- Agent looped on the same failing tool call repeatedly: no mechanism to recognize a repeated failure and change strategy — a common and specifically agent-flavored failure mode, covered in depth immediately below.
- Agent's final answer contradicts an earlier tool result: check whether the transcript was truncated/summarized in a way that dropped the relevant observation before the final decision step.
`,

  monitoring: `
Production agent monitoring extends standard LLM-call monitoring (per **LLM Fundamentals**) with signals specific to multi-step, tool-using loops.

### What to measure

- **Steps taken per run** (distribution, not just average) — a rising tail of runs hitting the step limit is an early warning of task complexity outgrowing the current budget or architecture.
- **Tokens and cost per run, decomposed by step** — since cost is not fixed per task the way it is for a single-shot call, understanding which steps are expensive (large tool results, long transcripts by later steps) is essential for cost control.
- **Tool call distribution**: which tools are called, how often, and with what argument patterns — a sudden shift can indicate a prompt regression, a tool description problem, or (in the worst case) a misuse/injection attempt in progress.
- **End-to-end task success/failure rate**, categorized by failure type (budget exceeded, tool error unhandled, wrong final answer, crashed) — a single "failure rate" number hides which failure mode is actually driving it.
- **Repeated-tool-call rate**: how often the agent calls the same tool with the same or very similar arguments more than once in a single run — a strong leading indicator of the infinite-loop failure mode described below.

~~~python
# Minimal instrumentation sketch around an agent run.
import time
import logging

logger = logging.getLogger("agent_runs")

def run_agent_with_monitoring(goal: str, max_steps: int = 10) -> dict:
    start = time.perf_counter()
    result = run_agent(goal=goal, max_steps=max_steps)   # your real agent loop
    elapsed = time.perf_counter() - start

    tool_calls = [s.tool_name for s in result.transcript if s.tool_name]
    repeated = len(tool_calls) - len(set(tool_calls))

    logger.info(
        "agent_run_completed",
        extra={
            "steps_taken": result.steps_taken,
            "status": result.status,
            "total_tokens": result.total_tokens,
            "latency_seconds": elapsed,
            "tool_calls": tool_calls,
            "repeated_tool_calls": repeated,
        },
    )
    return result
~~~

### Agent-specific things to watch

- A rising rate of runs hitting the step or cost budget can indicate the task set has genuinely grown more complex, or that the architecture needs decomposition (fixed pipeline / multi-agent) rather than a bigger budget.
- A rising repeated-tool-call rate is an early, specific signal of the infinite-loop / non-convergence failure mode, and should page someone well before it becomes a cost incident.
- A sudden shift in which tools are called for a given task type can indicate a prompt or tool-description regression, or (rarely but seriously) an injection attempt succeeding.
`,

  deployment: `
Deploying an agent-based feature builds on the deployment concerns already covered in **LLM Fundamentals** (pinned model version, secrets management, timeouts/retries) with agent-specific configuration that must be explicit at deploy time.

### Configuration that must be explicit at deployment time

~~~text
AGENT_MAX_STEPS=8                 # hard cap, sized to the task's realistic
                                   # step count plus a small margin
AGENT_MAX_TOTAL_TOKENS=20000      # hard cost/token budget independent of steps
AGENT_STEP_TIMEOUT_SECONDS=15     # per-step timeout for the LLM call itself
AGENT_TOOL_TIMEOUT_SECONDS=10     # per-tool-call timeout
AGENT_ALLOWED_TOOLS=search,get_order_status,get_weather   # explicit allowlist,
                                   # never "all registered tools"
AGENT_HUMAN_APPROVAL_REQUIRED_FOR=send_email,issue_refund # consequential
                                   # tools require an approval gate
LLM_MODEL=<pinned model version, not "latest">
~~~

Why each choice matters: the step and token budgets are the primary defense against runaway cost and infinite-loop incidents (see Failure Modes); per-step and per-tool timeouts prevent one slow call from stalling the whole run; an explicit tool allowlist (rather than "whatever tools are registered in this environment") prevents accidental capability creep as new tools are added to a codebase for unrelated features; the human-approval list is where consequential, irreversible actions are gated regardless of how confident the agent's own reasoning appears.

### Rollout practice specific to agent features

- **Roll out changes to the tool set, prompts, or step/budget limits behind a flag**, and evaluate end-to-end task success on a representative task set (see **Evaluation**) before full rollout — these are behavior changes with a wider blast radius than a single-shot prompt change, since they affect every step of every run.
- **Canary new tools or expanded tool sets to a small percentage of traffic first**, monitoring tool-call distribution and repeated-tool-call rate specifically, before enabling broadly.
- **Keep a non-agentic fallback path** for tasks where the agent's success rate does not meet the bar — routing to a simpler deterministic pipeline or to a human, rather than the feature failing outright, is standard practice for agent-backed features specifically because agent failure rates are typically higher and more variable than single-call failure rates.
`,

  "production-checklist": `
Before an agent-backed feature takes real production traffic:

- [ ] Hard step limit configured and enforced in code (not left to the model's own judgment)
- [ ] Hard total token/cost budget configured and enforced, independent of the step limit
- [ ] Tool set explicitly allowlisted for this feature, not "whatever tools are registered"
- [ ] Every tool call has its own timeout and explicit error handling
- [ ] Tool arguments validated before execution, especially for any tool with side effects
- [ ] Human-approval gate defined for consequential, costly, or irreversible tool calls
- [ ] Full transcript (thoughts, tool calls, arguments, results) logged per run, with privacy-appropriate redaction
- [ ] End-to-end task success rate measured on a representative task set — not just per-step accuracy — see **Evaluation**
- [ ] Repeated-tool-call / non-convergence monitoring in place, alerting before it becomes a cost incident
- [ ] Memory/transcript growth handled deliberately (summarization or pruning), not left to grow unboundedly — see **Agent Memory**
- [ ] A non-agentic fallback path exists for when the agent fails, times out, or exceeds budget
- [ ] Model version pinned; prompt and tool-description changes evaluated before shipping, same discipline as any other prompt change
- [ ] Considered explicitly whether this task actually needs an agent, versus a fixed pipeline or single call — documented in the design, not just assumed
`,

  "common-mistakes": `
1. **Building an agent for a task that a single prompted call could solve** — the most common and most avoidable mistake on this page's topic; always check the decision table in Advanced Concepts first.
2. **No hard step or cost limit**, or one set so generously it might as well not exist — leads directly to runaway cost and non-terminating loop incidents.
3. **Giving the agent a large, loosely-scoped tool set "for flexibility"** — increases tool-misuse risk without a proportional capability gain; scope tightly per task.
4. **Trusting the model's own "I'm done" signal as the sole stopping condition**, with no externally enforced backstop.
5. **Confusing per-step accuracy with end-to-end reliability** — a model that is 95% accurate per step is not a 95%-reliable ten-step agent; see the compounding-error arithmetic in Advanced Concepts.
6. **Treating multi-agent architectures as a default upgrade over single-agent**, rather than a deliberate escalation justified by genuine role decomposition — multi-agent adds coordination overhead and its own compounding-error surface.
7. **Not validating tool call arguments before execution** — treating model-generated arguments as inherently safe is the same class of mistake as trusting any other unvalidated input, now arriving via the model.
8. **Letting the transcript grow unboundedly across a long-running agent** instead of budgeting and summarizing/pruning proactively.
9. **No human-approval gate for consequential actions** — deploying a fully autonomous agent for actions that are costly, irreversible, or customer-facing without a review step.
10. **Debugging from the final answer alone instead of the full transcript** — the originating bad decision is often several steps upstream of the visibly wrong output.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Agent never terminates / runs until the step limit every time | No genuine "done" condition reachable by the model, or a step/cost limit set too low for the real task, or a repeated-failure loop | Reconstruct the transcript; check whether the model can actually recognize success; verify the limit against realistic task complexity |
| Runaway cost from a single task | No hard token/cost budget enforced independent of step count | Add an explicit total-token budget, not just a step count, since step cost varies |
| Agent calls a tool with malformed or nonsensical arguments | Ambiguous tool description/schema, or no argument validation before execution | Tighten the tool's description and schema (see **Tool Calling**); validate arguments before execution regardless |
| Agent repeats the same failing tool call | No mechanism to recognize a repeated failure and change strategy | Feed back an explicit "this exact call already failed once" observation; consider a hard repeat-count guard |
| Final answer contradicts an earlier tool result | Transcript truncation/summarization dropped the relevant observation before the final step | Review memory/summarization strategy (**Agent Memory**); ensure critical facts are preserved, not just recent ones |
| Agent takes a wrong or unsafe action | Prompt-injected instruction in a tool result was followed as a command, or insufficient tool-permission scoping | Treat tool outputs as untrusted data, not instructions (see Security); tighten tool permission scope |
| High variance in step count for the same task type | Non-deterministic decision-making at each step (nonzero temperature) compounding across steps | Lower temperature at the decision step for tasks needing consistency; measure step-count distribution, not just an average |
| Multi-agent handoff loses context | No explicit hand-off contract between agents (what one agent passes to the next) | Define an explicit, structured hand-off format between agents rather than relying on free-text summaries |
`,

  faqs: `
**Q: Is a chatbot an agent?**
Not by itself. A chatbot is a series of single-shot calls, one per user turn, with no autonomous loop deciding to call tools and revise its plan based on the results within a single turn. An agent adds the loop, tools, and an explicit goal/stopping condition around the same underlying model.

**Q: Does an agent need multiple different tools to count as an agent?**
No — even a single tool used in a loop (call the tool, observe, decide whether to call it again or finish) is an agent by this page's definition. What matters is the loop and the ability to act and observe, not the number of distinct tools.

**Q: Why not just always use an agent, since it seems strictly more capable than a single call?**
Because "more capable in principle" is not "more reliable in practice" — every additional step is another chance to fail, another round of tokens billed, and more latency, per the compounding-error arithmetic in Advanced Concepts. A task fully specified up front does not benefit from a loop it does not need; it only pays the loop's costs.

**Q: What's the real difference between ReAct and plan-and-execute?**
ReAct decides one step at a time, interleaving reasoning with acting, and can adapt immediately to a surprising observation; plan-and-execute commits to a full plan before executing, trading some adaptiveness for predictability and often lower cost. Many production systems use both together, at different levels.

**Q: When is multi-agent actually worth the extra coordination complexity?**
When the task genuinely decomposes into distinct roles or expertise areas, when you need to keep each agent's context narrow and focused rather than one agent's transcript becoming unmanageably large, or when you want to isolate a narrow tool surface per agent for safety. It is not automatically better than a well-scoped single agent, and it multiplies the failure surface.

**Q: How do I stop an agent from running forever?**
Enforce a hard step limit and a hard total token/cost budget in code, never relying solely on the model's own judgment that it is "done" — see Production Checklist and Failure Modes.

**Q: My agent seems to work in testing but fails more often in production — why?**
Almost always either (a) production tasks are more varied/complex than the test set, pushing real step counts higher than tested, or (b) production tool results (real, messy data) differ from clean test fixtures in ways that trigger tool-misuse or misread-observation failures. Reconstruct real failed transcripts rather than assuming the test set was representative.

**Q: Where do I go next after this page?**
If your priority is designing what tools to give an agent, go to **Tool Calling**; if it's managing state across a long-running agent, go to **Agent Memory**; if it's the plan/re-plan mechanics, go to **Planning**; if it's catching an agent's own mistakes, go to **Reflection**; if it's picking a framework, go to **LangChain**, **LangGraph**, **CrewAI**, **OpenAI Agents SDK**, or **AutoGen** depending on your architecture; if it's vendor-neutral tool/context exposure, go to **MCP**.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is an AI agent, mechanically?* Model answer sketch: an LLM wired into a loop with tools, memory, and a goal — the model observes state, decides on an action (often a tool call), the action is executed outside the model, the result is fed back, and this repeats until a stopping condition is met.
2. *What's the difference between a chatbot and an agent?* A chatbot is a series of single-shot LLM calls, one per turn, with no autonomous loop deciding to call tools and act within a turn; an agent adds the perceive-plan-act-observe loop and tool use around the same kind of model.
3. *What is the perceive-plan-act-observe loop?* Perceive the current state (goal plus history/tool results so far); plan/decide the next action; act by executing a tool (outside the model); observe the real result and feed it back; repeat until done or a limit is hit.
4. *What is ReAct?* A pattern that interleaves explicit reasoning ("Thought") with tool-calling actions ("Action") and their results ("Observation") at each step, producing more grounded, inspectable decisions than jumping straight to an action.
5. *Name two agent-specific failure modes.* Infinite loops/non-termination, and tool misuse (calling the wrong tool, or a tool with malformed/unsafe arguments) — a strong answer also mentions compounding errors across steps and cost/latency blowup.

**Senior:**

6. *Why does chaining more steps in an agent make the task less reliable, not more capable, all else equal?* Because per-step success probabilities compound multiplicatively across a chain (assuming independence, which is generous), so overall success rate degrades sharply as step count grows even with a high per-step accuracy — a 95% per-step model chained across 20 steps succeeds only about 36% of the time end to end.
7. *When would you choose a fixed pipeline over an agent for a multi-step task?* When the sequence and number of steps is knowable up front regardless of intermediate results — a fixed pipeline is cheaper, more predictable, and easier to test than an agent, and should be preferred whenever the task's adaptiveness requirement doesn't actually require step-by-step branching.
8. *How would you design guardrails for an agent with a tool that can send money or delete data?* Discuss tight tool-permission scoping, argument validation before execution, a human-approval gate specifically for that tool, hard step/cost limits as a resource-abuse control, and treating tool outputs (which could carry injected instructions) as untrusted data rather than commands.
9. *A team wants to replace a single-agent system with a multi-agent one because "it seems more powerful." What do you tell them?* Multi-agent is a deliberate architectural escalation justified by genuine role decomposition or context-isolation needs, not an automatic capability upgrade — it multiplies both coordination complexity and the compounding-error surface (errors within each agent plus errors across hand-offs), and should be adopted only when a single well-scoped agent has become demonstrably unmanageable.
10. *How would you debug a production agent whose success rate dropped after a routine deploy?* Reconstruct full transcripts of failed runs first; check whether a tool description, prompt, or tool set changed; check whether step/cost budgets are being hit more often (indicating task complexity outgrew the budget); check whether a tool's real output format changed upstream, breaking the agent's ability to correctly interpret observations.
11. *Explain the tradeoff between ReAct and plan-and-execute in terms of cost and adaptiveness.* ReAct re-decides every step based on the latest observation, maximizing adaptiveness at the cost of a full model call per step and no ability to short-circuit known step sequences; plan-and-execute commits to a plan up front, often executing cheaper/deterministic steps without a model call each time, at the cost of needing an explicit re-planning trigger when reality diverges from the plan.
12. *How do you decide the right step limit and cost budget for a production agent?* Base it on the realistic distribution of steps genuinely needed by representative tasks (measured, not guessed), add a small margin, and treat a rising rate of runs hitting the limit as a signal to either raise the budget deliberately or decompose the task — never as a signal to simply keep raising the limit indefinitely.
`,

  "coding-questions": `
### 1. Implement a bounded agent loop with explicit stopping conditions

~~~python
from dataclasses import dataclass, field

@dataclass
class Step:
    thought: str
    tool_name: str | None
    arguments: dict
    observation: str | None

@dataclass
class AgentResult:
    final_answer: str | None
    status: str          # "success" | "budget_exceeded" | "crashed"
    steps_taken: int
    transcript: list = field(default_factory=list)

def run_bounded_agent(goal: str, tools: dict, decide_fn, max_steps: int,
                       max_total_tokens: int) -> AgentResult:
    """decide_fn(goal, transcript) -> (thought, tool_name_or_None, arguments,
    final_answer_or_None, tokens_used) -- stands in for the real LLM call."""
    transcript: list[Step] = []
    total_tokens = 0

    for _ in range(max_steps):
        thought, tool_name, arguments, final_answer, tokens_used = decide_fn(
            goal, transcript
        )
        total_tokens += tokens_used

        if final_answer is not None:
            return AgentResult(final_answer, "success", len(transcript), transcript)

        if total_tokens > max_total_tokens:
            return AgentResult(None, "budget_exceeded", len(transcript), transcript)

        if tool_name not in tools:
            # Tool-misuse guard: never silently execute an unrecognized tool.
            observation = f"error: tool '{tool_name}' is not allowed"
        else:
            try:
                observation = tools[tool_name](**arguments)
            except Exception as exc:                      # noqa: BLE001
                observation = f"error: tool call failed: {exc}"

        transcript.append(Step(thought, tool_name, arguments, observation))

    return AgentResult(None, "budget_exceeded", len(transcript), transcript)
~~~

Complexity: O(max_steps) LLM calls in the worst case, each dominated by the model's own inference latency, not by this orchestration code. Follow-ups: add a repeated-tool-call guard that aborts after N identical (tool, arguments) pairs in a row; add a per-tool timeout using a real async/threaded execution wrapper.

### 2. Detect and break a non-convergence (repeated-call) loop

~~~python
def has_repeated_failure_loop(transcript: list[Step], window: int = 3) -> bool:
    """Return True if the last 'window' steps called the same tool with the
    same arguments and got an error observation each time -- a strong signal
    the agent is stuck, not making progress."""
    if len(transcript) < window:
        return False
    recent = transcript[-window:]
    same_call = all(
        s.tool_name == recent[0].tool_name and s.arguments == recent[0].arguments
        for s in recent
    )
    all_errors = all(
        s.observation is not None and s.observation.startswith("error:")
        for s in recent
    )
    return same_call and all_errors

# Production note: detecting this mid-run lets the orchestrator inject an
# explicit "this call has failed repeatedly, try a different approach or
# give up" observation, rather than silently burning the remaining step
# budget on a call that will keep failing identically.
~~~

Complexity: O(window) per check, O(max_steps) total if checked every step. Follow-ups: generalize "same arguments" to "semantically similar arguments" using a similarity threshold instead of exact equality; escalate to a human/fallback path after detection rather than only logging it.

### 3. Compute expected end-to-end success rate given per-step accuracy

~~~python
def expected_success_rate(per_step_accuracy: float, num_steps: int) -> float:
    """Naive independent-errors model: overall success is per_step_accuracy
    raised to num_steps. Real agents often have CORRELATED errors (one bad
    step makes the next step more likely to fail too), so treat this as an
    optimistic upper bound, not an exact prediction."""
    if not 0.0 <= per_step_accuracy <= 1.0:
        raise ValueError("per_step_accuracy must be between 0 and 1")
    return per_step_accuracy ** num_steps

for n in (1, 3, 5, 10, 20):
    print(n, round(expected_success_rate(0.95, n), 3))
~~~

Complexity: O(1) per computation. Follow-ups: extend the model to allow a recovery probability (chance a failed step's error is caught and corrected by a later reflection/verification step, per the **Reflection** skill) and show how that changes the curve; discuss why treating steps as independent is optimistic, not realistic.
`,

  "hands-on-labs": `
### Lab 1 — From-scratch ReAct loop with one real tool (beginner, ~1.5h)
Using a real LLM API and a single real tool (e.g. a web search API or a simple calculator function), implement the full perceive-plan-act-observe loop from scratch (no framework), with an explicit hard step limit. Deliverable: a working script plus a short write-up of what happened when you deliberately set the step limit too low. Skills exercised: the core loop mechanics, stopping-condition design.

### Lab 2 — Task-fit decision exercise (beginner/intermediate, ~1h)
Given ten short task descriptions (provided or self-authored, spanning clearly-single-call, clearly-fixed-pipeline, and clearly-agent-shaped tasks), classify each using the decision table in Advanced Concepts, and write one sentence justifying each classification. Deliverable: a short document. Skills exercised: honest architectural judgment about when an agent is warranted — arguably the most practically valuable skill on this page.

### Lab 3 — Guardrailed multi-tool agent with budget enforcement (intermediate, ~2.5h)
Extend Lab 1's agent with at least two more tools, an explicit tool allowlist, argument validation before execution, a hard token/cost budget in addition to the step limit, and a repeated-failure-loop guard (see Coding Questions #2). Deliverable: a tested module, plus a demonstration of the budget and loop-guard actually firing on a deliberately adversarial or malformed input. Skills exercised: production guardrail design, tool-misuse defense.

### Lab 4 — End-to-end evaluated agent with human-approval gate (production, ~3.5-4h)
Build a small service exposing an agent for a task involving at least one consequential action (e.g. drafting, but not sending, an email; or proposing, but not executing, a database write), with a human-approval step required before the consequential action executes, full transcript logging, and a small evaluation script measuring end-to-end task success across at least ten representative tasks. Deliverable: a running service, an evaluation report, and a short incident-response note describing what you'd check first if success rate dropped. Skills exercised: the full production-usage picture this page covers, tied together, plus a first taste of the **Evaluation** skill applied to multi-step outcomes.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate agent-fundamentals mastery (each also reaches into a sibling skill):

1. **Budget-aware research agent** — An agent that answers multi-step research questions using a search tool and a note-taking/summarization tool, with a hard step and token budget, full transcript logging, and an explicit "I don't have enough information" fallback rather than guessing when the budget runs out before an answer is found. Demonstrates: bounded-loop design, honest stopping-condition handling — directly relevant to the **Tool Calling** and **Agent Memory** skills.

2. **Task-router that chooses architecture per request** — A service that, given an incoming task description, classifies it (using the decision table in Advanced Concepts, implemented as a lightweight classifier or prompted judgment) into "single call," "fixed pipeline," or "agent," and routes accordingly, logging which path was chosen and the eventual outcome. Demonstrates: the architectural-judgment skill this page emphasizes as its most practically valuable lesson, made concrete and measurable.

3. **Guardrailed operational agent with approval workflow** — An agent scoped to a small set of internal-style tools (e.g. simulated ticket lookup, simulated status-update, simulated notification-send), with tight tool-permission scoping, argument validation, a human-approval queue for any state-changing tool call, and full audit logging. Demonstrates: the production guardrail architecture (Security, Production Usage) applied end to end — bridges directly into the **Tool Calling** and **Guardrails** skills.

Each project should include: explicit step/cost budget instrumentation, a documented rationale for why the chosen architecture (single call, pipeline, or agent) fits the task, a measured end-to-end success rate across a representative task set (not just anecdotal examples), and a written failure-mode analysis (what happens when a tool fails, when the budget is hit, when input is adversarial) — the engineering discipline around the loop is what distinguishes a fundamentals-level demo from a portfolio-grade project.
`,

  "case-studies": `
### The early autonomous-agent demo wave and its cost/reliability wake-up call
The 2023 wave of open-source "fully autonomous" agent projects captured enormous public attention by demonstrating agents that could, in principle, decompose an open-ended goal into subtasks and pursue them with minimal supervision. Just as quickly, widespread practical experience showed these agents commonly ran for far longer than intended, burned significant API spend, and frequently drifted from the original goal without external bounds. Lesson: an agent's theoretical ability to keep going is not the same as it being productive to let it — hard step/cost limits and narrow scoping, not open-ended autonomy, are what made agents production-viable afterward.

### The shift from free-text tool parsing to native structured function calling
Early LLM agent implementations often had the model emit a specific text format for tool calls (as in this page's toy beginner example), which developers then parsed with string matching or regexes — a fragile approach prone to malformed or unparseable outputs. The maturation of native structured/function-calling APIs from major providers materially improved tool-call reliability, because the model's tool-call intent became a structured, schema-validated object rather than free text to parse. Lesson: much of what made agents "actually work" in production was unglamorous reliability engineering in the tool-calling interface, not a breakthrough in the model's reasoning ability — see the **Tool Calling** skill for the depth here.

### Multi-agent systems adopted for context isolation, not just capability
Several teams building research- and content-generation agents found that a single agent's transcript grew unmanageably large and unfocused as tasks grew in scope, degrading decision quality at later steps. Splitting the task across a small number of narrowly-scoped agents (each with its own focused context and tool set) improved reliability, not primarily by adding "more intelligence," but by keeping each agent's working context small and relevant. Lesson: multi-agent's real, well-evidenced benefit in many production cases is context and role isolation, not a mysterious emergent capability boost from having multiple agents — a useful corrective against overclaiming what multi-agent architectures buy you.

### Coding agents and the value of a tight feedback loop (tests as ground truth)
Autonomous coding agents that iterate using a real, executable feedback signal (running the actual test suite and observing pass/fail) have shown materially more reliable outcomes than agents reasoning purely in free text about whether their code "should" work. Lesson: an agent's tool set matters enormously, and a tool that provides ground-truth verification (like a test runner) is disproportionately valuable compared to tools that only provide more information to reason about — directly relevant to the **Reflection** skill's verification-loop ideas.
`,

  comparisons: `
| Dimension | Single LLM call | Fixed pipeline (deterministic code + LLM/tool calls) | Single agent (ReAct-style loop) | Multi-agent system |
|---|---|---|---|---|
| Adapts to intermediate results | No | No (branching is hand-coded, not model-decided) | Yes | Yes, plus cross-agent coordination |
| Step count | Fixed (one) | Fixed, known up front | Variable, bounded by a limit | Variable per agent, plus coordination overhead |
| Reliability profile | Bounded by one call's accuracy | Bounded by each fixed step's accuracy, but no compounding from model-decided branching errors | Compounds per-step error rates multiplicatively | Compounds per-step error rates within AND across agent hand-offs |
| Cost/latency | Lowest | Low-to-moderate, predictable | Higher, variable per task | Highest, variable, plus coordination cost |
| Best for | Fully specified, one-shot tasks | Known step sequence, even if it calls tools/models at each step | Tasks needing step-by-step adaptiveness with a small, well-tooled action space | Tasks with genuine role decomposition or a need to isolate context/tools per role |
| Where covered on this platform | **LLM Fundamentals**, **Prompt Engineering** | This page (background); implementation detail in framework skills | This page; framework depth in **LangChain**, **LangGraph**, **OpenAI Agents SDK** | This page (background); depth in **CrewAI**, **AutoGen** |

**How seniors choose**: start at the top of this table and move down only when the row above demonstrably cannot solve the task — a single call if the task is fully specified; a fixed pipeline if the step sequence is knowable up front even with tool calls involved; a single, tightly-scoped agent only when genuine step-by-step adaptiveness is required; multi-agent only when a single agent's role or context has become unmanageably overloaded. Treat each step down this table as a deliberate cost/reliability tradeoff, not a capability upgrade you get for free.
`,

  "related-technologies": `
- **LLM Fundamentals** — the model doing the deciding at every step of an agent's loop; read this first if you have not already.
- **Prompt Engineering** — how to prompt the decision step reliably; every agent's "brain" at each step is a prompted LLM call.
- **Tool Calling** — designing, describing, and safely exposing the functions an agent can invoke; the mechanics of structured function-calling APIs.
- **Agent Memory** — how state persists and is managed within and across agent runs, including summarization/pruning strategies for long-running loops.
- **Planning** — plan representation, re-planning triggers, and hierarchical/plan-and-execute architectures in depth.
- **Reflection** — self-critique and verification techniques that catch an agent's own mistakes before they compound further.
- **LangChain** — a widely used general-purpose framework for composing LLM calls, tools, and agent loops.
- **LangGraph** — a graph-based orchestration framework for building more explicitly stateful, controllable agent workflows.
- **CrewAI** — a framework built specifically around role-based multi-agent orchestration.
- **OpenAI Agents SDK** — a provider-native toolkit for building agents against OpenAI's models and tool-calling primitives.
- **AutoGen** — a framework built around multi-agent conversation patterns.
- **MCP (Model Context Protocol)** — a vendor-neutral standard for exposing tools and context to agents across frameworks and providers.
- **RAG** — retrieval-augmented generation is one of the most common tools an agent is given; understanding it independently helps you design better retrieval tools.
- **Evaluation** and **Guardrails** — general LLM-system disciplines that apply with extra force to multi-step, tool-using agents.

On this platform, the natural path from here: **Agent Fundamentals** → **Tool Calling** (give an agent real capability) → **Agent Memory** and **Planning** (manage state and structure over longer tasks) → **Reflection** (catch its own mistakes) → a specific framework (**LangChain**, **LangGraph**, **CrewAI**, **OpenAI Agents SDK**, **AutoGen**) matched to your architecture, and **MCP** if you need vendor-neutral tool interoperability.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check each framework's official documentation and recent release notes for anything more current, since this is one of the fastest-moving categories on the platform.

- Native, structured tool/function calling is now a standard, broadly supported feature across major model provider APIs, rather than something developers commonly hand-parse from free text — this has materially improved agent reliability compared to earlier text-parsing approaches, though exact schema conventions still vary by provider.
- The **Model Context Protocol (MCP)** has gained significant adoption as a vendor-neutral way to expose tools and context to agents, aiming to reduce the amount of framework-specific or provider-specific integration work needed to give an agent a new capability — check current adoption and provider support before assuming universal compatibility.
- Provider-native agent toolkits (such as the **OpenAI Agents SDK**) and graph-based orchestration frameworks (such as **LangGraph**) have matured as alternatives to fully autonomous, open-ended agent loops, generally emphasizing more explicit state and control-flow over maximal autonomy — reflecting the production lesson (see Case Studies) that bounded, inspectable agents have proven more durable than fully open-ended ones.
- Multi-agent frameworks (**CrewAI**, **AutoGen**, and others) continue to evolve rapidly; which one best fits a given team's needs depends heavily on the specific coordination pattern required, and this page will not assert a current "best" framework.
- Reasoning-oriented models that spend additional inference-time computation before answering (see **LLM Fundamentals**' Latest Updates) interact with agent design in an evolving way — some teams are finding that stronger single-step reasoning reduces the number of agent loop iterations needed for a given task, though this tradeoff is still being worked out in practice across different task types.

Given how quickly specific framework capabilities, benchmark claims, and best-practice recommendations change in this category, treat any specific framework comparison you read here or elsewhere as a snapshot to re-verify against current documentation, not a permanent ranking.
`,

  "future-roadmap": `
Where the agent-fundamentals picture is heading, and what is worth betting career time on:

1. **The core loop (perceive-plan-act-observe) and the compounding-error arithmetic are durable ideas** that will remain true regardless of which specific framework or model generation is current — understanding these deeply is a better long-term investment than memorizing any one framework's API surface.
2. **Standardized tool/context protocols (MCP and likely successors or competitors) are likely to keep reducing the integration cost of giving agents new capabilities**, shifting more engineering effort toward tool design and guardrails and away from bespoke per-framework integration glue.
3. **The industry's center of gravity is visibly shifting from "maximal autonomy" toward "bounded, inspectable, human-checkpointed" agent design**, per the Case Studies above — betting on skills in guardrail design, evaluation of multi-step outcomes, and honest architectural judgment (agent vs. pipeline vs. single call) is likely to age better than betting on any specific "fully autonomous agent" framework or pattern.
4. **Stronger single-call reasoning (including inference-time-compute-heavy models) may reduce, but is unlikely to eliminate, the need for agents** — some tasks will keep requiring genuine external action and adaptively responding to real-world information that no amount of pretrained reasoning alone can substitute for, but the boundary of "which tasks actually need a multi-step agent versus a strong single call" will likely keep shifting.
5. **Multi-agent orchestration, memory management, and reflection/verification techniques are still an actively developing engineering discipline**, not a solved problem — expect continued evolution in how these are architected, and treat current best practices (including the ones on this page) as the current state of an evolving field, not a final answer.

For your career: the highest-leverage, most durable skill from this page is the honest, disciplined judgment of when an agent is genuinely warranted versus when a simpler architecture would be more reliable and cheaper — that judgment stays valuable even as the specific frameworks and models underneath it change.
`,

  "cheat-sheet": `
~~~text
# --- Core definition ---
Agent = an LLM in a loop, with tools, memory, and a goal.
Not a different kind of model -- the same LLM from LLM Fundamentals,
wrapped in a control loop that lets it act and observe real results.

# --- The loop ---
PERCEIVE: goal + state (history + tool results) given to the model
PLAN:     model decides -- call a tool, or give a final answer?
ACT:      code OUTSIDE the model actually executes the requested tool
OBSERVE:  the real tool result is appended to state
REPEAT until: model signals done, OR step limit hit, OR cost budget hit
(the loop, never the model alone, must own termination)

# --- Chatbot vs agent ---
Chatbot: one single-shot LLM call per turn, no tool-driven branching
Agent:   multi-step loop, decides actions, observes real results

# --- Architectures ---
ReAct            : Thought -> Action -> Observation, one step at a time,
                    maximizes adaptiveness, costs one call per step
Plan-and-execute  : plan fully up front, then execute (re-plan only if
                    reality diverges) -- cheaper, more predictable
Single agent      : one LLM-in-a-loop handles the whole task
Multi-agent       : task split across specialized agents + orchestration
                    (adds coordination overhead AND more compounding error)

# --- When agents are (and are NOT) the right tool ---
Fully specified, one output           -> single prompted call
Known step sequence, even w/ tools    -> fixed pipeline
Steps depend on intermediate results  -> single, tightly-bounded agent
Genuine role decomposition needed     -> multi-agent (deliberate escalation)
DEFAULT BIAS: most tasks need row 1 or 2, NOT an agent.

# --- Why more steps hurts, not helps ---
overall success = (per_step_success) ^ num_steps
p=0.95, n=10  -> ~60% end-to-end success
p=0.95, n=20  -> ~36% end-to-end success
Fewer, more capable steps beats many small ones. Minimize step count.

# --- Failure modes (memorize these) ---
Infinite loops / non-termination : no hard step/cost limit enforced
Tool misuse                      : wrong tool, bad/unsafe arguments
Compounding errors                : one bad step corrupts every later step
Cost/latency blowup               : cost scales with steps taken, not fixed

# --- Production musts ---
Hard step limit + hard token/cost budget, enforced in code.
Tight tool allowlist, never "every registered tool."
Validate tool arguments before execution.
Human-approval gate for consequential/irreversible tool calls.
Log the FULL transcript (thought/tool/args/observation), not just output.
Treat tool outputs as untrusted DATA, never as instructions.

# --- Sibling skills map ---
Tool Calling      -> designing/exposing the functions an agent can call
Agent Memory      -> managing state within and across runs
Planning          -> plan representation, re-planning triggers
Reflection        -> self-critique / verification of the agent's own work
LangChain         -> general-purpose composition framework
LangGraph         -> graph-based, explicitly stateful orchestration
CrewAI            -> role-based multi-agent orchestration
OpenAI Agents SDK -> provider-native agent toolkit
AutoGen           -> multi-agent conversation framework
MCP               -> vendor-neutral tool/context exposure standard
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is an AI agent, mechanically? | An LLM in a loop with tools, memory, and a goal -- perceive, plan, act, observe, repeat until done or a limit is hit |
| What's the core difference between a chatbot and an agent? | A chatbot is single-shot calls per turn with no autonomous tool-driven loop; an agent decides actions, executes tools, and observes real results within a task |
| What are the four stages of the agent loop? | Perceive, plan, act, observe |
| What is ReAct? | A pattern interleaving explicit reasoning (Thought) with tool-calling actions and their observed results, one step at a time |
| What is plan-and-execute? | Produce a full plan up front, then execute it, re-planning only if reality diverges from the plan |
| Why does chaining more agent steps reduce reliability? | Per-step success probabilities compound multiplicatively; overall success = per_step_success raised to the number of steps |
| What is the single most common agent-design mistake? | Reaching for an agent when a single well-prompted call or a fixed pipeline would solve the task more cheaply and reliably |
| What must own the agent's stopping condition? | The orchestrating code (hard step limit, cost budget), never the model's own judgment alone |
| Name the four core agent-specific failure modes. | Infinite loops, tool misuse, compounding errors across steps, cost/latency blowup |
| When is multi-agent actually justified? | Genuine role/task decomposition, or a need to isolate context/tool surface per role -- not as a default upgrade over single-agent |
| Why should tool outputs be treated as untrusted data? | A tool result can contain adversarial text the model may follow as an instruction (prompt injection with a direct path to a real action) |
| What capability actually distinguishes an agent from a chatbot? | Tool use -- the ability to affect or query the world beyond the conversation, not "better reasoning" |
| What's the first thing to check when debugging a failed agent run? | The full transcript (thoughts, tool calls, arguments, observations), not just the final wrong answer |
| Which skill covers designing the functions an agent can call? | Tool Calling |
| Which skill covers managing state across a long-running agent? | Agent Memory |
`,

  mcqs: `
**1. What best defines an AI agent as covered on this page?**

A) Any chatbot that can hold a multi-turn conversation  B) An LLM wired into a loop with tools, memory, and a goal, that acts and observes real results  C) Any model larger than a certain parameter count  D) A rule-based decision tree with no LLM involved

**Answer: B** — the loop, tool use, and explicit goal/stopping condition are what make something an agent, not model size or conversational ability alone.

**2. Why does adding more steps to an agent's task generally reduce end-to-end reliability, all else equal?**

A) Longer contexts always confuse the model  B) Per-step success probabilities compound multiplicatively across the chain  C) More steps always means a bigger, slower model is used  D) It doesn't -- more steps are strictly more capable

**Answer: B** — see the compounding-error arithmetic in Advanced Concepts; this is the single most important quantitative fact on this page.

**3. A task is fully specified up front and needs no external lookup or intermediate-result-dependent branching. What's the right architecture?**

A) A multi-agent system  B) A single well-prompted LLM call  C) An open-ended ReAct agent with a generous step limit  D) A reinforcement-learning policy trained from scratch

**Answer: B** — reaching for an agent here only adds cost, latency, and failure surface with no benefit; see the decision table in Advanced Concepts.

**4. What should own an agent's stopping condition in a well-designed system?**

A) The model's own stated confidence that it is done, exclusively  B) An externally enforced step limit and/or cost budget, in code  C) The user, who must manually stop every run  D) Nothing -- agents should run until a tool returns an error

**Answer: B** — the model can propose that it is done, but a hard, code-enforced backstop must exist, since a model can be miscalibrated about its own progress in either direction.

**5. Why should tool outputs (like a retrieved document or database record) be treated as untrusted data rather than trusted instructions?**

A) Tools are always slower than direct model reasoning  B) A tool result can contain adversarial text that, if treated as an instruction, gives an attacker a path to a real, side-effecting action  C) Tool outputs are never relevant to the final answer  D) Tools cannot return text, only numbers

**Answer: B** — this is the agent-specific escalation of prompt injection risk: the blast radius extends to real actions, not just a bad text response.

**6. When is a multi-agent architecture actually justified over a well-scoped single agent?**

A) Always -- more agents are strictly more capable  B) Only when genuine role/task decomposition or context/tool isolation needs exist, since it also multiplies coordination overhead and compounding-error surface  C) Only when the team has a large compute budget  D) Never -- multi-agent systems have no valid production use case

**Answer: B** — multi-agent is a deliberate, justified escalation, not a default upgrade; see Advanced Concepts and Comparisons.
`,

  "revision-notes": `
**What an agent is, in five lines:** An AI agent is an LLM wired into a loop with tools, memory, and a goal -- it perceives the current state, plans/decides on an action (often a tool call), an action executes outside the model, the real result is observed and fed back, and this repeats until a stopping condition is met. The intelligence making decisions is the same LLM covered in **LLM Fundamentals**; what makes it an agent is the surrounding loop and tool access, not a different kind of model. Tool use, not "better reasoning," is the capability that actually distinguishes an agent from a chatbot.

**Architectures, in four lines:** ReAct interleaves explicit reasoning with tool-calling actions one step at a time, maximizing adaptiveness at the cost of a full model call per step; plan-and-execute commits to a full plan up front and executes it, trading adaptiveness for predictability and often lower cost. Single agents handle a whole task themselves; multi-agent systems split a task across specialized agents with an orchestration layer, which is a deliberate escalation justified by genuine role decomposition or context isolation, not an automatic capability upgrade.

**Why agents are often overkill, in four lines:** Most real tasks are fully specified up front (needing only a single well-prompted call) or have a knowable step sequence (a fixed pipeline suffices) -- an agent's adaptive loop should be reserved for tasks whose correct next step genuinely depends on intermediate results. Every additional step an agent takes is another full model call: more cost, more latency, and, critically, another multiplicative tax on end-to-end reliability, since per-step error rates compound across a chain rather than averaging out.

**Failure modes, in three lines:** The core agent-specific failure modes are infinite loops/non-termination (no enforced stopping condition), tool misuse (wrong tool or unsafe arguments), compounding errors across steps (one bad decision corrupts everything downstream), and cost/latency blowup (cost scales with however many steps a task happened to need, not a fixed amount). Guardrails -- hard step and cost limits, tight tool scoping, argument validation, human-approval gates for consequential actions -- exist specifically to bound these failure modes, not as optional polish.

**Production and the sibling-skill map, in four lines:** Production agents are almost always narrower, more bounded, and more human-checkpointed than open-ended demos suggest -- tight tool allowlists, enforced step/cost budgets, and full transcript logging are standard practice. Tool Calling covers designing the functions an agent can call; Agent Memory covers managing state across a run and across sessions; Planning covers plan representation and re-planning; Reflection covers self-critique and verification. The framework skills (LangChain, LangGraph, CrewAI, OpenAI Agents SDK, AutoGen) and the interoperability standard (MCP) implement these concepts concretely, but the concepts on this page outlive any one framework's current API.
`,

  "learning-roadmap": `
A realistic path through agent fundamentals and into the sibling skills (adjust pace to your background):

**Week 1 — Prerequisites check.** If you have not already, work through **LLM Fundamentals** and the core of **Prompt Engineering** first -- this page assumes both without re-deriving them. Milestone: you can explain tokens, context windows, and sampling well enough to reason about why every extra agent step has a real token and latency cost.

**Week 2 — The loop and single-tool agents.** Beginner and Intermediate Concepts sections here; run Lab 1 (from-scratch ReAct loop). Milestone: you can implement and explain a bounded perceive-plan-act-observe loop without a framework.

**Week 3 — Architectural judgment.** Advanced Concepts (the compounding-error arithmetic, the decision table) and run Lab 2 (task-fit decision exercise). Milestone: given a new task description, you can confidently and correctly judge whether it needs a single call, a fixed pipeline, or an agent, and explain why.

**Week 4 — Guardrails and production discipline.** Production Usage through Production Checklist sections; run Lab 3 (guardrailed multi-tool agent). Milestone: a working agent with enforced step/cost budgets, a tool allowlist, and argument validation.

**Week 5 — Failure modes and debugging.** Failure-mode-adjacent sections (Anti-Patterns, Common Mistakes, Common Errors, Debugging, Monitoring); run Lab 4 (end-to-end evaluated agent with human-approval gate). Milestone: a deployed, monitored agent with a documented incident-response note.

**Week 6 onward — Branch into the sibling skills based on your immediate need**: go to **Tool Calling** next if your priority is designing what tools to expose; go to **Agent Memory** if your agents are running long enough that context management is now the bottleneck; go to **Planning** or **Reflection** if you need more structured multi-step or self-correcting behavior; go to a specific framework (**LangChain**, **LangGraph**, **CrewAI**, **OpenAI Agents SDK**, **AutoGen**) once you know which architecture (single-agent, graph-based, multi-agent) fits your problem; go to **MCP** if you need vendor-neutral tool interoperability across frameworks. Most engineers should read **Tool Calling** immediately after this page, since well-designed tools are the highest-leverage lever on real agent capability and reliability.
`,

  "official-docs": `
- Provider agent/tool-calling documentation (OpenAI, Anthropic, and other model providers) — the ground truth for current function-calling schema conventions, agent-toolkit primitives, and any provider-native agent SDK; these change frequently, so check live docs rather than a remembered schema.
- Framework documentation for **LangChain**, **LangGraph**, **CrewAI**, the **OpenAI Agents SDK**, and **AutoGen** — each sibling skill on this platform links to and builds on the respective framework's official docs for implementation-level detail beyond this page's framework-agnostic scope.
- The **Model Context Protocol (MCP)** specification and reference documentation — the authoritative source for the current protocol shape if you are building or consuming MCP-compatible tools.
- Provider model/agent release notes — typically describe changes to tool-calling behavior, reasoning/inference-time-compute features, and known limitations relevant to agent design; the most reliable first source for "what changed in this version" that might affect agent reliability.
`,

  books: `
- **Artificial Intelligence: A Modern Approach** — Russell & Norvig. The canonical source for the classical agent concept (perceive-act loops, rational agents) that predates and underlies the LLM-specific agent patterns on this page; strong for understanding why "agent" meant something before LLMs existed.
- **Designing Machine Learning Systems** — Chip Huyen. Not agent-specific, but the production-systems framing (monitoring, evaluation, reliability engineering) generalizes directly to the operational concerns raised throughout this page.
- **Speech and Language Processing** — Jurafsky & Martin (freely available draft chapters online). Useful background for the underlying language-modeling concepts an agent's decision step relies on; see also **LLM Fundamentals**'s book recommendations.
- Framework-specific documentation-as-book resources (official guides published alongside **LangChain**, **LangGraph**, and similar frameworks) — treat these as the practical companion to this page's conceptual grounding, and check them for the current API surface rather than relying on a fixed edition.

Given how fast agent-specific practice moves, prioritize the **Research Papers** and **Blogs** sections below, and framework/provider documentation, over any book for current specifics — books are best here for durable conceptual foundations (the classical agent concept, general systems engineering), not current framework behavior.
`,

  blogs: `
- **Provider engineering/research blogs** (OpenAI, Anthropic, Google DeepMind, Microsoft Research) — high-signal source for how the organizations building agent toolkits and frameworks describe their own design choices and observed production lessons.
- **LangChain's and LangGraph's official blogs** — practitioner-oriented posts on agent architecture patterns, common pitfalls, and framework updates, often directly reflecting the loop/memory/tool concepts covered on this page.
- **Microsoft Research's AutoGen blog and publications** — detailed writeups of multi-agent conversation patterns and the reasoning behind them.
- **Simon Willison's blog** — consistently clear, skeptical, practitioner-grounded writing on LLM agents, tool use, and prompt injection risks specifically; a good corrective against overclaiming agent capability.
- **Hugging Face blog** — practitioner-oriented explainers on agent frameworks, evaluation, and open-source tooling in this space.
`,

  "research-papers": `
Agent fundamentals draws on both classical AI and recent LLM-specific work; here are foundational and directly relevant papers, with honest framing of which claims are well-established vs. still actively evolving:

- **"ReAct: Synergizing Reasoning and Acting in Language Models"** (Yao et al., 2022) — the paper formalizing the interleaved reasoning-and-acting pattern this page describes in Intermediate Concepts; foundational reading for understanding where the "Thought/Action/Observation" pattern originates.
- **Classical agent theory** as formalized in Russell & Norvig's textbook (see Books) — not a single paper, but the conceptual lineage (perceive-act loops, rational agents) that LLM-based agents inherit and specialize.
- **Toolformer and related tool-use papers** (e.g. Schick et al., 2023) — early work demonstrating that language models can learn to decide when and how to call external tools, foundational to the tool-use capability this page treats as the core distinguishing feature of an agent.
- **Reflexion and related self-critique/verification papers** — foundational for the **Reflection** skill's territory; relevant here because they address the "how does an agent know it is actually done, correctly" problem raised in Advanced Concepts.
- **Multi-agent conversation and orchestration papers** (e.g. the AutoGen paper from Microsoft Research) — foundational reading for the **AutoGen** and **CrewAI** skills' territory, and for understanding the coordination-overhead tradeoffs discussed in Comparisons.

This area moves fast enough that the most current, most rigorously evaluated papers on agent reliability and multi-agent coordination are best found via a live search of recent proceedings (NeurIPS, ICML, ACL) rather than a fixed list — treat the papers above as the durable foundational layer, not the current frontier.
`,

  videos: `
- Conference talks and technical presentations from major agent-framework maintainers (LangChain, Microsoft Research's AutoGen team, and similar) walking through real production agent architectures and lessons learned — high-signal for connecting this page's concepts to concrete implementation choices.
- Recorded talks specifically on the ReAct pattern and tool-use papers listed above — useful for hearing the original authors' framing directly, rather than secondhand summaries.
- Practitioner walkthroughs of building a coding agent or research agent from scratch (searching current video platforms for recent, well-regarded examples is more useful than any fixed recommendation here, given how quickly framework APIs change).
- University-level AI course lecture recordings covering the classical agent concept (perceive-act loops, rational agents) as background before diving into the LLM-specific material on this page.
`,

  "github-repos": `
- **LangChain** and **LangGraph** repositories — widely used, general-purpose and graph-based agent orchestration frameworks; good for seeing real tool-calling and loop implementations end to end.
- **CrewAI** repository — a framework built specifically around role-based multi-agent orchestration; useful for seeing a concrete multi-agent hand-off pattern implemented.
- **AutoGen** repository (Microsoft Research) — a framework built around multi-agent conversation patterns; useful for a different multi-agent coordination model than CrewAI's.
- The **OpenAI Agents SDK** repository — a provider-native agent toolkit; useful for seeing tool-calling and agent-loop conventions from a major model provider directly.
- **Model Context Protocol (MCP)** reference implementation repositories — useful for seeing the current vendor-neutral tool/context exposure standard implemented concretely.
- Reflexion and similar self-critique/verification reference implementations — useful for seeing a concrete "reflection" loop implemented, bridging into the **Reflection** skill.
- Well-regarded from-scratch agent-loop example repositories (search for current, actively maintained examples) — valuable specifically because they show the loop mechanics without a framework's abstractions hiding them, matching this page's own from-scratch beginner example.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Loop-mechanics fluency*: implement the bounded agent loop from Coding Questions #1 from memory, then extend it with a repeated-failure-loop guard (Coding Questions #2) without looking at the reference implementation.
2. *Architectural judgment*: for 15 varied task descriptions (mix of clearly-single-call, clearly-pipeline, and clearly-agent-shaped tasks, including some deliberately ambiguous ones), classify each using the decision table in Advanced Concepts and defend your classification in one sentence; have a peer challenge your borderline calls.
3. *Compounding-error math*: given a hypothetical per-step accuracy and a range of step counts, compute expected end-to-end success rates by hand, then verify with the code from Coding Questions #3; discuss why real agents often do worse than this optimistic independent-errors estimate.
4. *Guardrail design*: given a hypothetical agent with a sensitive tool (e.g. one that can delete records), write out the full guardrail design (tool scoping, argument validation, human-approval gate, logging) before writing any code, then implement it.
5. *Failure-mode diagnosis*: given three synthetic failed-agent transcripts (infinite loop, tool misuse, and a compounding-error case), diagnose which failure mode each represents and propose the specific fix from Best Practices or Anti-Patterns that addresses it.
6. *Single vs multi-agent tradeoff*: given a task that could plausibly be built either as one agent with many tools or as three narrowly-scoped agents with a manager, design both architectures on paper and argue which you would actually ship, and why.

External sets: framework-specific quickstart tutorials (LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK) as hands-on practice once the framework-agnostic concepts here are solid; any current agent-benchmark suite's task set as a way to see end-to-end task success measured in practice.
`,

  "architecture-diagram": `
The reference architecture for a production agent-backed feature — the shape the sibling skills each go deep on one part of:

~~~mermaid
flowchart TB
    Client["Client application"] --> App["Application layer\n(goal framing, task routing)"]
    App --> Decide{"Does this task actually\nneed an agent?"}
    Decide -->|No| SingleCall["Single prompted call\nor fixed pipeline"]
    Decide -->|Yes| Orchestrator["Agent orchestrator / loop"]
    Orchestrator --> LLM["LLM decision step\n(ReAct / plan-and-execute)"]
    LLM -->|tool call requested| Guard["Guardrail: allowlist check,\nargument validation"]
    Guard -->|needs approval| Human["Human-approval gate\n(consequential actions)"]
    Guard -->|approved, no gate needed| ToolExec["Tool execution"]
    Human -->|approved| ToolExec
    ToolExec --> Memory[("Memory / transcript store")]
    Memory --> Orchestrator
    LLM -->|final answer| App
    SingleCall --> App
    App --> Client
    Orchestrator --> Budget["Step-limit / cost-budget\nenforcement"]
    Budget -->|limit hit| App
    subgraph Support["Supporting systems"]
        Monitor["Step count, cost, tool-call,\nrepeated-call monitoring"]
        Eval["Evaluation: end-to-end\ntask success rate"]
    end
    Orchestrator --> Support
~~~

Every labeled box in this diagram corresponds to a sibling skill on this platform: the "does this need an agent" gate is the architectural judgment this page emphasizes most; tool execution and its guardrail -> **Tool Calling**; the memory/transcript store -> **Agent Memory**; the LLM decision step's internal structure -> **Planning** and **Reflection**; the orchestrator itself, concretely -> **LangChain**, **LangGraph**, **CrewAI**, **OpenAI Agents SDK**, or **AutoGen** depending on architecture; evaluation of end-to-end success -> **Evaluation**.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Agent Fundamentals))
    What it is
      LLM in a loop
      Tools + memory + goal
      Not a different model, a control loop
    The loop
      Perceive
      Plan
      Act
      Observe
      Explicit stopping condition
    Architectures
      ReAct
        Interleaved thought/action/observation
      Plan-and-execute
        Plan up front, execute, re-plan if needed
      Single agent
      Multi-agent
        Role decomposition
        Coordination overhead
    Tool use as the core capability
      Distinguishes agent from chatbot
      Real side effects require guardrails
    When agents are overkill
      Single well-prompted call
      Fixed deterministic pipeline
      Decision table by task shape
    Failure modes
      Infinite loops
      Tool misuse
      Compounding errors across steps
      Cost/latency blowup
    Production discipline
      Hard step and cost limits
      Tight tool allowlists
      Human-approval gates
      Full transcript logging
    Sibling skills
      Tool Calling
      Agent Memory
      Planning
      Reflection
      LangChain
      LangGraph
      CrewAI
      OpenAI Agents SDK
      AutoGen
      MCP
    Prerequisite skills
      LLM Fundamentals
      Prompt Engineering
~~~
`,
};

export default agentFundamentals;
