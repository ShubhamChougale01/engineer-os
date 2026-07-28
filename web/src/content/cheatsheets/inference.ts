import type { CheatSheetData } from "./types";

const inference: CheatSheetData = {
  title: "The Ultimate LLM Inference Cheat Sheet",
  subtitle: "Autoregressive decoding · KV cache · batching · quantization · latency/throughput tradeoffs",
  sections: [
    {
      title: "Autoregressive Decoding Basics",
      color: "violet",
      rows: [
        { term: "Autoregressive generation", desc: "Model predicts one token at a time, conditioned on all prior tokens", code: "for _ in range(max_new_tokens):\n    logits = model(tokens)\n    next_tok = sample(logits[-1])\n    tokens.append(next_tok)" },
        { term: "Prefill vs. decode", desc: "Prefill processes the full prompt at once; decode generates one token per step", code: "# prefill: parallel, compute-bound\n# decode: sequential, memory-bandwidth-bound" },
        { term: "Time to first token (TTFT)", desc: "Latency of the prefill phase — dominates for short generations", code: "ttft = prefill_time(prompt_tokens)" },
        { term: "Inter-token latency (ITL)", desc: "Per-token decode latency — dominates for long generations", code: "itl = decode_time_per_token" },
        { term: "Greedy vs. sampling", desc: "Greedy picks argmax every step; sampling adds temperature/top-p/top-k", code: "greedy: next_tok = argmax(logits)\nsampling: next_tok = sample(softmax(logits/temp))" },
      ],
    },
    {
      title: "KV Cache",
      color: "blue",
      rows: [
        { term: "KV cache", desc: "Cache past keys/values so decode doesn't recompute attention over the whole sequence", code: "# without cache: O(n^2) total work\n# with cache: O(n) total work" },
        { term: "KV cache memory cost", desc: "Grows linearly with sequence length and batch size", code: "kv_bytes = 2 * n_layers * n_heads * head_dim\n           * seq_len * batch * dtype_bytes" },
        { term: "Multi-query / grouped-query attention", desc: "Share K/V heads across query heads to shrink cache size", code: "# MHA: n_kv_heads == n_heads\n# GQA: n_kv_heads < n_heads (shared)\n# MQA: n_kv_heads == 1" },
        { term: "PagedAttention", desc: "Manage KV cache in fixed-size blocks like OS virtual memory pages", code: "# eliminates memory fragmentation from\n# variable-length sequences (vLLM's core idea)" },
        { term: "Prefix caching", desc: "Reuse KV cache across requests sharing a common prompt prefix", code: "# shared system prompt -> compute once,\n# reuse across many concurrent requests" },
      ],
    },
    {
      title: "Batching & Throughput",
      color: "emerald",
      rows: [
        { term: "Static batching", desc: "Wait for a fixed batch, all requests decode in lockstep", code: "# wastes compute: batch blocked until\n# the longest sequence finishes" },
        { term: "Continuous (in-flight) batching", desc: "New requests join the batch as soon as a slot frees up", code: "# vLLM/TGI default; keeps GPU utilization high\n# without waiting for whole-batch completion" },
        { term: "Throughput vs. latency tradeoff", desc: "Bigger batches raise throughput but raise per-request latency", code: "# tune max_batch_size against your p99 latency SLO" },
        { term: "Speculative decoding", desc: "Small draft model proposes tokens, big model verifies in parallel", code: "draft_tokens = small_model.generate(n=4)\naccepted = big_model.verify(draft_tokens)  # 1 fwd pass" },
        { term: "Chunked prefill", desc: "Split long prompt prefill into chunks interleaved with decode steps", code: "# prevents one huge prefill from blocking\n# other requests' decode steps" },
      ],
    },
    {
      title: "Quantization & Model Size",
      color: "amber",
      rows: [
        { term: "Quantization", desc: "Reduce weight/activation precision to cut memory and increase speed", code: "fp16 -> int8 -> int4  # progressively smaller, faster,\n# with progressively more quality risk" },
        { term: "GPTQ / AWQ", desc: "Post-training quantization methods calibrated on sample data", code: "quantized = AutoGPTQForCausalLM.from_pretrained(\n  model, quantize_config=cfg)" },
        { term: "GGUF (llama.cpp)", desc: "Quantized format for CPU/edge/consumer-GPU inference", code: "./main -m model-q4_K_M.gguf -p 'prompt'" },
        { term: "Memory footprint estimate", desc: "Rough VRAM needed for a model at a given precision", code: "vram_gb ~= params_billion * bytes_per_param * 1.2\n# fp16: 2 bytes, int8: 1 byte, int4: 0.5 byte" },
        { term: "Quality vs. compression tradeoff", desc: "Always benchmark task accuracy after quantizing, don't assume it's free", code: "# int4 can cost several points of accuracy\n# on reasoning-heavy tasks" },
      ],
    },
    {
      title: "Serving Stack & Optimization",
      color: "rose",
      rows: [
        { term: "vLLM", desc: "High-throughput serving engine built around PagedAttention", code: "vllm.LLM(model='...', gpu_memory_utilization=0.9)" },
        { term: "TensorRT-LLM", desc: "NVIDIA-optimized compiled inference for max single-GPU throughput", code: "# best when locked into NVIDIA hardware\n# and need lowest possible latency" },
        { term: "Streaming responses", desc: "Send tokens to the client as they're generated, not after completion", code: "for token in model.stream(prompt):\n    yield token  # SSE / chunked response" },
        { term: "Request queuing/backpressure", desc: "Reject or queue requests past capacity instead of degrading everyone", code: "if queue_depth > MAX_QUEUE: return 429" },
        { term: "Model warm-up", desc: "Run dummy inference at startup to avoid slow first-request latency", code: "model.generate(warmup_prompt, max_new_tokens=1)" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "cyan",
      rows: [
        { term: "Ignoring TTFT vs ITL split", desc: "Optimizing the wrong phase for your actual traffic pattern", code: "# short-answer chatbot: TTFT dominates\n# long-form generation: ITL dominates" },
        { term: "No max_tokens cap", desc: "Unbounded generation length blows up latency and cost tail", code: "max_new_tokens=512  # always set an upper bound" },
        { term: "Static batching under variable load", desc: "Long-tail requests stall the whole batch", code: "# switch to continuous batching for\n# production-scale variable traffic" },
        { term: "Quantizing without re-evaluating", desc: "Shipping int4 without checking task-specific accuracy first", code: "# run your eval suite before AND after quantization" },
        { term: "Cold KV cache on every request", desc: "Missing prefix caching wastes compute on shared system prompts", code: "# enable prefix/prompt caching for repeated\n# system prompts or few-shot examples" },
      ],
    },
  ],
};

export default inference;
