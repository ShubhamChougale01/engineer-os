import type { SkillContent } from "../types";

/**
 * LangChain — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const langchain: SkillContent = {
  overview: `
LangChain is a framework for composing large language model calls into applications: prompt templates, chains of steps, retrievers, memory, and agents that can call tools. It was the framework that turned "call an LLM API" into "build an LLM application" for a huge fraction of the industry — when people in 2023 said "I'm building with LLMs," a large share of them meant "I'm gluing things together with LangChain." It ships in two actively maintained flavors, a Python package and a JavaScript/TypeScript package, with broadly parallel (but not identical) APIs.

For an AI engineer, LangChain matters less because of any single clever abstraction and more because of ubiquity and surface area: it has adapters for dozens of LLM providers, vector stores, document loaders, and tool integrations, so it is frequently the fastest path to "something working end to end" during prototyping. Its core compositional idea is LCEL (LangChain Expression Language) — a pipe-based syntax (the "|" operator) for wiring a prompt template, a model, and an output parser into a single runnable object that supports streaming, batching, and async execution uniformly, without you hand-writing that plumbing for every chain.

Key characteristics: a large and famously fast-moving API surface (concepts and class names have been renamed, deprecated, and reorganized repeatedly across versions); a strong ecosystem gravity — LangSmith for tracing/observability and LangGraph for stateful, graph-based agent orchestration are both built by the same company and integrate tightly with LangChain primitives; a "batteries included" philosophy that trades some directness for breadth of integrations. It is one of several viable ways to build LLM applications, alongside going closer to the metal with raw provider SDKs, or using narrower-focus frameworks like LlamaIndex (data/RAG-first), PydanticAI (typed, agent-first, deliberately minimal), or DSPy (programmatic prompt/pipeline optimization). Knowing when LangChain is the right tool — and when it is unnecessary ceremony over three lines of API code — is itself a core skill covered in this page.
`,

  history: `
LangChain was created by **Harrison Chase**, released as an open-source Python package in **October 2022**, weeks before ChatGPT's public launch accelerated interest in LLM application development enormously. It arrived at the right moment: developers suddenly needed a way to chain prompts, manage context, and connect models to external data and tools, and LangChain was one of the first frameworks to name and package those patterns.

| Year | Milestone |
|------|-----------|
| Oct 2022 | Initial Python release — chains, prompt templates, early agents |
| 2023 (early) | JS/TS port released; explosive community growth as ChatGPT-era interest peaked |
| 2023 (mid) | LangChain, Inc. formed; seed and Series A funding; "agents" (ReAct-style) become a headline feature |
| 2023 (late) | LangSmith launched — tracing, evaluation, and observability platform for LangChain (and non-LangChain) apps |
| 2024 | Major refactor: langchain-core (interfaces), langchain (chains/agents), and langchain-community (third-party integrations) split into separate packages to control dependency bloat and versioning churn |
| 2024 | LCEL (LangChain Expression Language) established as the recommended way to compose runnables, largely superseding the older **Chain** subclassing pattern for new code |
| 2024 | LangGraph introduced as a lower-level, graph-based orchestration layer for stateful, cyclical agent workflows, positioned as the recommended path once agent logic outgrows a simple LCEL chain |
| 2024-2025 | Legacy **AgentExecutor** and many chain classes marked as legacy in favor of LangGraph for anything with loops, branching, or human-in-the-loop steps |
| 2025 | Continued consolidation around LCEL + LangGraph + LangSmith as the three pillars, with the plain "chain" abstraction increasingly a thin on-ramp rather than the end state for production agents |

The throughline across this history is a framework that has repeatedly reinvented its own core abstractions in response to what the community actually built with it — which is exactly why version churn is a first-class fact to internalize, not a footnote (see Latest Updates and FAQs).
`,

  "why-it-exists": `
Before LangChain, calling an LLM API directly was simple for a single request-response call, but real applications need more: injecting variables into prompts consistently, chaining the output of one call into the input of the next, retrieving relevant context from external data before generating an answer, remembering prior conversation turns, and letting the model decide to call external tools rather than only produce text. Every team building these patterns in late 2022 was writing similar glue code — string formatting for prompts, manual loops for multi-step reasoning, ad hoc wrappers around whichever vector store or search API they'd picked — with no shared vocabulary or reusable abstractions.

LangChain named these patterns (chain, prompt template, memory, retriever, agent, tool) and gave them a common interface, so that swapping one LLM provider for another, or one vector store for another, became a constructor argument change instead of a rewrite. That standardization value — a lingua franca for "LLM app pieces" plus a large directory of ready-made integrations — is the actual gap LangChain filled, more than any single technically novel idea. It let people go from "I have an OpenAI API key" to "I have a working RAG chatbot" in an afternoon of following documentation and examples, which is precisely why it grew so fast at the moment interest in LLM apps exploded.
`,

  "problem-it-solves": `
LangChain removes concrete, recurring pains in building multi-step or tool-using LLM applications:

- **Prompt templating and reuse**: parameterized prompt templates instead of ad hoc f-strings scattered through a codebase, with partial variables, few-shot example injection, and message-role formatting handled consistently.
- **Composition without hand-rolled plumbing**: LCEL's pipe syntax lets a prompt, model, and output parser compose into one object that automatically supports streaming, batch, and async — you do not reimplement that for every new chain.
- **Integration sprawl**: a single, mostly consistent interface across dozens of LLM providers, vector stores, embedding models, and document loaders, so switching providers is a constructor argument change, not a rewrite.
- **Output structuring**: output parsers (and, increasingly, model-native structured output / tool-calling APIs wrapped uniformly) turn raw text completions into typed Python objects or JSON reliably.
- **Retrieval wiring for RAG**: retriever interfaces that plug into chains so "fetch relevant context, then answer" is a composition, not a bespoke pipeline per project — see the RAG skill for the pattern LangChain implements here.
- **Basic conversational memory**: message history classes that persist and inject prior turns into a prompt without you managing a raw list of dicts by hand.

What LangChain deliberately does **not** solve, or does not solve better than alternatives:

- **It is not a data-indexing specialist.** For deep RAG needs — many document types, multiple index structures, sophisticated chunking/reranking pipelines — LlamaIndex is narrower and more opinionated about that specific problem; LangChain's retriever interface is a thinner abstraction by comparison.
- **It does not optimize prompts programmatically.** DSPy treats prompts as compiled artifacts it searches over; LangChain treats prompts as strings you write and iterate on manually.
- **It is not the best answer for complex, stateful agent control flow.** Cyclical graphs, human-in-the-loop interrupts, and durable execution are LangGraph's job now, built as a lower-level complement to LangChain rather than something the original chain/AgentExecutor abstractions handle well.
- **It does not replace understanding the underlying LLM APIs.** Debugging a LangChain application ultimately still requires understanding what request is actually being sent to the model — the abstraction can obscure this as often as it helps.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what LangChain actually is (a composition and integration layer) and what it is not (a data-indexing specialist, a prompt optimizer, or a replacement for understanding raw LLM APIs).
2. Build an LCEL chain composing a prompt template, a chat model, and an output parser, and explain why the pipe syntax gives you streaming/batch/async for free.
3. Choose and configure a retriever for RAG use cases and compose it into a chain, understanding where LangChain's abstraction ends and where LlamaIndex-style depth begins.
4. Use output parsers and structured-output APIs to get typed, validated data out of an LLM call instead of parsing free text yourself.
5. Add conversational memory to a chain and explain the tradeoffs between different memory strategies (buffer, summary, windowed).
6. Build a basic tool-calling agent with LangChain and explain when to escalate to LangGraph instead of pushing more complexity into **AgentExecutor**.
7. Diagnose a broken chain using LangSmith traces, understanding what the framework actually sent to the model at each step.
8. Make an honest, defensible decision about when LangChain is worth its abstraction cost versus when three lines of a raw SDK call are simply better engineering.
9. Navigate LangChain's package structure (langchain-core, langchain, langchain-community, provider-specific packages) and know how to verify current, non-deprecated APIs instead of trusting memorized version-specific syntax.
`,

  prerequisites: `
- **Required**: comfortable Python or JavaScript/TypeScript (this page uses Python idioms primarily, since that is LangChain's more mature and widely used surface — see the **Python** skill); a working understanding of what an LLM chat completion call looks like (messages in, text or structured output out).
- **Required conceptually**: the **Prompt Engineering** skill, since prompt templates are one of LangChain's most-used primitives and this page assumes you already know what makes a prompt effective, focusing instead on how LangChain packages and reuses them.
- **Strongly recommended**: the **RAG** skill for the retrieval-augmented-generation pattern LangChain's retriever interface implements, and the **Tool Calling** skill for the mechanism agents use to invoke external functions — this page assumes you understand both concepts and focuses on LangChain's specific implementation.
- **Helpful**: the **Agent Fundamentals** skill for the loop/tool/planning vocabulary used when discussing LangChain agents; the **Agent Memory** skill for the deeper theory behind the memory classes covered here at an implementation level.
- **Helpful for comparisons**: the **LlamaIndex**, **PydanticAI**, and **DSPy** skills, referenced throughout for contrast; the **LangGraph** and **LangSmith** skills, which are LangChain's own sibling projects and are referenced here as the recommended escalation path for complex agents and for observability, respectively.

Dependency chain on this platform: **Python** → **Prompt Engineering** → **Tool Calling** / **RAG** → **this page** → **LangGraph** (for stateful multi-step agents) and **LangSmith** (for tracing/evaluation) as the natural next steps.
`,

  "beginner-concepts": `
### Your first LLM call through LangChain

LangChain wraps provider SDKs behind a common chat model interface so switching providers is a constructor change.

~~~python
from langchain_openai import ChatOpenAI

# temperature and timeout are explicit; never leave a production call
# without a timeout, since a hung request otherwise blocks indefinitely
model = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, timeout=30)

response = model.invoke("Explain LCEL in one sentence.")
print(response.content)
~~~

Note honestly: **invoke** is the current idiom across recent LangChain versions, replacing older direct-call patterns from 2023-era code you may still see in tutorials — LangChain's API has churned enough that treating any single snippet (including this one) as permanently authoritative is a mistake; always check the installed version's docs when something does not behave as shown here.

### Prompt templates

A **PromptTemplate** (for plain-text prompts) or **ChatPromptTemplate** (for chat-style, role-tagged messages) parameterizes a prompt so you fill in variables instead of concatenating strings by hand.

~~~python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a concise assistant for {domain} questions."),
    ("human", "{question}"),
])

# .invoke() fills the template's variables and returns a list of messages
messages = prompt.invoke({"domain": "billing", "question": "How do refunds work?"})
print(messages.to_messages())
~~~

### LCEL: composing with the pipe operator

The single most important beginner concept is LCEL's "|" operator: it chains a prompt, a model, and an output parser into one runnable object.

~~~python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()

# one call, but internally: fill template -> call model -> parse to plain string
answer = chain.invoke({"domain": "billing", "question": "How do refunds work?"})
print(answer)
~~~

Every piece in that pipe implements the same **Runnable** interface, which is why the same chain object transparently supports **.invoke()** (single call), **.batch()** (many inputs concurrently), **.stream()** (token-by-token output), and their async equivalents (**.ainvoke()**, **.abatch()**, **.astream()**) without you writing separate code paths for each.

### Output parsers

Output parsers turn a raw model response into a structured Python value.

~~~python
from langchain_core.output_parsers import JsonOutputParser

json_chain = prompt | model | JsonOutputParser()
# Prompts the model to produce JSON, then parses it — fragile if the model
# doesn't comply exactly; see Intermediate Concepts for the more reliable
# structured-output approach built on native tool-calling APIs.
~~~

Common beginner trap: reaching for LangChain to make a single, one-off LLM call. If your entire "chain" is "format one prompt, call one model, print the text," you have added an abstraction layer, two extra imports, and a dependency on LangChain's versioning churn for something three lines of the raw provider SDK do just as well. LangChain earns its cost when there are multiple composed steps, swappable providers, or reusable structure — not for a single call (see Anti-Patterns and FAQs for this argument in depth).
`,

  "intermediate-concepts": `
### Structured output the reliable way

Parsing free-text JSON is fragile. Modern LangChain leans on the underlying model provider's native structured-output or tool-calling capability instead, wrapped uniformly:

~~~python
from pydantic import BaseModel, Field

class RefundDecision(BaseModel):
    eligible: bool = Field(description="Whether the refund is eligible")
    reason: str = Field(description="Short justification")

# with_structured_output binds the schema to the underlying provider's
# native structured-output/tool-calling mechanism rather than asking the
# model to "please output JSON" and hoping the parser can clean it up
structured_model = model.with_structured_output(RefundDecision)
result = structured_model.invoke("Customer wants a refund after 45 days, policy is 30 days.")
print(result.eligible, result.reason)
~~~

This is meaningfully more reliable than a text-based JsonOutputParser because it uses the provider's own schema-constrained generation rather than hoping the model's free text happens to parse — the same idea underlies PydanticAI's whole design philosophy, just implemented as one option among many in LangChain rather than the framework's central premise.

### Retrievers and RAG composition

A **retriever** is anything that, given a query string, returns relevant documents. LangChain composes retrievers into chains the same way it composes models.

~~~python
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# vectorstore is assumed already populated - see the RAG and Vector
# Databases skills for how documents get embedded and indexed
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer using only the provided context. If the context "
               "doesn't contain the answer, say you don't know.\\n\\nContext:\\n{context}"),
    ("human", "{question}"),
])

def format_docs(docs):
    return "\\n\\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | model
    | StrOutputParser()
)

answer = rag_chain.invoke("What is our refund window?")
~~~

This is a complete, honest LCEL RAG example: the dict on the left runs **retriever | format_docs** and passes the raw question through in parallel, both feeding into the prompt template. For deep RAG needs — many document types, multiple index structures, reranking, hybrid search — the LlamaIndex skill covers a framework that treats this exact problem as its central mission with considerably more depth than LangChain's retriever abstraction offers out of the box.

### Memory: giving a chain conversation history

~~~python
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store: dict[str, InMemoryChatMessageHistory] = {}

def get_history(session_id: str) -> InMemoryChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

chat_chain = prompt | model
chain_with_history = RunnableWithMessageHistory(
    chat_chain, get_history,
    input_messages_key="question", history_messages_key="history",
)

# each call with the same session_id sees prior turns injected automatically
response = chain_with_history.invoke(
    {"question": "And what about annual plans?"},
    config={"configurable": {"session_id": "user-42"}},
)
~~~

This pattern replaced LangChain's older, now-legacy **ConversationBufferMemory**-style classes; the underlying idea (persist message history, inject it into the prompt on each call) is unchanged, but the concrete API has moved — another instance of the version churn to expect and plan for. Naive buffer memory grows unboundedly with conversation length and eventually blows the context window or the token budget; production systems window it (keep last N turns), summarize older turns, or use a dedicated store — see the **Agent Memory** skill for the deeper theory behind these strategies.

### Runnable composition primitives beyond the simple pipe

~~~python
from langchain_core.runnables import RunnableParallel, RunnableLambda

# Run several sub-chains concurrently on the same input, merge results
parallel = RunnableParallel(
    summary=summarize_chain,
    sentiment=sentiment_chain,
)

# Wrap arbitrary Python logic as a first-class Runnable so it can be
# piped alongside prompts/models with the same streaming/batch semantics
double = RunnableLambda(lambda x: x * 2)
~~~
`,

  "advanced-concepts": `
### Tool calling and agents

A LangChain **tool** is a Python function (or class) with a name, description, and typed arguments that a model can choose to call. An **agent** is a loop: call the model, check if it requested a tool call, execute the tool, feed the result back, repeat until the model produces a final answer.

~~~python
from langchain_core.tools import tool

@tool
def get_order_status(order_id: str) -> str:
    "Look up the current shipping status for a given order ID."
    # in production: call a real order-service API with a timeout,
    # and handle the not-found case explicitly rather than raising
    return f"Order {order_id} is out for delivery."

model_with_tools = model.bind_tools([get_order_status])
response = model_with_tools.invoke("Where is order A123?")
# response.tool_calls contains the model's requested tool invocation(s);
# your code (or an AgentExecutor/LangGraph loop) must actually execute
# them and feed the result back for the model to produce a final answer
~~~

The tool's docstring is not decoration — it is the description the model reads to decide when and how to call the tool, exactly as covered in the **Tool Calling** skill. A vague docstring produces a model that either never calls the tool or calls it with wrong arguments.

### AgentExecutor versus LangGraph

LangChain's original agent abstraction, **AgentExecutor**, runs a fixed reasoning-and-acting loop (classically ReAct-style: think, act, observe, repeat) until the model stops requesting tools. It is straightforward for simple, single-loop tool-calling agents but becomes awkward once you need: branching logic based on tool results, human-in-the-loop approval steps, persistent state across a long-running task, or explicit control over retries and error recovery. LangChain's own current guidance is to reach for **LangGraph** once an agent's control flow needs anything beyond a simple loop — LangGraph models the agent explicitly as a graph of nodes and edges with a shared state object, which makes cycles, conditionals, and interrupts first-class instead of something you fight the executor to express. In practice, many teams prototype with a simple LCEL chain or **AgentExecutor**, then migrate the same tools and prompts into a LangGraph graph once real requirements (approval steps, retries, parallel tool calls with reconciliation) show up.

### Streaming internals

Because every LCEL component implements the same Runnable interface, streaming composes automatically: a chat model's **.stream()** yields tokens as they arrive from the provider, and each subsequent step in the chain (an output parser, a formatting function) can be built to pass chunks through incrementally rather than waiting for the full response. This is why **.stream()** on a whole chain, not just a single model call, is a first-class LCEL feature rather than something you bolt on separately per chain.

~~~python
for chunk in chain.stream({"domain": "billing", "question": "Refund window?"}):
    print(chunk, end="", flush=True)
~~~

### Batching and concurrency

~~~python
questions = [{"domain": "billing", "question": q} for q in [
    "Refund window?", "Do you support annual billing?", "Where's my invoice?",
]]

# .batch() runs requests concurrently up to a configurable max_concurrency,
# rather than sequentially — important for both latency and cost when you
# have many independent LLM calls to make (e.g. batch classification jobs)
answers = chain.batch(questions, config={"max_concurrency": 5})
~~~

### Runnable configuration and fallbacks

~~~python
resilient_model = model.with_retry(stop_after_attempt=3).with_fallbacks([
    ChatOpenAI(model="gpt-4o", timeout=30),  # a stronger fallback model
])
~~~

Retry and fallback wrapping matters in production because LLM API calls fail for reasons unrelated to your prompt: rate limits, transient network errors, provider outages. Wrapping every production-facing chain with retry/fallback logic is table stakes, not an advanced trick — see Best Practices.

### Decision table: LCEL chain versus AgentExecutor versus LangGraph

| Situation | Reach for |
|-----------|-----------|
| Fixed sequence of steps, no branching, no tool-calling loop | Plain LCEL chain |
| Model picks from a small, fixed tool set in a single reasoning loop | **AgentExecutor** (or an equivalent simple LangGraph graph) |
| Multi-step reasoning with branching, retries, or approval gates | LangGraph |
| Long-running, resumable, or human-in-the-loop workflows | LangGraph (with checkpointing) |
| Multiple cooperating agents with distinct roles | LangGraph (graph of agent nodes) or a dedicated multi-agent framework |
`,

  "internal-working": `
Understanding what actually happens when an LCEL chain runs demystifies most debugging:

~~~mermaid
flowchart LR
    I["Input dict\n(e.g. {question, domain})"] --> P["PromptTemplate.invoke()\nfills variables -> messages"]
    P --> M["ChatModel.invoke()\nsends messages to provider API"]
    M --> R["Raw API response\n(text or tool_calls)"]
    R --> O["OutputParser.invoke()\nparses to string/JSON/typed object"]
    O --> OUT["Final chain output"]
~~~

Step by step:

1. **.invoke() on the composed chain** calls .invoke() on the first Runnable (the prompt template) with the input dict, producing a formatted list of role-tagged messages (system/human/ai).
2. **Those messages are passed to the chat model's .invoke()**, which serializes them into the specific request format the underlying provider's API expects (OpenAI, Anthropic, and others all have subtly different message/tool-call schemas — the chat model wrapper's whole job is normalizing this) and makes the actual HTTP call.
3. **The raw API response** — text content and/or structured tool-call requests — is wrapped into LangChain's own message object, which every downstream step operates on uniformly regardless of which provider produced it.
4. **The output parser's .invoke()** receives that message and transforms it: StrOutputParser extracts plain text, JsonOutputParser parses (and often auto-repairs) JSON, a structured-output parser validates against a Pydantic schema.
5. **Streaming works by the same composition, incrementally**: .stream() calls each step's streaming variant, passing partial chunks downstream as they arrive rather than waiting for the full output of each stage — this is why a well-built chain can stream tokens end-to-end even through an output parser, provided that parser supports incremental parsing (not all do; some necessarily buffer until the full output is available, e.g. full-document JSON parsing).

For agents, the loop adds one more layer: after step 3, the executor (or a LangGraph node) inspects the response for tool_calls, executes the matching Python function(s), appends the tool result as a new message, and re-invokes the model with the updated message history — repeating until the model responds without further tool calls.
`,

  architecture: `
### Runtime architecture

~~~mermaid
flowchart TB
    subgraph App["Your application"]
        Prompts["Prompt templates"] --> Chain["LCEL chain\n(Runnable composition)"]
        Retr["Retriever\n(vector store client)"] --> Chain
        Mem["Message history store"] --> Chain
        Tools["Tools (typed functions)"] --> Agent["Agent loop\n(AgentExecutor or LangGraph)"]
        Chain --> Agent
    end
    Agent --> ModelAPI["LLM provider API\n(OpenAI/Anthropic/etc.)"]
    Chain --> ModelAPI
    Retr --> VS[("Vector store")]
    App -.traces/spans.-> LangSmith["LangSmith\n(tracing, eval, monitoring)"]
~~~

The architectural core is the **Runnable** interface: every composable piece (prompt, model, parser, retriever, even arbitrary functions wrapped via **RunnableLambda**) implements the same **.invoke/.batch/.stream** (and async variants) contract, which is what makes the pipe operator ("|") meaningful — it is function composition over a shared interface, not special-cased syntax per pair of types.

### Package layout (as of the current split architecture)

- **langchain-core**: the base abstractions — Runnable, messages, prompt templates, output parsers. Minimal dependencies, meant to be stable.
- **langchain**: chains, agents, and other higher-level constructs built on langchain-core.
- **langchain-community**: third-party integrations (vector stores, document loaders, tools) that don't warrant their own dedicated package.
- **Provider-specific packages** (langchain-openai, langchain-anthropic, langchain-qdrant, etc.): first-party-maintained integrations that graduated out of langchain-community for better versioning and support.

### Application layout for a production LangChain service

~~~
llmservice/
├── pyproject.toml
├── src/llmservice/
│   ├── chains/
│   │   ├── rag_chain.py       # retriever + prompt + model + parser composition
│   │   └── classify_chain.py  # structured-output classification chain
│   ├── agents/
│   │   └── support_agent.py   # tool-calling agent (or LangGraph graph)
│   ├── tools/
│   │   └── order_tools.py     # typed @tool functions
│   ├── memory/
│   │   └── history_store.py   # session-keyed chat history backend
│   ├── api/                   # FastAPI routes exposing /chat, /classify
│   └── observability/
│       └── langsmith_config.py
└── tests/
~~~

This mirrors the LlamaIndex and general agent-service layouts on this platform: chains/agents depend on tools and memory, the API layer depends on chains/agents (never the reverse), and observability config is wired once at startup, not scattered per call.
`,

  "data-flow": `
Tracing one tool-calling agent turn end to end as a sequence diagram:

~~~mermaid
sequenceDiagram
    participant User
    participant Agent as Agent loop
    participant LLM as LLM API
    participant Tool as get_order_status()
    participant LS as LangSmith

    User->>Agent: invoke("Where is order A123?")
    Agent->>LLM: messages + tool schemas
    LLM-->>Agent: tool_call: get_order_status(order_id="A123")
    Agent->>LS: log span (model call + tool_call)
    Agent->>Tool: execute(order_id="A123")
    Tool-->>Agent: "out for delivery"
    Agent->>LLM: messages + tool result appended
    LLM-->>Agent: final text answer
    Agent->>LS: log span (final answer)
    Agent-->>User: "Order A123 is out for delivery."
~~~

The most misunderstood part for newcomers is that the model never directly executes anything — it only ever requests a tool call by name and arguments; your application code (the AgentExecutor, or a LangGraph node) is responsible for actually invoking the Python function and feeding the result back as a new message. A "tool didn't run" bug is therefore always an application-code bug (the tool wasn't registered, threw an exception that wasn't handled, or the executor didn't loop again), never something to look for inside the model itself. LangSmith traces (see Monitoring) are the fastest way to see exactly which step in this sequence went wrong, because they capture the literal request/response payloads at each hop.
`,

  "production-usage": `
### Model and chain configuration

~~~python
from langchain_openai import ChatOpenAI

# Explicit timeout and max_retries are non-negotiable in production;
# the defaults are not always conservative enough for a user-facing path
model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
    timeout=20,
    max_retries=2,
)
~~~

### Environment and secrets

~~~python
import os
# LangChain's provider integrations read API keys from environment
# variables by convention (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.);
# never hardcode keys in source, and load them via a secrets manager
# in production rather than a plain .env file — see the Secrets
# Management skill for the broader discipline.
os.environ.setdefault("OPENAI_API_KEY", "")
~~~

### Enabling LangSmith tracing

~~~python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "..."
os.environ["LANGCHAIN_PROJECT"] = "support-agent-prod"
# once set, every chain/agent invocation is automatically traced to
# LangSmith with no per-call code changes required — see the LangSmith
# skill for the full observability story this enables
~~~

Non-negotiables for production:

1. **Set explicit timeouts and retry limits** on every model call — a hung request otherwise blocks a worker indefinitely, and unbounded retries can amplify an outage into a self-inflicted rate-limit spiral.
2. **Pin LangChain package versions explicitly** (langchain-core, langchain, and each provider package) in your lockfile; the framework's churn means an unpinned upgrade can silently change or deprecate behavior you depend on.
3. **Enable LangSmith (or an equivalent tracing setup) before you need it**, not after the first confusing production incident — reconstructing what a chain actually sent to the model after the fact, without traces, is much harder.
4. **Treat every tool function as untrusted-input-adjacent**: validate arguments, set timeouts on tool execution, and never let a tool call perform an unbounded or irreversible side effect without an explicit confirmation step.
5. **Separate the "just call the LLM" cases from the "genuinely needs composition" cases deliberately** — do not reach for a full chain, memory class, and output parser for a single stateless classification call where three lines of the raw SDK plus a Pydantic model would be clearer and have fewer moving parts.
`,

  "industry-examples": `
- **Klarna**: has publicly discussed using LangChain-style LLM orchestration as part of its AI customer-service assistant, which handles a large share of customer chats — a canonical "structured, tool-using conversational agent over internal systems" use case.
- **Notion AI** and similar "AI features embedded in an existing product" teams commonly reach for LangChain's chain/retriever primitives to wire up features like Q&A over a workspace's own content, where the value is fast integration across multiple LLM/vector-store choices rather than one bespoke pipeline per feature.
- **Many enterprise "internal chatbot over our docs/tickets/wiki" projects** across consulting and internal-tools teams use LangChain specifically because of its breadth of first-party and community integrations (loaders for Confluence, Notion, SharePoint, Slack, and dozens more) — the same "format sprawl" problem LlamaIndex also targets, from a different angle.
- **Startups building agentic products** (customer support automation, sales-ops copilots, internal workflow assistants) frequently start with LangChain for its documentation and examples density, then increasingly migrate the agent-control-flow parts to LangGraph once the product needs branching, retries, or human approval steps that a simple **AgentExecutor** loop handles awkwardly.

Pattern to notice: the common thread is fast integration breadth (many providers, many data sources, many tools) mattering more than any single deeply optimized pipeline — precisely LangChain's strength, and precisely why teams with a narrower, deeper need (heavy RAG tuning, prompt-program optimization, minimal typed agents) often reach for LlamaIndex, DSPy, or PydanticAI instead for that specific slice of the system.
`,

  "best-practices": `
1. **Default to raw provider SDK calls for single, non-composed LLM calls**; reach for LangChain when you actually have multiple composed steps, swappable providers, or reusable structure across many call sites.
2. **Pin exact versions of langchain-core, langchain, langchain-community, and every provider package** in your lockfile — do not let a routine dependency update silently change chain behavior.
3. **Prefer with_structured_output over text-based JSON output parsers** whenever the underlying model supports native structured output/tool-calling — it is materially more reliable.
4. **Set explicit timeouts and bounded retries on every model call**, and add fallback models for user-facing paths where availability matters more than always using the primary model.
5. **Enable LangSmith tracing (or equivalent) from day one in any non-trivial application** — reconstructing chain behavior after an incident without traces wastes far more time than the setup cost.
6. **Escalate from AgentExecutor to LangGraph as soon as you need branching, retries, human-in-the-loop steps, or persistent state** — do not keep bending the simple executor to fit control flow it wasn't designed for.
7. **Write tool docstrings as carefully as you write prompts** — the model reads them to decide when and how to call a tool; a vague docstring produces unreliable tool selection.
8. **Window or summarize conversational memory deliberately**; never let an unbounded message history grow until it silently blows the context window or the token budget.
9. **Treat every tool function as a security boundary**: validate inputs, timebox execution, and gate irreversible actions (payments, deletions, external sends) behind an explicit confirmation step, never a bare model decision.
10. **Test chains against fixed, versioned prompt/model configurations** — a chain's behavior can shift when the underlying model version changes even if your code doesn't, so evaluation (see Testing) needs to catch that independently of code review.
11. **Read the changelog before every LangChain upgrade.** Given the framework's history of renamed and deprecated APIs, treat upgrades as a deliberate, tested activity, not a routine **pip install -U**.
12. **Keep a clear mental model of what a chain actually sends to the model** — use LangSmith or verbose logging to inspect the literal request payload when a chain behaves unexpectedly, rather than guessing from the abstraction alone.
`,

  "anti-patterns": `
### Using a full chain for a single stateless call

~~~python
# WRONG: three extra imports and a dependency on LangChain's own
# versioning churn, for something that doesn't compose or reuse anything
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([("human", "Summarize: {text}")])
chain = prompt | ChatOpenAI(model="gpt-4o-mini") | StrOutputParser()
summary = chain.invoke({"text": document})

# RIGHT (for a single, non-reused call): call the provider SDK directly
from openai import OpenAI
client = OpenAI()
summary = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": f"Summarize: {document}"}],
    timeout=20,
).choices[0].message.content
~~~

### Other production-grade anti-patterns

- **Unbounded conversational memory.** Feeding an ever-growing raw message history into every call eventually blows the context window and inflates cost linearly with conversation length; window or summarize deliberately (see Intermediate Concepts).
- **Text-based JSON parsing when structured output is available.** Asking the model to "output valid JSON" and hand-parsing it is measurably less reliable than **with_structured_output** against the provider's native schema-constrained generation.
- **No timeout or retry policy on model calls.** A single hung request blocks a worker indefinitely in a naive setup; production paths need explicit timeouts, bounded retries, and ideally a fallback model.
- **Bending AgentExecutor to force branching or approval-gate logic it wasn't designed for**, instead of migrating to LangGraph once control flow genuinely needs cycles or conditionals.
- **Pinning nothing and upgrading LangChain casually.** Given the documented history of renamed/deprecated classes across versions, an unpinned dependency update is a realistic source of silent production breakage.
- **Vague tool docstrings.** A tool named **process** with a one-word description gives the model almost nothing to reason about when deciding whether and how to call it — write tool descriptions with the same care as a prompt.
- **Treating LangChain verbosity as inherent to LLM application code.** Some of the community criticism of LangChain (see FAQs) stems from real cases where a simple task was made to look complex through unnecessary layers of abstraction; recognizing when that's happening in your own code is a mark of seniority, not a criticism to dismiss reflexively.
`,

  performance: `
### Measure first

~~~python
import time

start = time.perf_counter()
response = chain.invoke({"question": "..."})
print(f"chain call took {time.perf_counter() - start:.2f}s")
~~~

LangSmith traces (see Monitoring) give per-step timing automatically — model call latency, retriever latency, tool execution latency — which is almost always more informative than ad hoc timers, because most "LangChain is slow" complaints are actually one slow model call or one slow retriever, not framework overhead itself.

### The optimization hierarchy (apply in order)

1. **Identify which hop is actually slow using traces before optimizing anything.** Guessing between "the model," "the retriever," and "the framework" without data wastes effort on the wrong lever.
2. **Reduce the number of sequential model calls.** A chain that calls the model three times sequentially (rewrite query, retrieve, synthesize) is three times the latency of one well-designed call; consolidate steps where quality allows, or run independent steps in parallel with **RunnableParallel**.
3. **Stream responses to improve perceived latency** on user-facing paths, even when total generation time is unchanged — **.stream()** composes through the whole chain as covered in Advanced Concepts.
4. **Batch independent calls** with **.batch()** and a tuned **max_concurrency** rather than looping sequentially over many independent inputs (bulk classification, bulk summarization jobs).
5. **Cache deterministic sub-steps** (embeddings for a static corpus, prompts with no dynamic content) rather than recomputing them on every request.
6. **Choose the smallest model that meets the quality bar for each step** — a query-rewrite or classification sub-step rarely needs the same model as the final synthesis step; mixing model sizes across a chain's steps is a real cost lever.

### Numbers worth internalizing

Model API latency dominates almost every LangChain chain's total time by a wide margin over the framework's own Python-level overhead, which is typically single-digit milliseconds per Runnable hop; the actual performance work in a LangChain application is therefore about call count, call size, and model choice, not about the composition layer itself.
`,

  scalability: `
LangChain itself is a stateless orchestration library; scalability is a property of the model API, the vector store, and how you structure your own service around them.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["Chat API replica 1"]
    LB --> API2["Chat API replica N"]
    API1 & API2 --> ModelAPI["LLM provider API\n(rate-limited)"]
    API1 & API2 --> VS[("Vector store")]
    API1 & API2 --> LS["LangSmith\n(async trace ingestion)"]
~~~

### Scaling the request path

- **Horizontal**: chain/agent execution is stateless per request (given externalized session history and a shared vector store), so scale API replicas like any stateless service behind a load balancer.
- **Model API concurrency**: the real bottleneck at scale is almost always the LLM provider's rate limits and latency, not LangChain's own code — plan capacity around provider rate limits, use connection pooling, and consider request queuing/backoff for burst traffic.
- **Session/message history store**: externalize conversational memory to a shared store (Redis, a database) rather than in-process memory, so any replica can serve any session — see the **Redis** and **Agent Memory** skills.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| LLM provider rate limits under burst traffic | Request queuing, backoff, multiple API keys/regions, or a self-hosted inference cluster for high-volume traffic |
| In-process message history limiting horizontal scale | Externalize session history to Redis/a database, keyed by session ID |
| Sequential multi-step chains adding up latency | Parallelize independent steps with RunnableParallel; consolidate steps where quality allows |
| Vector store latency at large corpus size | Approximate nearest-neighbor indexing, sharding — see the Vector Databases skills |
| Tracing overhead at very high QPS | Sample traces rather than tracing every request, or batch trace ingestion asynchronously |
`,

  security: `
### LangChain-specific attack surface

1. **Prompt injection via retrieved or tool-returned content.** Any content a chain retrieves (documents, tool outputs, web search results) and feeds back into a subsequent model call is untrusted input from the model's perspective — a malicious document or API response can attempt to override the system prompt's instructions. Treat retrieved/tool content as data, not as trusted instructions, and keep system-level instructions clearly reinforced.
2. **Unsafe tool execution.** A tool that can run arbitrary code, execute shell commands, or perform irreversible actions (payments, deletions, sending external communications) should never be invoked purely on a model's decision without validation and, for high-stakes actions, an explicit human confirmation step. The model can be manipulated (via prompt injection or simply by being wrong) into requesting a harmful tool call.
3. **Secrets in chain configuration or logs.** API keys passed to model/vector-store constructors must come from environment variables or a secrets manager, never hardcoded; and verbose/debug logging of full chain inputs can inadvertently log secrets or sensitive user data if not scrubbed.
4. **SSRF via loaders and tools that fetch URLs.** Document loaders and tools that accept arbitrary URLs (web loaders, fetch tools) are a server-side request forgery vector if exposed to unauthenticated or unvalidated user input.
5. **Unbounded cost from unauthenticated endpoints.** A public chat endpoint without rate limiting or auth is a direct cost-abuse and prompt-injection vector, same as any LLM-backed endpoint.

### Defenses

- Apply the principle of least privilege to every tool: scope database credentials, API permissions, and file-system access as narrowly as the tool's function requires.
- Gate irreversible or high-value tool calls behind explicit confirmation, either a human-in-the-loop step (natural to express in LangGraph) or a secondary validation check.
- Scrub logs and traces of secrets and sensitive user data before they reach LangSmith or any third-party observability tool.
- Rate-limit and authenticate every user-facing chain/agent endpoint.

See the dedicated **Prompt Injection**, **OWASP Top 10 for LLM Applications**, and **Secrets Management** skills for depth beyond what's LangChain-specific here.
`,

  testing: `
### Testing a chain deterministically

~~~python
from langchain_core.language_models.fake_chat_models import FakeListChatModel

def test_rag_chain_uses_retrieved_context():
    fake_model = FakeListChatModel(responses=["The refund window is 30 days."])
    chain = rag_prompt | fake_model | StrOutputParser()
    result = chain.invoke({"context": "Refunds allowed within 30 days.",
                            "question": "What is the refund window?"})
    assert "30 days" in result
~~~

Using a fake/deterministic model for unit tests avoids real API calls (cost, latency, non-determinism) while still exercising the prompt formatting and output parsing logic — the parts of the chain that are actually your code, as opposed to the model's behavior.

### The senior testing doctrine for LangChain applications

- **Unit test the deterministic parts** (prompt template variable filling, output parser behavior, tool argument validation) against fake or mocked models, never against a live API in CI.
- **Integration test retrieval and tool execution against a small, controlled fixture set**, separate from generation-quality tests, so a retrieval regression and a generation regression are never conflated.
- **Evaluate generation quality with an LLM-as-judge or rule-based rubric against a frozen model version**, and treat a model version upgrade as a deliberate, re-evaluated decision — chain code being unchanged does not mean chain behavior is unchanged if the underlying model moved.
- **Never assert on exact LLM output text** for anything beyond a fake-model unit test; assert on structural properties (does the response cite the right source, does structured output validate against its schema) or LLM-judged criteria with a documented rubric.
- **Pin LangChain package versions in the test environment** matching production exactly, since API behavior differences across versions are a real, documented source of test-vs-prod mismatches.
`,

  debugging: `
### The toolbox, in escalation order

1. **Turn on LangSmith tracing (or verbose mode) and inspect the literal request/response payload at each step**, before touching the prompt or the model — most "the chain gave a wrong answer" bugs are visible immediately once you see what was actually sent.

~~~python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
# every subsequent chain.invoke() call is now traced to LangSmith,
# showing the exact prompt, model response, and any tool calls per step
~~~

2. **Isolate the failing step by calling it directly**, bypassing the rest of the chain — invoke just the retriever, or just the prompt template, to confirm which stage produced the unexpected output.
3. **Check package versions against the documentation you're reading.** A huge fraction of "this doesn't work like the tutorial says" issues are version mismatches — the class or method was renamed, moved, or deprecated between the tutorial's version and yours.
4. **Print the fully rendered prompt** (**prompt.invoke(inputs).to_messages()**) before it reaches the model — this catches template bugs (missing variables, wrong role tags, truncated context) invisible from the final answer alone.
5. **For agent/tool-calling bugs, inspect response.tool_calls directly** rather than assuming the model's intent from the final text — a tool that "didn't get called" is often the model choosing not to call it, visible only by inspecting the raw tool-call field.
6. **Reproduce with a fake/deterministic model** to separate "my chain's plumbing is wrong" from "the model's behavior is unexpected," the same isolation used in Testing.

### Debugging version-related breakage specifically

When an upgrade breaks a chain, check the specific package's changelog for renamed or deprecated classes before assuming a logic bug — LangChain's history includes several rounds of exactly this kind of churn (see History and Latest Updates), and the fix is very often "the import path or class name changed," not a deeper issue.
`,

  monitoring: `
Production visibility for LangChain applications rests on both general service observability (see the Observability category) and LangSmith's LangChain-specific tracing.

### LangSmith tracing

~~~python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "support-agent-prod"

# no other code changes needed — every chain/agent invocation is now
# traced automatically, including nested steps (retriever calls, tool
# calls, sub-chains), viewable as a structured trace tree in LangSmith
response = chain.invoke({"question": "..."})
~~~

See the dedicated **LangSmith** skill for the full observability platform this enables — trace inspection, dataset-based evaluation, and production monitoring dashboards built specifically around LangChain (and non-LangChain) LLM applications.

### Metrics to track beyond tracing

- **Per-step latency** (retriever, model call, tool execution) broken out separately, so a latency regression is attributable to the right stage.
- **Tool-call success/failure rate** and, separately, "the model chose not to call a tool when it should have" rate (harder to measure automatically, but visible via user feedback or spot review of traces).
- **Token usage and cost per chain type**, since different chains (a one-call classification chain versus a multi-step agent) have very different cost profiles that are easy to lose track of in aggregate spend dashboards.
- **Fallback/retry trigger rate** on model calls — a rising rate signals a provider-side reliability issue worth escalating before it becomes a user-facing incident.
- **User feedback signals** (thumbs up/down) joined back to the specific trace, building an evaluation dataset the same way described in Testing.
`,

  deployment: `
### A production Dockerfile for a LangChain-based chat API

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
COPY --from=builder /app/src /app/src
ENV PATH="/app/.venv/bin:$PATH"
ENV LANGCHAIN_TRACING_V2=true
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8000/healthz || exit 1
CMD ["uvicorn", "llmservice.api:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Line-by-line justification: a multi-stage build keeps the runtime image free of build tooling; **--frozen** ensures the lockfile (pinning exact LangChain package versions, given the framework's churn) is respected exactly rather than silently resolved fresh; a non-root user limits blast radius if the container is compromised; **LANGCHAIN_TRACING_V2=true** at the environment level means tracing is on by default in every environment this image runs in, rather than an opt-in someone forgets to enable in production; a healthcheck lets an orchestrator (Kubernetes, ECS) detect and restart a wedged process.

### Configuration checklist for deployment

- Model API keys and LangSmith API key injected via secrets manager, never baked into the image.
- Exact LangChain package versions pinned in the lockfile used to build the image.
- Timeouts and retry policy configured on every model client, not left at library defaults.
- LangSmith project name set per environment (dev/staging/prod) so traces don't mix across environments.
`,

  "production-checklist": `
- [ ] Exact versions of langchain-core, langchain, langchain-community, and every provider package pinned in the lockfile.
- [ ] Every model call has an explicit timeout and a bounded retry policy.
- [ ] A fallback model is configured for user-facing chains where availability matters.
- [ ] Structured output uses **with_structured_output** (native schema-constrained generation) rather than text-based JSON parsing, wherever the model supports it.
- [ ] LangSmith tracing (or an equivalent) is enabled in every environment, not just added reactively after an incident.
- [ ] Conversational memory is windowed or summarized, never allowed to grow unboundedly.
- [ ] Every tool function validates its inputs, has an execution timeout, and is scoped to least-privilege credentials.
- [ ] Irreversible or high-value tool calls (payments, deletions, external sends) are gated behind explicit confirmation, not a bare model decision.
- [ ] Secrets (API keys) are injected via environment/secrets manager, never hardcoded or logged.
- [ ] Retrieved and tool-returned content is treated as untrusted input in prompts, not as trusted system context.
- [ ] Rate limiting and authentication are applied to every user-facing chain/agent endpoint.
- [ ] Agent control flow that involves branching, retries, or human-in-the-loop steps has been migrated to LangGraph rather than forced into **AgentExecutor**.
- [ ] A frozen, versioned evaluation dataset exists for regression-testing generation quality across model or prompt changes.
- [ ] Per-step latency and token-usage metrics are tracked, not just end-to-end request latency.
- [ ] A documented process exists for testing and approving LangChain version upgrades before they reach production.
`,

  "common-mistakes": `
1. **Reaching for LangChain before establishing that composition is actually needed.** A single stateless call wrapped in a chain adds abstraction and a versioning dependency for no compositional benefit.
2. **Leaving model calls without timeouts.** The library does not force a conservative default; production code must set one explicitly.
3. **Trusting text-based JSON output parsing when native structured output is available.** It is measurably less reliable and unnecessarily fragile.
4. **Letting conversational memory grow unboundedly.** This silently inflates cost and eventually breaks on context-window limits.
5. **Writing vague tool docstrings.** The model's tool-selection quality is bounded by how clearly the tool's purpose and arguments are described.
6. **Forcing complex control flow into AgentExecutor.** Branching, retries, and human-in-the-loop steps are what LangGraph exists for; bending the simple executor to fit produces fragile, hard-to-follow code.
7. **Upgrading LangChain versions casually.** Given the documented churn, an unpinned or careless upgrade is a real, recurring source of production breakage.
8. **Treating retrieved or tool-returned content as trusted.** It is untrusted input from the model's perspective and a real prompt-injection surface.
9. **Not enabling tracing until after the first confusing incident.** Reconstructing chain behavior retroactively without traces is dramatically harder than having them from the start.
10. **Assuming the abstraction removes the need to understand the underlying model API.** Debugging ultimately requires knowing what request was actually sent — LangChain can obscure this as often as it clarifies it if you never look underneath.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| ImportError for a class from a tutorial | Class moved/renamed/deprecated between LangChain versions | Check the installed package version's docs; update the import path |
| Chain hangs indefinitely | No timeout set on the model client | Set an explicit timeout (and max_retries) on the chat model constructor |
| JSON parsing failure from JsonOutputParser | Model didn't produce strictly valid JSON | Switch to **with_structured_output** against a Pydantic schema instead of text-based parsing |
| Tool never gets called by the agent | Vague or missing tool docstring/description | Rewrite the docstring to clearly state when and how to use the tool |
| Context window exceeded partway through a conversation | Unbounded conversational memory | Window (keep last N turns) or summarize older history |
| Retrieved answer is confidently wrong | Retriever returned irrelevant/low-relevance documents | Inspect retrieved documents directly before touching the prompt; tune retriever/embedding config |
| Behavior changed after a routine **pip install -U** | Unpinned LangChain version drifted to a release with breaking changes | Pin exact versions in the lockfile; treat upgrades as a tested, deliberate step |
| Rate limit errors under moderate load | No retry/backoff or fallback model configured | Add **with_retry** and **with_fallbacks** to the model client |
`,

  faqs: `
**Is LangChain still relevant, or has it been superseded?**
It remains widely used, especially for prototyping and for applications that benefit from its integration breadth. But its own creators now position LangGraph as the recommended path for anything beyond simple chains, and many teams use LangChain primarily for its LCEL composition layer and integrations while handling complex agent control flow in LangGraph.

**Why do people criticize LangChain so much?**
The most common, legitimate criticisms are: real abstraction overhead for simple tasks (wrapping a single API call in several layers of framework), a genuinely fast-moving and sometimes confusing API surface across versions, and cases where debugging requires understanding the framework's internals almost as much as the underlying LLM API. These are fair critiques of overuse, not evidence that the framework is never useful — see Comparisons and Anti-Patterns for when it does and doesn't earn its cost.

**When should I just call the provider SDK directly instead?**
When your entire task is a single, non-reused LLM call with no branching, no swappable providers, and no need for streaming/batch composition across multiple steps. Three lines of the raw SDK are simpler, have zero extra dependencies, and are easier to debug than a one-step chain.

**Do I need LangSmith to use LangChain?**
No, it's optional, but strongly recommended for anything beyond a toy project — debugging chain behavior without traces is materially harder, especially for agents with tool calls.

**What's the difference between LangChain and LangGraph?**
LangChain provides the composable primitives (prompts, models, parsers, retrievers, tools) and simple chain/agent constructs; LangGraph is a lower-level graph-based orchestration layer, built by the same team, for expressing stateful, cyclical, branching agent control flow that a simple LCEL chain or **AgentExecutor** handles awkwardly.

**Is LangChain the right choice for a RAG-heavy application?**
It can work, but LlamaIndex is purpose-built for the data/retrieval side of RAG with more depth (multiple index types, more retrieval strategies) out of the box; many production RAG systems use LlamaIndex for ingestion/retrieval and LangChain (or LangGraph) for the surrounding agent/conversation logic.

**Why does old LangChain code from 2023 tutorials often not work anymore?**
The framework has undergone several deliberate refactors (the langchain-core/langchain/langchain-community split, LCEL becoming the recommended composition pattern, memory classes being reworked) — treat any single-version-pinned tutorial, including this page's examples, as a snapshot rather than an eternal API, and verify against current docs when in doubt.
`,

  "interview-questions": `
**Junior level**

1. *What is LCEL and why does the pipe ("|") operator matter?* Model answer: LCEL is LangChain's composition syntax; every component implements a shared Runnable interface, so piping them together automatically gives streaming, batch, and async support without hand-writing that plumbing per chain.

2. *What is the difference between a chain and an agent in LangChain?* Model answer: a chain is a fixed sequence of steps; an agent adds a loop where the model itself decides, per turn, whether to call a tool, and the loop continues until the model produces a final answer without further tool requests.

3. *Why would you use **with_structured_output** instead of a JSON output parser?* Model answer: it binds a schema to the model provider's native structured-output/tool-calling mechanism, which constrains generation at the API level, rather than hoping free text happens to parse as valid JSON.

4. *What does a retriever do in a LangChain RAG chain?* Model answer: given a query string, it returns relevant documents from a vector store (or other backend), which get formatted into the prompt's context before the model generates an answer.

**Senior level**

5. *When would you choose LangGraph over a plain LCEL chain or AgentExecutor, and why?* Model answer: once control flow needs branching, cycles, retries, or human-in-the-loop interrupts — LangGraph models these explicitly via a state graph, whereas AgentExecutor's fixed loop and LCEL's linear composition both become awkward to bend around that kind of logic.

6. *How do you debug a LangChain chain that's producing a subtly wrong answer in production?* Model answer: inspect the LangSmith trace (or verbose logs) to see the literal prompt sent and the raw retrieved documents/tool results before touching the prompt template or the model — most subtle-wrong-answer bugs are retrieval or tool-result bugs disguised as generation bugs.

7. *What are the real costs of adopting LangChain for a project, and when do they outweigh the benefits?* Model answer: an extra dependency surface with documented version churn, an abstraction layer that can obscure what's actually sent to the model, and a learning curve for the team; these outweigh the benefits when the application's actual composition needs are simple (a handful of stateless calls) and would be clearer as direct SDK calls.

8. *How would you design conversational memory for a high-traffic chat product built on LangChain?* Model answer: externalize message history to a shared, keyed store (not in-process), window or summarize older turns to bound token cost and latency, and make the memory strategy a deliberate, tested decision rather than defaulting to unbounded buffer memory.

9. *What's the security risk of feeding tool outputs back into the model, and how do you mitigate it?* Model answer: tool outputs (and retrieved documents) are untrusted input from the model's perspective and a real prompt-injection vector; mitigate by treating them as data rather than instructions in the prompt, and by gating any high-stakes action the model might request behind explicit validation or human confirmation.

10. *How do you handle a LangChain version upgrade safely in a production codebase?* Model answer: pin exact versions in the lockfile, read the changelog for renamed/deprecated APIs before upgrading, run the full evaluation/regression suite against the new version in a staging environment, and treat the upgrade as a deliberate, tested change rather than a routine dependency bump.
`,

  "coding-questions": `
### 1. Build a classification chain with structured output

~~~python
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

class TicketClassification(BaseModel):
    category: str
    urgent: bool

prompt = ChatPromptTemplate.from_messages([
    ("system", "Classify the support ticket's category and urgency."),
    ("human", "{ticket_text}"),
])
model = ChatOpenAI(model="gpt-4o-mini", temperature=0, timeout=20)
classifier = prompt | model.with_structured_output(TicketClassification)

result = classifier.invoke({"ticket_text": "My payment failed twice today, I need this fixed now."})
print(result.category, result.urgent)
~~~

Complexity: one model call, O(1) in chain steps; latency dominated by the API round trip. Follow-up: how would you batch-classify 10,000 historical tickets efficiently? (Answer: **.batch()** with a tuned **max_concurrency**, respecting the provider's rate limits, rather than a sequential loop.)

### 2. Build a RAG chain with source citation

~~~python
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

def format_with_sources(docs):
    return "\\n\\n".join(f"[{i}] {d.page_content}" for i, d in enumerate(docs))

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer using the numbered context. Cite sources like [0], [1]. "
               "If the context doesn't answer the question, say you don't know.\\n\\n{context}"),
    ("human", "{question}"),
])

rag_chain = (
    {"context": retriever | format_with_sources, "question": RunnablePassthrough()}
    | rag_prompt | model | StrOutputParser()
)
answer = rag_chain.invoke("What's our SLA for enterprise customers?")
~~~

Complexity: one retrieval call plus one model call. Follow-up: how would you validate that every citation number in the answer actually corresponds to a retrieved document? (Answer: parse the citation markers from the output and cross-check against the retrieved document count/index as a post-generation validation step, failing closed if a citation is out of range.)

### 3. Add retry and fallback resilience to a production chain

~~~python
primary = ChatOpenAI(model="gpt-4o-mini", timeout=15, max_retries=2)
fallback = ChatOpenAI(model="gpt-4o", timeout=20, max_retries=1)
resilient_model = primary.with_fallbacks([fallback])

chain = prompt | resilient_model | StrOutputParser()
# a transient failure or timeout on the primary model automatically
# falls through to the fallback rather than surfacing an error to the user
~~~

Follow-up: how would you monitor how often the fallback is triggered? (Answer: log/trace which model actually produced each response — LangSmith traces capture this automatically — and alert if the fallback trigger rate exceeds a threshold, since a rising rate signals a primary-provider reliability issue.)
`,

  "hands-on-labs": `
### Lab 1 (Beginner): First LCEL chain
Build a single LCEL chain: a prompt template that takes a product name and a customer complaint, a chat model call, and a **StrOutputParser**. Deliverable: a script that takes CLI input and prints a generated response, with an explicit timeout on the model call. Skills exercised: prompt templates, LCEL composition, output parsers.

### Lab 2 (Intermediate): RAG chain over your own documents
Load a small folder of documents, embed and index them in a vector store (see the RAG and Vector Databases skills for the ingestion side), and build a retriever-backed LCEL chain that answers questions with source citations. Deliverable: a chain that returns both an answer and the source document identifiers it used. Skills exercised: retrievers, RunnableParallel/RunnablePassthrough composition, prompt design for grounded answers.

### Lab 3 (Intermediate-Advanced): Tool-calling agent with resilience
Build an agent with two or three tools (e.g., an order-lookup function, a refund-eligibility calculator), wire it with **bind_tools** and a loop (or **AgentExecutor**), and add retry/fallback on the model call plus input validation on every tool. Deliverable: an agent that handles a tool throwing an exception gracefully rather than crashing the whole request. Skills exercised: tool calling, agent loops, resilience patterns.

### Lab 4 (Production): Observability and evaluation harness
Take the Lab 2 or Lab 3 agent, enable LangSmith tracing, build a small frozen evaluation dataset of (input, expected-behavior) pairs, and write an automated check that flags a regression if a new prompt or model version change causes the pass rate to drop. Deliverable: a CI-runnable evaluation script plus a short writeup of what LangSmith traces revealed about the system's actual behavior versus your assumptions. Skills exercised: LangSmith, evaluation methodology, production monitoring discipline.
`,

  "real-projects": `
### Project 1: Internal knowledge-base support agent
A tool-calling agent that answers employee questions by retrieving from an internal document/wiki index and, when needed, calling tools to check ticket status or escalate to a human. Engineering requirements: source citation on every retrieval-grounded answer, a confirmation step before any escalation action, LangSmith tracing enabled from day one, and an evaluation dataset covering both "should retrieve" and "should escalate" cases.

### Project 2: Multi-provider content classification pipeline
A batch pipeline that classifies a large volume of incoming text (support tickets, reviews, or documents) using structured output, with fallback across two model providers for resilience and cost control. Engineering requirements: **.batch()** with tuned concurrency respecting rate limits, a frozen evaluation set for regression testing across model/prompt changes, and cost/latency dashboards broken out per provider.

### Project 3: Conversational assistant with externalized, tiered memory
A chat product where conversational memory is externalized to a shared store, with a windowing/summarization strategy so long conversations don't blow the context window, plus a migration path documented for moving the agent's control flow into LangGraph if/when branching or human-in-the-loop requirements emerge. Engineering requirements: session-keyed history in Redis or a database, a documented memory-strategy decision with cost/quality tradeoffs, and load testing to confirm horizontal scalability of the stateless API layer.
`,

  "case-studies": `
### Klarna's customer-service assistant
Klarna has publicly discussed deploying an AI assistant handling a very large share of customer service chats, built around LLM orchestration patterns consistent with LangChain-style tool-calling agents over internal systems. Lesson: at genuine production scale, the value is in the integration with real backend systems (order status, refund policy, account data) and rigorous evaluation, not in the orchestration framework itself — the framework is a means to reliably wire those integrations together, not the differentiator.

### The community's LCEL migration
When LangChain introduced LCEL and began deprecating the older **Chain** subclassing pattern, a large fraction of existing production codebases had to be migrated. Lesson: building on a framework with this much historical API churn means budgeting real engineering time for migrations as a recurring cost of using it, not a one-time event — a lesson directly relevant to the "when is LangChain worth it" calculus covered in Comparisons.

### Teams migrating agent logic from AgentExecutor to LangGraph
A recurring pattern reported across blog posts and conference talks: teams that started with a simple LangChain **AgentExecutor** for a tool-calling agent hit a wall once they needed approval steps, retries with different logic per failure type, or multi-agent coordination, and rebuilt the same tools and prompts as a LangGraph graph. Lesson: recognizing early that your agent's control flow has outgrown a simple loop — before it becomes a tangle of workarounds — is a mark of good engineering judgment, and LangGraph exists specifically to be that escalation path.

### Teams that chose NOT to adopt LangChain
Several engineering teams have published post-mortems or blog posts explaining a deliberate choice to build directly on provider SDKs instead of LangChain, citing debugging difficulty through the abstraction layer and version churn as the deciding factors for their use case (typically a small number of well-understood, stable call patterns). Lesson: this is a legitimate, sometimes better engineering choice, not merely "not knowing the framework" — see Comparisons for how to make this call deliberately rather than by default in either direction.
`,

  comparisons: `
| Framework | Core focus | Strengths | Weaknesses | Choose when |
|-----------|-----------|-----------|------------|-------------|
| **LangChain** | General-purpose composition + broad integrations | Huge integration library, large community/docs, LCEL composition, tight LangSmith/LangGraph ecosystem | Documented API churn across versions, abstraction overhead for simple tasks, can obscure the raw model call | You need broad provider/tool/data-source integration breadth and are building genuinely composed, multi-step logic |
| **LlamaIndex** | Data/RAG-first | Deep retrieval abstractions (multiple index types, reranking, hybrid search), strong document-parsing story | Narrower scope for general agent orchestration | Your core problem is ingesting and retrieving from your own data well, more than general agent control flow |
| **LangGraph** | Stateful, graph-based agent orchestration | Explicit state, cycles, branching, human-in-the-loop, durable execution | Lower-level, more upfront design effort than a simple chain | Your agent's control flow needs branching, retries, or persistent state beyond a simple loop |
| **PydanticAI** | Typed, minimal agent framework | Strong typing end to end, deliberately small API surface, less version churn by design | Smaller integration ecosystem, younger project | You want strong typing and minimal abstraction overhead over a direct model-call-plus-tools pattern |
| **DSPy** | Programmatic prompt/pipeline optimization | Treats prompts as compiled, optimizable artifacts rather than hand-tuned strings | Different mental model, steeper conceptual learning curve, less suited to hand-crafted prompt control | You want to programmatically optimize a pipeline's prompts against a metric, rather than hand-iterate them |
| **Raw provider SDK (OpenAI/Anthropic/etc.)** | Direct API access | Simplest possible mental model, zero extra dependencies, full transparency into the exact request | You reimplement composition, retries, and parsing yourself for every project | Your task is simple, single-provider, and doesn't need swappable providers or complex composition |

### How seniors choose

The decision is rarely "LangChain versus nothing" — it's "how much composition and integration breadth does this specific application actually need, right now." A senior engineer starts by asking whether the task is a single call, a short fixed sequence, or genuinely branching/stateful agent logic, and picks the raw SDK, an LCEL chain, or LangGraph accordingly — reaching for LlamaIndex or DSPy instead when the core difficulty is specifically data retrieval or prompt optimization rather than general composition. The mistake to avoid in both directions is dogma: neither "always use LangChain" nor "never use frameworks, always raw API calls" survives contact with a real, growing codebase.
`,

  "related-technologies": `
- **LangGraph** — the graph-based orchestration layer for stateful, branching agent control flow; the recommended escalation path once a LangChain chain or **AgentExecutor** outgrows simple linear logic. See the **LangGraph** skill.
- **LangSmith** — the tracing, evaluation, and monitoring platform built specifically around LangChain (and compatible with non-LangChain apps); treat it as the default observability layer for any non-trivial LangChain application. See the **LangSmith** skill.
- **LlamaIndex** — the data/RAG-first alternative with deeper retrieval abstractions; frequently used alongside LangChain (LlamaIndex for ingestion/retrieval, LangChain/LangGraph for the surrounding agent logic) rather than as a strict either/or. See the **LlamaIndex** skill.
- **PydanticAI** — a smaller, strongly-typed agent framework built around Pydantic models end to end, a useful contrast for evaluating how much abstraction a given project actually needs. See the **PydanticAI** skill.
- **DSPy** — a fundamentally different philosophy (compile/optimize prompts programmatically against a metric, rather than hand-write and iterate strings). See the **DSPy** skill.
- **RAG** — the retrieval-augmented-generation pattern that LangChain's retriever interface and chains implement one version of. See the **RAG** skill.
- **Tool Calling** — the underlying mechanism LangChain's **bind_tools**/agent loop builds on; understanding it directly clarifies what LangChain is and isn't adding. See the **Tool Calling** skill.
- **Agent Memory** — the deeper theory behind the memory classes and history stores covered in this page's Intermediate Concepts. See the **Agent Memory** skill.
- **Agent Fundamentals** — the general loop/tool/planning/autonomy vocabulary that LangChain's and LangGraph's agent constructs are specific implementations of. See the **Agent Fundamentals** skill.
`,

  "latest-updates": `
Knowledge cutoff note: this section reflects the general direction of LangChain's development as of the author's training data (early-to-mid 2026 for recent context) and should be verified against the current changelog before relying on specific version numbers or class names — this framework's own history is one of the more active examples of API churn on this platform, and the honest, durable statement here is "verify current behavior," not a frozen list of facts.

Directionally, recent development has continued to consolidate around three pillars: LCEL as the standard composition layer within **langchain-core**, LangGraph as the recommended path for anything beyond simple linear chains (with the older **AgentExecutor** and several legacy chain classes treated as maintenance-mode rather than the recommended starting point for new agent code), and LangSmith as the default observability and evaluation platform. The package-split architecture (**langchain-core** / **langchain** / **langchain-community** / provider-specific packages) has continued, with more integrations graduating into their own dedicated, independently versioned packages over time to reduce dependency bloat and give provider integrations their own release cadence.

Structured output via native provider tool-calling/schema-constrained generation (**with_structured_output**) has become the clearly preferred pattern over text-based output parsing, reflecting the broader industry move toward providers exposing first-class structured-output APIs rather than developers working around free-text generation. Given this trajectory, the safest posture for an engineer using this page is to treat class names and import paths as illustrative of the pattern, and to check the installed package version's own documentation before shipping code that depends on exact API details.
`,

  "future-roadmap": `
The most defensible bet for where LangChain is heading is continued specialization: LangChain itself narrowing toward composition primitives and integrations, LangGraph absorbing more of the complex agent-orchestration responsibility, and LangSmith deepening as the evaluation/observability layer that ties both together. This mirrors a broader industry pattern where "the framework" has splintered into more composable, individually-adoptable pieces rather than one monolithic answer — worth watching alongside similar specialization in LlamaIndex (retrieval-focused) and dedicated evaluation tooling.

Worth betting career time on: understanding LCEL composition deeply (it's the stable core abstraction beneath the churn), understanding tool-calling and agent control-flow patterns generally (transferable across LangChain, LangGraph, and other frameworks alike), and building the habit of verifying framework behavior against current docs rather than memorized syntax — a durable skill regardless of which specific framework wins over the next few years. Less worth over-investing in: memorizing any single version's exact class names and import paths, given the demonstrated rate of change; that knowledge has a short half-life and is exactly the kind of thing to look up fresh each time rather than commit to long-term memory.
`,

  "cheat-sheet": `
~~~python
# ── Setup ──────────────────────────────────────────────
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
model = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, timeout=20, max_retries=2)

# ── Prompt + LCEL chain ────────────────────────────────
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}."), ("human", "{input}"),
])
chain = prompt | model | StrOutputParser()
chain.invoke({"role": "helpful assistant", "input": "hi"})
chain.batch([...], config={"max_concurrency": 5})
for chunk in chain.stream({...}): print(chunk, end="")

# ── Structured output (preferred over text JSON parsing) ─
from pydantic import BaseModel
class Result(BaseModel):
    answer: str
structured = model.with_structured_output(Result)

# ── RAG composition ────────────────────────────────────
from langchain_core.runnables import RunnablePassthrough
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
rag_chain = (
    {"context": retriever | (lambda docs: "\\n".join(d.page_content for d in docs)),
     "question": RunnablePassthrough()}
    | prompt | model | StrOutputParser()
)

# ── Memory ─────────────────────────────────────────────
from langchain_core.runnables.history import RunnableWithMessageHistory
chain_with_history = RunnableWithMessageHistory(
    prompt | model, get_history_fn,
    input_messages_key="question", history_messages_key="history",
)

# ── Tools and agents ───────────────────────────────────
from langchain_core.tools import tool
@tool
def lookup(order_id: str) -> str:
    "Look up an order's status by ID."
    return "shipped"
model_with_tools = model.bind_tools([lookup])

# ── Resilience ─────────────────────────────────────────
resilient = model.with_retry(stop_after_attempt=3).with_fallbacks([backup_model])

# ── Observability ──────────────────────────────────────
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "my-project"
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is LCEL? | LangChain Expression Language — the pipe-based ("|") syntax for composing Runnables (prompts, models, parsers, retrievers) with uniform invoke/batch/stream support |
| What is a Runnable? | The shared interface every LCEL component implements, enabling uniform composition and execution modes |
| What does **with_structured_output** do? | Binds a schema to the model's native structured-output/tool-calling API for reliable typed output, instead of text-based JSON parsing |
| What replaced the older **Chain** subclassing pattern? | LCEL composition via the pipe operator |
| What is **AgentExecutor**? | LangChain's original fixed reasoning-and-acting loop for tool-calling agents |
| When should you escalate to LangGraph? | When agent control flow needs branching, cycles, retries, or human-in-the-loop steps |
| What does a retriever return? | Relevant documents for a given query string, typically from a vector store |
| What is LangSmith used for? | Tracing, evaluation, and monitoring of LangChain (and other) LLM applications |
| Why pin LangChain package versions? | The framework has a documented history of renamed/deprecated APIs across versions; unpinned upgrades can silently break behavior |
| What is the biggest anti-pattern for a single stateless LLM call? | Wrapping it in a full chain instead of just calling the raw provider SDK directly |
| What packages make up LangChain's current architecture? | langchain-core, langchain, langchain-community, and separately versioned provider-specific packages |
| Why treat retrieved/tool content as untrusted? | It can carry prompt injection attempts; the model may follow instructions embedded in retrieved text or tool output |
| What's the risk of unbounded conversational memory? | It eventually exceeds the context window and inflates token cost linearly with conversation length |
| What's the fastest way to debug a wrong chain answer? | Inspect the LangSmith trace or verbose logs to see the literal prompt and retrieved/tool content before touching the prompt |
| Name three sibling frameworks with different core focuses. | LlamaIndex (data/RAG-first), PydanticAI (typed/minimal), DSPy (programmatic prompt optimization) |
`,

  mcqs: `
**1. What is the main purpose of the LCEL pipe ("|") operator?**
A) To run steps in parallel automatically
B) To compose Runnables into a single object with uniform invoke/batch/stream support
C) To register a tool with an agent
D) To connect to a vector store

*Answer: B — the pipe composes components implementing the shared Runnable interface, which is what gives the composed chain streaming/batch/async support uniformly.*

**2. Why is with_structured_output generally preferred over a text-based JSON output parser?**
A) It's faster in all cases
B) It uses the model provider's native schema-constrained generation, which is more reliable than hoping free text parses as JSON
C) It doesn't require a Pydantic model
D) It works with every model regardless of provider support

*Answer: B — native structured output constrains generation at the API level rather than relying on post-hoc text parsing.*

**3. When should you migrate agent logic from AgentExecutor to LangGraph?**
A) Never, AgentExecutor should always be preferred
B) Only when using a different LLM provider
C) When control flow needs branching, cycles, retries, or human-in-the-loop steps
D) Only for JavaScript/TypeScript projects

*Answer: C — LangGraph exists specifically to handle control flow that a simple fixed loop handles awkwardly.*

**4. What is the biggest legitimate criticism of using LangChain for a single, one-off LLM call?**
A) It cannot make single calls at all
B) It's slower than every alternative at the network level
C) It adds abstraction layers and a versioning dependency for no compositional benefit
D) It requires a paid license

*Answer: C — for a genuinely simple, non-composed task, a raw SDK call is clearer with fewer moving parts.*

**5. Why should retrieved documents and tool outputs be treated as untrusted input in a prompt?**
A) They are always factually incorrect
B) They can carry prompt injection attempts that try to override system instructions
C) LangChain automatically encrypts them, so this is a non-issue
D) They are never included in the prompt anyway

*Answer: B — any content from outside your own trusted system prompt is a real prompt-injection surface.*

**6. What is the primary reason to pin exact LangChain package versions in production?**
A) Licensing requirements
B) Newer versions are always slower
C) The framework has a documented history of renamed/deprecated APIs across versions, so unpinned upgrades can silently break behavior
D) Pinning is required for LangSmith to function

*Answer: C — version churn is real and documented; unpinned dependencies are a realistic production risk.*
`,

  "revision-notes": `
LangChain is a composition and integration framework for LLM applications, built around LCEL's pipe-based Runnable composition: prompt templates, chat models, output parsers, and retrievers all implement the same interface, so a chain built from them automatically supports invoke, batch, stream, and their async equivalents. It rose to prominence at the exact moment ChatGPT-driven interest in LLM applications exploded in late 2022/early 2023, largely because it named and packaged patterns (chains, agents, memory, tools) that every team was otherwise reinventing independently, backed by a very large library of provider, vector-store, and data-source integrations.

The framework's core value is integration breadth and a shared vocabulary, not any single deeply novel technical idea — which is also the source of its most legitimate criticism: real abstraction overhead for simple tasks, and a documented, recurring history of API churn (chain classes deprecated in favor of LCEL, memory classes reworked, package splits into langchain-core/langchain/langchain-community) that any team adopting it must budget for as an ongoing cost, not a one-time learning curve.

For agents specifically, LangChain's own trajectory has been to keep the simple **AgentExecutor** loop for basic tool-calling cases while pushing complex, branching, or stateful agent control flow toward LangGraph, its lower-level sibling project — and to lean on LangSmith as the default tracing/evaluation layer for both. Structured output has converged on binding schemas to native provider tool-calling/schema-constrained generation (**with_structured_output**) rather than text-based JSON parsing, reflecting the industry's broader shift toward first-class structured-output APIs.

The honest, durable engineering judgment this page tries to instill is: LangChain earns its cost when an application has genuine multi-step composition, swappable providers, or reusable structure across many call sites; it is unnecessary complexity for a single stateless call, where a raw provider SDK call is clearer, has fewer dependencies, and is easier to debug. Making that call deliberately — rather than defaulting to either "always use a framework" or "never use one" — is the actual senior skill this page is trying to teach, more than any specific class name or method signature, all of which should be verified against current docs rather than memorized from any single snapshot, including this one.
`,

  "learning-roadmap": `
**Week 1 — Foundations**: Learn prompt templates, LCEL composition (the pipe operator), and output parsers, including the preference for **with_structured_output** over text-based JSON parsing. Milestone: build a simple classification or Q&A chain end to end with an explicit timeout and retry policy.

**Week 2 — Retrieval and memory**: Build a RAG chain composing a retriever with a prompt and model, and add externalized conversational memory with a windowing or summarization strategy. Milestone: a chain that answers questions with source citations and correctly maintains multi-turn context without unbounded growth.

**Week 3 — Tools and agents**: Build a tool-calling agent with 2-3 tools, add resilience (retries, fallback models), and deliberately identify a point where the control flow would benefit from LangGraph instead of **AgentExecutor**. Milestone: an agent that handles a tool failure gracefully and has a documented rationale for its chosen control-flow pattern.

**Week 4 — Production hardening**: Enable LangSmith tracing, build a frozen evaluation dataset, write regression tests against fake/deterministic models, and produce a deployment configuration (Dockerfile, secrets handling, version pinning) following the production checklist. Milestone: a small, fully observable, tested LangChain application you could hand to another engineer with confidence.

Next platform skill: once you're comfortable with LangChain's composition and simple agent patterns, move to **LangGraph** for stateful, branching agent orchestration, and to **LangSmith** for the deeper evaluation and observability discipline that production LLM applications need regardless of which framework built them.
`,

  "official-docs": `
- **LangChain Python documentation** (python.langchain.com) — the primary reference; check the version selector, since behavior and class names have changed materially across releases.
- **LangChain JS/TS documentation** (js.langchain.com) — the parallel JavaScript/TypeScript API, broadly similar in concept but not identical in every detail to the Python docs.
- **LangChain GitHub repository** (github.com/langchain-ai/langchain) — the changelog and release notes are the most reliable source for exactly what changed between versions, more reliable than any third-party tutorial.
- **LangGraph documentation** — the sibling project's docs, essential once you outgrow simple chains/AgentExecutor.
- **LangSmith documentation** — tracing, evaluation, and monitoring setup guides.
`,

  books: `
- **"Generative AI with LangChain" by Ben Auffarth** — one of the few full-length books specifically on LangChain; useful for a structured walkthrough, though given the framework's churn, treat specific code listings as illustrative rather than exact-syntax-guaranteed by the time you read it.
- **"Prompt Engineering for Generative AI" by James Phoenix and Mike Taylor** — broader than LangChain specifically, but covers prompt template and chain-composition thinking that transfers directly.
- **"Designing Machine Learning Systems" by Chip Huyen** — not LangChain-specific, but essential for the production-systems thinking (monitoring, testing, deployment discipline) this page repeatedly applies to LangChain applications.
- **"Building LLM Powered Applications" by Valentina Alto** — covers LangChain among other frameworks/approaches, useful for the comparative perspective emphasized in this page's Comparisons section.
`,

  blogs: `
- **The official LangChain blog** (blog.langchain.dev) — the highest-signal source for what the maintainers themselves consider the current recommended patterns, including migration guidance across major refactors.
- **LangSmith and LangGraph release notes/blogs** — track these alongside the main LangChain blog, since the three projects' roadmaps are tightly coupled.
- **Individual practitioner write-ups on migrating from AgentExecutor to LangGraph** — searchable on engineering blogs and Hacker News; genuinely useful for the "when did we actually need to escalate" judgment call this page emphasizes, more useful than official docs for that specific decision.
- **Company engineering blogs describing real production LLM systems** (search for "[company] LLM production" write-ups) — valuable for grounding the Comparisons and Case Studies sections in real, dated experience rather than marketing claims.
`,

  "research-papers": `
LangChain itself is an engineering framework, not the subject of a foundational research paper, so this section is thinner than it would be for a genuinely research-driven topic — an honest acknowledgment rather than an invented citation. The closest foundational reading is the research underlying the patterns LangChain implements:

- **"ReAct: Synergizing Reasoning and Acting in Language Models"** (Yao et al., 2022) — the reasoning-and-acting loop pattern that LangChain's original agent design was built around.
- **"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"** (Lewis et al., 2020) — the foundational RAG paper underlying the retriever-plus-generation pattern LangChain's RAG chains implement; see the dedicated **RAG** skill for deeper treatment.
- **"Toolformer: Language Models Can Teach Themselves to Use Tools"** (Schick et al., 2023) — foundational thinking on models learning when and how to invoke external tools, conceptually underlying tool-calling agent design; see the **Tool Calling** skill.

For LangChain-specific architectural decisions (LCEL, the langchain-core/langchain/langchain-community split), the primary source is the project's own blog posts and release notes rather than academic papers — treat those as engineering documentation, not peer-reviewed research.
`,

  videos: `
- **Harrison Chase's talks and interviews** (searchable on YouTube and podcast platforms) — the creator's own explanations of LangChain's design decisions and the reasoning behind major refactors like LCEL and LangGraph.
- **LangChain's own YouTube channel** — official tutorials and webinars, generally the most up-to-date source for current API patterns given how much has changed across versions.
- **Conference talks on production LLM application architecture** (AI Engineer Summit and similar events have had multiple LangChain/LangGraph-focused talks) — useful for the production-hardening and agent-architecture judgment calls this page emphasizes.
- **Comparative walkthroughs of LangChain vs. raw SDK vs. LlamaIndex vs. PydanticAI** on independent developer YouTube channels — useful for grounding the Comparisons section in demonstrated code rather than marketing claims, though verify claims against your own testing given how quickly this space changes.
`,

  "github-repos": `
- **langchain-ai/langchain** — the main repository; check open issues and the changelog for the most current, ground-truth view of what's stable versus in flux.
- **langchain-ai/langgraph** — the sibling orchestration project, essential once your agent control flow outgrows simple chains.
- **langchain-ai/langsmith-sdk** — the SDK for the tracing/evaluation platform.
- **langchain-ai/langchain-community** — the large collection of third-party integrations; useful to browse for "does an integration already exist for X" before writing one yourself.
- Community example repositories tagged "langchain-examples" or similar on GitHub — useful for seeing real, runnable code, but cross-check the LangChain version pinned in their lockfiles before assuming the syntax is current.
- **Awesome-LangChain**-style curated lists — a reasonable starting point for discovering integrations and example projects, though quality and currency vary; verify anything non-trivial against the official docs.
`,

  "practice-problems": `
1. Build an LCEL chain that classifies customer feedback into sentiment categories using **with_structured_output**, then extend it to batch-process a CSV of 1,000 reviews with tuned concurrency.
2. Build a RAG chain over a small set of PDFs (using a document loader plus a vector store) that answers questions with source citations, then write an automated evaluation script measuring whether citations match the actual retrieved documents.
3. Build a tool-calling agent with at least three tools, deliberately introduce a failure in one tool (raise an exception), and implement graceful degradation so the agent reports the failure to the user rather than crashing.
4. Take an existing simple **AgentExecutor**-based agent and identify a concrete requirement (an approval step, a retry-with-different-strategy branch) that would justify migrating it to LangGraph; sketch (or implement) the LangGraph version and compare the resulting code's clarity.
5. Instrument a chain with LangSmith tracing, intentionally introduce a bug (a wrong prompt variable, a misconfigured retriever), and practice diagnosing it purely from the trace rather than reading the source code first.
6. External practice: explore LangChain's own official tutorial notebooks/cookbook examples and rebuild one from scratch without copying the code, using only the documentation, to test your grasp of the underlying concepts rather than memorized syntax.

External sets: the official LangChain documentation's own tutorial and how-to guide sections (regularly updated) are the best source of additional, current practice material given how quickly the framework's exact API surface moves.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client["Client"]
        UI["Web/mobile UI"]
    end
    subgraph Service["LangChain-based service"]
        API["API layer (FastAPI/etc.)"]
        Chains["LCEL chains\n(prompt + model + parser)"]
        Agents["Agent loop\n(AgentExecutor or LangGraph)"]
        Tools["Tools (typed functions)"]
        Mem["Session-keyed message history\n(Redis/DB)"]
    end
    subgraph Data["Data layer"]
        VS[("Vector store")]
        DB[("Application database")]
    end
    subgraph External["External services"]
        LLM["LLM provider API"]
        LS["LangSmith\n(tracing & evaluation)"]
    end

    UI --> API
    API --> Chains
    API --> Agents
    Agents --> Tools
    Chains --> Mem
    Agents --> Mem
    Chains --> VS
    Agents --> DB
    Chains --> LLM
    Agents --> LLM
    Chains -.traces.-> LS
    Agents -.traces.-> LS
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((LangChain))
    Core primitives
      Prompt templates
      Chat models
      Output parsers
      Runnable interface
    LCEL
      Pipe composition
      invoke/batch/stream
      RunnableParallel
      RunnableLambda
    Retrieval
      Retrievers
      RAG chains
      Vector store integration
    Memory
      Message history
      Windowing/summarization
      Externalized session stores
    Agents and tools
      bind_tools
      AgentExecutor
      Tool docstrings
      Escalation to LangGraph
    Production concerns
      Timeouts and retries
      Fallback models
      Version pinning
      Security: prompt injection, tool safety
    Ecosystem
      LangGraph
      LangSmith
      LlamaIndex
      PydanticAI
      DSPy
    Honest tradeoffs
      Version churn
      Abstraction overhead
      When raw SDK is simpler
~~~
`,
};

export default langchain;
