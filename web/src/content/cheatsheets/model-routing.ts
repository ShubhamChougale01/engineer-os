import type { CheatSheetData } from "./types";

const modelRouting: CheatSheetData = {
  title: "The Ultimate Model Routing Cheat Sheet",
  subtitle: "Decision axes · strategies · cascades · multi-provider · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Model routing", desc: "Dynamically choosing which model handles a request, instead of one fixed model for all traffic", code: "route(request) -> model_tier\nresponse = call_model(model_tier, request)" },
        { term: "Overspend risk", desc: "Sending every request to the frontier model wastes cost on easy requests", code: "100k reqs/day x frontier price\n= huge bill for mostly-simple traffic" },
        { term: "Underspend risk", desc: "Sending everything to the cheapest model risks silent quality failures on hard requests", code: "cheap model on multi-step reasoning\n-> wrong answer, no error thrown" },
        { term: "Routing tier abstraction", desc: "Application code calls a named tier, never a literal model string", code: "call_model('small', prompt)\n# not call_model('gpt-4o-mini', prompt)" },
        { term: "Hard filter vs soft optimization", desc: "Context length and tool support disqualify candidates first; cost/latency/quality optimize among survivors", code: "candidates = [m for m in pool\n  if m.context >= needed\n  and (not needs_tools or m.tools)]" },
        { term: "Fail toward quality", desc: "On ambiguous or unexpected signals, default to the safer, more capable tier", code: "verdict = classify(req)\ntier = MAP.get(verdict, 'large')  # default = safe" },
        { term: "Decision axes", desc: "The five things every routing decision weighs", code: "cost, latency,\nquality/capability needed,\ncontext length required,\ntool-use / structured-output support" },
      ],
    },
    {
      title: "Model Pool & Data Structures",
      color: "blue",
      rows: [
        { term: "Model pool config", desc: "Declarative, external config — not hard-coded model names in app code", code: "tiers:\n  small: {model: gpt-4o-mini, cost: 0.0006}\n  large: {model: claude-opus, cost: 0.075}" },
        { term: "ModelSpec", desc: "Per-model metadata used for filtering and selection", code: "ModelSpec(name, cost_per_1k_out,\n  context_window, supports_tools)" },
        { term: "Signals dict", desc: "Cheap, pre-model-call features extracted from the request", code: "signals = {'length': len(text),\n  'is_code': bool(re.search(pat, text)),\n  'context_tokens': n}" },
        { term: "Routing decision log entry", desc: "What must be recorded for every request, not just the final answer", code: "{request_id, signals, chosen_tier,\n strategy, escalated, latency_ms, cost_usd}" },
        { term: "Confidence check result", desc: "Boolean/score gate deciding whether a cascade escalates", code: "def passes_check(answer):\n    return bool(answer) and 'not sure' not in answer" },
        { term: "Budget-aware state", desc: "Per-session/tenant spend tracker used to force cheaper tiers near a cap", code: "class BudgetRouter:\n    spent = 0.0\n    budget = 5.00" },
      ],
    },
    {
      title: "Routing Strategies",
      color: "emerald",
      rows: [
        { term: "Rule-based routing", desc: "Cheap heuristics (length, regex, metadata) map directly to a tier, no model call to decide", code: "if re.search(code_pattern, text): return 'code'\nif len(text) < 100: return 'small'\nreturn 'mid'" },
        { term: "Classifier-based routing", desc: "A small/cheap model (or trained classifier) predicts required tier before the real call", code: "verdict = call_model('small',\n  'classify difficulty: ' + text)\ntier = MAP[verdict]" },
        { term: "Cascade / fallback routing", desc: "Try cheap model first; escalate only if a confidence check fails", code: "answer = call_model('small', req)\nif not passes_check(answer):\n    answer = call_model('large', req)" },
        { term: "Layered routing", desc: "Combine rules (obvious cases) + classifier/cascade (ambiguous middle) in one policy", code: "tier = rule_based(req) or classify(req)\nanswer = cascade(tier, req)" },
        { term: "Step-level routing", desc: "Route each step of an agent pipeline separately, not just the top-level request", code: "plan -> frontier model\ntool_format -> small model\nsummarize -> mid model" },
        { term: "Learned router", desc: "Trained on (request, model, outcome) triples to predict best tier per query", code: "router_model.predict(embed(request))\n-> tier  # RouteLLM-style" },
        { term: "Escalation depth cap", desc: "Escalate at most once, straight to the right stronger tier — never step through every tier", code: "small -> large   # good\nsmall -> mid -> large   # avoid: 2x latency+cost" },
      ],
    },
    {
      title: "Confidence Checks & Multi-Provider",
      color: "amber",
      rows: [
        { term: "Structural validation", desc: "Cheapest, most reliable check for structured-output tasks", code: "try:\n    json.loads(answer)\nexcept json.JSONDecodeError:\n    escalate()" },
        { term: "Refusal / uncertainty detection", desc: "Moderate-reliability check via phrase matching", code: "bad_phrases = [\"I'm not sure\", 'I cannot']\nany(p in answer for p in bad_phrases)" },
        { term: "Logprob-based confidence", desc: "Real confidence signal when the provider exposes token log-probabilities", code: "avg_logprob = mean(token_logprobs)\nif avg_logprob < threshold: escalate()" },
        { term: "Judge-model check", desc: "Independent model grades the first answer — most reliable, highest cost", code: "verdict = call_model('judge',\n  f'Grade this answer: {answer}')" },
        { term: "Multi-provider routing", desc: "Route across OpenAI/Anthropic/open-weight for cost, redundancy, capability", code: "providers = {openai, anthropic, self_hosted}\nchoose(providers, tier)" },
        { term: "Abstraction-layer tradeoff", desc: "A shared interface across providers loses provider-specific features", code: "# lowest-common-denominator API\n# loses unique tool-call formats,\n# unique caching mechanisms, etc." },
        { term: "Provider failover", desc: "Automatic switch to backup provider on outage/rate-limit", code: "try:\n    call(primary_provider, tier)\nexcept (Timeout, RateLimitError):\n    call(backup_provider, tier)" },
        { term: "Rate-limit headroom tracking", desc: "Route around a provider nearing its own rate limit, not just a fully-down one", code: "if headroom(provider) < 0.1:\n    prefer_alternate_provider()" },
      ],
    },
    {
      title: "Pitfalls & Anti-Patterns",
      color: "rose",
      rows: [
        { term: "Length-only routing", desc: "Weak proxy: short-but-hard and long-but-easy requests both misroute", code: "'explain the halting problem'  # short, hard\n'reformat this 3000-word doc'  # long, easy" },
        { term: "Cheap-default on classifier failure", desc: "Turns every classifier hiccup into a silent quality regression", code: "# WRONG\ntier = MAP.get(verdict, 'small')\n# RIGHT\ntier = MAP.get(verdict, 'large')" },
        { term: "Fake cascade", desc: "No real confidence check means 'cascade' is just always-cheap in disguise", code: "answer = call_model('small', req)\nreturn answer  # never checks, never escalates" },
        { term: "Shared prompt across tiers", desc: "Small model 'seems dumb' when the real issue is an unadapted prompt", code: "# small tier needs its OWN prompt variant\n# see Prompt Versioning skill" },
        { term: "Hard-coded model strings", desc: "Turns a model swap into a multi-file find-and-replace instead of a config edit", code: "# WRONG: call_model('gpt-4o-mini', p)\n# RIGHT: call_model(pool['small'], p)" },
        { term: "Sequential tier escalation", desc: "Stepping through every tier multiplies latency/cost on the hardest requests", code: "# avoid: small -> mid -> large\n# prefer: small -> large (one hop)" },
        { term: "No decision logging", desc: "Only logging final responses makes quality complaints untraceable to a tier/reason", code: "log.info('routing_decision', signals=...,\n  chosen_tier=..., escalated=...)" },
        { term: "Silent quality bottleneck", desc: "Routing bugs degrade quality with no exception thrown — must be monitored directly", code: "watch: tier distribution drift,\nper-tier outcome quality over time" },
        { term: "Cost-based denial of service", desc: "Attacker triggers escalation reliably, forcing every request onto the priciest tier", code: "rate-limit + budget-cap escalation\nper tenant/session" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Semantic cache check", desc: "Check before routing — a hit skips the model pool entirely", code: "if (hit := cache.lookup(req)):\n    return hit\ntier = route(req)" },
        { term: "Structured decision logging", desc: "Log signals + decision + outcome for every request, not just the response", code: "log.info('routing_decision',\n  request_id=id, chosen_tier=tier,\n  escalated=esc, cost_usd=cost)" },
        { term: "Tier distribution metric", desc: "Confirms routing matches expectations — most traffic should NOT hit frontier", code: "Counter('requests_per_tier',\n  labels=['tier'])" },
        { term: "Escalation rate metric", desc: "Rising rate signals harder traffic or a cheap-tier regression", code: "escalation_rate = escalations / total_cascade_calls" },
        { term: "Blended cost per request", desc: "The number that proves routing beats a single-model baseline", code: "blended = sum(cost_i) / n_requests\n# compare vs always-frontier baseline" },
        { term: "Shadow-mode rollout", desc: "Run a new routing policy in parallel on live traffic before serving it", code: "new_tier = new_policy(req)  # logged only\nold_tier = current_policy(req)  # actually served" },
        { term: "Per-session budget circuit breaker", desc: "Forces a cheaper tier once spend nears a cap, instead of failing outright", code: "if spent + cost[tier] > budget:\n    tier = cheapest_affordable(candidates)" },
        { term: "Unit-testable routing function", desc: "Keep the decision pure and side-effect-free — no real model calls in tests", code: "def test_code_routes_to_code_tier():\n    assert route({'message': 'def f():'}) == 'code'" },
        { term: "Provider credential scoping", desc: "Least-privilege, rotated keys per provider in a secrets manager", code: "# never inline in model_pool.yaml\n# see Secrets Management skill" },
        { term: "Health check includes providers", desc: "Router 'healthy' status must reflect actual provider reachability", code: "GET /healthz ->\n  check router process AND each provider ping" },
      ],
    },
  ],
};

export default modelRouting;
