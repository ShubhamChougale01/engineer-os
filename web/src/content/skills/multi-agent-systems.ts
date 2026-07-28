import type { SkillContent } from "../types";

/**
 * Multi-Agent Systems — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const multiAgentSystems: SkillContent = {
  overview: `
Multi-agent systems (MAS) are the discipline of getting more than one LLM-driven agent to work on a problem together — deciding who does what, how they hand off work, how they resolve disagreement, and how the whole ensemble stays observable and boundable when any single agent can go off the rails. This page is not about any one framework's API; **LangGraph**, **CrewAI**, and **AutoGen** each give you a concrete way to build a multi-agent system, but this page is about the cross-cutting patterns that show up no matter which framework you pick: orchestrator-worker decomposition, hierarchical delegation, peer-to-peer debate, blackboard-style shared state, message-passing protocols, consensus and voting, and the very real failure modes (deadlock, livelock, runaway cost) that only appear once you have more than one autonomous loop running.

For an AI engineer, multi-agent systems matter because single-agent systems hit a ceiling: one agent with one context window and one set of instructions blurs distinct responsibilities together (research versus writing versus fact-checking), can't parallelize independent sub-problems, and can't specialize its tool access per role. Splitting a task across agents fixes those problems — at the cost of coordination overhead, more LLM calls, and new failure surfaces (agents talking past each other, redundant work, unbounded delegation loops) that don't exist in a single-agent system. Multi-agent design is fundamentally an economics-and-reliability tradeoff, not a strictly-better upgrade: you're trading a known, bounded single-agent cost for a potentially much larger, less predictable one, in exchange for role clarity and, sometimes, genuinely better output quality.

Key characteristics: a **topology** (orchestrator-worker/hub-and-spoke, hierarchical, peer-to-peer/debate, or blackboard/shared-memory) that defines who can talk to whom; a **communication protocol** (structured messages, a shared state object, or a standardized wire format like **A2A Protocol**) that defines what "talking" looks like; explicit or implicit **coordination logic** (a plan, a manager, a voting rule, or emergent negotiation) that decides what happens next; and an **evaluation** story that is meaningfully harder than single-agent eval because you must judge both individual agent quality and the emergent quality of the whole system's collaboration. This page assumes you already understand a single agent's reason-act-observe loop (see **Agent Fundamentals**) and builds the vocabulary for reasoning about many such loops interacting.
`,

  history: `
Multi-agent systems as a research area predate LLMs by decades — distributed AI and multi-agent planning were active subfields of AI research through the 1980s and 1990s, studying how independent, goal-directed software agents could coordinate, negotiate, and reach consensus without central control. LLM-based multi-agent systems are a recent, much narrower re-application of that older body of theory to a new kind of agent: one whose "reasoning" is an LLM call rather than a hand-coded planner.

| Year | Milestone |
|------|-----------|
| 1980s–1990s | Distributed AI / classical multi-agent systems research: contract-net protocols, blackboard architectures, negotiation and auction-based coordination — largely symbolic AI, not LLM-based |
| 2022–2023 | Early autonomous-loop experiments (AutoGPT, BabyAGI) show a single LLM agent looping on its own plan; not multi-agent, but they popularize the idea of LLM-driven autonomy that multi-agent systems build on |
| 2023 | Microsoft releases **AutoGen**, one of the first mainstream frameworks explicitly built around multiple LLM agents conversing in a shared chat to solve a task together |
| Late 2023 | **CrewAI** releases, popularizing a role-based ("researcher," "writer," "editor") mental model for LLM multi-agent teams, distinct from AutoGen's conversational framing |
| 2024 | **LangGraph** matures as a graph/state-machine substrate general enough to express arbitrary multi-agent topologies (orchestrator-worker, hierarchical, cyclic debate) with explicit control flow rather than implicit conversation or role delegation |
| 2024 | Anthropic and others publish practitioner guidance distinguishing "workflows" (predefined code paths, including deterministic multi-step pipelines) from "agents" (models that dynamically direct their own process) — a framing that reshaped how the industry talks about when multi-agent complexity is actually earning its cost |
| Apr 2025 | Google announces the **Agent2Agent (A2A) protocol**, giving multi-agent systems a standardized wire format for agents built on different frameworks or by different organizations to discover and delegate to each other, rather than every team inventing its own inter-agent message format |
| 2025–2026 | Continued convergence toward hybrid designs: mostly deterministic orchestration with a small number of genuinely autonomous sub-agents at the points where flexibility actually earns its keep, and growing tooling for multi-agent-specific observability and evaluation — I'd verify current benchmark numbers and the latest framework feature sets directly, since this remains a fast-moving area and I'm not confident quoting specific current statistics as settled fact |

The throughline worth noticing: the field keeps rediscovering, in an LLM-specific form, lessons the classical distributed-AI literature already learned — pure autonomous delegation is expressive but unpredictable, so practical systems converge on more deterministic, boundable control structures over time.
`,

  "why-it-exists": `
Before multi-agent patterns were named and studied as a discipline, teams building on top of single LLM agents ran into the same wall repeatedly:

- **Role conflation degrades quality.** One agent asked to research, write, and fact-check in a single pass applies the same instructions and the same context to fundamentally different jobs; each phase gets a worse, less-specialized treatment than it would with its own framing.
- **No natural parallelism.** A single agent processes its plan largely serially; independent sub-problems (research three unrelated topics, then synthesize) can't be split across concurrent LLM calls without an explicit mechanism for fanning work out and collecting it back.
- **Tool access becomes all-or-nothing.** A single agent with every tool the whole system might need is both a design smell and a security liability — there's no natural boundary for "this part of the job should only ever call the search tool, never the payment tool."
- **No vocabulary for how autonomous sub-parts should disagree, vote, or escalate.** Real organizational work often benefits from multiple perspectives (a debate between an advocate and a critic, a proposer and a reviewer) that a single agent's single pass cannot genuinely reproduce — self-critique inside one context is a weaker approximation of adversarial review than two independently-framed agents actually disagreeing.

Multi-agent systems exist to give these recurring shapes — decompose-and-delegate, specialize-and-parallelize, propose-and-critique, coordinate-through-shared-state — a named vocabulary and a set of concrete design patterns, borrowed in large part from the older distributed-AI literature and reapplied to LLM agents. The goal is not "more agents is better" — it's "name the shape your problem actually has, and use the coordination pattern that matches it," rather than reinventing ad hoc orchestration code for every new multi-step LLM system.
`,

  "problem-it-solves": `
Concretely, multi-agent system design removes or manages these pains:

- **Ad hoc orchestration code reinvented per project.** Instead of hand-rolling "call agent A, pass its output to agent B, retry if C fails" logic from scratch every time, named topologies (orchestrator-worker, hierarchical, blackboard) give you a starting design with known tradeoffs, rather than a blank page.
- **No framework for reasoning about coordination failure.** Concepts like deadlock (two agents each waiting on the other), livelock (agents endlessly revising without converging), and runaway delegation loops are well-studied failure classes in distributed systems generally; naming them for agent loops lets you design explicit guards (timeouts, iteration caps, escalation rules) instead of discovering them for the first time in production.
- **Unclear evaluation story for collaborative output.** A framework for thinking about "does the orchestrator's decomposition make sense," "does each worker's output meet its own local bar," and "does the assembled final result meet the user's actual bar" — three genuinely different questions a single-agent eval story doesn't need to ask.
- **Unbounded cost and latency from fan-out.** Every additional agent in a pipeline is, at minimum, another full LLM round trip; multi-agent design forces you to make that cost explicit and to ask whether the quality gain justifies the multiplier, rather than discovering a 5x cost increase after shipping.

What multi-agent system design deliberately does **not** solve:

- It does not make any individual agent smarter — a crew of five mediocre agents does not reliably outperform one well-tooled, well-prompted agent, and the burden of proof is on the multi-agent design to show it earns its overhead (see Anti-Patterns).
- It does not eliminate the need for a specific framework or protocol to implement any given topology — **LangGraph**, CrewAI, and AutoGen are three different, opinionated answers to "how do I actually build this," each better suited to some topologies than others (see Comparisons).
- It does not solve inter-organization agent communication by itself — that's the specific job of a standardized wire protocol like **A2A Protocol**, layered on top of whatever internal topology each participating agent uses.
- It does not remove the need for human oversight on consequential actions — see **Human-in-the-Loop AI** for where and how approval gates fit into a multi-agent pipeline.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Name and distinguish the core multi-agent topologies — orchestrator-worker, hierarchical, peer-to-peer/debate, and blackboard/shared-memory — and pick the right one for a given problem shape.
2. Design a message-passing protocol between agents (or evaluate a standardized one like **A2A Protocol**) with an explicit schema, not ad hoc free text.
3. Implement a working orchestrator-worker pipeline that fans a task out to independent workers and aggregates their results, with per-worker timeouts and error handling.
4. Identify and prevent the classic multi-agent coordination failures: deadlock, livelock, redundant work, and unbounded delegation loops.
5. Reason quantitatively about the cost and latency multiplier of fan-out, and decide when it is and isn't worth paying.
6. Design a consensus or voting mechanism (majority vote, weighted vote, judge-based arbitration) for a multi-agent system that needs to reconcile disagreeing outputs.
7. Evaluate a multi-agent system at both the per-agent and whole-system level, distinguishing a locally-correct-but-globally-wrong composition from a genuinely working pipeline.
8. Explain how multi-agent systems relate to and differ from **A2A Protocol**, **MCP**, **CrewAI**, **AutoGen**, and **LangGraph**, and when to reach for each.
9. Instrument a multi-agent system with cross-agent tracing so a failure can be attributed to the specific agent and hop responsible, connecting to the **Agent Observability** skill.
10. Design human checkpoints into a multi-agent pipeline at the points where autonomous delegation is riskiest, connecting to the **Human-in-the-Loop AI** skill.
`,

  prerequisites: `
- **Required**: a solid understanding of a single LLM agent's reason-act-observe loop, tool calling, and planning — see **Agent Fundamentals**, **Tool Calling**, and **Planning** before this page. Multi-agent systems compose many single-agent loops; if the single loop isn't solid, the composition will be much harder to reason about.
- **Required**: comfort with asynchronous programming (see the **Python** skill's concurrency section) since fanning work out to multiple agents concurrently, with timeouts and error handling, is a recurring implementation need.
- **Strongly recommended**: at least a skim of **LangGraph**, **CrewAI**, and **AutoGen** — this page's Comparisons and Related Technologies sections assume you have a rough sense of what each framework's API looks like, even if you haven't built with all three.
- **Strongly recommended**: **Agent Memory**, since context passed between agents (whether via a shared blackboard, message passing, or task handoff) is a form of memory design, and the same tradeoffs (what to keep, what to summarize, what to drop) apply directly to inter-agent handoffs.
- **Helpful**: **A2A Protocol** and **MCP** — this page draws a sharp line between "how one agent reaches its own tools" (MCP's job) and "how one agent reaches another agent" (A2A's job, or a bespoke internal equivalent), and having both underlying concepts fresh makes that distinction land faster.

Dependency chain: **Agent Fundamentals** → **Tool Calling** → **Planning** / **Agent Memory** → this page → **A2A Protocol** / **LangGraph** / **CrewAI** / **AutoGen** for implementation, and **Agent Observability** / **Human-in-the-Loop AI** for running one safely in production.
`,

  "beginner-concepts": `
### Why more than one agent?

Imagine you want to write a short research article. One agent could plan the research, do the research, write the article, and edit it — all in one context. Or, you could split the job: a **researcher agent** that only searches and gathers facts, and a **writer agent** that only turns findings into prose. Splitting the job is a multi-agent system in its simplest form: two agents, each with a narrower job, doing one full pass each.

~~~python
# Conceptual sketch — a two-agent pipeline (framework-agnostic pseudocode)
def researcher(topic: str) -> str:
    """Runs its own LLM call + search tool loop; returns findings as text."""
    findings = call_llm(
        system="You are a meticulous researcher. Cite sources.",
        user=f"Find 5 recent developments in {topic}.",
        tools=[search_tool],
    )
    return findings

def writer(topic: str, findings: str) -> str:
    """Turns findings into a short article; has no tools of its own."""
    article = call_llm(
        system="You are a technical writer for a busy audience.",
        user=f"Write a 300-word article on {topic} using these findings:\\n{findings}",
    )
    return article

def run_pipeline(topic: str) -> str:
    findings = researcher(topic)
    return writer(topic, findings)
~~~

This is the **orchestrator-worker** shape at its most minimal: a piece of code (here, run_pipeline) calls agent A, takes its output, and hands it to agent B. Neither agent needs to know the other exists — the orchestration lives outside both of them.

### The core vocabulary

- **Topology**: the shape of who can talk to whom. Two agents in a fixed sequence is a simple chain; a manager delegating to many workers is a star; agents debating each other is a fully-connected pair or small group.
- **Message**: whatever one agent hands another — text, structured data, or a reference to a shared object.
- **Coordination**: the logic that decides what happens next — here, it's just "run researcher, then run writer," but it can be a manager agent deciding dynamically, or a voting rule reconciling disagreement.
- **Aggregation**: combining multiple agents' outputs into one result — trivial in a two-step chain (just pass it forward), much more interesting when three independent workers each produce a partial answer that must be merged.

### A minimal fan-out example

~~~python
import asyncio

async def research_subtopic(subtopic: str) -> str:
    """One independent worker researching one slice of the problem."""
    return await call_llm_async(
        system="You are a researcher. Be concise and cite sources.",
        user=f"Summarize the current state of {subtopic} in 3 bullet points.",
    )

async def fan_out_research(subtopics: list[str]) -> list[str]:
    # Run all workers concurrently -- they are independent, so there's
    # no reason to wait for one before starting the next.
    return await asyncio.gather(*(research_subtopic(s) for s in subtopics))

async def main():
    results = await fan_out_research(["small language models", "agent evals", "RAG"])
    combined = "\\n\\n".join(results)
    print(combined)

asyncio.run(main())
~~~

This is the beginning of **orchestrator-worker with fan-out**: independent workers run concurrently, and a final step (here, just string concatenation) combines their results. The key beginner lesson: multi-agent design is mostly about deciding, in plain language first, what the shape of the collaboration actually is — chain, fan-out, hierarchy, or debate — before reaching for any framework's API.
`,

  "intermediate-concepts": `
### The four core topologies

~~~mermaid
flowchart TB
    subgraph OW["Orchestrator-Worker"]
        O1["Orchestrator"] --> W1["Worker A"]
        O1 --> W2["Worker B"]
        O1 --> W3["Worker C"]
    end
    subgraph H["Hierarchical"]
        M["Manager"] --> S1["Sub-manager"]
        S1 --> A1["Agent"]
        S1 --> A2["Agent"]
    end
    subgraph P2P["Peer-to-Peer / Debate"]
        X["Agent A"] <--> Y["Agent B"]
    end
    subgraph BB["Blackboard"]
        Bd[("Shared blackboard")]
        A3["Agent 1"] --> Bd
        A4["Agent 2"] --> Bd
        Bd --> A5["Agent 3 reads"]
    end
~~~

- **Orchestrator-worker (hub-and-spoke)**: one coordinating process or agent delegates independent sub-tasks to workers and aggregates their results. Predictable, easy to parallelize, easy to reason about — the default choice when task decomposition is known upfront. This is the shape CrewAI's sequential process and most LangGraph "supervisor" patterns implement.
- **Hierarchical**: a multi-level orchestrator-worker where a top manager delegates to sub-managers, who delegate further down. Useful when a problem naturally decomposes into nested sub-problems (a program manager delegating to team leads who delegate to individual contributors), at the cost of more indirection and harder end-to-end tracing.
- **Peer-to-peer / debate**: two or more agents address each other directly rather than through a central coordinator, often iterating (propose → critique → revise) until a stopping condition. Useful when the value is in genuine disagreement or adversarial review (a proposer and a critic catch different classes of error than either alone), but needs an explicit termination condition or it becomes livelock (see Advanced Concepts).
- **Blackboard / shared-memory**: agents don't message each other directly; they read and write to a shared data structure (the "blackboard"), and coordination emerges from what's currently posted there. Useful when the set of contributing agents isn't known upfront, or when many agents each contribute partial, asynchronous updates toward a shared goal — the classical distributed-AI blackboard architecture, adapted to LLM agents.

### Message passing with a defined schema

~~~python
from pydantic import BaseModel
from enum import Enum

class MessageRole(str, Enum):
    ORCHESTRATOR = "orchestrator"
    WORKER = "worker"

class AgentMessage(BaseModel):
    """A structured inter-agent message -- never pass raw, unvalidated
    free text between agents when the receiver needs specific fields."""
    sender: str
    role: MessageRole
    task_id: str
    content: str
    structured_payload: dict | None = None   # machine-actionable data, if any

def dispatch_to_worker(worker_fn, message: AgentMessage) -> AgentMessage:
    result_text = worker_fn(message.content)
    return AgentMessage(
        sender=message.task_id + "-worker",
        role=MessageRole.WORKER,
        task_id=message.task_id,
        content=result_text,
    )
~~~

Defining an explicit message schema (rather than passing raw strings everywhere) is the single highest-leverage practice for avoiding "agents talking past each other" — see the **Structured Outputs** skill for the general discipline this borrows from.

### A hierarchical delegation example

~~~python
async def manager(task: str, workers: dict[str, callable]) -> str:
    """A manager agent decides which worker(s) should handle a task,
    then delegates and synthesizes their responses."""
    plan = await call_llm_async(
        system="You are a manager. Given a task and a list of available "
               "specialist workers, decide which ones to delegate to.",
        user=f"Task: {task}\\nAvailable workers: {list(workers.keys())}",
    )
    chosen = parse_worker_choices(plan)   # structured-output parse, not string matching
    results = await asyncio.gather(*(workers[w](task) for w in chosen))
    return await call_llm_async(
        system="Synthesize these specialist responses into one final answer.",
        user="\\n\\n".join(results),
    )
~~~

### Voting and consensus

When multiple agents produce independent answers to the same question, a simple ensemble strategy is majority vote or a judge model that picks the best:

~~~python
from collections import Counter

async def vote_on_answer(question: str, num_agents: int = 3) -> str:
    answers = await asyncio.gather(*(
        call_llm_async(system="Answer concisely.", user=question)
        for _ in range(num_agents)
    ))
    # For open-ended text, exact-match voting rarely works -- normalize
    # or use an LLM judge to cluster semantically equivalent answers
    # before counting (see Advanced Concepts).
    counts = Counter(normalize(a) for a in answers)
    return counts.most_common(1)[0][0]
~~~

This "sample N times, vote" pattern (closely related to self-consistency prompting) trades cost (N calls instead of 1) for reduced variance — worth it when a single sample is noisy and the answer space is small/structured enough for votes to meaningfully cluster.
`,

  "advanced-concepts": `
### Deadlock and livelock in agent loops

**Deadlock**: two or more agents each wait on a result only the other can produce, and neither proceeds. In LLM multi-agent systems this most often shows up as a circular delegation — agent A delegates a sub-question to agent B "because B is the specialist," and B's prompt is built to delegate ambiguous cases back to A "because A owns the overall task" — producing an infinite back-and-forth with no agent ever completing its step. The fix is structural: delegation edges in your topology should form a DAG (directed acyclic graph), not a cycle, or if a cycle is intentional (debate), it must have an explicit, checkable termination condition (see below).

**Livelock**: agents are actively working — not stuck — but never converge to a final answer. The classic case is a proposer/critic debate where the critic always finds something to improve and the proposer always revises, with no stopping rule beyond "keep going." Unlike deadlock, livelock burns real tokens and wall-clock time while producing the illusion of progress.

~~~python
async def debate_until_convergence(
    question: str, max_rounds: int = 4
) -> str:
    proposal = await propose(question)
    for round_num in range(max_rounds):
        critique = await critique_fn(proposal)
        if is_approved(critique):          # explicit, checkable stop condition
            return proposal
        proposal = await revise(proposal, critique)
    # Hit the round cap without convergence -- fail loudly, don't loop forever.
    return proposal  # caller should log that max_rounds was exhausted
~~~

The senior instinct: every cyclic (debate-style) interaction needs BOTH a positive stopping condition (an explicit "approved"/"good enough" signal, ideally from a structured output rather than fuzzy text matching) AND a hard round/time cap as a backstop, because the positive condition can itself fail to fire due to model inconsistency.

### The cost and latency multiplier of fan-out

Every additional agent in a pipeline is, at minimum, one more full LLM round trip. A three-agent sequential pipeline is roughly the sum of three single-agent latencies, not one; a hierarchical crew where a manager also makes its own planning/review calls pays that overhead on top of the workers' calls. Fan-out to N independent workers doesn't add to latency if run concurrently (bounded by the slowest worker), but does multiply cost roughly N-fold and multiplies your exposure to per-provider rate limits N-fold too. The senior question for every additional agent in a design is: does the marginal quality gain from this specialization justify its marginal cost and latency — measured, not assumed.

### Evaluating a multi-agent system

Evaluation has to happen at (at least) three levels, and conflating them hides real bugs:

1. **Per-agent correctness**: did this specific agent do its own narrow job well, given the input it received? (Ordinary single-agent eval, applied per role.)
2. **Handoff correctness**: did the message/context passed between agents actually carry what the receiver needed? A perfectly correct researcher and a perfectly correct writer can still produce a bad article if the handoff dropped a key fact.
3. **Whole-system correctness**: does the final, assembled output meet the user's actual bar? A system can score well on 1 and 2 and still fail here if the composition itself — the topology, the aggregation logic — is wrong for the problem.

See the **AI Evals** skill for the general evaluation discipline; the multi-agent-specific addition is that a golden-set evaluation must run at the whole-pipeline level, not only per-agent, because per-agent scores can be individually high while the composed result is still wrong.

### Blackboard systems in more depth

A blackboard system decouples agents entirely from each other — each agent only reads and writes a shared data structure, deciding independently (or via a simple scheduler) when it has something useful to contribute:

~~~python
class Blackboard:
    """A shared, append-only(ish) structure multiple agents read/write."""
    def __init__(self):
        self.facts: dict[str, str] = {}
        self.open_questions: set[str] = set()

    def post(self, key: str, value: str) -> None:
        self.facts[key] = value
        self.open_questions.discard(key)

    def needs(self, key: str) -> None:
        if key not in self.facts:
            self.open_questions.add(key)

async def contributor_agent(name: str, board: Blackboard, capability: str):
    """Repeatedly checks the board for open questions it can answer."""
    while board.open_questions:
        for question in list(board.open_questions):
            if capability in question:
                answer = await call_llm_async(system=f"You are a {capability} specialist.", user=question)
                board.post(question, answer)
~~~

Blackboard designs shine when you don't know upfront which agents will be relevant or how many rounds of partial contribution are needed, but they are genuinely harder to make deterministic and debuggable than orchestrator-worker — every agent's read/write ordering is a potential race, and "why did the system produce this answer" requires reconstructing the whole history of board writes, not a single linear trace.

### Decision table: choosing a topology

| Situation | Recommended topology |
|---|---|
| Task decomposition is known upfront, sub-tasks are independent | Orchestrator-worker with concurrent fan-out |
| Sub-problems nest naturally (a program → projects → tasks) | Hierarchical |
| The value is in genuine disagreement or adversarial review | Peer-to-peer / debate, with an explicit stop condition |
| Contributing agents/order aren't known upfront; partial, asynchronous contributions | Blackboard |
| Task order is genuinely input-dependent and can't be predicted | A manager/hierarchical process, tightly scoped |
| You're not sure any of the above earns its cost over one well-tooled agent | Prototype the single-agent version first; add agents only once you've measured a real gap |
`,

  "internal-working": `
Here is what actually happens, step by step, inside a typical orchestrator-worker run with fan-out and aggregation:

~~~mermaid
flowchart TD
    A["Orchestrator receives task"] --> B["Decompose task into\nindependent sub-tasks"]
    B --> C{"Dispatch to workers\n(concurrently)"}
    C --> W1["Worker 1: own reason-act-observe loop\n(own tools, own context)"]
    C --> W2["Worker 2: own reason-act-observe loop"]
    C --> W3["Worker 3: own reason-act-observe loop"]
    W1 --> R1["Worker 1 result"]
    W2 --> R2["Worker 2 result"]
    W3 --> R3["Worker 3 result"]
    R1 & R2 & R3 --> D["Aggregation step:\nsynthesize / vote / merge"]
    D --> E{"Aggregated result\nsatisfies task?"}
    E -- "no" --> B
    E -- "yes" --> F["Return final result"]
~~~

1. **Decomposition.** The orchestrator (a manager LLM call, or deterministic code) breaks the incoming task into sub-tasks that can, ideally, be handled independently. This is itself a planning problem — see the **Planning** skill — and a bad decomposition (sub-tasks that overlap, or that omit something the aggregation step needs) is the single most common root cause of a multi-agent system's whole-system failures, even when every worker performs well individually.
2. **Dispatch.** Each sub-task is sent to the worker (or workers) responsible for it. If sub-tasks are truly independent, dispatch them concurrently (asyncio.gather or equivalent) rather than serially — this is the lever that keeps fan-out latency bounded by the slowest worker rather than the sum of all workers.
3. **Worker execution.** Each worker runs its own, fully independent reason-act-observe loop, with its own system prompt, its own tools (scoped to what its role needs), and no visibility into any other worker's internal reasoning — the same "opaque box" property that governs cross-organization agent communication over **A2A Protocol** also applies internally between workers in a well-designed system, even when everything runs in one process.
4. **Result collection and aggregation.** Once all dispatched workers return (or time out), the orchestrator combines their outputs — by simple concatenation, a synthesis LLM call, a vote, or a judge model picking the best candidate.
5. **Convergence check (if iterative).** Some pipelines loop back to decomposition or dispatch if the aggregated result doesn't yet satisfy the task (a debate round, a manager requesting revision) — this loop is exactly where deadlock/livelock risk lives, and needs the explicit stop conditions covered in Advanced Concepts.
6. **Return.** The final, assembled result (plus, in a well-instrumented system, a full per-agent, per-hop trace for later debugging — see **Agent Observability**) is returned to the caller.

The core internal mechanism worth remembering: nothing about a multi-agent system is a different execution primitive per agent — each agent is still just an LLM call (or a loop of them); the entire value-add of multi-agent design lives in the decomposition, dispatch, and aggregation logic wrapped around those calls.
`,

  architecture: `
A senior engineer thinks about multi-agent systems at two levels: the runtime topology (how agents actually connect and pass data at execution time) and the application architecture (how to structure the codebase so topology, agent logic, and orchestration don't become an unmaintainable tangle).

### Runtime topology (orchestrator-worker, the most common production shape)

~~~mermaid
flowchart TB
    subgraph Orchestration["Orchestration layer"]
        Planner["Decomposition / planning logic"]
        Dispatcher["Concurrent dispatcher\n(timeouts, retries per worker)"]
        Aggregator["Aggregation / voting / synthesis"]
    end
    subgraph Workers["Worker agents (independent)"]
        WA["Worker A\n(own tools, own prompt)"]
        WB["Worker B\n(own tools, own prompt)"]
        WC["Worker C\n(own tools, own prompt)"]
    end
    Planner --> Dispatcher
    Dispatcher --> WA
    Dispatcher --> WB
    Dispatcher --> WC
    WA & WB & WC --> Aggregator
    Aggregator -->|"needs another round"| Planner
    Aggregator -->|"done"| Output["Final result"]
~~~

### Application architecture — a production multi-agent codebase

~~~
myagentsystem/
├── src/myagentsystem/
│   ├── orchestrator/
│   │   ├── planner.py          # task decomposition logic
│   │   ├── dispatcher.py       # concurrent fan-out, per-worker timeout/retry
│   │   └── aggregator.py       # synthesis / voting / judge-based selection
│   ├── workers/
│   │   ├── researcher.py       # one worker: own prompt, own scoped tools
│   │   ├── writer.py
│   │   └── critic.py
│   ├── protocol/
│   │   ├── messages.py         # AgentMessage schema (Pydantic), shared by all agents
│   │   └── a2a_client.py       # optional: A2A client for external/cross-org agents
│   ├── core/                   # config, logging, credential management
│   └── observability/
│       ├── tracing.py          # per-agent, per-hop trace ids (see Agent Observability)
│       └── metrics.py
└── tests/
~~~

Rules a mature codebase follows: the orchestrator never contains agent-specific business logic (it only decomposes, dispatches, and aggregates); every worker is independently testable in isolation with a fixed input, exactly like a single-agent system; the message schema (protocol/messages.py) is the one place inter-agent data shape is defined, so no two components disagree about what a handoff looks like; and cross-cutting concerns (tracing, timeouts, retries) live in the dispatcher, not duplicated inside every worker.
`,

  "data-flow": `
Trace one orchestrator-worker request end to end, including a worker timeout and a synthesis step:

~~~mermaid
sequenceDiagram
    participant User
    participant O as Orchestrator
    participant A as Worker A (research)
    participant B as Worker B (research)
    participant Synth as Synthesis step

    User->>O: "Compare approach X and approach Y"
    O->>O: decompose into "research X" and "research Y"
    par Dispatch concurrently
        O->>A: research X (timeout=20s)
        O->>B: research Y (timeout=20s)
    end
    A-->>O: findings on X
    Note over B: B exceeds timeout
    O->>O: mark Worker B as timed out, use partial/fallback result
    O->>Synth: synthesize(findings_X, fallback_Y)
    Synth-->>O: draft comparison
    O->>User: final comparison (flagged: Y section lower confidence)
~~~

The critical thing this trace makes visible: a production multi-agent system must have an explicit answer for "what happens when one worker doesn't come back in time" — silently waiting forever (blocking the whole pipeline on the slowest or a hung worker) or silently dropping that worker's contribution without flagging it to the caller are both worse than an explicit, visible degradation (here, a lower-confidence flag on the affected section). This is the same "design for partial failure" discipline used in any fan-out distributed system, applied to agent workers instead of network services.
`,

  "production-usage": `
### Where multi-agent patterns actually show up in real systems

Production multi-agent systems cluster around a few recurring shapes: a **research-and-synthesis** pipeline (fan out to several specialized researchers, synthesize one report), a **triage-and-route** pipeline (a classifier/manager agent routes a request to the right specialist), a **draft-and-review** pipeline (a proposer and a critic/reviewer, with a bounded number of revision rounds), and cross-organization delegation via **A2A Protocol** where the "workers" are agents owned by an entirely different team or company.

### Typical implementation choices

- **Framework**: **LangGraph** for anything needing precise, hand-wired control flow (conditional branches, explicit cycles with guards); **CrewAI** when the problem genuinely maps onto named specialist roles and a sequential or lightly-hierarchical process is sufficient; **AutoGen** when the value is in open-ended, conversational back-and-forth between agents rather than structured task handoffs. Many production systems use one framework for the bulk of the pipeline and a bespoke orchestrator layer around it for the parts that need more determinism than the framework's defaults provide.
- **Message format**: an internal Pydantic (or equivalent) schema for in-process multi-agent systems; **A2A Protocol**'s JSON-RPC Task/Message format when agents cross an organizational or vendor boundary.
- **Concurrency**: async fan-out with a bounded semaphore (never unbounded concurrency against an LLM provider's rate limits) and per-worker timeouts as a hard requirement, not an optimization.
- **State**: task-scoped context passed explicitly between agents by default; a shared blackboard or external store (Redis/Postgres) only when the topology genuinely calls for it, since shared mutable state between concurrent agents reintroduces classic race-condition risk.

### Operational defaults

- Set a wall-clock budget for the whole multi-agent run, not just per-agent timeouts, so a pipeline with many sequential or nested steps still has a hard ceiling.
- Log a shared correlation/task id through every agent and every hop, from the very first prototype — retrofitting tracing onto an already-complex multi-agent system is dramatically harder than building it in from the start (see **Agent Observability**).
- Default to the cheapest topology that solves the problem (often just a fixed sequential pipeline) and add delegation, voting, or hierarchical management only once you've measured that the simpler design falls short on a real evaluation set.
`,

  "industry-examples": `
- **Research and report-generation products** (a category spanning several AI-native startups and larger companies' internal tools) commonly use an orchestrator-worker shape: fan out to several specialized research agents covering different sub-questions or sources, then synthesize a single report — the pattern earns its cost because the sub-questions are genuinely independent and benefit from parallel, specialized research.
- **Customer support and triage systems** frequently use a manager/router agent that classifies an incoming request and delegates to a specialist agent (billing, technical, account) — a hierarchical-lite shape that maps directly onto how human support teams are already organized, which is why it's one of the most common production multi-agent patterns.
- **Software engineering agent products** (code-generation and coding-assistant tools) often split work between a planner/architect agent and one or more implementer agents, sometimes with a separate reviewer or test-writing agent — a draft-and-review shape where adversarial review genuinely catches classes of bugs a single pass misses.
- **Enterprises connecting internally-built agents to partner or vendor agents** increasingly reach for **A2A Protocol** specifically because their multi-agent system now crosses an organizational boundary — the internal topology (however it's built) becomes one "worker" from the point of view of an external orchestrating agent.

Given how fast this space moves, I'd treat any specific "Company X's production architecture is exactly Y" claim as something to verify against current sources rather than settled fact — this section reflects the general shapes that recur across the industry as of my knowledge cutoff, not a verified list of named deployments.
`,

  "best-practices": `
1. **Prototype the single-agent version first.** Before splitting a task across multiple agents, build and evaluate the simplest single-agent solution — only add agents once you've measured a concrete quality or capability gap the single agent can't close.
2. **Default to orchestrator-worker with a fixed decomposition** unless you have a specific, demonstrated reason the task order can't be known upfront — it is the cheapest, most predictable, most debuggable topology.
3. **Define an explicit message schema for every inter-agent handoff** (Pydantic or equivalent), never raw free text, especially for any handoff whose output feeds a downstream agent's decision.
4. **Set a hard timeout on every worker and a wall-clock budget on the whole pipeline**, and design an explicit, visible degradation path (partial result, flagged confidence) for a worker that doesn't return in time — never block the whole system on the slowest agent.
5. **Give every cyclic (debate/revision) interaction both a positive stop condition and a hard round cap.** A positive "approved"/"converged" signal alone is not sufficient, because the model producing that signal can itself be inconsistent.
6. **Scope tools per agent tightly, per role** — a synthesis/writer agent should never hold a tool a research worker needs, and vice versa; this is both a clarity and a security practice (see Security).
7. **Instrument cross-agent tracing from the first prototype**, with a shared correlation id through every hop — retrofitting this after a system is already complex is far more expensive than building it in from day one.
8. **Evaluate at the whole-pipeline level, not only per-agent** — a golden-set evaluation of the assembled final output catches composition bugs (a bad decomposition, a lossy handoff) that per-agent scores alone will miss.
9. **Track cost and latency per agent, not just per pipeline run**, so a single expensive or slow agent in an otherwise cheap pipeline can be identified and optimized specifically.
10. **Keep individual agents small and single-purpose**, composing larger systems from smaller, independently-testable pieces rather than one large agent whose prompt tries to cover many roles.
11. **Use a standardized protocol (A2A) at organizational boundaries, and a lightweight internal schema within one codebase** — don't reach for a heavyweight external protocol for purely in-process communication, and don't invent a bespoke ad hoc protocol where a standard one already fits.
12. **Design human checkpoints at the highest-consequence points in the pipeline** (an irreversible action, a customer-facing commitment), not as an afterthought — see **Human-in-the-Loop AI**.
`,

  "anti-patterns": `
### Splitting a task into agents that don't earn their cost

~~~python
# WRONG: three agents for a task one well-tooled agent handles fine --
# "classify intent," "extract entities," and "format response" are
# each trivial enough that splitting them adds 3x latency/cost with
# no measured quality gain.
result = classifier_agent(text)
entities = extractor_agent(text)
response = formatter_agent(result, entities)

# RIGHT: one agent, one well-structured prompt and output schema,
# unless a golden-set evaluation shows the split version is meaningfully better.
response = single_agent(text, output_schema=ResponseSchema)
~~~

### Unbounded delegation with no round cap

~~~python
# WRONG: a debate loop with only a "soft" stop condition and no hard cap --
# if the critic's approval signal is inconsistent, this can run indefinitely.
while not approved:
    proposal = revise(proposal, critique)
    critique, approved = critique_fn(proposal)

# RIGHT: always pair a positive stop condition with a hard round cap.
for round_num in range(MAX_ROUNDS):
    critique, approved = critique_fn(proposal)
    if approved:
        break
    proposal = revise(proposal, critique)
else:
    log.warning("debate hit max_rounds without convergence", rounds=MAX_ROUNDS)
~~~

### Free-text handoffs where structure is needed

~~~python
# WRONG: passing a worker's raw text output straight into another
# agent's prompt, with no validation of what it actually contains.
next_prompt = f"Given this research: {worker_output}, write the article."

# RIGHT: validate the handoff against a schema before it crosses
# an agent boundary -- catches missing fields before they become
# a silent downstream failure.
validated = ResearchFindings.model_validate_json(worker_output)
next_prompt = build_writer_prompt(validated)
~~~

### Other production-grade anti-patterns

- **No per-worker timeout in a fan-out.** One hung worker blocking asyncio.gather blocks the entire pipeline, even though the other workers finished long ago.
- **Treating a multi-agent system's output as deterministic enough for exact-match testing.** Evaluate structural properties and golden-set quality scores, never exact text — see Testing.
- **Circular delegation edges in the topology.** If agent A can delegate to B and B can delegate back to A for the same class of question, you have a latent deadlock/livelock risk baked into the design itself, not just a runtime bug.
- **Ignoring per-agent cost/latency metrics and only monitoring the whole pipeline.** Without per-agent breakdown, a regression in one specific worker is invisible until the aggregate numbers degrade enough to notice.
- **Granting every agent every tool "just in case."** Broad tool access across all agents is both a security liability and a debugging liability — a failure could have come from any agent holding any capability.
`,

  performance: `
### Measure first

~~~python
import time

async def timed_worker(name: str, worker_fn, *args) -> tuple[str, str, float]:
    start = time.perf_counter()
    result = await worker_fn(*args)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return name, result, elapsed_ms

async def run_and_measure(workers: dict[str, callable], task: str):
    results = await asyncio.gather(*(
        timed_worker(name, fn, task) for name, fn in workers.items()
    ))
    for name, _, elapsed_ms in results:
        # Emit as a per-agent latency histogram metric -- see Monitoring
        print(f"{name}: {elapsed_ms:.0f}ms")
    return results
~~~

Always measure per-agent latency and cost before optimizing anything — in most multi-agent pipelines, one specific agent (usually one with heavy tool use, a slower model, or a poorly-scoped prompt causing long outputs) dominates the total, and optimizing the wrong agent wastes effort.

### The optimization hierarchy for multi-agent systems (apply in order)

1. **Reduce the agent count to the minimum that earns its cost.** Every additional agent is a full additional LLM round trip at minimum; this is the single biggest lever, larger than any per-call optimization.
2. **Parallelize independent sub-tasks.** If workers genuinely don't depend on each other, dispatch them concurrently rather than serially — this turns an additive latency cost into a "bounded by the slowest worker" cost.
3. **Use a smaller/faster model for simpler roles.** A classifier, router, or formatter agent rarely needs the same model as a research-and-reasoning agent; reserve the most capable (and expensive) model for the agent that actually needs it.
4. **Cap iteration explicitly on any cyclic interaction** (debate, revision), so a confused loop has a hard ceiling on cost/latency rather than an open-ended one.
5. **Cache repeated sub-task results** across runs where staleness is acceptable — a research worker re-answering the same sub-question across similar requests is often the actual bottleneck, not the LLM reasoning itself.
6. **Trim inter-agent context to what the receiver actually needs**, passing a structured subset rather than a full raw upstream output — larger prompts cost more and dilute the receiving agent's attention (see the **Context Engineering** skill).

### Numbers worth internalizing

A sequential N-agent pipeline's latency is roughly additive across agents (each is at least one full LLM call); a hierarchical pipeline with a manager also pays the manager's own planning/review calls on top. A five-agent sequential pipeline where each agent takes 5-10 seconds easily reaches 30-50+ seconds end to end before any tool-call latency is added — that multiplier, not intuition, is what should drive the "is this worth it" decision for every additional agent in a design.
`,

  scalability: `
Multi-agent systems scale along two axes that are mostly independent: how many concurrent multi-agent runs the system as a whole can serve, and how many agents/hops a single run itself fans out to.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["Orchestrator API replica 1"]
    LB --> API2["Orchestrator API replica N"]
    API1 & API2 --> LLMProv["LLM provider(s)\n(rate limits apply per key/account)"]
    API1 & API2 --> Queue["Job queue for long-running runs"]
    Queue --> Workers["Async pipeline workers"]
~~~

### Scaling concurrent runs

- **Horizontal**: orchestrator API replicas are stateless per request (given shared LLM credentials and, if used, a shared blackboard/state store), so scale them like any stateless service.
- **The real bottleneck is almost always LLM API rate limits**, multiplied by however many agents a single run invokes — a five-agent pipeline consumes roughly five times the rate-limit budget of a single-agent call for the same incoming request, which matters directly for capacity planning and choosing whether to spread agents across multiple provider keys/accounts.
- **Long-running or deeply hierarchical pipelines are a poor fit for a synchronous request/response API** — move them to an async job queue with polling or webhook-based result delivery, the same pattern used for any long-running agentic workload.

### Scaling fan-out within a single run

- **Bounded concurrency**: cap the number of workers dispatched concurrently (a semaphore) so a single run doesn't itself overwhelm the LLM provider's per-minute limits.
- **Shared state at scale**: if using a blackboard or shared context store across many concurrent runs, it must live in a shared, concurrency-safe store (Redis/Postgres), not in-process memory — otherwise horizontally scaled orchestrator replicas can't see each other's agents' contributions.

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| LLM rate limits under agent fan-out | Route different agents to different provider keys/accounts where feasible; bounded concurrency and backoff rather than fail |
| Deeply nested hierarchical pipelines are slow | Flatten to orchestrator-worker where the nesting isn't earning its cost; prefer fewer, wider levels over many, narrow ones |
| One slow/hung worker blocks the whole fan-out | Per-worker timeout with an explicit fallback/degradation path, never an unbounded wait |
| Shared blackboard state isn't visible across replicas | Move it to a shared store (Redis/Postgres) instead of in-process memory |
| Cost scaling linearly with agent count | Regularly audit pipeline size; merge or remove agents whose role doesn't earn its keep, measured against a golden set |
`,

  security: `
### Multi-agent-specific attack surface

Multi-agent systems introduce trust boundaries and propagation paths that don't exist in a single-agent system, and deserve the same adversarial scrutiny as any distributed system — see **AI Red Teaming** for the broader practice.

1. **Prompt injection propagation across agents.** Content one worker retrieves (from search results, documents, or another agent's output) can carry injected instructions that, if passed unfiltered into a downstream agent's prompt, manipulate that agent's behavior too — a single successful injection at one hop can cascade through the whole pipeline rather than staying contained. Treat every inter-agent handoff as untrusted input, not only the first external retrieval — see **Prompt Injection Defense**.
2. **Over-broad tool provisioning per agent.** Giving every agent every tool "for flexibility" means a compromised or simply confused agent has access to capabilities its role never needed — scope tools tightly per agent as a security boundary, not just an organizational convenience (see **Tool Calling**).
3. **Delegation as an amplified injection or privilege-escalation vector.** In a hierarchical or debate topology, one agent's output can directly shape another agent's task framing or even trigger it to invoke a tool on the first agent's behalf; a successfully manipulated agent can attempt to manipulate a peer through a delegated request, a more direct attack path than injection reaching only the final output.
4. **Accountability loss across delegation chains.** When agent A delegates to B, which delegates to C, attributing a harmful or wrong outcome to the specific hop responsible becomes genuinely hard without per-hop logging — this is both a debugging problem (see Debugging) and an audit/security problem, since an attacker exploiting one hop deep in a chain can be effectively invisible to the originating caller or end user.
5. **Unbounded cost as a denial-of-wallet vector.** A public-facing endpoint that triggers a large multi-agent fan-out per request is a much larger cost-abuse surface than a single-agent endpoint, since each malicious or accidental request multiplies into many LLM calls; rate-limit and authenticate sized to the pipeline's actual multiplier.
6. **Cross-organization trust when using A2A.** When a worker in your topology is actually a remote agent reached over **A2A Protocol**, you additionally inherit that protocol's own trust-boundary concerns (spoofed Agent Cards, untrusted remote output) — see A2A Protocol's security section for depth.

### Concrete defenses

- Sanitize and schema-validate every inter-agent handoff before it's incorporated into a downstream prompt or acted on programmatically — never pass raw upstream content straight through.
- Scope every agent's tools to the minimum its role requires; review an agent's tool list in code review the same way you'd review IAM permissions.
- Log enough context at every delegation hop (task id, sending agent, receiving agent, summarized content) to reconstruct a full chain after an incident.
- Require explicit human approval for high-consequence actions triggered anywhere in a multi-agent chain, rather than allowing full end-to-end autonomy by default — see **Human-in-the-Loop AI**.
- Rate-limit and authenticate any endpoint that triggers a multi-agent run, sized to the pipeline's actual per-request LLM-call multiplier.

See the dedicated **Prompt Injection Defense**, **AI Red Teaming**, and **A2A Protocol** skills for depth beyond what's specific to internal multi-agent topology here.
`,

  testing: `
Testing a multi-agent system means testing individual agents in isolation, the handoffs between them, and the assembled whole-pipeline behavior — three genuinely different test surfaces.

~~~python
# tests/test_orchestrator.py
import pytest
from myagentsystem.orchestrator.dispatcher import fan_out_research
from myagentsystem.protocol.messages import ResearchFindings

@pytest.mark.asyncio
async def test_fan_out_runs_workers_concurrently(mock_worker):
    # A fake worker with an artificial delay -- verifies dispatch is
    # actually concurrent, not accidentally serialized.
    import time
    start = time.perf_counter()
    await fan_out_research(["topic_a", "topic_b", "topic_c"], worker=mock_worker)
    elapsed = time.perf_counter() - start
    # Three 1-second workers run concurrently should take ~1s, not ~3s.
    assert elapsed < 1.5

@pytest.mark.asyncio
async def test_worker_timeout_produces_explicit_fallback(hung_worker):
    result = await fan_out_research(["slow_topic"], worker=hung_worker, timeout=0.1)
    assert result[0].status == "timed_out"   # explicit, not silently dropped

def test_handoff_schema_rejects_malformed_worker_output():
    with pytest.raises(ValueError):
        ResearchFindings.model_validate_json('{"missing": "required fields"}')

@pytest.mark.asyncio
async def test_debate_loop_respects_max_rounds(never_approving_critic):
    from myagentsystem.workers.critic import debate_until_convergence
    result = await debate_until_convergence("q", critique_fn=never_approving_critic, max_rounds=3)
    # Must terminate at the round cap even though the critic never approves --
    # this is the livelock guard, and it must be tested explicitly.
    assert never_approving_critic.call_count == 3
~~~

### The senior testing doctrine for multi-agent systems

- **Unit test each agent in isolation** with a fixed input and a mocked LLM response, exactly as you would a single-agent system — this is where most real logic bugs (a wrong prompt, a missing tool) actually live.
- **Explicitly test the timeout and partial-failure path**, not only the happy path where every worker returns cleanly — a hung or slow worker is a real, expected production condition, not an edge case.
- **Explicitly test round-cap termination on every cyclic interaction** (debate, revision loops) using a fake agent that never signals approval — this is the single most important test in a system with any debate or revision topology, since a livelock in production is expensive and hard to diagnose after the fact.
- **Integration-test the assembled pipeline against a small golden set**, not just each agent individually — a composition bug (bad decomposition, lossy aggregation) can hide behind individually-correct agent outputs (see the **AI Evals** skill for the general discipline).
- **Never assert on exact LLM-generated text.** Assert on structural properties (schema validation passes, required fields present, timeout/fallback behavior triggers correctly) or LLM-as-judge scoring against a documented rubric.
- **Regression-test agent count and pipeline cost**, not only output quality — a pipeline that silently grew from three agents to seven over time (through gradual delegation creep) is a real, observed production drift worth catching in CI.
`,

  debugging: `
### The toolbox, in escalation order

1. **Log the full per-hop trace with a shared correlation id, from the very first prototype.** With multiple agents involved, "which agent, doing what, produced this specific piece of the final output" is the first thing you need to reconstruct a failure — see **Agent Observability** for the full instrumentation pattern.

~~~python
import logging
logger = logging.getLogger("multi_agent")

def log_hop(task_id: str, from_agent: str, to_agent: str, summary: str):
    logger.info("agent_hop", extra={
        "task_id": task_id, "from_agent": from_agent,
        "to_agent": to_agent, "summary": summary[:200],
    })
~~~

2. **Check the decomposition and handoff first, not the final agent, when the output is wrong.** In a multi-agent pipeline, a wrong final answer is more often caused by a bad upstream decomposition or a lossy handoff than by the last agent's own reasoning — inspect each stage's raw output before assuming the bug is where the symptom appeared.
3. **Enable verbose per-agent logging (each agent's reasoning trace and tool calls)** to catch a specific agent silently misunderstanding its assigned sub-task or picking a wrong tool.
4. **Isolate a single agent and re-run it with the exact input it received in the failing run.** This distinguishes "this agent's own logic is wrong" from "this agent received bad input from an upstream hop."
5. **Watch explicitly for delegation loops and round-cap exhaustion.** A run that took far longer or cost far more than expected should be checked for repeated back-and-forth between the same two agents in the trace — a signal of livelock, not genuine progress.
6. **Trace across an organizational boundary using the shared task id** when a "worker" is actually a remote agent reached over **A2A Protocol** — propagate the correlation id through both sides' logs so a cross-organization failure can still be reconstructed as one incident.
`,

  monitoring: `
### The metrics that matter

~~~python
from prometheus_client import Counter, Histogram

AGENT_CALLS = Counter(
    "agent_calls_total", "LLM calls per agent role", ["agent_role", "outcome"]
)
AGENT_LATENCY = Histogram(
    "agent_call_duration_seconds", "Per-agent call latency", ["agent_role"]
)
PIPELINE_ROUNDS = Histogram(
    "pipeline_rounds_total", "Rounds used in cyclic (debate/revision) interactions",
    ["pipeline_name"],
)
DELEGATION_DEPTH = Histogram(
    "delegation_depth", "How deep a hierarchical delegation chain went", ["pipeline_name"]
)

def on_agent_call(agent_role: str, outcome: str, duration_seconds: float):
    AGENT_CALLS.labels(agent_role=agent_role, outcome=outcome).inc()
    AGENT_LATENCY.labels(agent_role=agent_role).observe(duration_seconds)
~~~

### What to track and why

- **Per-agent call count, latency, and cost.** The most important multi-agent-specific breakdown — an aggregate pipeline metric hides which specific agent is expensive, slow, or failing.
- **Rounds used per cyclic interaction, distributed, not just averaged.** A rising tail (many runs hitting max_rounds) is an early livelock signal before it shows up as a cost or latency regression in aggregate dashboards.
- **Delegation depth in hierarchical pipelines.** An unexpectedly deep or growing delegation chain is a sign of scope creep in the topology itself, worth investigating even if no individual run has failed yet.
- **Timeout/fallback trigger rate per worker.** A rising rate for one specific worker is your earliest signal of a degrading sub-task or upstream dependency, and should be tracked per-worker, not only in aggregate.
- **Handoff validation failure rate.** A rising rate of schema-validation failures on inter-agent messages is both a data-quality and a potential security signal (a sign of injected or malformed content reaching a handoff boundary) — alert on it, don't just log it.
- **Whole-pipeline success rate against a golden set, tracked over time**, not only per-agent success — this is the metric that actually reflects whether the composition, not just the parts, is working.

Alert on symptoms that matter to the end user (rising whole-pipeline failure rate, rising end-to-end latency) rather than only low-level per-agent metrics, and route alerts per pipeline/agent-role so one flaky worker doesn't get lost in an aggregate "mostly fine" dashboard — mirroring the RED-metrics philosophy used for any production service.
`,

  deployment: `
### A minimal production-shaped orchestrator (FastAPI + async job queue)

~~~python
# app/orchestrator_api.py
from fastapi import FastAPI, BackgroundTasks, HTTPException
import uuid

app = FastAPI()
RUN_STORE: dict[str, dict] = {}   # replace with Redis/Postgres in real deployments

@app.post("/runs")
async def start_run(task: dict, background_tasks: BackgroundTasks):
    run_id = str(uuid.uuid4())
    RUN_STORE[run_id] = {"status": "queued"}
    # Long-running, multi-agent work belongs in the background, not the
    # request/response cycle -- callers poll or receive a webhook instead.
    background_tasks.add_task(execute_pipeline, run_id, task)
    return {"run_id": run_id, "status": "queued"}

@app.get("/runs/{run_id}")
async def get_run(run_id: str):
    run = RUN_STORE.get(run_id)
    if run is None:
        raise HTTPException(404, "unknown run_id")
    return run

async def execute_pipeline(run_id: str, task: dict):
    RUN_STORE[run_id]["status"] = "working"
    try:
        result = await run_multi_agent_pipeline(task, timeout_seconds=120)
        RUN_STORE[run_id] = {"status": "completed", "result": result}
    except TimeoutError:
        RUN_STORE[run_id] = {"status": "failed", "error": "pipeline_timeout"}
    except Exception as exc:
        RUN_STORE[run_id] = {"status": "failed", "error": str(exc)}
~~~

~~~dockerfile
# Dockerfile -- an orchestrator API is a standard async HTTP service
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY app/ app/
RUN useradd -m orchestrator
USER orchestrator
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.orchestrator_api:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Per-line rationale: multi-agent execution runs as a background task rather than blocking the request, since a several-agent pipeline can easily exceed typical HTTP timeout budgets; run state is persisted (in production, in Redis/Postgres, not the in-process dict shown here) so a caller can poll across load-balanced replicas; every failure mode (timeout, unexpected exception) is caught and recorded explicitly rather than left as an unhandled background-task crash; non-root user and slim base follow the same container hardening as any other production service.

### Operational notes

- Health endpoints (/healthz, /readyz) belong on the orchestrator exactly as on any other production HTTP service; readyz should additionally check that downstream LLM providers and any external worker endpoints (including remote **A2A Protocol** agents) are reachable.
- Rate-limit run creation per caller identity, sized to the pipeline's actual per-run LLM-call multiplier, not a single-agent baseline.
- Wire a wall-clock budget around the whole pipeline (not just per-agent timeouts) so a pipeline with several sequential or nested stages still has a hard ceiling on total run time.
`,

  "production-checklist": `
Before a multi-agent system takes real traffic:

- [ ] Single-agent baseline evaluated and the multi-agent design's quality gain measured against it, not assumed
- [ ] Topology (orchestrator-worker, hierarchical, debate, blackboard) chosen deliberately and documented with its tradeoffs
- [ ] Explicit message schema (Pydantic or equivalent) defined for every inter-agent handoff
- [ ] Per-worker timeout set on every fan-out dispatch, with an explicit fallback/degradation path
- [ ] Wall-clock budget set on the whole pipeline, not only per-agent
- [ ] Every cyclic (debate/revision) interaction has both a positive stop condition and a hard round cap
- [ ] Tools scoped tightly per agent, following least privilege
- [ ] Shared correlation/task id logged through every agent and every hop
- [ ] Per-agent cost and latency metrics instrumented, not only whole-pipeline aggregates
- [ ] Golden-set evaluation run at the whole-pipeline level, not only per-agent
- [ ] Human approval checkpoint identified and wired in for any high-consequence action (see Human-in-the-Loop AI)
- [ ] Inter-agent handoffs treated as untrusted input; schema-validated before use in downstream prompts
- [ ] Rate limiting and auth on any endpoint that triggers a run, sized to the pipeline's LLM-call multiplier
- [ ] Long-running pipelines moved to an async job queue rather than a synchronous request/response endpoint
- [ ] Delegation loop / livelock guard explicitly tested with a fake agent that never approves
- [ ] Runbook exists: how to diagnose a stuck run, roll back a bad deployment, and read the per-agent dashboards
`,

  "common-mistakes": `
1. **Reaching for multiple agents before proving one agent is insufficient.** The most common mistake is architectural over-engineering — a crew of agents adds real cost and failure surface that must be justified by measurement, not assumed by pattern-popularity.
2. **No timeout on fan-out workers.** A single hung worker in asyncio.gather (or its framework equivalent) silently blocks the entire pipeline, even when every other worker finished quickly.
3. **Debate/revision loops with only a soft stop condition.** Relying solely on a model-generated "approved" signal, with no hard round cap, risks livelock the moment that signal fails to fire consistently.
4. **Circular delegation edges in the topology design itself.** If two agents can each delegate the same class of question to the other, the design has a latent deadlock risk baked in, independent of any specific run's behavior.
5. **Passing raw free text between agents that need structured data.** Ambiguous handoffs are the leading cause of "agents talking past each other" and are almost always fixable with a defined schema.
6. **Granting every agent every tool "just in case."** This is both a debugging liability (any agent could have caused a given side effect) and a security liability (see Security).
7. **Evaluating only per-agent, never the whole assembled pipeline.** A system can score well agent-by-agent while the composition itself (decomposition, aggregation) is still wrong — always evaluate the final output too.
8. **Ignoring per-agent cost/latency breakdowns.** Debugging a pipeline regression without knowing which specific agent got slower or more expensive means guessing instead of measuring.
9. **Treating a multi-agent pipeline as transactional.** Earlier agents may have already run (and cost money) before a later agent fails — design retry/resume logic around per-stage state, not a full pipeline restart by default.
10. **Skipping human checkpoints on consequential actions because "the agents seem to work."** Apparent reliability on a small number of manual tests is not the same as a measured, evaluated safety margin — see **Human-in-the-Loop AI**.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Pipeline hangs indefinitely | A worker with no timeout is stuck (hung tool call, provider outage) | Add per-worker timeout with an explicit fallback path |
| Pipeline runs far longer/cost more than expected | Delegation loop or debate livelock | Add a hard round cap; inspect the trace for repeated back-and-forth |
| Final output missing information an earlier agent produced | Missing or incomplete context/handoff wiring between agents | Audit and explicitly declare what each downstream agent needs from upstream |
| Downstream agent misinterprets upstream output | Free-text handoff where structure was needed | Introduce a Pydantic/schema-validated handoff |
| Two agents produce redundant, overlapping work | Overlapping role/goal definitions across agents | Audit role boundaries; tighten scope or merge the agents |
| Aggregate metrics look fine but users report bad results | Evaluation only ran per-agent, not on the whole pipeline | Add golden-set evaluation at the whole-pipeline level |
| Sudden cost spike with no code change | Silent agent-count creep (delegation gradually added more hops) | Regression-test and alert on agent count / pipeline shape, not only quality |
| Cross-organization delegation silently fails | Remote agent (A2A) capability or auth mismatch not checked before dispatch | Validate the remote Agent Card / capabilities before assuming support |
| Race condition on shared state | Multiple agents writing to a blackboard/shared store without concurrency control | Use a concurrency-safe store (Redis/Postgres transactions) instead of in-process shared memory |
| One agent's error crashes the whole run | No per-agent exception isolation in the dispatcher | Catch and record per-agent failures individually; degrade gracefully rather than propagating a single agent's exception to the whole pipeline |
`,

  faqs: `
**Q: Do I need a multi-agent system, or would one well-tooled agent be enough?**
Start with one agent. Reach for multiple agents only once you've measured — on a real golden set — that a single agent falls short in a way role specialization, parallelism, or adversarial review can concretely fix. Multi-agent design is a cost you pay for a specific, demonstrated benefit, not a default upgrade.

**Q: What's the difference between multi-agent systems and A2A Protocol?**
Multi-agent systems is the design discipline (topologies, coordination patterns, failure modes); **A2A Protocol** is one specific, standardized wire format for the "agent talks to another, independently-owned agent" case, most valuable when agents cross an organizational or vendor boundary. Inside one codebase you can use any internal message schema; across organizations, a standard like A2A avoids N-squared bespoke integrations.

**Q: How is this different from MCP?**
**MCP** standardizes how one agent reaches its own tools and data sources. Multi-agent systems (and A2A) are about how independent agents reach each other. A single agent in a multi-agent system is very often both an MCP client (for its own tools) and a participant in the broader multi-agent topology at the same time.

**Q: Which framework should I use — LangGraph, CrewAI, or AutoGen?**
LangGraph for precise, hand-wired control flow and explicit cycles with guards; CrewAI when the problem maps naturally onto named specialist roles running mostly sequentially; AutoGen when the value is in open-ended conversational back-and-forth between agents. See Comparisons for the full breakdown — none is definitively superior; each optimizes for a different topology's ergonomics.

**Q: How do I stop a debate loop from running forever?**
Every cyclic interaction needs both a positive stop condition (an explicit, structured "approved"/"converged" signal) and a hard round or wall-clock cap as a backstop — the round cap matters because the positive signal can itself be inconsistent.

**Q: How much more does a multi-agent system cost than a single agent?**
Roughly linear in the number of agents/LLM calls a run makes — a five-agent sequential pipeline is commonly 5x+ the cost and, if run sequentially, 5x+ the latency of a single well-tooled agent call. Fan-out to independent workers can keep latency bounded by the slowest worker if run concurrently, but cost still scales with agent count.

**Q: How do I evaluate a multi-agent system?**
At three levels: per-agent correctness, handoff correctness, and whole-system correctness against a golden set. A system can score well on the first two and still fail on the third if the decomposition or aggregation logic itself is flawed — see the **AI Evals** skill for the general discipline this builds on.

**Q: Where do humans fit into a multi-agent pipeline?**
At the highest-consequence points — an irreversible action, a customer-facing commitment, a low-confidence aggregation result — as an explicit approval gate, not scattered ad hoc. See **Human-in-the-Loop AI** for the design patterns.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is an orchestrator-worker topology, and when would you use it?* Model answer: a central coordinator decomposes a task into independent sub-tasks and dispatches them to worker agents, then aggregates results; use it when decomposition is known upfront and sub-tasks are largely independent — it is the cheapest, most predictable, most parallelizable topology.
2. *What's the difference between a hierarchical and a peer-to-peer multi-agent topology?* Model answer: hierarchical has a manager (or chain of managers) directing sub-agents top-down; peer-to-peer has agents addressing each other directly, often iteratively (debate/critique), with no central director — hierarchical suits nested decomposition, peer-to-peer suits genuine disagreement/adversarial review.
3. *Why would you use multiple agents instead of one bigger prompt?* Model answer: role specialization (each agent gets a narrower, more effective framing), parallelism (independent sub-tasks run concurrently), and tool scoping (least privilege per role) — at the cost of more LLM calls, more latency, and a new failure surface at every handoff.
4. *What is a blackboard architecture?* Model answer: agents don't message each other directly; they read/write a shared data structure, and coordination emerges from what's currently posted — useful when contributing agents or the number of rounds aren't known upfront.
5. *How would you aggregate results from three independent worker agents that each answered the same question differently?* Model answer: majority vote for small/structured answer spaces, or a judge/LLM-as-arbiter model for open-ended text where exact-match voting doesn't cluster meaningfully.

**Senior:**

6. *Explain deadlock and livelock in the context of LLM agent loops, and how you'd prevent each.* Model answer: deadlock is a circular wait (agent A delegates to B, B delegates back to A, neither proceeds) — prevent by ensuring delegation edges form a DAG. Livelock is active but non-converging work (an endless debate/revision loop) — prevent with both a positive stop condition and a hard round cap, since the positive signal alone can be inconsistent.
7. *How do you evaluate a multi-agent system, and why is it harder than evaluating a single agent?* Model answer: evaluate at three levels — per-agent correctness, handoff correctness, and whole-pipeline correctness against a golden set — because a system can look correct at the first two levels while a bad decomposition or aggregation still produces a wrong final result; single-agent eval only needs the first level.
8. *Walk through the cost/latency tradeoff of a five-agent sequential pipeline versus a single well-tooled agent.* Model answer: sequential agent latency is roughly additive (5x a single call's latency if serial), cost scales similarly; fan-out to independent workers can bound latency by the slowest worker if concurrent, but cost still scales with agent count — the design must show a measured quality gain that justifies this multiplier.
9. *Design a multi-agent system for triaging and resolving customer support tickets. What topology, and why?* Strong answers propose a hierarchical/router shape (a classifier/manager routes to specialist agents), justify tool scoping per specialist, specify a fallback for low-confidence classification (human escalation), and note the cost multiplier of any additional review/critic agent added to the design.
10. *How would you debug a multi-agent pipeline that intermittently produces a wrong final answer, even though each individual agent seems to work when tested alone?* Model answer: suspect the decomposition or handoff logic first — inspect the exact context/message each downstream agent actually received in the failing run, not just its own reasoning, since a correct agent given incomplete or malformed input still produces a wrong output.
11. *When would you choose A2A Protocol over a bespoke internal message schema for a multi-agent system?* Model answer: when agents cross an organizational or vendor boundary and need standardized discovery, task lifecycle, and auth — for a single team's in-process system, a lightweight internal schema (Pydantic) is simpler and sufficient.
12. *What's the single highest-leverage architectural decision in a multi-agent system, and why?* Strong answers argue for the decomposition/topology choice itself (not any individual agent's prompt) — a wrong decomposition or topology mismatch (e.g., forcing hierarchical delegation onto a problem that's really a fixed sequence) dominates every other quality lever in the system.
`,

  "coding-questions": `
### 1. Bounded-concurrency fan-out with per-worker timeout (tests async + error isolation)

~~~python
import asyncio
from dataclasses import dataclass

@dataclass
class WorkerResult:
    name: str
    output: str | None
    status: str   # "ok" | "timeout" | "error"

async def run_worker_safely(name: str, worker_fn, task: str, timeout: float) -> WorkerResult:
    try:
        output = await asyncio.wait_for(worker_fn(task), timeout=timeout)
        return WorkerResult(name, output, "ok")
    except asyncio.TimeoutError:
        return WorkerResult(name, None, "timeout")
    except Exception as exc:
        return WorkerResult(name, str(exc), "error")

async def fan_out(
    workers: dict[str, callable], task: str, timeout: float = 15.0, max_concurrency: int = 5
) -> list[WorkerResult]:
    semaphore = asyncio.Semaphore(max_concurrency)

    async def bounded(name, fn):
        async with semaphore:
            return await run_worker_safely(name, fn, task, timeout)

    return await asyncio.gather(*(bounded(n, f) for n, f in workers.items()))
~~~

Complexity: O(N) LLM calls dispatched, wall-clock bounded by max(worker durations) up to the concurrency cap, rather than their sum. Follow-up they'll ask: how do you handle partial failure in the aggregation step (answer: flag degraded confidence rather than silently dropping the failed worker's contribution).

### 2. Detecting a delegation cycle in a topology graph (tests graph reasoning)

~~~python
def has_delegation_cycle(edges: dict[str, list[str]]) -> bool:
    """edges: agent -> list of agents it can delegate to.
    A cycle means a design-time deadlock risk (A delegates to B,
    B delegates back to A for an overlapping class of question)."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in edges}

    def visit(node: str) -> bool:
        color[node] = GRAY
        for neighbor in edges.get(node, []):
            if color.get(neighbor, WHITE) == GRAY:
                return True          # back edge -> cycle found
            if color.get(neighbor, WHITE) == WHITE and visit(neighbor):
                return True
        color[node] = BLACK
        return False

    return any(visit(node) for node in edges if color[node] == WHITE)

assert has_delegation_cycle({"A": ["B"], "B": ["A"]}) is True
assert has_delegation_cycle({"A": ["B"], "B": ["C"], "C": []}) is False
~~~

This is a standard DFS cycle-detection over the topology's delegation graph, applied specifically as a design-time validation you can run in CI whenever a new agent/delegation edge is added.

### 3. Majority-vote aggregation with semantic clustering for open-ended answers (production-flavored)

~~~python
def cluster_and_vote(answers: list[str], similarity_fn, threshold: float = 0.85) -> str:
    """Groups near-duplicate answers (via a similarity function -- e.g.
    embedding cosine similarity) before voting, since exact-match voting
    fails on open-ended text that says the same thing in different words."""
    clusters: list[list[str]] = []
    for answer in answers:
        placed = False
        for cluster in clusters:
            if similarity_fn(answer, cluster[0]) >= threshold:
                cluster.append(answer)
                placed = True
                break
        if not placed:
            clusters.append([answer])
    largest = max(clusters, key=len)
    return largest[0]   # representative answer from the winning cluster
~~~

Discussion points: choice of similarity function (embedding cosine similarity vs. an LLM judge comparing pairs), what to do on a tie between two similarly-sized clusters (escalate to a judge model or a human), and the cost of pairwise similarity comparisons at scale (O(n^2) naive, mitigate with embedding-based nearest-neighbor clustering for large N).
`,

  "hands-on-labs": `
### Lab 1 — Orchestrator-worker research pipeline (beginner, ~1.5h)
Build a two-stage pipeline: an orchestrator decomposes a broad topic into three sub-topics, fans them out to three concurrent worker agents (each with its own search tool), and a final synthesis step combines the results into one report. Deliverable: working code plus a short write-up comparing its output and latency against a single-agent baseline on the same topic. Skills: decomposition, concurrent dispatch, aggregation.

### Lab 2 — Debate loop with explicit termination (intermediate, ~2h)
Implement a proposer/critic debate loop for improving a piece of written content, with both a structured "approved" signal from the critic and a hard round cap. Deliberately test it against a critic that never approves, and verify the pipeline terminates cleanly at the round cap rather than looping forever. Deliverable: the loop, its test suite (including the never-approves case), and a short note on how you'd detect this failure mode in production. Skills: cyclic topology design, livelock prevention, testing non-happy paths.

### Lab 3 — Multi-agent evaluation harness (advanced, ~3h)
Build a small golden-set evaluation for a 3-agent pipeline (from Lab 1 or a similar shape) that scores at all three levels: per-agent output quality, handoff completeness (did downstream agents receive what they needed), and whole-pipeline output quality against expected results. Deliverable: the harness plus a report showing at least one case where per-agent scores were high but whole-pipeline quality was low, and your diagnosis of why. Skills: multi-level evaluation design, connects directly to the **AI Evals** skill.

### Lab 4 — Production-hardened deployment (production, ~3-4h)
Take Lab 1's pipeline, wrap it in a FastAPI async job-queue pattern (submit → poll), add per-agent timeouts with explicit fallback behavior, structured logging with a shared correlation id across every agent/hop, Prometheus per-agent latency/cost metrics, and a Dockerfile. Load-test with concurrent submissions and verify per-run cost scales as expected with agent count. Skills: the whole production section, end to end, directly connecting to **Agent Observability**.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Multi-source research assistant** — An orchestrator-worker pipeline that fans a research question out to several specialized workers (web search, a document/KB retriever, a calculations agent), aggregates with a judge-based synthesis step, and returns a cited report with a confidence flag for any sub-question a worker timed out or failed on. Demonstrates: decomposition design, concurrent fan-out, partial-failure handling, and structured aggregation.

2. **Adversarial content-review pipeline** — A proposer/critic debate system for reviewing written content (or code) against a defined rubric, with a bounded number of revision rounds, a structured approval schema, and full per-round tracing. Demonstrates: cyclic topology design, livelock prevention, and multi-level evaluation (does each round actually improve the rubric score, measured, not assumed).

3. **Cross-organization delegation demo** — A local orchestrating agent that delegates a sub-task to a second, independently-run agent process over **A2A Protocol** (or a faithful internal analog if a full A2A implementation is out of scope), with authentication, timeout handling, and full cross-process tracing via a shared correlation id. Demonstrates: understanding the boundary between internal multi-agent coordination and standardized cross-agent protocols.

Each project: async-first implementation, full type hints/schemas for every inter-agent handoff, a golden-set evaluation at the whole-pipeline level (not just per-agent), CI via GitHub Actions, and a README documenting the chosen topology and why it was chosen over the single-agent alternative. The architectural justification is what gets senior interviews.
`,

  "case-studies": `
### The AutoGPT/BabyAGI era: autonomy without bounds
Early 2023 autonomous-loop experiments demonstrated LLM agents that could plan and re-plan indefinitely with minimal human oversight — impressive as a demo, but notoriously prone to looping, drifting off-task, and burning API budget without a clear stopping point. Lesson: unbounded autonomy (single- or multi-agent) without explicit termination and cost guards is a demo pattern, not a production one; nearly every framework that followed (AutoGen, CrewAI, LangGraph) added more explicit control structures specifically in response to this lesson.

### AutoGen's conversational model and its own tension
AutoGen's core design lets multiple agents converse freely in a shared chat to solve a problem — powerful for open-ended collaboration, but teams adopting it in production repeatedly report needing to add more deterministic guardrails (turn limits, explicit termination conditions, structured message schemas) on top of the free-form chat to make outcomes reliable enough to ship. Lesson: the same "pure autonomy needs a deterministic backstop" pattern recurs across frameworks, independent of which one you start with.

### CrewAI's introduction of Flows
CrewAI's own maturation — adding a more deterministic, event-driven Flows layer on top of its originally more autonomous crew/delegation model — is a direct case study in the same lesson: as multi-agent systems move from prototype to production, teams consistently trade some autonomy for predictability once they've measured the reliability cost of pure delegation. Lesson: expect to design toward a hybrid of deterministic orchestration with a smaller number of genuinely autonomous decision points, not an all-or-nothing choice.

### Anthropic's "workflows vs. agents" framing
Anthropic's widely-cited practitioner guidance drawing a line between predefined-path "workflows" and dynamically-self-directing "agents" reframed how much of the industry now approaches multi-agent design: start with the simplest workflow that solves the problem, and only introduce genuine multi-agent autonomy at the specific points where the added flexibility is worth its measured cost. Lesson: the discipline in multi-agent systems is knowing where NOT to add an autonomous agent, at least as much as knowing how to build one.
`,

  comparisons: `
| Dimension | Orchestrator-Worker | Hierarchical | Peer-to-Peer / Debate | Blackboard |
|---|---|---|---|---|
| Predictability | High | Medium | Low-medium | Low |
| Parallelism | Excellent (independent workers) | Good within each level | Usually sequential (turn-based) | Variable, can be concurrent |
| Best fit | Known decomposition, independent sub-tasks | Naturally nested sub-problems | Genuine disagreement/adversarial review needed | Unknown contributor set, async partial contributions |
| Failure risk | Worker timeout, aggregation bugs | Deep indirection, harder tracing | Deadlock/livelock without stop conditions | Race conditions, hard to debug ordering |
| Typical framework fit | LangGraph "supervisor," CrewAI sequential | CrewAI hierarchical, nested LangGraph graphs | AutoGen conversational agents | Custom, less standardized tooling |

| Dimension | LangGraph | CrewAI | AutoGen | A2A Protocol |
|---|---|---|---|---|
| Abstraction level | Low-level graph/state machine, full control | Higher-level, role/task/process declarative | Conversational multi-agent runtime | Wire protocol, not a framework |
| Best fit | Precise branching, explicit cycles with guards | Task decomposition mapping onto named roles | Open-ended agent-to-agent dialogue | Cross-organization/vendor agent delegation |
| Determinism | High (you wire the graph explicitly) | Medium (sequential) to lower (hierarchical) | Lower by default, requires added guardrails | N/A — governs communication, not internal logic |
| Where it sits relative to this page | An implementation substrate for any topology here | An implementation substrate, esp. orchestrator-worker/hierarchical | An implementation substrate, esp. peer-to-peer | The standardized transport when a "worker" is external |

**How seniors choose**: start by naming the topology the problem actually has (often, none — a single agent suffices), then pick the framework whose defaults match that topology's control-flow needs — LangGraph when you need to hand-wire precise branching and cycles yourself, CrewAI when the problem maps onto named roles running mostly in sequence, AutoGen when open-ended conversation is genuinely the point, and A2A only once the boundary is organizational, not just architectural.
`,

  "related-technologies": `
- **Agent Fundamentals** — the single-agent reason-act-observe loop every agent in a multi-agent system is still built from; read this first if it's new.
- **A2A Protocol** — the standardized wire format for agent-to-agent communication across organizational/vendor boundaries; complements, doesn't replace, internal multi-agent topology design.
- **MCP** — standardizes agent-to-tool/data access; the layer below each individual agent in a multi-agent system, not between agents.
- **LangGraph** — a general graph/state-machine substrate capable of expressing any topology on this page with explicit, hand-wired control flow.
- **CrewAI** — a role-based, higher-level framework optimized for the orchestrator-worker and hierarchical shapes mapped onto named specialist roles.
- **AutoGen** — a conversational multi-agent runtime, the natural fit for peer-to-peer/debate topologies.
- **Planning** — task decomposition, the core skill an orchestrator or manager agent is exercising when it breaks a task into sub-tasks.
- **Agent Memory** — inter-agent context passing (handoffs, shared blackboard state) is a specialized form of the memory-design tradeoffs covered there.
- **Agent Observability** — the tracing, debugging, and monitoring practice this page's Monitoring/Debugging sections point toward, specialized for multi-hop, multi-agent traces.
- **Human-in-the-Loop AI** — where and how to insert approval gates into a multi-agent pipeline at its highest-consequence points.
- **AI Evals** — the general evaluation discipline; this page's contribution is the multi-level (per-agent/handoff/whole-pipeline) evaluation framing specific to multi-agent systems.
- **Structured Outputs** — the discipline behind defining reliable inter-agent message schemas rather than passing raw free text between agents.

On this platform, the natural next pages: **Agent Fundamentals** → this page → **LangGraph** / **CrewAI** / **AutoGen** for implementation → **A2A Protocol** for cross-organization delegation → **Agent Observability** and **Human-in-the-Loop AI** for running one safely in production.
`,

  "latest-updates": `
As of my knowledge cutoff (early 2026), the clearest industry-wide trend is convergence toward hybrid designs: mostly deterministic orchestration code (explicit decomposition, explicit dispatch, explicit aggregation) with a small number of genuinely autonomous decision points placed only where flexibility has been measured to earn its cost — echoing Anthropic's widely-cited "workflows vs. agents" framing and CrewAI's own move toward its more deterministic Flows layer. **A2A Protocol**'s move to Linux Foundation governance in 2025 is a meaningful step toward multi-agent interoperability becoming a genuinely cross-vendor standard rather than a single-company initiative, though I'm not confident of the exact current spec version or adoption breadth and would verify directly against the official A2A project sources before quoting specifics.

Growing attention on multi-agent-specific observability and evaluation tooling (tracing across agent boundaries, whole-pipeline golden-set evaluation rather than only per-agent scoring) reflects the industry recognizing that multi-agent failure modes genuinely differ from single-agent ones, not just scaled-up versions of the same problems — this is the throughline connecting this page directly to the **Agent Observability** and **AI Evals** skills.

I'd treat any specific current benchmark number, a named framework's exact current feature set, or a specific company's production architecture as something to verify with a fresh search rather than take as settled fact from this page — this is a fast-moving area, and stating a wrong specific over a correctly-hedged general trend would be a worse failure than the hedge itself.
`,

  "future-roadmap": `
The trajectory worth betting career time on: multi-agent design is converging toward "mostly deterministic orchestration, autonomy only where measured to earn it" rather than either extreme (a single monolithic agent, or maximal free-form multi-agent autonomy) — the engineers who can correctly name a problem's topology, quantify the cost/latency multiplier of adding an agent, and design explicit termination/timeout guards will be more valuable than engineers who can merely wire up a framework's default multi-agent example.

Standardized inter-agent protocols (A2A and whatever else emerges alongside or after it) are likely to keep maturing as more organizations need to connect agents they don't fully control — understanding the MCP/A2A boundary well, and being fluent in reasoning about trust and accountability across delegation chains, is a durable skill independent of which specific protocol wins adoption.

Multi-agent-specific observability and evaluation tooling (cross-agent tracing, whole-pipeline golden-set evaluation) is likely to keep maturing from bespoke, hand-rolled instrumentation (what most teams do today) toward more standardized platform support — betting on the underlying discipline (multi-level evaluation, per-hop tracing, explicit failure-mode guards) rather than any single vendor's current tooling is the safer long-term investment, since the discipline transfers even as the specific tools change.
`,

  "cheat-sheet": `
~~~text
MULTI-AGENT SYSTEMS -- ESSENTIALS

TOPOLOGIES
  Orchestrator-worker : central coordinator fans out independent sub-tasks, aggregates
  Hierarchical        : nested orchestrator-worker (manager -> sub-managers -> agents)
  Peer-to-peer/debate : agents address each other directly, often iterative
  Blackboard          : agents read/write shared state, no direct messaging

DEFAULT CHOICE
  Start with ONE agent. Add agents only once measured against a golden set.
  Default topology when you do need >1 agent: orchestrator-worker, sequential.

MESSAGE DESIGN
  Define an explicit schema (Pydantic) for every handoff -- never raw free text
  when the receiver needs specific fields.
  Cross-organization? Use A2A Protocol instead of a bespoke wire format.

FAILURE MODES
  Deadlock  : circular delegation (A waits on B, B waits on A) -> keep delegation
              edges a DAG; detect cycles at design time.
  Livelock  : cyclic interaction never converges -> ALWAYS pair a positive stop
              condition with a hard round/time cap.
  Runaway cost: unbounded fan-out/delegation -> max_iter, max_execution_time,
              wall-clock budget on the WHOLE pipeline, not just per-agent.

FAN-OUT PATTERN (Python/asyncio)
  semaphore = asyncio.Semaphore(max_concurrency)
  async def bounded(fn):
      async with semaphore:
          return await asyncio.wait_for(fn(), timeout=T)
  results = await asyncio.gather(*(bounded(w) for w in workers))

COST MODEL
  N sequential agents ~= N x single-agent latency/cost (additive)
  N concurrent independent workers ~= max(worker latency), cost still N x

EVALUATION -- THREE LEVELS
  1. Per-agent correctness (did THIS agent do its job)
  2. Handoff correctness (did the message carry what's needed)
  3. Whole-pipeline correctness (golden-set eval on the FINAL output)
  A system can pass 1+2 and still fail 3 -- always evaluate the assembly.

SECURITY
  Scope tools per agent (least privilege). Treat every inter-agent handoff as
  untrusted input (prompt injection propagates across hops). Log every hop
  with a shared correlation id for accountability.

FRAMEWORK FIT
  LangGraph -> precise hand-wired control flow, explicit cycles with guards
  CrewAI    -> role/task/process mapped onto named specialists, sequential default
  AutoGen   -> open-ended conversational agent-to-agent dialogue
  A2A       -> standardized wire protocol for CROSS-ORGANIZATION delegation

RELATED SKILLS
  Agent Fundamentals -> Planning / Agent Memory -> [this page]
  -> LangGraph / CrewAI / AutoGen (build it) -> A2A Protocol (cross-org)
  -> Agent Observability / Human-in-the-Loop AI (run it safely)
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What is orchestrator-worker topology? | A central coordinator decomposes a task, dispatches independent sub-tasks to workers, and aggregates their results. |
| What is the difference between hierarchical and orchestrator-worker? | Hierarchical nests the pattern across multiple levels (managers of managers); orchestrator-worker is typically one flat level. |
| What defines a peer-to-peer/debate topology? | Agents address each other directly (not through a central coordinator), often iterating propose-critique-revise. |
| What is a blackboard architecture? | Agents read/write a shared data structure instead of messaging each other directly; coordination emerges from shared state. |
| What is deadlock in an agent system? | Two or more agents each wait on a result only the other can produce; neither proceeds — caused by circular delegation. |
| What is livelock in an agent system? | Agents actively work but never converge to a final answer — e.g. an unbounded debate/revision loop. |
| How do you prevent livelock? | Pair an explicit positive stop condition (structured "approved" signal) with a hard round/time cap as a backstop. |
| How do you prevent deadlock? | Ensure delegation edges form a DAG (no cycles); detect cycles at design time with a graph traversal. |
| What's the cost multiplier of an N-agent sequential pipeline? | Roughly N times a single agent's cost and latency, since each agent is at least one full LLM call. |
| Does concurrent fan-out reduce latency below the sum of workers? | Yes — dispatched concurrently, latency is bounded by the slowest worker, not the sum, though cost still scales with worker count. |
| What are the three levels at which a multi-agent system must be evaluated? | Per-agent correctness, handoff correctness, and whole-pipeline correctness against a golden set. |
| Why can a multi-agent system pass per-agent eval but still fail overall? | A bad decomposition or lossy aggregation can produce a wrong final result even when every individual agent performed correctly. |
| What problem does A2A Protocol solve that internal multi-agent design doesn't? | Standardized discovery, task lifecycle, and communication for agents owned by different organizations or vendors. |
| What is the key difference between MCP and A2A? | MCP standardizes agent-to-tool/data access; A2A standardizes agent-to-agent communication. |
| What is the single most common multi-agent anti-pattern? | Splitting a task into multiple agents before proving a single agent is insufficient, adding cost with no measured quality gain. |
`,

  mcqs: `
1. What is the primary risk of a peer-to-peer debate topology without an explicit stop condition?
   A) Deadlock from circular tool access
   B) Livelock — agents keep revising without converging
   C) Data loss from unvalidated schemas
   D) Excessive tool provisioning
   **Answer: B.** A debate/revision loop with no positive convergence signal or hard round cap can run indefinitely, actively working but never producing a final, accepted answer — that is livelock, distinct from deadlock (which is a circular wait, not active-but-unproductive work).

2. In a concurrent fan-out to five independent workers, what determines total latency (assuming no failures)?
   A) The sum of all five workers' latencies
   B) The latency of the fastest worker
   C) The latency of the slowest worker
   D) A fixed constant regardless of worker count
   **Answer: C.** Dispatched concurrently, the pipeline waits for all workers to complete, so wall-clock time is bounded by the slowest worker, not the sum — though total cost (tokens/API calls) still scales with the number of workers.

3. Which of the following best distinguishes MCP from A2A Protocol?
   A) MCP is for agent-to-agent communication; A2A is for agent-to-tool communication
   B) MCP is for agent-to-tool/data access; A2A is for agent-to-agent communication
   C) They are interchangeable and solve the same problem
   D) A2A replaces MCP entirely in modern systems
   **Answer: B.** MCP standardizes how a single agent reaches its own tools and data sources; A2A standardizes how one agent communicates with a different, independently-owned agent. They are complementary, not competing.

4. Why should a multi-agent system be evaluated at the whole-pipeline level, not just per-agent?
   A) Per-agent evaluation is always inaccurate
   B) A correct decomposition or aggregation step cannot be tested in isolation
   C) A system can score well per-agent while a bad decomposition or lossy aggregation still produces a wrong final result
   D) Whole-pipeline evaluation is cheaper to run
   **Answer: C.** Individually correct agents can still combine into a wrong final answer if the task decomposition was flawed or the aggregation step lost or misused information — a failure mode invisible to per-agent scoring alone.

5. What is the recommended default when unsure whether a problem needs a multi-agent system?
   A) Always start with the most flexible topology (peer-to-peer debate)
   B) Always start with a hierarchical manager for future extensibility
   C) Prototype a single agent first and only add agents once a measured gap is shown
   D) Use blackboard architecture by default since it's the most general
   **Answer: C.** Multi-agent design adds real cost and failure surface; the senior default is to prove a single, well-tooled agent is insufficient on a real evaluation set before reaching for the added complexity of multiple agents.

6. What is the correct fix for two agents "talking past each other" due to an ambiguous handoff?
   A) Add more agents to cross-check the result
   B) Increase the temperature of both agents' LLM calls
   C) Define and validate an explicit structured schema for the handoff
   D) Merge both agents' prompts into a single, longer prompt
   **Answer: C.** The root cause is almost always an underspecified or free-text handoff; introducing a validated schema (e.g. a Pydantic model) for what one agent passes to the next is the direct fix, not adding agents or changing sampling parameters.
`,

  "revision-notes": `
Multi-agent systems are the discipline of coordinating more than one LLM agent to solve a task, distinct from any specific framework used to build one. The four core topologies are orchestrator-worker (a coordinator fans work out to independent workers and aggregates), hierarchical (nested orchestrator-worker across levels), peer-to-peer/debate (agents address each other directly, often iteratively), and blackboard (agents read/write shared state with no direct messaging). The senior default is to start with a single agent and only introduce multiple agents once a measured evaluation gap justifies the added cost — every additional agent is, at minimum, one more full LLM round trip, so an N-agent sequential pipeline costs and takes roughly N times as long as a single call.

Two failure modes are unique to multi-agent (versus single-agent) systems: deadlock, a circular wait where agents each depend on the other and neither proceeds, prevented by keeping delegation edges acyclic; and livelock, a cyclic interaction (debate, revision) that actively runs but never converges, prevented by pairing an explicit positive stop condition with a hard round or time cap as a backstop, since the positive signal alone can be inconsistent. Inter-agent handoffs should always use an explicit, validated message schema rather than raw free text — ambiguous handoffs are the leading cause of agents "talking past each other," redundant work, and downstream misinterpretation.

Evaluation must happen at three distinct levels: per-agent correctness, handoff correctness, and whole-pipeline correctness against a golden set — a system can score well on the first two while a flawed decomposition or aggregation still produces a wrong final answer, a failure mode invisible to per-agent testing alone. Security in multi-agent systems adds propagation risk beyond single-agent concerns: prompt injection in one agent's output can cascade through every downstream hop it reaches, so every handoff should be treated as untrusted input, and tools should be scoped tightly per agent under least privilege.

Multi-agent systems relate closely to several other platform skills without being redundant with any of them: **MCP** standardizes agent-to-tool access (a layer below any individual agent), **A2A Protocol** standardizes agent-to-agent communication specifically across organizational or vendor boundaries, and **LangGraph**, **CrewAI**, and **AutoGen** are three different implementation substrates suited to different topologies (precise hand-wired control flow, role-based sequential/hierarchical crews, and open-ended conversational debate, respectively). Running a multi-agent system safely in production additionally depends on cross-hop tracing (**Agent Observability**) and explicit human approval gates at the highest-consequence points (**Human-in-the-Loop AI**) — neither is optional once autonomous delegation is involved.
`,

  "learning-roadmap": `
### Week 1 — Foundations and topology vocabulary
Make sure **Agent Fundamentals**, **Tool Calling**, and **Planning** are solid first. Read this page's Beginner and Intermediate Concepts sections; build the two-agent orchestrator-worker pipeline from Beginner Concepts by hand, without any framework. Milestone: you can explain, in plain language, the difference between orchestrator-worker, hierarchical, peer-to-peer/debate, and blackboard topologies, and name which one fits a given example problem.

### Week 2 — Fan-out, aggregation, and failure modes
Implement concurrent fan-out with bounded concurrency, per-worker timeouts, and explicit fallback handling (Hands-on Lab 1). Study deadlock and livelock in Advanced Concepts; implement and test a debate loop with both a positive stop condition and a hard round cap (Hands-on Lab 2), specifically testing the never-converges case. Milestone: you can design and defend explicit guards against both failure modes for any new cyclic interaction you build.

### Week 3 — Evaluation and message design
Build the three-level evaluation harness from Hands-on Lab 3 (per-agent, handoff, whole-pipeline), using the **AI Evals** skill's general discipline. Introduce structured, validated message schemas for every handoff in your pipelines. Milestone: you can point to a concrete case in your own system where per-agent scores were high but whole-pipeline evaluation caught a real bug.

### Week 4 — Frameworks and production hardening
Skim or build the same pipeline shape in **LangGraph**, **CrewAI**, and **AutoGen** to feel their different ergonomics firsthand. Complete Hands-on Lab 4: production deployment with async job-queue serving, per-agent metrics, cross-hop tracing with a shared correlation id, and a Dockerfile. Milestone: a deployed, load-tested multi-agent pipeline with a documented topology choice, cost/latency numbers, and a runbook.

Next platform skill: once you can design, evaluate, and safely operate a multi-agent system, move to **A2A Protocol** (for cross-organization delegation), **Agent Observability** (to deepen the tracing/debugging practice this page only introduces), or **Human-in-the-Loop AI** (to design approval gates for the consequential actions your pipeline can now take).
`,

  "official-docs": `
- **LangGraph documentation** — the most detailed official treatment of multi-agent orchestration patterns (supervisor, hierarchical, and custom graph topologies) among the major frameworks; read its multi-agent guides directly for current API specifics.
- **CrewAI documentation** — official docs on Crews, Processes (sequential/hierarchical), and Flows; the clearest official source for the role-based mental model this page draws on.
- **AutoGen (Microsoft) documentation** — official docs on conversational multi-agent patterns, group chat, and termination conditions.
- **Agent2Agent (A2A) Protocol specification** — the authoritative source for the standardized wire-format side of multi-agent communication across organizational boundaries; verify current spec version and governance details directly against it, since this evolves quickly.
- **Model Context Protocol (MCP) specification** — the complementary standard for agent-to-tool access, useful context for understanding the MCP/A2A boundary discussed throughout this page.

I don't have verified, current URLs to cite with confidence — search each project's official site/GitHub organization directly rather than trusting a specific link from memory, since these move and reorganize frequently.
`,

  books: `
- **"Multiagent Systems" (Shoham & Leyton-Brown)** — the classical, pre-LLM textbook on multi-agent theory (game theory, coordination, negotiation); why this one: it's the rigorous foundation the LLM-agent field is informally rediscovering, and it's genuinely useful for the vocabulary of consensus, voting, and coordination this page borrows.
- **"Artificial Intelligence: A Modern Approach" (Russell & Norvig)** — has a strong classical treatment of multi-agent planning and game-theoretic agents; why this one: connects LLM-based multi-agent design back to decades of prior AI research on the same coordination problems.
- **"Designing Distributed Systems" (Brendan Burns)** — not agent-specific, but its patterns for distributed coordination, retries, and partial failure map directly onto multi-agent fan-out/aggregation design; why this one: the failure-handling discipline (timeouts, circuit breakers, graceful degradation) transfers almost unchanged.
- Practitioner guides and blog-length treatments from the major agent framework vendors (Anthropic, LangChain/LangGraph, Microsoft/AutoGen) are currently more current and detailed than any book-length treatment specific to LLM multi-agent systems — I'd treat this as an area where blogs and official docs (see Blogs, Official Docs) are ahead of books as of my knowledge cutoff, and would recommend those first for anything requiring current framework specifics.
`,

  blogs: `
- **Anthropic's engineering blog on building effective agents** — the widely-cited "workflows vs. agents" framing referenced throughout this page; high-signal, practitioner-focused, and directly shapes how to decide when multi-agent complexity is worth its cost.
- **LangChain/LangGraph's official blog** — detailed, code-forward posts on multi-agent orchestration patterns implemented in LangGraph specifically; useful for seeing the orchestrator-worker and hierarchical topologies as concrete graphs.
- **CrewAI's official blog and documentation site** — practitioner content on role design, Flows, and production lessons learned from the framework's own evolution (notably, its own move toward more deterministic control).
- **Microsoft's AutoGen research and engineering blog** — content on conversational multi-agent patterns and termination-condition design, the framework-specific angle on the debate/peer-to-peer topology.

I'd verify current URLs and check publication dates directly, since blog content in this space is updated and superseded quickly, and I don't want to cite a specific stale link as if it were current.
`,

  "research-papers": `
Multi-agent LLM systems as a named research area is genuinely thin relative to how much production interest it has — much of the best current material is practitioner blog posts and framework documentation rather than peer-reviewed papers, and I don't want to invent paper titles or authors I'm not confident actually exist. Being honest about that gap:

- **Closest foundational reading**: classical multi-agent systems and distributed AI research (contract-net protocols, blackboard architectures, negotiation-based coordination) from the 1980s-1990s AI literature — the concepts (deadlock/livelock analogs, consensus mechanisms, coordination without central control) transfer directly to LLM-based agents even though the original work predates LLMs entirely; Shoham & Leyton-Brown's textbook (see Books) is the best single entry point into this body of work.
- **Adjacent, LLM-era research worth searching for directly**: work on self-consistency and ensemble prompting (sampling multiple reasoning paths and voting) is closely related to the voting/consensus patterns in this page's Intermediate Concepts, and work on chain-of-thought and tool-use/agentic reasoning (the single-agent loop this page's multi-agent patterns are built from) is well-established — I'd search current venues (arXiv, major ML conference proceedings) directly for specific, current papers rather than rely on my recollection of exact titles.
- **Multi-agent debate as a specific technique** (multiple LLM instances critiquing/refining each other's answers to improve accuracy) has been explored in published research — again, I'd verify the specific paper(s) and their exact findings via a current search rather than state a title or result I'm not fully certain of.

If you need citable, current sources for this section, treat it as a "search before you cite" area rather than one this page can responsibly hand you a fixed reading list for.
`,

  videos: `
- **Conference/practitioner talks from LangChain, CrewAI, and Microsoft (AutoGen) teams** on multi-agent orchestration — search each vendor's official YouTube channel or conference talk archives (e.g. their respective "build day" or dev-conference sessions) for the most current, framework-specific walkthroughs.
- **Anthropic's public talks and written content on agent design principles** — the same "workflows vs. agents" framing referenced in Latest Updates and Future Roadmap is also covered in talk form by Anthropic's applied AI team; search their official channels for the current version.
- I don't have verified, current video titles, speaker names, or publication dates I'm confident citing specifically — search each framework's official channel directly for current content rather than trust a specific title from memory, since talk archives are reorganized and new, more current material supersedes older talks quickly in this space.
`,

  "github-repos": `
- **langchain-ai/langgraph** — the reference implementation for graph-based multi-agent orchestration; its examples directory contains concrete supervisor and hierarchical multi-agent patterns worth studying directly.
- **crewAIInc/crewAI** — the reference implementation of the role-based Crew/Task/Process/Flow model this page's Intermediate/Advanced Concepts sections draw examples from.
- **microsoft/autogen** — the reference implementation of the conversational multi-agent pattern; its group-chat and termination-condition code is the clearest concrete example of peer-to-peer topology handling in a mainstream framework.
- **The official Agent2Agent (A2A) project's GitHub organization** — reference SDKs and sample implementations for the standardized cross-agent protocol referenced throughout this page; check directly for the current set of supported languages and SDK maturity.
- **The official Model Context Protocol (MCP) GitHub organization** — reference servers and SDKs for the complementary agent-to-tool standard.
- Search GitHub topics like "multi-agent-systems," "llm-agents," and "agent-orchestration" for current, actively-maintained community example repositories — this ecosystem changes fast enough that a fixed list risks going stale quickly; verify a repo's recent commit activity before treating it as a current reference.
`,

  "practice-problems": `
Ordered by the skill each focuses on:

1. **Topology identification**: given five short problem descriptions (e.g. "summarize three unrelated documents," "resolve a customer complaint by routing to the right team," "have two models debate a controversial claim"), name the best-fit topology for each and justify why, in one sentence per example.
2. **Cycle detection**: given a delegation graph as an adjacency list, implement and test a cycle-detection function (see Coding Questions #2) against both cyclic and acyclic examples.
3. **Bounded fan-out**: implement the bounded-concurrency, per-worker-timeout fan-out pattern (see Coding Questions #1) from scratch, then extend it to track and log per-worker latency as a metric.
4. **Livelock guard**: implement a debate loop with both a structured stop condition and a hard round cap, then write a test using a fake critic that never approves, asserting the loop terminates at the cap.
5. **Multi-level evaluation**: given a small, fixed 3-agent pipeline (provided or self-built) and a golden set of 10 example tasks with expected final outputs, build an evaluation harness that scores per-agent output quality, handoff completeness, and whole-pipeline correctness separately, and find at least one case where they disagree.
6. **External practice sets**: general distributed-systems practice problems on partial failure, timeouts, and consensus (from any standard distributed-systems course or book) transfer directly to multi-agent fan-out/aggregation design — practicing those problems sharpens the same intuition this page's Advanced Concepts and Performance sections rely on.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client["Client / caller"]
        User["User request"]
    end
    subgraph API["Orchestrator API (stateless, horizontally scaled)"]
        Endpoint["POST /runs -- enqueues, returns run_id"]
        Poll["GET /runs/{id} -- poll for status/result"]
    end
    subgraph Queue["Async job execution"]
        JobStore[("Run state store\n(Redis/Postgres)")]
        Exec["Pipeline executor"]
    end
    subgraph Orchestration["Orchestration logic"]
        Decompose["Decompose task"]
        Dispatch["Bounded-concurrency dispatcher\n(per-worker timeout)"]
        Aggregate["Aggregate / vote / synthesize"]
    end
    subgraph Workers["Worker agents"]
        W1["Worker: role A\n(own tools, own prompt)"]
        W2["Worker: role B"]
        W3["Worker: role C"]
    end
    subgraph External["Cross-organization (optional)"]
        A2AAgent["Remote agent via A2A Protocol"]
    end
    subgraph Obs["Observability"]
        Tracing["Per-hop tracing\n(shared correlation id)"]
        Metrics["Per-agent cost/latency metrics"]
    end

    User --> Endpoint --> JobStore
    Endpoint --> Exec
    Exec --> Decompose --> Dispatch
    Dispatch --> W1 & W2 & W3
    Dispatch -.optionally.-> A2AAgent
    W1 & W2 & W3 & A2AAgent --> Aggregate
    Aggregate -->|"needs another round"| Decompose
    Aggregate --> JobStore
    User --> Poll --> JobStore
    Orchestration -.-> Tracing
    Orchestration -.-> Metrics
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Multi-Agent Systems))
    Topologies
      Orchestrator-worker
      Hierarchical
      Peer-to-peer / debate
      Blackboard
    Communication
      Message schemas
      Structured handoffs
      A2A Protocol
      MCP boundary
    Coordination
      Decomposition / planning
      Dispatch and fan-out
      Aggregation / voting
      Consensus mechanisms
    Failure modes
      Deadlock
      Livelock
      Redundant work
      Runaway cost / delegation loops
    Evaluation
      Per-agent correctness
      Handoff correctness
      Whole-pipeline correctness
    Production
      Timeouts and fallback
      Cost and latency multiplier
      Observability and tracing
      Human-in-the-loop checkpoints
      Security -- injection propagation, tool scoping
    Frameworks
      LangGraph
      CrewAI
      AutoGen
~~~
`,
};

export default multiAgentSystems;
