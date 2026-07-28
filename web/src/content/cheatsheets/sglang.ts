import type { CheatSheetData } from "./types";

const sglang: CheatSheetData = {
  title: "The Ultimate SGLang Cheat Sheet",
  subtitle: "RadixAttention · the frontend DSL · constrained generation · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "SGLang", desc: "LLM serving framework: RadixAttention + a structured-generation frontend DSL", code: "pip install \"sglang[all]\"\npython -m sglang.launch_server --model-path <model>" },
        { term: "RadixAttention", desc: "KV cache as a radix tree; auto-finds the longest shared prefix with ANY prior request", code: "generalizes prefix caching beyond\nexact-match-only (vLLM's approach)" },
        { term: "vs vLLM's prefix caching", desc: "vLLM: exact-match only. SGLang: any degree of overlap, automatically", code: "same research lineage (UC Berkeley\nSky Computing Lab), different bet" },
        { term: "Frontend DSL (sgl)", desc: "Python-embedded language for structured, multi-call programs", code: "import sglang as sgl\n@sgl.function\ndef prog(s, x): ..." },
        { term: "Program as scheduling hint", desc: "Expressing structure lets the runtime optimize the WHOLE program", code: "fork/join tells the runtime:\n'these branches share this prefix'" },
        { term: "OpenAI-compatible API", desc: "Same shape as vLLM's server; existing client code mostly just works", code: "client = OpenAI(base_url='http://localhost:30000/v1')" },
        { term: "Constrained decoding", desc: "Guarantees output SHAPE (regex/schema), not semantic correctness", code: "sgl.gen('x', regex=r'\\{\"name\": \"[^\"]+\"\\}')" },
        { term: "Origin", desc: "UC Berkeley Sky Computing Lab -- the same lineage as vLLM", code: "close intellectual siblings,\nnot unrelated competitors" },
      ],
    },
    {
      title: "Frontend DSL Building Blocks",
      color: "blue",
      rows: [
        { term: "@sgl.function", desc: "Decorator defining a structured generation program", code: "@sgl.function\ndef qa(s, question):\n    s += sgl.user(question)\n    s += sgl.assistant(sgl.gen('answer'))" },
        { term: "s += sgl.user(...) / sgl.assistant(...)", desc: "Build up the conversation/program state incrementally", code: "s += sgl.system(\"You are helpful.\")\ns += sgl.user(\"hi\")" },
        { term: "sgl.gen(name, ...)", desc: "A named generation call within a program", code: "sgl.gen('answer', max_tokens=200, temperature=0.7)" },
        { term: "s.fork(n)", desc: "Create N parallel branches sharing the prefix so far", code: "forks = s.fork(3)\nfor i, f in enumerate(forks): ...\nforks.join()" },
        { term: "regex= / json_schema=", desc: "Constrain a gen() call's output shape", code: "sgl.gen('result', regex=r'\\d+')" },
        { term: "sgl.set_default_backend", desc: "Point the frontend program at a running server", code: "sgl.set_default_backend(\n  sgl.RuntimeEndpoint('http://localhost:30000'))" },
        { term: "state['name']", desc: "Read a named gen() result out after .run()", code: "state = qa.run(question=\"hi\")\nprint(state['answer'])" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Launch a server", desc: "Serve an open-weight model with the OpenAI-compatible API", code: "python -m sglang.launch_server \\\n  --model-path meta-llama/Llama-3.1-8B-Instruct --port 30000" },
        { term: "Call via OpenAI client", desc: "Simple one-shot completions -- no DSL needed", code: "client.chat.completions.create(model=m, messages=msgs, timeout=30)" },
        { term: "Always set a timeout", desc: "Your own server is still a network dependency", code: "client.chat.completions.create(..., timeout=30)" },
        { term: "Multi-turn = automatic reuse", desc: "No special caching config needed for growing conversations", code: "turn 2's prefix (system + turn 1) is\nALREADY cached -- only the new suffix computes" },
        { term: "Validate constrained output semantically", desc: "Shape-conformant is not the same as correct", code: "parsed = json.loads(state['result'])\nassert 0 <= parsed['age'] <= 150  # sanity check" },
        { term: "Bound externally-influenced structure", desc: "Never let untrusted input set fork/loop counts unbounded", code: "safe_n = min(max(1, requested_n), MAX_FORKS)" },
        { term: "Check server health", desc: "Wire into orchestrator readiness probes", code: "curl -f http://localhost:30000/health" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Self-consistency sampling", desc: "fork() into N reasoning branches, majority-vote the final answer", code: "forks = s.fork(5)\n# generate + vote across branches" },
        { term: "Tree-of-thought / branching reasoning", desc: "Express diverging candidate reasoning paths natively", code: "shared prefix cached once,\nbranches diverge and generate independently" },
        { term: "Structured extraction pipelines", desc: "Regex/schema-constrained generation for reliable data extraction", code: "sgl.gen('result', regex=NAME_AGE_REGEX)" },
        { term: "Tensor parallelism", desc: "Shard a large model across GPUs (same reasoning as vLLM)", code: "python -m sglang.launch_server --tp-size 4 ..." },
        { term: "--mem-fraction-static", desc: "Memory budget for weights + KV cache / radix tree", code: "--mem-fraction-static 0.85" },
        { term: "Session-affinity routing", desc: "Route related requests to the same replica to preserve cache-hit rate", code: "# gateway-layer routing, not default\n# k8s round-robin load balancing" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Choosing SGLang by default habit", desc: "Its advantage depends on your workload actually having prefix overlap", code: "# benchmark against vLLM on YOUR\n# real traffic, don't assume a winner" },
        { term: "Independent API calls for a multi-step program", desc: "Loses scheduling/caching info the DSL would give the runtime", code: "# WRONG: 5 separate chat.completions.create() calls\n# RIGHT: one @sgl.function with structure expressed" },
        { term: "Trusting schema conformance as correctness", desc: "A well-formed but wrong extraction still matches the regex", code: "# always validate CONTENT separately\n# from SHAPE conformance" },
        { term: "Never checking cache-hit rate", desc: "Can't tell if RadixAttention is even helping your traffic", code: "# monitor radix-tree cache-hit rate\n# specifically, not just throughput" },
        { term: "Naive round-robin across replicas", desc: "Each replica has its own independent radix tree", code: "# fragments cache-reuse for related requests\n# -- consider session-affinity routing" },
        { term: "Unbounded fork/loop counts from user input", desc: "Resource-exhaustion risk specific to the frontend DSL", code: "# always clamp to a reviewed MAX_FORKS ceiling" },
        { term: "No client-side timeout", desc: "Same mistake as with any self-hosted engine", code: "# WRONG: create(model=m, messages=msgs)\n# RIGHT: create(..., timeout=30)" },
        { term: "Dynamically-built regex from untrusted input", desc: "Unvalidated constraint construction is a risk vector", code: "# prefer statically-defined constraints;\n# validate any dynamic ones" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Official Docker image", desc: "lmsysorg/sglang as the base for production containers", code: "FROM lmsysorg/sglang:latest" },
        { term: "Gateway pattern", desc: "Auth, rate limiting, routing in front of SGLang replicas", code: "client -> gateway -> SGLang replica pool\n(consider session-affinity routing)" },
        { term: "Metrics to watch", desc: "The SGLang-specific one plus the shared vLLM-style set", code: "radix_cache_hit_rate  <- SGLang-specific\nttft, inter-token latency, queue depth" },
        { term: "Version-control sgl programs", desc: "Frontend-language code encodes real business logic", code: "# treat like any reviewed application code,\n# not just infra config" },
        { term: "vLLM comparison tie-in", desc: "See the vLLM skill for shared serving foundations", code: "# same continuous-batching lineage,\n# different prefix-sharing bet" },
        { term: "AI Evals tie-in", desc: "Validate semantic correctness of constrained-decoding output", code: "# schema conformance != content correctness" },
        { term: "Secrets Management tie-in", desc: "Credentials for the gateway layer, not hardcoded", code: "# see Secrets Management skill" },
      ],
    },
  ],
};

export default sglang;
