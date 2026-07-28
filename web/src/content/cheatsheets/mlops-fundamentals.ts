import type { CheatSheetData } from "./types";

const mlopsFundamentals: CheatSheetData = {
  title: "The Ultimate MLOps Fundamentals Cheat Sheet",
  subtitle: "ML lifecycle · experiment tracking · model registry · CI/CD for ML · drift monitoring · retraining",
  sections: [
    {
      title: "Core Concepts & Terms",
      color: "violet",
      rows: [
        { term: "MLOps", desc: "Operational discipline for shipping and maintaining ML models in production, not just training them", code: "Deployable unit = code + data + model\nAll three versioned, all three can drift" },
        { term: "ML lifecycle", desc: "The loop every production model lives in, not a one-time linear process", code: "Data -> Train -> Evaluate -> Deploy\n-> Monitor -> Retrain -> back to Data" },
        { term: "Reproducibility", desc: "Given the same code, data, and seed, you can regenerate the same model", code: "Requires: code version + data version\n+ seed, all logged together" },
        { term: "Experiment tracking", desc: "Logging params, metrics, and the resulting artifact for every training run", code: "mlflow.log_params(params)\nmlflow.log_metric('accuracy', acc)" },
        { term: "Model registry", desc: "Staged system (Staging/Production/Archived) making 'what's live' queryable", code: "client.transition_model_version_stage(\n  name, version, stage='Production')" },
        { term: "Training/serving skew", desc: "Feature logic differs between training path and live serving path", code: "Symptom: live accuracy << offline eval\nFix: one shared feature definition" },
        { term: "Feature store", desc: "Shared offline/online feature definitions that structurally prevent skew", code: "See the Feature Stores skill\nfor offline/online store internals" },
        { term: "Data drift (covariate)", desc: "Input feature distribution shifted vs training reference", code: "Detect: compare distributions\n(PSI, embedding centroid distance)" },
        { term: "Concept drift", desc: "The input-to-target relationship itself changed", code: "Only detectable once ground truth\n(actual outcome) arrives" },
      ],
    },
    {
      title: "Pipeline Stages & Artifacts",
      color: "blue",
      rows: [
        { term: "Data validation", desc: "Schema, null-rate, and distribution checks before training even starts", code: "validate_schema(df, required_columns)\nfails fast on broken upstream data" },
        { term: "Training run", desc: "One tracked execution: params in, metrics + model artifact out", code: "with mlflow.start_run():\n    mlflow.log_params(params)\n    mlflow.sklearn.log_model(model, 'model')" },
        { term: "Evaluation gate", desc: "Candidate must clear a floor AND beat current production baseline", code: "if candidate_acc > prod_acc:\n    promote(candidate)" },
        { term: "Model artifact", desc: "The versioned, immutable output of one training run -- never overwritten in place", code: "models/model_v20260728_1200.joblib\nnever: models/model.joblib (overwritten)" },
        { term: "Promotion", desc: "Deliberate, logged action moving a version to Production; archives the outgoing one", code: "transition_model_version_stage(\n  stage='Production', archive_existing_versions=True)" },
        { term: "Data version hash", desc: "Content fingerprint of a training dataset, logged alongside every run", code: "hashlib.sha256(file_bytes).hexdigest()[:12]\nlogged next to params/metrics" },
        { term: "Golden/canary set", desc: "Fixed, versioned reference inputs re-run on a schedule to detect drift/decay", code: "Version under source control,\nnot only inside a platform UI" },
      ],
    },
    {
      title: "CI/CD for ML (vs Regular CI/CD)",
      color: "emerald",
      rows: [
        { term: "Regular CI/CD gate", desc: "Lint, unit test, integration test -- code only", code: "See the CI/CD skill for the\nfull pipeline anatomy" },
        { term: "ML-specific gate: data validation", desc: "Fails the pipeline on schema/null-rate/distribution anomalies", code: "python validate_schema.py --data train.csv" },
        { term: "ML-specific gate: model evaluation", desc: "Fails promotion if candidate doesn't beat current production baseline", code: "python evaluate.py --min-accuracy 0.85\npython compare_to_production.py" },
        { term: "Pipeline-as-code for ML", desc: "Training config, evaluation thresholds, and golden sets versioned in the repo", code: "configs/baseline.yaml\ntests/golden_set.jsonl" },
        { term: "Serving decoupled from deploy", desc: "Swapping active model version is a registry promotion, not a code redeploy", code: "model_uri = f'models:/{name}/Production'\nmlflow.pyfunc.load_model(model_uri)" },
        { term: "Scheduled retraining", desc: "Simple default: retrain on a fixed cadence regardless of signal", code: "cron: daily/weekly retrain job\nstart here before triggered retraining" },
        { term: "Triggered retraining", desc: "Retrain when a validated drift/decay signal crosses a threshold", code: "Requires trustworthy monitoring first --\nnoisy signal = bad-timing retrains" },
      ],
    },
    {
      title: "Monitoring & Drift",
      color: "amber",
      rows: [
        { term: "Infra health metrics", desc: "Uptime, p95 latency, error rate -- identical in kind to any other service", code: "p95_latency_ms, error_rate,\nthroughput -- unchanged by ML-ness" },
        { term: "Model-quality health metrics", desc: "The ML-specific addition: drift score, live accuracy, hallucination-style decay", code: "input_drift_score_24h,\nlive_accuracy_7d (once ground truth arrives)" },
        { term: "Async ground-truth join", desc: "Actual outcome often arrives later; join back to the original prediction by ID", code: "attach_ground_truth(request_id, actual)\njoins to the prediction log" },
        { term: "Drift score (PSI-style)", desc: "Compares recent feature distribution buckets against a reference window", code: "score += (recent_pct - ref_pct) *\n  (recent_pct / ref_pct)" },
        { term: "Sustained-trend alerting", desc: "Require a multi-day drop, not a single noisy sample, before paging", code: "if avg(last_3_days) < baseline - threshold:\n    page_oncall()" },
        { term: "Named alert ownership", desc: "An alert with no explicit on-call owner is operationally equivalent to no alert", code: "Route to a named team/rotation,\nnot a shared inbox nobody watches" },
        { term: "Sampling at scale", desc: "Score a representative subset of predictions, not every single one, at high volume", code: "See the AI Monitoring skill for\nthe identical sampling tradeoff" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "No rollback plan", desc: "Deploying forward-only with no tested revert path turns a bad model into an incident", code: "WRONG: delete old versions\nRIGHT: archive_existing_versions=True" },
        { term: "One-time-deliverable mindset", desc: "Shipping once and never revisiting guarantees decay -- the world keeps changing", code: "A model that's 95% accurate at launch\ncan be 80% six months later, zero code change" },
        { term: "Fixed-floor-only evaluation", desc: "Lets a technically-passable regression silently slip through an automated pipeline", code: "WRONG: if acc > 0.80: promote()\nRIGHT: if acc > current_prod_acc: promote()" },
        { term: "Duplicated feature logic", desc: "Two separately maintained implementations of 'the same' feature -- the #1 skew cause", code: "WRONG: training_feature() and\nserving_feature() as separate functions" },
        { term: "Single-sample alert triggers", desc: "One bad hour pages on-call -- same alert-fatigue failure as noisy Prometheus rules", code: "WRONG: if hourly_avg < threshold: page()\nRIGHT: require 24h AND 72h both below" },
        { term: "Untested reproducibility claims", desc: "Assuming you CAN reproduce a model without ever actually trying", code: "Actually attempt reproduction from\nlogged run + data hash before trusting it" },
        { term: "Conflating drift with decay", desc: "A drift alert means input/model changed -- it is NOT proof quality dropped", code: "Data drift can exist with stable accuracy;\nconfirm via live accuracy, don't assume" },
        { term: "Ambiguous ownership", desc: "'Who owns model monitoring' left implicit between DS/MLE/platform teams", code: "Fix: write an explicit operating model,\nnot a better org chart guess" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "MLflow", desc: "Open-source experiment tracking + model registry + model packaging", code: "See the MLflow skill for\nhands-on tracking/registry depth" },
        { term: "Weights & Biases", desc: "Hosted experiment tracking with strong run-comparison visualization", code: "See the Weights & Biases skill" },
        { term: "Kubeflow", desc: "Kubernetes-native ML pipeline orchestration", code: "See the Kubeflow skill --\nfits an existing K8s-centric stack" },
        { term: "Airflow", desc: "General-purpose workflow scheduler, often used for retraining pipelines", code: "See the Airflow skill --\nDAG-based scheduling/triggering" },
        { term: "Feature store (e.g. Feast)", desc: "Shared offline/online feature definitions -- the structural skew fix", code: "See the Feature Stores skill" },
        { term: "Managed platforms", desc: "SageMaker, Vertex AI, Azure ML -- integrated end-to-end offerings", code: "Lower integration overhead,\nhigher vendor lock-in -- verify current features" },
        { term: "Drift/monitoring libraries", desc: "Purpose-built libraries for data quality and drift checks", code: "e.g. evidently, great_expectations --\nverify current maintenance status" },
        { term: "AI Monitoring (sibling discipline)", desc: "Same lifecycle thinking applied to LLM/prompt/retrieval systems", code: "See the AI Monitoring skill" },
      ],
    },
  ],
};

export default mlopsFundamentals;
