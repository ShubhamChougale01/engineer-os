import type { CheatSheetData } from "./types";

const llamaindex: CheatSheetData = {
  title: "The Ultimate LlamaIndex Cheat Sheet",
  subtitle: "Data model · ingestion · query pipeline · advanced retrieval · evaluation · production toolbelt",
  sections: [
    {
      title: "Core Data Model & Setup",
      color: "violet",
      rows: [
        { term: "Document", desc: "Raw source unit plus metadata", code: "from llama_index.core import Document\ndoc = Document(text='...', metadata={'source': 'f.txt'})" },
        { term: "Node", desc: "A chunk of a Document — the retrievable unit", code: "# produced by a splitter, holds text + metadata\n# + a back-reference to its parent Document" },
        { term: "SimpleDirectoryReader", desc: "Load a folder of mixed files (pdf/docx/txt/md)", code: "from llama_index.core import SimpleDirectoryReader\ndocs = SimpleDirectoryReader('./data').load_data()" },
        { term: "Settings (global config)", desc: "Set default LLM/embed model once", code: "from llama_index.core import Settings\nSettings.llm = OpenAI(model='gpt-4o-mini', timeout=30)\nSettings.embed_model = OpenAIEmbedding()\nSettings.chunk_size = 512" },
        { term: "Install pattern", desc: "Core is slim; integrations are separate packages", code: "pip install llama-index-core\npip install llama-index-llms-openai\npip install llama-index-vector-stores-qdrant" },
        { term: "VectorStoreIndex", desc: "Default index — embeds nodes, similarity search", code: "from llama_index.core import VectorStoreIndex\nindex = VectorStoreIndex.from_documents(docs)" },
        { term: "Persist index", desc: "Save so you never re-embed unnecessarily", code: "index.storage_context.persist(persist_dir='./storage')" },
        { term: "Reload index", desc: "Load from disk without re-embedding", code: "from llama_index.core import StorageContext, load_index_from_storage\nsc = StorageContext.from_defaults(persist_dir='./storage')\nindex = load_index_from_storage(sc)" },
      ],
    },
    {
      title: "Index Types & Ingestion Pipeline",
      color: "blue",
      rows: [
        { term: "SummaryIndex", desc: "Full-coverage synthesis over ALL nodes, no embedding search", code: "from llama_index.core import SummaryIndex\nidx = SummaryIndex.from_documents(docs)" },
        { term: "TreeIndex", desc: "Hierarchical summaries — good for long structured docs", code: "from llama_index.core import TreeIndex\nidx = TreeIndex.from_documents(docs)" },
        { term: "KeywordTableIndex", desc: "Exact keyword match, no embeddings, cheap", code: "from llama_index.core import KeywordTableIndex\nidx = KeywordTableIndex.from_documents(docs)" },
        { term: "PropertyGraphIndex", desc: "Entity/relationship graph — multi-hop, relational queries", code: "from llama_index.core import PropertyGraphIndex\nidx = PropertyGraphIndex.from_documents(docs)" },
        { term: "SentenceSplitter", desc: "Fixed-size, sentence-aware chunking", code: "from llama_index.core.node_parser import SentenceSplitter\nsp = SentenceSplitter(chunk_size=512, chunk_overlap=50)" },
        { term: "SemanticSplitterNodeParser", desc: "Splits where the TOPIC changes, not char count", code: "from llama_index.core.node_parser import SemanticSplitterNodeParser\nsp = SemanticSplitterNodeParser(buffer_size=1, embed_model=em)" },
        { term: "IngestionPipeline", desc: "Compose transformations + vector store upsert", code: "from llama_index.core.ingestion import IngestionPipeline\npipe = IngestionPipeline(transformations=[splitter, embed_model],\n  vector_store=vector_store)\nnodes = pipe.run(documents=docs)" },
        { term: "Incremental ingestion", desc: "Skip unchanged docs via content hash", code: "h = hashlib.sha256(text.encode()).hexdigest()\nif seen.get(doc_id) != h: to_ingest.append(doc)" },
        { term: "Vector store wiring", desc: "Point index at a real backend, not in-memory default", code: "from llama_index.vector_stores.qdrant import QdrantVectorStore\nvs = QdrantVectorStore(client=client, collection_name='docs')" },
      ],
    },
    {
      title: "Query Pipeline",
      color: "emerald",
      rows: [
        { term: "as_query_engine()", desc: "Full retriever -> postprocess -> synthesize pipeline", code: "qe = index.as_query_engine(similarity_top_k=5)\nresp = qe.query('question')" },
        { term: "as_retriever()", desc: "Retrieval only — no LLM call, good for debugging/evals", code: "r = index.as_retriever(similarity_top_k=5)\nnodes = r.retrieve('question')" },
        { term: "response.source_nodes", desc: "Always inspect first when debugging a bad answer", code: "for n in resp.source_nodes:\n    print(n.score, n.node.metadata.get('source'))" },
        { term: "SimilarityPostprocessor", desc: "Drop weak matches below a score cutoff", code: "from llama_index.core.postprocessor import SimilarityPostprocessor\nSimilarityPostprocessor(similarity_cutoff=0.7)" },
        { term: "Reranker (e.g. Cohere)", desc: "Cross-encoder rescoring of a shortlist", code: "from llama_index.postprocessor.cohere_rerank import CohereRerank\nCohereRerank(top_n=3, api_key=key)" },
        { term: "response_mode: compact", desc: "Fewest LLM calls — pack nodes into one prompt", code: "index.as_query_engine(response_mode='compact')" },
        { term: "response_mode: refine", desc: "One LLM call per node, iteratively updates answer", code: "index.as_query_engine(response_mode='refine')" },
        { term: "response_mode: tree_summarize", desc: "Combine node answers pairwise — bounds context size", code: "index.as_query_engine(response_mode='tree_summarize')" },
        { term: "Retrieve-wide-then-rerank", desc: "The single highest-ROI retrieval pattern", code: "top_k=10-20 candidates -> rerank -> keep top 3-5" },
      ],
    },
    {
      title: "Advanced Retrieval",
      color: "amber",
      rows: [
        { term: "BM25Retriever", desc: "Sparse keyword retrieval for exact-match content", code: "from llama_index.retrievers.bm25 import BM25Retriever\nbm25 = BM25Retriever.from_defaults(docstore=index.docstore)" },
        { term: "QueryFusionRetriever", desc: "Fuse vector + BM25 results (hybrid search)", code: "from llama_index.core.retrievers import QueryFusionRetriever\nQueryFusionRetriever([vec_r, bm25], mode='reciprocal_rerank')" },
        { term: "HyDEQueryTransform", desc: "Embed a hypothetical answer instead of the raw query", code: "from llama_index.core.indices.query.query_transform import HyDEQueryTransform\nhyde = HyDEQueryTransform(include_original=True)" },
        { term: "TransformQueryEngine", desc: "Wrap a query engine with a query transform", code: "from llama_index.core.query_engine import TransformQueryEngine\nTransformQueryEngine(qe, hyde)" },
        { term: "MetadataFilters", desc: "Filter candidates by metadata before/during search", code: "from llama_index.core.vector_stores import MetadataFilters, MetadataFilter\nfilters = MetadataFilters(filters=[MetadataFilter(key='tenant', value='acme')])" },
        { term: "Sub-question decomposition", desc: "Split a compound question into independent sub-queries", code: "# ask LLM to decompose 'compare X and Y' into\n# 'what is X' + 'what is Y', retrieve each, then merge" },
        { term: "Multi-query fusion", desc: "Generate paraphrases to widen recall", code: "QueryFusionRetriever([...], num_queries=3)" },
        { term: "Agent tool wrapping", desc: "Let an agent decide WHEN to retrieve at all", code: "from llama_index.core.tools import QueryEngineTool\ntool = QueryEngineTool.from_defaults(query_engine=qe,\n  description='Search internal docs')" },
      ],
    },
    {
      title: "Evaluation & Common Pitfalls",
      color: "rose",
      rows: [
        { term: "Hit rate", desc: "Fraction of golden queries whose doc appears in top-k", code: "hits / len(golden_set)" },
        { term: "MRR", desc: "Mean reciprocal rank of the expected doc", code: "mean(1/rank if found else 0 for each query)" },
        { term: "Faithfulness", desc: "Is the answer supported by the retrieved context?", code: "# LLM-as-judge: does answer contradict/invent\n# facts not present in source_nodes?" },
        { term: "Relevancy", desc: "Does the answer actually address the question?", code: "# separate axis from faithfulness — can be\n# faithful but off-topic" },
        { term: "Embedding model mismatch", desc: "#1 silent bug — no error, just bad scores", code: "# WRONG: index built with model A,\n# queried with model B -> garbage similarity" },
        { term: "Mutable/over-large chunk size", desc: "Dilutes embeddings, blurs relevance", code: "# tune chunk_size deliberately per doc type\n# 200-500 tokens is a common starting range" },
        { term: "Re-embedding every deploy", desc: "Wastes cost — use content-hash incremental ingest", code: "if content_hash(doc.text) == seen_hashes[id]: skip()" },
        { term: "No timeout on API calls", desc: "One hung call stalls ingestion or a query worker", code: "OpenAI(model='gpt-4o-mini', timeout=30)" },
        { term: "Skipping node postprocessing", desc: "Raw top-k passthrough floods context with noise", code: "# always add SimilarityPostprocessor and/or\n# a reranker before synthesis" },
        { term: "Missing tenant filter", desc: "Cross-tenant data leakage in multi-tenant RAG", code: "filters = MetadataFilters(filters=[\n  MetadataFilter(key='tenant', value=current_tenant)])" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Separate ingestion & query services", desc: "Different cadence, different resource profile", code: "# ingestion: batch/scheduled worker\n# query API: stateless, horizontally scaled" },
        { term: "Index versioning", desc: "New persist dir / collection name per version", code: "persist_dir=f'./storage/v{version}'" },
        { term: "Structured logging", desc: "Log source_nodes + scores per query", code: "log.info('rag_query', num_nodes=len(resp.source_nodes),\n  top_score=resp.source_nodes[0].score)" },
        { term: "RAG-specific metrics", desc: "Track score distribution, no-match rate, per-stage latency", code: "REQUESTS = Counter('rag_no_match_total', ...)\nLATENCY.labels(stage='rerank').time()" },
        { term: "Health checks", desc: "readyz should verify vector store + LLM reachable", code: "GET /healthz -> process alive\nGET /readyz  -> deps reachable" },
        { term: "Vector store choice", desc: "Never ship in-memory SimpleVectorStore to prod", code: "# use FAISS/Pinecone/Weaviate/Qdrant/Chroma/pgvector\n# see the Vector Databases skills" },
        { term: "MockEmbedding for tests", desc: "Deterministic, free unit tests without API calls", code: "from llama_index.core.embeddings import MockEmbedding\nMockEmbedding(embed_dim=8)" },
        { term: "Golden set regression test", desc: "Automate hit rate/MRR as a CI check", code: "assert evaluate_retrieval(retriever, golden_set)['hit_rate'] > 0.85" },
        { term: "Prompt injection defense", desc: "Treat every retrieved chunk as untrusted input", code: "# never let retrieved text override system instructions\n# reinforce instruction boundaries in the prompt template" },
      ],
    },
  ],
};

export default llamaindex;
