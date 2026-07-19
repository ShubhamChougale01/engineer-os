import type { CheatSheetData } from "./types";

const faiss: CheatSheetData = {
  title: "The Ultimate FAISS Cheat Sheet",
  subtitle: "Index types · recall tuning · stable IDs · production toolbelt",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "It's a LIBRARY, not a DB", desc: "No server, no network API, no persistence layer", code: "import faiss\nindex = faiss.IndexFlatL2(dimension)  # in-process only" },
        { term: "Exact search", desc: "Compares against EVERY vector — always correct, slow at scale", code: "index = faiss.IndexFlatL2(dimension)  # or IndexFlatIP" },
        { term: "Distance metric choice", desc: "Depends on how the embedding model was trained", code: "IndexFlatL2   # Euclidean — smaller = more similar\nIndexFlatIP   # inner product — for cosine sim (normalize first!)" },
        { term: "Stable IDs (ALWAYS use)", desc: "Raw positions silently break after deletions/rebuilds", code: "index = faiss.IndexIDMap(faiss.IndexFlatL2(d))\nindex.add_with_ids(vectors, ids)" },
      ],
    },
    {
      title: "Approximate Index Types",
      color: "blue",
      rows: [
        { term: "IVF (clustering)", desc: "Partitions space; searches only nprobe nearest clusters", code: "index = faiss.IndexIVFFlat(quantizer, d, nlist=100)\nindex.train(data); index.nprobe = 10" },
        { term: "HNSW (graph)", desc: "No training needed — great recall/speed, higher memory", code: "index = faiss.IndexHNSWFlat(d, M=32)\nindex.hnsw.efSearch = 50" },
        { term: "Product Quantization", desc: "Compresses vectors — memory savings, some accuracy cost", code: "index = faiss.IndexPQ(d, m=8, bits=8)" },
        { term: "IVFPQ (the scale combo)", desc: "Standard choice at 10M-1B+ vectors", code: "index = faiss.IndexIVFPQ(quantizer, d, nlist, m, bits)" },
        { term: "Training is REQUIRED for IVF/PQ", desc: "Learns cluster centers / codebooks from sample data", code: "index.train(representative_vectors)  # before add() or search()" },
      ],
    },
    {
      title: "Evaluation & Tuning",
      color: "emerald",
      rows: [
        { term: "ALWAYS measure recall empirically", desc: "Theory isn't enough — validate on YOUR actual data", code: "recall = mean(len(set(approx) & set(exact)) / k for pairs)" },
        { term: "nprobe (IVF)", desc: "Higher = better recall, slower search", code: "index.nprobe = 10" },
        { term: "efSearch (HNSW)", desc: "Higher = better recall, slower search", code: "index.hnsw.efSearch = 50" },
        { term: "Curse of dimensionality", desc: "Higher-dim vectors often need more aggressive search params", code: "// Re-tune nprobe/efSearch as dimensionality or scale grows" },
      ],
    },
    {
      title: "Metadata & Filtering",
      color: "amber",
      rows: [
        { term: "No native metadata filtering", desc: "FAISS only knows vectors and IDs — nothing else", code: "// Maintain your own ID -> metadata mapping separately" },
        { term: "Over-fetch + filter pattern", desc: "The common workaround for 'similar AND matching X'", code: "raw = index.search(q, k=k*4)\nfiltered = [r for r in raw if r.meta['category']==target][:k]" },
        { term: "When you've outgrown FAISS alone", desc: "Metadata filtering + multi-tenancy + network API needed", code: "// -> Pinecone / Milvus / Weaviate / Qdrant" },
      ],
    },
    {
      title: "Persistence & GPU",
      color: "rose",
      rows: [
        { term: "Save / load (the ONLY durability)", desc: "No automatic durability — you manage this explicitly", code: "faiss.write_index(index, 'my_index.faiss')\nindex = faiss.read_index('my_index.faiss')" },
        { term: "GPU acceleration", desc: "Big win for large-scale training AND search", code: "res = faiss.StandardGpuResources()\ngpu_index = faiss.index_cpu_to_gpu(res, 0, index)" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Batch operations", desc: "Add/search many vectors at once, not one at a time", code: "index.add(all_vectors)  # one call for many rows" },
        { term: "No security model of its own", desc: "Access control is entirely the embedding app's job", code: "// Protect the index file like any sensitive file (OS permissions)" },
        { term: "Decision framework", desc: "Match index type to scale + recall + memory needs", code: "// <100K: Flat | 100K-10M: HNSW/IVF | 10M+: IVFPQ" },
        { term: "It's used inside real databases", desc: "e.g., Milvus uses FAISS as an internal index option", code: "// Choosing Milvus doesn't mean abandoning FAISS's algorithms" },
      ],
    },
  ],
};

export default faiss;
