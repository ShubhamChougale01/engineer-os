import type { SkillContent } from "../types";

/**
 * Inference — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const inference: SkillContent = {
  overview: `
Inference is the process of running a trained large language model to produce output — one token at a time, autoregressively, given a prompt. If training is where a model learns, inference is where it works: every chat response, every code completion, every RAG answer, every agent tool call decision is an inference call. For an AI engineer, understanding inference deeply is not optional trivia — it directly determines what a product costs to run, how fast it feels to a user, and how many concurrent users a single GPU can serve.

The central fact that shapes everything in this page: LLM inference is autoregressive. The model predicts one token, that token is appended to the input, and the model runs again to predict the next one. Training can batch millions of tokens in parallel because the whole sequence is already known; inference cannot, because token N+1 depends on token N having already been generated. This sequential dependency is the single biggest performance challenge in LLM serving, and nearly every inference optimization technique (KV caching, continuous batching, speculative decoding, PagedAttention, quantization) exists specifically to fight the cost of this constraint.

This page covers the mechanics and algorithms of inference — what actually happens computationally when a model generates text, and the techniques that make it fast. The companion **Serving** skill covers the infrastructure and systems layer that runs these mechanics at production scale (request scheduling, GPU fleets, autoscaling, multi-node deployments) — think of this page as "how the engine works" and Serving as "how you build the car, garage, and highway around it." Concrete engines that implement these ideas are covered in the **vLLM**, **Ollama**, and **SGLang** skills.

Key characteristics of inference as a workload: it is memory-bandwidth-bound more often than compute-bound (moving model weights and KV cache through GPU memory dominates over raw FLOPs for typical batch sizes), it has two distinct phases with different performance profiles (prefill and decode), and its cost scales with both prompt length and generation length in ways that are easy to underestimate when designing a product.
`,

  history: `
Inference-time optimization is younger than the Transformer architecture itself, but it has moved fast because inference cost, not training cost, is what most companies pay for once a model ships.

| Year | Milestone |
|------|-----------|
| 2017 | "Attention Is All You Need" introduces the Transformer; inference is just "run the forward pass again," with no special tooling |
| 2018–2019 | GPT and GPT-2 popularize autoregressive generation; the KV cache becomes a standard implementation trick to avoid recomputing attention over the whole prefix at every step |
| 2020 | GPT-3 makes inference cost/latency a first-class product concern — model too large to run cheaply without optimization |
| 2021 | FasterTransformer (NVIDIA) and early custom CUDA kernels show hand-optimized inference can beat naive implementations by an order of magnitude |
| 2022 | Orca paper (Microsoft) introduces the idea behind continuous batching — scheduling generation requests independently instead of in lockstep batches |
| Nov 2022 | ChatGPT launches; inference-serving cost at consumer scale becomes an industry-wide problem overnight |
| 2023 | vLLM paper introduces **PagedAttention**, treating KV cache memory like OS virtual memory pages; throughput gains of multiple times over naive serving |
| 2023 | Speculative decoding papers (Leviathan et al., Chen et al.) formalize draft-and-verify generation, shipping in production systems soon after |
| 2023–2024 | INT8/INT4 quantization (GPTQ, AWQ, bitsandbytes) becomes standard for running large models on smaller GPUs |
| 2024 | SGLang, TensorRT-LLM, and continued vLLM development push continuous batching, prefix caching, and speculative decoding into mainstream production tooling |
| 2024–2025 | Disaggregated prefill/decode serving (splitting the two phases onto different hardware) emerges as a further optimization for very large deployments |

The throughline: every major inference technique was invented to answer the same question — how do we serve more tokens per second, per dollar, per GPU, without retraining the model.
`,

  "why-it-exists": `
Before dedicated inference engineering, the natural way to "run a language model" was to treat it like a normal forward pass: take a batch of sequences, run the whole network, get the output. That works for classification or embedding models where one forward pass gives one answer. It does not work for text generation, because generation is not one forward pass — it is potentially hundreds or thousands of forward passes chained together, one per output token, with each output feeding back in as input.

Naive autoregressive generation without any of the techniques on this page would mean: to generate token 500, recompute attention over all 499 preceding tokens from scratch, in every single decode step. That is quadratic, wasteful work — most of that computation was already done one step earlier and threw its results away. This gap between "the compute is obviously redundant" and "here is a specific mechanism that reuses it" is exactly what the KV cache fills.

Similarly, before continuous batching existed, serving multiple users meant literally waiting for the slowest request in a batch to finish before starting the next batch — a request that only needed 20 tokens sat blocked by one that needed 2,000. And before quantization and speculative decoding, running a 70-billion-parameter model meant either buying enormous amounts of GPU memory or accepting slow, expensive generation with no alternative.

Inference engineering exists to close the gap between "we trained a powerful model" and "we can serve that model to real users at a cost and speed that make a product viable."
`,

  "problem-it-solves": `
Inference techniques remove concrete, measurable pains:

- **Redundant computation**: the KV cache eliminates recomputing key/value projections for every previously generated token at every new step, turning an O(n²)-ish generation cost into something closer to O(n) per new token.
- **GPU idle time from mismatched batches**: continuous batching removes the "wait for the slowest sequence" bottleneck of static batching, so a GPU is never sitting idle waiting for one long-running request while short requests are ready to be admitted.
- **Memory fragmentation**: PagedAttention removes the waste caused by pre-allocating a maximum-length contiguous KV cache buffer per sequence when most sequences never reach that maximum.
- **Sequential-only throughput ceiling**: speculative decoding removes some of the "one token at a time" tax by verifying multiple candidate tokens per full-model forward pass.
- **Memory footprint of large weights**: quantization removes the requirement of storing every weight in full 16-bit precision, letting larger models fit on smaller GPUs at some accuracy cost.
- **Perceived latency**: streaming removes the need for a user to wait for the entire response before seeing anything.

What inference techniques deliberately do **not** solve:

- They do not make the underlying model smarter, more accurate, or less prone to hallucination — that is a training/fine-tuning/prompting/evaluation concern (see the **Fine-Tuning**, **Prompt Engineering**, **Hallucination**, and **Evaluation** skills).
- They do not decide how many GPUs to provision, how to autoscale, or how to route traffic across a fleet — that is the **Serving** skill's territory.
- They do not eliminate the fundamental sequential dependency of autoregressive generation; they mitigate its cost. Even with every optimization in this page applied, generating token N+1 still requires knowing token N.
- They do not guarantee safety or policy compliance of output — that is the **Guardrails** skill.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain precisely why autoregressive generation is sequential, and why that sequential dependency is the core performance constraint of LLM inference.
2. Describe, mechanically, what the KV cache stores, why it removes redundant computation, and how its memory footprint scales with sequence length and batch size.
3. Contrast static batching and continuous (dynamic) batching, and explain why continuous batching improves throughput.
4. Explain speculative decoding conceptually: what the draft model does, how verification works, and why it can be a net speedup despite doing "extra" work.
5. Distinguish inference-time quantization (INT8/INT4 weight quantization) from training-time precision concerns, and state the accuracy/memory/speed tradeoff it makes.
6. Define time-to-first-token (TTFT) and inter-token latency/tokens-per-second, explain why they are optimized by different techniques, and know which one dominates user-perceived quality for a given product.
7. Explain PagedAttention conceptually as an OS-virtual-memory-inspired solution to KV cache fragmentation.
8. Explain why streaming responses improve perceived latency even when total generation time is unchanged.
9. Work through a numeric example relating prompt length, generation length, and total inference cost/time, and use it to reason about product design tradeoffs.
10. Correctly divide "inference mechanics" concerns from "serving infrastructure" concerns when discussing a production LLM system.
`,

  prerequisites: `
- **Required**: a working understanding of what a Transformer does at a high level (tokens in, tokens out, attention over context) and basic familiarity with LLMs as a category. The **LLM Fundamentals** skill is the direct prerequisite for this page — read it first if terms like "attention," "tokens," "context window," or "logits" are unfamiliar.
- **Helpful**: basic GPU/memory-bandwidth intuition (what VRAM is, why moving data around a chip costs time) makes the KV cache and quantization sections click faster; not required to follow the concepts.
- **Not required yet**: nothing here assumes you have written CUDA kernels or built a serving system. That operational layer is covered next, in **Serving**.

Dependency map: **LLM Fundamentals** → this page (**Inference**) → **Serving** (production infrastructure that runs these mechanics at scale) → **vLLM** / **Ollama** / **SGLang** (concrete engines implementing these optimizations). Sibling pages that interact with inference from other angles: **Prompt Engineering** (what you feed in), **Fine-Tuning** (how the model that gets run was adapted), **Evaluation**, **Hallucination**, and **Guardrails** (what you check about what comes out).
`,

  "beginner-concepts": `
### What "generating text" actually means

A language model does not produce a sentence in one shot. It produces a probability distribution over its entire vocabulary (every possible next token, often 50,000–200,000 of them) for the single next position, samples or picks the most likely one, appends it to the sequence, and repeats.

~~~text
Prompt: "The capital of France is"

Step 1: model sees "The capital of France is" -> predicts "Paris"     (append)
Step 2: model sees "The capital of France is Paris" -> predicts "."   (append)
Step 3: model sees "The capital of France is Paris." -> predicts <end>
~~~

This is called **autoregressive generation**: "auto" (self) + "regressive" (feeding back on itself) — each new token is generated conditioned on all tokens generated so far, including the ones the model itself just produced.

### Why this is sequential, and why it matters

Training a Transformer is highly parallelizable: given a full sentence, you can compute the loss for predicting every position at once, because you already know the correct next token everywhere (teacher forcing). All positions' computations run in parallel on the GPU in one pass.

Inference cannot do this trick, because the "correct next token" does not exist yet — it is exactly what the model is supposed to produce. To get token 51, you need token 50 to already exist as input. There is no way to compute token 51 before token 50 is known. This is why naive inference generates output one token at a time, per sequence, no matter how large or fast the GPU is: the dependency is logical, not a hardware limitation.

~~~python
# Conceptual (not a real API) sketch of naive autoregressive generation
tokens = tokenizer.encode(prompt)

for _ in range(max_new_tokens):
    logits = model(tokens)              # forward pass over the WHOLE sequence so far
    next_token = sample(logits[-1])     # only the last position's prediction matters
    tokens.append(next_token)
    if next_token == EOS_TOKEN:
        break

output = tokenizer.decode(tokens)
~~~

Notice the wasteful part: on every loop iteration, model(tokens) recomputes attention over every previous token, even though those tokens' key/value projections did not change since the last step. That redundancy is exactly what the KV cache (next section) is built to eliminate.

### The two phases: prefill and decode

Every inference request has two distinct phases:

- **Prefill**: the model processes the entire input prompt at once (this CAN be parallelized across positions, like training, because the whole prompt is already known). Output: the first generated token, plus a populated KV cache for the prompt.
- **Decode**: the model generates one new token at a time, sequentially, each step depending on the previous one. This is the slow, hard-to-parallelize part.

~~~text
Prefill:  [t1 t2 t3 t4 t5] -> one parallel forward pass -> first new token t6
Decode:   [t1..t6] -> forward pass -> t7
          [t1..t7] -> forward pass -> t8
          [t1..t8] -> forward pass -> t9
          ... one step per token, sequentially
~~~

Prefill is compute-bound (lots of parallel work, GPU is busy). Decode is typically memory-bandwidth-bound (the GPU spends most of its time moving weights and cached data through memory rather than doing new math), which is why decode throughput does not scale simply with more compute — it scales with how efficiently memory is used, which is the whole story of the rest of this page.
`,

  "intermediate-concepts": `
### The KV cache, mechanically

Inside every Transformer attention layer, each token produces three projections: a Query (Q), a Key (K), and a Value (V). Attention for a given position compares its Query against the Keys of all previous positions to decide how much weight to give each one, then blends the corresponding Values.

The critical fact: once token 5's Key and Value vectors are computed, they never change, no matter how many more tokens get generated afterward. Only the Query of the newest token is new at each decode step. So instead of recomputing K and V for every previous token at every step, the KV cache stores them in GPU memory the first time they're computed, and every later step just reads them back and adds the new token's K/V to the cache.

~~~python
# Conceptual illustration of what the KV cache avoids recomputing
class KVCache:
    def __init__(self):
        self.keys = []      # one entry per past token, per layer
        self.values = []

    def append(self, new_key, new_value):
        self.keys.append(new_key)
        self.values.append(new_value)

    def get(self):
        return self.keys, self.values

# Without cache: recompute K, V for ALL tokens every step -> wasted work grows with sequence length
# With cache:    compute K, V only for the ONE new token every step -> constant work per step
def decode_step(model, new_token, cache: KVCache):
    q, k, v = model.project(new_token)   # only for the new token
    cache.append(k, v)
    all_k, all_v = cache.get()
    return model.attention(q, all_k, all_v)
~~~

### The memory/speed tradeoff

The KV cache trades **memory for speed**. It turns an increasingly expensive recomputation into a cheap memory lookup — but that memory has to live somewhere, and it grows continuously as generation proceeds.

The size of the KV cache is driven by four numbers:

~~~text
KV cache size (bytes) ≈
    2 (K and V)
  × num_layers
  × num_attention_heads × head_dim   (= hidden size)
  × sequence_length
  × batch_size
  × bytes_per_value (2 for fp16/bf16, 1 for int8)
~~~

Two consequences that matter enormously in production:

1. **It scales linearly with sequence length.** A conversation with a 32,000-token context caches roughly 32x the KV data of a 1,000-token one, for every sequence being served, all sitting in GPU memory at once.
2. **It scales linearly with batch size.** Serving 64 concurrent long-context requests multiplies memory pressure by 64. This is frequently the actual limit on how many concurrent users a GPU can serve — not the model weights, but the accumulated KV cache of everyone's in-flight conversation.

This is why techniques like Grouped-Query Attention (GQA) and Multi-Query Attention (MQA), which share Key/Value heads across multiple Query heads, exist: they shrink the "num_attention_heads" term specifically for K/V, cutting cache size substantially with a small quality tradeoff — a design decision made at model architecture time that pays off at every future inference call.

### Batching: static vs continuous

**Static batching** groups a fixed set of requests together, runs them through decode steps in lockstep, and only starts a new batch once every sequence in the current batch has finished generating (hit EOS or max tokens).

~~~text
Static batch of 4 requests, one needs 500 tokens, three need 20:

Step 1..20:   all 4 sequences generate
Step 21..500: only 1 sequence still generating, but the OTHER 3 GPU slots sit IDLE
              because the batch can't be reformed until the whole batch finishes
~~~

This wastes enormous GPU capacity whenever request lengths vary — which in real traffic, they always do.

**Continuous batching** (also called dynamic batching or in-flight batching) treats each decode step as an independent scheduling opportunity: as soon as any sequence in the running batch finishes, a new waiting request is immediately admitted into the batch, without waiting for every other sequence to finish too.

~~~text
Continuous batching, same 4 requests + a queue of waiting requests:

Step 20: the short sequence finishes and is EVICTED
Step 21: a NEW waiting request is immediately ADMITTED into the freed slot
          -> the GPU never idles waiting on the slowest original sequence
~~~

The throughput gain from continuous batching is one of the largest single improvements in modern LLM serving — commonly several times higher throughput than static batching under realistic, variable-length traffic, because GPU slots are never held hostage by one slow sequence. See the **Serving** skill for how a request scheduler actually implements this, and the **vLLM** and **SGLang** skills for concrete engines built around it.

### Quantization for inference

Quantization reduces the numeric precision used to store model weights (and sometimes activations) — for example from 16-bit floating point (fp16/bf16) down to 8-bit integers (INT8) or 4-bit integers (INT4).

~~~text
fp16 weight: 16 bits per parameter -> a 7B-parameter model needs ~14GB just for weights
int8 weight:  8 bits per parameter -> the same model needs ~7GB
int4 weight:  4 bits per parameter -> the same model needs ~3.5GB
~~~

This is distinct from training-time precision considerations (like mixed-precision training, which is about numerical stability of gradients). Inference-time quantization is about a memory/speed-for-accuracy trade made AFTER training is done, applied to a model that is otherwise frozen: smaller weights mean less data to move through memory per forward pass (faster, since inference is often memory-bandwidth-bound) and the model fits on smaller/cheaper GPUs. The cost is some accuracy degradation, which calibration-aware methods (like GPTQ and AWQ) try to minimize by choosing quantization scales carefully rather than naively rounding every weight.
`,

  "advanced-concepts": `
### Speculative decoding

Speculative decoding attacks the sequential bottleneck directly, without changing the model's output distribution. The idea: use a small, fast "draft" model to propose several candidate tokens ahead, then have the full ("target") model verify all of them in a single parallel forward pass.

~~~text
1. Draft model (small, cheap) proposes k tokens quickly, one at a time: d1, d2, d3, d4
2. Target model (large, accurate) runs ONE forward pass over [prompt, d1, d2, d3, d4]
   -- this is a parallel pass, like prefill, not k sequential decode steps
3. Target model checks: does it agree with d1? d2? d3? d4?
   -- accept every token up to and including the first disagreement
   -- at the point of disagreement, take the TARGET model's own prediction instead
4. Result: potentially several tokens produced for the cost of ONE target-model forward pass
   plus the (much cheaper) draft model calls
~~~

Why this is safe and not just "a faster but worse model": the target model always has the final say. Every accepted token is one the target model itself would have produced (using a formal rejection-sampling scheme that provably preserves the target model's exact output distribution). Worst case, if the draft model's guesses are always wrong, you fall back to normal one-token-at-a-time decoding with some wasted draft compute; best case, when the draft's guesses are frequently right (common for predictable text like code or repeated patterns), several tokens land per target-model pass, meaningfully reducing wall-clock decode time.

The clever insight is turning a sequential problem into a batch-verification problem: verifying k proposed tokens in parallel costs roughly the same as generating ONE token normally (both are a single forward pass over the sequence), because the target model's forward pass cost is dominated by moving its weights through memory once, not by how many positions it evaluates in that one pass.

### PagedAttention

Naive KV cache implementations pre-allocate one large, contiguous block of GPU memory per sequence, sized for the maximum possible sequence length, because tensors traditionally need contiguous memory. This wastes memory two ways: internal fragmentation (a sequence that only uses 200 tokens still reserves space for 4,000) and external fragmentation (as sequences of different lengths start and finish, memory gets left in gaps too small and scattered to reuse for a new sequence).

PagedAttention (introduced by the vLLM project) borrows the idea of paging from operating-system virtual memory. Instead of one contiguous block per sequence, the KV cache is divided into small fixed-size "pages" (blocks), and each sequence's KV cache is a list of pages that need not be physically contiguous in memory — a lookup table (like a page table) maps logical positions to physical pages.

~~~text
Traditional KV cache:  [sequence A: one big reserved block, mostly empty]
                       [sequence B: one big reserved block, mostly empty]
                       -> wasted memory, can't reuse gaps

PagedAttention:        [page1][page2][page3][page4][page5][page6]...
                       sequence A -> page1, page3, page6   (allocated on demand)
                       sequence B -> page2, page4          (allocated on demand)
                       -> pages allocated only as needed, freed and reused immediately
~~~

Consequences: near-zero waste from over-reservation, and — because pages are a fixed small size — the memory manager can pack far more concurrent sequences into the same GPU memory, directly raising the batch size a GPU can sustain, which directly raises throughput. It also enables efficient memory sharing: if many requests share an identical prompt prefix (a common system prompt, for instance), their KV cache pages for that shared prefix can literally be the same physical pages, copied only if one request diverges from the others (copy-on-write). See the **vLLM** skill for the engine that implemented this first and popularized the technique.

### TTFT vs inter-token latency: why they need different optimizations

Two latency metrics matter for user-perceived quality, and they are dominated by different phases of inference:

- **Time-to-first-token (TTFT)**: how long a user waits after sending a request before anything appears. Dominated by the **prefill** phase — the model must process the entire prompt before it can emit the first output token. TTFT is primarily a function of prompt length and how much compute/queueing delay stands between the request and a free GPU slot.
- **Inter-token latency** (or its inverse, tokens-per-second): how quickly subsequent tokens arrive once generation has started. Dominated by the **decode** phase — each subsequent token requires one more sequential forward step, bottlenecked mostly by memory bandwidth (moving weights and KV cache through memory) rather than by prompt length.

Because these are dominated by different phases, they are optimized differently: reducing TTFT means speeding up or better-scheduling prefill (parallel prompt processing, prompt caching for repeated prefixes, admission control so requests don't queue too long), while reducing inter-token latency means speeding up decode (a leaner KV cache via PagedAttention, quantization to reduce memory movement, speculative decoding to produce more tokens per forward pass). A production system can have an excellent TTFT and a mediocre tokens-per-second, or vice versa — they must be measured and tuned separately. Some advanced serving architectures even physically separate prefill and decode onto different hardware ("disaggregated serving") because their resource profiles differ so much; that architectural decision belongs to the **Serving** skill.

### Batch size and the decode compute/memory crossover

At very small batch sizes, decode is heavily memory-bandwidth-bound: the GPU's compute units are mostly idle, waiting for weights and KV cache to stream in from memory. As batch size grows, more useful compute happens per byte of weight moved (the same weights are reused across more sequences in the batch), and the workload gradually shifts toward being compute-bound. This is precisely why continuous batching and PagedAttention (which raise sustainable batch size) improve throughput so dramatically — they push the GPU from a memory-starved regime toward a compute-utilized one, up to the point where compute itself becomes the limiter.
`,

  "internal-working": `
Putting the pieces together, here is what actually happens, step by step, when an inference engine serves one generation request from prompt to finished output.

~~~mermaid
flowchart TD
    A["Request arrives: prompt text"] --> B["Tokenize prompt into input IDs"]
    B --> C["PREFILL: single parallel forward pass over\nall prompt tokens"]
    C --> D["Populate KV cache with K,V\nfor every prompt token, per layer"]
    D --> E["Emit FIRST output token\n(this is TTFT)"]
    E --> F{"Stop condition met?\n(EOS token or max_tokens)"}
    F -- no --> G["DECODE step: forward pass using ONLY\nthe newest token's Q, plus cached K,V\nfrom every prior token"]
    G --> H["Append new token's K,V to KV cache"]
    H --> I["Sample / select next token\n(temperature, top-p, top-k)"]
    I --> J["Stream token to client\n(perceived latency win)"]
    J --> F
    F -- yes --> K["Return final sequence,\nfree KV cache pages"]
~~~

Step-by-step detail:

1. **Tokenization**: raw text becomes a sequence of integer token IDs using the model's tokenizer (byte-pair encoding or similar). This is fast and CPU-side, not part of the GPU-bound cost.
2. **Prefill**: the model runs ONE forward pass over the entire prompt simultaneously. This is compute-parallel across positions (like a training step), so it is comparatively efficient per token even though it involves a lot of tokens at once. At the end of prefill, every prompt token has a cached Key and Value in every attention layer, and the model has produced its prediction for the very first generated token.
3. **First token emitted**: this is the moment TTFT is measured to. Everything before this point — queueing for a GPU slot, tokenization, and the prefill forward pass — is what a user experiences as "how long until something happens."
4. **Decode loop**: for each subsequent token, the model needs only the Query of the single newest token; it reads the accumulated Keys and Values of every prior token straight from the KV cache instead of recomputing them. It appends the new token's own K/V to the cache and repeats.
5. **Sampling**: at each step, the raw logits (unnormalized scores over the vocabulary) are converted to a probability distribution (softmax), then a decoding strategy picks the next token — greedy (always highest probability), temperature-scaled sampling, top-k, or top-p (nucleus) sampling. This choice affects output diversity/creativity but not the mechanics of inference speed.
6. **Streaming**: each newly decoded token can be sent to the client immediately rather than buffered until the end (see the Streaming section below).
7. **Stopping**: generation halts when the model produces an end-of-sequence token, hits a configured maximum token count, or matches a stop sequence. At that point the KV cache pages for this sequence are freed (in a PagedAttention-style system) so they can be immediately reused by another request.

In a real serving engine, steps 2–6 are not happening for one request in isolation — a scheduler is interleaving prefill and decode steps across many concurrent requests (continuous batching), which is the mechanism, not just the theory, described in Intermediate Concepts.
`,

  architecture: `
Thinking about inference architecturally means separating two levels: the **computational architecture inside one forward pass**, and the **request-level architecture** of how many requests flow through the engine over time.

### Computational architecture (inside the model, per step)

~~~mermaid
flowchart TB
    subgraph Layer["One Transformer layer, one decode step"]
        Q["New token's Query projection"]
        KVC[("KV cache for this layer\n(all previous tokens' K, V)")]
        ATT["Attention: Q attends over cached K, V"]
        FFN["Feed-forward network"]
        Q --> ATT
        KVC --> ATT
        ATT --> FFN
    end
    NewKV["New token's K, V projections"] --> KVC
    FFN --> Next["Output feeds next layer /\nfinal logits at last layer"]
~~~

This block repeats once per layer (a 32-layer model runs this 32 times per token), and the whole stack runs once per decode step. The KV cache exists identically in every layer — each layer caches its own Keys and Values, so total cache size (from the earlier formula) already accounts for num_layers.

### Request-level architecture (how a serving engine is structured)

~~~text
inference-engine/
├── scheduler/          # decides which requests run in the next batch step
│                        # (continuous batching logic lives here)
├── kv-cache-manager/    # allocates/frees KV cache pages per sequence
│                        # (PagedAttention-style block allocation lives here)
├── model-runner/        # owns the actual forward-pass execution on GPU(s)
│                        # prefill vs decode step dispatch happens here
├── sampler/             # applies temperature/top-k/top-p, picks next token
├── tokenizer/           # encode prompt in, decode tokens out
└── streaming-layer/     # pushes tokens to clients as they're produced
~~~

This is the shape of engines like vLLM and SGLang (see their dedicated skills). The scheduler and KV-cache-manager are the two components that specifically implement the ideas covered on this page (continuous batching and PagedAttention); everything about how this engine is deployed, scaled across GPUs, load-balanced, and monitored belongs to the **Serving** skill.
`,

  "data-flow": `
Tracing one request end to end through prefill and decode phases, including where streaming and batching interact with other in-flight requests:

~~~mermaid
sequenceDiagram
    participant Client
    participant Engine as Inference engine
    participant Sched as Scheduler
    participant KV as KV cache manager
    participant GPU as Model (GPU)

    Client->>Engine: POST /generate {prompt, max_tokens}
    Engine->>Engine: tokenize prompt
    Engine->>Sched: enqueue request
    Sched->>KV: allocate KV cache pages for this sequence
    Sched->>GPU: PREFILL forward pass (parallel over prompt tokens)
    GPU->>KV: write K,V for every prompt token, every layer
    GPU-->>Engine: first output token
    Engine-->>Client: stream token 1  (TTFT measured here)

    loop until EOS or max_tokens
        Sched->>Sched: form next micro-batch from ALL in-flight\nrequests (continuous batching)
        Sched->>GPU: DECODE step for this sequence's turn\n(alongside other sequences in the same batched step)
        GPU->>KV: read cached K,V + write new token's K,V
        GPU-->>Engine: next token
        Engine-->>Client: stream token N  (inter-token latency measured here)
    end

    Engine->>KV: free this sequence's KV cache pages
    Engine-->>Client: close stream / final response
~~~

The detail worth internalizing: the "loop until EOS" is not this request running alone. At every iteration, the scheduler is deciding the composition of the NEXT batch across every currently active request — some may finish and be evicted, freeing pages that a newly admitted request immediately claims. This is why continuous batching is a scheduling decision made at every single decode step, not a one-time grouping decision made when a batch starts (as it would be in static batching).
`,

  "production-usage": `
Real teams do not usually implement KV caching, continuous batching, or PagedAttention themselves — they select and configure an inference engine that already implements these techniques, and tune it for their traffic pattern. Concrete engines are covered in the **vLLM**, **Ollama**, and **SGLang** skills; this section covers the configuration knobs and operational defaults that apply regardless of which engine is chosen.

### Key configuration knobs

- **max_model_len / max context length**: the ceiling on prompt + generation length the engine will accept. Directly bounds the largest possible KV cache per sequence — set deliberately, not left at a framework default, because it is a primary lever on how much memory each concurrent request can consume.
- **max_num_seqs / max batch size**: how many sequences the scheduler will admit into a running batch simultaneously. Too low wastes GPU capacity (continuous batching has nothing to schedule); too high risks running out of KV cache memory mid-generation.
- **gpu_memory_utilization / KV cache memory fraction**: what share of GPU memory is reserved for weights vs KV cache pages. Most engines default conservatively; tuning this upward (carefully, leaving headroom) increases the number of concurrent sequences a GPU can hold.
- **quantization mode**: whether weights are served at fp16/bf16, INT8, or INT4, chosen based on the accuracy/memory/throughput tradeoff for the specific model and use case (see Performance).
- **speculative decoding config**: draft model choice (or n-gram/lookahead drafting) and the number of tokens proposed per verification step, tuned per workload — code-completion workloads with predictable tokens benefit more than open-ended creative writing.

### Typical production defaults

- Streaming enabled by default for any user-facing chat surface (see Streaming below).
- A maximum generation length set per endpoint (not left unbounded) to cap worst-case latency and cost per request.
- Prefix/prompt caching enabled where many requests share a common system prompt, to avoid repeating prefill work and its KV cache allocation for shared prefixes.
- Separate latency budgets tracked for TTFT and tokens-per-second, each alerted independently (see Monitoring).

The overarching production principle: inference-engine tuning is a memory-allocation problem as much as a compute problem. Most tuning conversations on a real team come down to "how do we fit more concurrent conversations into the same GPU memory without truncating anyone's context or falling over," which is precisely the KV cache, batching, and PagedAttention story from this page, applied as configuration rather than algorithm design.
`,

  "industry-examples": `
- **OpenAI**: serves models like the GPT family at massive concurrent scale; publicly discusses techniques in this space including batching and caching strategies to keep ChatGPT and API latency and cost manageable at hundreds of millions of users.
- **Anthropic**: serves Claude models in production with prompt caching (closely related to the shared-prefix KV cache reuse described under PagedAttention) as a documented, user-facing feature that reduces cost and latency for requests that repeat a long system prompt or document context.
- **UC Berkeley Sky Computing Lab / vLLM project**: created and open-sourced PagedAttention and the vLLM engine specifically to solve GPU memory fragmentation and throughput problems observed serving LLMs in research and production settings; now widely adopted industry-wide including by companies self-hosting open models.
- **NVIDIA**: builds TensorRT-LLM, a production inference engine implementing continuous batching, quantization (INT8/INT4/FP8), and speculative decoding as first-class, hardware-optimized features for serving on NVIDIA GPUs.
- **Together AI, Fireworks AI, Groq**: infrastructure companies whose entire product is serving open-weight LLMs fast and cheaply, competing directly on the inference metrics this page defines — TTFT and tokens-per-second — as their headline performance numbers.
- **Meta**: serves Llama-family models at huge internal and external scale, and has published on quantization and serving efficiency work for these models as part of making open-weight models practically deployable.

Pattern to notice: every serious LLM provider treats inference optimization as core infrastructure, not an afterthought — the techniques on this page are the actual substance of what differentiates "fast, cheap" LLM APIs from "slow, expensive" ones running the same underlying model weights.
`,

  "best-practices": `
1. **Measure TTFT and inter-token latency separately** — never report a single blended "latency" number; they are driven by different phases and different optimizations, and a regression in one can hide behind an improvement in the other.
2. **Set explicit max_tokens per endpoint** — unbounded generation length is an unbounded cost and latency tail; cap it to the use case's real needs.
3. **Enable streaming for any interactive, user-facing surface** — perceived latency matters more than total generation time for chat-like products.
4. **Reuse shared prefixes deliberately** (system prompts, few-shot examples, long documents) via prompt/prefix caching where the engine supports it — this avoids repeating prefill compute and KV cache allocation for identical content across many requests.
5. **Choose quantization precision based on measured accuracy impact for YOUR task**, not a blanket default — INT4 that's fine for casual chat may be unacceptable for a task requiring precise numeric or code reasoning; benchmark before shipping.
6. **Size max context length to actual product needs**, not the model's maximum supported context — every unused token of headroom is memory the KV cache manager could otherwise give to more concurrent users.
7. **Prefer an engine with continuous batching and PagedAttention (or equivalent) for any multi-user production deployment** — hand-rolled static batching is a well-known throughput trap at this point in the ecosystem's maturity.
8. **Consider speculative decoding for predictable-output workloads** (code completion, structured extraction, repetitive templated text) where draft-model acceptance rates are high; it's less valuable for highly creative, unpredictable generation.
9. **Load-test with realistic, variable-length request distributions**, not uniform synthetic prompts — the whole value of continuous batching only shows up under realistic length variance.
10. **Track GPU memory allocated to KV cache vs weights as a first-class metric** — it is usually the actual ceiling on concurrent users, not raw GPU compute utilization.
11. **Separate prefill-heavy and decode-heavy workloads in capacity planning** if traffic is bimodal (e.g., long-document summarization vs short chat turns) — they stress the system differently.
12. **Cross-check the Serving skill before scaling a deployment** — batching, KV cache, and quantization tuning only pay off fully when the surrounding scheduling and autoscaling infrastructure is also sound.
`,

  "anti-patterns": `
### Static batching in a variable-length production workload

~~~text
WRONG: fixed batch of N requests, wait for ALL to finish before starting the next batch
       -> one long request blocks GPU capacity that short, finished requests could be using

RIGHT: continuous batching -- admit new requests into freed slots the moment
       any sequence in the running batch finishes, without waiting on the others
~~~

### Ignoring KV cache growth when sizing concurrency

Treating "how many concurrent users can this GPU serve" as purely a function of model size, ignoring that KV cache memory grows linearly with both sequence length and batch size, leads to out-of-memory failures under real traffic with long conversations — size capacity planning around KV cache math, not just model weight size.

### Buffering the full response before sending anything to the client

~~~text
WRONG: generate the ENTIRE response server-side, then send one HTTP response at the end
       -> user stares at a blank screen for the full generation time, even if the
          model was "fast" in total-tokens-per-second terms

RIGHT: stream each token (or small chunk) to the client as it's produced
       -> user sees the first token at TTFT, not at total-completion time
~~~

### Blanket quantization without measuring task-specific accuracy loss

Applying INT4 quantization uniformly across every deployed model and task because it "saves memory," without measuring degradation on the SPECIFIC task (e.g., multi-step arithmetic, precise code generation) can silently ship a materially worse product; quantization's acceptable-accuracy-loss threshold is task-dependent, not universal.

### Treating speculative decoding as a free lunch

Assuming speculative decoding always speeds things up regardless of workload. If the draft model's proposals are frequently wrong (unpredictable, highly creative generation), the overhead of running and then discarding draft tokens can erode or eliminate the expected speedup — measure acceptance rate before committing to it for a given workload.

### Conflating inference optimization with model quality work

Assuming that a faster or cheaper inference setup (via quantization, speculative decoding, or aggressive batching) will also fix hallucination, poor reasoning, or unsafe outputs — it will not; those are addressed by the **Evaluation**, **Hallucination**, and **Guardrails** skills, not by inference engineering.
`,

  performance: `
### Measure first

- **TTFT**: time from request received to first token emitted. Measure at the client and at the engine boundary separately to isolate network/queueing time from prefill time.
- **Inter-token latency / tokens-per-second (TPS)**: time between consecutive streamed tokens once generation has started; report both per-request TPS and aggregate engine throughput (total tokens/sec across all concurrent requests).
- **GPU memory breakdown**: weights vs KV cache vs activation memory — most engines expose this; if not, infer KV cache size from the formula in Intermediate Concepts and compare against observed headroom.
- **Batch/queue depth over time**: how many requests are waiting vs actively decoding; a consistently deep queue signals undersized capacity or an engine misconfiguration, not just "need more GPUs."

### The optimization hierarchy (apply in order)

1. **Use an engine with continuous batching and a KV-cache manager (PagedAttention or equivalent)** before anything else — this is the single largest lever, commonly multiple times the throughput of a naive static-batch implementation under realistic traffic.
2. **Reduce unnecessary context**: trim prompts, summarize history, cap max_tokens to the real need — every token of prompt and generation costs both prefill/decode compute and KV cache memory.
3. **Exploit shared prefixes** (prompt/prefix caching) wherever many requests share a system prompt or document context — avoids repeated prefill work and duplicate KV cache pages.
4. **Quantize weights** (INT8, then INT4 if accuracy holds for the task) to reduce memory movement per forward pass, since decode is typically memory-bandwidth-bound.
5. **Add speculative decoding** for workloads with predictable continuations (code, structured output, repetitive templates) to raise tokens produced per full-model forward pass.
6. **Tune batch size and memory allocation fraction** for the specific GPU and model, balancing more concurrent sequences against per-sequence context headroom.
7. **Consider architecture-level choices upstream** (GQA/MQA in the model itself, if you control model selection) which shrink KV cache size structurally rather than through serving configuration.

### Numbers worth knowing (order-of-magnitude, verify against current hardware/model specs)

- Continuous batching over static batching: commonly several times higher sustained throughput under variable-length, realistic traffic — the exact multiple depends heavily on request length variance.
- PagedAttention-style memory management: commonly enables several times more concurrent sequences in the same GPU memory versus naive contiguous KV cache allocation, by eliminating fragmentation waste.
- INT8/INT4 quantization: roughly halves or quarters weight memory footprint versus fp16, with model- and task-dependent accuracy impact that must be measured, not assumed.
- Speculative decoding: speedups are workload-dependent, driven directly by the draft model's token-acceptance rate on the specific traffic — high for predictable text, low to negative for highly creative generation.
`,

  scalability: `
Inference scalability is fundamentally a story of **fitting more concurrent sequences' worth of KV cache and compute into fixed GPU memory and bandwidth**, then scaling that unit horizontally.

### Single-GPU scaling

~~~mermaid
flowchart LR
    Req["Incoming requests"] --> Sched["Scheduler\n(continuous batching)"]
    Sched --> GPU["One GPU:\nweights + KV cache pages"]
    GPU --> KVMgr["KV cache manager\n(PagedAttention-style)"]
    KVMgr -.frees pages on completion.-> Sched
~~~

On one GPU, the ceiling is memory: weights consume a fixed baseline, and KV cache consumes the rest, scaling with concurrent sequences × their context length. PagedAttention-style management maximizes how many concurrent sequences fit in the remaining memory; quantization shrinks the fixed weight baseline, freeing more room for KV cache and thus more concurrent users.

### Beyond one GPU

- **Tensor parallelism**: split a single model's weights across multiple GPUs so a model too large for one GPU can still run, at the cost of inter-GPU communication overhead on every forward pass.
- **Pipeline parallelism**: split a model's layers across GPUs, with different GPUs handling different layers of the same forward pass — useful for very large models but adds pipeline-bubble latency.
- **Data/replica parallelism**: run multiple independent copies of the full model on separate GPUs, each serving its own set of requests — the standard way to scale THROUGHPUT (as opposed to fitting one larger model) once a single GPU's worth of serving capacity is saturated.
- **Disaggregated prefill/decode**: because prefill is compute-bound and decode is memory-bandwidth-bound, some architectures run them on separate GPU pools sized differently for each phase's bottleneck, rather than forcing one GPU type to be well-suited to both.

These horizontal-scaling and multi-GPU orchestration decisions — how many replicas, how requests are load-balanced across them, how autoscaling reacts to queue depth — belong to the **Serving** skill. This page's contribution to scalability is making each GPU-unit of serving capacity as efficient as possible before you multiply it.

### Bottleneck table

| Bottleneck | Inference-side answer | Serving-side answer |
|------------|----------------------|----------------------|
| KV cache memory exhausted | PagedAttention-style paging, quantization | provision more GPU memory, cap max context |
| Decode is memory-bandwidth-bound | speculative decoding, quantization | fewer, larger batches per GPU |
| Prefill is compute-bound and slow for long prompts | prefix/prompt caching | route long-prompt traffic to compute-heavy pool |
| GPU idle time from mismatched request lengths | continuous batching | admission control, queueing policy |
| Single GPU too small for the model | tensor/pipeline parallelism | multi-GPU node provisioning |
`,

  security: `
Inference-specific security concerns sit alongside — and are distinct from — general LLM application security, which is covered more fully in the **Guardrails** skill.

1. **Prompt injection surfaces every additional token you feed the model** — the more context (retrieved documents, tool outputs, conversation history) that gets included in the prompt fed into the prefill phase, the larger the surface for injected instructions to influence generation. Inference itself has no awareness of "trusted" vs "untrusted" input; that distinction must be enforced upstream and via guardrails.
2. **KV cache and prompt-cache sharing across tenants is a data isolation concern.** If a serving system shares KV cache pages or prompt caches across different users/tenants for efficiency (as in prefix caching), the implementation must guarantee no cross-tenant leakage of cached content — a caching optimization built without tenant isolation in mind is a real vulnerability in multi-tenant serving.
3. **Side-channel risk from timing.** Because TTFT and tokens-per-second are influenced by cache hits (e.g., a request matching a cached prefix responds faster), timing differences can, in principle, leak information about what content is cached — worth considering in highly sensitive multi-tenant deployments.
4. **Resource-exhaustion / denial-of-service via unbounded generation.** A request with no max_tokens cap, or crafted to avoid emitting an EOS token, can consume disproportionate GPU memory (KV cache) and compute time — always enforce hard generation limits at the inference-engine boundary, not just as a client-side suggestion.
5. **Quantized models can have different failure modes than full-precision ones** — accuracy degradation from aggressive quantization is not always uniform across inputs, and adversarially-crafted inputs could, in principle, exploit precision-sensitive edge cases more easily in a quantized model. Evaluate quantized deployments with the same rigor as full-precision ones (see **Evaluation**).

For broader application-level concerns — jailbreaks, data exfiltration through generated output, unsafe tool invocation — see the **Guardrails** and **Hallucination** skills; this page covers only the surfaces specific to how generation is mechanically executed.
`,

  testing: `
Testing inference-layer changes is about verifying that an optimization preserves correctness and measurably improves the metric it targets — not standard unit testing of business logic.

~~~python
# Conceptual test: verify a quantized model's output distribution hasn't
# meaningfully diverged from the full-precision baseline on a fixed eval set.
def test_quantized_model_accuracy_within_tolerance(baseline_model, quantized_model, eval_set):
    baseline_scores = evaluate(baseline_model, eval_set)   # e.g., exact-match or task-specific metric
    quantized_scores = evaluate(quantized_model, eval_set)
    degradation = baseline_scores.mean() - quantized_scores.mean()
    # Tolerance is task-specific -- set deliberately, not copied from another team's number.
    assert degradation < ACCEPTABLE_DEGRADATION_THRESHOLD, (
        f"quantized model degraded by {degradation:.3f}, exceeds tolerance"
    )

# Conceptual test: verify speculative decoding produces IDENTICAL output
# distribution to standard decoding (correctness, not just speed).
def test_speculative_decoding_matches_target_distribution(target_model, spec_config, prompts, seed):
    for prompt in prompts:
        standard_output = generate(target_model, prompt, seed=seed)
        spec_output = generate_with_speculative_decoding(target_model, spec_config, prompt, seed=seed)
        assert standard_output == spec_output, "speculative decoding changed the output distribution"
~~~

### Senior testing doctrine for inference systems

- **Correctness first, speed second**: any optimization (speculative decoding, quantization, KV cache changes) must be verified not to silently change output quality or distribution before its speed benefit is credited.
- **Load-test with realistic, variable-length request distributions** — continuous batching and PagedAttention only show their real benefit under length variance; uniform synthetic prompts will understate the difference between good and bad batching implementations.
- **Test TTFT and TPS as separate SLAs**, each with its own pass/fail threshold, in any pre-deployment benchmark suite.
- **Regression-test memory headroom**: verify a configuration change (larger max context, larger batch size) doesn't push KV cache memory usage past safe limits under peak concurrency, ideally in a staging environment with production-like traffic shape.
- **Test streaming behavior explicitly**: confirm tokens arrive incrementally and in order, and that client-side reassembly handles partial/malformed chunks gracefully (see the **Streaming** and **Server-Sent Events** skills for the transport-level testing concerns).
`,

  debugging: `
### Escalation path for inference performance and correctness issues

1. **Reproduce with a single request first** — isolate whether an issue is inherent to generation (correctness, unexpected output) or only appears under concurrent load (scheduling/batching/memory).
2. **Check TTFT vs TPS separately** — a slow TTFT with fine TPS points at prefill/queueing/prompt length; slow TPS with fine TTFT points at decode-phase issues (memory bandwidth, batch size, quantization overhead).
3. **Inspect GPU memory allocation breakdown** — most inference engines expose how much memory is used by weights vs KV cache vs activations; a request failing with an out-of-memory error is almost always a KV cache sizing issue (context too long, batch too large, max_model_len set too generously), not a "the model is too big" issue in isolation.
4. **Check batch/queue depth over time** — a persistently deep queue with idle-looking GPU utilization often indicates a scheduler misconfiguration (e.g., max_num_seqs set too conservatively) rather than a genuine capacity shortfall.
5. **Verify quantization didn't silently change output when debugging quality regressions** — compare a suspicious output against the full-precision model's output for the same input before assuming a prompt or application-logic bug.
6. **Verify speculative decoding's draft acceptance rate** if TPS is lower than expected with speculative decoding enabled — a very low acceptance rate means the draft model is frequently wrong for this workload, and the overhead may be net-negative; disable and re-measure.
7. **Check for KV cache fragmentation symptoms** in engines without paged memory management — degraded throughput over time in a long-running server process, with memory reported as available but allocation failures still occurring, is a classic fragmentation signature.

### Useful signals to log per request

Prompt length, generated length, TTFT, total generation time, per-token latency distribution (not just the mean), which quantization mode served the request, and whether speculative decoding was used with its resulting acceptance rate. These make retrospective debugging of "why was this one request slow" tractable instead of guesswork.
`,

  monitoring: `
### What to measure

- **TTFT** (p50/p95/p99) — the queueing + prefill experience.
- **Inter-token latency / tokens-per-second** (p50/p95/p99) — the decode experience.
- **GPU memory utilization, broken down by weights vs KV cache** — the leading indicator of capacity headroom.
- **Batch size / concurrent sequence count over time** — shows whether continuous batching is actually keeping the GPU busy.
- **Queue depth and admission wait time** — shows whether incoming load exceeds current serving capacity.
- **Draft-token acceptance rate** (if using speculative decoding) — the direct signal of whether it's paying for itself on current traffic.
- **Requests failed due to context-length or memory limits** — a leading indicator that max context or batch settings need revisiting.

### Instrumentation sketch

~~~python
import time

def generate_with_metrics(engine, prompt, max_tokens, metrics_client):
    start = time.perf_counter()
    first_token_time = None
    token_count = 0

    for token in engine.stream_generate(prompt, max_tokens=max_tokens):
        now = time.perf_counter()
        if first_token_time is None:
            first_token_time = now
            metrics_client.observe("inference_ttft_seconds", first_token_time - start)
        token_count += 1
        yield token

    total_time = time.perf_counter() - start
    decode_time = total_time - (first_token_time - start) if first_token_time else 0
    if token_count > 1 and decode_time > 0:
        tokens_per_second = (token_count - 1) / decode_time   # exclude the first token's prefill cost
        metrics_client.observe("inference_tokens_per_second", tokens_per_second)
    metrics_client.observe("inference_total_tokens", token_count)
~~~

### What to alert on

Alert on TTFT p95/p99 and tokens-per-second p95/p99 crossing product-defined thresholds (these are what users feel), and on GPU memory utilization approaching limits (this is what predicts imminent failures, before they happen, rather than after). See the **Serving** skill for how these signals feed autoscaling decisions at the fleet level.
`,

  deployment: `
Deployment of inference specifically concerns how a model and its serving engine get packaged and configured to run correctly on target hardware — the fleet-level orchestration (autoscaling, load balancing, multi-region) is the **Serving** skill's domain. This section covers the inference-mechanics-relevant configuration that must be set correctly at deploy time.

~~~text
# Conceptual inference-engine startup configuration (illustrative, not a specific engine's exact flags)
model: path or identifier of the model weights to load
dtype: bf16 | fp16 | int8 | int4          # precision/quantization mode for weights
max_model_len: 8192                       # hard ceiling on prompt + generation length
max_num_seqs: 64                          # max concurrent sequences the scheduler will admit
gpu_memory_utilization: 0.90              # fraction of GPU memory reserved for engine use
enable_prefix_caching: true               # reuse KV cache for shared prompt prefixes
speculative_config:
  draft_model: path or identifier of a smaller draft model
  num_speculative_tokens: 4               # tokens proposed per verification step
~~~

Why each choice matters:

- **dtype/quantization mode** directly trades accuracy for memory footprint and decode speed — chosen per model and task after measuring accuracy impact (see Testing).
- **max_model_len** bounds worst-case KV cache size per sequence; set to the product's real requirement, not the model's technical maximum, to leave more memory for concurrency.
- **max_num_seqs** bounds how many sequences can be scheduled concurrently; too low leaves throughput on the table, too high risks out-of-memory failures under peak load — tune against observed KV cache usage.
- **gpu_memory_utilization** leaves headroom for activation memory and avoids out-of-memory crashes from slight underestimation; too conservative wastes capacity, too aggressive risks instability.
- **enable_prefix_caching** avoids repeated prefill work and cache allocation for shared prompt prefixes across many requests — significant savings for applications with a common system prompt.
- **speculative_config** is opt-in and workload-dependent (see Advanced Concepts and Performance) — enabled only after measuring draft-model acceptance rate on representative traffic.

### Health and readiness at the inference layer

A readiness check for an inference engine should verify it can actually run a minimal forward pass (not just that the process is up), since a model can fail to load correctly (e.g., quantization kernel incompatibility with the GPU) while the process itself stays alive. See the **Serving** skill for how this integrates with orchestrator health probes.
`,

  "production-checklist": `
- [ ] max_model_len set to the product's real context need, not the model's technical maximum
- [ ] max_num_seqs / batch size tuned against measured KV cache memory usage, not left at a default
- [ ] gpu_memory_utilization leaves verified headroom for activation memory under peak concurrency
- [ ] Quantization mode chosen based on measured task-specific accuracy impact, not assumed safe
- [ ] Prefix/prompt caching enabled where requests share common system prompts or context
- [ ] max_tokens enforced per request at the engine boundary, not just suggested client-side
- [ ] Streaming enabled for all interactive, user-facing generation endpoints
- [ ] TTFT and tokens-per-second tracked and alerted as SEPARATE SLAs (p95/p99)
- [ ] GPU memory breakdown (weights vs KV cache) visible in monitoring, not just aggregate utilization
- [ ] Speculative decoding (if enabled) validated for output-distribution correctness and measured acceptance rate on real traffic
- [ ] Load-tested with realistic, variable-length request distributions, not uniform synthetic prompts
- [ ] Readiness checks verify an actual minimal forward pass succeeds, not just process liveness
- [ ] Behavior under KV cache exhaustion is a graceful rejection/backpressure, not an uncontrolled crash
- [ ] Cross-tenant KV cache/prompt-cache sharing (if any) verified for correct isolation
- [ ] Rollback plan exists for a quantization or speculative-decoding change that regresses quality in production
`,

  "common-mistakes": `
1. **Treating TTFT and tokens-per-second as one metric** — they are governed by different phases (prefill vs decode) and can move in opposite directions after a change; conflating them hides real regressions.
2. **Sizing GPU capacity by model size alone** — ignoring that KV cache memory grows with sequence length and batch size means capacity planning is systematically wrong for any workload with long or many concurrent conversations.
3. **Assuming quantization accuracy loss is uniform across tasks** — a quantization level that's fine for casual chat can be unacceptable for precise reasoning or code tasks; always measure per-task.
4. **Enabling speculative decoding without measuring draft-model acceptance rate** — on unpredictable workloads it can add overhead without a net speedup.
5. **Not enforcing max_tokens server-side** — a client-side-only limit is not a limit; a misbehaving or malicious client can trigger unbounded generation and KV cache growth.
6. **Buffering full responses instead of streaming** — dramatically hurts perceived latency even when total generation time is unchanged, for no correctness benefit.
7. **Using static batching in production with variable-length real traffic** — silently wastes GPU capacity that continuous batching would have reclaimed.
8. **Confusing inference optimization with model quality improvement** — faster/cheaper serving does not make a model more accurate or less prone to hallucination; those require the **Evaluation**, **Fine-Tuning**, and **Hallucination** skills, not inference tuning.
9. **Ignoring shared-prefix opportunities** — repeatedly re-running prefill (and re-allocating KV cache) for an identical system prompt across every request wastes compute and memory that prefix caching would recover for free.
10. **Not load-testing with realistic traffic shape** — synthetic uniform-length benchmarks understate real-world benefits of continuous batching and PagedAttention-style memory management, leading to under-provisioned production capacity.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Out-of-memory during generation | KV cache grew beyond available GPU memory (long context and/or high concurrency) | Lower max_model_len or max_num_seqs; enable/verify PagedAttention-style memory management; check gpu_memory_utilization headroom |
| Request hangs with no output until the very end | Streaming not enabled, or client buffering the response | Enable streaming on the engine and confirm client consumes the stream incrementally |
| High TTFT, normal tokens-per-second | Long prompts causing slow prefill, or requests queueing behind other prefill-heavy requests | Reduce prompt length, enable prefix caching for shared context, add admission control / prioritize by prompt length |
| Normal TTFT, poor tokens-per-second | Decode-phase bottleneck: low batch utilization, no quantization, memory-bandwidth-bound at low concurrency | Verify continuous batching is engaged, consider quantization or speculative decoding |
| Throughput degrades over long-running server uptime | KV cache memory fragmentation in a non-paged implementation | Use a PagedAttention-style engine, or restart/recycle worker processes as a stopgap |
| Speculative decoding enabled but slower than plain decoding | Low draft-model acceptance rate for this workload | Measure acceptance rate; disable speculative decoding or choose a better-matched draft model |
| Output looks subtly worse after switching to quantized weights | Quantization accuracy loss exceeds acceptable threshold for this specific task | Re-evaluate on a task-specific eval set; use a higher-precision quantization level or calibration-aware method (e.g., AWQ/GPTQ) |
| Request rejected or truncated unexpectedly | max_model_len or max_tokens too low for the actual prompt + desired generation length | Raise the limit deliberately, weighing the KV cache memory cost of doing so |
| Inconsistent latency across otherwise-identical requests | Continuous batching scheduling variance, or contention from concurrent long-context requests | Expected under real concurrent load; monitor p95/p99, not just mean latency |
`,

  faqs: `
**Q: Is the KV cache the same thing as a prompt cache?**
Related but not identical. The KV cache is the per-request mechanism that avoids recomputing key/value projections during generation of a single sequence. Prompt/prefix caching is a further optimization that reuses KV cache content ACROSS requests that share an identical prefix (like a common system prompt), avoiding repeated prefill work entirely for that shared portion.

**Q: Does quantization make the model "dumber"?**
It can, to a degree that depends on the quantization level and the task. INT8 quantization is often close to lossless for many tasks; aggressive INT4 quantization risks more noticeable degradation, especially on precise reasoning or numeric tasks. Always measure on your specific task rather than assuming a blanket answer.

**Q: Why doesn't adding more GPUs automatically fix slow tokens-per-second for one conversation?**
Tokens-per-second for a single sequence is bounded by the sequential nature of decode — one token depends on the previous one, regardless of how much total GPU compute exists in a cluster. More GPUs increase how many concurrent conversations can be served well (throughput), not how fast one individual conversation generates (unless via speculative decoding or lower-latency hardware for that specific model).

**Q: Is speculative decoding "cheating" or does it change the output?**
It does not change the output distribution when implemented correctly — the target model's rejection-sampling verification step guarantees the final output matches what standard decoding from the target model alone would have produced. It only changes how many forward passes it takes to get there.

**Q: Should I always enable continuous batching?**
For any production deployment serving more than one concurrent request with variable-length generations, yes — it is close to a strict improvement over static batching for realistic traffic, with no correctness downside. It matters less for pure single-request, offline batch-processing use cases where all inputs are known upfront.

**Q: What's the difference between this page and the Serving skill?**
This page covers the algorithms and mechanics that make one inference request or one GPU run efficiently — KV caching, batching strategy, speculative decoding, quantization, PagedAttention. The **Serving** skill covers the infrastructure that runs many of these engines at scale — fleet provisioning, autoscaling, load balancing, multi-region deployment, and operational reliability of the overall system.

**Q: Do I need to implement these techniques myself?**
Almost never from scratch in production. Engines like vLLM, SGLang, and TensorRT-LLM already implement continuous batching, PagedAttention, quantization support, and speculative decoding. Understanding the mechanics (this page) lets you configure and reason about those engines correctly rather than treating them as an unexplainable black box.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What does "autoregressive" mean in the context of LLM generation?* Each output token is generated conditioned on the prompt plus every token generated so far, one token at a time, with the newest token fed back in as input for the next prediction.
2. *What is the KV cache and why does it exist?* It stores each previous token's Key and Value projections so they don't need to be recomputed at every subsequent generation step; without it, every decode step would redundantly redo attention computation over the entire prefix.
3. *What's the difference between prefill and decode?* Prefill processes the whole prompt in one parallel forward pass (compute-bound); decode generates one token at a time sequentially, each step depending on the last (typically memory-bandwidth-bound).
4. *What is streaming and why does it matter for UX?* Sending tokens to the client incrementally as they're generated rather than waiting for the full response; it dramatically improves perceived latency even if total generation time is unchanged, because the user sees progress immediately.
5. *Define TTFT and tokens-per-second.* TTFT is time from request to the first generated token (dominated by prefill and queueing); tokens-per-second is the rate of subsequent token generation (dominated by decode). They are optimized differently.

**Senior:**

6. *Explain why naive autoregressive generation is fundamentally sequential and cannot be parallelized the way training can.* Training knows the full target sequence upfront (teacher forcing), so all positions' losses compute in one parallel pass. Inference must generate token N before token N+1 can be computed, because token N+1's input includes token N — a strict data dependency, not a hardware limitation.
7. *Walk through why KV cache size scales the way it does, and what that means for capacity planning.* Size scales with 2 (K,V) × layers × hidden size × sequence length × batch size × bytes-per-value; it means capacity is often bounded by cumulative context across concurrent conversations, not just model weight size — a strong answer connects this to why GQA/MQA and PagedAttention exist.
8. *Explain continuous batching and why it beats static batching.* Continuous batching admits/evicts individual sequences from a running batch at every decode step rather than waiting for the whole batch to finish together; this avoids GPU idle time caused by one slow sequence blocking faster ones that already finished — a large realistic-traffic throughput win.
9. *Explain speculative decoding and why it's correct, not just fast.* A small draft model proposes several tokens; the target model verifies them in one parallel forward pass using rejection sampling that guarantees the final accepted output matches what the target model would have produced alone — speed without changing output distribution.
10. *Explain PagedAttention and the problem it solves.* KV cache is divided into fixed-size pages, addressed via a page table, instead of one contiguous per-sequence block sized to the maximum possible length; this eliminates internal/external memory fragmentation and lets more concurrent sequences fit in the same GPU memory.
11. *When would quantization hurt more than help, and how would you decide?* When the task is precision-sensitive (complex reasoning, exact numeric or code output) and accuracy measured on a task-specific eval set degrades past an acceptable threshold; decide empirically per task, not from a general rule.
12. *Design question: you need to serve a chat product where users share a long common system prompt — what would you do?* Enable prefix/prompt caching so the shared prefix's KV cache and prefill computation are reused across requests instead of repeated; discuss the throughput and TTFT wins, and note the multi-tenant isolation concern if the cache is shared across users.
`,

  "coding-questions": `
### 1. Simulate the throughput difference between static and continuous batching

~~~python
# Simplified simulation: given per-request generation lengths, compute total
# "GPU-steps" wasted by static batching vs continuous batching.
def static_batching_steps(lengths: list[int]) -> int:
    """Static batching: the whole batch runs for as many steps as the LONGEST request."""
    return max(lengths) * len(lengths)   # every slot occupied every step, even if idle

def continuous_batching_steps(lengths: list[int]) -> int:
    """Continuous batching: each request only occupies a slot for its own length;
    freed slots are immediately reused (assume unlimited queued replacement work,
    so no idle steps occur once any work remains)."""
    return sum(lengths)

lengths = [500, 20, 20, 20]
print(static_batching_steps(lengths))       # 2000  (4 slots * 500 steps each)
print(continuous_batching_steps(lengths))   # 560   (sum of actual work needed)
# Ratio ~3.6x fewer GPU-steps "wasted" in this simplified model -- in reality the
# gain depends on whether replacement requests are available to fill freed slots.
~~~

Complexity: O(n) for both. Follow-up: extend the simulation to model a finite queue of waiting requests and idle steps when the queue is empty, to see how queue depth affects the realized speedup.

### 2. Compute KV cache memory footprint

~~~python
def kv_cache_bytes(
    num_layers: int,
    num_kv_heads: int,     # after GQA/MQA sharing, if applicable
    head_dim: int,
    seq_len: int,
    batch_size: int,
    bytes_per_value: int = 2,   # 2 for fp16/bf16, 1 for int8
) -> int:
    """KV cache size = 2 (K and V) * layers * kv_heads * head_dim * seq_len * batch * bytes."""
    return 2 * num_layers * num_kv_heads * head_dim * seq_len * batch_size * bytes_per_value

# Example: a 32-layer model, 8 KV heads (GQA), head_dim 128, 4096-token context, batch of 16
size_bytes = kv_cache_bytes(
    num_layers=32, num_kv_heads=8, head_dim=128,
    seq_len=4096, batch_size=16, bytes_per_value=2,
)
print(size_bytes / (1024 ** 3), "GB")   # illustrates how quickly this grows
~~~

Complexity: O(1). Follow-up they'll ask: how does this change with Multi-Query Attention (num_kv_heads=1) versus full Multi-Head Attention (num_kv_heads = num_query_heads)? Recompute with both to see the memory difference GQA/MQA buys.

### 3. Simulate speculative decoding's expected speedup from acceptance rate

~~~python
def expected_tokens_per_target_pass(num_speculative_tokens: int, acceptance_rate: float) -> float:
    """Expected number of tokens accepted per target-model verification pass,
    given each proposed token is independently accepted with probability p.
    Plus one 'bonus' token the target model always produces after the last
    accepted position (from its own verification pass logits)."""
    expected_accepted = sum(
        acceptance_rate ** i for i in range(1, num_speculative_tokens + 1)
    )
    return expected_accepted + 1   # +1 for the guaranteed token after divergence

for p in (0.9, 0.6, 0.3):
    print(p, expected_tokens_per_target_pass(num_speculative_tokens=4, acceptance_rate=p))
# Higher acceptance rate (predictable text, e.g. code) -> more tokens per
# target-model pass -> bigger realized speedup. Low acceptance rate can make
# the draft overhead not worth it.
~~~

Complexity: O(k) in the number of speculative tokens. Follow-up: at what acceptance rate does speculative decoding stop being worth the draft model's overhead, given a specific draft/target cost ratio?
`,

  "hands-on-labs": `
### Lab 1 — Trace prefill vs decode by hand (beginner, ~1h)
Using any open-weight small model locally (via a simple HF transformers script, no special serving engine), generate a short completion token by token in a manual loop, printing the shape of the input tensor and timing each step. Observe that the first step (prefill, whole prompt) takes noticeably different time than subsequent single-token steps (decode). Deliverable: a short table of step number vs latency, with a one-paragraph explanation of what you observed. Skills: autoregressive generation, prefill vs decode, hands-on latency measurement.

### Lab 2 — Measure the KV cache's effect directly (intermediate, ~2h)
Run generation twice for the same prompt/length: once with KV caching enabled (the normal path) and once with it deliberately disabled if your framework allows it (or by recomputing attention over the full sequence at every step manually). Time both and compute the speedup. Deliverable: a report with numbers and an explanation of why the gap grows with generation length. Skills: KV cache mechanics, measurement discipline.

### Lab 3 — Build a toy continuous-batching simulator (advanced, ~3h)
Implement (in plain Python, no GPU needed) a discrete-event simulation of a scheduler serving a stream of requests with varying generation lengths, comparing static batching vs continuous batching total wall-clock "steps" to complete all requests, similar to Coding Question 1 but with a live queue of arriving requests over time. Deliverable: a chart of GPU utilization over time for both strategies. Skills: batching mechanics, scheduling intuition, the core throughput argument for continuous batching.

### Lab 4 — Deploy and benchmark a real engine (production, ~4h)
Stand up a small open-weight model behind an inference engine that implements continuous batching and PagedAttention (see the **vLLM** skill for a concrete engine), configure max_model_len, max_num_seqs, and quantization mode, then load-test with a realistic variable-length request generator (see the **Serving** skill for load-testing tooling). Measure TTFT and tokens-per-second under increasing concurrency until you find the memory or throughput ceiling. Deliverable: a short report of your measured ceiling and which knob (max_num_seqs, quantization, context length) moved it. Skills: the entire page, applied end to end.
`,

  "real-projects": `
Portfolio-grade projects demonstrating inference-mechanics fluency:

1. **Inference benchmarking harness** — A tool that takes any OpenAI-compatible inference endpoint (self-hosted or provider), runs a configurable, realistic mix of prompt lengths and generation lengths at varying concurrency, and reports TTFT and tokens-per-second percentiles, plus a chart of throughput vs concurrency to visually locate the saturation point. Demonstrates: precise understanding of the two key latency metrics, load-testing methodology, and how to present performance data credibly.

2. **KV cache and batching visualizer** — A small local simulation/visualization (not requiring GPUs) that animates static batching vs continuous batching scheduling decisions over a synthetic request stream, and separately visualizes KV cache memory usage growing per active sequence, including a naive contiguous-allocation model versus a paged model. Demonstrates: deep conceptual understanding of the two most consequential inference optimizations, in a form that's genuinely useful for teaching others.

3. **Quantization accuracy/speed tradeoff report** — Take one open-weight model, serve it at full precision, INT8, and INT4, and run a fixed task-specific evaluation set (e.g., a code-generation or reasoning benchmark) against all three, reporting accuracy delta, memory footprint, and measured tokens-per-second for each. Demonstrates: the exact senior-level judgment call — "is this quantization level acceptable for this task" — backed by real numbers rather than assumption.

Each project: clear methodology write-up, reproducible measurement scripts, and an honest discussion of tradeoffs — the discipline of measuring rather than assuming is what distinguishes strong inference-engineering portfolio work.
`,

  "case-studies": `
### vLLM and PagedAttention: solving a memory problem, not a compute problem
The vLLM project (originating at UC Berkeley) observed that naive KV cache allocation wasted the majority of GPU memory to fragmentation, directly limiting how many concurrent requests a GPU could serve regardless of raw compute capacity. By borrowing OS virtual-memory paging concepts, PagedAttention turned a memory-management problem into a well-understood computer-science pattern, yielding large real-world throughput gains without any change to the underlying model. Lesson: some of the biggest LLM serving wins come from systems engineering — applying decades-old OS ideas to a new domain — not from new machine learning research.

### Anthropic and OpenAI's prompt/prefix caching as a product feature
Both companies expose prompt caching directly to API users as a way to reduce cost and latency for requests that repeat a large shared context (a long system prompt, a large document). This is a direct, user-facing product application of the shared-prefix KV cache reuse idea covered in Advanced Concepts. Lesson: an inference-mechanics optimization can become a headline product/pricing feature when it's exposed thoughtfully to users who understand their own traffic patterns.

### Speculative decoding's uneven real-world payoff
Speculative decoding papers demonstrated meaningful speedups on benchmarks, but production adoption has been more selective than universal — teams report the technique paying off strongly for predictable workloads (code completion, structured extraction) and offering less benefit for open-ended creative generation, exactly as the acceptance-rate mechanics predict. Lesson: a "genuinely clever" technique still requires workload-specific validation before being assumed to help; theoretical elegance does not guarantee universal practical benefit.

### The industry-wide shift toward quantized serving as the default, not the exception
As open-weight models grew into the tens and hundreds of billions of parameters, INT8/INT4 quantization (via methods like GPTQ and AWQ) moved from a niche cost-saving trick to a default deployment choice for many self-hosted deployments, because the accuracy loss for most everyday tasks proved smaller than initially assumed. Lesson: an inference optimization's real-world adoption curve often tracks how quickly the ecosystem builds confidence through published, task-specific accuracy benchmarks — not just the existence of the technique.
`,

  comparisons: `
| Dimension | Naive/no optimization | KV cache only | + Continuous batching | + PagedAttention | + Speculative decoding | + Quantization |
|-----------|------------------------|----------------|--------------------------|---------------------|---------------------------|-------------------|
| Redundant attention recompute | Yes, every step | Eliminated | Eliminated | Eliminated | Eliminated | Eliminated |
| GPU idle time from mismatched request lengths | High | High | Eliminated | Eliminated | Eliminated | Eliminated |
| KV cache memory fragmentation | N/A (no cache) | High | High | Eliminated | Eliminated | Reduced (smaller cache) |
| Tokens produced per target-model forward pass | 1 | 1 | 1 | 1 | Potentially several | 1 (independent axis) |
| Memory footprint of weights | Full precision | Full precision | Full precision | Full precision | Full precision (target) | Reduced |
| Implementation complexity | Lowest | Low | Moderate | Moderate-high | High | Moderate |
| Correctness risk if done wrong | None (just slow) | Low | Low | Low | Moderate (must verify distribution match) | Moderate (accuracy loss) |

**How seniors choose**: KV caching is never optional in any real deployment — it is table stakes. Continuous batching and PagedAttention (or engine-equivalent memory management) are the default choice for any multi-user production serving; the question is which engine implements them well (see **vLLM**, **SGLang**, **Ollama**), not whether to use them. Quantization level is chosen per task after measuring accuracy impact. Speculative decoding is adopted selectively, after measuring draft-model acceptance rate on the actual workload — it is the one technique on this page that is genuinely workload-dependent rather than a near-universal win.
`,

  "related-technologies": `
- **LLM Fundamentals** — the direct prerequisite: Transformers, attention, tokens, context windows. Read first if any term here felt unfamiliar.
- **Serving** — the production-infrastructure sibling: request scheduling at fleet scale, GPU provisioning, autoscaling, load balancing, multi-node deployment. This page is the mechanics Serving runs at scale.
- **vLLM** — the open-source engine that popularized PagedAttention and continuous batching; the concrete implementation of much of this page's Advanced Concepts section.
- **SGLang** — a serving engine with its own scheduling and caching innovations (including structured-output-aware generation), a direct alternative/complement to vLLM.
- **Ollama** — a simpler, developer/local-first inference runtime, useful for understanding these concepts hands-on without production-scale infrastructure.
- **Prompt Engineering** — determines what goes INTO the prefill phase; prompt length and structure directly affect TTFT and KV cache size.
- **Fine-Tuning** — determines what model is being served; a fine-tuned model still goes through the exact same inference mechanics described here.
- **Evaluation** — the discipline for measuring whether a quantization or speculative-decoding change preserved acceptable output quality.
- **Hallucination** and **Guardrails** — address output correctness and safety, which inference optimization does not touch.
- **Streaming** and **Server-Sent Events** — the transport-layer mechanisms that carry incrementally generated tokens to a client; see these for the wire-protocol side of the Streaming section on this page.

Natural next pages on this platform: **Serving** → **vLLM** / **SGLang** / **Ollama** → back to **Evaluation** and **Guardrails** once a serving pipeline exists to evaluate.
`,

  "latest-updates": `
Verified against my knowledge through early 2026; check the vLLM, SGLang, and TensorRT-LLM project pages and recent inference-systems papers for anything newer.

- **Continuous batching and PagedAttention-style memory management** have become the default expectation for any serious open-source or commercial inference engine, not a differentiating feature anymore — the conversation has shifted to how well each engine implements them under specific workloads (long context, high concurrency, structured output).
- **Speculative decoding variants have proliferated**: beyond a separate small draft model, techniques like self-speculative decoding (using a subset of the target model's own layers as the draft) and n-gram/lookahead drafting (no separate model at all, just pattern-matching recent context) have emerged, reducing the operational overhead of maintaining a separate draft model.
- **Disaggregated prefill/decode serving** (running the two phases on separately sized/tuned hardware pools) has moved from research proposal toward production adoption at large-scale deployments, reflecting the different bottleneck profiles (compute-bound vs memory-bandwidth-bound) described in Advanced Concepts.
- **Quantization tooling has matured**: calibration-aware methods (GPTQ, AWQ, and newer approaches) are now standard rather than experimental, and lower-precision formats (including FP8 on newer hardware) are increasingly used alongside or instead of INT8/INT4.
- **Prompt/prefix caching is now a standard, user-facing API feature** at major LLM providers, directly monetizing the shared-prefix KV cache reuse idea described in this page.

As with any fast-moving infrastructure area, verify specific benchmark numbers, current engine feature support, and provider pricing/caching details against current documentation rather than treating any number here as current.
`,

  "future-roadmap": `
Where inference optimization is heading, and what's worth betting career time on:

1. **Disaggregated serving architectures will keep spreading** as deployments scale, because prefill's compute-bound profile and decode's memory-bandwidth-bound profile genuinely want different hardware/tuning — understanding WHY they differ (this page's Advanced Concepts) is more durable knowledge than any specific engine's current feature flag.
2. **Speculative decoding will keep diversifying** away from requiring a separate trained draft model, toward lighter-weight self-speculative and lookahead methods that are cheaper to operate — the conceptual core (propose-then-verify-in-parallel) will outlast any specific drafting method.
3. **Quantization will keep pushing lower** (toward more aggressive sub-8-bit and mixed-precision schemes) as calibration techniques improve, making "how much accuracy does this cost, on MY task" an increasingly permanent skill rather than a temporary concern.
4. **KV cache efficiency will remain the central bottleneck story** as context windows keep growing — techniques that shrink cache size (architectural choices like GQA/MQA, and memory-management techniques like PagedAttention) will keep mattering as much as, or more than, raw compute improvements.
5. **The mechanics/infrastructure split will hold**: the algorithms on this page (batching strategy, caching, quantization, speculative decoding) are relatively stable conceptually even as implementations evolve; the fast-changing layer is the **Serving** infrastructure around them (autoscaling, fleet orchestration, multi-region routing).

For your career: understanding these mechanics well enough to reason about ANY current or future inference engine's design choices is more valuable than memorizing one engine's current configuration flags — engines change yearly, the underlying constraints (sequential decode, memory-bandwidth limits, memory fragmentation) do not.
`,

  "cheat-sheet": `
~~~text
# --- Core mental model ---
Autoregressive generation: predict ONE token, feed it back in, repeat.
Sequential dependency: token N+1 needs token N -- can't parallelize decode like training.
Two phases per request: PREFILL (whole prompt, parallel, compute-bound)
                         DECODE  (one token/step, sequential, memory-bandwidth-bound)

# --- KV cache ---
Caches: Key + Value projections per token, per layer (Query is NOT cached -- only current token's Q needed)
Avoids: recomputing K,V for every past token at every step
Size formula:
  bytes ~= 2 * num_layers * num_kv_heads * head_dim * seq_len * batch_size * bytes_per_value
Scales with:  sequence length (linear)  x  batch size (linear)
Mitigation:   GQA / MQA (fewer KV heads)  |  PagedAttention (no fragmentation)

# --- Batching ---
Static batching:     wait for WHOLE batch to finish -> GPU idles on slow stragglers
Continuous batching: evict/admit sequences every step -> no idle slots
                      -> the single biggest realistic-traffic throughput win

# --- Speculative decoding ---
Draft model proposes k tokens  ->  target model verifies ALL k in ONE parallel pass
Accept tokens up to first disagreement; target's own prediction fills the rest
Correctness: rejection sampling preserves target model's EXACT output distribution
Payoff depends on: draft-model ACCEPTANCE RATE (high for code/structured text, low for creative text)

# --- Quantization (inference-time) ---
fp16/bf16 (16-bit) -> INT8 (8-bit) -> INT4 (4-bit): less memory, faster (usually memory-bound decode), some accuracy loss
Calibration-aware methods (GPTQ, AWQ) beat naive rounding
ALWAYS measure accuracy loss on YOUR specific task -- no universal safe threshold

# --- PagedAttention ---
KV cache divided into fixed-size PAGES, addressed via a page table (like OS virtual memory)
Fixes: internal fragmentation (reserved-but-unused space) AND external fragmentation (scattered gaps)
Enables: more concurrent sequences per GPU + shared-prefix page reuse (copy-on-write)

# --- Latency metrics ---
TTFT (time to first token):        dominated by PREFILL + queueing; depends on prompt length
Inter-token latency / TPS:         dominated by DECODE; depends on memory bandwidth, batch efficiency
-> optimize them SEPARATELY, track both as distinct SLAs (p95/p99)

# --- Streaming ---
Send each token to the client AS IT'S PRODUCED, don't buffer the full response
-> improves PERCEIVED latency even if total generation time is unchanged
-> see Streaming / Server-Sent Events skills for transport mechanics

# --- Worked cost example shape ---
Total time  ~=  prefill_time(prompt_len)  +  decode_steps(gen_len) * per_token_time
Total cost  ~=  f(prompt_tokens, generation_tokens)  -- generation tokens usually cost
                more per-token than prompt tokens because decode is less parallel-efficient
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What makes LLM inference sequential? | Each output token's input includes every previously generated token, so token N+1 cannot be computed before token N exists |
| What does the KV cache store? | Key and Value projections for every previous token, per attention layer, so they aren't recomputed each step |
| Why doesn't the KV cache also store Queries? | Only the current, newest token's Query is needed at each step; past Queries are never reused |
| What two variables does KV cache size scale with? | Sequence length and batch size (both linearly) |
| Static batching's core flaw | Waits for the slowest sequence in a batch to finish before starting new work, wasting GPU slots |
| Continuous batching's fix | Admits/evicts individual sequences from the running batch at every step, no group wait |
| What does a draft model do in speculative decoding? | Proposes several candidate next tokens quickly and cheaply |
| Why is speculative decoding still "correct"? | Rejection sampling in the verification step guarantees output matches the target model's own distribution |
| What problem does PagedAttention solve? | KV cache memory fragmentation from pre-allocated contiguous per-sequence blocks |
| PagedAttention's core mechanism | Fixed-size memory pages plus a page table, borrowed from OS virtual memory |
| TTFT is dominated by which phase? | Prefill (plus queueing) |
| Tokens-per-second is dominated by which phase? | Decode |
| Why does streaming improve UX without changing total time? | Perceived latency drops because the user sees output immediately instead of waiting for the whole response |
| Inference-time quantization tradeoff | Lower precision weights: less memory, often faster decode, some accuracy loss |
| This page vs the Serving skill | This page: mechanics/algorithms of inference. Serving: infrastructure/systems that run it at scale |
`,

  mcqs: `
**1. Why can't decode steps be parallelized the way training steps can?**

A) GPUs are too slow  B) Token N+1's input depends on token N, which doesn't exist until generated  C) The KV cache prevents it  D) Tokenizers are sequential

**Answer: B** — this is a data dependency inherent to autoregressive generation, not a hardware or tooling limitation.

**2. What does the KV cache eliminate?**

A) The need for a tokenizer  B) Recomputing Key/Value projections for previously seen tokens at every generation step  C) The need for sampling  D) Prefill entirely

**Answer: B**

**3. Why does continuous batching improve throughput over static batching?**

A) It uses less GPU memory  B) It quantizes weights automatically  C) It avoids waiting for the slowest sequence in a batch before admitting new work  D) It skips the prefill phase

**Answer: C**

**4. In speculative decoding, what guarantees the final output matches standard decoding?**

A) The draft model is always correct  B) A rejection-sampling verification step in the target model  C) Quantization  D) PagedAttention

**Answer: B**

**5. Which metric is primarily governed by the prefill phase?**

A) Tokens-per-second  B) Time-to-first-token (TTFT)  C) KV cache size  D) Quantization accuracy loss

**Answer: B**

**6. What core problem does PagedAttention solve?**

A) Slow tokenization  B) Inaccurate sampling  C) KV cache memory fragmentation from contiguous per-sequence allocation  D) Draft model selection

**Answer: C**
`,

  "revision-notes": `
**Core mechanics in 5 lines:** LLM inference is autoregressive: predict one token, feed it back in, repeat. This creates a hard sequential dependency in decode, unlike training which processes a whole known sequence in parallel. Every request has two phases: prefill (whole prompt, parallel, compute-bound) and decode (one token at a time, sequential, memory-bandwidth-bound). The KV cache stores past tokens' Key/Value projections so they're never recomputed, trading memory for speed. KV cache size scales linearly with both sequence length and batch size, making it the frequent real ceiling on concurrent users.

**Batching in 3 lines:** Static batching waits for the whole batch's slowest sequence to finish before admitting new work, wasting GPU capacity under variable-length traffic. Continuous batching admits/evicts sequences at every decode step instead, which is why it is close to a default requirement for any real multi-user deployment. PagedAttention removes KV cache fragmentation by paging memory like an OS, letting more concurrent sequences fit in the same GPU.

**Advanced techniques in 4 lines:** Speculative decoding proposes several tokens with a cheap draft model and verifies them all in one parallel target-model pass, provably preserving the target's output distribution via rejection sampling — its payoff depends entirely on the draft model's acceptance rate for the given workload. Quantization (INT8/INT4) shrinks weight memory and often speeds decode, at a task-dependent accuracy cost that must always be measured, not assumed.

**Latency and UX in 3 lines:** TTFT (dominated by prefill/queueing) and tokens-per-second (dominated by decode) are different metrics requiring different optimizations, and both should be tracked as separate SLAs. Streaming sends tokens to the client incrementally, dramatically improving perceived latency independent of total generation time.

**Scope discipline in 2 lines:** This page covers the mechanics/algorithms of running inference efficiently. The **Serving** skill covers the infrastructure — fleets, autoscaling, load balancing — that runs these mechanics in production at scale; concrete engines implementing these ideas are the **vLLM**, **Ollama**, and **SGLang** skills.
`,

  "learning-roadmap": `
A realistic path to strong inference-mechanics fluency (assumes **LLM Fundamentals** already covered):

**Week 1 — Autoregressive generation and the two phases.** Read Beginner and Intermediate Concepts closely; do Hands-on Lab 1 (trace prefill vs decode by hand). Milestone: you can explain, without notes, why decode is sequential and prefill is not.

**Week 2 — KV cache mechanics.** Work through Intermediate Concepts' KV cache section and Coding Question 2 (the memory-footprint calculator); do Hands-on Lab 2. Milestone: you can compute an approximate KV cache size for a given model/context/batch configuration from memory.

**Week 3 — Batching and PagedAttention.** Read Advanced Concepts and Internal Working; do Hands-on Lab 3 (the batching simulator) and Coding Question 1. Milestone: you can explain, with a concrete example, exactly why continuous batching beats static batching under realistic traffic.

**Week 4 — Speculative decoding and quantization.** Finish Advanced Concepts; do Coding Question 3. Read one of the speculative decoding papers listed in Research Papers. Milestone: you can explain why speculative decoding is correct, not just fast, and articulate the task-dependent tradeoff quantization makes.

**Week 5 — Production application.** Read Production Usage, Performance, Deployment, and the Production Checklist; do Hands-on Lab 4, standing up a real engine. Milestone: a working, load-tested local deployment with TTFT/TPS numbers you measured yourself.

**Week 6 — Interview and portfolio polish.** Work through Interview Questions and Real Projects; pick one Real Project to build fully. Milestone: explain the KV cache, continuous batching, speculative decoding, and PagedAttention out loud, unprompted, each with a concrete numeric example.

Then continue to **Serving** on this platform — this page's mechanics are exactly what that infrastructure layer runs at scale, and from there to the **vLLM**, **Ollama**, and **SGLang** skills for concrete engine implementations.
`,

  "official-docs": `
- [vLLM documentation](https://docs.vllm.ai/) — the reference implementation of PagedAttention and continuous batching; excellent for grounding this page's concepts in a real, widely-used engine.
- [Hugging Face Transformers generation docs](https://huggingface.co/docs/transformers/main/en/generation_strategies) — covers decoding strategies (sampling, beam search, etc.) that sit on top of the mechanics described here.
- [NVIDIA TensorRT-LLM documentation](https://github.com/NVIDIA/TensorRT-LLM) — production inference engine docs covering quantization, batching, and speculative decoding support on NVIDIA hardware.
- [SGLang documentation](https://docs.sglang.ai/) — a modern serving engine's docs, useful for comparing scheduling and caching design choices against vLLM.
- [Anthropic API documentation — prompt caching](https://docs.anthropic.com/) — a concrete, user-facing implementation of the shared-prefix KV cache reuse idea covered in Advanced Concepts; verify current details on the live docs, since caching features evolve.
- [OpenAI API documentation](https://platform.openai.com/docs) — covers streaming and generation parameters from the consumer-facing side of the mechanics described in this page.
`,

  books: `
- **Designing Machine Learning Systems** — Chip Huyen. Covers serving and inference tradeoffs in the broader ML-systems context; not LLM-inference-specific but excellent grounding for the production mindset this page assumes.
- **Efficiently Scaling Transformer Inference** (Google research paper, often read alongside books) — while a paper rather than a book, it is commonly read as the deep-dive companion to any book-length ML-systems text for understanding inference-time compute/memory tradeoffs at scale.
- **Building LLM Applications** style engineering guides (various, rapidly evolving as of this writing) — verify current editions; the LLM-application-engineering book landscape is still young and moving fast, so prioritize primary sources (engine docs, papers) alongside any book here.
- **Computer Systems: A Programmer's Perspective** — Bryant & O'Hallaron. Not LLM-specific, but its memory-hierarchy and virtual-memory chapters are the direct conceptual ancestor of PagedAttention — genuinely useful background for understanding WHY that technique works.

Honest note: dedicated, mature books specifically on LLM inference internals are still a thin category as of this writing (the field moves faster than the book-publishing cycle); the primary sources — engine documentation and the research papers below — are currently the highest-signal material for this specific topic.
`,

  blogs: `
- **vLLM project blog / blog posts** — direct source for PagedAttention, continuous batching, and ongoing engine feature explanations from the team that built them.
- **PyTorch blog** — regularly covers inference optimization techniques (quantization, compilation) relevant to serving Transformer models.
- **Hugging Face blog** — frequent deep-dives on quantization methods, KV cache optimization, and serving techniques, often with runnable code.
- **Anthropic engineering blog** and **OpenAI engineering blog** — occasional posts on production inference infrastructure and techniques like prompt caching from the perspective of frontier-model providers.
- **NVIDIA developer blog** — TensorRT-LLM feature deep-dives, quantization technique explanations, and hardware-specific inference optimization content.
- **Databricks / MosaicML blog** — has published detailed technical content on inference efficiency and serving open-weight models at scale.

Verify recency on all of these — inference-engineering content ages quickly as engines and hardware evolve.
`,

  "research-papers": `
Core papers directly underpinning this page's content:

- **"Attention Is All You Need"** (Vaswani et al., 2017) — the foundational Transformer paper; not about inference specifically, but the architecture whose inference cost this entire page is about optimizing.
- **"Efficient Memory Management for Large Language Model Serving with PagedAttention"** (Kwon et al., 2023) — the vLLM paper; the primary source for the PagedAttention technique covered in Advanced Concepts.
- **"Fast Inference from Transformers via Speculative Decoding"** (Leviathan et al., 2023) and **"Accelerating Large Language Model Decoding with Speculative Sampling"** (Chen et al., 2023) — the two foundational speculative decoding papers, both worth reading for slightly different framings of the same core idea.
- **"Orca: A Distributed Serving System for Transformer-Based Generative Models"** (Yu et al., 2022, OSDI) — the paper generally credited with introducing the ideas behind continuous/iteration-level batching.
- **"GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers"** (Frantar et al., 2023) and **"AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration"** (Lin et al., 2024) — the two most widely adopted calibration-aware quantization methods referenced in this page.
- **"Fast Transformer Decoding: One Write-Head is All You Need"** (Shazeer, 2019) — the Multi-Query Attention paper, and **"GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints"** (Ainslie et al., 2023) — both directly explain the architectural KV-cache-shrinking techniques referenced in Advanced Concepts.

Honest note: this is a genuinely well-covered area of recent systems research (2022–2024 saw an unusually concentrated burst of foundational papers), so the list above is close to the core reading list rather than a thin sampling — start with the PagedAttention and speculative decoding papers, as they map most directly onto this page's Advanced Concepts.
`,

  videos: `
- **vLLM project talks** (conference recordings from PyTorch/AI infrastructure conferences) — walkthroughs of PagedAttention and continuous batching directly from the authors; search for the most recent recorded talk, as specific conference names/years vary.
- **Hugging Face and NVIDIA technical talks on quantization** — multiple recorded sessions covering GPTQ/AWQ practically, with runnable-code demonstrations.
- **"Efficient inference" sessions from major AI infrastructure conferences** (e.g., MLSys, hardware-vendor developer conferences) — search current listings, since specific talk titles and speakers change yearly.
- **SGLang and TensorRT-LLM project walkthroughs** — engine-specific deep dives that ground this page's conceptual material in a concrete, runnable system.

Honest note: verify speaker names, exact talk titles, and publication dates against current listings before citing a specific talk — this is a fast-moving conference/talk landscape without a small number of canonical, timeless videos the way some other topics have.
`,

  "github-repos": `
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — the reference PagedAttention and continuous batching implementation; read the scheduler and block-manager code directly for the clearest possible grounding in this page's Advanced Concepts.
- [sgl-project/sglang](https://github.com/sgl-project/sglang) — an alternative modern serving engine with its own scheduling and caching innovations, useful for comparison.
- [NVIDIA/TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) — production-grade engine implementing quantization, batching, and speculative decoding with hardware-specific optimization.
- [ollama/ollama](https://github.com/ollama/ollama) — a simpler, local-first inference runtime; good for hands-on experimentation without production-serving complexity.
- [huggingface/text-generation-inference](https://github.com/huggingface/text-generation-inference) — Hugging Face's production inference server, another concrete implementation of these techniques to study.
- [IST-DASLab/gptq](https://github.com/IST-DASLab/gptq) and [mit-han-lab/llm-awq](https://github.com/mit-han-lab/llm-awq) — reference implementations of the two major calibration-aware quantization methods discussed in this page.
- [FasterDecoding](https://github.com/topics/speculative-decoding) (GitHub topic, multiple repos) — a curated jumping-off point for speculative decoding implementations and variants.

Reading the vLLM scheduler and KV-cache-manager source code directly is the single highest-signal way to move from "understands PagedAttention conceptually" to "can reason about it precisely."
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Mechanics fluency*: given a model's num_layers, num_kv_heads, head_dim, and a target GPU memory budget, compute the maximum sequence length x batch size combination the KV cache can support (extend Coding Question 2).
2. *Batching intuition*: given a list of request generation lengths arriving over time (not all at once), simulate continuous batching with a fixed max_num_seqs and compute total GPU-steps used versus an idealized zero-waste baseline (extend Coding Question 1 and Hands-on Lab 3).
3. *Speculative decoding economics*: given a draft model's acceptance rate and the relative cost of a draft-model step versus a target-model step, compute the break-even acceptance rate below which speculative decoding is not worth enabling (extend Coding Question 3).
4. *Quantization tradeoff reasoning*: given a hypothetical accuracy-vs-quantization-level table for a task, and a cost-per-GB-of-GPU-memory figure, compute the total cost of ownership at each quantization level for a fixed traffic volume, and identify the crossover point.
5. *TTFT vs TPS diagnosis*: given a set of latency traces (prompt length, TTFT, total generation time, token count) for several requests, identify which requests are prefill-bound versus decode-bound, and propose a targeted fix for each.
6. *End-to-end design*: design (on paper) an inference configuration — quantization level, max context, batch size, whether to enable speculative decoding and prefix caching — for a specified product (e.g., a customer-support chatbot with a long shared system prompt versus a code-completion tool with short prompts and highly predictable completions), justifying every choice against this page's concepts.

External sets: the vLLM and SGLang GitHub issue trackers (real production tuning questions and their resolutions), MLSys and OSDI conference proceedings for inference-systems papers to work through as reading/reproduction exercises.
`,

  "architecture-diagram": `
The reference architecture for a production LLM inference deployment — the shape this page's mechanics compose into before the **Serving** skill's fleet-level orchestration wraps around it:

~~~mermaid
flowchart TB
    Client["Clients (chat UI, API consumers)"] --> GW["API gateway / load balancer"]
    GW --> Eng1["Inference engine instance 1\n(vLLM / SGLang / TensorRT-LLM)"]
    GW --> Eng2["Inference engine instance N"]

    subgraph Instance["Inside one inference engine instance"]
        Sched["Scheduler\n(continuous batching)"]
        KVMgr["KV cache manager\n(PagedAttention-style paging)"]
        Runner["Model runner\n(prefill + decode forward passes)"]
        Spec["Speculative decoding\n(optional draft model)"]
        Quant["Quantized weights\n(INT8 / INT4, if configured)"]
        Sched --> KVMgr
        Sched --> Runner
        Runner --> Spec
        Runner --> Quant
        Runner --> KVMgr
    end

    Eng1 --> Instance
    Eng1 -->|streamed tokens| GW
    GW -->|SSE / chunked stream| Client

    Eng1 -.metrics: TTFT, TPS, KV mem.-> Obs["Monitoring\n(see Serving skill)"]
~~~

Everything inside the "Instance" subgraph is this page's territory; everything about how many instances exist, how the gateway load-balances across them, and how they autoscale belongs to the **Serving** skill.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Inference))
    Autoregressive generation
      One token at a time
      Sequential dependency
      Prefill vs decode
    KV cache
      Stores K,V per token per layer
      Memory vs speed tradeoff
      Scales with seq len x batch size
      GQA / MQA shrink it
    Batching
      Static batching
      Continuous batching
      Throughput under variable-length traffic
    PagedAttention
      OS-style memory paging
      Fixes fragmentation
      Enables prefix sharing
    Speculative decoding
      Draft model proposes
      Target model verifies in parallel
      Rejection sampling preserves distribution
      Acceptance rate drives payoff
    Quantization
      INT8 / INT4 weights
      Memory and speed win
      Task-dependent accuracy cost
    Latency metrics
      TTFT: prefill-bound
      Tokens per second: decode-bound
      Streaming improves perceived latency
    Ecosystem
      vLLM
      SGLang
      Ollama
      Serving infrastructure
    Career
      Interview classics
      Worked cost examples
      Reading path
~~~
`,
};

export default inference;
