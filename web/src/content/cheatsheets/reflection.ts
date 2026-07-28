import type { CheatSheetData } from "./types";

const reflection: CheatSheetData = {
  title: "The Ultimate Reflection Cheat Sheet",
  subtitle: "Generate-critique-revise loops · Reflexion · self-consistency contrast · when it does (and does not) help",
  sections: [
    {
      title: "Core Definition & The Loop",
      color: "violet",
      rows: [
        { term: "Reflection", desc: "An LLM (or a critic) evaluating and improving its own output before finalizing it -- a control-flow pattern, not a new model capability", code: "generate -> critique -> revise ->\nrepeat until stopping condition" },
        { term: "Generate-critique-revise", desc: "The three stages of one reflection cycle", code: "1. generate: produce a draft\n2. critique: evaluate vs a standard\n3. revise: produce a new draft" },
        { term: "Vague vs specific critique", desc: "\"Is this good\" produces weak feedback; naming concrete checks produces actionable feedback", code: "weak: 'check your work'\nstrong: 'does this handle empty\n  input, k > length, duplicates?'" },
        { term: "What reflection does NOT do", desc: "Cannot manufacture knowledge or reasoning capability the model does not already have", code: "no fact known = self-critique on\n  that fact will not fix it either" },
        { term: "Controller owns termination", desc: "Code, not the critique step's own judgment, must enforce the stopping condition", code: "model can say 'no issues';\ncode enforces the actual limit" },
        { term: "Cost basis", desc: "Every iteration is at minimum 2 more full LLM calls (critique + revise) -- never free", code: "2-iteration loop >= 3-4 model\n  calls before returning anything" },
      ],
    },
    {
      title: "Patterns: Reflexion, Self-Refine, Self-Consistency",
      color: "blue",
      rows: [
        { term: "Self-Refine", desc: "Same-pass iterative critique-and-revision cycle on one draft, same model", code: "draft -> critique -> revise ->\ncritique -> revise ..." },
        { term: "Reflexion", desc: "Verbal self-feedback: reflect on a FAILED attempt in natural language, store it, reuse on next attempt", code: "fail -> reflect (text) -> store in\nmemory -> next attempt includes it" },
        { term: "Reflexion needs a real signal", desc: "Requires a genuine pass/fail or external signal to trigger a meaningful reflection, not just unverified opinion", code: "trigger: failed test, wrong\n  verified answer, env feedback" },
        { term: "Self-consistency (contrast)", desc: "Sample N independent outputs in parallel, aggregate (e.g. majority vote) -- no self-critique required", code: "N samples -> vote on final answer\n(parallel, not sequential)" },
        { term: "Reflection vs self-consistency", desc: "Reflection targets a specific flaw IF critique can see it; self-consistency bets independent errors disagree", code: "reflection: sequential, targeted\nself-consistency: parallel, voted" },
        { term: "Which wins on discrete-answer tasks", desc: "Several evaluations show self-consistency matching/beating self-critique on math/reasoning benchmarks with one correct answer", code: "test both on YOUR task before\n  picking a default" },
      ],
    },
    {
      title: "Same-Model Critique vs Separate Critic",
      color: "emerald",
      rows: [
        { term: "Same-model self-critique", desc: "Cheaper, simpler -- but shares the generator's own knowledge gaps and biases", code: "Model A generates -> Model A\ncritiques -> Model A revises" },
        { term: "Separate critic", desc: "A different model or distinct persona -- costlier, can catch generator-specific blind spots", code: "Model A generates -> Model B\ncritiques -> A or B revises" },
        { term: "External verification (strongest)", desc: "Ground critique in an executable/checkable fact (tests, validators, calculators) instead of LLM opinion", code: "run real test suite -> feed\nfailures back AS the critique" },
        { term: "Multi-agent critic role", desc: "A dedicated reviewer agent structurally realizes the separate-critic configuration", code: "manager -> writer agent,\n  critic/reviewer agent" },
        { term: "Reserve separate critic for", desc: "Higher-stakes steps where the extra cost is justified by the consequence of a missed error", code: "high stakes -> pay for a 2nd,\n  possibly stronger, critic model" },
      ],
    },
    {
      title: "When Reflection Helps vs Is Just Cost",
      color: "amber",
      rows: [
        { term: "External/executable check available", desc: "Tests pass/fail, validators, calculators -- strongest, most consistent evidence of benefit", code: "code + real test suite = best\n  documented reflection use case" },
        { term: "Differently-framed re-read catches it", desc: "Explicit edge cases, stated logic steps re-verifiable -- moderate, inconsistent benefit", code: "measure, do not assume it works" },
        { term: "Model lacks the underlying capability", desc: "Asking a limited model to check its own limited work does not manufacture new capability", code: "fix: stronger model, retrieval\n  (RAG), NOT more self-critique" },
        { term: "Short / low-stakes / already-correct", desc: "Added latency and cost rarely justified by a small, uncertain quality gain", code: "negative cost-benefit -- skip\n  reflection here" },
        { term: "Open-ended / subjective, no ground truth", desc: "Empirically the most inconsistent case -- 'better' is itself hard to define or measure", code: "uncertain: evaluate rigorously\n  or don't bother" },
        { term: "Critique-induced degradation", desc: "A specific documented failure: critique flags a spurious issue in an ALREADY-CORRECT draft and makes it worse", code: "regression test: known-correct\n  first draft must stay correct" },
      ],
    },
    {
      title: "Stopping Criteria & Production Discipline",
      color: "rose",
      rows: [
        { term: "Hard iteration cap", desc: "Enforced in code, commonly 1-3, sized to measured diminishing returns for this task", code: "REFLECTION_MAX_ITERATIONS=3" },
        { term: "Hard cost/token budget", desc: "Independent of iteration count -- critique/revise calls vary a lot in length", code: "REFLECTION_MAX_TOTAL_TOKENS=15000" },
        { term: "External verification precedence", desc: "Where available, a passing test/validator should gate stopping ahead of LLM critique's own opinion", code: "tests pass -> stop, regardless\n  of what the critic says" },
        { term: "Diminishing-returns detection", desc: "Near-identical consecutive drafts signal further iteration is unlikely to help", code: "similarity(draft_i, draft_i+1)\n  >= threshold -> stop" },
        { term: "Never rely on critique's own 'done'", desc: "The model's own satisfaction report is not a reliable sole stopping signal", code: "combine ALL four criteria above,\n  never just one" },
        { term: "Evaluate before shipping", desc: "Run a real before/after quality comparison on a representative task set", code: "measure vs real success criterion,\n  never vs model's self-report" },
        { term: "Scope to an explicit allowlist", desc: "Apply reflection to identified failure-prone task types, never to every generation by default", code: "REFLECTION_ENABLED_FOR_TASK_TYPES=\n  code_generation,structured_extraction" },
        { term: "Log the full trace", desc: "Every draft, critique, and revision -- not just the final output", code: "debugging starts from WHERE\n  quality changed, not just the end" },
      ],
    },
    {
      title: "Sibling Skills & Ecosystem",
      color: "cyan",
      rows: [
        { term: "Agent Fundamentals", desc: "Prerequisite: the general perceive-plan-act-observe loop reflection is layered onto", code: "same stopping-condition discipline\n  applies to reflection loops" },
        { term: "Prompt Engineering", desc: "Prerequisite: writing specific, actionable critique and revise prompts", code: "every reflection step is a\n  prompted LLM call" },
        { term: "Planning", desc: "Sibling skill: proposed plans can themselves be critiqued before execution begins", code: "reflect on the PLAN, not only\n  the final answer" },
        { term: "Agent Memory", desc: "Sibling skill: the storage/retrieval mechanics behind Reflexion's episodic reflection buffer", code: "store reflections, retrieve on\n  next similar attempt" },
        { term: "Evaluation", desc: "Essential: the methodology to measure whether reflection actually improved quality, not assume it", code: "before/after vs real success\n  criterion, not self-report" },
        { term: "Hallucination", desc: "Related risk: self-critique of a factual claim can confidently endorse a fabrication rather than catch it", code: "grounding (RAG) beats unverified\n  self-critique on facts" },
        { term: "LangGraph", desc: "Common substrate for implementing reflection as an explicit, cyclic, stateful graph", code: "generate node -> critique node ->\n  conditional edge back or out" },
      ],
    },
  ],
};

export default reflection;
