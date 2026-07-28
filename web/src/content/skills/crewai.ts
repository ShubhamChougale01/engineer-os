import type { SkillContent } from "../types";

/**
 * CrewAI — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const crewai: SkillContent = {
  overview: `
CrewAI is a role-based multi-agent orchestration framework: instead of writing one large prompt or one monolithic agent loop, you define a **crew** of specialized agents, each with a role, a goal, and a backstory, and assign them **tasks** that get executed under a **process** (sequential or hierarchical). The pitch is organizational rather than algorithmic: model your AI system the way you would model a small team of specialists — a researcher, a writer, an editor, a reviewer — and let each agent focus narrowly on what its role implies, delegating or handing off work as needed.

For an AI engineer, CrewAI matters because it is one of the most popular answers to a question that comes up constantly once you move past single-agent prototypes: "how do I decompose a complex task across multiple LLM calls without writing my own orchestration loop from scratch." Where LangGraph gives you an explicit graph/state machine to hand-wire, and AutoGen gives you a conversational multi-agent runtime where agents talk to each other in a shared chat, CrewAI gives you a higher-level, more opinionated abstraction: define agents and tasks declaratively, pick a process, and the framework handles the control flow of "who does what, in what order, with what context passed forward."

Key characteristics: agents are defined with a role, goal, and backstory (three plain-language fields that get folded into the system prompt and meaningfully shape behavior, not just documentation), tasks are the unit of work with an expected output and an assigned agent, tools can be attached per-agent so each specialist only has access to what its role needs, and a process (sequential — tasks run in a fixed order, each with access to prior outputs; hierarchical — a manager agent plans and delegates dynamically) governs how tasks actually execute. CrewAI is deliberately narrower in scope than a general graph-orchestration framework: it optimizes for the "team of specialists divides a task" mental model, and is honest that not every problem benefits from that framing — a single well-tooled agent (see the Agent Fundamentals skill) or a hand-designed graph (see the LangGraph skill) is often simpler and cheaper for problems that don't naturally decompose into distinct roles.
`,

  history: `
CrewAI was created by **João Moura** and released as an open-source Python framework in **late 2023**, at a moment when the broader ecosystem was actively exploring multi-agent patterns following early experiments like AutoGPT, BabyAGI, and Microsoft's AutoGen (also 2023). It positioned itself with a distinct hook relative to those: instead of a single autonomous loop (AutoGPT-style) or a conversational multi-agent runtime (AutoGen-style), CrewAI borrowed vocabulary from human team structure — roles, goals, backstories, crews, and delegation — making the framework's mental model legible to people who had never designed a multi-agent system before.

| Year | Milestone |
|------|-----------|
| Late 2023 | Initial release as an independent open-source framework, built on top of LangChain primitives at first |
| 2024 (early-mid) | Rapid adoption; role/goal/backstory agent definition and sequential/hierarchical processes solidify as the core API |
| 2024 (mid) | CrewAI decouples from being a thin LangChain wrapper toward a more independent core, reducing dependency weight and giving the maintainers more control over agent/task/process semantics |
| 2024 (late) | Introduction of **Flows** — a lower-level, more deterministic event/state-driven layer for wiring crews and plain function calls together, addressing feedback that pure crew-based delegation was too unpredictable for some production pipelines |
| 2024-2025 | CrewAI Enterprise / CrewAI AMP (a hosted platform layer: deployment, observability, a visual crew builder) launched alongside the open-source core, following a similar open-core commercialization pattern to other agent frameworks |
| 2025 | Continued growth of the tool ecosystem (built-in and community tool integrations) and template/"crew examples" library, alongside ongoing competition from LangGraph and AutoGen/AG2 for multi-agent mindshare |

The introduction of Flows is a meaningful signal worth internalizing: it reflects the same tension present across nearly every multi-agent framework — pure autonomous delegation is expressive but hard to make reliable, so frameworks tend to grow a more explicit, deterministic control-flow layer over time (Flows here; comparable in spirit to why LangGraph exists as a lower-level counterpart to purely conversational agent loops).
`,

  "why-it-exists": `
Before frameworks like CrewAI, teams building multi-step LLM systems had a narrow set of options, each with sharp edges:

1. **One giant prompt with everything crammed in.** A single agent asked to "research, then write, then edit, then fact-check" tends to blur those responsibilities together — the same context and instructions apply to every phase of the task, so the model doesn't get the benefit of a narrow, role-appropriate framing for each sub-task, and quality across the different phases regresses to a single, unspecialized mean.
2. **Hand-rolled orchestration.** Writing your own Python loop that calls the LLM multiple times with different prompts, passes outputs forward, and manages state — functional, but every team reinvents slightly different plumbing for the same recurring shape: sequential handoff between specialized steps, or a coordinator that assigns sub-tasks to workers.
3. **Low-level graph frameworks with no batteries for the "team" pattern.** A generic graph/state-machine tool can express any control flow, but gives you no vocabulary or defaults specific to "these are specialized workers with distinct skills," leaving you to invent role definitions, delegation rules, and task handoff conventions yourself, every time.

CrewAI existed to give that specific, extremely common shape — a small number of specialized roles collaborating on a larger goal, either in a fixed sequence or under a coordinating manager — a first-class, declarative API. It let engineers express "a researcher agent, a writer agent, and an editor agent, running in sequence" as a few lines of role/goal/backstory/task definitions rather than as bespoke orchestration code, while still allowing tool attachment and delegation to be configured explicitly.
`,

  "problem-it-solves": `
CrewAI removes concrete, recurring pains in building role-decomposed multi-agent systems:

- **Ad hoc prompt sprawl for multi-phase tasks**: instead of one prompt trying to be researcher, writer, and editor simultaneously, each phase gets its own agent with a role-appropriate system prompt (constructed from role/goal/backstory) and its own tool access.
- **Hand-rolled sequencing and context passing**: the sequential process automatically passes each task's output forward as context for subsequent tasks, removing boilerplate state-threading code.
- **Ad hoc "coordinator" logic**: the hierarchical process gives you a manager agent that plans, assigns, and reviews sub-agent work out of the box, instead of writing a custom planner from scratch.
- **Per-agent tool scoping**: tools attach to specific agents, not the whole system, so a "writer" agent doesn't accidentally get access to a "send email" tool meant only for an "ops" agent — a meaningful safety and clarity improvement over a single agent with every tool bolted on.
- **Legible team-shaped design**: the role/goal/backstory vocabulary is unusually approachable for engineers and non-engineers alike to reason about and review — "why did the crew produce this output" maps to "which agent, doing what job, said what," which is often easier to audit than a raw prompt-chaining trace.

What CrewAI deliberately does **not** try to solve, or solves only partially:

- **Arbitrary, fine-grained control flow.** If your pipeline needs precise conditional branching, loops with explicit exit conditions, or complex state machines, a graph-first tool like LangGraph gives you that control directly; CrewAI's crew/process abstraction is a higher-level, more opinionated layer that trades some control for less boilerplate — Flows partially close this gap, but the underlying philosophy stays more declarative than LangGraph's.
- **Free-form multi-agent conversation.** AutoGen's core model is a group of agents conversing in a shared chat, useful when the value is in open-ended back-and-forth discussion/debate; CrewAI's tasks are more structured units of work with defined inputs/outputs, which is a better fit when you know in advance which roles need to do what, and a worse fit when the point is genuinely emergent dialogue.
- **Guaranteeing quality or eliminating coordination overhead.** Splitting work across multiple agents adds real cost (multiple LLM calls, more tokens spent on role framing and handoff context) and real coordination risk (agents talking past each other, redundant work); CrewAI does not make that overhead disappear — it only gives you cleaner primitives to manage it, discussed at length in Anti-Patterns and Common Mistakes.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what problem CrewAI solves and how its role-based mental model differs from LangGraph's graph/state-machine control and AutoGen's conversation-driven multi-agent model.
2. Define an Agent with a role, goal, and backstory, and explain how each of those three fields actually changes model behavior rather than being cosmetic documentation.
3. Define Tasks with a description, expected output, and assigned agent, and wire multiple tasks into a Crew.
4. Choose between the sequential and hierarchical processes for a given problem, and explain the tradeoffs of each.
5. Attach tools to specific agents deliberately, and reason about which agent should have access to which capability.
6. Configure delegation between agents and predict when delegation helps versus when it produces redundant work or runaway task loops.
7. Decide, for a concrete scenario, whether a "crew of specialized agents" pattern is worth its coordination overhead and added cost compared to a single well-tooled agent or a hand-designed graph.
8. Identify and avoid the classic multi-agent pitfalls: agents talking past each other, redundant work duplicated across roles, and unbounded delegation loops.
9. Operate a CrewAI-based system in production: logging, cost tracking per agent/task, timeouts, and a testing strategy for non-deterministic multi-agent output.
10. Locate CrewAI correctly in the broader agent-framework landscape and know when to reach for LangGraph, AutoGen, or the OpenAI Agents SDK instead.
`,

  prerequisites: `
- **Required**: comfortable Python (classes, decorators, basic async — see the **Python** skill); a working understanding of how a single LLM agent works, including the reason-act-observe loop and tool calling — see the **Agent Fundamentals** and **Tool Calling** skills before this page, since CrewAI's agents are built on exactly those primitives, just composed across several of them.
- **Required conceptually**: what a system prompt is and how instructions shape model behavior — role/goal/backstory are ultimately prompt-construction techniques, and understanding that demystifies a lot of what otherwise looks like magic in CrewAI's agent definitions.
- **Strongly recommended**: the **Planning** skill, since the hierarchical process's manager agent is doing a constrained form of task planning and delegation, and the failure modes overlap heavily with general agentic-planning failure modes.
- **Strongly recommended**: the **Agent Memory** skill, since context passed between tasks in a crew is a lightweight form of memory, and understanding memory tradeoffs (what to keep, what to summarize, what to drop) directly informs how you should structure task outputs so downstream agents get what they need without drowning in irrelevant detail.
- **Helpful for the comparisons section**: the **LangGraph**, **AutoGen**, and **OpenAI Agents SDK** skills — this page assumes you have at least skimmed what those alternatives look like, so the comparison table lands rather than reading as unfamiliar jargon.

Dependency chain on this platform: **Python** → **Tool Calling** → **Agent Fundamentals** → **Planning** / **Agent Memory** → **this page** → **LangGraph** / **AutoGen** / **OpenAI Agents SDK** for the broader multi-agent orchestration landscape.
`,

  "beginner-concepts": `
### Agents: role, goal, backstory

An **Agent** in CrewAI is defined by three plain-language fields that get folded directly into its system prompt, not just metadata for humans reading the code:

~~~python
from crewai import Agent

researcher = Agent(
    role="Senior Research Analyst",
    goal="Find accurate, up-to-date facts about the given topic",
    backstory=(
        "You are a meticulous researcher who never states a claim "
        "without a source, and who flags uncertainty explicitly "
        "rather than guessing."
    ),
    verbose=True,
)
~~~

All three fields matter in practice: **role** anchors the agent's perspective and the vocabulary it reaches for, **goal** gives it an explicit objective to optimize its outputs against on every task, and **backstory** shapes tone, caution level, and implicit priorities (a "meticulous" backstory measurably reduces unsourced claims in practice, in the same way that any well-crafted system prompt shapes behavior). Treat these fields with the same care you'd give a hand-written system prompt — vague role/goal/backstory text produces vague agent behavior.

### Tasks: the unit of work

A **Task** describes what needs to be done, what a good output looks like, and which agent is responsible for it:

~~~python
from crewai import Task

research_task = Task(
    description="Research the current state of {topic} and list the "
                 "five most important recent developments with sources.",
    expected_output="A bulleted list of 5 developments, each with a "
                     "one-sentence summary and a source reference.",
    agent=researcher,
)
~~~

The **expected_output** field is not decorative — it is injected into the prompt as an explicit success criterion, and vague expected_output text ("a good summary") produces measurably less consistent output shape than a precise one ("a bulleted list of exactly 5 items, each under 40 words").

### Your first Crew: sequential process

~~~python
from crewai import Agent, Task, Crew, Process

writer = Agent(
    role="Technical Writer",
    goal="Turn research findings into a clear, engaging short article",
    backstory="You write for a technically literate but time-pressed audience.",
)

writing_task = Task(
    description="Using the research findings, write a 300-word article "
                 "on {topic} for a technical newsletter.",
    expected_output="A 300-word article with a headline and three "
                     "short paragraphs.",
    agent=writer,
    context=[research_task],   # explicitly receives research_task's output
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,   # tasks run in list order
    verbose=True,
)

result = crew.kickoff(inputs={"topic": "small language models"})
print(result)
~~~

In the **sequential** process, tasks execute in the order given, and each task can declare which prior tasks' outputs it needs via context — CrewAI threads that output forward as additional context in the downstream task's prompt. This is the simplest, most predictable process and the right default to start with.

### Why this differs from one big prompt

Asking a single agent to "research X, then write an article about it" in one shot conflates two very different jobs — gathering verifiable facts versus producing engaging prose — under one instruction set and one context window. Splitting them into two agents with distinct roles, goals, and backstories lets each phase get prompt framing tuned specifically for its job, and lets you attach different tools to each (a search tool for the researcher, none needed for the writer). The cost, covered honestly throughout this page, is more LLM calls, more latency, and a new failure surface: the handoff between agents.
`,

  "intermediate-concepts": `
### Attaching tools per agent

Tools scope what an agent can actually do, and CrewAI attaches them at the agent level, not globally:

~~~python
from crewai import Agent
from crewai_tools import SerperDevTool, FileWriterTool

search_tool = SerperDevTool()      # web search, requires an API key
file_tool = FileWriterTool()

researcher = Agent(
    role="Senior Research Analyst",
    goal="Find accurate, sourced facts",
    backstory="You cite everything and never fabricate a source.",
    tools=[search_tool],            # can search, cannot write files
)

publisher = Agent(
    role="Publisher",
    goal="Save the final article to disk",
    backstory="You handle file output and nothing else.",
    tools=[file_tool],               # can write files, cannot search
)
~~~

Deliberately narrow tool scoping is both a correctness and a security practice: an agent whose role is "write prose" has no business holding a "send an email" or "execute this SQL" tool, and scoping tools per agent (rather than handing every tool to every agent "just in case") is the CrewAI-specific expression of the least-privilege principle covered generally in the **Tool Calling** and **Agent Fundamentals** skills.

### The hierarchical process

Where sequential process runs a fixed list of tasks in order, **hierarchical** process introduces a manager (either an LLM-driven auto-manager or an agent you designate) that plans which agent handles which task, potentially re-ordering or re-assigning work dynamically:

~~~python
from crewai import Crew, Process
from crewai import LLM

crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, writing_task, editing_task],
    process=Process.hierarchical,
    manager_llm=LLM(model="gpt-4o"),   # the manager's own reasoning model
    verbose=True,
)
~~~

The manager in a hierarchical crew effectively performs a constrained planning loop: given the overall goal and the available agents (each with a role description it can read), decide who does what next, review outputs, and decide whether more work or revision is needed before finishing. This buys flexibility — the crew can adapt if a sub-task's output isn't good enough — at the cost of predictability and additional LLM calls for the manager's own planning/review steps.

### Delegation between agents

Agents can be configured to delegate to each other directly, not only through the process's own sequencing:

~~~python
researcher = Agent(
    role="Senior Research Analyst",
    goal="Find accurate facts, delegating fact-checking when uncertain",
    backstory="You know your limits and ask a specialist to verify "
               "when a claim feels shaky.",
    allow_delegation=True,   # can hand off sub-work to another agent
)
~~~

allow_delegation lets an agent effectively call another agent as if it were a tool, asking it a question or handing it a sub-task mid-execution. This is powerful for genuinely uncertain, judgment-heavy handoffs, but it is also the single biggest source of runaway cost and unpredictable behavior in CrewAI systems (see Anti-Patterns and Common Mistakes) — delegation should be enabled deliberately, per agent, not left on by default across an entire crew.

### Passing structured context between tasks

~~~python
from pydantic import BaseModel

class ResearchFindings(BaseModel):
    developments: list[str]
    sources: list[str]

research_task = Task(
    description="Research {topic} and list 5 recent developments.",
    expected_output="A ResearchFindings object with developments and sources.",
    agent=researcher,
    output_pydantic=ResearchFindings,   # validated structured output
)
~~~

Constraining a task's output to a Pydantic model (rather than free text) makes downstream tasks far more reliable consumers of that output — this is the same structured-output discipline covered in the **Tool Calling** skill, applied to inter-agent handoffs rather than tool arguments, and it is one of the most effective levers for reducing "agents talking past each other" (see Advanced Concepts).

### Crew-level memory

~~~python
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    memory=True,   # short-term + entity memory shared across the crew run
)
~~~

Enabling memory lets agents recall facts and entities encountered earlier in the same crew run beyond just the immediately preceding task's declared context — useful for longer crews with many tasks, at the cost of larger prompts and, if unmanaged, the same context-dilution problems covered in the **Agent Memory** skill.
`,

  "advanced-concepts": `
### Flows: a lower-level, more deterministic control layer

CrewAI's **Flows** API sits below Crews and gives you explicit, event-driven control over when a crew runs, what plain Python logic runs between crew invocations, and how state is threaded through a multi-step pipeline — closing much of the predictability gap relative to a pure hierarchical crew:

~~~python
from crewai.flow.flow import Flow, listen, start
from pydantic import BaseModel

class ArticleState(BaseModel):
    topic: str = ""
    research: str = ""
    draft: str = ""

class ArticleFlow(Flow[ArticleState]):

    @start()
    def get_topic(self):
        self.state.topic = "small language models"

    @listen(get_topic)
    def run_research_crew(self):
        result = research_crew.kickoff(inputs={"topic": self.state.topic})
        self.state.research = str(result)

    @listen(run_research_crew)
    def run_writing_crew(self):
        result = writing_crew.kickoff(inputs={"research": self.state.research})
        self.state.draft = str(result)

flow = ArticleFlow()
flow.kickoff()
~~~

Flows let you mix deterministic plain-Python steps, conditional branching, and one or more Crew invocations in the same pipeline — a pragmatic middle ground between "fully autonomous crew delegation" and "fully hand-wired graph." Teams that find pure hierarchical delegation too unpredictable in production frequently restructure around a Flow that calls smaller, more narrowly scoped crews at specific, deterministic points, which is functionally converging toward the same explicit-control philosophy LangGraph starts from.

### Diagnosing "agents talking past each other"

This failure mode shows up when two agents' outputs reference incompatible assumptions — e.g., a researcher agent produces findings framed around "consumer use cases" while a writer agent, working from a stale or under-specified context, drafts around "enterprise use cases." The root causes are almost always one of: (1) an underspecified expected_output that leaves the producing agent's output shape ambiguous, (2) missing or incomplete context wiring (a downstream task not declaring context=[...] for a task whose output it actually needs), or (3) role/goal/backstory text that doesn't clearly bound what "done" looks like for a given role. The fix is nearly always tightening expected_output and context, often with a structured output_pydantic model, rather than adding more agents or more delegation.

### Redundant work across agents

When two agents' roles overlap even partially (e.g., a "researcher" and a "fact-checker" that both independently search the web for the same facts), you pay for the same work twice in tokens and latency without a corresponding quality gain. The senior instinct is to audit role boundaries explicitly: for each pair of agents in a crew, ask "is there any task either agent could reasonably think belongs to it?" — if yes, tighten the role/goal text or merge the two agents into one.

### Runaway task loops from unbounded delegation

allow_delegation, combined with a hierarchical process's manager freely reassigning and requesting revisions, can produce a loop where an agent keeps delegating a sub-question back and forth, or a manager keeps requesting "one more revision" without a clear stopping criterion, burning tokens with no convergence. Mitigations: set a max_iter or max_execution_time on agents/tasks where supported, keep allow_delegation off by default and enable it only for agents whose role genuinely benefits from asking a specialist, and give the manager (in hierarchical mode) an explicit, checkable definition of "done" in the top-level goal rather than leaving revision criteria implicit.

### Decision table: when delegation and hierarchical process earn their cost

| Situation | Recommendation |
|-----------|-----------------|
| Task decomposition and ordering are known in advance | Sequential process — cheaper, more predictable, no manager overhead |
| The right agent/order genuinely depends on the input and can't be predicted upfront | Hierarchical process, with a tightly scoped top-level goal |
| An agent occasionally needs a second opinion or specialist check, not routinely | allow_delegation=True on that one agent only |
| Every agent might plausibly need to ask every other agent for help | Sign of an under-designed crew — tighten roles/tasks instead of enabling broad delegation |
| The pipeline has clear deterministic steps mixed with a few genuinely agentic sub-tasks | Flows, invoking smaller crews at specific points |
| The whole pipeline is actually just conditional branching over known steps | A hand-designed graph (LangGraph) or plain code will likely be simpler and cheaper than any crew |

### Concurrency and async execution

CrewAI supports async task/crew execution (kickoff_async) for running independent crews or tasks concurrently rather than serially, which matters when a pipeline includes genuinely independent sub-jobs (e.g., researching two unrelated topics in parallel before a final synthesis task) — the same async-I/O reasoning from the **Python** skill applies directly, since LLM and tool calls are network-bound.
`,

  "internal-working": `
At kickoff time, a Crew executes a fixed pipeline that differs meaningfully between the two processes. Sequential is the simpler case to reason about first:

~~~mermaid
flowchart TB
    K["crew.kickoff(inputs)"] --> T1["Task 1: build prompt from\nagent role/goal/backstory\n+ task description + inputs"]
    T1 --> L1["LLM call (+ tool calls\nif the agent has tools)"]
    L1 --> O1["Task 1 output\n(text or validated Pydantic model)"]
    O1 --> T2["Task 2: build prompt, including\nTask 1 output as declared context"]
    T2 --> L2["LLM call (+ tool calls)"]
    L2 --> O2["Task 2 output"]
    O2 --> T3["... remaining tasks in order ..."]
    T3 --> R["CrewOutput: final result +\nper-task outputs + token/usage metrics"]
~~~

Step by step for the sequential process:

1. **Prompt assembly per task.** For each task in order, CrewAI constructs a prompt combining the assigned agent's role/goal/backstory (forming the system-prompt framing), the task's description (with any {inputs} interpolated), and the declared context — the textual or structured output of any prior tasks this one depends on.
2. **Agent execution.** The agent runs its own reason-act-observe loop against that prompt, calling any attached tools as needed, exactly like a single agent would (see the **Agent Fundamentals** skill for that inner loop) — a crew task is not a different execution mechanism, it's a single agent run with task-scoped framing.
3. **Output capture and validation.** The task's output is captured as text, or validated against an output_pydantic/output_json schema if one was declared, and stored for use as context by later tasks.
4. **Repeat for each subsequent task**, threading forward only the context explicitly declared (plus crew-level memory, if enabled).
5. **Final assembly.** The CrewOutput bundles the last task's output as the crew's overall result, alongside every individual task's output and usage metrics (tokens, and by extension cost) for the whole run.

The **hierarchical** process adds a manager layer above this: rather than a fixed task order, the manager agent (backed by its own manager_llm) reads the available agents' role descriptions and the set of tasks/goal, decides which agent should handle which piece of work next, and can request revisions or re-delegate before considering the crew's work complete. This makes the pipeline diagram fundamentally a loop with a planning/dispatch node rather than a straight line — more flexible, and correspondingly harder to reason about or bound in advance, which is why production teams frequently favor sequential (or Flows composing smaller sequential crews) over hierarchical once a pipeline's shape is well understood.
`,

  architecture: `
### Runtime architecture

~~~mermaid
flowchart TB
    subgraph Crew["Crew"]
        Proc["Process\n(sequential | hierarchical)"]
        subgraph Agents["Agents"]
            A1["Agent: role/goal/backstory\n+ tools[]"]
            A2["Agent: role/goal/backstory\n+ tools[]"]
            A3["Agent: role/goal/backstory\n+ tools[]"]
        end
        subgraph Tasks["Tasks"]
            T1["Task 1 -> agent A1"]
            T2["Task 2 -> agent A2, context=[T1]"]
            T3["Task 3 -> agent A3, context=[T1,T2]"]
        end
        Mgr["Manager agent\n(hierarchical only)"]
    end
    Proc --> Tasks
    Mgr -.assigns/reviews.-> Tasks
    Tasks --> Agents
    Agents -->|tool calls| ExtTools["External tools/APIs\n(search, files, custom tools)"]
    Agents -->|chat/completion| LLMProv["LLM provider(s)"]
    Crew --> Output["CrewOutput:\nfinal result + per-task outputs + usage"]
~~~

The key architectural insight: a Crew is a thin coordination layer over ordinary agent executions. Each Agent is, internally, the same reason-act-observe loop you'd build for a single-agent system — CrewAI's value-add is entirely in how it wires role-scoped prompts, task ordering/context-passing, and (optionally) delegation and management across multiple such loops, not in a fundamentally different execution primitive per agent.

### Application layout for a production CrewAI service

~~~
contentcrew/
├── pyproject.toml
├── src/contentcrew/
│   ├── agents.py          # Agent definitions: role/goal/backstory/tools
│   ├── tasks.py           # Task definitions: description/expected_output
│   ├── crews/
│   │   ├── research_crew.py   # smaller, focused crew: research only
│   │   └── writing_crew.py    # smaller, focused crew: writing/editing only
│   ├── flow.py            # Flow composing the crews with deterministic glue
│   ├── tools/             # custom tool implementations, scoped per agent
│   ├── api/                # FastAPI routes exposing /generate
│   └── evaluation/         # golden-set tests over full crew/flow runs
└── tests/
~~~

A recurring, hard-won production lesson (echoed across CrewAI, LangGraph, and AutoGen users alike): keep individual crews small and single-purpose, and compose them via a deterministic outer layer (a Flow, or plain orchestration code) rather than building one enormous crew with many agents and heavy inter-agent delegation — smaller crews are dramatically easier to test, debug, and reason about in isolation.
`,

  "data-flow": `
Tracing one sequential-process crew run end to end, including a tool call inside one task, as a sequence diagram:

~~~mermaid
sequenceDiagram
    participant Caller
    participant Crew
    participant Researcher as Agent: Researcher
    participant Tool as Search Tool
    participant Writer as Agent: Writer
    participant LLM as LLM API

    Caller->>Crew: kickoff(inputs={topic: "..."})
    Crew->>Researcher: run Task 1 (description + inputs)
    Researcher->>LLM: reasoning step
    LLM-->>Researcher: "I should search for recent developments"
    Researcher->>Tool: search(query)
    Tool-->>Researcher: search results
    Researcher->>LLM: synthesize findings from results
    LLM-->>Researcher: Task 1 output (findings)
    Researcher-->>Crew: Task 1 output
    Crew->>Writer: run Task 2 (description + Task 1 output as context)
    Writer->>LLM: draft article using findings
    LLM-->>Writer: Task 2 output (article)
    Writer-->>Crew: Task 2 output
    Crew-->>Caller: CrewOutput(final=article, tasks_output=[...], usage=...)
~~~

The most misunderstood part is that every arrow into an LLM box is a separate network call with its own latency and cost, and a crew's total latency is closer to the sum of its tasks' latencies (plus manager overhead in hierarchical mode) than to a single agent's latency — a three-task crew where each task takes 5-10 seconds is easily a 20-30+ second end-to-end operation, before any tool-call latency or retries are added. This is the concrete, unavoidable cost side of the "crew of specialists" pattern that must be weighed against its clarity/quality benefits for every use case (see Comparisons and Anti-Patterns).
`,

  "production-usage": `
### A minimal but production-shaped crew

~~~python
from crewai import Agent, Task, Crew, Process, LLM

llm = LLM(model="gpt-4o-mini", temperature=0.2, timeout=30)

researcher = Agent(
    role="Senior Research Analyst",
    goal="Find accurate, sourced facts about {topic}",
    backstory="You cite sources and flag uncertainty instead of guessing.",
    llm=llm,
    max_iter=6,             # cap the agent's internal reasoning/tool loop
    verbose=True,
)

writer = Agent(
    role="Technical Writer",
    goal="Turn research into a clear 300-word article",
    backstory="You write for a technically literate, time-pressed audience.",
    llm=llm,
    max_iter=4,
)

research_task = Task(
    description="Research {topic} and list 5 recent developments with sources.",
    expected_output="A bulleted list of 5 items, each with a source.",
    agent=researcher,
)

writing_task = Task(
    description="Write a 300-word article on {topic} using the research.",
    expected_output="A 300-word article with a headline and 3 paragraphs.",
    agent=writer,
    context=[research_task],
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    verbose=True,
)

try:
    result = crew.kickoff(inputs={"topic": "small language models"})
except Exception as exc:
    # A production caller must handle partial/failed crew runs explicitly —
    # a crew is not transactional; earlier tasks may have already run
    # (and incurred cost) even if a later task fails.
    raise RuntimeError(f"Crew execution failed: {exc}") from exc
~~~

Non-negotiables for production:

1. **Set explicit timeouts on the underlying LLM client** for every agent — a hung call in the middle of a multi-task crew otherwise stalls the entire run, and unlike a single-agent system, a stuck crew can be burning cost across several agents' prior successful steps while it hangs.
2. **Cap iteration with max_iter/max_execution_time** on every agent, and consider a hard wall-clock timeout around the whole crew.kickoff call, since a stuck reasoning loop or an unbounded delegation chain (see Advanced Concepts) is a real, observed failure mode, not a theoretical one.
3. **Prefer sequential process and small, focused crews by default**; reach for hierarchical only once you've established that task order genuinely can't be known in advance for your use case.
4. **Track token usage and cost per task**, not just per crew run — CrewOutput exposes per-task usage, and that granularity is what lets you find the one expensive task in an otherwise cheap pipeline.
5. **Use output_pydantic/output_json on every task whose output feeds another task**, so inter-agent handoffs are structurally validated rather than passed as loosely-shaped free text.
`,

  "industry-examples": `
- **Marketing and content-operations teams** at a range of mid-size companies have adopted CrewAI-style crews (a researcher, a writer, an SEO editor) to automate first-draft content pipelines, using the role-based framing to keep each phase's prompt narrowly focused and to make the pipeline legible to non-engineering stakeholders reviewing the workflow.
- **Recruiting and HR-tech tooling** has used role-based crews (a sourcer, a screener, a scheduler) to automate candidate-pipeline tasks, where the "team of specialists" framing maps naturally onto an existing human workflow being partially automated.
- **Customer-support triage pipelines** built with CrewAI-style crews (a classifier agent, a knowledge-base researcher agent, a response-drafter agent) are a common pattern in support-automation vendors and internal tooling, where each stage benefits from a distinct role framing and distinct tool access (a KB search tool for the researcher, no tools for the drafter).
- **Internal "AI ops" automation** inside software teams — a crew that triages an incident, researches related runbooks, and drafts a postmortem summary — illustrating the pattern's fit for internally-facing, moderate-stakes automation where some redundancy/cost is acceptable in exchange for the clearer role decomposition.

Pattern to notice: the common thread across adopters is a workflow that already exists as a small human team with distinct job titles — the framework earns its keep fastest when that mapping is genuinely natural, and struggles when teams force a crew shape onto a problem that's really just a single well-tooled agent or a deterministic pipeline in disguise (see Anti-Patterns).
`,

  "best-practices": `
1. **Start with a single agent before reaching for a crew.** If one well-tooled agent (see the Agent Fundamentals skill) can do the job, a crew adds cost and coordination risk without a corresponding quality gain — only decompose into multiple agents once you can name a concrete reason a single agent underperforms (context dilution across genuinely distinct roles, need for different tool scoping per phase).
2. **Default to the sequential process.** It is cheaper, more predictable, and easier to debug than hierarchical; reach for hierarchical only when task order genuinely depends on input in a way you can't predict upfront.
3. **Write role/goal/backstory with the same care as a hand-crafted system prompt.** Vague fields produce vague behavior; specific, constraint-bearing text (what to cite, what tone, what to flag) measurably changes output quality.
4. **Scope tools per agent tightly**, following least privilege — an agent's tool list should map exactly to what its role requires, not "every tool, just in case."
5. **Use output_pydantic/output_json for every inter-task handoff** that feeds another task, to avoid the "agents talking past each other" failure mode caused by ambiguous free-text handoffs.
6. **Keep allow_delegation off by default**, enabling it only for the specific agents whose role genuinely benefits from asking a specialist — broad, always-on delegation across a crew is a leading cause of runaway cost.
7. **Keep individual crews small and single-purpose**, composing larger pipelines via Flows or plain orchestration code rather than building one large crew with many agents and heavy delegation.
8. **Set max_iter/max_execution_time on every agent**, and a wall-clock timeout around crew.kickoff, since unbounded reasoning or delegation loops are an observed, not hypothetical, failure mode.
9. **Track and log token usage per task**, not only per crew run, so cost attribution and debugging can point at the specific task/agent responsible for a regression.
10. **Treat a crew run as non-transactional.** Earlier tasks may have already executed (and cost money) before a later task fails — design retry/resume logic around per-task outputs, not around re-running the whole crew from scratch by default.
11. **Evaluate against a golden set at the crew/flow level, not only per agent** — a crew can look fine at each individual task's output while still producing a bad final result if the composition itself is flawed.
12. **Reach for Flows once a pipeline needs deterministic branching mixed with agentic sub-tasks** — don't force purely declarative crew delegation to express logic that's actually a simple if/else.
`,

  "anti-patterns": `
### One giant crew with heavy inter-agent delegation

~~~python
# WRONG: five agents, all with allow_delegation=True, hierarchical
# process, and overlapping roles ("researcher", "fact-checker",
# "analyst" all independently empowered to search the web) — this
# produces redundant work, unpredictable task ordering, and
# unbounded cost with no clear stopping point.

crew = Crew(
    agents=[researcher, fact_checker, analyst, writer, editor],
    tasks=[...],
    process=Process.hierarchical,
    # every agent above also has allow_delegation=True
)

# RIGHT: two small, focused crews (research; writing/editing) composed
# through a deterministic Flow, each using sequential process, with
# delegation enabled only where a specific need was identified.
~~~

### Other production-grade anti-patterns

- **Using a crew where a single agent would do.** If every task in the crew could be handled by one agent with the right tools and a well-written prompt, the crew is pure overhead — more LLM calls, more latency, more places for handoffs to go wrong, with no corresponding quality benefit.
- **Vague expected_output fields.** "Write a good summary" as an expected_output produces inconsistent shape and length across runs; "a bulleted list of exactly 5 items, each under 40 words, with a source" produces consistent, checkable output.
- **Free-text handoffs between tasks that need structure.** Passing loosely-shaped prose as context into a downstream task that actually needs specific fields invites the receiving agent to misinterpret or drop information — use output_pydantic/output_json for any handoff that matters.
- **allow_delegation=True everywhere "just in case."** This is the single most common cause of both runaway cost and unpredictable, hard-to-debug execution traces; enable it deliberately per agent, tied to an identified need.
- **No iteration or time caps on agents.** Without max_iter/max_execution_time, a confused agent (or a delegation loop between two agents) can run far longer, and cost far more, than intended before anyone notices.
- **Treating a crew's output as deterministic enough for exact-match testing.** LLM-driven multi-agent output varies run to run; test structural properties and golden-set quality scores, not exact text (see Testing).
- **Ignoring per-task usage metrics.** Debugging cost or latency regressions without per-task breakdowns means guessing which agent is expensive instead of measuring it directly.
`,

  performance: `
### Measure first

~~~python
result = crew.kickoff(inputs={"topic": "small language models"})

# CrewOutput exposes per-task outputs and usage — inspect both before
# tuning anything.
for task_output in result.tasks_output:
    print(task_output.agent, task_output.raw[:80])

print(result.token_usage)   # aggregate usage across the whole crew run
~~~

Time each task, not just the whole crew, to find the actual bottleneck — in most crews, one task (usually one involving a slow tool call, like web search, or a larger/slower model) dominates total latency, and optimizing the wrong task wastes effort.

### The optimization hierarchy (apply in order)

1. **Reduce the number of agents/tasks to the minimum that genuinely needs distinct role framing.** Every additional task is a full additional LLM round trip (or several, if the agent uses tools); this is the single biggest lever, bigger than any per-call optimization.
2. **Use a smaller/faster model for simpler roles** (a summarizer or formatter agent rarely needs the same model as a research-and-reasoning agent) and reserve the most capable model for the task that actually needs it.
3. **Prefer sequential over hierarchical process** when task order is knowable in advance — hierarchical's manager adds its own planning/review LLM calls on top of the actual work.
4. **Run independent tasks/crews concurrently** with async kickoff where sub-jobs genuinely don't depend on each other (e.g., researching two unrelated sub-topics before a synthesis task), rather than serializing work that doesn't need to be serial.
5. **Cache tool results** (especially search results) across runs on the same or similar inputs where staleness is acceptable, since tool calls are frequently the actual latency bottleneck, not the LLM reasoning itself.
6. **Bound iteration explicitly** (max_iter, max_execution_time) so a confused agent's retry loop has a hard ceiling on cost/latency rather than an open-ended one.
7. **Trim context passed between tasks** to what the downstream task actually needs (a structured output_pydantic subset, not the full raw prior output), since larger prompts cost more and dilute the model's attention on the parts that matter.

### Numbers worth internalizing

A crew's end-to-end latency is roughly additive across its tasks (each task is at least one full LLM call, more if tools or delegation are involved), so a five-task hierarchical crew with delegation enabled can easily run to a minute or more and cost several times what a single well-tooled agent call would — that multiplier is the concrete number to weigh against the clarity/quality benefit before choosing a crew-based design (see Comparisons).
`,

  scalability: `
CrewAI itself is a coordination layer; scalability is mostly a property of the LLM provider(s) and tools each agent calls, plus how you structure crew invocations as a workload.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["Crew-serving API replica 1"]
    LB --> API2["Crew-serving API replica N"]
    API1 & API2 --> LLMProv["LLM provider(s)\n(rate limits apply per key/account)"]
    API1 & API2 --> Tools["External tools/APIs\n(search, DB, internal services)"]
    Queue["Job queue"] --> Workers["Async crew/flow workers"]
    Workers --> LLMProv
    Workers --> Tools
~~~

### Scaling the request path

- **Horizontal**: crew-serving API replicas are stateless per request (given shared LLM/tool credentials), so scale them like any stateless service behind a load balancer — the same pattern used for single-agent services.
- **The real bottleneck is almost always LLM API rate limits and per-call latency**, multiplied by however many tasks/agents a given crew invokes — a crew with five tasks consumes roughly five times the rate-limit budget of a single-agent call for the same request, which matters directly for capacity planning.
- **Long-running crews (especially hierarchical, with delegation) are a poor fit for a synchronous request/response API** — move them to an async job queue (Celery, an async task runner) with a polling or webhook-based result delivery, the same pattern used for any long-running agentic workload.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| LLM rate limits under crew fan-out | Route different agents to different models/providers/keys where feasible; queue and backoff rather than fail |
| Long hierarchical crew latency | Prefer sequential process; move long crews to async job execution rather than a synchronous endpoint |
| Redundant tool calls across similar requests | Cache tool results (especially search) keyed on normalized query |
| Cost scaling linearly with number of agents/tasks | Audit crew size regularly; merge or remove agents whose role doesn't earn its keep |
| Unbounded delegation chains consuming capacity | Enforce max_iter/max_execution_time and disable allow_delegation by default |
`,

  security: `
### CrewAI-specific attack surface

1. **Tool over-provisioning per agent.** Attaching every available tool to every agent "for flexibility" means a compromised or confused agent (via prompt injection in retrieved content, or simply a reasoning mistake) has access to capabilities its role never needed — a writer agent should never hold a tool that can send emails, execute code, or modify data. Scope tools tightly per agent as a security boundary, not just an organizational convenience.
2. **Prompt injection via tool results flowing into other agents.** If a researcher agent's tool (web search, a document reader) returns content containing injected instructions, and that output is passed as context into a downstream agent, the injection can propagate across the crew. Treat all tool output as untrusted input at every hop, not only at the point of first retrieval — see the **Tool Calling** and dedicated **Prompt Injection** skills.
3. **Delegation as an amplified injection vector.** allow_delegation means one agent's output can directly shape another agent's task framing; a successfully injected agent can attempt to manipulate a peer agent's behavior through a delegated request, which is a more direct attack path than injection reaching only the final output.
4. **Unbounded cost from unauthenticated or unrated crew-triggering endpoints.** A public endpoint that kicks off a multi-agent, multi-task crew per request is a much larger cost-abuse surface than a single-agent endpoint, since each malicious request multiplies into several LLM calls; apply the same authentication/rate-limiting discipline as any LLM-backed endpoint, scaled up for the larger blast radius.
5. **Sensitive data exposure across agent boundaries.** Passing full, unredacted context (including any sensitive fields fetched by one agent's tool) into every downstream task can leak data to an agent whose role doesn't need it and whose output surface (e.g., a public-facing draft) shouldn't include it — apply the same data-minimization discipline to inter-agent context as you would to inter-service data flow.

### Defenses

- Scope every agent's tools to the minimum its role requires; review tool lists in code review the same way you'd review IAM permissions.
- Sanitize/flag tool output that reaches downstream agents, and keep system-level instructions clearly separated and reinforced against override attempts at every agent, not only the first.
- Disable allow_delegation by default and enable it deliberately per agent, auditing what a delegated request can actually cause the receiving agent to do.
- Rate-limit and authenticate any endpoint that triggers a crew, sized to the crew's actual per-request LLM-call multiplier, not to a single-agent baseline.
- Minimize what gets passed as context between tasks — pass the structured fields a downstream task needs, not the full raw output of an upstream tool call, especially where that upstream output may contain sensitive data.

See the dedicated **Prompt Injection**, **OWASP Top 10 for LLM Applications**, and **Tool Calling** skills for depth beyond what's CrewAI-specific here.
`,

  testing: `
### Testing individual agents and tasks in isolation

~~~python
def test_research_task_produces_expected_shape():
    from crewai import Crew, Process

    crew = Crew(
        agents=[researcher],
        tasks=[research_task],
        process=Process.sequential,
    )
    result = crew.kickoff(inputs={"topic": "test topic"})

    # Don't assert on exact text; assert on structural properties.
    assert result is not None
    assert len(str(result)) > 0
~~~

### Testing with a mocked/deterministic LLM for fast unit tests

~~~python
from unittest.mock import patch

def test_writer_task_uses_research_context():
    fake_research_output = "1. Fact A (source X)\\n2. Fact B (source Y)"

    with patch.object(research_task, "output", fake_research_output):
        # Assert the writing task's constructed prompt actually
        # includes the upstream research content — catches context-
        # wiring bugs (a missing context=[research_task]) without
        # needing a real, non-deterministic LLM call.
        prompt = writing_task._build_prompt()
        assert "Fact A" in prompt
~~~

### The senior testing doctrine for multi-agent crews

- **Unit test deterministic wiring**: task context declarations, tool attachment per agent, output_pydantic schema validation — none of this requires a real LLM call and all of it is where real bugs (missing context, wrong agent assignment) actually live.
- **Integration test against a small golden set at the crew/flow level**, not just per task — a crew can look correct at every individual task's output while the composition still produces a bad final result (see the AI Evals skill for the general discipline).
- **Never assert on exact LLM-generated text.** Assert on structural properties (expected_output shape honored, output_pydantic validation passes, required fields present) or on LLM-as-judge scoring against a documented rubric.
- **Test failure and partial-completion behavior explicitly.** Since a crew is not transactional, verify your system's behavior when an early task succeeds but a later one fails — does the caller get a clear error, and are already-incurred costs logged?
- **Regression-test cost and task count**, not only output quality — a crew that silently grew from 3 tasks to 6 over time (through gradual delegation creep) is a real, observed production drift worth catching in CI.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect result.tasks_output first, always**, before assuming the final output's problem is a prompt or model issue — with multiple tasks in play, the bug is very often in an earlier task's output or in a missing context wiring, not in the last task.

~~~python
result = crew.kickoff(inputs={"topic": "..."})
for t in result.tasks_output:
    print(t.agent, "->", t.raw[:200])
~~~

2. **Turn on verbose=True at both the Agent and Crew level** to see each agent's intermediate reasoning and tool calls — this is the fastest way to catch a task that silently misunderstood its expected_output or picked the wrong tool.
3. **Check context=[...] wiring on every task** whose output looks like it's missing information a prior task actually produced — a very common bug is simply forgetting to declare a dependency, so CrewAI never threads that output forward.
4. **Run a single task in isolation** (a one-agent, one-task crew) when diagnosing whether a problem is in that task's own logic versus in how it's being composed with others.
5. **Check for delegation loops explicitly** when a run takes far longer or costs far more than expected — inspect the verbose trace for repeated back-and-forth between the same two agents, which signals unbounded delegation rather than genuine progress.
6. **Diagnose hierarchical-manager behavior separately from worker-agent behavior** — when a hierarchical crew's output is wrong, first check whether the manager assigned/sequenced tasks sensibly (visible in the verbose trace) before assuming a worker agent's own output was at fault.

### Debugging "agents talking past each other"

Print both the upstream task's raw output and the exact prompt the downstream task received (including its context) side by side — this almost always reveals either an underspecified expected_output on the upstream task, a missing context declaration on the downstream task, or unstructured free text that the downstream agent partially misread, all of which point to the same fix: tighten expected_output and prefer output_pydantic for that handoff.
`,

  monitoring: `
Production visibility for a CrewAI system rests on both general service observability (see the Observability category) and multi-agent-specific signals that a single-agent system doesn't need.

### Structured logging per crew run

~~~python
import structlog

log = structlog.get_logger()

def logged_kickoff(crew, inputs: dict, request_id: str):
    result = crew.kickoff(inputs=inputs)
    log.info(
        "crew_run",
        request_id=request_id,
        num_tasks=len(result.tasks_output),
        total_tokens=getattr(result.token_usage, "total_tokens", None),
        per_task_agents=[t.agent for t in result.tasks_output],
    )
    return result
~~~

### Multi-agent-specific metrics to track

- **Per-task token usage and latency**, not just crew totals — the fastest way to spot the one expensive/slow task in an otherwise cheap pipeline.
- **Delegation event count per run** (how many times agents handed off to each other) — a rising trend without a corresponding quality improvement signals delegation creep worth auditing.
- **Task count per crew over time** — crews tend to accumulate agents and tasks gradually as teams patch quality issues by adding a new "reviewer" or "checker" role; track this explicitly so growth is a deliberate decision, not silent drift.
- **Manager reassignment/revision-request count** in hierarchical crews — a high count on a stable workload suggests the top-level goal or task expected_output text is underspecified, not that the agents themselves are underperforming.
- **Partial-failure rate**: how often a crew run fails after some tasks already completed (and incurred cost), since this is a distinct and important signal for a non-transactional multi-step system.

### Tracing

Trace each task as its own span (mirroring result.tasks_output), nested under a parent span for the overall crew.kickoff call, and nest tool calls under their owning agent's task span — this mirrors the internal-working pipeline and is the fastest way to answer "why was this specific crew run slow, expensive, or wrong" without re-reading verbose logs line by line.
`,

  deployment: `
### A production Dockerfile for a CrewAI-based service

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
CMD ["uvicorn", "contentcrew.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: slim base and a non-root user reduce attack surface; the dependency layer is cached separately from application code for fast rebuilds; PYTHONUNBUFFERED ensures verbose crew logs (which matter a lot for debugging multi-agent runs) stream immediately rather than buffering.

### Serving topology

- **Short crews (few tasks, sequential, no delegation)**: can be served synchronously behind a normal API, with a request timeout sized generously above the crew's measured p95 latency.
- **Longer or hierarchical crews**: move to an async job queue (Celery, an async task runner, or a durable workflow engine) with a polling or webhook-based result delivery — treating a multi-minute, multi-agent run as a synchronous HTTP request invites timeouts and wasted client-side retries that re-trigger a costly crew from scratch.
- **Health checks**: a /healthz for process liveness, and a /readyz that verifies the LLM provider(s) and any required tool APIs (search, internal services) are reachable before accepting traffic.
- **Cost and quota guarding**: since a crew multiplies LLM calls across its tasks and agents, apply per-tenant or per-endpoint request quotas sized to that multiplier, not to a single-agent baseline.

### CI/CD pipeline sketch

lint/typecheck → unit tests (task wiring, tool scoping, output schema validation) → golden-set regression test at the crew/flow level → build image → deploy with rolling update → separately validate any long-running/hierarchical crew paths against a canary workload before flipping full production traffic.
`,

  "production-checklist": `
Before a CrewAI-based system takes real traffic:

- [ ] Every agent's role/goal/backstory is specific and reviewed, not left as placeholder text
- [ ] Every task's expected_output is precise enough to produce consistent output shape across runs
- [ ] Tools are scoped per agent following least privilege, not attached broadly "just in case"
- [ ] output_pydantic/output_json used for every inter-task handoff that another task depends on
- [ ] allow_delegation is disabled by default and enabled only on agents with an identified need
- [ ] max_iter and/or max_execution_time set on every agent
- [ ] A wall-clock timeout wraps crew.kickoff, and timeouts are set on the underlying LLM client
- [ ] Sequential process used unless a concrete case for hierarchical has been established
- [ ] Per-task token usage and latency are logged, not only crew-level totals
- [ ] Delegation event count and task count are tracked over time to catch coordination-overhead creep
- [ ] Failure/partial-completion behavior is explicitly handled (crew runs are not transactional)
- [ ] Long-running or hierarchical crews are served asynchronously, not as a synchronous HTTP request
- [ ] Rate limiting and authentication on any endpoint that triggers a crew, sized to its LLM-call multiplier
- [ ] A golden-set regression test exists at the crew/flow level, not only per individual agent/task
- [ ] Someone has explicitly justified, in writing, why this problem needed multiple agents rather than one

Cross-check with the AI Evals skill for the deeper evaluation discipline behind the golden-set checklist item.
`,

  "common-mistakes": `
1. **Reaching for a crew before trying a single agent.** Multi-agent decomposition is often assumed to be inherently more capable; in practice a single well-tooled agent frequently matches a crew's quality at a fraction of the cost and latency, and the decomposition should be justified by a concrete observed limitation, not assumed upfront.
2. **Vague role/goal/backstory text.** Treating these fields as documentation rather than prompt content produces agents that behave close to generically, undermining the entire premise of role specialization.
3. **Leaving allow_delegation on for every agent.** This is the single most common cause of runaway cost and unpredictable execution traces; it should be a deliberate, per-agent decision tied to an identified need for a second opinion or specialist handoff.
4. **Free-text handoffs where structure was needed.** Passing loosely-shaped prose between tasks that actually depend on specific fields is the leading cause of "agents talking past each other" — output_pydantic largely eliminates this class of bug.
5. **Choosing hierarchical process by default "for flexibility."** The manager's own planning/review calls add cost and unpredictability that sequential process avoids entirely when task order is actually knowable in advance.
6. **No iteration or execution-time caps.** Without max_iter/max_execution_time, a confused agent or a delegation loop can run and cost far more than intended before anyone notices, since there's no automatic circuit breaker.
7. **Letting crews grow agent-by-agent over time without review.** Teams patch quality issues by adding a new "checker" or "reviewer" agent repeatedly, and a crew that started with two agents can silently become six, each adding cost and coordination surface, without anyone deciding that tradeoff deliberately.
8. **Testing crew output with exact-string assertions.** LLM-driven multi-agent output is non-deterministic; tests should check structural properties and golden-set quality scores, not exact text.
9. **Treating a crew run as transactional.** Assuming a failed crew run can simply be retried from scratch ignores that earlier tasks may have already executed (and cost money); production systems need explicit partial-completion handling.
10. **Not measuring whether the multi-agent decomposition actually improved quality.** Shipping a crew because the pattern is popular, without a golden-set comparison against a single-agent baseline, means you can't actually justify the added cost and latency to a reviewer or to yourself.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| Downstream task output missing expected information | context=[...] not declared on the dependent task | Explicitly declare context for every task that needs a prior task's output |
| Crew run far slower/costlier than expected | Delegation loop between agents, or hierarchical manager repeatedly requesting revisions | Inspect verbose trace for repeated back-and-forth; cap max_iter/max_execution_time; disable unneeded allow_delegation |
| Inconsistent output shape across runs of the "same" task | Vague expected_output text | Rewrite expected_output with precise structural requirements; consider output_pydantic |
| Agent uses the wrong tool or no tool at all | Tool not attached to that agent, or tool description unclear | Verify tools=[...] on the agent; improve the tool's docstring/description |
| Timeout/hang mid-crew | No timeout set on the LLM client or a tool call | Set explicit timeouts on the LLM client and every tool implementation |
| Partial crew failure leaves inconsistent downstream state | Crew run treated as transactional by the caller | Handle partial completion explicitly; log per-task outputs even on overall failure |
| Hierarchical crew produces a plausible but off-goal final result | Top-level goal/expected_output for the crew is underspecified, leaving the manager's definition of "done" ambiguous | Tighten the top-level goal and the final task's expected_output |
| Cost regression after a minor change | A new agent or delegation path was added without being tracked | Track task count and delegation events over time as an explicit metric |

The habit that matters: reproduce with a minimal crew (fewest tasks/agents that still shows the bug), inspect result.tasks_output and the verbose trace first, and only then consider whether the underlying LLM or a specific tool is actually at fault.
`,

  faqs: `
**Q: Is CrewAI just LangChain with extra steps?**
No, though it was originally built on LangChain primitives. CrewAI's distinct contribution is the role/goal/backstory agent-definition vocabulary and the task/process (sequential/hierarchical) abstraction for composing multiple agents — a layer LangChain itself doesn't prescribe. See Comparisons for how the frameworks' centers of gravity actually differ.

**Q: When should I use CrewAI instead of a single agent?**
When you can name a concrete reason a single agent underperforms for your task — usually because the task genuinely spans distinct roles that benefit from different framing and different tool access (a researcher versus a writer), not merely because multi-agent designs feel more sophisticated. If a single well-tooled agent (see Agent Fundamentals) already does the job, a crew adds cost without benefit.

**Q: Sequential or hierarchical process?**
Default to sequential; it's cheaper and more predictable. Use hierarchical only when the right agent/order for a given input genuinely can't be known in advance, and be aware it adds a manager's own planning/review LLM calls on top of the actual work.

**Q: Should I always enable allow_delegation?**
No — leave it off by default and enable it per agent only where you've identified a concrete need for that agent to ask a specialist. Broad, always-on delegation is the leading cause of runaway cost and unpredictable execution.

**Q: How is CrewAI different from AutoGen?**
CrewAI structures work as discrete tasks with defined inputs/outputs assigned to roles; AutoGen's core model is a group of agents conversing in a shared chat, better suited to genuinely open-ended back-and-forth discussion than to a known decomposition of labor. See Comparisons for the fuller breakdown.

**Q: How is CrewAI different from LangGraph?**
LangGraph gives you an explicit graph/state machine you hand-wire yourself, offering precise control over branching and state at the cost of more upfront design work; CrewAI's crew/process abstraction is higher-level and more declarative, trading some control for less boilerplate, with Flows as CrewAI's own bridge toward more explicit, deterministic control when a pure crew isn't predictable enough.

**Q: How current is this page's API detail?**
CrewAI has evolved quickly, notably with the addition of Flows and the framework's move toward being less tightly coupled to LangChain internals. This page reflects general patterns true through the author's knowledge cutoff (early-to-mid 2025) rather than any single pinned version — always check the current official docs/changelog for exact class names and constructor signatures before shipping.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What three fields define a CrewAI Agent, and what does each actually do?* Role, goal, and backstory — all three are folded into the agent's system prompt and genuinely shape behavior (tone, priorities, caution level), not just documentation for humans reading the code.
2. *What's the difference between the sequential and hierarchical processes?* Sequential runs tasks in a fixed list order, with each task's declared context threading forward prior outputs; hierarchical introduces a manager agent that dynamically plans and assigns tasks to agents rather than following a fixed order.
3. *Why does CrewAI attach tools to individual agents rather than to the whole crew?* To scope capabilities to the role that actually needs them — least privilege — so a "writer" agent isn't handed a tool meant only for an "ops" or "researcher" agent.
4. *What does the context parameter on a Task do?* It declares which prior tasks' outputs should be threaded forward as additional context for this task's prompt, enabling explicit, deliberate data flow between tasks.
5. *Why would you use output_pydantic on a task?* To validate and structure a task's output so a downstream task consuming it gets a reliable, well-shaped handoff instead of loosely-shaped free text that can be misread.

**Senior:**

6. *A crew's output quality is inconsistent from run to run despite an unchanged prompt. How do you debug it?* Inspect result.tasks_output for each task, not just the final output; check for missing context=[...] declarations; check whether expected_output is precise enough to constrain shape; verify whether delegation or a hierarchical manager is introducing nondeterministic task ordering.
7. *Design a content-generation crew for a company. How many agents, and why?* Justify each agent by a distinct role that needs distinct framing and/or distinct tool access (e.g., researcher with a search tool, writer with none, editor with a style-guide tool) — resist adding agents beyond what's justified by a concrete quality or capability gain, since each additional agent is a full added LLM round trip.
8. *When would you choose CrewAI over LangGraph for a given project, and vice versa?* CrewAI when the problem maps naturally onto a small team of specialized roles and you want less orchestration boilerplate; LangGraph when you need precise, hand-designed control flow (complex branching, loops with explicit exit conditions, fine-grained state management) that a higher-level crew/process abstraction would obscure or fight against.
9. *How do you prevent runaway cost from agent delegation in production?* Disable allow_delegation by default, enabling it only per agent with an identified need; set max_iter/max_execution_time on every agent; monitor delegation event counts as an explicit metric; wrap crew.kickoff in a wall-clock timeout.
10. *How would you test a multi-agent crew given the non-determinism of LLM outputs?* Unit test deterministic wiring (task context, tool attachment, output schema validation) without a real LLM call; integration test against a golden set at the crew/flow level using structural assertions or LLM-as-judge scoring, never exact-text assertions.
11. *A crew that started with two agents has grown to six over several months. What's the concern, and how do you address it?* Cost and latency have likely grown roughly linearly with agent/task count, often without a matching quality improvement — audit each agent's justification, look for role overlap causing redundant work, and consider whether some agents should be merged or moved to a deterministic Flow step instead.
12. *How do you decide whether a "crew of specialized agents" pattern is worth its coordination overhead for a given problem?* Compare against a single well-tooled agent baseline on a golden set for both quality and cost/latency; only adopt the crew if it produces a measurable quality improvement that justifies the multiplier in LLM calls, tokens, and added failure surface (agents talking past each other, redundant work, delegation loops).
`,

  "coding-questions": `
### 1. Build a minimal two-agent sequential crew (core skill, asked in some form constantly)

~~~python
from crewai import Agent, Task, Crew, Process, LLM

def build_research_writing_crew(model_name: str = "gpt-4o-mini"):
    """Two-agent crew: research findings, then a short article from them."""
    llm = LLM(model=model_name, temperature=0.2, timeout=30)

    researcher = Agent(
        role="Senior Research Analyst",
        goal="Find accurate, sourced facts about {topic}",
        backstory="You cite sources and flag uncertainty instead of guessing.",
        llm=llm,
        max_iter=6,
    )
    writer = Agent(
        role="Technical Writer",
        goal="Turn research into a clear, engaging short article",
        backstory="You write for a technically literate, time-pressed audience.",
        llm=llm,
        max_iter=4,
    )

    research_task = Task(
        description="Research {topic} and list 5 recent developments with sources.",
        expected_output="A bulleted list of 5 items, each with a source.",
        agent=researcher,
    )
    writing_task = Task(
        description="Write a 300-word article on {topic} using the research.",
        expected_output="A 300-word article with a headline and 3 paragraphs.",
        agent=writer,
        context=[research_task],
    )

    return Crew(
        agents=[researcher, writer],
        tasks=[research_task, writing_task],
        process=Process.sequential,
    )

# crew = build_research_writing_crew()
# try:
#     result = crew.kickoff(inputs={"topic": "small language models"})
# except Exception as exc:
#     # A crew run is not transactional — the research task may have
#     # already succeeded (and cost money) even if writing fails.
#     raise RuntimeError(f"Crew execution failed: {exc}") from exc
~~~

Complexity: end-to-end latency is roughly additive across tasks (at least one LLM call per task, more with tool calls), so this two-task crew costs and takes at minimum roughly double a single-agent call. Follow-ups: add a third "editor" agent and reason about whether it earns its added cost; add output_pydantic to research_task and show how it tightens the writer's context.

### 2. Detect delegation-loop risk from a crew's execution trace

~~~python
def count_delegation_events(verbose_trace: list[dict]) -> dict:
    """
    verbose_trace: list of log events, each like
        {"type": "delegation", "from_agent": str, "to_agent": str}
        or {"type": "task_execution", ...}
    Returns per-agent-pair delegation counts and flags any pair
    exceeding a threshold as a likely runaway loop.
    """
    from collections import Counter

    pair_counts = Counter()
    for event in verbose_trace:
        if event.get("type") == "delegation":
            pair = (event["from_agent"], event["to_agent"])
            pair_counts[pair] += 1

    flagged = {pair: n for pair, n in pair_counts.items() if n > 3}
    return {"counts": dict(pair_counts), "flagged_pairs": flagged}
~~~

Discussion points: why a threshold-based heuristic is a pragmatic first defense rather than a perfect one (legitimate iterative refinement can also produce several delegation events); how this connects to the max_iter/max_execution_time caps discussed in Best Practices; how you'd wire this into a monitoring dashboard rather than just a one-off script.

### 3. Structured handoff between tasks with output_pydantic

~~~python
from pydantic import BaseModel
from crewai import Task

class ResearchFindings(BaseModel):
    developments: list[str]
    sources: list[str]

def build_structured_research_task(researcher) -> Task:
    return Task(
        description="Research {topic} and list up to 5 recent developments, "
                     "each with a source.",
        expected_output="A ResearchFindings object with parallel "
                         "developments and sources lists.",
        agent=researcher,
        output_pydantic=ResearchFindings,
    )

def validate_findings_before_handoff(raw_output) -> ResearchFindings:
    """
    Defensive validation layer: even with output_pydantic declared,
    production code should not assume the model always complies —
    validate explicitly and raise a clear error rather than silently
    passing malformed data to the next task.
    """
    if not isinstance(raw_output, ResearchFindings):
        raise ValueError(
            f"Expected ResearchFindings, got {type(raw_output)}"
        )
    if len(raw_output.developments) != len(raw_output.sources):
        raise ValueError("developments and sources lists must be parallel")
    return raw_output
~~~

Complexity: O(1) validation overhead relative to the LLM call itself. Follow-ups: extend validate_findings_before_handoff to retry the task once with a corrective instruction on validation failure before failing the whole crew run; discuss why defensive validation matters even when output_pydantic is declared (models don't always perfectly comply with a schema).
`,

  "hands-on-labs": `
### Lab 1 — Your first two-agent crew (beginner, ~1h)
Build the research-then-write crew from Coding Question 1 over a topic of your choice. Run it three times and compare the outputs by eye. Deliverable: a short write-up of what varied between runs and why (non-determinism, and any expected_output ambiguity you can identify). Skills: Agent/Task/Crew basics, sequential process.

### Lab 2 — Single agent vs. crew, head to head (intermediate, ~2h)
Take the same task (research + write a short article) and implement it two ways: as one single well-tooled agent (see Agent Fundamentals), and as the two-agent crew from Lab 1. Compare output quality (by a documented rubric), total tokens, and latency across 10 runs each. Deliverable: a table with your findings and a written recommendation for which approach you'd ship, and why. Skills: honest cost/benefit evaluation of the crew pattern, the core question this page argues you must answer for every use case.

### Lab 3 — Tool scoping and structured handoffs (advanced, ~3h)
Extend the crew with a real tool (a web search tool) attached only to the researcher agent, and add output_pydantic to the research task. Deliberately introduce an ambiguous expected_output on a copy of the crew and demonstrate the "agents talking past each other" failure mode, then fix it with a tighter expected_output and structured output. Deliverable: a before/after comparison showing the failure and the fix. Skills: tool scoping, structured inter-task handoffs, diagnosing coordination failures.

### Lab 4 — Production-shaped crew service (production, ~4h)
Wrap a crew in a FastAPI service with an async job-queue execution path (not synchronous request/response), max_iter/max_execution_time caps on every agent, structured logging of per-task token usage, a /healthz endpoint, and a multi-stage Dockerfile. Load test and report cost and latency per request, broken down per task. Skills: the full production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-engineering roles):

1. **Content operations crew** — A researcher, writer, and SEO-editor crew that produces first-draft blog posts from a topic input, with tool-scoped web search for the researcher only, structured handoffs via output_pydantic, and a golden-set evaluation comparing crew output quality against a single-agent baseline. Demonstrates: honest cost/benefit justification for multi-agent decomposition, structured inter-task handoffs, evaluation discipline.

2. **Support-ticket triage crew composed via a Flow** — A classifier step, a knowledge-base research crew, and a response-drafting crew, composed through a CrewAI Flow with deterministic branching (e.g., route only ambiguous tickets through the research crew, resolve clear-cut ones with plain code). Demonstrates: knowing when to use a crew versus plain deterministic logic, Flows as a control layer, per-path cost measurement.

3. **Runaway-loop guardrail library** — A standalone monitoring/guardrail layer that wraps any CrewAI crew with max_iter/max_execution_time enforcement, delegation-event tracking, and automatic circuit-breaking on detected delegation loops (extending Coding Question 2), packaged so it could plug into any team's existing crew. Demonstrates: the production-hardening instincts that separate a demo crew from one a senior engineer would actually deploy.

Each project: src layout, typed Python, a small pytest suite covering deterministic wiring (task context, tool scoping) plus a golden-set regression test at the crew/flow level, CI via GitHub Actions, and a README with an architecture diagram and an explicit "why multiple agents" justification section — that justification is what separates a "multi-agent demo" from a project a senior interviewer takes seriously.
`,

  "case-studies": `
### The Flows introduction: acknowledging pure delegation's limits
CrewAI's addition of Flows, a lower-level and more deterministic event/state-driven layer, followed real-world feedback that purely declarative crew delegation (especially hierarchical process with broad allow_delegation) was too unpredictable for many production pipelines. Lesson: nearly every multi-agent framework eventually grows a more explicit control-flow layer as it matures, because autonomous delegation is expressive but hard to make reliably predictable — the same tension that motivates LangGraph's existence relative to purely conversational agent loops.

### Decoupling from LangChain
CrewAI began as a framework built on top of LangChain primitives and later moved toward a more independent core, trading some initial convenience (reusing an existing ecosystem of integrations) for tighter control over agent/task/process semantics and a lighter dependency footprint. Lesson: frameworks that start as a layer over a broader existing ecosystem often eventually decouple once their own abstractions (roles, goals, backstories, processes) need semantics the underlying framework wasn't designed to express cleanly.

### Content-team adoption and the "team of specialists" framing
CrewAI's role/goal/backstory vocabulary saw fast adoption specifically among teams automating workflows that already existed as human teams with job titles (content, recruiting, support triage) — the framework's legibility to non-engineers reviewing a pipeline ("this is the researcher, this is the writer") was a genuine adoption driver, not just a technical one. Lesson: an approachable mental model can meaningfully accelerate adoption even when the underlying capability is comparable to a lower-level alternative — but that same approachability can also encourage teams to reach for a crew reflexively, without first asking whether a single agent would do, which is exactly the discipline this page pushes back on throughout.

### The commercialization pattern (CrewAI Enterprise/AMP)
Following a pattern seen across the agent-framework space, CrewAI paired its open-source core with a hosted enterprise layer (deployment, observability, a visual builder) rather than monetizing the core library itself. Lesson: open-core commercialization around orchestration/observability tooling, rather than the core abstraction, is a recurring business model in this space, worth recognizing when evaluating build-vs-buy for production observability rather than assuming you must build it all yourself.
`,

  comparisons: `
| Dimension | CrewAI | LangGraph | AutoGen (AG2) | OpenAI Agents SDK |
|-----------|--------|-----------|----------------|--------------------|
| Core mental model | Role-based team of specialized agents with tasks and a process | Explicit graph/state machine you hand-wire | Conversational multi-agent runtime — agents talk in a shared chat | Lightweight, provider-native agent/tool-calling primitives |
| Control-flow style | Declarative (sequential/hierarchical process), with Flows for more explicit control | Explicit, hand-designed (nodes, edges, conditional branching) | Emergent, driven by conversational turns between agents | Explicit but minimal — closer to raw agent loop plus handoffs |
| Best default use case | A task that naturally decomposes into distinct specialist roles with known (or plannable) division of labor | Complex, precisely branching pipelines needing fine-grained state control | Open-ended multi-agent discussion/debate where the value is in back-and-forth reasoning | Simple, provider-native agents and handoffs without heavy orchestration abstraction |
| Learning curve | Low-to-moderate — approachable role/goal/backstory vocabulary | Moderate-to-high — requires thinking in graphs and explicit state | Moderate — requires reasoning about conversational dynamics and termination conditions | Low — minimal abstraction over direct API primitives |
| Predictability | Sequential is predictable; hierarchical/delegation trades predictability for flexibility | High — you designed the exact control flow | Lower by default — conversation-driven termination and turn-taking can be harder to bound | High for simple flows; less structure for complex multi-agent cases |
| Coordination overhead risk | Real — redundant work, agents talking past each other, and delegation loops are documented failure modes | Lower — you control exactly which node runs when | Real — conversational agents can loop or drift without a firm stopping condition | Lower — minimal abstraction means less to go wrong, but also less built-in structure for complex cases |

**How seniors choose**: reach for CrewAI when a problem genuinely maps onto a small team of specialists with roles you can name, and you want less orchestration boilerplate than a hand-built graph would require — but only after confirming (ideally with a golden-set comparison) that a single well-tooled agent doesn't already do the job. Reach for LangGraph when the pipeline has real branching complexity or state-management needs that benefit from explicit, hand-designed control flow, and predictability matters more than declarative convenience. Reach for AutoGen when the actual value is in open-ended conversation or debate between agents (e.g., a "critic" and a "solver" iterating), not a known division of labor. Reach for the OpenAI Agents SDK when you want the lightest possible abstraction over provider-native agent/tool-calling primitives, without committing to a heavier multi-agent framework's opinions. None of these is definitively superior across the board — this is a genuinely fast-evolving space, and the honest answer for most real projects is to prototype the simplest option (often a single agent) first, and add framework machinery only once a concrete, measured limitation justifies it.

See also the **Agent Fundamentals** skill for the single-agent baseline every one of these comparisons should be measured against, and the **Planning** skill for the general planning/delegation failure modes that show up across all multi-agent frameworks, not just CrewAI.
`,

  "related-technologies": `
- **Agent Fundamentals** — the single-agent reason-act-observe loop that every CrewAI agent is built from underneath; read this first, since a crew is fundamentally several of these loops composed together, not a different execution primitive.
- **Tool Calling** — how agents invoke external capabilities; CrewAI's per-agent tool scoping is a direct application of the least-privilege discipline covered there.
- **Planning** — the general discipline of task decomposition and sequencing that CrewAI's hierarchical process (and its manager agent) implements in a constrained, framework-specific form.
- **Agent Memory** — context passed between CrewAI tasks (and crew-level memory) is a lightweight form of memory; the tradeoffs of what to keep, summarize, or drop apply directly to designing task outputs.
- **LangGraph** — the more explicit, hand-wired graph/state-machine alternative for complex control flow, useful when CrewAI's higher-level process abstraction trades away more control than a project needs.
- **AutoGen** — the conversation-driven multi-agent alternative, a better fit when the value is genuinely open-ended dialogue between agents rather than a known division of labor.
- **OpenAI Agents SDK** — a lighter-weight, provider-native alternative for simpler agent and handoff patterns without adopting a full multi-agent framework's opinions.
- **AI Evals** — the general discipline of measuring whether a system (single-agent or crew) actually works, directly relevant to the golden-set comparisons this page repeatedly recommends before adopting a crew-based design.
- **Python** — the language every CrewAI crew is written in; async fluency directly improves latency for crews with independent, parallelizable sub-tasks.

On this platform, a natural learning path: **Agent Fundamentals** → **Tool Calling** → **Planning** / **Agent Memory** → **CrewAI (this page)** → **LangGraph** / **AutoGen** / **OpenAI Agents SDK** for the broader multi-agent orchestration landscape.
`,

  "latest-updates": `
Verified against the author's knowledge through roughly early-to-mid 2025 — check the official CrewAI changelog and documentation for anything newer, since this framework, like most in the agent-orchestration space, has continued to move quickly.

- **Flows have matured as the recommended layer for mixing deterministic control with agentic crew invocations**, reflecting broader ecosystem feedback that purely declarative delegation is hard to make reliably predictable in production. Verify the current recommended entry point in the docs before starting a new project that needs anything beyond a simple sequential crew.
- **Continued decoupling from LangChain internals**, giving the CrewAI team more direct control over agent/task/process semantics and reducing dependency weight — older tutorials referencing LangChain-specific integration patterns may reference outdated import paths.
- **Growth of the built-in and community tool ecosystem** (crewai_tools and community-contributed tools) for common needs like web search, file I/O, and code execution, reducing how often teams need to hand-roll custom tool integrations.
- **CrewAI Enterprise/AMP** (the hosted commercial layer: deployment, observability, a visual crew builder) has continued to expand alongside the open-source core, following a similar open-core pattern to other agent frameworks — useful to know when evaluating build-vs-buy for production observability tooling rather than building it entirely in-house.
- **General ecosystem note**: as with any framework this young and competitive (competing directly with LangGraph and AutoGen/AG2 for multi-agent mindshare), specific class names, constructor signatures, and recommended patterns should be treated as likely to have shifted since this page was written — always cross-check against current official docs before committing to an approach in a new project.
`,

  "future-roadmap": `
Where CrewAI appears to be heading, and what's worth betting career time on:

1. **Continued convergence toward hybrid declarative-plus-explicit control**, with Flows (or an equivalent) becoming the default way to compose crews into larger, more predictable pipelines rather than relying on pure hierarchical delegation for everything — mirroring a pattern visible across the whole multi-agent framework space, not just CrewAI.
2. **Maturing tool and integration ecosystems** reducing the amount of custom glue code teams need to write for common capabilities (search, file I/O, structured data access), similar to how other frameworks' plugin ecosystems have matured.
3. **Sharper built-in guardrails against known failure modes** (delegation loops, redundant work) are a plausible direction, given how consistently these show up as the leading production complaints about role-based multi-agent systems industry-wide.
4. **Ongoing competition with LangGraph and AutoGen/AG2** for multi-agent mindshare, with no framework in this space having established a clearly dominant, durable advantage as of this writing — expect continued convergence of feature sets (all three growing more explicit control-flow options, all three growing better observability) rather than one approach definitively winning.
5. **Evaluation-driven adoption becoming the norm**, not an afterthought — as multi-agent systems move from demos to production, expect tooling and community practice to converge on "prove the crew beats a single-agent baseline" as a standard step, rather than adopting multi-agent decomposition on pattern-popularity alone.

For your career: the durable, transferable skill here is not memorizing CrewAI's exact API (which will keep evolving) but understanding the underlying tradeoffs of role-based task decomposition — when specialization helps, when it adds pure coordination overhead, and how to measure the difference — since that judgment transfers directly to whatever the next popular multi-agent framework turns out to be.
`,

  "cheat-sheet": `
~~~python
# --- Core primitives ---
from crewai import Agent, Task, Crew, Process, LLM

agent = Agent(
    role="Senior Research Analyst",       # anchors perspective/vocabulary
    goal="Find accurate, sourced facts",  # explicit objective per task
    backstory="You cite sources and flag uncertainty.",  # shapes tone/priorities
    tools=[...],            # scope tools per agent (least privilege)
    allow_delegation=False, # keep off by default; enable deliberately
    max_iter=6,             # cap the agent's own reasoning/tool loop
    llm=LLM(model="gpt-4o-mini", temperature=0.2, timeout=30),
)

# --- Tasks ---
task = Task(
    description="Research {topic} and list 5 developments with sources.",
    expected_output="A bulleted list of 5 items, each with a source.",
    agent=agent,
    context=[other_task],   # explicit data flow between tasks
    output_pydantic=SomeModel,  # structured, validated handoff
)

# --- Crew: sequential (default, predictable) ---
crew = Crew(
    agents=[agent1, agent2],
    tasks=[task1, task2],
    process=Process.sequential,   # tasks run in list order
)
result = crew.kickoff(inputs={"topic": "..."})

# --- Crew: hierarchical (manager plans/assigns dynamically) ---
crew = Crew(
    agents=[agent1, agent2, agent3],
    tasks=[task1, task2, task3],
    process=Process.hierarchical,
    manager_llm=LLM(model="gpt-4o"),
)

# --- Inspecting results ---
for t in result.tasks_output:
    print(t.agent, t.raw[:80])
print(result.token_usage)

# --- Flows: deterministic control + crew invocations ---
from crewai.flow.flow import Flow, listen, start
class MyFlow(Flow):
    @start()
    def step_one(self): ...
    @listen(step_one)
    def step_two(self): ...

# --- Production guardrails ---
# - max_iter / max_execution_time on every agent
# - allow_delegation=False by default; enable per agent deliberately
# - output_pydantic on every inter-task handoff that matters
# - wall-clock timeout around crew.kickoff
# - log per-task token usage, not just crew totals
# - prefer sequential over hierarchical unless order is truly unknown
# - always compare against a single-agent baseline before shipping a crew
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What three fields define a CrewAI Agent? | role, goal, and backstory — all folded directly into the agent's system prompt, genuinely shaping behavior |
| Sequential vs hierarchical process? | Sequential runs tasks in fixed list order with declared context passed forward; hierarchical uses a manager agent to dynamically plan/assign tasks |
| Why scope tools per agent rather than globally? | Least privilege — an agent should only hold the tools its role actually requires |
| What does context=[...] on a Task do? | Declares which prior tasks' outputs should be threaded forward as context for this task's prompt |
| What does output_pydantic do? | Validates and structures a task's output so downstream tasks get a reliable, well-shaped handoff instead of ambiguous free text |
| What is allow_delegation, and what's the recommended default? | Lets an agent hand off sub-work to another agent mid-execution; recommended default is off, enabled only per agent with an identified need |
| What are Flows? | A lower-level, event/state-driven CrewAI layer for mixing deterministic Python logic with crew invocations, for more predictable composition than pure delegation |
| Biggest cause of runaway cost in CrewAI systems? | Unbounded delegation loops or hierarchical manager revision loops with no iteration/time cap set |
| "Agents talking past each other" — root cause and fix? | Usually an underspecified expected_output or missing context wiring; fix by tightening expected_output and using output_pydantic |
| CrewAI vs LangGraph, one-line? | CrewAI is a higher-level, declarative role/task/process abstraction; LangGraph is a lower-level, explicit graph/state machine you hand-wire |
| CrewAI vs AutoGen, one-line? | CrewAI structures work as discrete tasks assigned to roles; AutoGen's core model is agents conversing in a shared chat, better for open-ended dialogue |
| When should you NOT use a crew? | When a single well-tooled agent already does the job — a crew adds LLM-call multiplier cost and coordination-failure surface without a measured quality gain |
| What should you measure before shipping a crew-based design? | Quality and cost/latency against a single-agent baseline on a golden set — never assume multi-agent decomposition is better without measuring |
| Is a crew.kickoff run transactional? | No — earlier tasks may already have executed and incurred cost even if a later task fails; handle partial completion explicitly |
| What's the single biggest performance lever for a crew? | Reducing the number of agents/tasks to the minimum genuinely needed — every task is a full additional LLM round trip |
`,

  mcqs: `
**1. What is the primary purpose of an Agent's backstory field in CrewAI?**

A) Pure documentation with no effect on model behavior  B) It is folded into the agent's system prompt and genuinely shapes tone, caution level, and priorities  C) It only affects logging output  D) It configures which LLM provider the agent uses

**Answer: B** — role, goal, and backstory are all prompt-construction content, not metadata; vague text produces vague behavior just like any hand-written system prompt.

**2. Which process should be the default starting point for a new CrewAI pipeline?**

A) Hierarchical, for maximum flexibility  B) Sequential, for predictability and lower cost  C) Whichever uses the most agents  D) There is no meaningful difference between them

**Answer: B** — sequential is cheaper, more predictable, and easier to debug; hierarchical should be reserved for cases where task order genuinely can't be known upfront.

**3. Why is allow_delegation recommended to be off by default?**

A) It is deprecated and will be removed  B) Broad, always-on delegation across a crew is a leading cause of runaway cost and unpredictable execution  C) It only works with the hierarchical process  D) It disables tool calling for the agent

**Answer: B** — delegation should be enabled deliberately per agent, tied to an identified need, since unchecked delegation chains are a documented, observed failure mode.

**4. A downstream task's output is missing information an upstream task clearly produced. What is the most likely cause?**

A) The LLM provider is down  B) The downstream task is missing a context=[...] declaration for the upstream task  C) CrewAI does not support passing data between tasks  D) The crew's process must be switched to hierarchical

**Answer: B** — CrewAI only threads an upstream task's output forward as context when the downstream task explicitly declares that dependency.

**5. What is the main tradeoff of choosing a crew-based, multi-agent design over a single well-tooled agent?**

A) Crews are always strictly better with no downside  B) Crews multiply LLM calls, tokens, and latency roughly per task, and add new failure surfaces like inter-agent handoffs and delegation loops, in exchange for role-specialized framing  C) Crews eliminate the need for tools entirely  D) Crews are only usable with open-source LLMs

**Answer: B** — the decomposition should be justified by a measured quality benefit, since it comes with a real, non-trivial cost and coordination-risk multiplier.

**6. How does CrewAI's core mental model differ most from AutoGen's?**

A) CrewAI cannot use tools; AutoGen can  B) CrewAI structures work as discrete tasks with defined inputs/outputs assigned to roles; AutoGen's core model is agents conversing in a shared chat  C) They are functionally identical frameworks with different names  D) AutoGen does not support multiple agents

**Answer: B** — CrewAI is a better fit when the division of labor is knowable in advance; AutoGen is a better fit for genuinely open-ended, conversation-driven multi-agent interaction.
`,

  "revision-notes": `
**Core model in 4 lines:** A CrewAI Agent is defined by role, goal, and backstory — all three fold directly into its system prompt and genuinely shape behavior. A Task has a description, an expected_output (a real success criterion, not decoration), and an assigned agent, optionally declaring context from prior tasks. A Crew composes agents and tasks under a process. Underneath, every agent execution is the same single-agent reason-act-observe loop covered in Agent Fundamentals — a crew is a coordination layer, not a different execution primitive.

**Processes and delegation in 4 lines:** Sequential process runs tasks in a fixed order with explicit context passing — cheap, predictable, the right default. Hierarchical process adds a manager agent that dynamically plans and assigns tasks, trading predictability and cost for flexibility, and should only be chosen when task order genuinely can't be known upfront. allow_delegation lets agents hand work to each other directly; it should default to off and be enabled per agent only with an identified need, since broad delegation is the leading cause of runaway cost and unpredictable execution.

**Failure modes in 3 lines:** Agents talking past each other is usually caused by underspecified expected_output or missing context wiring — fix with tighter expected_output and output_pydantic. Redundant work happens when agent roles overlap; audit role boundaries explicitly. Runaway task loops come from unbounded delegation or hierarchical revision requests without a stopping criterion; cap with max_iter/max_execution_time.

**Production and ecosystem in 4 lines:** Scope tools per agent for least privilege; use structured (output_pydantic) handoffs between tasks; keep crews small and single-purpose, composing larger pipelines via Flows or plain code rather than one large delegation-heavy crew; treat a crew run as non-transactional and test structural/golden-set properties rather than exact text. Compared to alternatives: LangGraph offers more explicit, hand-wired control at the cost of more design work; AutoGen suits open-ended conversational multi-agent interaction better than a known division of labor; the OpenAI Agents SDK offers a lighter-weight alternative. None is definitively superior — this space moves fast, and the senior habit is always to measure a crew against a single-agent baseline before shipping the added cost and coordination surface.

**The one discipline that matters most:** never adopt a crew-of-specialized-agents pattern on pattern-popularity alone — justify it with a golden-set comparison against a single well-tooled agent, because the coordination overhead (redundant work, mis-handoffs, delegation loops, multiplied LLM cost) is real and consistently underestimated relative to the perceived benefit of "specialization."
`,

  "learning-roadmap": `
A realistic path to production-level CrewAI fluency:

**Week 1 — Foundations.** Beginner Concepts + Lab 1. Build your first sequential two-agent crew and inspect its raw, non-deterministic output across several runs. Milestone: you can explain role/goal/backstory's actual effect on behavior, not just recite the fields.

**Week 2 — The honest cost/benefit question.** Intermediate Concepts + Lab 2. Build the same task as a single agent and as a crew, and measure quality, tokens, and latency for both. Milestone: you have real numbers, not a feeling, for whether the crew was worth it on your specific task.

**Week 3 — Tools, structure, and failure modes.** Advanced Concepts + Lab 3. Attach a real tool to one agent only, add output_pydantic to a handoff, and deliberately reproduce the "agents talking past each other" failure before fixing it. Milestone: you can diagnose and fix a coordination bug from a verbose trace.

**Week 4 — Internals and Flows.** Internal Working, Architecture, Data Flow, and the Flows section of Advanced Concepts. Rebuild your crew's composition as a Flow with a deterministic branching step. Milestone: you can explain, from memory, exactly what happens between crew.kickoff and the final CrewOutput.

**Week 5 — Production.** Production Usage through Deployment sections; Lab 4. Ship a containerized crew service with async execution for long-running paths, iteration caps, structured logging, and health checks. Milestone: a working, guardrailed, evaluated crew service on your GitHub.

**Week 6 — Ecosystem and judgment.** Read the Comparisons section closely against the LangGraph and AutoGen skills. Milestone: you can justify, out loud and with evidence, when you'd choose CrewAI, a single agent, LangGraph, or AutoGen for a given new problem.

Then continue to the **LangGraph** skill for explicit graph-based control flow, or the **AutoGen** skill for conversation-driven multi-agent patterns, to round out the multi-agent orchestration landscape this page situates CrewAI within.
`,

  "official-docs": `
- [CrewAI documentation](https://docs.crewai.com/) — the primary reference for Agents, Tasks, Crews, Processes, and Flows; check this before trusting any tutorial's specific class names or constructor signatures, given how quickly the framework has evolved.
- [CrewAI GitHub repository](https://github.com/crewAIInc/crewAI) — release notes and the examples/ directory are often the most current source of truth for API usage, especially for Flows.
- [crewai-tools repository](https://github.com/crewAIInc/crewAI-tools) — the built-in and community tool integrations available to attach to agents.
- [CrewAI Enterprise/AMP documentation](https://docs.crewai.com/) (enterprise section) — the hosted platform layer (deployment, observability, visual builder), useful for evaluating build-vs-buy on production tooling.
`,

  books: `
- There is no single widely recognized, edition-stable book dedicated specifically to CrewAI as of the author's knowledge cutoff — the framework has moved fast enough that book-length treatments age quickly; the official documentation and GitHub examples are the more reliable primary source.
- **Building Multi-Agent AI Systems** style recent titles covering the general architecture of role-based and conversational multi-agent patterns are emerging; verify a specific title's publication date against how current you need the framework-specific details to be.
- **Designing Machine Learning Systems** — Chip Huyen. Not CrewAI-specific, but the strongest general treatment of the production-ML-system thinking (evaluation, monitoring, cost accounting) that transfers directly to production multi-agent systems.
- For the underlying single-agent concepts CrewAI composes, see the **books** listed on the **Agent Fundamentals** and **Planning** skill pages — those foundations age much more slowly than any specific framework's API.
`,

  blogs: `
- **CrewAI official blog** (crewai.com/blog) — the most reliable source for framework-specific patterns, maintained by the team itself and tracking the current API, including Flows.
- **João Moura's public talks/writing** — the creator's own explanations of design decisions (why role/goal/backstory, why Flows) carry the most authoritative "why," not just "how."
- **LangChain and LangGraph's own blogs** — worth reading specifically for contrast, since they articulate a philosophically different (more explicit, graph-first) approach to the same underlying problem CrewAI solves declaratively.
- **Microsoft's AutoGen/AG2 blog** — useful for contrast on the conversation-driven multi-agent philosophy, directly relevant to the Comparisons section on this page.
- General AI-engineering newsletters/blogs (see the **Agent Fundamentals** and **Planning** skill pages' blog lists) frequently cover multi-agent coordination patterns and failure modes even when not naming CrewAI explicitly.
`,

  "research-papers": `
Direct academic literature specifically on CrewAI as a system is thin — it is an engineering framework, not itself the subject of peer-reviewed research. The closest and most valuable foundational reading is the papers underlying the multi-agent and planning techniques CrewAI's abstractions implement in practice:

- **"Generative Agents: Interactive Simulacra of Human Behavior"** (Park et al., 2023) — early, influential work on giving LLM agents persistent identity/role framing and observing emergent multi-agent social behavior, conceptually adjacent to CrewAI's role/backstory design.
- **"AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation"** (Wu et al., 2023) — the foundational paper for the conversation-driven multi-agent alternative discussed throughout the Comparisons section; essential contrast reading.
- **"ReAct: Synergizing Reasoning and Acting in Language Models"** (Yao et al., 2022) — the foundational reasoning-acting loop underlying every individual CrewAI agent's own execution, covered in depth in the Agent Fundamentals skill.
- **"Communicative Agents for Software Development"** (the CAMEL / role-playing multi-agent line of work, Li et al., 2023) — closely related to CrewAI's role-based framing, exploring role-assigned agents collaborating on a shared task.
- For task decomposition and planning theory more broadly, see the foundational reading list on the **Planning** skill page rather than CrewAI-specific sources, since the underlying decomposition/coordination theory predates and is broader than any one framework's implementation.
`,

  videos: `
- **João Moura's CrewAI conference talks** (various AI Engineer Summit and similar conference appearances) — the creator explaining design rationale directly, including why Flows were introduced.
- **CrewAI's own YouTube channel and documentation walkthroughs** — official coverage of new features that tracks the current API more reliably than older third-party tutorials.
- **Comparative multi-agent framework talks** from AI Engineer Summit and similar conferences, where CrewAI, LangGraph, and AutoGen are discussed side by side — directly useful for internalizing the Comparisons section's tradeoffs from multiple practitioners' perspectives.
- **DeepLearning.AI's multi-agent short courses** (various, covering CrewAI and adjacent frameworks) — structured walkthroughs of role-based agent design and common pitfalls.
- Caution: given the framework's fast pace of change (notably the Flows introduction and the LangChain decoupling), prefer videos dated within the last year or so, and verify specific code shown still matches current imports/class names before copying it.
`,

  "github-repos": `
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — the main repository; the examples/ and docs/examples directories are often the most current source of truth for Agent/Task/Crew/Flow usage.
- [crewAIInc/crewAI-tools](https://github.com/crewAIInc/crewAI-tools) — the built-in and community tool integrations available to attach to agents, and a good reference for writing your own custom tool.
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — worth browsing specifically to contrast its explicit graph/state-machine approach with CrewAI's higher-level process abstraction, for the Comparisons section.
- [microsoft/autogen](https://github.com/microsoft/autogen) (and the community-maintained AG2 fork) — the conversation-driven multi-agent alternative, useful to read side by side with CrewAI's task-based model.
- [openai/openai-agents-python](https://github.com/openai/openai-agents-python) — the OpenAI Agents SDK, useful as a lightweight-abstraction contrast point.
- [joaomdmoura/crewAI-examples](https://github.com/crewAIInc/crewAI-examples) (or successor examples repository under crewAIInc) — a collection of worked example crews across different use cases, useful for seeing varied, opinionated reference designs.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Role/goal/backstory fluency*: write three different backstories for the same role (cautious/meticulous, fast/pragmatic, creative/exploratory) and compare how each measurably changes an agent's output on the same task.
2. *Task specification fluency*: take a vague expected_output ("write a good summary") and rewrite it three times with increasing precision, observing how output consistency improves across repeated runs.
3. *Process choice*: implement the same three-task pipeline once with sequential process and once with hierarchical process; compare latency, cost, and output quality, and articulate which you'd ship and why.
4. *Tool scoping*: build a crew where one agent is deliberately given a tool it doesn't need, and demonstrate (via a crafted input) how that over-provisioning creates a risk a properly scoped crew wouldn't have.
5. *Structured handoffs*: reproduce the "agents talking past each other" failure with a free-text handoff, then fix it with output_pydantic, and quantify the improvement using a small golden set.
6. *Delegation discipline*: build a crew with allow_delegation=True on every agent and observe (via verbose logging) how often delegation actually fires versus a version with delegation enabled only on one agent with an identified need.
7. *Single-agent baseline*: for any of the above crews, build the single-agent equivalent and run both against a 15-20 item golden set, reporting quality, token cost, and latency for each — this is the exercise this page argues you should run before shipping any crew-based design in practice.
8. *Runaway-loop guardrails*: implement max_iter/max_execution_time enforcement and delegation-event monitoring (extending Coding Question 2) around a crew, and demonstrate it catching a deliberately induced delegation loop.

External sets: multi-agent benchmark tasks from agent-evaluation frameworks (e.g., collaborative task-completion benchmarks used in the broader agent-research literature); any dataset with a golden-answer set (question-answering, summarization) repurposed as a quality baseline for comparing single-agent versus crew-based approaches.
`,

  "architecture-diagram": `
The reference production architecture for a CrewAI-based service — the shape most real deployments converge on once they move past a single, monolithic delegation-heavy crew:

~~~mermaid
flowchart TB
    Client["Client app"] --> LB["Load balancer"]
    LB --> API["API layer (sync for short crews,\nasync job queue for long/hierarchical ones)"]

    subgraph FlowLayer["Flow (deterministic control)"]
        Branch{"Deterministic\nrouting logic"}
    end
    API --> Branch

    subgraph ResearchCrew["Research crew (small, focused)"]
        RA["Researcher agent\n+ search tool"] --> RTask["Research task"]
    end
    subgraph WritingCrew["Writing crew (small, focused)"]
        WA["Writer agent"] --> WTask["Writing task\ncontext=[research output]"]
        EA["Editor agent"] --> ETask["Editing task\ncontext=[writing output]"]
    end

    Branch -->|needs research| ResearchCrew
    Branch -->|skip research| WritingCrew
    ResearchCrew --> WritingCrew
    WritingCrew --> API
    API --> Client

    subgraph Obs["Observability"]
        Logs["Structured logs\n(per-task tokens, agent, latency)"]
        Metrics["Delegation events, task count,\ncost per request"]
        EvalJob["Golden-set eval job\n(crew vs single-agent baseline)"]
    end
    ResearchCrew -.-> Obs
    WritingCrew -.-> Obs
~~~

Every box maps to a section on this page: the Flow/routing layer to Advanced Concepts, the small focused crews to Architecture and Best Practices, the API layer's sync/async split to Deployment, and the Observability subgraph to Monitoring and Testing.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((CrewAI))
    Core primitives
      Agent (role/goal/backstory)
      Task (description/expected_output)
      Crew
      Process
        Sequential
        Hierarchical
      Flows
    Coordination
      Tool scoping per agent
      context between tasks
      output_pydantic handoffs
      Delegation (allow_delegation)
      Manager agent (hierarchical)
      Crew-level memory
    Failure modes
      Agents talking past each other
      Redundant work / role overlap
      Runaway delegation loops
      Non-transactional partial failure
    Internals
      Prompt assembly per task
      Reason-act-observe loop per agent
      CrewOutput and usage metrics
    Production
      Timeouts and max_iter caps
      Async execution for long crews
      Per-task cost/latency tracking
      Security: tool scoping, injection propagation
      Testing: structural + golden-set, never exact text
    Ecosystem
      Agent Fundamentals
      Tool Calling
      Planning
      Agent Memory
      LangGraph (explicit graph control)
      AutoGen (conversation-driven)
      OpenAI Agents SDK (lightweight alternative)
    Judgment
      Single agent vs crew tradeoff
      Measure before adopting multi-agent
      Coordination overhead is real cost
~~~
`,
};

export default crewai;
