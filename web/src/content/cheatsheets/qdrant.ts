import type { CheatSheetData } from "./types";

const qdrant: CheatSheetData = {
  title: "The Ultimate Qdrant Cheat Sheet",
  subtitle: "Rust-built performance · filtering architecture · quantization · production toolbelt",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Written in Rust", desc: "Memory safety WITHOUT garbage collection -> predictable latency", code: "from qdrant_client import QdrantClient\nclient = QdrantClient(url='http://localhost:6333')" },
        { term: "Points", desc: "Vector + ID + JSON payload — Qdrant's term for a stored entry", code: "PointStruct(id=1, vector=emb, payload={'category': 'electronics'})" },
        { term: "Create collection", desc: "size/distance must match your embedding model exactly", code: "client.create_collection(collection_name='docs',\n  vectors_config=VectorParams(size=768, distance=Distance.COSINE))" },
        { term: "Upsert", desc: "Batch this for bulk ingestion — never one point per call", code: "client.upsert(collection_name='docs', points=[PointStruct(...)])" },
      ],
    },
    {
      title: "Filtering — Qdrant's #1 Differentiator",
      color: "blue",
      rows: [
        { term: "ALWAYS index filtered fields", desc: "Unindexed = slow fallback path, the most common perf mistake", code: "client.create_payload_index(collection_name='docs',\n  field_name='category', field_schema='keyword')" },
        { term: "Combined vector + filter query", desc: "must (AND), must_not (NOT), should (OR/boost)", code: "Filter(must=[FieldCondition(key='category', match=MatchValue(value='x'))])" },
        { term: "Why this is hard", desc: "Naive 'search then filter' starves results under high selectivity", code: "// Qdrant integrates filtering INTO HNSW traversal directly" },
        { term: "Range filter", desc: "For numeric conditions", code: "FieldCondition(key='price', range=Range(lte=200))" },
      ],
    },
    {
      title: "Quantization (memory efficiency)",
      color: "emerald",
      rows: [
        { term: "Scalar (int8)", desc: "Moderate compression, moderate recall impact", code: "ScalarQuantization(scalar=ScalarQuantizationConfig(type=ScalarType.INT8))" },
        { term: "Binary (extreme)", desc: "Massive compression — recall impact is MODEL-DEPENDENT", code: "BinaryQuantization(binary=BinaryQuantizationConfig(always_ram=True))" },
        { term: "ALWAYS validate empirically", desc: "Never assume a quantization level 'just works' for your model", code: "// Compare quantized vs exact search results on real test queries" },
      ],
    },
    {
      title: "Multi-Tenancy (NO structural enforcement)",
      color: "amber",
      rows: [
        { term: "Payload-based approach", desc: "Unlike Pinecone namespaces / Weaviate native multi-tenancy", code: "payload={'tenant_id': 'tenant-42', ...}" },
        { term: "ALWAYS wrap tenant queries", desc: "A forgotten filter = a real data-leak risk — test this explicitly", code: "def tenant_search(client, tenant_id, q):\n  return client.query_points(..., query_filter=Filter(must=[\n    FieldCondition(key='tenant_id', match=MatchValue(value=tenant_id))]))" },
      ],
    },
    {
      title: "Deployment Philosophy",
      color: "rose",
      rows: [
        { term: "Single node = complete deployment", desc: "Unlike Milvus's assumed distributed architecture", code: "docker run -p 6333:6333 qdrant/qdrant" },
        { term: "Clustering is OPT-IN", desc: "Only add distributed complexity for genuine scale needs", code: "helm install my-qdrant qdrant/qdrant --set replicaCount=3" },
        { term: "Qdrant Cloud", desc: "Managed alternative — open-source portability preserved", code: "// Same model as Zilliz Cloud/Weaviate Cloud, unlike Pinecone" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "HNSW tuning", desc: "Same fundamentals as FAISS — validate empirically", code: "search_params={'hnsw_ef': 128}" },
        { term: "Backup", desc: "Built-in snapshot mechanism", code: "client.create_snapshot(collection_name='docs')" },
        { term: "Named vectors", desc: "Multiple embeddings per point (e.g., text + image)", code: "vectors_config={'text': VectorParams(...), 'image': VectorParams(...)}" },
        { term: "Open source", desc: "Apache 2.0, self-hostable — no vendor lock-in", code: "// Direct contrast to Pinecone's closed-source model" },
      ],
    },
  ],
};

export default qdrant;
