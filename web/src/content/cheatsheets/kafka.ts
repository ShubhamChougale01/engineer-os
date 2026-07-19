import type { CheatSheetData } from "./types";

const kafkaCheatSheet: CheatSheetData = {
  title: "Kafka",
  subtitle: "Distributed event streaming platform",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Topic", desc: "Logical stream of events" },
        { term: "Partition", desc: "Independent, ordered, append-only log within a topic" },
        { term: "Retention", desc: "Events kept for a configured period, not removed on consume" },
      ],
    },
    {
      title: "Ordering",
      color: "blue",
      rows: [
        { term: "Guarantee scope", desc: "Per-partition ONLY, not per-topic" },
        {
          term: "Consistent key",
          desc: "Same key -> same partition -> order preserved",
          code: "partition = hash(key) % num_partitions",
        },
      ],
    },
    {
      title: "Consumer Groups",
      color: "emerald",
      rows: [
        { term: "Within one group", desc: "Each partition -> exactly ONE instance" },
        { term: "Across groups", desc: "Fully independent — own offset each, same topic" },
        { term: "Consumer lag", desc: "latest_offset - committed_offset — THE key health metric" },
      ],
    },
    {
      title: "Fault Tolerance",
      color: "amber",
      rows: [
        { term: "Replication factor", desc: "Commonly 3 — leader + followers per partition" },
        { term: "Failover", desc: "In-sync follower promoted if leader broker fails" },
        { term: "KRaft", desc: "Kafka's own built-in Raft consensus, replaces ZooKeeper" },
      ],
    },
    {
      title: "Delivery & Compaction",
      color: "rose",
      rows: [
        { term: "\"Exactly-once\"", desc: "Idempotent producers + transactional writes (Kafka-to-Kafka)" },
        { term: "Log compaction", desc: "Retain only latest value per key — for current-state topics" },
      ],
    },
    {
      title: "Kafka vs Traditional Queue",
      color: "cyan",
      rows: [
        { term: "Kafka", desc: "Durable log, replayable, multi-consumer, high throughput" },
        { term: "RabbitMQ (next)", desc: "Removed on consume, richer routing, simpler ops" },
      ],
    },
  ],
};

export default kafkaCheatSheet;
