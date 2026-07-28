import type { CheatSheetData } from "./types";

const toolCalling: CheatSheetData = {
  title: "The Ultimate Tool Calling Cheat Sheet",
  subtitle: "Schema in, structured call out · validate-then-execute · parallel calls · failure modes · security",
  sections: [
    {
      title: "Core Protocol",
      color: "violet",
      rows: [
        { term: "Tool calling / function calling", desc: "Model emits a structured request (name + JSON args); app code validates, executes, feeds result back", code: "same term, different vendors --\nidentical underlying protocol" },
        { term: "Tool schema, 3 parts", desc: "Name, description (when to use/not use), JSON Schema parameters", code: "name: get_weather\ndescription: current weather...\nparameters: JSON Schema object" },
        { term: "The request-execute-return cycle", desc: "The full loop of one tool-calling turn", code: "1. send: convo + tool schemas\n2. model: text OR tool_call\n3. app validates + executes\n4. result fed back, tagged by id" },
        { term: "Model never executes", desc: "The model only ever requests -- app code decides whether/how to act", code: "model: 'call X with Y'\napp: validate, THEN maybe run" },
        { term: "tool_call_id tagging", desc: "Every result must be tied back to the specific call that requested it", code: "critical under parallel calls --\nnever assume request order" },
        { term: "Forced tool choice", desc: "App can force a specific tool, force any tool, or force none for this turn", code: "tool_choice=required(name) skips\nthe model's own decide-to-call step" },
      ],
    },
    {
      title: "Schema Design",
      color: "blue",
      rows: [
        { term: "State when NOT to use a tool", desc: "The single highest-leverage fix for wrong-tool selection", code: "'use for CURRENT weather,\nnot forecasts' removes ambiguity" },
        { term: "Prefer enums over free text", desc: "Narrows the space of arguments the model can get wrong", code: "units: enum[celsius,fahrenheit]\nnot units: string" },
        { term: "Generate schema from real signature", desc: "Avoids schema drift as the function evolves", code: "derive from typed function +\ndocstring, don't hand-maintain" },
        { term: "Keep schemas flat, not deeply nested", desc: "Flatter argument shapes are easier for a model to fill correctly", code: "city, units  vs\nlocation: { geo: { city } }" },
        { term: "Mark required only what's truly required", desc: "Over-marking required fields increases malformed-call retries", code: "required: ['city']\nunits optional, has a default" },
        { term: "Scope tools per request", desc: "Offer only the tools relevant to the current task, not the whole registry", code: "task=weather -> [get_weather]\nnot all 30 registered tools" },
      ],
    },
    {
      title: "Sequential vs Parallel Calls",
      color: "emerald",
      rows: [
        { term: "Sequential", desc: "One call per turn -- simplest error handling, more round trips", code: "call -> observe -> decide ->\ncall again (N model round trips)" },
        { term: "Parallel", desc: "Multiple calls requested in ONE turn -- lower wall-clock latency", code: "get_weather(Paris) +\nget_weather(Tokyo) same turn" },
        { term: "Parallel aggregation rule", desc: "Tag every result by tool_call_id, never assume completion order", code: "results keyed by id, not by\nrequest position in the list" },
        { term: "Partial-failure handling", desc: "Return ALL results including failures -- never fail the whole batch", code: "2 ok + 1 timeout ->\nreturn all 3, model decides next" },
        { term: "Bounded concurrency", desc: "Cap how many calls in a batch execute simultaneously", code: "ThreadPoolExecutor(max_workers=5)\nnever unbounded parallel dispatch" },
        { term: "When parallel is NOT worth it", desc: "Calls whose results depend on each other in sequence", code: "step 2 needs step 1's output ->\nmust stay sequential" },
      ],
    },
    {
      title: "Failure Modes & Fixes",
      color: "amber",
      rows: [
        { term: "Hallucinated tool call", desc: "Model requests a tool name never actually offered", code: "fix: allowlist check BEFORE\nexecution, always" },
        { term: "Malformed arguments", desc: "Invalid JSON, or valid JSON that fails the declared schema", code: "fix: validate in app code,\nregardless of provider claims" },
        { term: "Wrong tool / wrong values", desc: "Schema-VALID but semantically incorrect -- not caught by validation", code: "fix: better descriptions/examples,\nor a verification/reflection step" },
        { term: "Tool execution failure", desc: "Timeout, exception, or downstream error during real execution", code: "fix: catch it, return a\nstructured error observation" },
        { term: "Repeated-failure loop", desc: "Same failing call retried identically, no strategy change", code: "detect: same (tool,args)+error\nN times -> inject explicit notice" },
        { term: "Provider-specific quirks", desc: "Schema enforcement strength, parallel-call support all vary by provider/version", code: "never assume uniform behavior --\nre-verify against current docs" },
      ],
    },
    {
      title: "Security & Guardrails",
      color: "rose",
      rows: [
        { term: "Model request is not authorization", desc: "The single most important security rule on this page", code: "'model asked for it' != 'it\nshould happen' -- always gate" },
        { term: "Tool outputs are untrusted data", desc: "A fetched page/record can smuggle instructions the model may obey", code: "treat as DATA to reason about,\nnever as commands to follow" },
        { term: "Validate + sanitize before downstream use", desc: "Never string-concatenate model args into SQL/shell/paths", code: "use parameterized queries /\nallowlisted builders only" },
        { term: "Read vs write tool distinction", desc: "Side-effecting tools need categorically more scrutiny", code: "get_order_status: low risk\nissue_refund: needs approval gate" },
        { term: "Privilege escalation via chaining", desc: "Read tool + write tool together can be worse than either alone", code: "review combos, not just each\ntool's isolated risk" },
        { term: "Human-approval gate", desc: "Required for consequential, costly, or irreversible tool calls", code: "TOOL_APPROVAL_REQUIRED_FOR=\nissue_refund,delete_record,send_email" },
        { term: "Rate/execution limits as security", desc: "Unbounded tool-call volume is a cost-abuse / DoS vector", code: "per-tool rate limits + execution\nbudgets, not just a cost control" },
        { term: "Full audit logging", desc: "Log every requested AND rejected call, not just executed ones", code: "name, args, validation outcome,\nresult/error, latency" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Per-tool timeout", desc: "Sized to that specific tool's realistic latency, not one global default", code: "TOOL_TIMEOUT_SECONDS=10\n(override per slow external API)" },
        { term: "Explicit per-task allowlist", desc: "Never expose 'whatever tools are registered' by default", code: "TOOL_ALLOWLIST_PER_TASK=\nweather:get_weather" },
        { term: "Tool-selection accuracy evaluation", desc: "Measured on a representative task set, re-run after any model/schema change", code: "accuracy = correct_tool_calls /\ntotal_cases, tracked over time" },
        { term: "Instrumentation to log per call", desc: "The minimum signal set for debugging and monitoring", code: "tool, ok/error, latency,\nhallucination + invalid-arg rate" },
        { term: "Non-tool-calling fallback", desc: "Route to a deterministic path or a human if accuracy misses the bar", code: "accuracy < threshold ->\nfall back, don't just fail" },
        { term: "Canary schema/tool-set changes", desc: "Roll out behind a flag, monitor hallucination + selection distribution first", code: "small % traffic -> watch metrics\n-> full rollout" },
        { term: "Sibling skills map", desc: "Where to go next depending on the gap", code: "Agent Fundamentals -> the loop\nMCP -> vendor-neutral standard\nGuardrails -> approval/policy layer\nStructured Outputs -> output shape\nLangChain/OpenAI Agents SDK -> impl" },
      ],
    },
  ],
};

export default toolCalling;
