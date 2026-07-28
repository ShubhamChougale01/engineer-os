import type { CheatSheetData } from "./types";

const costOptimization: CheatSheetData = {
  title: "The Ultimate Cost Optimization Cheat Sheet",
  subtitle: "Token economics · caching · routing · batching · circuit breakers · production toolbelt",
  sections: [
    {
      title: "Core Cost Model",
      color: "violet",
      rows: [
        { term: "Token-level cost formula", desc: "The base formula every LLM cost decision reduces to", code: "cost = (in_tokens/1000)*price_in\n     + (out_tokens/1000)*price_out" },
        { term: "Input vs output asymmetry", desc: "Output tokens typically cost several times more per unit than input tokens", code: "verbose reply > long prompt + short reply\n# for the SAME total token count" },
        { term: "Context length as cost multiplier", desc: "Every token in context is billed on every call that includes it", code: "growing chat history\n-> each new turn re-bills all prior turns" },
        { term: "Overspend risk", desc: "Sending every request to the frontier model wastes cost on easy requests", code: "100k reqs/day x frontier price\n= huge bill for mostly-simple traffic" },
        { term: "Underspend risk", desc: "Always using the cheapest model risks silent quality failures on hard requests", code: "cheap model on multi-step reasoning\n-> wrong answer, no error thrown" },
        { term: "Blended cost per request", desc: "The metric that proves any cost strategy is actually working", code: "blended = sum(cost_i) / n_requests\n# compare vs always-frontier baseline" },
        { term: "Reasoning / hidden tokens", desc: "Internal 'thinking' tokens some models bill but never show in the response", code: "true_cost = visible_output_cost\n          + reasoning_token_cost  # check usage metadata" },
      ],
    },
    {
      title: "Prompt Caching",
      color: "blue",
      rows: [
        { term: "Prompt caching", desc: "Mark a stable, reused prefix so repeat calls are billed at a discounted rate on that portion", code: "prefix = system_prompt + reference_doc  # stable\nsuffix = user_query                     # variable" },
        { term: "Cache-friendly ordering", desc: "Stable content FIRST, variable content LAST — never interleaved", code: "prompt = STABLE_PREFIX + VARIABLE_SUFFIX\n# never: VARIABLE + STABLE" },
        { term: "Cache-breaking mistake", desc: "Reordering or mutating the 'identical' prefix silently disables caching", code: "# a timestamp or random-order list inside\n# the 'stable' prefix breaks the cache" },
        { term: "Cached-token fraction", desc: "Metric confirming caching is actually firing, not just configured", code: "fraction = cached_tokens / input_tokens\n# near zero on an eligible system = bug" },
        { term: "Illustrative cache discount", desc: "Cached tokens commonly billed around a fraction of full input price (verify current rate)", code: "cached_cost = tokens * price_in * (1 - discount)\n# discount often ~0.9 (illustrative)" },
        { term: "Best use case", desc: "Large, stable system prompt or reference document reused across many calls", code: "RAG static knowledge chunk\ncoding assistant's codebase context" },
      ],
    },
    {
      title: "Routing, Batching & Response Caching",
      color: "emerald",
      rows: [
        { term: "Cost-aware model routing", desc: "Send the cheapest tier that still meets a documented quality floor", code: "tier = cheapest([t for t in tiers\n  if t.pass_rate >= quality_floor])" },
        { term: "Fail toward quality", desc: "On ambiguous signals, default to the safer, more capable tier — not the cheap one", code: "tier = MAP.get(verdict, 'large')  # default = safe\n# never MAP.get(verdict, 'small')" },
        { term: "Cascade escalation", desc: "Try cheap first; escalate only if a real confidence check fails", code: "ans = call('small', req)\nif not passes_check(ans):\n    ans = call('large', req)" },
        { term: "Batching for throughput discount", desc: "Latency-tolerant, non-interactive workloads get a discounted async rate", code: "if not latency_sensitive:\n    submit_batch_job(requests)  # cheaper, delayed" },
        { term: "Batching qualifying question", desc: "The only test that matters before adopting batch APIs", code: "can_this_wait = not needs_realtime_answer\nif can_this_wait: use_batch_api()" },
        { term: "Response caching", desc: "Skip the model call entirely for an exact or near-duplicate query", code: "key = hash(model + prompt)\nif key in cache: return cache[key]" },
        { term: "Response vs prompt caching", desc: "Response cache skips the model call; prompt cache discounts a reused prefix inside a call", code: "response cache -> full output reused\nprompt cache   -> partial input reused" },
        { term: "Output length capping", desc: "Hard token ceiling plus a concision instruction bound the pricier half of the bill", code: "call_model(prompt, max_output_tokens=300,\n  system='Answer in <=3 sentences.')" },
      ],
    },
    {
      title: "Self-Hosting & Quantization",
      color: "amber",
      rows: [
        { term: "Quantization", desc: "Running a model at reduced numeric precision to cut memory/compute footprint", code: "fp16 weights -> int8 / int4 weights\n# smaller footprint, small quality cost" },
        { term: "Self-hosting tradeoff", desc: "Trades per-token API billing for GPU + engineering + operational cost", code: "API: pay-per-token, zero ops\nself-hosted: fixed infra cost + ops burden" },
        { term: "Total cost of ownership (TCO)", desc: "The correct comparison — never GPU-rental price vs API price alone", code: "TCO = infra_cost + engineering_cost\n    + ops_cost   (compare vs API cost at volume)" },
        { term: "Break-even volume", desc: "The sustained, predictable volume point where self-hosting starts undercutting API pricing", code: "self_host_cost_per_req < api_cost_per_req\n# only at high, sustained, predictable volume" },
        { term: "When self-hosting wins", desc: "High sustained volume, or data-residency/compliance requirements", code: "reasons to self-host:\n  cost at scale, AND/OR compliance" },
        { term: "When self-hosting loses", desc: "Low or spiky volume where ops overhead dominates the comparison", code: "low/spiky volume\n-> hosted API usually cheaper overall" },
      ],
    },
    {
      title: "Pitfalls & Anti-Patterns",
      color: "rose",
      rows: [
        { term: "Biggest model for everything", desc: "The most common and most expensive mistake — most traffic doesn't need frontier capability", code: "# WRONG\nreturn call_model('frontier', text)  # always" },
        { term: "Unbounded context growth", desc: "Untrimmed conversation history re-bills every prior turn on every new turn", code: "# WRONG: history.append(...) forever\n# RIGHT: trim/summarize after N turns" },
        { term: "No cost circuit breaker", desc: "A bug, retry storm, or abusive tenant can drive unbounded spend unchecked", code: "if spent + cost > budget:\n    downgrade_or_reject()  # must be in request path" },
        { term: "Cache-eligible ordering broken", desc: "An 'innocent' refactor reorders fields and silently kills caching — no error thrown", code: "# regression-test the prefix order:\nassert prompt_prefix == KNOWN_STABLE_PREFIX" },
        { term: "Unbounded output generation", desc: "Letting a model be 'thorough' wastes the pricier half of the token bill", code: "# always set max_output_tokens\n# plus a concision instruction" },
        { term: "Aggregate-bill-only monitoring", desc: "Without per-feature/per-user breakdown, a cost spike is undiagnosable", code: "# WRONG: total_spend_this_month\n# RIGHT: spend_by_feature, spend_by_user" },
        { term: "Optimizing cost with no quality signal", desc: "A cheaper path with no eval check is an untested regression, not an optimization", code: "# every cost cut needs:\n# a documented quality-floor check (see AI Evals)" },
        { term: "Stale response cache", desc: "Serving a cached answer forever after the correct answer has changed", code: "# always set cache expiry / invalidation\ncache.set(key, value, ttl=3600)" },
        { term: "Retry storm cost amplification", desc: "Naive retries during a provider outage multiply cost right when errors spike", code: "# use exponential backoff + a retry ceiling\n# not immediate unlimited retries" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Cost circuit breaker", desc: "Enforce a per-request/session/tenant budget in the request path itself", code: "class CostCircuitBreaker:\n    def check_and_reserve(self, cost, alt_cost): ..." },
        { term: "Per-feature cost logging", desc: "Log actual (not estimated) tokens and cost, tagged by feature and user", code: "log.info('request_cost', feature=..., user_id=...,\n  input_tokens=..., cached_tokens=..., cost_usd=...)" },
        { term: "Per-feature / per-user dashboard", desc: "The breakdown that actually finds a runaway cost source", code: "cost_by_feature.groupby('feature').sum()\ncost_by_user.sort_values(ascending=False)" },
        { term: "Cost-driver trend monitoring", desc: "Catches slow 'cost creep' that no single alert would trigger", code: "watch: avg input tokens/req over time,\ncache-hit rate over time, avg output length" },
        { term: "Pricing as external config", desc: "Rate cards live in versioned config, never hard-coded — providers change prices often", code: "model_pricing.yaml\n# hot-reloadable, not baked into code" },
        { term: "Shared budget counters at scale", desc: "Per-tenant spend must be atomic and shared across gateway instances", code: "# Redis atomic increment/check\n# not in-process memory per instance" },
        { term: "Cost-regression test", desc: "Replay fixed traffic through current config; assert blended cost hasn't silently regressed", code: "def test_blended_cost_within_baseline():\n    assert blended_cost(sample) <= BASELINE * 1.05" },
        { term: "Health check includes cost infra", desc: "A gateway is not 'healthy' if its shared budget/cache store is unreachable", code: "GET /healthz ->\n  check process AND Redis (budget/cache) reachability" },
      ],
    },
  ],
};

export default costOptimization;
