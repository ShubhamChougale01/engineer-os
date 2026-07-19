import type { SkillContent } from "../types";

const rabbitmq: SkillContent = {
  overview: `
RabbitMQ is a widely-adopted, open-source message broker implementing the AMQP (Advanced Message Queuing Protocol) model — built around the concept of EXCHANGES that receive published messages and route them to QUEUES based on flexible, configurable routing rules, from which consumers ultimately retrieve and process them. Where the immediately-preceding **Kafka** skill covers a durable, log-based, replay-capable event streaming architecture, RabbitMQ represents the more traditional, broker-centric message queue model (covered generally in the **Message Queues** skill) — messages are typically removed once successfully consumed, and RabbitMQ's real strength lies in its rich, flexible routing capabilities and comparative operational simplicity for classic task-distribution use cases.

For an AI engineer, RabbitMQ directly explains how a production system can implement sophisticated routing logic (sending different types of background jobs to different specialized worker pools, or broadcasting a notification to multiple interested services with fine-grained routing key matching) without needing Kafka's log-retention model, and why RabbitMQ remains an extremely common choice for background task processing frameworks like Celery, where the priority is reliable, flexible task distribution rather than durable, replayable event streaming.

Key characteristics: **the exchange-queue-binding model**, AMQP's core routing abstraction — a producer publishes to an EXCHANGE, which routes the message to one or more bound QUEUES based on a BINDING (a routing rule); **exchange types** (direct, topic, fanout, headers), each providing a genuinely different routing pattern for different use cases; **message acknowledgment and requeueing**, RabbitMQ's mechanism for at-least-once delivery, directly connecting to the **Message Queues** and **Distributed Systems** skills' own treatment of this pattern; and **its contrast with Kafka**, since RabbitMQ generally removes messages once consumed (rather than retaining them in a durable log), making it a better fit for discrete task distribution than for durable, replayable event streaming.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2003 | The **AMQP specification effort** begins, aiming to create an open, vendor-neutral standard for message queuing, addressing lock-in concerns with earlier proprietary enterprise messaging middleware |
| 2007 | **RabbitMQ** is first released by Rabbit Technologies (a joint venture between LShift and CohesiveFT), implementing the AMQP model in Erlang — a language choice specifically motivated by Erlang's strong built-in support for concurrency and fault tolerance |
| 2010 | RabbitMQ is acquired by **SpringSource** (later part of VMware/Pivotal), accelerating its adoption, particularly within the Spring/Java ecosystem |
| 2010s | RabbitMQ becomes one of the most widely-deployed open-source message brokers globally, commonly paired with background task frameworks like **Celery** (Python) and used extensively in microservices architectures needing flexible routing |
| 2012 | RabbitMQ adds support for **additional protocols** beyond AMQP (STOMP, MQTT), broadening its applicability beyond its original AMQP-only design |
| 2010s–2020s | **RabbitMQ clustering and mirrored/quorum queues** mature significantly, addressing earlier limitations around high availability and data durability across broker failures |
| 2020s | RabbitMQ remains a dominant, actively-maintained choice specifically for classic message-queue use cases (task distribution, flexible routing), while Kafka has become the more common choice specifically for high-throughput, durable event streaming — the two technologies occupying meaningfully different, complementary niches within the broader messaging landscape |

RabbitMQ's history reflects the open-standard (AMQP) movement's direct, successful outcome — a genuinely robust, widely-adopted, vendor-neutral message broker implementation that has remained relevant and actively maintained for nearly two decades, even as newer architectural models (Kafka's log-based streaming) have emerged to address a genuinely different set of use cases.
`,

  "why-it-exists": `
RabbitMQ exists because, in the mid-2000s, message-oriented middleware was dominated by proprietary, vendor-specific products (like IBM's MQSeries), creating genuine vendor lock-in concerns and limiting interoperability between different organizations' and vendors' messaging systems. The AMQP standardization effort aimed to define an open, well-specified wire protocol for message queuing that any vendor could implement, and RabbitMQ emerged as one of the most successful, widely-adopted OPEN-SOURCE implementations of this open standard.

Beyond the open-standard motivation, RabbitMQ's specific architectural choices — Erlang's strong concurrency and fault-tolerance primitives as its implementation foundation, and AMQP's flexible exchange-based routing model — directly addressed a genuine, practical need: many real-world messaging use cases require more sophisticated ROUTING logic than a simple, flat queue provides (routing different message types to different specialized consumers, broadcasting to multiple interested parties with fine-grained filtering), and RabbitMQ's exchange/binding model provides this flexibility directly, natively, at the broker level — directly extending the **Message Queues** skill's general point-to-point and publish-subscribe patterns with a considerably richer, more configurable routing layer.
`,

  "problem-it-solves": `
RabbitMQ solves the **"how do we reliably deliver messages between producers and consumers with sophisticated, flexible routing logic, using an open, vendor-neutral protocol"** problem.

Concretely, it provides:

- **Flexible, broker-level routing** via exchanges and bindings, letting complex routing logic (route by exact key, by pattern matching, or broadcast to everyone) live in the broker's configuration rather than requiring custom application-level routing logic.
- **Reliable, at-least-once delivery** via message acknowledgment and requeueing, directly implementing the **Distributed Systems** skill's own delivery-guarantee concepts.
- **An open, standard protocol (AMQP)**, avoiding vendor lock-in and enabling interoperability across different client libraries and, in principle, different broker implementations.
- **Strong operational simplicity for classic task-distribution use cases**, compared to Kafka's comparatively higher operational complexity (partition/replication/consumer-group management) for use cases that don't actually need Kafka's specific durability-and-replay strengths.
- **Multiple protocol support** (AMQP, STOMP, MQTT) beyond its original AMQP-only design, broadening its applicability to different client ecosystems (MQTT being particularly relevant for IoT-style use cases).

What RabbitMQ does **not** solve, or solves differently than Kafka: RabbitMQ generally REMOVES a message once it's been successfully consumed and acknowledged, meaning it's not naturally suited to use cases needing durable event retention and replay for multiple independent, potentially-added-later consumers — this is precisely the gap Kafka's log-based architecture (covered in the immediately preceding skill) is purpose-built to fill; and RabbitMQ's throughput ceiling, while genuinely high, is generally not optimized for the same extreme, sustained-firehose throughput levels Kafka's sequential-log architecture specifically targets.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain AMQP's exchange-queue-binding model and how it differs from Kafka's topic-partition model.
2. Explain and choose between RabbitMQ's exchange types: direct, topic, fanout, and headers.
3. Explain message acknowledgment, requeueing, and dead-letter exchanges in RabbitMQ specifically.
4. Explain RabbitMQ clustering and quorum queues for high availability.
5. Recognize RabbitMQ anti-patterns: unbounded queue growth, missing dead-letter configuration, inappropriate exchange type choice.
6. Compare RabbitMQ and Kafka directly and choose the appropriate technology for a given use case.
7. Answer senior-level interview questions on exchange routing design and RabbitMQ high-availability architecture.
`,

  prerequisites: `
- **Required**: the **Message Queues** skill — RabbitMQ is a concrete implementation of the general asynchronous-messaging concepts covered there.
- **Required**: the **Kafka** skill (covered immediately before this page) — understanding Kafka's log-based model provides essential contrast for understanding RabbitMQ's genuinely different broker-based model.
- **Very helpful**: the **Distributed Systems** skill for the underlying delivery-guarantee and replication concepts RabbitMQ implements.

Dependency chain: **Message Queues** → **Kafka** → this page, completing the System Design category's concrete messaging-technology coverage.
`,

  "beginner-concepts": `
### The basic idea: exchanges, queues, and bindings

~~~mermaid
flowchart LR
    Producer["Producer"] --> Exchange["Exchange"]
    Exchange -->|binding| Queue1["Queue A"]
    Exchange -->|binding| Queue2["Queue B"]
    Queue1 --> Consumer1["Consumer 1"]
    Queue2 --> Consumer2["Consumer 2"]
~~~

A producer never publishes directly to a queue in RabbitMQ's AMQP model — it publishes to an EXCHANGE, which then routes the message to one or more bound QUEUES according to a BINDING (a routing rule) — consumers then retrieve messages from their specific queue.

### A simple RabbitMQ producer/consumer example

~~~python
channel.exchange_declare(exchange="orders", exchange_type="direct")
channel.queue_declare(queue="order_processing")
channel.queue_bind(exchange="orders", queue="order_processing", routing_key="new_order")

channel.basic_publish(exchange="orders", routing_key="new_order", body=order_data)

def callback(ch, method, properties, body):
    process_order(body)
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue="order_processing", on_message_callback=callback)
~~~

### Message acknowledgment

~~~
A consumer explicitly acknowledges a message (basic_ack) only
after successfully processing it. If the consumer disconnects
or crashes before acknowledging, RabbitMQ REQUEUES the message
for redelivery -- directly implementing the at-least-once
delivery pattern covered in the Message Queues skill.
~~~

### Messages are typically removed once consumed

~~~
Unlike Kafka, which retains events in a durable log for a
configured retention period, RabbitMQ generally REMOVES a
message from its queue once it has been successfully consumed
and acknowledged -- messages are meant to be processed once,
not replayed later.
~~~
`,

  "intermediate-concepts": `
### Direct exchange: exact routing-key matching

~~~mermaid
flowchart LR
    Producer["Producer"] --> DirectExchange["Direct Exchange"]
    DirectExchange -->|"routing_key=error"| ErrorQueue["Error Queue"]
    DirectExchange -->|"routing_key=info"| InfoQueue["Info Queue"]
~~~

A DIRECT exchange routes a message to any queue whose binding's routing key EXACTLY matches the message's routing key — a simple, precise routing model, well-suited to sending different message types to different specific queues.

### Fanout exchange: broadcast to every bound queue

~~~mermaid
flowchart LR
    Producer["Producer"] --> FanoutExchange["Fanout Exchange"]
    FanoutExchange --> QueueA["Queue A"]
    FanoutExchange --> QueueB["Queue B"]
    FanoutExchange --> QueueC["Queue C"]
~~~

A FANOUT exchange ignores the routing key entirely, delivering every message to EVERY bound queue — directly implementing publish-subscribe semantics (covered generally in the **Message Queues** skill), useful for broadcasting an event to multiple independent consumers.

### Topic exchange: pattern-based routing

~~~
Binding pattern: "orders.*.urgent"
Matches routing keys like: "orders.electronics.urgent",
    "orders.furniture.urgent"
Does NOT match: "orders.electronics.standard"
~~~

A TOPIC exchange routes based on WILDCARD PATTERN matching against the routing key (using * for exactly one word, # for zero or more words) — providing considerably more routing flexibility than a direct exchange's exact-match requirement, letting consumers subscribe to broad categories of related messages.

### Dead-letter exchanges

~~~
A queue can be configured with a DEAD-LETTER EXCHANGE, to
which messages are automatically routed if they're rejected,
expire (via a configured TTL), or exceed a configured
redelivery limit -- directly implementing the dead-letter
queue concept covered generally in the Message Queues skill,
specifically via RabbitMQ's own exchange-routing mechanism.
~~~
`,

  "advanced-concepts": `
### Headers exchange: routing based on message headers, not routing key

~~~
A HEADERS exchange routes based on matching MESSAGE HEADER
key-value pairs (rather than the routing key string), using
an "x-match" argument of "all" (every specified header must
match) or "any" (at least one must match) -- useful for
routing decisions based on multiple, independent message
attributes rather than a single hierarchical routing key.
~~~

### Clustering and quorum queues for high availability

~~~
RabbitMQ CLUSTERING lets multiple broker nodes form a single
logical cluster, sharing exchange/queue topology metadata.
QUORUM QUEUES (RabbitMQ's modern, Raft-based replicated queue
type, replacing the older "mirrored queues" approach) directly
implement the Distributed Systems skill's own Raft consensus
concepts, replicating a queue's messages across multiple
nodes and requiring a majority for a write to be considered
committed -- providing genuine fault tolerance if a node fails.
~~~

This is a direct, concrete application of the **Distributed Systems** skill's Raft consensus theory within RabbitMQ's own architecture, closely paralleling Kafka's own KRaft-based replication (covered in the **Kafka** skill) despite the two systems' otherwise quite different overall architectures.

### Priority queues

~~~
RabbitMQ supports PRIORITY QUEUES, where messages can be
assigned a priority level, and higher-priority messages are
generally delivered to consumers before lower-priority ones
still waiting in the same queue -- a capability not natively
present in Kafka's strictly-ordered, per-partition log model,
representing one of RabbitMQ's genuine differentiating
strengths for use cases needing this kind of prioritization.
~~~

### RabbitMQ versus Kafka: choosing deliberately

~~~mermaid
flowchart TB
    UseCase["A messaging use case"] --> Q{"Need durable,\nreplayable event log\nfor multiple independent\nconsumers added over time?"}
    Q -->|Yes| Kafka["Kafka's log-based\nmodel fits better"]
    Q -->|"No -- discrete task\ndistribution, or need\nrich routing/priority"| RabbitMQChoice["RabbitMQ's broker-based\nmodel fits better"]
~~~

This decision directly echoes the comparison covered in the **Kafka** skill's own treatment — a senior engineer chooses deliberately based on the use case's actual requirements (durable replay versus rich routing/task distribution), not by default habit or unexamined popularity.
`,

  "internal-working": `
Tracing a message through RabbitMQ's exchange-routing and acknowledgment mechanism, including a failed delivery and dead-letter routing:

~~~mermaid
sequenceDiagram
    participant Producer
    participant Exchange as Topic Exchange
    participant Queue as Bound Queue
    participant Consumer
    participant DLX as Dead-Letter Exchange

    Producer->>Exchange: publish (routing_key="orders.electronics.urgent")
    Exchange->>Exchange: match binding pattern\n"orders.*.urgent"
    Exchange->>Queue: route message
    Queue->>Consumer: deliver message
    Consumer->>Consumer: processing fails\n(explicit basic_nack, or crash)
    Queue->>Queue: check redelivery count\nagainst configured limit
    alt limit not exceeded
        Queue->>Consumer: redeliver
    else limit exceeded
        Queue->>DLX: route to dead-letter exchange
        DLX->>DLX: route to a dead-letter queue\nfor later investigation
    end
~~~

1. **The producer publishes with a routing key**, and the exchange (a topic exchange, in this example) evaluates it against every bound queue's binding pattern.
2. **A matching binding routes the message to its bound queue**, from which a consumer retrieves and attempts to process it.
3. **On processing failure**, RabbitMQ tracks the redelivery count against a configured limit — repeated failures beyond this limit route the message to a configured dead-letter exchange rather than retrying indefinitely.

**Why this matters**: this concrete flow shows how RabbitMQ's exchange-based routing model applies not just to the initial message delivery, but also to failure handling (dead-lettering), all configured declaratively at the broker level rather than requiring custom application logic.
`,

  architecture: `
A senior engineer thinks about RabbitMQ architecture in terms of choosing the right exchange type for a given routing need, configuring dead-letter handling and redelivery limits deliberately, and using quorum queues for genuinely critical, high-availability messaging needs.

### Choosing an exchange type deliberately

~~~mermaid
flowchart TB
    Need["A routing need"] --> Q1{"Exact match on\na single routing key?"}
    Q1 -->|Yes| Direct["Direct exchange"]
    Q1 -->|No| Q2{"Broadcast to\nEVERY bound queue?"}
    Q2 -->|Yes| Fanout["Fanout exchange"]
    Q2 -->|No| Q3{"Pattern/wildcard\nmatching on a\nhierarchical routing key?"}
    Q3 -->|Yes| Topic["Topic exchange"]
    Q3 -->|"No -- matching on\nmultiple independent\nheader attributes"| Headers["Headers exchange"]
~~~

### Configuring dead-letter handling and redelivery limits from the start

~~~mermaid
flowchart LR
    QueueDesign["Queue design"] --> DLXConfig["Configure a dead-letter\nexchange and an appropriate\nredelivery/TTL limit"]
    DLXConfig --> Monitoring["Monitor the dead-letter\nqueue for accumulated\nmessages needing investigation"]
~~~

### Using quorum queues for genuinely critical messaging needs

A senior engineer uses RabbitMQ's quorum queues (Raft-based replication) specifically for messaging use cases where message durability across a node failure is genuinely critical, accepting the modest additional overhead of replication for this reliability — reserving simpler, non-replicated queue configurations for less critical use cases where this overhead isn't justified.
`,

  "data-flow": `
Tracing a fanout-exchange broadcast to multiple independent services, directly paralleling the publish-subscribe pattern from the **Message Queues** skill:

~~~mermaid
sequenceDiagram
    participant OrderService as Order Service (Producer)
    participant Fanout as Fanout Exchange: order_events
    participant InventoryQueue as Inventory Queue
    participant EmailQueue as Email Queue
    participant AnalyticsQueue as Analytics Queue

    OrderService->>Fanout: publish "order_placed" event\n(routing key ignored by fanout)
    Fanout->>InventoryQueue: deliver
    Fanout->>EmailQueue: deliver
    Fanout->>AnalyticsQueue: deliver
    InventoryQueue->>InventoryQueue: consumer decrements stock
    EmailQueue->>EmailQueue: consumer sends confirmation
    AnalyticsQueue->>AnalyticsQueue: consumer records metrics
~~~

The critical detail: each of the three queues receives its OWN independent copy of the message, each consumed and acknowledged entirely separately — one queue's consumer crashing and requiring redelivery has zero effect on the other two queues' own independent processing, directly demonstrating how RabbitMQ's fanout exchange achieves the same fundamental decoupling benefit as Kafka's independent consumer groups, via a genuinely different underlying mechanism (separate physical queues per subscriber, rather than separate offsets into a shared log).
`,

  "production-usage": `
### A representative topic-exchange routing configuration

~~~python
channel.exchange_declare(exchange="logs", exchange_type="topic")

channel.queue_declare(queue="error_logs")
channel.queue_bind(exchange="logs", queue="error_logs", routing_key="*.error")

channel.queue_declare(queue="all_logs")
channel.queue_bind(exchange="logs", queue="all_logs", routing_key="#")

channel.basic_publish(exchange="logs", routing_key="payment.error", body=log_data)
# routed to BOTH error_logs (matches *.error) AND all_logs (matches #)
~~~

### Non-negotiables for production RabbitMQ usage

1. **Choose exchange type deliberately** based on the actual routing need (direct, topic, fanout, headers).
2. **Configure dead-letter exchanges with an appropriate redelivery limit**, preventing poison messages from being redelivered indefinitely.
3. **Design consumers idempotently**, since RabbitMQ's acknowledgment model provides at-least-once delivery, directly reusing the **Message Queues** skill's own guidance.
4. **Use quorum queues for genuinely critical messaging needs**, providing Raft-based replication and fault tolerance.
5. **Monitor queue depth explicitly**, catching a growing backlog before it becomes a genuine incident.

### Common production patterns

- **Celery (Python) background task processing** commonly built on top of RabbitMQ as its underlying broker.
- **Topic exchanges for flexible, hierarchical routing** (e.g., routing logs or events by service and severity).
- **Fanout exchanges for broadcasting events** to multiple independent microservices.
- **Quorum queues for genuinely critical messaging** needing durability across broker node failures.
`,

  "industry-examples": `
- **Celery**: a widely-used Python background task processing framework, very commonly deployed with RabbitMQ as its underlying message broker.
- **Many microservices architectures**: use RabbitMQ for inter-service event notification and task distribution, particularly where its flexible exchange/binding routing model provides genuine value.
- **IoT-oriented deployments**: leverage RabbitMQ's MQTT protocol support (in addition to AMQP) for lightweight device messaging.
- **CloudAMQP and other managed RabbitMQ hosting providers**: offer fully-managed RabbitMQ clusters, reducing self-managed broker operational burden, directly paralleling managed Kafka offerings.
`,

  "best-practices": `
1. **Choose the exchange type deliberately** (direct, topic, fanout, headers) based on the actual routing requirement, not by default habit.
2. **Configure dead-letter exchanges with an appropriate redelivery limit**, preventing indefinite redelivery of persistently-failing messages.
3. **Design consumers idempotently**, since RabbitMQ's acknowledgment model provides at-least-once, not exactly-once, delivery by default.
4. **Use quorum queues (Raft-based replication) for genuinely critical messages**, reserving simpler configurations for less critical use cases.
5. **Monitor queue depth and consumer health explicitly**, catching backlog growth or consumer failures early.
6. **Acknowledge messages only after successful processing**, never before, preserving correct at-least-once semantics.
7. **Use topic exchanges for hierarchical, pattern-based routing needs**, avoiding overly rigid direct-exchange configurations for genuinely flexible routing requirements.
8. **Choose RabbitMQ over Kafka deliberately** when discrete task distribution or rich routing is the actual need, not durable event replay.
`,

  "anti-patterns": `
### Choosing an inappropriate exchange type for the actual routing need

~~~
# WRONG — using a fanout exchange (broadcasting to every
# queue) when genuinely fine-grained, selective routing based
# on message content is needed, forcing every consumer to
# filter out irrelevant messages itself
# RIGHT — use a topic or headers exchange, letting the broker
# itself perform the selective routing declaratively
~~~

### Missing dead-letter exchange configuration

~~~
# WRONG — a queue with no dead-letter exchange configured,
# letting a persistently-failing (poison) message be redelivered
# indefinitely, potentially cycling forever between delivery
# and failure
# RIGHT — configure a dead-letter exchange and an appropriate
# redelivery limit, moving persistently-failing messages aside
# for investigation rather than endless retry
~~~

### Non-idempotent consumers assuming RabbitMQ provides exactly-once delivery

~~~python
# WRONG — assuming a message will never be redelivered,
# risking an incorrect duplicate effect if it is
def callback(ch, method, properties, body):
    charge_card(body["amount"])  # no idempotency check
    ch.basic_ack(delivery_tag=method.delivery_tag)

# RIGHT — idempotent, safe under RabbitMQ's actual at-least-once guarantee
def callback(ch, method, properties, body):
    if already_processed(body["idempotency_key"]):
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return
    charge_card(body["amount"])
    record_processed(body["idempotency_key"])
    ch.basic_ack(delivery_tag=method.delivery_tag)
~~~

### Other production-grade anti-patterns

- **Using RabbitMQ for a use case genuinely needing durable, replayable event streaming**, where Kafka's log-based model would be a meaningfully better fit.
- **Not using quorum queues for genuinely critical messages**, risking message loss on a broker node failure.
- **Not monitoring queue depth**, missing a growing backlog until it becomes a genuine, user-visible incident.
`,

  performance: `
### Rule zero: RabbitMQ's routing flexibility comes with a real, if generally modest, per-message routing-evaluation cost

Direct exchange matching is the cheapest; topic exchange pattern matching and headers exchange multi-attribute matching add modest additional per-message routing overhead — genuinely worth it for the flexibility they provide, but a real cost to be aware of at very high message rates.

### The performance hierarchy (apply in order)

1. **Choose the simplest exchange type that satisfies the actual routing need**, since simpler routing logic is generally cheaper to evaluate per message.
2. **Batch message acknowledgment** where the consumer's workload allows it, reducing broker round-trip overhead.
3. **Use quorum queues only where genuinely needed**, since replication adds real overhead compared to simpler, non-replicated queue configurations.
4. **Scale consumers horizontally** for a given queue, directly increasing processing throughput.
5. **Profile actual broker and consumer throughput** under realistic load, rather than assuming a given exchange/queue configuration's capacity without measurement.

### Micro-level facts worth knowing

- RabbitMQ's Erlang-based implementation provides strong built-in concurrency handling, well-suited to managing many simultaneous connections and queues efficiently.
- Quorum queues' Raft-based replication adds genuine write-latency overhead compared to simpler queue configurations, a deliberate, worthwhile tradeoff specifically for messages where durability across node failure genuinely matters.
- RabbitMQ's throughput ceiling, while high, is generally lower than Kafka's for the specific extreme-throughput, sequential-log-optimized use cases Kafka specifically targets — a genuine, deliberate architectural tradeoff for RabbitMQ's richer routing flexibility.
`,

  scalability: `
RabbitMQ supports horizontal scaling through clustering and through adding more consumer instances for a given queue.

### How RabbitMQ scales consumption and provides availability

~~~mermaid
flowchart LR
    Queue["A queue"] --> Consumer1["Consumer Instance 1"]
    Queue --> Consumer2["Consumer Instance 2"]
    Queue --> Consumer3["Consumer Instance 3"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single queue's consumer processing throughput insufficient | Scale consumer instances horizontally for that queue |
| Risk of message loss on a single broker node failure | Use quorum queues (Raft-based replication across a cluster) |
| Complex, hard-to-maintain routing logic scattered across consumers | Move routing logic into the broker via an appropriate exchange type (topic, headers) |
| Genuinely extreme, sustained-firehose throughput requirements | Consider Kafka's log-based architecture, purpose-built for this specific case |
`,

  security: `
### RabbitMQ access control

~~~
RabbitMQ supports user authentication and per-vhost/per-resource
permissions, controlling which users/applications can access
which exchanges, queues, and operations -- essential for any
production deployment carrying genuinely sensitive business data.
~~~

### Essential RabbitMQ-related security practices

1. **Enable TLS for client-broker and inter-node (clustering) communication** in any production deployment.
2. **Apply appropriate per-vhost and per-resource permissions**, ensuring only legitimate, authorized producers/consumers can access specific exchanges and queues.
3. **Validate and sanitize message content on the consumer side**, treating message payloads as untrusted input, directly connecting to the **OWASP Top 10** skill's own input-validation guidance.
4. **Keep RabbitMQ server software patched**, since it's foundational infrastructure potentially carrying sensitive data.

See the **TLS & HTTPS** and **OWASP Top 10** skills for the broader security context this connects to.
`,

  testing: `
### Testing exchange routing behavior

~~~python
def test_topic_exchange_routes_matching_pattern():
    publish(exchange="logs", routing_key="payment.error", body=data)
    assert message_received_by_queue("error_logs")
    assert message_received_by_queue("all_logs")

def test_topic_exchange_does_not_route_non_matching_pattern():
    publish(exchange="logs", routing_key="payment.info", body=data)
    assert not message_received_by_queue("error_logs")
~~~

### Testing dead-letter behavior

~~~python
def test_persistently_failing_message_moves_to_dead_letter_queue():
    poison_message = {"malformed": True}
    for _ in range(MAX_RETRIES):
        deliver_and_reject(poison_message)
    assert message_in_queue("dead_letter_queue", poison_message)
~~~

### The senior testing doctrine

- Test exchange routing behavior explicitly for every configured binding pattern, verifying messages route (and don't route) as intended.
- Test idempotent consumer behavior explicitly, simulating redelivery and verifying no incorrect duplicate effect occurs.
- Test dead-letter configuration explicitly, verifying a persistently-failing message is correctly moved after the configured limit.
- Test quorum queue failover behavior explicitly if used for critical messages, verifying data availability after a simulated node failure.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check RabbitMQ's management UI/API for queue depth and consumer count** first when investigating delayed processing.
2. **Verify exchange binding configuration** if messages appear to be routed to the wrong queue, or not routed at all.
3. **Check the dead-letter queue** for accumulated messages if a specific message type seems to be silently failing.
4. **Use distributed tracing** (the **Tracing** skill) to reconstruct a message's full path from producer through exchange routing to consumer processing.

### Debugging common RabbitMQ-related symptoms

- "Messages aren't reaching the expected queue" — verify the exchange type and binding pattern actually match the routing key being used.
- "A specific action seems to happen twice" — check consumer idempotency logic for the affected message type.
- "Messages accumulate in an unexpected queue" — check for an overly broad binding pattern unintentionally matching more routing keys than intended.
- "Queue depth is growing steadily" — check consumer count and processing throughput relative to incoming message rate; consider scaling consumers.
`,

  monitoring: `
### Key signals to track

- **Queue depth (message count)**, directly indicating whether consumers are keeping pace with incoming messages.
- **Consumer count and consumer utilization**, verifying adequate processing capacity for each queue.
- **Dead-letter queue message count**, indicating the rate of persistently-failing messages needing investigation.
- **Cluster/node health**, particularly for quorum queues, verifying replication and availability are functioning correctly.

### Tools

RabbitMQ's built-in management UI and HTTP API, providing detailed queue, exchange, and consumer metrics; Prometheus/Grafana integrations (directly connecting to the **Prometheus** and **Grafana** skills) for broader monitoring and alerting; distributed tracing for end-to-end message-path visibility.

### Alerting priorities

Alert on queue depth exceeding an acceptable threshold (a leading indicator of a capacity or consumer-health issue), on dead-letter queue message count growing unexpectedly, and on cluster node health issues affecting quorum queue availability.
`,

  deployment: `
### Deploying a RabbitMQ cluster with quorum queues

~~~
rabbitmqctl set_policy ha-quorum "^important\\." \\
  '{"queue-type":"quorum"}' --apply-to queues
~~~

This representative policy configures queues matching a naming pattern to use the quorum queue type, providing Raft-based replication across the cluster for genuinely critical messages.

### CI/CD pipeline considerations

Treat exchange/queue/binding topology as genuine, version-controlled infrastructure configuration, with automated validation as part of the deployment pipeline before any routing configuration change reaches production. See the **CI/CD** skill for the general deployment depth this builds on.
`,

  "production-checklist": `
Before a production RabbitMQ deployment takes real traffic:

- [ ] Exchange type chosen deliberately for each actual routing need
- [ ] Dead-letter exchanges configured with an appropriate redelivery limit for every queue
- [ ] Consumers designed idempotently, given RabbitMQ's at-least-once default delivery guarantee
- [ ] Quorum queues used for genuinely critical messages needing durability across node failure
- [ ] Queue depth and consumer health monitoring and alerting in place
- [ ] TLS enabled for client-broker and inter-node communication
- [ ] Per-vhost/per-resource permissions configured, restricting access to authorized producers/consumers
- [ ] Clustering configured appropriately for the deployment's actual availability requirements
`,

  "common-mistakes": `
1. **Choosing an inappropriate exchange type** for the actual routing need, forcing unnecessary application-level filtering.
2. **Missing dead-letter exchange configuration**, letting poison messages be redelivered indefinitely.
3. **Building non-idempotent consumers**, despite RabbitMQ's at-least-once default delivery guarantee.
4. **Not using quorum queues for genuinely critical messages**, risking message loss on a broker node failure.
5. **Not monitoring queue depth**, missing a growing backlog until it becomes a significant, user-visible incident.
6. **Using RabbitMQ for a use case genuinely needing durable, replayable event streaming**, where Kafka would be a meaningfully better architectural fit.
7. **Not configuring TLS and appropriate access controls**, leaving a genuinely sensitive messaging layer under-protected.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Messages not reaching the expected queue | Exchange type or binding pattern misconfiguration | Verify the exchange type and binding pattern match the actual routing key |
| A specific action happens more than once | Consumer isn't idempotent under at-least-once redelivery | Add idempotency-key-based deduplication to the consumer |
| Messages accumulate indefinitely, cycling failure/redelivery | Missing dead-letter exchange configuration | Configure a dead-letter exchange with an appropriate redelivery limit |
| Message loss after a broker node failure | Non-replicated (classic) queue used for a genuinely critical message type | Migrate to a quorum queue for that message type |
| Growing, unaddressed queue backlog | Consumer throughput insufficient for incoming message rate | Scale consumers horizontally for the affected queue |
| Unexpected messages appearing in an unrelated queue | Overly broad topic-exchange binding pattern | Tighten the binding pattern to match only the intended routing keys |
`,

  faqs: `
**What's the fundamental difference between RabbitMQ and Kafka?**
RabbitMQ implements the AMQP broker model, generally removing a message once successfully consumed and offering rich, flexible exchange-based routing; Kafka retains events in a durable, ordered log for a configured retention period, letting multiple independent consumers read the same stream and replay historical events — a meaningfully different architectural model suited to different use cases.

**What are RabbitMQ's exchange types, and when should I use each?**
Direct (exact routing-key match, for precise point-to-point-style routing), fanout (broadcast to every bound queue, for publish-subscribe), topic (wildcard pattern matching on a hierarchical routing key, for flexible category-based routing), and headers (matching on message header attributes rather than the routing key, for multi-attribute routing decisions).

**Does RabbitMQ guarantee exactly-once delivery?**
No — like most practical messaging systems (directly connecting to the **Distributed Systems** and **Message Queues** skills), RabbitMQ provides at-least-once delivery via acknowledgment and redelivery; consumers must be designed idempotently to handle occasional redelivery safely.

**What is a quorum queue, and why would I use one?**
RabbitMQ's modern, Raft-based replicated queue type, replicating a queue's messages across multiple cluster nodes and requiring majority agreement for a write to be committed — providing genuine fault tolerance for messages where durability across a broker node failure is genuinely critical, directly implementing the **Distributed Systems** skill's own Raft consensus concepts.

**When should I choose RabbitMQ over Kafka, or vice versa?**
Choose RabbitMQ for discrete task distribution or when rich, flexible routing logic (topic patterns, header matching, priority queues) is genuinely needed, especially where operational simplicity is valued; choose Kafka when durable, replayable event streaming for multiple independent consumers (potentially added well after events were originally produced), or extremely high sustained throughput, is the genuine requirement.

**Why is RabbitMQ commonly paired with Celery?**
Celery, a widely-used Python background task processing framework, needs a reliable message broker for distributing discrete task-processing jobs to worker processes — RabbitMQ's reliable at-least-once delivery and flexible routing directly fit this classic task-distribution use case well, making it one of Celery's most common broker choices.
`,

  "interview-questions": `
### Junior level

1. **What is an exchange in RabbitMQ's AMQP model?**
   Model answer: the component a producer publishes messages to; the exchange routes each message to one or more bound queues based on a configured binding/routing rule, rather than the producer publishing directly to a queue.

2. **What's the difference between a direct exchange and a fanout exchange?**
   Model answer: a direct exchange routes a message to queues whose binding's routing key exactly matches the message's routing key; a fanout exchange ignores the routing key entirely and delivers the message to every bound queue.

3. **Why do RabbitMQ consumers need to acknowledge messages?**
   Model answer: acknowledgment tells RabbitMQ a message was successfully processed and can be removed from the queue; if a consumer disconnects or crashes before acknowledging, RabbitMQ redelivers the message, providing at-least-once delivery reliability.

4. **What is a dead-letter exchange?**
   Model answer: an exchange messages are automatically routed to if they're rejected, expire, or exceed a configured redelivery limit, preventing indefinite redelivery of persistently-failing messages while preserving them for investigation.

### Senior level

5. **Explain the difference between RabbitMQ's topic exchange wildcard patterns (* and #) and design a binding configuration for routing application logs by both service name and severity.**
   Model answer: in a topic exchange, * matches EXACTLY one word in that position of a dot-separated routing key, while # matches ZERO OR MORE words; for routing logs with routing keys structured as "service.severity" (e.g., "payment.error", "auth.warning"), a binding pattern of "*.error" would match any service's error-level logs specifically, a binding of "payment.#" would match ALL of the payment service's logs regardless of severity (and even accommodate a future routing key with additional segments, like "payment.error.critical," since # matches zero or more words), and a binding of "#" would match every log message regardless of service or severity — this flexible, hierarchical pattern matching lets multiple genuinely different downstream consumers (a service-specific alerting queue, a global error-tracking queue, a full audit-log queue) each bind with a pattern precisely matching their own specific interest, all from the SAME underlying published events.

6. **How do RabbitMQ's quorum queues provide fault tolerance, and how does this directly relate to concepts covered in the Distributed Systems skill?**
   Model answer: a quorum queue replicates its messages across multiple nodes in a RabbitMQ cluster using a Raft-based consensus protocol — a write to the queue is only considered committed once a MAJORITY of the replica nodes have durably stored it, directly implementing the **Distributed Systems** skill's own Raft consensus and majority-based commitment concepts; if the node currently acting as the queue's leader fails, the remaining replica nodes elect a new leader from among those with fully up-to-date, committed data, ensuring no committed message is lost — this closely parallels Kafka's own KRaft-based replication (covered in the **Kafka** skill) despite RabbitMQ and Kafka otherwise being quite architecturally different systems, demonstrating that the same underlying consensus theory applies across genuinely different concrete messaging technologies.

7. **A team is deciding whether to use RabbitMQ or Kafka for a new system that needs to distribute image-processing jobs to a pool of worker instances, where each job should be processed exactly once (practically speaking, via idempotency) and doesn't need to be retained after processing. What would you recommend, and why?**
   Model answer: recommend RabbitMQ, since this is a classic, discrete task-distribution use case — each job needs to reach exactly one worker instance (a point-to-point pattern, naturally supported by a RabbitMQ queue with competing consumers), and there's no described need for durable retention or replay of already-processed jobs, meaning Kafka's core differentiating strength (a durable, replayable event log for multiple independent consumers) provides little additional value here while adding real, unnecessary operational complexity (partition/consumer-group management) relative to RabbitMQ's comparatively simpler broker model for this specific need; RabbitMQ's flexible routing (potentially useful if different image types need routing to differently-specialized worker pools via a topic exchange) is a further point in its favor for this specific scenario.

8. **Design a RabbitMQ-based notification system where a single event (e.g., "user_signed_up") needs to trigger a welcome email, a CRM update, and an analytics event — each handled by a completely separate, independently-deployed service.**
   Model answer: use a fanout exchange named something like "user_signed_up," with three separate, independently-bound queues — one for the email service, one for the CRM-update service, and one for the analytics service — each queue receiving its own independent copy of every published event; each of the three consuming services processes its own queue entirely independently, with its own acknowledgment, retry, and dead-letter configuration, meaning a failure or slowdown in, say, the CRM-update service's processing has zero effect on the email or analytics services' own independent processing; this directly mirrors the same publish-subscribe decoupling benefit covered generally in the **Message Queues** skill and concretely via Kafka's independent consumer groups in the **Kafka** skill, achieved here through RabbitMQ's fanout-exchange-to-multiple-queues mechanism instead.

9. **Explain why RabbitMQ consumers must be designed idempotently even though RabbitMQ provides message acknowledgment, and give a concrete failure scenario illustrating why.**
   Model answer: acknowledgment confirms successful processing to RabbitMQ, but a genuine race/failure window exists — a consumer could successfully complete its actual processing (e.g., charging a customer's card) and then crash, or experience a network partition, BEFORE its acknowledgment actually reaches the broker; from RabbitMQ's perspective, since no acknowledgment was received within the message's visibility/timeout window, the message is considered unacknowledged and will be redelivered (to the same or a different consumer instance) — but the original processing may have already fully completed and taken effect; without idempotency (checking whether this specific message's unique key has already been processed before applying its effect again), this redelivery would cause the customer to be charged a second time for the same transaction, a concrete, damaging illustration of why "the broker acknowledges messages" does not, by itself, eliminate the need for idempotent consumer design.

10. **Compare and contrast RabbitMQ's and Kafka's approaches to providing high availability, and explain what each system's approach has in common at a deeper level.**
    Model answer: RabbitMQ's modern high-availability approach (quorum queues) and Kafka's own replication approach (KRaft-based partition leader/follower replication) are, at a deeper level, both concrete applications of the SAME underlying Raft consensus theory covered in the **Distributed Systems** skill — both replicate data across multiple nodes, both require a majority of replicas to agree before considering a write committed, and both handle a leader node's failure via an election process among the remaining, up-to-date replicas; the surface-level difference is primarily in WHAT is being replicated and how it's organized (RabbitMQ replicates individual queues; Kafka replicates individual topic-partitions as part of its broader log-based architecture) rather than in the underlying consensus mechanism itself — a genuinely useful, unifying insight is that despite RabbitMQ and Kafka representing quite different overall architectural philosophies (broker-and-routing versus durable-log-and-partitions), both ultimately rely on the same well-established distributed consensus theory to provide their respective fault-tolerance guarantees.
`,

  "coding-questions": `
### 1. Implement a topic-exchange binding pattern matcher

~~~python
import re

def topic_pattern_to_regex(pattern):
    escaped = re.escape(pattern)
    escaped = escaped.replace(r"\\*", r"[^.]+")
    escaped = escaped.replace(r"\\#", r".*")
    return re.compile(f"^{escaped}$")

def matches_binding(routing_key, binding_pattern):
    return bool(topic_pattern_to_regex(binding_pattern).match(routing_key))
# Follow-up: verify this correctly handles the pattern "orders.#"
# matching "orders.electronics.urgent" (multiple words after
# "orders"), and "orders.*.urgent" matching "orders.electronics.urgent"
# but NOT "orders.electronics.refurbished.urgent" -- why does the
# distinction between * and # matter for this second case?
~~~

### 2. Implement an idempotent RabbitMQ consumer callback

~~~python
def make_idempotent_callback(handler_fn, dedup_store):
    def callback(ch, method, properties, body):
        message = deserialize(body)
        key = message["idempotency_key"]
        if dedup_store.already_processed(key):
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
        try:
            handler_fn(message)
            dedup_store.record_processed(key)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    return callback
# Follow-up: what happens if handler_fn succeeds but
# dedup_store.record_processed raises an exception before the
# ack is sent -- could this cause a duplicate effect on
# redelivery, and how would you address this specific gap?
~~~

### 3. Implement a simple dead-letter redelivery counter

~~~python
def process_with_dlx(message, handler_fn, max_retries, dlx_publish_fn):
    attempts = message.get("x-death-count", 0)
    try:
        handler_fn(message)
    except Exception:
        if attempts + 1 >= max_retries:
            dlx_publish_fn(message)
        else:
            message["x-death-count"] = attempts + 1
            raise  # let the broker's own requeue/nack mechanism handle it
# Follow-up: RabbitMQ actually tracks delivery/death count
# natively via message headers (x-death) rather than requiring
# the application to track it manually as shown here -- what's
# the advantage of using the broker's native mechanism instead?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Set up RabbitMQ and implement direct-exchange routing
Deploy a local RabbitMQ instance, create a direct exchange with multiple bound queues, and implement a producer and consumers verifying messages route correctly based on exact routing-key matching. Deliverable: a working direct-exchange routing setup. Skills exercised: basic RabbitMQ exchange configuration.

### Lab 2 (Intermediate): Implement topic-exchange pattern-based routing
Configure a topic exchange with multiple wildcard binding patterns, and verify messages route correctly (and don't route incorrectly) according to each pattern's matching rules. Deliverable: a documented verification of topic-exchange routing behavior. Skills exercised: topic exchange pattern design and verification.

### Lab 3 (Advanced): Implement dead-letter exchange handling and idempotent consumers
Configure a queue with a dead-letter exchange and redelivery limit, simulate a persistently-failing message, and verify it correctly moves to the dead-letter queue; separately implement and test idempotent consumer processing under simulated redelivery. Deliverable: a working, tested dead-letter and idempotency implementation. Skills exercised: dead-letter configuration and idempotent consumer design.

### Lab 4 (Production): Deploy a RabbitMQ cluster with quorum queues and test failover
Deploy a multi-node RabbitMQ cluster, configure a quorum queue for a simulated critical message type, and verify message durability and availability after simulating a node failure. Deliverable: a documented cluster deployment with verified quorum-queue failover behavior. Skills exercised: clustering, quorum queues, and fault-tolerance verification.
`,

  "real-projects": `
### 1. A Celery-based background task processing system
Engineering requirements: RabbitMQ as the underlying broker for Celery, with appropriately-configured queues, dead-letter handling, and idempotent task processing for background jobs (report generation, email sending, file processing).

### 2. A microservices notification system using fanout exchanges
Engineering requirements: a fanout-exchange-based event distribution system letting multiple independent services (email, CRM, analytics) each independently and idempotently react to shared application events.

### 3. A critical-message-durability system using quorum queues
Engineering requirements: quorum queues for genuinely critical message types (payment processing events, for instance), with verified durability and availability across simulated broker node failures.
`,

  "case-studies": `
### RabbitMQ's Erlang foundation as a deliberate architectural choice
RabbitMQ's original creators chose Erlang specifically because of its strong, mature, built-in support for concurrency and fault tolerance (Erlang was originally designed for telecom switching systems requiring extremely high reliability) — this foundational choice directly contributed to RabbitMQ's own reputation for reliability and its ability to efficiently manage a very large number of simultaneous connections and queues. Lesson: choosing an implementation language/platform specifically for its alignment with a system's core reliability and concurrency requirements (rather than for more generic popularity reasons) can meaningfully shape a technology's long-term reputation and genuine technical strengths.

### RabbitMQ and Celery's widespread, complementary adoption in the Python ecosystem
RabbitMQ's reliable delivery guarantees and flexible routing made it a natural, extremely common choice as Celery's underlying broker for background task processing across a huge number of Python-based production systems, demonstrating how a well-designed, general-purpose message broker (RabbitMQ) and a well-designed, higher-level task-processing framework (Celery) built on top of it can form a genuinely complementary, widely-adopted combination. Lesson: a general-purpose infrastructure component's real-world impact is often best understood by looking at what higher-level frameworks and tools are commonly built successfully on top of it, not just the component's own standalone feature list.

### The industry's move toward quorum queues, replacing RabbitMQ's earlier "mirrored queues" approach
RabbitMQ's community and maintainers recognized that its earlier high-availability mechanism (classic mirrored queues) had genuine correctness and operational limitations, motivating the development and eventual recommendation of quorum queues (a Raft-based replacement) as the modern, more robust default for critical messaging needs — directly paralleling Kafka's own KRaft migration (covered in the **Kafka** skill) as another example of foundational messaging infrastructure evolving its consensus/replication mechanism over time as better-understood, more robust approaches (Raft specifically) became the clearly preferred, well-established choice across the broader distributed systems field. Lesson: even mature, widely-deployed infrastructure continues to adopt improved, more theoretically sound approaches (Raft-based replication, in this case) as the broader field's best practices mature, rather than remaining permanently committed to an earlier design decision.
`,

  comparisons: `
| Aspect | Direct Exchange | Topic Exchange | Fanout Exchange | Headers Exchange |
|--------|----------------------|--------------------|----------------------|------------------------|
| Routing basis | Exact routing-key match | Wildcard pattern on routing key | Ignores routing key (broadcast) | Message header attribute matching |
| Best fit | Precise, simple routing | Hierarchical, flexible category routing | Publish-subscribe broadcast | Multi-attribute routing decisions |

| Aspect | RabbitMQ | Kafka |
|--------|--------------|-----------|
| Message retention | Removed once consumed | Durable log, retained for a configured period |
| Routing model | Rich, broker-level exchange/binding | Topic/partition, with consumer-group-based independence |
| Replay capability | Generally no | Yes |
| High availability mechanism | Quorum queues (Raft-based) | Partition replication (KRaft-based, also Raft) |
| Best fit | Discrete task distribution, flexible routing | Durable, high-throughput, replayable event streaming |

**How seniors choose**: use a direct exchange for simple, precise routing; a topic exchange for flexible, hierarchical routing; a fanout exchange for broadcast/publish-subscribe needs; a headers exchange for multi-attribute routing decisions; and choose RabbitMQ over Kafka overall when discrete task distribution or rich routing is the genuine need, reserving Kafka for durable, replayable, high-throughput event streaming.
`,

  "related-technologies": `
- **Message Queues** — the foundational asynchronous-messaging concepts RabbitMQ concretely implements.
- **Kafka** — covered immediately before this page, offering a genuinely different, log-based architectural model worth directly comparing against RabbitMQ's broker-based model.
- **Distributed Systems** — RabbitMQ's quorum queues directly implement the Raft consensus concepts covered there.
- **Celery** and other background task frameworks commonly built on top of RabbitMQ.
- **Prometheus**, **Grafana** — commonly used for monitoring RabbitMQ's own operational metrics.

Learning path: **Message Queues** → **Kafka** → this page, completing the System Design category's concrete messaging-technology coverage.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Quorum queues have become the firmly established, recommended default for RabbitMQ's high-availability needs, with classic mirrored queues increasingly considered legacy.
- Continued widespread adoption of RabbitMQ specifically for classic task-distribution use cases and Celery-based background job processing, alongside Kafka's continued dominance for durable event streaming — the two technologies' complementary niches remain well-established and stable.
- Continued maturity of RabbitMQ's multi-protocol support (AMQP, MQTT, STOMP), broadening its applicability across different client ecosystems.
- Given continued evolution in this space, verify RabbitMQ's current exact feature set and configuration recommendations against official documentation.
`,

  "future-roadmap": `
Where RabbitMQ technology is heading, and what's worth betting career time on:

- **Continued dominance of quorum queues** as the standard, recommended high-availability mechanism, with classic mirrored queues fully phased out over time.
- **Continued, stable coexistence with Kafka** as two complementary, well-differentiated technologies serving genuinely different messaging needs, rather than one displacing the other.
- **Continued relevance for Celery-based and similar background task processing architectures**, a durable, well-established use case unlikely to shift significantly.
- **What to bet on**: deeply understanding the underlying concepts (exchange/binding routing models, acknowledgment and idempotency, Raft-based quorum queues, and the genuine RabbitMQ-versus-Kafka use-case distinction) — these transfer directly across any specific broker version's current configuration syntax, a far more durable investment than memorizing one particular deployment's exact settings.
`,

  "cheat-sheet": `
~~~
# ---- AMQP model: exchange -> binding -> queue ----
Producer publishes to an EXCHANGE (never directly to a queue)
Exchange routes via a BINDING (routing rule) to bound QUEUE(s)
Consumer retrieves from its queue
~~~

~~~
# ---- Exchange types ----
Direct:  exact routing-key match
Topic:   wildcard pattern match (* = one word, # = zero or more)
Fanout:  broadcast to EVERY bound queue (ignores routing key)
Headers: match on message header key-value pairs
~~~

~~~python
# ---- Ack/requeue = at-least-once delivery ----
def callback(ch, method, properties, body):
    process(body)
    ch.basic_ack(delivery_tag=method.delivery_tag)
    # crash before ack -> RabbitMQ requeues -> consumer MUST be idempotent
~~~

~~~
# ---- Dead-letter exchange ----
Message rejected / expires / exceeds retry limit ->
    routed to a configured dead-letter exchange instead of
    being redelivered forever.
~~~

~~~
# ---- Quorum queues: Raft-based HA (the modern default) ----
Replicates across cluster nodes, majority required to commit.
Directly parallels Kafka's own KRaft-based replication --
same underlying Raft consensus theory, different system.
~~~

~~~
# ---- RabbitMQ vs Kafka ----
RabbitMQ: removed on consume, rich routing, simpler ops --
          best for discrete task distribution
Kafka:    durable log, replayable, multi-consumer --
          best for high-throughput event streaming
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What does a producer publish to in AMQP? | An exchange — never directly to a queue. |
| Direct vs fanout exchange? | Direct = exact routing-key match. Fanout = broadcast to every bound queue. |
| Topic exchange wildcards? | * = exactly one word; # = zero or more words. |
| Headers exchange routes on what? | Message header key-value pairs, not the routing key. |
| Why must RabbitMQ consumers be idempotent? | Ack/requeue provides at-least-once, not exactly-once, delivery. |
| What is a dead-letter exchange? | Where messages go after rejection/expiry/exceeding retry limit. |
| What is a quorum queue? | RabbitMQ's Raft-based replicated queue — modern HA default. |
| Quorum queues vs Kafka's replication? | Both use Raft consensus, applied to different underlying structures. |
| RabbitMQ vs Kafka — key decision factor? | Need durable replay for many consumers (Kafka) vs discrete task distribution/rich routing (RabbitMQ). |
| Common RabbitMQ pairing in Python? | Celery — background task processing framework. |
`,

  mcqs: `
1. What does a producer publish a message to in RabbitMQ's AMQP model?
   A) Directly to a queue  B) An exchange, which then routes it to bound queues  C) Directly to a consumer  D) A partition
   **Answer: B** — the exchange-binding-queue model is AMQP's core routing abstraction.

2. What's the key difference between a direct exchange and a topic exchange?
   A) They are identical  B) Direct requires an exact routing-key match; topic supports wildcard pattern matching  C) Topic exchanges ignore the routing key entirely  D) Direct exchanges broadcast to every queue
   **Answer: B** — topic exchanges provide considerably more routing flexibility via wildcards.

3. Why must RabbitMQ consumers generally be designed idempotently?
   A) RabbitMQ guarantees exactly-once delivery, so it's optional  B) Acknowledgment/requeueing provides at-least-once delivery, so redelivery can occur  C) Idempotency only matters for Kafka  D) RabbitMQ never redelivers messages
   **Answer: B** — a message can be redelivered if a consumer crashes before acknowledging.

4. What is a quorum queue?
   A) A queue with no replication  B) RabbitMQ's Raft-based replicated queue type, providing fault tolerance across cluster nodes  C) A queue that only accepts priority messages  D) A deprecated feature
   **Answer: B** — the modern, recommended default for RabbitMQ's high-availability needs.

5. When would RabbitMQ generally be preferred over Kafka?
   A) When durable, replayable event streaming for many independent consumers is the primary need  B) When discrete task distribution or rich, flexible routing logic is the genuine requirement  C) Never — Kafka is always superior  D) Only for IoT use cases
   **Answer: B** — a deliberate choice based on actual use-case requirements, not default habit.
`,

  "revision-notes": `
RabbitMQ is a widely-adopted, open-source message broker implementing the AMQP model, built around the EXCHANGE-QUEUE-BINDING abstraction — a producer publishes a message to an EXCHANGE (never directly to a queue), and the exchange routes it to one or more bound QUEUES according to a BINDING (a routing rule), from which consumers ultimately retrieve messages. This is a genuinely different architectural model from the **Kafka** skill's durable, log-based approach — RabbitMQ generally REMOVES a message once it's been successfully consumed and acknowledged, making it a better fit for discrete task distribution than for durable, replayable event streaming.

RabbitMQ's four EXCHANGE TYPES each provide a genuinely different routing pattern: DIRECT exchanges route based on an EXACT match between the message's routing key and a queue's binding; FANOUT exchanges ignore the routing key entirely, broadcasting to EVERY bound queue (directly implementing publish-subscribe semantics); TOPIC exchanges route based on WILDCARD PATTERN matching against a hierarchical routing key (using * to match exactly one word, and # to match zero or more words), providing considerably more routing flexibility than a direct exchange; and HEADERS exchanges route based on matching message HEADER key-value pairs rather than the routing key string, useful for multi-attribute routing decisions.

Like RabbitMQ's ACKNOWLEDGMENT AND REQUEUEING mechanism (a consumer explicitly acknowledges a message only after successful processing; unacknowledged messages — due to a consumer crash or disconnect — are requeued for redelivery), this directly implements the AT-LEAST-ONCE delivery pattern covered generally in the **Message Queues** and **Distributed Systems** skills — meaning RabbitMQ consumers must be designed IDEMPOTENTLY, exactly as with any at-least-once messaging system, since a message can occasionally be redelivered and processed more than once.

DEAD-LETTER EXCHANGES provide RabbitMQ's specific implementation of the general dead-letter-queue concept — a queue can be configured to automatically route messages to a dead-letter exchange if they're rejected, expire (via a configured TTL), or exceed a configured redelivery limit, preventing a persistently-failing "poison message" from being redelivered indefinitely while still preserving it for later investigation.

A genuinely important, frequently-tested architectural detail: QUORUM QUEUES are RabbitMQ's modern, RAFT-BASED replicated queue type (replacing the earlier, more limited "classic mirrored queues" approach), replicating a queue's messages across multiple cluster nodes and requiring MAJORITY agreement for a write to be considered committed — this directly implements the **Distributed Systems** skill's own Raft consensus and majority-based commitment concepts, and closely PARALLELS Kafka's own KRaft-based replication (covered in the **Kafka** skill) despite RabbitMQ and Kafka otherwise representing quite different overall architectural philosophies — both ultimately rely on the same underlying Raft consensus theory for their respective fault-tolerance guarantees.

The core, deliberate decision between RabbitMQ and Kafka, directly echoing the comparison covered in the **Kafka** skill: choose RabbitMQ when the use case is genuinely about discrete TASK DISTRIBUTION (a job processed once and then done, not needing retention/replay) or when RICH, FLEXIBLE ROUTING (topic patterns, header matching, priority queues — a capability RabbitMQ has that Kafka's strictly-ordered log model doesn't natively provide) is genuinely needed, especially where RabbitMQ's comparative OPERATIONAL SIMPLICITY (versus Kafka's partition/consumer-group management) is valued; choose Kafka when durable, REPLAYABLE event streaming for multiple independent consumers (potentially added well after events were originally produced), or extremely high sustained throughput, is the genuine requirement.

RabbitMQ's Erlang implementation foundation was a deliberate choice specifically for Erlang's strong, mature built-in concurrency and fault-tolerance primitives, directly contributing to RabbitMQ's own reputation for reliability. RabbitMQ is extremely commonly paired with Celery (a widely-used Python background task processing framework) as its underlying broker, directly reflecting RabbitMQ's genuine strength for classic, discrete task-distribution use cases — completing this platform's System Design category's concrete coverage of message queue and event streaming technologies, alongside the general **Message Queues** foundational skill and the **Kafka** event streaming skill.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding the exchange-queue-binding model and basic direct-exchange routing. Milestone: complete Lab 1, with a working direct-exchange routing setup.

**Week 2 — Flexible routing**: implementing and verifying topic-exchange pattern-based routing. Milestone: complete Lab 2, with documented verification of wildcard routing behavior.

**Week 3 — Resilience**: implementing dead-letter exchange handling and idempotent consumer processing. Milestone: complete Lab 3, with verified dead-letter and idempotency behavior.

**Week 4 — High availability**: deploying a clustered RabbitMQ setup with quorum queues and testing failover. Milestone: complete Lab 4, with verified quorum-queue durability across a simulated node failure.

**Week 5 — Comparative architecture decisions**: practicing choosing between RabbitMQ and Kafka for a range of described real-world scenarios, justifying each choice based on genuine use-case requirements.

This completes the System Design category's messaging-technology sequence: **Message Queues** → **Kafka** → **RabbitMQ**.
`,

  "official-docs": `
- **RabbitMQ's official documentation** — the authoritative, comprehensive reference for RabbitMQ's architecture, configuration, and client APIs.
- **The AMQP 0-9-1 specification** — the underlying protocol specification RabbitMQ implements.
- **RabbitMQ's official quorum queues documentation** — the authoritative reference for its modern, Raft-based high-availability mechanism.
`,

  books: `
- **"RabbitMQ in Depth" — Gavin M. Roy** — a focused, comprehensive practical guide to RabbitMQ's architecture and operation.
- **"Enterprise Integration Patterns" — Gregor Hohpe and Bobby Woolf** — a foundational, widely-referenced catalog of messaging architecture patterns directly applicable to RabbitMQ's exchange/routing model.
- **"Designing Data-Intensive Applications" — Martin Kleppmann** — covers messaging systems and delivery guarantees within the broader distributed systems context.
`,

  blogs: `
- **RabbitMQ's official engineering blog** — practical, product-specific configuration, architecture, and quorum-queue migration guidance.
- **The Celery project's official documentation and blog** — extensive coverage of RabbitMQ as a broker choice for background task processing.
- **CloudAMQP's engineering blog** — a managed RabbitMQ hosting provider publishing practical operational guidance and best practices.
`,

  "research-papers": `
- No single foundational academic paper defines "RabbitMQ" specifically — it's an implementation of the AMQP open standard; relevant foundational material includes general message-oriented middleware literature and the Raft consensus paper (Ongaro and Ousterhout, referenced in the **Distributed Systems** skill) directly underlying quorum queues' replication mechanism.
`,

  videos: `
- **RabbitMQ's official conference talks and tutorials** — practical, product-specific configuration and architecture guidance.
- **Conference talks on Celery and RabbitMQ integration** — practical guidance for background task processing architectures.
- **System design interview preparation channels** covering RabbitMQ and message queue design as a common interview topic.
`,

  "github-repos": `
- **rabbitmq/rabbitmq-server** — the official RabbitMQ source repository.
- **celery/celery** — the official Celery source repository, commonly paired with RabbitMQ as its broker.
- **pika/pika** — a widely-used Python AMQP client library for RabbitMQ.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Exchange type selection**: given a described routing requirement, choose and justify the appropriate exchange type (direct, topic, fanout, headers).
2. **Topic pattern design**: given a described hierarchical routing-key structure and a set of desired consumer subscriptions, design appropriate topic-exchange binding patterns.
3. **Dead-letter configuration design**: given a described failure scenario, design an appropriate dead-letter exchange and redelivery-limit configuration.
4. **RabbitMQ versus Kafka decision**: given a described use case, decide and justify whether RabbitMQ or Kafka is the better architectural fit.
5. **External practice sets**: "Enterprise Integration Patterns" (Hohpe and Woolf) practice scenarios covering messaging architecture pattern selection, directly applicable to RabbitMQ's exchange model.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Producers["Producers"]
        OrderService["Order Service"]
    end
    subgraph Exchanges["Exchanges"]
        TopicExchange["Topic Exchange:\nlogs"]
        FanoutExchange["Fanout Exchange:\norder_events"]
    end
    subgraph Queues["Queues"]
        ErrorLogs["error_logs queue"]
        AllLogs["all_logs queue"]
        EmailQueue["email queue"]
        AnalyticsQueue["analytics queue"]
        DLQ["Dead-Letter Queue"]
    end
    OrderService --> TopicExchange
    OrderService --> FanoutExchange
    TopicExchange -->|"*.error"| ErrorLogs
    TopicExchange -->|"#"| AllLogs
    FanoutExchange --> EmailQueue
    FanoutExchange --> AnalyticsQueue
    EmailQueue -.->|"exceeds retry limit"| DLQ
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((RabbitMQ))
    Foundations
      Overview
      History AMQP Erlang Celery
      Why it exists
      Problem it solves
    AMQP Model
      Exchanges
      Queues
      Bindings
      Routing keys
    Exchange Types
      Direct
      Topic wildcards
      Fanout
      Headers
    Delivery Semantics
      Acknowledgment
      Requeueing
      At least once
      Idempotent consumers
    Resilience
      Dead letter exchanges
      Quorum queues Raft
      Clustering
    Comparison
      RabbitMQ vs Kafka
      Task distribution vs event streaming
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default rabbitmq;
