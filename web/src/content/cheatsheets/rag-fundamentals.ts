import type { CheatSheetData } from "./types";

const ragFundamentals: CheatSheetData = {
  title: "The Ultimate RAG Cheat Sheet",
  subtitle: "Retrieval-Augmented Generation · chunking · hybrid search · re-ranking · advanced patterns · production toolbelt",
  sections: [
    {
      title: "Core Pipeline",
      color: "violet",
      rows: [
        { term: "RAG in one line", desc: "Retrieve relevant docs, then condition LLM generation on them", code: "context = retrieve(query)\nanswer = llm.generate(prompt(context, query))" },
        { term: "Why RAG over fine-tuning", desc: "Re-index a changed doc (cheap/fast) vs. retrain the model (slow/expensive)", code: "update_doc() -> re_embed() -> re_index()\n# seconds to minutes, not a training run" },
        { term: "Ingestion (offline)", desc: "Load -> chunk -> embed -> index, paid once per document", code: "chunks = chunk(doc)\nvectors = [embed(c) for c in chunks]\nindex.add(vectors)" },
        { term: "Query time (online)", desc: "Rewrite -> retrieve -> rerank -> assemble -> generate, paid per request", code: "q = rewrite(query)\ncands = index.search(q, k=50)\ntop = rerank(q, cands)[:5]" },
        { term: "Grounded prompt", desc: "Instruct the model to answer only from context, else decline", code: "'Answer using ONLY the context below.\nIf not present, say you do not know.'" },
        { term: "Embed-once, query-many", desc: "Ingestion cost paid once; retrieval cost paid every query", code: "# this asymmetry is why ANN indexing\n# (see Vector Search) matters at scale" },
      ],
    },
    {
      title: "Chunking Strategies",
      color: "blue",
      rows: [
        { term: "Fixed-size", desc: "Split by character/token count with overlap; simplest, cuts arbitrarily", code: "for start in range(0, len(text), size - overlap):\n    chunks.append(text[start:start+size])" },
        { term: "Recursive", desc: "Try paragraph, then sentence, then word separators in order", code: "separators = ['\\n\\n', '\\n', '. ', ' ']\n# fall back to finer split only if still too big" },
        { term: "Semantic chunking", desc: "Split where embedding similarity between sentences drops sharply", code: "sims = [cos(embed(s[i]), embed(s[i+1])) for i in ...]\nsplit where sims[i] < threshold" },
        { term: "Structure-aware", desc: "Split on headers/code fences/tables; best for structured docs", code: "# never split inside a code block or table\n# fallback to recursive within a section" },
        { term: "No universal best", desc: "Chunking quality is corpus- and document-type-dependent", code: "# validate against your own labeled eval set,\n# don't copy a chunk-size number from a blog" },
        { term: "Overlap", desc: "Preserve boundary context so a sentence isn't orphaned", code: "start = end - overlap  # step back before next chunk" },
      ],
    },
    {
      title: "Retrieval & Metrics",
      color: "emerald",
      rows: [
        { term: "Dense retrieval", desc: "Embedding similarity; finds paraphrases/synonyms", code: "sims = [cos(query_vec, v) for v in vectors]\ntop_k = argsort(sims)[::-1][:k]" },
        { term: "Sparse retrieval (BM25)", desc: "Term-overlap scoring; wins on exact codes/names/acronyms", code: "score += idf(term) * tf(term) / (tf + k1*(1-b+b*len/avg))" },
        { term: "Hybrid search", desc: "Fuse dense + sparse; the practical default, not an add-on", code: "fused = reciprocal_rank_fusion(dense_ranked, bm25_ranked)" },
        { term: "Reciprocal Rank Fusion", desc: "Combine ranked lists without normalizing incompatible scores", code: "score[doc] += 1 / (k_rrf + rank + 1)  # sum per list" },
        { term: "recall@k", desc: "Fraction of true relevant items returned in top k", code: "recall = len(top_k & relevant) / len(relevant)" },
        { term: "precision@k", desc: "Fraction of top k results that are actually relevant", code: "precision = len(top_k & relevant) / k" },
        { term: "MRR", desc: "Average of 1/rank of the first relevant result", code: "mrr = mean(1 / rank_of_first_relevant)" },
        { term: "nDCG", desc: "Rewards relevant results ranked higher; handles graded relevance", code: "# use when some chunks are more relevant than others,\n# not just binary relevant/irrelevant" },
        { term: "Re-ranking", desc: "Cross-encoder re-scores a small candidate set precisely", code: "cands = index.search(q, k=50)\ntop = reranker.score([(q, c) for c in cands])[:5]" },
      ],
    },
    {
      title: "Advanced Patterns",
      color: "amber",
      rows: [
        { term: "Query rewriting", desc: "LLM resolves references/expands terse queries before retrieval", code: "standalone_q = llm.generate(rewrite_prompt(history, query))" },
        { term: "HyDE", desc: "Embed a generated hypothetical answer, not the raw query", code: "hyp = llm.generate('write a plausible answer to: ' + q)\nquery_vec = embed(hyp)" },
        { term: "Multi-hop retrieval", desc: "Retrieve, check if enough info, retrieve again on the gap", code: "while not done and hops < max_hops:\n    gathered += index.search(current_query)\n    current_query = llm.identify_gap(gathered, question)" },
        { term: "Agentic RAG", desc: "LLM decides dynamically when/what to retrieve as a tool", code: "# retrieval is one tool among several in an agent loop\n# more flexible, less predictable/mature as of writing" },
        { term: "GraphRAG", desc: "Knowledge graph + vector retrieval for relational questions", code: "# use when queries are frequently relational\n# ('who works at companies acquired by X'), not just semantic" },
        { term: "Lost-in-the-middle", desc: "Models underuse info buried mid-context vs. start/end", code: "# order context deliberately: most relevant chunk\n# last, closest to the question -- validate per model" },
      ],
    },
    {
      title: "Failure Modes & Pitfalls",
      color: "rose",
      rows: [
        { term: "Irrelevant chunk retrieval", desc: "Weak retrieval dilutes context with noise", code: "if top_score < MIN_CONFIDENCE:\n    return 'I do not have enough information.'" },
        { term: "Stale index", desc: "Corpus changes but re-ingestion never runs; no error, just wrong answers", code: "schedule(reingest_job)\nmonitor(time_since_last_reingest)" },
        { term: "Chunking breaks semantic units", desc: "Fixed-size split cuts a table/function/fact in half", code: "# use structure-aware chunking + adequate overlap" },
        { term: "Embedding model mismatch", desc: "Query embedded with different model version than corpus", code: "assert query_model_version == index_model_version" },
        { term: "Post-filter with narrow filter", desc: "Small k discarded after filtering returns too few results", code: "# WRONG: search(k=10) then filter\n# RIGHT: search(k=200) then filter, or filtered ANN" },
        { term: "Citation bolted on late", desc: "No source labels in context assembly -> can't cite correctly", code: "'[Source 1: ' + doc.source + ']\\n' + chunk_text" },
        { term: "Access control as app-layer filter only", desc: "Retrieval-layer bug leaks another tenant's docs", code: "index.search(q, k=10, filter={'tenant_id': user.tenant})" },
        { term: "Premature agentic/multi-hop RAG", desc: "Added before validating simple pipeline actually fails", code: "# measure naive hybrid+rerank pipeline first;\n# add complexity only where eval shows it's needed" },
        { term: "Indirect prompt injection", desc: "Retrieved content can contain hidden instructions", code: "# treat retrieved chunks as untrusted input,\n# not as instructions to the model" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Minimal pipeline (Python)", desc: "Chunk -> embed -> index -> retrieve -> generate", code: "pipeline.ingest(doc_text, source='policy.md')\npipeline.answer('What is the refund policy?')" },
        { term: "Confidence guard", desc: "Explicit fallback when retrieval is weak", code: "results = [r for r in retrieved if r.score >= threshold]\nif not results: return DECLINE_MESSAGE" },
        { term: "Retrieval evaluation harness", desc: "Test retriever independent of the LLM", code: "eval = evaluate_retrieval(pipeline, labeled_queries, k=5)\n# {'recall_at_k':, 'mrr':}" },
        { term: "Faithfulness check (LLM-as-judge)", desc: "Does the answer only contain claims from context?", code: "judge_llm.generate(faithfulness_prompt(answer, context))" },
        { term: "Ingestion trigger", desc: "Event-driven or scheduled, never manual-only", code: "on_document_updated(doc) -> reingest(doc)" },
        { term: "Latency breakdown", desc: "Measure retrieval, rerank, generation separately", code: "RETRIEVAL_LATENCY.time()\nRERANK_LATENCY.time()\nGENERATION_LATENCY.time()" },
        { term: "Freshness monitoring", desc: "Alert on stale sources, not just errors", code: "if time_since_last_reindex(source) > SLA:\n    alert('index stale: ' + source)" },
        { term: "Readiness check", desc: "Don't serve traffic until index is loaded", code: "/healthz  # process alive\n/readyz   # index loaded and ready" },
        { term: "Query parameter caps", desc: "Prevent DoS via huge k / candidate counts", code: "k = min(requested_k, MAX_K)" },
        { term: "Related skills", desc: "The dependency chain this page sits in", code: "Embeddings -> Vector Search -> RAG\n-> LangChain / LlamaIndex -> Knowledge Graphs" },
      ],
    },
  ],
};

export default ragFundamentals;
