import type { SkillContent } from "../types";

/**
 * vLLM — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const vllm: SkillContent = {
  overview: `
vLLM is a high-throughput, memory-efficient open-source inference and serving engine for large language models, built around a single core innovation — **PagedAttention** — that manages the GPU memory used by attention's key-value (KV) cache the way an operating system manages virtual memory: in fixed-size, non-contiguous pages, addressed indirectly. That one idea, plus **continuous batching** of incoming requests, is why vLLM became the default answer to "how do I serve this model fast, to many concurrent users, without wasting most of my GPU" for open-weight models.

For an AI engineer, vLLM sits at the "last mile" of the model-serving stack: you've picked a model (via **Hugging Face**, perhaps), you've decided it needs to run somewhere you control (cost, latency, data residency, or a model not available behind any hosted API) — vLLM is very often the engine that actually executes it under real traffic. It exposes an OpenAI-compatible HTTP API, so most application code written against **the OpenAI Responses API** or a similar interface can point at a self-hosted vLLM server with minimal changes.

Key characteristics: PagedAttention for near-zero KV-cache memory waste; continuous (iteration-level) batching so GPUs stay busy across requests of very different lengths; broad model architecture support (most popular open-weight LLM families); multiple quantization formats; tensor and pipeline parallelism for models too large for one GPU; and a production-shaped HTTP server (vllm serve) with streaming, function calling, and structured-output support. It is one of the most widely adopted projects in the open-source LLM-serving space and is developed by a broad community (originating from UC Berkeley's Sky Computing Lab) rather than a single vendor.
`,

  history: `
vLLM emerged directly from an academic systems-research insight about how wastefully naive LLM serving implementations used GPU memory, applied by its authors to build a production-grade engine around that insight.

| Year | Milestone |
|------|-----------|
| 2022–2023 | Early LLM-serving systems (naive Hugging Face transformers.generate, early FasterTransformer/ **NVIDIA** approaches) waste 60-80% of KV-cache memory to fragmentation and over-allocation, since each request reserves a worst-case-length contiguous memory block |
| 2023 | UC Berkeley researchers (Kwon, Zhuohan Li, and collaborators, associated with the Sky Computing Lab) publish **"Efficient Memory Management for Large Language Model Serving with PagedAttention"** (SOSP 2023) and release vLLM as open source alongside it |
| 2023 | PagedAttention's OS-inspired paging approach for the KV cache demonstrates dramatically higher throughput than existing serving stacks by nearly eliminating memory fragmentation and enabling much larger effective batch sizes |
| 2023–2024 | vLLM adds continuous batching, an OpenAI-compatible API server, broad model-architecture support, and quantization (AWQ, GPTQ, and others) — moving quickly from a research artifact to a genuinely production-usable engine |
| 2024 | Tensor parallelism and pipeline parallelism mature for multi-GPU serving of larger models; speculative decoding and prefix caching land as further throughput/latency optimizations |
| 2024–2025 | vLLM becomes one of the most widely adopted self-hosted LLM-serving engines, with contributions from a broad set of companies and cloud providers, and is frequently used as the reference/benchmark engine that new inference optimizations are compared against |
| 2025 | Continued architecture-support expansion (new open-weight model families as they're released), further quantization and hardware-backend work (including non-NVIDIA accelerators) — I'm not fully confident of every specific recent release's contents and would verify current details against the project's own changelog |

The throughline: vLLM's rise tracks almost exactly with the rise of serious self-hosted open-weight LLM deployment — as soon as running your own model at scale became a common need, the memory-fragmentation problem PagedAttention solves became the central bottleneck worth solving well.
`,

  "why-it-exists": `
Before vLLM, serving an LLM yourself (rather than calling a hosted API) typically meant using Hugging Face's transformers.generate directly, or an early custom inference server — both of which had a severe, largely invisible problem: **KV-cache memory fragmentation**.

Every request to an LLM needs a KV cache — a per-token, per-layer set of tensors the model uses to avoid recomputing attention over the whole sequence so far. Naive implementations allocate this cache as one contiguous block of GPU memory sized for the maximum possible sequence length, for every request, whether that request needs it or not. The consequences: most of that reserved memory sits unused for most requests (internal fragmentation), memory can't be reused efficiently between requests of different lengths (external fragmentation), and the GPU can therefore only hold a small number of concurrent requests before running out of memory — even though the actual KV-cache data being used at any moment is a small fraction of what's reserved.

vLLM's authors noticed this was structurally the same problem operating systems solved decades earlier for process memory: fragmentation from contiguous, worst-case allocation. Their fix, PagedAttention, applies the same solution — divide the KV cache into small fixed-size blocks ("pages"), allocate them on demand, and use an indirection table (like a page table) to let attention computation treat a scattered set of physical blocks as one logical sequence. The result, demonstrated in their original paper, was dramatically higher achievable batch sizes and throughput on identical hardware, simply by nearly eliminating wasted memory.

What vLLM deliberately does **not** solve: it does not change the model's architecture, its accuracy, or the fundamental compute cost of a forward pass — it makes memory management (and therefore achievable concurrency) dramatically more efficient, which is a serving-layer problem, not a modeling problem.
`,

  "problem-it-solves": `
vLLM removes concrete, measurable pains in self-hosted LLM serving:

- **Wasted GPU memory from KV-cache fragmentation.** PagedAttention's paged, on-demand block allocation means the KV cache for concurrent requests packs tightly into available memory instead of each reserving a worst-case contiguous block — this alone is the primary reason vLLM achieves much higher throughput than naive serving on the same hardware.
- **Poor GPU utilization from static batching.** Older batching approaches wait for a fixed batch of requests to all finish together, so a batch's throughput is bottlenecked by its slowest (longest) member and short requests sit idle waiting for long ones. Continuous batching (also called iteration-level scheduling) instead adds new requests into the batch as soon as GPU capacity frees up, token-by-token, keeping the GPU consistently busy.
- **Reinventing an OpenAI-compatible serving layer per project.** vLLM ships an HTTP server implementing the OpenAI Chat Completions/Completions API shape, so existing client code and tooling built against that interface (or against **the OpenAI Responses API**'s general conventions) can point at a self-hosted model with minimal integration work.
- **Manual multi-GPU sharding for large models.** Tensor and pipeline parallelism are built in, so serving a model too large for one GPU doesn't require hand-rolling a custom sharding scheme.
- **Redundant recomputation across requests sharing a prompt prefix.** Prefix caching (reusing KV-cache blocks for an identical shared prefix across requests) avoids recomputing attention for content multiple requests have in common — directly relevant to, and complementary with, the ideas in the **Context Engineering** and **Semantic Caching** skills, though it operates at the KV-cache layer rather than the response-cache layer.

What vLLM deliberately does **not** solve:

- It does not decide *which* model to use, or improve a model's underlying quality/accuracy — see **AI Evals** for that concern.
- It is not a full MLOps platform — deployment orchestration, autoscaling policy, and multi-model routing are typically handled by surrounding infrastructure (Kubernetes, a model gateway) rather than by vLLM itself.
- It does not eliminate the fundamental compute cost of running a large model — it maximizes how efficiently existing GPU compute and memory are used, which is a very different (and much more tractable) problem than making the model itself cheaper to run per token.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what PagedAttention is, the specific memory-fragmentation problem it solves, and why that matters for achievable serving throughput.
2. Explain continuous batching and contrast it with static/naive batching.
3. Stand up a vLLM server for an open-weight model and call it through its OpenAI-compatible API.
4. Choose appropriate serving configuration (max model length, GPU memory utilization, quantization, tensor parallel size) for a given model and hardware budget.
5. Reason about tensor parallelism versus pipeline parallelism for serving a model too large for one GPU.
6. Identify the key throughput and latency metrics for an LLM-serving system (TTFT, inter-token latency, throughput in tokens/sec) and use them to make configuration decisions.
7. Compare vLLM against alternative serving engines (**Ollama**, **SGLang**, TensorRT-LLM, plain Hugging Face) and choose deliberately based on workload shape.
8. Identify vLLM's production concerns: deployment topology, monitoring, security, and common failure modes.
`,

  prerequisites: `
- **Required**: basic familiarity with how an LLM generates text — tokens, autoregressive decoding, the general shape of a transformer's attention mechanism. If attention itself is unfamiliar, a general "how transformers work" primer is worth reading first.
- **Required**: comfort with the command line and basic **Docker**/container usage, since vLLM is typically run as a containerized service.
- **Required**: access to (or familiarity with) an NVIDIA GPU and CUDA, since vLLM's primary, most mature backend targets NVIDIA hardware (other backends exist but are less universally mature — verify current support for your specific hardware).
- **Helpful**: familiarity with the OpenAI Chat Completions API shape, since vLLM's HTTP server mirrors it closely — existing client code targeting **the OpenAI Responses API** or Chat Completions largely transfers.
- **Helpful**: basic **Python** fluency for writing client code and understanding vLLM's own Python library interface (the offline batch-inference LLM class), beyond just the HTTP server.
- **Helpful**: general familiarity with **Hugging Face** model hosting/formats, since vLLM loads models directly from Hugging Face Hub checkpoints (or a local equivalent) in most common workflows.

Dependency chain: general transformer/attention fundamentals → **Python** and **Docker** → this page → compare against **Ollama** and **SGLang** for workload-appropriate engine choice, and connect to **Cost Optimization** and **Latency** for the broader serving-efficiency picture.
`,

  "beginner-concepts": `
### The core idea, with no jargon

When an LLM generates text, it needs to remember everything it has already generated (and the prompt) to predict the next token efficiently — that memory is called the KV cache. Naive serving reserves a big, fixed chunk of GPU memory per request for this cache, "just in case" the request turns out to be long, which wastes enormous amounts of memory across many requests of different actual lengths. vLLM instead breaks the KV cache into small pages, allocated only as needed — like how a computer's operating system gives a program memory in small pages rather than one giant fixed block. This lets far more requests fit in the same GPU memory at once, which means far higher throughput.

### Installing and running a first vLLM server

~~~bash
# Install vLLM (requires a compatible CUDA-enabled environment)
pip install vllm

# Serve an open-weight model with an OpenAI-compatible HTTP API
vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --max-model-len 8192 \\
  --gpu-memory-utilization 0.9
~~~

### Calling it like the OpenAI API

Because vLLM's server implements the same Chat Completions API shape as OpenAI's hosted API, existing OpenAI client libraries work against it directly, pointed at your own server's URL:

~~~python
from openai import OpenAI

# Point the standard OpenAI client at your self-hosted vLLM server instead of api.openai.com
client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed-for-local-vllm")

response = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[{"role": "user", "content": "Explain PagedAttention in one sentence."}],
    max_tokens=200,
    timeout=30,   # always set a client-side timeout, even against your own server
)
print(response.choices[0].message.content)
~~~

### Offline batch inference (no server needed)

For batch jobs (scoring a large dataset, generating synthetic data), vLLM's Python library can be used directly, without standing up an HTTP server at all:

~~~python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-3.1-8B-Instruct")
params = SamplingParams(temperature=0.7, max_tokens=200)

prompts = ["Summarize the plot of Hamlet.", "What is PagedAttention?"]
outputs = llm.generate(prompts, params)   # vLLM batches these internally, efficiently

for output in outputs:
    print(output.outputs[0].text)
~~~

### The key config knobs, at a glance

- **max-model-len**: the maximum context length (prompt + generation) the server will accept; set it to what your workload actually needs, not the model's absolute maximum, since it directly affects how much KV-cache memory is reserved.
- **gpu-memory-utilization**: what fraction of GPU memory vLLM is allowed to use for weights + KV cache (commonly around 0.85-0.95); leaving it too low wastes capacity, too high risks out-of-memory errors from other processes on the same GPU.
`,

  "intermediate-concepts": `
### Continuous batching in detail

Static batching waits for N requests, runs them together token-by-token until the longest one finishes, and only then starts a new batch — GPU cycles are wasted on already-finished shorter requests sitting idle in the batch. Continuous batching (vLLM calls its scheduling approach iteration-level scheduling) instead re-evaluates, at every decoding step, which requests are still active and can admit new requests into the running batch the moment capacity frees up:

~~~python
# Conceptual illustration -- NOT vLLM's actual internals, but the model to reason with:
# At each decode step, the scheduler asks: which sequences are still generating,
# is there free KV-cache capacity, and can a new request be admitted right now?
def scheduler_step(running_sequences, waiting_queue, free_kv_blocks):
    for seq in running_sequences:
        if seq.is_finished():
            running_sequences.remove(seq)
            free_kv_blocks += seq.release_blocks()
    while waiting_queue and free_kv_blocks >= waiting_queue[0].blocks_needed():
        new_seq = waiting_queue.pop(0)
        running_sequences.append(new_seq)
        free_kv_blocks -= new_seq.blocks_needed()
    return run_one_decode_step(running_sequences)   # all active sequences advance one token together
~~~

This is the single biggest reason vLLM (and similarly-designed engines like **SGLang**) dramatically outperform naive per-request serving under real, mixed-length production traffic.

### Quantization

Running a model at lower numerical precision (e.g. 8-bit or 4-bit weights instead of 16-bit) trades a small amount of accuracy for significantly less GPU memory and, on supported hardware, faster compute:

~~~bash
# Serve an AWQ-quantized checkpoint (a common 4-bit quantization format)
vllm serve TheBloke/Llama-2-13B-chat-AWQ --quantization awq

# GPTQ is another widely-used quantization format vLLM supports
vllm serve TheBloke/Llama-2-13B-chat-GPTQ --quantization gptq
~~~

Quantization lets a larger model fit on smaller/fewer GPUs, or lets more concurrent requests fit in the same memory budget — the tradeoff (accuracy loss, and which quantization format is well-supported on your specific hardware) should be validated against your own **AI Evals** rather than assumed acceptable by default.

### Prefix caching

When many requests share an identical prompt prefix (a long system prompt, a shared few-shot example set, a large retrieved-context block reused across similar queries), vLLM can reuse the already-computed KV-cache blocks for that shared prefix instead of recomputing them for every request:

~~~bash
vllm serve meta-llama/Llama-3.1-8B-Instruct --enable-prefix-caching
~~~

This is conceptually related to the KV/prompt-caching ideas covered generally in the **Context Engineering** skill, applied specifically inside vLLM's own KV-cache management — it reduces both compute and time-to-first-token for requests sharing a common prefix, and is a distinct mechanism from **Semantic Caching**'s response-level, meaning-based cache.

### Streaming responses

~~~python
stream = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[{"role": "user", "content": "Write a short poem about GPUs."}],
    stream=True,   # tokens arrive incrementally, matching the OpenAI streaming shape
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
~~~

Streaming is essential for interactive applications, since it lets a user see the first tokens (time-to-first-token) long before the full response is generated, dramatically improving perceived latency even when total generation time is unchanged — see the **Latency** skill.

### Function calling and structured output

vLLM supports OpenAI-compatible tool/function calling and, for many models, guided/structured decoding (constraining output to match a JSON schema) — directly relevant to the **Structured Outputs** skill's broader discipline of getting reliably parseable data out of an LLM, enforced here at the serving-engine level rather than only through prompting.
`,

  "advanced-concepts": `
### PagedAttention internals

PagedAttention's core data structure mirrors an OS page table: the KV cache for a sequence is stored as a set of fixed-size physical blocks (commonly holding a small, fixed number of tokens' worth of KV data each) that need not be contiguous in GPU memory. A per-sequence "block table" maps logical block indices (block 0, 1, 2, … of this sequence) to physical block locations. The attention kernel is rewritten to gather across this indirection rather than assuming a contiguous KV tensor, which is the specific systems engineering (not just the high-level idea) that makes the approach performant rather than merely elegant.

This block-based structure also directly enables:

- **Prefix caching** (above): identical prefix blocks across sequences can literally be the same physical blocks, reference-counted, rather than duplicated.
- **Copy-on-write for parallel sampling / beam search**: when multiple candidate sequences share a common prefix and only diverge later (e.g. sampling several completions from one prompt), they can share physical blocks for the common part and only allocate new blocks where they diverge — directly analogous to copy-on-write memory in an OS, and a direct payoff of modeling the KV cache as pages in the first place.
- **Efficient preemption**: when GPU memory pressure requires evicting a lower-priority sequence to make room, its blocks can be swapped out (to CPU memory) or recomputed later, rather than requiring the whole batch to stall.

### Tensor parallelism vs. pipeline parallelism

| Approach | What it splits | When to use | Cost |
|---|---|---|---|
| Tensor parallelism (TP) | Each layer's weight matrices, sharded across GPUs, all GPUs work on the same layer simultaneously | Model too large for one GPU, low-latency priority, GPUs on a fast interconnect (NVLink) | Requires frequent, low-latency cross-GPU communication per layer |
| Pipeline parallelism (PP) | Different layers assigned to different GPUs, sequentially | Very large models, or GPUs without a fast interconnect between all pairs | Introduces pipeline "bubbles" (idle time) unless enough concurrent requests keep every stage busy |

~~~bash
# Tensor-parallel serving across 4 GPUs on one node
vllm serve meta-llama/Llama-3.1-70B-Instruct --tensor-parallel-size 4

# Combine tensor and pipeline parallelism for very large models across multiple nodes
vllm serve some-org/very-large-model --tensor-parallel-size 8 --pipeline-parallel-size 2
~~~

Senior guidance: prefer tensor parallelism within a single node with fast GPU-to-GPU interconnect (NVLink) whenever the model fits; reach for pipeline parallelism (often combined with tensor parallelism) only once a model must span multiple nodes or GPUs without a fast interconnect between them, since PP's bubble overhead is more forgiving when request concurrency is high enough to keep every pipeline stage fed.

### Speculative decoding

A smaller, faster "draft" model proposes several tokens ahead; the larger target model verifies them in a single forward pass, accepting the draft tokens that match what it would have generated itself and only falling back to its own generation where they diverge. Because verifying several tokens in one pass is cheaper than generating them one at a time, this can meaningfully reduce end-to-end latency for the same output distribution — the correctness guarantee (the final output distribution matches what the target model alone would produce) is what distinguishes this from simply using a smaller, less accurate model.

### Scheduling policy and fairness

Under load, vLLM's scheduler must decide which waiting requests to admit into the running batch and, under memory pressure, which running sequences to preempt. This is a genuine systems tradeoff between throughput (favor whichever requests keep the GPU busiest) and fairness/latency predictability (avoid a scenario where long requests perpetually starve short ones, or where a burst of load causes wildly unpredictable per-request latency) — production deployments should monitor tail latency (p95/p99), not just average throughput, precisely because scheduling-policy effects show up there first.

### Disaggregated prefill/decode serving

An advanced deployment pattern separates the compute-bound "prefill" phase (processing the prompt, computing its initial KV cache) from the memory-bandwidth-bound "decode" phase (generating tokens one at a time) onto different GPU pools, since the two phases have different bottlenecks and scale differently under load. This is an active area of ongoing engine development across the self-hosted-serving ecosystem broadly (not unique to vLLM) — I'd verify current vLLM support and maturity for this specific pattern against its latest documentation rather than assuming a fixed feature set.
`,

  "internal-working": `
Here is what happens, step by step, when a request arrives at a running vLLM server:

~~~mermaid
flowchart TD
    A["HTTP request arrives\n(OpenAI-compatible API)"] --> B["Tokenize prompt"]
    B --> C["Scheduler: admit to running batch\nif KV-cache blocks available"]
    C --> D{"Blocks available?"}
    D -- no --> E["Queue, or preempt a lower-priority\nsequence to free blocks"]
    D -- yes --> F["Allocate KV-cache pages\n(PagedAttention block table)"]
    F --> G["Prefill: compute KV cache\nfor the full prompt in one pass"]
    G --> H["Decode loop: generate one token\nper step, across ALL active sequences\ntogether (continuous batching)"]
    H --> I{"Sequence finished?\n(EOS or max tokens)"}
    I -- no --> H
    I -- yes --> J["Release this sequence's\nKV-cache blocks"]
    J --> K["Stream/return final tokens\nto the client"]
~~~

1. **Tokenization.** The incoming prompt is tokenized using the model's tokenizer, exactly as with any transformer inference.
2. **Scheduling and admission.** The scheduler checks whether enough free KV-cache blocks exist to admit this request into the currently running batch; if not, it queues the request or, under memory pressure, may preempt a lower-priority running sequence.
3. **Block allocation.** PagedAttention allocates the KV-cache pages this sequence will need, recorded in its block table — no large contiguous reservation, just as many small blocks as are actually needed so far.
4. **Prefill.** The model processes the entire prompt in one forward pass, populating the KV cache for every prompt token — this phase is compute-bound (the GPU is doing a lot of matrix multiplication relative to memory movement).
5. **Decode loop.** One token at a time, the model generates the next token for every currently active sequence in the batch simultaneously — this phase is memory-bandwidth-bound (moving the KV cache and weights is often the bottleneck, not raw compute), which is exactly why packing more concurrent sequences into memory (PagedAttention's whole point) directly increases achievable throughput.
6. **Continuous admission and release.** At every decode step, finished sequences release their blocks immediately and newly arrived requests can be admitted the moment capacity allows — no waiting for a fixed batch boundary.
7. **Result delivery.** Completed (or incrementally streamed) tokens are detokenized and returned to the client via the HTTP API.

The core internal fact worth remembering: decode is memory-bandwidth-bound, which is why the entire architecture is built around maximizing how many concurrent sequences' KV caches fit in GPU memory at once, rather than around raw FLOPs.
`,

  architecture: `
A senior engineer thinks about vLLM at two levels: its internal serving architecture, and how to structure a production system around it.

### Internal serving architecture

~~~mermaid
flowchart TB
    subgraph VLLMServer["vLLM Server Process"]
        API["OpenAI-compatible\nHTTP API layer"]
        Scheduler["Scheduler\n(continuous batching, admission control)"]
        BlockMgr["PagedAttention\nBlock Manager"]
        Engine["Model execution engine\n(forward passes, sampling)"]
        subgraph GPUs["GPU(s)"]
            Weights["Model weights\n(sharded if tensor-parallel)"]
            KVCache["KV cache\n(paged, non-contiguous blocks)"]
        end
    end
    API --> Scheduler --> BlockMgr --> Engine
    Engine --> Weights
    Engine --> KVCache
    BlockMgr -.manages.-> KVCache
~~~

### Application architecture — a production model-serving deployment

~~~
myinference/
├── deploy/
│   ├── docker-compose.yml       # or Kubernetes manifests
│   └── vllm-config.yaml         # model, max-model-len, TP size, quantization
├── src/myinference/
│   ├── gateway/                 # a thin API gateway in front of one or more vLLM servers
│   │   ├── router.py            # model/version routing, request validation
│   │   └── rate_limiter.py      # per-tenant/per-key rate limiting
│   ├── client/
│   │   └── vllm_client.py       # OpenAI-client wrapper with timeouts, retries
│   └── observability/
│       ├── metrics.py           # scrape vLLM's Prometheus endpoint, add app-level metrics
│       └── tracing.py
└── tests/
~~~

Rules: no application code calls a vLLM server directly except through client/vllm_client.py — this keeps timeout, retry, and load-aware routing logic in exactly one place; the gateway layer owns authentication and per-tenant rate limiting rather than relying on vLLM's own baseline API-key support alone.
`,

  "data-flow": `
Trace one chat completion request end to end, from a client's perspective:

~~~mermaid
sequenceDiagram
    participant Client
    participant GW as API Gateway
    participant vLLM as vLLM Server
    participant GPU

    Client->>GW: POST /v1/chat/completions {messages, stream:true}
    GW->>GW: auth, rate limit, route to model
    GW->>vLLM: forward request
    vLLM->>vLLM: tokenize, scheduler admits request
    vLLM->>GPU: allocate KV-cache pages, run prefill
    GPU-->>vLLM: KV cache populated, first token ready
    vLLM-->>GW: stream first token (low TTFT)
    GW-->>Client: stream first token
    loop decode loop, all active sequences together
        GPU-->>vLLM: next token for this sequence
        vLLM-->>GW: stream token
        GW-->>Client: stream token
    end
    vLLM-->>GW: finish_reason: stop
    GW-->>Client: stream closed
    vLLM->>vLLM: release this sequence's KV-cache blocks
~~~

The critical thing this trace makes visible: time-to-first-token (TTFT) is dominated by the prefill phase (a single, compute-bound pass over the whole prompt), while every subsequent token's latency (inter-token latency) is dominated by the memory-bandwidth-bound decode loop shared across every other active sequence in the batch — these are genuinely different bottlenecks, and production tuning (see Performance) treats them separately rather than as one undifferentiated "latency" number.
`,

  "production-usage": `
### Where it actually gets deployed

vLLM is the default choice for teams self-hosting open-weight models at meaningful scale: internal LLM platforms serving multiple teams, cost-sensitive high-volume workloads where a hosted API's per-token pricing doesn't pencil out, data-residency-constrained deployments, and research/product teams fine-tuning open-weight models and needing to serve their own checkpoints.

### Typical deployment shape

~~~bash
# A representative production launch command
vllm serve meta-llama/Llama-3.1-70B-Instruct \\
  --tensor-parallel-size 4 \\
  --max-model-len 32768 \\
  --gpu-memory-utilization 0.92 \\
  --enable-prefix-caching \\
  --quantization awq \\
  --served-model-name llama-3.1-70b \\
  --api-key "$VLLM_API_KEY"
~~~

- **Containerized deployment**: vLLM ships official Docker images; most production deployments run it in Kubernetes (often via a dedicated GPU node pool) or a managed GPU compute platform.
- **Behind a gateway**: a thin API gateway typically sits in front of one or more vLLM server instances, handling authentication, per-tenant rate limiting, request routing across multiple served models, and centralizing observability — vLLM's own API-key support is a baseline, not usually a full production auth solution on its own.
- **Autoscaling**: GPU-backed autoscaling is slower and more expensive than typical CPU-based web-service autoscaling (GPU instances take longer to provision, and are far more costly to keep idle) — many teams run a baseline of always-on vLLM replicas sized for expected steady-state load, with more conservative, slower autoscaling for burst capacity.
- **Multi-model serving**: running several models on the same GPU fleet (either as separate vLLM processes each pinned to a subset of GPUs, or via a routing layer directing traffic to the right model's server) is a common pattern once a team serves more than one model in production.

### Configuration guidance

Set max-model-len to what your actual workload needs, not the model's theoretical maximum — a needlessly large max-model-len reserves KV-cache capacity for context lengths you'll rarely or never use, directly reducing the number of concurrent requests you can serve. Validate quantization choices against your own **AI Evals**, since accuracy impact varies by model and task. I'm not confident of exact current default values or every recently-added CLI flag — check vllm serve --help and the official documentation for your installed version before finalizing a production configuration.
`,

  "industry-examples": `
- **Major cloud providers and GPU cloud platforms** commonly offer vLLM as a supported or recommended serving engine for deploying open-weight models on their infrastructure, given how widely adopted it has become as the de facto standard self-hosted serving stack.
- **Companies fine-tuning open-weight models** (a very common pattern across AI product companies, from startups to large enterprises) frequently use vLLM as the serving layer for their fine-tuned checkpoints, since it accepts standard Hugging Face-format checkpoints directly without a bespoke conversion step for most architectures.
- **Research labs and benchmarking efforts** across the industry routinely use vLLM as the reference serving engine when publishing throughput/latency comparisons for new models or new inference optimizations, since its widespread adoption makes it a credible, well-understood baseline.
- **Internal LLM platform teams** at many mid-size and large tech companies (a very common but less often publicly detailed pattern) build an internal "model serving platform" with vLLM as the core engine behind a company-wide gateway, serving multiple internal teams and use cases from a shared GPU fleet.

I don't have verified, specific, attributable production metrics (e.g. named companies with measured throughput or cost figures) beyond this general adoption pattern, and would rather flag that honestly than invent a number — vLLM's GitHub repository and its associated blog/community content are the best current sources for specific, citable adoption examples.
`,

  "best-practices": `
1. **Set max-model-len to your actual workload's needs, not the model's theoretical maximum.** This is the single highest-leverage configuration decision for maximizing concurrent request capacity.
2. **Validate quantization choices against your own evals**, not against a general claim that "accuracy loss is negligible" — impact varies meaningfully by model, task, and quantization method.
3. **Enable prefix caching whenever requests share significant common prefixes** (shared system prompts, few-shot examples, repeated retrieved context) — it's close to a free win when the workload shape supports it.
4. **Monitor tail latency (p95/p99), not just average throughput or mean latency.** Scheduling and memory-pressure effects show up first and most severely in the tail.
5. **Put a gateway in front of vLLM for anything beyond a single internal team's use** — centralize authentication, rate limiting, and multi-model routing there rather than relying on vLLM's own baseline API-key support alone.
6. **Choose tensor parallelism over pipeline parallelism when the model fits within one node's fast-interconnect GPUs**, reserving pipeline parallelism (often combined with TP) for genuinely multi-node deployments.
7. **Size gpu-memory-utilization deliberately, leaving headroom for other GPU processes** (monitoring agents, other services on a shared node) rather than maximizing it blindly.
8. **Always set client-side timeouts on requests to your own vLLM server**, exactly as you would for any external API — a hung or overloaded server should never hang your calling application indefinitely.
9. **Benchmark with a request pattern that matches your real traffic's length distribution**, not synthetic fixed-length prompts — continuous batching's advantage is most visible under realistic, mixed-length concurrent load.
10. **Pin your vLLM version deliberately and test upgrades before rolling to production** — a fast-moving project means meaningful behavior and default-value changes can appear between versions.
11. **Treat GPU autoscaling conservatively** — provisioning latency and cost make aggressive GPU autoscaling a poor fit for most workloads; favor a right-sized always-on baseline plus slower burst capacity.
`,

  "anti-patterns": `
### Setting max-model-len to the model's absolute maximum "just in case"

~~~bash
# WRONG: reserves KV-cache capacity for a 128k context on every request,
# even though your actual workload never exceeds 4k tokens
vllm serve some-model --max-model-len 131072

# RIGHT: size it to your actual, measured workload needs
vllm serve some-model --max-model-len 8192
~~~

This single misconfiguration is the most common way teams unknowingly cripple their own achievable concurrent-request capacity.

### Assuming quantization is a free lunch

~~~python
# WRONG: switch to 4-bit quantization to save memory, ship without re-running evals
# RIGHT: re-run your AI Evals suite against the quantized model specifically,
# on the actual tasks your product depends on, before trusting it in production
~~~

### No client-side timeout against your own server

~~~python
# WRONG: assume your own infrastructure never hangs
response = client.chat.completions.create(model=m, messages=msgs)

# RIGHT: treat your own vLLM server like any other network dependency
response = client.chat.completions.create(model=m, messages=msgs, timeout=30)
~~~

### Ignoring tail latency in favor of average throughput

~~~python
# WRONG: dashboard shows only mean latency and aggregate tokens/sec
# RIGHT: track p50/p95/p99 latency AND throughput -- a healthy average
# can hide a scheduling or memory-pressure problem that's only visible in the tail
~~~

### Running vLLM directly exposed to the internet with no gateway

Relying solely on vLLM's baseline --api-key flag as your entire production authentication and rate-limiting story, with no gateway, no per-tenant quotas, and no centralized observability in front of it, works for a prototype but breaks down the moment more than one team or a broader user base depends on the service.

### Benchmarking with unrealistic, uniform-length synthetic prompts

Testing with all-identical, short, fixed-length prompts hides continuous batching's real advantage (and any scheduling weaknesses) that only appear under realistic, highly variable-length concurrent traffic — benchmark against a distribution that resembles your actual production request-length histogram.
`,

  performance: `
### Measure first

~~~bash
# vLLM exposes Prometheus metrics natively -- scrape them before guessing at bottlenecks
curl http://localhost:8000/metrics | grep vllm

# Key metrics to look at first: time_to_first_token, time_per_output_token,
# num_requests_running, num_requests_waiting, gpu_cache_usage_perc
~~~

Never tune configuration blind — measure time-to-first-token (TTFT), inter-token latency, throughput (tokens/sec), and GPU KV-cache utilization under a realistic load pattern before changing anything.

### The two distinct bottlenecks

- **Prefill (compute-bound)**: processing the prompt is dominated by raw FLOPs; a longer prompt directly increases TTFT roughly proportionally to its length (for a fixed model and hardware).
- **Decode (memory-bandwidth-bound)**: generating each subsequent token is dominated by moving weights and KV cache through GPU memory, not raw compute; this is why packing more concurrent sequences into available memory (PagedAttention's whole point) is the primary lever for decode-phase throughput, far more than raw GPU FLOPs.

### The optimization hierarchy

1. **Right-size max-model-len** to your actual workload — the single highest-leverage lever for concurrent capacity.
2. **Enable prefix caching** if requests share meaningful common prefixes.
3. **Choose the right parallelism strategy** (tensor vs. pipeline) for your model size and hardware topology.
4. **Consider quantization** if memory (not compute) is your binding constraint, validated against evals.
5. **Tune gpu-memory-utilization** to use as much memory as safely possible for weights + KV cache without starving other processes.
6. **Consider speculative decoding** for latency-sensitive workloads where a suitable draft model exists.
7. **Batch offline workloads explicitly** (the Python LLM class, not the HTTP server) for non-interactive, throughput-only jobs like large-scale scoring or synthetic data generation, where you don't need per-request streaming.

### Concrete order-of-magnitude expectations

Exact throughput and latency numbers depend heavily on model size, hardware, quantization, and request-length distribution — I don't have confident, current, universally-applicable benchmark figures to cite, and would recommend running vLLM's own benchmarking scripts (bundled with the project) against your specific model and hardware rather than trusting a generic number from elsewhere.
`,

  scalability: `
vLLM scales along the same two axes as any GPU-backed service: fitting a bigger model (or more concurrent load) on more/bigger GPUs, and running more replicas behind a load balancer for aggregate capacity.

~~~mermaid
flowchart LR
    LB["Load balancer / gateway"] --> S1["vLLM replica 1\n(TP=4 GPUs)"]
    LB --> S2["vLLM replica 2\n(TP=4 GPUs)"]
    LB --> S3["vLLM replica N"]
    S1 & S2 & S3 --> Metrics[("Prometheus\nper-replica metrics")]
~~~

### Scaling up (bigger model, more GPUs per replica)

Tensor parallelism (within a fast-interconnect node) and pipeline parallelism (across nodes) let a single logical vLLM deployment serve a model too large for one GPU — see Advanced Concepts for when to prefer each.

### Scaling out (more replicas)

For aggregate request capacity beyond what parallelism-scaled single replicas provide, run multiple vLLM replicas behind a load balancer or gateway — since each vLLM process manages its own KV cache and scheduler independently, this is straightforward horizontal scaling, with the gateway responsible for routing and, ideally, load-aware balancing (favoring replicas with more free KV-cache capacity) rather than pure round-robin.

### Bottleneck table

| Bottleneck | Answer |
|---|---|
| Model too large for one GPU | Tensor parallelism (fast interconnect) or pipeline parallelism (across nodes) |
| GPU memory limits concurrent requests | Reduce max-model-len to actual need, enable prefix caching, consider quantization |
| Aggregate throughput ceiling of one replica | Horizontal scaling — more replicas behind a load-aware gateway |
| Slow GPU autoscaling under bursty load | Right-sized always-on baseline capacity; treat GPU autoscaling as a slower, coarser lever than CPU autoscaling |
| Long-tail latency under high concurrency | Monitor and tune scheduling behavior; consider separate replica pools for latency-sensitive vs. throughput-only workloads |
| Cross-node network overhead with pipeline parallelism | Favor tensor parallelism within fast-interconnect nodes wherever the model fits, minimizing cross-node pipeline stages |
`,

  security: `
### vLLM-specific attack surface

A self-hosted inference server introduces its own trust boundary considerations distinct from calling a hosted API — see **AI Red Teaming** for the broader adversarial-testing practice.

1. **Exposed inference endpoints with weak authentication.** vLLM's baseline --api-key flag provides simple bearer-token authentication, but is not, by itself, a full production authorization system (no per-tenant quotas, no fine-grained scoping) — a gateway layer handling real authentication and authorization should sit in front of any vLLM deployment serving more than one trusted internal caller.
2. **Resource-exhaustion / denial-of-service via unbounded requests.** A request requesting an extremely long generation, or a flood of concurrent requests, can exhaust GPU memory or queue capacity — rate limiting and per-tenant quotas at the gateway layer, plus sensible max-model-len and max-tokens limits, are the primary mitigations.
3. **Prompt injection and unsafe content risk are unchanged by self-hosting.** Serving your own model doesn't remove the need for input/output content moderation or defenses against prompt injection — see **Prompt Injection Defense** — self-hosting shifts *where* the model runs, not the model's underlying behavior or the risks of the content it processes.
4. **Model and checkpoint supply-chain risk.** Loading a model checkpoint from an untrusted or unverified source (a suspicious Hugging Face Hub repository, an unofficial mirror) carries the same supply-chain risk as installing an untrusted software package — verify checkpoint provenance, prefer official or well-verified model repositories, and be aware that a malicious checkpoint could, in principle, carry unsafe custom code (particularly with formats or loading paths that execute arbitrary Python, which is why the **safetensors** format specifically avoids Python's pickle-based code-execution risk).
5. **Network exposure of the inference server itself.** Running vLLM's HTTP server without TLS, without network segmentation, or directly reachable from the public internet without a gateway are all standard network-security missteps that apply here exactly as to any other internal service.

### Concrete defenses

- Terminate TLS and enforce real authentication/authorization at a gateway in front of vLLM, not relying on vLLM's baseline API-key flag alone for anything beyond a trusted internal prototype.
- Set sensible, enforced limits on max-model-len and per-request max_tokens to bound worst-case resource consumption per request.
- Rate-limit and quota per tenant/API key at the gateway, and monitor for abusive request patterns.
- Prefer safetensors-format checkpoints from verified sources, and audit any custom code paths (custom model architectures, trust_remote_code-style flags) before enabling them in production.
- Apply the same input/output moderation and prompt-injection defenses you would for any LLM-backed application, regardless of whether the model is self-hosted or called via a hosted API — see **Prompt Injection Defense**.

See the dedicated **AI Red Teaming** and **Secrets Management** skills for the broader adversarial-testing and credential-handling practices this connects to.
`,

  testing: `
Testing a vLLM deployment spans configuration validation, functional correctness of the served API, and load/performance testing under realistic traffic.

~~~python
# tests/test_vllm_client.py
import pytest
from myinference.client.vllm_client import VLLMClient

@pytest.fixture
def client():
    return VLLMClient(base_url="http://localhost:8000/v1", timeout=10)

def test_chat_completion_returns_text(client, respx_mock):
    respx_mock.post("http://localhost:8000/v1/chat/completions").respond(
        json={"choices": [{"message": {"content": "Paris"}, "finish_reason": "stop"}]}
    )
    result = client.chat("What is the capital of France?")
    assert "Paris" in result

def test_client_times_out_on_slow_server(client, respx_mock):
    import httpx
    respx_mock.post("http://localhost:8000/v1/chat/completions").mock(
        side_effect=httpx.TimeoutException("simulated hang")
    )
    with pytest.raises(TimeoutError):
        client.chat("this should time out")

def test_max_tokens_is_always_bounded(client):
    # Guard against accidentally unbounded generations in production
    request = client.build_request("some prompt", max_tokens=None)
    assert request["max_tokens"] is not None
    assert request["max_tokens"] <= client.HARD_MAX_TOKENS_LIMIT
~~~

### The senior testing doctrine for a vLLM deployment

- **Functional tests against a real (or realistically mocked) vLLM server** for the request/response shapes your application actually depends on — chat completions, streaming, function calling, structured output, as applicable.
- **Configuration validation as a deploy-time check**: assert max-model-len, tensor-parallel-size, and quantization settings match what was intended before a deployment goes live, since a silent misconfiguration here is a capacity or accuracy bug, not just a functional one.
- **Load testing with a realistic request-length distribution**, not synthetic uniform prompts — this is the only way to validate continuous batching's real throughput benefit and to find the actual tail-latency behavior your users will experience.
- **Accuracy regression testing whenever quantization, model version, or max-model-len changes** — treat these as changes to system behavior requiring a fresh pass through your **AI Evals** suite, not purely infrastructure changes.
- **Chaos/failure testing**: simulate a vLLM replica becoming unavailable or overloaded and confirm your gateway/client layer degrades gracefully (retries, fallback replica, clear error) rather than cascading into a broader outage.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check vLLM's own logs first.** Startup logs report the effective configuration (max-model-len, GPU memory allocated for KV cache, parallelism settings) — many "why is this slow/failing" questions are answered by confirming the server actually started with the configuration you intended.
2. **Scrape the Prometheus metrics endpoint.** num_requests_waiting climbing steadily indicates the server is saturated relative to incoming load; gpu_cache_usage_perc near 100% indicates KV-cache memory pressure, which is often the actual root cause of increased queueing or preemption.

~~~bash
curl -s http://localhost:8000/metrics | grep -E "vllm:num_requests|vllm:gpu_cache_usage"
~~~

3. **Reproduce with a minimal request.** Strip a failing or slow request down to its simplest form (shortest prompt, no streaming, single request) against the same server before assuming the bug is in your broader application logic.
4. **Check for an out-of-memory condition.** A vLLM server that crashes or refuses new requests under load is very often a GPU-memory-exhaustion symptom — check gpu-memory-utilization, max-model-len, and whether other processes are sharing the same GPU.
5. **Diff configuration against a known-good deployment** when behavior changes unexpectedly after an upgrade or redeploy — a fast-moving project can change default values between versions, and pinning + diffing your configuration is the fastest way to catch this.
6. **Isolate parallelism-related bugs by testing with tensor-parallel-size 1** (single GPU, if the model fits) to confirm whether a suspected bug is specific to multi-GPU sharding or present even in the simplest single-GPU configuration.
7. **Use nvidia-smi alongside vLLM's own metrics** to distinguish "vLLM is scheduling correctly but the GPU itself is saturated" from "vLLM's scheduler is the bottleneck while GPU capacity sits idle" — these point to very different fixes.
`,

  monitoring: `
### The metrics that matter

~~~python
from prometheus_client import Gauge, Histogram

# vLLM exposes many of these natively at /metrics -- these are the ones
# worth explicitly dashboarding and alerting on, not just collecting.
REQUESTS_RUNNING = Gauge("vllm_num_requests_running", "Requests currently being processed")
REQUESTS_WAITING = Gauge("vllm_num_requests_waiting", "Requests queued, not yet admitted")
GPU_CACHE_USAGE = Gauge("vllm_gpu_cache_usage_perc", "Fraction of KV-cache memory in use")
TIME_TO_FIRST_TOKEN = Histogram("vllm_time_to_first_token_seconds", "TTFT distribution")
TIME_PER_OUTPUT_TOKEN = Histogram("vllm_time_per_output_token_seconds", "Inter-token latency distribution")
~~~

### What to track and why

- **Time-to-first-token (TTFT), p50/p95/p99.** The dominant driver of perceived responsiveness for interactive use cases; a rising TTFT under steady load often points to prefill-phase saturation or an undersized max-model-len budget causing excessive queueing.
- **Inter-token latency, p50/p95/p99.** The dominant driver of how "fast" a streaming response feels once it starts; a rising inter-token latency under load often points to decode-phase memory-bandwidth saturation from too many concurrent sequences.
- **num_requests_running vs. num_requests_waiting.** A persistently nonzero (and growing) waiting queue is the earliest, most direct signal that the server is saturated relative to incoming request volume — this should alert well before users start reporting slowness.
- **GPU KV-cache usage percentage.** Sustained near-100% usage indicates the server is memory-constrained, directly limiting achievable concurrency — this is often the single most actionable metric for deciding whether to add replicas, reduce max-model-len, or enable prefix caching.
- **Throughput (tokens/sec, aggregate and per-replica).** The headline capacity number, but should always be read alongside tail latency — high throughput achieved by starving some requests into very long queue times is not a healthy tradeoff for most interactive workloads.
- **GPU utilization and memory from nvidia-smi/DCGM alongside vLLM's own metrics**, to distinguish scheduler-bound bottlenecks from genuine hardware-capacity bottlenecks.

Alert on symptoms users feel (rising TTFT, rising inter-token latency, growing wait queue) rather than only low-level GPU metrics in isolation, mirroring the RED-metrics philosophy used for any production service — and dashboard per-model, per-replica, since aggregate numbers can hide one struggling replica or model.
`,

  deployment: `
### A representative production Dockerfile and launch configuration

~~~dockerfile
# Dockerfile -- build on vLLM's official base image rather than installing from scratch
FROM vllm/vllm-openai:latest

# Pin to a known-good, tested model and configuration rather than accepting defaults
ENV MODEL_NAME="meta-llama/Llama-3.1-8B-Instruct"
ENV MAX_MODEL_LEN="8192"
ENV GPU_MEMORY_UTILIZATION="0.9"

EXPOSE 8000

# Healthcheck against vLLM's own health endpoint -- wire this into your orchestrator's probes
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["--model", "meta-llama/Llama-3.1-8B-Instruct", \\
     "--max-model-len", "8192", \\
     "--gpu-memory-utilization", "0.9", \\
     "--enable-prefix-caching", \\
     "--api-key", "VLLM_API_KEY_ENV_VALUE"]
# In practice, substitute the actual environment variable's value at container
# startup (e.g. via an entrypoint script) rather than embedding the raw variable
# reference directly in the CMD array.
~~~

Per-line rationale: building on the official image avoids re-solving CUDA/driver compatibility yourself; environment-variable-driven configuration lets the same image be deployed with different settings per environment without rebuilding; the health check integrates with standard container-orchestration liveness/readiness probing; the API key is read from an environment variable (backed by your secrets infrastructure — see **Secrets Management**) rather than hardcoded.

### Kubernetes deployment notes

- Request GPU resources explicitly (e.g. nvidia.com/gpu: 4 for a tensor-parallel-size-4 deployment) and schedule onto a dedicated GPU node pool.
- Use a readiness probe against vLLM's health endpoint so the load balancer only routes traffic once the model is fully loaded (which can take meaningful time for large models) — a naive liveness-only probe can send traffic to a pod still loading weights.
- Set resource requests/limits to match the actual GPU memory footprint (weights + KV cache at your configured gpu-memory-utilization), and avoid overcommitting a GPU node across incompatible workloads.
- Plan pod-restart behavior carefully: GPU pods with large models can take a long time to become ready again after a restart, which affects your rollout strategy (prefer rolling updates with adequate readiness gating over aggressive recreate strategies).

### CI/CD notes

Configuration changes (max-model-len, quantization, parallelism settings) should go through the same review and testing discipline as code changes — treat vllm-config.yaml (or equivalent) as a reviewed artifact, and validate a configuration change against a staging deployment and a fresh **AI Evals** pass before promoting it to production, particularly for any change that could plausibly affect output quality (quantization, model version).
`,

  "production-checklist": `
Before a vLLM deployment takes real production traffic:

- [ ] max-model-len set to actual measured workload needs, not the model's theoretical maximum
- [ ] Quantization choice (if any) validated against a full AI Evals pass on production-representative tasks
- [ ] Gateway layer in front of vLLM handling real authentication, per-tenant rate limiting, and multi-model routing
- [ ] TLS terminated appropriately; inference endpoint not directly exposed to the public internet without a gateway
- [ ] Client-side timeouts configured on every call to the vLLM server, exactly as for any other network dependency
- [ ] Prometheus metrics scraped and dashboarded: TTFT, inter-token latency, request queue depth, GPU cache usage, throughput
- [ ] Alerts configured on tail latency and queue-depth growth, not only on hard failures
- [ ] Health/readiness probes wired into the orchestrator (Kubernetes or equivalent), gating traffic until the model is fully loaded
- [ ] Tensor/pipeline parallelism configuration matched to actual hardware topology (fast interconnect vs. cross-node)
- [ ] Load tested with a realistic request-length distribution, not synthetic uniform prompts
- [ ] Configuration (model version, max-model-len, quantization, parallelism) version-controlled and reviewed like code
- [ ] Model checkpoint provenance verified; safetensors format preferred over pickle-based formats
- [ ] Graceful-degradation behavior verified for a replica becoming unavailable or overloaded (gateway-level retry/fallback)
- [ ] GPU autoscaling policy (if any) reviewed against realistic provisioning latency and cost, with an adequate always-on baseline
`,

  "common-mistakes": `
1. **Setting max-model-len far larger than the workload needs**, silently crippling achievable concurrent-request capacity for no real benefit.
2. **Assuming quantization is accuracy-neutral without validating against actual evals** on the specific model and task.
3. **Relying solely on vLLM's baseline API-key flag as production authentication**, with no gateway, no per-tenant quotas, and no centralized rate limiting.
4. **No client-side timeout against your own self-hosted server**, treating it as somehow immune to the network/overload failure modes of any other service.
5. **Monitoring only average throughput or mean latency**, missing tail-latency degradation that shows up first under real, bursty production load.
6. **Choosing pipeline parallelism when tensor parallelism would fit**, incurring unnecessary pipeline-bubble overhead for a model that would have fit within one fast-interconnect node.
7. **Benchmarking with synthetic, uniform-length prompts** that don't exercise continuous batching's real advantage or reveal genuine tail-latency behavior.
8. **Treating GPU autoscaling like CPU autoscaling** — aggressive scale-to-zero or rapid scale-out policies that ignore GPU provisioning latency and cost realities.
9. **Skipping health/readiness probe configuration**, letting a load balancer route traffic to a replica still loading model weights.
10. **Upgrading vLLM versions in production without pinning and testing first**, given how quickly the project's defaults and behavior can change between releases.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| CUDA out of memory on startup | max-model-len or gpu-memory-utilization set too high for available GPU memory, or model too large for GPU count without parallelism | Reduce max-model-len, lower gpu-memory-utilization, add tensor-parallel-size, or use a smaller/quantized model |
| Requests queueing (num_requests_waiting climbing) under moderate load | KV-cache capacity exhausted, often due to an oversized max-model-len reserving too much per-request headroom | Right-size max-model-len; add replicas; enable prefix caching if applicable |
| Rising p99 latency while average latency looks fine | Scheduling/preemption effects under memory pressure, or one slow replica behind a naive round-robin load balancer | Monitor GPU cache usage percentage; use a load-aware gateway rather than pure round-robin; investigate preemption metrics |
| Output quality regression after a config change | Quantization enabled/changed, or max-model-len truncating context the application actually relies on | Re-run AI Evals against the new configuration; verify max-model-len covers real prompt+context lengths |
| Server slow to become ready after restart | Large model weights taking meaningful time to load, readiness probe misconfigured as pure liveness check | Configure a proper readiness probe gated on the model fully loading; plan rollout strategy around this load time |
| Tensor-parallel server hangs or crashes on startup | GPU count mismatch with tensor-parallel-size, or GPUs not on a fast enough interconnect for the configured topology | Verify tensor-parallel-size matches actual available GPUs; check interconnect topology (NVLink vs. PCIe) |
| Client receives malformed/unexpected response shape | Client code assumes a newer or older API shape than the installed vLLM version actually implements | Pin and verify the vLLM version against your client's expectations; check the changelog for API shape changes |
| High memory use with few concurrent requests | Prefix caching or KV-cache blocks not being released properly, or max-model-len far exceeding actual prompt lengths | Check GPU cache usage metrics; verify max-model-len sizing; check for a known issue against your specific version |

The general habit: check vLLM's Prometheus metrics and startup logs first for nearly every one of these symptoms — the effective configuration and current resource state are almost always visible there before you need to guess.
`,

  faqs: `
**Q: Do I need a GPU to run vLLM?**
The primary, most mature backend targets NVIDIA GPUs with CUDA. Other hardware backends exist in the broader ecosystem and vLLM's own support has been expanding, but I'd verify current maturity for any non-NVIDIA hardware directly against the official documentation before committing to it for production, since this is an area of active, fast-moving development.

**Q: How is vLLM different from just using Hugging Face transformers directly?**
transformers.generate() is a general-purpose library function, not built for serving many concurrent requests efficiently — it lacks PagedAttention's memory efficiency and continuous batching, so it's fine for single-request experimentation but poorly suited to production serving at any real concurrency.

**Q: Should I use vLLM, Ollama, or SGLang?**
See the Comparisons section for the full breakdown — briefly, vLLM is the general-purpose, broadly-adopted choice for production server-style deployment at scale; **Ollama** optimizes for extremely easy local/single-user setup; **SGLang** focuses on structured-generation-heavy workloads and RadixAttention-based prefix sharing, with meaningfully overlapping goals to vLLM's own prefix caching.

**Q: Does vLLM support every open-weight model?**
It supports a broad and continually growing set of popular model architectures, but not literally every architecture that exists — check the current supported-models list in vLLM's documentation before committing to a specific, especially newly-released, model.

**Q: How much does quantization actually hurt accuracy?**
It depends heavily on the model, the quantization method (AWQ, GPTQ, and others each behave somewhat differently), and the specific task — there is no universal "X% accuracy loss" figure I'm confident quoting; validate against your own **AI Evals** on your actual tasks.

**Q: Is vLLM production-ready, or still primarily a research project?**
It has moved well beyond a research artifact and is widely used in production across the industry as of my knowledge cutoff — but as with any fast-moving open-source project, pin versions deliberately, test upgrades before rolling to production, and don't assume every newly-added feature is equally battle-tested.

**Q: Can I serve multiple different models from one vLLM deployment?**
A single vLLM server process is typically configured for one model; serving multiple models usually means running multiple vLLM processes (one per model) behind a shared gateway that routes requests to the correct backend based on the requested model.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is PagedAttention and what problem does it solve?* It manages the KV cache in small, non-contiguous, on-demand-allocated pages (like OS virtual memory) instead of large contiguous worst-case blocks, nearly eliminating the memory fragmentation that limited achievable concurrent request batch sizes in naive LLM serving.
2. *What is continuous batching?* Admitting new requests into a running batch at every decode step, as soon as capacity frees up, rather than waiting for a fixed batch to fully complete before starting the next one — this keeps the GPU consistently busy under mixed-length, real-world traffic.
3. *What API does vLLM's server expose?* An OpenAI-compatible HTTP API (Chat Completions/Completions shape), so existing OpenAI client code can point at a self-hosted vLLM server with minimal changes.
4. *What does max-model-len control, and why does its size matter?* The maximum context length the server accepts; a larger value reserves more KV-cache memory headroom per request, directly reducing how many concurrent requests can fit in available GPU memory.
5. *What is quantization, in this context?* Running model weights (and sometimes activations) at lower numerical precision to reduce memory footprint and often increase throughput, at some potential accuracy cost that should be validated per model/task.

**Senior:**

6. *Explain why decode is memory-bandwidth-bound while prefill is compute-bound, and why that distinction matters for tuning.* Prefill processes the whole prompt in one pass, dominated by matrix-multiplication FLOPs; decode generates one token at a time, where moving KV cache and weights through memory dominates over compute — this is why maximizing concurrent sequences packed into memory (PagedAttention's purpose) is the primary lever for decode throughput, distinct from what would help prefill latency.
7. *When would you choose tensor parallelism over pipeline parallelism, and why?* Tensor parallelism whenever the model fits within a node with a fast interconnect (NVLink), since it parallelizes each layer with low added latency; pipeline parallelism (often combined with TP) for models spanning multiple nodes or GPUs without a fast interconnect, accepting pipeline-bubble overhead in exchange for enabling larger-than-one-node models.
8. *How does prefix caching interact with PagedAttention's block structure?* Identical prefix content across sequences can share the same physical KV-cache blocks (reference-counted) instead of duplicating them, directly enabled by PagedAttention's block-based, indirected memory layout — this reduces both compute (avoiding recomputation) and memory use for shared-prefix workloads.
9. *What's the difference between vLLM's prefix caching and semantic caching?* Prefix caching operates at the KV-cache layer, reusing computed attention state for an identical shared prompt prefix within the serving engine; semantic caching (see the **Semantic Caching** skill) operates at the response layer, reusing an entire past LLM response for a semantically similar (not necessarily identical-prefix) query — they solve related but distinct problems and can be used together.
10. *How would you diagnose rising p99 latency under load in a vLLM deployment?* Check GPU KV-cache usage (memory pressure causing preemption), num_requests_waiting (queueing/admission-control saturation), whether load is balanced evenly across replicas (a load-aware gateway versus naive round robin), and whether max-model-len is unnecessarily large for the actual workload.
11. *What are the risks of self-hosting a model versus calling a hosted API, from a security standpoint?* Self-hosting shifts responsibility for authentication/authorization, network exposure, resource-exhaustion protection, and checkpoint supply-chain verification onto your own infrastructure — it does not remove the need for prompt-injection defense or content moderation, which apply regardless of where the model runs.
12. *How would you design a multi-model serving platform on top of vLLM?* Run one vLLM process per model (each independently configured and scaled), route requests through a shared gateway that handles authentication, per-tenant quotas, and model-based routing, and monitor per-model/per-replica metrics separately so one model's load doesn't obscure another's health in an aggregate dashboard.
`,

  "coding-questions": `
### 1. A load-aware routing layer across multiple vLLM replicas (tests systems/production reasoning)

~~~python
import httpx
import asyncio

class LoadAwareRouter:
    """Routes requests to the vLLM replica with the most free KV-cache capacity,
    rather than naive round-robin, using each replica's own Prometheus metrics."""

    def __init__(self, replica_urls: list[str]):
        self.replica_urls = replica_urls

    async def _cache_usage(self, client: httpx.AsyncClient, url: str) -> float:
        try:
            resp = await client.get(f"{url}/metrics", timeout=2)
            for line in resp.text.splitlines():
                if line.startswith("vllm:gpu_cache_usage_perc"):
                    return float(line.split()[-1])
        except (httpx.TimeoutException, httpx.ConnectError):
            return 1.0   # treat an unreachable replica as fully saturated -- never route to it
        return 1.0

    async def pick_replica(self) -> str:
        async with httpx.AsyncClient() as client:
            usages = await asyncio.gather(*(self._cache_usage(client, u) for u in self.replica_urls))
        # Route to whichever replica currently has the most free KV-cache capacity
        best_index = min(range(len(usages)), key=lambda i: usages[i])
        return self.replica_urls[best_index]
~~~

Complexity: O(n) metric fetches per routing decision, run concurrently; acceptable for a small number of replicas, though a production system would cache these metrics with a short TTL rather than fetching on every single request. Follow-up: add a circuit breaker per replica so a consistently unreachable one is skipped without a full metrics-fetch round trip each time.

### 2. Estimating max safe concurrent requests given a memory budget (tests capacity-planning reasoning)

~~~python
def estimate_max_concurrent_requests(
    gpu_memory_bytes: int,
    weights_memory_bytes: int,
    kv_cache_bytes_per_token: int,
    max_model_len: int,
    gpu_memory_utilization: float = 0.9,
) -> int:
    """A simplified capacity-planning estimate: how many concurrent sequences,
    each up to max_model_len tokens, can fit in the memory left over after weights."""
    usable_memory = gpu_memory_bytes * gpu_memory_utilization
    memory_for_kv_cache = usable_memory - weights_memory_bytes
    if memory_for_kv_cache <= 0:
        raise ValueError("weights alone exceed the configured memory budget")
    bytes_per_sequence = kv_cache_bytes_per_token * max_model_len
    return int(memory_for_kv_cache // bytes_per_sequence)

# Example: an 80GB GPU, a 16GB model, and a rough per-token KV-cache cost estimate
max_requests = estimate_max_concurrent_requests(
    gpu_memory_bytes=80 * 1024**3,
    weights_memory_bytes=16 * 1024**3,
    kv_cache_bytes_per_token=128 * 1024,   # illustrative, varies by model architecture
    max_model_len=8192,
)
print(f"Estimated max concurrent full-length requests: {max_requests}")
~~~

Complexity: O(1). Follow-up: extend to account for prefix caching (shared blocks reduce effective per-sequence memory for requests sharing a prefix), and discuss why real achievable concurrency is usually higher than this worst-case estimate since most requests don't use the full max_model_len.

### 3. Graceful client-side degradation on a hung or overloaded vLLM server (production-flavored)

~~~python
import time
from openai import OpenAI, APITimeoutError

class ResilientVLLMClient:
    """Wraps the OpenAI client with a timeout, a bounded retry with backoff,
    and a documented fallback -- never let a hung inference server hang the caller."""

    def __init__(self, base_url: str, timeout: float = 15, max_retries: int = 2):
        self.client = OpenAI(base_url=base_url, api_key="not-needed", timeout=timeout)
        self.max_retries = max_retries

    def chat(self, prompt: str, fallback: str = "I'm having trouble responding right now.") -> str:
        for attempt in range(self.max_retries + 1):
            try:
                response = self.client.chat.completions.create(
                    model="served-model",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500,   # ALWAYS bound generation length explicitly
                )
                return response.choices[0].message.content
            except APITimeoutError:
                if attempt < self.max_retries:
                    time.sleep(2 ** attempt)   # exponential backoff between retries
                    continue
                return fallback   # exhausted retries -- degrade gracefully, don't crash the caller
~~~

Complexity: O(max_retries) in the worst case. Follow-up: add a per-replica circuit breaker (see the delegator pattern from the A2A Protocol skill's Coding Questions) so a persistently hung server stops being retried at all for a cooldown window.
`,

  "hands-on-labs": `
### Lab 1 — Stand up a first vLLM server (beginner, ~1h)
Install vLLM in a CUDA-enabled environment (or a cloud GPU instance), serve a small open-weight model, and call it both via curl and via the OpenAI Python client pointed at your local server. Compare a streaming versus non-streaming request's perceived latency. Skills: installation, the OpenAI-compatible API shape, streaming basics.

### Lab 2 — Benchmark continuous batching (intermediate, ~2h)
Write a load-testing script that fires a realistic, mixed-length distribution of concurrent requests at your vLLM server, and separately at a naive single-request-at-a-time baseline (or a smaller batch size). Measure and compare aggregate throughput and tail latency. Deliverable: a short report with numbers and an explanation of why continuous batching wins under mixed-length concurrent load specifically. Skills: benchmarking discipline, understanding the core throughput mechanism viscerally.

### Lab 3 — Multi-GPU tensor-parallel serving (advanced, ~3h)
If you have access to multiple GPUs (or a multi-GPU cloud instance), serve a larger model with --tensor-parallel-size set appropriately, and confirm correct operation and measure throughput/latency versus a single-GPU deployment of a comparable smaller model. Skills: parallelism configuration, multi-GPU deployment mechanics.

### Lab 4 — Production-shaped deployment with observability (production, ~3h)
Containerize a vLLM deployment with a health-checked Dockerfile, put a thin FastAPI gateway in front of it handling authentication and rate limiting, scrape vLLM's Prometheus metrics into a dashboard (TTFT, inter-token latency, queue depth, GPU cache usage), and load test it while watching the dashboard respond to load in real time. Skills: the entire production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects that demonstrate this skill to employers:

1. **Self-hosted LLM API gateway** — a production-shaped gateway in front of one or more vLLM replicas, handling authentication, per-tenant rate limiting, model routing (multiple served models), load-aware request routing, and full observability (Prometheus dashboards for TTFT, inter-token latency, queue depth). Demonstrates: the full production serving stack, resilience engineering, and observability discipline applied specifically to LLM inference.

2. **Quantization and accuracy tradeoff study** — serve the same model at full precision and at two different quantization levels (e.g. AWQ and GPTQ), run an identical **AI Evals** suite against all three, and measure throughput/memory gains against measured accuracy impact, producing a data-driven recommendation. Demonstrates: rigorous, evals-grounded infrastructure decision-making rather than assumed tradeoffs.

3. **Multi-GPU capacity planning tool** — a small tool that takes a model's parameter count and architecture details, a target max-model-len and concurrency requirement, and hardware specs, and recommends a tensor-parallel-size, quantization strategy, and expected achievable concurrent-request capacity, validated against real benchmark runs on actual hardware. Demonstrates: genuine understanding of the memory-bandwidth and capacity-planning tradeoffs underlying production LLM serving, not just "run the command."

Each project: full type hints, a pytest suite covering client resilience (timeouts, retries, graceful degradation), CI, and a README with an architecture diagram and honestly reported benchmark numbers from your own hardware — the engineering rigor and honest measurement are what distinguish a portfolio piece here from a toy demo.
`,

  "case-studies": `
### The original PagedAttention paper and its throughput claims
vLLM's authors (Kwon et al., SOSP 2023) demonstrated that naive contiguous KV-cache allocation wasted the majority of reserved memory to fragmentation, and that PagedAttention's paged allocation scheme allowed dramatically larger effective batch sizes on identical hardware. Lesson: applying a decades-old, well-understood systems idea (paged virtual memory) to a genuinely new domain (LLM KV-cache management) produced one of the most impactful practical optimizations in the self-hosted LLM-serving space — the insight was recognizing the structural similarity between two seemingly unrelated problems, not inventing an entirely novel technique from scratch.

### vLLM as the de facto benchmark baseline
Across the broader LLM-serving research and engineering ecosystem, vLLM is frequently the engine new optimizations (in academic papers and competing open-source projects alike, including **SGLang**) are benchmarked against, precisely because its widespread adoption makes it a credible, well-understood reference point. Lesson: becoming the trusted baseline that an entire ecosystem measures itself against is itself a signal of a project's real-world impact, beyond any single benchmark number.

### The rapid maturation from research artifact to production standard
vLLM moved from an academic paper and initial open-source release (2023) to broad production adoption across the industry within roughly a year or two — a notably fast maturation curve for infrastructure software. Lesson: in a fast-moving field with urgent, widely-shared practical needs (everyone self-hosting LLMs faced the same memory-fragmentation problem), a genuinely good systems solution can achieve production-grade trust and adoption far faster than infrastructure software historically has.

I don't have verified, specific, attributable production case studies for named companies beyond this general trajectory, and would rather flag that honestly than invent a specific metric — vLLM's own project blog, GitHub discussions, and community content are the best current sources for real, citable production stories.
`,

  comparisons: `
| Dimension | vLLM | Ollama | SGLang | TensorRT-LLM | Plain Hugging Face transformers |
|---|---|---|---|---|---|
| Primary design goal | High-throughput, production server-style serving | Extremely easy local/single-user setup | Structured-generation-heavy serving, RadixAttention prefix sharing | Maximum raw performance on NVIDIA hardware, deep hardware-specific optimization | General-purpose model library, not built for concurrent serving |
| Setup complexity | Moderate (CUDA environment, config tuning) | Very low (single command, auto-downloads models) | Moderate, similar to vLLM | High (compilation/engine-building step per model/hardware combo) | Low, but not production-shaped |
| Concurrent request throughput | Very high (PagedAttention + continuous batching) | Lower — optimized for single-user/local use, not high concurrency | Very high, competitive with or exceeding vLLM on structured-output-heavy workloads | Very high, often the fastest on supported hardware once compiled | Low — not designed for concurrent serving |
| API shape | OpenAI-compatible HTTP server | Its own simple HTTP API plus a CLI-first experience | OpenAI-compatible HTTP server | Typically wrapped by another serving layer (e.g. Triton), less of a direct end-user API itself | Python library calls, no built-in server |
| Structured/constrained output | Supported | Limited | A core design focus (RadixAttention specifically optimizes shared-prefix structured generation patterns) | Supported via additional tooling | Manual, via external libraries |
| Best at | General-purpose production self-hosted serving at scale | Local development, personal use, quick experimentation | Workloads with heavy structured generation and/or many shared-prefix requests | Squeezing maximum performance out of a fixed, well-known deployment target | Prototyping, research, non-serving use cases |

**How seniors choose**: reach for **Ollama** for local development and quick experimentation where ease of setup matters more than throughput; reach for **vLLM** as the default, broadly-adopted choice for production server-style serving at real concurrency; reach for **SGLang** when your workload is heavily structured-generation-oriented or has significant shared-prefix reuse patterns RadixAttention is specifically built to exploit, and benchmark it against vLLM for your specific workload rather than assuming a universal winner; reach for TensorRT-LLM when squeezing maximum raw performance out of a fixed, well-understood NVIDIA deployment target justifies its higher setup complexity. Many teams use more than one of these across different stages (Ollama for local dev, vLLM or SGLang for production) rather than picking one tool for every context.
`,

  "related-technologies": `
- **Hugging Face** — the model hub and library ecosystem vLLM loads most checkpoints from; understanding Hugging Face model formats and tokenizers is a direct prerequisite for working with vLLM day to day.
- **Ollama** — the local-first sibling in this platform's Model Serving & Inference category; optimized for ease of setup over production throughput, and a natural comparison point (see Comparisons).
- **SGLang** — the structured-generation-focused sibling; shares many underlying goals with vLLM (high-throughput serving, prefix reuse) with a different core optimization focus (RadixAttention).
- **OpenAI Responses API / OpenAI Realtime API** — the hosted-API side of the model-serving spectrum this platform's "AI Protocols & Standards" category covers; vLLM's OpenAI-compatible API shape is a direct nod to this ecosystem's conventions, letting client code largely transfer between hosted and self-hosted deployments.
- **Structured Outputs** — the broader discipline of reliable, schema-conformant LLM output; vLLM's guided-decoding support is one concrete serving-layer implementation of this discipline.
- **Docker** and **Kubernetes** — the deployment substrate most production vLLM deployments run on.
- **Cost Optimization** and **Latency** — the broader efficiency disciplines vLLM's core innovations (memory efficiency, continuous batching, quantization, prefix caching) are all in direct service of.
- **AI Evals** — the discipline for validating that a quantization choice, model swap, or configuration change hasn't silently degraded output quality.
- **AI Red Teaming** and **Prompt Injection Defense** — the adversarial-testing and defense practices that remain necessary regardless of whether a model is self-hosted via vLLM or called through a hosted API.

On this platform, a natural path: **Hugging Face** → this page → **Ollama** and **SGLang** for contrast, then **Cost Optimization** and **Latency** to place self-hosted serving in the broader efficiency picture.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025, with less certainty about the most recent months leading up to today's date — vLLM is an actively developed, fast-moving open-source project, and I'd recommend checking its official GitHub repository and release notes directly before treating any specific detail below as current.

- **Continued model-architecture support expansion**: new popular open-weight model families are typically supported within a relatively short window after release, though exact timing and completeness varies — check the current supported-models list for any specific recent model.
- **Ongoing quantization and hardware-backend work**: support for additional quantization formats and non-NVIDIA hardware backends has continued to expand, though maturity varies by backend — verify current status for any hardware target beyond mainstream NVIDIA GPUs before committing to it for production.
- **Continued performance work on prefix caching, speculative decoding, and scheduling** — these are active areas of ongoing optimization across the self-hosted-serving ecosystem broadly, not just within vLLM specifically, with meaningful cross-pollination of ideas between vLLM, **SGLang**, and other engines.
- **Broadening structured-output and function-calling support** to track evolving conventions in the wider LLM-API ecosystem (see **Structured Outputs**, **OpenAI Responses API**).

I do not have confident, verified knowledge of the very latest specific release contents, version numbers, or benchmark figures as of today's date — treat this section as directional and verify anything load-bearing to a real deployment decision against vLLM's current, primary documentation and release notes.
`,

  "future-roadmap": `
Where this space appears to be heading, and what's worth investing career time in:

1. **Continued convergence on shared serving-engine optimizations.** Ideas like continuous batching, paged KV-cache management, and prefix caching are increasingly common across the self-hosted-serving ecosystem (vLLM, **SGLang**, and others), suggesting the durable career skill is understanding these underlying systems ideas deeply, not memorizing one specific engine's CLI flags.
2. **Disaggregated prefill/decode serving maturing further.** As this pattern (separating compute-bound prefill from memory-bandwidth-bound decode onto different GPU pools) matures across the ecosystem, expect it to become a more standard production deployment option rather than an experimental pattern — understanding why the two phases have different bottlenecks (covered in this page's Internal Working and Performance sections) is the transferable insight underneath whichever specific implementation wins.
3. **Broadening hardware-backend support beyond NVIDIA.** As the self-hosted-LLM-serving market grows, expect continued investment in supporting a wider range of accelerators — a bet on understanding the underlying memory-bandwidth-bound decode / compute-bound prefill distinction transfers across hardware backends even as specific tooling evolves.
4. **Tighter integration with structured-output and agentic-system tooling.** As agent frameworks and protocols like **Agent-to-Agent (A2A) Protocol** and **Model Context Protocol** mature, expect serving engines to deepen native support for the structured, constrained generation these systems increasingly depend on.
5. **Growing emphasis on cost- and efficiency-focused benchmarking**, as self-hosting increasingly competes directly with hosted APIs on a pure cost-per-token basis for high-volume workloads — see **Cost Optimization** for the broader context this competition sits within.

For your career: the durable, tool-agnostic skills here are understanding the memory-bandwidth-bound nature of autoregressive decoding, the throughput implications of batching strategy, and capacity-planning reasoning about GPU memory versus concurrent request capacity — those transfer regardless of which specific engine (vLLM, **SGLang**, or a future successor) is winning at any given moment.
`,

  "cheat-sheet": `
~~~bash
# --- Install and serve ---
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --max-model-len 8192 \\
  --gpu-memory-utilization 0.9 \\
  --enable-prefix-caching

# --- Call it (OpenAI-compatible API) ---
# python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-needed")
resp = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[{"role": "user", "content": "hello"}],
    timeout=30,
)

# --- Offline batch inference (no server) ---
from vllm import LLM, SamplingParams
llm = LLM(model="meta-llama/Llama-3.1-8B-Instruct")
outputs = llm.generate(["prompt 1", "prompt 2"], SamplingParams(max_tokens=200))

# --- The core idea ---
# PagedAttention: KV cache in small fixed-size pages, allocated on demand
#                 (like OS virtual memory) -- eliminates fragmentation waste
# Continuous batching: admit new requests every decode step, not at fixed
#                       batch boundaries -- keeps GPU consistently busy

# --- Multi-GPU ---
vllm serve big-model --tensor-parallel-size 4        # within one fast-interconnect node
vllm serve huge-model --tensor-parallel-size 8 --pipeline-parallel-size 2  # across nodes

# --- Quantization ---
vllm serve model-AWQ --quantization awq
vllm serve model-GPTQ --quantization gptq
# ALWAYS validate accuracy impact against your own AI Evals

# --- Key config knobs ---
--max-model-len N            # size to ACTUAL workload need, not the model's max
--gpu-memory-utilization F   # fraction of GPU memory for weights + KV cache (~0.85-0.95)
--tensor-parallel-size N     # shard each layer across N GPUs (fast interconnect)
--pipeline-parallel-size N   # split layers across N GPU groups (cross-node)
--enable-prefix-caching      # reuse KV cache for identical shared prompt prefixes

# --- Two distinct bottlenecks ---
# Prefill: compute-bound   -> drives Time-To-First-Token (TTFT)
# Decode:  memory-bandwidth-bound -> drives inter-token latency,
#          and is why packing MORE concurrent sequences into memory = more throughput

# --- Monitoring (Prometheus at /metrics) ---
# vllm:num_requests_running / num_requests_waiting  -- queueing/saturation
# vllm:gpu_cache_usage_perc                          -- KV-cache memory pressure
# vllm:time_to_first_token_seconds
# vllm:time_per_output_token_seconds

# --- Production musts ---
# - gateway in front for real auth + rate limiting (API key flag alone isn't enough)
# - client-side timeouts on every call, even to your own server
# - readiness probe gated on full model load, not just process start
# - benchmark with REALISTIC mixed-length request distributions
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is PagedAttention? | KV-cache management using small, fixed-size, non-contiguous pages allocated on demand, modeled on OS virtual memory, eliminating fragmentation waste |
| What is continuous batching? | Admitting new requests into the running batch at every decode step, not at fixed batch boundaries — keeps the GPU consistently busy under mixed-length traffic |
| Why is decode memory-bandwidth-bound? | Generating one token at a time is dominated by moving weights and KV cache through memory, not raw compute — unlike prefill, which is compute-bound |
| What does max-model-len control? | The maximum context length accepted; directly determines KV-cache memory reserved per request and therefore achievable concurrency |
| What API does vLLM's server expose? | An OpenAI-compatible HTTP API (Chat Completions/Completions shape) |
| Tensor parallelism vs pipeline parallelism | TP: shard each layer across GPUs (needs fast interconnect, low latency). PP: split different layers across GPU groups (works cross-node, adds bubble overhead) |
| What is prefix caching? | Reusing already-computed KV-cache blocks for an identical shared prompt prefix across requests, avoiding recomputation |
| How is prefix caching different from semantic caching? | Prefix caching reuses KV-cache state for an IDENTICAL prefix inside the serving engine; semantic caching reuses a full past RESPONSE for a semantically SIMILAR query, at the application layer |
| What does quantization trade off? | Lower numerical precision for reduced memory footprint and often higher throughput, at some accuracy cost that must be validated per model/task |
| Who created vLLM and from what research? | UC Berkeley researchers (Sky Computing Lab), from the 2023 PagedAttention paper (SOSP 2023) |
| What's the single highest-leverage config lever for concurrency? | Setting max-model-len to your actual workload's needs, not the model's theoretical maximum |
| What metric should you never monitor in isolation? | Average/mean latency or throughput alone — always pair with p95/p99 tail latency and queue depth |
| Why shouldn't vLLM's --api-key flag be your only production auth? | It's baseline bearer-token auth with no per-tenant quotas or fine-grained scoping — a real gateway should sit in front for production traffic |
`,

  mcqs: `
**1. What specific problem does PagedAttention primarily solve?**

A) Model accuracy loss from quantization  B) KV-cache memory fragmentation from contiguous, worst-case allocation  C) Slow model loading times  D) Network latency between client and server

**Answer: B** — naive serving reserves large contiguous KV-cache blocks per request, wasting most of that memory; PagedAttention's paged, on-demand allocation nearly eliminates this waste.

**2. Why does continuous batching outperform static batching under real traffic?**

A) It uses a different model architecture  B) It admits new requests as capacity frees up at every decode step, instead of waiting for a fixed batch to fully finish  C) It reduces the number of tokens generated  D) It only works with quantized models

**Answer: B** — static batching wastes GPU cycles on finished-but-still-batched short requests waiting for the longest one; continuous batching keeps the GPU consistently fed.

**3. Which phase of generation is memory-bandwidth-bound rather than compute-bound?**

A) Prefill  B) Tokenization  C) Decode  D) Model loading

**Answer: C** — decode generates one token at a time, dominated by moving KV cache and weights through memory; prefill (processing the whole prompt at once) is compute-bound.

**4. When should you prefer tensor parallelism over pipeline parallelism?**

A) Always, regardless of hardware  B) When the model fits within one node with a fast GPU interconnect like NVLink  C) Only for quantized models  D) Never — pipeline parallelism is always faster

**Answer: B** — tensor parallelism needs frequent low-latency cross-GPU communication per layer, which a fast interconnect supports well; pipeline parallelism suits cross-node deployments without that interconnect.

**5. What should you validate before trusting a quantized model in production?**

A) Nothing — quantization is always accuracy-neutral  B) Only the throughput improvement  C) Accuracy impact against your own evals on your actual tasks  D) The Docker image size

**Answer: C** — accuracy impact from quantization varies by model, method, and task, and must be validated with real evals, not assumed.

**6. What's the main risk of relying solely on vLLM's --api-key flag for production authentication?**

A) It doesn't work at all  B) It's baseline bearer-token auth without per-tenant quotas or fine-grained authorization, insufficient for most production needs beyond a trusted prototype  C) It requires a paid license  D) It only supports one user total

**Answer: B** — a real gateway handling authentication, per-tenant rate limiting, and routing should sit in front of vLLM for anything beyond a trusted internal prototype.
`,

  "revision-notes": `
**The core idea in 3 lines:** vLLM is a high-throughput, self-hosted LLM serving engine built around PagedAttention, which manages the KV cache in small, non-contiguous, on-demand-allocated pages (like OS virtual memory) instead of large contiguous worst-case blocks — nearly eliminating the memory fragmentation that limited achievable concurrent request capacity in naive serving. Combined with continuous batching (admitting new requests at every decode step rather than at fixed batch boundaries), this is what makes vLLM dramatically more throughput-efficient than naive approaches on identical hardware.

**The mechanism in 5 lines:** A request is tokenized, admitted by the scheduler if KV-cache blocks are available, and processed through a compute-bound prefill phase (the whole prompt in one pass) followed by a memory-bandwidth-bound decode loop (one token at a time, across all active sequences together). PagedAttention's block-based KV-cache layout enables prefix caching (sharing identical-prefix blocks across requests) and efficient preemption under memory pressure. The server exposes an OpenAI-compatible HTTP API, so existing client code largely transfers from a hosted-API integration.

**Configuration and scaling in 4 lines:** The single highest-leverage config lever is sizing max-model-len to actual workload needs, not the model's theoretical maximum, since it directly determines KV-cache memory reserved per request. Tensor parallelism shards layers across GPUs with a fast interconnect (low added latency); pipeline parallelism splits layers across GPU groups for cross-node deployments (accepting bubble overhead). Quantization trades memory/throughput for potential accuracy loss that must be validated against real evals, not assumed.

**Production discipline in 4 lines:** Put a real gateway in front of vLLM for authentication, per-tenant rate limiting, and multi-model routing — its own --api-key flag is a baseline, not a full production auth story. Monitor time-to-first-token, inter-token latency, queue depth, and GPU KV-cache usage — not just average throughput — since scheduling and memory-pressure effects show up first in the tail. Self-hosting doesn't remove the need for prompt-injection defense, content moderation, or checkpoint provenance verification; it shifts *where* the model runs, not the underlying risks of what it processes.

**Where it fits in the landscape in 3 lines:** vLLM is the general-purpose, broadly-adopted default for production server-style serving at scale; **Ollama** optimizes for effortless local/single-user setup instead; **SGLang** targets structured-generation-heavy and heavy-prefix-sharing workloads with its RadixAttention approach — benchmark your specific workload rather than assuming a universal winner among the three.
`,

  "learning-roadmap": `
A realistic path to production competency with vLLM (adjust pace to your background):

**Week 1 — Foundations.** Make sure you have a working mental model of autoregressive decoding and attention first. Read Beginner and Intermediate Concepts here; complete Lab 1 (a first vLLM server, called via curl and the OpenAI client). Milestone: you can explain PagedAttention and continuous batching to someone else without notes.

**Week 2 — Benchmarking and configuration.** Work through Lab 2 (benchmark continuous batching against a naive baseline with realistic mixed-length load). Experiment with max-model-len and gpu-memory-utilization and observe the concurrency tradeoffs directly. Milestone: a short written report with real numbers from your own hardware.

**Week 3 — Multi-GPU and quantization.** If hardware allows, complete Lab 3 (tensor-parallel serving); otherwise study the parallelism decision table deeply and be able to reason through it for a hypothetical large model. Try quantization on a model you can evaluate, and run a small accuracy check before/after. Milestone: you can justify a parallelism and quantization choice for a specific model/hardware scenario.

**Week 4 — Production hardening.** Complete Lab 4: containerize, put a gateway in front, wire up Prometheus dashboards for TTFT/inter-token-latency/queue-depth/GPU-cache-usage, and load test while watching the dashboard respond. Milestone: a dashboard you'd trust for an on-call rotation.

**Week 5 — Portfolio project.** Build one of the Real Projects end to end — the self-hosted LLM API gateway is the most broadly employer-relevant choice — with a README documenting your architecture and honestly-measured benchmark numbers.

Then continue to **Ollama** and **SGLang** on this platform to build the comparative judgment for choosing the right serving engine per workload, or to **Cost Optimization** and **Latency** to place self-hosted serving in the broader efficiency picture.
`,

  "official-docs": `
- [vLLM official documentation](https://docs.vllm.ai/) — the primary reference for installation, configuration flags, supported models, and API compatibility; check this first for any current, version-specific detail.
- [vLLM GitHub repository](https://github.com/vllm-project/vllm) — source code, issue tracker, release notes/changelog, and the most reliable place to verify current feature status and supported hardware.
- [The original PagedAttention paper](https://arxiv.org/abs/2309.06180) (Kwon et al., SOSP 2023) — the foundational systems paper behind the entire project; worth reading directly for the core insight, not just a summary.
- [OpenAI API reference](https://platform.openai.com/docs/api-reference) — vLLM's server API closely mirrors this shape; useful as a cross-reference for expected request/response formats.

I'm not fully confident every one of these URLs reflects the current, canonical location given how documentation sites reorganize over time — verify each link resolves and search vLLM's own site if it has moved.
`,

  books: `
- I'm not aware of a mature, dedicated book specifically about vLLM as of my knowledge cutoff — it's primarily documented through its own official docs, the original paper, and community content rather than book-length treatments, and I'd rather say so than invent a title.
- **Designing Data-Intensive Applications** — Martin Kleppmann. Not vLLM-specific, but the systems-thinking foundations (memory management, scheduling, throughput-vs-latency tradeoffs) that underpin nearly every argument in this page's Internal Working, Performance, and Scalability sections.
- **Efficient Memory Management for Large Language Model Serving with PagedAttention** (Kwon et al., SOSP 2023) — technically a paper, not a book, but the single most important primary-source document for genuinely understanding vLLM's core contribution; read it directly rather than only a secondary summary.
- **Operating Systems: Three Easy Pieces** (Arpaci-Dusseau & Arpaci-Dusseau, free online) — not about vLLM at all, but the classic, highly readable treatment of virtual memory and paging that PagedAttention directly draws its central analogy from; reading the relevant chapters genuinely deepens intuition for why vLLM's approach works.

The strongest current material specifically about vLLM lives in its own documentation, the original paper, and its GitHub discussions/blog content rather than in books — treat this section as pointing you to durable adjacent foundations rather than vLLM-specific texts that don't yet exist in mature book form.
`,

  blogs: `
- **The vLLM project blog** (via its GitHub repository and official site) — release announcements, performance benchmarks, and design-decision writeups directly from the maintainers.
- **UC Berkeley Sky Computing Lab** publications and blog content — the originating research group's broader work on efficient LLM serving systems.
- **Major cloud provider engineering blogs** (search for vLLM-specific deployment guides from the large cloud/GPU platform providers) — practical deployment and benchmarking content from teams running vLLM at scale.
- **Hugging Face blog** — frequently covers vLLM alongside other serving engines in the context of deploying open-weight models from the Hub.

High-signal filter: prefer posts that show actual benchmark methodology (hardware specs, request-length distributions, measured throughput/latency numbers) over posts that only assert performance claims without showing how they measured them.
`,

  "research-papers": `
- **"Efficient Memory Management for Large Language Model Serving with PagedAttention"** (Kwon, Zhuohan Li, et al., SOSP 2023) — the foundational paper; read this directly, it's the single most important primary source for this entire skill.
- **"Orca: A Distributed Serving System for Transformer-Based Generative Models"** (Yu et al., OSDI 2022) — an earlier paper introducing iteration-level scheduling (a precursor/parallel idea to vLLM's continuous batching), valuable context for understanding where the batching-strategy insight came from.
- **"FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"** (Dao et al., 2022) and its successors — a complementary, kernel-level optimization (different from PagedAttention's memory-management focus) frequently used alongside PagedAttention in modern serving stacks; worth understanding as a distinct but related contribution.
- **"SGLang: Efficient Execution of Structured Language Model Programs"** — the paper behind the **SGLang** sibling engine, useful direct contrast reading for understanding RadixAttention versus vLLM's own prefix-caching approach.
- **Speculative decoding papers** (e.g. "Fast Inference from Transformers via Speculative Decoding," Leviathan et al., 2023) — foundational reading for the speculative-decoding optimization covered in Advanced Concepts.

If a more recent, specific vLLM-follow-up paper exists that I'm not aware of, treat that as a gap in my knowledge rather than evidence one doesn't exist — search current academic databases (arXiv) for the latest LLM-serving-systems work, since this is an active and fast-moving research area.
`,

  videos: `
- **The original vLLM/PagedAttention presentation** from its authors (search for their SOSP 2023 conference talk or associated recorded presentation) — the clearest from-the-source explanation of the core idea.
- **Conference talks on LLM inference optimization** from major AI infrastructure and systems conferences (search recent editions of relevant AI-engineering and systems conferences for sessions specifically covering vLLM, continuous batching, or KV-cache management).
- **UC Berkeley Sky Computing Lab talks/seminars** — the originating research group's broader presentations on efficient LLM serving.
- **Practical "deploying vLLM in production" walkthroughs** from cloud provider developer-relations channels — often the most concrete, current, code-level content for actual deployment mechanics.

I don't have high confidence in specific talk titles, speaker names, or exact publication dates for this narrow a topic, and would rather point you to the right channels/conferences to search currently than invent a specific citation.
`,

  "github-repos": `
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — the project itself; read the docs/ directory and recent release notes for the most current, authoritative detail.
- [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) — a different, CPU/edge-friendly inference approach, useful contrast reading (and the engine underlying much of **Ollama**'s own execution).
- [sgl-project/sglang](https://github.com/sgl-project/sglang) — the sibling engine's repository; instructive to compare its scheduler and prefix-caching (RadixAttention) approach against vLLM's.
- [huggingface/text-generation-inference](https://github.com/huggingface/text-generation-inference) — Hugging Face's own production serving engine, another useful comparison point.
- [NVIDIA/TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) — the hardware-vendor-optimized alternative referenced in Comparisons.
- [vllm-project/vllm's benchmarks directory] — bundled benchmarking scripts, the best starting point for measuring vLLM's actual performance on your own hardware rather than trusting a generic published number.

Verify current star counts, maintenance activity, and release cadence directly on GitHub before depending on any of these in production — activity levels shift over time, and this ecosystem moves quickly.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Configuration reasoning*: given a GPU's memory size, a model's weight footprint, and a target max-model-len, calculate (by hand, then verify empirically) an estimated maximum concurrent-request capacity, using the estimator function from Coding Questions as a starting point.
2. *Batching intuition*: implement a tiny simulation (no real model needed) comparing static batching versus continuous batching's aggregate throughput and average wait time, given a synthetic stream of requests with varying generation lengths.
3. *Parallelism decision practice*: given five hypothetical model-size/hardware-topology scenarios, decide and justify tensor parallelism, pipeline parallelism, or a combination for each.
4. *Benchmarking*: run vLLM's own bundled benchmark scripts against a model you have access to, at two different max-model-len settings, and produce a short report on the throughput/concurrency tradeoff you observe.
5. *Quantization evaluation*: quantize a model you can evaluate, run an existing eval suite (or a small hand-built one) before and after, and report the measured accuracy delta alongside the measured throughput/memory improvement.
6. *Resilience engineering*: implement the resilient client pattern from Coding Questions, then deliberately simulate a hung server and confirm your timeout/retry/fallback logic behaves as designed under test.
7. *Capacity planning under prefix sharing*: extend the capacity estimator to account for a workload where a fixed fraction of requests share an identical long system-prompt prefix, and reason about how prefix caching changes the effective concurrent-capacity calculation.

External sets: no dedicated public "vLLM problem set" exists that I'm confident recommending by name — the most useful practice is working directly from vLLM's own documentation examples, its bundled benchmark scripts, and building toward the labs and coding questions on this page against real (even if small) hardware.
`,

  "architecture-diagram": `
The reference production architecture for a self-hosted LLM serving deployment built around vLLM — the shape this page has built toward throughout:

~~~mermaid
flowchart TB
    Client["Client applications"] --> GW["API Gateway\n(auth, rate limiting, model routing)"]
    subgraph Replicas["vLLM Replica Pool"]
        R1["vLLM replica 1\n(TP=4, model A)"]
        R2["vLLM replica 2\n(TP=4, model A)"]
        R3["vLLM replica 3\n(model B)"]
    end
    GW -->|load-aware routing\nbased on KV-cache usage| R1
    GW --> R2
    GW --> R3
    subgraph Obs["Observability"]
        Prom["Prometheus\nTTFT, inter-token latency,\nqueue depth, GPU cache usage"]
        Grafana["Dashboards + alerts"]
        DCGM["nvidia-smi / DCGM\nGPU hardware metrics"]
    end
    Replicas -.scrape.-> Prom --> Grafana
    Replicas -.hardware metrics.-> DCGM
    subgraph Infra["Infrastructure"]
        K8s["Kubernetes\nGPU node pool"]
        Secrets["Secrets Management\n(API keys, credentials)"]
    end
    Replicas -.runs on.-> K8s
    GW -.reads.-> Secrets
~~~

Every box here maps to a skill on this platform: **Hugging Face** supplies the model checkpoints; **Docker** and Kubernetes host the deployment; **Secrets Management** backs the gateway's credential handling; **Cost Optimization** and **Latency** are the outcomes the whole architecture exists to optimize; **AI Evals** validates any configuration change (quantization, model version) before it reaches this production topology.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((vLLM))
    The Problem
      KV-cache memory fragmentation
      Naive contiguous allocation waste
      Poor GPU utilization from static batching
    Core Innovations
      PagedAttention
        Fixed-size pages
        On-demand allocation
        Block table indirection
      Continuous batching
        Iteration-level scheduling
        Admit at every decode step
    Performance Levers
      max-model-len sizing
      Prefix caching
      Quantization AWQ GPTQ
      Speculative decoding
      Tensor parallelism
      Pipeline parallelism
    Internals
      Prefill compute-bound
      Decode memory-bandwidth-bound
      Copy-on-write blocks
      Preemption under pressure
    Production Practice
      OpenAI-compatible API
      Gateway for auth and routing
      Prometheus metrics
      TTFT and inter-token latency
      Load-aware multi-replica routing
    Security
      Gateway-level auth
      Resource-exhaustion limits
      Checkpoint provenance
      Prompt injection unchanged by self-hosting
    Ecosystem
      Hugging Face checkpoints
      Ollama easy local setup
      SGLang RadixAttention
      TensorRT-LLM hardware-optimized
    Connections
      Structured Outputs
      Cost Optimization
      Latency
      AI Evals
      AI Red Teaming
~~~
`,
};

export default vllm;
