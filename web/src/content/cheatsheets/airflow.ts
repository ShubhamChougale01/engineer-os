import type { CheatSheetData } from "./types";

const airflowCheatSheet: CheatSheetData = {
  title: "The Ultimate Airflow Cheat Sheet",
  subtitle: "DAGs, operators, sensors, and the orchestration/processing boundary",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "DAG", desc: "Directed Acyclic Graph of tasks; must be acyclic for a valid execution order" },
        { term: "Task", desc: "A single instantiated unit of work within a DAG, given a unique task_id" },
        { term: "Operator", desc: "A template defining what kind of work a task does" },
        { term: "Airflow's job", desc: "Orchestrate WHEN/ORDER/retries — never process data itself" },
        { term: "Spark's job", desc: "Actually perform the heavy data computation Airflow triggers" },
        {
          term: "Classic DAG syntax",
          desc: "Explicit operators wired with >>",
          code: "t1 = PythonOperator(task_id=\"a\", python_callable=fn_a)\nt2 = PythonOperator(task_id=\"b\", python_callable=fn_b)\nt1 >> t2",
        },
        {
          term: "TaskFlow API",
          desc: "Decorator-based; dependencies inferred from function calls",
          code: "@task\ndef a(): return 1\n@task\ndef b(x): return x + 1\nb(a())",
        },
      ],
    },
    {
      title: "Scheduling & Dates",
      color: "blue",
      rows: [
        { term: "schedule", desc: "How often new DAG runs are created, e.g. \"@daily\" or a cron string" },
        { term: "Logical date", desc: "The period a DAG run is FOR, not necessarily when it executes" },
        { term: "catchup", desc: "Whether to backfill every interval since start_date; usually set False" },
        { term: "max_active_runs", desc: "Caps concurrent DAG runs — prevents overlap for the same DAG" },
        { term: "Datasets/Assets", desc: "Trigger a downstream DAG when an upstream DAG produces declared data" },
      ],
    },
    {
      title: "Reliability Primitives",
      color: "emerald",
      rows: [
        {
          term: "Retries + backoff",
          desc: "First-class, declarative — never hand-rolled per task",
          code: "retries=3\nretry_delay=timedelta(minutes=5)\nretry_exponential_backoff=True\nexecution_timeout=timedelta(hours=2)",
        },
        {
          term: "Idempotent write",
          desc: "Same end result whether run once or retried",
          code: "DELETE FROM t WHERE ds=... ;\nINSERT ...  -- or UPSERT/MERGE",
        },
        { term: "Non-idempotent (wrong)", desc: "Blind append — a retry inserts a duplicate copy of the data" },
        { term: "XCom", desc: "Small values only (counts, paths, flags) between tasks" },
        { term: "XCom anti-pattern", desc: "Never pass a large dataset/DataFrame through XCom" },
      ],
    },
    {
      title: "Sensors",
      color: "amber",
      rows: [
        { term: "Sensor", desc: "An operator that polls for an external condition before proceeding" },
        { term: "mode=\"poke\"", desc: "Holds a worker slot for the whole wait — avoid for long waits" },
        { term: "mode=\"reschedule\"", desc: "Frees the worker slot between checks — good default" },
        { term: "Deferrable operator", desc: "Hands wait off to the triggerer — no worker slot consumed at all" },
        {
          term: "FileSensor example",
          desc: "Wait for a file before letting downstream tasks run",
          code: "FileSensor(task_id=\"wait\", filepath=\"/data/{{ ds }}.csv\",\n  poke_interval=60, timeout=3600*4, mode=\"reschedule\")",
        },
      ],
    },
    {
      title: "Anti-Patterns",
      color: "rose",
      rows: [
        { term: "Heavy processing in PythonOperator", desc: "Crashes workers; delegate to Spark instead" },
        { term: "Non-idempotent tasks", desc: "Retries silently double-process data" },
        { term: "Monolithic DAG", desc: "One giant DAG shares a single failure/scheduling blast radius" },
        { term: "Expensive DAG-file top-level code", desc: "Re-parsed repeatedly — slows the whole scheduler" },
        { term: "Poke-mode sensors for long waits", desc: "Wastes worker capacity across the deployment" },
      ],
    },
    {
      title: "Architecture & Executors",
      color: "cyan",
      rows: [
        { term: "Scheduler", desc: "Parses DAGs, decides what's runnable, hands tasks to the executor" },
        { term: "Metadata database", desc: "Stores DAG/task state, XComs, connections — shared bottleneck" },
        { term: "LocalExecutor", desc: "Single machine, simple, doesn't scale out" },
        { term: "CeleryExecutor", desc: "Worker fleet via a message broker — steady, moderate load" },
        { term: "KubernetesExecutor", desc: "Each task its own pod — heterogeneous workloads, per-task isolation" },
        { term: "Triggerer", desc: "Manages many deferred/waiting operators efficiently, no worker slot" },
        { term: "Pools", desc: "Allocate/isolate concurrency budget per team or scarce resource" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "violet",
      rows: [
        { term: "airflow tasks test", desc: "Run a single task in isolation, outside full scheduler machinery" },
        { term: "DagBag import test", desc: "Fast unit test catching DAG import errors before deploy" },
        { term: "SLA miss", desc: "Airflow's built-in flag for a task/DAG run exceeding expected duration" },
        { term: "Secrets backend", desc: "Store credentials properly — never plaintext Airflow variables" },
        { term: "Managed Airflow", desc: "Amazon MWAA, Google Cloud Composer, Astronomer — skip self-hosting" },
      ],
    },
  ],
};

export default airflowCheatSheet;
