import type { CheatSheetData } from "./types";

const llmops: CheatSheetData = {
  title: "The Ultimate LLMOps Cheat Sheet",
  subtitle: "Lifecycle · evaluation · rollout · observability · cost & safety toolbelt",
  sections: [
    {
      title: "Core Lifecycle & Concepts",
      color: "violet",
      rows: [
        { term: "LLMOps", desc: "Operating LLM apps reliably: develop, evaluate, deploy, monitor, iterate", code: "prompt dev -> offline eval -> staged rollout\n  -> monitoring -> feedback loop -> repeat" },
        { term: "Deployable artifact", desc: "Not just weights: prompt + context + model + tools", code: "system_prompt + retrieved_context\n+ model_config + tool_defs" },
        { term: "vs classical MLOps", desc: "3 structural differences", code: "1. prompts/context are artifacts too\n2. outputs non-deterministic, open-ended\n3. model is often 3rd-party, not retrained" },
        { term: "Golden dataset", desc: "Curated inputs + expected answers/rubrics", code: "dataset = [{input, expected}, ...]\nsourced from real traffic + edge cases" },
        { term: "LLM-as-judge", desc: "Second model call scores output vs rubric", code: "judge(question, reference, response)\n  -> {score: 1-5, reason: str}" },
        { term: "Eval gate", desc: "Automated CI check blocking regressions", code: "if candidate_score < baseline - tol:\n    fail_build()" },
        { term: "Per-category scoring", desc: "Never trust one aggregate number", code: "group_by(results, 'category')\ncheck each category >= threshold" },
        { term: "Feedback loop", desc: "Production failures feed back into prompt/eval", code: "trace failure -> add to golden dataset\n  -> re-eval -> new prompt version" },
      ],
    },
    {
      title: "Prompt Versioning & Rollout",
      color: "blue",
      rows: [
        { term: "Prompt registry", desc: "Prompts as versioned files, not inline strings", code: "prompts/support_triage/v3.py\nVERSION = 'v3'\nCHANGELOG = '...'" },
        { term: "Runtime config fetch", desc: "App fetches prompt version at request time", code: "PROMPT_VERSION_PIN=support_triage@v3\n# rollback = config change, not redeploy" },
        { term: "Shadow launch", desc: "New version runs, logs, never shown to users", code: "log(v2_output) but serve(v1_output)\nzero user-facing risk" },
        { term: "Canary rollout", desc: "Small % of real traffic to new version", code: "route 5% traffic -> v2\ncompare metrics vs v1 control" },
        { term: "Blue-green", desc: "Full cutover with instant rollback ready", code: "switch 100% traffic -> v2\nrevert to v1 on regression signal" },
        { term: "A/B test", desc: "Long-running comparison for product decisions", code: "50/50 split, measure business metric\nnot just a safety check" },
        { term: "Model version pinning", desc: "Avoid silent behavior shifts from provider updates", code: "model='gpt-4o-2024-08-06'  # pinned\n# NOT model='gpt-4o-latest'" },
        { term: "Rollback trigger", desc: "Auto-revert on metric regression", code: "if canary_score < control_score - tol:\n    rollback_to_previous_version()" },
      ],
    },
    {
      title: "Observability & Tracing",
      color: "emerald",
      rows: [
        { term: "Full request trace", desc: "Everything needed to debug any output later", code: "prompt, context, tool_calls, output,\nmodel, params, tokens, latency" },
        { term: "Trace tree (multi-step)", desc: "Nested spans for retrieval/LLM/tool calls", code: "root: answer_ticket\n  span: retrieve_context 120ms\n  span: llm_call 340ms\n  span: tool_call 85ms" },
        { term: "Structured logging", desc: "JSON logs, searchable, correlation IDs", code: "log.info(json.dumps({\n  model, messages, output, usage}))" },
        { term: "LangSmith / Langfuse", desc: "Purpose-built LLM tracing + eval + dataset tools", code: "see LangSmith and Langfuse skills\nfor concrete instrumentation" },
        { term: "Time-to-first-token", desc: "Perceived latency metric, separate from total time", code: "stream=True\nyield delta as it arrives" },
        { term: "p50/p95/p99 latency", desc: "Distributions matter more than averages", code: "mean=800ms can hide p99=8s\ntrack percentiles, not just mean" },
        { term: "Quality score over time", desc: "Re-run eval against production sample regularly", code: "sample_prod_traffic()\nscore = judge_score(sample)\nemit_metric('llm_quality_score', score)" },
        { term: "Alert on symptoms", desc: "What users/budget feel, not internal causes first", code: "alert: quality_score drop\nalert: cost/day > budget\nalert: p99 > SLA" },
      ],
    },
    {
      title: "Cost & Latency Management",
      color: "amber",
      rows: [
        { term: "Cost formula", desc: "Directly attributable per-request spend", code: "cost = (in_tok/1000)*price_in\n     + (out_tok/1000)*price_out" },
        { term: "Budget guard", desc: "Reject/truncate before an expensive call", code: "if projected_cost > MAX_COST_USD:\n    raise ValueError('over budget')" },
        { term: "Token usage read", desc: "Every response carries usage data", code: "usage = response.usage\nprompt_tokens, completion_tokens" },
        { term: "Model routing", desc: "Cheapest model that meets quality bar per request", code: "see Model Routing skill:\nroute by cost/quality tradeoff" },
        { term: "Prompt/context trimming", desc: "Shrink tokens = cut cost + latency together", code: "remove redundant instructions\ntrim retrieved chunks to top-k relevant" },
        { term: "History bounding", desc: "Never append conversation turns unbounded", code: "while count_tokens(msgs) > budget:\n    msgs.pop(1)  # drop oldest first" },
        { term: "Caching", desc: "Skip the LLM call for repeated/near-dup queries", code: "exact-match or semantic cache\nbefore hitting the model" },
        { term: "Batch APIs", desc: "Discounted pricing for offline bulk work", code: "use provider batch endpoint for\nbulk classification/embeddings" },
        { term: "Denial-of-wallet guard", desc: "Per-user/session rate limit against runaway cost", code: "rate_limit(user_id, max_calls_per_min)" },
      ],
    },
    {
      title: "Safety & Guardrails",
      color: "rose",
      rows: [
        { term: "Prompt injection", desc: "Untrusted content hijacks model instructions", code: "treat retrieved/tool content as untrusted\nsee Prompt Injection Defense skill" },
        { term: "Output guardrail", desc: "Scan output for leaked secrets/system prompt", code: "wrap output boundary independent\nof prompt logic" },
        { term: "Input guardrail", desc: "Filter/classify input before it reaches the model", code: "cheap filter first, escalate to\nLLM-based check only if ambiguous" },
        { term: "Excessive agency", desc: "Agent performs unintended tool actions", code: "least-privilege tool scoping\nhuman confirm for high-risk actions" },
        { term: "Block-rate monitoring", desc: "Guardrail effectiveness tracked as a metric", code: "track block_rate + false_positive_rate\nover time, not one-time review" },
        { term: "Red-teaming in eval suite", desc: "Adversarial cases alongside functional cases", code: "golden_dataset += jailbreak_attempts\n+ injection_attempts" },
        { term: "Data poisoning risk", desc: "Fine-tuning on unvetted user/scraped data", code: "vet training data sources if\nfeeding prod data into fine-tuning" },
      ],
    },
    {
      title: "Testing, Debugging & Ops",
      color: "cyan",
      rows: [
        { term: "Deterministic tests", desc: "Normal pytest for non-model code paths", code: "def test_trim_history():\n    assert count_tokens(out) <= budget" },
        { term: "Evaluation-based tests", desc: "Statistical assertions, not exact match", code: "assert avg_score >= 0.85\nassert cat_avg >= 0.75  # per category" },
        { term: "Regression from production", desc: "Every real failure becomes a dataset case", code: "found bad output -> add to\ngolden_dataset before calling fixed" },
        { term: "Debug escalation order", desc: "Trace first, then isolate the layer at fault", code: "1. read full trace\n2. reproduce w/ pinned model version\n3. isolate retrieval vs prompt vs model" },
        { term: "Common error: cost spike", desc: "Unbounded history or wrong routing rule", code: "check history growth first\nthen check router config" },
        { term: "Common error: stale prompt", desc: "Cache/config serving old version", code: "diff deployed prompt vs\nexpected version pin" },
        { term: "Judge drift", desc: "Recalibrate judge against human review", code: "sample judge_scores vs human_ratings\ncheck agreement periodically" },
        { term: "Production checklist item", desc: "Named owner + reviewed like code", code: "prompt changes: PR + eval gate +\nnamed feature-team owner" },
        { term: "Related skills", desc: "Where each lifecycle stage goes deeper", code: "Prompt Versioning, Model Routing,\nAI Evals, AI Harness, MLOps,\nGuardrails, LangSmith, Langfuse" },
      ],
    },
  ],
};

export default llmops;
