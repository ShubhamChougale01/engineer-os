import type { SkillContent } from "../types";

/**
 * Kubeflow — full 50-section knowledge page.
 * Code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const kubeflow: SkillContent = {
  overview: `
Kubeflow is an open-source machine learning platform built on top of **Kubernetes**, designed to make ML workflows — training, hyperparameter tuning, serving, and the notebooks engineers develop in — portable, scalable, and composable as native Kubernetes objects. Where plain Kubernetes gives you generic primitives (Pod, Deployment, Service) for running any containerized workload, Kubeflow layers ML-specific abstractions on top: a **Pipeline** is a directed acyclic graph (DAG) of containerized steps with typed inputs/outputs, **Katib** is a Custom Resource for hyperparameter and neural architecture search, and **KServe** is a Custom Resource for turning a trained model artifact into an autoscaling inference endpoint with a standard prediction API.

For an AI engineer, Kubeflow matters because it answers a question that shows up the moment ML work leaves a single laptop or notebook: how do you take a training script that works fine on your machine and turn it into something that runs reproducibly on a shared cluster, with each step (data prep, training, evaluation, deployment) isolated in its own container, versioned, and independently scalable — including onto GPU nodes? Kubeflow's answer is to express the whole workflow as Python-defined components that compile down to a Kubernetes-native DAG (via **Kubeflow Pipelines**, often abbreviated KFP), so the same declarative, self-healing, API-driven model that makes Kubernetes good at running microservices (see the **Kubernetes** skill) gets reused for ML workflows instead of being reinvented from scratch.

Key characteristics: Kubeflow is **Kubernetes-native** — every Kubeflow object (a Pipeline run, a Katib Experiment, an InferenceService) is a Custom Resource Definition (CRD) reconciled by a controller, exactly like a Deployment or StatefulSet, which means it inherits Kubernetes' scheduling, RBAC, namespacing, and observability story rather than bolting on a parallel one. It is **modular** — you can adopt just KServe for serving, just Katib for tuning, or the full Pipelines-plus-notebooks-plus-serving stack, and each component can in principle be used independently of the others. It is **DAG-oriented** — a pipeline is fundamentally a graph of steps with explicit data dependencies between them, compiled ahead of time from a Python SDK into a portable format (originally Argo Workflow YAML, and in the v2 SDK a platform-neutral IR), which is what lets a pipeline be cached, resumed, and inspected step-by-step. And it is **heavyweight to operate** — because it inherits Kubernetes' own operational surface (nodes, networking, RBAC, storage classes) plus its own component set (each with its own controller, database, and upgrade cadence), running Kubeflow yourself is a genuine platform-engineering commitment, not a "pip install and go" tool; this operational cost is a recurring theme throughout this page and the single most common reason teams choose a managed alternative instead.
`,

  history: `
Kubeflow was announced by Google in December 2017, originally framed narrowly as "making it easy to run **TensorFlow** jobs on Kubernetes" — the name is literally a portmanteau of "Kubernetes" and "TensorFlow." The initial release wrapped **TFJob**, a Custom Resource for distributed TensorFlow training, plus JupyterHub-based notebooks, as a thin layer over Kubernetes.

| Year | Milestone |
|------|-----------|
| 2017 (Dec) | Kubeflow announced at KubeCon, initially focused on running distributed TensorFlow training jobs on Kubernetes |
| 2018 | Kubeflow 0.x releases broaden scope beyond TensorFlow — PyTorchJob, MXJob, and other framework-specific training operators are added alongside TFJob |
| 2018–2019 | Kubeflow Pipelines (KFP) emerges as its own component: a DAG-based workflow engine for compiling Python-defined ML steps into Argo Workflows, plus a UI for visualizing runs and comparing artifacts |
| 2019 | Katib is added as the hyperparameter-tuning and (later) neural-architecture-search component, itself built as a Kubernetes-native CRD/controller |
| 2019 | KFServing (the predecessor to KServe) is introduced, standardizing model serving as a Custom Resource with built-in autoscaling-to-zero via Knative |
| 2020 | Kubeflow 1.0 GA ships, consolidating Pipelines, Katib, KFServing, notebooks, and metadata tracking under one project umbrella |
| 2021 | KFServing is renamed and spun out as **KServe**, an independent CNCF-adjacent project, reflecting a broader trend of Kubeflow's components becoming independently usable outside the full Kubeflow install |
| 2021 | Kubeflow Pipelines SDK v2 development begins, introducing a cleaner Python-native component-authoring model (decorator-based, closer to plain Python functions) as a deliberate break from the more YAML/DSL-heavy v1 SDK |
| 2022–2023 | Kubeflow governance moves toward the **Kubeflow Working Groups** model under the Linux Foundation AI & Data Foundation, with distinct working groups per component (Pipelines, Training, Katib, KServe, Notebooks) |
| 2023–2024 | KFP v2 SDK reaches general availability and becomes the recommended default; v1 pipelines remain supported but v2 is where new features land |
| 2024–2025 | The Training Operator consolidates the various framework-specific job CRDs (TFJob, PyTorchJob, etc.) under a more unified training API; managed offerings (Google Vertex AI Pipelines, AWS SageMaker Pipelines) that use or resemble the KFP DAG model continue to gain adoption as lower-operational-overhead alternatives to self-hosted Kubeflow |

The throughline: Kubeflow's scope kept widening — from "run TensorFlow on Kubernetes" to "an entire modular ML platform" — and its individual components (KServe most visibly) increasingly graduated into independently governed projects usable without the full Kubeflow install, which mirrors how the ecosystem eventually chose composability over one monolithic platform.
`,

  "why-it-exists": `
Before Kubeflow, teams running ML workloads on Kubernetes faced a gap similar to the one Kubernetes itself filled for general application deployment a few years earlier: Kubernetes gave you generic containers, generic scheduling, and generic scaling, but nothing that understood the shape of an ML workflow specifically. A data scientist's actual workflow — load data, engineer features, train a model (possibly distributed across multiple GPU workers), evaluate it against a holdout set, tune hyperparameters across dozens of trial runs, then package the winning model for serving — does not map cleanly onto "here is one Deployment running one container." It is a multi-step, DAG-shaped process with typed data flowing between steps, and stateful concerns (which hyperparameters were tried, which model version came from which data/code combination) that plain Kubernetes objects have no vocabulary for.

The world before Kubeflow looked like this: teams either wrote hand-rolled shell scripts or general-purpose workflow engines (early Airflow deployments, Argo Workflows directly, Jenkins pipelines) to sequence training steps, with no shared convention for how a training container should accept inputs, produce outputs, or report metrics back to a tracking system. Distributed training frameworks like TensorFlow's parameter-server architecture or PyTorch's distributed data-parallel model each needed bespoke, error-prone Kubernetes manifests to set up the right pod topology (chief, workers, parameter servers) with the right environment variables — something Kubernetes' generic Deployment/StatefulSet objects were never designed to express directly. Hyperparameter tuning meant either running trials serially by hand or building custom orchestration to launch and track dozens of parallel training runs. And serving a trained model meant writing a bespoke Flask/FastAPI wrapper and its own Deployment/Service/Ingress trio per model, with no standard convention for how predict requests should look or how autoscaling-to-zero for a rarely-used model should work.

Kubeflow's founders' answer was to build ML-specific Custom Resources and controllers on top of Kubernetes rather than beside it: TFJob/PyTorchJob to express distributed-training pod topologies declaratively, Kubeflow Pipelines to express a training/eval/deploy workflow as a compiled DAG with typed artifacts, Katib to express hyperparameter search as its own reconciled object, and KFServing/KServe to express "here is a trained model, serve it" as a single declarative manifest with sane defaults for autoscaling and canary rollout. The gap Kubeflow filled was not "how do I run one container on Kubernetes" — it was "how do I express the ML-specific shape of training, tuning, and serving in the same declarative, self-healing, API-driven vocabulary Kubernetes already uses for everything else."
`,

  "problem-it-solves": `
Kubeflow concretely removes:

- **Ad hoc pipeline orchestration.** Kubeflow Pipelines lets you define training/eval/deploy workflows as Python functions decorated as components, compiled into a DAG with explicit data dependencies, instead of hand-writing YAML for an Argo Workflow or gluing together shell scripts and cron jobs.
- **Bespoke distributed-training manifests.** The Training Operator's CRDs (PyTorchJob, TFJob, and successors) let you declare "N workers, M parameter servers, this container image" and have the correct pod topology, environment variables, and service discovery wired up automatically, instead of hand-authoring that wiring per framework.
- **One-off hyperparameter-tuning scripts.** Katib runs a search (grid, random, Bayesian optimization, or more advanced strategies) as a first-class Kubernetes Experiment object, launching and tearing down trial pods for you and tracking results, instead of a bespoke loop that submits jobs and polls for completion.
- **Hand-rolled model-serving wrappers.** KServe turns "here is a model artifact in object storage" into a running, autoscaling (including scale-to-zero) inference endpoint with a standardized request/response schema, canary/traffic-splitting support, and integration with explainability and drift-detection add-ons — instead of every team writing its own Flask wrapper and Kubernetes manifests per model.
- **Disconnected experiment tracking.** Kubeflow's metadata/artifact tracking (ML Metadata, and pipeline run history in the KFP UI) ties a served model back to the exact pipeline run, container image versions, and hyperparameters that produced it, which is exactly the ML reproducibility problem also covered from a different angle in the **MLOps** skill.
- **Notebook-to-production friction.** Kubeflow Notebooks give data scientists a familiar JupyterLab environment that runs as a pod on the same cluster, with the same namespace/RBAC/storage story as the training and serving workloads it produces — narrowing the gap between "I prototyped this in a notebook" and "this runs in production."

What Kubeflow deliberately does **not** solve:

- **It is not a data warehouse or feature store.** It orchestrates compute steps; where your training data physically lives and how features are computed/cached is still the job of a data platform or a feature store, not Kubeflow itself.
- **It is not a general-purpose workflow orchestrator.** Kubeflow Pipelines is deliberately scoped to ML workflows with ML-shaped concerns (typed artifacts, metrics, model lineage). For scheduling heterogeneous business workflows — ETL jobs, report generation, cross-system data movement unrelated to a specific model — the **Airflow** skill's general-purpose DAG scheduler is usually the better fit; see Comparisons for exactly where the line falls.
- **It does not eliminate the need to understand Kubernetes.** Kubeflow's CRDs still ultimately schedule pods on nodes, still hit the same resource-quota, node-affinity, and networking concerns as any Kubernetes workload. A team running Kubeflow without solid Kubernetes fundamentals (see the **Kubernetes** skill) will find every Kubeflow problem doubles as a Kubernetes problem underneath.
- **It does not replace model experiment-tracking tools' full feature set.** Kubeflow's built-in metadata tracking is lighter-weight than a dedicated tool like MLflow's tracking server (see the **MLflow** skill) for rich experiment comparison UIs, model registries with stage transitions, and framework-specific autologging — many production Kubeflow deployments pair it with MLflow specifically for that reason.
- **It does not make small-scale training need Kubernetes.** If your whole training job fits on one machine (even one with a GPU) and finishes in minutes, Kubeflow adds significant operational surface for no benefit — see Anti-Patterns and Common Mistakes for this exact, frequently-made error.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what Kubeflow adds on top of plain Kubernetes, and name its major components (Pipelines, Katib, KServe, Training Operator, Notebooks) and what each is responsible for.
2. Describe why Kubernetes is a natural (if operationally heavy) substrate for ML workloads: GPU scheduling, resource isolation between training jobs, horizontal scaling of inference, and self-healing for long-running training.
3. Write a Kubeflow Pipelines (KFP) component as a Python function and compile a simple two-step pipeline (train → evaluate, or preprocess → train) into a runnable DAG.
4. Distinguish Kubeflow Pipelines SDK v1 from v2 at a conceptual level, and know that the newer v2, decorator-based component model is the current recommended default.
5. Describe how Katib runs a hyperparameter search as a Kubernetes-native Experiment object, and how it differs from a hand-rolled tuning loop.
6. Describe how KServe turns a model artifact into an autoscaling inference endpoint, including scale-to-zero and canary rollout, at a conceptual level.
7. Compare Kubeflow Pipelines to Airflow for ML workflows and articulate when each is the better choice.
8. Compare self-hosting Kubeflow to managed alternatives (Vertex AI Pipelines, SageMaker Pipelines) and reason about the operational cost of running Kubeflow yourself.
9. Identify the classic Kubeflow mistakes: reaching for it when a single-node job would do, underestimating operational overhead, and failing to version pipeline components.
10. Answer senior-level interview questions about Kubeflow's architecture, its relationship to Kubernetes, and when NOT to use it.
`,

  prerequisites: `
- **Required — the Kubernetes skill.** Kubeflow is a set of Custom Resources and controllers running on top of Kubernetes. If Pods, Deployments, Services, namespaces, and the control-loop/reconciliation model are unfamiliar, stop and read the **Kubernetes** skill first — this page assumes that vocabulary fluently and does not re-teach it.
- **Required**: working Python and basic familiarity with a training loop for at least one ML framework (scikit-learn, PyTorch, or TensorFlow) — Kubeflow Pipelines components are ordinary Python functions wrapping whatever training code you already write.
- **Required**: comfort with containers and building a Docker image (see the **Docker** skill), since each pipeline step ultimately runs inside a container image you either build yourself or reuse from a base image.
- **Helpful**: prior exposure to a general-purpose workflow orchestrator, ideally the **Airflow** skill, since Kubeflow Pipelines' DAG model is easiest to grasp by contrast — "this is like Airflow, but the nodes are ML steps with typed inputs/outputs, and the runtime is Kubernetes pods instead of Airflow workers."
- **Helpful**: the **MLOps** skill for the broader reproducibility/versioning/monitoring context that Kubeflow is one possible implementation of, and the **MLflow** skill for the experiment-tracking piece Kubeflow deployments frequently pair with.
- **Helpful**: familiarity with at least one cloud provider (**AWS** or **GCP**) if you plan to evaluate managed alternatives (SageMaker Pipelines, Vertex AI Pipelines) alongside self-hosted Kubeflow, which this page recommends most teams at least seriously consider before committing to self-hosting.

Dependency links on this platform: **Docker** (package one training/serving step) → **Kubernetes** (orchestrate the fleet) → this page (ML-specific DAGs, tuning, and serving on top of that fleet) → **MLflow**/**MLOps** (track, register, and govern what Kubeflow produced) → **Airflow** (orchestrate the non-ML-specific workflows around it).
`,

  "beginner-concepts": `
### What Kubeflow actually is: components, not one monolith

The single most important beginner mental model: "Kubeflow" is not one program you install and run — it is an umbrella project bundling several independently useful components, each implemented as one or more Kubernetes Custom Resource Definitions (CRDs) plus a controller that reconciles them. The major components:

- **Kubeflow Pipelines (KFP)** — define and run multi-step ML workflows as a compiled DAG.
- **Katib** — hyperparameter tuning and (more recently) neural architecture search, as a Kubernetes-native Experiment/Trial object pair.
- **KServe** — turn a trained model artifact into a running, autoscaling inference endpoint via an InferenceService CRD.
- **Training Operator** — CRDs (PyTorchJob, TFJob, and others) for declaring distributed-training pod topologies.
- **Notebooks** — JupyterLab (and RStudio/VS Code) pods running on the cluster with the same namespace/RBAC story as everything else.

You can, and many teams do, adopt just one of these (KServe alone is common) without installing the "full Kubeflow" distribution.

### Why Kubernetes is a natural fit for ML workloads

Kubernetes' core primitives map onto ML-specific needs more directly than they first appear:

- **Resource isolation.** Each training run or inference pod gets its own CPU/memory/GPU allocation via resource requests/limits, so one team's runaway training job cannot starve another's — the same isolation Kubernetes already provides for any multi-tenant workload.
- **GPU scheduling.** Kubernetes' device-plugin mechanism lets the scheduler treat GPUs as a schedulable resource (nvidia.com/gpu: 1 in a pod spec), so a training job requesting a GPU only lands on nodes that actually have one, and multiple training jobs can share a GPU-equipped node pool without manual bookkeeping.
- **Elastic scaling for inference.** A model-serving Deployment (or a KServe InferenceService, which wraps one) can scale horizontally with traffic exactly like any other stateless HTTP service, including scaling to zero when idle via Knative underneath KServe.
- **Self-healing for long-running training.** A multi-hour or multi-day distributed training job benefits from the same automatic pod-restart-on-crash behavior that any long-running Kubernetes workload gets, without a human babysitting it.

This is why Kubeflow chose to build on Kubernetes rather than invent a new scheduler: the hard distributed-systems problems (bin-packing, self-healing, isolation, autoscaling) were already solved generically, and Kubeflow only needed to add the ML-specific vocabulary on top.

### Your first pipeline component (KFP v2 SDK)

A Kubeflow Pipelines component is an ordinary Python function decorated to say "compile this into a containerized step." Here is the simplest possible one:

~~~python
# component.py — a single KFP v2 component
from kfp import dsl

@dsl.component(base_image="python:3.11-slim")
def say_hello(name: str) -> str:
    """A trivial component: takes a string input, returns a string output."""
    greeting = f"Hello, {name}!"
    print(greeting)
    return greeting
~~~

Note the hedge worth stating plainly: Kubeflow Pipelines has two SDK generations with meaningfully different authoring styles — v1 (more YAML/DSL-heavy, using dsl.ContainerOp and a separate component.yaml spec file) and v2 (the decorator-based, plain-Python style shown above, now the recommended default). Community tutorials and blog posts you find online may show either style; always check which SDK version a given example targets before copying it, since v1-style code will not run against a v2-only pipeline definition.

### Compiling and running a pipeline

A pipeline is a Python function that calls one or more components and wires their outputs to each other's inputs; a separate compile step turns that Python function into a portable IR (Intermediate Representation) YAML file that the Kubeflow Pipelines backend actually executes:

~~~python
# pipeline.py
from kfp import dsl, compiler

@dsl.pipeline(name="hello-pipeline")
def hello_pipeline(name: str = "world"):
    say_hello(name=name)   # the component from above

compiler.Compiler().compile(
    pipeline_func=hello_pipeline,
    package_path="hello_pipeline.yaml",
)
~~~

~~~bash
# Submit the compiled pipeline to a running Kubeflow Pipelines backend
# (via the KFP client, pointed at your cluster's Pipelines endpoint)
python -c "
from kfp import Client
client = Client(host='http://localhost:8080')  # port-forwarded ml-pipeline-ui service
client.create_run_from_pipeline_package(
    'hello_pipeline.yaml',
    arguments={'name': 'Kubeflow'},
)
"
~~~

Running this produces one pod, running your say_hello component's container, visible in the Kubeflow Pipelines UI as a one-node DAG with its logs and output artifact attached.
`,

  "intermediate-concepts": `
### A real two-step training pipeline

Most real pipelines chain at least a training step and an evaluation step, passing a model artifact between them. KFP v2 represents artifacts (models, datasets, metrics) as typed objects rather than plain strings, which is what lets the Pipelines UI show you exactly which artifact fed which step:

~~~python
from kfp import dsl
from kfp.dsl import Output, Input, Model, Metrics

@dsl.component(base_image="python:3.11-slim", packages_to_install=["scikit-learn", "joblib"])
def train(model_out: Output[Model]):
    from sklearn.datasets import load_iris
    from sklearn.ensemble import RandomForestClassifier
    import joblib

    X, y = load_iris(return_X_y=True)
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    # model_out.path is a filesystem path KFP wires to durable storage automatically
    joblib.dump(clf, model_out.path)

@dsl.component(base_image="python:3.11-slim", packages_to_install=["scikit-learn", "joblib"])
def evaluate(model_in: Input[Model], metrics_out: Output[Metrics]):
    from sklearn.datasets import load_iris
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score
    import joblib

    X, y = load_iris(return_X_y=True)
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    clf = joblib.load(model_in.path)
    acc = accuracy_score(y_test, clf.predict(X_test))
    metrics_out.log_metric("accuracy", acc)   # surfaces in the Pipelines UI

@dsl.pipeline(name="train-evaluate-pipeline")
def train_evaluate_pipeline():
    train_task = train()
    evaluate(model_in=train_task.outputs["model_out"])
~~~

The key idea to internalize: KFP resolves the dependency between train_task and evaluate purely from the fact that evaluate's input is wired to train_task's output — the compiler infers the DAG edges from data dependencies, you never manually declare "evaluate runs after train."

### Katib: hyperparameter tuning as a Kubernetes object

Instead of writing a Python loop that launches training runs with different hyperparameters and manually tracks results, Katib expresses the whole search as one declarative Experiment object:

~~~yaml
# katib-experiment.yaml — a small random-search experiment
apiVersion: kubeflow.org/v1beta1
kind: Experiment
metadata:
  name: rf-tuning
spec:
  objective:
    type: maximize
    goal: 0.99
    objectiveMetricName: accuracy
  algorithm:
    algorithmName: random
  parameters:
    - name: n_estimators
      parameterType: int
      feasibleSpace: { min: "50", max: "300" }
    - name: max_depth
      parameterType: int
      feasibleSpace: { min: "2", max: "20" }
  trialTemplate:
    primaryContainerName: training-container
    trialParameters:
      - name: nEstimators
        reference: n_estimators
      - name: maxDepth
        reference: max_depth
    trialSpec:
      apiVersion: batch/v1
      kind: Job
      spec:
        template:
          spec:
            containers:
              - name: training-container
                image: myregistry/rf-trainer:1.0
                command: ["python", "train.py", "--n-estimators=\${trialParameters.nEstimators}", "--max-depth=\${trialParameters.maxDepth}"]
            restartPolicy: Never
~~~

Katib's controller launches one Trial (a Kubernetes Job) per hyperparameter combination its chosen algorithm selects, watches each Trial's reported metric, and converges toward the objective — the same reconciliation pattern as any other Kubernetes controller, just applied to search rather than deployment.

### KServe: declaring a served model

KServe reduces "serve this model" to a single manifest naming the model's storage location and framework:

~~~yaml
# inference-service.yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: rf-classifier
spec:
  predictor:
    sklearn:
      storageUri: "gs://my-bucket/models/rf-classifier/1"
      resources:
        requests: { cpu: "500m", memory: "512Mi" }
        limits: { cpu: "1", memory: "1Gi" }
~~~

~~~bash
kubectl apply -f inference-service.yaml
kubectl get inferenceservice rf-classifier   # shows READY and the endpoint URL
~~~

Under the hood, KServe (built on Knative Serving) creates the Deployment, Service, and autoscaling configuration for you, including scale-to-zero when the endpoint receives no traffic for a configurable idle period — a default that matters a great deal for cost when you have many rarely-called models, and a capability plain Kubernetes Deployments do not give you out of the box.

### Passing parameters and control flow in pipelines

Real pipelines need conditionals and loops — for example, only deploying a model if its evaluated accuracy clears a threshold:

~~~python
@dsl.pipeline(name="conditional-deploy-pipeline")
def conditional_pipeline(accuracy_threshold: float = 0.9):
    train_task = train()
    eval_task = evaluate(model_in=train_task.outputs["model_out"])

    with dsl.If(eval_task.outputs["accuracy"] >= accuracy_threshold, name="deploy-if-good"):
        deploy(model_in=train_task.outputs["model_out"])
~~~

This dsl.If construct compiles to conditional branching in the underlying DAG engine — the pipeline still runs eval unconditionally, but the deploy step is skipped entirely (not merely a no-op) when the condition is false, which is visible in the Pipelines UI as a grayed-out node.
`,

  "advanced-concepts": `
### v1 vs v2 SDK: what actually changed and why it matters

The v1 Pipelines SDK modeled a component as a container spec plus a separate component.yaml describing its inputs/outputs, authored either by hand or via dsl.ContainerOp; pipelines were assembled by wiring ContainerOp instances together inside a dsl.pipeline-decorated function. The v2 SDK collapses this into plain Python functions decorated with @dsl.component, with typed Python parameters and Input/Output artifact annotations doing the work that a separate YAML spec used to do. The practical consequence for a senior engineer: v2 components are far easier to unit test locally (they are just Python functions — call say_hello("world") directly in a test, no cluster needed) and their typed I/O prevents a whole class of "step B expected an int but step A produced a string" bugs at compile time rather than at runtime deep into a multi-hour pipeline. The tradeoff: v1's ContainerOp gave slightly more direct control over the underlying Argo Workflow YAML for teams that needed to hand-tune very specific container behavior; v2 deliberately trades some of that low-level control for ergonomics and safety. Hedge explicitly: exact API surface and migration guidance have shifted release to release; always check the installed KFP SDK version (kfp.__version__) against current docs before assuming a specific method signature.

### Caching and pipeline re-runs

KFP caches a component's execution by hashing its inputs, its container image digest, and its code — if you re-run a pipeline and an upstream step's inputs are unchanged, KFP can skip re-executing it and reuse the previous run's output artifact directly. This matters enormously for iteration speed: if you are only changing the evaluate step's threshold logic, a correctly-cached pipeline re-run skips the expensive train step entirely and only re-executes evaluate. The failure mode to know: caching is keyed on the component's declared inputs and image digest, not on external state (a changed upstream database table, a mutated file the code reads by side effect) — a component that silently depends on external mutable state can produce a stale cached result that looks successful but is wrong, which is a variant of the general "hidden state breaks memoization" problem familiar from any caching system.

### Distributed training topologies via the Training Operator

A PyTorchJob or TFJob's spec declares replica counts per role (Master/Worker for PyTorch; Chief/Worker/PS/Evaluator for TensorFlow's older parameter-server architecture), and the Training Operator's controller creates the right number of pods per role with the right environment variables (RANK, WORLD_SIZE, MASTER_ADDR for PyTorch's torch.distributed) pre-populated, so your training script's own distributed-init code just reads standard environment variables rather than needing Kubernetes-aware logic embedded in it:

~~~yaml
apiVersion: kubeflow.org/v1
kind: PyTorchJob
metadata:
  name: distributed-training
spec:
  pytorchReplicaSpecs:
    Master:
      replicas: 1
      template:
        spec:
          containers:
            - name: pytorch
              image: myregistry/distributed-trainer:1.0
    Worker:
      replicas: 3
      template:
        spec:
          containers:
            - name: pytorch
              image: myregistry/distributed-trainer:1.0
              resources:
                limits: { nvidia.com/gpu: 1 }
~~~

### Multi-tenancy and namespace-per-profile isolation

Kubeflow's notebook and pipeline-run isolation model layers "Profiles" (a Kubeflow-specific CRD) on top of Kubernetes namespaces plus Istio-based authorization, so that each user or team gets a namespace with pre-wired RBAC, resource quotas, and network policy defaults. This reuses the same namespace-and-RBAC multi-tenancy pattern covered generically in the **Kubernetes** and **RBAC** skills, with Kubeflow's controller automating the per-user provisioning rather than an admin hand-crafting each namespace.

### Decision table: when advanced Kubeflow features earn their complexity

| Feature | Worth adopting when | Skip it when |
|---|---|---|
| Katib | You genuinely need automated, tracked, parallel hyperparameter search across many trials | You are manually trying 3–4 configurations by hand — just script it directly |
| Distributed Training Operator | A single node/GPU cannot hold the model or finish training in acceptable time | The model trains in minutes on one GPU — see Anti-Patterns |
| Pipeline caching | Iterating repeatedly on a multi-step pipeline where earlier steps are expensive and stable | A one-off pipeline you will run exactly once |
| KServe canary rollout | You are shipping model updates to production traffic regularly and need safe rollback | You have one model, updated rarely, with a maintenance window available |
`,

  "internal-working": `
Kubeflow's components all follow the same underlying pattern Kubernetes itself uses: a Custom Resource Definition describes a new object type, and a controller runs a reconciliation loop that watches for objects of that type and drives the cluster's actual state toward what the object declares. Concretely, for Kubeflow Pipelines:

1. You write pipeline.py using the KFP SDK and call compiler.Compiler().compile(...), which executes your Python function in "tracing mode" (it does not actually run your training code — it records which components you called and how their inputs/outputs connect) and emits a pipeline IR YAML file.
2. You submit that IR (via the KFP client, or by uploading it through the Pipelines UI) to the Kubeflow Pipelines backend, which persists it and creates a PipelineRun object.
3. The Pipelines backend (historically built on **Argo Workflows** as its execution engine) translates the IR into an actual Argo Workflow object, or in newer KFP v2 backends, drives execution through its own orchestration API server that ultimately still schedules Kubernetes Pods per step.
4. Argo's own controller (or the KFP v2 driver) watches that Workflow object and, following the DAG's dependency edges, creates one Kubernetes Pod per ready-to-run step, mounting the correct input artifacts (fetched from wherever the previous step wrote them — typically object storage like S3/GCS/MinIO) and passing typed parameters as command-line arguments or environment variables.
5. Each step's Pod runs to completion, writes its declared output artifacts back to the shared artifact store, and reports its status; once a step's pod succeeds, the controller re-evaluates the DAG and schedules any newly-ready downstream steps.
6. The Pipelines UI polls the same backend API to render the DAG, per-step logs, and artifact lineage — it is a pure read-only view over the same objects the controller is reconciling, not a separate source of truth.

~~~mermaid
sequenceDiagram
    participant Dev as ML Engineer
    participant SDK as KFP SDK (compile)
    participant Backend as Pipelines Backend
    participant Ctrl as Workflow Controller
    participant Pod as Step Pod
    participant Store as Artifact Store

    Dev->>SDK: write pipeline.py, compile()
    SDK-->>Dev: pipeline IR (YAML)
    Dev->>Backend: submit run (IR + params)
    Backend->>Ctrl: create Workflow object
    loop for each DAG-ready step
        Ctrl->>Pod: schedule step pod
        Pod->>Store: fetch input artifacts
        Pod->>Pod: run component code
        Pod->>Store: write output artifacts
        Pod-->>Ctrl: report success/failure
    end
    Ctrl-->>Backend: update run status
    Backend-->>Dev: DAG + logs + artifacts (UI)
~~~

Katib and KServe follow the identical shape with different objects: Katib's controller watches Experiment objects, creates Trial (Job) pods per hyperparameter combination its search algorithm proposes, and reconciles toward the objective metric; KServe's controller watches InferenceService objects and reconciles them into the underlying Knative Service, Deployment, and autoscaling configuration. In every case, the pattern is "declare the desired ML-shaped object, let a controller reconcile it into ordinary Kubernetes primitives" — exactly the same trick Kubernetes itself uses for Deployments reconciling into Pods.
`,

  architecture: `
A production Kubeflow deployment layers roughly like this, from the bottom up:

~~~
Kubernetes cluster (nodes, including GPU node pools)
  |
  +-- Istio (or another service mesh) — ingress, mTLS, authorization for Kubeflow's multi-tenant UI
  +-- Kubeflow core
  |     +-- Central Dashboard (single UI entry point across components)
  |     +-- Profile Controller (per-user/team namespace provisioning)
  |     +-- Notebook Controller (JupyterLab/RStudio pods per user)
  +-- Kubeflow Pipelines
  |     +-- Pipelines API server + persistence (metadata DB)
  |     +-- Workflow engine (Argo Workflows, or KFP v2's own driver)
  |     +-- Artifact store (object storage: S3 / GCS / MinIO)
  +-- Katib
  |     +-- Katib controller (Experiment/Trial CRDs)
  |     +-- Suggestion services (the pluggable search algorithms: random, Bayesian, etc.)
  +-- Training Operator
  |     +-- PyTorchJob / TFJob controllers
  +-- KServe
        +-- InferenceService controller
        +-- Knative Serving (autoscaling, scale-to-zero, revisions/canary)
~~~

The architectural decision worth internalizing: nearly every box in that stack is itself a separate Kubernetes controller with its own deployment, its own upgrade cadence, and its own failure modes — which is precisely why "operating Kubeflow" is a materially larger commitment than "operating a Kubernetes cluster." A team adopting the full stack is implicitly signing up to keep Istio, Argo, Katib's suggestion services, and KServe/Knative all healthy and mutually compatible across upgrades, not just the Kubernetes control plane underneath them. Applications should be structured so that pipeline components are thin wrappers around plain Python/ML code that has no Kubeflow-specific imports at its core — keeping the actual modeling logic testable and runnable outside the cluster, with only a thin @dsl.component decorator layer coupling it to Kubeflow, mirrors the general principle (also true for Airflow operators) of keeping business logic independent of the orchestrator's SDK.
`,

  "data-flow": `
Tracing one pipeline run end to end, using the train-then-evaluate example from Intermediate Concepts:

~~~mermaid
sequenceDiagram
    participant User
    participant KFP_UI as Pipelines UI/Client
    participant API as Pipelines API Server
    participant Argo as Workflow Controller
    participant TrainPod as train Pod
    participant EvalPod as evaluate Pod
    participant Storage as Object Storage (artifacts)

    User->>KFP_UI: submit run (pipeline IR + params)
    KFP_UI->>API: create PipelineRun
    API->>Argo: create Workflow object
    Argo->>TrainPod: schedule (no unresolved inputs)
    TrainPod->>Storage: write model_out artifact
    TrainPod-->>Argo: step succeeded
    Argo->>EvalPod: schedule (model_in now resolvable)
    EvalPod->>Storage: read model_out artifact
    EvalPod->>EvalPod: compute accuracy
    EvalPod->>Storage: write metrics_out artifact
    EvalPod-->>Argo: step succeeded
    Argo-->>API: Workflow status = Succeeded
    API-->>KFP_UI: run status + artifact links
    KFP_UI-->>User: DAG view, logs, accuracy metric
~~~

The step worth calling out for anyone debugging a stuck pipeline: the evaluate Pod is not scheduled until the controller sees that train's declared output artifact exists and evaluate's declared input can be resolved from it — a pipeline that appears "stuck" on a downstream step is almost always because the upstream step's Pod either hasn't finished or failed to write its expected output artifact, which is the first thing to check (see Debugging).
`,

  "production-usage": `
Real teams running Kubeflow in production typically make these choices:

- **Namespace-per-team or namespace-per-environment**, provisioned via Kubeflow's Profile CRD, giving each team its own quota, RBAC bindings, and notebook/pipeline isolation without a platform engineer hand-creating each one.
- **A dedicated GPU node pool**, tainted so that only GPU-requesting pods (training jobs, GPU-backed inference) are scheduled onto it, keeping expensive GPU capacity from being consumed by unrelated CPU-only workloads — the same taints/tolerations pattern covered in the **Kubernetes** skill.
- **Object storage (S3/GCS/MinIO) as the artifact backend** for Pipelines, rather than the default in-cluster storage, so artifacts survive cluster upgrades/rebuilds and can be inspected outside the cluster.
- **A separate experiment-tracking system (often MLflow)** layered alongside Kubeflow's built-in metadata tracking, since Kubeflow's own UI is oriented around pipeline-run lineage rather than rich model-comparison and registry workflows — see the **MLflow** skill.
- **GitOps-managed pipeline definitions**: compiled pipeline IR files checked into version control and deployed via CI/CD, so a pipeline's exact version is reproducible and reviewable, rather than uploaded ad hoc through the UI.
- **Resource requests/limits set explicitly on every training and inference pod**, sized from actual profiling rather than guesswork, exactly as recommended generically for any Kubernetes workload — Kubeflow does not change this discipline, it just adds more places (training pods, Katib trial pods, inference pods) where it needs to be applied.
- **KServe's canary/traffic-splitting** used for any model update that serves live production traffic, routing a small percentage to the new model version before a full cutover — the ML-specific analog of a standard blue-green or canary deployment.

Many teams that evaluate "run the full Kubeflow distribution" end up instead adopting a subset — commonly just KServe for serving, or just Kubeflow Pipelines for training orchestration — precisely because installing and maintaining the entire stack (Istio, Argo, Katib, Training Operator, Notebooks, KServe, all mutually version-compatible) is a heavier lift than most teams' ML workflows justify; this partial-adoption pattern is common enough that it is worth planning for from day one rather than treating "full Kubeflow or nothing" as the only choice.
`,

  "industry-examples": `
- **Google** — Kubeflow originated at Google and its architecture directly reflects lessons from Google's internal ML infrastructure; Google Cloud's Vertex AI Pipelines is built on the same underlying KFP DAG execution model (and can run pipelines compiled with the open-source KFP SDK), making Kubeflow's authoring model directly portable to a managed Google Cloud service.
- **Spotify** — has publicly discussed using Kubeflow Pipelines as part of its internal ML platform for orchestrating training workflows across many product teams, valuing the standardized, containerized component model for reproducibility across teams with different tech stacks.
- **CERN** — has documented using Kubeflow for large-scale distributed training and hyperparameter tuning workloads in physics data analysis, an environment with substantial existing Kubernetes and HPC infrastructure investment where Kubeflow's Kubernetes-native model fit naturally.
- **Bloomberg** — has presented at KubeCon/Kubeflow community events on running Kubeflow internally for financial ML workflows, citing the multi-tenancy (namespace/Profile) model as important for isolating different teams' training and serving workloads on shared infrastructure.
- **Red Hat / OpenShift AI (formerly OpenShift Data Science)** — packages Kubeflow's components (Pipelines, notebooks, KServe-based serving) as the ML-platform layer of OpenShift, illustrating how Kubeflow's individual components get re-bundled into vendor ML platforms rather than always being consumed as the raw open-source project directly.

Hedge: exact current internal architecture at any given company shifts over time and specifics are not always publicly detailed; treat the above as documented directional evidence of adoption patterns (Kubeflow Pipelines for orchestration, KServe for serving, at organizations with substantial existing Kubernetes investment) rather than a guarantee of a company's present-day stack.
`,

  "best-practices": `
1. **Start with the smallest useful subset, not the full distribution.** Install just KServe, or just Kubeflow Pipelines, before committing to Istio + Argo + Katib + Training Operator + Notebooks all at once — you can add components later, but ripping out an over-provisioned stack is far more disruptive.
2. **Keep component code framework-agnostic and Kubeflow-agnostic at its core.** A pipeline component's @dsl.component-decorated function should be a thin wrapper calling into plain Python/ML code with no Kubeflow imports, so that code is unit-testable without a cluster and portable if you ever migrate orchestrators.
3. **Pin and version every component's base image explicitly.** An unpinned base_image="python:3.11-slim" silently drifts as the upstream image is rebuilt; pin to a digest or a dated tag for anything you expect to reproduce months later.
4. **Version pipeline definitions themselves, not just the code inside components.** A compiled pipeline IR file should be checked into version control alongside the Python source that produced it — see Common Mistakes for what goes wrong when this is skipped.
5. **Set resource requests and limits on every pipeline step, Katib trial, and inference pod explicitly**, sized from real profiling — the same non-negotiable Kubernetes hygiene from the **Kubernetes** skill applies at every layer Kubeflow adds.
6. **Use dedicated, tainted GPU node pools** so GPU capacity is reserved for workloads that actually request it, and combine with the Cluster Autoscaler so idle GPU nodes scale down when no GPU-requesting pods are pending.
7. **Externalize the artifact store to durable object storage** (S3/GCS/MinIO) rather than relying on in-cluster ephemeral storage, so a cluster rebuild or upgrade does not silently lose historical pipeline artifacts.
8. **Pair Kubeflow's pipeline lineage with a dedicated experiment tracker** (commonly MLflow) for rich metric comparison and a model registry with stage transitions — Kubeflow's own metadata UI is not a substitute for this.
9. **Use Katib for genuine, tracked hyperparameter search — not as a substitute for basic profiling.** If you have not yet established a working baseline model, tuning hyperparameters via Katib is premature; get one config working end to end first.
10. **Gate model rollouts through KServe's canary/traffic-splitting for anything serving live traffic**, rather than replacing a production InferenceService's model version in place.
11. **Treat Kubeflow upgrades as a project, not a routine dependency bump.** Because components (Istio, Argo, Katib, KServe/Knative) must stay mutually compatible, budget real testing time for any Kubeflow version upgrade rather than treating it like a routine pip install.
12. **Decide explicitly, in writing, whether self-hosting Kubeflow is worth it versus a managed alternative** before building institutional dependence on it — see Comparisons for the concrete tradeoffs to weigh.
`,

  "anti-patterns": `
**Using Kubeflow for a job that never needed Kubernetes at all.**

~~~python
# WRONG: wrapping a 30-second, single-CPU training script in a full
# Kubeflow Pipeline with its own compiled DAG, artifact store round-trips,
# and a dedicated namespace — for a job that runs in seconds on a laptop.
@dsl.component(base_image="python:3.11-slim")
def train_tiny_model(model_out: Output[Model]):
    from sklearn.linear_model import LogisticRegression
    from sklearn.datasets import load_iris
    import joblib
    X, y = load_iris(return_X_y=True)
    clf = LogisticRegression().fit(X, y)
    joblib.dump(clf, model_out.path)

# RIGHT: this is a script, not a pipeline. Run it directly, check the
# artifact into your model registry / MLflow, and only reach for a
# Kubeflow Pipeline once there is a real multi-step DAG, real scale,
# or a real need for reproducible, versioned execution on a cluster.
~~~

**Treating pipeline IR files as disposable instead of versioned artifacts.**

~~~python
# WRONG: compile and upload through the UI ad hoc, never committed anywhere;
# six months later nobody can say which pipeline version produced a given
# production model, because the compiled DAG that ran was never saved.
compiler.Compiler().compile(pipeline_func=train_pipeline, package_path="/tmp/p.yaml")
# uploaded once through the UI, /tmp file discarded

# RIGHT: compile to a path under version control, tag it, and have CI/CD
# submit runs from the checked-in artifact so every run is traceable to
# an exact commit.
compiler.Compiler().compile(
    pipeline_func=train_pipeline,
    package_path="pipelines/compiled/train_pipeline_v3.yaml",
)
# git add/commit pipelines/compiled/train_pipeline_v3.yaml
~~~

**Ignoring the operational cost until it is already a crisis.**

~~~
# WRONG mental model: "Kubeflow is just some YAML on our existing cluster,
# it doesn't really add ongoing work."
#
# RIGHT mental model: every component (Istio, Argo, Katib, KServe/Knative)
# is a separate moving part with its own upgrade cadence and failure modes.
# Staff and budget for it like the platform commitment it actually is,
# or deliberately choose a managed alternative instead (see Comparisons).
~~~

**Using Katib to paper over a broken training pipeline.**

~~~
# WRONG: training accuracy is inconsistent run-to-run even with identical
# hyperparameters (a data leak, a bad train/test split, non-determinism
# in the pipeline) — and the team responds by launching a large Katib
# search hoping some combination "gets lucky."
#
# RIGHT: fix the underlying instability first. Hyperparameter tuning
# assumes the training process itself is a stable, reproducible function
# of its inputs; tuning on top of a broken pipeline just burns compute
# searching noise.
~~~
`,

  performance: `
Measure before optimizing, at each layer Kubeflow adds:

- **kubectl top pods / nodes** and a metrics pipeline (Prometheus + Grafana, or the **Kubernetes** skill's monitoring stack) for baseline CPU/memory/GPU utilization across training, Katib trial, and inference pods.
- **The KFP UI's per-step timing breakdown** to see which pipeline step dominates wall-clock time — often it is not the training step itself but artifact upload/download to object storage, especially for large model checkpoints.
- **nvidia-smi inside a training pod** (or a GPU-metrics exporter feeding Prometheus) to check actual GPU utilization — a training job requesting a GPU but leaving it mostly idle (a data-loading bottleneck, small batch size) is extremely common and worth catching before assuming you need more/bigger GPUs.

An ordered optimization hierarchy once a real bottleneck is identified:

1. **Fix the data-loading path before touching cluster resources.** A GPU sitting at 20% utilization because the data loader can't keep up is a code problem (parallel data loading, prefetching, faster storage) not a "give it a bigger GPU" problem.
2. **Enable pipeline step caching** (see Advanced Concepts) so iterative development re-runs only the changed steps, not the whole DAG from scratch — this is often the single biggest wall-clock win during active development, independent of any single step's raw performance.
3. **Right-size resource requests/limits from actual profiling**, not guesswork — an over-requested pod wastes cluster capacity and can prevent other work from being scheduled; an under-requested one risks throttling or OOMKill.
4. **Batch artifact transfers where possible** rather than many small reads/writes to object storage per step, since object-storage round-trip latency (not raw compute) frequently dominates small-step wall-clock time.
5. **Only then consider distributed training** (Training Operator, multiple GPU workers) once single-node/single-GPU performance is already well understood and clearly insufficient — distributing a poorly-optimized single-node job usually just distributes the inefficiency.
6. **For inference, tune KServe/Knative autoscaling thresholds and min-replica counts** based on observed request latency and cold-start cost, rather than accepting scale-to-zero defaults for latency-sensitive endpoints where a cold start is unacceptable.

Concrete numbers are workload- and cluster-dependent enough that this page will not invent throughput or latency figures; treat the escalation order above, not any specific number, as the durable lesson.
`,

  scalability: `
Kubeflow's scaling story is really Kubernetes' scaling story with ML-shaped workloads layered on:

- **Vertical**: request bigger nodes/GPUs for individual training pods when a single step is the bottleneck and cannot be parallelized further.
- **Horizontal — training**: the Training Operator's replica counts (PyTorchJob Worker replicas, TFJob Worker replicas) let a single training job scale across multiple pods/nodes for data-parallel or model-parallel training, at the cost of real distributed-training complexity (gradient synchronization overhead, network bandwidth between workers) that does not disappear just because Kubernetes is scheduling the pods.
- **Horizontal — inference**: KServe/Knative scales inference pod replica count with request volume, including down to zero when idle, which is the most directly "free" scaling win in the stack since it requires no changes to the model itself.
- **Horizontal — pipeline throughput**: multiple pipeline runs (different experiments, different teams) execute as independent Workflow objects and can run concurrently, bounded by overall cluster capacity and per-namespace ResourceQuotas rather than any Kubeflow-specific limit.

| Bottleneck | Typical cause | Mitigation |
|---|---|---|
| GPU node pool exhausted | More concurrent training/Katib trials than GPU capacity | Cluster Autoscaler with a GPU node pool; Katib parallelism limits; queueing/priority classes |
| Pipelines API server slow to list runs | Very large number of historical pipeline runs/artifacts accumulated | Archive/prune old runs; paginate; move cold artifacts out of hot storage |
| Inference latency spikes under bursty traffic | Scale-to-zero cold start, or min-replicas set too low | Set a nonzero min-replica floor for latency-sensitive InferenceServices; pre-warm |
| Distributed training slower than expected | Network bandwidth between worker pods insufficient for gradient sync | Co-locate workers via pod affinity/topology-aware scheduling; check node network tier |

The general lesson: Kubeflow does not remove the fundamental distributed-systems tradeoffs of scaling training or inference — it gives you a declarative, Kubernetes-native vocabulary for expressing the scaling knobs, but you still need to understand what each knob actually costs.
`,

  security: `
Kubeflow's attack surface is layered on top of Kubernetes' own (see the **Kubernetes** skill's Security section for the base layer) plus several Kubeflow-specific concerns:

- **Multi-tenant notebook and pipeline isolation.** Kubeflow's Profile/namespace model, combined with Istio authorization policies, is what prevents one team's notebook pod from reaching another team's namespace or InferenceService. A misconfigured or skipped Istio AuthorizationPolicy can silently flatten this isolation back to Kubernetes' default (fully open pod-to-pod networking within a cluster) — always verify NetworkPolicies and Istio policies are actually enforced, not just declared.
- **Artifact-store credentials.** Pipeline steps and InferenceServices typically need credentials to read/write object storage (S3/GCS/MinIO); these should be scoped per-namespace via Kubernetes Secrets and least-privilege IAM roles, not a single cluster-wide credential shared by every pipeline — see the **RBAC** skill for the underlying least-privilege principle.
- **Notebook pods as a privileged foothold.** A Jupyter notebook pod is, by design, an interactive shell into the cluster's network from inside a user's namespace; if that namespace's RBAC is too permissive, a compromised or malicious notebook session becomes a lateral-movement path into other workloads. Notebook pods should run with the minimum RBAC needed and never with cluster-admin-equivalent service accounts.
- **Untrusted pipeline component images.** A pipeline component is just a container image; pulling from an unverified public registry (rather than a scanned, organization-controlled registry) reintroduces the same supply-chain risk covered generically in the **Docker** skill's security guidance — scan images and pin digests.
- **Model-serving endpoints as a new external surface.** A KServe InferenceService is an HTTP endpoint that, once exposed via Ingress, is reachable like any other web service — apply the same authentication/authorization, rate-limiting, and input-validation discipline you would to any production API, since a prediction endpoint accepting arbitrary input is also a potential resource-exhaustion or adversarial-input vector.
- **Secrets in Katib trial specs.** Trial pod templates are ordinary Kubernetes Job specs — any credentials they need should come from mounted Secrets, never hardcoded into the Experiment YAML, exactly as for any other Kubernetes workload.
`,

  testing: `
Testing a Kubeflow-based ML system happens at several distinct layers:

- **Unit-test component logic directly, bypassing Kubeflow entirely.** Because a well-written @dsl.component function is a thin wrapper around plain Python, call the underlying function directly in a normal pytest test — no cluster, no compilation, no KFP client needed.

~~~python
# test_train.py — testing the logic inside a component without Kubeflow
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier

def train_model(n_estimators: int = 100):
    """The plain-Python core logic your @dsl.component wraps."""
    X, y = load_iris(return_X_y=True)
    clf = RandomForestClassifier(n_estimators=n_estimators, random_state=42)
    clf.fit(X, y)
    return clf

def test_train_model_produces_fitted_classifier():
    clf = train_model(n_estimators=10)
    assert hasattr(clf, "estimators_")   # sklearn's fitted-state marker
    assert len(clf.estimators_) == 10

def test_train_model_handles_small_forest():
    # Edge case: a single-tree "forest" should still fit without error
    clf = train_model(n_estimators=1)
    assert len(clf.estimators_) == 1
~~~

- **Compile-time validation of the pipeline DAG.** Running compiler.Compiler().compile(...) in CI catches type-mismatch errors between component inputs/outputs before anything is ever submitted to a cluster — treat a successful compile as a cheap, fast pre-flight check, run on every pull request that touches pipeline code.
- **Integration-test a full pipeline run against a lightweight local or CI Kubeflow instance** (or a minimal KFP-compatible local runner where available) for at least the critical-path pipeline, verifying that expected output artifacts are produced and expected metrics clear a sanity threshold.
- **Test Katib Experiment YAML for schema validity** (kubectl apply --dry-run=server against a test cluster) before submitting a real search, since a malformed trialTemplate can burn significant compute launching trials that all fail identically.
- **Test KServe InferenceService manifests** by deploying to a staging namespace and sending a real prediction request, verifying both the response shape and that scale-to-zero/scale-up behavior matches expectations, before promoting to production.

Senior testing doctrine: the closer you can push a test to "plain Python function, no cluster required," the faster and more reliable your feedback loop — reserve genuine cluster-based integration tests for the handful of things that can only be verified with a real cluster (scheduling, autoscaling, actual artifact-store I/O), and keep the bulk of your test suite Kubeflow-agnostic.
`,

  debugging: `
Escalation path for a stuck or failing Kubeflow pipeline, mirroring the general Kubernetes debugging discipline with Kubeflow-specific additions:

1. **Check the Pipelines UI's DAG view first.** A grayed/red node immediately tells you which step failed or is stuck, without needing kubectl at all — this is the fastest first signal.

~~~bash
# 2. Find the underlying pod for the failing step
kubectl get pods -n <profile-namespace> | grep <run-id-or-step-name>

# 3. Describe it — check Events for scheduling failures
#    (Pending due to resource requests, GPU unavailability, etc.)
kubectl describe pod <step-pod-name> -n <profile-namespace>

# 4. Read the logs — the actual Python traceback lives here
kubectl logs <step-pod-name> -n <profile-namespace>

# 5. If it crashed before logs were flushed, check the previous instance
kubectl logs <step-pod-name> -n <profile-namespace> --previous

# 6. For an artifact that never appeared, check the artifact store directly
#    rather than assuming the step "must have" written it
#    (e.g. list the expected object storage path/bucket)
~~~

7. **For a Katib Experiment that never converges**, inspect individual Trial pods the same way (kubectl describe/logs), and separately check the Experiment's status.conditions for the controller's own view of progress — a stuck Experiment is often actually several stuck Trial pods, which is a plain Kubernetes scheduling problem wearing a Katib label.
8. **For a KServe InferenceService stuck NotReady**, check both the InferenceService's own status and the underlying Knative Revision/Deployment it created (kubectl describe inferenceservice, then kubectl describe revision), since the failure is frequently one layer down in Knative rather than in KServe's own controller.
9. **When in doubt about whether the problem is "Kubeflow" or "Kubernetes," assume Kubernetes first.** Nearly every Kubeflow failure mode (Pending pods, ImagePullBackOff, OOMKilled, network policy blocking traffic) is a plain Kubernetes problem that happens to be wearing a Kubeflow label — the **Kubernetes** skill's Debugging section's escalation path (describe → logs → exec → events) applies unchanged underneath every Kubeflow component.
`,

  monitoring: `
What to measure, and how to instrument it, across the layers Kubeflow adds:

- **Pipeline run success/failure rate and duration**, scraped from the Pipelines API/metadata store or emitted as custom metrics from a CI/CD wrapper around scheduled pipeline submissions — trending duration over time surfaces slow regressions before they become outright failures.
- **Per-step resource utilization** (CPU/memory/GPU) via the standard Kubernetes metrics pipeline (Prometheus + node-exporter + a GPU metrics exporter like DCGM), which is exactly the monitoring stack described in the **Kubernetes** skill — Kubeflow adds no separate resource-monitoring mechanism of its own.
- **Katib trial success rate and objective-metric trend over the search**, visible in the Katib UI, with a Prometheus alert worth setting if a large fraction of trials are failing outright (a sign of a broken trial template, not real hyperparameter exploration).
- **KServe endpoint latency, error rate, and current replica count**, instrumented the same way as any HTTP service (see the **Monitoring** skill's general request-latency/error-rate/saturation approach), with particular attention to cold-start latency spikes around scale-to-zero transitions.

~~~python
# A minimal custom metric emitted from inside a pipeline component,
# scraped by Prometheus via a pushgateway (common pattern for short-lived
# batch/pipeline-step pods that don't stay up to be scraped directly).
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

def report_training_duration(seconds: float, pushgateway_url: str = "pushgateway:9091"):
    registry = CollectorRegistry()
    g = Gauge("kfp_step_duration_seconds", "Duration of a KFP training step", registry=registry)
    g.set(seconds)
    try:
        push_to_gateway(pushgateway_url, job="train_step", registry=registry)
    except Exception as exc:
        # Never let a metrics-push failure fail the actual training step
        print(f"warning: failed to push metrics: {exc}")
~~~

- **Model-quality drift over time**, ideally tracked in a dedicated experiment-tracking/monitoring tool (MLflow, or a model-monitoring product) rather than Kubeflow's own metadata store, since Kubeflow's built-in tracking is oriented around lineage rather than ongoing production quality monitoring — see the **MLOps** skill for the broader model-monitoring picture this feeds into.
`,

  deployment: `
A representative production Dockerfile for a Kubeflow Pipelines component's base image, with per-line justification:

~~~dockerfile
# Pin an exact base image digest, not a floating tag, so the component's
# execution environment is reproducible months later (see Best Practices).
FROM python:3.11-slim@sha256:examplepindigestforillustrationonly

# Avoid running as root inside the container — a compromised or buggy
# pipeline step should not have root inside its own container by default.
RUN useradd --create-home --uid 1000 kfpuser

WORKDIR /app

# Copy only the dependency manifest first so Docker's layer cache is
# reused across builds where only application code changed, not deps.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the actual component code.
COPY train.py .

USER kfpuser

# No CMD/ENTRYPOINT needed for many KFP components — the compiled
# pipeline IR supplies the exact command to run per step. If this image
# is also used standalone, set an explicit entrypoint here instead.
~~~

For the KServe side, deployment is declarative rather than a Dockerfile at all — you deploy a pre-existing trained model artifact by referencing its storage location, with the serving container itself typically supplied by KServe's built-in model-server images (sklearn, xgboost, pytorch) rather than one you build by hand, unless you need a custom predictor:

~~~yaml
# inference-service-prod.yaml — production-leaning defaults
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: rf-classifier-prod
  annotations:
    autoscaling.knative.dev/minScale: "1"   # avoid cold starts for a latency-sensitive endpoint
spec:
  predictor:
    sklearn:
      storageUri: "s3://my-bucket/models/rf-classifier/3"
      resources:
        requests: { cpu: "500m", memory: "512Mi" }
        limits: { cpu: "1", memory: "1Gi" }
    minReplicas: 1
    maxReplicas: 5
~~~

The minScale annotation and minReplicas here are the deliberate override of KServe's scale-to-zero default — appropriate for an endpoint where cold-start latency is unacceptable, at the direct cost of paying for at least one always-on replica.
`,

  "production-checklist": `
- [ ] Decided explicitly (and documented the reasoning) whether to self-host Kubeflow or use a managed alternative, rather than defaulting to self-hosting by inertia.
- [ ] Installed only the Kubeflow components actually needed, not the full distribution by default.
- [ ] Every pipeline component's base image is pinned to a digest or dated tag, not a floating tag.
- [ ] Compiled pipeline IR files are checked into version control and deployed via CI/CD, not uploaded ad hoc through the UI.
- [ ] Resource requests and limits are set explicitly on every pipeline step, Katib trial pod, and InferenceService predictor, sized from real profiling.
- [ ] GPU workloads run on a dedicated, tainted node pool with the Cluster Autoscaler configured for it.
- [ ] Artifact storage points at durable external object storage (S3/GCS/MinIO), not in-cluster ephemeral storage.
- [ ] A dedicated experiment-tracking tool (e.g. MLflow) is in place for model comparison and registry, alongside Kubeflow's own metadata/lineage tracking.
- [ ] Namespace/Profile-based multi-tenancy is configured with least-privilege RBAC, and Istio authorization policies are verified as actually enforced, not just declared.
- [ ] Notebook pods run with minimal RBAC — never a cluster-admin-equivalent service account.
- [ ] KServe endpoints serving live traffic use canary/traffic-splitting for model updates, not in-place replacement.
- [ ] Latency-sensitive InferenceServices have an explicit minReplicas/minScale floor if scale-to-zero cold starts are unacceptable.
- [ ] Monitoring is wired up for pipeline run success/failure rate, per-step resource utilization, Katib trial success rate, and inference latency/error rate.
- [ ] A tested upgrade process exists for the whole component stack (Istio/Argo/Katib/KServe mutual compatibility), not just for the base Kubernetes cluster.
- [ ] The team has staffing/on-call coverage that reflects Kubeflow's actual operational surface, not just the underlying Kubernetes cluster's.
- [ ] There is a documented escalation/debugging runbook covering both Kubeflow-specific failure modes and the underlying Kubernetes ones.
`,

  "common-mistakes": `
1. **Reaching for Kubeflow when a single-node script would do.** The most common mistake by far: wrapping a training job that runs in minutes on one machine in a full compiled pipeline, artifact store, and dedicated namespace. Why it happens: teams adopt Kubeflow organization-wide and then default to using it for everything, rather than reserving it for workloads that actually need multi-step orchestration, distributed training, or cluster-scale resource management.
2. **Underestimating operational complexity until an upgrade breaks something.** Teams often treat the initial Kubeflow install as "done" and stop budgeting ongoing platform-engineering time for it, only to discover during a version upgrade that Istio, Argo, and KServe/Knative compatibility constraints turn a routine bump into a multi-week project. Why: the initial install can genuinely go smoothly, which creates false confidence that ongoing maintenance will be equally light.
3. **Not versioning pipeline components or compiled IR files.** A pipeline that "worked in March" becomes impossible to reproduce in June because the component code, base images, and compiled DAG were never pinned or checked into version control together. Why: it is easy to iterate quickly by compiling and uploading through the UI directly, and that convenience quietly erodes reproducibility.
4. **Skipping resource requests/limits on pipeline steps specifically**, even on teams that are otherwise disciplined about setting them on regular Deployments — because pipeline steps feel "temporary" or "just a batch job." Why it matters: a leaking or runaway training step without a memory limit can still take down a shared node exactly like any other unbounded pod.
5. **Letting Katib searches run unattended without a cost/time budget.** A hyperparameter search with a large search space and no trial/parallelism cap can consume enormous compute before anyone notices. Why: it is easy to define feasibleSpace ranges generously "just in case" without setting maxTrialCount or parallelTrialCount to sane bounds.
6. **Treating Kubeflow's built-in metadata tracking as a full experiment-tracking replacement.** Teams sometimes skip a dedicated tool like MLflow, assuming Kubeflow's lineage view is equivalent, then find they lack rich model comparison, a proper model registry with stage transitions, or framework autologging when they need it.
7. **Deploying model updates by editing an InferenceService in place rather than using canary rollout**, which removes the safety net a gradual traffic shift provides for catching a regression before it affects all users.
8. **Assuming a Kubeflow-specific problem is Kubeflow's fault before checking plain Kubernetes causes.** A Pending pipeline step is very often an ordinary Kubernetes scheduling problem (insufficient GPU capacity, a taint without a matching toleration) rather than anything Kubeflow-specific — see Debugging.
9. **Building tight coupling between component code and the KFP SDK**, embedding kfp imports and DSL calls deep inside actual modeling logic rather than keeping them as a thin wrapper layer, which makes the modeling code harder to test and harder to migrate if the orchestrator ever changes.
10. **Choosing self-hosted Kubeflow for a small team without first seriously comparing a managed alternative**, then discovering months later that the operational burden dwarfs what a managed Vertex AI Pipelines or SageMaker Pipelines setup would have cost, at a point where migrating away is expensive.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|---|---|---|
| Pipeline step stuck Pending | Insufficient GPU/CPU capacity, or a taint on GPU nodes without a matching toleration in the step's pod spec | kubectl describe the step pod, check Events; add tolerations or scale the node pool |
| ImagePullBackOff on a component pod | Wrong image tag/digest, or missing registry pull credentials in the namespace | Verify image reference and that an imagePullSecret is attached to the namespace's service account |
| Downstream step never starts | Upstream step failed to write its declared output artifact, or failed silently | Check upstream step's logs and confirm the artifact actually exists in object storage |
| Katib Experiment stuck with all Trials failing | Broken trialTemplate — wrong container image, or a command-line argument substitution error | kubectl describe/logs on an individual Trial pod; validate the trialTemplate YAML |
| KServe InferenceService stuck NotReady | Underlying Knative Revision failed, often due to a bad storageUri or insufficient predictor resources | kubectl describe inferenceservice, then kubectl describe revision for the underlying cause |
| Component works locally but fails only when compiled/run | A dependency available on your laptop but not installed in the component's base_image/packages_to_install | Add the missing dependency explicitly to the component's declared packages |
| Pipeline caching returns a stale/wrong result | The component silently depends on external mutable state not captured in its declared inputs | Make all real inputs explicit component parameters; disable caching for genuinely non-deterministic steps |
| Notebook pod cannot reach another namespace's service | Multi-tenant NetworkPolicy/Istio authorization correctly denying cross-namespace traffic | This is usually working as intended — grant access explicitly via policy rather than loosening it broadly |
`,

  faqs: `
**Is Kubeflow the same as Kubernetes?**
No. Kubeflow runs on Kubernetes and extends it with ML-specific Custom Resources (Pipelines, Katib, KServe, Training Operator). You need a working Kubernetes cluster underneath any Kubeflow installation; Kubeflow does not replace or hide Kubernetes.

**Do I need the whole Kubeflow distribution, or can I use just one piece?**
You can, and many teams do, adopt a single component — KServe alone for serving is especially common — without installing Pipelines, Katib, Notebooks, or the full Istio-based multi-tenancy stack. This is often the right starting point.

**Should I use Kubeflow Pipelines or Airflow for my ML workflow?**
It depends on the shape of the workflow and what else it needs to interoperate with — see Comparisons for the detailed breakdown, but the short version: KFP if the workflow is fundamentally an ML training/eval/deploy DAG that benefits from typed artifacts and Kubernetes-native execution; Airflow if it's one part of a broader, heterogeneous set of scheduled jobs (ETL, reporting, cross-system orchestration) where ML is just one node among many.

**Is Kubeflow Pipelines SDK v1 deprecated?**
As of this writing, v2 is the recommended default and where new development focuses, but exact deprecation timelines for v1 shift release to release — check the current official Kubeflow Pipelines documentation for the authoritative status before starting new work in v1.

**Can Kubeflow run without GPUs?**
Yes. Plenty of Kubeflow pipelines run entirely on CPU (classical ML, lightweight models); GPUs are only relevant when a training or inference step specifically requests them in its resource spec.

**What's the difference between KFServing and KServe?**
KServe is the current name; KFServing was its predecessor name before the project was renamed and spun out from the core Kubeflow distribution as a more independently governed project. Documentation and tutorials referencing "KFServing" are describing the same lineage as today's KServe, though exact API details have evolved since the rename.

**Does Kubeflow lock me into Google Cloud?**
No. Kubeflow itself is cloud-agnostic and runs on any conformant Kubernetes cluster (self-managed, EKS, AKS, GKE, or on-premises). Google Cloud's Vertex AI Pipelines is a separately managed service that happens to use a compatible DAG execution model, not a requirement for using open-source Kubeflow.

**Is self-hosting Kubeflow worth it for a small team?**
Usually not, for the reasons detailed in Comparisons and Anti-Patterns: the operational overhead of the full stack rarely pays for itself below a certain scale of ML workflows and dedicated platform-engineering staffing. A managed alternative is frequently the more honest choice for a small team.
`,

  "interview-questions": `
**Junior level**

1. *What is Kubeflow, and how does it relate to Kubernetes?* — Model answer: Kubeflow is a set of ML-specific Custom Resources and controllers (Pipelines, Katib, KServe, Training Operator) that run on top of an existing Kubernetes cluster; it extends Kubernetes' generic scheduling/self-healing/scaling primitives with ML-workflow-shaped abstractions rather than replacing Kubernetes.
2. *What is a Kubeflow Pipeline, at a high level?* — A directed acyclic graph of containerized, Python-defined components with typed inputs/outputs, compiled from the KFP SDK into a portable format and executed as a sequence of Kubernetes pods, one per ready-to-run step.
3. *Why might GPU scheduling matter on Kubernetes for ML workloads?* — Kubernetes' device-plugin mechanism lets the scheduler treat GPUs as a schedulable resource, so training/inference pods requesting a GPU only land on nodes that have one, and multiple workloads can share a GPU node pool without manual bookkeeping.
4. *What does KServe do?* — Turns a trained model artifact (referenced by storage location) into a running, autoscaling inference endpoint via a declarative InferenceService manifest, including scale-to-zero support built on Knative.
5. *Name one thing Kubeflow does NOT solve.* — It is not a data warehouse/feature store, and it is not a general-purpose workflow orchestrator for non-ML workflows — that's Airflow's territory, among other things listed in Problem It Solves.

**Senior level**

6. *When would you recommend against using Kubeflow at all?* — Model answer: for single-node/short-running training jobs that don't need distributed compute or multi-step orchestration; for small teams without dedicated platform-engineering capacity to absorb Kubeflow's operational surface; or when a managed alternative (Vertex AI Pipelines, SageMaker Pipelines) delivers the same DAG-based ML orchestration with materially less operational burden.
7. *Compare Kubeflow Pipelines and Airflow for an ML use case. When would you choose each?* — Model answer: KFP when the workflow is inherently ML-shaped (typed artifacts, model lineage, Kubernetes-native GPU scheduling matter) and mostly self-contained; Airflow when the ML step is one part of a broader heterogeneous DAG involving many non-ML systems, or when the team already has deep Airflow operational expertise and doesn't want a second orchestrator.
8. *How does Kubeflow Pipelines resolve execution order between components?* — From data dependencies: the compiler infers DAG edges from which component's output feeds which other component's input; you never declare "run after" explicitly.
9. *What's the practical difference between KFP SDK v1 and v2?* — v2's decorator-based, plain-Python component model with typed I/O is easier to unit test and catches type mismatches at compile time; v1's ContainerOp-based model gave more direct low-level control over the underlying Argo Workflow at the cost of ergonomics. (Hedge: exact API details have shifted release to release.)
10. *How would you debug a pipeline step that appears stuck?* — Check the Pipelines UI DAG view first for a red/gray node, then escalate to kubectl describe/logs on the underlying pod exactly as for any Kubernetes workload, checking specifically whether the upstream step actually wrote its declared output artifact.
11. *What's the operational cost of self-hosting the full Kubeflow distribution, concretely?* — Model answer: every component (Istio, Argo, Katib's suggestion services, KServe/Knative, Training Operator) is a separate controller with its own upgrade cadence and mutual-compatibility constraints; a version upgrade of one component can require coordinated upgrades of others, which is a genuine platform-engineering commitment, not a routine dependency bump.
12. *How would you prevent a Katib hyperparameter search from silently burning excessive compute?* — Set explicit maxTrialCount and parallelTrialCount bounds on the Experiment, size the feasibleSpace ranges deliberately rather than generously "just in case," and monitor trial success/failure rate to catch a broken trialTemplate early.
`,

  "coding-questions": `
**Problem 1 — Write and compile a two-step KFP v2 pipeline with a conditional branch**

Write a pipeline that trains a model, evaluates it, and only "deploys" (here, just prints a deployment message) if accuracy clears a threshold.

~~~python
from kfp import dsl, compiler
from kfp.dsl import Output, Input, Model, Metrics

@dsl.component(base_image="python:3.11-slim", packages_to_install=["scikit-learn", "joblib"])
def train(model_out: Output[Model]) -> None:
    from sklearn.datasets import load_iris
    from sklearn.ensemble import RandomForestClassifier
    import joblib
    X, y = load_iris(return_X_y=True)
    clf = RandomForestClassifier(n_estimators=50, random_state=0).fit(X, y)
    joblib.dump(clf, model_out.path)

@dsl.component(base_image="python:3.11-slim", packages_to_install=["scikit-learn", "joblib"])
def evaluate(model_in: Input[Model], metrics_out: Output[Metrics]) -> float:
    from sklearn.datasets import load_iris
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score
    import joblib
    X, y = load_iris(return_X_y=True)
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
    clf = joblib.load(model_in.path)
    acc = accuracy_score(y_test, clf.predict(X_test))
    metrics_out.log_metric("accuracy", acc)
    return acc

@dsl.component(base_image="python:3.11-slim")
def notify_deploy(model_name: str) -> None:
    # Edge case handled: this component only ever runs when the pipeline's
    # conditional evaluates true, so no threshold-check logic is duplicated here.
    print(f"Deploying {model_name} to production.")

@dsl.pipeline(name="train-eval-deploy")
def train_eval_deploy_pipeline(accuracy_threshold: float = 0.9):
    train_task = train()
    eval_task = evaluate(model_in=train_task.outputs["model_out"])
    with dsl.If(eval_task.output >= accuracy_threshold, name="deploy-if-good-enough"):
        notify_deploy(model_name="iris-classifier")

compiler.Compiler().compile(
    pipeline_func=train_eval_deploy_pipeline,
    package_path="train_eval_deploy.yaml",
)
~~~

Complexity/behavior notes: the DAG has a fixed number of nodes regardless of the threshold; the conditional only affects whether notify_deploy executes at runtime, not the compiled graph's shape. Follow-up: extend this to retry evaluate up to N times on transient failure using dsl.RetryPolicy, and discuss why retrying train blindly on failure is riskier (non-idempotent side effects, wasted GPU time) than retrying a pure evaluation step.

**Problem 2 — Write a Katib Experiment for a small grid search and reason about its cost**

Given a training container that accepts --learning-rate and --batch-size flags, write a Katib Experiment performing a grid search, and explain how you'd bound its total compute cost.

~~~yaml
apiVersion: kubeflow.org/v1beta1
kind: Experiment
metadata:
  name: lr-batch-grid-search
spec:
  maxTrialCount: 12          # bounds total compute: 4 lr values x 3 batch sizes
  parallelTrialCount: 3      # at most 3 concurrent trial pods
  maxFailedTrialCount: 3     # abort the search if trials are failing systematically
  objective:
    type: maximize
    goal: 0.95
    objectiveMetricName: val_accuracy
  algorithm:
    algorithmName: grid
  parameters:
    - name: learning_rate
      parameterType: discrete
      feasibleSpace: { list: ["0.001", "0.003", "0.01", "0.03"] }
    - name: batch_size
      parameterType: discrete
      feasibleSpace: { list: ["16", "32", "64"] }
  trialTemplate:
    primaryContainerName: training-container
    trialParameters:
      - { name: learningRate, reference: learning_rate }
      - { name: batchSize, reference: batch_size }
    trialSpec:
      apiVersion: batch/v1
      kind: Job
      spec:
        template:
          spec:
            containers:
              - name: training-container
                image: myregistry/trainer:1.0
                command:
                  - python
                  - train.py
                  - --learning-rate=\${trialParameters.learningRate}
                  - --batch-size=\${trialParameters.batchSize}
            restartPolicy: Never
~~~

Complexity discussion: total possible trials for a full grid is the product of each parameter's discrete list length (4 x 3 = 12 here); maxTrialCount caps this explicitly so the search cannot silently exceed the intended budget even if more parameter combinations existed, and maxFailedTrialCount stops the search early if the trialTemplate itself is broken rather than burning the full budget on failures. Follow-up: discuss when a Bayesian-optimization algorithmName would be preferred over grid for a larger, continuous search space, and why grid search's cost grows combinatorially with each added parameter.

**Problem 3 (conceptual, discuss trade-offs) — Decide: Kubeflow Pipeline or plain Python script?**

Given: a data scientist's script trains a small scikit-learn model on a CSV that fits in memory, finishing in under a minute, run maybe twice a week by one person. Should this become a Kubeflow Pipeline?

Model answer: No — this is squarely the Anti-Patterns case of using Kubeflow where it isn't needed. The workload has no multi-step DAG structure worth expressing, no distributed-training need, and no meaningful resource-isolation requirement beyond what the data scientist's own machine or a simple scheduled script already provides. The right call is to keep it a plain script (perhaps checked into version control with its output logged to MLflow for tracking), and revisit Kubeflow only if the workflow grows real multi-step structure, needs to run at real cluster scale, or needs to be shared/reproduced reliably across a team on shared infrastructure.
`,

  "hands-on-labs": `
**Lab 1 (Beginner) — Compile and run a one-component pipeline**
Deliverable: a working local or cluster-based Kubeflow Pipelines environment (a minikube/kind cluster with Pipelines installed, or a hosted trial) running the say_hello component from Beginner Concepts, with a screenshot of the Pipelines UI showing the completed run and its logged output. Skills exercised: KFP SDK basics, compiling and submitting a run, reading the Pipelines UI.

**Lab 2 (Intermediate) — Build the train/evaluate/conditional-deploy pipeline**
Deliverable: the three-component pipeline from Intermediate/Coding Questions, run end to end with at least two different accuracy_threshold values, demonstrating the conditional branch both firing and being skipped, with the compiled IR file checked into a Git repository alongside the component source. Skills exercised: typed artifacts, dsl.If conditionals, pipeline versioning discipline.

**Lab 3 (Intermediate/Advanced) — Run a bounded Katib search**
Deliverable: the Katib Experiment from Coding Questions Problem 2 (or a smaller variant), run to completion with maxTrialCount/parallelTrialCount/maxFailedTrialCount all set deliberately, plus a short written justification of the chosen bounds and a summary of which hyperparameter combination won. Skills exercised: Katib Experiment authoring, cost-bounding a search, reading trial results.

**Lab 4 (Production) — Deploy and canary-roll a model with KServe**
Deliverable: an InferenceService serving a trained model, sending real prediction requests and verifying the response; then a second model version deployed alongside it with traffic split (e.g. 90/10) between the two, with a written note on how you'd monitor the canary before a full cutover and what metric would trigger a rollback. Skills exercised: KServe InferenceService authoring, canary rollout, production monitoring judgment.
`,

  "real-projects": `
**Project 1 — End-to-end tabular ML pipeline on Kubeflow**
Build a full Kubeflow Pipeline for a tabular classification problem: data validation, preprocessing, training, evaluation with a conditional deploy gate, and a KServe InferenceService for the winning model. Engineering requirements: pipeline components must be independently unit-testable outside Kubeflow; all resource requests/limits must be set explicitly; the compiled pipeline IR and component source must be version-controlled together; include a Katib-based hyperparameter search as one stage, bounded by an explicit compute budget.

**Project 2 — Distributed training + tuning on GPU nodes**
Using a GPU-enabled cluster (or a cloud-managed Kubernetes cluster with a GPU node pool), set up a PyTorchJob for multi-worker distributed training of a modestly sized deep learning model, paired with a Katib search over at least two hyperparameters, and a KServe endpoint for the resulting model with min-replica set appropriately for latency requirements. Engineering requirements: taints/tolerations correctly isolating GPU capacity; documented reasoning for chosen distributed-training topology (data-parallel vs. otherwise); a monitoring dashboard tracking GPU utilization during training.

**Project 3 — Migration case study: Kubeflow vs. a managed alternative**
Take one of the above projects and produce a written comparison: what would change if this ran on a managed alternative (Vertex AI Pipelines or SageMaker Pipelines) instead of self-hosted Kubeflow — concretely, what operational responsibilities disappear, what portability is gained or lost, and what it would cost in migration effort. Engineering requirement: back every claim with a specific, checkable fact about the compared platform rather than a general impression.
`,

  "case-studies": `
**Google's internal-to-open-source arc.** Kubeflow began as Google's narrow "TensorFlow on Kubernetes" tool and grew into a broad multi-vendor platform once open-sourced and handed to community governance. Lesson: a tool designed for one company's specific stack (TensorFlow) had to deliberately generalize (multi-framework Training Operator, framework-agnostic KServe) to become broadly useful — a pattern worth recognizing whenever adopting an "originated at Big Tech Co." open-source tool: check whether it has genuinely generalized past its origin story or still quietly assumes that company's specific stack.

**KFServing's rename and spinout to KServe.** A component originally bundled tightly inside Kubeflow was deliberately split out into an independently governed project once it became clear teams wanted model serving without the rest of the Kubeflow stack. Lesson: modularity is not just a nice architectural property — it directly reflects real adoption patterns, where "give me just the serving piece" turned out to be common enough to justify formal separation.

**The KFP v1-to-v2 SDK transition.** The move from ContainerOp/YAML-spec components to decorator-based plain-Python components was a deliberate ergonomics-and-safety tradeoff (better testability, compile-time type checking) at the cost of some low-level control. Lesson: a platform's authoring API evolving toward "closer to plain code, less bespoke DSL" is a broadly recurring pattern (also visible in Airflow's TaskFlow API vs. classic operators) — expect any mature orchestration SDK to eventually grow a version that looks more like ordinary application code.

**Teams that install the full stack, then quietly run only a third of it.** A recurring, if less formally documented, industry pattern: organizations that initially install Istio + Argo + Katib + full Notebooks + KServe discover in practice they actively rely on only one or two components (commonly KServe for serving), and the rest sits mostly idle while still consuming ongoing maintenance effort. Lesson: install incrementally and let real usage justify each additional component, rather than provisioning the maximal stack up front on the assumption "we'll probably use all of it eventually."
`,

  comparisons: `
| Tool | Model | Best for | Weakest for |
|---|---|---|---|
| Kubeflow Pipelines | Kubernetes-native ML DAGs, typed artifacts, compiled from Python | ML-specific training/eval/deploy workflows needing GPU scheduling and cluster-scale execution | Small teams without existing Kubernetes investment; simple single-node jobs |
| Airflow | General-purpose task scheduler, DAGs of arbitrary operators, mature scheduling/retry/SLA features | Heterogeneous business workflows (ETL, reporting, cross-system orchestration) where ML is one node among many | ML-specific concerns like typed model artifacts, GPU-aware scheduling, and model lineage aren't first-class |
| Vertex AI Pipelines (Google Cloud, managed) | Runs pipelines compiled with the same open-source KFP SDK, fully managed control plane | Teams wanting KFP's authoring model without operating Kubeflow's infrastructure themselves | Locks you into Google Cloud's managed execution environment and its cost model |
| SageMaker Pipelines (AWS, managed) | AWS-native managed ML pipeline service with its own SDK/authoring model | Teams already standardized on AWS wanting a managed ML pipeline service | Different authoring API from KFP — not a drop-in replacement if you've invested in KFP-specific pipelines |
| Plain scripts + cron/CI | No orchestration platform at all — shell/Python scripts triggered by CI or cron | Small teams, simple/short-running jobs, low workflow complexity | No DAG structure, no built-in retries/caching/lineage, doesn't scale to multi-step or distributed workloads |

**How seniors choose:** the deciding question is rarely "which tool is more powerful" — Kubeflow Pipelines, Airflow, and the managed alternatives are all capable of expressing an ML workflow. The deciding factors are: (1) does the workflow's shape genuinely need Kubernetes-native GPU scheduling and cluster-scale distributed training, or would a single well-resourced machine and a simple script suffice; (2) is the team already deeply invested in Kubernetes operational expertise, in which case Kubeflow's marginal operational cost is lower than for a team starting from zero; (3) is this ML workflow one piece of a much larger, heterogeneous scheduling need, in which case Airflow's general-purpose model avoids running two separate orchestrators; and (4) does the team have (or want) dedicated platform-engineering capacity to operate Kubeflow's full stack, or would a managed offering's higher per-unit cost be cheaper than the engineering time self-hosting demands. A senior engineer treats "self-host Kubeflow" as the more expensive, more flexible option and requires a specific reason to choose it over a managed alternative or a simpler tool, rather than defaulting to it.
`,

  "related-technologies": `
- **Kubernetes** — the foundation every Kubeflow component runs on; read this platform's **Kubernetes** skill first if you have not already, since this page assumes its vocabulary (Pods, Deployments, controllers, RBAC, namespaces) throughout.
- **Docker** — every pipeline component, training job, and inference server ultimately runs inside a container image; see the **Docker** skill for building and securing those images.
- **Airflow** — the general-purpose sibling orchestrator; see Comparisons for exactly when to choose it instead of, or alongside, Kubeflow Pipelines.
- **MLflow** — commonly paired with Kubeflow for richer experiment tracking and a model registry than Kubeflow's own metadata store provides; see the **MLflow** skill.
- **MLOps** — the broader discipline (reproducibility, versioning, monitoring, governance) that Kubeflow is one possible infrastructure implementation of; see the **MLOps** skill for the concepts independent of any specific tool.
- **Argo Workflows** — the underlying workflow execution engine Kubeflow Pipelines has historically been built on; understanding Argo's own DAG/Workflow CRD model illuminates what KFP is compiling down to.
- **Knative** — the serverless-on-Kubernetes project underpinning KServe's autoscaling and scale-to-zero behavior.
- **Istio** — the service mesh commonly used for Kubeflow's multi-tenant authorization and traffic management.
- **Scaling AI** — for the broader organizational and infrastructure-scaling considerations that decide whether a Kubeflow-scale platform commitment is justified at all; see the **Scaling AI** skill.

Suggested learning path on this platform: **Docker** → **Kubernetes** → this page (Kubeflow) → **MLflow** (experiment tracking/registry) → **MLOps** (the full reproducibility/governance picture) → **Airflow** (the general-purpose orchestration sibling) → **Scaling AI** (organizational scaling considerations).
`,

  "latest-updates": `
Knowledge cutoff honesty: this page's author has a knowledge cutoff in early-to-mid 2026 territory and Kubeflow's release cadence, SDK details, and component boundaries have shifted meaningfully release to release historically (the KFServing-to-KServe rename and the v1-to-v2 SDK transition are both examples of changes significant enough to make older tutorials misleading). Before relying on any specific version number, API signature, or component-boundary claim for production work, verify against the current official Kubeflow documentation and release notes rather than trusting this page or any single blog post as the final word.

Directionally, and hedged accordingly: the KFP v2 SDK has continued to be the actively developed default, with v1 in a maintenance/legacy posture; the Training Operator has continued consolidating framework-specific job CRDs toward a more unified training API; KServe has continued to mature as an increasingly independently-governed project with its own release cadence somewhat decoupled from the core Kubeflow distribution's; and managed alternatives (Vertex AI Pipelines, SageMaker Pipelines) have continued to be a common on-ramp for teams that want KFP's DAG authoring model without operating Kubeflow's infrastructure themselves. Always check the Kubeflow project's official release notes and the KServe project's own documentation for the authoritative current state before making architecture decisions.
`,

  "future-roadmap": `
Where the ecosystem appears to be heading, stated with appropriate hedging: continued movement toward Kubeflow's individual components (KServe especially, and increasingly the Training Operator) being independently adoptable and independently governed, rather than requiring the full distribution — this composability trend has been consistent enough across Kubeflow's history that it is a reasonably safe bet to continue. Kubernetes' own Dynamic Resource Allocation work (relevant for GPUs and other specialized accelerators, tracked in the core **Kubernetes** skill's history) is likely to keep improving how Kubeflow's training and serving workloads request and share specialized hardware, which matters directly for AI workloads.

What to bet career time on: understanding the underlying Kubernetes primitives (scheduling, resource management, controllers/CRDs) pays off regardless of which specific ML-on-Kubernetes tool wins any given year, since every current and plausible future contender (Kubeflow, managed alternatives, whatever comes next) is built on that same foundation. Betting heavily on very specific, fast-moving API surface (a particular KFP SDK version's exact decorator syntax, for instance) is a shorter-lived investment — treat those specifics as details to look up fresh each time, not facts to memorize permanently. The more durable skill is the general pattern this whole page teaches: express an ML workflow's real structure (DAG dependencies, typed artifacts, resource requirements) declaratively, and let a Kubernetes-native controller reconcile it — that pattern is likely to outlive any single tool's specific implementation of it.
`,

  "cheat-sheet": `
~~~text
KUBEFLOW ESSENTIALS

COMPONENTS
  Pipelines (KFP)   - DAG of Python-defined components, compiled + run on the cluster
  Katib             - hyperparameter/NAS search as a Kubernetes Experiment/Trial CRD
  KServe            - InferenceService CRD -> autoscaling model-serving endpoint
  Training Operator - PyTorchJob/TFJob CRDs for distributed-training pod topologies
  Notebooks         - JupyterLab pods with cluster-native namespace/RBAC

MINIMAL KFP V2 COMPONENT
  from kfp import dsl
  @dsl.component(base_image="python:3.11-slim")
  def step(x: int) -> int:
      return x + 1

COMPILE + SUBMIT
  compiler.Compiler().compile(pipeline_func=my_pipeline, package_path="p.yaml")
  Client(host=...).create_run_from_pipeline_package("p.yaml", arguments={...})

KATIB EXPERIMENT (key fields)
  spec.objective: { type, goal, objectiveMetricName }
  spec.algorithm: { algorithmName }         # random | grid | bayesianoptimization | ...
  spec.parameters: [ { name, parameterType, feasibleSpace } ]
  spec.maxTrialCount / parallelTrialCount / maxFailedTrialCount   # ALWAYS bound these

KSERVE INFERENCESERVICE (minimal)
  spec.predictor.sklearn.storageUri: "s3://bucket/model/1"
  annotations: { autoscaling.knative.dev/minScale: "1" }   # avoid cold starts if needed

DEBUG ESCALATION (same as plain Kubernetes)
  1. Pipelines UI DAG view -> which node is red/gray
  2. kubectl describe pod <step-pod>      -> Events (scheduling failures)
  3. kubectl logs <step-pod> [--previous] -> actual traceback
  4. Check artifact store directly for missing outputs

WHEN NOT TO USE KUBEFLOW
  - single-node job finishing in minutes -> just run the script
  - no multi-step DAG, no distributed training, no cluster-scale need
  - small team without platform-engineering capacity -> consider managed alt

KUBEFLOW VS AIRFLOW
  KFP:     ML-specific DAG, typed artifacts, Kubernetes-native GPU scheduling
  Airflow: general-purpose scheduler, best when ML is one node in a bigger DAG

MANAGED ALTERNATIVES
  Vertex AI Pipelines (GCP)   - runs KFP-compiled pipelines, managed control plane
  SageMaker Pipelines (AWS)   - AWS-native managed pipelines, different SDK

TOP PITFALLS
  - using Kubeflow for a job that never needed Kubernetes
  - not versioning compiled pipeline IR + component source together
  - underestimating operational cost of the full component stack
  - unbounded Katib searches (no maxTrialCount/parallelTrialCount)
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What is Kubeflow, one sentence? | A Kubernetes-native ML platform adding ML-specific Custom Resources for pipelines, tuning, serving, and notebooks. |
| What does KFP stand for and what does it do? | Kubeflow Pipelines — compiles Python-defined ML workflow steps into a DAG executed as Kubernetes pods. |
| What is Katib? | Kubeflow's hyperparameter/neural-architecture-search component, implemented as an Experiment/Trial CRD pair. |
| What is KServe? | A CRD (InferenceService) that turns a trained model artifact into an autoscaling inference endpoint, built on Knative. |
| Why is Kubernetes a natural substrate for ML workloads? | Native GPU scheduling, resource isolation between jobs, elastic scaling for inference, and self-healing for long-running training. |
| What's the difference between KFP SDK v1 and v2? | v1 uses ContainerOp/YAML component specs; v2 uses decorator-based plain-Python functions with typed I/O, easier to unit test. |
| How does KFP determine step execution order? | From data dependencies — the compiler infers DAG edges from which component's output feeds another's input. |
| What does pipeline caching key on? | The component's declared inputs, code, and container image digest — NOT external mutable state. |
| What's the classic anti-pattern with Kubeflow? | Using it for a single-node job that finishes in minutes and never needed a cluster at all. |
| How does KServe achieve scale-to-zero? | It's built on Knative Serving, which can scale a model's replica count down to zero when idle and back up on request. |
| When would you choose Airflow over Kubeflow Pipelines for an ML workflow? | When the ML step is one part of a broader heterogeneous scheduling need (ETL, reporting, cross-system jobs). |
| What bounds a Katib search's total compute cost? | maxTrialCount, parallelTrialCount, and maxFailedTrialCount set explicitly on the Experiment spec. |
| What's the main operational cost of self-hosting Kubeflow? | Every component (Istio, Argo, Katib, KServe/Knative, Training Operator) is a separate moving part with its own upgrade cadence. |
| What replaced KFServing? | KServe — a rename plus spinout into a more independently governed project. |
| What's a common alternative to self-hosting Kubeflow? | Managed pipeline services like Google's Vertex AI Pipelines or AWS SageMaker Pipelines. |
`,

  mcqs: `
1. What does Kubeflow Pipelines compile a Python-defined workflow into?
   A) A Dockerfile
   B) A DAG executed as Kubernetes pods
   C) A single monolithic binary
   D) A Terraform plan
   **Answer: B** — the KFP compiler traces the Python pipeline function and emits an IR describing a DAG, which the backend executes as one pod per step.

2. Which Kubeflow component is responsible for hyperparameter tuning?
   A) KServe
   B) Notebooks
   C) Katib
   D) Training Operator
   **Answer: C** — Katib runs hyperparameter/NAS search as a Kubernetes-native Experiment/Trial CRD pair.

3. What underlies KServe's scale-to-zero autoscaling?
   A) Argo Workflows
   B) Knative Serving
   C) Istio alone
   D) The Cluster Autoscaler
   **Answer: B** — KServe's InferenceService is reconciled into Knative Serving objects, which provide autoscaling including scale-to-zero.

4. Which is the clearest anti-pattern described on this page?
   A) Setting resource limits on a training pod
   B) Using Kubeflow to orchestrate a multi-step distributed training and eval pipeline
   C) Wrapping a 30-second single-CPU training script in a full compiled Kubeflow Pipeline
   D) Versioning compiled pipeline IR alongside component source
   **Answer: C** — this is the classic case of reaching for Kubeflow/Kubernetes when the workload never needed cluster-scale orchestration at all.

5. What is the main practical difference between KFP SDK v1 and v2?
   A) v1 is Python-only, v2 requires YAML
   B) v2 uses decorator-based plain-Python components with typed I/O; v1 used ContainerOp/YAML specs
   C) v1 and v2 are functionally identical
   D) v2 removed support for pipelines entirely
   **Answer: B** — v2's decorator model is easier to unit test and catches type mismatches at compile time, at some cost to v1's lower-level control.

6. When is Airflow generally the better choice over Kubeflow Pipelines?
   A) When the workflow needs GPU-aware Kubernetes-native scheduling
   B) When the ML step is one part of a broader, heterogeneous set of scheduled non-ML jobs
   C) When you need typed model artifacts and lineage
   D) When you have no Kubernetes cluster and don't want one
   **Answer: B** — Airflow's general-purpose orchestration model fits best when ML is one node among many in a larger, heterogeneous DAG. (Note: D is also plausible reasoning for avoiding Kubeflow, but the page's comparison specifically frames B as Airflow's differentiator over KFP.)
`,

  "revision-notes": `
Kubeflow is a Kubernetes-native ML platform, not a single program — it bundles Kubeflow Pipelines (KFP, for compiling Python-defined training/eval/deploy DAGs), Katib (hyperparameter/NAS search as a CRD), KServe (declarative, autoscaling model serving built on Knative), the Training Operator (distributed-training CRDs like PyTorchJob/TFJob), and Notebooks (JupyterLab pods), each independently adoptable. Kubernetes is a natural fit for ML workloads because its existing primitives — GPU-aware scheduling via device plugins, resource isolation, elastic horizontal scaling, and self-healing — map directly onto ML's needs without reinventing distributed-systems fundamentals; Kubeflow's job is only to add the ML-specific vocabulary (typed artifacts, hyperparameter search objects, serving CRDs) on top.

A KFP pipeline is authored as ordinary Python functions decorated with @dsl.component (in the current, recommended v2 SDK), wired together by data dependencies the compiler turns into DAG edges, then compiled to a portable IR and executed as one Kubernetes pod per step by a backend historically built on Argo Workflows. Every Kubeflow component follows the same underlying pattern as Kubernetes itself: a CRD declares desired state, a controller reconciles it into ordinary pods — true for Pipelines runs, Katib Experiments/Trials, and KServe InferenceServices alike.

The single most important practical judgment call this page teaches: Kubeflow's operational cost is real and compounds with every component adopted (Istio, Argo, Katib, KServe/Knative, Training Operator all need to stay mutually compatible across upgrades), so it should be reserved for workloads that genuinely need multi-step orchestration, distributed training, or cluster-scale resource management — not defaulted to for a single-node job that would run fine as a plain script. Compare honestly against managed alternatives (Vertex AI Pipelines, SageMaker Pipelines) and against Airflow for workflows that are only partly ML-shaped before committing to self-hosting.

Common failure modes worth remembering by name: using Kubeflow where Kubernetes was never needed at all; failing to version compiled pipeline IR files alongside component source, which quietly destroys reproducibility; underestimating the ongoing platform-engineering commitment until an upgrade breaks something; and letting a Katib search run unattended without maxTrialCount/parallelTrialCount bounds. Pair Kubeflow's pipeline lineage with a dedicated tool like MLflow for real experiment tracking and a model registry, since Kubeflow's own metadata store is not a substitute for that.

The learning path this page assumes and recommends: Docker (package one step) → Kubernetes (orchestrate the fleet) → Kubeflow (ML-specific DAGs, tuning, serving on top) → MLflow (track and register what came out) → MLOps (the full governance picture) → Airflow (the general-purpose sibling for everything that isn't ML-specific).
`,

  "learning-roadmap": `
**Week 1 — Foundations.** Confirm Kubernetes fundamentals are solid (if not, stop and complete the **Kubernetes** skill first). Read Overview through Problem It Solves on this page. Milestone: explain in your own words why Kubeflow exists on top of Kubernetes rather than as a standalone tool.

**Week 2 — First pipeline.** Set up a local or lightweight cluster with Kubeflow Pipelines installed (or a hosted trial). Work through Beginner and Intermediate Concepts, writing and compiling the say_hello component and then the train/evaluate pipeline. Milestone: complete Hands-on Lab 1 and Lab 2.

**Week 3 — Tuning and serving.** Read Advanced Concepts, Internal Working, and Architecture. Write and run a bounded Katib Experiment; deploy a trained model with KServe and send it a real prediction request. Milestone: complete Hands-on Lab 3 and the KServe portion of Lab 4.

**Week 4 — Production judgment.** Read Production Usage through Security, and Comparisons. Do the written comparison exercise from Real Projects Project 3 (Kubeflow vs. a managed alternative) using your own team's actual constraints as the scenario, even hypothetically. Milestone: produce a one-page recommendation memo — self-host or go managed, and why — as if advising a real team.

**Week 5 — Interview and depth check.** Work through Interview Questions and Coding Questions without looking at the model answers first, then compare. Review Common Mistakes and Anti-Patterns and identify which ones you would have made without this page. Milestone: score yourself honestly against the Learning Objectives at the top of this page.

**What's next.** With Kubeflow's ML-specific orchestration model understood, the natural next platform skill is **MLflow** for the experiment-tracking and model-registry depth Kubeflow's own metadata store deliberately does not provide, followed by **MLOps** for the full reproducibility/governance picture these tools implement pieces of.
`,

  "official-docs": `
- **Kubeflow documentation (kubeflow.org)** — the primary source for installation, component-by-component guides, and version-specific API details; always check this first for anything version-specific, since this page deliberately hedges on exact current API surface.
- **Kubeflow Pipelines SDK documentation** — the authoritative reference for @dsl.component, @dsl.pipeline, the Compiler, and the Client API; check which SDK major version (v1 vs v2) the docs page you're reading targets.
- **Katib documentation** — Experiment/Trial CRD field reference and supported search algorithms.
- **KServe documentation (kserve.github.io)** — InferenceService CRD reference, supported model-server runtimes (sklearn, xgboost, pytorch, custom predictors), and autoscaling configuration.
- **Kubeflow Training Operator documentation** — PyTorchJob/TFJob and related CRD references for distributed training.
- **Kubernetes documentation** — for the underlying primitives (device plugins for GPU scheduling, taints/tolerations, ResourceQuota) that every Kubeflow component ultimately relies on; see also the **Kubernetes** skill's own Official Docs section.
`,

  books: `
- **"Kubernetes: Up and Running" by Brendan Burns, Joe Beda, and Kelsey Hightower** — foundational Kubernetes reading from two Kubernetes co-creators; essential before tackling Kubeflow specifically, since Kubeflow assumes this fluency.
- **"Kubeflow Operations Guide" by Josh Patterson, Michael Katzenellenbogen, and Austin Harris** — one of the few book-length treatments focused specifically on operating Kubeflow in production; useful for the operational-overhead perspective this page emphasizes repeatedly.
- **"Kubeflow for Machine Learning" by Trevor Grant, Holden Karau, Boris Lublinsky, Richard Liu, and Ilan Filonenko** — a practical, component-by-component walkthrough of the Kubeflow ecosystem from several of its practitioner contributors.
- **"Designing Machine Learning Systems" by Chip Huyen** — not Kubeflow-specific, but excellent for the broader ML-infrastructure judgment (when do you actually need a platform like Kubeflow versus a simpler setup) that this page's Comparisons and Anti-Patterns sections lean on.
- **"Building Machine Learning Pipelines" by Hannes Hapke and Catherine Nelson** — covers TFX pipeline concepts that parallel much of Kubeflow Pipelines' DAG/artifact model; useful for cross-referencing a differently-branded but conceptually similar pipeline framework.
`,

  blogs: `
- **The official Kubeflow blog (blog.kubeflow.org)** — release announcements and component deep-dives directly from maintainers; the highest-signal source for what actually changed in a given release.
- **The KServe project blog/docs site** — serving-specific deep dives, especially useful given how much KServe's API has evolved since its KFServing days.
- **Google Cloud's Vertex AI blog** — useful for understanding how the managed alternative built on a compatible pipeline model diverges operationally from self-hosted Kubeflow.
- **CNCF blog posts and KubeCon talk write-ups tagged Kubeflow** — a good source of real production war stories (the case-study material referenced in Industry Examples and Case Studies often originates from these talks).
- Hedge: avoid trusting any Kubeflow tutorial blog post older than roughly a year or two without checking it against current official docs first, given how much the SDK and component boundaries have shifted historically (v1-to-v2 SDK, KFServing-to-KServe).
`,

  "research-papers": `
Kubeflow itself is primarily an engineering/platform project rather than the direct subject of foundational academic papers, so the closest genuinely relevant research reading is the lineage and adjacent-systems literature it builds on or parallels:

- **"Large-scale cluster management at Google with Borg" (Verma et al., EuroSys 2015)** — the direct architectural ancestor whose lessons (declarative desired-state scheduling, control-loop reconciliation) Kubernetes, and by extension Kubeflow, inherit.
- **"Omega: flexible, scalable schedulers for large compute clusters" (Schwarzkopf et al., EuroSys 2013)** — Google's research on shared-state cluster scheduling that informed Kubernetes' scheduler design.
- **The TensorFlow whitepaper (Abadi et al., 2016, "TensorFlow: A System for Large-Scale Machine Learning")** — relevant background given Kubeflow's origin as "TensorFlow on Kubernetes," explaining the distributed-training model TFJob was originally built to express.
- **TFX: A TensorFlow-Based Production-Scale Machine Learning Platform (Baylor et al., KDD 2017)** — describes Google's internal production ML pipeline system, conceptually adjacent to what Kubeflow Pipelines does, and a useful compare-and-contrast read for the DAG/artifact/component model.

Honest hedge: if you are looking for a Kubeflow-specific peer-reviewed paper, there genuinely isn't a canonical single one the way there is for, say, a specific ML architecture — treat the above as the closest foundational reading that explains the ideas Kubeflow's engineering builds on, not papers about Kubeflow itself.
`,

  videos: `
- **KubeCon + CloudNativeCon talks tagged Kubeflow or KServe** — the single best source of real production war stories and architecture deep-dives, since Kubeflow's community presents there regularly; search by year for the most current material given how much has changed release to release.
- **Kubeflow community meeting recordings** — for anyone going deep enough to contribute or track roadmap decisions directly from working-group discussions.
- **Google Cloud's Vertex AI Pipelines walkthroughs** — useful for seeing the managed-alternative side of the same DAG-authoring model in action, which sharpens the Comparisons section's tradeoffs when watched alongside a self-hosted Kubeflow demo.
- Hedge: specific creator/channel recommendations shift constantly in this space; search current KubeCon and Kubeflow YouTube channels directly for the most recent talks rather than relying on any single named creator, since much of the best material is conference-talk-based rather than a stable creator's ongoing series.
`,

  "github-repos": `
- **kubeflow/kubeflow** — the core umbrella project's repository, including the central dashboard and overall distribution manifests.
- **kubeflow/pipelines** — the Kubeflow Pipelines SDK, backend, and UI source; the place to check exact current @dsl.component/@dsl.pipeline API signatures against this page's examples.
- **kubeflow/katib** — the hyperparameter/NAS tuning component's controller and suggestion-service implementations.
- **kserve/kserve** — KServe's own repository (now separately governed from the core Kubeflow distribution), including the InferenceService CRD and built-in model-server runtimes.
- **kubeflow/training-operator** — PyTorchJob, TFJob, and related distributed-training CRDs and controllers.
- **kubeflow/manifests** — the Kustomize-based reference manifests for installing the full (or partial) Kubeflow distribution on a cluster.
- **argoproj/argo-workflows** — the underlying workflow engine historically powering Kubeflow Pipelines' execution; useful reading for understanding what a compiled pipeline IR ultimately becomes.
- **knative/serving** — the autoscaling/scale-to-zero engine underlying KServe; useful for understanding InferenceService behavior one layer down.
- **kubeflow/examples** — community-maintained example pipelines and use cases, useful for seeing realistic, longer pipelines than this page's necessarily compact examples.
`,

  "practice-problems": `
Ordered by skill focus, building from pipeline authoring toward full production judgment:

1. **KFP component authoring** — write three independent @dsl.component functions (a data-loading step, a training step, an evaluation step) and unit-test each as a plain Python function before ever compiling them into a pipeline.
2. **DAG wiring** — compose the above three components into a pipeline, verifying the compiler correctly infers the dependency edges from the input/output wiring alone.
3. **Conditional and loop control flow** — extend the pipeline with a dsl.If gate on an evaluation metric, then (as a stretch) a loop construct running the same training component across a small list of hyperparameter values passed as a pipeline parameter.
4. **Katib Experiment authoring** — write a bounded Katib Experiment (explicit maxTrialCount/parallelTrialCount/maxFailedTrialCount) for a two-hyperparameter grid search, then convert it to a Bayesian-optimization algorithmName and compare trial-count efficiency conceptually.
5. **KServe deployment and canary** — deploy an InferenceService for a simple scikit-learn model, then deploy a second version with a 90/10 traffic split, and write the rollback criteria you would use before a full cutover.
6. **Debugging drill** — deliberately break a pipeline (wrong image tag, missing dependency, a component that reads an unset environment variable) and practice the full debugging escalation path from Debugging section without looking at the answer first.
7. **Decision exercise** — given three different hypothetical workload descriptions (a single-node script, a multi-step DAG needing distributed GPU training, and a heterogeneous non-ML-heavy scheduling need), decide for each: plain script, Kubeflow, or Airflow — and justify each choice using this page's Comparisons framework.
8. **External practice sets** — the official kubeflow/examples GitHub repository's example pipelines are the best source of additional, more realistic practice pipelines beyond this page's necessarily compact ones; work through several end to end on a real or local cluster.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Cluster["Kubernetes Cluster"]
        subgraph Mesh["Istio (multi-tenant auth, mTLS)"]
            Dash["Central Dashboard"]
            Profile["Profile Controller (namespace-per-team)"]
        end

        subgraph KFP["Kubeflow Pipelines"]
            API["Pipelines API Server"]
            Argo["Workflow Controller (Argo)"]
            StepPods["Step Pods (train / eval / deploy)"]
        end

        subgraph Katib["Katib"]
            KatibCtrl["Experiment/Trial Controller"]
            TrialPods["Trial Pods (Jobs)"]
        end

        subgraph Training["Training Operator"]
            TrainCtrl["PyTorchJob / TFJob Controller"]
            WorkerPods["Worker/Master Pods (GPU node pool)"]
        end

        subgraph Serving["KServe"]
            KServeCtrl["InferenceService Controller"]
            Knative["Knative Serving (autoscale, scale-to-zero)"]
            InferPods["Inference Pods"]
        end

        Notebooks["Notebook Pods (JupyterLab)"]
        Storage[("Object Storage - S3/GCS/MinIO artifacts")]
        GPUPool["GPU Node Pool (tainted)"]
    end

    Dev["ML Engineer"] --> Dash
    Dev --> Notebooks
    Dash --> API
    API --> Argo
    Argo --> StepPods
    StepPods <--> Storage

    Dev --> KatibCtrl
    KatibCtrl --> TrialPods
    TrialPods --> GPUPool

    Dev --> TrainCtrl
    TrainCtrl --> WorkerPods
    WorkerPods --> GPUPool

    StepPods --> KServeCtrl
    KServeCtrl --> Knative
    Knative --> InferPods

    Client["Prediction Client"] --> InferPods
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Kubeflow))
    Foundations
      Kubernetes-native CRDs + controllers
      Modular components, independently adoptable
      Why Kubernetes fits ML: GPU scheduling, isolation, self-healing, elastic scaling
    Components
      Kubeflow Pipelines
        Python components (dsl.component)
        Compiled DAG (IR)
        Argo Workflows execution
        Typed artifacts, caching
      Katib
        Experiment / Trial CRDs
        Search algorithms: random, grid, Bayesian
        Bounded via maxTrialCount / parallelTrialCount
      KServe
        InferenceService CRD
        Built on Knative
        Autoscaling, scale-to-zero, canary
      Training Operator
        PyTorchJob / TFJob
        Distributed topologies
      Notebooks
        JupyterLab pods
        Namespace/RBAC-native
    Practice
      Best Practices
        Adopt smallest useful subset
        Version pipeline IR + components
        Pin base images
      Anti-Patterns
        Kubeflow for single-node jobs
        Unversioned pipelines
        Ignoring operational cost
      Debugging
        UI DAG view first
        kubectl describe/logs escalation
        Check artifact store directly
    Ecosystem
      vs Airflow: ML-specific DAG vs general orchestration
      vs Vertex AI Pipelines / SageMaker Pipelines: managed alternatives
      Related: Docker, Kubernetes, MLflow, MLOps, Scaling AI
    Production Judgment
      Operational overhead is real and compounding
      Self-host vs managed: explicit, documented decision
      Canary rollout for live-traffic model updates
~~~
`,
};

export default kubeflow;
