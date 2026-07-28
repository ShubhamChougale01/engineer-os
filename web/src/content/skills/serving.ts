import type { SkillContent } from "../types";

/**
 * Serving — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const serving: SkillContent = {
  overview: `
Serving is the discipline of turning a trained large language model into a reliable, scalable, network-reachable production service. Where the **Inference** skill covers the algorithms that make one forward pass fast (KV caching, continuous batching, PagedAttention, speculative decoding, quantization), Serving covers everything wrapped around that engine to keep it healthy under real traffic: how requests are routed to GPUs, how a fleet of model replicas scales up and down with demand, how multiple models or fine-tuned adapters share hardware, how failures are contained, and how the whole system is deployed, observed, and operated day after day. If Inference is "how the engine works," Serving is "how you build the car, the garage, and the highway around it."

For an AI engineer, serving is where theory meets budget. A brilliant model that cannot handle production traffic without falling over, or that costs ten times more than it needs to because of a naive deployment, is not a shippable product. Serving decisions — which engine to run (vLLM, TGI, Triton, TorchServe, or a managed API), how to autoscale, how to route between models, how to isolate tenants — determine latency, cost per token, and reliability just as much as model quality does.

Key characteristics of the serving workload: it is a systems and infrastructure problem layered on top of a GPU-bound inference workload; it must simultaneously optimize for throughput (tokens per second per dollar), latency (time-to-first-token and inter-token latency), and availability (no single point of failure); and it increasingly must support heterogeneity — multiple models, multiple fine-tuned variants of the same base model, multiple hardware types — rather than a single model on a single machine. This page assumes you are comfortable with the mechanics from **Inference** and the fundamentals from **LLM Fundamentals**; it builds the operational layer on top, and connects outward to **Kubernetes**, **Docker**, and **MLOps** for the broader infrastructure this all runs inside of.
`,

  history: `
LLM serving as a distinct discipline is younger than model serving in general — classical ML model serving (scikit-learn, XGBoost, small neural nets) had already matured for years before LLMs made the problem qualitatively different.

| Year | Milestone |
|------|-----------|
| ~2016–2019 | TensorFlow Serving and TorchServe establish the "model server" pattern for classical/deep learning models: load weights, expose a prediction endpoint, batch requests |
| 2019 | NVIDIA Triton Inference Server (originally TensorRT Inference Server) generalizes model serving across frameworks and hardware backends, aimed at low-latency, high-throughput production inference |
| 2020–2021 | Serving large Transformer models (BERT-scale) becomes common, but request sizes and generation lengths are still small compared to what follows |
| 2022 | Hugging Face's Text Generation Inference (TGI) emerges specifically for serving generative LLMs, packaging continuous batching and tensor parallelism behind a simple Docker image |
| Nov 2022 | ChatGPT's launch turns LLM serving into an urgent, industry-wide capacity and cost problem overnight — millions of concurrent conversational requests, not batch scoring jobs |
| 2023 | vLLM releases, introducing PagedAttention and demonstrating throughput gains that make it a default choice for self-hosted LLM serving; commercial "LLM-as-a-service" providers (Together AI, Fireworks, Anyscale, Replicate, Groq) build businesses purely on serving efficiency |
| 2023–2024 | Multi-LoRA serving (serving many fine-tuned adapters on one base model, e.g., S-LoRA, Punica) becomes a distinct serving pattern for platforms hosting many customized models cheaply |
| 2024 | Disaggregated prefill/decode serving, KV-cache-aware routing, and serverless/autoscaled GPU platforms (Modal, RunPod, Baseten, SageMaker/Vertex/Azure managed endpoints) mainstream serving patterns that used to be research topics |
| 2024–2025 | Model routers and gateways (LiteLLM, OpenRouter-style proxies) that load-balance and fail over across multiple providers/models become a standard architectural layer in production LLM stacks |

The throughline: every serving advance exists to answer "how do we run this model reliably, for many concurrent users, without either falling over or burning an unsustainable amount of money per request."
`,

  "why-it-exists": `
Before dedicated LLM serving infrastructure, the natural instinct was to treat an LLM like any other web-served artifact: load it into a process, wrap it in a Flask or FastAPI endpoint, and call it done. That works for a demo. It breaks immediately at even modest concurrency, because a single GPU process handling one request at a time (or naively queueing them) leaves enormous throughput on the table, has no way to gracefully degrade under load, and has no story for what happens when the process crashes, the GPU runs out of memory, or traffic triples overnight.

The gap serving infrastructure fills is the distance between "a model that works when I curl it once" and "a service that a business can depend on." That gap includes: admission control and backpressure (what happens to request 1,001 when the system can handle 1,000), horizontal scaling (adding more GPU replicas as demand grows and removing them as it shrinks), routing (sending each request to the right model/replica/region), fault tolerance (a crashed replica should not take down the whole service), and observability (knowing, in real time, whether the service is healthy and where it's about to break).

Serving exists because inference optimization alone answers "how fast can one GPU generate tokens" but not "how do a thousand concurrent users get served reliably, cheaply, and predictably, twenty-four hours a day, across regions, across model versions, without engineers babysitting it."
`,

  "problem-it-solves": `
Serving infrastructure removes concrete, measurable pains:

- **Single point of failure**: a naive one-process deployment means any crash, OOM, or deploy takes the whole service down; serving infrastructure runs multiple replicas behind a load balancer with health checks so individual failures are invisible to users.
- **Wasted GPU capacity under variable load**: fixed-size deployments either overprovision (paying for idle GPUs at 3am) or underprovision (falling over during a traffic spike); autoscaling matches capacity to demand.
- **No isolation between tenants or models**: serving many customers or many fine-tuned variants on shared hardware without a plan leads to noisy-neighbor problems (one tenant's huge request starves everyone else) and security/data leakage risk.
- **Unpredictable latency under load**: without admission control, queueing policy, and load-aware routing, a system degrades unpredictably as load rises rather than failing gracefully (e.g., shedding low-priority load, returning fast errors instead of slow timeouts).
- **Operational blindness**: without monitoring and alerting built for LLM-specific signals (TTFT, tokens/sec, KV cache pressure, queue depth), teams find out about degradation from angry users, not dashboards.
- **Deployment risk**: shipping a new model version or config change with no canary/rollback path risks an outage on every release.

What serving deliberately does **not** solve:

- It does not make the model faster at the algorithmic level — that is the **Inference** skill's territory (KV caching, batching algorithms, quantization, speculative decoding all live there; serving consumes and configures them).
- It does not improve model quality, reduce hallucination, or fix bad prompts — see **Fine-Tuning**, **Prompt Engineering**, **Evaluation**, and **Hallucination**.
- It does not replace general container/cluster orchestration knowledge — it builds on top of **Docker** and **Kubernetes**, it does not reinvent them.
- It does not guarantee safety or policy compliance of model output — that is the **Guardrails** skill's job, enforced as a layer serving requests can pass through, not something the server itself decides.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between the inference-mechanics layer (KV cache, batching algorithms) and the serving-infrastructure layer (replicas, routing, autoscaling), and correctly place a given concern in one or the other.
2. Compare vLLM, TGI (Text Generation Inference), Triton Inference Server, and TorchServe on their design goals, strengths, and appropriate use cases.
3. Describe how a request travels from a client through a load balancer/router, into a scheduler, onto a GPU replica, and back — including where queueing and batching happen.
4. Explain multi-model and multi-LoRA serving: why and how many fine-tuned variants can share one base model's compute.
5. Design an autoscaling policy for GPU-backed LLM serving, and explain why naive CPU-utilization-based autoscaling fails for this workload.
6. Identify the production configuration knobs that matter most (replica count, batch size limits, context length caps, GPU memory allocation) and justify a starting point for each.
7. Describe request routing strategies (round robin, least-connections, KV-cache-aware / prefix-aware routing) and when each is appropriate.
8. Explain the operational differences between self-hosted serving (vLLM/TGI/Triton on your own or rented GPUs) and managed model endpoints (SageMaker, Vertex AI, Azure ML, Bedrock).
9. Design a monitoring and alerting setup for an LLM serving fleet, including the signals that predict failure before it happens.
10. Reason about the cost/latency/reliability tradeoffs of a given serving architecture and explain the choice to a stakeholder who doesn't know the internals.
`,

  prerequisites: `
- **Required**: the **Inference** skill (KV cache, continuous batching, PagedAttention, quantization, speculative decoding — this page assumes you know what these are and configures them rather than re-explaining them) and **LLM Fundamentals** (tokens, context windows, what a forward pass produces).
- **Required**: basic familiarity with **Docker** (containerizing a process) and **Kubernetes** (running and scaling containers across machines) — serving infrastructure is built on top of these, not instead of them.
- **Helpful**: general web-service concepts (load balancers, health checks, horizontal scaling) if you've built any backend service before, the shape of this page will feel familiar even though the workload (GPU-bound, stateful KV cache, expensive requests) is different from typical stateless web APIs.
- **Not required yet**: you do not need to have written CUDA or hand-optimized attention kernels — that is deeper than this page or **Inference** goes.

Dependency map: **LLM Fundamentals** → **Inference** (algorithmic layer) → this page (**Serving**, infrastructure layer) → concrete engines **vLLM** / **Ollama** / **SGLang**, and platform skills **Kubernetes**, **Docker**, **MLOps** (the broader operational discipline this serving layer lives inside). Sibling pages that interact with serving from other angles: **Fine-Tuning** (what gets deployed), **Guardrails** (a layer that wraps served requests), **Evaluation** and **Observability**-adjacent monitoring concerns, and **RAG** (a common consumer of a serving endpoint).
`,

  "beginner-concepts": `
### What a "model server" actually is

At its simplest, a model server is a long-running process that: loads model weights into GPU memory once at startup, exposes a network endpoint (usually HTTP or gRPC), accepts requests containing a prompt and generation parameters, runs inference, and returns a response — while staying alive to serve many requests over its lifetime, instead of loading the model fresh for every single request.

~~~text
Naive (wrong) approach: load model per-request
  request arrives -> load 14GB of weights from disk -> run one generation -> exit
  -> every request pays tens of seconds of load time; completely impractical

Model server approach: load once, serve many
  startup -> load model once -> [ready]
  request 1 arrives -> generate -> respond   (weights already in memory)
  request 2 arrives -> generate -> respond
  ... process stays alive indefinitely, serving thousands of requests
~~~

This is the first and most basic idea in serving: amortize the expensive one-time cost (loading multi-gigabyte weights onto a GPU) across every request that process ever handles.

### A minimal server, conceptually

~~~python
# Conceptual minimal LLM server (illustrative, not production-ready)
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
model = load_model("my-7b-model")   # loaded ONCE at process startup

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 256

@app.post("/generate")
def generate(req: GenerateRequest):
    # naive: handles ONE request at a time, no batching, no queueing
    output = model.generate(req.prompt, max_new_tokens=req.max_tokens)
    return {"text": output}
~~~

This works for a demo and breaks immediately under real traffic: a second request arriving while the first is still generating either queues behind it (if the process is single-threaded around the GPU) or, worse, tries to share the GPU naively and slows both down. This is exactly the gap that inference engines like vLLM and TGI fill — see **Inference** for the batching algorithms — and it's the first reason you almost never hand-roll this loop in production.

### Replicas: running more than one copy

The next fundamental idea: run multiple copies (replicas) of the model server, each on its own GPU (or GPU set), and put a load balancer in front of them.

~~~text
                          ┌──────────────┐
Client requests  ───────► │ Load Balancer │
                          └──────┬───────┘
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
               Replica 1     Replica 2     Replica 3
              (GPU + model) (GPU + model) (GPU + model)
~~~

Replicas solve two problems at once: they let total throughput scale roughly linearly with the number of GPUs (each replica independently serves its own share of traffic), and they provide fault tolerance — if replica 2 crashes or is being restarted, the load balancer simply stops sending it traffic and the other two keep serving.

### Health checks and readiness

A replica is not automatically "ready" the moment its process starts — loading multi-gigabyte model weights onto a GPU can take tens of seconds to minutes. Serving infrastructure distinguishes **liveness** (is the process still running, or does it need to be restarted) from **readiness** (has it finished loading and can it accept traffic right now). Sending traffic to a replica that is still loading its model causes failed or extremely slow requests — this is why every production serving deployment configures explicit readiness probes before a replica is added to the load balancer's rotation.
`,

  "intermediate-concepts": `
### Request routing strategies

Once you have multiple replicas, something has to decide which replica handles each incoming request. The naive answer, round robin, sends request 1 to replica A, request 2 to replica B, request 3 to replica C, and so on, regardless of how busy each replica currently is.

~~~text
Round robin:        request N -> replica (N mod num_replicas)
                     -- simple, but ignores that replicas can have very
                        different current load (a replica mid-way through
                        a 4,000-token generation is NOT free just because
                        it's "next in line")

Least-connections:  request -> replica with the fewest currently active requests
                     -- better under variable-length generations, since it
                        accounts for actual in-flight load, not just request count

KV-cache-aware / prefix-aware routing: request -> replica that already has
                     this request's shared prompt prefix cached
                     -- avoids repeating prefill work; particularly valuable
                        for multi-turn conversations or shared system prompts
                        (see Inference's PagedAttention/prefix-caching section)
~~~

Production LLM gateways (e.g., a router in front of several vLLM/TGI replicas) increasingly implement the KV-cache-aware variant, because for LLM workloads — unlike typical short stateless web requests — request duration and cache-hit potential vary enormously, so ignoring that state when routing leaves real throughput on the table.

### Autoscaling: why CPU-based autoscaling fails here

Classic web-service autoscaling watches CPU utilization or request rate and adds/removes replicas accordingly. For GPU-backed LLM serving, this metric is close to useless: a GPU can show low CPU utilization while its GPU memory (KV cache) and GPU compute are both saturated, or vice versa. The signals that actually predict whether a replica needs help are LLM-specific:

~~~text
Signals worth autoscaling on:
- queue depth (requests waiting for a free scheduling slot)
- GPU memory utilization (weights + KV cache — the usual true ceiling)
- time-to-first-token (TTFT) trending upward -- a leading indicator of overload
- in-flight request count relative to configured max_num_seqs
~~~

Additionally, GPU-backed autoscaling has a cold-start problem that CPU autoscaling rarely does: spinning up a new replica means provisioning a GPU instance (which can take minutes if none are warm) and then loading multi-gigabyte model weights before the replica is ready to help — by the time it comes online, the traffic spike that triggered scaling may already be over. Production systems mitigate this with a warm pool of pre-provisioned (but currently idle) GPU capacity, predictive/scheduled scaling for known traffic patterns, and conservative scale-down policies (scale up fast, scale down slow) to avoid oscillation.

### Multi-model and multi-tenant serving

Real platforms rarely serve exactly one model to exactly one customer. Two common patterns:

- **Multi-model serving**: hosting several different base models (e.g., a small fast model and a large accurate one) behind one gateway, routing each request to the appropriate model based on task, cost tier, or explicit client choice. Engines like Triton and platforms like Ray Serve support this natively — one server process, multiple loaded models, requests routed by a model name in the request.
- **Multi-LoRA serving**: when many customers each have their own fine-tuned adapter (see **Fine-Tuning**'s LoRA section) built on the SAME base model, serving a separate full copy of the base model per customer is wasteful — the base weights are identical, only the small adapter differs. Techniques like S-LoRA and Punica (and vLLM's built-in LoRA support) load one copy of the base model and swap in different low-rank adapter weights per request, letting hundreds of fine-tuned variants share one GPU's base-model compute.

~~~text
Naive: 100 fine-tuned customers -> 100 full model copies -> 100x GPU memory
Multi-LoRA: 1 base model + 100 small adapters -> ~1x base memory + tiny adapter overhead
~~~

This is one of the more consequential serving-layer decisions for any platform offering "your own fine-tuned model" as a product feature, because it changes the unit economics by roughly the number of tenants sharing a base model.

### Configuration surface of a production inference engine

Regardless of which engine (vLLM, TGI, Triton) is chosen, a handful of configuration knobs recur, and getting them wrong is the single most common cause of "it worked in the demo but falls over in production":

- **max_model_len / max sequence length**: hard ceiling on prompt + generation tokens.
- **max_num_seqs / max concurrent sequences**: how many requests the scheduler will admit into one running batch.
- **gpu_memory_utilization**: what fraction of GPU memory the engine reserves for weights + KV cache versus leaving headroom for other processes.
- **tensor_parallel_size**: how many GPUs one model replica is sharded across (see **Inference**'s scalability section for why this matters for models too large for one GPU).
- **quantization**: precision mode for weights, chosen for the memory/accuracy/throughput tradeoff for this specific deployment.

These are the same knobs discussed algorithmically in **Inference** — Serving is the layer that decides their production values, monitors their effect at scale, and changes them safely via deploys rather than one-off tweaks.
`,

  "advanced-concepts": `
### Disaggregated prefill/decode serving

Because prefill (compute-bound, parallel over the whole prompt) and decode (memory-bandwidth-bound, one token at a time) have such different resource profiles, some advanced serving architectures physically separate them onto different GPU pools rather than running both phases on every GPU.

~~~text
Traditional (co-located):     one GPU pool runs BOTH prefill and decode
                               for every request -- simple, but a burst of
                               long-prompt requests can stall decode
                               throughput for everyone else

Disaggregated:  Prefill pool (compute-optimized GPUs)  -> KV cache handoff -> Decode pool (memory-optimized GPUs)
                request's prompt processed on prefill pool, resulting KV
                cache transferred to a decode-pool GPU, which then owns
                the sequential generation loop
~~~

The benefit is that each pool can be sized and even hardware-selected for its own bottleneck (more compute-dense GPUs for prefill, more memory-bandwidth-dense for decode), and a burst of prefill-heavy traffic no longer directly steals decode throughput from unrelated in-flight requests. The cost is added complexity: a KV cache transfer step between pools, and a scheduler that understands two pools instead of one. This is genuinely advanced, is not necessary for the large majority of production deployments, and is the kind of architecture adopted by very large-scale providers rather than a typical internal platform team — mentioned here so you recognize the pattern if you encounter it, not as a default recommendation.

### KV-cache-aware and semantic routing

Beyond simple least-connections routing, advanced gateways route based on which replica already holds a relevant KV cache (for a repeated system prompt or a multi-turn conversation's history) so that a follow-up request lands on the replica that can skip re-prefilling shared context. Some systems go further with semantic/session affinity: pinning a specific conversation to the same replica for its whole lifetime specifically to preserve this cache locality, while still load-balancing new conversations across the fleet.

### Serverless / scale-to-zero GPU serving

Platforms like Modal, RunPod Serverless, and Baseten popularized "scale-to-zero" GPU serving: when there is no traffic, zero GPU replicas run (zero cost); the first request triggers a cold start that provisions a GPU, loads the model, and serves the request (at the cost of a slow first response), after which the replica stays warm for some idle window before scaling back to zero. This trades cost efficiency for tail latency — excellent for spiky, low-average-utilization workloads (internal tools, low-traffic APIs), poor for latency-sensitive, always-on production traffic where a cold start of tens of seconds is unacceptable. Understanding this tradeoff — and choosing scale-to-zero deliberately rather than by accident — is a genuinely senior serving decision.

### Speculative and draft-model serving at the fleet level

**Inference** covers speculative decoding as an algorithm; at the serving layer, the decision of where the draft model runs (co-located on the same GPU as the target model, or on separate cheaper hardware) and how draft-model failures are handled (falling back to standard decoding without failing the whole request) are serving-architecture decisions, not algorithmic ones. A production rollout of speculative decoding needs monitoring of acceptance rate per model/workload (see **Inference**'s Monitoring section) fed back into a decision of whether it's worth the added operational complexity for a given deployment.

### Priority tiers and admission control

At scale, not all requests are equal: a paying customer's request and a free-tier batch job should not compete equally for the same GPU capacity during a spike. Advanced serving systems implement priority queues (higher-tier requests preempt or jump ahead of lower-tier ones in scheduling), and admission control that rejects or defers low-priority requests fast (rather than accepting everything and degrading uniformly) once the system approaches capacity. This connects directly to the queue-depth and backpressure concepts introduced in Intermediate Concepts, generalized to a multi-tier traffic model.
`,

  "internal-working": `
Here is what actually happens, step by step, when a production serving stack handles one request, from the client to a GPU replica and back.

~~~mermaid
flowchart TD
    A["Client request arrives at gateway/load balancer"] --> B{"Authentication /\nrate limiting / quota check"}
    B -- fail --> Z["Reject: 401/429"]
    B -- pass --> C["Router selects a replica\n(round robin / least-conn /\nKV-cache-aware)"]
    C --> D{"Replica healthy and\nhas capacity?"}
    D -- no --> E["Retry another replica\nor return 503 with backoff hint"]
    D -- yes --> F["Request enters replica's\ninternal scheduler queue"]
    F --> G["Scheduler admits request into\nnext batch (continuous batching)"]
    G --> H["Inference engine runs\nprefill + decode\n(see Inference skill)"]
    H --> I["Tokens streamed back through\nreplica -> gateway -> client"]
    I --> J["Request completes;\nmetrics emitted; KV cache freed"]
~~~

Step-by-step detail:

1. **Ingress**: the request hits a gateway or load balancer first, not the model directly. This layer typically handles authentication, rate limiting/quota enforcement, and request validation (e.g., rejecting a request whose prompt exceeds the configured max context length) before any GPU work is spent on it.
2. **Routing**: the gateway/router picks a target replica using whatever strategy is configured (round robin, least-connections, KV-cache-aware). A health check (readiness) gates which replicas are even eligible.
3. **Admission into the replica's queue**: the request lands in the target replica's internal scheduler queue — a queue that exists even for a single, otherwise-idle replica, because the inference engine's own continuous-batching scheduler decides, at every step, which requests are actively decoding versus waiting.
4. **Batching and inference**: the inference engine (vLLM/TGI/Triton/etc.) runs the prefill and decode loop described in **Inference**'s "internal-working" section, interleaved with other in-flight requests on the same replica via continuous batching.
5. **Streaming back**: tokens flow back through the same path (engine → replica's HTTP/gRPC layer → gateway → client), typically as Server-Sent Events or chunked HTTP, so the client sees partial output as TTFT and inter-token latency, not one blocking response.
6. **Completion and cleanup**: on completion (or client disconnect/cancellation), the replica frees the request's KV cache pages, emits metrics (latency, token counts, which model/replica served it), and the gateway closes the stream to the client.

The critical operational point: nearly every failure mode in production serving traces back to one of these steps being under-designed — no rate limiting (step 1), no health checks gating routing (step 2/3), no queue depth limits (step 3), or no graceful handling of a mid-stream failure (step 5/6).
`,

  architecture: `
Serving architecture is best understood as layered: an edge/gateway layer, a routing/scheduling layer, and a fleet of inference-engine replicas — each layer owned by a different part of the system and independently scalable.

~~~mermaid
flowchart TB
    subgraph Edge["Edge / Gateway layer"]
        LB["Load balancer / API gateway"]
        Auth["Auth, rate limiting, quota"]
        LB --> Auth
    end
    subgraph Routing["Routing layer"]
        Router["Model/replica router\n(round robin / least-conn / KV-cache-aware)"]
        Registry["Model registry\n(which models/versions are deployed where)"]
        Router --> Registry
    end
    subgraph Fleet["Inference engine fleet"]
        R1["Replica 1: vLLM/TGI + GPU(s)"]
        R2["Replica 2: vLLM/TGI + GPU(s)"]
        R3["Replica N: vLLM/TGI + GPU(s)"]
    end
    subgraph Control["Control plane"]
        AS["Autoscaler\n(queue depth, GPU mem, TTFT)"]
        Mon["Monitoring / alerting"]
        AS --> Fleet
        Mon --> Fleet
    end
    Auth --> Router
    Router --> R1
    Router --> R2
    Router --> R3
~~~

### Directory/project layout of a self-hosted serving stack

~~~text
serving-stack/
├── gateway/              # auth, rate limiting, request validation, routing
│   └── router.py         # picks a target replica; may be KV-cache-aware
├── engine-configs/        # per-model engine configuration
│   ├── llama-70b.yaml     # tensor_parallel_size, max_model_len, quantization, etc.
│   └── mistral-7b.yaml
├── k8s/                   # Kubernetes manifests (Deployment, Service, HPA)
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml           # autoscaling policy (see Scalability)
├── monitoring/            # dashboards, alert rules for TTFT, TPS, queue depth, GPU mem
└── model-registry/        # which model versions are canary/stable, rollback pointers
~~~

This is the general shape whether you build it from vLLM + Kubernetes yourself, or consume a managed platform (SageMaker/Vertex/Azure ML endpoints, or a serverless GPU platform) that hides most of this layout behind a simpler deploy interface — the layers still exist underneath, just operated by the vendor. See **Kubernetes** and **Docker** for the container/orchestration mechanics this architecture runs on top of.
`,

  "data-flow": `
Tracing one request end to end through a multi-replica serving fleet, including routing, autoscaling feedback, and a failure/retry path:

~~~mermaid
sequenceDiagram
    participant Client
    participant GW as Gateway
    participant Router
    participant R1 as Replica 1 (vLLM)
    participant R2 as Replica 2 (vLLM)
    participant AS as Autoscaler
    participant Mon as Monitoring

    Client->>GW: POST /v1/chat/completions {prompt, stream: true}
    GW->>GW: authenticate, check rate limit/quota
    GW->>Router: forward request
    Router->>Router: pick replica (least-connections)
    Router->>R1: forward request
    R1->>R1: admit into scheduler queue -> prefill -> decode
    R1-->>Router: stream tokens
    Router-->>GW: stream tokens
    GW-->>Client: stream tokens (SSE)
    R1->>Mon: emit TTFT, TPS, queue depth metrics

    Note over R1: mid-stream, Replica 1's GPU memory pressure spikes
    Mon->>AS: queue depth / GPU mem breach threshold
    AS->>AS: provision new replica R3 (async, takes time)

    Note over R2: separate concurrent request
    Client->>GW: POST /v1/chat/completions (second request)
    GW->>Router: forward
    Router->>R2: route to LESS busy replica
    R2-->>Client: stream response (via GW)
~~~

The detail worth internalizing: routing decisions and autoscaling decisions happen on different timescales. Routing must decide in milliseconds, per request, using currently-known load information; autoscaling reacts over seconds-to-minutes, provisioning new capacity that will only help LATER requests, not the one that triggered the scale-up. A production system must gracefully handle the gap between "we detected we need more capacity" and "the new capacity is actually ready" — usually via queueing, backpressure (fast 429/503 responses instead of ever-growing wait times), and a pre-warmed buffer of spare capacity for spiky workloads.
`,

  "production-usage": `
Real teams almost never write an inference engine or a scheduler from scratch. Production serving work is mostly: choosing an engine (vLLM, TGI, Triton, TorchServe, or a managed endpoint), configuring it correctly for the target model and hardware, wrapping it in a gateway with auth/rate-limiting, deploying it on **Kubernetes** (or a managed GPU platform), and operating it with the monitoring and deployment practices covered later in this page.

### Choosing an engine, practically

- **vLLM**: the most common default for self-hosted, high-throughput serving of open-weight models; strong continuous batching and PagedAttention implementation, active development, broad model support, OpenAI-compatible API mode that simplifies integration with existing client code.
- **TGI (Text Generation Inference)**: Hugging Face's production serving toolkit, tightly integrated with the Hugging Face model ecosystem, simple to deploy for HF-hosted model checkpoints, good default choice when your team is already deep in the HF tooling stack.
- **Triton Inference Server**: NVIDIA's general-purpose model server, supports many frameworks and backends (not just LLMs), strong choice when a team already serves a mix of model types (classical ML, vision, LLMs) and wants one unified serving layer, and when deep NVIDIA hardware-specific optimization (via TensorRT-LLM backend) matters.
- **TorchServe**: PyTorch's own model server, more general-purpose/classical-ML-oriented historically; less commonly the first choice for large-scale LLM-specific serving today compared to vLLM/TGI/Triton, but still seen in teams with existing TorchServe operational investment.
- **Managed endpoints** (SageMaker, Vertex AI, Azure ML, Bedrock, Anthropic/OpenAI APIs): the right choice when a team wants to avoid owning GPU fleet operations entirely, trading control and sometimes cost-at-scale for operational simplicity.

### Typical production defaults

- A gateway layer in front of the inference engine handling auth, rate limiting, and request validation — never expose an inference engine's raw endpoint directly to the public internet.
- Explicit resource requests/limits and readiness/liveness probes on every replica (see **Kubernetes**), so orchestration never routes traffic to a not-yet-ready or unhealthy replica.
- A canary or blue/green rollout path for new model versions or engine config changes (see Deployment), never a direct in-place replace of every replica at once.
- Autoscaling driven by LLM-specific signals (queue depth, GPU memory, TTFT trend) rather than generic CPU utilization (see Scalability).
- Cost and usage tracked per model/tenant, since GPU-hours are the dominant cost line for any self-hosted LLM serving deployment.

The overarching production principle: serving is an ongoing operational commitment, not a one-time deploy. Traffic patterns shift, new model versions ship, GPU availability and pricing change — a serving stack that isn't actively monitored and periodically retuned degrades in cost-efficiency and reliability over time even if nothing appears to break.
`,

  "industry-examples": `
- **OpenAI and Anthropic**: operate LLM serving at some of the largest scales in the industry, publicly discussing techniques like prompt/prefix caching (directly related to the KV-cache-aware routing and shared-prefix ideas on this page) as user-facing, cost-reducing features.
- **Hugging Face**: builds and maintains TGI specifically to let any team self-host generative models in production without building a serving engine from scratch; also operates Inference Endpoints as a managed alternative for teams that don't want to run TGI themselves.
- **Together AI, Fireworks AI, Baseten, Replicate, Groq**: infrastructure companies whose core product IS LLM serving — competing directly on the throughput, latency, and cost metrics this page covers, often building custom routing, autoscaling, and hardware-specific optimizations as their primary differentiator.
- **Ray / Anyscale**: Ray Serve is used by many teams to build custom multi-model serving pipelines (e.g., routing between several models, or combining an LLM call with pre/post-processing steps) with Python-native scaling primitives, common in more bespoke internal platforms.
- **NVIDIA**: Triton Inference Server plus the TensorRT-LLM backend is widely used by enterprises standardizing on NVIDIA hardware, particularly where a single serving layer needs to support both LLMs and other model types.
- **Cloud providers (AWS SageMaker, Google Vertex AI, Azure ML)**: offer managed model endpoints with built-in autoscaling and multi-model support, the default choice for teams that want production serving without owning the underlying GPU fleet operations.

Pattern to notice: the companies that treat LLM serving as first-class infrastructure engineering (dedicated routing, autoscaling tuned to GPU-specific signals, careful rollout practices) are consistently the ones able to offer both low latency and low cost per token — the two rarely come for free without this investment.
`,

  "best-practices": `
1. **Never expose an inference engine's raw endpoint directly** — always front it with a gateway handling auth, rate limiting, and request validation (max prompt length, max_tokens caps) before GPU work is spent.
2. **Separate readiness from liveness explicitly** — a replica that's alive but still loading weights must not receive traffic; misconfigured probes are one of the most common causes of intermittent production errors right after a deploy.
3. **Autoscale on LLM-specific signals** (queue depth, GPU memory utilization, TTFT trend), not generic CPU utilization, which is a poor proxy for GPU-bound workload saturation.
4. **Scale up fast, scale down slow** — asymmetric autoscaling policies avoid oscillation (thrashing replicas up and down) while still reacting quickly to real spikes.
5. **Maintain a warm capacity buffer for spiky workloads** — cold-start time (provisioning a GPU instance, loading multi-gigabyte weights) is often minutes, far too slow to react to a traffic spike in real time without headroom.
6. **Use canary or blue/green rollouts for model and config changes**, never an in-place replace of every replica at once — a bad config (wrong quantization mode, wrong context length) should affect a small percentage of traffic, not all of it, before it's caught.
7. **Prefer multi-LoRA serving over full-model-per-tenant** when hosting many fine-tuned variants of the same base model — the memory and cost savings are typically an order of magnitude.
8. **Set hard request-level limits** (max prompt length, max_tokens, request timeout) at the gateway, not just as engine defaults — defense in depth against a single malformed or malicious request consuming disproportionate capacity.
9. **Track cost and usage per model and per tenant from day one** — GPU-hours dominate serving cost, and retrofitting attribution after the fact is far harder than instrumenting it from the start.
10. **Design explicit backpressure (fast 429/503) rather than unbounded queueing** — a system that queues forever under overload produces a worse user experience (very slow responses) than one that fails fast and lets clients retry or degrade gracefully.
11. **Route with cache-locality awareness for multi-turn/shared-prefix workloads** where the engine and gateway support it — this is free throughput that plain round-robin routing leaves on the table.
12. **Load-test with realistic, production-shaped traffic** (mixed prompt/generation lengths, realistic concurrency, realistic tenant/model mix) before trusting a capacity plan derived from synthetic uniform benchmarks.
`,

  "anti-patterns": `
### Exposing the inference engine directly to the internet

~~~text
WRONG: client -> vLLM's raw HTTP endpoint, no gateway
       -> no auth, no rate limiting, no request validation
       -> one malicious or buggy client can consume all GPU capacity

RIGHT: client -> gateway (auth, rate limit, validate) -> router -> engine replicas
~~~

### Autoscaling on CPU utilization for a GPU-bound workload

Configuring a Kubernetes HorizontalPodAutoscaler purely on CPU usage for LLM serving pods routinely fails to scale up when GPU memory or GPU compute is actually saturated (CPU usage can look low even while the GPU is the bottleneck), and can scale up unnecessarily when CPU-bound preprocessing spikes but the GPU has plenty of headroom — always tie autoscaling to GPU/queue-depth/TTFT signals for this workload.

### Treating a full in-place rollout as the default deploy strategy

~~~text
WRONG: deploy new model version/config to ALL replicas simultaneously
       -> a subtle bug or misconfiguration (e.g., wrong max_model_len)
          affects 100% of traffic before anyone notices

RIGHT: canary to a small percentage of replicas/traffic first,
       watch error rate/latency/quality signals, then roll forward
~~~

### One full model copy per fine-tuned tenant

Provisioning an entirely separate GPU replica (or entirely separate model weights) per customer's fine-tuned LoRA adapter when the base model is shared wastes GPU memory and cost roughly proportional to the number of tenants — multi-LoRA serving exists specifically to remove this waste; reach for it before scaling tenant count linearly with GPU count.

### Unbounded queueing under overload

Allowing a request queue to grow without limit when the system is over capacity produces ever-increasing latency for everyone rather than a clear, fast failure for some — clients waiting 60+ seconds for a response that eventually times out anyway is a worse experience, and a worse operational signal, than a fast 503 with a retry-after hint.

### Conflating serving-layer fixes with model-quality fixes

Assuming that scaling up replicas, tuning batch sizes, or switching inference engines will fix hallucination, poor reasoning, or unsafe outputs — it will not; those are the domain of **Fine-Tuning**, **Evaluation**, **Hallucination**, and **Guardrails**, not serving infrastructure.
`,

  performance: `
### Measure first

- **Per-replica TTFT and tokens-per-second**, as defined in **Inference** — but now aggregated across the whole fleet, with attention to variance between replicas (a single degraded replica can be masked by fleet-wide averages while still ruining individual users' experience).
- **Queue depth and admission wait time**, per replica and fleet-wide — the leading indicator of undersized capacity before user-facing latency actually degrades.
- **GPU memory and compute utilization**, per replica — distinguishes "we need more replicas" from "this replica is configured/tuned poorly."
- **Gateway-level latency overhead** (auth, rate limiting, routing logic) — should be a small, stable fraction of total request latency; a growing gateway overhead as traffic scales points at a bottleneck in the routing/gateway layer itself, separate from the inference engines.
- **Cost per million tokens served**, blended across the fleet — the metric that ultimately matters for the business, combining GPU-hour cost, utilization efficiency, and request mix.

### The optimization hierarchy (apply in order)

1. **Get the inference-engine-level configuration right first** (continuous batching enabled, appropriate max_num_seqs, quantization chosen deliberately) — see **Inference** for this layer; serving-layer tuning cannot compensate for a badly configured engine.
2. **Right-size replica count to real traffic**, informed by load testing with production-shaped traffic distributions, not synthetic uniform benchmarks.
3. **Tune routing for cache locality** where multi-turn or shared-prefix traffic is common — this is often a larger throughput win than adding more replicas.
4. **Tune autoscaling thresholds and warm-buffer size** against your actual traffic volatility — too conservative wastes money on idle capacity, too aggressive risks capacity gaps during spikes.
5. **Consider multi-LoRA serving** if hosting many fine-tuned variants — a structural cost reduction rather than a tuning knob.
6. **Consider disaggregated prefill/decode or hardware specialization** only once the simpler levers are exhausted and you're operating at a scale where the added complexity pays for itself — this is not a first-week optimization.

### Numbers worth knowing (order-of-magnitude, verify against current hardware/engine benchmarks)

- Multi-replica horizontal scaling gives close to linear throughput scaling per additional well-utilized replica, assuming the gateway/router itself is not the bottleneck.
- Multi-LoRA serving can reduce per-tenant GPU memory footprint by roughly an order of magnitude versus one full model copy per tenant, for a shared base model.
- Cold-start time for a new GPU replica (provisioning + weight loading) is commonly tens of seconds to a few minutes depending on model size and infrastructure — plan warm-buffer sizing around this, and always verify against your specific cloud/hardware setup rather than assuming a fixed number.
`,

  scalability: `
Serving scalability is the story of adding GPU-replica capacity elastically, while keeping routing, autoscaling, and fault tolerance correct as the fleet grows and shrinks.

### Horizontal scaling shape

~~~mermaid
flowchart LR
    Traffic["Incoming traffic\n(varies over time)"] --> AS["Autoscaler"]
    AS -->|"scale up"| Fleet["Replica fleet\n(N replicas, N grows/shrinks)"]
    AS -->|"scale down"| Fleet
    Fleet --> Router["Router\n(routes across current N replicas)"]
~~~

Each replica independently serves its own share of requests (an inference engine already handles concurrency within itself via continuous batching, from **Inference**); adding replicas adds roughly linear throughput as long as the gateway/router layer itself is not saturated and traffic is distributed evenly.

### Vertical vs horizontal, and multi-GPU replicas

- **Vertical (within one replica)**: a single replica can itself span multiple GPUs via tensor parallelism (for a model too large for one GPU) — this is a replica-internal decision covered more deeply in **Inference**'s scalability section, but it directly affects how "big" one unit of horizontal scaling is.
- **Horizontal (across replicas)**: adding more independent replicas is the standard way to scale total throughput once a single replica's configuration is already efficient — this is where autoscaling policy, load balancing, and fault tolerance live.

### Bottleneck table

| Bottleneck | Symptom | Serving-layer answer |
|------------|---------|----------------------|
| Too few replicas for traffic | Rising queue depth, TTFT | Autoscale up; verify warm buffer sizing |
| Gateway/router becomes the bottleneck | Latency overhead grows with total traffic, independent of per-replica load | Scale gateway horizontally too; profile routing logic |
| One model too large for a single GPU | OOM at replica startup | Tensor parallelism across GPUs within a replica (see Inference) |
| Many fine-tuned tenants, shared base model | GPU memory/cost scales linearly with tenant count | Multi-LoRA serving instead of per-tenant full copies |
| Traffic bursts faster than replicas can be provisioned | Latency spikes during ramp-up, resolves once scaling catches up | Warm capacity buffer; predictive/scheduled scaling for known patterns |
| Cross-region latency for global users | High TTFT for distant users despite healthy fleet | Multi-region deployment with geo-aware routing |

### Multi-region and geo-distribution

At sufficient scale, a single-region deployment adds meaningful network latency for geographically distant users. Multi-region serving replicates the fleet across regions and routes each user to the nearest healthy region, at the cost of added operational complexity (model version consistency across regions, cross-region monitoring, and — if state like conversation history is involved — data residency and consistency concerns that connect to broader **MLOps** and infrastructure practices beyond this page's scope).
`,

  security: `
Serving-specific security concerns sit alongside — and are distinct from — general LLM application security, covered more fully in the **Guardrails** skill.

1. **Never expose an inference engine's raw endpoint publicly** — the gateway layer is the security boundary; it must own authentication, authorization, and rate limiting before any request reaches GPU capacity.
2. **Tenant isolation in multi-tenant and multi-LoRA serving is a real vulnerability surface** — if a shared base model serves many customers' adapters, the serving layer must guarantee one tenant's request cannot access or leak another tenant's adapter weights, cached KV data, or conversation history. This is not automatic; it must be a deliberate design property of the routing and scheduling layer.
3. **Resource-exhaustion / denial-of-service via unbounded requests** — enforce hard limits on prompt length, max_tokens, and request rate at the gateway, not only as engine-level defaults, so a single client cannot starve capacity for everyone else.
4. **Model/weight exfiltration risk** — serving infrastructure that exposes model internals (e.g., raw logits with unusual detail, or debug endpoints left enabled in production) can leak information useful for model extraction attacks; audit what a served endpoint actually exposes beyond generated text.
5. **Supply-chain risk in the serving stack itself** — the inference engine, its dependencies, and any custom routing/gateway code are part of your production attack surface; treat engine version upgrades and dependency patches with the same rigor as any other production service (see general security practices, not repeated here).
6. **Side-channel risk from cache-aware routing** — routing decisions that expose or are influenced by whether a prefix is cached can, in principle, leak information about what content has recently been processed in highly sensitive multi-tenant deployments; worth considering explicitly if tenant isolation is a strict requirement.

For broader application-level concerns — jailbreaks, unsafe tool invocation, data exfiltration through generated output — see the **Guardrails** and **Hallucination** skills; this page covers only the surfaces specific to how a request is routed, scheduled, and served across a fleet.
`,

  testing: `
Testing the serving layer is about verifying the system behaves correctly under realistic load and failure conditions — not just that a single request returns a plausible answer.

~~~python
# Conceptual load test: verify the fleet holds its latency SLOs under
# realistic, variable-length concurrent traffic (not uniform synthetic prompts).
import asyncio
import random

async def load_test(client, num_requests=500):
    latencies = []

    async def one_request():
        prompt_len = random.choice([50, 200, 1000, 4000])   # realistic mix
        max_tokens = random.choice([50, 200, 800])
        start = time.perf_counter()
        await client.generate(prompt=make_prompt(prompt_len), max_tokens=max_tokens)
        latencies.append(time.perf_counter() - start)

    await asyncio.gather(*(one_request() for _ in range(num_requests)))
    p95 = sorted(latencies)[int(0.95 * len(latencies))]
    assert p95 < LATENCY_SLO_SECONDS, f"p95 latency {p95:.2f}s exceeds SLO"

# Conceptual chaos test: verify the fleet tolerates a replica failure gracefully.
def test_replica_failure_is_transparent_to_clients(fleet, router):
    kill_one_replica(fleet)                     # simulate a crash
    response = router.generate(sample_prompt())  # should succeed via remaining replicas
    assert response.status_code == 200
    assert router.healthy_replica_count(fleet) == len(fleet) - 1
~~~

### Senior testing doctrine for serving systems

- **Load-test with production-shaped traffic**: realistic prompt/generation length distributions and realistic concurrency, not uniform synthetic requests — this is the only way to validate autoscaling and routing behavior meaningfully.
- **Chaos-test replica failure explicitly**: kill a replica mid-traffic and verify the router/gateway degrades gracefully (no dropped in-flight requests where avoidable, no cascading failure to remaining replicas).
- **Test autoscaling end to end in staging**, not just unit-test the scaling policy in isolation — verify the full loop (metric crosses threshold → new replica provisioned → readiness gates it into rotation → traffic actually reaches it) works within an acceptable time window.
- **Canary-test model/config changes** against a held-out quality/latency benchmark before promoting to full traffic — a regression caught in canary is cheap; the same regression at 100% traffic is an incident.
- **Test backpressure behavior explicitly**: verify the system returns fast, clear errors (429/503) rather than degrading into ever-growing latency once past capacity.
`,

  debugging: `
### Escalation path for serving issues

1. **Isolate single-request vs fleet-wide**: reproduce with one direct request against one replica first. If it fails there too, the issue is likely in the inference engine or model config (see **Inference**'s debugging section); if it only fails through the gateway/router, the issue is in the serving layer itself.
2. **Check gateway/router logs and metrics for the request**: which replica was it routed to, how long did routing/auth take, was it rejected by rate limiting or admission control before ever reaching a replica?
3. **Check the target replica's queue depth and GPU memory state at the time of the request**: a slow or failed request during high queue depth or near-exhausted GPU memory points at a capacity issue, not a code bug.
4. **Check readiness/liveness probe history for the replica**: a replica that was flapping between ready/not-ready around the time of the failure often explains intermittent errors that don't reproduce reliably.
5. **Check autoscaler event history**: was a scale-up or scale-down event in progress during the incident? A replica being terminated mid-request (without connection draining configured) is a classic source of dropped in-flight requests during scale-down.
6. **Check for a recent deploy or config change**: compare the incident window against recent rollouts (new model version, changed engine config, changed routing logic) — most production serving incidents correlate with a recent change, not a sudden unrelated failure.
7. **Escalate to inference-engine-level debugging** (per **Inference**'s debugging section) only after ruling out the serving-layer causes above — many apparent "model is slow" reports turn out to be routing to an overloaded replica, not an engine or model problem at all.

### Useful signals to log per request

Which replica served it, routing decision latency, queue wait time before admission, TTFT, tokens-per-second, whether it was a canary or stable version, and the autoscaler's replica count at request time. These make "why was this one request slow" tractable across the whole fleet, not just within a single engine instance.
`,

  monitoring: `
### What to measure

- **Per-replica and fleet-aggregate TTFT and tokens-per-second** (p50/p95/p99) — never trust a single blended average; a degraded replica can hide behind a healthy fleet-wide mean.
- **Queue depth and admission wait time**, per replica — the leading indicator of undersized capacity, visible before user-facing latency actually degrades.
- **GPU memory and compute utilization**, per replica — distinguishes engine-configuration issues from genuine capacity shortfalls.
- **Replica health/readiness transitions over time** — frequent flapping is a leading indicator of an unstable deployment or resource misconfiguration.
- **Autoscaler events** (scale-up/scale-down triggers and their outcomes) — verifies the autoscaling loop is actually working, not just configured.
- **Error rate by type** (auth rejections, rate-limit rejections, engine errors, timeouts) — broken out by cause, since each points at a different layer to investigate.
- **Cost per million tokens, per model, per tenant** — the business-facing metric that ties technical serving decisions back to unit economics.

### Instrumentation sketch

~~~python
import time

def handle_request_with_metrics(router, request, metrics_client):
    routing_start = time.perf_counter()
    replica = router.select_replica(request)
    metrics_client.observe("routing_latency_seconds", time.perf_counter() - routing_start)

    queue_start = time.perf_counter()
    replica.admit(request)   # blocks until scheduler admits it
    metrics_client.observe("queue_wait_seconds", time.perf_counter() - queue_start,
                            tags={"replica": replica.id})

    result = replica.generate_streaming(request)
    metrics_client.observe("ttft_seconds", result.ttft, tags={"replica": replica.id, "model": request.model})
    metrics_client.observe("tokens_per_second", result.tps, tags={"replica": replica.id})
    metrics_client.increment("requests_total", tags={"status": result.status, "model": request.model})
    return result
~~~

### What to alert on

Alert on fleet-wide TTFT/TPS p95/p99 crossing product-defined SLOs, on queue depth sustained above a threshold (predicts imminent latency degradation before it's user-visible), on GPU memory utilization approaching limits (predicts imminent OOM failures), and on replica readiness flapping (predicts an unstable deployment). Tie these alerts directly into the autoscaling policy described in Scalability, so the same signals that page a human also drive automated capacity response where appropriate.
`,

  deployment: `
Deployment of a serving stack means packaging the gateway, router, and inference-engine replicas as containers and orchestrating them — almost always on **Kubernetes** for self-hosted deployments, or via a managed platform's deploy interface otherwise. This section shows a representative, annotated example.

~~~yaml
# Kubernetes Deployment for one vLLM-based model replica (illustrative, trim to your needs)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-serving-vllm
spec:
  replicas: 3                      # start with 3; autoscaler (HPA) adjusts this
  selector:
    matchLabels:
      app: llm-serving
  template:
    metadata:
      labels:
        app: llm-serving
    spec:
      containers:
        - name: vllm
          image: vllm/vllm-openai:latest
          args:
            - "--model=meta-llama/Llama-3-8b"
            - "--max-model-len=8192"          # hard ceiling on prompt+generation tokens
            - "--max-num-seqs=64"             # scheduler's concurrent-sequence limit
            - "--gpu-memory-utilization=0.90" # leaves headroom, avoids OOM at the edge
            - "--enable-prefix-caching"       # reuse KV cache for shared prompt prefixes
          resources:
            limits:
              nvidia.com/gpu: 1               # explicit GPU resource request
          readinessProbe:                     # gates traffic until weights are loaded
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 5
          livenessProbe:                      # restarts a genuinely hung process
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 60
            periodSeconds: 15
---
apiVersion: v1
kind: Service
metadata:
  name: llm-serving-svc
spec:
  selector:
    app: llm-serving
  ports:
    - port: 80
      targetPort: 8000
~~~

Per-line rationale for the choices that matter: max-model-len and max-num-seqs are set deliberately, not left at framework defaults, because they directly bound worst-case KV cache memory per replica (see **Inference**); readiness and liveness probes are distinct because a replica loading multi-gigabyte weights is alive but not yet ready, and routing traffic to it before it's ready causes failed requests; the GPU resource limit ensures Kubernetes schedules exactly one GPU per pod rather than oversubscribing.

An autoscaling policy (HorizontalPodAutoscaler or a custom controller reacting to queue depth/GPU memory, per Scalability) sits on top of this Deployment, and a canary rollout strategy (a small percentage of replicas running a new image/config, monitored before promoting) governs how changes to this manifest reach production — never edit and apply a production Deployment's model/config fields directly against 100% of replicas at once.
`,

  "production-checklist": `
- [ ] Inference engine chosen deliberately (vLLM/TGI/Triton/managed) and justified against the team's model mix, hardware, and operational maturity.
- [ ] Gateway layer in front of the engine handling auth, rate limiting, and request validation — no raw engine endpoint exposed publicly.
- [ ] max_model_len, max_num_seqs, and gpu_memory_utilization (or equivalents) set deliberately per model, not left at framework defaults.
- [ ] Readiness and liveness probes configured and verified to actually gate traffic during a real restart, not just present in the manifest.
- [ ] Autoscaling policy tied to LLM-specific signals (queue depth, GPU memory, TTFT trend), not generic CPU utilization.
- [ ] Warm capacity buffer sized against measured traffic volatility and cold-start time.
- [ ] Canary or blue/green rollout path exists and has been exercised at least once before the first real production change.
- [ ] Multi-LoRA (or equivalent) serving in place if hosting many fine-tuned variants of one base model.
- [ ] Tenant isolation verified explicitly for any multi-tenant deployment (no cross-tenant data/adapter/cache leakage).
- [ ] Hard request-level limits enforced at the gateway (max prompt length, max_tokens, timeout).
- [ ] Monitoring dashboards cover TTFT, TPS, queue depth, GPU memory, error rate by type, and cost per million tokens.
- [ ] Alerting configured on leading indicators (queue depth, GPU memory trend), not only on user-visible failures.
- [ ] Load-tested with production-shaped (variable-length, realistic-concurrency) traffic, not uniform synthetic benchmarks.
- [ ] Chaos-tested replica failure and confirmed graceful degradation with no cascading outage.
- [ ] Backpressure behavior verified: the system fails fast (429/503) rather than degrading into unbounded latency under overload.
- [ ] Cost and usage attribution in place per model and per tenant.
`,

  "common-mistakes": `
1. **Exposing the raw inference engine endpoint publicly** — skips the entire auth/rate-limiting/validation layer that protects capacity; the fix is a mandatory gateway in front of every engine endpoint.
2. **Leaving engine defaults untouched in production** — default max_model_len or batch limits are rarely tuned for a specific deployment's memory and traffic profile; always set them deliberately.
3. **Confusing readiness with liveness** — treating "the process started" as "the replica can serve traffic" causes failed requests immediately after every deploy or restart.
4. **Autoscaling on CPU utilization** — a poor proxy for GPU-bound saturation; leads to both under- and over-scaling relative to actual capacity needs.
5. **In-place rollout of every replica at once** — turns a config or model-version bug into a full outage instead of a contained canary failure.
6. **One full model copy per fine-tuned tenant** — wastes GPU memory and cost linearly with tenant count when multi-LoRA serving would share the base model.
7. **Unbounded request queues** — produces slowly-degrading latency for everyone instead of a fast, clear failure for some, which is both a worse user experience and a worse operational signal.
8. **No load testing with realistic traffic shape** — synthetic uniform benchmarks systematically understate the benefit of continuous batching and the risk of routing/autoscaling misconfiguration under real, variable-length traffic.
9. **No chaos/failure testing** — the first time a team learns their router doesn't handle a replica crash gracefully is often during a real production incident.
10. **Ignoring cost attribution until the bill is a surprise** — GPU-hours dominate serving cost; retrofitting per-model/per-tenant tracking after the fact is much harder than instrumenting it from day one.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Requests fail immediately after a deploy or restart | Traffic routed to a replica before it finished loading weights (readiness misconfigured) | Configure and verify a real readiness probe distinct from liveness |
| Out-of-memory errors under moderate concurrency | max_model_len / max_num_seqs / gpu_memory_utilization not tuned for the deployment | Recompute KV cache sizing (see Inference) and set explicit, conservative limits |
| Latency degrades slowly under load instead of failing fast | No backpressure/admission control; unbounded queueing | Add explicit queue depth limits and fast 429/503 responses past capacity |
| Autoscaler doesn't react to real traffic spikes | Scaling policy tied to CPU utilization instead of queue depth/GPU memory/TTFT | Re-point autoscaling triggers at LLM-specific signals |
| Dropped requests during scale-down | No connection draining before replica termination | Configure graceful shutdown / draining period before pod termination |
| One tenant's traffic starves others on shared infrastructure | No per-tenant rate limiting or priority tiers | Add tenant-aware quotas and admission control at the gateway |
| New model version causes a fleet-wide regression | Full in-place rollout with no canary stage | Adopt canary/blue-green rollout with monitored promotion criteria |
| GPU memory footprint scales linearly with number of fine-tuned customers | Full model copy per tenant instead of shared-base multi-LoRA serving | Adopt multi-LoRA serving (e.g., vLLM's LoRA support, S-LoRA-style approaches) |
`,

  faqs: `
**Q: Do I need Kubernetes to serve LLMs in production?**
A: Not strictly — managed platforms (SageMaker, Vertex AI, Azure ML, serverless GPU platforms) can hide the orchestration layer entirely. But if you're self-hosting an inference engine like vLLM or TGI at any meaningful scale, Kubernetes (or an equivalent orchestrator) is close to the default answer for managing replicas, health checks, and autoscaling.

**Q: Should I build my own gateway/router, or use an existing one?**
A: For most teams, an existing API gateway or LLM-specific proxy/router (several open-source and commercial options exist) is a better starting point than hand-rolling auth, rate limiting, and routing logic — reserve custom routing logic for genuinely differentiating needs like KV-cache-aware routing at scale.

**Q: How many replicas do I need?**
A: There's no fixed number — it depends on your traffic volume, request length distribution, latency SLOs, and chosen hardware. Load-test with production-shaped traffic and use the resulting queue-depth/latency curves to size initial capacity, then let autoscaling handle variance around that baseline.

**Q: Is vLLM always the right choice?**
A: No single engine is universally best; it depends on your model, hardware, and existing tooling investment. vLLM is a strong, widely-adopted default for self-hosted open-weight model serving as of this writing, but TGI, Triton, or a managed endpoint may fit a given team better — evaluate against your actual constraints rather than defaulting on reputation alone.

**Q: What's the difference between serving and MLOps?**
A: Serving is the specific discipline of running an inference workload reliably at scale (this page); **MLOps** is the broader discipline covering the full model lifecycle — training pipelines, experiment tracking, data versioning, and deployment automation — of which serving is one important piece, not the whole.

**Q: How do I serve many fine-tuned models cheaply?**
A: If they share a base model, look at multi-LoRA serving (loading one base model plus many small adapters) before defaulting to one full replica per fine-tuned variant — the cost difference is typically large.

**Q: What happens when a GPU replica crashes mid-request?**
A: This is a design decision, not a given — configure the gateway/router to detect the failure (health check or connection error) and retry against a healthy replica where safe, and ensure in-flight streaming responses fail visibly to the client rather than hanging silently. Chaos-testing this path before it happens in production (see Testing) is strongly recommended.
`,

  "interview-questions": `
**Junior level**

1. *What is the difference between the KV cache/continuous batching layer and the serving layer?* — Model answer: KV caching and continuous batching are algorithmic techniques inside one inference engine/replica that make a single GPU's generation faster and more efficient (covered in Inference); the serving layer is everything around that — replicas, load balancing, autoscaling, routing, monitoring — that lets many such replicas serve many concurrent users reliably.
2. *Why can't you just autoscale LLM serving the same way you'd autoscale a typical web API on CPU utilization?* — Model answer: LLM serving is GPU-bound; CPU utilization is a poor proxy for whether GPU memory (KV cache) or GPU compute is actually saturated, so CPU-based autoscaling can both under- and over-react relative to real capacity needs.
3. *What's the difference between a readiness probe and a liveness probe, and why does it matter for LLM serving specifically?* — Model answer: readiness gates whether a replica should receive traffic right now; liveness gates whether the process needs restarting. LLM replicas take real time to load multi-gigabyte weights, so a replica can be alive but not ready — sending traffic before readiness causes failed requests.
4. *What is round-robin routing, and what's a weakness of it for LLM traffic?* — Model answer: it sends each request to the next replica in sequence regardless of current load; its weakness is ignoring that LLM requests vary hugely in duration (short vs long generations), so a replica mid-way through a long request isn't actually "free" just because it's next in rotation.

**Senior level**

5. *Design a serving architecture for a platform hosting 200 customers, each with their own fine-tuned adapter on the same 7B base model. What would you avoid, and why?* — Model answer: avoid one full model replica per customer (200x the necessary GPU memory); instead use multi-LoRA serving (e.g., vLLM's LoRA support or an S-LoRA-style approach) to share one base model's weights across all adapters, loading only the small per-customer adapter weights per request.
6. *Explain disaggregated prefill/decode serving and when it's actually worth the added complexity.* — Model answer: prefill is compute-bound and parallel, decode is memory-bandwidth-bound and sequential; disaggregating them onto separate GPU pools lets each be sized/hardware-selected for its own bottleneck and prevents prefill-heavy bursts from stealing decode throughput. It's worth it at large scale with distinct traffic patterns; it adds real complexity (KV cache transfer, a two-pool scheduler) that isn't justified for most typical deployments.
7. *How would you handle a traffic spike that arrives faster than new GPU replicas can be provisioned?* — Model answer: maintain a warm capacity buffer sized against measured traffic volatility, use predictive/scheduled scaling for known patterns, and implement clear backpressure (fast 429/503 with retry hints) rather than unbounded queueing while new capacity comes online.
8. *What's the risk of KV-cache-aware routing in a multi-tenant deployment, and how would you mitigate it?* — Model answer: routing based on cache locality can, in principle, create a timing side channel or, if implemented carelessly, risk cross-tenant cache sharing; mitigate by strictly partitioning cache/routing state per tenant and auditing that no adapter, KV cache, or conversation data crosses tenant boundaries.
9. *Walk through what happens, step by step, if a replica crashes mid-stream while serving a request. What needs to be true for the client to have a good experience?* — Model answer: the gateway/router needs to detect the failure (connection error or health check), the client needs a clear failure signal (not a silent hang) rather than an indefinite wait, and ideally the request is retried transparently against a healthy replica if it's safe to do so (e.g., hasn't already streamed partial, non-idempotent side effects).
10. *How do you decide between a managed endpoint (SageMaker/Vertex/Azure) and self-hosting with vLLM/TGI on your own Kubernetes cluster?* — Model answer: weigh operational maturity and headcount available for infra ownership, expected scale and its effect on cost-at-scale (self-hosting often wins on unit cost at high, sustained volume), need for custom routing/multi-LoRA/disaggregated architectures (harder on managed platforms), and time-to-first-production-deploy (usually faster on managed platforms).
`,

  "coding-questions": `
### Problem 1: Least-connections router

Implement a simple least-connections router that tracks in-flight request counts per replica and routes each new request to the replica with the fewest active requests.

~~~python
import threading

class LeastConnectionsRouter:
    def __init__(self, replica_ids):
        self._counts = {rid: 0 for rid in replica_ids}
        self._lock = threading.Lock()

    def select_replica(self):
        with self._lock:
            # pick the replica with the minimum in-flight count
            replica = min(self._counts, key=self._counts.get)
            self._counts[replica] += 1
            return replica

    def release(self, replica):
        with self._lock:
            self._counts[replica] = max(0, self._counts[replica] - 1)

# Usage:
router = LeastConnectionsRouter(["r1", "r2", "r3"])
replica = router.select_replica()
try:
    handle_request(replica)   # do the actual generation work
finally:
    router.release(replica)   # ALWAYS release, even on error/timeout
~~~

Complexity: O(n) selection where n is the number of replicas (fine for typical fleet sizes; a heap would make it O(log n) if the fleet were very large). Follow-ups: how would you make this weighted (some replicas have more GPU capacity than others)? How would you extend it to be KV-cache-aware (prefer a replica that already holds a relevant prefix)?

### Problem 2: Token-bucket rate limiter for the gateway

Implement a per-client token-bucket rate limiter suitable for a gateway sitting in front of an inference engine fleet.

~~~python
import time
import threading

class TokenBucket:
    def __init__(self, capacity, refill_rate_per_sec):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate_per_sec
        self.last_refill = time.monotonic()
        self._lock = threading.Lock()

    def _refill(self):
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

    def allow(self, cost=1):
        with self._lock:
            self._refill()
            if self.tokens >= cost:
                self.tokens -= cost
                return True
            return False

# Usage at the gateway: reject fast (429) rather than queueing indefinitely
buckets = {}   # per-client-id TokenBucket instances

def handle_incoming_request(client_id, request):
    bucket = buckets.setdefault(client_id, TokenBucket(capacity=10, refill_rate_per_sec=2))
    if not bucket.allow():
        return {"status": 429, "body": "rate limit exceeded, retry later"}
    return route_and_generate(request)
~~~

Complexity: O(1) per request. Follow-ups: how would you make token cost proportional to requested max_tokens (since longer generations consume proportionally more capacity)? How would you distribute this rate limiter state across multiple gateway instances (a shared store like Redis, versus per-instance approximate limits)?

### Problem 3: Queue-depth-based autoscaling decision function

Write a function that decides whether to scale a replica fleet up, down, or leave it unchanged, given current queue depth, replica count, and configured thresholds — with asymmetric "scale up fast, scale down slow" behavior.

~~~python
from dataclasses import dataclass

@dataclass
class ScalingDecision:
    action: str        # "up", "down", "none"
    target_replicas: int

def decide_scaling(current_replicas, queue_depth, scale_up_threshold,
                    scale_down_threshold, min_replicas, max_replicas,
                    consecutive_low_periods, low_periods_required_to_scale_down=3):
    avg_queue_per_replica = queue_depth / max(current_replicas, 1)

    if avg_queue_per_replica > scale_up_threshold and current_replicas < max_replicas:
        # scale up immediately -- react fast to protect latency
        return ScalingDecision("up", min(current_replicas + 1, max_replicas))

    if (avg_queue_per_replica < scale_down_threshold
            and consecutive_low_periods >= low_periods_required_to_scale_down
            and current_replicas > min_replicas):
        # scale down only after sustained low load -- avoid oscillation
        return ScalingDecision("down", max(current_replicas - 1, min_replicas))

    return ScalingDecision("none", current_replicas)
~~~

Complexity: O(1). Follow-ups: how would you incorporate GPU memory utilization alongside queue depth? How would you account for the cold-start delay of a newly provisioned replica when deciding how aggressively to scale up?
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Deploy a single vLLM replica behind a minimal gateway

Deploy vLLM serving a small open-weight model (e.g., a 1–3B parameter model) in a single Docker container, then write a minimal FastAPI gateway in front of it that adds an API key check and a max_tokens cap before forwarding requests. Deliverable: a working local setup where an unauthenticated or over-limit request is rejected before reaching vLLM, and a valid request streams a response. Skills exercised: engine configuration, basic gateway design, request validation.

### Lab 2 (Intermediate): Multi-replica routing with health checks

Run three vLLM replicas (can be the same small model duplicated, or simulated with a mock delay if GPUs are limited) and implement a least-connections router in front of them with readiness checks, so a replica that's artificially made "unhealthy" is automatically excluded from routing. Deliverable: a demo showing traffic continuing uninterrupted when one replica is killed. Skills exercised: routing logic, health checking, fault tolerance.

### Lab 3 (Advanced): Kubernetes deployment with autoscaling

Package the gateway + vLLM replica setup from Labs 1–2 as Kubernetes manifests (Deployment, Service, HPA or a custom autoscaling controller reacting to a custom queue-depth metric rather than CPU). Deliverable: a load test (using the load-testing pattern from Testing) that triggers a scale-up event, observed via kubectl and your monitoring dashboard. Skills exercised: **Kubernetes**, autoscaling policy design, load testing.

### Lab 4 (Production-grade): Multi-LoRA serving with canary rollout

Extend the deployment to serve at least two different LoRA adapters on one shared base model (using vLLM's LoRA support or an equivalent), routing requests to the correct adapter by a request field. Add a canary rollout mechanism (a small percentage of traffic to a new adapter version) with a rollback path if a synthetic quality check fails. Deliverable: a demonstration of adding a third adapter without redeploying the base model, and a canary rollout that automatically rolls back on a simulated regression. Skills exercised: multi-LoRA serving, canary deployment strategy, connects to **Fine-Tuning** and **MLOps**.
`,

  "real-projects": `
### Project 1: Self-hosted multi-model LLM gateway

Build a production-grade gateway that fronts two or three different open-weight models (e.g., a fast small model and a larger accurate one) served via vLLM or TGI, with request-based routing (client specifies desired model or a routing policy chooses based on request characteristics), per-client rate limiting and quota tracking, and a monitoring dashboard covering TTFT, TPS, queue depth, and cost per model. Engineering requirements: must survive a simulated replica failure without dropping in-flight requests where avoidable, must demonstrate autoscaling reacting to a synthetic load spike, and must attribute cost per model and per client in a report.

### Project 2: Multi-tenant fine-tuned model hosting platform

Build a platform that lets multiple "tenants" upload a LoRA adapter for a shared base model, and serves all of them through one base-model deployment using multi-LoRA serving. Engineering requirements: strict tenant isolation (verified with a test showing tenant A's request cannot access tenant B's adapter or cached data), a canary/rollback path for adapter updates, and a cost model showing the savings versus one full replica per tenant. Connects directly to **Fine-Tuning** (how adapters are produced) and this page (how they're served cheaply).

### Project 3: Latency-aware global routing simulation

Build a simulated multi-region serving setup (can be mocked with artificial per-region latency) that routes each client request to the lowest-latency healthy region, falls over to a secondary region if the primary is unhealthy, and reports p50/p95/p99 latency improvements versus a single-region baseline. Engineering requirements: demonstrate graceful failover under a simulated region outage, and a clear write-up of the operational complexity tradeoff (data consistency, model version sync across regions) this introduces versus a single-region deployment.
`,

  "case-studies": `
- **A mid-size SaaS company scaling from demo to production**: a team ships an LLM feature backed by a single hand-rolled Flask endpoint wrapping a model in a loop; it works in the demo and immediately falls over at modest concurrent usage after launch, with requests queueing behind each other and timing out. Lesson: even correct model behavior is not a shippable product without a real serving layer (batching engine, multiple replicas, a gateway) — the "first version that works" and the "version that survives real traffic" are different engineering efforts.
- **A platform offering many customers their own fine-tuned model**: initially provisions one full GPU replica per customer's fine-tuned model; costs scale linearly and become unsustainable as the customer base grows into the hundreds. Lesson: multi-LoRA serving (sharing one base model's compute across many small adapters) is not a nice-to-have optimization at that scale — it's the difference between a viable and non-viable unit economics model for a "your own fine-tuned model" product feature.
- **A team autoscaling purely on CPU utilization**: their GPU-backed LLM service repeatedly fails to scale up during real traffic spikes because CPU utilization stays low even while GPU memory and queue depth are saturated; users experience severe latency degradation during peak hours despite dashboards showing "healthy" CPU metrics. Lesson: autoscaling signals must match the actual bottleneck of the workload — CPU utilization is close to meaningless for a GPU-bound inference fleet.
- **A provider rolling out a new model version fleet-wide at once**: a subtle misconfiguration in the new version's max context length setting causes a spike in truncated/incorrect responses across 100% of traffic simultaneously, discovered only after user complaints. Lesson: canary or blue/green rollout, with automated quality/latency checks before promoting to full traffic, is what turns this class of incident into a contained, quickly-rolled-back blip instead of a full outage.
`,

  comparisons: `
| Engine / platform | Design goal | Strengths | Considerations |
|---|---|---|---|
| **vLLM** | High-throughput self-hosted serving of open-weight models | Strong continuous batching + PagedAttention implementation, OpenAI-compatible API, broad model support, active development | You own the deployment/ops; still need a gateway and orchestration layer around it |
| **TGI (Hugging Face)** | Production serving tightly integrated with the HF ecosystem | Simple deployment for HF checkpoints, good defaults, solid continuous batching | Ecosystem lock-in to HF tooling is mild but real; feature parity with vLLM varies over time — check current state |
| **Triton Inference Server (NVIDIA)** | General-purpose model serving across frameworks/hardware | Supports mixed model types (not just LLMs) in one server, deep NVIDIA/TensorRT-LLM optimization path | More configuration surface/complexity than a purpose-built LLM engine if you only ever serve LLMs |
| **TorchServe** | General PyTorch model serving | Mature for classical/vision/smaller models, familiar to PyTorch-heavy teams | Less commonly the first choice specifically for large-scale generative LLM serving today versus vLLM/TGI/Triton |
| **Managed endpoints (SageMaker/Vertex/Azure ML/Bedrock)** | Serving without owning GPU fleet operations | Fast time-to-production, built-in autoscaling and multi-model support, less operational burden | Less control over routing/batching internals, cost-at-scale can exceed self-hosting at high sustained volume |
| **Serverless GPU platforms (Modal, RunPod, Baseten)** | Scale-to-zero, pay-per-use GPU serving | Excellent for spiky/low-average-utilization workloads, minimal idle cost | Cold-start latency makes them a poor fit for latency-sensitive, always-on production traffic |

How seniors actually choose: they start from traffic shape (steady high volume vs spiky low volume), latency sensitivity (can a cold start of tens of seconds ever be acceptable), team operational maturity (does the team want to own Kubernetes and GPU fleet operations), and multi-tenant/multi-model requirements (does the platform need to support many fine-tuned variants cheaply) — then pick the engine/platform that fits those constraints, rather than defaulting to whichever tool is most discussed online. Benchmarks and "which is fastest" claims in this space change quickly as engines rapidly iterate; treat any specific throughput number you read (including in this page) as a snapshot to re-verify against current releases, not a permanent fact.
`,

  "related-technologies": `
- **Inference** — the algorithmic layer (KV cache, continuous batching, PagedAttention, speculative decoding, quantization) that this page's serving infrastructure configures, monitors, and scales. Read this one first if you haven't.
- **vLLM, Ollama, SGLang** — concrete inference engines; this page treats them somewhat interchangeably as "the engine," while those pages go deep on each one's specific implementation and API.
- **Kubernetes** — the orchestration layer most self-hosted serving stacks are built on top of; replica management, health checks, and autoscaling in this page map directly onto Kubernetes primitives (Deployments, Services, HPA).
- **Docker** — containerization underlying every replica in a serving fleet; understanding image layering and resource limits directly informs deployment practices here.
- **MLOps** — the broader discipline this page's concerns are one part of; MLOps additionally covers training pipelines, experiment tracking, and data versioning that sit upstream of serving.
- **Fine-Tuning** — produces the LoRA adapters and custom model variants that multi-model/multi-LoRA serving patterns in this page are built to host efficiently.
- **RAG** — a common consumer of a serving endpoint; retrieval-augmented generation systems typically call a served model as one step in a larger pipeline, making the latency/throughput characteristics covered here directly relevant to RAG system design.
- **Guardrails** — a layer that typically wraps requests passing through a serving gateway (input/output filtering), distinct from but adjacent to the routing/auth concerns covered here.
- **Observability / Monitoring practices** more broadly — the metrics and alerting patterns in this page's Monitoring section are an LLM-specific application of general production observability discipline.
`,

  "latest-updates": `
This page reflects general, structural knowledge about LLM serving as of this writing (knowledge cutoff January 2026); the specific tooling landscape moves quickly, and any claim about "which engine is fastest" or "current default architecture" should be re-verified against current documentation and benchmarks before being treated as settled fact.

Directionally, a few trends were visible and worth tracking rather than treating as finished developments: (1) multi-LoRA serving techniques maturing from research projects into first-class features of mainstream engines like vLLM, making cheap multi-tenant fine-tuned serving increasingly standard rather than a custom build; (2) LLM-specific gateways/routers (distinct from generic API gateways) with KV-cache-aware and semantic routing becoming a more common architectural layer rather than a niche optimization; (3) disaggregated prefill/decode serving moving from research papers toward production adoption at the largest-scale providers, though it remains far from a default recommendation for most deployments; (4) serverless/scale-to-zero GPU serving platforms continuing to mature as a viable option for spiky workloads, narrowing (but not eliminating) the cold-start latency gap versus always-on deployments.

Given how fast this space moves, treat any specific product name, version, or benchmark number here as a snapshot — check the **vLLM**, **Ollama**, and **SGLang** skill pages, official documentation, and recent independent benchmarks before making a production tooling decision.
`,

  "future-roadmap": `
Serving infrastructure is likely to keep moving in the direction of doing more automatically what currently requires manual tuning: autoscaling policies that account for GPU memory, queue depth, and TTFT jointly rather than requiring hand-picked thresholds; routing that is KV-cache-aware and multi-tenant-safe by default rather than as an advanced add-on; and multi-LoRA (or successor techniques) becoming a baseline assumption for any platform hosting customized models rather than a differentiating feature.

Disaggregated prefill/decode architectures and hardware specialization (different accelerator types for different phases of inference) are plausible directions for continued investment at the largest scale, though it remains genuinely uncertain how far down-market these techniques will spread versus staying the domain of the largest providers — this is a reasonable area to watch rather than bet on prematurely for most teams.

What is safe to bet career time on regardless of which specific engine or platform wins market share: understanding the fundamental tradeoffs this page covers (throughput vs latency, cost vs reliability, isolation vs efficiency in multi-tenant systems, autoscaling signal selection) transfers across whatever specific tools are popular next year. The **Kubernetes** and **Docker** skills underlying self-hosted serving, and the **MLOps** discipline this all sits inside, are similarly durable investments even as the specific inference-engine landscape continues to shift.
`,

  "cheat-sheet": `
~~~text
SERVING — DENSE REFERENCE

LAYERS
  Gateway     -> auth, rate limiting, request validation
  Router      -> picks replica (round-robin / least-conn / KV-cache-aware)
  Engine      -> vLLM / TGI / Triton / TorchServe (continuous batching, KV cache)
  Control     -> autoscaler + monitoring, reacts to fleet-wide signals

ROUTING STRATEGIES
  round robin        -- simple, ignores current load
  least connections   -- accounts for in-flight request count per replica
  KV-cache-aware      -- routes to replica already holding a shared prefix

AUTOSCALING SIGNALS (NOT cpu utilization)
  queue depth, GPU memory utilization, TTFT trend, in-flight seq count
  scale up FAST, scale down SLOW (avoid oscillation)
  maintain a warm buffer -- cold start (provision + load weights) is slow

MULTI-MODEL / MULTI-TENANT
  multi-model serving: several base models behind one gateway
  multi-LoRA serving:  one base model + many small adapters (order-of-magnitude
                        cheaper than one full replica per fine-tuned tenant)

DEPLOYMENT
  readiness probe  != liveness probe (loading weights = alive but NOT ready)
  canary / blue-green rollout, never in-place-replace-all-at-once
  explicit resource limits (nvidia.com/gpu: N) per replica pod

MONITORING MUST-HAVES
  TTFT p50/p95/p99, tokens/sec p50/p95/p99, queue depth, GPU mem, error rate
  by type, cost per million tokens per model/tenant

FAILURE HANDLING
  backpressure: fast 429/503 over unbounded queueing
  chaos-test replica crash -> router must exclude it, no cascading failure
  connection draining before scale-down termination

ENGINE CHOICE (evaluate against YOUR constraints, this shifts fast)
  vLLM     -- strong default for self-hosted open-weight models
  TGI      -- simple, HF-ecosystem-native
  Triton   -- multi-framework, NVIDIA/TensorRT-LLM optimized
  Managed  -- SageMaker/Vertex/Azure ML/Bedrock -- less ops burden, less control
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What layer does Serving cover that Inference does not? | Fleet-level infrastructure: replicas, routing, autoscaling, gateways, monitoring, deployment — everything around the single-GPU inference engine |
| Why does CPU-based autoscaling fail for LLM serving? | LLM serving is GPU-bound; CPU utilization is a poor proxy for GPU memory/compute saturation |
| What's the difference between readiness and liveness? | Readiness gates whether traffic should be sent now; liveness gates whether the process needs restarting |
| Why is round-robin routing suboptimal for LLM traffic? | It ignores that generation length varies hugely, so a busy replica isn't "free" just because it's next in rotation |
| What is multi-LoRA serving? | Serving many fine-tuned adapters on one shared base model instead of one full model copy per tenant |
| What signals should drive LLM autoscaling? | Queue depth, GPU memory utilization, TTFT trend — not CPU utilization |
| Why "scale up fast, scale down slow"? | React quickly to real spikes while avoiding oscillation/thrashing from short dips in load |
| What is a warm capacity buffer for? | Absorbing traffic spikes faster than new GPU replicas can be cold-started and loaded |
| What is KV-cache-aware routing? | Routing a request to the replica that already holds a relevant cached prompt prefix, avoiding repeated prefill work |
| What is disaggregated prefill/decode serving? | Running prefill (compute-bound) and decode (memory-bandwidth-bound) on separate, differently-sized/specialized GPU pools |
| Why never expose an inference engine's raw endpoint publicly? | It has no auth, rate limiting, or request validation — a single bad client could exhaust all GPU capacity |
| Why prefer canary rollout over in-place replace? | Contains a bad model/config change to a small fraction of traffic instead of causing a full outage |
| What's the risk of unbounded request queues? | Latency degrades slowly for everyone instead of failing fast for some — worse UX and worse operational signal |
| What does a token-bucket rate limiter protect against? | A single client/tenant consuming disproportionate GPU capacity |
| What's the core reason serving and MLOps are related but distinct? | Serving is the operational discipline of running inference at scale; MLOps is the broader lifecycle (training, tracking, versioning) that serving is one part of |
`,

  mcqs: `
**1. Why is CPU utilization a poor autoscaling signal for LLM serving?**
A) CPU is never used during inference
B) The workload is GPU-bound; CPU usage doesn't reflect GPU memory/compute saturation
C) CPU utilization is always 100% during inference
D) Kubernetes doesn't support CPU-based autoscaling
*Answer: B — CPU utilization can look low even while GPU memory (KV cache) or GPU compute is the actual bottleneck, making it an unreliable proxy for LLM-serving load.*

**2. What is the main benefit of multi-LoRA serving?**
A) It makes the base model more accurate
B) It eliminates the need for a gateway
C) It lets many fine-tuned adapters share one base model's compute, cutting per-tenant GPU memory roughly by an order of magnitude versus full copies
D) It removes the need for autoscaling
*Answer: C — multi-LoRA serving loads one base model plus many small adapters instead of a full model copy per tenant.*

**3. What's the difference between a readiness probe and a liveness probe?**
A) They are the same thing
B) Readiness gates whether traffic should be routed now; liveness gates whether the process needs restarting
C) Liveness controls autoscaling; readiness controls logging
D) Readiness only applies to CPU-based services
*Answer: B — a replica can be alive (process running) but not yet ready (still loading weights); routing traffic before readiness causes failures.*

**4. Why do production teams prefer canary/blue-green rollouts over in-place replacing all replicas at once?**
A) It's required by Kubernetes
B) It's faster to deploy
C) It contains the blast radius of a bad model/config change to a small fraction of traffic before full promotion
D) It uses less GPU memory
*Answer: C — a regression caught in canary affects a small percentage of traffic; the same regression at 100% in-place rollout is a full outage.*

**5. What does "scale up fast, scale down slow" protect against?**
A) Running out of disk space
B) Autoscaler oscillation/thrashing between adding and removing replicas on short-lived load dips, while still reacting quickly to real spikes
C) GPU driver incompatibility
D) Token limit overruns
*Answer: B — asymmetric scaling policy reacts quickly to genuine spikes (protecting latency) while requiring sustained low load before scaling down (avoiding wasteful thrashing).*

**6. In disaggregated prefill/decode serving, why are the two phases separated onto different GPU pools?**
A) Prefill and decode use incompatible model weights
B) Prefill is compute-bound and parallel; decode is memory-bandwidth-bound and sequential, so each benefits from differently sized/specialized hardware
C) It's required by all inference engines
D) It reduces the number of GPUs needed overall
*Answer: B — separating the phases lets each pool be sized/specialized for its own bottleneck and prevents one phase's traffic bursts from stealing the other's throughput.*
`,

  "revision-notes": `
Serving is the infrastructure layer that turns a working inference engine into a reliable, scalable production service. It sits on top of the algorithmic techniques from **Inference** (KV cache, continuous batching, PagedAttention, quantization, speculative decoding) and answers a different question: not "how fast is one GPU," but "how do many GPUs serve many concurrent users reliably, cheaply, and predictably."

The core building blocks are a gateway (auth, rate limiting, request validation), a router (deciding which replica handles each request — round robin, least-connections, or KV-cache-aware), a fleet of inference-engine replicas, and a control plane (autoscaling and monitoring) tying it together. Autoscaling must react to GPU-specific signals — queue depth, GPU memory utilization, TTFT trend — never generic CPU utilization, and should scale up fast while scaling down slow to avoid oscillation, backed by a warm capacity buffer since GPU replica cold starts are slow.

Multi-model and multi-LoRA serving let one platform host many models or many fine-tuned variants efficiently — sharing a base model's compute across adapters rather than paying for a full replica per tenant is often an order-of-magnitude cost difference. Deployment practices matter as much as configuration: readiness must be distinguished from liveness, rollouts must be canaried rather than applied in-place to every replica at once, and backpressure (fast failure under overload) must be designed deliberately rather than left to unbounded queueing.

Monitoring must track TTFT, tokens-per-second, queue depth, GPU memory, error rates by cause, and cost per million tokens — per replica and fleet-wide, since averages can hide a degraded individual replica. Security concerns specific to serving include tenant isolation in multi-tenant/multi-LoRA deployments, never exposing raw engine endpoints publicly, and hard resource limits enforced at the gateway.

The field moves quickly — specific engine benchmarks and "which tool is best" claims should always be re-verified — but the underlying tradeoffs (throughput vs latency, cost vs reliability, isolation vs efficiency) are durable. This page connects outward to **Kubernetes** and **Docker** (the orchestration this all runs on), **MLOps** (the broader lifecycle discipline), **Fine-Tuning** (what gets served), and concrete engines **vLLM**, **Ollama**, and **SGLang**.
`,

  "learning-roadmap": `
**Week 1 — Foundations**: Confirm comfort with **LLM Fundamentals** and **Inference** (KV cache, continuous batching, PagedAttention). Read this page's Overview through Advanced Concepts. Milestone: can explain, out loud, the difference between "inference is fast" and "serving is reliable at scale."

**Week 2 — Architecture and internals**: Study Internal Working, Architecture, and Data Flow sections. Deploy a single model (any small open-weight model) with vLLM or TGI locally in Docker, and manually trace a request through gateway → router → engine using logs. Milestone: complete Hands-on Lab 1.

**Week 3 — Multi-replica and routing**: Study Production Usage, Comparisons, and Scalability. Stand up 2–3 replicas and implement a least-connections router with health checks (Hands-on Lab 2). Milestone: demonstrate the fleet surviving a killed replica without dropping requests.

**Week 4 — Production hardening**: Study Performance, Security, Testing, Debugging, Monitoring, Deployment, and the Production Checklist. Move the setup onto Kubernetes with autoscaling driven by queue depth (Hands-on Lab 3). Milestone: a load test that triggers and verifies a real scale-up event.

**Week 5 — Advanced patterns and interview readiness**: Study Advanced Concepts (disaggregated serving, multi-LoRA), work through Interview Questions and Coding Questions, and attempt Hands-on Lab 4 (multi-LoRA + canary rollout) or one of the Real Projects. Milestone: can design, on a whiteboard, a full serving architecture for a stated traffic/tenant scenario and defend the tradeoffs.

Next platform skill to study: dive deeper into a specific engine — **vLLM**, **Ollama**, or **SGLang** — to go from "I understand serving architecture" to "I can operate this specific engine expertly." From there, **MLOps** ties serving into the full model lifecycle, including training, evaluation, and deployment automation.
`,

  "official-docs": `
- **vLLM documentation** (docs.vllm.ai) — engine configuration, OpenAI-compatible server mode, LoRA serving support; the most directly relevant official docs for self-hosted serving covered on this page.
- **Hugging Face Text Generation Inference (TGI) documentation** — deployment guides, configuration reference, and Docker images for production serving of HF-hosted models.
- **NVIDIA Triton Inference Server documentation** — multi-framework serving, model repository configuration, and the TensorRT-LLM backend for NVIDIA-optimized LLM serving.
- **Kubernetes documentation** (kubernetes.io) — Deployments, Services, HorizontalPodAutoscaler, readiness/liveness probes; the orchestration primitives this page's deployment patterns are built on (see also the **Kubernetes** skill).
- **Cloud provider managed-endpoint docs** (AWS SageMaker, Google Vertex AI, Azure ML) — for teams evaluating managed alternatives to self-hosted serving; check current docs directly since managed offerings change frequently.

Always cross-check specific configuration flags and version-specific behavior against the current official docs — engine APIs and defaults evolve quickly.
`,

  books: `
- **"Designing Data-Intensive Applications" by Martin Kleppmann** — not LLM-specific, but the best general foundation for the distributed-systems concepts (load balancing, replication, fault tolerance) that underlie every serving architecture on this page.
- **"Site Reliability Engineering" (Google, various editors)** — foundational reading for the operational practices (monitoring, alerting, incident response, canary rollouts) that apply directly to running a serving fleet in production.
- **"Kubernetes: Up and Running" by Brendan Burns, Joe Beda, Kelsey Hightower** — the practical Kubernetes reference for implementing the deployment patterns shown in this page; pairs directly with the **Kubernetes** skill.
- **"Machine Learning Design Patterns" by Lakshmanan, Robinson, Munn** — broader ML systems design patterns, useful context for where serving fits into the larger ML lifecycle covered in **MLOps**.

LLM-serving-specific books are still a thin category as of this writing given how young and fast-moving the field is — for the most current, LLM-specific material, prioritize the official docs and engineering blogs listed below over books, which tend to lag the state of the art in this particular area.
`,

  blogs: `
- **The vLLM project blog and GitHub discussions** — direct source for PagedAttention, continuous batching, and multi-LoRA serving design rationale, written by the engineers building the engine.
- **Hugging Face's engineering blog** — TGI design posts and production serving guidance from the team maintaining it.
- **Anyscale/Ray blog** — Ray Serve-based multi-model serving patterns and production case studies.
- **Engineering blogs of LLM infrastructure companies** (Together AI, Fireworks AI, Baseten, Modal, Replicate) — high-signal, since their entire business is LLM serving efficiency; look for posts specifically about routing, autoscaling, and multi-tenant serving architecture.
- **Anthropic and OpenAI engineering posts on serving/caching** — when published, these describe production-scale serving decisions (like prompt caching) directly relevant to this page's routing and KV-cache-locality discussion.

As with Latest Updates, treat any specific number or architecture claim in a blog post as a snapshot in a fast-moving field, not a permanent fact.
`,

  "research-papers": `
- **"Efficient Memory Management for Large Language Model Serving with PagedAttention"** (Kwon et al., 2023) — the vLLM paper; though framed as an inference-mechanics paper, its motivating problem (GPU memory fragmentation under real serving traffic) is a serving-layer concern as much as an algorithmic one, and directly informs this page's capacity-planning discussion.
- **"Orca: A Distributed Serving System for Transformer-Based Generative Models"** (Yu et al., 2022, OSDI) — introduces the ideas behind continuous/iteration-level batching in a serving-system context; foundational reading for the scheduling concepts throughout this page.
- **"S-LoRA: Serving Thousands of Concurrent LoRA Adapters"** (Sheng et al., 2023) — directly addresses the multi-LoRA serving pattern discussed in Advanced Concepts; the closest thing to a canonical paper on that specific topic.
- **"Punica: Multi-Tenant LoRA Serving"** (Chen et al., 2023) — another key paper on efficiently serving many LoRA adapters concurrently on shared GPU infrastructure.

This page's specific research base is genuinely thinner than areas like model architecture or training — LLM serving is a young, fast-moving systems discipline where much of the state of the art lives in engine source code, engineering blog posts, and conference talks rather than peer-reviewed papers. If you want deeper theoretical grounding, the closest foundational reading is general distributed-systems and queueing-theory literature (referenced in "Designing Data-Intensive Applications" above), applied to this specific GPU-bound workload.
`,

  videos: `
- **vLLM project talks and conference presentations** (e.g., from PyTorch/MLSys-adjacent conferences) — direct explanations of PagedAttention, continuous batching, and multi-LoRA serving from the engineers who built them; search current conference archives for the latest.
- **Hugging Face TGI walkthroughs and deployment demos** — practical, hands-on videos on deploying and configuring TGI in production.
- **Kubernetes fundamentals video courses** (e.g., from the CNCF or Kelsey Hightower's talks) — not LLM-specific, but directly useful for the orchestration layer this page builds on; pairs with the **Kubernetes** skill.
- **Conference talks from LLM infrastructure companies** (Together AI, Anyscale, Baseten, Modal engineering talks at industry conferences) — often the most current, practically-grounded material on real production serving architecture, since these teams operate at serving scale daily.

Given how quickly this space evolves, prioritize recent (last 12–18 months relative to when you're studying) conference talks and official project presentations over older tutorial videos, which may describe outdated engine defaults or since-superseded architectures.
`,

  "github-repos": `
- **vllm-project/vllm** — the vLLM engine itself; read the scheduler and KV-cache-manager source for a ground-truth view of how continuous batching and PagedAttention are actually implemented.
- **huggingface/text-generation-inference** — TGI's source, useful for comparing design choices against vLLM's approach.
- **triton-inference-server/server** — NVIDIA Triton's core repository, useful for understanding multi-framework, multi-backend serving architecture.
- **ray-project/ray** (specifically the Ray Serve module) — a different architectural approach to multi-model serving, built on general-purpose distributed Python primitives rather than an LLM-specific engine core.
- **kubernetes/kubernetes** — for understanding the orchestration primitives (Deployments, HPA, probes) this page's deployment patterns rely on.
- **S-LoRA / Punica project repositories** — reference implementations of the multi-LoRA serving techniques discussed in Advanced Concepts.
- **BerriAI/litellm** (or similar LLM gateway/proxy projects) — representative of the gateway/router layer pattern discussed throughout this page, worth reading for a concrete implementation of multi-model routing and rate limiting.

As always with fast-moving open-source infrastructure, check each repository's current README and recent commit activity — the specific feature set and recommended usage pattern for any of these projects can shift meaningfully between when this page was written and when you're reading it.
`,

  "practice-problems": `
Ordered by the skill they primarily exercise:

1. **Routing logic**: implement and test round-robin, least-connections, and a simple KV-cache-aware router (tracking which replica last served a given conversation ID); write tests proving each routes differently under identical synthetic load.
2. **Rate limiting**: implement a distributed token-bucket rate limiter backed by a shared store (e.g., Redis) rather than in-process state, and reason about its behavior under multiple concurrent gateway instances.
3. **Autoscaling policy**: extend the queue-depth-based autoscaling function from Coding Questions to incorporate GPU memory utilization as a second signal, with a clear precedence rule when the two signals disagree.
4. **Chaos engineering**: build a small test harness that randomly kills replicas in a simulated fleet and asserts the router/gateway continues serving without dropped requests, then extend it to simulate network partitions between gateway and replica.
5. **Cost modeling**: given a traffic profile (requests/sec, average prompt/generation length) and GPU pricing, compute the cost difference between one full replica per tenant versus multi-LoRA serving for a given number of tenants — quantify the crossover point where multi-LoRA clearly wins.
6. **External practice sets**: system design interview question banks that include "design a scalable API" or "design a rate limiter" style problems (widely available in general system-design interview prep resources) — adapt them explicitly to the GPU-bound, stateful-KV-cache constraints specific to LLM serving rather than treating them as generic stateless-web-service problems.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Clients"] --> GW["Gateway\n(auth, rate limit, validation)"]
    GW --> Router["Router\n(least-conn / KV-cache-aware)"]

    subgraph Fleet["Inference Engine Fleet"]
        direction LR
        Rep1["Replica 1\nvLLM + GPU(s)"]
        Rep2["Replica 2\nvLLM + GPU(s)"]
        Rep3["Replica N\nvLLM + GPU(s)"]
    end

    Router --> Rep1
    Router --> Rep2
    Router --> Rep3

    subgraph Control["Control Plane"]
        Mon["Monitoring\n(TTFT, TPS, queue depth, GPU mem)"]
        AS["Autoscaler\n(scale up fast / down slow)"]
        Mon --> AS
    end

    Rep1 -.metrics.-> Mon
    Rep2 -.metrics.-> Mon
    Rep3 -.metrics.-> Mon
    AS -.add/remove replicas.-> Fleet

    Reg["Model / Adapter Registry\n(base models + LoRA adapters,\ncanary/stable pointers)"] --> Router
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Serving))
    Foundations
      Model server pattern
      Replicas
      Health checks: readiness vs liveness
    Routing
      Round robin
      Least connections
      KV-cache-aware / prefix-aware
    Scaling
      Autoscaling signals: queue depth, GPU mem, TTFT
      Scale up fast / down slow
      Warm capacity buffer
      Horizontal vs vertical (tensor parallelism)
      Multi-region
    Multi-tenancy
      Multi-model serving
      Multi-LoRA serving
      Tenant isolation
    Production Operations
      Deployment: canary / blue-green
      Monitoring: TTFT, TPS, queue depth, cost
      Testing: load test, chaos test
      Debugging escalation path
      Security: gateway boundary, isolation
    Advanced
      Disaggregated prefill/decode
      Serverless / scale-to-zero
      Priority tiers / admission control
    Ecosystem
      vLLM / TGI / Triton / TorchServe
      Managed endpoints
      Kubernetes / Docker
      MLOps
~~~
`,
};

export default serving;
