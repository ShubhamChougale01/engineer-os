import type { CheatSheetData } from "./types";

const aiScaling: CheatSheetData = {
  title: "The Ultimate AI Scaling Cheat Sheet",
  subtitle: "Horizontal scaling, GPU-aware autoscaling, model parallelism, capacity planning, and multi-region serving for AI fleets",
  sections: [
    {
      title: "Scaling Basics",
      color: "violet",
      rows: [
        { term: "Horizontal scaling", desc: "Add independent full-model replicas to handle more concurrent requests", code: "3 replicas -> ~3x throughput\n(shared-dependency limits aside)" },
        { term: "Vertical scaling", desc: "Make one replica bigger/faster instead of adding more replicas -- has a hard ceiling", code: "# bigger GPU != more availability\n# still one box that can fail" },
        { term: "Model parallelism", desc: "Split the model itself across GPUs/nodes so it fits at all, not just runs faster", code: "# needed when weights + KV cache\n# exceed one GPU's memory" },
        { term: "Replica", desc: "One running copy of the model server -- one GPU, or a coordinated GPU group", code: "# atomic unit of independent scaling" },
        { term: "Serving vs Scaling", desc: "Serving = run one healthy replica. Scaling = run many, elastically, across nodes/regions", code: "Serving: one car\nScaling: the highway + fleet" },
      ],
    },
    {
      title: "Autoscaling",
      color: "blue",
      rows: [
        { term: "Correct signals", desc: "Queue depth, GPU memory/compute utilization, in-flight count, TTFT trend", code: "# NEVER autoscale GPU inference on CPU%" },
        { term: "Wrong signal: CPU%", desc: "GPU can be saturated (full queue) while CPU sits idle -- classic pitfall", code: "# GPU 100% busy, CPU 20% --\n# CPU-based HPA never triggers" },
        { term: "Asymmetric thresholds", desc: "React fast to spikes, require a sustained low-load window before scaling down", code: "scaleUp: stabilizationWindowSeconds: 0\nscaleDown: stabilizationWindowSeconds: 300" },
        { term: "Flapping", desc: "Rapid scale-up/scale-down cycling from symmetric, noisy thresholds -- each cycle pays a cold start", code: "# fix: sustained-window requirement\n# before any scale-down" },
        { term: "Cold start", desc: "Detect -> decide -> provision -> load weights -> health check -> serve traffic", code: "# can take 10s of sec to minutes\n# for multi-GB model weights" },
        { term: "Cold-start mitigation", desc: "Warm standby pool, scheduled/predictive scaling, react on leading indicators", code: "min_replicas = warm_floor  # never 0\n# for latency-sensitive services" },
      ],
    },
    {
      title: "Model Parallelism",
      color: "emerald",
      rows: [
        { term: "Tensor parallelism", desc: "Splits each layer's compute across GPUs; all GPUs work on same token, frequent comm", code: "# wants fast interconnect (NVLink)\n# typically within one node" },
        { term: "Pipeline parallelism", desc: "Splits sequential layer groups across GPUs; comm only at stage boundaries", code: "# tolerates slower/cross-node links\n# introduces idle 'bubble' time" },
        { term: "Neither is 'best'", desc: "Choice depends on model size, GPU generation, interconnect -- benchmark, don't assume", code: "# hybrid TP+PP common at large scale" },
        { term: "Diminishing returns", desc: "More GPUs per parallel group = more comm overhead; throughput gain flattens/reverses", code: "# scale THROUGHPUT via more groups,\n# not by growing one group forever" },
        { term: "Group scales as a unit", desc: "A model-parallel group must start/fail/resize together (rendezvous, NCCL topology)", code: "# don't treat like an elastic\n# single-GPU replica" },
      ],
    },
    {
      title: "Request Sharding & Routing",
      color: "amber",
      rows: [
        { term: "Round robin", desc: "Cycles replicas in order -- fine only when request cost is roughly uniform", code: "replica = replicas[n % len(replicas)]" },
        { term: "Least connections", desc: "Routes to replica with fewest in-flight requests -- adapts to uneven request cost", code: "replica = min(replicas, key=active_count)" },
        { term: "Weighted routing", desc: "Sends more traffic to replicas with more capacity (bigger GPU, higher concurrency limit)", code: "weight = replica.max_concurrency / total" },
        { term: "Cache/session affinity", desc: "Pins requests sharing a prefix or conversation to the same replica for KV-cache locality", code: "route(conversation_id) -> same replica" },
        { term: "Backpressure / load shedding", desc: "Fail fast (429/503) past capacity instead of unbounded queueing", code: "if in_flight >= max: return 429,\n  'retry-after: 2'" },
      ],
    },
    {
      title: "Capacity Planning & Geography",
      color: "rose",
      rows: [
        { term: "Peak + headroom", desc: "Size for measured/forecast peak plus ~20-30% margin, not average load", code: "replicas = ceil(peak_qps / per_replica_qps\n  * 1.25)" },
        { term: "Cost per million tokens", desc: "Blended metric tying replica count + GPU class to unit economics", code: "cost_per_mtok = gpu_hour_cost /\n  tokens_served_millions" },
        { term: "GPU class tradeoff", desc: "Bigger/pricier GPU may raise per-replica throughput enough to lower cost-per-token", code: "# compare cost-per-mtok across\n# GPU classes, not just $/hour" },
        { term: "Multi-region serving", desc: "Route users to nearest healthy region to cut network round-trip latency", code: "# justify with real latency data\n# or data-residency requirement" },
        { term: "Region failover", desc: "Explicit, tested plan for rerouting traffic when one region degrades", code: "# untested failover = no failover" },
      ],
    },
    {
      title: "Pitfalls & Ops",
      color: "cyan",
      rows: [
        { term: "Autoscaling on CPU%", desc: "Pitfall: the single most common, most damaging scaling mistake for GPU inference", code: "# fix: queue depth / GPU util /\n# in-flight count instead" },
        { term: "Ignoring load time", desc: "Pitfall: treating scale-up as instant; spike passes before new replica is ready", code: "# fix: measure true detect-to-ready\n# time, react earlier, use warm pool" },
        { term: "Thundering herd", desc: "Pitfall: many replicas/requests hit a shared cache or weight store at once on cold start", code: "# fix: jittered backoff, singleflight,\n# stagger replica startup" },
        { term: "Over-fragmenting a model", desc: "Pitfall: high tensor-parallel degree 'to be safe' when fewer GPUs would fit", code: "# fix: benchmark smallest degree\n# that fits before scaling parallelism up" },
        { term: "Canary / rolling rollout", desc: "Ship to a small slice first; never replace 100% of fleet or all regions at once", code: "# region-by-region rollout for\n# multi-region deployments" },
        { term: "Per-replica metrics", desc: "Alert on distribution/max, not just fleet average -- averages hide one bad replica", code: "alert_if(max(replica_queue_depths)\n  > threshold)" },
      ],
    },
  ],
};

export default aiScaling;
