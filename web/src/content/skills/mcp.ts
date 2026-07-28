import type { SkillContent } from "../types";

/**
 * MCP (Model Context Protocol) -- full 50-section knowledge page.
 * This skill covers Anthropic's open protocol for connecting LLM
 * applications to external tools, data sources, and prompts in a
 * standardized, vendor-neutral way. It builds directly on the concepts
 * introduced in Agent Fundamentals and Tool Calling, and is a sibling to
 * Claude Code, OpenAI Agents SDK, and Guardrails.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no dollar-brace interpolation sequences appear anywhere in this file.
 */
const mcp: SkillContent = {
  overview: `
The Model Context Protocol (MCP) is an open protocol, originally released by Anthropic, that standardizes how LLM applications connect to external tools, data sources, and predefined prompts. Stripped to its mechanical core, MCP defines a common, JSON-RPC-based message format and a small set of primitives (tools, resources, and prompts) so that an "MCP server" built once -- to expose, say, a company's ticketing system or a local filesystem -- can be plugged into any "MCP client" (a host application such as an IDE, a chat interface, or a custom agent runtime) that speaks the same protocol, without either side needing to know anything bespoke about the other's internals.

For an AI engineer, MCP sits directly downstream of the concepts covered in **Agent Fundamentals** and **Tool Calling**. Those skills establish that an agent's real capability comes from the tools it can call, and that designing, describing, and safely exposing those tools is itself a serious engineering discipline. MCP does not replace that discipline -- it standardizes two narrower things around it: how a tool (or a resource, or a prompt template) is *discovered* by a client, and how the request/response messages that invoke it are *transported* and *shaped* on the wire. Put differently: MCP is a protocol for plumbing and discovery, not a new theory of what a tool is or how an LLM should decide to call one. If you already understand function/tool calling from the **Tool Calling** skill, MCP's core value proposition is: instead of writing custom integration code for every pairing of (agent framework) times (external system), you write one MCP server per external system and one MCP client per agent framework, and the protocol lets any client talk to any server.

Key characteristics of MCP as it exists today: it is a client-server architecture, with a host application (a chat client, an IDE such as **Claude Code**, or a custom agent) embedding one or more MCP clients, each of which maintains a connection to one MCP server; communication uses JSON-RPC 2.0 messages over a small number of supported transports (initially local process stdio, and separately HTTP-based transports for remote servers); servers expose capabilities in three primitive categories -- tools (model-invokable functions with side effects or computations), resources (readable, addressable data the client can fetch and feed into context, analogous to files or query results), and prompts (reusable, parameterized prompt templates a host can surface to a user or inject into a conversation); and the protocol is explicitly versioned and still evolving, with Anthropic and a growing set of community and vendor contributors iterating on it in the open. This page treats MCP honestly as a young, fast-moving specification: the shape of the primitives described here is accurate as of my knowledge cutoff, but exact message fields, SDK method names, and transport details are exactly the kind of thing that changes between point releases, so treat the official specification (see Official Documentation) as the ground truth over this page whenever the two seem to disagree.
`,

  history: `
Before MCP, an AI application that wanted to call an external tool or read from an external data source had exactly one option: write custom integration code specific to that application's tool-calling mechanism and that particular external system's API. Every new pairing -- a given chat client wanting to read from a given company's internal wiki, a given IDE wanting to run a given database query tool -- required its own bespoke glue code. This is the same "M times N integration problem" that has recurred throughout software history (it is, structurally, the same problem that motivated standard protocols like HTTP, SQL's common query interface, or USB for physical peripherals): as the number of AI applications (M) and the number of tools/data sources (N) both grow, the amount of bespoke integration work grows roughly as their product, not their sum.

| Year | Milestone |
|------|-----------|
| Pre-2024 | AI applications integrate with tools and data sources through fully bespoke, per-application, per-tool code; provider-native function/tool calling (see **Tool Calling**) standardizes the shape of a single tool-call request/response, but says nothing about how a tool is discovered, packaged, or shared across different host applications |
| Late 2024 | Anthropic publishes the Model Context Protocol as an open specification, along with reference SDKs and a set of reference server implementations (filesystem access, git, and other common integrations), positioning it explicitly as an open, vendor-neutral standard rather than a Claude-only feature |
| 2024-2025 | An early ecosystem of community and vendor-built MCP servers emerges, covering common developer tools, SaaS products, and internal-system connectors; **Claude Code** and other host applications ship native MCP client support, letting users attach MCP servers as a first-class extension mechanism |
| 2025 | Multiple AI vendors and platforms beyond Anthropic add MCP client support, and community tooling (registries, testing harnesses, security scanners for MCP servers) begins to mature around the protocol; transport options broaden beyond the original local stdio-based approach to include remote, HTTP-based servers |

This page describes MCP's concepts and mechanics as they exist at the time of writing, not a permanent, final specification. MCP is explicitly versioned and under active revision; adoption breadth, exact transport support, and SDK ergonomics are all things you should re-verify against the official specification and current SDK documentation (see Latest Updates and Official Documentation below) rather than assume are fixed.
`,

  "why-it-exists": `
Before MCP, giving an agent a new capability meant writing code that was tightly coupled to both the specific agent framework or host application in use, and the specific external system being integrated. A tool built for one chat client's plugin system typically could not be reused, without rewriting, in a different agent framework, even though the underlying capability (say, "search this company's internal documents") was identical. This is not a hypothetical inefficiency -- it is the direct, structural consequence of every AI application inventing its own tool-definition format, its own discovery mechanism, and its own transport, with no shared standard underneath any of it.

The gap MCP filled: **a common protocol for how a host application discovers what an external system can offer (its tools, its readable resources, its reusable prompts) and how it invokes those capabilities**, independent of which specific agent framework or model provider the host happens to be built on. The insight, similar to the one behind earlier standardization efforts in computing, is that most of the actual value of an integration is in the external system's capability itself (the database query logic, the API call, the file read) -- not in the specific wire format used to invoke it. Once that wire format and discovery mechanism are standardized, the capability itself becomes portable: an MCP server exposing "search our internal ticketing system" can be attached to any MCP-compatible host, whether that host is **Claude Code**, a custom agent built with the **OpenAI Agents SDK**, or some other application entirely, without the ticketing-system integration being rewritten for each one.

The technical condition that made this practical, much as reliable structured function calling was the condition that made the **Agent Fundamentals** loop practical, is the earlier maturation of provider-native tool/function calling covered in **Tool Calling**: once models could reliably request "call this named function with these arguments" as a structured object, it became possible to build a protocol layer *around* that mechanism -- standardizing discovery and transport -- without needing to solve the harder, model-specific problem of getting an LLM to reliably request tool calls in the first place. MCP is built on top of that prior achievement, not a replacement for it.
`,

  "problem-it-solves": `
MCP solves the problem of needing bespoke integration code for every pairing of AI application and external tool or data source. Concrete pains removed:

- **Rebuilding the same integration for every host application.** Without MCP, an integration with, say, an internal knowledge base has to be reimplemented for every chat client, IDE, or agent framework that wants to use it. With a single MCP server exposing that knowledge base, any MCP-compatible client can attach to it unchanged.
- **No standard way to discover what an external system offers.** Before MCP, a host application had no uniform way to ask "what tools, data, or prompt templates does this integration expose, and what do their inputs look like" -- each integration invented its own answer. MCP's initialization and listing calls (see Internal Working) give a uniform discovery mechanism.
- **Conflating "read-only context" with "callable actions."** Ad hoc integrations often blur together fetching data for context and invoking an action with side effects, both handled the same way. MCP's explicit separation of resources (readable data) from tools (invokable, potentially side-effecting operations) forces this distinction to be made deliberately, which has real security and design implications (see Security and Comparisons).
- **No standard way to package and share reusable prompt templates.** Prompts as a first-class MCP primitive let a server expose not just data and actions but curated, parameterized prompt templates a host can surface to users, again portable across any compatible client.

What MCP deliberately does **not** solve, and should not be expected to:

- **The underlying tool-calling mechanism itself.** MCP assumes the host application already has some way for its LLM to decide to invoke a tool (structured function calling, as covered in **Tool Calling**); MCP standardizes how that tool is described and invoked at the transport/discovery layer, not how the model decides to call it or how the host executes the request internally.
- **Model reasoning quality, tool-selection accuracy, or agent reliability.** All of the failure modes covered in **Agent Fundamentals** -- tool misuse, compounding errors, runaway loops -- are entirely orthogonal to whether the tool happens to be exposed via MCP or via a bespoke integration; MCP changes how a tool is plumbed in, not whether the model uses it well.
- **Security by default.** MCP standardizes the format of a request to run a tool; it does not, by itself, validate that request's arguments, sandbox the tool's execution, or scope its permissions -- an MCP server is a new attack surface that requires exactly the same security engineering discipline as any other tool-exposing system (see Security below), arguably more, because MCP servers are explicitly designed to be attached by third-party host applications the server author does not control.
- **Universal adoption or permanence of any specific syntax.** MCP is a genuinely new, fast-evolving protocol; this page hedges deliberately rather than asserting that any particular SDK method signature, transport, or adoption figure will remain accurate -- verify against current documentation.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Define MCP precisely: an open, JSON-RPC-based protocol standardizing how host applications (via MCP clients) discover and invoke tools, resources, and prompts exposed by MCP servers.
2. Explain the client-server-host architecture: what a host application is, what an MCP client does inside it, and what an MCP server exposes.
3. Distinguish MCP's three core primitives -- tools, resources, and prompts -- and give a concrete example use case for each.
4. Explain why a standard protocol reduces integration effort compared to bespoke, per-application integrations, using the "M times N" framing, while stating honestly where the "USB-C for AI" analogy helps and where it misleads.
5. Trace the lifecycle of one MCP tool call end to end: connection, capability discovery, invocation, result handling.
6. Build a minimal MCP server from scratch that exposes one tool, using the official MCP SDK's current idioms.
7. Explain how MCP relates to, and does not replace, provider-native function/tool calling as covered in **Tool Calling**.
8. Identify at least four MCP-specific security risks (a malicious or compromised server, over-broad permission scope, unvalidated tool arguments, supply-chain risk in third-party servers) and the corresponding defenses.
9. Evaluate, for a given integration need, whether building an MCP server is the right investment versus a simpler direct integration.
10. Map MCP onto the broader agent picture covered in **Agent Fundamentals**, and articulate what changes (and what does not) when a tool is exposed via MCP rather than integrated directly.

`,

  prerequisites: `
- **Required**: a working understanding of the **Agent Fundamentals** skill's perceive-plan-act-observe loop, and specifically the **Tool Calling** skill's treatment of how a model requests a tool call and how application code executes it. MCP is built directly on top of those mechanics; this page will not re-derive them.
- **Strongly recommended**: basic familiarity with JSON-RPC or any request/response RPC protocol (the concept of a request with an id, a method name, and parameters, matched to a response), since MCP's wire format is JSON-RPC 2.0. If this is unfamiliar, a quick read of the JSON-RPC 2.0 specification before this page will make Internal Working much easier to follow.
- **Helpful**: basic Python or TypeScript, since the official SDKs and this page's worked examples use them; basic comfort with running a local process and reading structured logs, useful for debugging a local MCP server over stdio.
- **Not required**: prior experience with any specific agent framework or host application. MCP is framework-agnostic by design, and this page builds the protocol concepts from scratch before showing how any particular host (such as **Claude Code**) consumes them.

Dependency links: **LLM Fundamentals** -> **Prompt Engineering** -> **Agent Fundamentals** -> **Tool Calling** -> this page (**MCP**). MCP is a natural next step after Tool Calling specifically, since it is the standardization layer built on top of the tool-calling mechanics that skill covers; it also connects forward into **Claude Code** and the **OpenAI Agents SDK** skills, both of which can act as MCP hosts, and into **Guardrails**, since securing an MCP server is a specialized application of that skill's general guardrail-design principles.
`,

  "beginner-concepts": `
### The integration problem, made concrete

Imagine three AI applications -- a chat client, a coding assistant, and a custom internal agent -- each wanting to query a company's internal ticketing system. Without a shared protocol, each application's developers write their own integration: their own way of describing the "look up ticket" capability to their model, their own code to call the ticketing system's API, their own way of formatting the result back into context.

~~~text
Without a standard protocol:
  Chat client       -- bespoke integration code --> Ticketing system
  Coding assistant   -- different bespoke code   --> Ticketing system
  Custom agent       -- yet another bespoke code --> Ticketing system

Three separate integrations, one external system. Add a second external
system (say, a company wiki) and a fourth application, and the number of
integrations needed grows roughly as (number of applications) times
(number of external systems), not as their sum.
~~~

### What MCP adds: one server, many clients

MCP's answer is to standardize the wire format and discovery mechanism so that one MCP server, built once for the ticketing system, can be attached to any MCP-compatible client.

~~~text
With MCP:
  Chat client       --\\
  Coding assistant    --> MCP client (built into each host) --> MCP protocol --> Ticketing MCP server --> Ticketing system
  Custom agent       --/

One server implementation. Any MCP-compatible host can attach to it.
~~~

### The three primitives, at a glance

An MCP server can expose any combination of three kinds of capability:

- **Tools** -- functions the model can request be invoked, generally with side effects or computation (for example, "create_ticket", "run_query"). These map directly onto the tool-calling concept from the **Tool Calling** skill; MCP standardizes how they are described and invoked, not the underlying idea of a callable function.
- **Resources** -- readable, addressable pieces of data the client can fetch and feed into the model's context (for example, "the contents of file X", "the current status of ticket 123"). Resources are conceptually closer to a GET request than to a tool call: fetching a resource is not expected to have side effects.
- **Prompts** -- reusable, parameterized prompt templates the server exposes, which the host application can surface to a user (for example, as a slash command) or inject into a conversation, so that a well-crafted prompt for a given task can be shared and reused rather than re-written by every application.

~~~text
Tool     : "create_ticket(title, description)" -- invokable, has an effect
Resource : "ticket://12345"                     -- readable, addressable data
Prompt   : "summarize_ticket_thread(ticket_id)" -- a reusable prompt template
~~~

### A minimal worked example: the smallest possible MCP server

The official MCP Python SDK provides a high-level decorator-based interface (FastMCP) for defining a server without hand-writing the JSON-RPC message handling yourself. This example exposes exactly one tool.

~~~python
# A minimal MCP server exposing a single tool. In a real system this
# would call a real weather API with a timeout and real error handling;
# here the mechanics of an MCP tool definition are kept visible.
# The exact decorator names and SDK entry points are current as of this
# page's knowledge cutoff -- check the official SDK docs for the current
# API surface before relying on this in production.

from mcp.server.fastmcp import FastMCP

# The server's name is what a connecting client will typically display.
mcp_server = FastMCP("weather-server")

@mcp_server.tool()
def get_weather(city: str) -> str:
    """Get the current weather for a city.

    Production note: a real implementation would call a real weather API
    here, with its own timeout, retry policy, and error handling -- an
    MCP tool function is still an ordinary function subject to all the
    same reliability engineering as any other external call.
    """
    fake_data = {"paris": "15C and rainy", "tokyo": "22C and clear"}
    result = fake_data.get(city.lower())
    if result is None:
        # Returning a clear error string, rather than raising an
        # uncaught exception, lets the calling model reason about the
        # failure instead of receiving an opaque protocol-level error.
        return "error: unknown city, try a major city name"
    return result

if __name__ == "__main__":
    # Runs the server over stdio by default -- suitable for a host
    # application that launches this as a local subprocess.
    mcp_server.run()
~~~

Notice what is, and is not, happening here: this code defines one tool and its docstring (which becomes the tool's description, exactly analogous to a tool description in the **Tool Calling** skill), and hands the rest -- listening for connections, handling the JSON-RPC handshake, serializing requests and responses -- to the SDK. That hidden machinery is exactly what Internal Working below makes explicit.
`,

  "intermediate-concepts": `
### Transports: stdio versus remote

An MCP server needs some channel over which its JSON-RPC messages travel. The original and still most common transport for local, single-user setups is **stdio**: the host application launches the MCP server as a local subprocess and communicates over its standard input and output streams. This is simple, requires no network configuration, and is a natural fit for a developer's own machine -- exactly how many **Claude Code**-attached MCP servers run.

~~~text
stdio transport:
  Host application launches: python weather_server.py
  Host writes JSON-RPC requests to the subprocess's stdin
  Server writes JSON-RPC responses (and notifications) to its stdout
  No network port, no authentication layer -- trust is implicit in
  "you chose to launch this process on your own machine"
~~~

For servers that need to run remotely -- shared across a team, or exposing an internal system that should not require every user to run a local process -- MCP also supports HTTP-based transports, which introduce their own concerns: authentication, network security, and multi-tenancy that a local stdio server does not need to think about at all. The exact HTTP transport mechanics (streaming approach, authentication conventions) are an actively evolving part of the specification -- check the official documentation for the current recommended approach rather than assuming any specific pattern is final.

### The connection lifecycle: initialize, then discover, then use

Every MCP session follows the same rough shape regardless of transport: the client and server first perform an initialization handshake (exchanging protocol versions and declared capabilities), then the client asks the server to list what it offers (its available tools, resources, and prompts, along with their schemas/descriptions), and only then does the client actually invoke a specific tool, read a specific resource, or fetch a specific prompt. This mirrors the same discovery-then-invocation shape that any RPC or API-description system (like an OpenAPI spec, conceptually) uses, and is covered in full detail with a sequence diagram in Internal Working and Data Flow below.

### Resources in more depth

A resource is identified by a URI (for example, a scheme like "file://" or a server-defined custom scheme like "ticket://"), and a client can list available resources, then read a specific one by its URI. Resources can be static (a fixed file) or dynamic (a resource whose content changes based on live state, such as "the current contents of this database row"), and a server can also notify a connected client when a resource's content changes, letting a host application refresh what it has fed into context without polling.

~~~python
# Continuing the FastMCP example: exposing a resource alongside the tool.
# Resources are fetched, not "called with arguments" the way tools are --
# conceptually closer to reading a file than invoking a function.

@mcp_server.resource("weather://forecast/{city}")
def get_forecast_resource(city: str) -> str:
    """Expose a read-only forecast as an addressable resource, distinct
    from the get_weather tool above -- this has no side effects and is
    meant to be fetched into context, not "invoked" to perform an action."""
    return f"7-day forecast placeholder for {city}"
~~~

### Prompts as a first-class primitive

A prompt in the MCP sense is a named, parameterized template a server exposes -- for instance, a "review_pull_request" prompt that takes a repository and PR number and expands into a carefully constructed set of instructions for reviewing that PR. Exposing this via MCP, rather than each application maintaining its own copy of that prompt text, means the prompt-engineering work (see **Prompt Engineering**) behind a good task-specific prompt can be written once by whoever understands the underlying system best and reused unchanged across every MCP-compatible host.

~~~python
@mcp_server.prompt()
def review_pull_request(repo: str, pr_number: int) -> str:
    """A reusable prompt template a host application can surface to a
    user (e.g. as a slash command) or inject directly into a
    conversation -- written once, usable from any MCP-compatible client."""
    return (
        f"Review pull request number {pr_number} in repository {repo}. "
        "Check for correctness, test coverage, and adherence to the "
        "project's style guide before approving."
    )
~~~

### MCP clients and hosts, precisely

The **host** is the user-facing application (a chat client, an IDE such as **Claude Code**, a custom agent built on the **OpenAI Agents SDK**, or any other program embedding an LLM). The **MCP client** is the component, usually provided by an SDK, living inside the host that manages one connection to one MCP server, handling the JSON-RPC protocol details. A single host application commonly maintains several MCP clients simultaneously, each connected to a different server (one for a filesystem, one for a ticketing system, one for a database), presenting the union of all their exposed tools, resources, and prompts to the underlying model as though they were one merged toolbox -- though in practice the host is responsible for namespacing and deduplicating capabilities across servers so the model is not confused by two identically named tools from different sources.
`,

  "advanced-concepts": `
### MCP does not replace tool-calling semantics -- it wraps them

A subtlety worth being precise about: when a model decides to call an MCP-exposed tool, the underlying mechanism by which the model requests that call is still the host's own provider-native function/tool calling, exactly as covered in **Tool Calling**. What MCP adds is a layer *before* that decision point -- translating the MCP server's tool listing into whatever tool-schema format the host's model API expects -- and a layer *after* it, translating the model's tool-call request into an MCP JSON-RPC "call tool" message sent to the right server, and translating the server's JSON-RPC response back into whatever format the host feeds back to the model. The model itself is never directly "MCP-aware"; it is aware only of a tool schema the host constructed, which happens to have been sourced from an MCP server rather than hardcoded in the host's own code.

~~~text
Model's perspective:            "here is a tool named create_ticket
                                  with this argument schema" -- looks
                                  identical whether the host built this
                                  schema by hand or sourced it from MCP

Host's perspective (MCP-aware): received this tool's schema from an
                                  MCP server via a list_tools call;
                                  routes the model's eventual tool-call
                                  request to that same server via a
                                  call_tool JSON-RPC message
~~~

This is why "does MCP replace tool calling" is a common but slightly malformed question (see Comparisons for the fuller treatment): MCP is a protocol for describing and transporting tool/resource/prompt definitions between a server and a host; the host still needs a working tool-calling mechanism with its underlying model to actually act on what MCP told it was available.

### The "USB-C for AI" analogy -- useful, but hedge it

MCP is frequently described as "USB-C for AI" -- a single standard connector that lets any compliant device (client) plug into any compliant peripheral (server), instead of every device needing its own proprietary cable. This is a genuinely useful mental model for the *shape* of the problem MCP solves (the M-times-N integration problem described in Why It Exists), and it is worth having in your head. It is also, like most analogies, imperfect if pushed too far: USB-C is a physical, largely capability-agnostic transport standard, whereas MCP's primitives (tools, resources, prompts) carry semantic meaning that a connecting client must interpret correctly -- a resource is not interchangeable with a tool the way any USB-C cable is interchangeable with any other for basic power or data transfer. Treat the analogy as one useful framing for explaining MCP's value proposition to a non-technical audience, not as a precise technical claim about how the protocol works, and be wary of over-relying on it in technical design discussions.

### Trust boundaries and the multiplied attack surface

Because an MCP server can be built and operated by a party other than the host application's developer, connecting to a third-party MCP server introduces a genuinely new trust relationship: you are trusting that server's implementation not to misbehave, not to be compromised, and not to have been built maliciously in the first place. This compounds the same "tool misuse" and "manipulated observation" risks already covered in **Agent Fundamentals** and **Tool Calling**, but with an added dimension -- the tool's *description itself* (what the server claims a tool does, and what arguments it expects) is also attacker-controllable if the server is malicious or compromised, meaning a host cannot even fully trust the schema it received during discovery, not just the results returned during invocation. See Security below for the full treatment.

### Capability negotiation and versioning

During the initialization handshake, client and server exchange the protocol version each supports and the specific capabilities each declares (for example, whether the server supports resource-change notifications, or whether the client supports certain sampling features). This negotiation exists precisely because MCP is a versioned, evolving protocol: a client built against an older specification should be able to connect to a newer server (and vice versa) by negotiating down to their common supported feature set, rather than failing outright -- though as with any young protocol, backward-compatibility guarantees should be verified against the current specification rather than assumed.

### Server-initiated interactions: sampling

Beyond the client-initiated flows (list tools, call a tool, read a resource), the specification also describes a "sampling" capability that allows a server, under certain conditions, to request that the *host's* LLM generate a completion on the server's behalf -- inverting the usual direction of "client asks server to do something." This is a more advanced and less universally implemented part of the protocol; whether a given host supports exposing this capability to a connected server, and under what safety constraints, varies and should be checked against current host documentation rather than assumed available.
`,

  "internal-working": `
Step by step, here is what actually happens over the wire during one MCP session, from connection through one tool invocation, using the standard JSON-RPC 2.0 message shape MCP is built on:

~~~mermaid
flowchart TB
    A["Host launches or connects to MCP server\n(stdio subprocess, or HTTP connection)"] --> B["Initialize handshake:\nclient and server exchange protocol version + capabilities"]
    B --> C["Client sends list_tools / list_resources / list_prompts\nrequests to discover what the server offers"]
    C --> D["Server responds with schemas/descriptions\nfor each tool, resource, and prompt"]
    D --> E["Host translates MCP tool schemas into its own\nmodel-provider tool-calling format"]
    E --> F["LLM decides to call a tool\n(ordinary provider-native tool calling, see Tool Calling)"]
    F --> G["Host sends a call_tool JSON-RPC request\nto the relevant MCP server, with arguments"]
    G --> H["Server executes the underlying function,\nreturns a JSON-RPC response (result or error)"]
    H --> I["Host feeds the tool result back to the model\nas an observation, exactly as in the Agent Fundamentals loop"]
~~~

1. **Connect**: the host establishes a connection to the server, either by launching it as a local subprocess and wiring up stdio, or by opening an HTTP-based connection to a remote server, depending on the transport the server supports.
2. **Initialize**: client and server exchange an initialization request/response pair, declaring the MCP protocol version each supports and which optional capabilities (resource-change notifications, sampling, and others) each side implements -- this is the capability-negotiation step described in Advanced Concepts.
3. **Discover**: the client sends list requests (conceptually, "list_tools", "list_resources", "list_prompts") and the server responds with the full set of what it currently exposes, including each tool's name, description, and JSON Schema-style argument specification -- directly analogous to the tool-description schema covered in **Tool Calling**, just sourced from the server rather than hand-written by the host.
4. **Translate**: the host application translates this discovered schema into whatever tool-calling format its underlying model API actually expects (since different model providers have their own function-calling schema conventions, per **Tool Calling**) -- this translation step is entirely the host's responsibility; MCP itself does not dictate a specific model provider's tool-call format.
5. **Decide**: the LLM, seeing the translated tool schemas alongside the rest of its context, decides whether to request a tool call -- this step is unchanged from ordinary provider-native tool calling; the model has no special awareness that the tool happens to be MCP-sourced.
6. **Invoke**: if the model requests a tool call, the host sends a JSON-RPC "call tool" request to the corresponding MCP server, carrying the tool's name and the arguments the model supplied.
7. **Execute and respond**: the server executes the underlying function (in the beginner example, the get_weather Python function) and returns a JSON-RPC response containing either the result or a well-formed error.
8. **Observe**: the host takes that result and feeds it back into the model's context as an observation, continuing the same perceive-plan-act-observe loop described in **Agent Fundamentals** -- from the loop's perspective, nothing about this final step differs from a directly-integrated tool call.

The architectural fact this trace makes visible: MCP's job is entirely steps 1 through 4 and step 6 -- connection, discovery, schema translation, and message transport. Steps 5, 7, and 8 (the model's decision, the tool's actual execution logic, and feeding the result back into the loop) are exactly the same mechanics as any tool call, MCP-sourced or not. This is the clearest way to see that MCP standardizes plumbing, not the underlying tool-use paradigm.
`,

  architecture: `
Understanding MCP architecture, for an AI engineer, means understanding the host/client/server split above and how a real application should be structured around potentially several simultaneous MCP server connections, each an independent, fallible external dependency.

### The core components, at a glance

- **The host application** -- the user-facing program embedding an LLM (a chat client, **Claude Code**, a custom agent). Owns the overall conversation/agent loop and decides which discovered tools to actually offer the model at any given moment.
- **MCP client(s)** -- one per connected server, usually provided by an SDK, handling the JSON-RPC protocol mechanics (initialization, discovery, invocation) for that specific connection.
- **MCP server(s)** -- one per external system being exposed, declaring tools, resources, and/or prompts and implementing the actual logic behind them.
- **The underlying model API** -- the LLM the host calls, using its own provider-native tool-calling format (see **Tool Calling**), fed a translated version of whatever the connected MCP servers exposed.
- **Guardrails** -- validation and policy enforcement the host wraps around both what tool schemas and results it trusts from a connected server, and what tool-call requests it actually forwards to that server -- exactly analogous to the guardrail layer in **Agent Fundamentals**' architecture, now with an added "is this server itself trustworthy" dimension.

### Application architecture around MCP

~~~mermaid
flowchart TB
    U["User"] --> Host["Host application\n(chat client, IDE, custom agent)"]
    Host --> Orchestrator["Agent orchestrator / loop\n(see Agent Fundamentals)"]
    Orchestrator --> LLM["LLM call\n(provider-native tool calling)"]
    LLM -->|tool call requested| Guard["Guardrail: is this MCP server\nand this tool call trusted/allowed?"]
    Guard -->|approved| ClientA["MCP client A"]
    Guard -->|approved| ClientB["MCP client B"]
    ClientA --> ServerA["MCP server A\n(e.g. filesystem)"]
    ClientB --> ServerB["MCP server B\n(e.g. ticketing system)"]
    ServerA --> ClientA
    ServerB --> ClientB
    ClientA --> Orchestrator
    ClientB --> Orchestrator
    Orchestrator --> LLM
    LLM -->|final answer| Host
    Host --> U
~~~

Key architectural principles:

- **Each MCP server is an independent external dependency**, with its own failure modes, latency, and trust level -- treat a connection to each server with the same rigor (timeouts, error handling, monitoring) you would apply to any other external network call, per **Agent Fundamentals**' production-usage guidance.
- **The host, not the model, owns which discovered capabilities are actually offered.** A host is not obligated to forward every tool a connected server exposes to the model; scoping which tools are actually surfaced (per Best Practices below) is a host-side guardrail, exactly analogous to tightly scoping an agent's tool set in **Agent Fundamentals**.
- **Schema translation is a real engineering surface**, not a passthrough -- since different model providers have different function-calling schema conventions, the host's translation layer between an MCP server's tool schema and the model's expected format needs its own testing and validation.
- **Multiple servers can expose the same-named tool**, and the host is responsible for namespacing or disambiguating this, since the model itself has no inherent way to distinguish two different servers' "search" tools without help from the host.
`,

  "data-flow": `
Tracing one MCP-mediated tool call end to end, from a user's request through server execution and back, across a single connected server:

~~~mermaid
sequenceDiagram
    participant User
    participant Host as Host application
    participant LLM as LLM (decision step)
    participant MClient as MCP client
    participant MServer as MCP server (ticketing system)

    User->>Host: "What's the status of ticket 4821?"
    Host->>MClient: (already connected, capabilities already discovered)
    Host->>LLM: goal + transcript + tool schemas (sourced from MCP discovery)
    LLM-->>Host: tool_call: get_ticket_status(ticket_id="4821")
    Host->>MClient: forward call, after guardrail check
    MClient->>MServer: JSON-RPC call_tool request
    MServer->>MServer: execute underlying ticketing-system API call
    MServer-->>MClient: JSON-RPC response: {"status": "in progress", "assignee": "..."}
    MClient-->>Host: parsed result
    Host->>LLM: goal + updated transcript (tool result as observation)
    LLM-->>Host: final_answer: "Ticket 4821 is in progress, assigned to ..."
    Host-->>User: final answer
~~~

The two facts this trace makes concrete: first, the MCP client and server round trip (the two middle "JSON-RPC" steps) is an additional network/process hop compared to a directly-integrated tool call, meaning MCP-mediated tool calls carry their own latency and failure characteristics on top of the LLM call's own latency -- this is a real cost, not a free abstraction, and should be measured (see Performance). Second, everything upstream and downstream of the MCP round trip -- the model deciding to call a tool, and the model reasoning over the returned observation -- is identical to the equivalent steps in a directly-integrated tool call, per **Agent Fundamentals**' data-flow trace; MCP only changes what happens in the middle two steps of this diagram.
`,

  "production-usage": `
### How real teams actually run MCP in production

- **Local, developer-facing MCP servers are the most mature and widely deployed pattern today.** Attaching a local MCP server (over stdio) to a developer tool such as **Claude Code**, to give it access to a filesystem, a git repository, or a local database, is currently the most common and best-supported use case -- remote, multi-tenant MCP deployments are a newer and less uniformly battle-tested pattern.
- **Teams building internal MCP servers generally start narrow.** A first internal MCP server commonly exposes a small, well-scoped set of read-mostly tools (look up a record, search a knowledge base) before expanding to tools with real side effects, mirroring the same "start narrow, expand deliberately" discipline recommended for any new tool surface in **Agent Fundamentals** and **Tool Calling**.
- **Server authentication and authorization for remote MCP servers is an active area of engineering**, since a remote server may be shared across multiple users or teams with different permission levels -- this is one of the areas of the specification and its surrounding tooling that is evolving fastest, and current best practice should be checked against up-to-date documentation rather than assumed.
- **Observability is built around both the MCP layer and the underlying tool logic.** Production deployments typically log the MCP-level request/response (which tool, which arguments, which server) as well as whatever the underlying tool implementation itself logs, since a failure can originate in either layer.
- **A registry or curated allowlist of approved MCP servers is common in organizations that support MCP for their engineers**, rather than allowing any locally discovered or community-published server to be attached to a host with access to sensitive internal systems -- this is a direct, MCP-specific application of the tight-tool-scoping discipline from **Agent Fundamentals**.

### Typical operational defaults

- Pin the MCP server's version (and, where applicable, the SDK version the server is built against) rather than always running "latest," exactly as you would pin a model version per **Agent Fundamentals**' deployment guidance.
- Set a timeout on every MCP tool call and resource read, since a connected server is an external dependency that can hang or fail independently of the host application.
- Log every discovered tool/resource/prompt schema at connection time, so a schema change in a server (which could silently alter what the model is told a tool does) is visible in logs and diffable across deployments.
- Maintain an explicit allowlist of which MCP servers a given host deployment is permitted to connect to, rather than accepting arbitrary server connection strings from configuration or user input.
`,

  "industry-examples": `
- **AI-powered IDEs and coding assistants** (including **Claude Code** and similar tools) use MCP as a first-class extension mechanism, letting developers attach servers for their filesystem, version control, issue trackers, and internal build systems, so the coding assistant can read and act on real project context rather than only the conversation transcript.
- **Enterprise knowledge-base and internal-tool vendors** have begun publishing MCP servers for their own products (documentation search, ticketing systems, internal wikis), so that any MCP-compatible AI application their customers use can connect to that product's data without the vendor needing to build a bespoke integration for every AI application on the market.
- **Developer-tooling companies building agent frameworks** (spanning the ecosystem around **LangChain**, **LangGraph**, and similar) have added MCP client support, letting agents built on those frameworks consume the same MCP servers that other host applications use, directly illustrating the protocol's cross-framework interoperability goal.
- **Database and data-infrastructure vendors** have published MCP servers exposing schema introspection and query execution, letting an AI application safely explore and query a database's structure through a standardized tool interface rather than a bespoke database-specific integration per application.
- **Community-maintained MCP server registries and directories** have emerged, cataloging servers for common developer tools, cloud provider APIs, and SaaS products -- a visible sign of the ecosystem effect MCP is intended to produce, though the maturity, security posture, and maintenance status of any given community server varies widely and should be evaluated before use (see Security).

Pattern to notice: the most mature production usage today clusters around developer-facing tools (IDEs, coding assistants) and read-mostly or well-scoped internal integrations, consistent with the "start narrow" production guidance above -- broad, unrestricted MCP deployment to end-user-facing consumer products with sensitive side-effecting tools is a less proven pattern at the time of writing, and should be approached with the same caution as any new, fast-evolving integration surface.
`,

  "best-practices": `
1. **Start with a narrow, read-mostly tool and resource set for a new MCP server**, expanding to side-effecting tools deliberately, exactly mirroring the tool-scoping discipline in **Agent Fundamentals** and **Tool Calling**.
2. **Write precise, unambiguous tool and resource descriptions**, since a host's model will rely entirely on the schema and description your server provides to decide when and how to use a capability -- the same description-quality discipline as any tool description in **Tool Calling**, now shipped to every client that connects.
3. **Validate every tool call's arguments inside the server**, never trusting that a connecting client (or the model behind it) supplied well-formed or safe input, since your server may be attached to hosts you do not control.
4. **Treat every connected MCP server as an external, fallible dependency** from the host side -- timeouts, retries with backoff, and graceful degradation if a server is unreachable, exactly as you would for any other external network call.
5. **Maintain an explicit allowlist of MCP servers a given deployment may connect to**, rather than accepting arbitrary server connection configuration, especially in any deployment with access to sensitive internal systems.
6. **Pin server and SDK versions rather than tracking "latest,"** given how actively the specification and reference SDKs are still evolving.
7. **Log the full discovery and invocation trace** (which tools/resources were discovered, which were actually called, with what arguments and what results) for later debugging, exactly analogous to the transcript-logging discipline in **Agent Fundamentals**.
8. **Separate tools (side-effecting) from resources (read-only) deliberately when designing a server**, rather than exposing everything as a tool -- this distinction has real security implications (see Security) and helps a connecting host reason about risk.
9. **Put a human-approval gate in front of any MCP-exposed tool with consequential or irreversible effects**, exactly as recommended for any such tool in **Agent Fundamentals**, since MCP does not add any approval mechanism of its own.
10. **Evaluate third-party or community MCP servers before connecting a host with access to sensitive data or systems**, treating an unfamiliar server's code (or, if closed-source, its publisher's reputation and track record) with the same scrutiny you would apply to any new third-party dependency with the ability to execute code or access your systems.
11. **Design for graceful capability negotiation**, since a host may be running an older or newer protocol version than your server -- test against the range of protocol versions you intend to support rather than only the latest.
12. **Do not build an MCP server as a substitute for good API design in the underlying system it wraps.** If the underlying system's own API is poorly designed, wrapping it in MCP does not fix that; fix or improve the underlying interface first where feasible.
`,

  "anti-patterns": `
### Treating an MCP server as inherently trustworthy because it "looks" official

~~~text
WRONG: connecting a host application (with access to sensitive internal
  data via other attached servers) to an unvetted, community-published
  MCP server found in a public registry, without reviewing its code or
  publisher, simply because it has a polished description and many
  downloads.

RIGHT: treat every third-party MCP server as a new, unaudited code
  dependency with the ability to see whatever context the host sends it
  and to return whatever content it wants back into the model's context
  -- review it, or restrict it to a sandboxed host with no access to
  sensitive systems, before connecting it broadly.
~~~

### Other common MCP-level anti-patterns

- **Exposing a destructive or high-privilege operation as an MCP tool with no argument validation or approval gate**, relying on the model's own judgment not to misuse it -- the exact same mistake covered in **Agent Fundamentals**' anti-patterns, now with the added risk that the tool call may originate from a host and model the server's author does not control at all.
- **Building an MCP server that exposes every underlying API endpoint as a tool "for completeness,"** rather than curating a small, well-described set of capabilities actually needed -- a large, undifferentiated tool surface increases the chance of tool misuse without a proportional capability gain, exactly per the tool-scoping guidance in **Agent Fundamentals**.
- **Conflating a resource and a tool** -- exposing a side-effecting operation (like "delete this record") as a resource, or a purely read-only operation as a tool with no clear indication it is side-effect-free -- which undermines a host's ability to reason about which operations are safe to invoke speculatively or automatically versus which need explicit approval.
- **Assuming MCP itself provides authentication, authorization, or sandboxing.** The protocol standardizes message shape and discovery; it does not, by itself, secure a server's execution environment or enforce who is allowed to call which tool -- that engineering is entirely the server (and host) implementer's responsibility.
- **Hardcoding a specific host application's quirks into a general-purpose MCP server**, which defeats the entire portability goal the protocol exists to provide -- if a server only really works correctly with one particular client, it has not achieved the standardization MCP is meant to enable.
- **Treating "we adopted MCP" as a security or reliability upgrade by itself.** MCP changes how a tool is discovered and transported; every failure mode covered in **Agent Fundamentals** and **Tool Calling** (tool misuse, compounding errors, unvalidated arguments) still applies in full to MCP-mediated tool calls.
`,

  performance: `
### Measure first

Before optimizing anything, instrument and measure, per MCP-mediated tool call: connection/handshake latency (typically paid once per session, not per call), discovery (list_tools/list_resources) latency, per-call round-trip latency to each connected server, and the failure/timeout rate per server. Without this, "MCP feels slow" is a guess, not engineering, exactly per the measurement-first discipline in **Agent Fundamentals**'s Performance section.

### The optimization hierarchy for MCP-mediated systems (apply in order)

1. **Cache discovery results within a session** rather than re-listing tools/resources on every model turn, since a server's exposed capabilities typically do not change moment to moment within a single conversation -- re-fetching them unnecessarily adds latency for no benefit.
2. **Minimize the number of connected servers actually queried per turn**, offering the model only the tool schemas relevant to the current task rather than the full union of every attached server's capabilities, mirroring the tight tool-scoping guidance from **Agent Fundamentals**.
3. **Keep resource payloads concise.** A resource that returns a large raw payload forces the host to pay to feed all of it into the model's context; where possible, have the server return a summarized or paginated view, with a separate mechanism to fetch more detail on demand.
4. **Run local, latency-sensitive servers over stdio rather than remote transports** where the option exists, since a local subprocess avoids network round-trip latency entirely -- reserve remote/HTTP transports for genuinely shared or centrally hosted capabilities.
5. **Parallelize independent tool calls across different servers** where the host's orchestration supports it, exactly as described for parallel tool calls in **Agent Fundamentals**, since calls to different MCP servers are typically independent of one another.
6. **Push server-side execution optimization (database query tuning, API call batching) to the underlying system's own performance discipline**, not to the MCP layer itself -- MCP transports a request/response, it does not make the underlying operation faster.

### Facts worth knowing at this level

- Each additional connected MCP server adds a fixed, typically small, per-session handshake cost, plus a per-call round-trip cost that is separate from and additive to the LLM call's own latency.
- A remote, HTTP-based MCP server introduces genuine network latency and failure modes (timeouts, transient errors) that a local stdio server largely avoids, which should factor into the choice between local and remote deployment for latency-sensitive use cases.
- As with any tool-using agent (per **Agent Fundamentals**), the dominant cost driver is usually the number of sequential tool-call round trips a task requires, not any single call's overhead -- minimizing step count remains the highest-leverage lever even in an MCP-mediated system.
`,

  scalability: `
Scalability for MCP-based systems has two distinct dimensions: scaling the number of concurrent host-to-server connections and calls (an infrastructure concern for any server exposed beyond a single local developer machine), and scaling the number of distinct servers a single host application manages (an architectural concern specific to how MCP is used).

### The concurrency-scaling story for a remote MCP server

~~~mermaid
flowchart LR
    Hosts["Many connected host applications /\nMCP clients"] --> LB["Load balancer / connection gateway"]
    LB --> S1["MCP server instance 1"]
    LB --> S2["MCP server instance 2"]
    LB --> SN["MCP server instance N"]
    S1 & S2 & SN --> Backend["Underlying system\n(database, API, internal service)"]
~~~

A remote MCP server, once deployed beyond a single local process, needs the same horizontal-scaling story as any other network service: multiple stateless (or carefully state-managed) instances behind a connection gateway, with the underlying backend system's own capacity as the ultimate constraint -- MCP itself does not add a scaling bottleneck beyond whatever the underlying system it wraps already has.

### Known bottlenecks and answers

| Bottleneck | Answer |
|---|---|
| A single MCP server becomes a shared bottleneck across many concurrent host sessions | Scale the server horizontally behind a connection gateway; rate-limit per client/tenant at the server, not just at the underlying backend |
| Underlying backend system (database, third-party API) has its own rate limits, shared across all MCP-mediated traffic plus any other traffic it serves | Rate-limit and queue centrally at the backend, exactly as recommended for any shared tool/API capacity in **Agent Fundamentals** |
| A host attaches many servers, and per-turn schema translation/union across all of them grows expensive | Scope which servers' tools are actually offered per task/context, rather than always presenting the full union to the model |
| Discovery (list_tools) latency adds up across many attached servers at session start | Cache discovery results per session (see Performance); avoid re-discovery unless a server signals a capability change |
| Cost/latency scaling with both host-session volume and number of MCP round trips per task | Minimize round trips per task first (highest leverage, per **Agent Fundamentals**), then apply standard service-scaling techniques to the server itself |

The single most important scalability idea specific to MCP: unlike a directly embedded tool, an MCP-mediated tool call's resource consumption includes a network/process hop that itself needs capacity planning, separate from and in addition to whatever capacity planning the underlying system and the LLM call already require.
`,

  security: `
### MCP-specific attack surface

An MCP server is, plainly, a new attack surface: it is a piece of software, potentially maintained by a third party, designed explicitly to be attached to AI applications that may pass it (and receive from it) content that flows directly into an LLM's context and decision-making. Treat every connected server -- especially any third-party or community-published one -- with the scrutiny you would apply to any new code dependency with network or system access.

1. **A malicious or compromised MCP server can return manipulated tool results or resource content.** Exactly the same prompt-injection risk covered in **Agent Fundamentals** and **Tool Calling** -- a tool result or resource read can contain adversarial text the model may treat as an instruction -- except here the "tool" is code you did not write and may not have audited, run by a party you may not fully trust.
2. **A malicious server can lie about its own tool/resource descriptions during discovery.** Because the schema and description a host relies on to decide when and how to call a tool are themselves supplied by the server, a compromised or malicious server can misdescribe a dangerous operation as an innocuous one -- meaning discovery-time content, not just invocation-time results, is part of the trusted (or untrusted) surface.
3. **Over-broad permission scope on the underlying system a server wraps.** If an MCP server is granted full read/write credentials to a backend system when the tools it exposes only need narrow read access, a bug or compromise in the server becomes far more consequential than it needed to be -- the principle of least privilege applies to what credentials the server itself holds, independent of what the protocol allows a client to request.
4. **Supply-chain risk in third-party or community-published servers.** An MCP server is ordinary code (often installed as a package or run as a container), subject to exactly the same supply-chain risks as any other third-party dependency -- a compromised package registry entry, a maintainer account takeover, or a deliberately backdoored community server are all realistic threats, not hypothetical ones.
5. **Unvalidated tool arguments reaching a sensitive backend operation.** Passing model-generated arguments (which themselves may have been influenced by earlier untrusted tool results, per the chained-privilege-escalation risk in **Agent Fundamentals**) directly into a shell command, SQL query, or file path inside a server's tool implementation is the same class of injection vulnerability as any other unvalidated input.
6. **Cross-server data exfiltration.** A host connected to both a server with access to sensitive data and a server with outbound-facing capability (sending a message, posting to an external API) creates an exfiltration path if either server is compromised or the model is manipulated into chaining a read from one with a write to the other -- treat this combination, across servers, with the same scrutiny **Agent Fundamentals** recommends within a single agent's tool set.

### Defenses

- Validate and sanitize tool arguments inside every server implementation, never trusting that a connecting client or the model behind it supplied safe input, regardless of how trustworthy the overall system usually looks.
- Scope the credentials an MCP server itself holds to the minimum required for the tools it actually exposes -- do not grant a server broader backend access than its narrowest tool needs.
- Maintain an explicit allowlist of approved MCP servers for any deployment with access to sensitive systems, and review the code (or the publisher's track record, for closed-source servers) of any third-party server before connecting it broadly.
- Treat both discovery-time content (tool/resource descriptions) and invocation-time content (tool results, resource reads) from any connected server as untrusted with respect to instructions, exactly as you would treat retrieved documents in a RAG system.
- Log every discovered capability and every invoked call, with arguments and results, so an incident involving a specific server can be reconstructed after the fact.
- Put human approval in front of any MCP-exposed tool with irreversible or costly effects, and treat the combination of "sensitive read access" plus "external write/send capability" across any set of connected servers as requiring explicit review, not just within a single server.
- Pin server versions and monitor for unexpected schema changes at connection time, since a schema change in a previously-trusted server could indicate a compromise or a supply-chain incident.

See the **Guardrails**, **Tool Calling**, and **Agent Fundamentals** skills for the general security discipline this section specializes; this section is the MCP-specific layer on top of that broader picture, and should be read alongside it, not as a substitute for it.
`,

  testing: `
Testing MCP servers and MCP-mediated agent systems combines the non-determinism challenges already present for tool-using agents (see **Agent Fundamentals**' testing section) with an additional layer specific to the protocol: the discovery and invocation contract between client and server needs its own, separately testable correctness guarantees.

~~~python
# Testing an MCP server's tool logic directly, independent of any
# connected host or model -- exercise the underlying function the way
# you would test any other function, since the MCP decorator layer is
# a thin wrapper around it.

def test_get_weather_returns_known_city():
    result = get_weather("paris")
    assert "rainy" in result.lower()

def test_get_weather_handles_unknown_city_gracefully():
    result = get_weather("nowhereville")
    assert result.startswith("error:")   # graceful, parseable failure,
                                          # not an uncaught exception

def test_server_exposes_expected_tool_schema():
    # A discovery-contract test: assert on the SHAPE of what the server
    # advertises, since a host relies entirely on this schema to decide
    # when and how to call the tool.
    tools = list_registered_tools(mcp_server)   # test helper, SDK-specific
    weather_tool = next(t for t in tools if t.name == "get_weather")
    assert "city" in weather_tool.input_schema["properties"]
    assert weather_tool.description   # never ship an undocumented tool

def test_server_rejects_malformed_arguments():
    # Argument validation must happen inside the server, never assumed
    # to have been enforced upstream by a well-behaved client.
    with pytest.raises(ValidationError):
        call_tool_directly(mcp_server, "get_weather", {"city": 12345})
~~~

### Fundamentals-level testing doctrine for MCP

- **Test the underlying tool/resource/prompt logic directly**, independent of the MCP transport layer, the same way you would unit-test any function -- the MCP decorator layer is a thin wrapper and should not need to be exercised to validate the underlying logic's correctness.
- **Test the discovery contract explicitly**: assert that the schema a server advertises matches what its implementation actually expects and does, since a mismatch here silently misleads every connecting host's model, not just one caller.
- **Test argument validation and error handling as first-class scenarios**, injecting malformed or adversarial arguments and asserting the server degrades gracefully (a well-formed error response) rather than throwing an unhandled exception or, worse, executing unsafely.
- **Integration-test at least one full client-server round trip** (connect, discover, invoke, receive result) against a real or realistic test transport, since protocol-level bugs (a malformed JSON-RPC message, a version-negotiation mismatch) will not be caught by unit-testing the underlying function alone.
- **Separate "did the MCP plumbing work" tests (deterministic, mockable) from "did the model make a good decision to call this tool" tests (need a real model call and connect to the broader agent-evaluation methodology in **Agent Fundamentals** and **Evaluation**)** -- exactly the same separation recommended for agent testing generally, now with an added MCP-protocol layer in between.
`,

  debugging: `
### Escalation path for debugging unexpected MCP behavior

1. **Check the connection and handshake first.** Before assuming a tool-logic bug, confirm the client actually connected to the intended server and that the initialization handshake succeeded with the expected protocol version -- a surprising number of "the tool didn't work" reports are actually "the server never connected" or "the wrong server version was reached."
2. **Inspect the raw discovery response.** Log or print the exact tool/resource/prompt schemas the server returned during discovery, and confirm they match what you expect the server to expose -- a stale or misconfigured server can silently advertise an outdated schema.
3. **Reconstruct the exact call_tool request and response.** Log the precise JSON-RPC request sent (tool name, arguments) and the exact response received (result or error), rather than only the host application's higher-level summary of what happened -- protocol-level detail is often where the actual bug is visible.

~~~python
def log_mcp_call(tool_name: str, arguments: dict, response: dict) -> None:
    """Debugging habit: before theorizing about WHY an MCP-mediated tool
    call misbehaved, log the exact request and response at the protocol
    level, not just the host's summarized view of what happened."""
    print(f"--- MCP call: {tool_name} ---")
    print(f"arguments: {arguments}")
    print(f"response:  {response}")
~~~

4. **Check whether the failure originates in the server's tool logic, or in the host's translation/orchestration layer.** Call the underlying tool function directly (bypassing MCP entirely, as in the Testing section) to isolate whether the bug is in the tool's own logic or in how the host is invoking it through the protocol.
5. **Check for schema mismatches between what the server advertises and what it actually expects or returns**, since a host's model relies entirely on the advertised schema, and any drift here produces confusing failures that look like "the model misused the tool" but actually originate in an incorrect or stale schema.
6. **Check transport-specific failure modes**: for a stdio server, confirm the subprocess actually started and is still running (a crashed subprocess produces a very different failure signature than a slow one); for a remote/HTTP server, check for network-level timeouts, authentication failures, or connectivity issues separate from any application-level bug.
7. **Escalate to the same agent-level debugging discipline from **Agent Fundamentals** once the MCP plumbing itself is confirmed to be working correctly** -- if the right tool was discovered, called with the right arguments, and returned the right result, but the agent still made a poor decision, that is a model-decision or prompt problem, not an MCP problem.

### Common "it's not a bug, it's the protocol" traps

- Tool "not found" from the model's perspective: the server was never actually connected, or discovery happened before the server finished registering its tools -- check connection and initialization order, not the tool's implementation.
- Tool call silently no-ops: often a schema mismatch where the host translated arguments incorrectly for the underlying model provider's tool-calling format, not a bug in the server's own logic.
- Stale tool behavior after a server update: the host cached an old discovery result and never re-fetched the current schema -- check the host's discovery-caching policy (see Performance) rather than the updated server code first.
`,

  monitoring: `
Production MCP monitoring extends standard tool-using agent monitoring (per **Agent Fundamentals**) with signals specific to the client-server protocol layer.

### What to measure

- **Per-server connection health**: successful versus failed handshake rate, and reconnection frequency, for each attached MCP server -- a rising failure rate for one specific server is an early warning distinct from a general agent-reliability issue.
- **Discovery latency and result stability**: how long list_tools/list_resources calls take, and how often the advertised schema actually changes between sessions -- an unexpectedly changing schema for a server you did not intentionally update can indicate a compromise or a misconfiguration.
- **Per-tool-call latency and error rate, broken down by server**: since each connected server is an independent dependency, aggregate "tool call latency" numbers hide which specific server is actually the bottleneck or the failure source.
- **Cross-server capability usage**: which servers' tools are actually being invoked in production versus merely discovered and never used -- a strong signal for pruning unnecessary server connections per the tight-scoping guidance in Best Practices.
- **Argument and result anomalies**: unexpected argument shapes reaching a tool, or unusually large/unusual resource payloads returned, both of which can indicate either a schema drift or, in the worst case, a manipulated or compromised server.

~~~python
# Minimal instrumentation sketch around an MCP-mediated tool call.
import time
import logging

logger = logging.getLogger("mcp_calls")

def call_mcp_tool_with_monitoring(client, server_name: str, tool_name: str,
                                    arguments: dict) -> dict:
    start = time.perf_counter()
    try:
        result = client.call_tool(tool_name, arguments)   # SDK-specific call
        status = "success"
    except Exception as exc:                              # noqa: BLE001
        result = {"error": str(exc)}
        status = "error"
    elapsed = time.perf_counter() - start

    logger.info(
        "mcp_tool_call",
        extra={
            "server": server_name,
            "tool": tool_name,
            "status": status,
            "latency_seconds": elapsed,
            "argument_keys": list(arguments.keys()),
        },
    )
    return result
~~~

### MCP-specific things to watch

- A rising per-server error or timeout rate can indicate that specific server has degraded, been deprecated, or changed its underlying backend without a corresponding schema update.
- A schema that changes unexpectedly for a server you did not intentionally update should be treated as a security signal worth investigating, not just a compatibility annoyance, per the supply-chain risk covered in Security.
- A sudden shift in which tools are called for a given task type, across an MCP-mediated tool set, can indicate the same prompt/tool-description regression risk covered in **Agent Fundamentals**, now potentially originating from a server-side change outside your own codebase.
`,

  deployment: `
Deploying an MCP-based feature builds on the deployment concerns already covered in **Agent Fundamentals** (pinned versions, secrets management, timeouts/retries) with configuration specific to which servers a host connects to and how.

### Configuration that must be explicit at deployment time

~~~text
MCP_ALLOWED_SERVERS=filesystem,internal-ticketing,git   # explicit allowlist,
                                   # never "connect to any configured server"
MCP_SERVER_VERSION_PINS={"internal-ticketing": "1.4.2"} # pin, don't float
MCP_CONNECTION_TIMEOUT_SECONDS=10  # per-server connection/handshake timeout
MCP_CALL_TIMEOUT_SECONDS=15        # per tool-call/resource-read timeout
MCP_DISCOVERY_CACHE_TTL_SECONDS=300 # avoid re-discovering on every turn
MCP_HUMAN_APPROVAL_REQUIRED_FOR=create_ticket,delete_record,send_notification
LLM_MODEL=<pinned model version, not "latest">
~~~

Why each choice matters: the server allowlist is the primary defense against connecting to an unvetted or malicious server, exactly analogous to the tool allowlist in **Agent Fundamentals**' deployment guidance; version pins prevent an upstream server update from silently changing tool behavior or schemas underneath a deployed feature; per-connection and per-call timeouts prevent one slow or hung server from stalling an entire agent run; the discovery cache TTL balances catching legitimate schema changes against the cost of re-discovering on every single model turn; the human-approval list gates any MCP-exposed tool with consequential effects, regardless of how confident the model's decision to call it appears.

### Rollout practice specific to MCP features

- **Roll out a newly attached server, or an updated version of an existing one, behind a flag**, and evaluate end-to-end task success and error rates on a representative task set before full rollout -- attaching a new server changes what the model sees as available, with a wider blast radius than a single prompt change.
- **Canary a new or updated server to a small percentage of traffic first**, monitoring per-server connection health and tool-call error rate specifically, before enabling broadly.
- **Keep a fallback path for when a connected server is unreachable or degraded**: a graceful "this capability is temporarily unavailable" response is preferable to the whole agent run failing outright because one attached server timed out.
`,

  "production-checklist": `
Before an MCP-backed feature takes real production traffic:

- [ ] Explicit allowlist of MCP servers this deployment may connect to, not "whatever is configured"
- [ ] Server (and, where applicable, SDK) versions pinned, not tracking "latest"
- [ ] Connection, discovery, and per-call timeouts configured and enforced for every attached server
- [ ] Every third-party or community-published server reviewed (code, or publisher track record) before being connected to a deployment with sensitive access
- [ ] Argument validation implemented inside every server's tool logic, not assumed to be enforced by the connecting client
- [ ] Human-approval gate defined for any MCP-exposed tool with consequential, costly, or irreversible effects
- [ ] Full discovery and invocation trace logged per session (schemas discovered, tools/resources actually used, arguments, results), with privacy-appropriate redaction
- [ ] Credentials held by each server scoped to the minimum required for its exposed tools, not broad backend access "just in case"
- [ ] Discovery-time schema changes monitored and alerted on, treated as a potential security signal, not only a compatibility concern
- [ ] End-to-end task success rate measured on a representative task set that exercises MCP-mediated tool calls, not just directly-integrated ones
- [ ] A fallback path exists for when a connected server is unreachable, degraded, or exceeds its timeout
- [ ] Cross-server capability combinations (sensitive read plus external write, across different servers) explicitly reviewed
- [ ] Considered explicitly whether MCP is the right investment for this integration versus a simpler direct integration -- documented in the design, not just assumed
`,

  "common-mistakes": `
1. **Connecting a host with access to sensitive systems to an unvetted third-party MCP server** without reviewing its code or publisher -- the most consequential and most avoidable MCP-specific security mistake.
2. **Assuming MCP itself provides authentication, authorization, or sandboxing** -- it standardizes message shape and discovery, not security, which remains entirely the server and host implementer's responsibility.
3. **Exposing an entire underlying API surface as MCP tools "for completeness"** rather than curating a small, well-described, task-appropriate set.
4. **No argument validation inside the server**, trusting that a connecting client (or the model behind it) will only ever send well-formed, safe arguments.
5. **Granting an MCP server broader backend credentials than its exposed tools actually need**, so a bug or compromise in the server is more consequential than necessary.
6. **Conflating tools and resources** -- exposing side-effecting operations as resources, or vice versa, which undermines a host's ability to reason about what is safe to invoke automatically versus what needs explicit approval.
7. **Not caching discovery results**, re-listing tools/resources on every model turn and paying unnecessary latency for schemas that rarely change within a session.
8. **Treating "we adopted MCP" as itself a reliability or security improvement**, rather than recognizing that every agent-level failure mode from **Agent Fundamentals** still applies in full to MCP-mediated tool calls.
9. **Building a server that only really works with one specific host's quirks**, defeating the cross-application portability MCP exists to provide.
10. **Debugging from the host's high-level summary alone instead of the raw JSON-RPC request/response** -- the actual bug is often only visible at the protocol level.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Host reports a tool as "not found" even though the server defines it | Discovery happened before the server finished registering the tool, or the client connected to the wrong server/version | Check connection and initialization ordering; confirm the client is actually connected to the intended server |
| Tool call appears to silently do nothing | Argument translation mismatch between the MCP schema and the host's underlying model-provider tool-calling format | Log the raw call_tool request/response; verify the host's schema-translation layer against the actual advertised schema |
| Server behavior changes unexpectedly after no intentional deployment change | An upstream server dependency (or the server itself, if not version-pinned) was updated silently | Pin server and dependency versions; monitor for unexpected schema changes at connection time |
| Connection to a remote MCP server intermittently times out | Network-level latency/instability, or the server's own capacity is exceeded under concurrent load | Add explicit connection and call timeouts with retry/backoff; check the server's own scaling and capacity |
| A stdio-based local server appears "hung" | The subprocess crashed or is blocked, and the host has no timeout to detect this | Add a connection/call timeout at the host; check subprocess exit codes and logs directly |
| Two attached servers expose identically-named tools, and the wrong one is called | No namespacing/disambiguation implemented by the host across multiple connected servers | Namespace tool names by server at the host level, or restrict which servers' tools are offered per task |
| Model uses a tool in an unsafe or unintended way despite a seemingly clear description | The server's advertised description is ambiguous, or the server itself is misrepresenting its own tool (possible compromise) | Tighten the tool description; if the description looks correct but behavior is wrong, treat as a possible security incident, not just a prompt issue |
| Argument validation error surfaces only as a generic protocol-level failure | The server does not return a well-formed, descriptive error for invalid arguments | Have the server implementation catch validation failures and return a clear, parseable error string/object, not an uncaught exception |
`,

  faqs: `
**Q: Is MCP a replacement for function calling / tool calling?**
No. MCP assumes an underlying provider-native tool-calling mechanism already exists (see **Tool Calling**) and standardizes how tools (and resources and prompts) are discovered and transported between a server and a host application. The model's own decision to call a tool still works exactly the same way whether the tool was integrated directly or sourced via MCP.

**Q: Is the "USB-C for AI" comparison accurate?**
It is a useful framing for the shape of the problem MCP solves (avoiding an M-times-N integration explosion), but it should be hedged, not taken literally -- unlike a physical connector, MCP's primitives carry semantic meaning a connecting client must correctly interpret, and the analogy can mislead if pushed into claiming more uniformity or interchangeability than the protocol actually provides.

**Q: Does using MCP make my agent more secure?**
Not by itself, and in some respects it introduces new risk -- an MCP server, especially a third-party one, is a new piece of code and a new trust relationship. MCP does not add authentication, sandboxing, or argument validation for you; all of that remains the server and host implementer's responsibility, exactly as covered in Security above.

**Q: What's the difference between a tool and a resource in MCP?**
A tool is a model-invokable function, generally expected to perform an action or computation (potentially with side effects); a resource is readable, addressable data meant to be fetched into context, conceptually closer to a GET request, generally expected to be side-effect-free. This distinction matters for both design clarity and security, since a host may treat resources as safer to fetch automatically than tools are to invoke automatically.

**Q: Can one host connect to multiple MCP servers at once?**
Yes, and this is a common pattern -- a host maintains one MCP client per connected server, and is responsible for merging, namespacing, and scoping the union of all connected servers' capabilities before presenting them to the model.

**Q: How mature is MCP -- should I build on it today?**
As of this page's knowledge cutoff, MCP has real, growing adoption, especially for developer-tool integrations (such as **Claude Code**), but it remains a genuinely young and actively evolving specification. Build on it where the interoperability benefit clearly outweighs a simpler direct integration for your specific use case, and verify current adoption, transport support, and SDK stability against the official specification and current release notes rather than assuming permanence.

**Q: Where do I go next after this page?**
If your priority is the underlying tool-calling mechanics MCP builds on, revisit **Tool Calling**; if it's the broader agent loop MCP-exposed tools plug into, revisit **Agent Fundamentals**; if it's securing an MCP deployment, go to **Guardrails**; if it's a concrete host application that consumes MCP servers, go to **Claude Code** or the **OpenAI Agents SDK**.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is MCP, in one sentence?* An open, JSON-RPC-based protocol that standardizes how host applications discover and invoke tools, resources, and prompts exposed by external MCP servers, so integrations built once can be reused across any compatible client.
2. *What are the three core MCP primitives?* Tools (invokable, often side-effecting functions), resources (readable, addressable data), and prompts (reusable, parameterized prompt templates).
3. *What problem does MCP actually solve?* The "M times N" integration problem -- without a standard, every pairing of AI application and external tool/data source needs its own bespoke integration; MCP lets one server be attached to any compliant client.
4. *What is the relationship between a host application, an MCP client, and an MCP server?* The host is the user-facing application; the MCP client is the component inside it managing a connection to one server; the server exposes the actual tools/resources/prompts and implements their logic.
5. *Does MCP replace function/tool calling?* No -- MCP assumes an underlying provider-native tool-calling mechanism already exists and standardizes discovery and transport around it, not the model's own decision-making mechanism.

**Senior:**

6. *Why is "an MCP server is a new attack surface" a precise, not just cautious, statement?* Because a connected server (especially third-party) can influence the host's model in two distinct ways: through the schema and description it advertises during discovery (which shapes when/how the model decides to call a tool) and through the actual results it returns during invocation (classic prompt-injection risk) -- both are attacker-controllable if the server is malicious or compromised, and neither is mitigated by the protocol itself.
7. *How would you evaluate whether to build an MCP server for a new integration versus a direct, bespoke integration?* Weigh the cross-application reuse value (is this capability likely to be consumed by more than one host application or team) against the added engineering cost of protocol compliance, versioning, and the new trust-boundary considerations -- for a single, tightly-scoped internal use case with one consuming application, a direct integration may be simpler and equally effective.
8. *How does capability negotiation during MCP's initialization handshake support the protocol's fast-evolving nature?* Client and server declare which protocol version and optional capabilities each supports, allowing an older client to connect to a newer server (and vice versa) by negotiating down to their common feature set, rather than requiring every client and server to be on the exact same version to interoperate.
9. *A team wants to connect their production agent to a community-published MCP server they found in a registry. What do you tell them?* Treat it as a new, unaudited code dependency with the ability to see whatever context flows to it and to return whatever content it wants into the model's context -- review its code or the publisher's track record, scope its backend credentials to the minimum needed, and consider sandboxing it away from any deployment with access to sensitive systems before connecting it broadly.
10. *Explain the tradeoff between local (stdio) and remote (HTTP-based) MCP server deployment.* Stdio is simple, has minimal latency, and needs no network-level authentication, but only works for a locally-launched process on the same machine as the host, making it well suited to single-developer tool use; remote deployment supports sharing a server across many users/hosts but introduces real network latency, authentication, and multi-tenancy concerns that a local server does not need to address at all.
11. *How would you design guardrails for an MCP-exposed tool that can delete records in a production database?* Discuss tight backend credential scoping for the server itself, in-server argument validation, an explicit human-approval gate for that specific tool at the host level, hard timeouts, full request/response logging for incident reconstruction, and treating that server's connection as requiring elevated review given the destructive capability it exposes.
12. *How would you debug a production issue where an MCP-mediated tool call started failing after no apparent deployment change on your side?* Check whether the connected server itself was updated or its dependencies changed (since it may not be version-pinned), inspect the raw discovery response for a schema drift, and check whether the server's own backend or credentials changed -- distinguishing a host-side regression from an upstream server-side change is the key diagnostic step.
`,

  "coding-questions": `
### 1. Build a minimal MCP server exposing one tool and one resource

~~~python
# A slightly fuller version of the beginner example: one tool (with side
# effect potential in a real system) and one resource (read-only),
# demonstrating the deliberate tool/resource distinction from Best Practices.
from mcp.server.fastmcp import FastMCP

mcp_server = FastMCP("ticket-server")

_FAKE_TICKETS = {
    "1001": {"status": "open", "assignee": "alice"},
    "1002": {"status": "closed", "assignee": "bob"},
}

@mcp_server.tool()
def update_ticket_status(ticket_id: str, new_status: str) -> str:
    """Update a ticket's status. This is a side-effecting operation and
    should be scoped and, in production, gated behind human approval for
    any deployment where tickets have real operational consequences."""
    if ticket_id not in _FAKE_TICKETS:
        return f"error: unknown ticket_id {ticket_id}"
    allowed_statuses = {"open", "in_progress", "closed"}
    if new_status not in allowed_statuses:
        # Argument validation happens inside the server -- never trust
        # that a connecting client only ever sends well-formed input.
        return f"error: new_status must be one of {sorted(allowed_statuses)}"
    _FAKE_TICKETS[ticket_id]["status"] = new_status
    return f"ticket {ticket_id} updated to {new_status}"

@mcp_server.resource("ticket://{ticket_id}")
def get_ticket_resource(ticket_id: str) -> str:
    """Read-only resource -- fetching this has no side effects, unlike
    the update_ticket_status tool above."""
    ticket = _FAKE_TICKETS.get(ticket_id)
    if ticket is None:
        return f"error: unknown ticket_id {ticket_id}"
    return f"ticket {ticket_id}: status={ticket['status']}, assignee={ticket['assignee']}"

if __name__ == "__main__":
    mcp_server.run()
~~~

Complexity: O(1) per tool call/resource read in this toy example, dominated in a real system by the underlying backend call's own latency. Follow-ups: add a human-approval gate before update_ticket_status actually mutates state in a production version; add structured logging of every call for later audit.

### 2. Write a discovery-contract test for a server's advertised tool schema

~~~python
def test_update_ticket_status_schema_matches_implementation():
    # A discovery-contract test: the schema a server advertises is what
    # every connecting host's model will rely on to decide when and how
    # to call this tool -- a mismatch here silently misleads every client.
    tools = list_registered_tools(mcp_server)   # SDK-specific test helper
    tool = next(t for t in tools if t.name == "update_ticket_status")

    assert "ticket_id" in tool.input_schema["properties"]
    assert "new_status" in tool.input_schema["properties"]
    assert tool.description, "every tool must ship a non-empty description"

    # Confirm the implementation actually rejects what the schema implies
    # should be invalid, closing the gap between "advertised" and "real".
    result = update_ticket_status("1001", "not_a_real_status")
    assert result.startswith("error:")
~~~

Complexity: O(1) per test. Follow-ups: extend to a property-based test that generates random argument combinations and asserts the server never raises an uncaught exception, only well-formed error strings/objects.

### 3. Implement a per-server allowlist and timeout wrapper for a host's MCP client calls

~~~python
import time

class McpCallNotAllowed(Exception):
    pass

class McpCallTimeout(Exception):
    pass

def call_mcp_tool_guarded(client, server_name: str, tool_name: str,
                           arguments: dict, allowed_servers: set[str],
                           timeout_seconds: float = 10.0) -> dict:
    """Host-side guardrail wrapper around an MCP tool call: enforces an
    explicit server allowlist and a hard timeout, exactly the kind of
    guardrail recommended in Best Practices and Production Checklist."""
    if server_name not in allowed_servers:
        raise McpCallNotAllowed(f"server {server_name} is not on the allowlist")

    start = time.perf_counter()
    try:
        result = client.call_tool(tool_name, arguments, timeout=timeout_seconds)
    except TimeoutError as exc:
        raise McpCallTimeout(f"{tool_name} on {server_name} timed out") from exc
    elapsed = time.perf_counter() - start

    if elapsed > timeout_seconds:
        # Defense in depth, in case the underlying client library does
        # not itself enforce the timeout strictly.
        raise McpCallTimeout(f"{tool_name} on {server_name} exceeded {timeout_seconds}s")

    return result
~~~

Complexity: O(1) overhead per call beyond the underlying MCP round trip itself. Follow-ups: add retry-with-backoff for transient network errors specifically (not for validation errors, which will not succeed on retry); add per-server rate limiting alongside the allowlist check.
`,

  "hands-on-labs": `
### Lab 1 -- Build and connect a minimal MCP server (beginner, ~1.5h)
Using the official Python or TypeScript MCP SDK, build a minimal server exposing exactly one tool and one resource (following the pattern in Beginner Concepts and Coding Questions #1), and connect it to a compatible host application (such as **Claude Code**, if available, or a minimal test client using the SDK directly). Deliverable: a working server plus a short transcript showing a successful discovery-then-invocation round trip. Skills exercised: the core tool/resource primitive distinction, the basic connection lifecycle.

### Lab 2 -- Discovery-contract and argument-validation testing (beginner/intermediate, ~1h)
Write a test suite for Lab 1's server asserting the advertised schema matches the implementation's actual expectations, and that malformed arguments produce a well-formed error rather than an uncaught exception (see Testing and Coding Questions #2). Deliverable: a passing test suite plus one deliberately broken schema/implementation mismatch you introduced and then caught with your own tests. Skills exercised: MCP-specific testing discipline, the gap between "advertised" and "real" behavior.

### Lab 3 -- Guardrailed host-side MCP client wrapper (intermediate, ~2.5h)
Building on Coding Questions #3, implement a host-side wrapper around MCP tool calls that enforces an explicit server allowlist, per-call timeouts, and argument logging, then connect it to at least two servers (your own from Lab 1, plus a second reference/community server). Deliverable: a tested wrapper module plus a demonstration of the allowlist and timeout actually firing against a deliberately disallowed server and a deliberately slow call. Skills exercised: production guardrail design specific to MCP, treating each server as an independent fallible dependency.

### Lab 4 -- End-to-end MCP-mediated agent with human-approval gate (production, ~3.5-4h)
Build a small agent (using the perceive-plan-act-observe loop from **Agent Fundamentals**) that connects to at least one MCP server exposing a side-effecting tool (for example, a simulated ticket-status-update tool), with a human-approval step required before that tool actually executes, full discovery-and-invocation trace logging, and a small evaluation script measuring end-to-end task success across at least ten representative tasks. Deliverable: a running service, an evaluation report, and a short incident-response note describing what you'd check first if a specific server's error rate spiked. Skills exercised: the full production-usage picture this page covers, tied together with the broader agent-production discipline from **Agent Fundamentals**.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate MCP mastery (each also reaches into a sibling skill):

1. **A well-scoped internal-tool MCP server with tiered permissions** -- An MCP server exposing a small, curated set of read tools and one deliberately narrow write tool for a simulated internal system (e.g. a ticketing or inventory system), with in-server argument validation, scoped backend credentials, and a human-approval flag surfaced to the connecting host for the write tool. Demonstrates: the tool/resource design discipline and security-scoping practice covered in Best Practices and Security -- directly relevant to the **Tool Calling** and **Guardrails** skills.

2. **A multi-server host-side orchestration layer** -- A small host application that connects to at least three distinct MCP servers (your own plus at least one reference/community server), implementing namespacing/disambiguation for overlapping tool names, an explicit per-deployment server allowlist, per-server timeout and error handling, and monitoring dashboards for per-server health. Demonstrates: the host-side architectural concerns from Architecture and Scalability, made concrete and measurable.

3. **A security-reviewed community MCP server evaluation** -- Pick two or three real, publicly available community MCP servers, perform a structured security review of each (code review if open-source, credential-scope analysis, argument-validation audit), and write up a comparative risk assessment with a recommendation on which (if any) you would connect to a production deployment with access to sensitive systems. Demonstrates: the security-evaluation discipline this page treats as essential given MCP's supply-chain and trust-boundary risks -- bridges directly into the **Guardrails** skill.

Each project should include: explicit logging of the full discovery-and-invocation trace, a documented rationale for which capabilities were exposed as tools versus resources and why, a measured latency/error-rate breakdown per connected server (not an aggregate number), and a written security review covering at minimum credential scoping and argument validation -- the engineering discipline around trust boundaries and protocol correctness is what distinguishes a fundamentals-level demo from a portfolio-grade MCP project.
`,

  "case-studies": `
### Coding assistants as the proving ground for MCP adoption
Developer-facing coding assistants and IDE integrations (including **Claude Code**) were among the earliest and most widely adopted MCP host applications, largely because developers were already comfortable running local processes and configuring tool access explicitly, and because the risk profile of a local, developer-controlled MCP server is lower than a broadly deployed, end-user-facing one. Lesson: MCP's initial traction concentrated where the trust model was simplest (a developer running their own local servers on their own machine), not where the protocol's theoretical reach is largest -- a useful reminder that a new integration standard's early adoption pattern often reflects where trust and risk are easiest to manage, not necessarily where the eventual steady-state usage will be.

### The emergence of community server registries, and the trust questions that followed
As community interest in MCP grew, directories and registries of community-published servers emerged quickly, covering a wide range of developer tools and SaaS products. This rapid growth surfaced, just as quickly, the exact trust and supply-chain concerns covered in Security: not every published server had been reviewed with the rigor its potential access (to a connecting host's context, and to whatever backend system it wraps) would warrant. Lesson: an open, low-friction protocol for publishing and sharing integrations reproduces the same supply-chain trust problem seen in other package ecosystems (language package registries, browser extension stores), and needs the same maturing security tooling (scanning, review processes, reputation systems) those ecosystems eventually developed -- MCP's server ecosystem was, at the time of writing, still earlier in that maturation curve than more established package ecosystems.

### Standardizing prompts alongside tools, not just tools
Some early MCP adopters focused narrowly on the tool primitive (since it maps most directly onto the tool-calling concept already familiar from **Tool Calling**), initially underusing the resource and prompt primitives. Teams that did invest in exposing well-designed prompts (curated, parameterized templates for common tasks specific to their domain) found this let non-AI-specialist users of a connecting host benefit from carefully engineered prompts without needing to write or understand prompt engineering themselves. Lesson: MCP's value is not only in exposing callable actions -- exposing curated context (resources) and curated instructions (prompts) can be just as valuable, and are easy to underuse if a team's mental model of MCP is "just a new way to do tool calling."

### Version negotiation mattering in practice, not just in theory
As the MCP specification itself evolved through multiple revisions, host applications and servers built against different points in that evolution needed to interoperate in practice, not just in principle -- teams that had assumed a fixed protocol version, rather than implementing the capability-negotiation handshake robustly, ran into real compatibility breakage as the ecosystem moved forward. Lesson: for a protocol as young and actively evolving as MCP was at the time of writing, investing in robust version/capability negotiation is not defensive over-engineering -- it is a realistic response to how quickly a young, actively-developed specification actually changes.
`,

  comparisons: `
| Dimension | Bespoke per-application integration | Provider-native function/tool calling alone | MCP |
|---|---|---|---|
| What it standardizes | Nothing -- fully custom per pairing | The shape of a single tool-call request/response with one model provider | Discovery, description, and transport of tools/resources/prompts across any compatible client and server |
| Reuse across host applications | None -- rebuilt per application | Partial -- tool schema conventions are provider-specific, not cross-application | High, by design -- one server, many compatible clients |
| Replaces the model's own tool-call decision mechanism | No | This IS that mechanism | No -- relies on the host's underlying provider-native tool calling |
| Adds a new trust boundary/attack surface | Only whatever the custom code introduces | Same LLM-security surface as any tool-using system | Yes, specifically -- a connected server (especially third-party) is new, potentially unaudited code with access to context flowing through it |
| Maturity/adoption at time of writing | Universal (the default before any standard) | Mature, broadly supported across major providers | Newer, growing, especially strong for developer-tool integrations; verify current adoption before assuming universality |
| Best for | A single, tightly-scoped, one-off integration where reuse across other applications is genuinely unlikely | Any tool-using system, MCP or not -- this is the underlying mechanism MCP itself depends on | Integrations likely to be consumed by more than one host application, or where a broader ecosystem of pre-built servers already covers your need |

**How seniors choose**: reach for a bespoke direct integration when a capability is genuinely single-application and unlikely to be reused elsewhere, since MCP's protocol-compliance and versioning overhead is not free; reach for MCP specifically when cross-application reuse is plausible, when a well-maintained community or vendor server already exists for what you need, or when you want your own integration to be consumable by host applications you do not control today but might want to support later. In all cases, remember that MCP sits on top of, not instead of, ordinary provider-native tool calling -- adopting MCP does not remove the need to understand and engineer the underlying tool-calling mechanics from **Tool Calling**.
`,

  "related-technologies": `
- **Agent Fundamentals** -- the perceive-plan-act-observe loop that MCP-exposed tools plug into; read this first if you have not already, since MCP assumes this loop as the context in which its tools are actually used.
- **Tool Calling** -- the underlying provider-native mechanism by which a model actually decides to invoke a tool; MCP standardizes discovery and transport around this mechanism, not the mechanism itself.
- **Prompt Engineering** -- directly relevant to MCP's prompt primitive, since a well-designed MCP prompt template is, underneath, an application of the same prompt-engineering discipline, packaged for reuse across host applications.
- **Claude Code** -- a concrete, widely used host application with native MCP client support; a natural place to see the concepts on this page applied in a real developer tool.
- **OpenAI Agents SDK** -- another concrete host/agent-framework context in which MCP client support can be used, illustrating the protocol's cross-vendor interoperability goal.
- **Guardrails** -- the general discipline of validating and constraining what an AI system is allowed to do; Security on this page is a specialized application of that discipline to the MCP-specific trust boundary of a connected server.
- **LangChain** and **LangGraph** -- agent orchestration frameworks that have added MCP client support, letting agents built on those frameworks consume MCP servers alongside or instead of directly-integrated tools.
- **RAG** -- resources, MCP's read-only data primitive, are conceptually adjacent to retrieval in a RAG system; an MCP resource is one way a host might source content that ends up serving a retrieval-like role in context.

On this platform, the natural path from here: **MCP** builds directly on **Tool Calling** and **Agent Fundamentals**, and connects forward into a specific host/framework (**Claude Code**, the **OpenAI Agents SDK**, **LangChain**, **LangGraph**) once you know which application you are building or extending, and into **Guardrails** once you are ready to secure a real MCP deployment.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 -- check the official MCP specification and current SDK release notes for anything more current, since this is one of the youngest and fastest-moving protocols on the platform.

- MCP adoption has grown meaningfully among developer-facing tools and IDEs (including **Claude Code**), and a number of vendors and platforms beyond Anthropic have added MCP client or server support -- but breadth of adoption across the wider AI application landscape should still be re-verified rather than assumed universal.
- Transport support has broadened from the original local stdio-focused approach toward remote, HTTP-based options, with ongoing refinement of the recommended patterns for authentication and streaming over those transports -- check the current specification for the transport conventions considered current, since this has been an area of active revision.
- Community and vendor-maintained registries/directories of MCP servers have continued to grow, alongside emerging tooling (security scanners, testing harnesses) aimed at the trust and supply-chain concerns covered in Security -- the maturity of this surrounding tooling ecosystem is still catching up to the protocol's own growth and should be evaluated server by server, not assumed uniformly solid.
- The specification itself continues to be revised in the open, with capability negotiation during initialization specifically intended to smooth over version differences between clients and servers built at different points in that evolution -- do not assume any specific message field or SDK method signature described on this page is permanent; check current documentation before shipping against it.
- Given how young this protocol is relative to, for example, provider-native function calling, treat any specific adoption statistic, benchmark, or "the standard everyone uses" claim you encounter about MCP -- on this page or elsewhere -- as a snapshot to re-verify, not a settled fact.
`,

  "future-roadmap": `
Where the MCP picture is heading, and what is worth betting career time on:

1. **The underlying problem MCP addresses -- the M-times-N integration cost of connecting many AI applications to many tools and data sources -- is a durable, structural problem** that will remain relevant regardless of whether MCP specifically remains the dominant standard for solving it; understanding that problem shape is a better long-term investment than memorizing MCP's current message formats alone.
2. **Security and trust tooling around MCP servers (scanning, review processes, reputation systems, sandboxing) is likely to mature significantly**, following the same trajectory earlier package ecosystems went through -- betting on skills in evaluating and securing third-party integrations is likely to age well regardless of which specific tooling ecosystem ends up dominant.
3. **Remote, multi-tenant MCP deployment patterns are likely to mature and standardize further**, given how much of current adoption still concentrates on simpler local, developer-facing use cases -- expect continued evolution in authentication, authorization, and multi-tenancy conventions for shared servers.
4. **Whether MCP specifically remains the dominant standard, converges with competing approaches, or is superseded by a successor protocol is genuinely uncertain** at the time of writing -- this page will not assert permanence for the protocol itself, only for the underlying architectural pattern (separating discovery/transport standardization from the underlying tool-calling mechanism) it demonstrates.
5. **The core skill of designing good tools, resources, and prompts -- clear descriptions, tight scoping, careful security boundaries -- outlives any specific protocol**, MCP included; this is the same durable lesson emphasized in **Tool Calling** and **Agent Fundamentals**, and remains the highest-leverage investment even as the specific standardization layer around it continues to evolve.

For your career: the highest-leverage, most durable skill from this page is the discipline of evaluating trust boundaries and integration costs honestly -- knowing when a standard protocol like MCP is worth adopting, and when a simpler, direct integration is the more appropriate engineering choice -- rather than treating either extreme as a default.
`,

  "cheat-sheet": `
~~~text
# --- Core definition ---
MCP (Model Context Protocol) = an open, JSON-RPC-based protocol
standardizing how host applications discover and invoke tools,
resources, and prompts exposed by external MCP servers.
Does NOT replace provider-native tool calling -- it standardizes
discovery/transport built on top of that existing mechanism.

# --- Architecture ---
Host application  : user-facing app embedding an LLM (chat client,
                     Claude Code, custom agent)
MCP client         : component inside the host managing one connection
                     to one server (usually SDK-provided)
MCP server         : exposes tools/resources/prompts, implements logic
One host can hold multiple MCP clients, one per connected server.

# --- The three primitives ---
Tool     : invokable, often side-effecting function
             e.g. create_ticket(title, description)
Resource : readable, addressable data, no side effects
             e.g. ticket://12345
Prompt   : reusable, parameterized prompt template
             e.g. summarize_ticket_thread(ticket_id)

# --- Connection lifecycle ---
1. Connect      (stdio subprocess, or remote/HTTP)
2. Initialize   (negotiate protocol version + capabilities)
3. Discover     (list_tools / list_resources / list_prompts)
4. Translate    (host maps MCP schema -> its model's tool-call format)
5. Invoke       (call_tool JSON-RPC request/response)
6. Observe      (result fed back into the agent loop, per Agent Fundamentals)

# --- Why it exists ---
Without MCP: (# applications) x (# tools/data sources) bespoke integrations
With MCP:    one server per system, any compatible client can attach
"USB-C for AI" -- a useful ONE framing, not a precise technical claim.

# --- Minimal server (Python, FastMCP) ---
from mcp.server.fastmcp import FastMCP
mcp_server = FastMCP("weather-server")

@mcp_server.tool()
def get_weather(city: str) -> str:
    return lookup(city)  # validate + handle errors for real

if __name__ == "__main__":
    mcp_server.run()

# --- Security (MCP is a new attack surface) ---
Malicious/compromised server  : manipulated results AND manipulated
                                 tool descriptions (discovery-time risk too)
Over-broad server credentials : scope to minimum needed, always
Supply-chain risk              : third-party servers = new code dependency
Unvalidated arguments          : validate INSIDE the server, never trust caller
Cross-server exfiltration      : sensitive-read + external-write combo = review

# --- Production musts ---
Explicit server allowlist, never "whatever is configured."
Pin server + SDK versions, not "latest."
Timeout every connection, discovery, and call.
Cache discovery results per session (schemas rarely change mid-session).
Human-approval gate for consequential/irreversible MCP tools.
Log full discovery + invocation trace, not just final output.

# --- Sibling skills map ---
Tool Calling      -> the underlying mechanism MCP transports/discovers
Agent Fundamentals-> the loop MCP-exposed tools plug into
Claude Code       -> a concrete MCP host application
OpenAI Agents SDK -> another concrete MCP-capable host/framework
Guardrails        -> securing an MCP deployment specifically
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is MCP, mechanically? | An open, JSON-RPC-based protocol standardizing how host applications discover and invoke tools, resources, and prompts exposed by external MCP servers |
| What are MCP's three core primitives? | Tools (invokable functions), resources (readable data), prompts (reusable templates) |
| Does MCP replace function/tool calling? | No -- it assumes an underlying provider-native tool-calling mechanism already exists and standardizes discovery/transport around it |
| What problem does MCP solve? | The "M times N" integration problem -- bespoke integration code needed for every pairing of AI application and external system |
| What is a host, an MCP client, and an MCP server? | Host = user-facing app; MCP client = connection-managing component inside the host; MCP server = exposes tools/resources/prompts and implements their logic |
| What's the difference between a tool and a resource? | A tool is invokable and often side-effecting; a resource is readable, addressable data expected to be side-effect-free |
| What are the steps of one MCP session, in order? | Connect, initialize (negotiate capabilities), discover, translate schema, invoke, observe result |
| Why is "USB-C for AI" a hedged analogy? | Useful for the shape of the M-times-N problem MCP solves, but MCP's primitives carry semantic meaning a client must interpret, unlike a physical connector |
| Why is an MCP server a new attack surface? | It can be third-party code with access to context flowing through it, and can misrepresent both its tool descriptions (discovery-time) and its results (invocation-time) if malicious or compromised |
| What must be validated inside every MCP server? | Tool call arguments -- never trust that a connecting client or the model behind it sent safe input |
| What transport did MCP originally emphasize, and what has it since gained? | Local stdio (subprocess) originally; remote, HTTP-based transports have since broadened support, with authentication conventions still evolving |
| What should a host do about capability negotiation? | Exchange protocol version and supported capabilities during initialization, so older/newer clients and servers can still interoperate on their common feature set |
| What is the single highest-leverage security defense for a third-party MCP server? | Review its code (or publisher track record) and scope its backend credentials to the minimum needed before connecting it to anything sensitive |
| Which skill covers the underlying tool-calling mechanism MCP builds on? | Tool Calling |
| Which skill covers the loop that MCP-exposed tools plug into? | Agent Fundamentals |
`,

  mcqs: `
**1. What best defines MCP as covered on this page?**

A) A new model architecture for reasoning about tools  B) An open protocol standardizing how host applications discover and invoke tools, resources, and prompts exposed by external servers  C) A replacement for provider-native function calling  D) A specific vendor's proprietary chat interface

**Answer: B** -- MCP standardizes discovery and transport around an existing tool-calling mechanism; it is not a new reasoning architecture or a proprietary interface.

**2. Which of the following is NOT one of MCP's three core primitives?**

A) Tools  B) Resources  C) Prompts  D) Agents

**Answer: D** -- Tools, resources, and prompts are the three MCP primitives; "agent" is a concept from Agent Fundamentals that sits above MCP, not one of its primitives.

**3. Why should the "USB-C for AI" analogy be hedged rather than taken literally?**

A) MCP has nothing to do with connecting different systems  B) MCP's primitives carry semantic meaning a connecting client must correctly interpret, unlike a largely capability-agnostic physical connector  C) USB-C is faster than any network protocol  D) The analogy is entirely inaccurate and should never be used

**Answer: B** -- it is a useful framing for the integration-cost problem MCP solves, but MCP's tools/resources/prompts require semantic interpretation in a way a physical connector standard does not, so it should be presented as one useful framing, not gospel.

**4. What is the primary security implication of connecting a host application to a third-party MCP server?**

A) There is no additional risk beyond using any other tool  B) The server can influence the model both through its advertised tool/resource descriptions at discovery time and through its returned results at invocation time, and it may be unaudited code  C) MCP servers cannot access any sensitive data by design  D) Only the host application's own code can ever be a security risk

**Answer: B** -- a connected server introduces a new trust relationship at both the discovery and invocation stages, and third-party servers carry the same supply-chain risk as any other new code dependency.

**5. What does MCP standardize, and what does it explicitly NOT replace?**

A) It standardizes model reasoning quality; it does not replace tool descriptions  B) It standardizes discovery and transport of tools/resources/prompts; it does not replace the underlying provider-native tool-calling mechanism the model relies on to decide when to call a tool  C) It standardizes pricing across model providers; it does not replace authentication  D) It standardizes prompt engineering technique; it does not replace agent memory

**Answer: B** -- this is the central relationship to understand between MCP and Tool Calling/Agent Fundamentals.

**6. When is building a dedicated MCP server the better engineering choice over a simple, bespoke direct integration?**

A) Always -- MCP is strictly superior in every case  B) Never -- direct integrations are always simpler and should always be preferred  C) When the capability is plausibly reusable across more than one host application, or a well-maintained community/vendor server already exists for the need  D) Only when the underlying system has no API of its own

**Answer: C** -- see Comparisons: MCP's protocol-compliance and versioning overhead is worth paying specifically when cross-application reuse or ecosystem leverage is real, not as a default for every integration.
`,

  "revision-notes": `
**What MCP is, in five lines:** MCP (Model Context Protocol) is an open, JSON-RPC-based protocol standardizing how host applications discover and invoke tools, resources, and prompts exposed by external MCP servers. A host embeds one MCP client per connected server; the server exposes capabilities and implements their logic. MCP explicitly does not replace the underlying provider-native tool-calling mechanism a model uses to decide when to call a tool (see **Tool Calling**) -- it standardizes the discovery and transport layer built around that existing mechanism, solving the "M times N" bespoke-integration problem that otherwise grows with every new pairing of AI application and external system.

**The three primitives, in three lines:** Tools are invokable, often side-effecting functions; resources are readable, addressable data meant to be fetched into context with no side effects; prompts are reusable, parameterized templates a host can surface to users or inject into a conversation. Keeping tools and resources deliberately distinct (rather than exposing everything as a tool) has real design and security implications, since a host can reason differently about what is safe to fetch automatically versus what needs explicit approval to invoke.

**The connection lifecycle, in three lines:** A session connects (locally over stdio, or remotely over HTTP), performs an initialization handshake negotiating protocol version and capabilities, then the client discovers what the server offers before ever invoking a specific tool, reading a resource, or fetching a prompt. The model itself is never directly MCP-aware; it only sees a tool schema the host translated from what the server advertised, and the host routes the model's eventual tool-call request back to the right server via a JSON-RPC call.

**Security, in four lines:** An MCP server is a genuinely new attack surface, especially any third-party or community-published one -- it can misrepresent its own tool descriptions at discovery time and return manipulated results at invocation time, and it is ordinary code subject to the same supply-chain risks as any other dependency. Defenses mirror general agent security discipline (validate arguments inside the server, scope credentials to the minimum needed, treat outputs as untrusted data, log everything) with an added emphasis on vetting and allowlisting which servers a deployment is permitted to connect to at all.

**Where MCP sits in the bigger picture, in three lines:** MCP builds directly on **Tool Calling** and plugs into the perceive-plan-act-observe loop from **Agent Fundamentals**; it is consumed concretely by host applications like **Claude Code** and frameworks like the **OpenAI Agents SDK**, and secured using the general discipline in **Guardrails**. Adopting MCP does not remove the need to understand and engineer the underlying tool-calling mechanics, agent-level failure modes, or security fundamentals those sibling skills cover -- it adds a standardization layer on top of them, not a substitute for them.
`,

  "learning-roadmap": `
A realistic path through MCP and into the sibling skills (adjust pace to your background):

**Week 1 -- Prerequisites check.** If you have not already, work through **Agent Fundamentals** and specifically the **Tool Calling** skill's treatment of provider-native function calling -- this page assumes both without re-deriving them. Milestone: you can explain how a model decides to call a tool and how the result is fed back into the loop, independent of any protocol standardizing that process.

**Week 2 -- Core concepts and a first server.** Beginner and Intermediate Concepts sections here; run Lab 1 (build and connect a minimal MCP server). Milestone: you can explain the tool/resource/prompt distinction and have a working, connectable server exposing at least one of each.

**Week 3 -- Protocol mechanics and testing.** Internal Working, Architecture, Data Flow, and Testing sections; run Lab 2 (discovery-contract and argument-validation testing). Milestone: you can trace one tool call through the full connect-initialize-discover-invoke-observe lifecycle and explain what each step is responsible for.

**Week 4 -- Security and production discipline.** Security through Production Checklist sections; run Lab 3 (guardrailed host-side MCP client wrapper). Milestone: a working client-side wrapper enforcing a server allowlist, timeouts, and logging, plus a completed security review of at least one third-party server.

**Week 5 -- End-to-end production system.** Anti-Patterns, Common Mistakes, Debugging, Monitoring sections; run Lab 4 (end-to-end MCP-mediated agent with human-approval gate). Milestone: a deployed, monitored MCP-mediated agent with a documented incident-response note.

**Week 6 onward -- Branch based on your immediate need**: go back to **Tool Calling** if your priority is designing better tool descriptions and argument schemas generally; go to **Claude Code** or the **OpenAI Agents SDK** if you need to build a concrete host application that consumes MCP servers; go to **Guardrails** if securing a broader MCP deployment (beyond a single server) is your next concern. Most engineers should treat MCP as a natural extension of Tool Calling and Agent Fundamentals rather than a wholly separate discipline -- the protocol mechanics here are additive to, not a substitute for, the concepts those sibling skills already cover.
`,

  "official-docs": `
- The Model Context Protocol specification and reference documentation -- the authoritative source for the current protocol shape (message formats, transports, capability negotiation), and the source of truth over this page whenever the two appear to disagree, given how actively the specification continues to evolve.
- The official MCP SDKs' documentation (Python, TypeScript, and any other officially maintained language SDKs) -- the ground truth for current decorator/method names and idioms (such as the FastMCP-style interface used in this page's examples), since these are exactly the kind of detail that changes between SDK releases.
- **Claude Code**'s own documentation on configuring and connecting MCP servers -- a concrete, practical reference for how one widely used host application implements the client side of the protocol.
- Provider and framework documentation for other MCP-capable hosts (the **OpenAI Agents SDK**, **LangChain**, **LangGraph**, and others) -- each sibling skill on this platform links to and builds on the respective host/framework's official docs for implementation-level detail beyond this page's protocol-focused scope.
`,

  books: `
- There is, as of this page's knowledge cutoff, no long-established, canonical book specifically on MCP, reflecting how young the protocol is -- treat the official specification and SDK documentation (see Official Documentation) as the primary source, not a book.
- **Designing Machine Learning Systems** -- Chip Huyen. Not MCP-specific, but the production-systems framing (monitoring, reliability engineering, treating external dependencies as fallible) generalizes directly to the operational concerns this page raises about connected MCP servers.
- **Building Machine Learning Powered Applications** -- Emmanuel Ameisen. Useful general background on integrating ML/LLM-backed capabilities into real applications, a helpful companion to the host-application-architecture concerns covered in this page's Architecture section.
- General API design and RPC-protocol references (any solid treatment of JSON-RPC or REST API design) -- useful background for understanding the wire-level conventions MCP builds on, even though none are MCP-specific.

Given how new and fast-moving MCP specifically is, prioritize the official specification, SDK documentation, and the **Latest Updates** and **Blogs** sections below over any book for current protocol specifics -- books are best here for durable, general production-systems and API-design foundations, not MCP's current mechanics.
`,

  blogs: `
- **Anthropic's engineering and research blog** -- the primary source for MCP's own design rationale, announcements, and updates, given that Anthropic originated and continues to steward the specification.
- **Practitioner blogs and writeups from teams building MCP servers and host integrations** (across the growing ecosystem of vendors and community contributors) -- useful for concrete lessons on schema design, transport choice, and security review, often reflecting exactly the production concerns covered in this page.
- **Simon Willison's blog** -- consistently clear, skeptical, practitioner-grounded writing on LLM tool use and prompt injection risk generally, directly relevant to reasoning carefully about MCP's security surface rather than adopting it uncritically.
- **Claude Code's own release notes and blog posts** on MCP integration -- a concrete, evolving record of how one major host application's MCP support has developed over time.
- **General API-standardization and protocol-design blogs** (covering the history of protocols like REST, GraphQL, or earlier RPC standards) -- useful background for understanding why and how standardization efforts like MCP tend to unfold, even when not MCP-specific.
`,

  "research-papers": `
Research specifically on MCP as a protocol is thin at the time of writing, reflecting how young it is -- this page is honest about that rather than inventing citations. The closest and most relevant foundational reading instead comes from the surrounding tool-use and agent literature this protocol builds on:

- **Toolformer and related tool-use papers** (e.g. Schick et al., 2023) -- foundational for understanding how language models learn to decide when and how to call external tools, the underlying capability MCP's discovery and transport layer is built around; see also **Tool Calling**'s research-papers section.
- **The ReAct paper** (Yao et al., 2022) -- foundational for the interleaved reasoning-and-acting pattern that governs how a model actually uses a tool once MCP has made it discoverable, covered in depth in **Agent Fundamentals**.
- **General RPC and API-standardization literature** (systems papers on remote procedure call design, and on the history of protocol standardization more broadly) -- useful conceptual background for why a discovery-plus-transport standardization layer, as opposed to a fully bespoke integration, tends to reduce systemic integration cost as the number of participants grows.
- **Software supply-chain security research** (papers and industry reports on package-ecosystem trust and compromise, from software engineering and security venues) -- directly relevant background for reasoning rigorously about the third-party MCP server trust concerns raised in Security, even though this research predates MCP itself.

Given how new MCP is as a named protocol, the most current, rigorously evaluated work specifically about it is best found via a live search of recent security and systems venues (USENIX Security, IEEE S&P, and similar) rather than a fixed list here -- treat the papers above as the durable foundational layer this protocol builds on, not direct MCP research.
`,

  videos: `
- Anthropic's own announcement and technical explainer content on MCP -- the highest-signal primary source for the protocol's original design intent and core mechanics.
- Conference talks and technical presentations from teams building MCP servers or host integrations, walking through real architecture and security-review lessons -- useful for connecting this page's concepts to concrete implementation choices; search current video platforms for recent, well-regarded examples given how quickly the ecosystem is evolving.
- **Claude Code** product walkthroughs and demos that show MCP server configuration in practice -- a concrete, hands-on way to see the host-side connection experience described in this page's Architecture section.
- General talks on API/protocol standardization and its tradeoffs (from software-engineering-focused conferences) -- useful background for the "why does a standard protocol matter" framing in Why It Exists, even when not MCP-specific.
`,

  "github-repos": `
- The official MCP specification repository -- the canonical, versioned source for the protocol's message formats and capability definitions; the ground truth over this page whenever discrepancies arise.
- The official MCP Python and TypeScript SDK repositories -- reference implementations of both the client and server sides, and the source of current decorator/method idioms (like the FastMCP interface used in this page's examples).
- Anthropic's reference MCP server implementations (covering common integrations such as filesystem access and version control) -- useful as working examples of well-scoped, well-documented servers to learn from directly.
- Community-maintained MCP server registries/directories -- useful for discovering existing servers before building your own, but each entry should be evaluated individually per the security guidance in this page, not trusted uniformly because it appears in a registry.
- **Claude Code**'s own repository and documentation on MCP client configuration -- a concrete example of a widely used host application's MCP integration.
- Framework repositories with MCP client support (**LangChain**, **LangGraph**, and similar) -- useful for seeing how an existing agent-orchestration framework incorporates MCP-sourced tools alongside directly-integrated ones.
- Security-scanning and testing-harness tooling built specifically for MCP servers (an emerging category) -- useful for operationalizing the security review practice recommended in this page's Security and Best Practices sections.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Primitive-design fluency*: given ten described capabilities of a hypothetical internal system (e.g. "look up a customer record," "delete a customer record," "a curated onboarding-email template"), classify each as best modeled as a tool, a resource, or a prompt, and justify each classification in one sentence.
2. *Protocol-lifecycle tracing*: given a written description of a specific MCP-mediated tool call scenario, draw out (on paper or in a diagram) the full connect-initialize-discover-invoke-observe sequence, labeling which steps are the host's responsibility, which are the server's, and which involve the model itself.
3. *Security review practice*: given the source code of a small, deliberately flawed sample MCP server (missing argument validation, over-broad credentials, or an ambiguous tool/resource conflation), identify every issue and propose a specific fix for each, referencing the relevant Security defense.
4. *Trust-boundary judgment*: given a scenario describing a host application connecting to three MCP servers with varying levels of sensitivity (a local filesystem server, an internal ticketing server, and an unfamiliar community-published server), design an allowlist and credential-scoping policy for the deployment and justify each decision.
5. *Comparisons in practice*: given a new integration need, work through the Comparisons decision framework (bespoke integration vs. provider-native tool calling alone vs. MCP) and write a short justification for which you would actually build, including what would change your answer.
6. *Discovery-contract debugging*: given a synthetic transcript showing a mismatch between an MCP server's advertised tool schema and its actual behavior, diagnose the mismatch and propose both the schema fix and a test that would have caught it earlier.

External sets: the official MCP SDK's quickstart tutorials (Python and TypeScript) as hands-on practice once the protocol-agnostic concepts here are solid; reviewing several real community-published MCP servers' source code as a security-review exercise, using the checklist in Production Checklist as your rubric.
`,

  "architecture-diagram": `
The reference architecture for a production MCP-based feature -- the shape the sibling skills each go deep on one part of:

~~~mermaid
flowchart TB
    Client["User / calling application"] --> Host["Host application\n(chat client, IDE, custom agent)"]
    Host --> Orchestrator["Agent orchestrator / loop\n(see Agent Fundamentals)"]
    Orchestrator --> LLM["LLM decision step\n(provider-native tool calling, see Tool Calling)"]
    LLM -->|tool call requested| Guard["Guardrail: server allowlist,\nargument validation, approval gate"]
    Guard -->|approved, no gate needed| ClientA["MCP client A"]
    Guard -->|approved, no gate needed| ClientB["MCP client B"]
    Guard -->|needs approval| Human["Human-approval gate\n(consequential MCP tools)"]
    Human -->|approved| ClientA
    ClientA --> ServerA["MCP server A\n(e.g. filesystem, local stdio)"]
    ClientB --> ServerB["MCP server B\n(e.g. ticketing system, remote HTTP)"]
    ServerA --> ClientA
    ServerB --> ClientB
    ClientA --> Orchestrator
    ClientB --> Orchestrator
    Orchestrator --> LLM
    LLM -->|final answer| Host
    Host --> Client
    subgraph Support["Supporting systems"]
        Monitor["Per-server connection health,\nlatency, error-rate monitoring"]
        Eval["Evaluation: end-to-end\ntask success rate"]
    end
    Orchestrator --> Support
~~~

Every labeled box in this diagram corresponds to a sibling skill on this platform: the guardrail and human-approval layer -> **Guardrails** and **Agent Fundamentals**; the underlying model decision step -> **Tool Calling**; the orchestrator itself, concretely -> **Claude Code**, the **OpenAI Agents SDK**, **LangChain**, or **LangGraph** depending on which host/framework you are building on; evaluation of end-to-end success -> **Evaluation**.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((MCP))
    What it is
      Open protocol, JSON-RPC based
      Standardizes discovery + transport
      Does not replace tool-calling itself
    Architecture
      Host application
      MCP client per server
      MCP server exposes capabilities
    Three primitives
      Tools
        Invokable, often side-effecting
      Resources
        Readable, addressable, no side effects
      Prompts
        Reusable parameterized templates
    Connection lifecycle
      Connect
      Initialize (capability negotiation)
      Discover
      Translate schema
      Invoke
      Observe
    Why it exists
      M times N integration problem
      USB-C for AI (hedged analogy)
    Security
      New attack surface
      Malicious/compromised server risk
      Discovery-time AND invocation-time risk
      Supply-chain risk in third-party servers
      Credential scoping, argument validation
    Production discipline
      Explicit server allowlist
      Pinned versions
      Timeouts per connection/call
      Human-approval gates
      Full trace logging
    Comparisons
      vs bespoke integration
      vs provider-native tool calling alone
    Sibling skills
      Tool Calling
      Agent Fundamentals
      Claude Code
      OpenAI Agents SDK
      Guardrails
      LangChain
      LangGraph
~~~
`,
};

export default mcp;
