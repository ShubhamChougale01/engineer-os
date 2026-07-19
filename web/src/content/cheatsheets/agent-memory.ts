import type { CheatSheetData } from "./types";

const agentMemory: CheatSheetData = {
  title: "Agent Memory",
  subtitle: "Short-term, long-term, episodic, semantic, and entity memory for agents",
  sections: [
    {
      title: "Memory Types",
      color: "violet",
      rows: [
        { term: "Short-term (working)", desc: "Relevant within one ongoing task/conversation" },
        { term: "Long-term", desc: "Must persist across separate sessions" },
        { term: "Episodic", desc: "A specific past experience/interaction" },
        { term: "Semantic", desc: "Generalized knowledge, often consolidated from episodes" },
        { term: "Entity", desc: "Structured facts about a specific entity, with update semantics" },
      ],
    },
    {
      title: "Why It's Needed",
      color: "blue",
      rows: [
        { term: "LLM statelessness", desc: "Only what's in the context window is \"remembered\"" },
        { term: "Naive full-history", desc: "Hits context-window limits + grows cost with every turn" },
      ],
    },
    {
      title: "Short-Term Strategies",
      color: "amber",
      rows: [
        { term: "Truncation", desc: "Sliding window — simple, loses early detail" },
        { term: "Summarization", desc: "Extra LLM call compresses older turns, preserves gist" },
      ],
    },
    {
      title: "Long-Term (Retrieval-Based)",
      color: "emerald",
      rows: [
        { term: "Store", desc: "embed(fact) -> vector_db.upsert(..., metadata)" },
        { term: "Retrieve", desc: "similarity_search(query, k, filter={user_id})" },
        { term: "Scope in-query", desc: "NEVER post-hoc filter — structural scoping prevents leakage" },
      ],
    },
    {
      title: "Staleness & Consolidation",
      color: "rose",
      rows: [
        { term: "Retrieved ≠ correct", desc: "Compounding hallucination risk, extended across sessions" },
        { term: "Entity update semantics", desc: "Overwrite the field, don't just append a competing fact" },
        { term: "Consolidation", desc: "Periodic LLM call synthesizing episodes into semantic facts" },
      ],
    },
    {
      title: "Security",
      color: "cyan",
      rows: [
        { term: "Cross-user leakage", desc: "A genuine security/privacy incident, not just a quality bug" },
        { term: "Encrypt at rest", desc: "For sensitive stored memory content" },
        { term: "Retention policies", desc: "Apply deletion/compliance rules to stored long-term memory" },
      ],
    },
  ],
};

export default agentMemory;
