import type { CheatSheetData } from "./types";

const openaiAgentsSdk: CheatSheetData = {
  title: "OpenAI Agents SDK",
  subtitle: "Agents, Handoffs, Guardrails, and Sessions — OpenAI's native agent framework",
  sections: [
    {
      title: "Core Primitives",
      color: "violet",
      rows: [
        { term: "Agent", desc: "LLM + instructions + tools + config", code: "Agent(name, instructions, tools=[...])" },
        { term: "Runner", desc: "Executes an agent run", code: "Runner.run_sync(agent, input)" },
        { term: "@function_tool", desc: "Turn a function into a structured tool" },
        { term: "Lineage", desc: "Production successor to OpenAI's experimental \"Swarm\" project" },
      ],
    },
    {
      title: "Handoffs",
      color: "blue",
      rows: [
        { term: "Handoff", desc: "One agent transfers conversation control to another", code: "Agent(handoffs=[a, b])" },
        { term: "Design like CrewAI roles", desc: "Genuinely distinct targets, not overlapping" },
        { term: "vs. LangGraph edges", desc: "Lightweight, LLM-reasoning-driven vs. explicit, precise, code-level" },
      ],
    },
    {
      title: "Guardrails",
      color: "rose",
      rows: [
        { term: "First-class primitive", desc: "Not a bolted-on afterthought — part of Agent definition" },
        { term: "input_guardrails", desc: "Validate before the agent processes a request" },
        { term: "output_guardrails", desc: "Validate before a response reaches the user" },
        { term: "tripwire_triggered", desc: "Halts execution when a check fails" },
        { term: "Apply chain-wide", desc: "Every agent in a handoff chain — a handoff can bypass entry-point-only checks" },
      ],
    },
    {
      title: "Sessions",
      color: "amber",
      rows: [
        { term: "SQLiteSession", desc: "Built-in, automatic multi-turn conversation memory" },
        { term: "Context growth", desc: "Manage explicitly for very long conversations" },
      ],
    },
    {
      title: "Observability",
      color: "cyan",
      rows: [
        { term: "Native tracing", desc: "Built-in dashboard — no separate tool integration needed" },
        { term: "Addresses black-box risk", desc: "Same concern raised in the LangChain skill" },
      ],
    },
    {
      title: "Design Tradeoff",
      color: "emerald",
      rows: [
        { term: "Choose the SDK when", desc: "Committed to OpenAI models, want minimal footprint + native tracing" },
        { term: "Choose LangChain/LangGraph when", desc: "Need multi-provider flexibility or broader ecosystem" },
      ],
    },
  ],
};

export default openaiAgentsSdk;
