import type { SkillContent } from "../types";

/**
 * Prometheus — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const prometheus: SkillContent = {
  overview: `
Prometheus is an open-source systems monitoring and alerting toolkit that has become the de facto standard metrics collection system for Kubernetes-based and broader cloud-native infrastructure, implementing the metric types and design principles covered in the **Metrics** skill as a concrete, production-grade tool. Prometheus's defining architectural choices — a pull-based (rather than push-based) collection model, a multi-dimensional label-based data model, and its own powerful query language (PromQL) — directly shaped how an entire generation of engineers think about and interact with production metrics.

For an AI engineer, Prometheus is the tool most likely encountered directly when instrumenting a production service, querying a system's current or historical health, or configuring alerting rules — it is the practical, hands-on implementation of virtually every theoretical concept covered in the **Metrics** skill (counters, gauges, histograms, cardinality management, SLO-based alerting). Prometheus is also frequently the metrics backend feeding **Grafana** (covered in its own skill) dashboards, and is increasingly instrumented via **OpenTelemetry** (covered in its own skill) rather than Prometheus's own original client libraries directly.

Key characteristics: a **pull-based collection model**, where Prometheus itself periodically scrapes a target's exposed /metrics HTTP endpoint, rather than applications pushing metrics to a central collector; a **multi-dimensional data model** using labels to let one metric name be sliced along many independent dimensions simultaneously; **PromQL**, a purpose-built query language for selecting, filtering, and mathematically transforming time-series data; **service discovery**, automatically finding and monitoring new targets (particularly valuable in dynamic, container-orchestrated environments like Kubernetes); and **Alertmanager**, a companion component handling alert deduplication, grouping, and routing to notification channels.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2012 | Prometheus development begins at **SoundCloud**, directly inspired by Google's internal Borgmon monitoring system, addressing SoundCloud's need for better monitoring of their microservices infrastructure |
| 2015 | Prometheus is **publicly released** as open source, quickly gaining traction specifically among engineers building containerized, microservices-based infrastructure |
| 2016 | Prometheus becomes the **second project accepted into the Cloud Native Computing Foundation (CNCF)**, immediately after Kubernetes itself, cementing its position as Kubernetes' de facto standard companion monitoring system |
| 2018 | Prometheus becomes the **second CNCF project to graduate** (following Kubernetes), reflecting its maturity and widespread, stable production adoption across the industry |
| 2018–2019 | The broader **Prometheus ecosystem** matures significantly: Alertmanager for alert routing, various exporters (translating metrics from systems that don't natively expose Prometheus-format metrics), and long-term storage integrations (Thanos, Cortex, Mimir) addressing Prometheus's own single-node storage limitations |
| 2019–2020s | **OpenTelemetry** (covered in its own skill) emerges as a complementary, increasingly-adopted instrumentation standard, with Prometheus remaining a common metrics BACKEND/storage choice even as instrumentation increasingly happens via OpenTelemetry's vendor-neutral client libraries rather than Prometheus's own original ones |

Prometheus's history — inspired directly by Google's internal Borgmon, becoming Kubernetes' inseparable companion project, and achieving remarkably fast CNCF graduation — reflects how closely its design and adoption trajectory tracked the broader industry's parallel shift toward containerized, cloud-native infrastructure, arriving at precisely the right moment to become that infrastructure's default monitoring companion.
`,

  "why-it-exists": `
Prometheus exists because SoundCloud's engineers, operating an increasingly complex, containerized microservices architecture, found existing monitoring tools (many designed for a previous era of simpler, more static infrastructure) genuinely inadequate for their needs — particularly the challenge of monitoring a constantly-changing set of service instances (containers starting and stopping dynamically) and the need to slice and query metrics along multiple independent dimensions simultaneously, which older, more rigid hierarchical metric naming schemes handled poorly.

The specific design choice that most distinguishes Prometheus — its PULL-based collection model, where Prometheus itself reaches out to scrape each monitored target's metrics, rather than applications pushing their metrics to a central collector — was a deliberate response to genuine operational pain points with push-based systems: a pull-based model lets Prometheus itself detect when a target has become unreachable (a scrape simply fails, an immediately actionable signal), avoids needing every application to know the metrics collector's address and manage its own push scheduling/batching logic, and gives the OPERATOR of the monitoring system (rather than every individual application team) centralized control over collection frequency and configuration.

Prometheus's LABEL-based, multi-dimensional data model similarly addressed a genuine limitation of earlier systems like Graphite, whose hierarchical dot-separated metric names (servers.web01.requests.count) required deciding the exact dimensional structure upfront — Prometheus's labels let engineers query and aggregate along ANY combination of dimensions after the fact (by endpoint, by status code, by region, or any combination) without needing to have anticipated every possible query shape when the metric was originally instrumented, a genuinely more flexible and durable design.
`,

  "problem-it-solves": `
Prometheus solves the **"how do we reliably collect, store, and query dimensional numerical metrics from a large, dynamically-changing fleet of services, supporting flexible ad-hoc analysis, dashboards, and alerting, specifically well-suited to containerized, cloud-native infrastructure"** problem.

Concretely, Prometheus provides:

- **Reliable, centrally-controlled collection via pulling**: Prometheus itself decides when and how often to scrape each target, immediately and directly detecting target unavailability (a failed scrape) as a first-class, actionable signal.
- **Automatic service discovery** integrating directly with Kubernetes (and other dynamic infrastructure), automatically finding and beginning to monitor new service instances as they're created, without manual reconfiguration for every scaling event.
- **A powerful, purpose-built query language (PromQL)** supporting flexible aggregation, filtering, and mathematical transformation of time-series data — computing rates, percentiles, and complex multi-metric expressions directly within queries.
- **A complete alerting pipeline** (Prometheus's alerting rules combined with the companion Alertmanager component) handling alert evaluation, deduplication, grouping, and routing to notification channels (email, Slack, PagerDuty) in one integrated system.
- **A genuinely mature, widely-adopted open-source ecosystem**: countless "exporters" translate metrics from systems that don't natively expose Prometheus-format metrics (databases, hardware sensors, third-party services) into Prometheus's expected format.

What Prometheus does **not** solve, or solves with a real tradeoff: Prometheus's default storage is SINGLE-NODE and not natively designed for indefinite long-term retention or high-availability clustering — addressing genuinely long-term storage or multi-region high availability typically requires additional components (Thanos, Cortex, or Mimir) layered atop base Prometheus; Prometheus's pull-based model assumes targets are directly network-reachable for scraping, which can require additional consideration (a pushgateway component) for genuinely short-lived batch jobs that complete before a scrape could occur; and Prometheus, like any metrics system, remains fundamentally vulnerable to the cardinality explosion problem covered in the **Metrics** skill if labels aren't designed with bounded cardinality in mind.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Prometheus's pull-based collection model and how it differs from push-based alternatives.
2. Write basic and intermediate PromQL queries for rate calculation, aggregation, and percentile computation.
3. Configure Prometheus service discovery for a Kubernetes environment.
4. Design and implement alerting rules combined with Alertmanager for routing and deduplication.
5. Use recording rules to pre-compute expensive, frequently-queried aggregations.
6. Understand Prometheus's storage model and the role of long-term storage extensions (Thanos, Cortex, Mimir).
7. Recognize and avoid Prometheus-specific anti-patterns: cardinality explosion, overly broad scrape intervals, and missing alerting coverage.
8. Instrument an application using Prometheus client libraries (or OpenTelemetry with a Prometheus exporter).
9. Answer senior-level interview questions on Prometheus's architecture, PromQL, and production operational practice.
`,

  prerequisites: `
- **Required**: the **Metrics** skill (covered alongside this one) — Prometheus is the concrete implementation of the metric types and design principles covered there.
- **Very helpful**: the **Kubernetes** skill, since Prometheus's service discovery and broader adoption are deeply intertwined with Kubernetes-based infrastructure.
- **Very helpful**: the **Grafana** skill for how Prometheus data is typically visualized.

Dependency links: **Metrics** → this page → **Grafana** for visualization → **OpenTelemetry** for the modern, standardized instrumentation approach increasingly used alongside Prometheus as a backend.
`,

  "beginner-concepts": `
### The pull-based scrape model

~~~
1. An application exposes a /metrics HTTP endpoint (plain text format)
2. Prometheus is configured with a list of "targets" to scrape
3. Prometheus periodically (e.g., every 15 seconds) sends an
   HTTP GET request to each target's /metrics endpoint
4. Prometheus parses the response and stores each metric's
   current value as a new data point in its time-series database
~~~

Unlike push-based systems (where applications actively send metrics to a collector), Prometheus reaches out and PULLS metrics from each target — this is Prometheus's most distinctive architectural choice.

### A basic /metrics endpoint output

~~~
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1027
http_requests_total{method="POST",status="500"} 3

# HELP request_duration_seconds Request duration
# TYPE request_duration_seconds histogram
request_duration_seconds_bucket{le="0.1"} 850
request_duration_seconds_bucket{le="0.5"} 990
request_duration_seconds_bucket{le="+Inf"} 1000
~~~

This is the Prometheus text exposition format — plain, human-readable text that any application can produce (via a Prometheus client library, or manually), which Prometheus's scraper then parses.

### Basic PromQL queries

~~~
# Current value of a counter (rarely useful alone, since counters
# only ever increase and reset on restart)
http_requests_total

# The PER-SECOND RATE of increase over the last 5 minutes --
# genuinely useful, converts a raw ever-growing counter into a
# meaningful rate
rate(http_requests_total[5m])

# Filter by label
rate(http_requests_total{status="500"}[5m])

# Aggregate across all instances, summed
sum(rate(http_requests_total[5m]))
~~~

rate() is one of PromQL's most fundamental, frequently-used functions — it correctly handles counter resets (when an application restarts, its counter resets to zero) and converts a raw, ever-growing total into a meaningful "how many per second" figure.

### Basic alerting rule configuration

~~~yaml
groups:
  - name: example
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Error rate is above 5% for 5 minutes"
~~~

An alerting rule defines a PromQL expression and a threshold; if the expression's result exceeds the threshold for the specified duration (for: 5m here, preventing alerts from brief, transient blips), Prometheus fires an alert, which Alertmanager then routes to the appropriate notification channel.
`,

  "intermediate-concepts": `
### Instrumenting an application with the Prometheus client library

~~~python
from prometheus_client import Counter, Histogram, start_http_server

request_count = Counter("http_requests_total", "Total requests", ["method", "status"])
request_duration = Histogram("http_request_duration_seconds", "Duration", ["endpoint"])

def handle_request(method, endpoint):
    with request_duration.labels(endpoint=endpoint).time():
        -- process the request
        request_count.labels(method=method, status="200").inc()

if __name__ == "__main__":
    start_http_server(8000)   -- exposes /metrics on port 8000
~~~

### Percentile calculation with histogram_quantile

~~~
# Compute the 95th percentile latency from a histogram's bucket data
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
~~~

histogram_quantile is the CORRECT way to compute percentiles from a Prometheus histogram, aggregating the underlying bucket counts (which CAN be correctly summed across instances) before computing the percentile — directly connecting to the **Metrics** skill's own coverage of why averaging pre-computed percentiles across instances is mathematically incorrect.

### Service discovery in Kubernetes

~~~yaml
scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
~~~

Rather than manually listing every target to scrape, Kubernetes service discovery lets Prometheus automatically discover pods (based on annotations marking them as scrapeable), a genuinely essential capability in a dynamic environment where pods are constantly being created and destroyed by the orchestrator.

### Recording rules for expensive, frequently-queried aggregations

~~~yaml
groups:
  - name: recording_rules
    rules:
      - record: job:http_requests:rate5m
        expr: sum(rate(http_requests_total[5m])) by (job)
~~~

A recording rule pre-computes an expensive or frequently-run query periodically, storing the RESULT as its own new, simpler metric — avoiding the cost of recomputing the same complex aggregation on every single dashboard load or alert evaluation.

### Alertmanager: deduplication, grouping, and routing

~~~yaml
route:
  group_by: ["alertname", "cluster"]
  receiver: "team-slack"
  routes:
    - match:
        severity: critical
      receiver: "team-pagerduty"
~~~

Alertmanager (a companion Prometheus component) receives fired alerts and handles the genuinely important operational concerns of GROUPING related alerts together (avoiding a flood of individually-notified, related alerts), DEDUPLICATING identical alerts, and ROUTING different alert types to different notification channels based on configurable rules (critical alerts to PagerDuty, less urgent ones to Slack).
`,

  "advanced-concepts": `
### Federation for multi-cluster/multi-region setups

~~~yaml
scrape_configs:
  - job_name: federate
    honor_labels: true
    metrics_path: /federate
    params:
      match[]:
        - '{job="prometheus"}'
    static_configs:
      - targets: ["prometheus-cluster-a:9090", "prometheus-cluster-b:9090"]
~~~

Federation lets a higher-level Prometheus instance scrape AGGREGATED data from multiple lower-level Prometheus instances (each monitoring its own cluster or region), providing a global view without every individual metric from every cluster needing to flow into one single, centralized instance.

### Long-term storage: Thanos, Cortex, and Mimir

~~~
Base Prometheus's local storage is genuinely well-suited to
recent data (hours to weeks) on a single node, but not
natively designed for years of retention or true
high-availability clustering. Projects like Thanos, Cortex,
and Mimir extend Prometheus's storage model to support:
├── Long-term, cost-effective retention (often backed by
│    object storage like S3)
├── Global querying across many Prometheus instances
└── Horizontal scalability and high availability
~~~

For genuinely large-scale, long-retention production deployments, base Prometheus is typically paired with one of these extension projects rather than used entirely standalone — a common, important architectural consideration.

### The pushgateway for short-lived batch jobs

~~~
Prometheus's pull model assumes a target is reachable and
running WHEN a scrape occurs -- but a short-lived batch job
(one that starts, does work, and exits, all faster than the
scrape interval) might complete before Prometheus ever gets a
chance to scrape it. The Pushgateway component exists
specifically for this case: the batch job PUSHES its final
metric values to the Pushgateway before exiting, and Prometheus
then scrapes the Pushgateway itself (which persists those
values) on its normal pull-based schedule.
~~~

The Pushgateway is a deliberate, narrow exception to Prometheus's otherwise strict pull-based philosophy, specifically for the genuine edge case of jobs too short-lived to be reliably scraped directly.

### Advanced PromQL: subqueries and multi-metric expressions

~~~
# A subquery: computing max over a RANGE of rate() calculations
max_over_time(rate(http_requests_total[5m])[1h:5m])

# Combining multiple metrics in one expression (e.g., error ratio)
sum(rate(http_requests_total{status="500"}[5m]))
/
sum(rate(http_requests_total[5m]))
~~~

PromQL supports genuinely sophisticated expressions combining multiple metrics and time ranges, enabling exactly the kind of error-ratio and SLO-burn-rate calculations covered in the **Metrics** skill's treatment of multi-window, multi-burn-rate alerting.

### Cardinality monitoring within Prometheus itself

~~~
# Query Prometheus's own internal metrics to monitor cardinality
count({__name__=~".+"})   -- total number of time series
topk(10, count by (__name__)({__name__=~".+"}))   -- metrics with the most series
~~~

Prometheus exposes its own internal operational metrics, letting operators monitor the metrics system's OWN health, including cardinality growth — a genuinely important, self-referential monitoring practice for catching a cardinality explosion before it degrades the entire system.
`,

  "internal-working": `
What happens internally during a single Prometheus scrape cycle, tracing target discovery through storage:

~~~mermaid
sequenceDiagram
    participant SD as Service Discovery
    participant Prometheus as Prometheus server
    participant Target as Application /metrics endpoint
    participant TSDB as Local time-series storage

    SD->>Prometheus: current list of targets\n(e.g., discovered Kubernetes pods)
    loop Every scrape_interval (e.g., 15 seconds)
        Prometheus->>Target: HTTP GET /metrics
        Target-->>Prometheus: current metric values\n(text exposition format)
        Prometheus->>Prometheus: parse response, attach\ntimestamp and target labels
        Prometheus->>TSDB: append new data points\nto each metric's time series
    end
    Note over TSDB: Each unique metric name + label\ncombination is stored as its\nown separate time series
~~~

1. **Service discovery continuously updates the target list**, particularly important in dynamic environments (Kubernetes) where the actual set of running instances changes frequently.
2. **Prometheus scrapes each target on its own schedule** (the configured scrape_interval, commonly 15-30 seconds), an HTTP GET request to that target's /metrics endpoint.
3. **Each scrape's parsed values are appended as new data points** to the appropriate time series, with Prometheus automatically attaching a timestamp and any configured target labels (like which Kubernetes pod or namespace the data came from).

**Why this matters**: understanding that Prometheus's data resolution is bounded by its SCRAPE INTERVAL (a spike lasting less than the interval between two scrapes might be entirely missed) explains a genuine, important limitation — Prometheus provides efficient periodic SAMPLING of metric state, not a complete, continuous recording of every instantaneous value, a tradeoff directly connecting to the broader efficiency-versus-completeness tradeoff covered in the **Metrics** skill.
`,

  architecture: `
A senior engineer thinks about Prometheus deployment architecture across several dimensions: designing scrape configuration and service discovery appropriate for the actual infrastructure, choosing whether and how to extend Prometheus's storage for long-term retention needs, and structuring alerting rules combined with Alertmanager for effective, non-noisy incident response.

### The Prometheus-plus-ecosystem architecture

~~~mermaid
flowchart TB
    Apps["Instrumented applications\n(expose /metrics)"] --> Prometheus["Prometheus server\n(scrapes, stores, evaluates rules)"]
    Prometheus --> Alertmanager["Alertmanager\n(dedup, group, route)"]
    Prometheus --> Grafana["Grafana\n(dashboards)"]
    Prometheus --> LongTerm["Thanos/Cortex/Mimir\n(long-term storage, if needed)"]
    Alertmanager --> Notifications["Slack, PagerDuty, email"]
~~~

A senior engineer recognizes Prometheus as typically ONE component within a broader ecosystem (Alertmanager for alert routing, Grafana for visualization, and potentially Thanos/Cortex/Mimir for long-term storage), rather than a complete, standalone monitoring solution by itself.

### Choosing when to extend Prometheus's storage

~~~mermaid
flowchart TB
    Q1{"Do you need retention\nbeyond a few weeks, or\nmulti-cluster global querying,\nor high availability?"}
    Q1 -->|No| BaseProm["Base Prometheus is\ngenuinely sufficient"]
    Q1 -->|Yes| Extension["Consider Thanos, Cortex,\nor Mimir as an extension"]
~~~

This decision — recognizing genuine long-term storage or multi-cluster needs versus over-engineering a simple, single-cluster deployment with unnecessary extension complexity — directly reflects the same judicious-application discipline covered throughout this platform's design and architecture skills.

### Structuring alerting for signal, not noise

~~~mermaid
flowchart LR
    Rules["Alerting rules"] --> Alertmanager["Alertmanager"]
    Alertmanager --> Grouping["Group related alerts\n(avoid notification flood)"]
    Alertmanager --> Routing["Route by severity/team\n(critical to PagerDuty,\nlow-urgency to Slack)"]
~~~

A senior engineer designs alerting rules AND Alertmanager configuration together, recognizing that a well-designed alerting RULE combined with poor grouping/routing configuration can still produce an operationally unmanageable flood of individually-notified, related alerts during a genuine incident.
`,

  "data-flow": `
Tracing an alert's complete lifecycle from a PromQL rule evaluation through to a notification being sent:

~~~mermaid
sequenceDiagram
    participant Prometheus as Prometheus (rule evaluation)
    participant Alertmanager
    participant Slack

    loop Every evaluation_interval
        Prometheus->>Prometheus: evaluate alerting rule expression\n(e.g., error rate > 5% for 5m)
    end
    Prometheus->>Prometheus: condition met and sustained\nfor the "for" duration -- alert FIRES
    Prometheus->>Alertmanager: send firing alert
    Alertmanager->>Alertmanager: check for existing, related\nfiring alerts (grouping/deduplication)
    Alertmanager->>Alertmanager: apply routing rules\n(match on labels: severity, team)
    Alertmanager->>Slack: send grouped, routed notification
~~~

The critical detail: Prometheus itself is responsible ONLY for evaluating whether an alerting condition is met (based on PromQL expressions and the "for" duration preventing alerts from brief, transient blips); Alertmanager is a SEPARATE component specifically responsible for what happens to a fired alert afterward (grouping it with related alerts, deduplicating repeated firings, and routing it to the correct notification channel) — this separation of concerns lets each component be configured and reasoned about independently.
`,

  "production-usage": `
### A production-style Prometheus scrape and alerting configuration

~~~yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: my-service
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        target_label: app

rule_files:
  - alerting_rules.yml
  - recording_rules.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]
~~~

### Non-negotiables for production Prometheus deployment

1. **Use Kubernetes (or equivalent) service discovery** rather than manually maintaining static target lists in dynamic environments.
2. **Design alerting rules with an appropriate "for" duration** to avoid firing on brief, transient blips.
3. **Configure Alertmanager grouping/routing thoughtfully**, avoiding alert floods during genuine incidents.
4. **Use recording rules for expensive, frequently-queried aggregations.**
5. **Monitor Prometheus's own cardinality and resource usage**, catching a growing problem before it degrades the system.

### Common production patterns

- **The kube-prometheus-stack** (a widely-used Helm chart bundling Prometheus, Alertmanager, Grafana, and Kubernetes-specific dashboards/alerts) as a common, comprehensive starting point for Kubernetes monitoring.
- **Thanos or Mimir for long-term, cost-effective metric storage** extending base Prometheus's single-node limitations.
- **Exporters** (node_exporter for host-level metrics, and many others) translating non-native systems' metrics into Prometheus's expected format.
`,

  "industry-examples": `
- **Kubernetes' own ecosystem**: Prometheus is the de facto standard metrics system for Kubernetes-based infrastructure, with the Horizontal Pod Autoscaler and many other Kubernetes components directly integrating with Prometheus-format metrics.
- **The CNCF's own broader project ecosystem**: Prometheus's early, fast CNCF graduation (second only to Kubernetes itself) reflects and reinforces its foundational role in the cloud-native ecosystem.
- **SoundCloud**: Prometheus's original creator and first production deployment, directly motivated by their own microservices monitoring needs.
- **Countless companies' internal monitoring infrastructure**: Prometheus (often paired with Grafana, and increasingly Thanos/Mimir for long-term storage) is among the most widely-adopted open-source monitoring stacks across the industry.
- **Managed Prometheus-compatible services** (AWS Managed Service for Prometheus, Grafana Cloud's hosted Prometheus): reflecting Prometheus's query language and data model becoming a genuine industry standard interface, even when the underlying storage/operations are managed by a third party.
`,

  "best-practices": `
1. **Use service discovery** rather than static target configuration in any dynamic (particularly Kubernetes-based) environment.
2. **Design bounded-cardinality labels** from the start, applying the **Metrics** skill's cardinality management principles directly.
3. **Use histogram_quantile for percentile calculation**, never averaging pre-computed percentiles across instances.
4. **Set an appropriate "for" duration on alerting rules**, avoiding false alarms from brief, transient conditions.
5. **Configure Alertmanager grouping/routing deliberately**, preventing alert floods during genuine incidents.
6. **Use recording rules for expensive, frequently-queried aggregations**, reducing dashboard/alert evaluation cost.
7. **Monitor Prometheus's own resource usage and cardinality**, treating the monitoring system's own health as a genuine operational concern.
8. **Extend storage (Thanos/Cortex/Mimir) only when genuinely needed** (long retention, multi-cluster querying, high availability), not by default.
9. **Use the Pushgateway sparingly**, reserved specifically for genuinely short-lived batch jobs, not as a general-purpose alternative to direct scraping.
10. **Adopt OpenTelemetry for instrumentation where practical**, using Prometheus primarily as a backend/storage and query layer rather than requiring Prometheus-specific client library usage everywhere.
`,

  "anti-patterns": `
### Manually maintaining static target lists in a dynamic environment

~~~yaml
# WRONG — manually listing specific pod IPs in a Kubernetes
# environment where pods are constantly created/destroyed
scrape_configs:
  - job_name: my-service
    static_configs:
      - targets: ["10.0.1.5:8000", "10.0.1.6:8000"]   -- will go stale immediately

# RIGHT — use Kubernetes service discovery
scrape_configs:
  - job_name: my-service
    kubernetes_sd_configs:
      - role: pod
~~~

Static target configuration in a genuinely dynamic environment (Kubernetes, or any auto-scaling infrastructure) goes stale almost immediately as instances are created and destroyed, silently leaving newly-created instances unmonitored and monitoring configuration for terminated instances lingering uselessly.

### Alerting rules with no "for" duration

~~~yaml
# WRONG — fires immediately on ANY momentary spike, even a
# single brief, self-resolving blip
- alert: HighErrorRate
  expr: rate(http_requests_total{status="500"}[5m]) > 0.05
  -- no "for" duration specified

# RIGHT — require the condition to be SUSTAINED before alerting
- alert: HighErrorRate
  expr: rate(http_requests_total{status="500"}[5m]) > 0.05
  for: 5m
~~~

Without a "for" duration, an alerting rule fires on any single evaluation cycle where the condition happens to be true, even for a single-cycle, self-resolving blip — a genuine source of alert fatigue and false alarms.

### Other production-grade anti-patterns

- **Averaging pre-computed percentiles across instances** rather than using histogram_quantile on properly-aggregated bucket data.
- **Not using recording rules for expensive, frequently-run queries**, causing repeated, unnecessary computation cost on every dashboard load.
- **Ignoring Prometheus's own cardinality growth**, risking the entire monitoring system's performance degrading without warning.
- **Over-engineering storage extensions (Thanos/Cortex/Mimir) for a small, single-cluster deployment** that base Prometheus would genuinely handle fine on its own.
- **Overusing the Pushgateway** for long-running services that could and should be scraped directly, defeating Prometheus's pull-based target-health-detection benefit.
`,

  performance: `
### Rule zero: manage cardinality proactively — Prometheus's single biggest performance/cost lever

Cardinality explosion is Prometheus's most common, most severe operational failure mode, directly connecting to the **Metrics** skill's own treatment of this concern.

### The performance hierarchy (apply in order)

1. **Design bounded-cardinality labels from the start**, verified during instrumentation review, not discovered reactively in production.
2. **Use recording rules for expensive, frequently-queried aggregations**, trading a small amount of storage for significant query-time performance savings.
3. **Set appropriate scrape and evaluation intervals**, balancing time resolution against storage/processing cost.
4. **Use histogram_quantile (not raw averaging)** for correct, efficient percentile calculation.
5. **Extend storage (Thanos/Cortex/Mimir) specifically when genuine long-term retention or multi-cluster query needs justify the added operational complexity.**

### Micro-level facts worth knowing

- Prometheus's local storage engine is genuinely well-optimized for recent-data query performance, but query performance degrades as the queried time range and cardinality both grow.
- Each additional scrape target and each additional unique label combination adds directly, roughly linearly to Prometheus's memory and storage requirements — capacity planning should account for both dimensions.
- rate() and histogram_quantile() are computationally more expensive than simple instant-vector queries, making recording rules particularly valuable for these specific, commonly-dashboarded computations.
`,

  scalability: `
Prometheus's single-node architecture creates a genuine, well-understood scalability ceiling — addressed either by careful cardinality/retention management within that ceiling, or by extending Prometheus with dedicated scaling solutions.

### Prometheus's inherent single-node scaling ceiling

~~~mermaid
flowchart LR
    SingleProm["A single Prometheus instance"] --> Ceiling["Bounded by that instance's\nmemory/disk/CPU capacity --\nno native horizontal scaling"]
~~~

Base Prometheus does not natively support horizontal scaling or clustering — a single instance's capacity (memory, disk, CPU) directly bounds how much data it can ingest and query, a genuine architectural constraint that becomes relevant at sufficient scale.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A single Prometheus instance's storage/query capacity exceeded | Federation (aggregating across multiple instances) or a long-term storage extension (Thanos, Cortex, Mimir) |
| Long-term retention needs beyond a few weeks | Thanos/Cortex/Mimir with object storage (S3) backing |
| Multi-cluster/multi-region global querying needs | Federation, or Thanos's global query layer specifically |
| Cardinality growing unsustainably | Redesign labels for bounded cardinality; this is NOT solved by adding more Prometheus capacity |
| Short-lived batch jobs completing before a scrape occurs | The Pushgateway component, used sparingly and specifically for this case |
`,

  security: `
### Metrics endpoint and Prometheus UI exposure

~~~
A Prometheus server's own web UI and API, and every monitored
application's /metrics endpoint, can reveal genuinely sensitive
operational information if exposed publicly -- both should be
network-isolated and access-controlled, reachable only by
appropriate internal infrastructure and personnel.
~~~

### Essential Prometheus security practices

1. **Never expose Prometheus's UI/API or any application's /metrics endpoint** to the public internet without appropriate authentication.
2. **Apply network policies/firewalling** restricting scrape traffic and query access to legitimate internal sources.
3. **Avoid including sensitive information in metric labels**, applying the same discipline covered in the **Logging** and **Metrics** skills.
4. **Secure Alertmanager's own configuration**, since it often holds credentials for notification channels (Slack webhooks, PagerDuty API keys).

See the **OWASP Top 10**, **Kubernetes**, and **Networking** skills for the broader infrastructure security context this connects to.
`,

  testing: `
### Testing PromQL alerting rules

~~~yaml
# Prometheus's promtool can test alerting rules against
# synthetic time-series data, verifying they fire (or don't)
# under specific scenarios
rule_files:
  - alerting_rules.yml
tests:
  - interval: 1m
    input_series:
      - series: http_requests_total{status="500"}
        values: "0 0 0 10 10 10 10 10"
    alert_rule_test:
      - eval_time: 7m
        alertname: HighErrorRate
        exp_alerts: []   -- verify NO alert fires if the condition
                           -- hasn't been sustained long enough yet
~~~

### The senior testing doctrine

- Use promtool's rule-testing capability to verify alerting rules fire (and don't fire) under specific, deliberately-constructed synthetic scenarios.
- Test that recording rules produce correct results against known input data.
- Test service discovery configuration in a staging environment mirroring production's actual dynamic infrastructure behavior.
- Test cardinality bounds for newly-introduced labels before production deployment, catching a potential cardinality issue early.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check Prometheus's own targets page** (/targets in its web UI) to verify all expected scrape targets are healthy and being successfully scraped.
2. **Use the PromQL query browser** to interactively test and refine queries before embedding them in a dashboard or alerting rule.
3. **Check Prometheus's own internal metrics** for signs of resource exhaustion or cardinality issues (prometheus_tsdb_head_series, and similar).
4. **Verify Alertmanager's configuration and current alert state** if alerts seem to be firing incorrectly or notifications aren't arriving as expected.

### Debugging common Prometheus-specific symptoms

- "A target shows as down in Prometheus's UI" — verify network connectivity, the target's /metrics endpoint is actually reachable, and any authentication/TLS configuration is correct.
- "Prometheus is using excessive memory/disk" — check for a cardinality explosion via prometheus_tsdb_head_series or similar internal metrics.
- "An alert didn't fire despite an apparent issue" — verify the PromQL expression and "for" duration are correctly configured, and check whether the underlying metric data itself has gaps.
- "Alertmanager isn't sending notifications" — verify routing configuration matches the alert's labels correctly, and check Alertmanager's own logs for delivery errors.
`,

  monitoring: `
### Key signals to track

- **Prometheus's own resource usage** (memory, disk, CPU) and internal metrics (scrape success rate, time series count), monitoring the monitoring system itself.
- **Scrape duration and success rate per target**, catching slow or failing targets before they cause broader data gaps.
- **Alert firing/resolution rate**, tracking whether alerting is providing genuinely actionable signal versus excessive noise.
- **Recording rule evaluation time**, ensuring pre-computed aggregations remain fast even as underlying data volume grows.

### Tools

Prometheus's own built-in web UI for targets, rules, and query testing; Grafana dashboards built specifically for monitoring Prometheus's own health (a common, recommended "meta-monitoring" pattern); Alertmanager's own web UI for current alert state and silencing.

### Alerting priorities

Alert on Prometheus's own resource exhaustion or approaching capacity limits (a genuine risk of losing broader observability if the monitoring system itself fails), on sustained scrape failures for critical targets, and on cardinality growth trends approaching concerning levels.
`,

  deployment: `
### Deploying Prometheus in Kubernetes via the kube-prometheus-stack

~~~bash
helm install monitoring prometheus-community/kube-prometheus-stack
~~~

The kube-prometheus-stack Helm chart is a widely-adopted, comprehensive starting point bundling Prometheus, Alertmanager, Grafana, and a curated set of Kubernetes-specific dashboards and alerting rules, significantly reducing the setup effort compared to configuring each component independently from scratch.

### CI/CD pipeline considerations

Automated testing of alerting rules (via promtool) and recording rule correctness as part of CI, catching monitoring configuration regressions before they reach production. See the **CI/CD** and **Kubernetes** skills for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production Prometheus deployment is considered complete:

- [ ] Service discovery configured appropriately for the actual infrastructure (Kubernetes or equivalent), not static target lists
- [ ] Alerting rules include appropriate "for" durations, avoiding false alarms from brief, transient conditions
- [ ] Alertmanager grouping/routing configured deliberately, preventing alert floods
- [ ] Recording rules configured for expensive, frequently-queried aggregations
- [ ] Cardinality bounds verified for all instrumented labels, with monitoring in place for cardinality growth
- [ ] Long-term storage extension (Thanos/Cortex/Mimir) deployed if genuine retention/multi-cluster needs justify it
- [ ] Prometheus's own resource usage and health monitored (meta-monitoring)
- [ ] Metrics endpoints and Prometheus's UI/API appropriately access-controlled, not publicly exposed
- [ ] Alerting rules tested via promtool against synthetic scenarios
- [ ] The Pushgateway used only for genuinely short-lived batch jobs, not as a general-purpose alternative to direct scraping
`,

  "common-mistakes": `
1. **Manually maintaining static target lists in dynamic environments**, going stale as instances are created/destroyed.
2. **Alerting rules with no "for" duration**, firing on brief, transient blips.
3. **Averaging pre-computed percentiles instead of using histogram_quantile.**
4. **Not using recording rules for expensive, frequently-run queries.**
5. **Ignoring cardinality growth**, risking severe Prometheus performance degradation.
6. **Over-engineering long-term storage extensions for genuinely small, single-cluster deployments.**
7. **Overusing the Pushgateway** for long-running services that should be scraped directly.
8. **Exposing Prometheus's UI/API or metrics endpoints publicly without access control.**
9. **Not configuring Alertmanager grouping/routing thoughtfully**, causing alert floods during incidents.
10. **Not monitoring Prometheus's own resource usage**, missing warning signs before the monitoring system itself becomes a problem.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Target shows as "down" in Prometheus's UI | Network unreachability, incorrect port/path, or the target's /metrics endpoint erroring | Verify connectivity and endpoint configuration directly |
| Prometheus consuming excessive memory | Cardinality explosion from an unbounded label | Identify the offending metric/label via prometheus_tsdb_head_series and redesign it |
| Alert fires far too frequently for minor blips | Missing or too-short a "for" duration on the alerting rule | Add or extend the "for" duration appropriately |
| Percentile query returns an obviously wrong result | Averaging pre-computed percentiles instead of using histogram_quantile on bucket data | Switch to histogram_quantile with properly-aggregated bucket data |
| Dashboard queries loading very slowly | An expensive aggregation recomputed on every load | Implement a recording rule pre-computing the result |
| New Kubernetes pods not appearing as scrape targets | Service discovery misconfiguration, or missing required annotations | Verify kubernetes_sd_configs and relabel_configs are correctly set up |
| Alertmanager not sending notifications | Routing configuration mismatch, or a misconfigured/expired notification channel credential | Verify routing rules match alert labels, and check receiver configuration |
`,

  faqs: `
**Why does Prometheus use a pull-based model instead of push-based?**
A pull-based model lets Prometheus itself directly detect target unavailability (a failed scrape is an immediately actionable signal), avoids requiring every application to know the collector's address and manage push scheduling, and gives the monitoring system's operator centralized control over collection configuration.

**What is the difference between rate() and a raw counter value?**
A raw counter only ever increases (and resets to zero on restart), which alone isn't very meaningful; rate() computes the per-second rate of increase over a specified time window, correctly handling counter resets, producing a genuinely useful "how many per second" signal.

**Why should I use recording rules?**
To pre-compute expensive or frequently-run aggregation queries periodically, storing the result as a simpler metric — avoiding the cost of repeatedly recomputing the same complex query on every dashboard load or alert evaluation.

**When do I need Thanos, Cortex, or Mimir instead of just base Prometheus?**
When you genuinely need long-term retention beyond what a single Prometheus instance's local storage comfortably handles, multi-cluster/multi-region global querying, or high availability — for a smaller, single-cluster deployment with modest retention needs, base Prometheus alone is often genuinely sufficient.

**What is the Pushgateway for?**
Specifically for genuinely short-lived batch jobs that might complete before Prometheus's normal scrape interval could reach them directly — the job pushes its final metric values to the Pushgateway before exiting, and Prometheus then scrapes the Pushgateway on its normal schedule; it should not be used as a general-purpose alternative to direct scraping for long-running services.

**Why is histogram_quantile important, and what would go wrong without it?**
It correctly computes a percentile from a histogram's underlying bucket counts, which can be properly aggregated across multiple instances (summing corresponding buckets) before the percentile calculation — averaging pre-computed percentile VALUES from multiple instances directly (without this) produces a mathematically meaningless result, a well-documented pitfall covered in depth in the **Metrics** skill.
`,

  "interview-questions": `
### Junior level

1. **What is Prometheus's core collection model?**
   Model answer: pull-based — Prometheus itself periodically scrapes each monitored target's exposed /metrics HTTP endpoint, rather than applications pushing metrics to a central collector.

2. **What does the PromQL function rate() do?**
   Model answer: computes the per-second average rate of increase of a counter over a specified time window, correctly handling counter resets, converting a raw ever-growing total into a meaningful rate figure.

3. **What is a recording rule?**
   Model answer: a pre-computed, periodically-evaluated PromQL expression stored as its own new metric, avoiding the cost of repeatedly recomputing an expensive or frequently-queried aggregation.

4. **What does Alertmanager do?**
   Model answer: receives fired alerts from Prometheus and handles grouping related alerts together, deduplicating repeated firings, and routing different alert types to appropriate notification channels.

5. **Why does an alerting rule typically include a "for" duration?**
   Model answer: to require the alerting condition to be sustained for a specified period before actually firing, preventing false alarms from brief, transient blips that would otherwise trigger an alert on a single evaluation cycle.

### Senior level

6. **Explain why Prometheus's pull-based model was a deliberate design choice over push-based alternatives, and what specific operational benefits it provides.**
   Model answer: pull-based collection lets Prometheus itself directly and immediately detect target unavailability (a failed scrape is inherently a clear, actionable signal, distinct from simply "no data received" in a push model, which could mean either the target is down OR it simply had nothing to report); it also avoids requiring every application to know the metrics collector's network address and independently manage push scheduling/batching/retry logic, centralizing that responsibility instead within Prometheus's own scrape configuration, which the monitoring system's operators control directly.

7. **Why is histogram_quantile the correct way to compute percentiles in Prometheus, and what would go wrong with a naive alternative approach?**
   Model answer: histogram_quantile operates on a histogram metric's underlying BUCKET COUNTS, which can be correctly summed across multiple instances (since bucket counts are simple additive counters) before computing the percentile from the combined, aggregated bucket data; a naive alternative — computing a percentile independently on each instance and then averaging those already-computed percentile VALUES — is mathematically meaningless, since percentiles are non-linear statistics that don't average correctly, a well-documented pitfall directly connecting to the **Metrics** skill's own treatment of this exact issue.

8. **When would you deploy Thanos, Cortex, or Mimir alongside Prometheus, and what specific limitation of base Prometheus does this address?**
   Model answer: base Prometheus's local storage is single-node and not natively designed for indefinite long-term retention, high-availability clustering, or global querying across multiple separate Prometheus instances (as would exist in a multi-cluster or multi-region deployment); Thanos, Cortex, and Mimir each extend Prometheus's storage model to address these specific gaps (typically via object-storage-backed long-term retention and a global query layer), and should be adopted specifically when a deployment genuinely needs longer retention, multi-cluster querying, or high availability beyond what a single, standalone Prometheus instance can provide — not as a default addition to every deployment regardless of actual need.

9. **How would you diagnose and fix a Prometheus instance experiencing severe memory growth?**
   Model answer: first check Prometheus's own internal metrics (prometheus_tsdb_head_series, and similar) to confirm whether the growth correlates with an increasing number of distinct time series — a strong signal of cardinality explosion; if confirmed, identify the specific metric/label combination responsible (often a newly-introduced label with unbounded values, like a raw user ID or a full URL), and redesign that label to use bounded, categorical values instead — simply adding more memory/resources to Prometheus addresses the symptom temporarily but doesn't fix the underlying combinatorial growth problem, which will eventually exceed any fixed capacity increase.

10. **Design an alerting strategy for an SLO-based error budget, combining Prometheus alerting rules and Alertmanager.**
    Model answer: implement multiple PromQL-based alerting rules representing different burn-rate thresholds over different time windows (a short window with a high threshold for fast detection of severe, rapid error-budget consumption, and a longer window with a lower threshold for detecting slower, sustained degradation) — directly implementing the multi-window, multi-burn-rate pattern covered in the **Metrics** skill; configure Alertmanager to group these related burn-rate alerts together and route based on severity (a severe, fast-burning alert to PagerDuty for immediate paging, a slower-burning one perhaps to a less urgent Slack channel), ensuring the overall alerting strategy balances fast detection of genuine problems against avoiding excessive noise from normal, brief fluctuations.

11. **Explain the purpose of the Pushgateway and why it should be used sparingly rather than as a default pattern.**
    Model answer: the Pushgateway exists specifically for genuinely short-lived batch jobs that might complete (and the process exit) before Prometheus's normal pull-based scrape interval could ever reach them directly — the job pushes its final metrics to the Pushgateway before exiting, and Prometheus scrapes the Pushgateway (which persists those values) on its normal schedule instead; using the Pushgateway for long-running services defeats Prometheus's pull-based model's genuine benefit of directly detecting target health/availability via scrape success/failure, since the Pushgateway itself, not the actual service, is what Prometheus is scraping — meaning a crashed long-running service's metrics could misleadingly appear to still be "available" via stale data sitting in the Pushgateway.

12. **How would you design Prometheus service discovery and scrape configuration for a Kubernetes-based microservices deployment with dozens of services, each scaling independently?**
    Model answer: use Kubernetes-native service discovery (kubernetes_sd_configs with a pod or service role) rather than any static target configuration, since services and their individual pod instances are created and destroyed dynamically as each service scales independently; use pod annotations (a common convention: prometheus.io/scrape, prometheus.io/port) combined with relabel_configs to let each service opt into being scraped and specify its own metrics port, avoiding a rigid, centrally-maintained per-service configuration that would need manual updates every time a new service is added or an existing one's configuration changes.
`,

  "coding-questions": `
### 1. Write a PromQL query calculating a service's error rate percentage

~~~
# Error rate as a percentage, over a 5-minute window
100 * (
  sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
  sum(rate(http_requests_total[5m]))
)
# Follow-up: why does this query use rate() on BOTH the numerator
# (5xx requests) and the denominator (all requests) rather than
# using raw counter VALUES directly, and what would go wrong if
# raw counter values were used instead, particularly across a
# service restart?
~~~

### 2. Implement a recording rule and a corresponding alerting rule using it

~~~yaml
groups:
  - name: recording
    rules:
      - record: service:error_rate:ratio5m
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service)

  - name: alerting
    rules:
      - alert: HighErrorRate
        expr: service:error_rate:ratio5m > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.service }} error rate above 5%"
# Follow-up: why does defining the error rate calculation ONCE as
# a recording rule, then referencing it by its simple new metric
# name in the alerting rule, provide a genuine advantage over
# embedding the full, complex expression directly inside the
# alerting rule itself?
~~~

### 3. Write PromQL for correct cross-instance p99 latency calculation

~~~
# CORRECT: aggregates histogram BUCKETS across instances first,
# then computes the percentile from the combined bucket data
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
# Follow-up: what would this query's structure need to look like
# INCORRECTLY (and why would it be wrong) if someone instead tried
# to compute a p99 independently per instance and then average
# those already-computed p99 values together?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Instrument a service and scrape it with local Prometheus
Build a small application exposing a /metrics endpoint using the Prometheus client library, configure a local Prometheus instance to scrape it, and verify data appears correctly in Prometheus's UI. Deliverable: a working instrumented application with verified scraping. Skills exercised: basic instrumentation, scrape configuration.

### Lab 2 (Intermediate): Write PromQL queries for rate, aggregation, and percentiles
Given a running Prometheus instance with sample data, write queries computing request rate, error rate percentage, and p95/p99 latency via histogram_quantile. Deliverable: a documented set of working PromQL queries with their results. Skills exercised: PromQL query writing.

### Lab 3 (Advanced): Configure alerting rules and Alertmanager routing
Design and implement alerting rules (with appropriate "for" durations) for a simulated service, configure Alertmanager to group and route alerts by severity, and test the complete pipeline using promtool. Deliverable: a working, tested alerting configuration. Skills exercised: alerting rule design, Alertmanager configuration, rule testing.

### Lab 4 (Production): Deploy Prometheus with Kubernetes service discovery
Deploy Prometheus in a local Kubernetes cluster (using kube-prometheus-stack or a manual configuration) with service discovery correctly finding and scraping application pods, including recording rules for a common aggregation. Deliverable: a working Kubernetes-based Prometheus deployment with verified service discovery. Skills exercised: Kubernetes service discovery, recording rules, production deployment patterns.
`,

  "real-projects": `
### 1. A comprehensive Prometheus-based monitoring stack for a microservices platform
Engineering requirements: Kubernetes service discovery correctly finding all application pods, bounded-cardinality metric instrumentation across every service, recording rules for common dashboard aggregations, and Alertmanager configured with severity-based routing to appropriate notification channels.

### 2. An SLO-based alerting system built on Prometheus and Alertmanager
Engineering requirements: multi-window, multi-burn-rate alerting rules implementing the SLO/error-budget framework covered in the **Metrics** skill, with recording rules pre-computing the underlying SLI calculations, and Alertmanager routing severe, fast-burning alerts to immediate paging channels.

### 3. A long-term metrics retention and multi-cluster query solution
Engineering requirements: Thanos (or Cortex/Mimir) deployed to extend base Prometheus instances across multiple clusters, providing both cost-effective long-term retention (backed by object storage) and a unified global query interface across all clusters' metrics.
`,

  "case-studies": `
### Prometheus's rapid CNCF graduation reflecting genuine, widespread production maturity
Prometheus becoming only the second CNCF project to graduate (immediately following Kubernetes itself) reflects both its own genuine engineering maturity and its deeply intertwined adoption alongside Kubernetes specifically — the two projects' adoption curves tracked each other closely, with Prometheus becoming the default, expected monitoring companion for virtually every Kubernetes deployment. Lesson: a monitoring/infrastructure tool's adoption trajectory often closely tracks the platform it was specifically designed to complement, and arriving at precisely the right moment for a platform's own explosive growth (Kubernetes, in this case) can dramatically accelerate a complementary tool's own adoption.

### The pull-versus-push debate and Prometheus's deliberate architectural bet
Prometheus's designers made a deliberate, sometimes-debated architectural bet on pull-based collection specifically because it provided genuine operational benefits (direct target-health detection via scrape success/failure) for the microservices monitoring problem SoundCloud was actually facing, even though push-based alternatives (like StatsD, historically common) were already well-established. Lesson: a genuinely well-reasoned architectural choice, even one that goes against prevailing convention, can become the new dominant approach if it demonstrably solves a real, widely-shared operational pain point better than the existing convention did.

### The emergence of Thanos/Cortex/Mimir addressing Prometheus's own acknowledged limitations
The subsequent development of multiple, independently-created projects (Thanos, Cortex, Mimir) all specifically addressing the SAME acknowledged gap in base Prometheus (long-term storage, high availability, multi-cluster querying) illustrates a healthy pattern in open-source ecosystem evolution: rather than Prometheus itself needing to solve every possible deployment scale's needs directly, the broader ecosystem developed complementary, composable extensions addressing specific, well-understood limitations, letting Prometheus's core remain focused and simple while the ecosystem as a whole scaled to meet more demanding requirements. Lesson: a tool doesn't need to solve every conceivable scaling requirement itself — a well-defined core with clear extension points can enable a healthy ecosystem of complementary projects addressing specific needs the core deliberately left unaddressed.
`,

  comparisons: `
| Aspect | Prometheus (pull-based) | StatsD/push-based systems |
|--------|---------------------------|--------------------------------|
| Collection model | Prometheus scrapes targets | Applications push metrics to a collector |
| Target health detection | Direct (a failed scrape is immediately actionable) | Indirect (no data could mean many things) |
| Application complexity | Simpler (just expose /metrics) | Requires push scheduling/batching logic in-app |
| Short-lived job support | Requires Pushgateway (an exception) | Natively well-suited |
| Dynamic environment fit | Excellent, via service discovery | Requires the collector to be reachable from anywhere |

| Aspect | Base Prometheus | Thanos/Cortex/Mimir |
|--------|--------------------|---------------------------|
| Retention | Local storage, typically weeks | Long-term, often years, via object storage |
| Scaling | Single-node | Horizontally scalable, highly available |
| Multi-cluster querying | Requires federation (limited) | Native, first-class global query support |
| Best fit | Smaller, single-cluster deployments | Large-scale, multi-cluster, long-retention needs |

**How seniors choose**: use Prometheus's default pull-based model for virtually all monitoring needs, reserving the Pushgateway specifically for genuinely short-lived batch jobs; use base Prometheus alone for smaller, single-cluster deployments with modest retention needs, extending with Thanos/Cortex/Mimir only when genuine long-term retention, high availability, or multi-cluster querying needs justify the added operational complexity.
`,

  "related-technologies": `
- **Metrics** — the theoretical foundation Prometheus concretely implements; covered alongside this skill.
- **Grafana** — the dominant visualization layer built atop Prometheus (and other data sources), covered in its own skill.
- **OpenTelemetry** — the modern, vendor-neutral instrumentation standard increasingly used alongside Prometheus as a backend, covered in its own skill.
- **Kubernetes** — the platform whose adoption trajectory closely tracked and shaped Prometheus's own, with deep, native service-discovery integration.
- **Thanos, Cortex, Mimir** — long-term storage and multi-cluster querying extensions addressing base Prometheus's acknowledged limitations.

Learning path: **Metrics** → this page → **Grafana** for visualization → **OpenTelemetry** for the unifying instrumentation standard.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Prometheus remains the de facto standard metrics system for Kubernetes-based and broader cloud-native infrastructure, with continued strong adoption of the kube-prometheus-stack as a standard starting point.
- Continued growth of OpenTelemetry-based instrumentation feeding into Prometheus as a backend, rather than applications using Prometheus's own original client libraries directly, reflecting the broader industry shift toward vendor-neutral instrumentation standards.
- Continued maturation of Thanos, Cortex, and Mimir for long-term storage and multi-cluster querying needs, with growing adoption particularly among larger, multi-region deployments.
- Given the pace of change in the cloud-native observability ecosystem, verify current version-specific features and best-practice recommendations against Prometheus's own official documentation.
`,

  "future-roadmap": `
Where Prometheus is heading, and what's worth betting career time on:

- **Continued dominance as the standard metrics backend/query layer for cloud-native infrastructure**, likely remaining foundational even as instrumentation increasingly happens via OpenTelemetry rather than Prometheus-specific client libraries directly.
- **Continued maturation of the long-term storage ecosystem** (Thanos, Cortex, Mimir), addressing Prometheus's acknowledged single-node limitations for organizations with genuine scale requirements.
- **Growing integration with AI/LLM application monitoring needs**, applying Prometheus's metric types and PromQL directly to token usage, inference latency, and cost tracking for AI infrastructure.
- **What to bet on**: deeply understanding PromQL, the pull-based collection model's operational implications, and cardinality management — these transfer directly to any Prometheus-compatible system (including managed services exposing a Prometheus-compatible query interface), a far more durable investment than familiarity with any single dashboard tool's specific configuration syntax.
`,

  "cheat-sheet": `
~~~
# ---- Pull-based model: Prometheus scrapes YOU, you don't push ----
# App exposes /metrics -> Prometheus scrapes it every scrape_interval (e.g. 15s)

# ---- Basic PromQL ----
http_requests_total                          # raw counter (rarely useful alone)
rate(http_requests_total[5m])                 # per-second rate -- handles counter resets correctly
sum(rate(http_requests_total[5m])) by (job)    # aggregate across instances
histogram_quantile(0.95, rate(bucket[5m]))      # CORRECT percentile calc (never average raw %iles!)
~~~

~~~yaml
# ---- Alerting rule: ALWAYS use "for" to avoid false alarms on blips ----
- alert: HighErrorRate
  expr: rate(http_requests_total{status="500"}[5m]) > 0.05
  for: 5m   # sustained, not a single blip

# ---- Recording rule: pre-compute expensive/frequent aggregations ----
- record: job:http_requests:rate5m
  expr: sum(rate(http_requests_total[5m])) by (job)

# ---- Alertmanager: dedup, group, route (a SEPARATE concern from evaluation) ----
route:
  group_by: [alertname, cluster]
  routes:
    - match: {severity: critical}
      receiver: pagerduty
~~~

~~~
# ---- Kubernetes service discovery -- NEVER hardcode static targets ----
scrape_configs:
  - job_name: pods
    kubernetes_sd_configs: [{role: pod}]

# ---- When to extend beyond base Prometheus ----
# Long retention / multi-cluster query / HA needed -> Thanos, Cortex, or Mimir
# Otherwise: base Prometheus alone is genuinely sufficient

# ---- Pushgateway: ONLY for genuinely short-lived batch jobs ----
# Never use it as a substitute for direct scraping of long-running services

# ---- THE #1 failure mode: cardinality explosion ----
# Monitor: prometheus_tsdb_head_series
# Fix: redesign labels to be bounded, not adding more Prometheus capacity
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Prometheus's core collection model? | Pull-based -- Prometheus scrapes each target's /metrics endpoint periodically. |
| Why pull instead of push? | Direct target-health detection (a failed scrape is immediately actionable). |
| What does rate() do? | Per-second rate of a counter's increase, correctly handling restarts/resets. |
| Correct way to compute percentiles? | histogram_quantile() on aggregated bucket data -- NEVER average raw %iles. |
| Why always add "for" to alerting rules? | Prevents false alarms from brief, single-evaluation-cycle blips. |
| What does a recording rule do? | Pre-computes an expensive/frequent query, storing the result as a new metric. |
| Alertmanager's job? | Dedup, group, and route fired alerts -- separate from Prometheus's own evaluation. |
| When do you need Thanos/Cortex/Mimir? | Genuine long-term retention, multi-cluster query, or HA needs -- not by default. |
| What is the Pushgateway for? | ONLY genuinely short-lived batch jobs completing before a scrape could occur. |
| #1 Prometheus failure mode? | Cardinality explosion -- fix by redesigning labels, not adding capacity. |
| How to monitor targets in dynamic environments? | Kubernetes service discovery, NEVER static target lists. |
| Prometheus's biggest scaling limitation? | Single-node by default -- no native horizontal scaling or clustering. |
`,

  mcqs: `
1. What is Prometheus's core metric collection model?
   A) Push-based, applications send data to Prometheus  B) Pull-based, Prometheus scrapes each target's /metrics endpoint  C) Both equally by default  D) Neither -- it uses a database trigger
   **Answer: B** — a deliberate architectural choice enabling direct target-health detection.

2. Why is histogram_quantile the correct way to compute percentiles in Prometheus?
   A) It's faster to type  B) It aggregates the underlying histogram bucket counts across instances before computing the percentile, avoiding the mathematically meaningless averaging-percentiles fallacy  C) It only works with counters  D) It requires no configuration
   **Answer: B** — directly connecting to the Metrics skill's own coverage of this exact pitfall.

3. Why should an alerting rule typically include a "for" duration?
   A) It's required by PromQL syntax  B) To require the condition be sustained before firing, preventing false alarms from brief, transient blips  C) It makes the query run faster  D) It has no real effect
   **Answer: B** — without it, a single-evaluation-cycle blip triggers an alert.

4. What is a recording rule used for?
   A) Recording video of dashboards  B) Pre-computing an expensive or frequently-queried aggregation periodically, storing the result as a simpler metric  C) Logging every scrape  D) Backing up Prometheus's database
   **Answer: B** — avoids repeatedly recomputing the same expensive query on every access.

5. When should Thanos, Cortex, or Mimir be added to a Prometheus deployment?
   A) Always, by default, for every deployment  B) When genuine long-term retention, multi-cluster querying, or high-availability needs justify the added complexity beyond base Prometheus's single-node limitations  C) Never, they are deprecated  D) Only for local development
   **Answer: B** — over-engineering these extensions for a small, single-cluster deployment is a real anti-pattern.

6. What is the Pushgateway specifically designed for?
   A) A general-purpose alternative to scraping for all services  B) Genuinely short-lived batch jobs that might complete before Prometheus's normal scrape interval could reach them directly  C) Storing long-term historical data  D) Replacing Alertmanager
   **Answer: B** — using it for long-running services defeats Prometheus's pull-based target-health-detection benefit.
`,

  "revision-notes": `
Prometheus is the de facto standard open-source metrics collection and alerting system for Kubernetes-based and broader cloud-native infrastructure, implementing the metric types (counter, gauge, histogram) and design principles covered in the **Metrics** skill as a concrete, production-grade tool. Its most defining, deliberate architectural choice is a PULL-BASED collection model — Prometheus itself periodically scrapes each monitored target's exposed /metrics HTTP endpoint, rather than applications pushing metrics to a central collector — chosen specifically because it lets Prometheus directly and immediately detect target unavailability (a failed scrape is inherently, clearly actionable) and centralizes collection configuration control within the monitoring system itself rather than requiring every application to manage its own push logic.

PromQL is Prometheus's purpose-built query language: rate() computes a counter's per-second rate of increase over a time window, correctly handling counter resets from application restarts; sum(), avg(), and similar aggregation functions combine data across instances/labels; and CRITICALLY, histogram_quantile() is the CORRECT way to compute percentiles, since it aggregates a histogram's underlying BUCKET COUNTS across instances (correctly, since counts are simple additive values) before computing the percentile from the combined data — averaging pre-computed percentile VALUES from separate instances directly is mathematically meaningless, a well-documented pitfall directly connecting to the **Metrics** skill's own treatment of this exact issue.

ALERTING RULES combine a PromQL expression with a threshold and, critically, a "for" DURATION — requiring the condition to be sustained for that duration before actually firing, preventing false alarms from brief, single-evaluation-cycle blips that would otherwise trigger unnecessary alerts. ALERTMANAGER is a separate, companion component handling what happens AFTER an alert fires: grouping related alerts together (avoiding a flood of individually-notified, related notifications), deduplicating repeated firings, and routing different alert types to appropriate notification channels based on configurable rules (severity-based routing to PagerDuty versus Slack, for instance) — this separation of concerns (Prometheus evaluates conditions, Alertmanager handles notification logistics) lets each be configured and reasoned about independently.

RECORDING RULES pre-compute expensive or frequently-queried aggregations periodically, storing the result as a new, simpler metric — avoiding the cost of repeatedly recomputing the same complex query on every dashboard load or alert evaluation, a genuine production-scale optimization. SERVICE DISCOVERY (particularly Kubernetes-native service discovery, via kubernetes_sd_configs) is essential in any dynamic environment, automatically finding and monitoring new service instances as they're created without manual reconfiguration — static target lists go stale almost immediately in genuinely dynamic, auto-scaling infrastructure.

Base Prometheus has a genuine, acknowledged architectural limitation: it's SINGLE-NODE by default, without native horizontal scaling, indefinite long-term retention, or multi-cluster high availability — addressed by dedicated extension projects (THANOS, CORTEX, MIMIR) that layer long-term, object-storage-backed retention and global multi-cluster querying atop base Prometheus instances. These extensions should be adopted specifically when genuine retention, scale, or multi-cluster needs justify their added operational complexity, not by default for every deployment regardless of actual requirements — over-engineering this for a small, single-cluster deployment is a real, recognized anti-pattern. The PUSHGATEWAY is a narrow, deliberate exception to Prometheus's otherwise strict pull-based philosophy, existing specifically for genuinely short-lived batch jobs that might complete before a normal scrape could reach them directly — it should not be used as a general-purpose substitute for direct scraping of long-running services, since doing so defeats the pull model's genuine target-health-detection benefit.

CARDINALITY EXPLOSION (covered in depth in the **Metrics** skill) remains Prometheus's single most common, most severe operational failure mode — every unique label combination creates a genuinely separate time series, and an unbounded label (a raw user ID, a full URL) can cause Prometheus's memory and storage usage to grow combinatorially and unsustainably; the fix is redesigning labels around bounded, categorical dimensions from the start, monitored via Prometheus's own internal metrics (prometheus_tsdb_head_series), rather than simply adding more capacity to a system experiencing unbounded cardinality growth. A senior engineer designs Prometheus deployments with deliberate service discovery, bounded cardinality, well-tuned alerting (appropriate "for" durations, thoughtful Alertmanager grouping/routing), and extends storage only when genuine scale requirements justify the added complexity of Thanos, Cortex, or Mimir.
`,

  "learning-roadmap": `
**Week 1 — Pull-based collection and basic instrumentation**: understanding the scrape model, instrumenting an application with the Prometheus client library. Milestone: build and verify a scraped, instrumented application (Lab 1).

**Week 2 — PromQL fundamentals**: rate(), aggregation, and histogram_quantile for correct percentile calculation. Milestone: write a documented set of working PromQL queries against sample data (Lab 2).

**Week 3 — Alerting rules and Alertmanager**: designing rules with appropriate "for" durations, and configuring Alertmanager grouping/routing. Milestone: build and test a complete alerting pipeline using promtool (Lab 3).

**Week 4 — Recording rules and service discovery**: pre-computing expensive aggregations, and configuring Kubernetes-native service discovery. Milestone: deploy Prometheus with working Kubernetes service discovery and at least one recording rule (Lab 4).

**Week 5 — Cardinality management and production hardening**: identifying and fixing cardinality issues, and understanding when storage extensions are genuinely needed. Milestone: deliberately introduce and then diagnose/fix a cardinality problem using Prometheus's own internal metrics.

**Week 6 — Consolidation and connection to the broader observability stack**: understanding Prometheus's role alongside Grafana and OpenTelemetry, and the tradeoffs of storage extensions (Thanos/Cortex/Mimir). Milestone: design a complete monitoring architecture for a hypothetical multi-service, multi-cluster system, justifying every architectural decision.

Next platform skill once this roadmap is complete: **Grafana** for visualization atop Prometheus data, or **OpenTelemetry** for the unifying instrumentation standard.
`,

  "official-docs": `
- **Prometheus's official documentation** (prometheus.io/docs) — the comprehensive, authoritative reference for configuration, PromQL, and operational practice.
- **The Alertmanager official documentation** — covering routing, grouping, and notification configuration in depth.
- **The kube-prometheus-stack Helm chart documentation** — the practical reference for the most common Kubernetes-based Prometheus deployment pattern.
`,

  books: `
- **"Prometheus: Up and Running" — Brian Brazil** — the definitive, comprehensive practical guide to Prometheus, written by one of its core maintainers.
- **"Site Reliability Engineering" and "The Site Reliability Workbook" — Google** — cover the broader SLO/alerting practice Prometheus is commonly used to implement.
- **"Cloud Native Monitoring with Prometheus" — Mobolaji Ayinde** — a practical, hands-on guide focused specifically on Kubernetes-based Prometheus deployment.
`,

  blogs: `
- **The Prometheus project's own blog** — release announcements and best-practice guidance directly from the maintainers.
- **Grafana Labs's engineering blog** — extensive writing on Prometheus, Mimir, and the broader observability ecosystem, given Grafana Labs' deep involvement in this space.
- **Robust Perception's (a Prometheus-focused consultancy) blog** — detailed, practical PromQL and operational guidance.
`,

  "research-papers": `
Prometheus, as an industry/practitioner-driven open-source project rather than pure academic research, has limited dedicated peer-reviewed literature; the most relevant related sources:

- **Google's internal Borgmon documentation** (referenced in the SRE book) — the internal system that directly inspired Prometheus's design.
- See the **Metrics** skill's own research references for the broader theoretical grounding Prometheus's design implements concretely.
`,

  videos: `
- **PromCon (the official Prometheus conference) talks** — the primary venue for in-depth Prometheus technical content directly from the maintainer community.
- **Brian Brazil's talks and tutorials on Prometheus** — direct insight from a core maintainer and the author of the definitive Prometheus book.
- **KubeCon talks on Prometheus and the broader cloud-native observability ecosystem.**
`,

  "github-repos": `
- **prometheus/prometheus** — the official Prometheus source repository.
- **prometheus/alertmanager** — the official Alertmanager source repository.
- **prometheus-community/helm-charts** (specifically kube-prometheus-stack) — the most widely-used Kubernetes deployment chart.
- **thanos-io/thanos** — the official Thanos long-term storage/HA extension repository.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Basic instrumentation**: instrument a small application with counters, gauges, and histograms, verifying correct scraping by a local Prometheus instance.
2. **PromQL practice**: write queries computing request rate, error percentage, and correctly-aggregated p95/p99 latency.
3. **Alerting rule design**: design and test (via promtool) alerting rules with appropriate "for" durations for a set of hypothetical scenarios.
4. **Recording rule optimization**: given a set of expensive, frequently-run queries, convert them into appropriate recording rules.
5. **Cardinality diagnosis**: given a Prometheus instance experiencing performance degradation, use internal metrics to identify and fix the responsible high-cardinality label.
6. **External practice sets**: Prometheus's own official documentation examples and the kube-prometheus-stack's included dashboards/alerts for structured, guided practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Targets["Scrape Targets"]
        App1["Service A /metrics"]
        App2["Service B /metrics"]
        Exporter["node_exporter"]
    end
    subgraph Discovery["Service Discovery"]
        K8sSD["Kubernetes SD"]
    end
    subgraph Core["Prometheus Server"]
        Scraper["Scraper"]
        TSDB["Local TSDB"]
        RuleEngine["Rule Engine\n(alerting + recording rules)"]
    end
    subgraph Ecosystem["Surrounding Ecosystem"]
        Alertmanager["Alertmanager"]
        Grafana["Grafana"]
        Thanos["Thanos/Cortex/Mimir\n(optional long-term storage)"]
    end
    K8sSD --> Scraper
    App1 --> Scraper
    App2 --> Scraper
    Exporter --> Scraper
    Scraper --> TSDB
    TSDB --> RuleEngine
    RuleEngine --> Alertmanager
    TSDB --> Grafana
    TSDB --> Thanos
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Prometheus))
    Foundations
      Overview
      History SoundCloud Borgmon
      Why it exists
      Problem it solves
    Collection Model
      Pull based scraping
      Text exposition format
      Pushgateway exception
    PromQL
      rate function
      Aggregation
      histogram_quantile
      Subqueries
    Service Discovery
      Kubernetes SD
      Dynamic environments
    Alerting
      Alerting rules
      For duration
      Alertmanager grouping routing
    Recording Rules
      Pre computed aggregations
      Performance optimization
    Cardinality
      The number one failure mode
      Monitoring internal metrics
    Scaling Extensions
      Thanos Cortex Mimir
      Federation
      Long term storage
    Ecosystem
      Grafana visualization
      OpenTelemetry instrumentation
      Exporters
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default prometheus;
