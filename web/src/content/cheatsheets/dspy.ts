import type { CheatSheetData } from "./types";

const dspy: CheatSheetData = {
  title: "The Ultimate DSPy Cheat Sheet",
  subtitle: "Signatures, modules, programs, metrics, and metric-driven compilation",
  sections: [
    {
      title: "Core Concepts & Setup",
      color: "violet",
      rows: [
        { term: "Philosophy", desc: "Programming, not prompting: declare intent, let an optimizer find the wording", code: "signature -> module -> program\nthen: metric + optimizer -> compiled program" },
        { term: "dspy.settings.configure", desc: "Point DSPy at an LM backend before running anything", code: "import dspy\nlm = dspy.LM('provider/model-name')\ndspy.settings.configure(lm=lm)" },
        { term: "Signature (inline)", desc: "Shorthand string form: inputs -> outputs", code: "qa_sig = 'question, context -> answer'" },
        { term: "Signature (class)", desc: "Explicit form with descriptions and a task instruction", code: "class Answer(dspy.Signature):\n    'Answer using only the context.'\n    question: str = dspy.InputField()\n    context: str = dspy.InputField()\n    answer: str = dspy.OutputField()" },
        { term: "InputField / OutputField", desc: "Declare each field, optionally with a desc hint", code: "q: str = dspy.InputField(desc='user question')\na: str = dspy.OutputField(desc='one sentence')" },
        { term: "dspy.Example", desc: "A labeled training/validation record", code: "ex = dspy.Example(question='...', answer='...')\nex = ex.with_inputs('question')" },
        { term: "dspy.Prediction", desc: "The object a module call returns (has your output fields)", code: "result = module(question=q, context=c)\nresult.answer" },
        { term: "Zero-shot run", desc: "Call a module before compiling — sanity check first", code: "predict = dspy.Predict(Answer)\npredict(question=q, context=c).answer" },
      ],
    },
    {
      title: "Modules — Prompting Strategies",
      color: "blue",
      rows: [
        { term: "dspy.Predict", desc: "Direct prediction — simplest, cheapest strategy", code: "m = dspy.Predict(Answer)\nm(question=q, context=c)" },
        { term: "dspy.ChainOfThought", desc: "Elicits reasoning before the final answer; costs more tokens", code: "m = dspy.ChainOfThought(Answer)\nm(question=q, context=c).answer" },
        { term: "Agentic / tool-using module", desc: "Interleaves reasoning with tool calls for multi-step tasks (ReAct-style)", code: "m = dspy.ReAct(Answer, tools=[search, calculator])" },
        { term: "dspy.Module subclass", desc: "Compose modules into a program with forward()", code: "class QA(dspy.Module):\n    def __init__(self):\n        super().__init__()\n        self.answer = dspy.ChainOfThought(Answer)\n    def forward(self, question, context):\n        return self.answer(question=question, context=context)" },
        { term: "Choosing a module", desc: "Start cheap, escalate only if the metric says so", code: "simple classify/extract  -> Predict\nmulti-step reasoning      -> ChainOfThought\ntool use / iterative       -> agentic module" },
        { term: "Multi-step composition", desc: "One module's output feeds the next module's input", code: "query = self.generate_query(question=q).query\npassages = self.retriever(query, k=5)\nanswer = self.answer(question=q, context=passages)" },
      ],
    },
    {
      title: "Metrics & Trainsets",
      color: "emerald",
      rows: [
        { term: "Metric signature", desc: "example, prediction, optional trace -> bool or float", code: "def metric(example, prediction, trace=None):\n    return example.answer.lower() in prediction.answer.lower()" },
        { term: "Exact-match metric", desc: "Cheapest, most reliable when applicable", code: "def em(example, pred, trace=None):\n    return example.answer.strip() == pred.answer.strip()" },
        { term: "Normalized match", desc: "Guard against trivial formatting mismatches", code: "gold = example.answer.strip().lower()\npred = prediction.answer.strip().lower()\nreturn gold == pred" },
        { term: "Partial-credit metric", desc: "Return a float instead of a bool when useful", code: "overlap = len(set(gold.split()) & set(pred.split()))\nreturn overlap / max(len(gold.split()), 1)" },
        { term: "LLM-as-judge metric", desc: "For open-ended tasks with no exact answer; expensive — multiplies calls", code: "def judge_metric(example, pred, trace=None):\n    verdict = judge_lm(question=example.question, answer=pred.answer)\n    return verdict.is_good" },
        { term: "Trainset curation rule", desc: "Source from real traffic, not synthetic guesses", code: "trainset = [dspy.Example(question=q, answer=a).with_inputs('question')\n            for q, a in real_logged_pairs]" },
        { term: "Train/validation split", desc: "Never score compiled candidates only on bootstrap examples", code: "train, val = examples[:40], examples[40:]\ncompiled = optimizer.compile(program, trainset=train)\nscore = evaluate(compiled, val)" },
      ],
    },
    {
      title: "Optimizers & Compilation",
      color: "amber",
      rows: [
        { term: "Bootstrap few-shot optimizer", desc: "Cheapest style — selects/validates good demonstrations", code: "optimizer = dspy.BootstrapFewShot(metric=metric)\ncompiled = optimizer.compile(program, trainset=trainset)" },
        { term: "Instruction-search optimizer", desc: "Rewrites/refines the task description, tested against the metric", code: "# conceptual — check current API name\noptimizer = dspy.MIPRO(metric=metric)\ncompiled = optimizer.compile(program, trainset=trainset)" },
        { term: "What compilation produces", desc: "A program with baked-in demos/instructions — not editable source", code: "compiled(question=q)   # same call interface as uncompiled\n# do NOT hand-edit compiled.answer.signature.instructions" },
        { term: "Persist a compiled program", desc: "Compile once offline; never recompile per request", code: "compiled.save('artifacts/qa.v1.json')\nloaded = QA()\nloaded.load('artifacts/qa.v1.json')" },
        { term: "Recompile for a new model", desc: "The portability workflow: reconfigure LM, rerun optimizer", code: "dspy.settings.configure(lm=new_lm)\nrecompiled = optimizer.compile(QA(), trainset=trainset)" },
        { term: "Compile-time cost driver", desc: "Scales with trainset size x number of candidates tried", code: "cost ~ len(trainset) * num_candidates\n# LLM-as-judge metrics multiply this further" },
        { term: "Evaluate before vs after", desc: "Prove compilation actually helped", code: "baseline = score(uncompiled_program, val)\nimproved = score(compiled_program, val)\nassert improved >= baseline" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Fake / always-true metric", desc: "Teaches the optimizer nothing — compilation becomes a no-op", code: "# WRONG\ndef fake(example, pred, trace=None): return True" },
        { term: "Bootstrap == validation leakage", desc: "Scoring only on bootstrap examples measures memorization", code: "# WRONG: same set for compile and eval\ncompiled = optimizer.compile(program, trainset=all_ex)\nscore(compiled, all_ex)  # inflated" },
        { term: "Hand-editing compiled instructions", desc: "Untracked drift — next recompile silently discards the edit", code: "# WRONG\ncompiled.answer.signature.instructions = 'be brief'\n# RIGHT: change metric/trainset, then recompile" },
        { term: "Assuming artifacts transfer across models", desc: "A compiled program is model-specific — recompile, don't reuse blindly", code: "# WRONG: reuse gpt-x compiled artifact against a new model as-is\n# RIGHT: reconfigure lm and rerun optimizer.compile()" },
        { term: "Shipping the uncompiled program", desc: "Zero-shot behavior is usually the weakest version", code: "# WRONG\nqa = QA()  # never compiled, served as-is" },
        { term: "Compiling inline per request", desc: "Compilation is slow and API-call heavy — it's a build step", code: "# WRONG: compile() inside a request handler\n# RIGHT: compile offline in CI, load persisted artifact at startup" },
        { term: "Sensitive data in trainset", desc: "Bootstrapped demos get embedded verbatim into every production prompt", code: "# scrub PII / regulated data from trainset before compiling" },
        { term: "Over-broad signature", desc: "One signature doing retrieval + reasoning + formatting confuses optimization", code: "# split into GenerateQuery -> Retrieve -> AnswerFromContext instead" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Project layout", desc: "Separate signatures / programs / optimize / compiled_artifacts / service", code: "signatures/qa.py\nprograms/retrieve_then_answer.py\noptimize/{trainset,metric,compile}.py\ncompiled_artifacts/qa.v3.json\nservice/api.py" },
        { term: "Artifact tagging", desc: "Track model + metric score + version on every compiled artifact", code: "meta = {'model': 'provider/model', 'val_score': 0.87, 'version': 'v3'}" },
        { term: "Empty-input guard", desc: "Handle empty retrieval/context explicitly, don't call the LLM on nothing", code: "if not context.strip():\n    return dspy.Prediction(answer=\"Not enough information.\")" },
        { term: "Timeout/retry wrapper", desc: "Compiled programs still need standard LLM-call resilience", code: "for attempt in range(3):\n    try:\n        return compiled_qa(question=q)\n    except TimeoutError:\n        continue" },
        { term: "Monitoring signal", desc: "Latency, token cost, and periodic live-traffic re-scoring", code: "log.info('dspy_call latency_ms=%.1f tokens=%d', ms, n_tokens)\n# weekly: re-run metric on a live-traffic sample" },
        { term: "Drift trigger", desc: "Recompile when live-traffic metric drops vs compile-time validation score", code: "if live_score < val_score - 0.1:\n    trigger_recompile()" },
        { term: "Versioning discipline", desc: "Treat compiled artifacts like model checkpoints, not hand-edited source", code: "compiled_artifacts/qa.v1.json  # rollback target\ncompiled_artifacts/qa.v2.json  # current" },
        { term: "Testing layers", desc: "Mock modules for control-flow tests; real LLM only for slow eval tests", code: "program.answer = lambda **kw: dspy.Prediction(answer='mocked')\n@pytest.mark.slow\ndef test_quality_bar(): ..." },
      ],
    },
  ],
};

export default dspy;
