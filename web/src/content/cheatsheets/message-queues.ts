import type { CheatSheetData } from "./types";

const messageQueuesCheatSheet: CheatSheetData = {
  title: "Message Queues",
  subtitle: "Async decoupling of producers and consumers",
  sections: [
    {
      title: "Why Queues Exist",
      color: "violet",
      rows: [
        { term: "Direct sync call", desc: "Blocks caller, fails outright if callee is down" },
        { term: "Via a queue", desc: "Caller returns immediately; consumer processes async" },
      ],
    },
    {
      title: "Messaging Patterns",
      color: "blue",
      rows: [
        { term: "Point-to-point", desc: "Each message -> exactly ONE competing consumer" },
        { term: "Publish-subscribe", desc: "Each message -> EVERY subscriber" },
        { term: "Competing consumers", desc: "Add more instances to scale processing throughput" },
      ],
    },
    {
      title: "Delivery Guarantees",
      color: "emerald",
      rows: [
        {
          term: "Idempotent consumer",
          desc: "Essential — at-least-once is the practical default",
          code: "if already_processed(key): return\ndo_work(msg); record_processed(key)",
        },
        { term: "\"Exactly-once\"", desc: "= at-least-once + idempotency (an engineered illusion)" },
      ],
    },
    {
      title: "Resilience",
      color: "amber",
      rows: [
        { term: "Dead-letter queue", desc: "Persistently-failing messages moved here after N retries" },
        { term: "Poison message", desc: "Always fails — without a DLQ, blocks ordered processing forever" },
        { term: "Load leveling", desc: "Queue absorbs bursts; consumers process at sustainable pace" },
        { term: "Backpressure", desc: "Signal producers to slow down when backlog is too large" },
      ],
    },
    {
      title: "Queue vs Stream",
      color: "rose",
      rows: [
        { term: "RabbitMQ-style", desc: "Message removed once consumed — consume once" },
        { term: "Kafka-style", desc: "Durable log, retained — multiple consumers, replayable" },
      ],
    },
    {
      title: "Non-Negotiables",
      color: "cyan",
      rows: [
        { term: "Idempotency", desc: "Every consumer, from day one — not an afterthought" },
        { term: "Monitor queue depth", desc: "Leading indicator of capacity/consumer-health issues" },
        { term: "Broker redundancy", desc: "Don't let the queue itself become a new SPOF" },
      ],
    },
  ],
};

export default messageQueuesCheatSheet;
