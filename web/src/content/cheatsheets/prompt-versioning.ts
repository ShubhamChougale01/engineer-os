import type { CheatSheetData } from "./types";

const promptVersioning: CheatSheetData = {
  title: "The Ultimate Prompt Versioning Cheat Sheet",
  subtitle: "Registry pattern · semver · canary rollout · rollback · safe templating",
  sections: [
    {
      title: "Core Lifecycle & Concepts",
      color: "violet",
      rows: [
        { term: "Prompt identity", desc: "A stable name independent of version number", code: "name: support-assistant\nversion: 1.3.0" },
        { term: "Immutable version", desc: "Published content never edited in place", code: "publish(v1.3.0)  # new record\n# never: edit v1.3.0 content" },
        { term: "Lifecycle states", desc: "The status a version moves through", code: "draft -> candidate -> live -> deprecated" },
        { term: "Pointer flip", desc: "Promotion/rollback moves a pointer, not content", code: "live_pointer[name] = '1.3.0'  # O(1)" },
        { term: "Prompts as code", desc: "Embedded in source, deployed via CI/CD", code: "SYSTEM_PROMPT = '...'\n# safer, reviewed, slower to iterate" },
        { term: "Prompts as data", desc: "Externalized registry, updated independently", code: "registry.publish(name, template)\n# faster iterate, needs eval gate" },
        { term: "Why it matters", desc: "Small diff can hide a large behavior change", code: "'summarize' -> 'briefly summarize'\n# tone/length/cost can all shift" },
        { term: "Template vs data", desc: "Fixed instruction text vs runtime variables", code: "System: answer using context.\nContext: {{ retrieved_context }}" },
      ],
    },
    {
      title: "Registry & Metadata",
      color: "blue",
      rows: [
        { term: "PromptVersion fields", desc: "Minimum schema for a registry record", code: "name, version, template, model_target,\nowner, changelog, eval_scores, status" },
        { term: "Owner", desc: "Who is accountable for this version", code: "owner: 'support-team@acme'" },
        { term: "Changelog", desc: "Why it changed, not just what changed", code: "'Clarify refund policy wording\nafter Q3 support escalation review'" },
        { term: "Eval scores", desc: "Attached before a version can be promoted", code: "eval_scores = {'accuracy': 0.94,\n               'safety': 0.99}" },
        { term: "Model target scoping", desc: "One prompt name, variants per model", code: "get_live(name, model_target='claude')\nget_live(name, model_target='gpt')" },
        { term: "Audit log", desc: "Who did what, when, on every write", code: "audit_log(name, action='promote',\n           by='alice', at=now())" },
        { term: "RBAC on writes", desc: "Separate propose / promote / rollback perms", code: "can_draft, can_promote, can_rollback" },
        { term: "Unique constraint", desc: "One immutable record per (name, version)", code: "UNIQUE (name, version)" },
      ],
    },
    {
      title: "Semver for Prompts",
      color: "emerald",
      rows: [
        { term: "MAJOR bump", desc: "Breaking contract change", code: "output format, model target,\nrequired input, or safety behavior changes" },
        { term: "MINOR bump", desc: "Non-breaking improvement", code: "new few-shot example, clearer phrasing,\nbetter edge-case handling" },
        { term: "PATCH bump", desc: "No intended behavior change", code: "typo fix, whitespace, internal rename" },
        { term: "Intent vs proof", desc: "A version bump is a stated intent only", code: "# only the eval run confirms\n# a 'patch' didn't change behavior" },
        { term: "Every bump needs eval", desc: "No version is exempt from the gate", code: "if eval_score < min_score:\n    reject_promotion()" },
      ],
    },
    {
      title: "Canary & A/B Rollout",
      color: "amber",
      rows: [
        { term: "Traffic split example", desc: "Stable vs candidate", code: "95% stable v1.2.0\n5%  candidate v1.3.0-rc1" },
        { term: "Deterministic bucketing", desc: "Same user, same variant, every time", code: "bucket = hash(user_id) % 10000 / 10000\ncandidate if bucket < pct else stable" },
        { term: "Why not random per request", desc: "Keeps a user's experience consistent", code: "# random.random() per call breaks\n# session-level comparison" },
        { term: "Metrics tracked", desc: "The four pillars of a promotion decision", code: "quality, safety, cost, latency" },
        { term: "Promotion rule", desc: "All guardrails must hold, not just quality", code: "quality_c >= quality_s - eps\nsafety_c >= safety_s\ncost_c <= cost_s * 1.15\np95_c <= p95_s * 1.10" },
        { term: "Safety never traded off", desc: "A quality win never excuses a safety loss", code: "if safety_c < safety_s: reject()" },
        { term: "Hold vs rollback", desc: "Two outcomes when criteria fail", code: "hold: iterate at current %\nrollback: candidate -> 0% traffic" },
        { term: "Observation window", desc: "Enough time/volume for signal", code: "48h OR N requests, whichever larger" },
      ],
    },
    {
      title: "Rollback, Diffing & Pitfalls",
      color: "rose",
      rows: [
        { term: "Rollback = pointer flip", desc: "Never a content edit or redeploy", code: "def rollback(name):\n    prev = history[-2]\n    set_live(name, prev.version)" },
        { term: "Rehearse rollback", desc: "Time it before an incident forces it", code: "target: rollback completes in < 1 min" },
        { term: "Text diff insufficient", desc: "Pair with an eval-score diff always", code: "diff(old, new)\n+ compare(eval(old), eval(new))" },
        { term: "One word, big effect", desc: "Never skip canary for 'small' changes", code: "'always cite sources' ->\n'cite sources'  # compliance drop" },
        { term: "Anti-pattern: edit live in place", desc: "Destroys rollback and audit trail", code: "WRONG: UPDATE prompts SET template=...\nRIGHT: publish new version, flip pointer" },
        { term: "Anti-pattern: no canary", desc: "100% cutover on an unproven candidate", code: "WRONG: promote(v2) -> 100% traffic\nRIGHT: canary at 5% first" },
        { term: "Anti-pattern: weak changelog", desc: "\"updated prompt\" explains nothing later", code: "WRONG: 'update'\nRIGHT: 'clarify refund policy, ticket #482'" },
        { term: "Prompt drift", desc: "Accumulated cruft inflates cost silently", code: "# schedule periodic audits:\n# re-derive from first principles" },
      ],
    },
    {
      title: "Safe Templating & Security",
      color: "cyan",
      rows: [
        { term: "Jinja2 variable syntax", desc: "Explicit, escapable placeholders", code: "Template('Q: {{ question }}').render(\n  question=user_input)" },
        { term: "Danger: raw concatenation", desc: "No structural signal data vs instruction", code: "'User says: ' + user_input +\n'. Follow their instructions.'  # BAD" },
        { term: "Safer: explicit delimiters", desc: "Scope untrusted content clearly", code: "<user_data>\n{{ user_input }}\n</user_data>" },
        { term: "Delimiter change = security bump", desc: "Review it like an auth code change", code: "# weakening a delimiter is a\n# security regression, not a wording tweak" },
        { term: "Never trust rendering alone", desc: "Structural tests must assert delimiters", code: "assert '<user_data>' in template" },
        { term: "StrictUndefined", desc: "Fail loudly on a missing template variable", code: "Template(t, undefined=StrictUndefined)" },
        { term: "See also", desc: "The dedicated security skill for this attack surface", code: "Prompt Injection Defense skill" },
      ],
    },
    {
      title: "Tooling & Production Toolbelt",
      color: "violet",
      rows: [
        { term: "LangSmith Prompt Hub", desc: "Managed registry tied to LangChain evals", code: "client.pull_prompt('support-assistant')" },
        { term: "Langfuse Prompt Management", desc: "Open-source, label-based live pointer", code: "langfuse.get_prompt(name, label='production')" },
        { term: "PromptLayer", desc: "Lightweight managed prompt tracking", code: "pl.templates.get(name, version='live')" },
        { term: "Homegrown registry", desc: "DB table + API + your own eval pipeline", code: "Postgres table + FastAPI + AI Evals suite" },
        { term: "Local cache + fallback", desc: "Registry outage must never break serving", code: "cache.get(name) or last_known_good(name)" },
        { term: "Push invalidation", desc: "Rollback propagates in seconds, not TTL", code: "on_promote -> pubsub.publish('invalidate')" },
        { term: "Tag every metric", desc: "Required for canary comparison after the fact", code: "log(prompt_name, prompt_version,\n    model_target, tokens, latency)" },
        { term: "Cross-references", desc: "Where this skill connects on the platform", code: "LLMOps, AI Evals, Model Routing,\nGit, Prompt Injection Defense" },
      ],
    },
  ],
};

export default promptVersioning;
