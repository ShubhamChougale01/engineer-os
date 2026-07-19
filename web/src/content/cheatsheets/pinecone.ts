import type { CheatSheetData } from "./types";

const pinecone: CheatSheetData = {
  title: "The Ultimate Pinecone Cheat Sheet",
  subtitle: "Managed vector search · metadata filtering · namespaces · production toolbelt",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "It's a managed SERVICE, not a library", desc: "Every call is a real network request — unlike FAISS", code: "from pinecone import Pinecone\npc = Pinecone(api_key='...')" },
        { term: "Create an index", desc: "Dimension & metric FIXED once created", code: "pc.create_index(name='idx', dimension=1536, metric='cosine',\n  spec=ServerlessSpec(cloud='aws', region='us-east-1'))" },
        { term: "Upsert", desc: "Update-or-insert — same ID replaces the existing vector", code: "index.upsert(vectors=[{'id':'doc1','values':emb,'metadata':{'category':'x'}}])" },
        { term: "Query", desc: "Similarity search + metadata filter in ONE call", code: "index.query(vector=q, top_k=5,\n  filter={'category': {'$eq': 'electronics'}}, include_metadata=True)" },
      ],
    },
    {
      title: "Metadata & Filtering",
      color: "blue",
      rows: [
        { term: "Filter operators", desc: "eq, ne, gt/gte, lt/lte, in/nin, and/or", code: "{'price': {'$gte': 50, '$lte': 200}, '$or': [{'brand':{'$eq':'Acme'}}]}" },
        { term: "Update metadata only", desc: "No need to re-upsert the full vector", code: "index.update(id='doc1', set_metadata={'in_stock': False})" },
        { term: "Design metadata deliberately", desc: "Structured, low-cardinality fields — not raw free text", code: "// GOOD: category, price, in_stock. AVOID: full_document_text" },
        { term: "Delete", desc: "By ID or by metadata filter", code: "index.delete(ids=['doc1'])\nindex.delete(filter={'category':{'$eq':'discontinued'}})" },
      ],
    },
    {
      title: "Multi-Tenancy",
      color: "emerald",
      rows: [
        { term: "Namespaces", desc: "Logical isolation within ONE index — commonly one per tenant", code: "index.upsert(vectors=[...], namespace='tenant-42')\nindex.query(vector=q, namespace='tenant-42')" },
        { term: "Common bug", desc: "Upsert to one namespace, query a different one -> empty results", code: "// Always verify namespace consistency between write and read paths" },
      ],
    },
    {
      title: "Architecture Choice",
      color: "amber",
      rows: [
        { term: "Serverless (default recommendation)", desc: "Auto-scales, billed by actual usage", code: "spec=ServerlessSpec(cloud='aws', region='us-east-1')" },
        { term: "Pod-based", desc: "Pre-provisioned capacity, billed continuously", code: "spec=PodSpec(environment='us-east-1-aws', pod_type='p1.x1', pods=1)" },
        { term: "Eventual consistency", desc: "A just-upserted vector may not appear IMMEDIATELY", code: "// Allow a brief delay before relying on read-after-write" },
      ],
    },
    {
      title: "Hybrid Search & Reranking",
      color: "rose",
      rows: [
        { term: "Hybrid (dense + sparse)", desc: "Catches exact keyword matches semantic search alone can miss", code: "index.query(vector=dense_q, sparse_vector={'indices':[...], 'values':[...]})" },
        { term: "Retrieve-then-rerank", desc: "Fetch more candidates than needed, rerank for final relevance", code: "results = index.query(vector=q, top_k=20)\ntop5 = rerank(query_text, results)[:5]" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "ALWAYS handle errors/timeouts", desc: "Treat every call like any external API dependency", code: "try:\n  results = index.query(vector=emb, top_k=5, timeout=10)\nexcept Exception as e: handle(e)" },
        { term: "Batch bulk ingestion", desc: "Never one vector per request at scale", code: "for i in range(0, len(vecs), 100): index.upsert(vectors=vecs[i:i+100])" },
        { term: "No self-hosted option", desc: "Proprietary, cloud-only — a real, deliberate lock-in tradeoff", code: "// Migration = export via API, re-upsert into an alternative" },
      ],
    },
  ],
};

export default pinecone;
