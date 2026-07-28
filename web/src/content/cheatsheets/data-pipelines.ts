import type { CheatSheetData } from "./types";

const dataPipelines: CheatSheetData = {
  title: "The Ultimate Data Pipelines Cheat Sheet",
  subtitle: "ETL/ELT · idempotency · data quality · orchestration vs processing · observability",
  sections: [
    {
      title: "Core Vocabulary",
      color: "violet",
      rows: [
        { term: "Data pipeline", desc: "Any system that moves data from source(s) to destination(s) through extraction, transformation, and loading", code: "Source -> Extract -> Transform -> Load -> Destination" },
        { term: "ETL", desc: "Extract, Transform, Load — data is transformed before it reaches the destination", code: "Source -> [Transform engine] -> Destination (clean only)" },
        { term: "ELT", desc: "Extract, Load, Transform — raw data lands first, transform uses destination compute", code: "Source -> Destination (raw) -> Transform in place -> clean tables" },
        { term: "Batch pipeline", desc: "Processes a bounded chunk of data on a schedule; the simpler default", code: "Run nightly: process yesterday's rows" },
        { term: "Streaming pipeline", desc: "Processes unbounded events as they arrive; only worth it for a real latency need", code: "Consume Kafka topic -> windowed aggregate" },
        { term: "Orchestration", desc: "Deciding WHEN and in what ORDER things run, retries, alerting (e.g. Airflow)", code: "task_extract >> task_transform >> task_load" },
        { term: "Processing engine", desc: "Does the actual computation an orchestrator triggers (e.g. Spark, warehouse SQL)", code: "df.groupBy('customer_id').agg(sum('amount'))" },
        { term: "Idempotency", desc: "Running a stage twice with the same input yields the same result as running once", code: "load(rows); load(rows)  # table state identical" },
        { term: "Backfill", desc: "Deliberately reprocessing a historical date range", code: "run_pipeline(start='2026-01-01', end='2026-03-31')" },
        { term: "Watermark", desc: "Declared assumption about how late an event can arrive before a window is final", code: "allowed_lateness = '10 minutes'" },
        { term: "Data lineage", desc: "Tracking which run produced which downstream rows", code: "run_id -> [orders_raw, customer_ltv, dashboard_metric]" },
        { term: "Data contract", desc: "Explicit statement of a pipeline output's schema, types, and quality tolerances", code: "columns: order_id, customer_id, amount\nnull_rate(amount) < 1%" },
      ],
    },
    {
      title: "Idempotent Loading (core objects)",
      color: "blue",
      rows: [
        { term: "Blind insert (BAD)", desc: "Duplicates rows on every retry — never do this for pipeline loads", code: "INSERT INTO orders VALUES (id, cust, amt)\n-- retry => duplicate row" },
        { term: "Upsert by natural key", desc: "Insert or update keyed on a unique identifier — safe to re-run", code: "INSERT INTO orders (order_id, amt)\nVALUES (:id, :amt)\nON CONFLICT (order_id)\nDO UPDATE SET amt = excluded.amt" },
        { term: "Partition overwrite", desc: "Overwrite an entire date/key partition instead of appending", code: "DELETE FROM t WHERE dt = :d;\nINSERT INTO t SELECT * FROM staged WHERE dt = :d;" },
        { term: "Late-write guard", desc: "Only apply an update if it's newer than what's stored — handles out-of-order retries", code: "... WHERE excluded.updated_at >= t.updated_at" },
        { term: "Watermark-based extraction", desc: "Only pull rows changed since last successful run", code: "SELECT * FROM src WHERE updated_at > :last_watermark" },
        { term: "Dedup key", desc: "Unique event/batch ID used to skip already-processed work in streaming", code: "if event_id in seen: skip()\nelse: process(event); seen.add(event_id)" },
        { term: "Run-twice test", desc: "The cheapest way to catch an idempotency regression", code: "load(rows); load(rows)\nassert row_count == expected  # not doubled" },
      ],
    },
    {
      title: "Data Quality & Validation",
      color: "emerald",
      rows: [
        { term: "Row count check", desc: "Catch empty or wildly oversized batches", code: "if not rows: raise ValidationError('row_count', 'empty batch')" },
        { term: "Null rate check", desc: "Halt if a critical column exceeds a null-rate threshold", code: "null_rate = nulls / len(rows)\nif null_rate > 0.01: raise ValidationError(...)" },
        { term: "Range check", desc: "Catch impossible values (negative amounts, future dates)", code: "bad = [r for r in rows if r['amount'] < 0]" },
        { term: "Schema check", desc: "Fail loudly if expected columns are missing", code: "missing = required_cols - rows[0].keys()\nif missing: raise ValidationError('schema', missing)" },
        { term: "Halt policy", desc: "Stop the whole pipeline on violation — for compliance/financial-critical data", code: "validate(rows)  # raises, pipeline stops before load" },
        { term: "Quarantine policy", desc: "Route bad rows aside, let good rows proceed — for high-volume imperfect sources", code: "good, quarantined = validate_and_split(rows)\nsave(quarantined, 'dead_letter')" },
        { term: "Quarantine-rate ceiling", desc: "Even quarantining has a limit — halt if too much of the batch is bad", code: "if quarantined / len(rows) > 0.10: raise ValidationError(...)" },
        { term: "Distribution check", desc: "Compare today's stats to a historical baseline, not just pass/fail thresholds", code: "compare(today.null_rate, baseline.null_rate)" },
      ],
    },
    {
      title: "Schema Evolution & Backfills",
      color: "amber",
      rows: [
        { term: "Strict contract strategy", desc: "Any schema deviation is a validation failure — safest, least flexible", code: "assert set(row.keys()) == EXPECTED_SCHEMA" },
        { term: "Schema-on-read strategy", desc: "Land raw data as-is; reconcile shape differences at transform time", code: "Parquet schema merging / permissive lakehouse read" },
        { term: "Versioned migration strategy", desc: "Track schema versions, write explicit migration logic for changes", code: "if schema_version == 1: row['new_col'] = default" },
        { term: "Silent coercion (BAD)", desc: "Permissive .get() everywhere quietly turns a rename into all-nulls", code: "row.get('old_name')  # silently None after rename" },
        { term: "Backfill = re-run for a range", desc: "Safe only if load is idempotent (upsert / partition overwrite)", code: "for day in date_range(start, end): run_pipeline(day)" },
        { term: "Deterministic transforms", desc: "Backfills need transform logic that depends on input date, not on 'now'", code: "def transform(rows, run_date): ...  # not datetime.now()" },
        { term: "Test backfills proactively", desc: "Exercise the backfill path periodically, not only during an incident", code: "run_backfill(staging_env, '2025-01-01', '2025-01-07')" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Non-idempotent retries", desc: "The #1 classic mistake — duplicated/corrupted data whenever a job is retried", code: "# retry after timeout => same rows inserted twice" },
        { term: "No quality gate", desc: "Bad data flows silently downstream and corrupts models/dashboards", code: "load(transform(rows))  # nothing checks 'clean'" },
        { term: "Tightly coupled E-T-L", desc: "One failure forces redoing extraction + transform + load from scratch", code: "def pipeline(): extract(); transform(); load()  # atomic, no checkpoints" },
        { term: "Assuming schema never changes", desc: "Source renames/retypes columns eventually — always", code: "# renamed col silently becomes all-null downstream" },
        { term: "Job success != data correctness", desc: "Exit code 0 does not mean the data produced was right", code: "# infra health != data health" },
        { term: "Logging full row payloads", desc: "Leaks PII into log aggregation systems with broader access than the source", code: "logger.info(row)  # BAD: dumps full payload\nlogger.info(row['id'])  # better" },
        { term: "Streaming without a latency need", desc: "Adds real complexity (windowing, late data) not justified by the use case", code: "# ask: is sub-minute latency actually required?" },
        { term: "Business logic buried in DAG tasks", desc: "Hard to test/reuse — keep transform logic in testable functions/SQL", code: "# orchestrator triggers logic, doesn't contain it" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Orchestrator", desc: "Coordinates scheduling, dependencies, retries, alerting (see Airflow)", code: "extract_task >> validate_task >> load_task" },
        { term: "Processing engine", desc: "Distributed computation for data too big for one machine (see Spark)", code: "spark.read.parquet(path).groupBy(...).agg(...)" },
        { term: "Feature Store", desc: "ML-specific destination guaranteeing train/serve feature consistency", code: "store.get_online_features(entity_ids)" },
        { term: "Freshness metric", desc: "Time since destination was last successfully updated vs. SLA", code: "if now() - last_success > sla: alert()" },
        { term: "Volume metric", desc: "Row count vs. rolling historical baseline", code: "if abs(count - baseline_avg) > 3 * stdev: alert()" },
        { term: "Lineage metadata", desc: "Which run produced which output rows, for fast incident scoping", code: "record(run_id, input_range, output_tables)" },
        { term: "Secrets management", desc: "Source/destination credentials scoped to minimum access, rotated", code: "conn = connect(secrets.get('warehouse_ro'))" },
        { term: "Idempotent Dockerfile task", desc: "Pinned base image, non-root user, runtime-injected secrets", code: "FROM python:3.12-slim-bookworm\nUSER pipeline\nENTRYPOINT [\"python\", \"-m\", \"pipeline.entrypoint\"]" },
        { term: "SLA + alert", desc: "Explicit deadline for critical outputs, paging on miss", code: "if not ready_by(6, 0): page_oncall()" },
      ],
    },
  ],
};

export default dataPipelines;
