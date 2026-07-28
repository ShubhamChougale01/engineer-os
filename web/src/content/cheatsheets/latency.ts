import type { CheatSheetData } from "./types";

const latency: CheatSheetData = {
  title: "The Ultimate AI Latency Cheat Sheet",
  subtitle: "TTFT vs inter-token latency, perceived latency, pipeline bottlenecks, and the fixes that match each one",
  sections: [
    {
      title: "Core Latency Metrics",
      color: "violet",
      rows: [
        { term: "Time to first token (TTFT)", desc: "Time from request sent to first output token appearing; dominated by network, queueing, and prefill", code: "ttft = first_token_time - request_sent_time" },
        { term: "Inter-token latency (ITL)", desc: "Time between consecutive streamed tokens once generation has started; dominated by decode", code: "itl = decode_time / (token_count - 1)" },
        { term: "Tokens per second (TPS)", desc: "Inverse of ITL; the throughput view of decode speed", code: "tps = (token_count - 1) / decode_time" },
        { term: "End-to-end latency", desc: "Total time from request to final response, including network both ways", code: "total = network_in + queue + ttft_remainder + decode + network_out" },
        { term: "Per-stage latency", desc: "Latency of each pipeline component measured independently: retrieval, each tool call, prompt assembly", code: "log(stage='retrieval', duration=t)\nlog(stage='tool_call:pricing', duration=t)" },
        { term: "p50 / p95 / p99", desc: "Median vs tail percentiles; tail is what a real fraction of users actually experience", code: "p99 = sorted(samples)[int(0.99 * (n-1))]" },
        { term: "Why track separately", desc: "TTFT and ITL are driven by different pipeline stages and can regress independently", code: "# never report one blended 'response time' number" },
      ],
    },
    {
      title: "Perceived Latency & Streaming",
      color: "blue",
      rows: [
        { term: "Streaming responses", desc: "Send tokens to the client as produced, not buffered until the end", code: "for token in engine.stream(prompt):\n    yield token  # SSE / chunked / WebSocket" },
        { term: "Perceived vs actual latency", desc: "Users feel time-to-first-progress, not total duration; streaming changes the former only", code: "# total time UNCHANGED, but user sees output at TTFT" },
        { term: "Buffering anti-pattern", desc: "Waiting for the full response before sending anything wastes a near-free UX win", code: "# WRONG: return full_response  # after ALL tokens generated" },
        { term: "Progress signals", desc: "Typing indicators, partial UI updates -- reduce perceived wait independent of real wait", code: "# same principle as a progress bar in any UI" },
        { term: "Streaming transport", desc: "SSE, chunked HTTP, or WebSockets carry incremental tokens; see the Streaming skill", code: "Content-Type: text/event-stream" },
      ],
    },
    {
      title: "Where Latency Lives in a Pipeline",
      color: "emerald",
      rows: [
        { term: "Network round trip", desc: "Client-server hops; geography matters (same-region vs cross-continent)", code: "# same region: ~10-30ms; cross-continent: +100-200ms" },
        { term: "Queueing delay", desc: "Time waiting for a free serving slot before the model call even starts", code: "# rising queue depth = undersized capacity, not slow tokens" },
        { term: "Prefill", desc: "Parallel forward pass over the whole prompt; scales with prompt length", code: "# see Inference skill: compute-bound, drives TTFT" },
        { term: "Decode", desc: "Sequential, one token per step; scales with generation length", code: "# see Inference skill: memory-bandwidth-bound, drives ITL" },
        { term: "Retrieval step (RAG)", desc: "Embed query + vector search + fetch docs -- its own latency profile, separate from the model", code: "# a slow vector DB can dominate total latency" },
        { term: "Tool-call round trip", desc: "External API/DB/sandbox call; each one adds a full round trip, sometimes mid-generation", code: "# agent loop: model -> tool call -> model AGAIN" },
        { term: "Orchestration overhead", desc: "Prompt assembly, guardrail checks, parsing -- usually small but easy to forget to measure", code: "# instrument it anyway; assumptions are wrong at scale" },
      ],
    },
    {
      title: "Fixes Matched to Bottlenecks",
      color: "amber",
      rows: [
        { term: "Prompt / prefix caching", desc: "Reuse cached KV state for a stable shared prefix; cuts TTFT for repeated system prompts", code: "enable_prefix_caching: true" },
        { term: "Smaller / faster model routing", desc: "Route simple requests to a cheaper, faster model; validate quality before shipping", code: "if is_simple(req): route(small_model)\nelse: route(large_model)" },
        { term: "Speculative decoding", desc: "Draft model proposes tokens; target model verifies in one parallel pass, cuts ITL", code: "# payoff depends on draft acceptance rate -- measure it" },
        { term: "Parallelize independent stages", desc: "Highest-leverage fix: run stages with no data dependency concurrently, not sequentially", code: "results = await asyncio.gather(retrieve(), call_tool())\n# total ~= max(stage_times), not sum" },
        { term: "Trim prompt / context size", desc: "Summarize history, cap retrieved docs, drop unused boilerplate -- cuts prefill time", code: "history = summarize(history) if len(history) > N else history" },
        { term: "Timeouts + fallback", desc: "Every external dependency needs a bound; fail safe and CLEARLY FLAGGED, never silent", code: "try:\n    result = await asyncio.wait_for(tool_call(), timeout=0.5)\nexcept TimeoutError:\n    result = DEGRADED_FALLBACK" },
        { term: "Hedged / redundant requests", desc: "Issue duplicate calls to a high-variance dependency, take whichever returns first", code: "# classic distributed-systems tail-latency trick" },
      ],
    },
    {
      title: "Tail Latency & SLOs",
      color: "rose",
      rows: [
        { term: "Averages hide the tail", desc: "A great mean latency can coexist with a terrible p99 -- always set SLOs at p95/p99", code: "# alert on p95/p99 crossing threshold, not just mean" },
        { term: "Tail compounds with stage count", desc: "Each sequential, independently-variable stage adds a chance of a spike; pipeline p99 >> any single stage's p99", code: "# 4 stages, 1% spike chance each -> ~1-in-25 request affected" },
        { term: "Fewer stages beats faster stages", desc: "Reducing stage count (parallelize/eliminate) is often a bigger tail-latency lever than speeding up one stage", code: "# critical path = longest chain of REAL dependencies" },
        { term: "Concurrency verification", desc: "Confirm 'parallel' code is actually parallel: wall-clock ~= slowest stage, not the sum", code: "assert elapsed < max(stage_times) * 1.5" },
        { term: "Load-test with realistic traffic", desc: "Uniform synthetic prompts understate real tail latency; use variable-length, variable-latency mixes", code: "# see the Serving / Scaling AI skills for load-testing tooling" },
      ],
    },
    {
      title: "Tradeoffs & Pitfalls",
      color: "cyan",
      rows: [
        { term: "Latency / quality / cost triangle", desc: "Improving one usually trades against another; make the tradeoff explicit, don't assume free lunches", code: "# smaller model: latency+cost down, quality risk up" },
        { term: "Blended metrics pitfall", desc: "Treating TTFT + ITL + total time as one number hides which part actually regressed", code: "# track each metric AND each pipeline stage separately" },
        { term: "Accidental sequential fan-out", desc: "Writing independent stages one after another by default; the #1 avoidable latency cost", code: "# WRONG: r = await retrieve(); t = await call_tool()\n# RIGHT: r, t = await asyncio.gather(retrieve(), call_tool())" },
        { term: "Unbounded context growth", desc: "Replaying full history/retrieved docs every turn silently inflates TTFT over a conversation's life", code: "# audit prompt-assembly logic on an ongoing basis" },
        { term: "Routing without re-validating quality", desc: "A latency win that regresses quality on routed traffic is not a net win", code: "# gate routing changes behind an eval-set quality check" },
        { term: "No timeout on external dependencies", desc: "One slow/flaky tool or retrieval backend becomes the whole pipeline's worst case", code: "# always set a timeout + a clearly-flagged fallback" },
      ],
    },
  ],
};

export default latency;
