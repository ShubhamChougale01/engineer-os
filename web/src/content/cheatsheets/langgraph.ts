import type { CheatSheetData } from "./types";

const langgraph: CheatSheetData = {
  title: "LangGraph",
  subtitle: "Stateful, branching, cyclic agent workflows as an explicit graph",
  sections: [
    {
      title: "Core Graph Model",
      color: "violet",
      rows: [
        { term: "StateGraph", desc: "Typed, shared state object threading through the graph" },
        { term: "add_node", desc: "Register a processing step", code: "g.add_node(name, fn)" },
        { term: "add_edge", desc: "Unconditional transition", code: "g.add_edge(a, b)" },
        { term: "add_conditional_edges", desc: "Branch based on current state", code: "g.add_conditional_edges(a, router, {...})" },
        { term: "compile()", desc: "Finalize the graph into a runnable app" },
      ],
    },
    {
      title: "Cycles",
      color: "blue",
      rows: [
        { term: "Cycle", desc: "An edge routes back to an earlier node based on state" },
        { term: "Reflection loop", desc: "generate -> critique -> (retry) generate" },
        { term: "ALWAYS bound it", desc: "Check retry_count against a max — non-negotiable" },
      ],
    },
    {
      title: "Human-in-the-Loop",
      color: "amber",
      rows: [
        { term: "interrupt_before", desc: "Pause execution before a named node", code: "compile(interrupt_before=[...])" },
        { term: "Checkpointer", desc: "Persists state during the pause" },
        { term: "Durable checkpointer", desc: "Postgres-backed, NOT MemorySaver, in production" },
        { term: "Resume", desc: "Continue only after explicit human approval" },
      ],
    },
    {
      title: "Multi-Agent & Subgraphs",
      color: "emerald",
      rows: [
        { term: "Coordinator-specialist", desc: "One node delegates, others execute in parallel" },
        { term: "Parallel nodes", desc: "Fan-out to independent nodes, fan back in" },
        { term: "Subgraph", desc: "A smaller graph embedded as one node — modular, reusable" },
      ],
    },
    {
      title: "When to Use LangGraph",
      color: "rose",
      rows: [
        { term: "Use LangChain instead", desc: "Simple, linear, standard tool-use loop" },
        { term: "Use LangGraph", desc: "Explicit state, branching, cycles, precise HITL checkpoints" },
        { term: "Debugging edge", desc: "Explicit typed state is directly inspectable at every node" },
      ],
    },
    {
      title: "Production Non-Negotiables",
      color: "cyan",
      rows: [
        { term: "Model genuine structure", desc: "Don't over-engineer a simple task into a graph" },
        { term: "Bound every cycle", desc: "Max retry/iteration count, always" },
        { term: "Precise interrupts", desc: "Place only at genuinely high-risk nodes" },
        { term: "Trace with LangSmith", desc: "Leverage explicit state for observability" },
      ],
    },
  ],
};

export default langgraph;
