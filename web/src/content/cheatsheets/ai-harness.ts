import type { CheatSheetData } from "./types";

const aiHarness: CheatSheetData = {
  title: "The Ultimate AI Harness Cheat Sheet",
  subtitle: "Pipeline architecture · scorers · concurrency · CI gating · pitfalls · toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Eval harness", desc: "Automated pipeline that runs an eval suite against a system under test", code: "load dataset -> invoke SUT\n-> score -> aggregate -> report" },
        { term: "Harness vs AI Evals", desc: "Evals designs WHAT to test; harness runs it repeatedly at scale", code: "AI Evals: datasets, metrics, judges\nAI Harness: pipeline, CI, gating" },
        { term: "System under test (SUT)", desc: "The prompt / chain / agent being evaluated, treated as a black box", code: "output = system_under_test(case_input)" },
        { term: "Run record", desc: "Immutable stored result of one full harness execution", code: "run_id, model, prompt_version,\ndataset_version, git_commit, scores" },
        { term: "Baseline", desc: "Last-known-good run record used for regression diffing", code: "delta = current_score - baseline_score" },
        { term: "Regression gate", desc: "CI check that blocks a merge/deploy on a score drop", code: "if current < baseline - threshold:\n    block_merge()" },
        { term: "Non-determinism", desc: "LLMs can legitimately vary output on identical input", code: "same prompt, same model ->\ndifferent output is NORMAL" },
        { term: "Flakiness", desc: "Harness failures from infra (timeouts/429s), not real regressions", code: "record as error, not score=0" },
        { term: "Judge calibration", desc: "Checking LLM-as-judge verdicts agree with human judgment over time", code: "sample judge verdicts ->\nroute to human review periodically" },
      ],
    },
    {
      title: "Pipeline Building Blocks",
      color: "blue",
      rows: [
        { term: "Dataset loader", desc: "Reads and validates cases from JSONL/DB/platform export", code: "def load_jsonl_dataset(path):\n    return [json.loads(l) for l in open(path)]" },
        { term: "Case schema validation", desc: "Fail loudly at load time, not silently mid-run", code: "if 'expected' not in case:\n    raise KeyError('missing expected')" },
        { term: "Scorer interface", desc: "Function taking (output, expected) -> score", code: "def scorer(output, expected) -> float:\n    return 1.0 if match else 0.0" },
        { term: "Rule-based scorer", desc: "Deterministic, cheap: exact match, regex, schema check", code: "def exact_match(output, expected):\n    return output.strip() == expected.strip()" },
        { term: "LLM-as-judge scorer", desc: "Flexible, semantic, costs an API call per case", code: "verdict = judge_call(rubric_prompt)\nreturn 1.0 if 'YES' in verdict else 0.0" },
        { term: "Aggregator", desc: "Rolls per-case scores into summary metrics", code: "mean_score = sum(scores) / len(scores)\npass_rate = passed / total" },
        { term: "Reporter", desc: "Emits CLI summary, PR comment, or CI gate decision", code: "reporter(per_case_results, summary)" },
        { term: "Run record schema", desc: "What every stored run must include", code: "run_id, started_at, model,\nprompt_version, scores, per_case_results" },
        { term: "Four-stage separation", desc: "Loader, invoker, scorer, reporter stay independently swappable", code: "run_harness(loader, sut, scorers, reporter)\n# swap any arg without touching pipeline" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Minimal eval loop", desc: "The smallest possible harness", code: "for case in dataset:\n    out = sut(case['input'])\n    score = scorer(out, case['expected'])" },
        { term: "Cache key", desc: "Hash of everything that affects the output", code: "hashlib.sha256(json.dumps(\n  {'model':m,'prompt':p,'params':params},\n  sort_keys=True).encode()).hexdigest()" },
        { term: "Short-circuit scoring", desc: "Run cheap rule-based check before expensive judge call", code: "if exact_match(out, exp): return 1.0\nreturn llm_judge_score(out, exp)  # only if needed" },
        { term: "Timeout every call", desc: "Never let one slow case hang the whole run", code: "await client.post(url, json=body, timeout=30.0)" },
        { term: "Diff two runs", desc: "Match cases by input, compare scores", code: "delta = current[key] - baseline[key]\nif delta < -threshold: regressions.append(...)" },
        { term: "Writing a suite in CI", desc: "Fast subset on PR, full suite on schedule", code: "on: pull_request -> fast.yaml\non: schedule (cron) -> full.yaml" },
        { term: "Per-case debugging", desc: "Always keep per-case results, not just the average", code: "results = [{'case':c,'output':o,'score':s}, ...]\n# never discard after computing summary" },
        { term: "Fail loudly on skip", desc: "A skipped eval must not look like a passed eval", code: "if harness_run_failed:\n    ci_job.fail()  # never silently skip the gate" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Concurrency-limited execution", desc: "Bound in-flight calls to respect provider rate limits", code: "sem = asyncio.Semaphore(10)\nasync with sem:\n    await call_llm(prompt)" },
        { term: "Retry with backoff + jitter", desc: "Retry only transient errors (429/5xx/timeout)", code: "delay = base * (2 ** attempt) + random.uniform(0,0.1)\nawait asyncio.sleep(delay)" },
        { term: "Multi-sample scoring", desc: "Sample k times per case to smooth non-determinism", code: "scores = [scorer(sut(prompt), exp) for _ in range(k)]\nmean(scores), stdev(scores)" },
        { term: "Statistical comparison", desc: "Flag small-sample deltas as inconclusive, not decisive", code: "if n_a < 30 or n_b < 30:\n    return 'inconclusive (sample too small)'" },
        { term: "Stratified sampling", desc: "Run a representative subset for fast triggers", code: "subset = sample_by_category(dataset, per_category=5)" },
        { term: "Cost cap enforcement", desc: "Hard ceiling on spend per harness run", code: "if running_cost_usd > max_cost_usd:\n    abort_run('cost cap exceeded')" },
        { term: "Model/prompt comparison matrix", desc: "Same dataset + scorers across multiple candidates", code: "for model in ['gpt-4o-mini', 'claude-3-5-sonnet']:\n    run_harness(dataset, model, scorers)" },
        { term: "Trend / drift check", desc: "Compare rolling windows of scores over many runs", code: "prior_avg = mean(scores[-2*w:-w])\nlatest_avg = mean(scores[-w:])\ndrift = prior_avg - latest_avg" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Eyeballing outputs", desc: "Manual spot-checks instead of an automated run", code: "WRONG: 'looked fine in the playground'\nRIGHT: run_eval(dataset, sut, scorer)" },
        { term: "No baseline to diff", desc: "Absolute scores alone require memory, not a diff", code: "always store + fetch last-known-good\nrun record before comparing" },
        { term: "Unbounded concurrency", desc: "Hammering a rate-limited API produces false regressions", code: "429s reported as 'model got worse'\n-> actually just too many concurrent calls" },
        { term: "Conflating infra errors with scores", desc: "A timeout is not a quality regression", code: "WRONG: score = 0 on timeout\nRIGHT: status = 'error', exclude from score" },
        { term: "Chasing noise", desc: "Shipping a change because of a small delta on a small sample", code: "2pt gain on 40 examples ->\noften not statistically distinguishable" },
        { term: "Never validating the judge", desc: "LLM judges drift silently without periodic human review", code: "measure judge-vs-human agreement\non a recurring sample, not once" },
        { term: "Stale cache after prompt edit", desc: "Cache key missing the prompt text/version", code: "cache_key must hash model+prompt+params\n-- not just an id" },
        { term: "Full suite on every commit", desc: "Burns budget and slows iteration until devs disable it", code: "fast subset -> every PR\nfull suite -> merge / nightly only" },
        { term: "Hardcoded model/prompt in pipeline", desc: "Comparison requires code edits instead of config edits", code: "WRONG: sut = call_gpt4o_directly()\nRIGHT: sut = make_sut(config.model)" },
        { term: "Unversioned datasets", desc: "A silently edited dataset makes 'regression' meaningless", code: "dataset_version pinned + logged\nin every run record" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "OpenAI Evals", desc: "Open-source, code-first eval registration/execution framework", code: "pip install evals\n# define + register an eval class" },
        { term: "promptfoo", desc: "Config-driven CLI harness, CI-friendly", code: "promptfoo eval -c promptfooconfig.yaml\npromptfoo view  # results UI" },
        { term: "DeepEval", desc: "pytest-native harness — evals feel like unit tests", code: "def test_answer_relevancy():\n    assert_test(test_case, [AnswerRelevancyMetric()])" },
        { term: "Inspect (UK AISI)", desc: "Research-grade harness for rigorous capability/safety evals", code: "inspect eval task.py --model provider/model" },
        { term: "LangSmith", desc: "LangChain's dataset + eval + run-comparison platform", code: "from langsmith.evaluation import evaluate\nevaluate(sut, data=dataset, evaluators=[scorer])" },
        { term: "Langfuse", desc: "Open-source observability with native dataset/eval features", code: "langfuse.create_dataset_run_item(\n  dataset_item_id, run_name, output)" },
        { term: "CI gate config", desc: "Fast subset on PR, full suite on schedule", code: "on: pull_request -> evals/fast.yaml\non: schedule (cron) -> evals/full.yaml" },
        { term: "Metrics to export", desc: "Track harness health, not just eval scores", code: "eval_runs_total, eval_duration_seconds,\neval_cost_usd, eval_cache_hit_rate" },
        { term: "Related platform skills", desc: "Where a harness plugs into the wider AI stack", code: "AI Evals, LangSmith, Langfuse, LLMOps,\nPrompt Versioning, CI/CD, Model Routing,\nAI Monitoring, Agent Observability" },
      ],
    },
  ],
};

export default aiHarness;
