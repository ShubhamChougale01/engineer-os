import type { SkillContent } from "../types";

/**
 * AI Scaling — full 50-section knowledge page.
 * Code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const aiScaling: SkillContent = {
  overview: `
AI Scaling is the discipline of taking an AI inference system past the point where one GPU, one process, or one region can handle the traffic, and turning it into a fleet: many replicas behind a load balancer, autoscaled by demand, sometimes spanning multiple GPUs or multiple physical nodes for a single model, sometimes spanning multiple regions for latency, all while keeping cost per token and tail latency under control. Where the **Serving** skill covers how to build and operate a single well-behaved model server (health checks, routing, deployment, observability), AI Scaling is the layer above it: how do you go from "one healthy replica" to "a thousand healthy replicas, scaling elastically, some in Virginia and some in Frankfurt, some carrying a 70B-parameter model sharded across eight GPUs"? If Serving is "how you build the car," Scaling is "how you build the highway system, the traffic lights, and the fleet-management company running thousands of those cars at once."

This is fundamentally a capacity and systems problem layered on top of a GPU-bound workload with unusual cost and latency characteristics. Unlike a stateless web API where a request takes a few milliseconds of CPU, an LLM inference request can occupy a GPU for seconds, consumes gigabytes of KV-cache memory per active sequence, and the "unit of scale" (one GPU, or one node of GPUs for a large model) costs orders of magnitude more per hour than a commodity web server. Scaling decisions here are not just "add more boxes" — they involve model parallelism strategies (splitting a single model's weights or layers across multiple GPUs), autoscaling on GPU-specific signals instead of CPU utilization, absorbing cold-start latency that can run into tens of seconds, and making conscious cost-vs-throughput tradeoffs about GPU class, batch size, and region.

Key characteristics of this problem space: it sits at the intersection of distributed systems, hardware economics, and queueing theory; it must reconcile three often-competing goals — throughput (tokens served per dollar), latency (especially time-to-first-token under load), and elasticity (fast, safe reaction to demand that can 10x in minutes); and it increasingly has to support heterogeneous fleets — different model sizes, different GPU classes, different regions — rather than one homogeneous pool. This page assumes familiarity with **Inference** (the single-GPU algorithms: KV caching, continuous batching, quantization) and **Serving** (the single-service operational layer); it builds the multi-replica, multi-node, multi-region layer on top, and connects outward to **Kubernetes** and **Load Balancers** for the underlying infrastructure primitives, to **Latency** for the user-facing consequences of scaling decisions, and to **Cost Optimization** for the business tradeoffs.
`,

  history: `
Scaling stateless web services is a decades-old, largely solved problem; scaling GPU-bound generative AI inference is much younger and inherited ideas from several older fields rather than inventing everything from scratch.

| Era | Milestone |
|------|-----------|
| 1990s–2000s | Web-scale horizontal scaling matures: load balancers, stateless replicas, CPU/memory-based autoscaling (this is the playbook everyone reaches for first, and it is subtly wrong for GPU inference) |
| 2010s | High-performance computing (HPC) develops model/data parallelism for training huge neural networks across many nodes — tensor and pipeline parallelism concepts originate here, for training, not serving |
| 2017–2019 | Megatron-LM and GPipe formalize tensor parallelism and pipeline parallelism respectively as training techniques for models too large for one accelerator |
| 2020–2021 | GPT-3-class models (100B+ parameters) make it clear that a single GPU (even a large one) cannot hold some models' weights at all, forcing multi-GPU serving, not just multi-GPU training, into practical necessity |
| 2022 | ChatGPT's launch is the field's first mass lesson in traffic-spike reality: demand for LLM inference can grow 10-100x in days, and naive autoscaling built for web traffic fails badly under GPU cold-start latency |
| 2022–2023 | Serving frameworks (vLLM, TGI, Triton) add native tensor-parallel and pipeline-parallel serving modes, making multi-GPU serving a configuration choice rather than custom engineering |
| 2023 | Kubernetes-based custom-metrics autoscaling (KEDA, Prometheus Adapter) becomes the standard way to autoscale GPU inference on queue depth or GPU utilization instead of CPU% |
| 2023–2024 | Multi-region LLM deployment becomes common as latency-sensitive consumer products (chat assistants, copilots) need sub-second time-to-first-token globally, not just in one data center |
| 2024–2025 | Disaggregated prefill/decode scaling (scaling the compute-bound prefill phase and the memory-bound decode phase independently, sometimes on different GPU pools) and predictive/scheduled autoscaling for known traffic patterns become mainstream discussion points among serving platform teams |

The throughline: every scaling advance exists to answer "how do we serve far more concurrent demand than one GPU or one region can hold, without either overspending on idle capacity or falling over during a spike."
`,

  "why-it-exists": `
A single, well-tuned inference server (the subject of the **Serving** skill) has a hard ceiling: one machine, a fixed number of GPUs, a fixed maximum concurrency before requests start queueing or being rejected. Two forces push past that ceiling immediately in real products. First, demand: a successful AI feature routinely needs to serve far more concurrent users than a handful of GPUs can carry, and that demand is rarely flat — it has daily cycles, spikes around product launches or viral moments, and long-term growth. Second, model size: some models (large open-weight LLMs, mixture-of-experts models, multimodal models) simply do not fit in the memory of one GPU, no matter how well-optimized the serving stack is — scaling here is not optional, it is a precondition for running the model at all.

AI Scaling exists to close the gap between "this model runs well on one GPU for one user" and "this system serves an unpredictable, growing, global user base for a model that may itself require multiple GPUs just to load." That gap includes: deciding how many replicas to run and when to add or remove them (autoscaling), deciding how to split a too-large model across hardware (model parallelism), deciding how to route load-balanced traffic across a fleet fairly and efficiently (request sharding), planning how much hardware to buy or rent and at what GPU class (capacity planning), absorbing sudden traffic without falling over or wasting money on idle standby capacity (spike handling and cold starts), and serving users close to where they are so that network distance does not dominate latency (geographic scaling).

Scaling exists because inference optimization (**Inference**) answers "how fast is one GPU" and serving (**Serving**) answers "how do I run one healthy service," but neither answers "how many of these do I need, where do I put them, how do I grow and shrink that fleet automatically, and how do I split a model that does not fit on one GPU in the first place."
`,

  "problem-it-solves": `
Scaling infrastructure removes concrete, measurable pains that appear the moment a single-replica or single-node deployment meets real-world demand or real-world model sizes:

- **Hard capacity ceiling**: one replica (or one node) can only serve so many concurrent requests before queueing or rejecting; scaling adds replicas so aggregate capacity tracks demand rather than being fixed at whatever one box happened to provide.
- **Models that don't fit on one GPU**: some models' weights alone exceed a single GPU's memory; model parallelism (tensor and pipeline parallelism) splits the model itself across multiple GPUs or nodes so it can be served at all, not just served faster.
- **Wasted spend on idle capacity, or outages during spikes**: a fixed fleet size either overprovisions for the average case (paying for GPUs sitting idle most of the day) or underprovisions for the peak case (falling over exactly when the traffic matters most); autoscaling matches capacity to real-time demand.
- **Autoscaling on the wrong signal**: CPU utilization, the default metric in most autoscalers, is nearly meaningless for GPU-bound inference — a replica can be at 100% capacity (full KV cache, deep request queue) while its CPU sits at 20%; scaling built around GPU-aware signals (queue depth, GPU memory/utilization, in-flight request count) avoids scaling decisions that are simply wrong.
- **Cold-start latency invisibly breaking SLAs**: spinning up a new GPU replica involves provisioning hardware, pulling a container image, and loading multi-gigabyte model weights — this can take tens of seconds to minutes, and if that time is not accounted for in scale-up decisions, users experience the exact latency spike the autoscaler was supposed to prevent.
- **Geographic latency**: serving every user from one region means users far from that region pay for the network round-trip on every request; multi-region serving brings the model physically closer to users.
- **Thundering herd and correlated failure**: many replicas or many requests hitting a shared resource (a cache, a shared model registry, a shared control plane) at the same moment can cause cascading failures that look like capacity problems but are actually coordination problems.

What scaling deliberately does **not** solve:

- It does not make a single forward pass faster — that is the **Inference** skill's territory (KV caching, batching, quantization, speculative decoding); scaling determines how many such passes run in parallel and where.
- It does not solve the operational concerns of running one healthy replica (health checks, graceful shutdown, canary deploys) — that is **Serving**'s job; scaling assumes a working single-replica story and multiplies it.
- It does not replace general container/cluster orchestration knowledge — it is built on top of **Kubernetes** and **Load Balancers**, not a reinvention of them.
- It does not by itself guarantee low latency — see **Latency** for the user-facing budget this all serves, and note that scaling badly (e.g., ignoring cold starts) can make latency worse, not better.
`,

  "learning-objectives": `
By the end of this page you should be able to:

- Explain the difference between horizontal scaling (more replicas of the same model) and model parallelism (splitting one model across multiple GPUs), and identify which problem each one solves.
- Describe tensor parallelism and pipeline parallelism at a conceptual level: what gets split, what the communication pattern looks like, and why each introduces overhead.
- Design an autoscaling policy for a GPU inference fleet that reacts to queue depth and GPU utilization rather than CPU percentage, including asymmetric scale-up/scale-down behavior.
- Reason about cold-start latency as a first-class input to autoscaling design, not an afterthought, and describe at least three mitigation strategies.
- Sketch a request-sharding / load-balancing strategy across model replicas, including when session affinity or cache-aware routing beats plain round robin.
- Walk through a capacity-planning exercise that weighs GPU class, replica count, and expected traffic against a cost-per-token and latency budget.
- Describe why and when to serve a model from multiple geographic regions, and what that costs in complexity (data consistency, deployment fan-out, routing).
- Identify the most common scaling pitfalls (wrong autoscaling metric, ignoring load time, thundering herd on cache misses, over-fragmenting a model that would fit on fewer GPUs) and how to avoid each.
- Read and adapt a Kubernetes HorizontalPodAutoscaler manifest driven by a custom queue-depth metric for an inference deployment.
- Implement basic backpressure/load-shedding logic so a fleet degrades predictably instead of falling over when it is oversubscribed.
`,

  prerequisites: `
This page assumes comfort with the following; each has its own skill page on this platform if you need to backfill:

- **Inference**: what happens inside one GPU serving one model — KV cache, continuous batching, quantization — since scaling is about multiplying and distributing that unit of work, not replacing it.
- **Serving**: how a single model server is built and operated (health checks, routing, deployment) — scaling assumes this unit is solid and asks how to run many of them.
- **Kubernetes**: pods, deployments, services, and especially the HorizontalPodAutoscaler and custom-metrics concepts, since most production autoscaling for inference fleets is implemented on top of Kubernetes or a similar orchestrator.
- **Load Balancers**: basic load-balancing algorithms (round robin, least connections, consistent hashing) since request sharding across replicas builds directly on these.
- **Latency**: time-to-first-token, inter-token latency, and tail-latency concepts, since scaling decisions are ultimately judged against a latency budget.
- General distributed systems comfort: what a network partition is, why synchronous cross-node communication is expensive, and basic queueing intuition (Little's Law: average queue length equals arrival rate times average wait time) will make the model-parallelism and capacity-planning sections much easier to absorb.
- Basic familiarity with GPUs as a resource: that they have fixed memory, that model weights and KV cache both consume that memory, and that GPU-to-GPU communication (within a node via NVLink, across nodes via network) has a real cost, is assumed rather than re-derived here.
`,

  "beginner-concepts": `
**Horizontal scaling** is the simplest scaling idea: if one replica of your model server can handle N requests per second, run five replicas and, in principle, you can handle roughly 5N requests per second (traffic permitting even distribution). Each replica is a full, independent copy of the model server — same weights, same code, same configuration — so any replica can serve any request. A load balancer sits in front and decides which replica handles each incoming request. This is exactly the pattern used for scaling ordinary web servers, and it is the first tool to reach for whenever a single replica's capacity is the bottleneck and the model itself fits comfortably on one GPU.

**Vertical scaling**, for contrast, means making a single replica bigger or faster — a beefier GPU, more VRAM, a faster CPU host — rather than adding more replicas. Vertical scaling has a ceiling (there is a biggest GPU you can buy or rent) and does not help with availability (one bigger box is still one box that can fail); horizontal scaling has no such hard ceiling and inherently improves availability, since losing one of five replicas leaves four still serving traffic.

**Autoscaling** automates the decision of how many replicas to run. Instead of a human deciding "let's add three more replicas for the launch," an autoscaler watches a metric (like requests in flight, or CPU load in traditional web systems) and adds or removes replicas automatically to keep that metric within a target range. The beginner mental model is: pick a signal, pick a target value, and let a controller loop add or remove capacity to chase that target. The nuance that trips up newcomers to AI scaling specifically — covered in depth in **Advanced Concepts** and **Common Mistakes** — is that the "obvious" signal (CPU utilization) is a poor choice for GPU-bound inference workloads.

**Load balancing** is the mechanism that spreads incoming requests across replicas. The simplest strategy, round robin, sends each new request to the next replica in a rotating list, regardless of how busy each replica currently is. This works reasonably well when every request costs about the same amount of work, but LLM inference requests vary wildly in cost (a one-token classification call versus a multi-thousand-token generation), so smarter strategies (covered in **Intermediate Concepts**) are usually needed in practice.

**Replica** is the term for one running copy of the model server — typically bound to one GPU, though it can be bound to multiple GPUs when model parallelism is in play (see **Advanced Concepts**). Understanding "replica" as the atomic, independently-scalable unit is the foundation everything else in this page builds on.
`,

  "intermediate-concepts": `
**Autoscaling on GPU-aware signals.** The core intermediate insight is that CPU utilization, memory usage on the host, and even simple request-count-per-second are weak proxies for whether a GPU inference replica is actually saturated. Better signals include: **queue depth** (how many requests are waiting for a free execution slot — a leading indicator that a replica is oversubscribed), **GPU memory utilization** (how much of the GPU's VRAM is occupied by model weights, KV cache, and activations — approaching the ceiling means requests will soon be rejected or throttled), **in-flight request count relative to a known max concurrency**, and **trending time-to-first-token** (if TTFT is climbing even though request volume looks flat, the replica is likely GPU-compute-bound and about to fall further behind). A well-built autoscaler exports one or more of these as custom metrics and scales on them, not on CPU%.

**Asymmetric scale-up and scale-down.** Because adding capacity too slowly causes visible user pain (queueing, timeouts, dropped requests) while removing capacity too slowly only costs a little extra money, production autoscalers are deliberately asymmetric: they react to rising load within seconds, but require load to stay low for a sustained window (several minutes) before scaling down. This avoids "flapping" — rapidly adding and removing replicas in response to noisy, short-lived dips in traffic — which is expensive (every scale-up pays a cold-start cost) and can even destabilize the system.

**Request sharding across replicas.** Beyond simple round robin, production fleets often use **least-connections routing** (send each request to the replica with the fewest requests currently in flight, which adapts automatically to uneven request cost), **consistent hashing** (route requests with a shared key, such as a conversation ID, to the same replica so that stateful context — like a cached KV prefix — stays local), or **weighted routing** (send more traffic to replicas known to have more capacity, for example because they run on a bigger GPU or have a larger configured concurrency limit). The right choice depends on whether requests are stateless (round robin or least-connections is fine) or benefit from affinity (cache-aware or session-affinity routing wins).

**Capacity planning as a cost/throughput tradeoff.** Every additional replica costs GPU-hours; every added GPU-hour buys some amount of additional throughput, but not necessarily linearly — network overhead, load-balancer inefficiency, and shared bottlenecks (a shared database, a shared rate limiter, a shared model registry) mean returns can diminish as fleets grow. Intermediate capacity planning means expressing the tradeoff explicitly: given an expected peak requests-per-second and a latency SLA, what is the minimum fleet size (and GPU class) that meets both, and what does that cost per million tokens served? This calculation, revisited regularly as traffic and model choices change, is the connective tissue between engineering decisions and the business's unit economics — see **Cost Optimization**.

**Cold starts as a scaling-latency problem, not just an ops nuisance.** When an autoscaler decides to add a replica, that replica is not instantly useful: a new machine (or container) must be provisioned, the serving image pulled, and — often the dominant cost for large models — multi-gigabyte model weights loaded into GPU memory and, in some engines, JIT-compiled or warmed up. This can take anywhere from several seconds to a few minutes depending on model size, storage speed, and network bandwidth to the weight store. If a traffic spike takes thirty seconds to be visible in metrics, and the resulting new replica takes ninety seconds to become ready, the system was effectively under-provisioned for two full minutes regardless of how "reactive" the autoscaler looked on paper. Intermediate scaling design treats this end-to-end delay (detect → decide → provision → load → warm → ready) as the real quantity to optimize, not just the autoscaler's reaction time.
`,

  "advanced-concepts": `
**Model parallelism: when the model itself does not fit.** Horizontal scaling and autoscaling assume every replica can hold a full copy of the model. That assumption breaks for very large models — some open-weight LLMs and most large mixture-of-experts models exceed the memory of even the largest single GPUs available. Model parallelism splits a single model's weights and computation across multiple GPUs (and sometimes multiple physical nodes), so that one logical "replica" is really a coordinated group of GPUs working together on every request. This is qualitatively different from horizontal scaling: horizontal scaling adds independent copies that never talk to each other; model parallelism adds GPUs that must communicate on every forward pass. There are two dominant conceptual strategies, and hybrids of both are common in practice — think of the following as the standard mental models rather than a definitive ranking, since the right choice is genuinely workload- and hardware-dependent.

**Tensor parallelism** splits individual layers' computations (most commonly the large matrix multiplications inside attention and feed-forward blocks) across multiple GPUs, so that each GPU holds a slice of every layer's weights and all GPUs work on the same token(s) simultaneously, exchanging partial results (via an all-reduce style communication step) after each split operation. Because this communication happens many times per forward pass, tensor parallelism generally wants very fast interconnects between GPUs (such as NVLink within a single node) and tends to be used *within* a node rather than *across* nodes, where network latency would dominate. The upside is that it reduces per-token latency (all GPUs work on the same request concurrently) and is relatively simple to reason about; the downside is that communication overhead grows with the degree of parallelism, so splitting across more GPUs does not scale throughput linearly and eventually yields diminishing (or negative) returns.

**Pipeline parallelism** instead splits the model by layer groups — GPU 1 holds the first several transformer layers, GPU 2 holds the next several, and so on — and different requests (or different micro-batches of the same request stream) flow through the pipeline stage by stage, somewhat like an assembly line. Communication happens only at the boundaries between stages, which is far less frequent than tensor parallelism's per-operation communication, making pipeline parallelism more tolerant of slower interconnects and therefore more suitable for splitting a model *across* nodes, not just within one. The tradeoff is pipeline "bubbles" — GPUs sitting idle waiting for work to arrive from the previous stage, especially at the start and end of processing a batch — and added complexity in scheduling requests through the pipeline efficiently.

In practice, serving frameworks that support multi-GPU serving (vLLM, TGI, Triton, and others) typically expose these as configuration choices — a tensor-parallel degree and, less commonly for pure serving, a pipeline-parallel degree — rather than requiring you to implement the communication yourself. The engineering judgment call is choosing *how many* GPUs to split across and *which* strategy (or hybrid) fits a given model size, GPU generation, and interconnect topology; this is genuinely an area where the "right" answer shifts with hardware generations and framework releases, so treat any specific number of GPUs or specific strategy recommendation you read (including here) as a starting hypothesis to benchmark, not a fixed rule.

**Sharding requests versus sharding the model.** A subtlety worth naming explicitly: horizontal scaling shards *requests* across independent model copies; model parallelism shards the *model* across GPUs that jointly serve each request. These are not mutually exclusive — a common large-scale topology is several model-parallel groups (each spanning, say, 4 or 8 GPUs to hold one big model) running side by side, with a load balancer sharding requests across those groups exactly as it would across single-GPU replicas. Understanding which axis a given scaling decision operates on (more independent copies vs. more GPUs per copy) prevents a common confusion where teams add GPUs to a model-parallel group expecting more *throughput*, when in fact they needed another independent group to get that.

**Disaggregated prefill/decode serving.** An advanced pattern worth knowing conceptually: the prefill phase of generation (processing the input prompt) is compute-bound, while the decode phase (generating tokens one at a time) is memory-bandwidth-bound with very different batching characteristics. Some serving architectures scale these phases independently — dedicating separate GPU pools to prefill and decode and streaming intermediate KV-cache state between them — to avoid one phase's resource profile starving the other. This is an emerging pattern in high-scale deployments rather than a universal default, and adds meaningful operational complexity (state transfer between pools, more moving parts to monitor), so it is best understood as an option for teams already hitting real limits with simpler topologies, not a starting point.

**Hybrid parallelism in practice.** Real large-model deployments frequently combine tensor parallelism within a node (to exploit fast NVLink-class interconnects) with pipeline parallelism across nodes (to tolerate slower network links between machines), and layer horizontal scaling of whole hybrid groups on top of that for throughput. Some very large mixture-of-experts models add a third axis, expert parallelism, where different expert sub-networks live on different GPUs and requests are routed to only the experts they activate — conceptually similar to pipeline parallelism in that it reduces communication relative to naive full replication, but with its own load-balancing challenge (some experts are used far more often than others, so naive even sharding of experts across GPUs can leave some GPUs idle while others are overloaded). None of this changes the core mental model from this section — split the model, pay a communication cost, benchmark before committing — it simply means production topologies are often two or three of these strategies stacked together rather than a single pure strategy in isolation.

**Geographic/multi-region scaling** extends the same ideas across data centers: independent fleets (each potentially itself horizontally scaled and/or model-parallel) run in multiple regions, with a global load balancer or DNS-based routing sending each user to the nearest healthy region. This reduces network round-trip time, which can dominate perceived latency for users far from a single-region deployment, but multiplies operational complexity: model weights and configuration must be kept in sync across regions, regional capacity must each be independently autoscaled, and failover behavior (what happens when one region degrades) must be designed deliberately rather than assumed.
`,

  "internal-working": `
Mechanically, a scaled AI serving system is a control loop wrapped around a data-plane fleet. The data plane is the part users' requests actually flow through: a client sends a request to a gateway or load balancer, which selects a replica (or a model-parallel group of GPUs acting as one logical replica) using a routing strategy, the selected replica executes the forward pass (using whatever inference optimizations it has — batching, KV cache, quantization), and the response streams back through the same path. The control plane is the part that decides, continuously, how big the data plane's fleet should be and where its replicas live.

The control loop, in its simplest form, is: **observe → decide → act → wait**, repeated on a fixed interval (Kubernetes' HorizontalPodAutoscaler, for example, defaults to a 15-second evaluation interval). "Observe" means reading current metrics — queue depth, GPU utilization, request rate — usually from a metrics backend (Prometheus is the common choice) rather than by directly polling each replica synchronously, since synchronous polling of a large fleet on every control loop tick would itself become a bottleneck. "Decide" means comparing observed metrics against a target (for example, "keep average queue depth per replica below 5") and computing a target replica count. "Act" means issuing the actual scale-up or scale-down command to the orchestrator (create N new pods, or mark N pods for graceful termination). "Wait" means respecting cooldown windows so the loop does not react to every tiny fluctuation.

For model-parallel replicas, the internal working is more involved at "act" time: scaling a tensor-parallel group up or down is not a simple add-one-pod operation, because all GPUs in the group must start together, discover each other (typically via a rendezvous mechanism), and establish the collective-communication group (commonly built on NCCL for NVIDIA GPUs) before the replica can serve any traffic at all. This is one reason model-parallel replicas often have meaningfully longer and more failure-prone startup sequences than single-GPU replicas, and why some teams prefer to horizontally scale several smaller model-parallel groups rather than treat the whole model-parallel group itself as an elastic, frequently-resized unit.

Load balancing internally works by maintaining a live view of replica health and (for smarter strategies) load: a health check loop marks replicas ready/not-ready, and — for least-connections or queue-aware routing — the load balancer or gateway tracks an approximate in-flight count per replica, updated as requests start and finish, to make each routing decision. Session-affinity or cache-aware routing typically hashes some request attribute (a conversation ID, a shared system-prompt hash) to consistently pick the same replica for related requests, trading perfect load balance for cache locality.

Underneath both the control plane and the data plane, capacity itself is provisioned from an underlying compute layer — a cloud provider's GPU instance types, a self-managed GPU cluster, or a serverless GPU platform — and the internal working of "adding a replica" ultimately bottoms out in that layer's own provisioning mechanics: requesting an instance or container slot, attaching or mounting the GPU device, and (for containerized deployments) scheduling the workload onto a node with available GPU capacity via the orchestrator's scheduler. When no GPU capacity is available at all (every node in the cluster is already full), the orchestrator's own cluster-autoscaler (a layer beneath the application-level HPA discussed throughout this page) must first add a new physical or virtual node before a new replica pod can even be scheduled — an additional, often slower step that further lengthens the true cold-start chain for teams running self-managed clusters rather than a platform with instantly-available GPU capacity.
`,

  architecture: `
A representative production topology for a scaled AI serving system layers, from the outside in:

1. **Global/DNS layer** (only relevant for multi-region deployments): routes users to their nearest healthy region based on geography and region health, often via anycast DNS or a global load-balancing service.
2. **Regional gateway**: handles authentication, rate limiting, and request validation before any GPU work happens; this is the same gateway layer described in the **Serving** skill, present once per region in a multi-region topology.
3. **Router/load balancer**: chooses which replica (or model-parallel group) handles each request, using round robin, least-connections, weighted, or cache-aware routing as discussed in **Intermediate Concepts**.
4. **Autoscaler / control plane**: continuously watches fleet-wide metrics (queue depth, GPU utilization) via a metrics backend and adjusts the replica count within the region, issuing create/terminate commands to the orchestrator (typically Kubernetes, see **Kubernetes**).
5. **Replica fleet**: the data-plane workhorses — each replica is either a single-GPU model server or a model-parallel group of GPUs acting as one logical unit, running the inference engine (vLLM, TGI, Triton, or similar) described in **Inference** and **Serving**.
6. **Shared state and coordination services**: a metrics backend (Prometheus or similar), a model/weight store (often object storage such as S3-compatible storage, since weights are too large to bake into every container image cheaply), and sometimes a shared cache (for KV-cache-aware routing hints or for caching frequent responses) — all of which must themselves be scaled and made highly available, since they can become bottlenecks or single points of failure for the whole fleet even though they are not doing GPU work.

Within each replica in a model-parallel group, the internal architecture is a small distributed system of its own: a rank-0 process typically coordinates, weights are sharded according to the parallelism strategy (tensor-parallel shards of every layer, or pipeline-parallel contiguous layer ranges), and a collective-communication library handles the required cross-GPU data exchange on every forward pass (for tensor parallelism) or between pipeline stage boundaries (for pipeline parallelism).

~~~mermaid
flowchart TB
    Users((Users)) --> DNS[Global / DNS routing]
    DNS --> GW1[Regional Gateway - US]
    DNS --> GW2[Regional Gateway - EU]

    GW1 --> LB1[Router / Load Balancer]
    GW2 --> LB2[Router / Load Balancer]

    subgraph "Region: US"
      LB1 --> R1[Replica 1 - single GPU]
      LB1 --> R2[Replica 2 - single GPU]
      LB1 --> MP1["Model-Parallel Group
      (4 GPUs, tensor-parallel)"]
      Auto1[Autoscaler] -. watches queue depth / GPU util .-> LB1
      Auto1 -. scale up/down .-> R1
      Auto1 -. scale up/down .-> R2
    end

    subgraph "Region: EU"
      LB2 --> R3[Replica 3 - single GPU]
      LB2 --> MP2["Model-Parallel Group
      (4 GPUs, tensor-parallel)"]
    end

    R1 & R2 & MP1 & R3 & MP2 --> Metrics[(Metrics backend
    e.g. Prometheus)]
    Metrics --> Auto1
    R1 & R2 & MP1 & R3 & MP2 --> Weights[(Weight store
    e.g. object storage)]
~~~
`,

  "data-flow": `
Trace one request through a scaled, geographically distributed fleet to see how the pieces interlock:

1. A user's client sends a request; DNS or a global load balancer resolves it to the nearest healthy region based on the user's location and current region health.
2. The regional gateway authenticates the request, applies rate limits, and validates the payload — rejecting malformed or unauthorized requests before they consume any GPU capacity.
3. The router selects a target replica or model-parallel group using its configured strategy (round robin, least-connections, weighted, or cache-aware), consulting its live view of replica health and load.
4. If the chosen unit is a single-GPU replica, the request is queued (if execution slots are full) or begins executing immediately, following the mechanics in **Inference** (prefill, then token-by-token decode, with continuous batching alongside other in-flight requests).
5. If the chosen unit is a model-parallel group, the request enters the group's coordinated execution: for tensor parallelism, every GPU in the group processes its shard of every layer for this token, exchanging partial activations via collective communication after each split operation, on every forward pass; for pipeline parallelism, the request's computation moves stage by stage across GPUs, with the request potentially interleaved with other requests' micro-batches to keep every stage busy.
6. Generated tokens stream back through the same router and gateway path to the client, typically via a streaming HTTP/SSE or gRPC connection so time-to-first-token is not blocked on full completion.
7. Throughout, each replica emits metrics (queue depth, GPU utilization, tokens/sec, request latency) to the shared metrics backend.
8. The autoscaler's control loop reads aggregated metrics on its evaluation interval, compares them to target thresholds, and — if warranted — issues a scale-up (provision new replica: allocate GPU, pull image, load weights, pass health checks, become routable) or a scale-down (mark a replica for graceful drain: stop routing new requests to it, let in-flight requests finish, then terminate) command to the orchestrator.
9. If demand crosses a region-level threshold or a region degrades, the global routing layer shifts a larger share of new users toward healthier or less-loaded regions, closing the loop at the geographic level as well as the replica level.

The end-to-end latency a user actually experiences is the sum of network transit to the nearest region, queueing time behind other requests at the chosen replica, and the model's own compute time — which is why scaling decisions (adding a replica, choosing a nearer region, avoiding an oversubscribed model-parallel group) directly move the number a user perceives as "the app feels slow," even though no single component individually looks broken.
`,

  "production-usage": `
In production, AI scaling shows up as a set of concrete operational patterns rather than an abstract idea:

- **Fleets sized to a peak-with-headroom target, not an average**: teams provision enough replicas (plus a safety margin, often 20-30%) to comfortably handle a recent observed or forecast peak, then let autoscaling handle everything below that ceiling, rather than trying to provision for the theoretical worst case at all times.
- **Warm pools / pre-provisioned standby capacity**: because cold starts are slow (see **Common Mistakes**), many production fleets keep a small number of idle-but-ready replicas on standby specifically to absorb the first seconds of a spike while slower, fully cold replicas are still provisioning.
- **Scheduled scaling for known patterns**: traffic with predictable daily or weekly cycles (business-hours chat assistants, batch report-generation jobs) is often scaled proactively on a schedule (scale up before the morning traffic ramp, scale down before the overnight lull) rather than purely reactively, trading a little wasted capacity for eliminating cold-start lag during predictable ramps.
- **Model-parallel groups reserved for models that genuinely require them**: production teams generally benchmark whether a model fits (with acceptable batch size and KV-cache headroom) on a single GPU or a single node before reaching for multi-node model parallelism, since model parallelism's communication overhead and operational complexity are a real cost, not a free throughput multiplier.
- **Multi-region deployment reserved for genuinely latency-sensitive or globally-distributed user bases**: many production systems run happily in a single region with a CDN or edge cache in front for static assets, reserving true multi-region model serving for products where cross-continent network latency measurably hurts the user experience or where regulatory data-residency requirements demand it.
- **Cost dashboards tied directly to scaling knobs**: mature teams track cost-per-million-tokens or cost-per-request alongside latency and error-rate dashboards, because scaling decisions (replica count, GPU class, parallelism degree, region count) are simultaneously latency decisions and cost decisions — see **Cost Optimization**.
- **Spot/preemptible GPU capacity for latency-tolerant workloads**: teams running batch or offline inference workloads (as opposed to interactive chat) commonly mix in cheaper, preemptible GPU capacity for part of their fleet, accepting occasional interruption in exchange for meaningfully lower cost, while keeping interactive-facing replicas on stable, non-preemptible capacity.
- **Explicit per-tenant quotas in multi-tenant deployments**: production platforms serving multiple internal or external tenants from a shared fleet typically enforce per-tenant rate limits and concurrency quotas at the gateway layer, independent of overall fleet autoscaling, so that one tenant's traffic surge cannot silently consume capacity that other tenants are paying for or depending on.
`,

  "industry-examples": `
- **Consumer chat assistants** (the ChatGPT/Claude/Gemini class of product) run large fleets of replicas per model version, often with multiple GPU classes serving different tiers of paid vs. free traffic, autoscaled aggressively around daily usage cycles and product-launch spikes, with multi-region deployment for global latency.
- **API-first LLM providers** (Together AI, Fireworks, Anyscale, Groq, Replicate, and similar) build their entire business around serving efficiency at scale: aggressive autoscaling, careful GPU-class selection per model size, and (for the largest open-weight models they host) tensor-parallel or pipeline-parallel serving across multi-GPU nodes, since their customers pay per token and margin depends on throughput per dollar of GPU spend.
- **Managed cloud endpoints** (Amazon SageMaker, Google Vertex AI, Azure Machine Learning managed endpoints) expose autoscaling and multi-instance serving as configuration rather than infrastructure teams have to build themselves, abstracting much of the control loop described in **Internal Working** behind a managed API — useful context for when to build custom scaling infrastructure versus buying it.
- **Search and recommendation systems at large e-commerce and social platforms** scale embedding-model and ranking-model inference horizontally to extreme replica counts (often far larger fleets than generative LLM deployments, because per-request latency budgets are much tighter — tens of milliseconds, not seconds) — a useful contrast showing that "scaling" tuning differs meaningfully between low-latency, high-QPS classical inference and higher-latency, more expensive generative inference.
- **Enterprise internal AI platforms** (a company running a shared internal LLM gateway for many internal teams) typically prioritize multi-tenant isolation and priority tiers over raw scale, since their traffic is smaller and more predictable than consumer-facing products, but still need real autoscaling to avoid paying for GPUs sitting idle overnight and on weekends.
- **Voice and real-time multimodal assistants** (speech-to-speech or video-analysis products) push latency and cold-start sensitivity further than text chat, since even a few hundred milliseconds of extra queueing is perceptible in a live conversation; these systems tend to lean more heavily on warm standby pools and pre-scaled floors rather than pure reactive autoscaling, accepting some idle-capacity cost as the price of a usable real-time experience.
- **Batch and offline inference pipelines** (bulk document summarization, dataset labeling, embedding generation for a large corpus) represent the opposite end of the spectrum from consumer chat: they tolerate much higher latency per request in exchange for maximizing throughput per dollar, so their scaling strategy typically favors large, tightly-packed batches and spot/preemptible GPU capacity over the low-latency-oriented replica sizing a chat product would choose — a useful reminder that "scaling" tuning is not one-size-fits-all even within one company's overall AI infrastructure.
`,

  "best-practices": `
- **Autoscale on GPU-aware signals** (queue depth, GPU utilization, in-flight request count, TTFT trend), never on CPU utilization alone, for the reasons detailed in **Common Mistakes**.
- **Make scale-up fast and scale-down conservative**: react to rising load within seconds where possible, but require sustained low load over several minutes before removing capacity, to avoid flapping and to keep a margin against the next spike.
- **Treat cold-start time as part of your latency SLA, not a separate concern**: measure the full detect-to-ready time for a new replica and factor it explicitly into how early the autoscaler needs to react, or maintain warm standby capacity to bridge the gap.
- **Benchmark before reaching for model parallelism**: confirm a model genuinely does not fit (with your target batch size and KV-cache headroom) on a single GPU or single node before splitting it across multiple GPUs or nodes, since the communication overhead and operational complexity are real and ongoing costs.
- **Prefer several independent model-parallel groups over one giant one** when throughput, not just fitting the model, is the goal — remember that model parallelism shards the model, it does not by itself add throughput the way horizontal scaling does.
- **Design explicit backpressure**: return fast, clear errors (HTTP 429 or 503 with a Retry-After header) when the fleet is oversubscribed, rather than letting requests queue indefinitely and time out slowly — a fast, clear failure is almost always better for both users and downstream systems than a slow, ambiguous one.
- **Guard against thundering herd on cache misses**: when many replicas or many requests can simultaneously miss a shared cache (a newly deployed model version, a cold CDN, a shared rate-limiter store) and all retry the same expensive path at once, use jittered backoff, request coalescing, or a lock/singleflight pattern so one miss does not become an avalanche of redundant work.
- **Tie every scaling decision to a cost-per-token or cost-per-request number**: capacity planning divorced from unit economics tends to either overspend quietly or hit a budget wall unexpectedly — see **Cost Optimization**.
- **Test scaling behavior deliberately**, not just steady-state serving: load-test the actual scale-up path (does a fresh replica really become healthy and start taking traffic within your assumed window?), not just throughput at a fixed fleet size.
- **Choose multi-region deployment for a measured reason** (latency data showing real user impact, or a data-residency requirement), not by default, since it multiplies operational surface area (deployment fan-out, configuration drift risk, cross-region failover design).
- **Keep rollback at least as fast as rollout**: verify reverting a bad deploy does not itself require a full cold-start cycle across the fleet, since a slow rollback turns a contained incident into an extended one.
- **Revisit autoscaling parameters as the fleet's scale changes**: evaluation intervals, cooldown windows, and step sizes tuned for a ten-replica fleet are frequently wrong (too slow or too twitchy) once that fleet grows tenfold — treat autoscaler configuration as something to periodically re-tune, not a set-once setting.
`,

  "anti-patterns": `
- **Autoscaling on CPU utilization for a GPU-bound workload**: the classic and most damaging anti-pattern — CPU can sit low while the GPU (and the request queue behind it) is fully saturated, so the autoscaler never triggers when it should.
- **Ignoring model load time in scale-up latency**: treating "add a replica" as instantaneous in capacity planning, then being surprised when a spike outlasts the newly-provisioned replica's readiness, or worse, when the new replica becomes ready just after the spike has already passed and the fleet oscillates.
- **Reaching for multi-node model parallelism before confirming the model doesn't fit more simply**: splitting a model across multiple nodes when it would have fit tensor-parallel on a single node's GPUs (or even on one GPU with quantization), paying ongoing cross-node communication overhead for no real benefit.
- **Treating a model-parallel group as an elastic, frequently-resized unit** the same way a single-GPU replica is treated: this ignores that resizing the group means the whole group's collective-communication topology has to be re-established, which is slower and more failure-prone than adding one independent replica.
- **Uniform round-robin routing when requests have wildly uneven cost**: a short classification call and a multi-thousand-token generation call routed with equal probability to every replica leads to some replicas backing up while others sit idle; least-connections or load-aware routing is usually a better default for generative workloads.
- **Thundering herd on shared resources at scale-up time**: many freshly-started replicas all hitting the same weight store, config service, or cache simultaneously on startup, overwhelming a shared dependency that was never designed for a fleet-wide cold start.
- **Unbounded queueing instead of backpressure**: letting requests pile up indefinitely when the fleet is oversubscribed instead of failing fast, which turns a capacity problem into a much worse latency and timeout-cascade problem for every downstream caller.
- **Symmetric scale-up/scale-down aggressiveness**: scaling down just as eagerly as scaling up, which causes flapping — rapid oscillation between adding and removing replicas — each cycle paying a fresh cold-start cost.
- **Multi-region deployment adopted as a default "best practice" rather than for a measured reason**: taking on the real complexity of cross-region consistency, deployment fan-out, and failover design without a latency or compliance requirement that actually needs it.
- **Capacity planning based on average load rather than peak plus headroom**: sizing a baseline fleet for the average traffic hour guarantees it falls over during every above-average hour, pushing all the real work onto an autoscaler that may not react fast enough given cold-start latency.
`,

  performance: `
Performance for a scaled fleet is measured differently than performance for a single replica (covered in **Inference** and **Serving**): the relevant questions are about the fleet's aggregate and tail behavior, not just one replica's best-case number.

**Aggregate throughput** is the fleet-wide tokens-per-second or requests-per-second the system can sustain, which is *not* simply single-replica throughput multiplied by replica count — load-balancing inefficiency (uneven request costs poorly distributed by round robin), shared-resource contention (a shared rate limiter, database, or cache), and model-parallel communication overhead (if any replicas are model-parallel groups) all cause real-world aggregate throughput to fall short of the naive multiplication. Measuring aggregate throughput under realistic, uneven request-cost distributions — not synthetic uniform load — is essential to avoid overestimating fleet capacity.

**Tail latency under scaling transitions** matters as much as steady-state latency: the moments right after a scale-up event (new, possibly still-warming replicas receiving traffic) and right before a scale-down event (draining replicas still finishing in-flight requests) are where p99 latency often spikes even though average latency looks fine. Dashboards and SLOs should account for these transition windows explicitly, not just steady-state performance.

**Model-parallel overhead** shows up as a tax on both latency and throughput: tensor parallelism adds a communication round-trip on every split operation, so per-token latency for a tensor-parallel replica is not simply "the same as one GPU, but the model fits now" — it typically includes real, measurable communication latency, especially over slower interconnects. This overhead is why benchmarking a specific model, GPU generation, and interconnect combination (rather than trusting a general rule) is the only reliable way to know whether a given parallelism degree helps or hurts.

**Autoscaler reaction time versus true readiness time** is the single most consequential performance gap in scaling systems: an autoscaler that "reacts in 15 seconds" is not actually providing new capacity in 15 seconds if the resulting replica takes another 60-90 seconds to load weights and pass health checks — the true performance metric to track is end-to-end time from load-spike detection to new capacity actually serving traffic, and every mitigation discussed in **Advanced Concepts** and **Best Practices** (warm pools, scheduled scaling, faster weight loading) is aimed squarely at shrinking that number.

**Performance under partial degradation** deserves separate measurement from performance under full health: a fleet where one of ten replicas is silently slow (a GPU with a hardware issue, a replica stuck behind a noisy neighbor on shared infrastructure) will show a barely-moved fleet average but a clearly elevated p99, since roughly one in ten requests lands on the slow replica. Tracking per-replica performance distributions, not just fleet-wide aggregates, is what actually surfaces this class of problem before it grows (see **Monitoring**).
`,

  scalability: `
Scalability, in this skill's specific sense, is about how far the patterns above extend before they themselves need to change.

**Horizontal scaling of stateless replicas** scales close to linearly for a wide range of fleet sizes, as long as the load balancer, shared metrics backend, and any shared dependencies (rate limiters, weight stores, caches) are themselves scaled to handle a large fleet's aggregate load — these shared components, not the replicas, are usually the first thing to become a bottleneck as fleets grow into the hundreds or thousands of replicas.

**Model parallelism scales the maximum servable model size**, not throughput, in the following precise sense: a tensor-parallel or pipeline-parallel group lets you serve a model that would not fit at all on one GPU, and increasing the parallelism degree can further reduce per-token latency up to a point — but past that point, communication overhead dominates and adding more GPUs to a single group yields diminishing or negative returns. Real throughput scaling, once a model fits acceptably on some group size, comes from running more independent groups (horizontal scaling at the group level), not from continuing to grow one group.

**Autoscaling scales in responsiveness, not just size**: a control loop tuned for a fleet of ten replicas (checking every 15 seconds, requiring a few consecutive over-threshold readings before acting) may be too slow or too noisy for a fleet of a thousand replicas experiencing much larger absolute swings in request volume, and conversely, autoscaling logic tuned for a huge, gradually-changing fleet can be needlessly conservative for a small, spiky one. Autoscaling parameters (evaluation interval, cooldown windows, scale-up/scale-down step sizes) generally need re-tuning as a fleet's scale and traffic pattern change, not a set-once configuration.

**Multi-region scaling introduces a new axis of complexity that does not reduce to "more of the same"**: each additional region multiplies deployment and configuration surface area, requires its own capacity planning and autoscaling tuning (since regional traffic patterns can differ meaningfully — different peak hours by timezone, different user behavior), and requires an explicit strategy for cross-region failover and consistency (what happens to a user's session if their region degrades mid-conversation) that has no single-region analog.

**Scalability is ultimately bounded by cost, not just engineering capability**: every one of these techniques can, in principle, be pushed further — more replicas, higher parallelism degrees, more regions — but each increment has a real, often nonlinear cost, which is why capacity planning (see **Production Usage** and **Cost Optimization**) is as much a scalability practice as any of the technical mechanisms above.

**Organizational scalability** is a less technical but equally real dimension: a fleet that a small team can operate comfortably at ten replicas in one region can become unmanageable at a thousand replicas across five regions if the operational tooling (dashboards, alerting, deployment automation, on-call runbooks) does not scale alongside the infrastructure itself. Teams that grow their fleet faster than their operational tooling commonly report exactly the symptom this page warns about repeatedly: outages traced back to a shared dependency, a misconfigured region, or a wrong autoscaling metric that nobody had reviewed since the fleet was much smaller — a reminder that scaling is as much a process and tooling discipline as an infrastructure one.
`,

  security: `
Scaling introduces its own security surface beyond what a single replica needs to worry about:

- **Fleet-wide credential and secret management**: every replica in a large, autoscaled fleet needs access to the same secrets (weight-store credentials, API keys, database connections); a compromised or misconfigured replica image multiplies the blast radius across the whole fleet instead of one machine, making secret rotation and least-privilege scoping per replica more important, not less, as fleets grow.
- **Cross-region data residency and compliance**: multi-region deployment can inadvertently move user data (prompts, generated content, logs) across jurisdictional boundaries if routing and logging are not deliberately scoped per region, which can violate data-residency requirements (for example, GDPR-style constraints on EU user data) even when no individual component looks obviously wrong.
- **Autoscaler and orchestrator access control**: the control plane that can spin up or tear down replicas is a high-value target — if compromised, an attacker could scale a fleet down to zero (denial of service) or scale up unauthorized workloads at the victim's expense; the orchestrator's API and the autoscaler's permissions should be scoped as tightly as any other production control plane.
- **Thundering-herd-driven denial of service, self-inflicted or adversarial**: a coordinated burst of requests (malicious or accidental, such as a buggy retry loop in a client) can trigger a scale-up storm that either overwhelms shared dependencies (see **Anti-Patterns**) or runs up cost dramatically before rate limiting or backpressure kicks in — scaling systems should be designed assuming some load spikes are adversarial, not just organic.
- **Tenant isolation at fleet scale**: in multi-tenant deployments, ensure request sharding and routing logic cannot be manipulated (for example, via a crafted request header) to force a request onto a specific replica or region in a way that leaks another tenant's cached state or context — routing logic is part of the security boundary, not just a performance mechanism.
- **Supply-chain risk multiplied by fleet size**: a vulnerable base image or dependency deployed to one replica is, by construction, deployed identically to every replica in an autoscaled fleet; image scanning and staged rollout (see **Deployment**) reduce the chance that a vulnerability reaches the entire fleet at once.

For the broader treatment of authentication, authorization, prompt injection, and data protection for AI systems, see the **Security** skill; this section covers only the concerns specific to running many replicas across a fleet or across regions.

- **Autoscaler-driven cost attacks**: because autoscaling directly translates request volume into spend, an attacker (or a misbehaving internal client) that can generate cheap requests at high volume can force expensive scale-up behavior disproportionate to the actual value delivered; rate limiting and per-tenant quotas at the gateway layer are as much a cost-control and security measure as a fairness one.
- **Image and configuration drift across a large fleet**: as fleets grow across regions and over time, configuration or image versions can silently drift between replicas or regions if deployment automation is incomplete, creating an inconsistent security posture (some replicas patched, others not) that is easy to miss without automated drift detection.
`,

  testing: `
Testing a scaled system requires exercising the scaling behavior itself, not just steady-state request handling:

- **Load testing the scale-up path**: drive synthetic traffic that ramps up faster than steady state and verify that new replicas actually become healthy and start serving within the assumed window — testing only steady-state throughput at a fixed fleet size misses exactly the cold-start and control-loop-latency problems that cause real outages.
- **Load testing the scale-down path**: verify that draining replicas finish in-flight requests gracefully rather than dropping them, and that scale-down does not trigger prematurely on a brief, temporary dip in load.
- **Chaos-testing replica failure**: kill a replica mid-request and confirm the load balancer's health checks detect it and reroute subsequent traffic within an acceptable window, and that in-flight requests to the killed replica fail cleanly (with retry logic on the client side, if appropriate) rather than hanging.
- **Testing model-parallel group startup and failure**: for any tensor-parallel or pipeline-parallel deployment, explicitly test what happens when one GPU in the group fails or is slow to start — does the whole group correctly fail to become ready (as it generally must, since a partial group cannot serve correctly), and does the orchestrator retry the whole group rather than getting stuck?
- **Testing autoscaling metric plumbing end-to-end**, not just the autoscaler's logic in isolation: verify that the custom metric (queue depth, GPU utilization) is actually being exported correctly, actually reaches the metrics backend, and actually triggers the expected scaling action — a surprisingly common production failure mode is an autoscaler that is correctly configured but silently receiving stale or zero metrics.
- **Regional failover testing**: for multi-region deployments, simulate a full region outage and verify traffic correctly and quickly reroutes to healthy regions, and that the remaining regions' autoscalers react fast enough to absorb the redirected load.
- **Backpressure and load-shedding testing**: deliberately oversubscribe the fleet in a test environment and confirm it degrades as designed — fast, clear errors for excess load — rather than degrading into slow timeouts or cascading failures.

See **Testing** (the general skill) for broader test-strategy fundamentals; the items above are the scaling-specific additions on top of that foundation.

- **Testing uneven-cost request mixes, not just uniform synthetic load**: a load test that sends identical, short requests to every replica will never reveal a routing-strategy problem that only appears with a realistic mix of cheap and expensive requests; include representative variance in request cost (short and long generations, cache-hit and cache-miss prompts) in load tests.
- **Testing shared-dependency behavior under simultaneous full-fleet cold start**: deliberately scale a large batch of replicas up at once in a test environment and confirm the weight store, config service, and metrics pipeline all hold up, rather than only ever testing gradual, one-at-a-time scale-up in staging.
`,

  debugging: `
Debugging scaling issues generally starts from one of a few symptom patterns, each pointing toward a different root cause:

- **Latency spikes that correlate with traffic ramps, not steady-state load**: strongly suggests the autoscaler is reacting too slowly relative to true replica readiness time (cold-start latency), or that scale-up thresholds are set too conservatively; check the full detect-to-ready timeline for recently added replicas, not just the autoscaler's own decision latency.
- **CPU-based autoscaling metrics that look fine while users report slowness**: a classic sign of autoscaling on the wrong signal — check queue depth and GPU utilization directly, since a GPU-bound replica can be fully saturated with idle-looking CPU.
- **Uneven load across replicas despite a working load balancer**: usually a routing-strategy mismatch — round robin on requests with highly uneven cost, or a broken/uneven consistent-hash distribution — check per-replica request-count and in-flight-count metrics, not just the fleet aggregate.
- **A model-parallel replica that never becomes ready, or becomes ready very slowly**: check whether all GPUs in the group actually started and can reach each other (a common cause is a network policy or firewall blocking the collective-communication port between nodes), and whether weight loading is bottlenecked on network bandwidth to the weight store.
- **Sudden fleet-wide slowdowns immediately after a scale-up or deploy**: check for thundering-herd effects on shared dependencies — many new replicas hitting the same weight store, config service, or cache simultaneously can look like a mysterious global slowdown that is actually contention on one shared resource.
- **Flapping fleet size (rapid, repeated scale-up/scale-down cycles)**: check for symmetric or overly sensitive scale-down thresholds, missing cooldown windows, or an autoscaling metric that is inherently noisy (a very short averaging window on queue depth, for example).
- **One region degraded while others look healthy in a multi-region deployment**: check regional autoscaler configuration drift (did one region's thresholds get updated and not the others?) and confirm the global routing layer is actually detecting and rerouting around the degraded region rather than continuing to send it a full share of traffic.

Correlating metrics across the whole stack (autoscaler decisions, replica readiness timestamps, load-balancer routing distribution, and per-replica GPU/queue metrics) on one shared timeline is usually the fastest way to distinguish these root causes from each other, since the symptoms (user-visible latency, errors) look similar across very different underlying problems.

- **Requests succeeding but unusually slow only for a specific subset of users**: check whether that subset maps to a specific region (a regional capacity or routing issue) or a specific session-affinity/cache key (a hot-spotting issue on one replica), since both look identical from a single aggregate dashboard but require very different fixes.
- **Autoscaler repeatedly hitting its configured maximum replica count during peak traffic**: distinguish between "the maximum is genuinely too low for current demand" (a capacity-planning gap — raise the ceiling and re-benchmark cost) and "something is silently consuming far more capacity per request than expected" (a regression in request cost, worth investigating before simply raising the ceiling).
`,

  monitoring: `
A scaled fleet needs monitoring at three levels, each answering a different question:

**Fleet-level (aggregate) metrics** answer "is the system healthy overall": total requests per second, aggregate error rate, fleet-wide p50/p95/p99 latency, current replica count versus target, and overall cost per million tokens. These are the dashboards used for day-to-day health checks and for spotting slow trends (steadily rising baseline replica count week over week, for example, as a capacity-planning signal).

**Per-replica metrics** answer "which specific part of the fleet is struggling": queue depth, GPU memory utilization, GPU compute utilization, in-flight request count, and time-to-first-token, broken out per replica rather than averaged — averages hide a single degraded or overloaded replica behind a healthy-looking fleet mean, which is why alerting on the *distribution* of per-replica latency (or on the maximum, not just the average) catches problems that a fleet-average dashboard would miss.

**Scaling-event metrics** answer "is the control loop itself behaving correctly": scale-up and scale-down event frequency (a flapping fleet shows up here immediately), time from metric-threshold-crossed to scale command issued, and — critically — time from scale command issued to new replica actually passing health checks and receiving traffic, which is the true cold-start number discussed throughout this page.

Alerting should be built around leading indicators, not just lagging ones: queue depth rising is a leading indicator of latency degradation that has not happened yet, and alerting on it early (before p99 latency itself breaches an SLO) buys time to react, whereas alerting only on latency SLO breaches means the user impact has already occurred by the time anyone is paged.

For multi-region deployments, add region-level dashboards showing per-region traffic share, per-region health, and cross-region failover events, since a single global dashboard can hide a problem localized to one region behind healthy numbers from the others. See **Monitoring** (the general skill) for broader observability fundamentals this section builds on.

**Dashboards worth building explicitly**, beyond ad-hoc metric graphs: a "cold-start timeline" view plotting the gap between scale-decision timestamp and replica-ready timestamp across recent scale-up events (the single most diagnostic view for the pitfalls this page emphasizes); a "replica heatmap" showing queue depth or GPU utilization per replica over time, so a single struggling replica is visually obvious rather than buried in an average; and a "cost vs. throughput" view plotting cost-per-million-tokens alongside replica count and GPU class over time, connecting scaling decisions directly to the unit-economics conversation in **Cost Optimization**.
`,

  deployment: `
Deploying changes (a new model version, a config change, an engine upgrade) to a scaled, potentially multi-region fleet carries more risk than deploying to a single replica, and needs a deliberately staged rollout strategy:

- **Canary deployment**: route a small percentage of traffic (or a small number of replicas) to the new version first, monitor latency, error rate, and output quality against the existing fleet, and only promote to full traffic after the canary looks healthy for a sustained period — this contains the blast radius of a bad change to a small slice of users rather than the whole fleet.
- **Rolling deployment**: replace replicas with the new version incrementally (a few at a time), keeping the majority of the fleet on the known-good version until each batch of new replicas passes health checks, rather than replacing every replica simultaneously.
- **Blue-green deployment**: stand up a full parallel fleet running the new version, verify it, then cut traffic over (often instantly, via the load balancer or router), keeping the old fleet available for immediate rollback if something is wrong — more expensive (briefly running two full fleets) but gives the fastest, safest rollback path.
- **Region-by-region rollout for multi-region deployments**: deploy to one region first, let it bake and absorb real traffic for a period, then roll out to remaining regions in sequence, rather than deploying to every region simultaneously — this is the geographic analog of canary deployment and catches region-specific issues (a misconfigured regional secret, a region-specific dependency version) before they hit every region at once.
- **Model-parallel groups deployed as a unit**: because a tensor-parallel or pipeline-parallel group must start and establish its communication topology together, deployments to model-parallel replicas generally replace the whole group atomically rather than rolling GPU-by-GPU within a group.
- **Autoscaler awareness of in-progress deployments**: a rollout that is simultaneously being autoscaled can interact badly if not coordinated — for example, an autoscaler scaling up more replicas of the *old* version mid-rollout because it does not distinguish versions — so deployment tooling generally needs the autoscaler to scale each version's replica pool independently during a transition.

See **Deployment** (the general skill) and **Kubernetes** for the broader orchestration mechanics (rolling update strategies, readiness gates) this section specializes for a scaled AI fleet.

**Rollback speed matters as much as rollout safety**: a deployment strategy is only as good as how quickly it can be undone once a problem is detected, so verify, before relying on any of the above strategies in production, that reverting to the previous known-good version is itself fast (ideally not requiring a full cold-start cycle for every replica) — blue-green deployment's kept-warm old fleet is specifically valuable here, since rollback becomes a routing change rather than a fresh deployment.
`,

  "production-checklist": `
Before considering a scaled AI serving deployment production-ready, verify:

- Autoscaling is driven by GPU-aware signals (queue depth, GPU utilization, in-flight count), not CPU utilization alone.
- Scale-up and scale-down thresholds are asymmetric: fast reaction to rising load, sustained-window requirement before scaling down.
- The true end-to-end cold-start time (detect → decide → provision → load weights → pass health checks → serve traffic) has been measured directly, not assumed, and is factored into how early the autoscaler needs to react.
- A warm standby pool or scheduled scaling covers known traffic patterns where reactive autoscaling alone would be too slow.
- Load-balancing strategy matches request-cost variability (least-connections or weighted routing considered, not just round robin, if request cost varies significantly).
- Backpressure/load-shedding returns fast, clear errors (429/503 with Retry-After) when the fleet is oversubscribed, instead of unbounded queueing.
- Any model-parallel groups have been benchmarked against simpler alternatives (single GPU with quantization, or a smaller parallelism degree) to confirm the added complexity is actually necessary.
- Shared dependencies (weight store, metrics backend, config service, cache) have themselves been load-tested against a full fleet's simultaneous startup, to catch thundering-herd risk before it happens in production.
- Multi-region deployment (if used) has an explicit, tested failover story for a full region outage, and region-level dashboards exist separately from the global aggregate.
- Deployment rollouts use canary or rolling strategy with real health-check gates, not simultaneous full-fleet replacement.
- Cost-per-million-tokens or cost-per-request is tracked on the same dashboard as latency and error rate, so capacity decisions are visibly tied to unit economics.
- Alerting exists on leading indicators (queue depth trend) as well as lagging ones (latency SLO breach), so on-call engineers get warning before user impact, not only after.
- Chaos/failure testing has been run against replica crashes, model-parallel group partial failure, and simulated region outages, not just steady-state load.
`,

  "common-mistakes": `
- **Autoscaling on CPU utilization**: by far the most common and most damaging mistake for GPU-bound inference — the fix is to autoscale on queue depth, GPU memory/utilization, or in-flight request count instead, exported as custom metrics.
- **Not accounting for model load time in scale-up latency**: assuming a new replica is available the moment the autoscaler issues a scale-up command, when in reality provisioning, image pull, and multi-gigabyte weight loading can take tens of seconds to minutes — the fix is to measure true end-to-end readiness time and either react earlier or maintain warm standby capacity.
- **Thundering herd on cache misses or shared-dependency startup**: many replicas or requests simultaneously missing a shared cache or hitting a shared weight store at once, overwhelming it — the fix is jittered backoff, request coalescing/singleflight patterns, and load-testing shared dependencies against full-fleet cold starts.
- **Over-fragmenting a model across too many GPUs**: reaching for a high tensor-parallel degree "to be safe" when the model would have fit acceptably on fewer GPUs, paying ongoing communication overhead for no benefit — the fix is benchmarking the smallest parallelism degree that fits before scaling it up.
- **Symmetric scale-up/scale-down sensitivity, causing flapping**: reacting to load dips as eagerly as load spikes, repeatedly adding and removing replicas — the fix is asymmetric thresholds (fast up, slow/sustained-window down).
- **Unbounded queueing instead of backpressure**: letting requests pile up indefinitely under oversubscription instead of failing fast — the fix is explicit backpressure returning fast, clear errors once capacity is exceeded.
- **Deploying to an entire fleet simultaneously**: no canary or rolling stage, so a bad config or model version takes down 100% of capacity at once — the fix is canary or rolling deployment with real health-check gates.
- **Adopting multi-region deployment without a measured need**: taking on cross-region complexity (consistency, deployment fan-out, failover design) without latency data or a compliance requirement that actually demands it.
- **Treating a model-parallel group as freely and frequently resizable** like an independent single-GPU replica, ignoring that resizing means re-establishing the whole group's communication topology.
- **Capacity-planning for average load instead of peak plus headroom**, guaranteeing the fleet is undersized during every above-average period and relying entirely on an autoscaler that may not react fast enough given cold-start latency.
`,

  "common-errors": `
- **"CrashLoopBackOff" or repeated failed readiness checks on newly scaled-up replicas**: often caused by insufficient time allotted for weight loading before the readiness probe begins checking, or by a model-parallel group's rank-0 process timing out waiting for other ranks to join — the fix is a longer initial-delay on readiness probes for GPU replicas, and verifying network connectivity between nodes in a model-parallel group.
- **"OOMKilled" on GPU replicas under load**: usually caused by KV-cache growth under high concurrency exceeding configured memory limits, sometimes exacerbated by a burst of long-context requests routed disproportionately to one replica — the fix is tighter concurrency/queue limits per replica and load-aware (not round-robin) routing.
- **Autoscaler stuck at minimum or maximum replica count despite metrics clearly warranting a change**: usually a misconfigured or missing custom-metrics pipeline (the metric never actually reaches the autoscaler, or is stale) — verify the metrics pipeline end-to-end before assuming the autoscaler's decision logic is wrong.
- **Sudden spike in request timeouts immediately following a scale-up event**: a classic thundering-herd signature — many new replicas simultaneously hitting a shared weight store or config service on startup and starving each other's loading process — the fix is staggering replica startup or scaling shared-dependency capacity ahead of fleet growth.
- **"NCCL timeout" or similar collective-communication errors in a model-parallel deployment**: indicates GPUs in the parallel group cannot reach each other over the network within the expected time, commonly due to a firewall/security-group rule blocking the required ports, or a node placement that puts group members on a slower network path than expected.
- **429/503 responses appearing under load that used to succeed**: usually a sign that backpressure/load-shedding is working as designed under genuine oversubscription — the fix (if this is unexpected) is to check whether the autoscaler is keeping pace with demand, not to disable the backpressure itself.
- **Requests intermittently landing on a stale or unhealthy replica right after a scale-down or deploy**: usually a race between the load balancer's health-check propagation delay and the replica's actual drain/termination timing — the fix is ensuring graceful shutdown (stop accepting new requests, finish in-flight ones, then terminate) with a delay that exceeds the load balancer's health-check interval.
`,

  faqs: `
**Q: Should I always prefer more, smaller replicas over fewer, bigger ones?**
A: Usually yes for availability and elasticity (finer-grained scaling, smaller blast radius per failure), but it depends on whether the model fits on the smaller GPU class at all, and on fixed per-replica overhead (each replica has some baseline memory and startup cost) that can make very small replicas inefficient. Benchmark for your specific model and traffic pattern rather than assuming one direction is always right.

**Q: When do I actually need tensor or pipeline parallelism instead of just running the model on one bigger GPU?**
A: When the model's weights (plus KV cache for your target batch size and context length) genuinely exceed the memory of the largest single GPU you're willing to use, or when quantization alone cannot close that gap acceptably. Confirm this with an actual memory-fit calculation and benchmark before committing to the added operational complexity of model parallelism.

**Q: Is tensor parallelism or pipeline parallelism "better"?**
A: Neither is universally better; they suit different situations. Tensor parallelism tends to fit within a single, fast-interconnect node and reduces per-token latency but has communication overhead on every operation; pipeline parallelism tolerates slower, cross-node interconnects better but introduces pipeline "bubbles" and scheduling complexity. Many production systems use a hybrid, and the right split depends on model architecture, GPU generation, and interconnect topology — treat this as something to benchmark for your specific setup, not a fixed rule.

**Q: How much standby/warm capacity should I keep?**
A: There is no universal number — it depends on how spiky your traffic is, how long your true cold-start time is, and how much idle-capacity cost you're willing to accept as insurance. A common starting point is enough warm capacity to absorb the traffic growth expected during your measured cold-start window, then tune from observed spike behavior.

**Q: Do I need multi-region serving?**
A: Only if you have evidence that cross-region network latency measurably hurts your users (for latency-sensitive, globally distributed traffic) or a regulatory requirement for data residency. It is a real complexity and cost multiplier, not a default best practice.

**Q: What's the single biggest scaling mistake teams make?**
A: Autoscaling on CPU utilization for a GPU-bound workload, closely followed by not accounting for true cold-start latency in scale-up timing. Both are covered in depth in **Common Mistakes**.

**Q: How does scaling interact with cost?**
A: Directly and continuously — every scaling knob (replica count, GPU class, parallelism degree, region count) is simultaneously a cost lever. See **Cost Optimization** for the business-facing tradeoffs this page's technical decisions feed into.

**Q: Can I autoscale a model-parallel group the same way I autoscale single-GPU replicas?**
A: Only at the level of adding or removing whole groups, not by resizing an individual group's GPU count on the fly — resizing would require re-establishing the group's entire communication topology, which is slow and disruptive. Treat each model-parallel group as the atomic scaling unit, and scale throughput by running more (or fewer) whole groups.

**Q: Is it ever correct to scale a fleet down to zero replicas?**
A: For a latency-sensitive, always-on service, generally no — scaling to zero reintroduces the full cold-start penalty for the very first request after any idle period, which is usually unacceptable for user-facing latency. Scale-to-zero can be reasonable for genuinely bursty, latency-tolerant workloads (some batch or internal-tooling use cases) where the cost savings of true zero-idle capacity outweigh the occasional cold-start hit.

**Q: What is the relationship between backpressure and autoscaling — do I need both?**
A: Yes, and they solve different timescales of the same problem: autoscaling adds capacity over seconds-to-minutes to meet sustained demand growth, while backpressure protects the system in the much shorter window before that new capacity is ready (or if demand exceeds even your maximum configured fleet size). A system with only autoscaling and no backpressure will still fail badly during the gap described throughout this page as the cold-start problem.
`,

  "interview-questions": `
1. **What is the difference between horizontal scaling and model parallelism, and what problem does each solve?** (Horizontal scaling adds independent replicas to handle more concurrent requests; model parallelism splits a single model across GPUs so it can be served at all when it doesn't fit on one GPU. They address different constraints — request volume vs. model size — and are often combined.)
2. **Why is CPU utilization a poor autoscaling signal for GPU inference workloads?** (A GPU can be fully saturated — full KV cache, deep request queue — while host CPU usage stays low, since the bottleneck is GPU compute/memory, not CPU; better signals are queue depth, GPU utilization, and in-flight request count.)
3. **Explain tensor parallelism versus pipeline parallelism conceptually.** (Tensor parallelism splits individual layers' computation across GPUs, with all GPUs working on the same token(s) and exchanging partial results frequently — suited to fast, within-node interconnects. Pipeline parallelism splits the model into sequential layer groups across GPUs, with communication only at stage boundaries — more tolerant of slower, cross-node interconnects, but introduces idle "bubble" time.)
4. **Why can adding more GPUs to a tensor-parallel group eventually reduce throughput rather than increase it?** (Communication overhead — the all-reduce-style exchange after every split operation — grows with the degree of parallelism; past some point, that overhead outweighs the benefit of more compute, especially over slower interconnects.)
5. **What is a cold start in the context of GPU inference scaling, and why does it matter for autoscaling design?** (The time between deciding to add a replica and that replica actually being ready to serve traffic — provisioning, image pull, and weight loading can take tens of seconds to minutes; if the autoscaler does not account for this, a spike can pass before new capacity is ready, or the fleet can oscillate.)
6. **Describe at least three mitigations for cold-start latency.** (Warm standby pools of pre-provisioned idle replicas; scheduled/predictive scaling ahead of known traffic patterns; and reacting earlier on a leading indicator like queue-depth trend rather than waiting for a latency SLO breach.)
7. **What is thundering herd in a scaling context, and give a concrete example in AI serving.** (Many replicas or requests simultaneously hitting the same shared resource at once — e.g., many freshly scaled-up replicas simultaneously pulling the same multi-gigabyte weights from a shared store, overwhelming its bandwidth and slowing every replica's startup.)
8. **Why should scale-up and scale-down thresholds be asymmetric?** (Slow reaction to rising load causes visible user-facing pain quickly; slow reaction to falling load only costs a little extra money — so systems react fast to spikes but require a sustained low-load window before removing capacity, avoiding costly flapping.)
9. **When would you choose least-connections or weighted routing over simple round robin for request sharding?** (When requests have significantly uneven cost — e.g., short vs. long generations — round robin can leave some replicas overloaded and others idle; load-aware routing adapts to actual in-flight work per replica.)
10. **What tradeoffs does multi-region serving introduce beyond lower latency?** (Deployment and configuration fan-out across regions, the need for independently tuned regional autoscaling, cross-region failover design, and potential data-residency/compliance complexity.)
11. **How would you design backpressure for an oversubscribed inference fleet?** (Return a fast, explicit error, such as HTTP 429/503 with a Retry-After header, once queue depth or in-flight count exceeds a safe threshold, instead of allowing unbounded queueing that leads to slow timeouts and cascading failure.)
12. **How do you do capacity planning for a GPU inference fleet?** (Establish expected peak requests-per-second and a latency SLA, determine the minimum replica count and GPU class that meet both via benchmarking, add headroom for safety margin, and express the result as a cost-per-token figure to weigh against the business's unit economics.)
13. **Why might fleet-average latency dashboards hide a real production problem?** (Averages can look healthy even when a subset of replicas — or one region — is badly degraded, because good-performing replicas mathematically pull the average back down; per-replica and tail (p99, max) metrics catch localized problems an average hides.)
14. **What is the difference between scaling a fleet and scaling a single model-parallel group, and why does that distinction matter operationally?** (Scaling a fleet means adding or removing independent replicas or groups, which is fast and low-risk per unit; resizing a single model-parallel group means tearing down and re-establishing its entire cross-GPU communication topology, which is slow and higher-risk — so throughput scaling should come from adding more groups, not repeatedly resizing one.)
15. **Why is scaling to zero replicas usually a bad idea for a latency-sensitive service?** (It reintroduces the full cold-start penalty — provisioning, image pull, weight loading — for the very first request after any idle period, which is normally unacceptable when users expect a fast response at all times; a nonzero warm floor avoids this at the cost of some idle-capacity spend.)
`,

  "coding-questions": `
1. **Implement a least-connections router** that tracks in-flight request counts per replica and routes each new request to the replica with the fewest active requests, updating counts as requests start and finish.
2. **Implement a token-bucket or sliding-window backpressure gate** in front of a mock inference handler that returns HTTP 429 with a Retry-After header once a configured maximum in-flight count is exceeded.
3. **Simulate cold-start-aware autoscaling**: given a stream of synthetic request-arrival timestamps and a fixed per-replica capacity, write a simple control loop that decides when to scale up, incorporating a configurable "time to ready" delay, and report how many requests would have been queued or rejected under different scale-up reaction thresholds.
4. **Implement request coalescing (singleflight)** for a cache-miss scenario: given concurrent requests for the same cache key that all miss simultaneously, ensure only one actual expensive fetch/compute happens and all callers receive its result, rather than each triggering a redundant fetch.
5. **Write a Kubernetes HorizontalPodAutoscaler manifest** (see the worked example in **Hands-on Labs**) that scales an inference Deployment based on a custom queue-depth metric rather than CPU, and explain each field's purpose.
6. **Implement a weighted round-robin router** where each replica has a configured capacity weight (e.g., based on GPU class), and requests are distributed proportionally to those weights rather than evenly.
7. **Write a health-check-aware load balancer** that removes a replica from rotation after N consecutive failed health checks and re-adds it only after M consecutive successful checks, and explain why asymmetric N and M values might be chosen.
8. **Simulate a thundering herd scenario** where multiple simulated replicas "start up" simultaneously and all request the same shared resource at once with no jitter; then fix it by adding randomized jitter/backoff to each replica's startup request and show the reduced peak concurrent load on the shared resource.
`,

  "hands-on-labs": `
**Lab 1: Autoscale an inference deployment on queue depth, not CPU, with Kubernetes.**

The following is a runnable, annotated Kubernetes manifest set showing a HorizontalPodAutoscaler driven by a custom "queue depth" metric (exposed by the inference server and scraped by Prometheus, exported to Kubernetes via a metrics adapter such as the Prometheus Adapter or KEDA). This directly implements the "autoscale on GPU-aware signals" best practice from earlier in this page.

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-inference
  labels:
    app: llm-inference
spec:
  replicas: 2                       # starting point; HPA will adjust this
  selector:
    matchLabels:
      app: llm-inference
  template:
    metadata:
      labels:
        app: llm-inference
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: inference-server
          image: my-registry/vllm-server:latest
          resources:
            requests:
              nvidia.com/gpu: 1
              memory: "24Gi"
            limits:
              nvidia.com/gpu: 1
              memory: "24Gi"
          ports:
            - containerPort: 8000
          readinessProbe:
            # Weights are multi-GB; give the replica real time to load
            # before the load balancer sends it traffic. This directly
            # addresses the "cold start not accounted for" pitfall.
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 45
            periodSeconds: 5
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 60
            periodSeconds: 15
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-inference-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-inference
  minReplicas: 2                    # warm floor: never scale to zero for
                                     # a latency-sensitive service
  maxReplicas: 20
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0  # react to spikes immediately
      policies:
        - type: Percent
          value: 100                # can double capacity in one step
          periodSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300 # require 5 sustained minutes of
                                       # low load before removing capacity
      policies:
        - type: Pods
          value: 1                    # remove at most 1 replica per step
          periodSeconds: 60
  metrics:
    - type: Pods
      pods:
        metric:
          name: inference_queue_depth   # custom metric, NOT cpu
        target:
          type: AverageValue
          averageValue: "5"              # target: avg 5 queued requests
                                          # per replica
~~~

Try it: deploy this to a cluster with GPU nodes and the Prometheus Adapter (or KEDA) configured to surface an "inference_queue_depth" metric from your inference server's "/metrics" endpoint. Generate a synthetic traffic ramp (a simple load-testing script issuing an increasing rate of requests) and observe, in your metrics dashboard, the gap between when queue depth crosses the threshold and when a new replica actually reaches Ready — that gap is the real cold-start number this page has emphasized throughout.

**Lab 2: Implement load shedding / backpressure in front of a mock inference handler.**

This Python snippet demonstrates admission control: reject excess requests fast with a clear, retryable error instead of queueing them indefinitely, directly implementing the backpressure best practice.

~~~python
import time
import threading
from dataclasses import dataclass, field

@dataclass
class BackpressureGate:
    """Admission control for a single inference replica.

    Tracks in-flight request count and rejects new requests once a
    configured maximum concurrency is reached, instead of letting
    them queue unboundedly.
    """
    max_in_flight: int
    _in_flight: int = field(default=0, init=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False)

    def try_admit(self) -> bool:
        """Returns True if the request may proceed, False if it should
        be rejected immediately (fast failure instead of queueing)."""
        with self._lock:
            if self._in_flight >= self.max_in_flight:
                return False
            self._in_flight += 1
            return True

    def release(self) -> None:
        with self._lock:
            self._in_flight = max(0, self._in_flight - 1)


def handle_request(gate: BackpressureGate, request_id: str) -> dict:
    """Simulates handling one inference request with admission control."""
    if not gate.try_admit():
        # Fail fast with a retryable error instead of unbounded queueing.
        # A real HTTP layer would return 429/503 with a Retry-After header.
        return {
            "status": 429,
            "error": "capacity_exceeded",
            "retry_after_seconds": 2,
            "request_id": request_id,
        }
    try:
        # Simulate GPU work (replace with a real forward-pass call).
        time.sleep(0.05)
        return {"status": 200, "result": f"generated-for-{request_id}"}
    finally:
        # Always release, even on error, so capacity isn't leaked.
        gate.release()


if __name__ == "__main__":
    gate = BackpressureGate(max_in_flight=10)
    # Simulate 30 concurrent requests against a 10-slot gate: expect
    # roughly 10 succeed immediately, the remainder are shed with 429s
    # rather than queueing and eventually timing out.
    results = []
    threads = []
    for i in range(30):
        t = threading.Thread(
            target=lambda i=i: results.append(handle_request(gate, f"req-{i}"))
        )
        threads.append(t)
        t.start()
    for t in threads:
        t.join()

    accepted = sum(1 for r in results if r["status"] == 200)
    shed = sum(1 for r in results if r["status"] == 429)
    print(f"accepted={accepted}, shed={shed}")  # sanity check the gate works
~~~

Extend it: replace the "time.sleep" placeholder with a real call into your inference engine, add a Prometheus counter for shed requests (this becomes your queue-depth/oversubscription signal for the autoscaler in Lab 1), and experiment with how "max_in_flight" should relate to your GPU's actual safe concurrency limit.

**Lab 3: Reason through a capacity-planning exercise.** Given an expected peak of 500 requests/second, an average generation length of 300 tokens, a single-replica sustainable throughput of 40 requests/second at your target latency SLA, and a chosen GPU class costing a known hourly rate, calculate the minimum replica count (with a 25% headroom margin), the resulting cost per million tokens served, and how that changes if you instead choose a bigger, more expensive GPU class with double the per-replica throughput. This is deliberately open-ended arithmetic — the goal is practicing the tradeoff, not memorizing one answer.

**Lab 4: Simulate thundering herd and fix it with jitter.** Write a short script that spins up N simulated "replicas" (simple worker functions) that all start at exactly the same timestamp and each immediately issue a request to a shared, rate-limited mock resource (a function that sleeps briefly and fails if more than a fixed number of concurrent callers hit it at once). Run it once with all N workers starting simultaneously and record the failure rate; then re-run with each worker sleeping a small random jitter (for example, a uniform random delay between 0 and 2 seconds) before its first request, and compare failure rates. This demonstrates, hands-on, why staggered/jittered startup is a standard mitigation for the thundering-herd pitfall described in **Common Mistakes**, and why simply retrying immediately on failure (without jitter) tends to make the problem worse rather than better, since synchronized retries recreate the same collision.

**Lab 5: Compare fleet cost and latency across a horizontal-only design and a model-parallel design.** Using either real benchmarking (if you have multi-GPU hardware available) or published throughput/latency figures you can verify from current framework documentation, build a small comparison table for a hypothetical target model: option A, several single-GPU replicas each running a smaller or quantized version of the model; option B, fewer tensor-parallel groups each spanning multiple GPUs running the full-precision model. For each option, estimate aggregate throughput, p99 latency, and cost per million tokens, and write a short recommendation for which you would choose for a latency-sensitive consumer chat product versus a cost-sensitive batch-processing pipeline. This exercise deliberately has no single correct answer — the point is practicing the tradeoff analysis, not memorizing a verdict.
`,

  "real-projects": `
- **Build a self-hosted, autoscaled inference fleet on Kubernetes**: deploy an open-weight model with vLLM or TGI behind a Kubernetes Deployment and Service, wire up a custom-metrics-based HPA (as in Lab 1), and load-test it with a traffic generator that ramps aggressively, then measure and report your true cold-start latency and tune warm-pool size against it.
- **Implement a load-aware gateway**: build a small proxy (in your language of choice) in front of two or more mock or real inference replicas that implements least-connections routing and backpressure (as in Lab 2), and compare its p99 latency and rejection rate against plain round robin under a synthetic uneven-cost request mix.
- **Benchmark tensor-parallel serving on a multi-GPU machine**: if you have access to a multi-GPU node, serve the same model at tensor-parallel degree 1, 2, and 4, and measure per-token latency and throughput at each degree to directly observe the diminishing-returns curve described in **Advanced Concepts**.
- **Design (on paper or in a simulation) a multi-region deployment** for a hypothetical global chat product: choose regions, define a routing strategy, define a regional-outage failover plan, and estimate the added infrastructure cost versus the latency improvement for users in each region.
- **Build a capacity-planning spreadsheet or small program** that takes expected peak QPS, average tokens per request, single-replica throughput, and GPU hourly cost as inputs, and outputs required replica count (with headroom), estimated fleet cost per hour, and cost per million tokens — then use it to compare two or three GPU-class options.
- **Instrument and visualize the full cold-start timeline**: add timestamped logging at each stage of a replica's startup (provisioning requested, image pulled, weights loading started, weights loaded, first successful health check, first request served) and build a simple dashboard or script that plots this breakdown across several scale-up events, to see concretely which stage dominates your specific cold-start time and where mitigation effort would pay off most.
- **Implement a simple singleflight/request-coalescing cache wrapper** and use it in front of a simulated shared resource (a mock weight-metadata lookup or config fetch) to demonstrate, with a load test, how it prevents a thundering-herd spike of redundant concurrent fetches when many callers request the same key at once right after a deploy or scale-up.
`,

  "case-studies": `
- **A consumer AI chat product absorbing a viral traffic spike**: teams operating large chat assistants have publicly discussed traffic growing many times over within days of a feature launch or press moment; the operational lesson repeatedly drawn from these episodes is that reactive autoscaling alone, without pre-provisioned headroom or scheduled scaling ahead of an anticipated launch, tends to produce visible user-facing degradation during the first hours of a spike, precisely because cold-start time cannot be shortened away entirely — only planned around.
- **API-first inference providers competing on cost-per-token**: businesses whose entire value proposition is serving open-weight models cheaper and faster than alternatives have to treat capacity planning (GPU class selection, parallelism degree, replica sizing) as a core, continuously revisited part of the product, not a one-time infrastructure decision, because their margin is directly the gap between what they charge per token and what their GPU fleet costs to run per token.
- **A large model that would not fit on the team's available GPU class**: a recurring pattern reported across teams serving very large open-weight models is discovering, sometimes only when moving from experimentation to production traffic, that a model's memory footprint (weights plus KV cache at real production batch sizes and context lengths) exceeds a single GPU's memory, forcing an after-the-fact move to tensor-parallel serving — the general lesson drawn is to do the memory-fit calculation against realistic production batch size and context length *before* committing to a serving architecture, not after.
- **Global products serving users across continents from a single region**: teams operating internationally have found that network round-trip time to a single, distant data center can dominate a user's perceived latency far more than any model-side optimization, which is the concrete, measured justification (rather than a default assumption) that ultimately motivates multi-region deployment for genuinely global products.

- **A shared internal AI platform team serving many product teams from one fleet**: a pattern commonly described by platform engineering teams supporting multiple internal consumers from a single shared inference fleet is that a single misbehaving internal client (a retry loop without backoff, or a batch job accidentally issuing far more concurrent requests than expected) can trigger a scale-up storm that either exhausts a shared budget or starves other, better-behaved internal teams of capacity — the lesson generally drawn is that per-tenant rate limiting and priority tiers are as important as raw autoscaling capacity once a fleet has more than one type of internal consumer.

Because specific companies' internal capacity numbers, exact traffic figures, and unpublished architecture details are not reliably verifiable from public information, this section describes patterns commonly discussed in industry engineering blogs and conference talks rather than citing unverified specific incidents; treat the above as representative scenarios to reason about, not verbatim case reports.
`,

  comparisons: `
| Dimension | Horizontal Scaling | Model Parallelism (Tensor/Pipeline) |
|---|---|---|
| What it splits | Requests, across independent full-model replicas | The model itself, across GPUs that jointly serve each request |
| Solves | Insufficient throughput/concurrency for a model that fits on one GPU | A model too large to fit on one GPU at all |
| Adds communication overhead? | No (replicas are independent) | Yes, on every forward pass (tensor) or at stage boundaries (pipeline) |
| Scales throughput? | Yes, close to linearly (shared-dependency limits aside) | Not directly — mainly enables fitting the model; throughput scaling still comes from running more parallel groups |
| Typical interconnect need | Standard network between replicas is fine | Tensor parallelism wants fast, low-latency interconnect (e.g., within a node); pipeline tolerates slower, cross-node links better |
| Failure/scaling granularity | One replica can fail or scale independently | Whole group must start/fail/scale together |

| Dimension | Autoscaling on CPU% | Autoscaling on Queue Depth / GPU Utilization |
|---|---|---|
| Reflects real GPU saturation? | Poorly — GPU can be saturated while CPU is idle | Directly reflects the actual bottleneck resource |
| Common in | Traditional web-service autoscaling (borrowed by mistake for GPU workloads) | Purpose-built GPU/LLM serving autoscaling |
| Risk if used for GPU inference | Scale-up triggers too late, or never, under real saturation | Correctly triggers on the resource that is actually constrained |

| Dimension | Single-Region Serving | Multi-Region Serving |
|---|---|---|
| Latency for distant users | Dominated by network round-trip to the one region | Reduced by serving from the nearest healthy region |
| Operational complexity | Lower — one fleet, one autoscaler, one deployment pipeline | Higher — per-region tuning, cross-region failover design, deployment fan-out |
| When justified | Regional or smaller-scale user base, no data-residency constraint | Globally distributed, latency-sensitive user base, or regulatory data-residency needs |

| Dimension | Round Robin / Least-Connections Routing | Cache/Session-Affinity Routing |
|---|---|---|
| Goal | Even load distribution across replicas | Reuse of cached state (KV-cache prefix, conversation context) on the same replica |
| Best for | Stateless, independent requests with variable cost | Multi-turn conversations, shared system prompts, workloads where cache locality saves real compute |
| Risk | None distinctive — the safe, simple default | Can create hot spots if one affinity key (a very active conversation or popular shared prefix) draws disproportionate traffic to one replica |

| Dimension | HPA on Built-in Resource Metrics (CPU/Memory) | HPA/KEDA on Custom Metrics (Queue Depth, GPU Util) |
|---|---|---|
| Setup complexity | Lower — works out of the box | Higher — requires exporting a custom metric and wiring a metrics adapter |
| Accuracy for GPU inference | Poor — CPU/memory are weak proxies for GPU saturation | Accurate — reflects the actual bottleneck resource |
| Recommended for | Non-GPU, CPU-bound services | GPU-bound inference fleets (the subject of this page) |

For the underlying single-service concerns these comparisons build on top of, see **Serving**; for the raw compute-optimization techniques (independent of how many replicas or regions are involved), see **Inference**; for the orchestration primitives referenced throughout (Deployments, autoscalers, health checks), see **Kubernetes**.
`,

  "related-technologies": `
- **Kubernetes**: the dominant orchestrator for implementing horizontal scaling and autoscaling of GPU inference fleets in self-hosted deployments; its HorizontalPodAutoscaler, custom-metrics adapters, and readiness/liveness probes are the concrete mechanisms behind much of this page's control-loop discussion.
- **KEDA (Kubernetes Event-Driven Autoscaling)**: a common addition on top of Kubernetes specifically for scaling on external or custom metrics (queue depth from a message broker, or custom Prometheus metrics) rather than the built-in resource metrics.
- **Prometheus (and compatible metrics backends)**: the typical metrics-collection layer that queue depth, GPU utilization, and other custom autoscaling signals flow through before reaching the autoscaler.
- **Load Balancers**: the request-routing layer (covered in depth in its own skill) whose algorithms (round robin, least-connections, consistent hashing) this page applies specifically to model-replica sharding.
- **vLLM, TGI, Triton Inference Server**: serving engines (covered in **Serving** and **Inference**) that implement tensor-parallel and sometimes pipeline-parallel serving as a configuration option, turning the conceptual parallelism strategies in this page into something you enable with a flag rather than hand-build.
- **NCCL and similar collective-communication libraries**: the low-level machinery that actually performs the cross-GPU data exchange required by tensor and pipeline parallelism; understanding that this exchange has a real network/interconnect cost is the practical takeaway, without needing to implement it directly.
- **Managed inference platforms** (SageMaker, Vertex AI, Azure ML endpoints, and serverless GPU platforms like Modal or RunPod): these implement much of this page's control-plane logic (autoscaling, multi-replica routing) behind a managed API, trading control for reduced operational burden.
- **Cost Optimization**: the business-facing sibling skill covering how scaling decisions (replica count, GPU class, parallelism degree, region count) translate into budget tradeoffs.
- **Latency**: the sibling skill covering the user-facing latency budget (time-to-first-token, tail latency) that every scaling decision in this page is ultimately judged against.
- **Docker**: the containerization layer beneath most scaled deployments; image size and layer caching directly affect cold-start time, since a smaller, well-cached image pulls faster during a scale-up event.
- **Monitoring**: the general observability skill whose fundamentals (metrics, dashboards, alerting) this page specializes into the specific fleet-level, per-replica, and scaling-event signals covered in this page's own **Monitoring** section.
- **MLOps**: the broader operational discipline this page's scaling patterns sit inside of, covering model versioning, rollout, and lifecycle management alongside the infrastructure concerns emphasized here.
`,

  "latest-updates": `
As of this page's knowledge cutoff (early-to-mid 2025 training data), several trends were actively developing in this space and are worth verifying against current sources before treating as settled fact:

- **Disaggregated prefill/decode serving** (scaling the compute-bound prefill phase and the memory-bandwidth-bound decode phase on separate, independently-scaled GPU pools) was moving from research discussion toward production adoption at the largest-scale serving platforms, though it remained a specialized pattern for teams already hitting real limits with simpler topologies rather than a mainstream default.
- **KV-cache-aware and prefix-aware routing** (directing requests with a shared prompt prefix to a replica already holding that prefix's cached state) was gaining adoption as a load-balancing refinement specifically for multi-turn conversational and shared-system-prompt workloads.
- **Predictive/scheduled autoscaling informed by traffic forecasting** (rather than purely reactive threshold-based scaling) was an active area of tooling development, aimed squarely at the cold-start problem this page emphasizes.
- **Serverless GPU platforms** offering per-second billing and rapid (though still non-instant) cold starts were maturing as an alternative to self-managed Kubernetes-based scaling for teams that prioritize operational simplicity over the deepest control.

Given how quickly serving-framework capabilities and managed-platform offerings change, verify current framework support for any specific parallelism strategy, autoscaling integration, or managed-platform feature against that project's or vendor's current documentation rather than relying solely on this page.
`,

  "future-roadmap": `
Directions this space is plausibly heading, offered as informed hypotheses rather than settled predictions:

- **More automatic, less manually-tuned parallelism selection**: serving frameworks increasingly aim to auto-select a reasonable tensor/pipeline parallelism configuration for a given model and hardware, reducing the amount of manual benchmarking this page currently recommends — though hedged, hand-benchmarking is likely to remain valuable for performance-critical deployments for the foreseeable future.
- **Wider adoption of disaggregated prefill/decode architectures** as tooling matures and the operational complexity of running separate pools becomes more manageable, particularly at the largest serving platforms where the efficiency gains justify the added complexity.
- **Deeper integration between autoscalers and cost-awareness**, for example autoscaling policies that factor spot/preemptible GPU pricing or multi-cloud cost differences directly into scale-up decisions, not just capacity.
- **Improved cold-start times** via faster weight-loading techniques (streaming weight loads, more efficient checkpoint formats, in-memory snapshotting of "warm" GPU state) that could meaningfully shrink the detect-to-ready gap this page treats as a near-fixed cost today.
- **More standardized multi-region orchestration tooling**, reducing the current bespoke engineering effort multi-region AI serving requires today, similar to how multi-region deployment for traditional web services became progressively more turnkey over the 2010s.

Because this is a fast-moving area, treat this section as a set of reasonable bets rather than a roadmap to plan against without independent verification closer to the time you act on it.
`,

  "cheat-sheet": `
See the companion cheat sheet page for a dense, at-a-glance reference; the essentials distilled from this page are:

- **Two scaling axes**: horizontal scaling (more independent replicas, for more concurrent requests) versus model parallelism (splitting one model across GPUs, for models too large for one GPU) — know which problem you actually have before reaching for either.
- **Autoscale on GPU-aware signals**: queue depth, GPU utilization, in-flight request count — never CPU% alone.
- **Asymmetric thresholds**: fast scale-up, slow/sustained-window scale-down, to avoid flapping.
- **Cold start is real and must be measured end-to-end**: detect → decide → provision → load weights → pass health checks → serve traffic; mitigate with warm pools and scheduled scaling.
- **Tensor parallelism**: splits layers, frequent communication, wants fast interconnect, reduces latency, has diminishing returns at higher degrees.
- **Pipeline parallelism**: splits layer groups sequentially, communicates only at boundaries, tolerates slower/cross-node interconnects, introduces pipeline bubbles.
- **Load-aware routing beats round robin** whenever request cost varies significantly.
- **Backpressure, not unbounded queueing**: fail fast (429/503) once oversubscribed.
- **Multi-region for a measured reason** (latency data or compliance), not by default.
- **Tie every capacity decision to cost per token**, not just raw throughput.
`,

  "flash-cards": `
**Q: What does horizontal scaling add?**
A: Independent full-model replicas to handle more concurrent requests.

**Q: What does model parallelism solve that horizontal scaling cannot?**
A: Serving a model too large to fit in one GPU's memory at all.

**Q: What is tensor parallelism, in one sentence?**
A: Splitting individual layers' computation across GPUs that work on the same token(s) simultaneously, exchanging partial results frequently.

**Q: What is pipeline parallelism, in one sentence?**
A: Splitting the model into sequential layer groups across GPUs, with communication only at stage boundaries.

**Q: Why is CPU% a bad autoscaling metric for GPU inference?**
A: A GPU can be fully saturated (deep queue, full KV cache) while host CPU usage stays low.

**Q: Name three better autoscaling signals than CPU%.**
A: Queue depth, GPU memory/compute utilization, in-flight request count (or TTFT trend).

**Q: What is a cold start in this context?**
A: The delay between deciding to add a replica and that replica actually being ready to serve traffic (provisioning, image pull, weight loading).

**Q: What is a hybrid parallelism topology?**
A: Combining tensor parallelism within a node (fast interconnect) with pipeline parallelism across nodes (tolerates slower links), often with horizontal scaling of whole hybrid groups layered on top.

**Q: Why is rollback speed as important as rollout safety?**
A: A deployment strategy is only as good as how fast it can be undone once a problem is found; blue-green deployment's kept-warm old fleet makes rollback a routing change instead of a fresh cold-start cycle.

**Q: Name two mitigations for cold-start latency.**
A: Warm standby pools of pre-provisioned replicas; scheduled/predictive scaling ahead of known traffic patterns.

**Q: Why asymmetric scale-up/scale-down thresholds?**
A: Slow reaction to spikes causes visible user pain quickly; slow reaction to dips only costs a little money — so react fast up, slow/sustained down, to avoid flapping.

**Q: What is thundering herd in a scaling context?**
A: Many replicas or requests simultaneously hitting the same shared resource (weight store, cache, config service) at once, overwhelming it.

**Q: What should a fleet do when oversubscribed, instead of queueing indefinitely?**
A: Apply backpressure — fail fast with a clear, retryable error (e.g., HTTP 429/503 with Retry-After).

**Q: When is multi-region serving justified?**
A: When latency data shows real user impact from cross-region network distance, or a data-residency/compliance requirement demands it — not by default.
`,

  mcqs: `
1. Which metric is generally the WORST choice for autoscaling a GPU-bound inference fleet?
   A) Queue depth
   B) GPU memory utilization
   C) CPU utilization
   D) In-flight request count
   **Answer: C** — CPU can be idle-looking while the GPU (and its request queue) is fully saturated.

2. What problem does model parallelism primarily solve?
   A) Handling more concurrent users
   B) Serving a model too large to fit on one GPU
   C) Reducing network latency to distant users
   D) Reducing cost per token
   **Answer: B** — it splits the model itself across GPUs so it can be served at all.

3. Tensor parallelism generally requires:
   A) No inter-GPU communication
   B) Communication only at the very start and end of the whole request
   C) Frequent communication after each split operation, favoring fast interconnects
   D) Communication only between different regions
   **Answer: C**

4. Pipeline parallelism's main structural downside is:
   A) It cannot span multiple nodes
   B) Idle "bubble" time while stages wait for work from previous stages
   C) It requires every GPU to hold the full model
   D) It cannot be combined with horizontal scaling
   **Answer: B**

5. Why should scale-down thresholds generally be more conservative (slower) than scale-up thresholds?
   A) Removing capacity is technically harder than adding it
   B) Slow reaction to load drops mostly costs a little extra money, while slow reaction to spikes causes visible user pain
   C) Kubernetes does not support fast scale-down
   D) GPUs cannot be released quickly
   **Answer: B**

6. What is the primary risk of not accounting for cold-start time in autoscaling design?
   A) The fleet becomes too large
   B) A new replica may become ready only after the traffic spike that triggered it has already passed, or the fleet may oscillate
   C) GPU utilization metrics become inaccurate
   D) Load balancers stop working
   **Answer: B**

7. Thundering herd, in a scaling context, most often causes:
   A) A single replica running out of disk space
   B) Many replicas or requests overwhelming a shared resource simultaneously
   C) A load balancer choosing the wrong region
   D) A model producing incorrect output
   **Answer: B**

8. Which routing strategy adapts automatically to uneven per-request cost?
   A) Round robin
   B) Least-connections (load-aware) routing
   C) Fixed hashing on request timestamp
   D) Random routing
   **Answer: B**

9. What should a well-designed fleet do when oversubscribed, rather than queueing every request indefinitely?
   A) Silently drop random responses
   B) Apply backpressure: return a fast, clear, retryable error
   C) Restart all replicas
   D) Switch every request to pipeline parallelism
   **Answer: B**

10. Multi-region serving is best adopted when:
    A) It is always considered a default best practice regardless of traffic
    B) There is measured evidence of latency impact from network distance, or a compliance/data-residency requirement
    C) The team wants to reduce operational complexity
    D) CPU utilization is high in one region
    **Answer: B**

11. A model-parallel group in this page's sense refers to:
    A) A group of independent, unrelated replicas load-balanced together
    B) A set of GPUs jointly holding and executing one model, coordinated via collective communication
    C) A set of regions sharing one autoscaler
    D) A caching layer shared across replicas
    **Answer: B**

12. Why can fleet-average latency dashboards be misleading?
    A) Averages are always mathematically incorrect
    B) They can hide a subset of degraded replicas or regions behind healthy numbers from the rest of the fleet
    C) Averages only work for CPU-bound services
    D) They cannot be computed for GPU workloads
    **Answer: B**

13. Which of the following is the best justification, on its own, for adopting multi-region serving?
    A) A competitor announced a new region
    B) Measured data showing real user-facing latency impact from network distance, or a data-residency requirement
    C) The engineering team is bored
    D) CPU metrics look different across regions
    **Answer: B**

14. What happens to a model-parallel group if you try to resize it (change its GPU count) the same way you would scale an independent single-GPU replica?
    A) Nothing — it resizes instantly like any replica
    B) Its entire cross-GPU communication topology must be re-established, which is slower and more disruptive than adding an independent replica
    C) It automatically converts to horizontal scaling
    D) It has no effect on availability
    **Answer: B**
`,

  "revision-notes": `
- Two distinct scaling axes: **horizontal** (more independent replicas → more concurrent requests) and **model parallelism** (split one model across GPUs → fit a model too large for one GPU). Don't conflate them; they solve different problems and are often combined.
- Autoscale on **GPU-aware signals** (queue depth, GPU utilization, in-flight count, TTFT trend), never plain CPU%.
- **Asymmetric** scale-up/scale-down: react fast to rising load, require a sustained low-load window before removing capacity, to avoid flapping.
- **Cold start** = detect → decide → provision → load weights → pass health checks → serve traffic. This full chain, not just the autoscaler's own reaction time, is the number that matters. Mitigate with warm pools and scheduled/predictive scaling.
- **Tensor parallelism**: splits layers, frequent communication, wants fast (often within-node) interconnect, cuts latency, diminishing returns as degree grows.
- **Pipeline parallelism**: splits layer groups sequentially, communicates only at stage boundaries, tolerates slower/cross-node links, introduces pipeline bubbles.
- Neither parallelism strategy is universally "better" — benchmark for your model, GPU generation, and interconnect.
- **Request sharding**: round robin is fine for uniform-cost requests; least-connections, weighted, or cache/session-affinity routing wins when request cost or cache locality varies.
- **Capacity planning** = peak demand + latency SLA + benchmarked per-replica throughput + headroom margin → minimum fleet size and GPU class → cost per million tokens.
- **Backpressure, not unbounded queueing**: fail fast with a clear, retryable error once oversubscribed.
- **Thundering herd**: guard shared dependencies (weight stores, caches, config services) against simultaneous full-fleet cold-start load with jitter, backoff, or request coalescing.
- **Multi-region**: adopt for measured latency or compliance reasons, not by default — it multiplies deployment, configuration, and failover complexity.
- Common pitfalls to recite from memory: wrong autoscaling metric (CPU%), ignoring model load time in scale-up latency, thundering herd on cache misses, over-fragmenting a model across too many GPUs unnecessarily.
`,

  "learning-roadmap": `
1. **Foundations first**: be solid on **Inference** (KV cache, batching, quantization) and **Serving** (single-replica operational concerns) before this page — scaling multiplies and distributes those units of work, it does not replace understanding them.
2. **Start with horizontal scaling and autoscaling basics**: understand replicas, load balancers, and the observe-decide-act-wait control loop, and internalize why CPU% is the wrong signal for GPU workloads.
3. **Learn request-sharding strategies**: round robin, least-connections, weighted, and cache/session-affinity routing, and when each is the right choice.
4. **Study cold starts explicitly**: measure (or read about measuring) the full detect-to-ready chain, and learn the standard mitigations — warm pools, scheduled scaling, earlier reaction on leading indicators.
5. **Move to model parallelism conceptually**: understand tensor parallelism and pipeline parallelism at the level presented in **Advanced Concepts** — what is split, what communicates, and why each has overhead — before worrying about specific framework flags.
6. **Practice capacity planning arithmetic**: work through the Lab 3 exercise (or a similar one) until translating peak QPS + SLA + per-replica throughput into replica count and cost-per-token feels natural.
7. **Layer in geographic scaling**: understand multi-region tradeoffs and when they are justified, connecting to **Latency** for the user-facing motivation.
8. **Build the hands-on labs**: deploy a real (or realistically simulated) autoscaled fleet with a custom queue-depth metric (Lab 1), and implement backpressure (Lab 2), to convert conceptual understanding into muscle memory.
9. **Cross-reference sibling skills** as you go: **Kubernetes** for orchestration mechanics, **Load Balancers** for routing algorithm depth, **Cost Optimization** for the business tradeoffs, and **Latency** for the user-facing budget all of this serves.
10. **Revisit common pitfalls periodically**: the wrong-metric, cold-start, and thundering-herd mistakes in this page are exactly the failures experienced engineers report re-learning the hard way; reviewing them before designing a new system is cheaper than rediscovering them in production.
`,

  "official-docs": `
- Kubernetes Horizontal Pod Autoscaler documentation (kubernetes.io) — the canonical reference for HPA configuration, scaling behavior policies, and custom-metrics integration used in this page's worked example.
- KEDA documentation (keda.sh) — for event-driven and custom-metric autoscaling patterns commonly layered on top of Kubernetes for GPU inference workloads.
- NVIDIA Triton Inference Server documentation — covers multi-GPU and multi-instance serving configuration, including model-parallel deployment options.
- vLLM documentation — covers tensor-parallel serving configuration (the "tensor-parallel-size" style settings) for self-hosted LLM serving.
- Hugging Face Text Generation Inference (TGI) documentation — covers sharding/parallelism flags for serving large models across multiple GPUs.
- Cloud provider managed-endpoint documentation (Amazon SageMaker inference autoscaling, Google Vertex AI Prediction autoscaling, Azure Machine Learning managed online endpoints) — for how autoscaling and multi-instance serving are exposed as managed configuration.
- Prometheus documentation — for the metrics-collection concepts (exporters, scraping, PromQL) underlying the custom-metrics autoscaling examples in this page.

As with all fast-moving infrastructure tooling, verify exact configuration syntax and current feature support against each project's live documentation rather than relying solely on this page, since APIs and defaults evolve across releases.
`,

  books: `
- **"Designing Data-Intensive Applications" by Martin Kleppmann** — not AI-specific, but the best available grounding in distributed-systems fundamentals (replication, partitioning, consistency, coordination) that underlie every scaling decision described in this page.
- **"Site Reliability Engineering" and "The Site Reliability Workbook"** (Google, various authors, O'Reilly) — foundational for capacity planning, autoscaling philosophy, and incident/postmortem practices that generalize directly to GPU inference fleets even though the books predate LLM-specific serving.
- **"Kubernetes in Action" by Marko Lukša** — thorough grounding in the orchestration primitives (Deployments, autoscalers, probes) this page's Kubernetes examples build on.
- **"Machine Learning Design Patterns" by Valliappa Lakshmanan, Sara Robinson, and Michael Munn** — covers serving and scaling patterns for ML systems generally, useful context alongside this page's LLM-specific focus.

This page intentionally does not name a definitive, dedicated book solely on "LLM fleet scaling," because as of this page's knowledge cutoff the field was moving fast enough that the best current material lived in engineering blogs, conference talks, and framework documentation rather than settled books — verify against current publications if you are looking for the latest dedicated text.
`,

  blogs: `
- Engineering blogs from LLM-serving-focused companies (Anyscale, Together AI, Fireworks AI, Baseten, Modal, Replicate) regularly publish detailed posts on autoscaling GPU fleets, cold-start mitigation, and multi-GPU serving tradeoffs — search each company's engineering blog directly for their latest posts, since specific URLs and post titles change frequently.
- The vLLM project blog and GitHub discussions frequently cover tensor-parallel serving configuration and benchmarking results for specific model/hardware combinations.
- Kubernetes and KEDA project blogs cover custom-metrics autoscaling patterns applicable to GPU inference workloads.
- Cloud provider AI/ML blogs (AWS Machine Learning Blog, Google Cloud AI Blog, Azure AI Blog) periodically publish case studies on autoscaling managed inference endpoints.

Because blog URLs and specific post titles change and this page's knowledge cutoff may predate the latest posts, search each source directly for current content rather than relying on specific links here.
`,

  "research-papers": `
- **"Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism"** (Shoeybi et al.) — the foundational paper formalizing tensor parallelism for large transformer models, originally in a training context but conceptually the basis for tensor-parallel serving.
- **"GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism"** (Huang et al.) — the foundational paper formalizing pipeline parallelism, again originally for training, but conceptually the basis for pipeline-parallel serving.
- **"Efficient Memory Management for Large Language Model Serving with PagedAttention"** (Kwon et al., the vLLM paper) — while primarily an inference-optimization paper (covered in depth in **Inference**), it is directly relevant to scaling because KV-cache memory management determines how many concurrent requests one replica can actually hold, which is a direct input to capacity planning.
- **"Orca: A Distributed Serving System for Transformer-Based Generative Models"** — an early paper on continuous batching and serving-system design for LLMs, relevant background for how a single replica's capacity (the unit that scaling multiplies) is determined.
- Research on **S-LoRA** and **Punica** (multi-LoRA serving at scale) — relevant to scaling multi-tenant fleets efficiently when many fine-tuned variants of one base model need to be served without each consuming a full replica's worth of resources.

Paper titles and author lists are provided to the best of this page's training-data knowledge; verify exact citations (venue, year, author order) against the paper itself or a citation index before using them in formal work.
`,

  videos: `
- Conference talks from **KubeCon + CloudNativeCon** on GPU autoscaling and custom-metrics scaling for ML workloads (search the CNCF YouTube channel for recent years' AI/ML-track sessions).
- Talks from **Ray Summit** (Anyscale's conference) frequently cover distributed serving and scaling patterns for LLM inference at scale.
- Vendor engineering talks from GPU-cloud and inference-platform companies (Modal, Together AI, RunPod, Baseten) on YouTube or their own channels often walk through real autoscaling and cold-start-mitigation architectures with concrete numbers.
- NVIDIA GTC sessions on Triton Inference Server and multi-GPU serving cover tensor/pipeline parallelism configuration with live demonstrations.

Because specific video titles, speakers, and URLs change and this page's knowledge cutoff may predate the newest talks, search the relevant conference's channel for the most recent year's sessions rather than relying on a fixed link list.
`,

  "github-repos": `
- **vllm-project/vllm** — widely used high-throughput serving engine with built-in tensor-parallel serving support; its documentation and configuration flags are a practical way to see model-parallel serving as an actual runtime option rather than only a concept.
- **huggingface/text-generation-inference** — TGI's repository, showing sharding/parallelism configuration for serving large models across multiple GPUs.
- **triton-inference-server/server** — NVIDIA Triton's repository, useful for its multi-instance and multi-GPU model configuration examples.
- **kedacore/keda** — the KEDA project repository, useful for concrete examples of custom-metric-driven autoscaling (including community-contributed scalers relevant to GPU/queue-depth metrics).
- **kubernetes/autoscaler** — the upstream Kubernetes autoscaling components repository, useful for understanding HPA and cluster-autoscaler internals referenced in this page's control-loop discussion.
- **prometheus/prometheus** and **kubernetes-sigs/prometheus-adapter** — for the metrics-collection and custom-metrics-adapter plumbing behind the queue-depth autoscaling example in **Hands-on Labs**.

Search these repositories' current READMEs and examples directories directly, since exact directory structures and example filenames change across releases.
`,

  "practice-problems": `
1. Given a single-replica sustainable throughput of 25 requests/second and an expected peak of 300 requests/second, calculate the minimum number of replicas needed with a 20% headroom margin.
2. A model's weights require 140 GB of GPU memory; your available GPU class has 80 GB of memory per GPU. What is the minimum tensor-parallel degree (assuming even sharding and ignoring KV-cache and activation memory for this simplified exercise) needed just to fit the weights?
3. Your autoscaler's evaluation interval is 15 seconds, and observed true replica readiness time (provision + load + health check) is 90 seconds. If your traffic can grow 5x within 60 seconds during a spike, what mitigation(s) from this page would you apply, and why?
4. You measure that round-robin routing across 4 replicas leaves one replica at 90% queue depth while the other three sit at 20%, even though total request volume is well within fleet capacity. Diagnose the likely cause and propose a routing-strategy fix.
5. Design an asymmetric HPA scaling "behavior" policy (in words or as a manifest snippet) that can double capacity within 30 seconds of a spike but requires 5 minutes of sustained low load before removing any replica.
6. Your fleet experiences a fleet-wide slowdown for the first 20 seconds immediately after every scale-up event, even though CPU, network, and GPU metrics on the new replicas look fine individually. Propose at least two plausible root causes to investigate and how you would distinguish between them.
7. A product currently serves all users from a single US region; support tickets show users in Southeast Asia reporting response times roughly 400ms slower than US users for otherwise identical requests. Is this sufficient justification for multi-region deployment on its own? What additional data or requirements would strengthen or weaken the case?
8. Compare, in writing, the cost-per-million-tokens implications of running 8 single-GPU replicas of a mid-size model versus 2 tensor-parallel groups of 4 GPUs each serving a larger model that does not fit on a single GPU, assuming you know each option's measured throughput and your GPU's hourly cost.
9. Your on-call dashboard shows fleet-average p95 latency well within SLO, but a subset of users are filing complaints about slow responses. What per-replica (rather than fleet-average) metrics would you check first, and why might averaging hide the problem?
10. A traffic-forecasting model predicts a large, predictable surge every weekday at 9 AM local time as users start their workday. Would you rely on reactive autoscaling alone for this pattern, or add something else? Justify your answer using the cold-start concepts from this page.
11. You are asked to reduce cost per million tokens by 30% without increasing p99 latency. List, in priority order, three scaling-related levers you would investigate first (for example: GPU class change, parallelism degree, routing strategy, headroom margin) and explain what data you would gather before changing each.
12. A newly deployed model version passes all canary checks in one region but causes elevated error rates after being promoted to a second region an hour later. What region-specific factors (from this page's **Deployment** and **Debugging** sections) would you investigate first?
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client Side
      U((User Requests))
    end

    U --> GDNS[Global Routing / DNS]

    subgraph "Region A"
      GDNS --> GWA[Gateway: auth, rate limit]
      GWA --> RTA[Router: least-connections / cache-aware]
      RTA --> RA1[Replica - single GPU]
      RTA --> RA2[Replica - single GPU]
      RTA --> MPA["Model-Parallel Group
      (tensor-parallel, N GPUs)"]
      AUTA[Autoscaler] -. queue depth, GPU util .-> MET[(Metrics Backend)]
      MET -. scale decision .-> AUTA
      AUTA -. add/remove replicas .-> RA1
      AUTA -. add/remove replicas .-> RA2
    end

    subgraph "Region B"
      GDNS --> GWB[Gateway: auth, rate limit]
      GWB --> RTB[Router]
      RTB --> RB1[Replica - single GPU]
      RTB --> MPB["Model-Parallel Group"]
    end

    RA1 & RA2 & MPA & RB1 & MPB --> WS[(Shared Weight Store)]
    RA1 & RA2 & MPA & RB1 & MPB --> MET

    GWA -. reject if oversubscribed .-> BP1[["Backpressure:
    429 / Retry-After"]]
    GWB -. reject if oversubscribed .-> BP2[["Backpressure:
    429 / Retry-After"]]
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((AI Scaling))
    Horizontal Scaling
      Replicas
      Load balancing
        Round robin
        Least connections
        Weighted
        Cache/session affinity
      Autoscaling
        Correct signals: queue depth, GPU util
        Wrong signal: CPU percent
        Asymmetric up/down thresholds
        Cold starts
          Warm pools
          Scheduled scaling
    Model Parallelism
      Tensor parallelism
        Splits layers
        Frequent communication
        Fast interconnect preferred
      Pipeline parallelism
        Splits layer groups
        Boundary communication
        Pipeline bubbles
      Hybrid strategies
    Capacity Planning
      Peak demand plus headroom
      GPU class tradeoffs
      Cost per million tokens
    Traffic and Reliability
      Spike handling
      Thundering herd
      Backpressure and load shedding
    Geographic Scaling
      Multi-region routing
      Latency reduction
      Failover design
      Data residency
    Pitfalls
      Wrong autoscaling metric
      Ignoring load time
      Thundering herd on cache miss
      Over-fragmenting a model
`,
};

export default aiScaling;
