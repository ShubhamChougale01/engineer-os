import type { CheatSheetData } from "./types";

const graphql: CheatSheetData = {
  title: "The Ultimate GraphQL Cheat Sheet",
  subtitle: "Client-specified fields · the N+1 problem · DataLoader · query security",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "One endpoint, client picks fields", desc: "The direct fix for REST's over-fetching / under-fetching", code: "query { user(id: \"42\") { name posts { title } } }" },
        { term: "Mutations = writes", desc: "GraphQL's equivalent of REST's POST/PUT/PATCH/DELETE", code: "mutation { createUser(name: \"Ada\") { id name } }" },
        { term: "Schema is the contract", desc: "Strongly typed, enables codegen + auto-docs via introspection", code: "type User { id: ID! name: String! posts: [Post!]! }" },
        { term: "Resolvers", desc: "One function per field, called recursively to assemble the response", code: "User: { posts: (parent) => db.posts.findByUserId(parent.id) }" },
      ],
    },
    {
      title: "The N+1 Problem (THE #1 GraphQL Risk)",
      color: "blue",
      rows: [
        { term: "How it happens", desc: "A per-item resolver fires once per row -> N extra queries", code: "// 1 query for users + N queries (one per user) for posts" },
        { term: "ALWAYS batch with DataLoader", desc: "Collects all load() calls in one tick into ONE query", code: "const postLoader = new DataLoader(async (ids) =>\n  batchFetchByIds(ids))" },
        { term: "New instance PER REQUEST", desc: "Never share a DataLoader across concurrent requests", code: "// Create it fresh in your per-request context, not as a module-level singleton" },
      ],
    },
    {
      title: "Query Security (unbounded by default!)",
      color: "emerald",
      rows: [
        { term: "Depth limiting", desc: "GraphQL has NO inherent nesting limit -- deep queries = DoS risk", code: "validationRules: [depthLimit(7)]" },
        { term: "Complexity/cost analysis", desc: "Assign cost per field, reject queries over budget", code: "costAnalysis({ maximumCost: 1000 })" },
        { term: "Disable introspection in prod", desc: "Otherwise the ENTIRE schema is discoverable to any caller", code: "introspection: process.env.NODE_ENV !== 'production'" },
        { term: "Field-level authorization", desc: "A query can request ANY field on ANY reachable type", code: "if (ctx.user.id !== parent.id) return null;   // per-field check" },
      ],
    },
    {
      title: "Errors & Caching (both work differently than REST)",
      color: "amber",
      rows: [
        { term: "Errors live in the body", desc: "HTTP status is almost ALWAYS 200 -- check the errors array", code: "{ \"data\": {...}, \"errors\": [{\"message\": \"...\"}] }" },
        { term: "No native HTTP caching", desc: "Single POST endpoint defeats URL-based caching entirely", code: "// Use Apollo Client/Relay normalized cache instead" },
        { term: "Persisted queries", desc: "Send an ID, not full query text -- smaller + closes off arbitrary queries", code: "POST /graphql {\"id\": \"a1b2c3\", \"variables\": {...}}" },
      ],
    },
    {
      title: "Pagination & Evolution",
      color: "rose",
      rows: [
        { term: "Relay cursor connections", desc: "The GraphQL-standard pagination shape", code: "users(first: 10, after: \"cursor\") { edges { node cursor } pageInfo { hasNextPage } }" },
        { term: "Additive schema evolution", desc: "Add fields, don't version URLs like REST's /v1//v2/", code: "// Existing queries keep working since they only request their original fields" },
      ],
    },
    {
      title: "Scale: Federation",
      color: "cyan",
      rows: [
        { term: "Apollo Federation", desc: "Multiple services each own part of ONE unified graph", code: "type User @key(fields: \"id\") { id: ID! name: String! }" },
        { term: "When to reach for it", desc: "Once many teams share/coordinate on one monolithic schema", code: "// A gateway composes the subgraphs into a single queryable graph" },
        { term: "GraphQL vs REST -- when to pick REST", desc: "Simple CRUD, public content APIs wanting native HTTP caching", code: "// See the REST skill's own decision framework" },
      ],
    },
  ],
};

export default graphql;
