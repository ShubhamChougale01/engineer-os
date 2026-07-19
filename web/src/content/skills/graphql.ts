import type { SkillContent } from "../types";

/**
 * GraphQL — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const graphql: SkillContent = {
  overview: `
GraphQL is a query language for APIs and a runtime for fulfilling those queries against your existing data, built around one central idea that directly addresses the most common frustration with REST APIs (covered in the **REST** skill): rather than the server dictating a fixed shape of data returned per endpoint, the CLIENT specifies exactly which fields it needs, across however many related resources, in a single request. Instead of many REST endpoints (each returning a fixed representation) and multiple round trips to assemble a complex view, a GraphQL API exposes a single endpoint and a strongly-typed schema describing every possible query, letting each client request precisely the data shape it needs.

For an AI engineer, GraphQL is most directly relevant when building client-facing applications (particularly ones with varied, evolving UI needs — mobile apps, dashboards aggregating data from many sources) where REST's fixed-representation model produces either over-fetching (receiving far more data than a view actually needs) or under-fetching (requiring several sequential requests to assemble one view). GraphQL is less commonly the right choice for simple CRUD services or for the kind of AI-provider-facing APIs covered in the **REST** skill, where REST's simplicity and native HTTP caching are more valuable than GraphQL's query flexibility.

Key characteristics: a single endpoint (typically POST /graphql) rather than many resource-specific URLs; a strongly-typed **schema** defining every available query, mutation, and type, serving as a contract enforced at both compile time (client-side codegen) and runtime; **client-specified field selection**, where a query requests exactly the fields needed and nothing more; a single round trip to fetch data spanning multiple related resources, resolved server-side via **resolvers**; and built-in **introspection**, letting tools query the schema itself to generate documentation, type-safe client code, and interactive query explorers (like GraphiQL).
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2012 | **Facebook** begins internal development of GraphQL to address specific mobile app performance problems: REST's fixed representations were causing significant over-fetching on bandwidth- and battery-constrained mobile clients |
| 2015 | Facebook **open-sources GraphQL**, publishing both the specification and a JavaScript reference implementation |
| 2015 | **Apollo** (from Meteor Development Group) begins building a GraphQL client and server ecosystem, becoming the dominant tooling layer around the open specification |
| 2016 | The **GraphQL specification** stabilizes further, with growing adoption among companies facing similar mobile/multi-client data-fetching challenges (GitHub, Shopify, Yelp) |
| 2018 | The **GraphQL Foundation** is established under the Linux Foundation, formalizing GraphQL's neutral, vendor-independent governance |
| 2019 | **GitHub** launches its GraphQL API v4 as the recommended primary interface alongside its existing REST v3 API, a widely cited large-scale production adoption |
| 2020s | Continued growth of the surrounding ecosystem: Apollo Federation for composing multiple GraphQL services into one graph, GraphQL code generation tooling, and adoption across an increasing range of company sizes and industries |
| 2020s | Continued, healthy coexistence with REST and gRPC — most organizations use GraphQL specifically where its client-flexible query model provides genuine value, rather than as a wholesale REST replacement |

GraphQL's origin story — solving a very specific, concrete performance problem (mobile over-fetching) at Facebook's actual production scale — is a useful lens for evaluating its adoption elsewhere: it's most valuable precisely when an organization faces a similar concrete problem (multiple diverse clients needing different data shapes from the same underlying resources), rather than being a universal REST upgrade.
`,

  "why-it-exists": `
GraphQL exists because Facebook's mobile engineering team, in the early 2010s, faced a specific, painful problem: their REST APIs returned FIXED representations per endpoint, but different views within the Facebook mobile app needed meaningfully different subsets and combinations of that same underlying data — a news feed view needed different fields than a profile view, which needed different fields than a notifications view, all drawing from overlapping underlying resources (users, posts, comments, likes).

The prior alternative (REST, with its fixed per-endpoint representations) forced an uncomfortable choice for each view: either **over-fetch** (return a large, generic representation covering every possible client's needs, wasting bandwidth and battery on fields a specific view doesn't use) or **under-fetch** (return a minimal representation, forcing the client to make several additional round trips to assemble a complete view — a particularly costly problem on high-latency mobile networks). Facebook's engineers also considered building many narrow, view-specific REST endpoints (a "backend for frontend" pattern), but this produced its own maintenance burden: an ever-growing number of bespoke endpoints, each needing to be kept in sync with evolving client UI needs.

GraphQL's solution was to invert the relationship: instead of the SERVER deciding what shape of data to return per endpoint, the CLIENT specifies exactly what it needs in each individual query, and the server's resolvers assemble precisely that response — a genuinely different architectural bet than REST's resource-representation model, directly motivated by REST's fixed-shape model becoming a real bottleneck at Facebook's specific multi-client, multi-view mobile scale.
`,

  "problem-it-solves": `
GraphQL solves the **"different clients (or different views within one client) need different, varying shapes of data drawn from the same underlying resources, and a fixed per-endpoint REST representation forces over-fetching, under-fetching, or an unmaintainable proliferation of bespoke endpoints"** problem.

Concretely, GraphQL provides:

- **Client-specified field selection**: a query requests exactly the fields it needs (and no more), directly eliminating over-fetching for that specific client/view.
- **Single-request aggregation across related resources**: a query can traverse relationships (a user, their posts, and each post's comments) in ONE round trip, directly eliminating the under-fetching problem that would otherwise require several sequential REST requests.
- **A strongly-typed schema as a single source of truth**: every possible query, mutation, type, and field is explicitly declared, enabling compile-time validation on the client, automatic documentation generation, and confident, tooling-supported API evolution.
- **Introspection**: clients and tools can query the schema itself, enabling interactive query explorers (GraphiQL, GraphQL Playground), automatic client code generation, and strong IDE tooling support.
- **A single, stable endpoint** that evolves gracefully as new fields and types are added, without needing new endpoints for new client data needs the way REST would.

What GraphQL does **not** solve, or solves with a real tradeoff: it does NOT provide REST's native, transparent HTTP caching (since virtually all GraphQL requests go through a single POST endpoint, defeating URL-based caching — covered in depth in Internal Working); it introduces genuine query complexity and performance risk (a deeply nested query can trigger the N+1 query problem server-side, covered in Advanced Concepts, unless specifically mitigated); and it shifts real complexity from the CLIENT (which no longer needs to assemble data from several REST calls) to the SERVER (which must implement resolvers, handle query complexity limits, and often batch/cache underlying data fetches carefully) — a genuine, non-trivial engineering investment that a simple CRUD service may not need at all.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain GraphQL's core model: a single endpoint, a strongly-typed schema, client-specified queries, and server-side resolvers.
2. Write GraphQL queries and mutations, including nested field selection and variables.
3. Design a GraphQL schema using types, interfaces, unions, and appropriate nullability.
4. Implement resolvers, understanding the N+1 query problem and how DataLoader-style batching solves it.
5. Apply pagination correctly in GraphQL (specifically the Relay-style cursor connection pattern).
6. Understand GraphQL subscriptions for real-time updates, and how they relate to WebSockets (covered in its own skill).
7. Compare GraphQL against REST and gRPC, articulating specifically when GraphQL's tradeoffs are worthwhile.
8. Recognize and mitigate GraphQL-specific security risks: query complexity/depth attacks and information disclosure via introspection.
9. Answer senior-level interview questions on GraphQL's architecture, performance characteristics, and appropriate use cases.
`,

  prerequisites: `
- **Required**: the **REST** skill — understanding REST's fixed-representation model and its over/under-fetching limitations is essential context for why GraphQL exists and what it trades away.
- **Required**: basic **JSON** familiarity, since GraphQL responses are JSON-shaped (though queries themselves use GraphQL's own query language syntax).
- **Helpful**: at least one backend framework (**Express**, **FastAPI**, **NestJS**, or **Spring Boot**) for concrete GraphQL server implementation context.
- **Very helpful**: familiarity with a specific database's query patterns (any of **PostgreSQL**, **MongoDB**, or others covered in this platform's Databases category) for understanding how resolvers translate GraphQL queries into actual data fetches.

Dependency links: **REST** → this page → **gRPC**, **WebSockets**, and **Server-Sent Events** for the remaining API styles in this category.
`,

  "beginner-concepts": `
### A basic query

~~~graphql
query {
  user(id: "42") {
    name
    email
  }
}
~~~

~~~json
{
  "data": {
    "user": {"name": "Ada Lovelace", "email": "ada@example.com"}
  }
}
~~~

The client requests EXACTLY the fields it needs (name and email, in this case) — no more, no less — a direct contrast to a REST GET /users/42 response, which would typically return the user's full representation regardless of which fields this particular client actually needs.

### Nested queries (traversing relationships in one request)

~~~graphql
query {
  user(id: "42") {
    name
    posts {
      title
      comments {
        text
        author { name }
      }
    }
  }
}
~~~

This single query fetches a user, their posts, and each post's comments (including each comment's author's name) — the equivalent REST request would require at minimum three or four separate round trips (GET the user, GET their posts, GET each post's comments, GET each comment author), directly illustrating GraphQL's under-fetching solution.

### Mutations (writes)

~~~graphql
mutation {
  createUser(name: "Ada Lovelace", email: "ada@example.com") {
    id
    name
  }
}
~~~

Mutations are GraphQL's equivalent of REST's POST/PUT/PATCH/DELETE — a named operation that changes data, still specifying exactly which fields of the result it wants returned.

### The schema

~~~graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  comments: [Comment!]!
}

type Query {
  user(id: ID!): User
}

type Mutation {
  createUser(name: String!, email: String!): User!
}
~~~

The schema is GraphQL's central contract: every type, field, and its nullability (! means non-nullable) is explicitly declared, enabling both compile-time client validation and automatic documentation — a genuinely different discipline than a REST API, whose contract is typically documented separately (via OpenAPI) rather than being an intrinsic, enforced part of the API itself.

### Variables (avoiding string concatenation for dynamic queries)

~~~graphql
query GetUser(userId: ID!) {
  user(id: userId) {
    name
  }
}
~~~

Variables let a client parameterize a query without unsafe string concatenation, the GraphQL equivalent of using parameterized SQL queries rather than string-building a query (the same discipline covered in the **SQL Injection** skill).
`,

  "intermediate-concepts": `
### Resolvers

~~~javascript
const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      return await context.db.users.findById(args.id);
    },
  },
  User: {
    posts: async (parent, args, context) => {
      return await context.db.posts.findByUserId(parent.id);
    },
  },
};
~~~

A resolver is a function responsible for fetching the data for a specific field — the GraphQL server calls the appropriate resolver for each field requested in a query, recursively, and assembles the results into the final JSON response. Understanding that EACH field can have its own resolver (not just each top-level query) is essential to understanding both GraphQL's flexibility and its most significant performance pitfall, the N+1 problem, covered next.

### The N+1 query problem

~~~
Query: { users { name, posts { title } } }

Naive resolver execution:
1. Fetch all users                    -- 1 query
2. For EACH user, fetch their posts    -- N queries (one per user!)

Total: 1 + N queries, instead of 2
~~~

Because each User's posts field has its own resolver, a naive implementation calls that resolver once per user in the result set — for 100 users, this means 100 separate database queries just for the posts field, a severe, easy-to-introduce performance problem unique to GraphQL's per-field resolver model.

### DataLoader-style batching (the standard fix)

~~~javascript
const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.posts.findByUserIds(userIds);   -- ONE batched query
  return userIds.map(id => posts.filter(p => p.userId === id));
});

const resolvers = {
  User: {
    posts: (parent) => postLoader.load(parent.id),
  },
};
~~~

DataLoader (or an equivalent batching utility) collects all the individual load(id) calls made during a single query's resolution tick and issues ONE batched database query instead of N individual ones — resolving the N+1 problem, and a genuinely essential piece of any production GraphQL server's architecture, not an optional optimization.

### Pagination (the Relay cursor connection pattern)

~~~graphql
query {
  users(first: 10, after: "cursor123") {
    edges {
      node { id name }
      cursor
    }
    pageInfo { hasNextPage endCursor }
  }
}
~~~

The Relay-style connection pattern (edges, node, cursor, pageInfo) is GraphQL's standard, widely-adopted approach to cursor-based pagination — directly analogous to the cursor-based pagination covered in the **REST** skill, but with a specific, conventionalized shape that GraphQL client libraries (Apollo, Relay) understand and handle automatically (e.g., merging paginated results into a single cached list).

### Fragments (reusing field selections)

~~~graphql
fragment UserFields on User {
  id
  name
  email
}

query {
  user(id: "42") { ...UserFields }
}
~~~

Fragments let a common set of fields be defined once and reused across multiple queries, reducing duplication in client code that fetches the same shape of data in several places.
`,

  "advanced-concepts": `
### Query complexity and depth limiting

~~~javascript
const depthLimit = require("graphql-depth-limit");
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)],
});
~~~

Because GraphQL lets clients construct arbitrarily deep, nested queries (a query requesting users, their posts, each post's comments, each comment's author, that author's OTHER posts, and so on), an unbounded or maliciously deep query can trigger catastrophic server-side resource consumption — production GraphQL servers must impose explicit depth and/or computed-complexity limits, a genuinely important security and stability practice covered further in Security.

### Subscriptions (real-time updates)

~~~graphql
subscription {
  newComment(postId: "7") {
    text
    author { name }
  }
}
~~~

Subscriptions let a client receive a stream of updates over time (typically implemented via WebSockets underneath — see the **WebSockets** skill), extending GraphQL's request-response model to genuinely real-time use cases; subscriptions are less universally adopted than queries/mutations, and many production GraphQL deployments rely on a dedicated WebSocket or Server-Sent Events layer for real-time needs instead.

### Schema stitching and Apollo Federation

~~~graphql
# Users service schema
type User @key(fields: "id") {
  id: ID!
  name: String!
}

# Posts service schema — extends the User type with a field it owns
extend type User @key(fields: "id") {
  id: ID! @external
  posts: [Post!]!
}
~~~

Apollo Federation lets multiple independently-deployed GraphQL services compose into a single unified graph, with each service owning a subset of types/fields — directly analogous to a microservice architecture, but with the composition happening at the GraphQL schema layer rather than via a REST API gateway aggregating multiple REST calls.

### Persisted queries

~~~
POST /graphql
{"id": "a1b2c3", "variables": {"userId": "42"}}
~~~

Rather than sending the full query text on every request (a genuine bandwidth cost, and a potential attack surface for arbitrary query construction), persisted queries let a client send only a pre-registered query's ID plus variables — the server looks up the actual query text server-side, both reducing payload size and closing off arbitrary client-constructed queries as an attack vector.

### Caching strategies specific to GraphQL

Because GraphQL's single-endpoint, POST-based design defeats REST's native URL-based HTTP caching, production GraphQL deployments typically implement caching at a different layer: normalized client-side caching (Apollo Client's and Relay's normalized cache, storing entities by ID and de-duplicating repeated fetches of the same entity across different queries), or server-side response caching keyed on the full query-plus-variables combination (a meaningfully different, more complex caching model than REST's transparent per-URL HTTP caching).
`,

  "internal-working": `
What happens from a client's GraphQL query to the assembled JSON response:

~~~mermaid
sequenceDiagram
    participant Client
    participant Server as GraphQL server
    participant Parser as Parse + validate against schema
    participant Executor as Execution engine
    participant Resolvers as Resolvers (per field)
    participant DB as Database/services

    Client->>Server: POST /graphql {query, variables}
    Server->>Parser: parse query, validate against schema
    Parser-->>Server: validated query AST
    Server->>Executor: execute query
    Executor->>Resolvers: call resolver for each requested field\n(recursively, for nested selections)
    Resolvers->>DB: fetch data (ideally batched via DataLoader)
    DB-->>Resolvers: raw data
    Resolvers-->>Executor: resolved field values
    Executor-->>Server: assembled result tree
    Server-->>Client: 200 OK {data: {...}, errors: [...] if any}
~~~

1. **Parsing and validation**: the incoming query is parsed into an abstract syntax tree and validated against the schema — a query requesting a field that doesn't exist, or with an incorrect argument type, fails validation BEFORE any resolver runs, providing strong, early feedback.
2. **Execution**: the execution engine walks the query's field selections, calling the appropriate resolver for each field — critically, resolvers for SIBLING fields at the same level can execute concurrently, while a field nested inside another (e.g., a post's comments) only resolves after its parent field has resolved, since the resolver needs the parent's result (the post's ID, for instance) as input.
3. **Response assembly**: resolved values are assembled into a JSON tree mirroring the query's exact shape — this is precisely why GraphQL responses contain exactly the requested fields and no more, unlike a REST response's typically fixed representation.

**Why this matters**: understanding that GraphQL always returns HTTP 200 (with error details in a distinct errors array within the response body, even for what would be a client or server error in REST terms) is a genuinely important operational difference — GraphQL's error model is NOT expressed via HTTP status codes the way REST's is, a direct consequence of every GraphQL request going through one POST endpoint regardless of the specific operation's success or failure.
`,

  architecture: `
A senior engineer thinks about GraphQL API design across several dimensions: schema design as a genuine long-term contract, resolver performance (the N+1 problem specifically), and an honest evaluation of whether GraphQL's tradeoffs fit a given system's actual client needs.

### Schema-first design as the central discipline

~~~mermaid
flowchart TB
    Schema["Schema (the contract)\ntypes, queries, mutations, subscriptions"]
    Schema --> ClientCodegen["Client-side codegen\n(generates typed query results)"]
    Schema --> ServerResolvers["Server-side resolvers\n(implement the contract)"]
    Schema --> Docs["Auto-generated documentation\n(via introspection)"]
~~~

Unlike REST, where the API contract (often an OpenAPI spec) is frequently written AFTER the implementation, GraphQL strongly encourages (and its tooling assumes) a schema-first workflow: the schema is designed deliberately as a genuine long-term contract, with client codegen and server resolver implementation both deriving from it.

### When GraphQL is (and isn't) the right choice

~~~
GraphQL fits well:
├── Multiple diverse clients (web, mobile, various dashboards)
│    needing different data shapes from overlapping resources
├── Deeply nested, relationship-heavy data models
│    where REST would require many sequential round trips
├── A public API where you want to give consumers genuine
│    query flexibility without maintaining many bespoke endpoints
└── Teams willing to invest in resolver performance
     engineering (DataLoader, query complexity limits)

Consider REST instead:
├── Simple, standard CRUD-shaped resources
├── An API benefiting significantly from REST's transparent
│    HTTP caching (public content APIs, for instance)
├── A small team without capacity for GraphQL-specific
│    operational investment (complexity limiting, N+1 mitigation)
└── An AI-provider-style API primarily needing simple,
     predictable request-response semantics (see the REST skill)
~~~

This decision framework directly parallels the framework covered in the **REST** skill's own Architecture section — a senior engineer evaluates GraphQL as a deliberate choice for a specific class of problem (client-flexible querying across relationship-heavy data), not as a universal REST upgrade.

### Federation for large organizations

~~~mermaid
flowchart LR
    Client --> Gateway["Federation Gateway\n(composes the unified graph)"]
    Gateway --> UsersService["Users service\n(owns User type)"]
    Gateway --> PostsService["Posts service\n(owns Post type,\nextends User)"]
    Gateway --> CommentsService["Comments service\n(owns Comment type)"]
~~~

Apollo Federation lets a large organization's many independently-deployed services each own a subset of a unified graph, avoiding the alternative of one monolithic GraphQL server owning every type — a genuine architectural answer to GraphQL's "who owns the schema" question at organizational scale.
`,

  "data-flow": `
Tracing a nested GraphQL query end to end, including N+1 mitigation via batching:

~~~mermaid
sequenceDiagram
    participant Client
    participant Server as GraphQL server
    participant UserResolver as User resolver
    participant PostLoader as DataLoader (posts)
    participant DB as Database

    Client->>Server: query { users { name, posts { title } } }
    Server->>UserResolver: resolve users field
    UserResolver->>DB: SELECT * FROM users
    DB-->>UserResolver: [user1, user2, ..., userN]
    par For each user, resolve posts field
        Server->>PostLoader: load(user1.id)
        Server->>PostLoader: load(user2.id)
        Server->>PostLoader: load(userN.id)
    end
    PostLoader->>DB: SELECT * FROM posts WHERE user_id IN (id1, id2, ..., idN)\n(ONE batched query, not N)
    DB-->>PostLoader: all matching posts
    PostLoader-->>Server: posts grouped by user id
    Server-->>Client: {data: {users: [{name, posts: [...]}, ...]}}
~~~

The critical detail: DataLoader collects every individual load(userId) call made during this single query's resolution "tick" (a microtask-queue-based batching window) and issues exactly ONE database query for all of them together, rather than one query per user — this is precisely why DataLoader (or an equivalent batching mechanism) is considered a non-negotiable piece of any production GraphQL server, not an optional performance tweak.
`,

  "production-usage": `
### Setting up a basic GraphQL server (Apollo Server example)

~~~javascript
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const depthLimit = require("graphql-depth-limit");

const typeDefs = "#graphql\n  type User { id: ID! name: String! posts: [Post!]! }\n  type Post { id: ID! title: String! }\n  type Query { user(id: ID!): User }\n";

const resolvers = {
  Query: {
    user: async (_, { id }, { db }) => db.users.findById(id),
  },
  User: {
    posts: async (parent, _, { postLoader }) => postLoader.load(parent.id),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(7)],
});
~~~

### Non-negotiables for any production GraphQL API

1. **DataLoader-style batching on every relationship-traversing resolver** — the single most important GraphQL-specific performance discipline.
2. **Query depth and/or complexity limits** to prevent maliciously or accidentally expensive queries.
3. **A deliberate, schema-first design process**, treating the schema as a genuine long-term contract, not an incidental byproduct of resolver implementation.
4. **Disabling introspection in production** (or restricting it) if the schema itself shouldn't be publicly discoverable, covered further in Security.
5. **Structured error handling** distinguishing user-facing validation errors from internal server errors within the errors array.

### Common production patterns

- **Apollo Server or GraphQL Yoga** as the most common Node.js GraphQL server implementations.
- **Apollo Client or Relay** on the client side, both providing normalized caching that meaningfully mitigates GraphQL's lack of native HTTP caching.
- **Apollo Federation** for organizations composing multiple services into one graph.
- **Persisted queries** for public-facing or mobile GraphQL APIs, reducing payload size and closing off arbitrary query construction.
`,

  "industry-examples": `
- **GitHub's GraphQL API v4**: a widely cited large-scale production GraphQL deployment, offered as GitHub's recommended primary API alongside its legacy REST v3 API, directly demonstrating GraphQL's fit for a data model with deep, varied relationship traversal needs (repositories, issues, pull requests, users, organizations).
- **Shopify's GraphQL Admin API**: used extensively by third-party app developers needing flexible access to a complex e-commerce data model, illustrating GraphQL's fit for a public API serving diverse third-party integration needs.
- **Facebook/Meta's own internal usage**: GraphQL's original and largest-scale production deployment, still powering much of Facebook's mobile and web client data-fetching.
- **Netflix's internal GraphQL usage** (via its own Falcor precursor and later GraphQL adoption) for aggregating data across many backend services into client-friendly shapes.
- **Numerous e-commerce and content platforms** adopting GraphQL specifically for their public developer-facing APIs, where third-party integrators benefit from flexible, self-service query capability.
- **Airbnb's internal GraphQL adoption** for aggregating data across its many internal services into unified views for different client applications.
`,

  "best-practices": `
1. **Design the schema deliberately, schema-first**, treating it as a genuine long-term API contract, not an incidental output of implementation.
2. **Implement DataLoader-style batching on every resolver that could be called once per item in a list** — treat this as non-negotiable, not optional.
3. **Set explicit query depth and/or complexity limits** in production, never leaving query cost genuinely unbounded.
4. **Use nullable fields deliberately and consistently** — a field that can legitimately be absent should be nullable in the schema, avoiding runtime null-related surprises for clients.
5. **Version your schema through additive evolution** (adding new fields/types) rather than breaking changes, taking advantage of GraphQL's naturally more graceful evolution model relative to REST's URL-based versioning.
6. **Restrict or disable introspection in production** for APIs where the schema itself shouldn't be publicly discoverable.
7. **Use persisted queries for public or mobile-facing APIs** to reduce payload size and limit arbitrary query construction.
8. **Implement proper error handling within the errors array**, distinguishing validation errors from internal failures, since GraphQL doesn't use HTTP status codes for this distinction.
9. **Use fragments to reduce duplication** across client queries requesting the same shape of data in multiple places.
10. **Monitor resolver-level performance explicitly**, not just overall request latency, since a single slow resolver deep in a nested query can dominate overall response time.
11. **Consider Apollo Federation deliberately** (rather than one monolithic schema) once an organization's GraphQL usage spans multiple independently-owned services.
12. **Evaluate honestly whether GraphQL's tradeoffs fit your actual client needs** before adopting it, rather than treating it as a default REST upgrade.
`,

  "anti-patterns": `
### Ignoring the N+1 problem

~~~javascript
// WRONG — a separate database query per user in the result set
const resolvers = {
  User: {
    posts: async (parent) => await db.posts.findByUserId(parent.id),
  },
};

// RIGHT — batched via DataLoader
const resolvers = {
  User: {
    posts: (parent, _, { postLoader }) => postLoader.load(parent.id),
  },
};
~~~

Ignoring the N+1 problem is the single most common, most damaging GraphQL production mistake — a query that looks perfectly reasonable client-side can trigger hundreds of individual database queries server-side without batching in place.

### Leaving query depth/complexity unbounded

~~~graphql
# A maliciously (or accidentally) deep query, unbounded on a server
# without depth limiting, can trigger catastrophic resource consumption
query {
  user(id: "1") {
    posts {
      comments {
        author {
          posts {
            comments {
              author { posts { comments { author { name } } } }
            }
          }
        }
      }
    }
  }
}
~~~

Without an explicit depth or complexity limit, a client (malicious or simply careless) can construct an arbitrarily expensive query, since GraphQL's flexible query language places no inherent bound on nesting depth.

### Other production-grade anti-patterns

- **Treating GraphQL as a REST replacement by default**, adopting it even when a simple, standard CRUD REST API would serve the actual client needs just as well with meaningfully less operational complexity.
- **Leaving introspection enabled in production for APIs where the schema shouldn't be publicly discoverable**, an information disclosure risk covered further in Security.
- **Not monitoring resolver-level performance**, only tracking overall request latency and missing which specific resolver is the actual bottleneck.
- **Designing a schema that mirrors internal database structure directly**, rather than a client-oriented graph, tightly coupling the API contract to internal implementation details.
- **Assuming GraphQL automatically gets HTTP caching the way REST does** — it does not, by default, and requires deliberate normalized client-side caching or server-side response caching instead.
`,

  performance: `
### Rule zero: batch every list-traversing resolver with DataLoader

This is THE single most important GraphQL performance discipline — without it, seemingly reasonable client queries can trigger severe N+1 query storms against your database.

### The performance hierarchy (apply in order)

1. **Implement DataLoader-style batching on every resolver that resolves a field for each item in a list.**
2. **Set query depth and/or computed complexity limits**, bounding the worst-case cost of any single query.
3. **Use persisted queries for public/mobile clients**, reducing both payload size and arbitrary-query risk.
4. **Implement normalized client-side caching** (Apollo Client's or Relay's normalized cache) to avoid re-fetching entities the client already has.
5. **Consider server-side response caching** keyed on the full query-plus-variables combination for frequently-repeated queries.
6. **Profile resolver-level latency explicitly**, since a single slow resolver deep in a nested query can dominate the overall response time even if most other resolvers are fast.

### Micro-level facts worth knowing

- DataLoader's batching window is a single tick of the JavaScript event loop (a microtask), meaning it batches calls made synchronously within one resolution pass — calls made across separate ticks (e.g., after an intervening await on unrelated work) won't be batched together automatically.
- GraphQL's per-field resolver model means sibling fields at the same nesting level can resolve concurrently, but a nested field must wait for its parent's resolution — query shape genuinely affects achievable parallelism.
- Response caching for GraphQL is meaningfully harder than REST's URL-based caching, since the cache key must incorporate the full query text (or its persisted-query ID) plus variables, not just a URL.
`,

  scalability: `
GraphQL's single-endpoint design means horizontal scaling of the GraphQL server layer itself works similarly to any stateless REST service (more instances behind a load balancer), but the REAL scaling challenge is almost always the underlying data-fetching layer the resolvers depend on.

### The real scaling bottleneck: resolver-driven data fetches

~~~mermaid
flowchart LR
    GraphQLServers["GraphQL server instances\n(scale horizontally, same as REST)"] --> DataLoaders["DataLoader batching layer"]
    DataLoaders --> Databases["Underlying databases/services\n(the actual bottleneck at scale)"]
~~~

Because GraphQL concentrates data-fetching logic into resolvers, the underlying databases and services those resolvers call become the genuine scaling bottleneck — the same database scaling considerations (read replicas, caching layers, query optimization) covered throughout this platform's Databases category apply directly, with DataLoader batching as GraphQL's specific additional lever for reducing the NUMBER of underlying queries a given client query triggers.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| N+1-style query storms from unbatched resolvers | DataLoader-style batching, the primary GraphQL-specific lever |
| Maliciously or accidentally expensive deep queries | Query depth/complexity limits |
| Underlying database load at scale | The same database scaling techniques (read replicas, caching) covered across this platform's Databases category |
| Lack of native HTTP caching | Normalized client-side caching (Apollo/Relay) or server-side response caching keyed on query-plus-variables |
| Federation complexity as an organization's graph grows | Apollo Federation, letting services own subsets of the graph independently |
`,

  security: `
### Query depth and complexity attacks

~~~javascript
const depthLimit = require("graphql-depth-limit");
const costAnalysis = require("graphql-cost-analysis");

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7), costAnalysis({ maximumCost: 1000 })],
});
~~~

Because GraphQL's query language places no inherent bound on nesting depth or field selection breadth, an unbounded server is vulnerable to denial-of-service via maliciously (or accidentally) expensive queries — depth limiting and/or computed cost analysis (assigning a cost to each field and rejecting queries exceeding a budget) are essential production mitigations.

### Introspection and information disclosure

~~~javascript
const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== "production",
});
~~~

GraphQL's introspection capability (letting a client query the schema itself) is genuinely useful for development tooling but can expose your entire API surface — including fields or types not intended for public discovery — to anyone with API access; disabling introspection in production (or restricting it to authenticated internal tooling) is a common, important mitigation for APIs where the schema itself is sensitive.

### Authorization at the field level

~~~javascript
const resolvers = {
  User: {
    email: (parent, args, context) => {
      if (context.currentUser.id !== parent.id && !context.currentUser.isAdmin) {
        return null;   -- or throw a ForbiddenError, per your API's error-handling convention
      }
      return parent.email;
    },
  },
};
~~~

Because a GraphQL query can request ANY field on ANY type reachable from the schema, authorization checks often need to happen at the FIELD level (not just the top-level query), a meaningfully different discipline than REST's typically endpoint-level authorization checks — a senior engineer designs field-level authorization deliberately rather than assuming top-level query authorization is sufficient.

### Essential GraphQL security practices

1. **Set query depth/complexity limits** in every production deployment.
2. **Disable or restrict introspection in production** for sensitive APIs.
3. **Implement field-level authorization** where a field's visibility depends on the requesting principal, not just top-level query authorization.
4. **Use persisted queries for public/mobile clients** to close off arbitrary query construction as an attack vector.
5. **Rate-limit based on computed query cost**, not just request count, since a single expensive query can be far more costly than many simple ones.

See the **OWASP Top 10** and **Web Security** skills for the general depth this applies against.
`,

  testing: `
### Testing a GraphQL resolver

~~~javascript
const { graphql } = require("graphql");

test("user query returns the requested fields", async () => {
  const query = "query { user(id: \\"42\\") { name email } }";
  const result = await graphql({ schema, source: query, contextValue: mockContext });
  expect(result.errors).toBeUndefined();
  expect(result.data.user.name).toBe("Ada Lovelace");
});

test("deeply nested query is rejected by depth limiting", async () => {
  const deepQuery = buildDeeplyNestedQuery(10);   -- exceeds the configured depth limit
  const result = await graphql({ schema, source: deepQuery, contextValue: mockContext, validationRules: [depthLimit(7)] });
  expect(result.errors).toBeDefined();
});
~~~

### Testing for N+1 problems explicitly

~~~javascript
test("fetching posts for many users issues one batched query, not N", async () => {
  const dbSpy = jest.spyOn(db.posts, "findByUserIds");
  const query = "query { users { name posts { title } } }";
  await graphql({ schema, source: query, contextValue: mockContext });
  expect(dbSpy).toHaveBeenCalledTimes(1);   -- ONE batched call, not one per user
});
~~~

### The senior testing doctrine

- Test schema validation explicitly (a query requesting a nonexistent field should fail validation before any resolver runs).
- Test resolver-level batching explicitly, asserting the actual number of underlying database calls for a query traversing a list relationship, not just the final response shape.
- Test field-level authorization boundaries explicitly, not just top-level query authorization.
- Test depth/complexity limiting explicitly, confirming a deliberately expensive query is rejected as expected.
- Use snapshot testing carefully for GraphQL responses, being mindful that schema evolution (additive field changes) shouldn't unnecessarily break snapshots for unrelated fields.
`,

  debugging: `
### The toolbox, in escalation order

1. **Use GraphiQL or Apollo Studio's query explorer** to interactively test queries against the schema, isolating whether an issue is in the query itself or the resolver implementation.
2. **Inspect the errors array in the response** — remember GraphQL almost always returns HTTP 200, with error details in a distinct errors field, not via HTTP status codes.
3. **Log resolver-level execution and timing explicitly**, since a single slow or N+1-afflicted resolver deep in a query can dominate overall latency without being obvious from request-level metrics alone.
4. **Verify DataLoader batching is actually occurring** by counting underlying database calls for a given query, not just assuming batching is configured correctly.
5. **Check schema validation errors carefully** — a query failing validation (a typo'd field name, an incorrect argument type) produces a specific, informative error before any resolver executes.

### Debugging common GraphQL-specific symptoms

- "Query seems slow, but I don't see an obvious REST-style slow endpoint" — profile at the resolver level specifically; a nested, unbatched resolver is a very common culprit.
- "The response has null for a field I expected data in" — check field-level authorization logic and resolver error handling; a field-level authorization check silently returning null (rather than an explicit error) can look like a data bug.
- "A client's query fails validation unexpectedly" — verify the query matches the CURRENT schema exactly (field names, argument types, required versus optional arguments).
- "Server load spikes dramatically for what looks like a simple client query" — check for missing DataLoader batching or an absent/too-permissive depth limit allowing an unexpectedly expensive query shape.
`,

  monitoring: `
### Key signals to track

- **Resolver-level latency**, not just overall request latency — the field-level granularity genuinely matters for GraphQL in a way it doesn't for REST's more monolithic per-endpoint handlers.
- **Query complexity/cost distribution** across incoming requests, helping identify whether complexity limits are calibrated appropriately.
- **DataLoader batch size and cache hit rate**, confirming batching is actually reducing the number of underlying database calls as expected.
- **Error rate within the errors array**, since GraphQL's HTTP status code (almost always 200) doesn't itself signal success/failure the way REST's does.

### Tools

Apollo Studio (for Apollo-based servers) provides built-in resolver-level performance tracing and schema usage analytics; standard APM tools can be instrumented at the resolver level with custom spans for field-level timing visibility.

### Alerting priorities

Alert on resolver-level latency regressions specifically (not just overall request latency, which can mask a single slow resolver among many fast ones), on rising query complexity/rejected-query rates (an early signal of either abuse or a client-side query design issue), and on DataLoader batch efficiency dropping unexpectedly (a signal that batching may have broken for a specific resolver).
`,

  deployment: `
### A typical GraphQL server deployment

~~~dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
~~~

A GraphQL server deploys similarly to any stateless REST service — containerized, deployed behind a load balancer, scaled horizontally — since GraphQL doesn't introduce a fundamentally different deployment model at the server-instance level.

### Federation gateway deployment

~~~mermaid
flowchart LR
    Client --> Gateway["Apollo Gateway\n(deployed separately, composes the graph)"]
    Gateway --> UsersService["Users subgraph service"]
    Gateway --> PostsService["Posts subgraph service"]
~~~

For federated deployments, the gateway (composing the unified graph from multiple subgraph services) is typically deployed as its own service, with each subgraph service deployed and scaled independently — a genuinely different deployment topology than a single monolithic GraphQL server.

### CI/CD pipeline considerations

Schema validation as part of the CI pipeline (checking that proposed schema changes don't break existing client queries, often via a schema registry like Apollo Studio's) is a GraphQL-specific practice worth adopting, directly analogous to (but more schema-centric than) contract testing against an OpenAPI specification for REST APIs. See the **CI/CD** skill for the general pipeline depth this builds on.
`,

  "production-checklist": `
Before a GraphQL API takes real production traffic:

- [ ] Schema designed deliberately, schema-first, as a genuine long-term contract
- [ ] DataLoader-style batching implemented on every resolver that could otherwise trigger N+1 queries
- [ ] Query depth and/or computed complexity limits configured
- [ ] Introspection disabled or restricted in production for sensitive APIs
- [ ] Field-level authorization implemented where field visibility depends on the requesting principal
- [ ] Persisted queries configured for public/mobile clients, if applicable
- [ ] Structured error handling distinguishing validation errors from internal failures
- [ ] Resolver-level performance monitoring in place, not just request-level latency
- [ ] Rate limiting based on computed query cost, not just raw request count
- [ ] Schema validation integrated into CI, catching breaking changes before deployment
- [ ] Client-side normalized caching (Apollo Client/Relay) configured to mitigate the lack of native HTTP caching
- [ ] Load testing performed with realistic, nested query shapes (not just simple flat queries)
`,

  "common-mistakes": `
1. **Ignoring the N+1 problem**, not implementing DataLoader-style batching on relationship-traversing resolvers.
2. **Leaving query depth/complexity unbounded**, exposing the server to denial-of-service via expensive queries.
3. **Leaving introspection enabled in production** for APIs where the schema shouldn't be publicly discoverable.
4. **Adopting GraphQL as a default REST replacement**, even for simple CRUD services that don't genuinely need its query flexibility.
5. **Designing a schema that mirrors internal database structure directly**, rather than a client-oriented graph.
6. **Assuming GraphQL gets HTTP caching automatically**, without implementing normalized client-side or server-side response caching deliberately.
7. **Only checking top-level query authorization**, missing field-level authorization needs for sensitive fields.
8. **Not monitoring resolver-level performance**, missing which specific resolver is the actual bottleneck in a slow query.
9. **Treating GraphQL's error model like REST's**, expecting meaningful HTTP status codes rather than checking the errors array.
10. **Not testing N+1 behavior explicitly**, only verifying response correctness without asserting the actual number of underlying database calls.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Query fails validation with a "field does not exist" error | A typo'd field name, or the client's query is out of sync with the current schema | Verify the exact schema (via introspection/GraphiQL) and correct the query |
| Severe, unexplained server load for a seemingly simple query | Missing DataLoader batching causing an N+1 query storm | Implement/verify batching on the relevant resolver |
| Query rejected with a "max depth exceeded" error | A deeply nested query exceeding the configured depth limit | Either simplify the query or, if legitimately needed, reconsider the depth limit configuration |
| A field unexpectedly returns null | Field-level authorization silently denying access, or the underlying data genuinely being null | Check field-level authorization logic explicitly before assuming a data bug |
| Client-side type errors despite a seemingly correct query | Client codegen out of sync with the current schema | Regenerate client types against the current schema |
| Introspection query succeeds unexpectedly in production | Introspection not disabled/restricted for a sensitive API | Disable or restrict introspection outside development environments |
| Subscription connection drops unexpectedly | Underlying WebSocket connection issue (see the WebSockets skill for the transport-layer depth) | Verify WebSocket connection handling and reconnection logic |
`,

  faqs: `
**Is GraphQL a replacement for REST?**
Not universally — GraphQL is a deliberate architectural choice best suited to APIs serving diverse clients with varying data needs across relationship-heavy resources; REST remains the better default for simple CRUD services, public content APIs benefiting from native HTTP caching, and cases where GraphQL's added operational complexity (batching, depth limiting) isn't justified by genuine query-flexibility needs.

**Why does GraphQL always return HTTP 200, even for errors?**
Because a single GraphQL request can partially succeed (some fields resolve successfully while others error), GraphQL's error model uses a distinct errors array within the response body rather than relying on HTTP status codes to communicate success/failure — this is a genuinely important operational difference from REST's status-code-driven error signaling.

**What is the N+1 problem, and why is it GraphQL-specific?**
It's the pattern where a query traversing a one-to-many relationship (e.g., users and their posts) triggers one query per item in the "many" side if resolvers aren't batched — it's especially prominent in GraphQL because of its per-field resolver model, though the underlying problem (naive relationship traversal triggering many small queries) can occur in any ORM-based system; DataLoader-style batching is the standard GraphQL-specific fix.

**Does GraphQL support real-time updates?**
Yes, via subscriptions, typically implemented over WebSockets — though subscriptions are less universally adopted than queries/mutations, and some production systems use a dedicated WebSocket or Server-Sent Events layer (covered in their own skills) for real-time needs instead of GraphQL subscriptions specifically.

**How does GraphQL handle API versioning?**
GraphQL generally favors additive schema evolution (adding new fields/types) over REST's URL-based versioning (/v1/, /v2/) — since clients request only the specific fields they need, adding new fields doesn't break existing queries, allowing a single, continuously-evolving schema rather than multiple parallel API versions.

**What's Apollo Federation, and when do I need it?**
It's a pattern for composing multiple independently-deployed GraphQL services into one unified graph, each service owning a subset of types/fields — needed once an organization's GraphQL usage spans multiple teams/services that would otherwise need to coordinate changes to one monolithic schema.
`,

  "interview-questions": `
### Junior level

1. **What is the core difference between how REST and GraphQL let a client specify what data it wants?**
   Model answer: REST returns a fixed representation per endpoint regardless of what the client actually needs; GraphQL lets the client specify exactly which fields it wants in each individual query, avoiding both over-fetching and under-fetching.

2. **What is a GraphQL schema, and why does it matter?**
   Model answer: a strongly-typed definition of every available query, mutation, type, and field, serving as the API's central contract — it enables compile-time client validation, automatic documentation via introspection, and confident API evolution.

3. **What is a resolver?**
   Model answer: a function responsible for fetching the data for a specific field in a GraphQL query; the server calls the appropriate resolver for each requested field, recursively, to assemble the final response.

4. **Why does GraphQL typically return HTTP 200 even when part of a query fails?**
   Model answer: because a single request can partially succeed (some fields resolve, others error), GraphQL communicates errors via a distinct errors array in the response body rather than via HTTP status codes.

5. **What is the N+1 problem in GraphQL?**
   Model answer: when resolving a field for each item in a list (e.g., each user's posts) triggers one separate query per item rather than one batched query, causing severe performance problems at scale.

### Senior level

6. **How does DataLoader solve the N+1 problem, mechanically?**
   Model answer: it collects all individual load(id) calls made during a single query resolution's synchronous execution window (a microtask tick) and issues one batched underlying query for all of them together, rather than a separate query per call — turning N individual queries into one.

7. **Why doesn't GraphQL get REST's transparent HTTP caching by default, and how do production systems address this?**
   Model answer: because virtually all GraphQL requests go through a single POST endpoint, URL-based HTTP caching (which depends on distinguishing requests by URL) doesn't apply naturally; production systems instead use normalized client-side caching (Apollo Client's/Relay's entity-based cache) and/or server-side response caching keyed on the full query-plus-variables combination.

8. **What security risks does GraphQL introduce that REST typically doesn't, and how do you mitigate them?**
   Model answer: unbounded query depth/complexity (mitigated via depth limiting and/or computed cost analysis) and potential information disclosure via introspection exposing the full schema (mitigated by disabling/restricting introspection in production for sensitive APIs).

9. **When would you choose GraphQL over REST for a new API, and when would you choose REST instead?**
   Model answer: choose GraphQL when diverse clients need meaningfully different data shapes from overlapping, relationship-heavy resources, and the team can invest in resolver performance engineering (batching, complexity limits); choose REST for simple CRUD-shaped resources, public APIs benefiting from native HTTP caching, or teams without capacity for GraphQL-specific operational overhead.

10. **How would you design field-level authorization in GraphQL, and why is it different from REST's typical authorization model?**
    Model answer: because a query can request any field on any type reachable from the schema, authorization often needs to happen within individual field resolvers (checking the requesting principal's permission for that SPECIFIC field), not just at the top-level query — a meaningfully more granular discipline than REST's typically endpoint-level authorization checks.

11. **What is Apollo Federation, and what organizational problem does it solve?**
    Model answer: a pattern letting multiple independently-deployed GraphQL services each own a subset of a unified graph's types/fields, composed by a gateway — it solves the "who owns the schema" coordination problem that arises once a large organization's GraphQL usage spans many teams that would otherwise need to coordinate every change to one monolithic schema.

12. **How would you evolve a GraphQL schema without breaking existing clients?**
    Model answer: favor additive changes (new fields, new types) since existing queries requesting only their original fields remain unaffected; avoid removing or renaming fields still in use, instead deprecating them (via the deprecated schema directive) and monitoring actual field usage before eventual removal, rather than relying on REST-style parallel API versions.
`,

  "coding-questions": `
### 1. Implement a DataLoader-batched resolver

~~~javascript
const DataLoader = require("dataloader");

function createPostLoader(db) {
  return new DataLoader(async (userIds) => {
    const posts = await db.posts.findByUserIds(userIds);
    return userIds.map(id => posts.filter(p => p.userId === id));
  });
}

const resolvers = {
  User: {
    posts: (parent, args, context) => context.postLoader.load(parent.id),
  },
};
# Follow-up: why must a NEW DataLoader instance be created per request
# (rather than reused across requests), and what would happen if a single
# shared instance were used across multiple concurrent requests instead?
~~~

### 2. Implement a query complexity limit

~~~javascript
const { createComplexityLimitRule } = require("graphql-validation-complexity");

const ComplexityLimitRule = createComplexityLimitRule(1000, {
  scalarCost: 1,
  objectCost: 2,
  listFactor: 10,
});

const server = new ApolloServer({
  schema,
  validationRules: [ComplexityLimitRule],
});
# Follow-up: why does a listFactor multiplier matter specifically for
# fields returning lists, and how would you calibrate the cost budget
# (1000, here) appropriately for your actual schema and typical query shapes?
~~~

### 3. Implement Relay-style cursor pagination

~~~javascript
async function resolveUsersConnection(first, after) {
  const afterId = after ? decodeCursor(after) : 0;
  const users = await db.users.findAfter(afterId, first + 1);
  const hasNextPage = users.length > first;
  const nodes = hasNextPage ? users.slice(0, -1) : users;
  return {
    edges: nodes.map(u => ({ node: u, cursor: encodeCursor(u.id) })),
    pageInfo: {
      hasNextPage,
      endCursor: nodes.length ? encodeCursor(nodes[nodes.length - 1].id) : null,
    },
  };
}
# Follow-up: why does fetching first + 1 items (rather than exactly
# first) let you determine hasNextPage without an additional query,
# and how would this pattern extend to support backward pagination
# (before/last) as well?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a basic GraphQL schema and server
Design a schema for a simple blog domain (users, posts, comments) and implement queries and mutations using a framework of your choice (Apollo Server, GraphQL Yoga). Deliverable: a working GraphQL server supporting nested queries across the domain. Skills exercised: schema design, resolver implementation.

### Lab 2 (Intermediate): Fix an N+1 problem with DataLoader
Given a GraphQL server exhibiting an N+1 problem (a resolver issuing one query per item in a list), profile the actual database query count, then implement DataLoader-style batching and verify the query count drops to the expected batched amount. Deliverable: a before/after comparison with measured query counts. Skills exercised: N+1 diagnosis, DataLoader batching.

### Lab 3 (Advanced): Implement query depth limiting and field-level authorization
Add query depth limiting to prevent maliciously deep queries, and implement field-level authorization for a sensitive field (e.g., a user's email, visible only to that user or an admin). Deliverable: a hardened GraphQL API with a security test suite proving both protections work. Skills exercised: query complexity limiting, field-level authorization.

### Lab 4 (Production): Design a federated GraphQL architecture
Split a monolithic schema into two independently-deployable subgraph services (e.g., Users and Posts) composed via Apollo Federation, verifying that a client query spanning both subgraphs still resolves correctly through the gateway. Deliverable: a working federated deployment with a documented schema ownership boundary. Skills exercised: Apollo Federation, distributed schema design.
`,

  "real-projects": `
### 1. A multi-client mobile and web dashboard aggregating data from several backend services
Engineering requirements: a GraphQL layer aggregating data from multiple underlying REST/database services into client-specific shapes, with DataLoader batching for every relationship traversal, and normalized client-side caching (Apollo Client) to minimize redundant re-fetches across different dashboard views.

### 2. A public developer-facing e-commerce API
Engineering requirements: a GraphQL API exposing a complex product/inventory/order data model to third-party integrators, with persisted queries for approved integration partners, query complexity limits to prevent abuse, and careful field-level authorization distinguishing what data is visible to different partner tiers.

### 3. A federated internal graph across multiple engineering teams
Engineering requirements: splitting a growing monolithic GraphQL schema into team-owned subgraphs (Users, Orders, Inventory, each independently deployed) composed via Apollo Federation, with schema validation integrated into each team's CI pipeline to prevent one team's changes from breaking another's queries.
`,

  "case-studies": `
### GitHub's dual REST-and-GraphQL API strategy
GitHub's decision to offer GraphQL (v4) as its RECOMMENDED primary API alongside its existing, still-supported REST API (v3) illustrates a mature, honest positioning: rather than forcing a full migration, GitHub let each API style serve the use cases it genuinely fits best, with GraphQL addressing the specific pain of assembling complex, relationship-heavy views (a repository with its issues, pull requests, and contributors) that would require many REST round trips. Lesson: adopting GraphQL doesn't require abandoning REST — a deliberate coexistence strategy, each style serving its genuine strengths, is a common and reasonable production pattern.

### Facebook's original mobile over-fetching problem
GraphQL's origin at Facebook — solving a very specific, measurable mobile bandwidth/battery problem caused by REST's fixed representations — is a useful case study in matching an architectural choice to a concrete, well-understood problem rather than adopting a new technology speculatively. Lesson: the strongest justification for adopting GraphQL is a concrete, measurable pain point (like Facebook's actual mobile over-fetching costs) rather than a general sense that "GraphQL is more modern than REST."

### The industry's shift toward DataLoader as a near-universal GraphQL requirement
The near-universal adoption of DataLoader (or an equivalent batching utility) across production GraphQL deployments, to the point where its absence is considered a significant production risk rather than an optional optimization, illustrates how a framework's most severe failure mode (here, the N+1 problem) can become so well-understood industry-wide that its mitigation becomes a de facto required part of the technology's correct usage. Lesson: understanding a technology's most common failure mode deeply (and its standard, expected mitigation) is often as important as understanding its intended benefits when adopting it in production.
`,

  comparisons: `
| Aspect | GraphQL | REST | gRPC | WebSockets | Server-Sent Events |
|--------|---------|------|------|------------|---------------------|
| Data format | JSON (typed schema) | Typically JSON | Protocol Buffers (binary) | Any | Text (typically JSON payloads) |
| Endpoint model | Single endpoint | Many resource-specific URLs | Service-defined RPC methods | A dedicated connection | HTTP long-lived connection |
| Client data flexibility | High — client specifies exact fields | Fixed per endpoint | Fixed per RPC method | Application-defined | Application-defined |
| HTTP caching | Not native (requires custom caching layers) | Native, transparent | Not applicable | Not applicable | Not typically cached |
| Best fit | Diverse clients needing varied data shapes from relationship-heavy resources | Public APIs, standard CRUD, broad interoperability | High-throughput internal service communication | Real-time bidirectional communication | Server-to-client streaming |

**How seniors choose**: reach for GraphQL specifically when diverse clients need meaningfully different, relationship-heavy data shapes from overlapping resources, and the team can invest in resolver performance engineering (DataLoader batching, complexity limits); reach for REST, gRPC, WebSockets, or Server-Sent Events (each covered in its own skill) when their specific strengths better fit the actual problem — GraphQL is a deliberate architectural bet, not a universal REST replacement.
`,

  "related-technologies": `
- **REST** — the architectural style GraphQL most directly addresses the limitations of (over/under-fetching); see its own skill for the full comparison.
- **gRPC** — the high-performance alternative for internal service-to-service communication, a different problem than GraphQL's client-flexible querying focus.
- **WebSockets** — the transport most commonly underlying GraphQL subscriptions for real-time updates.
- **Apollo Client / Relay** — the dominant client-side GraphQL libraries, providing normalized caching that mitigates GraphQL's lack of native HTTP caching.
- **DataLoader** — the standard batching utility solving GraphQL's N+1 query problem.
- **Apollo Federation** — the pattern for composing multiple GraphQL services into one unified graph at organizational scale.

Learning path: **REST** → this page → **gRPC**/**WebSockets**/**Server-Sent Events** for the remaining API styles in this category.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Continued healthy coexistence between GraphQL, REST, and gRPC across the industry, with organizations increasingly making deliberate, use-case-specific choices rather than treating any one style as a universal default.
- Apollo Federation continues to mature as the dominant pattern for composing multi-team, multi-service GraphQL architectures at scale.
- Continued tooling investment in schema registries and CI-integrated schema validation, catching breaking schema changes before they reach production.
- Growing interest in GraphQL for AI application contexts specifically where a chat or agent interface needs to aggregate data flexibly across many underlying tools/services — an emerging use case somewhat analogous to GraphQL's original mobile-client motivation.
- Given how quickly GraphQL tooling and best practices continue to evolve, verify current framework-specific implementation details (Apollo Server, GraphQL Yoga, and others) against their official documentation rather than assuming long-term stability of any specific library API.
`,

  "future-roadmap": `
Where GraphQL is heading, and what's worth betting career time on:

- **Continued maturation of federation patterns** for large-scale, multi-team GraphQL architectures, likely remaining the dominant answer to organizational schema-ownership challenges.
- **Continued growth in schema-registry and CI-integrated tooling**, further reducing the operational risk of breaking schema changes reaching production.
- **Continued honest, use-case-specific coexistence with REST and gRPC**, rather than GraphQL displacing either — each style's genuine strengths (REST's caching and simplicity, gRPC's wire efficiency, GraphQL's client-flexible querying) are likely to remain distinct and complementary rather than converging.
- **What to bet on**: deeply understanding resolver performance engineering (the N+1 problem and DataLoader-style batching specifically) and query security (depth/complexity limiting) — these are the genuinely hard, differentiating skills in production GraphQL work, far more valuable long-term than memorizing a specific client library's API surface.
`,

  "cheat-sheet": `
~~~graphql
# ---- Query: client specifies EXACTLY the fields it wants ----
query {
  user(id: "42") {
    name
    posts { title comments { text author { name } } }   # ONE round trip, deeply nested
  }
}

# ---- Mutation: writes, same field-selection principle ----
mutation {
  createUser(name: "Ada", email: "ada@example.com") { id name }
}

# ---- Schema: the central, strongly-typed contract ----
# type User { id: ID! name: String! posts: [Post!]! }
# type Query { user(id: ID!): User }

# ---- THE N+1 problem -- the #1 GraphQL production risk ----
# Naive: 1 query for users + N queries (one per user) for posts
# Fix: DataLoader batches all load(id) calls in one tick into ONE query
~~~

~~~javascript
// ---- DataLoader: non-negotiable for any relationship-traversing resolver ----
const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.posts.findByUserIds(userIds);   // ONE batched call
  return userIds.map(id => posts.filter(p => p.userId === id));
});

// ---- Query depth/complexity limiting -- essential production guardrail ----
validationRules: [depthLimit(7), costAnalysis({ maximumCost: 1000 })]

// ---- Disable introspection in production for sensitive schemas ----
introspection: process.env.NODE_ENV !== 'production'
~~~

~~~
# ---- Error model: almost ALWAYS returns HTTP 200 ----
# Check the "errors" array in the response body, NOT the status code.

# ---- Relay-style cursor pagination (the GraphQL standard) ----
# query { users(first: 10, after: "cursor") { edges { node { id } cursor } pageInfo { hasNextPage } } }

# ---- No native HTTP caching (single POST endpoint) ----
# Use Apollo Client/Relay normalized cache, or server-side response caching
# keyed on query + variables.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Core GraphQL idea vs REST? | Client specifies exactly which fields it wants, instead of the server dictating a fixed representation. |
| What is a resolver? | A function that fetches the data for one specific field in a query. |
| What is the N+1 problem? | Resolving a field per list item triggers N separate queries instead of one batched query. |
| How does DataLoader fix N+1? | Batches all load() calls made in one resolution tick into a single underlying query. |
| Why doesn't GraphQL get REST's HTTP caching? | Almost all requests go through one POST endpoint, defeating URL-based caching. |
| How does GraphQL signal errors? | An "errors" array in the response body -- HTTP status is almost always 200. |
| What guards against maliciously deep queries? | Query depth limiting and/or computed complexity/cost analysis. |
| Why disable introspection in production? | It exposes the entire schema -- an information disclosure risk for sensitive APIs. |
| GraphQL's standard pagination pattern? | Relay-style cursor connections: edges, node, cursor, pageInfo. |
| How does GraphQL handle versioning? | Additive schema evolution (new fields/types) instead of REST's /v1//v2/ URLs. |
| What is Apollo Federation for? | Composing multiple independently-deployed GraphQL services into one unified graph. |
| When should you choose REST over GraphQL? | Simple CRUD, public content APIs needing native HTTP caching, small teams without capacity for batching/complexity-limit overhead. |
`,

  mcqs: `
1. What is the core architectural difference between GraphQL and REST?
   A) GraphQL uses XML instead of JSON  B) The client specifies exactly which fields it wants, rather than the server returning a fixed representation  C) GraphQL doesn't support mutations  D) REST is always faster
   **Answer: B** — this directly addresses REST's over-fetching and under-fetching problems.

2. What is the N+1 problem in GraphQL?
   A) A schema versioning issue  B) Resolving a field once per item in a list triggers N separate underlying queries instead of one batched query  C) A security vulnerability in mutations  D) A caching bug
   **Answer: B** — DataLoader-style batching is the standard fix.

3. How does GraphQL typically communicate errors to the client?
   A) Via HTTP status codes, exactly like REST  B) Via a distinct "errors" array in the response body, usually alongside HTTP 200  C) GraphQL cannot return errors  D) Via a separate error endpoint
   **Answer: B** — since a single request can partially succeed, error signaling doesn't map onto one HTTP status code.

4. Why doesn't GraphQL benefit from REST's native, transparent HTTP caching by default?
   A) GraphQL doesn't use HTTP at all  B) Virtually all requests go through a single POST endpoint, defeating URL-based caching  C) GraphQL responses are never cacheable  D) GraphQL only supports GET requests
   **Answer: B** — production systems compensate with normalized client-side caching or server-side response caching keyed on query-plus-variables.

5. What production risk does leaving GraphQL query depth/complexity unbounded create?
   A) Slower client-side rendering only  B) Denial-of-service via maliciously or accidentally expensive, deeply nested queries  C) Schema versioning conflicts  D) Introspection failures
   **Answer: B** — depth limiting and/or computed complexity analysis are essential production mitigations.

6. What does DataLoader do, mechanically?
   A) Caches the entire schema  B) Collects individual load() calls made within one resolution tick and issues one batched underlying query for all of them  C) Validates query syntax  D) Handles authentication
   **Answer: B** — this is the standard, essential fix for the N+1 problem.
`,

  "revision-notes": `
GraphQL is a query language and runtime for APIs, originally developed at Facebook to solve a specific, concrete mobile performance problem: REST's fixed per-endpoint representations were causing significant over-fetching (returning more data than a specific view needed) and under-fetching (requiring several sequential round trips to assemble one view) on bandwidth- and battery-constrained mobile clients. GraphQL inverts REST's model: instead of the server dictating a fixed representation per endpoint, the CLIENT specifies exactly which fields it needs, across however many related resources, in a single request resolved through one endpoint (typically POST /graphql).

A GraphQL API is defined by a strongly-typed **schema** declaring every available query, mutation, type, and field — a genuine, enforced contract that enables compile-time client validation, automatic documentation via introspection, and confident API evolution. **Resolvers** are functions responsible for fetching each individual field's data; because each field can have its own resolver, a query traversing a relationship (e.g., users and their posts) can trigger the **N+1 problem** — one query per item in a list rather than a single batched query — if resolvers aren't explicitly batched. **DataLoader** (or an equivalent batching utility) is the standard, essential fix: it collects every individual load(id) call made during one query's resolution tick and issues exactly one batched underlying query, a genuinely non-negotiable piece of any production GraphQL server's architecture rather than an optional optimization.

GraphQL's error model differs meaningfully from REST's: because a single request can partially succeed (some fields resolving, others erroring), GraphQL communicates errors via a distinct **errors array** within the response body, with the HTTP status code almost always remaining 200 regardless of whether individual fields succeeded — an important operational difference from REST's status-code-driven signaling. GraphQL also does NOT get REST's native, transparent HTTP caching by default, since virtually all requests flow through a single POST endpoint, defeating URL-based caching; production systems compensate with normalized client-side caching (Apollo Client's or Relay's entity-based cache) or server-side response caching keyed on the full query-plus-variables combination.

Because GraphQL's flexible query language places no inherent bound on nesting depth or field-selection breadth, an unbounded server is vulnerable to denial-of-service via maliciously or accidentally expensive deep queries — explicit **query depth and/or computed complexity limits** are an essential production security mitigation, alongside disabling or restricting **introspection** in production for APIs whose schema shouldn't be publicly discoverable. Authorization in GraphQL often needs to happen at the FIELD level (since a query can request any field on any reachable type), a meaningfully more granular discipline than REST's typically endpoint-level authorization checks.

A senior engineer evaluates GraphQL as a deliberate architectural choice for a specific class of problem — diverse clients needing meaningfully different, relationship-heavy data shapes from overlapping resources, where the team can invest in resolver performance engineering — rather than adopting it as a universal REST replacement; REST remains the better default for simple CRUD-shaped resources, public APIs benefiting from native HTTP caching, and teams without capacity for GraphQL-specific operational overhead (batching, complexity limiting). **Apollo Federation** addresses the organizational scaling challenge of a growing GraphQL usage spanning multiple teams, letting each team's service own a subset of a unified graph's types/fields rather than requiring coordination on one monolithic schema.
`,

  "learning-roadmap": `
**Week 1 — GraphQL fundamentals**: schema design, queries, mutations, and basic resolver implementation. Milestone: build a working GraphQL server for a simple domain (e.g., a blog) with nested query support.

**Week 2 — Solving the N+1 problem**: understanding the N+1 problem concretely, implementing DataLoader-style batching, and verifying the actual query count reduction. Milestone: profile and fix an N+1 problem in the Week 1 server, measuring before/after query counts.

**Week 3 — Pagination and query security**: Relay-style cursor pagination, query depth limiting, and computed complexity analysis. Milestone: add pagination and depth/complexity limits, with tests proving overly expensive queries are rejected.

**Week 4 — Authorization and error handling**: field-level authorization, structured error handling within the errors array, and introspection restriction for production. Milestone: implement and test field-level authorization for a sensitive field.

**Week 5 — Caching and subscriptions**: normalized client-side caching (Apollo Client), and implementing a basic subscription for real-time updates. Milestone: build a client consuming the API with normalized caching, and a working subscription feature.

**Week 6 — Federation and architectural decision-making**: splitting a schema into federated subgraphs, and comparing GraphQL against REST/gRPC for a range of hypothetical scenarios. Milestone: complete a federated two-service deployment and a written decision framework applied to at least three scenarios.

Next platform skill once this roadmap is complete: **gRPC** for the high-performance internal service communication alternative, or **WebSockets** for the real-time bidirectional communication this category also covers.
`,

  "official-docs": `
- **graphql.org** — the official GraphQL specification and documentation, the primary reference for the query language and type system.
- **Apollo's official documentation (apollographql.com/docs)** — comprehensive documentation for Apollo Server, Apollo Client, and Apollo Federation, the most widely used GraphQL ecosystem tooling.
- **The Relay documentation (relay.dev)** — official documentation for Facebook's own GraphQL client, including the origin of the cursor connection pagination pattern.
- **graphql-js (the official JavaScript reference implementation)** — the reference implementation documentation, useful for understanding GraphQL's execution model precisely.
`,

  books: `
- **"Learning GraphQL" — Eve Porcello and Alex Banks** — a widely recommended, practical introduction covering schema design, queries, and client/server implementation.
- **"Production Ready GraphQL" — Marc-André Giroux** — a deep, practitioner-focused treatment of exactly the production concerns covered on this page: N+1 mitigation, security, schema design discipline, and performance.
- **"Building Microservices" — Sam Newman** — covers GraphQL and Federation within the broader microservice architecture context, useful for the organizational-scale schema-ownership questions.
`,

  blogs: `
- **Apollo's official engineering blog** — extensive coverage of GraphQL best practices, Federation patterns, and production case studies.
- **GitHub's engineering blog posts on their GraphQL API v4** — a detailed, widely-referenced case study of a large-scale production GraphQL deployment.
- **Shopify's engineering blog on their GraphQL Admin API** — covers real-world lessons from a large, actively evolving public GraphQL API.
- **The GraphQL Foundation's own blog and community resources** — updates on the specification and broader ecosystem developments.
`,

  "research-papers": `
GraphQL originated as an industry engineering solution (at Facebook) rather than an academic research project, so there is limited dedicated peer-reviewed literature specifically about it; the most relevant related reading:

- **The official GraphQL specification** itself (graphql.org/spec) — the closest equivalent to a formal technical specification, functioning as the authoritative definition of the query language and execution model.
- See the **REST** skill's own Research Papers section (Fielding's dissertation) for the architectural style GraphQL most directly reacts against.
- General distributed systems and API design literature on schema evolution and backward compatibility applies broadly to GraphQL's additive schema evolution model.
`,

  videos: `
- **Lee Byron's (GraphQL co-creator) talks on GraphQL's origin and design philosophy** — available across various conference archives, offering direct insight into the original motivating problems.
- **Apollo's official GraphQL Summit conference talks** — the primary industry conference specifically for GraphQL, covering production patterns, Federation, and case studies from adopting companies.
- **"GraphQL vs REST vs gRPC" comparative talks** (various creators) providing a quick comparative overview across this category's related skills.
- **Framework-specific GraphQL tutorials** (Apollo Server, GraphQL Yoga official channels) for hands-on implementation walkthroughs.
`,

  "github-repos": `
- **graphql/graphql-js** — the official JavaScript reference implementation of the GraphQL specification.
- **apollographql/apollo-server** and **apollographql/apollo-client** — the dominant GraphQL server and client implementations in the JavaScript ecosystem.
- **graphql/dataloader** — the official DataLoader batching utility repository, the standard N+1 mitigation tool.
- **facebook/relay** — Facebook's own GraphQL client, the origin of the cursor connection pagination pattern.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Schema design basics**: design a GraphQL schema for a given domain (e.g., an e-commerce catalog with products, categories, and reviews), including appropriate nullability and relationship types.
2. **N+1 diagnosis and fix**: given a GraphQL server with an unbatched resolver, profile the actual query count for a nested query, then implement DataLoader batching and verify the reduction.
3. **Query security**: implement and test both a query depth limit and a computed complexity limit, writing tests proving each rejects an appropriately expensive query.
4. **Pagination implementation**: implement Relay-style cursor pagination for a list field, including correct hasNextPage/endCursor behavior.
5. **Field-level authorization**: implement and test field-level authorization for a sensitive field, ensuring unauthorized principals receive an appropriate response (null or an explicit error, per your chosen convention).
6. **External practice sets**: Apollo's official GraphQL tutorial track for structured, guided practice; GitHub's public GraphQL API (with a personal access token) for exploring a large, real-world production schema via GraphiQL.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Clients
        WebApp["Web app"]
        MobileApp["Mobile app"]
        ThirdParty["Third-party integrator"]
    end
    subgraph Gateway["GraphQL Gateway (Federation)"]
        FedGateway["Apollo Gateway\n(composes the unified graph)"]
    end
    subgraph Subgraphs
        UsersService["Users subgraph\n(owns User type)"]
        PostsService["Posts subgraph\n(owns Post type, extends User)"]
        CommentsService["Comments subgraph\n(owns Comment type)"]
    end
    subgraph DataLayer
        DataLoaders["DataLoader batching layer"]
        DB[("Databases")]
    end
    WebApp --> FedGateway
    MobileApp --> FedGateway
    ThirdParty --> FedGateway
    FedGateway --> UsersService
    FedGateway --> PostsService
    FedGateway --> CommentsService
    UsersService --> DataLoaders
    PostsService --> DataLoaders
    CommentsService --> DataLoaders
    DataLoaders --> DB
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((GraphQL))
    Foundations
      Overview
      History Facebook 2015
      Why it exists
      Problem it solves
    Core Model
      Single endpoint
      Strongly typed schema
      Queries and mutations
      Resolvers
      Introspection
    Performance
      N plus 1 problem
      DataLoader batching
      Query complexity limits
    Pagination
      Relay cursor connections
    Real Time
      Subscriptions
      WebSockets transport
    Security
      Depth limiting
      Introspection restriction
      Field level authorization
    Scale
      Apollo Federation
      Persisted queries
      Normalized caching
    Comparisons
      Versus REST gRPC WebSockets SSE
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default graphql;
