import type { SkillContent } from "../types";

const toolCalling: SkillContent = {
  overview: `
Tool calling (also called function calling) is the specific, structured MECHANISM by which an LLM invokes external functions, APIs, or capabilities beyond its own text generation — the concrete implementation underlying the "tool use" concept introduced at the very start of this category in **Agent Fundamentals**, and the shared foundation every framework covered so far (**LangChain**'s \`@tool\` decorator, **CrewAI**'s tool integration, the **OpenAI Agents SDK**'s \`@function_tool\`, **AutoGen**'s code-execution-as-tool pattern) builds directly on top of. This skill covers the mechanism ITSELF, independent of any specific framework: how a model is given a structured description of available tools, how it decides to invoke one, and how the invocation's structured output is turned into an actual function call.

Modern LLM providers expose tool calling as a NATIVE API capability: rather than asking a model to describe a desired tool call in free-form text (and then writing fragile, custom parsing logic to extract the intended function/arguments — an approach directly flagged as an anti-pattern in **Agent Fundamentals** and the **LangChain** skill), a model is given a structured, JSON-Schema-like description of each available tool (its name, purpose, and typed parameters), and the model's own API response includes a structured, machine-parseable representation of its intended tool call (which function, with which arguments) when it decides one is needed — directly connecting to the **Prompt Engineering** skill's own structured-output treatment.

Key characteristics: **tool schemas**, structured, typed descriptions of a tool's name, purpose, and parameters (directly connecting to **Prompt Engineering**'s structured-output concepts); **native function calling**, the model provider's own API support for producing structured tool-invocation output, rather than requiring custom text parsing; **parallel tool calls**, a model requesting multiple, independent tool invocations within a single turn; **tool selection accuracy**, the genuine reliability challenge of a model correctly choosing the RIGHT tool among several available options; and **the tool-execution loop**, the surrounding application logic that actually executes a requested tool call and feeds its result back to the model.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2023 | **OpenAI introduces native "function calling"** as an API feature, letting a model produce structured, machine-parseable tool-invocation output directly, rather than requiring free-form text parsing — a foundational milestone directly enabling the reliable, structured tool-use pattern covered throughout **Agent Fundamentals** and every subsequent framework skill |
| 2023 | Other major LLM providers rapidly introduce their own equivalent native function/tool-calling API support, establishing structured tool calling as a STANDARD, expected model capability rather than a single-provider novelty |
| 2023–2024 | **Parallel tool calling** (a model requesting multiple independent tool invocations within a single turn/response) is introduced, directly improving efficiency for tasks requiring several independent pieces of information gathered simultaneously |
| 2024 | Tool-calling reliability and tool-selection accuracy become an active area of both provider-side model improvement and prompt-engineering-focused practical technique (clearer tool descriptions, directly connecting to the **LangChain** skill's own tool-selection-accuracy debugging guidance) |
| 2024–2025 | **The Model Context Protocol (MCP)**, covered in the platform's next and final skill in this category, emerges specifically to standardize tool DISCOVERY and integration across different tools/servers, directly building on native tool calling as its underlying invocation mechanism |

Tool calling's history directly reflects a foundational shift from fragile, ad-hoc, text-parsing-based tool use toward a genuinely reliable, provider-native, structured mechanism — this shift is precisely what made the broader agentic-AI ecosystem covered throughout this entire category (every framework, from **LangChain** through **AutoGen**) practically viable at production scale.
`,

  "why-it-exists": `
Tool calling exists because letting an agent invoke external functions/APIs (the "act" step of **Agent Fundamentals**' plan-act-observe loop) requires the surrounding application code to reliably know EXACTLY which function the model intends to call and with WHAT specific arguments — and asking a model to express this intent in unconstrained, free-form natural-language text (e.g., "I will now search for the weather in Tokyo") and then parsing this text with custom, brittle logic is a genuinely UNRELIABLE approach, directly flagged as an anti-pattern in **Agent Fundamentals** and the **LangChain** skill, since it depends on the model consistently, exactly following a specific expected phrasing.

Native tool calling solves this by having the model provider's own API directly support STRUCTURED tool-invocation output — the model is given a formal, typed schema describing each available tool, and its response includes a structured (not free-form text) representation of its intended call when a tool invocation is warranted — directly connecting to the **Prompt Engineering** skill's own structured-output/JSON-mode treatment, providing a considerably more reliable mechanism for expressing and parsing an agent's intended actions.
`,

  "problem-it-solves": `
Tool calling addresses the **"how does an LLM reliably express its intent to invoke a specific external function with specific arguments, in a way the surrounding application code can parse and act on with high confidence"** challenge.

Concretely, tool-calling mechanics provide:

- **Structured tool schemas**, formally describing each available tool's name, purpose, and typed parameters, directly connecting to the **Prompt Engineering** skill's own structured-output treatment.
- **Native, provider-supported structured output**, letting a model express an intended tool call as machine-parseable data rather than free-form text requiring fragile, custom parsing.
- **Parallel tool calls**, letting a model request multiple, independent tool invocations within a single response when a task genuinely requires several pieces of information gathered simultaneously.
- **A reliable foundation for every higher-level agent framework's own tool abstractions**, directly underlying **LangChain**'s \`@tool\`, **CrewAI**'s tool integration, the **OpenAI Agents SDK**'s \`@function_tool\`, and **AutoGen**'s code-execution capability.

What tool calling does **not** solve, or solves only partially: reliable tool INVOCATION mechanics don't guarantee reliable tool SELECTION — a model can still choose the WRONG tool among several available options, or supply subtly incorrect arguments, even when the invocation itself is structurally well-formed; and tool calling doesn't address tool DISCOVERY across different systems/servers at scale, a genuinely distinct challenge directly addressed by the platform's next and final skill, **MCP**.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the native tool-calling mechanism: tool schemas, structured invocation output, and the surrounding execution loop.
2. Write a clear, well-specified tool schema/description that supports accurate model-driven tool selection.
3. Implement a tool-execution loop that correctly invokes a requested tool and feeds its result back to the model.
4. Explain parallel tool calling and when it provides a genuine efficiency benefit.
5. Diagnose and fix tool-selection accuracy issues, directly connecting to the LangChain skill's own debugging guidance.
6. Recognize tool-calling anti-patterns: fragile custom text parsing, and vague/overlapping tool descriptions.
7. Answer senior-level interview questions on tool-calling reliability and its security implications.
`,

  prerequisites: `
- **Required**: **Agent Fundamentals** (the tool-use concept this page concretely implements), **Prompt Engineering** (structured-output concepts underlying tool schemas), at least one framework skill (**LangChain**, **CrewAI**, or the **OpenAI Agents SDK**) for concrete, practical context.
- **Very helpful**: **Guardrails** (action-level constraints directly applicable to tool invocation).

Dependency chain: **Agent Fundamentals** → the framework skills → **Agent Memory** → **Planning** → **Reflection** → this page (Tool Calling) → **MCP**.
`,

  "beginner-concepts": `
### A basic tool schema

~~~json
{
  "name": "get_weather",
  "description": "Get the current weather for a specific location.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {"type": "string", "description": "City and country, e.g. 'Tokyo, Japan'"}
    },
    "required": ["location"]
  }
}
~~~

This structured, JSON-Schema-like description directly tells the model exactly what the tool does, what arguments it accepts, and their expected types — directly connecting to the **Prompt Engineering** skill's own structured-output treatment, and considerably more reliable than expecting the model to correctly interpret an unstructured, free-form description.

### A basic tool-execution loop

~~~python
def run_with_tools(user_message, model, tools_schema, tool_functions):
    response = model.generate(user_message, tools=tools_schema)
    if response.tool_calls:
        for call in response.tool_calls:
            result = tool_functions[call.name](**call.arguments)
            response = model.generate(
                context=response.context + [{"role": "tool", "content": result}],
                tools=tools_schema,
            )
    return response.final_output
~~~

This directly implements **Agent Fundamentals**' plan-act-observe loop concretely: the model's response signals its intended action (a \`tool_call\`), the surrounding application code EXECUTES it, and the result is fed back into the model's context for its next reasoning step.

### Why native tool calling beats free-form text parsing

~~~
# FRAGILE — asking the model to describe a tool call in
# free-form text, then parsing with custom regex/string logic:
# "I will call search(query='weather in Tokyo')" -- any
# deviation in phrasing breaks the parsing.
# RELIABLE — native tool calling: the model's API response
# directly includes a structured {"name": "search",
# "arguments": {"query": "weather in Tokyo"}} object.
~~~
`,

  "intermediate-concepts": `
### Parallel tool calls: multiple independent invocations in one turn

~~~python
response = model.generate(
    "What's the weather in Tokyo and the current price of AAPL stock?",
    tools=[weather_tool_schema, stock_price_tool_schema],
)
# response.tool_calls may contain BOTH:
# [{"name": "get_weather", "arguments": {"location": "Tokyo"}},
#  {"name": "get_stock_price", "arguments": {"ticker": "AAPL"}}]
~~~

When a task genuinely requires multiple, INDEPENDENT pieces of information, parallel tool calling lets the model request them within a single turn, directly connecting to **Agent Fundamentals**' own treatment of parallelizable sub-tasks — the surrounding application code can execute both calls concurrently rather than requiring separate, sequential round-trips.

### Writing tool descriptions for accurate selection

~~~
Directly connecting to the LangChain skill's own tool-
selection-accuracy debugging guidance: a tool's description
is the PRIMARY signal the model uses to decide WHETHER and
WHEN to invoke it -- vague or overlapping descriptions across
multiple available tools genuinely degrade selection accuracy.
A good description states: the tool's SPECIFIC purpose, WHEN
it should (and should NOT) be used relative to other available
tools, and ideally a brief example of an appropriate use case.
~~~

### Structured argument validation

~~~python
from pydantic import BaseModel, ValidationError

class WeatherArgs(BaseModel):
    location: str

def execute_tool_call(call, tool_functions, arg_schemas):
    try:
        validated_args = arg_schemas[call.name](**call.arguments)
    except ValidationError as e:
        return f"Invalid arguments: {e}"  # fed back to the
                                            # model as an
                                            # observation, letting
                                            # it retry correctly
    return tool_functions[call.name](**validated_args.dict())
~~~

Validating a model's supplied arguments against an explicit schema (directly connecting to **Prompt Engineering**'s structured-output treatment) BEFORE actually executing the underlying function catches malformed or unexpected arguments, feeding a clear error back as an observation rather than crashing or silently misbehaving.

### Error handling and observation feedback

~~~
When a tool call fails (an invalid argument, an external API
error, a genuine execution failure), the FAILURE ITSELF should
be fed back to the model as an observation -- directly the
plan-act-OBSERVE loop from Agent Fundamentals -- letting the
model potentially adjust its next action based on this
concrete feedback, rather than the application silently
failing or crashing the entire interaction.
~~~
`,

  "advanced-concepts": `
### Tool-calling reliability versus tool-selection accuracy: a genuine distinction

~~~
NATIVE tool calling solves the MECHANICAL reliability problem
-- ensuring the model's intended call is expressed as
structurally well-formed, parseable data. It does NOT
automatically solve the SEPARATE problem of the model
choosing the CORRECT tool among several available options,
or supplying semantically appropriate (not just
structurally valid) arguments -- this second problem is a
genuine PROMPT-ENGINEERING and tool-description-quality
challenge, directly connecting to the LangChain skill's own treatment.
~~~

### Tool calling and action-level security

~~~
Because tool calling is precisely the MECHANISM through which
an agent takes real-world ACTIONS (not just generates text),
it's exactly where Agent Fundamentals' and Guardrails' own
action-level constraint guidance concretely applies -- a
tool's invocation should be gated by appropriate autonomy-
level/human-in-the-loop checks BEFORE actual execution,
particularly for high-risk tools (irreversible actions,
financial transactions, data modifications).
~~~

### Handling many available tools: the tool-selection scaling challenge

~~~
As the NUMBER of available tools grows, a model's ability to
reliably select the correct one among MANY options can
degrade -- directly connecting to the LLM Fundamentals
skill's own attention/context treatment, since the model must
effectively attend to and distinguish among an increasingly
large set of tool descriptions. Mitigations include grouping
tools hierarchically (a coarse-grained "category" selection
followed by a fine-grained tool selection within that
category), directly foreshadowing the platform's next skill,
MCP, and its own tool-discovery treatment at scale.
~~~

### Tool calling as untrusted input surface: connecting to prompt injection

~~~
A tool's RESULT (not just the model's decision to call it)
becomes part of the agent's subsequent context -- directly
connecting to the LangChain skill's own prompt-injection
guidance, a malicious or compromised tool result could
attempt to manipulate the agent's subsequent reasoning,
motivating the same untrusted-input treatment applied to
any other external content incorporated into a prompt.
~~~
`,

  "internal-working": `
Tracing a complete tool-calling round-trip, including argument validation and error feedback:

~~~mermaid
sequenceDiagram
    participant App as Application
    participant Model as LLM
    participant Validator as Argument Validator
    participant Tool as Tool Function

    App->>Model: generate(message, tools=[schema])
    Model->>App: structured tool_call:\nname="get_weather",\narguments={"location": "Tokyo"}
    App->>Validator: validate arguments\nagainst schema
    Validator->>App: valid
    App->>Tool: execute get_weather(location="Tokyo")
    Tool->>App: result: "18°C, partly cloudy"
    App->>Model: generate(context + tool result\nas an observation)
    Model->>App: final_output (using the\ntool's result)
~~~

1. **The application sends the user's message alongside the available tool SCHEMAS**, directly analogous to providing a model with a menu of available actions.
2. **The model's structured response indicates its intended tool call** (which function, with which arguments) as machine-parseable data, not free-form text.
3. **The application VALIDATES the supplied arguments** against the tool's expected schema before execution, catching malformed input early.
4. **The tool is actually EXECUTED**, and its result is fed back into the model's context as an OBSERVATION**, directly completing one cycle of **Agent Fundamentals**' plan-act-observe loop, letting the model produce a final, informed response.

**Why this matters**: this trace demonstrates precisely how native tool calling's structured, provider-supported mechanism makes the ENTIRE plan-act-observe cycle reliably implementable in application code — every step (the model's intent, the argument validation, the actual execution, the feedback) operates on structured, machine-parseable data rather than fragile, free-form text requiring custom interpretation.
`,

  architecture: `
A senior AI engineer thinks about tool-calling architecture in terms of designing clear, well-differentiated tool schemas, validating arguments before execution, and applying action-level security scrutiny to every tool invocation, not merely trusting the model's output implicitly.

### Designing clear, well-differentiated tool schemas

~~~mermaid
flowchart TB
    ToolSet["A set of tools an\nagent needs access to"] --> Q{"Are descriptions\ngenuinely distinct and\nspecific about WHEN\neach applies?"}
    Q -->|Yes| GoodSelection["Reliable, accurate\ntool selection"]
    Q -->|"No -- vague or\noverlapping"| PoorSelection["Degraded selection\naccuracy -- rewrite\ndescriptions"]
~~~

### Applying action-level security to every tool invocation

A senior practitioner treats every tool invocation — not just ones initially flagged as "risky" — as a genuine candidate for guardrail review, directly reusing **Agent Fundamentals**' and **Guardrails**' own action-level constraint guidance, rather than assuming native tool calling's structural reliability implies safety.
`,

  "data-flow": `
Tracing a request through a tool-calling system with an action-level guardrail gate before execution:

~~~mermaid
sequenceDiagram
    participant User
    participant Model
    participant Guardrail as Action-Level Guardrail
    participant Human as Human Reviewer
    participant Tool

    User->>Model: "Please process a refund\nfor my last order"
    Model->>Guardrail: intended tool_call:\nprocess_refund(order_id, amount)
    Guardrail->>Guardrail: classify risk: HIGH\n(financial transaction,\nAgent Fundamentals' own\naction-level guidance)
    Guardrail->>Human: request explicit\napproval before execution
    Human->>Guardrail: approve
    Guardrail->>Tool: execute process_refund(...)
    Tool->>Model: result: "refund processed"
    Model->>User: final confirmation
~~~

The critical detail: the tool-calling MECHANISM itself (the model's structured intent to call \`process_refund\`) is reliable and well-formed, but this reliability does NOT itself determine whether the call should be EXECUTED autonomously — an explicit action-level guardrail gate, directly reusing **Agent Fundamentals**' and **Guardrails**' guidance, sits between the model's expressed intent and actual execution for genuinely high-risk tools.
`,

  "production-usage": `
### A representative production tool-calling implementation with validation and guardrails

~~~python
def execute_tool_call(call, tool_registry, risk_classifier, human_queue):
    tool = tool_registry[call.name]
    try:
        validated_args = tool.arg_schema(**call.arguments)
    except ValidationError as e:
        return f"Invalid arguments: {e}"

    risk = risk_classifier(call.name, validated_args)
    if risk == "high":
        return human_queue.submit_for_approval(call.name, validated_args)
    return tool.function(**validated_args.dict())
~~~

### Non-negotiables for production tool-calling systems

1. **Write clear, well-differentiated tool schemas/descriptions**, directly reusing **LangChain**'s own tool-selection-accuracy guidance.
2. **Validate all model-supplied arguments against an explicit schema** before actual execution.
3. **Apply action-level guardrails to every tool invocation**, gating genuinely high-risk tools with human-in-the-loop review.
4. **Feed tool errors/failures back to the model as observations**, directly completing the plan-act-observe loop rather than silently failing.
5. **Treat tool results as potentially untrusted input**, directly reusing the **LangChain** skill's own prompt-injection guidance.

### Common production patterns

- **Structured, native tool calling** with explicit JSON-Schema-based argument definitions.
- **Parallel tool calls** for tasks requiring multiple, independent pieces of information.
- **Risk-classified tool execution**, gating high-risk tools behind human-in-the-loop approval.
`,

  "industry-examples": `
- **Native function-calling API support across every major LLM provider**, the shared foundation underlying essentially every agent framework covered in this category.
- **Coding assistants using tool calling for file operations, code execution, and search** across a wide variety of IDE and CLI-based tools.
- **Customer-support and business-process agents** using tool calling to query internal systems, process transactions, and take real-world actions.
`,

  "best-practices": `
1. **Write clear, well-differentiated tool schemas/descriptions**, directly reusing **LangChain**'s own tool-selection-accuracy guidance.
2. **Validate all model-supplied arguments against an explicit schema** before execution.
3. **Apply action-level guardrails to every tool invocation**, not only ones assumed risky upfront.
4. **Feed tool errors/failures back to the model as observations**, completing the plan-act-observe loop.
5. **Treat tool results as potentially untrusted input**, directly reusing prompt-injection guidance.
6. **Use parallel tool calls for genuinely independent information needs**, improving efficiency.
7. **Group tools hierarchically as the available tool count grows**, mitigating tool-selection-accuracy degradation at scale.
`,

  "anti-patterns": `
### Relying on fragile, free-form text parsing instead of native tool calling

~~~
# WRONG — asking the model to describe a tool call in
# unstructured text and parsing it with custom regex/string logic
# RIGHT — use native, provider-supported structured tool
# calling, directly reusing this page's own reliability guidance
~~~

### Vague, overlapping tool descriptions

~~~
# WRONG — multiple tools with similar, generic descriptions
# that don't clearly convey when each should be used,
# directly analogous to CrewAI's own role-differentiation
# anti-pattern
# RIGHT — write clear, distinct, specific tool descriptions
~~~

### Executing tool calls without argument validation or guardrail review

~~~
# WRONG — directly executing whatever arguments the model
# supplies without validating them, and without any action-
# level risk review before execution
# RIGHT — validate arguments against an explicit schema,
# and apply action-level guardrails to every invocation
~~~

### Other production-grade anti-patterns

- **Silently failing or crashing on a tool error**, rather than feeding it back to the model as an observation.
- **Treating tool results as inherently trusted**, missing prompt-injection risk.
- **Not grouping tools hierarchically as the available tool count grows**, degrading selection accuracy at scale.
`,

  performance: `
### Rule zero: reliable tool INVOCATION and accurate tool SELECTION are distinct concerns requiring distinct engineering attention

Native tool calling solves the mechanical reliability problem; tool-description quality is a separate, ongoing prompt-engineering concern directly determining selection accuracy.

### The performance hierarchy (apply in order)

1. **Use native, provider-supported tool calling**, never fragile, free-form text parsing.
2. **Write clear, distinct tool descriptions**, directly improving selection accuracy without any additional model calls.
3. **Use parallel tool calls for genuinely independent information needs**, reducing sequential round-trip latency.
4. **Group tools hierarchically as the available count grows**, mitigating selection-accuracy degradation at scale.

### Micro-level facts worth knowing

- Each tool-call round-trip (the model's initial response, then a subsequent generation incorporating the tool's result) involves at least two full LLM calls, directly connecting to the **Inference** skill's own per-call cost/latency treatment — minimizing unnecessary tool calls (or batching genuinely independent ones via parallel calling) directly reduces this overhead.
- Argument validation (a lightweight, non-LLM operation) is considerably cheaper than an additional model call, and should be applied BEFORE execution as a first-line check.
`,

  scalability: `
Deliberate tool-calling design directly determines how confidently an organization can scale an agent's available capabilities without degrading selection reliability.

### How disciplined tool-calling design enables scaling

~~~mermaid
flowchart LR
    ClearSchemas["Clear, distinct tool\nschemas + hierarchical\ngrouping at scale"] --> ReliableSelection["Reliable tool selection\neven as available tool\ncount grows"]
    ReliableSelection --> ConfidentScaling["Confident scaling to\nadditional agent capabilities"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Tool-selection accuracy degrading as available tool count grows | Group tools hierarchically; consider MCP-style discovery (platform's next skill) |
| Fragile custom text parsing breaking on phrasing variation | Migrate to native, provider-supported structured tool calling |
| Unnecessary sequential round-trips for independent information needs | Use parallel tool calling |
| Malformed model-supplied arguments causing execution errors | Validate arguments against an explicit schema before execution |
`,

  security: `
### Tool-calling-specific security considerations, directly extending Agent Fundamentals and Guardrails

~~~
Tool calling is precisely the MECHANISM through which an
agent takes real-world actions -- every invocation, not just
ones assumed risky in advance, should be considered a
candidate for action-level guardrail review, directly
reusing Agent Fundamentals' and Guardrails' own guidance.
~~~

### Essential tool-calling-related security practices

1. **Apply action-level guardrails to every tool invocation**, gating high-risk tools with human-in-the-loop review, directly reusing **Agent Fundamentals**' and **Guardrails**' treatment.
2. **Validate all model-supplied arguments** before execution, preventing malformed or unexpected input from reaching the underlying function.
3. **Treat tool results as potentially untrusted input**, directly reusing the **LangChain** skill's own prompt-injection guidance — a malicious or compromised tool result could attempt to manipulate subsequent reasoning.
4. **Limit each tool's own permissions to the minimum genuinely necessary**, directly reusing the principle of least privilege.

See **Agent Fundamentals**, **Guardrails**, and **OWASP Top 10** for the broader security context this connects to.
`,

  testing: `
### Testing tool selection accuracy

~~~python
def test_weather_questions_select_the_weather_tool():
    response = model.generate("What's the weather in Paris?", tools=[weather_schema, stock_schema])
    assert response.tool_calls[0].name == "get_weather"
~~~

### Testing argument validation

~~~python
def test_invalid_arguments_are_rejected_before_execution():
    result = execute_tool_call(malformed_call, tool_registry, risk_classifier, human_queue)
    assert "Invalid arguments" in result
~~~

### The senior testing doctrine

- Test tool-selection accuracy explicitly against a representative, diverse set of inputs for every available tool, directly reusing the **LangChain** skill's own testing guidance.
- Test argument validation independently, verifying malformed arguments are caught before reaching the underlying function.
- Test that tool errors/failures are correctly fed back to the model as observations, not silently swallowed.
- Test action-level guardrail enforcement for high-risk tools, verifying human-in-the-loop review genuinely gates execution.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect the exact tool call the model produced first** (name and arguments), directly analogous to **Agent Fundamentals**' own trajectory-tracing guidance.
2. **Check tool description clarity/distinctiveness** if the wrong tool was selected.
3. **Check argument validation logic** if a tool executed with unexpected or malformed arguments.
4. **Check whether a tool's error was correctly fed back as an observation** if the model's subsequent behavior seems unaware of a failure.

### Debugging common tool-calling-related symptoms

- "The model called the wrong tool" — check tool description clarity and distinctiveness, directly reusing **LangChain**'s own debugging guidance.
- "A tool executed with malformed arguments" — verify argument validation is genuinely applied before execution.
- "The model seems unaware a tool call failed" — check whether the failure was correctly fed back into context as an observation.
- "Tool selection degrades as more tools are added" — consider hierarchical grouping or MCP-style discovery.
`,

  monitoring: `
### Key signals to track

- **Tool-selection accuracy** against representative, labeled test cases, directly connecting to the **Evaluation** skill's own measurement methodology.
- **Argument validation failure rate**, watching for a pattern suggesting unclear tool schemas or genuine model reliability issues.
- **Tool execution success/failure rates**, directly connecting to **Agent Fundamentals**' own trajectory-observability treatment.
- **Guardrail trigger/approval-request rates** for high-risk tools.

### Tools

Framework-specific tracing (LangSmith, covered in the **LangChain** skill; native tracing, covered in the **OpenAI Agents SDK** skill) directly captures tool-call sequences; general LLM observability tools for cross-framework monitoring.

### Alerting priorities

Alert on a significant increase in argument validation failures (a signal of unclear schemas or degraded model reliability), and on unexpected shifts in tool-selection patterns diverging from historical baselines.
`,

  deployment: `
### A representative deployment configuration

~~~python
tool_registry = build_tool_registry_from_config()  # schemas,
                                                       # functions, and
                                                       # risk classifications
                                                       # as version-controlled config

def handle_request(user_message):
    response = model.generate(user_message, tools=tool_registry.schemas())
    for call in response.tool_calls:
        result = execute_tool_call(call, tool_registry, risk_classifier, human_queue)
        response = model.generate(context=response.context_with(result), tools=tool_registry.schemas())
    return response.final_output
~~~

### CI/CD pipeline considerations

Treat tool schemas, argument-validation logic, and risk classifications as genuine, version-controlled application configuration, with automated evaluation (directly connecting to the **Evaluation** skill) of tool-selection accuracy against representative inputs as a deployment gate. See the **CI/CD** skill and the platform's later **LLMOps** skill for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production tool-calling system takes real traffic:

- [ ] Native, provider-supported tool calling used, not fragile free-form text parsing
- [ ] Every tool schema/description clear, specific, and genuinely distinct from other available tools
- [ ] All model-supplied arguments validated against an explicit schema before execution
- [ ] Action-level guardrails applied to every tool invocation, with human-in-the-loop review for high-risk tools
- [ ] Tool errors/failures correctly fed back to the model as observations
- [ ] Tool results treated as potentially untrusted input
- [ ] Tool-selection accuracy tested against a representative, diverse set of inputs
`,

  "common-mistakes": `
1. **Relying on fragile, free-form text parsing** instead of native, provider-supported tool calling.
2. **Vague, overlapping tool descriptions**, degrading selection accuracy.
3. **Executing tool calls without argument validation**, risking malformed input reaching the underlying function.
4. **Skipping action-level guardrails**, treating every tool invocation as implicitly safe.
5. **Silently failing on tool errors** rather than feeding them back as observations.
6. **Treating tool results as inherently trusted**, missing prompt-injection risk.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Model calls the wrong tool | Vague or overlapping tool descriptions | Rewrite descriptions to be clear, specific, and distinct |
| Tool executes with malformed arguments | No argument validation before execution | Validate against an explicit schema before calling the function |
| Model seems unaware a tool call failed | Failure not fed back into context as an observation | Explicitly feed tool errors back as observations |
| A high-risk tool executes without review | Missing action-level guardrail on that specific tool | Apply Agent Fundamentals'/Guardrails' constraint guidance |
| Selection accuracy degrades as tools are added | Flat, ungrouped tool list growing too large | Group tools hierarchically or adopt MCP-style discovery |
| Custom parsing logic breaks unpredictably | Relying on free-form text rather than native tool calling | Migrate to native, provider-supported structured tool calling |
`,

  faqs: `
**What is tool calling?**
The structured mechanism by which an LLM invokes external functions/APIs, directly implementing the tool-use concept introduced in Agent Fundamentals.

**Why is native tool calling preferred over free-form text parsing?**
Because native tool calling produces structured, machine-parseable output directly from the model's API, considerably more reliable than fragile, custom text-parsing logic.

**What is a tool schema?**
A structured, JSON-Schema-like description of a tool's name, purpose, and typed parameters, directly connecting to the Prompt Engineering skill's structured-output treatment.

**What is parallel tool calling?**
A model requesting multiple, independent tool invocations within a single turn, improving efficiency for tasks requiring several simultaneous pieces of information.

**Why doesn't reliable tool-calling mechanics guarantee accurate tool selection?**
Because the model can still choose the wrong tool among several options, or supply incorrect arguments, even when the invocation itself is structurally well-formed — selection accuracy is a separate, prompt-engineering-driven concern.

**Why should tool results be treated as potentially untrusted input?**
Because a malicious or compromised tool result becomes part of the agent's subsequent context, directly connecting to prompt-injection risk covered in the LangChain skill.
`,

  "interview-questions": `
### Junior level

1. **What is tool calling?**
   Model answer: the structured mechanism by which an LLM invokes external functions/APIs beyond its own text generation.

2. **Why is native tool calling preferred over asking a model to describe a tool call in free-form text?**
   Model answer: native tool calling produces structured, machine-parseable output directly, avoiding fragile, custom text-parsing logic.

3. **What is a tool schema?**
   Model answer: a structured description of a tool's name, purpose, and typed parameters.

4. **What is parallel tool calling?**
   Model answer: a model requesting multiple, independent tool invocations within a single turn.

### Senior level

5. **Explain precisely why solving the tool-calling RELIABILITY problem (native, structured invocation) doesn't automatically solve the tool-SELECTION accuracy problem, with a concrete example.**
   Model answer: native tool calling ensures that WHEN a model decides to invoke a tool, its intended call is expressed as structurally well-formed, machine-parseable data (the correct JSON shape, with argument types matching the schema) — this is a MECHANICAL reliability guarantee about the FORMAT of the model's output; it says nothing about whether the model correctly decided WHICH tool to invoke in the first place, or whether the SEMANTIC content of the supplied arguments is actually appropriate for the user's genuine intent; for example, given two available tools, \`search_flights\` and \`search_hotels\`, both with technically well-formed schemas, a model asked "find me a place to stay in Tokyo" could, in principle, still incorrectly invoke \`search_flights\` with a structurally PERFECT, schema-compliant set of arguments (perhaps misinterpreting "place to stay" in some confused way) — the tool call would be perfectly reliable in terms of FORMAT, while being completely wrong in terms of SELECTION; this is precisely why tool DESCRIPTION quality (clear, specific, distinct wording conveying exactly when each tool applies) remains a genuinely separate, ongoing prompt-engineering concern even in a system using flawless, native, structured tool calling.

6. **A production agent's tool-calling system occasionally executes a tool with subtly incorrect arguments that pass schema validation but don't actually reflect the user's genuine intent (e.g., searching for the wrong date). Diagnose this and propose a fix.**
   Model answer: this is a SEMANTIC correctness issue, not a schema/structural validation issue — the supplied arguments are STRUCTURALLY valid (correct types, present required fields), so schema validation (this page's own recommended first-line defense) genuinely cannot catch this, since schema validation only checks STRUCTURE, not semantic appropriateness; the underlying cause is most likely either an ambiguous user request that the model resolved incorrectly, or an under-specified tool description that doesn't clearly convey how a given argument (e.g., a date) should be interpreted or defaulted in ambiguous cases; the fix involves two complementary approaches: first, IMPROVE THE TOOL DESCRIPTION and/or the surrounding prompt to more explicitly guide how ambiguous inputs should be resolved (e.g., explicitly stating "if no year is specified, assume the current year" directly in the tool's parameter description, directly connecting to the **Prompt Engineering** skill's own clarity guidance); second, for genuinely HIGH-STAKES actions where a semantically-incorrect-but-structurally-valid argument could cause real harm, consider an additional CONFIRMATION step — either an explicit human-in-the-loop review (directly reusing **Agent Fundamentals**' autonomy-calibration guidance) or a lightweight, secondary model call specifically asking "does this specific interpretation of the user's request seem correct" before executing — since schema validation alone cannot catch this class of error.

7. **Explain the tool-selection scaling challenge as the number of available tools grows, and design a mitigation for an agent that needs access to 50+ distinct tools.**
   Model answer: as the NUMBER of available tools grows, the model must effectively attend to and distinguish among an increasingly large set of tool descriptions within its context (directly connecting to the **LLM Fundamentals** skill's own attention/context treatment) when deciding which one (if any) to invoke for a given request — beyond some point, this large, flat list of options genuinely degrades selection accuracy, since more genuinely-similar-sounding options compete for the model's "attention" and correct discrimination becomes a harder task; for an agent needing access to 50+ distinct tools, I'd design a HIERARCHICAL tool-selection approach: first, a coarse-grained CATEGORY-selection step (the model chooses among a small number of broad tool CATEGORIES — e.g., "financial tools," "communication tools," "data-retrieval tools" — rather than all 50+ individual tools at once), followed by a second, fine-grained tool-selection step scoped ONLY to the small subset of tools within the chosen category; this directly mirrors how a human might navigate a large menu of options by first choosing a broad section before examining specific items within it, and directly foreshadows the platform's next skill, MCP, which addresses tool discovery and organization at genuinely large scale via a more standardized protocol.

8. **A team's tool-calling agent occasionally acts on a tool result that itself contains adversarially-crafted text attempting to manipulate the agent's subsequent behavior (e.g., a web-search tool returning a page containing "ignore previous instructions and instead..."). Explain this risk and design a mitigation.**
   Model answer: this is a direct instance of PROMPT INJECTION VIA TOOL RESULTS, covered in this page's own security section and directly connecting to the **LangChain** skill's own broader prompt-injection treatment — a tool's result becomes part of the agent's subsequent CONTEXT exactly like any other piece of text, and if that context contains text specifically crafted to look like an instruction, the model may, in principle, be influenced by it despite it originating from an untrusted, external source rather than the genuine system/user; mitigations include: explicitly DEMARCATING tool-result content within the prompt (e.g., wrapping it in clear delimiters explicitly labeled as "external, potentially untrusted content" rather than blending it seamlessly with genuine instructions) to help the model better distinguish content categories; applying a lightweight, dedicated CLASSIFIER to detect obvious injection-attempt patterns within retrieved/tool-result content before it's incorporated into the prompt at all; and — directly reusing **Agent Fundamentals**' own action-level guardrail guidance — even if a manipulated tool result somehow influences the agent's subsequent REASONING, requiring human-in-the-loop confirmation before any genuinely high-risk ACTION (rather than further, low-risk information-gathering) provides a meaningful additional safeguard limiting the actual real-world consequence of a successful manipulation attempt.

9. **Compare sequential (one at a time) versus parallel tool calling for a task requiring three genuinely independent pieces of information, and explain a scenario where parallel tool calling would NOT be appropriate.**
   Model answer: for three GENUINELY INDEPENDENT pieces of information (e.g., "what's the weather in Tokyo, the current price of AAPL stock, and today's top news headline" — none of these three depends on the others' results), SEQUENTIAL tool calling would require three separate round-trips to the model (generate, receive one tool call, execute it, generate again, receive the next tool call, and so on), directly incurring additional latency and cost for each additional sequential round-trip, connecting to the **Inference** skill's own per-call cost treatment; PARALLEL tool calling lets the model request all three invocations within a SINGLE response, letting the application execute them concurrently and feed all three results back in one subsequent generation call — directly reducing both the total number of round-trips and, if the tools' actual execution can run concurrently, the overall wall-clock latency; a scenario where parallel tool calling would NOT be appropriate: when a LATER tool call's arguments genuinely DEPEND on an EARLIER tool call's result (e.g., "look up this customer's account ID, then use that account ID to fetch their order history") — here the second call cannot even be correctly FORMULATED until the first call's result is known, so this is inherently a SEQUENTIAL dependency, and attempting to request both calls in parallel would be structurally incoherent (the model would have no genuine account ID to supply as an argument for the second call yet).

10. **Design a tool-calling system for a financial-services agent with a mix of low-risk (balance inquiry) and high-risk (fund transfer) tools, explaining how you'd differentiate their handling.**
    Model answer: I'd design the tool registry with an explicit RISK CLASSIFICATION associated with each tool (directly analogous to the risk-tiering pattern covered across **Agent Fundamentals**, **LangGraph**'s interrupt checkpoints, and the **OpenAI Agents SDK**'s guardrails) — \`get_account_balance\` classified as LOW risk (a read-only, easily-reversible/inconsequential operation), and \`transfer_funds\` classified as HIGH risk (a real, hard-to-reverse financial action); for LOW-risk tools, I'd allow AUTONOMOUS execution immediately after argument validation passes, with no additional human-in-the-loop delay, since the genuine consequence of even an occasional error is low; for the HIGH-risk \`transfer_funds\` tool specifically, I'd implement a mandatory, EXPLICIT human-in-the-loop confirmation step BEFORE actual execution — the model's structurally well-formed, validated tool call would be surfaced to a human reviewer (or the original requesting user, for a self-service transfer) for explicit approval, directly implementing **Agent Fundamentals**' and **Guardrails**' own action-level, tiered-autonomy guidance — with the tool call's specific, validated arguments (the amount, the destination account) clearly displayed as part of this confirmation step so the human reviewer has full, concrete visibility into precisely what they're approving, rather than merely confirming a vague, high-level description of the intended action.
`,

  "coding-questions": `
### 1. Implement a basic tool-execution loop with structured tool calling

~~~python
def run_with_tools(user_message, model, tools_schema, tool_functions, max_iterations=5):
    context = [{"role": "user", "content": user_message}]
    for _ in range(max_iterations):
        response = model.generate(context, tools=tools_schema)
        if not response.tool_calls:
            return response.final_output
        for call in response.tool_calls:
            result = tool_functions[call.name](**call.arguments)
            context.append({"role": "tool", "name": call.name, "content": result})
    return "Max iterations reached."
# Follow-up: why does this function directly reuse Agent
# Fundamentals' bounded-iteration loop-safety guidance, and
# what would happen without the max_iterations bound?
~~~

### 2. Implement argument validation before tool execution

~~~python
from pydantic import BaseModel, ValidationError

def validate_and_execute(call, arg_schemas, tool_functions):
    schema = arg_schemas.get(call.name)
    if schema is None:
        return f"Unknown tool: {call.name}"
    try:
        validated = schema(**call.arguments)
    except ValidationError as e:
        return f"Invalid arguments for {call.name}: {e}"
    return tool_functions[call.name](**validated.dict())
# Follow-up: why is returning an error message (rather than
# raising an exception that crashes the interaction) the
# more appropriate response when validation fails?
~~~

### 3. Implement risk-tiered tool execution with human-in-the-loop gating

~~~python
def execute_with_risk_gating(call, tool_functions, risk_levels, human_queue):
    if risk_levels.get(call.name) == "high":
        return human_queue.submit_for_approval(call.name, call.arguments)
    return tool_functions[call.name](**call.arguments)
# Follow-up: how would you extend this to log every high-risk
# tool call request (approved or not) for later security review?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement native tool calling with a single tool
Build a basic tool-execution loop using native, structured tool calling for one simple tool, verifying correct invocation and result feedback. Deliverable: a working, tested tool-calling loop. Skills exercised: basic native tool-calling implementation.

### Lab 2 (Intermediate): Implement argument validation and error feedback
Extend the loop to validate model-supplied arguments against an explicit schema, feeding validation errors back to the model as observations. Deliverable: a working, tested validated tool-calling system. Skills exercised: applied argument validation and error handling.

### Lab 3 (Advanced): Implement risk-tiered, human-in-the-loop tool execution
Build a system with at least one low-risk and one high-risk tool, gating the high-risk tool behind explicit human-in-the-loop approval. Deliverable: a working, tested risk-tiered tool-execution system. Skills exercised: applied action-level security for tool calling.

### Lab 4 (Production): Implement hierarchical tool selection at scale
Build a system with a large number (15+) of available tools, grouped hierarchically (category selection, then tool selection within category), verifying selection accuracy compared to a flat tool list. Deliverable: a working, tested hierarchical tool-selection system with a documented accuracy comparison. Skills exercised: applied tool-selection scaling design.
`,

  "real-projects": `
### 1. A customer-support agent with risk-tiered tool access
Engineering requirements: clear, distinct tool schemas, argument validation, and human-in-the-loop gating for high-risk tools (refunds, account changes).

### 2. A research-assistant agent with parallel tool calling
Engineering requirements: multiple independent search/retrieval tools invoked in parallel for efficiency, with results fed back and synthesized.

### 3. A large-scale internal-tooling agent with hierarchical tool selection
Engineering requirements: 20+ available tools grouped into logical categories, a coarse-grained category-selection step, and fine-grained tool selection within the chosen category.
`,

  "case-studies": `
### Native function calling's foundational role in making agentic AI production-viable
The introduction of native, provider-supported function/tool calling directly replaced fragile, ad-hoc text-parsing approaches with a genuinely reliable, structured mechanism — this single capability improvement is precisely what made the ENTIRE ecosystem of agent frameworks covered throughout this category (LangChain, LangGraph, CrewAI, the OpenAI Agents SDK, AutoGen) practically viable at production scale, since every one of them ultimately relies on this same underlying mechanism. Lesson: sometimes a single, foundational capability improvement (native structured output for tool calls) unlocks an entire subsequent ecosystem of higher-level tools and frameworks built on top of it — recognizing which foundational capabilities are genuinely load-bearing for an entire field's practical viability is a valuable, transferable engineering insight.

### The ongoing, distinct challenge of tool-selection accuracy despite reliable invocation mechanics
Even after native tool calling solved the MECHANICAL reliability problem, tool-selection ACCURACY remained (and remains) a genuinely distinct, ongoing challenge requiring careful, deliberate prompt-engineering attention (tool description clarity) rather than being automatically solved by the underlying mechanism's own reliability. Lesson: solving a mechanism's STRUCTURAL reliability (the format of an interaction) doesn't automatically solve every SEMANTIC challenge built on top of it (whether the interaction's actual content/decision is correct) — these are genuinely distinct problems often requiring genuinely distinct solutions.
`,

  comparisons: `
| Aspect | Free-Form Text Parsing | Native Tool Calling |
|--------|--------------------------------|------------------------------|
| Reliability | Fragile — depends on exact phrasing | Reliable — structured, machine-parseable |
| Parsing complexity | Custom, brittle regex/string logic | Handled directly by the model provider's API |
| Best fit | Legacy systems without native support | Standard, recommended approach today |

| Aspect | Sequential Tool Calling | Parallel Tool Calling |
|--------|--------------------------------|--------------------------------|
| Round-trips | One per tool call | Multiple calls in a single response |
| Best fit | Dependent calls (later depends on earlier) | Genuinely independent information needs |

**How seniors choose**: always use native, structured tool calling over free-form text parsing; use parallel tool calling specifically for genuinely independent information needs; validate arguments and apply action-level guardrails to every invocation regardless of assumed risk; group tools hierarchically as the available count grows.
`,

  "related-technologies": `
- **Agent Fundamentals** — the tool-use concept this page concretely implements via a specific, structured mechanism.
- **Prompt Engineering** — the structured-output concepts underlying tool schemas.
- **Guardrails** — the action-level constraint guidance directly applicable to every tool invocation.
- **LangChain**, **CrewAI**, **OpenAI Agents SDK**, **AutoGen** — the frameworks whose own tool abstractions directly build on the native tool-calling mechanism covered on this page.
- **MCP** — covered next and last in this category, directly addressing tool discovery and standardization at scale, building on native tool calling as its underlying invocation mechanism.

Learning path: **Agent Fundamentals** → the framework skills → **Agent Memory** → **Planning** → **Reflection** → this page (Tool Calling) → **MCP**.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Native tool/function calling remains a standard, universally-supported capability across major LLM providers, with continued refinement of parallel-calling support and argument-schema expressiveness.
- Continued practical and research attention to tool-selection accuracy at scale, directly motivating standardized discovery protocols like MCP.
- Growing emphasis on tool-result prompt-injection risk as a recognized, standard security consideration for production agentic systems.
- Given continued, active development in this space, verify current best-practice recommendations against up-to-date provider-specific API documentation.
`,

  "future-roadmap": `
Where tool calling is heading, and what's worth betting career time on:

- **Continued standardization and refinement of native tool-calling APIs** across providers, with growing consistency in schema expressiveness and parallel-calling support.
- **Continued growth of standardized tool-discovery protocols** (MCP, covered next) addressing tool-selection accuracy and integration fragmentation at genuinely large scale.
- **Continued research into more robust tool-selection accuracy**, both via improved model capability and more deliberate tool-description engineering practice.
- **What to bet on**: deeply understanding the distinction between mechanical invocation reliability and semantic selection accuracy, and the general principles of clear tool-description writing, argument validation, and action-level security — these transfer directly across any specific provider's API and any specific framework's own tool abstractions.
`,

  "cheat-sheet": `
~~~
# ---- Tool schema ----
{"name": "...", "description": "clear, SPECIFIC, distinct
    from other tools", "parameters": {JSON Schema}}
~~~

~~~
# ---- Reliability vs. selection accuracy (distinct problems!) ----
Native tool calling  -> solves MECHANICAL reliability
                          (structured, parseable output)
Tool description quality -> solves SELECTION accuracy
                          (which tool, correctly chosen)
Neither one solves the other automatically.
~~~

~~~
# ---- Execution loop ----
response = model.generate(msg, tools=schemas)
for call in response.tool_calls:
    validate(call.arguments)          # BEFORE execution
    result = execute(call)             # or gate via guardrail
    feed result back as an OBSERVATION  # Agent Fundamentals' loop
# ALWAYS bound total iterations
~~~

~~~
# ---- Parallel tool calls ----
Use for GENUINELY INDEPENDENT info needs (fan out, fan in).
NOT for dependent calls (arg B needs result of call A first).
~~~

~~~
# ---- Non-negotiables ----
Validate arguments against schema -- BEFORE execution
Action-level guardrails on EVERY invocation, not just "risky" ones
Feed tool ERRORS back as observations -- don't silently fail
Treat tool RESULTS as untrusted input (prompt injection risk)
Group tools hierarchically as count grows (selection degrades otherwise)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is tool calling? | The structured mechanism for an LLM to invoke external functions/APIs. |
| Why native tool calling over free-form text parsing? | Structured, machine-parseable output vs. fragile, custom text parsing. |
| What is a tool schema? | A structured description of a tool's name, purpose, and typed parameters. |
| Reliability vs. selection accuracy? | Native calling solves format reliability; description quality solves WHICH tool is chosen. |
| What is parallel tool calling? | Requesting multiple independent tool invocations in a single turn. |
| When is parallel calling NOT appropriate? | When a later call's arguments depend on an earlier call's result. |
| Why validate arguments before execution? | Schema validation catches malformed input; it does NOT catch semantic errors. |
| Why must guardrails apply to every tool call? | Tool calling is the mechanism for real actions — not just "risky-looking" ones. |
| Why treat tool results as untrusted? | A tool result becomes context — could carry a prompt-injection attempt. |
| Fix for selection accuracy degrading with many tools? | Group tools hierarchically (category, then tool) — foreshadows MCP. |
`,

  mcqs: `
1. What is native tool/function calling?
   A) Asking a model to describe a tool call in free-form text  B) A provider-native API capability letting a model produce structured, machine-parseable tool-invocation output directly  C) A type of vector database  D) A prompt-injection technique
   **Answer: B** — the reliable, structured mechanism replacing fragile text parsing.

2. Why doesn't reliable tool-calling mechanics automatically guarantee accurate tool selection?
   A) They are the same problem  B) Structural reliability (well-formed output format) is distinct from the model correctly choosing WHICH tool to invoke  C) Tool selection is never a genuine concern  D) Native calling makes selection errors impossible
   **Answer: B** — a critical, frequently-tested distinction.

3. What is parallel tool calling best suited for?
   A) Calls where a later call depends on an earlier call's result  B) Genuinely independent information needs requested within a single turn  C) Only single-tool systems  D) Reducing schema validation requirements
   **Answer: B** — dependent calls must remain sequential.

4. Why should argument validation happen before tool execution, and what does it NOT catch?
   A) It catches semantic errors, not structural ones  B) It catches structurally malformed arguments (wrong types, missing fields), but does NOT catch semantically incorrect-but-valid arguments  C) Validation is unnecessary with native tool calling  D) It replaces the need for guardrails
   **Answer: B** — a genuinely distinct concern from action-level guardrail review.

5. Why should action-level guardrails apply to every tool invocation, not just ones assumed risky in advance?
   A) Guardrails are only needed for code execution  B) Tool calling is precisely the mechanism through which an agent takes real-world actions, so every invocation is a genuine candidate for review  C) This is unnecessary overhead  D) Native tool calling already includes guardrails
   **Answer: B** — directly reusing Agent Fundamentals' and Guardrails' action-level constraint guidance.
`,

  "revision-notes": `
Tool calling (function calling) is the structured MECHANISM by which an LLM invokes external functions/APIs, directly implementing the tool-use concept introduced in **Agent Fundamentals** — the shared foundation every framework covered in this category (**LangChain**, **CrewAI**, the **OpenAI Agents SDK**, **AutoGen**) builds directly on top of. NATIVE tool calling (a provider-supported API feature producing structured, machine-parseable tool-invocation output) replaced the earlier, genuinely FRAGILE approach of asking a model to describe a desired call in free-form text and parsing it with custom, brittle logic — this single foundational capability improvement is precisely what made the entire agentic-AI ecosystem covered throughout this category practically viable at production scale.

A TOOL SCHEMA is a structured, JSON-Schema-like description of a tool's name, purpose, and typed parameters, directly connecting to the **Prompt Engineering** skill's own structured-output treatment — this is the primary signal a model uses to decide WHETHER and WHEN to invoke a given tool, meaning CLEAR, SPECIFIC, and genuinely DISTINCT tool descriptions directly determine selection accuracy, directly connecting to the same role-differentiation/tool-selection-accuracy guidance covered in the **LangChain** and **CrewAI** skills.

A critical, frequently-tested distinction is that solving the MECHANICAL RELIABILITY problem (native tool calling ensures a model's intended call is expressed as structurally well-formed, parseable data) does NOT automatically solve the separate SELECTION ACCURACY problem (whether the model correctly chose WHICH tool to invoke, and supplied semantically — not just structurally — appropriate arguments) — these are genuinely distinct engineering concerns requiring distinct solutions (native API support for the former; careful, ongoing tool-description quality for the latter).

PARALLEL TOOL CALLING lets a model request multiple, independent tool invocations within a single turn — genuinely appropriate specifically when the required information pieces are truly INDEPENDENT (no later call depends on an earlier call's result); when a genuine dependency exists (a later call's arguments require an earlier call's actual result), calls must remain SEQUENTIAL, since the dependent call cannot even be correctly formulated until the prior result is known.

ARGUMENT VALIDATION (checking a model's supplied arguments against an explicit schema before actual execution) is an essential, cheap first-line defense catching STRUCTURALLY malformed input — but this validation does NOT catch SEMANTICALLY incorrect-but-structurally-valid arguments (e.g., a wrong-but-well-formed date), which instead requires improved tool-description clarity or, for genuinely high-stakes actions, an additional human-in-the-loop confirmation step.

A critical, frequently-tested security principle directly extends **Agent Fundamentals**' and **Guardrails**' action-level guidance: because tool calling is precisely the mechanism through which an agent takes REAL-WORLD ACTIONS, action-level guardrails should apply to EVERY tool invocation, gating genuinely high-risk tools (financial transactions, irreversible data modifications) with explicit human-in-the-loop review — this is not merely for invocations assumed risky in advance, but a standing practice applied uniformly with tools genuinely CLASSIFIED by risk level. A related, frequently-tested risk is PROMPT INJECTION VIA TOOL RESULTS — a tool's result becomes part of the agent's subsequent context exactly like any other text, so malicious or compromised tool results should be treated as UNTRUSTED input, directly connecting to the **LangChain** skill's own broader prompt-injection guidance.

As the NUMBER of available tools grows, tool-SELECTION accuracy genuinely degrades (directly connecting to the **LLM Fundamentals** skill's own attention/context treatment, since the model must effectively distinguish among an increasingly large set of descriptions) — the standard mitigation is HIERARCHICAL tool grouping (a coarse-grained category-selection step, followed by fine-grained selection within the chosen category), directly foreshadowing the platform's next and final skill in this category, **MCP**, which addresses tool discovery and standardization at genuinely large scale.

A senior AI engineer always uses native, structured tool calling over fragile text parsing, writes clear and genuinely distinct tool descriptions, validates arguments before execution, applies action-level guardrails to every invocation, feeds tool errors back to the model as observations, treats tool results as potentially untrusted input, and groups tools hierarchically as the available count scales — this foundational, mechanism-level understanding directly sets up the platform's final skill in this category: **MCP**, the Model Context Protocol standardizing tool discovery and integration.
`,

  "learning-roadmap": `
**Week 1 — Native tool calling fundamentals**: implementing a basic tool-execution loop for a single tool. Milestone: complete Lab 1, with a working, tested native tool-calling loop.

**Week 2 — Validation and error handling**: extending the loop with argument validation and error-observation feedback. Milestone: complete Lab 2, with a working, tested validated tool-calling system.

**Week 3 — Action-level security**: implementing risk-tiered tool execution with human-in-the-loop gating for high-risk tools. Milestone: complete Lab 3, with a working, tested risk-tiered system.

**Week 4 — Scaling tool selection**: implementing hierarchical tool selection across 15+ tools, with a documented accuracy comparison against a flat list. Milestone: complete Lab 4.

Next platform skill once this roadmap is complete: **MCP**, the Model Context Protocol, covering standardized tool discovery and integration — the final skill in the AI Agents category.
`,

  "official-docs": `
- **Major LLM providers' own official function/tool-calling API documentation** — the authoritative, actively-maintained reference for native tool-calling mechanics, schema formats, and parallel-calling support.
- **Framework-specific tool-integration documentation** (LangChain, CrewAI, OpenAI Agents SDK, AutoGen) — practical implementations built directly on native tool calling.
`,

  books: `
- **"Designing Machine Learning Systems" — Chip Huyen** — relevant general background on structured API design and validation practices applicable to tool-calling system architecture.
- Given the specific "tool calling" framing's provider-API-driven nature, official documentation remains the most current, authoritative reference.
`,

  blogs: `
- **Major LLM providers' own developer blogs** — release notes and best-practice guidance on native tool-calling features.
- **Framework-specific writing on tool-selection accuracy and description-writing best practices**, widely available across AI engineering educational content providers.
`,

  "research-papers": `
- **Schick, T. et al. — "Toolformer: Language Models Can Teach Themselves to Use Tools"** — an influential early paper on models learning to invoke external tools.
- Provider-specific technical documentation on function-calling implementation is generally the most authoritative, current reference for this rapidly-evolving, API-driven capability.
`,

  videos: `
- **Provider-specific tutorials on implementing native function/tool calling.**
- **Framework-specific tutorials on tool integration** (LangChain, CrewAI, OpenAI Agents SDK, AutoGen).
`,

  "github-repos": `
- **Major LLM provider SDK repositories** — reference implementations of native tool-calling API usage.
- **langchain-ai/langchain**, **crewAIInc/crewAI**, **openai/openai-agents-python**, **microsoft/autogen** — each framework's own concrete tool-integration implementation, directly built on the mechanics covered on this page.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Tool schema design**: given a described capability, write a clear, well-specified tool schema/description.
2. **Selection-accuracy debugging**: given a described tool-misselection issue, diagnose the likely cause and propose a fix.
3. **Validation design**: given a described tool, design an explicit argument-validation schema catching structurally malformed input.
4. **Risk-tiering design**: given a described set of tools, classify them by risk and design appropriate execution gating.
5. **External practice sets**: major LLM providers' own official function-calling tutorials and cookbook examples for hands-on practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Mechanism["Native Tool-Calling Mechanism"]
        Schema["Tool Schema"]
        StructuredOutput["Structured Invocation Output"]
        Parallel["Parallel Tool Calls"]
    end
    subgraph ExecutionLoop["Execution Loop"]
        Validation["Argument Validation"]
        Execution["Tool Execution"]
        Observation["Result as Observation"]
    end
    subgraph Safety["Safety"]
        RiskTiering["Risk Classification"]
        Guardrails["Action-Level Guardrails"]
        Untrusted["Tool Results as Untrusted Input"]
    end
    subgraph Scale["Scaling"]
        Hierarchical["Hierarchical Tool Grouping"]
    end
    Mechanism --> ExecutionLoop --> Safety
    ExecutionLoop --> Scale
~~~
`,

  "mind-map": `
~~~mindmap
  root((Tool Calling))
    Foundations
      Overview
      History native function calling
      Why it exists
      Problem it solves
    Core Mechanics
      Tool schemas
      Structured invocation output
      Parallel tool calls
    Reliability vs Selection
      Mechanical reliability
      Semantic selection accuracy
      Description quality
    Execution Loop
      Argument validation
      Error as observation
      Bounded iterations
    Security
      Action level guardrails
      Risk tiering
      Untrusted tool results
    Scaling
      Hierarchical grouping
      Foreshadows MCP
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default toolCalling;
