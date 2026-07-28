import type { SkillContent } from "../types";

const airflow: SkillContent = {
  overview: `
Apache Airflow is an open-source platform for authoring, scheduling, and monitoring workflows expressed as code — specifically, as Directed Acyclic Graphs (DAGs) of tasks written in Python, where each task represents one unit of work and the edges between tasks represent dependencies. Airflow's job is orchestration: deciding what runs, in what order, on what schedule, with what retries, and what happens when something fails — it is deliberately NOT a data processing engine itself. The actual heavy computation (transforming a terabyte of data, running a distributed join) is delegated to other systems, most commonly **Spark**, a sibling skill on this platform, or a data warehouse, while Airflow's role is purely to coordinate when and in what order that computation happens.

For an AI engineer, Airflow is the backbone underneath most production data and ML pipelines: the nightly job that pulls raw events from a warehouse, transforms them, and refreshes a feature store; the weekly retraining pipeline that waits for new labeled data to land, kicks off a training job on a GPU cluster, evaluates the resulting model, and promotes it if it beats the current champion; the pipeline that waits for an upstream team's export to appear in cloud storage before starting its own processing. Airflow makes these workflows explicit, versioned, testable, and observable, instead of being scattered across ad hoc cron jobs and shell scripts with no shared visibility into what ran, what failed, or why.

Key characteristics: **DAGs as code**, workflows are Python programs, giving you the full expressiveness of a real programming language (loops, conditionals, parameterization, dynamic DAG generation) instead of a static configuration file; **explicit dependencies**, task ordering is declared, not implied by execution order in a script, so the scheduler can reason about what can run in parallel; **operators**, reusable, pluggable units of work (running a Python function, executing a bash command, waiting for a file to appear, submitting a Spark job) that abstract away the "how" of a task from the "when" and "in what order"; **retries and backoff**, failures are a first-class, configurable concept rather than something each pipeline author has to hand-roll; and a **rich scheduler/executor architecture** that separates "what should run" from "where it actually runs," letting Airflow scale from a single laptop to a cluster processing thousands of tasks a day. This page assumes familiarity with the **Python** skill and connects forward to **Spark** (the processing engine Airflow commonly orchestrates), **Kubeflow** (a sibling orchestration platform focused specifically on ML pipelines on Kubernetes), **MLOps** and **Data Pipelines** (the broader disciplines Airflow operationally supports), and **Kubernetes** (a common deployment target for Airflow's executors).
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2014 | Airflow is created at **Airbnb**, addressing the internal need to schedule and monitor an increasingly complex web of internal data pipelines that had outgrown ad hoc cron jobs |
| 2015 | Airbnb open-sources Airflow |
| 2016 | Airflow joins the **Apache Software Foundation** as an incubating project |
| 2019 | Airflow graduates to a **Top-Level Apache project**, reflecting its broad adoption and mature governance |
| 2020 | **Airflow 2.0** is released, a significant rework including a new, higher-availability scheduler, a redesigned REST API, and the introduction of the **TaskFlow API**, a more Pythonic decorator-based way to author DAGs alongside the original, classic operator-based style |
| 2020s | Managed Airflow offerings mature and proliferate — **Amazon MWAA** (Managed Workflows for Apache Airflow), **Google Cloud Composer**, and **Astronomer's** managed platform all let teams run Airflow without operating the underlying infrastructure themselves |
| 2020s–present | Continued evolution of the TaskFlow API, dataset/asset-aware scheduling (triggering DAGs based on data availability rather than only fixed schedules), and ongoing scheduler performance and UI improvements across successive Airflow 2.x releases |

Airflow's history reflects a consistent pattern: born from a single company's internal pain (Airbnb's own sprawling pipeline complexity), open-sourced, and then shaped by the far broader set of demands from an entire industry's worth of data and ML teams, eventually maturing enough that "just run someone else's managed Airflow" became a completely viable default for most teams, rather than every team needing to operate the scheduler and metadata database themselves.
`,

  "why-it-exists": `
Before Airflow (and tools like it), most organizations scheduled recurring data work using cron jobs invoking standalone scripts, with dependencies between jobs either not expressed at all (Job B is just scheduled 30 minutes after Job A and hopes A finished in time) or hand-coded as fragile shell-script logic checking for marker files. This created several recurring, painful problems: no shared visibility into what actually ran, when, and whether it succeeded, beyond grepping log files on individual machines; no principled way to express "run B only after A succeeds" beyond timing guesses; no consistent retry behavior, so every script author reinvented (or, more often, simply omitted) retry logic; and no way to see the full dependency graph of an organization's pipelines at a glance, making it genuinely hard to reason about the blast radius of a delay or failure anywhere in the chain.

Airflow exists to solve this by making the workflow itself the first-class artifact: a DAG, written in Python, that explicitly declares every task and every dependency, that the Airflow scheduler then interprets, schedules, retries, and exposes through a shared web UI showing exactly what's running, what failed, and why. This directly extends the general orchestration problem covered conceptually in the **Distributed Systems** skill (coordinating work across independent, unreliable components) to the concrete, everyday reality of data and ML pipeline scheduling, and sets up the **Data Pipelines** and **MLOps** skills, which cover the broader engineering practices Airflow operationally supports.
`,

  "problem-it-solves": `
Airflow solves the **"how do we define, schedule, execute, retry, and observe a complex web of interdependent scheduled tasks, reliably and with full visibility"** problem.

Concretely, it provides:

- **Explicit dependency declaration**: task ordering (this must finish before that starts) is declared in code, not implied by cron timing guesses.
- **Centralized scheduling and monitoring**: one scheduler, one metadata database, one UI showing the status of every DAG run across an entire organization's pipelines.
- **Built-in retries and backoff**: transient failures (a flaky network call, a temporarily unavailable upstream service) are retried automatically according to a declared policy, rather than requiring every pipeline author to hand-roll retry logic.
- **Backfilling and scheduling semantics**: Airflow understands the idea of a "logical date" a DAG run is for, letting you rerun historical periods (backfill) in a principled way.
- **Extensibility via operators and providers**: a large ecosystem of pre-built operators (talking to cloud storage, data warehouses, Spark clusters, Kubernetes, and more) means most integrations don't need to be written from scratch.

What Airflow deliberately does **not** solve: it is not a data processing engine — it does not itself efficiently shuffle, join, or aggregate large datasets; that is **Spark's** job (or a warehouse's, or a purpose-built processing engine's), and Airflow's role is strictly to decide when that processing job runs and what happens before and after it. It is also not a real-time streaming system — Airflow is fundamentally built around discrete, scheduled (or externally-triggered) batch-style DAG runs, not continuous, low-latency stream processing (covered by systems like **Kafka**, a sibling skill, for the streaming side). And it does not manage the underlying compute infrastructure for you beyond what its executor integrates with — you still need a real execution substrate (Kubernetes, a Celery worker fleet, or similar) for tasks to actually run on.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain what a DAG is, why it must be acyclic, and how Airflow uses it to schedule and parallelize work.
2. Write a DAG using both the classic operator style and the TaskFlow API, and explain the tradeoffs between them.
3. Explain the difference between the scheduler and an executor, and name the major executor types.
4. Configure retries, backoff, and timeouts on a task, and explain why this matters for production reliability.
5. Use XComs correctly (and explain why they are unsuitable for large data payloads).
6. Explain the difference between orchestrating a computation (Airflow's job) and performing it (Spark's, or another processing engine's, job) — and recognize when a DAG has violated this separation.
7. Design idempotent tasks and explain why non-idempotent tasks are dangerous under Airflow's retry model.
8. Use sensors (including deferrable sensors) to wait on external conditions without wasting worker resources.
9. Decompose a monolithic DAG into smaller, reusable, testable pieces.
10. Answer senior-level interview questions on Airflow's scheduling model, idempotency, and orchestration-versus-processing tradeoffs.
`,

  prerequisites: `
- **Required**: the **Python** skill — DAGs are Python code, and operators, decorators, and control flow are used throughout.
- **Very helpful**: the **Data Pipelines** skill for the broader context of what Airflow is typically used to orchestrate.
- **Very helpful**: the **Kubernetes** skill if you plan to run Airflow's KubernetesExecutor or the KubernetesPodOperator.
- **Helpful**: the **Spark** skill, since Airflow very commonly orchestrates Spark jobs as the actual processing step within a DAG.
- **Helpful**: the **Message Queues** skill for background on the broker concepts underlying the CeleryExecutor.

Dependency chain on this platform: **Python** → this page → **Spark** (the processing engine Airflow often orchestrates) → **Kubeflow** (a sibling ML-pipeline orchestration platform) → **MLOps** (the broader operational discipline these tools support).
`,

  "beginner-concepts": `
### What a DAG actually is

A DAG (Directed Acyclic Graph) is a collection of tasks with directional dependencies between them and no cycles — you can never loop back to a task you've already run within the same DAG run. This acyclic property is what lets Airflow compute a valid execution order and safely parallelize independent branches.

~~~mermaid
flowchart LR
    Extract["extract_data"] --> Transform["transform_data"]
    Transform --> Load["load_to_warehouse"]
    Load --> Notify["send_notification"]
~~~

### Your first DAG (classic operator style)

~~~python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

def extract():
    print("extracting data...")

def transform():
    print("transforming data...")

default_args = {
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="my_first_pipeline",
    start_date=datetime(2026, 1, 1),
    schedule="@daily",
    default_args=default_args,
    catchup=False,  # don't backfill every day since start_date
) as dag:
    extract_task = PythonOperator(task_id="extract", python_callable=extract)
    transform_task = PythonOperator(task_id="transform", python_callable=transform)

    extract_task >> transform_task  # declares the dependency
~~~

The ">>" operator declares "extract_task must complete before transform_task starts." This is the essence of Airflow: you describe the graph, and the scheduler figures out when to actually run each node.

### Operators: the building blocks of a task

An operator is a template for a single task. Airflow ships with (and its provider ecosystem extends) operators for common needs:

- **PythonOperator** — run an arbitrary Python callable.
- **BashOperator** — run a shell command.
- **Sensor operators** (a special operator subclass) — wait for an external condition (a file appearing, a database row existing, another DAG finishing) before letting downstream tasks proceed.

~~~python
from airflow.operators.bash import BashOperator

validate_task = BashOperator(
    task_id="validate_output",
    bash_command="test -f /data/output.csv && echo 'file exists'",
)
~~~

### The TaskFlow API: a more Pythonic alternative

Airflow 2.0 introduced the TaskFlow API, using decorators so a DAG reads like ordinary Python functions with dependencies inferred from how you call them:

~~~python
from datetime import datetime
from airflow.decorators import dag, task

@dag(start_date=datetime(2026, 1, 1), schedule="@daily", catchup=False)
def my_taskflow_pipeline():
    @task
    def extract():
        return {"rows": 1000}

    @task
    def transform(extracted: dict):
        return {"rows": extracted["rows"], "cleaned": True}

    transform(extract())  # dependency is inferred from the function call

my_taskflow_pipeline()
~~~

Under the hood, the TaskFlow API is still building the same DAG-of-operators model — it's a more ergonomic authoring layer, not a different execution model. Both styles are actively used in production, and you'll frequently see them mixed within the same codebase (TaskFlow for Python-heavy logic, classic operators for things like sensors or provider-specific integrations).

### Schedules and the "logical date"

A DAG's "schedule" (e.g. "@daily", or a cron expression like "0 6 * * *") tells the scheduler how often to create new DAG runs. Each DAG run is associated with a **logical date** (formerly called "execution date") representing the period the run is FOR, not necessarily when it actually executes — a subtlety that trips up almost everyone new to Airflow and is covered in more depth in the intermediate section below.
`,

  "intermediate-concepts": `
### Retries, backoff, and timeouts

Production tasks fail for all sorts of transient reasons — a network blip, a temporarily overloaded database. Airflow makes retry behavior an explicit, declarative property of a task rather than something you hand-code:

~~~python
from datetime import timedelta
from airflow.operators.python import PythonOperator

fetch_task = PythonOperator(
    task_id="fetch_upstream_data",
    python_callable=fetch_upstream_data,
    retries=3,
    retry_delay=timedelta(minutes=2),
    retry_exponential_backoff=True,  # 2min, 4min, 8min between attempts
    max_retry_delay=timedelta(minutes=30),
    execution_timeout=timedelta(hours=1),  # kill the task if it runs this long
)
~~~

Exponential backoff matters specifically because a fixed short retry delay against a genuinely overloaded downstream service can make things worse (a thundering-herd of retries hitting an already-struggling system), while a growing delay gives the downstream system room to recover.

### XComs: passing small data between tasks

XCom ("cross-communication") is Airflow's built-in mechanism for tasks to exchange small pieces of data through the metadata database:

~~~python
from airflow.decorators import task

@task
def get_row_count():
    return 42  # automatically pushed to XCom under the TaskFlow API

@task
def check_row_count(count: int):
    if count == 0:
        raise ValueError("no rows found — upstream data may be missing")

check_row_count(get_row_count())
~~~

The critical limitation: XComs are stored in Airflow's metadata database and are meant for small values (row counts, file paths, status flags, small config dictionaries) — not for passing an actual dataset between tasks. Pushing a large DataFrame or a multi-megabyte payload through XCom will bloat the metadata database and can seriously degrade scheduler performance. The correct pattern for passing real data between tasks is to have each task write its output to shared storage (cloud storage, a data warehouse table, a distributed filesystem) and pass only a reference — a path or a table name — through XCom.

### Sensors: waiting on external conditions

A sensor is an operator whose job is to poll for a condition and only let downstream tasks proceed once it's true:

~~~python
from airflow.sensors.filesystem import FileSensor

wait_for_upstream_file = FileSensor(
    task_id="wait_for_export",
    filepath="/data/incoming/export_{{ ds }}.csv",
    poke_interval=60,        # check every 60 seconds
    timeout=60 * 60 * 6,     # give up after 6 hours
    mode="reschedule",       # free the worker slot between checks
)
~~~

The "mode" parameter matters a great deal in production: "poke" mode holds a worker slot for the entire wait, which is wasteful and can exhaust worker capacity if you have many long-running sensors; "reschedule" mode releases the worker slot between checks, letting other tasks use that capacity while the sensor waits; and "deferrable" sensors (a more recent Airflow capability) go further still, handing off the wait to a lightweight triggerer process so no worker slot — not even a periodically-freed one — is consumed at all while waiting.

### The logical date versus actual execution time, precisely

~~~
A DAG scheduled "@daily" with a logical date of 2026-01-01
does not actually RUN on 2026-01-01 -- by default, Airflow
waits until the FULL interval (the whole day of 2026-01-01)
has elapsed before running the DAG run "for" that date, so
it actually executes starting 2026-01-02. This models the
common data-pipeline pattern of "process yesterday's complete
data", but it is a very common source of beginner confusion
and off-by-one scheduling bugs.
~~~

### Dynamic DAG generation

Because DAGs are Python code, you can generate many similar DAGs (or many similar tasks within a DAG) programmatically rather than hand-writing near-duplicates:

~~~python
from airflow.decorators import dag, task
from datetime import datetime

REGIONS = ["us", "eu", "apac"]

for region in REGIONS:
    @dag(
        dag_id=f"process_{region}_data",
        start_date=datetime(2026, 1, 1),
        schedule="@daily",
        catchup=False,
    )
    def region_pipeline(region=region):
        @task
        def process(region):
            print(f"processing region: {region}")
        process(region)

    region_pipeline()
~~~

Dynamic DAG generation is powerful but must be used carefully: the file generating these DAGs is re-parsed by the scheduler on a regular interval, so an expensive or slow DAG-generation script (one that, say, calls an external API to decide what DAGs to create) can directly slow down the scheduler's ability to keep up across your entire Airflow deployment — a topic covered further in the advanced section.
`,

  "advanced-concepts": `
### Task-level parallelism and the DAG as a scheduling contract

Because a DAG explicitly declares dependencies rather than implying them through script order, Airflow (and its underlying executor) can run independent branches of a DAG concurrently, subject to configured parallelism limits (max active tasks per DAG, max active runs per DAG, and pool-based resource limits for scarce shared resources like a database connection pool). Understanding these limits — and deliberately setting them, rather than accepting defaults — is a genuine production skill: a DAG with unconstrained parallelism against a rate-limited external API will simply start failing requests once concurrent task count exceeds what that API tolerates.

### Idempotency: the single most important production discipline

~~~
An idempotent task produces the SAME end result whether it
runs once or is retried multiple times for the same logical
date. This matters enormously under Airflow's retry model:
a task that, e.g., INSERTs rows into a table without first
deleting or upserting the target partition will, on a
retried attempt (after a transient failure that happened
AFTER the insert but before Airflow recorded success), insert
a SECOND copy of the same data -- silent, hard-to-detect
double-processing. The fix is almost always to make writes
idempotent: DELETE-then-INSERT for a given logical-date
partition, or an UPSERT/MERGE keyed on a natural key, rather
than a blind, unconditional append.
~~~

### The orchestration/processing boundary, and why violating it is the classic Airflow anti-pattern

Airflow's PythonOperator makes it deceptively easy to put real, heavy data processing directly inside a task's Python callable — reading a large file, transforming it in memory, writing it back out, all inside one Airflow worker process. This works for small data and is tempting because it avoids "standing up a whole separate Spark job." It becomes a serious production liability at any real scale: Airflow workers are not designed or sized to do heavy in-memory data processing; a worker running a memory-hungry transformation can crash the worker process itself (taking down whatever else that worker was doing), doesn't benefit from a real processing engine's distributed execution, shuffle, and spill-to-disk behavior, and makes the DAG's actual resource requirements invisible to Airflow's own scheduling and pooling. The correct architectural boundary: Airflow decides WHEN a Spark job runs, with what inputs, after what upstream conditions are met, and what happens on success or failure — the SparkSubmitOperator (or an equivalent Kubernetes-based operator submitting a Spark job) triggers the actual computation, which then runs on Spark's own cluster, entirely separate from Airflow's worker fleet. See the **Spark** skill for the processing side of this boundary in depth.

### Monolithic DAGs versus composable, reusable pipelines

A DAG that grows to encompass an entire organization's data pipeline in one file — dozens of tasks, deeply interdependent, touching many unrelated systems — becomes hard to reason about, hard to test in isolation, and creates a single point of scheduling fragility (one slow or broken task can hold up unrelated downstream work that happens to share the same DAG). The senior pattern is decomposing a large pipeline into smaller, focused DAGs connected via **Datasets/Assets** (Airflow's data-aware scheduling feature, letting a downstream DAG trigger automatically when an upstream DAG produces a declared dataset) or via the TriggerDagRunOperator, rather than one enormous DAG trying to do everything.

~~~mermaid
flowchart LR
    subgraph Monolithic["Anti-pattern: one giant DAG"]
        A1["50+ tasks,\nall interdependent,\nhard to test or reason about"]
    end
    subgraph Composed["Better: smaller, composed DAGs"]
        B1["ingest_dag"] -->|"dataset trigger"| B2["transform_dag"]
        B2 -->|"dataset trigger"| B3["ml_training_dag"]
    end
~~~

### Deferrable operators and the triggerer

For long-running waits (a sensor polling for hours, waiting on an external batch job), holding a full worker slot the entire time is wasteful. Deferrable operators suspend themselves and hand the wait off to a separate, lightweight "triggerer" process that can manage many concurrent waits far more efficiently than dedicating a full worker to each one — letting a modestly-sized Airflow deployment support a much larger number of simultaneously-waiting sensors than "poke" or even "reschedule" mode alone would allow.

### Executor architecture: LocalExecutor, CeleryExecutor, KubernetesExecutor

~~~
LocalExecutor: runs tasks as local subprocesses on the same
    machine as the scheduler -- simple, but doesn't scale
    beyond a single machine's resources.
CeleryExecutor: distributes tasks across a fleet of Celery
    worker processes via a message broker (directly connecting
    to the Message Queues skill's own producer/consumer model)
    -- scales horizontally by adding worker machines.
KubernetesExecutor: launches each individual task as its own
    Kubernetes pod, giving each task fully isolated resources
    and dependencies, at the cost of per-task pod startup
    latency -- directly connects to the Kubernetes skill.
~~~

Choosing between these is a genuine architectural decision: CeleryExecutor suits a steady, moderate task volume with a relatively stable worker fleet; KubernetesExecutor suits highly heterogeneous tasks (wildly different dependency requirements per task) or environments already standardized on Kubernetes for all workloads.
`,

  "internal-working": `
Tracing what actually happens from a DAG file landing on disk to a task's success being recorded:

~~~mermaid
sequenceDiagram
    participant DagFile as DAG File (Python)
    participant Scheduler
    participant MetaDB as Metadata Database
    participant Executor
    participant Worker

    DagFile->>Scheduler: parsed periodically (DAG file processor)
    Scheduler->>MetaDB: serialize DAG structure
    Scheduler->>Scheduler: evaluate schedule -- is a\nnew DAG run due?
    Scheduler->>MetaDB: create DAG run + task instances\n(state: scheduled)
    Scheduler->>Executor: hand off runnable task instances\n(dependencies met)
    Executor->>Worker: dispatch task for execution
    Worker->>Worker: execute the operator's logic
    Worker->>MetaDB: report task instance state\n(success / failed / retry)
    Scheduler->>MetaDB: poll for state changes,\nschedule next eligible tasks
~~~

1. **The DAG file processor parses your Python DAG files** on a recurring interval, executing the module-level code (which is why expensive top-level code in a DAG file — a slow API call to decide what tasks to create — directly slows down scheduling across your whole deployment) and serializes the resulting DAG structure into the metadata database.
2. **The scheduler evaluates each DAG's schedule** to decide whether a new DAG run is due, and creates the corresponding task instance rows in the metadata database with an initial state.
3. **The scheduler determines which task instances are currently runnable** (their upstream dependencies have succeeded, and any pool/concurrency limits allow it) and hands them to the configured executor.
4. **The executor dispatches the task to an actual worker** (a local subprocess, a Celery worker, or a freshly-launched Kubernetes pod, depending on executor type), where the operator's actual logic runs.
5. **The worker reports the task's final state back to the metadata database** — success, failure, or "up for retry" if retries remain — and the scheduler picks this up on its next polling pass, unblocking downstream tasks or triggering a retry as configured.

**Why this matters**: nearly every subtlety in Airflow — why a DAG file's top-level code performance matters, why task state changes aren't instantaneous, why a "stuck" task might actually be a scheduler bottleneck rather than a worker problem — traces directly back to this scheduler-parses/schedules, executor-dispatches, worker-executes, metadata-database-records loop.
`,

  architecture: `
A senior engineer thinks about Airflow deployment architecture in terms of separating the scheduler's own health from worker capacity, choosing an executor matched to actual workload shape, and structuring DAGs as small, composable, dataset-linked pieces rather than one sprawling pipeline.

### Reference component layout

~~~mermaid
flowchart TB
    subgraph ControlPlane["Airflow Control Plane"]
        Scheduler["Scheduler(s)"]
        WebServer["Webserver / UI"]
        MetaDB[("Metadata Database\n(Postgres/MySQL)")]
        Triggerer["Triggerer\n(deferrable operators)"]
    end
    subgraph ExecutionLayer["Execution Layer"]
        Broker["Message Broker\n(Celery executor only)"]
        Workers["Worker Pool /\nKubernetes Pods"]
    end
    Scheduler <--> MetaDB
    WebServer <--> MetaDB
    Triggerer <--> MetaDB
    Scheduler --> Broker
    Broker --> Workers
    Workers --> MetaDB
~~~

### Structuring DAGs as small, composable units

~~~mermaid
flowchart LR
    Ingest["ingest_dag\n(pull raw data)"] -->|"dataset:\nraw_events"| Transform["transform_dag\n(clean, dedupe)"]
    Transform -->|"dataset:\nclean_events"| Feature["feature_dag\n(build features)"]
    Feature -->|"dataset:\nfeature_table"| Train["training_dag\n(trigger Spark/ML job)"]
~~~

Each DAG owns a narrow, well-defined responsibility and communicates with the next via a declared dataset dependency, rather than everything living inside one large DAG. This makes each piece independently testable, independently schedulable, and independently owned by a specific team, echoing the same decomposition principle covered in the **Data Pipelines** skill.

### Separating orchestration resources from processing resources

A senior architecture keeps Airflow's own worker fleet appropriately small and lightweight — since its job is triggering and waiting, not computing — while the actual heavy lifting runs on dedicated infrastructure (a Spark cluster, a Kubernetes job with its own resource requests, a managed data warehouse) that Airflow tasks merely submit work to and poll for completion, directly reflecting the orchestration/processing boundary discussed in the advanced-concepts section.
`,

  "data-flow": `
Tracing an end-to-end DAG run: a sensor waits for data, a Spark job processes it, and a notification is sent on completion.

~~~mermaid
sequenceDiagram
    participant Scheduler
    participant Sensor as FileSensor (deferrable)
    participant CloudStorage as Cloud Storage
    participant SparkOp as SparkSubmitOperator
    participant SparkCluster as Spark Cluster
    participant NotifyOp as Notification Task

    Scheduler->>Sensor: start waiting for upstream file
    Sensor->>CloudStorage: poll for expected file
    CloudStorage-->>Sensor: not yet present
    Note over Sensor: deferred -- no worker slot held\nwhile waiting
    CloudStorage-->>Sensor: file now present
    Sensor->>Scheduler: report success
    Scheduler->>SparkOp: dependencies met -- run task
    SparkOp->>SparkCluster: submit Spark job
    SparkCluster->>SparkCluster: process data\n(NOT done inside Airflow)
    SparkCluster-->>SparkOp: job completed
    SparkOp->>Scheduler: report success
    Scheduler->>NotifyOp: dependencies met -- run task
    NotifyOp->>NotifyOp: send Slack/email notification
    NotifyOp->>Scheduler: report success
~~~

The critical detail: at no point does Airflow itself touch the actual data being processed — it waits for a signal (the file's presence), submits a job elsewhere (the Spark cluster) and waits for that job's own completion signal, and finally runs a lightweight notification step. Every "heavy" step happens outside Airflow's own worker processes.
`,

  "production-usage": `
### A representative production DAG

~~~python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.sensors.filesystem import FileSensor
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from airflow.operators.python import PythonOperator

def notify_completion(**context):
    print(f"pipeline succeeded for {context['ds']}")
    # send_slack_message(...) in a real deployment

default_args = {
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
    "execution_timeout": timedelta(hours=2),
}

with DAG(
    dag_id="daily_events_pipeline",
    start_date=datetime(2026, 1, 1),
    schedule="@daily",
    catchup=False,
    default_args=default_args,
    max_active_runs=1,  # avoid overlapping runs for the same DAG
) as dag:

    wait_for_export = FileSensor(
        task_id="wait_for_export",
        filepath="/data/incoming/events_{{ ds }}.parquet",
        poke_interval=120,
        timeout=60 * 60 * 4,
        mode="reschedule",
    )

    process_events = SparkSubmitOperator(
        task_id="process_events_spark",
        application="/opt/spark_jobs/process_events.py",
        application_args=["--date", "{{ ds }}"],
        conn_id="spark_default",
    )

    notify = PythonOperator(
        task_id="notify_completion",
        python_callable=notify_completion,
    )

    wait_for_export >> process_events >> notify
~~~

This example demonstrates the intended orchestration pattern end to end: a sensor waits for external data availability (without holding a worker slot, via "reschedule" mode), the actual processing is delegated entirely to Spark via SparkSubmitOperator, and a lightweight downstream task handles notification — Airflow never touches the event data directly.

### Non-negotiables for production Airflow usage

1. **Make every task idempotent**, so retries never cause double-processing.
2. **Delegate real data processing to a dedicated engine** (Spark, a warehouse) — never do heavy computation inside a PythonOperator.
3. **Set max_active_runs and appropriate concurrency/pool limits**, preventing runaway parallelism against rate-limited resources.
4. **Use "reschedule" or deferrable mode for sensors**, avoiding wasted worker capacity on long waits.
5. **Keep DAG file top-level code cheap and fast**, since it's re-parsed on every scheduler loop.

### Common production patterns

- **ELT/ETL orchestration**: waiting on source data, triggering a transformation job (Spark, dbt), and loading results into a warehouse.
- **ML pipeline orchestration**: waiting on new labeled data, triggering training on a GPU cluster, running evaluation, and conditionally promoting a model — directly complementary to the **MLOps** and **Kubeflow** skills.
- **Cross-team dependency management**: using Datasets to let a downstream team's DAG trigger automatically when an upstream team's DAG produces its output, without manual coordination.
`,

  "industry-examples": `
- **Airbnb**: created Airflow to manage its own internal data pipeline complexity, and remains a major user of Airflow-orchestrated data workflows.
- **Google Cloud Composer**: Google's managed Airflow offering, used broadly across companies running data pipelines on GCP.
- **Amazon MWAA (Managed Workflows for Apache Airflow)**: AWS's managed Airflow service, widely used by companies orchestrating pipelines across S3, Redshift, EMR (Spark), and other AWS data services.
- **Astronomer**: a company built specifically around providing a managed, production-grade Airflow platform and contributing significantly to Airflow's open-source development.
- **Many large-scale data and ML organizations** (across finance, e-commerce, and adtech) use Airflow as the standard scheduling backbone connecting ingestion, transformation, feature engineering, and model training pipelines.
`,

  "best-practices": `
1. **Make every task idempotent**, treating retries as the practical default, not an edge case.
2. **Delegate heavy data processing to a dedicated engine (Spark, a warehouse)**, keeping Airflow strictly in the orchestration role.
3. **Keep DAG files cheap to parse**, avoiding slow or expensive top-level code that would degrade scheduler performance across your whole deployment.
4. **Decompose large pipelines into smaller, composable DAGs** linked via Datasets, rather than one monolithic DAG.
5. **Use "reschedule" or deferrable sensors** for any wait longer than a few seconds, to avoid wasting worker capacity.
6. **Set max_active_runs, pools, and task concurrency limits deliberately**, matched to the actual capacity of downstream systems.
7. **Never pass large data payloads through XCom** — pass a reference (a path, a table name) instead.
8. **Version-control and code-review DAGs like any other production code**, including tests for DAG structure and task logic.
9. **Use configured retries with exponential backoff** rather than a fixed short delay, to avoid worsening load on a struggling downstream system.
10. **Alert on SLA misses and task failures explicitly**, rather than relying on someone noticing a stale dashboard.
11. **Prefer the TaskFlow API for Python-heavy logic** where it improves readability, while still reaching for classic operators (sensors, provider operators) where they fit better.
12. **Pin provider and Airflow core versions deliberately** and test upgrades in a staging environment before rolling out to production.
`,

  "anti-patterns": `
### Doing heavy data processing directly inside a PythonOperator

~~~python
# WRONG — loads and transforms a large dataset entirely
# inside an Airflow worker process; can crash the worker,
# doesn't scale, and is invisible to Airflow's own resource
# planning
def process_large_dataset():
    df = pd.read_parquet("s3://bucket/huge_file.parquet")
    df = df.groupby("user_id").agg(...)  # heavy, in-memory work
    df.to_parquet("s3://bucket/output.parquet")

# RIGHT — Airflow only triggers and waits; the actual
# processing runs on a dedicated engine
process_task = SparkSubmitOperator(
    task_id="process_large_dataset",
    application="/opt/spark_jobs/process_large_dataset.py",
    conn_id="spark_default",
)
~~~

### Non-idempotent tasks

~~~python
# WRONG — a retried attempt appends a SECOND copy of the
# same day's data
def load_to_warehouse(ds):
    df = read_processed_data(ds)
    df.to_sql("events", con=engine, if_exists="append")

# RIGHT — idempotent: clears the target partition first,
# so retries never duplicate data
def load_to_warehouse(ds):
    engine.execute(f"DELETE FROM events WHERE ds = '{ds}'")
    df = read_processed_data(ds)
    df.to_sql("events", con=engine, if_exists="append")
~~~

### Monolithic, all-in-one DAGs

~~~
# WRONG — a single DAG with 60+ tightly-coupled tasks
# spanning ingestion, transformation, ML training, and
# reporting, all owned by different teams, all sharing one
# failure/scheduling blast radius
# RIGHT — decompose into smaller DAGs (ingest_dag,
# transform_dag, train_dag, report_dag) linked via Datasets,
# each independently ownable, testable, and schedulable
~~~

### Passing large data through XCom

~~~python
# WRONG — bloats the metadata database, degrades scheduler
# performance
@task
def extract():
    return pd.read_csv("huge_file.csv").to_dict()  # huge XCom payload

# RIGHT — write data to shared storage, pass only a reference
@task
def extract():
    path = "s3://bucket/staging/extracted.parquet"
    pd.read_csv("huge_file.csv").to_parquet(path)
    return path  # small, reference-only XCom payload
~~~

### Poke-mode sensors holding worker slots for hours

~~~
# WRONG — a sensor in default "poke" mode holds a full
# worker slot for its entire multi-hour wait, potentially
# exhausting worker capacity across the whole deployment
# RIGHT — use mode="reschedule" (or a deferrable sensor)
# so the worker slot is freed between checks
~~~
`,

  performance: `
### Rule zero: measure the scheduler and the workload shape separately

A "slow pipeline" complaint can mean the scheduler itself is struggling to keep up (too many DAGs, expensive DAG-file top-level code, an undersized metadata database), or that individual tasks are genuinely slow, or that worker capacity is simply exhausted — these have very different fixes, so diagnose which one you actually have before optimizing.

### The performance hierarchy (apply in order)

1. **Keep DAG file top-level code cheap**, since it's re-parsed on every scheduler loop across every DAG file — an expensive top-level API call or database query in one DAG file can slow down scheduling for your entire deployment.
2. **Set appropriate parallelism, pools, and max_active_runs**, matching actual downstream system capacity rather than leaving unconstrained defaults.
3. **Scale the executor to match workload shape**: add Celery workers for steady, moderate load; consider KubernetesExecutor for highly heterogeneous, spiky task requirements.
4. **Use deferrable operators for long waits**, freeing worker/scheduler resources that "poke" or even "reschedule" mode sensors would otherwise tie up.
5. **Ensure the metadata database itself is appropriately sized and tuned**, since it's the shared bottleneck underlying scheduler, webserver, and worker state.

### Micro-level facts worth knowing

- Task-instance-level XCom payloads that are too large directly bloat the metadata database and can measurably slow scheduler query performance.
- Very high DAG or task counts on a single scheduler can create a real scheduling lag if scheduler resources (and scheduler parallelism/HA configuration) aren't scaled to match.
- Dynamic DAG generation that itself performs slow I/O at parse time (an API call to decide what tasks to create) is a common, easily-overlooked scheduler performance drain.
`,

  scalability: `
Airflow's scalability story separates cleanly into scheduler scalability and executor/worker scalability — the two are tuned independently.

### Scaling the control plane versus the execution layer

~~~mermaid
flowchart LR
    ControlPlane["Scheduler(s) + Metadata DB\n(scale via HA scheduler config\nand DB sizing)"] -.->|"independent of"| ExecutionLayer["Worker fleet\n(scale via more Celery\nworkers or more K8s pods)"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Scheduler can't keep up parsing/scheduling a large number of DAGs | Run multiple scheduler replicas (Airflow 2.0+ supports HA scheduling); reduce expensive top-level DAG file code |
| Worker capacity exhausted by many concurrent tasks | Scale out Celery workers, or switch to KubernetesExecutor for elastic, per-task pod scaling |
| Sensors tying up worker slots for long waits | Switch to "reschedule" mode or deferrable operators |
| Metadata database becoming a shared bottleneck | Size and tune the database appropriately; avoid large XCom payloads bloating it |
| One team's heavy DAG activity starves another team's tasks | Use Airflow pools to allocate and isolate concurrency budgets per team/resource |
`,

  security: `
### Airflow's attack surface

~~~
Airflow's webserver, its connections/variables store (holding
credentials for external systems it orchestrates), and its
ability to execute arbitrary code (via PythonOperator/
BashOperator) together make it a genuinely sensitive piece of
infrastructure -- someone who can create or modify a DAG can,
in effect, execute arbitrary code with whatever credentials
Airflow's connections store holds.
~~~

### Essential Airflow-specific security practices

1. **Restrict who can author/deploy DAGs** to trusted engineers, since a malicious or careless DAG can execute arbitrary code with Airflow's own stored credentials.
2. **Use Airflow's connections and a proper secrets backend** (a dedicated secrets manager, not variables stored in plaintext) for credentials to external systems, directly connecting to the **Secrets Management** skill.
3. **Apply role-based access control** within Airflow's own UI/API, restricting who can view, trigger, or modify which DAGs, directly connecting to the **RBAC** skill.
4. **Keep Airflow core and provider packages patched**, since a scheduler/webserver vulnerability can have an unusually large blast radius given Airflow's broad access to other systems' credentials.
5. **Treat DAG code review with the same rigor as any other production code with elevated access**, since it genuinely has that level of access.

See the **Secrets Management**, **RBAC**, and **OWASP Top 10** skills for the broader security context this connects to.
`,

  testing: `
### Testing DAG structure (no execution required)

~~~python
from airflow.models import DagBag

def test_dag_has_no_import_errors():
    dag_bag = DagBag(dag_folder="dags/", include_examples=False)
    assert len(dag_bag.import_errors) == 0

def test_expected_task_count():
    dag_bag = DagBag(dag_folder="dags/", include_examples=False)
    dag = dag_bag.get_dag("daily_events_pipeline")
    assert len(dag.tasks) == 3
~~~

### Testing task logic in isolation

~~~python
def test_notify_completion_logic():
    context = {"ds": "2026-07-28"}
    # notify_completion should not raise, and should format
    # the date correctly into its message
    result = build_notification_message(context)
    assert "2026-07-28" in result
~~~

### Testing idempotency explicitly

~~~python
def test_load_to_warehouse_is_idempotent(test_db):
    load_to_warehouse(ds="2026-07-28")
    load_to_warehouse(ds="2026-07-28")  # simulate a retry
    row_count = test_db.execute(
        "SELECT COUNT(*) FROM events WHERE ds = '2026-07-28'"
    ).scalar()
    assert row_count == EXPECTED_ROW_COUNT  # not double-counted
~~~

### The senior testing doctrine

- Test DAG structure (import errors, expected task count and dependencies) as fast, cheap unit tests run on every commit.
- Test individual task logic (the actual Python callables) in isolation from Airflow's own execution machinery wherever possible.
- Explicitly test idempotency for any task that writes data, simulating a retry and verifying no duplicate effect.
- Use a staging Airflow environment for integration-testing full DAG runs against realistic (not production) data before deploying DAG changes.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check the Airflow UI's task instance logs first** — the most direct path to a specific task's actual failure.
2. **Check whether the issue is scheduler-side or worker-side** — a task stuck in "scheduled" or "queued" state for a long time often points to a scheduler or executor capacity issue, not a bug in the task's own logic.
3. **Check the scheduler's own logs** for DAG parsing errors or performance warnings if many DAGs across the deployment seem to be affected simultaneously.
4. **Use "airflow tasks test"** to run a single task in isolation, outside the full scheduler/executor machinery, for fast local debugging.

### Debugging common Airflow-specific symptoms

- "A task keeps failing and retrying, but succeeds eventually" — check for a transient dependency issue and consider whether retry_delay/backoff is tuned appropriately.
- "A task is stuck in 'queued' for a long time" — check executor/worker capacity; you may simply have more queued tasks than available worker slots.
- "The whole scheduler seems slow across many unrelated DAGs" — check for expensive top-level code in a DAG file being re-parsed repeatedly.
- "Data appears duplicated after a retry" — check the task's write logic for a missing idempotency guarantee (DELETE-then-INSERT or UPSERT rather than blind append).
`,

  monitoring: `
### Key signals to track

- **DAG run success/failure rate**, the most direct top-level health signal for a given pipeline.
- **Task duration trends**, catching gradual performance regressions before they become SLA violations.
- **Scheduler heartbeat/lag**, indicating whether the scheduler itself is keeping up with the deployment's DAG volume.
- **Queued-task count and worker utilization**, indicating whether executor capacity is sufficient for current task volume.
- **SLA misses**, Airflow's own built-in mechanism for flagging when a task or DAG run takes longer than an expected threshold.

### Instrumentation example

~~~python
from airflow.decorators import task
import time

@task
def process_with_timing():
    start = time.monotonic()
    do_work()
    duration = time.monotonic() - start
    emit_metric("task_duration_seconds", duration, tags={"task": "process_with_timing"})
~~~

### Tools

Airflow's own UI (Grid view, Gantt chart) for per-DAG-run visibility; the **Prometheus** and **Grafana** skills for aggregated, alertable metrics across the whole deployment (via the statsd/Prometheus exporter many Airflow deployments enable); the **Tracing** skill for tracing a task's downstream calls (e.g. into a Spark job or an external API) in more depth.

### Alerting priorities

Alert on DAG run failures for business-critical pipelines, on SLA misses, on scheduler heartbeat lag (an early sign of a deployment-wide capacity issue), and on sustained worker-queue backlog growth.
`,

  deployment: `
### A representative production Dockerfile for a custom Airflow image

~~~
FROM apache/airflow:2.9.0-python3.11
# Pin a specific Airflow + Python version explicitly --
# avoids surprise breaking changes from an unpinned "latest" tag

COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt
# Install provider packages (e.g. apache-airflow-providers-apache-spark)
# and any DAG-specific dependencies as a locked, reviewed requirements file

COPY dags/ /opt/airflow/dags/
# Ship DAG files as part of the image build (or via a separate
# sync mechanism, depending on deployment model) rather than
# editing files directly on a running container

USER airflow
# Run as the non-root airflow user provided by the base image,
# rather than root, limiting the blast radius of a container
# compromise
~~~

### CI/CD pipeline considerations

Run DAG-structure tests (import errors, expected task/dependency shape) and unit tests for task logic on every commit; deploy DAG changes to a staging Airflow environment first, verifying a full DAG run succeeds against realistic (non-production) data before promoting to production; treat provider package and Airflow core version upgrades as their own tested, staged rollout, not an in-place production change. See the **CI/CD** and **Kubernetes** skills for the broader deployment depth this builds on.
`,

  "production-checklist": `
Before a production Airflow deployment takes real pipeline traffic:

- [ ] Every task designed to be genuinely idempotent
- [ ] No heavy data processing performed directly inside PythonOperator/BashOperator tasks
- [ ] Retries, exponential backoff, and execution timeouts configured on every task
- [ ] Sensors use "reschedule" mode or are deferrable, not default "poke" mode, for any non-trivial wait
- [ ] XCom used only for small reference values, never large data payloads
- [ ] max_active_runs, pools, and concurrency limits set deliberately, matched to downstream capacity
- [ ] DAGs decomposed into smaller, composable pieces rather than one monolithic DAG
- [ ] Secrets/credentials stored via a proper secrets backend, not plaintext variables
- [ ] Role-based access control configured for DAG authoring, triggering, and viewing
- [ ] Scheduler sized appropriately (HA scheduler configuration considered) for actual DAG volume
- [ ] Metadata database sized and backed up appropriately
- [ ] SLA misses, DAG failures, and scheduler heartbeat lag alerting configured
- [ ] Staging environment used to test DAG changes before production deployment
- [ ] DAG code reviewed and version-controlled like any other production code
`,

  "common-mistakes": `
1. **Doing heavy data processing inside a PythonOperator**, risking worker crashes and losing the benefits of a real processing engine like **Spark**.
2. **Writing non-idempotent tasks**, causing double-processing whenever a retry occurs — and retries are the normal, expected case, not a rare edge case.
3. **Using default "poke" mode for long-running sensors**, wasting worker capacity that could serve other tasks.
4. **Passing large data through XCom**, bloating the metadata database and degrading scheduler performance.
5. **Building one monolithic DAG for an entire pipeline**, creating a large shared failure/scheduling blast radius instead of smaller, independently-ownable pieces.
6. **Writing expensive top-level code in a DAG file**, slowing scheduler performance across the entire deployment since it's re-parsed repeatedly.
7. **Misunderstanding the logical date versus actual execution time**, leading to off-by-one scheduling confusion and incorrect backfill expectations.
8. **Not setting max_active_runs or concurrency limits**, allowing unconstrained parallelism against rate-limited downstream systems.
9. **Storing credentials as plaintext Airflow variables** instead of using a proper secrets backend.
10. **Treating DAG changes as low-risk, untested edits** rather than production code changes deserving review and staged rollout.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Task stuck in "queued" for a long time | Executor/worker capacity exhausted, or a pool limit reached | Scale out workers, or review pool/concurrency configuration |
| Data appears duplicated after a task retry | Task write logic is not idempotent (blind append instead of delete-then-insert or upsert) | Make the write idempotent, keyed on the logical date or a natural key |
| Scheduler seems slow across many unrelated DAGs | Expensive top-level code in a DAG file, re-parsed on every scheduler loop | Move expensive logic inside task callables, not DAG-file module scope |
| Sensor consumes a worker slot for hours | Sensor left in default "poke" mode | Switch to mode="reschedule" or a deferrable sensor |
| DAG doesn't run when expected | Confusion between the DAG's logical date and its actual execution time, or "catchup" misconfigured | Review Airflow's schedule/logical-date semantics; set catchup explicitly |
| Metadata database growing unexpectedly large / scheduler queries slow | Large payloads pushed through XCom repeatedly | Push only small reference values through XCom; store real data externally |
| Task fails immediately with a credentials/connection error | Connection/secrets misconfigured or not available to the worker environment | Verify the Airflow connection/secrets-backend configuration for that environment |
`,

  faqs: `
**Is Airflow a data processing engine like Spark?**
No — Airflow orchestrates when and in what order work happens, including retries and dependency handling; it deliberately delegates actual heavy data processing to a dedicated engine like **Spark**, or to a data warehouse.

**What's the difference between the classic operator API and the TaskFlow API?**
Both build the same underlying DAG-of-tasks model; the TaskFlow API (introduced in Airflow 2.0) is a decorator-based, more Pythonic authoring style where dependencies are inferred from function calls, while the classic style declares operators explicitly and wires dependencies with ">>". Many production codebases mix both.

**Why do my tasks need to be idempotent?**
Because Airflow's retry model means a task can run more than once for the same logical date (after a transient failure, or a manual rerun); a non-idempotent task (a blind data append, for instance) will produce incorrect duplicated effects under this normal, expected retry behavior.

**What is XCom, and what shouldn't I use it for?**
XCom is Airflow's mechanism for passing small values between tasks via the metadata database; it should never be used to pass large datasets, since that bloats the metadata database and can degrade scheduler performance — pass a reference (a file path, a table name) instead.

**What's the difference between "poke" and "reschedule" sensor mode?**
"Poke" mode holds a worker slot for the sensor's entire wait; "reschedule" mode frees the worker slot between checks, letting other tasks use that capacity — "reschedule" (or a deferrable operator) is almost always the better production choice for any non-trivial wait.

**Why did my DAG's first run happen a day later than I expected?**
Airflow's default scheduling semantics wait for a scheduling interval to fully elapse before running the DAG run "for" that period (the logical date), modeling the common "process yesterday's complete data" pattern — this trips up many newcomers and is worth understanding deliberately rather than working around by trial and error.

**Should I use one big DAG or many small DAGs for a complex pipeline?**
Many small, composable DAGs, linked via Datasets or trigger relationships, almost always beats one large monolithic DAG — smaller DAGs are independently testable, independently ownable, and don't share a single large failure/scheduling blast radius.

**Do I need to run and operate Airflow myself?**
Not necessarily — managed offerings (Amazon MWAA, Google Cloud Composer, Astronomer) let teams use Airflow without operating the scheduler, metadata database, and executor infrastructure themselves, and are a completely standard production choice.
`,

  "interview-questions": `
### Junior level

1. **What is a DAG in Airflow, and why must it be acyclic?**
   Model answer: a Directed Acyclic Graph of tasks with explicit dependencies; it must be acyclic so Airflow's scheduler can compute a valid execution order — a cycle would mean a task depends (directly or transitively) on itself, which has no valid execution order.

2. **What's the difference between an operator and a task?**
   Model answer: an operator is a template/class defining what kind of work to do (run Python code, run a bash command, wait for a file); a task is a specific instantiation of an operator within a particular DAG, given a unique task_id.

3. **Why does Airflow support automatic retries, and how do you configure them?**
   Model answer: because transient failures (network blips, temporarily unavailable services) are common in production pipelines; retries, retry_delay, and retry_exponential_backoff are configured per-task (or via default_args for a whole DAG) rather than requiring every task to hand-roll its own retry logic.

4. **What is XCom used for?**
   Model answer: passing small values between tasks via Airflow's metadata database — it should never be used for large datasets, since that bloats the metadata database and hurts scheduler performance.

### Senior level

5. **A pipeline occasionally produces duplicated rows in its output table. The DAG has retries configured. What's your hypothesis, and how would you confirm and fix it?**
   Model answer: the most likely cause is a non-idempotent write — a task appending data unconditionally rather than clearing/upserting the target partition first — combined with a retry occurring after the write succeeded but before Airflow recorded task success (e.g., a transient failure in a downstream step, or the worker being killed after committing the write but before reporting state); confirm by checking whether the affected task instance's history shows more than one attempt for the same logical date, and by checking the write logic for a delete-then-insert or upsert guarantee; fix by making the write idempotent, keyed on the logical date (or a natural key), so a second attempt for the same date produces the same end state rather than an additional copy.

6. **You have a DAG with a PythonOperator task that loads and transforms a very large dataset in memory, and it's started crashing workers under increased data volume. What's the architectural fix?**
   Model answer: this is the classic orchestration/processing boundary violation — the heavy transformation should not run inside an Airflow worker at all; replace the PythonOperator with an operator that submits the transformation to a dedicated processing engine (a SparkSubmitOperator triggering a Spark job, for instance), so Airflow's role returns to purely triggering and waiting for that job's completion, while the actual heavy computation runs on infrastructure designed and sized for it.

7. **Explain the difference between "poke" mode, "reschedule" mode, and deferrable operators for a sensor, and when you'd choose each.**
   Model answer: "poke" mode holds a full worker slot for the sensor's entire wait, checking on an interval — acceptable only for very short expected waits; "reschedule" mode releases the worker slot between checks, letting other tasks use that capacity while the sensor waits — a better default for waits of more than a few minutes; deferrable operators hand the wait off to a separate, lightweight triggerer process, avoiding even the periodic worker-slot consumption that "reschedule" mode still has — best for very long waits (hours) or deployments with a large number of simultaneously-waiting sensors, since the triggerer can manage many waits far more efficiently than dedicating any worker capacity to each.

8. **How would you decompose a single, sprawling 60-task DAG spanning ingestion, transformation, and ML training into a better structure?**
   Model answer: split it into smaller, focused DAGs along natural ownership and responsibility boundaries (an ingest_dag, a transform_dag, a feature_dag, a train_dag), each independently testable and independently schedulable; connect them via Airflow's Datasets/Assets feature (or the TriggerDagRunOperator), so a downstream DAG triggers automatically once its upstream DAG produces the declared dataset, rather than everything living in one large DAG with a single shared failure/scheduling blast radius; this also lets different teams own different DAGs independently, rather than one team's changes risking breaking an unrelated part of a shared monolithic pipeline.

9. **Explain why the scheduler re-parsing DAG files matters for production performance, and what mistakes commonly degrade it.**
   Model answer: the scheduler (via its DAG file processor) re-parses every DAG file on a recurring interval to detect changes and re-evaluate scheduling; because this happens repeatedly and applies across every DAG file in the deployment, any expensive top-level code in a single DAG file (a slow database query or API call executed at module import time, used to decide what tasks to dynamically generate) directly slows down parsing — and therefore scheduling — for the ENTIRE deployment, not just that one DAG; the fix is keeping DAG-file top-level code cheap and fast, moving any genuinely expensive logic inside task callables (which only run when the task actually executes) rather than at DAG-parse time.

10. **What's the tradeoff between CeleryExecutor and KubernetesExecutor, and how would you choose between them for a given team?**
    Model answer: CeleryExecutor distributes tasks across a relatively stable pool of worker processes via a message broker — simple to reason about and well-suited to a steady, moderate task volume with fairly homogeneous dependency requirements across tasks; KubernetesExecutor launches each task as its own pod, giving full per-task resource and dependency isolation at the cost of per-task pod startup latency — better suited to highly heterogeneous workloads (tasks needing wildly different dependencies or resource profiles) or teams already standardized on Kubernetes for all workloads; the choice should be driven by actual workload shape and existing infrastructure investment, not a default assumption that one is universally "more modern" than the other.
`,

  "coding-questions": `
### 1. Write a DAG (TaskFlow API) with a sensor, a processing step, and a notification step, with retries configured

~~~python
from datetime import datetime, timedelta
from airflow.decorators import dag, task
from airflow.sensors.filesystem import FileSensor

default_args = {
    "retries": 2,
    "retry_delay": timedelta(minutes=3),
    "retry_exponential_backoff": True,
}

@dag(
    start_date=datetime(2026, 1, 1),
    schedule="@daily",
    catchup=False,
    default_args=default_args,
)
def daily_pipeline():
    wait_for_file = FileSensor(
        task_id="wait_for_file",
        filepath="/data/incoming/{{ ds }}.csv",
        poke_interval=60,
        timeout=60 * 60 * 3,
        mode="reschedule",
    )

    @task
    def process_file(ds=None):
        row_count = run_processing(ds)
        return row_count

    @task
    def notify(row_count: int):
        if row_count == 0:
            raise ValueError("no rows processed — investigate upstream data")
        send_notification(f"processed {row_count} rows")

    row_count = process_file()
    wait_for_file >> row_count
    notify(row_count)

daily_pipeline()
# Follow-up: how would you modify process_file to delegate
# the actual processing to a Spark job instead of running it
# inline, and why would that be the better production design?
~~~

### 2. Implement an idempotent load function and a test proving it

~~~python
def load_to_warehouse(ds, engine, get_processed_data):
    with engine.begin() as conn:
        conn.execute(
            "DELETE FROM events WHERE ds = %s", (ds,)
        )
        rows = get_processed_data(ds)
        for row in rows:
            conn.execute(
                "INSERT INTO events (ds, user_id, event) VALUES (%s, %s, %s)",
                (ds, row["user_id"], row["event"]),
            )

def test_load_is_idempotent(test_engine):
    load_to_warehouse("2026-07-28", test_engine, fake_get_processed_data)
    load_to_warehouse("2026-07-28", test_engine, fake_get_processed_data)  # retry
    count = test_engine.execute(
        "SELECT COUNT(*) FROM events WHERE ds = '2026-07-28'"
    ).scalar()
    assert count == len(fake_get_processed_data("2026-07-28"))
# Follow-up: what would happen to this idempotency guarantee
# if two retries of this task ran CONCURRENTLY rather than
# sequentially, and how would you prevent that from happening
# in the first place at the DAG configuration level?
~~~

### 3. Refactor a monolithic DAG into two composable DAGs linked by a Dataset

~~~python
# BEFORE: one DAG doing ingestion AND transformation together
# (simplified sketch)
#
# AFTER:
from airflow.datasets import Dataset
from airflow.decorators import dag, task
from datetime import datetime

raw_events_dataset = Dataset("s3://bucket/raw_events/{{ ds }}.parquet")

@dag(start_date=datetime(2026, 1, 1), schedule="@daily", catchup=False)
def ingest_dag():
    @task(outlets=[raw_events_dataset])
    def ingest():
        fetch_and_store_raw_events()
    ingest()

ingest_dag()

@dag(start_date=datetime(2026, 1, 1), schedule=[raw_events_dataset], catchup=False)
def transform_dag():
    @task
    def transform():
        transform_raw_events()
    transform()

transform_dag()
# Follow-up: what's the practical benefit of linking these two
# DAGs via a Dataset rather than just scheduling transform_dag
# ten minutes after ingest_dag and hoping ingestion finished
# in time?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build and run your first DAG locally
Install Airflow (or use the official Docker Compose setup), write a simple DAG with two or three PythonOperator tasks with explicit dependencies, and verify it runs successfully in the Airflow UI. Deliverable: a working local Airflow instance running your DAG on a schedule. Skills exercised: basic DAG authoring, operators, dependencies.

### Lab 2 (Intermediate): Add sensors, retries, and idempotent writes
Extend Lab 1 with a FileSensor (in "reschedule" mode) waiting on an external file, configure retries with exponential backoff on a task that simulates transient failure, and implement an idempotent write to a local database, with a test proving no duplication occurs under a simulated retry. Deliverable: a DAG with verified idempotent behavior under retry. Skills exercised: sensors, retry configuration, idempotency.

### Lab 3 (Advanced): Delegate processing to Spark and decompose into multiple DAGs
Refactor a single monolithic DAG into two or three smaller DAGs (ingest, transform, notify) linked via Datasets, with the transform step delegating actual data processing to a Spark job via SparkSubmitOperator (or a local Spark installation) rather than doing it inline in Python. Deliverable: a documented, decomposed pipeline demonstrating the orchestration/processing separation. Skills exercised: DAG decomposition, Dataset-based scheduling, Spark integration.

### Lab 4 (Production): Deploy Airflow with a real executor and monitoring
Deploy Airflow using the CeleryExecutor (or KubernetesExecutor) rather than the default local setup, configure pools/concurrency limits, and add basic monitoring (task duration and failure rate metrics exported to Prometheus/Grafana). Deliverable: a documented production-shaped Airflow deployment with working executor scaling and monitoring. Skills exercised: executor architecture, concurrency management, monitoring.
`,

  "real-projects": `
### 1. A daily ELT pipeline with data-availability sensing and Spark processing
Engineering requirements: a deferrable or reschedule-mode sensor waiting for upstream data availability, a SparkSubmitOperator delegating actual transformation, idempotent loading into a warehouse, and a notification step on completion or failure, with retries and backoff configured throughout.

### 2. An ML retraining pipeline orchestrated across ingestion, training, and evaluation
Engineering requirements: a DAG (or set of composed DAGs linked via Datasets) that waits for new labeled data, triggers a training job (on a GPU cluster, orchestrated but not run by Airflow itself), runs evaluation, and conditionally promotes a new model version only if it outperforms the current one — directly connecting to the **MLOps** skill.

### 3. A multi-team, decomposed data platform pipeline
Engineering requirements: multiple independently-owned DAGs (by different teams) linked via Datasets rather than one shared monolithic DAG, with appropriate pools/concurrency isolation so one team's heavy DAG activity cannot starve another team's tasks, and dashboards showing cross-team pipeline health.
`,

  "case-studies": `
### Airbnb's creation of Airflow to tame internal pipeline sprawl
Airbnb built Airflow specifically because its own growing web of internal data pipelines, previously managed via ad hoc cron jobs and scripts, had become too complex and opaque to reason about reliably — Airflow's DAG-as-code model, centralized scheduling, and shared UI directly addressed this, and the project's subsequent open-sourcing and adoption by the broader industry validated that this was a widely-shared pain, not one specific to Airbnb. Lesson: internal tooling built to solve a company's own genuine operational pain is often the strongest candidate for a broadly useful open-source project, precisely because it was forced to work against real, messy production constraints from day one.

### The industry-wide adoption of managed Airflow (MWAA, Cloud Composer, Astronomer)
As Airflow adoption grew, the operational burden of running the scheduler, metadata database, and executor infrastructure reliably became a significant, recurring cost for many teams — leading major cloud providers and dedicated companies to build managed Airflow offerings, letting teams get Airflow's orchestration benefits without operating its infrastructure themselves. Lesson: once an open-source tool becomes broadly load-bearing infrastructure across an industry, a managed-service ecosystem reliably emerges around it, and choosing a managed offering over self-hosting is frequently the pragmatic default rather than a compromise.

### Teams repeatedly rediscovering the orchestration/processing boundary the hard way
A recurring pattern across many organizations adopting Airflow: teams initially put real data processing directly inside PythonOperator tasks (because it's the path of least resistance when first learning the tool), then hit worker crashes or scaling ceilings as data volume grows, and eventually refactor to delegate actual processing to Spark or a warehouse, with Airflow purely orchestrating. Lesson: a tool's most convenient initial usage pattern is not always its correct production usage pattern — Airflow's ease of running arbitrary Python code inside a task is a feature for orchestration logic and a liability for heavy data processing, and recognizing this boundary early avoids a costly, disruptive later refactor.
`,

  comparisons: `
| Aspect | Airflow | Kubeflow |
|--------|---------|----------|
| Primary focus | General-purpose workflow orchestration (data + ML + anything schedulable) | ML-pipeline-specific orchestration, built natively on Kubernetes |
| Authoring model | Python DAGs (classic operators or TaskFlow API) | Kubernetes-native pipeline components, often defined via a Python SDK compiled to Kubernetes resources |
| Best fit | Broad data/ETL/ML orchestration across heterogeneous systems | Teams already deeply invested in Kubernetes wanting ML-pipeline-specific tooling (experiment tracking, model serving integration) |

| Aspect | Airflow | Spark |
|--------|---------|-------|
| Role | Orchestration — decides WHEN and in what ORDER work runs | Processing — actually performs distributed data computation |
| What it touches | Task metadata, schedules, dependencies, retries | The actual dataset being transformed |
| Typical relationship | Triggers and waits for a Spark job's completion | Runs the job Airflow triggered, reports back completion |

| Aspect | Airflow | Plain cron + scripts |
|--------|---------|------------------------|
| Dependency handling | Explicit, declared DAG structure | Implicit, based on timing guesses |
| Retry handling | Built-in, configurable per task | Hand-rolled per script, if implemented at all |
| Visibility | Centralized UI showing all DAG runs and task states | Scattered log files across individual machines |

**How seniors choose**: default to Airflow for general-purpose, heterogeneous workflow orchestration spanning data and ML; consider Kubeflow specifically when a team is deeply Kubernetes-native and wants ML-pipeline-specific tooling built on that foundation; never treat Airflow and Spark (or any real processing engine) as substitutes for each other — they solve genuinely different problems and are meant to be used together, not as alternatives.
`,

  "related-technologies": `
- **Spark** — the processing engine Airflow most commonly orchestrates for the actual heavy-lifting step in a data pipeline; the natural next skill for understanding the processing side of the orchestration/processing boundary.
- **Kubeflow** — a sibling orchestration platform focused specifically on ML pipelines running natively on Kubernetes; a useful comparison point for when Kubernetes-native ML tooling might fit better than general-purpose Airflow.
- **MLOps** — the broader operational discipline (versioning, monitoring, retraining, deployment of models) that Airflow-orchestrated pipelines commonly support in practice.
- **Data Pipelines** — the broader engineering discipline of designing reliable data flow through a system, of which Airflow is one (very common) concrete scheduling/orchestration implementation.
- **Kubernetes** — a common deployment target for Airflow itself (via the KubernetesExecutor) and for the individual jobs Airflow triggers (via the KubernetesPodOperator).
- **Message Queues** — the broker/producer-consumer concepts directly underlying Airflow's CeleryExecutor.

Learning path: **Python** → this page → **Spark** (the processing engine Airflow commonly orchestrates) → **Kubeflow** (a sibling ML-pipeline-specific orchestration platform) → **MLOps** (the broader operational discipline these tools support).
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued maturation of the TaskFlow API and Datasets/Assets-based, data-aware scheduling (triggering DAGs based on data availability rather than only fixed schedules) across successive Airflow 2.x releases.
- Continued growth of deferrable operators, reducing worker/scheduler resource consumption for long-running waits.
- Continued maturity and adoption of managed Airflow offerings (Amazon MWAA, Google Cloud Composer, Astronomer) as a standard default deployment choice for many teams.
- Because Airflow's API surface (especially TaskFlow versus classic operators, and Datasets/Assets terminology and capabilities) has evolved meaningfully across major and minor versions, always verify exact current syntax, parameter names, and available features against the official documentation for the specific Airflow version you're using, rather than assuming stability across versions.
`,

  "future-roadmap": `
Where Airflow is heading, and what's worth betting career time on:

- **Continued growth of data-aware, Dataset/Asset-based scheduling**, moving pipelines further from purely time-based schedules toward genuinely event/data-driven triggering.
- **Continued expansion of deferrable operators**, making long-running waits progressively cheaper in terms of scheduler/worker resource consumption.
- **Continued dominance of managed Airflow offerings**, reducing the operational burden of running Airflow's own infrastructure for most teams.
- **Growing orchestration of AI/ML-specific workloads** (retraining pipelines, evaluation pipelines, agentic pipeline steps) alongside Airflow's traditional data-engineering use cases.
- **What to bet on**: deeply understanding the durable concepts (DAGs, idempotency, the orchestration/processing boundary, executor architecture, sensor design) — these transfer directly across Airflow's own evolving API surface and even across orchestration tools generally (including Kubeflow and newer entrants), a far more durable investment than memorizing one specific version's exact syntax.
`,

  "cheat-sheet": `
~~~
# ---- What Airflow is / is not ----
IS: an orchestrator -- decides WHEN and in what ORDER work runs,
    handles retries/dependencies.
IS NOT: a data processing engine -- delegate real computation
    to Spark or a warehouse.
~~~

~~~python
# ---- Minimal classic-operator DAG ----
from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator

with DAG("my_dag", start_date=datetime(2026,1,1),
         schedule="@daily", catchup=False) as dag:
    t1 = PythonOperator(task_id="a", python_callable=fn_a)
    t2 = PythonOperator(task_id="b", python_callable=fn_b)
    t1 >> t2
~~~

~~~python
# ---- Minimal TaskFlow API DAG ----
from airflow.decorators import dag, task
from datetime import datetime

@dag(start_date=datetime(2026,1,1), schedule="@daily", catchup=False)
def my_dag():
    @task
    def a():
        return 1
    @task
    def b(x):
        return x + 1
    b(a())
my_dag()
~~~

~~~
# ---- Retries & backoff ----
retries=3
retry_delay=timedelta(minutes=5)
retry_exponential_backoff=True
execution_timeout=timedelta(hours=2)
~~~

~~~
# ---- Sensors: mode matters ----
mode="poke": holds a worker slot the whole wait -- avoid for
    long waits.
mode="reschedule": frees the worker slot between checks --
    good default for non-trivial waits.
Deferrable operator: hands off to the triggerer, no worker
    slot at all -- best for very long waits.
~~~

~~~
# ---- XCom ----
Use for: small values (counts, paths, flags).
NEVER use for: large datasets -- bloats the metadata DB.
Pattern: write data to storage, pass only the PATH via XCom.
~~~

~~~
# ---- Idempotency is mandatory ----
WRONG: INSERT ... (blind append) -- retries double the data.
RIGHT: DELETE WHERE ds=... THEN INSERT, or UPSERT/MERGE.
~~~

~~~
# ---- Executors ----
LocalExecutor: single machine, simple, doesn't scale out.
CeleryExecutor: worker fleet via a broker -- steady, moderate load.
KubernetesExecutor: each task = its own pod -- heterogeneous workloads.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What does a DAG's acyclic property guarantee? | A valid execution order always exists — no task can depend on itself. |
| What is Airflow's role versus Spark's? | Airflow orchestrates (when/order/retries); Spark processes the actual data. |
| Why must tasks be idempotent? | Retries are the normal case; non-idempotent writes double-process on retry. |
| What is XCom for, and what should you never put in it? | Small values between tasks; never large data payloads. |
| Difference between "poke" and "reschedule" sensor mode? | Poke holds a worker slot the whole wait; reschedule frees it between checks. |
| What is a deferrable operator? | One that hands off waiting to a lightweight triggerer, using no worker slot. |
| What is the "logical date"? | The period a DAG run is FOR, not necessarily when it actually executes. |
| Classic operators vs TaskFlow API? | Same underlying DAG model; TaskFlow is a decorator-based, more Pythonic authoring style. |
| Why avoid one monolithic DAG? | Shared failure/scheduling blast radius; hard to test, own, or reason about. |
| CeleryExecutor vs KubernetesExecutor? | Celery = steady worker fleet via a broker; Kubernetes = each task its own pod. |
| Why keep DAG-file top-level code cheap? | It's re-parsed repeatedly by the scheduler across the whole deployment. |
| What links smaller, composed DAGs together? | Datasets/Assets (data-aware scheduling) or TriggerDagRunOperator. |
`,

  mcqs: `
1. What is Airflow's primary responsibility in a data pipeline?
   A) Performing distributed data transformations  B) Orchestrating when and in what order tasks run, including retries and dependencies  C) Storing large datasets  D) Serving a machine learning model
   **Answer: B** — Airflow orchestrates; a dedicated engine like Spark performs the actual processing.

2. Why is doing heavy data processing inside a PythonOperator considered an anti-pattern?
   A) PythonOperator cannot run Python code  B) Airflow workers aren't designed or sized for heavy in-memory processing and can crash under load  C) It's actually the recommended pattern  D) PythonOperator only works with Bash commands
   **Answer: B** — heavy processing belongs on a dedicated engine like Spark, not inside an orchestration worker.

3. Why must Airflow tasks generally be idempotent?
   A) Idempotency improves task execution speed  B) Because retries are the normal, expected case, and non-idempotent writes cause incorrect duplication under retry  C) Airflow guarantees exactly-once execution by default  D) It's only relevant for sensors
   **Answer: B** — retries are a first-class, expected part of Airflow's execution model.

4. What is the key difference between sensor "poke" mode and "reschedule" mode?
   A) They behave identically  B) "Poke" holds a worker slot for the entire wait; "reschedule" frees the slot between checks  C) "Reschedule" mode cannot be used with FileSensor  D) "Poke" mode is always faster
   **Answer: B** — "reschedule" (or a deferrable operator) is the better production default for non-trivial waits.

5. What should you never pass through XCom?
   A) A file path  B) A row count  C) A large dataset/DataFrame  D) A status flag
   **Answer: C** — XCom is stored in the metadata database and meant for small values only.

6. Why is a monolithic, all-in-one DAG generally considered an anti-pattern for a complex pipeline?
   A) Airflow technically cannot support more than 10 tasks in one DAG  B) It creates a large shared failure/scheduling blast radius and is hard to test or own independently  C) It always runs faster than smaller DAGs  D) It removes the need for retries
   **Answer: B** — smaller, composable DAGs linked via Datasets are the senior-recommended pattern.
`,

  "revision-notes": `
Apache Airflow is a workflow ORCHESTRATION platform, not a data processing engine — it decides WHEN and in what ORDER tasks run, handles RETRIES and dependency resolution, and exposes centralized visibility into pipeline health, while deliberately delegating actual heavy computation to a dedicated engine like **Spark** or a data warehouse. A workflow is expressed as a DAG (Directed Acyclic Graph) written in Python — the acyclic property guarantees a valid execution order always exists. Tasks can be authored via the classic operator style (explicit operators wired together with ">>") or the newer, decorator-based TaskFlow API (introduced in Airflow 2.0) — both build the same underlying DAG-of-tasks model, and production codebases frequently mix both styles.

RETRIES, BACKOFF, and TIMEOUTS are first-class, declarative properties of a task, not something each pipeline author hand-rolls — retries with exponential backoff avoid worsening load on an already-struggling downstream system. XCOM is Airflow's mechanism for passing small values between tasks via the metadata database, and must never carry large data payloads (which bloat the metadata database and degrade scheduler performance) — the correct pattern is writing real data to shared storage and passing only a reference through XCom. SENSORS wait on external conditions (a file appearing, an upstream DAG finishing); "poke" mode wastefully holds a worker slot for the entire wait, "reschedule" mode frees it between checks, and DEFERRABLE operators go further still, handing the wait off to a lightweight triggerer process with no worker slot consumed at all — a critical production distinction for any non-trivial wait.

The single most important production discipline is IDEMPOTENCY: because Airflow's retry model means a task can genuinely run more than once for the same logical date, every task that writes data must produce the SAME end result whether run once or retried — typically via a delete-then-insert or upsert pattern rather than a blind, unconditional append. The single most important architectural discipline is respecting the ORCHESTRATION/PROCESSING BOUNDARY: Airflow decides when a Spark job (or equivalent) runs and with what inputs, but the actual heavy computation must run on dedicated processing infrastructure, never directly inside an Airflow worker's PythonOperator — violating this is the classic Airflow anti-pattern, risking worker crashes and losing the benefits of a real processing engine's distributed execution model.

A senior engineer also decomposes large pipelines into SMALLER, COMPOSABLE DAGs (linked via Datasets/Assets for data-aware scheduling, or TriggerDagRunOperator) rather than building one monolithic DAG spanning an entire organization's pipeline — smaller DAGs are independently testable, independently ownable, and don't share one large failure/scheduling blast radius. The SCHEDULER re-parses DAG files on a recurring interval, so expensive top-level code in a DAG file directly degrades scheduling performance across the ENTIRE deployment, not just that one DAG — a frequently-overlooked but important operational fact.

EXECUTOR choice (LocalExecutor for simple, single-machine setups; CeleryExecutor for a steady worker fleet via a message broker; KubernetesExecutor for per-task pod isolation, well-suited to heterogeneous workloads) should match actual workload shape and existing infrastructure investment. Managed offerings (Amazon MWAA, Google Cloud Composer, Astronomer) let many teams use Airflow without operating its own scheduler/metadata-database/executor infrastructure themselves, and are a completely standard, pragmatic production choice rather than a compromise.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding DAGs, operators, both authoring styles (classic and TaskFlow), and basic scheduling semantics (including the logical-date subtlety). Milestone: complete Lab 1, with a working local Airflow instance running a simple scheduled DAG.

**Week 2 — Reliability primitives**: retries, backoff, sensors (poke versus reschedule mode), XCom usage, and idempotent task design with tests proving no duplication under retry. Milestone: complete Lab 2.

**Week 3 — Orchestration versus processing, and DAG decomposition**: delegating real processing to Spark via SparkSubmitOperator, and refactoring a monolithic DAG into smaller, Dataset-linked pieces. Milestone: complete Lab 3.

**Week 4 — Production deployment**: deploying with a real executor (Celery or Kubernetes), configuring pools/concurrency limits, and setting up monitoring and alerting. Milestone: complete Lab 4, with a documented, production-shaped deployment.

**Week 5 — Applied architecture decisions**: practicing choosing executor types, sensor modes, and DAG decomposition strategies for a range of described real-world scenarios; reviewing senior-level interview questions on idempotency and the orchestration/processing boundary.

Next platform skill once this roadmap is complete: **Spark**, covering the distributed data processing engine Airflow most commonly orchestrates.
`,

  "official-docs": `
- **Apache Airflow's official documentation** — the authoritative reference for DAG authoring, operators, the TaskFlow API, scheduling semantics, and executor configuration; always check the version-specific docs, since API details (particularly TaskFlow and Datasets/Assets) have evolved across major and minor releases.
- **Amazon MWAA, Google Cloud Composer, Astronomer official documentation** — the authoritative references for the major managed Airflow offerings, covering their specific deployment and configuration models.
- **Apache Airflow's provider package documentation** (e.g. apache-airflow-providers-apache-spark, apache-airflow-providers-cncf-kubernetes) — the authoritative reference for specific integrations like SparkSubmitOperator and KubernetesPodOperator.
`,

  books: `
- **"Data Pipelines with Apache Airflow" — Bas Harenslak and Julian de Ruiter** — a dedicated, practical treatment of Airflow specifically, covering DAG design, testing, and production deployment.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — not Airflow-specific, but essential for the broader distributed-systems and pipeline-reliability concepts (idempotency, delivery guarantees) Airflow pipelines depend on.
- **"Fundamentals of Data Engineering" — Joe Reis and Matt Housley** — covers Airflow's role within the broader data engineering lifecycle and pipeline architecture decisions.
`,

  blogs: `
- **The official Apache Airflow blog and release notes** — the most direct, high-signal source for new features (Datasets/Assets, deferrable operators) and migration guidance across versions.
- **Astronomer's engineering blog** — practical, production-focused Airflow guidance from a company built specifically around operating Airflow at scale.
- **Airbnb's engineering blog (historical posts on Airflow's original creation)** — foundational context on the problems that motivated Airflow's design.
`,

  "research-papers": `
- No single foundational academic paper defines Airflow's architecture — it emerged primarily from Airbnb's internal engineering practice rather than academic research; if you want the closest foundational academic reading, look at general distributed-systems and workflow-scheduling literature (covered in the **Distributed Systems** skill), which underlies the delivery-guarantee and idempotency concepts Airflow pipelines depend on in practice.
`,

  videos: `
- **Official Apache Airflow conference talks (Airflow Summit)** — the highest-signal source for deep-dive talks on scheduler internals, TaskFlow API design, and production deployment patterns, directly from Airflow's own maintainers and heavy users.
- **Astronomer's own Airflow tutorial and webinar series** — practical, hands-on walkthroughs from a company specializing in production Airflow deployments.
- **Conference talks on data pipeline and MLOps architecture** that reference Airflow as the orchestration layer within a broader system design.
`,

  "github-repos": `
- **apache/airflow** — the official Apache Airflow source repository; the authoritative place to see actual scheduler, executor, and provider implementation.
- **apache/airflow-client-python** — the official Python client for Airflow's REST API.
- **astronomer/astro-cli** — Astronomer's open-source CLI tooling for local Airflow development.
- **apache/airflow-providers** (provider packages within the main apache/airflow monorepo) — the integrations connecting Airflow to Spark, Kubernetes, major cloud providers, and more.
- **marclamberti/airflow-tutorial**-style community tutorial repositories — useful for seeing varied, worked example DAGs (verify currency against your specific Airflow version).
`,

  "practice-problems": `
Ordered by skill focus:

1. **DAG design**: given a described multi-step data pipeline, design an appropriate DAG structure with correct dependencies and sensible task granularity.
2. **Idempotency design**: given a described write operation, design an idempotent version and a test proving no duplication under a simulated retry.
3. **Sensor mode selection**: given a described wait scenario (expected duration, deployment scale), choose and justify poke/reschedule/deferrable sensor mode.
4. **DAG decomposition**: given a described monolithic DAG, refactor it into smaller, Dataset-linked DAGs with justified boundaries.
5. **Executor selection**: given a described workload shape and infrastructure context, choose and justify LocalExecutor, CeleryExecutor, or KubernetesExecutor.
6. **External practice sets**: Airflow Summit talk exercises and the official Airflow tutorial's own worked examples, verified against your specific Airflow version.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph ControlPlane["Airflow Control Plane"]
        Scheduler["Scheduler"]
        Webserver["Webserver / UI"]
        MetaDB[("Metadata Database")]
        Triggerer["Triggerer\n(deferrable ops)"]
    end
    subgraph Orchestrated["What Airflow Orchestrates (not processes)"]
        Sensor["Sensor:\nwait for data availability"]
        SparkSubmit["SparkSubmitOperator:\nsubmit processing job"]
        Notify["Notification task"]
    end
    subgraph ProcessingLayer["Actual Processing (outside Airflow)"]
        SparkCluster["Spark Cluster"]
    end
    Scheduler <--> MetaDB
    Webserver <--> MetaDB
    Triggerer <--> MetaDB
    Scheduler --> Sensor
    Sensor --> SparkSubmit
    SparkSubmit --> SparkCluster
    SparkCluster -->|"job completion"| SparkSubmit
    SparkSubmit --> Notify
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Airflow))
    Foundations
      Overview
      History Airbnb 2014 Apache TLP 2019
      Why it exists
      Problem it solves orchestration not processing
    Core Concepts
      DAGs
      Operators PythonOperator BashOperator Sensors
      TaskFlow API
      Schedules and logical date
    Reliability
      Retries and backoff
      Idempotent tasks
      XCom small values only
      Dead simple sensors poke reschedule deferrable
    Architecture
      Scheduler
      Executor LocalExecutor CeleryExecutor KubernetesExecutor
      Metadata database
      Triggerer
    Production Discipline
      Orchestration vs processing boundary
      DAG decomposition Datasets
      Monitoring and alerting
      Security secrets RBAC
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default airflow;
