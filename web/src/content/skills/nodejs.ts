import type { SkillContent } from "../types";

/**
 * Node.js — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences used
 * anywhere in prose or code examples.
 */
const nodejs: SkillContent = {
  overview: `
Node.js is a JavaScript runtime built on Google's V8 engine (the same engine powering Chrome) that lets JavaScript run outside a browser — on a server, in a CLI tool, or as the backend of a desktop application. Node's defining architectural bet, made at its creation, was that a SINGLE-THREADED, event-driven, non-blocking I/O model would outperform the traditional thread-per-request model for the specific workload most servers actually have: many concurrent connections, each mostly WAITING on I/O (database queries, network calls, file reads) rather than doing continuous CPU work.

For an AI engineer, Node.js is frequently the runtime underneath a full-stack JavaScript/TypeScript application's backend — Express, NestJS, and Next.js's API routes all run on Node — and its non-blocking model is a particularly natural fit for AI-application backends specifically because so much of that workload IS I/O-bound waiting: proxying a request to an LLM API, streaming tokens back to a client, or fetching from a vector database, all while serving many other users' requests concurrently on the same process.

Key characteristics: a single main JavaScript thread running an event loop, with a separate libuv-managed thread pool handling certain blocking operations (file system access, some crypto operations, DNS lookups) behind the scenes; non-blocking I/O as the default programming model (callbacks historically, Promises and async/await today); npm (Node Package Manager) as the largest package ecosystem of any programming language; and a "batteries included but small" standard library, with most application-level functionality (web frameworks, ORMs, testing tools) coming from the npm ecosystem rather than Node's own core.
`,

  history: `
Node.js was created by **Ryan Dahl**, motivated specifically by frustration with the traditional blocking I/O model's inefficiency for a "how many concurrent connections can this server handle" problem he'd encountered building web servers in other languages.

| Year | Milestone |
|------|-----------|
| 2009 | Ryan Dahl releases Node.js, built on Google's then-new V8 JavaScript engine, explicitly designed around non-blocking, event-driven I/O |
| 2010 | **npm** (Node Package Manager) is created by Isaac Schlueter, becoming Node's package registry and dependency manager |
| 2011 | Node.js gains Windows support (originally Unix-only), broadening its potential user base significantly |
| 2014 | A contentious governance disagreement leads a group of core contributors to fork Node.js as **io.js**, citing frustration with the pace of releases under Joyent's stewardship |
| 2015 | The **io.js** fork and Node.js reunite under the newly formed **Node.js Foundation**, ending the split and establishing neutral, multi-company governance |
| 2015 | Node.js 4.0 — the first release after the io.js merger, unifying version numbering |
| 2018 | The Node.js Foundation and the JS Foundation merge to form the **OpenJS Foundation** |
| 2018 | Node.js 10 — introduces the experimental worker_threads module, allowing genuine multi-threaded JavaScript execution for CPU-bound work |
| 2020 | Node.js 14/15 — continued V8 engine updates bringing newer JavaScript language features natively |
| 2021 | Node.js 16 — npm 7 bundled, introducing workspaces (native monorepo support) |
| 2023 | Node.js 20/21 — a native, experimental test runner ships in Node core itself, reducing dependence on third-party test frameworks for basic needs |
| 2024–2025 | Continued LTS releases (even-numbered major versions); native fetch(), native ESM support, and permission model (experimental security sandboxing) continue maturing |

The 2014 io.js fork and 2015 reunification is a significant governance case study: a fast-moving open-source project's community successfully resolved a serious governance disagreement by forking, proving the alternative approach's viability, and then negotiating a merger under genuinely neutral foundation governance — a healthier outcome than either a permanent fork or one side simply "winning."
`,

  "why-it-exists": `
Node.js exists because of a specific, measured problem Ryan Dahl identified in traditional web servers: **the thread-per-request (or process-per-request) model wastes enormous resources on I/O-bound workloads**, because each thread/process sits idle, fully allocated but doing nothing, while waiting for a slow database query or network call to complete — and threads are expensive (memory, context-switching overhead) in a way that made scaling to tens of thousands of concurrent connections genuinely difficult with that model.

The prior landscape offered:

1. **Thread-per-request servers** (Apache's traditional model, many Java application servers): straightforward to reason about, but each concurrent connection consumes a full thread's memory and scheduling overhead, creating a hard ceiling on concurrent connections well below what the underlying hardware could otherwise handle for I/O-bound work.
2. **Event-driven servers in other languages** (nginx itself, or C-based event loops): proved the performance benefit was real, but required low-level, unergonomic programming (manual callback-based C code) that most application developers weren't equipped or willing to write directly.

Node's insight was to pair JavaScript (a language with first-class functions and, from the browser, an existing cultural familiarity with callback-based, event-driven programming from handling DOM events) with a genuinely fast, production-grade engine (V8) and a well-engineered event loop (built on libuv), making event-driven, non-blocking I/O programming accessible to a huge existing population of web developers who already thought in JavaScript's idioms — turning what had been a specialized, low-level technique into a mainstream, ergonomic way to build highly concurrent servers.
`,

  "problem-it-solves": `
Node.js solves the **"handle a very large number of concurrent, I/O-bound connections efficiently, using a language ergonomic enough for mainstream web development"** problem.

Concretely, Node.js provides:

- **Non-blocking I/O by default**: file system, network, and database operations are asynchronous, freeing the single JavaScript thread to handle other work while waiting, rather than blocking an entire thread/process per connection.
- **One language across the full stack**: the same language (JavaScript, or increasingly TypeScript) on both frontend and backend, reducing context-switching cost for full-stack teams and enabling code/logic sharing (validation schemas, types) between client and server.
- **npm's enormous package ecosystem**: the largest registry of reusable packages of any language, meaning most common needs (HTTP clients, date manipulation, testing frameworks) are a single npm install away.
- **A genuinely fast JavaScript engine (V8)**: Google's continued, heavily funded investment in V8 (driven by Chrome's own performance needs) means Node inherits world-class JIT compilation essentially for free.

What Node.js deliberately does **not** solve: it does not make JavaScript a good fit for CPU-bound, computationally heavy workloads without extra work — a single Node process's JavaScript execution is fundamentally single-threaded, and any synchronous, CPU-intensive code blocks the entire event loop, stalling every other concurrent operation that process is handling; genuine CPU-bound parallelism requires worker_threads, a separate process, or a different runtime/language entirely. Node also does not provide a batteries-included application framework itself — Express, NestJS, Fastify, and the rest of the ecosystem sit on top of Node's core, which deliberately stays minimal.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Node's event loop phases and the distinction between the microtask queue (Promises) and the macrotask/phase-based queues (timers, I/O callbacks).
2. Write asynchronous Node.js code correctly using callbacks, Promises, and async/await, and identify common async pitfalls (callback hell, unhandled rejections).
3. Use Node's core modules (fs, http, path, streams, events) directly, without a framework, to understand what frameworks like Express are built on top of.
4. Explain the difference between CommonJS (require) and ES Modules (import/export) in Node, and when each applies.
5. Use streams correctly for memory-efficient processing of large data, and explain backpressure.
6. Identify CPU-bound code that would block the event loop, and know the correct tools (worker_threads, clustering, a separate service) to address it.
7. Manage dependencies and scripts effectively with npm/yarn/pnpm, including understanding package-lock files and semantic versioning.
8. Debug and profile a Node.js application using the built-in inspector and diagnostic tools.
9. Answer senior-level interview questions on the event loop's internals, Node's concurrency model, and its comparison to thread-based runtimes.
`,

  prerequisites: `
- **Required**: solid **JavaScript** fundamentals — functions, closures, Promises, async/await, the prototype chain (see the **JavaScript** skill); Node.js IS JavaScript, running in a different environment than the browser, not a different language.
- **Helpful**: basic **operating systems** concepts (processes, threads, I/O) make the event loop's non-blocking model click faster, though this page explains it from the ground up.
- **Helpful**: the **Concurrency** skill for general concurrent-programming vocabulary that transfers to reasoning about Node's specific model.

Dependency links: **JavaScript** → this page → **Express**/**NestJS** for the dominant web framework choices built on Node → **Docker**/**CI-CD** for deployment → **TypeScript** for typed Node.js development, increasingly the production norm.
`,

  "beginner-concepts": `
### Running JavaScript outside the browser

~~~javascript
// hello.js
console.log("Hello from Node.js!");
const os = require("os");
console.log("Running on", os.platform(), "with", os.cpus().length, "CPUs");
~~~

~~~bash
node hello.js
~~~

Unlike browser JavaScript, Node.js has no window or document object — instead, it provides its own set of built-in modules (os, fs, path, http) for interacting with the operating system, file system, and network, none of which exist in a browser context.

### Modules: require and import

~~~javascript
// CommonJS (Node's original module system)
const fs = require("fs");
module.exports = { greet: (name) => "Hello, " + name };

// ES Modules (modern JavaScript standard, supported natively in Node)
import fs from "fs";
export function greet(name) { return "Hello, " + name; }
~~~

Node originally used CommonJS (require/module.exports) since it predates JavaScript's own standardized module system; ES Modules (import/export, the same syntax browsers and bundlers use) are now fully supported natively, selected either via a .mjs file extension or "type": "module" in package.json.

### Asynchronous I/O with callbacks (the original pattern)

~~~javascript
const fs = require("fs");

fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  console.log("File contents:", data);
});

console.log("This logs BEFORE the file contents, because readFile is non-blocking");
~~~

fs.readFile doesn't block the program waiting for the disk — it returns immediately, and the provided callback function runs later, once the file has actually been read, letting the rest of the program continue executing in the meantime.

### Promises and async/await (the modern pattern)

~~~javascript
const fs = require("fs/promises");

async function readAndLog() {
  try {
    const data = await fs.readFile("data.txt", "utf8");
    console.log("File contents:", data);
  } catch (err) {
    console.error("Error reading file:", err);
  }
}

readAndLog();
~~~

fs/promises provides a Promise-based version of the same file system API; async/await is syntactic sugar over Promises, making asynchronous code read in a linear, synchronous-LOOKING style while still being genuinely non-blocking underneath.

### The event loop, informally

~~~javascript
console.log("1: synchronous");

setTimeout(() => console.log("3: after the current synchronous code and microtasks"), 0);

Promise.resolve().then(() => console.log("2: microtask, runs before setTimeout"));

console.log("1.5: still synchronous");
~~~

This prints "1", "1.5", "2", "3" in that order — synchronous code always runs first to completion, then all pending microtasks (Promise callbacks) run, and only THEN does the next macrotask (like a setTimeout callback) run, even with a 0ms delay; this ordering is fundamental to reasoning about async execution order in Node.

Common beginner trap: blocking the event loop with a synchronous, CPU-heavy loop — covered fully in Advanced Concepts and Anti-Patterns.
`,

  "intermediate-concepts": `
### The http module — what Express is built on

~~~javascript
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, raw Node.js!");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => console.log("Server running on port 3000"));
~~~

Express (and every other Node web framework) is ultimately built on top of this same http.createServer() API — understanding it directly demystifies what a framework's routing and middleware layers are actually doing underneath.

### Streams — processing data without loading it all into memory

~~~javascript
const fs = require("fs");

const readStream = fs.createReadStream("large-file.txt");
const writeStream = fs.createWriteStream("copy.txt");

readStream.pipe(writeStream);   // data flows in chunks, never fully buffered in memory at once

readStream.on("data", (chunk) => {
  console.log("Received a chunk of size:", chunk.length);
});

readStream.on("end", () => console.log("Done reading"));
~~~

Streams are one of Node's most powerful, underused core concepts — reading a multi-gigabyte file with fs.readFile would load the ENTIRE file into memory at once; a stream processes it in small chunks, making memory usage independent of file size, essential for large file processing, HTTP request/response bodies, and proxying data (including streaming LLM completions) efficiently.

### Backpressure

~~~javascript
readStream.on("data", (chunk) => {
  const canContinue = writeStream.write(chunk);
  if (!canContinue) {
    readStream.pause();                 // slow down reading if the writable side can't keep up
    writeStream.once("drain", () => readStream.resume());
  }
});
~~~

Backpressure is what happens when a readable stream produces data faster than a writable stream can consume it — pipe() handles this automatically, but understanding the underlying pause/resume/drain mechanism matters when building custom stream-processing logic manually.

### The Buffer class

~~~javascript
const buf = Buffer.from("hello", "utf8");
console.log(buf);            // <Buffer 68 65 6c 6c 6f> — raw bytes
console.log(buf.toString()); // "hello" — converted back to a string
~~~

Buffer represents raw binary data, used throughout Node's I/O APIs (file contents, network data) before it's interpreted as text or another format — essential for working with binary files, network protocols, or any data that isn't naturally a JavaScript string.

### npm scripts and package.json

~~~
{
  "name": "myapp",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": { "express": "^4.18.0" },
  "devDependencies": { "nodemon": "^3.0.0" }
}
~~~

~~~bash
npm install
npm run dev
~~~

package.json declares dependencies (needed at runtime) versus devDependencies (needed only during development, like test runners and linters), and npm scripts provide a consistent, documented way to run common project tasks across any machine.

### Environment variables and process

~~~javascript
console.log(process.env.NODE_ENV);
console.log(process.argv);          // command-line arguments
process.on("SIGTERM", () => {
  console.log("Shutting down gracefully");
  server.close(() => process.exit(0));
});
~~~

process is a global object providing access to the current Node process's environment variables, command-line arguments, and lifecycle events (like SIGTERM, sent by orchestrators requesting graceful shutdown).
`,

  "advanced-concepts": `
### The event loop's actual phases

~~~mermaid
flowchart TB
    A["Timers\n(setTimeout, setInterval callbacks)"] --> B["Pending callbacks\n(some system-level callbacks)"]
    B --> C["Poll\n(retrieve new I/O events;\nexecute I/O-related callbacks)"]
    C --> D["Check\n(setImmediate callbacks)"]
    D --> E["Close callbacks\n(e.g. socket.on('close'))"]
    E --> A
~~~

Between EVERY phase transition (and after every callback within a phase), Node fully drains the microtask queue (Promise callbacks, process.nextTick — which actually runs even before other microtasks) before moving on — this is why Promise-based async code can appear to "jump the queue" ahead of a setTimeout(fn, 0), a frequently misunderstood Node/JavaScript execution-order detail.

### libuv and the thread pool

~~~mermaid
flowchart LR
    JS["Single JavaScript thread\n(your code + event loop)"] --> LIBUV["libuv"]
    LIBUV --> TP["Thread pool\n(default 4 threads)\nfor fs, some crypto, DNS lookups"]
    LIBUV --> OS["OS-level async I/O\n(epoll/kqueue/IOCP)\nfor network sockets"]
~~~

Node's non-blocking I/O isn't ENTIRELY single-threaded under the hood: network I/O uses the operating system's own async I/O facilities directly (epoll on Linux, kqueue on macOS, IOCP on Windows) with no extra threads needed, but certain operations (most file system calls, some crypto functions like the synchronous-looking but internally-threaded pbkdf2, and DNS lookups via getaddrinfo) are dispatched to libuv's separate thread pool (default size 4, configurable via UV_THREADPOOL_SIZE) specifically because the OS doesn't provide a genuinely async API for them — understanding this distinction explains why heavy file I/O can sometimes contend for the same limited thread pool.

### Blocking the event loop — the critical failure mode

~~~javascript
// BAD: a synchronous, CPU-heavy loop blocks the ENTIRE process —
// every other request/timer/I-O-callback waits until this returns
function blockingFibonacci(n) {
  if (n <= 1) return n;
  return blockingFibonacci(n - 1) + blockingFibonacci(n - 2);
}
app.get("/fib/:n", (req, res) => {
  res.json({ result: blockingFibonacci(parseInt(req.params.n)) });   // blocks everything
});

// BETTER: offload to a worker thread
const { Worker } = require("worker_threads");
app.get("/fib-fixed/:n", (req, res) => {
  const worker = new Worker("./fib-worker.js", { workerData: { n: parseInt(req.params.n) } });
  worker.on("message", (result) => res.json({ result }));
});
~~~

This is the single most consequential Node-specific architectural fact: because ALL JavaScript in one process runs on one thread, a synchronous CPU-bound operation doesn't just slow down its own request — it stalls literally every other concurrent operation (other requests, timers, I/O callbacks) that process is handling, until it returns control back to the event loop.

### worker_threads for genuine parallelism

~~~javascript
// fib-worker.js
const { parentPort, workerData } = require("worker_threads");
function fib(n) { return n <= 1 ? n : fib(n - 1) + fib(n - 2); }
parentPort.postMessage(fib(workerData.n));
~~~

worker_threads (stable since Node 12) provides genuine multi-threaded JavaScript execution, each worker running its own V8 instance and event loop, communicating with the main thread via message passing (not shared memory by default, avoiding classic data-race concerns) — the correct tool for CPU-bound work that would otherwise block the main event loop.

### Clustering for multi-core usage

~~~javascript
const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  require("./server");   // each worker runs its own full copy of the server
}
~~~

Because one Node process uses only one CPU core, the cluster module (or, more commonly today, running multiple containers/pods via an orchestrator) forks multiple worker processes, each running an independent event loop, letting a multi-core machine be fully utilized — the OS/orchestrator's load balancer then distributes incoming connections across the worker processes.

### Native ESM, top-level await, and dynamic import

~~~javascript
// package.json: { "type": "module" }
import { readFile } from "fs/promises";

const data = await readFile("config.json", "utf8");   // top-level await, no wrapping async function needed

const conditionalModule = await import(condition ? "./moduleA.js" : "./moduleB.js");
~~~

Modern Node fully supports ES Modules natively (no transpiler required), including top-level await (usable directly in an ESM module's top-level scope, unlike CommonJS) and dynamic import() for conditionally or lazily loading modules.
`,

  "internal-working": `
What happens inside Node.js from process start to handling a network request:

~~~mermaid
flowchart LR
    A["node server.js"] --> B["V8 parses and JIT-compiles\nyour JavaScript"]
    B --> C["libuv initializes\nthe event loop"]
    C --> D["Synchronous top-level code runs\n(module loading, server setup)"]
    D --> E["Event loop begins\n(timers, poll, check phases)"]
    E --> F["Network request arrives\n(OS-level async I/O notifies libuv)"]
    F --> G["Registered callback/Promise\nqueued and executed"]
    G --> E
~~~

1. **V8 parses and compiles**: your JavaScript source is parsed and JIT-compiled by V8 (the same engine Chrome uses) into machine code, with V8's optimizing compiler progressively optimizing "hot" (frequently executed) code paths at runtime.
2. **libuv sets up the event loop**: libuv (a C library Node is built on) provides the event loop implementation, abstracting over each operating system's specific async I/O mechanism (epoll, kqueue, IOCP).
3. **Synchronous startup code runs first**: module loading (require/import resolution) and any top-level synchronous code (like http.createServer().listen()) runs to completion before the event loop truly "starts" processing events.
4. **The event loop processes phases repeatedly**: timers, pending callbacks, polling for new I/O events, check (setImmediate), and close callbacks — cycling continuously as long as there's pending work or open handles (like an active server).
5. **I/O completion triggers callbacks**: when the OS notifies libuv that a socket has data ready (or a file read completed via the thread pool), the associated JavaScript callback (or the resolution of a Promise wrapping it) is queued and executed on the single JavaScript thread at the appropriate point in the event loop.

**Why microtasks (Promises) run before macrotasks (setTimeout/setImmediate)**: after every single callback the event loop executes (not just at phase boundaries), Node drains the ENTIRE microtask queue (with process.nextTick's queue draining first, then Promise callbacks) before continuing — this is a deliberate design ensuring Promise chains resolve promptly and predictably relative to timer-based scheduling, and is the root cause of the "why does my Promise.then() run before this setTimeout(fn, 0)" question every Node developer eventually asks.
`,

  architecture: `
A senior engineer thinks about Node.js at two levels: **the process/thread model** (what's actually running) and **how a Node application should be structured to respect that model's constraints**.

### The process/thread model

~~~mermaid
flowchart TB
    subgraph Process["One Node.js process"]
        Main["Main thread\n(your JS code, the event loop)"]
        Pool["libuv thread pool\n(fs, some crypto, DNS — default 4 threads)"]
        Workers["Optional worker_threads\n(genuine parallel JS execution)"]
    end
    Main --> Pool
    Main -.->|explicit, for CPU-bound work| Workers
~~~

The critical architectural fact: your application code runs on the Main thread ONLY, by default — genuine parallelism requires the explicit opt-in of worker_threads (or a cluster of separate processes), never happens automatically just because "Node is asynchronous."

### Recommended project structure (a layered Node.js/TypeScript service, framework-agnostic)

~~~
myapp/
├── src/
│   ├── index.ts               # entrypoint: starts the server/process
│   ├── config/                  # environment configuration loading
│   ├── lib/                      # framework-agnostic utilities (logger, http client wrapper)
│   ├── modules/
│   │   └── posts/
│   │       ├── posts.controller.ts
│   │       ├── posts.service.ts
│   │       └── posts.repository.ts
│   └── workers/                  # worker_threads scripts for CPU-bound tasks, if any
├── tests/
└── package.json
~~~

Rules mature Node.js teams follow: never run genuinely CPU-bound code on the main thread in a request-serving process; keep I/O-bound async code as the default, well-tested pattern (async/await throughout, no lingering callback-style code in new work); and use TypeScript for anything beyond a small script, given plain JavaScript's complete lack of compile-time type safety.
`,

  "data-flow": `
Tracing one asynchronous operation end to end — reading a file and responding to an HTTP request with its contents:

~~~mermaid
sequenceDiagram
    participant Client
    participant EventLoop as Node event loop (main thread)
    participant LibUV as libuv thread pool
    participant Disk as File system

    Client->>EventLoop: GET /file-contents
    EventLoop->>EventLoop: handler invokes fs.readFile(path, callback)
    EventLoop->>LibUV: dispatch the read operation
    Note over EventLoop: main thread is FREE to handle other requests/timers now
    LibUV->>Disk: perform the actual blocking read
    Disk-->>LibUV: file data
    LibUV-->>EventLoop: read complete; callback queued
    EventLoop->>EventLoop: callback executes on the main thread\n(res.end(data))
    EventLoop-->>Client: HTTP response with file contents
~~~

The most misunderstood part for newcomers: **the actual file read happens on a background thread (via libuv's thread pool), but the CALLBACK that processes the result always runs back on the single main JavaScript thread** — Node's concurrency model isn't "everything runs on one thread," it's "your JavaScript callbacks always run on one thread, but the I/O operations they're waiting on may be dispatched elsewhere (OS-level async I/O or libuv's thread pool) in the meantime," which is precisely what lets one thread handle many concurrent I/O-bound operations efficiently without needing a thread per operation.
`,

  "production-usage": `
### Process management and multi-core usage

~~~bash
npm install -g pm2
pm2 start server.js -i max      # cluster mode: one process per CPU core
pm2 logs
pm2 monit
~~~

A single node command runs one process using one CPU core — production deployments need PM2 (cluster mode) or, more commonly today, multiple container replicas orchestrated by Kubernetes, to actually use a multi-core machine's full capacity and to automatically restart a crashed process.

### Configuration

~~~javascript
require("dotenv").config();
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
};
~~~

Non-negotiables for production:

1. **NODE_ENV=production set explicitly** — many npm packages check this and skip development-only overhead (verbose logging, unminified output) when set.
2. **Secrets from environment variables or a secret manager**, never committed .env files.
3. **An explicit Node.js LTS version pinned** (via .nvmrc or an engines field in package.json) — avoiding "works on my machine" version drift across environments.

### Common production stacks

- **Web APIs**: Node.js + Express/NestJS/Fastify, typically the majority of production Node.js deployments.
- **CLI tools**: Node.js is a extremely common choice for cross-platform command-line tooling (npm itself, many build tools) given npm's easy global installation story.
- **Real-time applications**: Node.js + Socket.io or native WebSockets, leveraging the event loop's natural fit for many concurrent, long-lived connections.
- **Testing**: Jest, Vitest, or Node's own built-in test runner (node:test, stable since recent LTS versions) for unit and integration testing.
`,

  "industry-examples": `
- **Netflix**: migrated significant parts of its UI/API layer to Node.js specifically citing faster startup times and improved developer velocity versus its prior stack, a widely cited early large-scale production adoption story.
- **PayPal**: famously rewrote a customer-facing account page from Java to Node.js, reporting faster development with fewer engineers and comparable or better response times — one of the most cited enterprise-scale Node.js case studies.
- **LinkedIn**: migrated its mobile backend from Ruby on Rails to Node.js, citing dramatically reduced server counts needed to handle the same traffic due to Node's efficiency for its I/O-heavy mobile API workload.
- **Uber**: built core parts of its real-time, high-throughput dispatch and matching infrastructure on Node.js, leveraging its event-driven model for the I/O-heavy, high-concurrency nature of ride-matching traffic.
- **NASA**: used Node.js for a critical data-synchronization project (reportedly reducing a costly data-access bottleneck significantly), an interesting case study for Node.js in a genuinely high-stakes, non-typical-startup context.
- **Trello**: built its real-time collaborative board application on Node.js, taking advantage of its natural fit for many concurrent WebSocket connections pushing live updates.
- **Many AI-adjacent full-stack products**: Node.js (via Express, NestJS, or a Next.js API layer) is an extremely common backend choice for teams building chat-style AI product UIs, specifically because the workload (proxying to an LLM API, streaming responses, handling many concurrent user sessions) is exactly the I/O-bound profile Node's model was designed for.

Pattern to notice: Node.js adoption clusters around **I/O-bound, high-concurrency workloads with a strong preference for JavaScript/TypeScript across the full stack** — precisely the profile of most modern AI-application backends, real-time collaborative tools, and API gateways.
`,

  "best-practices": `
1. **Never run genuinely CPU-bound synchronous code on the main thread of a request-serving process** — offload to worker_threads, a separate service, or a job queue.
2. **Use async/await consistently**, avoiding lingering callback-style code and manual Promise chaining in new code — it's more readable and less error-prone for control flow and error handling.
3. **Always handle Promise rejections** — an unhandled rejection can crash the process (Node's default behavior has tightened over versions specifically to surface this bug class loudly rather than silently).
4. **Use streams for large data processing** rather than reading entire files/payloads into memory, keeping memory usage independent of data size.
5. **Pin your Node.js version explicitly** (via .nvmrc or package.json's engines field) to avoid version-drift bugs across development, CI, and production.
6. **Use TypeScript for anything beyond a small script** — plain JavaScript's complete lack of compile-time type checking is a real, measurable source of production bugs at scale.
7. **Commit your package-lock.json (or yarn.lock/pnpm-lock.yaml)** — ensures every install (dev machine, CI, production) resolves to the EXACT same dependency versions.
8. **Set NODE_ENV=production explicitly in production** — several ecosystem libraries change behavior meaningfully based on it.
9. **Run under a process manager or orchestrator with automatic restart** (PM2 or Kubernetes), never a bare, unsupervised node command.
10. **Log structured JSON** (pino/winston), not plain console.log strings, for real production log aggregation.
11. **Audit dependencies regularly** (npm audit) — npm's enormous ecosystem carries real supply-chain risk given how many transitive dependencies a typical project accumulates.
12. **Use the built-in inspector/profiler before guessing at performance issues** — node --prof, clinic.js, or Chrome DevTools' Node integration diagnose event-loop blocking and memory issues concretely.
`,

  "anti-patterns": `
### Blocking the event loop with synchronous code

~~~javascript
// WRONG — fs.readFileSync blocks the ENTIRE process while reading;
// every other concurrent request/timer waits
app.get("/config", (req, res) => {
  const data = fs.readFileSync("large-config.json", "utf8");
  res.json(JSON.parse(data));
});

// RIGHT — the async version doesn't block anything else
app.get("/config", async (req, res) => {
  const data = await fs.promises.readFile("large-config.json", "utf8");
  res.json(JSON.parse(data));
});
~~~

Using a *Sync function (readFileSync, execSync) in a request-serving code path is one of the single most damaging, common Node.js production anti-patterns — it silently stalls every other concurrent request the process is handling for the duration of the blocking call.

### Other production-grade anti-patterns

- **Callback hell / deeply nested callbacks**: pre-Promise-era code style that's hard to read and error-prone for error handling; refactor to async/await for new code, and consider promisify (util.promisify) to convert legacy callback-based APIs.
- **Unhandled Promise rejections**: a rejected Promise with no .catch() (or no try/catch around an await) can crash the process or silently swallow an error depending on Node's configuration and version — always handle rejections explicitly.
- **Loading an entire large file/response into memory** instead of streaming it, causing memory usage to scale directly with data size unnecessarily.
- **Not pinning dependency versions**, letting a transitive dependency's breaking change silently reach production via an unpinned or loosely-pinned package-lock.
- **Running a single, unsupervised bare node process in production** without a process manager or orchestrator handling crashes and multi-core scaling.
- **Ignoring npm audit output** and accumulating known vulnerabilities across a large, unaudited dependency tree.
`,

  performance: `
### Rule zero: measure first

~~~bash
node --prof server.js              # V8's built-in CPU profiler; process with --prof-process afterward
npm install -g clinic
clinic doctor -- node server.js     # diagnoses event-loop blocking, memory, and I/O issues visually
clinic flame -- node server.js      # flame graph for CPU-bound hotspots
~~~

Never guess at a Node.js performance problem — clinic.js and V8's own profiler give concrete data on exactly where time is spent and whether the event loop is being blocked.

### The performance hierarchy (apply in order)

1. **Identify and eliminate event-loop-blocking synchronous code** — Node's single most consequential performance issue; one blocking call stalls every concurrent operation, not just its own.
2. **Use streams instead of buffering entire payloads in memory** for anything beyond small, bounded data.
3. **Cache expensive, repeated computation or I/O** (in Redis, or an in-process cache for single-instance data) rather than recomputing per request.
4. **Use multiple processes** (cluster module, PM2, or container replicas) to use more than one CPU core — a single Node process is fundamentally single-threaded.
5. **Offload genuinely CPU-bound work to worker_threads** rather than accepting event-loop blocking as unavoidable.
6. **Tune the libuv thread pool size** (UV_THREADPOOL_SIZE) if heavy file I/O or crypto operations are contending for its default 4 threads under high concurrency.

### Micro-level facts worth knowing

- JSON.stringify/JSON.parse on very large objects is itself synchronous and blocking — a real, sometimes-overlooked source of event-loop stalls for endpoints handling unusually large payloads.
- V8's JIT compiler optimizes "hot" (frequently executed, consistently-typed) functions progressively — code that changes an object's shape/type frequently (deoptimization-inducing patterns) can be measurably slower than consistently-shaped code, though this is rarely worth manually optimizing for outside genuinely hot, profiled paths.
- Node's garbage collector (V8's) can cause brief pauses under heavy allocation pressure — monitoring GC pause frequency (via --trace-gc or clinic.js) is a useful signal for memory-heavy applications.
`,

  scalability: `
Node.js applications scale the same way any web service does — **horizontally**, with the Node-specific wrinkle that a single process only uses one CPU core, making multi-process scaling necessary even on a single machine.

### Single-machine and single-region architecture

~~~mermaid
flowchart LR
    LB["Load balancer"] --> P1["Node process 1\n(cluster worker / container replica)"]
    LB --> P2["Node process N"]
    P1 & P2 --> Cache[("Redis\ncache + pub/sub for shared state")]
    P1 & P2 --> DB[("Database")]
    P1 & P2 --> Queue["Job queue\n(BullMQ, for background/CPU-bound work)"]
~~~

Because state living in-process (an in-memory cache, WebSocket connection state) doesn't automatically share across multiple Node processes, real-time features (WebSocket broadcast, in-process caching) need an externalized shared layer (Redis pub/sub, a shared cache) the moment there's more than one process/instance serving traffic.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Single process using only one CPU core | Cluster mode (PM2) or multiple container replicas via an orchestrator |
| CPU-bound work blocking the event loop | worker_threads for genuine parallelism, or offload to a separate dedicated service |
| WebSocket/real-time state not shared across processes | Redis pub/sub as a shared backplane (e.g., for Socket.io's Redis adapter) |
| libuv thread pool contention under heavy file I/O | Increase UV_THREADPOOL_SIZE, or move heavy file processing to a dedicated worker/service |
| Memory growth from unbounded in-process caching | Externalize caching to Redis with proper eviction, or bound in-process cache size explicitly |
`,

  security: `
### Node.js runtime-level security

1. **Dependency supply-chain risk**: npm's enormous ecosystem means a typical project accumulates hundreds of transitive dependencies, each a potential attack surface — npm audit (and tools like Snyk) check known vulnerabilities in your dependency tree; a compromised or malicious package is a real, industry-wide-documented risk (typosquatting, compromised maintainer accounts).
2. **Prototype pollution**: a JavaScript-specific vulnerability class where an attacker manipulates an object's prototype chain (often via unsanitized JSON.parse'd input merged into an object) to inject or override properties across the application — a genuinely Node/JavaScript-specific risk worth understanding distinctly from more universal injection classes.
3. **Path traversal in file operations**: constructing a file path from unsanitized user input (e.g., fs.readFile(userProvidedPath)) can let an attacker read files outside the intended directory (../../etc/passwd-style attacks) — always validate/sanitize any user-influenced file path.
4. **ReDoS (Regular Expression Denial of Service)**: a maliciously crafted input matched against a vulnerable regular expression can cause catastrophic backtracking, blocking the event loop for an extremely long time — a Node-specific severity amplifier, since blocking the event loop stalls every concurrent request, not just the one triggering it.
5. **Command injection via child_process**: passing unsanitized user input to exec() (which invokes a shell) rather than execFile()/spawn() (which don't) reintroduces classic shell injection risk (see the **SQL Injection** skill's general injection-class reasoning, applied here to shell commands instead).

### What Node itself provides

- Node's own security-release process is active and well-documented; subscribe to Node.js security advisories and keep the runtime itself patched to a current LTS version.
- The experimental **permission model** (--experimental-permission, maturing across recent versions) allows sandboxing a Node process's file system, network, and child-process access explicitly — worth tracking as it stabilizes for defense-in-depth in untrusted-code-execution scenarios.

See the **OWASP Top 10** and **Secrets Management** skills for the general depth this applies against, and the **Express**/**NestJS** skills for the web-framework-layer security concerns (CSRF, security headers) built on top of Node itself.
`,

  testing: `
Node.js applications are commonly tested with Jest or Vitest, or increasingly, Node's own built-in test runner (node:test) for basic needs without an external dependency.

~~~javascript
// Using Node's built-in test runner (node:test), stable in recent LTS versions
const test = require("node:test");
const assert = require("node:assert");

function add(a, b) { return a + b; }

test("add sums two numbers", () => {
  assert.strictEqual(add(2, 3), 5);
});

test("async operation resolves correctly", async () => {
  const result = await Promise.resolve(42);
  assert.strictEqual(result, 42);
});
~~~

~~~bash
node --test
~~~

### Testing async code and mocking

~~~javascript
const { test, mock } = require("node:test");

test("fetchUser calls the http client correctly", async () => {
  const mockGet = mock.fn(() => Promise.resolve({ id: 1, name: "Ada" }));
  const user = await fetchUser(1, { get: mockGet });
  assert.strictEqual(mockGet.mock.callCount(), 1);
});
~~~

### The senior testing doctrine

- Test business logic in isolation, independent of any HTTP framework, wherever possible — fast, focused unit tests.
- Mock external I/O (network calls, file system, databases) in unit tests; use real (but isolated, e.g. Dockerized) dependencies in integration tests.
- Never let a test suite depend on real wall-clock timing (arbitrary setTimeout-based waits) — use fake timers (Jest's or Sinon's) for deterministic, fast tests of timing-dependent code.
- Run the full suite in CI on every PR, including a type-check step if using TypeScript.
`,

  debugging: `
### The toolbox, in escalation order

1. **console.log and structured logging** — the simplest, most immediate debugging tool.
2. **Node's built-in inspector**: node --inspect server.js (or --inspect-brk to pause on the first line), then attach Chrome DevTools (chrome://inspect) or VS Code's debugger for real breakpoint-based debugging.
3. **clinic.js** (clinic doctor / clinic flame / clinic bubbleprof) — diagnoses event-loop blocking, memory issues, and async operation bottlenecks with visual output, the standard tool for "why is this Node app slow or unresponsive."
4. **process.on('unhandledRejection')/process.on('uncaughtException')**: register handlers to log full details of otherwise-silent or process-crashing errors, essential in production for visibility into what actually went wrong before a crash.
5. **--trace-warnings**: surfaces deprecation warnings and other runtime warnings with full stack traces, useful for catching soon-to-break code patterns early.
6. **Heap snapshots** (via the inspector or heapdump package) for diagnosing memory leaks — compare snapshots over time to find objects accumulating unexpectedly.

### Debugging common Node.js-specific symptoms

- "The whole server feels unresponsive under load, not just one request" — almost always event-loop blocking from synchronous, CPU-heavy code somewhere; profile with clinic doctor to confirm and locate it.
- "Memory usage climbs steadily and never comes back down" — a memory leak, often from an unbounded in-process cache, an event listener never removed, or closures unintentionally retaining large objects; take heap snapshots over time to identify the growing object type.
- "UnhandledPromiseRejectionWarning" in logs — a rejected Promise had no .catch()/try-catch handling it; find and fix the specific async call site.
- "Cannot find module" after what looks like a correct require/import — often a CommonJS/ESM mismatch (mixing require in a "type": "module" package.json context, or vice versa) or a missing dependency install.
`,

  monitoring: `
Production Node.js visibility rests on the same three pillars as any runtime, with Node-specific signals layered on top given its single-threaded, event-loop-based execution model.

### Structured logging

~~~javascript
const pino = require("pino");
const logger = pino();

logger.info({ userId: 42, action: "login" }, "user logged in");
~~~

pino (extremely fast, JSON-structured by design) or winston are the standard choices for production logging — plain console.log output doesn't produce the structured, queryable format a real log aggregation platform needs.

### Application performance monitoring

Sentry's Node.js SDK (@sentry/node) auto-instruments unhandled exceptions and can capture performance transaction data with request context; New Relic and Datadog offer similar, deeper APM integrations for Node.js specifically.

### Metrics

prom-client is the standard Prometheus client library for Node.js — exposing request counts, latencies, and, crucially, **event-loop lag** (via the perf_hooks module's monitorEventLoopDelay, or prom-client's built-in default metrics), the single most Node-specific health signal to track, since rising event-loop lag directly predicts request-latency degradation before it's visible in request-level metrics alone.

### Node/JavaScript-specific signals to watch

- **Event loop lag** — the single earliest warning sign of a creeping blocking-code problem; alert on this before request latency itself visibly degrades.
- **Process memory (RSS) growth over time** — a steadily climbing baseline (not returning to a stable floor after GC) indicates a memory leak worth investigating with heap snapshots.
- **Active handle/request counts** (process._getActiveHandles(), though better exposed via dedicated monitoring libraries) — unusually high counts can indicate resources (sockets, timers) not being cleaned up correctly.
`,

  deployment: `
### The standard: containerized, multi-process, behind a reverse proxy

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

Why each choice matters: npm ci (not npm install) uses the exact locked versions from package-lock.json for fully reproducible builds; --omit=dev skips development-only dependencies, keeping the production image smaller; pinning a specific Node major version (node:20-slim, not node:latest) avoids unexpected runtime version drift between builds.

### Multi-core usage in production

~~~bash
# Option A: PM2 cluster mode inside a single container/VM
pm2 start server.js -i max

# Option B (more common in modern container-orchestrated deployments):
# multiple container replicas via Kubernetes, one Node process per pod,
# letting the orchestrator handle scaling and process supervision
~~~

### nginx or a cloud load balancer in front

Terminates TLS and proxies to the Node process(es); also commonly serves any genuinely static assets directly, rather than serving them from within Node.

### CI/CD pipeline

Lint (ESLint) → type-check (if TypeScript) → test suite (Jest/Vitest or node:test) → npm audit → build the Docker image → scan → push → rolling deploy across replicas. See the **CI/CD** and **Docker** skills.
`,

  "production-checklist": `
Before a Node.js application takes real traffic:

- [ ] NODE_ENV=production set explicitly
- [ ] Node.js version pinned explicitly (Dockerfile base image, .nvmrc, package.json engines field)
- [ ] package-lock.json (or equivalent) committed and used via npm ci, not npm install, in CI/CD
- [ ] No *Sync functions (readFileSync, execSync) in any request-serving code path
- [ ] All Promise rejections handled explicitly; process.on('unhandledRejection') logging any that slip through
- [ ] Running under PM2 cluster mode or multiple container replicas, not a single bare process
- [ ] Structured logging (pino/winston) configured, shipping to a log aggregation platform
- [ ] Event-loop lag monitored as a first-class metric, alerting before request latency visibly degrades
- [ ] Sentry (or equivalent) wired up for error tracking with request context
- [ ] npm audit run in CI, with a policy for addressing found vulnerabilities
- [ ] Genuinely CPU-bound work identified and offloaded to worker_threads or a separate service
- [ ] Graceful shutdown handling SIGTERM (draining in-flight requests before exit)
- [ ] Secrets loaded from environment variables/a secret manager, never committed
- [ ] Load test done: known requests/sec ceiling and event-loop-lag behavior under sustained load
- [ ] Runbook: how to roll back a bad deploy
`,

  "common-mistakes": `
1. **Using synchronous (*Sync) functions in request-serving code**, blocking the entire event loop and stalling every other concurrent request for the duration of the call.
2. **Leaving Promise rejections unhandled**, risking a crashed process or silently swallowed errors depending on Node's version and configuration.
3. **Loading entire large files/payloads into memory** instead of using streams, causing memory usage to scale unnecessarily with data size.
4. **Not pinning the Node.js version or committing the lock file**, causing subtle "works on my machine" bugs from dependency or runtime version drift.
5. **Running a single, unsupervised process in production** without PM2 cluster mode or multiple orchestrated replicas, wasting a multi-core machine's remaining capacity.
6. **Assuming Node.js is "single-threaded" in an absolute sense**, missing that libuv's thread pool and worker_threads both provide genuine parallelism for specific, well-understood cases.
7. **Mixing CommonJS and ES Modules incorrectly** within the same project without understanding package.json's "type" field and each file's actual module system.
8. **Ignoring event-loop lag as a monitored metric**, missing the earliest warning sign of a creeping blocking-code problem before request latency itself visibly degrades.
9. **Using exec() with unsanitized user input**, reintroducing shell/command injection risk that execFile()/spawn() (which don't invoke a shell) avoid.
10. **Not auditing dependencies regularly**, accumulating known vulnerabilities across an unexamined, large transitive dependency tree.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| UnhandledPromiseRejectionWarning | A rejected Promise had no .catch()/try-catch handling it | Add explicit error handling to every async call site; consider a global handler for logging/alerting |
| Cannot find module 'X' | Dependency not installed, or a CommonJS/ESM require-vs-import mismatch | Run npm install; verify package.json's "type" field matches the module syntax actually used |
| EADDRINUSE | Another process (or a previous run) is already listening on the configured port | Kill the other process, or choose a different PORT |
| Maximum call stack size exceeded | Unbounded/incorrect recursion, sometimes from a circular require() dependency | Fix the recursion's base case, or restructure to avoid the circular module dependency |
| JavaScript heap out of memory | A genuine memory leak, or processing far more data in memory at once than the default heap size allows | Use streams for large data; take heap snapshots to find the leak; consider --max-old-space-size for legitimately large workloads |
| ERR_MODULE_NOT_FOUND with ESM imports | A missing file extension in a relative import (ESM requires the extension, unlike CommonJS) | Add the explicit .js extension to relative ESM imports |
| ECONNREFUSED | Attempting to connect to a service (database, another API) that isn't running or reachable | Verify the target service is running and network-reachable from this process |
`,

  faqs: `
**Is Node.js good for CPU-heavy workloads?**
Not natively — a single Node process's JavaScript execution is fundamentally single-threaded, and CPU-heavy work blocks the entire event loop. worker_threads provide genuine parallelism when needed, but for consistently CPU-bound workloads (heavy numerical computation, video processing), a language/runtime with a different concurrency model (or offloading to a dedicated service) is often a better architectural fit.

**Is Node.js "single-threaded"?**
Your JavaScript code runs on a single main thread, yes — but Node itself uses libuv's separate thread pool for certain operations (file system access, some crypto, DNS lookups) and the operating system's own async I/O facilities for network sockets, and worker_threads provide genuine additional JavaScript execution threads when explicitly used. "Single-threaded" describes your application code's default execution model, not literally everything Node does internally.

**CommonJS or ES Modules for a new project?**
ES Modules (import/export) are the modern JavaScript standard and increasingly the default recommendation for new projects, especially given native top-level await support; CommonJS (require) remains extremely widely used in existing codebases and some npm packages, and both are fully supported — the choice matters most for consistency within a single project.

**How does Node.js compare to Deno or Bun?**
Deno (also created by Ryan Dahl, addressing some of Node's own design regrets around security and module resolution) and Bun (built for raw speed, with a different JavaScript engine — JavaScriptCore rather than V8) are both newer runtimes positioning themselves as Node alternatives; Node remains the overwhelmingly dominant choice by installed base, npm ecosystem compatibility, and production track record, though both alternatives are worth tracking for specific projects valuing their particular tradeoffs.

**Why does my setTimeout(fn, 0) run after my Promise.then()?**
Because Node fully drains the microtask queue (Promise callbacks, process.nextTick) after every callback, before moving to the next event loop phase (where setTimeout callbacks are processed) — this ordering is deterministic and a frequently asked, frequently misunderstood JavaScript/Node execution-order question.

**Is npm's package ecosystem a security risk?**
Genuinely, yes, at scale — a typical project's transitive dependency tree can include hundreds of packages, each a potential supply-chain attack surface (compromised maintainer accounts, typosquatting); npm audit and tools like Snyk help manage this, but the sheer size of the ecosystem is a real, documented tradeoff for its convenience.
`,

  "interview-questions": `
### Junior level

1. **What makes Node.js different from running JavaScript in a browser?**
   Model answer: Node.js provides its own runtime environment and core modules (fs, http, path) for server-side concerns like file system and network access, with no DOM/window/document — the language is the same JavaScript, but the surrounding APIs and execution environment are entirely different.

2. **What is the difference between a callback, a Promise, and async/await?**
   Model answer: A callback is a function passed to be called later when an async operation completes; a Promise is an object representing a future value (pending/fulfilled/rejected) with .then()/.catch() methods; async/await is syntactic sugar over Promises, letting asynchronous code read in a linear, synchronous-looking style.

3. **What is npm, and what's the difference between dependencies and devDependencies?**
   Model answer: npm is Node's package manager and registry; dependencies are needed at runtime in production, devDependencies are needed only during development (test runners, linters, build tools) and aren't installed in a production-only install.

4. **What is a stream, and why would you use one?**
   Model answer: An interface for processing data in chunks over time rather than loading it all into memory at once — essential for large files or data transfers, keeping memory usage independent of the total data size.

5. **What does require() do, and how does it differ from import?**
   Model answer: require() is CommonJS's synchronous module-loading function, Node's original module system; import/export is the standardized ES Modules syntax, now natively supported in Node, with some differences in resolution behavior (e.g., ESM requiring explicit file extensions in relative imports).

### Senior level

6. **Explain Node's event loop phases and why a Promise's .then() runs before a setTimeout(fn, 0) callback.**
   Model answer: The event loop cycles through phases (timers, pending callbacks, poll, check, close callbacks); after every callback (not just at phase boundaries), Node fully drains the microtask queue (process.nextTick first, then Promise callbacks) before continuing — since a Promise resolution is a microtask and setTimeout's callback is a macrotask processed in the timers phase, the microtask always runs first even with a 0ms delay.

7. **Why does a single, synchronous, CPU-heavy operation degrade an entire Node.js server's performance, not just one request?**
   Model answer: All JavaScript in one Node process runs on a single thread; a synchronous, CPU-bound operation occupies that thread entirely until it returns, meaning every other concurrent request, timer, or I/O callback that process is handling must wait — there's no thread-level preemption to interrupt it.

8. **What is libuv's thread pool used for, and how does it differ from worker_threads?**
   Model answer: libuv's thread pool (default size 4) handles specific operations the OS doesn't provide a genuinely async API for (most file system calls, some crypto functions, DNS lookups), transparently, without exposing separate JavaScript execution contexts; worker_threads provide genuine, explicitly-created additional JavaScript execution threads (each with its own V8 instance and event loop) for running your OWN CPU-bound code in parallel.

9. **How would you diagnose and fix a Node.js application that becomes unresponsive under load?**
   Model answer: Use clinic.js (clinic doctor) or a similar profiler to check for event-loop blocking specifically; if confirmed, locate the synchronous/CPU-heavy code path and either offload it to worker_threads, move it to a separate service, or replace a *Sync API call with its async equivalent.

10. **How do you scale a Node.js application to use a multi-core machine's full capacity?**
    Model answer: Run multiple Node processes (via the cluster module, PM2's cluster mode, or multiple container replicas via an orchestrator) since a single process only uses one CPU core; a load balancer or the OS/orchestrator then distributes incoming connections across the worker processes.

11. **What is backpressure in the context of Node.js streams, and how is it handled?**
    Model answer: Backpressure occurs when a readable stream produces data faster than a writable stream can consume it; pipe() handles it automatically by pausing the readable stream when the writable side signals it can't accept more data (via write()'s return value) and resuming on the writable's 'drain' event.

12. **What are the security risks specific to Node.js/JavaScript beyond universal web vulnerabilities?**
    Model answer: Prototype pollution (manipulating an object's prototype chain via unsanitized input), ReDoS (a vulnerable regular expression causing catastrophic backtracking that blocks the event loop, amplified in severity by Node's single-threaded model), and npm's large transitive dependency tree creating genuine supply-chain risk beyond a typical language's package ecosystem exposure.
`,

  "coding-questions": `
### 1. Implement a simple in-memory rate limiter using closures

~~~javascript
function createRateLimiter(maxRequests, windowMs) {
  const requestLog = new Map();

  return function isAllowed(clientId) {
    const now = Date.now();
    const timestamps = (requestLog.get(clientId) || []).filter(t => now - t < windowMs);
    if (timestamps.length >= maxRequests) return false;
    timestamps.push(now);
    requestLog.set(clientId, timestamps);
    return true;
  };
}

const limiter = createRateLimiter(5, 60000);
console.log(limiter("user1"));   // true, up to 5 times per minute per user
// Follow-up: why would this NOT work correctly across multiple Node processes/instances,
// and what would you replace requestLog with to fix it (hint: Redis)?
~~~

### 2. Process a large file line-by-line using streams, without loading it entirely into memory

~~~javascript
const readline = require("readline");
const fs = require("fs");

async function countLinesContaining(filePath, searchTerm) {
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  let count = 0;
  for await (const line of rl) {
    if (line.includes(searchTerm)) count++;
  }
  return count;
}
// Time: O(n) in file size, O(1) additional memory regardless of file size
// Follow-up: how would you parallelize this across multiple files using worker_threads,
// and what would you need to aggregate the results correctly?
~~~

### 3. Implement a promise-based timeout wrapper for any async operation

~~~javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out after " + ms + "ms")), ms)
  );
  return Promise.race([promise, timeout]);
}

async function fetchWithTimeout(url) {
  return withTimeout(fetch(url), 5000);
}
// Promise.race resolves/rejects with whichever promise settles first.
// Follow-up: does this actually CANCEL the original operation if it times out,
// or does the underlying work keep running in the background? What would you need
// (e.g., AbortController) to genuinely cancel an in-flight fetch?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Build a CLI tool using only Node's core modules
A command-line tool (no framework, no Express) using the http module to serve a simple JSON API, and the fs module to read/write a local data file. Deliverable: a working CLI/server using only Node's built-ins. Skills exercised: core modules, callbacks/Promises, npm scripts.

### Lab 2 (Intermediate): Build a file-processing tool using streams
A CLI tool that reads a large CSV file via streams, transforms each row, and writes the result to a new file, all without loading the entire file into memory. Deliverable: a memory-efficient file processor, verified against a genuinely large test file. Skills exercised: streams, backpressure, the Buffer class.

### Lab 3 (Advanced): Offload CPU-bound work with worker_threads
Build an HTTP endpoint that performs a genuinely CPU-intensive calculation (e.g., computing prime numbers up to a large N), first synchronously (demonstrating the event-loop-blocking problem under concurrent load), then fixed using worker_threads. Deliverable: a load test showing the difference in concurrent-request handling before and after the fix. Skills exercised: worker_threads, event-loop diagnostics, clinic.js.

### Lab 4 (Production): Deploy a clustered Node.js service with full observability
Containerize a small API, run it via PM2 cluster mode or multiple container replicas, wire up pino structured logging and Sentry, and expose event-loop-lag and other metrics via prom-client. Deliverable: a production-checklist-compliant deployment with a load test showing p95/p99 latency and event-loop-lag behavior. Skills exercised: deployment, monitoring, clustering, the full production checklist.
`,

  "real-projects": `
### 1. A streaming proxy service for multiple LLM providers
Engineering requirements: a Node.js service that normalizes requests to multiple LLM provider APIs, streams token responses back to clients via Server-Sent Events using Node's native stream support, handles client disconnects to avoid wasting upstream API cost, and uses worker_threads for any genuinely CPU-bound token counting/preprocessing. Demonstrates Node's natural fit for I/O-bound, streaming AI-application infrastructure.

### 2. A real-time collaborative editing backend
Engineering requirements: a Node.js service using WebSockets (via Socket.io or the native ws library) to broadcast document changes to all connected clients in real time, with Redis pub/sub as the shared backplane across multiple Node instances, and operational transformation or CRDT logic for conflict resolution. Demonstrates Node's strength for many concurrent, long-lived, low-latency connections.

### 3. A CLI-based data migration and ETL tool
Engineering requirements: a Node.js CLI tool that streams data from one source (a large CSV export or a legacy database) through a series of transformation steps to a destination (a new database or API), using streams throughout to handle datasets far larger than available memory, with proper error handling and resumability for partial failures. Demonstrates Node.js's common role in tooling and data-pipeline scripts beyond just web servers.
`,

  "case-studies": `
### PayPal and LinkedIn's Node.js migrations
Both companies' widely cited migrations (PayPal from Java, LinkedIn from Ruby on Rails) reported meaningfully faster development, fewer servers needed for equivalent traffic, and comparable or better response times — strong, repeated evidence that for I/O-bound web application and API workloads specifically, Node's non-blocking model delivers genuine, measured production benefits, not just developer-experience appeal. Lesson: choosing a runtime based on your actual workload's I/O-vs-CPU profile, rather than familiarity or fashion alone, can produce measurable infrastructure savings.

### The io.js fork and reunification
The 2014 io.js fork, driven by community frustration with the pace of Node.js releases under its then-corporate steward, and its 2015 reunification under the newly formed, neutral Node.js Foundation, is a genuinely instructive open-source governance case study: a serious community disagreement was resolved not by one side simply prevailing, but by proving the alternative's viability through a real fork and then negotiating genuinely neutral, multi-company governance. Lesson: healthy open-source governance sometimes requires the credible threat (or reality) of a fork to force a genuine renegotiation of stewardship.

### NASA's Node.js data-synchronization project
NASA's reported use of Node.js to solve a costly data-access bottleneck (details vary by source, but the case is frequently cited in Node.js adoption discussions) is a useful reminder that Node's I/O-bound performance advantages apply well beyond typical consumer web startups — anywhere a system spends more time waiting on I/O than computing, Node's model has a genuine architectural case to make, regardless of the domain's prestige or unfamiliarity with JavaScript as a "serious" systems language.

### The persistent "block the event loop" lesson
Nearly every team that has run Node.js in production at real scale has, at some point, discovered a synchronous, CPU-heavy or blocking-I/O code path silently degrading their entire service's responsiveness under load — common enough across the ecosystem that it's considered a near-universal rite of passage, directly paralleling Django's equivalent N+1-query lesson. Lesson: a runtime's most consequential performance characteristic is often not its raw execution speed but its CONCURRENCY MODEL's specific failure mode, and understanding that failure mode precisely (here: one blocking call stalls everything) is what separates effective use of the runtime from repeatedly rediscovering its sharpest edge in production.
`,

  comparisons: `
| Aspect | Node.js | Python (asyncio) | Go | Java (traditional threads) |
|--------|---------|-------------------|-----|------------------------------|
| Concurrency model | Single-threaded event loop + libuv thread pool + optional worker_threads | Single-threaded event loop (asyncio), similar tradeoffs | Goroutines: lightweight, M:N scheduled, genuinely concurrent | OS threads: heavier, but true parallelism per thread |
| CPU-bound work | Blocks the entire event loop unless offloaded (worker_threads) | Blocks the entire event loop unless offloaded (multiprocessing) | Scales naturally across cores via the Go scheduler | Scales naturally across cores, at higher per-thread memory cost |
| Ecosystem | npm — the largest package registry of any language | pip — very large, especially strong for ML/data | Smaller but high-quality standard library, less need for packages | Maven Central — very large, especially strong for enterprise |
| Startup time | Fast | Fast | Very fast | Slower (JVM warm-up), though virtual threads and native image help |
| Best fit | I/O-bound APIs, real-time apps, full-stack JS teams | I/O-bound APIs, especially where Python's ML ecosystem also matters | High-concurrency infrastructure, CLI tools, systems programming | Enterprise systems, existing JVM investment |

**How seniors choose**: reach for Node.js when the workload is I/O-bound and the team wants JavaScript/TypeScript across the full stack, especially for real-time or streaming features (like an AI chat product); reach for Go when you need genuine multi-core concurrency without Node's explicit worker_threads opt-in, or a smaller, faster-starting deployment artifact; reach for Python's asyncio when the team is already Python-centric (common in ML-adjacent teams) and needs similar I/O-bound concurrency; reach for Java/Spring Boot when an existing JVM investment and mature enterprise tooling matter more than raw concurrency-model elegance.
`,

  "related-technologies": `
- **JavaScript** and **TypeScript** — the languages Node.js runs; see both skills, especially for the async/Promise/closures fundamentals this page builds directly on.
- **Express** and **NestJS** — the dominant web framework choices built on top of Node.js's core http module.
- **npm** (covered throughout this page rather than as a separate skill) — Node's package manager and the largest package ecosystem of any language.
- **Redis** — the typical shared-state backplane (pub/sub, caching, sessions) for multi-process Node.js deployments.
- **Docker** and **Kubernetes** — how Node.js applications are packaged, deployed, and orchestrated for multi-core, multi-instance production use.
- **Concurrency** — the general computer-science concepts (event loops, threads, race conditions) this page applies specifically to Node's runtime model.
- **WebSockets** and **Server-Sent Events** — the real-time communication protocols Node's event-driven model is particularly well suited to implement.

Learning path: **JavaScript**/**TypeScript** → this page → **Express**/**NestJS** for the dominant web framework layer → **Redis** for shared state across processes → **Docker**/**Kubernetes** for deployment and multi-core scaling.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- **Node.js LTS releases** continue on their even-numbered major version cadence, with the native test runner (node:test), native fetch(), and native ESM support all having matured significantly across recent LTS lines — verify the current LTS version and its support timeline before committing a new production deployment.
- The **experimental permission model** (process-level sandboxing of file system, network, and child-process access) continues stabilizing across releases, worth tracking for defense-in-depth in scenarios involving less-trusted code execution.
- **Bun** and **Deno** continue maturing as alternative JavaScript runtimes with different performance and design tradeoffs; Node.js remains the dominant choice by installed base and ecosystem compatibility, but verify current comparative benchmarks and ecosystem support if evaluating alternatives for a specific new project.
- Given the pace of change in the broader npm ecosystem (frameworks, ORMs, and tooling evolve faster than Node's own core), verify current best-practice library choices rather than assuming specific package recommendations in this page remain the current default.
`,

  "future-roadmap": `
Where Node.js is heading, and what's worth betting career time on:

- **Continued native ESM and native test runner adoption** — reducing dependence on third-party tooling (Babel/transpilers, external test frameworks) for increasingly common needs, directly built into Node's own core.
- **The permission model maturing toward general availability** — likely to become a standard part of production Node.js security hardening once stable, particularly relevant for any service executing less-trusted code or plugins.
- **Continued competition from Bun and Deno** pushing Node's own team toward performance and developer-experience improvements — worth tracking regardless of which specific runtime a given project ultimately uses, since competitive pressure across the JavaScript runtime space benefits the whole ecosystem.
- **What to bet on**: deep fluency in the event loop's actual mechanics (not just "Node is async"), streams, and worker_threads for CPU-bound work — these fundamentals remain valuable regardless of which specific web framework or even which specific JavaScript runtime (Node, Bun, or Deno) a given project ultimately chooses.
`,

  "cheat-sheet": `
~~~javascript
// ---- Core modules, no framework ----
const http = require("http");
http.createServer((req, res) => res.end("hi")).listen(3000);

// ---- Modules: CommonJS vs ESM ----
const fs = require("fs");            // CommonJS
import fs from "fs";                  // ESM (package.json: "type": "module")

// ---- Async patterns ----
fs.readFile("f.txt", "utf8", (err, data) => { ... });   // callback
fs.promises.readFile("f.txt", "utf8").then(data => ...); // Promise
const data = await fs.promises.readFile("f.txt", "utf8"); // async/await

// ---- Streams (memory-efficient large data processing) ----
fs.createReadStream("big.txt").pipe(fs.createWriteStream("copy.txt"));

// ---- Event loop order ----
// synchronous code -> ALL microtasks (Promises, nextTick) -> next macrotask (setTimeout/setImmediate)

// ---- Blocking the event loop (NEVER do this in a server) ----
// fs.readFileSync(...)   // blocks EVERY concurrent request, not just this one

// ---- worker_threads for CPU-bound work ----
const { Worker } = require("worker_threads");
new Worker("./cpu-task.js", { workerData: { n: 42 } });

// ---- Multi-core scaling ----
// pm2 start server.js -i max
// or multiple container replicas via Kubernetes

// ---- npm essentials ----
// npm ci                    // reproducible install from lock file (use in CI/prod)
// npm audit                  // check for known vulnerabilities

// ---- Production ----
// NODE_ENV=production node server.js
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What makes Node.js single-threaded but still highly concurrent? | JS runs on one thread; I/O is non-blocking via libuv/OS async I/O, freeing that thread while waiting. |
| Why does Promise.then() run before setTimeout(fn, 0)? | Node drains the ENTIRE microtask queue after every callback, before the next macrotask phase. |
| What does libuv's thread pool handle? | fs operations, some crypto, DNS lookups — things the OS has no native async API for. |
| What is worker_threads for? | Genuine multi-threaded JS execution for CPU-bound work, each with its own V8 instance. |
| Why is blocking the event loop so damaging? | It stalls EVERY concurrent request/timer/callback the process is handling, not just one. |
| CommonJS vs ES Modules? | require/module.exports (original, sync) vs import/export (modern standard, native support). |
| What is backpressure? | When a readable stream produces data faster than a writable stream can consume it. |
| How do you use more than one CPU core? | Multiple processes: cluster module, PM2 cluster mode, or container replicas. |
| What's the most Node-specific monitoring signal? | Event-loop lag — predicts latency degradation before it's visible in request metrics. |
| What does npm ci do differently from npm install? | Installs the EXACT locked versions from package-lock.json — reproducible builds. |
| What is prototype pollution? | A JS-specific vulnerability manipulating an object's prototype chain via unsanitized input. |
| Why avoid exec() with user input? | It invokes a shell — command injection risk; use execFile()/spawn() instead. |
| What crashed processes historically, now handled explicitly? | Unhandled Promise rejections — always add .catch()/try-catch. |
`,

  mcqs: `
1. Why does a synchronous, CPU-heavy operation in one request handler slow down OTHER concurrent requests too?
   A) It doesn't, they're isolated  B) All JS runs on one thread — it blocks everything until it returns  C) Node queues requests separately  D) Only in browsers, not Node
   **Answer: B** — the defining Node.js concurrency characteristic.

2. What runs first: a Promise's .then() callback or a setTimeout(fn, 0) callback?
   A) setTimeout always  B) The Promise's .then() — microtasks drain before the next macrotask phase  C) They run simultaneously  D) Undefined behavior
   **Answer: B** — a deterministic, frequently misunderstood ordering rule.

3. What does libuv's thread pool handle that network I/O does NOT need?
   A) Nothing, it's for network too  B) fs operations, some crypto, DNS lookups  C) All I/O without exception  D) Only HTTP parsing
   **Answer: B** — network I/O uses the OS's own async facilities directly, no thread pool needed.

4. What is the correct tool for genuinely CPU-bound work in Node.js?
   A) Just use async/await  B) worker_threads, for true parallel JS execution  C) setImmediate  D) Promises, they're non-blocking automatically
   **Answer: B** — Promises don't make CPU-bound synchronous code non-blocking.

5. What does npm ci provide that npm install does not guarantee?
   A) Faster installs always  B) Exact reproduction of package-lock.json's locked versions  C) Automatic vulnerability fixes  D) Smaller node_modules
   **Answer: B** — essential for reproducible CI/production builds.

6. What is the earliest, most Node-specific warning sign of a creeping performance problem?
   A) CPU usage  B) Event-loop lag  C) Disk space  D) Number of npm packages installed
   **Answer: B** — rising lag predicts request-latency degradation before it's otherwise visible.
`,

  "revision-notes": `
Node.js is a JavaScript runtime built on V8, architected around a single-threaded event loop paired with non-blocking I/O — a deliberate bet that most server workloads spend more time waiting on I/O than computing, making a thread-per-connection model wasteful compared to one thread efficiently interleaving many concurrent I/O-bound operations. Network I/O uses the operating system's own async facilities directly; certain other operations (most file system calls, some crypto, DNS lookups) are dispatched to libuv's separate thread pool (default 4 threads) since the OS provides no native async API for them — a distinction worth understanding precisely, since it explains why heavy file I/O can occasionally contend for limited thread-pool capacity.

The single most consequential Node-specific architectural fact is that ALL JavaScript in one process runs on ONE thread: non-blocking I/O lets that thread interleave many concurrent operations efficiently, but any genuinely synchronous, CPU-bound code blocks EVERY other concurrent request, timer, or I/O callback the process is handling, since there's no thread-level preemption to interrupt it. This is why *Sync functions (readFileSync, execSync) are dangerous in request-serving code, and why worker_threads (genuine, explicitly-created parallel JavaScript execution) or a separate service are the correct tools for CPU-bound work, not something that "just works" because Node is asynchronous.

The event loop's execution order — synchronous code first, then the ENTIRE microtask queue (process.nextTick, then Promise callbacks) drained after every single callback, only then the next macrotask (setTimeout/setImmediate) — explains the frequently misunderstood observation that a Promise's .then() runs before a setTimeout(fn, 0) callback even with a zero delay. Streams provide memory-efficient processing of data larger than available memory, with backpressure (handled automatically by pipe(), or manually via pause/resume/drain) preventing a fast producer from overwhelming a slow consumer.

Because a single Node process uses only one CPU core, production deployments scale horizontally across multiple processes (the cluster module, PM2's cluster mode, or multiple container replicas via an orchestrator), with shared state (caching, WebSocket broadcast, sessions) externalized to Redis the moment more than one process serves traffic. Event-loop lag is the single most Node-specific production monitoring signal, predicting request-latency degradation before it becomes visible in request-level metrics alone — worth alerting on as a first-class metric alongside the universal RED (Rate, Errors, Duration) pattern every production service should track.

npm's enormous package ecosystem is both Node's greatest practical strength and a genuine, documented security tradeoff — a typical project's transitive dependency tree can include hundreds of packages, each a potential supply-chain attack surface, making npm audit and dependency-pinning discipline (committing package-lock.json, using npm ci in CI/CD) a real production security practice, not just a convenience.
`,

  "learning-roadmap": `
**Week 1 — Node.js fundamentals**: core modules (fs, http, path), CommonJS vs ES Modules, callbacks, Promises, and async/await. Milestone: a working CLI tool or minimal HTTP server built without any framework, using only Node's core modules.

**Week 2 — The event loop in depth**: event loop phases, microtasks vs macrotasks, and deliberately writing (then diagnosing) a piece of event-loop-blocking code. Milestone: correctly predict the execution order of a mixed callback/Promise/setTimeout code sample, and fix a blocking synchronous call with its async equivalent.

**Week 3 — Streams and buffers**: reading/writing large files via streams, understanding backpressure, and working with the Buffer class for binary data. Milestone: build a stream-based file-processing tool handling a file larger than available memory comfortably.

**Week 4 — Concurrency beyond the single thread**: worker_threads for CPU-bound work, the cluster module for multi-core scaling, and libuv's thread pool. Milestone: complete Lab 3, demonstrating the measured difference worker_threads makes for a genuinely CPU-bound endpoint under concurrent load.

**Week 5 — Production practices**: structured logging (pino), error handling (unhandled rejection/exception handlers), npm dependency management and auditing, and testing (Jest/Vitest or node:test). Milestone: a properly logged, tested, dependency-audited small service.

**Week 6 — Deployment and observability**: Dockerize, run under PM2 cluster mode or multiple container replicas, wire up event-loop-lag and other Prometheus metrics. Milestone: complete Lab 4 end to end, with a load test demonstrating clustering's effect on throughput.

Next platform skill once this roadmap is complete: **Express** or **NestJS** for the dominant web framework layer built on these Node.js foundations.
`,

  "official-docs": `
- **nodejs.org/docs** — the official Node.js API documentation, the primary reference for every core module referenced throughout this page.
- **nodejs.org/en/learn** — Node's own official learning guides, covering fundamentals through advanced topics with well-maintained, current examples.
- **libuv's documentation (libuv.org)** — for a deeper dive into the event loop and thread pool internals underneath Node's own abstractions.
- **npm's official documentation (docs.npmjs.com)** — for package.json semantics, semantic versioning, and npm CLI command reference.
- **V8's own documentation and blog (v8.dev)** — for understanding the JavaScript engine's JIT compilation and garbage collection behavior in depth.
`,

  books: `
- **"Node.js Design Patterns" (3rd ed.) — Mario Casciaro and Luciano Mammino** — the definitive deep dive into Node's architecture, streams, and design patterns; the single most recommended book for genuinely understanding Node beyond surface-level API usage.
- **"Node.js in Action" (2nd ed.) — Alex Young et al.** — a practical, comprehensive introduction covering the core modules and common application patterns.
- **"You Don't Know JS" series — Kyle Simpson** — not Node-specific, but essential deep JavaScript fundamentals (closures, async, the event loop's language-level underpinnings) this page assumes familiarity with.
- **"Effective TypeScript" — Dan Vanderkam** — highly recommended for anyone writing production Node.js code, given how strongly TypeScript is now the production norm.
`,

  blogs: `
- **The official Node.js blog (nodejs.org/en/blog)** — release announcements and security advisories directly from the Node.js team.
- **Node Weekly** — a widely read weekly newsletter aggregating high-signal Node.js ecosystem news and articles.
- **2ality (Axel Rauschmayer's blog)** — deep, precise JavaScript and Node.js language-feature explanations.
- **The PayPal, LinkedIn, and Netflix engineering blogs** — periodic posts on their respective Node.js production experiences and learnings, directly relevant to this page's Case Studies section.
`,

  "research-papers": `
Node.js itself, as a runtime, has relatively little dedicated academic literature — the most relevant foundational reading concerns event-driven, non-blocking I/O architecture generally:

- **Discussions of the "C10K problem"** (the challenge of handling ten thousand concurrent connections efficiently, widely discussed in systems literature from the early 2000s) — the direct historical motivation for event-driven server architectures Node's design builds on.
- **The reactor pattern** (as formalized in classic concurrent-programming design-pattern literature) — the general architectural pattern Node's event loop implements, applicable across languages and runtimes.
- Ryan Dahl's original conference talks introducing Node.js (widely available as recorded video rather than formal papers) are the closest primary source explaining the specific design rationale behind Node's non-blocking model.
`,

  videos: `
- **Ryan Dahl's original 2009 JSConf.eu talk introducing Node.js** — the historical primary source, still worth watching for the original motivating problem and design rationale directly from the creator.
- **NodeConf and JSConf talks on Node.js internals and performance** (widely available on YouTube) — deep, current talks from core contributors and large-scale production users.
- **"Node.js Event Loop Explained" style deep-dive videos** (multiple well-regarded creators cover this specific, frequently-misunderstood topic) — worth watching more than one explanation given how commonly this concept is initially misunderstood.
- **Fireship's "Node.js in 100 Seconds" and related rapid-overview content** — useful for a quick conceptual refresher.
- **The PayPal and LinkedIn engineering teams' conference talks** on their Node.js migrations — directly relevant to this page's Case Studies section.
`,

  "github-repos": `
- **nodejs/node** — the runtime's own source, an excellent (if advanced) read for understanding the event loop, libuv integration, and core module internals directly.
- **libuv/libuv** — the C library underlying Node's event loop and thread pool, for a deeper systems-level understanding.
- **nodejs/node** issue tracker and **nodejs/TSC** (Technical Steering Committee) discussions — for understanding how Node's own governance and feature decisions are made.
- **davidmarkclements/clinic (clinicjs.org)** — the diagnostic tooling suite (doctor, flame, bubbleprof) referenced throughout this page's Performance and Debugging sections.
- **pinojs/pino** — the high-performance structured logging library referenced in Monitoring.
- **goldbergyoni/nodebestpractices** — an extremely widely cited, community-curated collection of Node.js production best practices.
- **nodejs/citgm (Continuous Integration Test Get Munki)** — Node's own cross-ecosystem compatibility testing project, useful for understanding how Node's team tracks ecosystem-wide impact of core changes.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Core modules and async patterns**: build a small CLI tool using only fs, path, and http (no framework), covering both callback and async/await styles for the same operation.
2. **Event loop reasoning**: given a code sample mixing synchronous code, Promises, setTimeout, and setImmediate, predict the exact execution order, then verify by running it.
3. **Streams**: process a multi-gigabyte (or simulated large) file with a stream-based transformation, verifying memory usage stays bounded regardless of file size.
4. **Concurrency**: implement the CPU-bound blocking problem (see Coding Questions/Hands-on Labs), demonstrate the event-loop-blocking symptom under load, then fix it with worker_threads and measure the difference.
5. **Debugging**: given a deliberately memory-leaking script (an ever-growing array/Map never cleared), use heap snapshots to identify the leaking object type.
6. **External practice sets**: Node.js's own official learning guides for structured, guided practice; nodebestpractices' GitHub repository as a self-review checklist against your own code; "Node.js Design Patterns"' companion exercises for deeper architectural practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    Client["Client requests"] -->|network I/O, OS-level async| EL["Node.js event loop\n(single JS thread)"]
    EL --> Handlers["Application code\n(route handlers, business logic)"]
    Handlers -->|fs, some crypto, DNS| LibUV["libuv thread pool\n(default 4 threads)"]
    Handlers -->|CPU-bound work| Workers["worker_threads\n(genuine parallel JS execution)"]
    Handlers --> DB[("Database")]
    Handlers --> Cache[("Redis\nshared state across processes")]
    subgraph MultiCore["Multi-core scaling"]
        P1["Node process 1"]
        P2["Node process N"]
    end
    LB["Load balancer"] --> P1
    LB --> P2
    P1 & P2 --> Cache
    subgraph Observability
        EventLoopLag["Event-loop lag metric"]
        Logs["pino structured logs"]
        APM["Sentry / APM"]
    end
    EL -.-> EventLoopLag
    Handlers -.-> Logs
    Handlers -.-> APM
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Node.js))
    Foundations
      Overview
      History
      Why it exists
      Problem it solves
    Core Runtime
      V8 engine
      Event loop phases
      libuv and thread pool
      Microtasks vs macrotasks
    Core Modules
      fs and streams
      http
      path and os
      Buffer
    Concurrency
      Single-threaded model
      Blocking the event loop
      worker_threads
      Clustering
    Modules and Packages
      CommonJS vs ESM
      npm and package.json
      Dependency security
    Production
      Process management PM2
      Monitoring event-loop lag
      Docker and Kubernetes
      Production checklist
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default nodejs;
