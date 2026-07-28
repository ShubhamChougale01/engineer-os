import type { SkillContent } from "../types";

/**
 * OpenAI Responses API — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const openaiResponsesApi: SkillContent = {
  overview: `
The Responses API is OpenAI's unified, stateful API surface for building agentic and tool-using applications on top of their models — a successor design intended to consolidate what previously required stitching together the Chat Completions API, the Assistants API, and manual state management into one coherent request/response model. Its central idea: a "response" is not just a chat completion, but a self-contained unit of work that can include reasoning, tool calls (including OpenAI-hosted tools like web search and code execution), structured output, and multi-turn state, addressed by an ID the platform itself can track.

For an AI engineer, the Responses API matters because it represents where a major provider has decided the industry's agentic patterns are heading: built-in tool use, server-side conversation state (so you don't have to resend the entire message history on every call), and first-class support for the same **Structured Outputs** and function-calling patterns covered elsewhere on this platform, unified under one API rather than scattered across several generations of API design. Understanding it well means understanding both a concrete, practical tool and a signal of where provider-level agent infrastructure is converging.

Key characteristics: a single previous_response_id mechanism for chaining multi-turn interactions without manually resending history; built-in "hosted tools" (web search, file search, code interpreter) the platform executes on your behalf, alongside your own custom function tools; native support for reasoning-capable models' intermediate reasoning; and a response object structured as a sequence of typed output items (messages, tool calls, reasoning) rather than a single flat text completion. I'd verify exact current feature availability and API stability against OpenAI's own documentation before treating any specific detail here as fixed, since this is a comparatively new and still-evolving API surface.
`,

  history: `
The Responses API emerged from OpenAI's own experience running two increasingly divergent API surfaces for building assistant-like applications, and the industry-wide recognition that agentic patterns (tool use, multi-turn state, hosted capabilities) deserved first-class API support rather than being layered awkwardly on top of a chat-completion primitive.

| Year | Milestone |
|------|-----------|
| 2023 | Chat Completions becomes the dominant API pattern industry-wide; **function/tool calling** is added to it, letting the model return structured calls to developer-defined tools |
| 2023 | OpenAI ships the **Assistants API**, a separate, more stateful surface with built-in threads, hosted tools (code interpreter, file search/retrieval), and server-managed conversation state — aimed at reducing the amount of manual state-management application code needed for assistant-style products |
| 2023–2024 | Developers building agentic products find themselves choosing between Chat Completions (simpler, stateless, widely supported, less built-in tooling) and the Assistants API (more capable out of the box, but a different mental model and its own operational quirks), creating real fragmentation in how OpenAI-based agent applications get built |
| 2024–2025 | OpenAI introduces the **Responses API** as a unifying successor — combining Chat Completions' simplicity and directness with the Assistants API's built-in tool and state capabilities into one coherent design, explicitly positioned as the recommended path forward for new agentic applications |
| 2025 | The Responses API gains broader hosted-tool support (web search, code execution, and others), deeper structured-output and reasoning-model integration, and becomes the API surface OpenAI recommends for new agent-building efforts, while Chat Completions remains supported for existing integrations |
| 2025 | An eventual deprecation path for the older Assistants API is signaled, with migration guidance pointing toward the Responses API — I'm not fully confident of the exact current deprecation timeline and would verify against OpenAI's current migration documentation before making a firm dependency decision |

The throughline: the Responses API's history is a consolidation story — two API surfaces solving overlapping problems in incompatible ways converging into one, mirroring how mature platforms eventually rationalize early architectural forks once the industry's actual usage patterns become clear.
`,

  "why-it-exists": `
Before the Responses API, a developer building an agentic OpenAI-based application faced a real architectural fork with no fully satisfying option. Chat Completions was simple, stateless, and universally supported, but building anything with real tool use, hosted capabilities, or multi-turn memory meant hand-rolling all of that state management and orchestration in application code — resending the full message history on every call, manually tracking which tools had been called and with what results, and building your own equivalent of "hosted tools" if you wanted capabilities like web search or code execution. The Assistants API addressed much of this with server-side threads and built-in hosted tools, but introduced its own distinct mental model (threads, runs, a different lifecycle) that didn't share code or concepts cleanly with Chat Completions-based code, and came with its own operational learning curve.

The Responses API exists to end that fork: one API design, incorporating Chat Completions' directness with the Assistants API's built-in statefulness and hosted-tool capability, so a developer doesn't have to choose between "simple but you build everything yourself" and "powerful but a different, separate system." The previous_response_id mechanism specifically targets the single biggest practical pain of stateless chat APIs: resending an ever-growing message history on every single call, which costs tokens, adds latency, and pushes state-management complexity into every application built on top of the API.

What the Responses API deliberately does **not** solve: it doesn't change which underlying models are available or their capabilities — it's an API-design layer, not a model-capability layer. It also doesn't replace the need for your own orchestration logic in genuinely complex multi-agent systems (see **Agent-to-Agent (A2A) Protocol** for cross-agent communication, and **LangGraph**/**CrewAI** for orchestration frameworks) — it's the API surface a single agent's interaction with OpenAI's models is built on, not a multi-agent orchestration framework itself.
`,

  "problem-it-solves": `
The Responses API removes concrete, measurable pains for teams building agentic applications on OpenAI's models:

- **Resending full conversation history on every call.** The previous_response_id mechanism lets the platform track conversation state server-side, so a follow-up turn references the prior response instead of re-transmitting the entire message history — reducing both token cost and application-code complexity.
- **Fragmented API surfaces for simple versus agentic use cases.** Instead of choosing between Chat Completions (simple, but you build tool orchestration and state yourself) and the Assistants API (built-in tooling, but a separate mental model), the Responses API is designed to serve both needs from one coherent surface.
- **Reinventing hosted-capability integrations.** Web search, code execution, and file search as first-class, platform-executed tools mean an application doesn't need to separately integrate a search API, a sandboxed code-execution environment, or a document-retrieval pipeline just to give an agent those basic capabilities — though for many production RAG or search needs, a custom-built pipeline (see **RAG**) remains the right choice for control and specificity.
- **Awkward representation of multi-step reasoning and mixed output.** A response's output being a sequence of typed items (a reasoning step, a tool call, a message) rather than one flat text string better represents what a genuinely agentic interaction actually looks like internally, rather than forcing that complexity to be inferred from string parsing.

What the Responses API deliberately does **not** solve:

- It does not make the underlying model more capable or more accurate — that remains a model-choice and prompting/**AI Evals** concern, not an API-design concern.
- It does not provide cross-vendor agent interoperability — for that, see **Agent-to-Agent (A2A) Protocol**, which addresses communication between independently-built agents regardless of which provider's API each one is built on.
- It does not eliminate the need for your own guardrails, content moderation, or **Prompt Injection Defense** — hosted tools and server-side state are convenience and capability features, not safety features.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what the Responses API is, why it exists, and how it differs from Chat Completions and the (older) Assistants API.
2. Make a basic Responses API call and correctly parse its typed output items (messages, tool calls, reasoning).
3. Chain multi-turn interactions using previous_response_id instead of manually resending message history.
4. Use both custom function tools and built-in hosted tools (e.g. web search) within a single request.
5. Combine the Responses API with **Structured Outputs** for schema-enforced extraction and tool-argument generation.
6. Reason about when to use a hosted tool versus building your own custom integration (e.g. hosted web search versus a custom **RAG** pipeline).
7. Identify the production concerns specific to this API: state management at scale, cost implications of server-side history, security around hosted tool execution, and migration considerations from Chat Completions or the Assistants API.
8. Recognize where this API sits relative to **Agent-to-Agent (A2A) Protocol** and multi-agent orchestration frameworks — a single agent's provider-facing API, not a cross-agent communication standard.
`,

  prerequisites: `
- **Required**: basic familiarity with making HTTP API calls and working with JSON, and general comfort with how a chat-style LLM API request/response looks (a list of messages in, a completion out).
- **Required**: a working understanding of **Structured Outputs** and **Tool Calling**, since the Responses API's built-in tool support and structured-output integration are direct applications of both.
- **Strongly recommended**: prior exposure to OpenAI's Chat Completions API, since much of the Responses API's design is best understood as "what Chat Completions would look like if redesigned around agentic, stateful use cases from the start" — the contrast is genuinely clarifying.
- **Helpful**: familiarity with **RAG** concepts, to reason clearly about when a hosted tool (like built-in web search or file search) is sufficient versus when a custom retrieval pipeline is the better engineering choice.
- **Helpful**: basic **Python** or JavaScript fluency for writing client code against the API.

Dependency chain: **Structured Outputs** and **Tool Calling** → this page → connects forward to **Agent-to-Agent (A2A) Protocol** (for cross-agent communication once a single agent's provider API is well understood) and to **RAG**/**LangGraph** for building larger systems around it.
`,

  "beginner-concepts": `
### The core idea, with no jargon

The Responses API is how you talk to OpenAI's models when you want more than a single, stateless "message in, text out" exchange — it's built for cases where the model might need to call a tool, remember earlier turns without you resending them, or produce a structured result, all through one consistent request shape.

### A first basic call

~~~python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-4o",
    input="What's the capital of France?",
    timeout=30,   # always set a timeout, exactly as with any other API call
)

# The response's output is a list of typed items -- not just one string
for item in response.output:
    if item.type == "message":
        for content in item.content:
            if content.type == "output_text":
                print(content.text)
~~~

### Multi-turn conversation without resending history

~~~python
# Turn 1
first = client.responses.create(model="gpt-4o", input="What's the capital of France?")

# Turn 2 -- reference the previous response instead of resending the whole conversation
second = client.responses.create(
    model="gpt-4o",
    input="What's a famous landmark there?",
    previous_response_id=first.id,   # the platform tracks the conversation state server-side
)
~~~

This is the single biggest practical difference from a plain Chat Completions call, where every turn requires resending the entire growing message list yourself.

### A first tool call

~~~python
tools = [{
    "type": "function",
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "parameters": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}]

response = client.responses.create(
    model="gpt-4o",
    input="What's the weather in Tokyo?",
    tools=tools,
)

for item in response.output:
    if item.type == "function_call":
        print(item.name, item.arguments)   # "get_weather", '{"city": "Tokyo"}'
~~~

This is the same underlying pattern as **Tool Calling** and **Structured Outputs** generally, expressed through the Responses API's request/response shape.

### A built-in hosted tool: web search

~~~python
response = client.responses.create(
    model="gpt-4o",
    input="What were the major AI announcements this week?",
    tools=[{"type": "web_search"}],   # OpenAI executes the search on your behalf
)
~~~

No separate search-API integration is needed — the platform performs the search and incorporates the results into the response, a meaningfully different capability from custom function tools you implement and execute yourself.
`,

  "intermediate-concepts": `
### The output-items model in depth

A Responses API response's output is a list of typed items, which can include (depending on the model and request) message content, function calls, built-in tool-call results, and reasoning summaries for reasoning-capable models:

~~~python
response = client.responses.create(model="gpt-4o", input="...", tools=[...])

for item in response.output:
    match item.type:
        case "message":
            # a text (or structured) response from the model
            handle_message(item)
        case "function_call":
            # a call to one of YOUR custom tools -- you execute it and respond
            result = execute_your_tool(item.name, item.arguments)
            # then send the result back in a follow-up call referencing previous_response_id
        case "web_search_call":
            # a hosted tool OpenAI executed on your behalf -- already resolved
            pass
        case "reasoning":
            # an intermediate reasoning summary, for reasoning-capable models
            pass
~~~

Handling every item type your application might realistically encounter — not just the happy-path message case — is essential, exactly as handling zero/one/many tool calls is essential in general **Tool Calling** and **Structured Outputs** practice.

### Structured output via the Responses API

~~~python
from pydantic import BaseModel

class Invoice(BaseModel):
    invoice_number: str
    total_amount: float

response = client.responses.parse(
    model="gpt-4o",
    input=f"Extract invoice details from: {document_text}",
    text_format=Invoice,   # schema-enforced structured output, same discipline as the Structured Outputs skill
)
invoice = response.output_parsed
~~~

The same principle from **Structured Outputs** applies unchanged: schema conformance is guaranteed, semantic correctness is a separate concern you must still validate.

### Completing a multi-step tool-calling loop

~~~python
def run_agent_turn(client, model, user_input, tools, tool_registry, previous_response_id=None):
    response = client.responses.create(
        model=model, input=user_input, tools=tools, previous_response_id=previous_response_id,
    )
    function_calls = [item for item in response.output if item.type == "function_call"]
    if not function_calls:
        return response   # model answered directly, no tool needed this turn

    # Execute each requested tool call and feed results back in a follow-up request
    tool_outputs = []
    for call in function_calls:
        result = tool_registry[call.name](**json.loads(call.arguments))
        tool_outputs.append({"type": "function_call_output", "call_id": call.call_id, "output": json.dumps(result)})

    return client.responses.create(
        model=model,
        input=tool_outputs,
        previous_response_id=response.id,   # continues the same tracked conversation
        tools=tools,
    )
~~~

### Reasoning models and the Responses API

Reasoning-capable models can include intermediate reasoning content in their output, which the Responses API represents as its own typed item rather than mixing it into the final message text — letting an application choose whether to surface, log, or discard that reasoning content separately from the model's final answer, and giving it a first-class place in the response structure rather than requiring ad hoc parsing of a single text blob.

### Choosing hosted tools versus custom integrations

Hosted tools (web search, code execution, file search) trade control and customizability for convenience — they're excellent for prototyping and for cases where OpenAI's own implementation is good enough, but for production RAG pipelines with specific retrieval requirements (custom chunking, a particular vector store, domain-specific reranking), a custom-built pipeline (see **RAG**, **Vector Search**) remains the right engineering choice. The decision is the same general build-versus-buy tradeoff that applies to any managed capability: use the hosted tool when its behavior genuinely meets your requirements, and build your own when you need control it doesn't give you.
`,

  "advanced-concepts": `
### previous_response_id as a state-management architecture decision

Relying on previous_response_id shifts conversation-state ownership to OpenAI's platform rather than your own database — this has real architectural consequences: you're implicitly trusting the platform's retention policy and availability for that state, your application no longer has a straightforward local copy of full conversation history to inspect or migrate, and switching providers or models mid-conversation becomes harder if your state lives entirely server-side. Senior teams building anything beyond a prototype typically maintain their own authoritative copy of conversation history in their own data store, using previous_response_id as an optimization (avoiding resending the full history to OpenAI) rather than as the sole source of truth for their application's own state — a defensive architecture choice that also keeps the option open to migrate providers or debug from your own records independent of the platform's own state retention.

### Cost and token implications of server-side state

Using previous_response_id avoids re-transmitting history in your request payload, but it's worth understanding precisely what it does and doesn't save: the model still needs to process the full accumulated context on the server side to generate a response (the underlying compute cost of a longer effective context isn't eliminated), but you avoid the bandwidth and application-code cost of managing and resending that history yourself. This is a genuine convenience win, not a token-cost elimination — see the **Cost Optimization** skill for the broader picture of managing spend on long-running conversations, and the **Context Engineering** skill for the general discipline of managing what's actually in the effective context window regardless of how state is transmitted.

### Hosted tools as a distinct trust and control boundary

When you use a hosted tool (web search, code execution), you're delegating execution to OpenAI's infrastructure rather than your own — this has real implications: you have less visibility into and control over exactly what a hosted web search actually retrieved or how hosted code execution was sandboxed, compared to a custom tool you built and can fully instrument yourself. For applications with strict data-handling, compliance, or auditability requirements, this tradeoff deserves explicit evaluation rather than default acceptance — a custom tool you control may be the more defensible choice even at the cost of more implementation effort, exactly the kind of build-versus-buy tradeoff any production system should make deliberately.

### Migrating from Chat Completions or the Assistants API

Migrating existing Chat Completions-based code means restructuring around the output-items model (parsing a list of typed items rather than a single message string) and deciding whether to adopt previous_response_id-based state or continue managing your own history explicitly. Migrating from the Assistants API means mapping its threads/runs lifecycle onto the Responses API's response-chaining model — conceptually similar in intent (server-side state, built-in tools) but different enough in specific mechanics that a careful, tested migration (not a mechanical find-and-replace) is warranted. I'd verify OpenAI's current, specific migration guidance directly rather than relying on a general description, since exact API shapes and recommended migration paths are the kind of detail that changes as the API matures.

### Relationship to multi-agent and cross-vendor protocols

The Responses API is the interface between your application and OpenAI's models specifically — it says nothing about how your application's agent should communicate with a different agent built by another team or on another vendor's models. That's the explicit domain of **Agent-to-Agent (A2A) Protocol**: a single agent might use the Responses API internally to talk to OpenAI's models (exactly as it might use **MCP** to reach its own tools), while using A2A to communicate with other, independently-built agents. Conflating "my agent's provider API" with "how my agent talks to other agents" is a common architectural confusion worth avoiding explicitly.
`,

  "internal-working": `
Here is what happens, step by step, when a Responses API call is made with tools and a previous_response_id:

~~~mermaid
flowchart TD
    A["Client sends request:\ninput + tools + previous_response_id"] --> B["Platform retrieves prior\nresponse's server-side state"]
    B --> C["Combine new input with\nretrieved conversation context"]
    C --> D["Model processes full effective context\n(prefill, exactly as any LLM inference)"]
    D --> E{"Model's decision at each step"}
    E -- "produce text" --> F["Message output item"]
    E -- "call a custom tool" --> G["function_call output item\n(caller must execute and respond)"]
    E -- "use a hosted tool" --> H["Platform executes the hosted tool\n(e.g. web search) itself"]
    H --> I["hosted tool's output item\n(already resolved, no caller action needed)"]
    E -- "reasoning model, intermediate step" --> J["reasoning output item"]
    F & G & I & J --> K["Assemble the full output list,\nassign a response ID"]
    K --> L["Persist this response's state\nserver-side, for future previous_response_id reference"]
    L --> M["Return response object to client"]
~~~

1. **State retrieval.** If previous_response_id is supplied, the platform retrieves the tracked state from that prior response before processing the new input — this is what lets the client avoid resending history.
2. **Context assembly.** The new input is combined with the retrieved prior context to form the full effective input the model actually processes.
3. **Model processing.** Exactly as with any LLM inference, the model processes this context and, at each generation step, may produce message text, decide to call a tool (custom or hosted), or (for reasoning-capable models) produce an intermediate reasoning step.
4. **Hosted tool execution.** Unlike a custom function tool (where the platform returns a function_call item and waits for you to execute it and respond), a hosted tool's execution happens entirely on OpenAI's infrastructure — the result is already resolved by the time it appears in your response's output.
5. **Output assembly and persistence.** All output items are assembled into the response object, which is assigned an ID and persisted server-side so a future call can reference it via previous_response_id.

The core internal fact worth remembering: the distinction between a function_call item (you must execute it yourself and respond) and a hosted tool's already-resolved output item (nothing further required from you) is the key mechanical difference between custom and built-in tools, and confusing the two is a common source of "why didn't my tool call go through" bugs for developers new to the API.
`,

  architecture: `
A senior engineer thinks about the Responses API at two levels: how a single call's request/response shape is structured, and how to architect an application around stateful, multi-turn, tool-using interactions.

### Request/response architecture

~~~mermaid
flowchart TB
    subgraph Request["Responses API Request"]
        Input["input (new message/tool outputs)"]
        Tools["tools (custom function defs + hosted tool selections)"]
        PrevId["previous_response_id (optional)"]
        Format["text_format (optional, for Structured Outputs)"]
    end
    subgraph Platform["OpenAI Platform"]
        StateStore["Server-side response/state store"]
        Model["The model"]
        HostedTools["Hosted tool execution\n(web search, code interpreter, file search)"]
    end
    subgraph Response["Responses API Response"]
        OutputItems["output: list of typed items\n(message, function_call, reasoning, hosted-tool results)"]
        RespId["id (for future previous_response_id chaining)"]
    end
    Request --> Platform --> Response
    PrevId --> StateStore
    Model --> HostedTools
~~~

### Application architecture — a single agent built around this API

~~~
myagent/
├── src/myagent/
│   ├── client/
│   │   └── responses_client.py   # thin wrapper: request building, timeout, retry
│   ├── conversation/
│   │   ├── store.py               # YOUR OWN authoritative conversation-history store
│   │   └── chaining.py            # decides when to use previous_response_id vs. rebuild context
│   ├── tools/
│   │   ├── custom/                # your own function tool implementations
│   │   └── hosted_config.py       # which hosted tools are enabled, and why
│   └── schemas/                   # typed models for structured output (shared with the Structured Outputs skill's pattern)
└── tests/
~~~

Rules: maintain your own authoritative conversation-history store even when using previous_response_id, treating server-side state as an optimization rather than the sole record — this preserves the ability to audit, migrate, or debug independent of the platform's own retention. Hosted-tool selection is a deliberate, reviewed configuration decision (documented in hosted_config.py), not something enabled ad hoc per request.
`,

  "data-flow": `
Trace one multi-turn, tool-using interaction end to end:

~~~mermaid
sequenceDiagram
    participant App as Application
    participant API as Responses API
    participant Store as Server-side State
    participant Tool as Custom Tool (your code)

    App->>API: create(input="what's the weather in Tokyo?", tools=[get_weather])
    API->>Store: (no previous_response_id -- fresh conversation)
    API-->>App: response A: output=[function_call(get_weather, city=Tokyo)]
    App->>Tool: execute get_weather(city="Tokyo")
    Tool-->>App: {"temp": 18, "condition": "cloudy"}
    App->>API: create(input=[function_call_output], previous_response_id=A.id)
    API->>Store: retrieve state from response A
    API-->>App: response B: output=[message("It's 18C and cloudy in Tokyo.")]
    App->>App: display message to user

    Note over App,API: --- Next turn, still referencing the chain ---
    App->>API: create(input="what about tomorrow?", previous_response_id=B.id)
    API->>Store: retrieve full chained state (A -> B)
    API-->>App: response C: output=[message(...)]
~~~

The critical thing this trace makes visible: previous_response_id chains form a linked history entirely tracked server-side — the application never resends the growing conversation, but it also never sees the full history directly unless it separately maintains its own copy, which is exactly why senior teams keep an authoritative local record rather than depending on the chain alone (see Advanced Concepts).
`,

  "production-usage": `
### Where it actually gets deployed

The Responses API is the recommended starting point for any new agentic application built on OpenAI's models: customer-support agents needing tool use and conversation memory, research/assistant products combining custom tools with hosted web search, and any application migrating off the older Assistants API as OpenAI's guidance points toward this newer unified surface.

### Typical implementation pattern

~~~python
class ResponsesAgent:
    """A thin, production-shaped wrapper: your own history store as the source
    of truth, previous_response_id as an optimization, explicit hosted-tool config."""

    def __init__(self, client, model: str, hosted_tools: list[dict], custom_tools: list[dict], tool_registry: dict):
        self.client = client
        self.model = model
        self.tools = hosted_tools + custom_tools
        self.tool_registry = tool_registry

    def turn(self, user_input: str, conversation_id: str) -> str:
        prev_id = self._load_last_response_id(conversation_id)   # from YOUR OWN store
        response = self.client.responses.create(
            model=self.model, input=user_input, tools=self.tools,
            previous_response_id=prev_id, timeout=30,
        )
        response = self._resolve_tool_calls(response, conversation_id)
        self._save_response_id(conversation_id, response.id)     # persist to YOUR OWN store too
        return self._extract_text(response)
~~~

### Configuration guidance

Decide explicitly and document which hosted tools are enabled for a given application, since each one is a distinct trust/control tradeoff (see Advanced Concepts) — don't enable web search or code execution by default without a deliberate reason. Maintain your own conversation-history store even when using previous_response_id, both for auditability and to avoid a hard dependency on OpenAI's own state-retention policy for your application's core data. I'm not confident of every current specific rate limit, retention duration, or pricing detail for server-side state — verify against OpenAI's current documentation before finalizing a production design that depends on these specifics.
`,

  "industry-examples": `
- **OpenAI itself** positions the Responses API as the recommended foundation for new agentic applications built on their platform, reflecting a first-party bet on unifying what were previously two separate, overlapping API surfaces (Chat Completions and the Assistants API).
- **Agent framework vendors** (**LangGraph**, CrewAI, and others) commonly support the Responses API as one of several backend options for OpenAI-model-based agents within their broader orchestration abstractions, treating it as one provider-specific integration among several rather than a framework of its own.
- **Teams building customer-support and research-assistant products** on OpenAI's models are a natural fit for the API's combination of built-in tool use and conversation-state management, since those product categories inherently need both multi-turn memory and tool access (search, lookup, calculation) without wanting to build every piece of that infrastructure from scratch.
- **Teams migrating off the older Assistants API** represent a significant near-term adoption driver, following OpenAI's own guidance and eventual deprecation signaling for that earlier surface.

I don't have verified, specific, attributable production metrics for named companies beyond these general, well-documented platform positioning decisions, and would rather flag that honestly than invent a number.
`,

  "best-practices": `
1. **Maintain your own authoritative conversation-history store, using previous_response_id as an optimization, not your sole source of truth.** This preserves auditability and independence from the platform's own retention policy.
2. **Explicitly decide and document which hosted tools are enabled, and why** — each one is a distinct trust and control tradeoff, not a free default capability.
3. **Handle every output-item type your application might realistically encounter**, not just the happy-path message case — function calls, hosted-tool results, and reasoning items all need explicit handling logic.
4. **Use Structured Outputs (text_format with a typed model) for anything downstream code needs to parse**, exactly as covered in the **Structured Outputs** skill — never hand-parse free text where a schema-enforced call is available.
5. **Always set client-side timeouts**, exactly as for any external API call — the Responses API is still a network dependency.
6. **Treat hosted tools as a distinct trust boundary** for compliance- or auditability-sensitive applications, evaluating whether a custom-built tool gives you control the hosted equivalent doesn't.
7. **Test the full range of output-item combinations**, including multiple simultaneous function calls and a mix of hosted and custom tool use in one response.
8. **Never assume a specific migration path from Chat Completions or the Assistants API is mechanical** — restructure around the output-items model and previous_response_id deliberately, testing thoroughly rather than doing a blind find-and-replace.
9. **Keep this API's role clearly scoped**: it's how your agent talks to OpenAI's models, not how your agent talks to other agents — reach for **Agent-to-Agent (A2A) Protocol** for that separate concern.
10. **Monitor cost implications of long-running, chained conversations** — server-side state avoids re-transmission cost, but the underlying model still processes the full accumulated context, which has a real token cost.
`,

  "anti-patterns": `
### Treating previous_response_id as your only record of conversation history

~~~python
# WRONG: no local record at all -- entirely dependent on OpenAI's own state retention
def turn(user_input, prev_id):
    return client.responses.create(model=m, input=user_input, previous_response_id=prev_id)

# RIGHT: maintain your own authoritative store; previous_response_id is an optimization
def turn(user_input, conversation_id):
    prev_id = my_own_store.get_last_response_id(conversation_id)
    response = client.responses.create(model=m, input=user_input, previous_response_id=prev_id)
    my_own_store.record(conversation_id, user_input, response)   # YOUR OWN durable record
    return response
~~~

### Only handling the message output-item type

~~~python
# WRONG: assumes every response is a simple text message
text = response.output[0].content[0].text   # breaks the moment a tool call or reasoning item appears

# RIGHT: handle the actual range of possible output item types
for item in response.output:
    if item.type == "message":
        handle_message(item)
    elif item.type == "function_call":
        handle_function_call(item)
    # ... and so on for every type your application might encounter
~~~

### Enabling hosted tools by default without a deliberate decision

~~~python
# WRONG: turn on web search and code execution "just in case," without reviewing
# the trust/control tradeoff for your specific application's requirements
tools = [{"type": "web_search"}, {"type": "code_interpreter"}]

# RIGHT: enable each hosted tool deliberately, documented, matched to actual need
tools = HOSTED_TOOLS_CONFIG["customer_support_agent"]   # reviewed, explicit configuration
~~~

### Conflating this API with cross-agent communication

Using the Responses API's tool-calling or state-chaining mechanisms as a substitute for genuine agent-to-agent communication with an independently-built agent is a category error — this API is the interface between your application and OpenAI's models specifically, not a general-purpose inter-agent protocol; see **Agent-to-Agent (A2A) Protocol** for that distinct problem.

### Mechanically migrating from Chat Completions without restructuring

Treating migration as a find-and-replace of the API call, without restructuring around the output-items model or reconsidering whether previous_response_id-based state changes your application's architecture, tends to produce code that technically compiles but doesn't take advantage of (or correctly handle) the API's actual design.
`,

  performance: `
### Measure first

~~~python
import time

def timed_response_call(client, **kwargs) -> tuple[object, float]:
    start = time.perf_counter()
    response = client.responses.create(**kwargs, timeout=30)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return response, elapsed_ms
~~~

Never assume previous_response_id-based chaining is automatically faster than resending history yourself — measure actual latency, since the model still processes the full effective context server-side regardless of how that context was assembled; the savings are in request-payload size and application-code complexity, not necessarily wall-clock generation time.

### The optimization hierarchy

1. **Use previous_response_id to reduce request-payload size and application complexity**, understanding this optimizes transmission and code simplicity, not the model's underlying context-processing cost.
2. **Prefer hosted tools only where they genuinely reduce total latency/complexity versus a custom integration** — a hosted web search adds a real round trip on the platform side; if you need tight control over retrieval latency, a custom **RAG** pipeline you can tune directly may outperform it.
3. **Use Structured Outputs (schema-enforced) rather than free-text-plus-parsing** for anything downstream code consumes, avoiding both parsing-retry overhead and the accuracy cost of ambiguous unstructured extraction.
4. **Batch independent requests concurrently** where your application allows it, exactly as with any other LLM API usage pattern.
5. **Monitor and bound effective context length in long-running chained conversations.** A previous_response_id chain that grows unbounded across a very long conversation still costs real tokens and latency server-side — apply the same context-management discipline covered in **Context Engineering** regardless of how state is transmitted.

### What this API is not the right lever for

If your bottleneck is the underlying model's raw generation speed, no amount of Responses-API-specific tuning changes that — that's a model-choice and (for self-hosted alternatives) a **vLLM**/**SGLang** serving-engine concern, not an API-design concern.
`,

  scalability: `
The Responses API's scalability considerations are largely those of any hosted-provider API dependency, with one specific nuance around server-side conversation state.

### General hosted-API scalability

Rate limits, concurrent-request budgets, and retry/backoff discipline apply here exactly as with any hosted LLM API — see general API-integration best practices (timeouts, exponential backoff, circuit breakers) covered elsewhere on this platform (e.g. the resilience patterns in the **vLLM** and **Agent-to-Agent (A2A) Protocol** skills' own production sections, which transfer directly).

### The state-chaining nuance

Because previous_response_id chains are tracked server-side by the platform, a very long-running conversation's effective context grows over the chain's lifetime regardless of what your application transmits per-request — this means token cost and latency for later turns in a long chain can grow even though your request payload stays small, a nuance worth monitoring explicitly rather than assuming "small request payload" implies "cheap, fast call."

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| Hitting provider rate limits under load | Implement backoff/retry and request-queuing, exactly as for any hosted API dependency |
| A previous_response_id chain growing unboundedly long | Apply context-management discipline (see **Context Engineering**) — summarize or truncate older turns rather than letting the chain grow forever |
| Hosted-tool latency (e.g. web search round trip) dominating response time | Evaluate whether a custom, directly-controlled integration (e.g. your own **RAG** pipeline) would better fit a latency-sensitive use case |
| Cost growing with long conversation chains | Monitor effective context size per chain, not just request-payload size, since the model still processes accumulated context server-side |
`,

  security: `
### Responses-API-specific attack surface

Beyond general LLM-application security concerns (see **Prompt Injection Defense**, **AI Red Teaming**), this API introduces a few specific considerations tied to its hosted-tool and server-side-state design:

1. **Hosted-tool execution as a distinct trust boundary.** When a hosted tool (web search, code execution) runs on OpenAI's infrastructure rather than your own, you have less direct visibility into and control over exactly what it retrieved or executed — for applications with strict compliance, auditability, or data-handling requirements, this deserves explicit evaluation, and a custom tool you fully control may be the more defensible choice even at higher implementation cost.
2. **Server-side conversation state as a data-residency and retention consideration.** Using previous_response_id means conversation content is retained and processed according to the platform's own policies — verify current data-retention and residency terms against your application's compliance requirements before depending on server-side state for anything containing sensitive information.
3. **Tool-call arguments as untrusted input, exactly as in general structured-output practice.** A schema-valid function_call item's arguments are not automatically safe to execute — the same authorization and validation discipline from **Structured Outputs** and **Tool Calling** applies unchanged: never grant full automated execution of consequential actions without an authorization check and, often, human approval.
4. **Prompt injection via hosted-tool results.** Content retrieved by a hosted web search tool flows into the model's context exactly like any other retrieved content — if that content contains adversarial instructions, the same **Prompt Injection Defense** considerations that apply to any RAG or search-augmented system apply here too; a hosted tool doesn't exempt an application from this risk.

### Concrete defenses

- Evaluate hosted-tool usage against your application's specific compliance and control requirements before enabling it by default.
- Verify current data-retention and processing terms for server-side conversation state against your own data-handling obligations.
- Apply the same authorization, validation, and human-approval discipline to function_call arguments as covered in **Tool Calling** and **Structured Outputs** — schema validity is never authorization.
- Treat hosted-tool-retrieved content as untrusted input requiring the same prompt-injection defenses as any other externally-sourced content in the model's context.

See the dedicated **AI Red Teaming**, **Prompt Injection Defense**, and **Secrets Management** skills for the broader adversarial-testing, defense, and credential-handling practices this connects to.
`,

  testing: `
Testing Responses-API-dependent code spans request/response shape handling, multi-turn state-chaining behavior, and the same structured-output/tool-calling discipline covered elsewhere on this platform.

~~~python
# tests/test_responses_agent.py
import pytest
from myagent.client.responses_client import ResponsesAgent

@pytest.fixture
def agent(mock_openai_client):
    return ResponsesAgent(mock_openai_client, model="gpt-4o", hosted_tools=[], custom_tools=[WEATHER_TOOL], tool_registry={"get_weather": fake_get_weather})

def test_simple_message_turn(agent, mock_response_message):
    mock_response_message(text="Paris is the capital of France.")
    result = agent.turn("What's the capital of France?", conversation_id="c1")
    assert "Paris" in result

def test_function_call_is_resolved_and_followed_up(agent, mock_response_sequence):
    # First response: a function_call. Second response: the final message after tool execution.
    mock_response_sequence([
        {"output": [{"type": "function_call", "name": "get_weather", "arguments": '{"city": "Tokyo"}', "call_id": "call_1"}]},
        {"output": [{"type": "message", "content": [{"type": "output_text", "text": "It's 18C in Tokyo."}]}]},
    ])
    result = agent.turn("What's the weather in Tokyo?", conversation_id="c1")
    assert "18C" in result

def test_conversation_history_persisted_locally(agent, mock_response_message, fake_store):
    mock_response_message(text="hello")
    agent.turn("hi", conversation_id="c1")
    # Verify OUR OWN store recorded the response id, not just relying on previous_response_id alone
    assert fake_store.get_last_response_id("c1") is not None

def test_unhandled_output_item_type_does_not_crash(agent, mock_response_reasoning_only):
    mock_response_reasoning_only()   # only a reasoning item, no message -- an edge case worth testing explicitly
    result = agent.turn("think about this", conversation_id="c1")
    assert result is not None   # should degrade gracefully, not raise an unhandled exception
~~~

### The senior testing doctrine for Responses-API code

- **Test every output-item type your application might realistically encounter**, including edge cases like a reasoning-only response with no message content.
- **Test the full tool-call resolution loop**, not just the initial request — confirm your code correctly executes a function_call and sends the result back referencing previous_response_id.
- **Test that your own conversation-history store is being written to**, independent of the previous_response_id chain, so a test failure here catches the "we're depending entirely on OpenAI's state" anti-pattern before it reaches production.
- **Never depend on real API calls in fast unit tests** — mock the client so tests are deterministic and don't cost money or add flakiness; reserve real-API tests for a separate, slower integration suite.
- **Test hosted-tool-result handling separately from custom-tool handling**, since the two have genuinely different response shapes (already-resolved output versus requiring caller execution).
`,

  debugging: `
### The toolbox, in escalation order

1. **Log the full response.output list, not just the extracted text.** Many "my tool call didn't work" or "the response looks wrong" issues are actually a missed or mishandled output-item type — seeing the full list first is the fastest way to confirm what actually came back.
2. **Confirm whether previous_response_id was actually passed correctly.** A "the model forgot our earlier conversation" bug is very often a missing or incorrect previous_response_id in the follow-up request, not a model or platform issue.
3. **Distinguish a function_call item (you must execute and respond) from a hosted-tool-result item (already resolved).** Treating one as the other is a common source of confusion — check item.type explicitly rather than assuming.
4. **Reproduce with a minimal request.** Strip a failing multi-tool, multi-turn interaction down to the single call that's misbehaving before assuming the bug is in your broader agent logic.
5. **Check for a schema mismatch when using structured output (text_format).** The same debugging discipline from **Structured Outputs** applies: confirm the schema itself is well-formed and unambiguous before assuming a deeper bug.
6. **Verify your own conversation-history store agrees with what you expect the chain to contain.** If your local record and the platform's chained state have diverged (e.g. from a previous bug or a manual data fix), behavior can look inconsistent in ways that are actually a state-synchronization issue, not an API bug.
7. **Check for a version/feature-availability mismatch.** This is a comparatively new and evolving API surface — a feature assumed available (a specific hosted tool, a specific output-item type) may not yet be available for your account tier or the specific model you're using; verify against current documentation.
`,

  monitoring: `
### The metrics that matter

~~~python
from prometheus_client import Counter, Histogram

RESPONSES_CALLS = Counter(
    "responses_api_calls_total", "Responses API calls", ["outcome"]
)  # outcome: success | timeout | error
OUTPUT_ITEM_TYPES = Counter(
    "responses_api_output_item_types_total", "Output item types received", ["item_type"]
)
CHAIN_LENGTH = Histogram(
    "responses_api_chain_length", "Number of turns in a previous_response_id chain"
)
HOSTED_TOOL_USAGE = Counter(
    "responses_api_hosted_tool_calls_total", "Hosted tool invocations", ["tool_name"]
)

def on_response_received(response, conversation_chain_length: int):
    RESPONSES_CALLS.labels(outcome="success").inc()
    for item in response.output:
        OUTPUT_ITEM_TYPES.labels(item_type=item.type).inc()
        if item.type.endswith("_call") and item.type != "function_call":
            HOSTED_TOOL_USAGE.labels(tool_name=item.type).inc()
    CHAIN_LENGTH.observe(conversation_chain_length)
~~~

### What to track and why

- **Output-item type distribution.** Confirms your application is actually seeing (and correctly handling) the variety of item types your code paths assume — a sudden appearance of an unhandled type is an early warning before it causes a production error.
- **Chain length distribution.** A rising average chain length is a leading indicator of growing per-turn cost and latency in long-running conversations (see Scalability), worth watching before it becomes a cost or latency incident.
- **Hosted-tool usage, per tool.** Tracks how much of your traffic depends on OpenAI-executed capabilities versus your own custom tools — relevant both for cost and for the trust-boundary considerations in Security.
- **Timeout and error rates**, exactly as for any hosted API dependency, so a degrading provider-side issue is caught quickly rather than discovered through user complaints.
- **Local-store versus platform-chain consistency**, if feasible — a divergence here is a strong signal of a state-management bug worth investigating before it causes a confusing user-facing symptom.

Alert on symptoms that matter to users (rising error/timeout rate, growing chain length trending toward a cost or latency concern) rather than only low-level request counts, mirroring the RED-metrics philosophy used for any production service.
`,

  deployment: `
### A representative production pattern (FastAPI wrapper around the Responses API)

~~~python
# app/agent_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class TurnRequest(BaseModel):
    conversation_id: str
    message: str

@app.post("/agent/turn")
async def agent_turn(req: TurnRequest):
    try:
        prev_id = conversation_store.get_last_response_id(req.conversation_id)   # YOUR OWN store
        response = client.responses.create(
            model="gpt-4o",
            input=req.message,
            tools=HOSTED_TOOLS_CONFIG["default"] + CUSTOM_TOOLS,
            previous_response_id=prev_id,
            timeout=30,
        )
        response = resolve_tool_calls(response, req.conversation_id)
        conversation_store.save(req.conversation_id, req.message, response)     # persist locally too
        return {"reply": extract_text(response)}
    except TimeoutError:
        raise HTTPException(504, "Upstream model timed out")
    except Exception as exc:
        # Never expose raw provider errors to end users; log and return a clear, safe message
        logger.exception("responses_api_error", conversation_id=req.conversation_id)
        raise HTTPException(502, "Something went wrong processing your request")
~~~

Per-line rationale: the conversation store is consulted before every call, keeping local state authoritative even though previous_response_id is also used; timeouts and errors are caught and translated into clean HTTP responses rather than leaking raw provider exceptions to callers; the response is persisted locally immediately after the call succeeds, so local state and platform state stay in sync as a matter of routine, not an afterthought.

### Deployment topology notes

Since this is a hosted-provider API dependency rather than infrastructure you operate yourself, deployment is largely about your own application service (a standard containerized web service, deployed like any other — see **Docker**, **Kubernetes**) plus disciplined handling of the provider dependency itself: retries with backoff, circuit breaking around provider outages, and clear fallback behavior (a graceful error message, or a fallback to a simpler non-agentic response) when the API is unavailable.
`,

  "production-checklist": `
Before a Responses-API-dependent feature takes real production traffic:

- [ ] Own authoritative conversation-history store implemented, with previous_response_id used as an optimization, not the sole record
- [ ] Every output-item type your application might encounter handled explicitly, including edge cases (reasoning-only, multiple simultaneous tool calls)
- [ ] Hosted tools enabled deliberately and documented, with the trust/control tradeoff explicitly evaluated for your compliance requirements
- [ ] Structured Outputs (text_format) used for anything downstream code parses, not free-text-plus-manual-parsing
- [ ] Client-side timeouts configured on every call
- [ ] Tool-call arguments treated as untrusted input requiring authorization before execution, with human approval for consequential actions
- [ ] Chain-length and cost monitored for long-running conversations, with a context-management strategy for unbounded growth
- [ ] Retry/backoff and circuit-breaking implemented around the provider dependency, with a defined fallback behavior on outage
- [ ] Data-retention and residency terms for server-side conversation state verified against your compliance requirements
- [ ] Migration from Chat Completions or the Assistants API (if applicable) tested thoroughly, not treated as a mechanical find-and-replace
- [ ] Clear architectural boundary maintained between this API (agent-to-provider) and any cross-agent communication (Agent-to-Agent Protocol)
- [ ] Monitoring in place: output-item-type distribution, chain length, hosted-tool usage, error/timeout rates
`,

  "common-mistakes": `
1. **Depending entirely on previous_response_id with no local conversation record**, losing auditability and creating a hard dependency on the platform's own state retention.
2. **Only handling the message output-item type**, breaking the moment a tool call, hosted-tool result, or reasoning item appears in a response.
3. **Enabling hosted tools by default without evaluating the trust/control tradeoff**, especially for compliance-sensitive applications.
4. **Confusing a function_call item (requires your own execution and follow-up) with an already-resolved hosted-tool-result item**, leading to confusing "why didn't my tool run" or duplicated-execution bugs.
5. **Treating a schema-valid function_call's arguments as automatically safe to execute**, skipping authorization checks that should be separate from shape validation.
6. **Assuming previous_response_id-based chaining is automatically cheaper or faster**, without measuring — the model still processes the full accumulated context server-side.
7. **Mechanically migrating from Chat Completions or the Assistants API** without restructuring around the output-items model or reconsidering state management.
8. **Conflating this API with cross-agent communication protocols**, using its tool-calling or chaining mechanisms as a substitute for **Agent-to-Agent (A2A) Protocol** where genuine multi-agent interoperability is actually needed.
9. **No timeout or fallback behavior on provider outages**, treating a hosted API dependency as though it can never fail or be slow.
10. **Letting a conversation chain grow unboundedly** without any context-management strategy, silently increasing per-turn cost and latency over a long-running conversation.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Model seems to have "forgotten" earlier conversation | previous_response_id missing or incorrect in the follow-up request | Verify the correct response ID is being passed on every subsequent call |
| Application crashes parsing a response | Code assumes a single message output item, but the response contained a different or additional item type | Handle the full range of output-item types explicitly, including edge cases |
| Tool call appears to "not execute" | Confusing a function_call item (requires YOUR execution and a follow-up request) with a hosted tool's already-resolved output | Check item.type; only function_call items require you to execute and respond |
| Structured output (text_format) validation fails unexpectedly | Same causes as general Structured Outputs failures -- schema too complex, ambiguous descriptions, or an unsupported schema feature | Apply the debugging steps from the **Structured Outputs** skill directly |
| Rising cost/latency on long-running conversations | Unbounded previous_response_id chain accumulating context server-side | Apply context-management discipline (summarize/truncate older turns) rather than letting the chain grow indefinitely |
| Hosted tool result seems stale, wrong, or missing detail | Hosted tool execution is opaque to you; you have limited control over its exact behavior | Consider a custom-built tool (e.g. your own RAG pipeline) if you need more control than the hosted tool provides |
| Inconsistent behavior after enabling a feature | Comparatively new, evolving API surface -- feature availability can vary by account tier or model | Verify current feature availability against official documentation for your specific setup |
| Local app state and platform chain appear to diverge | Local conversation-history store not updated on every call, or updated inconsistently with the chain | Persist to your own store immediately after every successful call, as a matter of routine |

The general habit: log the full response.output list on any unexpected behavior — nearly every one of these symptoms is diagnosable once you can see exactly what item types and content actually came back.
`,

  faqs: `
**Q: Is the Responses API a replacement for Chat Completions?**
It's positioned as the recommended path for new agentic applications, particularly ones needing tool use, hosted capabilities, or multi-turn state. Chat Completions remains supported for existing integrations and simpler use cases. Check OpenAI's current guidance for the specific current recommendation, since positioning can evolve.

**Q: Should I still maintain my own conversation history if I use previous_response_id?**
Yes — treat previous_response_id as an optimization that avoids resending history in your request payload, not as your application's sole record. Your own store preserves auditability and independence from the platform's retention policy.

**Q: What's the difference between a hosted tool and a custom function tool?**
A hosted tool (web search, code execution) is executed by OpenAI's own infrastructure, and its result arrives already resolved in your response. A custom function tool returns a function_call item describing what to call and with what arguments — you execute it yourself and send the result back in a follow-up request.

**Q: Does using previous_response_id save on token cost?**
It saves on request-payload size and application-code complexity, but the model still processes the full accumulated context server-side to generate a response — the underlying compute/token cost of a long conversation isn't eliminated, just the need to re-transmit it yourself.

**Q: How does this relate to Agent-to-Agent (A2A) Protocol?**
They operate at different layers entirely. The Responses API is how your application talks to OpenAI's models. A2A is how your agent (regardless of which model API it uses internally) talks to a different, independently-built agent. A single system might use both simultaneously, at different points in its architecture.

**Q: Is a schema-enforced function_call's arguments automatically safe to execute?**
No — schema conformance guarantees the arguments' shape, not that executing them is safe or authorized. Apply the same authorization and human-approval discipline covered in **Tool Calling** and **Structured Outputs**.

**Q: Should I use hosted web search instead of building my own RAG pipeline?**
It depends on your control requirements. Hosted search is convenient and often sufficient for prototyping or general-knowledge lookups; a custom **RAG** pipeline is the better choice when you need specific retrieval behavior, a particular vector store, domain-specific reranking, or tighter compliance/auditability control over what content the model sees.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the Responses API, at a high level?* OpenAI's unified, stateful API for building agentic applications, combining Chat Completions' directness with the Assistants API's built-in tool and state capabilities into one coherent design.
2. *What does previous_response_id do?* Lets a follow-up call reference a prior response so the platform tracks conversation state server-side, avoiding the need to resend the full message history on every call.
3. *What's the difference between a custom function tool and a hosted tool?* A custom tool returns a function_call item that the caller must execute and respond to; a hosted tool (like web search) is executed entirely by OpenAI's infrastructure and arrives already resolved in the response.
4. *What does a response's output actually contain?* A list of typed items — which can include messages, function calls, hosted-tool results, and reasoning summaries — rather than a single flat text string.
5. *How does this API relate to Structured Outputs?* It integrates the same schema-enforcement discipline directly, via a text_format parameter that guarantees a response matches a given typed model, exactly as covered in the **Structured Outputs** skill.

**Senior:**

6. *Why should a production application maintain its own conversation-history store even when using previous_response_id?* Because relying solely on server-side state creates a hard dependency on the platform's retention policy, removes straightforward auditability, and makes it harder to migrate providers or debug independent of the platform's own records — previous_response_id is best treated as an optimization, not the sole source of truth.
7. *Does previous_response_id reduce the underlying token/compute cost of a long conversation?* No — it reduces request-payload size and application-code complexity, but the model still processes the full accumulated context server-side, so cost and latency for later turns in a long chain can still grow meaningfully.
8. *What's the security consideration specific to hosted tools?* Execution happens on OpenAI's infrastructure rather than your own, giving you less direct visibility into and control over exactly what was retrieved or executed — for compliance- or auditability-sensitive applications, a custom-built tool you fully control may be the more defensible choice.
9. *How does the Responses API relate to Agent-to-Agent (A2A) Protocol, and why is conflating them a mistake?* The Responses API governs how your application talks to OpenAI's models specifically; A2A governs how your agent communicates with a separate, independently-built agent, potentially on a different vendor's models entirely. They operate at different architectural layers, and using one's mechanisms as a substitute for the other is a category error.
10. *Why is treating a schema-valid function_call's arguments as automatically safe a mistake?* Schema conformance guarantees argument shape, not authorization or safety — a well-typed but malicious, corrupted, or simply inappropriate argument set can still pass validation; consequential actions need independent authorization checks, and often human approval, before execution.
11. *What should a careful migration from the Assistants API to the Responses API involve?* Restructuring around the output-items model, deciding how the older threads/runs lifecycle maps onto response chaining via previous_response_id, and thorough testing of the new mechanics — not a mechanical find-and-replace of API calls, since the underlying mental models differ meaningfully even though both target similar use cases.
12. *How would you design monitoring for a Responses-API-dependent production service?* Track output-item-type distribution (to catch unhandled types before they cause errors), chain-length distribution (a leading indicator of growing per-turn cost), hosted-tool usage per tool (for cost and trust-boundary visibility), and standard error/timeout rates for the provider dependency — treating these as distinct signals rather than one aggregate health number.
`,

  "coding-questions": `
### 1. A robust output-item dispatcher (tests handling the full response shape)

~~~python
import json
from dataclasses import dataclass

@dataclass
class TurnOutcome:
    text: str | None = None
    pending_tool_calls: list = None
    had_reasoning: bool = False

def dispatch_output_items(response) -> TurnOutcome:
    """Handle the REAL range of output-item types a Responses API call can return,
    not just the happy-path message case."""
    outcome = TurnOutcome(pending_tool_calls=[])
    for item in response.output:
        if item.type == "message":
            texts = [c.text for c in item.content if c.type == "output_text"]
            outcome.text = " ".join(texts) if texts else outcome.text
        elif item.type == "function_call":
            outcome.pending_tool_calls.append(item)   # caller must execute these
        elif item.type == "reasoning":
            outcome.had_reasoning = True
        # hosted-tool-result items (e.g. web_search_call) are already resolved --
        # no action required, but could be logged/inspected here if needed
    return outcome
~~~

Complexity: O(number of output items). Follow-up: extend to also surface hosted-tool-result content explicitly (e.g. which search results were used) for auditability, and add a test for a response containing every item type simultaneously.

### 2. A bounded tool-execution loop with conversation persistence (tests the full production pattern)

~~~python
def run_full_turn(client, model, user_input, tools, tool_registry, conversation_id, store, max_tool_rounds=5):
    """Resolve a user turn end to end, including multiple rounds of tool calls if
    the model needs them, persisting to OUR OWN store on every successful response --
    never depending solely on previous_response_id for conversation continuity."""
    prev_id = store.get_last_response_id(conversation_id)
    current_input = user_input

    for round_num in range(max_tool_rounds):
        response = client.responses.create(
            model=model, input=current_input, tools=tools,
            previous_response_id=prev_id, timeout=30,
        )
        store.save_response_id(conversation_id, response.id)   # persist EVERY round, not just the final one
        prev_id = response.id

        function_calls = [item for item in response.output if item.type == "function_call"]
        if not function_calls:
            return response   # model produced a final answer, no more tools needed

        tool_outputs = []
        for call in function_calls:
            args = json.loads(call.arguments)
            if not is_authorized(call.name, args):   # NEVER skip this -- schema validity isn't authorization
                tool_outputs.append({"type": "function_call_output", "call_id": call.call_id,
                                      "output": json.dumps({"error": "not authorized"})})
                continue
            result = tool_registry[call.name](**args)
            tool_outputs.append({"type": "function_call_output", "call_id": call.call_id, "output": json.dumps(result)})
        current_input = tool_outputs   # feed tool results back for the next round

    raise RuntimeError(f"Exceeded max_tool_rounds ({max_tool_rounds}) without a final answer")
~~~

Complexity: O(max_tool_rounds) requests in the worst case. Follow-up: add a per-round timeout budget so a runaway tool-calling loop can't consume unbounded wall-clock time, and log which tools were called each round for observability.

### 3. A conversation-chain length monitor with a summarization trigger (tests cost/context discipline)

~~~python
class ChainLengthGuard:
    """Tracks how many turns a previous_response_id chain has accumulated,
    and signals when it's time to summarize/reset rather than let context grow forever."""

    def __init__(self, max_turns_before_summarize: int = 20):
        self.max_turns = max_turns_before_summarize
        self.turn_counts: dict[str, int] = {}

    def record_turn(self, conversation_id: str) -> bool:
        """Returns True if this conversation should be summarized/reset now."""
        self.turn_counts[conversation_id] = self.turn_counts.get(conversation_id, 0) + 1
        return self.turn_counts[conversation_id] >= self.max_turns

    def reset(self, conversation_id: str) -> None:
        self.turn_counts[conversation_id] = 0

guard = ChainLengthGuard(max_turns_before_summarize=20)
should_summarize = guard.record_turn("conversation-42")
if should_summarize:
    # Generate a summary of the conversation so far, start a FRESH chain seeded
    # with that summary instead of letting previous_response_id grow unboundedly
    summary = summarize_conversation("conversation-42")
    guard.reset("conversation-42")
~~~

Complexity: O(1) per turn. Follow-up: connect this to real token-count tracking (not just turn count) for a more precise signal, and tie the summarization trigger into the **Context Engineering** skill's broader context-management discipline.
`,

  "hands-on-labs": `
### Lab 1 — First calls and multi-turn chaining (beginner, ~1h)
Make a basic Responses API call, parse its output items, then chain a second turn using previous_response_id and confirm the model correctly references the first turn's content without you resending it. Skills: basic request/response shape, state chaining.

### Lab 2 — Custom tool plus hosted tool in one agent (intermediate, ~2h)
Build a small agent with one custom function tool (e.g. a calculator) and one hosted tool (web search), and handle both response types correctly — executing the custom tool yourself and simply reading the hosted tool's already-resolved result. Skills: the custom-vs-hosted-tool distinction, output-item dispatching.

### Lab 3 — Structured extraction plus authorization-gated tool execution (advanced, ~3h)
Combine a text_format schema-enforced extraction with a tool-calling loop that includes an explicit authorization check before executing any tool, and a human-approval gate for one deliberately "consequential" tool. Skills: **Structured Outputs** integration, the shape-vs-authorization distinction from **Tool Calling**.

### Lab 4 — Production-shaped service with local state and chain-length monitoring (production, ~3h)
Build a FastAPI service wrapping the Responses API with your own conversation-history store (independent of previous_response_id), Prometheus metrics for output-item types and chain length, and a summarization trigger (like the ChainLengthGuard from Coding Questions) for long-running conversations. Skills: the full production discipline this page teaches, applied end to end.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate this skill to employers:

1. **Multi-tool research assistant with hosted and custom tools** — an agent combining hosted web search with a custom calculation or lookup tool, maintaining its own conversation-history store, with full observability distinguishing hosted-tool usage from custom-tool usage. Demonstrates: the complete custom-vs-hosted tool discipline and production-shaped state management.

2. **Long-running support-conversation service with context management** — a customer-support-style agent handling long, multi-turn conversations, with a chain-length monitor and automatic summarization trigger to keep per-turn cost bounded, plus authorization-gated tool execution for any action beyond read-only lookups. Demonstrates: cost-aware, production-grade context management on top of stateful chaining.

3. **Migration case study: Chat Completions to Responses API** — take an existing (or intentionally-built toy) Chat Completions-based application and migrate it to the Responses API, documenting the specific restructuring required (output-items handling, state-chaining adoption) and the before/after tradeoffs observed. Demonstrates: genuine understanding of the API's design differences, not just surface-level familiarity with its syntax.

Each project: full type hints, a pytest suite covering output-item dispatching, tool-call authorization, and state persistence with both valid and deliberately malformed/unexpected fixtures, CI, and a README documenting the architecture and any hosted-tool trust-boundary decisions made. The engineering discipline around state ownership and authorization is what distinguishes a portfolio piece here from a toy demo.
`,

  "case-studies": `
### Consolidating Chat Completions and the Assistants API into one surface
OpenAI's own experience running two increasingly divergent API surfaces for similar agentic use cases (Chat Completions plus manual orchestration versus the Assistants API's built-in but differently-modeled statefulness) led to the Responses API as a deliberate consolidation. Lesson: even a major platform can accumulate architectural fragmentation as it iterates quickly in a fast-moving space, and recognizing when two overlapping surfaces should be unified — rather than maintained indefinitely in parallel — is itself a significant platform-design decision, not just an incremental feature addition.

### previous_response_id as a response to a widely-felt developer pain
The single most commonly cited practical frustration with stateless chat APIs — resending an ever-growing message history on every call — became the specific, named design target for the Responses API's state-chaining mechanism. Lesson: sometimes the highest-leverage platform improvement isn't a new capability but removing a well-known, broadly-felt friction point in how an existing capability has to be used.

### The rise of hosted tools as a first-party capability
Building web search, code execution, and file search as platform-executed hosted tools (rather than requiring every application to integrate its own search API or sandboxed execution environment) reflects a broader industry pattern: as certain tool integrations become common enough across many applications, platforms increasingly offer them as a first-party, managed capability rather than leaving every developer to reimplement the same integration independently. Lesson: recognizing which custom integrations are common enough to be worth a platform's own first-party investment (and which remain genuinely use-case-specific, better served by a custom build) is a recurring architectural judgment call, both for platform builders and for application teams deciding whether to adopt the hosted version or build their own.

I don't have verified, specific, attributable production case studies for named companies beyond these general, well-documented platform-design decisions, and would rather flag that honestly than invent a specific metric.
`,

  comparisons: `
| Dimension | Chat Completions | Assistants API (older) | Responses API |
|---|---|---|---|
| State management | Fully manual — resend full history every call | Server-side threads and runs | Server-side via previous_response_id chaining |
| Built-in hosted tools | None — build your own integrations | Yes (code interpreter, file search/retrieval, and others) | Yes (web search, code execution, and others), expanded further |
| Output shape | A single message/completion | A more complex thread/run/message model | A list of typed output items (message, function_call, reasoning, hosted-tool results) |
| Structured output / function calling | Supported | Supported, with its own specific mechanics | Supported, integrated directly (text_format, function tools) |
| Design maturity/positioning | Long-established, simple, widely supported | OpenAI's earlier stateful/agentic surface, with a signaled eventual deprecation path | OpenAI's current recommended path for new agentic applications |
| Best at | Simple, stateless completions where you want full control over state yourself | (Historically) assistant-style products needing built-in threads and hosted tools | New agentic applications needing both simplicity and built-in statefulness/tooling |

**How seniors choose**: for new agentic applications on OpenAI's models, the Responses API is the recommended starting point per OpenAI's own current guidance — verify this against current documentation, since positioning can evolve. Chat Completions remains reasonable for simple, stateless use cases or existing integrations not worth migrating. Existing Assistants API-based applications should plan a deliberate, tested migration path rather than an indefinite dependency on an API with a signaled eventual deprecation. Regardless of which OpenAI-specific API is chosen, remember it governs agent-to-provider communication only — **Agent-to-Agent (A2A) Protocol** remains the separate concern for agent-to-agent communication across independently-built systems.
`,

  "related-technologies": `
- **Structured Outputs** — the schema-enforcement discipline the Responses API's text_format parameter directly applies; read this skill for the full depth of the shape-vs-content distinction.
- **Tool Calling** — the general function/tool-calling pattern this API's custom-tool support (function_call items) implements; also essential for understanding the authorization considerations around executing tool calls.
- **Agent-to-Agent (A2A) Protocol** — the distinct, complementary standard for communication between independently-built agents, operating at a different architectural layer than this provider-specific API.
- **OpenAI Realtime API** — the sibling API in this platform's "AI Protocols & Standards" category, focused on low-latency speech-to-speech and streaming multimodal sessions rather than the Responses API's text/tool-oriented agentic focus.
- **RAG** — relevant for deciding when a custom retrieval pipeline is the better engineering choice versus this API's hosted search/file tools.
- **Context Engineering** — the broader discipline of managing what's in the effective context window, directly relevant to managing previous_response_id chain length and cost over long conversations.
- **LangGraph** and **CrewAI** — agent orchestration frameworks that commonly support the Responses API as one of several backend model-provider integrations.
- **AI Red Teaming** and **Prompt Injection Defense** — the adversarial-testing and defense practices relevant to hosted-tool trust boundaries and tool-call authorization.

On this platform, a natural path: **Structured Outputs** and **Tool Calling** → this page → **OpenAI Realtime API** for the sibling low-latency/voice API surface, then **Agent-to-Agent (A2A) Protocol** for cross-agent communication once a single agent's provider-facing API is well understood.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025, with less certainty about the most recent months leading up to today's date — the Responses API is a comparatively new and actively evolving surface, and I'd recommend checking OpenAI's official documentation directly before treating any specific detail below as current.

- **Continued expansion of hosted-tool capabilities** (web search, code execution, file search, and potentially others) as the platform matures this API surface further.
- **Ongoing integration deepening between the Responses API, Structured Outputs, and reasoning-model support**, reflecting the platform's stated intent to unify agentic capabilities under one coherent API rather than scattering them across several generations of design.
- **Continued migration guidance and eventual deprecation signaling for the older Assistants API**, with the Responses API positioned as its recommended successor — I'm not confident of the exact current deprecation timeline and would verify against OpenAI's current migration documentation.
- **Growing agent-framework-level support** (**LangGraph**, CrewAI, and others) treating the Responses API as a standard backend integration option alongside other providers' APIs.

I do not have confident, verified knowledge of the very latest specific feature releases, exact rate limits, pricing, or deprecation dates as of today's date — treat this section as directional and verify anything load-bearing to a real implementation decision against OpenAI's current, primary documentation.
`,

  "future-roadmap": `
Where this space appears to be heading, and what's worth investing career time in:

1. **Continued consolidation of agentic API surfaces**, both within OpenAI's own platform (the Chat Completions/Assistants API/Responses API convergence) and industry-wide, as providers converge on similar patterns (built-in tool use, server-side state, structured output as a default rather than an add-on).
2. **Deepening hosted-tool ecosystems**, likely expanding beyond web search and code execution into more specialized first-party capabilities, as certain integrations prove common enough across applications to warrant platform-level investment — the durable skill is evaluating the build-versus-buy tradeoff for each new hosted capability as it appears, not assuming any specific hosted tool is permanently the right choice for your use case.
3. **Tighter integration with cross-agent protocols.** As **Agent-to-Agent (A2A) Protocol** and similar standards mature, expect clearer architectural patterns for how a single agent's provider-facing API (like the Responses API) composes with cross-agent communication, rather than these remaining two separately-understood concerns application teams have to reconcile themselves.
4. **Growing sophistication in context-management tooling for long-running stateful conversations**, as server-side state chaining becomes more common — expect more built-in support for summarization, truncation, or explicit context-budget management rather than every team building the ChainLengthGuard-style pattern shown in this page from scratch.
5. **Continued reasoning-model integration**, with richer first-class representation of intermediate reasoning content in the response structure as reasoning-capable models become more central to agentic applications.

For your career: the durable, tool-agnostic skills here are the shape-vs-content and shape-vs-authorization distinctions (which transfer to any provider's structured-output or tool-calling feature), disciplined state-ownership architecture (never depending solely on a platform's own state retention), and clear-eyed build-versus-buy evaluation for hosted capabilities — those transfer regardless of which specific provider API or version is current at any given moment.
`,

  "cheat-sheet": `
~~~python
# --- A first basic call ---
response = client.responses.create(model="gpt-4o", input="hello", timeout=30)
for item in response.output:
    if item.type == "message":
        for c in item.content:
            if c.type == "output_text":
                print(c.text)

# --- Multi-turn WITHOUT resending history ---
first = client.responses.create(model="gpt-4o", input="What's the capital of France?")
second = client.responses.create(
    model="gpt-4o", input="A famous landmark there?",
    previous_response_id=first.id,   # platform tracks state server-side
)
# ALWAYS also persist to your OWN store -- previous_response_id is an
# optimization, not your application's sole record

# --- Custom function tool ---
tools = [{"type": "function", "name": "get_weather",
          "parameters": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}}]
response = client.responses.create(model="gpt-4o", input="weather in Tokyo?", tools=tools)
for item in response.output:
    if item.type == "function_call":
        result = execute_tool(item.name, json.loads(item.arguments))   # YOU execute this
        # then send it back:
        client.responses.create(
            model="gpt-4o",
            input=[{"type": "function_call_output", "call_id": item.call_id, "output": json.dumps(result)}],
            previous_response_id=response.id,
        )

# --- Hosted tool (platform executes it FOR you) ---
response = client.responses.create(model="gpt-4o", input="recent AI news?", tools=[{"type": "web_search"}])
# no execution needed on your side -- result already resolved in the output

# --- Structured output (schema-enforced) ---
from pydantic import BaseModel
class Invoice(BaseModel):
    invoice_number: str
    total_amount: float
response = client.responses.parse(model="gpt-4o", input=doc_text, text_format=Invoice)
invoice = response.output_parsed   # a real Invoice instance

# --- Output-item types to handle explicitly ---
# message | function_call | reasoning | <hosted_tool>_call (already resolved)

# --- The two rules that matter most ---
# 1. previous_response_id != your app's only conversation record -- keep your OWN store
# 2. schema-valid function_call args != authorized to execute -- check before running

# --- Where this API DOESN'T apply ---
# agent <-> agent communication -- that's Agent-to-Agent (A2A) Protocol, a DIFFERENT layer
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is the Responses API? | OpenAI's unified, stateful API combining Chat Completions' simplicity with the Assistants API's built-in tools and state, positioned as the recommended surface for new agentic apps |
| What does previous_response_id do? | Lets a follow-up call reference a prior response so conversation state is tracked server-side, avoiding resending the full message history |
| Custom tool vs hosted tool | Custom: returns a function_call item, YOU execute it and respond. Hosted (e.g. web search): OpenAI executes it, result arrives already resolved |
| What does a response's output contain? | A list of typed items -- message, function_call, reasoning, hosted-tool results -- not a single flat string |
| Should you rely solely on previous_response_id for conversation history? | No -- maintain your own authoritative store; treat chaining as an optimization, not the sole record |
| Does chaining reduce underlying token/compute cost? | No -- it reduces payload size and app complexity; the model still processes the full accumulated context server-side |
| Is a schema-valid function_call's arguments automatically safe to execute? | No -- schema conformance is shape only; authorization and human approval are separate, required checks |
| What's a security consideration specific to hosted tools? | Execution happens on OpenAI's infrastructure -- less visibility/control than a custom tool; evaluate for compliance-sensitive use cases |
| How does this API relate to Agent-to-Agent (A2A) Protocol? | Different layer entirely -- this is agent-to-provider (talking to OpenAI's models); A2A is agent-to-agent (talking to a different, independent agent) |
| What's the Structured Outputs integration point? | The text_format parameter on responses.parse -- schema-enforced output, same shape-vs-content discipline as the Structured Outputs skill |
| What predecessor API surfaces does this consolidate? | Chat Completions (simple, manual state) and the Assistants API (stateful, but a different, separate mental model) |
| What should you monitor for long-running chained conversations? | Chain length and effective context size -- unbounded growth still costs real tokens/latency even with a small request payload |
`,

  mcqs: `
**1. What problem does previous_response_id primarily solve?**

A) Reducing the model's raw inference compute cost  B) Avoiding the need to resend the full conversation history on every call  C) Making tool calls execute faster  D) Encrypting conversation content

**Answer: B** — it lets the platform track conversation state server-side so the client doesn't retransmit growing history.

**2. What is the key difference between a custom function tool and a hosted tool in the Responses API?**

A) Custom tools are always faster  B) A custom tool returns a function_call item requiring the caller to execute it; a hosted tool is executed by OpenAI's infrastructure and arrives already resolved  C) Hosted tools cannot be used with structured output  D) There is no difference

**Answer: B** — this is the core mechanical distinction between the two tool types.

**3. Why should a production application maintain its own conversation-history store even when using previous_response_id?**

A) Because previous_response_id doesn't work reliably  B) Because relying solely on server-side state creates a hard dependency on platform retention policy and removes straightforward auditability  C) Because it's required by the API  D) Because it makes tool calls faster

**Answer: B** — previous_response_id should be treated as an optimization, not the sole source of truth for application state.

**4. Does using previous_response_id reduce the model's underlying token-processing cost for a long conversation?**

A) Yes, it eliminates the cost entirely  B) No -- it reduces request-payload size and code complexity, but the model still processes the full accumulated context server-side  C) Yes, by half  D) Cost is unrelated to conversation length

**Answer: B** — the compute/token cost of a long effective context isn't eliminated, just the need to retransmit history yourself.

**5. What is a security consideration specific to hosted tools like web search?**

A) They cannot return any results  B) Execution happens on OpenAI's infrastructure, giving you less direct visibility into and control over what was retrieved or executed  C) They automatically bypass all authentication  D) They are always slower than custom tools

**Answer: B** — for compliance- or auditability-sensitive applications, a custom-built tool may be the more defensible choice.

**6. How does the Responses API relate to Agent-to-Agent (A2A) Protocol?**

A) They are the same thing  B) The Responses API governs agent-to-provider communication (your app talking to OpenAI's models); A2A governs agent-to-agent communication between independently-built systems -- different architectural layers  C) A2A replaced the Responses API  D) The Responses API is a subset of A2A

**Answer: B** — conflating the two is a common architectural confusion; a single system can use both at different points.
`,

  "revision-notes": `
**The core idea in 3 lines:** The Responses API is OpenAI's unified, stateful API for agentic applications, consolidating what previously required choosing between Chat Completions (simple, but you build state/tool orchestration yourself) and the Assistants API (built-in but a separate mental model). Its two defining mechanisms are previous_response_id (server-side conversation-state chaining, avoiding resending history) and an output-items model (a response's output is a list of typed items — message, function_call, reasoning, hosted-tool results — rather than one flat string).

**The mechanism in 4 lines:** A request can include custom function tools (the model returns a function_call item the caller must execute and respond to) and hosted tools like web search (executed by OpenAI's own infrastructure, arriving already resolved). previous_response_id lets a follow-up call reference prior state tracked server-side rather than requiring the client to resend the full message history. Structured output integrates directly via a text_format parameter, applying the same schema-conformance discipline covered in the **Structured Outputs** skill.

**Architecture discipline in 4 lines:** Maintain your own authoritative conversation-history store even when using previous_response_id — treat it as an optimization for payload size and code simplicity, never as your application's sole record, since that avoids a hard dependency on the platform's own retention policy. Handle every output-item type your application might realistically encounter, not just the happy-path message case. Chaining reduces retransmission, not the model's underlying token-processing cost — a long chain still costs real latency and money and needs the same context-management discipline as any long-running conversation (see **Context Engineering**).

**Security and scope in 3 lines:** Schema-valid function_call arguments are never automatically authorized to execute — apply the same authorization and human-approval discipline as general **Tool Calling** practice. Hosted tools are a distinct trust boundary (execution on OpenAI's infrastructure, less direct visibility/control) worth evaluating explicitly for compliance-sensitive applications. This API governs agent-to-provider communication only — it is not a substitute for **Agent-to-Agent (A2A) Protocol**, which governs communication between independently-built agents at a different architectural layer entirely.
`,

  "learning-roadmap": `
A realistic path to production competency with the Responses API (adjust pace to your background):

**Week 1 — Foundations.** Make sure **Structured Outputs** and **Tool Calling** are solid first — this page assumes them. Read Beginner and Intermediate Concepts here. Complete Lab 1 (basic calls and multi-turn chaining). Milestone: you can explain previous_response_id and the output-items model to someone else without notes.

**Week 2 — Tool integration.** Complete Lab 2 (a custom tool plus a hosted tool in one agent), practicing the exact distinction between the two response shapes. Milestone: code that correctly dispatches every output-item type you've encountered so far.

**Week 3 — Structured output and authorization.** Complete Lab 3 (schema-enforced extraction plus an authorization-gated tool-execution loop), applying the shape-vs-authorization discipline directly. Milestone: a working agent that refuses to execute an unauthorized tool call even when its arguments are perfectly schema-valid.

**Week 4 — Production hardening.** Complete Lab 4 (a full production-shaped service with its own conversation store, output-item and chain-length monitoring, and a summarization trigger). Milestone: a dashboard you'd trust for an on-call rotation, distinguishing hosted-tool usage from custom-tool usage and tracking chain-length growth.

**Week 5 — Portfolio project.** Build one of the Real Projects end to end — the long-running support-conversation service with context management is the most broadly production-relevant choice, since it exercises the full state-and-cost discipline this page teaches.

Then continue to **OpenAI Realtime API** on this platform for the sibling low-latency/voice API surface, and **Agent-to-Agent (A2A) Protocol** for cross-agent communication once a single agent's provider-facing API is well understood.
`,

  "official-docs": `
- [OpenAI Responses API guide](https://platform.openai.com/docs/guides/responses) — the primary reference for request/response shapes, hosted-tool availability, and current feature support.
- [OpenAI API reference](https://platform.openai.com/docs/api-reference) — the full endpoint and parameter reference, including the responses.create and responses.parse methods.
- [OpenAI migration guidance](https://platform.openai.com/docs/) (search current docs for "migrating to Responses API") — for teams moving off Chat Completions or the Assistants API; check current, specific guidance rather than relying on a general description.
- [OpenAI function calling guide](https://platform.openai.com/docs/guides/function-calling) — the tool-calling mechanics this API's custom-tool support builds on.

I'm not fully confident every one of these URLs reflects the current, canonical location given how quickly provider documentation reorganizes, especially for a comparatively new API surface — verify each link resolves and search OpenAI's own site if it has moved.
`,

  books: `
- I'm not aware of a mature, dedicated book specifically about the Responses API as of my knowledge cutoff — it's a recent, provider-specific API surface documented primarily through official documentation rather than book-length treatments, and I'd rather say so than invent a title.
- **Designing Data-Intensive Applications** — Martin Kleppmann. Not Responses-API-specific, but the state-ownership and system-boundary thinking (never depending solely on someone else's system for your own data's source of truth) that this page's conversation-history-store guidance draws on directly.
- **Building Microservices** — Sam Newman. The service-boundary and API-contract thinking, plus resilience patterns (timeouts, circuit breakers, graceful degradation) around an external dependency, transfers directly to reasoning about this API as a hosted-provider dependency.
- General agentic-AI-engineering books and guides (verify current, well-reviewed titles at time of reading) increasingly include chapters covering provider-specific agent APIs including this one — check recent publication dates specifically, since this exact content area moves quickly.

The strongest current material for the Responses API specifically lives in OpenAI's own documentation and developer blog rather than in books — treat this section as pointing you to durable adjacent foundations rather than Responses-API-specific texts that don't yet exist in mature book form.
`,

  blogs: `
- **The OpenAI developer blog** — announcements and technical detail on the Responses API's launch and ongoing feature evolution, directly from the source.
- **Agent framework vendor blogs** (**LangGraph**/LangChain, CrewAI, and others) — practical integration guides showing how the Responses API fits into broader orchestration frameworks.
- **Independent AI-engineering blogs covering provider API comparisons** — useful for cross-referencing the Responses API against alternatives, though verify currency given how quickly provider feature sets evolve.

High-signal filter: prefer posts that show actual request/response payloads and real migration experience (specific restructuring needed, specific issues encountered) over posts that only summarize feature announcements without hands-on detail.
`,

  "research-papers": `
The Responses API is a provider-specific product/engineering artifact rather than an academic research topic, so there isn't a dedicated paper about it specifically — I don't want to invent one that doesn't exist. The genuinely relevant foundational reading sits one layer down, in the broader agentic-AI and tool-use research this API's design reflects:

- **Papers on tool-augmented language models** (search recent NeurIPS/ACL proceedings for "tool use," "function calling," or "tool-augmented LLMs") — the research foundation for the function-calling mechanics this API implements at the product level.
- **Reasoning-model research** (relevant to how reasoning-capable models' intermediate steps are represented) — search current literature on chain-of-thought and reasoning-model training for the underlying capability this API's reasoning output-item type surfaces.
- **General agentic-systems and multi-step-planning research** — relevant background for understanding why stateful, tool-using API design (rather than a single stateless completion) matters for genuinely agentic applications.

If a more specific, peer-reviewed paper directly analyzing this API exists that I'm not aware of, treat that as a gap in my knowledge rather than evidence one doesn't exist — this is fundamentally a product/API-design topic best tracked through official documentation rather than academic literature.
`,

  videos: `
- **OpenAI's own developer content introducing the Responses API** — search OpenAI's developer channels for the launch announcement and any follow-up technical walkthroughs, typically the clearest from-the-source explanation of the design and migration guidance.
- **Conference talks and developer-day sessions on building agentic applications with OpenAI's platform** — search recent AI-engineering conference content specifically, since concrete API guidance here has evolved quickly.
- **Agent framework vendor demo videos** (LangChain/LangGraph, CrewAI) showing Responses API integration in practice — often the most concrete, code-level walkthroughs available.

I don't have high confidence in specific talk titles, speaker names, or exact publication dates for this recent a topic, and would rather point you to the right channels to search currently than invent a specific citation.
`,

  "github-repos": `
- [openai/openai-python](https://github.com/openai/openai-python) — the official Python client library, including Responses API support; check its examples directory for current, working code samples.
- [openai/openai-node](https://github.com/openai/openai-node) — the official JavaScript/TypeScript client library equivalent.
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) and [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — agent frameworks with Responses API integration options; useful for seeing how a broader orchestration layer wraps this provider-specific API.
- [pydantic/pydantic](https://github.com/pydantic/pydantic) — the typed-model library underlying this API's text_format structured-output integration; see also the **Structured Outputs** skill.

Verify current star counts, maintenance activity, and release cadence directly on GitHub before depending on any of these in production — this ecosystem, and this specific API surface, is evolving quickly.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Basic chaining literacy*: make a three-turn conversation using previous_response_id, then reconstruct the full conversation from your own locally-maintained store and confirm it matches what you'd expect the platform-side chain to contain.
2. *Output-item dispatching*: write a dispatcher (like dispatch_output_items from Coding Questions) and test it against mocked responses containing every combination of message, function_call, reasoning, and hosted-tool-result items.
3. *Tool authorization*: implement the bounded tool-execution loop from Coding Questions, then write a test that attempts to execute an unauthorized tool call and confirms it's correctly rejected before execution.
4. *Structured extraction*: combine text_format schema enforcement with the semantic-validation discipline from the **Structured Outputs** skill for a document-extraction task of your choice.
5. *Chain-length management*: implement the ChainLengthGuard pattern and connect it to a real (or mocked) summarization step, verifying a long conversation triggers a reset rather than growing unboundedly.
6. *Migration exercise*: take a small existing Chat Completions-based script and migrate it to the Responses API, documenting every specific change required (output parsing, state handling) rather than treating it as a mechanical syntax swap.
7. *Hosted vs custom tool tradeoff*: build the same capability (e.g. "look up current information about X") once using the hosted web-search tool and once using a custom-built retrieval integration, and write a short comparison of the control/latency/cost tradeoffs you observed.

External sets: no dedicated public "Responses API problem set" exists that I'm confident recommending by name, given how new this API surface is — the most useful practice is working directly from OpenAI's own documentation examples and building toward the labs and coding questions on this page against a real API account.
`,

  "architecture-diagram": `
The reference architecture for a production agent built around the Responses API — the shape this page has built toward throughout:

~~~mermaid
flowchart TB
    User["End user"] --> App["Application service\n(FastAPI or equivalent)"]
    App --> Store["Your own conversation store\n(authoritative record)"]
    App --> API["OpenAI Responses API"]
    API -->|previous_response_id| PlatformState[("Server-side response state\n(OpenAI-managed)")]
    API -->|function_call items| App
    App --> CustomTools["Your custom tools\n(with authorization checks)"]
    API -->|hosted-tool results, already resolved| App
    API -.uses.-> HostedTools["Hosted tools\n(web search, code execution)"]
    App --> Guard["Chain-length guard /\nsummarization trigger"]
    subgraph Obs["Observability"]
        M1["Output-item type distribution"]
        M2["Chain length"]
        M3["Hosted vs custom tool usage"]
        M4["Error / timeout rate"]
    end
    App -.emits.-> Obs
    App --> Approval["Human-approval gate\n(consequential tool calls)"]
~~~

Every box here maps to a skill on this platform: **Structured Outputs** and **Tool Calling** govern the shape and authorization discipline for function_call handling; **Context Engineering** informs the chain-length guard's summarization strategy; **RAG** is the alternative to a hosted search tool when more control is needed; **Agent-to-Agent (A2A) Protocol** is the separate layer for this agent talking to a different, independently-built agent, not shown here since it's outside this API's scope.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((OpenAI Responses API))
    The Problem
      Chat Completions vs Assistants API fragmentation
      Resending full history every call
      Separate mental models for simple vs agentic use
    Core Mechanisms
      previous_response_id chaining
      Output items model
        message
        function_call
        reasoning
        hosted tool results
      text_format structured output
    Tools
      Custom function tools
        caller executes and responds
      Hosted tools
        web search
        code execution
        already resolved by platform
    Architecture Discipline
      Own conversation store as source of truth
      Chain length and context management
      Authorization before tool execution
      Human approval for consequential actions
    Security
      Hosted tools as a trust boundary
      Data retention considerations
      Schema valid is not authorized
      Prompt injection via retrieved content
    Production Practice
      Timeouts and retries
      Output-item-type monitoring
      Chain-length monitoring
      Hosted vs custom tool cost tracking
    Relationship to Other Layers
      Structured Outputs underneath
      Tool Calling underneath
      NOT Agent-to-Agent Protocol
      Complements LangGraph and CrewAI
    Connections
      Structured Outputs
      Tool Calling
      OpenAI Realtime API
      Agent-to-Agent Protocol
      Context Engineering
~~~
`,
};

export default openaiResponsesApi;
