import type { CheatSheetData } from "./types";

const embeddings: CheatSheetData = {
  title: "The Ultimate Embeddings Cheat Sheet",
  subtitle: "Vector representations · similarity metrics · production retrieval pipeline",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Embedding", desc: "Dense, fixed-length vector representing meaning geometrically", code: "text -> model.encode(text) -> [0.12, -0.4, 0.9, ...]" },
        { term: "Distance = similarity", desc: "Close vectors mean semantically similar content", code: "embed('cat') is near embed('kitten')\nembed('cat') is far from embed('spreadsheet')" },
        { term: "One-hot encoding", desc: "Naive baseline: sparse, huge, zero similarity structure", code: "cat  = [1, 0, 0, 0]\ndog  = [0, 1, 0, 0]\ndot(cat, dog) = 0  # no relationship encoded" },
        { term: "Curse of dimensionality", desc: "One-hot vectors scale with vocab size, mostly wasted zeros", code: "vocab_size = 100000\none_hot_dims = 100000  # vs embedding_dims = 384" },
        { term: "king - man + woman ~= queen", desc: "Classic word2vec-era illustration; a hedge, not a modern guarantee", code: "result = king - man + woman\n# close to queen in STATIC word2vec space only" },
        { term: "Static vs contextual", desc: "word2vec: one vector per word. BERT+: vector depends on sentence", code: "static: bank -> always same vector\ncontextual: bank(river) != bank(loan)" },
        { term: "Dense vs sparse", desc: "Embeddings pack information into every dimension", code: "dense:  [0.3, -0.1, 0.8, ...]  # all informative\nsparse: [0, 0, 1, 0, 0, ...]   # one-hot, wasteful" },
      ],
    },
    {
      title: "How Embeddings Are Learned",
      color: "blue",
      rows: [
        { term: "word2vec (CBOW / Skip-gram)", desc: "Predict word from context or context from word", code: "context: 'the cat ___ on the mat'\ntarget: 'sat'  # learns via prediction task" },
        { term: "GloVe", desc: "Factorizes a global word-word co-occurrence matrix", code: "dot(vec_i, vec_j) ~= log(co_occurrence(i, j))" },
        { term: "FastText", desc: "Subword n-grams handle rare words and typos", code: "'running' -> 'run', 'nn', 'ing' subword pieces" },
        { term: "BERT hidden states", desc: "Transformer contextual vectors, repurposed (not optimal alone)", code: "hidden_states = bert(tokens)  # one vector per token" },
        { term: "Contrastive training", desc: "Pull similar pairs together, push dissimilar pairs apart", code: "loss: minimize dist(anchor, positive)\n      maximize dist(anchor, negative)" },
        { term: "Sentence-BERT (SBERT)", desc: "Siamese fine-tuning so pooled vectors compare directly", code: "SentenceTransformer('all-MiniLM-L6-v2')" },
        { term: "Distributional hypothesis", desc: "Words in similar contexts have similar meaning", code: "# 'You shall know a word by the company it keeps' - Firth 1957" },
      ],
    },
    {
      title: "Similarity Metrics",
      color: "emerald",
      rows: [
        { term: "Cosine similarity", desc: "Angle between vectors; scale-invariant; range -1 to 1", code: "cos_sim = dot(a, b) / (norm(a) * norm(b))" },
        { term: "Dot product", desc: "Equals cosine similarity IF vectors are normalized", code: "if normalized: dot(a, b) == cos_sim(a, b)" },
        { term: "Euclidean distance", desc: "Straight-line distance; smaller = more similar", code: "dist = norm(a - b)  # NOT a similarity, a distance" },
        { term: "L2 normalization", desc: "Scale vector to unit length before comparing", code: "unit_vec = v / norm(v)" },
        { term: "Which metric to use", desc: "Check the model docs; most text models want cosine", code: "sentence-transformers -> cosine (or normalized dot)\nFAISS L2 index -> Euclidean by default" },
        { term: "Similarity is not calibrated", desc: "0.75 from one model is not comparable to another model's 0.75", code: "# tune thresholds empirically PER model, per domain" },
      ],
    },
    {
      title: "Word vs Sentence Embeddings",
      color: "amber",
      rows: [
        { term: "Word embedding", desc: "One vector per token", code: "embed('cat') -> [384 numbers]" },
        { term: "Sentence embedding", desc: "One vector for a whole sentence/document", code: "embed('the cat sat on the mat') -> [384 numbers]" },
        { term: "Mean pooling", desc: "Average all token vectors (masking padding); most common", code: "sentence_vec = mean(token_vectors, axis=0)" },
        { term: "CLS pooling", desc: "Use the special summary token's vector", code: "sentence_vec = hidden_states[CLS_INDEX]\n# only good if model trained for it" },
        { term: "Max pooling", desc: "Elementwise max across token vectors; less common", code: "sentence_vec = max(token_vectors, axis=0)" },
        { term: "sentence-transformers encode", desc: "Dedicated model does pooling internally", code: "model = SentenceTransformer('all-MiniLM-L6-v2')\nvec = model.encode('hello world', normalize_embeddings=True)" },
        { term: "Multi-sentence batch", desc: "Always batch encode calls for throughput", code: "vecs = model.encode(list_of_texts, batch_size=32)" },
      ],
    },
    {
      title: "Advanced Topics",
      color: "rose",
      rows: [
        { term: "Dimensionality tradeoff", desc: "Higher dims: more nuance, more cost. Lower: cheaper, coarser", code: "384-dim  -> fast, cheap, good default\n1536-dim -> more nuance, costlier storage/search" },
        { term: "Matryoshka Representation Learning", desc: "Truncate a long embedding to fewer dims, still usable", code: "full_vec[:256]  # truncated prefix stays meaningful" },
        { term: "Quantization", desc: "int8 / binary storage cuts memory and speeds search", code: "float32 vector -> int8 vector  # ~4x smaller" },
        { term: "Anisotropy", desc: "Raw hidden states cluster in a narrow cone, inflating similarity", code: "# fix: use a model trained with contrastive objective" },
        { term: "Instruction-aware embeddings", desc: "Some models take a task prefix that changes the vector", code: "embed('query: refund policy')\nembed('document: our refund policy is...')" },
        { term: "Multimodal (CLIP-style)", desc: "Text and image encoders share one contrastively-trained space", code: "cos_sim(image_embed(photo), text_embed('a dog'))" },
        { term: "Embedding inversion risk", desc: "Vectors can sometimes be partially reconstructed to source text", code: "# treat sensitive-text embeddings like the original sensitive data" },
      ],
    },
    {
      title: "Worked Python Example",
      color: "cyan",
      rows: [
        { term: "Install", desc: "The standard open-source embedding library", code: "pip install sentence-transformers" },
        { term: "Load model", desc: "Small, fast, CPU-friendly default", code: "from sentence_transformers import SentenceTransformer\nmodel = SentenceTransformer('all-MiniLM-L6-v2')" },
        { term: "Encode text", desc: "Normalize so dot product equals cosine similarity", code: "vecs = model.encode(\n  ['a cat sat on the mat', 'a feline rested on the rug'],\n  normalize_embeddings=True)" },
        { term: "Compute similarity", desc: "Dot product on normalized vectors", code: "import numpy as np\nsim = float(np.dot(vecs[0], vecs[1]))" },
        { term: "Top-K nearest neighbor (brute force)", desc: "Rank a corpus by similarity to a query", code: "scores = [np.dot(query_vec, v) for v in corpus_vecs]\ntop_k = sorted(range(len(scores)), key=lambda i: -scores[i])[:5]" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "violet",
      rows: [
        { term: "Consistency rule", desc: "Same model + preprocessing for corpus AND query, always", code: "# #1 cause of bad retrieval: model/version mismatch" },
        { term: "Caching", desc: "Key by model version + exact text; never re-embed unchanged content", code: "key = f'emb:{model_name}:{sha256(text)}'" },
        { term: "Version tagging", desc: "Tag every stored vector with its embedding model version", code: "{'vector': [...], 'model_version': 'bge-base-en-v1.5'}" },
        { term: "Re-embedding migration", desc: "Model upgrade = re-embed whole corpus; use blue-green cutover", code: "new_collection = embed_all(docs, new_model)\n# cut traffic over once validated" },
        { term: "Chunking", desc: "Split long docs before embedding; don't embed whole documents", code: "chunks = split_by_paragraph(document, max_tokens=256)" },
        { term: "Batch calls", desc: "Batch embedding requests for throughput and lower cost", code: "model.encode(texts, batch_size=64)" },
        { term: "Where vectors are stored", desc: "Vector databases handle indexing/search at scale", code: "# FAISS (library) / Pinecone / Weaviate / Qdrant / Chroma / Milvus" },
        { term: "Next skill", desc: "Approximate nearest-neighbor search over millions of vectors", code: "# see the Vector Search skill" },
        { term: "Primary production use case", desc: "Retrieve relevant chunks before generating an LLM answer", code: "# see the RAG skill" },
      ],
    },
  ],
};

export default embeddings;
