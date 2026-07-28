import type { CheatSheetData } from "./types";

const openaiAgentsSdk: CheatSheetData = {
  title: "The Ultimate OpenAI Agents SDK Cheat Sheet",
  subtitle: "Agents & Runner · tools · handoffs · guardrails · sessions & tracing · production toolbelt",
  sections: [
    {
      title: "Core Setup & the Agent/Runner Loop",
      color: "violet",
      rows: [
        { term: "Agent", desc: "instructions + model + tools + optional handoffs/guardrails", code: "from agents import Agent\nagent = Agent(name='Assistant', instructions='Be helpful.')" },
        { term: "Runner.run_sync", desc: "Execute the agent loop synchronously", code: "from agents import Runner\nresult = Runner.run_sync(agent, 'Hello!')\nprint(result.final_output)" },
        { term: "Runner.run (async)", desc: "Execute the agent loop in an async context", code: "result = await Runner.run(agent, 'Hello!')" },
        { term: "max_turns", desc: "Bound the loop — always set explicitly in production", code: "Runner.run_sync(agent, input, max_turns=8)" },
        { term: "result.final_output", desc: "The convenient final answer of the run", code: "print(result.final_output)" },
        { term: "result.new_items", desc: "Full list of items generated (messages, tool calls, handoffs)", code: "for item in result.new_items:\n    print(item.type)" },
        { term: "Model config", desc: "Set per agent; centralize in one place for the app", code: "agent = Agent(name='A', model='gpt-4o-mini', instructions='...')" },
        { term: "Provider-agnostic", desc: "Model layer isn't hard-wired to one vendor", code: "# route different agents to different providers\n# behind a common interface (verify current support)" },
      ],
    },
    {
      title: "Tools",
      color: "blue",
      rows: [
        { term: "function_tool decorator", desc: "Turns a plain function into a callable tool", code: "from agents import function_tool\n@function_tool\ndef get_weather(city: str) -> str:\n    \"\"\"Get current weather for a city.\"\"\"\n    return '18C, cloudy'" },
        { term: "Docstring = tool description", desc: "SDK inspects docstring + type hints for the schema", code: "# vague docstring -> model calls it wrong or not at all\n# be as clear as documenting for a new engineer" },
        { term: "Attach tools to an agent", desc: "Pass a list at construction time", code: "agent = Agent(name='Weather', instructions='...',\n  tools=[get_weather])" },
        { term: "Tool error handling", desc: "Return structured errors, never raise uncaught", code: "return {'error': 'lookup failed: timeout'}" },
        { term: "Parallel tool calls", desc: "Independent tool calls can run concurrently", code: "# model may request multiple tools in one turn;\n# Runner can execute independent ones concurrently" },
        { term: "Forced tool choice", desc: "Require the model to call a specific/any tool", code: "# configure tool_choice on the agent/run\n# to force a real lookup instead of free recall" },
        { term: "MCP tools", desc: "Consume tools exposed by an MCP server", code: "# agent can be configured with an MCP server\n# as an alternative/complement to function_tool" },
      ],
    },
    {
      title: "Handoffs & Multi-Agent Patterns",
      color: "emerald",
      rows: [
        { term: "Handoff", desc: "Transfer the rest of the conversation to another agent", code: "triage = Agent(name='Triage', instructions='Route...',\n  handoffs=[billing_agent, technical_agent])" },
        { term: "One-directional by default", desc: "Control does NOT return to the sender automatically", code: "# design topology assuming handoff = permanent\n# transfer unless you add an explicit path back" },
        { term: "Agent-as-tool", desc: "Consult a specialist while KEEPING control", code: "# wrap an Agent as a tool the orchestrator calls\n# use when you need the answer back, not to delegate" },
        { term: "Handoff vs agent-as-tool", desc: "Delegate-forever vs consult-and-continue", code: "# handoff: support ticket -> owning team\n# agent-as-tool: report writer -> research summarizer" },
        { term: "Context transfer control", desc: "Customize what history/data crosses a handoff", code: "# filter/summarize history or attach structured\n# handoff data instead of sending the raw transcript" },
        { term: "Routing cycle bug", desc: "A hands off to B, B hands back to A = infinite loop", code: "# make routing criteria mutually exclusive\n# always include a fallback/general agent" },
        { term: "Fallback agent", desc: "Catch-all for ambiguous triage input", code: "handoffs=[billing_agent, technical_agent, general_agent]" },
      ],
    },
    {
      title: "Guardrails, Structured Output & Sessions",
      color: "amber",
      rows: [
        { term: "input_guardrail", desc: "Validate input BEFORE main agent logic runs", code: "from agents import input_guardrail, GuardrailFunctionOutput\n@input_guardrail\nasync def block_offtopic(ctx, agent, user_input):\n    return GuardrailFunctionOutput(output_info={},\n      tripwire_triggered='offtopic' in user_input)" },
        { term: "output_guardrail", desc: "Validate final output BEFORE returning to caller", code: "# same shape as input_guardrail, runs after\n# the main agent produces its final answer" },
        { term: "tripwire_triggered", desc: "True halts/rejects the run", code: "GuardrailFunctionOutput(output_info={...},\n  tripwire_triggered=True)" },
        { term: "output_type", desc: "Constrain final answer to a validated schema", code: "from pydantic import BaseModel\nclass Result(BaseModel):\n    ok: bool\nagent = Agent(name='A', instructions='...', output_type=Result)" },
        { term: "SQLiteSession", desc: "Persist conversation history across turns", code: "from agents import SQLiteSession\nsession = SQLiteSession(session_id='u-1', db_path='chat.db')\nRunner.run_sync(agent, 'hi', session=session)" },
        { term: "Shared session backend", desc: "Required for multi-instance deployments", code: "# in-memory session breaks across replicas\n# use Redis/Postgres-backed session in prod" },
        { term: "Guardrail cost tradeoff", desc: "Keep guardrails cheap — output ones add tail latency", code: "# input guardrails can run alongside main call\n# output guardrails always add pure latency" },
      ],
    },
    {
      title: "Pitfalls & Debugging",
      color: "rose",
      rows: [
        { term: "No max_turns bound", desc: "#1 cost/latency risk — unbounded looping", code: "Runner.run_sync(agent, input, max_turns=8)" },
        { term: "Vague tool docstrings", desc: "Model calls tool wrong or never at all", code: "# describe purpose + params like documenting\n# for a new engineer, not just a code comment" },
        { term: "Trusting tool output blindly", desc: "Prompt injection vector via external content", code: "# treat tool output as UNTRUSTED data,\n# not trusted system context" },
        { term: "No timeout on tool/model calls", desc: "One hung call stalls the whole run", code: "OpenAIClient(timeout=30)  # set on model + every\n                          # network-calling tool" },
        { term: "Free-text output driving side effects", desc: "Risk of acting on hallucinated decisions", code: "# require output_type + output guardrail before\n# any real action (refund, email, write)" },
        { term: "Hand-rolled history management", desc: "Reinvents exactly what Sessions solves", code: "# use SQLiteSession / custom Session backend\n# instead of manually concatenating messages" },
        { term: "No re-validation after model upgrade", desc: "Silent behavior drift with zero code diff", code: "# re-run eval/regression suite after any\n# model version change, not just code changes" },
        { term: "Debug order: trace first", desc: "Read trace before guessing at the bug", code: "for item in result.new_items:\n    print(item.type, getattr(item, 'raw_item', None))" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Structured logging per run", desc: "Log agent name, turns, handoff dest, guardrail trips", code: "log.info('agent_run', agent_name=agent.name,\n  num_items=len(result.new_items))" },
        { term: "Turns-per-run metric", desc: "Rising average signals looping/misrouting", code: "HIST.labels(agent=agent.name).observe(turns_taken)" },
        { term: "Handoff destination distribution", desc: "Spike toward one specialist = triage regression", code: "COUNTER.labels(dest=handoff_target).inc()" },
        { term: "Guardrail tripwire rate", desc: "Track per-guardrail; spikes = attack or overly strict rule", code: "COUNTER.labels(guardrail='offtopic').inc()" },
        { term: "Tracing export", desc: "Send SDK traces into your existing observability stack", code: "# don't rely only on the standalone trace viewer\n# once running at real production scale" },
        { term: "Health checks", desc: "readyz verifies model/session backend reachable", code: "GET /healthz -> process alive\nGET /readyz  -> deps reachable" },
        { term: "Structural testing", desc: "Assert on tool called / handoff occurred, not exact text", code: "assert any('lookup_order' in str(c) for c in tool_calls)" },
        { term: "Secrets management", desc: "API keys via secrets manager, never hardcoded", code: "os.environ['OPENAI_API_KEY']  # injected, not committed" },
        { term: "Dockerized deployment", desc: "Non-root user, env-based model config, coordinated timeouts", code: "USER appuser\nENV AGENTS_MODEL=gpt-4o-mini" },
      ],
    },
  ],
};

export default openaiAgentsSdk;
