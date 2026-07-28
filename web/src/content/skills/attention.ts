import type { SkillContent } from "../types";

/**
 * Attention — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const attention: SkillContent = {
  overview: `
Attention is the mechanism that lets a neural network dynamically decide, for every single output it produces, which parts of the input deserve the most focus. Instead of squeezing an entire sentence, image, or document into one fixed-size vector and hoping nothing important got lost, attention computes a fresh, weighted view over the whole input each time the model needs to make a decision. It is the single most consequential idea in modern deep learning — the mechanism that made the Transformer possible, and by extension the mechanism underneath GPT, Claude, Gemini, BERT, Vision Transformers, Whisper, and essentially every frontier model trained since 2017.

For an AI engineer, understanding attention deeply is not optional trivia — it is the difference between treating large language models as a black box and being able to reason about context windows, quadratic scaling costs, why long documents are expensive, why "attention sinks" and positional encoding schemes exist, why retrieval-augmented generation is even necessary, and why certain architectural choices (grouped-query attention, sliding-window attention, KV-cache management) show up in every serious inference-serving stack. This page treats attention as its own first-class skill because the mechanism has enough depth — the math, the engineering, the failure modes — to deserve dedicated mastery independent of the full Transformer architecture built on top of it. See the **Transformers** skill for how attention combines with feed-forward layers, residual connections, and layer normalization into the full architecture; this page goes deep on the attention computation itself.

Key characteristics: attention is a **content-based, differentiable, weighted-averaging** operation. It takes a set of vectors (values), decides how much each one matters for the current context (via a compatibility score between a query and a set of keys), turns those scores into a probability distribution (softmax), and returns a weighted sum. Every step is differentiable, so the network learns, through gradient descent, exactly what to attend to — nobody hand-designs the "rules" for what's important. That single property — learned, dynamic, content-based routing of information — is why attention generalizes across language, vision, audio, and multimodal data with almost no changes to the core math.
`,

  history: `
Attention was not born inside the Transformer — it was invented three years earlier to fix a specific, well-understood failure of sequence-to-sequence (seq2seq) recurrent models, and only later did researchers realize the recurrence itself was the part you could throw away.

| Year | Milestone |
|------|-----------|
| 2014 | Sutskever, Vinyals, Le publish seq2seq: encoder RNN compresses a whole sentence into one fixed vector, decoder RNN generates from it. Works, but degrades sharply on long sentences. |
| 2014 | Bahdanau, Cho, Bengio publish "Neural Machine Translation by Jointly Learning to Align and Translate" — the first attention mechanism. The decoder learns to look back at ALL encoder hidden states, weighted by relevance, instead of relying on one fixed vector. |
| 2015 | Luong et al. simplify and generalize attention (dot-product and general scoring functions), making it faster and more widely adopted in NMT systems. |
| 2015 | "Show, Attend and Tell" applies attention to image captioning — proof the idea generalizes beyond text. |
| 2017 | Vaswani et al. publish "Attention Is All You Need" — the Transformer. The radical claim: throw away the recurrence entirely and build a model out of attention plus feed-forward layers alone. Introduces scaled dot-product attention and multi-head attention as we now define them. |
| 2018 | BERT (encoder-only, bidirectional self-attention) and GPT-1 (decoder-only, causal self-attention) show the architecture scales to pretraining at scale. |
| 2019–2020 | GPT-2, GPT-3 scale decoder-only causal attention to billions of parameters, revealing emergent capability with scale. |
| 2020–2022 | A wave of "efficient attention" papers (Linformer, Performer, Longformer, sparse attention, FlashAttention) attacks the quadratic cost problem from different angles. |
| 2022 | FlashAttention (Dao et al.) reformulates the attention computation to be IO-aware on GPUs — same math, dramatically less memory traffic, becoming close to a default in production training and inference. |
| 2023+ | Grouped-query attention (GQA) and multi-query attention (MQA) become standard in production LLMs (LLaMA 2/3, Mistral, and others) to shrink the KV-cache memory cost of inference. |

The throughline: attention was invented to fix a bottleneck problem, then discovered to be powerful enough to replace the architecture it was patching.
`,

  "why-it-exists": `
Before attention, the dominant architecture for sequence tasks (translation, summarization) was the encoder-decoder RNN: an encoder RNN reads the entire input sequence one token at a time and compresses everything it has seen into a single fixed-size vector (the final hidden state). The decoder RNN then has to generate the entire output using only that one vector as its memory of the input.

This creates an **information bottleneck**. A 5-word sentence and a 500-word paragraph both get squeezed into the same fixed-size vector. Early experiments showed translation quality degrading sharply as sentence length grew — by the time the encoder reached the end of a long sentence, information from the beginning had been overwritten or diluted by the recurrent update. The model was structurally incapable of "looking back" at specific earlier words; it only had a blurry summary of everything.

The world before attention also relied on the recurrence itself to propagate information: token 1's influence on token 50 had to travel through 49 sequential hidden-state updates, each one a lossy compression step. Gradients for long-range dependencies had to survive that same 49-step chain during backpropagation, which is exactly the vanishing-gradient problem that made long-range dependencies hard to learn even with LSTMs and GRUs designed to mitigate it.

Attention exists to remove that bottleneck: instead of forcing the decoder to work from one compressed vector, let it look directly at every encoder position and learn which ones matter for the word it's generating right now. The path from any input position to any output position becomes a single, direct, learned weighting — not a multi-step relay race through recurrent state.
`,

  "problem-it-solves": `
Attention concretely removes:

- **The fixed-vector bottleneck**: no more compressing an arbitrarily long input into one vector before the decoder can use it. Every input position remains individually addressable.
- **Long-range dependency decay**: the path length between any two positions in a sequence becomes O(1) (a single attention computation) instead of O(n) (n sequential recurrent steps), which is why Transformers learn long-range dependencies far more reliably than RNNs.
- **Sequential computation during training**: because attention has no recurrence, every position's representation can be computed in parallel across the sequence (subject to causal masking for autoregressive models), which is what made it feasible to train on the scale of data and compute that produced modern LLMs. RNNs process token-by-token and cannot parallelize across the sequence dimension during training.
- **The need for hand-designed alignment**: in classical statistical machine translation, word-alignment between source and target was a separate, explicitly modeled sub-problem. Attention learns "alignment" as a byproduct of end-to-end training — the attention weights end up looking remarkably like alignment maps, without anyone specifying that objective directly.

What attention deliberately does **not** solve:

- **Quadratic compute and memory cost in sequence length.** Full self-attention computes a score for every pair of positions — that is an O(n squared) operation. Attention does not make long-context modeling free; it trades the RNN's sequential-bottleneck problem for a different scaling problem, which is the central topic of the Performance and Scalability sections below.
- **Positional information.** The raw attention operation is permutation-invariant — it has no inherent sense of order. Order must be injected separately (positional encodings/embeddings), which is a Transformer-architecture concern rather than something attention itself provides.
- **Interpretability guarantees.** Attention weights show what the model looked at, not necessarily why, or whether that signal was causally responsible for the output — see the Advanced Concepts and dedicated interpretability caveats later in this page.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, from first principles, why attention exists and what specific failure of early seq2seq models it fixes.
2. Derive and compute the Query-Key-Value attention formula by hand on a small numeric example.
3. Explain precisely why the scaling factor (one over the square root of the key dimension) is necessary for stable gradients, not just a cosmetic detail.
4. Distinguish self-attention from cross-attention and identify which one is used where in encoder-decoder and decoder-only architectures.
5. Implement scaled dot-product attention and full multi-head attention from scratch in PyTorch, including the reshape/transpose mechanics of splitting into heads.
6. Explain how causal masking works mechanically (the mask values, where they're applied, and why) and why autoregressive generation requires it.
7. Reason quantitatively about the compute and memory cost of attention as a function of sequence length, and explain why this is the central scalability bottleneck for long-context models.
8. Critically read attention-weight visualizations while being explicit about what they can and cannot tell you about model behavior.
9. Describe, at a conceptual and appropriately hedged level, the existence and motivation of efficient-attention research directions (sparse, linear, windowed variants) without overclaiming specific numbers or current state of the art.
10. Answer senior-level interview questions about attention internals: masking, multi-head mechanics, complexity, and KV-cache behavior at inference time.
`,

  prerequisites: `
- **Required**: linear algebra fundamentals (vectors, matrices, matrix multiplication, dot products), basic probability (what a softmax/probability distribution is), and comfort reading Python/PyTorch tensor code. Nothing about attention itself is assumed — this page starts from the mechanism's first principles.
- **Helpful**: a working understanding of how a feed-forward neural network is trained with backpropagation and gradient descent (see the **Neural Networks** and **Deep Learning** skills), since attention is just another differentiable module trained the same way.
- **For full architectural context**: this page focuses on the attention computation itself. For how attention combines with residual connections, layer normalization, and feed-forward blocks into a full model, see the **Transformers** skill. For how sequences of tokens become vectors in the first place, see the **Embeddings** skill. For how attention-style similarity search generalizes to retrieval over large corpora, see the **Vector Search** skill.

Dependency links on this platform: **Neural Networks** → **Deep Learning** → **RNNs** (to appreciate the problem attention solves) → **this page** → **Transformers** → **Embeddings** / **Vector Search**.
`,

  "beginner-concepts": `
### The core intuition, without any math yet

Imagine translating the sentence "The animal didn't cross the street because it was too tired" into another language. To translate the word "it" correctly, a translator needs to know that "it" refers to "the animal," not "the street." A model that only has a single blurry summary of the whole sentence has no reliable way to make that connection. A model with attention can, at the moment it processes "it," directly ask: which earlier words are most relevant to me right now? — and it can learn, from data, that "animal" deserves a high score and "street" a lower one.

That is the entire idea of attention: **for every output being produced, dynamically compute a weighted combination of the input, where the weights say how relevant each input position is right now.** Nothing is thrown away up front; the model decides what matters, per step, per word.

### Query, Key, Value — the plain-English version

Attention borrows vocabulary from information retrieval (think of a search engine or a dictionary lookup):

- **Query (Q)**: "what am I looking for right now?" — a vector representing the current position's question.
- **Key (K)**: "what do I contain?" — a vector each input position uses to advertise its content, so it can be compared against a query.
- **Value (V)**: "what do I actually give you if you decide I'm relevant?" — the actual content that gets returned, weighted by relevance.

A rough analogy: searching a library catalog. Your search term is the Query. Every book's catalog card (title, subject tags) is a Key. The actual book you take off the shelf is the Value. You compare your query against every key to get a relevance score, then you walk away with a blend of the values weighted by how relevant each one was — except in attention, you take a little bit of every book, not just the single best match.

### A tiny worked example, step by step

Suppose each word is represented by a 2-dimensional vector (a toy embedding), and we want to compute the attention output for the query word "it" against three words: "animal," "street," "tired."

~~~python
import numpy as np

# Toy 2-D embeddings for three keys/values, and one query vector for "it"
# In a real model these come from learned linear projections (see below);
# here we hardcode illustrative numbers to make the math traceable by hand.
q_it     = np.array([1.0, 0.0])   # query: "it" is looking for something animate/subject-like
k_animal = np.array([0.9, 0.1])
k_street = np.array([0.1, 0.9])
k_tired  = np.array([0.2, 0.2])

v_animal = np.array([10.0, 0.0])  # "value" content each word contributes
v_street = np.array([0.0, 10.0])
v_tired  = np.array([1.0, 1.0])

keys = np.stack([k_animal, k_street, k_tired])
values = np.stack([v_animal, v_street, v_tired])

# Step 1: compatibility scores = dot product of query with each key
scores = keys @ q_it                     # -> [0.9, 0.1, 0.2]
print("raw scores:", scores)

# Step 2: softmax turns scores into a probability distribution (sums to 1)
def softmax(x):
    ex = np.exp(x - x.max())             # subtract max for numerical stability
    return ex / ex.sum()

weights = softmax(scores)
print("attention weights:", weights)     # "animal" gets by far the highest weight

# Step 3: weighted sum of values = the attention output for "it"
output = weights @ values
print("attention output:", output)       # dominated by v_animal, as intended
~~~

Running this by hand: the dot product between the query and "animal"'s key (0.9) is much larger than with "street" (0.1) or "tired" (0.2), because the query vector was constructed to align with the "animal" key. After softmax, "animal" receives the overwhelming majority of the weight, and the final output vector ends up close to v_animal. This is attention working exactly as intended: the model has learned (in a real network, through training — here, by our hand-picked numbers) to route information from the correct antecedent to the pronoun that needs it.

### Why softmax and not just normalizing the raw scores

Softmax does two things a simple average cannot: it makes every weight strictly positive (so nothing gets negative "anti-attention," which would be hard to interpret as a weighted average), and it exaggerates differences — a slightly higher score gets disproportionately more weight, which is exactly the "sharp, decisive selection" behavior attention needs rather than a flat, uninformative average across all positions.
`,

  "intermediate-concepts": `
### From toy vectors to real Q, K, V: linear projections

In a real model, Q, K, and V are not the raw input embeddings — they are three separate **learned linear projections** of the input, so the model can learn different transformations for "what am I looking for," "what do I advertise," and "what do I actually contain."

~~~python
import torch
import torch.nn as nn

d_model = 8   # embedding dimension
d_k = 4       # key/query dimension (often equal to d_model for single-head)

x = torch.randn(1, 5, d_model)  # batch=1, seq_len=5 tokens, d_model features each

W_q = nn.Linear(d_model, d_k, bias=False)
W_k = nn.Linear(d_model, d_k, bias=False)
W_v = nn.Linear(d_model, d_k, bias=False)

Q = W_q(x)   # (1, 5, 4) — one query vector per token
K = W_k(x)   # (1, 5, 4) — one key vector per token
V = W_v(x)   # (1, 5, 4) — one value vector per token
~~~

Every token produces its own Q, K, and V. This is what makes self-attention "self": the same sequence supplies the queries and the keys/values — every token gets to look at every other token (including itself).

### The full scaled dot-product attention formula

The complete formula, applied to whole matrices at once (so every query attends to every key/value in one batched operation):

Attention(Q, K, V) = softmax( (Q times K-transpose) divided by the square root of d_k ) times V

~~~python
import torch
import torch.nn.functional as F
import math

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)   # (..., seq_q, seq_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    weights = F.softmax(scores, dim=-1)                 # normalize over keys
    output = weights @ V                                 # weighted sum of values
    return output, weights
~~~

Note that scores has shape (seq_len_query, seq_len_key) — every query position gets a full row of scores against every key position. This all-pairs comparison is exactly where the quadratic cost comes from, covered fully in Performance below.

### Self-attention vs cross-attention, concretely

- **Self-attention**: Q, K, and V all come from the SAME sequence. Used inside encoder layers (every token attends to every other token in the same input, bidirectionally) and inside decoder layers (a token attends to earlier tokens in the same output being generated, causally masked).
- **Cross-attention**: Q comes from one sequence, K and V come from a DIFFERENT sequence. The classic example: in an encoder-decoder Transformer (like the original machine translation model, or T5), the decoder's cross-attention layer generates queries from the partially-generated output so far, but takes its keys and values from the encoder's output representing the source sentence. This is the direct mechanical descendant of Bahdanau's original 2014 attention — the decoder is literally asking "which parts of the source sentence are relevant to the word I'm about to generate?"

~~~python
# Self-attention: Q, K, V from the same tensor
self_out, _ = scaled_dot_product_attention(Q=x_proj_q, K=x_proj_k, V=x_proj_v)

# Cross-attention: Q from the decoder's current state, K/V from the encoder's output
cross_out, _ = scaled_dot_product_attention(
    Q=decoder_proj_q,        # from decoder hidden states
    K=encoder_proj_k,        # from encoder output
    V=encoder_proj_v,        # from encoder output
)
~~~

A decoder-only model like GPT never needs cross-attention at all — there is no separate encoder sequence to attend to. Every layer is self-attention over the single sequence being generated, with causal masking. Encoder-decoder models (translation, summarization with a distinct source/target) use both: self-attention within the encoder, self-attention within the decoder, and cross-attention connecting the two.

### Why divide by the square root of d_k

As the key dimension d_k grows, the dot product between two random vectors grows in magnitude too (its variance scales linearly with d_k, assuming roughly independent, zero-mean components). Without correction, raw dot-product scores for larger d_k become large in magnitude, which pushes softmax into a very "peaked" regime — a small handful of inputs get almost all of the probability mass and the rest get values extremely close to zero. That is dangerous for training: in the flat tails of softmax, the gradient is vanishingly small, so backpropagation barely updates the weights that produced those scores. Dividing by the square root of d_k rescales the scores back down to roughly unit variance regardless of d_k, keeping softmax in a numerically well-behaved region where gradients still flow. This is not a minor implementation detail — the original Transformer paper explicitly calls this out as necessary for training stability at the dimensions they used (d_k = 64 per head), and removing it measurably hurts training in practice.
`,

  "advanced-concepts": `
### Multi-head attention: mechanics in full

Running a single attention computation over the full d_model dimension forces the model to squeeze every kind of relationship — syntactic, semantic, positional — into one shared similarity space. Multi-head attention instead splits Q, K, and V into several smaller subspaces ("heads"), runs scaled dot-product attention independently and in parallel within each subspace, then concatenates the results and projects back to d_model. Each head is free to specialize — empirically, different heads in trained Transformers do learn to track different things (some track adjacent-token relationships, some track syntactic dependencies, some track long-range coreference).

The mechanical steps:

1. Project the input into full-size Q, K, V of shape (seq_len, d_model), same as single-head attention.
2. **Reshape and split** each of Q, K, V into h heads, each of dimension d_k = d_model / h.
3. Run scaled dot-product attention **independently per head** (this is a batched operation across the head dimension — no extra loop needed in practice).
4. **Concatenate** the h head outputs back into a single (seq_len, d_model) tensor.
5. Apply one final learned linear projection (W_o) to mix information across heads back into the model's residual stream.

### Full from-scratch PyTorch implementation

~~~python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


def scaled_dot_product_attention(q, k, v, mask=None):
    """q, k, v: (batch, heads, seq_len, d_k). mask: broadcastable to
    (batch, 1, seq_q, seq_k) with 0 where attention is disallowed."""
    d_k = q.size(-1)
    scores = q @ k.transpose(-2, -1) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    attn = F.softmax(scores, dim=-1)
    out = attn @ v
    return out, attn


class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int, dropout: float = 0.1):
        super().__init__()
        assert d_model % num_heads == 0, "d_model must divide evenly into heads"
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        # One combined projection each for Q, K, V is a common, efficient choice
        self.W_q = nn.Linear(d_model, d_model, bias=False)
        self.W_k = nn.Linear(d_model, d_model, bias=False)
        self.W_v = nn.Linear(d_model, d_model, bias=False)
        self.W_o = nn.Linear(d_model, d_model, bias=False)
        self.dropout = nn.Dropout(dropout)

    def split_heads(self, x: torch.Tensor) -> torch.Tensor:
        # (batch, seq_len, d_model) -> (batch, heads, seq_len, d_k)
        batch, seq_len, _ = x.shape
        x = x.view(batch, seq_len, self.num_heads, self.d_k)
        return x.transpose(1, 2)

    def combine_heads(self, x: torch.Tensor) -> torch.Tensor:
        # (batch, heads, seq_len, d_k) -> (batch, seq_len, d_model)
        batch, heads, seq_len, d_k = x.shape
        x = x.transpose(1, 2).contiguous()
        return x.view(batch, seq_len, heads * d_k)

    def forward(self, x_q, x_kv=None, mask=None):
        # x_kv defaults to x_q for self-attention; pass a different tensor
        # (e.g. encoder output) for cross-attention.
        x_kv = x_q if x_kv is None else x_kv

        q = self.split_heads(self.W_q(x_q))
        k = self.split_heads(self.W_k(x_kv))
        v = self.split_heads(self.W_v(x_kv))

        out, attn_weights = scaled_dot_product_attention(q, k, v, mask=mask)
        out = self.combine_heads(out)
        out = self.dropout(self.W_o(out))
        return out, attn_weights


# Sanity check
mha = MultiHeadAttention(d_model=64, num_heads=8)
x = torch.randn(2, 10, 64)          # batch=2, seq_len=10, d_model=64
out, attn = mha(x)                   # self-attention
print(out.shape)                     # torch.Size([2, 10, 64])
print(attn.shape)                    # torch.Size([2, 8, 10, 10]) — per-head weights
~~~

A production consideration baked into this implementation: masked_fill with negative infinity before softmax, not after — applying the mask post-softmax would leave nonzero probability mass on disallowed positions and require renormalization, which is both slower and easy to get subtly wrong.

### Causal (masked) attention for autoregressive generation

GPT-style decoder-only models generate one token at a time, left to right, and must never be allowed to "cheat" by looking at future tokens during training — otherwise the model would trivially learn to copy the next token instead of learning to predict it. Causal masking enforces this: position i's query is only allowed to attend to keys at positions less than or equal to i.

~~~python
def causal_mask(seq_len: int) -> torch.Tensor:
    # Lower-triangular matrix: 1 = allowed, 0 = disallowed
    return torch.tril(torch.ones(seq_len, seq_len)).bool()

seq_len = 5
mask = causal_mask(seq_len)
print(mask.int())
# tensor([[1, 0, 0, 0, 0],
#         [1, 1, 0, 0, 0],
#         [1, 1, 1, 0, 0],
#         [1, 1, 1, 1, 0],
#         [1, 1, 1, 1, 1]])
~~~

Concretely: row 3 (position index 2, zero-indexed) has 1s in columns 0, 1, 2 and 0s afterward — meaning the third token's query can attend to itself and the two tokens before it, but nothing after. When this mask is passed into scaled_dot_product_attention, every disallowed score gets set to negative infinity before softmax, so after softmax those positions receive exactly zero weight — no gradient signal and no information leaks backward from the future. This single triangular mask is the entire mechanism that turns bidirectional self-attention into autoregressive, left-to-right generation; nothing else about the attention computation changes.

Encoder self-attention (as in BERT) uses no causal mask at all — every token attends to every other token in both directions, because the whole input is available at once and there is no notion of "future" to hide.

### The KV-cache: why causal attention makes autoregressive inference cheap-ish

At inference time, a causal decoder generates tokens one at a time. Naively, generating token t+1 would require recomputing K and V for all t previous tokens from scratch. Because causal masking means past tokens' keys and values never depend on future tokens, they can be computed once and cached — the KV-cache. Each new generation step only computes Q, K, V for the single new token, appends its K and V to the cache, and attends the new query against the full cached K/V. This is why production LLM serving systems dedicate enormous engineering effort (and GPU memory) to KV-cache management — it directly explains why grouped-query attention and multi-query attention (sharing K/V projections across multiple query heads) exist: they shrink the cache's memory footprint, which is often the real bottleneck on long-context inference, not raw compute.
`,

  "internal-working": `
Tracing one attention call end to end, from raw token embeddings to a context-aware output vector:

~~~mermaid
flowchart TD
    A["Input embeddings + positional info\n(seq_len, d_model)"] --> B["Linear projection W_q"]
    A --> C["Linear projection W_k"]
    A --> D["Linear projection W_v"]
    B --> Q["Q (seq_len, d_k)"]
    C --> K["K (seq_len, d_k)"]
    D --> V["V (seq_len, d_k)"]
    Q --> E["Q times K-transpose\n(seq_len, seq_len) raw scores"]
    K --> E
    E --> F["Divide by sqrt(d_k)\n(scale for stable gradients)"]
    F --> G{"Causal mask?"}
    G -- yes --> H["Set disallowed positions to -infinity"]
    G -- no --> I["Leave scores unmasked"]
    H --> J["Softmax over key dimension\n(rows sum to 1)"]
    I --> J
    J --> W["Attention weights\n(seq_len, seq_len)"]
    W --> L["Weighted sum: weights times V"]
    V --> L
    L --> O["Context-aware output\n(seq_len, d_k) per head"]
~~~

Step by step:

1. **Projection**: the same input embeddings are transformed three separate ways by three learned weight matrices, producing Q, K, and V. These are ordinary matrix multiplications — no attention-specific machinery yet.
2. **Compatibility scoring**: Q is matrix-multiplied with the transpose of K, producing a full seq_len by seq_len matrix where entry (i, j) is the raw dot-product similarity between query i and key j. This is the all-pairs comparison that gives attention its expressive power and its quadratic cost.
3. **Scaling**: every score is divided by the square root of d_k, keeping the distribution of scores in a numerically stable range regardless of dimensionality.
4. **Masking (conditional)**: for causal/autoregressive attention, disallowed future positions are overwritten with negative infinity before softmax so they receive exactly zero probability afterward. For encoder self-attention there is typically no mask (aside from padding masks to ignore padded tokens in a batch).
5. **Softmax**: applied row-wise (over the key dimension), turning each row of scores into a proper probability distribution that sums to 1 — this row is the attention weight vector for one query position.
6. **Weighted sum**: the attention-weight matrix is matrix-multiplied with V, producing one output vector per query position — a blend of all the value vectors, weighted by relevance.
7. **(Multi-head only)** steps 1–6 happen independently per head in parallel subspaces; outputs are concatenated and passed through one final output projection (W_o) to mix information across heads.

Everything from step 1 through step 6 is fully differentiable matrix arithmetic — softmax and matrix multiplication both have well-defined gradients, which is why the network can learn, via ordinary backpropagation, exactly which content should attend to which other content, with no attention-specific training tricks required.
`,

  architecture: `
Attention is not deployed as a standalone system — it is a building block placed inside larger architectures. Understanding where it sits is essential to reasoning about a real model.

### Where attention sits inside a Transformer block

~~~mermaid
flowchart TB
    subgraph Block["One Transformer layer"]
        In["Layer input"] --> LN1["LayerNorm"]
        LN1 --> MHA["Multi-head attention\n(self- or cross-attention)"]
        MHA --> Add1["Residual add: input + MHA output"]
        In --> Add1
        Add1 --> LN2["LayerNorm"]
        LN2 --> FFN["Feed-forward network"]
        FFN --> Add2["Residual add"]
        Add1 --> Add2
        Add2 --> Out["Layer output"]
    end
~~~

Attention is one of exactly two sublayers repeated N times to build a full model (the other being the position-wise feed-forward network); the **Transformers** skill covers the full stacking, residual connections, and normalization choices in depth. What matters here is that attention's job inside this block is narrow and specific: mix information across sequence positions. The feed-forward sublayer that follows operates on each position independently and is where most of the parameter count and per-token nonlinear transformation actually lives.

### Encoder-only, decoder-only, and encoder-decoder architectures

| Architecture family | Attention types used | Example models | Typical use case |
|---|---|---|---|
| Encoder-only | Bidirectional self-attention only | BERT, RoBERTa | Classification, embeddings, understanding tasks |
| Decoder-only | Causal (masked) self-attention only | GPT family, LLaMA, most modern chat LLMs | Autoregressive generation |
| Encoder-decoder | Bidirectional self-attention (encoder) + causal self-attention (decoder) + cross-attention (decoder attends to encoder) | Original Transformer (translation), T5, BART | Sequence-to-sequence tasks with a distinct source and target |

A production system built around attention typically layers: tokenization and embedding lookup, N stacked attention+FFN blocks (the model itself), a final projection to vocabulary logits (for generation) or a pooling head (for classification/embeddings), and — at inference time — a KV-cache management layer that persists across generation steps. That last layer is purely an engineering artifact of causal attention's structure, not part of the mathematical definition of attention itself, but it is architecturally central to every production LLM-serving stack (see vLLM, TensorRT-LLM style systems).
`,

  "data-flow": `
Tracing one forward pass of self-attention for a single input sequence, end to end, as a sequence diagram:

~~~mermaid
sequenceDiagram
    participant Emb as Embeddings + positions
    participant Wq as W_q projection
    participant Wk as W_k projection
    participant Wv as W_v projection
    participant Score as Score + scale
    participant Mask as Optional causal mask
    participant Soft as Softmax
    participant Wsum as Weighted sum with V
    participant Wo as Output projection W_o

    Emb->>Wq: token vectors (seq_len, d_model)
    Emb->>Wk: token vectors (seq_len, d_model)
    Emb->>Wv: token vectors (seq_len, d_model)
    Wq-->>Score: Q (seq_len, d_k)
    Wk-->>Score: K (seq_len, d_k)
    Score->>Score: Q times K-transpose, divide by sqrt(d_k)
    Score->>Mask: raw scaled scores
    Mask->>Mask: set future positions to -infinity (causal only)
    Mask->>Soft: masked scores
    Soft->>Soft: softmax over key dimension
    Soft->>Wsum: attention weights (seq_len, seq_len)
    Wv-->>Wsum: V (seq_len, d_k)
    Wsum->>Wo: weighted output per position (seq_len, d_k)
    Wo->>Wo: concatenate heads, project back to d_model
    Wo-->>Emb: context-aware representation feeds into next layer
~~~

The most important thing to internalize from this trace: the score-mask-softmax-weighted-sum chain runs once per layer, per head, and its cost is dominated by the (seq_len, seq_len) score matrix — every other tensor in the pipeline scales linearly with sequence length, but that one scales quadratically. In a real forward pass through a stack of N layers, this entire diagram repeats N times, with the output of each layer's attention (plus its feed-forward sublayer) becoming the input embeddings for the next layer. At inference time with a KV-cache, the Wk and Wv steps for previously-seen tokens are skipped entirely — only the newest token's Q, K, V are computed fresh, and its Q is scored against the full cached K.
`,

  "production-usage": `
### How real teams actually run attention-based models

Almost nobody hand-writes attention in production — it is used through library implementations that fuse the operations for speed and numerical stability. The two dominant patterns:

1. **Training and research**: PyTorch's built-in torch.nn.functional.scaled_dot_product_attention (SDPA) automatically dispatches to a fused, memory-efficient kernel (commonly a FlashAttention-family implementation) when the shapes and hardware allow it, instead of materializing the full (seq_len, seq_len) score matrix in memory.

~~~python
import torch
import torch.nn.functional as F

# PyTorch's fused SDPA — same math as scaled_dot_product_attention above,
# but automatically dispatches to an efficient fused CUDA kernel.
q = torch.randn(2, 8, 128, 64, device="cuda")  # (batch, heads, seq_len, d_k)
k = torch.randn(2, 8, 128, 64, device="cuda")
v = torch.randn(2, 8, 128, 64, device="cuda")

out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
# is_causal=True applies the triangular mask internally without ever
# materializing it as a dense tensor — a real memory saving at long
# sequence lengths.
~~~

2. **Inference serving**: dedicated serving frameworks (vLLM, TensorRT-LLM, and similar) implement paged/managed KV-cache allocation on top of fused attention kernels, because at serving scale the KV-cache — not the attention math itself — is usually the binding memory constraint across many concurrent requests.

### Operational defaults worth knowing

- Use the framework's fused attention (SDPA, FlashAttention) rather than a naive hand-rolled implementation whenever training or serving at any real sequence length — the memory savings alone often decide whether a given sequence length fits on a GPU at all.
- Track d_model / num_heads ratio: heads must divide d_model evenly; common production configurations use d_k (dimension per head) around 64–128.
- Grouped-query attention (fewer K/V head groups than Q heads) or multi-query attention (a single shared K/V head) are common production choices specifically to shrink the KV-cache size for long-context serving — a direct engineering response to the cost analyzed in the Performance section.
- Dropout on attention weights (as in the from-scratch implementation above) is a training-time regularizer; it is disabled at inference (model.eval()) like all dropout layers.
`,

  "industry-examples": `
- **OpenAI (GPT family)**: decoder-only causal self-attention is the entire backbone of every GPT model; nearly all of the model's parameters and computation live inside stacked causal self-attention plus feed-forward blocks.
- **Google (original Transformer, BERT, T5)**: Google Brain authored the original scaled dot-product / multi-head attention formulation in "Attention Is All You Need," and later shipped BERT (bidirectional self-attention for language understanding) and T5 (a full encoder-decoder using self- and cross-attention) as foundational open research that the whole field built on.
- **Meta (LLaMA family)**: adopted grouped-query attention in later LLaMA generations specifically to reduce KV-cache memory during inference, trading a small amount of representational flexibility per head for substantially cheaper long-context serving — a widely copied production pattern.
- **Anthropic (Claude)**: builds on the decoder-only causal-attention Transformer lineage, with published research and engineering emphasis on interpretability of attention-adjacent internals (mechanistic interpretability work examining what individual attention heads compute) as part of responsible-scaling and safety research.
- **NVIDIA**: drives much of the systems-level engineering around efficient attention execution on GPUs — fused kernels, TensorRT-LLM's attention implementations, and hardware/software co-design (tensor cores, memory bandwidth optimization) that makes large-scale attention computation tractable at all.

The consistent industry pattern: the core attention formula has been stable since 2017; almost all of the differentiation between companies' production systems is in how efficiently they execute that same formula at scale (kernel fusion, KV-cache strategy, head-count/dimension tradeoffs) rather than in changing the underlying mathematics.
`,

  "best-practices": `
1. **Use fused, framework-provided attention kernels (SDPA/FlashAttention) instead of a naive hand-rolled score matrix in any real training or serving workload** — the memory savings at longer sequence lengths are not optional at scale, they are the difference between fitting on a GPU and OOMing.
2. **Always scale by the square root of d_k** — never skip this even in "simplified" reimplementations; it directly affects gradient stability and is not a stylistic choice.
3. **Apply the causal mask before softmax, using negative infinity, never after softmax** — applying a mask post-softmax requires renormalization and is a common source of subtle correctness bugs.
4. **Choose num_heads so d_model divides evenly** — an uneven split either fails outright or silently truncates a dimension depending on the implementation; assert this at construction time.
5. **Cache K and V during autoregressive generation rather than recomputing them for the whole prefix at every step** — this is the single highest-leverage inference optimization for causal decoder models.
6. **Consider grouped-query or multi-query attention for long-context serving workloads** where KV-cache memory, not FLOPs, is the bottleneck.
7. **Mask padding tokens in batched training, in addition to any causal mask** — otherwise the model wastes attention weight on meaningless padding and gradients get polluted by it.
8. **Don't over-interpret raw attention weights as a complete explanation of model behavior** — treat them as one diagnostic signal among several (see Advanced Concepts / interpretability caveats), not ground truth about causal reasoning.
9. **Profile before optimizing attention** — confirm attention (versus the feed-forward layers, versus data loading, versus communication overhead in distributed training) is actually the bottleneck before reaching for an efficient-attention variant.
10. **Keep attention dropout enabled during training and disabled at inference**, consistent with standard dropout hygiene; verify model.eval() is set before any evaluation or serving pass.
11. **When implementing multi-head attention from scratch for learning purposes, still validate output shapes against a reference (e.g. torch.nn.MultiheadAttention or F.scaled_dot_product_attention) on toy inputs** before trusting the implementation in a larger model.
12. **Track sequence length growth as a first-class cost driver in any planning around context window size** — doubling context length roughly quadruples raw self-attention compute in a naive implementation, which should directly inform architecture and infrastructure decisions.
`,

  "anti-patterns": `
### Forgetting the scaling factor

~~~python
# Wrong: unscaled dot-product scores blow up for larger d_k,
# pushing softmax into a near-one-hot regime with vanishing gradients.
scores_bad = Q @ K.transpose(-2, -1)
weights_bad = F.softmax(scores_bad, dim=-1)

# Right: scale before softmax
scores_good = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))
weights_good = F.softmax(scores_good, dim=-1)
~~~

### Masking after softmax instead of before

~~~python
# Wrong: this zeroes out disallowed positions AFTER they already
# influenced the softmax denominator, so remaining weights don't
# sum to 1 and the distribution is subtly incorrect.
weights_bad = F.softmax(scores, dim=-1)
weights_bad = weights_bad * mask

# Right: mask the raw scores with negative infinity, THEN softmax,
# so disallowed positions contribute exactly zero to the denominator.
scores_masked = scores.masked_fill(mask == 0, float("-inf"))
weights_good = F.softmax(scores_masked, dim=-1)
~~~

### Other production-grade attention anti-patterns

- **Materializing the full dense (seq_len, seq_len) score matrix at long context lengths when a fused kernel is available** — this is the single most common avoidable cause of out-of-memory errors when scaling up context windows; use SDPA/FlashAttention instead of a manual implementation whenever sequence length is nontrivial.
- **Recomputing K and V for the entire prefix at every generation step** instead of maintaining a KV-cache — this turns generation from roughly linear cost per new token into quadratic cost for no benefit.
- **Ignoring padding masks in batched training** — a batch with variable-length sequences padded to a common length will leak attention weight onto meaningless padding tokens unless they are explicitly masked out, silently degrading quality.
- **Treating attention-head count as a free hyperparameter to maximize** — more heads means smaller d_k per head; past a point, individual heads have too little capacity to represent meaningful relationships, and the split becomes counterproductive.
- **Presenting a single attention-weight heatmap as proof of "why" the model produced an output** — see the interpretability caveats in Advanced Concepts; this is a common and misleading claim in blog posts and even some papers.
- **Assuming causal masking is only relevant to decoder-only models** — encoder-decoder decoders also need causal self-attention over their own generated tokens, in addition to (unmasked) cross-attention over the encoder output; conflating the two mask requirements is a frequent implementation bug.
`,

  performance: `
### Measure first

~~~python
import torch

# torch.profiler is the standard tool for seeing where time and memory
# actually go inside an attention-heavy model.
with torch.profiler.profile(
    activities=[torch.profiler.ProfilerActivity.CPU, torch.profiler.ProfilerActivity.CUDA],
    profile_memory=True,
) as prof:
    output = model(input_ids)

print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))
~~~

For GPU memory specifically, torch.cuda.max_memory_allocated() before/after an attention-heavy forward pass quickly confirms whether the score matrix is the actual bottleneck versus, for example, the feed-forward layers or optimizer state.

### The core cost fact: quadratic in sequence length

Standard scaled dot-product attention computes a full seq_len by seq_len score matrix. For a sequence of length n, this means:

- **Compute**: O(n squared times d) for the Q times K-transpose step (and the same order again for the weighted sum with V), where d is the per-head dimension. Doubling sequence length roughly quadruples the attention compute (though total model compute also includes the feed-forward layers, which scale linearly in n).
- **Memory**: naively materializing the score matrix costs O(n squared) memory per head, per layer, per batch item — this is frequently the actual limiting factor on how long a context window a given amount of GPU memory can support, well before compute becomes the bottleneck.

This quadratic scaling is why "just increase the context window" is not a free architectural change — going from a few thousand tokens of context to hundreds of thousands multiplies the attention cost by a very large factor, and is the central, well-known scalability challenge for long-context language models.

### The optimization hierarchy (apply in order)

1. **Use a fused kernel (SDPA / FlashAttention-family) instead of a naive implementation.** These reformulate the computation to avoid ever materializing the full O(n squared) score matrix in slow GPU memory, processing it in blocks that fit in fast on-chip memory instead — same exact math and output, dramatically less memory traffic.
2. **Reduce KV-cache size at inference** via grouped-query or multi-query attention, since for long-context autoregressive serving the KV-cache (not the score computation) is frequently the binding memory constraint.
3. **Reduce sequence length where possible** — retrieval-augmented approaches (see the **Vector Search** skill) that fetch only the most relevant context, rather than stuffing an entire corpus into the context window, sidestep the quadratic cost entirely rather than optimizing around it.
4. **Consider efficient-attention architectural variants** (sparse, windowed, linear-attention approximations) for workloads that structurally require very long context — with the honest caveat, covered fully in the Latest Updates and Future Roadmap sections, that this is an active research area without one universally adopted winner as of this writing.
5. **Batch and pad efficiently** — bucket sequences of similar length together to minimize wasted computation on padding tokens, which otherwise silently inflates the effective sequence length being processed.
`,

  scalability: `
Attention's scalability story has two mostly-separate axes: scaling the MODEL (more layers, more heads, bigger hidden dimension) and scaling the CONTEXT (longer input sequences). The two behave very differently.

### Scaling the model

Adding more layers, heads, or hidden dimension scales roughly linearly in the number of parameters and roughly linearly in compute per token — this is the well-trodden "scale up the Transformer" story that produced the last several years of larger and more capable models, and it composes well with standard techniques like data/tensor/pipeline parallelism across many GPUs (see the **Deep Learning** skill for the general training-infrastructure story).

### Scaling the context (the harder axis)

~~~mermaid
flowchart LR
    A["Sequence length n"] -->|doubles| B["Score matrix size\nO(n squared)\nroughly 4x"]
    A -->|doubles| C["Attention compute\nO(n squared times d)\nroughly 4x"]
    A -->|doubles| D["KV-cache memory\nO(n)\nroughly 2x"]
    B --> E["GPU memory pressure"]
    C --> F["Latency per forward pass"]
    D --> G["Concurrent-request capacity\nat serving time"]
~~~

| Bottleneck | Root cause | Common mitigation |
|---|---|---|
| Score-matrix memory during training/prefill | O(n squared) memory if materialized naively | Fused kernels (FlashAttention-family) that avoid materializing the full matrix |
| KV-cache memory during serving | O(n) per request, multiplied by concurrent requests | Grouped-query/multi-query attention; paged KV-cache allocators in serving frameworks |
| Latency for very long prompts | O(n squared) compute for full self-attention over the whole prompt | Retrieval-augmented context selection instead of raw context stuffing; efficient-attention research directions |
| Throughput under many concurrent long-context requests | Aggregate KV-cache memory across requests exceeds GPU memory | Request scheduling/batching strategies in dedicated inference servers (vLLM-style paged attention) |

The honest framing for scalability planning: attention removed the RNN's sequential bottleneck and replaced it with a different one — a quadratic-in-length cost that has to be managed with engineering (better kernels, smarter caching, retrieval) rather than something that simply disappears as hardware improves, since sequence lengths people want to use keep growing roughly as fast as hardware capacity does.
`,

  security: `
Attention itself is a mathematical operation, not a network-facing service, so its direct attack surface is narrower than, say, a database or API — but it has real, attention-specific security-relevant properties worth knowing as an AI engineer:

1. **Prompt injection exploits what attention actually does.** Because self-attention lets any token attend to any other token in context (subject to causal masking), instructions embedded anywhere in the input — including inside retrieved documents, tool outputs, or untrusted user content placed in the same context window — can receive attention alongside the "real" system instructions, with no architectural distinction between them. This is a foundational reason prompt injection is hard to fully prevent at the model level: attention has no built-in notion of "trusted" versus "untrusted" input positions. Defenses live at the system layer (input sanitization, privilege separation between instruction and data channels, output filtering) rather than inside the attention mechanism itself — see the dedicated prompt-injection-focused coverage in the **Transformers** and broader LLM-security material on this platform.
2. **Attention-weight leakage as a side channel.** In interpretability or debugging tooling that exposes raw attention weights (or logits derived from them) to end users or third parties, those weights can sometimes leak information about the model's internal processing of sensitive input content that the surrounding product surface did not intend to expose. Treat internal attention diagnostics as internal-only unless explicitly reviewed for exposure.
3. **KV-cache handling in multi-tenant serving.** Because the KV-cache holds a per-request representation of everything attended-to so far, serving infrastructure that reuses or shares cache memory across requests (for efficiency) must guarantee strict isolation between tenants — a KV-cache bleed between requests would be a serious confidentiality bug, not a theoretical concern, in any shared inference-serving system.
4. **Adversarial inputs crafted to manipulate attention patterns.** Research on adversarial examples includes inputs specifically constructed to redirect attention weight toward or away from particular tokens, which can be used to craft jailbreak-style or evasion inputs; this is an active research area rather than a solved problem.

For the broader threat model around LLM applications (data exfiltration via tool use, insecure output handling, training-data poisoning), see the **OWASP Top 10** skill and any dedicated LLM-security material on this platform — attention-specific concerns above are one slice of that larger picture.
`,

  testing: `
Attention modules are ordinary differentiable PyTorch modules, so they are tested the same way as any neural network component: shape correctness, numerical correctness against a reference implementation, and behavior under edge cases like masking.

~~~python
# tests/test_attention.py
import math
import torch
import torch.nn.functional as F
import pytest

from myattention import scaled_dot_product_attention, MultiHeadAttention, causal_mask


def test_output_shape_matches_value_shape():
    q = torch.randn(2, 4, 10, 16)   # batch, heads, seq_len, d_k
    k = torch.randn(2, 4, 10, 16)
    v = torch.randn(2, 4, 10, 16)
    out, weights = scaled_dot_product_attention(q, k, v)
    assert out.shape == v.shape
    assert weights.shape == (2, 4, 10, 10)


def test_attention_weights_sum_to_one():
    q = torch.randn(1, 1, 5, 8)
    k = torch.randn(1, 1, 5, 8)
    v = torch.randn(1, 1, 5, 8)
    _, weights = scaled_dot_product_attention(q, k, v)
    row_sums = weights.sum(dim=-1)
    assert torch.allclose(row_sums, torch.ones_like(row_sums), atol=1e-6)


def test_causal_mask_blocks_future_positions():
    seq_len = 5
    q = torch.randn(1, 1, seq_len, 8)
    k = torch.randn(1, 1, seq_len, 8)
    v = torch.randn(1, 1, seq_len, 8)
    mask = causal_mask(seq_len).view(1, 1, seq_len, seq_len)
    _, weights = scaled_dot_product_attention(q, k, v, mask=mask)
    # Position 0 must have exactly zero weight on every future position
    assert torch.all(weights[0, 0, 0, 1:] == 0)


def test_matches_pytorch_reference_implementation():
    torch.manual_seed(0)
    q = torch.randn(2, 4, 6, 16)
    k = torch.randn(2, 4, 6, 16)
    v = torch.randn(2, 4, 6, 16)
    ours, _ = scaled_dot_product_attention(q, k, v)
    reference = F.scaled_dot_product_attention(q, k, v)
    assert torch.allclose(ours, reference, atol=1e-5)


def test_multihead_output_shape_and_head_divisibility():
    mha = MultiHeadAttention(d_model=64, num_heads=8)
    x = torch.randn(2, 12, 64)
    out, attn = mha(x)
    assert out.shape == (2, 12, 64)
    assert attn.shape == (2, 8, 12, 12)

    with pytest.raises(AssertionError):
        MultiHeadAttention(d_model=65, num_heads=8)   # doesn't divide evenly
~~~

### Senior testing doctrine for attention code

- **Test against a trusted reference** (F.scaled_dot_product_attention, or torch.nn.MultiheadAttention) whenever writing a custom implementation — numerical bugs in attention are easy to introduce (wrong axis for softmax, wrong transpose in reshaping heads) and easy to miss by eye.
- **Explicitly test the mask boundary conditions**: an all-zero mask row, a fully-unmasked case, and the exact causal diagonal — off-by-one errors in triangular masks are a classic source of silent leakage from future tokens.
- **Test gradient flow, not just forward output**, for any custom autograd-relevant code: a masked position should receive exactly zero gradient contribution, which can be checked directly with a backward pass and inspecting .grad on the masked inputs.
- **Test at more than one sequence length**, including length 1 (a degenerate but real edge case at the start of autoregressive generation) and a length that does not divide evenly by the batch's typical block size, to catch shape-handling bugs early.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check tensor shapes at every step** — the single most common attention bug is a shape mismatch or a transpose applied to the wrong axis when splitting into heads. Print (or assert) shapes immediately after split_heads and immediately before combine_heads.
2. **Verify softmax rows sum to 1** — torch.allclose(weights.sum(dim=-1), torch.ones(...)) — a failure here usually means the mask was applied incorrectly (e.g. after softmax instead of before, or with the wrong fill value).
3. **Visualize the attention-weight matrix directly** for a small toy input — a heatmap (matplotlib imshow) of one head's weights on a short sequence makes masking bugs (a triangular pattern that isn't actually triangular) immediately visible.

~~~python
import matplotlib.pyplot as plt

def plot_attention(weights, tokens):
    """weights: (seq_len, seq_len) for one head/one example."""
    fig, ax = plt.subplots()
    ax.imshow(weights.detach().cpu().numpy(), cmap="viridis")
    ax.set_xticks(range(len(tokens))); ax.set_xticklabels(tokens, rotation=90)
    ax.set_yticks(range(len(tokens))); ax.set_yticklabels(tokens)
    ax.set_xlabel("Key position (attended TO)")
    ax.set_ylabel("Query position (attending FROM)")
    plt.tight_layout()
~~~

4. **Check for NaN/Inf after softmax** — a common cause is an entire row of the mask being all-disallowed (every score set to negative infinity), which makes softmax produce NaN because every input to exp is negative infinity; make sure every query position has at least one valid key to attend to (itself, at minimum, under a standard causal mask).
5. **Confirm the scaling factor is applied to the correct dimension** — d_k (the per-head dimension actually used in the dot product), not d_model — a subtle but real bug when refactoring between single-head and multi-head code.
6. **For training instability (loss spikes, NaN loss)**, check whether the scaling factor was accidentally dropped or whether extremely large activations upstream are producing extreme pre-softmax scores even with correct scaling; gradient clipping and careful initialization are the standard mitigations at the model level (see the **Deep Learning** skill).
7. **For inference-time correctness bugs specifically with a KV-cache**, verify the cache is actually being updated and read at the right sequence positions — an off-by-one in cache indexing silently produces plausible-looking but subtly wrong generations, which is much harder to catch than an outright crash.
`,

  monitoring: `
### What to measure around attention specifically

For research/training workloads, attention-specific signals worth tracking beyond standard loss/accuracy curves:

~~~python
import torch

def attention_entropy(weights: torch.Tensor) -> torch.Tensor:
    """Average entropy of attention distributions — a rough signal for how
    'peaked' vs 'diffuse' attention is. Very low entropy across the board
    for many layers can indicate the model has collapsed to attending
    almost exclusively to one or two fixed positions (a known failure
    mode sometimes called an 'attention sink')."""
    eps = 1e-9
    entropy = -(weights * (weights + eps).log()).sum(dim=-1)
    return entropy.mean()

# Log this per layer, per head, during training to spot collapse early.
~~~

- **Attention entropy per head/layer** as a coarse health signal — near-zero entropy everywhere can indicate degenerate, collapsed attention; near-maximum entropy everywhere can indicate attention isn't learning to discriminate at all.
- **Score matrix magnitude (pre-softmax) distribution** over training — a drifting-upward trend can precede the numerical instability that the scaling factor is designed to prevent, especially if it's compounded by unusually large activations upstream.
- **GPU memory allocated for attention specifically** (via profiler traces) versus other components, so a context-length increase's real cost is visible before it causes an out-of-memory failure in production training runs.

### For production inference serving

- **KV-cache memory utilization** across concurrent requests — this is frequently the first resource to saturate under load in long-context serving, ahead of raw compute.
- **Time-to-first-token and per-token latency as a function of prompt length** — because full self-attention over the prompt (the "prefill" phase) scales quadratically, latency curves against prompt length are a direct, measurable signature of the cost discussed in the Performance section; a service's dashboards should plot this explicitly, not just an average latency number.
- **Request queuing/rejection rate tied to cache exhaustion**, distinct from generic error rate, so operators can tell "we're out of KV-cache memory" apart from other classes of failure.
`,

  deployment: `
### Deploying an attention-based model for inference

Attention itself is not deployed independently — it ships as part of a full model checkpoint served through an inference framework. The deployment-relevant configuration choices that are specifically about attention:

~~~python
# Example: configuring attention-relevant serving parameters
# (illustrative — exact flags vary by serving framework and version;
# consult the framework's current docs before using in production).

serving_config = {
    "max_context_length": 8192,       # directly drives KV-cache memory budget
    "attention_impl": "flash",        # use a fused kernel, not a naive implementation
    "kv_cache_dtype": "fp16",         # lower precision cache = more concurrent requests
    "max_concurrent_requests": 32,    # bounded by aggregate KV-cache memory available
}
~~~

Per-choice justification:

- **max_context_length** is the single knob with the largest effect on both per-request memory (KV-cache scales linearly with it) and worst-case prefill latency (quadratic in it) — set it to the smallest value that covers real product requirements, not the largest the model technically supports.
- **attention_impl set to a fused kernel** avoids materializing the full O(n squared) score matrix, which is frequently the difference between a given batch size fitting in GPU memory or not.
- **kv_cache_dtype in reduced precision** trades a small amount of numerical fidelity for a proportional reduction in cache memory, directly increasing how many concurrent long-context requests a given GPU can serve.
- **max_concurrent_requests** should be derived from a real memory budget calculation (available GPU memory minus model weights, divided by per-request KV-cache size at max_context_length) rather than picked arbitrarily — this is the calculation that prevents production out-of-memory crashes under load.

### Rollout considerations

- Load-test specifically at the maximum supported context length, not just average-case short prompts — the quadratic cost means tail latency and memory behavior at long context can look completely different from the median case.
- Canary any change to attention implementation (e.g. switching fused-kernel backends, or adopting grouped-query attention in a fine-tune) with output-quality regression checks, not just latency/throughput checks — these are optimizations that should be numerically near-equivalent but are still real code-path changes worth validating.
`,

  "production-checklist": `
Before shipping any system that depends heavily on attention-based model behavior at scale:

- [ ] Fused attention kernel (SDPA/FlashAttention-family) confirmed in use, not a naive score-matrix implementation
- [ ] Causal mask correctness verified with explicit unit tests at the mask boundary (diagonal, first row, last row)
- [ ] Scaling factor (one over square root of d_k) confirmed present and using the correct per-head dimension
- [ ] KV-cache memory budget calculated against real max_context_length and expected concurrent request count
- [ ] Padding masks applied in all batched training/inference paths with variable-length sequences
- [ ] Attention entropy / collapse monitoring in place for training runs (or equivalent health signal)
- [ ] Time-to-first-token and per-token latency measured as an explicit function of prompt length, not just averaged
- [ ] Multi-tenant KV-cache isolation verified if serving infrastructure shares cache memory across requests
- [ ] Load test performed at maximum supported context length, not only short/average prompts
- [ ] Attention-weight visualizations (if exposed anywhere) reviewed for unintended information leakage
- [ ] Any efficient-attention or grouped/multi-query attention variant validated for output-quality parity, not assumed equivalent
- [ ] Dropout on attention weights confirmed disabled at inference (model.eval())
- [ ] Prompt-injection risk reviewed for any system that places untrusted content in the same attention context as trusted instructions
- [ ] Rollback plan in place for any change to the attention implementation or KV-cache strategy
`,

  "common-mistakes": `
1. **Skipping the square-root-of-d_k scaling "because it seems to still train"** — it often does still train on small toy examples, which is exactly why the mistake survives into larger models where it causes real instability; the fix is cheap, so there's no good reason to skip it.
2. **Applying the causal mask after softmax instead of before** — produces a distribution that doesn't sum to 1 over allowed positions and subtly corrupts training; always mask the raw scores with negative infinity before softmax.
3. **Confusing which dimension softmax is applied over** — softmax must be applied over the key dimension (so each query's weights sum to 1 across all keys), not the query dimension; getting this backward is a shape-compatible but semantically wrong bug that's easy to miss without an explicit sum-to-one test.
4. **Forgetting padding masks in batched training with variable-length sequences** — the model wastes attention capacity on meaningless padding tokens and gradients get polluted, quietly degrading quality without an obvious error.
5. **Treating num_heads as free to maximize** — very high head counts with a fixed d_model shrink the per-head dimension until individual heads have too little capacity to represent anything meaningful.
6. **Believing context-window size increases are "free" architecturally** — quadratic scaling means doubling context length is a substantial compute and memory cost, not a trivial configuration change, and should be budgeted for explicitly.
7. **Recomputing K/V for the full prefix at every autoregressive generation step** instead of using a KV-cache — a correctness-neutral but severe performance bug that turns near-linear generation cost into near-quadratic.
8. **Over-interpreting a single attention-weight heatmap as a complete causal explanation of model output** — a common mistake in both casual blog analysis and even some published work; attention weight is one signal, not a full account of the computation (see interpretability caveats above).
9. **Assuming self-attention alone captures positional order** — self-attention is permutation-invariant by construction; forgetting to add positional information (a Transformer-level, not attention-level, requirement) produces a model that cannot distinguish "dog bites man" from "man bites dog" from word identity alone.
10. **Reimplementing attention from scratch in a performance-critical production path instead of using the framework's fused kernel** — reasonable for learning (as in this page's from-scratch examples) but a real performance regression if it ships to production unchanged.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| RuntimeError: shape mismatch in matrix multiply | Q/K/V reshaped with wrong transpose order when splitting into heads | Verify split_heads produces (batch, heads, seq_len, d_k) consistently before the matmul |
| NaN values after softmax | An entire mask row is fully disallowed (all negative infinity), so exp/sum is 0/0 | Ensure every query position has at least one valid key (itself, under standard causal masking) |
| Attention weights don't sum to 1 | Mask applied after softmax instead of before | Mask raw scores with -inf, then softmax |
| Out-of-memory at long sequence length | Naive implementation materializing the full O(n squared) score matrix | Switch to a fused kernel (SDPA/FlashAttention) that avoids materializing the full matrix |
| AssertionError: d_model not divisible by num_heads | Head count chosen without checking divisibility | Pick num_heads that evenly divides d_model, or resize d_model |
| Model ignores word order / permutation-invariant behavior | Positional information never added to embeddings | Add positional encodings/embeddings before the first attention layer |
| Future tokens leaking into predictions during training | Missing or incorrectly shaped causal mask | Verify mask shape broadcasts correctly against the (seq_len_query, seq_len_key) score matrix and check the triangular pattern explicitly |
| Slow, memory-heavy autoregressive generation | K/V recomputed from scratch every generation step | Implement/enable a KV-cache so only the newest token's K/V is computed per step |
| Silently wrong results after refactor to multi-head | combine_heads transpose/reshape order doesn't invert split_heads exactly | Add a round-trip test: split_heads followed by combine_heads should return the original tensor unchanged |
`,

  faqs: `
**Q: Is attention the same thing as the Transformer?**
No. Attention is one mechanism (a specific way of computing a weighted combination over a set of values); the Transformer is a full architecture that combines multi-head attention with feed-forward layers, residual connections, and layer normalization, stacked many times. See the **Transformers** skill for the full architecture built around this mechanism.

**Q: Why is it called "self" attention?**
Because the queries, keys, and values all come from the same sequence — every token attends to (a version of) itself and every other token in the same sequence. Contrast with cross-attention, where queries come from one sequence and keys/values come from a different one.

**Q: Does attention understand word order?**
Not by itself. The raw scaled dot-product attention operation is permutation-invariant — reorder the input tokens and, absent any positional information, the set of outputs would be the same set, just reordered correspondingly. Order is injected separately via positional encodings or embeddings added before the first attention layer, which is a Transformer-architecture concern layered on top of attention rather than something intrinsic to the attention formula itself.

**Q: Why is attention so expensive for long documents?**
Because full self-attention computes a compatibility score between every pair of positions in the sequence — an all-pairs comparison whose cost grows quadratically, not linearly, with sequence length. Doubling the input length roughly quadruples the raw attention compute and, if implemented naively, the memory needed to hold the score matrix. This is the central, well-documented scalability challenge for long-context models, covered in depth in the Performance and Scalability sections above.

**Q: Can I trust attention-weight visualizations as an explanation of what the model is "thinking"?**
Only as a partial, imperfect signal. Attention weights show which positions received weight in a given computation, which is genuinely useful diagnostic information — but they are not a guaranteed causal explanation of the model's output, they can be manipulated without changing the output, and downstream layers (feed-forward, residual paths, later attention layers) also shape the final result. Treat attention visualizations as one clue among several, not a full account of model reasoning.

**Q: Are there faster alternatives to standard attention?**
Yes — there is active, ongoing research into sparse attention (only computing scores for a subset of position pairs), linear-attention approximations (reformulating the computation to avoid the quadratic term), and windowed/local attention (limiting each position to a fixed nearby range). As of this writing, no single efficient-attention variant has become a universal drop-in replacement for standard scaled dot-product attention across all use cases — different variants trade off differently, and standard attention (paired with fused, IO-aware kernels like FlashAttention) remains extremely widely used in practice. Treat any specific efficiency claim you read about a named technique as something to verify against current sources rather than take as settled fact.

**Q: Do I need cross-attention if I'm only building a GPT-style chat model?**
No. Decoder-only models like GPT have no separate encoder sequence, so every attention layer is self-attention (causally masked) over the single sequence being generated; cross-attention is specific to encoder-decoder architectures where a distinct source sequence (e.g. a document to summarize, or a sentence to translate) needs to be attended to from the decoder.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What problem does attention solve that plain RNN-based seq2seq models struggled with?* Model answer: RNN seq2seq compresses the whole input into one fixed-size vector before the decoder can use it, which becomes an information bottleneck for long sequences and forces long-range dependencies through many sequential recurrent steps. Attention lets the decoder look directly at every encoder position, weighted by relevance, removing both the bottleneck and the long, lossy dependency path.
2. *What are Query, Key, and Value, in plain terms?* Model answer: Query represents what the current position is looking for; Key represents what each position advertises about its content for comparison against queries; Value is the actual content returned, weighted by how well its key matched the query. All three are learned linear projections of the input.
3. *Why do we divide by the square root of d_k?* Model answer: dot-product magnitude grows with dimensionality, which pushes softmax into an overly peaked regime with near-zero gradients in the flat tails; scaling keeps the pre-softmax scores in a numerically stable range regardless of d_k, so gradients keep flowing during training.
4. *What is the difference between self-attention and cross-attention?* Model answer: in self-attention, Q, K, and V all come from the same sequence; in cross-attention, Q comes from one sequence (e.g. a decoder) while K and V come from a different sequence (e.g. an encoder's output).
5. *Why does GPT need a causal mask but BERT doesn't?* Model answer: GPT generates autoregressively, left to right, and must not be allowed to see future tokens during training or it would trivially learn to copy the answer instead of predicting it; BERT processes the whole input at once with no notion of "future," so it uses full bidirectional self-attention.

**Senior:**

6. *Walk through the exact computational and memory cost of self-attention as a function of sequence length, and explain why this matters for long-context models.* Model answer: computing the Q times K-transpose score matrix costs O(n squared times d) and, if materialized naively, O(n squared) memory per head; this quadratic-in-length behavior means doubling context length roughly quadruples cost, making it the central scalability bottleneck for long-context serving and training, addressed operationally with fused kernels and KV-cache strategies, and at the research level with efficient-attention variants.
7. *Explain multi-head attention mechanically — not just "it uses multiple heads," but the actual reshape/compute/concatenate steps.* Model answer: project into full-size Q/K/V, reshape/split each into h heads of dimension d_model/h, run scaled dot-product attention independently per head (a batched operation, not a Python loop in practice), concatenate the h outputs back to full size, then apply one more learned linear projection to mix across heads. Strong answers mention that heads empirically specialize in different relationship types.
8. *What is a KV-cache, and why does causal masking make it possible?* Model answer: because causal masking guarantees a token's key/value never depends on any future token, previously computed K/V pairs can be cached and reused across generation steps instead of recomputed; each new step only computes Q/K/V for the newest token and appends to the cache, turning what would otherwise be quadratic recomputation into much cheaper incremental work.
9. *What is grouped-query or multi-query attention, and what problem does it solve?* Model answer: sharing K/V projections (or a single K/V head) across multiple Q heads shrinks the KV-cache's memory footprint at inference time, which is frequently the real bottleneck for long-context serving with many concurrent requests, at some cost in per-head representational flexibility.
10. *How would you debug a model where you suspect the causal mask is leaking future information?* Model answer: construct a small controlled input, run a forward pass, and verify by direct inspection (or a gradient check) that a given position's output has zero gradient with respect to any strictly-future input token; also visually inspect the mask/weight matrix on a toy example for the expected triangular pattern.
11. *Why is attention permutation-invariant, and what has to be added to fix that?* Model answer: the scaled dot-product formula treats the set of key/value pairs as an unordered set — reordering input positions produces correspondingly reordered outputs with identical values, with no inherent sense of sequence order; positional encodings or embeddings, added at the architecture level before the first attention layer, inject that missing order information.
12. *How much can you trust attention weights as an explanation of model behavior, and what's the honest caveat?* Model answer: attention weights are a genuine, useful diagnostic signal about where information was routed from, but they are not a complete causal explanation — downstream nonlinear layers, residual paths, and later layers also shape the output, and there is documented research showing attention patterns can sometimes be manipulated without changing the model's output, so attention visualizations should be treated as one piece of evidence, not definitive proof of "why."
`,

  "coding-questions": `
### 1. Implement scaled dot-product attention from scratch (the foundational ask)

~~~python
import torch
import torch.nn.functional as F
import math

def scaled_dot_product_attention(Q, K, V, mask=None):
    """Q: (..., seq_q, d_k); K, V: (..., seq_k, d_k); mask: broadcastable
    to (..., seq_q, seq_k), 0 = disallowed, nonzero = allowed."""
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    weights = F.softmax(scores, dim=-1)
    return weights @ V, weights

# Complexity: O(seq_q * seq_k * d_k) time and O(seq_q * seq_k) memory for the
# score matrix — the quadratic term this whole page discusses.
# Follow-up they'll ask: how would you avoid materializing the full score
# matrix for very long sequences? (Answer: block-wise/fused computation,
# as in FlashAttention — never hold the full matrix in slow memory at once.)
~~~

### 2. Build a causal mask and verify it blocks future positions

~~~python
import torch

def causal_mask(seq_len: int) -> torch.Tensor:
    return torch.tril(torch.ones(seq_len, seq_len, dtype=torch.bool))

def verify_no_future_leakage(weights: torch.Tensor) -> bool:
    """weights: (seq_len, seq_len). Returns True if every query position
    has exactly zero weight on every strictly-future key position."""
    seq_len = weights.size(-1)
    upper_triangle = torch.triu(torch.ones(seq_len, seq_len, dtype=torch.bool), diagonal=1)
    return bool((weights[upper_triangle] == 0).all())

# Complexity: O(seq_len squared) to build and check the mask.
# Follow-up: how does this interact with padding masks in a batched training
# job with variable-length sequences? (Answer: combine both masks with a
# logical AND before applying to the scores — a position must be both
# causally allowed AND non-padding to receive nonzero weight.)
~~~

### 3. Implement a minimal single-step KV-cache for autoregressive generation

~~~python
import torch

class SimpleKVCache:
    """Tracks K and V across autoregressive generation steps so each new
    step only computes K/V for the newest token, not the whole prefix."""

    def __init__(self):
        self.k_cache: torch.Tensor | None = None
        self.v_cache: torch.Tensor | None = None

    def update(self, new_k: torch.Tensor, new_v: torch.Tensor):
        """new_k, new_v: (batch, heads, 1, d_k) for the single newest token."""
        if self.k_cache is None:
            self.k_cache, self.v_cache = new_k, new_v
        else:
            self.k_cache = torch.cat([self.k_cache, new_k], dim=2)
            self.v_cache = torch.cat([self.v_cache, new_v], dim=2)
        return self.k_cache, self.v_cache

# Complexity per generation step: O(1) new K/V computation plus O(current
# cache length) for the attention itself — versus O(current length squared)
# if recomputing K/V for the whole prefix at every step from scratch.
# Follow-up: what's the memory cost of this cache as generation gets long,
# and how do grouped-query/multi-query attention address it? (Answer: cache
# memory grows linearly with generated length times num KV heads times
# d_k; sharing K/V heads across multiple query heads shrinks that linear
# factor directly.)
~~~
`,

  "hands-on-labs": `
### Lab 1 — Hand-computed attention on paper, then in code (beginner, about 1 hour)
Pick a 4-word toy sentence, assign each word a small hand-chosen 2 or 3-dimensional embedding, and compute the full scaled dot-product attention output for one query word entirely by hand on paper (scores, scaling, softmax, weighted sum). Then reproduce the exact same numbers in NumPy or PyTorch and confirm they match to the decimal. Skills: the core mechanism, viscerally, with zero framework abstraction hiding what's happening.

### Lab 2 — Multi-head attention from scratch with shape assertions (intermediate, about 2 hours)
Implement the MultiHeadAttention module from the Advanced Concepts section without looking at it, including split_heads and combine_heads, and write a round-trip test proving combine_heads(split_heads(x)) equals x exactly. Then validate your implementation's output against torch.nn.functional.scaled_dot_product_attention on random inputs within a numerical tolerance. Skills: tensor reshaping mechanics, the exact multi-head data flow, testing against a reference implementation.

### Lab 3 — Causal masking and a from-scratch KV-cache for text generation (advanced, about 3 hours)
Build a tiny decoder-only toy model (a couple of layers of the multi-head attention module from Lab 2, plus a small feed-forward block) trained on a toy character-level dataset. Implement autoregressive generation two ways: naively recomputing the full sequence's attention at every step, and with a KV-cache that only computes the newest token's K/V. Time both approaches as generated length grows and produce a plot of latency versus generated length for each. Skills: causal masking correctness, KV-cache mechanics, empirically observing the quadratic-versus-cached cost difference.

### Lab 4 — Profile and optimize an attention-heavy forward pass (production, about 3 hours)
Take a small pretrained Transformer (any small open model you can load locally), profile a forward pass at increasing sequence lengths with torch.profiler, and record GPU memory and latency at each length. Switch the attention implementation to a fused kernel (torch.nn.functional.scaled_dot_product_attention with default backend selection) and repeat the measurements. Produce a short written comparison of the two, quantifying the memory and latency difference at the longest sequence length you tested. Skills: performance measurement discipline, fused-kernel benefits made concrete with real numbers from your own hardware.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate deep, not just surface-level, attention understanding:

1. **A from-scratch, tested, documented attention library.** Implement scaled dot-product attention, multi-head attention, causal masking, and a simple KV-cache as a small, well-tested Python package (not tied to a specific model) with a full pytest suite (including the shape, mask-boundary, and reference-comparison tests from the Testing section), type hints throughout, and a README that includes your own worked numeric example. Demonstrates: implementation correctness, testing discipline, and the ability to explain the mechanism from first principles rather than only calling a library function.

2. **An attention-weight visualization tool for a small pretrained model.** Build a small web or notebook-based tool that loads a small open Transformer, runs a forward pass on user-supplied text, and renders per-layer, per-head attention-weight heatmaps interactively (which head, which layer, which token pair). Include an explicit "how to read this responsibly" writeup covering the interpretability caveats from this page — over-interpretation is the most common mistake in this exact kind of project, and calling it out explicitly is what separates a portfolio piece from a superficial demo.

3. **A benchmark comparing naive versus fused attention at scale.** Build a small benchmarking harness that measures latency and peak GPU memory for a naive scaled-dot-product-attention implementation versus a fused kernel (SDPA/FlashAttention-family), across a range of sequence lengths, and produces a clear chart showing the quadratic-versus-mitigated cost curve empirically, on real hardware, with your own numbers. Demonstrates: performance engineering literacy and the ability to turn a theoretical scaling argument into measured evidence.

Each project: clean small codebase, full test coverage on the core logic, a README explaining the mechanism and your specific findings (not just "it works"), and — where relevant — a chart or table backed by your own measurements rather than quoted numbers from a paper.
`,

  "case-studies": `
### Bahdanau et al. (2014): solving a concrete translation-quality cliff
Early encoder-decoder RNN translation models showed a measurable quality drop-off as sentence length increased, traceable directly to the single fixed-vector bottleneck. Bahdanau's attention mechanism let the decoder attend back over all encoder states, and translation quality on longer sentences improved substantially as a direct, measurable result. Lesson: attention was invented to fix one specific, empirically observed failure mode, not as an abstract architectural preference — a reminder that the best architectural ideas often start from a narrow, concrete bug.

### Vaswani et al. (2017): the architecture that outgrew its original justification
The Transformer paper's central, at-the-time-radical claim was that recurrence itself was unnecessary — attention alone, combined with feed-forward layers, could match or beat RNN-based sequence models while being far more parallelizable during training. The parallelization benefit (no sequential recurrence across the time dimension during training) turned out to matter enormously beyond translation, because it is what made training on today's data and compute scales feasible at all. Lesson: an architectural change motivated by one property (parallelizability) can unlock consequences (large-scale pretraining) far bigger than its original stated goal.

### FlashAttention (Dao et al., 2022): the same math, engineered to actually fit in memory
FlashAttention did not change the mathematical definition of attention at all — it reformulated the computation to be IO-aware, processing the score matrix in blocks that fit in fast on-chip GPU memory instead of materializing the full matrix in slower memory. The result was a substantial reduction in memory traffic and a corresponding increase in the sequence lengths and batch sizes that fit on real hardware, without any change to the trained model's outputs. Lesson: at production scale, HOW a well-understood computation is executed on real hardware can matter as much as the computation's mathematical definition — a systems-engineering lesson as important as any architectural one.

### The rise of grouped-query attention in production LLMs
As context windows and concurrent-request counts grew in production LLM serving, teams found that the KV-cache's memory footprint — not raw attention FLOPs — was frequently the binding constraint on how many requests could be served concurrently. Adopting grouped-query attention (sharing K/V projections across groups of query heads) directly shrank that cache, trading a small amount of per-head representational flexibility for materially cheaper long-context serving, and became a standard choice across multiple production model families. Lesson: production bottlenecks are not always where the original research literature focused (compute/FLOPs); operational memory constraints can drive architectural choices just as strongly as accuracy benchmarks.
`,

  comparisons: `
| Dimension | Scaled dot-product attention (standard) | RNN/LSTM recurrence | Sparse/windowed attention variants | Linear-attention approximations |
|---|---|---|---|---|
| Long-range dependency path length | O(1) — direct comparison between any two positions | O(n) — must propagate through sequential hidden states | O(1) within the sparse pattern; longer for connections outside it | O(1) by construction, at the cost of an approximation to full attention |
| Training parallelization across sequence positions | Full — no sequential dependency during training (aside from causal masking's effect on which positions can attend where) | None — inherently sequential, one step depends on the previous | Full, same as standard attention | Full, same as standard attention |
| Compute/memory scaling with sequence length | O(n squared) | O(n) | Sub-quadratic, depends on the specific sparsity/window pattern | Often O(n), depending on the specific approximation |
| Representational fidelity | Exact, no approximation | Exact, but degraded long-range signal in practice | Exact within the chosen pattern; misses relationships outside it unless designed carefully | Approximate; quality-versus-speed tradeoff versus full attention |
| Production maturity as of this writing | Extremely mature; the default in virtually all major frontier LLMs, especially paired with fused kernels like FlashAttention | Legacy for most new large-scale language modeling work; still used in some specialized/streaming contexts | Used in specific long-context or vision applications; not a universal default | An active, less universally adopted research area; hedge any specific current-state claim |

**How seniors choose**: standard scaled dot-product attention (executed via a fused kernel) remains the default choice for the vast majority of new work, because it is exact, extremely well-supported by tooling and hardware, and the quadratic cost is manageable up to very large context lengths with current engineering practice (KV-cache strategies, retrieval-augmented context selection instead of raw context stuffing). Efficient-attention variants are reached for specifically when a workload structurally requires very long context (far beyond what retrieval or KV-cache optimization can comfortably handle) and the team is willing to accept either an approximation or a more specialized, less battle-tested implementation. RNN recurrence is now mostly a historical/pedagogical comparison point rather than a live production choice for large-scale language modeling, though recurrent ideas continue to resurface in some efficient-sequence-modeling research.
`,

  "related-technologies": `
- **Transformers** — the full architecture built around attention (feed-forward layers, residual connections, layer normalization, stacking); the natural next platform page after mastering attention itself.
- **Embeddings** — the vector representations that Q, K, and V projections are computed from; understanding embeddings deepens why attention's dot-product similarity is a meaningful operation in the first place.
- **Vector Search** — generalizes attention's core idea (compare a query against many candidates by similarity, return the most relevant) to retrieval over large external corpora rather than a fixed in-context sequence; directly relevant to retrieval-augmented approaches that reduce reliance on very long attention context.
- **RNNs** — the architecture family attention was originally invented to patch, and a valuable point of contrast for understanding what attention specifically fixed (see History and Why It Exists above).
- **CNNs** — a different approach to capturing local and hierarchical structure; useful contrast for understanding attention's global, all-pairs comparison versus a convolution's fixed local receptive field.
- **Neural Networks** and **Deep Learning** — the foundational training mechanics (backpropagation, gradient descent, optimization) that attention modules are trained with, same as any other differentiable layer.
- **FlashAttention-family kernels** (covered as production tooling in this page, not a separate platform skill) — the systems-engineering layer that makes standard attention practical at real sequence lengths and hardware scale.

On this platform, a natural learning path: **Neural Networks** → **Deep Learning** → **RNNs** (to feel the problem) → **this page** → **Transformers** → **Embeddings** → **Vector Search**.
`,

  "latest-updates": `
Verified against my knowledge through early 2026 — check recent papers, framework release notes, and model provider engineering blogs for anything newer, since this is one of the fastest-moving areas of systems research in AI.

- **Fused, IO-aware attention kernels (the FlashAttention lineage) have become close to a default** in both training and serving stacks for standard scaled dot-product attention, because they deliver the exact same mathematical output with substantially reduced memory traffic — this shift from "attention as a naive matrix computation" to "attention as a carefully hardware-co-designed kernel" is arguably the most consequential attention-adjacent engineering development of the past several years.
- **Grouped-query and multi-query attention have become common production choices** in multiple widely used LLM families specifically to reduce KV-cache memory pressure during long-context serving, reflecting the industry-wide realization that KV-cache memory, not raw FLOPs, is often the binding constraint at serving scale.
- **Efficient-attention research (sparse, linear, windowed variants) remains an active area** without one single approach having become a universal, uncontested replacement for standard attention across all workloads as of this writing — different variants continue to trade off differently depending on task and hardware, and I'd encourage verifying any specific technique's current adoption and benchmark numbers directly rather than relying on this page for the latest state of that fast-moving subfield.
- **Long-context model releases have continued to push supported context lengths further**, generally relying on some combination of fused kernels, KV-cache engineering, and architectural adjustments rather than a single breakthrough that eliminated the underlying quadratic cost of full self-attention.
- **Interpretability research on attention internals continues**, including mechanistic-interpretability work examining what individual attention heads compute in trained models, reinforcing both attention's genuine diagnostic value and the field's own repeated caution against over-interpreting raw attention weights as complete explanations.

For anything version-specific (particular framework APIs, particular models' exact attention configuration, or benchmark numbers for a named efficient-attention technique), verify against current official documentation or recent papers rather than treating this section as current beyond the stated cutoff.
`,

  "future-roadmap": `
Where attention-related engineering and research appear to be heading, with appropriate hedging on anything not yet settled:

1. **Continued maturation of fused, hardware-co-designed attention kernels.** The trend of treating attention execution as a systems-engineering problem (not just a mathematical one) is likely to continue, with kernels increasingly co-designed against specific accelerator memory hierarchies.
2. **KV-cache efficiency as an ongoing, first-class engineering concern.** As long-context and highly concurrent serving workloads keep growing, expect continued investment in techniques (of which grouped/multi-query attention is one current example) specifically aimed at shrinking cache memory rather than raw compute, since cache memory is frequently the practical bottleneck.
3. **Efficient-attention research continuing without a single settled winner, at least as of this writing.** Sparse, linear, and windowed approaches are all active areas; it would be overclaiming to predict which (if any) becomes dominant, and any specific claim about a technique's adoption should be verified against current sources rather than assumed from this page.
4. **Retrieval as a complement to, not a replacement for, longer raw context.** Rather than purely scaling attention's raw context window, expect continued emphasis on retrieval-augmented approaches (see the **Vector Search** skill) that fetch only the most relevant material into a manageable context, sidestepping quadratic cost rather than trying to out-engineer it entirely.
5. **Interpretability of attention and related internals remaining an active research priority**, particularly as these mechanisms scale into systems used for higher-stakes decisions, with continued honest acknowledgment in the field that attention weights alone are not a complete explanatory tool.

For your own learning investment: the core scaled dot-product / multi-head attention formula has been remarkably stable since 2017 and is worth mastering deeply and durably; the engineering layer around it (fused kernels, KV-cache strategy, efficient-attention variants) is where the field is still actively moving, and is worth tracking via current sources rather than treating as fixed knowledge.
`,

  "cheat-sheet": `
~~~python
# --- Core formula ---
# Attention(Q, K, V) = softmax( (Q @ K.T) / sqrt(d_k) ) @ V

import torch, torch.nn.functional as F, math

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    weights = F.softmax(scores, dim=-1)
    return weights @ V, weights

# --- Causal mask (autoregressive / GPT-style) ---
def causal_mask(seq_len):
    return torch.tril(torch.ones(seq_len, seq_len, dtype=torch.bool))
# row i allows columns 0..i only -> no peeking at future tokens

# --- Self-attention vs cross-attention ---
# self:  Q, K, V all from the SAME sequence
# cross: Q from one sequence (e.g. decoder), K/V from ANOTHER (e.g. encoder)

# --- Multi-head mechanics ---
# 1. project full-size Q, K, V           (seq_len, d_model)
# 2. split into h heads                  (heads, seq_len, d_model / h)
# 3. attention independently per head
# 4. concatenate heads back              (seq_len, d_model)
# 5. final linear projection W_o

# --- Using PyTorch's fused kernel (prefer this in real code) ---
out = F.scaled_dot_product_attention(q, k, v, is_causal=True)

# --- Cost ---
# compute: O(n^2 * d)     memory (naive): O(n^2) per head
# doubling sequence length ~4x's attention cost -> the scalability problem

# --- KV-cache (inference) ---
# causal mask -> past K/V never depend on future tokens -> cache them
# each new step: compute Q,K,V for ONE new token, append K/V to cache

# --- Common bugs ---
# forgetting sqrt(d_k) scale       -> unstable gradients
# masking AFTER softmax            -> weights don't sum to 1
# wrong softmax axis                -> must be over the KEY dimension
# no positional info                -> attention is permutation-invariant

# --- Efficient attention (hedge: active research, no single winner) ---
# sparse / windowed / linear-attention variants exist to cut O(n^2) cost
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What does the Query represent? | What the current position is looking for — used to compare against Keys |
| What does the Key represent? | What each position advertises about its own content, for comparison against queries |
| What does the Value represent? | The actual content returned, weighted by relevance once a query-key match is scored |
| Why scale by sqrt(d_k)? | Keeps pre-softmax score magnitude stable regardless of dimension, preventing vanishing gradients from an overly peaked softmax |
| Self-attention vs cross-attention | Same sequence for Q/K/V vs Q from one sequence, K/V from a different sequence |
| Why does GPT need causal masking? | To prevent a token from attending to future tokens during autoregressive training/generation |
| How is a causal mask applied? | Disallowed positions set to negative infinity BEFORE softmax, so they get exactly zero weight after |
| What is the compute cost of self-attention in sequence length n? | O(n squared times d) — quadratic in sequence length |
| What is a KV-cache? | Cached K and V from previous generation steps, reused so only the newest token's K/V need computing each step |
| Why is attention permutation-invariant on its own? | It computes a weighted average over a SET of values with no inherent notion of order; order must be added separately (positional encodings) |
| What does multi-head attention do mechanically? | Splits Q/K/V into h smaller subspaces, runs attention independently per head, concatenates, and projects back |
| What problem does grouped/multi-query attention solve? | Shrinks KV-cache memory at inference by sharing K/V projections across multiple query heads |
| What does FlashAttention change about the math? | Nothing — same output, but computed in a way that avoids materializing the full O(n squared) score matrix in slow memory |
| Can attention weights fully explain a model's output? | No — they're a useful diagnostic signal, not a complete causal explanation; treat with appropriate caution |
| What problem did the original 2014 attention mechanism fix? | The fixed-vector information bottleneck in encoder-decoder RNN seq2seq models |
`,

  mcqs: `
**1. Why is the attention score divided by the square root of d_k?**

A) To make the output a probability  B) To keep pre-softmax score variance stable regardless of dimension, preventing vanishing gradients  C) To reduce the number of parameters  D) It's purely a stylistic convention with no training effect

**Answer: B** — dot-product magnitude scales with dimensionality; scaling keeps softmax in a numerically healthy range so gradients don't vanish.

**2. In cross-attention within an encoder-decoder Transformer, where do the Keys and Values come from?**

A) The decoder's own previous tokens  B) The encoder's output  C) A separate learned embedding table unrelated to either sequence  D) Random initialization, never trained

**Answer: B** — the decoder's queries attend over the encoder's output, which supplies the Keys and Values.

**3. What is the computational complexity of standard self-attention with respect to sequence length n?**

A) O(n)  B) O(n log n)  C) O(n squared)  D) O(1)

**Answer: C** — every position is compared against every other position, an all-pairs computation quadratic in n.

**4. Why must the causal mask be applied BEFORE softmax rather than after?**

A) It doesn't matter, both are equivalent  B) Applying after softmax leaves nonzero mass on disallowed positions and the remaining weights won't sum to 1 without renormalization  C) Softmax cannot accept negative infinity as input  D) Masking after softmax is actually faster and preferred

**Answer: B** — masking must zero out disallowed positions' contribution to the softmax denominator itself, which only works if it happens before softmax.

**5. What does a KV-cache rely on that is specific to causal (masked) attention?**

A) That future tokens' keys and values never depend on past tokens  B) That past tokens' keys and values never depend on future tokens, so they can be computed once and reused  C) That all tokens share identical key vectors  D) Nothing — KV-caches work identically for bidirectional attention too

**Answer: B** — because causal masking guarantees past K/V don't change as later tokens are generated, they can be cached and reused instead of recomputed.

**6. Why is raw self-attention, by itself, permutation-invariant?**

A) Because softmax always produces uniform weights  B) Because it computes a weighted average over a set of values with no built-in notion of position, so order must be injected separately  C) Because Q, K, and V are always identical  D) It isn't — attention inherently encodes position without any extra mechanism

**Answer: B** — the raw formula treats keys/values as an unordered set; positional encodings are added at the architecture level to supply order information.
`,

  "revision-notes": `
**Core mechanism in a few lines:** Attention computes, for every query, a compatibility score against every key (a dot product), scales those scores by one over the square root of the key dimension for gradient stability, turns them into a probability distribution with softmax, and returns the weighted sum of the corresponding values. Q, K, V are all learned linear projections of the input, not the raw input itself.

**Self vs cross, causal vs bidirectional:** Self-attention draws Q, K, V from the same sequence; cross-attention draws Q from one sequence and K/V from another (e.g. decoder attending to encoder output). Causal masking sets future positions to negative infinity before softmax so autoregressive models like GPT can never see ahead during training or generation; encoder-style bidirectional attention uses no such mask.

**Multi-head in one line:** split Q/K/V into several smaller subspaces, run attention independently and in parallel per subspace, concatenate the results, and project back — letting different heads specialize in different relationships.

**The central cost fact:** self-attention's compute and naive memory usage scale quadratically with sequence length, because every position is compared against every other position; this is the defining scalability challenge for long-context models, addressed operationally with fused, IO-aware kernels (the FlashAttention lineage), KV-cache management and grouped/multi-query attention at inference time, and — at the research level, still actively evolving — sparse, linear, and windowed efficient-attention variants.

**Interpretability caveat worth repeating:** attention weights are a genuinely useful diagnostic signal for what a model attended to, but they are not on their own a complete, guaranteed causal explanation of model behavior — treat visualizations as one piece of evidence among several, not definitive proof.
`,

  "learning-roadmap": `
A realistic path to deep, interview-ready and production-ready mastery of attention (adjust pace to your background):

**Week 1 — Intuition and the worked example.** Read Overview through Problem It Solves; work through the Beginner Concepts numeric example by hand on paper before running the code. Milestone: you can explain, without notes, why attention was invented and what specific RNN failure it fixed.

**Week 2 — The full formula and multi-head mechanics.** Intermediate and Advanced Concepts sections; implement scaled dot-product attention and full multi-head attention from scratch, validating against torch.nn.functional.scaled_dot_product_attention. Milestone: your from-scratch implementation matches the reference within numerical tolerance.

**Week 3 — Masking, KV-cache, and internals.** Causal masking deep dive, Internal Working, Architecture, Data Flow sections; Hands-on Lab 3 (causal masking and a from-scratch KV-cache). Milestone: you can explain and demonstrate, with your own timing numbers, why a KV-cache matters.

**Week 4 — Cost, scale, and production engineering.** Performance and Scalability sections; Hands-on Lab 4 (profiling naive vs fused attention). Milestone: you have your own measured chart showing the quadratic cost curve, not just a memorized claim about it.

**Week 5 — Interview and portfolio polish.** Interview Questions, Coding Questions, and at least one Real Project from this page. Milestone: you can answer the senior-level interview questions in this page's Interview Questions section out loud, unprompted, with the reasoning behind each answer, not just the final claim.

Then continue to the **Transformers** skill on this platform to see how attention combines with feed-forward layers, residual connections, and layer normalization into the full architecture — everything mastered here transfers directly.
`,

  "official-docs": `
- [PyTorch: torch.nn.functional.scaled_dot_product_attention](https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html) — the reference fused implementation; read the backend-selection notes to understand when it dispatches to a FlashAttention-style kernel.
- [PyTorch: torch.nn.MultiheadAttention](https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html) — the standard library multi-head module; useful as a correctness reference for a from-scratch implementation.
- [The Illustrated Transformer (Jay Alammar)](https://jalammar.github.io/illustrated-transformer/) — not an official spec, but widely treated as a canonical, carefully diagrammed walkthrough of attention and the Transformer; an excellent second read after this page.
- [Hugging Face Transformers documentation](https://huggingface.co/docs/transformers/) — see the model-internals and attention-implementation sections for how attention is configured (including causal masking and KV-cache handling) across real, widely used model implementations.
`,

  books: `
- **Speech and Language Processing** — Jurafsky & Martin (freely available draft chapters online). The attention and Transformer chapters build the mechanism up carefully from the sequence-to-sequence motivation, exactly the historical throughline this page follows.
- **Deep Learning** — Goodfellow, Bengio, Courville. Predates the Transformer but is the right place to solidify the neural-network and backpropagation fundamentals attention is built on top of.
- **Dive into Deep Learning** (d2l.ai, freely available online) — has a genuinely hands-on, code-first chapter on attention mechanisms with runnable implementations very close in spirit to the from-scratch code on this page.
- **Natural Language Processing with Transformers** — Tunstall, von Werra, Wolf. Practical, code-heavy coverage of attention-based models in production use via the Hugging Face ecosystem, a good next step after mastering the mechanism itself.
- **The Annotated Transformer** (Harvard NLP, freely available online) — line-by-line PyTorch implementation of the original Transformer paper; superb for seeing attention embedded in full, working, real code rather than isolated snippets.
`,

  blogs: `
- **The Illustrated Transformer** (Jay Alammar, jalammar.github.io) — the most widely cited visual explanation of attention and multi-head attention; an excellent complement to this page's worked numeric example.
- **The Annotated Transformer** (Harvard NLP) — literate-programming style walkthrough pairing the original paper's text with runnable PyTorch code.
- **Lil'Log** (Lilian Weng's blog) — consistently rigorous, well-cited deep dives on attention variants and efficient-attention research directions; a good source for staying current on the fast-moving efficient-attention subfield.
- **PyTorch blog** (pytorch.org/blog) — official posts on scaled_dot_product_attention backend selection and performance, directly relevant to the production-usage guidance on this page.
- **Hugging Face blog** (huggingface.co/blog) — frequent, practical posts on attention implementation details (KV-cache strategies, grouped-query attention adoption) across real production model releases.
`,

  "research-papers": `
Foundational and directly relevant papers — real, verifiable titles only:

- **"Neural Machine Translation by Jointly Learning to Align and Translate"** — Bahdanau, Cho, Bengio (2014). The original attention mechanism, introduced to fix the fixed-vector bottleneck in encoder-decoder RNN translation. Start here for the historical motivation.
- **"Effective Approaches to Attention-based Neural Machine Translation"** — Luong, Pham, Manning (2015). Simplifies and generalizes attention scoring functions; a useful bridge between Bahdanau's original formulation and the dot-product attention used in Transformers.
- **"Attention Is All You Need"** — Vaswani et al. (2017). The Transformer paper; introduces scaled dot-product attention and multi-head attention exactly as covered in this page's Intermediate and Advanced Concepts sections. The single most important paper to read closely for this topic.
- **"BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"** — Devlin et al. (2018). Demonstrates bidirectional (non-causal) self-attention pretraining at scale.
- **"Language Models are Few-Shot Learners"** (the GPT-3 paper) — Brown et al. (2020). Demonstrates decoder-only causal self-attention scaled to a degree that revealed emergent few-shot capability.
- **"FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"** — Dao, Fu, Ermon, Rudra, Ré (2022). The IO-aware reformulation covered in Performance and Case Studies above; directly relevant to production-grade attention engineering.

This topic is well covered by real, foundational literature rather than being thin — if you read only three papers from this list, read Bahdanau et al. (2014) for motivation, Vaswani et al. (2017) for the mechanism itself, and Dao et al. (2022) for how it's actually executed at production scale.
`,

  videos: `
- **Andrej Karpathy — "Let's build GPT: from scratch, in code, spelled out"** — builds causal self-attention and a full decoder-only Transformer live, from first principles, in code; one of the clearest from-scratch derivations available and closely matches this page's own worked-example philosophy.
- **Jay Alammar — talks and video walkthroughs accompanying The Illustrated Transformer** — the visual, diagram-first explanation of Q/K/V and multi-head attention that has become a widely referenced teaching resource.
- **Yannic Kilcher — paper-walkthrough coverage of "Attention Is All You Need" and FlashAttention** — detailed, technically careful paper explanations useful for going beyond a surface reading of the original texts.
- **Stanford CS224N (Natural Language Processing with Deep Learning) lecture recordings** on attention and Transformers — rigorous academic-course treatment covering the same historical arc (seq2seq bottleneck to attention to Transformer) as this page's History section.
`,

  "github-repos": `
- [tensorflow/tensor2tensor](https://github.com/tensorflow/tensor2tensor) and the original Transformer reference implementation lineage — useful for seeing the mechanism in its original released form.
- [harvardnlp/annotated-transformer](https://github.com/harvardnlp/annotated-transformer) — line-by-line PyTorch implementation paired with the original paper's text; excellent for tracing attention's exact role inside a full working model.
- [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT) — a minimal, extremely readable decoder-only Transformer implementation; the causal self-attention module is compact enough to read end to end in one sitting.
- [Dao-AILab/flash-attention](https://github.com/Dao-AILab/flash-attention) — the reference FlashAttention implementation; valuable for seeing the IO-aware engineering discussed in Performance and Case Studies in real, production-grade code.
- [huggingface/transformers](https://github.com/huggingface/transformers) — see the attention-implementation modules for real, widely used models; a good place to see causal masking, cross-attention, and KV-cache handling across many architectures side by side.
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — a production inference-serving engine; its paged-attention/KV-cache management code is a strong real-world reference for the inference-serving concerns raised in Performance, Scalability, and Deployment above.
- [jessevig/bertviz](https://github.com/jessevig/bertviz) — an attention-visualization tool for Transformer models; a good starting point for the Debugging and interpretability-adjacent Real Projects in this page, paired with its own honest caveats about interpretation.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Hand computation*: pick a 3-word toy sentence, hand-assign small embeddings, and compute the full attention output for one query word by hand on paper before checking it in code — repeat with a different query word to build intuition for how weights shift.
2. *Scaling factor sensitivity*: empirically compare softmax output "peakedness" (e.g. via entropy) with and without the square-root-of-d_k scaling, at a few different values of d_k, to see the effect described in Intermediate Concepts directly in numbers rather than only in theory.
3. *Multi-head mechanics*: implement split_heads and combine_heads independently, write a round-trip test, then implement full multi-head attention and validate against a reference implementation on random inputs.
4. *Causal masking*: build a causal mask, combine it with a padding mask for a batch of variable-length sequences, and verify by direct inspection that a position's output has zero gradient with respect to any disallowed input position.
5. *KV-cache*: implement a simple KV-cache for autoregressive generation, and measure/plot generation latency with and without it as generated length grows, reproducing the quadratic-versus-linear cost difference empirically.
6. *Performance profiling*: profile a naive attention implementation versus a fused kernel at increasing sequence lengths, recording peak GPU memory and latency, and produce your own chart of the results.
7. *Interpretability with caveats*: visualize attention weights for a small pretrained model on a handful of example sentences, and write a short paragraph identifying at least one case where the attention pattern alone would mislead someone about what the model is doing.

External sets: work through the attention/Transformer sections of Stanford CS224N's assignments, and the attention-focused exercises in the d2l.ai (Dive into Deep Learning) online book, both of which include runnable code exercises closely aligned with the material on this page.
`,

  "architecture-diagram": `
The reference architecture showing where attention sits inside a production LLM-serving stack, end to end:

~~~mermaid
flowchart TB
    Client["Client request (prompt)"] --> Tok["Tokenizer + embedding lookup"]
    Tok --> Pos["Add positional information"]
    Pos --> L1["Transformer layer 1:\nmulti-head self-attention (causal)\n+ feed-forward"]
    L1 --> L2["Transformer layer 2..N\n(same structure, repeated)"]
    L2 --> Logits["Final projection to vocabulary logits"]
    Logits --> Sample["Sampling / decoding strategy"]
    Sample --> NewTok["Newest generated token"]
    NewTok -->|feed back in| Tok

    subgraph KVC["KV-cache (per request, across generation steps)"]
        Cache["Cached K, V per layer per head\nfrom all previously generated tokens"]
    end
    L1 -.reads/writes.-> KVC
    L2 -.reads/writes.-> KVC

    subgraph Kernel["Attention execution layer"]
        Fused["Fused, IO-aware attention kernel\n(FlashAttention-family)"]
    end
    L1 -.executed via.-> Kernel
    L2 -.executed via.-> Kernel

    subgraph Serve["Serving infrastructure"]
        Sched["Request scheduler / batcher"]
        MemMgr["KV-cache memory manager\n(paged allocation across requests)"]
    end
    KVC --- MemMgr
    Sched --> Tok
~~~

Every named box after "Client request" maps to a concept covered explicitly on this page: causal self-attention (Advanced Concepts, Internal Working), the KV-cache (Advanced Concepts, Production Usage), fused kernel execution (Performance, Production Usage), and serving-level memory management (Scalability, Deployment).
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Attention))
    Core intuition
      Dynamic weighting of input
      Fixes fixed-vector bottleneck
      Content-based, learned, differentiable
    Q K V framework
      Query: what am I looking for
      Key: what do I advertise
      Value: what do I return
      Learned linear projections
      Worked numeric example
    The formula
      Dot product scores
      Scale by sqrt d_k
      Softmax over keys
      Weighted sum of values
    Self vs cross attention
      Self: same sequence
      Cross: decoder queries, encoder keys/values
    Multi-head attention
      Split into subspaces
      Parallel per-head attention
      Concatenate and project
      Heads specialize
    Causal masking
      Triangular mask
      Negative infinity before softmax
      Autoregressive generation
      KV-cache
    Cost and scale
      Quadratic in sequence length
      Fused IO-aware kernels
      Grouped and multi-query attention
      Efficient attention research (hedged)
    Interpretability
      Attention weights as partial signal
      Not a complete causal explanation
      Visualization tools and caveats
    Production
      Serving frameworks
      KV-cache memory management
      Monitoring and profiling
    Ecosystem
      Transformers architecture
      Embeddings
      Vector search and retrieval
~~~
`,
};

export default attention;
