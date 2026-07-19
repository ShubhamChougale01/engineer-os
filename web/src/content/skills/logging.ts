import type { SkillContent } from "../types";

/**
 * Logging — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const logging: SkillContent = {
  overview: `
Logging is the practice of recording discrete events that occur during a program's execution — errors, warnings, significant state changes, request lifecycles — as a durable, searchable record that engineers can later inspect to understand what actually happened in a running system. Logging is the oldest and most universally-applied of the three pillars of observability (logging, **Metrics**, and **Tracing**, all covered alongside this skill), and remains foundational: even the most sophisticated metrics dashboards and distributed traces ultimately need logs to answer "what exactly happened, in detail, at this specific moment" when an aggregate signal indicates something went wrong.

For an AI engineer, logging is the first and most immediate tool for debugging any production issue — a failed LLM API call, an unexpected model output, a request that timed out — and structured logging specifically (covered in depth on this page) is what makes logs genuinely queryable and useful at scale, rather than an unsearchable wall of text. Logging also directly underlies this platform's **Agent Observability** skill, since debugging why an AI agent made a specific decision fundamentally requires detailed, structured logs of its reasoning steps and tool calls.

Key characteristics: **structured logging**, emitting logs as machine-parseable data (typically JSON) rather than free-form text, enabling reliable searching, filtering, and aggregation; **log levels** (DEBUG, INFO, WARN, ERROR, CRITICAL), categorizing events by severity to enable appropriate filtering and alerting; **log aggregation**, centralizing logs from many distributed services/instances into one searchable system rather than requiring engineers to SSH into individual machines; **correlation IDs**, threading a unique identifier through a request's entire lifecycle so all related log lines across multiple services can be tied together; and **log retention and sampling**, managing the genuine cost and volume tradeoffs of storing every log line indefinitely at scale.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 1970s–1980s | Early Unix systems establish **syslog** as a standard logging facility, providing a common protocol and severity-level convention (still referenced today) for system and application logging |
| 1980s–1990s | Application-level logging becomes standard practice across most programming languages, typically writing free-form text lines to local files, with each application/team inventing its own ad-hoc format |
| 2000s | As web applications scale across many servers, the limitation of local, per-machine text log files becomes acute — engineers increasingly need to search logs across MANY machines simultaneously, motivating early log aggregation tools |
| 2010 | **Splunk** and similar commercial log aggregation and search platforms mature, establishing centralized log search as standard enterprise practice |
| 2010 | The **ELK stack** (Elasticsearch, Logstash, Kibana) emerges as a widely-adopted, open-source alternative for log aggregation, search, and visualization, significantly broadening access to centralized logging beyond well-funded enterprises |
| 2013–2015 | **Structured logging** (emitting JSON rather than free-form text) gains widespread adoption specifically as microservices architectures make reliable, machine-parseable log correlation across many services genuinely necessary rather than merely convenient |
| 2019–2020s | **OpenTelemetry** (covered in its own skill) emerges to unify logging, metrics, and tracing under one vendor-neutral standard, addressing the fragmentation of having three separate, poorly-integrated observability signal types |

Logging's history reflects a consistent trajectory: from unstructured, per-machine text files toward structured, centrally-aggregated, and increasingly standardized (via OpenTelemetry) machine-parseable event streams — directly tracking the broader industry shift from monolithic, single-server applications toward distributed, microservices-based architectures that make ad-hoc, per-machine log inspection genuinely impractical.
`,

  "why-it-exists": `
Logging exists because engineers building and operating software have always needed a way to understand what a program actually DID after the fact — a running program's internal state and decision-making is otherwise invisible, and without some form of recorded trail, diagnosing why a specific request failed, why a specific calculation produced an unexpected result, or why a system behaved unexpectedly at 3 AM would require either reproducing the exact conditions live (often impossible) or guessing blindly.

The specific historical catalyst for STRUCTURED logging specifically (as opposed to earlier free-form text logging) was the industry's shift toward distributed, microservices-based architectures: when an application ran as a single process on a single machine, an engineer could reasonably tail a single log file and read through it manually. Once a single user request might touch a dozen different services running on many different machines, free-form text logs became genuinely impractical to correlate — there was no reliable way to programmatically extract "every log line related to THIS specific request" from a pile of unstructured text scattered across many machines' local files, each potentially formatted slightly differently by whichever engineer wrote that particular log statement.

Structured logging (emitting JSON with consistent, well-defined fields — a timestamp, a severity level, a correlation ID, a message, and relevant context) directly solves this: because every log line is machine-parseable data with consistent field names, a centralized log aggregation system can reliably filter, search, and correlate logs across an arbitrary number of services and machines — transforming logging from "a pile of text an engineer might manually grep through" into "a genuinely queryable database of what happened across an entire distributed system."
`,

  "problem-it-solves": `
Logging solves the **"how do we record what a program actually did, in enough detail to diagnose problems after the fact, in a way that remains genuinely usable and searchable even as a system scales across many services and machines"** problem.

Concretely, logging provides:

- **A durable record of program execution** that persists beyond the moment an event occurred, letting engineers investigate an issue hours, days, or weeks after it happened, rather than needing to observe it live.
- **Severity-based filtering via log levels**, letting engineers focus on ERROR-level events during an incident while retaining DEBUG-level detail available for deeper investigation when needed, without every log statement demanding equal attention.
- **Reliable cross-service correlation via structured fields and correlation IDs**, letting a single request's complete journey across many microservices be reconstructed from centrally-aggregated logs, even when that request touched a dozen different systems.
- **Centralized search and aggregation** (via tools like Elasticsearch or a managed logging platform) letting engineers search across the logs of an entire distributed system's worth of services from one interface, rather than needing to access individual machines directly.

What logging does **not** solve, or solves with a real tradeoff: logging alone doesn't provide efficient AGGREGATE performance signals the way **Metrics** does (counting how many requests failed is expensive and awkward if you have to parse it out of log lines, versus a purpose-built counter metric); logging alone doesn't show the detailed TIMING breakdown of a request's journey across services the way **Tracing** does (though structured logs with timestamps can approximate this with more effort); and logging introduces genuine cost and volume tradeoffs at scale — logging every possible detail for every request can become prohibitively expensive to store and search, requiring deliberate sampling, retention, and level-based filtering decisions.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the difference between structured and unstructured logging and why structured logging is the modern production standard.
2. Apply log levels (DEBUG, INFO, WARN, ERROR, CRITICAL) correctly and consistently across an application.
3. Design and implement correlation IDs for tracing a single request's logs across multiple services.
4. Explain log aggregation architecture and the role of tools like the ELK stack in centralizing distributed logs.
5. Design appropriate log retention and sampling strategies balancing cost, compliance, and debugging utility.
6. Recognize and avoid common logging anti-patterns: logging sensitive data, excessive/insufficient logging, and unstructured free-text logs at scale.
7. Write effective, actionable log messages that provide genuine diagnostic value during an incident.
8. Understand logging's relationship to metrics and tracing as one of the three complementary pillars of observability.
9. Answer senior-level interview questions on logging architecture, correlation strategy, and production debugging technique.
`,

  prerequisites: `
- **Required**: basic programming fundamentals in any language.
- **Very helpful**: the **Linux** skill for understanding how logs are typically written to and managed on production servers (log rotation, syslog).
- **Very helpful**: the **Distributed Systems** skill for understanding why cross-service correlation becomes genuinely necessary at scale.

Dependency links: this page → **Metrics** and **Tracing** (covered alongside this skill) for the complementary observability pillars → **Prometheus**/**Grafana** for metrics-specific tooling → **OpenTelemetry** for the unifying standard across all three signal types.
`,

  "beginner-concepts": `
### Unstructured versus structured logging

~~~
# Unstructured (free-form text) -- hard to reliably parse/search
2026-01-15 10:23:45 User 12345 failed to login: invalid password

# Structured (JSON) -- machine-parseable, reliably searchable/filterable
{"timestamp": "2026-01-15T10:23:45Z", "level": "WARN", "event": "login_failed", "user_id": 12345, "reason": "invalid_password"}
~~~

Structured logging emits consistent, well-defined fields (as JSON, typically) rather than a free-form sentence — this lets a log aggregation system reliably filter ("show me all login_failed events for user_id 12345") without needing fragile text pattern matching against inconsistently-worded messages.

### Log levels and when to use each

~~~
DEBUG:    detailed diagnostic information, useful during development
          or deep investigation, too verbose for normal production use
INFO:     normal, expected operational events (a request completed,
          a scheduled job started)
WARN:     something unexpected happened but the system recovered or
          continues functioning (a retry succeeded after an initial failure)
ERROR:    something failed and requires attention, though the overall
          system may still be functioning (a single request failed)
CRITICAL: a severe failure threatening overall system function
          (a database connection pool is exhausted)
~~~

Using log levels consistently lets engineers filter to just ERROR/CRITICAL during an active incident (reducing noise) while retaining DEBUG-level detail available (typically at higher storage cost) for deeper investigation when genuinely needed.

### A basic structured logging example

~~~python
import logging
import json

logger = logging.getLogger("app")

def log_event(level, event, **fields):
    logger.log(level, json.dumps({"event": event, **fields}))

log_event(logging.INFO, "user_login", user_id=12345, ip_address="203.0.113.5")
log_event(logging.ERROR, "payment_failed", order_id=98765, error="card_declined")
~~~

### Basic correlation IDs

~~~python
import uuid

def handle_request(request):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    log_event(logging.INFO, "request_started", correlation_id=correlation_id, path=request.path)
    -- pass correlation_id along to any downstream service calls this request makes
    result = call_downstream_service(request, correlation_id=correlation_id)
    log_event(logging.INFO, "request_completed", correlation_id=correlation_id)
    return result
~~~

A correlation ID is a unique identifier generated (or received from an upstream caller) at the start of a request and threaded through every subsequent log statement and downstream service call related to that request — letting all logs for one specific request be reliably found and reconstructed later, even across many different services.
`,

  "intermediate-concepts": `
### Log aggregation architecture (the ELK stack pattern)

~~~mermaid
flowchart LR
    App1["Service A logs"] --> Shipper["Log shipper\n(Filebeat, Fluentd)"]
    App2["Service B logs"] --> Shipper
    App3["Service C logs"] --> Shipper
    Shipper --> Storage["Elasticsearch\n(searchable storage)"]
    Storage --> UI["Kibana\n(search + visualization UI)"]
~~~

Log aggregation centralizes logs from many distributed services into one searchable system: a lightweight "shipper" process on each service collects local logs and forwards them to a central storage/indexing system, which a search/visualization UI then queries — this architecture is what makes "search across my ENTIRE distributed system's logs from one place" practical at scale.

### Effective log message design

~~~python
# WEAK — vague, lacks actionable context
log_event(logging.ERROR, "error occurred")

# STRONG — specific, includes exactly the context needed to diagnose
log_event(logging.ERROR, "payment_gateway_timeout",
          order_id=98765, gateway="stripe", timeout_ms=5000,
          retry_attempt=3, correlation_id=correlation_id)
~~~

An effective log message includes enough SPECIFIC, structured context to diagnose the issue without needing to reproduce it — a vague "error occurred" message provides essentially no diagnostic value, while a message with specific identifiers, the failing component, and relevant parameters gives an on-call engineer a genuine head start.

### Log sampling for high-volume events

~~~python
import random

def log_high_volume_event(event, sample_rate=0.01, **fields):
    -- only log 1% of these high-frequency events, keeping storage
    -- costs manageable while still retaining a representative sample
    if random.random() < sample_rate:
        log_event(logging.INFO, event, sampled=True, **fields)
~~~

For genuinely high-volume, low-diagnostic-value events (routine successful health checks, for instance), sampling (logging only a fraction of occurrences) manages storage cost while still retaining enough signal to detect genuine anomalies — a direct tradeoff between completeness and cost that must be applied deliberately, not uniformly across all log types.

### Log retention policy design

~~~
DEBUG logs:    short retention (hours to days) -- high volume, low
    long-term value, primarily useful for immediate investigation
INFO logs:      moderate retention (days to weeks) -- useful for
    trend analysis and moderate-term investigation
ERROR/CRITICAL: longer retention (weeks to months) -- lower volume,
    higher diagnostic and compliance value
Audit logs:      often LEGALLY MANDATED retention (months to years)
    for compliance -- covered further in Security
~~~

Retention policy should be tiered by log level and genuine business/compliance need, rather than either deleting everything quickly (losing diagnostic value) or retaining everything indefinitely (incurring unnecessary storage cost).

### Contextual logging with request-scoped fields

~~~python
import contextvars

request_context = contextvars.ContextVar("request_context", default={})

def with_context(**fields):
    current = request_context.get()
    request_context.set({**current, **fields})

def log_with_context(level, event, **fields):
    log_event(level, event, **request_context.get(), **fields)
~~~

Context-aware logging automatically attaches request-scoped fields (a correlation ID, a user ID) to every log statement within that request's handling, without requiring every individual log call to manually pass those fields explicitly each time.
`,

  "advanced-concepts": `
### Log-based metrics extraction versus native metrics

~~~
Extracting metrics FROM logs (parsing log lines to count error
rates, for instance) is possible but genuinely inefficient at
scale -- it requires processing every log line to derive an
aggregate number that a PURPOSE-BUILT metric (covered in the
Metrics skill) could track directly and far more cheaply,
without needing to store and later parse the full log text at all.
~~~

A senior engineer recognizes when a need is genuinely a LOGGING concern (detailed, per-event diagnostic information) versus a METRICS concern (efficient, aggregate numerical tracking) — using logs to derive what should genuinely be a purpose-built counter or histogram metric is a common, costly anti-pattern covered further in Anti-Patterns.

### Distributed tracing context propagation through logs

~~~python
# Structured logs commonly include trace/span IDs (covered in depth
# in the Tracing skill) alongside the correlation ID, letting logs
# be cross-referenced directly with distributed trace data
log_event(logging.INFO, "db_query_executed",
          trace_id="abc123", span_id="def456",
          query="SELECT * FROM orders", duration_ms=45)
~~~

Modern observability practice increasingly links logs directly to distributed traces (via shared trace/span IDs, standardized by OpenTelemetry, covered in its own skill) — letting an engineer jump from a specific span in a trace directly to the exact log lines emitted during that span's execution, unifying what were historically three separate, disconnected observability signals.

### Log parsing and schema evolution

~~~
As an application evolves, the FIELDS present in structured
logs inevitably change (new fields added, old ones removed or
renamed) -- a log aggregation/search system needs to handle
this schema evolution gracefully (commonly via a flexible,
schema-on-read approach like Elasticsearch's, rather than a
rigid, upfront schema requiring migration for every log format change).
~~~

### Audit logging as a distinct, compliance-driven logging category

~~~python
def log_audit_event(actor, action, resource, outcome):
    -- audit logs have DIFFERENT requirements than diagnostic logs:
    -- immutability, long retention, and specific regulatory format
    -- requirements (who did what, to what, when, with what outcome)
    audit_logger.info(json.dumps({
        "timestamp": datetime.utcnow().isoformat(),
        "actor": actor, "action": action,
        "resource": resource, "outcome": outcome,
    }))
~~~

Audit logs (recording security-relevant actions — who accessed what, who changed what permission) are a genuinely distinct logging category from diagnostic/debugging logs, typically requiring immutability guarantees, much longer retention (often legally mandated), and a specific, consistent format satisfying regulatory or compliance requirements — a senior engineer designs audit logging as a deliberate, separate concern from ordinary application logging.

### Cost management at genuine log-volume scale

~~~
At sufficient scale, log storage/search infrastructure costs
can become a genuinely significant line item -- common
mitigations include: tiered storage (recent logs in fast,
expensive storage; older logs in cheap, slower archival storage),
aggressive sampling of high-volume, low-value events, and
log level tuning (reducing DEBUG-level verbosity in production
by default, enabling it selectively/temporarily during active investigation).
~~~
`,

  "internal-working": `
What happens internally as an application emits a log line and it flows through a typical centralized logging pipeline:

~~~mermaid
sequenceDiagram
    participant App as Application code
    participant Logger as Logging library
    participant LocalFile as Local log file/stdout
    participant Shipper as Log shipper (Filebeat/Fluentd)
    participant Storage as Centralized storage (Elasticsearch)
    participant UI as Search UI (Kibana)

    App->>Logger: logger.error("payment_failed", order_id=123)
    Logger->>Logger: format as structured JSON,\nattach timestamp/level/context
    Logger->>LocalFile: write to local file or stdout
    Shipper->>LocalFile: continuously tail new log lines
    Shipper->>Storage: forward and index each new log entry
    Note over Storage: Indexed for fast search across\nfields (order_id, level, timestamp, etc.)
    UI->>Storage: query: "order_id:123 AND level:ERROR"
    Storage-->>UI: matching log entries returned
~~~

1. **The application writes structured log lines locally** (to a file or standard output), completely decoupled from however those logs will eventually be aggregated centrally — the application itself doesn't need to know about the aggregation infrastructure at all.
2. **A log shipper process continuously tails and forwards new log lines** to centralized storage, typically running as a lightweight sidecar or agent on each machine/container.
3. **Centralized storage indexes incoming logs** by their structured fields, enabling fast, flexible search across an entire distributed system's logs from one query interface.

**Why this matters**: understanding that the application's responsibility ENDS at writing well-structured local logs, with a separate shipping/aggregation layer handling the rest, is the key architectural insight explaining why structured logging (consistent, well-defined fields) matters so much — the aggregation and search layer's usefulness depends entirely on the QUALITY and CONSISTENCY of the structured data the application actually emits.
`,

  architecture: `
A senior engineer thinks about logging architecture across several dimensions: designing consistent structured logging conventions across an entire codebase/organization, choosing appropriate retention/sampling strategies balancing cost against diagnostic value, and recognizing when a logging need is actually better served by metrics or tracing instead.

### The three-pillars decision framework

~~~mermaid
flowchart TB
    Q1{"What do you actually\nneed to know?"}
    Q1 -->|"Detailed, per-event\ndiagnostic context"| Logging["Use LOGGING\n(this skill)"]
    Q1 -->|"An efficient, aggregate\nnumerical signal over time\n(rate, count, distribution)"| Metrics["Use METRICS\n(see the Metrics skill)"]
    Q1 -->|"The detailed timing\nbreakdown of a request's\njourney across services"| Tracing["Use TRACING\n(see the Tracing skill)"]
~~~

This framework — recognizing which of the three observability pillars actually fits a given diagnostic need — prevents the common anti-pattern of trying to extract metrics-shaped or tracing-shaped information inefficiently from raw logs.

### Designing organization-wide structured logging conventions

~~~mermaid
flowchart LR
    Standard["A shared, documented\nlogging schema/library"] --> Consistency["Every service emits\nlogs with consistent field\nnames and conventions"]
    Consistency --> Searchability["Reliable cross-service\nsearch and correlation"]
~~~

A senior engineer establishes (or advocates for) organization-wide structured logging conventions — consistent field names (correlation_id, not sometimes request_id and sometimes trace_id), consistent severity level usage, and a shared logging library — since inconsistency across different teams/services directly undermines the aggregation layer's ability to reliably correlate and search logs.

### Cost-aware retention and sampling strategy

~~~mermaid
flowchart TB
    LogVolume["Total log volume\nat production scale"] --> Tiering{"Tier by log level\nand genuine business value"}
    Tiering --> HighValue["ERROR/CRITICAL, audit logs:\nlonger retention, full fidelity"]
    Tiering --> LowValue["High-volume DEBUG/routine INFO:\naggressive sampling, short retention"]
~~~

Designing a deliberate, tiered retention and sampling strategy (rather than either logging everything indefinitely or aggressively deleting everything quickly) is essential for managing genuine cost at production scale while preserving the diagnostic value that actually matters.
`,

  "data-flow": `
Tracing a single user request's logs across three microservices, correlated via a shared correlation ID:

~~~mermaid
sequenceDiagram
    participant Client
    participant Gateway as API Gateway
    participant OrderService as Order Service
    participant PaymentService as Payment Service
    participant LogAgg as Centralized log aggregation

    Client->>Gateway: POST /orders
    Gateway->>Gateway: generate correlation_id = "abc-123"
    Gateway->>LogAgg: log {event: request_received, correlation_id: abc-123}
    Gateway->>OrderService: forward request WITH correlation_id header
    OrderService->>LogAgg: log {event: order_created, correlation_id: abc-123, order_id: 456}
    OrderService->>PaymentService: charge payment WITH correlation_id header
    PaymentService->>LogAgg: log {event: payment_charged, correlation_id: abc-123, order_id: 456}
    PaymentService-->>OrderService: success
    OrderService-->>Gateway: success
    Gateway-->>Client: 201 Created
~~~

The critical detail: even though this single logical request touched THREE separate services, all its related log lines share the SAME correlation_id field — letting an engineer later query the centralized log aggregation system for "correlation_id: abc-123" and instantly reconstruct this request's ENTIRE journey across every service it touched, in the correct order, without needing to manually cross-reference timestamps across separately-stored per-service log files.
`,

  "production-usage": `
### A production-style structured logging setup

~~~python
import logging
import json
import contextvars
from datetime import datetime

correlation_id_var = contextvars.ContextVar("correlation_id", default=None)

class StructuredFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "correlation_id": correlation_id_var.get(),
            "logger": record.name,
        }
        return json.dumps(log_entry)

handler = logging.StreamHandler()
handler.setFormatter(StructuredFormatter())
logger = logging.getLogger("app")
logger.addHandler(handler)
~~~

### Non-negotiables for production logging

1. **Use structured (JSON) logging consistently**, never free-form text, for anything beyond local development.
2. **Thread a correlation ID through every request**, propagated to every downstream service call.
3. **Never log sensitive data** (passwords, full credit card numbers, API keys) — covered further in Security.
4. **Apply appropriate log levels consistently**, enabling meaningful filtering during incidents.
5. **Design retention/sampling deliberately** based on log level and genuine business value, not a uniform default.

### Common production patterns

- **A shared, organization-wide logging library/convention** ensuring consistent structured fields across every service.
- **Centralized log aggregation** (ELK stack, or a managed service like Datadog/Splunk) as standard production infrastructure.
- **Correlation ID propagation via HTTP headers** (or equivalent) across service boundaries, a foundational microservices observability pattern.
- **Dashboards/alerts built atop log-derived signals** for specific, well-understood error patterns, while genuine aggregate metrics use purpose-built metrics infrastructure instead.
`,

  "industry-examples": `
- **The ELK stack** (Elasticsearch, Logstash, Kibana): the most widely-adopted open-source log aggregation and search platform, used extensively across the industry.
- **Splunk**: a long-standing, widely-used commercial log aggregation and analysis platform, particularly prevalent in enterprise and security-conscious environments.
- **Datadog, New Relic, and similar observability platforms**: unify logging alongside metrics and tracing in a single commercial product, directly reflecting the three-pillars-unification trend.
- **Every major cloud provider's native logging service** (AWS CloudWatch Logs, GCP Cloud Logging, Azure Monitor Logs): providing managed, centralized logging infrastructure integrated with each provider's broader ecosystem.
- **Kubernetes' own logging conventions**: containers typically write logs to stdout/stderr, with the container runtime and cluster-level log aggregation (Fluentd, commonly) handling collection — a widely-encountered, standard pattern in modern containerized deployments.
`,

  "best-practices": `
1. **Always use structured (JSON) logging** in production, never free-form text.
2. **Thread a correlation ID through every request**, propagated consistently across every service boundary.
3. **Apply log levels consistently and meaningfully** across an entire codebase, not ad-hoc per developer.
4. **Never log sensitive data** — passwords, full credit card numbers, API keys, or other genuinely sensitive information.
5. **Write specific, actionable log messages** including the context needed to diagnose an issue without reproducing it.
6. **Design retention and sampling deliberately**, tiered by log level and genuine business/compliance value.
7. **Establish organization-wide logging conventions** (consistent field names, a shared logging library) rather than allowing per-team inconsistency.
8. **Recognize when a need is genuinely a metrics or tracing concern** rather than trying to extract that information inefficiently from logs.
9. **Handle audit logging as a distinct category** from diagnostic logging, with its own immutability and retention requirements.
10. **Test that logging doesn't itself become a performance bottleneck** — excessive synchronous logging can meaningfully slow down request handling at high throughput.
`,

  "anti-patterns": `
### Logging sensitive data

~~~python
# WRONG — logging a password or full credit card number directly
log_event(logging.INFO, "login_attempt", username="alice", password="hunter2")
log_event(logging.INFO, "payment", card_number="4111111111111111")

# RIGHT — never log sensitive data at all, or mask/redact it deliberately
log_event(logging.INFO, "login_attempt", username="alice")
log_event(logging.INFO, "payment", card_last_four="1111")
~~~

Logging sensitive data (passwords, full card numbers, API keys, personal health information) is a genuine, serious security and compliance vulnerability — logs are often retained for extended periods, accessed by many engineers, and sometimes shipped to third-party aggregation services, making them a poor place for sensitive data to ever appear.

### Extracting metrics-shaped information from logs inefficiently

~~~python
# WRONG — trying to derive an error rate by parsing/counting log lines,
# an expensive, awkward way to get what should be a purpose-built metric
def calculate_error_rate_from_logs():
    error_count = count_log_lines_matching(level="ERROR")   -- expensive, slow
    total_count = count_log_lines_matching(level="INFO", event="request_completed")
    return error_count / total_count

# RIGHT — use a purpose-built counter metric instead (see the Metrics skill)
request_counter.labels(status="error").inc()
~~~

Using logs to derive what should genuinely be a purpose-built aggregate metric is inefficient at scale and represents a common confusion between logging's actual strength (detailed, per-event diagnostic context) and metrics' actual strength (efficient, aggregate numerical tracking).

### Other production-grade anti-patterns

- **Unstructured, free-form text logging** in production, making reliable search/correlation across services genuinely impractical.
- **Inconsistent field naming across services** (request_id in one service, correlation_id in another), undermining cross-service correlation.
- **Logging everything at DEBUG level in production by default**, incurring unnecessary storage cost and noise without a corresponding genuine benefit.
- **Vague, non-actionable log messages** ("error occurred," "something went wrong") providing little genuine diagnostic value.
- **No retention/sampling strategy at all**, either accumulating unbounded storage cost or losing valuable historical data through ad-hoc, inconsistent deletion.
`,

  performance: `
### Rule zero: logging itself must not become a performance bottleneck

Synchronous, blocking log writes on a hot request path can meaningfully degrade application throughput at scale — logging infrastructure design must account for this.

### The performance hierarchy (apply in order)

1. **Use asynchronous/buffered logging** where the application writes to an in-memory buffer that's flushed to disk/network separately, avoiding blocking the request path on every individual log write.
2. **Apply sampling for high-volume, low-diagnostic-value events**, reducing both storage cost and the write-path overhead of logging every single occurrence.
3. **Avoid excessive DEBUG-level logging in production by default**, enabling it selectively/temporarily during active investigation rather than continuously.
4. **Batch log shipping** (sending accumulated log lines in batches rather than one network call per line) to reduce network overhead in the aggregation pipeline.
5. **Profile logging overhead specifically** in genuinely high-throughput, latency-sensitive code paths, since even efficient logging has some non-zero cost.

### Micro-level facts worth knowing

- JSON serialization for structured logging has real, measurable CPU cost, though generally negligible relative to typical request-handling work except in extremely high-throughput scenarios.
- Log shipping infrastructure (Filebeat, Fluentd) is designed to be lightweight and asynchronous specifically to minimize impact on the application it's collecting logs from.
- Excessive logging volume can itself become a genuine bottleneck in the AGGREGATION layer (Elasticsearch indexing load), not just the application emitting the logs.
`,

  scalability: `
Logging's scalability concern centers on managing genuinely growing log VOLUME as a system scales (more services, more instances, more requests) without either losing diagnostic value or incurring unsustainable storage/processing cost.

### Why log volume scales faster than you might expect

~~~mermaid
flowchart LR
    MoreServices["More microservices"] --> MoreLogSources["More independent\nlog-emitting sources"]
    MoreInstances["More instances per service\n(horizontal scaling)"] --> MoreLogVolume["Log volume scales\nWITH instance count,\nnot just request count"]
~~~

As a system scales out (more services, more instances per service), total log volume grows along multiple dimensions simultaneously — not just with request volume, but with the sheer number of independently-logging components, making deliberate retention/sampling strategy increasingly important as a system grows.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Log aggregation storage/indexing cost growing unsustainably | Tiered retention (recent logs in fast storage, older logs archived cheaply), aggressive sampling of low-value high-volume events |
| Log shipping overwhelming the aggregation pipeline | Batch shipping, backpressure-aware shippers, horizontal scaling of the aggregation infrastructure itself |
| Search queries becoming slow across a very large log volume | Appropriate indexing strategy, time-range-scoped queries, tiered storage keeping "hot" recent data in faster-to-query storage |
| Inconsistent logging across many independently-developed services | Organization-wide structured logging conventions and a shared logging library |
`,

  security: `
### Sensitive data exposure through logs

~~~
Logs are frequently retained for extended periods, accessed by
many engineers (sometimes including third-party support staff
for a managed logging service), and occasionally shipped to
external log aggregation vendors -- making them a genuinely poor
place for sensitive data (passwords, full payment card numbers,
API keys, personal health/identity information) to EVER appear,
even transiently.
~~~

### Audit logging for security compliance

~~~python
def log_audit_event(actor, action, resource, outcome, ip_address):
    audit_logger.info(json.dumps({
        "timestamp": datetime.utcnow().isoformat(),
        "actor": actor, "action": action, "resource": resource,
        "outcome": outcome, "ip_address": ip_address,
    }))

log_audit_event("admin_user_42", "modify_permission", "user_123", "success", "203.0.113.5")
~~~

Audit logs (recording who did what, to what, when, with what outcome) are often a genuine regulatory/compliance requirement (SOC 2, HIPAA, and similar frameworks), requiring immutability, long retention, and specific fields — a distinct logging category from ordinary diagnostic logging.

### Essential logging security practices

1. **Never log sensitive data** — implement automated scanning/linting to catch accidental logging of known-sensitive field patterns (passwords, card numbers).
2. **Apply access controls to centralized log storage/search systems**, since logs frequently contain enough information to be sensitive in aggregate even without directly logging secrets.
3. **Implement audit logging as a distinct, immutable, appropriately-retained category** for compliance-relevant actions.
4. **Encrypt logs in transit and at rest**, particularly for logs shipped to third-party aggregation services.
5. **Apply data retention policies that satisfy both compliance requirements AND privacy regulations** (some jurisdictions require data deletion after a certain period, creating a genuine tension with audit retention requirements that must be carefully reconciled).

See the **OWASP Top 10** and **Secrets Management** skills for the broader security context this connects to.
`,

  testing: `
### Testing structured log output

~~~python
import json

def test_log_event_produces_valid_structured_json(caplog):
    log_event(logging.INFO, "test_event", user_id=123)
    log_line = caplog.records[0].message
    parsed = json.loads(log_line)   -- verify it's genuinely valid JSON
    assert parsed["event"] == "test_event"
    assert parsed["user_id"] == 123

def test_correlation_id_propagates_across_calls(caplog):
    handle_request(mock_request_with_correlation_id("abc-123"))
    correlation_ids = [json.loads(r.message).get("correlation_id") for r in caplog.records]
    assert all(cid == "abc-123" for cid in correlation_ids)   -- EVERY log line shares the same ID
~~~

### Testing that sensitive data is never logged

~~~python
def test_login_does_not_log_password(caplog):
    attempt_login(username="alice", password="secret123")
    for record in caplog.records:
        assert "secret123" not in record.message   -- the password must NEVER appear in logs
~~~

### The senior testing doctrine

- Test that log output is genuinely valid, parseable structured data (JSON), not just that some text was written.
- Test correlation ID propagation explicitly across a multi-step or multi-service request flow.
- Test explicitly that sensitive data never appears in log output, treating this as a genuine security test, not an afterthought.
- Test log level filtering behavior, confirming DEBUG-level logs are correctly suppressed in a production-configured logger.
`,

  debugging: `
### The toolbox, in escalation order

1. **Start with the centralized log search interface** (Kibana, or your organization's equivalent) filtering by correlation ID, time range, and severity level, rather than attempting to access individual machines directly.
2. **Reconstruct a request's full journey via correlation ID** across every service it touched, examining the chronological sequence of log events.
3. **Check for missing correlation ID propagation** if a request's logs seem incomplete across services, a common integration bug when a new service is added without correctly forwarding the correlation header.
4. **Verify log level configuration** if expected DEBUG-level detail is missing in production, confirming whether it was suppressed by the configured minimum level.

### Debugging common logging-specific symptoms

- "I can't find logs for a specific failed request" — verify correlation ID propagation is correctly implemented across every service the request touched; a missing propagation step commonly breaks the chain at exactly one hop.
- "Log search is slow" — check the query's time range scope (searching an unnecessarily wide time window) and whether appropriate indexing exists for the searched fields.
- "Logs are inconsistent in format across services" — a signal of missing organization-wide structured logging conventions; establish and enforce a shared logging library/schema.
- "Sensitive data appeared in logs" — treat as a genuine security incident; identify and fix the specific logging statement, and consider whether already-shipped logs need remediation (redaction, deletion) given retention policies.
`,

  monitoring: `
### Key signals to track

- **Log volume over time**, catching unexpected spikes (a bug causing excessive logging) or drops (a logging pipeline failure) early.
- **Log aggregation pipeline health** (shipper lag, indexing latency), ensuring logs are actually reaching centralized storage in a timely manner.
- **Error/warning log rate**, as one signal (among several, alongside metrics) of overall system health.
- **Storage growth rate** for the log aggregation system, informing retention/sampling policy decisions.

### Tools

Log aggregation platforms (Elasticsearch/Kibana, Splunk, Datadog) provide built-in dashboards for log volume, ingestion rate, and search performance; standard infrastructure monitoring for the aggregation pipeline's own health (shipper and indexing service uptime/latency).

### Alerting priorities

Alert on log aggregation pipeline failures (logs not reaching centralized storage, a serious observability blind spot), on unexpected log volume spikes (often indicating a bug), and on a rising ERROR-level log rate (a general system-health signal, typically correlated with and confirmed by metrics-based alerting).
`,

  deployment: `
### Configuring logging for a containerized deployment

~~~yaml
# Kubernetes pods commonly write logs to stdout/stderr,
# with the cluster's log aggregation (Fluentd, commonly)
# handling collection automatically -- no application-level
# file management needed
containers:
  - name: app
    image: my-app:latest
    -- logs written to stdout are automatically captured
    -- by the container runtime and forwarded by the
    -- cluster's logging infrastructure
~~~

Modern containerized deployments typically have applications write logs to stdout/stderr rather than managing local log files directly, letting the container orchestration platform's own logging infrastructure handle collection and forwarding uniformly.

### CI/CD pipeline considerations

Automated tests verifying structured log output format and correlation ID propagation as part of CI, catching logging regressions before they reach production. See the **CI/CD** and **Kubernetes** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production logging setup is considered complete:

- [ ] Structured (JSON) logging used consistently, no free-form text logging in production
- [ ] Correlation IDs implemented and propagated correctly across every service boundary
- [ ] Log levels applied consistently and meaningfully across the codebase
- [ ] No sensitive data (passwords, full card numbers, API keys) ever logged, verified via automated scanning
- [ ] Centralized log aggregation configured and verified to be receiving logs from every service
- [ ] Retention and sampling policy designed deliberately, tiered by log level and business value
- [ ] Audit logging implemented as a distinct category for compliance-relevant actions, where applicable
- [ ] Organization-wide logging conventions documented and consistently applied
- [ ] Logging overhead profiled and confirmed not to meaningfully degrade application performance
- [ ] Access controls applied to centralized log storage/search systems
`,

  "common-mistakes": `
1. **Logging sensitive data** (passwords, full card numbers, API keys), a genuine security and compliance risk.
2. **Using unstructured, free-form text logging** in production, undermining reliable search and correlation.
3. **Missing correlation ID propagation** across service boundaries, breaking cross-service request reconstruction.
4. **Trying to extract metrics-shaped information from logs inefficiently**, rather than using purpose-built metrics infrastructure.
5. **Vague, non-actionable log messages** providing little genuine diagnostic value during an incident.
6. **Inconsistent field naming/conventions across different services**, undermining reliable cross-service search.
7. **No deliberate retention/sampling strategy**, either accumulating unsustainable storage cost or losing valuable diagnostic history.
8. **Logging everything at DEBUG level in production by default**, incurring unnecessary cost and noise.
9. **Not treating audit logging as a distinct category** from ordinary diagnostic logging, missing compliance requirements.
10. **Not testing that logging itself doesn't become a performance bottleneck** on genuinely high-throughput code paths.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Missing logs for part of a request's journey | Correlation ID not correctly propagated to a specific downstream service | Verify and fix correlation ID propagation across every service hop |
| Log search returns no results despite logs existing | Query time range too narrow, or field name mismatch (inconsistent naming across services) | Verify time range and exact field names used in the actual log entries |
| Logging pipeline falling behind (delayed log visibility) | Shipper or aggregation infrastructure overwhelmed by volume | Scale aggregation infrastructure, or apply sampling to reduce volume |
| Sensitive data found in logs | A specific logging statement accidentally including sensitive fields | Fix the specific statement; assess and remediate already-shipped logs given retention policy |
| Inconsistent log format across services | No shared, organization-wide logging convention/library enforced | Establish and adopt a shared structured logging library across teams |
| Excessive storage cost for log aggregation | No retention/sampling strategy, or overly generous retention applied uniformly | Design a tiered retention/sampling policy by log level and business value |
| Application performance degraded under logging load | Synchronous, blocking log writes on the hot request path | Switch to asynchronous/buffered logging |
`,

  faqs: `
**Why is structured logging (JSON) preferred over free-form text logging?**
Because structured logs with consistent, well-defined fields can be reliably searched, filtered, and correlated by a centralized aggregation system, while free-form text requires fragile pattern matching that breaks as soon as message wording varies even slightly across different log statements or services.

**What is a correlation ID, and why does it matter?**
A unique identifier generated at the start of a request and threaded through every subsequent log statement and downstream service call related to that request — it's what lets a single request's complete journey across many microservices be reconstructed from centralized logs.

**When should I use logging versus metrics versus tracing?**
Use logging for detailed, per-event diagnostic context; use metrics (covered in its own skill) for efficient, aggregate numerical signals over time (rates, counts, distributions); use tracing (covered in its own skill) for the detailed timing breakdown of a request's journey across services — each pillar serves a genuinely distinct diagnostic need.

**Should I log everything at DEBUG level in production?**
Generally no — excessive DEBUG-level logging in production incurs unnecessary storage cost and noise; a common pattern is running at INFO level or above by default, with the ability to selectively and temporarily enable DEBUG-level logging during active investigation of a specific issue.

**What should never appear in logs?**
Passwords, full credit card numbers, API keys/secrets, and other genuinely sensitive personal or security-relevant data — logs are often retained for extended periods, accessed by many engineers, and sometimes shipped to third-party services, making them a poor place for sensitive data to ever appear.

**What is audit logging, and how does it differ from ordinary application logging?**
Audit logs record security/compliance-relevant actions (who did what, to what, when, with what outcome), typically requiring immutability and longer, often legally-mandated retention — a distinct category from ordinary diagnostic/debugging logs, which are primarily concerned with troubleshooting rather than compliance.
`,

  "interview-questions": `
### Junior level

1. **What is the difference between structured and unstructured logging?**
   Model answer: structured logging emits consistent, well-defined fields (typically JSON), enabling reliable machine-parsing and search; unstructured logging is free-form text, which is harder to reliably search or correlate at scale.

2. **What are the standard log levels, and what does each represent?**
   Model answer: DEBUG (detailed diagnostic info), INFO (normal operational events), WARN (unexpected but recovered), ERROR (a failure requiring attention), CRITICAL (a severe failure threatening overall system function).

3. **What is a correlation ID?**
   Model answer: a unique identifier generated at the start of a request and passed along to every downstream service call and log statement related to that request, enabling all its related logs to be found and correlated together later.

4. **Why shouldn't you log passwords or credit card numbers?**
   Model answer: logs are often retained for extended periods, accessed by many engineers, and sometimes shipped to third-party services — making them a genuinely risky place for sensitive data to appear, creating real security and compliance exposure.

5. **What is log aggregation, and why is it needed?**
   Model answer: centralizing logs from many distributed services/machines into one searchable system, needed because manually accessing individual machines' local log files becomes impractical once an application scales across many services and instances.

### Senior level

6. **Why does structured logging become genuinely necessary (not just convenient) in a microservices architecture?**
   Model answer: with a single monolithic application, an engineer can reasonably tail one log file; once a request spans many independently-deployed services across many machines, reliably correlating all related log lines requires consistent, machine-parseable fields (particularly a shared correlation ID) — free-form text logs provide no reliable way to programmatically reconstruct a specific request's cross-service journey at that scale.

7. **How would you design a log retention and sampling strategy for a high-traffic production system?**
   Model answer: tier retention by log level and genuine business value — DEBUG logs get short retention given their high volume and primarily immediate diagnostic value; ERROR/CRITICAL logs get longer retention given their lower volume and higher diagnostic value; apply sampling (logging only a fraction) to genuinely high-volume, low-diagnostic-value events (routine successful health checks, for instance) to manage storage cost while retaining a representative signal; treat audit logs as a distinct category with potentially legally-mandated, much longer retention.

8. **When should information be extracted as a metric rather than derived from logs, and why does this distinction matter?**
   Model answer: metrics should be used for efficient, aggregate numerical tracking needed frequently and cheaply (an error rate, a request count) — deriving this by parsing and counting log lines is comparatively expensive and slow at scale, since it requires processing full log text to extract what a purpose-built counter metric (covered in the Metrics skill) tracks directly and efficiently; recognizing this distinction prevents both inefficient log-based metric extraction and, conversely, trying to cram detailed per-event diagnostic context into a metric's limited, aggregate-only model.

9. **Explain how correlation IDs and distributed trace IDs relate to each other, and why modern observability practice increasingly links them.**
   Model answer: a correlation ID is typically an application-level identifier threading a single logical request through logs across services; a trace ID (covered in the **Tracing** skill, standardized via OpenTelemetry) serves a similar correlating purpose but specifically for distributed tracing's span-based timing data — modern practice increasingly includes trace/span IDs directly within structured log entries, letting an engineer jump directly from a specific span in a distributed trace to the exact log lines emitted during that span's execution, unifying what were historically separate, disconnected observability signals into one coherent investigative workflow.

10. **What are the specific requirements that distinguish audit logging from ordinary diagnostic logging?**
    Model answer: audit logs typically require IMMUTABILITY (they cannot be altered or deleted by the actions they're recording, to preserve their evidentiary value), much LONGER retention (often legally mandated by regulatory frameworks like SOC 2 or HIPAA), and a specific, consistent format capturing who did what, to what resource, when, and with what outcome — ordinary diagnostic logs, by contrast, are primarily concerned with troubleshooting and typically have shorter retention and less rigid structural requirements.

11. **How would you diagnose a production issue where a specific customer's request seems to have disappeared partway through your microservices architecture?**
    Model answer: start by searching the centralized log aggregation system for that request's correlation ID, examining the chronological sequence of log events across every service — if the trail stops at a specific service (logs exist for earlier services but not for a later one the request should have reached), suspect either a correlation ID propagation bug at that specific hop (the header wasn't correctly forwarded) or an actual failure at that service that wasn't logged with sufficient detail; cross-reference with distributed tracing data (if available) to confirm whether the request actually reached that service at the network level, distinguishing a logging gap from a genuine service failure.

12. **Design a logging strategy for an AI application that needs to debug why an LLM-powered agent made a specific incorrect decision.**
    Model answer: implement structured logging capturing each step of the agent's reasoning process (the prompt sent, the model's raw response, any tool calls made and their results, and the final decision), all threaded together via a shared correlation ID for that specific agent invocation; given the potentially large size of prompts/responses, consider whether full content logging is needed by default or should be sampled/enabled selectively for investigation, balancing storage cost against the genuine diagnostic value of having complete reasoning traces available when debugging unexpected agent behavior — directly connecting to this platform's **Agent Observability** skill for the AI-specific depth this general logging strategy supports.
`,

  "coding-questions": `
### 1. Implement a structured logger with automatic correlation ID injection

~~~python
import logging
import json
import contextvars
from datetime import datetime

correlation_id_var = contextvars.ContextVar("correlation_id", default=None)

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)

    def _log(self, level, event, **fields):
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": logging.getLevelName(level),
            "event": event,
            "correlation_id": correlation_id_var.get(),
            **fields,
        }
        self.logger.log(level, json.dumps(entry))

    def info(self, event, **fields):
        self._log(logging.INFO, event, **fields)

    def error(self, event, **fields):
        self._log(logging.ERROR, event, **fields)
# Follow-up: why does using a contextvar (rather than a global
# variable or explicit function parameter) correctly handle
# correlation ID isolation when many requests are being processed
# concurrently (via threads or async tasks) within the same process?
~~~

### 2. Implement a sensitive-data-scanning log filter

~~~python
import re

SENSITIVE_PATTERNS = [
    re.compile(r"\\b\\d{16}\\b"),   -- naive credit-card-like pattern
    re.compile(r'"password"\\s*:\\s*"[^"]*"'),
]

def contains_sensitive_data(log_message):
    return any(pattern.search(log_message) for pattern in SENSITIVE_PATTERNS)

class SensitiveDataFilter(logging.Filter):
    def filter(self, record):
        if contains_sensitive_data(record.getMessage()):
            record.msg = "[REDACTED: potential sensitive data detected]"
        return True
# Follow-up: why is this pattern-based filter a useful SAFETY NET
# rather than a complete solution, and what disciplined engineering
# practice (covered in Best Practices) should be the PRIMARY defense
# against sensitive data ever reaching the logging call in the first place?
~~~

### 3. Implement log sampling with a minimum-guaranteed-rate for errors

~~~python
import random

def should_log(level, sample_rate=0.01):
    -- ALWAYS log errors/critical events at full rate;
    -- sample only lower-severity, high-volume events
    if level >= logging.ERROR:
        return True
    return random.random() < sample_rate

def log_event(level, event, **fields):
    if should_log(level):
        -- actual logging call here
        pass
# Follow-up: why is it important to NEVER sample ERROR/CRITICAL
# level events (always logging them at full rate), even when
# applying aggressive sampling to lower-severity events for cost
# management?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement structured logging with consistent fields
Build a small application implementing structured (JSON) logging with consistent field naming across at least three different log statements, then write a test verifying each produces genuinely valid, parseable JSON. Deliverable: a working structured logger with passing tests. Skills exercised: structured logging implementation.

### Lab 2 (Intermediate): Implement correlation ID propagation across simulated services
Build a small multi-service simulation (three functions representing separate services, calling each other) with correlation ID generation and propagation, verifying via log inspection that all three services' logs share the same correlation ID for a given request. Deliverable: a working correlation ID propagation demonstration with verification tests. Skills exercised: correlation ID design, cross-service log correlation.

### Lab 3 (Advanced): Set up a local ELK-stack-style log aggregation pipeline
Using Docker Compose, set up a minimal log aggregation pipeline (a log-generating application, a shipper, Elasticsearch, and Kibana), verify logs are correctly indexed and searchable via Kibana's interface. Deliverable: a working local log aggregation pipeline with a documented search query demonstrating correlation ID-based filtering. Skills exercised: log aggregation architecture, centralized search.

### Lab 4 (Production): Design and implement a tiered retention/sampling strategy
Given a simulated high-volume logging scenario (many routine INFO-level events, occasional ERROR events), implement a sampling strategy that aggressively samples routine events while always fully logging errors, and design a documented retention policy tiered by log level. Deliverable: a working sampling implementation with a written retention policy document. Skills exercised: sampling strategy design, retention policy design.
`,

  "real-projects": `
### 1. A structured logging library for an organization's microservices
Engineering requirements: a shared library enforcing consistent structured log fields (correlation ID, service name, timestamp format) across every team's services, with automatic sensitive-data-pattern scanning as a safety net, and straightforward integration with the organization's centralized log aggregation platform.

### 2. A compliance-grade audit logging system
Engineering requirements: an immutable, append-only audit log capturing every security-relevant action (permission changes, data access, administrative actions) with the specific fields required by relevant compliance frameworks (SOC 2, HIPAA, or similar), stored with retention meeting regulatory requirements and appropriately restricted access controls.

### 3. An AI agent debugging and observability logging layer
Engineering requirements: structured logging capturing each step of an AI agent's reasoning process (prompts, model responses, tool calls, decisions) correlated via a shared invocation ID, with deliberate sampling/retention decisions balancing the storage cost of potentially large prompt/response content against genuine debugging value — directly connecting to this platform's **Agent Observability** skill.
`,

  "case-studies": `
### The industry shift from per-machine log files to centralized aggregation
The broad industry transition from engineers manually SSHing into individual machines to read local log files toward centralized log aggregation platforms (the ELK stack, Splunk, and similar) directly tracked the industry's parallel shift toward distributed, microservices-based architectures — as the number of machines and services engineers needed to reason about grew, manual per-machine log inspection became genuinely impractical, driving the adoption of centralized tooling almost as a structural necessity rather than a mere convenience upgrade. Lesson: infrastructure practices that were perfectly adequate at one architectural scale (a handful of monolithic servers) can become genuinely untenable at a different scale (dozens or hundreds of microservice instances), requiring a qualitatively different tooling approach, not just a faster version of the old approach.

### Structured logging's rise alongside microservices adoption
The specific, well-documented industry shift toward structured (JSON) logging in the mid-2010s directly coincided with, and was substantially driven by, the concurrent rise of microservices architectures — free-form text logging, adequate for a single application, became a genuine correlation bottleneck once a single user request routinely spanned many independently-developed, independently-deployed services. Lesson: a technique's adoption timing often reveals its actual motivating driver — structured logging wasn't adopted because JSON is inherently superior in the abstract, but because a specific, concrete new architectural pattern (microservices) made unstructured logging's limitations genuinely, practically painful in a way they hadn't been before.

### OpenTelemetry's unification of logging, metrics, and tracing
OpenTelemetry's emergence specifically to unify what had historically been three separate, often poorly-integrated observability signal types (logs, metrics, traces, each frequently using different tools, vendors, and correlation mechanisms) into one standard, vendor-neutral framework reflects the industry's growing recognition that these three pillars are genuinely complementary facets of ONE underlying observability need, not three unrelated concerns — directly connecting to the **OpenTelemetry** skill's own deeper treatment of this unification. Lesson: as a discipline matures, previously-separate tools/standards addressing genuinely related concerns often converge toward unification, reducing the integration burden that fragmentation across separate, poorly-connected tools previously imposed on practitioners.
`,

  comparisons: `
| Aspect | Logging | Metrics | Tracing |
|--------|---------|---------|---------|
| Granularity | Per-event, detailed | Aggregate, numerical | Per-request, timing-focused |
| Storage cost at scale | Higher (full event detail) | Lower (pre-aggregated numbers) | Moderate (sampled, per-request) |
| Best fit | Detailed diagnostic investigation | Efficient trend/alerting signals | Cross-service request timing breakdown |
| Typical tools | ELK stack, Splunk | Prometheus, Grafana | Jaeger, Zipkin, OpenTelemetry |

**How seniors choose**: use logging for detailed, per-event diagnostic context needed during investigation; use metrics (covered in its own skill) for efficient, aggregate numerical signals suited to dashboards and alerting; use tracing (covered in its own skill) for understanding a specific request's detailed cross-service timing — recognizing all three as complementary, not competing, and increasingly unified under standards like OpenTelemetry rather than treated as entirely separate concerns.
`,

  "related-technologies": `
- **Metrics** and **Tracing** — the two complementary observability pillars covered alongside this skill, together forming the "three pillars of observability."
- **Prometheus** and **Grafana** — the dominant metrics-collection and visualization tools covered in their own skills.
- **OpenTelemetry** — the vendor-neutral standard unifying logging, metrics, and tracing under one framework, covered in its own skill.
- **Distributed Systems** — the architectural context (microservices, many independent services) that makes structured logging and correlation IDs genuinely necessary rather than merely convenient.
- **Agent Observability** — the AI-specific application of these logging principles to debugging AI agent reasoning and behavior.

Learning path: this page → **Metrics** → **Tracing** for the complementary pillars → **Prometheus**/**Grafana** for specific metrics tooling → **OpenTelemetry** for the unifying standard across all three.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Structured logging remains the standard production practice, with continued growth in adoption of OpenTelemetry's unified approach linking logs directly to distributed traces via shared trace/span IDs.
- Continued growth of managed, commercial observability platforms (Datadog, New Relic) unifying logging, metrics, and tracing in a single product, reducing the integration burden of assembling separate open-source tools.
- Growing application of structured logging principles specifically to AI agent observability, capturing detailed reasoning traces for debugging LLM-powered application behavior.
- Given the pace of change in the observability tooling ecosystem specifically, verify current best-practice recommendations and specific tool capabilities against current documentation.
`,

  "future-roadmap": `
Where logging is heading, and what's worth betting career time on:

- **Continued unification with metrics and tracing** under OpenTelemetry's standard framework, likely becoming the default expectation for new observability tooling and instrumentation.
- **Continued growth of AI-specific logging needs** (agent reasoning traces, LLM prompt/response logging) as a distinct, growing application area building directly on this page's foundational structured logging principles.
- **Growing sophistication in cost-aware retention/sampling tooling**, as log volume at genuine production scale continues to be a significant, ongoing cost consideration for organizations.
- **What to bet on**: deeply understanding structured logging's core principles (consistent fields, correlation IDs, appropriate log levels) and the three-pillars framework for choosing between logging, metrics, and tracing — these transfer directly across any specific tool or vendor's platform, a far more durable investment than familiarity with any single logging library's specific API.
`,

  "cheat-sheet": `
~~~json
// ---- Structured logging: consistent, machine-parseable fields ----
{"timestamp": "2026-01-15T10:23:45Z", "level": "ERROR", "event": "payment_failed",
 "correlation_id": "abc-123", "order_id": 456, "reason": "card_declined"}
~~~

~~~
# ---- Log levels: use consistently ----
DEBUG    -- detailed diagnostic info, too verbose for normal prod use
INFO     -- normal, expected operational events
WARN     -- unexpected but recovered/still functioning
ERROR    -- a failure requiring attention
CRITICAL -- severe failure threatening overall system function

# ---- Correlation ID: the key to cross-service debugging ----
# Generate ONE ID at request start, propagate it through EVERY
# downstream service call and log statement for that request.
~~~

~~~
# ---- The three pillars: pick the right one ----
Need detailed per-event diagnostic context   -> LOGGING (this skill)
Need an efficient aggregate numerical signal -> METRICS (see the Metrics skill)
Need a request's cross-service timing breakdown -> TRACING (see the Tracing skill)
# Don't extract metrics-shaped info from logs by parsing/counting -- use a real metric instead

# ---- NEVER log sensitive data ----
# Passwords, full card numbers, API keys/secrets -- NEVER, not even transiently
# Logs are retained long, accessed widely, sometimes shipped to third parties

# ---- Retention: tier by value, don't apply one policy to everything ----
DEBUG:            short retention, high volume, low long-term value
INFO:             moderate retention
ERROR/CRITICAL:   longer retention, lower volume, higher diagnostic value
Audit logs:        often LEGALLY MANDATED long retention + immutability

# ---- Sampling: NEVER sample errors, sample high-volume low-value events ----
if level >= ERROR: always_log()
else: log_if(random() < sample_rate)
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Structured vs unstructured logging? | Structured = consistent machine-parseable fields (JSON). Unstructured = free text, hard to reliably search. |
| What is a correlation ID for? | Threading ONE identifier through a request's ENTIRE cross-service journey for later reconstruction. |
| The five standard log levels? | DEBUG, INFO, WARN, ERROR, CRITICAL -- in increasing severity. |
| Why did structured logging become necessary? | Microservices made free-text cross-service log correlation genuinely impractical. |
| Logging vs metrics -- which for an aggregate error rate? | Metrics -- a purpose-built counter is far cheaper than parsing/counting log lines. |
| What should NEVER appear in logs? | Passwords, full card numbers, API keys/secrets -- logs are retained long and widely accessed. |
| What is audit logging? | A distinct category: who did what, to what, when -- immutable, often legally-mandated retention. |
| Why tier retention by log level? | DEBUG is high-volume/low-value (short retention); ERROR is low-volume/high-value (longer retention). |
| Should you ever sample ERROR-level logs? | No -- ALWAYS log errors at full rate; sample only high-volume, low-value events. |
| The three pillars of observability? | Logging, Metrics, Tracing -- each serves a distinct, complementary diagnostic need. |
| How does OpenTelemetry connect logs and traces? | Shared trace/span IDs embedded in structured logs link them directly. |
| App's logging responsibility ends where? | Writing well-structured local logs -- a separate shipper/aggregator handles the rest. |
`,

  mcqs: `
1. What is the primary advantage of structured (JSON) logging over free-form text logging?
   A) It uses less disk space  B) It enables reliable, machine-parseable search and filtering across consistent fields  C) It's faster to write  D) It doesn't require a logging library
   **Answer: B** — free-form text requires fragile pattern matching that breaks as message wording varies.

2. What is a correlation ID used for?
   A) Encrypting log data  B) Uniquely identifying a request so all its related log lines across multiple services can be found and correlated together  C) Compressing log files  D) Setting the log level
   **Answer: B** — essential for reconstructing a request's journey across a microservices architecture.

3. Why is it a bad practice to derive an aggregate error rate by parsing and counting log lines?
   A) Logs can't contain error information  B) It's comparatively expensive and slow at scale compared to a purpose-built counter metric  C) Logs are always encrypted  D) Error rates can't be calculated at all
   **Answer: B** — this is a common confusion between logging's strength (detail) and metrics' strength (efficient aggregation).

4. Why should passwords and full credit card numbers never appear in logs?
   A) They take up too much storage space  B) Logs are often retained long-term, accessed by many engineers, and sometimes shipped to third parties -- a genuine security/compliance risk  C) Logs can't store text data  D) It would slow down the application
   **Answer: B** — a serious, real security and compliance vulnerability class.

5. Why should ERROR and CRITICAL level logs never be sampled, even when applying aggressive sampling elsewhere?
   A) They are always small in volume anyway  B) Sampling them risks losing critical diagnostic signal exactly when it matters most  C) Sampling is illegal for error logs  D) There is no reason -- they should be sampled too
   **Answer: B** — high-severity events carry the highest diagnostic value and are typically lower-volume anyway.

6. What distinguishes audit logging from ordinary diagnostic logging?
   A) Audit logs use a different programming language  B) Audit logs typically require immutability and longer, often legally-mandated retention for compliance purposes  C) Audit logs are never structured  D) There is no real difference
   **Answer: B** — a genuinely distinct logging category driven by regulatory/compliance requirements.
`,

  "revision-notes": `
Logging is the practice of recording discrete events during a program's execution as a durable, searchable record — the oldest and most universally-applied of the three pillars of observability (alongside **Metrics** and **Tracing**). STRUCTURED LOGGING (emitting consistent, well-defined JSON fields rather than free-form text) is the modern production standard, specifically because it became genuinely NECESSARY (not just convenient) once microservices architectures made reliably correlating logs across many independently-deployed services impossible with unstructured text — a direct historical driver covered in this page's Case Studies.

LOG LEVELS (DEBUG, INFO, WARN, ERROR, CRITICAL) categorize events by severity, enabling meaningful filtering — DEBUG carries detailed diagnostic information too verbose for normal production use; INFO records normal operational events; WARN signals something unexpected that the system recovered from; ERROR signals a failure requiring attention; CRITICAL signals a severe failure threatening overall system function. A CORRELATION ID — a unique identifier generated at request start and threaded through every downstream service call and log statement for that request — is the essential mechanism letting a single logical request's complete journey across many microservices be reconstructed later from centrally-aggregated logs.

LOG AGGREGATION architectures (the ELK stack — Elasticsearch, Logstash/Fluentd, Kibana — being the dominant open-source pattern) centralize logs from many distributed services into one searchable system: a lightweight shipper on each machine forwards local logs to centralized, indexed storage, queried through a search UI — this architecture is what makes searching an entire distributed system's logs from one place practical at scale. The application's own responsibility ends at writing well-structured local logs; a separate shipping/aggregation layer handles the rest, which is precisely why STRUCTURED, CONSISTENT field naming across every service matters so much — the aggregation layer's usefulness depends entirely on the quality and consistency of what applications actually emit.

A critical, senior-level distinction is recognizing WHEN a diagnostic need is genuinely a logging concern versus a metrics or tracing concern: logging provides detailed, per-event context; metrics (covered in its own skill) provide efficient, aggregate numerical tracking (rates, counts); tracing (covered in its own skill) provides detailed cross-service timing breakdowns. Trying to extract metrics-shaped information (an error rate) by parsing and counting log lines is a common, genuinely inefficient anti-pattern — a purpose-built counter metric accomplishes the same thing far more cheaply at scale.

RETENTION AND SAMPLING must be designed deliberately, tiered by log level and genuine business value: DEBUG logs (high volume, low long-term value) get short retention; ERROR/CRITICAL logs (lower volume, higher diagnostic value) get longer retention; AUDIT LOGS (recording security/compliance-relevant actions — who did what, to what, when) are a genuinely distinct category, typically requiring IMMUTABILITY and much longer, often legally-mandated retention. Sampling (logging only a fraction of occurrences) manages storage cost for genuinely high-volume, low-diagnostic-value events, but ERROR/CRITICAL events should NEVER be sampled — always logged at full rate, since they carry the highest diagnostic value.

A genuinely important, non-negotiable security discipline: NEVER LOG SENSITIVE DATA (passwords, full credit card numbers, API keys, personal identity/health information) — logs are frequently retained long-term, accessed by many engineers, and sometimes shipped to third-party aggregation vendors, making them a poor place for sensitive data to ever appear, even transiently. Modern observability practice increasingly links logs directly to distributed traces via shared trace/span IDs (standardized through OpenTelemetry, covered in its own skill), letting an engineer jump directly from a specific span in a distributed trace to the exact log lines emitted during that span's execution — unifying what were historically three separate, poorly-integrated observability signals into one coherent investigative workflow. A senior engineer establishes organization-wide structured logging conventions (consistent field names, a shared logging library) rather than allowing per-team inconsistency, since inconsistency directly undermines the centralized aggregation layer's ability to reliably search and correlate logs across an entire distributed system.
`,

  "learning-roadmap": `
**Week 1 — Structured logging fundamentals**: JSON logging, log levels, and basic implementation. Milestone: build a structured logger producing consistent, valid JSON across multiple log statements (Lab 1).

**Week 2 — Correlation IDs and cross-service logging**: designing and propagating correlation IDs across simulated multi-service request flows. Milestone: build a working correlation ID propagation demonstration with verification tests (Lab 2).

**Week 3 — Log aggregation architecture**: setting up a local ELK-stack-style pipeline, understanding shipper/storage/search components. Milestone: complete a working local log aggregation pipeline with demonstrated search capability (Lab 3).

**Week 4 — Retention, sampling, and cost management**: designing tiered retention policies and sampling strategies balancing cost against diagnostic value. Milestone: implement a sampling strategy with a documented retention policy (Lab 4).

**Week 5 — Security and audit logging**: sensitive data scanning, and designing a distinct audit logging category with appropriate immutability/retention. Milestone: implement a sensitive-data-scanning filter and a basic audit logging system.

**Week 6 — Connecting to the broader observability landscape**: understanding when logging versus metrics versus tracing is the right tool, and how OpenTelemetry unifies all three. Milestone: for five hypothetical diagnostic scenarios, correctly justify which of the three observability pillars best fits each.

Next platform skill once this roadmap is complete: **Metrics** for the complementary aggregate-signal pillar, or **Tracing** for the complementary cross-service timing pillar.
`,

  "official-docs": `
- **Elastic's official documentation on the ELK stack** (elastic.co/guide) — the authoritative reference for Elasticsearch, Logstash, and Kibana.
- **The syslog protocol specification (RFC 5424)** — the foundational, still-referenced standard for system logging severity levels and format.
- **OpenTelemetry's official logging specification** — the current standard for structured logging unified with tracing/metrics.
`,

  books: `
- **"The Site Reliability Workbook" — Google** — includes practical guidance on logging as part of broader production reliability practice.
- **"Observability Engineering" — Charity Majors, Liz Fong-Jones, George Miranda** — a comprehensive, modern treatment of logging alongside metrics and tracing as unified observability practice.
- **"Distributed Systems Observability" — Cindy Sridharan** — a widely-recommended, freely-available deep dive into the three pillars of observability, including logging's specific role.
`,

  blogs: `
- **Honeycomb's engineering blog** — extensive, influential writing on modern observability practice, including structured logging and its relationship to tracing.
- **Elastic's own blog** — practical guidance on ELK stack usage and log aggregation architecture.
- **Charity Majors's writing (honeycomb.io and personal blog)** — widely-referenced perspectives on observability practice from an influential industry voice.
`,

  "research-papers": `
Logging, as a practitioner-driven engineering discipline rather than pure academic research, has limited dedicated peer-reviewed literature; the most relevant related sources:

- **The original syslog RFC documents** — the closest equivalent to a formal specification for logging conventions.
- General distributed systems literature on observability and monitoring (referenced in the **Distributed Systems** skill) provides theoretical grounding for why centralized, correlated logging becomes necessary at scale.
`,

  videos: `
- **Various "ELK Stack Tutorial" video series** covering hands-on log aggregation setup.
- **Charity Majors's and Honeycomb's conference talks on observability** — widely-referenced discussions of modern structured logging practice.
- **Conference talks specifically on microservices logging and correlation strategies** from major engineering conferences.
`,

  "github-repos": `
- **elastic/elasticsearch, elastic/kibana** — the official source repositories for the dominant open-source log aggregation stack.
- **fluent/fluentd** — a widely-used, popular open-source log shipper/collector.
- **open-telemetry/opentelemetry-specification** — the official OpenTelemetry specification repository, covering unified logging alongside metrics/tracing.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Structured logging basics**: implement a logger producing consistent JSON output across at least five different event types.
2. **Correlation ID design**: implement correlation ID generation and propagation across a simulated three-service request flow.
3. **Sensitive data scanning**: implement a pattern-based filter catching common sensitive data patterns before they reach log output.
4. **Retention/sampling strategy**: given a description of a system's log volume and business requirements, design and justify a tiered retention and sampling policy.
5. **Log aggregation setup**: set up a local ELK-stack-style pipeline and write search queries demonstrating correlation ID-based cross-service filtering.
6. **External practice sets**: Elastic's own official ELK stack tutorials for structured, guided practice with a real production logging technology.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Services["Distributed Services"]
        ServiceA["Service A"]
        ServiceB["Service B"]
        ServiceC["Service C"]
    end
    subgraph Shipping["Log Shipping Layer"]
        Shipper["Log Shipper\n(Filebeat/Fluentd)"]
    end
    subgraph Storage["Centralized Storage"]
        Elasticsearch["Elasticsearch\n(indexed, searchable)"]
    end
    subgraph Access["Access Layer"]
        Kibana["Kibana\n(search UI)"]
        Alerts["Alerting rules"]
    end
    ServiceA --> Shipper
    ServiceB --> Shipper
    ServiceC --> Shipper
    Shipper --> Elasticsearch
    Elasticsearch --> Kibana
    Elasticsearch --> Alerts
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Logging))
    Foundations
      Overview
      History syslog ELK
      Why it exists
      Problem it solves
    Structured Logging
      JSON fields
      Log levels
      Correlation IDs
    Aggregation
      ELK stack architecture
      Shippers
      Centralized search
    Cost Management
      Retention tiering
      Sampling strategy
      Never sample errors
    Security
      Never log sensitive data
      Audit logging category
      Access controls
    Three Pillars
      Logging versus metrics
      Logging versus tracing
      OpenTelemetry unification
    Production Practice
      Effective message design
      Organization wide conventions
      Async buffered logging
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default logging;
