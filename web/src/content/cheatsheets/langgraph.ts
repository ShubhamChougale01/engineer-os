import type { CheatSheetData } from "./types";

const langgraph: CheatSheetData = {
  title: "The Ultimate LangGraph Cheat Sheet",
  subtitle: "State & reducers · nodes & edges · cycles · checkpointing · human-in-the-loop · production toolbelt",
  sections: [
    {
      title: "Core Setup & State",
      color: "violet",
      rows: [
        { term: "State schema", desc: "Typed shared data every node reads/writes", code: "from typing import TypedDict, Annotated\nclass State(TypedDict):\n    messages: Annotated[list, add_messages]\n    iterations: int" },
        { term: "add_messages reducer", desc: "Append new messages, never overwrite history", code: "from langgraph.graph.message import add_messages\nmessages: Annotated[list, add_messages]" },
        { term: "Default overwrite field", desc: "No reducer = last node's value wins", code: "iterations: int   # each update replaces prior value" },
        { term: "Custom accumulate reducer", desc: "Concatenate lists across fan-out branches", code: "import operator\nresults: Annotated[list[str], operator.add]" },
        { term: "Install pattern", desc: "Core package, optional LangChain integration", code: "pip install langgraph\npip install langchain langchain-openai   # optional" },
        { term: "StateGraph builder", desc: "The object you wire nodes/edges onto", code: "from langgraph.graph import StateGraph, START, END\nbuilder = StateGraph(State)" },
        { term: "compile()", desc: "Validates + produces the runnable graph object", code: "graph = builder.compile()   # required before invoke/stream" },
      ],
    },
    {
      title: "Nodes & Edges",
      color: "blue",
      rows: [
        { term: "Node function", desc: "Reads state, returns a partial update", code: "def call_model(state: State) -> dict:\n    resp = llm.invoke(state['messages'])\n    return {'messages': [resp]}" },
        { term: "add_node", desc: "Register a node under a name", code: "builder.add_node('assistant', call_model)" },
        { term: "Normal edge", desc: "Always routes to the same next node", code: "builder.add_edge(START, 'assistant')\nbuilder.add_edge('assistant', END)" },
        { term: "Conditional edge", desc: "Routing function decides the next node at runtime", code: "def route(state: State) -> str:\n    return 'tools' if state['messages'][-1].tool_calls else END\nbuilder.add_conditional_edges('assistant', route, {'tools': 'tools', END: END})" },
        { term: "Cycle", desc: "Edge back to an earlier node = iterative reasoning", code: "builder.add_edge('tools', 'assistant')   # loop" },
        { term: "ToolNode (prebuilt)", desc: "Executes requested tool calls automatically", code: "from langgraph.prebuilt import ToolNode\nToolNode(tools=[search_tool, calc_tool])" },
        { term: "Subgraph as node", desc: "A compiled graph used as one node in a bigger graph", code: "top_builder.add_node('research', research_graph.compile())" },
        { term: "invoke / stream", desc: "Run once, or watch super-steps as they happen", code: "graph.invoke(initial_state, config)\nfor step in graph.stream(initial_state, config, stream_mode='updates'):\n    print(step)" },
      ],
    },
    {
      title: "Cycles, Iteration Caps & Fan-out",
      color: "emerald",
      rows: [
        { term: "Iteration cap pattern", desc: "Never trust the model alone to stop looping", code: "def route(state):\n    if state['iterations'] >= MAX_ITER: return END\n    return 'tools' if state['messages'][-1].tool_calls else END" },
        { term: "recursion_limit", desc: "Runtime-level hard stop as a backstop", code: "graph.invoke(state, {**config, 'recursion_limit': 25})" },
        { term: "Send (fan-out)", desc: "Dispatch parallel node invocations in one super-step", code: "from langgraph.types import Send\ndef fan_out(state):\n    return [Send('worker', {'item': i}) for i in state['items']]" },
        { term: "Fan-in", desc: "Parallel branches merge via each field's reducer", code: "results: Annotated[list[str], operator.add]  # collects all branch outputs" },
        { term: "Planner-executor cycle", desc: "Loop between planning and acting nodes", code: "builder.add_edge('executor', 'planner')  # replan after each action" },
        { term: "Draft-critique-revise cycle", desc: "Reflection pattern as a graph loop", code: "builder.add_conditional_edges('critique', lambda s: 'revise' if not s['ok'] else END)" },
        { term: "Super-step", desc: "One round: active nodes run, updates merge, then re-route", code: "# Pregel-style bulk-synchronous-parallel execution model" },
      ],
    },
    {
      title: "Checkpointing, Threads & Time Travel",
      color: "amber",
      rows: [
        { term: "MemorySaver", desc: "In-memory checkpointer — dev/tests ONLY", code: "from langgraph.checkpoint.memory import MemorySaver\ngraph = builder.compile(checkpointer=MemorySaver())" },
        { term: "SqliteSaver", desc: "Durable single-process checkpointer", code: "from langgraph.checkpoint.sqlite import SqliteSaver\nwith SqliteSaver.from_conn_string('checkpoints.db') as cp:\n    graph = builder.compile(checkpointer=cp)" },
        { term: "PostgresSaver", desc: "Durable production-grade checkpointer", code: "from langgraph.checkpoint.postgres import PostgresSaver\nwith PostgresSaver.from_conn_string(DB_URL) as cp:\n    graph = builder.compile(checkpointer=cp)" },
        { term: "thread_id", desc: "Identifier addressing a run's persisted state", code: "config = {'configurable': {'thread_id': 'conv-42'}}\ngraph.invoke(state, config)" },
        { term: "Resume a thread", desc: "Same thread_id continues from last checkpoint", code: "graph.invoke(new_message_state, config)  # picks up prior context" },
        { term: "get_state / get_state_history", desc: "Inspect current or historical checkpoints", code: "graph.get_state(config)\nlist(graph.get_state_history(config))" },
        { term: "Time travel", desc: "Edit an earlier checkpoint, then resume from it", code: "graph.update_state(old_checkpoint.config, {'messages': [...]})\ngraph.invoke(None, old_checkpoint.config)" },
        { term: "Crash-resume test", desc: "The one test every production graph needs", code: "# invoke -> discard in-memory graph -> reload -> invoke\n# with SAME thread_id -> assert it resumes, not restarts" },
      ],
    },
    {
      title: "Human-in-the-Loop & Pitfalls",
      color: "rose",
      rows: [
        { term: "interrupt()", desc: "Pause execution, surface a payload for review", code: "from langgraph.types import interrupt\ndecision = interrupt({'question': 'approve?', 'draft': state['draft']})" },
        { term: "Command(resume=...)", desc: "Resume a paused thread with a human decision", code: "from langgraph.types import Command\ngraph.invoke(Command(resume='approve'), config)" },
        { term: "Interrupts need a checkpointer", desc: "Paused state must persist somewhere between pause/resume", code: "graph = builder.compile(checkpointer=checkpointer)  # required" },
        { term: "Gate irreversible actions", desc: "Never rely on prompt wording to enforce approval", code: "# WRONG: 'please confirm before sending' in system prompt\n# RIGHT: interrupt() before the send_email node" },
        { term: "Missing reducer bug", desc: "Silent overwrite instead of accumulation", code: "# WRONG: messages: list          (overwritten each node)\n# RIGHT: messages: Annotated[list, add_messages]" },
        { term: "Infinite cycle bug", desc: "Routing fn never returns END under real conditions", code: "# always test the cap-triggered path, not just the happy path" },
        { term: "Fan-out clobbering", desc: "Concurrent nodes overwrite the same scalar field", code: "# give shared fields an accumulating reducer, or\n# write to distinct fields per branch" },
        { term: "MemorySaver in prod", desc: "All state vanishes on restart — dev/test only", code: "# use SqliteSaver / PostgresSaver for anything durable" },
        { term: "Reaching for LangGraph unnecessarily", desc: "Pure overhead for linear, single-shot tasks", code: "# no branching, no cycles, no persistence needed?\n# use a plain function or a simple chain instead" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Structured per-step logging", desc: "Log node name + updated keys per super-step", code: "for step in graph.stream(state, config, stream_mode='updates'):\n    node = next(iter(step))\n    log.info('graph_step', node=node, keys=list(step[node]))" },
        { term: "Key metrics to track", desc: "Iterations/run, interrupt rate, per-node latency", code: "REQUESTS = Counter('graph_iterations_total', ...)\nLATENCY.labels(node='assistant').time()" },
        { term: "Health checks", desc: "readyz should verify checkpointer + LLM reachable", code: "GET /healthz -> process alive\nGET /readyz  -> checkpointer + LLM API reachable" },
        { term: "Async job model for long runs", desc: "Never hold an HTTP connection open across an interrupt", code: "# resume via a separate webhook/polling call, not\n# a single long-held request" },
        { term: "Tracing", desc: "Per-node, per-super-step spans (LangSmith or OTel)", code: "# wraps node calls automatically when LangSmith tracing\n# env vars are configured" },
        { term: "Node-level unit tests", desc: "Test routing functions with hand-built fake state", code: "def test_route_to_tools():\n    state = {'messages': [fake_msg_with_tool_call]}\n    assert route(state) == 'tools'" },
        { term: "Mocked-LLM graph tests", desc: "Deterministic integration tests, no real API calls", code: "with patch('myapp.nodes.llm') as mock:\n    mock.invoke.side_effect = [tool_call_msg, final_msg]\n    result = graph.invoke(state)" },
        { term: "Dockerfile pattern", desc: "Slim base, non-root user, cached deps layer", code: "FROM python:3.12-slim\nRUN useradd -m appuser\nUSER appuser\nCMD [\"uvicorn\", \"app.main:app\"]" },
        { term: "Checkpoint retention", desc: "Storage grows every super-step — archive/prune old threads", code: "# define a retention policy; don't let checkpoint\n# tables grow unbounded forever" },
      ],
    },
  ],
};

export default langgraph;
