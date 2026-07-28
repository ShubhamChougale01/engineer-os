import type { CheatSheetData } from "./types";

const featureStores: CheatSheetData = {
  title: "The Ultimate Feature Stores Cheat Sheet",
  subtitle: "Offline vs online stores - point-in-time correctness - skew prevention - production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Feature", desc: "A named, computed model input derived from raw data", code: "purchase_count_30d\navg_transaction_amount_7d" },
        { term: "Training/serving skew", desc: "Feature values drift between training and serving paths", code: "// Root cause: two independent implementations\n// of 'the same' feature logic" },
        { term: "Entity", desc: "The thing a feature describes (user, product, merchant)", code: "Entity(name='user', join_keys=['user_id'])" },
        { term: "Feature view", desc: "A named, versioned, shareable group of related features", code: "FeatureView(name='user_stats', entities=[user], schema=[...])" },
        { term: "Point-in-time correctness", desc: "Training rows only see feature values as of their own timestamp", code: "// As-of join: never look past the label's own moment" },
      ],
    },
    {
      title: "Offline vs Online Store",
      color: "blue",
      rows: [
        { term: "Offline store", desc: "Historical values, used for training, warehouse-backed", code: "// Backed by: Snowflake, BigQuery, a data lake" },
        { term: "Online store", desc: "Current values only, used for serving, key-value backed", code: "// Backed by: Redis, DynamoDB" },
        { term: "Latency profile", desc: "Offline tolerates seconds/minutes; online needs single-digit ms", code: "// Serving budget is strict -- see the Redis skill" },
        { term: "Materialization", desc: "Batch job copying latest offline values into the online store", code: "store.materialize_incremental(end_date=now())" },
        { term: "Materialization lag", desc: "Most important feature-store health signal to monitor", code: "// Stale online store = silently wrong predictions" },
      ],
    },
    {
      title: "Retrieval APIs (Feast example)",
      color: "emerald",
      rows: [
        { term: "Historical retrieval", desc: "Point-in-time-correct join for training data", code: "store.get_historical_features(\n  entity_df=entity_df, features=[...]\n).to_df()" },
        { term: "Online retrieval", desc: "Fast single-entity lookup for live serving", code: "store.get_online_features(\n  features=[...], entity_rows=[{'user_id': 42}]\n).to_dict()" },
        { term: "entity_df requirement", desc: "Each row needs its OWN event_timestamp", code: "pd.DataFrame({'user_id': [1], 'event_timestamp': [ts]})" },
        { term: "Shared definition", desc: "Both calls reference the SAME feature view name", code: "'user_purchase_stats:purchase_count_30d'" },
      ],
    },
    {
      title: "Pitfalls and Gotchas",
      color: "amber",
      rows: [
        { term: "Recomputing logic twice", desc: "Separate training/serving implementations WILL drift", code: "// WRONG: SQL window in training,\n// LIMIT 30 rows in serving code" },
        { term: "Leakage via naive join", desc: "Joining labels against 'latest' values leaks the future", code: "// WRONG: labels_df.merge(latest_features_df, on='user_id')" },
        { term: "Silent materialization failure", desc: "Online store goes stale with no visible error", code: "// Monitor job success + lag, not just 'did it run'" },
        { term: "Streaming by default", desc: "Adds real complexity most features don't need", code: "// Match freshness to actual predictive need" },
        { term: "Adopting too early", desc: "Full architecture is overkill for one team, few models", code: "// A shared feature library may be enough at small scale" },
      ],
    },
    {
      title: "Freshness Strategy",
      color: "rose",
      rows: [
        { term: "Batch features", desc: "Scheduled (hourly/daily), read from a warehouse", code: "// Simple, cheap; staleness bounded by batch interval" },
        { term: "Streaming features", desc: "Computed continuously from an event stream", code: "// Kafka -> online store; sub-minute freshness" },
        { term: "When to go streaming", desc: "Only when near-real-time freshness has real predictive value", code: "// e.g. fraud detection velocity features" },
        { term: "Feature versioning", desc: "Breaking changes get a new version, not an in-place edit", code: "// Migrate dependents before deprecating old version" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Skew detection test", desc: "Compare offline vs online value for the same entity", code: "assert online_value == offline_value_as_of_now" },
        { term: "Registry ownership", desc: "Know which models depend on a feature before changing it", code: "// Treat like a reviewed, shared API" },
        { term: "Secure the online store", desc: "Same auth/network rules as any production key-value store", code: "// See the Redis skill: requirepass, never internet-exposed" },
        { term: "Popular tools", desc: "Open source vs managed -- no single 'best' choice", code: "Feast | SageMaker FS | Vertex AI FS | Databricks FS | Tecton" },
        { term: "Monitor distributions", desc: "Catch upstream data issues before they hit model quality", code: "// Alert on feature drift, not just prediction drift" },
      ],
    },
  ],
};

export default featureStores;
