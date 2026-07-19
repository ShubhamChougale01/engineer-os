import type { SkillContent } from "../types";

/**
 * Express — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const express: SkillContent = {
  overview: `
Express is a minimal, unopinionated web framework for Node.js — the de facto default choice for building HTTP servers and APIs in JavaScript, in the same spirit as Flask's minimalism for Python but for the Node.js/JavaScript ecosystem. Express provides routing, middleware composition, and request/response helpers on top of Node's built-in http module, and deliberately leaves the choice of database layer, authentication scheme, and project structure to the developer — a design philosophy that has made it simultaneously one of the most widely used web frameworks in the world and one of the most frequently wrapped by higher-level, more opinionated frameworks (NestJS being the most prominent) built on top of it.

For an AI engineer, Express shows up constantly as the backend layer for full-stack JavaScript/TypeScript applications — a chat UI's backend proxying requests to an LLM API, a webhook receiver for a third-party AI service, or the API layer of a Next.js-adjacent full-stack application where the team wants to stay in one language across frontend and backend. Express's middleware pattern (a chain of functions each handling one concern — auth, logging, error handling — composed together) is a foundational concept that shows up, in spirit, across nearly every subsequent Node.js web framework, including NestJS and Fastify.

Key characteristics: an unopinionated, minimal core (routing and middleware, nothing more, by design); the middleware pattern as Express's single most important architectural idea; Node's event-loop-based, single-threaded, non-blocking I/O concurrency model underneath everything Express does; and — because JavaScript is Express's language — first-class, natural handling of JSON as the default data-interchange format for APIs.
`,

  history: `
Express was created by **TJ Holowaychuk**, building on Node.js itself (released by Ryan Dahl in 2009) to provide a thin, Sinatra-inspired (Ruby's minimal web framework) web layer for the then-new server-side JavaScript runtime.

| Year | Milestone |
|------|-----------|
| 2009 | Node.js is released by Ryan Dahl, bringing JavaScript to server-side, event-driven, non-blocking I/O |
| 2010 | **Express** is released by TJ Holowaychuk, explicitly inspired by Ruby's Sinatra framework's minimalism |
| 2014 | Express 4.0 — a significant internal rewrite, removing bundled middleware from the core (a deliberate move toward an even more minimal, composable core) |
| 2015 | TJ Holowaychuk steps back from active Express maintenance; the project transitions to community/foundation stewardship |
| 2016 | Express becomes part of the **Node.js Foundation** (later the OpenJS Foundation), ensuring continued stewardship independent of any single maintainer |
| 2017 | Express reaches roughly 50% of all Node.js web framework usage in developer surveys, cementing its position as the ecosystem default |
| 2020s | Newer frameworks (Fastify, Koa, Hono) emerge with performance or design improvements, but Express remains the most widely deployed choice due to its enormous existing codebase footprint and middleware ecosystem |
| 2022 | **Express 5.0** enters beta after years of development, modernizing internals (native Promise support in route handlers, dropped legacy Node version support) while preserving the familiar API |
| 2024–2025 | Express 5.0 reaches stable release, addressing long-standing async error-handling pain points from Express 4's callback-era design |

Express's multi-year gap between 4.0 (2014) and a stable 5.0 (mid-2020s) mirrors Flask's slow, conservative path to 1.0 — both frameworks prioritized not breaking an enormous existing ecosystem of middleware and applications over shipping major-version changes quickly.
`,

  "why-it-exists": `
Express exists because Node.js's built-in http module, while capable, is extremely low-level: **parsing routes, handling different HTTP methods, and composing cross-cutting concerns like logging or authentication all had to be hand-rolled** for every single Node.js project without a framework, or every team reinvented similar-but-incompatible patterns.

The prior landscape (early Node.js, pre-Express) offered:

1. **Raw http.createServer()**: full control, but every route, every piece of body-parsing logic, and every cross-cutting concern (logging, error handling) is manual, repetitive boilerplate.
2. **Heavier, more opinionated frameworks from other ecosystems** ported awkwardly to Node — none yet captured JavaScript's own idioms (callbacks at the time, later Promises/async-await) naturally.

Express's insight, borrowed directly from Sinatra's success in the Ruby world, was that a THIN routing and middleware layer — not a full framework — was exactly what a young, rapidly growing Node.js ecosystem needed: enough structure to stop everyone reinventing routing and request parsing, but unopinionated enough to let the surrounding ecosystem (which was still actively figuring out its own conventions for databases, templating, and authentication) evolve independently. The middleware pattern specifically — small, composable functions each handling one concern, chained together — became Express's most influential and durable contribution, echoed in nearly every Node.js framework that followed.
`,

  "problem-it-solves": `
Express solves the **"stop hand-rolling routing and cross-cutting request/response logic on top of Node's raw http module"** problem.

Concretely, Express provides:

- **Declarative routing**: mapping an HTTP method and path pattern to a handler function, instead of manually parsing req.url and req.method in a giant if/else chain.
- **The middleware pattern**: composable functions (app.use(...)) that each handle one cross-cutting concern (body parsing, logging, authentication, error handling) and can be chained, reused across routes, and ordered explicitly.
- **Request/response helper methods**: res.json(), res.status(), res.redirect(), req.params, req.query — small but genuinely time-saving conveniences over Node's bare req/res objects.
- **A large middleware ecosystem**: helmet (security headers), cors (CORS handling), morgan (logging), multer (file uploads), and hundreds more, all composable via the same app.use() pattern.

What Express deliberately does **not** solve: it includes no ORM, no built-in authentication system, no prescribed project structure, and (in Express 4, its long-dominant version) no first-class async/await error handling — an unhandled rejected Promise inside a route handler could crash the process silently unless the developer wrapped every async handler manually, a well-known pain point that Express 5 finally addresses natively. Express also does not solve for TypeScript-first, batteries-included application architecture the way NestJS does — Express deliberately stays at the "routing and middleware" layer, leaving larger architectural decisions to the application or to a framework built on top of it.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Build an Express application with routes, route parameters, query strings, and JSON request/response handling.
2. Explain and correctly order Express middleware, including error-handling middleware's special signature.
3. Structure a non-trivial Express project using routers, controllers, and a service layer, avoiding the "everything in one file" trap.
4. Handle async errors correctly in both Express 4 (manual wrapping) and Express 5 (native support).
5. Integrate a database layer (via an ORM like Prisma or Sequelize, or a raw driver) and understand where that responsibility sits relative to Express itself.
6. Apply common security middleware (helmet, cors, rate limiting) and understand what each actually protects against.
7. Test Express applications using supertest and a test runner (Jest/Vitest).
8. Deploy an Express application in production behind a reverse proxy, with proper process management.
9. Answer senior-level interview questions on the middleware pattern, Node's event loop implications for Express, and Express's comparison to NestJS/Fastify.
`,

  prerequisites: `
- **Required**: solid **JavaScript** fundamentals — functions, closures, Promises, async/await; Express is JavaScript (or TypeScript) through and through (see the **JavaScript** skill).
- **Required**: basic **Node.js** concepts — the event loop, non-blocking I/O, modules (require/import) — Express is a thin layer over Node's own primitives, and understanding what's underneath matters for reasoning about performance and error handling (see the **Node.js** skill).
- **Helpful**: the **REST** architectural style if building a JSON API.
- **Helpful**: **TypeScript** if working in a typed Express codebase, increasingly the norm in production.

Dependency links: **JavaScript** and **Node.js** → this page → **PostgreSQL**/**MongoDB** for whichever storage layer you choose → **Docker**/**CI-CD** for deployment → **NestJS** as the natural next comparison for a more opinionated, structured Node.js framework built on Express's concepts.
`,

  "beginner-concepts": `
### Your first Express application

~~~javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.get("/greet/:name", (req, res) => {
  res.send("Hello, " + req.params.name + "!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
~~~

app.get(path, handler) registers a handler for GET requests matching path; :name in the path is a route parameter, captured and made available on req.params — the same typed-capture-segment idea seen in Django's and Flask's routing.

### Request data: params, query, and body

~~~javascript
const express = require("express");
const app = express();
app.use(express.json());   // middleware: parses JSON request bodies into req.body

app.get("/search", (req, res) => {
  const query = req.query.q || "";               // GET /search?q=python
  res.json({ searching_for: query });
});

app.post("/posts", (req, res) => {
  const title = req.body.title;                    // parsed from a JSON POST body
  res.status(201).json({ id: 1, title: title });
});
~~~

express.json() is middleware that parses incoming request bodies with a Content-Type of application/json into req.body — without it, req.body is undefined for JSON requests; this is a very common beginner gotcha.

### Responses: status codes, JSON, redirects

~~~javascript
app.get("/api/status", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/old-page", (req, res) => {
  res.redirect("/new-page");
});

app.get("/not-found-example", (req, res) => {
  res.status(404).json({ error: "not found" });
});
~~~

### The middleware pattern — Express's central idea

~~~javascript
function logger(req, res, next) {
  console.log(req.method + " " + req.path);
  next();   // MUST call next() to pass control to the next middleware/handler
}

app.use(logger);   // applies to every request

app.get("/", (req, res) => {
  res.send("Hello!");
});
~~~

A middleware function receives (req, res, next) and either ends the request (via res.send/res.json/etc.) or calls next() to pass control forward — forgetting to call next() and also not sending a response is one of the most common beginner bugs, silently hanging the request forever.

### Routers — grouping related routes

~~~javascript
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("Post list"));
router.get("/:id", (req, res) => res.send("Post detail"));

module.exports = router;

// in the main app file:
// app.use("/posts", require("./routes/posts"));
~~~

express.Router() creates a mini, mountable Express application — Express's equivalent of Django's apps or Flask's Blueprints — letting a growing project split routes into focused, importable modules.

Common beginner trap: forgetting to handle rejected Promises inside async route handlers in Express 4 — covered fully in Advanced Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### Error-handling middleware — the special four-argument signature

~~~javascript
app.get("/risky", (req, res, next) => {
  try {
    doSomethingThatMightThrow();
    res.json({ ok: true });
  } catch (err) {
    next(err);   // passes control to error-handling middleware
  }
});

// Error-handling middleware MUST have exactly 4 parameters for Express to recognize it as such
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
~~~

Express distinguishes error-handling middleware from regular middleware purely by ARITY (the four-parameter signature err, req, res, next) — a subtle but important Express-specific convention; error-handling middleware should be registered LAST, after all routes.

### Async route handlers and the Express 4 pain point

~~~javascript
// Express 4: an async handler that throws is NOT automatically caught —
// this can crash the process or hang the request unless wrapped
app.get("/broken", async (req, res) => {
  const data = await fetchDataThatMightReject();   // if this rejects, Express 4 does NOT catch it
  res.json(data);
});

// The common Express 4 workaround: a wrapper utility
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get("/fixed", asyncHandler(async (req, res) => {
  const data = await fetchDataThatMightReject();
  res.json(data);
}));
~~~

Express 5 (stable as of the mid-2020s) fixes this natively — a rejected Promise from an async route handler is automatically forwarded to error-handling middleware, removing the need for the asyncHandler wrapper pattern shown above; verify which major version a codebase uses before assuming this is handled automatically.

### Database integration (Prisma example)

~~~javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/posts", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({ include: { author: true } });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});
~~~

Express itself has no ORM opinion — Prisma, Sequelize, TypeORM, Drizzle, or a raw database driver (pg, mysql2, mongodb) are all equally valid choices, entirely the application's decision, mirroring Flask's equivalent "bring your own ORM" philosophy in the Python ecosystem.

### Common security middleware

~~~javascript
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

app.use(helmet());                                    // sets various security-related HTTP headers
app.use(cors({ origin: "https://myapp.com" }));         // controls cross-origin request access
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));  // basic rate limiting
~~~

None of these are built into Express core — like Flask, Express's minimalism means security-relevant middleware is an explicit addition, not an automatic default, and a security review must verify each was actually applied.

### Environment configuration

~~~javascript
require("dotenv").config();

const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};
~~~

dotenv (loading a .env file into process.env during local development) combined with real environment variables in production is the standard, ecosystem-wide Node.js configuration pattern — Express itself has no built-in configuration system, again leaving this entirely to the application.

### Validation

~~~javascript
const { body, validationResult } = require("express-validator");

app.post("/posts",
  body("title").isString().isLength({ min: 5 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... create the post ...
  }
);
~~~

express-validator (or, increasingly, Zod schemas validated manually in a middleware) is the standard approach for input validation, since Express itself provides none.
`,

  "advanced-concepts": `
### Middleware execution order and the request/response cycle

~~~javascript
app.use(middlewareA);          // runs first
app.use(middlewareB);          // runs second
app.get("/path", handlerC);    // runs third, for matching requests only
app.use(errorHandler);         // runs only if next(err) was called somewhere above
~~~

Middleware executes in the EXACT order registered via app.use()/app.get() etc. — this is unlike Django's request/response-phase reversal; in Express, middleware forms a straight-line pipeline (not nested wrapping), and each middleware decides whether to call next() (continue the pipeline) or end the response directly. Understanding this linear, ordered pipeline precisely is essential for correctly placing authentication before authorization, body-parsing before validation, and error handlers last.

### The event loop's implications for Express applications

~~~javascript
// BAD: a synchronous, CPU-heavy operation blocks the ENTIRE event loop —
// every other concurrent request stalls until this function returns
app.get("/cpu-heavy", (req, res) => {
  let result = 0;
  for (let i = 0; i < 10_000_000_000; i++) { result += i; }   // blocks everything
  res.json({ result });
});

// BETTER: offload genuinely CPU-bound work to a worker thread or a separate process
const { Worker } = require("worker_threads");
app.get("/cpu-heavy-fixed", (req, res) => {
  const worker = new Worker("./cpu-worker.js");
  worker.on("message", (result) => res.json({ result }));
});
~~~

Because Node.js (and therefore Express) runs JavaScript on a SINGLE thread with an event loop, any synchronous, CPU-bound code in a route handler blocks every other concurrent request being handled by that same process — this is the single most important Node.js-specific performance concept for an Express developer to internalize, and the reason CPU-bound work (image processing, heavy computation) is typically offloaded to worker threads, a separate service, or a queue rather than run inline in a route handler.

### Custom error classes and centralized error handling

~~~javascript
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.get("/users/:id", async (req, res, next) => {
  const user = await findUser(req.params.id);
  if (!user) return next(new ApiError(404, "User not found"));
  res.json(user);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message });
});
~~~

A custom error class carrying an HTTP status code, combined with a single centralized error-handling middleware, is the standard pattern for consistent error responses across a large Express API without repeating status-code logic in every route.

### Streaming responses

~~~javascript
app.get("/export", (req, res) => {
  res.setHeader("Content-Type", "text/csv");
  const stream = generateCsvStream();
  stream.pipe(res);   // Node streams pipe directly into the HTTP response
});
~~~

Because res is itself a writable Node stream, Express can stream large responses (CSV exports, file downloads, or increasingly, streaming LLM token output) without buffering the entire payload in memory first — directly relevant to any Express endpoint proxying a streaming LLM completion (see the **Streaming** and **Server-Sent Events** skills).

### Dependency injection patterns in vanilla Express

~~~javascript
function createApp({ db, logger }) {
  const app = express();
  app.use((req, res, next) => { req.db = db; req.logger = logger; next(); });
  app.get("/posts", async (req, res) => {
    const posts = await req.db.query("SELECT * FROM posts");
    res.json(posts);
  });
  return app;
}
~~~

Express has no built-in dependency injection system (unlike NestJS) — teams needing testable, swappable dependencies typically thread them through via middleware attaching to req, a factory function pattern (as above), or a lightweight DI library, entirely by convention rather than framework enforcement.
`,

  "internal-working": `
What happens inside Express from an incoming request to the returned response:

~~~mermaid
flowchart LR
    A["Node.js http server\n(event loop, single-threaded)"] --> B["Express app\n(request enters the middleware stack)"]
    B --> C["Middleware 1\n(e.g. logging)"]
    C --> D["Middleware 2\n(e.g. body parsing, auth)"]
    D --> E["Matched route handler\n(business logic)"]
    E --> F["res.json/res.send\n(response sent)"]
    D -.->|next(err)| G["Error-handling middleware\n(4-arg signature)"]
    G --> F
~~~

1. **Node's event loop receives the connection**: Node's underlying event loop (built on libuv) accepts the incoming TCP connection and HTTP request, non-blockingly, alongside every other concurrent connection the process is handling.
2. **Express's middleware stack processes the request**: Express walks its registered middleware and routes IN THE ORDER THEY WERE REGISTERED, calling each one and waiting for it to either end the response or call next() to continue.
3. **Route matching**: when a middleware is actually a route handler (app.get/post/etc.), Express matches the request's method and path against it; if it matches, the handler runs; if not, Express continues to the next registered middleware/route.
4. **Response construction**: the matched handler calls a res method (json, send, redirect, etc.) which writes the HTTP response and ends the request-response cycle.
5. **Error propagation**: if any middleware calls next(err) with an argument, Express skips all remaining regular middleware and jumps directly to the first error-handling (4-argument) middleware.

**Why Express's single-threaded model matters for architecture**: because ALL Express route handlers in one process share the same single JavaScript thread, any handler doing synchronous, CPU-bound work blocks every other concurrent request that process is serving — this is fundamentally different from a multi-threaded/multi-process framework (Django/Gunicorn's worker model, for instance) where one slow request doesn't necessarily block others, and is the single most important internal-working fact for reasoning about Express's performance characteristics.
`,

  architecture: `
A senior engineer thinks about Express at two levels: **the middleware pipeline** (how a request's processing is composed) and **project structure** (how a real, non-trivial Express codebase is organized), since Express itself prescribes neither beyond the middleware mechanism.

### The middleware pipeline as architecture

~~~mermaid
flowchart LR
    Req["Incoming request"] --> M1["helmet\n(security headers)"]
    M1 --> M2["cors"]
    M2 --> M3["express.json\n(body parsing)"]
    M3 --> M4["Auth middleware\n(verify JWT, attach req.user)"]
    M4 --> M5["Route-specific validation"]
    M5 --> Handler["Route handler\n(business logic)"]
    Handler --> ErrHandler["Error-handling middleware\n(last, 4-arg signature)"]
~~~

This linear pipeline IS Express's architecture — there's no separate "framework-decided" request lifecycle beyond what the application composes via app.use() calls, in explicit contrast to Django's fixed MVT pipeline.

### Recommended project layout (a layered Express + TypeScript project)

~~~
myapp/
├── src/
│   ├── app.ts                  # Express app setup: middleware registration, route mounting
│   ├── server.ts                 # entrypoint: creates the app, starts listening
│   ├── routes/
│   │   ├── posts.routes.ts        # express.Router() definitions
│   │   └── users.routes.ts
│   ├── controllers/
│   │   └── posts.controller.ts    # request/response handling, calls services
│   ├── services/
│   │   └── posts.service.ts       # business logic, framework-agnostic
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   └── db/
│       └── prisma.ts              # database client setup
├── tests/
└── package.json
~~~

Rules mature Express teams follow: separate routes (just wiring), controllers (request/response translation), and services (actual business logic, testable independent of Express entirely) — a layered structure NestJS enforces by convention but Express leaves entirely to team discipline; keep error-handling middleware registered exactly once, last, in app.ts.
`,

  "data-flow": `
Tracing one HTTP request end to end — a JSON API request to fetch a post:

~~~mermaid
sequenceDiagram
    participant Client
    participant Node as Node.js event loop
    participant Express as Express middleware stack
    participant Controller
    participant Service
    participant DB as Database (via Prisma/ORM)

    Client->>Node: GET /api/posts/42
    Node->>Express: request enters middleware pipeline
    Express->>Express: helmet, cors, express.json run in order
    Express->>Express: auth middleware verifies JWT, attaches req.user
    Express->>Controller: matched route handler runs
    Controller->>Service: getPostById(42)
    Service->>DB: prisma.post.findUnique({ where: { id: 42 } })
    DB-->>Service: post row
    Service-->>Controller: Post object
    Controller-->>Express: res.json(post)
    Express-->>Node: HTTP response written
    Node-->>Client: 200 OK + JSON
~~~

The most misunderstood part for newcomers: **Express's non-blocking model means the process is handling MANY requests concurrently on one thread, interleaved at each await/callback boundary** — a slow database query in one request does not block a DIFFERENT request's independent, unrelated work from proceeding, because Node's event loop switches to other pending work while waiting for I/O; but a genuinely synchronous, CPU-bound loop in ANY handler blocks literally everything else the process is doing, since there is no thread-level preemption to interrupt it.
`,

  "production-usage": `
### Process management

~~~bash
npm install -g pm2
pm2 start server.js -i max   # cluster mode: one process per CPU core
~~~

node server.js directly is fine for development, but production Express deployments typically run under a process manager (PM2) or a container orchestrator (Kubernetes) that restarts crashed processes automatically and, via PM2's cluster mode or multiple container replicas, uses more than one CPU core — since a single Node.js process uses only one, regardless of how many cores the machine has.

### Configuration

~~~javascript
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
~~~

Non-negotiables for production:

1. **NODE_ENV=production set explicitly** — several Express-ecosystem libraries (and Express itself, for view caching) check this and change behavior meaningfully; forgetting it is a subtle, common performance/security gap.
2. **Secrets from environment variables**, never committed .env files or hardcoded values.
3. **Trust proxy configured correctly** (app.set("trust proxy", 1)) when running behind a reverse proxy/load balancer, so req.ip and secure-cookie detection work correctly.

### Common production stacks

- **API-only services**: Express + Prisma/TypeORM + PostgreSQL, often paired with a separate frontend (React/Next.js) consuming the API.
- **Full-stack Node applications**: Express serving both API routes and (less commonly today, versus a separate frontend framework) server-rendered views via a templating engine like EJS or Pug.
- **Testing**: Jest or Vitest paired with supertest for HTTP-level integration testing of routes.
`,

  "industry-examples": `
- **Netflix**: uses Node.js and Express-family frameworks extensively for parts of its API layer, citing Node's non-blocking I/O model as a strong fit for the I/O-heavy (rather than CPU-heavy) nature of API gateway and aggregation traffic.
- **Uber**: built significant parts of its real-time, high-throughput backend infrastructure on Node.js, with Express (and later, custom/other frameworks) as the API layer for many services.
- **PayPal**: famously migrated a customer-facing account-overview page from Java to Node.js/Express early on, publishing widely cited results showing faster development and comparable or better response times.
- **LinkedIn**: migrated its mobile backend from Ruby on Rails to Node.js, citing Express's lightweight footprint and Node's efficiency for the I/O-bound, high-concurrency mobile API workload.
- **IBM**: uses Node.js and Express across various internal and customer-facing tools, and has published extensively on Node.js production best practices.
- **Trello**: built its real-time collaborative board application on a Node.js/Express-adjacent stack, leveraging Node's natural fit for many concurrent, I/O-bound WebSocket connections.
- **Many AI-adjacent full-stack startups**: Express (or increasingly, NestJS/Fastify) is a extremely common backend choice specifically for teams building a chat-style AI product UI in React/Next.js who want to stay in one language (JavaScript/TypeScript) across the whole stack.

Pattern to notice: Express (and Node.js generally) adoption clusters around **I/O-bound, high-concurrency workloads** — many simultaneous requests each waiting on network calls (databases, downstream APIs, LLM completions) rather than heavy in-process computation — exactly the profile of most API gateways and AI-application backends.
`,

  "best-practices": `
1. **Separate routes, controllers, and services** — routes just wire paths to controllers; controllers translate HTTP concerns to/from plain function calls; services hold framework-agnostic business logic, testable without an HTTP request at all.
2. **Register error-handling middleware exactly once, last** — after every route and regular middleware, so next(err) anywhere in the pipeline reaches it.
3. **Wrap async route handlers to catch rejected Promises** in Express 4 (via a helper like asyncHandler, or a library like express-async-errors) — Express 5 handles this natively, but verify which version a codebase is on.
4. **Never run genuinely CPU-bound work synchronously in a route handler** — offload to a worker thread, a separate service, or a job queue; a blocked event loop stalls every concurrent request the process is serving.
5. **Use helmet, cors, and rate limiting explicitly** — none are on by default; a security review must verify each was actually added, exactly as with Flask.
6. **Validate all external input explicitly** (express-validator, Zod, or similar) — Express provides zero built-in validation.
7. **Use environment variables for all configuration and secrets**, loaded via dotenv locally and real environment injection in production.
8. **Set NODE_ENV=production explicitly in production** — several ecosystem libraries change behavior based on it.
9. **Log structured JSON, not plain strings**, using a library like pino or winston, for real production log aggregation.
10. **Run under a process manager or container orchestrator with automatic restart**, never a bare node command with no supervision.
11. **Use TypeScript for anything beyond a small prototype** — Express's plain-JavaScript API provides no compile-time safety on req.body/req.params shapes without it.
12. **Test routes at the HTTP level with supertest**, not just unit-testing individual functions in isolation, to catch middleware-ordering and integration bugs.
`,

  "anti-patterns": `
### Unhandled async rejections in Express 4

~~~javascript
// WRONG (Express 4) — if fetchData() rejects, this is an UNHANDLED rejection;
// the request hangs (no response ever sent) and the process may crash depending on Node's config
app.get("/broken", async (req, res) => {
  const data = await fetchData();
  res.json(data);
});

// RIGHT (Express 4) — wrap with a helper, or use the express-async-errors package
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get("/fixed", asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
~~~

This was Express 4's single most common production footgun for years, well-known enough that Express 5's native handling of it is considered one of the release's most significant improvements — verify which major version any given codebase is running before assuming this is handled.

### Other production-grade anti-patterns

- **Blocking the event loop with synchronous, CPU-heavy code**: a single slow, synchronous loop in one handler stalls every other concurrent request the process is serving — the single most Express/Node-specific performance anti-pattern to internalize.
- **Everything in one file**: the same "app.js grows to 2000 lines" trap seen in Flask, avoided by adopting routers/controllers/services structure early.
- **Missing express.json() and being confused why req.body is undefined**: a genuinely common beginner-to-intermediate confusion, since Express doesn't parse bodies by default.
- **Trusting client-provided data without validation**: since Express provides zero built-in validation, skipping it entirely (rather than just forgetting a specific field) is a common, severe gap in less experienced Express codebases.
- **Not setting trust proxy behind a load balancer**: causes incorrect req.ip values and secure-cookie detection issues, subtle bugs that only appear in the actual production topology, not locally.
- **Storing secrets or database credentials directly in source code** rather than environment variables — the same universal anti-pattern as any language, worth repeating because Express provides no built-in secrets-management guidance at all.
`,

  performance: `
### Rule zero: measure first

~~~bash
node --prof server.js          # V8's built-in CPU profiler
npm install -g clinic
clinic doctor -- node server.js   # diagnoses event-loop blocking, memory, and I/O issues
~~~

Node's built-in profiler and tools like clinic.js diagnose exactly the class of problem most relevant to Express: is the event loop being blocked, and by what.

### The performance hierarchy (apply in order)

1. **Identify and eliminate event-loop-blocking synchronous code** — this is Express/Node's single most consequential performance issue, unlike most other frameworks where one slow request rarely affects unrelated concurrent ones.
2. **Fix N+1 database queries** — the same universal ORM problem seen in Django/Flask, addressed via the specific ORM's eager-loading mechanism (Prisma's include, TypeORM's relations option).
3. **Cache expensive, infrequently-changing data** in Redis rather than recomputing or re-querying on every request.
4. **Use compression middleware** (compression package) for text-heavy JSON/HTML responses, trading a small CPU cost for reduced bandwidth and faster client-perceived response times.
5. **Run multiple Node processes** (PM2 cluster mode, or multiple container replicas) to use more than one CPU core — a single Node process is fundamentally single-threaded regardless of the machine's core count.
6. **Stream large responses** rather than buffering them fully in memory before sending, especially relevant for large exports or proxying streaming LLM completions.

### Micro-level facts worth knowing

- JSON.stringify/JSON.parse on very large objects is itself a synchronous, blocking operation — worth being aware of for endpoints handling unusually large payloads.
- Express's res.json() calls JSON.stringify internally — no meaningful difference in cost versus doing it manually, but worth knowing when profiling.
- Connection pooling settings on your chosen database driver/ORM matter enormously under concurrent load — an undersized pool creates a bottleneck that looks like a slow database when it's actually queueing for a connection.
`,

  scalability: `
Express scales the same way any Node.js application does — **horizontally across processes and machines**, because a single Node.js process uses only one CPU core regardless of how many the machine has.

### Single-machine and single-region architecture

~~~mermaid
flowchart LR
    LB["Load balancer"] --> P1["Node process 1\n(PM2 cluster worker / container replica)"]
    LB --> P2["Node process N"]
    P1 & P2 --> Cache[("Redis\ncache + sessions, if used")]
    P1 & P2 --> DB[("PostgreSQL/MongoDB\nvia chosen ORM/driver")]
    P1 & P2 --> Queue["BullMQ / message queue\n(background jobs, if used)"]
~~~

Because a single Node process is single-threaded, "scaling up" a single machine for Express means running multiple processes (PM2 cluster mode, or multiple container replicas via Kubernetes) — one process per available CPU core is the standard starting point, with a load balancer or Node's own cluster module distributing incoming connections across them.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Event loop blocked by synchronous CPU-bound code | Move the work to a worker thread, a separate service, or a background job queue |
| Single process using only one CPU core | PM2 cluster mode or multiple container replicas behind a load balancer |
| Database connection pool exhaustion under load | Increase pool size appropriately, add read replicas, or introduce caching to reduce query volume |
| WebSocket/long-lived connection scaling (e.g., streaming chat) | A dedicated WebSocket-aware load balancing strategy (sticky sessions or a pub/sub backplane like Redis) since connections are stateful |
`,

  security: `
### What Express does NOT provide by default

Express's minimalism means essentially no security behavior is automatic — this is a critical mental model shift for anyone coming from Django's secure-by-default posture:

1. **No CSRF protection built in**: a separate middleware (csurf, though now deprecated in favor of newer approaches, or a custom double-submit-cookie scheme) must be added explicitly if using cookie-based sessions for a browser-facing application (see the **CSRF** skill). API-only, token-authenticated services are typically not CSRF-vulnerable in the same way, but this must be understood, not assumed.
2. **No security headers by default**: helmet must be added explicitly to set headers like X-Content-Type-Options, X-Frame-Options, and a Content-Security-Policy.
3. **No input validation**: express-validator or a schema library (Zod, Joi) must be added and applied explicitly to every route accepting external input.
4. **No SQL/NoSQL injection protection**: entirely dependent on the chosen ORM/driver correctly parameterizing queries — raw string-concatenated queries (in SQL or MongoDB query construction) reintroduce injection risk exactly as in any language (see the **SQL Injection** skill).
5. **No rate limiting**: express-rate-limit or a similar package must be added explicitly, or a service is trivially open to abuse/brute-force attempts.

### What Express does provide (indirectly, via Node)

- Node.js itself has had a strong, active security-response process for its own runtime vulnerabilities, but this is Node's responsibility, not Express's — Express's OWN codebase is small enough that its own historical CVE surface is relatively limited, with most real-world Express security issues stemming from missing middleware (the gaps above) rather than bugs in Express itself.

### The core security discipline for Express specifically

Because so much is opt-in, an Express security review must explicitly verify: is helmet applied? Is CORS configured with a specific allowed origin, not a wildcard, for any endpoint accepting credentials? Is every route accepting external input actually validated? Is rate limiting applied to authentication and other abuse-prone endpoints? Are database queries parameterized throughout? None of these are automatic. See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against.
`,

  testing: `
Express applications are typically tested at the HTTP level using supertest, paired with Jest or Vitest as the test runner.

~~~javascript
const request = require("supertest");
const app = require("../app");

describe("GET /api/posts/:id", () => {
  it("returns a post for a valid id", async () => {
    const response = await request(app).get("/api/posts/1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("title");
  });

  it("returns 404 for a missing post", async () => {
    const response = await request(app).get("/api/posts/999999");
    expect(response.status).toBe(404);
  });
});
~~~

supertest makes real HTTP-shaped requests against your Express app object directly (no need to actually bind a port), giving genuine integration-level coverage of routing, middleware, and handler behavior together.

### Unit testing services independently of Express

~~~javascript
const { getPostById } = require("../services/posts.service");

describe("getPostById", () => {
  it("throws NotFoundError for a missing post", async () => {
    await expect(getPostById(999999)).rejects.toThrow("not found");
  });
});
~~~

Because services (in a well-layered Express project) are plain functions with no dependency on req/res, they're testable in complete isolation, without supertest or any HTTP machinery at all — the direct payoff of the routes/controllers/services separation recommended in Architecture.

### The senior testing doctrine

- Test routes through supertest for integration-level coverage (middleware ordering, status codes, response shape); unit-test services directly for fast, focused business-logic coverage.
- Mock external services (databases in unit tests, third-party APIs everywhere) — never let tests make real network calls.
- Use a real (but isolated, e.g. Dockerized or in-memory) test database for integration tests rather than mocking the ORM entirely, to catch genuine query-level bugs.
- Run the full suite in CI on every PR, including a type-check step if using TypeScript.
`,

  debugging: `
### The toolbox, in escalation order

1. **console.log and structured logging** — the simplest, most immediate debugging tool; for anything beyond a quick check, use a real logger (pino/winston) with levels instead.
2. **Node's built-in inspector** — node --inspect server.js, then attach Chrome DevTools or VS Code's debugger for real breakpoint-based debugging.
3. **Middleware-order debugging**: log at the start of each middleware to confirm the pipeline is executing in the expected order — a very common source of "why isn't my auth check running" bugs is registering middleware in the wrong order.
4. **clinic.js** (clinic doctor / clinic flame) — diagnoses event-loop blocking, memory leaks, and I/O bottlenecks with visual flame graphs, the standard tool for "why is this Express app slow" investigations.
5. **Express's own error stack traces** — by default, an uncaught error's stack trace is logged to the console; ensure your error-handling middleware logs err.stack, not just err.message, for real debugging value.

### Debugging common Express-specific symptoms

- "req.body is undefined" — almost always a missing express.json() (or express.urlencoded()) middleware, or a Content-Type header mismatch between client and expectation.
- "Request hangs forever, no response, no error" — a middleware that neither called next() nor sent a response; audit every custom middleware for this exact bug.
- "Works for one request but a concurrent request is slow too" — likely a synchronous, CPU-bound operation blocking the event loop; profile with clinic.js to confirm.
- "Error-handling middleware never runs" — check it's registered LAST, after all routes, and that errors are actually passed via next(err) rather than thrown inside an unwrapped async handler (Express 4) or silently swallowed.
`,

  monitoring: `
Production Express visibility rests on the same three pillars as any web framework, assembled from your own tooling choices since Express provides no built-in observability.

### Structured logging

~~~javascript
const pino = require("pino");
const logger = pino();

app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, "incoming request");
  next();
});
~~~

pino (extremely fast, JSON-structured logging) or winston are the standard choices — plain console.log does not produce the structured, queryable logs a real production log aggregation platform needs.

### Application performance monitoring

Sentry's Express integration (@sentry/node) auto-instruments routes and can capture unhandled errors and performance transactions with request context, the same role it plays for Django and Flask.

### Metrics

prom-client is the standard Prometheus client library for Node.js, used to expose request counts, latencies, and event-loop-lag metrics (a Node-specific signal worth tracking, since event-loop delay directly predicts response-time degradation) — see the **Prometheus** skill.

### Express/Node-specific signals to watch

- **Event loop lag**: a rising event-loop-delay metric is often the earliest warning sign of a blocking operation creeping into a hot path, well before request latency itself visibly degrades.
- **Process memory growth over time**: Node processes with a slow memory leak (often from an unbounded cache or an event listener never removed) show a steadily climbing RSS in monitoring, worth alerting on independent of request-level metrics.
- **Database connection pool utilization**: the same universal signal as any framework, but worth watching specifically since Node's high concurrency per process can exhaust an undersized pool faster than a framework with a lower per-process concurrency ceiling.
`,

  deployment: `
### The standard: containerized, behind a reverse proxy, with process management

~~~dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
~~~

Why each choice matters: npm ci (not npm install) uses the exact locked versions from package-lock.json for reproducible builds; --omit=dev skips development-only dependencies, keeping the production image smaller; NODE_ENV=production is set explicitly since several ecosystem libraries change behavior based on it.

### Process management and multi-core usage

~~~bash
# Option A: PM2 outside the container, cluster mode
pm2 start server.js -i max

# Option B: Kubernetes with multiple replicas, one process per pod
# (more common in modern containerized deployments — let the orchestrator handle
#  process supervision and scaling rather than PM2 inside the container)
~~~

Because one Node process uses only one CPU core, production deployments need either PM2's cluster mode (multiple Node processes managed together) or, more commonly in modern container-orchestrated environments, multiple container replicas via Kubernetes/ECS, letting the orchestrator handle both process supervision (auto-restart on crash) and horizontal scaling.

### nginx or a cloud load balancer in front

Terminates TLS and proxies to the Node process(es); also commonly handles serving genuinely static assets if the Express app has any, rather than serving them from within Node.

### CI/CD pipeline

Lint (ESLint) → type-check (if TypeScript) → test suite (Jest/Vitest + supertest) → build the Docker image → scan → push → rolling deploy across replicas. See the **CI/CD** and **Docker** skills.
`,

  "production-checklist": `
Before an Express application takes real traffic:

- [ ] NODE_ENV=production set explicitly
- [ ] helmet applied for security headers
- [ ] CORS configured with specific allowed origins, never a wildcard for credentialed requests
- [ ] Rate limiting applied to authentication and other abuse-prone endpoints
- [ ] Input validation (express-validator/Zod) applied to every route accepting external input
- [ ] Error-handling middleware registered last, catching both sync throws and (in Express 4) wrapped async rejections
- [ ] trust proxy configured correctly if running behind a load balancer/reverse proxy
- [ ] Structured logging (pino/winston) configured, shipping to a log aggregation platform
- [ ] Sentry (or equivalent) wired up for error tracking with request context
- [ ] Running under PM2 cluster mode or multiple container replicas, not a single bare process
- [ ] Database connection pool sized appropriately for expected concurrency
- [ ] No CPU-bound synchronous work in route handlers; offloaded to workers/queues if present
- [ ] Secrets loaded from environment variables/secret store, never committed
- [ ] Load test done: known requests/sec ceiling and event-loop-lag behavior under load
- [ ] Runbook: how to roll back a bad deploy
`,

  "common-mistakes": `
1. **Forgetting express.json() and being confused why req.body is undefined** — one of the most common Express beginner-to-intermediate confusions.
2. **Not wrapping async route handlers in Express 4**, leaving unhandled Promise rejections that hang requests or crash the process silently.
3. **Assuming CSRF/security headers/rate limiting exist by default** — none do; each requires an explicit middleware addition, unlike Django's secure-by-default posture.
4. **Running genuinely CPU-bound synchronous code in a route handler**, blocking the event loop and stalling every other concurrent request the process is serving.
5. **Running a single bare Node process in production** without PM2 cluster mode or multiple container replicas, using only one CPU core regardless of the machine's capacity.
6. **Registering error-handling middleware in the wrong position** (not last), causing it to never actually catch errors from routes registered after it.
7. **Not validating external input at all**, rather than just forgetting one field — a more severe gap given Express provides zero validation by default.
8. **Everything crammed into one app.js file**, the same "unstructured growth" trap seen across minimal frameworks generally.
9. **Ignoring event-loop lag as a monitored metric**, missing the earliest warning sign of a creeping blocking-code problem before request latency itself visibly degrades.
10. **Hardcoding configuration and secrets** instead of using environment variables — a universal anti-pattern worth repeating since Express provides no built-in configuration guidance at all.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| req.body is undefined | Missing express.json()/express.urlencoded() middleware, or Content-Type mismatch | Add the appropriate body-parsing middleware before the route |
| UnhandledPromiseRejectionWarning / hanging request | An async route handler's rejected Promise isn't caught (Express 4) | Wrap with an asyncHandler helper, use express-async-errors, or upgrade to Express 5 |
| Cannot set headers after they are sent to the client | res.json/res.send (or similar) called more than once for the same request | Add explicit return statements after each response call; audit for a missing early return |
| CORS error in the browser console | Missing or misconfigured cors() middleware, or origin mismatch | Configure cors({ origin: '<allowed origin>' }) matching the actual frontend origin |
| EADDRINUSE | Another process is already listening on the configured port | Kill the other process, or choose a different PORT |
| TypeError: Cannot read properties of undefined (reading 'id') | Accessing req.user before authentication middleware ran, or middleware ordered incorrectly | Verify auth middleware is registered before any route relying on req.user |
| Error-handling middleware never invoked | Registered before routes instead of after, or errors thrown inside an unwrapped async handler | Move error-handling middleware to the very end; wrap async handlers appropriately |
`,

  faqs: `
**Is Express still the right choice in 2026, given Fastify and NestJS exist?**
Express remains the most widely deployed Node.js framework by a wide margin, with the largest middleware ecosystem and the most existing production codebases. Fastify offers meaningfully better raw throughput for very high-performance needs; NestJS offers a full, opinionated, TypeScript-first architecture. Express remains the pragmatic default for most projects, especially where the middleware ecosystem or team familiarity matters more than the last percentage points of raw performance.

**Express or NestJS for a new TypeScript project?**
Choose NestJS if you want Django-like structure and conventions (modules, dependency injection, decorators) in the Node.js/TypeScript ecosystem. Choose Express (with your own conventions layered on top) if you want more direct control and a lighter footprint, accepting that you'll make more structural decisions yourself — see the **NestJS** skill for the direct comparison.

**Does Express support async/await well?**
Express 5 (stable as of the mid-2020s) supports it natively — a rejected Promise in a route handler is automatically forwarded to error-handling middleware. Express 4 (still extremely widely deployed) requires manual wrapping (via a helper function or the express-async-errors package) to achieve the same safety.

**How does Express handle concurrency without multiple threads?**
Via Node's event loop: I/O-bound operations (database queries, network calls) are non-blocking, letting one thread interleave many concurrent requests efficiently. Genuinely CPU-bound synchronous code, however, blocks everything, since there's no thread-level preemption — this is the single most important Express/Node concurrency fact to internalize.

**What ORM should I use with Express?**
Express has no opinion — Prisma (increasingly popular for its type-safety and developer experience), TypeORM, Sequelize, and Drizzle are all common choices; the decision is independent of Express itself, similar to Flask's equivalent "bring your own ORM" situation in Python.

**Is Express secure by default?**
No — unlike Django, virtually nothing security-relevant (CSRF handling, security headers, input validation, rate limiting) is automatic; each must be added explicitly via middleware, and a security review must verify each was actually applied.
`,

  "interview-questions": `
### Junior level

1. **What is middleware in Express, and what must a middleware function do?**
   Model answer: A function receiving (req, res, next) that either ends the response (res.json/send/etc.) or calls next() to pass control to the next middleware/handler in the pipeline; forgetting both hangs the request.

2. **How do you read a route parameter, a query string parameter, and a JSON request body in Express?**
   Model answer: req.params for route parameters (e.g., :id), req.query for query string parameters, and req.body for a parsed body (requires express.json() middleware first for JSON payloads).

3. **What does express.Router() do?**
   Model answer: Creates a mini, mountable Express application for grouping related routes into a separate, importable module — Express's answer to organizing routes as a project grows.

4. **How does Express distinguish error-handling middleware from regular middleware?**
   Model answer: By function arity — error-handling middleware has exactly four parameters (err, req, res, next); Express recognizes this signature specifically and routes errors (via next(err)) to it.

5. **What's the difference between res.send() and res.json()?**
   Model answer: res.json() explicitly serializes the given value as JSON and sets the Content-Type header accordingly; res.send() is more general-purpose and infers the content type based on what's passed, but res.json() is more explicit and preferred for API responses.

### Senior level

6. **Why did Express 4's handling of async route handlers cause production issues, and how does Express 5 fix it?**
   Model answer: In Express 4, a rejected Promise inside an async route handler was not automatically caught, potentially hanging the request (no response ever sent) or crashing the process depending on Node's unhandled-rejection configuration; Express 5 natively forwards a rejected Promise to error-handling middleware, removing the need for manual wrapper functions.

7. **Explain how Node's single-threaded event loop affects Express's performance characteristics.**
   Model answer: All route handlers in one process share a single JavaScript thread; I/O-bound operations are non-blocking and interleave efficiently across concurrent requests, but any synchronous, CPU-bound code blocks EVERY concurrent request the process is serving, since there's no thread-level preemption to interrupt it — a fundamentally different performance model from a multi-threaded/multi-process framework.

8. **How would you structure a growing Express project to avoid the "one giant app.js" problem?**
   Model answer: Separate routes (wiring), controllers (request/response translation), and services (framework-agnostic business logic, independently testable) into distinct layers/modules, mirroring the separation NestJS enforces by convention but Express leaves to team discipline.

9. **What security-relevant behavior does Express NOT provide by default, unlike Django?**
   Model answer: CSRF protection, security headers, input validation, and rate limiting are all absent by default in Express; each requires an explicit middleware addition (helmet, cors, express-validator, express-rate-limit, or a CSRF scheme), and a security review must verify each was actually applied.

10. **How would you scale an Express application whose single process is CPU-bound on one core?**
    Model answer: Run multiple Node processes via PM2 cluster mode or multiple container replicas behind a load balancer, since a single Node process only uses one CPU core regardless of the machine's total core count; for genuinely CPU-heavy work specifically, offload to worker threads or a separate service rather than just adding more identical processes.

11. **What's the correct position for error-handling middleware, and why?**
    Model answer: Registered last, after every route and regular middleware — because Express processes middleware in registration order and routes errors (via next(err)) to the first matching error-handling (4-argument) middleware it encounters, an error handler registered too early would never see errors from routes registered after it.

12. **When would you choose Express over NestJS or Fastify for a new project?**
    Model answer: When the team wants minimal ceremony and maximum control over architecture, is already deeply familiar with Express's ecosystem and middleware patterns, or the project's scale/team size doesn't justify NestJS's more opinionated structure or Fastify's steeper adoption curve for the marginal performance gain.
`,

  "coding-questions": `
### 1. Implement centralized async error handling for Express 4

~~~javascript
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  res.json(user);
}));

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});
// Time: O(1) wrapper overhead per handler
// Follow-up: how would this differ in Express 5, and what test would you write to verify
// the wrapper actually catches a rejected Promise correctly?
~~~

### 2. Build rate-limited, validated login endpoint

~~~javascript
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

app.post("/login",
  loginLimiter,
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await verifyCredentials(req.body.email, req.body.password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const token = signJwt({ userId: user.id });
    res.json({ token });
  })
);
// Follow-up: why rate-limit specifically the login route more aggressively than others,
// and what additional protection would you add against distributed brute-force attempts?
~~~

### 3. Implement a streaming proxy for an LLM completion endpoint

~~~javascript
app.get("/api/chat-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const upstreamStream = await getLlmCompletionStream(req.query.prompt);
  for await (const chunk of upstreamStream) {
    res.write("data: " + JSON.stringify({ token: chunk }) + "\\n\\n");
  }
  res.end();
});
// Follow-up: how would you handle the client disconnecting mid-stream (req.on('close')),
// and why does that matter for not wasting upstream LLM API cost on an abandoned request?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a REST API for a to-do list
Routes for CRUD operations on to-do items, in-memory storage first, then swapped for a real database via Prisma. Deliverable: a working, testable REST API. Skills exercised: routing, middleware, JSON handling.

### Lab 2 (Intermediate): Add authentication and structure the project properly
Add JWT-based authentication middleware, refactor into routes/controllers/services layers, and add express-validator input validation. Deliverable: a properly layered, authenticated API. Skills exercised: middleware, project structure, validation, auth.

### Lab 3 (Advanced): Add rate limiting, security middleware, and background jobs
Add helmet, cors, and rate limiting; add a BullMQ-backed background job for sending notification emails asynchronously. Deliverable: a security-hardened API with async job processing. Skills exercised: security middleware, background jobs, Redis integration.

### Lab 4 (Production): Deploy behind nginx with clustering and full observability
Containerize the app, run under PM2 cluster mode or multiple container replicas, wire up Sentry and pino structured logging, deploy behind nginx. Deliverable: a production-checklist-compliant deployment with a load test showing p95/p99 latency and event-loop-lag behavior under load. Skills exercised: deployment, monitoring, the full production checklist.
`,

  "real-projects": `
### 1. A backend for a streaming AI chat application
Engineering requirements: an Express API proxying requests to an LLM provider, streaming tokens back to the client via Server-Sent Events, handling client disconnects gracefully to avoid wasting upstream API cost, rate limiting per user, and conversation history persistence. Demonstrates Express's natural fit for I/O-bound, streaming AI-application backends.

### 2. A webhook receiver and event-forwarding gateway
Engineering requirements: Express endpoints receiving webhooks from multiple third-party providers (Stripe, GitHub, a custom AI service), per-provider signature verification, idempotent processing, and forwarding validated events onto a message queue for downstream processing. Demonstrates Express's strength as a lean, focused service at a system's edge.

### 3. A multi-tenant API gateway aggregating several backend services
Engineering requirements: a single Express service that authenticates requests, routes to the correct downstream microservice based on tenant/path, applies consistent rate limiting and logging across all of them, and gracefully handles downstream service failures (circuit breaker pattern). Demonstrates Express's common role as a lightweight API gateway layer in a larger microservices architecture.
`,

  "case-studies": `
### PayPal's Node.js/Express migration
PayPal's well-documented migration of a customer-facing account page from Java to Node.js/Express reported meaningfully faster development iteration and comparable or better response times with fewer lines of code and fewer engineers — one of the most cited early proof points for Node.js/Express in genuinely large-scale, business-critical production use. Lesson: for I/O-bound web application workloads, a non-blocking, single-language (JavaScript across frontend and backend) stack can be a real engineering-velocity win, not just a performance one.

### LinkedIn's mobile backend migration
LinkedIn moved its mobile app's backend from Ruby on Rails to Node.js specifically citing efficiency gains for its I/O-heavy, high-concurrency workload, with Express (in its early years) as a key part of that stack. Lesson: a framework's fit is workload-dependent — I/O-bound, high-concurrency APIs are precisely where Node's event-loop model shines relative to thread-per-request models.

### Express 4-to-5's long gap and the async error-handling lesson
Express's multi-year path from 4.0 (2014) to a stable 5.0 (mid-2020s), driven largely by the ecosystem's slow, careful transition to properly handling async/await-era code, illustrates a recurring lesson in language/framework evolution: JavaScript's own shift from callbacks to Promises to async/await happened faster than Express's core could safely absorb without breaking its enormous existing middleware ecosystem, and the "wrap every async handler" workaround pattern became so standard it's now a fixture of nearly every Express 4 tutorial and codebase. Lesson: a framework's stability guarantees can lag a language's own evolution, and understanding WHY a common workaround exists (not just applying it) is what separates a senior engineer's grasp of a framework from a junior one's.

### The middleware pattern's influence beyond Express itself
Express's core middleware pattern — small, composable functions each handling one concern, chained in order — has been directly adopted, in spirit, by nearly every subsequent Node.js web framework (Koa, Fastify, and NestJS's interceptor/guard system all echo it) and even frameworks in other languages. Lesson: a framework's most durable contribution is sometimes not its specific API but the architectural IDEA it popularizes, which outlives the framework's own relative market share.
`,

  comparisons: `
| Aspect | Express | NestJS | Fastify | Django/Flask (Python) |
|--------|---------|--------|---------|------------------------|
| Philosophy | Minimal, unopinionated | Opinionated, structured, TypeScript-first | Minimal, performance-focused | Batteries included (Django) / minimal (Flask) |
| Async error handling | Manual in v4, native in v5 | Native (built on Express or Fastify underneath) | Native | Native (Python's exceptions) |
| Dependency injection | None built in | Built in, Angular-inspired | Plugin-based, not full DI | None built in (either) |
| Performance | Good, not the fastest | Depends on underlying adapter (Express/Fastify) | Generally faster raw throughput than Express | Comparable, workload-dependent |
| Ecosystem size | Largest in Node.js | Large, growing, TypeScript-centric | Smaller than Express, growing | Very large (Python web ecosystem) |
| Best fit | General-purpose APIs, teams wanting control | Large, structured TypeScript backend teams | Performance-critical APIs | Data-model-heavy apps (Django) / small services (Flask) |

**How seniors choose**: reach for Express when you want maximum control, minimal ceremony, and the largest available middleware ecosystem, especially for small-to-medium APIs or when the team is already deeply familiar with it; reach for NestJS when building a large, long-lived TypeScript backend where structure and dependency injection reduce bugs at scale; reach for Fastify when raw throughput is a measured, genuine requirement and the team is comfortable with a smaller (though growing) ecosystem; reach for Django/Flask when the team's broader stack is Python-centric rather than JavaScript/TypeScript-centric.
`,

  "related-technologies": `
- **JavaScript** and **TypeScript** — the languages Express is written in and typically used with in production; see both skills.
- **Node.js** — the runtime Express sits directly on top of; understanding its event loop is essential for reasoning about Express's performance model (see the **Node.js** skill).
- **NestJS** — a more opinionated, structured framework built ON TOP OF Express (or Fastify) by default, the natural next step for teams wanting more architecture than Express provides on its own.
- **REST** — the architectural style most Express APIs implement; see the **REST** skill.
- **PostgreSQL** and **MongoDB** — the two most common production database choices paired with Express, via Prisma/TypeORM or the native MongoDB driver respectively.
- **Redis** — the typical cache, session, and job-queue (BullMQ) backend for production Express deployments.
- **Docker** and **CI/CD** — how Express applications are packaged and shipped in modern production environments.

Learning path: **JavaScript**/**TypeScript** and **Node.js** → this page → **PostgreSQL**/**MongoDB** for the storage layer → **Docker**/**CI-CD** for deployment → **NestJS** for a more structured, opinionated Node.js framework perspective built on these same foundations.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Express 5** is stable, natively handling rejected Promises from async route handlers without the manual wrapping workaround that defined Express 4-era codebases for years — verify which major version a specific codebase targets before assuming this behavior.
- The broader Node.js web framework landscape continues to diversify — Fastify has grown significantly for performance-sensitive use cases, and Hono (originally built for edge/serverless runtimes) has gained adoption for lightweight, portable API services — Express nonetheless remains the single most widely deployed choice by installed-base and middleware ecosystem size.
- Node.js itself continues its regular LTS release cadence; verify the current LTS version and its support timeline before committing a new production Express deployment to a specific Node version.
- Given the pace of change in the surrounding Node.js/TypeScript ecosystem (ORMs, validation libraries, and adjacent tooling evolve faster than Express's own core), verify current best-practice library choices (Prisma's current state, the validation library your team prefers) rather than assuming specific package recommendations in this page are still the current default.
`,

  "future-roadmap": `
Where Express is heading, and what's worth betting career time on:

- **Continued Express 5 adoption** — as the ecosystem's middleware and tutorials catch up to the new major version, expect Express 5's native async error handling to become the assumed baseline rather than something requiring a workaround.
- **Continued competition from Fastify and Hono** for performance-sensitive and edge/serverless use cases respectively — worth tracking if your workload's specific performance profile or deployment target (traditional server vs. edge function) makes either a better fit than Express.
- **NestJS's continued growth** for larger, more structured TypeScript backend teams — understanding Express deeply remains valuable even for NestJS work, since NestJS is commonly built directly on top of Express's HTTP handling underneath its own abstractions.
- **What to bet on**: deep fluency in the middleware pattern (which transfers conceptually to nearly every subsequent Node.js framework), Node's event-loop performance model, and a disciplined routes/controllers/services project structure — these fundamentals remain valuable regardless of which specific Node.js framework a given project ultimately chooses.
`,

  "cheat-sheet": `
~~~javascript
// ---- Minimal app ----
const express = require("express");
const app = express();
app.use(express.json());

app.get("/greet/:name", (req, res) => res.send("Hello, " + req.params.name));

// ---- Request data ----
req.params.id       // route parameter
req.query.q          // query string
req.body              // parsed JSON body (needs express.json())

// ---- Middleware pattern ----
function logger(req, res, next) {
  console.log(req.method, req.path);
  next();   // MUST call next() or send a response
}
app.use(logger);

// ---- Router ----
const router = express.Router();
router.get("/", (req, res) => res.send("list"));
app.use("/posts", router);

// ---- Error handling middleware (4-arg signature, registered LAST) ----
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

// ---- Async handler wrapper (Express 4 only; native in Express 5) ----
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---- Security middleware (all opt-in) ----
app.use(require("helmet")());
app.use(require("cors")({ origin: "https://myapp.com" }));
app.use(require("express-rate-limit")({ windowMs: 60000, max: 100 }));

// ---- Production ----
// NODE_ENV=production node server.js
// pm2 start server.js -i max
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is Express middleware? | A function (req, res, next) that ends the response or calls next() to continue the pipeline. |
| How does Express recognize error-handling middleware? | By arity: exactly four parameters (err, req, res, next). |
| Where should error-handling middleware be registered? | Last, after every route and regular middleware. |
| Why is req.body undefined by default? | No body-parsing middleware ran — add express.json() before the route. |
| What is express.Router()? | A mini, mountable app for grouping related routes into a module. |
| Express 4 vs 5 async handling? | 4: rejected Promises uncaught, need manual wrapping. 5: caught natively. |
| Why does CPU-bound code hurt Express so much? | Node is single-threaded — it blocks EVERY concurrent request, not just one. |
| Is CSRF/rate limiting/security headers built in? | No — all require explicit middleware (helmet, express-rate-limit, etc.). |
| How do you scale past one CPU core? | Multiple Node processes (PM2 cluster mode or container replicas). |
| What tool gives HTTP-level integration tests? | supertest, paired with Jest/Vitest. |
| What does trust proxy fix? | Correct req.ip and secure-cookie detection behind a reverse proxy. |
| What's a common ORM choice with Express? | Prisma, TypeORM, Sequelize, or Drizzle — Express has no built-in opinion. |
| What signal predicts Express slowdowns early? | Rising event-loop lag, before request latency itself visibly degrades. |
| What's Express's most influential architectural idea? | The middleware pattern — echoed across nearly every later Node.js framework. |
`,

  mcqs: `
1. What must a middleware function do to avoid hanging a request forever?
   A) Return a value  B) Call next() or send a response  C) Use async/await  D) Nothing extra needed
   **Answer: B** — forgetting both is a classic bug leaving the request unresolved.

2. How does Express distinguish error-handling middleware from regular middleware?
   A) A special decorator  B) Function arity (four parameters)  C) Its file name  D) Registration order only
   **Answer: B** — the (err, req, res, next) signature is what Express checks for.

3. In Express 4, what happens if an async route handler's Promise rejects and isn't caught?
   A) Express catches it automatically  B) It may hang the request or crash the process  C) It returns a 400  D) Nothing, it's ignored safely
   **Answer: B** — the well-known Express 4 pain point fixed natively in Express 5.

4. Why does synchronous CPU-bound code in one Express route hurt performance so severely?
   A) It uses too much memory  B) It blocks the single-threaded event loop for ALL concurrent requests  C) It only affects that one request  D) Express queues it separately
   **Answer: B** — a defining Node.js/Express architectural fact.

5. Is CSRF protection enabled by default in Express?
   A) Yes  B) No, requires explicit middleware/scheme  C) Only for JSON APIs  D) Only with TypeScript
   **Answer: B** — Express provides essentially no security behavior by default.

6. How do you use more than one CPU core with a single Express application?
   A) It happens automatically  B) Run multiple Node processes (PM2 cluster mode or container replicas)  C) Use more middleware  D) Enable a config flag
   **Answer: B** — a single Node process is fundamentally single-threaded.
`,

  "revision-notes": `
Express is a minimal, unopinionated Node.js web framework providing routing and the middleware pattern — small, composable functions each handling one concern (logging, body parsing, authentication, error handling), chained together in a strictly ordered pipeline. It deliberately includes no ORM, no built-in authentication, and no prescribed project structure, mirroring Flask's equivalent philosophy in the Python ecosystem, and its middleware pattern specifically has been directly influential across nearly every subsequent Node.js framework, including NestJS built on top of it.

The single most important Express/Node-specific performance fact is that Node.js runs JavaScript on ONE thread with a non-blocking event loop: I/O-bound operations (database queries, network calls) interleave efficiently across many concurrent requests, but any genuinely synchronous, CPU-bound code in a route handler blocks EVERY other concurrent request the process is serving, since there's no thread-level preemption. This is fundamentally different from a multi-threaded/multi-process framework and is the reason CPU-heavy work is offloaded to worker threads, separate services, or job queues rather than run inline.

Express distinguishes error-handling middleware from regular middleware purely by function arity (exactly four parameters: err, req, res, next) and it must be registered LAST, after every route, since Express processes middleware strictly in registration order. Express 4's historical pain point — an async route handler's rejected Promise not being automatically caught, requiring a manual wrapper function or the express-async-errors package — is finally addressed natively in Express 5, a distinction worth verifying for any specific codebase.

Unlike Django, virtually nothing security-relevant is automatic in Express: CSRF handling, security headers (helmet), input validation (express-validator/Zod), and rate limiting (express-rate-limit) all require explicit middleware, and a proper Express security review must verify each was actually applied rather than assuming a framework default. The same "bring your own" philosophy extends to the ORM (Prisma, TypeORM, Sequelize are all equally valid, framework-agnostic choices) and project structure (routes/controllers/services layering is a team convention, not an Express requirement).

Production Express deployments run under a process manager (PM2 cluster mode) or container orchestrator with multiple replicas, since a single Node process uses only one CPU core — horizontal scaling across processes, not vertical scaling within one, is how Express applications handle real production load. Event-loop lag is a Node-specific monitoring signal worth tracking specifically because it predicts request-latency degradation before it becomes visible in request-level metrics alone.
`,

  "learning-roadmap": `
**Week 1 — Express fundamentals**: routing, route parameters, query strings, JSON bodies, the middleware pattern. Milestone: a working REST API for a simple resource (e.g., a to-do list) with full CRUD.

**Week 2 — Structure and error handling**: routers, a routes/controllers/services layering, centralized error-handling middleware, and (if on Express 4) the async-handler-wrapping pattern. Milestone: refactor Week 1's API into a properly layered project with consistent error responses.

**Week 3 — Database integration and validation**: connect a real database via Prisma or another ORM, add express-validator or Zod-based input validation. Milestone: swap in-memory storage for a real, migrated database schema.

**Week 4 — Authentication and security**: JWT-based authentication middleware, helmet, cors, and express-rate-limit. Milestone: a fully authenticated, security-hardened API passing a basic security checklist review.

**Week 5 — Production practices**: structured logging (pino), Sentry integration, PM2/multi-process configuration, and background jobs via BullMQ/Redis. Milestone: add a background job and measure event-loop-lag behavior under a basic load test.

**Week 6 — Deployment and observability**: Dockerize, deploy behind nginx with multiple replicas, run through the full production checklist. Milestone: complete the Lab 4 hands-on project end to end.

Next platform skill once this roadmap is complete: **NestJS** for a more structured, opinionated take on these same foundations, or **Node.js** in depth for the event-loop internals this page assumes familiarity with.
`,

  "official-docs": `
- **expressjs.com** — the official Express documentation, covering routing, middleware, and the full API reference.
- **nodejs.org/docs** — the official Node.js documentation, essential context for the event loop and streams concepts referenced throughout this page.
- **prismaengineering docs (prisma.io/docs)** — the official documentation for Prisma, one of the most common ORM choices paired with Express today.
- **helmetjs.github.io** — the official documentation for the helmet security-headers middleware.
- **OpenJS Foundation (openjsf.org)** — the foundation stewarding Express (and Node.js) as neutral, community-governed projects.
`,

  books: `
- **"Node.js Design Patterns" (3rd ed.) — Mario Casciaro and Luciano Mammino** — the definitive deep dive on Node's architecture and design patterns, with substantial, directly relevant Express coverage.
- **"Express in Action" — Evan Hahn** — a focused, practical introduction to Express specifically, covering routing, middleware, and testing in depth.
- **"Web Development with Node and Express" (2nd ed.) — Ethan Brown** — a widely recommended, project-based introduction building real applications with Express.
- **"Testing JavaScript Applications" — Lucas da Costa** — covers supertest-based Express API testing in depth alongside broader JavaScript testing practice.
`,

  blogs: `
- **The official Express blog (via the ExpressJS GitHub and OpenJS Foundation channels)** — release announcements, including Express 5's migration guidance.
- **Node.js's own blog (nodejs.org/en/blog)** — runtime-level updates and security advisories directly relevant to any Express deployment.
- **LogRocket's Node.js/Express content** — consistently high-quality, example-driven tutorials spanning beginner to advanced topics.
- **The PayPal and LinkedIn engineering blogs** — periodic posts on their respective Node.js/Express migrations and production learnings, directly relevant to this page's Case Studies section.
`,

  "research-papers": `
Express, as an application framework, has no dedicated academic literature — the most relevant foundational reading concerns Node.js's own event-driven architecture and the web-architecture principles Express's REST-style APIs typically implement:

- **Fielding, R. — "Architectural Styles and the Design of Network-based Software Architectures"** (2000) — the foundational REST dissertation underlying most Express API design; see the **REST** skill.
- **Node.js's own design rationale documents and Ryan Dahl's original talks** introducing Node.js (widely available as recorded conference talks rather than formal papers) are the closest primary source explaining WHY Node's non-blocking, event-driven model was chosen, directly informing Express's own performance characteristics.
- For the general theory of event-driven, non-blocking I/O systems Node.js implements, classic operating-systems literature on the reactor pattern (as popularized in C10K-problem discussions from the early 2000s) provides the deeper architectural grounding.
`,

  videos: `
- **NodeConf and JSConf talks on Express and Node.js performance** (widely available on YouTube) — deep, current talks from core contributors and large-scale production users.
- **Traversy Media's Express/Node.js tutorial series** — widely watched, clear, project-based coverage from fundamentals through deployment.
- **The Net Ninja's Express series** — approachable, well-structured video tutorials covering routing, middleware, and database integration.
- **Fireship's "Express in 100 Seconds" and related rapid-overview content** — useful for a quick conceptual refresher.
- **PayPal's and LinkedIn's conference talks** on their Node.js migrations — directly relevant to this page's Case Studies section.
`,

  "github-repos": `
- **expressjs/express** — the framework's own source, small and readable enough to understand the middleware/routing internals directly.
- **expressjs/expressjs.com** — the source for Express's own documentation site, a useful reference implementation of a real, maintained project.
- **prisma/prisma** — the source for Prisma, a widely used modern ORM commonly paired with Express.
- **helmetjs/helmet** — the security-headers middleware referenced throughout this page's Security section.
- **express-rate-limit/express-rate-limit** — the standard rate-limiting middleware.
- **ladjs/supertest** — the standard HTTP-level testing library referenced in the Testing section.
- **HackerNews/api or similar well-known open-source Express APIs** — real, substantial production Express codebases worth reading for structure and convention examples.
- **goldbergyoni/nodebestpractices** — an extremely widely cited, community-curated collection of Node.js/Express production best practices, echoing and expanding on many of this page's recommendations.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Routing and middleware**: build a small API with at least three routes, a custom logging middleware, and a router-based module split.
2. **Async error handling**: given a deliberately broken Express 4 endpoint with an unhandled rejected Promise, fix it with a proper wrapper, then write a test proving the fix works.
3. **Project structure**: refactor a single-file Express app into a routes/controllers/services layered structure.
4. **Security hardening**: given an Express app with no security middleware at all, add helmet, cors, rate limiting, and input validation, then justify each addition.
5. **Streaming**: implement a Server-Sent Events endpoint that streams incrementing numbers to the client every second, handling client disconnects correctly.
6. **External practice sets**: the official Express "Getting Started" guide for structured, guided practice; nodebestpractices' GitHub repository as a self-review checklist against your own code; freeCodeCamp's Express/Node.js curriculum for additional guided exercises.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Browser / API client"] -->|HTTPS| LB["nginx / load balancer\n(TLS termination)"]
    LB --> N1["Node process 1\n(PM2 cluster / container replica)"]
    LB --> N2["Node process N"]
    N1 & N2 --> MW["Middleware pipeline\nhelmet, cors, auth, validation"]
    MW --> Ctrl["Controllers"]
    Ctrl --> Svc["Services"]
    Svc --> ORM["Prisma / TypeORM"]
    ORM --> DB[("PostgreSQL / MongoDB")]
    Svc --> Cache[("Redis\ncache + sessions")]
    Svc -->|enqueue| Queue["BullMQ workers\n(background jobs)"]
    Queue --> DB
    subgraph Observability
        Sentry["Sentry\n(errors + APM)"]
        Logs["pino structured logs"]
        Metrics["Prometheus metrics\n+ event-loop lag"]
    end
    Ctrl -.-> Sentry
    Ctrl -.-> Logs
    Ctrl -.-> Metrics
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Express))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core Concepts
      Routing
      Middleware pattern
      Request and response objects
      Routers
    Internals
      Node event loop
      Middleware pipeline order
      Error-handling middleware
      Streaming responses
    Data and Security
      ORM choice Prisma TypeORM
      Validation express-validator Zod
      helmet cors rate limiting
      JWT authentication
    Production
      PM2 and clustering
      Docker and nginx
      Monitoring Sentry pino
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default express;
