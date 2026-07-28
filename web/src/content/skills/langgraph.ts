import type { SkillContent } from "../types";

/**
 * LangGraph — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const langgraph: SkillContent = {
  overview: `
LangGraph is a low-level orchestration framework, built by the LangChain team, for constructing stateful, controllable multi-step agents and workflows as an explicit graph: nodes are units of computation (typically Python functions or LLM calls), edges define how control flows between them, and a shared state object is threaded through the whole execution. Where a plain "agent loop" hides its control flow inside a while-loop and a big system prompt, LangGraph asks you to draw the control flow out loud, as a graph you can read, test, and modify piece by piece.

For an AI engineer, LangGraph matters because the first generation of agent frameworks (a single ReAct-style loop: think, call a tool, observe, repeat until done) works for demos but becomes unpredictable at production scale. Once an agent needs to branch on intermediate results, retry a failed step differently than the first attempt, pause for a human approval before a risky action, or resume a multi-hour workflow after a server restart, an implicit loop stops being enough — you need explicit state, explicit transitions, and a way to persist and inspect both. LangGraph exists to give you exactly that, without forcing you to abandon LangChain's model/tool/prompt building blocks if you're already using them (though LangGraph works perfectly well standalone, with any LLM client).

Key characteristics: a typed, explicit **State** object that every node reads from and writes to (usually a TypedDict or a Pydantic model, with "reducer" functions controlling how updates merge — most famously, appending to a message list instead of overwriting it); a graph of **nodes** and **edges**, including **conditional edges** that route based on the current state; native support for **cycles**, so a node can lead back to an earlier node, which is exactly what "the agent keeps reasoning/using tools until it decides it's done" requires; a pluggable **checkpointer** that persists the full state after every step, enabling resumable execution, time-travel debugging, and durable long-running workflows; and built-in **human-in-the-loop interrupts** that pause a run at a chosen node until a human approves, edits, or rejects the proposed state. LangGraph is deliberately positioned below the "batteries-included agent" layer — it is closer to a state-machine runtime for LLM applications than to a one-line "create_agent()" call, and that lower-level posture is both its main cost (more code to write for simple cases) and its main value (nothing about the control flow is hidden from you).
`,

  history: `
LangGraph was introduced by the LangChain team in **January 2024** as a response to a problem LangChain itself had helped create: its original "AgentExecutor" abstraction, a single implicit loop wrapping a language model and a set of tools, was easy to start with but painful to customize once real applications needed branching, retries, or multi-agent handoffs. Developers were already hand-rolling their own graph-like control flow around LangChain components; LangGraph formalized that pattern as a first-class library.

| Year | Milestone |
|------|-----------|
| Jan 2024 | LangGraph launched publicly, modeled conceptually on graph/state-machine libraries (the LangChain team has cited Pregel-style message-passing and NetworkX-like graph construction as influences) |
| 2024 (early-mid) | Checkpointers formalized (in-memory, SQLite, Postgres) enabling persistence and resumable runs; the StateGraph and MessageGraph builder APIs stabilize |
| 2024 (mid) | Human-in-the-loop primitives (interrupt/breakpoints, state editing between steps) become a first-class, documented pattern rather than a workaround |
| 2024 (mid-late) | LangGraph Platform / LangGraph Cloud announced — a managed deployment and hosting layer for LangGraph applications, plus LangGraph Studio, a visual graph debugger |
| 2024-2025 | Prebuilt agent constructors (for example a prebuilt ReAct-style agent function) added on top of the low-level graph API, acknowledging that many teams wanted a quick starting point without hand-building every node |
| 2025 | Continued convergence with the LangChain v1-era "agent" abstractions — LangChain's own newer agent APIs are increasingly built on top of a LangGraph runtime under the hood, blurring the line between "using LangChain" and "using LangGraph" |

The throughline across this history is a steady move from "LangGraph as an advanced escape hatch for LangChain power users" toward "LangGraph as the control-flow runtime underneath most serious LangChain agent work," while still remaining usable entirely on its own with no LangChain dependency at all. Treat any specific class name or constructor signature here as representative of the pattern, not as a permanently pinned API — this library has changed its exact surface area more than once already, and will likely keep doing so.
`,

  "why-it-exists": `
Before LangGraph, building an agent generally meant one of two things. Either you used a batteries-included agent loop (LangChain's AgentExecutor, or an equivalent in another framework) that hid the reasoning-act-observe cycle behind a single call, and you accepted whatever control flow the loop's author had chosen — usually "keep calling tools until the model says it's done, with no built-in way to pause, branch, or persist mid-run." Or you wrote your own orchestration by hand: a while-loop, some if/else branching on tool output, some ad hoc pickling of conversation state to survive a restart. That hand-rolled code worked, but every team reinvented it slightly differently, none of it composed well with anyone else's agent code, and none of it had a standard way to visualize, test, or checkpoint the flow.

The gap was structural: implicit loops are fine for "always do the same three-step dance," but real agent workloads need conditional branching (do X only if the retrieved documents were empty), cycles that aren't just "retry the same node" (loop between a planner and an executor node until a plan is judged complete), durability (resume a workflow that was mid-flight when the process was killed), and human oversight (stop before sending an email or executing a trade, and wait for a person). Solving all of that inside a single opaque loop either meant the loop's author anticipated your exact need and exposed a hook for it, or you were stuck.

LangGraph's founding bet was that agent control flow deserves the same treatment as any other stateful, branching computation: model it as an explicit graph with explicit state, borrow decades of state-machine and dataflow-graph engineering practice (nodes, edges, checkpoints), and let the LLM calls be just one kind of node among several rather than the only thing the framework knows how to orchestrate.
`,

  "problem-it-solves": `
LangGraph removes concrete, recurring pains in building non-trivial agentic applications:

- **Opaque control flow**: instead of a hidden while-loop, the sequence of steps an agent can take is drawn as a graph you can read, unit-test node by node, and visualize (LangGraph Studio renders the graph directly from your code).
- **State management boilerplate**: a typed State schema plus reducer functions (for example, "always append to this list, never overwrite it") replace hand-written merge logic for combining a node's output with the running conversation/scratchpad.
- **Conditional routing**: conditional edges let a node's output decide which node runs next — for example, routing to a "needs human review" branch only when a tool call is flagged as high-risk — without threading if/else logic through every call site.
- **Cycles for iterative reasoning**: a node can route back to an earlier node (planner to executor to planner again) as a first-class graph feature, not a workaround bolted onto a linear chain.
- **Durability**: a checkpointer persists the full state after each super-step, so a long-running workflow (a multi-hour research agent, a multi-day approval pipeline) can be paused, the process can crash or redeploy, and the run resumes exactly where it left off.
- **Human-in-the-loop**: interrupt() lets a graph pause before or after a specific node and wait for a human to approve, edit, or reject the proposed state change, which is the difference between "an agent that can send emails" and "an agent that can send emails after someone signs off."
- **Multi-agent composition**: a whole graph can be nested as a single node inside a larger graph, giving a principled way to compose a "researcher" subgraph and a "writer" subgraph into one supervising graph rather than hand-wiring message passing between separate agent objects.

What LangGraph deliberately does **not** try to solve:

- **Being a one-line agent-in-a-box.** LangGraph does not (at its core) hide the graph from you the way a simpler "create_agent(tools=[...])" call does; the Agent Fundamentals skill and higher-level constructors exist for that, and LangGraph itself now ships some prebuilt starting graphs, but the philosophy remains "you can see and change every edge."
- **Prompt engineering or model selection.** LangGraph is control-flow and state, not a prompting framework — see the Prompt Engineering and Tool Calling skills for those adjacent concerns, and the LangChain skill for the model/prompt/tool abstractions LangGraph nodes commonly wrap.
- **Being a full multi-agent framework with built-in agent personas and role-based conversation patterns.** CrewAI and AutoGen bake in higher-level multi-agent abstractions (roles, crews, group chats); LangGraph gives you the graph primitive and lets you build whatever multi-agent topology you want on top of it, which is more flexible and also more work.
- **Managing infrastructure for you by default.** The open-source library is a Python/JavaScript runtime; production hosting, scaling, and managed persistence are a separate, optional product (LangGraph Platform), not a requirement to use the graph itself.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what problem LangGraph solves and how an explicit graph differs from an implicit agent loop (like a classic LangChain AgentExecutor) in terms of control, debuggability, and durability.
2. Define a State schema (TypedDict or Pydantic model) with appropriate reducers, and explain why "append" reducers for message lists are the default pattern for conversational agents.
3. Build a StateGraph: add nodes, add normal edges, add conditional edges, and compile it into a runnable graph.
4. Construct a cycle (a loop between two or more nodes) that terminates correctly via a conditional edge, and explain how this implements iterative agent reasoning (think → act → observe → think again).
5. Attach a checkpointer, explain what a "thread" is, and use it to persist, resume, and time-travel through a multi-turn or long-running execution.
6. Implement a human-in-the-loop interrupt: pause a graph before a sensitive node, inspect or edit the pending state, and resume execution.
7. Compose subgraphs into a larger graph to model multi-agent handoffs, and articulate when that graph-based composition is preferable to CrewAI's or AutoGen's higher-level multi-agent abstractions.
8. Decide, for a given problem, whether the added structure of a graph is worth its extra code versus a simpler loop or a batteries-included agent constructor.
9. Operate a LangGraph application in production: stream intermediate steps, handle node-level errors and retries, and reason about checkpointer storage choices (in-memory versus SQLite versus Postgres) for durability.
10. Identify LangGraph's fast-moving API surface (node/edge builder syntax, prebuilt agent helpers, the Platform/Studio tooling) and know to verify current behavior against the official docs rather than one memorized version.
`,

  prerequisites: `
- **Required**: comfortable Python (functions, classes, type hints, TypedDict/dataclasses — see the **Python** skill); a working understanding of what an LLM API call and a "tool call" look like.
- **Strongly recommended**: the **Agent Fundamentals** skill first — this page assumes you already understand the think-act-observe loop, tool calling, and why agents need memory/state conceptually, and focuses specifically on how LangGraph structures that loop as a graph.
- **Strongly recommended**: the **LangChain** skill, since LangGraph nodes very commonly wrap LangChain chat models, prompts, and tool-calling utilities, and the two libraries share vocabulary (messages, tool calls, runnables) even though LangGraph does not require LangChain to function.
- **Helpful**: the **Tool Calling** skill, for the mechanics of how an LLM decides to invoke a function and how results get fed back in — LangGraph orchestrates that cycle but doesn't reinvent the tool-calling contract itself.
- **Helpful for the reasoning-quality sections**: the **Planning** and **Reflection** skills — LangGraph is the scaffolding that lets you implement planning loops and reflection loops as explicit cycles; those skills cover the reasoning patterns themselves.
- **Helpful for comparison sections**: the **CrewAI** and **AutoGen** skills, for the higher-level multi-agent frameworks LangGraph is most often compared against; the **Agent Memory** skill, for how LangGraph's state/checkpointing relates to (and differs from) long-term agent memory systems.

Dependency chain on this platform: **Python** → **Tool Calling** → **Agent Fundamentals** → **LangChain** → **this page** → **CrewAI** / **AutoGen** for higher-level multi-agent patterns, and **Planning** / **Reflection** / **Agent Memory** for the reasoning and memory patterns you implement inside the graph.
`,

  "beginner-concepts": `
### State — the one object every node shares

Every LangGraph graph is built around a **State** type: a schema (most commonly a TypedDict, sometimes a Pydantic model or dataclass) describing everything the graph tracks across its run. Nodes receive the current state and return a partial update, which LangGraph merges into the state according to each field's reducer.

~~~python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class State(TypedDict):
    # add_messages is a reducer: new messages are appended, not
    # overwritten, so each node's output accumulates conversation history.
    messages: Annotated[list, add_messages]
    step_count: int
~~~

### Nodes — units of work

A node is just a function that takes the state and returns a (partial) update to it. Nodes are commonly an LLM call, a tool call, or plain Python logic.

~~~python
def call_model(state: State) -> dict:
    # In a real app this would call a chat model with state["messages"].
    response = {"role": "assistant", "content": "Here is my answer."}
    return {"messages": [response], "step_count": state["step_count"] + 1}
~~~

### Building and compiling your first graph

~~~python
from langgraph.graph import StateGraph, START, END

builder = StateGraph(State)
builder.add_node("assistant", call_model)
builder.add_edge(START, "assistant")   # entry point
builder.add_edge("assistant", END)     # exit point

graph = builder.compile()

result = graph.invoke({"messages": [{"role": "user", "content": "Hi"}], "step_count": 0})
print(result["messages"][-1])
~~~

This is the smallest possible LangGraph program: one node, wired from START to END. It behaves like a single function call — the graph structure only starts paying for itself once you add branching or cycles, below.

### Conditional edges — routing on state

A conditional edge inspects the current state and returns the name of the next node, rather than always going to a fixed one.

~~~python
def should_continue(state: State) -> str:
    if state["step_count"] >= 3:
        return "end"
    return "assistant"

builder.add_conditional_edges(
    "assistant",
    should_continue,
    {"assistant": "assistant", "end": END},
)
~~~

### Why this matters even for simple agents

The core beginner insight is that a graph separates **what a node does** from **what happens next** — the routing function is a small, independently testable piece of logic, not an if/else buried inside a giant loop body. That separation is what makes it possible to add a new branch (say, a "needs human approval" path) later without touching the nodes that already work.

Common beginner trap: forgetting to compile the builder (graph = builder.compile()) before calling invoke — the StateGraph builder object and the compiled, runnable graph are different objects, and only the compiled graph can be invoked, streamed, or given a checkpointer.
`,

  "intermediate-concepts": `
### Cycles — the mechanism behind iterative agent reasoning

A cycle is simply an edge that points back to a node the graph has already visited. This is how LangGraph implements the classic "keep reasoning and calling tools until the model says it's done" agent loop, as an explicit graph feature rather than a hidden while-loop:

~~~python
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

def call_model(state: State) -> dict:
    # calls the LLM with tools bound; the model may request a tool call
    ...

def route_after_model(state: State) -> str:
    last_message = state["messages"][-1]
    if getattr(last_message, "tool_calls", None):
        return "tools"
    return END

builder = StateGraph(State)
builder.add_node("assistant", call_model)
builder.add_node("tools", ToolNode(tools=[...]))   # prebuilt tool-executor node

builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", route_after_model, {"tools": "tools", END: END})
builder.add_edge("tools", "assistant")   # the cycle: tool results go back to the model

graph = builder.compile()
~~~

This is, structurally, the same reasoning loop a plain ReAct agent implements — the difference is that here the loop is two named nodes and one conditional edge you can inspect, test independently, and insert new branches into (a retry node, a human-approval node) without rewriting the loop.

### Reducers in depth

Reducers decide how a node's returned update merges into existing state, and getting this wrong is the single most common intermediate-level bug:

~~~python
from typing import Annotated
import operator

class State(TypedDict):
    messages: Annotated[list, add_messages]   # append (via LangGraph's built-in reducer)
    scores: Annotated[list[float], operator.add]   # concatenate lists
    total_cost: Annotated[float, operator.add]      # numeric accumulation

# Without an explicit reducer, a field is simply OVERWRITTEN by the
# most recent node's return value -- fine for "current plan text",
# wrong for "conversation history" or "running total."
~~~

The rule of thumb: any field representing an accumulating log (messages, tool outputs, scores) needs an explicit append/accumulate reducer; any field representing "the current value of X" (current plan, current retry count you intend to overwrite, not add to) is fine with default overwrite behavior.

### Subgraphs — composing graphs as nodes

A compiled graph can be used as a node inside a larger graph, which is the standard way to build multi-agent systems in LangGraph: a "research" subgraph and a "writing" subgraph, each independently testable, composed under one supervising graph.

~~~python
research_graph = research_builder.compile()
writing_graph = writing_builder.compile()

top_builder = StateGraph(State)
top_builder.add_node("research", research_graph)
top_builder.add_node("writing", writing_graph)
top_builder.add_edge(START, "research")
top_builder.add_edge("research", "writing")
top_builder.add_edge("writing", END)
~~~

### Streaming intermediate steps

~~~python
for chunk in graph.stream({"messages": [{"role": "user", "content": "..."}]}, stream_mode="values"):
    print(chunk["messages"][-1])
~~~

Streaming each super-step's state (rather than waiting for the whole run to finish) is what makes long agent runs feel responsive in a UI, and is also the easiest way to watch a cycle unfold while debugging.

### Checkpointers and threads, introduced

~~~python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "conversation-42"}}
graph.invoke({"messages": [{"role": "user", "content": "Remember my name is Sam"}]}, config)
graph.invoke({"messages": [{"role": "user", "content": "What's my name?"}]}, config)
# The second call sees the accumulated state from the first because
# both share the same thread_id -- this IS the agent's short-term memory.
~~~

A **thread** is LangGraph's unit of persisted conversation/run state, identified by a thread_id; every invoke/stream call against the same thread_id continues from the last checkpoint rather than starting fresh. This is covered in depth (including durable backends) in Advanced Concepts and Production Usage.
`,

  "advanced-concepts": `
### Checkpointing internals and durable execution

A checkpointer persists the full graph state after every **super-step** (one round of node execution) to a backend — MemorySaver for local development, SqliteSaver for a single-process durable store, or a Postgres-backed saver for production multi-process deployments. Because the entire state is snapshotted, not just a log of messages, LangGraph can restart a crashed run from its last completed super-step rather than from the beginning, which is the mechanism behind "durable execution" for long-running agents (a research agent that runs for hours, a workflow that waits days for an external event).

~~~python
from langgraph.checkpoint.sqlite import SqliteSaver

with SqliteSaver.from_conn_string("checkpoints.db") as checkpointer:
    graph = builder.compile(checkpointer=checkpointer)
    config = {"configurable": {"thread_id": "job-8891"}}
    graph.invoke(initial_state, config)
    # If the process crashes here, re-running with the same thread_id
    # resumes from the last persisted super-step, not from scratch.
~~~

### Time travel and state editing

Because every super-step is checkpointed, you can list the history of a thread, pick an earlier checkpoint, optionally edit its state, and resume execution from there — useful for debugging ("what did the state look like right before it went wrong") and for building "undo/redo" or "branch the conversation from here" features.

~~~python
history = list(graph.get_state_history(config))
earlier_checkpoint = history[2]   # inspect an earlier super-step
graph.update_state(earlier_checkpoint.config, {"messages": [...]})  # edit
graph.invoke(None, earlier_checkpoint.config)   # resume from the edited point
~~~

### Human-in-the-loop interrupts

interrupt() pauses execution inside a node and surfaces a value to the calling application; the graph stays paused (its state safely checkpointed) until the application resumes it with a human's decision.

~~~python
from langgraph.types import interrupt, Command

def request_approval(state: State) -> dict:
    decision = interrupt({"question": "Approve sending this email?", "draft": state["draft"]})
    if decision == "approve":
        return {"status": "approved"}
    return {"status": "rejected"}

# Elsewhere, after a human reviews the interrupt payload:
graph.invoke(Command(resume="approve"), config)
~~~

This is the mechanism behind "an agent that proposes an action but a human must confirm it" — a strictly stronger guarantee than prompting the model to "ask for confirmation," because the pause is enforced by the runtime, not by the model choosing to comply.

### Multi-agent topologies as graphs

LangGraph does not prescribe a single multi-agent pattern; teams build several recognizable topologies on top of the same primitives:

- **Supervisor pattern**: a router node (often an LLM call whose only job is to pick the next worker) with conditional edges to several worker nodes/subgraphs, each returning control to the supervisor.
- **Sequential pipeline**: a fixed chain of specialist subgraphs (research → draft → critique → revise), each a node in the outer graph.
- **Hierarchical teams**: subgraphs that are themselves supervisor graphs, nested inside an outer supervisor — this is the graph-native answer to what CrewAI calls a "crew of crews" or what AutoGen models as nested group chats.

### Concurrency: parallel branches (fan-out/fan-in)

A single super-step can execute multiple nodes concurrently if the graph fans out to several nodes from one conditional edge or a "send" API, then fans back in — useful for "call three retrieval tools in parallel and merge their results" without hand-rolling asyncio.gather bookkeeping.

~~~python
from langgraph.types import Send

def fan_out(state: State) -> list[Send]:
    return [Send("search_tool", {"query": q}) for q in state["subqueries"]]

builder.add_conditional_edges("planner", fan_out)
~~~

### Decision table: cycle design choices

| Situation | Pattern |
|-----------|---------|
| Agent should keep using tools until it has enough information | assistant to tools cycle with a conditional edge checking for tool_calls |
| Agent should retry a failed step with different parameters | a dedicated retry node with its own routing logic, not a bare loop back to the same node |
| Agent needs a hard cap on iterations to avoid infinite loops | track an iteration counter in state and route to END once a max is hit, regardless of the model's own judgment |
| A step is irreversible/high-risk | add an interrupt before that node, never rely solely on prompting the model to "ask first" |
`,

  "internal-working": `
LangGraph's execution model is inspired by the **Pregel** "bulk synchronous parallel" pattern used in large-scale graph-processing systems: execution proceeds in discrete **super-steps**, and within a super-step every node that is scheduled to run does so (potentially in parallel), after which their state updates are merged via reducers before the next super-step begins.

~~~mermaid
flowchart LR
    Start(["START"]) --> N1["Node: assistant\n(reads state, may call LLM)"]
    N1 --> C{"Conditional edge\n(inspect state)"}
    C -->|"tool_calls present"| N2["Node: tools\n(execute requested tools)"]
    C -->|"no tool_calls"| End(["END"])
    N2 --> N1
~~~

Step by step, for one super-step:

1. **Scheduling**: LangGraph determines which nodes are "active" this super-step, based on which edges point into them from nodes that just ran (or, for the first super-step, the START edge).
2. **Execution**: each active node runs, receiving the current merged state as input and returning a partial state update. If multiple nodes are active in the same super-step (a fan-out), they can run concurrently.
3. **Reduction**: every returned partial update is merged into the shared state using each field's reducer (append for message lists, overwrite for scalar "current value" fields, custom reducers for anything else).
4. **Checkpointing**: if a checkpointer is attached, the fully merged state after this super-step is persisted, tagged with the thread_id and a step/checkpoint id.
5. **Routing**: conditional edges out of the nodes that just ran are evaluated against the new merged state to determine which nodes are active next super-step; this repeats until no nodes remain active (a path reaches END) or an interrupt pauses the run.

The most important internal-working insight for debugging: because state merges happen via reducers **after** a super-step, two nodes writing to the same non-accumulating field in the same super-step can silently clobber each other depending on reducer semantics — a classic subtle bug in fan-out graphs, discussed further in Common Mistakes. Node functions themselves are ordinary Python (or JavaScript) functions; nothing about a "node" is magic beyond the contract of "read state in, partial state update out," which is precisely why nodes are easy to unit test outside the graph entirely.
`,

  architecture: `
### Runtime architecture

~~~mermaid
flowchart TB
    subgraph Build["Build time"]
        Schema["State schema\n(TypedDict/Pydantic + reducers)"]
        Nodes["Node functions"]
        Edges["Edges + conditional edges"]
        Schema --> Builder["StateGraph builder"]
        Nodes --> Builder
        Edges --> Builder
        Builder -->|compile| Compiled["Compiled graph"]
    end
    subgraph Runtime["Run time"]
        Compiled --> Exec["Pregel-style executor\n(super-steps)"]
        Exec <--> CP[("Checkpointer\n(Memory/SQLite/Postgres)")]
        Exec -->|"interrupt()"| HITL["Human-in-the-loop\npause point"]
        HITL -->|"Command(resume=...)"| Exec
        Exec --> LLMs["LLM / tool calls\n(often via LangChain runnables)"]
    end
    Client["Calling application"] --> Compiled
    Exec --> Client
~~~

The key architectural insight: the graph is compiled once (build time — validating that every node referenced by an edge exists, every conditional edge's possible outputs are wired) and then invoked or streamed many times at run time, each invocation identified by a thread_id if a checkpointer is attached. Build time and run time are cleanly separated, which is what makes LangGraph Studio possible: it can render the compiled graph's structure without ever executing a node.

### Application layout for a production LangGraph service

~~~
agentservice/
├── pyproject.toml
├── src/agentservice/
│   ├── state.py            # State TypedDict/Pydantic schema + reducers
│   ├── nodes/
│   │   ├── assistant.py     # LLM-calling node(s)
│   │   ├── tools.py         # ToolNode / custom tool-executing nodes
│   │   └── approval.py      # interrupt()-based human-in-the-loop node
│   ├── graph.py             # StateGraph construction + compile()
│   ├── checkpointer.py      # Postgres/Sqlite saver configuration
│   ├── api/                 # FastAPI routes exposing /invoke, /stream, /resume
│   └── evaluation/          # trace-based regression tests against golden runs
└── tests/
    ├── test_nodes.py         # unit tests calling node functions directly
    └── test_graph.py         # integration tests invoking the compiled graph
~~~

Dependencies point from api to graph to nodes/checkpointer; nodes remain independently testable functions, which is the architectural payoff of "a node is just a function" — most of the test suite never needs to invoke the full graph at all.
`,

  "data-flow": `
Tracing one turn of a tool-using agent loop, including a human-in-the-loop interrupt, as a sequence diagram:

~~~mermaid
sequenceDiagram
    participant User
    participant Graph as Compiled Graph
    participant Assistant as assistant node
    participant Tools as tools node
    participant CP as Checkpointer
    participant Human

    User->>Graph: invoke({messages: [...]}, thread_id="t1")
    Graph->>CP: load latest checkpoint for thread_id
    CP-->>Graph: prior state (or empty)
    Graph->>Assistant: run(state)
    Assistant->>Assistant: call LLM with messages + tools
    Assistant-->>Graph: partial update (assistant message with tool_calls)
    Graph->>CP: persist merged state (super-step 1)
    Graph->>Graph: evaluate conditional edge -> "tools"
    Graph->>Tools: run(state)
    Tools->>Tools: execute requested tool(s)
    Tools-->>Graph: partial update (tool result messages)
    Graph->>CP: persist merged state (super-step 2)
    Graph->>Graph: evaluate conditional edge -> "assistant"
    Graph->>Assistant: run(state) again (the cycle)
    Assistant-->>Graph: partial update (proposes a risky action)
    Graph->>Graph: route to approval node
    Graph->>Human: interrupt() surfaces pending action
    Note over Graph,Human: execution paused, state safely checkpointed
    Human->>Graph: Command(resume="approve")
    Graph->>CP: persist merged state (super-step N)
    Graph-->>User: final answer + full message history
~~~

The most misunderstood part is that a paused (interrupted) graph is not "still running" in any process-holding sense — its entire state lives in the checkpointer, so the calling application can shut down, redeploy, or wait days before resuming, and the resumed run continues from exactly the persisted super-step. Debugging a LangGraph run should start by pulling the checkpoint history for the thread_id and inspecting the state at each super-step, not by adding print statements inside nodes.
`,

  "production-usage": `
### Graph construction with a real tool-calling loop

~~~python
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.postgres import PostgresSaver
from typing import TypedDict, Annotated

class State(TypedDict):
    messages: Annotated[list, add_messages]

def call_model(state: State) -> dict:
    # bind_tools(...) attaches tool schemas so the model can request calls
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def route(state: State) -> str:
    last = state["messages"][-1]
    return "tools" if getattr(last, "tool_calls", None) else END

builder = StateGraph(State)
builder.add_node("assistant", call_model)
builder.add_node("tools", ToolNode(tools=[search_tool, calculator_tool]))
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", route, {"tools": "tools", END: END})
builder.add_edge("tools", "assistant")

with PostgresSaver.from_conn_string(DATABASE_URL) as checkpointer:
    graph = builder.compile(checkpointer=checkpointer)
~~~

### Global configuration and defaults

Non-negotiables for production:

1. **Always set an iteration/step cap**, either via recursion_limit on invoke/stream or an explicit counter in state — a cycle with a routing bug that never returns END will otherwise run (and bill LLM calls) until it hits the runtime's default recursion limit, which is a poor way to discover the bug.
2. **Use a durable checkpointer backend** (Postgres in most production deployments; SQLite for a single-process service) rather than MemorySaver, which loses all state on process restart.
3. **Set request timeouts on every LLM and tool call** inside nodes — a hung external API call inside a node stalls that super-step indefinitely.
4. **Treat thread_id as a real identifier you control** (a conversation id, a job id), not an afterthought — it is the entire addressing scheme for persistence, resumption, and time travel.
5. **Put interrupts before any side-effecting node** (sending messages, writing to external systems, spending money) rather than relying on prompt instructions asking the model to "confirm first."
6. **Stream to the caller** rather than blocking for the full run, especially for long cyclic agent loops — users tolerate multi-step reasoning much better when they can see it happening.
`,

  "industry-examples": `
- **LinkedIn**: has published on using LangGraph-style graph orchestration for internal AI-assisted workflows requiring multi-step reasoning and tool use, citing the explicit-control-flow model as easier to reason about than a single opaque agent loop at scale.
- **Uber**: has described building internal developer-productivity and support agents on LangGraph, valuing the checkpointing/persistence story for long-running, multi-step automation tasks.
- **Replit**: has discussed using LangGraph-based orchestration for coding-agent products where multi-step planning, tool use, and the ability to pause for user review of proposed changes map directly onto LangGraph's node/cycle/interrupt model.
- **Klarna**: has referenced graph-based agent orchestration (in the LangChain ecosystem, of which LangGraph is now central) for customer-support automation requiring conditional routing between different resolution paths.
- **AI coding assistants and "agentic IDE" products broadly**: the pattern of "propose a multi-file change, pause for human review, then apply it" maps almost one-to-one onto LangGraph's interrupt-before-side-effecting-node pattern, which is why it shows up repeatedly across this product category.

Pattern to notice: the common thread across adopters is workflows that are too branchy, too long-running, or too risk-sensitive for a single implicit agent loop — exactly the gap LangGraph was built to close, as distinct from simple single-shot Q&A use cases where a plain LLM call or a basic RAG pipeline (see the RAG and LlamaIndex skills) is already sufficient.
`,

  "best-practices": `
1. **Start with the smallest graph that solves the problem.** A single node with no cycles is a valid LangGraph program; only add nodes, branches, and cycles once a concrete requirement (branching, iteration, human review) demands them.
2. **Design the State schema before writing nodes.** Decide up front which fields accumulate (need a reducer) and which are overwritten, since retrofitting reducers after nodes are written is a common source of subtle bugs.
3. **Keep nodes small and independently testable.** A node should be callable and assertable in a unit test without spinning up the whole graph — treat "node function" and "graph wiring" as separately reviewable concerns.
4. **Make routing functions pure and deterministic** where possible (read state, return a string/label) so conditional edges are trivial to unit test in isolation from the LLM calls.
5. **Always cap iterations explicitly**, either via a state counter checked in the routing function or the runtime's recursion_limit, rather than trusting the model to always eventually route to END.
6. **Put human-in-the-loop interrupts before irreversible actions**, not after — approving an email draft before sending beats "sending, then asking if that was okay."
7. **Use a durable checkpointer (SQLite/Postgres) as soon as a workflow outlives a single request/response cycle**, not just in "production" as a vague later step — long-running behavior should be tested against the same persistence backend you'll deploy with.
8. **Version your graph structure alongside your checkpoints.** Changing node names or state schema shape can break resuming an in-flight thread that was checkpointed under the old graph shape; plan migrations deliberately.
9. **Prefer subgraphs over deeply nested conditional logic inside one giant node function** when building multi-agent systems — composability at the graph level is what makes LangGraph's structure pay for itself.
10. **Log the state at every super-step in non-trivial deployments** (or rely on the checkpointer's history) so debugging a bad run means reading a timeline, not reproducing a race condition live.
11. **Treat the prebuilt agent constructors as a starting point, not a ceiling.** They are convenient for a first pass, but reading their source (they're built from the same StateGraph primitives) is often the fastest way to learn how to customize beyond their defaults.
12. **Don't reach for LangGraph by default.** If a workflow is genuinely linear with no branching, no cycles, and no need for persistence or human review, a plain function call or a simple LangChain chain is less code and easier to reason about — see Comparisons and Anti-Patterns.
`,

  "anti-patterns": `
### Building a cycle with no exit condition

~~~python
# WRONG: routing function never returns END under any state, and there
# is no iteration cap -- this either loops until the runtime's
# recursion_limit trips, or (with a generous limit) burns real money on
# LLM calls indefinitely.
def route(state: State) -> str:
    if state["messages"][-1].tool_calls:
        return "tools"
    return "assistant"   # bug: should be END

# RIGHT: explicit end condition, plus a belt-and-suspenders iteration cap
def route(state: State) -> str:
    if state.get("iterations", 0) >= MAX_ITERATIONS:
        return END
    if state["messages"][-1].tool_calls:
        return "tools"
    return END
~~~

### Other production-grade anti-patterns

- **Using MemorySaver in production.** It works great for local development and tests, but every checkpoint disappears on process restart — production workflows that need to survive a redeploy require SQLite/Postgres (or another durable backend).
- **Overwriting instead of accumulating message history.** A State field for messages without an append-style reducer means each node call replaces the conversation history instead of extending it, silently breaking multi-turn context.
- **Relying on prompt instructions instead of interrupt() for approval gates.** Asking the model in the system prompt to "confirm with the user before sending" is a suggestion the model can ignore or forget; interrupt() is an enforced pause at the runtime level.
- **One giant node function doing five things.** Collapsing "call the model," "parse its output," "execute a tool," and "validate the result" into a single node function defeats the purpose of a graph — split them into nodes so each is independently testable and the routing between them is visible.
- **Fanning out to multiple nodes that write the same non-accumulating state field in one super-step.** Without a proper reducer (or by relying on default overwrite semantics), concurrent nodes in a fan-out can nondeterministically clobber each other's updates.
- **Treating the graph as the only source of state.** Storing critical business data only in LangGraph's checkpointed state (rather than in your system of record) conflates "agent working memory" with "durable application data," which is a modeling mistake independent of LangGraph specifically.
- **Reaching for LangGraph for a single linear LLM call with no branching.** The graph-construction overhead (schema, nodes, edges, compile) buys nothing over a plain function when there's no branching, no cycle, and no persistence need — see Comparisons for when the structure is actually worth it.
`,

  performance: `
### Measure first

~~~python
import time

start = time.perf_counter()
result = graph.invoke(initial_state, config)
print(f"full run took {time.perf_counter() - start:.2f}s")

# Stream mode "values" or "updates" lets you time each super-step
# individually instead of only the end-to-end latency.
for step in graph.stream(initial_state, config, stream_mode="updates"):
    print(step)   # inspect which node just ran and how long it took to appear
~~~

Use LangGraph's built-in tracing integration (commonly paired with LangSmith, though any tracing/observability tool that can wrap node function calls works) to time each node separately — most perceived "the agent is slow" complaints trace back to one slow LLM or tool call inside a specific node, not the graph runtime itself, which adds negligible overhead per super-step.

### The optimization hierarchy (apply in order)

1. **Reduce unnecessary cycle iterations first.** Every extra pass through an assistant-to-tools cycle is a full LLM call; tightening the routing logic (or the prompt guiding the model toward fewer, more decisive tool calls) usually dwarfs any other optimization.
2. **Parallelize independent work with fan-out/fan-in** rather than looping through independent sub-tasks sequentially in one node — three independent tool calls in one super-step beats three sequential trips through the cycle.
3. **Cache checkpointer reads/writes appropriately.** For high-throughput services, ensure the checkpointer backend (Postgres especially) is properly indexed on thread_id and pooled, since every invoke/stream call reads the latest checkpoint first.
4. **Stream rather than block** for user-facing latency — perceived responsiveness improves substantially even when total wall-clock time is unchanged, because the user sees intermediate steps.
5. **Right-size the model per node.** Not every node needs your most expensive model — a routing/classification node often works fine with a smaller, faster model, reserving the expensive model for nodes that need deep reasoning.
6. **Batch or debounce checkpoint writes** for very high-frequency super-steps if your checkpointer backend's write latency becomes the bottleneck (uncommon, but observable in very fine-grained graphs with many small nodes).

### Numbers worth internalizing

Graph-runtime overhead per super-step (scheduling, reduction, checkpoint write) is typically low relative to a single LLM API call's latency (which dominates in the tens-to-thousands of milliseconds range); the real cost driver in almost every LangGraph application is the number of LLM calls a cycle makes, which is why tightening exit conditions and reducing redundant reasoning passes is consistently the highest-leverage optimization.
`,

  scalability: `
LangGraph itself is a thin execution runtime; scalability is largely a property of the checkpointer backend, the LLM/tool APIs a graph calls into, and how you structure long-running versus request/response workloads.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["Graph-serving API replica 1"]
    LB --> API2["Graph-serving API replica N"]
    API1 & API2 --> CP[("Checkpointer\n(Postgres, pooled/replicated)")]
    API1 & API2 --> LLM["LLM API"]
    API1 & API2 --> ToolsAPI["Tool / external APIs"]
    Worker["Background worker pool\n(long-running / resumed threads)"] --> CP
    Worker --> LLM
~~~

### Scaling the request/response path

- **Horizontal**: graph-invoking API replicas are stateless given a shared checkpointer, so scale them like any stateless service behind a load balancer; the checkpointer, not the replica, holds the state of record.
- **Checkpointer scaling**: Postgres-backed checkpointers scale via the usual database techniques (connection pooling, read replicas for state-history reads, partitioning by thread_id at very high volume) — see the Postgres/Database skills on this platform for the storage-layer specifics.
- **LLM call concurrency**: as with any LLM application, the usual bottleneck at scale is model API rate limits and latency, not the graph runtime; connection pooling, backoff, and request batching where supported matter more than any graph-level tuning.

### Scaling long-running and interrupted workflows

- **Move long-running or paused (interrupted) threads to a background worker model** rather than holding an HTTP request open — a thread that's waiting on human approval for hours should be resumed by a separate resume call, not a held-open connection.
- **Partition high-volume checkpoint storage** by time or thread_id range if a single Postgres instance becomes the bottleneck at very large numbers of concurrent threads.
- **Prune or archive old checkpoint history** for completed threads if full time-travel history isn't needed indefinitely — checkpoint storage grows with every super-step of every thread and is not automatically garbage-collected.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| LLM API rate limits under high concurrent thread volume | Backoff, request batching where the provider supports it, consider multiple API keys/providers |
| Checkpointer write latency under high super-step frequency | Connection pooling, appropriate indexing on thread_id, consider a faster backend for hot paths |
| Long-held HTTP connections for slow/cyclic agent runs | Move to async job + webhook/polling model instead of a single blocking request |
| Unbounded checkpoint storage growth | Archive/prune completed threads on a retention policy |
| A runaway cycle consuming LLM budget | Hard iteration caps enforced in routing logic, not just prompt instructions |
`,

  security: `
### LangGraph-specific attack surface

1. **Unenforced human-in-the-loop gates.** If an interrupt is implemented as a prompt suggestion rather than an actual interrupt() call before a side-effecting node, a prompt-injected or simply mistaken model can bypass the intended approval step entirely — the enforcement must live in the graph's control flow, not in the system prompt's wording.
2. **Prompt injection escalating through tool-execution cycles.** Because LangGraph cycles naturally chain "model reasons, tool executes, model reasons again," injected instructions inside a tool's output can influence the next iteration's tool calls; treat all tool/tool-node output as untrusted input to the next model call, the same discipline covered in the Tool Calling and Prompt Injection skills.
3. **Cross-thread data leakage via a shared or misconfigured checkpointer.** If thread_id generation is predictable or not scoped per user/tenant, one user's conversation state could be read or resumed by another caller; treat thread_id like a session identifier requiring the same access-control discipline.
4. **Unbounded resource consumption from malicious or buggy cycles.** A user-influenced routing condition that never terminates (see Anti-Patterns) is both a cost-abuse vector and a denial-of-service vector if exposed on a public endpoint without hard iteration caps.
5. **Sensitive state persisted indefinitely in checkpoints.** Full state snapshots (which may include user PII fed into messages) live in the checkpointer backend; apply the same encryption-at-rest, retention, and access-control policies you'd apply to any datastore holding user conversation content.

### Defenses

- Implement approval gates as actual interrupt() calls guarding the side-effecting node itself, never as prompt-only instructions.
- Scope thread_id generation and access per authenticated user/tenant, and never accept a client-supplied thread_id without validating ownership.
- Enforce hard iteration/recursion caps at the graph level (recursion_limit, or an explicit state counter checked in routing logic) on any endpoint reachable by untrusted input.
- Apply standard datastore security practice (encryption at rest/in transit, retention policy, access control) to whatever checkpointer backend you use.
- Sanitize/validate tool outputs before they re-enter the model's context in the next cycle iteration, consistent with the broader Prompt Injection and OWASP Top 10 for LLM Applications guidance.

See the dedicated **Prompt Injection**, **OWASP Top 10 for LLM Applications**, and **Tool Calling** skills for depth beyond what's LangGraph-specific here.
`,

  testing: `
### Testing nodes in isolation

~~~python
def test_route_returns_tools_when_tool_calls_present():
    fake_message = type("Msg", (), {"tool_calls": [{"name": "search", "args": {}}]})()
    state = {"messages": [fake_message]}
    assert route(state) == "tools"

def test_route_returns_end_when_no_tool_calls():
    fake_message = type("Msg", (), {"tool_calls": []})()
    state = {"messages": [fake_message]}
    assert route(state) == END
~~~

### Testing the compiled graph with a fake/mocked model

~~~python
from unittest.mock import patch

def test_full_loop_terminates_without_real_llm_calls():
    with patch("myapp.nodes.assistant.llm_with_tools") as mock_llm:
        # First call requests a tool; second call returns a final answer
        mock_llm.invoke.side_effect = [
            fake_ai_message_with_tool_call("search", {"query": "x"}),
            fake_ai_message_final("here is the answer"),
        ]
        graph = builder.compile()
        result = graph.invoke({"messages": [user_message("find x")]})
        assert "here is the answer" in result["messages"][-1].content
~~~

### The senior testing doctrine for graph-based agents

- **Unit test routing functions and reducers directly**, with hand-constructed fake state, entirely outside the graph — this is the highest-signal, lowest-cost test in the whole suite.
- **Integration test the compiled graph with mocked LLM/tool calls** to verify the graph terminates correctly, follows expected paths under different simulated model outputs, and respects iteration caps — never let a CI suite make real, non-deterministic LLM calls for correctness assertions.
- **Test checkpointing/resumption explicitly**: invoke a graph, simulate a "crash" by discarding the in-memory graph object, reload with the same thread_id against the durable checkpointer, and assert execution resumes correctly rather than restarting.
- **Test interrupts as a first-class case**: assert that a graph pauses at the expected node, that get_state reflects the pending interrupt payload correctly, and that both "approve" and "reject" resume paths behave as intended.
- **Never assert on exact LLM-generated text** in graph tests; assert on which nodes ran, in what order, on the final state's structure, or on tool-call arguments — leave any assertion on "is this a good answer" to an LLM-as-judge evaluation harness, not a unit test.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the state history for the thread first, always.** Before adding print statements inside nodes, pull get_state_history(config) and read the state at each super-step — most "the agent did something weird" bugs are visible directly in the checkpoint timeline.

~~~python
for checkpoint in graph.get_state_history(config):
    print(checkpoint.metadata.get("step"), checkpoint.values.get("messages", [])[-1:])
~~~

2. **Use LangGraph Studio (or an equivalent trace viewer)** to visualize the graph and step through a specific run node by node, especially useful for spotting an unintended cycle or a conditional edge routing somewhere unexpected.
3. **Stream with stream_mode="updates"** during development to see exactly which node produced which partial state update, isolating whether a bug is in a node's logic or in how its output merged into state via a reducer.
4. **Test the routing function in isolation** with the exact state observed at the point of a bug (pulled from checkpoint history), rather than guessing at what state the model must have produced.
5. **Check reducer behavior explicitly** when a field looks wrong after a fan-out or a cycle — print the field before and after a super-step to confirm whether it accumulated or was overwritten as intended.
6. **Reproduce with a minimal graph** (strip nodes down to the smallest subset that reproduces the bug) before assuming the issue is LLM non-determinism rather than a wiring bug.

### Debugging "the interrupt never resumed correctly"

Check that the resume call passes the exact same thread_id/config used for the original invoke, and that the Command(resume=...) payload matches the shape the node's interrupt() call expects — a mismatched thread_id silently starts a new, empty thread instead of resuming the paused one, which looks like "the interrupt just vanished."
`,

  monitoring: `
Production visibility for LangGraph applications rests on both general service observability (see the Observability category) and graph-specific signals.

### Structured logging per super-step

~~~python
import structlog

log = structlog.get_logger()

def logged_invoke(graph, initial_state, config):
    for step in graph.stream(initial_state, config, stream_mode="updates"):
        node_name = next(iter(step))
        log.info(
            "graph_step",
            thread_id=config["configurable"]["thread_id"],
            node=node_name,
            keys_updated=list(step[node_name].keys()),
        )
    return graph.get_state(config).values
~~~

### Graph-specific metrics to track

- **Iterations per run** (how many times the cycle repeated before reaching END) — a rising average signals either genuinely harder tasks or a routing/prompting regression causing wasted reasoning passes.
- **Interrupt rate and resolution time** — how often runs pause for human approval, and how long they stay paused, which is both a UX metric and an early signal of over- or under-cautious interrupt placement.
- **Per-node latency**, broken down via tracing spans, so a slowdown can be attributed to a specific node (a slow tool call, a slow model) rather than blamed generically on "the agent."
- **Checkpoint write/read latency and storage growth**, particularly for Postgres-backed checkpointers at scale.
- **Terminated-by-recursion-limit rate** — runs that hit the hard iteration cap rather than a natural routing-to-END, which usually indicates a bug or a genuinely underspecified termination condition worth revisiting.

### Tracing

LangSmith (or an equivalent OpenTelemetry-based tracer) should capture a span per node execution and per super-step, mirroring the internal-working execution model — this is the fastest way to answer "why did this specific thread take an unexpected path" in production, and pairs directly with the checkpoint-history inspection described in Debugging.
`,

  deployment: `
### A production Dockerfile for a LangGraph-based agent service

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
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "agentservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: slim base and non-root user reduce attack surface; the deps layer is cached separately from application code for fast rebuilds; PYTHONUNBUFFERED ensures logs (including per-super-step debugging logs) stream immediately rather than buffering, which matters for tailing a long-running cyclic agent's progress live.

### Serving topology

- **Graph-invoking API**: a stateless FastAPI/uvicorn service, scaled horizontally behind a load balancer — statelessness holds only because the checkpointer (a shared Postgres instance, typically) is the actual source of truth for in-flight and completed thread state.
- **Long-running/interrupted threads**: handled via an async job model (a background worker resumes a thread when a human approval arrives, or on a schedule) rather than a held-open HTTP connection, since interrupts can pause a thread for arbitrarily long.
- **Health checks**: a /healthz that checks process liveness, and a /readyz that verifies the checkpointer backend and any downstream LLM/tool APIs are reachable before accepting traffic.
- **Managed alternative**: LangGraph Platform (the LangChain team's hosted offering) provides deployment, checkpointer infrastructure, and LangGraph Studio access as a managed service, worth evaluating as a build-vs-buy decision the same way you would for any managed infra layer.

### CI/CD pipeline sketch

lint/typecheck → unit tests (routing functions, reducers, mocked-LLM graph integration tests) → resumption test (invoke, simulate crash, resume from checkpoint, assert correctness) → build image → deploy with rolling update → smoke-test a known golden thread against the new deployment before cutting full traffic over.
`,

  "production-checklist": `
Before a LangGraph-based agent service takes real traffic:

- [ ] State schema finalized with explicit reducers for every accumulating field (messages, logs, scores)
- [ ] Hard iteration/recursion cap enforced in code, not left to default runtime limits alone
- [ ] Durable checkpointer backend (SQLite/Postgres) configured; MemorySaver is not used outside local dev/tests
- [ ] thread_id generation is scoped per authenticated user/tenant and never accepted unvalidated from a client
- [ ] Every side-effecting node (send email, execute trade, write to an external system) has a genuine interrupt() gate, not just a prompt instruction
- [ ] Timeouts set on every LLM and tool call made inside a node
- [ ] Routing functions unit-tested in isolation with hand-constructed fake state
- [ ] Resumption tested explicitly: invoke, simulate a crash/restart, resume with the same thread_id, assert correct continuation
- [ ] Structured logging per super-step, including node name and updated state keys
- [ ] Metrics tracked: iterations per run, interrupt rate/resolution time, per-node latency, recursion-limit-termination rate
- [ ] Checkpoint storage retention/archival policy defined (state does not grow unbounded forever)
- [ ] Rate limiting and authentication on any public-facing invoke/stream/resume endpoint
- [ ] Rollback plan: a previous graph version can still resume threads checkpointed under the old schema, or a migration path is documented
- [ ] Tracing (LangSmith or equivalent) wired to capture per-node and per-super-step spans

Cross-check with the AI Evals skill for the deeper discipline behind measuring agent output quality, which this checklist deliberately keeps separate from operational readiness.
`,

  "common-mistakes": `
1. **Reaching for LangGraph when a plain function or linear chain would do** — adding graph machinery (schema, nodes, edges, compile) to a workflow with no branching, no cycles, and no persistence need adds ceremony without buying anything.
2. **Forgetting reducers on accumulating fields**, so message history or logs get silently overwritten instead of appended, breaking multi-turn context in a way that's easy to miss until a real multi-step conversation is tested.
3. **Building a cycle with no reachable exit condition**, relying on the model to "eventually" route to END rather than enforcing a hard iteration cap in code.
4. **Treating interrupt() as optional polish rather than the actual security/safety boundary** for irreversible actions — a system prompt asking the model to "confirm before sending" is not equivalent to an enforced pause.
5. **Using MemorySaver in production** because it's the default in tutorials, then being surprised that all in-flight state vanishes on redeploy.
6. **Not testing resumption explicitly**, so a checkpointer bug (wrong config, schema mismatch after a deploy) is discovered in production during an actual multi-hour run rather than in CI.
7. **Collapsing multiple responsibilities into one giant node**, losing the graph's main benefit — independently testable, independently reviewable units of work.
8. **Assuming the framework's exact builder syntax and prebuilt helpers from memory** across versions — LangGraph's API surface (especially prebuilt agent constructors and the Platform/Studio tooling) has changed release to release; always check current docs rather than an old tutorial.
9. **Conflating LangGraph's checkpointed state with long-term agent memory.** Checkpoints are for resuming and inspecting a specific run/thread; durable cross-session knowledge belongs in a proper memory system (see the Agent Memory skill), not solely in graph state.
10. **Fanning out to independent nodes that write the same non-accumulating field**, then being surprised by nondeterministic overwrite behavior instead of designing an explicit merge/reducer strategy up front.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| GraphRecursionError / hitting the default recursion limit | A cycle's routing function never returns END under real conditions | Add an explicit iteration counter to state and route to END once a cap is hit, independent of model judgment |
| Message history appears truncated or overwritten between turns | The messages field lacks an append-style reducer | Annotate the field with an accumulating reducer (for example, add_messages) instead of relying on default overwrite |
| Resumed run starts from scratch instead of continuing | thread_id mismatch between the original invoke and the resume call, or MemorySaver used across process restarts | Use a durable checkpointer and verify thread_id is passed identically on resume |
| Interrupt payload never appears to the calling application | interrupt() called inside a node that isn't actually reached by the current routing path | Trace the routing path with stream_mode="updates" to confirm the node executes before the interrupt is expected |
| KeyError on a state field inside a node | Node assumes a field exists before any node has populated it | Give the State schema sensible defaults, or guard node logic with state.get(...) |
| Nondeterministic final state after a fan-out | Multiple concurrent nodes wrote to the same non-accumulating field in one super-step | Design an explicit reducer for the shared field, or restructure so concurrent nodes write to distinct fields |
| Import errors after upgrading langgraph | Prebuilt helper names or module paths changed between releases | Check the current changelog/docs for the renamed/relocated import before assuming a bug in your code |
| Checkpointer connection errors under load | Connection pool exhausted on the Postgres/SQLite backend | Configure pooling appropriately for the concurrency level; monitor checkpointer latency as a first-class metric |

The habit that matters: reproduce with a minimal graph and a fixed thread_id, inspect get_state_history first, and only then look at prompt or model behavior.
`,

  faqs: `
**Q: Is LangGraph part of LangChain, or a separate thing?**
It's built and maintained by the LangChain team and integrates naturally with LangChain's chat models, prompts, and tools, but it does not require LangChain — you can build a LangGraph application using any LLM client directly. Think of it as a sibling library that shares an ecosystem, not a strict subpackage.

**Q: Do I need LangGraph for a simple RAG chatbot with no branching?**
Usually not. A linear retrieve-then-generate pipeline (see the RAG and LlamaIndex skills) has no cycles, no branching, and typically no need for multi-turn persistence beyond simple chat history — a plain function or a basic chain is less code and equally correct. Reach for LangGraph once you need conditional routing, iterative tool use, human approval, or durable long-running execution.

**Q: How is a LangGraph cycle different from just writing a while loop?**
Structurally, a while loop and a cycle both let a step repeat. The difference is what a graph gives you around that loop for free: each iteration's state is a named, inspectable snapshot; the loop can be checkpointed and resumed mid-iteration; the loop can be paused for human review at a named point; and the routing decision is a separately testable function rather than an inline condition buried in loop code.

**Q: What's the difference between LangGraph and CrewAI or AutoGen?**
CrewAI and AutoGen provide higher-level multi-agent abstractions (roles, crews, group chats) with more built-in structure and less code for common multi-agent patterns; LangGraph gives you a lower-level graph primitive with more control and more code, letting you build any topology (including ones those frameworks don't model well) at the cost of writing more of it yourself. See Comparisons for the fuller breakdown.

**Q: Does the extra structure of a graph always pay for itself?**
No — for a genuinely single-shot or strictly linear task, a graph's schema/node/edge/compile ceremony is pure overhead. The structure earns its cost specifically when you need branching, cycles, persistence, or human-in-the-loop control; see Comparisons and Anti-Patterns for how to tell which situation you're in.

**Q: How do I keep an agent from looping forever?**
Enforce an explicit iteration cap in your routing function's logic (checked against a counter in state), in addition to (not instead of) the runtime's recursion_limit — relying on the model to "know when to stop" is not a reliable termination guarantee.

**Q: How current is this page's API detail?**
LangGraph's builder syntax, prebuilt agent helpers, and Platform/Studio tooling have changed across releases and continue to evolve quickly as the LangChain team converges its agent abstractions around the LangGraph runtime. This page reflects general, durable patterns (state, nodes, conditional edges, cycles, checkpointers, interrupts) rather than one pinned version's exact syntax — always check the current official docs before shipping code copied from any tutorial, including this one.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What problem does LangGraph solve that a plain agent loop doesn't?* Explicit, inspectable control flow: branching, cycles, persistence, and human-in-the-loop pauses that are difficult or impossible to bolt onto an opaque while-loop-style agent executor cleanly.
2. *What is a reducer in LangGraph, and why does the messages field usually need one?* A function controlling how a node's returned update merges into existing state; messages need an append-style reducer so each node's output extends the conversation instead of overwriting it.
3. *What's the difference between a normal edge and a conditional edge?* A normal edge always routes to the same next node; a conditional edge runs a function against the current state to decide which node runs next, enabling branching.
4. *What is a thread_id and what is it used for?* The identifier under which a graph's checkpointed state is stored and retrieved; invoking the same thread_id continues from its last checkpoint rather than starting fresh, which is how multi-turn memory and resumable runs work.
5. *Why must a StateGraph builder be compiled before it can be invoked?* compile() validates the graph's structure (all referenced nodes exist, conditional edges are fully wired) and produces the actual runnable object; the builder itself is just a specification.

**Senior:**

6. *Design a customer-support agent that must pause for human approval before issuing a refund. What LangGraph-specific mechanisms do you use, and why not just prompt the model to ask first?* Place an interrupt() call in a dedicated approval node gating the refund-issuing node; this enforces the pause at the runtime level regardless of model behavior, unlike a prompt instruction the model could ignore, forget, or have overridden by injected content.
7. *A production agent's cycle runs far more iterations than expected on some inputs. How do you debug and fix it?* Pull get_state_history for an affected thread, inspect what each iteration's routing decision was based on, verify whether it's a genuine reasoning-complexity issue or a routing/prompting bug; add or tighten an explicit iteration cap regardless of root cause to bound cost.
8. *How would you decide between LangGraph, a simple agent loop, and CrewAI for a new multi-step automation project?* If the workflow is linear with no branching/cycles/persistence needs, use neither — a plain chain suffices. If it needs custom branching, cycles, durable persistence, or fine-grained human-in-the-loop control, use LangGraph. If it fits a well-known multi-agent role/crew pattern and the team wants less orchestration code at the cost of less control, CrewAI (or AutoGen for conversational multi-agent patterns) may fit better.
9. *How do you make a LangGraph application resilient to a mid-run process crash?* Attach a durable checkpointer (Postgres/SQLite, not MemorySaver); test explicitly that invoking with the same thread_id after a simulated crash resumes from the last completed super-step rather than restarting; ensure checkpointer connection handling (pooling, retries) is production-grade.
10. *What's a subtle bug that fan-out (parallel node execution) can introduce, and how do you prevent it?* Multiple concurrently executing nodes writing to the same non-accumulating state field in one super-step can nondeterministically clobber each other depending on merge order; prevent it by giving that field an explicit reducer or restructuring so concurrent nodes write to distinct fields.
11. *When is the extra structure of a graph NOT worth it?* For strictly linear, single-shot tasks with no need for branching, iteration, persistence across restarts, or human review — the schema/node/edge/compile overhead buys nothing there, and a plain function or simple chain is both less code and easier to reason about.
12. *How does LangGraph's checkpointing differ from a long-term agent memory system?* Checkpoints capture the full state of a specific run/thread for resumption, time travel, and debugging; long-term memory (see the Agent Memory skill) is about persisting and retrieving relevant knowledge across many different threads/sessions, a different problem the checkpointer alone does not solve.
`,

  "coding-questions": `
### 1. Build a minimal tool-using cyclic agent with an iteration cap (core skill, asked in some form constantly)

~~~python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

MAX_ITERATIONS = 6

class State(TypedDict):
    messages: Annotated[list, add_messages]
    iterations: int

def call_model(state: State) -> dict:
    """Calls the LLM bound with tools; bumps the iteration counter."""
    try:
        response = llm_with_tools.invoke(state["messages"])
    except Exception as exc:
        # Surface a clear failure message into the transcript rather than
        # letting an unhandled exception crash the whole run.
        raise RuntimeError(f"model call failed: {exc}") from exc
    return {"messages": [response], "iterations": state["iterations"] + 1}

def route(state: State) -> str:
    if state["iterations"] >= MAX_ITERATIONS:
        return END   # hard cap wins regardless of what the model wants
    last = state["messages"][-1]
    if getattr(last, "tool_calls", None):
        return "tools"
    return END

builder = StateGraph(State)
builder.add_node("assistant", call_model)
builder.add_node("tools", ToolNode(tools=[search_tool]))
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", route, {"tools": "tools", END: END})
builder.add_edge("tools", "assistant")

graph = builder.compile()

# result = graph.invoke({"messages": [user_message("research X")], "iterations": 0})
~~~

Complexity: each super-step is roughly O(1) graph overhead plus the cost of whatever the node does (an LLM call, a tool call); total run cost is O(number of iterations), which is exactly why the iteration cap is the single most important correctness property to test. Follow-ups: add a checkpointer for resumability, add an interrupt before any tool that has side effects, add per-node timeouts.

### 2. Implement a fan-out/fan-in node for parallel tool calls

~~~python
from langgraph.types import Send
from typing import TypedDict, Annotated
import operator

class State(TypedDict):
    subqueries: list[str]
    results: Annotated[list[str], operator.add]   # concatenate across parallel branches

def plan(state: State) -> dict:
    # imagine an LLM call that decomposes a compound question into subqueries
    return {"subqueries": ["part A", "part B", "part C"]}

def fan_out(state: State) -> list[Send]:
    return [Send("search_one", {"subqueries": [q], "results": []}) for q in state["subqueries"]]

def search_one(state: State) -> dict:
    query = state["subqueries"][0]
    result = f"result for: {query}"   # stand-in for a real tool call
    return {"results": [result]}

builder = StateGraph(State)
builder.add_node("plan", plan)
builder.add_node("search_one", search_one)
builder.add_conditional_edges("plan", fan_out)
builder.add_edge("search_one", END)
builder.add_edge(START, "plan")
graph = builder.compile()
~~~

Discussion points: why the results field needs an accumulating reducer (operator.add) to correctly collect output from every parallel branch without one branch's result clobbering another's; how this differs from a sequential loop over subqueries in both latency (parallel wall-clock time) and code complexity (Send-based fan-out versus manual asyncio.gather bookkeeping).

### 3. Add a human-in-the-loop approval gate before a side-effecting node

~~~python
from langgraph.types import interrupt, Command
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]
    draft_email: str
    approved: bool

def draft(state: State) -> dict:
    return {"draft_email": "Draft: Hello, following up on your request..."}

def request_approval(state: State) -> dict:
    decision = interrupt({"action": "send_email", "draft": state["draft_email"]})
    return {"approved": decision == "approve"}

def send_email(state: State) -> dict:
    if not state["approved"]:
        return {"messages": [{"role": "assistant", "content": "Send cancelled."}]}
    # real side effect would go here, guarded by the approval above
    return {"messages": [{"role": "assistant", "content": "Email sent."}]}

builder = StateGraph(State)
builder.add_node("draft", draft)
builder.add_node("approval", request_approval)
builder.add_node("send", send_email)
builder.add_edge(START, "draft")
builder.add_edge("draft", "approval")
builder.add_edge("approval", "send")
builder.add_edge("send", END)

graph = builder.compile(checkpointer=checkpointer)  # interrupts require a checkpointer

# First call pauses at the interrupt:
# graph.invoke({"draft_email": "", "approved": False}, config)
# After a human reviews the payload surfaced by interrupt():
# graph.invoke(Command(resume="approve"), config)
~~~

Complexity: interrupts require a checkpointer to exist at all (the paused state has to be persisted somewhere between the pause and the resume), so this is O(1) extra graph structure but a hard dependency on durable storage in any real deployment. Follow-ups: extend to a "reject with feedback" path that routes back to draft with the human's comments instead of a binary approve/reject.
`,

  "hands-on-labs": `
### Lab 1 — First graph: a single-node echo agent (beginner, ~1h)
Build a StateGraph with one node that calls an LLM and one that formats output, wired START to assistant to END. Deliverable: a CLI script that answers a question, printing the full message list. Skills: State schema, node functions, compiling and invoking a graph.

### Lab 2 — Tool-using cycle with a hard iteration cap (intermediate, ~2h)
Add a tools node and a conditional edge creating a cycle between assistant and tools, with an explicit iteration counter in state. Test against a query requiring at least two tool calls, and a deliberately unsolvable query to verify the iteration cap actually stops the run. Deliverable: a test suite covering both the happy path and the cap-triggered path. Skills: conditional edges, cycles, reducers, iteration-cap correctness.

### Lab 3 — Durable, resumable execution with human-in-the-loop (advanced, ~3h)
Attach a SQLite or Postgres checkpointer, add an interrupt() gate before a simulated side-effecting node (e.g., "send message"), and write a test that invokes the graph, discards the in-memory graph object (simulating a crash), reloads with the same thread_id, and resumes correctly after approval. Deliverable: a passing resumption test plus a short write-up of what would break if MemorySaver were used instead. Skills: checkpointers, threads, interrupts, durable execution.

### Lab 4 — Multi-agent supervisor graph (production, ~4h)
Build two subgraphs (a "researcher" and a "writer"), each independently testable, and a supervisor graph that routes between them based on a routing node's decision, with streaming to a FastAPI endpoint, structured per-super-step logging, and a /healthz endpoint. Load test and report per-node latency breakdown. Skills: subgraphs, multi-agent composition, the full production section end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-engineering roles):

1. **Approval-gated operations agent** — An agent that can propose and (after human approval via interrupt()) execute real side effects: sending an email, updating a ticket, issuing a refund in a sandboxed system. Demonstrates: human-in-the-loop design, durable checkpointing, and the judgment to place approval gates before irreversible actions rather than relying on prompting alone.

2. **Multi-agent research-and-report pipeline** — A supervisor graph coordinating a research subgraph (retrieval + tool use, ideally backed by a real RAG pipeline via the LlamaIndex or RAG skills) and a writing subgraph (drafting, critique, revision cycle), producing a cited report. Demonstrates: subgraph composition, cycles for iterative refinement (draft, critique, revise until a quality bar is met), and clean separation of concerns between specialist subgraphs.

3. **Resumable long-running workflow service** — A workflow that can run for hours or days (e.g., waiting on an external event or a scheduled follow-up), backed by a durable Postgres checkpointer, exposing invoke/stream/resume endpoints and full observability (per-super-step logs, interrupt rate, iteration counts). Demonstrates: the production-readiness discipline that separates a demo agent from a service that can actually survive a redeploy mid-run.

Each project: src layout, typed Python, a pytest suite covering deterministic components (routing functions, reducers) plus an explicit resumption test against the real checkpointer backend, CI via GitHub Actions, and a README with an architecture diagram showing the graph structure. The resumption and human-in-the-loop tests are what separate a "LangGraph demo" from a project a senior interviewer takes seriously.
`,

  "case-studies": `
### From AgentExecutor to LangGraph: a framework learning from its own users
LangChain's original AgentExecutor abstraction hid the reasoning loop behind a single call, which was easy to adopt but hard to customize — developers were already hand-building graph-like control flow around it to get branching, retries, and persistence. LangGraph formalized that emergent pattern as a first-class library rather than leaving every team to reinvent it. Lesson: sometimes the most valuable new abstraction is simply naming and packaging what your most sophisticated users are already doing by hand.

### Human-in-the-loop as an enforced runtime feature, not a prompt convention
Early agent frameworks generally treated "ask for confirmation before doing something risky" as a prompting problem — tell the model to ask first. LangGraph's interrupt() made this a runtime-enforced pause instead, independent of whether the model remembers or chooses to comply. Lesson: safety-critical behavior that depends entirely on a model following an instruction is fragile in a way that safety-critical behavior enforced by the surrounding system is not — this distinction generalizes well beyond LangGraph specifically.

### The Pregel-inspired super-step model
Rather than inventing a bespoke execution model, LangGraph borrowed the bulk-synchronous-parallel "super-step" idea from large-scale graph-processing systems (the Pregel lineage), giving it a principled way to reason about concurrency (fan-out within a super-step), checkpointing (snapshot after each super-step), and determinism. Lesson: borrowing a well-understood execution model from an adjacent field (distributed graph processing) instead of inventing a new one from scratch is a recurring pattern in mature infrastructure design.

### Convergence with LangChain's own agent abstractions
As LangGraph matured, LangChain's own newer, higher-level agent APIs increasingly moved to being built on top of a LangGraph runtime under the hood, rather than maintaining a separate implicit-loop implementation. Lesson: a well-designed lower-level primitive tends to "win" inside its own ecosystem over time, becoming the shared foundation that higher-level, easier-to-use abstractions are rebuilt on top of, even inside the same company that originally shipped the simpler abstraction first.
`,

  comparisons: `
| Dimension | LangGraph | Plain agent loop (e.g. classic AgentExecutor) | CrewAI | AutoGen |
|-----------|-----------|-----------------------------------------------|--------|---------|
| Core abstraction | Explicit graph: nodes, edges, shared typed state | An implicit while-loop hidden behind one call | Roles, tasks, and "crews" of agents with a higher-level process abstraction | Conversable agents exchanging messages, often in group chats |
| Control-flow visibility | High — every transition is a node/edge you can read and test | Low — control flow is baked into the loop's implementation | Medium — process type (sequential/hierarchical) is configurable but less granular than a graph | Medium — conversation patterns are configurable but message-passing logic is less explicit than a graph |
| Cycles / iterative reasoning | First-class (loop back to any earlier node via edges) | Built-in but not customizable beyond the loop's own logic | Supported via task chaining/process config, less granular | Supported via multi-turn group chats, conversation-driven rather than graph-driven |
| Persistence / resumability | First-class (checkpointers, threads, time travel) | Typically none built in | Limited/varies by version | Limited/varies by version |
| Human-in-the-loop | First-class (interrupt/Command primitives) | Usually a manual workaround | Emerging/varies | Emerging/varies, often via a human-proxy agent participant |
| Learning curve | Moderate-to-high — you build the graph yourself | Low to start, high to customize deeply | Low-to-moderate — role/crew vocabulary is intuitive | Low-to-moderate for simple chats, higher for custom conversation patterns |
| Best default use case | Branchy, cyclic, long-running, or approval-gated workflows | Simple, mostly-linear tool-using tasks | Role-based multi-agent tasks that fit a crew/process mental model well | Conversational multi-agent patterns, research/simulation-style agent interactions |

**How seniors choose**: reach for LangGraph when the workflow genuinely needs branching, cycles, durable persistence across restarts, or enforced human approval gates — and accept the extra code that buys you. Reach for a plain agent loop (or no framework at all) when the task is simple and linear enough that a graph's schema/node/edge ceremony would be pure overhead. Reach for CrewAI when the problem naturally maps onto role-based collaboration (a "researcher," a "writer," a "reviewer") and the team wants less orchestration code at the cost of less fine-grained control. Reach for AutoGen when the natural shape of the problem is a conversation among multiple agents (including, sometimes, a human participant) rather than a directed graph of discrete steps. In practice, mature systems sometimes combine approaches: a LangGraph supervisor graph containing CrewAI- or AutoGen-style subsystems as individual nodes when a particular sub-problem fits that higher-level pattern well.

See also the **Agent Fundamentals** skill for the underlying think-act-observe loop every one of these frameworks implements in its own way, and the **Planning** and **Reflection** skills for the reasoning patterns you'd implement as cycles inside any of them.
`,

  "related-technologies": `
- **Agent Fundamentals** — the think-act-observe loop and core agent vocabulary (tools, memory, planning) that LangGraph gives you an explicit, structured way to implement; read this first if agent basics are new to you.
- **LangChain** — the sibling library providing chat model, prompt, and tool abstractions that LangGraph nodes commonly wrap; LangGraph focuses on control flow and state, LangChain on the model/tool/prompt layer.
- **Tool Calling** — the mechanics of how a model requests and receives tool execution results; LangGraph's assistant-to-tools cycle orchestrates this mechanism but doesn't redefine it.
- **Planning** — the reasoning pattern (decompose a goal into steps, potentially replanning) that maps naturally onto a planner-to-executor cycle in a LangGraph graph.
- **Reflection** — the reasoning pattern (critique and revise one's own output) that maps naturally onto a draft-critique-revise cycle in a LangGraph graph.
- **Agent Memory** — long-term, cross-session knowledge persistence, a related but distinct concern from LangGraph's per-thread checkpointing, which is scoped to resuming and inspecting a specific run.
- **CrewAI** — a higher-level, role-based multi-agent framework; a common alternative (or complement, as a subgraph-equivalent component) when a problem fits its crew/process abstractions well.
- **AutoGen** — a higher-level, conversation-centric multi-agent framework; a common alternative when the natural shape of a problem is multi-agent dialogue rather than a directed graph of steps.
- **RAG** and **LlamaIndex** — retrieval patterns commonly wrapped as a tool or a dedicated node inside a LangGraph graph, rather than reimplemented from scratch as graph logic.
- **Python** — the language most LangGraph applications are written in (a JavaScript/TypeScript version also exists); async/concurrency fluency directly improves fan-out node performance.

On this platform, a natural learning path: **Agent Fundamentals** → **Tool Calling** → **LangChain** → **LangGraph (this page)** → **Planning** / **Reflection** for the reasoning patterns you'll implement as cycles → **CrewAI** / **AutoGen** for the higher-level multi-agent alternatives.
`,

  "latest-updates": `
Verified against the author's knowledge through roughly early-to-mid 2025 — check the official LangGraph changelog and documentation for anything newer, since this library and its surrounding ecosystem (LangChain's own agent abstractions, LangGraph Platform, LangGraph Studio) have continued to move quickly.

- **Convergence with LangChain's agent abstractions**: LangChain's newer, higher-level agent-building APIs have increasingly been built on top of a LangGraph runtime under the hood, which means the practical line between "using LangChain" and "using LangGraph" has blurred over time — check current docs to see which layer a given tutorial or API actually targets.
- **Prebuilt agent constructors**: convenience functions for common patterns (a ready-made ReAct-style tool-using agent graph) have been added on top of the low-level StateGraph API, acknowledging that many teams want a fast starting point without hand-building every node; these remain a layer on top of, not a replacement for, the primitives covered on this page.
- **LangGraph Platform and Studio**: a managed deployment offering and a visual graph-debugging tool have continued to mature as the commercial/hosted side of the ecosystem, useful to evaluate for teams that want managed checkpointer infrastructure and a graph inspector without building their own.
- **Human-in-the-loop and durable-execution primitives** (interrupt/Command, checkpointer backends) have been refined across releases; exact function signatures and import paths have shifted more than once, so treat any specific call shown here as illustrative of the pattern rather than a guaranteed-current API.
- **General ecosystem note**: as with any framework this young and fast-moving, specific class names, constructor signatures, and recommended entry points should be treated as likely to have shifted since this page was written — always cross-check against current official docs before committing to an approach in a new project.
`,

  "future-roadmap": `
Where LangGraph appears to be heading, and what's worth betting career time on:

1. **Graph-based orchestration continues absorbing what used to be separate "agent framework" territory** — expect the line between "an agent framework" and "a graph-based workflow runtime" to keep blurring as LangChain's own agent APIs lean further on the LangGraph runtime underneath.
2. **Durable execution as a default expectation**, not an advanced feature — as agentic workloads get longer-running and more consequential, checkpointing and resumability are likely to become table-stakes rather than something only sophisticated teams bother to wire up.
3. **Human-in-the-loop as a standard design pattern**, driven by both safety concerns and regulatory pressure around consequential automated actions — expect interrupt-style patterns to become as routine as error handling in production agent code.
4. **Growing tooling around graph visualization and debugging** (LangGraph Studio and similar), since the main practical cost of the graph-based approach — more code, more upfront design — is most easily offset by better tooling for building and inspecting that code, not by making the underlying model simpler.
5. **Continued competition and cross-pollination with CrewAI, AutoGen, and other multi-agent frameworks**, likely converging on a shared vocabulary (state, cycles, human-in-the-loop, checkpointing) even as each framework keeps its own default level of abstraction.

For your career: the durable, transferable skill here is not memorizing LangGraph's exact builder syntax (which will keep shifting) but understanding the underlying model — explicit state with reducers, cycles as the mechanism for iterative reasoning, checkpointing for durability, and interrupts for enforced human oversight — since that model is shared, in spirit, across whatever the next dominant agent-orchestration framework turns out to be.
`,

  "cheat-sheet": `
~~~python
# --- State schema ---
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]   # reducer: append, don't overwrite
    iterations: int                            # no reducer: overwritten each update

# --- Build and compile ---
from langgraph.graph import StateGraph, START, END

builder = StateGraph(State)
builder.add_node("assistant", call_model)
builder.add_node("tools", tool_node)
builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", route, {"tools": "tools", END: END})
builder.add_edge("tools", "assistant")   # the cycle
graph = builder.compile()

# --- Invoke / stream ---
result = graph.invoke(initial_state, config)
for step in graph.stream(initial_state, config, stream_mode="updates"):
    print(step)

# --- Checkpointers (durability + threads) ---
from langgraph.checkpoint.memory import MemorySaver   # dev/tests only
from langgraph.checkpoint.sqlite import SqliteSaver    # single-process durable
from langgraph.checkpoint.postgres import PostgresSaver  # production

config = {"configurable": {"thread_id": "conversation-42"}}
graph = builder.compile(checkpointer=checkpointer)

# --- Time travel ---
history = list(graph.get_state_history(config))
graph.update_state(history[2].config, {"messages": [...]})
graph.invoke(None, history[2].config)

# --- Human-in-the-loop ---
from langgraph.types import interrupt, Command

def approval_node(state: State) -> dict:
    decision = interrupt({"question": "approve?", "payload": state["draft"]})
    return {"approved": decision == "approve"}

graph.invoke(Command(resume="approve"), config)   # resume a paused thread

# --- Fan-out / parallel branches ---
from langgraph.types import Send

def fan_out(state: State) -> list:
    return [Send("worker", {"item": i}) for i in state["items"]]

# --- Prebuilt tool executor node ---
from langgraph.prebuilt import ToolNode
tool_node = ToolNode(tools=[search_tool, calculator_tool])

# --- Iteration cap pattern (always include this) ---
def route(state: State) -> str:
    if state["iterations"] >= MAX_ITERATIONS:
        return END
    return "tools" if state["messages"][-1].tool_calls else END
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What are the three building blocks of a LangGraph graph? | State (typed shared data), nodes (functions), and edges (including conditional edges) |
| What does a reducer control? | How a node's returned partial state update merges into the existing shared state (e.g., append vs. overwrite) |
| Why does a message-list state field usually need a reducer? | Without one, each node's output would overwrite prior conversation history instead of extending it |
| What is a conditional edge? | An edge whose destination node is determined at runtime by a routing function inspecting the current state |
| How does LangGraph implement iterative agent reasoning? | Via a cycle: an edge that routes back to an already-visited node, most commonly an assistant-to-tools loop |
| What is a super-step? | One round of the Pregel-style execution model: active nodes run (possibly concurrently), their updates are merged, then the next round's active nodes are determined |
| What is a thread_id? | The identifier under which a graph's checkpointed state is persisted and retrieved, enabling multi-turn continuation and resumable runs |
| What does a checkpointer do? | Persists the full graph state after every super-step to a backend (memory, SQLite, Postgres), enabling resumption and time travel |
| What is interrupt() for? | Pausing execution at a chosen point to await human input (approve/edit/reject) before the run continues, enforced by the runtime rather than a prompt |
| What is Send used for? | Fanning out to multiple node invocations in parallel within one super-step, then merging their results via reducers |
| Biggest correctness risk in a cycle? | A routing function that never returns END under real conditions, causing runaway iterations unless an explicit cap is enforced |
| LangGraph vs. a plain agent loop, one line? | LangGraph makes control flow, state, and persistence explicit and inspectable; a plain loop hides them inside one opaque call |
| LangGraph vs. CrewAI, one line? | LangGraph is a lower-level graph primitive with full control and more code; CrewAI is a higher-level role/crew abstraction with less code and less fine-grained control |
| When is a graph NOT worth it? | For strictly linear, single-shot tasks with no branching, no cycles, and no persistence/human-review needs |
| What is time travel in LangGraph? | Inspecting or resuming execution from an earlier checkpoint in a thread's history, optionally editing state before resuming |
`,

  mcqs: `
**1. What is the primary purpose of a reducer in a LangGraph State field?**

A) To reduce the memory footprint of the graph  B) To control how a node's returned update merges into the existing shared state  C) To compress messages before sending them to the LLM  D) To limit the number of nodes in the graph

**Answer: B** — a reducer defines the merge behavior (e.g., append vs. overwrite) when a node's partial state update is combined with the current state.

**2. Why is a cycle without an explicit iteration cap dangerous in production?**

A) LangGraph does not support cycles at all  B) It can run (and bill LLM calls) until the runtime's default recursion limit is hit, or indefinitely with a permissive limit  C) It causes a compile-time error  D) It only affects logging, not execution

**Answer: B** — relying solely on the model's judgment to eventually route to END is not a reliable termination guarantee; an explicit counter checked in the routing function is the correct safeguard.

**3. What does attaching a checkpointer to a compiled graph primarily enable?**

A) Faster LLM inference  B) Persisting state after each super-step, enabling resumable runs and time travel  C) Automatic prompt optimization  D) Reducing the number of nodes needed

**Answer: B** — checkpointers are the mechanism behind durable, resumable execution and the ability to inspect or roll back to an earlier state.

**4. What is the key difference between interrupt() and simply instructing the model in a prompt to "ask for confirmation first"?**

A) There is no meaningful difference  B) interrupt() enforces a pause at the runtime level regardless of model behavior, while a prompt instruction can be ignored, forgotten, or overridden  C) interrupt() only works with certain LLM providers  D) Prompt instructions are always more reliable

**Answer: B** — interrupt() is an enforced control-flow pause; a prompt instruction is a request the model may or may not comply with, which matters especially under prompt injection.

**5. When is the extra structure of a LangGraph graph least likely to be worth its cost?**

A) When the workflow needs conditional branching  B) When the workflow needs to persist and resume across a process restart  C) When the task is a strictly linear, single-shot operation with no branching or iteration  D) When human approval is required before a risky action

A and B and D all describe cases where LangGraph's structure earns its keep.

**Answer: C** — for a genuinely linear, non-cyclic, non-persistent task, the schema/node/edge/compile overhead of a graph buys nothing over a plain function call.

**6. What best distinguishes LangGraph from CrewAI?**

A) LangGraph cannot orchestrate multiple agents  B) LangGraph provides a lower-level graph primitive with full control over topology; CrewAI provides a higher-level role/crew abstraction with less code but less granular control  C) CrewAI cannot use tools  D) They are functionally identical

**Answer: B** — both can build multi-agent systems, but LangGraph trades more code for more control over exact control flow, while CrewAI trades some control for a faster-to-write, role-based mental model.
`,

  "revision-notes": `
**Core model in 4 lines:** A LangGraph application is a typed State object threaded through a graph of nodes (functions) connected by edges (including conditional edges that route based on state). Reducers control how each node's returned partial update merges into the shared state — append for accumulating fields like message history, overwrite for "current value" fields. Cycles (edges back to earlier nodes) are the mechanism for iterative agent reasoning, most commonly an assistant-to-tools loop that repeats until a conditional edge routes to END.

**Execution model in 3 lines:** Execution proceeds in Pregel-style super-steps: active nodes run (possibly concurrently in a fan-out), their updates are merged via reducers, and a checkpointer (if attached) persists the merged state before the next super-step's active nodes are determined by evaluating edges. This super-step model is what makes durable execution, time travel, and human-in-the-loop interrupts possible.

**Durability and human oversight in 3 lines:** A checkpointer (memory for dev/tests, SQLite/Postgres for production) persists state after every super-step, addressed by a thread_id, enabling resumable long-running workflows and time-travel debugging. interrupt() pauses execution at a chosen node until a human approves, edits, or rejects the pending state — an enforced runtime pause, not a prompt-level suggestion, which is the correct pattern for gating irreversible side effects.

**When it's worth it, in 3 lines:** The extra structure (schema, nodes, edges, compile) pays for itself specifically when a workflow needs branching, cycles, durable persistence across restarts, or human approval gates. For strictly linear, single-shot tasks it's pure overhead — a plain function or a simple chain is less code and equally correct.

**Ecosystem in 3 lines:** LangGraph is built by the LangChain team and integrates naturally with LangChain's model/prompt/tool layer, but works standalone. It sits at a lower level of abstraction than CrewAI (role/crew-based) or AutoGen (conversation-based) multi-agent frameworks, trading more code for finer-grained control over topology, state, and oversight. Its API (builder syntax, prebuilt helpers, Platform/Studio tooling) has moved quickly and should be verified against current docs rather than trusted from memory.
`,

  "learning-roadmap": `
A realistic path to production-level LangGraph fluency:

**Week 1 — Foundations.** Beginner Concepts + Lab 1. Build a single-node graph, understand State/reducers/compile. Milestone: you can explain why compile() is required and what a reducer does without hesitating.

**Week 2 — Cycles and conditional routing.** Intermediate Concepts + Lab 2. Build the classic assistant-to-tools cycle with a hard iteration cap; write tests proving the cap actually stops runaway iterations. Milestone: you can draw the graph on a whiteboard and explain every edge.

**Week 3 — Durability and human-in-the-loop.** Advanced Concepts + Lab 3. Attach a real checkpointer, test crash-and-resume explicitly, add an interrupt() gate before a simulated side effect. Milestone: you can explain, with evidence from your own test, why MemorySaver is unsafe in production.

**Week 4 — Internals and multi-agent composition.** Internal Working, Architecture, Data Flow sections; build a small supervisor graph with two subgraphs. Milestone: you can trace a run through super-steps, reducers, and checkpoint writes from memory.

**Week 5 — Production.** Production Usage through Deployment sections; Lab 4. Ship a containerized agent service with streaming, structured per-super-step logging, health checks, and a Dockerfile. Milestone: a working, resumable, observable agent service on your GitHub.

**Week 6 — Ecosystem judgment.** Read the Comparisons section closely and revisit Anti-Patterns. Milestone: you can justify, out loud and with specifics, when you'd choose LangGraph versus a plain agent loop versus CrewAI versus AutoGen for a given project brief.

Then continue to the **CrewAI** or **AutoGen** skill on this platform to round out your view of the higher-level multi-agent landscape, or to **Planning** and **Reflection** to deepen the reasoning patterns you'll implement as LangGraph cycles.
`,

  "official-docs": `
- [LangGraph documentation](https://langchain-ai.github.io/langgraph/) — the primary reference; check this before trusting any tutorial's specific builder syntax or prebuilt helper names, given how actively this API has evolved.
- [LangGraph API reference](https://langchain-ai.github.io/langgraph/reference/) — precise class/method signatures for the current release, including checkpointer backends and the interrupt/Command types.
- [LangGraph GitHub repository](https://github.com/langchain-ai/langgraph) — release notes and the examples/ directory are often more current than prose documentation for fast-moving features like human-in-the-loop and durable execution.
- [LangGraph Platform / Studio documentation](https://langchain-ai.github.io/langgraph/cloud/) — the managed deployment and visual graph-debugging offering, worth reviewing for the build-vs-buy decision on hosting infrastructure.
- [LangChain documentation](https://python.langchain.com/) — for the chat model, prompt, and tool abstractions LangGraph nodes commonly wrap; read alongside this page rather than instead of it.
`,

  books: `
- There is no single widely recognized, edition-stable book dedicated specifically to LangGraph as of the author's knowledge cutoff — the framework's API has moved fast enough that book-length treatments age quickly; the official documentation and GitHub examples are the more reliable primary source.
- **Generative AI Design Patterns** and similar recent titles covering agentic architecture patterns generally — useful for the conceptual multi-step-agent material LangGraph implements structurally; verify the specific title's publication date against how current you need the framework-specific details to be.
- **Designing Machine Learning Systems** — Chip Huyen. Not LangGraph-specific, but the strongest general treatment of the production-ML-system thinking (evaluation, monitoring, durability, observability) that transfers directly to production agent services.
- For the underlying concepts rather than the framework itself, see the **books** listed on the **Agent Fundamentals**, **Planning**, and **Reflection** skill pages — those foundations age much more slowly than any specific library's API.
`,

  blogs: `
- **LangChain's official blog** (blog.langchain.dev) — the most reliable source for framework-specific patterns, since it's maintained by the team itself and tracks the current API, including design-rationale posts on interrupts, checkpointing, and Platform/Studio.
- **Harrison Chase's public talks/writing** — the co-founder's own explanations of design decisions (why an explicit graph, why the Pregel-inspired execution model) carry the most authoritative "why," not just "how."
- **LangSmith's blog/docs** on tracing and evaluation for agentic applications — directly applicable to the Monitoring and Testing sections here, since LangSmith is the most common tracing companion for LangGraph deployments.
- General AI-engineering newsletters/blogs (see the **Agent Fundamentals** and **AI Evals** skill pages' blog lists) frequently cover LangGraph-adjacent patterns even when not naming the framework explicitly, since "how do you structure a reliable multi-step agent" is a widely discussed cross-framework problem.
`,

  "research-papers": `
Direct academic literature specifically on LangGraph as a system is thin — it is an engineering framework, not itself the subject of peer-reviewed research. The closest and most valuable foundational reading is the papers underlying the execution model and reasoning patterns it structures:

- **"Pregel: A System for Large-Scale Graph Processing"** (Malewicz et al., 2010) — the bulk-synchronous-parallel, super-step execution model that LangGraph's own runtime is conceptually descended from.
- **"ReAct: Synergizing Reasoning and Acting in Language Models"** (Yao et al., 2022) — the reasoning-act-observe loop pattern that LangGraph's assistant-to-tools cycle is a graph-based implementation of.
- **"Reflexion: Language Agents with Verbal Reinforcement Learning"** (Shinn et al., 2023) — a foundational reflection/self-critique pattern directly implementable as a draft-critique-revise cycle in LangGraph; see also the Reflection skill.
- **"Toolformer: Language Models Can Teach Themselves to Use Tools"** (Schick et al., 2023) — foundational tool-use reasoning that the assistant-to-tools cycle operationalizes at the orchestration layer.
- For durable/distributed workflow execution concepts more broadly, see the foundational reading list on adjacent workflow-orchestration systems rather than LangGraph-specific sources, since durable execution theory predates and is broader than any one agent framework's implementation.
`,

  videos: `
- **Harrison Chase's LangGraph conference talks** (various AI Engineer Summit and similar conference appearances) — the co-founder explaining design rationale directly, including why the team moved from an implicit AgentExecutor loop to an explicit graph model.
- **LangChain's own YouTube channel** — official walkthroughs of new features (checkpointers, interrupts, LangGraph Studio, Platform) that track the current API more reliably than older third-party tutorials.
- **DeepLearning.AI's short courses on LangGraph/agentic workflows** — structured walkthroughs of building cyclic, tool-using agents and human-in-the-loop patterns, directly applicable to the Advanced Concepts and Hands-on Labs sections here.
- General **agent-architecture talks** from major AI conferences (AI Engineer Summit, individual framework vendor conferences) — useful for the framework-agnostic control-flow concepts that LangGraph implements structurally.
- Caution: given the framework's fast pace of change, prefer videos dated within the last year or so, and verify specific code shown still matches current imports/class names before copying it.
`,

  "github-repos": `
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — the main repository; the examples/ directory is often the most current source of truth for API usage, especially for checkpointers and human-in-the-loop patterns.
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) — the sibling repository for the model/prompt/tool abstractions LangGraph nodes commonly wrap; useful for seeing how the two libraries' vocabularies line up.
- [langchain-ai/langgraph-studio](https://github.com/langchain-ai/langgraph-studio) (or successor docs/repo under the LangChain org) — the visual graph-debugging tool referenced throughout the Debugging section.
- [langchain-ai/langsmith-sdk](https://github.com/langchain-ai/langsmith-sdk) — the tracing/observability SDK most commonly paired with LangGraph for production monitoring.
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — worth browsing to see the higher-level role/crew abstraction contrasted against LangGraph's lower-level graph primitives, for the Comparisons section.
- [microsoft/autogen](https://github.com/microsoft/autogen) — worth browsing for the conversation-centric multi-agent pattern contrasted against LangGraph's graph-centric one.
- [langchain-ai/langgraphjs](https://github.com/langchain-ai/langgraphjs) — the JavaScript/TypeScript counterpart, useful if your production stack is Node-based rather than Python.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *State/reducer fluency*: design a State schema for a multi-tool research agent (messages, a running list of retrieved sources, a running cost counter) and choose the correct reducer for each field, justifying each choice in one sentence.
2. *Routing fluency*: write and unit-test a routing function (with hand-constructed fake state, no real LLM calls) that correctly distinguishes "needs another tool call," "needs human approval," and "done."
3. *Cycle-termination fluency*: build a cycle with an intentionally buggy exit condition, prove (via a test) that it runs away, then fix it with an explicit iteration cap and prove the fix.
4. *Checkpointing fluency*: implement the crash-and-resume test pattern from Lab 3 against a real SQLite-backed checkpointer, and verify time travel by editing an earlier checkpoint's state and resuming from it.
5. *Human-in-the-loop fluency*: implement an interrupt() gate with both an "approve" and a "reject with feedback that routes back to a revision node" resume path.
6. *Fan-out fluency*: implement a parallel-branch node (via Send) over a list of independent sub-tasks and merge results with a correct accumulating reducer; demonstrate the wall-clock speedup versus a sequential loop.
7. *Multi-agent composition*: build two independently testable subgraphs and compose them under a supervisor graph with a routing node; test each subgraph in isolation before testing the composed graph.
8. *Comparison judgment*: given three short workflow briefs (a strictly linear FAQ bot, a branchy approval-gated operations agent, a role-based content-creation pipeline), argue in one paragraph each whether a plain loop, LangGraph, or CrewAI is the better fit, and why.

External sets: the official LangGraph examples/ directory's own tutorial notebooks, reworked as exercises with the answer hidden; any public dataset of multi-step task instructions (for example, tool-use benchmark datasets) repurposed as inputs to a hand-built cyclic agent for practice.
`,

  "architecture-diagram": `
The reference production architecture for a LangGraph-based agent service — the shape most real deployments converge on:

~~~mermaid
flowchart TB
    Client["Client app"] --> LB["Load balancer"]
    LB --> API1["Graph-invoking API replica 1"]
    LB --> API2["Graph-invoking API replica N"]

    subgraph GraphExec["Compiled graph (per invocation)"]
        Assistant["assistant node\n(LLM call)"] --> RouteA{"conditional edge"}
        RouteA -->|"tool_calls"| Tools["tools node"]
        RouteA -->|"risky action"| Approval["approval node\n(interrupt)"]
        RouteA -->|"done"| Done(["END"])
        Tools --> Assistant
        Approval -->|"resume: approve/reject"| Assistant
    end

    API1 & API2 --> GraphExec
    GraphExec <--> CP[("Checkpointer\n(Postgres, pooled)")]
    Assistant --> LLMAPI["LLM API"]
    Tools --> ToolsAPI["Tool / external APIs"]
    Approval -.-> Human["Human reviewer\n(async, out of band)"]

    subgraph Obs["Observability"]
        Logs["Structured per-super-step logs"]
        Traces["LangSmith / OTel traces"]
        Metrics["Iterations, interrupt rate,\nper-node latency"]
    end
    GraphExec -.-> Obs
~~~

Every box maps to a section on this page: Assistant/Tools/routing to Beginner and Intermediate Concepts, the cycle back from Tools to Assistant to Internal Working and Data Flow, the checkpointer to Advanced Concepts and Production Usage, the Approval node to the human-in-the-loop material in Advanced Concepts, and the Observability subgraph to Monitoring and Testing.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((LangGraph))
    Core model
      State schema
      Reducers
      Nodes
      Edges
      Conditional edges
    Execution model
      Super-steps
      Pregel-inspired
      Fan-out / Send
      Concurrency within a step
    Cycles
      Assistant-to-tools loop
      Planner-executor loop
      Draft-critique-revise loop
      Iteration caps
    Durability
      Checkpointers
        MemorySaver
        SqliteSaver
        PostgresSaver
      Threads / thread_id
      Time travel
      Resumable execution
    Human-in-the-loop
      interrupt()
      Command(resume=...)
      Approval gates
      State editing mid-run
    Composition
      Subgraphs
      Supervisor pattern
      Sequential pipeline
      Hierarchical teams
    Production
      Streaming
      Observability & tracing
      Health checks
      LangGraph Platform / Studio
    Ecosystem
      LangChain
      Agent Fundamentals
      Tool Calling
      Planning / Reflection
      CrewAI / AutoGen
~~~
`,
};

export default langgraph;
