import type { SkillContent } from "../types";

/**
 * Agent-to-Agent (A2A) Protocol — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const a2aProtocol: SkillContent = {
  overview: `
Agent2Agent (A2A) is an open protocol for letting independent AI agents — built by different teams, on different frameworks, sometimes by different companies — discover each other, negotiate a task, and exchange work products over a standard wire format, without either side needing to know the other's internal implementation. Where the **Model Context Protocol (MCP)** standardizes how a single agent talks to tools and data sources, A2A standardizes how one agent talks to *another agent*: it is the "two black boxes calling each other" layer of the emerging agentic stack.

For an AI engineer, A2A matters because real agentic systems are rapidly stopping being one monolithic agent with a big toolbox, and starting to be a network of specialized agents (a research agent, a booking agent, a coding agent, a customer's own internal agent) that need to cooperate across organizational and vendor boundaries. Before a shared protocol, this cooperation meant bespoke, brittle integrations — one-off REST APIs, undocumented JSON shapes, no shared vocabulary for "here's a task, here's my progress, here's the result." A2A gives that interaction a name, a schema, and a lifecycle.

Key characteristics: JSON-RPC 2.0 over HTTP(S) as the wire format; a discovery mechanism called the **Agent Card** (a JSON document describing what an agent can do, how to reach it, and how to authenticate); a **Task** object with an explicit lifecycle (submitted → working → input-required → completed/failed/canceled); support for both simple request/response and long-running, streamed, human-in-the-loop interactions via Server-Sent Events and push notifications. It was originally announced by Google in April 2025 with a large group of industry partners, and was subsequently contributed to the Linux Foundation for open, vendor-neutral governance — I'd verify the current governance and spec-version details directly against the official A2A site before quoting them as current fact, since this is a young, fast-moving standard.
`,

  history: `
A2A is a recent addition to the agentic-AI stack, created specifically to solve cross-vendor agent interoperability, a problem that only became acute once multiple companies started shipping production agent frameworks independently.

| Year | Milestone |
|------|-----------|
| 2023–2024 | Agent frameworks proliferate independently (LangGraph, CrewAI, AutoGen, Semantic Kernel, and various vendor-specific agent runtimes) — each with its own internal task/message representation and no shared way to talk to an agent built on a different stack |
| Nov 2024 | Anthropic publishes the **Model Context Protocol (MCP)** — standardizes agent-to-tool/data connections, but explicitly does not address agent-to-agent communication |
| Apr 2025 | Google announces the **Agent2Agent (A2A) protocol**, with a founding group of over 50 technology partners, positioning it as the complementary standard to MCP: MCP connects an agent to tools and context, A2A connects an agent to other agents |
| Mid 2025 | Google contributes the A2A project to the **Linux Foundation**, moving governance from a single-vendor initiative to a vendor-neutral open-source foundation, mirroring the governance path many successful infrastructure standards (Kubernetes, containerd) have taken |
| 2025 | SDKs and reference implementations appear across multiple languages; agent framework vendors begin adding A2A client/server support alongside their existing MCP support |
| 2025–2026 | Continued evolution of the spec (task lifecycle refinements, authentication schemes, streaming semantics) under Linux Foundation stewardship — I'm not confident of the exact current spec version or every ratified detail as of today, and would verify against the official specification before treating a specific version number as current |

The pattern worth noting: A2A followed MCP by only a few months, and was explicitly designed as MCP's complement rather than its competitor — the two are frequently taught and adopted together, not as alternatives.
`,

  "why-it-exists": `
Before A2A, if you wanted Agent A (built on, say, LangGraph, by your team) to delegate a sub-task to Agent B (built on a completely different stack, by a partner company or a different internal team), you had exactly one real option: a custom, bespoke integration. That meant:

- **Reinventing a task protocol every time**: how do you tell Agent B what you want it to do? How does it tell you it's still working? How does it ask you a clarifying question mid-task? Every pairwise integration answered these questions differently, in incompatible ways.
- **No standard discovery mechanism**: there was no common way for Agent A to find out what Agent B is even capable of doing, what input it expects, or how to authenticate to it — that information lived in whatever documentation (if any) the other team wrote.
- **No shared vocabulary for long-running, asynchronous, human-in-the-loop work**: agent tasks are often not instant request/response — they can take minutes, need a clarifying answer partway through, or require a human approval step. Plain REST APIs have no standard shape for "job submitted, still working, needs your input, now complete."

A2A exists to replace N-squared bespoke integrations with one shared protocol: any agent that speaks A2A can, in principle, discover and cooperate with any other agent that speaks A2A, regardless of what framework, cloud, or company built either side. This is the same "collapse a combinatorial integration problem into one interface" pattern that HTTP did for client-server communication generally and that **MCP** does specifically for agent-to-tool connections. The specific gap A2A closes is the one MCP explicitly leaves open: MCP's own documentation frames tool/resource access as its job and agent-to-agent delegation as a different, complementary problem — A2A is the protocol built to be that complement.
`,

  "problem-it-solves": `
Concretely, A2A removes these pains:

- **Bespoke integration cost per agent pair.** Without A2A, connecting N agent systems from different vendors requires up to N×(N-1) custom integrations; with a shared protocol, each agent only needs to implement A2A once to interoperate with every other A2A-speaking agent.
- **No standard capability discovery.** The **Agent Card** gives a machine-readable, fetchable description of what an agent can do (its "skills"), its endpoint, and its authentication requirements — an orchestrating agent can discover this at runtime instead of relying on hardcoded knowledge of a partner's API.
- **No standard task lifecycle for long-running or interactive work.** A2A's **Task** object and its defined states (submitted, working, input-required, completed, failed, canceled) give every implementation the same vocabulary for "this isn't done yet," "I need more from you," and "here's the final result" — critical for agent work that can take much longer than a typical API call and may need mid-task human or agent input.
- **No standard way to stream partial progress or push completion notifications.** Server-Sent Events for streaming updates and webhook-style push notifications for completion are part of the spec, rather than something every implementer improvises separately.

What A2A deliberately does **not** solve:

- It does not solve *what an agent does internally* — the reasoning, planning, and tool use inside an agent remain entirely up to that agent's own implementation (often built with **LangGraph**, CrewAI, or a custom framework, frequently using **MCP** internally to reach its own tools).
- It is not a replacement for MCP — A2A does not standardize how an agent accesses a database, a file system, or an external API; that remains MCP's (or a bespoke integration's) job.
- It does not, by itself, provide security guarantees beyond what its authentication/authorization mechanisms specify — trusting a remote agent's output, verifying its identity, and defending against a malicious or compromised counterpart is an application-level responsibility, addressed further in this page's Security section and in the **AI Red Teaming** skill.
- It does not solve orchestration strategy (which agent should be asked to do what, in what order) — that remains a multi-agent-systems design problem, not a protocol-level one.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what problem A2A solves and how it differs from, and complements, the Model Context Protocol.
2. Describe the structure and purpose of an Agent Card, and implement one for a toy agent.
3. Trace a Task through its full lifecycle (submitted → working → input-required → completed/failed/canceled) and explain what each state means operationally.
4. Implement a minimal A2A client that discovers an agent via its Agent Card and submits a task via JSON-RPC.
5. Implement a minimal A2A server that exposes an Agent Card and handles incoming task requests, including a streaming (SSE) response.
6. Identify where authentication and authorization fit into an A2A exchange, and the security risks of trusting a remote agent's Agent Card or output.
7. Design a multi-agent system where an orchestrating agent delegates sub-tasks to specialist agents over A2A, with appropriate error handling and timeouts.
8. Evaluate when A2A is the right tool versus when a simpler direct API call, or MCP alone, is sufficient.
`,

  prerequisites: `
- **Required**: comfort with HTTP APIs and JSON — A2A is JSON-RPC 2.0 over HTTP(S), so if you've called or built a REST/JSON API before, the wire format will feel familiar quickly.
- **Required**: a working mental model of what an "AI agent" is (an LLM-driven system that plans, uses tools, and takes multi-step action) — see general agent-framework material (**LangGraph**, CrewAI) if this is new.
- **Strongly recommended**: read the **Model Context Protocol** skill first. A2A is explicitly designed as MCP's complement, and almost every real system that uses A2A also uses MCP internally within each agent — understanding the boundary between the two is the single most important prerequisite concept for this page.
- **Helpful**: familiarity with Server-Sent Events (SSE) or any streaming HTTP pattern, since A2A uses SSE for streaming task updates.
- **Helpful**: basic OAuth2/API-key authentication concepts, since A2A's Agent Card advertises authentication requirements using standard web-auth vocabulary rather than inventing a new one.

Dependency chain: **Model Context Protocol** → this page → **Multi-Agent Systems / LangGraph / CrewAI** for orchestration patterns that use A2A in practice, and **AI Red Teaming** for the security implications of trusting a remote agent.
`,

  "beginner-concepts": `
### The core idea, with no jargon

Imagine two AI agents built by two different companies. Agent A needs help with a task Agent B specializes in — say, Agent A is a trip-planning assistant and Agent B is a specialist flight-booking agent run by an airline. A2A gives them a shared way to: (1) Agent A finds out what Agent B can do, (2) Agent A hands Agent B a task in a format both understand, (3) Agent B reports back its progress and final result in a format Agent A can parse, without either side needing custom code written specifically for the other.

### The Agent Card — how an agent describes itself

An Agent Card is a JSON document, typically served at a well-known URL, describing an agent's identity, capabilities ("skills"), endpoint, and authentication requirements:

~~~json
{
  "name": "Flight Booking Agent",
  "description": "Searches and books flights across partner airlines.",
  "url": "https://api.example-airline.com/a2a",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true
  },
  "skills": [
    {
      "id": "search-flights",
      "name": "Search Flights",
      "description": "Find available flights between two cities on a given date."
    },
    {
      "id": "book-flight",
      "name": "Book Flight",
      "description": "Book a specific flight itinerary for a named passenger."
    }
  ],
  "authentication": {
    "schemes": ["Bearer"]
  }
}
~~~

A calling agent fetches this document, reads the "skills" list to understand what the agent can do, and reads "authentication" to know how to prove its identity before sending real requests.

### A Task — the unit of work

A Task represents one request for the remote agent to do something, and carries an explicit status through its lifecycle:

~~~python
# A simplified Python representation of an A2A Task object
# (the real wire format is JSON-RPC 2.0; this is the conceptual shape)
task = {
    "id": "task-8f3e2b1a",
    "status": {
        "state": "submitted",   # submitted -> working -> input-required -> completed/failed/canceled
    },
    "message": {
        "role": "user",
        "parts": [
            {"type": "text", "text": "Book flight AA123 for John Smith on 2026-03-15."}
        ],
    },
}
~~~

### A minimal request, conceptually

~~~python
import requests

# 1. Discover the remote agent's capabilities
agent_card = requests.get("https://api.example-airline.com/.well-known/agent.json").json()
endpoint = agent_card["url"]

# 2. Submit a task via JSON-RPC 2.0 over HTTP
response = requests.post(
    endpoint,
    json={
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tasks/send",
        "params": {
            "id": "task-8f3e2b1a",
            "message": {
                "role": "user",
                "parts": [{"type": "text", "text": "Book flight AA123 for John Smith on 2026-03-15."}],
            },
        },
    },
    timeout=10,   # always set a timeout on a cross-organization network call
)
result = response.json()
print(result["result"]["status"]["state"])   # e.g. "working" or "completed"
~~~

This is the whole shape of A2A at the beginner level: fetch a card, read what the agent can do, send it a task using a standard envelope, read back a standard status.
`,

  "intermediate-concepts": `
### The full Task lifecycle

A2A defines an explicit state machine for a task, which every conforming implementation shares:

~~~mermaid
stateDiagram-v2
    [*] --> submitted
    submitted --> working
    working --> input_required: needs clarification
    input_required --> working: client responds
    working --> completed
    working --> failed
    working --> canceled: client cancels
    completed --> [*]
    failed --> [*]
    canceled --> [*]
~~~

- **submitted**: the task has been received but processing hasn't started.
- **working**: the remote agent is actively processing.
- **input-required**: the remote agent needs more information from the caller before it can continue — this is the state that makes multi-turn, human-in-the-loop agent interactions possible over the protocol, not just fire-and-forget requests.
- **completed / failed / canceled**: terminal states.

### Messages and Parts

A Task's messages are composed of typed **Parts**, so a single exchange can mix text, structured data, and files:

~~~python
message = {
    "role": "agent",
    "parts": [
        {"type": "text", "text": "I found 3 matching flights. Please confirm which one:"},
        {
            "type": "data",
            "data": {
                "options": [
                    {"flight": "AA123", "price": 412.50},
                    {"flight": "DL456", "price": 389.00},
                ]
            },
        },
    ],
}
~~~

A text part carries natural language; a data part carries structured JSON (useful for machine-readable results an orchestrating agent can act on programmatically, closely related to the discipline covered in the **Structured Outputs** skill); a file part carries binary or document content by reference or inline.

### Streaming updates with Server-Sent Events

For long-running tasks, a client can subscribe to a stream of incremental status and message updates instead of polling:

~~~python
import httpx
import json

def stream_task_updates(endpoint: str, task_id: str, auth_token: str):
    """Subscribe to SSE updates for a running A2A task."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "jsonrpc": "2.0", "id": 2, "method": "tasks/sendSubscribe",
        "params": {"id": task_id},
    }
    with httpx.stream("POST", endpoint, json=payload, headers=headers, timeout=None) as resp:
        for line in resp.iter_lines():
            if line.startswith("data:"):
                event = json.loads(line[len("data:"):].strip())
                state = event.get("result", {}).get("status", {}).get("state")
                print(f"task update: {state}")
                if state in ("completed", "failed", "canceled"):
                    break   # terminal state -- stop listening
~~~

Production note: always bound how long you'll wait on an SSE stream (a heartbeat/timeout policy), since a hung remote agent or a dropped connection should not block your orchestrating process indefinitely.

### Push notifications as the alternative to polling/streaming

For tasks that may run far longer than a client wants to hold an open connection for, A2A supports registering a webhook the remote agent calls back when the task reaches a terminal (or otherwise notable) state — the same "don't poll, get called back" pattern used broadly in webhook-based system design.

### Authentication

An Agent Card's "authentication" field advertises which standard web-auth schemes (e.g. Bearer tokens, OAuth2) the agent expects — A2A deliberately reuses existing HTTP authentication standards rather than inventing a new one, so a calling agent's existing credential-management code (see the **Secrets Management** skill) largely applies unchanged.
`,

  "advanced-concepts": `
### A2A and MCP together: the two-layer mental model

The cleanest way to reason about a production multi-agent system is two layers:

| Layer | Protocol | Question it answers |
|---|---|---|
| Agent ↔ tools/data | **MCP** | "How does THIS agent read a file, query a database, or call an external API?" |
| Agent ↔ agent | **A2A** | "How does this agent hand work to, or receive work from, a DIFFERENT agent?" |

A single agent in a real system is very often both an MCP client (reaching its own tools) and an A2A server (exposing itself to other agents) and/or an A2A client (delegating to other agents) at the same time. Conflating the two layers — for example, trying to expose an internal tool via A2A instead of MCP, or trying to orchestrate sub-agents via MCP instead of A2A — is the most common architectural confusion for teams new to both protocols.

### Opaque execution, transparent contract

A core design property of A2A is that a calling agent never needs (or gets) visibility into how the remote agent produces its result — no shared memory, no shared prompt, no visibility into the remote agent's internal reasoning or tool calls. All that crosses the boundary is the Task's messages, parts, and status. This "opaque box, transparent contract" property is precisely what makes cross-vendor, cross-organization interoperability possible: two agents can cooperate without either party needing to trust, inspect, or even know about the other's internal implementation, framework, or model. The cost of that property is that debugging a cross-agent failure has a hard visibility wall at the protocol boundary — see Debugging, below.

### Long-running, asynchronous, human-in-the-loop tasks as a first-class concept

Unlike a typical synchronous API call, A2A's input-required state and streaming/push-notification support are designed explicitly for tasks that may take an unbounded amount of wall-clock time and may need a human (or another agent) to weigh in partway through. Modeling this at the protocol level — rather than every implementer inventing their own polling and clarification convention — is what makes A2A suitable for genuinely agentic workloads (multi-step research, approvals, bookings) rather than only quick request/response calls.

### Trust, delegation chains, and the "who's actually accountable" problem

When Agent A delegates to Agent B, which delegates to Agent C, the accountability chain for a bad outcome (wrong booking, harmful content, a hallucinated fact acted on downstream) becomes genuinely hard to trace unless each hop in the chain logs enough about what it asked for and what it received. This is a fundamentally new failure mode compared to a single-agent system, and is a primary reason A2A-based systems need much more deliberate observability (see Monitoring) and adversarial testing (see Security and **AI Red Teaming**) than a single, self-contained agent does.

### Capability negotiation versus capability assumption

A well-built A2A client checks the Agent Card's advertised capabilities (does this agent support streaming? push notifications? which skills does it actually list?) before assuming them, and degrades gracefully (e.g. falls back to polling if streaming isn't advertised) rather than hardcoding an assumption about what a specific remote agent supports. This mirrors standard defensive API-client design, applied to a protocol where "the server" is itself a semi-autonomous AI system whose supported feature set may differ meaningfully between vendors and even between versions of the same vendor's agent.
`,

  "internal-working": `
Here is what happens, step by step, when Agent A delegates a task to Agent B over A2A:

~~~mermaid
flowchart TD
    A["Agent A decides it needs help\nfrom a specialist agent"] --> B["Fetch Agent B's Agent Card\n(GET /.well-known/agent.json)"]
    B --> C["Parse skills, capabilities,\nauthentication requirements"]
    C --> D["Authenticate\n(e.g. obtain/attach Bearer token)"]
    D --> E["Send tasks/send (or tasks/sendSubscribe)\nJSON-RPC request with the task message"]
    E --> F{"Agent B's response"}
    F -- "state: working" --> G["Poll tasks/get,\nor consume SSE stream,\nor await push notification"]
    G --> F
    F -- "state: input-required" --> H["Agent A supplies\nadditional message content"]
    H --> E
    F -- "state: completed" --> I["Agent A reads final\nmessage/parts as the result"]
    F -- "state: failed / canceled" --> J["Agent A handles the\nfailure (retry, fallback, alert)"]
~~~

1. **Discovery.** Agent A fetches Agent B's Agent Card, typically from a well-known URL, to learn what Agent B can do and how to talk to it — this step can be cached, since an Agent Card doesn't change on every request.
2. **Authentication.** Agent A attaches credentials matching one of the schemes the Agent Card advertised (commonly a Bearer token).
3. **Task submission.** Agent A sends a JSON-RPC request (tasks/send for a simple request, tasks/sendSubscribe to also open an SSE stream of updates) carrying the task's initial message.
4. **Processing and state transitions.** Agent B works the task internally (using whatever framework, tools, or MCP servers it wants — completely invisible to Agent A) and transitions the task through submitted → working → possibly input-required → a terminal state.
5. **Result delivery.** Agent A receives the final state either by polling tasks/get, by reading the next event on an SSE stream it's subscribed to, or by receiving a push notification at a webhook it registered.
6. **Result consumption.** Agent A reads the final message's parts (text, structured data, files) as the actual work product, and proceeds with its own broader task using that result.

The core internal mechanism worth remembering: everything that crosses the wire is the Task object's messages and status — there is no shared internal state, no visibility into Agent B's reasoning, only the explicit contract of the protocol.
`,

  architecture: `
A senior engineer thinks about A2A at two levels: the protocol's own request/response architecture, and how to structure a multi-agent application around it.

### Protocol architecture

~~~mermaid
flowchart TB
    subgraph ClientSide["Agent A (A2A client)"]
        Orchestrator["Orchestrating logic\n(LangGraph / CrewAI / custom)"]
        A2AClient["A2A client library"]
    end
    subgraph Wire["Wire format"]
        JSONRPC["JSON-RPC 2.0 over HTTPS"]
        SSE["Server-Sent Events\n(streaming updates)"]
        Webhook["Webhook callback\n(push notifications)"]
    end
    subgraph ServerSide["Agent B (A2A server)"]
        AgentCard["Agent Card\n(/.well-known/agent.json)"]
        TaskManager["Task manager\n(state machine)"]
        AgentImpl["Agent's own internal implementation\n(any framework, own MCP tool access)"]
    end
    Orchestrator --> A2AClient --> JSONRPC --> TaskManager
    TaskManager --> AgentImpl
    TaskManager -.updates.-> SSE --> A2AClient
    TaskManager -.completion.-> Webhook --> ClientSide
    A2AClient --> AgentCard
~~~

### Application architecture — a multi-agent system built around A2A

~~~
myagentsystem/
├── src/myagentsystem/
│   ├── orchestrator/           # the "front" agent: decomposes user requests,
│   │                           #   decides which specialist agent to delegate to
│   ├── a2a/
│   │   ├── client.py           # A2A client wrapper: discovery, auth, task submission
│   │   ├── card_cache.py       # caches fetched Agent Cards with a TTL
│   │   └── task_tracker.py     # tracks in-flight tasks, timeouts, retries
│   ├── agents/
│   │   ├── research_agent/     # a specialist agent, itself exposing an A2A server
│   │   │   ├── agent_card.py
│   │   │   ├── server.py       # implements tasks/send, tasks/sendSubscribe
│   │   │   └── internals/      # this agent's own reasoning + MCP tool access
│   │   └── booking_agent/
│   └── core/                   # config, logging, auth credential management
└── tests/
~~~

Rules: the orchestrator only ever talks to specialist agents through the a2a/client.py wrapper — never a raw HTTP call scattered through business logic — so authentication, retry policy, and Agent Card caching live in exactly one place; each specialist agent's internal implementation (its own framework, its own MCP tool connections) stays entirely behind its A2A server boundary and is never assumed or hardcoded by callers.
`,

  "data-flow": `
Trace one cross-agent booking request end to end:

~~~mermaid
sequenceDiagram
    participant User
    participant A as Orchestrator Agent (A)
    participant Card as Agent B's Agent Card
    participant B as Booking Agent (B)

    User->>A: "Book me a flight to Chicago next Friday"
    A->>Card: GET /.well-known/agent.json
    Card-->>A: skills, endpoint, auth scheme
    A->>B: tasks/send (JSON-RPC): "book flight to Chicago, next Friday"
    B-->>A: status: working
    Note over B: Agent B internally searches flights\n(its own reasoning + its own MCP tools)
    B-->>A: status: input-required, message: "3 options, which one?"
    A->>User: relay the 3 options for a human decision
    User->>A: "the 2pm Delta flight"
    A->>B: tasks/send with the follow-up message (same task id)
    B-->>A: status: working
    B-->>A: status: completed, message: booking confirmation
    A->>User: "Booked! Confirmation #DL456-9F2"
~~~

The critical thing this trace makes visible: A2A's input-required state is what allows a human decision (relayed through Agent A) to be woven into the middle of a task that's otherwise happening entirely between two AI agents — without that explicit state, this interaction would have to be built as a series of disconnected, ad hoc API calls rather than one coherent task with a shared identity (the task id) across every round trip.
`,

  "production-usage": `
### Where it fits in a real stack

A2A shows up wherever a production system needs one AI agent to delegate work to another agent it doesn't own or fully control — most commonly: an orchestrating "front" agent delegating to specialist agents (each possibly built by a different internal team or an external partner), enterprise systems exposing an agent interface to partner companies, and agent marketplaces where a consumer agent needs to discover and use third-party agent services at runtime via their published Agent Cards.

### Typical implementation choices

- **SDKs**: reference and community SDKs exist across multiple languages (Python, JavaScript/TypeScript, Java, and others) as the ecosystem has grown since the 2025 announcement — check the official A2A project repositories for the current, actively maintained SDK list rather than assuming a specific language's support, since this is still evolving.
- **Agent Card hosting**: served at a well-known, cacheable URL path so calling agents (and tooling) can discover it without a bespoke lookup mechanism per agent.
- **Task persistence**: a production A2A server needs to persist task state (so tasks/get and reconnecting SSE clients work correctly across server restarts or load-balanced replicas) — typically backed by whatever database or cache layer (Redis, Postgres) the team already operates.
- **Framework integration**: agent framework vendors (**LangGraph**, CrewAI, and others) have added or are adding first-class A2A client/server support, so many teams reach for their existing framework's A2A integration rather than hand-rolling the protocol.

### Configuration and operational defaults

- Set explicit timeouts on every outbound A2A call — a remote agent hanging in "working" indefinitely should not block your orchestrating process forever.
- Cache fetched Agent Cards with a sensible TTL rather than re-fetching on every task (they change rarely relative to how often you'd call a partner agent).
- Treat every remote agent's authentication requirement as a first-class configuration item (credentials, token refresh) managed through the same secrets infrastructure as any other external API credential — see the **Secrets Management** skill.

I'm not confident of exact current adoption numbers, specific vendor SDK maturity, or precise spec version details as of today — verify directly against the official A2A specification and its GitHub organization before treating any of the above as a fixed, current fact rather than a directional description.
`,

  "industry-examples": `
- **Google**, as the protocol's originator, has published A2A alongside its own agent tooling (including Vertex AI-adjacent agent products) as the recommended way for agents built on different stacks to interoperate with Google's agent ecosystem.
- **The founding partner group** announced alongside A2A in April 2025 included a large number of enterprise software and consulting companies (reported at over 50 partners at launch) — spanning both agent-framework vendors and large enterprises intending to use A2A to connect internal agents across business units. I don't have a verified, complete, current list of every named participant and their specific production usage, and would rather flag that than list companies I'm not confident about.
- **The Linux Foundation**, since taking over stewardship, hosts A2A as an open governance project — the kind of neutral home that matters specifically because A2A's value proposition (cross-vendor interoperability) only works if no single company controls its evolution unilaterally, mirroring how Kubernetes' move to the Cloud Native Computing Foundation was central to its cross-vendor adoption.
- **Agent framework vendors** (**LangGraph**/LangChain, CrewAI, and others in that space) have added or announced A2A support, positioning it as the standard way their framework-built agents can interoperate with agents built on entirely different frameworks — this pattern (framework-level A2A adapters) is likely to be the dominant on-ramp for most teams rather than hand-rolling the protocol from scratch.

Given how recent A2A is, I'd treat any specific "Company X uses A2A in production for Y" claim as something to verify against current sources rather than something to take as settled industry history — this page reflects the trajectory as of my knowledge cutoff, not a mature, long-settled adoption record.
`,

  "best-practices": `
1. **Keep MCP and A2A cleanly separated in your architecture.** Use MCP for an agent's own tool/data access; use A2A only at the boundary between independent agents. Mixing the two at the same layer is the most common design confusion for teams new to both.
2. **Cache Agent Cards with a TTL, but never assume they never change.** Re-fetch periodically or on authentication/capability errors, since a remote agent's capabilities or endpoint can legitimately change over time.
3. **Always set timeouts on outbound A2A calls**, and design your orchestrator to handle a remote agent that never leaves the "working" state gracefully (timeout, cancel, fall back).
4. **Treat every remote agent as untrusted input**, regardless of how reputable the counterparty is — validate and sanity-check returned data/parts before acting on them downstream, especially before feeding them into another LLM call (see Security).
5. **Log the full task lifecycle, not just the final result**, so a failed or stuck multi-hop delegation chain can be traced back to the specific hop and state where it broke.
6. **Prefer streaming (SSE) or push notifications over polling for long-running tasks** — polling wastes both sides' resources and adds latency to detecting a state change.
7. **Design for the input-required state explicitly**, rather than assuming every task will complete in one round trip — this is the state that makes human-in-the-loop and multi-turn agent collaboration actually work over the protocol.
8. **Version your own Agent Card and skills deliberately**, and communicate breaking changes to known callers, exactly as you would for any public API you expect other teams or companies to depend on.
9. **Scope authentication tightly per remote agent**, using the same credential-management discipline (short-lived tokens, least privilege) you'd apply to any other external API integration.
10. **Build a circuit breaker around flaky or slow remote agents** in a multi-agent orchestration, so one failing specialist agent doesn't cascade into failing the entire user-facing task.
11. **Include structured data parts, not just free text, wherever the result needs to be machine-actioned** by the calling agent — see the **Structured Outputs** skill for the broader discipline of getting reliably parseable output out of an LLM-driven system.
`,

  "anti-patterns": `
### Treating A2A as a replacement for MCP (or vice versa)

~~~python
# WRONG: exposing an internal database query tool via an A2A "agent"
# just because A2A infrastructure is already in place
class FakeAgent:
    def handle_task(self, task):
        return run_sql_query(task.message)   # this is a TOOL, not an agent-to-agent interaction

# RIGHT: expose internal tools via MCP; reserve A2A for genuine
# agent-to-agent delegation where the counterpart has its own reasoning/autonomy
~~~

A2A is for delegating a task to another autonomous agent, not a rebranding of a tool call. If the "remote agent" has no internal reasoning of its own and is just executing a fixed function, it belongs behind MCP (or a plain API), not A2A.

### Hardcoding a remote agent's capabilities instead of reading its Agent Card

~~~python
# WRONG: assume every partner agent supports streaming
def call_agent(endpoint, task):
    return stream_task(endpoint, task)   # breaks the moment a partner doesn't support SSE

# RIGHT: check the Agent Card's advertised capabilities first, degrade gracefully
def call_agent(endpoint, task, agent_card):
    if agent_card["capabilities"].get("streaming"):
        return stream_task(endpoint, task)
    return poll_task(endpoint, task)
~~~

### No timeout on a delegated task

~~~python
# WRONG: wait forever for a remote agent to finish
result = client.send_task(endpoint, task)   # no timeout -- a hung remote agent hangs YOUR system too

# RIGHT: always bound how long you'll wait, and have a defined fallback
result = client.send_task(endpoint, task, timeout=30)
if result is None:
    handle_timeout(task)   # retry, escalate to a human, or fail the parent task explicitly
~~~

### Blindly trusting and acting on a remote agent's returned data

~~~python
# WRONG: feed a remote agent's response straight into another LLM call with no validation
next_prompt = f"Given this result: {remote_result}, decide the next action."

# RIGHT: validate structure/shape, and treat remote content as untrusted input --
# the same discipline you'd apply to any external API response or user input
validated = validate_schema(remote_result, ExpectedResultSchema)
next_prompt = build_prompt_safely(validated)
~~~

### Ignoring the input-required state and treating every task as fire-and-forget

Building an orchestrator that only ever checks for "completed" or "failed," and silently drops tasks that land in "input-required," breaks any workflow that legitimately needs a clarifying round trip — handle every documented state, not just the two most common ones.
`,

  performance: `
### Measure first

Instrument the actual latency breakdown of a cross-agent call before optimizing anything: Agent Card fetch/cache-hit time, network round-trip to the remote agent, the remote agent's own processing time (opaque to you, but still worth timing end-to-end), and your own result-processing time.

~~~python
import time

def timed_delegate(client, endpoint, task):
    start = time.perf_counter()
    result = client.send_task(endpoint, task, timeout=30)
    elapsed_ms = (time.perf_counter() - start) * 1000
    # Emit as a histogram metric labeled by remote agent -- see Monitoring
    return result, elapsed_ms
~~~

### The optimization hierarchy for A2A-based systems

1. **Cache Agent Cards.** Avoid re-fetching a document that changes rarely on every single delegated task — this removes one full network round trip per call.
2. **Prefer streaming over polling for long tasks.** Polling adds both wasted requests and detection latency (you only find out a task finished up to one poll interval late); a subscribed SSE stream or a push-notification webhook delivers the state change the moment it happens.
3. **Parallelize independent delegations.** If an orchestrator needs results from multiple independent specialist agents, fire the A2A requests concurrently (e.g. with asyncio.gather in Python — see the **Python** skill's concurrency section) rather than sequentially awaiting each one.
4. **Set aggressive but realistic timeouts per remote agent**, informed by that agent's typical task duration, rather than one global timeout that's either too short for a legitimately slow specialist or too long for a fast one.
5. **Reuse HTTP connections/sessions** to frequently-called remote agents rather than opening a fresh connection per task, using standard HTTP client connection pooling.
6. **Batch independent sub-tasks into a single delegated task where the remote agent's skill supports it**, reducing round-trip overhead versus many single-item tasks, when the remote agent's Agent Card indicates that capability.

### What you cannot optimize away

The remote agent's own internal processing time is opaque and, by design, outside your control — A2A's "opaque box" property (see Advanced Concepts) means the only performance lever available to the calling side is how efficiently it discovers, submits, and consumes results, not how fast the remote agent reasons internally. Choosing which specialist agent to delegate to at all (including latency as a selection criterion) is a valid architectural lever, but tuning a specific remote agent's internals is, correctly, not your problem to solve.
`,

  scalability: `
An A2A-based system scales along two mostly independent axes: how many concurrent tasks a given agent (as an A2A server) can process, and how many different remote agents an orchestrator (as an A2A client) needs to coordinate.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["Agent B server instance 1"]
    LB --> S2["Agent B server instance N"]
    S1 & S2 --> TaskStore[("Shared task state store\n(Redis/Postgres)")]
    S1 & S2 --> AgentInternals["Agent B's own reasoning +\nMCP tool connections"]
~~~

### Serving side (being an A2A server)

Because A2A tasks are long-running and stateful (submitted → working → …), a production A2A server needs task state in a shared store reachable by every server instance behind a load balancer — otherwise a client polling tasks/get or reconnecting an SSE stream can be routed to an instance that never processed the original request. This is the same "stateless compute, shared state store" pattern that applies to any horizontally scaled web service.

### Calling side (being an A2A client / orchestrator)

An orchestrator delegating to many specialist agents needs: bounded concurrency (a semaphore or worker pool limiting in-flight delegated tasks, to avoid overwhelming either your own process or a specific remote agent), per-remote-agent circuit breaking (so one consistently failing or slow specialist doesn't degrade the whole orchestration), and Agent Card caching at scale (a shared cache, not a per-instance one, if the orchestrator itself runs as multiple replicas).

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| Task state isn't visible across server replicas | Move task state into a shared store (Redis/Postgres) instead of in-process memory |
| Orchestrator overwhelms a slow specialist agent | Per-remote-agent rate limiting and a circuit breaker; queue or shed load rather than retry-storm |
| Many independent Agent Card fetches on every task | Shared, TTL'd cache reachable by all orchestrator replicas |
| SSE connections held open at scale exhaust connections | Push notifications (webhook callback) instead of long-held SSE for very long-running tasks, where supported |
| One failing remote agent cascades into failing the parent task | Circuit breaker + documented fallback behavior (retry a different specialist, degrade gracefully, or surface a clear failure to the end user) |
`,

  security: `
### A2A-specific attack surface

A2A introduces trust boundaries that don't exist in a single-agent system, and deserves the same adversarial scrutiny as any other network protocol accepting external input — see **AI Red Teaming** for the broader practice.

1. **Malicious or compromised Agent Cards.** An Agent Card is fetched from a URL and trusted to describe capabilities and authentication requirements; a spoofed or compromised card could misdirect a calling agent to a malicious endpoint, or lie about required authentication to harvest credentials. Mitigation: verify Agent Card provenance (TLS, and where available, signed or otherwise authenticated card sources) rather than trusting an unauthenticated fetch blindly.
2. **Prompt injection via remote agent output.** A remote agent's returned message content flows, in many architectures, into the calling agent's own subsequent LLM prompts — a malicious or compromised remote agent (or one that's simply been successfully prompt-injected itself) can smuggle instructions into its response that manipulate the calling agent's downstream behavior. This is a direct instance of the risks covered in **Prompt Injection Defense**, applied specifically to inter-agent content rather than user input.
3. **Delegation chains obscuring accountability.** When Agent A delegates to Agent B, which delegates to Agent C, a harmful or wrong outcome can be hard to attribute to the specific hop responsible unless every hop logs enough context — this is both a debugging problem (see Debugging) and a security/audit problem, since an attacker exploiting one hop in a long chain can be effectively invisible to the originating caller.
4. **Over-trusting a "reputable" counterparty.** Organizational reputation is not a security control — every remote agent, including ones from well-known vendors or partners, should be treated as an untrusted input source at the protocol boundary: validate response shapes, bound what actions can be taken automatically on unvalidated remote content, and require human approval for consequential actions (payments, bookings, irreversible changes) triggered by a remote agent's output.
5. **Authentication and credential handling.** A2A reuses standard web-auth schemes (Bearer tokens, OAuth2) rather than inventing new cryptography — which is a strength (well-understood tooling applies) but also means the usual credential-management discipline (short-lived tokens, no secrets in logs, rotation) fully applies; see the **Secrets Management** skill.

### Concrete defenses

- Pin and periodically re-verify known-good Agent Card sources rather than trusting an arbitrary fetched URL on every task.
- Sanitize and schema-validate any remote agent output before it's incorporated into a subsequent LLM prompt or acted on programmatically.
- Require explicit human approval for high-consequence actions triggered by a multi-hop delegation chain, rather than allowing full autonomy end to end by default.
- Log enough context at every delegation hop (task id, calling agent identity, remote agent identity, summarized content) to reconstruct a full delegation chain after an incident.
- Apply least-privilege authentication scoping per remote agent, exactly as you would for any other third-party API integration.

See the dedicated **AI Red Teaming** and **Prompt Injection Defense** skills for the broader adversarial-testing practice this connects to, and **Model Context Protocol**'s own security section for the complementary tool-access trust boundary.
`,

  testing: `
Testing an A2A integration means testing both sides of a network protocol (client behavior and server behavior) plus the agentic behavior riding on top of it.

~~~python
# tests/test_a2a_client.py
import pytest
from myagentsystem.a2a.client import A2AClient

@pytest.fixture
def fake_agent_card():
    return {
        "name": "Fake Booking Agent",
        "url": "http://fake-agent.test/a2a",
        "capabilities": {"streaming": False, "pushNotifications": False},
        "skills": [{"id": "book-flight", "name": "Book Flight"}],
        "authentication": {"schemes": ["Bearer"]},
    }

def test_client_degrades_to_polling_without_streaming_support(fake_agent_card, httpx_mock):
    client = A2AClient(auth_token="fake-token")
    httpx_mock.add_response(
        url="http://fake-agent.test/a2a",
        json={"jsonrpc": "2.0", "id": 1, "result": {"status": {"state": "completed"}}},
    )
    result = client.send_task(fake_agent_card, {"role": "user", "parts": [{"type": "text", "text": "book it"}]})
    assert result["status"]["state"] == "completed"

def test_client_times_out_on_hung_remote_agent(fake_agent_card, httpx_mock):
    client = A2AClient(auth_token="fake-token", timeout=0.1)
    httpx_mock.add_response(
        url="http://fake-agent.test/a2a",
        json={"jsonrpc": "2.0", "id": 1, "result": {"status": {"state": "working"}}},
    )
    # A well-built client treats "working" past a deadline as a timeout condition,
    # not an infinite wait -- test that the caller-side timeout actually fires.
    with pytest.raises(TimeoutError):
        client.send_task_and_await_completion(fake_agent_card, task_id="t1", poll_timeout=0.1)

def test_client_rejects_malformed_agent_card():
    from myagentsystem.a2a.card_cache import validate_agent_card
    with pytest.raises(ValueError):
        validate_agent_card({"name": "missing url and skills"})
~~~

### The senior testing doctrine for A2A systems

- **Fake the remote agent, don't call a real one, in unit tests.** Use a mocked HTTP layer (httpx_mock, responses) to simulate every task state (submitted, working, input-required, completed, failed, canceled) deterministically.
- **Explicitly test the input-required round trip**, since it's the state most likely to be under-tested and under-handled in a real implementation.
- **Test timeout and circuit-breaker behavior against a deliberately hung or slow fake remote agent**, not only the happy path.
- **Test Agent Card validation and graceful capability-degradation** (e.g. streaming unsupported → falls back to polling) explicitly, rather than assuming every partner supports every optional feature.
- **Run integration tests against a real or realistic A2A test server** (many SDKs ship a reference test server) before depending on a live third-party agent in CI, to avoid flaky tests coupled to an external system's uptime.
- **Include adversarial test cases**: a malformed Agent Card, a remote response containing an embedded prompt-injection attempt, and a delegation chain that fails at an intermediate hop — treat these as first-class test scenarios, not edge cases to skip.
`,

  debugging: `
### The toolbox, in escalation order

1. **Log the full task lifecycle, every state transition, with the task id.** Because A2A tasks can span multiple round trips (including an input-required detour), "what state was this task in, when" is the first thing you need to reconstruct a failure.

~~~python
import logging
logger = logging.getLogger("a2a_client")

def on_task_state_change(task_id: str, old_state: str, new_state: str):
    logger.info("task_state_change task_id=%s from=%s to=%s", task_id, old_state, new_state)
~~~

2. **Check the Agent Card first when "nothing works."** A stale cached card, an unreachable endpoint, or a mismatched authentication scheme against what the remote agent actually now expects is one of the most common root causes of confusing failures — re-fetch and diff against your cached version.
3. **Respect the opaque-box boundary when debugging a remote agent's behavior.** You cannot see Agent B's internal reasoning or tool calls from Agent A's side — the debugging surface available to you is exactly the messages, parts, and status your side sent and received. If you control both sides (e.g. in your own multi-agent system), add correlated logging on both sides using the shared task id so a single trace can be reconstructed across the boundary; if you don't control the remote side, escalate to that team/vendor with the exact request/response payloads you observed.
4. **Reproduce with a minimal, isolated request.** Strip a failing multi-hop delegation down to the single A2A call that's misbehaving, using the exact JSON-RPC payload, before assuming the bug is in your broader orchestration logic.
5. **Watch for silent capability mismatches.** A remote agent that stopped advertising streaming support (or changed its skill list) without you noticing is a common source of "this used to work" bugs — periodically diff a cached Agent Card against the live one, especially after a partner's deployment.
6. **Trace delegation chains end to end with a shared correlation id.** In a multi-hop system (A delegates to B, which delegates to C), propagate a correlation id through every hop's logs so a single incident can be reconstructed across all three systems, not just the two you directly observe.
`,

  monitoring: `
### The metrics that matter

~~~python
from prometheus_client import Counter, Histogram

A2A_TASKS = Counter(
    "a2a_tasks_total", "A2A tasks submitted", ["remote_agent", "final_state"]
)
A2A_TASK_DURATION = Histogram(
    "a2a_task_duration_seconds", "Time from submission to terminal state",
    ["remote_agent"],
)
A2A_CARD_FETCH_FAILURES = Counter(
    "a2a_agent_card_fetch_failures_total", "Failed Agent Card fetches", ["remote_agent"]
)

def on_task_complete(remote_agent: str, final_state: str, duration_seconds: float):
    A2A_TASKS.labels(remote_agent=remote_agent, final_state=final_state).inc()
    A2A_TASK_DURATION.labels(remote_agent=remote_agent).observe(duration_seconds)
~~~

### What to track and why

- **Task completion rate and terminal-state breakdown, per remote agent.** A rising failed or canceled rate for one specific specialist agent is your earliest signal of a degrading partner integration, and should be tracked per-agent, not only in aggregate.
- **Task duration distribution, per remote agent.** Feeds directly into setting realistic, per-agent timeouts rather than one arbitrary global value.
- **Agent Card fetch failures and staleness.** A rising failure rate on card fetches, or a long time-since-last-successful-refresh, is an early warning of a discovery-layer problem before it manifests as task failures.
- **input-required rate.** How often a delegated task needs a clarifying round trip — a sudden spike can indicate the calling agent is sending ambiguous or malformed initial requests to a specific specialist.
- **Delegation chain depth and cross-hop latency**, in systems with multi-hop delegation, so a slow link in a longer chain can be identified rather than only observing the end-to-end latency the originating caller experiences.
- **Rate of remote-content validation failures** (malformed or suspicious data/parts rejected before being acted on) — a rising rate here is a security signal worth alerting on, not just a data-quality metric.

Alert on symptoms that matter to the end user (rising failure rate, rising latency, degraded delegation-chain success) rather than only low-level infrastructure metrics, mirroring the RED-metrics philosophy used for any production service — and route alerts per remote agent so a single flaky specialist doesn't get lost in an aggregate "everything's mostly fine" dashboard.
`,

  deployment: `
### A minimal production-shaped A2A server (FastAPI)

~~~python
# app/a2a_server.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

AGENT_CARD = {
    "name": "Research Agent",
    "description": "Answers research questions using internal knowledge sources.",
    "url": "https://research-agent.example.com/a2a",
    "version": "1.0.0",
    "capabilities": {"streaming": True, "pushNotifications": False},
    "skills": [{"id": "research", "name": "Research Question", "description": "Answer a research question."}],
    "authentication": {"schemes": ["Bearer"]},
}

@app.get("/.well-known/agent.json")
def get_agent_card():
    # Served at a well-known, cacheable path -- callers should cache this with a TTL
    return AGENT_CARD

def verify_bearer_token(authorization: str = "") -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "missing or malformed Bearer token")
    token = authorization[len("Bearer "):]
    # Validate against your actual auth provider -- never accept any non-empty token
    if not is_valid_token(token):
        raise HTTPException(403, "invalid token")
    return token

@app.post("/a2a")
async def handle_task(request: dict, token: str = Depends(verify_bearer_token)):
    method = request.get("method")
    if method == "tasks/send":
        task_id = request["params"]["id"]
        # Persist task state to a shared store -- required for correctness behind
        # a load balancer with multiple server instances (see Scalability)
        await task_store.create(task_id, state="submitted")
        await process_task_async(task_id, request["params"]["message"])  # runs in background
        return {"jsonrpc": "2.0", "id": request["id"], "result": {"id": task_id, "status": {"state": "working"}}}
    raise HTTPException(400, f"unsupported method: {method}")

@app.post("/a2a/stream")
async def handle_task_stream(request: dict, token: str = Depends(verify_bearer_token)):
    task_id = request["params"]["id"]
    async def event_generator():
        async for update in task_store.subscribe(task_id):
            yield f"data: {json.dumps(update)}\\n\\n"
            if update["result"]["status"]["state"] in ("completed", "failed", "canceled"):
                break   # terminal state -- close the stream
    return StreamingResponse(event_generator(), media_type="text/event-stream")
~~~

~~~dockerfile
# Dockerfile -- the A2A server is a standard HTTP service, deployed like any other
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY app/ app/
RUN useradd -m agentuser
USER agentuser
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.a2a_server:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Per-line rationale: the Agent Card is served at the well-known path with no auth required (discovery must be possible before a caller has credentials); the task endpoint requires Bearer auth on every call, validated against a real auth provider rather than accepting any nonempty token; task state is persisted to a shared store rather than kept in-process, so the service can run multiple replicas behind a load balancer without breaking tasks/get or SSE reconnection; the SSE handler explicitly closes on a terminal state rather than holding the connection open indefinitely.

### Operational notes

- Health endpoints (/healthz, /readyz) belong on an A2A server exactly as on any other production HTTP service — wire them into your orchestrator's platform (Kubernetes probes, load balancer health checks).
- Rate-limit incoming task submissions per calling agent identity, to protect against a misbehaving or runaway caller.
- Version the Agent Card's "version" field deliberately and document breaking changes to known callers before deploying them.
`,

  "production-checklist": `
Before an A2A integration (client or server side) takes real production traffic:

- [ ] Agent Card served at a stable, cacheable, well-known URL with accurate, current skills and capabilities
- [ ] Authentication enforced on every task-handling endpoint, validated against a real identity provider
- [ ] Task state persisted to a shared store, correct behind multiple load-balanced server replicas
- [ ] Explicit timeout configured on every outbound A2A call, with a defined fallback behavior on timeout
- [ ] input-required state explicitly handled end to end, not just completed/failed
- [ ] Remote agent output validated/schema-checked before being incorporated into downstream LLM prompts or automated actions
- [ ] Circuit breaker or rate limiting around each remote agent dependency in a multi-agent orchestration
- [ ] Full task lifecycle logged with a correlation id, traceable across multi-hop delegation chains
- [ ] Agent Card caching implemented with a sane TTL and periodic re-validation
- [ ] High-consequence actions (payments, bookings, irreversible changes) triggered by remote agent output require human approval, not full autonomy by default
- [ ] Metrics dashboarded per remote agent: task completion rate, terminal-state breakdown, duration distribution
- [ ] Security review completed for prompt-injection risk via remote agent content (see **Prompt Injection Defense**)
- [ ] Load tested with realistic concurrent delegation volume and at least one deliberately slow/hung fake remote agent
- [ ] Runbook documented: how to identify, isolate, and mitigate a misbehaving remote agent in production
`,

  "common-mistakes": `
1. **Confusing A2A with MCP** — exposing an internal tool via A2A, or trying to orchestrate sub-agents through MCP, instead of keeping the two protocols at their correct layers.
2. **Never fetching a fresh Agent Card after initial caching** — missing capability or endpoint changes on the remote side until a task inexplicably starts failing.
3. **No timeout on delegated tasks** — a single hung remote agent silently stalls the entire orchestrating process.
4. **Treating every remote agent's output as trusted** — feeding unvalidated remote content straight into a subsequent LLM prompt, opening the door to prompt injection from a compromised or malicious counterpart.
5. **Ignoring the input-required state in orchestration logic** — building a system that only handles the two terminal happy-path states and silently drops or mishandles any task that legitimately needs a clarifying round trip.
6. **Assuming capability parity across remote agents** — hardcoding "this agent supports streaming" instead of checking the Agent Card, breaking the moment a different or updated remote agent doesn't.
7. **No correlation id across a multi-hop delegation chain** — making a cross-agent incident nearly impossible to reconstruct after the fact.
8. **Storing task state only in-process** — breaking tasks/get and SSE reconnection the moment the server runs more than one replica or restarts mid-task.
9. **No circuit breaker around a flaky specialist agent** — letting one consistently failing remote agent cascade into failing every user-facing task that depends on it.
10. **Skipping human approval on high-consequence, remote-agent-triggered actions** — granting full end-to-end autonomy to a multi-hop delegation chain for actions (payments, irreversible changes) that deserve a checkpoint.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| 401/403 on every task submission | Stale or missing Bearer token, or a remote agent that changed its auth requirements | Re-fetch the Agent Card, verify the current authentication scheme, refresh credentials |
| Task stuck in "working" forever | Remote agent genuinely hung, or your client isn't handling a dropped SSE connection/timeout | Add an explicit timeout and a defined fallback (retry, cancel, escalate) |
| Client crashes on an unexpected task state | Only completed/failed handled, input-required (or a new state) unhandled | Explicitly handle every documented state; treat unknown states as a defined "unknown, escalate" case rather than crashing |
| Streaming client silently stops receiving updates | Remote agent doesn't actually support streaming despite an assumption, or the SSE connection dropped without reconnection logic | Check the Agent Card's advertised capabilities; implement reconnect-with-backoff for SSE |
| Different behavior after a partner's deployment | Remote agent's skills or capabilities changed, cached Agent Card is stale | Re-fetch and diff the Agent Card against your cached copy; alert on unexpected changes |
| Task result contains unexpected instructions/behavior in downstream LLM calls | Remote agent output not validated before being incorporated into a subsequent prompt — a prompt-injection vector | Schema-validate and sanitize remote content before use; never interpolate raw remote text directly into a trusted prompt |
| 404 on the Agent Card URL | Wrong or outdated well-known path, or the remote service moved | Verify the current documented well-known path with the remote agent's provider; don't hardcode a guessed path |
| Load-balanced server returns "task not found" | Task state stored in-process on a different replica than the one that created it | Move task state to a shared store (Redis/Postgres) reachable by every replica |

The general habit: log the full JSON-RPC request/response and the task's state history for any failing interaction — nearly every one of these symptoms is diagnosable from that pair of logs plus a fresh Agent Card fetch.
`,

  faqs: `
**Q: Is A2A a replacement for the Model Context Protocol?**
No — they're complementary, not competing. MCP standardizes how an agent connects to tools and data; A2A standardizes how one agent connects to another agent. Most real systems use both: each agent uses MCP internally for its own tool access, and uses A2A to talk to other agents.

**Q: Do I need A2A if all my agents are built on the same framework, by the same team?**
Probably not, at least not yet. A2A's value is specifically cross-vendor, cross-framework, cross-organization interoperability. If every agent in your system is internal and built on one shared framework, a simpler internal API or your framework's native multi-agent orchestration may be entirely sufficient — reach for A2A when you need to talk to an agent you don't fully control.

**Q: Who governs the A2A spec?**
It was originated by Google and announced with a large founding partner group in April 2025, then contributed to the Linux Foundation for vendor-neutral governance. I'd verify the current governance structure and any recent spec changes directly against the official project before quoting specifics as current, since a young open-governance project's structure and spec details can evolve.

**Q: Is A2A secure by default?**
A2A defines standard authentication schemes (Bearer tokens, OAuth2) at the protocol level, but security in practice depends heavily on how you implement validation of Agent Cards, remote content, and authorization around consequential actions — see the Security section. Treat "we use A2A" as necessary infrastructure, not sufficient security posture.

**Q: What happens if a remote agent I'm calling goes down or is slow?**
That's entirely your responsibility to handle — A2A gives you the vocabulary (timeouts, the working/failed states) but not automatic resilience. Build explicit timeouts, circuit breakers, and fallback behavior around every remote agent dependency, exactly as you would for any other external API.

**Q: Can A2A tasks involve a human in the loop?**
Yes — the input-required state exists specifically to support a task that needs a clarifying answer partway through, which an orchestrating agent can relay to (and get an answer from) a human user before resuming the delegated task.

**Q: How mature is the A2A ecosystem right now?**
As of my knowledge cutoff, it's young — announced in 2025, with growing but still-maturing SDK and framework support. I'd verify current SDK language coverage, spec version, and production maturity directly against the official A2A project resources before making a firm architectural bet on specific tooling details.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What problem does A2A solve?* It lets independent AI agents, built on different frameworks or by different organizations, discover each other's capabilities and exchange task requests/results through one shared protocol, instead of requiring a bespoke integration for every agent pair.
2. *What is an Agent Card?* A JSON document describing an agent's identity, capabilities/skills, endpoint, and authentication requirements, typically fetched from a well-known URL before a caller sends it real requests.
3. *Name the states in an A2A Task's lifecycle.* submitted, working, input-required, and the terminal states completed, failed, canceled.
4. *How does A2A relate to MCP?* They're complementary: MCP standardizes agent-to-tool/data access; A2A standardizes agent-to-agent communication. A single agent is often both an MCP client and an A2A server/client at once.
5. *What wire format does A2A use?* JSON-RPC 2.0 over HTTP(S), with Server-Sent Events for streaming updates.

**Senior:**

6. *Walk through what happens when Agent A delegates a task to Agent B, including a mid-task clarification.* Fetch Agent B's Agent Card → authenticate → submit the task (tasks/send) → Agent B transitions to working → Agent B needs more info and transitions to input-required → Agent A supplies the missing message → Agent B resumes and reaches a terminal state → Agent A reads the final result. Strong answers explain why input-required is what makes this a coherent single task rather than disconnected calls.
7. *Why is A2A described as "opaque box, transparent contract"?* The calling agent never sees the remote agent's internal reasoning, framework, or tool calls — only the messages, parts, and status that cross the protocol boundary — which is precisely what allows cross-vendor interoperability without either side needing to trust or inspect the other's implementation.
8. *What are the main security risks specific to A2A, beyond typical API security?* Malicious/spoofed Agent Cards, prompt injection carried in a remote agent's returned content flowing into downstream LLM prompts, and accountability/traceability gaps across multi-hop delegation chains — mitigations include verifying card provenance, validating remote content before use, and logging enough context per hop to reconstruct a chain.
9. *How would you design an orchestrator that delegates to several specialist agents, one of which is occasionally slow or down?* Per-remote-agent timeouts, a circuit breaker so one failing specialist doesn't cascade into failing the whole user-facing task, bounded concurrency, and a documented fallback (retry a different specialist, degrade gracefully, or surface a clear failure) — the same resilience patterns as any external API dependency.
10. *Why must a production A2A server persist task state in a shared store rather than in-process memory?* Because tasks are long-running and stateful; behind a load balancer with multiple replicas, a client's later tasks/get or SSE reconnect can be routed to a different instance than the one that created the task, breaking correctness unless state is externally shared.
11. *When would you NOT reach for A2A?* When all agents involved are internal, built on one shared framework, and fully within your control — a simpler internal API or your framework's native orchestration may be sufficient; A2A's value is specifically cross-vendor/cross-organization interoperability.
12. *How do you prevent a compromised or malicious remote agent from manipulating your system via its response content?* Treat every remote agent's output as untrusted input: schema-validate it, sanitize before incorporating it into downstream LLM prompts, and require human approval for high-consequence actions triggered by remote content — connect this explicitly to **Prompt Injection Defense** and **AI Red Teaming** practice.
`,

  "coding-questions": `
### 1. Minimal Agent Card validator (tests schema discipline)

~~~python
def validate_agent_card(card: dict) -> None:
    """Raise ValueError with a specific message for any missing/malformed required field.
    A calling agent should never proceed to send real tasks against an invalid card."""
    required_top_level = ["name", "url", "skills", "authentication"]
    for field in required_top_level:
        if field not in card:
            raise ValueError(f"Agent Card missing required field: {field}")

    if not isinstance(card["skills"], list) or not card["skills"]:
        raise ValueError("Agent Card must declare at least one skill")

    for skill in card["skills"]:
        if "id" not in skill or "name" not in skill:
            raise ValueError(f"skill entry missing id/name: {skill}")

    schemes = card["authentication"].get("schemes", [])
    if not schemes:
        raise ValueError("Agent Card must declare at least one authentication scheme")

    if not card["url"].startswith("https://") and not card["url"].startswith("http://localhost"):
        # Production callers should require HTTPS except for local/dev testing
        raise ValueError("Agent Card url must use HTTPS in production")

assert validate_agent_card({
    "name": "Test Agent", "url": "https://example.com/a2a",
    "skills": [{"id": "s1", "name": "Skill One"}],
    "authentication": {"schemes": ["Bearer"]},
}) is None
~~~

Complexity: O(k) in the number of skills, trivial cost relative to the network call it guards. Follow-up: extend to validate that "capabilities" flags (streaming, pushNotifications) are booleans, and that skill ids are unique.

### 2. Task lifecycle state machine with illegal-transition guarding (tests state-machine reasoning)

~~~python
class InvalidTransition(Exception):
    pass

VALID_TRANSITIONS = {
    "submitted": {"working"},
    "working": {"input-required", "completed", "failed", "canceled"},
    "input-required": {"working", "canceled"},
    "completed": set(),
    "failed": set(),
    "canceled": set(),
}

class A2ATask:
    def __init__(self, task_id: str):
        self.id = task_id
        self.state = "submitted"
        self.history: list[str] = ["submitted"]

    def transition(self, new_state: str) -> None:
        if new_state not in VALID_TRANSITIONS.get(self.state, set()):
            raise InvalidTransition(f"cannot go from {self.state} to {new_state}")
        self.state = new_state
        self.history.append(new_state)

task = A2ATask("t1")
task.transition("working")
task.transition("input-required")
task.transition("working")
task.transition("completed")
assert task.history == ["submitted", "working", "input-required", "working", "completed"]

try:
    task.transition("working")   # completed is terminal -- must raise
    assert False, "should have raised"
except InvalidTransition:
    pass
~~~

Discussion points: why terminal states must have no outgoing transitions; how this guard prevents a buggy client or server from silently corrupting task history; extending it to emit a metric on every illegal-transition attempt (a strong signal of a client/server implementation bug or an adversarial actor).

### 3. Bounded-concurrency multi-agent delegator with per-agent circuit breaker (production-flavored)

~~~python
import asyncio
import time

class CircuitBreaker:
    """Opens after N consecutive failures; refuses calls for a cooldown window."""
    def __init__(self, failure_threshold: int = 3, cooldown_seconds: float = 30):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.consecutive_failures = 0
        self.opened_at: float | None = None

    def allow_call(self) -> bool:
        if self.opened_at is None:
            return True
        if time.monotonic() - self.opened_at >= self.cooldown_seconds:
            self.opened_at = None   # cooldown elapsed -- allow a trial call
            return True
        return False

    def record_success(self) -> None:
        self.consecutive_failures = 0
        self.opened_at = None

    def record_failure(self) -> None:
        self.consecutive_failures += 1
        if self.consecutive_failures >= self.failure_threshold:
            self.opened_at = time.monotonic()

async def delegate_to_many(agents: dict, task_text: str, max_concurrency: int = 5):
    """Delegate the same task to several specialist agents concurrently,
    respecting a per-agent circuit breaker and a global concurrency limit."""
    semaphore = asyncio.Semaphore(max_concurrency)
    breakers = {name: CircuitBreaker() for name in agents}

    async def call_one(name, client):
        if not breakers[name].allow_call():
            return name, None   # circuit open -- skip this agent without even trying
        async with semaphore:
            try:
                result = await client.send_task_async(task_text, timeout=10)
                breakers[name].record_success()
                return name, result
            except (TimeoutError, ConnectionError):
                breakers[name].record_failure()
                return name, None

    results = await asyncio.gather(*(call_one(n, c) for n, c in agents.items()))
    return {name: result for name, result in results}
~~~

Complexity: O(n) concurrent calls bounded by max_concurrency; circuit-breaker check is O(1) per agent. Follow-up they'll ask: make the cooldown adaptive (exponential backoff), or add a half-open trial-request state instead of a single hard cooldown boundary.
`,

  "hands-on-labs": `
### Lab 1 — Fetch and validate an Agent Card (beginner, ~1h)
Write a small script that fetches a sample Agent Card (use a static JSON file to simulate a remote agent), validates its required fields using the validator from Coding Questions, and prints a human-readable summary of its skills and authentication requirements. Skills: Agent Card structure, basic validation discipline.

### Lab 2 — Build a minimal A2A server and client pair (intermediate, ~3h)
Implement a toy FastAPI A2A server exposing one skill (e.g. "echo" or "summarize-text") with the full submitted → working → completed lifecycle, and a client that discovers it via its Agent Card and submits a task. Add a second skill that deliberately requires an input-required round trip (e.g. "ask a clarifying question if the input is ambiguous"). Skills: the full protocol mechanics, both sides.

### Lab 3 — Streaming updates and a hung-agent timeout (advanced, ~3h)
Extend Lab 2's server to support tasks/sendSubscribe with Server-Sent Events, and deliberately build one endpoint that never completes (to simulate a hung remote agent). On the client side, implement a timeout and a graceful fallback. Deliverable: a short report on what happened without the timeout versus with it. Skills: streaming, resilience engineering.

### Lab 4 — Multi-agent orchestrator with circuit breakers and full observability (production, ~4h)
Build an orchestrator that delegates to three fake specialist agents (one reliable, one occasionally slow, one occasionally failing), using the bounded-concurrency delegator with per-agent circuit breakers from Coding Questions, instrumented with the Prometheus metrics from Monitoring, and containerized with a production-shaped Dockerfile. Load test it and confirm the circuit breaker actually protects the orchestrator from the failing agent. Skills: the entire production section, end to end, applied to a genuinely multi-agent system.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate this skill to employers:

1. **A2A-based multi-agent trip planner** — an orchestrating agent that delegates to independently-built specialist agents (flight search, hotel search, itinerary summarization), each exposing its own Agent Card and Task lifecycle, with full input-required human-in-the-loop support for ambiguous requests. Demonstrates: the complete protocol mechanics, human-in-the-loop design, and multi-agent orchestration.

2. **Cross-framework agent interoperability demo** — build two agents on two different frameworks (e.g. one on LangGraph, one hand-rolled) that communicate purely over A2A with no shared code beyond the protocol client/server, to concretely demonstrate (and be able to explain in an interview) the cross-vendor interoperability value proposition. Demonstrates: genuine understanding of what A2A buys you that a shared-framework internal API wouldn't.

3. **Resilient agent gateway** — a gateway service that every internal agent routes through to reach external A2A-speaking agents, implementing Agent Card caching, per-remote-agent circuit breakers, full task-lifecycle logging with correlation ids, remote-content validation against prompt injection, and a dashboard of per-agent health. Demonstrates: production resilience engineering and security-conscious design, directly relevant to real-world multi-agent deployments.

Each project: full type hints, a pytest suite covering the task lifecycle (including input-required and timeout paths), CI, and a README with an architecture diagram explaining the MCP/A2A boundary explicitly — the engineering discipline and the clarity of that boundary explanation are what distinguish a toy demo from a portfolio piece here.
`,

  "case-studies": `
### Google's original A2A announcement and its founding partner group
Google announced A2A in April 2025 with a large founding partner group (reported at over 50 companies), explicitly positioning it as the agent-to-agent complement to the already-established Model Context Protocol. Lesson: a protocol's chance of genuine cross-vendor adoption is heavily influenced by how it launches — a broad multi-company founding coalition, rather than a single-vendor spec published unilaterally, is a deliberate strategy to avoid the "why would I adopt your proprietary standard" adoption barrier.

### The move to the Linux Foundation
Shortly after its announcement, A2A moved from Google-led stewardship to the Linux Foundation. Lesson: this mirrors a well-worn pattern in infrastructure standards (Kubernetes moving to the CNCF is the most-cited precedent) — vendor-neutral governance is often necessary, not just nice-to-have, for a true interoperability standard to be trusted by competitors of the originating company.

### MCP and A2A as a deliberately complementary pair, not a rivalry
Rather than one project trying to expand its scope to cover both tool-access and agent-to-agent communication, the ecosystem settled (at least as of my knowledge cutoff) on two separate, narrowly-scoped standards used together. Lesson: narrow, composable protocols with a clean boundary (MCP: agent-to-tool; A2A: agent-to-agent) tend to be easier for a fragmented, multi-vendor ecosystem to adopt jointly than one large protocol attempting to do everything.

I don't have verified, specific, attributable production case studies (named companies with measured outcomes) for A2A beyond the launch and governance facts above, since the protocol is young — I'd rather flag that gap honestly than invent a case study, and would recommend checking the official A2A project's current case-study or partner-showcase pages for up-to-date, real examples.
`,

  comparisons: `
| Dimension | A2A | MCP | A plain custom REST API | gRPC between internal services |
|---|---|---|---|---|
| What it connects | Agent to agent | Agent to tools/data | Whatever you design it for | Service to service |
| Discovery mechanism | Agent Card (standardized) | Server capability listing (standardized) | None standard — read the docs | Typically a shared .proto file, not runtime-discoverable |
| Designed for long-running/async work | Yes — explicit Task lifecycle, input-required state | Partially — tool calls are typically short-lived | Not by default — you'd build this yourself | Possible via streaming RPCs, but not agent-semantics-aware |
| Cross-vendor interoperability | Core design goal | Core design goal (for tools) | None — bespoke per integration | Requires shared schema/tooling across teams |
| Wire format | JSON-RPC 2.0 + SSE | JSON-RPC 2.0 (typically) | Whatever you choose | Protobuf over HTTP/2 |
| Best at | Delegating work to an independent, autonomous agent | Giving an agent access to a tool, file, database, or API | A quick internal integration where standardization doesn't matter yet | High-throughput, low-latency internal microservice calls |

**How seniors choose**: use A2A specifically when you need to talk to an agent you don't fully control — a different team, a different company, or simply a different framework — and the interaction genuinely involves delegating an autonomous task rather than calling a fixed function. Use MCP for any agent's own tool/data access, always. Use a plain internal API or gRPC when everything is internal, tightly coupled, and standardization for external interoperability isn't a design goal. Most real systems end up using MCP internally within every agent and A2A at the boundaries between agents — not one protocol chosen instead of the other.
`,

  "related-technologies": `
- **Model Context Protocol (MCP)** — the direct sibling standard; connects an agent to its own tools and data, while A2A connects agents to each other. Read this first if you haven't.
- **LangGraph / CrewAI / AutoGen / Semantic Kernel** — agent frameworks that increasingly ship A2A client/server support, letting you build the "specialist agent" side of an A2A exchange without hand-rolling the protocol.
- **Structured Outputs** — the discipline of getting reliably parseable, schema-conformant data out of an LLM; directly relevant to the "data" parts an A2A task exchanges, and to validating a remote agent's returned content before acting on it.
- **OpenAI Responses API / OpenAI Realtime API** — sibling protocol/API standards in the same "AI Protocols & Standards" category; the Responses API standardizes a single vendor's stateful tool-and-agent API surface, while A2A standardizes cross-vendor agent-to-agent communication — worth contrasting to see the difference between a vendor API and an open interoperability protocol.
- **AI Red Teaming** and **Prompt Injection Defense** — the adversarial-testing disciplines directly relevant to the trust boundaries A2A introduces (malicious Agent Cards, injected content in remote agent responses).
- **Multi-Agent Systems** (orchestration patterns generally) — A2A is the wire protocol; multi-agent orchestration design (who delegates what, in what order, with what fallback) is the layer above it that A2A doesn't prescribe.
- **Secrets Management** — the credential-handling discipline underlying A2A's Bearer/OAuth2 authentication in production.

On this platform, a natural path: **Model Context Protocol** → this page → **Multi-Agent Systems** for orchestration design, then **AI Red Teaming** and **Prompt Injection Defense** to harden a multi-agent system built on both protocols.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025, with less certainty about developments closer to today's date — this is a genuinely young, fast-evolving standard, and I'd recommend checking the official A2A project site and its Linux Foundation home directly before treating any specific detail below as current.

- **April 2025**: Google announces A2A publicly, with a founding partner group reported at over 50 companies, positioning it explicitly as complementary to MCP.
- **2025**: A2A is contributed to the Linux Foundation for open governance — I don't have full confidence in the exact current governance structure, technical steering committee composition, or spec versioning scheme as of today, and would verify directly against the project's official documentation.
- **2025**: SDKs and reference implementations appear across multiple languages, and agent framework vendors begin adding A2A support alongside existing MCP support — the specific current list of officially supported languages and frameworks is exactly the kind of detail that moves quickly and is worth checking fresh rather than trusting a static summary.
- **Ongoing**: as with any young open standard, expect the task lifecycle, authentication options, and streaming/push-notification semantics to continue being refined based on real-world implementation feedback — check the spec's changelog or version history directly for what's actually shipped versus proposed.

I do not have confident, verified knowledge of the very latest spec revisions, adoption metrics, or governance changes as of today's date (2026-07-27) — treat this section as directional and verify anything load-bearing to a real architectural decision against current, primary sources.
`,

  "future-roadmap": `
Where this space appears to be heading, and what's worth investing career time in:

1. **Deeper framework-native integration.** Expect A2A client/server support to become a default, near-invisible feature of major agent frameworks (much as HTTP client support is a given in any web framework today) rather than something most teams implement from the protocol spec directly — the differentiating skill shifts toward orchestration design and security hardening, not protocol plumbing.
2. **Maturing security and trust tooling.** As A2A-based multi-agent systems move from demos to production, expect more standardized tooling around Agent Card provenance/verification, remote-content validation, and delegation-chain auditing — this page's Security section is a bet on where that tooling need is heading, worth understanding deeply regardless of which specific tools emerge.
3. **Convergence with agent marketplaces and discovery registries.** As more organizations expose A2A-speaking agents, expect registries or directories of Agent Cards (a "search engine for agents") to emerge as a natural next layer on top of the base discovery mechanism, similar to how API marketplaces evolved on top of plain REST APIs.
4. **Growing overlap with evals and observability practices for multi-agent systems.** As delegation chains get longer and more consequential, expect the evals and monitoring discipline for a single agent (see **AI Evals**) to extend explicitly to multi-hop, cross-organization delegation chains, since a wrong or harmful outcome can now originate at any hop.
5. **Continued co-evolution with MCP.** Because the two protocols are explicitly complementary, expect their ecosystems, tooling, and even combined reference architectures to keep developing in lockstep rather than diverging — learning one well is genuinely incomplete without understanding where the other one's responsibility begins.

For your career: the durable, tool-agnostic skills here are the MCP/A2A boundary itself, resilience patterns around any remote-agent dependency (timeouts, circuit breakers, graceful degradation), and adversarial thinking about what a "cooperating" remote agent can smuggle across a trust boundary — those transfer regardless of which specific SDK or framework wins the tooling race.
`,

  "cheat-sheet": `
~~~python
# --- The core idea ---
# MCP: agent -> tools/data (see the Model Context Protocol skill)
# A2A: agent -> ANOTHER agent -- discovery, delegation, task lifecycle, streaming

# --- Discovery: the Agent Card ---
# GET /.well-known/agent.json
{
  "name": "...", "url": "...", "version": "1.0.0",
  "capabilities": {"streaming": True, "pushNotifications": False},
  "skills": [{"id": "search-flights", "name": "Search Flights"}],
  "authentication": {"schemes": ["Bearer"]},
}

# --- Task lifecycle (the state machine) ---
# submitted -> working -> input-required -> working -> completed
#                                          -> failed
#                                          -> canceled

# --- Minimal task submission (JSON-RPC 2.0 over HTTPS) ---
POST /a2a
{
  "jsonrpc": "2.0", "id": 1, "method": "tasks/send",
  "params": {
    "id": "task-123",
    "message": {"role": "user", "parts": [{"type": "text", "text": "..."}]},
  },
}

# --- Message parts (mix freely) ---
{"type": "text", "text": "..."}
{"type": "data", "data": {"key": "value"}}      # structured, machine-actionable
{"type": "file", "file": {"uri": "..."}}         # binary/document content

# --- Streaming updates ---
# method: tasks/sendSubscribe -> Server-Sent Events stream of status updates
# terminal state (completed/failed/canceled) -> close the stream

# --- Client-side discipline ---
# 1. cache the Agent Card (TTL), don't refetch every task
# 2. check advertised capabilities before assuming streaming/push support
# 3. ALWAYS set a timeout on outbound calls
# 4. handle input-required explicitly, not just completed/failed
# 5. validate/sanitize remote content before it hits a downstream LLM prompt

# --- Resilience pattern: per-agent circuit breaker ---
if breaker.allow_call():
    try:
        result = client.send_task(agent, task, timeout=10)
        breaker.record_success()
    except (TimeoutError, ConnectionError):
        breaker.record_failure()

# --- Security musts ---
# - verify Agent Card provenance, don't trust an arbitrary fetched URL blindly
# - treat every remote agent's output as UNTRUSTED input (prompt-injection risk)
# - human approval gate on high-consequence actions from a delegation chain
# - log full task history + correlation id across multi-hop chains

# --- Where it lives ---
# orchestrator (front agent) --A2A--> specialist agents
# each agent, internally, may use MCP for its OWN tool access
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What does A2A stand for and connect? | Agent2Agent — connects one independent AI agent to another, across frameworks/vendors/organizations |
| How does A2A differ from MCP? | MCP: agent to tools/data. A2A: agent to agent. They're complementary, not competing |
| What is an Agent Card? | A JSON document describing an agent's identity, skills, endpoint, and authentication, fetched to discover capabilities before sending real tasks |
| Name the Task lifecycle states | submitted, working, input-required, completed, failed, canceled |
| What does input-required enable? | A mid-task clarifying round trip — human-in-the-loop or multi-turn agent collaboration, instead of pure fire-and-forget requests |
| What wire format does A2A use? | JSON-RPC 2.0 over HTTP(S), with Server-Sent Events for streaming |
| What are Parts? | Typed pieces of a message — text, data (structured JSON), or file — that can be mixed in one exchange |
| Who originated A2A, and who governs it now? | Originated by Google (announced April 2025 with a large partner group), later contributed to the Linux Foundation |
| What is the "opaque box, transparent contract" property? | The calling agent never sees the remote agent's internal reasoning/tools — only the messages and status that cross the protocol boundary |
| Name one A2A-specific security risk | Prompt injection carried in a remote agent's response content, flowing into the calling agent's downstream LLM prompts |
| Why must a production A2A server persist task state externally? | So tasks/get and SSE reconnection work correctly behind a load balancer with multiple server replicas |
| What's the resilience pattern for a flaky remote agent? | A per-remote-agent circuit breaker plus an explicit timeout, so one failing specialist doesn't cascade into failing the whole orchestration |
| When should you NOT reach for A2A? | When all agents are internal, built on one shared framework, and fully within your control — a simpler internal API may suffice |
`,

  mcqs: `
**1. What is the primary distinction between MCP and A2A?**

A) MCP is for streaming, A2A is not  B) MCP connects an agent to tools/data; A2A connects an agent to another agent  C) They are the same protocol under different names  D) A2A replaced MCP entirely in 2025

**Answer: B** — the two protocols are explicitly designed as complements at different layers, not alternatives.

**2. What does the Agent Card primarily provide?**

A) The remote agent's internal reasoning trace  B) A machine-readable description of the agent's skills, endpoint, and auth requirements  C) The remote agent's source code  D) A billing invoice for API usage

**Answer: B** — it's a discovery document, not a window into the agent's internals.

**3. Which Task state allows a mid-task clarifying question from the remote agent?**

A) submitted  B) completed  C) input-required  D) canceled

**Answer: C** — input-required is specifically designed for this human-in-the-loop or multi-turn interaction.

**4. Why must a production A2A server persist task state in a shared store rather than in-process memory?**

A) JSON-RPC requires a database  B) Behind a load balancer, a later request for the same task can hit a different replica than the one that created it  C) It's required by the authentication scheme  D) SSE cannot work without a database

**Answer: B** — this is the standard "stateless compute, shared state" requirement for any horizontally scaled stateful service.

**5. What is the single biggest security risk of blindly trusting a remote agent's returned content?**

A) It might use too many tokens  B) It could carry a prompt-injection payload that manipulates the calling agent's downstream LLM behavior  C) It might be formatted as XML instead of JSON  D) It could return an Agent Card instead of a Task result

**Answer: B** — remote agent output should be treated as untrusted input, exactly like any other external data crossing a trust boundary.

**6. When is A2A the wrong tool to reach for?**

A) When delegating to a partner company's agent  B) When every agent is internal, built on one shared framework, and fully within your control  C) When you need capability discovery  D) When a task may run for several minutes

**Answer: B** — A2A's value is specifically cross-vendor/cross-organization interoperability; a simpler internal mechanism may be all you need otherwise.
`,

  "revision-notes": `
**The core idea in 3 lines:** A2A is an open protocol letting independent AI agents — built on different frameworks, by different organizations — discover each other via a published Agent Card and exchange delegated work through a shared Task lifecycle over JSON-RPC 2.0. It is explicitly the complement to the Model Context Protocol: MCP connects an agent to tools and data; A2A connects an agent to another agent.

**The mechanism in 5 lines:** A calling agent fetches a remote agent's Agent Card to learn its skills, endpoint, and authentication scheme. It submits a Task carrying a message (composed of text/data/file Parts) via tasks/send or tasks/sendSubscribe. The task moves through submitted → working → optionally input-required (a mid-task clarification round trip) → a terminal state (completed/failed/canceled). Updates arrive via polling, a subscribed SSE stream, or a push-notification webhook. The remote agent's internal reasoning, framework, and tool use remain entirely opaque — only the task's messages and status cross the boundary.

**Where it fits and where it doesn't, in 4 lines:** Reach for A2A when delegating to an agent you don't fully control — a different team, company, or framework — and the interaction is genuine autonomous delegation, not a fixed function call (that belongs behind MCP or a plain API). Skip it when every agent is internal, shares one framework, and is fully within your control; a simpler internal mechanism is likely sufficient there.

**Risk and resilience in 4 lines:** Treat every remote agent as untrusted: verify Agent Card provenance, validate/sanitize returned content before it reaches a downstream LLM prompt (prompt-injection risk), and require human approval for high-consequence actions triggered by a delegation chain. Operationally, always set timeouts, use per-remote-agent circuit breakers, and persist task state in a shared store so a production server behaves correctly behind a load balancer.

**Measurement and judgment in 3 lines:** Instrument task completion rate, terminal-state breakdown, and duration per remote agent — not just in aggregate — so one degrading specialist doesn't hide in an overall-healthy dashboard. Log the full task lifecycle with a correlation id across multi-hop delegation chains, since accountability for a bad outcome is otherwise nearly impossible to trace. Treat this whole area as young and fast-moving — verify specific spec, SDK, and governance details against current primary sources before making a firm architectural bet.
`,

  "learning-roadmap": `
A realistic path to production competency with A2A (adjust pace to your background):

**Week 1 — Foundations.** Make sure **Model Context Protocol** is solid first — this page assumes it as the mental-model anchor. Read Beginner and Intermediate Concepts here; fetch and validate a sample Agent Card, and trace the Task lifecycle diagram until you can redraw it from memory.

**Week 2 — Build both sides.** Implement Lab 2: a minimal A2A server exposing one skill and a client that discovers and calls it, including one skill that deliberately triggers input-required. Milestone: you can explain the full round trip, including the clarification detour, without notes.

**Week 3 — Streaming and resilience.** Add SSE streaming (Lab 3) and deliberately build a hung fake agent to test your client's timeout behavior. Implement the circuit-breaker pattern from Coding Questions against a mix of reliable and flaky fake agents. Milestone: your orchestrator survives a failing dependency without cascading.

**Week 4 — Security hardening.** Work through the Security section deliberately: build an adversarial test that injects a prompt-injection payload into a fake remote agent's response and confirm your validation layer catches it before it reaches a downstream LLM call. Milestone: a written note on every trust boundary in your toy system and how each is defended.

**Week 5 — Production shape.** Build Lab 4's full multi-agent orchestrator with observability, containerize it, and load test it. Milestone: a dashboard per remote agent showing completion rate, duration, and failure breakdown you'd trust for an on-call rotation.

**Week 6 — Portfolio project.** Build one of the Real Projects end to end, with a README that clearly explains the MCP/A2A boundary and includes your architecture diagram.

Then continue to **Multi-Agent Systems** on this platform to formalize orchestration-strategy design on top of the protocol layer this page covers, or to **AI Red Teaming** to harden a multi-agent system against the adversarial risks introduced here.
`,

  "official-docs": `
- [A2A Protocol official site](https://a2a-protocol.org/) or the project's current Linux Foundation home — check for the authoritative, current specification rather than any secondary summary, since this is a young and actively evolving standard.
- [A2A GitHub organization](https://github.com/a2aproject) — the reference specification, sample implementations, and SDKs; verify current language coverage and maintenance status directly here.
- [Model Context Protocol documentation](https://modelcontextprotocol.io/) — essential complementary reading; understanding MCP's scope is necessary to understand exactly where A2A's responsibility begins.
- Individual agent framework documentation (**LangGraph**, CrewAI, and others) for their specific current A2A client/server integration guides, since these are being actively added and change frequently.

I'm not fully confident every one of these URLs reflects the current, canonical location given how quickly a young open-governance project's web presence can reorganize — verify each link resolves and search for "A2A protocol specification" from a reputable source if it has moved.
`,

  books: `
- I'm not aware of a mature, widely-recognized book dedicated specifically to A2A as of my knowledge cutoff — it's simply too young a standard (announced 2025) for the book publishing cycle to have caught up, and I'd rather say so than invent a title.
- **Building LLM-powered agent systems** general-category books (verify current, well-reviewed titles at time of reading) increasingly include chapters on multi-agent orchestration and interoperability protocols including A2A and MCP — check recent editions/publication dates specifically, since this is exactly the kind of content that goes stale fastest.
- **Designing Data-Intensive Applications** — Martin Kleppmann. Not A2A-specific, but the distributed-systems foundations (state persistence across replicas, message delivery semantics, failure handling) that this page's Scalability and Deployment sections draw on directly.
- **Building Microservices** — Sam Newman. The service-boundary, contract, and resilience-pattern thinking (circuit breakers, timeouts, graceful degradation) transfers directly to reasoning about A2A as a service boundary between autonomous agents.

The strongest current material for A2A specifically lives in the official specification, reference implementations, and recent conference talks/blog posts rather than in books — treat this section as pointing you to durable adjacent foundations rather than A2A-specific texts that don't yet exist in mature form.
`,

  blogs: `
- **The official A2A project blog/announcement posts** (via the project's GitHub or its Linux Foundation home) — the primary source for protocol changes, and the place to verify anything version-specific in this page.
- **Google's developer blog** — the original April 2025 announcement and any follow-up posts from the protocol's originating team.
- **Agent framework vendor blogs** (LangChain/LangGraph blog, CrewAI blog, and others) — practical integration guides and real-world patterns as these vendors add A2A support to their frameworks.
- **Model Context Protocol's own blog/documentation updates** — useful to read alongside A2A content specifically because so much writing in this space discusses the two protocols together.

High-signal filter: prefer posts dated recently and citing the official specification directly over older secondary summaries, given how quickly this specific space has been moving.
`,

  "research-papers": `
A2A is an industry-originated engineering standard, not primarily an academic research topic, so there isn't a deep peer-reviewed literature specifically about it — I don't want to invent paper titles that don't exist. The genuinely relevant foundational reading is one layer down, in the systems and multi-agent concepts A2A operationalizes:

- **"Communicative Agents for Software Development"** and similar multi-agent-collaboration papers (e.g. work on LLM-based multi-agent frameworks like CAMEL, AutoGen's own technical reports) — foundational thinking on how autonomous LLM agents coordinate, which A2A gives a standardized wire protocol to.
- **Classical distributed-systems literature on RPC and service contracts** (e.g. foundational work on RPC semantics, and more recent writing on microservice contract design) — directly relevant to reasoning rigorously about A2A as a network protocol with failure modes, not just an API convenience.
- **The Model Context Protocol's own specification and any accompanying technical writeups** — read alongside A2A's specification, since the two are frequently discussed as a pair in both official and community writing.

If a more specific, peer-reviewed "A2A protocol" paper exists that I'm not aware of, treat that as a gap in my knowledge rather than evidence one doesn't exist — search current academic databases (arXiv) for the latest work, since agent-interoperability research is an active and growing area even if A2A itself originated as an industry spec rather than a paper.
`,

  videos: `
- **Google's original A2A announcement talk/keynote segment** (April 2025) — search Google's developer channels for the initial protocol introduction, which typically includes the clearest "why this exists, how it relates to MCP" framing directly from its designers.
- **Conference talks on multi-agent interoperability** from major AI/cloud conferences (Google Cloud Next, and general LLMOps/AI-engineering conferences) — search for sessions specifically covering A2A and MCP together, since that pairing is how the topic is most commonly presented.
- **Agent framework vendor demo videos** (LangChain/LangGraph, CrewAI) showing their A2A integration in practice — often the most concrete, code-level walkthroughs available.

I don't have high confidence in specific talk titles, speaker names, or exact publication dates for this narrow and recent a topic, and would rather point you to the right channels/conferences to search currently than invent a specific citation.
`,

  "github-repos": `
- [a2aproject organization on GitHub](https://github.com/a2aproject) — the reference specification and official sample implementations; the primary source to verify current spec details and SDK language coverage.
- [modelcontextprotocol organization on GitHub](https://github.com/modelcontextprotocol) — the sibling protocol's reference implementation, valuable to study alongside A2A's for understanding the two-layer agent-to-tool / agent-to-agent architecture in code.
- Agent framework repositories with A2A support (search **LangGraph**'s and CrewAI's repositories for their current A2A integration modules) — concrete, evolving code showing how a mainstream framework implements both sides of the protocol.
- General multi-agent orchestration reference repositories (AutoGen, CAMEL) — useful for understanding the orchestration-strategy layer that sits above whatever wire protocol (A2A or otherwise) is used underneath.

Verify current star counts, maintenance activity, and release cadence directly on GitHub before depending on any of these in production — this ecosystem is moving quickly enough that a repository's status can shift meaningfully within months.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Agent Card literacy*: given five sample Agent Cards (some valid, some deliberately malformed), write a validator that correctly accepts the valid ones and gives a specific error message for each malformed one.
2. *Task lifecycle*: implement the full state machine (from Coding Questions) and write tests confirming every illegal transition is rejected, not just the happy path.
3. *Discovery and caching*: build a client that caches fetched Agent Cards with a TTL, and correctly re-fetches and detects a changed capability set (e.g. streaming support toggled off) after the TTL expires.
4. *Streaming*: implement an SSE client that correctly handles a dropped connection mid-stream with a reconnect-with-backoff strategy, verified against a fake server that deliberately drops the connection partway through a task.
5. *Resilience*: implement the circuit-breaker delegator from Coding Questions and write a test harness with three fake agents (reliable, flaky, and permanently down) confirming the orchestrator's overall latency and success rate degrade gracefully rather than catastrophically.
6. *Security*: build a fake remote agent that returns a response containing an embedded prompt-injection attempt, and write a validation layer that detects and neutralizes it before the content would reach a downstream LLM prompt.
7. *Multi-hop tracing*: build a three-agent delegation chain (A → B → C) with a shared correlation id logged at every hop, deliberately inject a failure at hop C, and confirm you can reconstruct the full failure path from logs alone.

External sets: no dedicated public "A2A protocol" problem sets exist yet that I'm confident recommending by name, given how young the standard is — the most useful current practice is working directly from the official specification's examples and building toward the labs and coding questions on this page.
`,

  "architecture-diagram": `
The reference production architecture for a multi-agent system built on A2A (with MCP handling each agent's own tool access) — the shape this page has built toward throughout:

~~~mermaid
flowchart TB
    User["End user"] --> Orchestrator["Orchestrating Agent\n(front door, decomposes requests)"]
    subgraph A2ALayer["A2A: agent-to-agent boundary"]
        Orchestrator -->|discover| CardA["Agent Card: Research Agent"]
        Orchestrator -->|discover| CardB["Agent Card: Booking Agent"]
        Orchestrator -->|tasks/send, SSE| ResearchAgent["Research Agent\n(A2A server)"]
        Orchestrator -->|tasks/send, SSE| BookingAgent["Booking Agent\n(A2A server)"]
    end
    subgraph ResearchInternals["Research Agent internals"]
        ResearchAgent --> RMCP["MCP client"]
        RMCP --> RTool1["Search tool"]
        RMCP --> RTool2["Document store"]
    end
    subgraph BookingInternals["Booking Agent internals"]
        BookingAgent --> BMCP["MCP client"]
        BMCP --> BTool1["Flight inventory API"]
        BMCP --> BTool2["Payment processor"]
    end
    subgraph Resilience["Orchestrator resilience layer"]
        CB["Per-agent circuit breakers"]
        Timeout["Per-agent timeouts"]
        Validate["Remote content validation\n(prompt-injection defense)"]
    end
    Orchestrator -.uses.-> Resilience
    subgraph Obs["Observability"]
        Metrics["Task completion rate, duration,\nfailure breakdown per agent"]
        Logs["Full task lifecycle + correlation id\nacross delegation hops"]
    end
    A2ALayer -.emits.-> Obs
~~~

Every box here maps to a skill on this platform: **Model Context Protocol** powers the internals of each specialist agent; **Multi-Agent Systems** design principles shape the Orchestrator's decomposition logic; **AI Red Teaming** and **Prompt Injection Defense** harden the Resilience layer; **AI Evals** and general observability practice drive the Observability layer.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((A2A Protocol))
    The Problem
      No standard agent-to-agent interop
      Bespoke integration per pair
      No shared task/lifecycle vocabulary
    Core Concepts
      Agent Card
      Task
      Message and Parts
      JSON-RPC 2.0 over HTTPS
    Task Lifecycle
      submitted
      working
      input-required
      completed failed canceled
    Communication Patterns
      Request response tasks/send
      Streaming SSE tasks/sendSubscribe
      Push notifications webhook
    Architecture
      Orchestrator as A2A client
      Specialist agent as A2A server
      Opaque box transparent contract
    Risks
      Malicious Agent Cards
      Prompt injection via remote content
      Delegation chain accountability gaps
      Stale cached capabilities
    Production Practice
      Timeouts per remote agent
      Circuit breakers
      Shared task state store
      Correlation ids across hops
      Human approval on high-stakes actions
    Relationship to MCP
      MCP: agent to tools and data
      A2A: agent to agent
      Used together, not instead of each other
    Tooling
      Official A2A SDKs
      LangGraph and CrewAI integrations
      Linux Foundation governance
    Connections
      Model Context Protocol
      Multi-Agent Systems
      Structured Outputs
      AI Red Teaming
      Prompt Injection Defense
~~~
`,
};

export default a2aProtocol;
