import type { CheatSheetData } from "./types";

const kubeflow: CheatSheetData = {
  title: "The Ultimate Kubeflow Cheat Sheet",
  subtitle: "Components · Pipelines SDK · Katib · KServe · debugging · production toolbelt",
  sections: [
    {
      title: "Core Components",
      color: "violet",
      rows: [
        { term: "Kubeflow Pipelines (KFP)", desc: "Compiles Python-defined ML steps into a DAG executed as Kubernetes pods", code: "from kfp import dsl, compiler\n@dsl.component\ndef step(x: int) -> int:\n    return x + 1" },
        { term: "Katib", desc: "Hyperparameter/NAS search as a Kubernetes-native Experiment/Trial CRD pair", code: "apiVersion: kubeflow.org/v1beta1\nkind: Experiment\nspec:\n  algorithm: { algorithmName: random }" },
        { term: "KServe", desc: "InferenceService CRD turns a model artifact into an autoscaling endpoint", code: "apiVersion: serving.kserve.io/v1beta1\nkind: InferenceService\nspec:\n  predictor:\n    sklearn: { storageUri: s3://bucket/model/1 }" },
        { term: "Training Operator", desc: "PyTorchJob/TFJob CRDs for distributed-training pod topologies", code: "apiVersion: kubeflow.org/v1\nkind: PyTorchJob\nspec:\n  pytorchReplicaSpecs:\n    Master: { replicas: 1 }\n    Worker: { replicas: 3 }" },
        { term: "Notebooks", desc: "JupyterLab/RStudio pods running with namespace-native RBAC/quota", code: "# Launched via the Central Dashboard\n# Runs as a pod in the user's Profile namespace" },
        { term: "Central Dashboard", desc: "Single UI entry point across Pipelines, Katib, Notebooks, models", code: "# kubectl port-forward svc/centraldashboard -n kubeflow 8080:80" },
        { term: "Profile / namespace", desc: "Per-team/user isolation: RBAC, quota, notebook/pipeline scoping", code: "apiVersion: kubeflow.org/v1\nkind: Profile\nmetadata: { name: team-a }" },
      ],
    },
    {
      title: "KFP SDK v2 (Python)",
      color: "blue",
      rows: [
        { term: "dsl.component", desc: "Decorator turning a plain Python function into a containerized step", code: "@dsl.component(base_image=\"python:3.11-slim\")\ndef train(model_out: Output[Model]):\n    ..." },
        { term: "dsl.pipeline", desc: "Decorator marking a function as the DAG assembly point", code: "@dsl.pipeline(name=\"train-eval\")\ndef my_pipeline():\n    t = train()\n    evaluate(model_in=t.outputs[\"model_out\"])" },
        { term: "Input / Output artifacts", desc: "Typed Model/Dataset/Metrics objects wire step dependencies", code: "def evaluate(model_in: Input[Model], metrics_out: Output[Metrics]):\n    ..." },
        { term: "compiler.Compiler", desc: "Turns the pipeline function into a portable IR YAML file", code: "compiler.Compiler().compile(\n  pipeline_func=my_pipeline,\n  package_path=\"p.yaml\")" },
        { term: "Client.create_run_from_pipeline_package", desc: "Submits a compiled pipeline to a running Pipelines backend", code: "from kfp import Client\nClient(host=\"http://localhost:8080\").create_run_from_pipeline_package(\n  \"p.yaml\", arguments={\"name\": \"x\"})" },
        { term: "dsl.If", desc: "Conditional branch — a step only runs if the condition holds", code: "with dsl.If(eval_task.output >= 0.9, name=\"deploy-if-good\"):\n    deploy(model_in=t.outputs[\"model_out\"])" },
        { term: "packages_to_install", desc: "Extra pip deps installed into the component's base image at run time", code: "@dsl.component(packages_to_install=[\"scikit-learn\", \"joblib\"])\ndef train(): ..." },
        { term: "Pipeline caching", desc: "Skips re-execution if inputs, code, and image digest are unchanged", code: "# Caching is keyed on declared inputs + image digest,\n# NOT on external mutable state (a common gotcha)" },
        { term: "v1 vs v2 SDK", desc: "v1: ContainerOp/YAML specs. v2: decorator-based, typed, easier to test", code: "# v2 is the current recommended default (verify against current docs)" },
      ],
    },
    {
      title: "Katib Hyperparameter Tuning",
      color: "emerald",
      rows: [
        { term: "objective", desc: "Metric to maximize/minimize and the target goal", code: "objective:\n  type: maximize\n  goal: 0.95\n  objectiveMetricName: accuracy" },
        { term: "algorithm", desc: "Search strategy: random, grid, bayesianoptimization, etc.", code: "algorithm: { algorithmName: bayesianoptimization }" },
        { term: "parameters / feasibleSpace", desc: "The search space per hyperparameter (int/discrete/double)", code: "parameters:\n  - name: n_estimators\n    parameterType: int\n    feasibleSpace: { min: \"50\", max: \"300\" }" },
        { term: "trialTemplate", desc: "The Job spec launched per hyperparameter combination", code: "trialTemplate:\n  primaryContainerName: training-container\n  trialSpec: { apiVersion: batch/v1, kind: Job, spec: {...} }" },
        { term: "maxTrialCount", desc: "ALWAYS set — bounds total compute the search can consume", code: "spec:\n  maxTrialCount: 12\n  parallelTrialCount: 3\n  maxFailedTrialCount: 3" },
        { term: "Trial", desc: "One hyperparameter combination's run — a Kubernetes Job under the hood", code: "kubectl get trials -n <namespace>" },
      ],
    },
    {
      title: "KServe & Serving",
      color: "amber",
      rows: [
        { term: "InferenceService", desc: "Declarative manifest naming a model's storage location + framework", code: "spec:\n  predictor:\n    sklearn: { storageUri: gs://bucket/model/1 }" },
        { term: "storageUri", desc: "Where the trained model artifact lives (S3/GCS/PVC)", code: "storageUri: \"s3://my-bucket/models/rf-classifier/1\"" },
        { term: "Scale-to-zero", desc: "Default via Knative — idle endpoints scale down to 0 replicas", code: "# Override for latency-sensitive endpoints:\nannotations:\n  autoscaling.knative.dev/minScale: \"1\"" },
        { term: "Canary rollout", desc: "Split traffic between model versions before a full cutover", code: "spec:\n  predictor:\n    canaryTrafficPercent: 10" },
        { term: "kubectl get inferenceservice", desc: "Check READY status and the endpoint URL", code: "kubectl get inferenceservice rf-classifier" },
        { term: "Resource requests/limits", desc: "Set explicitly on the predictor, sized from real profiling", code: "resources:\n  requests: { cpu: \"500m\", memory: \"512Mi\" }\n  limits: { cpu: \"1\", memory: \"1Gi\" }" },
      ],
    },
    {
      title: "Debugging Escalation",
      color: "rose",
      rows: [
        { term: "1. Pipelines UI DAG view", desc: "Red/gray node tells you which step failed, fastest first signal", code: "# No kubectl needed for this first check" },
        { term: "2. kubectl describe pod", desc: "Events section shows scheduling failures (Pending, no GPU, etc.)", code: "kubectl describe pod <step-pod> -n <namespace>" },
        { term: "3. kubectl logs", desc: "The actual Python traceback for a failed step", code: "kubectl logs <step-pod> -n <namespace>\nkubectl logs <step-pod> --previous" },
        { term: "4. Check artifact store", desc: "Verify the upstream step actually wrote its declared output", code: "# List the expected object storage path/bucket directly" },
        { term: "Katib stuck Experiment", desc: "Usually several stuck Trial (Job) pods — debug like any Job", code: "kubectl describe trial <trial-name> -n <namespace>" },
        { term: "KServe stuck NotReady", desc: "Failure is often one layer down in the Knative Revision", code: "kubectl describe inferenceservice <name>\nkubectl describe revision <revision-name>" },
        { term: "Assume Kubernetes first", desc: "Pending/ImagePullBackOff/OOMKilled are plain K8s problems, not Kubeflow-specific", code: "# Apply the Kubernetes skill's debugging escalation path unchanged" },
      ],
    },
    {
      title: "Pitfalls & Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Kubeflow for a tiny job", desc: "Classic anti-pattern: a single-node script never needed a cluster at all", code: "# If it runs in minutes on one machine, just run the script" },
        { term: "Unversioned pipeline IR", desc: "Compiled YAML never checked into Git => unreproducible months later", code: "compiler.Compiler().compile(\n  pipeline_func=p,\n  package_path=\"pipelines/compiled/p_v3.yaml\")\n# then git add/commit" },
        { term: "Unbounded Katib search", desc: "Missing maxTrialCount/parallelTrialCount burns compute silently", code: "# ALWAYS set explicit bounds, never leave them at defaults" },
        { term: "Operational overhead", desc: "Every component is a separate controller with its own upgrade cadence", code: "# Istio + Argo + Katib + KServe/Knative must stay mutually compatible" },
        { term: "GPU node pool", desc: "Dedicated, tainted pool so GPU capacity isn't consumed by CPU-only pods", code: "tolerations:\n  - key: workload\n    operator: Equal\n    value: gpu\n    effect: NoSchedule" },
        { term: "Pair with MLflow", desc: "Kubeflow's own metadata store is lineage-only, not a full model registry", code: "# Use MLflow for rich experiment comparison + registry stage transitions" },
        { term: "Self-host vs managed", desc: "Vertex AI Pipelines / SageMaker Pipelines as lower-overhead alternatives", code: "# Decide explicitly and document the reasoning before committing" },
        { term: "Test components standalone", desc: "A well-written @dsl.component wraps plain Python — unit-test it directly", code: "def test_train():\n    clf = train_model(n_estimators=10)\n    assert len(clf.estimators_) == 10" },
      ],
    },
  ],
};

export default kubeflow;
