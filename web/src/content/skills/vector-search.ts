import type { SkillContent } from "../types";

/**
 * Vector Search — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const vectorSearch: SkillContent = {
  overview: `
Vector search (also called nearest-neighbor search or similarity search) is the discipline of finding, among millions or billions of high-dimensional vectors, the small handful that are most similar to a given query vector. It is the retrieval engine underneath every modern semantic system: type a question into a RAG chatbot, search "shoes like this photo" in an e-commerce app, or ask a recommendation system for "more like this song," and underneath, a vector search index is doing the actual work of finding nearest neighbors in embedding space.

For an AI engineer, vector search is the load-bearing layer between the **Embeddings** skill (which turns text, images, audio, or user behavior into fixed-length numeric vectors that capture meaning) and every application that needs to retrieve by meaning rather than by keyword. Embeddings alone are inert — a database of a billion 1536-dimensional floats. Vector search is what makes them queryable at interactive latency. This is why the **RAG** skill, every **Vector Database** (FAISS, Pinecone, Milvus, Weaviate, Qdrant, Chroma), and every recommendation engine at scale all reduce to the same underlying question: given a query vector, which k stored vectors are closest, and how do we answer that in milliseconds instead of minutes?

Key characteristics: vector search is fundamentally a **geometric** problem (distance or similarity in a high-dimensional space — cosine similarity, dot product, or Euclidean/L2 distance), it trades **exactness for speed** at scale via Approximate Nearest Neighbor (ANN) algorithms, and it sits at the intersection of classical algorithms (trees, hashing, graphs), information retrieval (hybrid search, filtering), and systems engineering (memory layout, sharding, index rebuilds). Mastering it means understanding not just "call a library function" but why brute force fails, which algorithm family fits which workload, and how the recall/latency/memory tradeoff triangle governs every real production configuration.
`,

  history: `
Nearest-neighbor search is an old computer science problem — going back to computational geometry in the 1970s — but **vector search** as an AI-engineering discipline is much newer, driven by the rise of learned embeddings.

| Year | Milestone |
|------|-----------|
| 1975 | Jon Bentley publishes the **KD-tree**, an elegant exact nearest-neighbor structure for low-dimensional space |
| 1998 | **Locality-Sensitive Hashing (LSH)** introduced (Indyk & Motwani) — the first practical sub-linear ANN method for high dimensions |
| 2010 | **Product Quantization** (Jegou, Douze, Schmid) — compress vectors into compact codes for memory-efficient large-scale search |
| 2011 | **FAISS** development begins at Facebook AI Research, later open-sourced (2017) — becomes the reference ANN library |
| 2016 | **HNSW** (Hierarchical Navigable Small World graphs) published by Malkov & Yashunin — graph-based ANN that becomes the dominant approach |
| 2018–2019 | BERT-era sentence embeddings (Sentence-BERT) make semantic embeddings mainstream, creating real demand for production vector search |
| 2019–2021 | Purpose-built **vector databases** emerge: Milvus (2019), Weaviate, Pinecone (2019, managed service), Qdrant (2021) — treating ANN indexes as a first-class database primitive with persistence, filtering, and APIs |
| 2022–2023 | The LLM/RAG boom turns vector search into mainstream AI-engineering infrastructure; Chroma and pgvector lower the barrier to entry |
| 2023–2025 | Hybrid search (vector + BM25), metadata filtering, and quantization become standard features across all major vector databases; disk-based ANN (DiskANN-style) targets billion-scale indexes on commodity hardware |

The throughline: each milestone solved the previous era's scaling wall. KD-trees solved exact search but degraded in high dimensions; LSH and IVF solved approximate search at scale but needed careful tuning; HNSW delivered the best recall/latency tradeoff and became the default; quantization solved the memory wall as embedding counts exploded into the billions.
`,

  "why-it-exists": `
Vector search exists because of a gap opened by embeddings themselves: once you can turn any piece of content into a vector that captures meaning, you immediately need a way to ask "what's similar to this?" — and the naive answer does not scale.

The world before vector search relied on **exact-match and keyword retrieval**: inverted indexes, SQL WHERE clauses, and full-text search engines (Lucene/Elasticsearch's BM25). These systems are extremely fast and precise for literal term matching, but they have no notion of meaning — a search for "affordable laptop" will not match a document that says "budget notebook" unless the exact words overlap. Embeddings solve the meaning problem by mapping semantically similar things to nearby points in vector space. But that creates a new problem: **how do you efficiently find "nearby points" among millions of them?** Computing distance to every single vector (brute force) is easy to implement but computationally hopeless at scale — this is the specific gap vector search fills.

Three forces converged to make this urgent: (1) embedding models (word2vec → BERT → modern LLM embedding APIs) became cheap and high-quality enough to embed entire corpora, (2) LLM applications needed a way to inject relevant context beyond a model's fixed context window (retrieval-augmented generation), and (3) recommendation and search systems across the industry shifted from hand-tuned keyword ranking to learned representations. Vector search is the systems answer to a question embeddings created: given a geometry of meaning, how do we query it in real time.
`,

  "problem-it-solves": `
Vector search removes the core scaling obstacle between "we have embeddings" and "we have a usable product."

Concretely, it solves:

- **The brute-force wall.** Comparing a query vector against every stored vector (linear scan) costs O(n·d) per query — for n = 100 million vectors of dimension d = 1536, that is roughly 150 billion floating-point operations per single query. At any real query-per-second load this is computationally and financially impossible. ANN algorithms reduce this to sub-linear (often near O(log n) or O(1)-ish with tuning) expected cost per query.
- **The memory wall.** Storing billions of raw float32 vectors can require terabytes of RAM. Product quantization and other compression techniques shrink this by 4–32x while preserving most of the useful similarity signal.
- **The "search by meaning" gap** that keyword search cannot close — synonyms, paraphrases, cross-lingual matches, and multi-modal similarity (text-to-image, image-to-image).
- **The dynamic-corpus problem.** Real systems have constantly changing data (new documents, updated products); vector search systems provide insert/delete/update semantics on top of the index, not just static bulk-build tools.

What vector search deliberately does **not** solve:

- **Exact-match precision** for things like product SKUs, legal citations, or exact phrase queries — this is why hybrid search (combining vector similarity with keyword/BM25 matching) exists and is often mandatory, not optional.
- **Ranking quality beyond geometric similarity** — an ANN index tells you what's nearby in embedding space, not what's "best" for a business objective; re-ranking, business rules, and relevance feedback are layered on top.
- **Understanding or reasoning about the content** — that is the embedding model's and (downstream) the LLM's job. Vector search only operates on the numeric representation it's given; garbage embeddings produce garbage retrieval no matter how good the index is.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain why brute-force exact nearest-neighbor search does not scale, with the actual cost math (O(n·d) per query).
2. Define recall@k and use it to evaluate an ANN index against ground-truth exact search.
3. Explain the intuition behind KD-trees and why they degrade to brute force in high dimensions (the curse of dimensionality).
4. Explain LSH's hashing-collision intuition and when it's still a reasonable choice.
5. Describe IVF (Inverted File Index) clustering and walk through a worked example of an IVF query.
6. Describe HNSW's layered-graph navigation and explain why it dominates production vector databases today.
7. Explain product quantization and how vector compression trades a little recall for a large memory reduction.
8. Reason explicitly about the recall/latency/memory tradeoff triangle when configuring any ANN index.
9. Design a hybrid search system that combines vector similarity with BM25/keyword scoring, and justify why pure vector search often underperforms alone.
10. Implement metadata filtering with vector search and explain the pre-filtering vs post-filtering tradeoff.
11. Discuss index build/update strategies for a constantly changing corpus, and sharding strategies at billion-scale.
`,

  prerequisites: `
- **Required**: comfort with the **Embeddings** skill — you must understand what an embedding vector is, how similarity is measured (cosine similarity, dot product, Euclidean distance), and how embedding models are trained, because vector search operates entirely on the output of that process. Basic familiarity with arrays/vectors and Big-O notation.
- **Helpful**: the **Machine Learning** skill (for intuition about high-dimensional spaces and distance metrics) and basic data structures (trees, hash maps, graphs) since ANN algorithms are literally specialized versions of these.
- **For production sections**: familiarity with at least one concrete vector database (**FAISS**, **Pinecone**, **Milvus**, **Weaviate**, **Qdrant**, or **Chroma**) makes the production-usage and deployment sections land more concretely, though this page teaches the underlying algorithms independent of any one system.

Dependency chain on this platform: **Embeddings** → **Vector Search** (this page) → any of **FAISS / Pinecone / Milvus / Weaviate / Qdrant / Chroma** (the concrete systems that implement these algorithms) → **RAG** (the dominant production application built on top of all of the above).
`,

  "beginner-concepts": `
### What is a nearest-neighbor query?

Given a **query vector** q and a large collection of stored vectors, a nearest-neighbor query asks: which stored vectors are closest to q, according to some distance or similarity measure? "Closest" almost always means one of:

~~~python
import numpy as np

def cosine_similarity(a, b):
    # Measures the angle between vectors — ignores magnitude.
    # Most common metric for text embeddings (e.g. OpenAI, Sentence-BERT).
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10)

def euclidean_distance(a, b):
    # Straight-line distance — smaller is more similar.
    return np.linalg.norm(a - b)

def dot_product(a, b):
    # Fast (no normalization); equivalent to cosine similarity
    # if vectors are pre-normalized to unit length.
    return np.dot(a, b)
~~~

A "k-nearest-neighbors" (k-NN) query returns the top k most similar vectors, e.g. "give me the 5 documents most similar to this question."

### Brute-force search — the starting point

~~~python
import numpy as np

def brute_force_knn(query: np.ndarray, vectors: np.ndarray, k: int = 5):
    """Exact search: compare the query against every stored vector.
    vectors: shape (n, d) — n vectors of dimension d.
    Correct, but O(n * d) per query — the baseline everything else beats."""
    # Compute cosine similarity to every row at once (vectorized, still O(n*d))
    norms = np.linalg.norm(vectors, axis=1) * np.linalg.norm(query)
    sims = vectors @ query / (norms + 1e-10)
    top_k_idx = np.argsort(-sims)[:k]          # sort descending, take top k
    return top_k_idx, sims[top_k_idx]
~~~

For n = 10,000 vectors this runs in milliseconds. For n = 100,000,000 vectors, the same code — mathematically correct, zero bugs — takes seconds to minutes per single query. That single fact (correctness does not imply usability at scale) is the entire reason vector search exists as a field.

### Why brute force doesn't scale

Brute force costs O(n·d) per query: n comparisons, each costing d multiply-adds. Three things make this brutal in real systems:

1. **n is huge.** Production corpora (web pages, product catalogs, chat histories) routinely reach hundreds of millions to billions of vectors.
2. **d is not small.** Modern embedding models produce 384–3072 dimensional vectors; d does not shrink as your data grows.
3. **You pay this cost on every single query**, not once at build time. A recommendation system serving 10,000 queries/second cannot afford even a few milliseconds of brute-force scan per query, multiplied by thousands of concurrent users.

### Approximate Nearest Neighbor (ANN) — the practical answer

The core insight: for almost every real application, you don't need the mathematically exact top-k — you need results that are *good enough*, delivered in milliseconds. ANN algorithms pre-process (index) the vectors once, at build time, into a data structure that lets queries skip the vast majority of comparisons, at the cost of occasionally missing a true nearest neighbor. This trade — a small, measurable, tunable amount of **recall** for orders-of-magnitude **speed** — is the central idea of the entire field, and it recurs in every algorithm covered on this page.

~~~python
# Conceptual difference, not a real API:
# Brute force: for each query, touch all n vectors.        -> O(n*d), 100% recall
# ANN (e.g. HNSW/IVF): for each query, touch a small subset -> O(log n) or O(sqrt(n)),
#                       ~90-99.9% recall depending on tuning
~~~
`,

  "intermediate-concepts": `
### Tree-based methods: KD-trees

A KD-tree recursively partitions space by alternating which dimension it splits on, building a binary tree where each node divides the remaining points into two halves.

~~~python
class KDNode:
    def __init__(self, point, axis, left=None, right=None):
        self.point = point   # the vector stored at this node
        self.axis = axis     # which dimension this node splits on
        self.left = left     # points with axis-value < this node's
        self.right = right   # points with axis-value >= this node's

def build_kdtree(points, depth=0):
    if not points:
        return None
    d = len(points[0])
    axis = depth % d                                  # cycle through dimensions
    points = sorted(points, key=lambda p: p[axis])
    mid = len(points) // 2
    return KDNode(
        point=points[mid],
        axis=axis,
        left=build_kdtree(points[:mid], depth + 1),
        right=build_kdtree(points[mid + 1:], depth + 1),
    )
~~~

Querying prunes: if the query point is far from a splitting plane, the entire other half of the tree can be skipped. This works beautifully for low-dimensional data (2D/3D — the classic use case is geospatial "nearest gas station" queries).

**The curse of dimensionality**: as dimension d grows past roughly 10–20, KD-tree pruning collapses. In high dimensions, almost every point ends up roughly equidistant from the query (distances concentrate), so the "skip the far half" logic rarely fires — the tree degenerates into visiting almost every node, i.e. brute force with extra bookkeeping overhead. Since text/image embeddings are typically 384–3072 dimensions, **KD-trees are not used for modern embedding search** — this is precisely why LSH, IVF, and HNSW were developed as high-dimension-native alternatives.

### Locality-Sensitive Hashing (LSH)

LSH's intuition: design a hash function where **similar vectors are more likely to collide (land in the same bucket) than dissimilar ones** — the opposite goal of a cryptographic hash, which tries to avoid all collisions.

~~~python
import numpy as np

class SimpleLSH:
    """Random hyperplane LSH for cosine similarity.
    Each hyperplane gives one bit: which side of the plane is the vector on?
    Vectors that are close in angle tend to fall on the same side of most planes."""
    def __init__(self, dim: int, num_planes: int = 16, seed: int = 42):
        rng = np.random.default_rng(seed)
        self.planes = rng.normal(size=(num_planes, dim))   # random hyperplanes

    def hash(self, vector: np.ndarray) -> str:
        # Sign of dot product with each plane -> one bit per plane
        bits = (self.planes @ vector > 0).astype(int)
        return "".join(map(str, bits))                     # e.g. "01101..."

lsh = SimpleLSH(dim=128, num_planes=16)
buckets: dict[str, list[int]] = {}
for idx, vec in enumerate(all_vectors):
    buckets.setdefault(lsh.hash(vec), []).append(idx)

# Query: hash the query, only compare against vectors in the same bucket
# (or nearby buckets via multiple hash tables) instead of all n vectors.
candidates = buckets.get(lsh.hash(query_vector), [])
~~~

LSH trades exactness for a probabilistic guarantee: nearby vectors are *likely* (not guaranteed) to share a bucket. Multiple independent hash tables raise recall at the cost of more memory and more candidate comparisons. LSH is simple, easy to shard, and still used where its guarantees fit (e.g. deduplication, some recommendation pipelines), but it has generally been overtaken by IVF and HNSW for embedding search because tuning the number of hash tables/planes to hit a target recall is fiddly and its recall/speed curve is usually worse in practice.

### IVF — Inverted File Index

IVF's intuition: **cluster the vector space once at build time, then only search the clusters closest to the query** instead of the whole dataset.

~~~python
from sklearn.cluster import KMeans
import numpy as np

# --- Build time ---
n_clusters = 100                                    # "nlist" in FAISS terminology
kmeans = KMeans(n_clusters=n_clusters, n_init=4).fit(all_vectors)
cluster_of = kmeans.labels_                          # which cluster each vector belongs to
centroids = kmeans.cluster_centers_

inverted_lists: dict[int, list[int]] = {}
for idx, cluster_id in enumerate(cluster_of):
    inverted_lists.setdefault(cluster_id, []).append(idx)

# --- Query time ---
def ivf_search(query: np.ndarray, nprobe: int = 8, k: int = 5):
    # 1. Find the nprobe closest cluster centroids to the query (cheap: only
    #    n_clusters comparisons, e.g. 100, not n).
    dists_to_centroids = np.linalg.norm(centroids - query, axis=1)
    nearest_clusters = np.argsort(dists_to_centroids)[:nprobe]
    # 2. Brute-force search ONLY within those clusters' vectors.
    candidates = [i for c in nearest_clusters for i in inverted_lists[c]]
    cand_vectors = all_vectors[candidates]
    dists = np.linalg.norm(cand_vectors - query, axis=1)
    top_k = np.argsort(dists)[:k]
    return [candidates[i] for i in top_k]
~~~

**Worked example**: with 10 million vectors split into 1,000 clusters (~10,000 vectors/cluster on average), searching nprobe = 10 clusters means comparing against roughly 100,000 vectors instead of 10 million — a 100x reduction — plus the cheap cost of finding the nearest clusters. Increasing nprobe raises recall (you check more of the space) at the cost of latency; this is the IVF-specific instance of the recall/latency tradeoff. A known failure mode: a true nearest neighbor sitting right on a cluster boundary can be missed if its cluster isn't among the nprobe searched — this is why IVF is often combined with quantization (IVF-PQ) rather than used alone at the largest scales.

### HNSW — Hierarchical Navigable Small World graphs

HNSW's intuition: build a **multi-layer graph** where each vector is a node, edges connect "nearby" vectors, and the top layers are sparse long-range highways while the bottom layer is dense and local — like a road network with highways for approximate direction and local streets for precision.

~~~python
# Conceptual query walk-through (not a full implementation):
# 1. Start at the single entry point in the TOP (sparsest) layer.
# 2. Greedily walk to whichever neighbor is closest to the query, repeat,
#    until no neighbor improves — this quickly gets you to roughly the
#    right neighborhood using very few hops (long "highway" edges).
# 3. Drop down one layer, using the current best node as the new entry point.
# 4. Repeat the greedy walk at this denser layer — refining the answer.
# 5. Continue down through all layers until reaching layer 0 (all vectors),
#    where a final greedy search with a candidate list ("ef_search") produces
#    the top-k answer.
~~~

Full detail and diagram of this layered walk are in Internal Working below. HNSW is the current dominant approach in most production vector databases (FAISS, Pinecone, Milvus, Weaviate, Qdrant all ship HNSW as a default or primary index type) because it delivers the best empirically observed recall-per-millisecond among mainstream ANN algorithms, at the cost of higher memory usage (the graph edges themselves take space) and somewhat expensive build/insert time compared to IVF.

### Vector compression: Product Quantization (PQ)

PQ's intuition: instead of storing a full-precision vector, split it into sub-vectors, and represent each sub-vector by the ID of its nearest "codeword" from a small learned codebook — trading a controlled amount of precision for a large memory reduction.

~~~python
import numpy as np

def product_quantize(vectors: np.ndarray, num_subvectors: int = 8, bits: int = 8):
    """Split each vector into num_subvectors chunks; for each chunk position,
    run k-means with 2**bits centroids ("codewords"). Store each vector as
    num_subvectors small integer codes instead of full floats."""
    n, d = vectors.shape
    sub_d = d // num_subvectors
    codebooks = []      # one small codebook per sub-vector position
    codes = np.zeros((n, num_subvectors), dtype=np.uint8)
    for i in range(num_subvectors):
        chunk = vectors[:, i * sub_d:(i + 1) * sub_d]
        km = KMeans(n_clusters=2 ** bits, n_init=2).fit(chunk)
        codebooks.append(km.cluster_centers_)
        codes[:, i] = km.labels_
    return codes, codebooks   # 'codes' replaces the original float vectors in memory
~~~

With 8 sub-vectors and 8-bit codes, a 1536-dimensional float32 vector (6,144 bytes) compresses to just 8 bytes — a roughly 768x reduction — at the cost of approximate (quantized) distance computations. In practice PQ is tuned less aggressively (e.g. 4–16x compression) to keep recall acceptable, and is typically layered on top of IVF (IVF-PQ) or HNSW so the coarse routing stays exact-ish while the bulk storage stays compressed.
`,

  "advanced-concepts": `
### The recall / latency / memory tradeoff triangle

Every ANN index configuration decision is really a point chosen inside a triangle whose three corners are:

- **Recall** — the fraction of true top-k neighbors your ANN search actually returns (see Testing/Evaluation below for recall@k).
- **Latency** — time per query (and, at scale, throughput/QPS the system can sustain).
- **Memory** — RAM (or disk) footprint of the index, which also affects cost and how much of the index fits in fast memory versus disk.

You cannot maximize all three simultaneously — every knob on every ANN algorithm moves you along this triangle:

| Knob | Turning it up... | ...costs |
|------|-------------------|----------|
| HNSW ef_search (candidate list size at query time) | higher recall | higher latency |
| HNSW M (edges per node) | higher recall, faster convergence | more memory (more edges to store) |
| IVF nprobe (clusters searched) | higher recall | higher latency |
| IVF nlist (number of clusters) | fewer vectors per cluster scanned (lower latency) at fixed nprobe | more clusters to route among; too many hurts recall if nprobe is fixed |
| PQ compression level | less memory | lower recall (coarser quantized distances) |
| Exact brute force | 100% recall by definition | worst latency and (uncompressed) memory at scale |

The senior-engineer skill here is not "find the best index type" — it is to know your product's actual requirements (a chat assistant tolerates ~95% recall at 50ms; a fraud-detection dedup pipeline may need near-100% recall and can tolerate seconds) and configure the triangle deliberately, then re-measure recall@k against ground truth whenever you change embedding models, corpus size, or index parameters.

### Hybrid search: vector + keyword

Pure vector similarity search systematically underperforms on **exact-match-sensitive queries**: product SKUs, part numbers, acronyms, names, and rare terms that an embedding model may not represent distinctly (embeddings are trained to capture general semantic similarity, not to preserve exact tokens). A query for "iPhone 15 Pro Max 256GB" may retrieve semantically-similar-but-wrong phones because the embedding space doesn't sharply separate model numbers.

**Hybrid search** combines a vector similarity score with a traditional lexical score (typically BM25, the statistical scoring function behind most inverted-index search engines) and fuses the two rankings:

~~~python
def reciprocal_rank_fusion(vector_ranked_ids: list, bm25_ranked_ids: list, k: int = 60):
    """RRF: a simple, robust way to combine two ranked lists without needing
    to normalize incomparable raw scores (cosine similarity vs BM25 score)."""
    scores: dict[str, float] = {}
    for rank, doc_id in enumerate(vector_ranked_ids):
        scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
    for rank, doc_id in enumerate(bm25_ranked_ids):
        scores[doc_id] = scores.get(doc_id, 0) + 1.0 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)
~~~

Reciprocal Rank Fusion (RRF) is popular precisely because it sidesteps the hard problem of normalizing two incompatible score scales. Most production vector databases (Weaviate, Qdrant, Milvus) and Elasticsearch/OpenSearch now ship native hybrid search support combining a vector index with a BM25/inverted index in one query API. The senior lesson: treat vector search as one signal in a ranking pipeline, not the whole pipeline.

### Filtering: pre-filtering vs post-filtering

Real queries are rarely pure similarity — "find similar products **under $50** and **in stock**" combines vector similarity with metadata predicates. There are two fundamentally different strategies:

- **Post-filtering**: run the ANN search first (get top-k by similarity), then discard results that fail the metadata filter. Simple to implement, but if the filter is highly selective (e.g. only 1% of products are under $50), most of the top-k results get thrown away and you may return far fewer than k results, or none.
- **Pre-filtering**: apply the metadata filter first to shrink the candidate set, then run similarity search only within that subset. Guarantees the filter is respected, but naively this can force a brute-force scan over the filtered subset if the ANN index's internal structure (graph edges, cluster assignments) doesn't align with the filter, defeating the whole point of indexing.

Production systems solve this with **filtered ANN**: HNSW variants that can skip non-matching nodes mid-graph-walk while still using the graph's edges (rather than falling back to full brute force), and IVF variants that maintain filtered/partitioned inverted lists. The practical decision table:

| Filter selectivity | Best approach |
|---|---|
| Filter matches most of the corpus (>20%) | Post-filtering is usually fine — cheap, simple |
| Filter matches a small slice (<1–5%) | Pre-filtering or index-aware filtered search is required, or you'll get too few/irrelevant results |
| Filter changes per query unpredictably | Favor a vector database with native filtered-ANN support (Qdrant and Weaviate are known for strong filtering support) rather than hand-rolling it |

### Index build time and updating a changing corpus

HNSW graph construction and IVF clustering are both build-time costs that do not happen for free — inserting a single new vector into a mature HNSW graph requires finding its correct neighbors at each layer (an operation similar in cost to a query), and IVF cluster assignments can drift stale as new data arrives whose distribution differs from the original k-means centroids. Production strategies:

- **Incremental insert** — most modern indexes (HNSW-based ones especially) support online insert/delete without a full rebuild, at some cost to graph quality over time ("graph degradation" from many insertions without occasional rebalancing).
- **Periodic full rebuild** — recompute the index from scratch on a schedule (nightly, weekly) to restore optimal cluster/graph structure, common when the corpus's embedding distribution shifts meaningfully (e.g. after an embedding model upgrade — which requires a full re-embed and re-index regardless).
- **Dual-index / blue-green** — build a new index in the background from the current data snapshot, then atomically swap traffic to it, avoiding query-time impact from rebuild work.
- **Soft delete + compaction** — mark deleted vectors as tombstoned and filter them at query time, periodically compacting to reclaim space, rather than paying rebuild cost on every delete.

### Sharding a vector index across machines

At billion-vector scale, no single machine holds the whole index in memory. Two sharding strategies dominate:

- **Horizontal (data) sharding**: partition vectors across N shards (by hash, by cluster assignment, or round-robin), query all shards in parallel (scatter-gather), and merge the top-k results from each shard's local top-k. Simple and scales linearly in throughput, but every query touches every shard.
- **Routing-aware sharding**: use a coarse index (e.g. IVF's cluster centroids) to route each query to only the shards likely to hold relevant vectors, reducing fan-out at the cost of occasionally missing a neighbor that landed in an unexpected shard due to skew.

Most managed vector databases (Pinecone, Milvus in distributed mode) implement scatter-gather sharding by default because its recall behavior is predictable and it parallelizes cleanly; routing-aware approaches are reserved for extreme scale where scatter-gather's fan-out cost itself becomes the bottleneck.
`,

  "internal-working": `
The clearest way to understand vector search internals is to trace exactly what HNSW does at query time, since it is the dominant production algorithm.

~~~mermaid
flowchart TB
    subgraph L2["Layer 2 (sparsest — long-range 'highway' edges)"]
        E["Entry point"]
    end
    subgraph L1["Layer 1 (medium density)"]
        A1["node A"]
        B1["node B"]
    end
    subgraph L0["Layer 0 (all vectors — dense, local edges)"]
        A0["node A"]
        B0["node B"]
        C0["node C"]
        D0["node D (true nearest neighbor)"]
    end
    Q(["Query vector arrives"]) --> E
    E -->|"greedy walk: jump to closer neighbor"| A1
    A1 -->|"drop down a layer, keep searching"| A0
    A0 -->|"greedy walk among dense local edges"| C0
    C0 --> D0
    D0 --> R(["Return top-k after ef_search candidates explored"])
~~~

Step by step:

1. **Layer assignment at insert time**: each vector is randomly assigned a maximum layer it will appear in, with an exponentially decaying probability — most vectors only exist at layer 0, a few also exist at layer 1, very few reach the top layers. This mirrors a skip-list: sparse shortcuts on top, dense detail at the bottom.
2. **Query starts at a single fixed entry point** in the topmost layer (there are very few nodes here, so this is cheap).
3. **Greedy graph walk**: at each layer, the algorithm repeatedly moves to whichever connected neighbor is closest to the query vector, until no neighbor improves on the current best — this converges quickly because top-layer edges span large distances in vector space (analogous to taking a highway before exiting onto local streets).
4. **Descend one layer** using the current best node found as the new entry point, and repeat the greedy walk at the next, denser layer.
5. **At layer 0** (which contains every vector), the walk uses a candidate list of size **ef_search** — a beam-search-like exploration that keeps the ef_search best candidates seen so far rather than committing to a single greedy path, which recovers much of the recall a purely greedy walk would lose to local optima.
6. **Return the top-k** vectors from the final candidate list.

This is why HNSW is fast: total edges traversed is roughly logarithmic in the size of the dataset rather than linear, because each layer prunes the search space by roughly the same navigability property that makes real-world "six degrees of separation" social networks small-world — a small number of long-range hops gets you into the right neighborhood, and then local edges refine the answer.

Compare this to IVF, whose internal working is simpler: cluster once (k-means), then at query time compute distance to all cluster centroids (cheap, since there are far fewer centroids than vectors), pick the nprobe nearest clusters, and brute-force scan only the vectors inside those clusters. IVF's internal cost is dominated by the size of the scanned clusters, which is why nlist and nprobe are the two parameters that matter most for its recall/latency tradeoff.
`,

  architecture: `
A senior engineer thinks about vector search at two levels: the **index-internal architecture** (how one ANN index is laid out in memory/disk) and the **application architecture** (how a vector search system fits into a larger AI application).

### Index-internal architecture (HNSW + IVF-PQ, the two most common production shapes)

~~~mermaid
flowchart TB
    subgraph HNSWIndex["HNSW index"]
        Layers["Multi-layer graph\n(adjacency lists per node per layer)"]
        VecStore["Raw or quantized vector storage"]
        EntryPt["Entry point pointer"]
    end
    subgraph IVFPQIndex["IVF-PQ index"]
        Centroids["Cluster centroids (nlist)"]
        InvLists["Inverted lists: cluster_id -> vector ids"]
        PQCodes["PQ codes (compressed sub-vector ids)"]
        Codebooks["Per-subvector codebooks"]
    end
    Query(["Query vector"]) --> HNSWIndex
    Query --> IVFPQIndex
    HNSWIndex --> TopK1["candidate top-k"]
    IVFPQIndex --> TopK2["candidate top-k"]
~~~

Key facts: HNSW's memory cost is dominated by graph edges (each node stores M neighbor pointers per layer it appears in) plus the vectors themselves (or their quantized form if combined with PQ). IVF-PQ's memory cost is dominated by the tiny PQ codes (a few bytes per vector) plus the inverted lists (vector-id lists per cluster) and codebooks (small, shared across all vectors).

### Application architecture (production RAG-style system)

~~~
retrieval-service/
├── ingestion/
│   ├── chunker.py           # splits documents into embeddable units
│   ├── embedder.py          # calls the Embeddings model, batches requests
│   └── indexer.py           # writes vectors + metadata into the vector database
├── api/
│   ├── search.py            # accepts a query, embeds it, calls the vector DB
│   ├── hybrid.py            # fuses vector + BM25 results (RRF or learned re-ranker)
│   └── filters.py           # translates business filters into DB-native filter syntax
├── index_config/
│   └── hnsw_params.yaml     # ef_construction, M, ef_search, per-environment tuning
└── ops/
    ├── rebuild_job.py        # scheduled full re-index / blue-green swap
    └── recall_eval.py        # nightly recall@k check against a ground-truth sample
~~~

Rules that mature teams follow: the embedding model version is pinned and tracked alongside the index (mixing embeddings from two model versions in one index silently corrupts similarity), index configuration (ef_search, nprobe, filters) lives in versioned config rather than hardcoded, and a recall evaluation job runs continuously in the background rather than being a one-time launch check — corpus drift and embedding model changes both silently degrade recall over time if unmonitored.
`,

  "data-flow": `
Tracing one query vector through an ANN index end to end, from user input to final top-k results:

~~~mermaid
sequenceDiagram
    participant U as User
    participant App as Application
    participant Emb as Embedding model
    participant Idx as ANN index (e.g. HNSW)
    participant Filt as Metadata filter
    participant Rank as Re-ranker / hybrid fusion

    U->>App: "find laptops similar to this one, under $1000"
    App->>Emb: encode(query text)
    Emb-->>App: query vector (e.g. 1536 floats)
    App->>Idx: search(query vector, k=50, ef_search=128)
    Idx->>Idx: greedy graph walk across layers (see Internal Working)
    Idx-->>App: candidate top-50 by vector similarity
    App->>Filt: apply metadata filter (price < 1000)
    Filt-->>App: filtered candidates (pre- or post-filter, per config)
    App->>Rank: fuse with BM25 keyword score (hybrid search)
    Rank-->>App: final ranked top-k
    App-->>U: top-k results
~~~

The most misunderstood part of this flow is that **the embedding step and the index search step must use the exact same embedding model and version** — a query embedded with a different model (or even a different version of the same model) than the corpus was indexed with produces a vector living in a geometrically different space, and similarity scores become meaningless even though no error is thrown. This silent-failure mode is one of the most common production bugs in vector search systems: everything "works" (queries return results, no exceptions) but relevance quietly degrades because someone upgraded the embedding model for new documents without re-embedding the old ones.

For a RAG system specifically, this data flow feeds directly into the **RAG** skill's pipeline: the top-k chunks retrieved here become the context stuffed into an LLM prompt, so vector search's recall directly bounds the ceiling of RAG answer quality — no amount of good prompting recovers a fact that retrieval never surfaced.
`,

  "production-usage": `
### Choosing and configuring an index in practice

Real teams rarely implement HNSW or IVF from scratch — they configure one of the established vector databases (see the **FAISS**, **Pinecone**, **Milvus**, **Weaviate**, **Qdrant**, and **Chroma** skills for system-specific depth). A representative FAISS configuration:

~~~python
import faiss
import numpy as np

dimension = 1536
# HNSW index: M = edges per node per layer, higher = better recall, more memory
index = faiss.IndexHNSWFlat(dimension, 32)          # M = 32 is a common default
index.hnsw.efConstruction = 200                      # build-time search breadth
index.hnsw.efSearch = 128                            # query-time search breadth

vectors = np.random.rand(1_000_000, dimension).astype("float32")
index.add(vectors)                                   # build time: O(n log n)-ish

query = np.random.rand(1, dimension).astype("float32")
distances, indices = index.search(query, k=10)       # query time: fast, approximate
~~~

### Common production defaults

- **Metric choice**: cosine similarity (or normalized dot product, which is mathematically equivalent and faster) for text embeddings; L2/Euclidean is common for image embeddings and some clustering-derived vectors — always match the metric to what the embedding model was trained/evaluated with.
- **ef_search / nprobe tuning**: start conservative (favor recall), measure recall@k against a held-out exact-search sample, then reduce until latency SLOs are met — never guess a value without measuring.
- **Batch inserts** where possible; index build/insert throughput is usually far lower than raw vector-generation throughput, so ingestion pipelines batch and queue writes rather than inserting one-by-one.
- **Separate read replicas from the write/index path** in high-QPS systems, since concurrent heavy writes (especially full rebuilds) can degrade query latency if sharing the same index instance.

### Operational defaults that matter

Project layout typically separates ingestion (chunk → embed → upsert) from serving (embed query → search → filter → rank), with the embedding model version and index configuration both tracked as versioned artifacts, not implicit environment state. Nightly or continuous recall@k evaluation against a fixed ground-truth sample is treated as a first-class production metric, the same way error rate or latency would be.
`,

  "industry-examples": `
- **Pinterest**: uses large-scale ANN search (their own systems built on ideas from FAISS-style indexing) for visual and "Related Pins" recommendations, matching billions of image embeddings in real time to power the core discovery experience.
- **Spotify**: uses approximate nearest-neighbor search (they open-sourced **Annoy**, a tree-based ANN library, before HNSW became dominant industry-wide) for music recommendation — finding songs/playlists near a user's taste vector.
- **Meta (Facebook AI Research)**: created and maintains **FAISS**, the most widely used open-source ANN library, originally built to power billion-scale similarity search across Facebook's own products (photo search, content recommendation, ad matching).
- **OpenAI / Anthropic-ecosystem RAG products**: embedding APIs (text-embedding models) are paired with vector databases like Pinecone, Weaviate, and Qdrant to power retrieval-augmented generation in countless production LLM applications — the single most common vector search use case in the current AI industry.
- **E-commerce platforms (Amazon-style, various retailers)**: "visually similar products" and "customers who searched this also liked" features rely on nearest-neighbor search over product embeddings, frequently combined with metadata filtering (price, category, availability) as covered in Advanced Concepts.
- **Notion, Slack-style enterprise search products**: increasingly layer vector search over their existing keyword search to support natural-language queries ("find the doc about our Q3 pricing changes") via hybrid search rather than replacing keyword search outright.

Pattern to notice: no major production system relies on vector search alone — every example above pairs it with filtering, business rules, or a hybrid keyword signal, reinforcing that vector search is a critical retrieval primitive within a larger ranking system, not a complete solution by itself.
`,

  "best-practices": `
1. **Always measure recall@k against exact brute-force search** on a representative sample before trusting any ANN configuration in production — never assume default parameters are adequate for your data's actual dimensionality and distribution.
2. **Pin and track the embedding model version alongside the index.** Mixing vectors from two model versions in one index silently corrupts all similarity comparisons.
3. **Match your distance metric to what the embedding model was trained/evaluated with** — using L2 distance on embeddings optimized for cosine similarity (or vice versa) degrades results without throwing any error.
4. **Normalize vectors to unit length upfront if using dot product as a cosine-similarity proxy** — this makes the fast dot-product path equivalent to cosine similarity.
5. **Start with HNSW for most workloads** unless memory is the binding constraint (favor IVF-PQ) or your corpus size is small enough that brute force is simply faster to build and maintain (a real option below roughly 100k–1M vectors).
6. **Treat hybrid search (vector + BM25) as the default, not an add-on**, for any product where exact terms (names, SKUs, codes) matter — pure vector search alone will underperform there.
7. **Design your filtering strategy deliberately** (pre- vs post-filter) based on expected filter selectivity, rather than defaulting to whichever your library ships first.
8. **Budget for index rebuilds** — schedule them, monitor their duration, and use blue-green swaps rather than rebuilding in place on a system taking live traffic.
9. **Set explicit SLOs for latency and recall together**, not latency alone — a fast index that returns irrelevant neighbors is a silent product failure, not a performance win.
10. **Instrument recall drift monitoring continuously**, not just at launch — corpus growth, embedding model upgrades, and data distribution shifts all degrade recall silently over time.
11. **Right-size ef_search/nprobe per query type** if your system has heterogeneous query patterns (e.g. a "quick suggestions" endpoint can tolerate lower recall than a "final answer retrieval" endpoint in RAG).
12. **Prefer a managed or purpose-built vector database over hand-rolled ANN code** for anything beyond a prototype — persistence, filtering, sharding, and operational tooling are hard to get right and are already solved by the systems covered in the Vector Databases category.
`,

  "anti-patterns": `
### Assuming brute force will "just work" as data grows

~~~python
# WRONG: brute force baked into product code with no scaling plan
def search(query_vec, all_vectors, k=10):
    sims = [cosine_similarity(query_vec, v) for v in all_vectors]  # O(n*d), unbounded
    return sorted(range(len(sims)), key=lambda i: -sims[i])[:k]

# RIGHT: brute force is fine for a genuinely small, static corpus —
# but the moment n crosses roughly 100k-1M vectors or grows continuously,
# migrate to an ANN index and set an explicit trigger (e.g. corpus size,
# or measured p99 latency) for when that migration must happen.
~~~

### Mismatched distance metric

Using Euclidean distance on embeddings the model was optimized for with cosine similarity (or the reverse) — this produces plausible-looking but subtly wrong rankings that are very hard to catch without a recall@k evaluation harness, because nothing errors out.

### Treating vector search as the entire retrieval solution

Shipping pure vector search for a product with exact-match-sensitive queries (SKUs, names, IDs) and being surprised when users complain that searching an exact product code returns unrelated "semantically similar" items. This is an anti-pattern of scope, not implementation — the fix is hybrid search (see Advanced Concepts), not a "better" embedding model.

### Post-filtering with a highly selective filter

~~~python
# WRONG: search first, filter after, with a narrow filter
results = index.search(query_vector, k=10)
filtered = [r for r in results if r.price < 50]   # might return 0-2 results
                                                    # if most of the top-10 are pricier

# RIGHT: either request a much larger k before filtering, or use a
# vector database with native filtered-ANN support that respects the
# filter during the graph walk / cluster scan itself.
results = index.search(query_vector, k=200)
filtered = [r for r in results if r.price < 50][:10]
~~~

### Never rebuilding or monitoring the index

Treating index build as a one-time launch task rather than an ongoing operational responsibility — corpora grow, embedding models get upgraded, and data distributions drift; an index that isn't periodically rebuilt or continuously evaluated for recall silently becomes worse over months without any error or alert firing.

### Ignoring build-time cost when choosing HNSW

Choosing HNSW for a workload with extremely high insert/update churn without accounting for its relatively expensive per-insert cost (finding correct neighbors at each layer) — for write-heavy, append-only-log-style workloads, IVF's simpler and cheaper cluster-reassignment story is sometimes the better fit despite HNSW's superior read-query recall/latency profile.
`,

  performance: `
### Measure first

~~~python
import time
import numpy as np

def measure_recall_at_k(index, ground_truth_index, queries, k=10):
    """The single most important vector-search performance metric:
    what fraction of true top-k neighbors does the ANN index actually return?"""
    ann_results = [index.search(q, k) for q in queries]
    exact_results = [ground_truth_index.search(q, k) for q in queries]  # brute force
    hits = sum(
        len(set(ann) & set(exact)) for ann, exact in zip(ann_results, exact_results)
    )
    return hits / (len(queries) * k)

def measure_latency(index, queries, k=10):
    start = time.perf_counter()
    for q in queries:
        index.search(q, k)
    elapsed = time.perf_counter() - start
    return elapsed / len(queries)   # average latency per query
~~~

Always benchmark recall and latency together as a curve (sweep ef_search or nprobe across a range of values), never as single points — a single recall/latency measurement tells you almost nothing about how your configuration will behave under different load or tuning.

### The optimization hierarchy (apply in order)

1. **Pick the right algorithm family for your scale and workload** before micro-tuning parameters — HNSW for read-heavy, moderate-memory-budget workloads; IVF-PQ for memory-constrained billion-scale workloads; brute force for genuinely small (sub-million vector) static datasets where it's simply the least engineering effort.
2. **Tune the recall knob** (ef_search, nprobe) to the minimum value that meets your recall SLO — over-provisioning these directly and linearly costs latency.
3. **Reduce vector dimensionality** if your embedding model supports it (many modern embedding APIs support Matryoshka-style truncatable embeddings, e.g. using the first 256 of 1536 dimensions) — this shrinks both memory and per-comparison cost roughly linearly.
4. **Apply quantization (PQ or scalar quantization)** once dimensionality reduction and algorithm choice are settled, if memory (not recall) is the binding constraint.
5. **Batch queries** where the application allows it — most ANN libraries and vector databases have measurably better throughput per query when queries are submitted in batches rather than one at a time.
6. **Shard across machines** once a single machine's memory or CPU is saturated (see Scalability) — this is the last lever, not the first, since it adds real operational complexity.

### Concrete numbers worth knowing (order of magnitude, not precise benchmarks — verify against your own data)

- Brute-force search over a million 768-dimensional vectors: tens to low hundreds of milliseconds on a single CPU core, scaling linearly with corpus size.
- HNSW over the same data typically returns results in single-digit milliseconds at 95%+ recall — often a 10–100x latency improvement over brute force at that scale.
- Product quantization commonly achieves 4–32x memory reduction with a few percentage points of recall loss when tuned reasonably; extreme compression settings can lose far more recall and should always be validated against your own recall@k harness rather than assumed from general benchmarks.
`,

  scalability: `
Vector search scales through the same two general strategies as any large data system — vertical (bigger machines) and horizontal (more machines) — plus vector-search-specific compression to defer both.

### Single machine

~~~mermaid
flowchart LR
    App["Application"] --> Idx["ANN index in RAM\n(HNSW graph or IVF-PQ)"]
    Idx --> Disk[("Persisted index snapshot\n(disk / object storage)")]
~~~

A well-tuned single machine with sufficient RAM can comfortably serve tens of millions of vectors with quantization, or several million uncompressed, at low double-digit-millisecond latency. The first scaling lever is almost always **compression** (product quantization, scalar quantization, dimensionality reduction) since it directly reduces the memory a single machine needs, deferring the need for distribution entirely.

### Beyond one machine

~~~mermaid
flowchart TB
    Q(["Query"]) --> Router["Query router / coordinator"]
    Router --> S1["Shard 1 (subset of vectors)"]
    Router --> S2["Shard 2"]
    Router --> S3["Shard N"]
    S1 --> M["Merge top-k from each shard"]
    S2 --> M
    S3 --> M
    M --> R(["Final top-k"])
~~~

- **Scatter-gather sharding**: partition vectors across shards, query all shards in parallel, merge each shard's local top-k into a global top-k. Simple, predictable recall, scales query throughput roughly linearly with shard count, but every query's cost is bounded by the slowest shard (tail latency management matters).
- **Replica scaling**: since vector search is read-heavy in most production systems, replicating the full index across multiple read replicas (rather than sharding the data) is often the simpler first horizontal step, especially when the index fits comfortably on one machine but query throughput exceeds one machine's serving capacity.
- **Both together at extreme scale**: shard the data for memory capacity, and replicate each shard for query throughput — the standard shape used by managed vector databases operating at billion-vector scale.

### Known bottlenecks and answers

| Bottleneck | Answer |
|------------|--------|
| Index too large for one machine's RAM | Shard data across machines, or apply product quantization to shrink footprint first |
| Query throughput exceeds one machine's capacity | Replicate the index across read replicas behind a load balancer |
| Full rebuild blocks live traffic | Blue-green index builds: build the new index on separate infrastructure, swap atomically |
| High insert/update churn degrades HNSW graph quality over time | Scheduled rebuilds/rebalancing, or favor IVF for very write-heavy workloads |
| Tail latency from one slow shard in scatter-gather | Per-shard timeouts with partial-result tolerance, and monitoring shard-level p99 latency independently |
`,

  security: `
### Vector-search-specific attack surface

1. **Embedding inversion attacks.** Research has shown that in some cases approximate reconstruction of the original input (partial text, sensitive attributes) is possible from an embedding vector alone, especially for shorter or low-entropy inputs. Treat embeddings of sensitive data (PII, medical, financial text) with the same access controls as the raw data itself — an exposed vector index is not automatically a safe "anonymized" representation.
2. **Metadata leakage through search results.** Vector databases commonly store business metadata (user IDs, prices, internal notes) alongside vectors; a search API that doesn't enforce row-level access control can leak private records to users who craft queries that happen to retrieve them semantically, even without knowing they exist.
3. **Denial-of-service via expensive queries.** Overly large k values, extremely high ef_search/nprobe settings, or unfiltered brute-force fallback paths can be abused to force expensive compute per request; rate-limit and cap these parameters at the API layer, not just in client SDK defaults.
4. **Data poisoning of the index.** In systems that allow user-influenced content to be embedded and indexed (e.g. user-submitted documents in a RAG system), adversarial content can be crafted to be retrieved for unrelated queries, manipulating downstream LLM outputs — a vector-search-specific instance of the broader RAG prompt-injection risk covered in the **RAG** skill.

### Access control and isolation

- Enforce metadata-based access control (tenant ID, user ID, permission flags) **at the filter/query layer**, not just in the application after results return — see the pre-filtering discussion in Advanced Concepts; a security-relevant filter should never be a "nice to have" post-filter that can be bypassed by a malformed request.
- In multi-tenant vector database deployments, prefer namespace/collection-level isolation (supported natively by most vector databases) over relying solely on metadata filters for tenant separation, since a filter bug is a data breach in a shared index.
- Encrypt vector data at rest and in transit the same as any other sensitive data store — vectors are derived data, not anonymized data.

See the dedicated **OWASP Top 10**, **Secrets Management**, and **RAG** skills for broader application-security depth; vector search's specific responsibility is access-controlled, rate-limited retrieval over potentially sensitive derived data.
`,

  testing: `
The central testing concept in vector search is **recall@k evaluation against ground truth**, not conventional unit testing alone.

~~~python
import numpy as np

def recall_at_k(ann_index, exact_index, test_queries, k=10) -> float:
    """The standard way to test an ANN configuration: how often does it
    agree with exact brute-force search on the true top-k?"""
    total_hits = 0
    for query in test_queries:
        ann_ids = set(ann_index.search(query, k))
        exact_ids = set(exact_index.search(query, k))     # ground truth
        total_hits += len(ann_ids & exact_ids)
    return total_hits / (len(test_queries) * k)

# Example test using pytest
def test_hnsw_meets_recall_target():
    recall = recall_at_k(hnsw_index, brute_force_index, sample_queries, k=10)
    assert recall >= 0.95, f"HNSW recall {recall:.3f} dropped below SLO"

def test_metadata_filter_never_leaks_other_tenant():
    results = search_with_filter(query_vector, tenant_id="tenant_a")
    assert all(r.metadata["tenant_id"] == "tenant_a" for r in results)

def test_hybrid_search_returns_exact_match_for_sku_query():
    results = hybrid_search("SKU-88213-red")
    assert results[0].id == "expected_product_id"   # exact-match sensitive query
~~~

### The senior testing doctrine for vector search

- **Recall@k is a first-class, continuously monitored test**, not a one-time launch gate — run it in CI against a fixed sample whenever the embedding model, index parameters, or corpus changes meaningfully.
- **Test the filter/security boundary explicitly** (as above) — a metadata filter bug in vector search is a data-leak bug, and should be tested with the same rigor as an authorization bug elsewhere in the system.
- **Test hybrid search's exact-match path separately from its semantic path** — a regression in the BM25/keyword component can silently degrade exact-match queries while semantic recall@k metrics look unaffected.
- **Load-test with realistic query distributions**, not just synthetic random vectors — real query vectors (derived from real embedding models on real text) cluster differently than uniformly random vectors, and ANN performance is sensitive to that structure.
- **Version your ground-truth sample and expected recall thresholds** alongside the index configuration so recall regressions are caught in code review, not discovered in production dashboards weeks later.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check embedding model version consistency first.** The single most common "search returns nonsense" bug is a mismatch between the model used to embed the query and the model used to embed the corpus. Log and assert the model version/checksum used at both index-build time and query time.
2. **Re-run the failing query against exact brute-force search** and compare to the ANN result. If brute force also returns poor results, the problem is in the embeddings or the query itself, not the index. If brute force returns good results but the ANN index doesn't, the problem is genuinely a recall/tuning issue.

~~~python
def debug_query(query_vector, ann_index, exact_index, k=10):
    ann_results = ann_index.search(query_vector, k)
    exact_results = exact_index.search(query_vector, k)
    print("ANN results:   ", ann_results)
    print("Exact results: ", exact_results)
    print("Overlap:       ", set(ann_results) & set(exact_results))
~~~

3. **Inspect the actual distance/similarity scores returned**, not just the ranked IDs — a suspiciously uniform or near-zero similarity across "top" results usually indicates a normalization or metric mismatch (e.g. accidentally using un-normalized vectors with a dot-product index expecting unit-length inputs).
4. **Verify the metadata filter logic in isolation** from the vector search — run the filter alone against the full corpus and confirm it returns the expected subset, before debugging the combined pre/post-filter search behavior.
5. **Check index build/insert logs for errors swallowed silently** — some ANN libraries fail an individual insert (e.g. dimension mismatch on one malformed vector) without halting the whole build; a corpus with a small number of missing vectors can look like a mysterious recall drop.
6. **Profile query latency by phase** (embedding call, index search, filter application, re-ranking) rather than treating "search is slow" as one opaque number — the bottleneck is frequently the embedding API call (network-bound) rather than the ANN index itself.

### Debugging recall regressions specifically

"Recall dropped after we changed X" almost always traces to one of: an embedding model upgrade without full re-indexing, an index parameter change (lower ef_search/nprobe) shipped without re-measuring recall@k, or corpus growth past the point the original nlist/M parameters were tuned for.
`,

  monitoring: `
Production vector search visibility rests on metrics that go beyond standard latency/error monitoring, because a vector search system can be "up" (200 OK, low latency) while silently returning poor-quality results.

### Recall monitoring

~~~python
# Scheduled job, not just a launch-time check
def nightly_recall_check(ann_index, exact_index, fixed_sample_queries, k=10):
    recall = recall_at_k(ann_index, exact_index, fixed_sample_queries, k)
    emit_metric("vector_search.recall_at_k", recall, tags={"k": k})
    if recall < RECALL_SLO:
        alert(f"Vector search recall dropped to {recall:.3f}, below SLO {RECALL_SLO}")
~~~

### Latency and throughput

~~~python
from prometheus_client import Histogram, Counter

SEARCH_LATENCY = Histogram("vector_search_seconds", "ANN query latency", ["index_name"])
SEARCH_COUNT = Counter("vector_search_total", "Total searches", ["index_name", "status"])

@SEARCH_LATENCY.labels(index_name="products").time()
def search(query_vector, k=10):
    ...
~~~

Track p50/p95/p99 latency per index/collection, and alert on p99 rather than mean, since ANN tail latency (e.g. queries that happen to explore a much larger neighborhood before converging) can spike independently of average performance.

### Corpus and index health

- **Index size and vector count over time** — unexpected drops can indicate a failed ingestion job; unexpected growth without corresponding rebuild can indicate graph/cluster quality degradation building up.
- **Insert/update latency** — a slowly increasing insert latency on a live HNSW index is an early warning sign of graph degradation before it shows up as a query-recall problem.
- **Filter selectivity distribution** — monitoring how selective real production filters actually are helps validate (or invalidate) the pre-filter/post-filter strategy chosen in Advanced Concepts.
- **Embedding model version tags on both queries and stored vectors** — surfaced as a dashboard so a model upgrade rollout can be tracked and any mismatch period is visible, not silent.
`,

  deployment: `
### A representative production deployment

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ src/

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
# Pre-baked index snapshot mounted or pulled at startup, not built in the image
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "retrieval_service.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: the index snapshot is deliberately NOT baked into the image build (it changes on its own schedule, independent of code deploys) — instead it's loaded from object storage (or a managed vector database's own storage layer) at container startup, so index updates and code deploys can happen independently. Non-root user and slim base follow the same security reasoning as any Python service.

### Serving topology specifics for vector search

- **Warm-start requirement**: unlike a stateless web service, a vector search process typically needs to load a multi-gigabyte index into memory before it can serve its first query — health/readiness probes must distinguish "process started" from "index loaded and ready," and rolling deploys must wait for readiness before routing traffic to a new instance.
- **Index versioning alongside code versioning**: tag index snapshots with a version/build ID and have the serving code assert compatibility at startup (embedding dimension, metric type, model version) rather than silently loading a mismatched index.
- **Blue-green index swaps**: for a full rebuild, build the new index on separate infrastructure (or as a background process on the same fleet with enough spare memory), validate its recall@k against the ground-truth sample, and only then atomically switch serving traffic — never rebuild in place on an instance actively serving queries.
- **Managed vector databases (Pinecone, managed Milvus/Zilliz, Weaviate Cloud, Qdrant Cloud)** absorb most of this operational complexity — a legitimate and common production choice specifically to avoid building this deployment machinery in-house.
`,

  "production-checklist": `
Before a vector search system takes real production traffic:

- [ ] Recall@k measured against exact brute-force search on a representative sample, meeting an explicit SLO
- [ ] Distance metric confirmed to match what the embedding model was trained/evaluated with
- [ ] Embedding model version pinned and asserted-compatible between index-build time and query time
- [ ] Index parameters (ef_search/nprobe, M, nlist) chosen deliberately and documented, not left at library defaults
- [ ] Metadata filtering strategy (pre- vs post-filter) chosen based on measured filter selectivity
- [ ] Hybrid search (vector + BM25) in place for any product with exact-match-sensitive queries
- [ ] Tenant/access-control isolation enforced at the filter layer, tested for leakage across tenants
- [ ] Index build/rebuild strategy defined: incremental insert path, and a scheduled or triggered full rebuild path
- [ ] Blue-green (or equivalent) index swap mechanism in place — no rebuild-in-place on live traffic
- [ ] Sharding/replication plan sized to current corpus and expected growth, not just current scale
- [ ] Latency SLOs defined per p50/p95/p99, and load-tested with realistic (not synthetic-random) query vectors
- [ ] Continuous recall monitoring job scheduled, with alerting on regression
- [ ] Query-time parameter caps (max k, max ef_search/nprobe) enforced at the API layer against abuse
- [ ] Vector data at rest and in transit encrypted, matching the sensitivity of the source data it's derived from
`,

  "common-mistakes": `
1. **Assuming brute force never needs replacing** — small prototypes scale into large corpora faster than teams expect; without a defined migration trigger, brute force silently becomes the production bottleneck.
2. **Using the wrong distance metric for the embedding model** — a subtle bug because it never errors, only quietly degrades relevance.
3. **Skipping recall@k evaluation entirely** — teams tune ef_search/nprobe "until it feels fast enough" without ever measuring what recall they actually gave up, and only discover the cost when users complain about missing obviously-relevant results.
4. **Re-embedding new data with an upgraded model without re-indexing old data** — this silently splits the corpus into two incompatible vector spaces sharing one index.
5. **Relying on pure vector search for exact-match-sensitive products** (search, e-commerce, code search) — leads to a steady trickle of "why didn't it find the exact thing I typed" complaints that hybrid search would have prevented.
6. **Post-filtering with a highly selective filter and a small k** — silently returns too few or zero results; see the Anti-Patterns worked example.
7. **Treating index build as a one-time task** rather than an ongoing operational responsibility with monitoring and a rebuild cadence.
8. **Not accounting for warm-start time** in deployment/readiness probes, causing rolling deploys to route traffic to instances still loading a multi-gigabyte index.
9. **Ignoring tenant isolation in metadata filters**, treating filters as purely a relevance feature rather than also a security boundary in multi-tenant systems.
10. **Benchmarking with synthetic random vectors** instead of real embeddings from real queries, producing recall/latency numbers that don't transfer to production behavior, since real embeddings cluster non-uniformly.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|-------|---------------|-----|
| Search returns semantically unrelated top results | Embedding model mismatch between query and corpus, or wrong distance metric | Verify model version and metric consistency end to end |
| Recall drops sharply after a data migration | Corpus grew past the scale the index parameters (nlist/M) were tuned for | Re-tune parameters and re-measure recall@k at the new scale |
| Filtered search returns fewer results than k, or zero | Post-filtering with a highly selective filter and too-small candidate k | Increase candidate k before filtering, or use filtered-ANN / pre-filtering |
| Exact-match queries (SKU, ID, name) return irrelevant items | Pure vector search with no keyword/BM25 component | Add hybrid search with reciprocal rank fusion or a similar combiner |
| Dimension mismatch error on insert or query | Query embedded with a different model/dimension than the index was built with | Enforce dimension/model assertion at both index-build and query time |
| Index insert latency climbing over time | HNSW graph degradation from heavy insert churn without rebalancing | Schedule periodic rebuilds, or switch to IVF for very write-heavy workloads |
| Multi-tenant data leakage in search results | Metadata filter applied only in application code, bypassable via a crafted request | Enforce filters at the query layer / use native namespace isolation |
| Very slow query on a "fast" index | ef_search/nprobe set far higher than necessary, or k requested is unnecessarily large | Sweep the recall/latency curve and pick the minimum sufficient value |
| Cold-start timeout on deploy | Health probe doesn't wait for a multi-gigabyte index to finish loading into memory | Separate liveness from readiness probes; readiness waits on index-loaded signal |

The habit that matters: reproduce with exact brute-force search as ground truth first — it tells you immediately whether the bug is in the embeddings/query or specifically in the ANN index's approximation.
`,

  faqs: `
**Q: Do I need a dedicated vector database, or can I just use FAISS/HNSW directly in my application?**
For prototypes and small, mostly-static corpora, a library like FAISS embedded directly in your application is a completely reasonable choice. Once you need persistence, live updates, filtering, multi-tenancy, or horizontal scaling, a purpose-built vector database (see the **FAISS**, **Pinecone**, **Milvus**, **Weaviate**, **Qdrant**, **Chroma** skills) removes a large amount of operational engineering you would otherwise have to build yourself.

**Q: Is HNSW always the right choice?**
It's the right default for most read-heavy workloads where memory is available, which is why it's the default in most vector databases. It is not automatically right for extremely memory-constrained billion-scale corpora (favor IVF-PQ) or extremely write-heavy workloads with constant churn (favor IVF or a hybrid strategy).

**Q: What recall level should I target?**
There's no universal number — it depends on the product. A chat/RAG assistant often tolerates 90–95% recall in exchange for lower latency; a legal or medical retrieval system, or a deduplication pipeline, may require 99%+ recall and accept higher latency or cost. Define this as an explicit SLO, not an assumption.

**Q: Why does my vector search return bad results even though the index "works" with no errors?**
This is almost always an embedding/metric mismatch (wrong model version, wrong distance metric) rather than an ANN algorithm bug — see Debugging above. ANN algorithms are very reliable at approximating whatever geometry you hand them; if the geometry itself doesn't capture the similarity you want, no index configuration fixes that.

**Q: Should I always add hybrid (keyword) search?**
Not always, but default to considering it seriously for any product where users might search for exact terms — names, codes, IDs, rare technical terms. Pure semantic/vector search is well suited to conceptual, paraphrase-tolerant queries and weaker on literal exact matches.

**Q: How often should I rebuild my index?**
There's no fixed universal cadence — trigger rebuilds on a schedule appropriate to your corpus's churn rate, on embedding model upgrades (which always require a full re-embed and re-index), and whenever continuous recall monitoring shows degradation past your SLO.

**Q: Can vector search replace a traditional database?**
No — vector search answers "what's similar," not "give me exactly these rows matching this condition." Metadata filtering bridges some of the gap, but vector search is a complementary retrieval primitive layered alongside traditional storage and query systems, not a replacement for them.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the nearest-neighbor search problem?* Given a query vector, find the k vectors in a large collection most similar to it by some distance/similarity measure. Follow up: why does brute force struggle at scale (O(n·d) per query).
2. *What does ANN stand for and why is it used?* Approximate Nearest Neighbor — trades a controlled amount of recall for large speed and memory gains, since most applications don't need exact top-k, they need fast, good-enough top-k.
3. *Explain cosine similarity vs Euclidean distance.* Cosine measures the angle between vectors (magnitude-invariant); Euclidean measures straight-line distance (magnitude-sensitive). Which to use depends on how the embedding model was trained/normalized.
4. *What is recall@k?* The fraction of the true top-k nearest neighbors (from exact search) that an ANN method actually returns; the standard way to evaluate ANN index quality.
5. *Why do KD-trees fail in high dimensions?* Distances concentrate in high-dimensional space (curse of dimensionality), so the tree's spatial pruning rarely eliminates large portions of the search — it degenerates toward brute force with added overhead.

**Senior:**

6. *Explain HNSW's layered graph structure and why it's fast.* A skip-list-like hierarchy of graphs with sparse long-range edges at the top and dense local edges at the bottom; a greedy walk from a single entry point converges quickly because top layers act as navigational highways, refined by lower, denser layers. Strong answers cover the ef_search candidate-list mechanism and the recall/latency tradeoff it controls.
7. *Walk through IVF with a worked numeric example.* Cluster n vectors into nlist clusters via k-means; at query time, compute distance to all centroids (cheap), pick nprobe nearest clusters, and brute-force scan only those clusters' vectors. Should include the tradeoff: raising nprobe raises recall and latency.
8. *How does product quantization reduce memory, and what does it cost?* Splits vectors into sub-vectors, replaces each with the id of its nearest codeword from a small learned codebook — shrinks storage by many multiples at the cost of approximate (quantized) distance computation and reduced recall, tunable by codebook size/sub-vector count.
9. *Design a hybrid search system combining vector and keyword search.* Run both an ANN vector search and a BM25/inverted-index search, fuse the two ranked lists (e.g. reciprocal rank fusion) rather than trying to normalize incompatible raw scores; strong answers discuss when to weight one signal over the other.
10. *Pre-filtering vs post-filtering — when does each fail?* Post-filtering fails when the filter is highly selective (too few/no results survive from the top-k); pre-filtering (or filtered-ANN) is needed there, but naive pre-filtering can force brute force over the filtered subset if the ANN structure doesn't support filter-aware traversal.
11. *How would you scale a vector index to a billion vectors across multiple machines?* Discuss scatter-gather sharding (partition data, query all shards, merge top-k), replication for read throughput, and product quantization to reduce per-shard memory footprint; strong answers weigh tail latency implications of scatter-gather.
12. *How do you handle a constantly changing corpus (inserts/deletes) in a vector index?* Discuss incremental insert support in HNSW, graph degradation over time, scheduled or triggered rebuilds, blue-green swaps to avoid live-traffic impact, and soft-delete/tombstoning with periodic compaction.
`,

  "coding-questions": `
### 1. Implement brute-force k-NN, then compare against a simple ANN sketch (tests fundamentals + evaluation)

~~~python
import numpy as np

def brute_force_knn(query: np.ndarray, vectors: np.ndarray, k: int = 5):
    """Ground truth: O(n*d) per query, always correct."""
    dists = np.linalg.norm(vectors - query, axis=1)
    return np.argsort(dists)[:k]

def evaluate_recall(ann_fn, vectors: np.ndarray, queries: np.ndarray, k: int = 5) -> float:
    """Compares an arbitrary ANN function's results to brute-force ground truth."""
    hits = 0
    for q in queries:
        exact = set(brute_force_knn(q, vectors, k))
        approx = set(ann_fn(q, vectors, k))
        hits += len(exact & approx)
    return hits / (len(queries) * k)
~~~

Complexity: brute force is O(n·d) per query, O(1) extra space beyond the distance array. Follow-up: how would you vectorize this across many queries at once (batch matrix multiply instead of a Python loop)?

### 2. Implement a minimal IVF index from scratch (tests clustering + the recall/latency tradeoff)

~~~python
import numpy as np
from sklearn.cluster import KMeans

class MiniIVF:
    def __init__(self, vectors: np.ndarray, n_clusters: int = 50):
        self.vectors = vectors
        self.kmeans = KMeans(n_clusters=n_clusters, n_init=4).fit(vectors)
        self.centroids = self.kmeans.cluster_centers_
        self.inverted_lists: dict[int, list[int]] = {}
        for idx, label in enumerate(self.kmeans.labels_):
            self.inverted_lists.setdefault(label, []).append(idx)

    def search(self, query: np.ndarray, k: int = 5, nprobe: int = 5):
        # Step 1: find nprobe nearest clusters (cheap — only n_clusters comparisons)
        centroid_dists = np.linalg.norm(self.centroids - query, axis=1)
        probe_clusters = np.argsort(centroid_dists)[:nprobe]
        # Step 2: brute-force scan only within the probed clusters
        candidate_ids = [i for c in probe_clusters for i in self.inverted_lists.get(c, [])]
        if not candidate_ids:
            return []
        cand_vecs = self.vectors[candidate_ids]
        dists = np.linalg.norm(cand_vecs - query, axis=1)
        top = np.argsort(dists)[:k]
        return [candidate_ids[i] for i in top]
~~~

Complexity: build time O(n·d·n_clusters·iterations) for k-means; query time roughly O(n_clusters·d + (n/n_clusters)·nprobe·d) — far below O(n·d) when nprobe << n_clusters. Follow-up: what happens to recall as n_clusters grows very large relative to nprobe? (Answer: recall drops because each cluster becomes small and the true neighbor is more likely to be split into an unprobed cluster.)

### 3. Reciprocal rank fusion for hybrid search (tests ranking/fusion logic)

~~~python
def reciprocal_rank_fusion(*ranked_lists: list, k: int = 60) -> list:
    """Fuse any number of ranked ID lists (e.g. vector search + BM25) into one
    ranking without needing to normalize incompatible raw score scales."""
    scores: dict = {}
    for ranked_list in ranked_lists:
        for rank, doc_id in enumerate(ranked_list):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)

# Example
vector_results = ["doc3", "doc1", "doc5"]
bm25_results = ["doc1", "doc7", "doc3"]
fused = reciprocal_rank_fusion(vector_results, bm25_results)
# doc1 and doc3 rank highly in both lists and rise to the top of the fusion
~~~

Complexity: O(sum of list lengths). Follow-up: how would you weight the vector signal more heavily than the keyword signal for a mostly-semantic product, or vice versa for a mostly-exact-match product?
`,

  "hands-on-labs": `
### Lab 1 — Brute-force k-NN and the scaling wall (beginner, ~1h)
Implement brute-force cosine-similarity k-NN over a synthetic dataset. Time it at n = 10,000, 100,000, and 1,000,000 vectors and plot query latency vs n. Deliverable: a chart demonstrating the O(n) scaling wall in your own numbers. Skills: distance metrics, vectorized NumPy, Big-O intuition made concrete.

### Lab 2 — Build and tune a real ANN index (intermediate, ~2h)
Using FAISS, build both an IndexFlatL2 (exact) and an IndexHNSWFlat over the same dataset (at least 100,000 vectors from a real embedding model, e.g. sentence embeddings of a public text dataset). Sweep ef_search across several values, measuring recall@10 against the exact index and latency at each setting. Deliverable: a recall-vs-latency curve and a written recommendation for which ef_search value you'd ship, with justification. Skills: HNSW tuning, recall@k evaluation, the recall/latency tradeoff made concrete.

### Lab 3 — Hybrid search with filtering (advanced, ~3h)
Combine your ANN index with a BM25 index (e.g. via rank_bm25 or Elasticsearch) over the same document set, fuse results with reciprocal rank fusion, and add a metadata filter (e.g. category or date range). Implement both a post-filtering and a pre-filtering path, and measure result-count and relevance differences at varying filter selectivity. Deliverable: a short report comparing pre- vs post-filtering behavior at 50%, 5%, and 0.5% filter selectivity. Skills: hybrid search, filtering strategy, ranking fusion.

### Lab 4 — Production-shaped retrieval service (production, ~4h)
Wrap Lab 2/3's index in a FastAPI service with structured logging, a /healthz and /readyz endpoint (readyz only returns healthy once the index is fully loaded), a scheduled nightly recall@k evaluation job against a fixed sample, and a Dockerfile that loads the index from external storage at startup rather than baking it into the image. Skills: the entire production section applied end to end, directly transferable to any of the **Vector Databases** category skills.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for in retrieval/AI-infrastructure roles):

1. **Semantic search engine over a real corpus** — Ingest a public dataset (e.g. Wikipedia subset, a public document collection, or your own notes), embed it with a real embedding model, build both an exact and an HNSW index, expose a search API, and add hybrid (vector + BM25) search with reciprocal rank fusion. Demonstrates: end-to-end embedding-to-retrieval pipeline, ANN tuning, hybrid ranking design.

2. **Recall/latency benchmarking harness** — Build a reusable tool that takes any vector dataset and any ANN library (FAISS, or a vector database's client), sweeps its key parameters (ef_search/nprobe/M), and produces recall@k vs latency vs memory charts automatically. Demonstrates: rigorous evaluation methodology, the tradeoff-triangle thinking senior interviews probe for, comparative systems analysis.

3. **Multi-tenant filtered RAG retrieval service** — A retrieval microservice supporting multiple tenants with strict metadata-filter-enforced isolation, both pre- and post-filtering paths benchmarked against real filter-selectivity distributions, index rebuild scheduling, and a blue-green swap mechanism, feeding into a downstream **RAG** pipeline. Demonstrates: production architecture, security-aware filtering, operational maturity around index lifecycle.

Each project: versioned embedding model pinning, a recall@k CI check, structured logging and metrics, a README with an architecture diagram, and a written explanation of every ANN parameter choice and why. The evaluation rigor around the index is what distinguishes a senior retrieval-systems portfolio piece from a basic "I called an API" project.
`,

  "case-studies": `
### Meta / FAISS: open-sourcing the reference ANN library
Facebook AI Research built FAISS internally to solve billion-scale similarity search across Meta's own products, then open-sourced it in 2017. FAISS's design — offering exact search, IVF, HNSW, and product quantization as composable building blocks rather than one fixed algorithm — became the reference implementation the rest of the industry benchmarks against. Lesson: exposing the full tradeoff triangle as configurable primitives (rather than hiding it behind one "smart" default) is what let FAISS serve everything from small research prototypes to billion-vector production systems.

### Spotify / Annoy: tree-based ANN before HNSW dominance
Spotify built and open-sourced Annoy (Approximate Nearest Neighbors Oh Yeah), a tree-based (random projection forest) ANN library, to power music recommendation at scale, predating HNSW's rise to dominance. Annoy remains notable for its memory-mapped file design (indexes can be shared across processes without duplicating memory) — a reminder that "best algorithm" and "best fit for your operational constraints" are not always the same answer; many teams still choose Annoy-style approaches specifically for its low-memory multi-process sharing model.

### Pinterest: visual similarity at billions-of-images scale
Pinterest's visual search and "Related Pins" systems perform nearest-neighbor search over billions of image embeddings to power core discovery features, requiring careful combination of ANN indexing with heavy sharding and continuous re-indexing as new pins are added constantly. Lesson: at extreme, continuously-growing scale, the operational story (sharding, incremental updates, rebuild cadence) becomes at least as important an engineering problem as the choice of ANN algorithm itself.

### The industry-wide shift from LSH/trees to HNSW as embeddings went mainstream
As BERT-era embeddings made high-quality semantic vectors cheap and ubiquitous around 2018-2020, the industry's default ANN choice shifted decisively toward HNSW-based indexes (adopted as default or primary index type across FAISS, Milvus, Weaviate, Qdrant, Pinecone) because its recall-per-millisecond profile consistently outperformed LSH and pure IVF for the specific dimensionality and distribution characteristics of neural embeddings. Lesson: algorithm popularity in this field tracks the data workload's characteristics closely — what wins for geospatial 2D/3D data (KD-trees) is not what wins for 768-1536 dimensional neural embeddings (HNSW), and reassessing "what's dominant" is worth doing again as new embedding paradigms emerge.
`,

  comparisons: `
| Dimension | KD-tree | LSH | IVF | HNSW | Brute force |
|-----------|---------|-----|-----|------|--------------|
| Best fit | Low dimensions (2D-3D geospatial) | Simple sharding, dedup pipelines | Large scale, memory-constrained (esp. with PQ) | Most production embedding search | Small/static corpora, or ground-truth eval |
| High-dimension behavior | Degrades toward brute force (curse of dimensionality) | Works, but recall/speed curve usually worse than IVF/HNSW | Works well, tunable via nlist/nprobe | Works very well — the current default | N/A — always exact, always slow at scale |
| Query recall/latency | Poor above ~20 dimensions | Moderate, tuning-sensitive | Good, tunable | Best-in-class among these | Perfect recall, worst latency at scale |
| Memory footprint | Moderate | Moderate-high (multiple hash tables) | Low (esp. with PQ) | Higher (graph edges) | Lowest (no extra structure), but doesn't scale |
| Insert/update cost | Cheap-ish, but rebalancing needed | Cheap (just re-hash) | Moderate (cluster reassignment can drift) | More expensive (neighbor search per insert) | Trivial (append only) |
| Where it's used today | Rare for embeddings; still fine for spatial/geo data | Still used in some dedup/sharding pipelines | IVF-PQ at billion-scale, memory-constrained systems | Default in FAISS, Milvus, Weaviate, Qdrant, Pinecone | Ground-truth evaluation baseline; small prototypes |

**How seniors choose**: start from your actual constraints — corpus size and growth rate, memory budget, recall SLO, and insert/update churn — rather than picking the algorithm with the best reputation. For most new embedding-search systems today, HNSW is the reasonable default; drop to IVF-PQ specifically when memory is the binding constraint at very large scale; keep brute force explicitly as your recall@k ground-truth tool regardless of which ANN algorithm you ship.
`,

  "related-technologies": `
- **Embeddings** — the direct prerequisite; vector search operates entirely on the vectors this skill produces, and nothing here works if the embeddings themselves don't capture the right notion of similarity.
- **FAISS** — the reference open-source ANN library (Meta), offering brute force, IVF, HNSW, and PQ as composable primitives; the best place to learn ANN algorithms hands-on.
- **Pinecone** — a fully managed vector database abstracting index management, sharding, and filtering behind an API; a common choice when teams want to avoid operating ANN infrastructure themselves.
- **Milvus** — an open-source, horizontally scalable vector database built for very large deployments, with strong support for multiple index types and distributed sharding.
- **Weaviate** — an open-source vector database with strong native hybrid search and metadata filtering support, plus a built-in module system for embedding generation.
- **Qdrant** — a Rust-built vector database known for strong filtered-ANN support and efficient resource usage, popular in performance-conscious deployments.
- **Chroma** — a lightweight, developer-friendly vector database popular for prototyping and smaller-scale RAG applications.
- **RAG** — the dominant production application built directly on top of vector search: retrieval quality here is the ceiling on RAG answer quality.
- **Machine Learning** and **Deep Learning** — provide the broader modeling context (dimensionality, distance metrics, learned representations) that embeddings and vector search build on.

On this platform, the natural learning path: **Embeddings** → **Vector Search** (this page) → pick a concrete system among **FAISS / Pinecone / Milvus / Weaviate / Qdrant / Chroma** → **RAG** to see the full production pipeline assembled end to end.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2026 — check each vector database's own release notes for anything newer, as this space moves quickly.

- **Native hybrid search is now table stakes.** Weaviate, Qdrant, Milvus, and Elasticsearch/OpenSearch have all matured their combined vector-plus-BM25 query APIs, reducing the need for teams to hand-roll reciprocal rank fusion themselves.
- **Disk-based and memory-tiered ANN indexes** (approaches in the spirit of DiskANN-style research) have continued to mature, targeting billion-scale indexes that don't require the entire index resident in RAM, trading some latency for dramatically lower memory cost.
- **Matryoshka-style truncatable embeddings** from several embedding model providers let applications use a shorter prefix of a full embedding vector for faster, lower-memory search when slightly reduced accuracy is acceptable — an increasingly common lever in the memory/recall tradeoff alongside product quantization.
- **Filtered-ANN support has become a differentiator** across vector databases, with more sophisticated index-aware filtering (rather than naive pre/post-filtering) becoming a standard evaluation criterion when teams choose a system.
- **Quantization-aware training and quantization defaults** in embedding models themselves (rather than only quantizing after the fact) are an active area of improvement across providers, aiming to close the recall gap that aggressive PQ compression traditionally introduces.

Given how actively this space is developing, always verify current benchmark numbers, default parameters, and feature support directly against the official docs of whichever vector database or library you're evaluating before making a production decision.
`,

  "future-roadmap": `
Where vector search is heading over the next few years:

1. **Deeper integration of filtering and vector search inside the ANN algorithm itself**, rather than treating filtering as a bolt-on pre/post step — expect filtered-ANN quality (recall under selective filters) to keep becoming a primary competitive axis among vector databases.
2. **Continued growth of disk-based and tiered-memory ANN indexes**, driven by corpora growing faster than RAM costs are falling, making billion-scale-and-beyond indexing economically viable on commodity infrastructure.
3. **Tighter coupling between embedding model training and downstream ANN/quantization behavior** (e.g. models trained to be robust to quantization, or natively producing truncatable/Matryoshka-style embeddings) — expect the line between "embedding model choice" and "index configuration choice" to blur further.
4. **Vector search as a built-in feature of general-purpose databases**, not just specialized systems — Postgres's pgvector and similar extensions in other mainstream databases continue to mature, letting many teams avoid operating a separate vector database at all for moderate scale.
5. **Hybrid and multi-signal retrieval (vector + keyword + learned re-rankers + business rules) becoming the default architecture**, with "just use vector search" increasingly understood as an oversimplification even for greenfield systems.

For your career: bet on deeply understanding the recall/latency/memory tradeoff triangle and evaluation methodology (recall@k benchmarking) over memorizing any one library's API — the underlying algorithmic tradeoffs (tree vs hash vs cluster vs graph) have proven durable across a decade of tooling churn, and that conceptual fluency transfers across whichever specific vector database you end up operating.
`,

  "cheat-sheet": `
~~~python
# --- Core problem ---
# Given query vector q, find k most similar vectors among n stored vectors.
# Brute force: O(n*d) per query -- doesn't scale past ~100k-1M vectors.
# ANN: trade a little recall for large speed/memory gains.

# --- Distance metrics ---
cosine_similarity(a, b)   # angle only, ignores magnitude -- most common for text
euclidean_distance(a, b)  # straight-line distance -- common for images
dot_product(a, b)         # fast; equals cosine sim if vectors are unit-normalized

# --- Algorithm families ---
# KD-tree:   exact, great in low-D, degrades in high-D (curse of dimensionality)
# LSH:       hash so similar vectors collide more often; probabilistic, tunable
# IVF:       cluster (k-means) once; at query time probe nprobe nearest clusters
# HNSW:      multi-layer graph; greedy walk from sparse top layer down to dense
#            bottom layer; ef_search controls the recall/latency knob
# PQ:        split vector into sub-vectors, replace each with a codebook id --
#            big memory savings, some recall loss

# --- IVF worked example ---
# 10M vectors, nlist=1000 clusters (~10k vectors/cluster), nprobe=10
# -> compare against ~100k vectors instead of 10M (100x fewer comparisons)

# --- The tradeoff triangle ---
# Recall <-> Latency <-> Memory -- every ANN knob moves you along this triangle
# ef_search up / nprobe up  -> recall up, latency up
# M up (HNSW)               -> recall up, memory up
# PQ compression up         -> memory down, recall down

# --- Evaluation ---
recall_at_k = |ANN_top_k intersect exact_top_k| / k
# ALWAYS measure this against brute force before trusting an ANN config

# --- Hybrid search ---
# Pure vector search underperforms on exact-match queries (SKUs, names, IDs).
# Fuse vector + BM25 rankings, e.g. via Reciprocal Rank Fusion:
score[doc] += 1 / (k_rrf + rank_in_list + 1)   # summed across each ranked list

# --- Filtering ---
# Post-filter: search then discard -- fails when filter is highly selective
# Pre-filter / filtered-ANN: filter-aware traversal -- needed for narrow filters

# --- Production concerns ---
# - pin embedding model version to the index; mismatches silently break relevance
# - schedule index rebuilds (corpus drift, model upgrades); use blue-green swaps
# - shard via scatter-gather at billion-scale; replicate for read throughput
# - monitor recall@k continuously in production, not just at launch
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Why doesn't brute-force search scale? | O(n*d) cost per query; at hundreds of millions of vectors this becomes seconds per query, far too slow for interactive/high-QPS use |
| What does ANN trade for speed? | A small, tunable amount of recall (result quality) for large latency and memory gains |
| Why do KD-trees fail in high dimensions? | Distances concentrate (curse of dimensionality) so spatial pruning rarely eliminates large parts of the tree; degenerates toward brute force |
| LSH's core idea? | Hash functions designed so similar vectors collide (share a bucket) more often than dissimilar ones |
| IVF's core idea? | Cluster vectors once (k-means); at query time only scan vectors in the nprobe nearest clusters to the query |
| HNSW's core idea? | A multi-layer graph -- sparse long-range edges on top, dense local edges at the bottom -- navigated with a greedy walk from a single entry point |
| What does ef_search control? | HNSW's query-time candidate-list breadth; higher = better recall, higher latency |
| What does nprobe control? | IVF's number of clusters searched per query; higher = better recall, higher latency |
| What is product quantization? | Splitting vectors into sub-vectors and replacing each with a small codebook id, drastically shrinking memory at the cost of some recall |
| What is recall@k? | The fraction of true top-k nearest neighbors (from exact search) that an ANN method actually returns |
| Why does pure vector search struggle with SKU/ID queries? | Embeddings capture general semantic similarity, not exact token identity; hybrid search (vector + BM25) fixes this |
| Pre-filter vs post-filter -- when does post-filter fail? | When the metadata filter is highly selective, most of the top-k gets discarded, returning too few or zero results |
| Why must query and corpus use the same embedding model version? | Different model versions produce geometrically different vector spaces; mixing them makes similarity scores meaningless with no error thrown |
| Why does HNSW insert cost more than IVF insert? | Inserting into HNSW requires finding correct neighbors at each layer (query-like cost); IVF just needs a cluster (centroid) reassignment |
| What's the recall/latency/memory triangle? | Every ANN configuration choice moves you along these three axes; you cannot maximize all three simultaneously |
`,

  mcqs: `
**1. What is the approximate cost of brute-force k-NN search per query?**

A) O(log n)  B) O(n * d)  C) O(1)  D) O(d^2)

**Answer: B** -- comparing the query against every one of n vectors, each comparison costing O(d) for a d-dimensional vector.

**2. Why do KD-trees degrade in high-dimensional spaces?**

A) They run out of memory  B) Distances concentrate, so spatial pruning rarely skips large portions of the tree (curse of dimensionality)  C) They only support integer coordinates  D) They cannot be built in parallel

**Answer: B**

**3. In IVF, what does increasing nprobe do?**

A) Decreases recall, increases latency  B) Increases recall, increases latency  C) Increases recall, decreases latency  D) Has no effect on recall or latency

**Answer: B** -- more clusters are searched, catching more true neighbors, at the cost of scanning more vectors.

**4. What is the main memory cost driver in an HNSW index?**

A) The raw text of the documents  B) The graph edges (neighbor pointers per node per layer) plus stored vectors  C) The query cache  D) The distance metric chosen

**Answer: B**

**5. Why does pure vector search often underperform on an exact product-SKU query?**

A) Embeddings are too slow to compute  B) Embeddings capture general semantic similarity, not exact token/ID identity, so an exact code may not be distinctly represented  C) Vector databases don't support numeric queries  D) SKUs are always filtered out by metadata rules

**Answer: B** -- this is precisely why hybrid (vector + BM25) search exists.

**6. What does recall@k measure?**

A) Query latency at the k-th percentile  B) The fraction of true top-k nearest neighbors (from exact search) that an ANN method actually returns  C) The number of clusters in an IVF index  D) The compression ratio of product quantization

**Answer: B**
`,

  "revision-notes": `
**The core problem in 4 lines:** Given a query vector, find the k most similar vectors among potentially billions. Brute-force comparison costs O(n*d) per query and does not scale. Approximate Nearest Neighbor (ANN) search accepts a small, controlled loss of recall in exchange for massive speed and memory gains. Every ANN algorithm and every configuration knob is a specific point along the recall/latency/memory tradeoff triangle.

**Algorithm families in 6 lines:** KD-trees partition space recursively; exact and fast in low dimensions, but degrade to brute force in high dimensions due to the curse of dimensionality, so they are not used for modern embeddings. LSH hashes vectors so similar ones collide more often, giving probabilistic sub-linear search; still used in some pipelines but generally outperformed by IVF/HNSW for embedding search. IVF clusters vectors once (k-means) and, at query time, scans only the nprobe nearest clusters instead of the whole dataset. HNSW builds a multi-layer graph navigated by a greedy walk from sparse top-layer "highway" edges down to dense bottom-layer local edges, and is the dominant production choice today because of its strong recall-per-millisecond profile. Product quantization compresses vectors into small codebook-index codes, trading some recall for large memory savings, and is commonly layered on top of IVF or HNSW.

**Evaluation in 2 lines:** Recall@k -- the overlap between an ANN method's top-k and exact brute-force search's top-k -- is the fundamental metric for any ANN configuration, and must be measured continuously, not assumed from defaults.

**Beyond pure similarity in 3 lines:** Hybrid search fuses vector similarity with keyword/BM25 scoring (e.g. via reciprocal rank fusion) because pure vector search underperforms on exact-match-sensitive queries. Metadata filtering (e.g. price, category) must be designed deliberately as pre-filtering, post-filtering, or index-aware filtered-ANN depending on filter selectivity, since naive post-filtering fails badly on highly selective filters.

**Production in 5 lines:** Pin and assert embedding model version consistency between index build and query time -- mismatches silently corrupt relevance with no error. Schedule index rebuilds for a changing corpus and use blue-green swaps to avoid live-traffic impact. Shard via scatter-gather at extreme scale and replicate for read throughput. Monitor recall@k continuously in production, not just at launch. Enforce metadata filters as a security boundary, not only a relevance feature, in multi-tenant systems.
`,

  "learning-roadmap": `
A realistic path to production-grade vector search fluency:

**Week 1 -- Foundations.** Read Beginner and Intermediate Concepts here; make sure the **Embeddings** skill is solid first. Implement brute-force k-NN yourself and time it at increasing scale (Lab 1). Milestone: you can explain, with real numbers, exactly why brute force fails at scale.

**Week 2 -- ANN algorithm intuition.** Work through KD-tree, LSH, IVF, and HNSW conceptually; implement a minimal IVF index from scratch (Coding Question 2). Milestone: you can whiteboard IVF and HNSW's query-time walk from memory.

**Week 3 -- Real tuning and evaluation.** Do Lab 2 with FAISS: build exact and HNSW indexes over a real embedding dataset, sweep ef_search, and produce a recall-vs-latency curve. Milestone: you have a real chart proving the recall/latency tradeoff with your own numbers, not just theory.

**Week 4 -- Hybrid search and filtering.** Do Lab 3: add BM25 and reciprocal rank fusion, implement both pre- and post-filtering, and measure their behavior at different filter selectivities. Milestone: you can explain, with evidence, when post-filtering breaks down.

**Week 5-6 -- Production shape.** Do Lab 4: wrap it all in a monitored, health-checked, dockerized service with a scheduled recall@k job. Read the Production Usage, Deployment, and Security sections closely. Milestone: a containerized retrieval service on your GitHub with real observability.

**Week 7+ -- Go deep on one concrete system.** Pick one of **FAISS**, **Pinecone**, **Milvus**, **Weaviate**, **Qdrant**, or **Chroma** on this platform and go deep on its specific APIs, sharding model, and filtering support.

Then continue to **RAG** on this platform -- everything here becomes the retrieval backbone of that pipeline.
`,

  "official-docs": `
- [FAISS documentation](https://github.com/facebookresearch/faiss/wiki) -- the reference implementation's wiki; strong on index type tradeoffs and parameter tuning guidance.
- [HNSW paper (Malkov & Yashunin)](https://arxiv.org/abs/1603.09320) -- the original algorithm description; read once you're comfortable with the intuition, for the precise mechanics.
- [Product Quantization paper (Jegou, Douze, Schmid)](https://ieeexplore.ieee.org/document/5432202) -- the foundational compression technique underlying most large-scale ANN memory savings.
- [ANN-Benchmarks](https://ann-benchmarks.com/) -- a community-maintained, continuously updated benchmark comparing recall/latency/memory across major ANN libraries on standard datasets; the best place to sanity-check any specific library's current performance claims.
- Vector-database-specific docs: consult the official documentation of whichever system you adopt (FAISS, Pinecone, Milvus, Weaviate, Qdrant, Chroma) directly for current API and default-parameter specifics, since these evolve quickly.
`,

  books: `
- **Foundations of Multidimensional and Metric Data Structures** -- Hanan Samet. The definitive, comprehensive reference on spatial and metric indexing structures including KD-trees and their relatives; dense but authoritative.
- **Mining of Massive Datasets** -- Leskovec, Rajaraman, Ullman (free online). Excellent, accessible chapter on Locality-Sensitive Hashing with worked examples and proofs.
- **Introduction to Information Retrieval** -- Manning, Raghavan, Schutze (free online). The standard reference for BM25 and keyword retrieval, essential background for understanding why hybrid search matters.
- **Designing Data-Intensive Applications** -- Martin Kleppmann. Not vector-search-specific, but the best available treatment of the systems-engineering tradeoffs (sharding, replication, consistency) that apply directly to distributed vector search deployments.
- **Deep Learning** -- Goodfellow, Bengio, Courville (free online). Background on the embedding representations that vector search operates over; helpful context for why high-dimensional geometry behaves the way it does.
`,

  blogs: `
- **Pinecone's learning center / engineering blog** -- consistently strong, practically-oriented explainers on HNSW, IVF, PQ, and hybrid search, written for working engineers rather than researchers.
- **Qdrant's blog** -- detailed, benchmark-heavy posts on filtered-ANN and quantization tradeoffs.
- **Weaviate's blog** -- strong coverage of hybrid search design and real-world RAG retrieval architecture.
- **The FAISS wiki and GitHub discussions** -- not a traditional blog, but the highest-signal source for practical index-tuning advice from the library's own maintainers and its user community.
- **ANN-Benchmarks project write-ups** -- periodic posts explaining methodology changes and what current benchmark results actually mean, useful for interpreting any single library's claimed numbers critically.
`,

  "research-papers": `
This is a research-rich area with well-established foundational papers -- unlike some emerging topics, there is no need to hedge for lack of material:

- **"Efficient and Robust Approximate Nearest Neighbor Search Using Hierarchical Navigable Small World Graphs"** (Malkov & Yashunin, 2016/2018) -- the HNSW paper; essential reading once the intuition here is solid.
- **"Product Quantization for Nearest Neighbor Search"** (Jegou, Douze, Schmid, 2011) -- the foundational vector-compression paper underlying most large-scale ANN memory optimization.
- **"Similarity Search in High Dimensions via Hashing"** (Gionis, Indyk, Motwani, 1999) -- one of the original LSH papers, establishing the hashing-collision approach to approximate similarity search.
- **"Billion-Scale Similarity Search with GPUs"** (Johnson, Douze, Jegou, 2017) -- the FAISS team's paper on scaling ANN search to billions of vectors using GPU acceleration.
- **"DiskANN: Fast Accurate Billion-Point Nearest Neighbor Search on a Single Node"** (Subramanya et al., 2019) -- foundational work on disk-resident ANN indexes for memory-constrained, billion-scale search, referenced heavily in the Latest Updates section above.

If you want closer foundational reading on the geometry underlying why high-dimensional search is hard in the first place, the "curse of dimensionality" literature in classical computational geometry and statistics (e.g. work by Beyer, Goldstein, Ramakrishnan, and Shaft on "When is Nearest Neighbor Meaningful?", 1999) is an excellent, rigorous companion.
`,

  videos: `
- **Pinecone's "Vector Search" explainer series (YouTube)** -- clear, visually-driven walkthroughs of HNSW, IVF, and PQ intuition, well suited to reinforcing the concepts on this page.
- **James Briggs (YouTube)** -- extensive practical tutorials on FAISS, Pinecone, and vector search fundamentals with real code alongside intuition.
- **Yury Malkov's talks on HNSW** (conference recordings where available) -- the algorithm explained by its own author, useful once you've internalized the intuition and want the precise mechanics.
- **MLOps/vector-database conference talks** (e.g. from Qdrant, Weaviate, Milvus community events) -- frequently cover real production tradeoffs (filtering, sharding, quantization) with concrete benchmark numbers.
`,

  "github-repos": `
- [facebookresearch/faiss](https://github.com/facebookresearch/faiss) -- the reference ANN library; read the wiki and source for IVF/HNSW/PQ implementations side by side.
- [erikbern/ann-benchmarks](https://github.com/erikbern/ann-benchmarks) -- the standard cross-library ANN benchmarking framework; excellent for understanding how algorithms are actually compared.
- [spotify/annoy](https://github.com/spotify/annoy) -- the tree-based (random projection forest) ANN library from Spotify; instructive as a contrast to HNSW's graph-based approach.
- [nmslib/hnswlib](https://github.com/nmslib/hnswlib) -- a lightweight, widely used standalone HNSW implementation; good for reading a focused, single-algorithm codebase.
- [qdrant/qdrant](https://github.com/qdrant/qdrant) -- open-source vector database source, strong reference for filtered-ANN implementation details.
- [weaviate/weaviate](https://github.com/weaviate/weaviate) -- open-source vector database with strong hybrid-search implementation to study.
- [milvus-io/milvus](https://github.com/milvus-io/milvus) -- open-source, horizontally scalable vector database; good reference for distributed sharding architecture.
- [chroma-core/chroma](https://github.com/chroma-core/chroma) -- a simpler, more approachable vector database codebase, good for a first "read a real vector database" project.
- [pgvector/pgvector](https://github.com/pgvector/pgvector) -- vector search as a Postgres extension; instructive for seeing ANN indexing integrated into a general-purpose database.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Fundamentals*: implement brute-force k-NN for both cosine similarity and Euclidean distance; verify they can rank differently on the same data and explain why.
2. *Evaluation*: implement a recall@k function from scratch and use it to compare two different ANN configurations on the same dataset.
3. *IVF*: implement IVF from scratch (Coding Question 2); then experiment with varying nlist and nprobe and plot the resulting recall/latency curve.
4. *HNSW intuition*: without implementing the full algorithm, simulate a simplified 2-layer graph greedy walk on paper or in code over a small synthetic dataset, and trace exactly which nodes get visited.
5. *Quantization*: implement product quantization from scratch (as in Intermediate Concepts), measure the actual memory reduction and recall change on a real dataset at several compression levels.
6. *Hybrid search*: implement reciprocal rank fusion (Coding Question 3), then extend it with a weighting parameter and test how shifting the weight changes results on a mixed exact-match/semantic query set.
7. *Filtering*: implement both pre-filtering and post-filtering paths over a synthetic dataset with metadata, and measure result counts and recall degradation as filter selectivity varies from 50% down to 0.1%.
8. *Systems*: design (on paper) a sharding scheme for a billion-vector corpus across 20 machines, including how queries are routed, how results are merged, and how you'd handle one slow shard.

External sets: ANN-Benchmarks (run it yourself against multiple libraries on a standard dataset), Kaggle datasets with pre-computed embeddings (great for realistic-distribution practice rather than synthetic random vectors), and the official FAISS tutorials/notebooks for hands-on API practice.
`,

  "architecture-diagram": `
The reference production architecture for a vector-search-backed retrieval system -- the shape you'll build repeatedly across the **Vector Databases** category and the **RAG** skill:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile/agent)"] --> Gateway["API gateway / load balancer"]
    Gateway --> Svc1["Retrieval service pod 1"]
    Gateway --> Svc2["Retrieval service pod N"]
    Svc1 & Svc2 --> Emb["Embedding model API\n(query encoding)"]
    Svc1 & Svc2 --> VDB["Vector database\n(HNSW/IVF-PQ index, sharded + replicated)"]
    Svc1 & Svc2 --> BM25["Keyword/BM25 index\n(hybrid search signal)"]
    VDB --> Filter["Metadata filter / tenant isolation layer"]
    BM25 --> Fuse["Result fusion (e.g. reciprocal rank fusion)"]
    Filter --> Fuse
    Fuse --> Client
    subgraph Ingestion["Background ingestion pipeline"]
        Docs["New/updated documents"] --> Chunk["Chunking"]
        Chunk --> EmbBatch["Batch embedding"]
        EmbBatch --> Upsert["Upsert into vector DB + BM25 index"]
    end
    Ingestion -.writes.-> VDB
    Ingestion -.writes.-> BM25
    subgraph Ops["Operational jobs"]
        Rebuild["Scheduled/triggered index rebuild\n(blue-green swap)"]
        RecallJob["Nightly recall@k evaluation\nagainst ground-truth sample"]
    end
    Ops -.monitors/rebuilds.-> VDB
~~~

Every box has a dedicated skill or concrete implementation choice on this platform (see **Embeddings**, the **Vector Databases** category, and **RAG**); this diagram is the map of how they compose into one production retrieval system.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Vector Search))
    Problem
      Nearest-neighbor query
      Brute force O(n*d)
      Why it doesn't scale
    ANN algorithm families
      KD-trees
        Curse of dimensionality
      LSH
        Hashing collisions
      IVF
        Clustering
        nlist / nprobe
      HNSW
        Layered graph
        ef_search
      Product Quantization
        Codebooks
        Compression ratio
    The tradeoff triangle
      Recall
      Latency
      Memory
    Beyond pure similarity
      Hybrid search
        BM25
        Reciprocal rank fusion
      Filtering
        Pre-filter
        Post-filter
        Filtered ANN
    Evaluation
      Recall at k
      Benchmarking vs exact search
    Production
      Index build & rebuild
      Blue-green swaps
      Sharding
      Monitoring recall drift
      Security & tenant isolation
    Ecosystem
      Embeddings (prerequisite)
      FAISS
      Pinecone
      Milvus
      Weaviate
      Qdrant
      Chroma
      RAG (primary use case)
~~~
`,
};

export default vectorSearch;
