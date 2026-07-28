import type { SkillContent } from "../types";

/**
 * Embeddings — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const embeddings: SkillContent = {
  overview: `
An embedding is a dense, fixed-length vector of real numbers that represents a piece of discrete or high-dimensional data — a word, a sentence, an image, a user, a product, a graph node — in a continuous vector space, chosen so that geometric distance in that space corresponds to semantic similarity in the original data. Two sentences that mean similar things end up as two points that sit close together; two unrelated sentences end up far apart. That single property — "meaning becomes measurable geometry" — is the reason embeddings are the load-bearing wall underneath modern search, recommendation, classification, clustering, and retrieval-augmented generation.

For an AI engineer, embeddings are not a niche topic; they are the connective tissue between raw human data (text, images, audio) and every downstream numerical system that needs to compare, rank, cluster, or retrieve that data. Every RAG pipeline, every semantic search box, every "find similar items" feature, and every modern recommendation system starts by turning content into embeddings. The **Vector Search** skill covers how you efficiently query these vectors at scale, the **Vector Databases** category (FAISS, Pinecone, Weaviate, Qdrant, Chroma, Milvus) covers where you store and index them in production, and the **RAG** skill covers the single most common production use case: retrieving relevant chunks of a knowledge base by embedding similarity before generating an answer.

Key characteristics: embeddings are dense (every dimension typically holds a non-zero, information-bearing value, unlike sparse one-hot vectors), fixed-dimensional (a 384-, 768-, or 1536-dimensional vector regardless of input length, achieved through the model's architecture and pooling), learned (not hand-designed — the geometry emerges from training on data, usually via a neural network's internal representations), and comparable (cosine similarity, dot product, or Euclidean distance between two embeddings is a meaningful proxy for semantic similarity between the two original pieces of content). Modern embeddings are almost always a byproduct or explicit output of a neural network — either a repurposed hidden layer of a language model, or a model trained specifically to produce good embeddings (a "sentence-embedding" or "bi-encoder" model, and in the multimodal case, a joint text-image encoder like CLIP).
`,

  history: `
The idea of representing meaning as a point in space is older than deep learning — it traces back to **distributional semantics** and the linguistic principle "you shall know a word by the company it keeps" (J.R. Firth, 1957). The practical, learnable version of that idea took decades to mature into what we call embeddings today.

| Year | Milestone |
|------|-----------|
| 1957 | Firth's distributional hypothesis: word meaning derives from co-occurrence context |
| 1990 | Latent Semantic Analysis (LSA) — matrix factorization over term-document co-occurrence counts produces early dense "semantic" vectors |
| 2003 | Bengio et al.'s neural probabilistic language model — the first neural network to learn word vectors as part of language modeling |
| 2013 | **word2vec** (Mikolov et al., Google) — CBOW and Skip-gram; the first embedding method fast and simple enough for mainstream adoption; popularized the "king - man + woman ≈ queen" style analogy |
| 2014 | **GloVe** (Pennington et al., Stanford) — global co-occurrence matrix factorization; competitive with word2vec, trained differently |
| 2014 | **doc2vec / paragraph vectors** — extending word2vec's idea to variable-length documents |
| 2017 | **FastText** (Facebook) — subword-aware embeddings that handle rare words and typos via character n-grams |
| 2018 | **ELMo** (Peters et al.) — contextual embeddings: the same word gets a different vector depending on its sentence, via a bidirectional LSTM |
| 2018 | **BERT** (Devlin et al., Google) — transformer-based contextual embeddings become the new standard; hidden states are routinely reused as embeddings |
| 2019 | **Sentence-BERT / SBERT** (Reimers & Gurevych) — fine-tunes BERT with a siamese/triplet objective specifically so pooled sentence vectors are directly comparable with cosine similarity, at a fraction of BERT's cross-encoder cost |
| 2021 | **CLIP** (Radford et al., OpenAI) — contrastive training aligns image and text encoders into one shared embedding space, launching practical multimodal embeddings |
| 2022+ | OpenAI, Cohere, Google, and open-source (BGE, GTE, E5, Nomic) all ship dedicated text-embedding APIs/models as a first-class product, decoupled from any generative model |
| 2023–2025 | Embedding models grow instruction-awareness (task-specific prompts change the vector), support longer context windows, and adopt Matryoshka representation learning so one embedding can be truncated to smaller sizes without retraining |

The throughline: embeddings started as a side effect of trying to model language probability (Bengio, word2vec), then became an engineering discipline of their own once people realized the vectors were independently useful for search, clustering, and recommendation — long before "RAG" existed as a term.
`,

  "why-it-exists": `
Before embeddings, computers represented discrete symbols — words, categories, IDs — as arbitrary, meaningless tokens. A word was either an index into a vocabulary list or a one-hot vector: a vector of all zeros with a single 1 at that word's position. Under that representation, "cat" and "dog" are exactly as similar as "cat" and "spreadsheet" — mathematically orthogonal, zero relationship, even though humans immediately sense that cats and dogs are more alike than cats and spreadsheets.

That gap — discrete symbols carry no notion of similarity — blocked an enormous amount of what we now take for granted:

- **Search** could only match exact keywords, not meaning. A search for "puppy training tips" would miss a document titled "how to teach your dog," because the words don't overlap.
- **Generalization** was crippled. A model trained on "the movie was great" had to learn "the film was great" as if it were a completely unrelated sentence, because "movie" and "film" were unrelated one-hot vectors.
- **Comparison and clustering** of text, images, or categories had no natural numeric distance function to use.

Embeddings exist to close that gap: learn a mapping from discrete/symbolic input to a continuous vector space where distance is meaningful, so that everything downstream — search, clustering, classification, recommendation, retrieval — can use simple, fast, well-understood vector math (dot products, cosine similarity, nearest-neighbor search) instead of brittle string matching or hand-built synonym dictionaries.
`,

  "problem-it-solves": `
Embeddings concretely remove:

- **The synonymy/polysemy problem**: "car" and "automobile" land near each other in embedding space even though they share no characters; a well-trained contextual model also gives "bank" (river) and "bank" (finance) different vectors depending on context.
- **The curse of dimensionality from one-hot encoding**: a vocabulary of 100,000 words as one-hot vectors is 100,000 dimensions of almost entirely wasted, uninformative space (detailed in Beginner Concepts).
- **Manual feature engineering for text/image similarity**: pre-embedding systems needed hand-built rules (stemming, synonym lists, TF-IDF weighting) to approximate similarity; embeddings learn a much richer notion of similarity directly from data.
- **The cross-modal gap**: multimodal embeddings (CLIP-style) let you compare a text query against an image directly, something no symbolic representation could do at all.
- **The retrieval bottleneck for LLMs**: a language model's context window is finite and its parametric knowledge is frozen at training time; embeddings let you index an unbounded external corpus and pull in only the most relevant pieces at query time (the foundation of RAG).

What embeddings deliberately do **not** solve:

- **Perfect, precise, symbolic reasoning.** Embedding similarity is a statistical proxy for relatedness, not logical entailment — two vectors being close does not guarantee one fact implies another.
- **Exact keyword/legal/compliance matching.** If you need to guarantee an exact phrase match (a legal citation, an exact product SKU), embeddings alone are the wrong tool; hybrid search (combining embeddings with keyword/BM25 search) is the standard fix, discussed in the Vector Search skill.
- **Explaining WHY two things are similar.** Embeddings are opaque; a 0.87 cosine similarity score does not tell you which shared concept drove it.
- **Stability across model versions.** Embeddings from one model version are not compatible with another — this drives the re-embedding problem covered in Production Usage.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely what an embedding is and why geometric distance in embedding space corresponds to semantic similarity.
2. Contrast one-hot encoding with dense embeddings and articulate the curse-of-dimensionality and no-similarity-structure problems one-hot solves for.
3. Describe how word2vec, GloVe, and modern neural embedding models learn their vector spaces, including the co-occurrence intuition and the contrastive/objective-based training used today.
4. Distinguish word embeddings from sentence/document embeddings, including pooling strategies (mean, CLS-token, max) and dedicated sentence-embedding models.
5. Choose the correct similarity metric (cosine similarity, dot product, Euclidean distance) for a given embedding model and normalization scheme, and justify the choice.
6. Write working Python code that embeds text with a sentence-transformer-style model and computes similarity between sentences.
7. Reason about embedding dimensionality tradeoffs — quality, storage, latency — and apply techniques like Matryoshka truncation or quantization when appropriate.
8. Describe multimodal embeddings (CLIP-style) at an appropriately hedged level of confidence, including what "shared embedding space" means mechanically.
9. Design a production embedding pipeline: model selection, caching, versioning, and the re-embedding problem when a model changes.
10. Connect embeddings to the systems built on top of them — Vector Search, Vector Databases (FAISS/Pinecone/Weaviate/Qdrant/Chroma/Milvus), and RAG — and know which skill to reach for next.
`,

  prerequisites: `
- **Required**: comfort with vectors and basic linear algebra (dot products, vector norms, dimensionality) — nothing beyond high-school-plus level is assumed; this page re-derives what it needs. Basic Python.
- **Helpful**: the **Machine Learning** skill (what "training a model" means, loss functions, gradient descent) and the **Neural Networks** skill (what a hidden layer/activation is) make the "learned representation" story click faster.
- **Helpful, not required**: the **Transformers** and **Attention** skills deepen the internal-working section on how modern contextual embeddings are produced, since most current embedding models are transformer encoders.
- **For production sections**: basic familiarity with running a Python script and installing a package (pip/uv) is assumed.

Dependency map on this platform: **Machine Learning** → **Neural Networks** → **Transformers** / **Attention** → **Embeddings** (this page) → **Vector Search** → **Vector Databases** (FAISS/Pinecone/Weaviate/Qdrant/Chroma/Milvus) → **RAG**. Embeddings sit at the hinge between "how models represent meaning" and "how systems retrieve meaning at scale."
`,

  "beginner-concepts": `
### What a vector representation actually is

An embedding is just a list of numbers — a vector — assigned to a piece of data. If "cat" is represented as [0.12, -0.44, 0.90, ...] (say, 300 numbers), that list is the cat embedding. The magic is not the list itself; it's that the training process places these lists in space so that related things end up near each other and unrelated things end up far apart.

~~~python
# A toy embedding space with only 2 dimensions, for intuition.
# Real embeddings have 300-3072+ dimensions; 2D is only for visualization.
word_vectors = {
    "cat":   [0.9, 0.8],
    "dog":   [0.85, 0.75],   # close to "cat" — both are pets
    "kitten": [0.95, 0.7],   # close to "cat" — related concept
    "car":   [-0.8, 0.1],    # far from "cat" — unrelated
    "truck": [-0.75, 0.15],  # close to "car" — both are vehicles
}
~~~

Plot those five points on paper: cat/dog/kitten cluster in one corner, car/truck cluster in another. That clustering is not hand-designed — a good embedding model produces it automatically because it learned that cats, dogs, and kittens tend to appear in similar contexts, and so do cars and trucks.

### One-hot encoding — the naive baseline

Before embeddings, the standard way to represent a word for a machine learning model was **one-hot encoding**: pick a vocabulary size V, and represent word i as a vector of length V that is all zeros except a single 1 at position i.

~~~python
vocab = ["cat", "dog", "car", "truck"]
# one-hot: a vector as long as the vocabulary, one 1, rest zeros
one_hot = {
    "cat":   [1, 0, 0, 0],
    "dog":   [0, 1, 0, 0],
    "car":   [0, 0, 1, 0],
    "truck": [0, 0, 0, 1],
}

# Every pair of DIFFERENT words is equally "different":
import math
def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

dot(one_hot["cat"], one_hot["dog"])   # 0 — no relationship encoded
dot(one_hot["cat"], one_hot["car"])   # 0 — identical score, even though
                                       # cat/dog are intuitively more related
~~~

One-hot encoding has two fatal problems for anything beyond toy vocabularies:

1. **Curse of dimensionality.** A realistic vocabulary has 30,000-100,000+ words (and grows further for subword tokenizers, character n-grams, or a catalog of millions of products/users). A one-hot vector for each item is that many dimensions, almost entirely zeros — enormous memory for essentially no information per dimension, and distances between one-hot vectors become uniform and uninformative (every pair of distinct items is equally "far apart" under any standard metric).
2. **No similarity structure.** Because every one-hot vector is orthogonal to every other, there is no way for a downstream model to know that "cat" and "kitten" are related unless it is explicitly told, or unless it sees enough examples to learn the relationship from scratch every time — none of the vector geometry helps.

### The core intuition: word2vec-style analogies

The classic illustration of what a good embedding space captures is the analogy: king − man + woman ≈ queen. Take the embedding vector for "king," subtract the vector for "man," add the vector for "woman," and the resulting point lands close to the embedding for "queen."

~~~python
# Conceptual illustration only — not a runnable model, just vector arithmetic
# to show WHAT the geometry captures, using illustrative (not real) numbers.
king  = [0.50, 0.90, 0.10]
man   = [0.48, 0.10, 0.05]
woman = [0.46, 0.12, 0.85]
queen = [0.52, 0.88, 0.80]   # empirically close to king - man + woman

result = [k - m + w for k, m, w in zip(king, man, woman)]
# result ≈ [0.48, 0.92, 0.90] — close to the actual "queen" vector
~~~

The honest framing matters here: this analogy result was a genuinely striking finding from the original word2vec paper (Mikolov et al., 2013), and it is a useful teaching device for the idea that embedding spaces capture directions corresponding to relationships (like "gender" or "royalty") as roughly linear, additive structure. But treat it as an **illustrative simplification**, not a precise description of how modern embeddings behave:

- It worked cleanly for a small, curated set of examples in a specific, older, static (non-contextual) word2vec-style model trained on a particular corpus. It does not hold with the same crispness for arbitrary word quadruples, and it is noticeably less clean or reliable for many other analogies.
- Modern embeddings (BERT-style, sentence-transformers, and current commercial embedding APIs) are **contextual** — a word's vector depends on the sentence it appears in — so "the word king's vector" is not even a single fixed thing anymore; the tidy linear-analogy story from 2013 does not transfer directly.
- Later research also showed some of the original analogy demonstrations were sensitive to how the "closest vector" search excluded the input words themselves, which makes the effect look cleaner than the raw geometry actually is.

Use the analogy to build intuition for "embedding spaces encode relationships as directions," not as a literal claim about how today's models compute or guarantee analogies.

### A tiny end-to-end feel with real code

~~~python
# pip install sentence-transformers
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # small, fast, 384-dim
vectors = model.encode(["cat", "kitten", "spreadsheet"])

print(vectors.shape)          # (3, 384) — 3 words, 384 numbers each
print(vectors[0][:5])         # first 5 numbers of "cat"'s embedding
~~~

Every one of those 384 numbers is meaningless in isolation; the model learned all 384 jointly so that the *whole vector*, compared to another whole vector, reflects meaning.
`,

  "intermediate-concepts": `
### How embeddings are actually learned: co-occurrence-based methods

The historically foundational approach — word2vec (2013) — learns embeddings from a simple, self-supervised task: predict a word from its surrounding context (Continuous Bag of Words, CBOW) or predict the surrounding context from a word (Skip-gram). No labels are needed; the "supervision" comes free from the structure of raw text.

~~~python
# Conceptual sketch of the Skip-gram training signal (not a full implementation)
# Sentence: "the cat sat on the mat"
# For target word "sat" with window size 2, the training pairs are:
training_pairs = [
    ("sat", "the"), ("sat", "cat"),   # words before "sat"
    ("sat", "on"),  ("sat", "the"),   # words after "sat"
]
# The model is trained so that the embedding of "sat" is a good predictor
# of these context words. Words that appear in similar contexts (e.g. "sat"
# and "stood") end up with similar embeddings, because they are trained to
# predict similar context distributions.
~~~

GloVe (2014) takes a related but distinct route: instead of a sliding-window prediction task, it explicitly builds a global word-word co-occurrence count matrix across the whole corpus and factorizes it so that the dot product of two word vectors approximates the log of how often those words co-occur. Both word2vec and GloVe rest on the same underlying idea — the **distributional hypothesis**: words that occur in similar contexts tend to have similar meaning — they just optimize for it differently (local prediction windows vs. global co-occurrence statistics).

### How embeddings are learned today: a byproduct of large models

Modern embeddings mostly come from one of two places:

1. **A hidden layer of a large trained model, repurposed.** Train a transformer language model (like BERT) on a huge text corpus with a task like masked-language-modeling; afterward, the internal hidden-layer activations for a token or sequence turn out to be excellent general-purpose embeddings, even though the model was never explicitly told "produce good embeddings" — it emerges as a side effect of learning to model language well.
2. **A dedicated embedding model, trained for the specific job.** Models like Sentence-BERT, OpenAI's text-embedding-3, Cohere's embed models, and open models like BGE/E5/GTE/Nomic are explicitly fine-tuned with a **contrastive objective**: pull embeddings of semantically similar pairs (a question and its correct answer, two paraphrases) close together, and push embeddings of dissimilar pairs apart. This direct optimization is why dedicated embedding models beat "just grab BERT's hidden state" for retrieval-style tasks.

~~~python
# Conceptual sketch of a contrastive training step (not runnable — illustrative)
# anchor: "How do I reset my password?"
# positive: "Steps to change your account password" (semantically same intent)
# negative: "How do I cancel my subscription?" (different intent)
#
# loss pushes:
#   distance(embed(anchor), embed(positive))  -> smaller
#   distance(embed(anchor), embed(negative))  -> larger
~~~

### Word embeddings vs. sentence/document embeddings

A word embedding gives you one vector per token. But most production use cases (search, RAG, deduplication) need a vector for a whole sentence, paragraph, or document. Two broad strategies bridge that gap:

1. **Pooling word/token embeddings.** Run text through a model that outputs one vector per token, then combine them into a single vector:
   - **Mean pooling**: average all token vectors (often masking out padding tokens). Simple, and — for many sentence-transformer models — the officially recommended and best-performing pooling strategy.
   - **CLS-token pooling**: use the vector of a special classification token (BERT's [CLS]) that the model was trained to summarize the whole sequence into. Works well only if the model was actually trained with a CLS-based objective (e.g. via classification fine-tuning); a raw, non-fine-tuned BERT's CLS token is a mediocre sentence embedding.
   - **Max pooling**: take the elementwise maximum across token vectors; less common, sometimes used for capturing the strongest signal per dimension.
2. **Dedicated sentence-embedding models.** Rather than pooling a general-purpose language model's output, use a model trained end-to-end so that its single output vector for a whole sentence is directly optimized for similarity comparison — this is exactly what Sentence-BERT (SBERT) and today's commercial/open embedding models (OpenAI text-embedding-3, Cohere embed-v3, BGE, E5) are for. In practice, almost all production text-embedding work in 2026 uses one of these dedicated models rather than manually pooling a base language model.

~~~python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
sentence_vec = model.encode("The quick brown fox jumps over the lazy dog.")
print(sentence_vec.shape)   # (384,) — ONE vector for the whole sentence,
                             # regardless of how many words it contains
~~~

### Similarity metrics — cosine, dot product, Euclidean

Once you have two embedding vectors, you need a number that says "how similar." Three metrics dominate:

~~~python
import numpy as np

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Angle between vectors, ignoring magnitude. Range: -1 to 1."""
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def dot_product(a: np.ndarray, b: np.ndarray) -> float:
    """Raw dot product — sensitive to vector magnitude, not just direction."""
    return float(np.dot(a, b))

def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Straight-line distance. Smaller = more similar (it is a DISTANCE, not similarity)."""
    return float(np.linalg.norm(a - b))
~~~

When to use which:

- **Cosine similarity** is the default choice for most text embedding models. It measures only the direction of the vectors, ignoring their length, which matters because many models produce embeddings whose magnitude carries little semantic information (only direction encodes meaning). It is also scale-invariant, so it behaves consistently regardless of how "long" documents make their vectors.
- **Dot product** is mathematically equivalent to cosine similarity when both vectors are L2-normalized (unit length) — and normalizing embeddings, then using dot product, is exactly how most vector databases implement "cosine similarity search" internally, because a plain dot product is cheaper to compute at scale than repeatedly recomputing norms. If a model's embeddings are NOT normalized, raw dot product also implicitly rewards longer/larger-magnitude vectors, which can distort results.
- **Euclidean (L2) distance** measures absolute distance in space, factoring in magnitude directly. It is the natural choice when magnitude itself is meaningful (e.g. some clustering algorithms, or embeddings explicitly trained under an L2 objective), and it is what FAISS's default "L2" index type computes. For normalized vectors, ranking by Euclidean distance and ranking by cosine similarity produce the *same order* of results, so the choice is often about implementation convenience rather than a difference in outcome.

Rule of thumb: check what your embedding model's documentation recommends (most sentence-transformer and commercial embedding APIs explicitly say "use cosine similarity" or "vectors are normalized, use dot product") and match it — mismatching metrics against how a model was trained silently degrades retrieval quality.

### Worked example: embedding and comparing text

~~~python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

sentences = [
    "The cat sat on the mat.",
    "A feline rested on the rug.",       # paraphrase of sentence 1
    "The stock market fell sharply today.",  # unrelated topic
]

embeddings = model.encode(sentences, normalize_embeddings=True)  # unit-length vectors

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    # Vectors are already normalized, so dot product == cosine similarity
    return float(np.dot(a, b))

sim_paraphrase = cosine_similarity(embeddings[0], embeddings[1])
sim_unrelated = cosine_similarity(embeddings[0], embeddings[2])

print(f"cat/feline similarity:   {sim_paraphrase:.3f}")   # high, e.g. ~0.7-0.8
print(f"cat/stock similarity:    {sim_unrelated:.3f}")    # low, e.g. ~0.05-0.2
~~~

This is the entire mechanical core of semantic search: embed a query the same way you embedded your documents, then rank documents by similarity to the query vector.
`,

  "advanced-concepts": `
### Embedding dimensionality tradeoffs

Dimensionality (384, 768, 1024, 1536, 3072...) is a knob, not a free lunch:

| Higher dimensionality | Lower dimensionality |
|---|---|
| Captures more nuance and more independent "concepts" simultaneously | Captures coarser, more compressed semantics |
| Larger storage footprint (a 3072-dim float32 vector is 12KB; a 384-dim one is ~1.5KB) | Cheaper storage, more vectors per unit of RAM/disk |
| Slower similarity computation and index build/search at scale | Faster search — fewer FLOPs per comparison |
| Often (not always) modestly better retrieval accuracy on benchmarks like MTEB | Often "good enough" for many production workloads, at a fraction of the cost |

Two production techniques address this tradeoff directly instead of forcing an all-or-nothing choice:

1. **Matryoshka Representation Learning (MRL)**: some modern embedding models (OpenAI's text-embedding-3 family, several open models) are trained so that truncating the vector to a shorter prefix (e.g. keeping only the first 256 of 1536 dimensions) still yields a usable, meaningfully-ordered embedding, with graceful quality degradation rather than a cliff. This lets one model serve multiple storage/latency budgets without retraining or re-embedding from scratch.
2. **Quantization**: storing each dimension in fewer bits (int8, or even binary 1-bit embeddings) trades a small accuracy hit for large memory and speed wins at index-serving time — heavily used inside vector databases at scale (see the Vector Databases skills for index-specific quantization schemes like FAISS's PQ/IVF-PQ).

### Instruction-aware and task-specific embeddings

Several modern embedding models accept a task instruction alongside the text (e.g. "represent this for retrieval" vs. "represent this for clustering"), producing a different vector for the same text depending on the declared task. This closes a real gap: the ideal vector for "find documents relevant to this query" is not necessarily the ideal vector for "cluster these documents by topic," even for identical input text. Getting the instruction prefix right (per the specific model's documentation) is now a real production tuning lever, not a cosmetic detail.

### Multimodal embeddings

CLIP-style models (contrastive language-image pretraining) train an image encoder and a text encoder jointly, with a contrastive loss that pulls a caption's embedding close to its matching image's embedding, and pushes it away from mismatched pairs — the net effect is a **shared embedding space** where images and text descriptions of the same concept land near each other, even though they come from completely different modalities and different encoder architectures.

~~~python
# Conceptual, illustrative usage of a CLIP-style model (API shape varies by library)
# from transformers import CLIPModel, CLIPProcessor
#
# image_embedding = clip_model.get_image_features(processed_image)
# text_embedding  = clip_model.get_text_features(processed_text)
# similarity = cosine_similarity(image_embedding, text_embedding)
# A photo of a golden retriever should score high against the text
# "a dog playing in a park" and low against "a bowl of pasta."
~~~

Treat multimodal embeddings with an honest hedge: the shared space is approximate and trained on the pairs available at training time (often web-scraped image-caption pairs), so it inherits whatever biases and coverage gaps that data has, and cross-modal similarity scores are not on the exact same numeric scale as pure text-text or pure image-image similarity — comparing across modalities is genuinely useful (image search by text query, zero-shot image classification) but should be validated empirically for your specific use case rather than assumed to behave identically to unimodal embeddings.

### Anisotropy and the geometry of embedding spaces

A known, senior-level nuance: raw transformer hidden states (and even some sentence embeddings) can suffer from **anisotropy** — embeddings clustering into a narrow cone of the vector space rather than spreading isotropically in all directions, which inflates baseline cosine similarity between almost any two vectors and compresses the useful signal. This is part of why dedicated sentence-embedding models apply specific training objectives (contrastive loss, sometimes an explicit whitening/normalization post-processing step) rather than just pooling a raw language model's hidden states — the training is partly about fixing this geometric pathology, not only about "learning meaning" in the abstract.

### Decision table: which embedding approach for which job

| Situation | Recommended approach |
|---|---|
| Short-text semantic search / RAG chunk retrieval | Dedicated sentence-embedding model (SBERT-family, OpenAI/Cohere/BGE), cosine similarity |
| Word-level analogy/similarity research or a lightweight offline NLP feature | Classic word2vec/GloVe/FastText, still fast and dependency-light |
| Cross-modal search (text-to-image, image-to-text) | CLIP-style joint embedding model |
| Extremely tight storage/latency budget at huge scale | Matryoshka-capable model truncated to fewer dims, plus int8/binary quantization |
| Domain-specific jargon (legal, medical, code) | Fine-tune or select a domain-adapted embedding model; generic models under-perform on specialized vocabulary |
`,

  "internal-working": `
Under the hood, producing a text embedding with a modern transformer-based model is a multi-stage pipeline. Trace it step by step:

~~~mermaid
flowchart LR
    A["Raw text input"] --> B["Tokenizer\n(subword tokens, e.g. BPE/WordPiece)"]
    B --> C["Token IDs + positional info"]
    C --> D["Transformer encoder layers\n(self-attention + feed-forward, stacked)"]
    D --> E["Per-token hidden state vectors"]
    E --> F["Pooling\n(mean / CLS / max)"]
    F --> G["Optional: L2 normalization"]
    G --> H["Final fixed-length embedding vector"]
~~~

1. **Tokenization.** The input string is split into subword tokens using a tokenizer trained on a large text corpus (see the Transformers skill for BPE/WordPiece details). "Embeddings" might become tokens like "Em", "bed", "dings" — this handles rare/unseen words gracefully by falling back to smaller known pieces.
2. **Token IDs and positions.** Each token maps to an integer ID, looked up in a learned **token embedding table** (yes — the very first step inside a transformer is itself an embedding lookup: an ID becomes an initial vector). Positional information is added so the model knows word order.
3. **Transformer encoder layers.** Stacked self-attention and feed-forward blocks (see the Attention and Transformers skills) let every token's representation be updated based on every other token in the sequence — this is what makes the resulting vectors **contextual**: the vector for "bank" differs depending on whether nearby tokens are "river" or "loan."
4. **Per-token hidden states.** After the final layer, you have one vector per input token, each now saturated with contextual information from the whole sequence.
5. **Pooling.** Because most applications need one vector per sentence/document rather than one per token, the per-token vectors are combined — most commonly by mean pooling (averaging all non-padding token vectors) or by taking a designated summary token's vector.
6. **Normalization.** Many models L2-normalize the final vector (scale it to unit length) so that cosine similarity and dot product become interchangeable and so that similarity scores are comparable across different pieces of text regardless of length.

The final output is a single, fixed-length array of floats — the embedding — that can now be compared against any other embedding produced the same way, stored in an index, or fed into a downstream model.
`,

  architecture: `
Two architectural questions matter for engineers working with embeddings: how the **embedding model itself** is structured internally, and how an **application** should be structured around the embed-store-search pattern.

### Embedding model architecture family tree

~~~mermaid
flowchart TB
    subgraph Classic["Classic (static, non-contextual)"]
        W2V["word2vec (CBOW / Skip-gram)"]
        GloVe["GloVe (co-occurrence factorization)"]
        FastText["FastText (subword-aware)"]
    end
    subgraph Contextual["Contextual (transformer-based)"]
        BERT["BERT-family hidden states"]
        SBERT["Sentence-BERT / SBERT (siamese fine-tuning)"]
        Commercial["Commercial APIs: OpenAI, Cohere\nOpen: BGE, E5, GTE, Nomic"]
    end
    subgraph Multimodal
        CLIP["CLIP-style joint text-image encoders"]
    end
    Classic -.-> Contextual
    Contextual -.-> Multimodal
~~~

Static embeddings (word2vec, GloVe) assign one fixed vector per word regardless of context. Contextual embeddings (BERT and beyond) compute a different vector for the same word depending on surrounding text, and dedicated sentence-embedding models further fine-tune contextual models so pooled sentence vectors are directly comparable. Multimodal models extend the same contrastive-training idea across modalities.

### Application architecture: where embeddings sit in a production system

~~~text
ingestion/
├── loaders/            # pull raw docs: PDFs, web pages, DB rows, tickets
├── chunkers/            # split long documents into embedding-sized pieces
├── embedder/            # calls the embedding model (batched, cached, retried)
└── indexer/             # writes vectors + metadata into a vector database

query time/
├── query_embedder/      # embeds the incoming user query with the SAME model
├── vector_search/        # nearest-neighbor lookup (see Vector Search skill)
└── reranker (optional)/ # cross-encoder re-scores top-K candidates precisely
~~~

The critical architectural rule: the same embedding model and the same preprocessing (tokenization, truncation, normalization) must be used for both the corpus at index time and the query at search time — the vectors only compare meaningfully if they were produced identically. This single rule is the root cause of most "search returns bad results" bugs, and it is why embedding model changes cascade into a full corpus re-embed (see Production Usage).
`,

  "data-flow": `
Trace one query end-to-end through an embedding-and-retrieval pipeline — the exact flow underlying a RAG system or a semantic search box:

~~~mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant EmbedModel as Embedding Model
    participant VDB as Vector Database

    Note over App,VDB: Offline / ingestion time (happens once per document)
    App->>App: Load and chunk source documents
    App->>EmbedModel: encode(chunk_text) for each chunk
    EmbedModel-->>App: dense vector per chunk
    App->>VDB: upsert(vector, metadata, chunk_id)

    Note over User,VDB: Online / query time (happens per user request)
    User->>App: "What is the refund policy?"
    App->>EmbedModel: encode(query_text) — SAME model as ingestion
    EmbedModel-->>App: query vector
    App->>VDB: nearest_neighbors(query_vector, top_k=5)
    VDB-->>App: top-5 chunk_ids + similarity scores
    App->>App: fetch chunk text by chunk_id, assemble context
    App-->>User: (in RAG) pass context + query to an LLM for the final answer
~~~

The text starts as raw characters, becomes tokens, flows through the embedding model's layers into a single dense vector, and lands as one point in a high-dimensional space alongside every previously embedded chunk. Similarity search (covered in depth in the Vector Search skill) then reduces to "which stored points are geometrically nearest to this query point" — an approximate nearest-neighbor problem that vector databases like FAISS, Pinecone, Weaviate, Qdrant, Chroma, and Milvus are purpose-built to answer at low latency over millions or billions of vectors. Everything downstream of "compute a vector" — indexing structures, filtering by metadata, hybrid keyword+vector search, reranking — is the subject of the Vector Search and Vector Databases skills; embeddings are the input that makes all of it possible.
`,

  "production-usage": `
### Choosing an embedding model

Real teams pick embedding models along a few concrete axes: retrieval quality on benchmarks relevant to their domain (MTEB — Massive Text Embedding Benchmark — is the standard public leaderboard, though always validate on your own data), dimensionality and cost (API-priced commercial models charge per token embedded), latency (self-hosted small models like all-MiniLM-L6-v2 embed in milliseconds; large commercial models add network round-trip time), context window (how much text one call can embed at once), and licensing (open-weights models can be self-hosted and fine-tuned; commercial APIs cannot).

~~~python
# Typical production embedding call pattern (illustrative; API shapes vary)
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-base-en-v1.5")  # a strong open model

def embed_batch(texts: list[str]) -> list[list[float]]:
    """Batch embedding — always batch; per-item calls waste GPU/CPU throughput."""
    vectors = model.encode(
        texts,
        batch_size=32,
        normalize_embeddings=True,   # match the model's recommended metric
        show_progress_bar=False,
    )
    return vectors.tolist()
~~~

### Caching

Embedding computation is not free — API calls cost money and add latency; even local models cost CPU/GPU time. Production systems cache embeddings keyed by (model version, exact input text) so identical content is never re-embedded, and invalidate the cache whenever the model version changes.

~~~python
import hashlib
import json

def cache_key(model_name: str, text: str) -> str:
    """Stable cache key — include the model name so switching models
    doesn't silently reuse stale vectors under the same key."""
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"emb:{model_name}:{digest}"

def get_or_embed(cache, model, model_name: str, text: str) -> list[float]:
    key = cache_key(model_name, text)
    cached = cache.get(key)
    if cached is not None:
        return json.loads(cached)
    vector = model.encode(text, normalize_embeddings=True).tolist()
    cache.set(key, json.dumps(vector), ex=60 * 60 * 24 * 30)  # 30-day TTL
    return vector
~~~

### The re-embedding problem (embedding model versioning)

This is the single most important production concern specific to embeddings: **vectors from two different model versions are not comparable, even if the model names sound similar.** If you upgrade your embedding model (a new OpenAI model version, a newer open-weights checkpoint, or even a fine-tuned variant of the same base model), every previously stored vector in your vector database becomes stale and must be recomputed — you cannot mix old and new vectors in the same similarity search and expect meaningful rankings.

Practical mitigations real teams use:

1. **Version-tag every stored vector** with the exact model name/version used to produce it, so a migration can identify what needs re-embedding.
2. **Blue-green re-embedding**: build the new index fully under a new collection/namespace while the old one keeps serving traffic, then cut over once the new index is validated — avoids a service outage during a multi-hour/day re-embed of a large corpus.
3. **Budget re-embedding cost as an ongoing line item**, not a one-time migration — corpora grow and models improve; plan re-embed jobs (with checkpointing, since re-embedding millions of documents can take hours) into the operational calendar.
4. **Prefer Matryoshka/instruction-aware models** where feasible, since they can reduce how often a hard "must fully re-embed everything" event happens (e.g. changing the served dimensionality without changing the underlying model).

### The storage/retrieval pipeline

Embeddings themselves are only step one; storing them for fast retrieval at scale is the job of a vector database (FAISS for local/library-level indexing, Pinecone/Weaviate/Qdrant/Milvus/Chroma for managed or self-hosted services) — see those skills for index types (HNSW, IVF, PQ), filtering, and hybrid search. The production discipline that belongs specifically to embeddings, versus to the database, is: consistent model use, caching, and rigorous version tracking.
`,

  "industry-examples": `
- **OpenAI**: ships dedicated text-embedding models (the text-embedding-3 family) as a standalone product separate from its chat models, explicitly designed with Matryoshka-style truncation so customers can trade dimensionality for cost/latency without retraining.
- **Google**: embeddings underpin core Search ranking signals and the Gemini embedding API; Google's research (word2vec originated at Google) and BERT (Google) are foundational to the entire field.
- **Spotify**: uses embeddings extensively for music/podcast recommendation — representing tracks, playlists, and listening sessions as vectors so "similar taste" becomes a nearest-neighbor lookup rather than hand-built genre rules.
- **Pinterest**: their visual search and recommendation systems embed images (and increasingly multimodal image+text signals) so users can search "more like this pin" via embedding similarity rather than keyword tags.
- **Cohere**: offers embedding models explicitly marketed and tuned for enterprise semantic search and RAG use cases, including multilingual embedding models.
- **Meta (FastText, and image/text embeddings across products)**: FastText (Facebook AI Research) pioneered subword-aware embeddings for handling misspellings and rare words at scale across many languages.

Pattern to notice: every company with a "find similar X" or "search that understands meaning, not just keywords" feature has an embedding pipeline underneath it — the differentiator between companies is usually the quality of the domain-specific data used to fine-tune or select an embedding model, not the existence of embeddings themselves.
`,

  "best-practices": `
1. **Use the same model and preprocessing for both corpus and query embeddings** — mismatches here are the single most common cause of poor retrieval quality.
2. **Normalize embeddings (L2 unit length) when the model recommends cosine similarity** — it makes dot product and cosine similarity interchangeable and keeps similarity scores comparable across texts of different length.
3. **Batch embedding calls** rather than embedding one item at a time — dramatically better throughput on both local GPU inference and commercial APIs.
4. **Chunk documents thoughtfully before embedding** — chunks that are too large dilute a specific fact among unrelated content; chunks that are too small lose surrounding context. Tune chunk size and overlap empirically for your domain (this is developed further in the RAG skill).
5. **Cache embeddings keyed by model version and exact text** — never recompute an embedding for identical content under the same model.
6. **Tag every stored vector with the embedding model version** — this is what makes a future model migration tractable instead of a forensic investigation.
7. **Validate embedding quality on your own data**, not just public benchmarks (MTEB) — domain vocabulary (legal, medical, code) can make a benchmark-leading general model underperform a smaller domain-tuned one.
8. **Use instruction/task prefixes when a model supports them** — many modern embedding models produce measurably better retrieval vectors when told "this text is a search query" vs. "this text is a document to be searched."
9. **Consider hybrid search (embeddings + keyword/BM25)** for domains where exact term matching matters (product SKUs, legal citations, code identifiers) — pure semantic similarity can miss exact-match cases that keyword search catches trivially.
10. **Right-size dimensionality to your actual latency/storage budget** rather than always reaching for the largest available model — a 384-dim model is often "good enough" and meaningfully cheaper to search at scale.
11. **Monitor retrieval quality in production** (e.g. via click-through/relevance feedback loops or periodic human evaluation), not just at initial launch — corpora drift and user query patterns change over time.
12. **Plan the re-embedding cost into any model-upgrade decision** — a "better" embedding model is not free to adopt; it requires a full corpus re-embed and a migration strategy.
`,

  "anti-patterns": `
### Mixing embeddings from different models or versions

~~~python
# WRONG — comparing vectors produced by two different models
old_vector = old_model.encode("refund policy")
new_vector = new_model.encode("how do I get my money back")
similarity = cosine_similarity(old_vector, new_vector)  # meaningless number

# RIGHT — re-embed the entire corpus with the new model before comparing
# any query against it; never mix vector "generations" in one index.
~~~

### Forgetting to normalize when the model expects it

~~~python
# WRONG — using raw dot product on un-normalized vectors from a model
# documented to require cosine similarity; longer/larger-magnitude
# documents win artificially, regardless of true relevance.
score = np.dot(doc_vector, query_vector)

# RIGHT — normalize both vectors first (or ask encode() to do it),
# matching the model's documented usage.
score = np.dot(doc_vector / np.linalg.norm(doc_vector),
               query_vector / np.linalg.norm(query_vector))
~~~

### Embedding overly long, unchunked documents

Feeding an entire 50-page PDF into one embedding call either truncates most of the content silently (models have a maximum token/context length) or, if it fits, dilutes any single specific fact into a vague average — a query about page 40 will not surface a strong match. Chunk first, embed each chunk, retrieve at the chunk level.

### Treating cosine similarity scores as calibrated probabilities

A similarity of 0.75 from one embedding model is not comparable to a 0.75 from a different model, and it is not a probability — thresholds for "is this relevant" must be tuned empirically per model and per domain, never assumed as an absolute universal cutoff.

### Re-using word-level embeddings for sentence similarity by naive concatenation

Simply concatenating or summing word2vec-style word vectors for a sentence throws away word order and context, and was largely superseded by dedicated pooling strategies and sentence-transformer models specifically because naive aggregation of static word vectors performs poorly on real sentence-similarity benchmarks.

### Skipping evaluation before shipping an embedding-based feature

Assuming "the vectors look reasonable in a quick manual check" is not evaluation — always run a held-out relevance test set (even a small hand-labeled one) before trusting an embedding pipeline in production, since subtle preprocessing or metric mismatches often only show up in aggregate metrics, not spot checks.
`,

  performance: `
### Measure first

~~~python
import time

start = time.perf_counter()
vectors = model.encode(texts, batch_size=64)
elapsed = time.perf_counter() - start
print(f"Embedded {len(texts)} texts in {elapsed:.2f}s "
      f"({len(texts) / elapsed:.1f} texts/sec)")
~~~

For commercial embedding APIs, track token usage and request latency per call (most APIs return usage metadata); for self-hosted models, profile with standard Python profiling tools and, for GPU inference, check GPU utilization (nvidia-smi) to confirm you are not CPU-bound on tokenization or data movement.

### The optimization hierarchy (apply in order)

1. **Batch requests.** Embedding 1,000 texts in one batched call is dramatically faster than 1,000 individual calls — both for local model inference (better GPU/CPU utilization) and for API calls (fewer round trips, often cheaper per-token pricing at volume).
2. **Cache aggressively.** Never re-embed identical text under the same model version; a cache hit is orders of magnitude faster than any embedding call.
3. **Right-size the model.** A smaller model (e.g. all-MiniLM-L6-v2 at 384 dimensions) can embed thousands of sentences per second on CPU; a large model may need a GPU to hit acceptable throughput. Match model size to actual latency requirements rather than defaulting to the largest available.
4. **Reduce dimensionality where quality allows it.** Matryoshka-capable models let you truncate vectors, cutting both storage and downstream similarity-computation cost roughly linearly with dimension count.
5. **Quantize stored vectors.** int8 or binary quantization inside the vector database (see the Vector Databases skills for FAISS's PQ/IVF-PQ specifics) trades a small, often acceptable, accuracy loss for large gains in memory and search speed at index-serving time.
6. **Parallelize embedding jobs for large corpora.** A one-time or periodic re-embed of millions of documents should be chunked into parallel worker jobs with checkpointing so a failure partway through does not require restarting from zero.

### Numbers worth knowing (rough, model/hardware-dependent)

A small sentence-transformer model (roughly 384 dimensions) commonly embeds on the order of hundreds to low thousands of short sentences per second on a modern CPU, and considerably faster on GPU; larger commercial-grade embedding models are slower per call and typically accessed via network API, where round-trip latency (tens to a few hundred milliseconds) usually dominates over the embedding computation itself — batch requests specifically to amortize that latency.
`,

  scalability: `
Embeddings themselves are cheap to scale (a stateless function: text in, vector out); the scaling challenge in practice comes from two directions — the volume of embedding computation, and the volume of stored vectors that must be searched.

~~~mermaid
flowchart LR
    Docs["Document ingestion stream"] --> Queue["Job queue\n(batched embedding requests)"]
    Queue --> W1["Embedding worker 1 (GPU/CPU)"]
    Queue --> W2["Embedding worker N"]
    W1 & W2 --> VDB[("Vector database\nsharded / replicated")]
    Query["User query"] --> QW["Query embedding\n(same model)"]
    QW --> VDB
    VDB --> Results["Top-K nearest neighbors"]
~~~

### Scaling embedding computation

- **Horizontal**: run multiple embedding worker processes/pods, each pulling batches off a queue — this is the same "stateless worker pool" pattern used for any embarrassingly parallel batch job.
- **Vertical**: a GPU dramatically increases per-worker throughput for larger models; for small models, CPU batching can be sufficient and cheaper to operate.
- **Incremental embedding**: only embed new/changed documents rather than re-embedding a whole corpus on every ingestion run — track document hashes/timestamps to detect what actually changed.

### Scaling embedding storage and search

This is where the **Vector Search** and **Vector Databases** skills take over: approximate nearest-neighbor indexes (HNSW, IVF) trade a small amount of recall for massive speedups over brute-force comparison, and vector databases like FAISS (library, in-process), Pinecone/Weaviate/Qdrant/Milvus (dedicated services) shard and replicate indexes across machines to handle billions of vectors.

| Bottleneck | Answer |
|---|---|
| High embedding-computation volume (ingest-time) | Worker pool + batching; GPU for large models; incremental re-embedding |
| Large corpus, slow brute-force search | Approximate nearest-neighbor index (HNSW/IVF) — see Vector Search |
| Vector storage memory cost at scale | Dimensionality reduction (Matryoshka), quantization (int8/binary) — see Vector Databases |
| Query latency under load | Index sharding/replication, caching hot queries, smaller model for the query-encoding side if using an asymmetric bi-encoder setup |
| Corpus growth over time | Design ingestion as an ongoing streaming pipeline, not a one-time batch job |
`,

  security: `
### Data leakage through embeddings

Embeddings are not as "safe" as they might look — research has shown that dense embeddings can, under some circumstances, be partially inverted to recover meaningful fragments of the original text (**embedding inversion attacks**). Treat embeddings of sensitive text (PII, confidential documents, health records) with the same care as the original data: encrypt at rest, restrict access, and do not assume a vector is a harmless "anonymized" representation of its source content.

### Sending sensitive data to third-party embedding APIs

Calling a commercial embedding API (OpenAI, Cohere, etc.) sends your raw text to that provider. For regulated or confidential data, verify the provider's data-retention and training-use policies, prefer options with contractual guarantees against using submitted data for model training, or self-host an open-weights embedding model (BGE, E5, GTE, Nomic) when data cannot leave your infrastructure at all. See the **Secrets Management** and **OWASP Top 10** skills for the broader data-handling discipline this fits into.

### Prompt/data injection via retrieved content

In RAG systems specifically, embeddings retrieve arbitrary stored text that later gets placed into an LLM's context — if an attacker can get malicious instructions embedded and indexed into your corpus (e.g. a poisoned document uploaded by an untrusted user), retrieval can surface that content directly into a prompt, enabling indirect prompt injection. Sanitize and validate ingested content, and treat retrieved context as untrusted input to the downstream LLM, not as trusted system instructions. See the **RAG** and **Prompt Injection** skills for defenses specific to that attack surface.

### Access control at the vector-database layer

A vector database is still a database: enforce authentication, per-tenant isolation (critical in multi-tenant RAG systems — one customer's documents must never leak into another's search results), and audit logging on who queried what. This is covered in depth in the individual Vector Databases skills (Pinecone/Weaviate/Qdrant/Milvus/Chroma), each of which has its own access-control model.

### Model supply-chain risk

Self-hosted open embedding models are downloaded artifacts — verify checksums/provenance from a trusted source (Hugging Face model cards, official repos) the same way you would audit any third-party dependency, since a maliciously modified model file is a real supply-chain attack vector.
`,

  testing: `
Testing an embedding pipeline means testing both the mechanical plumbing (does the code call the model correctly, cache correctly, handle errors) and the semantic quality (do the resulting vectors actually rank relevant content higher than irrelevant content).

~~~python
import pytest
import numpy as np
from myapp.embeddings import embed_batch, cosine_similarity

def test_embed_batch_returns_correct_shape():
    vectors = embed_batch(["hello world", "goodbye world"])
    assert len(vectors) == 2
    assert len(vectors[0]) == 384          # matches the configured model's dimension

def test_identical_text_yields_identical_embedding():
    v1 = embed_batch(["the quick brown fox"])[0]
    v2 = embed_batch(["the quick brown fox"])[0]
    assert v1 == v2                        # deterministic for a fixed model version

def test_semantically_similar_sentences_score_higher_than_unrelated():
    vecs = embed_batch([
        "The cat sat on the mat.",
        "A feline rested on the rug.",         # paraphrase
        "The stock market fell sharply today.",  # unrelated
    ])
    sim_paraphrase = cosine_similarity(np.array(vecs[0]), np.array(vecs[1]))
    sim_unrelated = cosine_similarity(np.array(vecs[0]), np.array(vecs[2]))
    assert sim_paraphrase > sim_unrelated

def test_embedding_call_handles_empty_string_without_crashing():
    vectors = embed_batch([""])
    assert len(vectors) == 1

@pytest.mark.parametrize("bad_input", [None, 12345])
def test_embed_batch_rejects_invalid_input_types(bad_input):
    with pytest.raises((TypeError, ValueError)):
        embed_batch([bad_input])
~~~

### The senior testing doctrine for embeddings

- **Retrieval quality tests belong alongside unit tests.** Maintain a small, hand-curated set of (query, expected relevant document) pairs specific to your domain, and assert that retrieval returns the expected document in the top-K — this catches regressions from chunking changes, model swaps, or preprocessing bugs that a pure "did the code run" test would miss.
- **Pin the model version in tests.** Because different model versions produce different vectors, a test asserting exact similarity values will break on every model upgrade unless the model version is explicitly pinned in the test fixture.
- **Test the caching layer separately from the embedding logic** — mock the model call and assert cache hits/misses behave correctly, rather than hitting a real (slow, costly) model in every cache test.
- **Regression-test known failure modes**: very long documents (truncation behavior), empty strings, non-English text if your product is multilingual, and text containing special characters/code.
`,

  debugging: `
### The toolbox, in escalation order

1. **Confirm the model and preprocessing match between ingestion and query.** The most common "bad results" bug is comparing vectors produced by different model versions, different normalization, or different truncation settings. Print the model name/version at both embed sites and diff them.
2. **Inspect raw similarity scores, not just final rankings.** If every score in a result set is suspiciously close together (e.g. all scores between 0.95 and 0.99), suspect anisotropy or a normalization bug rather than "the model is bad" — genuine irrelevant results should score noticeably lower.

~~~python
# Quick sanity probe: does a known-unrelated pair score much lower
# than a known-related pair? If not, something upstream is broken.
related = cosine_similarity(embed("dog"), embed("puppy"))
unrelated = cosine_similarity(embed("dog"), embed("quantum physics"))
print(related, unrelated)
assert related > unrelated + 0.2   # a sane pipeline should show a clear gap
~~~

3. **Check for silent truncation.** Log the token count of inputs against the model's maximum context length; documents exceeding it are silently cut off, and a query about the missing tail will never retrieve correctly.
4. **Visualize a sample of the embedding space.** Project a few hundred vectors to 2D with PCA or UMAP and plot them — clusters of known-related items that fail to group visually is a fast signal that something in preprocessing (e.g. accidentally embedding metadata/HTML tags instead of clean text) is polluting the vectors.
5. **Check normalization consistency.** If cosine similarity is being computed manually, verify both vectors are normalized the same way (or that the underlying vector database's distance metric configuration matches what the model expects).
6. **Audit the cache.** A stale cache entry from a previous model version returning old vectors under a reused key is a classic, hard-to-spot bug — verify cache keys include the model version string.
7. **Isolate the chunking step.** Print a sample of actual chunk boundaries; chunk splitting that cuts mid-sentence or mid-table often produces embeddings for near-meaningless fragments.
`,

  monitoring: `
### What to measure

- **Embedding latency** (p50/p95/p99) per call, separated by model/provider — a spike often signals provider-side degradation (for API-based models) or resource contention (for self-hosted models).
- **Embedding throughput** (texts/sec, tokens/sec) against expected ingestion volume, to catch pipeline stalls before a backlog builds.
- **Cache hit rate** — a sudden drop can indicate a model-version change (intentional or accidental) invalidating the cache, or unexpectedly unique/changing input content.
- **Retrieval relevance metrics** over time (e.g. click-through rate on returned results, or periodic human-labeled relevance sampling) — silent quality drift is common as a corpus grows or user query patterns shift.
- **Cost per embedding call**, for commercial APIs — track spend against volume to catch runaway re-embedding jobs early.

~~~python
from prometheus_client import Counter, Histogram

EMBED_CALLS = Counter("embedding_calls_total", "Embedding calls", ["model", "status"])
EMBED_LATENCY = Histogram("embedding_latency_seconds", "Embedding call latency", ["model"])
CACHE_HITS = Counter("embedding_cache_hits_total", "Cache hits vs misses", ["result"])

def embed_with_metrics(model_name: str, texts: list[str]):
    with EMBED_LATENCY.labels(model=model_name).time():
        try:
            vectors = embed_batch(texts)
            EMBED_CALLS.labels(model=model_name, status="success").inc()
            return vectors
        except Exception:
            EMBED_CALLS.labels(model=model_name, status="error").inc()
            raise
~~~

### Embedding-specific things to watch

- **Model version drift**: alert if any newly stored vector's tagged model version does not match the currently configured production model — this catches accidental partial migrations.
- **Distribution shift**: periodically sample the average pairwise similarity across a random batch of stored vectors; a meaningful shift over time can indicate the corpus's content mix has changed (new document types, a different language creeping in) in a way that may need model re-evaluation.
- **Dead/zero vectors**: watch for embeddings that come back as all-zero or NaN — usually a sign of an empty-string edge case, a tokenizer failure, or an API returning an error payload that was not properly checked.
`,

  deployment: `
### Self-hosted embedding service, Dockerized

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY src/ src/

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" \\
    HF_HOME=/app/.cache/huggingface \\
    TRANSFORMERS_OFFLINE=0
# Pre-download the model at build time so cold starts don't hit the network
RUN python -c "from sentence_transformers import SentenceTransformer; \\
    SentenceTransformer('all-MiniLM-L6-v2')"
USER appuser
EXPOSE 8080
CMD ["uvicorn", "myservice.embedding_api:app", "--host", "0.0.0.0", "--port", "8080"]
~~~

Why each choice matters: slim base and non-root user reduce attack surface; deps installed in a separate cached layer speed up rebuilds; pre-downloading the model at build time (rather than on first request) avoids slow, network-dependent cold starts and lets the service pass readiness checks immediately.

### Serving topology

- **Batch endpoint**: expose an endpoint that accepts a list of texts and returns a list of vectors — encourage batched calls from clients rather than one-text-per-request, both for the caller's throughput and the server's GPU/CPU utilization.
- **GPU vs CPU serving**: for small models (under ~100M parameters) CPU serving is often sufficient and simpler to operate; larger models benefit substantially from GPU inference, and should be deployed on GPU-backed nodes with appropriate batching (e.g. dynamic batching to fill GPU throughput without adding excessive per-request latency).
- **Health checks**: a /healthz that confirms the process is up, and a /readyz that actually runs a tiny embed call against the loaded model, catching cases where the model failed to load correctly at startup.
- **Version pinning in the deployment**: tag the deployed container image and the model checkpoint version together, so a rollback restores both consistently — a "code rollback" that leaves a newer model version running (or vice versa) reintroduces the exact vector-incompatibility problem covered in Production Usage.

### CI/CD pipeline sketch

lint/typecheck → unit tests (mocked model calls) → a small retrieval-quality regression test against a fixed evaluation set → build image → smoke test (real embed call against the built image) → deploy with rolling update, verifying the readiness probe passes before shifting traffic.
`,

  "production-checklist": `
Before an embedding pipeline takes real production traffic:

- [ ] Embedding model choice justified against retrieval-quality benchmarks AND your own domain evaluation set
- [ ] Same model version and preprocessing verified identical between ingestion and query paths
- [ ] Similarity metric (cosine/dot/Euclidean) matches the model's documented recommendation
- [ ] Embeddings normalized consistently if the model expects unit-length vectors
- [ ] Every stored vector tagged with its embedding model version/checkpoint
- [ ] Caching layer in place, keyed by (model version, exact input text), with sane TTL
- [ ] Chunking strategy tuned and tested for the specific document types in the corpus
- [ ] Batch embedding used for ingestion; per-item calls avoided
- [ ] Re-embedding runbook exists: how to migrate the whole corpus if the model changes, including a blue-green cutover plan
- [ ] Retrieval-quality regression test set in CI, checked on every pipeline/model change
- [ ] Monitoring in place for latency, throughput, cache hit rate, and cost per call
- [ ] Sensitive/regulated text reviewed for whether a third-party embedding API is acceptable, or self-hosting is required
- [ ] Multi-tenant isolation verified at the vector-database layer if applicable
- [ ] Truncation behavior for over-length inputs understood and tested
- [ ] Rollback plan verified for both application code and model/checkpoint version together
`,

  "common-mistakes": `
1. **Mixing embeddings from different model versions in one index** — silently produces meaningless similarity rankings; the fix is version tagging and disciplined re-embedding, covered in Production Usage.
2. **Using dot product on un-normalized vectors expecting cosine-similarity behavior** — longer/larger-magnitude content wins artificially.
3. **Embedding whole documents instead of chunks** — either truncates content past the model's context limit or dilutes specific facts into a vague average vector.
4. **Assuming a public benchmark leaderboard score (e.g. MTEB) transfers directly to your domain** — a top-ranked general model can underperform a smaller domain-tuned model on specialized vocabulary (legal, medical, code).
5. **Not caching embeddings**, leading to repeated, wasted computation/API spend for identical content.
6. **Treating the classic king − man + woman ≈ queen analogy as a literal, guaranteed property of any embedding model** — it is an illustrative historical example from static word2vec-style vectors, not a robust guarantee of modern contextual models.
7. **Ignoring the re-embedding cost when evaluating a "better" embedding model** — the true cost of a model upgrade includes a full corpus re-embed, not just the new model's per-call price.
8. **Sending highly sensitive text to a third-party embedding API without checking data-use/retention policies.**
9. **Skipping empirical similarity-threshold tuning** — assuming a fixed cosine-similarity cutoff (e.g. "above 0.8 is relevant") transfers across models or domains without validation.
10. **Forgetting that embeddings can be partially inverted** — treating a vector as a "safe," anonymized stand-in for sensitive source text.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Retrieval returns irrelevant results across the board | Query and corpus embedded with different models/preprocessing | Verify identical model version and normalization on both paths |
| All similarity scores clustered very close together (e.g. 0.9-0.99) | Anisotropic embedding space, or comparing raw (non-fine-tuned) hidden states instead of a dedicated sentence-embedding model | Switch to a model trained with a contrastive sentence-similarity objective |
| Dimension mismatch error when inserting into a vector index | Mixed models/versions producing different vector sizes in the same collection | Enforce a single model per collection/index; migrate on model change |
| Embedding call returns all zeros / NaNs | Empty string input, tokenizer failure, or silently failed API call | Validate input before embedding; check API response codes explicitly |
| Similarity search misses an obviously relevant document | Document truncated during embedding (exceeded model's max context) or split into a chunk boundary that separated the relevant fact from its context | Check token counts against the model's limit; tune chunking |
| Unexpectedly high API costs | No caching; re-embedding unchanged content repeatedly | Add a cache keyed by model version + exact text |
| Cross-modal (text-image) similarity scores look uncalibrated/odd | Comparing scores across modalities as if on the same scale as unimodal similarity | Validate empirically per use case; don't assume identical scale to text-text similarity |
| Rollback after a bad deploy still shows bad retrieval results | Code rolled back but the vector index still has vectors from the newer model version | Roll back model version and index together, not code alone |
`,

  faqs: `
**Q: Is "king − man + woman ≈ queen" still true for modern embedding models?**
It was a genuine, striking result from the original 2013 word2vec paper on static, non-contextual word vectors, and it remains a great teaching example for the idea that embedding spaces capture relationships as roughly linear directions. But modern embeddings are contextual (a word's vector depends on its sentence) and are usually sentence/document-level rather than single-word, so the clean analogy arithmetic does not transfer directly — treat it as a historical illustration of the concept, not a property to rely on in a modern system.

**Q: Should I use word embeddings or sentence embeddings for my application?**
Almost all production text-search, RAG, and semantic-similarity applications in 2026 use sentence/document embeddings from a dedicated model (SBERT-family, OpenAI, Cohere, BGE, E5). Static word embeddings (word2vec/GloVe) are mostly relevant now for lightweight offline NLP features, teaching the underlying theory, or resource-constrained environments without transformer infrastructure.

**Q: Cosine similarity, dot product, or Euclidean distance — how do I choose?**
Check the embedding model's documentation first; it usually tells you directly. In practice, most modern sentence-embedding models are designed for cosine similarity, and normalizing vectors then using dot product gives an identical ranking at lower compute cost — which is what most vector databases do internally.

**Q: How many dimensions do I actually need?**
Enough to capture the nuance your task requires, and no more than your latency/storage budget comfortably supports — 384-768 dimensions is a strong default for many applications; only reach for 1536+ dimensional models when you have evidence (from your own evaluation, not just a leaderboard) that it measurably improves your results.

**Q: What happens when I upgrade my embedding model?**
Every previously stored vector becomes incompatible with new query vectors and must be re-embedded from the original source text — plan this as a real migration (see Production Usage) with version tagging and a blue-green cutover, not a drop-in swap.

**Q: Are CLIP-style multimodal embeddings as reliable as text-only embeddings?**
They are genuinely useful and widely deployed (e.g. text-to-image search, zero-shot image classification), but the shared space is trained on the pairs available at training time and inherits their biases/coverage gaps; validate cross-modal similarity behavior empirically for your specific use case rather than assuming parity with unimodal embeddings.

**Q: Do embeddings "understand" language the way a human does?**
No — an embedding is a statistical, learned proxy for similarity based on patterns in training data. It is extremely useful for ranking and retrieval, but similarity in vector space is not the same as logical entailment, factual correctness, or human-level understanding.

**Q: Can embeddings leak the original text?**
Partially, in some conditions — embedding inversion research shows dense vectors can sometimes be used to reconstruct fragments of the source text. Treat embeddings of sensitive data with real data-security discipline, not as an automatically anonymized representation.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is an embedding?* A dense, fixed-length vector representation of data (word, sentence, image) placed in a continuous space such that geometric distance corresponds to semantic similarity, learned from data rather than hand-designed.
2. *Why not just use one-hot encoding?* One-hot vectors are extremely high-dimensional and sparse for realistic vocabularies (curse of dimensionality), and every pair of distinct one-hot vectors is equally "different" — there is no encoded similarity structure at all.
3. *What is cosine similarity and why is it commonly used for embeddings?* The cosine of the angle between two vectors, ignoring magnitude; commonly used because many embedding models encode meaning primarily in direction, and it is scale-invariant across texts of different length.
4. *What is the difference between a word embedding and a sentence embedding?* A word embedding is one vector per token; a sentence embedding is a single fixed-length vector representing an entire sentence/document, typically produced via pooling token vectors or via a model trained end-to-end for that purpose.
5. *Explain the king − man + woman ≈ queen example, and its limits.* Classic 2013 word2vec-era illustration that embedding spaces encode relationships as roughly linear directions; a useful teaching device, but not a precise description of modern contextual embedding behavior, and not perfectly reliable even in the original static setting.

**Senior:**

6. *How would you decide between a general-purpose embedding model and fine-tuning/choosing a domain-specific one?* Evaluate on a held-out, hand-labeled relevance set from the actual domain (legal, medical, code, etc.), not just public benchmarks like MTEB; domain vocabulary mismatches are common and material.
7. *Walk through what happens when you change your production embedding model.* Every stored vector becomes incompatible with new query vectors; requires a full corpus re-embed, version tagging on stored vectors, and typically a blue-green migration strategy to avoid downtime or serving mismatched vector generations.
8. *How do co-occurrence-based methods like word2vec/GloVe differ from how modern transformer-based embeddings are produced?* Co-occurrence methods learn from local context-window prediction (word2vec) or global co-occurrence statistics (GloVe) over static (non-contextual) vectors; modern methods use transformer self-attention to produce contextual per-token representations, then pool or directly fine-tune (contrastive objective) toward sentence-level embeddings.
9. *What is anisotropy in embedding spaces, and why does it matter?* Raw hidden states from language models can cluster into a narrow region of the vector space rather than spreading isotropically, inflating baseline similarity between unrelated pairs and compressing useful signal — part of why dedicated sentence-embedding models use specific training objectives (and sometimes post-hoc normalization) rather than naively pooling raw hidden states.
10. *Design an embedding pipeline for a RAG system handling millions of documents with an evolving embedding model.* Cover chunking strategy, batched ingestion with a worker pool, caching, version-tagged vectors, a vector database with an appropriate ANN index, and a blue-green re-embedding migration plan; discuss cost/latency tradeoffs on dimensionality and quantization.
11. *How would you evaluate whether a multimodal (CLIP-style) embedding model is good enough for a text-to-image search feature?* Build a labeled evaluation set of (text query, correct image) pairs specific to the product's domain, measure top-K retrieval accuracy, and be explicit that cross-modal similarity scores are not directly comparable to unimodal similarity scores.
12. *What are the security implications of storing embeddings of sensitive text?* Embedding inversion research shows partial reconstruction of source text is possible in some conditions; embeddings should be protected with the same access controls and encryption discipline as the original sensitive data, not treated as automatically anonymized.
`,

  "coding-questions": `
### 1. Cosine similarity from scratch, then verify against a library

~~~python
import math

def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Pure-Python cosine similarity — no numpy dependency, for interview settings."""
    if len(a) != len(b):
        raise ValueError("vectors must be the same length")
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0  # define similarity of a zero vector as 0, avoid division by zero
    return dot / (norm_a * norm_b)

assert abs(cosine_similarity([1, 0], [1, 0]) - 1.0) < 1e-9   # identical direction
assert abs(cosine_similarity([1, 0], [0, 1]) - 0.0) < 1e-9   # orthogonal
assert abs(cosine_similarity([1, 0], [-1, 0]) - (-1.0)) < 1e-9  # opposite
~~~

Complexity: O(d) for d-dimensional vectors. Follow-up: how would you speed this up for millions of comparisons against a single query vector? (Answer: normalize all stored vectors once at index time, then similarity search becomes a matrix-vector dot product, or use an approximate nearest-neighbor index — see Vector Search.)

### 2. Find the top-K nearest embeddings to a query (brute force, then discuss scaling)

~~~python
import heapq

def top_k_similar(query: list[float], corpus: dict[str, list[float]], k: int) -> list[tuple[str, float]]:
    """Brute-force top-K by cosine similarity. O(n log k) using a min-heap."""
    heap: list[tuple[float, str]] = []
    for doc_id, vector in corpus.items():
        score = cosine_similarity(query, vector)
        if len(heap) < k:
            heapq.heappush(heap, (score, doc_id))
        elif score > heap[0][0]:
            heapq.heapreplace(heap, (score, doc_id))
    # sort descending by score for the final result
    return sorted(((doc_id, score) for score, doc_id in heap), key=lambda x: -x[1])

corpus = {
    "doc1": [0.9, 0.1],
    "doc2": [0.85, 0.15],
    "doc3": [-0.9, 0.05],
}
result = top_k_similar([0.88, 0.12], corpus, k=2)
assert result[0][0] == "doc1"
~~~

Complexity: O(n·d) time, O(k) extra space for the heap, where n is corpus size. Follow-up: at what corpus size does brute force become impractical, and what index structure (HNSW, IVF) would you reach for instead? This is exactly the handoff point to the Vector Search skill.

### 3. Deduplicate near-identical documents using embedding similarity

~~~python
def deduplicate(documents: list[str], embed_fn, threshold: float = 0.95) -> list[str]:
    """Greedy near-duplicate removal: keep a document unless it's near-identical
    (by embedding similarity) to one already kept."""
    kept: list[str] = []
    kept_vectors: list[list[float]] = []
    for doc in documents:
        vector = embed_fn(doc)
        is_duplicate = any(
            cosine_similarity(vector, kv) >= threshold for kv in kept_vectors
        )
        if not is_duplicate:
            kept.append(doc)
            kept_vectors.append(vector)
    return kept
~~~

Complexity: O(n²) in the worst case (each new doc compared against all kept docs) — acceptable for moderate corpora, but flag in an interview that a production version at scale would use an approximate nearest-neighbor index to avoid the quadratic blowup. Follow-up: how does the choice of threshold interact with the embedding model's typical similarity distribution for genuinely different documents?
`,

  "hands-on-labs": `
### Lab 1 — Word similarity playground (beginner, ~1h)
Using a small pretrained word2vec or GloVe model (many are loadable via gensim), compute nearest neighbors for a handful of words and inspect a few analogy examples (including some that work well and some that don't). Deliverable: a short written note on which analogies held up and which broke down, tying back to the honest-hedge discussion in Beginner Concepts. Skills exercised: static embeddings, cosine similarity, honest interpretation of results.

### Lab 2 — Build a mini semantic search engine (intermediate, ~2-3h)
Take a small corpus (e.g. 200 Wikipedia paragraphs or your own notes), embed each with a sentence-transformer model, store vectors and metadata in memory (a plain Python list/dict is fine), and implement a query function that embeds a user's question and returns the top-5 most similar chunks by cosine similarity. Deliverable: a CLI tool that answers "search this corpus" queries. Skills exercised: chunking, batch embedding, similarity ranking.

### Lab 3 — Instrumented embedding microservice (advanced, ~3-4h)
Wrap Lab 2's embedding logic in a FastAPI service with a batch /embed endpoint, add a caching layer keyed by model version + text hash, add Prometheus metrics for latency/throughput/cache hit rate, and containerize it with a Dockerfile that pre-downloads the model at build time. Deliverable: a running, observable embedding microservice. Skills exercised: production embedding pipeline discipline, caching, monitoring, deployment.

### Lab 4 — Model migration drill (production, ~2-3h)
Starting from Lab 3's service, simulate an embedding model upgrade: swap in a different model, tag newly stored vectors with the new model version, build a script that re-embeds an existing "old" corpus into a new collection/namespace, and write a short runbook describing a blue-green cutover between the old and new indexes. Deliverable: a working re-embedding script plus a written migration runbook. Skills exercised: the entire re-embedding/versioning production concern, end to end.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate real embedding engineering:

1. **Personal knowledge-base semantic search.** Ingest your own notes/documents (Markdown, PDFs, saved articles), chunk and embed them with a self-hosted model, store vectors in a real vector database (pick one from FAISS/Chroma for a local project, or Pinecone/Weaviate/Qdrant for a hosted one), and build a simple web UI for natural-language search over your own content. Demonstrates: end-to-end ingestion pipeline, chunking strategy design, vector database integration.

2. **Duplicate/near-duplicate content detector.** Given a large set of documents (support tickets, product reviews, or scraped articles), embed all of them and cluster/flag near-duplicates above a tuned similarity threshold, with a report showing precision/recall against a hand-labeled sample. Demonstrates: threshold tuning, evaluation methodology, handling embedding computation at moderate scale.

3. **Cross-model embedding migration tool.** Build a general-purpose tool that takes an existing vector-database collection, re-embeds its documents with a new model, writes to a new versioned collection, and validates the migration (spot-check retrieval quality before/after, confirm vector counts match). Demonstrates: the production re-embedding discipline as a standalone, reusable engineering artifact — directly relevant to real AI infrastructure teams.

Each project: document your chunking and model choices with reasoning (not just "it worked"), include a small hand-labeled evaluation set and report metrics against it, and write a short README explaining the architecture and tradeoffs — this is what separates a portfolio project from a tutorial copy.
`,

  "case-studies": `
### word2vec at Google: from a research idea to industry standard
Mikolov et al.'s 2013 word2vec paper demonstrated that a simple, fast-to-train neural network task (predicting context words) could produce embeddings good enough to power the king−man+woman≈queen analogy and meaningfully outperform prior methods on similarity benchmarks. Lesson: a computationally cheap, self-supervised training signal (no labels needed — just raw text) can outperform much more complex hand-engineered features, a pattern that recurs throughout the deep learning era.

### Sentence-BERT: fixing a real production bottleneck
Before Sentence-BERT (2019), getting a good sentence similarity score from BERT required a slow cross-encoder pass (feeding both sentences through BERT together) for every pair being compared — computationally infeasible for search over a large corpus (comparing one query against a million documents would mean a million expensive BERT passes). SBERT's siamese/triplet fine-tuning produces independently embeddable sentence vectors, so the million documents are embedded once, and a query is compared against them with cheap vector similarity. Lesson: the right training objective can turn an accurate-but-slow architecture into a fast, deployable one, without sacrificing much accuracy for the retrieval use case.

### CLIP: contrastive training unlocks a genuinely new capability
OpenAI's CLIP (2021) showed that training image and text encoders jointly with a contrastive objective over large-scale web image-caption pairs produces a shared embedding space good enough for zero-shot image classification — classifying images into categories the model was never explicitly trained to recognize, just by comparing image embeddings against text-label embeddings. Lesson: the right training objective (contrastive, cross-modal) can produce emergent capabilities beyond what any single-modality model could achieve alone.

### The rise of dedicated embedding APIs
Where early production systems mostly repurposed general-purpose language models' hidden states for embeddings, the industry shift (OpenAI, Cohere, and open models like BGE/E5 all shipping embeddings as a distinct product) reflects a maturing recognition that "good for generating text" and "good for representing meaning for retrieval" are related but distinct objectives, worth training and shipping separately. Lesson: as a technology area matures, generic byproducts get replaced by purpose-built, benchmarked, independently-improved components.
`,

  comparisons: `
| Dimension | word2vec / GloVe (static) | BERT hidden states (pooled) | Sentence-BERT / dedicated sentence models | CLIP (multimodal) |
|---|---|---|---|---|
| Contextual? | No — one vector per word regardless of sentence | Yes | Yes | Yes (text side) |
| Trained specifically for similarity comparison? | Yes, but at word level only | No — repurposed, not optimized for it | Yes — explicit contrastive objective | Yes — contrastive, cross-modal |
| Typical retrieval quality (sentence-level) | Poor without careful pooling | Mediocre out of the box | Strong; the modern default | Strong for cross-modal tasks specifically |
| Compute cost to produce an embedding | Very low (lookup table) | Moderate (transformer forward pass) | Moderate (transformer forward pass) | Moderate-high (separate encoders) |
| Handles rare/unseen words | Poorly (word2vec), better with FastText's subwords | Well (subword tokenization) | Well | Well (text side) |
| Best current use case | Lightweight offline NLP features, teaching | Rarely used directly for retrieval today | Semantic search, RAG, clustering | Text-to-image / image-to-text search |

**How seniors choose**: default to a dedicated sentence-embedding model (SBERT-family, OpenAI/Cohere, or an open model like BGE/E5) for essentially any modern text-similarity or retrieval task — it is very rarely the wrong first choice. Reach for static word embeddings only for lightweight, resource-constrained, or purely educational contexts. Reach for CLIP-style multimodal embeddings specifically when the task genuinely spans text and images (or other modalities); don't force a multimodal model onto a text-only problem where a dedicated text model will simply perform better and cost less.
`,

  "related-technologies": `
- **Machine Learning** — the broader discipline embeddings are learned within; understand loss functions and training before the "how embeddings learn" sections click fully.
- **Neural Networks** — hidden layers and activations are the literal mechanism that produces most modern embeddings.
- **Transformers** and **Attention** — the dominant architecture behind contextual embedding models; read these to deepen the Internal Working section.
- **Vector Search** — the algorithms (HNSW, IVF, approximate nearest-neighbor search) that make searching millions/billions of embeddings fast; the natural next skill after this one.
- **Vector Databases (FAISS, Pinecone, Weaviate, Qdrant, Chroma, Milvus)** — where embeddings actually get stored, indexed, and queried at production scale; each has its own indexing tradeoffs and operational model.
- **RAG (Retrieval-Augmented Generation)** — the single most common production application of embeddings today: retrieving relevant chunks by similarity before generating an LLM answer.
- **CNNs / RNNs** — historical and still-relevant architectures for producing image/sequence embeddings before or alongside transformer-based approaches.
- **Prompt Injection / OWASP Top 10** — relevant security skills for the retrieval-poisoning and injection risks discussed in this page's Security section.

On this platform, the natural learning path is: **Machine Learning** → **Neural Networks** → **Transformers/Attention** → **Embeddings** (this page) → **Vector Search** → **Vector Databases** → **RAG**.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2026 — check each provider's official documentation and the MTEB leaderboard for anything newer.

- **Matryoshka Representation Learning (MRL) adoption**: multiple commercial and open embedding models now support truncatable embeddings, letting one model serve several dimensionality/cost tradeoffs without retraining or full re-embedding.
- **Instruction-aware embeddings**: an increasing number of embedding models accept a task instruction/prefix (e.g. distinguishing "query" from "document" framing), measurably improving retrieval quality when used correctly.
- **Longer context windows for embedding models**: newer models support embedding substantially longer input spans in a single call than early sentence-transformer models did, reducing (but not eliminating) the need for aggressive chunking.
- **Multilingual and domain-specialized embedding models** have proliferated, narrowing the gap for non-English and specialized-vocabulary (legal, medical, code) retrieval use cases versus general-purpose English-centric models.
- **Quantized and binary embeddings** are increasingly offered directly by model/vector-database providers as a first-class option, rather than something teams had to implement themselves, reflecting how central the storage/latency tradeoff has become at scale.
- **The MTEB benchmark** (and its successors/expansions) remains the most-cited public reference point for comparing embedding models across many tasks and languages, though practitioners consistently emphasize validating on domain-specific data rather than trusting leaderboard rank alone.

Always confirm current top models and their exact capabilities directly from the provider (OpenAI, Cohere, Google) or the Hugging Face MTEB leaderboard, since this is one of the fastest-moving areas in applied AI engineering.
`,

  "future-roadmap": `
Where embeddings are heading, and what is worth betting career time on:

1. **Unified, instruction-tunable embedding models.** The trend toward a single model that adapts its output vector based on a declared task (retrieval, clustering, classification) via instructions rather than requiring separate fine-tuned models per task is likely to continue — understanding how to prompt/instruct an embedding model correctly is becoming as important as choosing which model to use.
2. **Deeper multimodal unification.** Expect continued progress toward embedding spaces that meaningfully unify text, images, audio, and potentially video/code into shared or well-aligned spaces, expanding what "semantic search" can mean beyond pure text.
3. **Efficiency-first design (Matryoshka, quantization, binary embeddings) becoming the default**, not an advanced optimization — expect most new embedding models to ship with built-in support for truncation and compression from day one, reflecting how much production cost is driven by vector storage and search at scale.
4. **Tighter integration between embedding models and vector databases**, with providers increasingly offering embedding generation as a built-in feature of the database/search service itself, reducing the "glue code" surface area engineers have to build and maintain.
5. **Continued scrutiny of embedding security and privacy** (inversion attacks, cross-tenant leakage, poisoning of retrieval corpora) as embeddings sit ever more centrally inside production LLM systems — expect this to mature from an academic concern into a standard part of AI system security review.

For your career: the highest-leverage things to master are (a) rigorous evaluation methodology for embedding/retrieval quality on your own domain data, rather than trusting a single leaderboard number, and (b) the operational discipline around embedding model versioning and re-embedding — this is where real production AI systems most commonly break, and it is a skill gap that pure model-quality improvements will not close on their own.
`,

  "cheat-sheet": `
~~~python
# --- Core idea ---
# embedding = dense fixed-length vector representing meaning geometrically
# similar meaning -> vectors close together; unrelated -> vectors far apart

# --- One-hot (naive baseline) vs embeddings ---
one_hot = [0, 0, 1, 0, 0]     # huge, sparse, no similarity structure
embedding = [0.12, -0.44, 0.9, 0.3, -0.1]   # dense, compact, similarity-aware

# --- Similarity metrics ---
import numpy as np
def cosine_similarity(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
def euclidean_distance(a, b):
    return float(np.linalg.norm(a - b))        # smaller = more similar
# dot product == cosine similarity IF both vectors are L2-normalized

# --- Producing embeddings (sentence-transformers) ---
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")   # 384-dim, fast, CPU-friendly
vectors = model.encode(
    ["text one", "text two"],
    normalize_embeddings=True,     # match cosine-similarity usage
    batch_size=32,                 # always batch
)

# --- Pooling strategies (when pooling raw token vectors yourself) ---
# mean pooling  -> average all token vectors (masking padding)  -- most common
# CLS pooling   -> use the [CLS] token's vector -- needs a model trained for it
# max pooling   -> elementwise max across token vectors -- less common

# --- word2vec-era intuition (illustrative, not a modern-model guarantee) ---
# king - man + woman ~= queen
# static, non-contextual vectors; modern contextual models don't work this simply

# --- Dimensionality tradeoffs ---
# higher dims  -> more nuance, more storage, slower search
# lower dims   -> cheaper/faster, coarser semantics
# Matryoshka models: truncate a long vector to a shorter prefix, still usable

# --- Multimodal (CLIP-style) ---
# image_encoder(image) and text_encoder(text) trained contrastively
# -> shared space where matching image/caption pairs land close together

# --- Production discipline ---
# 1. Same model + preprocessing for corpus AND query embeddings, always
# 2. Cache by (model_version, exact_text)
# 3. Tag every stored vector with its model version
# 4. Changing the embedding model = re-embed the WHOLE corpus (blue-green it)
# 5. Chunk documents before embedding; don't embed whole long documents
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is an embedding? | A dense, fixed-length vector representing data so geometric distance reflects semantic similarity |
| Why not use one-hot encoding? | Too high-dimensional/sparse (curse of dimensionality) and encodes zero similarity between distinct items |
| What does king - man + woman ≈ queen illustrate? | That embedding spaces can encode relationships as roughly linear directions — a word2vec-era illustration, not a precise claim about modern contextual models |
| Cosine similarity measures what? | The angle between two vectors, ignoring magnitude — scale-invariant similarity |
| When is dot product equivalent to cosine similarity? | When both vectors are L2-normalized to unit length |
| Mean pooling vs CLS pooling? | Mean pooling averages all token vectors; CLS pooling uses a special summary token's vector (only reliable if the model was trained for it) |
| word2vec vs GloVe, core difference? | word2vec predicts context from local sliding windows; GloVe factorizes a global co-occurrence count matrix |
| Why do dedicated sentence-embedding models (SBERT) beat raw pooled BERT? | They are explicitly fine-tuned with a contrastive objective for similarity comparison, fixing issues like anisotropy that raw hidden states have |
| What is Matryoshka representation learning? | Training so a long embedding can be truncated to fewer dimensions while staying usable, without retraining |
| What is CLIP? | A model trained contrastively on image-caption pairs so text and images share one embedding space |
| The re-embedding problem? | Embeddings from different model versions are not comparable; upgrading a model requires re-embedding the whole corpus |
| Why cache embeddings? | Recomputing identical text under the same model wastes compute/API cost; cache by model version + exact text |
| Embedding inversion risk? | Dense vectors can sometimes be partially reconstructed back into source text — treat as sensitive data |
| What does anisotropy mean for embeddings? | Vectors clustering into a narrow cone of the space, inflating baseline similarity and compressing useful signal |
| Where do embeddings get stored/searched at scale? | Vector databases (FAISS, Pinecone, Weaviate, Qdrant, Chroma, Milvus) using approximate nearest-neighbor indexes |
`,

  mcqs: `
**1. What is the main problem one-hot encoding has that embeddings solve?**

A) One-hot vectors take too long to compute  B) One-hot vectors encode no similarity between distinct items and are extremely high-dimensional/sparse  C) One-hot vectors cannot be stored in a database  D) One-hot vectors only work for images

**Answer: B** — every pair of distinct one-hot vectors is equally "different," and realistic vocabularies make the vectors huge and sparse.

**2. If two embedding vectors are both L2-normalized to unit length, which statement is true?**

A) Cosine similarity and dot product give the same ranking  B) Euclidean distance becomes meaningless  C) The vectors are guaranteed to be from the same model  D) Dot product no longer works

**Answer: A** — normalization makes dot product and cosine similarity produce equivalent similarity rankings.

**3. What does the king - man + woman ≈ queen example best illustrate, honestly stated?**

A) A guaranteed, exact property of all embedding models  B) A useful historical illustration from static word2vec-era vectors, not a robust guarantee for modern contextual embeddings  C) A flaw that was later completely disproven  D) A property unique to CLIP

**Answer: B** — it's a genuine but illustrative, dated example; modern contextual/sentence embeddings don't preserve the same clean arithmetic.

**4. Why do dedicated sentence-embedding models (like Sentence-BERT) typically outperform pooling a raw, non-fine-tuned BERT's hidden states for retrieval tasks?**

A) They use a larger vocabulary  B) They are explicitly trained with a contrastive/similarity objective, addressing issues like anisotropy that raw hidden states have  C) They don't use tokenization  D) They only work on English text

**Answer: B** — the training objective is specifically optimized for similarity comparison, unlike a language-modeling objective.

**5. What is the core production risk when you upgrade your embedding model?**

A) The new model will always be slower  B) Old and new vectors become incompatible for comparison, requiring a full corpus re-embed  C) Embeddings become one-hot again  D) There is no risk; embeddings from any two models are always comparable

**Answer: B** — vectors from different model versions are not meaningfully comparable; a migration/re-embedding plan is required.

**6. What does a CLIP-style model fundamentally do?**

A) Compress text embeddings to fewer dimensions  B) Train image and text encoders jointly with a contrastive objective so matching pairs land close together in a shared space  C) Replace the need for tokenization  D) Only work with static, non-contextual word vectors

**Answer: B** — that shared, contrastively-trained space is what enables cross-modal similarity search like text-to-image retrieval.
`,

  "revision-notes": `
**Core idea in 4 lines:** An embedding is a dense, fixed-length vector representing discrete/high-dimensional data so that geometric distance corresponds to semantic similarity. One-hot encoding is the naive baseline it replaces — high-dimensional, sparse, and completely lacking similarity structure. King - man + woman ≈ queen is a genuine but dated, static-word2vec-era illustration of the idea, not a guarantee about modern contextual embeddings.

**How embeddings are learned in 4 lines:** Historically, co-occurrence-based methods (word2vec's context-window prediction, GloVe's global co-occurrence factorization) learned static word vectors from raw text with no labels needed. Modern embeddings come from transformer models — either repurposed hidden-layer activations, or (more commonly in production) dedicated models fine-tuned with a contrastive objective (Sentence-BERT, OpenAI/Cohere embeddings, BGE/E5) specifically to make pooled vectors directly comparable.

**Similarity and dimensionality in 4 lines:** Cosine similarity (direction only, scale-invariant) is the default metric for most text-embedding models; dot product on normalized vectors gives identical rankings and is cheaper at scale; Euclidean distance matters when magnitude itself is meaningful. Higher dimensionality captures more nuance at higher storage/compute cost; Matryoshka-capable models and quantization let production systems tune this tradeoff without retraining.

**Multimodal and production in 5 lines:** CLIP-style models train text and image encoders contrastively into one shared space, enabling cross-modal search — genuinely useful but should be validated empirically per use case, not assumed to behave identically to text-only similarity. In production, the same model and preprocessing must be used for both corpus and query embeddings; cache aggressively by model version and exact text; tag every stored vector with its model version; and treat any embedding model upgrade as a full corpus re-embedding migration, typically executed as a blue-green cutover.

**Where this leads:** Embeddings are the input; the Vector Search skill covers how similarity queries are executed efficiently at scale (approximate nearest-neighbor indexes), the Vector Databases skills (FAISS/Pinecone/Weaviate/Qdrant/Chroma/Milvus) cover where vectors are stored and served, and the RAG skill covers the dominant production application: retrieving relevant chunks by embedding similarity before generating an LLM answer.
`,

  "learning-roadmap": `
A realistic path to production-level embedding fluency (adjust pace to your background):

**Week 1 — Foundations and intuition.** Read Overview through Problem It Solves; work through Beginner Concepts by hand (compute one-hot vs. embedding similarity on paper for a few words). Milestone: explain to someone else, correctly and with appropriate hedging, why king - man + woman ≈ queen is interesting but shouldn't be over-claimed.

**Week 2 — How embeddings are learned.** Study Intermediate Concepts: word2vec/GloVe intuition, then contextual/transformer-based embeddings and contrastive training. Run Lab 1 (word similarity playground). Milestone: articulate the difference between static and contextual embeddings without notes.

**Week 3 — Similarity metrics and hands-on code.** Work through the worked Python example, implement cosine similarity from scratch (Coding Question 1), and complete Lab 2 (mini semantic search engine). Milestone: a working local semantic search tool over your own small corpus.

**Week 4 — Advanced concepts and internals.** Read Advanced Concepts (dimensionality tradeoffs, Matryoshka, multimodal, anisotropy) and Internal Working/Architecture/Data Flow. Milestone: draw the tokenize-to-embedding pipeline diagram from memory.

**Week 5 — Production discipline.** Read Production Usage, Best Practices, Anti-Patterns, and Security. Complete Lab 3 (instrumented embedding microservice). Milestone: a running, cached, monitored embedding service.

**Week 6 — The re-embedding problem and interview readiness.** Complete Lab 4 (model migration drill); go through Interview Questions and Coding Questions until you can answer them unprompted. Milestone: a written migration runbook plus fluent answers to the senior interview questions.

Then continue to **Vector Search** on this platform — everything here compounds directly there, followed by the **Vector Databases** category (FAISS/Pinecone/Weaviate/Qdrant/Chroma/Milvus) and finally **RAG**.
`,

  "official-docs": `
- [Sentence-Transformers documentation](https://www.sbert.net/) — the standard open-source library for sentence/text embeddings; excellent pooling and training documentation.
- [Hugging Face MTEB (Massive Text Embedding Benchmark) leaderboard](https://huggingface.co/spaces/mteb/leaderboard) — the standard public comparison point across embedding models and tasks; always cross-check against your own domain data.
- [OpenAI embeddings documentation](https://platform.openai.com/docs/guides/embeddings) — commercial embedding API reference, including Matryoshka-style truncation guidance.
- [Cohere embed documentation](https://docs.cohere.com/) — commercial embedding API with strong multilingual and retrieval-focused documentation.
- [Gensim documentation](https://radimrehurek.com/gensim/) — the standard library for classic word2vec/GloVe/FastText usage and training.
- [Hugging Face Transformers documentation](https://huggingface.co/docs/transformers) — for working with raw transformer hidden states and CLIP-style models directly.
`,

  books: `
- **Speech and Language Processing** — Jurafsky & Martin (free online draft chapters available). The vector semantics and embeddings chapters are the clearest academic-grade treatment of distributional semantics through modern embeddings.
- **Natural Language Processing with Transformers** — Tunstall, von Werra & Wolf. Practical, code-forward coverage of transformer-based embeddings and how to fine-tune them, from Hugging Face authors.
- **Deep Learning** — Goodfellow, Bengio & Courville. Foundational theory for the neural-network machinery (including word embeddings as a learned representation) underneath modern models.
- **Introduction to Information Retrieval** — Manning, Raghavan & Schütze (free online). Essential background on the retrieval problem embeddings were eventually applied to, including the pre-embedding keyword-search era for honest historical context.
- **Designing Machine Learning Systems** — Chip Huyen. Strong production-systems framing for embedding pipelines, versioning, and retrieval-serving architecture in real ML systems.
`,

  blogs: `
- **Sebastian Ruder's blog** (ruder.io) — long-running, deeply technical NLP and embeddings coverage from a well-known NLP researcher.
- **Pinecone's learning center** (pinecone.io/learn) — practically-oriented explainers on embeddings and vector search specifically written for engineers building retrieval systems.
- **Hugging Face blog** — frequent, high-signal posts on new embedding models, benchmarks, and training techniques as they ship.
- **OpenAI blog** — release posts for new embedding models (e.g. Matryoshka-capable text-embedding models), with direct technical detail on tradeoffs.
- **Jay Alammar's illustrated blog** (jalammar.github.io) — some of the clearest visual explanations of transformers and embeddings available anywhere; start here if the internal-working diagrams in this page need a second pass.
`,

  "research-papers": `
This topic has a genuinely rich and foundational paper trail — real, well-known papers, not thin coverage:

- **"Efficient Estimation of Word Representations in Vector Space"** (Mikolov et al., 2013) — the original word2vec paper introducing CBOW and Skip-gram.
- **"Distributed Representations of Words and Phrases and their Compositionality"** (Mikolov et al., 2013) — the companion paper covering negative sampling and the analogy experiments (including the king/queen-style examples).
- **"GloVe: Global Vectors for Word Representation"** (Pennington, Socher & Manning, 2014) — the co-occurrence-matrix-factorization alternative to word2vec.
- **"Enriching Word Vectors with Subword Information"** (Bojanowski et al., 2017) — FastText's subword-aware embeddings.
- **"Deep contextualized word representations"** (Peters et al., 2018) — ELMo, the first widely-adopted contextual embedding approach.
- **"BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"** (Devlin et al., 2018) — the transformer model whose hidden states became a standard (if imperfect) embedding source.
- **"Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks"** (Reimers & Gurevych, 2019) — the paper defining how modern sentence-embedding models are trained and evaluated.
- **"Learning Transferable Visual Models From Natural Language Supervision"** (Radford et al., 2021) — the CLIP paper, foundational for multimodal embeddings.
- **"MTEB: Massive Text Embedding Benchmark"** (Muennighoff et al., 2022) — the standard benchmark suite for comparing text embedding models across many tasks.

If you want to go one level deeper into the mechanism producing modern embeddings, the closest foundational reading is the original **"Attention Is All You Need"** (Vaswani et al., 2017) transformer paper, covered in depth in the Transformers/Attention skills on this platform.
`,

  videos: `
- **Jay Alammar — "The Illustrated Word2Vec" and "The Illustrated Transformer"** (talks and accompanying blog posts) — some of the most widely recommended visual walkthroughs of embedding mechanics anywhere.
- **Andrej Karpathy — various deep-learning-from-scratch lecture content** — while broader than embeddings alone, his ground-up explanations of the neural-network machinery make the "embeddings as a learned byproduct" story concrete.
- **Stanford CS224N (Natural Language Processing with Deep Learning) lecture recordings** — the word2vec/GloVe lectures specifically are a rigorous, widely-used academic treatment.
- **Pinecone and Weaviate YouTube channels** — practitioner-focused talks on embeddings for retrieval, chunking strategy, and vector search tradeoffs, aimed squarely at engineers building production systems.
- **Hugging Face's course videos on sentence-transformers and semantic search** — hands-on, code-forward walkthroughs matching this page's worked examples.
`,

  "github-repos": `
- [UKPLab/sentence-transformers](https://github.com/UKPLab/sentence-transformers) — the reference implementation and model hub for sentence embeddings; the single most useful repo for this whole topic.
- [openai/CLIP](https://github.com/openai/CLIP) — the original CLIP implementation and pretrained checkpoints for multimodal embeddings.
- [facebookresearch/fastText](https://github.com/facebookresearch/fastText) — subword-aware static embeddings, still useful for lightweight/offline NLP.
- [RaRe-Technologies/gensim](https://github.com/RaRe-Technologies/gensim) — the standard library for training and using word2vec/GloVe/FastText-style models.
- [facebookresearch/faiss](https://github.com/facebookresearch/faiss) — the reference library for efficient similarity search over large embedding collections (deep-dive in the Vector Search/Vector Databases skills).
- [FlagOpen/FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding) — the BGE family of open embedding models, consistently competitive on public benchmarks.
- [embeddings-benchmark/mteb](https://github.com/embeddings-benchmark/mteb) — the code behind the MTEB leaderboard; useful for running your own domain-specific evaluation harness.
- [huggingface/text-embeddings-inference](https://github.com/huggingface/text-embeddings-inference) — a production-grade serving stack specifically for embedding models, relevant to the Deployment section.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Similarity fundamentals*: implement cosine similarity, dot product, and Euclidean distance from scratch (no numpy), and write test cases proving when cosine and dot-product rankings coincide (normalized vectors) and when they diverge (unnormalized).
2. *Static embeddings*: load a pretrained word2vec or GloVe model with gensim, find nearest neighbors for 10 words of your choice, and attempt 5 analogy queries — write up which ones worked and which didn't, and why (tie back to the honest-hedge discussion).
3. *Sentence embeddings*: embed a set of 50 sentences spanning 5 topics with a sentence-transformer model, cluster them (k-means is fine) using the embeddings, and check whether the clusters recover the 5 topics.
4. *Chunking and retrieval*: take a long document, chunk it three different ways (fixed-size, sentence-boundary-aware, paragraph-based), embed each chunking strategy's output, and compare retrieval quality against a small hand-written set of test queries.
5. *Caching and versioning*: build a small embedding cache keyed by model version and text hash; simulate a "model upgrade" and verify old cache entries are correctly treated as invalid for the new model.
6. *Approximate nearest neighbor*: implement brute-force top-K similarity search, then install FAISS and reproduce the same top-K results with an ANN index — measure the speed difference and any recall tradeoff, bridging directly into the Vector Search skill.
7. *Multimodal*: using a CLIP-style model, embed a handful of images and a handful of captions, and verify that matching image-caption pairs score higher than mismatched pairs — write down where the approach seems to break down.

External sets: Hugging Face's own sentence-transformers training tutorials (hands-on notebooks), the MTEB benchmark tasks (for a rigorous evaluation exercise), and Kaggle's various semantic-similarity/duplicate-question datasets (e.g. Quora Question Pairs-style tasks) for realistic practice data.
`,

  "architecture-diagram": `
The reference production architecture for an embedding-powered retrieval system — the shape that feeds directly into the Vector Search, Vector Databases, and RAG skills:

~~~mermaid
flowchart TB
    Docs["Source documents\n(PDFs, web pages, DB rows, tickets)"] --> Chunk["Chunking service"]
    Chunk --> EmbedIngest["Embedding service\n(batched, cached, version-tagged)"]
    EmbedIngest --> VDB[("Vector database\nFAISS / Pinecone / Weaviate / Qdrant / Chroma / Milvus")]

    User["User query"] --> EmbedQuery["Embedding service\n(SAME model as ingestion)"]
    EmbedQuery --> VDB
    VDB --> TopK["Top-K nearest-neighbor chunks"]
    TopK --> Rerank["Optional reranker\n(cross-encoder)"]
    Rerank --> LLM["LLM (RAG answer generation)"]
    LLM --> User

    subgraph Ops["Operational concerns"]
        Cache["Embedding cache\n(model_version + text hash)"]
        Version["Model version tagging on every stored vector"]
        Monitor["Latency / throughput / cache hit rate / cost monitoring"]
    end
    EmbedIngest -.-> Ops
    EmbedQuery -.-> Ops
~~~

Every box past the embedding service has a dedicated skill on this platform (Vector Search for the nearest-neighbor algorithms, the individual Vector Databases skills for storage/indexing specifics, RAG for the full generation loop) — this diagram is the map of how they compose around embeddings as the shared input format.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Embeddings))
    Core idea
      Dense vector representation
      Distance equals similarity
      One-hot baseline and its limits
    How they're learned
      Co-occurrence: word2vec, GloVe
      Subword: FastText
      Contextual: ELMo, BERT
      Contrastive: Sentence-BERT, CLIP
    Similarity
      Cosine similarity
      Dot product
      Euclidean distance
      Normalization
    Word vs sentence embeddings
      Pooling: mean, CLS, max
      Dedicated sentence models
    Advanced topics
      Dimensionality tradeoffs
      Matryoshka representation learning
      Quantization
      Anisotropy
      Multimodal: CLIP
    Production
      Model selection
      Caching
      Version tagging
      Re-embedding migration
      Security: inversion, access control
    Ecosystem
      Vector Search
      Vector Databases: FAISS Pinecone Weaviate Qdrant Chroma Milvus
      RAG
~~~
`,
};

export default embeddings;
