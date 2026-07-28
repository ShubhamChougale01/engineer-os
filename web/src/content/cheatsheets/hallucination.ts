import type { CheatSheetData } from "./types";

const hallucination: CheatSheetData = {
  title: "The Ultimate Hallucination Cheat Sheet",
  subtitle: "Why LLMs confabulate · detection · grounding & verification · calibrated abstention · honest limits",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Hallucination", desc: "Fluent, confident output that is factually wrong, unsupported, or inconsistent with context", code: "output looks identical in tone to a correct answer -- no surface signal" },
        { term: "Intrinsic hallucination", desc: "Directly contradicts the given input/context", code: "context: 'meeting is Tuesday'\noutput: 'meeting is Wednesday'  # contradicts input" },
        { term: "Extrinsic hallucination", desc: "Unverifiable claim relative to input, true or not", code: "adds 'driven by Asia-Pacific growth' -- not in source at all" },
        { term: "Stable vs unstable wrongness", desc: "Consistently wrong every call vs. varies across samples", code: "stable wrong answer -> self-consistency will NOT catch it" },
        { term: "Snowballing", desc: "Early error becomes context for later tokens, compounding", code: "sentence 3 wrong -> sentences 4-10 build on it as fact" },
        { term: "False-premise question", desc: "Question assumes something untrue; model often answers as if true", code: "'why did X happen in 1990' (X happened in 1995 or never)" },
      ],
    },
    {
      title: "Why It Happens",
      color: "blue",
      rows: [
        { term: "Next-token prediction", desc: "Trained to predict plausible next token, no true/false label", code: "loss = -log P(actual_next_token | context)  # no truth signal" },
        { term: "RLHF confidence bias", desc: "Raters can reward confident answers over honest hedging", code: "# fine-tuning can push toward 'always answer'\n# over 'sometimes decline'" },
        { term: "No verification step", desc: "Autoregressive generation has no built-in fact-check pause", code: "for token in generate(): emit(token)  # no external lookup" },
        { term: "No introspectable belief state", desc: "'Are you sure?' gets answered by the same ungrounded process", code: "# asking the model to self-verify is not a proof mechanism" },
        { term: "Long-tail / rare facts", desc: "Weakly represented training data -> less stable associations", code: "# obscure facts most prone to confident fabrication" },
      ],
    },
    {
      title: "Detection Techniques",
      color: "emerald",
      rows: [
        { term: "Self-consistency", desc: "Sample N times, compare answers; low agreement = risk signal", code: "answers = [sample(prompt, temp=0.7) for _ in range(5)]\nagreement = majority_count / 5" },
        { term: "SelfCheckGPT-style check", desc: "Black-box detection via sampling, no model internals needed", code: "# compare each sample against the consensus answer" },
        { term: "Citation verification", desc: "Check every model-produced citation against a real source", code: "if citation not in known_sources: flag(citation)" },
        { term: "Similarity pre-filter", desc: "Cheap embedding-similarity check per generated sentence", code: "score = cosine_sim(embed(sentence), embed(source_chunk))\nif score < 0.55: escalate(sentence)" },
        { term: "LLM-as-judge entailment", desc: "Stricter, slower check for claims similarity can't resolve", code: "judge('Given SOURCE, is CLAIM supported/contradicted/unverifiable?')" },
        { term: "Token-level log-probability", desc: "Low probability on a factual token correlates with risk", code: "if logprob(token) < threshold: flag_low_confidence(token)" },
        { term: "Semantic entropy", desc: "Meaning variance across paraphrased generations of same question", code: "# high variance across paraphrases -> higher risk than\n# raw token probability alone" },
      ],
    },
    {
      title: "Mitigation Strategies",
      color: "amber",
      rows: [
        { term: "RAG grounding", desc: "Condition on real retrieved source text -- highest-leverage first step", code: "prompt = f'Answer ONLY from sources:\\n{context}\\nQ: {q}'" },
        { term: "Structured output constraints", desc: "Restrict to a known-valid set -- makes some errors impossible", code: "must be one of: {'low','medium','high'}  # can't hallucinate outside enum" },
        { term: "Fact-checking pipeline", desc: "Layered: cheap filter first, expensive judge on ambiguous claims", code: "sim_filter(claims) -> judge(ambiguous_subset) -> policy(verdicts)" },
        { term: "Say-I-don't-know prompting", desc: "Works only if model has a real internal low-confidence signal", code: "'If not confident or unsupported by sources, say so explicitly.'" },
        { term: "Premise-checking", desc: "Verify the question's premise before answering it", code: "'First state whether the premise is accurate, then answer.'" },
        { term: "Fine-tuning on domain data", desc: "Improves calibration only on the trained distribution", code: "# does not close the gap for out-of-distribution questions" },
        { term: "Incremental verification", desc: "Check claims during long generation, not only at the end", code: "# stops snowballing before it compounds across paragraphs" },
      ],
    },
    {
      title: "Production Practice",
      color: "rose",
      rows: [
        { term: "Risk-tiered verification depth", desc: "Match verification cost to real-world stakes of an error", code: "low-stakes: similarity filter only\nhigh-stakes: filter + judge + human review" },
        { term: "Hallucination flag rate", desc: "Track as an ongoing production metric, not a one-time check", code: "flag_rate = flagged_answers / total_answers  # trend over time" },
        { term: "Abstention rate", desc: "Track alongside flag rate -- over-hedging is its own regression", code: "# tune the threshold between hallucinating and never answering" },
        { term: "Benchmark re-validation", desc: "Re-run hallucination benchmark on every model/prompt change", code: "run_benchmark(new_model_version)  # never assume it still holds" },
        { term: "Judge validation", desc: "Validate any LLM-as-judge component against human-labeled data", code: "# an unvalidated judge is itself a source of wrong verdicts" },
        { term: "Source-quality review", desc: "Grounding in stale/wrong sources yields confidently faithful errors", code: "# treat source curation as a hallucination-mitigation lever" },
        { term: "Automated pipeline exposure", desc: "No-human-in-loop consumers need the same or stricter verification", code: "# auto-filed model output = full verification rigor required" },
      ],
    },
    {
      title: "Honest Limits & Pitfalls",
      color: "cyan",
      rows: [
        { term: "Cannot be eliminated", desc: "Every technique reduces rate/blast radius; none removes it fully", code: "# treat 'we solved hallucination' claims as a red flag" },
        { term: "Self-consistency blind spot", desc: "Misses stably wrong answers (same wrong answer every sample)", code: "# 5/5 agreement can still be 5/5 confidently wrong" },
        { term: "Grounding != faithfulness", desc: "Model can ignore or misstate retrieved sources", code: "# RAG alone does not guarantee the answer matches sources" },
        { term: "Bigger model != solved", desc: "Newer/larger models reduce but do not remove the failure mode", code: "# always keep a verification layer regardless of model size" },
        { term: "Persona prompts != accuracy", desc: "'Act as an expert' changes tone/confidence, not correctness", code: "# confident phrasing is not evidence of a verified fact" },
        { term: "Anecdotal validation", desc: "A few manually tried prompts miss long-tail/adversarial cases", code: "# use a real benchmark, not vibes-based spot checks" },
        { term: "No abstention path", desc: "Always producing a confident answer removes the honest option", code: "# design and test the decline/hedge path as a first-class case" },
      ],
    },
  ],
};

export default hallucination;
