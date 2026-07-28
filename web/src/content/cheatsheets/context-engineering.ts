import type { CheatSheetData } from "./types";

const contextEngineering: CheatSheetData = {
  title: "The Ultimate Context Engineering Cheat Sheet",
  subtitle: "Token budgets · retrieval & reranking · compression · caching · agent memory · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Context engineering", desc: "Curating the FULL context payload, not just wording one instruction", code: "system + few-shot + retrieved\n+ history + tool schemas + query\n= one shared token budget" },
        { term: "Context window", desc: "Hard token ceiling for input + output combined", code: "usable_input = window - reserved_output\nnever max it out; leave headroom" },
        { term: "Lost in the middle", desc: "Facts recalled less reliably from the middle of a long context than the edges", code: "put critical facts near START or END\nnever bury them alone mid-context" },
        { term: "Needle-in-a-haystack test", desc: "Insert a known fact at varying depths, check recall", code: "insert needle at 0%,25%,50%,75%,100%\nmeasure recall rate per position" },
        { term: "Nominal vs reliable window", desc: "Advertised max tokens != guaranteed recall at that length", code: "always re-test YOUR model + length\nnever trust the marketing number alone" },
        { term: "Prompt engineering (subset)", desc: "Wording ONE instruction well; a tool within context engineering", code: "prompt eng: 'write clearer text'\ncontext eng: 'curate the whole payload'" },
        { term: "Attention dilution", desc: "More tokens = more competing signal, not more free knowledge", code: "smaller, high-precision context\noften beats larger, noisy context" },
        { term: "Token, not word, accounting", desc: "Always count with the real tokenizer", code: "import tiktoken\nenc = tiktoken.get_encoding('cl100k_base')\nlen(enc.encode(text))" },
      ],
    },
    {
      title: "Context Building Blocks (the budget)",
      color: "blue",
      rows: [
        { term: "System prompt", desc: "Stable instructions; put critical rules here, near the start", code: "fixed_tokens = count(system_prompt)\n+ count(tool_schemas)" },
        { term: "Few-shot examples", desc: "Demonstrations; cost tokens on every call — keep minimal and high-value", code: "few_shot_budget = 1_200  # tokens\nonly keep examples that changed output" },
        { term: "Retrieved context (RAG)", desc: "The biggest lever you control; narrow it hard", code: "retrieval_budget = remaining * 0.7\ntop_k = 5  # after reranking, not raw" },
        { term: "Conversation history", desc: "Cap and summarize; never let it grow unbounded", code: "history_budget = remaining * 0.3\nkeep_last = 6  # raw turns" },
        { term: "Tool / function schemas", desc: "Grows with tool count — filter to task-relevant tools only", code: "tools_for_call = filter_relevant(\n  all_tools, current_task)" },
        { term: "Scratchpad / reasoning space", desc: "Working notes for agents; reserve output tokens for it", code: "reserved_output = 4_000\nusable_input = window - reserved_output" },
        { term: "Budget policy function", desc: "One place enforces the split, not scattered code", code: "def build_budget(window, max_out):\n    remaining = window - fixed - max_out\n    return split(remaining)" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Labeled context block", desc: "Fence and label retrieved content so the model treats it as data", code: "context = '\\n\\n'.join(\n  f'[SOURCE {i}: {d.title}]\\n{d.text}'\n  for i, d in enumerate(docs))" },
        { term: "Summarize older history", desc: "Rolling summary + recent raw turns", code: "older, recent = msgs[:-6], msgs[-6:]\nsummary = summarizer_llm.complete(\n  join(older), max_tokens=200)" },
        { term: "Extractive compression", desc: "Keep top-ranked original spans verbatim", code: "top_sentences = rerank(sentences, query)\nkeep = top_sentences[:n]  # no rewriting" },
        { term: "Abstractive compression", desc: "Model rewrites more densely — check faithfulness after", code: "summary = llm.complete(\n  f'Summarize in <150 words: {text}')\nassert entailed(summary, text)" },
        { term: "Reranking pipeline", desc: "Wide vector search, then narrow with a cross-encoder", code: "candidates = vector_search(q, k=50)\nscored = reranker.score(q, candidates)\ntop5 = sorted(scored)[:5]" },
        { term: "Tool-result compression", desc: "Summarize raw tool output before it re-enters the loop", code: "if len(raw) > 500:\n    raw = summarize_for_goal(raw, goal)" },
        { term: "Instruction reinforcement", desc: "Restate the key constraint near the end too", code: "prompt = system + context + question\n+ 'Remember: respond in JSON only.'" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Prompt caching (KV reuse)", desc: "Reuses computed key/value state for a repeated PREFIX", code: "request = {\n  'system': static_prompt,  # cached\n  'messages': [dynamic_question]}" },
        { term: "Cache-aware ordering", desc: "Stable content FIRST, variable content LAST — required for hits", code: "prompt = system + tools + docs\n+ user_question   # variable, always last" },
        { term: "Semantic caching (sibling skill)", desc: "Skips the LLM call for a similar PAST query — different from prompt cache", code: "if semantic_cache.hit(query):\n    return semantic_cache.get(query)\n# else call the LLM" },
        { term: "Hierarchical summarization", desc: "Summarize chunks, then summarize the summaries — bounds growth", code: "level1 = [summarize(b) for b in batches]\nmeta = summarize(level1)  # recurse" },
        { term: "Prompt-compression tooling", desc: "Drop low-information tokens (LLMLingua-style); validate on your task", code: "compressed = compressor.compress(\n  prompt, target_ratio=0.5)\neval_quality(compressed)  # don't skip" },
        { term: "Cache hit/miss inspection", desc: "Confirm your 'stable' prefix is truly stable", code: "stats = prompt_cache_stats(request_id)\n# {'cached_prefix_tokens':1200,'hit':True}" },
        { term: "Per-component token logging", desc: "Instrument every call before optimizing anything", code: "log.info('llm_call',\n  tokens=token_counts, latency_s=elapsed)" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Context stuffing", desc: "Pasting a whole document in instead of retrieving relevant chunks", code: "# WRONG\nprompt = entire_manual_text + question\n# RIGHT: retrieve + rerank first" },
        { term: "Unbounded history", desc: "Appending every turn forever — cost + lost-in-middle risk grow", code: "# WRONG: messages.append(new); send ALL\n# RIGHT: compress_history(messages, 6)" },
        { term: "Raw tool-output flooding", desc: "Unfiltered JSON/HTML dumped into context every loop iteration", code: "# compress before reinsertion, always\nresult = summarize_tool_result(raw, goal)" },
        { term: "Breaking the cache prefix", desc: "Variable content placed before stable content", code: "# WRONG\nprompt = question + system_prompt\n# RIGHT\nprompt = system_prompt + question" },
        { term: "Stale cache from non-determinism", desc: "Timestamps / unordered dicts silently break prefix matching", code: "# audit the 'stable' prefix for hidden\n# non-determinism (dict order, clocks)" },
        { term: "Context poisoning", desc: "False info persisted into long-term memory, silently reused every turn", code: "validate_and_tag(fact, source)\n# before writing to long-term memory" },
        { term: "Context/prompt injection", desc: "Untrusted retrieved text disguised as an instruction", code: "# fence retrieved content as DATA\n<context>untrusted doc text</context>" },
        { term: "Over-retrieval", desc: "Bigger top-k 'to be safe' dilutes attention and hurts accuracy", code: "# precision > recall once docs are\n# already in the candidate pool" },
        { term: "Trusting nominal window size", desc: "Advertised max tokens is not a reliability guarantee", code: "# always run your own needle test\n# at production length + model version" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Context assembler module", desc: "One testable place that enforces budget + ordering", code: "def assemble_context(system, tools,\n  retrieved, history, query, budget): ..." },
        { term: "Budget enforcement", desc: "Fail loud, not silent, when fixed content exceeds budget", code: "if remaining <= 0:\n    raise ValueError('budget exceeded')" },
        { term: "Faithfulness check", desc: "LLM-as-judge or entailment check on compressed summaries", code: "assert judge_entails(source, summary)\n# catch compression hallucinations" },
        { term: "Needle-in-haystack harness", desc: "Reusable eval for position-sensitivity", code: "results = needle_recall_by_position(\n  llm, filler, needle, [0,.25,.5,.75,1])" },
        { term: "Token/cost dashboard", desc: "Prometheus histogram per context component", code: "CONTEXT_TOKENS = Histogram(\n  'llm_context_tokens', ['component'])" },
        { term: "Cache-hit-rate monitoring", desc: "A dropping hit rate signals broken prefix determinism", code: "cache_hit_rate = hits / total_calls\nalert_if(cache_hit_rate < threshold)" },
        { term: "Multi-stage pipeline", desc: "Retrieve wide -> rerank narrow -> compress -> budget -> order", code: "vector_search -> rerank -> compress\n-> enforce_budget -> cache_order" },
        { term: "A/B eval on strategy changes", desc: "Never ship a top-k/compression change without re-running evals", code: "eval_accuracy(config_a)\neval_accuracy(config_b)\ncompare(cost, latency, accuracy)" },
        { term: "Related platform skills", desc: "Where each concern is covered in depth", code: "RAG, Vector Search, Embeddings\nAgent Memory, Semantic Caching\nCost Optimization, Latency, AI Evals" },
      ],
    },
  ],
};

export default contextEngineering;
