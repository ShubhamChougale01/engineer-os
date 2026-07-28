import type { CheatSheetData } from "./types";

const guardrails: CheatSheetData = {
  title: "The Ultimate Guardrails Cheat Sheet",
  subtitle: "Input/output safety layers · rule-based vs model-based · structured validation · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Guardrail", desc: "A check/transform wrapped around an LLM call to bound its input or output", code: "input --> [checks] --> LLM\nLLM --> [checks] --> output" },
        { term: "Input guardrail", desc: "Screens content BEFORE it reaches the model", code: "rate limit, regex/PII filter,\nmoderation classifier on the prompt" },
        { term: "Output guardrail", desc: "Screens content AFTER the model generates it", code: "schema validation, moderation\nclassifier, PII redaction on the response" },
        { term: "Why both are required", desc: "A clean input can still produce a bad output, and vice versa is not covered either", code: "innocuous prompt -> model drifts\ninto unsafe/off-policy output anyway" },
        { term: "Rule-based guardrail", desc: "Deterministic check: regex, allowlist, schema validator", code: "if re.search(ssn_pattern, text):\n    flag_or_block()" },
        { term: "Model-based guardrail", desc: "Uses a classifier/LLM to judge something a fixed rule can't capture", code: "flags = moderation_client.classify(text)\nif flags: block()" },
        { term: "Defense in depth", desc: "Layer multiple checks so one bypass doesn't compromise the system", code: "rule filter -> classifier -> schema\nvalidator -> output classifier -> redact" },
        { term: "Not a solved problem", desc: "Every layer has a false-negative rate; no guardrail is 100% reliable", code: "Track false positive/negative rate\ncontinuously, never declare 'done'" },
        { term: "Guardrails vs Prompt Injection Defense", desc: "This is the broad discipline; injection defense is one deep, specific category within it", code: "See Prompt Injection Defense skill\nfor the hijacked-task-execution threat" },
      ],
    },
    {
      title: "Structured Output Validation",
      color: "blue",
      rows: [
        { term: "Why validate structure", desc: "Malformed data reaching downstream code (a tool call, DB write) is a real hazard, not just an inconvenience", code: "extra field, wrong type, or invalid JSON\ncan corrupt data or crash a pipeline" },
        { term: "Schema validation (Pydantic)", desc: "Post-hoc check that model output matches an exact typed contract", code: "class Triage(BaseModel):\n    category: str\n    priority: int" },
        { term: "Field-level validators", desc: "Enforce allowlists, ranges, and custom rules beyond basic typing", code: "@field_validator('priority')\ndef in_range(cls, v): return v if 1<=v<=5 else raise" },
        { term: "Constrained decoding", desc: "Provider-side feature forcing generation to match a schema at sampling time", code: "Guarantees SHAPE only --\nnot content correctness/policy" },
        { term: "Constrained decoding is not enough", desc: "A schema-valid object can still contain a hallucinated or unsafe value", code: "Keep post-hoc content checks even\nwith constrained decoding enabled" },
        { term: "Bounded retry with error feedback", desc: "On validation failure, feed the SPECIFIC error back to the model, capped attempts", code: "for attempt in range(max_retries+1):\n    try: validate() \n    except e: prompt += str(e)" },
        { term: "Never retry unboundedly", desc: "Uncapped retries turn a bounded failure into a cost/latency runaway", code: "if attempt == max_retries:\n    raise or escalate_to_human()" },
      ],
    },
    {
      title: "Content Moderation & PII",
      color: "emerald",
      rows: [
        { term: "Moderation API", desc: "Hosted classifier scoring text against a general safety taxonomy", code: "flags = moderation_client.classify(text)\n# e.g. {'harassment': True, 'violence': False}" },
        { term: "LLM-as-judge", desc: "A second, NARROWLY prompted LLM call judging one specific policy question", code: "'Does this violate policy X?\nAnswer only YES or NO.'" },
        { term: "Judge prompts must be narrow", desc: "Open-ended 'review this for problems' prompts are unreliable and hard to evaluate", code: "WRONG: 'is this okay?'\nRIGHT: 'does field Y contain Z? Y/N'" },
        { term: "Second-order injection risk", desc: "A judge model can be manipulated by adversarial text inside the content it judges", code: "Treat judge inputs as untrusted,\nsame as any LLM reading external text" },
        { term: "PII redaction", desc: "Strip/mask structured PII patterns before they enter or leave the model", code: "SSN_PATTERN.sub('[REDACTED]', text)" },
        { term: "Redact on BOTH sides", desc: "Input redaction prevents exposure; output redaction catches echoed-back PII", code: "redact(user_input) --> LLM\nLLM --> redact(response)" },
        { term: "Redact before logging too", desc: "Logging raw sensitive content recreates the exact leak the guardrail exists to prevent", code: "log.info('decision', content_hash=hash(text))\n# never log raw PII" },
        { term: "Rule-based PII misses unstructured PII", desc: "Regex catches known formats; names/addresses in prose need a model-based scan too", code: "Pair regex (SSN/card patterns) with\na model-based PII detector for prose" },
      ],
    },
    {
      title: "Rate Limiting & Abuse Prevention",
      color: "amber",
      rows: [
        { term: "Rate limiting = safety control", desc: "Bounds how fast an attacker can iterate on jailbreak/injection attempts, not just cost", code: "Not just ops: it raises the cost\nof automated attack campaigns" },
        { term: "Token bucket limiter", desc: "Classic volume-based limiter refilling capacity over time", code: "tokens = min(cap, tokens + elapsed*rate)\nif tokens >= cost: allow()" },
        { term: "Sliding window + pattern detection", desc: "Volume cap plus a check for repeated near-identical prompts (probing signature)", code: "if similar_recent_count >= 5:\n    return False, 'repeated_pattern_flagged'" },
        { term: "Why volume-only limits are insufficient", desc: "An attacker can stay just under a raw rate cap while clearly probing for a bypass", code: "10 varied jailbreak attempts/min\ncan hide under a generous RPM cap" },
        { term: "Per-client identity", desc: "Limits and pattern detection should key off client/account, not just IP", code: "limiter.allow(client_id=user.id,\n  request_text=msg)" },
        { term: "Fail-closed on outage", desc: "A down guardrail/rate-limit service should block, not silently let traffic through", code: "if guardrail_service_down:\n    reject_or_degrade()  # not allow_all()" },
      ],
    },
    {
      title: "Architecture & Pitfalls",
      color: "rose",
      rows: [
        { term: "Gateway-level guardrails", desc: "Uniform checks applied to every LLM call org-wide: rate limit, baseline moderation, PII", code: "One shared module, not copy-pasted\nper feature/call site" },
        { term: "Application-level guardrails", desc: "Feature-specific schema + narrow business-policy LLM-as-judge checks", code: "e.g. 'did this violate our\nspecific refund policy?'" },
        { term: "'Just prompt it to be safe'", desc: "A system-prompt instruction alone is not a guardrail -- no independent enforcement", code: "WRONG: only rely on\n'never say anything toxic' in the prompt" },
        { term: "Blocklist-only filtering", desc: "Keyword lists are trivially bypassed by rephrasing, translation, or encoding", code: "Blocked: 'ignore instructions'\nBypassed: 'disregard prior guidance'" },
        { term: "Checking only one side", desc: "Input-only or output-only guardrails each leave a real, distinct gap", code: "Clean input -> unsafe output is real;\nalways check both directions" },
        { term: "Trusting your own tool outputs", desc: "An MCP/tool response is still untrusted content if it originated externally", code: "Route tool-call return values through\nthe same guardrail pipeline" },
        { term: "One blocklist for everything", desc: "Toxicity, PII, and jailbreak phrasing are different problems needing different techniques", code: "Match technique to problem type,\nsee decision table in the full page" },
        { term: "Vulnerable pattern", desc: "One monolithic pipeline with no schema validation before a tool/DB call", code: "WRONG: parse LLM JSON output\ndirectly, no validation, straight to DB" },
        { term: "Hardened pattern", desc: "Schema-validated, bounded-retry pipeline gating every downstream write", code: "RIGHT: validate -> retry-on-fail\n-> only then call the tool/DB" },
      ],
    },
    {
      title: "Testing, Measurement & Toolbelt",
      color: "cyan",
      rows: [
        { term: "False positive rate", desc: "Legitimate content wrongly blocked -- hurts usability", code: "FP rate = false_positives / total_cases" },
        { term: "False negative rate", desc: "Harmful/malformed content that got through -- hurts safety", code: "FN rate = false_negatives / total_cases" },
        { term: "Track both, always", desc: "Optimizing one to zero at the total expense of the other is not a real win", code: "Blocking everything = 0 FN,\nbut useless (100% FP)" },
        { term: "Labeled evaluation set", desc: "Needs BOTH known-bad and known-good cases to measure both rates", code: "cases = [{'text':..., 'should_block': bool}]" },
        { term: "Structural assertion tests", desc: "Feed a schema validator malformed data directly, bypassing the LLM entirely", code: "with pytest.raises(ValidationError):\n    Schema(bad_field='wrong_type')" },
        { term: "CI-gated metrics", desc: "Run the labeled eval set on every guardrail/prompt change; gate on rate regressions", code: "assert new_fn_rate <= baseline_fn_rate\nassert new_fp_rate <= baseline_fp_rate" },
        { term: "Debugging escalation", desc: "Reproduce exact content -> check which layer decided -> check raw classifier score -> trace boundary", code: "'Which layer blocked/missed this,\nand what was its raw confidence score?'" },
        { term: "Guardrails AI", desc: "Open-source schema+validator library with built-in retry-on-failure", code: "Composable 'guards' abstraction\nover the retry pattern shown above" },
        { term: "NeMo Guardrails (Colang)", desc: "Policy-definition language for multi-turn conversational rails, not just single-call checks", code: "Topic restriction + fact-checking\nflows across a whole conversation" },
        { term: "Llama Guard", desc: "Open-weight classifier fine-tuned on a safety taxonomy; self-hostable", code: "'Small model watches the big model'\npattern, self-hosted alternative to an API" },
        { term: "Fast-moving landscape", desc: "No single framework is the definitive standard; most stacks compose several tools", code: "Verify current tooling before betting\nan architecture on one framework" },
        { term: "Cross-reference skills", desc: "Where the deeper material for each adjacent concern actually lives", code: "Prompt Injection Defense -> hijacked\ntask execution\nAI Red Teaming -> stress-tests this\nHallucination -> correctness gap\nEvaluation -> measurement methodology" },
      ],
    },
  ],
};

export default guardrails;
