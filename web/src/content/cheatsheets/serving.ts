import type { CheatSheetData } from "./types";

const serving: CheatSheetData = {
  title: "The Ultimate LLM Serving Cheat Sheet",
  subtitle: "Gateways, routing, autoscaling, multi-model/multi-LoRA, deployment, and monitoring for production LLM infrastructure",
  sections: [
    {
      title: "Serving Stack Basics",
      color: "violet",
      rows: [
        { term: "Model server", desc: "Long-running process that loads weights once and serves many requests", code: "startup -> load model once\nrequest 1..N -> generate -> respond" },
        { term: "Replica", desc: "One running copy of a model server, usually one GPU (or GPU set)", code: "3 replicas -> ~3x throughput\nif load is evenly distributed" },
        { term: "Gateway", desc: "Front door handling auth, rate limiting, request validation before GPU work", code: "client -> gateway -> router -> engine\n# never expose the engine directly" },
        { term: "Readiness vs liveness", desc: "Readiness: can it take traffic now. Liveness: is the process alive", code: "readinessProbe: gates routing\nlivenessProbe: triggers restart" },
        { term: "Serving vs Inference", desc: "Inference = single-GPU algorithms (KV cache, batching). Serving = fleet-level infra", code: "Inference: how fast is one GPU\nServing: how many users, reliably" },
      ],
    },
    {
      title: "Routing Strategies",
      color: "blue",
      rows: [
        { term: "Round robin", desc: "Cycles through replicas in order, ignores current load", code: "replica = replicas[request_n % len(replicas)]" },
        { term: "Least connections", desc: "Routes to the replica with fewest active in-flight requests", code: "replica = min(replicas, key=active_count)" },
        { term: "KV-cache-aware routing", desc: "Routes to the replica already holding a shared prompt prefix", code: "# skip re-prefill for repeated system\n# prompts / multi-turn conversations" },
        { term: "Session affinity", desc: "Pins a conversation to one replica for cache locality across turns", code: "route(conversation_id) -> same replica\nfor the whole session" },
        { term: "Weighted routing", desc: "Sends more traffic to replicas with more capacity (bigger GPU, more slots)", code: "weight = replica.max_num_seqs / total_capacity" },
      ],
    },
    {
      title: "Autoscaling",
      color: "emerald",
      rows: [
        { term: "Correct signals", desc: "Queue depth, GPU memory utilization, TTFT trend -- never plain CPU%", code: "# CPU% is a poor proxy for GPU-bound load" },
        { term: "Scale up fast, down slow", desc: "React quickly to spikes, require sustained low load before scaling down", code: "if avg_queue > threshold: scale_up_now()\nif low_load_for(3, periods): scale_down()" },
        { term: "Warm capacity buffer", desc: "Pre-provisioned idle GPUs to absorb spikes faster than cold start allows", code: "# cold start = provision GPU + load\n# multi-GB weights = tens of sec to minutes" },
        { term: "Cold start problem", desc: "New replica isn't ready by the time the traffic spike that triggered it has passed", code: "# mitigate: warm pool, predictive scaling,\n# scheduled scaling for known patterns" },
        { term: "Backpressure", desc: "Fail fast (429/503) past capacity instead of unbounded queueing", code: "if queue_depth > MAX: return 429, 'retry-after: 5'" },
      ],
    },
    {
      title: "Multi-Model & Multi-Tenant",
      color: "amber",
      rows: [
        { term: "Multi-model serving", desc: "Several different base models behind one gateway, routed by task/cost tier", code: "route(request.model_name) -> correct engine pool" },
        { term: "Multi-LoRA serving", desc: "One base model + many small fine-tuned adapters, swapped in per request", code: "# 100 tenants: 1x base memory + tiny\n# adapter overhead vs 100x full copies" },
        { term: "S-LoRA / Punica pattern", desc: "Research techniques for serving thousands of concurrent LoRA adapters", code: "# batch requests using DIFFERENT adapters\n# on the SAME base model forward pass" },
        { term: "Tenant isolation", desc: "No cross-tenant leakage of adapters, KV cache, or conversation data", code: "# must be a deliberate design property,\n# not assumed for free" },
        { term: "Priority tiers", desc: "Paying/high-priority requests preempt or jump ahead in scheduling", code: "queue.push(request, priority=tier_weight)" },
      ],
    },
    {
      title: "Deployment & Engines",
      color: "rose",
      rows: [
        { term: "vLLM", desc: "High-throughput self-hosted engine; PagedAttention + continuous batching", code: "vllm serve model --max-model-len 8192\n  --gpu-memory-utilization 0.9" },
        { term: "TGI", desc: "Hugging Face's production serving toolkit, HF-ecosystem native", code: "docker run ghcr.io/huggingface/\n  text-generation-inference --model-id ..." },
        { term: "Triton Inference Server", desc: "NVIDIA's multi-framework, multi-backend model server", code: "# good when serving LLMs + classical/vision\n# models on one unified server" },
        { term: "Canary / blue-green rollout", desc: "Ship changes to a small % of replicas first, never all at once", code: "# promote only after quality/latency\n# checks pass on the canary slice" },
        { term: "Kubernetes readiness probe", desc: "Gates traffic until model weights are fully loaded", code: "readinessProbe:\n  httpGet: {path: /health, port: 8000}\n  initialDelaySeconds: 30" },
      ],
    },
    {
      title: "Monitoring & Pitfalls",
      color: "cyan",
      rows: [
        { term: "TTFT / TPS per replica", desc: "Track per-replica, not just fleet average -- averages hide degraded replicas", code: "metrics.observe('ttft_seconds', ttft,\n  tags={'replica': replica_id})" },
        { term: "Queue depth", desc: "Leading indicator of undersized capacity before latency visibly degrades", code: "alert_if(queue_depth > threshold, sustained=True)" },
        { term: "Cost per million tokens", desc: "Blended metric tying serving decisions to unit economics", code: "cost_per_mtok = gpu_hour_cost / tokens_served_millions" },
        { term: "Exposing engine directly", desc: "Pitfall: no auth/rate-limit layer lets one client exhaust all capacity", code: "# WRONG: client -> vLLM raw endpoint\n# RIGHT: client -> gateway -> engine" },
        { term: "In-place rollout of all replicas", desc: "Pitfall: one bad config change breaks 100% of traffic at once", code: "# use canary: small % first, monitor, then promote" },
        { term: "One full model per tenant", desc: "Pitfall: linear GPU cost growth when multi-LoRA would share the base model", code: "# switch to multi-LoRA serving for\n# many fine-tuned variants of one base model" },
      ],
    },
  ],
};

export default serving;
