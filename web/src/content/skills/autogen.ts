import type { SkillContent } from "../types";

const autogen: SkillContent = {
  overview: `
AutoGen is Microsoft's open-source, research-originated framework for multi-agent orchestration, distinguished by its **conversation-centric** design philosophy: rather than modeling agent collaboration as an explicit graph (**LangGraph**) or a role/task/crew hierarchy (**CrewAI**) or lightweight handoffs (**OpenAI Agents SDK**), AutoGen models multi-agent collaboration as a **structured conversation** between agents — each agent is fundamentally a "conversable" participant that sends and receives messages, with the overall workflow emerging from the pattern of message exchange between agents rather than from an externally-imposed graph or role hierarchy.

AutoGen's core abstractions reflect this conversation-first framing: a **ConversableAgent** is the base building block, capable of generating replies and optionally invoking tools; a common, particularly influential pattern is pairing an **AssistantAgent** (an LLM-powered agent producing responses/code) with a **UserProxyAgent** (representing a human or an automated proxy that can execute code and provide feedback, directly connecting to **Agent Fundamentals**' human-in-the-loop concept); and **GroupChat** coordinates conversation among more than two agents, with a **GroupChatManager** determining which agent speaks next. This conversational framing has proven particularly well-suited to code-generation and code-execution workflows, where an assistant proposes code and a user-proxy agent actually executes it and reports results back.

Key characteristics: **conversable agents**, the fundamental message-passing building block; **the assistant/user-proxy pairing**, directly enabling automated code generation-execution-feedback loops; **GroupChat**, coordinating multi-agent conversations beyond simple pairs; **code execution as a first-class capability**, distinguishing AutoGen's practical emphasis from other frameworks' more general tool-use framing; and **flexible conversation patterns**, letting engineers define custom speaker-selection and termination logic for genuinely complex multi-agent dialogues.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2023 | **AutoGen** is released by Microsoft Research as an open-source framework, introducing its conversation-centric multi-agent design and gaining particular attention for its effectiveness at automated code-generation-and-execution workflows |
| 2023–2024 | AutoGen's **GroupChat** abstraction is introduced, extending the framework beyond simple two-agent (assistant/user-proxy) conversations toward coordinated multi-agent group dialogues with configurable speaker-selection logic |
| 2024 | **AutoGen Studio** is introduced as a lower-code/no-code interface for building and testing AutoGen-based multi-agent systems, broadening accessibility beyond pure code-based configuration |
| 2024 | A significant **architectural restructuring (AutoGen 0.4 / "AgentChat")** introduces a more modular, extensible core, addressing some scalability and maintainability concerns from the framework's original, more monolithic design |
| 2024–2025 | Continued growth of AutoGen specifically within research-oriented and code-generation-heavy multi-agent use cases, alongside continued refinement of its conversational abstractions and integration with Microsoft's broader AI tooling ecosystem |

AutoGen's history directly reflects its origins as a MICROSOFT RESEARCH project — its conversation-centric design and particular strength in code-generation workflows trace back to research questions about how multiple LLM-powered agents can collaborate through natural, flexible dialogue, distinct from the more product-oriented, opinionated design paths taken by **LangGraph**, **CrewAI**, and the **OpenAI Agents SDK**.
`,

  "why-it-exists": `
AutoGen exists because a genuinely common and valuable multi-agent pattern — an AI assistant proposing a solution (often code), a separate process actually EXECUTING that proposal and reporting back real results, and the assistant iteratively refining its approach based on this feedback — is naturally modeled as a CONVERSATION between two (or more) distinct participants, directly extending **Agent Fundamentals**' plan-act-observe loop into an explicitly multi-participant dialogue rather than a single agent's internal loop.

AutoGen solves this by providing CONVERSABLE AGENTS as its fundamental abstraction, with the particularly influential assistant/user-proxy pairing directly supporting automated code-generation-execution-feedback loops, and GROUPCHAT extending this conversational model to coordinate more than two participants — giving engineers a framework specifically well-suited to workflows that genuinely resemble a back-and-forth dialogue between distinct, collaborating agents, rather than a more rigid graph or role-hierarchy structure.
`,

  "problem-it-solves": `
AutoGen addresses the **"how do we model and orchestrate multi-agent collaboration that genuinely resembles a flexible, back-and-forth conversation, particularly for code-generation-and-execution workflows"** challenge.

Concretely, AutoGen's abstractions provide:

- **ConversableAgents**, a flexible, message-passing base abstraction directly supporting a wide variety of multi-agent dialogue patterns.
- **The assistant/user-proxy pairing**, directly enabling automated code-generation, execution, and feedback loops — a particularly well-suited pattern for coding-assistant applications, extending **Agent Fundamentals**' tool-use concept to treat CODE EXECUTION itself as a first-class capability.
- **GroupChat and GroupChatManager**, coordinating conversation among more than two agents with configurable speaker-selection logic, directly extending **Agent Fundamentals**' multi-agent decomposition concept to genuinely dialogue-based (rather than graph- or role-based) coordination.
- **Human-in-the-loop integration via UserProxyAgent**, directly connecting to **Agent Fundamentals**' own autonomy-level treatment — a user-proxy agent can be configured to require human input at specific points in the conversation.

What AutoGen does **not** solve, or solves only partially: its conversation-centric model, while flexible, can be less STRUCTURALLY explicit than LangGraph's graph model for workflows requiring precise, deterministic conditional branching (a conversation's flow emerges from agent message-generation, which is less directly inspectable/controllable than an explicit graph's nodes and edges); and it inherits every underlying reliability challenge covered throughout the LLMs category (hallucination compounding across a multi-agent conversation, directly connecting to **Agent Fundamentals**' own compounding-error treatment).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain AutoGen's conversation-centric design philosophy and its core ConversableAgent abstraction.
2. Construct a simple assistant/user-proxy pair implementing a code-generation-execution-feedback loop.
3. Configure a GroupChat coordinating conversation among more than two agents.
4. Explain how AutoGen's UserProxyAgent implements Agent Fundamentals' human-in-the-loop concept.
5. Compare AutoGen's conversational model against LangGraph's explicit graph model and CrewAI's role-based model.
6. Recognize AutoGen anti-patterns: unbounded conversation turns, and unsafe automatic code execution.
7. Answer senior-level interview questions on AutoGen's conversational architecture and its tradeoffs versus alternative frameworks.
`,

  prerequisites: `
- **Required**: **Agent Fundamentals** (the multi-agent decomposition and human-in-the-loop concepts AutoGen concretely implements via its conversational model), **Guardrails** (relevant to AutoGen's code-execution safety considerations).
- **Very helpful**: familiarity with **LangGraph** and **CrewAI**, providing useful comparative context for AutoGen's distinctly conversational design.

Dependency chain: **Agent Fundamentals** → **LangChain** → **LangGraph** → **CrewAI** → **OpenAI Agents SDK** → this page (AutoGen) → **Agent Memory** and the remaining capability-focused skills.
`,

  "beginner-concepts": `
### A simple assistant/user-proxy pair

~~~python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent(
    name="assistant",
    system_message="You are a helpful coding assistant.",
    llm_config={"model": "gpt-4"},
)
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",  # fully automated, no human
                                 # prompt at each turn
    code_execution_config={"work_dir": "coding", "use_docker": False},
)

user_proxy.initiate_chat(assistant, message="Write and run a Python script that prints the first 10 Fibonacci numbers.")
~~~

The assistant PROPOSES code, and the user-proxy agent EXECUTES it (directly extending **Agent Fundamentals**' tool-use concept, treating code execution itself as a tool) and reports the actual result back to the assistant — directly implementing a plan-act-observe loop, but with the "acting" and "observing" happening through a genuinely distinct, second conversational participant rather than within a single agent's own internal loop.

### Why this differs from a single-agent tool-use loop

~~~
In a single-agent framework (LangChain's AgentExecutor, or the
OpenAI Agents SDK's Agent), one agent decides on an action AND
executes it (via a tool call) within its own internal loop.
AutoGen's assistant/user-proxy pattern explicitly SEPARATES
these roles into two distinct conversational participants --
the assistant proposes, the user-proxy executes and reports
back -- directly modeling this as an actual CONVERSATION
between two parties rather than one agent's internal process.
~~~

### human_input_mode: connecting to Agent Fundamentals' autonomy levels

~~~python
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="ALWAYS",  # requires explicit human
                                  # input/approval at every turn --
                                  # directly implementing Agent
                                  # Fundamentals' fully human-
                                  # supervised autonomy tier
)
~~~

\`human_input_mode\` can be set to \`"NEVER"\` (fully autonomous), \`"ALWAYS"\` (fully human-supervised, directly implementing **Agent Fundamentals**' most conservative autonomy tier), or \`"TERMINATE"\` (human input requested only when the conversation would otherwise end) — directly, concretely implementing the platform's own autonomy-level spectrum.
`,

  "intermediate-concepts": `
### GroupChat: coordinating more than two agents

~~~python
from autogen import GroupChat, GroupChatManager

groupchat = GroupChat(
    agents=[planner, coder, reviewer, user_proxy],
    messages=[],
    max_round=15,  # directly reuses Agent Fundamentals'
                     # bounded-iteration safety-net guidance
)
manager = GroupChatManager(groupchat=groupchat, llm_config={"model": "gpt-4"})
user_proxy.initiate_chat(manager, message="Build a script that analyzes this dataset.")
~~~

The \`GroupChatManager\` determines which agent speaks next at each turn (by default, using an LLM call to decide based on the conversation so far), directly analogous to a moderator in a human group discussion — a genuinely distinct coordination mechanism from **CrewAI**'s role/task/crew structure or **LangGraph**'s explicit graph edges.

### Code execution safety: a first-class AutoGen concern

~~~python
user_proxy = UserProxyAgent(
    name="user_proxy",
    code_execution_config={
        "work_dir": "coding",
        "use_docker": True,  # sandboxed execution -- directly
                               # connects to the Guardrails
                               # skill's own action-level
                               # constraint guidance, applied
                               # specifically to code execution
    },
)
~~~

Since AutoGen's assistant/user-proxy pattern often involves AUTOMATICALLY EXECUTING model-generated code, sandboxing (e.g., via Docker) is a genuinely important safety practice, directly extending **Agent Fundamentals**' and **Guardrails**' action-level constraint guidance to this specific, code-execution context.

### Custom speaker-selection logic

~~~python
def custom_speaker_selection(last_speaker, groupchat):
    if last_speaker is planner:
        return coder
    elif last_speaker is coder:
        return reviewer
    return planner  # cycle back for revision, directly
                      # analogous to LangGraph's own cycle concept

groupchat = GroupChat(agents=[...], messages=[], speaker_selection_method=custom_speaker_selection)
~~~

This lets an engineer impose more DETERMINISTIC, explicit control over conversation flow, directly narrowing the gap between AutoGen's flexible conversational model and LangGraph's more explicit graph-based control when a specific workflow genuinely benefits from it.
`,

  "advanced-concepts": `
### AutoGen's conversational model versus LangGraph's explicit graph model

~~~
AutoGen's DEFAULT speaker-selection (an LLM call deciding
who speaks next based on the conversation) is genuinely
FLEXIBLE and can adapt to unanticipated conversational
directions, but is LESS STRUCTURALLY EXPLICIT and
deterministic than LangGraph's graph model -- a senior
engineer choosing between them weighs this flexibility-
versus-explicitness tradeoff against the specific workflow's
genuine need for adaptability versus precise, deterministic control.
~~~

### Nested chats: composing conversations hierarchically

~~~
AutoGen supports NESTED CHATS, where a single "turn" within
an outer conversation can itself trigger an entire, separate
inner conversation between a different set of agents (e.g.,
a coder agent's turn might internally involve a nested
debugging conversation with a specialized debugger agent) --
directly analogous to LangGraph's subgraph concept (covered
in the LangGraph skill), providing modularity within
AutoGen's conversational framing.
~~~

### The AutoGen 0.4 / AgentChat architectural restructuring

~~~
AutoGen's more recent architectural evolution toward a more
modular, extensible core (separating a lower-level "Core"
layer from the higher-level "AgentChat" conversational
abstractions) directly reflects the SAME kind of accumulated-
practical-experience-driven evolution covered in the LangChain
skill's own case study on LCEL's introduction -- even a
well-established framework benefits from architectural
evolution as genuine production experience reveals an
earlier design's limitations.
~~~

### Bounding conversation length: a direct extension of Agent Fundamentals

~~~
GroupChat's max_round parameter, and individual agents'
own conversation-termination conditions (e.g., a specific
"TERMINATE" keyword the assistant is instructed to produce
when a task is complete), directly implement Agent
Fundamentals' loop-safety guidance at the level of an
entire multi-agent CONVERSATION rather than a single
agent's internal iteration count.
~~~
`,

  "internal-working": `
Tracing an assistant/user-proxy code-generation-execution loop:

~~~mermaid
sequenceDiagram
    participant UserProxy as User Proxy Agent
    participant Assistant as Assistant Agent
    participant Sandbox as Code Execution Sandbox

    UserProxy->>Assistant: initiate_chat("Write a script that...")
    Assistant->>Assistant: generate proposed\nPython code
    Assistant->>UserProxy: message containing\nproposed code
    UserProxy->>Sandbox: execute the proposed\ncode (sandboxed)
    Sandbox->>UserProxy: execution result\n(output or error)
    UserProxy->>Assistant: message containing\nthe execution result
    Assistant->>Assistant: if error: revise code;\nif success: report\ncompletion
    Assistant->>UserProxy: final message\n(e.g., "TERMINATE")
~~~

1. **The user-proxy agent initiates the conversation**, sending the initial task description to the assistant agent.
2. **The assistant agent generates a proposed response** (here, Python code), directly analogous to **Agent Fundamentals**' planning step.
3. **The user-proxy agent EXECUTES this proposal** (directly the "act" step, treating code execution as a first-class capability) within a sandboxed environment, and reports the actual result back as the next conversational turn.
4. **This cycle repeats** — the assistant revising its approach based on the observed execution result — until the assistant's own message indicates task completion (e.g., a designated termination signal), directly implementing **Agent Fundamentals**' plan-act-observe loop through an explicit, two-participant CONVERSATION.

**Why this matters**: this trace demonstrates precisely how AutoGen's conversational framing implements the SAME foundational plan-act-observe loop covered in **Agent Fundamentals**, but with the "acting" and "observing" steps explicitly mediated through a second, distinct conversational participant (the user-proxy) rather than occurring within a single agent's own internal tool-calling mechanics.
`,

  architecture: `
A senior AI engineer thinks about AutoGen architecture in terms of deliberately choosing conversational patterns (simple pairing versus GroupChat) matched to a task's genuine collaboration structure, and applying rigorous code-execution safety practices given AutoGen's particular strength in automated coding workflows.

### Choosing a conversational pattern

~~~mermaid
flowchart TB
    Task["A given multi-agent task"] --> Q{"Does the task involve\ncode generation and\nexecution feedback?"}
    Q -->|Yes| Pairing["Assistant/User-Proxy pairing\n(with sandboxed execution)"]
    Q -->|"No, but multiple\nspecialized agents\nneed to converse"| GroupChat["GroupChat with an\nappropriate speaker-\nselection strategy"]
~~~

### Applying rigorous code-execution safety

A senior practitioner treats automated code execution (a distinguishing AutoGen capability) with the same rigor as any other high-risk agent action covered in **Agent Fundamentals** and **Guardrails** — sandboxing (e.g., via Docker), and considering \`human_input_mode="ALWAYS"\` for genuinely high-stakes execution contexts.
`,

  "data-flow": `
Tracing a request through a GroupChat with a human-in-the-loop checkpoint:

~~~mermaid
sequenceDiagram
    participant UserProxy as User Proxy (human_input_mode)
    participant Manager as GroupChatManager
    participant Planner
    participant Coder
    participant Reviewer

    UserProxy->>Manager: initiate_chat("Build a data pipeline")
    Manager->>Planner: select next speaker: Planner
    Planner->>Manager: proposed plan
    Manager->>Coder: select next speaker: Coder
    Coder->>Manager: proposed implementation
    Manager->>Reviewer: select next speaker: Reviewer
    Reviewer->>Manager: review feedback\n(approve or request changes)
    Manager->>UserProxy: if human_input_mode requires it,\nrequest explicit human review\nbefore finalizing
    UserProxy->>Manager: approve (or provide\nfurther guidance)
    Manager->>UserProxy: final result
~~~

The critical detail: the \`GroupChatManager\` dynamically selects the next speaker at each turn (by default via its own LLM-driven reasoning), and the user-proxy agent's \`human_input_mode\` configuration determines exactly when, if at all, genuine human review is required before the conversation concludes — directly implementing **Agent Fundamentals**' autonomy-level spectrum concretely within a multi-participant conversational structure.
`,

  "production-usage": `
### A representative production AutoGen setup with sandboxed execution and bounded rounds

~~~python
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",  # request human input only
                                      # when the conversation would
                                      # otherwise end -- a
                                      # middle-ground autonomy tier
    code_execution_config={"work_dir": "coding", "use_docker": True},
    max_consecutive_auto_reply=10,  # directly reuses Agent
                                       # Fundamentals' bounded-
                                       # iteration guidance
)

groupchat = GroupChat(agents=[planner, coder, reviewer, user_proxy], messages=[], max_round=20)
manager = GroupChatManager(groupchat=groupchat, llm_config={"model": "gpt-4"})
~~~

### Non-negotiables for production AutoGen applications

1. **Sandbox all automated code execution** (e.g., via Docker), directly reusing **Guardrails**' action-level constraint guidance for this specific, high-risk capability.
2. **Bound conversation length explicitly** (\`max_round\`, \`max_consecutive_auto_reply\`), directly reusing **Agent Fundamentals**' loop-safety guidance.
3. **Choose \`human_input_mode\` deliberately**, matched to the genuine stakes of the task, directly reusing **Agent Fundamentals**' autonomy-calibration guidance.
4. **Design a clear termination signal/condition**, avoiding an unproductive, indefinite conversation.
5. **Choose the appropriate conversational pattern** (simple pairing vs. GroupChat) matched to the task's genuine collaboration structure.

### Common production patterns

- **Automated code-generation-execution-review pipelines**, leveraging AutoGen's particular strength in this exact use case.
- **Multi-perspective GroupChat discussions**, coordinating specialized agents (planner, implementer, reviewer) toward a synthesized outcome.
- **Human-in-the-loop code review**, using \`human_input_mode="ALWAYS"\` or \`"TERMINATE"\` for genuinely high-stakes code-execution contexts.
`,

  "industry-examples": `
- **Automated coding-assistant research and tooling**, directly leveraging AutoGen's assistant/user-proxy code-generation-execution pattern.
- **Microsoft's own broader AI tooling ecosystem**, with AutoGen positioned as a research-driven, conversation-centric complement to more product-oriented frameworks.
- **Multi-agent research prototyping**, where AutoGen's flexible GroupChat model is used to explore emergent multi-agent collaboration patterns.
`,

  "best-practices": `
1. **Sandbox all automated code execution**, directly reusing **Guardrails**' action-level constraint guidance.
2. **Bound conversation length explicitly** (\`max_round\`, \`max_consecutive_auto_reply\`), directly reusing **Agent Fundamentals**' loop-safety guidance.
3. **Choose \`human_input_mode\` deliberately**, matched to genuine task stakes.
4. **Design a clear, explicit termination condition/signal** for every conversation pattern.
5. **Choose the appropriate conversational pattern** (assistant/user-proxy pairing vs. GroupChat) matched to the task's genuine structure.
6. **Consider custom speaker-selection logic** when a GroupChat's conversation flow needs more deterministic, explicit control.
7. **Treat all conversational messages between agents as potentially untrusted**, directly reusing the **LangChain** skill's own prompt-injection guidance in a multi-agent context.
`,

  "anti-patterns": `
### Unsandboxed automatic code execution

~~~
# WRONG — running a UserProxyAgent's code_execution_config
# without sandboxing (use_docker=False) in a production
# context processing untrusted or model-generated code
# RIGHT — sandbox all automated code execution, directly
# reusing Guardrails' action-level constraint guidance
~~~

### Unbounded conversation length

~~~
# WRONG — a GroupChat or assistant/user-proxy conversation
# with no max_round or max_consecutive_auto_reply bound,
# risking an unproductive, expensive, indefinite conversation
# RIGHT — always bound conversation length explicitly,
# directly reusing Agent Fundamentals' loop-safety guidance
~~~

### Fully autonomous code execution for high-stakes tasks

~~~
# WRONG — using human_input_mode="NEVER" for a genuinely
# high-stakes code-execution context without any human
# review checkpoint
# RIGHT — choose human_input_mode deliberately (e.g.,
# "ALWAYS" or "TERMINATE") matched to the task's actual stakes
~~~

### Other production-grade anti-patterns

- **Using GroupChat for a task that's genuinely a simple, two-participant conversation**, adding unnecessary coordination overhead.
- **Not designing a clear termination signal**, risking an indefinite or awkwardly-ending conversation.
- **Treating inter-agent conversational messages as inherently trusted**, missing potential prompt-injection risk in a multi-agent context.
`,

  performance: `
### Rule zero: choose the simplest conversational pattern genuinely sufficient for the task

A simple assistant/user-proxy pairing is faster and more predictable than a full GroupChat — reserve GroupChat specifically for tasks genuinely requiring coordination among more than two distinct participants.

### The performance hierarchy (apply in order)

1. **Choose the appropriate conversational pattern** (pairing vs. GroupChat) matched to genuine collaboration needs.
2. **Bound conversation length explicitly**, avoiding wasted compute/cost from unproductive, lengthy conversations.
3. **Design efficient speaker-selection logic** for GroupChat, avoiding unnecessary additional LLM calls purely for turn-taking decisions where a simpler, deterministic rule would suffice.
4. **Sandbox code execution efficiently**, balancing genuine safety needs against the overhead sandboxing introduces.

### Micro-level facts worth knowing

- GroupChat's default speaker-selection mechanism itself involves an LLM call at each turn (deciding who speaks next), directly connecting to the **Inference** skill's own per-call cost treatment — a custom, deterministic speaker-selection function can reduce this overhead when the conversation's turn-taking pattern is genuinely predictable.
- Code execution sandboxing (e.g., Docker) introduces genuine latency overhead compared to unsandboxed execution — a deliberate tradeoff against the safety benefit it provides.
`,

  scalability: `
AutoGen's conversational architecture directly determines how confidently an organization can scale into additional collaborating agents within a genuinely multi-participant dialogue.

### How disciplined conversational design enables scaling

~~~mermaid
flowchart LR
    BoundedConversation["Bounded conversation length +\nclear termination + sandboxed\nexecution"] --> Reliable["Reliable, safe multi-agent\ncollaboration"]
    Reliable --> ConfidentScaling["Confident scaling to\nadditional collaborating\nagents in GroupChat"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A workflow requiring precise, deterministic conditional branching beyond conversational flexibility | Consider LangGraph, or custom speaker-selection logic to add more determinism |
| Unbounded conversation length running indefinitely | Set max_round and max_consecutive_auto_reply explicitly |
| Unsafe, unsandboxed code execution risk | Enable Docker-based sandboxing for all automated code execution |
| GroupChat coordination overhead for a simple two-participant task | Use a simple assistant/user-proxy pairing instead |
`,

  security: `
### AutoGen-specific security considerations, directly extending Agent Fundamentals and Guardrails

~~~
AutoGen's particular emphasis on AUTOMATED CODE EXECUTION
(via the user-proxy agent) represents a genuinely significant,
distinct risk surface compared to frameworks emphasizing more
general tool-use -- executing MODEL-GENERATED code
automatically requires the same rigorous action-level
guardrail thinking covered in Agent Fundamentals and
Guardrails, applied specifically and rigorously to this
particular capability.
~~~

### Essential AutoGen-related security practices

1. **Always sandbox automated code execution** (e.g., via Docker), never executing model-generated code directly against the host environment in production.
2. **Choose \`human_input_mode\` deliberately for high-stakes execution contexts**, directly reusing **Agent Fundamentals**' autonomy-calibration guidance.
3. **Treat inter-agent conversational messages as potentially untrusted**, directly reusing the **LangChain** skill's own prompt-injection guidance in a multi-agent context.
4. **Limit the sandboxed execution environment's own permissions/network access** to the minimum genuinely necessary.

See **Agent Fundamentals** and **Guardrails** for the broader security context this connects to.
`,

  testing: `
### Testing the code-generation-execution loop

~~~python
def test_assistant_generates_working_code_for_simple_task():
    user_proxy.initiate_chat(assistant, message="Write a function that adds two numbers.")
    last_message = user_proxy.last_message()
    assert "def" in last_message["content"]
~~~

### Testing bounded conversation termination

~~~python
def test_groupchat_terminates_within_max_round():
    manager_chat = groupchat_manager.run_chat(...)
    assert len(groupchat.messages) <= groupchat.max_round
~~~

### The senior testing doctrine

- Test that a code-generation task produces genuinely working, executable code across representative prompts, directly connecting to the **Evaluation** skill's own rigorous measurement methodology.
- Test that conversations correctly terminate within their bounded round/reply limits.
- Test that \`human_input_mode\` configuration correctly requires (or doesn't require) human input at the expected points.
- Test code-execution sandboxing explicitly, verifying execution genuinely occurs within the isolated environment, not against the host directly.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the full conversation transcript first** (every message exchanged between agents), directly analogous to **Agent Fundamentals**' own trajectory-tracing debugging guidance.
2. **Check code-execution results specifically** if a coding task produced an unexpected outcome.
3. **Check speaker-selection logic** in a GroupChat if the wrong agent spoke at an unexpected point.
4. **Check conversation-termination configuration** if a conversation runs longer than expected or doesn't conclude as intended.

### Debugging common AutoGen-related symptoms

- "The generated code doesn't work as expected" — inspect the full conversation transcript, checking the exact execution results fed back to the assistant.
- "The wrong agent spoke at an unexpected point in a GroupChat" — inspect the speaker-selection logic (default LLM-driven or custom function).
- "The conversation ran much longer than expected" — check max_round/max_consecutive_auto_reply configuration and the termination-signal logic.
- "Code execution behaved unexpectedly or unsafely" — verify sandboxing (Docker) is correctly configured and enabled.
`,

  monitoring: `
### Key signals to track

- **Full conversation transcripts** (every message exchanged), directly connecting to **Agent Fundamentals**' own trajectory-observability treatment.
- **Conversation length distribution**, watching for conversations frequently approaching bounded round limits.
- **Code-execution success/failure rates**, a signal of the assistant's genuine code-generation quality.
- **Human-input request frequency**, for configurations using \`"TERMINATE"\` or similar conditional human-input modes.

### Tools

AutoGen's own logging capabilities for conversation-transcript capture; general LLM observability tools (e.g., **Langfuse**, covered in its own skill) for broader production monitoring across a multi-agent AutoGen system.

### Alerting priorities

Alert on a significant increase in conversations reaching bounded round limits without resolution, and on code-execution failure rates exceeding an established baseline.
`,

  deployment: `
### A representative production deployment configuration

~~~python
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    code_execution_config={"work_dir": "coding", "use_docker": True},
    max_consecutive_auto_reply=10,
)
~~~

### CI/CD pipeline considerations

Treat agent system messages, GroupChat configuration, and speaker-selection logic as genuine, version-controlled application configuration, with automated evaluation (directly connecting to the **Evaluation** skill) against representative coding/collaboration tasks as a deployment gate. See the **CI/CD** skill and the platform's later **LLMOps** skill for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production AutoGen application takes real traffic:

- [ ] All automated code execution sandboxed (Docker or equivalent), never executed directly against the host
- [ ] human_input_mode chosen deliberately, matched to genuine task stakes
- [ ] Conversation length explicitly bounded (max_round, max_consecutive_auto_reply)
- [ ] Clear, explicit termination condition/signal designed for every conversation pattern
- [ ] Appropriate conversational pattern chosen (pairing vs. GroupChat) for the task's genuine structure
- [ ] Full conversation transcripts logged for observability
- [ ] Inter-agent messages treated as potentially untrusted for prompt-injection risk
`,

  "common-mistakes": `
1. **Unsandboxed automatic code execution**, risking genuine harm from executing untrusted, model-generated code directly.
2. **Unbounded conversation length**, risking unproductive, expensive, indefinite conversations.
3. **Using human_input_mode="NEVER" for genuinely high-stakes code-execution contexts.**
4. **Using GroupChat for a task that's genuinely a simple two-participant conversation.**
5. **Not designing a clear termination signal**, risking an indefinite or awkwardly-ending conversation.
6. **Treating inter-agent conversational messages as inherently trusted.**
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Generated code doesn't work as expected | Assistant's code-generation quality issue, or execution feedback not clearly communicated | Inspect the full conversation transcript and execution results |
| Conversation runs far longer than expected | Missing or overly-lenient max_round/max_consecutive_auto_reply bound | Apply Agent Fundamentals' bounded-iteration guidance explicitly |
| Wrong agent speaks at an unexpected point in GroupChat | Default LLM-driven speaker selection misjudging the conversation | Consider custom, more deterministic speaker-selection logic |
| Code execution behaves unsafely | Sandboxing (Docker) not enabled or misconfigured | Enable and verify Docker-based sandboxing |
| Conversation never concludes cleanly | No clear termination signal/condition designed | Define an explicit termination keyword/condition for the assistant |
| Unexpectedly high cost for a simple two-agent task | Using GroupChat's additional coordination overhead unnecessarily | Use a simple assistant/user-proxy pairing instead |
`,

  faqs: `
**What is AutoGen?**
Microsoft's open-source, conversation-centric multi-agent framework, modeling agent collaboration as structured message-passing conversations rather than an explicit graph or role hierarchy.

**What is a ConversableAgent?**
AutoGen's fundamental building block — an agent capable of generating and receiving messages, optionally invoking tools including code execution.

**What is the assistant/user-proxy pattern?**
A particularly influential AutoGen pattern pairing an AssistantAgent (proposing responses/code) with a UserProxyAgent (executing code/providing feedback, or representing a human), directly implementing a plan-act-observe loop as an explicit two-participant conversation.

**What is GroupChat?**
An AutoGen abstraction coordinating conversation among more than two agents, with a GroupChatManager determining which agent speaks next at each turn.

**How does human_input_mode connect to Agent Fundamentals?**
It directly, concretely implements the autonomy-level spectrum — "NEVER" (fully autonomous), "ALWAYS" (fully human-supervised), and "TERMINATE" (a middle-ground, conditional autonomy tier).

**How does AutoGen compare to LangGraph or CrewAI?**
AutoGen's conversational model is more flexible but less structurally explicit than LangGraph's graph model, and distinctly conversation-centric (rather than role/task/crew-based) compared to CrewAI, with particular strength in automated code-generation-execution workflows.
`,

  "interview-questions": `
### Junior level

1. **What is AutoGen?**
   Model answer: Microsoft's conversation-centric multi-agent framework, modeling collaboration as message-passing conversations between agents.

2. **What is the assistant/user-proxy pattern?**
   Model answer: an AssistantAgent proposing responses/code paired with a UserProxyAgent that executes code or represents human feedback.

3. **What is GroupChat?**
   Model answer: an abstraction coordinating conversation among more than two agents, with a manager determining who speaks next.

4. **What does human_input_mode control?**
   Model answer: the autonomy level of the UserProxyAgent — whether it requires human input never, always, or only when the conversation would otherwise terminate.

### Senior level

5. **Explain precisely why AutoGen's conversational model is particularly well-suited to code-generation-execution workflows, compared to a more general single-agent tool-use loop.**
   Model answer: a code-generation-execution workflow genuinely involves two DISTINCT concerns that benefit from being modeled as separate participants: the GENERATIVE concern (proposing code based on a task description and, potentially, prior execution feedback) and the EXECUTION concern (actually running that code in a controlled environment and accurately reporting back real results, including errors); in a single-agent tool-use loop (as in LangChain's AgentExecutor or the OpenAI Agents SDK), the SAME agent both decides to invoke a tool AND is the entity whose "turn" produces the final answer, with the tool-execution step being comparatively incidental to the agent's own reasoning process; AutoGen's assistant/user-proxy pattern, by contrast, makes EXECUTION a first-class, distinct conversational participant with its OWN turn in the dialogue — this genuinely mirrors how human software development often works (a developer proposes code, a separate process — compiling, running tests — reports back concrete results, and the developer iterates based on that feedback), and this explicit separation makes it natural to configure the execution participant with its OWN distinct settings (sandboxing, human-approval requirements) independent of the generative assistant's own configuration, a genuinely useful decoupling for exactly this workflow.

6. **A team's AutoGen-based coding assistant occasionally executes code that makes unintended network requests during testing. Diagnose this and propose a fix.**
   Model answer: this is a direct instance of the CODE-EXECUTION SAFETY risk covered in this page's own security section, directly extending **Agent Fundamentals**' and **Guardrails**' action-level constraint guidance to AutoGen's particular emphasis on automated code execution — if the \`UserProxyAgent\`'s \`code_execution_config\` doesn't have sandboxing (Docker) properly enabled, or the sandboxed environment itself has unrestricted network access, model-generated code (which could, in principle, include code making arbitrary network requests, whether from a hallucinated but plausible-seeming approach or from adversarial manipulation) can execute with more capability than genuinely intended; the fix is twofold: first, verify \`use_docker=True\` is genuinely enabled (not accidentally left as \`False\`, e.g., due to a development-environment default persisting into production); second, and more importantly, configure the DOCKER SANDBOX ITSELF with restricted network access (e.g., no network access by default, or an explicit allowlist of permitted destinations) — directly reusing the principle of least privilege — since sandboxing alone (isolating the execution from the HOST filesystem/processes) doesn't automatically restrict NETWORK access unless the sandbox is specifically configured to do so.

7. **Compare AutoGen's GroupChat against CrewAI's Process.hierarchical for coordinating multiple specialized agents on a shared task, and identify a genuine scenario favoring each.**
   Model answer: both patterns involve a form of dynamic, LLM-driven coordination among multiple agents rather than a fixed, predetermined sequence, but with meaningfully different framing and defaults: CrewAI's hierarchical process is built around explicit ROLE/GOAL/BACKSTORY-defined agents with a MANAGER agent specifically responsible for TASK DELEGATION (assigning discrete units of work with expected outputs to specific team members), directly reflecting a "management structure" metaphor; AutoGen's GroupChat is built around a more general, flexible CONVERSATION model, where the \`GroupChatManager\`'s job is simply deciding who SPEAKS NEXT in an ongoing dialogue, without necessarily framing this as formal task delegation — the conversation's content and direction emerge more organically from the agents' own message generation; a genuine scenario favoring CrewAI's hierarchical process: a well-defined business process with clearly identifiable discrete deliverables (a research task, then a writing task, then an editing task) benefiting from an explicit manager assigning and tracking these distinct units of work; a genuine scenario favoring AutoGen's GroupChat: a more open-ended, exploratory collaborative problem-solving session (e.g., several specialist agents debating and iterating together on a genuinely difficult technical design decision) where the VALUE lies in flexible, natural back-and-forth dialogue rather than discrete, pre-defined task assignments.

8. **Explain why bounding both max_round (for GroupChat) and max_consecutive_auto_reply (for individual agents) matters, using a concrete failure scenario each guards against.**
   Model answer: \`max_round\` bounds the TOTAL number of conversational turns across an entire GroupChat, directly guarding against a scenario where the group's overall conversation simply never converges on a satisfactory conclusion — for example, if a reviewer agent and a coder agent repeatedly disagree about whether a proposed solution is acceptable, without \`max_round\`, this back-and-forth could continue indefinitely, consuming unbounded compute/cost without ever reaching a final answer; \`max_consecutive_auto_reply\` bounds how many times a SPECIFIC INDIVIDUAL agent can automatically reply in succession without external intervention, guarding against a genuinely different failure scenario — for example, an assistant agent stuck in a self-correction loop repeatedly attempting (and failing) to fix a specific bug in generated code across many consecutive replies to itself/the user-proxy, without ever escalating or concluding; both bounds directly reuse **Agent Fundamentals**' foundational loop-safety guidance, but applied at DIFFERENT granularities — the overall multi-agent conversation's total length, versus one specific agent's own consecutive-reply behavior within that conversation — and a genuinely robust production AutoGen system should set BOTH bounds, since either one alone leaves a distinct runaway-execution risk unaddressed.

9. **A production AutoGen system's assistant agent occasionally acts on a plausible-sounding but factually incorrect claim made by another agent earlier in a GroupChat conversation. Explain this in terms of Agent Fundamentals' concepts and propose a mitigation.**
   Model answer: this is a direct, multi-agent-conversational instance of **Agent Fundamentals**' COMPOUNDING HALLUCINATION RISK concept — an earlier agent's incorrect (hallucinated) claim becomes part of the shared CONVERSATION HISTORY that every subsequent agent's turn is generated in the context of, and a later agent has no inherent mechanism to recognize that a specific earlier claim, despite sounding plausible, was actually incorrect, so it may build its own contribution on top of this flawed premise, exactly analogous to the compounding-error risk covered for single-agent loops and for **CrewAI**'s own multi-agent pipelines; the mitigation directly extends this same checkpoint-verification principle to AutoGen's conversational context: introduce an explicit, dedicated VERIFIER or FACT-CHECKING agent into the GroupChat (or as an additional conversational turn in a simpler assistant/user-proxy setup) specifically tasked with reviewing claims made earlier in the conversation against available ground truth (e.g., actual execution results, or a retrieval-augmented check against a trusted source, directly connecting to the **Vector Search** skill) BEFORE the conversation is allowed to proceed to a stage where other agents build significant further work on top of that claim — directly analogous to CrewAI's own verification-task mitigation, but implemented as an additional conversational participant/turn rather than a distinct pipeline stage.

10. **Design an AutoGen-based system for an automated code-review workflow where a "submitter" agent proposes code changes, a "reviewer" agent critiques them, and a human must explicitly approve before any change is actually merged. Explain your choice of conversational pattern and human_input_mode configuration.**
    Model answer: I'd use a GroupChat (rather than a simple two-agent pairing) with three participants: a Submitter (AssistantAgent proposing code changes), a Reviewer (AssistantAgent critiquing the proposal and either approving or requesting revisions), and a UserProxyAgent representing the human merge-approval gate; I'd configure custom speaker-selection logic (rather than relying on default LLM-driven speaker selection) to enforce a DETERMINISTIC turn order — Submitter proposes, Reviewer critiques, and if the Reviewer's critique indicates revisions are needed, control returns to the Submitter (a bounded cycle, directly analogous to CrewAI's and LangGraph's own reflection-loop patterns, with an explicit max-round bound to prevent an unproductive, indefinite revision cycle); critically, I'd configure the UserProxyAgent's \`human_input_mode="ALWAYS"\` specifically for the FINAL merge-approval step — directly implementing **Agent Fundamentals**' fully human-supervised autonomy tier for this genuinely high-stakes, hard-to-reverse action (merging code changes) — even though the Submitter-Reviewer back-and-forth itself can proceed largely autonomously (a lower-stakes, more easily-reversible iterative refinement process), directly mirroring the PER-ACTION, tiered-autonomy design principle established in **Agent Fundamentals** and concretely demonstrated in the **LangGraph** skill's own interrupt-checkpoint treatment — autonomy should be calibrated to the SPECIFIC action's genuine stakes, not applied uniformly across an entire workflow.
`,

  "coding-questions": `
### 1. Build a bounded assistant/user-proxy code-generation loop

~~~python
from autogen import AssistantAgent, UserProxyAgent

def build_coding_pair(model_config):
    assistant = AssistantAgent(name="assistant", system_message="You write correct, working Python code.", llm_config=model_config)
    user_proxy = UserProxyAgent(
        name="user_proxy",
        human_input_mode="NEVER",
        code_execution_config={"work_dir": "coding", "use_docker": True},
        max_consecutive_auto_reply=8,
        is_termination_msg=lambda msg: "TERMINATE" in msg.get("content", ""),
    )
    return assistant, user_proxy
# Follow-up: why is is_termination_msg an important piece of
# this configuration, alongside max_consecutive_auto_reply?
~~~

### 2. Configure a bounded GroupChat with custom speaker selection

~~~python
from autogen import GroupChat, GroupChatManager

def build_review_groupchat(submitter, reviewer, user_proxy, model_config):
    def speaker_selection(last_speaker, groupchat):
        if last_speaker is submitter:
            return reviewer
        if last_speaker is reviewer:
            return user_proxy
        return submitter

    groupchat = GroupChat(
        agents=[submitter, reviewer, user_proxy],
        messages=[],
        max_round=12,
        speaker_selection_method=speaker_selection,
    )
    return GroupChatManager(groupchat=groupchat, llm_config=model_config)
# Follow-up: why might custom speaker selection be preferable
# to the default LLM-driven speaker selection for this
# specific code-review workflow?
~~~

### 3. Implement a human-approval checkpoint via human_input_mode

~~~python
from autogen import UserProxyAgent

def build_approval_gate():
    return UserProxyAgent(
        name="merge_approver",
        human_input_mode="ALWAYS",  # every turn requires explicit
                                      # human input -- directly
                                      # Agent Fundamentals' fully
                                      # human-supervised tier
        code_execution_config=False,  # this proxy only approves,
                                        # doesn't execute code itself
    )
# Follow-up: why does setting code_execution_config=False make
# sense for an agent whose sole purpose is human approval?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a basic assistant/user-proxy code-generation loop
Build an assistant/user-proxy pair that generates and executes a simple Python script, with sandboxed execution and bounded consecutive replies. Deliverable: a working, tested code-generation-execution loop. Skills exercised: basic AutoGen setup and code-execution safety.

### Lab 2 (Intermediate): Build a bounded GroupChat with custom speaker selection
Build a GroupChat with at least three agents and custom, deterministic speaker-selection logic. Deliverable: a working, tested GroupChat with a documented, predictable turn order. Skills exercised: applied GroupChat coordination design.

### Lab 3 (Advanced): Implement a human-approval checkpoint for a high-stakes action
Build a workflow where most steps proceed autonomously but a specific, high-stakes final action requires explicit human approval via human_input_mode. Deliverable: a working, tested tiered-autonomy AutoGen system. Skills exercised: applied autonomy calibration in a conversational framework.

### Lab 4 (Production): Build a verified multi-agent conversation mitigating compounding errors
Build a GroupChat with an explicit verifier agent checking earlier claims before the conversation proceeds to a later, dependent stage. Deliverable: a documented demonstration of the verifier catching an intentionally-introduced incorrect claim. Skills exercised: applied compounding-error mitigation in a conversational multi-agent system.
`,

  "real-projects": `
### 1. An automated coding assistant with sandboxed execution
Engineering requirements: assistant/user-proxy pairing, Docker-sandboxed code execution, bounded consecutive replies, and a clear termination signal.

### 2. A collaborative code-review workflow
Engineering requirements: a GroupChat with submitter, reviewer, and human-approval-gate agents, custom deterministic speaker selection, and human_input_mode="ALWAYS" for the final merge decision.

### 3. A multi-perspective technical design discussion system
Engineering requirements: an open-ended GroupChat among several specialist agents, with a fact-checking/verification agent mitigating compounding hallucination across the discussion.
`,

  "case-studies": `
### AutoGen's research origins shaping its distinctly conversational design
AutoGen's emergence from Microsoft Research, with an explicit focus on exploring how multiple LLM-powered agents could collaborate through flexible dialogue, directly shaped its conversation-centric abstractions — a genuinely different design lineage from the more product-oriented paths taken by CrewAI and the OpenAI Agents SDK. Lesson: a framework's origin context (research exploration versus product engineering) often leaves a lasting, visible imprint on its core design philosophy and the kinds of use cases it ends up being particularly well-suited for.

### The AutoGen 0.4/AgentChat restructuring as a response to accumulated production experience
AutoGen's architectural evolution toward a more modular, extensible core directly parallels the same kind of accumulated-practical-experience-driven evolution covered in the **LangChain** skill's own LCEL case study. Lesson: even a well-established, research-originated framework benefits from architectural restructuring as genuine production usage reveals an earlier design's limitations — research-quality code and production-quality code often have genuinely different structural needs, and recognizing this gap (rather than indefinitely patching the original design) is a mark of a maturing project.
`,

  comparisons: `
| Aspect | AutoGen | CrewAI | LangGraph |
|--------|----------------|--------------|------------------------|
| Core metaphor | Conversation between agents | Team of specialized roles | Explicit graph (nodes/edges) |
| Coordination | Message-passing, speaker selection | Sequential/hierarchical process | Conditional edges, explicit state |
| Distinguishing strength | Code-generation-execution loops | Fast role-based team setup | Precise, arbitrary structural control |
| Determinism | Lower by default (LLM-driven turn-taking) | Moderate (defined process types) | Highest (explicit, code-level) |

**How seniors choose**: default to AutoGen specifically for code-generation-execution workflows or genuinely open-ended, conversational multi-agent collaboration; choose CrewAI for fast, role-decomposable team setup; choose LangGraph for precise, deterministic structural control; consider custom speaker-selection logic within AutoGen to narrow the determinism gap when a specific workflow needs it.
`,

  "related-technologies": `
- **Agent Fundamentals** — the plan-act-observe loop, multi-agent decomposition, and human-in-the-loop concepts AutoGen concretely implements via its conversational model.
- **Guardrails** — the action-level constraint guidance directly applicable to AutoGen's code-execution safety considerations.
- **LangGraph**, **CrewAI**, **OpenAI Agents SDK** — alternative multi-agent orchestration approaches this page directly compares against.
- **Agent Memory** — covered next in this category, directly relevant to managing AutoGen's own growing conversation history/context.

Learning path: **Agent Fundamentals** → **LangChain** → **LangGraph** → **CrewAI** → **OpenAI Agents SDK** → this page (AutoGen) → **Agent Memory** → the remaining capability-focused skills in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- AutoGen continues to be positioned as a research-originated, conversation-centric framework particularly strong in code-generation-execution workflows, with continued refinement following its 0.4/AgentChat architectural restructuring.
- Continued growth of AutoGen Studio for lower-code multi-agent system construction and testing.
- Continued integration with Microsoft's broader AI tooling ecosystem.
- Given continued, active framework evolution, verify current best-practice recommendations against AutoGen's up-to-date official documentation.
`,

  "future-roadmap": `
Where AutoGen is heading, and what's worth betting career time on:

- **Continued refinement of its modular, extensible core** (the Core/AgentChat separation) following accumulated production experience.
- **Continued strength and adoption specifically within code-generation-execution and research-oriented multi-agent use cases.**
- **Continued growth of lower-code tooling** (AutoGen Studio) broadening accessibility.
- **What to bet on**: deeply understanding the general principle of conversation-centric multi-agent design (conversable agents, flexible speaker selection, code execution as a first-class capability) — this transfers directly across AutoGen versions and informs sound judgment even when working with alternative, more structurally-explicit frameworks.
`,

  "cheat-sheet": `
~~~
# ---- Core abstractions ----
ConversableAgent          # base: sends/receives messages
AssistantAgent(name, system_message, llm_config)
UserProxyAgent(name, human_input_mode, code_execution_config,
               max_consecutive_auto_reply)
~~~

~~~
# ---- Assistant/User-Proxy pattern ----
Assistant PROPOSES (e.g., code) -> User-Proxy EXECUTES and
    reports results -> cycle repeats until termination signal.
Directly Agent Fundamentals' plan-act-observe loop, as a
    two-participant CONVERSATION.
~~~

~~~
# ---- human_input_mode (= Agent Fundamentals autonomy tiers) ----
"NEVER"      -> fully autonomous
"ALWAYS"     -> fully human-supervised (every turn)
"TERMINATE"  -> human input only when conversation would end
~~~

~~~
# ---- GroupChat (3+ agents) ----
GroupChat(agents=[...], messages=[], max_round=N,
          speaker_selection_method=custom_fn)  # optional,
                                                  # more deterministic
GroupChatManager(groupchat=..., llm_config=...)
~~~

~~~
# ---- Non-negotiables ----
ALWAYS sandbox code execution: use_docker=True
ALWAYS bound: max_round + max_consecutive_auto_reply
Choose human_input_mode per genuine task stakes, not uniformly
Design a clear termination signal (e.g., "TERMINATE" keyword)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is AutoGen? | Microsoft's conversation-centric multi-agent framework. |
| What is the assistant/user-proxy pattern? | Assistant proposes (e.g., code); user-proxy executes and reports back. |
| What does human_input_mode control? | Autonomy level: NEVER (auto), ALWAYS (human every turn), TERMINATE (conditional). |
| What is GroupChat? | Coordinates conversation among 3+ agents via a manager selecting the next speaker. |
| Why sandbox code execution? | Model-generated code executed automatically is a genuine, distinct risk surface. |
| Why bound max_round AND max_consecutive_auto_reply? | They guard different failure modes: whole-group vs. one agent's reply loop. |
| AutoGen vs. CrewAI's core metaphor? | Conversation between agents vs. a team of role-based specialists. |
| AutoGen vs. LangGraph on determinism? | AutoGen's default speaker selection is LLM-driven (flexible); LangGraph is explicit (deterministic). |
| Fix for compounding hallucination in a GroupChat? | Add a dedicated verifier/fact-checking agent before others build on a claim. |
| Why use custom speaker-selection logic? | Adds determinism to a workflow that needs a predictable, not LLM-guessed, turn order. |
`,

  mcqs: `
1. What is AutoGen's core design philosophy?
   A) An explicit graph of nodes and edges  B) Modeling multi-agent collaboration as a structured conversation between message-passing agents  C) A role/task/crew hierarchy  D) A single-agent tool-calling loop only
   **Answer: B** — AutoGen's distinguishing, conversation-centric framing.

2. What does the UserProxyAgent typically do in the assistant/user-proxy pattern?
   A) Only generates text responses  B) Executes proposed code (or represents a human) and reports results back to the assistant  C) Trains the underlying model  D) Manages a vector database
   **Answer: B** — directly implementing the "act" and "observe" steps of Agent Fundamentals' loop.

3. What does setting human_input_mode="ALWAYS" implement?
   A) Fully autonomous execution  B) Agent Fundamentals' fully human-supervised autonomy tier — human input required at every turn  C) No effect on autonomy  D) Automatic code sandboxing
   **Answer: B** — a direct, concrete implementation of the autonomy spectrum.

4. Why is sandboxing (e.g., Docker) critical for AutoGen's code-execution capability?
   A) It's optional and rarely matters  B) Automated execution of model-generated code is a genuine, distinct risk surface requiring isolation from the host environment  C) It only affects speed  D) Sandboxing disables code execution entirely
   **Answer: B** — a direct extension of Agent Fundamentals' and Guardrails' action-level safety guidance.

5. When should a team consider custom speaker-selection logic in a GroupChat?
   A) Never, default selection is always best  B) When the workflow benefits from a more deterministic, predictable turn order than the default LLM-driven selection provides  C) Only for single-agent systems  D) Custom selection is not supported
   **Answer: B** — narrowing the flexibility-versus-determinism gap when a task needs it.
`,

  "revision-notes": `
AutoGen is Microsoft's open-source, research-originated, CONVERSATION-CENTRIC multi-agent framework — rather than an explicit graph (**LangGraph**) or a role/task/crew hierarchy (**CrewAI**) or lightweight handoffs (**OpenAI Agents SDK**), AutoGen models multi-agent collaboration as a structured CONVERSATION between message-passing CONVERSABLE AGENTS. Its most influential pattern pairs an ASSISTANTAGENT (proposing responses/code) with a USERPROXYAGENT (executing code or representing human feedback) — directly implementing **Agent Fundamentals**' plan-act-observe loop as an explicit, TWO-PARTICIPANT conversation, with code execution treated as a first-class capability distinguishing AutoGen's practical emphasis.

A critical, frequently-tested concept is HUMAN_INPUT_MODE, which directly, concretely implements **Agent Fundamentals**' autonomy-level spectrum: \`"NEVER"\` (fully autonomous), \`"ALWAYS"\` (fully human-supervised — human input required at EVERY turn), and \`"TERMINATE"\` (a middle-ground tier requesting human input only when the conversation would otherwise conclude) — this should be chosen DELIBERATELY per the genuine stakes of the specific action/context, not applied uniformly, directly echoing the per-action tiered-autonomy principle established across **Agent Fundamentals**, **LangGraph**, and **CrewAI**.

GROUPCHAT coordinates conversation among more than two agents, with a GROUPCHATMANAGER determining the next speaker at each turn (by default, via its own LLM-driven reasoning, though CUSTOM SPEAKER-SELECTION LOGIC can impose more deterministic, predictable turn-order control when a workflow genuinely benefits from it) — a genuinely distinct coordination mechanism from CrewAI's role/task/crew structure or LangGraph's explicit conditional edges.

Since AutoGen's distinguishing strength involves AUTOMATED CODE EXECUTION, CODE-EXECUTION SAFETY is a particularly important, frequently-tested concern: automated execution of model-generated code MUST be SANDBOXED (e.g., via Docker) in production, directly extending **Agent Fundamentals**' and **Guardrails**' action-level constraint guidance to this specific, high-risk capability — and sandboxing the execution ENVIRONMENT alone doesn't automatically restrict network access; that requires explicit, additional configuration.

AutoGen directly inherits **Agent Fundamentals**' LOOP-SAFETY guidance, but applied at TWO distinct granularities: \`max_round\` bounds an entire GroupChat's TOTAL conversational turns (guarding against an unproductive, never-converging group discussion), while \`max_consecutive_auto_reply\` bounds how many times ONE SPECIFIC agent can reply in succession without external intervention (guarding against a single agent's own unproductive self-correction loop) — a genuinely robust system sets BOTH bounds, since either alone leaves a distinct runaway-execution risk unaddressed.

AutoGen also directly inherits **Agent Fundamentals**' COMPOUNDING HALLUCINATION RISK concept, manifesting as an earlier agent's incorrect claim becoming part of the shared conversation history later agents build upon without any inherent mechanism to recognize the flaw — the mitigation, directly analogous to **CrewAI**'s own verification-task pattern, is introducing a dedicated verifier/fact-checking agent (or conversational turn) that reviews earlier claims BEFORE the conversation proceeds to a stage where other agents build significant further work on top of them.

A genuinely important architectural comparison, frequently tested: AutoGen's conversational model is more FLEXIBLE but LESS structurally explicit/deterministic than **LangGraph**'s graph model by default, and distinctly CONVERSATION-centric (message exchange, emergent flow) rather than **CrewAI**'s TEAM/ROLE-centric framing (explicit role/goal/backstory, task delegation) — AutoGen's particular strength lies in workflows genuinely resembling a natural, back-and-forth dialogue, especially code-generation-execution-feedback loops.

A senior AI engineer chooses the appropriate conversational pattern (simple pairing vs. GroupChat) matched to genuine collaboration needs, always sandboxes code execution, bounds both conversation-level and individual-agent-level iteration counts, chooses human_input_mode deliberately per genuine action stakes, and designs a clear, explicit termination condition — this foundational understanding, completing the platform's five core agent-framework skills (**Agent Fundamentals**, **LangChain**, **LangGraph**, **CrewAI**, **OpenAI Agents SDK**, and this page), directly sets up the remaining, capability-focused skills covered throughout the rest of this category: **Agent Memory**, **Planning**, **Reflection**, **Tool Calling**, and **MCP**.
`,

  "learning-roadmap": `
**Week 1 — Core conversational pattern**: building a bounded, sandboxed assistant/user-proxy code-generation loop. Milestone: complete Lab 1, with a working, tested code-generation-execution loop.

**Week 2 — GroupChat coordination**: building a GroupChat with custom, deterministic speaker-selection logic. Milestone: complete Lab 2, with a documented, predictable turn order.

**Week 3 — Tiered autonomy**: implementing a human-approval checkpoint for a genuinely high-stakes action within an otherwise autonomous workflow. Milestone: complete Lab 3, with a verified tiered-autonomy system.

**Week 4 — Compounding-error mitigation**: building a verified multi-agent conversation with a dedicated fact-checking agent. Milestone: complete Lab 4, demonstrating the verifier catching an intentional error.

Next platform skill once this roadmap is complete: **Agent Memory**, covering short-term, long-term, and episodic memory patterns applicable across all the frameworks covered in this category.
`,

  "official-docs": `
- **Microsoft's official AutoGen documentation** — the authoritative, actively-maintained reference for ConversableAgent, GroupChat, and the AgentChat architecture.
- **AutoGen Studio's official documentation** — the lower-code interface for building and testing AutoGen systems.
`,

  books: `
- Given AutoGen's origins as a research project with continued active evolution, official documentation and Microsoft Research publications remain the most current, authoritative references over dedicated book-length treatments.
`,

  blogs: `
- **Microsoft Research's official blog** — design-philosophy discussions and release notes on AutoGen's evolution directly from the originating research team.
- **Community tutorials on building AutoGen-based coding assistants and multi-agent GroupChats** widely available across AI engineering educational content providers.
`,

  "research-papers": `
- **Wu, Q. et al. — "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation"** — the foundational paper introducing AutoGen's conversational multi-agent design.
- **Yao, S. et al. — "ReAct: Synergizing Reasoning and Acting in Language Models"** — the foundational agent-loop pattern AutoGen's conversational model concretely implements, covered in **Agent Fundamentals**.
`,

  videos: `
- **Microsoft Research's conference talks and tutorials** on AutoGen's design and usage.
- **Community-produced tutorials on building assistant/user-proxy code-generation loops and multi-agent GroupChats.**
`,

  "github-repos": `
- **microsoft/autogen** — the official, primary AutoGen repository.
- **microsoft/autogen** (AutoGen Studio subdirectory/related tooling) — the lower-code interface project.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Conversational pattern selection**: given a described multi-agent task, decide whether a simple pairing or a GroupChat is more appropriate.
2. **Autonomy calibration**: given a described workflow with mixed-risk actions, decide the appropriate human_input_mode for each participant.
3. **Speaker-selection design**: given a described GroupChat workflow, design custom, deterministic speaker-selection logic where appropriate.
4. **Compounding-error diagnosis**: given a described conversation producing an inconsistent outcome, identify where a verifier agent should be introduced.
5. **External practice sets**: AutoGen's own official notebooks and example repositories for hands-on practice across assistant/user-proxy pairs and GroupChat.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph CoreModel["AutoGen Core Model"]
        ConversableAgent["ConversableAgent (base)"]
        Assistant["AssistantAgent"]
        UserProxy["UserProxyAgent"]
    end
    subgraph GroupChatLayer["Multi-Participant Coordination"]
        GroupChat["GroupChat"]
        Manager["GroupChatManager"]
    end
    subgraph Safety["Safety"]
        Sandbox["Docker Sandboxing"]
        Bounds["max_round / max_consecutive_auto_reply"]
        HumanInput["human_input_mode tiers"]
    end
    ConversableAgent --> Assistant
    ConversableAgent --> UserProxy
    Assistant --> GroupChat
    UserProxy --> GroupChat
    GroupChat --> Manager
    CoreModel --> Safety
~~~
`,

  "mind-map": `
~~~mindmap
  root((AutoGen))
    Foundations
      Overview
      History Microsoft Research
      Why it exists
      Problem it solves
    Core Abstractions
      ConversableAgent
      AssistantAgent
      UserProxyAgent
    Assistant User Proxy Pattern
      Code generation
      Sandboxed execution
      Feedback loop
    GroupChat
      Manager
      Speaker selection
      Custom deterministic logic
    Autonomy
      human_input_mode tiers
      Per action calibration
    Safety
      Code execution sandboxing
      Bounded rounds and replies
      Compounding error verification
    Comparison
      Vs LangGraph determinism
      Vs CrewAI role metaphor
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default autogen;
