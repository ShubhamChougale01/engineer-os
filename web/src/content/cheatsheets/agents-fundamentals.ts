import type { CheatSheetData } from "./types";

const agentFundamentals: CheatSheetData = {
  title: "The Ultimate Agent Fundamentals Cheat Sheet",
  subtitle: "The perceive-plan-act-observe loop · architectures · when NOT to use an agent · failure modes",
  sections: [
    {
      title: "Core Definition & The Loop",
      color: "violet",
      rows: [
        { term: "AI agent", desc: "An LLM in a loop with tools, memory, and a goal -- not a different kind of model", code: "same LLM as LLM Fundamentals,\nwrapped in a control loop" },
        { term: "Perceive-plan-act-observe", desc: "The four stages of one loop iteration", code: "1. perceive: goal + state\n2. plan: decide next action\n3. act: execute tool (outside model)\n4. observe: feed real result back" },
        { term: "Chatbot vs agent", desc: "Chatbot = single-shot call per turn; agent = multi-step loop that acts and observes", code: "chatbot: 1 call in, 1 completion out\nagent: N calls, tool execution,\n  real observations feed back in" },
        { term: "What actually distinguishes an agent", desc: "Tool use -- ability to affect/query the real world -- not \"better reasoning\"", code: "no tools = just a chatbot with a\nlonger internal monologue" },
        { term: "The model only ever requests", desc: "Application code decides whether/how to actually execute a tool call -- a trust boundary", code: "model: 'call tool X with args Y'\ncode: validates, then maybe executes" },
        { term: "Stopping condition ownership", desc: "The loop (step limit, cost budget), never the model alone, must own termination", code: "model can SAY it's done;\ncode enforces the actual limit" },
      ],
    },
    {
      title: "Architectures",
      color: "blue",
      rows: [
        { term: "ReAct", desc: "Interleaves explicit reasoning (Thought) with tool actions and observations, one step at a time", code: "Thought: need weather for Paris\nAction: get_weather(Paris)\nObservation: 15C and rainy" },
        { term: "Plan-and-execute", desc: "Produce a full plan up front, execute it, re-plan only if reality diverges", code: "plan = [step1, step2, step3]\nexecute in order; re-plan on\nunexpected failure only" },
        { term: "ReAct vs plan-and-execute", desc: "ReAct = max adaptiveness, 1 model call/step; plan-execute = cheaper, more predictable", code: "adaptive but costly  vs\ncheap but less reactive" },
        { term: "Single agent", desc: "One LLM-in-a-loop handles the whole task with all its tools", code: "1 agent, tools: search, calc, db" },
        { term: "Multi-agent", desc: "Task split across specialized agents + an orchestration/manager layer", code: "manager -> researcher, writer,\n  analyst (each narrow scope)" },
        { term: "Multi-agent tradeoff", desc: "Adds coordination overhead AND compounds errors across hand-offs, not a free upgrade", code: "justified by role decomposition\nor context isolation ONLY" },
        { term: "Parallel tool calls", desc: "Some architectures request multiple tool calls at once to cut wall-clock latency", code: "search 3 sources in parallel vs\nsequentially -- harder aggregation" },
      ],
    },
    {
      title: "When Agents Are (and Are NOT) the Right Tool",
      color: "emerald",
      rows: [
        { term: "Fully specified, one output", desc: "No external lookup, no branching needed", code: "-> single well-prompted LLM call" },
        { term: "Known step sequence", desc: "Order and count of steps knowable up front, even with tools", code: "-> fixed pipeline (deterministic\n   code calling LLM/tools in order)" },
        { term: "Steps depend on intermediate results", desc: "Right next step genuinely unknown until you see the last result", code: "-> single, tightly-bounded agent" },
        { term: "Genuine role decomposition needed", desc: "Task naturally splits into distinct expertise areas", code: "-> multi-agent (deliberate\n   escalation, not default)" },
        { term: "Default bias", desc: "Most real tasks need row 1 or 2 -- most agent projects are overkill", code: "check the decision table BEFORE\nbuilding a loop" },
        { term: "Agents are never free", desc: "Always slower and more expensive than a single call that could solve it", code: "every loop iteration = another\n  full model call, billed and risky" },
      ],
    },
    {
      title: "Compounding Errors & Failure Modes",
      color: "amber",
      rows: [
        { term: "Compounding error math", desc: "Overall success = per-step success raised to the number of steps", code: "p=0.95, n=10 -> ~60% success\np=0.95, n=20 -> ~36% success" },
        { term: "Why this matters", desc: "Excellent per-step accuracy still degrades to worse than a coin flip by ~15 steps", code: "minimize step count -- it's a\n  multiplicative tax, not additive" },
        { term: "Infinite loops / non-termination", desc: "No hard step/cost limit enforced -- the model never decides it's done", code: "root cause: relying on model's\n  own judgment as sole stop signal" },
        { term: "Tool misuse", desc: "Wrong tool chosen, or a tool called with malformed/unsafe arguments", code: "root cause: loose tool set,\n  no argument validation" },
        { term: "Compounding errors across steps", desc: "One bad decision early corrupts every downstream step's reasoning", code: "root cause: chaining too many\n  steps, no verification/reflection" },
        { term: "Cost/latency blowup", desc: "Cost scales with however many steps a task happened to need, not fixed like a single call", code: "root cause: no token/cost budget\n  independent of step count" },
        { term: "Repeated-failure loop", desc: "Agent calls the same failing tool with the same args repeatedly", code: "detect: same (tool,args) + error\n  N times in a row -> abort/escalate" },
      ],
    },
    {
      title: "Guardrails & Production Discipline",
      color: "rose",
      rows: [
        { term: "Hard step limit", desc: "Enforced in code, sized to realistic task complexity plus margin", code: "AGENT_MAX_STEPS=8" },
        { term: "Hard cost/token budget", desc: "Independent of step count -- some steps cost far more tokens than others", code: "AGENT_MAX_TOTAL_TOKENS=20000" },
        { term: "Tight tool allowlist", desc: "Explicit per-feature list, never 'whatever tools are registered'", code: "AGENT_ALLOWED_TOOLS=search,\n  get_order_status" },
        { term: "Validate tool arguments", desc: "Never trust model-generated arguments as inherently safe before execution", code: "assert valid_schema(args)\nbefore calling the real tool" },
        { term: "Human-approval gate", desc: "Required for consequential, costly, or irreversible tool calls", code: "AGENT_HUMAN_APPROVAL_REQUIRED_FOR=\n  send_email,issue_refund" },
        { term: "Treat tool outputs as untrusted data", desc: "A retrieved result can smuggle in instructions the model may obey -- agent-flavored prompt injection", code: "separate trusted system prompt\nfrom untrusted tool observations" },
        { term: "Log the full transcript", desc: "Thought/tool/args/observation per step, not just the final answer", code: "debugging starts from the\nORIGINATING bad step, not output" },
        { term: "Non-agentic fallback path", desc: "Route to a pipeline or a human if the agent fails, times out, or exceeds budget", code: "agent success rate < bar ->\n  fall back, don't just fail" },
      ],
    },
    {
      title: "Sibling Skills & Ecosystem",
      color: "cyan",
      rows: [
        { term: "LLM Fundamentals", desc: "Prerequisite: the model doing the deciding at every loop step", code: "tokens, context window, sampling" },
        { term: "Prompt Engineering", desc: "Prerequisite: how the decision step is reliably prompted", code: "instructions, few-shot, structure" },
        { term: "Tool Calling", desc: "Sibling skill: designing/describing/safely exposing the functions an agent can call", code: "name, description, arg schema,\nwhen NOT to use it" },
        { term: "Agent Memory", desc: "Sibling skill: managing state within one run and across sessions", code: "summarize/prune transcript growth" },
        { term: "Planning", desc: "Sibling skill: plan representation, re-planning triggers, hierarchical plans", code: "plan-and-execute in full depth" },
        { term: "Reflection", desc: "Sibling skill: self-critique/verification loops that catch the agent's own mistakes", code: "is it ACTUALLY done, verified" },
        { term: "LangChain", desc: "General-purpose framework for composing LLM calls, tools, and agent loops", code: "widely used, broad ecosystem" },
        { term: "LangGraph", desc: "Graph-based orchestration for explicitly stateful, controllable workflows", code: "nodes/edges instead of a bare loop" },
        { term: "CrewAI", desc: "Framework built around role-based multi-agent orchestration", code: "crew of role-scoped agents" },
        { term: "OpenAI Agents SDK", desc: "Provider-native toolkit for agents against OpenAI's models/tool-calling primitives", code: "vendor-native agent loop + tools" },
        { term: "AutoGen", desc: "Framework (Microsoft Research) built around multi-agent conversation patterns", code: "agents converse to solve a task" },
        { term: "MCP (Model Context Protocol)", desc: "Vendor-neutral standard for exposing tools/context to agents across frameworks", code: "build a tool once, use it from\nany MCP-compatible agent" },
      ],
    },
  ],
};

export default agentFundamentals;
