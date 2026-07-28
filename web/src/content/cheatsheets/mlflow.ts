import type { CheatSheetData } from "./types";

const mlflow: CheatSheetData = {
  title: "The Ultimate MLflow Cheat Sheet",
  subtitle: "Tracking · Projects · Models · Model Registry · production toolbelt",
  sections: [
    {
      title: "Core Setup & Tracking Basics",
      color: "violet",
      rows: [
        { term: "set_tracking_uri", desc: "Point the client at a tracking server or local folder", code: "mlflow.set_tracking_uri('http://localhost:5000')\nmlflow.set_tracking_uri('file:./mlruns')" },
        { term: "set_experiment", desc: "Group runs under a named experiment", code: "mlflow.set_experiment('customer-churn')" },
        { term: "start_run", desc: "Begin a tracked run; context manager auto-closes it", code: "with mlflow.start_run(run_name='baseline'):\n    ...\n# auto end_run() on exit, even on exception" },
        { term: "log_param", desc: "Log a fixed input (hyperparameter/config), once per key", code: "mlflow.log_param('C', 1.0)\nmlflow.log_params({'C': 1.0, 'max_iter': 100})" },
        { term: "log_metric", desc: "Log a measured output, optionally as a time series", code: "mlflow.log_metric('f1', 0.83)\nmlflow.log_metric('loss', 0.2, step=epoch)" },
        { term: "set_tag", desc: "Free-form searchable metadata (git sha, data version)", code: "mlflow.set_tag('git_commit', sha)\nmlflow.set_tag('data_version', 's3://data/v3/')" },
        { term: "log_artifact(s)", desc: "Log any file(s) — plots, configs, samples", code: "mlflow.log_artifact('plot.png')\nmlflow.log_artifacts('outputs/')" },
        { term: "mlflow ui", desc: "Launch local web UI reading from ./mlruns", code: "mlflow ui   # default port 5000" },
        { term: "Run vs Experiment", desc: "Run = one execution; Experiment = named collection of runs", code: "experiment: 'customer-churn'\n  run 1, run 2, run 3 ..." },
      ],
    },
    {
      title: "Autologging & Model Logging",
      color: "blue",
      rows: [
        { term: "Autolog (generic)", desc: "One line: auto-captures params/metrics/model for supported frameworks", code: "mlflow.sklearn.autolog()\nmlflow.xgboost.autolog()\nmlflow.pytorch.autolog()" },
        { term: "log_model (flavor-specific)", desc: "Package a trained model in its native format", code: "mlflow.sklearn.log_model(model, 'model')\nmlflow.xgboost.log_model(model, 'model')" },
        { term: "infer_signature", desc: "Record expected input/output schema for validation", code: "from mlflow.models import infer_signature\nsig = infer_signature(X_train, model.predict(X_train))" },
        { term: "input_example", desc: "A few real rows attached for smoke-testing", code: "mlflow.sklearn.log_model(model, 'model',\n  signature=sig, input_example=X_train[:5])" },
        { term: "pyfunc.load_model", desc: "Framework-agnostic load — works for any flavor", code: "m = mlflow.pyfunc.load_model('runs:/<run_id>/model')\npreds = m.predict(X_test)" },
        { term: "registered_model_name", desc: "Log + register in one call", code: "mlflow.sklearn.log_model(model, 'model',\n  registered_model_name='fraud-detector')" },
        { term: "MLmodel file", desc: "Metadata file describing available flavors", code: "flavors:\n  python_function:\n  sklearn:" },
      ],
    },
    {
      title: "Searching & Comparing Runs",
      color: "emerald",
      rows: [
        { term: "search_runs", desc: "Query runs with a filter string, like SQL WHERE", code: "mlflow.search_runs(\n  experiment_names=['churn'],\n  filter_string=\"metrics.f1 > 0.8\",\n  order_by=['metrics.f1 DESC'])" },
        { term: "Filter syntax", desc: "Reference metrics/params/tags by prefix", code: "metrics.accuracy > 0.9\nparams.model_type = 'rf'\ntags.team = 'risk'" },
        { term: "MlflowClient.get_run", desc: "Fetch a single run's full data by ID", code: "client = mlflow.tracking.MlflowClient()\nrun = client.get_run(run_id)\nrun.data.metrics['f1']" },
        { term: "Nested runs", desc: "Model a sweep with a parent/child hierarchy", code: "with mlflow.start_run(run_name='sweep') as parent:\n    with mlflow.start_run(nested=True):\n        ..." },
        { term: "log_metrics batch", desc: "Reduce REST round-trips vs one call per value", code: "mlflow.log_metrics({'acc': 0.9, 'f1': 0.85}, step=epoch)" },
      ],
    },
    {
      title: "Model Registry",
      color: "amber",
      rows: [
        { term: "register_model", desc: "Create a new version pointing at a run's artifact", code: "mv = mlflow.register_model(\n  'runs:/<run_id>/model', 'fraud-detector')" },
        { term: "Stage transition (classic)", desc: "None -> Staging -> Production -> Archived", code: "client.transition_model_version_stage(\n  name='fraud-detector', version=3,\n  stage='Production', archive_existing_versions=True)" },
        { term: "Load by stage", desc: "Resolve whatever is currently in a stage", code: "mlflow.pyfunc.load_model('models:/fraud-detector/Production')" },
        { term: "Alias (newer model)", desc: "Flexible, mutable, named pointer — multiple per version", code: "client.set_registered_model_alias(\n  'fraud-detector', 'production', version=3)" },
        { term: "Load by alias", desc: "Resolve via @alias instead of a fixed stage name", code: "mlflow.pyfunc.load_model('models:/fraud-detector@production')" },
        { term: "search_model_versions", desc: "Inspect all versions and their current stage/aliases", code: "for mv in client.search_model_versions(\"name='fraud-detector'\"):\n    print(mv.version, mv.current_stage, mv.aliases)" },
        { term: "Governance tags", desc: "Free-form metadata the stage/alias system can't express", code: "client.set_model_version_tag(\n  'fraud-detector', 3, 'approved_by', 'jane')" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Unset tracking URI", desc: "Silent write to a local ./mlruns folder nobody else sees", code: "# Always set explicitly in CI / training entry point:\nmlflow.set_tracking_uri(os.environ['MLFLOW_TRACKING_URI'])" },
        { term: "File store in production", desc: "No safe concurrent writers, no full Registry API support", code: "# WRONG for shared teams:\nmlflow server --backend-store-uri ./mlruns\n# RIGHT:\nmlflow server --backend-store-uri postgresql://..." },
        { term: "Under-logging reproducibility", desc: "Only the metric, not code/data/seed — unreproducible in 6 months", code: "mlflow.set_tag('git_commit', sha)\nmlflow.set_tag('data_version', ds_uri)\nmlflow.log_param('seed', 42)" },
        { term: "Registry as file dump", desc: "Registering + promoting with no evaluation gate or approval", code: "# Gate promotion on an actual metric threshold,\n# not just 'register then immediately promote'" },
        { term: "No model signature", desc: "Malformed input reaches the model, confusing runtime error", code: "mlflow.sklearn.log_model(model, 'model', signature=sig)" },
        { term: "Params are immutable per run", desc: "Re-logging same key with a new value raises an error", code: "# Start a NEW run for a new configuration,\n# don't re-log an existing param key" },
        { term: "BLOBs in the backend DB", desc: "Never store large model files directly in the metadata database", code: "# Artifacts always go to object storage (S3/GCS),\n# backend DB only stores a path pointer" },
        { term: "No built-in server auth", desc: "Open-source tracking server has no auth by default", code: "# Put an authenticating reverse proxy / gateway\n# in front of mlflow server" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Start a real server", desc: "Database backend + object storage artifact root", code: "mlflow server \\\n  --backend-store-uri postgresql://u:p@host/mlflow \\\n  --default-artifact-root s3://bucket/mlflow-artifacts" },
        { term: "MLproject file", desc: "Reproducible packaging with declared entry points", code: "entry_points:\n  main:\n    parameters: {C: {type: float, default: 1.0}}\n    command: \"python train.py --C {C}\"" },
        { term: "mlflow run", desc: "Execute a project reproducibly, locally or from git", code: "mlflow run . -P C=0.5\nmlflow run https://github.com/org/repo.git" },
        { term: "mlflow models serve", desc: "Spin up a local REST inference endpoint for a model", code: "mlflow models serve -m models:/fraud-detector@production -p 1234" },
        { term: "mlflow models build-docker", desc: "Package a model as a standalone serving container", code: "mlflow models build-docker -m models:/fraud-detector/Production \\\n  -n fraud-detector-image" },
        { term: "mlflow.evaluate", desc: "Score a model against a labeled dataset, log the results", code: "results = mlflow.evaluate(model_uri, eval_data,\n  targets='label', model_type='classifier')" },
        { term: "Scheduled drift check", desc: "Re-evaluate the Production model daily, log as a run", code: "with mlflow.start_run(run_name='daily-eval'):\n    r = mlflow.evaluate(prod_uri, fresh_data, targets='label')\n    mlflow.log_metrics(r.metrics)" },
        { term: "Concurrency rule of thumb", desc: "Pick the right backend for real concurrent writers", code: "solo/local     -> file store OK\nshared/team    -> Postgres/MySQL required" },
      ],
    },
  ],
};

export default mlflow;
