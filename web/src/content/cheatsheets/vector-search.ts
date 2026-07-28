import type { CheatSheetData } from "./types";

const vectorSearch: CheatSheetData = {
  title: "The Ultimate Vector Search Cheat Sheet",
  subtitle: "Nearest-neighbor search · ANN algorithms · tradeoffs · hybrid search · production toolbelt",
  sections: [
    {
      title: "The Core Problem",
      color: "violet",
      rows: [
        { term: "Nearest-neighbor query", desc: "Given a query vector, find the k most similar stored vectors", code: "top_k = search(query_vector, k=10)" },
        { term: "Brute-force search", desc: "Compare query to every vector — exact but O(n*d) per query", code: "dists = np.linalg.norm(vectors - query, axis=1)\ntop_k = np.argsort(dists)[:k]" },
        { term: "Why it doesn't scale", desc: "100M vectors x 1536 dims = ~150B ops per single query", code: "cost_per_query ~= n * d\n# unaffordable at real QPS and corpus size" },
        { term: "Cosine similarity", desc: "Angle between vectors; ignores magnitude; common for text embeddings", code: "cos = dot(a, b) / (norm(a) * norm(b))" },
        { term: "Euclidean (L2) distance", desc: "Straight-line distance; common for images", code: "dist = norm(a - b)" },
        { term: "Dot product", desc: "Fast; equals cosine sim if vectors are unit-normalized", code: "score = dot(a, b)\n# normalize both a, b to length 1 first" },
        { term: "ANN (Approximate NN)", desc: "Trade a little recall for massive speed/memory gains", code: "# brute force: 100% recall, O(n*d)\n# ANN:         ~90-99.9% recall, sub-linear" },
      ],
    },
    {
      title: "ANN Algorithm Families",
      color: "blue",
      rows: [
        { term: "KD-tree", desc: "Recursive space partitioning; exact; degrades in high dimensions", code: "split on axis = depth % d\nleft = points < median\nright = points >= median" },
        { term: "Curse of dimensionality", desc: "Above ~20 dims, distances concentrate; pruning stops helping", code: "# KD-tree degenerates toward\n# visiting almost every node" },
        { term: "LSH", desc: "Hash so similar vectors collide more often than dissimilar ones", code: "bit = sign(dot(random_plane, vector))\nbucket = ''.join(bits)  # similar vecs share buckets" },
        { term: "IVF (Inverted File Index)", desc: "Cluster once (k-means); at query time scan only nearby clusters", code: "centroids = kmeans(vectors, nlist)\nprobe = nearest(centroids, query, nprobe)\ncandidates = vectors_in(probe)" },
        { term: "IVF worked example", desc: "10M vectors, 1000 clusters, nprobe=10 -> ~100k scanned (100x fewer)", code: "avg_cluster_size = 10_000_000 / 1000\nscanned = nprobe * avg_cluster_size  # ~100k" },
        { term: "HNSW", desc: "Multi-layer graph; dominant production ANN; greedy walk top to bottom", code: "start at sparse top layer\ngreedy-walk to closest neighbor\ndrop a layer, repeat until layer 0" },
        { term: "HNSW ef_search", desc: "Query-time candidate list size — the key recall/latency knob", code: "index.hnsw.efSearch = 128  # higher = better recall, slower" },
        { term: "HNSW M", desc: "Edges per node per layer — recall vs memory knob", code: "index = faiss.IndexHNSWFlat(dim, M=32)" },
        { term: "Product Quantization (PQ)", desc: "Split vector into sub-vectors, replace each with a codebook id", code: "codes[i] = kmeans(sub_vector_i, 256).labels_\n# 1536 floats (6144 bytes) -> 8 bytes" },
        { term: "IVF-PQ", desc: "Combine clustering (routing) with quantization (compact storage)", code: "coarse: cluster routing (IVF)\nfine:   compressed codes (PQ)" },
      ],
    },
    {
      title: "Evaluation & Tradeoffs",
      color: "emerald",
      rows: [
        { term: "recall@k", desc: "Fraction of true top-k (exact search) an ANN method actually returns", code: "recall = |ann_top_k & exact_top_k| / k" },
        { term: "Benchmark ANN vs exact", desc: "Always measure before trusting a config", code: "exact = brute_force_knn(q, vectors, k)\napprox = ann_index.search(q, k)\nrecall = len(set(exact) & set(approx)) / k" },
        { term: "The tradeoff triangle", desc: "Recall <-> Latency <-> Memory — can't max all three", code: "ef_search up  -> recall up, latency up\nM up          -> recall up, memory up\nPQ compress up -> memory down, recall down" },
        { term: "nprobe (IVF)", desc: "More clusters searched = more recall, more latency", code: "index.nprobe = 10  # sweep and measure" },
        { term: "Sweep, don't guess", desc: "Plot recall vs latency across a parameter range", code: "for ef in [16, 32, 64, 128, 256]:\n    measure(recall(ef), latency(ef))" },
        { term: "Dimensionality reduction", desc: "Fewer dims = less memory + faster comparisons", code: "# Matryoshka-style embeddings:\n# use first 256 of 1536 dims for speed" },
      ],
    },
    {
      title: "Hybrid Search & Filtering",
      color: "amber",
      rows: [
        { term: "Why pure vector search fails", desc: "Embeddings capture meaning, not exact tokens (SKUs, IDs, names)", code: "# query 'iPhone 15 Pro Max 256GB' may miss\n# the exact model via pure similarity" },
        { term: "Hybrid search", desc: "Combine vector similarity with BM25/keyword score", code: "vector_results = ann_index.search(q, k)\nbm25_results = bm25_index.search(q, k)" },
        { term: "Reciprocal Rank Fusion", desc: "Fuse ranked lists without normalizing incompatible scores", code: "score[doc] += 1 / (k_rrf + rank + 1)\n# sum across each ranked list, sort desc" },
        { term: "Pre-filtering", desc: "Filter metadata first, then search within the subset", code: "subset = [v for v in vectors if v.price < 50]\nsearch(query, subset)" },
        { term: "Post-filtering", desc: "Search first, then discard non-matching — fails if filter is narrow", code: "top_k = search(query, k=200)\nresult = [r for r in top_k if r.price < 50][:10]" },
        { term: "Filter selectivity rule", desc: "Narrow filter (<5%) needs pre-filter or filtered-ANN, not post-filter", code: "if filter_match_rate < 0.05:\n    use_prefilter_or_filtered_ann()" },
        { term: "Filtered ANN", desc: "Index-aware filtering during graph walk / cluster scan itself", code: "# Qdrant/Weaviate: native filter support\n# skips non-matching nodes mid-traversal" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "rose",
      rows: [
        { term: "Embedding model mismatch", desc: "Query and corpus embedded with different models = meaningless scores", code: "assert query_model_version == corpus_model_version" },
        { term: "Wrong distance metric", desc: "Using L2 on cosine-trained embeddings silently degrades results", code: "# check what the embedding model\n# was trained/evaluated with" },
        { term: "Un-normalized dot product", desc: "Dot product != cosine similarity unless vectors are unit length", code: "v = v / np.linalg.norm(v)  # normalize first" },
        { term: "Post-filter with small k", desc: "Narrow filter discards most of top-k, returns too few results", code: "# WRONG: search(query, k=10) then filter\n# RIGHT: search(query, k=200) then filter" },
        { term: "Brute force 'just works' trap", desc: "Fine at small scale, silently becomes the bottleneck as data grows", code: "# define a migration trigger:\n# e.g. n > 500_000 or p99 > SLO" },
        { term: "Never rebuilding the index", desc: "Corpus drift + model upgrades silently degrade recall over time", code: "schedule(nightly_or_triggered_rebuild)" },
        { term: "Metadata filter as security boundary", desc: "App-only filters can leak data across tenants in multi-tenant systems", code: "# enforce tenant_id filter at query layer,\n# not only in application code" },
        { term: "Rebuild-in-place on live traffic", desc: "Blocks/slows queries during rebuild", code: "# blue-green: build new index elsewhere,\n# validate recall, then swap atomically" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "FAISS quickstart", desc: "Reference ANN library (Meta), composable index types", code: "index = faiss.IndexHNSWFlat(dim, 32)\nindex.hnsw.efSearch = 128\nindex.add(vectors)\nindex.search(query, k=10)" },
        { term: "Sharding: scatter-gather", desc: "Query all shards in parallel, merge local top-k", code: "results = [shard.search(q, k) for shard in shards]\nmerged = merge_top_k(results, k)" },
        { term: "Replication", desc: "Scale read throughput when index fits on one machine", code: "# replicate full index across read replicas\n# behind a load balancer" },
        { term: "Index versioning", desc: "Track embedding model + params alongside the index snapshot", code: "index_meta = {'model': 'v3', 'metric': 'cosine',\n              'M': 32, 'ef_construction': 200}" },
        { term: "Warm-start readiness", desc: "Don't route traffic until a multi-GB index finishes loading", code: "/healthz  # process up\n/readyz   # index loaded and ready" },
        { term: "Recall monitoring job", desc: "Continuous, not just launch-time", code: "recall = recall_at_k(ann_idx, exact_idx, sample)\nif recall < SLO: alert()" },
        { term: "Latency metrics", desc: "Track p50/p95/p99 per index/collection", code: "SEARCH_LATENCY.labels(index='products').time()" },
        { term: "Query parameter caps", desc: "Prevent DoS via huge k / ef_search / nprobe", code: "k = min(requested_k, MAX_K)\nef_search = min(requested_ef, MAX_EF)" },
        { term: "Vector databases", desc: "Purpose-built systems implementing these algorithms", code: "FAISS · Pinecone · Milvus\nWeaviate · Qdrant · Chroma" },
      ],
    },
  ],
};

export default vectorSearch;
