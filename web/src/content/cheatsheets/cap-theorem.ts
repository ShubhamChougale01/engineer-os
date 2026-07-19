import type { CheatSheetData } from "./types";

const capTheoremCheatSheet: CheatSheetData = {
  title: "CAP Theorem",
  subtitle: "Consistency vs availability under partition, plus PACELC",
  sections: [
    {
      title: "The Three Guarantees",
      color: "violet",
      rows: [
        { term: "Consistency (C)", desc: "Every read gets the latest write, or an error" },
        { term: "Availability (A)", desc: "Every request gets a non-error response (may be stale)" },
        { term: "Partition tolerance (P)", desc: "System keeps working despite network message loss" },
        { term: "P is not optional", desc: "Real networks partition — real choice is C vs A during one" },
      ],
    },
    {
      title: "CP vs AP",
      color: "blue",
      rows: [
        { term: "CP behavior", desc: "Refuse/delay requests on minority side during partition" },
        { term: "CP examples", desc: "ZooKeeper, etcd, sync-replication RDBMS" },
        { term: "AP behavior", desc: "Keep serving both sides, reconcile after healing" },
        { term: "AP examples", desc: "Cassandra, DynamoDB (typical config)" },
        { term: "Best fit CP", desc: "Financial txns, inventory counts, config data" },
        { term: "Best fit AP", desc: "Shopping carts, social feeds, view counters" },
      ],
    },
    {
      title: "PACELC",
      color: "emerald",
      rows: [
        {
          term: "PACELC rule",
          desc: "Partition → A vs C; Else → Latency vs Consistency",
          code: "if partitioned: choose A or C\nelse: choose L or C",
        },
        { term: "Why it matters", desc: "Most systems spend most time NOT partitioned" },
      ],
    },
    {
      title: "Common Misconceptions",
      color: "rose",
      rows: [
        { term: "\"DB X is permanently CP/AP\"", desc: "Wrong — many DBs tune consistency per operation" },
        { term: "\"Pick any 2 of 3 freely\"", desc: "Wrong — P isn't optional; real pick is C vs A" },
        { term: "Spanner defies CAP", desc: "No — TrueTime just shrinks the practical cost of C" },
      ],
    },
    {
      title: "Consistency Spectrum",
      color: "amber",
      rows: [
        { term: "Linearizable", desc: "Strongest — every read reflects latest write globally" },
        { term: "Sequential", desc: "Global order preserved, not necessarily real-time" },
        { term: "Causal", desc: "Causally-related ops ordered; good middle ground" },
        { term: "Eventual", desc: "Weakest — converges eventually, cheapest/most available" },
      ],
    },
    {
      title: "Tunable Consistency",
      color: "cyan",
      rows: [
        {
          term: "Per-operation config",
          desc: "Cassandra-style consistency levels",
          code: "check_balance(): read(id, level=QUORUM)\nget_view_count(): read(id, level=ONE)",
        },
        { term: "Quorum rule", desc: "W + R > N guarantees every read sees latest write" },
      ],
    },
  ],
};

export default capTheoremCheatSheet;
