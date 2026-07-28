import type { SkillContent } from "../types";

/**
 * Weights & Biases (W&B) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const wandb: SkillContent = {
  overview: `
Weights & Biases (W&B, pronounced "wandb") is a platform for experiment tracking, dataset and model versioning, hyperparameter optimization, and collaboration for machine learning teams. At its core it answers a deceptively simple question that every ML practitioner runs into within their first week: "which of the forty models I trained this month actually performed best, and why?"

W&B provides a lightweight Python client (the "wandb" library) that you drop into a training script with a handful of calls — initialize a run, log metrics every step, save the final model — and a hosted (or self-hosted) dashboard that automatically turns that stream of logged data into live, comparable charts. Where a spreadsheet of results or a folder of TensorBoard log directories breaks down once a team has hundreds of experiments, W&B is built from the ground up for that scale: every run is a first-class, queryable, taggable object with its own URL, and the dashboard lets you filter, group, and overlay runs interactively.

For an AI engineer, W&B matters because experiment tracking is not optional infrastructure — it is the difference between science and guesswork. Deep learning training is stochastic, expensive, and full of subtle configuration choices (learning rate schedule, batch size, data augmentation, random seed). Without a system of record, teams re-run experiments they have already run, lose the exact hyperparameters that produced their best checkpoint, and cannot explain regressions when a new model underperforms an old one. W&B, alongside its close sibling **MLflow**, is one of the two dominant answers to this problem in the industry.

Key characteristics: a hosted-first product with a generous free tier for individuals and academics (self-hosting is also supported via W&B Server/Dedicated Cloud for enterprises with data-residency requirements); first-class support for PyTorch, TensorFlow/Keras, Hugging Face Transformers, PyTorch Lightning, scikit-learn, and XGBoost via auto-logging integrations; a strong visual dashboard that is often cited as more polished than open-source alternatives; and a full workflow beyond logging — Sweeps for hyperparameter search, Artifacts for versioned data/model lineage, and Tables for row-level data debugging.
`,

  history: `
Weights & Biases was founded in 2017 by **Lukas Biewald**, **Chris Van Pelt**, and **Shawn Lewis** — the same trio behind CrowdFlower (later Figure Eight), a data-labeling company. Having watched machine learning teams at CrowdFlower and its customers struggle to keep track of experiments scribbled in spreadsheets and lost in shell history, they built W&B specifically to solve the "which run was that again?" problem at scale.

The founders' background in data labeling and applied ML (rather than pure infrastructure) shaped an early product decision that differentiated W&B from competitors: obsessive attention to the dashboard's visual quality and to near-zero-friction integration — "two lines of code to see your training live" was the pitch from day one, and it remains the core value proposition.

| Year | Milestone |
|------|-----------|
| 2017 | Company founded by Biewald, Van Pelt, and Lewis; early focus on a hosted dashboard for deep learning experiment tracking |
| 2018 | Public launch of the wandb Python client; rapid adoption in academic deep learning labs (fast.ai community, OpenAI-adjacent researchers) |
| 2019 | W&B Sweeps launched — hyperparameter optimization (grid, random, Bayesian) with distributed agents |
| 2020 | W&B Artifacts launched — dataset and model versioning with lineage graphs; W&B Reports (shareable, notebook-like write-ups of experiments) |
| 2021 | Series C funding round; growing enterprise push with W&B for Teams and self-hosted W&B Server |
| 2022 | W&B Tables matures for rich, queryable data visualization (images, audio, embeddings, predictions side by side) |
| 2023 | W&B Prompts / LLM-oriented tracing tooling (precursor to broader "LLMOps" observability features) as generative AI usage exploded across the platform's user base |
| 2024–2025 | Continued investment in enterprise deployment options (Dedicated Cloud, on-prem), deeper integrations with Hugging Face and popular fine-tuning stacks, and LLM evaluation/observability tooling layered on top of the core run-tracking product |

Treat the post-2023 timeline as directionally accurate but verify current feature names and pricing on wandb.ai before making a purchasing or architecture decision — both W&B's own naming and its competitive landscape (see Comparisons) have moved quickly.
`,

  "why-it-exists": `
Before tools like W&B and MLflow existed, the standard way researchers tracked deep learning experiments was some combination of:

- **Print statements and terminal scrollback**: loss values scrolling past in a terminal, gone the moment the SSH session closed.
- **Spreadsheets**: a row per run, manually copy-pasted from logs — hyperparameters, final accuracy, and notes typed in by hand, always a few runs behind reality and prone to transcription errors.
- **Folder-naming conventions**: "run_lr0.001_bs32_v2_final_ACTUALLY_final" as the entire experiment tracking system, with the actual metrics buried inside log files nobody re-opened.
- **TensorBoard**: a real improvement — live-updating loss curves from event files — but local-first, hard to share, and painful to compare more than a handful of runs side by side, especially across machines or team members.

None of these scaled past one person working on one model for a few days. As soon as a lab or team ran dozens of experiments, needed to compare across GPUs and machines, or wanted a manager or collaborator to see results without SSHing into a box, the whole system collapsed.

W&B exists to make experiment tracking a hosted service rather than a personal habit: one line to authenticate, one call to initialize a run, and every subsequent metric you log streams to a durable, shareable, queryable dashboard automatically — no manual bookkeeping, no lost results when a laptop dies, and comparison across hundreds of runs is a live filter-and-sort UI operation instead of a spreadsheet chore.
`,

  "problem-it-solves": `
Concrete pains W&B removes:

- **"Which run produced this checkpoint?"** — every logged metric, hyperparameter, git commit, and environment detail is attached to an immutable run record, so a checkpoint from three months ago can always be traced back to exactly how it was produced.
- **Manual results tables** — the dashboard aggregates metrics across runs automatically into sortable, filterable tables and overlay charts; no more copy-pasting final accuracy into a spreadsheet.
- **"Did changing X actually help?"** — parallel coordinates plots and grouped comparisons make it visual and fast to see which hyperparameters correlate with better outcomes, rather than eyeballing a spreadsheet.
- **Hyperparameter search busywork** — W&B Sweeps automates the loop of "try a config, record result, pick the next config," including Bayesian search that gets smarter as more runs complete, instead of a hand-rolled grid-search script.
- **Losing track of dataset/model versions** — Artifacts give datasets and model checkpoints content-addressed versions with a lineage graph, answering "which dataset version trained this model, and which downstream model consumed this dataset?"
- **Sharing results across a team** — a teammate can see your live training curves and final metrics from a browser without touching your machine, your virtual environment, or your GPU cluster.

What W&B deliberately does **not** solve:

- **Orchestrating training jobs** — it does not schedule or provision compute; it observes runs that something else (a script, Kubernetes job, Slurm job, or orchestrator like **Kubeflow**) launches.
- **Serving models in production** — logging inference metrics is possible, but W&B is not a model-serving or feature-store platform.
- **Being a full MLOps pipeline by itself** — it is one important piece (experiment tracking, artifact versioning) of a larger MLOps stack that also needs CI/CD, deployment, and monitoring tooling; see the **MLOps** skill for the bigger picture.
- **Replacing data engineering** — Tables help you inspect data, but W&B is not a data warehouse or ETL system.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Instrument a PyTorch or Hugging Face training loop with wandb.init, wandb.log, and wandb.finish, and read the resulting dashboard.
2. Explain the run/project/entity hierarchy and organize experiments with tags, groups, and notes so a dashboard with hundreds of runs stays usable.
3. Configure and launch a W&B Sweep for hyperparameter search (grid, random, and Bayesian) and interpret parallel-coordinates and parameter-importance plots.
4. Version datasets and model checkpoints with W&B Artifacts and read a lineage graph to answer "what produced this file?"
5. Use W&B Tables to inspect per-example predictions, confusion patterns, and images/audio/embeddings during debugging.
6. Identify and avoid the most common production pitfalls: excessive logging overhead, unorganized runs, and treating W&B as "just a logger."
7. Compare W&B and MLflow along the axes that actually matter for a team decision: hosting model, cost at scale, UI polish, and self-hosting/compliance needs.
8. Integrate W&B into a CI/CD or automated retraining pipeline, including offline mode and API-key management for non-interactive environments.
9. Debug a run that is not appearing in the dashboard or a training loop that has stalled because of synchronous logging.
10. Design a monitoring and alerting setup around long-running training jobs using W&B's alerting features.
`,

  prerequisites: `
- **Required**: Python fluency (functions, dictionaries, decorators) and basic familiarity with training a neural network in PyTorch or a similar framework — this page assumes you know what an epoch, a loss function, and a training loop are. See the **Deep Learning** skill if these terms are new.
- **Required**: comfort with the command line for installing packages and running scripts (pip install, running a .py file).
- **Helpful**: a Weights & Biases account (free tier is sufficient for the examples on this page) — sign up at wandb.ai.
- **Helpful**: familiarity with **Fine-Tuning** workflows if your primary use case is tracking LLM fine-tuning runs rather than training-from-scratch experiments.
- **Helpful but not required**: exposure to **MLflow**, since much of this page draws contrasts with it; you do not need to have used MLflow first.

Dependency links: **Deep Learning** (training loop fundamentals) → this page → **MLOps** (how experiment tracking fits the larger production pipeline) and **Kubeflow** (orchestrating the training jobs that W&B observes).
`,

  "beginner-concepts": `
### Installing and authenticating

~~~bash
pip install wandb
wandb login   # opens a browser / prompts for an API key from wandb.ai/authorize
~~~

The API key is a secret — treat it like a password. In CI or containers, set it as an environment variable instead of running the interactive login:

~~~bash
export WANDB_API_KEY=your_key_here
~~~

### The core loop: init, log, finish

Every W&B integration follows the same three-call shape.

~~~python
import wandb
import random

# 1. Start a run. This creates a run record in the given project and
#    returns a Run object; config captures hyperparameters up front.
run = wandb.init(
    project="mnist-classifier",
    config={
        "learning_rate": 0.001,
        "epochs": 5,
        "batch_size": 64,
        "architecture": "CNN",
    },
)

# Read config back out — useful so the SAME variable drives both the
# training loop and the logged record, avoiding drift between the two.
config = run.config

for epoch in range(config.epochs):
    train_loss = 1.0 / (epoch + 1) + random.random() * 0.05
    val_accuracy = 0.7 + epoch * 0.05

    # 2. Log metrics. Each call is one "step" in the dashboard's x-axis
    #    by default; pass step= explicitly if you log from multiple loops.
    wandb.log({
        "epoch": epoch,
        "train_loss": train_loss,
        "val_accuracy": val_accuracy,
    })

# 3. Finish the run. Flushes any buffered data and marks the run complete
#    in the dashboard (otherwise it can show as "crashed" if the process
#    exits without calling this).
run.finish()
~~~

Open the printed run URL in a browser: you get a live-updating loss curve as soon as wandb.log is called, no dashboard configuration required.

### Projects, entities, and runs

- A **run** is one execution of your training script — one trial, one set of hyperparameters, one set of logged metrics.
- A **project** groups related runs (e.g. "mnist-classifier"). Comparisons and charts are scoped to a project.
- An **entity** is your username or your team's organization name — projects live under an entity.

~~~python
wandb.init(entity="my-team", project="mnist-classifier", name="baseline-cnn")
~~~

Giving each run an explicit, descriptive name (rather than the auto-generated one, like "smart-sunrise-12") pays off the moment you have more than a handful of runs.

### Logging images and other rich media

~~~python
import wandb

wandb.log({"examples": [wandb.Image(img, caption=f"pred={pred}") for img, pred in batch]})
~~~

This is the beginner's first taste of what separates W&B from a plain metrics logger: images, audio, histograms, and tables are first-class loggable objects, not an afterthought.

Common beginner trap: forgetting run.finish() (or the "with wandb.init(...) as run:" context-manager form) in a script that can raise an exception mid-training — the run is left dangling in the dashboard as "crashed," which is confusing when reviewing history later. Prefer the context-manager form for anything beyond a quick script.
`,

  "intermediate-concepts": `
### Config-driven training

Real projects centralize hyperparameters in one config object (often loaded from a YAML file or command-line arguments) and pass the whole thing to wandb.init so the exact configuration of every run is preserved automatically.

~~~python
import wandb
import yaml

with open("config.yaml") as f:
    cfg = yaml.safe_load(f)

with wandb.init(project="image-classifier", config=cfg) as run:
    model = build_model(run.config.architecture, run.config.dropout)
    optimizer = build_optimizer(model, run.config.learning_rate)

    for epoch in range(run.config.epochs):
        train_loss, train_acc = train_one_epoch(model, optimizer)
        val_loss, val_acc = validate(model)

        run.log({
            "epoch": epoch,
            "train/loss": train_loss,
            "train/accuracy": train_acc,
            "val/loss": val_loss,
            "val/accuracy": val_acc,
            "learning_rate": optimizer.param_groups[0]["lr"],
        }, step=epoch)
~~~

Note the "train/" and "val/" prefixes — W&B automatically groups metrics that share a prefix into the same dashboard panel section, which keeps a busy dashboard readable.

### Organizing runs at scale: tags, groups, and notes

Once a project has fifty or a hundred runs, an unorganized dashboard becomes useless — this is one of the most common real-world pitfalls (see Anti-Patterns). Use tags and groups deliberately:

~~~python
wandb.init(
    project="llm-finetune",
    tags=["lora", "7b", "experiment-batch-3"],
    group="learning-rate-sweep",   # runs in the same group can be compared as one unit
    job_type="train",               # distinguishes "train" runs from "eval" or "preprocess" runs
    notes="Testing whether a cosine schedule beats linear warmup on this dataset.",
)
~~~

Tags are filterable in the dashboard; groups let you see aggregate (mean/std) curves across a set of runs that share a purpose (e.g. five seeds of the same config), which is essential for distinguishing real improvement from run-to-run noise.

### Framework auto-logging integrations

W&B ships integrations that log common framework internals automatically, removing most manual wandb.log calls.

~~~python
# PyTorch Lightning
from pytorch_lightning.loggers import WandbLogger
trainer = Trainer(logger=WandbLogger(project="lightning-demo"))

# Hugging Face Transformers — just set the env var / TrainingArguments flag
from transformers import TrainingArguments
args = TrainingArguments(output_dir="out", report_to="wandb", run_name="bert-finetune")

# Keras
from wandb.integration.keras import WandbMetricsLogger
model.fit(X, y, callbacks=[WandbMetricsLogger()])
~~~

### Saving models and using wandb.watch

~~~python
import wandb

# Track gradients and parameter histograms during training — useful for
# diagnosing vanishing/exploding gradients, but has real overhead (see Performance).
wandb.watch(model, log="all", log_freq=100)

# Save the final model file as part of the run's artifacts
torch.save(model.state_dict(), "model.pt")
wandb.save("model.pt")
~~~

### Resuming and offline mode

~~~python
# Resume a crashed or preempted run by id — metrics continue on the same chart
wandb.init(project="long-training", id="abcd1234", resume="must")

# Offline mode: log locally (e.g. on a cluster with no internet), sync later
# export WANDB_MODE=offline
# wandb sync ./wandb/offline-run-xxxx
~~~

Offline mode is the practical answer for air-gapped clusters or environments with restricted egress — training never blocks on network availability, and the sync step happens afterward from a machine that does have access.
`,

  "advanced-concepts": `
### W&B Sweeps: automated hyperparameter search

A sweep is defined by a YAML (or dict) config describing the search space and method, then run by one or more "agents" that each pull a set of hyperparameters, run the training function, and report back.

~~~yaml
# sweep.yaml
program: train.py
method: bayes            # grid | random | bayes
metric:
  name: val_accuracy
  goal: maximize
parameters:
  learning_rate:
    distribution: log_uniform_values
    min: 0.0001
    max: 0.1
  batch_size:
    values: [16, 32, 64, 128]
  dropout:
    distribution: uniform
    min: 0.0
    max: 0.5
early_terminate:
  type: hyperband
  min_iter: 3
~~~

~~~bash
wandb sweep sweep.yaml            # registers the sweep, prints a sweep ID
wandb agent my-entity/my-project/SWEEP_ID   # run this on N machines/GPUs in parallel
~~~

Bayesian search models the relationship between hyperparameters and the target metric and proposes increasingly promising configurations, which typically finds a good region of the search space in far fewer trials than grid search — important when each trial is an expensive multi-GPU training run. The Hyperband early-termination policy kills clearly unpromising runs early, saving compute.

### W&B Artifacts: dataset and model lineage

Artifacts are versioned, content-addressed references to files or directories (datasets, model checkpoints, evaluation results). The key advanced idea is the **lineage graph**: because each run declares which artifacts it used (with use_artifact) and which it produced (with log_artifact), W&B can automatically construct a directed graph connecting raw data through every downstream training and evaluation run.

~~~python
import wandb

with wandb.init(project="pipeline-demo", job_type="preprocess") as run:
    artifact = wandb.Artifact("cleaned-dataset", type="dataset")
    artifact.add_dir("./data/cleaned")
    run.log_artifact(artifact)

with wandb.init(project="pipeline-demo", job_type="train") as run:
    dataset = run.use_artifact("cleaned-dataset:latest", type="dataset")
    data_dir = dataset.download()
    # ... train using data_dir ...

    model_artifact = wandb.Artifact("classifier", type="model")
    model_artifact.add_file("model.pt")
    run.log_artifact(model_artifact)
~~~

This answers, months later: "exactly which cleaned-dataset version, and which run that produced it, trained the model currently in production?" — a question that is otherwise nearly unanswerable once a team has iterated on data cleaning multiple times.

### W&B Tables for structured data debugging

Tables let you log a DataFrame-like structure with rich media in cells (images, audio, text) and interactively sort/filter/group it in the dashboard — the advanced use case is per-example error analysis.

~~~python
table = wandb.Table(columns=["image", "prediction", "ground_truth", "confidence"])
for img, pred, truth, conf in zip(images, predictions, labels, confidences):
    table.add_data(wandb.Image(img), pred, truth, conf)

wandb.log({"predictions": table})
~~~

In the dashboard you can then filter to "prediction != ground_truth" and visually scan the model's actual failure cases — far faster than writing a one-off script to dump misclassified examples to disk.

### Distributed and multi-process training

In distributed data-parallel training, only the rank-0 process should call wandb.init and wandb.log — every other rank logging independently creates duplicate, conflicting runs.

~~~python
import torch.distributed as dist

if dist.get_rank() == 0:
    wandb.init(project="distributed-training")

# ... training loop on all ranks ...

if dist.get_rank() == 0:
    wandb.log({"loss": loss.item()}, step=global_step)
~~~

### Decision table: which W&B feature for which problem

| Problem | Feature |
|---|---|
| "Which run had the best validation accuracy?" | Run comparison table / dashboard sort |
| "What hyperparameters actually matter?" | Sweeps + parallel coordinates / parameter importance panel |
| "What exact dataset trained this checkpoint?" | Artifacts lineage graph |
| "Why is the model wrong on these ten examples?" | Tables with filtering |
| "Alert me if training loss goes to NaN overnight" | wandb.alert / run alerting |
| "Share results with a non-technical stakeholder" | W&B Reports |
`,

  "internal-working": `
Understanding what actually happens between a wandb.log call and a chart updating in your browser clarifies both the performance characteristics and the failure modes of the system.

1. **wandb.init** creates a local run directory (typically under ./wandb/run-<timestamp>-<id>/), starts a background process/thread (historically an internal "sender" process communicating over a local socket, now a Rust-based core in modern client versions) responsible for all network I/O, and opens an authenticated connection to the W&B backend using your API key. Your training process itself is never blocked waiting on the network for this step beyond the initial handshake.
2. **wandb.log(dict)** does not synchronously make an HTTP request. It serializes the dict, timestamps it, assigns it to a step, and hands it to the background process via an internal queue. Your training loop continues immediately.
3. The **background process batches and streams** these logged points to the W&B backend over a persistent connection, retrying on transient network failures, and also writes them to a local file (the run's history) so that nothing is lost if the network is temporarily unavailable — this local file is also what "wandb sync" uploads later in offline mode.
4. The backend ingests each point into a time-series store keyed by (run id, metric name, step) and updates aggregate/summary statistics (e.g. the "summary" panel showing best/last value per metric).
5. The **frontend dashboard** is a reactive web app that subscribes to run updates; when you have a run's page open, new points appear via near-real-time updates rather than manual refresh, which is what produces the "live chart" experience.
6. On **wandb.finish()** (or process exit, or the context manager's __exit__), the background process flushes any remaining buffered data, marks the run's state as "finished" in the backend, and the process is allowed to exit cleanly. If the process is killed (OOM, SIGKILL, node preemption) before this happens, the run is left in a "crashed" or "running" state in the dashboard — this is precisely why cluster schedulers benefit from wandb.init(resume="allow") plus a cleanup hook.

~~~mermaid
sequenceDiagram
    participant Script as Training Script
    participant BG as Background Writer
    participant Disk as Local wandb/ dir
    participant API as W&B Backend
    participant UI as Dashboard (browser)

    Script->>BG: wandb.init() - handshake, create run
    BG->>API: authenticate, create run record
    API-->>BG: run id, urls

    loop every training step
        Script->>BG: wandb.log({...}) - async, non-blocking
        BG->>Disk: append to local history file
        BG->>API: stream batched points
        API->>UI: push update to open dashboard
    end

    Script->>BG: wandb.finish()
    BG->>Disk: flush remaining buffer
    BG->>API: mark run "finished"
~~~

The practical takeaway: because logging is asynchronous and locally buffered, wandb.log itself is cheap and safe to call frequently — but heavy payloads (large images, wandb.watch(log="all") on every step, huge Tables) still cost real CPU/memory/disk-IO time to serialize and write, which is the actual source of the "logging overhead slows training" pitfall, not the logging call's network behavior.
`,

  architecture: `
A production W&B setup has three layers, and understanding where each piece lives clarifies both the cost model and the operational responsibilities of each layer.

**1. Client layer (inside your training process/container)**
The wandb Python package embedded in your training code. Responsible for capturing config, buffering and locally persisting logged data, and talking to the backend. This is the only layer most engineers ever touch directly.

**2. Backend layer (hosted by W&B, or self-hosted)**
- **SaaS (wandb.ai)**: fully managed, multi-tenant, the default and lowest-friction option; data lives in W&B's cloud.
- **W&B Server / Dedicated Cloud**: self-hosted or single-tenant deployments (often Kubernetes-based) for teams with data residency, compliance, or network isolation requirements; you operate the storage and compute, W&B ships the software.
Either way the backend provides: a metadata/time-series store for run history, blob storage for artifacts (models, datasets, media) typically backed by an object store (S3-compatible), and the query/aggregation layer that powers dashboard comparisons.

**3. Frontend / collaboration layer**
The web dashboard, Reports (shareable write-ups embedding live charts), and team/permission management (who can see which projects, and who can write to them). This is what non-engineering stakeholders typically interact with — a report link, not the training script.

Recommended application structure for a team adopting W&B seriously:

~~~text
project-root/
  configs/                # sweep.yaml, per-experiment YAML configs
  src/
    train.py              # calls wandb.init/log/finish, imports config from configs/
    data_pipeline.py       # logs input datasets as Artifacts
    evaluate.py            # separate job_type="eval" runs, logs Tables of predictions
  scripts/
    launch_sweep.sh        # wraps wandb sweep + wandb agent for the cluster scheduler
  .wandb/ (gitignored)      # local run cache, only relevant for offline mode
~~~

Key architectural decision: keep wandb.init calls at the entry point of a run (one per job_type — train, eval, preprocess) rather than scattered ad hoc through library code, so that every run has one clear, top-level responsibility and job_type. This mirrors the same "keep side effects at the edges" discipline recommended for logging and metrics generally.
`,

  "data-flow": `
Trace a single hyperparameter sweep run end to end, since it exercises every major subsystem — Sweeps, Artifacts, and Tables together.

~~~mermaid
sequenceDiagram
    participant Sched as Sweep Controller (W&B backend)
    participant Agent as wandb agent (on GPU node)
    participant Train as train.py
    participant WB as W&B Client
    participant Backend as W&B Backend
    participant UI as Dashboard

    Sched->>Agent: assign next hyperparameter config (bayes-selected)
    Agent->>Train: launch with config injected as run.config
    Train->>WB: wandb.init(project, config)
    WB->>Backend: create run, register under sweep id
    Train->>WB: use_artifact("cleaned-dataset:latest")
    WB->>Backend: fetch/download dataset artifact
    loop training epochs
        Train->>WB: wandb.log({loss, accuracy, ...})
        WB->>Backend: stream metrics
        Backend->>UI: live update sweep parallel-coordinates plot
    end
    Train->>WB: log_artifact(model checkpoint)
    Train->>WB: wandb.log({"eval_table": Table(...)})
    Train->>WB: run.finish()
    WB->>Backend: mark run finished, report final metric to sweep controller
    Backend->>Sched: update Bayesian model with this run's result
    Sched->>Agent: assign next config (informed by all prior results)
~~~

Notice the feedback loop at the bottom: each finished run's final metric feeds back into the sweep controller's Bayesian model, which is why later runs in a Bayesian sweep are progressively better-targeted than earlier ones — this is fundamentally different from a static grid search, where every run's config is fixed up front regardless of what earlier runs revealed.
`,

  "production-usage": `
Real teams treat W&B as one node in a larger pipeline rather than a standalone tool. Typical production setup:

- **Config management**: hyperparameters live in version-controlled YAML/Hydra configs, not hardcoded in scripts; the same config dict is passed to both the model builder and wandb.init so the tracked record always matches what actually ran.
- **Environment capture**: W&B automatically captures the git commit hash, git diff (uncommitted changes), Python package versions, and hardware info for every run — teams rely on this instead of manually noting "which code version produced this" in a spreadadsheet.
- **job_type discipline**: runs are tagged job_type="train", "eval", "preprocess", or "sweep" so the dashboard can be filtered by pipeline stage.
- **Project-per-initiative, not project-per-run**: a project groups a coherent line of experimentation (e.g. "customer-churn-model-v2"); teams that create a new project per run lose all comparison ability.
- **Service accounts for automation**: CI/CD pipelines and scheduled retraining jobs authenticate with a dedicated service-account API key (not a human's personal key) so a departing employee's key rotation never silently breaks the retraining pipeline.
- **Artifact promotion workflow**: a model artifact is logged during training, then explicitly "linked" or promoted to a Model Registry / production alias (e.g. tagging an artifact version as "production") only after passing evaluation gates — this separates "a model that trained successfully" from "the model that is allowed to serve traffic."
- **Retention and cost management**: large media logging (images, audio) and Artifacts consume storage quota; teams set retention policies and avoid logging every training image at every step, logging a representative sample instead.
- **Offline-first for restricted clusters**: HPC/Slurm environments without outbound internet run in WANDB_MODE=offline and sync during a designated network-available window.

A minimal production training script pattern:

~~~python
import os
import wandb

def main():
    with wandb.init(
        project="fraud-detection",
        job_type="train",
        config=load_config(),
        tags=[os.environ.get("GIT_BRANCH", "unknown"), "prod-pipeline"],
    ) as run:
        model = train(run.config)
        metrics = evaluate(model)
        run.log(metrics)

        artifact = wandb.Artifact("fraud-model", type="model", metadata=metrics)
        artifact.add_file("model.pt")
        run.log_artifact(artifact)

if __name__ == "__main__":
    main()
~~~
`,

  "industry-examples": `
- **OpenAI** — used W&B in early research phases for tracking large-scale training experiments before building significant portions of bespoke internal tooling as their scale grew; a commonly cited case of "start with a hosted tool, build custom infrastructure only once you clearly outgrow it."
- **NVIDIA** — several research teams use W&B for tracking experiments across large model-training efforts, valuing the system-metrics integration (GPU utilization, memory, temperature) alongside model metrics for diagnosing training efficiency issues on large GPU clusters.
- **Toyota Research Institute** — has publicly discussed using W&B for tracking autonomous-vehicle perception model training, where reproducibility and lineage (which dataset version, which code commit) matter for safety-critical model auditing.
- **Cohere** and other foundation-model labs — have referenced using experiment tracking platforms including W&B for large language model pretraining and fine-tuning runs, where system-level metrics (throughput, GPU memory) are tracked alongside loss curves to catch training instabilities early.
- **Academic labs (fast.ai-adjacent and university research groups)** — widely adopted W&B specifically because of the free tier for individuals/academics and the near-zero integration friction, making it a common default in published deep learning research code.

Treat company-specific tooling claims as a snapshot: large AI labs frequently build or swap internal tooling as they scale, and public statements about "who uses what" age quickly. Verify current usage via each company's engineering blog before citing it as current fact in an interview or report.
`,

  "best-practices": `
1. **Name runs descriptively**, not the auto-generated adjective-noun name — a name like "lora-r8-lr2e-4-seed1" is instantly greppable months later; "silvery-dawn-42" is not.
2. **Use job_type consistently** ("train", "eval", "preprocess", "sweep-agent") so the dashboard can be filtered by pipeline stage without digging into run configs.
3. **Log the config once, at init**, and read hyperparameters back out of run.config in the training loop rather than from separate local variables — this guarantees the tracked record can never drift from what actually executed.
4. **Group related runs** (same config varied by seed, or all runs in one sweep) using the group parameter so the dashboard can show aggregate statistics, not just N separate noisy lines.
5. **Tag by experiment batch and by outcome** (e.g. "baseline," "ablation," "shipped") so future you can filter the graveyard of exploratory runs down to the ones that mattered.
6. **Log metrics with a consistent step/x-axis**, especially in multi-loop training (train step vs. eval epoch) — pass an explicit step= to wandb.log to avoid two different logging cadences silently overwriting each other's x-axis.
7. **Don't log every raw training image every step** — log a fixed, small sample (e.g. 8 images) at coarse intervals (every N epochs), and rely on Tables for deliberate deep dives instead of blanket high-frequency media logging.
8. **Use wandb.watch sparingly** — gradient/parameter histogram logging has real per-step overhead; reserve it for active debugging sessions, not routine production training runs.
9. **Version datasets as Artifacts, not just "a path on disk"** — a path can silently change contents; an Artifact version cannot, which is what makes lineage tracing trustworthy.
10. **Use service-account API keys in CI/CD**, never a personal key tied to one engineer's account, so pipeline health does not depend on an individual's account staying active.
11. **Set up alerts for long unattended runs** (e.g. wandb.alert on NaN loss or a stalled metric) rather than manually checking the dashboard periodically during multi-day training jobs.
12. **Treat Sweeps as the default hyperparameter search tool**, not a hand-rolled for-loop over configs — Bayesian search and early-termination policies save real compute on expensive training runs.
`,

  "anti-patterns": `
**Wrong: logging every training image at every step**

~~~python
# BAD — logs a full batch of images every single step; balloons storage,
# slows the training loop with serialization overhead, and produces an
# unusable, cluttered media panel in the dashboard.
for step, (images, labels) in enumerate(train_loader):
    wandb.log({"batch_images": [wandb.Image(img) for img in images]})
~~~

~~~python
# GOOD — log a small, fixed sample at coarse intervals.
if epoch % 5 == 0:
    sample = images[:8]
    wandb.log({"sample_images": [wandb.Image(img) for img in sample]}, step=epoch)
~~~

**Wrong: no tags, no groups, no job_type — the "everything is one flat list" dashboard**

~~~python
# BAD — six months in, this project has 400 identically-named runs with
# no way to tell a real experiment from a debugging scratch run.
wandb.init(project="my-model")
~~~

~~~python
# GOOD — organized from day one.
wandb.init(
    project="my-model",
    job_type="train",
    group="lr-ablation",
    tags=["ablation", "2026-q3"],
    name="lr-1e-4-bs64",
)
~~~

**Wrong: treating W&B as just a print-statement replacement**

Logging only the final loss and accuracy, and never using Artifacts, Sweeps, or Tables, throws away most of the platform's value: you get a slightly nicer chart than a spreadsheet, but you still cannot answer "which dataset version trained this?" or run an efficient hyperparameter search. Use the full workflow — Artifacts for lineage, Sweeps for search, Tables for debugging — or a lighter-weight logger may genuinely suffice.

**Wrong: forgetting to guard multi-GPU/multi-process logging**

~~~python
# BAD — every distributed worker calls wandb.init independently, creating
# duplicate, conflicting runs (or, worse, wandb.log calls racing each other).
wandb.init(project="ddp-training")
~~~

~~~python
# GOOD — only rank 0 talks to W&B.
if rank == 0:
    wandb.init(project="ddp-training")
~~~

**Wrong: hardcoding a personal API key in source code**

~~~python
# BAD — leaks credentials into git history.
wandb.login(key="a1b2c3d4e5f6...")
~~~

~~~python
# GOOD — read from environment, set via CI secret or a secrets manager.
# export WANDB_API_KEY=... (injected by CI, never committed)
wandb.login()
~~~
`,

  performance: `
Measure before optimizing: use your training framework's own step-time profiling (e.g. a simple time.perf_counter() around the training step, or PyTorch Profiler) to establish a baseline step time with W&B logging disabled entirely (WANDB_MODE=disabled), then compare against the same run with logging enabled. If the delta is negligible, stop — most scalar-metric logging is not the bottleneck.

Ordered optimization hierarchy when W&B logging IS measurably slowing training:

1. **Reduce logging frequency for expensive payloads.** Logging scalar loss/accuracy every step is cheap; logging images, histograms, or large Tables every step is not. Move expensive logging to every N steps or every epoch.
2. **Turn off or reduce wandb.watch frequency.** wandb.watch(model, log="all", log_freq=100) computes gradient and parameter histograms — genuinely useful for debugging vanishing/exploding gradients, but real per-step overhead when left on for full production runs. Use log="gradients" only, raise log_freq, or disable it once a training recipe is stable.
3. **Batch media logging.** Instead of one wandb.Image call per example in a loop, build a list and log it once per step/epoch — reduces serialization overhead.
4. **Avoid logging large raw tensors as generic Python objects.** Convert to appropriately-sized wandb.Image/wandb.Histogram objects rather than logging huge NumPy arrays as plain values.
5. **Use offline mode on clusters with slow or metered network egress**, syncing afterward, so the training loop is never waiting on upload bandwidth.
6. **For very high-frequency logging (e.g. thousands of steps/second in RL), aggregate client-side** (log a rolling mean every N steps) rather than logging every raw step — the dashboard cannot usefully render millions of points per chart anyway.

In practice, most reports of "W&B slows down training" trace back to wandb.watch(log="all") left on, or per-example image logging in a tight loop — not the core scalar-logging path, which is designed to be async and cheap (see Internal Working).
`,

  scalability: `
**Vertical (per-run) scalability**: a single run's own logging volume is bounded mainly by how much rich media (images, audio, large Tables) it logs per step — scalar metrics scale to very high step counts without issue since they're small, buffered, and streamed asynchronously.

**Horizontal (many concurrent runs) scalability**: this is where W&B's SaaS backend does the heavy lifting — thousands of concurrent runs across a team or sweep are the platform's actual design target, since a hosted multi-tenant service is built to absorb that fan-out. The main horizontal-scaling concern on the user's side is: distributed sweep agents (running the same wandb agent command on many machines/GPUs) coordinate through the central sweep controller, so throughput is bounded by how many parallel training jobs your compute cluster can actually schedule, not by W&B itself.

Bottleneck table:

| Layer | Typical bottleneck | Mitigation |
|---|---|---|
| Client (in-process) | Heavy media/histogram logging serialization | Reduce frequency, batch logging, disable wandb.watch(log="all") in production runs |
| Network | Metered/slow cluster egress | Offline mode + scheduled sync |
| Backend storage | Very large Artifacts (multi-TB datasets) repeatedly re-uploaded | Reference artifacts (pointers to existing S3/GCS objects) instead of copying data into W&B-managed storage |
| Dashboard rendering | Thousands of runs in one project view | Use tags/groups/filters; do not rely on scrolling a flat run list |
| Self-hosted backend (W&B Server) | Underprovisioned database/object storage for the team's scale | Size the deployment based on expected run volume and artifact storage, monitor like any other production service |

For genuinely massive-scale pretraining (thousands of GPUs, extremely high-frequency system metrics), teams often combine W&B for high-level experiment tracking and dashboards with lower-level, purpose-built cluster monitoring (Prometheus/Grafana for infrastructure metrics) rather than routing every low-level GPU telemetry point through W&B — a sensible division of responsibility rather than a limitation to work around.
`,

  security: `
W&B-specific attack surface and defenses:

- **API key leakage**: the wandb API key grants full account/project write access. Never commit it to source control, never hardcode it in a script, never log it to stdout. Use environment variables or a secrets manager, and rotate immediately if one leaks (treat it like any other credential leak — see the **Security** skill's general credential-handling guidance).
- **Overly broad project/team permissions**: default team settings can be more permissive than intended; explicitly configure who can view versus who can write to sensitive projects, especially ones tracking proprietary model architectures or customer data.
- **Sensitive data in logged artifacts**: it is easy to accidentally wandb.log or artifact.add_dir a directory that includes raw customer data, PII, or credentials embedded in a dataset. Review what a data pipeline actually logs before running it against production data; scrub or exclude sensitive fields at the source.
- **Self-hosted deployment hardening**: for W&B Server (self-hosted), the usual production Kubernetes/infrastructure security practices apply — network policies restricting access to the internal database and object storage, TLS termination, and regular patching of the deployed W&B Server version.
- **Third-party integration tokens**: integrations (e.g. Slack alerts, GitHub Actions) that connect to W&B should use scoped tokens with least-privilege access, reviewed periodically.
- **Data residency/compliance**: teams in regulated industries (healthcare, finance) should evaluate whether the SaaS product's data residency meets their compliance requirements, or whether a self-hosted/Dedicated Cloud deployment is required — verify current compliance certifications (SOC 2, HIPAA-readiness, etc.) directly with W&B rather than assuming, since certification status changes over time.

None of these are unique failure modes invented by W&B — they are the standard SaaS-credential and data-handling discipline that applies to any third-party platform a training pipeline talks to, just applied specifically to the wandb API key and logged artifact contents.
`,

  testing: `
Testing an ML pipeline's W&B integration is less about testing W&B itself (a hosted product you don't own) and more about testing that your code calls it correctly and degrades gracefully when it's unavailable.

~~~python
import os
import pytest
import wandb

def test_training_logs_expected_keys(monkeypatch):
    # Use offline mode in tests so no real network call/account is required.
    monkeypatch.setenv("WANDB_MODE", "offline")

    with wandb.init(project="test-project", mode="offline") as run:
        run.log({"loss": 0.5, "accuracy": 0.9})
        # Summary reflects the most recent logged value per key.
        assert run.summary["loss"] == 0.5
        assert run.summary["accuracy"] == 0.9

def test_training_survives_wandb_disabled(monkeypatch):
    # WANDB_MODE=disabled makes all wandb calls no-ops — verifies the
    # training loop does not crash if tracking is turned off entirely
    # (e.g. a quick local debugging run with no network).
    monkeypatch.setenv("WANDB_MODE", "disabled")
    run = wandb.init(project="test-project")
    run.log({"loss": 0.1})   # should not raise
    run.finish()

def test_config_matches_logged_hyperparameters():
    cfg = {"learning_rate": 0.001, "batch_size": 32}
    with wandb.init(project="test-project", config=cfg, mode="offline") as run:
        assert run.config.learning_rate == 0.001
        assert run.config.batch_size == 32
~~~

Senior testing doctrine: never let tests depend on a live network call to wandb.ai — use WANDB_MODE=offline or disabled in CI, and treat W&B the same way you'd treat any external SaaS dependency in a test suite (fake it or run it fully offline, don't hit the real API). Separately, keep at least one manual (not CI-run) smoke test that verifies a run actually appears correctly in the real dashboard after any significant change to logging code, since offline-mode tests cannot catch dashboard-rendering issues.
`,

  debugging: `
Escalation path when W&B tracking is not behaving as expected:

1. **Run not appearing in the dashboard at all** — check that wandb.init actually completed (network/auth issue) rather than the script crashing before it. Run with verbose output:
~~~bash
WANDB_DEBUG=true python train.py
~~~
Check ./wandb/latest-run/logs/debug.log locally for the client-side log of what was sent.

2. **Run stuck in "running" state after the script finished** — the process likely exited (crash, OOM-kill, node preemption) before wandb.finish() ran. Wrap the training entry point in the context-manager form ("with wandb.init(...) as run:") so run.finish() is called even on an exception, and/or use a cluster scheduler's job-completion hook to call wandb.finish() explicitly on termination signals.

3. **Metrics logged but chart looks wrong (steps out of order, overlapping x-axis)** — check whether multiple loops are logging without an explicit step= argument; two different logging cadences (e.g. per-batch and per-epoch) sharing the implicit step counter is the most common cause.

4. **"wandb: Network error" retries during training** — usually transient; the client retries automatically. If persistent, check outbound network/firewall rules (W&B needs HTTPS access to api.wandb.ai for SaaS), or switch to offline mode and sync later.

5. **Sweep agent not picking up new configs** — verify the agent is pointed at the correct entity/project/sweep-id triple, and check wandb agent's own stdout for whether it successfully polled the sweep controller.

6. **Local disk filling up** — the ./wandb/ directory retains local run history and can grow large over long-running or many-run experiments; periodically clean up old local run directories once you've confirmed they synced successfully (wandb sync verifies this).

Useful commands:

~~~bash
wandb status               # check login/connection status
wandb sync --clean         # sync any pending offline runs, then clean local files
tail -f wandb/latest-run/logs/debug.log   # live client-side log during a run
~~~
`,

  monitoring: `
What to monitor beyond the model's own accuracy/loss metrics:

- **System metrics**: W&B automatically captures GPU utilization, GPU memory, CPU usage, and network I/O for each run (no extra code required) — critical for diagnosing whether a training run is compute-bound, data-loading-bound, or memory-thrashing.
- **Training stability signals**: gradient norms, learning rate over time (especially with schedulers), and loss spikes — instrument explicitly if not covered by an auto-logging integration.
- **Alerting on anomalies**: use wandb.alert to push a notification (email/Slack, depending on configuration) when a run's metric crosses a threshold, without needing to babysit a dashboard during a multi-day training job.

~~~python
import wandb

with wandb.init(project="long-training") as run:
    for step, loss in training_loop():
        run.log({"loss": loss}, step=step)

        if loss != loss:  # NaN check — NaN != NaN is True
            run.alert(
                title="Training diverged",
                text=f"Loss became NaN at step {step}",
                level=wandb.AlertLevel.ERROR,
            )
            break
~~~

- **Sweep-level monitoring**: track how many sweep agent runs have completed versus how many are queued/running, and whether the Bayesian search is converging (via the sweep's parameter-importance panel) — a sweep that isn't converging after many runs may indicate a search space that's too wide or a metric that's too noisy.
- **Cost/quota monitoring**: for teams on usage-based plans, periodically review storage consumed by Artifacts (especially large datasets/checkpoints) — set up a lightweight periodic audit rather than discovering quota overages reactively.
`,

  deployment: `
W&B is a client library plus a hosted (or self-hosted) service, so "deployment" here means two things: getting the client correctly configured inside a production training container, and — for enterprises — deploying W&B Server itself.

Production-grade Dockerfile for a training container that reports to W&B:

~~~dockerfile
FROM python:3.11-slim

# Keep the image minimal; no interactive login should ever happen in a
# container — the API key arrives via a secret/environment variable at
# runtime, never baked into the image.
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

# Fail fast if the required env var is missing, rather than silently
# training with tracking disabled and only noticing after the fact.
ENV WANDB_PROJECT=fraud-detection
ENV WANDB_MODE=online

# The API key is injected at docker run time (or by the orchestrator's
# secret mechanism), never in the image:
#   docker run -e WANDB_API_KEY=... my-training-image
ENTRYPOINT ["python", "src/train.py"]
~~~

Per-line justification: pinning a slim base image keeps the attack surface and image size small; requirements are installed before copying source so Docker's layer cache is reused across code-only changes; the API key is deliberately absent from the image and every build argument, since anything baked into an image layer persists in the image history even if later "removed"; WANDB_MODE is set explicitly rather than relying on a default, so a misconfigured environment fails loudly (missing key) rather than silently training untracked.

For self-hosted **W&B Server** deployment (enterprise/compliance scenarios), W&B provides a Kubernetes-based deployment (via Helm charts in recent versions); this requires provisioning backing object storage (S3-compatible) and a database, and standard production Kubernetes practices apply — resource limits, network policies, and TLS termination at the ingress. Verify the current recommended deployment method (Helm chart, Terraform module, or managed Dedicated Cloud) directly with W&B's documentation, as self-hosting options have evolved.
`,

  "production-checklist": `
- [ ] All training entry points use the "with wandb.init(...) as run:" context-manager form so run.finish() always executes, even on exceptions.
- [ ] Project and job_type naming conventions are documented and followed (train/eval/preprocess/sweep-agent).
- [ ] API keys are stored in a secrets manager / CI secret store, never committed to source control or baked into container images.
- [ ] CI/CD and scheduled retraining jobs authenticate with a dedicated service-account key, not a personal account key.
- [ ] Datasets and model checkpoints are versioned as Artifacts, not referenced only by filesystem path.
- [ ] A clear promotion process exists distinguishing "a model that finished training" from "the model version marked for production" (registry alias or equivalent).
- [ ] Media/histogram logging frequency has been reviewed against training step-time overhead (see Performance).
- [ ] Distributed training correctly guards wandb.init/wandb.log to the rank-0 process only.
- [ ] Offline mode and a sync procedure are configured for any air-gapped or restricted-network compute environment.
- [ ] Alerts are configured for at least NaN/divergence detection on long-running training jobs.
- [ ] Team/project permissions have been reviewed so sensitive projects are not broadly writable/readable by default.
- [ ] A retention/cleanup policy exists for local ./wandb/ run directories and for old, unused Artifact versions.
- [ ] At least one manual dashboard smoke test is run after any change to logging code (automated offline tests cannot catch dashboard rendering issues).
- [ ] The team has agreed on tagging/grouping conventions before run volume grows past what a flat list can represent usefully.
`,

  "common-mistakes": `
1. **Not calling wandb.finish() (or using the context manager)** — runs get stuck as "crashed" or "running," muddying historical dashboards. Why: the background writer process needs an explicit signal to flush and close cleanly.
2. **Logging every raw image/batch at every step** — bloats storage and slows the training loop's serialization work. Why: media objects are far more expensive to serialize/upload than scalar floats.
3. **No tags/groups from the start** — teams promise "we'll organize it later" and never do, ending up with an unusable flat list of hundreds of runs. Why: retroactively tagging historical runs is tedious and usually just doesn't happen.
4. **Treating W&B as only a logger, ignoring Sweeps and Artifacts** — misses most of the platform's value and reinvents hand-rolled hyperparameter search or dataset versioning badly. Why: the full workflow (log, search, version) is what actually prevents lost/irreproducible results, not metrics alone.
5. **Hardcoding API keys** — a classic credential leak vector, especially in notebooks that get shared or committed. Why: notebooks are frequently checked into git or shared as-is, carrying the key with them.
6. **Multiple processes in distributed training all calling wandb.init** — creates duplicate/conflicting runs. Why: each process is unaware of its siblings unless explicitly coordinated via rank checks.
7. **Not passing an explicit step= across multiple logging loops** — causes charts with jumbled or overlapping x-axes. Why: wandb.log's implicit step counter increments per call, not per "logical" epoch/batch, when multiple loops interleave.
8. **Assuming the free tier's storage/run limits apply forever unchanged** — pricing and quotas are a business decision that changes over time; teams that don't periodically re-check current terms get surprised. Why: verify current tier limits directly with W&B rather than relying on memory of what the free tier included previously.
9. **Never reviewing what a data pipeline actually logs to Artifacts** — accidentally versioning sensitive/PII-containing data. Why: add_dir/add_file calls are easy to write broadly ("just log the whole folder") without auditing contents.
10. **Running wandb.watch(log="all") in every production training run indefinitely** — unnecessary and measurable overhead once a training recipe is stable and gradient debugging is no longer the active concern.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|---|---|---|
| "wandb: ERROR api_key not configured" | No login/API key set in a non-interactive environment (CI, container) | Set the WANDB_API_KEY environment variable, or run wandb login once interactively for local dev |
| Run stuck showing "Crashed" in the dashboard | Process exited (exception, OOM-kill, preemption) before wandb.finish() ran | Use "with wandb.init(...) as run:" so finish() always runs; handle termination signals in cluster jobs |
| "wandb: Network error (ConnectionError), entering retry loop" | Outbound network restricted or temporarily down | Check firewall/proxy rules for api.wandb.ai, or switch to WANDB_MODE=offline and sync later |
| Duplicate/conflicting runs from one distributed job | Every rank/process in DDP called wandb.init independently | Guard wandb.init/wandb.log behind an if rank == 0 check |
| Chart x-axis looks jumbled or steps overlap | Multiple logging loops share the implicit step counter | Pass an explicit step= argument consistently, or use separate metric prefixes per loop |
| "wandb: ERROR Run initialization has timed out" | Slow or blocked network on process start, or backend-side outage | Retry, check connectivity, or fall back to WANDB_MODE=offline for that run |
| Artifact download fails with a permissions error | The authenticated account/service key lacks read access to that project/entity | Check team/project permission settings; confirm the correct entity is referenced |
| Sweep agent exits immediately with no runs launched | Wrong entity/project/sweep-id triple passed to wandb agent | Copy the exact command printed by wandb sweep, don't hand-reconstruct it |
`,

  faqs: `
**Is W&B free?** There is a free tier suitable for individuals, students, and academic use with meaningful (though not unlimited) storage and tracking allowances; team/enterprise plans and self-hosted options are paid. Exact limits and pricing change over time — verify current terms on wandb.ai rather than relying on older figures.

**Do I need a W&B account to use it?** Yes for the hosted SaaS product; for fully offline/local-only use, WANDB_MODE=disabled turns every wandb call into a no-op, and WANDB_MODE=offline logs locally without an account interaction at run time (though syncing later still requires an account).

**Does W&B slow down training?** Scalar metric logging is asynchronous and cheap by design; measurable slowdown almost always traces to heavy media logging, wandb.watch(log="all"), or very high-frequency logging without client-side aggregation — see Performance.

**How is W&B different from TensorBoard?** TensorBoard is local-first, free, and framework-native (ships with TensorFlow/PyTorch tooling) but weaker at comparing many runs across machines/team members and has no built-in Sweeps, Artifacts, or Tables equivalent. W&B is hosted-first with much stronger cross-run comparison and a fuller workflow, at the cost of being a third-party dependency.

**Can I self-host W&B?** Yes, via W&B Server / Dedicated Cloud offerings aimed at enterprises with compliance or data-residency requirements; verify current deployment options and requirements directly with W&B, as self-hosting products and their names have evolved.

**Is W&B only for deep learning?** No — it works for any experiment with loggable metrics and configs, including classical ML (scikit-learn, XGBoost) and even non-ML numerical experiments, though its integrations and community usage skew heavily toward deep learning.

**How does W&B handle very large models/datasets in Artifacts?** Artifacts support "reference" mode, where the artifact stores a pointer to existing storage (e.g. an S3 path) rather than copying the data into W&B-managed storage — useful for multi-terabyte datasets that already live in a data lake.

**What happens to my data if I stop paying?** This depends on the current plan terms (data export windows, downgrade behavior); check the current terms of service directly rather than assuming, since this kind of policy is exactly the sort of detail that changes across pricing revisions.
`,

  "interview-questions": `
**Junior level**

1. *What problem does W&B solve that print statements or a spreadsheet don't?* — Model answer: durable, shareable, automatically-organized experiment records; comparison across many runs via a live dashboard rather than manual bookkeeping; captures config/environment/git state automatically so a result can always be traced back to exactly what produced it.

2. *What are the three core calls in a typical W&B integration?* — Model answer: wandb.init (start a run, capture config), wandb.log (record metrics/media during training), wandb.finish (mark the run complete and flush buffered data); the context-manager form combines init and finish safely.

3. *What is the difference between a run, a project, and an entity?* — Model answer: a run is one execution/trial; a project groups related runs for comparison; an entity is the user or team account the project belongs to.

4. *Why might a run show as "crashed" in the dashboard even though your training script actually finished successfully?* — Model answer: the process likely exited before wandb.finish() executed (e.g. an unhandled exception after logging but before an explicit finish call, or an OOM kill); using the context-manager form usually fixes this.

**Senior level**

5. *How would you design run organization for a team running thousands of experiments a month?* — Model answer: enforce job_type conventions, mandatory tags per experiment batch, project-per-initiative rather than project-per-run, groups for multi-seed comparisons, and a documented naming scheme; without this discipline the dashboard becomes unusable well before "thousands" is reached.

6. *Explain how W&B Sweeps' Bayesian method differs from grid search, and when you'd choose each.* — Model answer: Bayesian search models the relationship between hyperparameters and the target metric using results from completed runs and proposes progressively better-targeted configurations; grid search is exhaustive and embarrassingly parallel but wastes compute on clearly bad regions. Choose Bayesian when each trial is expensive (large models, long training) and grid/random when trials are cheap and you want guaranteed, uniform coverage of the space.

7. *How do you prevent duplicate/conflicting runs in distributed data-parallel training?* — Model answer: guard wandb.init and wandb.log behind a rank == 0 check so only one process reports to W&B; every other process trains normally but does not talk to the tracking backend.

8. *What's the difference between an Artifact and a raw file logged with wandb.save?* — Model answer: an Artifact is a versioned, content-addressed object with explicit lineage (which run produced it, which runs consumed it) supporting a dependency graph across a pipeline; wandb.save attaches a file to a specific run without that structured versioning/lineage model.

9. *A training run's step time got measurably slower after adding W&B logging. How do you diagnose it?* — Model answer: disable logging entirely (WANDB_MODE=disabled) to establish a delta, then re-enable incrementally — check for wandb.watch(log="all"), high-frequency image/histogram logging, or logging inside a tight per-example loop rather than batched/throttled.

10. *When would you choose MLflow over W&B, or vice versa, for a new team?* — Model answer (hedge appropriately): consider self-hosting/compliance requirements (MLflow's open-source, self-hostable-first model can be attractive when data cannot leave a private environment, though W&B also offers self-hosted options), existing tooling investment, team size and budget, and how much the team values dashboard polish and Sweeps/Artifacts maturity versus flexibility and avoiding vendor lock-in — both platforms have converged in capability over time, so re-evaluate current feature sets rather than relying on older comparisons.

11. *How would you version a dataset that changes weekly, and connect that to which models were trained on which version?* — Model answer: log each week's cleaned dataset as a new Artifact version (or use reference artifacts if the data lives in an external store), have each training run explicitly use_artifact the version it consumed, and rely on the resulting lineage graph to answer "which dataset version trained which model" without manual bookkeeping.

12. *How do you keep experiment tracking overhead from becoming a training bottleneck at scale (e.g., reinforcement learning with thousands of steps/second)?* — Model answer: aggregate metrics client-side (log a rolling mean every N steps rather than every raw step), avoid per-step media logging, and rely on the dashboard's inability to usefully render millions of points anyway as a natural ceiling — logging every point is neither useful nor necessary.
`,

  "coding-questions": `
**Problem 1: Instrument a training loop with proper run organization**

Given a bare PyTorch training loop, add W&B tracking with correct config capture, grouped/tagged runs, and safe cleanup on exceptions.

~~~python
import wandb
import torch

def train_model(config: dict, seed: int):
    torch.manual_seed(seed)

    with wandb.init(
        project="cifar10-experiments",
        config={**config, "seed": seed},
        group=f"lr-{config['learning_rate']}",   # group all seeds of one config
        tags=["ablation", "seed-sweep"],
        job_type="train",
    ) as run:
        model = build_model(run.config.architecture)
        optimizer = torch.optim.Adam(model.parameters(), lr=run.config.learning_rate)

        best_val_acc = 0.0
        for epoch in range(run.config.epochs):
            train_loss = run_train_epoch(model, optimizer)
            val_acc = run_validation(model)

            run.log({
                "epoch": epoch,
                "train/loss": train_loss,
                "val/accuracy": val_acc,
            }, step=epoch)

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(model.state_dict(), "best_model.pt")

        # Log the final best checkpoint as a versioned artifact.
        artifact = wandb.Artifact(
            "cifar10-classifier", type="model",
            metadata={"best_val_accuracy": best_val_acc},
        )
        artifact.add_file("best_model.pt")
        run.log_artifact(artifact)

        run.summary["best_val_accuracy"] = best_val_acc
~~~

Complexity/considerations: O(epochs) wandb.log calls, each O(1) amortized due to async buffering; the context manager guarantees run.finish() even if run_train_epoch raises. Follow-up: how would you modify this to run five seeds automatically and compare aggregate statistics in the dashboard? (Answer: launch five processes/calls with the same group and different seed, and use the dashboard's "group runs" view to see mean/std bands automatically.)

**Problem 2: Write a sweep configuration and launch script for a learning-rate and batch-size search**

~~~python
# sweep_config.py — build the sweep config programmatically, then launch it.
import wandb

sweep_config = {
    "method": "bayes",
    "metric": {"name": "val/accuracy", "goal": "maximize"},
    "parameters": {
        "learning_rate": {"distribution": "log_uniform_values", "min": 1e-5, "max": 1e-1},
        "batch_size": {"values": [16, 32, 64, 128]},
        "epochs": {"value": 10},   # fixed, not searched
    },
    "early_terminate": {"type": "hyperband", "min_iter": 3},
}

def train():
    with wandb.init() as run:   # config is injected by the sweep agent
        cfg = run.config
        val_acc = train_and_evaluate(cfg.learning_rate, cfg.batch_size, cfg.epochs)
        run.log({"val/accuracy": val_acc})

if __name__ == "__main__":
    sweep_id = wandb.sweep(sweep_config, project="lr-bs-search")
    wandb.agent(sweep_id, function=train, count=20)  # run 20 trials on this machine
~~~

Complexity/considerations: Bayesian search cost scales with the number of trials run, not the size of the search space directly, since it's a sequential, informed search rather than exhaustive enumeration. Follow-up: how would you parallelize this across four GPU machines? (Answer: run "wandb agent SWEEP_ID" — without the count argument, or with a shared count budget — on each machine; they all pull from the same central sweep controller, so no manual work-splitting is needed.)

**Problem 3: Build a debugging Table of misclassified examples**

~~~python
import wandb

def log_misclassifications(model, val_loader, class_names):
    table = wandb.Table(columns=["image", "predicted", "actual", "confidence"])

    model.eval()
    for images, labels in val_loader:
        with torch.no_grad():
            logits = model(images)
            probs = torch.softmax(logits, dim=1)
            preds = probs.argmax(dim=1)

        for img, pred, label, prob in zip(images, preds, labels, probs):
            if pred != label:
                table.add_data(
                    wandb.Image(img),
                    class_names[pred.item()],
                    class_names[label.item()],
                    prob[pred].item(),
                )

    wandb.log({"misclassified_examples": table})
~~~

Complexity/considerations: O(validation set size); only rows where prediction != label are added, keeping the table focused. Follow-up: how would you extend this to compare misclassifications across two model versions side by side? (Answer: log two separate Tables with a shared naming convention, e.g. "misclassified_v1" and "misclassified_v2," and use the dashboard's table comparison view, or join on image identity if you attach a stable example id column to each row.)
`,

  "hands-on-labs": `
**Lab 1 (Beginner): Instrument a basic training script**
Take an existing PyTorch or scikit-learn training script with no experiment tracking. Add wandb.init with a config dict, log training/validation metrics per epoch, and view the resulting live dashboard. Deliverable: a run URL showing a loss curve, plus a screenshot of the run's overview page showing captured git commit and config. Skills exercised: basic instrumentation, dashboard navigation.

**Lab 2 (Intermediate): Organize a multi-seed ablation study**
Run the same training config across five random seeds, grouped correctly, plus a second config varying one hyperparameter (e.g. learning rate) across the same five seeds. Use tags to distinguish the two ablation arms. Deliverable: a dashboard view showing the two groups' aggregate (mean/std) validation accuracy curves overlaid, with a written one-paragraph conclusion about which config performed better and how confident that conclusion is given the seed variance. Skills exercised: groups, tags, aggregate comparison reading.

**Lab 3 (Advanced): Run a Bayesian hyperparameter sweep with early termination**
Define a sweep over at least three hyperparameters with a Bayesian search method and a Hyperband early-termination policy, and run at least 20 trials (can be on a small/fast model to keep this affordable). Deliverable: the sweep's parallel-coordinates plot and parameter-importance panel, plus a written explanation of which hyperparameter mattered most and how early termination affected total compute used versus a full grid search estimate. Skills exercised: Sweeps configuration, Bayesian search interpretation, compute-cost reasoning.

**Lab 4 (Production): Build a full artifact-lineage pipeline**
Build a three-stage pipeline: (1) a preprocessing run that logs a cleaned dataset as an Artifact, (2) a training run that consumes that artifact and logs a model checkpoint artifact plus an evaluation Table of misclassified examples, and (3) an evaluation run that consumes the model artifact and produces a final metrics report. Deliverable: a screenshot of the resulting lineage graph in the W&B dashboard connecting all three runs, plus the Dockerfile used to containerize the training stage with proper API-key handling (env var, not hardcoded). Skills exercised: Artifacts, lineage tracing, production containerization, job_type discipline.
`,

  "real-projects": `
**Project 1: Reproducible ablation study framework**
Build a small framework around a model of your choice (image classifier, text classifier, or similar) that runs a configurable grid of ablations (architecture variant x learning rate x seed), logs every run to W&B with correct grouping/tagging, and produces an automated summary report (using the W&B API to pull final metrics programmatically) ranking configurations by mean validation performance with confidence intervals across seeds. Engineering requirements: config-driven (YAML), reproducible (fixed seeds, captured git state), and resilient to individual run failures (one crashed run shouldn't break the summary script).

**Project 2: End-to-end fine-tuning pipeline with lineage and promotion gates**
Build a pipeline that fine-tunes a small pretrained model (e.g. a small transformer) on a custom dataset, using Artifacts to version the dataset and the resulting fine-tuned checkpoint, a Sweep to search learning rate and LoRA rank (if applicable), and an explicit "promotion" step that only tags a model artifact as production-ready after it passes an automated evaluation threshold logged via a Table of held-out predictions. Engineering requirements: separation of train/eval job types, a service-account-style API key setup (even if run locally, structure the auth as if it were CI), and a written runbook describing how someone would roll back to a previous production model version using the artifact lineage graph.

**Project 3: Migrate a "spreadsheet tracking" legacy project to W&B**
Take (or simulate) a small project that currently tracks experiments in a spreadsheet or ad hoc log files, and migrate it to full W&B tracking, including backfilling historical results as runs where feasible (or clearly documenting what could not be backfilled and why). Engineering requirements: a migration write-up explaining the before/after organization scheme, and a dashboard Report (W&B's shareable report feature) summarizing the project's key findings for a non-technical stakeholder audience.
`,

  "case-studies": `
**Case study: the unorganized dashboard collapse**
A research team adopted W&B early with enthusiasm but no naming or tagging conventions. Within a few months, a single project accumulated hundreds of identically-auto-named runs, many of them abandoned debugging scratch runs mixed in with real experiments. Finding "the run that produced our best model" became a manual archaeology exercise, worse than before the team adopted any tracking tool. Lesson: a tracking tool only delivers value if the team invests upfront in organizational discipline (naming, tagging, job_type, groups) — the tool cannot retroactively impose structure on unstructured usage.

**Case study: silent training slowdown from full gradient logging**
A team left wandb.watch(model, log="all", log_freq=1) enabled (logging every single step) throughout a long production training run, originally added for one debugging session and never turned back off. Step times crept up gradually as gradient histograms accumulated, but the team initially suspected a data-loading regression and spent significant time investigating the wrong layer of the stack. Lesson: expensive logging configuration added for a specific debugging purpose should be explicitly removed or gated once its purpose is served, and step-time regressions should be diagnosed by first isolating whether tracking overhead is a factor (disable and compare) rather than assumed away.

**Case study: dataset lineage saving an incident post-mortem**
A team noticed a production model's performance had regressed compared to a prior version and needed to determine whether the regression came from a code change or a data change. Because their pipeline logged every training dataset as a versioned Artifact and every training run explicitly declared which dataset version it consumed, they were able to trace the regression to a dataset preprocessing change (a mislabeled subset introduced in a recent data refresh) within an hour, rather than the multi-day investigation it would otherwise have required. Lesson: the payoff of disciplined Artifact lineage is realized precisely during incidents, not during routine day-to-day training — it is insurance that only looks unnecessary until the day it isn't.

**Case study: hyperparameter search compute savings via Bayesian sweeps and early termination**
A team replaced a hand-rolled grid-search script (which exhaustively trained every combination in a large hyperparameter grid) with a W&B Sweep using Bayesian search and Hyperband early termination for an expensive-to-train model. They found a comparably good or better configuration in a meaningfully smaller number of completed full training runs, because clearly underperforming configurations were killed early and later trials were informed by earlier results. Lesson: for expensive training runs, informed search plus early termination is often a better default than exhaustive grid search, though the specific compute savings depend heavily on the search space and problem — treat this as a heuristic to test, not a guaranteed multiplier.
`,

  comparisons: `
| Dimension | W&B | MLflow | TensorBoard | Neptune.ai |
|---|---|---|---|---|
| Hosting model | Hosted-first (SaaS), with self-hosted/Dedicated Cloud options | Open-source, self-hostable-first; managed offerings exist via cloud providers/Databricks | Local-first, free, framework-bundled | Hosted-first (SaaS), similar positioning to W&B |
| Dashboard polish | Generally regarded as very polished, feature-rich UI | Functional, has improved significantly over time, historically less visually rich than W&B | Solid for single-run curves; weaker at cross-run comparison at scale | Polished, W&B-comparable in many reviews |
| Hyperparameter search | Sweeps (grid/random/Bayesian, early termination) built in | No first-class built-in sweep orchestrator (commonly paired with Optuna or Ray Tune) | None built in | Has its own comparable tooling |
| Dataset/model versioning | Artifacts with lineage graph | MLflow Model Registry + basic artifact logging; lineage tooling less visual than W&B's graph | None built in | Has its own artifact/versioning tooling |
| Rich data debugging | Tables (interactive, media-rich, filterable) | Less emphasis on this specific workflow | None built in | Comparable tooling exists |
| Open-source/self-hosting posture | Available but not the primary historical emphasis | Core open-source project, strong self-hosting story from the start | Fully open-source, always local | Primarily hosted, self-hosting more limited |
| Typical adoption context | Research labs, teams wanting minimal setup and strong visuals | Teams prioritizing full control, avoiding vendor lock-in, or already in the Databricks/MLflow ecosystem | Quick local debugging, framework-native use | Teams wanting a W&B-like experience, sometimes cost-driven alternative |

**How seniors choose**: the decision is rarely "which is objectively better" — both W&B and MLflow are mature, capable platforms whose feature sets have converged over time. Seniors weigh: (1) data residency/compliance constraints (self-hosting requirement pushes toward MLflow's open-source-first model or W&B's self-hosted tiers), (2) whether the team is already inside an ecosystem that biases the choice (e.g. already on Databricks, which ships MLflow natively), (3) budget and team size (free/individual use cases often favor W&B's polished free tier; large self-hosted deployments may favor MLflow's zero-licensing-cost open-source core), and (4) how much the team's workflow leans on Sweeps/Artifacts/Tables specifically versus wanting a lighter, more DIY-composable stack. Because both products actively add features and change pricing, re-verify current capabilities before treating this table as a permanent decision matrix — see the **MLflow** skill for the mirror-image comparison.
`,

  "related-technologies": `
- **MLflow** — the closest sibling platform; open-source and self-hostable-first, covering experiment tracking, a model registry, and model packaging/serving. Learn MLflow alongside W&B to understand the tradeoff space rather than treating either as a default answer.
- **Deep Learning** — the training-loop fundamentals (loss functions, optimizers, epochs, gradients) that W&B instruments; this page assumes that foundation.
- **Fine-Tuning** — a common and increasingly dominant real-world use case for W&B today: tracking LLM fine-tuning runs (LoRA ranks, learning rate schedules, evaluation metrics) rather than training models from scratch.
- **MLOps** — the broader discipline W&B is one piece of; experiment tracking and artifact versioning feed into CI/CD, deployment, and monitoring practices covered there.
- **Kubeflow** — a Kubernetes-native ML orchestration platform that can launch the training jobs W&B observes; W&B tracks experiments, Kubeflow (or a similar orchestrator) schedules and runs them.
- **Optuna and Ray Tune** — hyperparameter optimization libraries sometimes paired with MLflow (which lacks a built-in sweep orchestrator); understanding these clarifies what W&B Sweeps replaces when comparing platforms.
- **Docker and Kubernetes** — the containerization and orchestration layers that production training and W&B Server self-hosted deployments run on top of.
- **PyTorch Lightning and Hugging Face Transformers** — training frameworks with first-class W&B auto-logging integrations, reducing manual instrumentation to a config flag.

Suggested learning path: **Deep Learning** → this page (**Weights and Biases**) → **Fine-Tuning** (apply tracking to a real fine-tuning workflow) → **MLOps** (place experiment tracking in the larger production pipeline) → **Kubeflow** (orchestrate the jobs W&B observes at scale).
`,

  "latest-updates": `
This section reflects the author's knowledge as of the stated cutoff and should be verified against wandb.ai's changelog and blog before being treated as current fact, since W&B ships features and adjusts pricing/tiers on an ongoing basis.

As of the last verified period: W&B has continued investing in tooling aimed at large language model workflows — tracing and evaluation features layered on top of the core run-tracking product, reflecting the broader industry shift where a large share of new W&B usage is LLM fine-tuning and evaluation rather than classical from-scratch model training. Enterprise deployment options (Dedicated Cloud, self-hosted W&B Server) have continued to mature for organizations with compliance or data-residency requirements. Integrations with popular fine-tuning frameworks and the Hugging Face ecosystem have deepened, reducing the manual instrumentation needed for common LLM workflows.

Before making an architectural or purchasing decision based on any specific feature name, current pricing tier, or self-hosting requirement, check the current W&B documentation and pricing page directly — this is exactly the kind of detail that goes stale fastest and where an outdated assumption can lead to a real cost or compliance mistake.
`,

  "future-roadmap": `
Directionally, experiment tracking platforms including W&B are likely to keep expanding beyond "track a training run" toward broader "observe the full ML/AI system lifecycle" — encompassing LLM evaluation, prompt/trace observability for agentic and RAG systems, and tighter integration with model registries and deployment/serving layers, since that is where a large share of new AI engineering work is concentrated. Expect continued convergence between W&B and MLflow's feature sets, meaning the practical differentiators over time will lean more on hosting model, pricing, ecosystem lock-in, and UI/workflow preference than on any single platform having a unique capability the other categorically lacks.

What to bet career time on: the durable, transferable skill is not "W&B specifically" but **experiment tracking discipline** — knowing what to log, how to organize runs so a team stays productive at scale, how to version data/model lineage, and how to run systematic (not ad hoc) hyperparameter search. That mental model transfers directly to MLflow, Neptune, or whatever tool a given employer has standardized on. Learning W&B deeply is a highly efficient way to build that mental model given its polish and low integration friction, but treat the underlying practices, not the specific API, as the actual asset worth mastering.
`,

  "cheat-sheet": `
~~~python
import wandb

# --- Setup ---
# pip install wandb
# wandb login                     # interactive, local dev
# export WANDB_API_KEY=...        # CI / containers, non-interactive

# --- Core loop ---
with wandb.init(
    project="my-project",
    entity="my-team",             # optional: team/org name
    name="descriptive-run-name",  # not the auto-generated adjective-noun name
    job_type="train",             # train | eval | preprocess | sweep-agent
    group="ablation-batch-1",     # groups related runs (seeds, sweep members)
    tags=["baseline", "2026-q3"],
    config={"learning_rate": 1e-3, "batch_size": 32, "epochs": 10},
) as run:
    cfg = run.config
    for epoch in range(cfg.epochs):
        train_loss = train_one_epoch()
        val_acc = validate()
        run.log({"train/loss": train_loss, "val/accuracy": val_acc}, step=epoch)

    run.summary["best_val_accuracy"] = best_val_acc

# --- Media / rich logging ---
wandb.log({"examples": [wandb.Image(img, caption=str(pred)) for img, pred in batch]})
table = wandb.Table(columns=["image", "pred", "actual"])
table.add_data(wandb.Image(img), pred, actual)
wandb.log({"errors": table})

# --- Artifacts (dataset/model versioning + lineage) ---
artifact = wandb.Artifact("dataset-name", type="dataset")
artifact.add_dir("./data")
run.log_artifact(artifact)

used = run.use_artifact("dataset-name:latest", type="dataset")
path = used.download()

# --- Sweeps (hyperparameter search) ---
sweep_config = {
    "method": "bayes",                       # grid | random | bayes
    "metric": {"name": "val/accuracy", "goal": "maximize"},
    "parameters": {
        "learning_rate": {"distribution": "log_uniform_values", "min": 1e-5, "max": 1e-1},
        "batch_size": {"values": [16, 32, 64, 128]},
    },
    "early_terminate": {"type": "hyperband", "min_iter": 3},
}
sweep_id = wandb.sweep(sweep_config, project="my-project")
wandb.agent(sweep_id, function=train_fn, count=20)
# CLI equivalent: wandb sweep sweep.yaml && wandb agent ENTITY/PROJECT/SWEEP_ID

# --- Debugging / diagnostics / gradient watching (use sparingly, has overhead) ---
wandb.watch(model, log="gradients", log_freq=100)

# --- Alerts ---
run.alert(title="Training diverged", text="Loss went NaN", level=wandb.AlertLevel.ERROR)

# --- Modes ---
# WANDB_MODE=online    (default)  -- normal, streams live
# WANDB_MODE=offline              -- log locally, sync later: wandb sync ./wandb/offline-run-xxxx
# WANDB_MODE=disabled              -- every call becomes a no-op (tests, quick debug)

# --- Distributed training rule ---
# if rank == 0: wandb.init(...) / wandb.log(...)   -- only rank 0 talks to W&B
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What are the three core calls in a W&B integration? | wandb.init, wandb.log, wandb.finish (or the "with wandb.init(...) as run:" context manager) |
| What is a "run" in W&B? | One execution/trial of your training script, with its own metrics, config, and artifacts |
| What groups related runs for comparison in the dashboard? | A project; runs live under a project, projects live under an entity (user or team) |
| What does the group parameter do? | Lets the dashboard show aggregate statistics (mean/std) across a set of related runs, e.g. multiple seeds of one config |
| What is a W&B Sweep? | An automated hyperparameter search (grid, random, or Bayesian) coordinated by a central controller and run by one or more agents |
| What does Hyperband early termination do in a Sweep? | Kills clearly underperforming trials early to save compute, informed by how similar trials have progressed |
| What is a W&B Artifact? | A versioned, content-addressed reference to a dataset, model, or other file/directory, with lineage tracking which runs produced/consumed it |
| What is a W&B Table used for? | Interactive, filterable logging of structured, media-rich data — e.g. per-example predictions for error analysis |
| Why is wandb.log asynchronous/non-blocking? | Logged data is buffered and handed to a background process for network I/O, so the training loop is not blocked waiting on the network |
| What is the most common cause of measurable training slowdown from W&B? | Heavy media/histogram logging (e.g. wandb.watch(log="all") or per-step image logging), not the core scalar-logging path |
| Why should only rank 0 call wandb.init in distributed training? | To avoid every process creating duplicate, conflicting runs |
| What environment variable puts W&B in offline mode? | WANDB_MODE=offline (sync later with wandb sync); WANDB_MODE=disabled makes all calls no-ops |
| Why might a completed run show as "Crashed" in the dashboard? | The process exited (exception, OOM-kill, preemption) before wandb.finish() ran |
| What is the key structural difference between W&B and MLflow? | W&B is hosted-first with a polished UI and built-in Sweeps/Artifacts/Tables; MLflow is open-source and self-hostable-first — though both have converged in capability over time |
| What should never be hardcoded in training source code? | The W&B API key — use environment variables or a secrets manager instead |
`,

  mcqs: `
**1. What happens if a training process is killed (e.g. OOM) before wandb.finish() is called?**
A) The run is silently deleted
B) The run shows as "crashed" or stuck "running" in the dashboard
C) W&B automatically retries the entire training run
D) Nothing — finish() is not required

*Answer: B. Explanation: wandb.finish() is what flushes any remaining buffered data and marks the run's state as complete; without it, the run's last known state (running) persists in the dashboard, appearing as crashed/stuck. Using the context-manager form of wandb.init mitigates this.*

**2. Which W&B feature is best suited for tracing exactly which dataset version trained a specific model checkpoint?**
A) Tables
B) Sweeps
C) Artifacts (with use_artifact/log_artifact lineage)
D) wandb.watch

*Answer: C. Explanation: Artifacts are versioned and support explicit lineage declarations (use_artifact for consumption, log_artifact for production), which W&B assembles into a queryable lineage graph — exactly the "what produced this?" question.*

**3. In distributed data-parallel training, what is the correct pattern for W&B logging?**
A) Every process calls wandb.init and wandb.log independently
B) Only the rank-0 process calls wandb.init and wandb.log
C) Only the last process to finish calls wandb.log
D) W&B automatically deduplicates logs from multiple processes with no code change needed

*Answer: B. Explanation: guarding wandb.init/wandb.log behind a rank == 0 check prevents duplicate, conflicting runs; W&B does not automatically deduplicate independent init calls from multiple processes.*

**4. Why is wandb.log generally considered cheap to call frequently?**
A) It never actually sends data over the network
B) Logged data is asynchronously buffered by a background process, not synchronously sent per call
C) It only supports logging once per epoch
D) It compresses all data before logging, eliminating overhead

*Answer: B. Explanation: wandb.log hands data to a background writer/queue rather than blocking on a network request; measurable overhead typically comes from expensive payloads (media, histograms), not the logging call's control flow itself.*

**5. A team's W&B dashboard has become an unusable flat list of hundreds of runs. What is the most direct fix?**
A) Delete W&B and switch tools
B) Adopt (and retroactively where feasible apply) tags, groups, and job_type conventions
C) Reduce the number of experiments run
D) Disable the dashboard's run list view

*Answer: B. Explanation: the core issue is organizational discipline, not a platform limitation — tags, groups, and job_type are precisely the mechanisms designed to keep large numbers of runs navigable; the tool cannot impose this structure automatically.*

**6. What is a key practical difference between W&B and MLflow that should inform a team's choice (hedged appropriately)?**
A) MLflow cannot log metrics at all
B) W&B has historically leaned hosted-first with a polished free tier, while MLflow is open-source and self-hostable-first, though both have added capabilities that narrow this gap over time
C) W&B is only usable with TensorFlow
D) MLflow requires no installation while W&B requires a paid license for any use

*Answer: B. Explanation: this is the accurate, hedged framing — hosting model and open-source posture are real historical differentiators, but both platforms have evolved, so absolute claims (like C or D) are inaccurate and should be avoided.*
`,

  "revision-notes": `
Weights & Biases (W&B) is an experiment tracking and collaboration platform built around a simple loop — wandb.init to start a run and capture config, wandb.log to stream metrics and media during training, and wandb.finish to close the run out — that turns what used to be spreadsheet-and-print-statement bookkeeping into a live, shareable, automatically organized dashboard. It was founded in 2017 by Lukas Biewald, Chris Van Pelt, and Shawn Lewis, who had seen ML teams lose track of experiments at their prior company and built W&B specifically to make tracking a hosted service rather than a personal habit.

Beyond basic logging, the platform's real depth is in three additional systems: Sweeps automate hyperparameter search (grid, random, or Bayesian with early termination), Artifacts version datasets and models with an explicit lineage graph answering "what produced this file, and what consumed it," and Tables allow interactive, media-rich, row-level data debugging — filtering to exactly the examples a model gets wrong. Internally, logging is asynchronous: wandb.log hands data to a background process that buffers, locally persists, and streams it, which is why scalar logging is cheap but heavy media/histogram logging (especially wandb.watch(log="all")) is the actual, measurable source of training slowdown when it occurs.

Production discipline matters more than any single feature: descriptive run names, consistent job_type and tag/group conventions, config-driven runs (not hardcoded hyperparameters), service-account API keys in CI rather than personal keys, and guarding distributed training so only rank 0 talks to W&B. The most common real-world failure modes are entirely organizational or configurational rather than platform limitations — unorganized dashboards that become unusable at scale, and treating W&B as merely a fancier print statement rather than using Sweeps and Artifacts for the full workflow.

W&B's closest comparison is MLflow: W&B has historically leaned hosted-first with a more polished dashboard and built-in Sweeps/Artifacts/Tables, while MLflow leans open-source and self-hostable-first; both have converged in capability over time, so the real decision axes for a team are compliance/data-residency needs, existing ecosystem lock-in, budget, and workflow preference rather than one being categorically superior.

The durable, transferable skill is experiment-tracking discipline itself — what to log, how to organize runs at scale, how to version data/model lineage, and how to run systematic rather than ad hoc hyperparameter search — which carries directly into MLflow, Neptune, or any future tool, making W&B an efficient vehicle for building that mental model even if the specific product a given employer uses differs.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: install wandb, run wandb login, instrument a simple script (any small model — a PyTorch MNIST classifier is a good default) with wandb.init/wandb.log/wandb.finish. Milestone: a run URL with a live loss curve and correctly captured config.

**Week 2 — Organization at scale**: run the same config across five seeds and one hyperparameter variation, using group and tags correctly. Practice reading the dashboard's aggregate comparison view. Milestone: a dashboard view showing mean/std bands across grouped runs, with a written conclusion about whether an observed difference is real or noise.

**Week 3 — Sweeps**: define and run a Bayesian hyperparameter sweep with an early-termination policy across at least three hyperparameters. Milestone: a parameter-importance panel and a written explanation of which hyperparameter mattered most.

**Week 4 — Artifacts and Tables**: build a small pipeline with a preprocessing stage that logs a dataset Artifact, a training stage that consumes it and logs a model Artifact plus an error-analysis Table. Milestone: a lineage graph screenshot connecting the pipeline's stages, and a Table showing misclassified examples.

**Week 5 — Production hardening**: containerize a training script with proper API-key handling (environment variable, never hardcoded), add offline-mode support, add a NaN-divergence alert, and write a short runbook for what to do if a run gets stuck "crashed." Milestone: a Dockerfile that runs correctly with WANDB_API_KEY injected at runtime, and a documented recovery procedure.

**Week 6 — Comparative judgment**: read the MLflow skill page and write a one-page comparison for a hypothetical team's specific constraints (e.g. "a startup with no compliance requirements" versus "a healthcare company needing on-prem data"), reasoning through which platform you'd recommend and why.

Next platform skill: once experiment tracking is second nature, move to **MLOps** to place this piece inside the larger production ML lifecycle — CI/CD for models, deployment strategies, and production monitoring — or to **Fine-Tuning** to apply everything learned here directly to tracking LLM fine-tuning runs.
`,

  "official-docs": `
- **W&B Documentation (docs.wandb.ai)** — the primary reference for the Python SDK, Sweeps configuration syntax, Artifacts API, and Tables; start here for anything version-specific, since API details change across releases.
- **W&B Quickstart guides** — the fastest path from zero to a first tracked run; useful as a live-alongside reference while working through the Beginner Concepts section of this page.
- **W&B GitHub repository (wandb/wandb)** — the actual client source code; useful for understanding exact behavior of edge cases (e.g. what resume="allow" versus resume="must" actually does) beyond what prose documentation covers.
- **W&B Sweeps documentation** — the authoritative reference for sweep configuration syntax (method, parameters, distributions, early_terminate) — verify exact YAML schema here rather than from memory, since it has evolved across versions.
- **W&B Server / self-hosting documentation** — for teams evaluating self-hosted or Dedicated Cloud deployment; check current deployment mechanisms (Helm charts, Terraform) directly here, as this area changes.
- **W&B pricing page** — verify current free-tier limits and paid-tier pricing directly rather than relying on any cached figure, since this changes over time.
`,

  books: `
- **"Designing Machine Learning Systems" by Chip Huyen** — not W&B-specific, but the best available treatment of why experiment tracking, versioning, and reproducibility matter as part of a full production ML system; read this to understand the "why" behind tools like W&B and MLflow.
- **"Machine Learning Design Patterns" by Lakshmanan, Robinson, and Munn** — covers reproducibility and experiment management patterns applicable regardless of which specific tracking tool a team adopts.
- **"Building Machine Learning Powered Applications" by Emmanuel Ameisen** — practical, engineering-focused coverage of the ML product lifecycle, useful context for where experiment tracking fits alongside the rest of a shipped system.
- **W&B's own official documentation and tutorials** — functionally the closest thing to an authoritative "book" for this specific tool, since no major published book is dedicated solely to W&B; treat docs.wandb.ai as the primary text and supplement with the above for the surrounding MLOps context.
`,

  blogs: `
- **The official W&B blog (wandb.ai/site/articles or the Fully Connected blog)** — high-signal for new feature announcements, integration guides, and applied case studies written by the W&B team itself; always check the publication date given how fast features change.
- **W&B Reports gallery** — a collection of public, shareable W&B Reports written by users and the W&B team demonstrating real experiment analyses; useful for seeing the Reports feature used well, not just described.
- **Individual ML engineering blogs covering MLOps tool comparisons** — search for recent (dated) comparisons of W&B versus MLflow versus Neptune rather than relying on any single older post, since the competitive landscape shifts; cross-reference multiple recent sources rather than trusting one blog's framing.
- **Hugging Face blog posts on training large models** — frequently reference experiment tracking practices (including W&B integration) in the context of real fine-tuning and pretraining workflows.
`,

  "research-papers": `
Experiment tracking as a category is primarily an engineering/tooling discipline rather than a research subfield with a dedicated body of foundational papers, so this section is intentionally thin on W&B-specific papers — treat that as an honest gap rather than a search failure. The closest foundational and adjacent reading:

- **"Hidden Technical Debt in Machine Learning Systems" (Sculley et al., NeurIPS 2015)** — the foundational paper articulating why ML systems accumulate unique technical debt (including the exact "which run produced this" and reproducibility problems that tools like W&B exist to address); the single most relevant paper to read to understand the motivation behind experiment tracking as a category.
- **Papers on Bayesian optimization for hyperparameter tuning** (e.g. Snoek, Larochelle, and Adams, "Practical Bayesian Optimization of Machine Learning Algorithms," NeurIPS 2012) — the algorithmic foundation underlying W&B Sweeps' Bayesian search method; useful for understanding what's actually happening when a sweep "gets smarter" over successive trials.
- **Papers on Hyperband** (Li et al., "Hyperband: A Novel Bandit-Based Approach to Hyperparameter Optimization," JMLR 2018) — the algorithm behind W&B Sweeps' early_terminate: type: hyperband option; read this to understand precisely how and why early termination decisions are made.

For W&B-specific technical detail beyond these adjacent foundations, the client's own source code and official documentation are the more accurate and current reference than any academic paper.
`,

  videos: `
- **W&B's own YouTube channel ("Weights & Biases")** — official tutorials, Sweeps walkthroughs, and Artifacts deep-dives directly from the team building the product; the most reliably current video source given how quickly features change.
- **Conference talks from ML practitioners on reproducibility and experiment tracking** (search recent MLOps-focused conference recordings, e.g. from MLOps World or similar) — useful for seeing how real teams structure tracking practices, though verify the speaker's context (team size, use case) matches your own before adopting their conventions wholesale.
- **fast.ai course material** — historically a heavy adopter and demonstrator of W&B in applied deep learning teaching contexts; useful for seeing tracking used naturally inside a full training workflow rather than in isolation.
- Search for recent (dated within the last year or two at time of viewing) "W&B vs MLflow" comparison videos specifically, and prefer ones that show live product usage over ones that only discuss marketing claims, since the two platforms' feature sets change fast enough that older comparison videos go stale.
`,

  "github-repos": `
- **wandb/wandb** — the official Python client source code; the ground truth for exact SDK behavior, and useful for reading how internals like the background writer process and offline sync actually work.
- **wandb/examples** — official example repository covering integrations across PyTorch, TensorFlow/Keras, Hugging Face, and more — the fastest way to see a working integration for a specific framework rather than adapting general prose examples.
- **wandb/wandb-server** or relevant self-hosting deployment repositories — for teams evaluating self-hosted W&B Server, check the current officially maintained deployment repository/Helm chart rather than an older mirrored config.
- **huggingface/transformers** — search its Trainer/TrainingArguments source for report_to="wandb" handling to see exactly what the Hugging Face integration auto-logs.
- **Lightning-AI/pytorch-lightning** — search for WandbLogger in its loggers module to see the auto-logging integration's actual implementation.
- **optuna/optuna** and **ray-project/ray (Ray Tune)** — useful comparison repositories when evaluating "W&B Sweeps versus a standalone hyperparameter search library paired with MLflow or plain logging."
- **mlflow/mlflow** — the direct sibling project; reading its architecture clarifies exactly where it converges with and diverges from W&B's design (see the **MLflow** skill).
`,

  "practice-problems": `
Ordered by the skill this page's Learning Objectives target:

1. **Basic instrumentation**: take any existing training script with no tracking and add wandb.init/log/finish correctly, including the context-manager safety pattern.
2. **Organization discipline**: simulate 50 runs (can be trivial/fast training) across five configs and ten seeds, and organize them with groups/tags such that the dashboard clearly shows which config wins on average.
3. **Sweep design**: write a sweep config searching four hyperparameters with a Bayesian method and Hyperband early termination; run it and identify the most important hyperparameter from the resulting panel.
4. **Artifact lineage**: build a two-stage pipeline (preprocess -> train) with correct use_artifact/log_artifact calls, and verify the resulting lineage graph is correct.
5. **Table-based debugging**: given a trained classifier, build a Table of misclassified examples with at least three informative columns (e.g. image, predicted, actual, confidence).
6. **Distributed-safety debugging**: given a (intentionally broken) multi-process training script where every rank calls wandb.init, fix it to guard correctly on rank 0.
7. **Performance diagnosis**: given a training loop with wandb.watch(log="all", log_freq=1) left on, measure the step-time delta with and without it, and rewrite it to reduce overhead while preserving useful gradient visibility.
8. **Comparative reasoning**: given a hypothetical team's constraints (compliance requirement, budget, team size), write a short justified recommendation choosing between W&B and MLflow.

External practice sets: W&B's own official tutorial notebooks (docs.wandb.ai tutorials) provide guided, checkable exercises for Sweeps and Artifacts specifically; Kaggle competition notebooks that use W&B integration are a good source of realistic, messy real-world instrumentation examples to read and critique.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Cluster["Training Cluster / Compute"]
        direction TB
        Job1["Training Job (rank 0)"] -->|wandb client| Buf1["Local buffer + history file"]
        Job2["Training Job (rank 1..N)"] -.->|no W&B calls, rank-guarded| Buf1
        Sweep["wandb agent (sweep worker)"] --> Job1
    end

    Buf1 -->|async stream| Backend

    subgraph Backend["W&B Backend (SaaS or self-hosted W&B Server)"]
        direction TB
        Ingest["Metrics/Config Ingest"] --> TSDB["Time-series metadata store"]
        Ingest --> ObjStore["Object storage (Artifacts: datasets, checkpoints, media)"]
        SweepCtrl["Sweep Controller (Bayesian model)"]
        TSDB --> SweepCtrl
        SweepCtrl -->|next config| Sweep
    end

    TSDB --> Dashboard["Dashboard (live charts, comparisons, Tables)"]
    ObjStore --> Dashboard
    Dashboard --> Reports["Reports (shareable write-ups)"]
    Dashboard --> Users["Team members / stakeholders (browser)"]

    ObjStore -->|use_artifact| Job1
~~~

This diagram traces the reference production shape: only one process per distributed job talks to W&B (rank-0 guard), sweep agents are informed by a central Bayesian controller, all data lands in a backend that separates time-series metadata from blob/object storage for artifacts, and the dashboard/Reports layer is what non-engineering stakeholders actually consume.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Weights & Biases))
    Foundations
      What it is
        Experiment tracking platform
        Hosted-first, self-hosted options
      History
        Founded 2017
        Biewald, Van Pelt, Lewis
      Why it exists
        Replaces spreadsheets/print statements
        Reproducibility and comparison at scale
    Core Workflow
      wandb.init
        project / entity / run
        config capture
      wandb.log
        metrics
        media (images, audio, histograms)
      wandb.finish
        context manager safety
    Advanced Features
      Sweeps
        grid / random / bayes
        Hyperband early termination
      Artifacts
        dataset versioning
        model versioning
        lineage graph
      Tables
        row-level debugging
        filter misclassifications
      Reports
        shareable write-ups
    Internals
      Async background writer
      Local buffering / offline mode
      Live dashboard streaming
    Production Practice
      job_type discipline
      tags and groups
      service-account API keys
      distributed rank-0 guard
      offline mode for restricted clusters
    Pitfalls
      Excessive media/gradient logging overhead
      Unorganized runs at scale
      Treating it as just a logger
    Ecosystem
      MLflow comparison
      Fine-Tuning use cases
      MLOps context
      Kubeflow orchestration
~~~
`,
};

export default wandb;
