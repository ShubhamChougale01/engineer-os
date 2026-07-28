import type { CheatSheetData } from "./types";

const vllm: CheatSheetData = {
  title: "The Ultimate vLLM Cheat Sheet",
  subtitle: "PagedAttention · continuous batching · serving config · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "vLLM", desc: "High-throughput, memory-efficient open-source LLM serving engine", code: "pip install vllm\nvllm serve <model-name>" },
        { term: "PagedAttention", desc: "KV cache managed as small, non-contiguous, on-demand pages", code: "like OS virtual memory ->\nnear-zero fragmentation waste" },
        { term: "Continuous batching", desc: "Admit new requests at every decode step, not fixed batch boundaries", code: "keeps GPU consistently busy\nunder mixed-length real traffic" },
        { term: "KV cache", desc: "Per-token, per-layer attention state reused across decode steps", code: "naive: one big contiguous block\nvLLM: many small on-demand pages" },
        { term: "Prefill vs decode", desc: "Two distinct phases with different bottlenecks", code: "prefill: whole prompt, compute-bound\ndecode: one token/step, memory-bandwidth-bound" },
        { term: "OpenAI-compatible API", desc: "vLLM's HTTP server mirrors the Chat Completions shape", code: "client = OpenAI(base_url='http://host:8000/v1')\n# existing OpenAI client code mostly just works" },
        { term: "Origin", desc: "UC Berkeley Sky Computing Lab, SOSP 2023 paper", code: "'Efficient Memory Management for LLM\nServing with PagedAttention' (Kwon et al.)" },
        { term: "Time-to-first-token (TTFT)", desc: "Latency until the first output token appears", code: "dominated by prefill (compute-bound)" },
        { term: "Inter-token latency", desc: "Latency between subsequent streamed tokens", code: "dominated by decode (memory-bandwidth-bound)" },
      ],
    },
    {
      title: "Serving & Config",
      color: "blue",
      rows: [
        { term: "vllm serve", desc: "Launch the OpenAI-compatible HTTP server", code: "vllm serve meta-llama/Llama-3.1-8B-Instruct \\\n  --max-model-len 8192 --gpu-memory-utilization 0.9" },
        { term: "--max-model-len", desc: "Max context length accepted; sizes KV-cache memory per request", code: "# size to ACTUAL workload need,\n# not the model's theoretical max" },
        { term: "--gpu-memory-utilization", desc: "Fraction of GPU memory for weights + KV cache", code: "--gpu-memory-utilization 0.9\n# leave headroom for other GPU processes" },
        { term: "--tensor-parallel-size", desc: "Shard each layer across N GPUs (needs fast interconnect)", code: "vllm serve big-model --tensor-parallel-size 4" },
        { term: "--pipeline-parallel-size", desc: "Split layers across GPU groups (works cross-node)", code: "--tensor-parallel-size 8 --pipeline-parallel-size 2" },
        { term: "--enable-prefix-caching", desc: "Reuse KV-cache blocks for identical shared prompt prefixes", code: "vllm serve model --enable-prefix-caching" },
        { term: "--quantization", desc: "Serve a lower-precision checkpoint (AWQ, GPTQ, etc.)", code: "vllm serve model-AWQ --quantization awq\n# validate accuracy against real evals" },
        { term: "--served-model-name", desc: "The name clients pass in the model field", code: "--served-model-name llama-3.1-70b" },
        { term: "--api-key", desc: "Baseline bearer-token auth (not a full production auth story)", code: "# put a real gateway in front for\n# per-tenant auth + rate limiting" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Call via OpenAI client", desc: "Point the standard client at your own server", code: "client = OpenAI(base_url='http://localhost:8000/v1',\n  api_key='not-needed')\nclient.chat.completions.create(model=m, messages=msgs)" },
        { term: "Always set a timeout", desc: "Your own server is still a network dependency", code: "client.chat.completions.create(..., timeout=30)" },
        { term: "Streaming", desc: "Read tokens incrementally for low perceived latency", code: "for chunk in client.chat.completions.create(..., stream=True):\n    print(chunk.choices[0].delta.content, end='')" },
        { term: "Offline batch inference", desc: "Use the Python library directly, no server needed", code: "from vllm import LLM, SamplingParams\nllm = LLM(model=m)\nllm.generate(prompts, SamplingParams(max_tokens=200))" },
        { term: "Check server health", desc: "Wire into orchestrator readiness probes", code: "curl -f http://localhost:8000/health" },
        { term: "Scrape metrics", desc: "vLLM exposes Prometheus metrics natively", code: "curl -s http://localhost:8000/metrics | grep vllm" },
        { term: "Bound max_tokens explicitly", desc: "Never leave generation length unbounded", code: "client.chat.completions.create(..., max_tokens=500)" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Function/tool calling", desc: "OpenAI-compatible tool-call support for agentic use", code: "client.chat.completions.create(..., tools=[...])" },
        { term: "Guided/structured decoding", desc: "Constrain output to match a JSON schema", code: "# see the Structured Outputs skill --\n# enforced at the serving layer, not just prompting" },
        { term: "Speculative decoding", desc: "A small draft model proposes tokens, target model verifies in one pass", code: "# reduces latency without changing\n# the final output distribution" },
        { term: "Prefix caching + copy-on-write", desc: "Shared prompt prefixes reuse identical physical KV blocks", code: "--enable-prefix-caching\n# also enables cheap parallel sampling / beam search" },
        { term: "Load-aware multi-replica routing", desc: "Route to the replica with the most free KV-cache capacity", code: "check vllm:gpu_cache_usage_perc per replica\n# not naive round-robin" },
        { term: "Multi-model serving", desc: "One vLLM process per model, routed via a shared gateway", code: "vllm serve model-a --port 8001\nvllm serve model-b --port 8002" },
        { term: "Disaggregated prefill/decode", desc: "Separate GPU pools for the two different bottlenecks", code: "# active area of ongoing development --\n# verify current maturity before depending on it" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Oversized max-model-len", desc: "Reserves KV-cache headroom you'll never use, crippling concurrency", code: "# WRONG: --max-model-len 131072 'just in case'\n# RIGHT: size to actual measured workload" },
        { term: "Assuming quantization is free", desc: "Accuracy impact varies by model, method, and task", code: "# always re-run AI Evals against the\n# quantized model on real tasks" },
        { term: "No client-side timeout", desc: "Treating your own server as immune to hangs/overload", code: "# WRONG: create(model=m, messages=msgs)\n# RIGHT: create(..., timeout=30)" },
        { term: "Monitoring average only", desc: "Hides tail-latency degradation from scheduling/memory pressure", code: "# always pair mean latency with p95/p99\n# and queue-depth metrics" },
        { term: "--api-key as full production auth", desc: "No per-tenant quotas or fine-grained scoping", code: "# put a real gateway in front:\n# auth, rate limits, multi-model routing" },
        { term: "Pipeline parallelism when TP would fit", desc: "Unneeded bubble overhead for a model that fits one node", code: "# prefer tensor-parallel-size when the\n# model fits within fast-interconnect GPUs" },
        { term: "Synthetic uniform-length benchmarks", desc: "Hides continuous batching's real advantage and tail behavior", code: "# benchmark with YOUR actual request-\n# length distribution, not fixed-length prompts" },
        { term: "Naive readiness probe", desc: "Routes traffic to a replica still loading model weights", code: "# gate readiness on FULL model load,\n# not just process start" },
        { term: "Aggressive GPU autoscaling", desc: "GPU provisioning is slow and expensive vs. CPU autoscaling", code: "# right-size an always-on baseline;\n# treat GPU autoscale as a slow, coarse lever" },
        { term: "Self-hosting removes safety needs", desc: "Prompt injection / content risk unchanged by where the model runs", code: "# still needs Prompt Injection Defense\n# and content moderation, same as hosted APIs" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Official Docker image", desc: "vllm/vllm-openai as the base for production containers", code: "FROM vllm/vllm-openai:latest" },
        { term: "Kubernetes GPU node pool", desc: "Request GPUs explicitly, schedule dedicated nodes", code: "resources:\n  limits:\n    nvidia.com/gpu: 4" },
        { term: "Prometheus metrics to watch", desc: "The five that matter most", code: "num_requests_running / waiting\ngpu_cache_usage_perc\ntime_to_first_token_seconds\ntime_per_output_token_seconds" },
        { term: "Gateway pattern", desc: "Auth, rate limiting, routing in front of vLLM replicas", code: "client -> gateway -> vLLM replica pool\n(load-aware, not round-robin)" },
        { term: "Secrets management tie-in", desc: "API keys/credentials via env vars backed by a real secrets store", code: "# see Secrets Management skill --\n# never hardcode credentials in config" },
        { term: "Checkpoint provenance", desc: "Prefer safetensors, verified sources over arbitrary checkpoints", code: "# safetensors avoids pickle-based\n# arbitrary code execution risk" },
        { term: "AI Evals tie-in", desc: "Re-validate quality after any quantization/model/config change", code: "# treat quantization + max-model-len\n# changes as behavior changes, not just infra" },
      ],
    },
  ],
};

export default vllm;
