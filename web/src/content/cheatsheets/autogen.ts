import type { CheatSheetData } from "./types";

const autogen: CheatSheetData = {
  title: "AutoGen",
  subtitle: "Microsoft's conversation-centric multi-agent framework",
  sections: [
    {
      title: "Core Abstractions",
      color: "violet",
      rows: [
        { term: "ConversableAgent", desc: "Base building block — sends/receives messages" },
        { term: "AssistantAgent", desc: "Proposes responses/code", code: "AssistantAgent(name, system_message, llm_config)" },
        { term: "UserProxyAgent", desc: "Executes code or represents a human", code: "UserProxyAgent(name, human_input_mode, code_execution_config)" },
      ],
    },
    {
      title: "Assistant/User-Proxy Pattern",
      color: "blue",
      rows: [
        { term: "Loop", desc: "Assistant proposes → user-proxy executes → reports back → repeat" },
        { term: "Maps to", desc: "Agent Fundamentals' plan-act-observe loop, as a 2-party conversation" },
        { term: "Code execution", desc: "First-class capability distinguishing AutoGen" },
      ],
    },
    {
      title: "human_input_mode (Autonomy Tiers)",
      color: "amber",
      rows: [
        { term: "NEVER", desc: "Fully autonomous" },
        { term: "ALWAYS", desc: "Fully human-supervised — every turn" },
        { term: "TERMINATE", desc: "Human input only when conversation would end" },
      ],
    },
    {
      title: "GroupChat",
      color: "emerald",
      rows: [
        { term: "GroupChat", desc: "Coordinates 3+ agents", code: "GroupChat(agents, messages, max_round)" },
        { term: "GroupChatManager", desc: "Decides who speaks next (default: LLM-driven)" },
        { term: "speaker_selection_method", desc: "Custom fn for deterministic, predictable turn order" },
      ],
    },
    {
      title: "Safety Non-Negotiables",
      color: "rose",
      rows: [
        { term: "use_docker=True", desc: "ALWAYS sandbox automated code execution" },
        { term: "max_round", desc: "Bound the whole GroupChat's total turns" },
        { term: "max_consecutive_auto_reply", desc: "Bound one agent's own reply loop" },
        { term: "Termination signal", desc: "e.g., a \"TERMINATE\" keyword the assistant emits" },
      ],
    },
    {
      title: "Comparisons",
      color: "cyan",
      rows: [
        { term: "vs. LangGraph", desc: "More flexible, less deterministic by default" },
        { term: "vs. CrewAI", desc: "Conversation metaphor vs. team/role metaphor" },
        { term: "Compounding hallucination fix", desc: "Add a dedicated verifier/fact-checking agent" },
      ],
    },
  ],
};

export default autogen;
