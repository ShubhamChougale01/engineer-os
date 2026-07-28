import type { CheatSheetData } from "./types";

const agentMemory: CheatSheetData = {
  title: "The Ultimate Agent Memory Cheat Sheet",
  subtitle: "Short-term vs long-term memory · episodic/semantic/procedural · compression · retrieval · pitfalls",
  sections: [
    {
      title: "Memory Types",
      color: "violet",
      rows: [
        { term: "Short-term (working) memory", desc: "The current conversation buffer within the context window", code: "messages = [system, user_1, assistant_1, user_2, ...]" },
        { term: "Long-term memory", desc: "Persisted across sessions, retrieved on demand via similarity search", code: "relevant = vector_store.search(query_embedding, k=5)" },
        { term: "Episodic memory", desc: "Specific past events/interactions ('what happened')", code: "{'event': 'user asked about refunds on 2026-03-01', ...}" },
        { term: "Semantic memory", desc: "General facts/knowledge distilled from many interactions", code: "{'fact': 'user prefers concise responses'}" },
        { term: "Procedural memory", desc: "Learned patterns of how to do something (skills, workflows)", code: "{'procedure': 'always confirm order ID before refund'}" },
      ],
    },
    {
      title: "Storage & Retrieval",
      color: "blue",
      rows: [
        { term: "Vector-store-backed retrieval", desc: "Embed memories, retrieve by semantic similarity to current query", code: "store.add(text, embedding)\nresults = store.search(query_embedding, k=5)" },
        { term: "Write policy", desc: "Decide what gets stored — not every turn deserves persistence", code: "if is_significant(turn): memory_store.write(summarize(turn))" },
        { term: "Read policy", desc: "Decide when/how much memory to inject into context", code: "context = recent_turns + retrieved_memories[:budget]" },
        { term: "Recency + relevance scoring", desc: "Combine similarity score with recency decay", code: "score = similarity * recency_weight(timestamp)" },
        { term: "Memory namespacing", desc: "Scope memories per user/session to avoid cross-contamination", code: "store.search(query, filter={'user_id': uid})" },
      ],
    },
    {
      title: "Compression & Summarization",
      color: "emerald",
      rows: [
        { term: "Context window pressure", desc: "Raw conversation history grows unbounded; must be managed", code: "if len(tokens) > budget: summarize_older_turns()" },
        { term: "Rolling summarization", desc: "Periodically compress older turns into a running summary", code: "summary = llm.summarize(summary + new_turns)" },
        { term: "Hierarchical summaries", desc: "Summaries of summaries for very long-running agents", code: "daily_summary -> weekly_summary -> profile_summary" },
        { term: "Selective forgetting", desc: "Explicitly drop low-value memories rather than keep everything", code: "if memory.relevance_score < threshold: expire(memory)" },
      ],
    },
    {
      title: "Production Design",
      color: "amber",
      rows: [
        { term: "Memory budget", desc: "Fixed token/item budget for injected memory per request", code: "MAX_MEMORY_TOKENS = 1000" },
        { term: "Memory versioning", desc: "Track when a memory was written and by what agent/model version", code: "{'text': ..., 'written_at': ts, 'model': 'v3'}" },
        { term: "Contradiction handling", desc: "New info should supersede, not just append to, stale memory", code: "if new_fact.contradicts(old_fact): mark_stale(old_fact)" },
        { term: "TTL / expiry", desc: "Time-bound ephemeral memories so they don't persist forever", code: "memory.expires_at = now() + timedelta(days=30)" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "rose",
      rows: [
        { term: "Unbounded memory growth", desc: "No eviction policy — storage and retrieval cost grow forever", code: "# always define a retention/eviction policy up front" },
        { term: "Stale/contradictory memories", desc: "Old facts never get updated when circumstances change", code: "# version and supersede, don't just accumulate" },
        { term: "Over-injecting memory", desc: "Cramming too much retrieved memory drowns out the current task", code: "# cap retrieved memories and rank by relevance, not recency alone" },
        { term: "PII / privacy retention risk", desc: "Long-term memory can silently retain sensitive user data", code: "# apply redaction/retention policy before persisting" },
        { term: "Confusing memory with RAG", desc: "Agent memory is about the agent's own interaction history, not a general knowledge base", code: "# use RAG for external knowledge, memory for interaction state" },
      ],
    },
    {
      title: "Related Skills",
      color: "cyan",
      rows: [
        { term: "Vector Search", desc: "The retrieval mechanism underlying most long-term memory stores", code: "# HNSW/IVF power the similarity search step" },
        { term: "Embeddings", desc: "How memories are represented for similarity comparison", code: "embedding = embed_model.encode(memory_text)" },
        { term: "RAG", desc: "Shares infrastructure with memory retrieval but serves external knowledge", code: "# RAG: external docs. Memory: agent's own history." },
        { term: "LangGraph", desc: "Provides checkpointing/persistence primitives often used for agent memory", code: "checkpointer = SqliteSaver.from_conn_string('memory.db')" },
        { term: "Planning / Reflection", desc: "Both consume memory to inform future plans and self-critique", code: "# retrieved past mistakes inform current plan" },
      ],
    },
  ],
};

export default agentMemory;
