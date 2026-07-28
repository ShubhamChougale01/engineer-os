import type { CheatSheetData } from "./types";

const structuredOutputs: CheatSheetData = {
  title: "The Ultimate Structured Outputs Cheat Sheet",
  subtitle: "JSON Schema · function calling · constrained decoding · validation toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Structured outputs", desc: "Making an LLM response reliably match a predefined shape", code: "JSON matching a schema, or\na function call's typed arguments" },
        { term: "Reliability spectrum", desc: "Weakest to strongest enforcement", code: "prompt-only -> JSON mode -> function calling\n-> schema-enforced -> constrained decoding" },
        { term: "JSON mode", desc: "Guarantees valid JSON syntax, NOT a specific shape", code: "response_format={'type': 'json_object'}" },
        { term: "Schema-enforced Structured Outputs", desc: "Guarantees output matches a specific schema exactly", code: "response_format=YourPydanticModel" },
        { term: "Function / tool calling", desc: "Structured output describing an action: name + typed args", code: "message.tool_calls -> [{name, arguments}]" },
        { term: "Constrained / grammar-guided decoding", desc: "Token-level masking makes invalid shape impossible to sample", code: "schema compiled to an automaton;\nillegal next-tokens masked at each step" },
        { term: "Shape != content", desc: "The single most important rule in this entire skill", code: "schema-valid output can still be\nfactually wrong or hallucinated" },
        { term: "JSON Schema", desc: "The dominant shared format for describing desired shape", code: "type, properties, required, additionalProperties" },
      ],
    },
    {
      title: "Schema Building Blocks",
      color: "blue",
      rows: [
        { term: "Typed model (Pydantic)", desc: "Define the shape once, reuse for request AND response parsing", code: "class Person(BaseModel):\n    name: str\n    age: int" },
        { term: "Field descriptions", desc: "Part of the effective prompt -- write real ones", code: "total: float = Field(description='Total in USD, before tax')" },
        { term: "required / additionalProperties", desc: "Tightens the contract wherever the mechanism supports it", code: "'required': ['name','age'], 'additionalProperties': False" },
        { term: "Enums (Literal types)", desc: "Constrain a field to exactly a fixed set of values", code: "status: Literal['paid', 'unpaid', 'overdue']" },
        { term: "Nested objects", desc: "Supported broadly but verify provider-specific depth limits", code: "class Customer(BaseModel):\n    address: Address" },
        { term: "Arrays / lists", desc: "A field that's a list of typed items", code: "line_items: list[LineItem] = []" },
        { term: "Keep it flat where possible", desc: "Every layer of nesting/union increases real-world error rate", code: "flatter schema = higher extraction accuracy,\nnot just cleaner code" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Parse into a typed instance", desc: "Get a real object back, not a raw string", code: "resp = client.beta.chat.completions.parse(\n  model=m, messages=msgs, response_format=Person)\nperson = resp.choices[0].message.parsed" },
        { term: "Handle 0/1/many tool calls", desc: "Never assume exactly one call per response", code: "for call in response.choices[0].message.tool_calls or []:\n    handle(call)" },
        { term: "Validate-and-retry fallback", desc: "Always implement this, even with strong enforcement available", code: "try: schema.model_validate(json.loads(raw))\nexcept: retry_with_error_fed_back()" },
        { term: "Feed the SPECIFIC error back", desc: "Far more effective than a generic 're-ask'", code: "messages.append({'role':'user',\n  'content': f'Invalid: {exc}. Fix it.'})" },
        { term: "Always set a timeout", desc: "Structured-output calls are still network calls", code: "client.beta.chat.completions.parse(..., timeout=30)" },
        { term: "Bound max_tokens for extraction", desc: "A well-scoped schema needs far fewer tokens than free-form text", code: "response_format=Person, max_tokens=200" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Semantic validation layer", desc: "A SEPARATE check from schema validation, for content correctness", code: "if invoice.total != sum(items): flag_for_review()" },
        { term: "Parallel tool calls", desc: "A capable model can return multiple calls for one turn", code: "for call in response.choices[0].message.tool_calls:\n    ... # not just tool_calls[0]" },
        { term: "Streaming structured output", desc: "Partial deltas with merge semantics; only safe to parse when complete", code: "half-streamed JSON is, by definition, invalid JSON" },
        { term: "Constrained decoding at the serving layer", desc: "Self-hosted equivalent of provider-native enforcement", code: "see SGLang / vLLM skills --\nsame guarantee class, no hosted provider needed" },
        { term: "Schema versioning across a boundary", desc: "Treat like any breaking API change (e.g. an A2A data Part)", code: "additive changes + a version field,\nnever silently rename/remove a required field" },
        { term: "Grammar-compilation caching", desc: "Reused schemas amortize compilation cost across requests", code: "cache the compiled automaton,\nkeyed by schema content" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Confusing JSON mode with strict enforcement", desc: "JSON mode guarantees syntax only, not your expected shape", code: "'valid JSON' != 'matches my schema'" },
        { term: "Trusting schema conformance as correctness", desc: "A well-formed value can still be wrong", code: "# always add a semantic check, separately" },
        { term: "Vague field names, no descriptions", desc: "Gives the model far less signal, hurts accuracy", code: "# WRONG: data: str, val: float\n# RIGHT: total_amount_usd: float = Field(description=...)" },
        { term: "Assuming exactly one tool call", desc: "Breaks when the model returns zero or several", code: "call = response.choices[0].message.tool_calls[0]  # WRONG" },
        { term: "No fallback path implemented", desc: "Breaks outright on unsupported schema features or provider hiccups", code: "# always keep validate-and-retry as a tested fallback" },
        { term: "Schema-valid tool call == authorized", desc: "Shape validity is NOT an authorization check", code: "# check is_authorized() before executing,\n# gate consequential actions with human approval" },
        { term: "Dynamic schemas from untrusted input", desc: "A crafted schema can misbehave a model or exhaust resources", code: "# never build tool/response schemas from\n# untrusted input without independent validation" },
        { term: "Overly deep nesting / ambiguous unions", desc: "Increases real error rate even under strict enforcement", code: "# simplify the schema BEFORE optimizing infra" },
        { term: "No schema versioning at a system boundary", desc: "Silently breaks a counterpart system", code: "# treat like a breaking API change, always" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "OpenAI Structured Outputs", desc: "Provider-native strict schema enforcement", code: "client.beta.chat.completions.parse(\n  model=m, response_format=YourModel)" },
        { term: "Pydantic / Instructor-style libraries", desc: "Typed-model-driven extraction with validate-and-retry built in", code: "class Model(BaseModel): ...\n# one definition, request + response" },
        { term: "SGLang / vLLM constrained decoding", desc: "Serving-layer enforcement for self-hosted open-weight models", code: "sgl.gen('x', regex=..., json_schema=...)" },
        { term: "Monitoring: two SEPARATE metrics", desc: "Shape failures and content failures answer different questions", code: "schema_validation_total{result}\nsemantic_check_total{result}" },
        { term: "Retry-count distribution", desc: "A leading indicator of degrading extraction reliability", code: "retries_histogram.observe(attempt_count)" },
        { term: "AI Evals tie-in", desc: "Validates semantic correctness, not just schema conformance", code: "# schema conformance != a passing eval" },
        { term: "Tool Calling / A2A Protocol tie-in", desc: "Where structured outputs power actions and cross-system contracts", code: "# see the Tool Calling and\n# Agent-to-Agent (A2A) Protocol skills" },
      ],
    },
  ],
};

export default structuredOutputs;
