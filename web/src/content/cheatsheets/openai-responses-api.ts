import type { CheatSheetData } from "./types";

const openaiResponsesApi: CheatSheetData = {
  title: "The Ultimate OpenAI Responses API Cheat Sheet",
  subtitle: "State chaining · output items · hosted vs custom tools · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Responses API", desc: "OpenAI's unified, stateful API for agentic apps", code: "client.responses.create(model=m, input=\"hello\")" },
        { term: "Consolidates", desc: "Chat Completions' simplicity + Assistants API's built-in state/tools", code: "one coherent surface instead of\ntwo overlapping, incompatible ones" },
        { term: "previous_response_id", desc: "Server-side conversation-state chaining", code: "client.responses.create(..., previous_response_id=prior.id)\n# no need to resend full history" },
        { term: "Output items", desc: "A response's output is a LIST of typed items, not one string", code: "message | function_call | reasoning\n| <hosted_tool>_call" },
        { term: "Custom tool (function_call)", desc: "The model returns a call; YOU execute it and respond", code: "item.type == 'function_call'\n-> you run it, send result back" },
        { term: "Hosted tool", desc: "OpenAI executes it FOR you; result arrives already resolved", code: "tools=[{'type': 'web_search'}]\n# no execution needed on your side" },
        { term: "Reasoning-capable models", desc: "Intermediate reasoning is its own typed output item", code: "item.type == 'reasoning'" },
        { term: "Recommended for new apps", desc: "OpenAI's current guidance for agentic application-building", code: "verify current positioning against\nofficial docs -- this evolves" },
      ],
    },
    {
      title: "Request/Response Building Blocks",
      color: "blue",
      rows: [
        { term: "Basic call", desc: "The minimal request shape", code: "client.responses.create(model='gpt-4o', input='hi', timeout=30)" },
        { term: "Parsing output_text", desc: "Extract the model's text from a message item", code: "for item in response.output:\n    if item.type == 'message':\n        for c in item.content:\n            if c.type == 'output_text': print(c.text)" },
        { term: "text_format (structured output)", desc: "Schema-enforced response, same discipline as Structured Outputs", code: "response = client.responses.parse(\n  model=m, input=text, text_format=YourModel)\nresult = response.output_parsed" },
        { term: "Custom function tool definition", desc: "Same JSON Schema shape as general Tool Calling", code: "{'type':'function','name':'get_weather',\n 'parameters': {...}}" },
        { term: "function_call_output", desc: "How you send a tool's result back", code: "input=[{'type':'function_call_output',\n  'call_id': item.call_id, 'output': json.dumps(result)}]" },
        { term: "response.id", desc: "The handle for chaining the NEXT turn", code: "next = client.responses.create(\n  ..., previous_response_id=response.id)" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Multi-turn without resending history", desc: "Chain via previous_response_id", code: "first = client.responses.create(model=m, input=q1)\nsecond = client.responses.create(\n  model=m, input=q2, previous_response_id=first.id)" },
        { term: "Dispatch every output-item type", desc: "Never assume only 'message' will appear", code: "for item in response.output:\n    match item.type: case 'message': ... case 'function_call': ..." },
        { term: "Always set a timeout", desc: "Still a network dependency, hosted or not", code: "client.responses.create(..., timeout=30)" },
        { term: "Persist to YOUR OWN store too", desc: "previous_response_id is an optimization, not the record", code: "my_store.save(conversation_id, response.id)" },
        { term: "Bound tool-execution rounds", desc: "Avoid an unbounded tool-calling loop", code: "for round in range(max_tool_rounds): ..." },
        { term: "Authorize before executing", desc: "Schema-valid args are NOT automatically safe", code: "if not is_authorized(call.name, args): reject()" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Combine custom + hosted tools", desc: "One request, multiple tool types", code: "tools=[{'type':'function','name':'calc',...},\n       {'type':'web_search'}]" },
        { term: "Structured output + tool calling together", desc: "Extract AND act in one coherent flow", code: "text_format=Schema, tools=[...]" },
        { term: "Reasoning item inspection", desc: "Surface, log, or discard intermediate reasoning separately", code: "if item.type == 'reasoning': log_for_audit(item)" },
        { term: "Chain-length guard + summarization", desc: "Keep long conversations' cost/context bounded", code: "if turn_count >= 20: summarize_and_reset(conversation_id)" },
        { term: "Own conversation-history store", desc: "Independent of previous_response_id, for auditability", code: "conversation_store.save(id, user_input, response)" },
        { term: "Migration from Chat Completions/Assistants", desc: "Restructure, don't find-and-replace", code: "# rebuild around output-items + chaining,\n# test thoroughly" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Only your own store == previous_response_id", desc: "Hard dependency on platform retention, no auditability", code: "# WRONG: no local record at all\n# RIGHT: your own store + chaining as optimization" },
        { term: "Only handling 'message' items", desc: "Breaks on function_call, reasoning, or hosted-tool items", code: "text = response.output[0].content[0].text  # WRONG, fragile" },
        { term: "Confusing function_call with hosted-tool result", desc: "One needs YOUR execution, the other is already resolved", code: "# check item.type explicitly, don't assume" },
        { term: "Enabling hosted tools by default", desc: "Each is a distinct trust/control tradeoff", code: "# review before enabling web_search /\n# code_interpreter for a given app" },
        { term: "Chaining feels 'free'", desc: "Model still processes full context server-side", code: "# saves payload size + code complexity,\n# NOT the underlying token/compute cost" },
        { term: "Schema-valid args treated as authorized", desc: "Shape conformance != safe to execute", code: "# always check authorization separately,\n# gate consequential actions on human approval" },
        { term: "Conflating with Agent-to-Agent Protocol", desc: "This API is agent-to-PROVIDER, not agent-to-agent", code: "# use A2A Protocol for cross-agent communication" },
        { term: "Unbounded conversation chains", desc: "Cost and latency creep up silently over long chats", code: "# apply Context Engineering discipline:\n# summarize/truncate, don't let it grow forever" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "FastAPI wrapper pattern", desc: "Own store + Responses API + error translation", code: "prev_id = store.get_last_response_id(cid)\nresponse = client.responses.create(..., previous_response_id=prev_id)" },
        { term: "Metrics to track", desc: "Distinct signals, not one aggregate number", code: "output_item_type distribution\nchain_length\nhosted_tool_usage{tool}\ntimeout/error rate" },
        { term: "Retry/backoff + circuit breaking", desc: "Treat it like any other hosted API dependency", code: "# same resilience patterns as vLLM/A2A\n# skills' production sections" },
        { term: "Data-retention verification", desc: "Server-side state has real compliance implications", code: "# check current OpenAI retention/residency\n# terms before storing sensitive content" },
        { term: "Structured Outputs tie-in", desc: "text_format for anything downstream code parses", code: "# see the Structured Outputs skill" },
        { term: "Tool Calling tie-in", desc: "Authorization discipline for function_call execution", code: "# see the Tool Calling skill" },
        { term: "Agent-to-Agent Protocol tie-in", desc: "The separate layer for cross-agent communication", code: "# see the A2A Protocol skill" },
      ],
    },
  ],
};

export default openaiResponsesApi;
