import type { CheatSheetData } from "./types";

const mongodb: CheatSheetData = {
  title: "The Ultimate MongoDB Cheat Sheet",
  subtitle: "Document model · aggregation pipeline · replication & sharding · production toolbelt",
  sections: [
    {
      title: "Documents & Queries",
      color: "violet",
      rows: [
        { term: "Insert a document", desc: "Nested objects/arrays live directly in one document", code: "db.users.insertOne({ name: 'Ada', address: { city: 'London' } });" },
        { term: "Dot notation", desc: "Query into arbitrarily nested fields", code: "db.users.find({ 'address.city': 'London' });" },
        { term: "Array field match", desc: "Matches if the value is ANYWHERE in the array", code: "db.posts.find({ tags: 'nosql' });" },
        { term: "Atomic update operators", desc: "NEVER fetch-modify-rewrite a whole document", code: "db.users.updateOne({_id}, { $inc: { loginCount: 1 } });\ndb.posts.updateOne({_id}, { $push: { comments: c } });" },
      ],
    },
    {
      title: "Schema Design",
      color: "blue",
      rows: [
        { term: "Embed vs reference", desc: "The central MongoDB schema decision", code: "// Embed: bounded, read-together (address)\n// Reference: unbounded, independent (a user's posts)" },
        { term: "Unbounded embedding risk", desc: "16MB document hard limit — degrades LONG before that", code: "// WRONG: embedding thousands of a popular user's posts" },
        { term: "Schema validation (opt-in)", desc: "Flexible by default, but you can enforce structure", code: "db.createCollection('users', { validator: { $jsonSchema: {...} } });" },
      ],
    },
    {
      title: "Aggregation Pipeline",
      color: "emerald",
      rows: [
        { term: "Pipeline shape", desc: "Filter FIRST — lets MongoDB use indexes before grouping", code: "db.orders.aggregate([\n  { $match: { status: 'completed' } },\n  { $group: { _id: '$customerId', total: { $sum: '$amount' } } },\n  { $sort: { total: -1 } }\n]);" },
        { term: "$lookup (join equivalent)", desc: "Left-outer-join-like, merges matching docs in", code: "{ $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'customer' } }" },
        { term: "Diagnose a slow query", desc: "COLLSCAN (bad) vs IXSCAN (index used, good)", code: "db.orders.find({...}).explain('executionStats');" },
        { term: "Multikey index", desc: "Auto-detected for array fields — no special syntax", code: "db.posts.createIndex({ tags: 1 });" },
      ],
    },
    {
      title: "Replication & Consistency",
      color: "amber",
      rows: [
        { term: "Replica set", desc: "The STANDARD production unit — never a lone instance", code: "rs.initiate({ _id: 'rs0', members: [...] });" },
        { term: "Check replica health", desc: "Primary, secondaries, and replication lag", code: "rs.status();" },
        { term: "Default write concern", desc: "w:1 does NOT wait for secondary replication", code: "db.orders.insertOne(doc, { writeConcern: { w: 'majority' } });" },
        { term: "Read from secondaries", desc: "Trades some staleness for reduced primary load", code: "db.orders.find({}).readPref('secondaryPreferred');" },
        { term: "Change streams", desc: "Real-time reactive triggers, built on the oplog", code: "db.orders.watch([{ $match: { 'fullDocument.status': 'completed' } }]);" },
      ],
    },
    {
      title: "Sharding & Transactions",
      color: "rose",
      rows: [
        { term: "Shard key", desc: "Get this wrong and it's hard to fix later", code: "// High cardinality, evenly distributed writes.\n// NEVER a monotonically increasing field (timestamp)." },
        { term: "Multi-document transaction", desc: "Exists since 4.0, but use sparingly", code: "session.startTransaction();\n// ... ops with { session } ...\nawait session.commitTransaction();" },
        { term: "Single-doc atomicity", desc: "Always guaranteed by default — the idiomatic default", code: "// Design schemas so MOST ops are single-document" },
        { term: "Safe claim pattern", desc: "Atomic find-and-update in one operation", code: "db.items.findOneAndUpdate({status:'available'}, {$set:{status:'reserved'}});" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "ALWAYS enable auth", desc: "Historical default-off caused major breach incidents", code: "security.authorization: enabled" },
        { term: "Atlas Vector Search", desc: "Managed-only — not in self-hosted Community Edition", code: "{ $vectorSearch: { index: 'vidx', path: 'embedding', queryVector: [...], limit: 5 } }" },
        { term: "Connection string", desc: "List ALL replica members for automatic failover", code: "mongodb://r1,r2,r3/mydb?replicaSet=rs0" },
        { term: "Live ops inspection", desc: "Find long-running or blocked operations", code: "db.currentOp({ secs_running: { $gt: 5 } });" },
      ],
    },
  ],
};

export default mongodb;
