import type { SkillContent } from "../types";

/**
 * Tool Calling (function calling) -- full 50-section knowledge page.
 * This skill goes deep on the mechanics that Agent Fundamentals introduces
 * only at a conceptual level: how a model is given a structured description
 * of callable functions, how it emits a structured request to call one (or
 * several) of them, how the host application validates and executes that
 * request, and how the result is fed back so the model can continue.
 * Code blocks use ~~~ fences (never backticks). No backtick characters and
 * no dollar-brace interpolation sequences appear anywhere in this file.
 */
const toolCalling: SkillContent = {
  overview: `
Tool calling (also called function calling) is the mechanism by which a large language model requests that a specific, named function be executed with specific, structured arguments, so that the result can be fed back into its context and used to continue reasoning or answer a question. The model itself never executes anything -- it only ever emits a structured description of an action it wants performed. A host application, running entirely outside the model, decides whether to comply, executes the real function (a weather lookup, a database query, a calculator, a code sandbox, an internal company API), and returns the result as a new piece of context. This request-execute-return cycle is the single mechanical fact underlying every "AI agent," every "AI assistant that can do things," and every RAG pipeline that decides at runtime whether to retrieve.

For an AI engineer, tool calling is the capability that turns a language model from a text-in, text-out function into a component that can affect and query the world beyond its own context window. The **Agent Fundamentals** skill introduces the perceive-plan-act-observe loop and states plainly that tool use, not "better reasoning," is what actually distinguishes an agent from a chatbot; this page is the deep dive on the "act" step of that loop: how tools are described to a model in a way it can reliably use, how the model's tool-call request is structured and parsed, how parallel and sequential calls differ, what happens when a call fails or the model hallucinates a tool or argument that does not exist, and how to build the security boundary around execution so that "the model asked for it" never silently becomes "the model made it happen."

Key characteristics of modern tool calling: tools are described with a JSON Schema-shaped signature (a name, a natural-language description, and a typed argument schema) that becomes part of the model's input alongside the prompt; the model's provider-side training determines how reliably it selects the right tool and produces well-formed arguments, and this reliability is genuinely uneven across providers, model sizes, and even between versions of the same model family -- this page will not overclaim consistency it cannot verify; some APIs support the model requesting multiple tool calls in a single turn (parallel tool calls), which changes both the execution and error-handling story; and the entire mechanism sits behind a trust boundary that the host application, not the model, is responsible for enforcing -- see the **Guardrails** skill and the Security section below for why this is not optional. Tool calling is also the mechanical foundation the **Model Context Protocol (MCP)** standardizes across vendors, and the primitive that frameworks like **LangChain** and the **OpenAI Agents SDK** wrap with higher-level abstractions.
`,

  history: `
Long before LLMs, the idea of a program describing a typed function signature that another system could call remotely was already well established -- remote procedure calls (RPC), typed API contracts (OpenAPI/Swagger, gRPC/protobuf schemas), and plugin architectures all solved a version of "describe an action precisely enough that a caller who has never seen the implementation can invoke it correctly." What LLM tool calling added was a caller that is not a compiler or a human reading documentation, but a language model deciding, from natural-language context, which of several described actions to take and with which arguments -- a fundamentally probabilistic caller where earlier RPC-style callers were deterministic.

| Year | Milestone |
|------|-----------|
| Pre-2023 | Developers hand-roll "tool use" by prompting a model to emit a specific text format (e.g. asking it to output a line like "CALL: search(query)"), then parsing that text with string matching or regexes -- fragile, and prone to malformed or unparseable output |
| 2023 | Major model providers ship native, structured function-calling APIs: instead of parsing free text, the model returns a structured object naming a function and its arguments, validated against a schema the developer supplied upfront -- this is widely regarded as the single most consequential reliability improvement for LLM agents to date |
| 2023 | Function-calling accuracy becomes a benchmarked, marketed capability in its own right, as providers compete on how reliably their models select the correct tool and produce well-formed, schema-valid arguments |
| 2023-2024 | Parallel tool calling (a single model turn requesting multiple tool calls at once) becomes available in some provider APIs, reducing wall-clock latency for independent lookups at the cost of more complex result-aggregation and error-handling logic |
| 2024 | Structured output / constrained decoding techniques mature alongside tool calling, letting providers guarantee (or near-guarantee) that emitted arguments are syntactically valid JSON conforming to the declared schema, closing off an entire class of "malformed arguments" failures -- see the **Structured Outputs** skill |
| 2024-2025 | The **Model Context Protocol (MCP)** emerges as a vendor-neutral standard for describing and exposing tools (and broader context) to models, aiming to let a tool built once be consumed by agents built on different frameworks and providers, rather than every framework inventing its own tool-description convention |

This page describes the mechanics as they exist across the current generation of provider APIs; it does not claim a fixed ranking of "whose function calling is best," since relative accuracy shifts with nearly every model release. Check the **Latest Updates** section and each provider's own documentation for what is current when you read this.
`,

  "why-it-exists": `
Before structured tool calling, giving a model the ability to "do things" meant one of two unsatisfying options: hand-craft a text protocol (ask the model to emit a specific string format when it wants to call a function) and parse that text with regexes, hoping the model's output stayed consistent enough to parse -- or fine-tune a model specifically to your own tool format, which is expensive, brittle across model upgrades, and out of reach for most teams. Both approaches shared the same underlying failure: there was no schema-level contract between "what the developer described as available" and "what the model actually emitted," so malformed, half-parseable, or subtly wrong tool invocations were common and often silent.

The gap tool calling filled: **a schema-validated contract between the developer's description of an available function and the model's structured request to invoke it**, enforced by the provider's own training and inference-time machinery rather than left to string parsing. Once a developer could describe a function with a name, a description, and a JSON Schema for its arguments, and receive back a structured object (not free text) naming the function and providing schema-conformant arguments, an entire category of parsing bugs disappeared, and tool use became reliable enough to build production systems on top of.

The other half of what tool calling made possible is compositional: because the tool description is just structured metadata sent alongside the prompt, the same tool can be described once and offered to the model differently depending on context (only expose the tools relevant to the current task), tools can be added or removed at runtime without retraining anything, and the model can, within a single conversation, be given a different tool set on different turns. This composability is exactly what the **Agent Fundamentals** skill's perceive-plan-act-observe loop depends on, and it is the reason tool calling -- not any single "agent" paper -- is often cited as the more consequential enabling technology for practical LLM agents.
`,

  "problem-it-solves": `
Tool calling solves the problem of an LLM needing to take an action or fetch information it cannot produce from its own parametric knowledge and the prompt alone, in a way that is reliable enough to automate rather than requiring a human to read free text and manually decide what to do. Concrete pains removed:

- **Unreliable free-text parsing of the model's intended action.** Before structured calling, "did the model want to call a function, and with what arguments" had to be inferred by regex or string matching against the model's raw text output -- fragile against formatting drift, and with no schema validation at all.
- **No way to guarantee argument shape before execution.** A model asked to "output a JSON object with a city field" in free text can still emit malformed JSON, extra prose around it, or a missing field; structured tool calling, especially combined with constrained decoding (see **Structured Outputs**), lets the provider guarantee schema-conformant output far more reliably.
- **No standard way to expose "what can I do" to the model.** Tool schemas (name, description, argument types) give the model an explicit, structured menu of available actions, rather than requiring the developer to explain available actions purely in prose buried in a system prompt.
- **No clean separation between "the model requested X" and "X actually happened."** Structured tool calling makes this separation explicit and inspectable: the model's turn ends with a tool-call object, and the application code is unambiguously the thing that executes it (or does not) -- this is the trust boundary the Security section below builds on.

What tool calling deliberately does **not** solve, and should not be expected to:

- **Tool selection accuracy is not guaranteed.** A model can still pick the wrong tool, hallucinate a tool name that was never provided, or invoke the right tool with subtly wrong arguments -- schema validation catches malformed shape, not semantically wrong content. See Advanced Concepts and Common Errors.
- **It does not make executing the requested action safe by itself.** Tool calling gives you a structured request; it says nothing about whether that request should be honored. That judgment is entirely the host application's responsibility -- see Security.
- **It is not free.** Every tool description consumes tokens in every request where it is offered, whether or not it is ultimately called, and every additional tool in the schema is a small additional chance of tool-selection confusion -- see Performance and Anti-Patterns.
- **It does not eliminate the need for error handling.** A tool can fail (timeout, exception, invalid input the schema did not catch), and the model must be told about that failure in a way it can reason about, not left to silently assume success.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the full tool-calling protocol end to end: schema description, model's structured tool-call output, host-side execution, and the result fed back as a new turn.
2. Write a correct JSON Schema tool definition (name, description, parameters) that a model can reliably use, and explain what makes a schema ambiguous or under-specified.
3. Distinguish parallel tool calls from sequential tool calls, and explain the concrete tradeoffs (latency, result-aggregation complexity, error handling) of each.
4. Diagnose the difference between a malformed tool call (schema-invalid arguments), a hallucinated tool call (naming a tool that does not exist), and a wrong tool call (valid shape, wrong tool or wrong argument values) -- and apply the correct fix for each.
5. Design and defend a validation and sandboxing layer around tool execution, explaining why the model's request must never be trusted as inherently safe.
6. Explain how a failed tool call should be reported back to the model, and why silently swallowing a tool error is a production hazard.
7. Compare tool-calling reliability across model providers honestly, including known provider-specific quirks, without assuming uniform behavior.
8. Explain the relationship between tool calling and the **Model Context Protocol (MCP)**: what MCP standardizes, and what it deliberately leaves to the underlying provider's tool-calling implementation.
9. Build a minimal, production-grade tool-calling loop in Python against a real provider API, including error handling and argument validation.
10. Map tool calling onto the sibling skills (**Agent Fundamentals**, **MCP**, **Guardrails**, **Structured Outputs**, **LLM Fundamentals**, **LangChain**, **OpenAI Agents SDK**) and explain what each goes deep on relative to this page.
`,

  prerequisites: `
- **Required**: a solid grounding in the **LLM Fundamentals** skill -- tokens, context windows, and how a model's output is generated are assumed here without re-derivation. You should also have read **Agent Fundamentals**, since this page assumes you already understand the perceive-plan-act-observe loop and treats tool calling as the deep dive on its "act" step specifically.
- **Strongly recommended before this page**: basic familiarity with JSON Schema (types, required fields, enums, nested objects) -- tool argument schemas are JSON Schema, and if the syntax itself is unfamiliar, focus there first. A first pass over **Structured Outputs** is also useful, since constrained decoding techniques that guarantee schema-valid output are closely related to, and often used alongside, tool calling.
- **Helpful**: basic Python and familiarity with calling an LLM provider's API directly (OpenAI, Anthropic, or similar), since the worked examples on this page use real (or near-real) API shapes; familiarity with REST APIs and typed function signatures from ordinary software engineering transfers directly to how tool schemas are designed.
- **Not required**: prior experience with any specific agent framework. This page explains tool calling at the level of the raw provider API first, then connects it to how frameworks like **LangChain** and the **OpenAI Agents SDK** wrap it, so the underlying mechanics are never hidden behind a framework's abstractions.

Dependency links: **LLM Fundamentals** -> **Agent Fundamentals** -> this page (**Tool Calling**) -> **MCP** (the vendor-neutral standard for exposing tools) and **Guardrails** (the safety layer around execution) -> the framework skills (**LangChain**, **OpenAI Agents SDK**) that implement all of this concretely. **Structured Outputs** sits alongside this page as a closely related sibling: both are about getting reliable, schema-shaped output from a model, applied to slightly different problems.
`,

  "beginner-concepts": `
### The problem, restated concretely

A model, by itself, can only produce text. If you ask it "what's the weather in Paris right now," it has no live data source -- it can only guess, hallucinate a plausible-sounding answer, or (if well-behaved) admit it does not know. Tool calling gives the model a way to say, structurally, "I need to call a function named get_weather with the argument city equal to Paris," so that code outside the model can actually look up the real answer and hand it back.

### The three pieces of a tool definition

Every tool a model can call is described with three pieces of information, sent alongside the prompt on every request where the tool should be available:

~~~text
1. name        -- a short, unambiguous identifier, e.g. "get_weather"
2. description -- a natural-language explanation of what the tool does
   and, importantly, when it should (and should not) be used
3. parameters  -- a JSON Schema object describing the arguments the
   tool accepts: their names, types, which are required, and any
   constraints (enums, minimum/maximum, patterns)
~~~

Get the description and parameter descriptions genuinely precise -- the model has no other source of truth about what your function does or expects. A vague description ("gets info") is a leading cause of the tool-selection-accuracy problems covered in Advanced Concepts.

### A minimal tool schema, in JSON Schema form

~~~json
{
  "name": "get_weather",
  "description": "Get the current weather for a named city. Use this whenever the user asks about current or today's weather. Do not use this for weather forecasts more than 24 hours out.",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "The city name, e.g. Paris or Tokyo. Do not include country names."
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature units to return. Defaults to celsius if omitted."
      }
    },
    "required": ["city"]
  }
}
~~~

### The full request-execute-return cycle, end to end

~~~text
1. Application sends: user's message + the tool schema(s) above.
2. Model responds with EITHER plain text, OR a structured tool-call
   request: { "name": "get_weather", "arguments": { "city": "Paris" } }.
3. If a tool call was requested: application code (not the model)
   actually calls the real get_weather function with those arguments.
4. Application sends the tool's result back to the model as a new
   message in the conversation (a "tool result" or "function result"
   turn), alongside the original conversation history.
5. Model produces its next response, now informed by the real result --
   either a final answer, or another tool call.
~~~

### A minimal worked example against a real provider shape

~~~python
# Minimal, framework-free tool-calling loop against an OpenAI-style
# chat completions API. Provider SDK method names and exact response
# shapes vary; check current provider docs, but the protocol shape
# below (tools list in, tool_calls list out, tool results fed back
# as messages) is representative of the current generation of APIs.

import json

def get_weather(city: str, units: str = "celsius") -> dict:
    """A real implementation would call an actual weather API with a
    timeout and its own error handling -- this is a stand-in."""
    fake_data = {"paris": (15, "rainy"), "tokyo": (22, "clear")}
    temp, condition = fake_data.get(city.lower(), (None, None))
    if temp is None:
        return {"error": f"no data for city: {city}"}
    if units == "fahrenheit":
        temp = round(temp * 9 / 5 + 32)
    return {"city": city, "temperature": temp, "units": units, "condition": condition}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": (
                "Get the current weather for a named city. Use this "
                "whenever the user asks about current weather."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name only, e.g. Paris."},
                    "units": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["city"],
            },
        },
    }
]

def call_model(messages, client):
    """Stand-in for a real provider call -- replace 'client' with your
    actual SDK client. Keep tools=TOOLS on every call in the loop so the
    model can keep calling tools across multiple turns if it needs to."""
    return client.chat.completions.create(
        model="gpt-4o-mini",       # pin a specific model version in production
        messages=messages,
        tools=TOOLS,
        timeout=15,                # never call a network API without a timeout
    )

def run_tool_loop(user_message: str, client, max_turns: int = 5) -> str:
    messages = [{"role": "user", "content": user_message}]

    for _ in range(max_turns):
        response = call_model(messages, client)
        choice = response.choices[0].message

        if not choice.tool_calls:
            return choice.content  # model produced a final text answer

        # The model can request one or more tool calls in a single turn --
        # see Intermediate Concepts for parallel tool calls.
        messages.append(choice.model_dump())  # keep the assistant's own turn

        for tool_call in choice.tool_calls:
            if tool_call.function.name != "get_weather":
                # A hallucinated or unrecognized tool name -- never execute
                # blindly. Report the problem back as a tool result so the
                # model can recover, rather than crashing the whole loop.
                result = {"error": f"unknown tool: {tool_call.function.name}"}
            else:
                try:
                    args = json.loads(tool_call.function.arguments)
                    result = get_weather(**args)
                except (json.JSONDecodeError, TypeError) as exc:
                    # Malformed arguments: schema-valid-looking JSON that
                    # still failed real validation, or truly malformed JSON.
                    result = {"error": f"invalid arguments: {exc}"}

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result),
                }
            )

    return "FAILED: exceeded max_turns without a final answer"
~~~

Notice three things that reappear throughout this page: the tool name is checked against an allowlist before execution (never trust it blindly), the arguments are parsed and validated before the real function is called (a schema-valid-looking string can still fail real validation, e.g. an unknown city), and every failure path returns a structured error back into the conversation rather than crashing -- a model that never sees its own failure cannot recover from it.
`,

  "intermediate-concepts": `
### Sequential vs parallel tool calls

In the simplest case, a model requests one tool call per turn, and the loop is strictly sequential: call, observe, decide, call again. Some provider APIs additionally support the model requesting several tool calls in a single turn (parallel tool calls) -- for example, looking up the weather in three different cities at once, rather than three separate round trips.

~~~text
Sequential (one call per turn):
  Turn 1: model calls get_weather(city="Paris")
  Turn 2: model calls get_weather(city="Tokyo")
  Turn 3: model produces final answer comparing both
  -- 3 full model round trips

Parallel (multiple calls requested in one turn):
  Turn 1: model calls get_weather(city="Paris") AND
                       get_weather(city="Tokyo")   in the same turn
  Application executes both (concurrently if independent), returns
  BOTH results as separate tool-result messages, tagged by tool_call_id
  Turn 2: model produces final answer comparing both
  -- 2 full model round trips, and the two tool executions can run
     concurrently rather than back to back
~~~

Parallel tool calls reduce wall-clock latency when the calls are genuinely independent, but they complicate two things: result aggregation (the model must now reason about several observations arriving together, tagged by tool_call_id, rather than one at a time) and error handling (what should happen if two of three parallel calls succeed and one times out or fails -- the answer is almost always: return all three results, including the failure, and let the model's next turn reason about the partial success, rather than failing the whole batch because one call failed).

### Designing tool schemas that are actually usable

A tool schema is a contract the model has to work from with no other information about your function. A few concrete techniques that materially improve tool-selection and argument accuracy:

~~~text
- State explicitly WHEN to use the tool and, just as importantly,
  when NOT to -- "use this for CURRENT weather, not forecasts" removes
  an entire class of wrong-tool selection.
- Use enums wherever the valid values are a fixed, known set (units,
  categories, statuses) instead of a free-text string -- this narrows
  the space of arguments the model can get wrong.
- Keep argument names self-explanatory and match natural-language
  conventions the model has likely seen in training (city, not loc_str).
- Avoid deeply nested argument schemas where possible -- flatter
  schemas are easier for a model to fill in correctly than deeply
  nested objects with many optional sub-fields.
- Mark fields required only when they are actually required -- an
  argument marked required that the model cannot always determine
  from context increases the rate of malformed-call retries.
~~~

### Handling tool errors as first-class observations

A tool can fail for the same reasons any external call fails: a timeout, a downstream service error, invalid input that the JSON Schema did not (and often cannot) catch (a syntactically valid city name that does not exist in your data), or a bug in the tool implementation itself. The correct pattern, shown in the Beginner Concepts worked example, is to catch the failure in application code and feed a structured error observation back to the model as the tool's result -- never let a tool exception propagate up and crash the whole conversation loop, and never silently substitute a default value as if the call had succeeded.

~~~python
# A tool wrapper that standardizes error reporting so the model always
# gets a structured, informative observation regardless of failure mode.

def safe_tool_call(tool_fn, arguments: dict, timeout_seconds: float = 10.0) -> dict:
    import concurrent.futures

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(tool_fn, **arguments)
        try:
            return {"ok": True, "result": future.result(timeout=timeout_seconds)}
        except concurrent.futures.TimeoutError:
            return {"ok": False, "error": "tool_timeout", "detail": f"exceeded {timeout_seconds}s"}
        except TypeError as exc:
            # Arguments didn't match the real function signature even
            # though they parsed as valid JSON -- report, don't crash.
            return {"ok": False, "error": "invalid_arguments", "detail": str(exc)}
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "error": "tool_execution_failed", "detail": str(exc)}
~~~

### Multi-tool selection and the retrieval-vs-action distinction

Real agents are usually given several tools at once, and the model must choose the right one -- a search tool versus a calculator versus a database-write tool. It is useful to distinguish, when designing a tool set, between read/retrieval tools (safe to call speculatively, low blast radius if wrong) and write/action tools (side-effecting, need the extra scrutiny covered in Security below). Mixing many loosely-described tools of both kinds in one flat list is a leading cause of the wrong-tool-selection failures covered next -- see Anti-Patterns for the "too many tools" pattern specifically.
`,

  "advanced-concepts": `
### Tool selection accuracy: what actually goes wrong

Tool-calling failures at the model-decision layer fall into three genuinely distinct categories, and each needs a different fix:

~~~text
1. HALLUCINATED TOOL -- the model requests a tool name that was never
   provided in the schema list. Fix: always validate the requested
   name against the exact allowlist you sent before executing anything;
   never assume the model only ever requests tools you gave it.

2. MALFORMED ARGUMENTS -- the tool name is real, but the arguments are
   not valid JSON, or do not conform to the declared schema (wrong
   type, missing required field, value outside an enum). Fix: validate
   arguments against the schema in application code even if the
   provider claims schema enforcement, and feed a structured error
   back rather than guessing a default.

3. WRONG TOOL / WRONG ARGUMENT VALUES -- the call is schema-valid but
   semantically incorrect: the right-shaped call to the wrong tool, or
   the right tool with plausible-looking but wrong argument values
   (e.g. the wrong city because two similarly named cities exist).
   Schema validation cannot catch this category at all -- it requires
   better tool descriptions, better few-shot examples in the prompt,
   or a verification/reflection step (see the Reflection skill) that
   checks the call against the actual user intent before executing it.
~~~

The honest, uncomfortable fact for a senior engineer to internalize: schema validation only defends against category 2. Categories 1 and 3 are model-behavior problems, not schema problems, and their rates vary meaningfully by provider, model size, and even between minor versions of the same model family -- do not assume a number you benchmarked against one model generation still holds after an upgrade; re-evaluate tool-selection accuracy whenever you change models, exactly as you would re-evaluate any other prompt-sensitive behavior (see **Evaluation**).

### Provider-specific quirks, stated honestly

Different providers implement tool calling with real behavioral differences that matter in production, and these differences shift over time as providers ship new versions -- treat the following as a snapshot of known categories of variation, not a fixed comparison table to memorize:

~~~text
- Some providers strictly enforce that emitted arguments are valid
  JSON conforming to the schema (constrained decoding); others
  historically have been looser, occasionally emitting near-valid JSON
  that still requires defensive parsing on the application side.
- Some APIs support "forcing" a specific tool call (skip the model's
  own decision of whether/which tool to call); others only support
  "tools are available, model decides freely" with no forcing option.
- Parallel tool-call support, and the exact response shape for multiple
  simultaneous calls, differs across providers and has changed across
  versions within the same provider.
- Tool-selection accuracy as a function of the NUMBER of tools offered
  degrades at different rates across model families -- a schema that
  works cleanly with five tools may show materially higher wrong-tool
  or hallucinated-tool rates at twenty tools on one model and hold up
  better on another.
~~~

Because these specifics change frequently, the right engineering habit is to treat tool-calling reliability as something you measure against your own tool set and your current model version (see Testing and Evaluation), not something you can assume from a blog post or a competitor's benchmark.

### Forced tool calls and tool choice control

Beyond "let the model freely decide whether to call a tool," most current APIs expose a tool_choice-style parameter letting the application force a specific tool call, force any tool call (but not free text), or force no tool call at all for this turn. This is a useful control surface: forcing a specific tool is valuable when the application already knows a lookup is needed (skipping the model's own "should I call a tool" decision entirely, which removes one source of wrong-tool error for that turn), while forcing no tool call is useful when you want a guaranteed final text answer on the current turn regardless of what the model might otherwise decide.

### Concurrency and result-aggregation semantics

When parallel tool calls are executed concurrently in application code, the aggregation logic must correctly associate each result with its originating tool_call_id (never assume calls complete or should be reported back in the order they were requested), and must decide a policy for partial failure: return every result including failures, and let the model's next turn reason over a mix of successes and failures, rather than either blocking on the slowest call indefinitely or discarding failed calls silently.

### Tool calling versus fine-tuning a model on your own tool format

Before native structured tool calling matured, some teams fine-tuned models on a bespoke tool-invocation format. This is now rarely the right default: native tool calling is schema-driven, works across the many tools you add over a system's life without retraining, and benefits from whatever tool-selection improvements the provider ships in later model versions. Fine-tuning a custom format is occasionally still justified for a very narrow, extremely high-volume, latency-critical tool-call pattern, but it trades away exactly the flexibility that made native tool calling worth adopting in the first place -- treat it as a deliberate, measured escalation, not a default.
`,

  "internal-working": `
Step by step, here is what actually happens for one tool-calling turn, from the application's perspective, using a provider's structured function-calling API:

~~~mermaid
flowchart TB
    A["Application constructs request: conversation messages + tool schemas (name, description, JSON Schema parameters)"] --> B["Model inference: model decides whether to respond with text or request a tool call"]
    B --> C{"Model's output"}
    C -->|"Plain text response"| D["Return text to caller -- no tool execution needed"]
    C -->|"One or more structured tool_call objects"| E["Application validates: is this tool name in the allowlist? do arguments parse and match the schema?"]
    E -->|"Invalid name or arguments"| F["Construct a structured error observation -- do NOT execute"]
    E -->|"Valid"| G["Application code executes the real function with the validated arguments"]
    G --> H["Capture result or exception, with a timeout"]
    F --> I["Append tool result (or error) message, tagged with tool_call_id"]
    H --> I
    I --> J["Send updated conversation (including tool result) back to the model"]
    J --> B
~~~

1. **Schema assembly**: the application decides which tools to offer on this turn (not necessarily every tool the system has -- see Best Practices on scoping the tool set) and serializes each as a JSON Schema-shaped description, sent as structured metadata alongside the conversation, not as part of the natural-language prompt text.
2. **Model inference**: the model, having been trained (or fine-tuned, or prompted at a base level) to recognize this structured tool-schema input, produces either ordinary text or one or more structured tool_call objects, each naming a tool and providing arguments as a JSON string (or, in some provider representations, an already-parsed object).
3. **Validation before execution**: the application must check the requested tool name against the exact set of tools it offered (never assume the model can only request tools you gave it -- hallucinated tool names, especially with weaker models or overloaded tool sets, are a real occurrence, not a hypothetical), and must parse and validate the arguments against the declared schema, since a provider's schema enforcement (where it exists at all) is not a substitute for the application's own validation, especially for tools with side effects.
4. **Execution**: only after validation does application code call the real function, with its own timeout and exception handling -- exactly as you would treat any other external, fallible dependency.
5. **Result capture and formatting**: the tool's real result (or a structured error, if it failed) is captured and formatted as a "tool" or "function" role message, tagged with the tool_call_id so the model can correctly associate it with the specific call it made (critical when multiple parallel calls were made in one turn).
6. **Feed back and continue**: the tool result message is appended to the conversation history, and the whole updated conversation (original messages, the model's tool-call turn, and the new tool-result turn) is sent back to the model for its next decision -- either another tool call, or a final text answer.

The crucial architectural fact this diagram makes visible, matching **Agent Fundamentals**' internal-working section but specific to the tool-calling mechanism itself: the model never touches the real function. It only ever emits a request. Every safety and reliability property of a tool-calling system is a property of what the application does between steps 3 and 4 -- the validation gap -- not a property of the model's output itself.
`,

  architecture: `
Understanding tool-calling architecture means understanding both the per-turn mechanics above and how a real application should structure the surrounding code: the tool registry, the schema-generation layer, the validation/execution boundary, and the result-formatting layer.

### The core components, at a glance

- **Tool registry** -- the authoritative list of tools the application can execute, each with its real implementation function, separate from whatever subset is exposed to the model on a given request.
- **Schema generator** -- code (often auto-derived from typed function signatures, e.g. via Python type hints and a docstring-to-description mapping) that produces the JSON Schema sent to the model; keeping this generated from the real function signature, rather than hand-written and separately maintained, avoids schema drift.
- **Validator** -- a layer that checks a requested tool name against the registry and validates arguments against the schema before any real execution, independent of whatever validation the provider claims to perform.
- **Executor** -- the code that actually invokes the real tool implementation, with a timeout, exception handling, and (for tools with side effects) a permission/approval check.
- **Result formatter** -- code that serializes a tool's result (or error) into the provider's expected tool-result message shape, tagged with the correct tool_call_id.

### Application architecture around tool calling

~~~mermaid
flowchart TB
    App["Application layer"] --> Registry["Tool registry\n(real functions + schemas)"]
    App --> Scope["Per-request tool scoping\n(which tools to expose this turn)"]
    Scope --> LLMCall["LLM call: conversation + scoped tool schemas"]
    LLMCall -->|tool_call requested| Validate["Validator: name allowlist check,\nargument schema check"]
    Validate -->|invalid| ErrorObs["Structured error observation"]
    Validate -->|valid| Permission{"Side-effecting tool?"}
    Permission -->|yes| Approval["Guardrail / human-approval gate"]
    Permission -->|no| Executor["Executor: real function call,\ntimeout + exception handling"]
    Approval -->|approved| Executor
    Approval -->|rejected| ErrorObs
    Executor --> Formatter["Result formatter\n(tagged by tool_call_id)"]
    ErrorObs --> Formatter
    Formatter --> LLMCall
    LLMCall -->|final text| App
~~~

Key architectural principles:

- **The tool registry and the per-request exposed tool set are different things.** A system may have thirty registered tools overall but should typically expose only the handful relevant to the current task -- see Best Practices and Performance for why over-exposing tools degrades accuracy and costs tokens.
- **Schema generation should derive from the real function signature**, not be maintained by hand in parallel, to avoid the schema silently drifting out of sync with what the function actually accepts.
- **Validation is a separate, non-negotiable layer**, independent of and in addition to whatever the provider itself enforces, because provider-side enforcement varies (see Advanced Concepts) and because side-effecting tools warrant defense in depth regardless.
- **The permission/approval gate belongs architecturally between validation and execution**, not folded into either -- this is where **Guardrails**-style policy decisions (is this specific action allowed for this user, in this context, right now) actually live.
`,

  "data-flow": `
Tracing one multi-tool-call task end to end, including a parallel tool-call turn and a failed call handled gracefully:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant LLM as LLM (decision step)
    participant Val as Validator
    participant Tool as Tool executor

    User->>App: "Compare the weather in Paris and Tokyo right now."
    App->>LLM: message + get_weather tool schema
    LLM-->>App: tool_calls: [get_weather(city=Paris), get_weather(city=Tokyo)]  (parallel)
    App->>Val: validate both calls (name + args)
    Val-->>App: both valid
    App->>Tool: execute get_weather(Paris) and get_weather(Tokyo) concurrently
    Tool-->>App: Paris: 15C rainy | Tokyo: timeout error
    App->>LLM: tool results (tagged by tool_call_id): Paris ok, Tokyo error
    LLM-->>App: tool_call: get_weather(city=Tokyo)  (retry, model's own decision)
    App->>Val: validate retry call
    Val-->>App: valid
    App->>Tool: execute get_weather(Tokyo)
    Tool-->>App: Tokyo: 22C clear
    App->>LLM: tool result: Tokyo ok
    LLM-->>App: final_answer: "Paris is 15C and rainy; Tokyo is 22C and clear."
    App-->>User: final answer
~~~

Two facts this trace makes concrete: first, a partial failure in a parallel batch (Tokyo timing out) does not have to fail the whole turn -- both results, including the failure, are returned to the model, which is then free to decide whether to retry, proceed with partial information, or explicitly tell the user something failed; the application does not have to hard-code that retry logic itself, though it could, and for high-stakes tools often should. Second, every tool call, whether part of the original parallel batch or a later retry, goes through the same validate-then-execute path -- there is no special, less-scrutinized path for "the model already tried this once."
`,

  "production-usage": `
### How real teams actually run tool calling in production

- **Tool sets are scoped per request, not globally maximized.** A system may register dozens of tools across its whole feature surface, but a given conversation or task type is typically offered only the handful genuinely relevant to it -- both for tool-selection accuracy and for token cost.
- **Schema generation is automated from real function signatures** (commonly via typed function definitions and docstrings) rather than hand-maintained in parallel, specifically to prevent schema drift as functions evolve.
- **Every tool call passes through a validation layer independent of provider-side schema enforcement**, because provider enforcement strength and behavior vary (see Advanced Concepts) and because defense in depth is warranted regardless of provider guarantees.
- **Side-effecting tools (writes, sends, deletions, financial actions, code execution) are treated categorically differently from read/retrieval tools** -- typically behind an explicit permission check or human-approval gate, never executed on the same unscrutinized path as a read-only lookup.
- **Full tool-call transcripts are logged**: requested tool name, arguments, validation outcome, execution result or error, and latency -- because debugging a tool-calling failure after the fact requires reconstructing exactly what was requested and what actually happened, not just seeing the final answer.
- **Parallel tool-call execution is bounded** with its own concurrency limits and per-call timeouts, so that a batch of many simultaneous tool calls cannot itself become a resource-exhaustion problem.

### Typical operational defaults

- Per-tool-call timeout, sized to the specific tool's realistic latency, not a single global default applied uniformly to a fast calculator and a slow external API alike.
- An explicit allowlist of tools exposed per request or per task type, generated from the tool registry, never "whatever tools happen to be registered in this environment."
- Argument validation against the declared JSON Schema performed in application code on every call, regardless of provider claims about schema enforcement.
- Structured, machine-parseable error responses fed back to the model on every failure path (invalid name, invalid arguments, execution failure, timeout), so the model can reason about and potentially recover from the failure.
- Rate limiting and concurrency caps on tool execution, especially for tools that wrap external, rate-limited third-party APIs.
`,

  "industry-examples": `
- **Coding assistants and autonomous coding agents** expose tools for reading and writing files, running the test suite, and executing shell commands, relying heavily on the model correctly selecting which of these to call and with which arguments at each step -- a domain where wrong-tool or malformed-argument errors have an immediate, visible ground-truth signal (the code does or does not compile and pass tests).
- **Customer support automation platforms** commonly expose a narrow, carefully scoped tool set (look up an order, check a policy, issue a refund up to a limit) with validation and human-approval gates specifically around the refund/write tools, illustrating the read-vs-write tool distinction from Intermediate Concepts in a concrete, high-stakes setting.
- **Enterprise "ops" and internal-tooling agents** wrap internal company APIs (deployment systems, ticketing, internal search) as tools, typically behind stricter validation and approval gating than public-facing consumer tools, given the higher blast radius of a wrong internal-system action.
- **Data-analysis and business-intelligence assistants** expose tools for querying structured data sources (SQL-like query tools, spreadsheet/data-table tools), where argument correctness (the right table, the right filter values) matters as much as tool selection, and where schema-level validation alone cannot catch a semantically wrong but syntactically valid query.
- **Search and browsing-enabled assistants** across multiple vendors expose a search or fetch-page tool as one of the most heavily used tools in production, and are a common real-world venue for the tool-output-as-untrusted-data security concern covered below, since fetched web content is attacker-influenceable.

Pattern to notice: production-successful tool-calling deployments share tightly scoped tool sets per task, an explicit read-vs-write distinction with extra scrutiny on write tools, and structured logging of every tool call -- the same discipline **Agent Fundamentals** identifies as characteristic of durable production agents generally, now specific to the tool layer itself.
`,

  "best-practices": `
1. **Write tool descriptions that state both when to use the tool and when not to** -- ambiguous or purely functional descriptions ("gets data") are a leading cause of wrong-tool selection.
2. **Scope the tool set per request to what the current task actually needs**, rather than exposing every registered tool on every call -- both for tool-selection accuracy and token cost (see Performance).
3. **Validate every tool call's name and arguments in application code**, independent of and in addition to whatever schema enforcement the provider claims, especially for tools with side effects.
4. **Treat every tool call as an external, fallible dependency**: give it its own timeout, its own exception handling, and never let a raw exception propagate up and crash the conversation loop.
5. **Feed structured errors back to the model on every failure path** (hallucinated tool name, malformed arguments, execution failure, timeout) rather than silently discarding the failed turn or substituting a default value.
6. **Gate side-effecting tools behind an explicit permission or human-approval check**, distinct from the validation applied to read-only tools -- see Security.
7. **Use enums and precise types in argument schemas wherever the valid value set is known**, narrowing the space of arguments the model can get wrong compared to free-text string fields.
8. **Generate tool schemas from real, typed function signatures** rather than hand-maintaining them separately, to prevent schema drift as the underlying function evolves.
9. **Tag and correctly associate every tool result with its originating tool_call_id**, especially under parallel tool calls, rather than assuming results arrive or should be reported in request order.
10. **Log the full tool-call transcript** (requested name, arguments, validation outcome, result or error, latency) for every call, not just the final answer, since debugging requires reconstructing the whole chain.
11. **Re-evaluate tool-selection accuracy whenever the underlying model version changes**, exactly as you would re-evaluate any other prompt-sensitive behavior -- accuracy at this layer is not a fixed, permanent property of your schema.
12. **Prefer a small number of higher-level tools that do more per call over many narrow, chatty tools**, reducing both the number of decision points where wrong-tool selection can occur and the total round trips required.
`,

  "anti-patterns": `
### Trusting the model's requested arguments as inherently safe

~~~python
# WRONG: executing directly from the model's arguments with no
# validation, especially dangerous for a tool with side effects.
def handle_tool_call(tool_call):
    args = json.loads(tool_call.function.arguments)
    return execute_sql(args["query"])   # model-generated SQL, unvalidated

# RIGHT: validate shape and content before anything resembling
# execution, and never build raw SQL/shell strings directly from
# model-generated text.
def handle_tool_call(tool_call):
    args = json.loads(tool_call.function.arguments)
    if "query" not in args or not isinstance(args["query"], str):
        return {"error": "invalid_arguments"}
    # Use parameterized queries / an allowlisted query builder --
    # never string-concatenate model output into SQL or shell commands.
    return execute_parameterized_query(args["query"])
~~~

### Other common tool-calling anti-patterns

- **Offering every registered tool on every request "just in case."** This measurably degrades tool-selection accuracy on some models as the tool count grows, and costs tokens on every single request whether or not any tool is ultimately called -- scope tools per task instead.
- **Skipping application-side argument validation because "the provider enforces the schema."** Provider-side enforcement strength and behavior varies across providers and versions (see Advanced Concepts); it is not a substitute for your own validation, especially for side-effecting tools.
- **Treating a hallucinated tool name as a bug to silently ignore** rather than as an expected failure mode to detect and report back to the model as a structured error -- an unrecognized tool name reaching your execution code without an explicit check is an incident, not an edge case.
- **Letting a tool exception propagate and crash the whole conversation loop**, rather than catching it and feeding a structured error observation back so the model (and, in production, your monitoring) can react.
- **Writing vague tool descriptions** ("handles user queries") that give the model no real signal about when the tool applies, then being surprised by poor tool-selection accuracy.
- **Failing a whole parallel tool-call batch because one call errored**, instead of returning every result (including the failure) and letting the model's next turn reason over the mix.
- **Building tool arguments directly into raw SQL, shell commands, or file paths via string concatenation** -- the same injection-class vulnerability as any other unvalidated input, now arriving via the model instead of a user form field.
- **Assuming tool-selection accuracy measured on one model version still holds after a model upgrade** without re-evaluating -- tool-calling behavior is prompt- and model-version-sensitive, exactly like any other LLM behavior.
`,

  performance: `
### Measure first

Before optimizing, instrument, per tool-calling turn: which tool(s) were requested, whether the request was valid on first attempt (no retry needed), execution latency per tool call, and total tokens consumed by the tool schemas themselves versus the rest of the conversation. Without this, "tool calling feels slow" or "the model seems to pick the wrong tool a lot" are guesses, not engineering.

### The optimization hierarchy for tool-calling systems (apply in order)

1. **Scope the tool set to what the current task actually needs.** This is almost always the highest-leverage lever: fewer tools offered means fewer schema tokens sent on every request and, on many models, measurably better tool-selection accuracy, since the model has a smaller, less ambiguous menu to choose from.
2. **Prefer fewer, higher-level tools over many narrow ones.** A tool that fetches and summarizes in one call beats three separate calls to fetch, then filter, then summarize -- fewer round trips means less latency and fewer decision points where wrong-tool selection can occur.
3. **Keep tool descriptions and argument schemas concise but precise.** Bloated descriptions cost tokens on every request where the tool is offered; vague ones cost accuracy -- the goal is the minimum description that removes ambiguity, not the maximum detail.
4. **Parallelize independent tool calls** where the task and the API support it, reducing wall-clock latency even when total token cost across calls is similar to executing them sequentially.
5. **Cache tool results for repeated, idempotent lookups** (the same city's weather requested twice in a short window) to avoid redundant external calls and redundant model re-reasoning over identical information.
6. **Push model-serving-level optimization (batching, KV-caching, model choice) to the LLM Fundamentals-adjacent Inference and Serving skills** rather than trying to solve it at the tool-orchestration layer.

### Facts worth knowing at this level

- Every tool schema offered consumes prompt tokens on every request in that turn, whether or not the tool is ultimately called -- a large, rarely-pruned tool set is a standing token cost, not a one-time one.
- Tool-selection accuracy as a function of the number of tools offered does not degrade uniformly across models -- measure it against your own tool set and current model rather than assuming a fixed threshold.
- Parallel tool calls reduce wall-clock latency, not total token cost -- the tokens for each call's arguments and result are still paid; the win is concurrency of execution, not fewer total tokens.
`,

  scalability: `
Scalability for tool-calling systems has two distinct dimensions: scaling the number of concurrent tool-calling conversations (largely the same infrastructure story as scaling any LLM-backed application, per **LLM Fundamentals**), and scaling the reliability and throughput of tool execution itself as tool count and call volume grow.

### The concurrency-scaling story

~~~mermaid
flowchart LR
    LB["Request queue / load balancer"] --> Conv1["Conversation 1"]
    LB --> Conv2["Conversation 2"]
    LB --> ConvN["Conversation N"]
    Conv1 & Conv2 & ConvN --> Router["Model gateway / router"]
    Router --> M1["LLM endpoint"]
    Conv1 & Conv2 & ConvN --> ToolPool["Shared tool execution pool\n(per-tool rate limits, sandboxed)"]
    ToolPool --> Ext["External APIs / databases /\ncode-execution sandboxes"]
~~~

Individual conversations are typically independent and scale horizontally the same way independent LLM-backed requests do; the real constraints are provider rate limits on the LLM calls themselves, and rate or capacity limits on whatever external systems the tools actually call (a shared database, a shared code sandbox, a third-party API with its own quota) -- these tool-side constraints are frequently the tighter bottleneck under real load, since they were often not designed for LLM-driven call volume or call patterns.

### Known bottlenecks and answers

| Bottleneck | Answer |
|---|---|
| Tool count grows, tool-selection accuracy degrades | Scope tools per task/request rather than exposing the full registry; split an overloaded flat tool list into task-specific subsets |
| Shared external API or database becomes the constraint under concurrent tool-call load | Rate-limit and queue tool access centrally (per tool, not per conversation independently), with backoff |
| Parallel tool-call batches spike concurrency unpredictably | Bound per-batch concurrency explicitly, rather than executing every requested call in a batch unconditionally in parallel |
| Schema-token overhead grows as more tools are registered | Prune per-request exposure aggressively; consider hierarchical tool discovery (expose a small "which category of tool do you need" step before the full schema) for very large tool registries |
| Tool execution latency variance (fast calculator vs slow external API mixed in one tool set) | Per-tool timeouts sized to that specific tool's realistic latency, not one uniform global timeout |

The single most important scalability idea specific to tool calling: unlike a plain text-generation request, a tool-calling conversation's true resource consumption depends on tool execution latency and reliability, which are properties of systems the LLM application does not control (external APIs, databases) -- capacity planning must account for these dependencies' own limits, not just the LLM provider's.
`,

  security: `
### Tool-calling-specific attack surface

1. **Tool result content used as an instruction, not data (prompt injection via tool output).** If a tool's result (a fetched web page, a database record, a file's contents) contains adversarial text, the model may treat it as a command rather than information to reason about -- the same risk covered generally in **LLM Fundamentals** and **Agent Fundamentals**, but here with a direct, concrete path: a manipulated observation can lead the model to request a further, harmful tool call. This is arguably the single most consequential tool-calling-specific security concern.
2. **Blind execution of model-requested actions with real side effects.** The most basic and most costly mistake: treating "the model requested this tool call" as equivalent to "this action should happen." The model's request is a suggestion from a probabilistic system, not an authorization -- every side-effecting tool call needs its own validation and, for consequential actions, an explicit permission or human-approval gate.
3. **Argument injection into downstream systems.** Passing model-generated argument values directly into a SQL query, shell command, or file path without parameterization or sanitization is the same class of injection vulnerability as any other untrusted input, now arriving via the model instead of a user form field -- never string-concatenate model output into a command or query.
4. **Privilege escalation through tool chaining.** An agent with both a broad read tool and a narrower write tool can, if manipulated, use information gathered via the read tool to construct a harmful write call that could not have been triggered directly -- permission design needs to account for what is reachable by chaining allowed tools, not just what each tool does in isolation.
5. **Hallucinated or spoofed tool names reaching execution code.** If application code does not strictly validate the requested tool name against the exact set of tools it offered, a bug (or, in principle, an unexpected model output) could reach an unintended code path -- always check the name against an allowlist before dispatch, never a loose string match.
6. **Resource-abuse via tool-call volume.** An attacker (or a malfunctioning loop) that can induce many tool calls, or large/expensive tool executions, has effectively found a cost- and capacity-amplification vector -- rate limits and execution budgets on tool calls are a security control, not only a cost control.

### Defenses

- Treat every tool result as untrusted content with respect to instructions -- the model should be steered (via system instructions and, where the provider supports it, structural separation of tool-result content from instructions) to treat tool outputs as data, not commands.
- Validate and sanitize tool arguments in application code on every call, regardless of provider-side schema enforcement claims, and never build downstream queries or commands via raw string concatenation of model output.
- Scope tool permissions to the minimum required for the task, and flag any tool set combining broad read access with write/external-send capability as requiring extra review.
- Gate side-effecting, costly, or irreversible tool calls behind an explicit permission check or human-approval step, with the arguments visible for review before execution.
- Enforce per-tool rate limits and execution budgets as a security control, not only a cost control.
- Log every requested and executed tool call, including rejected/invalid ones, so an incident can be reconstructed after the fact.

See the **Guardrails**, **Agent Fundamentals**, **MCP**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond the tool-calling-specific layer covered here -- this section is the tool-execution-specific layer on top of the general LLM security picture in **LLM Fundamentals**.
`,

  testing: `
Testing tool-calling systems requires asserting on both mechanical correctness (did validation and execution behave correctly given a known model response) and model-decision quality (did the model choose the right tool and arguments given a realistic prompt), which need different testing strategies.

~~~python
# Mechanical tests: mock the model's tool_call output and assert the
# application layer behaves correctly -- deterministic, fast, no real
# model calls needed.

def test_hallucinated_tool_name_is_rejected():
    fake_tool_call = make_fake_tool_call(name="delete_everything", arguments="{}")
    result = handle_tool_call(fake_tool_call, allowed_tools={"get_weather"})
    assert result["ok"] is False
    assert result["error"] == "unknown_tool"

def test_malformed_arguments_are_rejected_not_executed():
    fake_tool_call = make_fake_tool_call(name="get_weather", arguments="{not valid json")
    result = handle_tool_call(fake_tool_call, allowed_tools={"get_weather"})
    assert result["ok"] is False
    assert result["error"] == "invalid_arguments"

def test_tool_timeout_reported_gracefully():
    slow_tool = lambda **kwargs: time.sleep(999)
    result = safe_tool_call(slow_tool, {}, timeout_seconds=0.1)
    assert result["ok"] is False
    assert result["error"] == "tool_timeout"

def test_parallel_batch_partial_failure_returns_all_results():
    calls = [make_fake_tool_call("get_weather", '{"city": "Paris"}'),
             make_fake_tool_call("get_weather", '{"city": "unknown_city"}')]
    results = handle_tool_call_batch(calls, allowed_tools={"get_weather"})
    assert len(results) == 2                      # both reported, not just the failure
    assert results[0]["ok"] is True
    assert results[1]["ok"] is False
~~~

~~~python
# Model-decision tests: real (or recorded) model calls, scored across a
# representative task set -- these connect directly to the Evaluation
# skill's methodology, applied specifically to tool selection.

def test_tool_selection_accuracy_on_representative_prompts(client):
    cases = [
        ("What's the weather in Tokyo right now?", "get_weather"),
        ("What's 15 percent of 240?", "calculator"),
        ("Summarize this document for me.", None),  # should NOT call a tool
    ]
    correct = 0
    for prompt, expected_tool in cases:
        response = call_model([{"role": "user", "content": prompt}], client)
        called = response.choices[0].message.tool_calls
        got_tool = called[0].function.name if called else None
        correct += (got_tool == expected_tool)
    accuracy = correct / len(cases)
    assert accuracy >= 0.8   # threshold set from a real evaluation baseline, not guessed
~~~

### Fundamentals-level testing doctrine for tool calling

- **Separate mechanical/validation tests (deterministic, mockable) from model-decision tests (need real model calls and a scoring approach)** -- conflating them makes it unclear whether a failing test indicates an application bug or a model-behavior regression.
- **Test every failure path explicitly**: hallucinated tool name, malformed arguments, execution exception, timeout, partial parallel-batch failure -- each is a distinct scenario, not one generic "error case."
- **Measure tool-selection accuracy against a representative, versioned task set**, and re-run it whenever the model version or tool schemas change, since both are common causes of accuracy regressions.
- **Test that side-effecting tools genuinely require their permission/approval gate** as its own explicit test -- this is a safety-critical control, and a regression here is a real incident, not a minor bug.
`,

  debugging: `
### Escalation path for debugging unexpected tool-calling behavior

1. **Reconstruct the exact tool-call request first**: the tool name, the raw arguments string as emitted by the model, and the full conversation context that preceded it -- before theorizing about why the model chose what it chose.

~~~python
def print_tool_call_debug(tool_call, preceding_messages) -> None:
    """Debugging habit: before theorizing about a wrong tool call, print
    exactly what was requested and what context preceded it."""
    print(f"requested tool: {tool_call.function.name}")
    print(f"raw arguments:  {tool_call.function.arguments}")
    print("preceding context (last 3 messages):")
    for msg in preceding_messages[-3:]:
        print(f"  {msg['role']}: {str(msg.get('content'))[:200]}")
~~~

2. **Classify the failure into one of the three categories from Advanced Concepts** -- hallucinated tool name, malformed arguments, or wrong tool/wrong argument values -- since each has a different fix (allowlist enforcement, stricter schema/validation, or better descriptions/examples respectively).
3. **Check whether the tool set offered on this turn was larger or more ambiguous than necessary** -- a wrong-tool-selection failure is often explained by an overloaded or under-described tool list rather than a fundamental model limitation.
4. **Check whether the failure originated in a much earlier turn.** In a multi-turn tool-calling conversation, a wrong final answer is often the downstream consequence of a bad tool result several turns earlier being misread or insufficiently examined, not a problem with the final turn itself.
5. **Reproduce with a lower/near-zero temperature** (if the API exposes this) to remove sampling randomness as a variable while isolating whether the issue is in the tool description, the schema, or a genuine model limitation.
6. **Check whether a tool's real behavior changed upstream** -- a previously-working tool schema producing worse call accuracy after a deploy often means the tool's actual response shape or semantics changed, and the description/schema no longer accurately reflects it.
7. **Escalate to a proper multi-example evaluation** (see **Evaluation**, applied to tool-selection accuracy) once single-example debugging has ruled out obvious schema, description, or validation bugs -- some tool-selection failures are genuine model-capability limitations at the current tool-set size, not fixable by adjusting one schema.

### Common "it's not a bug, it's the fundamentals" traps

- Model "ignores" a tool: often the description does not clearly state when to use it, or a competing tool's description is more compelling for the given prompt -- rewrite descriptions before assuming a model limitation.
- Model calls a tool that was not actually offered on this turn: check whether stale tool-schema state (a caching bug, or tools left in the request from a previous unrelated turn) is leaking into the current request.
- Arguments look almost right but subtly wrong: check whether the schema's field descriptions and examples are precise enough, and whether similarly named or similarly shaped fields exist elsewhere in the schema causing confusion.
`,

  monitoring: `
Production tool-calling monitoring extends standard LLM-call monitoring (per **LLM Fundamentals**) with signals specific to structured tool invocation.

### What to measure

- **Tool-call validity rate**: the fraction of requested tool calls that pass name-allowlist and argument-schema validation on the first attempt, decomposed by tool -- a sudden drop for one specific tool is a strong signal that its schema or description needs attention, or that a model version change affected it disproportionately.
- **Tool-selection distribution**: which tools are called, how often, for which task types -- a sudden shift can indicate a prompt regression, a tool-description problem, or, in the worst case, a misuse or injection attempt succeeding.
- **Hallucinated-tool-name rate**: how often a requested tool name does not match anything in the allowlist -- should be near zero in a healthy system, and any non-trivial rate warrants investigation before it is dismissed as noise.
- **Tool execution latency and error rate, per tool** -- since tools wrap external, fallible dependencies, their latency and error profile deserves the same dedicated monitoring as any other external service call.
- **Parallel-batch partial-failure rate** -- how often a multi-call batch contains at least one failure, to catch a degrading downstream dependency before it becomes a broader incident.

~~~python
# Minimal instrumentation sketch around a tool-calling turn.
import time
import logging

logger = logging.getLogger("tool_calls")

def execute_tool_call_with_monitoring(tool_call, allowed_tools: dict) -> dict:
    start = time.perf_counter()
    name = tool_call.function.name
    valid_name = name in allowed_tools

    if not valid_name:
        logger.warning("tool_call_hallucinated_name", extra={"requested_tool": name})
        return {"ok": False, "error": "unknown_tool"}

    result = safe_tool_call(allowed_tools[name], parse_arguments(tool_call), timeout_seconds=10)
    elapsed = time.perf_counter() - start

    logger.info(
        "tool_call_executed",
        extra={
            "tool": name,
            "ok": result["ok"],
            "latency_seconds": elapsed,
            "error": result.get("error"),
        },
    )
    return result
~~~

### Tool-calling-specific things to watch

- A rising hallucinated-tool-name or invalid-argument rate after a model version upgrade is a leading indicator that tool-selection accuracy has shifted and warrants immediate re-evaluation, not a wait-and-see response.
- A rising rate of one specific tool's execution errors likely reflects a genuine downstream dependency problem (the real API or database the tool wraps), not a model-behavior issue -- route the alert accordingly.
- A sudden shift in which tools are called for a stable task type can indicate a prompt or schema regression, or, rarely but seriously, a successful injection attempt redirecting the model's tool choices.
`,

  deployment: `
Deploying a tool-calling feature builds on the deployment concerns already covered in **LLM Fundamentals** (pinned model version, secrets management, timeouts/retries) with tool-specific configuration that must be explicit at deploy time.

### Configuration that must be explicit at deployment time

~~~text
TOOL_ALLOWLIST_PER_TASK=weather:get_weather;
                         support:get_order_status,issue_refund
                         # explicit per-task-type allowlist, never
                         # "expose every registered tool everywhere"
TOOL_TIMEOUT_SECONDS_DEFAULT=10       # per-tool override where realistic
                                       # latency differs meaningfully
TOOL_MAX_PARALLEL_CALLS=5             # bound concurrent execution within
                                       # a single parallel tool-call batch
TOOL_APPROVAL_REQUIRED_FOR=issue_refund,delete_record,send_email
                                       # explicit side-effecting-tool gate
TOOL_SCHEMA_SOURCE=generated_from_signatures  # not hand-maintained
                                       # in parallel with real functions
LLM_MODEL=<pinned model version, not "latest">
~~~

Why each choice matters: the per-task-type allowlist is the primary lever for both tool-selection accuracy and blast-radius containment; per-tool timeouts prevent one slow external dependency from stalling an entire conversation; the parallel-call concurrency cap prevents a single conversation from producing an unbounded burst of concurrent external calls; the approval list is where consequential, irreversible, or costly actions are gated regardless of how confident the model's request appears; pinning the schema source to generated-from-signatures prevents the class of bugs where a hand-maintained schema silently drifts from what the function actually accepts.

### Rollout practice specific to tool-calling features

- **Roll out changes to tool schemas, descriptions, or the exposed tool set behind a flag**, and evaluate tool-selection accuracy on a representative task set (see **Evaluation**) before full rollout -- these are behavior changes whose blast radius includes every conversation that reaches that tool, not a narrow, isolated change.
- **Canary new tools or an expanded tool set to a small percentage of traffic first**, monitoring hallucinated-tool-name rate and tool-selection distribution specifically, before enabling broadly.
- **Keep a non-tool-calling fallback** for critical task types where tool-calling accuracy does not meet the bar -- routing to a deterministic lookup path or a human, rather than the feature failing outright.
`,

  "production-checklist": `
Before a tool-calling feature takes real production traffic:

- [ ] Every tool's schema generated from (or verified against) its real function signature, not hand-maintained separately
- [ ] Requested tool names validated against an explicit allowlist before any execution -- hallucinated names never reach real code
- [ ] Arguments validated against the declared JSON Schema in application code, independent of provider-side enforcement
- [ ] Every tool call has its own timeout and explicit exception handling, distinct per tool where realistic latency differs
- [ ] Side-effecting tools identified explicitly and gated behind a permission or human-approval check
- [ ] Parallel tool-call batches bounded by a concurrency limit and handle partial failure by returning all results, not failing the whole batch
- [ ] Full tool-call transcript logged per turn (name, arguments, validation outcome, result/error, latency), with privacy-appropriate redaction
- [ ] Tool-selection accuracy measured on a representative, versioned task set -- not assumed from a general impression -- see **Evaluation**
- [ ] Monitoring in place for hallucinated-tool-name rate, invalid-argument rate, and per-tool execution error rate
- [ ] Tool set scoped per task type, not globally maximized across every request
- [ ] Argument values that reach downstream systems (SQL, shell, file paths) are parameterized or sanitized, never raw string-concatenated
- [ ] Model version pinned; tool-selection accuracy re-evaluated before any model version change ships
- [ ] A non-tool-calling fallback path exists for task types where tool-calling accuracy has not met the bar
`,

  "common-mistakes": `
1. **Executing a tool call directly from the model's arguments with no validation** -- treating "the model requested this" as equivalent to "this is safe to run" is the single most consequential mistake on this page's topic.
2. **Assuming provider-side schema enforcement is sufficient** and skipping application-level argument validation, especially for side-effecting tools -- enforcement strength and behavior vary across providers and versions.
3. **Offering every registered tool on every request "for flexibility"** -- degrades tool-selection accuracy on some models and costs tokens on every request regardless of whether any tool is used.
4. **Writing vague tool descriptions** that do not state when the tool applies (and when it does not), then attributing the resulting wrong-tool-selection to "the model just isn't good at this."
5. **Letting a tool's exception propagate and crash the whole conversation loop** instead of catching it and feeding a structured error observation back to the model.
6. **Failing an entire parallel tool-call batch because one call errored**, rather than returning every result including the failure and letting the model's next turn reason over the mix.
7. **Not distinguishing read/retrieval tools from write/side-effecting tools** in the permission model -- treating a database-write tool with the same scrutiny level as a weather lookup.
8. **Building downstream queries or commands via raw string concatenation of model-generated argument values** -- the same injection-class vulnerability as any other unvalidated input.
9. **Assuming tool-selection accuracy measured once stays valid indefinitely**, without re-evaluating after a model version upgrade or a tool-schema change.
10. **Debugging a wrong tool call from the final answer alone**, rather than reconstructing the exact requested tool name, raw arguments, and preceding conversation context that led to it.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Model requests a tool name that does not exist in the schema | Hallucinated tool call, more likely with an overloaded or ambiguous tool set | Validate the name against an exact allowlist before execution; scope and clarify the tool set; report the error back to the model |
| Arguments fail to parse as JSON, or parse but do not match the schema | Malformed tool call -- weaker schema enforcement on this provider/model, or an under-constrained schema | Validate arguments in application code regardless of provider claims; tighten the schema (enums, required fields, types); feed a structured error back |
| Right tool called, but with subtly wrong argument values | Ambiguous or under-specified argument descriptions; similarly named entities confusing the model | Improve field descriptions and examples; consider a verification/reflection step for high-stakes calls |
| Tool call succeeds but the model's final answer ignores or contradicts the result | Result not clearly associated with its tool_call_id (especially under parallel calls), or transcript truncation dropped the observation | Verify tool_call_id tagging is correct; check memory/summarization strategy for dropped context, see **Agent Memory** |
| Parallel tool-call batch fails entirely because one call errored | Batch-level failure handling instead of per-call, all-results-returned handling | Return every result including failures, tagged by tool_call_id; let the model's next turn reason over partial success |
| Tool executes but takes an unsafe or unintended action | No validation or permission gate before execution; model-generated arguments passed unsanitized into a downstream system | Add validation and a permission/approval gate for side-effecting tools; parameterize downstream queries/commands |
| Tool-selection accuracy drops after a model or prompt change | Model version regression on this specific tool set, or a tool description/schema change that introduced ambiguity | Re-run the tool-selection evaluation suite; do not assume prior accuracy still holds after any such change |
| High latency on tool-calling turns | Tool execution latency (an external dependency), not the model call itself, or an unbounded parallel-batch concurrency spike | Instrument per-tool latency separately from model latency; bound parallel-batch concurrency explicitly |
`,

  faqs: `
**Q: Is tool calling the same thing as function calling?**
Yes -- "tool calling" and "function calling" refer to the same mechanism; different providers and frameworks use different terminology, but the underlying protocol (structured schema in, structured call request out, result fed back) is the same.

**Q: Does the model actually execute the function?**
No, never. The model only ever emits a structured request naming a function and its arguments. Application code, entirely outside the model, decides whether and how to actually execute it -- this is the central trust boundary this whole page builds on.

**Q: What happens if the model requests a tool that was never provided?**
This is a hallucinated tool call. Well-built applications validate the requested name against the exact set of tools offered before any execution, and report an error back to the model (or to monitoring) rather than assuming it cannot happen.

**Q: Does JSON Schema validation guarantee the tool call is correct?**
No -- it guarantees the arguments are shaped correctly (right types, required fields present, values within any declared enum), but it cannot catch a schema-valid call to the wrong tool, or schema-valid but semantically wrong argument values (the wrong city, the wrong customer ID). See Advanced Concepts for why this distinction matters.

**Q: Should I always use parallel tool calls when the API supports them?**
Only when the calls are genuinely independent -- parallelizing calls whose results actually depend on each other in sequence does not make sense, and even for independent calls, parallel execution adds result-aggregation and partial-failure-handling complexity that a simple sequential loop does not have to deal with.

**Q: How is tool calling different from MCP?**
Tool calling is the underlying provider-level mechanism (schema in, structured call out); **MCP (Model Context Protocol)** is a vendor-neutral standard for describing and exposing tools (and broader context) so that a tool built once can be consumed by different agent frameworks and providers, rather than every framework inventing its own tool-description and discovery convention. MCP sits on top of, and standardizes around, the same fundamental tool-calling protocol described on this page.

**Q: Is it safe to let a model call any tool it wants automatically?**
Only for tools with no meaningful side effects and low blast radius if misused. Any tool that writes, sends, deletes, spends money, or executes code should go through explicit validation and, in most production systems, a permission or human-approval gate before execution -- see Security.

**Q: Where do I go next after this page?**
If your priority is the vendor-neutral standard for exposing tools across frameworks, go to **MCP**; if it's the safety/approval layer around tool execution, go to **Guardrails**; if it's getting reliable, schema-shaped output more generally (not just for tool arguments), go to **Structured Outputs**; if it's the broader agent loop this page's mechanism sits inside, revisit **Agent Fundamentals**; if it's a specific framework's implementation of all this, go to **LangChain** or the **OpenAI Agents SDK**.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is tool calling (function calling), mechanically?* Model answer sketch: the developer describes a function's name, purpose, and JSON Schema argument shape to the model alongside the prompt; the model can respond with a structured request naming that function and providing arguments; application code outside the model validates and executes the request, then feeds the real result back as new context.
2. *Does the model ever execute the tool itself?* No -- the model only ever emits a structured request. Application code decides whether and how to actually execute it; this separation is the core trust boundary in any tool-calling system.
3. *What are the three parts of a tool schema?* Name, a natural-language description (including when to use it and when not to), and a JSON Schema describing its parameters (types, required fields, constraints like enums).
4. *What is a hallucinated tool call?* The model requests a tool name that was never actually provided in the schema list offered to it -- application code must validate the requested name against an exact allowlist before executing anything.
5. *Why can't JSON Schema validation alone guarantee a tool call is correct?* It only validates shape (types, required fields, enum membership), not semantic correctness -- a schema-valid call can still be the wrong tool entirely, or the right tool with plausible but wrong argument values.

**Senior:**

6. *Design the validation and execution pipeline for a tool with real side effects (e.g. issuing a refund).* Discuss: name-allowlist validation, argument schema validation independent of provider enforcement, sanitized/parameterized use of arguments in any downstream system, an explicit human-approval or policy-check gate specific to this tool, structured logging of the full request and outcome, and treating the tool's own result/error as a first-class observation fed back to the model.
7. *How do parallel tool calls change error-handling design compared to sequential calls?* A batch of parallel calls can partially fail; the correct pattern is to execute independent calls concurrently (with a bounded concurrency limit), then return every result -- successes and failures alike, each tagged by its tool_call_id -- rather than failing the whole batch on one error, letting the model's next turn reason over the mix.
8. *A team reports their agent's tool-selection accuracy dropped significantly after a routine model upgrade. How do you investigate?* Reconstruct failed tool-call transcripts first; re-run the tool-selection evaluation suite against the new model version specifically; check whether the tool set or schemas changed simultaneously (confounding the comparison); check whether the drop concentrates on specific tools (suggesting a description/schema issue) or is uniform (suggesting a genuine model-version behavior shift) before concluding anything.
9. *Why is exposing every registered tool on every request a bad default?* It costs prompt tokens on every request regardless of whether any tool is used, and on many models measurably increases wrong-tool or hallucinated-tool rates as the tool count and ambiguity grow -- tool sets should be scoped per task/request to what is actually relevant.
10. *How would you defend against a manipulated tool result leading to an unintended, harmful further tool call (tool-output prompt injection)?* Treat tool outputs as untrusted data with respect to instructions, not commands; scope tool permissions tightly (minimum needed per task); flag any tool set combining broad read access with an external write/send capability as high risk requiring extra review; gate consequential actions behind human approval regardless of how the model's reasoning arrived at the request.
11. *Explain the difference between forcing a specific tool call and letting the model freely decide.* Forcing skips the model's own "should I call a tool, and which one" decision for that turn, useful when the application already knows a specific lookup is needed and wants to remove that decision point as a source of error; free choice lets the model decide based on the conversation, which is necessary when the application genuinely does not know in advance whether or which tool is needed.
12. *How do you decide whether a wrong tool call is a schema problem or a model-behavior problem?* If the call fails JSON Schema validation (wrong type, missing required field, invalid enum value), it is a schema/validation-layer issue, fixable by tightening the schema or the application's validation; if the call is schema-valid but names the wrong tool or supplies plausible-but-incorrect argument values, it is a model-decision issue, addressed via better descriptions, examples, a smaller/clearer tool set, or a verification step -- not fixable by schema validation alone.
`,

  "coding-questions": `
### 1. Build a validated, error-handled tool dispatcher

~~~python
from dataclasses import dataclass
import json

@dataclass
class ToolResult:
    ok: bool
    tool_call_id: str
    payload: dict

def dispatch_tool_call(tool_call, tool_registry: dict, timeout_seconds: float = 10.0) -> ToolResult:
    """tool_registry maps an allowlisted tool name to (callable, schema).
    Never execute a tool whose name is not in this exact registry."""
    name = tool_call.function.name

    if name not in tool_registry:
        return ToolResult(False, tool_call.id, {"error": "unknown_tool", "requested": name})

    fn, schema = tool_registry[name]

    try:
        args = json.loads(tool_call.function.arguments)
    except json.JSONDecodeError as exc:
        return ToolResult(False, tool_call.id, {"error": "invalid_json", "detail": str(exc)})

    validation_error = validate_against_schema(args, schema)   # your JSON Schema validator
    if validation_error:
        return ToolResult(False, tool_call.id, {"error": "schema_violation", "detail": validation_error})

    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(fn, **args)
        try:
            result = future.result(timeout=timeout_seconds)
            return ToolResult(True, tool_call.id, {"result": result})
        except concurrent.futures.TimeoutError:
            return ToolResult(False, tool_call.id, {"error": "timeout"})
        except Exception as exc:  # noqa: BLE001
            return ToolResult(False, tool_call.id, {"error": "execution_failed", "detail": str(exc)})
~~~

Complexity: O(1) per call plus the real tool's own execution cost. Follow-ups: add a per-tool timeout override instead of one global value; add structured audit logging of every dispatch outcome, including rejections.

### 2. Execute a parallel tool-call batch with bounded concurrency and partial-failure handling

~~~python
import concurrent.futures

def dispatch_parallel_batch(tool_calls: list, tool_registry: dict, max_concurrency: int = 5) -> list:
    """Executes an entire batch of tool calls concurrently (bounded), and
    returns every result -- including failures -- tagged by tool_call_id,
    rather than failing the whole batch if one call errors."""
    results = [None] * len(tool_calls)

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrency) as pool:
        future_to_index = {
            pool.submit(dispatch_tool_call, call, tool_registry): i
            for i, call in enumerate(tool_calls)
        }
        for future in concurrent.futures.as_completed(future_to_index):
            index = future_to_index[future]
            results[index] = future.result()   # dispatch_tool_call never raises

    return results   # caller feeds every result back to the model, success or not
~~~

Complexity: O(n / max_concurrency) wall-clock time for n independent calls, versus O(n) sequentially. Follow-ups: add per-batch total-timeout enforcement in addition to per-call timeouts; add a circuit breaker that stops issuing new calls in a batch if a threshold of failures is already reached.

### 3. Detect a hallucinated or repeated invalid tool call across a conversation

~~~python
def summarize_tool_call_health(transcript: list[ToolResult]) -> dict:
    """Given the ToolResult history of a conversation, compute health
    signals worth alerting on: hallucination rate, and whether the same
    invalid call is being repeated (a stuck-loop signal, see Agent
    Fundamentals' non-convergence failure mode)."""
    total = len(transcript)
    if total == 0:
        return {"hallucination_rate": 0.0, "repeated_invalid": False}

    hallucinated = sum(1 for r in transcript if r.payload.get("error") == "unknown_tool")
    failures = [r for r in transcript if not r.ok]

    repeated_invalid = False
    if len(failures) >= 3:
        last_three = failures[-3:]
        repeated_invalid = len({json.dumps(f.payload, sort_keys=True) for f in last_three}) == 1

    return {
        "hallucination_rate": hallucinated / total,
        "repeated_invalid": repeated_invalid,
    }
~~~

Complexity: O(n) over the transcript. Follow-ups: wire this into the orchestrator so a detected repeated-invalid-call streak injects an explicit "this exact call keeps failing, try something different" observation rather than silently continuing to retry identically.
`,

  "hands-on-labs": `
### Lab 1 -- From-scratch validated tool dispatcher against a real API (beginner, ~1.5h)
Using a real LLM provider API and one real tool (e.g. a calculator or a small wrapped public API), implement the full request-execute-return cycle from scratch: schema definition, name-allowlist validation, argument schema validation, timeout-bounded execution, and structured error feedback. Deliverable: a working script plus a short write-up of what happens when you deliberately send it a prompt likely to produce a malformed or off-schema argument. Skills exercised: the core protocol mechanics, defensive validation.

### Lab 2 -- Tool-selection accuracy evaluation across schema variants (beginner/intermediate, ~1.5h)
Build a small evaluation set of 15-20 prompts spanning a 3-4 tool schema (including some prompts that should call no tool at all), run it against two variants of your tool descriptions (one deliberately vague, one precise per Best Practices), and measure and compare tool-selection accuracy across both. Deliverable: a short report with the accuracy numbers and your explanation of the difference. Skills exercised: the direct, measurable link between description quality and tool-selection accuracy.

### Lab 3 -- Parallel tool-call batch with bounded concurrency and partial-failure handling (intermediate, ~2.5h)
Extend Lab 1 with a second, independent tool, force (or prompt for) a parallel tool-call turn, and implement bounded-concurrency execution that returns every result -- including a deliberately injected failure in one of the calls -- correctly tagged by tool_call_id. Deliverable: a tested module demonstrating the partial-failure case working correctly, plus the model's subsequent turn reasoning over the mixed results. Skills exercised: parallel-call orchestration, partial-failure design.

### Lab 4 -- Guardrailed side-effecting tool with an approval gate and full audit logging (production, ~3-3.5h)
Build a tool that simulates a real side effect (e.g. "issue a refund" against a mock ledger), with argument validation, a human-approval step required before the simulated side effect executes, and full structured logging of every requested, validated, approved/rejected, and executed call. Deliverable: a running service, a demonstration of an unapproved call being correctly blocked, and a short incident-response note describing what you would check first if the tool started executing unapproved actions. Skills exercised: the full production guardrail picture this page covers, tied together.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate tool-calling mastery (each also reaches into a sibling skill):

1. **Multi-tool research assistant with parallel lookups and graceful degradation** -- An assistant with 3-4 independent read-only tools (search, a calculator, a unit converter, a simple knowledge lookup) that issues parallel tool calls where genuinely independent, handles partial failures by returning all results rather than failing the batch, and logs the full tool-call transcript per conversation. Demonstrates: parallel-call orchestration and error-handling design -- directly relevant to the **Agent Fundamentals** and **Structured Outputs** skills.

2. **Guardrailed action agent with an approval workflow** -- An agent scoped to a small set of simulated internal-style tools (ticket lookup, status update, notification send), with strict argument validation, a human-approval queue specifically for any state-changing tool call, and full audit logging distinguishing read-only from side-effecting tool calls in its logs. Demonstrates: the read-vs-write tool distinction and the production guardrail architecture from Security and Production Usage -- bridges directly into the **Guardrails** and **MCP** skills.

3. **Tool-selection accuracy benchmark harness** -- A small tool that takes any tool schema plus a labeled evaluation set of prompts, runs them against a chosen model, and reports tool-selection accuracy, hallucinated-tool-name rate, and argument-validity rate, broken out per tool -- reusable across projects and model versions. Demonstrates: the evaluation discipline this page insists tool-calling accuracy requires, rather than assuming it from a general impression -- connects directly to the **Evaluation** skill.

Each project should include: explicit validation and timeout handling on every tool call, a documented rationale for which tools were scoped into each task type and why, a measured tool-selection accuracy number across a representative prompt set (not just anecdotal examples), and a written failure-mode analysis (what happens on a hallucinated tool name, a malformed argument, a tool timeout, and a partial parallel-batch failure) -- the validation and error-handling discipline is what distinguishes a fundamentals-level demo from a portfolio-grade project.
`,

  "case-studies": `
### The shift from free-text tool parsing to native structured function calling
Early LLM tool-use implementations commonly had the model emit a specific text format for a requested action, which developers then parsed with string matching or regexes -- a fragile approach prone to malformed or unparseable output whenever the model's phrasing drifted even slightly. The maturation of native, schema-validated function-calling APIs from major providers materially improved reliability, because the model's tool-call intent became a structured, schema-checked object rather than free text requiring bespoke parsing. Lesson: much of what made tool use "actually work" in production was unglamorous reliability engineering at the protocol layer, not a breakthrough in reasoning ability -- exactly the point **Agent Fundamentals**' History section makes about agents generally, now specific to this one mechanism.

### Tool-set overload degrading production accuracy
Several teams building assistants with dozens of available integrations found that flatly exposing every registered tool on every request measurably increased wrong-tool and hallucinated-tool rates compared to scoping the exposed tool set per task type -- the fix was not a bigger or smarter model, but disciplined per-request tool scoping, treating "which tools are relevant right now" as an explicit application-layer decision rather than leaving the model to sort through an unfiltered, ever-growing list. Lesson: tool-selection accuracy is at least as much an application-design problem (how many tools, how clearly described, how tightly scoped per request) as it is a raw model-capability problem.

### Coding agents and ground-truth tool feedback
Autonomous coding agents that use a tool providing genuine ground-truth verification (running the real test suite and observing pass/fail) have shown materially more reliable outcomes than agents relying purely on free-text self-assessment of whether generated code "should" work. Lesson: not all tools are equally valuable to expose -- a tool that returns objective, verifiable ground truth is disproportionately valuable compared to a tool that only returns more information to reason about, and this shapes which tools are worth the schema-design investment described in Intermediate Concepts.

### Tool-output prompt injection as a realized, not merely theoretical, risk
Systems exposing a web-fetch or browsing tool to an agent have concretely demonstrated the tool-output-as-untrusted-content risk described in Security: fetched page content containing adversarial instructions has, in documented cases across the industry, led agents to take unintended further actions when the fetched content was not clearly treated as untrusted data. Lesson: the defense of treating tool outputs as data, never as instructions, is not a theoretical best practice -- it addresses a failure mode that has actually occurred in production systems, and should be designed in from the start rather than retrofitted after an incident.
`,

  comparisons: `
| Dimension | Free-text tool-use parsing (legacy) | Native structured tool/function calling | Structured Outputs (constrained decoding, no execution) | MCP (Model Context Protocol) |
|---|---|---|---|---|
| What is guaranteed | Nothing -- output is free text, hand-parsed | Provider-varying schema conformance on the emitted call | Strong schema conformance on the emitted content itself | Standardized tool description/discovery across frameworks, not model behavior itself |
| Execution model | Developer-defined, entirely ad hoc | Model requests, application validates and executes | No execution semantics -- purely about output shape | Wraps native tool calling; adds a vendor-neutral transport/discovery layer |
| Primary failure mode | Unparseable or malformed text | Hallucinated tool name, malformed/wrong arguments (see Advanced Concepts) | Malformed shape (rare with strong constrained decoding); semantic correctness still not guaranteed | Same underlying model-decision failure modes as native tool calling, plus integration/version-compatibility concerns |
| Best for | Historical interest / constrained legacy systems only | The default mechanism for any LLM system needing to call external functions today | Getting reliably shaped output that is not itself an executable action (e.g. a structured summary) | Exposing a tool once for consumption by multiple frameworks/providers without reinventing the description format each time |
| Where covered on this platform | This page's History section, for context | This page, in full depth | **Structured Outputs** | **MCP** |

**How seniors choose**: use native tool/function calling as the default mechanism whenever the model needs to trigger a real external action; reach for **Structured Outputs** techniques when you need reliably shaped output that itself is the deliverable (not an action to execute); adopt **MCP** when you need the same tool to be consumed by multiple frameworks or providers without maintaining a separate integration per framework; treat free-text parsing as a legacy pattern to migrate away from, not a viable current default.
`,

  "related-technologies": `
- **Agent Fundamentals** -- the broader perceive-plan-act-observe loop this page's mechanism sits inside; read this first if you have not already, since it frames why tool use matters at all.
- **MCP (Model Context Protocol)** -- the vendor-neutral standard for describing and exposing tools (and broader context) across frameworks and providers, built on top of the same fundamental request-execute-return protocol covered here.
- **Guardrails** -- the safety/policy layer that decides whether a validated tool call should actually be permitted to execute, especially for side-effecting tools.
- **Structured Outputs** -- closely related constrained-decoding techniques for getting reliably schema-shaped output from a model; tool-call arguments are one application of this broader capability.
- **LLM Fundamentals** -- the model doing the deciding at every tool-calling turn; tokens, context windows, and sampling all apply directly to how tool schemas and results consume context.
- **LangChain** -- a widely used framework that wraps native tool calling with higher-level abstractions (tool decorators, automatic schema generation from typed functions, built-in agent loops).
- **OpenAI Agents SDK** -- a provider-native toolkit implementing tool calling and the surrounding agent loop against OpenAI's models specifically.
- **RAG** -- retrieval is one of the most common tools an agent is given; understanding tool calling helps you design a retrieval tool's schema and error handling well.
- **Evaluation** -- the general methodology for measuring tool-selection accuracy rigorously, rather than by impression.

On this platform, the natural path from here: **Agent Fundamentals** -> **Tool Calling** (this page) -> **Structured Outputs** (the closely related output-reliability sibling) -> **Guardrails** (the safety layer around execution) -> **MCP** (vendor-neutral standardization) -> a specific framework (**LangChain**, **OpenAI Agents SDK**) that implements all of this concretely.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 -- check each provider's current documentation and recent release notes for anything more current, since tool-calling accuracy and API surface are among the faster-moving details on this platform.

- Native, structured tool/function calling is now a standard, broadly supported feature across major model provider APIs, and constrained-decoding-backed schema enforcement (guaranteeing syntactically valid, schema-conformant arguments) has become increasingly common, though the strength of that guarantee still varies by provider and is worth verifying rather than assuming uniform behavior.
- Parallel tool calling (a single model turn requesting multiple calls) is supported by multiple major providers, though exact response shapes and any per-request limits on the number of simultaneous calls differ and have changed across versions -- check current provider docs before hard-coding assumptions.
- The **Model Context Protocol (MCP)** has seen substantial adoption momentum as a vendor-neutral way to describe and expose tools, aiming to reduce framework-specific integration work for adding a new tool capability -- check current adoption breadth and provider-side support before assuming universal compatibility across every framework you might use.
- Tool-selection accuracy continues to be an actively benchmarked and marketed capability, and relative standing between providers and model generations shifts with nearly every release -- treat any specific accuracy comparison, including anything implied on this page, as a snapshot to re-verify against current, your-own-tool-set evaluation rather than a permanent ranking.
- Reasoning-oriented models that spend additional inference-time computation before responding (see **LLM Fundamentals**' Latest Updates) appear, in some observed cases, to improve tool-selection accuracy on more ambiguous or larger tool sets, though this interaction is still being characterized across providers and task types and should not be assumed uniformly.

Given how quickly provider-specific tool-calling behavior and benchmark claims change, treat any specific number or ranking you read here or elsewhere as a snapshot to re-verify against current documentation and your own evaluation, not a permanent fact.
`,

  "future-roadmap": `
Where the tool-calling picture is heading, and what is worth betting career time on:

1. **The core protocol (schema in, structured call out, validate-then-execute, result fed back) is a durable idea** that will remain true regardless of which specific provider or framework is current -- understanding this deeply, at the level this page teaches it, is a better long-term investment than memorizing any one provider's current request/response shape.
2. **Standardization efforts (MCP and likely successors or competitors) are likely to keep reducing the integration cost of exposing a new tool across multiple frameworks**, shifting more engineering effort toward tool design, schema quality, and guardrails, and away from bespoke per-framework integration glue.
3. **The industry's practical center of gravity is visibly shifting toward tighter validation, explicit approval gates, and defense-in-depth around tool execution**, following documented incidents of both tool misuse and tool-output prompt injection -- betting on skills in validation design, permission modeling, and evaluation of tool-selection accuracy is likely to age better than betting on any single provider's current tool-calling API surface.
4. **Tool-selection accuracy is likely to keep improving generationally, but is unlikely to reach a point where application-level validation becomes optional** -- even a highly accurate model remains a probabilistic system, and the trust-boundary architecture this page describes (validate, never blindly execute) is a durable engineering discipline, not a stopgap for current model limitations.
5. **Structured-output and tool-calling techniques are converging** (constrained decoding increasingly underlies both), and the distinction between "getting reliably shaped output" and "requesting a real action" is likely to remain the more important conceptual line to track than the specific mechanism used to guarantee shape.

For your career: the highest-leverage, most durable skill from this page is the validate-then-execute trust-boundary discipline and the honest measurement of tool-selection accuracy against your own tool set -- that discipline stays valuable even as the specific provider APIs and standards underneath it change.
`,

  "cheat-sheet": `
~~~text
# --- Core protocol ---
Tool calling = model emits a STRUCTURED REQUEST (name + JSON args);
application code validates, executes, and feeds the REAL result back.
The model NEVER executes anything -- it only ever requests.

# --- Tool schema, 3 parts ---
name        : short, unambiguous identifier
description : WHAT it does + WHEN to use it + WHEN NOT to
parameters  : JSON Schema (types, required fields, enums)

# --- The cycle ---
1. Send: conversation + tool schema(s)
2. Model returns: text, OR one/more structured tool_call requests
3. App validates: name in allowlist? args match schema?
4. App executes (only if valid) -- own timeout, own error handling
5. App sends result back, tagged by tool_call_id
6. Repeat until model returns final text (or a hard turn limit hits)

# --- The 3 failure categories (different fixes!) ---
Hallucinated tool name : name not in what you offered
                          -> allowlist check before execution
Malformed arguments     : invalid JSON / fails schema
                          -> validate in app code regardless of provider
Wrong tool / wrong args : schema-VALID but semantically wrong
                          -> better descriptions, examples, or a
                             verification/reflection step

# --- Sequential vs parallel ---
Sequential : one call per turn, simplest error handling
Parallel   : multiple calls in ONE turn -- lower latency, but must
             tag results by tool_call_id and handle PARTIAL failure
             (return ALL results, never fail the whole batch)

# --- Never do this ---
Execute model args directly into SQL/shell/file paths (injection)
Trust provider schema enforcement as your ONLY validation
Expose every registered tool on every request (hurts accuracy + cost)
Let a tool exception crash the whole conversation loop
Fail a parallel batch entirely because one call errored

# --- Production musts ---
Explicit per-task-type tool allowlist (never "all registered tools")
Argument validation in app code, independent of provider enforcement
Per-tool timeout + exception handling, own retry/backoff
Side-effecting tools -> explicit permission / human-approval gate
Full transcript logged: name, args, validation outcome, result/error
Re-evaluate tool-selection accuracy after ANY model version change

# --- Sibling skills map ---
Agent Fundamentals -> the broader loop this mechanism sits inside
MCP                -> vendor-neutral standard for exposing tools
Guardrails          -> the approval/policy layer around execution
Structured Outputs  -> the closely related output-shape-reliability sibling
LLM Fundamentals    -> the model making the decision at each call
LangChain / OpenAI Agents SDK -> frameworks implementing this concretely
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is tool calling, mechanically? | The model emits a structured request naming a function and arguments; application code validates and executes it, then feeds the real result back as new context |
| Does the model ever execute a tool itself? | No -- it only ever requests. Application code decides whether and how to actually execute |
| What are the three parts of a tool schema? | Name, description (including when to use/not use it), and a JSON Schema for parameters |
| What is a hallucinated tool call? | The model requests a tool name that was never offered in the schema list -- must be caught by an allowlist check before execution |
| What is a malformed tool call? | Arguments that are invalid JSON or fail the declared schema -- caught by application-side validation |
| What is a wrong tool call (the third failure category)? | Schema-valid but semantically incorrect -- the right shape, wrong tool or wrong argument values; schema validation cannot catch this |
| Why can't schema validation catch every tool-calling error? | It only checks shape (types, required fields, enums), not whether the chosen tool or argument values are actually correct for the user's intent |
| What is the difference between sequential and parallel tool calls? | Sequential: one call per turn; parallel: the model requests multiple calls in one turn, reducing latency but requiring per-call result tagging and partial-failure handling |
| How should a partially-failed parallel batch be handled? | Return every result, including the failure, tagged by tool_call_id -- never fail the whole batch because one call errored |
| Why must application code validate tool calls even if the provider claims schema enforcement? | Provider-side enforcement strength and behavior vary across providers and versions, and side-effecting tools warrant defense in depth regardless |
| What should gate a side-effecting tool (writes, sends, deletions)? | An explicit permission check or human-approval step, distinct from the validation applied to read-only tools |
| Why is exposing every registered tool on every request a bad default? | It costs tokens on every request and, on many models, measurably increases wrong-tool or hallucinated-tool rates as ambiguity grows |
| What does MCP standardize that raw tool calling does not? | A vendor-neutral way to describe and expose tools/context so one tool built once can be consumed across different frameworks and providers |
| What is the single most important security rule for tool calling? | Never treat "the model requested this" as equivalent to "this should happen" -- validate and gate every consequential action |
| What should happen when a tool call fails? | The failure should be caught and fed back to the model as a structured error observation, never silently swallowed or allowed to crash the loop |
`,

  mcqs: `
**1. What does the model actually do in a tool-calling turn?**

A) It executes the function directly inside its own runtime  B) It emits a structured request naming a function and arguments; application code decides whether to execute it  C) It writes the function's code from scratch  D) It queries the tool's database directly

**Answer: B** -- the model only ever requests; the execution decision and the execution itself belong entirely to application code outside the model.

**2. A model requests a tool named delete_all_records that was never included in the tools offered to it. What is this, and what should the application do?**

A) A malformed argument error -- retry with corrected arguments  B) A hallucinated tool call -- reject it via an allowlist check before any execution, and report the error back  C) Normal behavior -- execute it since the model is usually right  D) A parallel tool call -- execute it alongside the intended one

**Answer: B** -- application code must validate the requested tool name against the exact set of tools it offered, and never execute a name that fails that check.

**3. Why can JSON Schema validation not catch every tool-calling error?**

A) JSON Schema cannot express types at all  B) It only validates argument shape (types, required fields, enum membership), not whether the chosen tool or argument values are semantically correct for the user's actual intent  C) Providers do not support JSON Schema  D) Schema validation only works for text output, not tool calls

**Answer: B** -- a schema-valid call can still be the wrong tool entirely, or the right tool with plausible but incorrect argument values; this requires better descriptions, examples, or a verification step, not schema fixes.

**4. In a parallel tool-call batch where one of three calls times out, what is the correct handling?**

A) Fail the entire batch and report a single generic error  B) Silently drop the failed call and proceed as if only two calls were made  C) Return all three results, including the timeout, each tagged by its tool_call_id, and let the model's next turn reason over the mix  D) Retry all three calls indefinitely until all succeed

**Answer: C** -- partial failure in a parallel batch should be surfaced transparently, not hidden or allowed to fail unrelated successful calls.

**5. Why is it insufficient to rely solely on a provider's claimed schema enforcement for tool-call arguments?**

A) Providers never validate anything  B) Enforcement strength and behavior vary across providers and versions, and side-effecting tools warrant independent, defense-in-depth validation regardless of provider guarantees  C) JSON Schema is deprecated  D) Only human reviewers can validate JSON

**Answer: B** -- application-level validation is a non-negotiable, independent layer, especially for tools with real side effects.

**6. What does the Model Context Protocol (MCP) add on top of native tool/function calling?**

A) A faster model inference engine  B) A vendor-neutral standard for describing and exposing tools/context so a tool built once can be consumed by different frameworks and providers  C) A replacement for JSON Schema  D) A guarantee that the model will always pick the correct tool

**Answer: B** -- MCP standardizes description and discovery of tools across frameworks; it does not itself guarantee model tool-selection accuracy, which remains a model-behavior property.
`,

  "revision-notes": `
**What tool calling is, in five lines:** Tool calling (function calling) is the mechanism by which a model emits a structured request -- a function name plus JSON arguments -- rather than free text, so that application code outside the model can validate and execute the real action and feed the real result back as new context. The model never executes anything itself; it only ever requests, and that gap between request and execution is the central trust boundary of the entire mechanism. A tool schema has three parts: a name, a description (stating both when to use it and when not to), and a JSON Schema for its parameters.

**The three failure categories, in four lines:** A hallucinated tool call names a tool that was never actually offered, and must be caught by an exact allowlist check before any execution. A malformed tool call has invalid JSON or fails the declared argument schema, and must be caught by application-side validation regardless of provider claims. A wrong tool call is schema-valid but semantically incorrect -- the right shape, wrong tool or wrong values -- and schema validation cannot catch this category at all; it requires better descriptions, a tighter tool set, or a verification step.

**Sequential vs parallel, in three lines:** Sequential tool calling issues one call per turn with the simplest error handling; parallel tool calling lets the model request multiple calls in a single turn, reducing wall-clock latency for independent lookups at the cost of needing to correctly tag every result by its tool_call_id and to handle partial batch failure by returning every result -- successes and failures alike -- rather than failing the whole batch.

**Security and production discipline, in four lines:** The model's request must never be treated as equivalent to authorization to act -- every tool call needs application-level argument validation independent of provider-side enforcement, and every side-effecting tool needs an explicit permission or human-approval gate beyond what read-only tools require. Tool results must be treated as untrusted data, not instructions, since a manipulated observation can otherwise lead to an unintended further tool call. Tool sets should be scoped per task rather than maximized globally, both for accuracy and cost, and every tool call should be logged in full for later debugging.

**Where this fits and where to go next, in three lines:** Tool calling is the mechanical foundation **Agent Fundamentals**' perceive-plan-act-observe loop depends on for its "act" step, the layer **MCP** standardizes across vendors, and the safety layer **Guardrails** wraps with policy enforcement. **Structured Outputs** is the closely related sibling for reliably shaped output generally, and **LangChain** and the **OpenAI Agents SDK** are the frameworks that implement all of this concretely on top of the raw provider protocol described here.
`,

  "learning-roadmap": `
A realistic path through tool calling and into the sibling skills (adjust pace to your background):

**Week 1 -- Prerequisites check.** If you have not already, work through **LLM Fundamentals** and **Agent Fundamentals** first -- this page assumes both, treating tool calling as the deep dive on the "act" step of the loop **Agent Fundamentals** introduces. Milestone: you can explain why the model never executes anything itself, only requests.

**Week 2 -- The protocol and a minimal working loop.** Beginner Concepts; implement Lab 1 (from-scratch validated tool dispatcher against a real API). Milestone: a working script with name-allowlist validation, argument schema validation, timeouts, and structured error feedback, all implemented by hand.

**Week 3 -- Schema design and tool-selection accuracy.** Intermediate and Advanced Concepts (the three failure categories, provider-specific quirks); run Lab 2 (tool-selection accuracy evaluation across schema variants). Milestone: you can measurably improve tool-selection accuracy by improving a tool's description and schema, and you can prove it with numbers.

**Week 4 -- Parallel calls and production guardrails.** Intermediate Concepts' parallel-calls section through Production Usage and Security; run Lab 3 (parallel batch with bounded concurrency) and Lab 4 (guardrailed side-effecting tool with an approval gate). Milestone: a working system with parallel-call partial-failure handling and a real human-approval gate on a simulated side-effecting tool.

**Week 5 -- Failure modes, debugging, and monitoring.** Anti-Patterns, Common Mistakes, Common Errors, Debugging, Monitoring sections. Milestone: given a synthetic failed tool-call transcript, you can correctly classify which of the three failure categories it represents and propose the specific fix.

**Week 6 onward -- Branch into the sibling skills based on your immediate need**: go to **Structured Outputs** next if your priority is reliable output shape beyond tool arguments specifically; go to **Guardrails** if your priority is the policy/approval layer around consequential tool calls; go to **MCP** if you need vendor-neutral tool exposure across multiple frameworks; go to **LangChain** or the **OpenAI Agents SDK** once you know which framework fits your architecture and want to see these mechanics wrapped in higher-level abstractions. Most engineers should read **Structured Outputs** or **Guardrails** immediately after this page, depending on whether output reliability or execution safety is the more pressing gap in their current system.
`,

  "official-docs": `
- Provider tool/function-calling documentation (OpenAI, Anthropic, and other model providers) -- the ground truth for current schema conventions, parallel-call support, tool_choice/forcing options, and any provider-specific quirks; these change frequently, so check live docs rather than a remembered schema shape.
- The JSON Schema specification -- the authoritative reference for the schema syntax used to describe tool parameters (types, required fields, enums, nested objects, constraints).
- The **Model Context Protocol (MCP)** specification and reference documentation -- the authoritative source for the current vendor-neutral tool-description and discovery protocol, if you are building or consuming MCP-compatible tools.
- Framework documentation for **LangChain** and the **OpenAI Agents SDK** -- each sibling skill on this platform links to and builds on the respective framework's official docs for implementation-level tool-calling detail beyond this page's provider-level scope.
- Provider model release notes -- typically describe changes to tool-calling behavior, schema-enforcement strength, and parallel-call support relevant to reliability engineering at this layer.
`,

  books: `
- **Designing Machine Learning Systems** -- Chip Huyen. Not tool-calling-specific, but the production-systems framing (validation, monitoring, reliability engineering around external dependencies) generalizes directly to the tool-execution-as-external-dependency discipline this page emphasizes.
- **Building Machine Learning Powered Applications** -- Emmanuel Ameisen. Useful for the general discipline of wrapping ML/LLM decision points in validated, monitored application code, which is exactly the pattern tool-calling dispatch requires.
- **API Design Patterns** -- JJ Geewax. Not LLM-specific, but directly relevant background for designing clear, unambiguous function/tool signatures -- the same signature-design discipline that produces a good tool schema.
- Provider and framework documentation-as-book resources (official guides published alongside **LangChain** and the **OpenAI Agents SDK**) -- treat these as the practical companion to this page's protocol-level grounding, and check them for the current API surface rather than relying on a fixed edition.

Given how fast provider tool-calling specifics move, prioritize the **Research Papers** and **Blogs** sections below, and provider/framework documentation, over any book for current specifics -- books are best here for durable API-design and systems-engineering foundations, not current provider-specific tool-calling behavior.
`,

  blogs: `
- **Provider engineering/research blogs** (OpenAI, Anthropic, Google DeepMind) -- high-signal source for how the organizations building tool-calling APIs describe their own design choices, schema-enforcement guarantees, and observed production lessons.
- **LangChain's official blog** -- practitioner-oriented posts on tool/schema design patterns, common tool-selection pitfalls, and framework updates that directly reflect the concepts covered on this page.
- **Simon Willison's blog** -- consistently clear, skeptical, practitioner-grounded writing on LLM tool use and prompt injection via tool outputs specifically; a good corrective against overclaiming tool-calling reliability.
- **Hugging Face blog** -- practitioner-oriented explainers on structured generation, constrained decoding, and tool-use evaluation.
- **Model Context Protocol project blog/announcements** -- the most direct source for how MCP's tool-description and discovery conventions are evolving.
`,

  "research-papers": `
Tool calling as an LLM-specific mechanism is a relatively young, fast-moving engineering practice more than a single settled research literature; here are the most directly relevant foundational papers, with honest framing of how established each claim is:

- **"Toolformer: Language Models Can Teach Themselves to Use Tools"** (Schick et al., 2023) -- foundational early work demonstrating that language models can learn when and how to invoke external tools, directly relevant to the tool-selection-accuracy problem this page treats as central.
- **"ReAct: Synergizing Reasoning and Acting in Language Models"** (Yao et al., 2022) -- foundational for the interleaved reasoning-and-acting pattern covered in depth in **Agent Fundamentals**; directly relevant here because it is the pattern most production tool-calling loops implement at the orchestration level.
- **"Gorilla: Large Language Model Connected with Massive APIs"** (Patil et al., 2023) -- directly relevant work specifically studying tool/API-selection accuracy at scale (many available APIs), bearing directly on the "too many tools degrades selection accuracy" pattern discussed in Performance and Case Studies.
- Structured-generation and constrained-decoding papers underlying schema-conformant output guarantees -- foundational for understanding why some providers can guarantee syntactically valid tool-call arguments; see the **Structured Outputs** skill for the fuller treatment of this literature.

This area moves fast enough that the most current, most rigorously evaluated papers on tool-selection accuracy and multi-tool benchmarks are best found via a live search of recent proceedings (NeurIPS, ICML, ACL) rather than a fixed list -- treat the papers above as the durable foundational layer, not the current frontier.
`,

  videos: `
- Conference talks and technical presentations from major model providers and framework maintainers (OpenAI, Anthropic, LangChain) walking through tool-calling design decisions, schema-enforcement guarantees, and real production lessons -- high-signal for connecting this page's concepts to concrete implementation choices.
- Recorded talks on the ReAct and Toolformer papers referenced above -- useful for hearing the original authors' framing of tool-selection and tool-use learning directly.
- Practitioner walkthroughs of building a tool-calling agent from scratch against a real provider API (searching current video platforms for recent, well-regarded examples is more useful than any fixed recommendation here, given how quickly provider API surfaces change).
- Talks specifically on prompt injection via tool outputs and agent security -- useful for grounding the Security section's concerns in concrete, demonstrated attack patterns rather than abstract risk.
`,

  "github-repos": `
- **LangChain** repository -- widely used framework with extensive tool/function-calling abstractions, including automatic schema generation from typed function signatures; good for seeing real dispatch and validation code end to end.
- The **OpenAI Agents SDK** repository -- a provider-native toolkit implementing tool calling and the surrounding agent loop; useful for seeing tool-calling conventions from a major model provider directly.
- **Model Context Protocol (MCP)** reference implementation repositories -- useful for seeing the current vendor-neutral tool-description and discovery standard implemented concretely.
- JSON Schema validator library repositories (widely used, language-appropriate implementations) -- useful for implementing the application-side argument validation this page insists on, rather than hand-rolling schema checks.
- Well-regarded from-scratch tool-calling example repositories (search for current, actively maintained examples) -- valuable specifically because they show the validate-then-execute mechanics without a framework's abstractions hiding them, matching this page's own from-scratch worked example.
- Prompt-injection and LLM-security research/demo repositories -- useful for seeing concrete, reproducible examples of the tool-output-as-untrusted-data risk described in Security.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Protocol fluency*: implement the validated tool dispatcher from Coding Questions #1 from memory, then extend it with the parallel-batch dispatcher from Coding Questions #2 without looking at the reference implementation.
2. *Schema design*: given a vague, one-line tool description, rewrite it to state clearly when to use and not use the tool, add appropriate enums and required fields, then measure tool-selection accuracy before and after on a small evaluation set of your own construction.
3. *Failure classification*: given ten synthetic tool-call transcripts (a mix of hallucinated names, malformed arguments, and schema-valid-but-wrong calls), classify each into one of the three failure categories from Advanced Concepts and propose the specific fix for each.
4. *Parallel-batch design*: given a task requiring three independent lookups, design the parallel dispatch and partial-failure-handling logic on paper before writing code, including exactly what gets fed back to the model when one of the three calls fails.
5. *Security review*: given a hypothetical tool set including both a broad read tool and an external-send tool, write out the specific risk (data exfiltration path) and the specific guardrail design that mitigates it, before implementing anything.
6. *Provider-quirk investigation*: pick two current LLM provider APIs, read their tool-calling documentation side by side, and write a short comparison of their schema-enforcement guarantees, parallel-call support, and tool_choice/forcing options -- verify against live docs rather than assuming this page's snapshot is still current.

External sets: provider quickstart tutorials (OpenAI, Anthropic) for tool/function calling as hands-on practice once the provider-agnostic concepts here are solid; any current tool-use or API-calling benchmark suite's task set as a way to see tool-selection accuracy measured in practice.
`,

  "architecture-diagram": `
The reference architecture for a production tool-calling feature -- the shape the sibling skills each go deep on one part of:

~~~mermaid
flowchart TB
    Client["Client application"] --> App["Application layer\n(task framing, per-task tool scoping)"]
    App --> Registry["Tool registry\n(real functions + generated schemas)"]
    App --> LLMCall["LLM call: conversation +\nscoped tool schemas"]
    LLMCall -->|tool_call requested| Validate["Validator: name allowlist,\nargument schema check"]
    Validate -->|invalid| ErrorObs["Structured error observation"]
    Validate -->|valid| Kind{"Side-effecting tool?"}
    Kind -->|yes| Approval["Guardrail / human-approval gate"]
    Kind -->|no| Executor["Executor: real function call,\ntimeout + exception handling"]
    Approval -->|approved| Executor
    Approval -->|rejected| ErrorObs
    Executor --> Formatter["Result formatter\n(tagged by tool_call_id)"]
    ErrorObs --> Formatter
    Formatter --> LLMCall
    LLMCall -->|final text| App
    App --> Client
    subgraph Support["Supporting systems"]
        Monitor["Hallucination rate, invalid-arg rate,\nper-tool latency/error monitoring"]
        Eval["Tool-selection accuracy evaluation\n(representative, versioned task set)"]
    end
    App --> Support
~~~

Every labeled box in this diagram corresponds to a sibling skill on this platform: the per-task tool scoping and the "does this need an agent" framing above it -> **Agent Fundamentals**; the validator and permission gate -> **Guardrails**; the schema itself and its enforcement guarantees -> **Structured Outputs**; the vendor-neutral description/discovery of the tool registry -> **MCP**; the concrete orchestrator implementation -> **LangChain** or the **OpenAI Agents SDK**; the evaluation loop -> **Evaluation**.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Tool Calling))
    The protocol
      Schema in: name, description, JSON Schema params
      Structured call out: name + arguments
      App validates, then executes
      Real result fed back as new context
      Model NEVER executes -- only requests
    Failure categories
      Hallucinated tool name
        Allowlist check before execution
      Malformed arguments
        App-side schema validation
      Wrong tool / wrong values
        Not caught by schema -- needs better descriptions
    Call patterns
      Sequential
        One call per turn
      Parallel
        Multiple calls in one turn
        Tag results by tool_call_id
        Partial-failure handling
      Forced tool choice
        Skip model's own decide-to-call step
    Security
      Model request is not authorization
      Tool outputs are untrusted data
      Argument injection into downstream systems
      Privilege escalation via tool chaining
      Resource-abuse via call volume
    Production discipline
      Per-task tool scoping
      App-side validation independent of provider
      Per-tool timeouts and error handling
      Human-approval gate for side-effecting tools
      Full transcript logging
    Sibling skills
      Agent Fundamentals
      MCP
      Guardrails
      Structured Outputs
      LLM Fundamentals
      LangChain
      OpenAI Agents SDK
~~~
`,
};

export default toolCalling;
