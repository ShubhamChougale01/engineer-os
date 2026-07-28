import type { CheatSheetData } from "./types";

const pydanticAi: CheatSheetData = {
  title: "The Ultimate PydanticAI Cheat Sheet",
  subtitle: "Type-safe agents · tools · structured output · testing without a real LLM",
  sections: [
    {
      title: "Core Setup & Agent Basics",
      color: "violet",
      rows: [
        { term: "Install", desc: "Add the package (slim variant keeps provider extras minimal)", code: "uv add pydantic-ai\nuv add pydantic-ai-slim[openai,anthropic]" },
        { term: "Agent()", desc: "The central object: binds a model, tools, and result type", code: "from pydantic_ai import Agent\nagent = Agent('openai:gpt-4o')" },
        { term: "Model string", desc: "provider:model — swapping providers is a one-line change", code: "Agent('openai:gpt-4o')\nAgent('anthropic:claude-3-5-sonnet-latest')\nAgent('ollama:llama3')" },
        { term: "system_prompt", desc: "Fixed instructions steering the agent's behavior", code: "Agent('openai:gpt-4o', system_prompt='Be concise.')" },
        { term: "run_sync", desc: "Synchronous convenience wrapper — use in scripts, not services", code: "result = agent.run_sync('question')\nprint(result.output)" },
        { term: "run (async)", desc: "The real entry point — always use inside async services", code: "result = await agent.run('question')" },
        { term: "AgentRunResult", desc: "Return value of a run — holds validated output plus history", code: "result.output\nresult.all_messages()   # full conversation trace" },
        { term: "Reuse, don't recreate", desc: "Build Agent once at startup; pass per-request state via run()", code: "agent = Agent(...)   # module scope\nawait agent.run(q, deps=Deps(...))  # per request" },
      ],
    },
    {
      title: "Result Types & Validation",
      color: "blue",
      rows: [
        { term: "result_type", desc: "A Pydantic model the final answer must validate against", code: "class Fact(BaseModel):\n    city: str\n    pop_millions: float\nagent = Agent('openai:gpt-4o', result_type=Fact)" },
        { term: "Typed output access", desc: "No json.loads anywhere — a real validated instance", code: "fact: Fact = (await agent.run(q)).output\nfact.pop_millions   # normal attribute access" },
        { term: "field_validator", desc: "Custom constraints on the result model, same as any Pydantic model", code: "@field_validator('label')\n@classmethod\ndef check(cls, v):\n    if v not in {'pos','neg'}: raise ValueError('bad')\n    return v" },
        { term: "Constrained fields", desc: "Bake numeric/string constraints straight into the schema", code: "amount: int = Field(gt=0)\ncode: str = Field(pattern=r'^[A-Z]{3}$')" },
        { term: "Validation-triggered retry", desc: "Malformed output can be fed back to the model for correction", code: "# framework re-prompts with the validation error,\n# up to a configured retry limit" },
        { term: "Validation != truth", desc: "Structure is guaranteed; hallucinated-but-valid content is not caught", code: "# a validated CityFact can still contain a wrong population number" },
        { term: "No result_type = plain text", desc: "Omit it for pure chat use cases", code: "agent = Agent('openai:gpt-4o')\nresult.output   # a plain str" },
      ],
    },
    {
      title: "Tools & Dependency Injection",
      color: "emerald",
      rows: [
        { term: "tool_plain", desc: "Register a tool with no injected deps needed", code: "@agent.tool_plain\ndef get_weather(city: str) -> str:\n    \"\"\"Return current weather for a city.\"\"\"\n    return lookup(city)" },
        { term: "tool", desc: "Register a tool that needs RunContext / injected deps", code: "@agent.tool\nasync def lookup(ctx, order_id: str) -> str:\n    return await ctx.deps.db.get(order_id)" },
        { term: "Docstring = model-facing doc", desc: "The model reads it to decide when/how to call the tool", code: "def tool(x: int) -> str:\n    \"\"\"Explain purpose clearly — vague docs cause wrong calls.\"\"\"" },
        { term: "deps_type + Deps dataclass", desc: "Declare what a run needs; injected explicitly, never global", code: "@dataclass\nclass Deps:\n    db: object\n    user_id: int\nagent = Agent('openai:gpt-4o', deps_type=Deps)" },
        { term: "RunContext[Deps]", desc: "Typed access to injected deps inside a tool", code: "async def t(ctx: RunContext[Deps], k: str):\n    return ctx.deps.db.query(k)" },
        { term: "Passing deps at run time", desc: "Deps are constructed per request/run, not at import time", code: "await agent.run(q, deps=Deps(db=db, user_id=uid))" },
        { term: "Argument validation before execution", desc: "Malformed tool args never reach your function body", code: "# tool schema derived from type hints validates args first" },
        { term: "Narrow tool scope", desc: "One tool, one job — easier for the model to pick correctly", code: "# prefer lookup_order(id) over run_sql(query)" },
      ],
    },
    {
      title: "Streaming & Multi-Agent",
      color: "amber",
      rows: [
        { term: "run_stream (text)", desc: "Stream plain-text tokens as they arrive", code: "async with agent.run_stream(q) as s:\n    async for chunk in s.stream_text(delta=True):\n        print(chunk, end='')" },
        { term: "delta=True vs default", desc: "delta yields new text only; default yields accumulated text", code: "s.stream_text(delta=True)   # incremental\ns.stream_text()              # cumulative" },
        { term: "stream_structured", desc: "Progressively-complete partial views of result_type as it fills in", code: "async for partial in s.stream_structured(debounce_by=0.1):\n    render(partial)\nfinal = await s.get_output()" },
        { term: "debounce_by", desc: "Throttle partial-object emission rate for UI rendering", code: "s.stream_structured(debounce_by=0.2)" },
        { term: "Agent-as-a-tool", desc: "Wrap one agent's run() inside another agent's tool for delegation", code: "@writer.tool_plain\nasync def research(topic: str) -> str:\n    return (await researcher.run(topic)).output" },
        { term: "Per-stage model choice", desc: "Cheap/fast model for sub-tasks, strong model for the final step", code: "researcher = Agent('openai:gpt-4o-mini')\nwriter = Agent('openai:gpt-4o')" },
        { term: "Parallel sub-agent calls", desc: "Run independent sub-agents concurrently, not sequentially", code: "a, b = await asyncio.gather(agent_a.run(x), agent_b.run(y))" },
        { term: "usage_limits", desc: "Bound tokens/rounds per run so a loop can't run away on cost", code: "from pydantic_ai.usage import UsageLimits\nawait agent.run(q, usage_limits=UsageLimits(\n    request_limit=5, total_tokens_limit=20000))" },
      ],
    },
    {
      title: "Testing (No Real LLM Calls)",
      color: "rose",
      rows: [
        { term: "TestModel", desc: "Deterministic stand-in producing schema-valid dummy output", code: "from pydantic_ai.models.test import TestModel\nwith agent.override(model=TestModel()):\n    result = agent.run_sync(q)" },
        { term: "FunctionModel", desc: "Scripted model behavior — assert exact tool calls/args", code: "from pydantic_ai.models.function import FunctionModel\ndef fake(messages, tools):\n    return {'tool_call': 'get_weather', 'args': {'city': 'Paris'}}\nwith agent.override(model=FunctionModel(fake)):\n    r = agent.run_sync(q)" },
        { term: "agent.override(model=...)", desc: "Swap the real model for a double, scoped to a block/test", code: "with agent.override(model=TestModel()):\n    ...  # real model never called here" },
        { term: "Disallow real requests in CI", desc: "Config flag so a forgotten override fails loudly, not silently bills you", code: "# set ALLOW_MODEL_REQUESTS=False (or equivalent) in test env" },
        { term: "Test tools in isolation", desc: "Cheapest tests: call the tool as a plain function, fake ctx.deps", code: "ctx = FakeCtx(deps=Deps(db=fake_db))\nresult = await my_tool.function(ctx, 'X')" },
        { term: "Two-tier test suite", desc: "Fast model-double tests every commit; small real-model suite on a schedule", code: "# pytest -m 'not real_llm'   -> CI on every PR\n# pytest -m 'real_llm'       -> nightly only" },
        { term: "Assert on message history", desc: "Debug/verify exactly which tool was called and with what args", code: "result.all_messages()   # full request/tool-call/response trace" },
      ],
    },
    {
      title: "Production, Observability & Pitfalls",
      color: "cyan",
      rows: [
        { term: "FastAPI integration", desc: "Await agent.run inside an async route; share result_type as response_model", code: "@app.post('/facts')\nasync def facts(q: str) -> Fact:\n    return (await agent.run(q)).output" },
        { term: "Logfire instrumentation", desc: "Traces tokens, tool calls, and validation outcomes automatically", code: "import logfire\nlogfire.configure()\nlogfire.instrument_pydantic_ai()" },
        { term: "OpenTelemetry (alt.)", desc: "Use if standardized on a different observability backend", code: "# PydanticAI supports standard OTel spans as an alternative" },
        { term: "Timeouts on provider calls", desc: "Every model call is a network call — never leave it unbounded", code: "# configure the provider HTTP client's timeout explicitly" },
        { term: "Metrics to dashboard", desc: "Tokens/run, tool calls/run, validation-retry rate, per-tool latency", code: "# rising retry rate = schema/prompt regression signal" },
        { term: "Pitfall: no usage limits", desc: "Non-converging tool loop silently burns tokens and latency", code: "# always set usage_limits in production, not just in demos" },
        { term: "Pitfall: global deps", desc: "Reaching into a module-level connection breaks testability", code: "# WRONG: db = connect()  used inside a tool directly\n# RIGHT: inject via deps_type/RunContext" },
        { term: "Pitfall: prompt injection via tools", desc: "Untrusted tool-fetched content can hijack model behavior", code: "# never let a tool result alone authorize a sensitive action" },
        { term: "Pin & read changelog", desc: "Pre-1.0-in-spirit framework — APIs shift between minor versions", code: "# lock pydantic-ai version; review release notes before upgrading" },
      ],
    },
  ],
};

export default pydanticAi;
