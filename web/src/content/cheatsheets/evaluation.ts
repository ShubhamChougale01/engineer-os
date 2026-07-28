import type { CheatSheetData } from "./types";

const evaluation: CheatSheetData = {
  title: "The Ultimate Evaluation Cheat Sheet",
  subtitle: "Benchmarks · LLM-as-judge · human eval · offline/online · regression testing · dataset curation",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Why not assertEqual", desc: "LLM output is open-ended; many valid phrasings exist for one correct answer", code: "# BAD:  assert output == 'expected string'\n# GOOD: assert 'Paris' in output and len(output.split()) < 50" },
        { term: "Automated / rule-based eval", desc: "Fast, cheap, deterministic checks against a reference or rule", code: "assert expected_keyword in output.lower()\nassert is_valid_json(output)" },
        { term: "LLM-as-judge", desc: "A model scores or compares outputs against a rubric, proxy for human judgment", code: "judge_prompt = 'Score 1-5 on accuracy, tone, completeness. JSON only.'" },
        { term: "Human evaluation", desc: "Real raters score against a written rubric — gold standard, slow and costly", code: "rubric: Answers question? Any unsupported claim? Tone 1-5? Send as-is?" },
        { term: "Offline evaluation", desc: "Runs pre-deploy against a fixed dataset — like a CI gate", code: "run_eval_suite(new_prompt, held_out_dataset)" },
        { term: "Online evaluation", desc: "Runs post-deploy on live/sampled traffic — catches the long tail", code: "if random.random() < SAMPLE_RATE: score_with_judge(request, response)" },
        { term: "Regression testing", desc: "Re-run the eval suite on every prompt/model change, block if score drops", code: "if new_score < baseline - tolerance: raise SystemExit('regression')" },
      ],
    },
    {
      title: "Academic Benchmarks (treat as coarse signal)",
      color: "blue",
      rows: [
        { term: "MMLU", desc: "57-subject multiple choice; broad knowledge and reasoning probe", code: "# multiple choice across law, medicine, math, history, etc." },
        { term: "HellaSwag", desc: "Adversarially generated wrong endings test commonsense reasoning", code: "# pick the plausible sentence continuation" },
        { term: "HumanEval", desc: "Code generation scored by unit-test pass rate (pass@k)", code: "pass_at_k = fraction of k samples that pass ALL unit tests" },
        { term: "GSM8K", desc: "Grade-school math word problems; multi-step arithmetic reasoning", code: "# tests chain-of-thought style multi-step solving" },
        { term: "TruthfulQA", desc: "Probes whether a model repeats common misconceptions", code: "# checks truthful vs popular-but-false answers" },
        { term: "Benchmark contamination", desc: "Test questions leak into pretraining data, inflating scores", code: "# always validate with a PRIVATE, held-out task-specific set" },
        { term: "Leaderboard illusion", desc: "Rankings can be gamed via selective submission or prompt tuning", code: "# a leaderboard rank is a claim under ONE protocol, not universal quality" },
      ],
    },
    {
      title: "LLM-as-Judge Mechanics",
      color: "emerald",
      rows: [
        { term: "Pointwise scoring", desc: "Judge rates one output on an absolute scale per dimension", code: "return JSON: accuracy int, tone int, completeness int, reasoning string" },
        { term: "Pairwise comparison", desc: "Judge picks the better of two outputs — more consistent than pointwise", code: "return JSON: winner 'A' or 'B' or 'tie', reasoning string" },
        { term: "Judge validation", desc: "Compare judge scores vs human labels; measure agreement before trusting", code: "correlation = pearsonr(human_scores, judge_scores)" },
        { term: "Position bias", desc: "Judge favors whichever response is shown first/second regardless of quality", code: "# rerun with order swapped; flag verdicts that flip" },
        { term: "Verbosity bias", desc: "Judge rates longer output higher even with no added value", code: "# control for length before comparing scores" },
        { term: "Self-preference bias", desc: "Judge favors outputs from its own model family's style", code: "# use a different model family as judge where possible" },
        { term: "Leniency drift", desc: "Judge scores creep upward over a long unchecked batch", code: "# periodically re-anchor against fixed reference examples" },
        { term: "Re-validation cadence", desc: "Judges must be re-checked after rubric, model, or task changes", code: "# schedule monthly re-validation against fresh human labels" },
      ],
    },
    {
      title: "Statistical Rigor",
      color: "amber",
      rows: [
        { term: "Confidence interval", desc: "Report noise bounds alongside every score, not a bare number", code: "low, high = bootstrap_ci(pass_fail_results)" },
        { term: "Bootstrap CI", desc: "Resample results with replacement, take 2.5/97.5 percentiles", code: "means = [mean(resample(results)) for _ in range(2000)]" },
        { term: "Meaningful improvement rule", desc: "Require the ENTIRE interval above baseline, not just the point estimate", code: "is_better = ci_low > baseline_rate" },
        { term: "Sample size matters", desc: "A 2-point swing on 40 examples may be pure noise", code: "# size your eval set to the effect size you need to detect" },
        { term: "Pairwise scaling cost", desc: "Comparing N candidates pairwise grows faster than linearly", code: "# use tournament / sampled-pairs for large candidate sets" },
      ],
    },
    {
      title: "Production Patterns",
      color: "rose",
      rows: [
        { term: "Layered eval strategy", desc: "Cheap checks every commit, judge suite every merge, human review for escalations", code: "automated -> judge regression suite -> sampled online -> human audit" },
        { term: "Versioned eval datasets", desc: "Stored as artifacts alongside prompts, not a lost spreadsheet", code: "evals/datasets/support_summary_v3.jsonl" },
        { term: "Baseline management", desc: "Update deliberately via review, never silently loosen the threshold", code: "evals/baselines/support_summary_v3_baseline.json" },
        { term: "Feed failures back in", desc: "Every production incident becomes a permanent regression case", code: "# incident -> new eval_set.json entry -> gate forever" },
        { term: "Online sampling", desc: "Score a percentage of live traffic, not every request (cost control)", code: "if random.random() < 0.05: run_judge(request, response)" },
        { term: "Dashboard segmentation", desc: "Track scores by prompt version AND model version", code: "log_eval_event(score, prompt_version, model_version)" },
        { term: "Adversarial test cases", desc: "Include prompt-injection and jailbreak attempts in safety-relevant sets", code: "# pair with the Guardrails skill to verify defenses hold" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "cyan",
      rows: [
        { term: "Trusting a leaderboard score", desc: "Public benchmarks don't reflect your specific task's real distribution", code: "# BAD: 'Model X wins MMLU, switch to it'\n# GOOD: run both through YOUR task-specific harness" },
        { term: "Unvalidated judge", desc: "Treating judge scores as ground truth with no human agreement check", code: "# always validate: judge_score vs human_score correlation" },
        { term: "Frozen eval set", desc: "Never updating the dataset lets it drift from real usage", code: "# refresh with new production failure cases regularly" },
        { term: "Goodhart's law", desc: "Optimizing prompts directly against the eval metric decouples it from real quality", code: "# diversify and refresh the eval set to counter this" },
        { term: "Happy-path-only dataset", desc: "No adversarial or edge cases means production failures go uncaught", code: "# include: empty input, huge input, ambiguous input, injections" },
        { term: "No confidence interval", desc: "Reporting a bare score invites chasing noise as if it were signal", code: "# always pair a score with its CI or sample size" },
      ],
    },
  ],
};

export default evaluation;
