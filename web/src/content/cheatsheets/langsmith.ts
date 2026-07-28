import type { CheatSheetData } from "./types";

const langsmith: CheatSheetData = {
  title: "The Ultimate LangSmith Cheat Sheet",
  subtitle: "Tracing · datasets & evaluation · feedback · monitoring · production toolbelt",
  sections: [
    {
      title: "Setup & Core Concepts",
      color: "violet",
      rows: [
        { term: "Install", desc: "Python SDK package", code: "pip install langsmith" },
        { term: "Enable tracing (env vars)", desc: "Zero-code tracing for LangChain/LangGraph apps", code: "export LANGCHAIN_TRACING_V2=true\nexport LANGCHAIN_API_KEY=ls__...\nexport LANGCHAIN_PROJECT=my-project" },
        { term: "Run", desc: "One logged unit of work: LLM call, tool call, retriever, or chain", code: "run.inputs\nrun.outputs\nrun.start_time / run.end_time" },
        { term: "Trace", desc: "The full tree of runs from one top-level invocation", code: "parent chain run\n  -> retriever run (child)\n  -> llm run (child)" },
        { term: "Project", desc: "Named bucket of traces — separate per environment", code: "LANGCHAIN_PROJECT=support-bot-staging\nLANGCHAIN_PROJECT=support-bot-prod" },
        { term: "Client()", desc: "SDK entry point for datasets, feedback, prompts, queries", code: "from langsmith import Client\nclient = Client()" },
        { term: "Run types", desc: "Categorize a run for the trace tree UI", code: "run_type=\"chain\"\nrun_type=\"llm\"\nrun_type=\"retriever\"\nrun_type=\"tool\"" },
      ],
    },
    {
      title: "Tracing (Core & Data Structures)",
      color: "blue",
      rows: [
        { term: "@traceable decorator", desc: "Instrument any function, framework-free", code: "from langsmith import traceable\n\n@traceable(run_type=\"llm\")\ndef ask(q: str) -> str:\n    return client.chat.completions.create(...)" },
        { term: "Automatic nesting", desc: "Nested traced calls become children via context propagation", code: "@traceable(run_type=\"chain\")\ndef pipeline(q):\n    docs = retrieve(q)   # child run\n    return ask(q)         # child run" },
        { term: "Tags", desc: "Free-form labels for filtering traces later", code: "@traceable(tags=[\"support-bot\", \"v1\"])\ndef handle(ticket): ..." },
        { term: "Metadata", desc: "Structured key/value fields attached to a run", code: "@traceable(metadata={\"model\": \"gpt-4o-mini\", \"env\": \"prod\"})\ndef handle(ticket): ..." },
        { term: "Async tracing", desc: "Works across await boundaries automatically", code: "@traceable(run_type=\"llm\")\nasync def ask_async(q: str) -> str:\n    return await client.chat.completions.create(...)" },
        { term: "Get current run tree", desc: "Access/redact the active run programmatically", code: "from langsmith.run_helpers import get_current_run_tree\nrun = get_current_run_tree()\nrun.inputs = {**payload, \"ssn\": \"[REDACTED]\"}" },
        { term: "List runs", desc: "Query traces by project, error, tags", code: "client.list_runs(project_name=\"my-project\", error=True)\nclient.list_runs(project_name=\"my-project\", tags=[\"v1\"])" },
        { term: "Read a single run", desc: "Fetch one run and inspect its children", code: "run = client.read_run(run_id=\"...\")\nclient.list_runs(parent_run_id=run.id)" },
      ],
    },
    {
      title: "Datasets & Evaluation",
      color: "emerald",
      rows: [
        { term: "Create dataset", desc: "Named collection of input/expected-output examples", code: "ds = client.create_dataset(dataset_name=\"golden-set\")" },
        { term: "Add example", desc: "Seed a dataset row", code: "client.create_example(\n  inputs={\"q\": \"...\"},\n  outputs={\"a\": \"...\"},\n  dataset_id=ds.id,\n)" },
        { term: "Promote from production", desc: "Turn a real trace into a dataset example", code: "client.create_example(\n  inputs=run.inputs, outputs=run.outputs, dataset_id=ds.id,\n)" },
        { term: "Heuristic evaluator", desc: "Deterministic scoring function", code: "def is_helpful(run, example) -> dict:\n    ok = \"step\" in run.outputs[\"answer\"].lower()\n    return {\"key\": \"actionable\", \"score\": int(ok)}" },
        { term: "LLM-as-judge evaluator", desc: "Prompted model grades output against a rubric", code: "from langsmith.evaluation import LangChainStringEvaluator\nLangChainStringEvaluator(\"qa\")   # correctness grader" },
        { term: "evaluate()", desc: "Run your app over a dataset, score with evaluators", code: "from langsmith.evaluation import evaluate\nevaluate(my_fn, data=\"golden-set\",\n  evaluators=[is_helpful], experiment_prefix=\"v1\")" },
        { term: "Experiment", desc: "One evaluate() run — comparable against other experiments", code: "results.to_pandas()[\"feedback.actionable\"].mean()" },
        { term: "Validate a judge", desc: "Compare judge scores to human labels before trusting it", code: "agreement = (judge_scores == human_labels).mean()" },
        { term: "Trajectory evaluation", desc: "Score the sequence of tool calls, not just final answer", code: "def trajectory_eval(run, example) -> dict:\n    tools_called = [c.name for c in run.child_runs]\n    return {\"key\": \"correct_tools\", \"score\": int(tools_called == example.outputs[\"expected_tools\"])}" },
        { term: "CI gate on score", desc: "Fail the build on a quality regression", code: "avg = results.to_pandas()[\"feedback.actionable\"].mean()\nassert avg >= 0.85, \"quality regression\"" },
      ],
    },
    {
      title: "Feedback, Prompt Hub & Annotation",
      color: "amber",
      rows: [
        { term: "Create feedback", desc: "Attach a score/comment to a specific run", code: "client.create_feedback(\n  run_id=\"...\", key=\"user_thumbs\",\n  score=1, comment=\"great answer\",\n)" },
        { term: "Thumbs up/down endpoint", desc: "Wire product UI feedback to a run_id", code: "@app.post(\"/feedback\")\ndef submit(payload): \n    client.create_feedback(run_id=payload.run_id, key=\"thumbs\", score=payload.up)" },
        { term: "Filter by feedback score", desc: "Jump straight to complained-about traces", code: "client.list_runs(project_name=\"prod\", filter='eq(feedback_key, \"thumbs\") and eq(feedback_score, 0)')" },
        { term: "Pull a prompt", desc: "Version-controlled prompt registry", code: "prompt = client.pull_prompt(\n  \"my-org/support-answer-prompt\", include_model=True,\n)" },
        { term: "Pin a prompt version", desc: "Avoid silently pulling latest in production", code: "client.pull_prompt(\"my-org/prompt:v3\")" },
        { term: "Push a prompt", desc: "Publish a new/updated prompt version", code: "client.push_prompt(\"my-org/support-answer-prompt\", object=template)" },
        { term: "Annotation queue", desc: "Route flagged/low-confidence traces to human reviewers", code: "# configured in UI: rule -> queue\n# e.g. score < 0.5 or tag == \"flagged\"" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "No traces showing up", desc: "Env vars not set in the actual runtime process", code: "echo $LANGCHAIN_TRACING_V2\necho $LANGCHAIN_API_KEY" },
        { term: "Missing nesting", desc: "Forgot to decorate an inner function", code: "# every function you want visible needs @traceable" },
        { term: "Trusting judge scores blindly", desc: "LLM-as-judge inherits LLM bias/inconsistency", code: "# validate against human labels FIRST" },
        { term: "Evaluating only final answer", desc: "Hides which agent step actually failed", code: "# score run.child_runs (tool calls), not just run.outputs" },
        { term: "Hardcoded prompts", desc: "Slower iteration, no rollback path", code: "# use Prompt Hub instead of literal strings in code" },
        { term: "100% tracing at scale", desc: "Cost/noise blow up at high volume", code: "should_trace = random.random() < 0.05 or is_error" },
        { term: "Stale dataset", desc: "Frozen at launch, stops reflecting real traffic", code: "# periodically promote new production traces into it" },
        { term: "Small-sample overconfidence", desc: "A score delta on <30 examples may be noise", code: "# check per-example deltas, not just the aggregate mean" },
        { term: "PII in traces", desc: "Trace payloads capture full prompts/outputs verbatim", code: "# redact sensitive fields BEFORE tracing, not after" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Environment separation", desc: "Never mix dev experimentation with prod dashboards", code: "LANGCHAIN_PROJECT=app-dev\nLANGCHAIN_PROJECT=app-staging\nLANGCHAIN_PROJECT=app-prod" },
        { term: "Tagging convention", desc: "Enable later regression bisection", code: "tags=[\"env:prod\", \"prompt:v3\", \"model:gpt-4o-mini\"]" },
        { term: "Sampling with error bypass", desc: "Bound cost, keep failure visibility", code: "trace = (random.random() < 0.05) or had_error" },
        { term: "Monitoring signals", desc: "The RED-style trio for LLM apps", code: "latency p50/p95/p99\nerror rate\ncost per trace\nfeedback score trend" },
        { term: "Alert on symptoms", desc: "Page on what users feel, not internals", code: "alert: feedback_score_avg drops > 10% over 1h\nalert: p99_latency > 5s" },
        { term: "CI evaluation gate", desc: "Insert eval() as its own pipeline stage", code: "lint -> typecheck -> unit tests -> evaluate() gate -> build -> deploy" },
        { term: "Secrets handling", desc: "Never hardcode the API key", code: "LANGCHAIN_API_KEY from vault / secret manager\n# scope keys per project/service" },
        { term: "Self-hosted option", desc: "For data-residency / compliance needs", code: "# see official self-hosting docs for current requirements" },
      ],
    },
  ],
};

export default langsmith;
