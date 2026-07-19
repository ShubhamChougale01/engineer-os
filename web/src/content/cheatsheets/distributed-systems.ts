import type { CheatSheetData } from "./types";

const distributedSystemsCheatSheet: CheatSheetData = {
  title: "Distributed Systems",
  subtitle: "Partial failure, consensus, replication, and ordering",
  sections: [
    {
      title: "Fallacies of Distributed Computing",
      color: "violet",
      rows: [
        { term: "The network is reliable", desc: "False — packets get lost, connections drop" },
        { term: "Latency is zero", desc: "False — every network hop costs real time" },
        { term: "Bandwidth is infinite", desc: "False — throughput is always bounded" },
        { term: "The network is secure", desc: "False — assume interception/tampering risk" },
        { term: "Topology doesn't change", desc: "False — nodes join, leave, fail, move" },
        { term: "Transport cost is zero", desc: "False — serialization/networking has real overhead" },
      ],
    },
    {
      title: "Partial Failure",
      color: "rose",
      rows: [
        { term: "Partial failure", desc: "Some nodes healthy, others down — impossible on 1 machine" },
        { term: "Ambiguous timeout", desc: "Crashed? Slow? Network drop? Caller can't tell which" },
        {
          term: "Idempotency",
          desc: "Retry-safe operation design",
          code: "if already_processed(key):\n    return cached_result\nreturn do_work_and_record(key)",
        },
        { term: "Circuit breaker", desc: "Stop calling a persistently failing dependency" },
      ],
    },
    {
      title: "Ordering Without Synchronized Clocks",
      color: "blue",
      rows: [
        {
          term: "Lamport clock",
          desc: "Counter incremented per event / on message receipt",
          code: "self.time = max(self.time, received) + 1",
        },
        { term: "Vector clock", desc: "Per-node counters — detects true concurrency, not just order" },
        { term: "Happened-before", desc: "Partial ordering of events without wall-clock sync" },
      ],
    },
    {
      title: "Consensus",
      color: "emerald",
      rows: [
        { term: "Consensus problem", desc: "Nodes agree on one value/order despite failures" },
        { term: "FLP impossibility", desc: "No algorithm guarantees safety+liveness in async net + 1 failure" },
        { term: "Raft", desc: "Leader election + log replication + safety, built for understandability" },
        { term: "Paxos", desc: "Earlier, harder-to-teach consensus algorithm, same guarantees" },
        { term: "Odd node count", desc: "3, 5, 7 — going 3→4 adds zero extra fault tolerance" },
        { term: "Split-brain", desc: "Two leaders elected after a partition — prevented by majority rule" },
      ],
    },
    {
      title: "Replication",
      color: "amber",
      rows: [
        { term: "Leader-follower", desc: "Single writer, followers replicate + can serve reads" },
        {
          term: "Quorum (W/R/N)",
          desc: "Tunable per-op consistency",
          code: "W + R > N  ->  every read sees latest write",
        },
        { term: "CRDTs", desc: "Data types that merge deterministically without consensus" },
      ],
    },
    {
      title: "Fault Models & Delivery",
      color: "cyan",
      rows: [
        { term: "Crash fault tolerance", desc: "Node just goes silent — needs 2f+1 nodes for f failures" },
        { term: "Byzantine fault tolerance", desc: "Node may lie/misbehave — needs 3f+1 nodes for f failures" },
        { term: "At-least-once delivery", desc: "Retries until ack; may duplicate" },
        { term: "Exactly-once (illusion)", desc: "= at-least-once delivery + idempotent consumer" },
      ],
    },
  ],
};

export default distributedSystemsCheatSheet;
