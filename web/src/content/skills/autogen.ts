import type { SkillContent } from "../types";

/**
 * AutoGen — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const autogen: SkillContent = {
  overview: `
AutoGen is Microsoft's open-source framework for building multi-agent LLM applications around a **conversation-driven** model: instead of a fixed pipeline of tasks or a hand-wired graph, you define a set of agents that exchange messages in a shared conversation, and the system's behavior emerges from that back-and-forth. The foundational primitive is the **ConversableAgent** — an agent that can both send and receive messages, optionally generate replies with an LLM, optionally execute code, and optionally hand control to a human. Two common specializations sit on top of it: an **AssistantAgent** (an LLM-backed agent that reasons and, where wired for it, writes code) and a **UserProxyAgent** (an agent that represents a human or an automated executor, capable of running code the assistant produces and relaying real or simulated human feedback). For conversations among more than two agents, **GroupChat** and its **GroupChatManager** coordinate turn-taking among a roster of agents.

For an AI engineer, AutoGen matters because it was one of the first widely-adopted frameworks to take "let agents talk to each other" seriously as a general-purpose orchestration mechanism, rather than treating multi-agent collaboration as a special case bolted onto a single-agent loop. Where CrewAI models a small team of specialists executing declared tasks, and LangGraph models an explicit graph/state machine you wire node by node, AutoGen models a **conversation**: a shared message history that every participating agent can read, reply to, and reason about, with control flow expressed as "who speaks next" rather than "which task or node executes next." That framing is powerful for problems whose natural shape is dialogue — a coder and a critic iterating on a solution, a planner and executors negotiating a plan, a human periodically stepping in to redirect — and considerably less natural for problems that are really a fixed, known sequence of steps in disguise.

Key characteristics: agents communicate through structured messages (a role, content, and optional function/tool-call payload) rather than through declared task inputs/outputs; a ConversableAgent's reply behavior is pluggable — it can call an LLM, execute code in a sandboxed environment, defer to a human, or run custom reply functions, and these can be chained; conversations have configurable **termination conditions** (a max number of turns, a specific phrase in a message, a custom function) because an open-ended conversation has no natural stopping point on its own; and code execution is a first-class citizen of the framework, not an add-on tool, reflecting AutoGen's origin in automating exactly the kind of "write code, run it, look at the output, fix it" loop a human developer performs. It is worth being upfront that AutoGen's architecture has evolved substantially — from the original single-package AutoGen, through a significant "AutoGen 0.4" rearchitecture into a layered Core/AgentChat/Extensions design, alongside a community-maintained fork (AG2) that split off after a governance disagreement — so treat any specific class name or import path in this page as illustrative of the framework's durable ideas rather than a permanently pinned API; always check current documentation before shipping.
`,

  history: `
AutoGen originated at **Microsoft Research** and was released as an open-source framework in **2023**, alongside a widely-read paper, "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation" (Wu et al., 2023), that formalized the conversation-driven multi-agent idea and demonstrated it across coding, question-answering, and decision-making tasks. It arrived in the same general period as CrewAI, LangGraph's early versions, and a wave of autonomous-agent experiments (AutoGPT, BabyAGI), all wrestling with the same underlying question — how do you get more than one LLM call to cooperate on a task larger than any single call can handle — but AutoGen's specific answer was to let agents talk to each other in a shared chat, mirroring how a team of human engineers might actually solve a problem over Slack.

| Year | Milestone |
|------|-----------|
| 2023 | Initial public release from Microsoft Research; the founding AutoGen paper formalizes ConversableAgent, multi-agent conversation, and code-execution-centric workflows |
| 2023-2024 | Rapid community adoption; GroupChat and GroupChatManager introduced for coordinating conversations among more than two agents; strong early use in coding-assistant and data-analysis workflows |
| 2024 | Governance tension within the community leads to **AG2** (originally "AutoGen" spelled differently in some community discussion), a community-maintained fork continuing development of the original architecture under separate stewardship, while Microsoft continues AutoGen development in parallel |
| Late 2024 - 2025 | Microsoft ships a substantial rearchitecture, informally called **AutoGen 0.4**, splitting the framework into a layered design: a low-level **Core** (event-driven, actor-model-style agent runtime), a higher-level **AgentChat** API (the more approachable, ConversableAgent-like layer most tutorials use), and **Extensions** for integrations — explicitly addressing feedback that the original single-layer design conflated a general-purpose agent runtime with a specific conversational-agent convenience API |
| 2025 | Continued development of both AutoGen (Microsoft) and AG2 (community fork) in parallel, with Microsoft also shipping **Magentic-One**, a related multi-agent system built on AutoGen's Core runtime aimed at general-purpose web/file/code task completion, illustrating the framework's role as an underlying substrate for higher-level agent products, not only a library end users wire up directly |

The AutoGen 0.4 rearchitecture is worth internalizing as a signal in its own right: it reflects the same lesson visible across the whole agent-framework space — a framework that starts as one convenient, opinionated layer (ConversableAgent doing everything: messaging, LLM calls, code execution, human-in-the-loop) tends to eventually split into a lower-level runtime plus a higher-level convenience API, once enough production users need more control over the runtime than the original single layer exposed. The CrewAI skill covers an analogous split (Flows arriving as a more deterministic layer above Crews); it is a recurring pattern, not an AutoGen-specific quirk.
`,

  "why-it-exists": `
Before conversation-driven frameworks like AutoGen, teams building multi-step, collaborative LLM workflows faced a narrower, less legible set of options:

1. **A single agent doing everything in one loop.** Asking one agent to plan, write code, execute it, critique its own output, and revise conflates several distinct cognitive modes into one context and one set of instructions — a pattern that tends to produce weaker self-critique than having a genuinely separate "critic" perspective, because a single model reasoning about its own output in the same context lacks the friction of an actually distinct viewpoint pushing back.
2. **Hand-rolled multi-call orchestration**, where an engineer writes bespoke Python to call an LLM, parse its output, decide whether to call it again, and manage state across calls — functional but reinventing the same plumbing (message history management, turn-taking logic, termination conditions) every team needs for any genuinely iterative, back-and-forth workflow.
3. **Rigid, declarative task pipelines** with no room for open-ended back-and-forth: fine when the division of labor and number of steps is known in advance, but a poor fit for workflows whose natural shape is "iterate until this is actually correct" — a coder and a code-executing critic going back and forth an unknown number of times until tests pass, for instance.

AutoGen existed to give that specific, recurring shape — an open-ended, potentially multi-turn conversation among two or more agents (and possibly a human), where the number of exchanges isn't fixed in advance and the point is for the agents' perspectives to genuinely interact — a first-class, general-purpose abstraction. Rather than modeling collaboration as a sequence of discrete tasks with declared inputs/outputs (CrewAI's model) or as a graph of nodes and edges you wire explicitly (LangGraph's model), AutoGen modeled it as a chat: agents send messages into a shared history, and any agent (or the human) can reply, making the framework a natural fit for the "write code, run it, see what breaks, fix it, repeat" workflow the original paper leaned on heavily as its motivating example.
`,

  "problem-it-solves": `
AutoGen removes concrete, recurring pains in building conversation-shaped, iterative multi-agent systems:

- **Ad hoc message-history management.** ConversableAgent tracks the running conversation per pair or group of agents automatically, so you don't hand-roll your own list-of-messages bookkeeping and prompt-assembly logic for every new multi-agent workflow.
- **Turn-taking and termination logic.** Deciding who speaks next (in a GroupChat) and when a conversation should stop (a max-turn count, a termination phrase like "TERMINATE," a custom check function) are first-class, configurable concerns rather than something every team re-implements from scratch.
- **Code execution as a native capability, not a bolted-on tool.** A UserProxyAgent can execute code blocks an AssistantAgent produces (in a sandboxed environment, ideally Docker-backed) and feed the results — including errors — back into the conversation automatically, which is exactly the "write, run, observe, fix" loop a human developer performs, without custom glue code per project.
- **Human-in-the-loop as a configurable spectrum, not an all-or-nothing switch.** A UserProxyAgent's human_input_mode can require human approval on every turn, only when the agent is uncertain, or never (fully automated) — letting the same agent definitions serve prototyping (heavy human oversight) and production automation (none) without rewriting the workflow.
- **A general substrate for "agents cooperating via dialogue"** applicable well beyond coding — debate/critique patterns, multi-perspective analysis, negotiation-style workflows — where the useful signal genuinely comes from distinct agents' perspectives colliding, not from executing a known sequence of tasks.

What AutoGen deliberately does **not** solve, or solves only partially:

- **Guaranteed termination or bounded cost.** An open-ended conversation has no natural stopping point; without carefully configured termination conditions, AutoGen conversations can loop indefinitely (or until an arbitrary max-turn ceiling), burning tokens with no guarantee of convergence — this is arguably the single most important operational caveat of the whole framework, covered at length in Anti-Patterns and Common Mistakes.
- **Precise, deterministic control flow.** If your workflow is really a fixed sequence of known steps, or needs exact conditional branching over explicit state, a graph-first tool like LangGraph gives you that control directly; AutoGen's conversational model trades that precision for flexibility, and forcing a deterministic pipeline into a conversational frame usually adds unpredictability without a corresponding benefit.
- **Guaranteed productive disagreement.** Multiple agents "talking" does not automatically produce useful critique — left unguided, two LLM-backed agents frequently agree with each other quickly and confidently regardless of whether the shared conclusion is actually correct, a well-documented failure mode discussed under Advanced Concepts and Anti-Patterns.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain AutoGen's conversation-driven mental model and how it differs from CrewAI's role/task/process model and LangGraph's explicit graph/state-machine model.
2. Construct a ConversableAgent, and explain how AssistantAgent and UserProxyAgent specialize it for LLM-driven reasoning versus human/code-execution representation respectively.
3. Configure code execution safely (sandboxed, ideally Docker-backed) and trace how generated code, its execution result, and any errors flow back into the conversation.
4. Configure human-in-the-loop behavior via human_input_mode and explain the tradeoffs of each setting across prototyping and production.
5. Wire a GroupChat with a GroupChatManager for conversations among more than two agents, and reason about speaker-selection strategies.
6. Configure termination conditions correctly, and explain why an unbounded conversation is a real operational risk, not a theoretical one.
7. Diagnose and prevent the two classic conversation-driven failure modes: conversations that loop without terminating, and agents converging on agreement without genuine progress.
8. Reason honestly about AutoGen's layered architecture (Core, AgentChat, Extensions) and the existence of the AG2 community fork, and know that exact APIs have shifted across versions.
9. Decide, for a concrete scenario, whether conversation-driven orchestration is worth its unpredictability and cost compared to CrewAI's task-based model, LangGraph's graph model, or a single well-tooled agent.
10. Operate an AutoGen-based system in production: cost/turn-count monitoring, timeouts, sandboxed code execution, and a testing strategy for non-deterministic multi-turn conversations.
`,

  prerequisites: `
- **Required**: comfortable Python (classes, async, context managers — see the **Python** skill); a solid understanding of the single-agent reason-act-observe loop and tool/function calling — see the **Agent Fundamentals** and **Tool Calling** skills first, since every AutoGen agent's individual turn is fundamentally that same loop, just embedded in a multi-agent conversation.
- **Required conceptually**: what a chat-completion message history is (role, content, optional function-call payload) — AutoGen's entire mental model is built directly on top of that primitive, extended to more than two participants.
- **Strongly recommended**: the **Planning** skill, since GroupChat speaker-selection and multi-agent task decomposition overlap heavily with general agentic-planning concerns and failure modes.
- **Strongly recommended**: the **Reflection** skill, since AutoGen's critic/reviewer conversational patterns (an agent that checks another agent's work and asks for revisions) are a direct application of the reflection pattern, and understanding reflection's known limits (agents that "agree" rather than genuinely critique) directly explains one of AutoGen's most cited failure modes.
- **Helpful for the comparisons section**: the **CrewAI**, **LangGraph**, and **OpenAI Agents SDK** skills — this page assumes at least a skim of those alternatives so the comparison table and honest tradeoff discussion land rather than reading as unfamiliar jargon.
- **Helpful, if you plan to enable code execution**: basic familiarity with Docker, since sandboxed code execution is the responsible default and unsandboxed local execution is a real security risk covered in Security.

Dependency chain on this platform: **Python** → **Tool Calling** → **Agent Fundamentals** → **Planning** / **Reflection** → **this page** → **CrewAI** / **LangGraph** / **OpenAI Agents SDK** for the broader multi-agent orchestration landscape.
`,

  "beginner-concepts": `
### ConversableAgent: the foundational primitive

Every agent in AutoGen is, underneath, a **ConversableAgent** — an object that can send and receive messages, and that has pluggable logic for how it generates a reply (an LLM call, executing code, asking a human, or a custom function):

~~~python
from autogen import ConversableAgent

agent = ConversableAgent(
    name="generic_agent",
    system_message="You are a helpful assistant.",
    llm_config={"config_list": [{"model": "gpt-4o-mini"}]},
    human_input_mode="NEVER",   # never pause for a human reply
)
~~~

In practice you rarely instantiate a bare ConversableAgent directly for a full workflow — you use one of its two common specializations, AssistantAgent and UserProxyAgent — but understanding that both are built on the same base class explains why they can talk to each other symmetrically: an AssistantAgent's "send" and a UserProxyAgent's "receive" are the same underlying mechanism.

### AssistantAgent: the LLM-backed reasoner

~~~python
from autogen import AssistantAgent

assistant = AssistantAgent(
    name="assistant",
    system_message=(
        "You are a helpful AI coding assistant. Write Python code to "
        "solve the given task. Reply 'TERMINATE' when the task is "
        "fully complete and verified."
    ),
    llm_config={"config_list": [{"model": "gpt-4o-mini"}]},
)
~~~

An AssistantAgent's default reply behavior is an LLM call: given the conversation so far, generate the next message. It does not execute code itself — by design, AutoGen splits "propose code" (the assistant's job) from "run code" (the user proxy's job), mirroring a real code-review-style separation of concerns.

### UserProxyAgent: the human/executor stand-in

~~~python
from autogen import UserProxyAgent

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",   # ask a human only when the
                                     # conversation looks like it's ending
    max_consecutive_auto_reply=10,  # hard cap on automatic replies
    code_execution_config={
        "work_dir": "coding",
        "use_docker": True,          # sandboxed execution — do not
                                      # disable this outside a trusted
                                      # local dev environment
    },
    is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", ""),
)
~~~

A UserProxyAgent represents either a real human (pausing for input according to human_input_mode) or an automated stand-in that can execute code blocks the assistant proposes and feed the result — stdout, stderr, or an exception traceback — back into the conversation as its next message.

### Your first two-agent conversation

~~~python
result = user_proxy.initiate_chat(
    assistant,
    message="Write and run Python code to compute the 20th Fibonacci "
            "number, then confirm the result.",
)
~~~

Tracing this: user_proxy sends the task message; assistant replies with a proposed Python code block; user_proxy (with code_execution_config set) automatically extracts and runs that code in the sandbox, and sends the execution result back as its next message; assistant reads the result, and either confirms success (replying with a message containing "TERMINATE") or proposes a fix if something went wrong. This loop — propose, execute, observe, revise — repeats until a termination condition fires or max_consecutive_auto_reply is hit.

### Why this differs from a single agent with a code-execution tool

A single agent with a "run Python" tool can, in principle, do the same propose-execute-observe-revise loop internally. AutoGen's two-agent split makes that loop's structure explicit and inspectable at the message level (you can see exactly what was proposed, what was executed, and what came back, as discrete conversation turns) and cleanly separates "who is allowed to execute code" (the user proxy, which can also gate on human approval) from "who proposes code" (the assistant, which never executes anything itself) — a separation of concerns worth preserving even when you could technically collapse it into one agent with a tool.
`,

  "intermediate-concepts": `
### Configuring code execution safely

~~~python
from autogen import UserProxyAgent
from autogen.coding import DockerCommandLineCodeExecutor

executor = DockerCommandLineCodeExecutor(
    image="python:3.12-slim",
    timeout=60,               # hard wall-clock cap per code execution
    work_dir="coding",
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    code_execution_config={"executor": executor},
)
~~~

The newer executor-object pattern (rather than a bare use_docker flag) makes the sandbox an explicit, inspectable, swappable component — you can point it at a container image with exactly the dependencies your workflow needs, and set a timeout that bounds how long any single generated snippet is allowed to run, which matters directly once code execution is driven by an LLM's own (occasionally buggy, occasionally slow) output rather than a human's.

### GroupChat: conversations among more than two agents

~~~python
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

coder = AssistantAgent(
    name="coder",
    system_message="You write Python code to solve the given task.",
    llm_config={"config_list": [{"model": "gpt-4o-mini"}]},
)
critic = AssistantAgent(
    name="critic",
    system_message=(
        "You review the coder's code and test results critically. "
        "Point out concrete bugs, edge cases, or style issues; do not "
        "simply agree if there is anything left to improve. Reply "
        "'LGTM' only once the solution is genuinely complete."
    ),
    llm_config={"config_list": [{"model": "gpt-4o-mini"}]},
)
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    code_execution_config={"executor": executor},
)

groupchat = GroupChat(
    agents=[user_proxy, coder, critic],
    messages=[],
    max_round=12,                       # hard ceiling on total turns
    speaker_selection_method="auto",    # an LLM decides who speaks next
)
manager = GroupChatManager(
    groupchat=groupchat,
    llm_config={"config_list": [{"model": "gpt-4o-mini"}]},
)

user_proxy.initiate_chat(
    manager,
    message="Write a function that returns the nth Fibonacci number "
            "efficiently, with tests, and have the critic review it.",
)
~~~

The GroupChatManager is itself an agent whose job is orchestration: on each round, it decides (via speaker_selection_method) which agent in the roster speaks next, based on the conversation so far. speaker_selection_method="auto" delegates that choice to an LLM call, which is flexible but adds its own cost and unpredictability per round — round_robin (a fixed rotation) and manual (human-selected) are more predictable, cheaper alternatives worth defaulting to once a workflow's roster is stable and speaking order doesn't genuinely need to be dynamic.

### Termination conditions

~~~python
def is_termination_msg(msg: dict) -> bool:
    content = msg.get("content", "") or ""
    return "TERMINATE" in content or "LGTM" in content

user_proxy = UserProxyAgent(
    name="user_proxy",
    is_termination_msg=is_termination_msg,
    max_consecutive_auto_reply=10,   # circuit breaker even if the
                                      # termination phrase never appears
)
~~~

Every AutoGen conversation needs an explicit way to stop: a termination phrase check (is_termination_msg), a hard turn ceiling (max_consecutive_auto_reply on an agent, or max_round on a GroupChat), or both together. Relying on a termination phrase alone is fragile — an LLM can fail to emit it, paraphrase it, or emit it prematurely — so production systems should always pair a phrase-based check with a hard numeric ceiling as a circuit breaker.

### Custom reply functions

~~~python
def custom_reply(recipient, messages, sender, config):
    last_message = messages[-1]["content"]
    if "urgent" in last_message.lower():
        return True, "Escalating to a human reviewer immediately."
    return False, None   # fall through to the agent's default reply logic

user_proxy.register_reply(
    [AssistantAgent, None],
    custom_reply,
    position=0,   # checked before the default LLM-based reply logic
)
~~~

register_reply lets you insert arbitrary Python logic into an agent's reply pipeline, checked in a defined order before falling back to the agent's default behavior — a common escape hatch for injecting business logic (routing, escalation, deterministic short-circuits) into what would otherwise be a purely LLM-driven conversation.

### Nested chats

An agent can, mid-conversation, kick off an entirely separate sub-conversation with a different set of agents and fold the result back in as its own reply — useful for a "consult a specialist sub-team, then continue the main conversation" pattern without permanently adding that specialist to the main roster. This is functionally similar to CrewAI composing smaller crews via a Flow, or a LangGraph subgraph — the recurring lesson being that nearly every multi-agent framework eventually needs a way to compose smaller conversations/graphs/crews into a larger pipeline, rather than putting every participant into one flat, ever-growing roster.
`,

  "advanced-concepts": `
### The 0.4 layered architecture: Core, AgentChat, Extensions

Microsoft's AutoGen rearchitecture split the framework into three layers, and understanding the split clarifies a lot about what each part is actually for:

- **Core** — a lower-level, event-driven, actor-model-style runtime for agents that pass typed messages asynchronously, with no built-in assumption that "agent" means "LLM-backed chat participant." It exists so teams needing tighter control over the messaging runtime (custom routing, distributed execution, non-chat agent types) aren't stuck fighting a framework that only understands conversational agents.
- **AgentChat** — the higher-level, approachable API most tutorials and this page's examples use: AssistantAgent, UserProxyAgent-equivalents, and GroupChat-style conversation patterns, built on top of Core. This is the layer that preserves the original ConversableAgent-style developer experience.
- **Extensions** — integrations (model providers, tools, code executors) that plug into either layer.

The practical upshot: if you're prototyping a conversational multi-agent workflow, you almost certainly want the AgentChat layer (or the community AG2 fork's equivalent, since AG2 continued the pre-0.4 architecture's philosophy under separate stewardship); reach for Core directly only once you have a concrete need — a non-chat agent topology, distributed deployment, custom message-routing logic — that AgentChat's opinionated conversational model doesn't accommodate.

### Diagnosing "conversations that loop without terminating"

This is the single most commonly reported operational AutoGen failure mode. Root causes, in rough order of frequency: (1) the termination-phrase check depends on an exact string the LLM sometimes fails to emit, paraphrases, or emits inside a larger sentence that a naive substring check misses; (2) no hard numeric ceiling (max_round / max_consecutive_auto_reply) is set at all, so a phrase-matching miss has no backstop; (3) a critic-style agent is instructed to "keep reviewing until perfect" with no operational definition of "perfect," so it can always find one more nitpick. The fix is layered, not single-point: always pair a termination-phrase check with a numeric ceiling, make the termination criterion in the system message as concrete and checkable as possible ("reply LGTM once all tests pass and no obvious bugs remain" rather than "reply LGTM when you are satisfied"), and log every conversation's actual turn count in production so silent creep toward the ceiling is visible before it becomes a cost incident.

### Diagnosing "agents agreeing with each other without real progress"

Two LLM-backed agents in conversation, especially when both are instructed to be broadly agreeable or lack a genuinely distinct perspective, frequently converge on shared conclusions quickly and confidently regardless of correctness — the multi-agent equivalent of groupthink, and closely related to the general limits of the reflection pattern covered in the **Reflection** skill (a model critiquing its own or a similar model's output does not reliably catch errors it wouldn't have caught reasoning alone). Signs this is happening: a critic agent's feedback across turns gets shorter and more generic ("looks good," "LGTM") rather than more specific as the conversation proceeds; the conversation terminates in very few rounds regardless of task difficulty; independently checking the final output against a ground truth or test suite reveals bugs the "critic" agent never flagged. Mitigations: give the critic agent an explicit, external, checkable rubric or test suite to run rather than relying on its own subjective judgment; use a genuinely different model (or a differently-prompted persona with real adversarial incentive, e.g. "your job is to find at least one concrete issue before approving") for the critic than for the producer; and, most reliably, wire in an actual external verifier (running tests, a static analyzer, a schema validator) rather than trusting a second LLM call to substitute for one.

### Cost blowup from long group chats

Every additional agent in a GroupChat and every additional round multiplies LLM calls, and speaker_selection_method="auto" adds a further LLM call per round just to decide who speaks next — a five-agent GroupChat with auto speaker selection running for ten rounds is easily dozens of LLM calls for what a well-scoped two-agent or single-agent design might accomplish in a handful. The senior habit: default to the smallest roster and the most restrictive speaker-selection method (round_robin, or an explicit allowed_or_disallowed_speaker_transitions constraint) that still accomplishes the task, and treat "auto" selection and an unconstrained large roster as choices that must be justified by a measured quality improvement, not adopted by default.

### Constraining speaker transitions

~~~python
groupchat = GroupChat(
    agents=[user_proxy, coder, critic],
    messages=[],
    max_round=12,
    speaker_selection_method="auto",
    allowed_or_disallowed_speaker_transitions={
        user_proxy: [coder],     # user_proxy's message always goes to coder next
        coder: [critic],         # coder's output always goes to critic next
        critic: [coder, user_proxy],  # critic can send back to coder or end via user_proxy
    },
    speaker_transitions_type="allowed",
)
~~~

Explicitly constraining which transitions are legal converts a fully emergent conversation into something closer to a lightweight state machine layered on top of the conversational model — a pragmatic middle ground when you know the rough shape of who should talk to whom but still want the LLM (rather than a rigid schedule) to decide message content and exact timing within that structure. Teams that find fully unconstrained auto speaker-selection too unpredictable in production frequently converge on exactly this pattern, which is functionally moving toward LangGraph's philosophy of explicit control without fully abandoning AutoGen's conversational primitives.

### Decision table: when conversation-driven orchestration earns its cost

| Situation | Recommendation |
|-----------|-----------------|
| The task's value genuinely comes from iterative back-and-forth (coder/critic, debate, negotiation) with an unknown number of rounds | AutoGen's conversational model is a strong fit |
| The division of labor and step order are known in advance | A CrewAI-style task pipeline or a LangGraph graph will be cheaper and more predictable |
| You need code generated, executed, and iteratively fixed based on real execution feedback | AutoGen's assistant/user-proxy code-execution loop is purpose-built for exactly this |
| More than two or three agents need to participate with a fluid, dynamic speaking order | GroupChat with auto selection — but budget for real cost, and consider constraining transitions |
| The "conversation" is really just three fixed steps in sequence | A fixed pipeline (CrewAI sequential process, or plain code) will be simpler and cheaper than modeling it as a chat |
| Two agents keep agreeing quickly regardless of task difficulty | Add an external verifier (tests, rubric, schema check); don't trust a second LLM call alone as your quality gate |
`,

  "internal-working": `
Tracing what actually happens inside a two-agent AutoGen conversation with code execution, step by step:

~~~mermaid
flowchart TB
    S["user_proxy.initiate_chat(assistant, message)"] --> M1["Message 1: task description\nadded to shared history"]
    M1 --> R1["assistant.generate_reply()\n-> LLM call over full history"]
    R1 --> M2["Message 2: assistant's reply\n(may include a code block)"]
    M2 --> C{"Does user_proxy's config\nauto-execute code?"}
    C -->|yes| EX["Extract code block,\nrun in sandbox (Docker),\ncapture stdout/stderr/exception"]
    EX --> M3["Message 3: execution result\nadded to shared history"]
    M3 --> T{"is_termination_msg(M2)\nor max_consecutive_auto_reply\nreached?"}
    C -->|no| H["Ask human for input\n(human_input_mode)"]
    H --> M3
    T -->|no| R1
    T -->|yes| END["Conversation ends;\nfinal ChatResult returned"]
~~~

Step by step:

1. **initiate_chat** sends the first message into a shared, ordered message history that both agents can see in full on every subsequent turn — there is no per-agent private context by default; both participants reason over the same growing transcript.
2. **generate_reply** is called on the receiving agent, which (for an AssistantAgent) means an LLM call over the entire conversation history so far, formatted as a standard chat-completions-style message list.
3. If the reply contains a recognizable code block and the receiving agent (typically the UserProxyAgent) is configured for code execution, that code is extracted and run in the configured executor (ideally a Docker sandbox with a timeout), and its result — including any exception traceback — becomes the next message in the shared history.
4. If code execution isn't configured or applicable, and human_input_mode calls for it, the framework pauses for real human input, which likewise becomes the next message.
5. Before generating the next reply, the framework checks termination conditions: is_termination_msg against the most recent message, and/or whether a turn-count ceiling (max_consecutive_auto_reply, or max_round in a GroupChat) has been reached. If not terminated, control returns to generate_reply on the other participant, and the loop continues.
6. On termination, initiate_chat returns a ChatResult object containing the full message history, a summary (optionally LLM-generated), and cost/usage information for the whole conversation.

For a **GroupChat**, the same loop runs with one additional step inserted before each reply: the GroupChatManager consults its speaker_selection_method (an LLM call for "auto", a fixed rotation for "round_robin", a human prompt for "manual", or a constraint check against allowed_or_disallowed_speaker_transitions) to decide which agent in the roster generates the next reply, meaning a GroupChat's per-round cost is strictly higher than a two-agent conversation's, since the speaker-selection decision itself frequently costs an LLM call.
`,

  architecture: `
### Runtime architecture

~~~mermaid
flowchart TB
    subgraph Convo["Conversation"]
        Hist["Shared message history\n(role, content, function/tool payload)"]
        subgraph Agents["Participants"]
            AA["AssistantAgent\n(LLM-backed reasoner)"]
            UP["UserProxyAgent\n(human/code-executor stand-in)"]
            GCM["GroupChatManager\n(speaker selection, 3+ agents)"]
        end
    end
    Agents -->|read/append| Hist
    UP -->|extract + run| Executor["Code executor\n(Docker sandbox, timeout)"]
    Executor -->|stdout/stderr/exception| Hist
    UP -.->|human_input_mode| Human["Human operator"]
    AA -->|chat/completion| LLMProv["LLM provider(s)"]
    GCM -->|chat/completion, if auto| LLMProv
    Convo --> Result["ChatResult:\nfull history + summary + usage/cost"]
~~~

The key architectural insight, mirrored across nearly every multi-agent framework covered on this platform: an AssistantAgent's or UserProxyAgent's individual turn is the same single-agent generate-a-reply step you'd build for a standalone agent — AutoGen's value-add is entirely in how it manages the shared conversation history, turn-taking, termination, and (optionally) code execution and human input across multiple such steps, not in a fundamentally different per-agent execution primitive.

### Application layout for a production AutoGen service

~~~
codeassist/
├── pyproject.toml
├── src/codeassist/
│   ├── agents.py            # AssistantAgent/UserProxyAgent definitions
│   ├── groupchat.py         # GroupChat/GroupChatManager wiring,
│   │                        # speaker-transition constraints
│   ├── termination.py       # is_termination_msg logic + numeric ceilings
│   ├── executors/           # sandboxed code-executor configuration
│   ├── reply_functions/     # custom register_reply business logic
│   ├── api/                 # FastAPI routes exposing /converse
│   └── evaluation/          # golden-set tests over full conversations
└── tests/
~~~

A recurring, hard-won production lesson (echoed across AutoGen, CrewAI, and LangGraph users alike): keep conversation rosters small and speaker-selection as constrained as the task allows (round_robin or explicit transition rules over unconstrained "auto" selection), and compose larger workflows out of smaller, well-scoped conversations (via nested chats or plain orchestration code) rather than building one large, ever-growing GroupChat with many participants and open-ended speaker selection.
`,

  "data-flow": `
Tracing one GroupChat conversation end to end — a coder, a critic, and a code-executing user proxy collaborating on a small function, with the manager selecting speakers — as a sequence diagram:

~~~mermaid
sequenceDiagram
    participant Caller
    participant UP as UserProxyAgent
    participant GCM as GroupChatManager
    participant Coder as AssistantAgent: Coder
    participant Critic as AssistantAgent: Critic
    participant Exec as Code Executor
    participant LLM as LLM API

    Caller->>UP: initiate_chat(manager, message="write + test fib(n)")
    UP->>GCM: message 1 (task)
    GCM->>LLM: select next speaker
    LLM-->>GCM: "coder"
    GCM->>Coder: generate_reply(history)
    Coder->>LLM: reasoning + code generation
    LLM-->>Coder: proposed code block
    Coder-->>GCM: message 2 (code)
    GCM->>LLM: select next speaker
    LLM-->>GCM: "user_proxy"
    GCM->>UP: generate_reply(history)
    UP->>Exec: run extracted code (sandboxed, timeout)
    Exec-->>UP: stdout/stderr/exception
    UP-->>GCM: message 3 (execution result)
    GCM->>LLM: select next speaker
    LLM-->>GCM: "critic"
    GCM->>Critic: generate_reply(history)
    Critic->>LLM: review code + result against a rubric
    LLM-->>Critic: feedback or "LGTM"
    Critic-->>GCM: message 4 (feedback)
    GCM-->>UP: is_termination_msg(message 4)?
    UP-->>Caller: ChatResult (if terminated) or loop continues
~~~

The most misunderstood part is that every arrow into an LLM box — including the speaker-selection call itself when using "auto" — is a separate network call with its own latency and cost, and a GroupChat's total cost scales with (number of rounds) times (roughly one reply call plus, for auto selection, one selection call) — a twelve-round GroupChat with three agents and auto selection can easily mean twenty or more LLM calls before a task is judged complete, which is the concrete, unavoidable cost side of the "let agents converse" pattern that must be weighed against its flexibility benefit for every use case (see Comparisons and Anti-Patterns).
`,

  "production-usage": `
### A minimal but production-shaped two-agent coding conversation

~~~python
from autogen import AssistantAgent, UserProxyAgent
from autogen.coding import DockerCommandLineCodeExecutor

llm_config = {
    "config_list": [{"model": "gpt-4o-mini", "timeout": 30}],
    "temperature": 0.2,
}

assistant = AssistantAgent(
    name="assistant",
    system_message=(
        "You write correct, tested Python code. Reply exactly "
        "'TERMINATE' on its own line once tests pass and the task "
        "is fully complete."
    ),
    llm_config=llm_config,
)

executor = DockerCommandLineCodeExecutor(
    image="python:3.12-slim",
    timeout=60,
    work_dir="coding",
)

def is_termination_msg(msg: dict) -> bool:
    return "TERMINATE" in (msg.get("content") or "")

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=8,   # hard circuit breaker
    code_execution_config={"executor": executor},
    is_termination_msg=is_termination_msg,
)

try:
    result = user_proxy.initiate_chat(
        assistant,
        message="Write a function fib(n) with unit tests, run the "
                "tests, and fix any failures.",
    )
except Exception as exc:
    # A conversation is not transactional — several turns (and their
    # cost) may have already happened even if the final call fails.
    raise RuntimeError(f"AutoGen conversation failed: {exc}") from exc

print(result.summary)
print(result.cost)
~~~

Non-negotiables for production:

1. **Always sandbox code execution** (Docker-backed executor, never bare local execution) — an LLM-generated snippet is untrusted input, and running it directly on a host process is a real security risk, not a hypothetical one (see Security).
2. **Set a per-call LLM timeout and a per-execution sandbox timeout** — a hung LLM call or an infinite-looping generated script otherwise stalls the whole conversation indefinitely.
3. **Always pair a termination-phrase check with a hard numeric ceiling** (max_consecutive_auto_reply, max_round) — never rely on the LLM reliably emitting a termination string as the sole stopping mechanism.
4. **Prefer the smallest agent roster and the most constrained speaker-selection method** that accomplishes the task — default away from large, auto-selected GroupChats until a smaller design is proven insufficient.
5. **Log full conversation transcripts and per-conversation cost**, since debugging a multi-turn, multi-agent failure without the transcript means guessing rather than diagnosing (see Debugging and Monitoring).
`,

  "industry-examples": `
- **Software engineering / coding-assistant tooling** is AutoGen's most natural and heavily documented fit: a coder agent and a code-executing user-proxy agent iterating on a task until tests pass, closely mirroring the original AutoGen paper's own motivating examples and reflected widely in community tutorials and internal developer-productivity tools built on the framework.
- **Data analysis and notebook-style automation**, where an assistant agent writes and iteratively fixes data-processing or plotting code against a user proxy that executes it and reports back errors or output, letting a data-analysis workflow self-correct without a human manually running each cell.
- **Microsoft's own Magentic-One**, a multi-agent system for general web/file/code task completion built on AutoGen's Core runtime, is a direct, named example of AutoGen serving as the underlying substrate for a higher-level, product-facing agent system rather than only being used directly by end-developers.
- **Research and internal automation teams** exploring debate-style or critic/producer conversational patterns for tasks like report drafting or decision analysis, using AutoGen's conversational primitives specifically because the value sought is genuine multi-perspective back-and-forth rather than a known division of labor.
- **Internal developer-tooling teams** building "explain this bug, propose a fix, run the tests" assistants on top of AutoGen's code-execution-centric agent pair, valuing the framework's native code-execution loop over hand-rolling one.

Pattern to notice: the common thread across the strongest adopters is a workflow whose natural shape really is iterative and open-ended — write code, run it, see what breaks, fix it, repeat an a priori unknown number of times — rather than a fixed sequence of steps; teams that force a known, fixed pipeline into AutoGen's conversational frame tend to pay for its flexibility (unpredictability, extra LLM calls for turn-taking) without a corresponding benefit (see Anti-Patterns).
`,

  "best-practices": `
1. **Start with the smallest conversation that could work.** A two-agent (assistant + user proxy) conversation is cheaper, more predictable, and easier to debug than a multi-agent GroupChat; only add participants once you can name a concrete role a third or fourth agent fills that the existing pair genuinely cannot.
2. **Always pair a termination-phrase check with a numeric ceiling.** Never trust an LLM to reliably emit an exact termination string as the sole stopping mechanism — max_consecutive_auto_reply or max_round is a mandatory circuit breaker, not an optional safety net.
3. **Sandbox all code execution, always.** Use a Docker-backed executor with an explicit timeout; never run LLM-generated code directly on a host process outside a fully trusted, throwaway local environment.
4. **Give critic-style agents an external, checkable rubric or test suite**, not just an instruction to "review carefully" — subjective LLM-to-LLM review is the leading cause of agents agreeing with each other without genuinely verifying correctness.
5. **Prefer round_robin or explicit allowed_or_disallowed_speaker_transitions over unconstrained "auto" speaker selection** once a workflow's rough shape is known — auto selection adds a real per-round LLM call and a real unpredictability cost that's often unjustified.
6. **Set explicit, per-call LLM timeouts and per-execution sandbox timeouts.** A hung reasoning call or a runaway generated script otherwise stalls or indefinitely runs within a conversation that has no other backstop.
7. **Log full conversation transcripts and per-conversation cost/turn-count**, not just the final summary — multi-agent, multi-turn debugging without the transcript is guesswork.
8. **Use a genuinely distinct model, persona, or external verifier for a critic than for the agent it's critiquing.** A same-model, similarly-prompted "critic" rarely catches errors the producer itself wouldn't have caught reasoning alone.
9. **Treat every conversation as non-transactional.** Several turns — and their cost, and any code they executed — may have already happened before a later turn fails; design retry/resume logic around the partial transcript, not a full restart by default.
10. **Evaluate at the conversation level against a golden set**, not only by eyeballing a handful of transcripts — non-deterministic multi-turn conversations need the same rigorous evaluation discipline as any other LLM system (see the AI Evals skill).
11. **Justify conversation-driven orchestration in writing before choosing it.** If the workflow's division of labor and step count are actually known in advance, a CrewAI-style task pipeline or a LangGraph graph will very likely be cheaper and more predictable — write down why the task's open-endedness specifically needs a conversational model.
12. **Keep an eye on the layered-architecture question.** If you find yourself fighting AgentChat's conversational assumptions to express a non-chat agent topology or custom routing, consider whether the Core layer (or a different framework entirely) is a better fit rather than forcing the conversational abstraction.
`,

  "anti-patterns": `
### Unbounded GroupChat with only a termination phrase and no ceiling

~~~python
# WRONG: no max_round, no max_consecutive_auto_reply, relying purely
# on the LLM reliably emitting "TERMINATE" — a paraphrase, an omission,
# or a premature emission all produce either a runaway conversation
# or a silently truncated one.
groupchat = GroupChat(
    agents=[user_proxy, coder, critic, planner, reviewer],
    messages=[],
    speaker_selection_method="auto",
    # max_round missing!
)

# RIGHT: always pair a phrase check with a hard numeric ceiling, and
# keep the roster as small as the task actually requires.
groupchat = GroupChat(
    agents=[user_proxy, coder, critic],
    messages=[],
    max_round=12,
    speaker_selection_method="round_robin",
)
~~~

### Other production-grade anti-patterns

- **Using a GroupChat where a fixed two-step pipeline would do.** If the roster and speaking order are actually known and fixed in advance, modeling it as a conversation with auto speaker selection adds cost (a selection LLM call per round) and unpredictability with no corresponding benefit over a plain sequential pipeline or a two-agent conversation.
- **A critic agent instructed only to "review carefully" with no external rubric.** Subjective LLM-to-LLM review reliably produces quick, confident agreement regardless of correctness; wire in an actual test suite, schema check, or explicit checklist the critic must run against.
- **Running LLM-generated code unsandboxed** "just for a quick local test" — this habit reliably migrates into less-careful environments over time and is a genuine security risk, not merely bad hygiene (see Security).
- **Treating a conversation's summary as ground truth without checking the full transcript** during debugging — the LLM-generated summary can itself omit or misrepresent what actually happened in the conversation, especially around errors that were eventually resolved.
- **Letting a GroupChat's roster grow agent-by-agent over time** without review, the conversational-framework equivalent of CrewAI's "crew creep" — each additional participant adds cost and unpredictability that should be a deliberate tradeoff, not silent drift.
- **Treating a multi-turn conversation as deterministic enough for exact-match testing.** Non-deterministic, multi-agent conversational output varies run to run; test structural and outcome properties (did the tests actually pass, was a specific bug actually fixed), not exact transcript text.
- **No timeout on either the LLM calls or the code executor.** A hung API call or an infinite-looping generated script otherwise blocks the whole conversation with no automatic recovery.
`,

  performance: `
### Measure first

~~~python
result = user_proxy.initiate_chat(assistant, message="...")

print(result.cost)              # per-model token/cost breakdown
print(len(result.chat_history))  # actual turn count for this run
~~~

Inspect the actual turn count and cost breakdown per conversation, not just an assumed steady-state estimate — in practice, a small fraction of conversations (those that hit a bug the assistant struggles to fix, or a critic that keeps finding nitpicks) account for a disproportionate share of total cost, and averages hide that tail.

### The optimization hierarchy (apply in order)

1. **Reduce the agent roster and round ceiling to the minimum that genuinely needs conversational back-and-forth.** Every additional agent or round is a full additional LLM round trip (or two, counting speaker selection in a GroupChat); this is the single biggest lever, larger than any per-call optimization.
2. **Prefer round_robin or explicit speaker-transition constraints over "auto" selection** once the workflow's rough shape is known — auto selection's own LLM call, per round, is pure overhead once you no longer need dynamic speaker choice.
3. **Use a smaller/faster model for simpler roles** (a code-executing user proxy's own reasoning needs, if any, are usually lighter than an assistant actually generating and revising code) and reserve the most capable model for the role that most needs it.
4. **Cache or reuse sandbox containers across runs** where safe to do so, since Docker container startup can dominate latency for short code-execution turns if a fresh container is spun up every single time.
5. **Bound iteration explicitly** (max_consecutive_auto_reply, max_round) so a confused conversation's cost has a hard ceiling rather than an open-ended one, treating this as a performance lever as much as a safety one.
6. **Trim system messages and avoid re-stating large, static context on every turn** where the underlying model/provider supports prompt caching, since a growing conversation history means every subsequent LLM call re-processes an ever-larger prompt.
7. **Run independent conversations concurrently** (separate initiate_chat calls for genuinely unrelated sub-tasks) rather than serializing work that doesn't actually depend on shared conversational state.

### Numbers worth internalizing

A GroupChat's end-to-end cost is roughly (number of rounds) times (one reply call, plus one additional selection call per round under "auto" selection), so a modest twelve-round, three-agent auto-selected GroupChat can easily mean twenty-plus LLM calls for a single task — several times what a well-scoped two-agent conversation, or a single well-tooled agent, would cost for the same outcome. That multiplier is the concrete number to weigh against conversational flexibility before choosing a large, auto-selected roster (see Comparisons).
`,

  scalability: `
AutoGen itself is a coordination layer over LLM providers, code-execution sandboxes, and (optionally) human input; scalability is mostly a property of those dependencies and how conversations are scheduled as a workload.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["Conversation-serving API replica 1"]
    LB --> API2["Conversation-serving API replica N"]
    API1 & API2 --> LLMProv["LLM provider(s)\n(rate limits apply per key/account)"]
    API1 & API2 --> Sandbox["Code-execution sandbox pool\n(Docker containers, per-conversation or pooled)"]
    Queue["Job queue"] --> Workers["Async conversation workers"]
    Workers --> LLMProv
    Workers --> Sandbox
~~~

### Scaling the request path

- **Horizontal**: conversation-serving API replicas are stateless per request (given shared LLM credentials and a shared or per-replica sandbox pool), so scale them like any stateless service behind a load balancer — the same pattern used for single-agent or CrewAI services.
- **The real bottleneck is almost always LLM API rate limits, per-call latency, and sandbox container startup/teardown time**, multiplied by however many rounds and speaker-selection calls a given conversation involves — a twelve-round GroupChat consumes several times the rate-limit and compute budget of a single-agent call for the same request.
- **Long-running, open-ended conversations (especially large GroupChats with auto selection or human-in-the-loop pauses) are a poor fit for a synchronous request/response API** — move them to an async job queue with a polling or webhook-based result delivery, the same pattern used for any long-running agentic workload.
- **Sandbox container lifecycle matters at scale**: spinning up a fresh Docker container per code-execution turn is safe but can add meaningful latency under load; a pooled, pre-warmed sandbox pool (with careful isolation between conversations) trades some operational complexity for materially lower per-turn latency.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| LLM rate limits under conversation fan-out | Route different agents to different models/providers/keys where feasible; queue and backoff rather than fail |
| Long GroupChat latency | Prefer round_robin/constrained transitions over auto selection; move long conversations to async job execution |
| Sandbox container startup dominating turn latency | Use a pooled, pre-warmed executor pool with strict per-conversation isolation |
| Cost scaling with roster size and round ceiling | Audit roster size and max_round regularly; merge or remove agents whose role doesn't earn its keep |
| Unbounded conversations consuming capacity | Enforce max_consecutive_auto_reply/max_round and pair with a robust termination-phrase check |
`,

  security: `
### AutoGen-specific attack surface

1. **Unsandboxed code execution.** AutoGen's core value proposition includes letting an LLM-proposed code snippet actually run; if that execution happens directly on a host process rather than in an isolated container, a buggy or maliciously-influenced generation (via prompt injection in retrieved content, or simply an unlucky generation) can access the filesystem, network, or credentials the host process can reach. Always use a Docker-backed (or equivalent fully isolated) executor with a timeout, never bare local execution outside a fully trusted, throwaway environment.
2. **Prompt injection via tool/execution results flowing back into the conversation.** If a code execution's output (or a tool an agent calls) includes content from an untrusted external source — scraped web content, a file with attacker-controlled contents — and that output becomes the next message in the shared history, an injected instruction can attempt to steer subsequent agent behavior. Treat all execution and tool output as untrusted input at every hop, not only at the point of first retrieval — see the **Tool Calling** and dedicated **Prompt Injection** skills.
3. **Human-in-the-loop bypass or fatigue.** A human_input_mode configured to ask for approval "only sometimes" (e.g., TERMINATE-only) can lull an operator into rubber-stamping without real review once a system has run smoothly for a while, particularly dangerous if code execution or external actions are gated behind that same approval step; treat human-in-the-loop as a meaningful control point deserving real review discipline, not a checkbox.
4. **Unbounded cost from unauthenticated or unrated conversation-triggering endpoints.** A public endpoint that kicks off a multi-agent, multi-round GroupChat per request is a much larger cost-abuse surface than a single-agent endpoint, since each malicious request can multiply into dozens of LLM calls; apply authentication/rate-limiting discipline scaled to the conversation's actual round/roster multiplier.
5. **Sensitive data exposure across the shared conversation history.** Because every participating agent by default sees the full shared message history, sensitive data surfaced by one agent's tool or code execution is visible to every other agent in the conversation, including any that might eventually produce a public-facing output — apply the same data-minimization discipline you would to any multi-service data flow.

### Defenses

- Always execute LLM-generated code in a fully isolated, resource-limited sandbox (Docker, ideally with restricted network access and a mounted, scoped-down filesystem) with an explicit timeout.
- Sanitize and flag execution/tool output that reaches the shared conversation history, and reinforce system-level instructions against override attempts at every participating agent, not only the first.
- Treat human_input_mode settings as a security control with real review discipline, not a rate-limiting convenience — audit what actions are actually gated behind human approval and whether that approval is genuinely being exercised.
- Rate-limit and authenticate any endpoint that triggers a conversation, sized to the conversation's actual round/roster multiplier, not to a single-agent baseline.
- Minimize what's visible across the shared history where feasible (e.g., via nested chats that scope a sensitive sub-task to a narrower set of participants) rather than defaulting every agent into seeing everything.

See the dedicated **Prompt Injection**, **OWASP Top 10 for LLM Applications**, and **Tool Calling** skills for depth beyond what's AutoGen-specific here.
`,

  testing: `
### Testing individual agent behavior in isolation

~~~python
def test_assistant_proposes_valid_python():
    from autogen import AssistantAgent

    assistant = AssistantAgent(
        name="assistant",
        system_message="You write Python code to solve tasks.",
        llm_config={"config_list": [{"model": "gpt-4o-mini"}]},
    )
    reply = assistant.generate_reply(
        messages=[{"role": "user", "content": "Write a function that adds two numbers."}]
    )
    # Don't assert on exact text; assert on structural properties.
    assert "def " in reply["content"]
~~~

### Testing termination logic deterministically, without a real LLM call

~~~python
def test_is_termination_msg_matches_phrase():
    def is_termination_msg(msg):
        return "TERMINATE" in (msg.get("content") or "")

    assert is_termination_msg({"content": "All tests pass. TERMINATE"})
    assert not is_termination_msg({"content": "Still working on it."})
~~~

### The senior testing doctrine for multi-agent conversations

- **Unit test deterministic wiring**: termination-phrase logic, speaker-transition constraints, custom register_reply functions, code-executor configuration — none of this requires a real LLM call and all of it is where real bugs (a termination phrase that never matches, a missing numeric ceiling) actually live.
- **Integration test against a small golden set at the full-conversation level**, not just individual agent replies — a conversation can look fine turn by turn while never actually converging on a correct final answer (see the AI Evals skill for the general discipline).
- **Never assert on exact conversation transcript text.** Assert on outcome properties: did the generated code's tests actually pass, did the conversation terminate within an expected round range, does the final summary contain required elements — or use LLM-as-judge scoring against a documented rubric.
- **Test failure and partial-completion behavior explicitly.** Since a conversation is not transactional, verify your system's behavior when a conversation is cut off mid-way (hits max_round without terminating cleanly) — does the caller get a clear signal, and is the partial transcript still logged and usable?
- **Regression-test round count and cost, not only outcome quality.** A conversation that silently grew from four rounds to fifteen over time (through gradual roster or rubric creep) is a real, observed production drift worth catching in CI, exactly as with CrewAI's task-count creep.
- **Specifically test the "agents agree too easily" failure mode** by feeding a critic agent a known-flawed solution in an isolated test and asserting it actually flags the flaw, rather than only testing the happy path where the first proposed solution happens to be correct.
`,

  debugging: `
### The toolbox, in escalation order

1. **Always inspect the full chat_history first**, not just the final summary — with multiple turns and agents in play, the bug is very often several turns earlier (a misunderstood task, a code-execution error the assistant never actually fixed) rather than in the final message alone.

~~~python
result = user_proxy.initiate_chat(assistant, message="...")
for msg in result.chat_history:
    print(msg.get("name", msg.get("role")), "->", (msg.get("content") or "")[:200])
~~~

2. **Check termination logic explicitly when a conversation runs longer (or shorter) than expected** — print is_termination_msg's result against each message in the transcript to see exactly where, or why, it did or didn't fire.
3. **Reproduce with the smallest possible conversation** (two agents, a tight round ceiling) when diagnosing whether a problem is in a specific agent's reasoning versus in how the conversation is composed with others.
4. **Inspect the code executor's raw output directly**, not just the assistant's summary of it — an assistant can misreport or misinterpret an execution error, and the raw stdout/stderr/traceback is ground truth.
5. **In a GroupChat, check speaker-selection decisions explicitly** when the wrong agent seems to be speaking at the wrong time — under "auto" selection, log the manager's selection reasoning (or switch temporarily to round_robin) to isolate whether the bug is in speaker choice or in a specific agent's reply content.
6. **Diagnose "agents agreeing too quickly" by checking whether the critic's feedback ever references anything specific**, or whether the conversation terminated in far fewer rounds than the task's apparent difficulty would suggest — both are strong signals the critique is not substantive.

### Debugging unbounded/looping conversations

Print the round count against the configured max_round/max_consecutive_auto_reply ceiling explicitly, and diff the last few messages against each other — a genuinely looping conversation typically shows near-repeated content (the same fix proposed, the same critique repeated) rather than incremental progress, which is the clearest signal to add a stricter termination check or a lower round ceiling rather than assuming the model "just needs more turns."
`,

  monitoring: `
Production visibility for an AutoGen system rests on both general service observability (see the Observability category) and conversation-specific signals a single-agent system doesn't need.

### Structured logging per conversation

~~~python
import structlog

log = structlog.get_logger()

def logged_chat(user_proxy, recipient, message: str, request_id: str):
    result = user_proxy.initiate_chat(recipient, message=message)
    log.info(
        "autogen_conversation",
        request_id=request_id,
        num_turns=len(result.chat_history),
        cost=result.cost,
        terminated_cleanly=any(
            "TERMINATE" in (m.get("content") or "") for m in result.chat_history
        ),
    )
    return result
~~~

### Conversation-specific metrics to track

- **Turn count per conversation**, not just cost — a rising average or a fat right tail signals termination logic isn't firing reliably, or task difficulty has shifted, before cost alone would make it obvious.
- **Clean-termination rate** (did is_termination_msg actually fire before hitting a numeric ceiling) as an explicit metric — a low rate is an early warning that your termination-phrase logic is fragile.
- **Speaker-selection distribution in GroupChats** (how often each agent actually speaks) — a roster member that almost never gets selected is a candidate for removal; one that dominates every round may indicate a mis-tuned selection prompt or constraint.
- **Critic/reviewer "agreement speed"**: rounds-to-termination in critic-style conversations, watched for anomalously fast agreement that correlates with lower downstream quality (a strong signal of the "agreeing too easily" failure mode).
- **Cost per conversation, broken down by turn**, not only the aggregate — the fastest way to spot the one expensive round (usually a large code-execution retry loop or an unnecessary auto speaker-selection call) in an otherwise cheap workflow.

### Tracing

Trace each turn as its own span, nested under a parent span for the whole initiate_chat call, and nest code-execution spans under the turn that triggered them — this mirrors the internal-working sequence diagram and is the fastest way to answer "why was this specific conversation slow, expensive, or wrong" without re-reading a full transcript line by line.
`,

  deployment: `
### A production Dockerfile for an AutoGen-based service

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
CMD ["uvicorn", "codeassist.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: slim base and a non-root user reduce attack surface; the dependency layer is cached separately from application code for fast rebuilds; PYTHONUNBUFFERED ensures conversation transcripts (which matter a lot for debugging multi-agent runs) stream immediately rather than buffering. Note that this Dockerfile serves the orchestration API only — the code-execution sandbox itself should run as a separate, more tightly isolated container (or a dedicated container-per-conversation pool), never inside this same application process.

### Serving topology

- **Short, two-agent conversations with a tight round ceiling**: can be served synchronously behind a normal API, with a request timeout sized generously above the conversation's measured p95 latency.
- **Longer or GroupChat conversations, or any with human_input_mode requiring real human input**: move to an async job queue with a polling or webhook-based result delivery — treating a multi-minute, multi-turn, possibly human-paused conversation as a synchronous HTTP request invites timeouts and wasted client-side retries that re-trigger a costly conversation from scratch.
- **Sandbox isolation**: run code execution in a separate container or container pool from the orchestration API process, with restricted network access and a scoped-down, ephemeral filesystem per conversation.
- **Health checks**: a /healthz for process liveness, and a /readyz that verifies the LLM provider(s) and the code-execution sandbox pool are reachable before accepting traffic.
- **Cost and quota guarding**: since a conversation multiplies LLM calls across turns and (in GroupChats) speaker-selection calls, apply per-tenant or per-endpoint request quotas sized to that multiplier, not to a single-agent baseline.

### CI/CD pipeline sketch

lint/typecheck → unit tests (termination logic, speaker-transition constraints, executor configuration) → golden-set regression test at the full-conversation level → build image(s) for both the API and the sandbox → deploy with rolling update → separately validate any GroupChat or human-in-the-loop path against a canary workload before flipping full production traffic.
`,

  "production-checklist": `
Before an AutoGen-based system takes real traffic:

- [ ] Every conversation has both a termination-phrase check and a hard numeric ceiling (max_consecutive_auto_reply/max_round)
- [ ] All code execution runs in a fully isolated, timeout-bounded sandbox (Docker or equivalent), never unsandboxed
- [ ] Critic/reviewer agents are given an external, checkable rubric or test suite, not only an instruction to "review carefully"
- [ ] Speaker-selection method is round_robin or explicitly constrained where the workflow's shape is known, with "auto" reserved for cases that genuinely need it
- [ ] Explicit LLM call timeouts and sandbox execution timeouts are set
- [ ] Full conversation transcripts and per-conversation cost/turn-count are logged
- [ ] Agent roster size is reviewed and justified, not grown ad hoc over time
- [ ] Failure/partial-completion behavior is explicitly handled (conversations are not transactional)
- [ ] Long-running, GroupChat, or human-in-the-loop conversations are served asynchronously, not as a synchronous HTTP request
- [ ] Rate limiting and authentication on any endpoint that triggers a conversation, sized to its LLM-call multiplier
- [ ] A golden-set regression test exists at the full-conversation level, checking outcome properties, not exact transcript text
- [ ] Clean-termination rate and speaker-selection distribution are tracked as explicit metrics
- [ ] Sensitive data exposure across the shared conversation history has been reviewed for every agent that can see it
- [ ] Someone has explicitly justified, in writing, why this problem needed conversation-driven orchestration rather than a fixed pipeline or single agent

Cross-check with the AI Evals skill for the deeper evaluation discipline behind the golden-set checklist item.
`,

  "common-mistakes": `
1. **Relying on a termination phrase alone, with no numeric ceiling.** An LLM can fail to emit, paraphrase, or prematurely emit a termination string; without a hard max_round/max_consecutive_auto_reply backstop, this is a direct path to an unbounded, cost-runaway conversation.
2. **Running LLM-generated code unsandboxed "just for local testing."** This habit reliably migrates into less-careful environments over time and is a genuine security exposure, not merely sloppy hygiene.
3. **Assuming two conversing agents will meaningfully critique each other by default.** Without an external rubric, test suite, or a genuinely adversarial persona, LLM-to-LLM review frequently converges on quick, confident agreement regardless of actual correctness.
4. **Reaching for GroupChat with "auto" speaker selection before trying a fixed two-agent conversation.** This adds real per-round cost and unpredictability that's often unjustified for tasks whose roster and rough order are actually known in advance.
5. **Letting a GroupChat's roster grow agent-by-agent over time** without review — the same "crew creep" pattern seen in CrewAI, where each added participant increases cost and unpredictability without a corresponding, measured quality gain.
6. **Treating a conversation's auto-generated summary as ground truth** during debugging, when the full transcript (especially raw code-execution output) may tell a materially different story.
7. **No timeout on LLM calls or the code executor.** A hung API call or an infinite-looping generated script otherwise blocks the whole conversation indefinitely with no automatic recovery.
8. **Testing conversational output with exact-string assertions.** Multi-turn, multi-agent LLM output is non-deterministic; tests should check outcome properties (tests passed, termination occurred within range) and golden-set quality scores, not exact transcript text.
9. **Treating a conversation as transactional.** Assuming a failed or truncated conversation can simply be retried from scratch ignores that several turns — and any code they executed, and their cost — may have already happened; production systems need explicit partial-completion handling.
10. **Not measuring whether conversation-driven orchestration actually improved outcomes over a simpler single-agent or fixed-pipeline baseline.** Shipping a multi-agent conversational design because the pattern is compelling, without a golden-set comparison, means you can't actually justify its added cost, latency, and unpredictability to a reviewer or to yourself.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| Conversation runs to max_round without resolving | Termination-phrase check never fires (paraphrased or omitted phrase) | Tighten is_termination_msg (case-insensitive, substring-tolerant matching) and keep the numeric ceiling as a backstop, not the primary mechanism |
| Conversation ends far too quickly with a shallow result | Critic agent agreeing without substantive review | Give the critic an external rubric or test suite; use a distinct model/persona for the critic |
| Code execution silently fails or produces unexpected output | No sandbox timeout, or executor misconfigured (missing dependencies in the image) | Set an explicit execution timeout; verify the executor's base image includes everything the generated code needs |
| Wrong agent speaks at the wrong time in a GroupChat | Unconstrained "auto" speaker selection choosing based on ambiguous conversational cues | Constrain with allowed_or_disallowed_speaker_transitions or switch to round_robin |
| Cost spikes on a subset of requests | A small fraction of conversations hit a long retry/critique loop | Log per-conversation cost and round count; investigate and cap the specific pattern causing the tail |
| Security incident from generated code | Code executed unsandboxed, outside a Docker/isolated executor | Always use a fully isolated, resource-limited, timeout-bounded executor; never run unsandboxed |
| Sensitive data appears in an unexpected agent's output | All agents share the full conversation history by default | Use nested chats or a narrower roster to scope sensitive sub-tasks away from agents that don't need that data |
| Partial conversation on failure leaves inconsistent downstream state | Conversation treated as transactional by the caller | Handle partial completion explicitly; log the transcript even on overall failure |

The habit that matters: reproduce with the smallest conversation (fewest agents/rounds that still shows the bug), inspect the full transcript and raw code-execution output first, and only then consider whether the underlying LLM or a specific tool/executor is actually at fault.
`,

  faqs: `
**Q: Is AutoGen just "agents that chat with each other," or is there more to it?**
The conversational model is the core idea, but the framework adds real infrastructure around it: pluggable reply generation (LLM, code execution, human input, custom functions), configurable termination, GroupChat speaker-selection strategies, and (in the 0.4 rearchitecture) a lower-level event-driven Core runtime beneath the higher-level AgentChat conversational API.

**Q: When should I use AutoGen instead of CrewAI?**
When the workflow's value genuinely comes from open-ended, iterative back-and-forth with an unknown number of rounds — a coder and a critic iterating until tests pass, a debate-style multi-perspective analysis — rather than a known division of labor executed in a fixed or plannable order, which CrewAI's task/process model handles more predictably and cheaply.

**Q: When should I use AutoGen instead of LangGraph?**
When you want the conversational, message-history-centric model and its native code-execution loop, and you're comfortable trading some precise control for that flexibility. If your workflow needs exact conditional branching over explicit state, LangGraph's hand-wired graph gives you that control more directly than AutoGen's conversational abstraction.

**Q: Do I need Docker to use AutoGen's code execution?**
Not strictly, but you should treat sandboxed (Docker-backed) execution as the responsible default for anything beyond a fully trusted, throwaway local experiment — running LLM-generated code directly on a host process is a real security risk, not a theoretical one.

**Q: How do I stop a conversation from looping forever?**
Always pair a termination-phrase check (is_termination_msg) with a hard numeric ceiling (max_consecutive_auto_reply on an agent, max_round on a GroupChat) — never rely on the phrase check alone, since an LLM can fail to emit, paraphrase, or misplace it.

**Q: Why do my two agents seem to agree with each other too quickly?**
This is a well-documented failure mode: LLM-to-LLM critique without an external rubric or test suite tends toward quick, confident agreement regardless of actual correctness. Give a critic-style agent something objective to check against (tests, a schema, an explicit checklist) rather than relying on its own subjective judgment.

**Q: What is AG2, and is it the same as AutoGen?**
AG2 is a community-maintained fork that split off from Microsoft's AutoGen after a governance disagreement, continuing development of an architecture closer to the pre-0.4 design under separate stewardship. The two have diverged since; check which one a given tutorial or dependency actually targets before assuming API compatibility.

**Q: How current is this page's API detail?**
AutoGen's architecture has changed substantially, most notably with the 0.4 Core/AgentChat/Extensions rearchitecture and the AG2 fork. This page reflects general, durable patterns true through the author's knowledge cutoff (early-to-mid 2025) rather than any single pinned version's exact class names — always check current official documentation (and confirm whether you're looking at Microsoft's AutoGen or the AG2 fork) before shipping.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is a ConversableAgent, and how do AssistantAgent and UserProxyAgent specialize it?* ConversableAgent is the base class for any AutoGen participant that can send/receive messages and generate replies via pluggable logic; AssistantAgent specializes it as an LLM-backed reasoner that proposes solutions (including code) but does not execute anything itself, while UserProxyAgent specializes it as a human/executor stand-in that can run code and relay human input.
2. *Why does AutoGen split "propose code" and "run code" across two different agents?* To mirror a real code-review-style separation of concerns and to make the code-execution boundary an explicit, gate-able point (via human_input_mode or code_execution_config), rather than letting a single agent silently execute whatever it generates.
3. *What does human_input_mode control, and what are its typical settings?* How often a UserProxyAgent pauses for real human input — commonly ALWAYS (every turn), TERMINATE (only near the conversation's apparent end), or NEVER (fully automated) — letting the same agent definitions serve both heavily-supervised prototyping and fully automated production use.
4. *Why is a termination-phrase check alone considered insufficient in production?* An LLM can fail to emit, paraphrase, or prematurely emit the expected phrase; a hard numeric ceiling (max_consecutive_auto_reply/max_round) is needed as a mandatory backstop.
5. *What does a GroupChatManager actually do?* On each round, it decides which agent in the roster should generate the next reply (via a speaker-selection method — auto/LLM-driven, round_robin, manual, or transition-constrained), acting as the conversation's orchestrator rather than a conversational participant with its own opinion on the task.

**Senior:**

6. *A GroupChat conversation is taking far longer and costing far more than expected. How do you debug it?* Inspect the full chat_history and round count against the configured ceiling; check whether speaker selection (if "auto") is behaving sensibly or thrashing between agents; look for near-repeated content across turns signaling a genuine loop versus real incremental progress; check whether a critic-style agent lacks an external rubric and is endlessly nitpicking.
7. *Design a coding-assistant conversation for a company's internal tooling. How many agents, and why?* Start with the minimal assistant/user-proxy pair with sandboxed code execution and a test-suite-based termination check; only add a dedicated critic agent if you can show, on a golden set, that its review measurably improves final code quality over the two-agent baseline, given the added cost of a third participant.
8. *When would you choose AutoGen over CrewAI, and vice versa, for a given project?* AutoGen when the task's value comes from genuinely open-ended, iterative back-and-forth (unknown number of rounds, a real need for distinct perspectives colliding) — most classically, code-execution-driven iterative development; CrewAI when the division of labor and rough execution order are known in advance and a more declarative, task-based abstraction with less unpredictability is preferable.
9. *How do you prevent two agents from simply agreeing with each other without real progress?* Give a critic-style agent an explicit, external, checkable rubric or test suite rather than relying on subjective LLM judgment; use a genuinely distinct model or adversarially-incentivized persona for the critic; monitor rounds-to-termination for anomalously fast agreement correlated with lower downstream quality.
10. *How would you test a multi-agent AutoGen conversation given the non-determinism of LLM output?* Unit test deterministic wiring (termination logic, speaker-transition constraints, executor configuration) without a real LLM call; integration test against a golden set at the full-conversation level using outcome-based assertions (did tests pass, did termination occur within an expected range) or LLM-as-judge scoring, never exact transcript text.
11. *A GroupChat that started with three agents has grown to seven over several months. What's the concern, and how do you address it?* Cost and unpredictability have likely grown roughly with roster size and round count, often without a matching quality improvement; audit each agent's justification, check for role overlap or redundant participants, and consider constraining speaker transitions or splitting into smaller nested conversations.
12. *How do you decide whether conversation-driven orchestration is worth its unpredictability and cost for a given problem?* Compare against a fixed-pipeline (CrewAI-style) or single-agent baseline on a golden set for both quality and cost/latency/predictability; only adopt the conversational model if it produces a measurable quality improvement that justifies the added LLM-call multiplier and the operational risk of non-terminating or agreement-without-progress conversations.
`,

  "coding-questions": `
### 1. Build a minimal two-agent coding conversation with sandboxed execution (core skill, asked in some form constantly)

~~~python
from autogen import AssistantAgent, UserProxyAgent
from autogen.coding import DockerCommandLineCodeExecutor

def build_coding_conversation(model_name: str = "gpt-4o-mini"):
    """Two-agent conversation: assistant proposes code, user proxy
    executes it in a sandbox and reports results back."""
    llm_config = {"config_list": [{"model": model_name, "timeout": 30}]}

    assistant = AssistantAgent(
        name="assistant",
        system_message=(
            "You write correct, tested Python code. Reply exactly "
            "'TERMINATE' once tests pass and the task is complete."
        ),
        llm_config=llm_config,
    )

    executor = DockerCommandLineCodeExecutor(
        image="python:3.12-slim", timeout=60, work_dir="coding",
    )

    def is_termination_msg(msg):
        return "TERMINATE" in (msg.get("content") or "")

    user_proxy = UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=8,
        code_execution_config={"executor": executor},
        is_termination_msg=is_termination_msg,
    )
    return assistant, user_proxy

# assistant, user_proxy = build_coding_conversation()
# try:
#     result = user_proxy.initiate_chat(
#         assistant,
#         message="Write fib(n) with unit tests, run them, fix any failures.",
#     )
# except Exception as exc:
#     # A conversation is not transactional — earlier turns (and any
#     # code they executed) may have already happened even if a later
#     # call fails.
#     raise RuntimeError(f"AutoGen conversation failed: {exc}") from exc
~~~

Complexity: end-to-end latency is roughly additive across turns (at least one LLM call per turn, plus sandbox execution time for code turns), so a conversation that needs three fix-and-retry cycles costs and takes at minimum roughly six LLM calls plus three sandbox executions. Follow-ups: add a critic agent as a third participant and reason about whether it earns its added cost; swap the phrase-only termination check for one that also verifies the executor's last reported exit code was zero.

### 2. Detect a non-terminating or looping conversation from its transcript

~~~python
def detect_stalled_conversation(chat_history: list[dict], similarity_threshold: float = 0.9) -> dict:
    """
    Flags a conversation as likely stalled/looping if the last few
    messages from the same speaker are near-duplicates of each other,
    which signals no real progress rather than a genuinely long but
    productive back-and-forth.
    """
    from difflib import SequenceMatcher

    by_speaker: dict[str, list[str]] = {}
    for msg in chat_history:
        speaker = msg.get("name", msg.get("role", "unknown"))
        by_speaker.setdefault(speaker, []).append(msg.get("content") or "")

    flagged = {}
    for speaker, messages in by_speaker.items():
        if len(messages) < 2:
            continue
        last_two = messages[-2:]
        ratio = SequenceMatcher(None, last_two[0], last_two[1]).ratio()
        if ratio >= similarity_threshold:
            flagged[speaker] = ratio

    return {"total_turns": len(chat_history), "flagged_speakers": flagged}
~~~

Discussion points: why a similarity-based heuristic is a pragmatic first defense rather than a perfect one (legitimate iterative refinement can also look similar turn to turn if progress is incremental); how this connects to the max_round/max_consecutive_auto_reply caps discussed in Best Practices; how you'd wire this into a monitoring alert rather than just a one-off script.

### 3. Give a critic agent an objective, external verification step instead of subjective review

~~~python
import subprocess

def run_tests_and_summarize(code_dir: str) -> str:
    """
    Runs the actual test suite generated alongside proposed code and
    returns a structured, factual summary — used as the critic's
    input instead of trusting the critic's own subjective read of
    whether code "looks correct."
    """
    proc = subprocess.run(
        ["python", "-m", "pytest", code_dir, "-q"],
        capture_output=True, text=True, timeout=60,
    )
    passed = proc.returncode == 0
    return (
        f"Tests {'PASSED' if passed else 'FAILED'}.\\n"
        f"stdout (last 500 chars): {proc.stdout[-500:]}\\n"
        f"stderr (last 500 chars): {proc.stderr[-500:]}"
    )

def build_critic_reply(code_dir: str) -> str:
    """
    Feeds objective test results into the critic's next message
    rather than asking it to review code purely on its own judgment —
    directly mitigating the 'agents agreeing without real progress'
    failure mode.
    """
    test_summary = run_tests_and_summarize(code_dir)
    if "PASSED" in test_summary:
        return f"{test_summary}\\nLGTM."
    return f"{test_summary}\\nTests failed — please fix and resubmit."
~~~

Complexity: O(test-suite runtime) per verification call, generally far cheaper and more reliable than an additional LLM call for the same judgment. Follow-ups: wire build_critic_reply into a custom register_reply function on the critic agent so it always grounds its verdict in actual test output rather than subjective review; extend to also run a static analyzer or linter as an additional objective signal.
`,

  "hands-on-labs": `
### Lab 1 — Your first two-agent coding conversation (beginner, ~1h)
Build the assistant/user-proxy pair from Coding Question 1 over a small coding task of your choice, with Docker-backed execution. Run it three times and compare the transcripts. Deliverable: a short write-up of what varied between runs (non-determinism, and whether termination fired cleanly each time) and why. Skills: ConversableAgent/AssistantAgent/UserProxyAgent basics, sandboxed code execution.

### Lab 2 — Fixed pipeline vs. conversation, head to head (intermediate, ~2h)
Take a task with a genuinely iterative shape (write code, run it, fix bugs until tests pass) and implement it two ways: as the AutoGen two-agent conversation, and as a fixed, pre-planned sequence of steps (e.g., a CrewAI-style task pipeline, or plain code) with no feedback loop. Compare output correctness, total tokens, and latency across 10 runs each. Deliverable: a table with your findings and a written recommendation for which approach you'd ship for this specific task, and why. Skills: honest cost/benefit evaluation of conversation-driven orchestration, the core question this page argues you must answer for every use case.

### Lab 3 — Fixing "agents agreeing too easily" (advanced, ~3h)
Build a coder/critic conversation where the critic only has a subjective "review carefully" instruction, and deliberately feed it a solution with a known, findable bug; observe how often the critic misses it. Then rewire the critic to use an objective test-suite check (Coding Question 3) and re-run the same experiment. Deliverable: a before/after comparison quantifying the improvement in bug-catch rate. Skills: diagnosing and fixing the reflection-without-verification failure mode.

### Lab 4 — Production-shaped conversation service (production, ~4h)
Wrap a two-agent (or small GroupChat) conversation in a FastAPI service with an async job-queue execution path (not synchronous request/response), a Docker-backed sandbox running as a separate isolated container, termination logic pairing a phrase check with a numeric ceiling, structured logging of per-conversation round count and cost, a /healthz endpoint, and a multi-stage Dockerfile. Load test and report cost and latency per request, broken down per turn. Skills: the full production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-engineering roles):

1. **Self-correcting coding assistant** — An assistant/user-proxy conversation that writes code, runs a generated test suite in a Docker sandbox, and iterates until tests pass or a round ceiling is hit, with an objective critic step (Coding Question 3) verifying correctness rather than trusting subjective review, and a golden-set evaluation comparing conversation-driven correction against a single-shot (no feedback loop) baseline. Demonstrates: honest cost/benefit justification for conversation-driven orchestration, safe code execution, evaluation discipline.

2. **Constrained GroupChat for a multi-step review workflow** — A three-agent GroupChat (drafter, fact-checker, editor) with explicit allowed_or_disallowed_speaker_transitions rather than unconstrained "auto" selection, composed to bound both cost and unpredictability while still allowing genuine back-and-forth revision. Demonstrates: knowing when a conversational model needs structure layered on top, and measuring the tradeoff against a fully declarative task pipeline.

3. **Runaway-conversation guardrail library** — A standalone monitoring/guardrail layer that wraps any AutoGen conversation with max_round/max_consecutive_auto_reply enforcement, near-duplicate-message loop detection (Coding Question 2), and clean-termination-rate tracking, packaged so it could plug into any team's existing AutoGen-based service. Demonstrates: the production-hardening instincts that separate a demo conversation from one a senior engineer would actually deploy.

Each project: src layout, typed Python, a small pytest suite covering deterministic wiring (termination logic, speaker-transition constraints, executor configuration) plus a golden-set regression test at the full-conversation level, CI via GitHub Actions, and a README with an architecture diagram and an explicit "why a conversation, not a fixed pipeline" justification section — that justification is what separates a "multi-agent chat demo" from a project a senior interviewer takes seriously.
`,

  "case-studies": `
### The AutoGen 0.4 rearchitecture: separating runtime from convenience API
Microsoft's split into Core, AgentChat, and Extensions followed real feedback that the original single-layer ConversableAgent design conflated a general-purpose, event-driven agent runtime with a specific, opinionated conversational-agent convenience API — teams needing tighter control over messaging, routing, or non-chat agent topologies were fighting assumptions baked into the original design. Lesson: nearly every popular agent framework eventually splits a lower-level runtime from a higher-level convenience layer once enough production users need more control than the original all-in-one API exposed — the same pattern visible in CrewAI's Flows arriving above Crews.

### The AG2 fork: governance as an architectural fork point
AG2 emerged from a governance disagreement within the AutoGen community, continuing development of an architecture closer to the pre-0.4 design under independent stewardship, while Microsoft's own AutoGen continued its own rearchitected path in parallel. Lesson: for widely-adopted open-source infrastructure, governance decisions can produce genuine architectural forks, not just naming disputes — evaluating "which AutoGen" a tutorial, tool, or team is actually using is a real, practical due-diligence step, not pedantry.

### Magentic-One: AutoGen as a substrate for a higher-level product
Microsoft built Magentic-One, a general-purpose multi-agent system for web/file/code task completion, directly on top of AutoGen's Core runtime rather than the AgentChat convenience layer alone. Lesson: a framework's lower-level runtime layer often ends up serving as the substrate for more opinionated, product-facing systems built by the same or different teams — a useful signal that a framework's "boring" internal layer can matter as much as its headline developer-facing API.

### Coding-assistant adoption and the propose/execute split
AutoGen's split between an assistant that proposes code and a user proxy that executes it (rather than one agent doing both) proved to be a durable, widely-copied design choice across the broader agent ecosystem, echoing a code-review-style separation of concerns that predates LLM agents entirely. Lesson: design choices that map onto an existing, well-understood human workflow (a developer proposing a change, a reviewer or CI system running it) tend to generalize and get reused well beyond the framework that popularized them.
`,

  comparisons: `
| Dimension | AutoGen | CrewAI | LangGraph | OpenAI Agents SDK |
|-----------|---------|--------|-----------|--------------------|
| Core mental model | Conversation-driven — agents exchange messages in a shared chat; control flow is "who speaks next" | Role-based team of specialized agents executing declared tasks under a process | Explicit graph/state machine you hand-wire | Lightweight, provider-native agent/tool-calling primitives |
| Control-flow style | Emergent, driven by conversational turns and (optionally) speaker-selection logic | Declarative (sequential/hierarchical process), with Flows for more explicit control | Explicit, hand-designed (nodes, edges, conditional branching) | Explicit but minimal — closer to raw agent loop plus handoffs |
| Best default use case | Open-ended, iterative back-and-forth with an unknown round count — classically, propose-execute-observe-fix coding loops and debate/critique patterns | A task that naturally decomposes into distinct specialist roles with known (or plannable) division of labor | Complex, precisely branching pipelines needing fine-grained state control | Simple, provider-native agents and handoffs without heavy orchestration abstraction |
| Native code execution | First-class (UserProxyAgent + sandboxed executor) | Via an attached tool, not a first-class conversational primitive | Via an attached tool/node, not a first-class primitive | Via an attached tool |
| Predictability | Lower by default — conversation length and speaker order can be dynamic; improves with constrained transitions and hard round ceilings | Sequential is predictable; hierarchical/delegation trades predictability for flexibility | High — you designed the exact control flow | High for simple flows; less structure for complex multi-agent cases |
| Coordination overhead risk | Real — non-terminating conversations and agents agreeing without real progress are documented failure modes | Real — redundant work, agents talking past each other, and delegation loops are documented failure modes | Lower — you control exactly which node runs when | Lower — minimal abstraction means less to go wrong, but also less built-in structure for complex cases |

**How seniors choose**: reach for AutoGen when a problem's value genuinely comes from open-ended, iterative dialogue whose length can't be known upfront — most classically, generating code, running it, and fixing it based on real execution feedback, or a genuinely adversarial critique/debate pattern — but only after confirming (ideally with a golden-set comparison) that a fixed pipeline or single well-tooled agent doesn't already do the job more predictably and cheaply. Reach for CrewAI when the division of labor is known or plannable and a more declarative, task-based abstraction with less unpredictability is preferable. Reach for LangGraph when the pipeline has real branching complexity or state-management needs that benefit from explicit, hand-designed control flow. Reach for the OpenAI Agents SDK when you want the lightest possible abstraction over provider-native primitives, without committing to a heavier multi-agent framework's opinions. None of these is definitively superior across the board — this is a genuinely fast-evolving space, and the honest answer for most real projects is to prototype the simplest option first, and add conversational or graph-based machinery only once a concrete, measured limitation justifies it.

See also the **Agent Fundamentals** skill for the single-agent baseline every one of these comparisons should be measured against, the **Reflection** skill for the deeper theory behind why LLM-to-LLM critique often under-delivers without external verification, and the **Planning** skill for the general planning/delegation failure modes that show up across all multi-agent frameworks, not just AutoGen.
`,

  "related-technologies": `
- **Agent Fundamentals** — the single-agent reason-act-observe loop that every AutoGen agent's individual turn is built from underneath; read this first, since a conversation is fundamentally several of these loops composed together via a shared message history, not a different execution primitive.
- **Tool Calling** — how agents invoke external capabilities; AutoGen's code-execution loop is a specialized, first-class case of this general pattern, and custom register_reply functions can wire in arbitrary tool-like logic.
- **Reflection** — the general pattern of an agent (or a second agent) checking and revising work; AutoGen's critic/producer conversational pattern is a direct, framework-level implementation of reflection, and understanding reflection's known limits explains why AutoGen critics need external verification, not just subjective review.
- **Planning** — GroupChat speaker-selection and multi-agent task decomposition overlap heavily with general agentic-planning concerns and failure modes.
- **CrewAI** — the role-based, task-declarative alternative, a better fit when the division of labor is known or plannable in advance rather than genuinely open-ended.
- **LangGraph** — the more explicit, hand-wired graph/state-machine alternative for complex control flow, useful when AutoGen's conversational model trades away more predictability than a project needs.
- **OpenAI Agents SDK** — a lighter-weight, provider-native alternative for simpler agent and handoff patterns without adopting a full multi-agent framework's opinions.
- **Agent Memory** — the shared conversation history in AutoGen is itself a form of memory across turns; the same tradeoffs (what to keep, summarize, or drop as a conversation grows long) apply directly.
- **AI Evals** — the general discipline of measuring whether a system (single-agent, task-pipeline, or conversation-driven) actually works, directly relevant to the golden-set comparisons this page repeatedly recommends before adopting conversation-driven orchestration.
- **Python** — the language every AutoGen conversation is written in; async fluency and Docker familiarity directly improve both concurrency and safe code-execution setup.

On this platform, a natural learning path: **Agent Fundamentals** → **Tool Calling** → **Planning** / **Reflection** → **AutoGen (this page)** → **CrewAI** / **LangGraph** / **OpenAI Agents SDK** for the broader multi-agent orchestration landscape.
`,

  "latest-updates": `
Verified against the author's knowledge through roughly early-to-mid 2025 — check the official AutoGen (and, separately, AG2) documentation and changelogs for anything newer, since this space, like most of the agent-orchestration ecosystem, has continued to move quickly and in more than one direction at once.

- **The AutoGen 0.4 layered rearchitecture (Core, AgentChat, Extensions) has continued to mature**, with AgentChat solidifying as the recommended entry point for most conversational multi-agent use cases and Core serving lower-level, more custom runtime needs. Verify the current recommended entry point and import paths in the docs before starting a new project, since class names and package structure changed meaningfully across this rearchitecture.
- **AG2, the community-maintained fork, has continued independent development** of an architecture closer to the pre-0.4 design — treat "AutoGen" and "AG2" as related but now-distinct projects when reading tutorials, and check which one a given piece of content or dependency actually targets.
- **Magentic-One and related Microsoft Research systems** built on AutoGen's Core runtime illustrate the framework's growing role as a substrate for higher-level, product-facing multi-agent systems, not only a library end-developers wire up directly.
- **Continued growth of code-execution tooling and sandboxing options** (executor abstractions beyond the original bare Docker flag) reflects broader ecosystem emphasis on making LLM-driven code execution safer and more configurable by default.
- **General ecosystem note**: as with any framework this actively competing with CrewAI and LangGraph for multi-agent mindshare, and now split across two related-but-distinct codebases (AutoGen and AG2), specific class names, constructor signatures, and recommended patterns should be treated as likely to have shifted since this page was written — always cross-check against current official docs before committing to an approach in a new project.
`,

  "future-roadmap": `
Where AutoGen (and the broader conversation-driven multi-agent space it helped establish) appears to be heading, and what's worth betting career time on:

1. **Continued convergence toward hybrid conversational-plus-explicit control**, with constrained speaker-transition graphs, nested chats, and Core's event-driven runtime becoming the default way to compose predictable structure around otherwise open-ended conversations — mirroring the same pattern visible across CrewAI (Flows) and the broader multi-agent framework space, not just AutoGen.
2. **Sharper built-in guardrails against known failure modes** (non-terminating conversations, agreement-without-progress critique) are a plausible direction, given how consistently these show up as the leading production complaints about conversation-driven multi-agent systems industry-wide.
3. **Deeper integration of objective external verification into critic/reflection patterns** (test suites, static analyzers, schema validators wired directly into the conversational loop) rather than relying on a second LLM's subjective judgment, addressing the "agents agreeing too easily" problem at the framework level rather than leaving it entirely to application code.
4. **Continued parallel evolution of AutoGen and AG2**, with no clear signal (as of this writing) that either will fully absorb or displace the other — expect continued feature convergence (both likely growing better guardrails and observability) alongside genuine architectural divergence over time.
5. **Ongoing competition with CrewAI and LangGraph** for multi-agent mindshare, with no framework in this space having established a clearly dominant, durable advantage — expect continued convergence of capabilities (all three growing more explicit control-flow options, all three growing better observability and evaluation tooling) rather than one approach definitively winning.

For your career: the durable, transferable skill here is not memorizing AutoGen's exact API (which has already changed substantially once and will likely again) but understanding the underlying tradeoffs of conversation-driven orchestration — when open-ended, iterative dialogue between agents genuinely helps, when it adds pure coordination overhead and cost, and how to bound and verify it responsibly — since that judgment transfers directly to whatever the next popular conversational multi-agent framework turns out to be.
`,

  "cheat-sheet": `
~~~python
# --- Core primitives ---
from autogen import ConversableAgent, AssistantAgent, UserProxyAgent
from autogen import GroupChat, GroupChatManager
from autogen.coding import DockerCommandLineCodeExecutor

llm_config = {"config_list": [{"model": "gpt-4o-mini", "timeout": 30}]}

assistant = AssistantAgent(
    name="assistant",
    system_message="You write correct, tested code. Reply exactly "
                    "'TERMINATE' once the task is fully verified.",
    llm_config=llm_config,
)

executor = DockerCommandLineCodeExecutor(
    image="python:3.12-slim", timeout=60, work_dir="coding",
)

def is_termination_msg(msg):
    return "TERMINATE" in (msg.get("content") or "")

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",       # ALWAYS | TERMINATE | NEVER
    max_consecutive_auto_reply=8,   # hard circuit breaker
    code_execution_config={"executor": executor},  # always sandboxed
    is_termination_msg=is_termination_msg,
)

# --- Two-agent conversation ---
result = user_proxy.initiate_chat(assistant, message="Write fib(n) with tests.")
print(result.chat_history)
print(result.cost)

# --- GroupChat: 3+ agents, configurable speaker selection ---
groupchat = GroupChat(
    agents=[user_proxy, coder, critic],
    messages=[],
    max_round=12,                          # hard ceiling on total turns
    speaker_selection_method="round_robin", # prefer over unconstrained "auto"
)
manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)
user_proxy.initiate_chat(manager, message="...")

# --- Constrain speaker transitions instead of unconstrained auto ---
groupchat = GroupChat(
    agents=[user_proxy, coder, critic],
    messages=[],
    max_round=12,
    speaker_selection_method="auto",
    allowed_or_disallowed_speaker_transitions={
        user_proxy: [coder], coder: [critic], critic: [coder, user_proxy],
    },
    speaker_transitions_type="allowed",
)

# --- Custom reply logic ---
def custom_reply(recipient, messages, sender, config):
    if "urgent" in (messages[-1]["content"] or "").lower():
        return True, "Escalating to a human reviewer."
    return False, None
user_proxy.register_reply([AssistantAgent, None], custom_reply, position=0)

# --- Production guardrails ---
# - always pair termination-phrase check with a numeric ceiling
# - always sandbox code execution (Docker, timeout, no bare local exec)
# - prefer round_robin/constrained transitions over unconstrained "auto"
# - give critic agents an external test suite/rubric, not just "review carefully"
# - log full transcripts + per-conversation cost/round-count
# - always compare against a single-agent or fixed-pipeline baseline before shipping
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is a ConversableAgent? | The base class for any AutoGen participant that can send/receive messages and generate replies via pluggable logic (LLM call, code execution, human input, custom function) |
| AssistantAgent vs UserProxyAgent? | AssistantAgent is an LLM-backed reasoner that proposes solutions (including code) but never executes anything; UserProxyAgent represents a human or automated executor that can run proposed code and relay human input |
| Why split "propose code" from "run code" across two agents? | Mirrors a code-review-style separation of concerns and makes the execution boundary an explicit, gate-able point rather than one agent silently executing whatever it generates |
| What does human_input_mode control? | How often a UserProxyAgent pauses for real human input — ALWAYS, TERMINATE (near the end only), or NEVER |
| What does a GroupChatManager do? | Decides, each round, which agent in the roster speaks next (via speaker_selection_method), acting as the conversation's orchestrator |
| Why pair a termination-phrase check with a numeric ceiling? | An LLM can fail to emit, paraphrase, or prematurely emit a termination phrase; the numeric ceiling (max_round/max_consecutive_auto_reply) is a mandatory backstop |
| Biggest AutoGen-specific security risk? | Running LLM-generated code unsandboxed; always use a Docker-backed (or equivalent isolated) executor with a timeout |
| "Agents agreeing without real progress" — root cause and fix? | Subjective LLM-to-LLM review with no external check; fix by giving the critic an objective rubric, test suite, or a genuinely distinct/adversarial persona |
| "Conversations that loop without terminating" — root cause and fix? | Fragile termination-phrase matching with no numeric ceiling; fix by pairing both, and by making the termination criterion concrete and checkable |
| AutoGen vs CrewAI, one-line? | AutoGen models collaboration as an open-ended conversation with unknown round count; CrewAI models it as discrete tasks with a known or plannable order assigned to roles |
| AutoGen vs LangGraph, one-line? | AutoGen trades precise control for conversational flexibility; LangGraph gives you an explicit, hand-wired graph with precise branching and state control |
| What is AG2? | A community-maintained fork of AutoGen that split off after a governance disagreement, continuing an architecture closer to the pre-0.4 design under separate stewardship |
| What are the three layers in AutoGen's 0.4 rearchitecture? | Core (low-level, event-driven agent runtime), AgentChat (higher-level conversational API), Extensions (integrations for either layer) |
| What should you measure before shipping a conversation-driven design? | Quality and cost/latency/predictability against a fixed-pipeline or single-agent baseline on a golden set — never assume conversational orchestration is better without measuring |
| Is an AutoGen conversation transactional? | No — several turns, and any code they executed, may have already happened even if a later turn fails; handle partial completion explicitly |
`,

  mcqs: `
**1. What is the primary distinction between an AssistantAgent and a UserProxyAgent in AutoGen?**

A) They are functionally identical, just named differently  B) AssistantAgent is an LLM-backed reasoner that proposes solutions (including code) but never executes anything, while UserProxyAgent can execute code and relay human input  C) UserProxyAgent cannot use an LLM at all under any configuration  D) AssistantAgent always requires human approval before replying

**Answer: B** — this split mirrors a code-review-style separation of concerns: one participant proposes, another gates and executes.

**2. Why is relying solely on a termination phrase (e.g., "TERMINATE") considered risky in production?**

A) AutoGen does not support termination phrases  B) An LLM can fail to emit, paraphrase, or prematurely emit the phrase, so a numeric ceiling is needed as a mandatory backstop  C) Termination phrases only work with GroupChat, not two-agent conversations  D) Termination phrases disable code execution

**Answer: B** — always pair a phrase-based check with max_round/max_consecutive_auto_reply as a circuit breaker.

**3. What is the recommended default for running LLM-generated code in AutoGen?**

A) Directly on the host process, for simplicity  B) In a fully isolated, timeout-bounded sandbox such as a Docker-backed executor  C) Only inside a Jupyter notebook, which is inherently safe  D) AutoGen does not support code execution at all

**Answer: B** — unsandboxed execution of LLM-generated code is a genuine security risk, not a hypothetical one.

**4. Why do two LLM-backed agents in conversation sometimes "agree" quickly without real progress?**

A) This never happens if both agents use the same model  B) Subjective LLM-to-LLM review, without an external rubric or test suite, frequently converges on confident agreement regardless of actual correctness  C) AutoGen forces agents to disagree by default  D) It only happens when human_input_mode is set to ALWAYS

**Answer: B** — mitigations include giving a critic agent an objective, external check (tests, a rubric) rather than trusting subjective review alone.

**5. What does the GroupChatManager's speaker_selection_method control?**

A) Which LLM provider is used for the whole conversation  B) How the next speaker in a multi-agent conversation is chosen each round (e.g., auto/LLM-driven, round_robin, manual, or constrained transitions)  C) Whether code execution is sandboxed  D) The maximum token length of any single message

**Answer: B** — "auto" adds a real per-round LLM call and unpredictability; round_robin or explicit transition constraints are cheaper and more predictable once a workflow's shape is known.

**6. How does AutoGen's core mental model differ most from CrewAI's?**

A) AutoGen cannot execute code; CrewAI can only execute code  B) AutoGen models collaboration as an open-ended conversation with an unknown number of turns; CrewAI structures work as discrete tasks with a known or plannable order assigned to specialized roles  C) They are functionally identical frameworks with different names  D) CrewAI does not support multiple agents

**Answer: B** — AutoGen is a better fit when the value genuinely comes from iterative, open-ended dialogue; CrewAI is a better fit when the division of labor is knowable in advance.
`,

  "revision-notes": `
**Core model in 4 lines:** Every AutoGen participant is, underneath, a ConversableAgent that sends/receives messages and generates replies via pluggable logic. AssistantAgent specializes it as an LLM-backed reasoner that proposes solutions (including code) but never executes anything; UserProxyAgent specializes it as a human/executor stand-in that can run proposed code (ideally sandboxed) and relay real or simulated human input. For more than two participants, GroupChat plus a GroupChatManager coordinates turn-taking via a configurable speaker-selection method. Underneath, every agent's individual turn is the same single-agent generate-a-reply step covered in Agent Fundamentals — a conversation is a coordination layer, not a different execution primitive.

**Termination and safety in 4 lines:** Every conversation needs an explicit stopping mechanism — a termination-phrase check (is_termination_msg) paired with a hard numeric ceiling (max_consecutive_auto_reply, max_round), never the phrase alone, since an LLM can fail to emit it reliably. Code execution should always run in a fully isolated, timeout-bounded sandbox (Docker-backed), never unsandboxed, since LLM-generated code is untrusted input. Human-in-the-loop is a configurable spectrum (human_input_mode) that should be treated as a real security/quality control point, not a rate-limiting convenience.

**Failure modes in 3 lines:** Conversations that loop without terminating are usually caused by fragile phrase-matching with no numeric backstop — fix with a robust check plus a hard ceiling. Agents agreeing without real progress happens when critique is purely subjective LLM-to-LLM judgment — fix by giving a critic agent an external, objective rubric or test suite. Cost blowup from long GroupChats comes from multiplying agents, rounds, and (under "auto" selection) speaker-selection calls — default to the smallest roster and the most constrained selection method the task allows.

**Production and ecosystem in 4 lines:** Log full transcripts and per-conversation cost/turn-count; test outcome properties and structural wiring, never exact transcript text; treat conversations as non-transactional, since earlier turns (and their cost, and any code they ran) may have already happened before a later turn fails. Compared to alternatives: CrewAI offers a more declarative, predictable task-based model when the division of labor is known; LangGraph offers precise, hand-wired control over branching and state; the OpenAI Agents SDK offers a lighter-weight alternative. AutoGen's own architecture split into Core, AgentChat, and Extensions (with a parallel community fork, AG2), reflecting the same tension every multi-agent framework eventually faces between flexible emergent behavior and predictable, bounded execution.

**The one discipline that matters most:** never adopt conversation-driven orchestration on pattern-popularity alone — justify it with a golden-set comparison against a fixed-pipeline or single-agent baseline, because the coordination risk (non-termination, agreement without progress, multiplied LLM cost) is real and consistently underestimated relative to the perceived benefit of "letting agents figure it out together."
`,

  "learning-roadmap": `
A realistic path to production-level AutoGen fluency:

**Week 1 — Foundations.** Beginner Concepts + Lab 1. Build your first two-agent (assistant/user-proxy) coding conversation with sandboxed execution and inspect its raw, non-deterministic transcript across several runs. Milestone: you can explain how a message flows from proposal, to sandboxed execution, to the assistant's next reply.

**Week 2 — The honest cost/benefit question.** Intermediate Concepts + Lab 2. Implement the same iterative coding task as an AutoGen conversation and as a fixed, no-feedback-loop pipeline, and measure correctness, tokens, and latency for both. Milestone: you have real numbers, not a feeling, for whether the conversational model was worth it for your specific task.

**Week 3 — Failure modes and objective verification.** Advanced Concepts + Lab 3. Deliberately reproduce the "agents agreeing too easily" failure with a subjective critic, then fix it with an objective test-suite-based check. Milestone: you can diagnose and fix a coordination bug that would otherwise silently ship a wrong answer.

**Week 4 — Internals and GroupChat.** Internal Working, Architecture, Data Flow, and the GroupChat/speaker-transition sections of Advanced Concepts. Rebuild your two-agent conversation as a constrained three-agent GroupChat with explicit allowed transitions. Milestone: you can explain, from memory, exactly what happens between initiate_chat and the final ChatResult, for both two-agent and GroupChat conversations.

**Week 5 — Production.** Production Usage through Deployment sections; Lab 4. Ship a containerized conversation service with async execution for long-running paths, termination guardrails, structured logging, and health checks, with the sandbox running as a separate isolated container. Milestone: a working, guardrailed, evaluated AutoGen service on your GitHub.

**Week 6 — Ecosystem and judgment.** Read the Comparisons section closely against the CrewAI and LangGraph skills. Milestone: you can justify, out loud and with evidence, when you'd choose AutoGen, CrewAI, LangGraph, or a single agent for a given new problem.

Then continue to the **CrewAI** skill for the role-based, task-declarative alternative, or the **LangGraph** skill for explicit graph-based control flow, to round out the multi-agent orchestration landscape this page situates AutoGen within.
`,

  "official-docs": `
- [Microsoft AutoGen documentation](https://microsoft.github.io/autogen/) — the primary reference for ConversableAgent, AssistantAgent, UserProxyAgent, GroupChat, and the layered Core/AgentChat/Extensions architecture; check this before trusting any tutorial's specific class names or import paths, given how substantially the framework's structure has changed.
- [Microsoft AutoGen GitHub repository](https://github.com/microsoft/autogen) — release notes and the examples/ directory are often the most current source of truth for API usage, especially across the 0.4 rearchitecture.
- [AG2 documentation and repository](https://github.com/ag2ai/ag2) — the community-maintained fork's own docs; check which project (AutoGen or AG2) a given tutorial or dependency actually targets before assuming API compatibility.
- [AutoGen founding paper](https://arxiv.org/abs/2308.08155) — "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation" (Wu et al., 2023), the original formalization of the conversation-driven multi-agent model.
`,

  books: `
- There is no single widely recognized, edition-stable book dedicated specifically to AutoGen as of the author's knowledge cutoff — the framework has changed architecture substantially (the 0.4 rearchitecture, the AG2 fork) fast enough that book-length treatments age quickly; the official documentation and GitHub examples are the more reliable primary source.
- Recent general titles on **multi-agent LLM system design** covering conversation-driven and role-based patterns side by side are emerging; verify a specific title's publication date against how current you need the framework-specific details to be, especially anything predating the 0.4 rearchitecture.
- **Designing Machine Learning Systems** — Chip Huyen. Not AutoGen-specific, but the strongest general treatment of the production-ML-system thinking (evaluation, monitoring, cost accounting) that transfers directly to production multi-agent conversational systems.
- For the underlying single-agent and reflection concepts AutoGen composes, see the **books** listed on the **Agent Fundamentals** and **Reflection** skill pages — those foundations age much more slowly than any specific framework's API.
`,

  blogs: `
- **Microsoft Research and the AutoGen team's own blog/documentation updates** — the most reliable source for framework-specific patterns and the rationale behind the 0.4 rearchitecture, maintained by the team that ships the code.
- **AG2's own community blog/documentation** — worth reading specifically for contrast with mainline AutoGen, since the fork has continued to evolve independently.
- **CrewAI's and LangChain/LangGraph's own blogs** — worth reading specifically for contrast, since they articulate philosophically different (declarative task-based, and explicit graph-first, respectively) approaches to the same underlying multi-agent coordination problem AutoGen solves conversationally.
- General AI-engineering newsletters/blogs (see the **Agent Fundamentals** and **Planning** skill pages' blog lists) frequently cover multi-agent coordination patterns and failure modes even when not naming AutoGen explicitly.
`,

  "research-papers": `
- **"AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation"** (Wu et al., 2023) — the foundational paper formalizing ConversableAgent, multi-agent conversation, and code-execution-centric workflows; the essential starting point for this skill.
- **"ReAct: Synergizing Reasoning and Acting in Language Models"** (Yao et al., 2022) — the foundational reasoning-acting loop underlying every individual AutoGen agent's own execution turn, covered in depth in the Agent Fundamentals skill.
- **"Reflexion: Language Agents with Verbal Reinforcement Learning"** (Shinn et al., 2023) — closely related to AutoGen's critic/producer conversational pattern, and directly relevant background for understanding why self- or peer-critique needs grounding (external verification) to reliably improve outcomes, covered in depth in the Reflection skill.
- **"Generative Agents: Interactive Simulacra of Human Behavior"** (Park et al., 2023) — early, influential work on giving LLM agents persistent identity/role framing and observing emergent multi-agent social behavior, conceptually adjacent to AutoGen's conversational agents.
- **"Communicative Agents for Software Development"** (the CAMEL / role-playing multi-agent line of work, Li et al., 2023) — closely related conversational multi-agent research, worth reading alongside the AutoGen paper for a broader view of the conversation-driven design space.
- For task decomposition and planning theory more broadly, see the foundational reading list on the **Planning** skill page rather than AutoGen-specific sources, since the underlying coordination theory predates and is broader than any one framework's implementation.
`,

  videos: `
- **AutoGen team talks and demos from Microsoft Research** (various conference and community appearances) — the creators explaining design rationale directly, including the motivation behind the 0.4 Core/AgentChat rearchitecture.
- **AG2 community talks and documentation walkthroughs** — useful for understanding how the fork's philosophy and roadmap have diverged from mainline AutoGen since the split.
- **Comparative multi-agent framework talks** from AI Engineer Summit and similar conferences, where AutoGen, CrewAI, and LangGraph are discussed side by side — directly useful for internalizing the Comparisons section's tradeoffs from multiple practitioners' perspectives.
- **DeepLearning.AI's multi-agent short courses** (various, including material built around AutoGen) — structured walkthroughs of conversational agent design and common pitfalls.
- Caution: given the framework's substantial architectural change (the 0.4 rearchitecture and the AG2 fork), prefer videos dated within the last year or so, and verify specific code shown still matches current imports/class names and which project (AutoGen or AG2) it targets before copying it.
`,

  "github-repos": `
- [microsoft/autogen](https://github.com/microsoft/autogen) — the main repository; the examples/ and docs/ directories are often the most current source of truth for AssistantAgent/UserProxyAgent/GroupChat usage across the 0.4 architecture.
- [ag2ai/ag2](https://github.com/ag2ai/ag2) — the community-maintained fork; useful to browse alongside mainline AutoGen to understand where the two have diverged.
- [microsoft/magentic-one (or its successor documentation)](https://github.com/microsoft) — Microsoft's general-purpose multi-agent system built on AutoGen's Core runtime, a useful reference for a production-grade system built on the framework's lower-level layer.
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — worth browsing specifically to contrast its declarative task-based approach with AutoGen's conversational model, for the Comparisons section.
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — the explicit graph/state-machine alternative, useful to read side by side with AutoGen's emergent conversational model.
- [openai/openai-agents-python](https://github.com/openai/openai-agents-python) — the OpenAI Agents SDK, useful as a lightweight-abstraction contrast point.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *ConversableAgent fluency*: build a bare ConversableAgent (not AssistantAgent/UserProxyAgent) and configure its reply logic manually with a custom function, to understand what the specialized classes actually add on top of the base class.
2. *Termination fluency*: write three different is_termination_msg functions of increasing robustness (exact match, case-insensitive substring, a check that also verifies the executor's last reported exit code was zero) and compare how often each correctly detects a genuinely complete conversation.
3. *Sandboxing fluency*: configure a Docker-backed executor with a restrictive timeout and a minimal base image, then deliberately submit a slow or infinite-looping generated snippet and confirm the timeout actually fires.
4. *Speaker-selection fluency*: implement the same three-agent task once with speaker_selection_method="auto" and once with explicit allowed_or_disallowed_speaker_transitions; compare cost, latency, and whether the conversation's actual speaking order differs meaningfully.
5. *Critic verification fluency*: reproduce the "agents agreeing too easily" failure with a subjective critic on a deliberately flawed solution, then fix it with an objective test-suite-based check (Coding Question 3), and quantify the improvement in bug-catch rate.
6. *Loop detection*: build the near-duplicate-message detector from Coding Question 2 and validate it against both a genuinely looping conversation and a genuinely long-but-productive one, tuning the similarity threshold to minimize false positives.
7. *Fixed pipeline vs conversation*: for any of the above tasks, build the fixed-pipeline equivalent (no feedback loop) and run both against a 15-20 item golden set, reporting correctness, token cost, and latency for each — this is the exercise this page argues you should run before shipping any conversation-driven design in practice.
8. *Nested chats*: implement a main conversation that, mid-way, spins off a nested sub-conversation with a different, narrower agent roster for a specialist sub-task, and folds the result back into the main conversation as a single reply.

External sets: multi-agent benchmark tasks and collaborative code-generation benchmarks from the broader agent-research literature; any dataset with a golden-answer set (coding problems with known test suites are especially well-suited) repurposed as a quality baseline for comparing conversation-driven versus fixed-pipeline approaches.
`,

  "architecture-diagram": `
The reference production architecture for an AutoGen-based service — the shape most real deployments converge on once they move past a single, open-ended, unconstrained GroupChat:

~~~mermaid
flowchart TB
    Client["Client app"] --> LB["Load balancer"]
    LB --> API["API layer (sync for short two-agent\nconversations, async job queue for\nlong/GroupChat/human-in-the-loop ones)"]

    subgraph Convo["Constrained conversation"]
        UP["UserProxyAgent\n(execution gate, termination check)"]
        Coder["AssistantAgent: Coder"]
        Critic["AssistantAgent: Critic\n(objective test-suite check)"]
    end
    API --> UP
    UP --> Coder
    Coder --> Critic
    Critic -->|LGTM or feedback| UP

    UP -->|extract + run| Sandbox["Isolated code-execution sandbox\n(separate Docker container, timeout)"]
    Sandbox -->|result| UP

    Convo --> API
    API --> Client

    subgraph Obs["Observability"]
        Logs["Structured logs\n(full transcript, per-turn tokens/latency)"]
        Metrics["Round count, clean-termination rate,\ncost per conversation"]
        EvalJob["Golden-set eval job\n(conversation vs fixed-pipeline baseline)"]
    end
    Convo -.-> Obs
~~~

Every box maps to a section on this page: the constrained conversation roster to Architecture and Best Practices, the isolated sandbox to Security and Deployment, the sync/async API split to Deployment, and the Observability subgraph to Monitoring and Testing.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((AutoGen))
    Core primitives
      ConversableAgent
      AssistantAgent (LLM reasoner)
      UserProxyAgent (human/executor)
      GroupChat + GroupChatManager
      Nested chats
    Coordination
      Shared message history
      Termination (phrase + numeric ceiling)
      Speaker selection
        auto (LLM-driven)
        round_robin
        allowed/disallowed transitions
      Custom reply functions (register_reply)
    Code execution
      Sandboxed executor (Docker, timeout)
      Propose vs execute separation
      Human-in-the-loop (human_input_mode)
    Failure modes
      Non-terminating conversations
      Agents agreeing without progress
      Cost blowup from long GroupChats
      Non-transactional partial failure
    Internals
      generate_reply per turn
      Speaker-selection LLM call (GroupChat)
      ChatResult: history + summary + cost
    Architecture evolution
      Original single-layer ConversableAgent
      0.4 rearchitecture: Core / AgentChat / Extensions
      AG2 community fork
      Magentic-One (built on Core)
    Production
      Timeouts (LLM + sandbox)
      Async execution for long conversations
      Per-turn cost/latency tracking
      Security: sandboxing, injection propagation
      Testing: outcome-based, never exact transcript
    Ecosystem
      Agent Fundamentals
      Tool Calling
      Reflection
      Planning
      CrewAI (task/role-based)
      LangGraph (explicit graph control)
      OpenAI Agents SDK (lightweight alternative)
    Judgment
      Conversation vs fixed pipeline tradeoff
      Measure before adopting conversational orchestration
      Objective verification beats subjective critique
~~~
`,
};

export default autogen;
