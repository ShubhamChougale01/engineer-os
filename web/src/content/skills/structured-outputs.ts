import type { SkillContent } from "../types";

/**
 * Structured Outputs — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const structuredOutputs: SkillContent = {
  overview: `
Structured Outputs is the discipline — and increasingly the standardized feature set — for getting an LLM to produce responses that reliably conform to a predefined shape: a JSON object matching a schema, a function call with correctly-typed arguments, or output constrained to a fixed grammar. Instead of asking a model to "please respond in JSON" and hoping, structured outputs make conformance a property the serving or API layer actively enforces (or a property you validate and repair around), so downstream code can parse the result without defensive string-hacking.

For an AI engineer, this is the connective tissue that turns an LLM from a text generator into a programmable component. Every agent framework, every tool-calling system, every pipeline that hands an LLM's output to another piece of software depends on structured outputs working reliably: an agent deciding which tool to call and with what arguments (see **Tool Calling**, **LangGraph**, **CrewAI**), a RAG pipeline extracting typed facts from unstructured text, an **Agent-to-Agent (A2A) Protocol** exchange carrying a structured data Part, or a serving engine like **SGLang** enforcing a JSON schema at the token-sampling level. Structured outputs are what make "the LLM as a function you can call from code" a viable engineering pattern instead of a fragile prompt-and-pray gamble.

Key characteristics: schema-first design (define the shape you want before you prompt for it, typically via JSON Schema or a typed model like a Pydantic class); a spectrum of enforcement strength from "hope the prompt works" through "the API validates and retries" to "the serving engine masks invalid tokens so the wrong shape is literally impossible to sample"; and a close, symbiotic relationship with function/tool calling, since a tool call's arguments are themselves a structured output. Major providers (**OpenAI Responses API**, Anthropic's tool use, and open-source serving engines) have converged on JSON Schema as the dominant interchange format, though implementations and guarantee strength vary meaningfully between them.
`,

  history: `
Structured outputs evolved from ad hoc prompt engineering into an enforced platform feature over roughly three years, tracking the broader maturation of LLMs from research curiosities into production system components.

| Year | Milestone |
|------|-----------|
| 2022–2023 | Early practice: prompt the model with "respond only in JSON" and parse the result with a try/except around json.loads — frequently broken by extra prose, trailing commas, or markdown code fences the model adds unprompted |
| 2023 | OpenAI introduces **function calling** in the Chat Completions API — the model returns a structured function name plus JSON arguments matching a developer-supplied schema, the first widely-adopted enforced structured-output mechanism at API scale |
| 2023 | The **Pydantic**-adjacent ecosystem (Instructor and similar libraries) popularizes defining the desired output shape as a typed Python class, then validating (and automatically retrying on failure) the model's JSON output against it — moving structured-output discipline into application code rather than prompt text alone |
| 2023–2024 | Open-source constrained-decoding libraries (Outlines, and built-in support in serving engines) demonstrate token-level enforcement: masking the model's next-token probabilities so only grammatically valid continuations can be sampled, making invalid-shape output structurally impossible rather than merely unlikely |
| 2024 | OpenAI ships **Structured Outputs** as a dedicated, named feature (distinct from earlier "JSON mode") with a strict schema-conformance guarantee for supported schemas, backed by constrained decoding on their serving side |
| 2024 | **SGLang** and other serving engines invest specifically in fast, correct constrained/grammar-guided decoding as a first-class serving-engine feature, not an external add-on |
| 2024–2025 | The **OpenAI Responses API** and other unified agent/tool APIs integrate structured outputs and tool calling as part of one coherent request/response model rather than separate bolted-on features |
| 2025 | Structured-output conformance becomes table-stakes across major providers and open-source serving stacks; the differentiator shifts from "can it produce valid JSON" to "how efficiently, and how well does it handle deeply nested or unusual schemas" — I'm not fully confident of every provider's exact current guarantee level and would verify against current documentation |

The throughline: structured outputs moved from a prompting trick, to an application-layer validation-and-retry pattern, to a serving-layer enforcement guarantee — each step removing a class of failure the previous step could only mitigate, not eliminate.
`,

  "why-it-exists": `
Before structured outputs existed as an enforced capability, every team building software around an LLM independently reinvented the same fragile pattern: write a prompt asking for JSON, parse the response, and handle the inevitable cases where the model wrapped its JSON in markdown fences, added a friendly preamble ("Sure, here's the JSON you asked for:"), used a slightly wrong key name, or produced almost-valid JSON with a trailing comma. Multiply this across every team, every prompt, every model version, and you get an enormous amount of duplicated, brittle glue code solving the same underlying problem: text generation is fundamentally unstructured, but software needs structure to act on.

Structured outputs exist to close that gap at the right layer. The insight, mirrored in how **function calling** first solved this for tool arguments specifically: rather than relying on a prompt's wording to coax structure out of the model, give the model (or the serving engine sitting between the model and the caller) an explicit, machine-readable schema, and either constrain generation so it cannot violate that schema, or validate output against it and retry until it complies. This shifts the reliability burden from "hope the prompt is persuasive enough" to "the system architecturally guarantees or mechanically enforces the shape."

The deeper reason this matters for AI engineering specifically: LLMs are increasingly components inside larger programs — agents that call tools, pipelines that extract structured facts, protocols like **Agent-to-Agent (A2A) Protocol** that pass typed data between systems. None of that composition works if the boundary between "LLM output" and "the next piece of code" is a hand-parsed string. Structured outputs are the type system at that boundary.
`,

  "problem-it-solves": `
Structured outputs remove concrete, measurable pains:

- **Parsing fragility.** Without enforcement, a model's JSON output can be wrapped in prose, fenced in markdown, missing a required field, or subtly malformed — structured outputs (whether via schema-constrained decoding or an enforced API mode) eliminate the entire class of "the JSON almost parsed" failures for supported cases.
- **Silent schema drift.** A prompt-only approach has no mechanism to guarantee the model didn't quietly rename a field or change a type between calls; a schema-enforced approach makes the contract explicit and machine-checked, not just described in English in the prompt.
- **Reinventing validation-and-retry logic per project.** Libraries and platform features built around this problem (schema validation with typed models, automatic retry on schema-violation) mean teams don't each hand-roll their own version of "try to parse JSON, catch, retry with an error message appended to the prompt."
- **Unreliable tool/function-calling.** Structured outputs and function calling are two faces of the same problem — an agent deciding to call a tool must produce correctly-typed, correctly-named arguments, and the same enforcement mechanisms (schema validation, constrained decoding) that make general structured output reliable are what make **Tool Calling** reliable specifically.
- **Cross-system interoperability.** When a structured output's shape is a standard (JSON Schema), it can be exchanged between systems built by different teams or vendors — directly relevant to how **Agent-to-Agent (A2A) Protocol** carries structured data Parts, and how **OpenAI Responses API** and other provider APIs define tool schemas in a shared, portable format.

What structured outputs deliberately do **not** solve:

- **Semantic correctness.** A schema-conformant output can still be factually wrong, hallucinated, or a bad answer to the actual question — shape conformance is a necessary, not sufficient, condition for a correct result. Validating content correctness is the job of **AI Evals**, not the structured-output mechanism itself.
- **Arbitrary creative or open-ended generation.** Structured outputs are for extracting or producing data with a known shape; they are the wrong tool (and often actively counterproductive) for free-form writing, brainstorming, or anything where the value is in the model's unconstrained expression.
- **Guaranteeing the constraint mechanism itself is bug-free or fast.** Constrained decoding has real engineering subtlety (see Advanced Concepts) — a naive implementation can meaningfully slow generation, and different providers' guarantees vary in strength and edge-case coverage.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between prompt-only JSON requests, JSON mode, function/tool calling, and schema-enforced structured outputs, and where each sits on the reliability spectrum.
2. Define a JSON Schema (or an equivalent typed model, e.g. a Pydantic class) for a desired LLM output shape and use it to request structured output from a major provider's API.
3. Implement client-side validation and a retry-with-error-feedback loop for cases where enforcement isn't available or isn't guaranteed for a given schema.
4. Explain, at a conceptual level, how constrained/grammar-guided decoding works (token masking against an automaton) and why it provides a stronger guarantee than prompting alone.
5. Design function/tool-calling schemas that are unambiguous and well-scoped enough for a model to select and fill correctly.
6. Identify where structured outputs fit in an agentic pipeline (tool calling, multi-agent data exchange) and connect this to **Tool Calling**, **Agent-to-Agent (A2A) Protocol**, and **PydanticAI**.
7. Recognize that schema conformance is not semantic correctness, and design a validation layer that checks both.
8. Debug common structured-output failures: schema too complex, ambiguous field descriptions, nested-object edge cases, and enum/union handling differences across providers.
`,

  prerequisites: `
- **Required**: basic **Python** (or another language's) familiarity with JSON, and enough type-system comfort to read a JSON Schema or a typed class definition.
- **Required**: a working understanding of what an LLM API call looks like — a prompt in, a completion out — since structured outputs are a variation on that basic request/response shape.
- **Strongly recommended**: read the **Tool Calling** skill alongside or before this one; function/tool calling is the earliest and most widely-deployed application of structured-output enforcement, and understanding it deepens intuition for the general case.
- **Helpful**: familiarity with **Pydantic** or an equivalent data-validation library, since typed-model-driven structured output (define a class, get an instance back) is the dominant ergonomic pattern in application code.
- **Helpful**: basic exposure to **vLLM** or **SGLang**, since understanding how a serving engine enforces constraints at the token level clarifies why schema-enforced structured outputs are a stronger guarantee than prompt-based approaches.

Dependency chain: general LLM API familiarity → **Tool Calling** (recommended alongside) → this page → connects forward to **OpenAI Responses API**, **Agent-to-Agent (A2A) Protocol**, and **PydanticAI** for where structured outputs are used in larger systems.
`,

  "beginner-concepts": `
### The core idea, with no jargon

If you ask an LLM "give me the name and age of this person as JSON," you might get exactly what you want — or you might get it wrapped in an explanation, in markdown fences, or with a field named differently than you expected. Structured outputs are the set of techniques (from careful prompting up to serving-level enforcement) that make the model's response reliably match a shape you define in advance, so your code can parse it without surprises.

### The naive approach, and why it breaks

~~~python
import json

# The fragile, prompt-only approach
prompt = "Extract the name and age from this text as JSON: John is 34 years old."
response_text = call_llm(prompt)   # returns a string

# This frequently fails: markdown fences, a leading "Here's the JSON:",
# a trailing period, or a subtly malformed structure
data = json.loads(response_text)   # raises json.JSONDecodeError often enough to matter
~~~

### JSON mode: a first step up

Many providers offer a "JSON mode" that guarantees the output is at least syntactically valid JSON, without guaranteeing it matches any particular shape:

~~~python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract the name and age as JSON: John is 34 years old."}],
    response_format={"type": "json_object"},   # guarantees valid JSON syntax, not a specific schema
    timeout=30,
)
data = json.loads(response.choices[0].message.content)   # safe to parse -- syntax is guaranteed
print(data)   # shape is still up to the model's interpretation of the prompt
~~~

### Schema-enforced structured output: the real fix

~~~python
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int

# Modern structured-output APIs accept a schema (often derived from a typed class)
# and guarantee the response matches it exactly -- not just "valid JSON somewhere"
response = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extract the name and age: John is 34 years old."}],
    response_format=Person,   # the schema IS the contract
    timeout=30,
)
person = response.choices[0].message.parsed   # an actual Person instance, not a raw string
print(person.name, person.age)
~~~

### Function/tool calling: structured output for actions

~~~python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    },
}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools,
    timeout=30,
)
# The model returns a structured function call -- name + JSON arguments -- instead of prose
call = response.choices[0].message.tool_calls[0]
print(call.function.name, call.function.arguments)   # "get_weather", '{"city": "Paris"}'
~~~

This is the same underlying mechanism as schema-enforced extraction, applied to deciding and describing an action rather than describing an extracted fact — see **Tool Calling** for the full depth of this pattern.
`,

  "intermediate-concepts": `
### JSON Schema as the shared contract

Nearly every modern structured-output mechanism, across providers and open-source serving engines, converges on JSON Schema (or a close variant) as the format for describing the desired shape:

~~~json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "age": {"type": "integer", "minimum": 0},
    "email": {"type": ["string", "null"]}
  },
  "required": ["name", "age"],
  "additionalProperties": false
}
~~~

The additionalProperties: false and explicit required list matter: without them, some enforcement mechanisms allow extra, unrequested fields or treat every field as optional, weakening the guarantee you actually get. Reading a provider's specific documentation on which JSON Schema features it fully supports (nested objects, enums, unions, recursive schemas) is essential, since support is not uniform across providers.

### Typed-model-driven structured output (Pydantic pattern)

~~~python
from pydantic import BaseModel, Field
from typing import Literal

class Invoice(BaseModel):
    invoice_number: str
    total_amount: float = Field(gt=0)
    status: Literal["paid", "unpaid", "overdue"]
    line_items: list[str]

# The typed class IS the schema -- one definition, used for both
# the API request AND validating/parsing the response
response = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[{"role": "user", "content": f"Extract invoice details from: {document_text}"}],
    response_format=Invoice,
)
invoice = response.choices[0].message.parsed
assert isinstance(invoice, Invoice)   # guaranteed, not hoped-for
~~~

This pattern (define a typed class once, get a validated instance back) is the dominant application-layer ergonomic across the ecosystem, exemplified by libraries built specifically around it — see **PydanticAI** for a framework built entirely on this idea.

### The validation-and-retry pattern (for weaker enforcement or open models)

Not every model or provider offers strict schema enforcement. Where it isn't available, or where you're using an open-weight model without built-in constrained decoding, the standard fallback is validate-then-retry:

~~~python
from pydantic import BaseModel, ValidationError
import json

def extract_with_retry(prompt: str, schema: type[BaseModel], max_retries: int = 3) -> BaseModel:
    """Ask, validate, and retry with the validation error fed back to the model --
    a common pattern when strict schema enforcement isn't available."""
    messages = [{"role": "user", "content": prompt}]
    for attempt in range(max_retries):
        response = call_llm(messages)
        try:
            return schema.model_validate(json.loads(response))
        except (json.JSONDecodeError, ValidationError) as exc:
            # Feed the actual error back -- this is far more effective than
            # just re-asking the same question again
            messages.append({"role": "assistant", "content": response})
            messages.append({"role": "user", "content": f"That didn't match the schema: {exc}. Please fix it."})
    raise RuntimeError(f"Failed to get valid {schema.__name__} after {max_retries} attempts")
~~~

### Function/tool calling in more depth: multiple tools and parallel calls

~~~python
tools = [
    {"type": "function", "function": {"name": "get_weather", "parameters": {...}}},
    {"type": "function", "function": {"name": "get_stock_price", "parameters": {...}}},
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Tokyo and the price of AAPL?"}],
    tools=tools,
)
# A capable model can return MULTIPLE tool calls for one user turn --
# your application code must handle 0, 1, or many calls in the response
for call in response.choices[0].message.tool_calls or []:
    result = execute_tool(call.function.name, json.loads(call.function.arguments))
    # ... feed each result back as a tool message, then call the model again
~~~

### Enums, unions, and nested structures

~~~python
from pydantic import BaseModel
from typing import Literal

class Address(BaseModel):
    street: str
    city: str
    country: str

class Customer(BaseModel):
    name: str
    tier: Literal["free", "pro", "enterprise"]   # enum -- constrains to exactly these values
    address: Address                              # nested object
    tags: list[str] = []                           # array, possibly empty
~~~

Nested objects, enums (Literal types), and arrays are all commonly supported, but exact support (especially for deeply nested or recursive schemas, or unions of object types) varies by provider and serving engine — always test the specific shape you need against the specific provider/model you're targeting rather than assuming universal support.
`,

  "advanced-concepts": `
### How constrained decoding actually works

At the token level, constrained/grammar-guided decoding works by intersecting the model's next-token probability distribution with the set of tokens that would keep the generated sequence on a valid path through an automaton representing the schema or grammar. Concretely: the JSON Schema (or a regex, or a context-free grammar) is compiled into a state machine; at each decoding step, the current state determines which tokens are grammatically legal next; the model's raw logits for illegal tokens are masked (set to effectively zero probability) before sampling. This is why schema conformance can be a hard *guarantee* rather than a probabilistic tendency — the model is structurally incapable of sampling an invalid token, not merely unlikely to.

This has real engineering subtlety: naive implementations recompute the full set of valid next tokens at every single decoding step, which can be slow for large vocabularies or complex grammars; efficient implementations (the kind **SGLang** and modern constrained-decoding libraries specifically invest in) precompute and cache transition tables so the per-token masking overhead stays small. This is also exactly why "schema conformance guarantees shape, not content" is true at a mechanical level: the automaton constrains which tokens are grammatically legal, not which ones are true or well-reasoned — a well-formed but factually wrong or nonsensical value can still satisfy every constraint.

### The reliability spectrum, precisely

| Mechanism | Guarantee | Failure mode when it fails |
|---|---|---|
| Prompt-only ("respond in JSON") | None — a strong suggestion at best | Prose wrapping, markdown fences, wrong keys, invalid JSON |
| JSON mode | Syntactically valid JSON | Valid JSON, but any shape — wrong keys, missing fields, wrong types |
| Function/tool calling (provider-enforced) | Arguments match the declared parameter schema | Provider-dependent; historically weaker guarantees before dedicated Structured Outputs features |
| Schema-enforced Structured Outputs (e.g. OpenAI's strict mode) | Output exactly matches the JSON Schema for supported schema features | Falls back or errors for unsupported schema shapes (some provider-specific edge cases) |
| Constrained/grammar-guided decoding at the serving layer (SGLang, Outlines-style libraries) | Output is grammatically guaranteed to match, by construction | Grammar compilation bugs, or slow performance on very complex grammars |

Understanding exactly where a given API call sits on this spectrum — and specifically whether it's a guarantee or a strong tendency — is essential for deciding whether you still need application-level validation as a safety net (you almost always still should, for content correctness if nothing else).

### Schema design as an underrated skill

A schema that's technically valid JSON Schema can still be a poor fit for reliable extraction. Field names and descriptions function as part of the prompt — a field named data with no description gives the model far less signal than total_amount_usd: float # the invoice's total in US dollars, before tax. Overly deep nesting, ambiguous unions (is this object a Cat or a Dog?), and schemas that don't match how the source information is naturally structured all increase the model's error rate even under strict enforcement, because enforcement guarantees the *shape* is legal, not that the model correctly maps ambiguous source content into that shape.

### Streaming structured output

Structured output and token streaming interact in a specific way: a client can stream a JSON object's tokens as they're generated, but the object is only safely parseable once complete (a half-streamed JSON object is, by definition, invalid JSON). Some APIs expose streaming events specifically for structured output (e.g. partial-object deltas with a defined merge semantics) so a UI can render a progressively-filling form rather than waiting for the entire object — this is a meaningfully different design problem from streaming free text token-by-token.

### Structured outputs across a multi-agent boundary

When structured data crosses a boundary between independently-built systems — for instance, a data Part in an **Agent-to-Agent (A2A) Protocol** exchange, or a tool schema shared between an orchestrating agent and a specialist agent — the schema itself becomes a cross-system contract, not just an internal implementation detail. This raises the same versioning and compatibility concerns as any API contract: changing a required field, renaming a key, or tightening a constraint can break a counterpart system that was built against the old schema, exactly as a breaking API change would.

### Security implications of schema-driven behavior

If a schema (or a tool's parameter definitions) is built dynamically from untrusted input rather than defined statically by the application, a maliciously crafted schema could plausibly be used to influence the model's behavior in unintended ways, or in constrained-decoding implementations, to cause excessive resource use via a pathologically complex grammar. See Security for the fuller treatment, and **Prompt Injection Defense** for the broader adversarial context this sits within.
`,

  "internal-working": `
Here is what happens, step by step, when a request with a strict structured-output schema is processed by a provider or serving engine that enforces it via constrained decoding:

~~~mermaid
flowchart TD
    A["Request arrives with a JSON Schema\n(or typed-model-derived schema)"] --> B["Schema compiled into\nan automaton / grammar"]
    B --> C["Model begins generating\ntoken by token"]
    C --> D["At each step: compute the model's\nraw next-token probability distribution"]
    D --> E["Intersect with the automaton's\ncurrently-legal token set"]
    E --> F["Mask illegal tokens\n(set probability to ~0)"]
    F --> G["Sample from the\nremaining legal distribution"]
    G --> H["Update automaton state\nbased on the sampled token"]
    H --> I{"Generation complete?\n(schema fully satisfied)"}
    I -- no --> D
    I -- yes --> J["Return output --\nGUARANTEED to match the schema's shape"]
~~~

1. **Schema compilation.** The JSON Schema (or grammar/regex) is compiled once into a data structure representing which tokens are legal at each possible state — this compilation step is why complex schemas can have nontrivial setup cost, though well-engineered implementations cache this across requests using the same schema.
2. **Token-by-token masking.** At every decoding step, the model's raw output distribution over the vocabulary is intersected with the set of tokens the automaton currently permits; everything else is masked out before sampling.
3. **State transition.** Whichever token is actually sampled (from the legal, masked set) advances the automaton to its next state, narrowing (or changing) the legal token set for the following step.
4. **Guaranteed termination in a valid state.** Generation only stops once the automaton reaches an accepting state matching the full schema — this is the structural reason the output is guaranteed conformant, not merely likely to be.

For providers or setups that instead use validate-and-retry rather than token-level constraint (common with function calling on some models, or with open-weight models lacking constrained-decoding support), the process differs: the model generates freely, the output is parsed and validated against the schema after the fact, and on failure the error is fed back into a new request — a weaker, probabilistic guarantee rather than a structural one, and correspondingly worth treating with more defensive application-side handling.
`,

  architecture: `
A senior engineer thinks about structured outputs at two levels: where enforcement happens in the request/response pipeline, and how application code should be structured around schemas as first-class contracts.

### Where enforcement happens

~~~mermaid
flowchart TB
    App["Application code\n(defines schema, e.g. a Pydantic class)"] --> API["Provider API layer\n(OpenAI Responses API, Anthropic, etc.)"]
    API --> Serve["Serving engine\n(constrained decoding: SGLang, vLLM + Outlines-style libs)"]
    Serve --> Model["The model itself\n(generates token probabilities)"]
    Model --> Serve
    Serve --> API
    API --> App
    App --> Validate["Application-level validation\n(schema parse + semantic checks)"]
    Validate --> Downstream["Downstream code\n(tool execution, database write, next agent call)"]
~~~

Enforcement can happen at the serving-engine layer (strongest guarantee, requires the engine to support it), the provider-API layer (a guarantee the provider makes on your behalf, backed by their own serving infrastructure), or purely at the application layer (validate-and-retry, weakest but always available regardless of provider/model support).

### Application architecture — schemas as first-class contracts

~~~
myapp/
├── src/myapp/
│   ├── schemas/                    # typed models -- the single source of truth for shape
│   │   ├── extraction.py           # e.g. Invoice, Person, ExtractedFact
│   │   └── tools.py                # tool/function parameter schemas
│   ├── llm/
│   │   ├── structured_client.py    # wraps provider calls, always requests schema-enforced output
│   │   └── retry.py                # validate-and-retry fallback for unsupported schemas/models
│   └── validation/
│       └── semantic_checks.py      # content-level validation BEYOND schema conformance
└── tests/
    └── schemas/                    # test fixtures: valid AND deliberately invalid examples per schema
~~~

Rules: schemas live in one place and are imported everywhere they're needed (the API request, the response parser, the test fixtures) — never redefine the same shape as a raw dict in one place and a typed class in another, since drift between them silently reintroduces the exact fragility structured outputs exist to remove. Semantic validation (is this age plausible, is this total amount consistent with the line items) is a separate, explicit layer from schema validation, not conflated with it.
`,

  "data-flow": `
Trace one structured-extraction request end to end, including the fallback path:

~~~mermaid
sequenceDiagram
    participant App as Application
    participant API as Provider API
    participant Engine as Serving Engine
    participant Val as Validation Layer

    App->>API: request + schema (typed model or JSON Schema)
    API->>Engine: compile schema into a grammar/automaton
    Engine->>Engine: generate token-by-token, masking illegal tokens
    Engine-->>API: schema-conformant output
    API-->>App: parsed/typed result
    App->>Val: semantic validation (beyond shape)
    alt semantically valid
        Val-->>App: proceed with validated data
    else semantically invalid (e.g. implausible value)
        Val-->>App: reject, log, or trigger a targeted re-ask
    end

    Note over App,Engine: --- Fallback path: schema unsupported or model lacks enforcement ---
    App->>API: request (no strict enforcement available)
    API-->>App: freeform text response
    App->>App: attempt json.loads + schema.model_validate
    alt parse/validation fails
        App->>API: retry with the validation error appended to the prompt
        API-->>App: new attempt
    end
~~~

The critical thing this trace makes visible: even with the strongest available enforcement, a second, independent validation step (semantic checks, not just schema checks) sits after parsing — schema conformance and content correctness are different questions, answered by different layers, and conflating them is the most common structured-output design mistake.
`,

  "production-usage": `
### Where it actually gets deployed

Structured outputs are used in essentially every production LLM system that hands a model's output to code rather than directly to a human reader: tool-calling agents (deciding which tool to invoke and with what arguments), extraction pipelines (pulling typed facts out of documents, emails, or transcripts), classification tasks reframed as a constrained enum choice, and any cross-system data exchange where the shape needs to be a shared, checkable contract (an **Agent-to-Agent (A2A) Protocol** data Part, a webhook payload generated by an LLM).

### Typical implementation choices

- **Provider-native structured outputs** (e.g. the OpenAI Structured Outputs feature, used via the **OpenAI Responses API** or Chat Completions) for hosted-model workloads, since it requires no additional infrastructure and offers a strong, provider-backed guarantee for supported schemas.
- **Serving-engine-level constrained decoding** (**SGLang**, or constrained-decoding libraries layered onto **vLLM**) for self-hosted open-weight model deployments, giving the same class of structural guarantee without depending on a hosted provider's specific feature.
- **Typed-model libraries** (Pydantic-based patterns, or a dedicated framework like **PydanticAI**) as the application-layer ergonomic regardless of which enforcement mechanism sits underneath — define the shape once as a typed class, use it for both the request and the response parsing.
- **Validate-and-retry** as a universal fallback, always implemented even when stronger enforcement is available, since provider-side guarantees can have edge cases (unsupported schema features, rare API errors) worth defending against.

### Configuration guidance

Keep schemas as flat and unambiguous as practical for the extraction task — every added layer of nesting, every union type, and every optional field is a place where even strict enforcement's guarantee ("valid shape") diverges further from your actual goal ("correct content"). Field descriptions are not optional documentation; they are part of the effective prompt and measurably affect extraction accuracy, so invest real effort in writing clear ones. I'm not confident of every provider's exact current schema-feature support matrix (nested depth limits, union handling, recursive schema support) — verify against current documentation for your specific provider and model before committing to a complex schema design in production.
`,

  "industry-examples": `
- **OpenAI** shipped Structured Outputs as a named, dedicated feature (distinct from the earlier, weaker JSON mode) specifically because function calling and JSON mode alone weren't reliable enough for production agentic use cases at scale — a direct acknowledgment from a major provider that schema conformance needed to move from "usually works" to "guaranteed for supported schemas."
- **Agent framework vendors** (**LangGraph**, CrewAI, and others) build tool-calling and structured-output support into their core abstractions, since nearly every agentic pattern (planning, tool selection, multi-step delegation) depends on the model reliably producing a parseable decision at each step.
- **PydanticAI** and similar frameworks are built around the specific thesis that typed-model-driven structured output (define a Pydantic class, get a validated instance back) should be the default way applications interact with LLMs at all, not a special case reserved for extraction tasks.
- **SGLang**'s engineering investment specifically in fast constrained decoding reflects industry recognition that structured-output-heavy workloads (agents, extraction pipelines) are common and important enough to warrant dedicated serving-engine optimization, not just an application-layer workaround.

I don't have verified, specific, attributable production metrics for named companies beyond these general, well-documented platform and framework decisions, and would rather flag that honestly than invent a number.
`,

  "best-practices": `
1. **Always define the schema once, as a typed model, and reuse it for both the request and response parsing** — never let the request-side shape and the response-parsing shape drift independently.
2. **Write real field descriptions, not just names.** Descriptions are part of the effective prompt and measurably improve extraction accuracy, especially for ambiguous or domain-specific fields.
3. **Keep schemas as flat and unambiguous as the task allows.** Every layer of nesting or every union type is a place where even strict shape-enforcement diverges further from your actual correctness goal.
4. **Always validate semantically, even with strict schema enforcement.** Shape conformance guarantees the JSON matches; it never guarantees the content is true, sensible, or complete.
5. **Implement a validate-and-retry fallback even when stronger enforcement is available**, since provider-side guarantees have edge cases and API failures happen.
6. **Prefer provider-native or serving-engine-level enforcement over pure prompting** whenever it's available for your model and schema — it's a categorically stronger guarantee, not just a convenience.
7. **Version schemas deliberately when they cross a system boundary** (a tool shared across teams, a data Part in an **Agent-to-Agent (A2A) Protocol** exchange) — treat a schema change with the same rigor as any breaking API change.
8. **Handle zero, one, and multiple tool calls in a single response explicitly** when using function/tool calling — a capable model can return several calls for one turn, and code that assumes exactly one will break.
9. **Test schemas with deliberately invalid examples, not just happy-path ones**, so your validation layer's actual behavior on malformed input is verified, not assumed.
10. **Never build a schema (or tool parameters) dynamically from untrusted input** without validation — a maliciously crafted schema is a real, if underappreciated, attack surface.
`,

  "anti-patterns": `
### Prompt-only "respond in JSON" with no enforcement or validation

~~~python
# WRONG: hope the model complies, parse blindly
prompt = "Respond only in JSON with name and age."
data = json.loads(call_llm(prompt))   # will eventually break in production

# RIGHT: use schema-enforced structured output, or at minimum validate-and-retry
response = client.beta.chat.completions.parse(model=m, messages=[...], response_format=Person)
person = response.choices[0].message.parsed
~~~

### Treating schema conformance as content correctness

~~~python
# WRONG: assume a schema-valid extraction is automatically correct
invoice = response.choices[0].message.parsed
save_to_database(invoice)   # never checked if the numbers actually make sense

# RIGHT: validate semantics separately, after shape validation succeeds
invoice = response.choices[0].message.parsed
if invoice.total_amount != sum(item.price for item in invoice.line_items):
    flag_for_human_review(invoice)   # shape-valid, but semantically suspicious
save_to_database(invoice)
~~~

### Vague field names and missing descriptions

~~~python
# WRONG: the model has almost no signal about what "data" or "val" should contain
class Result(BaseModel):
    data: str
    val: float

# RIGHT: names and descriptions ARE part of the prompt
class Result(BaseModel):
    customer_full_name: str
    total_amount_usd: float = Field(description="Total invoice amount in US dollars, before tax")
~~~

### Assuming exactly one tool call per response

~~~python
# WRONG: crashes or silently drops calls when the model returns 0 or multiple
call = response.choices[0].message.tool_calls[0]

# RIGHT: handle the actual possible range explicitly
calls = response.choices[0].message.tool_calls or []
for call in calls:
    handle_tool_call(call)
~~~

### No fallback when strict enforcement isn't available for a schema

Relying entirely on provider-native strict enforcement, with no validate-and-retry code path at all, means the application breaks outright the moment a schema feature isn't supported, a model is swapped for one without the same guarantee, or a provider has a transient issue — always keep the fallback path implemented and tested, even if it's rarely exercised.

### Building schemas dynamically from untrusted input

Constructing a tool's parameter schema (or a response-format schema) from data supplied by an end user or an external, untrusted system, without validation, opens a real attack surface — a maliciously crafted schema could influence model behavior in unintended ways or, in constrained-decoding setups, cause excessive resource consumption via a pathologically complex grammar.
`,

  performance: `
### Measure first

~~~python
import time

def timed_structured_call(client, schema, prompt: str) -> tuple[object, float]:
    start = time.perf_counter()
    response = client.beta.chat.completions.parse(
        model="gpt-4o", messages=[{"role": "user", "content": prompt}], response_format=schema,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000
    return response.choices[0].message.parsed, elapsed_ms
~~~

Never assume structured-output enforcement is free — measure latency for schema-enforced calls against unconstrained calls of similar length, since grammar compilation and per-token masking do carry real (if often small) overhead, and complex schemas can carry more than simple ones.

### The optimization hierarchy

1. **Simplify the schema before optimizing the serving layer.** A flatter, less deeply-nested schema is both more accurate (see Best Practices) and typically cheaper to enforce than a complex one — this is the highest-leverage lever, and it's a design decision, not an infrastructure one.
2. **Cache compiled grammars/automatons across requests using the same schema.** Well-engineered constrained-decoding implementations (in **SGLang** and similar) do this automatically; if you're building custom constrained-decoding infrastructure, this is the single most impactful optimization.
3. **Prefer provider/serving-engine-level enforcement over validate-and-retry** wherever available — retry loops cost an entire additional round trip (and additional tokens) per failed attempt, which is categorically more expensive than a single enforced call.
4. **Batch independent extraction requests concurrently** rather than sequentially, exactly as with any other LLM call pattern (see the **vLLM** and **SGLang** skills' own performance guidance on continuous batching).
5. **Avoid unnecessarily large max-token budgets for structured extraction tasks.** A well-scoped schema usually needs far fewer output tokens than a typical free-form generation, and an oversized budget can add unnecessary latency headroom.

### What structured outputs are not the right lever for

If your bottleneck is the model's raw reasoning speed or the underlying serving engine's throughput, schema design won't fix that — that's the concern of **vLLM**'s or **SGLang**'s own performance sections. Structured-output-specific performance work is about grammar complexity and enforcement-mechanism overhead specifically, layered on top of whatever serving-engine performance you already have.
`,

  scalability: `
Structured outputs don't introduce a fundamentally new scalability axis beyond general LLM serving — the considerations are the same ones covered in **vLLM** and **SGLang**, with one structured-output-specific nuance worth calling out.

### The grammar-compilation-cache nuance

Because compiling a JSON Schema into an automaton has a real (if often small) cost, a serving engine handling many different schemas across different requests benefits from caching compiled grammars, keyed by schema content — a workload that reuses the same handful of schemas repeatedly (a fixed set of tool definitions, a small number of extraction shapes) benefits far more from this caching than a workload that constructs a novel, one-off schema for every single request.

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| High-cardinality, ad hoc schemas (many unique shapes, rarely reused) | Grammar-compilation caching helps less here; consider whether schemas can be parameterized/reused instead of regenerated per request |
| A small, fixed set of schemas reused across huge request volume | Grammar-compilation caching (built into modern constrained-decoding serving engines) gives a large win |
| General throughput/latency at scale | This is a serving-engine concern — see **vLLM** and **SGLang**'s own Scalability sections |
| Deeply nested or recursive schemas slowing enforcement | Simplify the schema design (see Performance); this is a design lever, not purely an infrastructure one |

The senior framing: structured outputs ride on top of whatever serving-engine scalability story you already have — the specific thing to watch for is schema diversity and complexity, not a separate infrastructure axis.
`,

  security: `
### Structured-output-specific attack surface

Structured outputs introduce a few risks distinct from (though related to) general LLM security — see **AI Red Teaming** for the broader adversarial-testing practice, and **Prompt Injection Defense** for the closely related content-level risk.

1. **Dynamically-constructed schemas from untrusted input.** If a schema (or a tool's parameter definitions) is built from data supplied by an end user or an external system rather than defined statically by the application, a maliciously crafted schema could plausibly influence model behavior in unintended ways, or — in constrained-decoding implementations — cause excessive resource consumption via a pathologically complex or deeply recursive grammar (a form of resource-exhaustion attack specific to this mechanism).
2. **Trusting schema-conformant content as safe or correct.** A schema only guarantees shape; it says nothing about whether the content is safe to act on. A tool call's arguments, even perfectly typed, could still carry an injected instruction or a manipulated value if the underlying model was influenced by adversarial input upstream — validate content, not just shape, before executing consequential actions (see **Prompt Injection Defense**).
3. **Tool-calling as an expanded action surface.** Function/tool calling turns a model's output into something that can trigger real side effects (an API call, a database write, a purchase) — the structured-output guarantee only ensures the *shape* of that action request is well-formed; authorization, rate limiting, and human approval for consequential actions remain the application's responsibility entirely.
4. **Schema-driven information disclosure.** An overly permissive schema (e.g. accepting arbitrary additional properties, or a union type that's broader than necessary) can allow a manipulated model to smuggle unexpected data through a structured-output channel that a downstream system trusts implicitly because it's "just validated JSON."

### Concrete defenses

- Never build tool/response schemas dynamically from untrusted input without independent validation of the resulting schema itself.
- Set additionalProperties: false and explicit required lists wherever your enforcement mechanism supports it, to prevent unexpected fields from passing through.
- Treat any tool call's arguments as untrusted input requiring authorization and sanity checks before execution, exactly as you would validate any external API request — schema conformance is not an authorization check.
- Require human approval for any consequential action (payments, irreversible changes, sending communications) triggered by a structured tool call, rather than granting full automated execution by default.
- Apply the same content-level moderation and prompt-injection defenses to structured-output content as to free-text output — see **Prompt Injection Defense**.

See the dedicated **AI Red Teaming** and **Prompt Injection Defense** skills for the broader adversarial-testing and defense practices this connects to.
`,

  testing: `
Testing structured-output-dependent code spans schema-conformance testing, semantic-validation testing, and resilience testing for the fallback path.

~~~python
# tests/test_extraction.py
import pytest
from pydantic import ValidationError
from myapp.schemas.extraction import Invoice
from myapp.llm.structured_client import extract_invoice

def test_valid_extraction_parses(mock_llm_response):
    mock_llm_response(schema=Invoice, content={
        "invoice_number": "INV-001", "total_amount": 150.0,
        "status": "unpaid", "line_items": ["Widget A", "Widget B"],
    })
    invoice = extract_invoice("some invoice text")
    assert isinstance(invoice, Invoice)
    assert invoice.status == "unpaid"

def test_invalid_enum_value_is_rejected(mock_llm_response):
    # Deliberately invalid: "status" isn't one of the allowed Literal values
    mock_llm_response(schema=Invoice, content={
        "invoice_number": "INV-002", "total_amount": 50.0,
        "status": "not_a_real_status", "line_items": [],
    })
    with pytest.raises(ValidationError):
        extract_invoice("some invoice text")

def test_semantic_validation_flags_inconsistent_total(valid_invoice_with_mismatched_total):
    # Schema-valid but semantically suspicious -- a DIFFERENT check than schema validation
    from myapp.validation.semantic_checks import check_invoice_consistency
    with pytest.raises(ValueError, match="total does not match line items"):
        check_invoice_consistency(valid_invoice_with_mismatched_total)

def test_retry_fallback_succeeds_after_one_failure(mock_llm_sequence):
    # First attempt malformed, second attempt valid -- confirm the retry loop recovers
    mock_llm_sequence(["not valid json at all", '{"name": "John", "age": 34}'])
    from myapp.llm.retry import extract_with_retry
    from myapp.schemas.extraction import Person
    person = extract_with_retry("extract name and age", Person, max_retries=2)
    assert person.name == "John"
~~~

### The senior testing doctrine for structured outputs

- **Test both the happy path and deliberately invalid/malformed model outputs.** A test suite that only exercises well-formed responses never verifies your validation layer actually catches anything.
- **Test schema validation and semantic validation as separate concerns**, with separate test cases — conflating them hides which layer actually caught a given problem.
- **Test the retry/fallback path explicitly**, including the case where all retries are exhausted, so failure is loud and traceable rather than silent.
- **Test tool-calling code against 0, 1, and multiple returned tool calls**, since real model behavior varies and code that assumes exactly one will eventually break in production.
- **Never depend on a real model call in fast unit tests** — mock the LLM response layer so tests are deterministic and don't cost money or add flakiness; reserve real-model tests for a separate, slower integration suite.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check whether enforcement actually applied.** Many "the shape is wrong" bugs are actually "I requested JSON mode, not schema-enforced Structured Outputs" or "this particular schema feature isn't supported by this provider/model" — confirm which mechanism was actually active for the failing request before assuming a deeper bug.
2. **Log the raw, unparsed model output alongside the parsed result.** When a schema-valid-but-wrong result appears, the raw output is what tells you whether the model misunderstood the task (a prompt/schema-design problem) versus a parsing bug in your own code.
3. **Isolate the schema from the prompt.** Test the exact same schema against a trivial, unambiguous prompt to confirm the schema itself compiles and enforces correctly, before assuming a failure is schema-related rather than prompt-related.
4. **Check field descriptions and naming first when extraction is schema-valid but semantically wrong.** This is overwhelmingly the most common root cause of "the shape is right but the content is off" — a vague field name or missing description gives the model too little signal.
5. **Reproduce with the simplest possible schema.** Strip a complex, nested, or union-heavy schema down to a minimal reproduction before assuming a bug in the enforcement mechanism itself versus a genuine edge case in a complex schema shape.
6. **Check for a version/provider mismatch.** Structured-output feature support (which schema features are fully enforced, how unions/enums are handled) varies across providers and even across model versions from the same provider — verify current documentation for the exact model you're targeting rather than assuming parity with a different model or an earlier version.
7. **For tool-calling specifically, check the full tool_calls array, not just the first element.** A surprising number of "the tool call is missing" bugs are actually "there were two tool calls and the code only looked at index 0."
`,

  monitoring: `
### The metrics that matter

~~~python
from prometheus_client import Counter, Histogram

SCHEMA_VALIDATION = Counter(
    "structured_output_validation_total", "Schema validation attempts", ["schema", "result"]
)  # result: success | schema_invalid | retry_exhausted
SEMANTIC_VALIDATION = Counter(
    "structured_output_semantic_check_total", "Semantic validation checks", ["schema", "result"]
)
RETRY_COUNT = Histogram(
    "structured_output_retries", "Number of retries needed before success", ["schema"]
)

def on_extraction_complete(schema_name: str, schema_valid: bool, semantically_valid: bool, retries: int):
    SCHEMA_VALIDATION.labels(schema=schema_name, result="success" if schema_valid else "schema_invalid").inc()
    if schema_valid:
        SEMANTIC_VALIDATION.labels(schema=schema_name, result="pass" if semantically_valid else "fail").inc()
    RETRY_COUNT.labels(schema=schema_name).observe(retries)
~~~

### What to track and why

- **Schema-validation failure rate, per schema.** A rising rate for one specific schema is the earliest signal that either the schema design has a problem (too ambiguous, too complex) or a model/provider change silently broke previously-working enforcement.
- **Semantic-validation failure rate, separate from schema-validation failure rate.** This tracks a genuinely different thing: content correctness. A schema can be 100% valid while semantic checks fail at a meaningful rate, and conflating the two metrics hides that distinction.
- **Retry count distribution, for any validate-and-retry fallback path.** A rising average retry count is a leading indicator of degrading extraction reliability before it becomes an outright failure spike.
- **Tool-call count distribution (0, 1, many) per request**, if using function/tool calling, to catch code that silently assumes exactly one call and drops the rest.
- **Latency specifically for schema-enforced calls versus unconstrained calls**, to catch cases where a complex schema is adding meaningful overhead worth simplifying.

Alert on schema-validation failure rate and semantic-validation failure rate as two distinct signals, mirroring the general RED-metrics philosophy of tracking symptoms users/downstream systems actually experience, not just aggregate throughput.
`,

  deployment: `
### A representative production pattern (FastAPI + provider-native structured outputs + fallback)

~~~python
# app/extraction_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ValidationError
import json

app = FastAPI()

class ExtractionRequest(BaseModel):
    text: str

class Person(BaseModel):
    name: str
    age: int

@app.post("/extract/person")
async def extract_person(req: ExtractionRequest):
    try:
        # Primary path: provider-native schema enforcement
        response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[{"role": "user", "content": f"Extract name and age: {req.text}"}],
            response_format=Person,
            timeout=15,
        )
        return response.choices[0].message.parsed
    except Exception:
        # Fallback path: validate-and-retry, exercised only when the primary path fails --
        # keeping BOTH paths implemented and tested is the point, not just the happy one
        for attempt in range(2):
            raw = call_llm_freeform(f"Extract name and age as JSON: {req.text}")
            try:
                return Person.model_validate(json.loads(raw))
            except (json.JSONDecodeError, ValidationError):
                continue
        raise HTTPException(502, "Failed to extract a valid Person after fallback retries")
~~~

Per-line rationale: the primary path uses the strongest available enforcement; the except wraps the entire primary call so any provider-side failure (not just a validation error) triggers the fallback; the fallback itself is bounded (2 attempts, not unbounded) so a persistently failing extraction fails loudly with a clear error rather than retrying forever; both paths are exercised by the test suite (see Testing), not just the primary one.

### Deployment topology notes

Structured-output-dependent services deploy exactly like any other LLM-backed service (see **vLLM**, **SGLang**, or the relevant hosted-provider integration patterns) — there's no separate infrastructure specific to structured outputs beyond ensuring your serving engine or provider choice actually supports the enforcement level your schemas need. If self-hosting, verify your chosen serving engine's constrained-decoding support explicitly rather than assuming parity with a hosted provider's guarantees.
`,

  "production-checklist": `
Before a structured-output-dependent feature takes real production traffic:

- [ ] Schema defined once as a typed model, imported everywhere it's needed (request, response parsing, tests)
- [ ] Field names and descriptions written deliberately, not left as placeholder or single-word names
- [ ] Semantic validation implemented as a distinct layer from schema validation, with its own test cases
- [ ] Validate-and-retry fallback implemented and tested, even when stronger provider-native enforcement is the primary path
- [ ] Tool-calling code (if applicable) handles zero, one, and multiple returned tool calls explicitly
- [ ] Schemas never constructed dynamically from untrusted input without independent validation
- [ ] additionalProperties: false and explicit required fields set wherever the enforcement mechanism supports them
- [ ] Human approval gate in place for any consequential action triggered by a structured tool call
- [ ] Schema-validation and semantic-validation failure rates instrumented as separate metrics
- [ ] Retry-count distribution monitored for the fallback path
- [ ] Schema versioning discipline in place for any schema shared across a system boundary (a tool, an A2A data Part)
- [ ] Provider/model-specific schema feature support verified against current documentation, not assumed
- [ ] Load tested with realistic schema complexity and request volume
`,

  "common-mistakes": `
1. **Treating schema conformance as content correctness**, skipping semantic validation entirely because "the JSON parsed fine."
2. **Using vague field names with no descriptions**, giving the model far less signal than a well-documented schema would, and quietly degrading extraction accuracy.
3. **Assuming exactly one tool call per response**, breaking the moment a capable model returns zero or several for a single turn.
4. **No validate-and-retry fallback at all**, relying entirely on provider-native enforcement and breaking outright on any unsupported schema feature or transient provider issue.
5. **Building schemas dynamically from untrusted input** without independent validation, opening a real (if underappreciated) attack surface.
6. **Overly deep nesting or ambiguous union types** in a schema, increasing the model's real-world error rate even under strict shape enforcement.
7. **Conflating JSON mode with schema-enforced Structured Outputs** — assuming "valid JSON" means "matches my expected shape," when JSON mode guarantees only the former.
8. **Not versioning schemas that cross a system boundary**, breaking a counterpart system (a partner's tool integration, an **Agent-to-Agent (A2A) Protocol** exchange) with an unannounced schema change.
9. **Granting full automated execution for consequential tool calls** with no human approval gate, treating "the arguments are well-typed" as equivalent to "this action is safe to take automatically."
10. **Never testing with deliberately invalid model outputs**, so the validation layer's actual failure-handling behavior is unverified until it fails in production.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| json.JSONDecodeError on a "should be JSON" response | Prompt-only request with no enforcement; model wrapped output in prose or markdown fences | Switch to provider-native structured output or JSON mode, or add prompt-level cleanup + retry |
| Schema validation fails despite "valid JSON" | JSON mode was used instead of schema-enforced Structured Outputs — JSON mode guarantees syntax, not shape | Switch to strict schema enforcement (response_format=YourModel), not just json_object mode |
| Extraction is schema-valid but factually wrong | No semantic validation layer, or vague/ambiguous field names and descriptions | Add explicit semantic checks; improve field names/descriptions with concrete guidance |
| tool_calls is empty when a call was expected | Model chose not to call a tool (task didn't require one), or tool description was unclear | Check message.content for a text response instead; improve tool descriptions if the model should have called it |
| tool_calls has multiple entries and code only used the first | Application code assumed exactly one call per response | Iterate over all returned tool calls explicitly |
| Deeply nested/recursive schema errors or times out | Schema too complex for the enforcement mechanism's current support | Flatten the schema; check current provider/serving-engine documentation for supported nesting depth |
| Different behavior across two models for the "same" schema | Structured-output feature support varies by provider and model version | Verify current per-model documentation; don't assume parity across models |
| Retry loop never terminates / exhausts without success | No bounded retry count, or the error fed back to the model isn't specific enough to help it correct course | Bound retries explicitly; feed back the actual validation error message, not a generic "try again" |

The general habit: log the raw, unparsed model output alongside any validation failure — nearly every one of these symptoms is diagnosable once you can see exactly what the model actually produced.
`,

  faqs: `
**Q: Is JSON mode the same thing as Structured Outputs?**
No. JSON mode guarantees the response is syntactically valid JSON, with no guarantee about its shape. Structured Outputs (as a dedicated, stricter feature) guarantees the response matches a specific schema you supply — a categorically stronger guarantee, not just a stylistic variant.

**Q: Does schema-enforced output guarantee the content is correct?**
No — it guarantees the shape. A schema-conformant response can still be factually wrong, hallucinated, or a poor answer to the underlying question. Always add semantic validation as a separate layer.

**Q: Do I need constrained decoding, or is provider-native Structured Outputs enough?**
For hosted-provider workloads, provider-native Structured Outputs is usually sufficient and requires no additional infrastructure. Constrained decoding at the serving-engine layer (via **SGLang** or similar) matters most when self-hosting open-weight models, where you need the same class of guarantee without depending on a hosted provider.

**Q: How is function/tool calling related to structured outputs generally?**
They're the same underlying mechanism applied to different purposes: a tool call's arguments are a structured output describing an action to take, while a general extraction schema describes a fact to record. The enforcement techniques (schema validation, constrained decoding) are shared between them.

**Q: Should I still validate on the client side if the provider guarantees schema conformance?**
Yes, for two reasons: semantic correctness is never guaranteed by shape enforcement, and provider-side guarantees can have edge cases (unsupported schema features, API errors) worth defending against with an independent check.

**Q: What's the biggest practical lever for improving extraction accuracy, beyond enforcement mechanism?**
Schema design — specifically, clear field names and real descriptions, and keeping nesting/unions as simple as the task genuinely requires. Enforcement guarantees shape; good schema design is what actually helps the model produce the *right* content within that shape.

**Q: Can structured outputs be streamed?**
Some APIs support streaming partial structured-output deltas (with defined merge semantics) so a UI can render a progressively-filling form, but the object is only safely parseable as valid JSON once generation completes — this is a different design problem than streaming free text token-by-token.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between JSON mode and schema-enforced Structured Outputs?* JSON mode guarantees syntactically valid JSON with any shape; schema-enforced Structured Outputs guarantees the output matches a specific, developer-supplied schema.
2. *What is function/tool calling, and how does it relate to structured outputs?* A mechanism where the model returns a structured function name plus typed arguments instead of free text; it's the same enforcement machinery as general structured extraction, applied to describing an action.
3. *Why should you still validate a schema-enforced response's content?* Because shape conformance is not content correctness — a well-formed but factually wrong value can still satisfy every schema constraint.
4. *What is the validate-and-retry pattern?* Attempt extraction, validate the result against a schema, and if it fails, feed the specific validation error back to the model and retry, up to a bounded number of attempts.
5. *Why do field names and descriptions matter for structured extraction?* They function as part of the effective prompt — a vague field name gives the model far less signal than a clear name with a description, measurably affecting extraction accuracy even under strict shape enforcement.

**Senior:**

6. *Explain, mechanically, how constrained/grammar-guided decoding enforces a schema.* The schema is compiled into an automaton; at each decoding step, the model's next-token probability distribution is intersected with the set of tokens currently legal per the automaton's state, illegal tokens are masked to ~0 probability, and the sampled token advances the automaton — generation only completes once an accepting state is reached, making conformance a structural guarantee rather than a probabilistic tendency.
7. *Where does structured-output enforcement sit on the reliability spectrum, from weakest to strongest?* Prompt-only request (no guarantee) → JSON mode (valid syntax only) → provider-native function/tool calling → schema-enforced Structured Outputs (strict shape guarantee for supported schemas) → serving-engine-level constrained decoding (structural guarantee by construction).
8. *Why might a schema-valid tool call still be dangerous to execute automatically?* Schema conformance only guarantees argument shape, not that the values are safe, authorized, or uncorrupted by upstream prompt injection — consequential actions need independent authorization checks and, often, human approval, not just type validation.
9. *What's a security risk specific to dynamically-constructed schemas?* If a schema (or tool parameters) is built from untrusted input rather than defined statically, a maliciously crafted schema could influence model behavior unexpectedly, or in constrained-decoding systems, cause resource exhaustion via a pathologically complex grammar.
10. *How should schema versioning be handled when a schema crosses a system boundary (e.g. an A2A data Part or a shared tool definition)?* With the same rigor as any breaking API change — changing a required field, renaming a key, or tightening a constraint can break a counterpart system built against the old schema, so version and communicate changes deliberately.
11. *Why is grammar-compilation caching important for a serving engine handling structured-output requests at scale?* Compiling a schema into an automaton has real cost; caching compiled grammars keyed by schema content avoids repeating that cost on every request for workloads that reuse a small, fixed set of schemas, which is the common case for tool-calling and extraction pipelines.
12. *Design a structured-extraction service that must work even if the provider's strict-enforcement feature is temporarily unavailable.* Implement a primary path using provider-native or serving-engine enforcement, wrapped in an exception handler that falls back to a bounded validate-and-retry loop using freeform generation, with both paths tested and monitored via separate schema-validation and semantic-validation metrics.
`,

  "coding-questions": `
### 1. A generic validate-and-retry extractor (tests resilience-pattern reasoning)

~~~python
import json
from pydantic import BaseModel, ValidationError
from typing import TypeVar

T = TypeVar("T", bound=BaseModel)

def extract_structured(
    prompt: str,
    schema: type[T],
    call_llm_fn,
    max_retries: int = 3,
) -> T:
    """Generic validate-and-retry structured extraction -- works regardless of
    whether the underlying provider offers strict schema enforcement."""
    messages = [{"role": "user", "content": prompt}]
    last_error = None
    for attempt in range(max_retries):
        raw = call_llm_fn(messages)
        try:
            data = json.loads(raw)
            return schema.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as exc:
            last_error = exc
            # Feed the SPECIFIC error back -- far more effective than a generic re-ask
            messages.append({"role": "assistant", "content": raw})
            messages.append({
                "role": "user",
                "content": f"That response was invalid: {exc}. Return ONLY valid JSON matching the required schema.",
            })
    raise RuntimeError(f"Failed to extract valid {schema.__name__} after {max_retries} attempts: {last_error}")
~~~

Complexity: O(max_retries) LLM calls in the worst case. Follow-up: add exponential backoff between retries, and track retry count as a metric (see Monitoring) to detect a schema that's systematically hard for the model to satisfy.

### 2. A tool-call dispatcher handling zero, one, and multiple calls (tests robustness reasoning)

~~~python
import json
from dataclasses import dataclass

@dataclass
class ToolResult:
    call_id: str
    name: str
    result: object | None
    error: str | None = None

def dispatch_tool_calls(response, tool_registry: dict) -> list[ToolResult]:
    """Handle the real range of possible tool-calling responses: zero calls
    (the model answered directly), one call, or several in parallel."""
    calls = response.choices[0].message.tool_calls or []
    results = []
    for call in calls:
        handler = tool_registry.get(call.function.name)
        if handler is None:
            results.append(ToolResult(call.id, call.function.name, None, error="unknown tool"))
            continue
        try:
            args = json.loads(call.function.arguments)   # schema-valid, but still validate before executing
            # Authorization/safety check belongs HERE, before execution -- schema
            # validity is not the same as "safe to run"
            if not is_authorized(call.function.name, args):
                results.append(ToolResult(call.id, call.function.name, None, error="not authorized"))
                continue
            result = handler(**args)
            results.append(ToolResult(call.id, call.function.name, result))
        except Exception as exc:
            results.append(ToolResult(call.id, call.function.name, None, error=str(exc)))
    return results
~~~

Complexity: O(number of tool calls). Follow-up: extend to run independent tool calls concurrently (asyncio.gather) rather than sequentially, and add a per-tool timeout so one slow tool doesn't stall the whole batch.

### 3. A schema-consistency semantic validator (tests the shape-vs-content distinction directly)

~~~python
from pydantic import BaseModel

class LineItem(BaseModel):
    description: str
    price: float
    quantity: int

class Invoice(BaseModel):
    invoice_number: str
    total_amount: float
    line_items: list[LineItem]

def validate_invoice_semantics(invoice: Invoice, tolerance: float = 0.01) -> list[str]:
    """Schema validation already guarantees Invoice's SHAPE is correct.
    This checks whether the CONTENT is internally consistent -- a different,
    complementary concern that shape validation can never catch."""
    issues = []
    computed_total = sum(item.price * item.quantity for item in invoice.line_items)
    if abs(computed_total - invoice.total_amount) > tolerance:
        issues.append(
            f"total_amount ({invoice.total_amount}) does not match "
            f"sum of line items ({computed_total:.2f})"
        )
    if not invoice.line_items:
        issues.append("invoice has zero line items -- likely an incomplete extraction")
    if invoice.total_amount < 0:
        issues.append("total_amount is negative -- implausible for an invoice")
    return issues

# A schema-valid Invoice can still fail every one of these checks
invoice = Invoice(invoice_number="INV-1", total_amount=999.0, line_items=[
    LineItem(description="Widget", price=10.0, quantity=2),
])
print(validate_invoice_semantics(invoice))
# ["total_amount (999.0) does not match sum of line items (20.00)"]
~~~

Complexity: O(number of line items). Follow-up: decide the right action when semantic issues are found — auto-reject, flag for human review, or trigger a targeted re-extraction that includes the specific inconsistency in the retry prompt.
`,

  "hands-on-labs": `
### Lab 1 — From prompt-only to schema-enforced (beginner, ~1h)
Write a simple "extract name and age" prompt-only implementation, observe it fail on a handful of adversarial inputs (extra prose, markdown fences), then rewrite it using a provider's schema-enforced structured output feature and confirm it no longer fails on the same inputs. Skills: viscerally understanding the reliability gap enforcement closes.

### Lab 2 — Build a validate-and-retry fallback (intermediate, ~2h)
Implement the generic extract_structured function from Coding Questions, and test it against a mocked LLM that fails validation on its first N attempts before succeeding, confirming the retry loop recovers correctly and fails loudly after exhausting retries. Skills: resilience-pattern implementation, schema validation with Pydantic.

### Lab 3 — A tool-calling agent with authorization checks (advanced, ~3h)
Build a small agent that can call two or three tools (e.g. a weather lookup and a calculator), using the dispatch_tool_calls pattern from Coding Questions, with an explicit authorization check before executing any tool and a human-approval gate for one deliberately "consequential" tool. Skills: **Tool Calling** depth, the shape-vs-safety distinction.

### Lab 4 — Schema and semantic validation as two layers, with monitoring (production, ~3h)
Build an extraction service (e.g. invoice or resume parsing) with a typed schema, a semantic-consistency validator (like validate_invoice_semantics), and Prometheus metrics tracking schema-validation and semantic-validation failure rates separately. Deliberately feed it a mix of well-formed-but-wrong and malformed inputs, and confirm your dashboard distinguishes the two failure modes clearly. Skills: the full production discipline this page teaches, applied end to end.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate this skill to employers:

1. **Resilient document-extraction pipeline** — a service extracting typed data (invoices, resumes, or contracts) from unstructured documents, with schema-enforced primary extraction, a validate-and-retry fallback, a semantic-consistency validation layer, and full observability distinguishing shape failures from content failures. Demonstrates: the complete structured-output discipline, from enforcement mechanism through content-correctness validation.

2. **Multi-tool agent with an authorization and approval layer** — an agent capable of calling several tools of varying consequence (a read-only lookup, a data-mutating action, a payment-adjacent action), with explicit per-tool authorization checks and a human-approval gate for the highest-consequence tool, tested against adversarial inputs attempting to bypass the approval gate. Demonstrates: understanding that schema validity is not authorization, a distinction many production systems get wrong.

3. **Cross-system structured-data contract with versioning** — a small two-service system (mirroring an **Agent-to-Agent (A2A) Protocol**-style exchange) where one service's structured output is another's structured input, including a deliberate schema version change and a documented compatibility strategy (additive-only changes, a version field, graceful handling of an unrecognized field). Demonstrates: treating schemas as first-class, versioned API contracts across a system boundary.

Each project: full type hints, a pytest suite covering schema validation, semantic validation, and the retry/fallback path with both valid and deliberately invalid fixtures, CI, and a README documenting the enforcement mechanism chosen and why. The engineering discipline around validation layering is what distinguishes a portfolio piece here from a toy demo.
`,

  "case-studies": `
### OpenAI's move from function calling to a dedicated Structured Outputs feature
OpenAI's original function-calling feature was a major step forward but didn't offer a strict, guaranteed-conformance mode for every schema; the later, explicitly named Structured Outputs feature added that stronger guarantee for supported schemas, backed by constrained decoding on their serving infrastructure. Lesson: even a widely-adopted, "good enough" feature can have a meaningfully stronger successor once the underlying enforcement technology (constrained decoding) matures enough to offer a harder guarantee — teams building on top of an evolving platform should track when "usually works" becomes "guaranteed" and upgrade accordingly.

### The rise of typed-model-driven libraries (the Pydantic pattern)
Libraries built around "define a typed class, get a validated instance back" (rather than working with raw JSON dicts and hand-rolled validation) became a dominant application-layer pattern specifically because they collapse the request schema and the response-parsing schema into one definition, eliminating an entire class of drift bugs. Lesson: a good abstraction here isn't just convenience — it removes a structural source of bugs (schema drift between two independently-maintained representations of "the same" shape) that a less disciplined pattern would reintroduce.

### SGLang's engineering investment in constrained decoding specifically
Rather than treating structured/constrained generation as a minor add-on feature, **SGLang**'s team invested specific engineering effort in making it fast and correct, recognizing that agentic and extraction-heavy workloads (where nearly every LLM call needs a structured result) were becoming common enough to warrant first-class serving-engine support rather than an external library bolted on top. Lesson: as a workload pattern (structured, tool-calling-heavy generation) becomes common enough across the industry, infrastructure tends to internalize what used to be an application-layer workaround, and the resulting native support is both faster and more reliable than the workaround it replaces.

I don't have verified, specific, attributable production metrics for named companies beyond these general, well-documented platform and technology decisions, and would rather flag that honestly than invent a number.
`,

  comparisons: `
| Mechanism | Guarantee strength | Setup cost | Best fit |
|---|---|---|---|
| Prompt-only ("respond in JSON") | None | Trivial | Prototyping only; never production |
| JSON mode | Syntactically valid JSON | Trivial | Simple cases where any reasonable shape is acceptable |
| Function/tool calling | Arguments match declared parameters (provider-dependent strength) | Low — define a tool schema | Agent tool selection and invocation |
| Schema-enforced Structured Outputs (provider-native) | Strict shape match for supported schemas | Low — define a typed model/JSON Schema | Most production extraction and tool-calling on hosted providers |
| Serving-engine constrained decoding (SGLang, Outlines-style) | Structural guarantee by construction | Moderate — requires self-hosted serving infrastructure | Self-hosted open-weight model deployments needing the same guarantee class |
| Validate-and-retry (application layer) | Probabilistic, bounded by retry count | Low, but adds latency/cost per retry | Universal fallback, always worth implementing regardless of other mechanisms |

**How seniors choose**: use the strongest enforcement mechanism available for your model/provider combination as the primary path — provider-native Structured Outputs for hosted models, serving-engine constrained decoding (**SGLang**, or a constrained-decoding library on **vLLM**) for self-hosted models — and always keep validate-and-retry implemented as a fallback regardless, since no mechanism is universally guaranteed across every schema shape and every failure mode. Never rely on prompt-only requests or bare JSON mode for anything production-facing where a downstream system parses the result programmatically.
`,

  "related-technologies": `
- **Tool Calling** — the specific, widely-deployed application of structured-output enforcement to deciding and describing actions; read alongside this page for the fuller depth of agentic tool use.
- **OpenAI Responses API** — a unified provider API that integrates structured outputs and tool calling as part of one coherent request/response model; the sibling skill covering the API surface this page's mechanisms are frequently accessed through.
- **Agent-to-Agent (A2A) Protocol** — carries structured data Parts between independently-built agents; schema design and versioning discipline from this page apply directly to that cross-system boundary.
- **PydanticAI** — a framework built specifically around the typed-model-driven structured-output pattern as the default way to interact with LLMs.
- **SGLang** and **vLLM** — serving engines where constrained/grammar-guided decoding is implemented at the token level; read their Advanced Concepts sections for the systems-level detail underlying this page's Internal Working section.
- **AI Evals** — the discipline for validating semantic correctness of structured outputs, distinct from and complementary to schema-conformance validation.
- **AI Red Teaming** and **Prompt Injection Defense** — the adversarial-testing and defense practices relevant to dynamically-constructed schemas and to treating tool-call arguments as untrusted input.
- **LangGraph** and **CrewAI** — agent frameworks whose core abstractions (planning, tool selection) depend on reliable structured output at nearly every step.

On this platform, a natural path: this page → **Tool Calling** for the agentic-action-specific depth → **OpenAI Responses API** for the unified API surface → **Agent-to-Agent (A2A) Protocol** for cross-system structured-data exchange.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025, with less certainty about the most recent months leading up to today's date — structured-output feature support is an actively evolving area across providers, and I'd recommend checking current documentation directly before treating any specific detail below as current.

- **Continued convergence on JSON Schema (or close variants) as the dominant interchange format** across providers and open-source serving engines, though exact supported-feature subsets (nesting depth, recursive schemas, union handling) continue to vary and evolve.
- **Growing provider investment in strict, guaranteed-conformance modes** (distinct from earlier, weaker JSON-mode-only offerings), reflecting industry-wide recognition that agentic and extraction-heavy production workloads need a harder guarantee than "usually valid."
- **Continued performance work on constrained decoding** in open-source serving engines (**SGLang** and others), narrowing the overhead gap between constrained and unconstrained generation for common schema shapes.
- **Deepening integration between structured outputs and unified agent/tool APIs** (like the **OpenAI Responses API**), treating structured output, tool calling, and multi-step agent orchestration as parts of one coherent API surface rather than separate bolted-on features.

I do not have confident, verified knowledge of the very latest specific feature releases, exact schema-support matrices, or benchmark figures as of today's date — treat this section as directional and verify anything load-bearing to a real implementation decision against current, primary provider and serving-engine documentation.
`,

  "future-roadmap": `
Where this space appears to be heading, and what's worth investing career time in:

1. **Structured-output guarantees becoming table-stakes rather than a differentiator.** As strict schema enforcement matures across providers and serving engines, expect the competitive question to shift from "can it produce valid JSON" to "how well does it handle complex, nested, or unusual schemas, and how efficiently" — the durable skill is schema design discipline, which transfers regardless of which provider's specific guarantee is strongest at any given moment.
2. **Tighter integration with unified agent/tool APIs and cross-agent protocols.** As **OpenAI Responses API**-style unified APIs and **Agent-to-Agent (A2A) Protocol**-style cross-system exchanges mature, structured outputs increasingly function as the shared contract layer connecting independently-built systems, raising the stakes on schema versioning discipline.
3. **Growing emphasis on the shape-vs-content distinction in tooling and best practice.** Expect more platform-level and framework-level support for semantic validation as a distinct, first-class concern alongside schema validation, rather than something every team builds ad hoc — the underlying insight (shape conformance is necessary but not sufficient) is durable regardless of tooling specifics.
4. **Continued performance maturation of constrained decoding**, narrowing the gap between constrained and unconstrained generation speed, making strict enforcement an increasingly "free" default rather than a deliberate tradeoff.
5. **More sophisticated handling of ambiguous or partially-specified schemas**, as models and enforcement mechanisms improve at gracefully handling cases (unions, optional deeply-nested fields) that currently require careful, defensive schema design to use reliably.

For your career: the durable, tool-agnostic skills here are schema design discipline (clear naming, appropriate flatness, deliberate versioning), the shape-vs-content distinction as an architectural principle, and defensive validate-and-retry engineering as a universal fallback — those transfer regardless of which specific provider feature or serving-engine mechanism is state of the art at any given moment.
`,

  "cheat-sheet": `
~~~python
# --- The reliability spectrum (weakest to strongest) ---
# 1. Prompt-only "respond in JSON"        -- no guarantee
# 2. JSON mode                            -- valid JSON syntax only, any shape
# 3. Function/tool calling                -- arguments match declared params
# 4. Schema-enforced Structured Outputs   -- strict shape match (provider-native)
# 5. Constrained decoding (serving layer) -- structural guarantee by construction

# --- JSON mode (syntax only) ---
response = client.chat.completions.create(
    model="gpt-4o", messages=[...],
    response_format={"type": "json_object"},   # valid JSON, not a specific shape
)

# --- Schema-enforced (the real fix) ---
from pydantic import BaseModel
class Person(BaseModel):
    name: str
    age: int

response = client.beta.chat.completions.parse(
    model="gpt-4o", messages=[...], response_format=Person,
)
person = response.choices[0].message.parsed   # a real Person instance

# --- Function / tool calling ---
tools = [{"type": "function", "function": {
    "name": "get_weather",
    "parameters": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]},
}}]
response = client.chat.completions.create(model="gpt-4o", messages=[...], tools=tools)
for call in response.choices[0].message.tool_calls or []:   # 0, 1, or MANY -- handle all
    execute_tool(call.function.name, json.loads(call.function.arguments))

# --- Validate-and-retry fallback (ALWAYS keep this implemented) ---
def extract_with_retry(prompt, schema, max_retries=3):
    messages = [{"role": "user", "content": prompt}]
    for _ in range(max_retries):
        raw = call_llm(messages)
        try:
            return schema.model_validate(json.loads(raw))
        except Exception as exc:
            messages += [{"role": "assistant", "content": raw},
                         {"role": "user", "content": f"Invalid: {exc}. Fix it."}]
    raise RuntimeError("extraction failed after retries")

# --- The one rule that matters most ---
# SCHEMA CONFORMANCE != CONTENT CORRECTNESS
# always add semantic validation as a SEPARATE layer:
def validate_semantics(obj):
    issues = []
    # e.g. total == sum(line items), age in plausible range, etc.
    return issues

# --- Schema design musts ---
# - clear field names + real descriptions (they ARE part of the prompt)
# - flat over deeply nested where possible
# - additionalProperties: false + explicit required[]
# - NEVER build a schema from untrusted input without validating it

# --- Security musts ---
# - schema-valid tool args are NOT automatically authorized -- check before executing
# - human approval gate for consequential actions (payments, irreversible changes)
# - treat tool-call content as untrusted input (see Prompt Injection Defense)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| JSON mode vs Structured Outputs | JSON mode = valid syntax, any shape. Structured Outputs = strict shape match to a schema |
| What does schema conformance NOT guarantee? | Content correctness — a well-formed but factually wrong value still satisfies the schema |
| How does constrained decoding enforce a schema? | Compiles the schema into an automaton; masks illegal next-tokens at each decode step so only valid continuations can be sampled |
| What is the validate-and-retry pattern? | Attempt extraction, validate against a schema, feed the specific error back and retry on failure, bounded by a max attempt count |
| Why do field names/descriptions matter? | They function as part of the effective prompt — vague names give the model less signal, measurably hurting accuracy |
| How many tool calls can one response contain? | Zero, one, or many — code must handle the full range, not assume exactly one |
| What's the reliability-spectrum order, weakest to strongest? | Prompt-only -> JSON mode -> function calling -> schema-enforced Structured Outputs -> serving-engine constrained decoding |
| What security risk is specific to dynamic schemas? | A schema built from untrusted input can influence model behavior unexpectedly or cause resource exhaustion via a complex grammar |
| Is a schema-valid tool call automatically safe to execute? | No — authorization and semantic checks are separate from shape validation; gate consequential actions behind human approval |
| What should you do when a schema crosses a system boundary (e.g. A2A)? | Version it deliberately, treating any change with the same rigor as a breaking API change |
| What's the single biggest lever for extraction accuracy beyond enforcement mechanism? | Schema design — clear names, real descriptions, minimal unnecessary nesting/unions |
| Should you validate client-side even with strict provider enforcement? | Yes — for semantic correctness always, and as a safety net for provider-side edge cases |
`,

  mcqs: `
**1. What does JSON mode guarantee?**

A) The output matches a specific schema  B) The output is syntactically valid JSON, with any shape  C) The output is factually correct  D) Exactly one tool call will be returned

**Answer: B** — JSON mode guarantees valid JSON syntax only; shape and content are not guaranteed.

**2. What does constrained/grammar-guided decoding do at the token level?**

A) It re-ranks completed outputs after generation  B) It masks illegal next-tokens at each decoding step based on a compiled schema automaton, so only valid continuations can be sampled  C) It only runs after the full response is generated  D) It replaces the model with a rule-based system

**Answer: B** — this is what makes schema conformance a structural guarantee rather than a probabilistic tendency.

**3. Why is schema conformance NOT the same as content correctness?**

A) Schemas cannot describe numeric types  B) A well-formed value can still be factually wrong or nonsensical while satisfying every schema constraint  C) Schema conformance only applies to tool calling  D) Content correctness is guaranteed automatically by JSON mode

**Answer: B** — the automaton constrains which tokens are grammatically legal, not which values are true or sensible.

**4. How many tool calls can a single model response contain?**

A) Always exactly one  B) Zero or one only  C) Zero, one, or many  D) A fixed number set by the API key

**Answer: C** — a capable model can return multiple tool calls for one turn; code must handle the full range explicitly.

**5. What is a security risk specific to dynamically-constructed schemas?**

A) They always run slower  B) A maliciously crafted schema built from untrusted input could influence model behavior unexpectedly or cause resource exhaustion via a complex grammar  C) They cannot be validated at all  D) They bypass authentication entirely

**Answer: B** — schemas built from untrusted input should be independently validated before use, exactly like any other untrusted input.

**6. What should always be implemented alongside provider-native strict schema enforcement?**

A) Nothing — strict enforcement makes further checks unnecessary  B) A validate-and-retry fallback and separate semantic validation layer  C) A second, competing LLM provider  D) A manual JSON formatter

**Answer: B** — even strong enforcement has edge cases, and shape conformance never substitutes for semantic correctness checks.
`,

  "revision-notes": `
**The core idea in 3 lines:** Structured outputs make an LLM's response reliably match a predefined shape — a JSON schema, a typed model, or a function call's arguments — instead of relying on prompt wording alone. The reliability spectrum runs from prompt-only (no guarantee) through JSON mode (valid syntax only) through provider-native schema enforcement (strict shape match) up to serving-engine constrained decoding (a structural guarantee by construction). The single most important principle across the whole skill: schema conformance guarantees shape, never content correctness.

**The mechanism in 4 lines:** Constrained decoding compiles a schema into an automaton, then at every decoding step masks the model's next-token distribution against whichever tokens are currently grammatically legal, guaranteeing the final output matches by construction rather than by luck. Weaker mechanisms (validate-and-retry) instead generate freely, parse and validate after the fact, and feed the specific error back into a bounded retry loop when validation fails. Function/tool calling is the same enforcement machinery applied specifically to describing an action (a name plus typed arguments) rather than an extracted fact.

**Design discipline in 4 lines:** Define schemas once as typed models and reuse them for both the request and response parsing, never letting two independent representations of "the same" shape drift apart. Field names and descriptions are part of the effective prompt and measurably affect accuracy — invest real effort there. Keep nesting and unions as simple as the task allows, since every added layer of ambiguity increases real-world error rate even under strict shape enforcement. Version schemas deliberately whenever they cross a system boundary (a shared tool, an A2A data Part), with the same rigor as any breaking API change.

**Production discipline in 4 lines:** Always implement a validate-and-retry fallback even when stronger enforcement is the primary path, since no mechanism is universally guaranteed across every schema and every failure mode. Handle zero, one, and multiple tool calls explicitly in any tool-calling code. Never build a schema dynamically from untrusted input without independent validation, and never treat a schema-valid tool call as automatically authorized — gate consequential actions behind explicit authorization and, often, human approval. Monitor schema-validation and semantic-validation failure rates as two distinct metrics, since they answer genuinely different questions.
`,

  "learning-roadmap": `
A realistic path to production competency with structured outputs (adjust pace to your background):

**Week 1 — Foundations.** Read Beginner and Intermediate Concepts here. Complete Lab 1 (prompt-only versus schema-enforced, side by side). Milestone: you can explain the difference between JSON mode and strict Structured Outputs to someone else without notes.

**Week 2 — Resilience patterns.** Complete Lab 2 (build and test a validate-and-retry fallback against a deliberately failing mocked model). Read the **Tool Calling** skill alongside this week's work. Milestone: a working, tested retry loop that fails loudly and clearly after exhausting attempts.

**Week 3 — Agentic tool use.** Complete Lab 3 (a multi-tool agent with authorization checks and a human-approval gate), practicing the shape-vs-safety distinction directly. Milestone: you can articulate, concretely, why a schema-valid tool call is not automatically a safe one to execute.

**Week 4 — Production discipline.** Complete Lab 4 (a full extraction service with schema validation, semantic validation, and separated monitoring metrics). Milestone: a dashboard distinguishing shape failures from content failures, and a written note on what each would mean operationally.

**Week 5 — Portfolio project.** Build one of the Real Projects end to end — the resilient document-extraction pipeline is the most broadly employer-relevant choice, since it exercises the complete discipline this page teaches.

Then continue to **OpenAI Responses API** on this platform for the unified API surface these mechanisms are commonly accessed through, and **Agent-to-Agent (A2A) Protocol** for where structured-output schemas function as cross-system contracts between independently-built agents.
`,

  "official-docs": `
- [OpenAI Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs) — the primary reference for OpenAI's strict schema-enforcement feature, including current supported JSON Schema feature subsets.
- [OpenAI function calling guide](https://platform.openai.com/docs/guides/function-calling) — the tool/function-calling mechanism this page treats as a specific application of structured outputs.
- [JSON Schema specification](https://json-schema.org/) — the underlying standard most structured-output mechanisms build on; worth reading directly for the full vocabulary (types, enums, required, additionalProperties, and more).
- [Pydantic documentation](https://docs.pydantic.dev/) — the typed-model validation library underlying the dominant application-layer ergonomic pattern shown throughout this page.
- [SGLang documentation](https://docs.sglang.ai/) — for constrained/grammar-guided decoding specifics at the serving-engine level; see also this platform's **SGLang** skill.

I'm not fully confident every one of these URLs reflects the current, canonical location given how quickly provider documentation reorganizes — verify each link resolves and search the provider's own site if it has moved.
`,

  books: `
- **Designing Data-Intensive Applications** — Martin Kleppmann. Not LLM-specific, but the schema-evolution and API-contract thinking (versioning, backward compatibility) that this page's schema-versioning guidance draws on directly.
- **Architecture Patterns with Python** — Percival & Gregory (free online as "Cosmic Python"). Strong treatment of using typed domain models as contracts between layers, directly analogous to using a typed schema as the contract between an LLM call and downstream code.
- I'm not aware of a mature, dedicated book specifically about "structured outputs" as its own named topic as of my knowledge cutoff — it's a fast-moving, platform-documentation-and-library-driven area rather than one with book-length treatments yet, and I'd rather say so than invent a title.
- **Effective Python** — Brett Slatkin. Not structured-outputs-specific, but strong general guidance on typed, validated interfaces in Python that transfers directly to designing good extraction schemas.

The strongest current material for structured outputs specifically lives in provider documentation (OpenAI's Structured Outputs guide), library documentation (Pydantic), and serving-engine documentation (**SGLang**) rather than in books — treat this section as pointing you to durable adjacent foundations rather than structured-output-specific texts that don't yet exist in mature book form.
`,

  blogs: `
- **The OpenAI developer blog** — announcements and technical detail on Structured Outputs and function-calling feature evolution, directly from the source.
- **The SGLang project blog** — engineering detail on constrained-decoding performance and correctness, relevant to the self-hosted side of this skill.
- **Pydantic's own blog and release notes** — tracks the typed-model validation ecosystem this page's dominant application pattern is built on.
- **Instructor / similar structured-extraction library blogs** — practical, code-heavy content on the validate-and-retry and typed-model patterns in production use.

High-signal filter: prefer posts that show actual schema examples and real failure-mode discussion (what happens when validation fails, how retries are handled) over posts that only assert "just ask for JSON" as sufficient guidance.
`,

  "research-papers": `
Structured outputs is primarily an industry/engineering-driven practice rather than an area with a large dedicated academic literature under that exact name — I don't want to invent paper titles that don't exist. The genuinely relevant foundational reading sits one layer down, in constrained-decoding and grammar-guided-generation research:

- **Constrained decoding / grammar-guided generation papers** (search recent NeurIPS/ACL/ICML proceedings for "constrained decoding," "grammar-constrained generation," or "structured generation") — the technical foundation for how schema/grammar enforcement is implemented efficiently at the token level.
- **The SGLang paper** (covered in depth in the **SGLang** skill) — includes discussion of structured/constrained generation as one of its specific engineering focuses, directly relevant here.
- **Classical formal-language and automaton theory** (any standard compilers/automata textbook) — the underlying theory (regular languages, context-free grammars, finite automata) that schema-to-grammar compilation for constrained decoding builds on.

If a more specific, peer-reviewed "structured outputs for LLMs" paper exists under that exact framing that I'm not aware of, treat that as a gap in my knowledge rather than evidence one doesn't exist — search current academic databases (arXiv) for the latest constrained-generation research, since this is an active area with output continuing to appear.
`,

  videos: `
- **OpenAI's own developer content introducing Structured Outputs and function calling** — search OpenAI's developer channels for the feature-announcement walkthroughs, typically the clearest from-the-source explanation of the guarantee level and supported schema features.
- **SGLang technical talks on constrained decoding** — see the **SGLang** skill's Videos section for related content on the serving-engine implementation side.
- **General "reliable LLM outputs" and "typed LLM applications" conference talks** across AI-engineering conferences — search for recent, dated sessions specifically, since concrete guidance here has evolved quickly as provider features matured.
- **Pydantic/Instructor-style library maintainer talks** — practical, code-focused walkthroughs of the typed-model-driven extraction pattern in real applications.

I don't have high confidence in specific talk titles, speaker names, or exact publication dates for this fast-moving a topic, and would rather point you to the right channels to search currently than invent a specific citation.
`,

  "github-repos": `
- [pydantic/pydantic](https://github.com/pydantic/pydantic) — the typed-model validation library underlying the dominant application-layer pattern shown throughout this page.
- [outlines-dev/outlines](https://github.com/outlines-dev/outlines) — a dedicated constrained-generation library implementing grammar/schema-guided decoding independent of any specific serving engine.
- [sgl-project/sglang](https://github.com/sgl-project/sglang) — a serving engine with constrained decoding as a first-class feature; see this platform's **SGLang** skill for depth.
- [instructor-ai/instructor](https://github.com/instructor-ai/instructor) — a popular library built specifically around the typed-model-driven, validate-and-retry structured-extraction pattern.
- [json-schema-org/json-schema-spec](https://github.com/json-schema-org/json-schema-spec) — the underlying JSON Schema specification most structured-output mechanisms build on.
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — supports structured/guided decoding as well; see this platform's **vLLM** skill for its own serving-engine depth.

Verify current star counts, maintenance activity, and release cadence directly on GitHub before depending on any of these in production — activity levels shift over time, and this ecosystem moves quickly.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Reliability spectrum literacy*: given five example API calls (prompt-only, JSON mode, function calling, strict Structured Outputs, and a description of serving-engine constrained decoding), rank them by guarantee strength and explain the failure mode each is still vulnerable to.
2. *Schema design*: take a vague, single-word-field schema and rewrite it with clear names and real descriptions; then design a small experiment (even informal) to check whether extraction accuracy improves.
3. *Validate-and-retry*: implement the generic extractor from Coding Questions and test it against a mocked model that fails validation zero, one, three, and unboundedly many times, confirming correct behavior (including the bounded-failure case) in each scenario.
4. *Tool-call robustness*: write a dispatcher handling zero, one, and multiple tool calls, and test it against a mocked response containing each case explicitly.
5. *Shape vs content*: build a semantic validator for a schema of your choice (an invoice, a resume, a support ticket) that catches at least three categories of schema-valid-but-wrong content.
6. *Security*: write a test that attempts to pass a maliciously deep or recursive schema into a constrained-decoding pipeline (or a mocked stand-in for one), and design a validation guard that rejects it before it reaches generation.
7. *Cross-system contract versioning*: design two versions of a shared schema (v1 and v2, with an additive change), and write code on the "consumer" side that gracefully handles both versions without breaking.

External sets: no dedicated public "structured outputs problem set" exists that I'm confident recommending by name — the most useful practice is working directly from provider documentation examples (OpenAI's Structured Outputs guide) and building toward the labs and coding questions on this page against a real provider account or a mocked equivalent.
`,

  "architecture-diagram": `
The reference architecture for a production structured-output pipeline — the shape this page has built toward throughout:

~~~mermaid
flowchart TB
    Client["Application code"] --> Schema["Typed schema\n(single source of truth)"]
    Schema --> Primary["Primary path:\nprovider-native Structured Outputs\nor serving-engine constrained decoding"]
    Primary -->|success| Parse["Parsed, typed result"]
    Primary -->|failure/unsupported| Fallback["Fallback path:\nvalidate-and-retry loop"]
    Fallback --> Parse
    Parse --> Semantic["Semantic validation layer\n(content correctness, NOT shape)"]
    Semantic -->|valid| Downstream["Downstream code:\ntool execution, database write,\nnext agent call"]
    Semantic -->|suspicious| Review["Flag for human review\nor targeted re-extraction"]
    Downstream --> Auth["Authorization / human-approval gate\n(for consequential tool calls)"]
    subgraph Obs["Observability"]
        M1["Schema-validation failure rate"]
        M2["Semantic-validation failure rate"]
        M3["Retry-count distribution"]
    end
    Primary -.emits.-> Obs
    Fallback -.emits.-> Obs
    Semantic -.emits.-> Obs
~~~

Every box here maps to a skill on this platform: **Tool Calling** governs the Downstream/Auth path for action-taking outputs; **SGLang** and **vLLM** implement the Primary path's serving-side constrained decoding; **AI Evals** and **AI Red Teaming** inform the Semantic validation and Review paths; **Agent-to-Agent (A2A) Protocol** is one common home for the Parsed, typed result crossing a system boundary.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Structured Outputs))
    The Problem
      Fragile prompt-only JSON parsing
      Silent schema drift
      Unreliable tool calling
    Reliability Spectrum
      Prompt-only: no guarantee
      JSON mode: valid syntax only
      Function calling: typed arguments
      Schema-enforced: strict shape match
      Constrained decoding: structural guarantee
    Mechanism
      JSON Schema as shared contract
      Typed model driven pattern
      Token-level masking
      Automaton compiled from schema
    Design Discipline
      Clear field names and descriptions
      Flat over deeply nested
      Enums and unions used carefully
      Schema versioning across boundaries
    Production Practice
      Validate-and-retry fallback always
      Semantic validation as a separate layer
      Zero one or many tool calls handled
      Separate shape vs content metrics
    Security
      Never build schemas from untrusted input
      Schema valid is not authorized
      Human approval for consequential actions
    Ecosystem
      Pydantic and Instructor patterns
      SGLang and vLLM constrained decoding
      Outlines grammar libraries
      OpenAI Structured Outputs feature
    Connections
      Tool Calling
      OpenAI Responses API
      Agent-to-Agent Protocol
      PydanticAI
      AI Evals
~~~
`,
};

export default structuredOutputs;
