import type { SkillContent } from "../types";

/**
 * Data Pipelines — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const dataPipelines: SkillContent = {
  overview: `
A data pipeline is any system that moves data from one or more sources, transforms it, and lands it somewhere it can be used — a warehouse table, a feature store, a model training set, a dashboard. "Data Pipelines" as a skill is not a single tool; it is the discipline of designing that movement so it is correct, repeatable, observable, and cheap to operate at scale. It is the connective tissue underneath almost every other skill in the MLOps and Data Engineering category: **Airflow** and similar schedulers orchestrate pipelines, **Spark** and similar engines execute the heavy transformation work inside them, **Feature Stores** are a specialized destination for ML-ready pipeline output, and **AI Monitoring** watches the models that pipelines ultimately feed.

For an AI engineer, this matters because models are only as good as the data arriving in them. A perfectly tuned model trained on data corrupted by a silent pipeline bug — duplicated rows from a retried job, a schema change that quietly nulled out a critical column, a backfill that only covered part of the history — will look fine in code review and fail in ways that are extremely hard to trace back to the root cause. Pipeline design decisions (idempotency, validation, schema handling) are therefore ML-reliability decisions, not just "data engineering plumbing."

Key characteristics of a well-built data pipeline: it is **idempotent** (safe to re-run without side effects), it validates data quality as a first-class stage rather than trusting upstream sources, it handles schema change gracefully instead of crashing or silently dropping fields, it separates concerns (extraction, transformation, loading, orchestration) so a failure in one stage doesn't force redoing everything, and it exposes enough observability that a human can answer "did today's run produce correct, complete data?" without manually inspecting rows.

This page deliberately stays at the level of pipeline *design principles* — the patterns that hold regardless of whether you build the pipeline with Airflow and Spark, with a managed ELT tool, or with a handful of scheduled scripts. The tool-specific depth (DAG authoring, executor internals, scheduling semantics) lives in the **Airflow** and **Spark** sibling skills; this page is where the reasoning about *why* those tools are shaped the way they are gets taught.
`,

  history: `
Data pipelines as a named discipline grew out of decades of practice, but the vocabulary and tooling have shifted dramatically as storage and compute economics changed.

| Era | Milestone |
|------|-----------|
| 1970s–1980s | Batch mainframe ETL jobs: nightly COBOL/JCL programs moving data between systems of record |
| 1990s | Dedicated ETL tools emerge (Informatica, DataStage) alongside the rise of the enterprise data warehouse (Inmon, Kimball dimensional modeling) |
| 2000s | Hadoop and MapReduce popularize distributed batch processing of "big data" that doesn't fit a single warehouse |
| 2004 | Google's MapReduce paper formalizes the batch processing model that later inspired Spark |
| 2010 | Spark project begins at UC Berkeley's AMPLab, addressing MapReduce's slow, disk-bound iterative jobs |
| 2011–2014 | Airflow-style workflow orchestration emerges (Airflow itself open-sourced by Airbnb in 2014) to coordinate increasingly complex multi-step pipelines |
| 2012–2015 | Cloud data warehouses (Redshift 2012, BigQuery 2011, Snowflake 2014) make storage and elastic compute cheap, setting up the ELT shift |
| Mid-2010s | "ELT" becomes common vocabulary: load raw data first, transform inside the warehouse using its own compute |
| 2016 | dbt (data build tool) popularizes SQL-based, version-controlled, testable transformation as its own layer, cementing modern ELT practice |
| Late 2010s | Streaming pipelines go mainstream for lower-latency use cases: Kafka-centric architectures, stream processors (Flink, Spark Structured Streaming) |
| 2020s | Feature stores formalize the last mile of the pipeline for ML specifically; data quality/observability tooling (Great Expectations, Monte Carlo-style tools) becomes a distinct pipeline stage rather than an afterthought |
| 2020s | Lakehouse architectures (Delta Lake, Iceberg, Hudi) blur the line between "data lake" and "data warehouse," changing how pipelines land data |

The throughline across every era: the tools change, but the same failure modes recur — non-idempotent retries duplicating data, silent schema drift, and no validation gate between "data arrived" and "data is trusted." Understanding *why* those failure modes keep reappearing is more durable knowledge than any single tool's API.
`,

  "why-it-exists": `
Before dedicated pipeline discipline, organizations moved data with ad hoc scripts: a cron job here, a manual export-and-import there, a one-off script a analyst wrote to "just get the numbers into the report." This worked at small scale and fell apart as soon as three things happened at once: data volume grew past what a single machine or single script could process in the available time window, more than one team depended on the same data existing correctly and on time, and the cost of being wrong went up because a model or a business decision now depended on the output.

The gap data pipelines fill is the gap between "a script that moves data" and "a system that can be trusted to move data correctly, repeatedly, and observably." That gap has several concrete dimensions:

1. **Reliability under failure.** Networks time out, upstream APIs rate-limit, machines crash mid-job. A pipeline needs to survive partial failure without corrupting the destination — this is why idempotency is treated as a design principle rather than a nice-to-have.
2. **Trust in the output.** A single bad batch (nulls where there should be values, a currency field silently switching from cents to dollars) can poison every downstream model and dashboard. Data quality checks exist to catch this before it propagates.
3. **Change over time.** Source schemas evolve — a column gets renamed, a new field appears, a type narrows. Pipelines that hard-crash or silently drop data on every source change are unmaintainable at any real scale.
4. **Coordination.** As soon as a pipeline has more than one step with dependencies (extract must finish before transform, transform before load, multiple pipelines feed one downstream table), someone needs to schedule, retry, and alert on failures — the job of orchestration tools like Airflow.

Before this discipline matured, the "world before" looked like tribal knowledge: someone remembered to re-run the failed job by hand, nobody validated that yesterday's numbers looked reasonable, and a schema change three teams upstream would break a report two teams downstream with no clear signal about why.
`,

  "problem-it-solves": `
Good data pipeline design directly removes several concrete pains:

- **Duplicate or corrupted data from retries.** Without idempotency, re-running a failed job (which will happen — that is the normal case, not the exception) inserts the same rows twice, double-counts revenue, or otherwise corrupts the destination.
- **Silent bad data reaching models and dashboards.** Without a validation stage, a source that suddenly sends 40% nulls in a critical column, or a currency field that changes units, flows straight through and quietly degrades a model's predictions or a business metric — often discovered weeks later, if at all.
- **Fragile handling of source changes.** Without an explicit schema evolution strategy, a pipeline either crashes on the first unexpected field (blocking everything downstream) or silently drops data it doesn't recognize (which is worse, because nothing alerts anyone).
- **Impossible backfills.** Without a design that treats "reprocess a historical date range" as a first-class operation, fixing a bug discovered in last month's data means writing one-off scripts under pressure, often making the original mistakes again.
- **All-or-nothing failure blast radius.** Without separating extraction, transformation, and loading, a failure in the loading step forces re-running extraction and transformation too, even though nothing was wrong with them — wasting time and API rate-limit budget.
- **Invisible pipeline health.** Without observability, "is the data correct and on time" is answered by someone opening a query and eyeballing numbers, rather than by a dashboard or an alert.

What this discipline deliberately does **not** solve: it does not pick a specific orchestrator or processing engine for you (that's the **Airflow** and **Spark** skills), it does not replace data modeling judgment (deciding what a "customer" row should contain is a domain problem, not a pipeline-mechanics problem), and it does not substitute for a real data governance or access-control program — a well-engineered pipeline can still faithfully move data that nobody should have access to if permissions aren't handled separately.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between ETL and ELT, and articulate the concrete reasons ELT became the more common default with cheap cloud warehouse compute.
2. Distinguish batch and streaming pipelines and choose between them based on latency requirements, not habit.
3. Design a pipeline stage that is idempotent — safe to re-run without duplicating or corrupting data — using techniques like upserts on a natural key, watermarking, and deterministic partition overwrites.
4. Build a data quality validation stage that halts or quarantines bad data instead of letting it flow downstream silently.
5. Handle schema evolution (new columns, renamed columns, type changes) without either crashing the pipeline or silently losing data.
6. Design a backfill strategy for reprocessing historical data safely, including how it interacts with idempotency.
7. Instrument a pipeline for observability: freshness, volume, distribution, and schema signals, distinct from general application/infra monitoring.
8. Explain the division of labor between orchestration tools (Airflow) and processing engines (Spark), and where a feature store fits as a specialized destination.
9. Identify the classic anti-patterns — non-idempotent retries, missing quality gates, tightly coupled extract/transform/load — in a real pipeline design and propose the fix.
10. Reason about pipeline architecture tradeoffs (data volume, latency needs, team size) well enough to justify a design choice in an interview or design review, while acknowledging there is rarely one universally "correct" answer.
`,

  prerequisites: `
- **Required**: comfortable reading and writing SQL, and basic familiarity with a general-purpose programming language (Python is assumed for code examples on this page). Understand what a relational table and a primary key are.
- **Helpful**: some exposure to **PostgreSQL** or another relational database, since many pipeline destinations are (or resemble) relational tables and the idempotency techniques on this page are expressed as SQL upserts.
- **Helpful but not required for this page specifically**: familiarity with **Kafka** for the streaming-pipeline material, and awareness of what a scheduler/DAG tool does (this page explains the concept; the **Airflow** skill goes deep on the tool).
- **Not required**: prior experience with a distributed processing engine. This page explains what problems engines like **Spark** exist to solve without requiring you to already know Spark; the **Spark** skill covers its internals.

Dependency links: this page sits between general data literacy and the tool-specific skills. A reasonable learning order is **PostgreSQL** (or SQL fundamentals) → this page (**Data Pipelines** design principles) → **Airflow** (orchestration) and **Spark** (processing engine) in either order → **Feature Stores** (the ML-specific destination) → **MLOps** (the broader lifecycle these pipelines feed) → **AI Monitoring** (watching what the pipeline ultimately produces: model behavior).
`,

  "beginner-concepts": `
### What is a data pipeline, concretely

At the simplest level, a pipeline is three things happening in sequence: get data from somewhere (**extract**), change its shape or content (**transform**), and put it somewhere it will be used (**load**). The order of the last two letters is the first real design decision you make.

~~~python
# The simplest possible "pipeline" — a single script, no framework.
# This is a legitimate starting point; the concepts below are about
# what breaks as this grows, not about needing a framework on day one.

import csv
import sqlite3

def extract(path: str) -> list[dict]:
    """Read raw rows from a source file."""
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def transform(rows: list[dict]) -> list[dict]:
    """Clean and reshape: here, normalize email to lowercase and
    drop rows missing a required field."""
    cleaned = []
    for row in rows:
        if not row.get("email"):
            continue  # skip invalid rows rather than crash
        row["email"] = row["email"].strip().lower()
        cleaned.append(row)
    return cleaned

def load(rows: list[dict], db_path: str) -> None:
    """Write to the destination."""
    conn = sqlite3.connect(db_path)
    conn.executemany(
        "INSERT INTO customers (email, name) VALUES (:email, :name)",
        rows,
    )
    conn.commit()
    conn.close()

rows = extract("customers.csv")
clean_rows = transform(rows)
load(clean_rows, "warehouse.db")
~~~

Run this twice by accident (a common real-world event — a retry after a timeout, a scheduler firing twice) and every row is now duplicated. That single fact — this simple, correct-looking script is unsafe to re-run — is the seed of the entire idempotency discussion later on this page.

### ETL vs. ELT

**ETL** (Extract, Transform, Load) transforms data *before* it lands in the destination, typically in a separate processing layer. **ELT** (Extract, Load, Transform) loads raw data into the destination first, then transforms it *inside* that destination using its own compute.

~~~text
ETL:  Source --> [Transform in a separate engine] --> Destination (clean data only)
ELT:  Source --> Destination (raw data) --> [Transform using destination's compute] --> Destination (clean tables)
~~~

ETL was the default when destinations (traditional data warehouses) had limited, expensive compute — you transformed elsewhere to avoid burdening the warehouse. ELT became practical once cloud warehouses (and lakehouses) made storage cheap and compute elastic: you can afford to store the raw, unprocessed data and run transformations as SQL queries against it, keeping the original data around for re-processing if the transformation logic was wrong.

### Batch vs. streaming

A **batch** pipeline processes a bounded chunk of data on a schedule — "run every night at 2 AM and process yesterday's rows." A **streaming** pipeline processes an unbounded sequence of events as they arrive, usually with a target latency measured in seconds. Batch is simpler to reason about (a run has a clear start and end) and is the right default unless a concrete requirement needs low latency — fraud detection, real-time personalization, live dashboards. Streaming systems (built on tools like Kafka) trade that simplicity for lower latency and add real complexity: out-of-order events, windowing, and exactly-once semantics that batch pipelines mostly avoid by construction.

### The three roles: orchestration, processing, storage

It helps beginners to separate three distinct jobs that are easy to conflate:

- **Orchestration** decides *when* and *in what order* things run, and what to do on failure (retry, alert, skip). This is what **Airflow** does.
- **Processing** does the actual computation — filtering, joining, aggregating rows. For small data this can be a Python script or a SQL query; for large data this is what **Spark** does.
- **Storage/destination** is where the result lands — a warehouse table, a **Feature Store**, a file in object storage.

A common beginner confusion is thinking Airflow "processes" data. It usually does not; it triggers something else (a SQL query, a Spark job, a script) that does the processing, and tracks whether that something else succeeded.
`,

  "intermediate-concepts": `
### Idempotency as a design principle

A pipeline stage is **idempotent** if running it twice with the same input produces the same result as running it once. This is the single most important property to design for, because retries are not an edge case in real pipelines — they are the normal response to transient failures (timeouts, rate limits, a worker crashing).

The naive fix — "just don't re-run it" — does not survive contact with production. Something *will* re-run a job: a scheduler misfire, an on-call engineer manually retrying, a downstream consumer requesting a reprocess. The pipeline has to be safe regardless.

~~~python
# NOT idempotent: blind INSERT duplicates rows on every retry.
def load_naive(rows, conn):
    conn.executemany(
        "INSERT INTO orders (order_id, customer_id, amount) VALUES (?, ?, ?)",
        rows,
    )
    conn.commit()

# Idempotent: UPSERT by natural key. Re-running with the same
# input rows leaves the table in the same final state every time.
def load_idempotent(rows, conn):
    conn.executemany(
        """
        INSERT INTO orders (order_id, customer_id, amount)
        VALUES (?, ?, ?)
        ON CONFLICT (order_id) DO UPDATE SET
            customer_id = excluded.customer_id,
            amount = excluded.amount
        """,
        rows,
    )
    conn.commit()
~~~

Other common idempotency techniques beyond upserts: **partition overwrite** (a batch pipeline processing "yesterday" writes to a partition named by that date, and always overwrites the whole partition rather than appending — re-running the same day simply replaces it identically), and **deduplication keys** (attach a unique event or batch ID and use it to skip work already recorded, common in streaming systems where "exactly-once" is approximated this way).

### Data quality checks as a pipeline stage

Validation should be a named, visible stage in the pipeline — not something you hope the destination system or the eventual model training code will catch. A useful mental model: every pipeline has an implicit contract about what "good data" looks like (row counts in an expected range, null rates below a threshold, values within expected bounds, referential integrity between tables). Encode that contract as checks that run as part of the pipeline, not as a separate audit weeks later.

~~~python
from dataclasses import dataclass

@dataclass
class ValidationError(Exception):
    check: str
    detail: str

def validate_orders(rows: list[dict]) -> None:
    """Raise if the batch violates the data contract. A pipeline
    should call this BETWEEN transform and load, so bad data never
    reaches the destination."""
    if not rows:
        raise ValidationError("row_count", "batch is empty — likely an upstream failure")

    null_amounts = sum(1 for r in rows if r.get("amount") is None)
    null_rate = null_amounts / len(rows)
    if null_rate > 0.01:
        raise ValidationError("null_rate", f"amount null rate {null_rate:.2%} exceeds 1% threshold")

    bad_amounts = [r for r in rows if r.get("amount") is not None and r["amount"] < 0]
    if bad_amounts:
        raise ValidationError("range", f"{len(bad_amounts)} rows have negative amount")

    required = {"order_id", "customer_id", "amount"}
    missing_cols = required - rows[0].keys()
    if missing_cols:
        raise ValidationError("schema", f"missing expected columns: {missing_cols}")
~~~

Whether a failed check should **halt** the whole pipeline or **quarantine** the offending rows (route them to a dead-letter location for later inspection while letting good rows through) is a real design decision, not a default — halting is safer for financial or compliance-critical data, quarantining is often better for high-volume, imperfect-source data like log or clickstream ingestion.

### Schema evolution handling

Source schemas change: a new optional column appears, a column is renamed, a numeric field's precision changes. Three broad strategies:

1. **Schema-on-write with an explicit contract**: the pipeline defines the exact expected schema, and any deviation is treated as a validation failure. Safest, least flexible.
2. **Schema-on-read with a permissive destination**: land raw data with whatever shape it arrived in (common in ELT / lakehouse patterns using formats like Parquet with schema merging), and let the transformation layer decide how to reconcile old and new shapes.
3. **Versioned schemas with explicit migration**: track schema versions and write explicit migration logic when they change (add a column with a default, map a renamed column), similar in spirit to a database migration tool.

The failure mode to avoid is implicit, silent handling — a transformation step that does a permissive dictionary lookup like row.get("field") everywhere and quietly treats a renamed column as "missing," producing nulls that look like real nulls to everyone downstream instead of triggering a visible alert.

### Backfilling historical data

A backfill is deliberately reprocessing a historical date range — because a bug was found in the transformation logic, a new column needs to be populated for history, or a source system re-sent corrected historical data. Backfills interact directly with idempotency: if a pipeline's load stage is a partition overwrite or an upsert by natural key, backfilling a date range is simply "run the same pipeline logic again for those dates" — safe by construction. If the load stage only supports append, backfilling requires careful, error-prone manual cleanup first. This is one of the strongest practical arguments for designing idempotency in from the start rather than retrofitting it.
`,

  "advanced-concepts": `
### Exactly-once, at-least-once, and at-most-once semantics

In streaming and distributed batch systems, delivery semantics describe what guarantee you have about how many times a given piece of data is processed:

| Semantics | Guarantee | Typical cost |
|---|---|---|
| At-most-once | Processed zero or one times — can silently drop data on failure | Cheapest, least safe |
| At-least-once | Processed one or more times — never silently drops, but can duplicate | Requires idempotent downstream handling |
| Exactly-once | Processed exactly one time, end to end | Expensive to guarantee true end-to-end; usually approximated |

In practice, true end-to-end exactly-once is rare and expensive; the standard senior-engineer move is **at-least-once delivery plus idempotent processing**, which together behave like exactly-once from the destination's point of view without needing exotic distributed transaction machinery. This is why idempotency is emphasized so heavily earlier on this page — it is the practical substitute for a guarantee that is very hard to provide directly.

### Coupling and the extract/transform/load failure blast radius

A tightly coupled pipeline — one where extraction, transformation, and loading happen in a single unit of work with no persisted intermediate state — means any failure forces redoing everything from the start, including expensive or rate-limited extraction calls to a third-party API. A decoupled design persists intermediate state (raw extracted data landed in cheap storage, transformed data landed separately before the final load) so a failure at stage three only requires retrying stage three.

~~~text
Tightly coupled (bad):     [Extract -> Transform -> Load] as one atomic step
                            Failure anywhere => redo the entire chain

Decoupled (better):        [Extract] -> raw storage
                            [Transform] reads raw storage -> staged storage
                            [Load] reads staged storage -> destination
                            Failure in Load => only retry Load
~~~

This is also precisely the architectural reason ELT is attractive: loading raw data first creates a natural, cheap checkpoint that decouples "did we get the data" from "did we transform it correctly," so a transformation bug never requires re-extracting from a rate-limited or since-changed source.

### Watermarking and late-arriving data in streaming pipelines

Streaming pipelines must decide how long to wait for late-arriving events before considering a time window "final." A **watermark** is the pipeline's declared belief about how far behind real time it can safely assume events are — e.g. "assume no event arrives more than 10 minutes late." Data arriving after the watermark has passed is either dropped, or handled with an explicit late-data policy (re-emitting a corrected aggregate). This is a real tradeoff: a tighter watermark gives lower latency results but drops more genuinely-late data; a looser watermark is more complete but delays finality.

### Pipeline observability vs. general system monitoring

Pipeline observability is data-specific and answers different questions than the infrastructure monitoring covered in the general **AI Monitoring** skill. Infra monitoring asks "is the job running, how much CPU/memory did it use, did it crash." Pipeline (data) observability asks about the data itself:

- **Freshness**: how stale is the data relative to when it should have arrived?
- **Volume**: did today's batch have a plausible row count compared to history?
- **Distribution**: are key column value distributions consistent with historical norms (schema drift, unit changes, a source suddenly sending mostly nulls)?
- **Lineage**: which downstream tables/models were built from this specific run, so a bad run's blast radius can be identified quickly?

A pipeline can be "green" by every infrastructure metric — the job ran, exited 0, took normal CPU time — while producing subtly wrong data. This is the gap dedicated data-quality and data-observability tooling exists to close, and it is a decision-table-level distinction senior engineers are expected to articulate: infra health is necessary but not sufficient for data health.

### Decision table: when to reach for which pattern

| Situation | Lean toward |
|---|---|
| Small-to-medium data, destination is a modern cloud warehouse, team wants fast iteration | ELT with SQL-based transforms |
| Data volume too large or transform logic too complex for warehouse SQL alone | ETL with a distributed engine (see **Spark**) doing the heavy transform before or alongside load |
| Sub-minute latency requirement (fraud, live personalization) | Streaming pipeline (see **Kafka** for the transport layer) |
| Daily/hourly reporting, ML training sets, most analytics | Batch pipeline — simpler to build, test, and debug |
| Multiple interdependent pipelines, need retries/alerting/scheduling | Add an orchestrator (see **Airflow**) rather than hand-rolling scheduling logic |
| ML features need to be consistent between training and serving | Land final pipeline output in a **Feature Store**, not directly in ad hoc tables |
`,

  "internal-working": `
Under the hood, even a "simple" scheduled pipeline is doing several distinct things that are worth naming explicitly, because each is a place things go wrong.

1. **Trigger**: something decides it's time to run — a fixed schedule ("every day at 2 AM"), a sensor waiting for an upstream signal ("run when yesterday's file lands in the source bucket"), or an event (a new message on a queue).
2. **Dependency resolution**: before running, the system checks whether upstream dependencies are satisfied — did the tasks this one depends on succeed? This is the graph structure an orchestrator like Airflow encodes explicitly as a DAG (directed acyclic graph).
3. **Extraction**: data is pulled from the source — a database query, an API call, a file read. This step usually needs to track *how much* was already extracted (a high-water mark, like "last extracted timestamp") so re-running doesn't either miss new data or double-extract.
4. **Staging**: raw extracted data is usually written somewhere durable before transformation begins, so a crash during transformation doesn't require re-extracting.
5. **Transformation**: the actual business logic — filtering, joining, aggregating, reshaping — executes, either in-process (small data), via a SQL engine (ELT, warehouse compute), or via a distributed processing engine (large data, see **Spark**).
6. **Validation**: the data-quality checks run against the transformed output before it is considered safe to load.
7. **Load**: the validated data is written to its destination using an idempotent write pattern (upsert, partition overwrite).
8. **Bookkeeping and signaling**: the pipeline records that this run succeeded (and for what data range), which both prevents accidental re-processing of the same range and unblocks any downstream pipeline waiting on this one.

~~~mermaid
flowchart TD
    A[Trigger: schedule / sensor / event] --> B{Dependencies met?}
    B -- no --> A
    B -- yes --> C[Extract from source]
    C --> D[Stage raw data durably]
    D --> E[Transform]
    E --> F{Validation checks pass?}
    F -- no --> G[Halt or quarantine + alert]
    F -- yes --> H[Load: idempotent upsert / partition overwrite]
    H --> I[Record run metadata: range, status, row counts]
    I --> J[Unblock downstream pipelines]
~~~

Every arrow in that diagram is a place where a real production incident has historically occurred: a trigger firing twice (idempotency), a dependency check that was too permissive (a downstream pipeline running on partial upstream data), a validation gate that didn't exist (silent bad data), and a load step that wasn't idempotent (duplicated rows). Internalizing this diagram is more useful than memorizing any single tool's configuration options, because it explains *why* those options exist.
`,

  architecture: `
A production data platform is usually organized in layers, each with a distinct responsibility, so that a change in one layer doesn't ripple uncontrollably into the others.

~~~text
Sources
  Application databases, third-party APIs, event streams (Kafka), files/exports
        |
Ingestion / Extraction layer
  Connectors pulling data on a schedule or via CDC (change data capture);
  writes raw data to a landing zone, unchanged from source shape
        |
Raw / Landing storage
  Cheap object storage or warehouse "raw" schema — the durable checkpoint
  that decouples extraction from everything downstream
        |
Transformation layer
  SQL-based transforms (ELT, e.g. dbt-style modeling) and/or a distributed
  processing engine (Spark) for large or complex transforms
        |
Validated / curated storage
  Cleaned, quality-checked tables — the layer most consumers should read from
        |
Specialized destinations
  Feature Store (ML training/serving), BI warehouse schema (dashboards),
  search index, cache — each destination shaped for its consumer
        |
Orchestration (cross-cutting)
  Airflow (or similar) coordinates trigger timing, dependencies, retries,
  and alerting across every layer above
        |
Observability (cross-cutting)
  Freshness/volume/distribution monitoring and lineage tracking across
  every layer above
~~~

The two "cross-cutting" layers are drawn separately because they are not a single step in the data's path — they observe and coordinate every other layer. A common architectural mistake is treating orchestration as just another pipeline step rather than the thing that governs all of them; a common data-quality mistake is only validating at the very end (curated storage) rather than catching problems as early as possible (ideally right after extraction, so bad data never even reaches the transformation layer).

Applications should be structured around this layering by giving each layer its own storage location and its own well-defined output contract, rather than one large script that reads from a source and writes to a destination in a single opaque step. That separation is what makes debugging, backfilling, and partial re-runs tractable.
`,

  "data-flow": `
Tracing one concrete operation end to end — a daily batch job that updates a "customer lifetime value" table used by both a dashboard and a recommendation model — makes the abstract layers above concrete.

~~~mermaid
sequenceDiagram
    participant Scheduler as Orchestrator (Airflow)
    participant Source as Source DB (orders)
    participant Raw as Raw landing storage
    participant Engine as Transform engine (SQL / Spark)
    participant Validator as Data quality checks
    participant Warehouse as Curated warehouse table
    participant FeatureStore as Feature Store
    participant Dashboard as BI dashboard

    Scheduler->>Source: Trigger extract (yesterday's orders)
    Source-->>Raw: Write raw rows, unchanged shape
    Scheduler->>Engine: Trigger transform on raw partition
    Engine->>Raw: Read yesterday's raw partition
    Engine-->>Validator: Produce candidate "customer_ltv" rows
    Validator->>Validator: Check null rate, row count, value ranges
    alt validation fails
        Validator-->>Scheduler: Raise failure, alert on-call
    else validation passes
        Validator-->>Warehouse: Upsert customer_ltv by customer_id
        Warehouse-->>FeatureStore: Sync updated feature values
        Warehouse-->>Dashboard: Available for next dashboard refresh
        Scheduler->>Scheduler: Record run success + row count metadata
    end
~~~

Notice two properties this trace makes visible: the write into the warehouse table is an **upsert by customer_id**, not a blind append, so re-running the same day's job (say, because the validator initially failed and the underlying issue was fixed) produces the same final state rather than duplicate rows; and the validation step sits *before* anything touches the warehouse, feature store, or dashboard, so a bad batch never reaches a consumer. If either property were missing — append-only writes, or validation happening only after the feature store sync — this exact same daily job would be a production incident waiting to happen.
`,

  "production-usage": `
In real teams, "the pipeline" is rarely one script — it's a small ecosystem of tooling around the core extract/transform/load logic:

- **Version control for pipeline definitions and transformation logic.** DAG definitions (Airflow) and SQL models (dbt-style tools) live in git, reviewed like any other code, not edited ad hoc in a UI.
- **Environment separation.** Dev/staging/production environments with separate credentials and often separate (smaller) data volumes for dev, so a broken transform is caught before it touches production data.
- **Configuration over hard-coding.** Source connection details, thresholds for validation checks, and schedule definitions live in config (or environment variables/secrets managers), not hard-coded inside transformation logic.
- **A dedicated data-quality tool or framework** (rather than only inline assertions) that produces a queryable history of check results over time, so a team can see "when did this check start failing" rather than only "is it failing right now."
- **Standard project layout**: a repo typically separates ingestion connectors, transformation models, orchestration DAGs, and data-quality suites into clearly named directories, mirroring the layered architecture above.
- **Alerting integration**: validation failures and missed SLAs (a pipeline that should have finished by 6 AM but hasn't) page or message an on-call channel rather than silently sitting in a log.
- **Cost awareness as an operational default.** Because ELT pushes transformation compute into the warehouse, warehouse compute cost becomes a pipeline operational concern in a way it wasn't under classic ETL — teams commonly set query cost budgets and monitor warehouse spend per pipeline.

None of this requires a specific vendor — the same operational patterns show up whether the stack is Airflow-plus-Spark-plus-a-warehouse, or a fully managed ELT SaaS tool with a lighter orchestration layer. The tool choice is secondary to whether these operational habits exist at all.
`,

  "industry-examples": `
- **Airbnb** built and open-sourced Airflow specifically because their internal data pipelines had outgrown cron jobs and needed explicit dependency graphs, retries, and visibility across hundreds of interdependent jobs — a direct example of orchestration emerging from real pipeline pain at scale.
- **Netflix** runs large-scale batch and streaming data pipelines feeding both personalization/recommendation models and business analytics, and has published extensively on data pipeline reliability and observability practices given the scale of viewing-event data they process.
- **Uber** built pipelines to support near-real-time pricing and ETA models, which pushed them toward streaming architectures and strong idempotency/exactly-once-style guarantees, since duplicated or delayed pricing signals have direct financial impact.
- **Lyft** and similar ride-sharing companies have published on backfill tooling specifically, because correcting historical pricing or matching model training data safely (without duplicating or corrupting years of history) is a recurring, high-stakes operational need.
- **Financial services and payments companies** (broadly, without over-specifying any single company's internals) are commonly cited as the strongest real-world case for strict idempotency and validation gates, since a duplicated transaction record or a silently corrupted amount field has direct monetary consequences rather than just a degraded dashboard metric.

The common thread across all of these: the specific tools differ, but every one of them independently arrived at the same core principles this page teaches — idempotent writes, explicit dependency graphs, and validation before data is trusted — because those principles are forced by the nature of distributed, retryable systems, not by any one vendor's design taste.
`,

  "best-practices": `
1. **Make every load step idempotent by default**, using upserts on a natural key or full-partition overwrites — treat "what happens if this runs twice" as a required design question for every pipeline, not an edge case to handle later.
2. **Validate data quality as an explicit, visible pipeline stage** between transform and load, not as an afterthought or a manual spot-check.
3. **Fail loudly on ambiguous or unexpected schema changes** rather than silently coercing or dropping fields — a crashed pipeline with a clear error is far cheaper to fix than months of silently wrong data.
4. **Persist intermediate state** (raw extracted data, staged transformed data) so a failure at any stage only requires retrying that stage, not the whole chain.
5. **Design for backfills from day one** — if the load logic is idempotent (upsert/partition overwrite), backfilling a date range is just re-running the pipeline for that range, which should be a deliberate, tested capability, not an emergency improvisation.
6. **Track data lineage** (which run produced which rows, which source version fed which model) well enough to answer "what does this bad run affect downstream" quickly during an incident.
7. **Separate orchestration concerns from processing concerns** — let the orchestrator (Airflow) decide when/whether to run and handle retries/alerting, and let the processing engine (Spark, warehouse SQL) do the actual computation; avoid burying business logic inside orchestrator task definitions.
8. **Set explicit SLAs for freshness** ("this table must be updated by 7 AM") and alert on misses, rather than only reacting when a human notices stale data.
9. **Keep raw data around** even in ELT patterns where it's immediately transformed — it is the cheapest insurance against a transformation bug, since you can always re-run the transform against unchanged raw data.
10. **Version transformation logic in source control and test it** like application code — a broken SQL model should be caught in review or CI, not in production.
11. **Prefer boring, well-understood patterns over cleverness** — a straightforward batch pipeline with clear idempotent writes is usually a better choice than a streaming architecture "because it's more impressive," unless a real latency requirement demands it.
12. **Document the data contract** for every pipeline output (expected columns, types, null tolerances, freshness) so downstream consumers and the validation stage are working from the same explicit definition, not tribal knowledge.
`,

  "anti-patterns": `
~~~python
# ANTI-PATTERN: blind append, not idempotent.
# Re-running this job (e.g. after a timeout that occurred AFTER the insert
# committed but BEFORE the job recorded success) silently duplicates every row.
def load_wrong(rows, conn):
    conn.executemany(
        "INSERT INTO events (event_id, user_id, payload) VALUES (?, ?, ?)",
        rows,
    )
    conn.commit()

# FIX: upsert on the natural key (event_id), so re-running with the
# same input converges to the same final state instead of duplicating.
def load_right(rows, conn):
    conn.executemany(
        """
        INSERT INTO events (event_id, user_id, payload) VALUES (?, ?, ?)
        ON CONFLICT (event_id) DO UPDATE SET
            user_id = excluded.user_id,
            payload = excluded.payload
        """,
        rows,
    )
    conn.commit()
~~~

~~~python
# ANTI-PATTERN: no data quality gate — bad data flows straight
# from transform to a table a model trains on.
def pipeline_wrong(raw_rows):
    clean = transform(raw_rows)
    load(clean, warehouse_conn)   # nothing checks "clean" is actually clean

# FIX: validate BEFORE loading, and fail loudly rather than
# silently continuing with bad data.
def pipeline_right(raw_rows):
    clean = transform(raw_rows)
    validate_orders(clean)        # raises ValidationError on violation
    load(clean, warehouse_conn)
~~~

~~~text
ANTI-PATTERN: tightly coupled extract-transform-load as one atomic
step with no persisted intermediate state. A transient failure in
the load step (e.g. destination briefly unreachable) forces
re-running extraction against a third-party API that may be
rate-limited, slow, or -- worse -- may have moved on, so re-extracting
"yesterday's data" no longer returns the same rows.

FIX: persist raw extracted data and staged transformed data as
durable checkpoints. A failure in load only requires re-running load
against the already-staged data -- extraction and transformation are
never redone unnecessarily.
~~~

A further common anti-pattern worth naming explicitly: **treating schema drift as someone else's problem**. A pipeline that assumes the source schema never changes, with no explicit check or handling strategy, will eventually break in the least convenient way — usually silently, when a renamed column starts appearing as all-null rather than raising an error.
`,

  performance: `
Before optimizing anything, measure. The relevant tools are usually built into the processing layer and orchestrator rather than pipeline-specific: query execution plans and timing from the warehouse or database (see **PostgreSQL** for EXPLAIN-style analysis), Spark's job/stage UI for distributed transform jobs (see **Spark**), and task duration history from the orchestrator (see **Airflow**) to spot which step in the DAG is the actual bottleneck.

A useful ordered hierarchy for pipeline performance work, roughly cheapest-and-highest-leverage first:

1. **Only process what changed.** Incremental processing (extracting/transforming only new or changed rows since the last successful run, using a watermark like an updated_at timestamp) is almost always the single biggest win — turning an hours-long full-table job into a minutes-long incremental one.
2. **Push computation to where the data already lives.** In an ELT pattern, letting the warehouse's own distributed compute do a join or aggregation is usually faster than pulling data out, processing it in a single Python process, and pushing it back.
3. **Partition and prune.** Partitioning storage by date (or another natural dimension) lets both queries and reprocessing jobs skip irrelevant partitions entirely rather than scanning everything.
4. **Right-size parallelism in the processing engine.** For Spark-scale jobs, under-parallelized jobs waste available cluster capacity; over-parallelized jobs pay coordination overhead per tiny task — this tuning lives in the **Spark** skill in depth.
5. **Reduce data volume early.** Filtering out clearly irrelevant rows/columns at extraction time (rather than pulling everything and filtering later) reduces the amount of data every downstream step has to move and process.
6. **Batch small operations.** Row-by-row inserts/updates are dramatically slower than bulk/batched writes in essentially every destination; batch sizes in the thousands-of-rows range are a common practical sweet spot, though the right number depends on row size and destination.

The order matters: teams frequently jump straight to "add more compute" (step 4-ish) before checking whether they're doing unnecessary full reprocessing (step 1) — the incremental-processing fix is usually both cheaper to implement and larger in impact than throwing more parallel workers at a job that shouldn't be running in full every time.
`,

  scalability: `
Data pipeline scalability has both a data-volume axis and an organizational axis, and they require different responses.

**Data-volume scaling**: vertically, a single-machine pipeline (a Python script, a single-node database) can be pushed further than most beginners assume — modern hardware and columnar formats handle surprisingly large batch jobs on one machine. Horizontally, once data genuinely exceeds what a single machine can process in the available time window, work shifts to a distributed processing engine (**Spark**) that partitions data across a cluster, or to a warehouse's own distributed query engine in an ELT pattern.

| Bottleneck | Typical cause | Typical fix |
|---|---|---|
| Extraction too slow | Full re-extraction every run instead of incremental | Incremental extraction using a watermark (last-updated timestamp, change data capture) |
| Transform too slow | Single-machine processing of data that has outgrown it | Move to a distributed engine (Spark) or push transform into warehouse SQL (ELT) |
| Load too slow | Row-by-row writes | Bulk/batched writes; partition-level overwrites instead of row-level updates where possible |
| Orchestrator overload | Hundreds of interdependent DAGs on one scheduler instance | Scale orchestrator workers horizontally; split unrelated pipelines into separate DAGs to reduce blast radius and scheduling contention |
| Validation too slow | Checking every row with expensive per-row logic | Sample-based or aggregate statistical checks (row counts, null rates, distribution summaries) instead of per-row validation for very large batches |

**Organizational scaling** is just as real a bottleneck as data volume: as more teams depend on more interdependent pipelines, the harder problem becomes clear ownership (who is on call when this specific pipeline breaks), clear data contracts between teams (so one team's schema change doesn't silently break another team's downstream pipeline), and discoverability (can someone find out this table exists and what pipeline produces it, without asking around). Many organizations reach for a data catalog and formal data contracts specifically to solve this organizational scaling problem, which is a distinct concern from the raw compute-scaling table above.
`,

  security: `
Data pipelines sit in an unusually sensitive position: they routinely have broad read access to source systems (production databases, third-party APIs with customer data) and broad write access to destinations that many other systems and people read from. The pipeline-specific attack surface and defenses:

- **Credential sprawl.** Pipelines need credentials for every source and destination they touch. Store these in a secrets manager, not in DAG code or config files committed to source control; rotate them, and scope each credential to the minimum access that pipeline actually needs (a pipeline that only reads should never hold write credentials).
- **Data exfiltration via logs.** A very common, easy-to-miss issue: pipeline logging that prints full row contents (including PII) for debugging ends up in log aggregation systems with much broader access than the original data source. Log row counts and identifiers, not full payloads, by default.
- **Overly broad destination write access.** A pipeline's write credential to a shared warehouse should be scoped to the specific schema/tables it owns, not warehouse-wide — limiting the blast radius if that credential or the pipeline code itself is compromised.
- **Unvalidated third-party or user-controlled input reaching SQL.** If any part of a transformation constructs SQL from source data rather than using parameterized queries, this is a straightforward injection risk — the same defenses covered in the **PostgreSQL** skill's security section apply directly here.
- **Sensitive data propagating past its access boundary.** A pipeline that copies a table containing PII into a more broadly-accessible destination (a public-facing analytics table, an over-permissioned feature store) effectively widens who can see that sensitive data — data classification and masking/tokenization of sensitive fields should happen as an explicit pipeline stage, not be assumed to happen "somewhere downstream."
- **Backfills as a review-bypass vector.** Because backfills reprocess historical data, they are sometimes run with elevated, broader access "just to get it done" under time pressure — that ad hoc elevated access is exactly the kind of exception that should go through the same review as any other production access change.

Data pipelines are also frequently in scope for compliance regimes (data residency, retention limits, right-to-deletion requests) — a pipeline design that treats "delete this user's data" as a special one-off script rather than a first-class, idempotent, testable operation of its own tends to fail audits.
`,

  testing: `
Data pipeline testing has three distinct layers, and conflating them is the most common testing mistake: unit testing transformation logic, testing the pipeline's behavior around failure/retry, and testing the data itself.

~~~python
# 1. Unit test transformation logic in isolation, with plain
#    in-memory data -- no real database or scheduler involved.
import pytest

def test_transform_normalizes_email_and_drops_invalid_rows():
    raw = [
        {"email": "  Ada@Example.com ", "name": "Ada"},
        {"email": "", "name": "Missing Email"},
    ]
    result = transform(raw)
    assert len(result) == 1
    assert result[0]["email"] == "ada@example.com"

def test_validate_orders_raises_on_high_null_rate():
    rows = [{"order_id": i, "customer_id": 1, "amount": None} for i in range(100)]
    with pytest.raises(ValidationError) as exc_info:
        validate_orders(rows)
    assert exc_info.value.check == "null_rate"

def test_load_is_idempotent(tmp_sqlite_conn):
    rows = [{"order_id": 1, "customer_id": 7, "amount": 42.0}]
    load_idempotent(rows, tmp_sqlite_conn)
    load_idempotent(rows, tmp_sqlite_conn)  # run twice on purpose
    count = tmp_sqlite_conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    assert count == 1  # not 2 -- this is the actual idempotency test
~~~

The third test above is the one beginners most often skip and seniors most insist on: explicitly running the load step twice in a test and asserting the row count didn't change is the cheapest possible way to catch an idempotency regression before it reaches production.

Beyond unit tests, senior testing doctrine for pipelines includes: **testing against a representative sample of real (anonymized) production data** in addition to synthetic edge cases, since real data reliably contains shapes nobody thought to construct by hand; **testing the failure path deliberately** (simulate the destination being unreachable mid-load, assert the pipeline fails cleanly rather than partially writing and reporting success); and **data contract tests** that run continuously in production, not just in CI, since a source schema can change at any time regardless of what your test suite looked like at merge time.
`,

  debugging: `
When a pipeline produces wrong or missing data, escalate through a consistent set of checks rather than guessing:

1. **Check the orchestrator's run history first.** Did the relevant task actually succeed, retry, or get skipped? Most orchestrators (Airflow included) keep per-task logs and status history — this answers "did it run at all" before anything else.
2. **Check row counts at each stage** (extracted, staged, transformed, loaded) against recent history. A sudden drop or spike at one specific stage narrows the problem to that stage immediately.
3. **Diff the source schema** against what the pipeline expects. Many "mysterious null" incidents are a silently renamed or retyped source column.
4. **Re-run the failing stage in isolation against a known input** (the staged raw or intermediate data from that specific run, if it was persisted — another reason to persist intermediate state) rather than re-running the entire pipeline from scratch.
5. **Query the validation check history**, if checks are logged over time rather than only pass/fail in the moment — this answers "when did this actually start" versus "when did someone notice."
6. **Trace lineage from the bad row back to its source run**, if lineage metadata is tracked, to identify exactly which upstream run introduced the problem and what else that run's output touched.
7. **As a last resort, manually inspect a small sample of raw source data** for the affected time range side by side with the pipeline's output for that same range, to spot the exact point of divergence.

A useful debugging habit specific to this domain: reproduce the bug against a **copy of the actual problematic data range**, not synthetic data, because pipeline bugs are disproportionately caused by real-world data shapes (an unexpected but valid value, a duplicate that shouldn't exist upstream but does) that synthetic test data rarely captures.
`,

  monitoring: `
Data pipeline monitoring is distinct from general infrastructure/application monitoring (covered broadly in the **AI Monitoring** skill) because it must answer questions about the data's correctness and timeliness, not just whether a process ran without crashing.

~~~python
# Minimal instrumentation for a batch pipeline run, emitting the
# signals that matter most for data-specific observability.
import time
import logging

logger = logging.getLogger("pipeline.customer_ltv")

def run_pipeline():
    start = time.monotonic()
    run_date = get_run_date()

    raw_rows = extract(run_date)
    logger.info("extract_complete", extra={
        "run_date": str(run_date), "row_count": len(raw_rows),
    })

    clean_rows = transform(raw_rows)

    try:
        validate_orders(clean_rows)
    except ValidationError as e:
        logger.error("validation_failed", extra={
            "run_date": str(run_date), "check": e.check, "detail": e.detail,
        })
        raise  # fail loudly -- do not proceed to load on bad data

    load_idempotent(clean_rows, get_connection())

    duration = time.monotonic() - start
    logger.info("pipeline_complete", extra={
        "run_date": str(run_date),
        "row_count": len(clean_rows),
        "duration_seconds": round(duration, 2),
    })
~~~

The four categories worth tracking as first-class metrics, feeding dashboards and alerts rather than only logs: **freshness** (time since the destination was last successfully updated, alerting if it exceeds an agreed SLA), **volume** (row counts per run compared to a rolling historical baseline, alerting on statistically unusual drops or spikes), **distribution** (summary statistics — null rates, min/max, category frequencies — on key columns compared to historical baselines, to catch schema or unit changes that don't trigger a hard validation failure but are still suspicious), and **lineage** (which specific run produced which rows in which downstream table, so an incident's blast radius can be scoped quickly). A pipeline that only monitors "did the job exit successfully" will miss the entire class of incidents where the job ran fine but the data it produced was quietly wrong.
`,

  deployment: `
A representative production Dockerfile for a containerized pipeline task (for example, one task inside an Airflow DAG, or a standalone scheduled job), with per-line justification:

~~~dockerfile
# Pin an exact base image tag, not "latest" -- reproducible builds
# are a prerequisite for reliable pipeline re-runs and backfills.
FROM python:3.12-slim-bookworm

# Create a non-root user; pipeline containers routinely have
# credentials mounted in, so running as root unnecessarily widens
# the blast radius of any container compromise.
RUN useradd --create-home --shell /bin/bash pipeline
WORKDIR /app

# Copy only dependency manifests first so Docker's layer cache is
# reused across builds when only application code changes, not deps.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the actual pipeline code.
COPY . .

# Drop privileges before running application code.
USER pipeline

# Explicit entrypoint script rather than a bare python call, so
# retry/backoff and signal handling (graceful shutdown on SIGTERM,
# which the orchestrator sends on task kill/timeout) are centralized
# in one place instead of duplicated per pipeline.
ENTRYPOINT ["python", "-m", "pipeline.entrypoint"]
~~~

Beyond the container itself, production deployment for pipelines typically includes: **separate images or tags per environment** (dev/staging/prod) so a change can be validated against smaller data before touching production; **explicit resource requests/limits** in whatever scheduler runs the container (Kubernetes, an Airflow executor), since a runaway transformation job with no memory limit can take down shared infrastructure; and **secrets injected at runtime** (via the orchestrator's secrets integration or a secrets manager) rather than baked into the image, so credentials can be rotated without rebuilding and redeploying.
`,

  "production-checklist": `
- [ ] Every load step is idempotent (upsert by natural key, or full-partition overwrite) — verified by an explicit "run twice" test.
- [ ] A data quality validation stage runs between transform and load, with explicit thresholds (null rate, row count bounds, schema check).
- [ ] The pipeline's behavior on validation failure is a deliberate decision (halt vs. quarantine) and is documented, not accidental.
- [ ] Raw/intermediate data is persisted at each major stage boundary, so a failure doesn't force redoing earlier stages.
- [ ] Schema changes from the source are detected explicitly (fail loudly or handled via a documented migration strategy) rather than silently coerced.
- [ ] Backfilling a historical date range is a tested, documented capability, not an untested emergency procedure.
- [ ] Freshness, volume, and distribution monitoring exist and feed alerts, not just logs someone might read later.
- [ ] Lineage metadata (which run produced which output rows) is tracked well enough to scope an incident's blast radius quickly.
- [ ] Credentials for every source and destination are in a secrets manager, scoped to minimum necessary access, and rotated on a schedule.
- [ ] Logging does not print full row payloads containing sensitive data by default.
- [ ] Explicit SLAs exist for when each critical pipeline output must be ready, with alerting on misses.
- [ ] Pipeline definitions and transformation logic are in source control and reviewed like application code.
- [ ] Retries have sensible backoff and a maximum attempt count, with clear alerting once retries are exhausted rather than silent permanent failure.
- [ ] There is a documented on-call owner for every production pipeline.
- [ ] Resource limits (memory, CPU, timeout) are set explicitly for every pipeline task in whatever executor runs it.
`,

  "common-mistakes": `
1. **Assuming retries won't happen.** They will — transient failures are the normal case in any distributed system, not a rare exception, and a pipeline not designed for safe retries will eventually corrupt data.
2. **Validating only "on the way out," if at all.** Teams under deadline pressure frequently ship the extract-transform-load happy path and treat data quality checks as a "nice to have for later" — which means the first real quality incident happens in production, not in review.
3. **Coupling extraction to transformation to loading as one atomic step.** This feels simpler to write initially but multiplies the cost of every future failure, since any failure anywhere forces redoing everything.
4. **Hard-coding the assumption that the source schema never changes.** It always eventually does, usually from a team that doesn't know your pipeline depends on that exact shape.
5. **Treating a successful process exit as proof the data is correct.** A job can exit 0 while producing subtly wrong output; infra health and data health are different questions.
6. **Skipping the backfill design conversation until a backfill is urgently needed.** Retrofitting idempotent, backfill-safe logic under incident pressure is far riskier than designing for it from the start.
7. **Logging full row contents, including sensitive fields, for convenience during debugging.** This routinely leaks PII into log aggregation systems with far broader access than the original data.
8. **Choosing a streaming architecture "because it's more modern" without a real latency requirement.** Streaming adds genuine complexity (windowing, late data, weaker consistency guarantees) that is only worth paying for when a concrete requirement demands low latency.
9. **Treating the orchestrator as the place business logic lives.** DAG/task definitions bloated with actual transformation logic are hard to test and reuse; that logic belongs in testable functions or SQL models the orchestrator merely triggers.
10. **No documented data contract.** Without an explicit statement of what a pipeline's output is supposed to look like (columns, types, null tolerances, freshness), there is nothing concrete for a validation stage to check against, and downstream consumers are left guessing.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|---|---|---|
| Duplicate rows appearing after a job that "failed" | Non-idempotent append-only load; a retry re-inserted already-committed rows | Switch to upsert by natural key or full-partition overwrite |
| Column suddenly all-null in the destination | Source silently renamed or removed the column; pipeline's field mapping still references the old name | Add explicit schema/contract checks that fail loudly on unexpected column changes |
| Pipeline works for small test data but times out or OOMs on full production volume | Single-machine processing of data that has outgrown it | Move heavy transformation to a distributed engine (Spark) or push it into warehouse SQL |
| Downstream pipeline runs on incomplete upstream data | Dependency/sensor check too permissive, or missing entirely | Add an explicit upstream-success dependency check in the orchestrator before triggering |
| Backfill for a past date range produces different results than the original run | Non-deterministic transformation logic (e.g. relying on "now" instead of the target date), or logic changed since the original run without a migration plan | Make transformations deterministic given their input date range; version transformation logic changes explicitly |
| Validation check passes but data is still visibly wrong | Check thresholds too loose, or checking the wrong signal entirely (e.g. only row count, not distribution) | Add distribution-level checks (null rate, value ranges, category frequencies) alongside row-count checks |
| Pipeline "succeeded" but table wasn't actually updated | Transaction not committed, or load step pointed at the wrong environment/table due to config error | Verify commit semantics explicitly in tests; keep environment config out of code, in reviewed config files |
| Two runs of the same pipeline for the same date produce different row counts | A source query without a stable ordering/paging cursor, or a time-based filter with an ambiguous timezone boundary | Use stable cursors for pagination; make all date/time boundaries explicit about timezone |
`,

  faqs: `
**Is ELT always better than ETL now?**
No — ELT is the more common default with cheap cloud warehouse compute, but ETL still makes sense when transformation logic is too heavy or complex for the destination's SQL engine to run efficiently, or when the destination genuinely should only ever receive clean data (some compliance-sensitive systems are deliberately built this way).

**Do I need Airflow to have a "real" data pipeline?**
No. A single well-designed scheduled script with idempotent writes and a validation stage is a real pipeline. Airflow (or a similar orchestrator) becomes valuable once you have multiple interdependent pipelines that need explicit dependency management, retries, and centralized visibility — it's a scaling tool, not a prerequisite for correctness.

**What's the difference between a data pipeline and ETL?**
ETL is one specific pattern (and originally, often one category of tool) for building data pipelines. "Data pipeline" is the broader concept — any system moving and transforming data — that includes ETL, ELT, streaming pipelines, and hybrids of all of the above.

**How do I decide between batch and streaming?**
Start with a concrete latency requirement, not a technology preference. If nothing downstream needs results faster than an hourly or daily refresh, batch is simpler to build, test, and debug. Reach for streaming only when a specific use case (fraud detection, live pricing, real-time personalization) genuinely requires sub-minute latency.

**What should a data quality check actually check?**
At minimum: row count within a plausible range, null rates on critical columns below a threshold, expected schema/columns present, and value ranges/referential integrity where applicable. Add distribution checks (comparing today's value distributions to historical baselines) once the basics are solid.

**How is a feature store different from just a pipeline's output table?**
A feature store is a specialized destination purpose-built for ML: it typically guarantees consistency between the features used at training time and at serving time, and often serves low-latency lookups for online inference in addition to bulk historical access for training — concerns a generic warehouse table doesn't address. See the **Feature Stores** skill for depth.

**Can I make a pipeline "exactly-once" end to end?**
True end-to-end exactly-once delivery across independent systems is hard and expensive to guarantee directly. The standard practical approach is at-least-once delivery combined with idempotent processing, which behaves like exactly-once from the destination's perspective without needing distributed transaction machinery.

**How often should backfills be tested, if they're rarely run?**
Treat backfill capability as a tested code path, not a break-glass procedure — run it periodically against a non-critical date range (or in a staging environment) even when no bug currently requires it, so the first real backfill isn't also the first time it's actually been exercised.
`,

  "interview-questions": `
**Junior level**

1. *What is the difference between ETL and ELT?* — ETL transforms data before loading it into the destination, typically in a separate processing layer; ELT loads raw data first and transforms it inside the destination using its own compute. ELT became common once cloud warehouse compute got cheap and elastic.
2. *What does it mean for a pipeline to be idempotent?* — Running it multiple times with the same input produces the same result as running it once; typically achieved via upserts on a natural key or full-partition overwrites instead of blind appends.
3. *Why would you choose a batch pipeline over a streaming one?* — Batch is simpler to build, test, and debug; choose it unless a concrete latency requirement (seconds-level freshness) demands streaming's added complexity.
4. *What's the difference between an orchestrator and a processing engine?* — The orchestrator (e.g. Airflow) decides when and in what order things run and manages retries/dependencies; the processing engine (e.g. Spark, or warehouse SQL) does the actual data computation the orchestrator triggers.
5. *Why should data validation happen inside the pipeline instead of after?* — Because data lands in downstream consumers (dashboards, models) as soon as the load step completes; validating afterward means bad data has already propagated and possibly already caused damage before anyone notices.

**Senior level**

6. *Design a backfill strategy for a pipeline that discovered a transformation bug affecting the last 90 days.* — A strong answer covers: confirm the load step is idempotent (partition overwrite or upsert) so re-running is safe; identify exactly which output rows/tables the bug affected using lineage metadata; re-run the corrected transformation logic for the affected date range against the still-available raw/staged data (this is why raw data is kept); validate the corrected output against the same quality checks before it overwrites production; and communicate to downstream consumers that historical values changed and why.
7. *A pipeline's process exits successfully every day, but a stakeholder reports the numbers have been subtly wrong for two weeks. How do you find and prevent this?* — Points to hit: infra-level "job succeeded" monitoring is insufficient; need data-specific observability (volume, distribution, freshness checks) that would have flagged an anomaly; walk the debugging escalation (compare row counts/distributions across the affected date range to a historical baseline, check for a source schema change) to isolate when it started; propose adding the missing distribution checks and lineage tracking to prevent recurrence.
8. *How do you decide whether a validation failure should halt the pipeline or quarantine the bad rows?* — Depends on the cost of a false negative versus a false positive: halt when downstream consumers cannot tolerate any bad data (financial, compliance-critical); quarantine plus alert when the pipeline should keep flowing the (larger volume of) good data while still surfacing and preserving the bad rows for inspection, common for high-volume, imperfect-source data like clickstream logs.
9. *Explain why tightly coupling extract, transform, and load into one atomic step is a scalability and reliability risk.* — A failure anywhere in that single unit forces redoing the entire chain, including potentially expensive or rate-limited extraction; decoupling with persisted intermediate state at each boundary limits retry cost to just the failed stage.
10. *When would you reach for a distributed processing engine like Spark instead of doing transformations in warehouse SQL?* — When transformation logic is too complex or resource-intensive for the warehouse's SQL engine to run efficiently, when you need programmatic control not naturally expressed in SQL, or when data must be processed before it ever reaches the warehouse.
11. *How would you monitor pipeline health beyond "did the job succeed"?* — Freshness (time since last successful update vs. SLA), volume (row counts vs. historical baseline), distribution (null rates, value ranges vs. baseline), and lineage (which run produced which downstream rows) — each answering a distinct question infra monitoring alone cannot.
12. *What's the tradeoff of at-least-once delivery plus idempotent processing versus trying to guarantee true exactly-once end to end?* — True exactly-once across independent systems typically requires expensive distributed transaction coordination; at-least-once plus idempotency achieves the same practical outcome (no duplication, no data loss) with far simpler, cheaper machinery, which is why it's the standard practical approach.
`,

  "coding-questions": `
**Problem 1: Idempotent upsert loader**

Write a function that loads a batch of user records into a table, safe to call multiple times with overlapping data without creating duplicates or losing the most recent values.

~~~python
def upsert_users(rows: list[dict], conn) -> int:
    """
    Idempotently load user rows keyed by user_id.
    Returns the number of rows processed (not necessarily inserted --
    re-running with the same rows should return the same count each time).
    """
    if not rows:
        return 0
    conn.executemany(
        """
        INSERT INTO users (user_id, email, updated_at)
        VALUES (:user_id, :email, :updated_at)
        ON CONFLICT (user_id) DO UPDATE SET
            email = excluded.email,
            updated_at = excluded.updated_at
        WHERE excluded.updated_at >= users.updated_at
        """,
        rows,
    )
    conn.commit()
    return len(rows)

# Complexity: O(n) in the number of rows for both the insert path and
# the conflict-check path (a single indexed upsert per row); the
# "WHERE excluded.updated_at >= users.updated_at" guard additionally
# makes this safe against OUT-OF-ORDER re-delivery, not just repeated
# delivery -- an important follow-up beyond plain idempotency.
#
# Follow-up: how would this change if user_id were not unique across
# sources (e.g. two source systems reuse the same numeric ID space)?
# Answer sketch: key on a composite (source_system, user_id) instead.
~~~

**Problem 2: Data quality gate with quarantine**

Write a validation function that separates a batch into "good" and "quarantined" rows instead of failing the whole batch, and explain when this is the right choice versus halting entirely.

~~~python
def validate_and_split(rows: list[dict]) -> tuple[list[dict], list[dict]]:
    """
    Returns (good_rows, quarantined_rows). Good rows may proceed to
    load; quarantined rows are preserved (e.g. written to a
    dead-letter table) for later inspection instead of silently
    dropped or allowed to corrupt the destination.
    """
    good, quarantined = [], []
    for row in rows:
        amount = row.get("amount")
        if amount is None or amount < 0 or row.get("customer_id") is None:
            quarantined.append(row)
        else:
            good.append(row)

    quarantine_rate = len(quarantined) / len(rows) if rows else 0
    if quarantine_rate > 0.10:
        # Even quarantining has a limit: if too much of the batch is
        # bad, something is systemically wrong upstream -- halt rather
        # than silently proceeding with 90% of a suspicious batch.
        raise ValidationError("quarantine_rate", f"{quarantine_rate:.1%} of batch quarantined")

    return good, quarantined

# Complexity: O(n). Follow-up: this function conflates "row-level
# validity" with "batch-level sanity" (the quarantine_rate check) --
# in production these are often separated into distinct check
# functions so each can be tested and tuned independently.
~~~

**Problem 3: Incremental extraction watermark**

Write the extraction logic for a pipeline that should only pull rows updated since the last successful run, and explain the failure mode this avoids compared to always extracting everything.

~~~python
from datetime import datetime

def extract_incremental(conn, last_watermark: datetime) -> tuple[list[dict], datetime]:
    """
    Extract only rows updated since last_watermark. Returns the rows
    AND the new watermark to persist -- the new watermark should be
    the max updated_at actually seen, not simply "now", to correctly
    handle clock skew between the extraction process and the source.
    """
    cursor = conn.execute(
        "SELECT * FROM orders WHERE updated_at > ? ORDER BY updated_at ASC",
        (last_watermark,),
    )
    rows = [dict(row) for row in cursor.fetchall()]
    if not rows:
        return [], last_watermark  # nothing new; watermark unchanged
    new_watermark = max(row["updated_at"] for row in rows)
    return rows, new_watermark

# Complexity: O(k) where k is the number of changed rows, versus
# O(n) for the full table on every run -- the core performance win
# discussed in the Performance section. Follow-up: what happens if
# two rows share the exact same updated_at timestamp and one of them
# is updated again between extraction runs? Answer sketch: use a
# strictly-increasing sequence/version column instead of a timestamp
# alone if sub-second collisions or clock precision are a real risk.
~~~
`,

  "hands-on-labs": `
**Lab 1 (Beginner): Build a non-idempotent pipeline, then break it on purpose**
Write the simple three-function extract/transform/load script from the Beginner Concepts section against a local SQLite database. Run it twice in a row and confirm the row count doubles. Deliverable: a short write-up (a few sentences) of exactly what happened and why, plus the fixed idempotent version that leaves the row count unchanged on a second run. Exercises: idempotency, SQL upserts.

**Lab 2 (Intermediate): Add a validation gate and a schema-change test**
Extend Lab 1's pipeline with a validation stage (null-rate and row-count checks) that runs between transform and load, and raises instead of proceeding on violation. Then simulate a source schema change (rename a column in the source CSV) and verify the pipeline fails loudly with a clear error rather than silently loading nulls. Deliverable: the validation function, a test suite proving both the "good data passes" and "bad data is caught" paths, and a short note on what specifically would have gone wrong without the schema check. Exercises: data quality validation, schema evolution handling.

**Lab 3 (Intermediate/Advanced): Design and test a backfill**
Given a pipeline whose load step is idempotent (from Lab 1's fix), implement a backfill entry point that reprocesses an arbitrary historical date range using the same transformation logic as the regular daily run. Intentionally introduce a transformation bug, run the pipeline for a week of "history," discover the bug, fix it, and backfill that week. Deliverable: proof (a before/after row comparison) that the backfill corrected the historical data without duplicating or leaving stale rows behind. Exercises: idempotent backfilling, deterministic transformation logic.

**Lab 4 (Production): Instrument observability and wire up orchestration**
Using Airflow (see the **Airflow** skill for setup) or a similarly simple scheduler, orchestrate the pipeline from Labs 1-3 as a small DAG (extract -> transform -> validate -> load), add freshness/volume logging at each stage, and configure an alert (even a simple log-based one) that fires when validation fails or the job misses its expected completion time. Deliverable: a running DAG with visible task-level history, plus a simulated incident (force a validation failure) that demonstrably triggers the alert path. Exercises: orchestration, pipeline observability, end-to-end integration of every concept on this page.
`,

  "real-projects": `
**Project 1: Incremental analytics pipeline for an e-commerce dataset**
Build an end-to-end pipeline that incrementally extracts orders and customers from a source database, transforms them into a dimensional "customer lifetime value" table using an idempotent upsert load, validates data quality before each load, and exposes freshness/volume metrics. Engineering requirements: incremental (watermark-based) extraction, idempotent load proven by an automated "run twice" test, a documented data contract, and a tested backfill path for correcting historical data. This is a strong portfolio piece because it demonstrates every core principle on this page in one coherent, inspectable system rather than as isolated exercises.

**Project 2: Streaming clickstream aggregation with late-data handling**
Build a small streaming pipeline (using Kafka as the transport layer — see the **Kafka** skill) that consumes click events and maintains rolling windowed aggregates (e.g. page views per minute), explicitly handling late-arriving events with a documented watermark policy. Engineering requirements: an explicit decision and justification for the watermark window, a test that injects deliberately late events and verifies the documented policy (drop vs. reprocess) is what actually happens, and monitoring for how often events arrive later than the watermark allows (a direct signal of whether the watermark is well-tuned).

**Project 3: Feature pipeline feeding a Feature Store for training/serving consistency**
Build a pipeline that computes a set of ML features from raw event data and lands them in a **Feature Store** (or a store-like abstraction if a real one isn't available), ensuring the exact same transformation logic produces consistent values whether computed in batch (for training data) or incrementally (for online serving). Engineering requirements: a single shared transformation function used by both the batch and "serving" code paths (to avoid training/serving skew), validation that feature distributions used in a downstream sample model match between the batch-computed and serving-computed paths, and documentation connecting this project explicitly to the broader **MLOps** lifecycle it feeds into.
`,

  "case-studies": `
**Airbnb and the birth of Airflow.** As Airbnb's number of interdependent data pipelines grew, cron-based scheduling with implicit dependencies became unmanageable — failures in one job silently left downstream jobs running on stale or missing data with no clear visibility into why. The lesson: once a system has more than a handful of interdependent pipelines, explicit dependency graphs and centralized retry/alerting stop being a nice-to-have and become a correctness requirement, not just an operational convenience.

**A generic but instructive incident pattern: the silent null column.** A recurring, widely-reported category of real-world incident (across many companies, not any one specifically) looks like this — an upstream team renames or restructures a source field, the pipeline's transformation code uses a permissive lookup (like a dictionary "get" with no error on a missing key) that quietly returns null instead of failing, and a model or dashboard trains/reports on that null-filled column for days or weeks before a human notices something looks off. The lesson: permissive, silently-succeeding code is more dangerous in a pipeline than code that crashes loudly, because a crash is at least immediately visible.

**Idempotency in financial and payments pipelines.** Financial systems are consistently cited (across the industry generally) as the strongest real-world argument for strict idempotent processing, because a duplicated transaction record from a retried job is not a cosmetic bug — it is a direct, auditable financial discrepancy. The lesson: the cost of getting idempotency wrong scales with the cost of being wrong in the destination system, and financial data makes that cost concrete and immediate rather than abstract.

**Backfills as a recurring operational need in ride-sharing/pricing systems.** Companies running real-time pricing or matching models have publicly discussed the operational importance of safe, repeatable backfill tooling — correcting a bug in historical pricing-model training data without a well-designed backfill path risks either leaving the bug uncorrected in historical data or, worse, introducing new duplication/corruption while trying to fix it by hand. The lesson: backfill capability is not an edge-case feature to bolt on later; it is a direct consequence of designing idempotent, deterministic pipeline logic from the start.
`,

  comparisons: `
| Approach | Best for | Weakness | How seniors choose |
|---|---|---|---|
| ETL (transform before load) | Destinations with limited/expensive compute; strict "only clean data allowed" destinations | Slower iteration — changing transform logic often means re-processing from source again | Choose when the destination genuinely can't/shouldn't hold raw data, or transform compute needs are heavier than the destination can handle |
| ELT (load raw, transform in destination) | Modern cloud warehouses/lakehouses with cheap storage and elastic compute; fast iteration on transform logic | Raw data sits in the destination (a data governance/access consideration); relies on the destination's compute being adequate | Default choice for most analytics and ML-training pipelines today, given warehouse compute economics |
| Batch pipeline | Most reporting, analytics, and ML training-set use cases; simpler to build/test/debug | Not suitable when a concrete sub-minute latency requirement exists | Default; only move to streaming when a specific requirement demands it |
| Streaming pipeline | Fraud detection, live pricing, real-time personalization, live dashboards | Real added complexity: windowing, late data, weaker consistency guarantees, harder to test | Justify with a concrete latency requirement, not a preference for "modern" architecture |
| Hand-rolled scheduling (cron + scripts) | A single pipeline, or a very small number, with simple dependencies | Doesn't scale past a handful of interdependent jobs — dependency management and retry logic get reinvented poorly each time | Fine for genuinely small setups; migrate to a real orchestrator once dependencies multiply |
| Dedicated orchestrator (Airflow or similar) | Multiple interdependent pipelines needing explicit dependencies, retries, alerting, and visibility | Added operational surface area (the orchestrator itself needs to be run and maintained) | Adopt once "which jobs depend on which, and did they all actually succeed" becomes hard to answer by memory |

The honest summary: there is rarely one universally "best" pipeline architecture. The right choice depends heavily on data volume, latency requirements, and team size/maturity — a two-person startup's pipeline and a thousand-engineer company's pipeline are correctly built very differently, and the principles on this page (idempotency, validation, decoupling) apply to both regardless of which specific tools are chosen.
`,

  "related-technologies": `
- **Airflow** — the most widely adopted orchestration tool for coordinating multi-step pipelines: dependency graphs, scheduling, retries, and centralized visibility. Learn this page's orchestration concepts first, then go deep on Airflow's DAG model and executor internals.
- **Spark** — a distributed processing engine used when transformation work outgrows a single machine or a warehouse's SQL engine. Learn this page's ETL/ELT and performance concepts first, then go deep on Spark's execution model.
- **Feature Stores** — a specialized pipeline destination purpose-built for ML: consistent features between training and serving, plus low-latency online lookups. The natural "next stop" after this page for anyone building ML-specific pipelines.
- **Kafka** — the dominant transport layer underlying most streaming pipelines; understand batch-vs-streaming concepts on this page before diving into Kafka's log-based architecture.
- **PostgreSQL** — a common pipeline source and destination; the upsert/idempotency SQL patterns on this page map directly onto PostgreSQL's "ON CONFLICT" syntax and transactional guarantees.
- **MLOps** — the broader lifecycle (training, deployment, versioning, monitoring of models) that well-built data pipelines feed into; this page is the "how the fuel gets made" layer underneath that broader lifecycle.
- **AI Monitoring** — general system/model monitoring; this page's Monitoring section explains how data-specific observability (freshness, volume, distribution, lineage) differs from and complements that broader discipline.
- **dbt-style SQL transformation tools** (referenced conceptually throughout this page as the common vehicle for ELT-pattern transformations) — version-controlled, testable SQL modeling inside the warehouse.
- **Data quality/observability frameworks** (referenced conceptually as the production-grade version of the validate_orders example on this page) — tools that turn ad hoc assertions into a queryable history of check results over time.
`,

  "latest-updates": `
This page is written with a knowledge cutoff of early 2026 and deliberately focuses on durable design principles rather than fast-moving product/version specifics, since those specifics are covered in depth in the tool-specific sibling skills (**Airflow**, **Spark**, **Feature Stores**) where they belong. A few broader, comparatively stable industry trends worth naming as of this writing, stated with appropriate hedging where exact dates or vendor specifics would require verification:

- **Lakehouse architectures** (combining data-lake-style cheap storage with warehouse-style transactional/schema guarantees, via formats like Delta Lake, Iceberg, and Hudi) have continued to mature as a middle ground between "raw data lake" and "structured warehouse," which directly affects how the ELT pattern's "load raw" step is implemented in practice.
- **Data quality and data observability as a distinct tooling category** (separate from general infrastructure monitoring) has continued to grow, reflecting the increasing industry recognition that "the job succeeded" and "the data is correct" are genuinely different questions requiring different instrumentation.
- **AI/ML workloads specifically** have pushed increased attention toward feature pipeline consistency (avoiding training/serving skew) as LLM and traditional ML pipelines both increasingly depend on feature stores and well-governed data pipelines feeding them, tying this page more tightly to the **MLOps** and **Feature Stores** skills than in earlier eras of pure BI-focused data engineering.
- **Data contracts as an explicit, sometimes tooled practice** (rather than informal tribal agreements between teams) have gained more attention as organizations scale the number of interdependent pipelines, directly addressing the organizational-scaling bottleneck discussed in this page's Scalability section.

For anything version-specific (a particular tool's current release, a specific vendor's newest feature), treat this page as a conceptual foundation and verify current specifics directly against that tool's own documentation or a fresh web search, since tool capabilities in this space evolve quickly.
`,

  "future-roadmap": `
This is the final skill in the full catalog on this platform, and it is a fitting place to end precisely because it is the least tool-specific and most durable of everything in the MLOps and Data Engineering category. Tools will keep changing — the next generation of orchestrators, processing engines, and warehouse formats will look different from today's — but the pressures that shape them will not: retries will still happen, schemas will still drift, and "did the job run" will still be a different, easier question than "was the data correct."

Where the space is heading, stated with appropriate hedging since specific vendor trajectories are hard to predict with confidence: continued blurring of the batch/streaming distinction (unified processing engines that handle both with the same programming model, reducing the need to choose one architecture upfront); continued growth of declarative, SQL-first transformation tooling as the default for ELT-pattern work, with imperative code reserved for genuinely complex logic; increasing automation of data quality and schema-drift detection (inferring likely checks from historical data patterns rather than requiring every check to be hand-written); and tighter integration between pipelines and the ML-specific destinations (feature stores) and monitoring (AI monitoring) that consume their output, as more of the industry's data infrastructure exists specifically to feed models rather than only dashboards.

What is worth betting career time on regardless of which specific tools win: the principles taught on this page. Idempotency, explicit validation, decoupled stages, and real observability are not trends — they are the direct, recurring consequences of building systems that must survive retries, partial failures, and change over time. An engineer who deeply understands *why* those principles hold will pick up whatever specific orchestrator, processing engine, or warehouse format is dominant five years from now far faster than an engineer who only memorized today's tool APIs. That is the same throughline connecting every sibling skill in this category — Airflow, Spark, Feature Stores, MLOps, AI Monitoring — and it is the note this entire 159-skill catalog closes on: tools are a means; reliable, trustworthy systems are the actual goal.
`,

  "cheat-sheet": `
~~~text
DATA PIPELINES -- QUICK REFERENCE

ETL vs ELT
  ETL: transform BEFORE load (separate processing layer)
  ELT: load raw, THEN transform (using destination's own compute)
  ELT is the modern default given cheap cloud warehouse compute

Batch vs Streaming
  Batch:     bounded chunk, on a schedule -- default choice
  Streaming: unbounded events, low latency -- only if a real
             latency requirement demands it (fraud, live pricing)

IDEMPOTENCY (the core design principle)
  Bad:  INSERT INTO t VALUES (...)                 -- duplicates on retry
  Good: INSERT ... ON CONFLICT (key) DO UPDATE ...  -- upsert by natural key
  Good: overwrite whole partition (e.g. by date)    -- safe re-run
  Rule: retries WILL happen -- design for them, don't hope to avoid them

DATA QUALITY GATE (between transform and load)
  Check: row count in expected range
  Check: null rate on critical columns below threshold
  Check: expected schema/columns present
  Check: value ranges / referential integrity
  On failure: HALT (compliance/financial data) or QUARANTINE + alert
              (high-volume, imperfect-source data)

SCHEMA EVOLUTION
  Fail loudly on unexpected change > silently coerce/drop
  Strategies: strict contract | schema-on-read | versioned migration

BACKFILLS
  = re-running pipeline logic for a historical date range
  Safe by construction IF load is idempotent (upsert/partition overwrite)
  Design and TEST this path before you urgently need it

DECOUPLING (limit failure blast radius)
  Persist raw + staged intermediate data at each boundary
  Failure in Load => only retry Load, not Extract+Transform+Load

ORCHESTRATION vs PROCESSING
  Orchestrator (Airflow):  WHEN/order/retries/dependencies/alerts
  Processing engine (Spark / warehouse SQL): the actual computation
  Don't bury business logic inside orchestrator task definitions

OBSERVABILITY (data-specific, not just infra)
  Freshness:    time since last successful update vs SLA
  Volume:       row count vs historical baseline
  Distribution: null rate / value ranges vs historical baseline
  Lineage:      which run produced which downstream rows

DELIVERY SEMANTICS
  At-most-once:  can silently drop data
  At-least-once: never drops, can duplicate
  Exactly-once:  hard/expensive end-to-end -- approximate via
                 at-least-once + idempotent processing (standard approach)

CLASSIC ANTI-PATTERNS
  1. Non-idempotent writes -> duplicate data on retry
  2. No validation gate -> bad data flows silently downstream
  3. Tightly coupled E-T-L -> any failure redoes everything

DECISION CHEAT
  Small/med data, warehouse dest, fast iteration -> ELT
  Data too big/complex for warehouse SQL         -> ETL + Spark
  Sub-minute latency requirement                 -> streaming (Kafka)
  Daily/hourly reporting, ML training sets       -> batch
  Many interdependent pipelines                  -> add orchestrator
  ML features need train/serve consistency       -> Feature Store
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What does ETL stand for and when does the transform happen? | Extract, Transform, Load — transformation happens before the data reaches the destination. |
| What does ELT stand for and when does the transform happen? | Extract, Load, Transform — raw data is loaded first, then transformed using the destination's own compute. |
| Why did ELT become more common? | Cloud data warehouses made storage cheap and compute elastic, so it became practical to load raw data first and transform inside the warehouse. |
| What makes a pipeline stage idempotent? | Running it multiple times with the same input produces the same final result as running it once — e.g. via upsert-by-key or partition overwrite instead of blind append. |
| Why is idempotency a "design from day one" concern rather than an edge case? | Retries from transient failures (timeouts, crashes, rate limits) are the normal case in distributed systems, not a rare exception. |
| Where should data quality validation sit in a pipeline? | As an explicit stage between transform and load, so bad data is caught before it reaches any downstream consumer. |
| What's the difference between halting and quarantining on a validation failure? | Halting stops the whole pipeline (safer for compliance/financial data); quarantining routes only the bad rows aside while letting good rows proceed (better for high-volume, imperfect sources). |
| What is a backfill? | Deliberately reprocessing a historical date range, typically to correct a bug or populate a new column for history. |
| Why does idempotent load logic make backfills safer? | Re-running the same pipeline logic for a past date range converges to the same correct final state instead of duplicating or requiring manual cleanup. |
| What's the risk of tightly coupling extract, transform, and load into one atomic step? | A failure anywhere forces redoing the entire chain, including potentially expensive or rate-limited extraction. |
| What is a watermark in a streaming pipeline? | The pipeline's declared assumption about how late an event can arrive before a time window is considered final. |
| What's the practical substitute for true end-to-end exactly-once delivery? | At-least-once delivery combined with idempotent processing — achieves the same practical outcome without expensive distributed transaction coordination. |
| What does an orchestrator do that a processing engine does not? | Decides when and in what order things run, manages dependencies/retries/alerting — it triggers computation but usually doesn't perform it itself. |
| Name the four core data-observability signals distinct from infra monitoring. | Freshness, volume, distribution, and lineage. |
| Why is "the job exited successfully" insufficient as a pipeline health signal? | A job can complete without error while still producing subtly wrong data — infra health and data health are different questions. |
`,

  mcqs: `
1. A batch pipeline retries after a transient network failure and the destination table now has duplicate rows for the same order_id. What is the most direct fix?
   A. Add more retries with longer backoff
   B. Change the load step to an upsert keyed on order_id instead of a blind insert
   C. Switch the pipeline to streaming
   D. Increase the validation null-rate threshold
   **Answer: B** — the root cause is a non-idempotent write; upserting by the natural key makes re-runs safe regardless of how many times they occur.

2. Which of the following best describes why ELT became more common than classic ETL?
   A. ELT is inherently more secure than ETL
   B. Cloud warehouses made storage and compute cheap enough to transform data after loading it raw
   C. ELT eliminates the need for data validation
   D. ETL was deprecated by modern SQL standards
   **Answer: B** — the shift is an economics story (cheap elastic warehouse compute), not a security or standards story.

3. A pipeline's validation stage fails when a source column is renamed and the transformation code quietly reads it as always-null. What does this scenario primarily illustrate?
   A. The need for streaming instead of batch processing
   B. The importance of explicit schema-change detection rather than silent, permissive field handling
   C. A backfill was performed incorrectly
   D. The orchestrator's retry policy was misconfigured
   **Answer: B** — this is a classic schema-drift failure caused by permissive code silently treating a rename as "missing," which is exactly what explicit schema checks are meant to catch.

4. Which statement about orchestration tools (like Airflow) versus processing engines (like Spark) is correct?
   A. Orchestrators perform the actual data transformation
   B. Processing engines schedule and manage task dependencies
   C. Orchestrators decide when/whether tasks run and manage retries and dependencies; processing engines perform the actual computation
   D. They are interchangeable and either can fully replace the other
   **Answer: C** — these are distinct responsibilities that are commonly conflated by beginners.

5. Why is "at-least-once delivery plus idempotent processing" considered a practical substitute for true exactly-once semantics?
   A. It is cheaper to implement and produces the same practical outcome (no duplication, no loss) at the destination
   B. It guarantees data arrives faster
   C. It removes the need for any data validation
   D. It only applies to streaming pipelines, not batch
   **Answer: A** — true end-to-end exactly-once is expensive to guarantee directly; combining at-least-once delivery with idempotent writes achieves the same effective outcome far more cheaply, and applies to both batch and streaming.

6. A team wants to reprocess the last 60 days of data after fixing a transformation bug. Which existing design decision most directly determines whether this is safe to do?
   A. Whether the pipeline uses Python or SQL for transformation
   B. Whether the load step is idempotent (upsert/partition overwrite) versus append-only
   C. Whether the pipeline runs on a schedule or is triggered manually
   D. Whether the destination is a data warehouse or a data lake
   **Answer: B** — an idempotent load step makes backfilling a matter of simply re-running the corrected logic for that range; an append-only load step requires risky manual cleanup first.
`,

  "revision-notes": `
A data pipeline moves data from sources to destinations through extraction, transformation, and loading — the order of the last two determines whether it's ETL (transform before load, useful when the destination has limited compute or must only ever hold clean data) or ELT (load raw first, transform using the destination's own compute, the modern default given cheap cloud warehouse compute). Batch pipelines process bounded chunks on a schedule and should be the default; streaming pipelines process unbounded events at low latency and are worth their added complexity (windowing, late-data handling, weaker consistency guarantees) only when a concrete latency requirement demands it.

Idempotency — a stage producing the same result whether run once or many times — is the single most important design principle, because retries from transient failures are the normal case in distributed systems, not an edge case. The practical techniques are upserting by a natural key and overwriting whole partitions rather than blindly appending; these same techniques are exactly what make backfilling historical data (deliberately reprocessing a date range, typically to fix a bug) safe rather than a risky manual cleanup exercise.

Data quality validation belongs as an explicit pipeline stage between transform and load, not as an afterthought — checking row counts, null rates, schema presence, and value ranges before anything reaches a downstream consumer. A validation failure should either halt the pipeline (for compliance/financial-critical data) or quarantine the bad rows while letting good ones proceed (for high-volume, imperfect-source data); both are deliberate choices, not defaults. Schema evolution — source columns being renamed, added, or retyped over time — must be handled by failing loudly on unexpected changes, never by silently coercing or dropping fields, since silent handling is what turns a schema change into a weeks-long undetected data-quality incident.

Architecturally, decoupling extraction, transformation, and loading with persisted intermediate state at each boundary limits the blast radius of any single failure to just that stage, instead of forcing a full redo. Orchestration tools (Airflow) decide when and in what order pipelines run and manage retries/dependencies/alerting; processing engines (Spark, or a warehouse's own SQL compute) perform the actual computation — conflating these two responsibilities is a common beginner mistake. Observability for pipelines is data-specific and distinct from general infrastructure monitoring: freshness, volume, distribution, and lineage are the four signals that answer "is the data actually correct and on time," which "the job exited successfully" alone cannot answer.

Pipeline architecture choices — ETL vs. ELT, batch vs. streaming, hand-rolled scheduling vs. a full orchestrator — depend heavily on data volume, latency requirements, and team size, and there is rarely one universally correct answer; what stays constant across every choice is the need for idempotent writes, explicit validation, decoupled stages, and real observability. Those principles, more than any specific tool, are what this page and its sibling skills — Airflow, Spark, Feature Stores, and the broader MLOps and AI Monitoring disciplines — ultimately teach.
`,

  "learning-roadmap": `
**Week 1 — Foundations and the core vocabulary.** Read this page's Beginner and Intermediate Concepts sections closely. Build the simple three-function extract/transform/load script from Lab 1 against a local SQLite database, deliberately run it twice, and observe the duplication. Milestone: you can explain ETL vs. ELT and batch vs. streaming from first principles, and you have seen a non-idempotent pipeline break with your own eyes.

**Week 2 — Idempotency and validation.** Fix Lab 1's pipeline to use an upsert-based load, write an automated "run twice, row count unchanged" test, and add a validation stage (null-rate, row-count, schema checks) that halts on violation (Lab 2). Milestone: you can design and test an idempotent load path and a validation gate without referencing this page.

**Week 3 — Schema evolution and backfills.** Simulate a source schema change and verify your pipeline fails loudly rather than silently nulling data. Implement and test a backfill entry point, deliberately introduce and then fix a transformation bug, and backfill a week of "history" (Lab 3). Milestone: you can explain, with a concrete example you built yourself, why idempotent loads are what makes backfills safe.

**Week 4 — Orchestration and observability.** Move your pipeline into a small orchestrated DAG (Airflow or a simple scheduler), add freshness/volume/distribution logging at each stage, and wire up an alert for validation failures or missed SLAs (Lab 4). Milestone: you have an end-to-end, observable, orchestrated pipeline demonstrating every principle on this page in one system.

**Where this leads next.** With these design principles internalized, the natural next stops on this platform are the **Airflow** skill (to go deep on DAG authoring, executors, and scheduling semantics) and the **Spark** skill (to go deep on distributed processing internals) — pick either first depending on whether your immediate need is coordination or heavy computation. After those, **Feature Stores** covers the ML-specific destination pattern this page only introduced, and **MLOps** ties pipeline output into the broader model lifecycle, with **AI Monitoring** covering what happens once a model trained on this pipeline's output is running in production. That progression — Data Pipelines to Airflow/Spark to Feature Stores to MLOps to AI Monitoring — completes the MLOps and Data Engineering category on this platform.
`,

  "official-docs": `
- **Apache Airflow documentation** (airflow.apache.org) — the reference for DAG authoring, scheduling, and executor concepts referenced throughout this page; go here for orchestration specifics beyond what this page's design-principles focus covers.
- **Apache Spark documentation** (spark.apache.org) — the reference for distributed processing internals referenced in the Performance and Advanced Concepts sections.
- **dbt documentation** (docs.getdbt.com) — the reference for SQL-based, version-controlled ELT-pattern transformation modeling, the most common vehicle for the ELT pattern discussed throughout this page.
- **Great Expectations documentation** — a widely used open-source framework for expressing and running the kind of data quality checks sketched in this page's validate_orders example, as a production-grade, queryable system rather than inline assertions.
- **Apache Kafka documentation** (kafka.apache.org) — the reference for the transport layer underlying most streaming pipeline architectures discussed in this page's batch-vs-streaming material.
- Cloud provider documentation for whichever warehouse/lakehouse you use (BigQuery, Redshift, Snowflake, or open lakehouse formats like Delta Lake/Iceberg) — verify current specifics directly, since exact feature sets and pricing evolve quickly and are outside this page's scope.
`,

  books: `
- **"The Data Warehouse Toolkit" by Ralph Kimball and Margy Ross** — the foundational text on dimensional modeling; still the clearest explanation of how to design the destination schemas that pipelines load into, regardless of how modern the pipeline tooling around them is.
- **"Designing Data-Intensive Applications" by Martin Kleppmann** — not pipeline-specific, but the single best book for understanding the distributed-systems concepts (consistency, delivery semantics, log-based architectures) that underpin why idempotency and exactly-once-style guarantees are hard, which this page draws on directly.
- **"Fundamentals of Data Engineering" by Joe Reis and Matt Housley** — a broad, current treatment of the data engineering lifecycle including pipeline design, orchestration, and data quality, useful as a wider-angle companion to this page's narrower design-principles focus.
- **"Streaming Systems" by Tyler Akidau, Slava Chernyak, and Reuven Lax** — the deepest treatment available of watermarking, windowing, and late-data handling referenced in this page's Advanced Concepts section, written by engineers who worked on Google's stream processing systems.
- **"The Phoenix Project" and "The Unicorn Project" by Gene Kim (and co-authors)** — not data-pipeline-specific, but genuinely useful for understanding the organizational-scaling side of pipeline reliability (ownership, on-call culture, deployment practices) discussed in this page's Scalability section.
`,

  blogs: `
- **Netflix Technology Blog** — recurring posts on large-scale data pipeline reliability, backfill tooling, and data platform architecture at genuine internet scale.
- **Uber Engineering Blog** — has published specifically on near-real-time pipeline architectures and the idempotency/exactly-once-style challenges of pricing and ETA systems referenced in this page's Case Studies section.
- **Airbnb Engineering Blog** — the original source for the Airflow origin story and continued posts on evolving orchestration practice at scale.
- **The dbt Blog / dbt Labs content** — high-signal, opinionated writing specifically about the ELT pattern and SQL-based transformation practice referenced throughout this page.
- **Data engineering-focused independent newsletters and blogs** (the specific most-current ones shift over time) — worth finding a currently active one via search rather than relying on any single name here, since this space's high-signal voices change faster than a static list can track reliably.
`,

  "research-papers": `
Data pipeline *engineering practice* is comparatively thin on formal peer-reviewed research relative to core ML topics — much of the best material is industry systems papers and engineering blog posts rather than academic papers, so this section is honest about that and points to the closest foundational reading instead of manufacturing citations that don't exist:

- **"MapReduce: Simplified Data Processing on Large Clusters" (Dean and Ghemawat, Google, 2004)** — the foundational systems paper behind distributed batch processing that directly shaped Spark's design; the closest thing to a canonical "data pipelines" academic paper, even though it predates the term's current usage.
- **"Resilient Distributed Datasets: A Fault-Tolerant Abstraction for In-Memory Cluster Computing" (Zaharia et al., 2012)** — the original Spark paper, directly relevant to the processing-engine concepts referenced throughout this page.
- **"The Dataflow Model" (Akidau et al., Google, 2015)** — the systems paper underlying modern stream processing's treatment of event time, watermarks, and windowing, directly relevant to this page's Advanced Concepts section on late-arriving data.
- **CAP theorem and eventual consistency literature (Brewer, Gilbert and Lynch)** — foundational distributed-systems theory underlying why exactly-once delivery is hard, and why at-least-once-plus-idempotency is the standard practical compromise discussed on this page.

For most practitioners, the industry engineering blogs and systems papers above will teach more directly applicable lessons than searching for a "data pipelines" paper that doesn't really exist as a distinct academic subfield — treat this as an engineering discipline informed by distributed-systems theory, not a research field with its own canonical literature.
`,

  videos: `
- **Any current conference talk from the Airflow Summit or Data Council conference series** on pipeline architecture and orchestration — search for the most recent year's sessions rather than relying on a specific named talk here, since the strongest content in this space is refreshed annually and a static reference would go stale quickly.
- **Martin Kleppmann's talks on stream processing and distributed systems** (searchable by name) — consistently among the clearest available explanations of the delivery-semantics and consistency concepts referenced in this page's Advanced Concepts section.
- **Tyler Akidau's talks on the Dataflow model and streaming systems** (searchable by name) — directly covers the watermarking and windowing concepts referenced on this page, from one of the people who helped formalize them.
- **dbt Labs' "Coalesce" conference sessions** — high-signal, current content specifically on the ELT/SQL-transformation pattern this page discusses conceptually.
- Search for "[current year] data engineering conference talks" when studying this material, since naming specific videos risks staleness in a fast-moving conference circuit — the underlying concepts on this page (idempotency, validation, decoupling) are what to look for regardless of which specific talk you find.
`,

  "github-repos": `
- **apache/airflow** — the reference orchestrator implementation; browsing its example DAGs is a fast way to see dependency-graph concepts from this page expressed in real code.
- **apache/spark** — the reference distributed processing engine implementation referenced throughout this page's Performance and Advanced Concepts sections.
- **dbt-labs/dbt-core** — the reference implementation of SQL-based, version-controlled ELT transformation modeling.
- **great-expectations/great_expectations** — a production-grade data quality/validation framework; a good next step after building the simple validate_orders function on this page by hand.
- **apache/kafka** — the reference implementation of the log-based transport layer underlying most streaming pipeline architectures.
- **delta-io/delta** and **apache/iceberg** — reference implementations of lakehouse table formats relevant to this page's discussion of where ELT's "load raw" step lands data in modern architectures.
- **apache/airflow's "airflow-tutorial"-style example repos and the Astronomer "astro-cli" quickstarts** — practical, runnable starting points for Lab 4's orchestration exercise.
- Search GitHub for "idempotent etl example" and "data quality checks pipeline example" for current, runnable small-scale reference implementations of this page's core patterns beyond any single repo listed here.
`,

  "practice-problems": `
Ordered by the skill each focuses on, building on the coding questions above:

1. **Idempotency drills**: implement upsert-based loaders against a few different natural key shapes (single column, composite key, key with a "latest wins by timestamp" tiebreaker) and write the "run twice, same result" test for each.
2. **Validation drills**: given a set of sample "bad batches" (empty batch, high null rate, out-of-range values, missing expected column), write a validation function that correctly classifies each one and returns a specific, actionable error for each.
3. **Schema evolution drills**: given a source that evolves across three versions (a column added, a column renamed, a type narrowed), implement and test a pipeline that handles all three without either crashing unhelpfully or silently losing data.
4. **Backfill drills**: given a pipeline with a known historical bug window, implement a backfill entry point and write a test proving the corrected backfill produces the exact expected historical state, no more and no less.
5. **Watermark/late-data drills** (streaming-focused): given a stream of timestamped events arriving out of order, implement a windowed aggregation with an explicit watermark policy and test both on-time and late event handling.
6. **External practice sets**: search for "data engineering interview questions" and "ETL design interview questions" on major interview-prep sites for additional scenario-style practice; treat any specific tool-version trivia you find there as secondary to the design-principle reasoning this page emphasizes.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Sources
        S1[Application databases]
        S2[Third-party APIs]
        S3[Event streams]
    end

    subgraph Ingestion["Ingestion / Extraction"]
        I1[Incremental extractors\\nwatermark-based]
    end

    subgraph Raw["Raw / Landing Storage"]
        R1[(Raw tables / object storage)]
    end

    subgraph Transform["Transformation Layer"]
        T1["SQL models (ELT)"]
        T2["Spark jobs (heavy transforms)"]
    end

    subgraph Quality["Data Quality Gate"]
        Q1{Validation checks}
    end

    subgraph Curated["Curated Storage"]
        C1[(Validated warehouse tables)]
    end

    subgraph Destinations["Specialized Destinations"]
        D1[Feature Store]
        D2[BI dashboards]
    end

    subgraph CrossCutting["Cross-Cutting Concerns"]
        O1[Orchestration: Airflow\\nschedule / dependencies / retries]
        M1[Observability: freshness,\\nvolume, distribution, lineage]
    end

    S1 --> I1
    S2 --> I1
    S3 --> I1
    I1 --> R1
    R1 --> T1
    R1 --> T2
    T1 --> Q1
    T2 --> Q1
    Q1 -- pass --> C1
    Q1 -- fail --> AL[Alert / quarantine]
    C1 --> D1
    C1 --> D2

    O1 -.governs.-> I1
    O1 -.governs.-> T1
    O1 -.governs.-> T2
    O1 -.governs.-> Q1
    M1 -.observes.-> I1
    M1 -.observes.-> C1
    M1 -.observes.-> D1
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Data Pipelines))
    Patterns
      ETL vs ELT
      Batch vs Streaming
      Orchestration vs Processing
    Core Principles
      Idempotency
        Upsert by natural key
        Partition overwrite
        At-least-once + idempotent = practical exactly-once
      Data Quality
        Validation as a stage
        Halt vs quarantine
        Null rate / range / schema checks
      Schema Evolution
        Fail loudly
        Versioned migration
        Schema-on-read
      Backfilling
        Reprocess historical range
        Requires idempotent load
        Test before urgently needed
      Decoupling
        Persisted intermediate state
        Limits failure blast radius
    Internals
      Trigger and dependency resolution
      Extract - Stage - Transform - Validate - Load
      Bookkeeping and lineage
    Production
      Observability
        Freshness
        Volume
        Distribution
        Lineage
      Security
        Credential scoping
        Log hygiene
        Access boundaries
      Deployment
        Containerized tasks
        Secrets at runtime
    Ecosystem
      Airflow - orchestration
      Spark - processing engine
      Feature Stores - ML destination
      Kafka - streaming transport
      PostgreSQL - common source/destination
      MLOps - broader lifecycle
      AI Monitoring - model-side observability
~~~
`,
};

export default dataPipelines;
