import type { SkillContent } from "../types";

const kafka: SkillContent = {
  overview: `
Apache Kafka is a distributed event streaming platform built around a durable, ordered, append-only log — rather than a traditional message queue that removes a message once consumed (covered generally in the immediately-preceding **Message Queues** skill), Kafka retains events for a configured retention period, letting multiple independent consumers read the same stream of events at their own pace, and even replay historical events. This log-based architecture is a genuinely distinct design from RabbitMQ's broker model (covered in the next skill in this category), purpose-built for extremely high sustained throughput and for feeding many different downstream systems from the same durable event stream.

For an AI engineer, Kafka directly explains how a company can capture every user interaction event once and have it simultaneously feed a real-time recommendation system, a batch analytics pipeline, a fraud-detection service, and a data warehouse — each consumer reading the same durable stream independently, at its own pace, without the event producer needing any awareness of these downstream consumers. Kafka is also increasingly used as the backbone for real-time feature pipelines feeding machine learning models, and for streaming events into vector databases and other AI infrastructure.

Key characteristics: **the distributed commit log**, Kafka's core abstraction — an ordered, append-only, durable sequence of records; **topics and partitions**, the mechanism for organizing and horizontally scaling a stream of events, with ordering guaranteed only within a single partition; **consumer groups**, letting multiple consumer instances cooperatively and independently read a topic at their own pace, each maintaining their own position (offset); and **retention-based storage**, keeping events available for a configured duration (or indefinitely) rather than deleting them immediately upon consumption, enabling replay and multiple independent readers of the same historical data.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2010–2011 | Kafka is created at **LinkedIn** by Jay Kreps, Neha Narkhede, and Jun Rao, specifically to handle LinkedIn's need for a high-throughput, durable, replayable stream of activity and operational data feeding many different downstream systems |
| 2011 | Kafka is **open-sourced** and donated to the Apache Software Foundation, rapidly gaining adoption well beyond LinkedIn |
| 2012 | Kafka becomes a top-level **Apache project** |
| 2014 | **Confluent** is founded by Kafka's original creators, building a commercial platform and ecosystem (Schema Registry, Kafka Connect, ksqlDB) around open-source Kafka |
| 2016 | **Kafka Streams**, a stream-processing library built directly into the Kafka ecosystem, is released, letting developers build stream-processing applications without a separate processing framework |
| 2020 | **KIP-500** introduces **KRaft** (Kafka Raft), Kafka's own built-in Raft-based consensus implementation, beginning the removal of Kafka's historical dependency on Apache ZooKeeper for cluster coordination — directly connecting to the **Distributed Systems** skill's own treatment of Raft consensus |
| 2022–2024 | KRaft mode matures and becomes the default/recommended deployment mode for new Kafka clusters, with ZooKeeper-based deployments increasingly deprecated |
| 2020s | Kafka becomes foundational, near-ubiquitous infrastructure for event-driven architectures, real-time data pipelines, and increasingly, real-time feature pipelines for machine learning systems |

Kafka's history reflects a clear arc from a single company's (LinkedIn's) specific internal scaling need toward one of the most widely-adopted pieces of open-source distributed infrastructure globally, with its own internal architecture evolving significantly over time — notably its move from depending on ZooKeeper for coordination to KRaft, its own built-in Raft-based consensus implementation, directly demonstrating the **Distributed Systems** skill's own consensus concepts in a genuinely major, widely-used production system.
`,

  "why-it-exists": `
Kafka exists because LinkedIn found that traditional message queues, while well-suited to discrete task distribution, weren't well-suited to a different, increasingly important problem: capturing an extremely high-throughput stream of activity/event data ONCE and making it available to MANY different downstream consumers (search indexing, analytics, monitoring, and more), each potentially needing to read that same stream independently, at different times, and sometimes needing to replay historical events entirely.

A traditional queue's "remove once consumed" model doesn't naturally support this — once one consumer processes a message, it's gone, meaning each additional downstream system needing the same data would require its own separate delivery mechanism. Kafka's log-based architecture solves this by RETAINING events durably for a configurable period, letting any number of independent consumers read the same stream at their own pace, entirely decoupled from both the producer and from each other — directly extending the **Message Queues** skill's own publish-subscribe pattern, but adding genuine replay capability and dramatically higher sustained throughput as first-class architectural properties.
`,

  "problem-it-solves": `
Kafka solves the **"how do we capture an extremely high-throughput stream of events durably, once, and let many independent downstream systems consume that same stream at their own pace, including replaying historical events"** problem.

Concretely, it provides:

- **A durable, ordered, replayable event log**: events are retained for a configured period (or indefinitely), letting consumers read historical data, not just newly-arriving events.
- **Extremely high sustained throughput**: Kafka's architecture (sequential disk writes, efficient batching, zero-copy transfer) is purpose-built to sustain very high message rates, well beyond what many traditional brokers are optimized for.
- **Multiple independent consumers of the same stream**: any number of consumer groups can read the same topic independently, each maintaining its own position, without one consumer's processing affecting another's.
- **Horizontal scalability via partitioning**: a topic is split into multiple partitions, distributed across a cluster, letting both write and read throughput scale by adding more partitions and brokers.
- **A foundation for stream processing**: Kafka Streams and ksqlDB let developers build real-time processing applications directly against Kafka's event streams.

What Kafka does **not** solve, or solves differently than a traditional queue: Kafka's ordering guarantee is scoped to a SINGLE PARTITION, not an entire topic — achieving strict ordering across an entire topic isn't possible if throughput requires multiple partitions, a genuine, deliberate tradeoff; and Kafka is not always the right tool for simple, discrete task-distribution use cases where a traditional queue's simpler model (and richer routing capabilities, in RabbitMQ's case) may be a better, less operationally complex fit — this is precisely the comparison covered in depth in the **RabbitMQ** skill immediately following this one.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Kafka's core log-based architecture and how it differs from a traditional message broker.
2. Explain topics, partitions, and how partition count relates to both throughput and ordering guarantees.
3. Explain consumer groups, offsets, and how multiple consumers cooperatively read a topic.
4. Explain Kafka's replication model and how it provides fault tolerance.
5. Explain KRaft and Kafka's transition away from ZooKeeper dependency.
6. Recognize Kafka anti-patterns: too few partitions limiting throughput, ignoring consumer lag, misunderstanding ordering guarantees.
7. Compare Kafka to traditional message queues (RabbitMQ) and identify when each is the better fit.
8. Answer senior-level interview questions on partition strategy and consumer group design.
`,

  prerequisites: `
- **Required**: the **Message Queues** skill — Kafka directly builds on and extends the general asynchronous-messaging concepts covered there.
- **Required**: the **Distributed Systems** skill — Kafka's replication, partitioning, and (via KRaft) consensus mechanisms directly implement concepts covered there.
- **Very helpful**: the **Load Balancers** skill for the partitioning/sharding concepts Kafka's topic-partition model directly parallels.

Dependency chain: **Message Queues** → this page → **RabbitMQ** for the concrete message queue and event-streaming technologies covered in this category.
`,

  "beginner-concepts": `
### The basic idea: a durable, append-only log

~~~
Topic: "user_events"
Partition 0: [event1, event2, event3, event4, ...] (append-only)
~~~

A Kafka topic is conceptually an ordered, append-only log of events — new events are always added to the end, and existing events are never modified, only eventually removed once their configured retention period expires.

### Topics and partitions

~~~mermaid
flowchart LR
    Producer["Producer"] --> Topic["Topic: user_events"]
    Topic --> P0["Partition 0"]
    Topic --> P1["Partition 1"]
    Topic --> P2["Partition 2"]
~~~

A topic is split into multiple PARTITIONS, each an independent, ordered log — this is Kafka's core mechanism for horizontal scalability, letting a topic's total throughput scale by distributing partitions across multiple broker machines.

### Producers and consumers

~~~python
# Producing an event
producer.send("user_events", key="user_123", value={"action": "login"})

# Consuming events
for message in consumer.poll("user_events"):
    process(message)
~~~

Producers write events to a topic; consumers read events from a topic — Kafka's API is conceptually similar to the general message queue patterns covered in the **Message Queues** skill, but built on this distinct, durable log foundation.

### Consumer offsets: tracking position in the log

~~~
Consumer group "analytics_service" has consumed up to
offset 4521 in Partition 0 of topic "user_events" --
its next read continues from offset 4522.
~~~

Unlike a traditional queue where a consumed message is gone, Kafka tracks each consumer group's OFFSET (its current read position) separately from the log itself — the events remain in the log regardless, available for this consumer group to continue from where it left off, or for an entirely different consumer group to read from the very beginning.
`,

  "intermediate-concepts": `
### Ordering guarantees: per-partition, not per-topic

~~~
Within a SINGLE partition, Kafka guarantees strict ordering --
events are read in exactly the order they were written.
ACROSS partitions, there is NO ordering guarantee -- two
events in different partitions could be read in either order
relative to each other.
~~~

This is a critical, frequently-tested detail: if a use case genuinely needs strict ordering for a related set of events (all events for a given user, for instance), those events must be routed to the SAME partition — typically achieved by using a consistent partitioning key (like the user ID) when producing, so Kafka's default partitioning logic (hashing the key) consistently routes all of that key's events to the same partition.

### Consumer groups: cooperative, independent consumption

~~~mermaid
flowchart LR
    Topic["Topic (3 partitions)"] --> CG1P1["Consumer Group A,\nInstance 1: Partition 0"]
    Topic --> CG1P2["Consumer Group A,\nInstance 2: Partition 1"]
    Topic --> CG1P3["Consumer Group A,\nInstance 3: Partition 2"]
    Topic --> CG2["Consumer Group B\n(entirely separate,\nreads ALL partitions\nindependently)"]
~~~

Within a single CONSUMER GROUP, each partition is consumed by exactly ONE instance (directly paralleling point-to-point/competing-consumer semantics from the **Message Queues** skill) — this is how Kafka scales consumption horizontally, by adding more consumer instances up to the number of partitions. A DIFFERENT consumer group reads the SAME topic entirely independently, maintaining its own separate offsets — this is how Kafka supports multiple independent downstream systems consuming the same event stream (directly paralleling publish-subscribe semantics).

### Replication for fault tolerance

~~~
Each partition has a configured REPLICATION FACTOR (commonly 3)
-- one broker holds the LEADER replica (handling all reads/
writes for that partition), and the others hold FOLLOWER
replicas, continuously replicating the leader's data. If the
leader broker fails, a follower is promoted to become the new
leader, directly reusing the Distributed Systems skill's own
leader-follower replication concept.
~~~

### Retention: time-based or size-based

~~~
retention.ms = 604800000  (7 days)
retention.bytes = 1073741824  (1 GB per partition)
~~~

Events are retained until EITHER the configured time or size limit is reached, whichever comes first (for a given partition) — some topics are configured for effectively indefinite retention (or "compacted" retention, keeping only the latest value per key) when the full historical stream, or the latest state per key, needs to remain available indefinitely.
`,

  "advanced-concepts": `
### KRaft: Kafka's move away from ZooKeeper

~~~
Historically, Kafka depended on Apache ZooKeeper (a separate,
Paxos-inspired consensus system) for cluster metadata and
coordination (which broker is the controller, partition
leader elections). KRaft (Kafka Raft) replaces this with
Kafka's OWN built-in Raft-based consensus implementation
(directly connecting to the Distributed Systems skill's own
Raft treatment), removing the operational burden of running
and coordinating a separate ZooKeeper ensemble alongside
the Kafka cluster itself.
~~~

This is a genuinely significant architectural evolution, directly demonstrating the **Distributed Systems** skill's own Raft consensus concepts (leader election, majority-based commitment, odd node counts for fault tolerance) applied within one of the most widely-used pieces of distributed infrastructure globally.

### Exactly-once semantics in Kafka

~~~
Kafka provides IDEMPOTENT PRODUCERS (preventing duplicate
writes from producer retries) and TRANSACTIONAL writes
(atomically writing to multiple partitions/topics, and
atomically committing consumer offsets alongside produced
output in stream-processing scenarios) -- together, these
provide Kafka's own version of the "exactly-once" delivery
illusion covered in depth in the Distributed Systems and
Message Queues skills: genuinely at-least-once delivery
at the lowest level, combined with mechanisms ensuring
the END-TO-END observable effect behaves as exactly-once.
~~~

### Log compaction

~~~
A COMPACTED topic retains only the LATEST value for each
distinct key, rather than every historical event -- useful
for topics representing current STATE (e.g., a user's
current profile data) rather than a stream of discrete
events, letting a new consumer bootstrap the current state
of every key by reading the compacted log, without needing
every historical change that led to that state.
~~~

### Consumer lag: the critical operational metric

~~~
Consumer lag = (latest offset in a partition) -
               (a specific consumer group's current offset)

A growing lag means a consumer group is falling BEHIND the
rate at which new events are being produced -- directly
analogous to the Message Queues skill's own queue-depth/
backlog concept, but tracked per-partition, per-consumer-group.
~~~

### Kafka Streams and ksqlDB

~~~
Kafka Streams: a Java library for building stream-processing
    applications directly against Kafka topics (filtering,
    aggregating, joining streams) without a separate
    processing cluster.
ksqlDB: a SQL-like interface for defining stream-processing
    logic declaratively, built on top of Kafka Streams.
~~~

These let Kafka serve not just as a message transport, but as the foundation for genuine real-time stream-processing applications, directly relevant to real-time feature pipelines feeding machine learning models.
`,

  "internal-working": `
Tracing an event through Kafka's partition-leader replication and consumer-group consumption:

~~~mermaid
sequenceDiagram
    participant Producer
    participant Leader as Partition 0 Leader (Broker A)
    participant Follower as Partition 0 Follower (Broker B)
    participant ConsumerA as Consumer Group A
    participant ConsumerB as Consumer Group B

    Producer->>Leader: produce event (key="user_123")
    Leader->>Leader: append to local log
    Leader->>Follower: replicate
    Follower-->>Leader: ack
    Leader-->>Producer: ack (once replicated to enough followers)

    Note over ConsumerA,ConsumerB: Two SEPARATE consumer groups,\neach maintaining their own offset
    ConsumerA->>Leader: fetch from offset 4521
    Leader-->>ConsumerA: events from 4521 onward
    ConsumerB->>Leader: fetch from offset 100\n(much further behind, or replaying)
    Leader-->>ConsumerB: events from 100 onward
~~~

1. **A producer sends an event with a key** (user_123), which Kafka's default partitioner hashes to consistently determine which partition it's written to — ensuring all events for this same key land in the same partition, preserving their relative order.
2. **The partition's leader broker appends the event to its local log** and replicates it to follower brokers before acknowledging the producer (the exact acknowledgment threshold is configurable, trading durability guarantees against latency).
3. **Each consumer group independently fetches from its own tracked offset**, entirely decoupled from any other consumer group's own progress through the same log.

**Why this matters**: this concrete flow shows precisely how Kafka's log-based, offset-tracked architecture provides both fault tolerance (via replication) and genuine multi-consumer independence (via per-consumer-group offsets) simultaneously.
`,

  architecture: `
A senior engineer thinks about Kafka architecture in terms of choosing an appropriate partition count and partitioning key for both throughput and ordering needs, designing consumer groups around actual downstream independence requirements, and configuring replication and retention deliberately.

### Choosing partition count and partitioning key

~~~mermaid
flowchart TB
    Design["Topic design"] --> Q1{"Does a related set of\nevents need strict\nrelative ordering?"}
    Q1 -->|Yes| Key["Use a consistent\npartitioning key\n(e.g., user ID) so\nrelated events land\nin the same partition"]
    Q1 -->|No| NoKeyConstraint["Partition key choice\nis more about even\nload distribution"]
    Design --> Q2{"What's the target\nsustained throughput?"}
    Q2 --> PartitionCount["Choose a partition count\nsupporting that throughput\nacross available brokers,\nwith room to scale\nconsumer group parallelism"]
~~~

Partition count is a genuinely important, hard-to-change-later decision (increasing it later can disrupt existing key-to-partition ordering assumptions) — a senior engineer plans for reasonably anticipated future throughput and consumer parallelism needs from the start.

### Designing consumer groups around actual downstream independence

~~~mermaid
flowchart LR
    Topic["Topic: order_events"] --> AnalyticsGroup["Consumer Group:\nAnalytics Pipeline"]
    Topic --> FraudGroup["Consumer Group:\nFraud Detection"]
    Topic --> WarehouseGroup["Consumer Group:\nData Warehouse Sync"]
~~~

Each genuinely independent downstream system gets its OWN consumer group, letting it process the same event stream at its own pace, with its own failure/retry semantics, entirely decoupled from every other consumer group's own progress or health.

### Configuring replication and retention deliberately

A senior engineer sets a replication factor appropriate to the acceptable risk of broker failure (commonly 3, tolerating up to 2 broker failures while retaining data), and configures retention (time-based, size-based, or compacted) matched to the topic's actual purpose — a discrete event stream needing bounded retention versus a current-state topic benefiting from compaction.
`,

  "data-flow": `
Tracing multiple independent consumer groups reading the same topic at different rates, including one replaying from the beginning:

~~~mermaid
sequenceDiagram
    participant Topic as Topic: user_events (partition 0)
    participant RealTime as Consumer Group:\nReal-Time Dashboard
    participant Batch as Consumer Group:\nNightly Batch Analytics
    participant NewGroup as Consumer Group:\nNewly Added ML Feature Pipeline

    Note over Topic: Events continuously produced,\nretained per the topic's\nconfigured retention policy
    RealTime->>Topic: fetch from offset 9850\n(near the latest)
    Batch->>Topic: fetch from offset 9200\n(processes once nightly,\nfurther behind)
    NewGroup->>Topic: fetch from offset 0\n(brand new consumer,\nreplaying ALL retained history)
~~~

The critical detail: all three consumer groups read from the SAME underlying topic, completely independently, at their own pace and starting position — the newly-added ML feature pipeline consumer group can begin reading from the very beginning of the topic's retained history (offset 0) without requiring ANY special accommodation from the producer or from the other, already-established consumer groups, directly demonstrating Kafka's core value proposition of durable, replayable, multi-consumer event streaming.
`,

  "production-usage": `
### A representative Kafka producer/consumer configuration

~~~python
producer = KafkaProducer(
    bootstrap_servers=["broker1:9092", "broker2:9092"],
    acks="all",  # wait for all in-sync replicas to acknowledge
    enable_idempotence=True,
)
producer.send("user_events", key=b"user_123", value=event_data)

consumer = KafkaConsumer(
    "user_events",
    group_id="analytics_service",
    bootstrap_servers=["broker1:9092", "broker2:9092"],
    enable_auto_commit=False,  # commit offsets explicitly after processing
)
for message in consumer:
    process(message.value)
    consumer.commit()
~~~

### Non-negotiables for production Kafka usage

1. **Choose partition count deliberately upfront**, considering both target throughput and anticipated consumer parallelism.
2. **Use a consistent partitioning key** for any data needing relative ordering, ensuring related events land in the same partition.
3. **Monitor consumer lag explicitly**, the critical operational signal for whether consumer groups are keeping pace with production.
4. **Configure replication factor appropriately** (commonly 3) for the acceptable risk of broker failure.
5. **Commit consumer offsets only after successfully processing a message**, not before, to preserve at-least-once delivery semantics correctly.

### Common production patterns

- **Multiple independent consumer groups** reading the same topic for genuinely separate downstream purposes (analytics, fraud detection, data warehousing).
- **Kafka Streams or ksqlDB** for real-time stream processing directly against Kafka topics.
- **KRaft-based clusters** as the modern default, removing ZooKeeper's separate operational burden.
- **Log-compacted topics** for representing current state (user profiles, configuration) rather than discrete event history.
`,

  "industry-examples": `
- **LinkedIn**: Kafka's original creator and still a massive-scale user, processing enormous volumes of activity and operational data.
- **Netflix, Uber, Airbnb**: widely known for large-scale Kafka deployments underlying real-time data pipelines, event-driven microservices, and analytics infrastructure.
- **Confluent**: the commercial company founded by Kafka's original creators, providing a managed Kafka platform (Confluent Cloud) and ecosystem tooling (Schema Registry, Kafka Connect, ksqlDB).
- **AWS MSK (Managed Streaming for Kafka), Azure Event Hubs (Kafka-compatible)**: major cloud providers' managed Kafka-compatible offerings, reducing self-managed cluster operational burden.
- **Real-time ML feature pipelines**: an increasingly common pattern where Kafka streams user activity or transaction events directly into feature computation and model-serving infrastructure.
`,

  "best-practices": `
1. **Choose partition count deliberately upfront**, since changing it later can disrupt existing ordering guarantees for keyed data.
2. **Use a consistent partitioning key** for data needing relative ordering, ensuring related events land in the same partition.
3. **Monitor consumer lag explicitly**, the critical, standard operational signal for Kafka consumer health.
4. **Configure an appropriate replication factor** (commonly 3), balancing fault tolerance against storage/replication overhead.
5. **Commit offsets only after successful processing**, preserving correct at-least-once semantics.
6. **Design consumer processing idempotently**, since Kafka's default guarantee is at-least-once, directly reusing the **Message Queues** and **Distributed Systems** skills' own guidance.
7. **Use log compaction for current-state topics**, and time/size-based retention for discrete event-history topics, matched to each topic's actual purpose.
8. **Prefer KRaft over ZooKeeper-based deployments** for new clusters, removing the separate ZooKeeper operational burden.
9. **Give each genuinely independent downstream system its own consumer group**, preserving full independence between them.
10. **Use Kafka Streams or ksqlDB** for stream-processing needs rather than building custom, ad-hoc processing logic against raw Kafka consumers where a higher-level abstraction fits.
`,

  "anti-patterns": `
### Choosing too few partitions, capping future throughput and consumer parallelism

~~~
# WRONG — a topic created with just 1 partition, unable to
# scale consumer group parallelism beyond a single consumer
# instance no matter how much additional processing capacity
# is added
# RIGHT — choose a partition count with realistic headroom
# for anticipated future throughput and consumer scaling needs
~~~

### Misunderstanding Kafka's ordering guarantee scope

~~~
# WRONG — assuming ordering is guaranteed across an ENTIRE
# topic, when it's actually only guaranteed WITHIN a single
# partition; events for the same logical entity sent without
# a consistent partitioning key could land in different
# partitions and be processed out of order
# RIGHT — use a consistent partitioning key (e.g., user ID)
# for any data needing relative ordering guarantees
~~~

### Ignoring consumer lag until it becomes a significant incident

~~~
# WRONG — no monitoring or alerting on consumer lag, only
# discovering a consumer group has fallen significantly behind
# once downstream data staleness becomes a user-visible problem
# RIGHT — monitor and alert on consumer lag proactively,
# catching a growing lag well before it becomes a genuine incident
~~~

### Other production-grade anti-patterns

- **Committing consumer offsets before successfully processing a message**, risking silently skipping a message if processing fails after the commit.
- **Building non-idempotent consumers**, despite Kafka's at-least-once default delivery guarantee.
- **Running a ZooKeeper-dependent cluster for new deployments** where KRaft is now the recommended, simpler default.
- **Using Kafka for a genuinely simple, discrete task-distribution use case** where a traditional queue's simpler model would be a better operational fit.
`,

  performance: `
### Rule zero: Kafka's throughput advantage comes from sequential disk I/O and efficient batching

Kafka's architecture is specifically optimized for very high sustained throughput via sequential (rather than random) disk writes and reads, and efficient batching of both produce and consume operations — understanding and leveraging this is key to actually achieving Kafka's performance potential.

### The performance hierarchy (apply in order)

1. **Choose an adequate partition count** for target throughput, since partition count directly bounds maximum consumer group parallelism.
2. **Batch producer sends** where the workload allows it, amortizing per-request overhead and improving throughput.
3. **Tune acknowledgment configuration (acks)** deliberately, trading durability guarantees against produce latency for your specific use case.
4. **Monitor and address consumer lag proactively**, ensuring consumer processing throughput genuinely keeps pace with production rate.
5. **Profile actual broker and consumer resource utilization** under realistic load, rather than assuming a given partition/replication configuration's capacity without measurement.

### Micro-level facts worth knowing

- Kafka's reliance on sequential disk I/O (rather than random access) is a deliberate architectural choice specifically enabling its high throughput, even on spinning disks, though SSDs remain common in modern deployments.
- The acks="all" configuration (waiting for all in-sync replicas to acknowledge) provides the strongest durability guarantee at the cost of the highest produce latency; acks=1 (leader only) or acks=0 (fire-and-forget) trade durability for lower latency.
- Consumer group parallelism is fundamentally bounded by partition count — adding more consumer instances than partitions provides no additional parallelism, since a partition can only be consumed by one instance within a given consumer group at a time.
`,

  scalability: `
Kafka's partition-based architecture directly enables horizontal scalability for both producing and consuming extremely high-throughput event streams.

### How partitioning enables horizontal scaling

~~~mermaid
flowchart LR
    GrowingThroughput["Growing event throughput"] --> MorePartitions["Add more partitions,\ndistributed across\nmore brokers"]
    MorePartitions --> MoreConsumerParallelism["Consumer groups scale\nparallelism up to the\npartition count"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Consumer group parallelism capped by current partition count | Increase partition count (planned deliberately in advance, given its disruption to existing ordering) |
| A single broker's capacity exceeded | Add more brokers to the cluster, redistributing partition leadership |
| Consumer lag growing under sustained high production rate | Scale consumer instances up to the partition count; investigate consumer processing efficiency |
| Cross-datacenter replication latency for a globally-distributed deployment | Consider Kafka's MirrorMaker or Confluent's Replicator for deliberate, monitored cross-cluster replication |
`,

  security: `
### Kafka cluster access control

~~~
Kafka supports SASL/SSL-based authentication and ACL-based
authorization, controlling which clients (producers, consumers)
can access which topics -- essential for any Kafka deployment
carrying genuinely sensitive business data.
~~~

### Essential Kafka-related security practices

1. **Enable authentication (SASL) and encryption (SSL/TLS)** for inter-broker and client-broker communication in any production deployment.
2. **Apply topic-level ACLs**, ensuring only legitimate, authorized producers and consumers can access specific topics.
3. **Validate and sanitize message content on the consumer side**, treating Kafka message payloads as untrusted input, directly connecting to the **OWASP Top 10** skill's own input-validation guidance.
4. **Keep Kafka broker software patched**, since it's foundational infrastructure carrying potentially sensitive data across the organization.

See the **TLS & HTTPS** and **OWASP Top 10** skills for the broader security context this connects to.
`,

  testing: `
### Testing partition key consistency for ordering guarantees

~~~python
def test_events_for_same_user_land_in_same_partition():
    partitions = set()
    for _ in range(100):
        partition = compute_partition("user_123", num_partitions=10)
        partitions.add(partition)
    assert len(partitions) == 1  # consistently the same partition
~~~

### Testing consumer group independence

~~~python
def test_two_consumer_groups_read_independently():
    produce_events("test_topic", count=10)
    group_a_offset_before = get_offset("group_a", "test_topic")
    consume_n("group_a", "test_topic", n=5)
    group_b_offset = get_offset("group_b", "test_topic")
    assert group_b_offset == 0  # unaffected by group_a's consumption
~~~

### The senior testing doctrine

- Test partition-key consistency explicitly for any data with genuine relative-ordering requirements.
- Test idempotent consumer processing explicitly, since Kafka's default guarantee is at-least-once.
- Load-test with realistic production rates to verify partition count and consumer scaling genuinely keep pace with target throughput.
- Test consumer group independence explicitly, verifying multiple consumer groups reading the same topic don't interfere with each other's progress.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check consumer lag metrics first** when investigating delayed downstream processing or growing data staleness.
2. **Verify partition assignment and key consistency** if events expected to be strictly ordered appear out of order.
3. **Check broker and replication health** (in-sync replica count, under-replicated partitions) if produce latency or data availability seems degraded.
4. **Use Kafka's own tooling** (kafka-consumer-groups.sh, or equivalent monitoring integrations) to inspect consumer group offsets and lag directly.

### Debugging common Kafka-related symptoms

- "Downstream data is increasingly stale" — check consumer lag for the affected consumer group; investigate whether it's falling behind production rate.
- "Events for the same entity are processed out of order" — verify a consistent partitioning key is actually being used for that entity's events.
- "Produce latency has increased" — check the configured acks setting and broker/replication health (under-replicated partitions can slow acknowledgment).
- "A new consumer group isn't receiving expected historical data" — verify the topic's retention configuration actually retains data back to the desired starting point.
`,

  monitoring: `
### Key signals to track

- **Consumer lag per consumer group, per partition**, the single most critical operational signal for Kafka consumer health.
- **Under-replicated partition count**, indicating a replication/broker-health issue.
- **Broker resource utilization** (disk, network, CPU), since Kafka's throughput is directly bounded by broker capacity.
- **Produce/consume request latency**, verifying performance remains within expected bounds under actual production load.

### Tools

Kafka's own JMX metrics, exposed via standard monitoring integrations (Prometheus/Grafana being a common combination, directly connecting to the **Prometheus** and **Grafana** skills); Confluent Control Center or equivalent managed-platform monitoring dashboards; kafka-consumer-groups.sh for direct command-line offset/lag inspection.

### Alerting priorities

Alert on consumer lag exceeding an acceptable threshold for any genuinely latency-sensitive consumer group, on under-replicated partitions (indicating a broker or replication issue), and on broker resource utilization approaching capacity limits.
`,

  deployment: `
### Deploying a KRaft-based Kafka cluster (representative configuration)

~~~
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@broker1:9093,2@broker2:9093,3@broker3:9093
~~~

A KRaft-based cluster deployment uses Kafka's own built-in Raft consensus for controller election and metadata management, directly reusing the **Distributed Systems** skill's own guidance on odd node counts (here, for the controller quorum) for correct fault tolerance without ZooKeeper's separate operational overhead.

### CI/CD pipeline considerations

Treat topic schema (via a schema registry, where used) as a genuine, versioned contract between producers and consumers, with backward-compatibility verification as part of the deployment pipeline, since Kafka producers and consumers are frequently deployed independently. See the **CI/CD** skill for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production Kafka deployment takes real traffic:

- [ ] Partition count chosen deliberately, with realistic headroom for anticipated throughput and consumer parallelism
- [ ] Consistent partitioning key used for any data genuinely needing relative ordering
- [ ] Replication factor configured appropriately (commonly 3) for acceptable broker-failure risk
- [ ] Consumer lag monitoring and alerting in place for every consumer group
- [ ] Consumer processing designed idempotently, given Kafka's at-least-once default
- [ ] Retention policy (time-based, size-based, or compacted) matched deliberately to each topic's actual purpose
- [ ] Authentication and encryption enabled for inter-broker and client-broker communication
- [ ] Topic-level ACLs configured, restricting access to authorized producers/consumers only
- [ ] KRaft-based deployment used for new clusters, avoiding ZooKeeper's separate operational burden
`,

  "common-mistakes": `
1. **Choosing too few partitions upfront**, capping future consumer parallelism and throughput.
2. **Misunderstanding Kafka's per-partition (not per-topic) ordering guarantee**, leading to unexpected out-of-order processing for related events.
3. **Not monitoring consumer lag**, missing a growing backlog until downstream data staleness becomes a significant, user-visible problem.
4. **Committing offsets before successfully processing a message**, risking silently skipped messages on processing failure.
5. **Building non-idempotent consumers**, despite Kafka's at-least-once default delivery guarantee.
6. **Running new ZooKeeper-dependent deployments** where KRaft is now the recommended, operationally simpler default.
7. **Using Kafka for a genuinely simple task-distribution use case**, where a traditional queue (RabbitMQ) may be a better operational fit.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Consumer group falling increasingly behind | Consumer processing throughput insufficient for production rate | Scale consumer instances up to partition count; investigate processing efficiency |
| Events processed out of order | Missing a consistent partitioning key for related events | Use a consistent key (e.g., user ID) for data needing relative ordering |
| Elevated produce latency | acks="all" configuration combined with under-replicated partitions | Investigate replication/broker health; verify the acks setting matches genuine durability needs |
| A message appears to have been silently skipped | Offset committed before processing completed, then a failure occurred | Commit offsets only after successful processing |
| New consumer group can't access desired historical data | Topic retention configuration doesn't retain data back to the needed point | Adjust retention configuration, or use a compacted topic if only current state is needed |
| Cluster metadata/controller issues after a ZooKeeper upgrade | Continued reliance on ZooKeeper-based coordination | Migrate to KRaft for simplified, built-in consensus |
`,

  faqs: `
**How is Kafka different from a traditional message queue like RabbitMQ?**
Kafka retains events in a durable, ordered log for a configured retention period, letting multiple independent consumer groups read the same stream at their own pace and even replay historical events; a traditional queue typically removes a message once successfully consumed, meant to be processed once — a meaningfully different architectural model, covered in comparative depth in the **RabbitMQ** skill.

**What's the difference between a topic and a partition?**
A topic is the logical stream of events an application produces to and consumes from; a partition is one of the topic's underlying, independently-ordered physical logs — a topic is split into multiple partitions specifically to enable horizontal scalability across multiple brokers and consumer instances.

**Why is Kafka's ordering guarantee only within a single partition, not an entire topic?**
Because achieving strict ordering across an entire topic would require all events to pass through a single, serialized point, directly conflicting with the horizontal scalability multiple partitions provide — Kafka's design deliberately trades topic-wide ordering for partition-level ordering plus genuine horizontal scalability, requiring a consistent partitioning key for any data needing relative order.

**What is consumer lag, and why is it the critical Kafka operational metric?**
The difference between a partition's latest offset and a specific consumer group's current offset — a growing lag means that consumer group is falling behind the rate at which new events are being produced, directly analogous to a traditional queue's backlog/depth concept, but tracked per-partition, per-consumer-group.

**What is KRaft, and why did Kafka move away from ZooKeeper?**
KRaft (Kafka Raft) is Kafka's own built-in Raft-based consensus implementation for cluster metadata and coordination, replacing the historical dependency on a separate Apache ZooKeeper ensemble — removing the operational burden of running and coordinating two separate distributed systems, directly connecting to the **Distributed Systems** skill's own Raft consensus treatment.

**Can multiple consumer groups read the same Kafka topic independently?**
Yes — this is one of Kafka's core value propositions; each consumer group maintains its own separate offset into a topic's partitions, so any number of consumer groups can independently read the same underlying event stream, each at their own pace, without affecting each other.
`,

  "interview-questions": `
### Junior level

1. **What is a Kafka topic, and what is a partition?**
   Model answer: a topic is the logical named stream of events an application produces to and consumes from; a partition is one of the topic's underlying, independently-ordered physical logs, with a topic typically split into multiple partitions for horizontal scalability.

2. **What is a consumer group?**
   Model answer: a set of consumer instances cooperatively reading a topic, where each partition is consumed by exactly one instance within the group — different consumer groups read the same topic entirely independently.

3. **How does Kafka differ from a traditional message queue?**
   Model answer: Kafka retains events in a durable log for a configured retention period, allowing multiple independent consumers and replay of historical events; a traditional queue typically removes a message once consumed.

4. **What is consumer lag?**
   Model answer: the difference between a partition's latest offset and a specific consumer group's current offset, indicating how far behind that consumer group is from the current production rate.

### Senior level

5. **Explain precisely why Kafka's ordering guarantee is scoped to a single partition rather than an entire topic, and how you'd design around this for a use case needing strict per-entity ordering.**
   Model answer: strict topic-wide ordering would require serializing all writes and reads through a single point, directly conflicting with the parallelism multiple partitions (and correspondingly, multiple producer/consumer instances) provide — Kafka's design deliberately trades this topic-wide guarantee for both partition-level ordering AND genuine horizontal scalability; to design around this for a use case needing strict ordering per logical entity (e.g., all events for a given user must be processed in order), use a consistent partitioning key (the user ID) when producing, so Kafka's default partitioner consistently hashes that key to the same partition every time — ensuring all of that entity's events land in, and are therefore strictly ordered within, the same partition, while still allowing DIFFERENT entities' events to be distributed (and processed in parallel) across other partitions.

6. **How would you decide on an appropriate partition count when creating a new Kafka topic, and why is this decision harder to change later than it might first appear?**
   Model answer: base the initial partition count on realistic projections of both target sustained throughput (partition count directly bounds how much the cluster can parallelize both writes across brokers and reads across consumer group instances) and anticipated future consumer group parallelism needs (you can't usefully run more consumer instances within a single consumer group than there are partitions); increasing partition count later is disruptive specifically because Kafka's default partitioning is a hash of the message key modulo the CURRENT partition count — changing the partition count changes which partition a given key hashes to, meaning previously-produced events for a given key and newly-produced events for that SAME key could end up in different partitions after a partition-count change, breaking the very ordering guarantee that motivated using a consistent key in the first place; this is why partition count is typically treated as a decision to get right upfront, with reasonable headroom, rather than adjusted casually later.

7. **Explain how Kafka achieves fault tolerance through replication, and what happens when a partition's leader broker fails.**
   Model answer: each partition has a configured replication factor (commonly 3), with one broker holding the LEADER replica (handling all reads and writes for that partition) and the others holding FOLLOWER replicas that continuously replicate the leader's log; if the leader broker fails, Kafka's controller (coordinated via KRaft's Raft-based consensus, or historically via ZooKeeper) detects this and promotes one of the IN-SYNC follower replicas (a follower that has fully caught up with the former leader's log) to become the new leader — this directly reuses the **Distributed Systems** skill's own leader-follower replication and failover concepts, and the requirement that only an IN-SYNC replica be promoted (not an arbitrarily lagging one) is precisely what prevents data loss during this failover from silently dropping recently-committed events.

8. **A team observes that one of their Kafka consumer groups has a rapidly growing lag while other consumer groups reading the same topic remain healthy. How would you diagnose and address this?**
   Model answer: first confirm this is specific to the ONE affected consumer group and not a broader production-rate spike affecting all consumers equally (since other consumer groups remaining healthy suggests the issue is specific to this group's own processing, not the topic's overall input rate); investigate whether that specific consumer group's processing logic has recently slowed down (a recent deployment introducing a slower processing path, or a downstream dependency that consumer group relies on becoming slower) or whether it simply has too few consumer instances relative to the partition count to keep pace; if it's a processing-efficiency issue, investigate and fix the specific slowdown; if it's an under-provisioned consumer instance count, scale up to (at most) the partition count, since additional instances beyond the partition count provide no further parallelism benefit for that specific consumer group.

9. **Compare Kafka's exactly-once semantics guarantees to a traditional message queue's typical at-least-once guarantee, and explain what Kafka actually provides under the hood.**
   Model answer: Kafka provides IDEMPOTENT PRODUCERS (preventing a producer's own retries from creating duplicate writes to the log) and TRANSACTIONAL writes (letting a stream-processing application atomically write output to one or more topics AND commit its consumer offset for the input it processed, as a single atomic unit) — together, these let Kafka provide genuinely strong "exactly-once" semantics for Kafka-to-Kafka stream processing pipelines specifically; however, as covered in the **Distributed Systems** skill, true universal exactly-once delivery remains provably impossible in a general asynchronous system, and Kafka's exactly-once guarantee is specifically scoped to these particular mechanisms (idempotent production, transactional read-process-write cycles within Kafka) rather than being a blanket guarantee covering arbitrary external side effects a consumer might also perform (e.g., calling an external, non-transactional API as part of processing a message) — for those external effects, the consumer still needs its own idempotency handling, exactly as covered in the general **Message Queues** skill.

10. **When would you recommend Kafka over a traditional message queue like RabbitMQ, and vice versa, for a new system design?**
    Model answer: recommend Kafka when the use case genuinely needs a durable, replayable event log that multiple independent consumers (potentially added well after the events were originally produced) need to read, or when extremely high sustained throughput is a primary requirement, or when the architecture benefits from stream-processing capability (Kafka Streams/ksqlDB) directly against the event log; recommend a traditional queue like RabbitMQ when the use case is genuinely about discrete task distribution (a job should be processed once and then is done, not retained for replay), when rich message-routing logic (RabbitMQ's flexible exchange/binding model, covered in depth in its own skill) is genuinely needed, or when the operational simplicity of a more traditional broker model is preferable to Kafka's comparatively higher operational complexity (partition/replication/consumer-group management) for a use case that doesn't actually need Kafka's specific durability-and-replay strengths.
`,

  "coding-questions": `
### 1. Implement a simple consistent partitioner

~~~python
import hashlib

def compute_partition(key, num_partitions):
    hash_value = int(hashlib.md5(key.encode()).hexdigest(), 16)
    return hash_value % num_partitions
# Follow-up: what happens to a given key's partition assignment
# if num_partitions changes after this function has already been
# used to route events for that key -- and why does this matter
# for a topic where you rely on this key for ordering guarantees?
~~~

### 2. Implement a simple consumer offset tracker simulating consumer-group independence

~~~python
class ConsumerGroupOffsetTracker:
    def __init__(self):
        self.offsets = {}  # (group_id, partition) -> offset

    def get_offset(self, group_id, partition):
        return self.offsets.get((group_id, partition), 0)

    def commit(self, group_id, partition, offset):
        self.offsets[(group_id, partition)] = offset
# Follow-up: how would you extend this to support a NEW consumer
# group requesting to start from the EARLIEST available offset
# versus the LATEST (current) offset, and why would a real Kafka
# deployment need to account for log retention when honoring
# an "earliest" request?
~~~

### 3. Implement consumer lag calculation

~~~python
def calculate_consumer_lag(latest_offset_by_partition, group_committed_offsets):
    lag = {}
    for partition, latest in latest_offset_by_partition.items():
        committed = group_committed_offsets.get(partition, 0)
        lag[partition] = latest - committed
    return lag
# Follow-up: how would you use this per-partition lag information
# to decide whether a consumer group's CURRENT instance count is
# sufficient, or whether it needs to be scaled up?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Set up a local Kafka cluster and produce/consume events
Deploy a local, single-node Kafka cluster (KRaft mode), create a topic with multiple partitions, and write a simple producer and consumer, verifying events are correctly produced and consumed. Deliverable: a working local Kafka setup with verified produce/consume behavior. Skills exercised: basic Kafka setup and API usage.

### Lab 2 (Intermediate): Implement consistent partitioning and verify ordering
Produce events for multiple simulated "users," using a consistent partitioning key, and verify all events for the same user consistently land in the same partition and are consumed in order. Deliverable: a documented verification of per-key ordering. Skills exercised: partitioning key strategy and ordering verification.

### Lab 3 (Advanced): Implement and test multiple independent consumer groups
Set up two separate consumer groups reading the same topic, verify they maintain independent offsets and can be paused/resumed/replayed independently of each other, including having one group start from the earliest offset after the other has already consumed significant history. Deliverable: a documented demonstration of consumer group independence. Skills exercised: consumer group architecture and replay capability.

### Lab 4 (Production): Deploy a multi-broker cluster with replication and monitor consumer lag
Deploy a multi-broker Kafka cluster with a replication factor of 3, simulate a broker failure and verify partition leader failover, and set up consumer lag monitoring, verifying alerting triggers correctly under a simulated slow consumer scenario. Deliverable: a documented cluster deployment with verified failover and lag monitoring. Skills exercised: cluster architecture, fault tolerance, and operational monitoring.
`,

  "real-projects": `
### 1. A real-time analytics pipeline consuming user activity events
Engineering requirements: a high-throughput topic capturing user activity events, with a consistent user-ID partitioning key, feeding multiple independent consumer groups (real-time dashboard, nightly batch analytics, ML feature pipeline).

### 2. A microservices event bus using Kafka for inter-service communication
Engineering requirements: multiple microservices publishing domain events to shared topics, with each interested downstream service maintaining its own independent consumer group, and idempotent consumer processing throughout.

### 3. A real-time feature pipeline for a machine learning model serving system
Engineering requirements: Kafka Streams (or an equivalent stream-processing layer) computing real-time features from a raw event stream, feeding a model-serving system with low-latency, continuously-updated feature values.
`,

  "case-studies": `
### LinkedIn's creation of Kafka to solve its own specific, large-scale internal need
LinkedIn's engineering team found that existing messaging technologies at the time weren't well-suited to their need for an extremely high-throughput, durable, replayable stream of activity data feeding many different internal systems simultaneously — Kafka's creation and subsequent open-sourcing directly addressed this internal need, and its design proved general enough to become one of the most widely-adopted pieces of open-source distributed infrastructure globally. Lesson: solving a company's own genuine, large-scale internal engineering problem thoughtfully, with a sufficiently general and well-designed solution, can produce technology with value far beyond its original creator's specific context.

### Kafka's architectural migration from ZooKeeper dependency to KRaft
Kafka's multi-year effort (culminating in KRaft becoming the recommended default) to remove its historical dependency on a separate ZooKeeper ensemble for cluster coordination, replacing it with Kafka's own built-in Raft-based consensus implementation, represents a genuinely significant, carefully-executed architectural migration for widely-deployed production infrastructure — directly demonstrating the **Distributed Systems** skill's own Raft consensus concepts applied at massive real-world scale, and the substantial engineering discipline required to migrate foundational infrastructure without disrupting the enormous existing installed base depending on it. Lesson: even extremely widely-deployed, foundational infrastructure can undergo a genuinely fundamental architectural change (removing an entire separate coordination system dependency) when the operational benefit (simplified deployment, one less distributed system to coordinate) is compelling enough to justify the significant migration effort.

### The widespread adoption of Kafka for real-time ML feature pipelines
As machine learning systems increasingly require real-time or near-real-time features (rather than purely batch-computed ones), Kafka's durable, replayable event-streaming model has become a common, foundational choice for feeding feature computation pipelines — directly connecting Kafka's general-purpose event-streaming strengths (multiple independent consumers, replay capability, high sustained throughput) to a specific, increasingly important AI engineering use case. Lesson: a sufficiently general-purpose, well-designed piece of infrastructure (Kafka's event streaming model) can find significant new adoption in an application domain (real-time ML feature pipelines) that didn't even exist in its original creators' minds at the time of its design.
`,

  comparisons: `
| Aspect | Kafka | Traditional Message Queue (RabbitMQ) |
|--------|-----------|--------------------------------------------|
| Message retention | Durable log, retained for a configured period | Removed once successfully consumed |
| Multiple independent consumers | Native, via separate consumer groups | Requires separate queues/fan-out configuration |
| Replay capability | Yes — consumers can read from any retained offset | Generally no |
| Ordering guarantee | Per-partition | Per-queue (depending on configuration) |
| Best fit | High-throughput event streaming, multiple independent downstream systems | Discrete task distribution, rich routing logic |

| Aspect | ZooKeeper-based Kafka | KRaft-based Kafka |
|--------|----------------------------|-------------------------|
| Consensus mechanism | Separate ZooKeeper ensemble (Paxos-inspired) | Kafka's own built-in Raft implementation |
| Operational complexity | Two separate distributed systems to run and coordinate | One unified system |
| Status | Legacy, being deprecated | Recommended default for new clusters |

**How seniors choose**: default to Kafka when durable, replayable, high-throughput event streaming with multiple independent consumers is genuinely needed; default to a traditional queue (RabbitMQ, covered next) for simpler, discrete task-distribution needs; always deploy new Kafka clusters in KRaft mode, avoiding legacy ZooKeeper dependency.
`,

  "related-technologies": `
- **Message Queues** — the foundational asynchronous-messaging concepts this page directly extends with Kafka's durable, log-based architecture.
- **RabbitMQ** — covered next in this category, offering a genuinely different, broker-based architectural model worth directly comparing against Kafka.
- **Distributed Systems** — Kafka's replication and (via KRaft) Raft-based consensus directly implement concepts covered there.
- **Prometheus**, **Grafana** — commonly used for monitoring Kafka's own operational metrics (consumer lag, broker health).
- **Load Balancers** — shares the partitioning/sharding and consistent-hashing concepts with Kafka's own topic-partition model.

Learning path: **Message Queues** → this page → **RabbitMQ** for the concrete message queue and event-streaming technologies covered in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- KRaft has become the firmly established default and recommended deployment mode for new Kafka clusters, with ZooKeeper-based deployments increasingly deprecated across the ecosystem.
- Continued growth of Kafka's adoption for real-time ML feature pipelines and streaming AI application architectures.
- Continued maturity of the broader Kafka ecosystem (Kafka Streams, ksqlDB, Kafka Connect, Schema Registry) as an increasingly complete platform for event-driven and stream-processing architectures, not just raw message transport.
- Given continued evolution in this space, verify Kafka's current exact feature set and configuration recommendations against official Apache Kafka and Confluent documentation.
`,

  "future-roadmap": `
Where Kafka technology is heading, and what's worth betting career time on:

- **Continued, complete transition to KRaft-based deployments**, with ZooKeeper dependency becoming fully legacy across the ecosystem.
- **Continued growth of Kafka's role in real-time AI/ML feature pipelines**, as streaming architectures for machine learning systems mature further.
- **Continued maturity of the broader stream-processing ecosystem** (Kafka Streams, ksqlDB) built directly on Kafka's core log abstraction.
- **What to bet on**: deeply understanding the underlying architecture (partitions, consumer groups, offsets, replication, the ordering-guarantee scope) — these transfer directly across any specific Kafka distribution or managed service's current configuration syntax, a far more durable investment than memorizing one particular deployment's exact settings.
`,

  "cheat-sheet": `
~~~
# ---- Kafka's core model: a durable, append-only log ----
Topic -> split into PARTITIONS (independent, ordered logs)
Events RETAINED for a configured period, NOT removed on consume
~~~

~~~
# ---- Ordering: PER-PARTITION only, not per-topic ----
Same key -> same partition (via default hash partitioner)
-> strict order preserved for that key's events
Different partitions -> NO ordering guarantee across them
~~~

~~~
# ---- Consumer groups ----
Within ONE group: each partition -> exactly ONE instance
    (scales parallelism up to partition count)
DIFFERENT groups: read the SAME topic entirely independently,
    each with its own offset
~~~

~~~
# ---- Consumer lag = THE critical metric ----
lag = latest_offset - consumer_group's_committed_offset
Growing lag = consumer falling behind production rate
~~~

~~~
# ---- Replication for fault tolerance ----
replication.factor = 3 (commonly)
Leader handles reads/writes; followers replicate;
leader failure -> an in-sync follower is promoted
~~~

~~~
# ---- KRaft replaced ZooKeeper ----
Old: Kafka + separate ZooKeeper ensemble for coordination
New: Kafka's own built-in Raft consensus (KRaft) --
     one system instead of two, the modern default
~~~

~~~
# ---- Kafka vs traditional queue (RabbitMQ) ----
Kafka:    durable log, replayable, multi-consumer, high throughput
RabbitMQ: removed on consume, richer routing, simpler ops
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is a Kafka partition? | An independent, ordered log; a topic splits into partitions for horizontal scalability. |
| Where is Kafka's ordering guarantee scoped? | Per-partition only, not per-topic. |
| How do you get ordering for related events? | Use a consistent partitioning key so they land in the same partition. |
| What is a consumer group? | Cooperating consumers where each partition is read by exactly one instance. |
| Can two consumer groups read the same topic independently? | Yes — each maintains its own separate offset. |
| What is consumer lag? | latest offset minus a consumer group's committed offset — the key health metric. |
| How does Kafka provide fault tolerance? | Replication factor with leader/follower partitions; failover promotes an in-sync follower. |
| What is KRaft? | Kafka's own built-in Raft consensus, replacing the separate ZooKeeper dependency. |
| Kafka vs traditional queue, key difference? | Kafka retains events (replayable, multi-consumer); traditional queues remove on consume. |
| Why is partition count hard to change later? | Changing it changes which partition a key hashes to, breaking existing ordering assumptions. |
`,

  mcqs: `
1. What is Kafka's ordering guarantee scope?
   A) Guaranteed across an entire topic  B) Guaranteed only within a single partition  C) No ordering guarantee at all  D) Guaranteed only across an entire cluster
   **Answer: B** — a consistent partitioning key is required for relative ordering across related events.

2. How does Kafka fundamentally differ from a traditional message queue like RabbitMQ?
   A) Kafka is slower  B) Kafka retains events in a durable log allowing replay and multiple independent consumers; traditional queues remove messages once consumed  C) They are functionally identical  D) Kafka doesn't support multiple consumers
   **Answer: B** — a genuinely different architectural model.

3. What does consumer lag measure?
   A) Network latency  B) The difference between a partition's latest offset and a consumer group's committed offset  C) The number of partitions in a topic  D) Broker CPU usage
   **Answer: B** — the critical operational signal for whether a consumer group is keeping pace.

4. Why is choosing partition count upfront an important, hard-to-change-later decision?
   A) It's not important  B) Changing partition count later changes which partition a given key hashes to, potentially breaking existing ordering assumptions  C) Partition count can be changed freely with no consequences  D) It only affects storage cost
   **Answer: B** — a genuinely disruptive change for keyed, order-dependent data.

5. What is KRaft?
   A) A separate database  B) Kafka's own built-in Raft-based consensus implementation, replacing the historical ZooKeeper dependency  C) A message compression algorithm  D) A consumer group naming convention
   **Answer: B** — a significant architectural evolution directly connecting to the Distributed Systems skill's Raft treatment.
`,

  "revision-notes": `
Apache Kafka is a distributed event streaming platform built around a durable, ORDERED, APPEND-ONLY LOG — a fundamentally different architecture from a traditional message queue (RabbitMQ, covered in the next skill), which typically removes a message once successfully consumed. Kafka RETAINS events for a configurable retention period, letting MULTIPLE INDEPENDENT CONSUMER GROUPS read the same event stream at their own pace, and even REPLAY historical events — directly extending the **Message Queues** skill's publish-subscribe pattern with genuine durability and replay as first-class architectural properties.

A TOPIC is split into multiple PARTITIONS, each an independent, ordered log — this is Kafka's core mechanism for horizontal scalability, distributing partitions across brokers to scale both write and read throughput. A critical, frequently-tested detail: Kafka's ORDERING GUARANTEE IS SCOPED TO A SINGLE PARTITION, not an entire topic — achieving strict relative ordering for a related set of events (e.g., all events for a given user) requires using a CONSISTENT PARTITIONING KEY when producing, so Kafka's default hash-based partitioner consistently routes that key's events to the same partition every time; this is precisely why PARTITION COUNT is a decision worth getting right upfront — changing it later changes which partition a given key hashes to, potentially breaking previously-relied-upon ordering for that key.

A CONSUMER GROUP is a set of cooperating consumer instances, where each partition is consumed by exactly ONE instance within the group (directly paralleling competing-consumer/point-to-point semantics) — this bounds consumer group parallelism at the current partition count. Crucially, DIFFERENT consumer groups read the SAME topic entirely independently, each maintaining its own separate OFFSET (read position) — this is how Kafka supports multiple genuinely independent downstream systems (analytics, fraud detection, data warehousing) consuming the same event stream without any coordination or interference between them.

CONSUMER LAG (the difference between a partition's latest offset and a specific consumer group's current committed offset) is the single most critical Kafka operational metric — a growing lag directly indicates that consumer group is falling behind the current production rate, directly analogous to a traditional queue's own backlog/depth concept but tracked per-partition, per-consumer-group. REPLICATION (a configured replication factor, commonly 3, with one broker as LEADER and others as FOLLOWERS) provides fault tolerance — if a leader broker fails, an IN-SYNC follower is promoted, directly reusing the **Distributed Systems** skill's own leader-follower replication concepts.

A genuinely significant architectural evolution: KRAFT (Kafka Raft) replaced Kafka's historical dependency on a SEPARATE Apache ZooKeeper ensemble for cluster coordination with Kafka's OWN built-in Raft-based consensus implementation, directly demonstrating the **Distributed Systems** skill's Raft consensus concepts (leader election, majority-based agreement) applied within one of the world's most widely-used pieces of distributed infrastructure — KRaft is now the recommended default for new deployments, removing the operational burden of running and coordinating two separate distributed systems.

Kafka provides its own version of the "EXACTLY-ONCE" delivery illusion (covered generally in the **Distributed Systems** and **Message Queues** skills) via IDEMPOTENT PRODUCERS (preventing duplicate writes from producer retries) and TRANSACTIONAL writes (atomically committing output and consumer offsets together for stream-processing pipelines) — but this specific guarantee is scoped to Kafka-to-Kafka processing, not to arbitrary external side effects a consumer might also perform, which still require the consumer's OWN idempotency handling. LOG COMPACTION retains only the latest value per key (useful for current-STATE topics) as an alternative to time/size-based retention (better suited to discrete event-history topics).

A senior engineer chooses partition count deliberately with realistic future headroom, uses consistent partitioning keys for any data needing relative order, monitors consumer lag proactively across every consumer group, designs consumers idempotently despite Kafka's at-least-once default, and deploys new clusters in KRaft mode — reaching for Kafka specifically when durable, replayable, high-throughput, multi-consumer event streaming is genuinely needed, and considering a traditional queue (RabbitMQ, covered next) when simpler, discrete task distribution better fits the actual use case.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding topics, partitions, and basic producer/consumer usage. Milestone: complete Lab 1, with a working local Kafka setup.

**Week 2 — Ordering and partitioning strategy**: implementing and verifying consistent partitioning for ordering guarantees. Milestone: complete Lab 2, with documented verification of per-key ordering.

**Week 3 — Consumer groups**: implementing and testing multiple independent consumer groups, including replay from earliest offset. Milestone: complete Lab 3, demonstrating consumer group independence.

**Week 4 — Production architecture**: deploying a multi-broker cluster with replication, testing failover, and setting up consumer lag monitoring. Milestone: complete Lab 4, with verified failover and monitoring.

**Week 5 — Ecosystem and stream processing**: exploring Kafka Streams or ksqlDB for building a simple real-time stream-processing application against a Kafka topic.

Next platform skill once this roadmap is complete: **RabbitMQ**, covering a genuinely different, broker-based message queue architecture worth directly comparing against Kafka's log-based model.
`,

  "official-docs": `
- **Apache Kafka's official documentation** — the authoritative, comprehensive reference for Kafka's architecture, configuration, and APIs.
- **Confluent's official documentation** — extensive practical guidance and the broader Kafka ecosystem (Schema Registry, Kafka Connect, ksqlDB) reference.
- **KIP-500 (the KRaft proposal)** — the original design document for Kafka's migration away from ZooKeeper dependency.
`,

  books: `
- **"Kafka: The Definitive Guide" — Neha Narkhede, Gwen Shapira, Todd Palino** — written by Kafka's original creators and key contributors, the authoritative practical reference.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — covers Kafka and event streaming within the broader distributed systems context.
- **"Kafka Streams in Action" — Bill Bejeck** — a focused, practical guide to stream processing directly against Kafka.
`,

  blogs: `
- **Confluent's official engineering blog** — extensive, practical coverage of Kafka internals, best practices, and ecosystem tooling.
- **LinkedIn's engineering blog on Kafka's original creation and continued large-scale usage** — a foundational, firsthand account of Kafka's origin and evolution.
- **The original Kafka whitepaper and its authors' subsequent writing** — foundational technical context for the platform's design decisions.
`,

  "research-papers": `
- **Kreps, J., Narkhede, N., Rao, J. — "Kafka: a Distributed Messaging System for Log Processing"** (2011) — the original Kafka paper from LinkedIn.
- **KIP-500 and related KRaft design documents** — the technical design basis for Kafka's migration to built-in Raft-based consensus.
`,

  videos: `
- **Confluent's official conference talks (Kafka Summit) and tutorials** — extensive, practical, product-specific configuration and architecture guidance.
- **LinkedIn engineering talks on Kafka's origin and continued evolution** — detailed, firsthand accounts of Kafka's design motivation and scaling history.
- **System design interview preparation channels** covering Kafka and event streaming design as a common interview topic.
`,

  "github-repos": `
- **apache/kafka** — the official Apache Kafka source repository.
- **confluentinc/confluent-kafka-python** and similar client libraries — widely-used official client implementations across languages.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Partitioning strategy design**: given a described data model with entities needing relative ordering, design an appropriate partitioning key strategy.
2. **Partition count planning**: given projected throughput and consumer parallelism needs, calculate an appropriate initial partition count.
3. **Consumer group architecture design**: given a described set of independent downstream systems, design an appropriate consumer group structure.
4. **Consumer lag analysis**: given a described production rate and consumer processing time, calculate expected lag behavior and determine appropriate consumer instance scaling.
5. **External practice sets**: "Kafka: The Definitive Guide" practice scenarios and exercises covering Kafka architecture and operational decision-making.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Producers["Producers"]
        ProducerApp["Application"]
    end
    subgraph KafkaCluster["Kafka Cluster (KRaft)"]
        subgraph Topic["Topic: user_events"]
            P0["Partition 0\n(Leader + Followers)"]
            P1["Partition 1\n(Leader + Followers)"]
            P2["Partition 2\n(Leader + Followers)"]
        end
    end
    subgraph ConsumerGroups["Independent Consumer Groups"]
        Analytics["Analytics Pipeline"]
        Fraud["Fraud Detection"]
        MLPipeline["ML Feature Pipeline"]
    end
    ProducerApp --> P0
    ProducerApp --> P1
    ProducerApp --> P2
    P0 --> Analytics
    P1 --> Analytics
    P2 --> Analytics
    P0 --> Fraud
    P1 --> Fraud
    P2 --> Fraud
    P0 --> MLPipeline
    P1 --> MLPipeline
    P2 --> MLPipeline
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Kafka))
    Foundations
      Overview
      History LinkedIn Confluent KRaft
      Why it exists
      Problem it solves
    Core Architecture
      Topics
      Partitions
      Ordering per partition
      Offsets
    Consumer Model
      Consumer groups
      Competing consumers
      Independent consumer groups
      Consumer lag
    Reliability
      Replication leader follower
      KRaft consensus
      Exactly once semantics
      Log compaction
    Ecosystem
      Kafka Streams
      ksqlDB
      Schema Registry
      Kafka Connect
    Comparison
      Kafka vs traditional queue
      RabbitMQ next skill
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default kafka;
