import type { CheatSheetData } from "./types";

const rabbitmqCheatSheet: CheatSheetData = {
  title: "RabbitMQ",
  subtitle: "The classic AMQP message broker",
  sections: [
    {
      title: "AMQP Model",
      color: "violet",
      rows: [
        { term: "Exchange", desc: "Producer publishes here — never directly to a queue" },
        { term: "Binding", desc: "Routing rule connecting an exchange to a queue" },
        { term: "Queue", desc: "Where consumers actually retrieve messages" },
      ],
    },
    {
      title: "Exchange Types",
      color: "blue",
      rows: [
        { term: "Direct", desc: "Exact routing-key match" },
        { term: "Topic", desc: "Wildcard pattern — * = one word, # = zero or more" },
        { term: "Fanout", desc: "Broadcast to EVERY bound queue, ignores routing key" },
        { term: "Headers", desc: "Match on header key-value pairs, not routing key" },
      ],
    },
    {
      title: "Delivery Semantics",
      color: "emerald",
      rows: [
        {
          term: "Ack/requeue",
          desc: "At-least-once delivery",
          code: "process(body)\nch.basic_ack(delivery_tag=method.delivery_tag)",
        },
        { term: "Idempotent consumer", desc: "Required — redelivery happens on crash before ack" },
      ],
    },
    {
      title: "Resilience",
      color: "amber",
      rows: [
        { term: "Dead-letter exchange", desc: "Persistently-failing messages routed here after N retries" },
        { term: "Quorum queues", desc: "Raft-based replication — modern HA default (not mirrored queues)" },
      ],
    },
    {
      title: "RabbitMQ vs Kafka",
      color: "rose",
      rows: [
        { term: "RabbitMQ", desc: "Removed on consume, rich routing, simpler ops" },
        { term: "Kafka", desc: "Durable log, replayable, multi-consumer, high throughput" },
        { term: "Choose RabbitMQ for", desc: "Discrete task distribution, flexible routing needs" },
      ],
    },
    {
      title: "Common Pairing",
      color: "cyan",
      rows: [
        { term: "Celery", desc: "Python background task framework, commonly on RabbitMQ" },
      ],
    },
  ],
};

export default rabbitmqCheatSheet;
