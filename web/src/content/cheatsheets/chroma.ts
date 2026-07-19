import type { CheatSheetData } from "./types";

const chroma: CheatSheetData = {
  title: "The Ultimate Chroma Cheat Sheet",
  subtitle: "Zero-setup embedded mode · auto-embedding · persistence · when to graduate",
  sections: [
    {
      title: "Zero-Setup Core Model",
      color: "violet",
      rows: [
        { term: "No server needed at all", desc: "The only vector DB in this category with a true zero-infrastructure mode", code: "import chromadb\nclient = chromadb.Client()   # in-memory, no Docker, no account" },
        { term: "ALWAYS use for persistence", desc: "Client() is in-memory ONLY -- lost on process exit", code: "client = chromadb.PersistentClient(path='./chroma_data')" },
        { term: "Create collection", desc: "Idempotent creation avoids 'already exists' errors", code: "collection = client.get_or_create_collection(name='documents')" },
      ],
    },
    {
      title: "Auto-Embedding (no pre-computed vectors needed)",
      color: "blue",
      rows: [
        { term: "Add raw text directly", desc: "Chroma embeds it for you via a free local model by default", code: "collection.add(documents=['RAG combines search with generation.'],\n  metadatas=[{'category': 'AI'}], ids=['doc1'])" },
        { term: "Query with raw text", desc: "Same auto-embedding applies to queries", code: "collection.query(query_texts=['how does RAG work'], n_results=5)" },
        { term: "Custom embedding function", desc: "Swap in OpenAI/Cohere when you need a specific model's quality", code: "from chromadb.utils import embedding_functions\nef = embedding_functions.OpenAIEmbeddingFunction(api_key='...', model_name='text-embedding-3-small')" },
        { term: "NEVER mix embedding functions", desc: "Mismatch = SILENTLY meaningless results, no error raised", code: "// Use the SAME embedding function for a collection's entire lifetime" },
      ],
    },
    {
      title: "Querying & Filtering",
      color: "emerald",
      rows: [
        { term: "Combined search + filter", desc: "The universal 'similar AND matching this condition' pattern", code: "collection.query(query_texts=['RAG'], n_results=5, where={'category': 'AI'})" },
        { term: "Update / delete", desc: "By ID or by metadata filter", code: "collection.update(ids=['doc1'], metadatas=[{'updated': True}])\ncollection.delete(where={'category': 'outdated'})" },
        { term: "Inspect raw contents", desc: "Debug what's actually stored, no query needed", code: "collection.get(include=['documents', 'metadatas', 'embeddings'])" },
      ],
    },
    {
      title: "Deployment Modes",
      color: "amber",
      rows: [
        { term: "Embedded (default)", desc: "Runs inside your own Python process -- zero separate infra", code: "// Resource usage = YOUR process's memory/CPU, nothing separate" },
        { term: "Client-server (opt-in)", desc: "For multiple processes sharing one collection", code: "// CLI: chroma run --path ./chroma_data --port 8000\nclient = chromadb.HttpClient(host='localhost', port=8000)" },
        { term: "Chroma Cloud", desc: "Managed option, same open-core-plus-cloud pattern as Milvus/Weaviate", code: "// Path to managed convenience without an app rewrite" },
      ],
    },
    {
      title: "Ecosystem Integration",
      color: "rose",
      rows: [
        { term: "LangChain vector store", desc: "The most common Chroma integration pattern in tutorials", code: "from langchain_community.vectorstores import Chroma\nvs = Chroma.from_texts(texts=[...], embedding=embed_model, persist_directory='./data')" },
        { term: "Why it's the default tutorial DB", desc: "Lowest possible friction to a first working RAG demo", code: "// Even lower friction than Pinecone's cloud signup" },
      ],
    },
    {
      title: "Know When You've Outgrown It",
      color: "cyan",
      rows: [
        { term: "Embedded mode's real ceiling", desc: "Bounded by a single Python process's memory/CPU -- no sharding", code: "// Not a genuine distributed system like Milvus/Qdrant" },
        { term: "Signals to migrate", desc: "High concurrency, advanced filtering perf, real multi-tenancy, billion-vector scale", code: "// -> Qdrant (filtering), Milvus (scale), Weaviate (schema), Pinecone (managed)" },
        { term: "Migration is straightforward", desc: "Export via get(), re-insert into the target database", code: "data = collection.get(include=['documents', 'metadatas', 'embeddings'])" },
      ],
    },
  ],
};

export default chroma;
