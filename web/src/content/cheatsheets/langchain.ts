import type { CheatSheetData } from "./types";

const langchain: CheatSheetData = {
  title: "LangChain",
  subtitle: "Composable chains, agents, tools, memory, and retrieval for LLM apps",
  sections: [
    {
      title: "LCEL Composition",
      color: "violet",
      rows: [
        { term: "Pipe syntax", desc: "Compose steps with |", code: "prompt | model | parser" },
        { term: "invoke", desc: "Run the chain synchronously", code: "chain.invoke({...})" },
        { term: "stream", desc: "Stream output token-by-token", code: "chain.stream({...})" },
        { term: "batch", desc: "Run over multiple inputs concurrently", code: "chain.batch([...])" },
      ],
    },
    {
      title: "Tools & Agents",
      color: "blue",
      rows: [
        { term: "@tool decorator", desc: "Turn a function into a structured, callable tool" },
        { term: "Clear descriptions", desc: "Model relies on tool docstrings to pick the right one" },
        { term: "create_tool_calling_agent", desc: "Build an agent using native function calling" },
        { term: "AgentExecutor", desc: "Runs the plan-act-observe loop (Agent Fundamentals)" },
        { term: "max_iterations", desc: "ALWAYS bound this — non-negotiable safety net" },
      ],
    },
    {
      title: "RAG Pattern",
      color: "emerald",
      rows: [
        { term: "Retriever", desc: "Wraps a vector database's ANN search", code: "vectorstore.as_retriever()" },
        { term: "RunnablePassthrough", desc: "Passes the original input through unchanged" },
        { term: "format_docs", desc: "Join retrieved docs into prompt context" },
        { term: "Retriever quality", desc: "Debug/tune independently of the rest of the chain" },
      ],
    },
    {
      title: "Memory",
      color: "amber",
      rows: [
        { term: "ChatMessageHistory", desc: "Stores conversation turns" },
        { term: "RunnableWithMessageHistory", desc: "Wraps a chain with session-scoped memory" },
        { term: "Context growth", desc: "Summarize/truncate before hitting context-window limits" },
      ],
    },
    {
      title: "Abstraction Choice",
      color: "rose",
      rows: [
        { term: "Simple chain", desc: "Fixed, well-defined process — no dynamic tool selection needed" },
        { term: "AgentExecutor", desc: "Standard, dynamic plan-act-observe tool-use loop" },
        { term: "LangGraph", desc: "Complex state, branching, cycles, human-in-the-loop (next skill)" },
      ],
    },
    {
      title: "Observability & Safety",
      color: "cyan",
      rows: [
        { term: "LangSmith", desc: "Companion tracing/eval platform — integrate from day one" },
        { term: "Black-box risk", desc: "Abstractions can hide the actual prompt sent to the model" },
        { term: "Untrusted tool results", desc: "Validate/sanitize — prompt injection risk" },
        { term: "Least privilege", desc: "Grant only the tool permissions genuinely needed" },
      ],
    },
  ],
};

export default langchain;
