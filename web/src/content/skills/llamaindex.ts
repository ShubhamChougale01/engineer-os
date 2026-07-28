import type { SkillContent } from "../types";

/**
 * LlamaIndex — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const llamaindex: SkillContent = {
  overview: `
LlamaIndex is a data framework purpose-built for connecting large language models to your own data. Where general-purpose agent frameworks worry about chains, tools, and control flow, LlamaIndex worries about a narrower and deeper problem: how do you get unstructured, semi-structured, and structured data out of PDFs, databases, APIs, and wikis, turn it into a form an LLM can reason over, and retrieve exactly the right slice of it at query time. Its primary use case is Retrieval-Augmented Generation (RAG), and it has grown into the most widely used data layer for that pattern.

For an AI engineer, LlamaIndex matters because RAG is the default answer to "how do I make an LLM answer questions about my own documents/data without fine-tuning." Building a RAG pipeline by hand — loaders, chunkers, embedding calls, a vector store client, a retrieval query, a prompt template, and a synthesis step — is roughly 300-500 lines of glue code that every team ends up rewriting slightly differently. LlamaIndex packages that glue into composable abstractions (Document, Node, Index, Retriever, QueryEngine) so you write intent, not plumbing, while still being able to drop down to the raw pieces when you need control.

Key characteristics: a data-first design (ingestion and indexing are first-class, not an afterthought), a large library of "readers" for pulling data out of hundreds of source types, multiple index structures beyond plain vector search (summary, tree, keyword, knowledge-graph indices), a retrieval pipeline with pluggable post-processing (reranking, filtering, query transformation), and — more recently — an agent layer (Workflows, FunctionAgent/ReActAgent) built on top of that same data layer so agents can treat "query my indexed data" as one callable tool among others. LlamaIndex is not trying to be the one framework that does everything; it is trying to be the best possible answer to "get an LLM talking to your data," and it succeeds because it stays narrow on that mission.
`,

  history: `
LlamaIndex was created by **Jerry Liu**, initially released in **November 2022** under the name **GPT Index**, a small library that connected GPT-3 to external data sources via simple tree and list indices built on top of the OpenAI API. It emerged at almost exactly the same moment as LangChain, both riding the wave of interest in "give the LLM extra context" patterns that followed ChatGPT's launch weeks earlier.

| Year | Milestone |
|------|-----------|
| Nov 2022 | Released as GPT Index — simple List/Tree/Keyword indices over documents |
| 2023 (early) | Rebranded to **LlamaIndex**; raised seed funding; company formed (LlamaIndex, Inc.) |
| 2023 (mid) | VectorStoreIndex becomes the dominant, most-used index type as vector databases proliferate |
| 2023 (late) | Query engines, response synthesizers, and node post-processors (rerankers) formalized as a pipeline |
| 2023-2024 | LlamaHub grows into a large registry of data loaders/readers (later folded into llama-index-integrations) |
| 2024 | Framework split into a slim core package plus separately versioned integration packages (llama-index-core, llama-index-llms-*, llama-index-vector-stores-*, etc.) to control dependency bloat |
| 2024 | LlamaParse launched — a hosted document-parsing service targeting hard PDFs (tables, layouts, scanned pages) |
| 2024-2025 | Workflows introduced as the primary way to build agentic and multi-step pipelines, gradually superseding the older Agent classes as the recommended pattern |
| 2025 | LlamaCloud (managed ingestion/indexing/retrieval-as-a-service) expands as the commercial offering alongside the open-source library |

The name change from GPT Index to LlamaIndex reflected a deliberate broadening: the tool was never really about GPT specifically, it was about indexing data for any LLM. That naming discipline — "index" is the noun in the name, not "chain" or "agent" — is a good signal of what the library still optimizes for today.
`,

  "why-it-exists": `
Before LlamaIndex (and its contemporaries), if you wanted an LLM to answer questions using your own documents, you had two bad options:

1. **Stuff everything into the prompt.** Works for a handful of pages, breaks immediately at real document-collection scale, and wastes context-window tokens (and money) even when it does fit.
2. **Fine-tune the model on your data.** Expensive, slow to iterate, doesn't update well as documents change, and does not reliably teach a model new facts the way people hope — models tend to memorize style more than facts.

The gap was: how do you give a model access to an arbitrarily large, constantly changing corpus, while only paying (in tokens and latency) for the small relevant slice of it per query. That requires solving several sub-problems together: parsing heterogeneous source formats, splitting documents into retrievable units without destroying meaning, embedding those units into a searchable representation, storing and querying that representation efficiently, and reassembling retrieved fragments into a coherent answer.

LlamaIndex existed to solve exactly that stack, end to end, as a cohesive library rather than a pile of disconnected point solutions (a PDF parser here, a text splitter there, a raw vector DB client somewhere else). It let engineers who were not information-retrieval specialists get a working RAG pipeline in an afternoon, then progressively swap in better components (a reranker, a hybrid retriever, a different index type) as quality demands grew.
`,

  "problem-it-solves": `
LlamaIndex removes concrete, recurring pains in building data-backed LLM applications:

- **Format sprawl**: readers for PDFs, Word docs, Notion, Slack, Google Drive, SQL databases, web pages, and more, all normalized into a common Document representation — you stop writing bespoke parsers per source.
- **Chunking boilerplate**: sentence-aware and structure-aware splitters that avoid naively cutting text mid-sentence or mid-table.
- **Embedding + storage wiring**: a consistent interface across dozens of embedding providers and vector stores, so switching from an in-memory index to Pinecone or Qdrant is a constructor argument, not a rewrite.
- **Retrieval-to-answer plumbing**: retriever, post-processors, and response synthesizer composed into a single query_engine.query() call, with the prompt templates and citation handling already built in.
- **Evaluation scaffolding**: built-in retrieval and generation evaluators so "did this change actually improve answer quality" has a measurable answer instead of a vibe.

What LlamaIndex deliberately does **not** try to solve:

- **General-purpose agent orchestration** across arbitrary tools, long-running multi-agent workflows with complex branching business logic — that is LangChain/LangGraph/CrewAI/PydanticAI territory, though LlamaIndex now has its own Workflows layer for simpler agentic needs.
- **Being the vector database** — LlamaIndex is a client/orchestration layer over vector stores (FAISS, Pinecone, Weaviate, Qdrant, Chroma, pgvector, etc.), not a storage engine itself; see the Vector Databases category skills for the storage layer.
- **Prompt optimization** — LlamaIndex lets you write and template prompts, but it does not programmatically search for better prompts/pipelines the way DSPy does; see the DSPy skill for that different philosophy.
- **Replacing evaluation rigor** — it gives you retrieval/generation metrics as building blocks, but the discipline of defining what "good" means for your domain is the same discipline covered in the AI Evals skill, and LlamaIndex does not substitute for it.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what problem LlamaIndex solves and how it differs from general agent frameworks like LangChain, DSPy, and PydanticAI.
2. Describe the Document/Node data model and choose the right Index type (vector, summary, tree, keyword, knowledge graph) for a given retrieval need.
3. Build an ingestion pipeline: load data with readers, chunk it with an appropriate splitter, embed it, and persist it to a vector store.
4. Build a query pipeline: retriever → node postprocessors (filtering/reranking) → response synthesizer → LLM call, and explain what each stage does.
5. Apply advanced retrieval techniques: hybrid (vector + keyword) search, metadata filtering, query transformation/rewriting, and reranking.
6. Evaluate RAG quality with both retrieval metrics (hit rate, MRR) and generation-quality metrics, and connect that to the broader AI Evals discipline.
7. Wrap an index as a tool inside an agent so the agent can decide when to retrieve versus when to answer directly or call other tools.
8. Operate LlamaIndex in production: persist and version indices, incrementally ingest new documents without full re-embedding, and reason about embedding cost and caching.
9. Identify the framework's fast-moving API surface and know how to verify current behavior instead of trusting memorized version-specific details.
`,

  prerequisites: `
- **Required**: comfortable Python (functions, classes, async basics — see the **Python** skill); a working understanding of what an LLM API call looks like (prompt in, text out).
- **Required conceptually**: what an embedding is and why semantic similarity search works — see the **Embeddings** and **Vector Search** skills before diving into LlamaIndex's retrieval internals, otherwise "cosine similarity over chunks" will feel like magic rather than mechanism.
- **Strongly recommended**: the **RAG** skill for the broader retrieval-augmented-generation pattern LlamaIndex implements — this page assumes you know what RAG is trying to achieve and focuses on how LlamaIndex specifically implements it.
- **Helpful**: familiarity with at least one vector database (see the **Vector Databases** category: FAISS, Pinecone, Weaviate, Qdrant, Chroma) since production LlamaIndex apps almost always sit on top of one.
- **Helpful for advanced sections**: the **Knowledge Graphs** skill, for LlamaIndex's graph-based indexing options; the **AI Evals** skill, for the evaluation section; the **LangChain**, **DSPy**, and **PydanticAI** skills for the comparisons section.

Dependency chain on this platform: **Python** → **Embeddings** → **Vector Search** / **Vector Databases** → **RAG** → **this page** → **LangChain** / **DSPy** / **PydanticAI** for broader agent orchestration.
`,

  "beginner-concepts": `
### Document and Node — the two data units

A **Document** is a raw piece of source content plus metadata (source path, author, date, custom tags). A **Node** is a chunk of a Document after splitting — the actual unit that gets embedded, stored, and retrieved. Nodes keep a reference back to their parent Document and to neighboring nodes, so retrieval can optionally pull in surrounding context.

~~~python
from llama_index.core import Document
from llama_index.core.node_parser import SentenceSplitter

doc = Document(
    text="LlamaIndex connects LLMs to your data. It handles loading, "
         "chunking, indexing, and retrieval so you can build RAG apps "
         "without hand-rolling the plumbing every time.",
    metadata={"source": "intro.txt", "category": "docs"},
)

splitter = SentenceSplitter(chunk_size=200, chunk_overlap=20)
nodes = splitter.get_nodes_from_documents([doc])
print(len(nodes), nodes[0].text[:60])
~~~

### Loading data with readers

Readers (sometimes called connectors) turn a source — a folder of files, a Notion workspace, a SQL table — into Documents.

~~~python
from llama_index.core import SimpleDirectoryReader

# Reads every supported file in a folder (.pdf, .docx, .txt, .md, ...)
documents = SimpleDirectoryReader(input_dir="./knowledge_base").load_data()
print(f"Loaded {len(documents)} documents")
~~~

### Building your first index

The **VectorStoreIndex** is the default, most common index: it embeds every node and stores the vectors for similarity search.

~~~python
from llama_index.core import VectorStoreIndex

# Under the hood: chunk -> embed each node -> store vectors in memory
index = VectorStoreIndex.from_documents(documents)

query_engine = index.as_query_engine()
response = query_engine.query("What does LlamaIndex handle for me?")
print(response)
~~~

### Why chunk size matters, intuitively

A chunk that is too large dilutes the embedding (it represents many ideas at once, so it matches poorly against a focused query). A chunk that is too small loses context (a sentence fragment about "the discount" without the paragraph that says which product). This tension — covered in depth in Intermediate Concepts — is the single highest-leverage tuning knob in any LlamaIndex RAG pipeline, more impactful early on than swapping embedding models or LLMs.

### Persisting an index so you don't re-embed every run

~~~python
# Save the index to disk once
index.storage_context.persist(persist_dir="./storage")

# Reload later without re-embedding anything
from llama_index.core import StorageContext, load_index_from_storage
storage_context = StorageContext.from_defaults(persist_dir="./storage")
index = load_index_from_storage(storage_context)
~~~

Common beginner trap: rebuilding the index from scratch on every application start. Embedding calls cost money and time; persist and reload, and only re-embed documents that actually changed (see Production Usage).
`,

  "intermediate-concepts": `
### Choosing an index type

VectorStoreIndex is not the only option, and picking the right one shapes retrieval behavior fundamentally:

~~~python
from llama_index.core import (
    VectorStoreIndex, SummaryIndex, TreeIndex, KeywordTableIndex,
)

# VectorStoreIndex: semantic similarity search over embedded chunks.
# Best default for "find the chunks most relevant to this question."
vector_index = VectorStoreIndex.from_documents(documents)

# SummaryIndex: stores nodes as a flat list, queried by feeding ALL
# (or a filtered subset of) nodes to the LLM for synthesis. No embedding
# similarity involved — good for "summarize everything" style queries
# over a small-to-medium corpus where you want full coverage, not just
# the top-k semantic matches.
summary_index = SummaryIndex.from_documents(documents)

# TreeIndex: builds a hierarchy of summaries bottom-up, then answers by
# traversing down the tree. Useful for long documents where you want
# hierarchical summarization rather than flat chunk retrieval.
tree_index = TreeIndex.from_documents(documents)

# KeywordTableIndex: extracts keywords per node and retrieves via
# keyword match, not embeddings. Cheap, no embedding calls, but misses
# semantic paraphrases ("car" won't match "automobile").
keyword_index = KeywordTableIndex.from_documents(documents)
~~~

Decision rule of thumb: default to VectorStoreIndex; reach for SummaryIndex when queries are "summarize/aggregate over everything" rather than "find the needle"; reach for TreeIndex for long hierarchical documents (legal contracts, books); reach for KeywordTableIndex only when you need exact-term matching cheaply and semantic drift is undesirable (e.g., matching product SKUs).

### Chunking strategy in depth

~~~python
from llama_index.core.node_parser import SentenceSplitter, SemanticSplitterNodeParser

# Naive fixed-size splitting: fast, predictable, occasionally cuts
# awkwardly across sentence boundaries despite the "Sentence" name
# trying to respect them.
splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)

# Semantic splitting: groups sentences by embedding similarity so a
# chunk boundary falls where the TOPIC changes, not at an arbitrary
# character count. More expensive (needs an embedding model at split
# time) but produces more coherent chunks for tricky documents.
semantic_splitter = SemanticSplitterNodeParser(
    buffer_size=1, embed_model=None,  # pass a real embed_model in practice
)
~~~

Why chunk size and overlap matter so much: too small and a chunk loses the surrounding context needed to answer correctly (a table row without its header); too large and the embedding represents a blurry average of multiple ideas, so a query about one narrow fact retrieves it with lower similarity than it should. Overlap (commonly 10-20% of chunk size) reduces the chance that a fact gets split exactly across a chunk boundary and lost. There is no universal correct number — 200-500 tokens is a common starting range for prose, but tables, code, and legal text each want different treatment.

### Node postprocessors — filtering and reranking after retrieval

~~~python
from llama_index.core.postprocessor import SimilarityPostprocessor
from llama_index.postprocessor.cohere_rerank import CohereRerank

query_engine = vector_index.as_query_engine(
    similarity_top_k=10,   # retrieve a wider candidate set first
    node_postprocessors=[
        SimilarityPostprocessor(similarity_cutoff=0.7),   # drop weak matches
        CohereRerank(top_n=3, api_key="..."),             # then rerank to the best 3
    ],
)
~~~

The "retrieve wide, then rerank narrow" pattern consistently improves answer quality over retrieving exactly top-k directly, because embedding similarity alone is a coarse first filter — a cross-encoder reranker looks at the query and each candidate chunk jointly and scores relevance far more precisely (at higher latency/cost, which is why it runs on a small shortlist, not the whole corpus).

### Metadata filtering

~~~python
from llama_index.core.vector_stores import MetadataFilters, MetadataFilter

filters = MetadataFilters(filters=[
    MetadataFilter(key="category", value="billing"),
])
query_engine = vector_index.as_query_engine(filters=filters)
~~~

Metadata filters narrow the candidate set before similarity search runs, which is both a relevance tool (only search billing docs) and an access-control tool (only search documents this user is permitted to see — see Security).

### Response synthesis modes

~~~python
# "compact" (default): stuff as many retrieved nodes as fit into one
# prompt, minimizing LLM calls.
qe_compact = vector_index.as_query_engine(response_mode="compact")

# "refine": answer using the first node, then iteratively refine the
# answer as each subsequent node is fed in — more LLM calls, often
# better for questions that need synthesis across many sources.
qe_refine = vector_index.as_query_engine(response_mode="refine")

# "tree_summarize": recursively combine node answers pairwise, good
# for large candidate sets that don't fit in one context window.
qe_tree = vector_index.as_query_engine(response_mode="tree_summarize")
~~~
`,

  "advanced-concepts": `
### Hybrid search: vector + keyword

Pure vector search misses exact-term queries (product codes, error messages, acronyms) that a paraphrase-tolerant embedding model was never trained to weight heavily. Hybrid search combines dense (embedding) retrieval with sparse (keyword/BM25) retrieval and fuses the results.

~~~python
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.retrievers import QueryFusionRetriever

vector_retriever = vector_index.as_retriever(similarity_top_k=5)
bm25_retriever = BM25Retriever.from_defaults(
    docstore=vector_index.docstore, similarity_top_k=5,
)

# Fuses both retrievers' results, typically via reciprocal rank fusion,
# then optionally re-queries with LLM-generated query variants.
fusion_retriever = QueryFusionRetriever(
    [vector_retriever, bm25_retriever],
    similarity_top_k=5,
    num_queries=3,       # generate query variants to widen recall
    mode="reciprocal_rerank",
)
~~~

### Query transformation and rewriting

Real user queries are often bad retrieval queries: too short, ambiguous, or phrased conversationally. Query transformation rewrites the query before retrieval:

- **HyDE (Hypothetical Document Embeddings)**: ask the LLM to write a hypothetical answer, then embed and search with THAT text instead of the raw question — often more similar to real answer chunks than the terse question is.
- **Sub-question decomposition**: split a compound question ("compare X and Y's pricing and support policies") into independent sub-queries, retrieve for each, then synthesize.
- **Multi-query generation**: generate several paraphrases of the query to widen recall, then fuse results (as above).

~~~python
from llama_index.core.indices.query.query_transform import HyDEQueryTransform
from llama_index.core.query_engine import TransformQueryEngine

hyde = HyDEQueryTransform(include_original=True)
hyde_query_engine = TransformQueryEngine(vector_index.as_query_engine(), hyde)
~~~

### Knowledge-graph-based indexing

For data where relationships between entities matter more than raw text similarity (org charts, product dependency graphs, legal case citations), LlamaIndex supports building a **PropertyGraphIndex**: entities and relations are extracted from documents (via an LLM or a rule-based extractor) into a graph, and retrieval can traverse relationships, not just embedding distance. This complements, rather than replaces, vector retrieval — many production systems combine a vector index for "find similar text" with a graph index for "find connected entities." See the **Knowledge Graphs** skill for the underlying graph-database concepts LlamaIndex builds on here.

### Retrieval decision table

| Need | Technique |
|------|-----------|
| Exact term / code / acronym matching | BM25 / keyword retrieval, or hybrid fusion |
| Paraphrase-tolerant semantic matching | Dense vector retrieval |
| Compound / multi-part questions | Sub-question query decomposition |
| Short, ambiguous queries | HyDE or query rewriting |
| Relationship / multi-hop reasoning over entities | PropertyGraphIndex |
| Coarse relevance signal is noisy | Retrieve wide (top_k=10-20) + rerank to top 3-5 |
| Need to restrict by tenant/permission/category | Metadata filters |

### Agents on top of the data layer

LlamaIndex's newer **Workflows** and agent classes (FunctionAgent, ReActAgent) let you wrap a query engine as a **tool** the agent can call, alongside other tools (a calculator, a web search, a write-to-database function). The agent decides, per turn, whether the question needs retrieval at all — a crucial distinction from a plain RAG pipeline, which always retrieves. This is the seam where LlamaIndex's data-first focus meets general agent orchestration; for more elaborate multi-agent business logic, teams often reach for LangChain/LangGraph or PydanticAI instead, using LlamaIndex purely as the retrieval tool underneath.

### Concurrency and batching during ingestion

Embedding calls and LLM-based extraction (for graph indices) are the ingestion bottleneck. Production pipelines batch embedding requests and parallelize document loading/parsing with async I/O, since embedding APIs are network-bound, not CPU-bound — the same asyncio reasoning covered in the Python skill's concurrency section applies directly here.
`,

  "internal-working": `
At query time, a LlamaIndex query engine executes a fixed pipeline. Understanding each stage explains most tuning decisions:

~~~mermaid
flowchart LR
    Q["User query"] --> R["Retriever\n(embed query, similarity search\nin vector store)"]
    R --> C["Candidate nodes (top_k)"]
    C --> P["Node postprocessors\n(similarity cutoff, rerank,\nmetadata filter)"]
    P --> F["Filtered/reranked nodes"]
    F --> S["Response synthesizer\n(compact / refine / tree_summarize)"]
    S --> L["LLM call(s) with retrieved\ncontext injected into prompt"]
    L --> A["Answer + source nodes\n(for citation)"]
~~~

Step by step:

1. **Retriever** takes the raw query string, embeds it with the same embedding model used at index time (critical: mismatched embedding models between ingestion and query silently degrade quality), and runs a similarity search (cosine similarity or the vector store's native metric) against the stored vectors, returning the top_k nearest node IDs.
2. **Node postprocessors** run in sequence over the candidate nodes — a similarity cutoff drops weak matches, a reranker rescoring with a cross-encoder reorders and truncates the list, a recency filter might drop stale documents.
3. **Response synthesizer** builds a prompt combining the retrieved node text with the original query, using a template (which you can customize), and calls the LLM. In "compact" mode it packs as many nodes as fit in one call; in "refine" mode it calls the LLM once per node, iteratively updating a running answer; in "tree_summarize" it combines nodes pairwise in a tree to bound context size.
4. **Answer assembly**: the final response object carries both the generated text and the source_nodes it was built from, which is how citation/source-attribution features work — you can always trace an answer back to the exact chunks that produced it.

On the ingestion side, the pipeline is symmetric: Reader → (optional) transformation (metadata extraction, cleaning) → NodeParser/Splitter → Embedding model → Vector store upsert. Every stage is swappable via LlamaIndex's Settings/ServiceContext-style configuration, which is why a hobby prototype and a production pipeline can share the same code shape while swapping the concrete LLM, embedding model, and vector store.
`,

  architecture: `
### Runtime architecture

~~~mermaid
flowchart TB
    subgraph Ingestion["Ingestion (offline / batch)"]
        Readers["Readers\n(PDF, Notion, SQL, web, ...)"] --> Docs["Documents"]
        Docs --> Splitter["NodeParser / Splitter"]
        Splitter --> Nodes["Nodes"]
        Nodes --> Embed["Embedding model"]
        Embed --> VS[("Vector store\n(FAISS/Pinecone/Weaviate/\nQdrant/Chroma/pgvector)")]
    end
    subgraph Query["Query (online, per request)"]
        UserQ["User query"] --> Retriever["Retriever"]
        Retriever -->|similarity search| VS
        Retriever --> Post["Node postprocessors\n(filter / rerank)"]
        Post --> Synth["Response synthesizer"]
        Synth -->|prompt + context| LLM["LLM"]
        LLM --> Answer["Answer + source nodes"]
    end
~~~

The key architectural insight: ingestion and query are decoupled and run on different cadences. Ingestion is a batch/background job (triggered on document upload, on a schedule, or incrementally on change) that is comparatively expensive (embedding calls scale with corpus size) but infrequent. Query is a per-request path that must be fast (a few retrieval + one-to-few LLM calls) and is comparatively cheap per call but happens constantly. Production systems build these as separate services: an ingestion pipeline/worker and a query-serving API, sharing only the vector store and embedding-model configuration.

### Application layout for a production LlamaIndex service

~~~
ragservice/
├── pyproject.toml
├── src/ragservice/
│   ├── ingestion/
│   │   ├── loaders.py        # source-specific reader configuration
│   │   ├── pipeline.py       # IngestionPipeline: split -> embed -> upsert
│   │   └── scheduler.py      # incremental re-ingestion triggers
│   ├── retrieval/
│   │   ├── query_engine.py   # retriever + postprocessors + synthesizer wiring
│   │   └── rerank.py         # reranker configuration
│   ├── agents/
│   │   └── workflow.py       # optional: query engine wrapped as an agent tool
│   ├── api/                  # FastAPI routes exposing /query, /ingest
│   └── evaluation/           # retrieval + generation eval harness
└── tests/
~~~

Dependencies point from api → retrieval/agents → the vector store and LLM clients; ingestion is a separate concern triggered independently, never inline on the request path.
`,

  "data-flow": `
Tracing one query end to end, including the reranking step, as a sequence diagram:

~~~mermaid
sequenceDiagram
    participant User
    participant QE as QueryEngine
    participant Ret as Retriever
    participant VS as Vector Store
    participant PP as Postprocessors (rerank)
    participant Synth as Response Synthesizer
    participant LLM as LLM API

    User->>QE: query("How do I reset my password?")
    QE->>Ret: retrieve(query)
    Ret->>Ret: embed_model.get_query_embedding(query)
    Ret->>VS: similarity_search(query_vector, top_k=10)
    VS-->>Ret: 10 candidate nodes + scores
    Ret-->>QE: candidate nodes
    QE->>PP: postprocess(nodes, query)
    PP->>PP: similarity cutoff drops weak matches
    PP->>PP: cross-encoder reranks remaining nodes
    PP-->>QE: top 3 reranked nodes
    QE->>Synth: synthesize(query, top 3 nodes)
    Synth->>Synth: build prompt: query + node text + template
    Synth->>LLM: chat/completion call
    LLM-->>Synth: generated answer text
    Synth-->>QE: Response(text, source_nodes)
    QE-->>User: answer + citations
~~~

The most misunderstood part is that retrieval and generation are separate network calls with separate failure modes: a retrieval-side bug (bad chunking, wrong embedding model, missing metadata filter) produces a confidently wrong answer that LOOKS like a generation problem, because the LLM will happily and fluently answer from irrelevant context if that's all it was given. Debugging RAG quality issues should always start by inspecting source_nodes before touching the prompt or the LLM.
`,

  "production-usage": `
### Ingestion pipeline configuration

~~~python
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
import qdrant_client

client = qdrant_client.QdrantClient(url="http://localhost:6333")
vector_store = QdrantVectorStore(client=client, collection_name="docs")

pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=512, chunk_overlap=50),
        OpenAIEmbedding(model="text-embedding-3-small"),
    ],
    vector_store=vector_store,
)

# docstore_strategy / cache lets re-running ingestion skip unchanged
# documents instead of re-embedding everything every time
nodes = pipeline.run(documents=documents, show_progress=True)
~~~

### Global configuration (Settings)

~~~python
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# Set once at startup; every index/query engine created afterward
# inherits these defaults unless explicitly overridden.
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0.1, timeout=30)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.chunk_size = 512
Settings.chunk_overlap = 50
~~~

Non-negotiables for production:

1. **Always set request timeouts** on both the LLM and embedding clients — a hung embedding call during ingestion, or a hung LLM call during query, will otherwise stall a worker indefinitely.
2. **Pin the embedding model per index.** Re-embedding with a different model without rebuilding the whole index produces silently incompatible vectors.
3. **Use a real vector store in production**, not the default in-memory SimpleVectorStore — it doesn't persist or scale beyond a single process (see the Vector Databases category).
4. **Cache embeddings during ingestion** (IngestionPipeline's docstore-backed caching, or an external cache keyed by content hash) so re-running ingestion on an unchanged corpus does not re-pay embedding cost.
5. **Separate ingestion and query into different services/processes** — ingestion is bursty and resource-heavy; query needs to stay low-latency.
`,

  "industry-examples": `
- **Discord**: has published on using LlamaIndex-style RAG patterns (retrieval over internal knowledge bases) to power internal support and search tooling, illustrating the "search our own docs/tickets" use case LlamaIndex targets directly.
- **Kapa.ai**: builds developer-support chatbots for companies (grounded in their docs, forums, and GitHub issues) using RAG pipelines, a category where LlamaIndex's readers-plus-indexing model fits naturally.
- **LlamaIndex, Inc. itself (LlamaCloud / LlamaParse)**: the company's own commercial products are built as managed versions of the open-source ingestion/parsing/retrieval pipeline, targeting the hardest part of RAG in practice — reliably parsing messy real-world documents (scanned PDFs, complex tables) before they ever reach an index.
- **Enterprise "chat with your documents" products** across legal, financial services, and healthcare verticals commonly use LlamaIndex (or a close analog) as the ingestion/retrieval layer underneath a chat UI, because the compliance requirement to cite exact source passages maps directly onto LlamaIndex's source_nodes/citation support.

Pattern to notice: the common thread across adopters is "we have a large, changing, domain-specific corpus and need grounded, cited answers" — precisely the problem LlamaIndex was built to solve, as distinct from general agent-automation use cases.
`,

  "best-practices": `
1. **Start with VectorStoreIndex and a sensible default chunk size (300-512 tokens, 10-20% overlap)**; only reach for SummaryIndex/TreeIndex/graph indices once you've identified a concrete retrieval failure mode default vector search doesn't handle.
2. **Retrieve wide, rerank narrow.** Pull top_k=10-20 candidates, then rerank down to the 3-5 you actually feed the LLM — this consistently beats retrieving exactly top_k=3 directly.
3. **Always inspect source_nodes when debugging a bad answer** before touching the prompt — most "the LLM is wrong" bugs are actually "the retriever fetched the wrong chunks."
4. **Match embedding models between ingestion and query, always**, and re-embed the whole corpus (not incrementally) if you change embedding models or dimensions.
5. **Use metadata filtering for both relevance and access control** — tag documents with tenant/permission metadata at ingestion time, not as an afterthought.
6. **Set timeouts on every LLM and embedding call**; ingestion pipelines over large corpora will otherwise hang on one bad network call.
7. **Cache embeddings keyed by content hash** so incremental ingestion only re-embeds documents that actually changed.
8. **Evaluate retrieval and generation separately** (hit rate/MRR for retrieval, faithfulness/relevancy for generation) — a good final answer can mask a mediocre retriever that happened to get lucky.
9. **Persist and version indices explicitly** (a directory or vector-store collection name per index version) so you can roll back a bad re-index without re-embedding from scratch.
10. **Use hybrid search when your corpus contains exact-match-sensitive content** (product codes, error strings, IDs) — pure vector search underperforms there.
11. **Keep the response synthesizer mode deliberate**: "compact" for speed/cost, "refine" or "tree_summarize" when the answer genuinely needs synthesis across many sources.
12. **Treat the query engine as one tool among several when building agents** — don't force every user turn through retrieval if the agent can determine retrieval isn't needed.
`,

  "anti-patterns": `
### Rebuilding the whole index on every process start

~~~python
# WRONG: re-embeds the entire corpus every time the app boots
index = VectorStoreIndex.from_documents(documents)

# RIGHT: persist once, reload without re-embedding, only ingest deltas
from llama_index.core import StorageContext, load_index_from_storage
try:
    storage_context = StorageContext.from_defaults(persist_dir="./storage")
    index = load_index_from_storage(storage_context)
except FileNotFoundError:
    index = VectorStoreIndex.from_documents(documents)
    index.storage_context.persist(persist_dir="./storage")
~~~

### Other production-grade anti-patterns

- **One giant chunk size "to be safe."** Stuffing 2000-token chunks into the index dilutes embeddings and blows up context-window usage per query; tune chunk size deliberately (see Intermediate Concepts).
- **No node postprocessing at all.** Feeding raw top-k similarity results straight to the LLM without a similarity cutoff or reranker means noisy/irrelevant chunks regularly leak into the prompt.
- **Ignoring source_nodes.** Not surfacing citations to users (or to yourself, while debugging) throws away the framework's best trust and debugging feature.
- **Mixing embedding models across an index's lifetime.** Adding new documents with a different embedding model than the original index used produces vectors that are silently incomparable — similarity search degrades without an obvious error.
- **Treating the query engine as stateless when it isn't.** Reusing a query engine across unrelated user sessions without conversation-memory awareness (for chat-style RAG) leaks context between users; use a chat engine with explicit per-session memory instead.
- **No timeout on embedding/LLM calls during batch ingestion.** One slow network call can stall an entire ingestion job that should take minutes.
- **Using SummaryIndex-style "feed everything to the LLM" patterns on corpora that don't fit in context**, silently truncating instead of falling back to a retrieval-based approach.
`,

  performance: `
### Measure first

~~~python
import time

start = time.perf_counter()
response = query_engine.query("...")
print(f"query took {time.perf_counter() - start:.2f}s")

# Inspect exactly what was retrieved and scored
for node in response.source_nodes:
    print(node.score, node.node.text[:80])
~~~

Use LlamaIndex's callback manager / instrumentation hooks to time each pipeline stage separately (embedding the query, vector search, reranking, LLM call) — most perceived "LlamaIndex is slow" complaints are actually one slow LLM or reranker call, not the retrieval step itself.

### The optimization hierarchy (apply in order)

1. **Fix chunking before anything else.** Bad chunk size/overlap causes low-relevance retrieval, which then triggers over-broad top_k and refine-mode synthesis to compensate — all three of which are symptoms of the same root cause.
2. **Reduce top_k with a reranker rather than retrieving huge candidate sets.** Retrieving 50 nodes "to be safe" then feeding all 50 to the LLM is slow and expensive; retrieve 20, rerank to 3-5.
3. **Choose response_mode deliberately.** "compact" is one LLM call; "refine" is one call per node — a 10-node refine query is 10x the LLM cost/latency of compact for the same nodes.
4. **Cache embeddings and, where safe, cache full query responses** for repeated/common queries (an LRU or Redis-backed cache keyed on the normalized query + filter set).
5. **Batch embedding calls during ingestion** rather than embedding node-by-node — most embedding APIs charge and rate-limit per request, not per token, so batching cuts both latency and cost substantially.
6. **Use a vector store with approximate nearest-neighbor indexing** (HNSW-based stores like Qdrant/Weaviate/pgvector-with-HNSW) once the corpus grows past the point where exact search is fast enough — see the Vector Databases skills for the accuracy/speed tradeoff.
7. **Parallelize ingestion I/O** with async readers/embedding calls; ingestion is network-bound, not CPU-bound, so concurrency (not more CPU cores) is the lever.

### Numbers worth internalizing

Reranking a shortlist of 10-20 candidates typically adds tens to low-hundreds of milliseconds versus a much larger relevance improvement than simply increasing top_k; embedding API calls dominate ingestion latency and cost roughly linearly with document count, which is why incremental ingestion (only new/changed documents) matters as corpora grow into the tens of thousands of documents.
`,

  scalability: `
LlamaIndex itself is a thin orchestration layer; scalability is really a property of the vector store and LLM/embedding backends it sits on top of, plus how you structure ingestion and query as separate workloads.

~~~mermaid
flowchart LR
    LB["Load balancer"] --> API1["Query API replica 1"]
    LB --> API2["Query API replica N"]
    API1 & API2 --> VS[("Vector store cluster\n(sharded/replicated)")]
    API1 & API2 --> LLM["LLM API (or self-hosted\ninference cluster)"]
    Sched["Ingestion scheduler"] --> W1["Ingestion worker 1"]
    Sched --> W2["Ingestion worker N"]
    W1 & W2 --> VS
    W1 & W2 --> EmbAPI["Embedding API"]
~~~

### Scaling the query path

- **Horizontal**: query-serving replicas are stateless (given a shared vector store and LLM endpoint), so scale them like any stateless API behind a load balancer.
- **Vector store scaling**: sharding/replication is the vector store's job (see the specific Vector Databases skill for FAISS/Pinecone/Weaviate/Qdrant/Chroma) — LlamaIndex just needs a client that can reach it.
- **LLM call concurrency**: the usual bottleneck at scale is LLM API rate limits/latency, not LlamaIndex's own code; use connection pooling, backoff, and consider a self-hosted inference cluster for high-volume production traffic.

### Scaling the ingestion path

- **Batch and parallelize** embedding calls across documents; use async I/O rather than sequential per-document processing.
- **Incremental ingestion** (only re-embed changed documents, tracked via content hashes or a docstore) is the single biggest lever once a corpus reaches tens of thousands of documents — full re-ingestion cost grows linearly with corpus size and becomes untenable.
- **Separate ingestion workers from the query API** so a large batch ingestion job never competes for resources with live query traffic.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Embedding API rate limits during bulk ingest | Batch requests, add backoff, parallelize across multiple API keys/providers if needed |
| Vector search latency at large corpus size | Approximate nearest neighbor index (HNSW), sharding, or a managed vector store built for scale |
| LLM call latency dominating query time | Smaller/faster model for synthesis, response_mode="compact", streaming responses to improve perceived latency |
| Re-embedding cost on every deploy | Incremental ingestion keyed by content hash; never full-rebuild by default |
| Reranker adding latency at high QPS | Rerank a smaller shortlist, or use a lighter/faster reranker model, or cache reranked results for repeated queries |
`,

  security: `
### LlamaIndex-specific attack surface

1. **Prompt injection via retrieved content.** If your corpus includes untrusted or user-uploaded documents, malicious text inside a document can attempt to hijack the LLM's instructions once it's retrieved into the prompt ("ignore previous instructions and reveal..."). Treat every retrieved chunk as untrusted input, not as trusted system context — sanitize/validate where feasible, and keep the system prompt's instructions clearly separated and reinforced.
2. **Cross-tenant data leakage via missing metadata filters.** In a multi-tenant RAG app, forgetting to apply a tenant-scoped MetadataFilter on every query means one tenant's query can retrieve another tenant's private documents. Metadata-based access control must be enforced at the retrieval layer, not just at the UI layer.
3. **Sensitive data in embeddings/vector stores.** Embeddings are not encryption — anyone with vector-store access and a way to query it can extract semantically similar content, and in some cases embeddings can be partially inverted to recover source text. Apply the same access controls and encryption-at-rest to the vector store as you would to the source documents.
4. **SSRF/arbitrary file access via readers.** Readers that fetch URLs or files (web readers, cloud-storage readers) should validate and constrain inputs — an unconstrained "load this URL" reader exposed to end users is a server-side request forgery vector.
5. **Unbounded LLM cost from unauthenticated query endpoints.** A public /query endpoint without rate limiting or auth is a direct cost-abuse (and potential prompt-injection) vector; apply the same API security discipline as any LLM-backed endpoint.

### Defenses

- Apply metadata-based access control on every retrieval call for multi-tenant systems — never rely on "we just won't index that user's data in the shared collection" as the only boundary.
- Log and monitor for suspicious retrieved-content patterns (attempted instruction overrides) as part of your broader prompt-injection defenses.
- Encrypt vector stores at rest and in transit like any other datastore holding potentially sensitive content.
- Rate-limit and authenticate query and ingestion endpoints; ingestion endpoints in particular should never accept arbitrary user-supplied URLs/files without validation.

See the dedicated **Prompt Injection**, **OWASP Top 10 for LLM Applications**, and **Secrets Management** skills for depth beyond what's LlamaIndex-specific here.
`,

  testing: `
### Testing ingestion

~~~python
def test_splitter_respects_chunk_size():
    from llama_index.core.node_parser import SentenceSplitter
    from llama_index.core import Document

    splitter = SentenceSplitter(chunk_size=100, chunk_overlap=10)
    doc = Document(text="word " * 500)   # long synthetic document
    nodes = splitter.get_nodes_from_documents([doc])

    assert len(nodes) > 1
    for node in nodes:
        assert len(node.text) <= 100 * 6   # rough char-per-token bound
~~~

### Testing retrieval quality with a fake embedding model

~~~python
from llama_index.core.embeddings import MockEmbedding
from llama_index.core import VectorStoreIndex, Document

def test_retriever_returns_expected_node():
    # MockEmbedding avoids real API calls in unit tests — deterministic
    # and free, at the cost of not testing real semantic behavior.
    documents = [Document(text="The refund policy allows 30 days."),
                 Document(text="Shipping takes 3-5 business days.")]
    index = VectorStoreIndex.from_documents(
        documents, embed_model=MockEmbedding(embed_dim=8),
    )
    retriever = index.as_retriever(similarity_top_k=1)
    nodes = retriever.retrieve("what is the refund window")
    assert len(nodes) == 1
~~~

### The senior testing doctrine for RAG

- **Unit test the deterministic parts** (splitters, metadata handling, filter construction) without hitting real embedding/LLM APIs.
- **Integration test retrieval quality against a small, hand-labeled golden set** of (query, expected relevant document ID) pairs — this is where hit rate/MRR evaluation (see Advanced Concepts / FAQs) becomes an automated regression test, not a one-time check.
- **Test generation quality separately from retrieval** using an LLM-as-judge or rule-based faithfulness check against a fixed set of retrieved context, so retrieval regressions and generation regressions don't get conflated.
- **Never assert on exact LLM output text** — assert on retrieved node IDs, on structural properties of the response (has source_nodes, cites the right document), or on LLM-judged criteria with a documented rubric.
- Run retrieval-quality regression tests in CI against a frozen embedding model version; upgrading embedding models should be a deliberate, evaluated decision, not silently invalidate your test golden set.
`,

  debugging: `
### The toolbox, in escalation order

1. **Inspect response.source_nodes first, always.** Before touching the prompt or LLM, print the retrieved nodes and their scores — a huge fraction of "bad answer" bugs are "wrong or missing context was retrieved."

~~~python
response = query_engine.query("What's our refund policy for annual plans?")
for node in response.source_nodes:
    print(f"score={node.score:.3f} source={node.node.metadata.get('source')}")
    print(node.node.text[:200], "...\\n")
~~~

2. **Check the embedding model consistency.** If retrieval quality degraded suddenly, verify the query-time embedding model matches the one used at ingestion time — a silent mismatch (e.g., after a config change) produces low-similarity-but-not-zero scores that look like "the data just isn't relevant."
3. **Turn on verbose/debug logging** for the retriever and LLM calls to see the exact prompt sent to the LLM, including the assembled context — this catches template bugs (context truncated, wrong node ordering) that are invisible from the final answer alone.
4. **Test the retriever in isolation**, bypassing synthesis entirely, when diagnosing "wrong answer" reports — call index.as_retriever().retrieve(query) directly and inspect results before involving the LLM at all.
5. **Check chunk boundaries manually** for a suspect document — print the actual node text around where an expected fact should be, to see if it was split across two chunks and diluted in each.
6. **Use LlamaIndex's callback/instrumentation hooks** to trace timing and inputs/outputs at each pipeline stage when the bug is intermittent or load-dependent rather than deterministic.

### Debugging "the agent didn't retrieve when it should have"

When a query engine is wrapped as an agent tool, the agent's tool-selection reasoning (not the retriever) may be at fault — inspect the agent's reasoning trace/tool-call log to see whether it decided to skip retrieval, and adjust the tool's description/docstring, which is what the agent uses to decide when to call it.
`,

  monitoring: `
Production RAG visibility rests on both general service observability (see the Observability category) and RAG-specific signals.

### Structured logging per query

~~~python
import structlog

log = structlog.get_logger()

def logged_query(query_engine, query: str, user_id: str):
    response = query_engine.query(query)
    log.info(
        "rag_query",
        user_id=user_id,
        query=query,
        num_source_nodes=len(response.source_nodes),
        top_score=response.source_nodes[0].score if response.source_nodes else None,
        answer_length=len(str(response)),
    )
    return response
~~~

### RAG-specific metrics to track

- **Retrieval score distribution** (top-1 similarity score per query, over time) — a sustained drop signals corpus drift, an embedding-model mismatch, or a broken ingestion job.
- **Fallback/"no relevant documents found" rate** — how often the retriever returns nothing above the similarity cutoff; a rising rate signals a coverage gap in the corpus or an overly strict cutoff.
- **Latency broken down per pipeline stage** (embed query, vector search, rerank, LLM call) via the callback manager, so a latency regression can be attributed to the right stage instead of blamed generically on "the LLM."
- **Ingestion job health**: documents processed, documents skipped (cache hit), documents failed to parse, embedding API error rate.
- **User feedback signals** (thumbs up/down on answers) joined back to the specific source_nodes used, to build the golden evaluation set referenced in Testing and the RAG evaluation section.

### Tracing

OpenTelemetry-style tracing (or LlamaIndex's own instrumentation/callback system) should capture spans for retrieve, postprocess, and synthesize separately per request, mirroring the internal-working pipeline — this is the fastest way to answer "why was this specific query slow or wrong" in production.
`,

  deployment: `
### A production Dockerfile for a LlamaIndex-based query API

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev
COPY src/ src/
RUN uv sync --frozen --no-dev

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "ragservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: slim base and non-root user reduce attack surface; the deps layer is cached separately from application code for fast rebuilds; PYTHONUNBUFFERED ensures logs (including retrieval-debugging logs) stream immediately instead of buffering.

### Serving topology

- **Query API**: a stateless FastAPI/uvicorn service, scaled horizontally behind a load balancer — it only needs read access to the vector store and network access to LLM/embedding APIs.
- **Ingestion**: a separate scheduled job or worker process (cron, Celery beat, or an event-triggered function on document upload) — never inline on the query request path.
- **Health checks**: a /healthz that checks process liveness, and a /readyz that verifies the vector store and LLM/embedding endpoints are reachable before accepting traffic.
- **Index versioning**: deploy new index versions to a new persist directory or vector-store collection name, validate with an evaluation run (see Advanced Concepts / Testing), then cut traffic over — never overwrite a live index in place.

### CI/CD pipeline sketch

lint/typecheck → unit tests (splitters, filters, mocked retrieval) → retrieval-quality regression test against a frozen golden set → build image → deploy query API with rolling update → separately trigger/validate the ingestion pipeline against the new index version before flipping traffic.
`,

  "production-checklist": `
Before a LlamaIndex-based RAG service takes real traffic:

- [ ] Chunk size/overlap deliberately chosen and documented for the corpus type (not left at library defaults unexamined)
- [ ] Embedding model pinned and consistent between ingestion and query paths
- [ ] Vector store is a real persistent/scalable backend, not the in-memory default
- [ ] Index persisted with a clear versioning scheme (directory/collection name per version)
- [ ] Incremental ingestion in place — content-hash-based skip for unchanged documents
- [ ] Timeouts set on every LLM and embedding API call
- [ ] Node postprocessing configured: similarity cutoff and/or reranker, not raw top-k passthrough
- [ ] Metadata filters enforced for any multi-tenant or access-controlled corpus
- [ ] Retrieval-quality golden set exists and hit rate/MRR are tracked over time
- [ ] Generation-quality evaluation (faithfulness/relevancy) wired into CI or a regular offline job
- [ ] source_nodes surfaced in logs and (where appropriate) to end users as citations
- [ ] Rate limiting and authentication on query and ingestion endpoints
- [ ] Structured logging with per-stage latency and retrieval-score instrumentation
- [ ] Ingestion pipeline runs as a separate service/job from the query API
- [ ] Rollback plan: can revert to the previous index version without re-embedding

Cross-check with the AI Evals skill for the deeper discipline behind the two evaluation checklist items above.
`,

  "common-mistakes": `
1. **Choosing chunk size arbitrarily and never revisiting it** — it's the single highest-leverage retrieval-quality lever, and teams often tune the LLM prompt for weeks before realizing the retriever was starving it of the right context.
2. **Treating VectorStoreIndex as the only option** — reaching for it even when a query pattern (broad summarization, exact-term lookup, relationship traversal) is a better fit for SummaryIndex, keyword search, or a graph index.
3. **Skipping reranking to save latency**, then over-compensating with a much larger top_k that floods the LLM's context with noise.
4. **Not separating retrieval evaluation from generation evaluation**, so a bad answer gets "fixed" by prompt engineering when the real bug is in the retriever.
5. **Re-embedding the entire corpus on every deploy** because incremental ingestion was never built, burning embedding-API budget unnecessarily.
6. **Forgetting metadata-based access control** in multi-tenant apps, assuming separate application-level checks are sufficient when the retriever itself can cross tenant boundaries.
7. **No timeout on embedding calls during bulk ingestion**, letting one slow network call stall an entire batch job.
8. **Assuming the framework's exact API surface from memory** across versions — LlamaIndex's package layout and some class names have changed release to release (see Latest Updates); always check current docs/imports rather than trusting an old tutorial verbatim.
9. **Conflating "more retrieved context" with "better answers."** Beyond a point, stuffing more chunks into the prompt increases noise and cost without improving (and sometimes hurting) answer quality.
10. **Not surfacing or logging source_nodes**, throwing away the framework's best debugging and trust-building feature.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| Dimension mismatch when querying a vector store | Query-time embedding model differs from ingestion-time model | Pin one embedding model per index; re-embed fully if you must change it |
| Empty or irrelevant source_nodes on a query that should have matches | Similarity cutoff too strict, or chunking split the relevant fact across nodes | Loosen cutoff temporarily to inspect scores; review chunk boundaries around the fact |
| RateLimitError from embedding or LLM provider during bulk ingestion | No batching/backoff on API calls | Batch embedding requests; add exponential backoff and respect provider rate limits |
| Import errors after upgrading llama-index | Package split into llama-index-core plus separate integration packages | Install the specific llama-index-integrations-* package for your LLM/vector store/embedding provider |
| Slow queries under load | Reranker or LLM call latency, not retrieval itself | Profile per-stage timing via callbacks; consider a faster reranker/model or response_mode="compact" |
| Stale answers after updating source documents | No incremental re-ingestion triggered on document change | Wire ingestion to a change-detection trigger (webhook, scheduled diff) rather than manual reruns |
| Context window exceeded errors during synthesis | Too many/too large nodes passed with response_mode that doesn't chunk the prompt | Reduce similarity_top_k, add a reranker, or switch to "tree_summarize"/"refine" |
| Duplicate or near-duplicate chunks dominating retrieved results | No deduplication at ingestion time across overlapping source documents | Deduplicate near-identical documents before ingestion, or use a diversity-aware reranker |

The habit that matters: reproduce with a minimal query against a small known corpus, inspect source_nodes and their scores first, and only then look at the LLM prompt/response.
`,

  faqs: `
**Q: Is LlamaIndex a replacement for LangChain?**
No — they overlap partially but have different centers of gravity. LlamaIndex is data/retrieval-first; LangChain is a more general agent/chain orchestration framework. Many production systems use LlamaIndex for ingestion/retrieval and LangChain (or LangGraph, or PydanticAI) for broader agent logic on top. See the Comparisons section for the honest breakdown.

**Q: Do I need a vector database, or can I just use the in-memory default?**
The in-memory SimpleVectorStore is fine for prototyping and small demos; production systems need a persistent, scalable vector store (FAISS for embedded/local use, or Pinecone/Weaviate/Qdrant/Chroma/pgvector for managed or self-hosted production deployments — see the Vector Databases category).

**Q: How do I pick a chunk size?**
Start around 300-512 tokens with 10-20% overlap for general prose, then tune based on retrieval-quality evaluation against a golden set — there is no universally correct number, and document type (prose vs. tables vs. code) changes the right answer.

**Q: How is RAG quality actually measured?**
Two separate axes: retrieval quality (hit rate — did the relevant document appear in top-k; MRR — how highly ranked was it) and generation quality (faithfulness — is the answer supported by the retrieved context; relevancy — does it actually answer the question). See Advanced Concepts and the AI Evals skill for depth.

**Q: When should I use a knowledge graph index instead of vector search?**
When the value is in relationships between entities (who reports to whom, which component depends on which) rather than in matching similar text — vector search alone can't traverse relationships it was never asked to represent explicitly.

**Q: Can LlamaIndex power an agent, not just a Q&A bot?**
Yes — wrap a query engine as a tool inside LlamaIndex's own Workflows/agent classes, or inside another framework's agent (LangChain, PydanticAI). The index itself doesn't change; it just becomes one callable capability among several.

**Q: How current is this page's API detail?**
LlamaIndex's package structure and some class names have shifted across releases (notably the split into llama-index-core plus separate integration packages). This page reflects general patterns true through the author's knowledge cutoff (early-to-mid 2025) rather than any single pinned version — always check the current official docs/changelog for exact import paths and class signatures before shipping.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What's the difference between a Document and a Node in LlamaIndex?* A Document is a raw source unit with metadata; a Node is a chunk produced by splitting a Document, and is the actual unit that gets embedded and retrieved.
2. *Why would you choose a VectorStoreIndex over a SummaryIndex?* VectorStoreIndex does targeted semantic similarity retrieval ("find the relevant needle"); SummaryIndex is better for full-coverage summarization queries where you want to consider all or most nodes rather than just top-k matches.
3. *What does chunk_overlap do and why does it matter?* It repeats a small amount of text between adjacent chunks so a fact that would otherwise fall exactly on a chunk boundary isn't split and diluted across both chunks.
4. *What is a query engine's response_mode, and name two options.* Controls how retrieved nodes are combined into an answer; "compact" packs as many as fit into one LLM call, "refine" iteratively updates an answer one node at a time, "tree_summarize" combines pairwise in a tree.
5. *Why must the same embedding model be used at ingestion and query time?* Embeddings from different models live in different vector spaces; comparing them via cosine similarity produces meaningless or degraded results even though no error is raised.

**Senior:**

6. *Design a RAG system for a multi-tenant SaaS product where tenants must never see each other's documents. What LlamaIndex-specific measures do you take?* Metadata-tag every node with tenant ID at ingestion; enforce a tenant-scoped MetadataFilter on every retrieval call, not just at the UI layer; consider separate vector-store collections per tenant for stronger isolation at higher operational cost; audit that the filter is applied even for agent-initiated queries, not just direct user queries.
7. *Retrieval quality degraded after a routine deploy — how do you debug it?* Inspect source_nodes and similarity scores for known-good queries first; check whether the embedding model or chunking configuration changed; verify the vector store wasn't partially re-indexed with a mismatched embedding model; check ingestion job logs for silent failures/skips.
8. *How would you decide between pure vector search, hybrid search, and a knowledge-graph index for a given corpus?* Vector search for paraphrase-tolerant "find similar text" queries; hybrid (vector + BM25) when the corpus has exact-match-sensitive terms (codes, IDs, acronyms); knowledge-graph index when the value is in relationships between entities that pure text similarity can't represent.
9. *How do you evaluate RAG quality without waiting for user complaints?* Build a golden set of (query, expected relevant doc/answer) pairs; automate hit rate/MRR for retrieval and an LLM-as-judge (or rule-based) faithfulness/relevancy check for generation; run both as a CI/offline regression suite tied to index and prompt-template changes.
10. *Why might increasing top_k make answers worse, not better?* More retrieved nodes mean more chances for irrelevant/noisy content to enter the LLM's context, diluting attention and sometimes causing the model to synthesize from the wrong source — reranking to a small, high-precision shortlist usually beats simply retrieving more.
11. *How do you keep an index fresh as source documents change, without re-embedding everything?* Track content hashes per document/node in a docstore; on each ingestion run, diff against stored hashes and only re-embed/upsert changed or new documents, deleting nodes for removed documents.
12. *When would you NOT use LlamaIndex for a data-to-LLM problem?* When the core challenge is general multi-step agent orchestration with limited retrieval need (favor LangGraph/PydanticAI), or when you need programmatic prompt/pipeline optimization rather than hand-built retrieval (favor DSPy) — LlamaIndex earns its place specifically when ingestion/indexing/retrieval quality is the bottleneck.
`,

  "coding-questions": `
### 1. Build a minimal end-to-end RAG pipeline (core skill, asked in some form constantly)

~~~python
from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.postprocessor import SimilarityPostprocessor

def build_query_engine(texts: list[str], chunk_size: int = 256):
    """Minimal RAG: documents -> nodes -> vector index -> query engine."""
    documents = [Document(text=t) for t in texts]

    # 1. Ingestion: split into nodes with overlap to avoid losing facts
    #    at chunk boundaries.
    splitter = SentenceSplitter(chunk_size=chunk_size, chunk_overlap=20)

    # 2. Index: embeds each node (uses Settings.embed_model) and stores
    #    vectors. Wrapped in a try/except so a partial embedding
    #    failure doesn't leave a half-built index silently in memory.
    try:
        index = VectorStoreIndex.from_documents(
            documents, transformations=[splitter],
        )
    except Exception as exc:
        raise RuntimeError(f"Index build failed: {exc}") from exc

    # 3. Query: retrieve wide, filter weak matches, synthesize compactly.
    query_engine = index.as_query_engine(
        similarity_top_k=5,
        node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.6)],
        response_mode="compact",
    )
    return query_engine

# query_engine = build_query_engine(["...doc 1 text...", "...doc 2 text..."])
# response = query_engine.query("What is covered under the warranty?")
~~~

Complexity: ingestion is O(n) in document count/size for splitting plus one embedding API call per node (batched in practice); query is one embedding call plus a similarity search whose cost depends on the vector store's index structure (roughly O(log n) for HNSW-based approximate search, O(n) for brute force). Follow-ups: add incremental ingestion (skip unchanged documents), add a reranker stage, add metadata filtering for multi-tenancy.

### 2. Compute retrieval hit rate and MRR against a golden set

~~~python
def evaluate_retrieval(retriever, golden_set: list[dict], k: int = 5) -> dict:
    """
    golden_set: list of {"query": str, "expected_doc_id": str}
    Returns hit_rate (did the expected doc appear in top-k) and
    MRR (mean reciprocal rank of the expected doc, 0 if absent).
    """
    hits = 0
    reciprocal_ranks = []

    for item in golden_set:
        nodes = retriever.retrieve(item["query"])[:k]
        doc_ids = [n.node.metadata.get("doc_id") for n in nodes]

        if item["expected_doc_id"] in doc_ids:
            hits += 1
            rank = doc_ids.index(item["expected_doc_id"]) + 1
            reciprocal_ranks.append(1.0 / rank)
        else:
            reciprocal_ranks.append(0.0)

    n = len(golden_set)
    return {
        "hit_rate": hits / n if n else 0.0,
        "mrr": sum(reciprocal_ranks) / n if n else 0.0,
    }
~~~

Discussion points: why hit_rate and MRR can diverge (a retriever can have high hit rate but low MRR if the right doc is usually retrieved but ranked 4th of 5); how to extend this to graded relevance (nDCG) instead of binary hit/miss; how this connects to the AI Evals skill's broader evaluation methodology.

### 3. Incremental ingestion via content-hash deduplication

~~~python
import hashlib

def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def incremental_ingest(documents, seen_hashes: dict[str, str], pipeline):
    """
    seen_hashes maps doc_id -> last-seen content hash. Only re-ingest
    (re-embed) documents whose content actually changed, to avoid
    paying embedding cost on every run for unchanged documents.
    """
    to_ingest = []
    for doc in documents:
        h = content_hash(doc.text)
        doc_id = doc.metadata.get("doc_id", doc.doc_id)
        if seen_hashes.get(doc_id) != h:
            to_ingest.append(doc)
            seen_hashes[doc_id] = h

    if not to_ingest:
        return 0

    try:
        nodes = pipeline.run(documents=to_ingest, show_progress=True)
    except Exception as exc:
        # Don't update seen_hashes for failed batches — retry next run
        raise RuntimeError(f"Incremental ingestion failed: {exc}") from exc
    return len(nodes)
~~~

Complexity: O(n) hashing over all documents each run (cheap), but embedding cost only for the changed subset — the whole point of the pattern. Follow-ups: persist seen_hashes durably (not in memory), handle document deletions by removing their nodes from the vector store, handle partial-batch failures without losing hash-tracking consistency.
`,

  "hands-on-labs": `
### Lab 1 — Minimal RAG over your own notes (beginner, ~1h)
Take a folder of your own markdown/text notes, load with SimpleDirectoryReader, build a VectorStoreIndex, and query it. Print source_nodes alongside every answer. Deliverable: a CLI script that answers questions about your notes and always shows which note it pulled from. Skills: Document/Node model, basic ingestion, basic query engine.

### Lab 2 — Chunking and reranking experiment (intermediate, ~2h)
Take a small corpus (20-50 documents) with a hand-written golden set of 15-20 (query, expected document) pairs. Measure hit rate/MRR across three chunk sizes (e.g. 128, 256, 512 tokens) and with/without a reranker. Deliverable: a table of hit_rate/MRR per configuration plus a paragraph explaining which combination won and why. Skills: chunking strategy, retrieval evaluation, reranking.

### Lab 3 — Hybrid search and query transformation (advanced, ~3h)
Add a BM25 retriever alongside your vector retriever, fuse them with QueryFusionRetriever, and add a HyDE query transform. Test against a corpus that includes both prose and exact-match content (e.g., product IDs or error codes mixed with descriptive text). Deliverable: a comparison showing queries where hybrid search wins over pure vector search, and why. Skills: hybrid retrieval, query transformation, decision-making about when each technique helps.

### Lab 4 — Production RAG service (production, ~4h)
Wrap Lab 2/3's pipeline in a FastAPI service with separate /ingest and /query endpoints, incremental ingestion via content hashing, structured logging of source_nodes and scores, a /healthz endpoint, and a multi-stage Dockerfile. Load test the query endpoint and report p50/p95 latency broken down by pipeline stage. Skills: the full production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in AI-engineering roles):

1. **Internal documentation Q&A bot** — Ingest a real (or realistic mock) company knowledge base (docs, wiki exports, PDFs) with LlamaIndex, add metadata-based access control by team/role, hybrid search for exact-match terms (ticket IDs, error codes), reranking, and a citation-first chat UI. Demonstrates: full ingestion-to-answer pipeline, access control, evaluation discipline.

2. **Multi-source research assistant** — Combine a vector index over academic papers/articles with a knowledge-graph index over extracted entities (authors, institutions, cited works), letting queries either retrieve similar text or traverse relationships ("who else has this author collaborated with"). Demonstrates: index-type selection, graph-based retrieval, query routing between index types.

3. **RAG evaluation harness as a service** — A standalone tool that takes any LlamaIndex query engine plus a golden set and produces a full report: hit rate, MRR, faithfulness, relevancy, latency per stage, cost per query. Demonstrates: the evaluation rigor that separates prototype RAG from production RAG, directly relevant to the AI Evals skill and to any team's need to justify RAG quality claims with numbers.

Each project: src layout, typed Python, a small pytest suite covering deterministic components (splitters, filters) plus a retrieval-quality regression test against a frozen golden set, CI via GitHub Actions, and a README with an architecture diagram. The evaluation rigor is what separates a "RAG demo" from a project a senior interviewer takes seriously.
`,

  "case-studies": `
### GPT Index to LlamaIndex: naming as a strategy signal
The rename from GPT Index to LlamaIndex in early 2023 wasn't cosmetic — it reflected a deliberate decision to stay LLM-agnostic and data-first rather than tied to one model provider. Lesson: a tool's name and stated scope are a genuine signal of its design philosophy; LlamaIndex has stayed narrowly focused on the data/retrieval layer through every subsequent redesign, resisting scope creep into becoming a full general-purpose agent framework, even as it added its own lightweight agent layer.

### The llama-index-core split
As the ecosystem of integrations (LLM providers, vector stores, embedding providers) grew into the dozens, the monolithic package became unwieldy to install and version — pulling in every integration's dependencies whether you used them or not. LlamaIndex split into a slim llama-index-core plus separately versioned llama-index-<category>-<provider> packages. Lesson: frameworks that succeed at integration breadth eventually have to solve a packaging/dependency-bloat problem, and the fix (a small core plus opt-in integration packages) is a recurring pattern worth recognizing in other fast-growing ecosystems too.

### LlamaParse: recognizing where the real pain is
LlamaIndex's commercial product, LlamaParse, targeted the hardest and most underserved part of RAG in practice — reliably parsing messy real-world documents (scanned PDFs, complex multi-column layouts, embedded tables) — rather than competing on the (already commoditized) vector-search or LLM-orchestration layers. Lesson: in a fast-moving open-source ecosystem, the durable commercial moat is often in the unglamorous, hard-to-commoditize step (parsing, data quality) rather than the flashy layer everyone already has an open-source answer for.

### The shift from Agent classes to Workflows
Early LlamaIndex agent abstractions (ReActAgent and similar fixed-shape agent classes) proved too rigid for the range of agentic patterns teams wanted to build, prompting a move toward the more flexible, event-driven Workflows abstraction as the recommended way to build multi-step and agentic logic on top of the data layer. Lesson: agent abstractions in this ecosystem are still evolving quickly — build for flexibility and expect today's recommended pattern to shift, which is exactly why this page hedges on version-specific API details (see Latest Updates).
`,

  comparisons: `
| Dimension | LlamaIndex | LangChain | DSPy | PydanticAI |
|-----------|-----------|-----------|------|-------------|
| Core focus | Data ingestion, indexing, retrieval (RAG-first) | General agent/chain orchestration across many tool types | Programmatically optimizing prompts/pipelines rather than hand-writing them | Type-safe agent construction with structured inputs/outputs |
| Best default use case | "Chat with my documents/data" | Multi-step agent workflows spanning many heterogeneous tools/APIs | Squeezing reliable performance out of a pipeline via optimization, not manual prompt tuning | Building a reliable, typed agent with validated structured outputs |
| Data/retrieval depth | Deep — readers, multiple index types, rerankers, hybrid search, graph indices | Shallower/integration-based — typically defers to LlamaIndex or a vector-store client directly for serious retrieval needs | Not its focus — assumes you supply retrieval or a simple retriever module | Not its focus — assumes retrieval is handled elsewhere, focuses on the agent/tool-calling contract |
| Agent orchestration depth | Lighter (Workflows, FunctionAgent/ReActAgent) — improving but not the primary strength | Deep — the most mature general agent/chain ecosystem (plus LangGraph for complex control flow) | Not really an agent framework — a pipeline/prompt-optimization framework | Deep on type safety and structured tool-calling; lighter on complex multi-agent orchestration |
| Type safety emphasis | Moderate | Moderate | Low-to-moderate (focus is optimization, not typing) | High — this is its defining feature |
| Learning curve | Low for basic RAG, moderate for advanced retrieval techniques | Moderate-to-high given its breadth | Moderate — requires thinking in "modules and metrics" rather than prompts | Low-to-moderate for teams already comfortable with Pydantic |

**How seniors choose**: reach for LlamaIndex when the hard problem is genuinely data — heterogeneous sources, chunking quality, retrieval precision, and you want that solved well without rebuilding it. Reach for LangChain (or LangGraph) when the hard problem is agent orchestration across many tools and branching logic, using LlamaIndex (or a raw vector-store client) underneath purely for retrieval. Reach for DSPy when hand-tuning prompts has plateaued and you want to optimize a pipeline against a metric programmatically. Reach for PydanticAI when the priority is a strongly-typed, validated agent interface and you're willing to wire retrieval in yourself or via LlamaIndex. In practice, mature systems frequently combine two of these: LlamaIndex for retrieval plus PydanticAI or LangGraph for the surrounding agent logic.

See also the **RAG** skill for the retrieval-augmented-generation pattern itself, independent of which framework implements it.
`,

  "related-technologies": `
- **RAG** — the broader retrieval-augmented-generation pattern that LlamaIndex is one (leading) implementation of; read this first if you haven't, to separate "what RAG is trying to achieve" from "how LlamaIndex specifically does it."
- **Embeddings** — the representation that makes semantic retrieval possible; understanding embedding models (dimensionality, similarity metrics, domain fit) explains most retrieval-quality tuning decisions.
- **Vector Search** — the underlying algorithms (exact vs. approximate nearest neighbor, HNSW) that vector stores implement and LlamaIndex's retrievers call into.
- **Vector Databases (FAISS, Pinecone, Weaviate, Qdrant, Chroma)** — the storage layer LlamaIndex integrates with; LlamaIndex is a client/orchestrator over these, not a replacement for them.
- **Knowledge Graphs** — the underlying graph-database concepts behind LlamaIndex's PropertyGraphIndex and graph-based retrieval.
- **LangChain** — the more general agent/chain orchestration framework, often used alongside LlamaIndex (LlamaIndex for retrieval, LangChain/LangGraph for broader agent logic).
- **DSPy** — a fundamentally different philosophy: programmatic prompt/pipeline optimization rather than hand-authored retrieval and prompting.
- **PydanticAI** — a type-safe agent-construction framework, complementary to LlamaIndex when you want strong typing around the agent layer sitting on top of LlamaIndex's retrieval.
- **AI Evals** — the general discipline of measuring AI system quality, which the RAG-specific evaluation techniques in this page (hit rate, MRR, faithfulness, relevancy) are an application of.
- **Python** — the language every LlamaIndex pipeline is written in; async/concurrency fluency directly improves ingestion pipeline performance.

On this platform, a natural learning path: **Embeddings** → **Vector Search** → **Vector Databases** → **RAG** → **LlamaIndex (this page)** → **LangChain** / **PydanticAI** / **DSPy** for the broader agent-framework landscape.
`,

  "latest-updates": `
Verified against the author's knowledge through roughly early-to-mid 2025 — check the official LlamaIndex changelog and documentation for anything newer, since this framework has moved unusually fast even by AI-tooling standards.

- **Package restructuring**: llama-index split into a slim llama-index-core plus separately versioned integration packages (llama-index-llms-*, llama-index-embeddings-*, llama-index-vector-stores-*, llama-index-readers-*). Older tutorials referencing a single monolithic llama-index import may use outdated paths — check current install/import instructions rather than following an old blog post verbatim.
- **Workflows as the recommended agentic pattern**: the framework has been moving toward an event-driven Workflows abstraction as the primary way to build multi-step and agentic logic, with the older fixed-shape agent classes (ReActAgent and similar) becoming secondary/legacy patterns over time. Verify the current recommended entry point in the docs before starting a new agentic project.
- **LlamaParse and LlamaCloud**: the commercial hosted offerings (document parsing and managed ingestion/retrieval) have continued to expand as the company's primary monetization alongside the open-source core — useful to know when evaluating build-vs-buy for the hardest part of ingestion (messy PDF/document parsing).
- **PropertyGraphIndex** matured as the primary graph-based indexing abstraction, generally superseding older, more limited knowledge-graph index implementations.
- **General ecosystem note**: as with any framework this young and fast-moving, specific class names, constructor signatures, and recommended patterns should be treated as likely to have shifted since this page was written — always cross-check against current official docs before committing to an approach in a new project.
`,

  "future-roadmap": `
Where LlamaIndex appears to be heading, and what's worth betting career time on:

1. **Agentic RAG becomes the default shape**, not a special case — systems that decide per-query whether to retrieve, from where, and how many times, rather than a fixed single-shot retrieve-then-answer pipeline. Workflows-style flexible orchestration is the bet here.
2. **Multi-modal retrieval** (text, images, tables, and structured data retrieved and reasoned over jointly) continues to mature, driven by multi-modal embedding models and document-understanding improvements (this is closely tied to LlamaParse's document-parsing focus).
3. **Evaluation-driven iteration becomes standard practice**, not an afterthought — expect tighter built-in tooling for retrieval and generation evaluation as the ecosystem matures past "does it work in a demo" toward "can we prove it works and keeps working."
4. **Continued specialization vs. general frameworks**: expect LlamaIndex to keep deepening on data/retrieval rather than trying to out-compete LangChain/LangGraph or PydanticAI on general agent orchestration — betting on LlamaIndex specifically as "the best retrieval layer" rather than as an all-purpose agent framework is likely the safer long-term read.
5. **Knowledge-graph and structured-data retrieval** growing in importance as teams hit the limits of pure vector similarity for relationship-heavy queries.

For your career: the durable, transferable skill here is not memorizing LlamaIndex's exact API (which will keep shifting) but understanding the retrieval pipeline conceptually — chunking tradeoffs, retrieve-wide-then-rerank, hybrid search, evaluation discipline — since that knowledge transfers directly to whatever the next dominant RAG framework turns out to be.
`,

  "cheat-sheet": `
~~~python
# --- Core data model ---
from llama_index.core import Document
doc = Document(text="...", metadata={"source": "f.txt"})   # raw unit
# Node = a chunk of a Document after splitting; the retrievable unit

# --- Loading ---
from llama_index.core import SimpleDirectoryReader
documents = SimpleDirectoryReader(input_dir="./data").load_data()

# --- Chunking ---
from llama_index.core.node_parser import SentenceSplitter
splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)

# --- Index types ---
from llama_index.core import VectorStoreIndex, SummaryIndex, TreeIndex
index = VectorStoreIndex.from_documents(documents, transformations=[splitter])
# SummaryIndex: full-coverage/summarize queries; TreeIndex: hierarchical docs

# --- Persist / reload (avoid re-embedding) ---
index.storage_context.persist(persist_dir="./storage")
from llama_index.core import StorageContext, load_index_from_storage
sc = StorageContext.from_defaults(persist_dir="./storage")
index = load_index_from_storage(sc)

# --- Query pipeline ---
from llama_index.core.postprocessor import SimilarityPostprocessor
qe = index.as_query_engine(
    similarity_top_k=10,
    node_postprocessors=[SimilarityPostprocessor(similarity_cutoff=0.7)],
    response_mode="compact",   # or "refine" / "tree_summarize"
)
response = qe.query("question")
for n in response.source_nodes: print(n.score, n.node.text[:60])

# --- Retriever only (bypass synthesis, for debugging/evals) ---
retriever = index.as_retriever(similarity_top_k=5)
nodes = retriever.retrieve("question")

# --- Hybrid search ---
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.retrievers import QueryFusionRetriever
fusion = QueryFusionRetriever([vector_retriever, bm25_retriever],
                              similarity_top_k=5, mode="reciprocal_rerank")

# --- Metadata filtering ---
from llama_index.core.vector_stores import MetadataFilters, MetadataFilter
filters = MetadataFilters(filters=[MetadataFilter(key="tenant", value="acme")])
qe = index.as_query_engine(filters=filters)

# --- Global settings ---
from llama_index.core import Settings
Settings.llm = ...            # e.g. OpenAI(model="gpt-4o-mini", timeout=30)
Settings.embed_model = ...    # e.g. OpenAIEmbedding(model="text-embedding-3-small")
Settings.chunk_size = 512

# --- Evaluation sketch ---
# hit_rate = fraction of golden queries whose expected doc is in top-k
# MRR = mean of 1/rank of expected doc (0 if absent)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Document vs Node? | Document = raw source unit + metadata; Node = a chunk after splitting, the actual retrievable unit |
| Default/most common index type? | VectorStoreIndex — semantic similarity search over embedded chunks |
| When to use SummaryIndex over VectorStoreIndex? | When queries need full-coverage synthesis ("summarize everything") rather than targeted top-k retrieval |
| Why does chunk overlap matter? | Prevents a fact from being split exactly across a chunk boundary and diluted in both resulting chunks |
| What is the "retrieve wide, rerank narrow" pattern? | Retrieve a larger top_k (10-20), then use a reranker to narrow to the best 3-5 before synthesis |
| What does a node postprocessor do? | Filters or reorders retrieved nodes after retrieval, before synthesis (similarity cutoff, reranking, metadata filters) |
| response_mode="refine" vs "compact"? | refine calls the LLM once per node, iteratively updating the answer; compact packs as many nodes as fit into one call |
| What is HyDE? | Hypothetical Document Embeddings — ask the LLM to write a hypothetical answer, then embed and search with that instead of the raw query |
| Hit rate vs MRR? | Hit rate = fraction of queries where the expected doc appears in top-k; MRR = mean reciprocal rank of the expected doc across queries |
| Why must embedding models match between ingestion and query? | Embeddings from different models occupy different vector spaces; similarity comparisons across them are meaningless even without an error |
| What is a PropertyGraphIndex for? | Retrieval based on entity relationships/graph traversal rather than pure text similarity — see the Knowledge Graphs skill |
| Biggest production cost lever for ingestion? | Incremental ingestion via content-hash deduplication, so unchanged documents aren't re-embedded on every run |
| LlamaIndex vs LangChain, one-line? | LlamaIndex is data/retrieval-first; LangChain is a more general agent/chain orchestration framework |
| LlamaIndex vs DSPy, one-line? | LlamaIndex hand-builds a retrieval/RAG pipeline; DSPy programmatically optimizes prompts/pipelines against a metric |
| Where do agents fit with LlamaIndex? | A query engine can be wrapped as a tool inside an agent (LlamaIndex Workflows, or another framework), so retrieval becomes one callable capability rather than an always-on step |
`,

  mcqs: `
**1. Which index type is the best default for "find the most relevant chunks to answer this specific question"?**

A) SummaryIndex  B) VectorStoreIndex  C) KeywordTableIndex  D) TreeIndex

**Answer: B** — VectorStoreIndex performs targeted semantic similarity search, the right fit for focused-question retrieval; the others suit full-coverage summarization, exact keyword matching, or hierarchical documents respectively.

**2. A query engine returns a fluent but factually wrong answer. What should you check first?**

A) The LLM's temperature setting  B) response.source_nodes and their similarity scores  C) The system prompt wording  D) The LLM provider's status page

**Answer: B** — most "wrong answer" bugs in RAG are retrieval bugs (wrong or missing context), not prompt or model bugs; inspecting the retrieved nodes should always be the first debugging step.

**3. Why can increasing similarity_top_k make final answers worse?**

A) It always increases latency with no other effect  B) More retrieved nodes can introduce irrelevant/noisy context that dilutes or misleads synthesis  C) It reduces the embedding model's accuracy  D) It disables reranking automatically

**Answer: B** — retrieving more candidates without filtering/reranking can flood the LLM's context with low-relevance chunks, actively hurting answer quality even as recall technically improves.

**4. What is the main risk of using pure vector (embedding) search for a corpus full of exact product codes and error strings?**

A) Vector search cannot run on such data at all  B) Embedding models can rank paraphrase-similar text highly while under-matching exact tokens they weren't trained to weight precisely  C) Vector stores reject non-prose text  D) Chunking becomes impossible

**Answer: B** — this is exactly the case hybrid (vector + keyword/BM25) search is designed to address.

**5. Why should embedding models be kept consistent between ingestion and query time?**

A) It's a licensing requirement  B) Different embedding models produce vectors in different, non-comparable spaces, silently degrading similarity search  C) It's only a performance optimization, not a correctness issue  D) LlamaIndex enforces this automatically and will error otherwise

**Answer: B** — mismatched embedding models produce no error, just quietly worse (or meaningless) similarity scores, which is why this is a classic hard-to-diagnose production bug.

**6. What best distinguishes LlamaIndex from LangChain?**

A) LlamaIndex cannot call LLMs at all  B) LlamaIndex is data/retrieval-first while LangChain is a more general agent/chain orchestration framework  C) They are functionally identical  D) LangChain cannot do retrieval

**Answer: B** — both can be used for RAG, but their center of gravity differs; many production systems use both together, LlamaIndex for retrieval and LangChain/LangGraph for broader agent orchestration.
`,

  "revision-notes": `
**Core model in 4 lines:** A Document is a raw source unit with metadata; splitting produces Nodes, the retrievable chunks. VectorStoreIndex (embed + similarity search) is the default index; SummaryIndex, TreeIndex, KeywordTableIndex, and PropertyGraphIndex exist for full-coverage, hierarchical, exact-match, and relationship-based retrieval needs respectively. Choice of index shapes retrieval behavior fundamentally, not just performance.

**Ingestion in 4 lines:** Readers load heterogeneous sources into Documents. Splitters chunk them into Nodes — chunk size and overlap are the highest-leverage retrieval-quality knobs, tuned per document type. An embedding model turns each Node into a vector. Vectors persist to a vector store; incremental ingestion via content hashing avoids re-embedding unchanged documents.

**Query pipeline in 4 lines:** A retriever embeds the query and finds similar nodes in the vector store. Node postprocessors filter (similarity cutoff) and rerank (cross-encoder) the candidates — retrieve wide, rerank narrow. A response synthesizer combines the surviving nodes with the query into a prompt (compact/refine/tree_summarize) and calls the LLM. The response carries source_nodes for citation and debugging.

**Advanced techniques in 3 lines:** Hybrid search (vector + BM25/keyword) fixes exact-match blind spots; query transformation (HyDE, sub-question decomposition, multi-query) fixes bad or ambiguous user queries before retrieval runs; metadata filtering narrows candidates for both relevance and access control.

**Production and ecosystem in 4 lines:** Separate ingestion (batch, expensive, infrequent) from query serving (fast, cheap-per-call, constant) as distinct services. Evaluate retrieval (hit rate, MRR) and generation (faithfulness, relevancy) separately, tied to the AI Evals discipline. LlamaIndex is data/retrieval-first — pair it with LangChain/LangGraph or PydanticAI for broader agent orchestration, and with a real vector store (FAISS/Pinecone/Weaviate/Qdrant/Chroma) for storage. The API surface moves quickly; verify current class names and imports against official docs rather than trusting memorized specifics.
`,

  "learning-roadmap": `
A realistic path to production-level LlamaIndex fluency:

**Week 1 — Foundations.** Beginner Concepts + Lab 1. Build a VectorStoreIndex over your own notes and query it, always inspecting source_nodes. Milestone: you can explain Document vs Node without hesitating.

**Week 2 — Chunking and retrieval tuning.** Intermediate Concepts + Lab 2. Experiment with chunk size/overlap and measure hit rate/MRR against a small golden set. Milestone: you have a number, not a feeling, for "does this chunking config work better."

**Week 3 — Advanced retrieval.** Advanced Concepts + Lab 3. Add hybrid search and a query transformation technique (HyDE or sub-question decomposition); test on a corpus with exact-match-sensitive content. Milestone: you can articulate when hybrid search beats pure vector search, with evidence from your own test.

**Week 4 — Internals and evaluation.** Internal Working, Architecture, Data Flow sections; build the retrieval-evaluation harness from Coding Question 2. Milestone: you can trace a query through retriever → postprocessor → synthesizer → LLM from memory.

**Week 5 — Production.** Production Usage through Deployment sections; Lab 4. Ship a containerized query API with incremental ingestion, structured logging, and health checks. Milestone: a working, evaluated, deployed RAG service on your GitHub.

**Week 6 — Agents and ecosystem context.** Read the agent-wrapping pattern in Advanced Concepts, then the Comparisons section closely. Milestone: you can justify, out loud, when you'd choose LlamaIndex alone versus pairing it with LangChain/PydanticAI/DSPy for a given project.

Then continue to the **LangChain** or **PydanticAI** skill on this platform to build the agent-orchestration layer that typically sits on top of a LlamaIndex retrieval backend.
`,

  "official-docs": `
- [LlamaIndex documentation](https://docs.llamaindex.ai/) — the primary reference; check this before trusting any tutorial's specific import paths or class names, given how fast the package structure has evolved.
- [LlamaIndex API reference](https://docs.llamaindex.ai/en/stable/api_reference/) — precise class/method signatures for the current release.
- [LlamaHub](https://llamahub.ai/) — the registry of readers/integrations (data loaders, vector stores, LLM providers) available as separate packages.
- [LlamaIndex GitHub repository](https://github.com/run-llama/llama_index) — release notes and examples/ directory are often more current than prose documentation for fast-moving features like Workflows.
- [LlamaParse documentation](https://docs.cloud.llamaindex.ai/) — the hosted document-parsing product's docs, useful even if you don't use the paid tier, for understanding what "hard" document parsing actually requires.
`,

  books: `
- There is no single widely recognized, edition-stable book dedicated specifically to LlamaIndex as of the author's knowledge cutoff — the framework and its API have moved fast enough that book-length treatments age quickly; the official documentation and GitHub examples are the more reliable primary source.
- **Building LLM Powered Applications** (various recent titles covering RAG architecture generally) — useful for the conceptual RAG material that LlamaIndex implements; verify the specific title's publication date against how current you need the framework-specific details to be.
- **Designing Machine Learning Systems** — Chip Huyen. Not LlamaIndex-specific, but the strongest general treatment of the production-ML-system thinking (evaluation, monitoring, data pipelines) that transfers directly to production RAG.
- For the underlying concepts rather than the framework itself, see the **books** listed on the **RAG**, **Embeddings**, and **Vector Search** skill pages — those foundations age much more slowly than any specific library's API.
`,

  blogs: `
- **LlamaIndex official blog** (llamaindex.ai/blog) — the most reliable source for framework-specific patterns, since it's maintained by the team itself and tracks the current API.
- **Jerry Liu's public talks/writing** — the creator's own explanations of design decisions (why Workflows, why the core/integrations split) carry the most authoritative "why," not just "how."
- **Pinecone's learning center** and **Weaviate's blog** — vector-store vendors publish strong general RAG-architecture content that's framework-agnostic but directly applicable to LlamaIndex pipelines.
- **Hamel Husain's writing on RAG evaluation** — high-signal, practitioner-focused content specifically on the "how do you actually know if your RAG system works" problem this page covers in Advanced Concepts and Testing.
- General AI-engineering newsletters/blogs (see the **RAG** and **AI Evals** skill pages' blog lists) frequently cover LlamaIndex-adjacent patterns even when not naming the framework explicitly.
`,

  "research-papers": `
Direct academic literature specifically on LlamaIndex as a system is thin — it is an engineering framework, not itself the subject of peer-reviewed research. The closest and most valuable foundational reading is the papers underlying the techniques LlamaIndex implements:

- **"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"** (Lewis et al., 2020) — the foundational RAG paper; read this to understand what LlamaIndex's query pipeline is implementing.
- **"Precise Zero-Shot Dense Retrieval without Relevance Labels"** (Gao et al., 2022) — introduces HyDE, the query-transformation technique covered in Advanced Concepts.
- **"Dense Passage Retrieval for Open-Domain Question Answering"** (Karpukhin et al., 2020) — foundational work on dense (embedding-based) retrieval versus sparse (BM25) retrieval, underlying the hybrid-search discussion.
- **"Lost in the Middle: How Language Models Use Long Contexts"** (Liu et al., 2023) — directly relevant to why "retrieve wide, then narrow with a reranker" beats simply stuffing many chunks into a long context window.
- For knowledge-graph-based retrieval, see the foundational reading list on the **Knowledge Graphs** skill page rather than LlamaIndex-specific sources, since the underlying graph-retrieval theory predates and is broader than any one framework's implementation.
`,

  videos: `
- **Jerry Liu's LlamaIndex conference talks** (various AI Engineer Summit and similar conference appearances) — the creator explaining design rationale directly, including why the framework has repeatedly restructured its agent/workflow abstractions.
- **LlamaIndex's own YouTube channel** — official walkthroughs of new features (Workflows, LlamaParse, PropertyGraphIndex) that track the current API more reliably than older third-party tutorials.
- **DeepLearning.AI's "Building and Evaluating Advanced RAG"** short course — covers evaluation techniques (hit rate, MRR, faithfulness) directly applicable to the Advanced Concepts and Testing sections here.
- General **RAG architecture talks** from major AI conferences (AI Engineer Summit, individual vector-database vendor conferences) — useful for the framework-agnostic retrieval concepts that LlamaIndex implements.
- Caution: given the framework's fast pace of change, prefer videos dated within the last year or so, and verify specific code shown still matches current imports/class names before copying it.
`,

  "github-repos": `
- [run-llama/llama_index](https://github.com/run-llama/llama_index) — the main repository; the examples/ and docs/examples directories are often the most current source of truth for API usage.
- [run-llama/llama_parse](https://github.com/run-llama/llama_parse) — the LlamaParse client, useful reference for production-grade document parsing patterns even outside the managed service.
- [facebookresearch/faiss](https://github.com/facebookresearch/faiss) — the vector-similarity-search library many LlamaIndex tutorials use as a lightweight local vector store.
- [qdrant/qdrant](https://github.com/qdrant/qdrant) and [weaviate/weaviate](https://github.com/weaviate/weaviate) — popular production vector-store backends with first-class LlamaIndex integrations; reading their docs clarifies what LlamaIndex is and isn't responsible for.
- [explodinggradients/ragas](https://github.com/explodinggradients/ragas) — a RAG-evaluation library (faithfulness, relevancy, context precision/recall) that pairs naturally with LlamaIndex query engines for the evaluation techniques in this page.
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) — worth browsing specifically to see where its retrieval abstractions overlap and differ from LlamaIndex's, for the Comparisons section.
- [jerryjliu/create-llama](https://github.com/run-llama/create-llama) (or successor scaffolding tool under run-llama) — a project-scaffolding CLI that generates a starter full-stack RAG app, useful for seeing an opinionated reference project layout.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Chunking fluency*: take one long document (a long article or a small book chapter) and produce nodes at three different chunk sizes; manually inspect five nodes from each and judge which preserves meaning best.
2. *Retriever fluency*: build a retriever-only (no synthesis) function and test it against 10 hand-written queries against a small known corpus, verifying by eye that the right document surfaces in top-3.
3. *Evaluation*: implement the hit rate/MRR evaluator from Coding Question 2 against a golden set of at least 20 (query, expected doc) pairs you write yourself.
4. *Reranking*: compare retrieval quality with and without a reranker on a corpus where several documents are topically similar but only one is truly relevant per query — quantify the improvement.
5. *Hybrid search*: build a corpus that mixes prose with exact-match content (IDs, codes) and demonstrate a query where pure vector search fails but hybrid search succeeds.
6. *Query transformation*: implement HyDE on a corpus of short, ambiguous queries and compare answer quality against the untransformed baseline.
7. *Incremental ingestion*: implement the content-hash deduplication pattern from Coding Question 3 and verify via logging that re-running ingestion on an unchanged corpus performs zero embedding calls.
8. *Agent integration*: wrap a query engine as a tool inside a simple agent (LlamaIndex Workflows or another framework) alongside one other tool (e.g., a calculator), and test that the agent correctly chooses not to retrieve for a question the other tool can answer directly.

External sets: the retrieval-augmented-generation sections of RAG-focused evaluation frameworks like ragas' example notebooks; Kaggle/HuggingFace datasets with question-answering ground truth (e.g., SQuAD-style sets) repurposed as golden sets for retrieval evaluation practice.
`,

  "architecture-diagram": `
The reference production architecture for a LlamaIndex-based RAG service — the shape most real deployments converge on:

~~~mermaid
flowchart TB
    subgraph Sources["Data sources"]
        S1["PDFs / Docs"]
        S2["Notion / Wiki"]
        S3["SQL / APIs"]
    end
    subgraph IngestSvc["Ingestion service (batch/scheduled)"]
        Readers["Readers"] --> Docs["Documents"]
        Docs --> Splitter["Splitter / NodeParser"]
        Splitter --> Embed["Embedding model API"]
        Embed --> Cache[("Content-hash cache\n(skip unchanged docs)")]
    end
    Sources --> Readers
    Embed --> VS[("Vector store\n(Pinecone/Weaviate/Qdrant/\nChroma/pgvector)")]

    subgraph QuerySvc["Query API (stateless, horizontally scaled)"]
        Ret["Retriever"] --> Post["Postprocessors\n(cutoff + rerank)"]
        Post --> Synth["Response synthesizer"]
    end
    Client["Client app"] --> LB["Load balancer"]
    LB --> QuerySvc
    Ret -->|similarity search| VS
    Synth -->|prompt + context| LLMAPI["LLM API"]
    QuerySvc --> Client

    subgraph Obs["Observability"]
        Logs["Structured logs\n(source_nodes, scores)"]
        Metrics["Retrieval score / latency metrics"]
        EvalJob["Scheduled eval job\n(hit rate, MRR, faithfulness)"]
    end
    QuerySvc -.-> Obs
    IngestSvc -.-> Obs
~~~

Every box maps to a section on this page: Sources/Readers to Beginner Concepts, Splitter/Embed to Intermediate Concepts, the vector store to the Vector Databases skills, Retriever/Postprocessors/Synth to Internal Working and Data Flow, and the Observability subgraph to Monitoring and Testing.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((LlamaIndex))
    Data model
      Document
      Node
      Metadata
    Index types
      VectorStoreIndex
      SummaryIndex
      TreeIndex
      KeywordTableIndex
      PropertyGraphIndex
    Ingestion
      Readers/connectors
      Chunking & overlap
      Embedding models
      Incremental ingestion
      Caching
    Query pipeline
      Retriever
      Node postprocessors
      Rerankers
      Response synthesizer
      response_mode variants
    Advanced retrieval
      Hybrid search (vector + BM25)
      Metadata filtering
      Query transformation (HyDE, sub-question)
      Knowledge graph retrieval
    Evaluation
      Hit rate / MRR
      Faithfulness / relevancy
      Golden sets
    Production
      Index persistence & versioning
      Separate ingestion vs query services
      Observability
      Security & access control
    Ecosystem
      RAG
      Embeddings & Vector Search
      Vector Databases
      LangChain / DSPy / PydanticAI
      Agents on top of retrieval
~~~
`,
};

export default llamaindex;
