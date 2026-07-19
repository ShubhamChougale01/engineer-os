import type { SkillContent } from "../types";

/**
 * JavaScript — full 50-section knowledge page.
 * Code blocks use ~~~ fences. The rare template-literal examples use escaped
 * backticks (` via \`) and escaped dollar-brace (\${) — keep it that way.
 */
const javascript: SkillContent = {
  overview: `
JavaScript is the programming language of the web — the only language every browser executes natively — and, through **Node.js**, one of the most deployed backend languages on earth. It is dynamically typed, garbage-collected, single-threaded with an event loop, and multi-paradigm: functional patterns, prototype-based objects, and class syntax all coexist.

For an AI engineer, JavaScript is the delivery layer. Every AI product with a user interface — ChatGPT, Claude, Midjourney's gallery, every internal LLM dashboard — is a JavaScript (usually TypeScript) frontend streaming tokens over SSE or WebSockets. The official OpenAI and Anthropic SDKs ship for JavaScript alongside Python; LangChain has a full JS port; and edge runtimes (Cloudflare Workers, Vercel) run JavaScript closest to users. If Python is where models are built, JavaScript is where they meet people.

Key characteristics: event-driven non-blocking IO (superb for streaming and high-concurrency APIs), first-class functions and closures everywhere, JSON as its native data format, an enormous ecosystem (npm is the largest package registry in existence), and a standards process (TC39/ECMAScript) that ships a new language version every year.
`,

  history: `
JavaScript was created by **Brendan Eich** at Netscape in **ten days** in May 1995 — originally called Mocha, then LiveScript, then JavaScript (a marketing nod to Java, with which it shares almost nothing). The rushed birth explains the famous quirks; the miracle is how well the core ideas (closures, first-class functions, prototypes) have aged.

| Year | Milestone |
|------|-----------|
| 1995 | Created in 10 days at Netscape |
| 1997 | ECMAScript 1 — standardization begins (ECMA-262) |
| 1999 | ES3 — regex, try/catch; the baseline for a decade |
| 2005 | AJAX named — XMLHttpRequest makes web apps possible |
| 2008 | V8 engine ships with Chrome — JIT compilation makes JS fast |
| 2009 | ES5 (strict mode, JSON) and **Node.js** — JS leaves the browser |
| 2010 | npm — the package ecosystem ignites |
| 2015 | **ES6/ES2015** — classes, modules, promises, arrow functions, let/const: the modern language |
| 2016+ | Annual releases: async/await (2017), optional chaining (2020), top-level await (2022) |
| 2018 | Deno announced by Node's creator, rethinking security and modules |
| 2023 | Bun 1.0 — a third runtime focused on speed; ES2023 immutable array methods |
| 2024 | ES2024 — Object.groupBy, Promise.withResolvers; Node 22 LTS |

The governance story matters: after ES4 collapsed in committee politics (2008), TC39 adopted incremental yearly releases with a staged proposal process (stage 0–4) — one of the most successful language-evolution models in the industry.
`,

  "why-it-exists": `
In 1995 the web was static documents. Any interactivity — validating a form, reacting to a click — required a full round-trip to the server. Netscape wanted a "glue language" that designers and part-time programmers could embed directly in HTML to make pages respond instantly.

The constraints shaped the language:

1. **It had to run in the browser sandbox** — no files, no threads, no blocking. This forced the event-driven, callback-based model that later made Node.js a server-side phenomenon: the same non-blocking design that handles mouse clicks handles 100k concurrent sockets.
2. **It had to be forgiving** — silent coercions and permissive syntax so a broken script degraded rather than crashed the page. (This is the origin of == weirdness; strict mode and === are the modern corrections.)
3. **It had to ship in weeks** — so Eich borrowed the best available ideas: Scheme's closures and first-class functions, Self's prototypes, Java's surface syntax.

JavaScript exists because the web needed a programmable layer, and it endures because it is the only language with a guaranteed runtime on every device with a browser — a distribution advantage no other language has ever had.
`,

  "problem-it-solves": `
JavaScript solves the **universal client problem**: one language, zero installation, runs on every device.

Concretely it removes:

- **The deployment barrier**: shipping software = sending text to a browser. No installers, no runtimes to manage, instant updates for every user.
- **The concurrency-for-IO problem**: the event loop handles thousands of simultaneous slow operations (network calls, user events, token streams) on one thread with no locks, no races on shared memory, and no thread-pool tuning. This is why Node.js excels at exactly the workload AI apps have: many concurrent, slow, streaming connections.
- **The two-language web**: with Node.js, the same language, types (via TypeScript), and even the same validation code run on client and server.
- **Data interchange friction**: JSON is literally JavaScript object syntax — the entire API economy speaks JavaScript's data format.

What it deliberately does NOT solve: CPU-bound parallelism (one thread; workers exist but with message-passing, not shared objects), static type safety (that's the **TypeScript** skill), and numeric precision for money/science (64-bit floats only, plus BigInt). Knowing when to reach for TypeScript, workers, WASM, or a different backend language is the senior-level judgment this page builds.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Write modern idiomatic JavaScript: const-first, arrow functions, destructuring, modules, array methods, optional chaining.
2. Explain closures, prototypes, and the four rules of **this** — and predict what any snippet logs.
3. Master async JavaScript: callbacks → promises → async/await, and the exact microtask/macrotask ordering of the event loop.
4. Explain how V8 executes code: parsing, bytecode, JIT tiers, hidden classes, inline caches.
5. Handle errors, timeouts, and cancellation (AbortController) correctly in async code — the #1 production skill.
6. Structure, lint, test (Vitest), and bundle a real project; know the npm/pnpm toolchain.
7. Build streaming UIs: consume SSE/ReadableStream token streams from LLM APIs.
8. Diagnose performance and memory issues with DevTools and Node profilers.
9. Answer senior interview questions on the event loop, coercion, hoisting/TDZ, and inheritance.
`,

  prerequisites: `
- **Required**: basic programming literacy — variables, loops, functions in any language. This page starts JavaScript from zero.
- **Helpful**: HTML/CSS basics for the DOM examples (not required — most examples are pure language).
- **For internals sections**: nothing extra; V8 internals are explained from first principles.

Dependency links: this page → **TypeScript** (the professional superset, learn next) → **Node.js** (the server runtime, deep dive) → **Express** / **NestJS** (frameworks). **REST**, **WebSockets**, and **SSE** build directly on the async skills learned here.
`,

  "beginner-concepts": `
### Variables: const, let (and why not var)

~~~javascript
const name = "Ada";      // default choice: cannot be reassigned
let count = 0;           // use when reassignment is needed
count += 1;

// var is legacy: function-scoped, hoisted, allows redeclaration.
// Modern code simply never uses it (see Anti-Patterns).
~~~

### Types — dynamic but knowable

Seven primitives: string, number, boolean, undefined, null, bigint, symbol — plus objects (everything else, including arrays and functions).

~~~javascript
typeof "hi"        // "string"
typeof 42          // "number"  (all numbers are 64-bit floats)
typeof undefined   // "undefined"
typeof null        // "object"  <- famous historical bug, memorize it
Array.isArray([])  // true      (typeof [] is "object", so use this)
~~~

### Equality: always ===

~~~javascript
1 == "1"    // true  — == coerces types, source of countless bugs
1 === "1"   // false — === compares type AND value. Always use ===
null == undefined   // true  (the ONE useful == case)
Number.isNaN(NaN)   // true  (NaN !== NaN, so use this helper)
~~~

### Strings and template literals

~~~javascript
const user = "shubham";
const greet = "Hello, " + user + "!";          // concatenation
const better = \`Hello, \${user.toUpperCase()}!\`; // template literal:
// backtick-delimited, \${expression} interpolation, multiline allowed
~~~

### Arrays and objects

~~~javascript
const langs = ["js", "ts", "python"];
langs.push("go");            // add to end
langs.length;                // 4
langs[0];                    // "js"
langs.includes("ts");        // true

const person = { name: "Ada", age: 36 };
person.age;                  // dot access
person["name"];              // bracket access (dynamic keys)
person.city = "London";      // add property
const keys = Object.keys(person);     // ["name","age","city"]
~~~

### Functions — three forms

~~~javascript
function add(a, b = 2) {      // declaration (hoisted), default param
  return a + b;
}

const mul = function (a, b) { // function expression
  return a * b;
};

const square = (x) => x * x;  // arrow function: concise, no own "this"
~~~

### Control flow and truthiness

~~~javascript
// Falsy values — memorize all six:
// false, 0, "", null, undefined, NaN. EVERYTHING else is truthy.
if (items.length) console.log("non-empty");

for (const lang of langs) console.log(lang);      // values (use this)
for (const [i, lang] of langs.entries()) { }      // index + value

const label = score > 90 ? "A" : "B";             // ternary
~~~

### JSON — the native data format

~~~javascript
const json = JSON.stringify({ ok: true, n: 1 });  // object -> string
const obj = JSON.parse(json);                      // string -> object
// Production note: JSON.parse throws on bad input — wrap in try/catch
// whenever the string comes from a network or user.
~~~

### First taste of async

~~~javascript
console.log("first");
setTimeout(() => console.log("third"), 0);  // queued for later
console.log("second");
// Output: first, second, third — async callbacks NEVER run mid-statement;
// they wait until the current code finishes. This is the event loop.
~~~
`,

  "intermediate-concepts": `
### Destructuring, spread, rest

~~~javascript
const { name, age = 18, ...others } = person;    // object destructuring
const [first, second] = langs;                    // array destructuring

const merged = { ...defaults, ...userConfig };    // spread: shallow merge
const copy = [...langs];                          // shallow array copy

function log(level, ...messages) {                // rest parameters
  console.log(level, messages.join(" "));
}
~~~

### Closures — the language's superpower

A closure is a function that remembers the variables of the scope where it was created, even after that scope has finished.

~~~javascript
function makeCounter() {
  let count = 0;                 // private state — inaccessible outside
  return {
    inc: () => ++count,
    get: () => count,
  };
}
const counter = makeCounter();
counter.inc(); counter.inc();
counter.get();                   // 2 — state survives between calls
~~~

Closures power every callback, event handler, debounce, module pattern, and React hook. Understanding them is non-negotiable.

### Array methods — data pipelines

~~~javascript
const orders = [
  { id: 1, total: 40, paid: true },
  { id: 2, total: 90, paid: false },
  { id: 3, total: 15, paid: true },
];

const paidTotal = orders
  .filter((o) => o.paid)                 // keep matching
  .map((o) => o.total)                   // transform
  .reduce((sum, t) => sum + t, 0);       // fold to one value -> 55

orders.find((o) => o.id === 2);          // first match or undefined
orders.some((o) => o.total > 50);        // true
orders.every((o) => o.paid);             // false
[...orders].sort((a, b) => a.total - b.total); // copy then sort (sort mutates!)
~~~

### Optional chaining and nullish coalescing

~~~javascript
const city = user?.address?.city;        // undefined instead of TypeError
const port = config.port ?? 3000;        // ?? only falls back on null/undefined
// (|| would wrongly replace 0 or "" — use ?? for defaults)
user?.notify?.();                        // call only if the method exists
~~~

### Classes

~~~javascript
class Queue {
  #items = [];                           // # = truly private field

  enqueue(item) { this.#items.push(item); return this; }
  dequeue() { return this.#items.shift(); }
  get size() { return this.#items.length; }   // getter

  static from(iterable) {                // factory on the class itself
    const q = new Queue();
    for (const x of iterable) q.enqueue(x);
    return q;
  }
}
~~~

Classes are syntax over prototypes (see Advanced) — cleaner to write, same machinery underneath.

### Modules (ESM)

~~~javascript
// mathUtils.js
export const TAU = Math.PI * 2;
export function circleArea(r) { return Math.PI * r * r; }
export default class Circle { }

// app.js
import Circle, { TAU, circleArea } from "./mathUtils.js";
const lazy = await import("./heavy.js");   // dynamic import: code-splitting
~~~

### Promises and async/await

~~~javascript
// A promise is a placeholder for a future value:
// pending -> fulfilled (value) or rejected (error). One transition, ever.

async function getUser(id) {
  // AbortController = timeout/cancellation — REQUIRED in production
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch("/api/users/" + id, { signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);  // fetch does NOT
    return await res.json();                             // throw on 404/500!
  } finally {
    clearTimeout(timer);
  }
}

// Run independent work CONCURRENTLY — never await in sequence needlessly
const [user, orders] = await Promise.all([getUser(1), getOrders(1)]);

// Partial failure tolerated:
const results = await Promise.allSettled(tasks);
~~~

### Error handling done right

~~~javascript
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

try {
  await getUser(1);
} catch (err) {
  if (err.name === "AbortError") handleTimeout();
  else if (err instanceof ApiError && err.status === 404) show404();
  else throw err;               // never swallow unknown errors
}
~~~
`,

  "advanced-concepts": `
### The event loop — microtasks vs macrotasks

One thread runs your code. The loop: run a task to completion → drain the ENTIRE microtask queue → render (browser) → next task.

- **Microtasks**: promise callbacks (.then / await continuations), queueMicrotask.
- **Macrotasks**: setTimeout, setInterval, IO events, user events.

~~~javascript
console.log("1");
setTimeout(() => console.log("4"), 0);          // macrotask
Promise.resolve().then(() => console.log("3")); // microtask
console.log("2");
// Output: 1, 2, 3, 4 — microtasks ALWAYS beat macrotasks.
// Interview classic; also a real production concern: an infinite
// microtask chain starves rendering and IO completely.
~~~

### this — the four binding rules

| Call form | this is… |
|-----------|----------|
| obj.method() | obj (implicit binding) |
| fn() | undefined in strict mode / globalThis otherwise |
| fn.call(x) / fn.apply(x) / fn.bind(x) | x (explicit binding) |
| new Fn() | the newly created object |

Arrow functions have NO own this — they capture it lexically from where they were written. That is why arrows are perfect for callbacks and wrong for object methods that need dynamic this.

~~~javascript
class Poller {
  count = 0;
  start() {
    // Arrow captures the instance; a regular function would lose it
    setInterval(() => this.count++, 1000);
  }
}
~~~

### Prototypes — the real inheritance model

Every object has an internal link to a prototype object. Property lookup walks the chain until found or null.

~~~javascript
const animal = { speak() { return this.name + " makes a sound"; } };
const dog = Object.create(animal);   // dog's prototype is animal
dog.name = "Rex";
dog.speak();                          // found on the chain -> "Rex makes a sound"

// class syntax builds exactly this:
// instance -> ClassName.prototype -> ParentClass.prototype -> Object.prototype -> null
Object.getPrototypeOf(dog) === animal;  // true
~~~

### Generators and iterators

~~~javascript
function* paginate(fetchPage) {
  let page = 0, batch;
  do {
    batch = fetchPage(page++);
    yield* batch;                 // lazily hand out items one at a time
  } while (batch.length > 0);
}

// Async generators consume LLM token streams elegantly:
async function* readTokens(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();         // always release, even on early exit
  }
}
for await (const token of readTokens(response.body)) render(token);
~~~

### Memory model and GC

- Generational garbage collection (V8: young "scavenger" space + old mark-sweep-compact space).
- Leaks in JS are almost always **unintentional references**: forgotten timers, detached DOM nodes held by closures, ever-growing Maps/arrays used as caches.
- **WeakMap / WeakRef** hold references that do not prevent collection — the correct tool for metadata caches keyed by objects.

### Concurrency decision table

| Workload | Tool | Why |
|----------|------|-----|
| Many network calls | Promise.all / async iteration | Event loop shines at IO |
| CPU-heavy in browser | Web Worker | Off the main thread; message passing |
| CPU-heavy in Node | worker_threads / child process | True parallelism |
| Shared binary state | SharedArrayBuffer + Atomics | Rare; expert-level |
| Max performance kernel | WebAssembly module | Near-native speed, called from JS |

### Proxy and Reflect — metaprogramming

~~~javascript
const tracked = new Proxy(config, {
  get(target, prop) {
    audit("read", prop);                    // intercept every access
    return Reflect.get(target, prop);
  },
});
// This is how Vue reactivity and many validation/ORM libraries work.
~~~
`,

  "internal-working": `
Modern engines (V8 in Chrome/Node/Bun-adjacent, JavaScriptCore in Safari/Bun, SpiderMonkey in Firefox) execute JavaScript through a tiered pipeline:

~~~mermaid
flowchart LR
    A["Source .js"] --> B["Parser → AST"]
    B --> C["Ignition\nbytecode interpreter"]
    C -->|hot code + type feedback| D["TurboFan\noptimizing JIT → machine code"]
    D -->|assumption broken| C
    C --> E["Heap: objects, hidden classes"]
    F["GC: scavenger (young)\nmark-sweep (old)"] --> E
~~~

1. **Parse** → Abstract Syntax Tree (lazy parsing skips function bodies until first call — parse cost matters for startup).
2. **Ignition** compiles the AST to compact bytecode and interprets it, collecting **type feedback** (what shapes/types flow through each operation).
3. **TurboFan** compiles hot functions to optimized machine code based on that feedback, with speculative assumptions ("this parameter is always a small integer").
4. **Deoptimization**: if an assumption breaks (suddenly a string arrives), the machine code is thrown away and execution falls back to bytecode. Code that keeps changing types stays slow forever.

Two V8 concepts every senior should know:

- **Hidden classes (shapes)**: objects created with the same properties in the same order share an internal shape, making property access a fixed-offset lookup (fast). Adding properties in varying orders or after creation creates shape explosions (slow). This idea descends from the Self language research (see Research Papers).
- **Inline caches (ICs)**: each property-access site remembers the shapes it has seen. One shape = monomorphic = fastest; many shapes = megamorphic = slow dictionary lookups.

Practical consequence: initialize all object properties in the constructor, in a consistent order, and keep arrays element-kind-consistent (do not mix numbers and strings) — the JIT rewards predictability.
`,

  architecture: `
### Runtime architecture

JavaScript itself defines no IO. The host embeds the engine and supplies capabilities:

~~~mermaid
flowchart TB
    subgraph Host["Browser or Node.js process"]
        subgraph Engine["V8 engine"]
            CS["Call stack (one thread)"]
            HP["Heap"]
            MQ["Microtask queue"]
        end
        EL["Event loop"]
        subgraph Platform["Host APIs"]
            B1["Browser: DOM, fetch, timers,\nWeb Workers, storage"]
            N1["Node: libuv thread pool,\nfs, net, timers, worker_threads"]
        end
    end
    Platform -->|completed events| EL
    EL -->|next callback| CS
    CS --> MQ
~~~

Key insight: **fetch, setTimeout, and the DOM are not JavaScript** — they are host APIs. The event loop ferries their completion events back into the single-threaded engine. In Node, libuv runs file IO and DNS on a small thread pool while sockets use OS-level async primitives (epoll/kqueue).

### Application architecture

A production JavaScript service or app should be layered exactly like any serious codebase:

~~~
myapp/
├── package.json            # scripts, deps, engines field
├── src/
│   ├── api/                # transport: route handlers, request parsing
│   ├── services/           # business logic — pure, framework-free
│   ├── repositories/       # data access behind interfaces
│   ├── lib/                # cross-cutting: logger, config, http client
│   └── index.js            # composition root: wire dependencies, start
├── tests/                  # mirrors src/
└── eslint.config.js
~~~

Same rules as the **Python** skill's architecture section: dependencies point inward, business logic never imports the web framework, and side effects live at the edges. On the frontend the equivalent is components → hooks/state → services → API client.
`,

  "data-flow": `
Trace of a click that calls an API and updates the page — the loop in action:

~~~mermaid
sequenceDiagram
    participant U as User
    participant EL as Event loop
    participant JS as Call stack (your code)
    participant H as Host (fetch/network)

    U->>EL: click event (macrotask queued)
    EL->>JS: run click handler
    JS->>H: fetch("/api/data") — hands off, returns Promise
    JS-->>EL: handler finishes (stack empty)
    Note over EL: loop is FREE — UI stays responsive
    H-->>EL: response arrives — promise reaction (microtask)
    EL->>JS: run await continuation
    JS->>JS: res.json() … setState / DOM update
    Note over JS: microtask queue drained before next render/task
~~~

The lesson generalizes to Node serving requests: while one request awaits the database, the loop processes other requests. One synchronous CPU-heavy block (a giant JSON.parse, a tight loop) freezes EVERYTHING — every user, every request. "Never block the loop" is the JavaScript prime directive, exactly parallel to asyncio's rule in the **Python** skill.

Module loading data flow (ESM): import declarations are parsed first, a dependency graph is built, modules are fetched/loaded, instantiated (bindings linked), then evaluated depth-first, once each, and cached. Circular imports therefore yield partially-initialized bindings rather than infinite loops — usually a design smell worth fixing.
`,

  "production-usage": `
### Toolchain (2025-era standard)

- **Runtime**: Node.js LTS (even-numbered versions; 22 is the current LTS line as of my knowledge cutoff) — or Bun/Deno where their tradeoffs fit.
- **Package manager**: npm (default), **pnpm** (fast, disk-efficient — common in monorepos). Commit the lockfile, always.
- **Linter/formatter**: ESLint (flat config) + Prettier, or **Biome** as a fast all-in-one.
- **Bundler**: Vite for apps (esbuild-powered dev server), esbuild/tsup for libraries.
- **Types**: real teams write TypeScript; plain JS projects still type-check via JSDoc + tsc. See the **TypeScript** skill.

### package.json essentials

~~~json
{
  "name": "myservice",
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "node --watch src/index.js",
    "test": "vitest run",
    "lint": "eslint ."
  }
}
~~~

"type": "module" opts into ESM (import/export). Mixed CJS/ESM interop is the ecosystem's sharpest edge — new projects should be ESM-only.

### Operational defaults for Node services

1. Config from environment variables, validated at startup — crash early on missing config.
2. Timeouts + AbortController on every outbound call; fetch has NO default timeout.
3. Handle **unhandledRejection** and **uncaughtException**: log, flush, exit — a process in unknown state must restart (the orchestrator's job — see **Kubernetes**).
4. Graceful shutdown on SIGTERM: stop accepting, drain in-flight requests, close pools.
5. One process per core via the orchestrator (or Node's cluster module) — same GIL-free-but-single-threaded scaling story detailed in Scalability.
`,

  "industry-examples": `
- **Netflix**: moved its UI tier to Node.js — startup time for the service layer dropped from tens of minutes (JVM) to under two, and frontend/backend teams merged skill sets. One of the earliest large Node validation stories.
- **PayPal**: rebuilt account pages on Node; reported ~2x faster development with fewer engineers and ~35% faster response times versus the prior Java stack — the study that convinced a generation of enterprises.
- **OpenAI (ChatGPT) and Anthropic (Claude.ai)**: the AI products people use daily are React/Next.js frontends streaming tokens over SSE — JavaScript is the entire user-facing layer, plus official JS/TS SDKs for both APIs.
- **VS Code / Slack / Discord (desktop)**: Electron apps — JavaScript/TypeScript running on Chromium + Node. VS Code is arguably the most successful desktop app of the decade, written in TypeScript.
- **Walmart**: famously served Black Friday traffic through Node.js gateways, demonstrating event-loop IO scaling under extreme concurrency.
- **Cloudflare Workers / Vercel Edge**: run JavaScript (V8 isolates) at hundreds of edge locations — the standard way to put AI inference routing and personalization milliseconds from users.

Pattern: JavaScript owns the user-facing and IO-heavy tiers; CPU-heavy internals live elsewhere (Rust/C++/WASM) — the same "right tool per layer" architecture as the **Python** skill's case studies.
`,

  "best-practices": `
1. **const by default, let when needed, var never** — reassignment becomes a visible signal.
2. **=== always**; the only acceptable == is x == null (checks null AND undefined).
3. **Handle every promise**: await it, return it, or explicitly void it with a comment. Floating promises hide production errors.
4. **AbortController + timeout on all network calls** — the unhandled-timeout bug is JavaScript's mutable-default-argument equivalent.
5. **Immutability at boundaries**: spread/toSorted/structuredClone instead of mutating shared objects; mutation bugs are the hardest to trace.
6. **Small pure functions, data pipelines** (map/filter/reduce) over index-juggling loops.
7. **ESM everywhere** in new code; no mixed module systems.
8. **Lint + format in CI** (ESLint/Biome + Prettier): zero style debates, real bug classes caught (no-floating-promises via typescript-eslint).
9. **Validate at the edges**: never trust request bodies/env/localStorage — parse with zod/valibot into known shapes.
10. **Feature-detect, never browser-detect** on the frontend.
11. **Keep functions monomorphic** for hot paths (consistent argument types) — see Internal Working for why.
12. **Prefer platform APIs** (fetch, URL, crypto, Intl) over dependencies — every npm package is a supply-chain liability (see Security).
`,

  "anti-patterns": `
### The floating promise

~~~javascript
// WRONG — fire and forget: errors vanish, ordering is luck
saveUser(user);
redirect("/done");

// RIGHT
await saveUser(user);
redirect("/done");
~~~

### Sequential awaits for independent work

~~~javascript
// WRONG — 3 round trips in series
const a = await fetchA();
const b = await fetchB();

// RIGHT — concurrent
const [a2, b2] = await Promise.all([fetchA(), fetchB()]);
~~~

### async inside forEach

~~~javascript
// WRONG — forEach ignores promises; nothing is awaited
items.forEach(async (item) => await process(item));

// RIGHT — sequential:
for (const item of items) await process(item);
// RIGHT — concurrent:
await Promise.all(items.map(process));
~~~

### Mutating shared state

~~~javascript
// WRONG — sort mutates the original array callers still hold
const top = users.sort((a, b) => b.score - a.score)[0];

// RIGHT
const top2 = users.toSorted((a, b) => b.score - a.score)[0]; // ES2023
~~~

### Other classics

- **var + closures in loops**: all callbacks see the final value. let per-iteration binding fixed this — another reason var is dead.
- **== coercion roulette**: [] == false is true; "0" == false is true. Just use ===.
- **for…in over arrays** — iterates keys as strings, includes inherited props. Use for…of.
- **Deep nesting of callbacks** ("callback hell") — refactor to async/await.
- **try/catch around everything with empty catch** — swallowing errors is worse than crashing.
- **Monkey-patching built-ins / prototype pollution** — breaks libraries and is a real attack vector (see Security).
`,

  performance: `
### Measure first

- **Browser**: DevTools Performance panel (flame chart, long tasks), Lighthouse, the Web Vitals metrics (LCP, INP, CLS).
- **Node**: node --cpu-prof + Chrome DevTools; **clinic.js** flame graphs; perf_hooks for precise timing; 0x for quick flames.

~~~javascript
// Quick timing that won't lie to you:
const t0 = performance.now();
doWork();
console.log(performance.now() - t0, "ms");
~~~

### Optimization hierarchy (apply in order)

1. **Algorithms and data structures** — Map/Set lookups are O(1) vs Array.includes O(n); the wrong structure dwarfs all micro-optimizations.
2. **Do less work**: cache computed values, debounce/throttle event handlers, virtualize long lists, paginate.
3. **Ship less JavaScript** (frontend): bundle analysis, code-splitting via dynamic import, tree-shakeable dependencies. Parse+compile time is a real cost on phones — often bigger than execution.
4. **Move work off the hot thread**: Web Workers / worker_threads for CPU tasks; requestIdleCallback for deferrable work.
5. **Stream instead of buffer**: process network/file data incrementally (ReadableStream, Node streams) — lower memory AND faster first output; this is exactly how LLM token UIs feel fast.
6. **JIT-friendly code** for proven hot paths: stable object shapes, monomorphic functions, avoid try/catch inside the hottest loops, numeric arrays kept numeric.
7. **WASM** for genuinely numeric kernels (image processing, tokenizers — this is how transformers.js runs models in the browser).

### Numbers worth knowing

- A 200KB JS bundle ≈ 1s+ of parse/execute on a mid-range phone.
- Long task threshold: 50ms — anything longer visibly jankos interaction.
- V8 deopt: a megamorphic call site can be ~10x slower than monomorphic.
`,

  scalability: `
### The Node scaling story

One process = one event loop = one core (plus the small libuv pool). Scaling = many processes:

~~~mermaid
flowchart LR
    LB["Load balancer / nginx"] --> P1["node process 1"]
    LB --> P2["node process 2"]
    LB --> P3["node process N (≈ cores)"]
    P1 & P2 & P3 --> R[("Redis\nsessions · cache · queues")]
    P1 & P2 & P3 --> DB[("PostgreSQL")]
~~~

- **Stateless processes**: sessions and shared state live in **Redis**/**PostgreSQL**, so any process serves any request; then horizontal scaling is just replica count (see **Kubernetes**, **Load Balancers**).
- **Event-loop lag is THE health metric**: if the loop is busy, everything queues. Monitor it (see Monitoring) and alert on p99 lag.
- **CPU work is the enemy**: one 200ms synchronous task = 200ms of frozen service. Offload to worker_threads, queues (**Message Queues** skill), or a different service.

### Bottleneck table

| Bottleneck | Symptom | Answer |
|------------|---------|--------|
| Event-loop blocking | All latencies spike together | Profile; move CPU work to workers/queues |
| Connection pool exhaustion | Timeouts under load | Right-size pool; per-call timeouts; backpressure |
| Memory growth per process | OOM restarts | Heap snapshots; bounded caches; streams over buffers |
| Chatty downstream calls | High p99 | Batch, cache, parallelize with Promise.all |
| Frontend bundle size | Slow first load worldwide | Code-split, CDN (**CDN** skill), edge rendering |

### Browser-side scale

Frontend "scale" = performance at the 95th percentile device/network: code-splitting, CDN caching, edge rendering, optimistic UI, and streaming responses (SSE) so users see progress immediately — critical for AI products where full responses take seconds.
`,

  security: `
### JavaScript-specific attack surface

1. **XSS — the flagship risk**: any user content inserted as HTML executes attacker script. Never assign untrusted strings to innerHTML; use textContent, framework escaping (React does this by default), and a Content-Security-Policy header. Full treatment in the **XSS** skill.
2. **Prototype pollution**: deep-merging attacker JSON can set the key __proto__ and inject properties onto EVERY object. Use null-prototype maps (Object.create(null)) or Map for untrusted keys; keep merge libraries patched.
3. **Supply chain — npm's dark side**: typosquats, hijacked maintainers, install scripts. Defenses: lockfiles committed, npm audit / OSV scanning in CI, minimal dependencies, pin versions, review diffs on upgrades. (Real incidents: event-stream 2018, ua-parser-js 2021, colors/faker 2022.)
4. **eval / new Function / dynamic import of user input** — remote code execution. There is essentially never a legitimate reason in application code.
5. **ReDoS**: catastrophic-backtracking regexes freeze the single thread — a one-string denial of service. Prefer simple patterns; test with long adversarial inputs.
6. **Secrets in frontend code**: every byte shipped to a browser is public. API keys belong on the server (see **Secrets Management**); the frontend gets short-lived, scoped tokens (see **JWT**, **OAuth 2.0 / OIDC**).

### Server-side (Node) additions

- Validate every input with a schema (zod) before it touches logic — parse, don't sanitize.
- Set security headers (helmet or manually): CSP, HSTS, X-Content-Type-Options.
- Cookies: HttpOnly, Secure, SameSite (see **Cookies & Sessions**, **CSRF**).
- Run as non-root in containers; keep Node patched (V8 CVEs are real).
`,

  testing: `
**Vitest** is the modern standard (Jest-compatible API, ESM-native, fast). Frontend components add Testing Library; end-to-end adds Playwright.

~~~javascript
// tests/pricing.test.js
import { describe, expect, it, vi } from "vitest";
import { applyDiscount, priceWithTax } from "../src/pricing.js";

describe("applyDiscount", () => {
  it("applies a percentage discount", () => {
    expect(applyDiscount(100, 10)).toBe(90);
  });

  it.each([
    [100, 0, 100],
    [100, 100, 0],
    [59.99, 15, 50.99],
  ])("price %f with %f%% -> %f", (price, pct, expected) => {
    expect(applyDiscount(price, pct)).toBeCloseTo(expected, 2);
  });

  it("rejects invalid percentages", () => {
    expect(() => applyDiscount(100, 150)).toThrow(/percent/);
  });
});
~~~

### Async and mocked-boundary tests

~~~javascript
it("times out slow upstreams", async () => {
  vi.useFakeTimers();                      // control the clock — no real sleeping
  const promise = fetchWithTimeout("/slow", 5000);
  vi.advanceTimersByTime(5001);
  await expect(promise).rejects.toThrow(/abort/i);
  vi.useRealTimers();
});

it("retries on 500", async () => {
  const fake = vi.fn()
    .mockRejectedValueOnce(new Error("HTTP 500"))
    .mockResolvedValueOnce({ ok: true });
  await expect(withRetry(fake, 2)).resolves.toEqual({ ok: true });
  expect(fake).toHaveBeenCalledTimes(2);
});
~~~

### Senior doctrine

Test behavior through public interfaces, not implementation. Mock only true boundaries (network, clock, randomness) — vi.useFakeTimers for time, fetch-mocking at the HTTP layer, not your own modules. Component tests assert what the user sees (Testing Library queries), not component internals. Property-based testing (fast-check) shines on parsers and pure utilities. Coverage goal: high on logic, zero theater on glue.
`,

  debugging: `
### Escalation path

1. **Read the error + stack trace**; with source maps, production traces point at real source lines. Async stack traces are joined automatically in modern V8.
2. **console beyond log**:

~~~javascript
console.table(users);              // objects as a sortable table
console.dir(node, { depth: null }); // full object graphs
console.trace("how did we get here");
console.time("query"); await q(); console.timeEnd("query");
~~~

3. **debugger statement / breakpoints** — DevTools Sources panel: conditional breakpoints, logpoints (log without editing code), watch expressions, "pause on caught exceptions".
4. **Node inspection**: node --inspect app.js then open chrome://inspect — the same DevTools debugger attached to your server. --inspect-brk pauses at the first line.
5. **Frozen event loop diagnosis**: node --cpu-prof for a profile; in an emergency, kill -USR1 a running Node process to enable the inspector on the fly.
6. **Memory leaks**: DevTools Memory panel — take heap snapshot → act → snapshot → "Objects allocated between snapshots"; look for detached DOM trees and growing arrays/Maps. In Node: --heapsnapshot-signal=SIGUSR2.

### Async debugging specifics

- An UnhandledPromiseRejection log means a promise chain is missing await/catch — find it; do not just silence the event.
- "Value logged is different from value shown when expanded": console lazily evaluates objects — log a structuredClone(obj) snapshot instead.
- Race suspects: add queueMicrotask markers or use DevTools' async stack tags to see interleaving.
`,

  monitoring: `
### Frontend

- **Web Vitals** (LCP, INP, CLS) via the web-vitals library, reported to your analytics endpoint — measures what users feel.
- **Error tracking**: Sentry (or equivalent) with source maps uploaded per release, so minified stack traces resolve to real code.

### Node services

~~~javascript
import { monitorEventLoopDelay, performance } from "node:perf_hooks";
import client from "prom-client";           // Prometheus — see that skill

client.collectDefaultMetrics();              // heap, GC, CPU out of the box

// THE Node health metric: event-loop delay
const loopDelay = monitorEventLoopDelay({ resolution: 20 });
loopDelay.enable();
new client.Gauge({
  name: "nodejs_eventloop_delay_p99_ms",
  help: "p99 event loop delay",
  collect() { this.set(loopDelay.percentile(99) / 1e6); },
});

const httpLatency = new client.Histogram({
  name: "http_request_seconds",
  help: "request latency",
  labelNames: ["route", "status"],
});
~~~

Track the RED trio per route (Rate, Errors, Duration p50/p95/p99) plus loop delay and heap. Alert on user symptoms (error rate, p99, loop delay), not raw CPU. Structured JSON logs with a request ID propagated through async flows — AsyncLocalStorage carries context without threading parameters through every call. Dashboards and alerting: **Prometheus** + **Grafana** skills; distributed tracing: **OpenTelemetry** auto-instruments http/express/pg in two lines.
`,

  deployment: `
### Node service — production Dockerfile

~~~dockerfile
# ---- build stage ----
FROM node:22-slim AS build          # slim: small attack surface + image
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                          # ci = exact lockfile install, reproducible
COPY . .
RUN npm run build && npm prune --omit=dev   # drop devDependencies

# ---- runtime stage ----
FROM node:22-slim
ENV NODE_ENV=production             # libraries enable fast paths on this
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node                           # built-in non-root user: container hardening
EXPOSE 3000
# exec form + tini-like init: signals (SIGTERM) reach the process directly
CMD ["node", "dist/index.js"]
~~~

Graceful shutdown belongs in code:

~~~javascript
const server = app.listen(3000);
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));   // stop accepting, drain, exit
  setTimeout(() => process.exit(1), 10_000).unref(); // hard deadline
});
~~~

### Frontends

Static builds (Vite output) deploy to a CDN/object storage — no server at all (see **CDN**). SSR/edge apps (Next.js et al.) deploy as Node processes or edge functions. Either way: immutable, hashed asset filenames + long cache headers, HTML uncached.

### Pipeline

lint → typecheck → test → build → audit dependencies → build image → scan → deploy with rolling update. Wire it in **GitHub Actions**; runtime platform in **Docker** / **Kubernetes** skills.
`,

  "production-checklist": `
Before JavaScript takes production traffic:

- [ ] Lockfile committed; npm ci (never npm install) in CI and images
- [ ] engines field pins the Node major; same version in dev/CI/prod
- [ ] ESLint + Prettier/Biome green in CI; no-floating-promises rule on
- [ ] Test suite green; critical paths covered (Vitest + Playwright)
- [ ] Every fetch/db call has a timeout and AbortController wiring
- [ ] unhandledRejection / uncaughtException handlers: log, flush, exit
- [ ] Graceful SIGTERM drain verified (kill a pod, watch requests finish)
- [ ] Input validation (zod or equivalent) on every external boundary
- [ ] Security headers + CSP; cookies HttpOnly/Secure/SameSite
- [ ] npm audit / OSV scan gating CI; dependency count reviewed
- [ ] Source maps uploaded to the error tracker per release
- [ ] Metrics: RED per route + event-loop delay + heap; alerts on p99 and error rate
- [ ] Logs are structured JSON with request IDs (AsyncLocalStorage)
- [ ] NODE_ENV=production; no secrets in frontend bundles (grep the build!)
- [ ] Load test done: known requests/sec ceiling and failure mode
- [ ] Bundle budget enforced (frontend): main chunk under target KB
`,

  "common-mistakes": `
1. **Forgetting await** — the function returns a pending promise; code "works" until an error silently disappears. Enable the no-floating-promises lint rule.
2. **== instead of ===** — "0" == false. Coercion tables are trivia; === is engineering.
3. **Mutating props/state/shared arrays** — sort/splice/push on data someone else holds. Use toSorted/toSpliced/spread.
4. **this lost on extraction**: const f = obj.method; f() — undefined this. Bind, wrap in arrow, or keep the call as obj.method().
5. **parseInt without expectations**: parseInt("08") is fine now, but parseInt("1e3") is 1. For user input prefer Number(str) and validate NaN.
6. **Array.prototype.sort default is lexicographic**: [10, 9, 1].sort() → [1, 10, 9]. Always pass a comparator for numbers.
7. **0.1 + 0.2 !== 0.3** — binary floats. Money is integer cents or a decimal library (same rule as the **Python** skill).
8. **Treating fetch 404/500 as errors** — fetch only rejects on network failure; check res.ok yourself.
9. **setInterval for polling async work** — intervals overlap if the work is slow; use a self-scheduling setTimeout loop.
10. **Leaky abstractions of ESM/CJS**: require in ESM files, default-import mismatches. Pick ESM, configure "type": "module", stay consistent.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| TypeError: Cannot read properties of undefined | Accessing a property on missing data | Optional chaining ?. + validate inputs at boundaries |
| ReferenceError: x is not defined | Typo, missing import, or TDZ (used before let/const line) | Check imports; declare before use |
| SyntaxError: Cannot use import statement outside a module | Running ESM in CJS context | "type": "module" in package.json or .mjs extension |
| UnhandledPromiseRejection | A promise with no await/catch threw | Find the floating promise; add handling |
| CORS error (browser console) | Server missing Access-Control-Allow-Origin | Fix server headers — this is a server config issue, not JS |
| ERR_MODULE_NOT_FOUND | ESM requires file extensions in relative imports | Write ./util.js not ./util |
| RangeError: Maximum call stack size exceeded | Infinite recursion (often in getters or JSON of cyclic objects) | Check base cases; structuredClone handles cycles |
| Hydration mismatch (SSR frameworks) | Server HTML differs from client render (dates, random) | Render deterministic content; gate browser-only code |
| FetchError/ECONNREFUSED (Node) | Target down or wrong URL/port | Verify env config; add retries with backoff |
| Heap out of memory (Node) | Unbounded cache/array; giant JSON buffering | Stream instead of buffer; bound caches; heap snapshot |

Habit: reproduce in the smallest file possible, read the FIRST stack frame in your own code, and fix causes, not symptoms.
`,

  faqs: `
**Q: JavaScript vs Java — related?**
Only by marketing. Java is statically typed, class-based, JVM-compiled; JavaScript is dynamic, prototype-based, JIT-interpreted. The name was a 1995 partnership stunt.

**Q: Should I learn JavaScript or TypeScript first?**
JavaScript first — TypeScript IS JavaScript plus types; every JS concept on this page applies unchanged. Learn JS deeply for 4–6 weeks, then adopt TS (next skill on the platform) and never look back for codebases beyond scripts.

**Q: Is JavaScript slow?**
No — V8's JIT makes well-shaped JS within striking distance of Java/Go for many workloads, and its IO model is elite. It IS the wrong tool for heavy CPU parallelism; that's WASM/worker/Rust territory.

**Q: Semicolons or not?**
Either works if a formatter enforces consistency. ASI (automatic semicolon insertion) has 2–3 trap cases (return on its own line, lines starting with parens/brackets); Prettier makes the debate irrelevant.

**Q: Node, Deno, or Bun?**
Node for production defaults and ecosystem certainty; Bun for speed-sensitive tooling and its all-in-one DX; Deno where its security model and web-standard purity fit. Skills transfer ~95% between them.

**Q: Why so many frameworks?**
The platform gives primitives, not architecture; the ecosystem iterates in public. Learn the language deeply and frameworks become interchangeable dialects — that is this page's entire strategy.

**Q: Do I need to memorize coercion rules?**
No — write === and explicit conversions (Number(x), String(x), Boolean(x)) and coercion trivia becomes interview-only knowledge. Know the six falsy values; that covers real code.
`,

  "interview-questions": `
**Junior/Mid:**

1. *let vs const vs var?* Block scope + TDZ for let/const, function scope + hoisted-undefined for var; const forbids rebinding (not mutation of the object). var is legacy.
2. *What is a closure? Give a real use.* Function + its captured scope; powers private state (counter/module pattern), callbacks remembering context, debounce keeping its timer.
3. *== vs ===?* Coercing vs strict equality; === compares type and value; only sanctioned == use is x == null.
4. *What are the falsy values?* false, 0, "", null, undefined, NaN — everything else truthy, including [] and {}.
5. *map vs forEach?* map returns a new transformed array (use for data); forEach returns undefined (side effects only, ignores async).
6. *What does async/await do?* Syntax over promises: await pauses THE FUNCTION (not the thread), resuming as a microtask with the resolved value; errors surface as throws.

**Senior:**

7. *Explain the event loop with microtask ordering.* Task runs to completion → entire microtask queue drains (promise reactions) → render/next task. Predict: sync logs, then all .then callbacks, then setTimeout. Mention starvation via infinite microtasks.
8. *The four this rules + arrow functions?* Implicit (obj.m()), default (undefined/global), explicit (call/apply/bind), new. Arrows capture lexically — no own this/arguments; wrong for dynamic-this methods, right for callbacks.
9. *How does prototypal inheritance actually work?* Objects link to prototypes; lookup walks the chain; class syntax wires ClassName.prototype and super via the same links. Object.create builds it directly.
10. *What are hidden classes/inline caches, and one practical consequence?* V8 shape system for fast property offsets; call sites cache seen shapes. Consequence: initialize consistent object shapes; avoid megamorphic hot paths (see Internal Working).
11. *How do you find and fix an event-loop stall in production?* Symptom: all latencies spike together; monitorEventLoopDelay confirms; --cpu-prof profile finds the sync culprit (JSON.parse of megabytes, regex backtracking); fix: stream, chunk, or move to a worker.
12. *Design token streaming from an LLM API to the browser.* Server: SSE (see **SSE** skill) proxied with backpressure; client: fetch + ReadableStream/EventSource, incremental render per chunk, AbortController for stop-generation, retry with jitter on disconnect.
`,

  "coding-questions": `
### 1. Implement debounce (asked constantly — closures + timers + this)

~~~javascript
function debounce(fn, waitMs) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);                    // reset the countdown on every call
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);                 // preserve this + arguments
    }, waitMs);
  };
}

// Usage: fire search 300ms after the user STOPS typing
input.addEventListener("input", debounce((e) => search(e.target.value), 300));
~~~

Complexity: O(1) per call. Follow-ups: add leading-edge option, cancel() method, then implement **throttle** (rate-limit: fire at most once per interval) and contrast use cases.

### 2. Implement Promise.all from scratch (async fundamentals)

~~~javascript
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = [...iterable];
    const results = new Array(items.length);
    let pending = items.length;
    if (pending === 0) return resolve(results);   // edge case: empty input

    items.forEach((item, i) => {
      // Promise.resolve handles non-promise values in the input
      Promise.resolve(item).then((value) => {
        results[i] = value;                        // preserve ORDER, not finish order
        if (--pending === 0) resolve(results);
      }, reject);                                  // first rejection wins
    });
  });
}
~~~

Complexity: O(n). Follow-ups: implement allSettled (never rejects), race, and any (rejects only if ALL reject — AggregateError).

### 3. Flatten a nested array without Array.flat (recursion + iterators)

~~~javascript
function flatten(arr) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item)) out.push(...flatten(item)); // recurse on arrays only
    else out.push(item);
  }
  return out;
}

flatten([1, [2, [3, [4]], 5]]);   // [1, 2, 3, 4, 5]

// Generator variant — lazy, constant memory for huge structures:
function* flatIter(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) yield* flatIter(item);
    else yield item;
  }
}
~~~

Complexity: O(n) items, O(d) stack depth. Follow-ups: depth-limited version (how Array.flat(depth) behaves), iterative version with an explicit stack to avoid recursion limits.
`,

  "hands-on-labs": `
### Lab 1 — Interactive task board, zero dependencies (beginner, ~2h)
Plain HTML + one JS file: add/complete/delete tasks, filter tabs, persist to localStorage, keyboard shortcuts. No framework — raw DOM APIs (querySelector, addEventListener, dataset). Deliverable: single-file app. Skills: DOM, events, closures, JSON, array methods.

### Lab 2 — Concurrent API dashboard (intermediate, ~3h)
Fetch 4 public APIs concurrently (Promise.all), render cards, then harden it: per-request AbortController timeouts, allSettled so one failure doesn't kill the page, retry with exponential backoff + jitter, loading/error/empty states. Deliverable: the hardened fetch helper as a reusable module + a paragraph on what each hardening step protects against. Skills: the entire async layer.

### Lab 3 — Event loop visualizer (advanced, ~4h)
Build a page that runs code snippets and animates the call stack, microtask queue, and macrotask queue step by step (instrument with wrappers around setTimeout/Promise). Getting this right forces complete event-loop understanding. Deliverable: correctly ordered visualization of 5 tricky snippets. Skills: event loop mastery, meta-programming.

### Lab 4 — LLM token-streaming client (production, ~4h)
Node SSE proxy (keeps the API key server-side) + browser client that streams tokens from an LLM API via fetch + ReadableStream: incremental markdown rendering, stop button (AbortController), reconnect on drop, latency metrics (time-to-first-token). Deliverable: working streaming chat page. Skills: streams, SSE, cancellation — directly transferable to every AI product (see **SSE** and **Streaming** skills).
`,

  "real-projects": `
1. **Streaming AI chat application** — Browser UI + Node BFF (backend-for-frontend): SSE token streaming with markdown + code highlighting, conversation history in localStorage + server, stop/regenerate (AbortController), cost/latency HUD, dark mode. Engineering bar: zero floating promises (lint-enforced), Vitest coverage on the stream parser, Playwright E2E, bundle under 150KB, deployed behind a CDN. Demonstrates exactly the skills AI-product teams hire frontend/full-stack engineers for.

2. **Real-time collaborative whiteboard** — WebSocket sync (see **WebSockets**), optimistic local updates with server reconciliation, presence cursors, offline queue + replay, canvas rendering with requestAnimationFrame batching. Demonstrates: real-time protocols, state synchronization reasoning, performance discipline.

3. **Publish a typed utility library to npm** — e.g. a retry/backoff + timeout + circuit-breaker toolkit for fetch. Full engineering wrapper: ESM+CJS dual build (tsup), JSDoc types consumable from TS, 100% Vitest coverage, fast-check property tests, semantic-release CI, README with benchmarks. Demonstrates: library API design, packaging mastery, open-source hygiene — disproportionately impressive in interviews.
`,

  "case-studies": `
### Netflix: JVM to Node at the edge
Netflix rebuilt its UI service tier on Node.js: startup dropped from ~40 minutes (their JVM setup) to under 2, enabling far faster deploys, and one language spanned client and server rendering. LESSON: the event-loop model fits render/IO tiers perfectly — and developer velocity is a production feature.

### PayPal: the study that convinced the enterprise
PayPal rebuilt its account overview page in Node in parallel with a Java version: built ~2x faster with fewer engineers, ~33% fewer lines, ~35% faster responses. LESSON: full-stack language sharing has measurable organizational value — the argument that took Node from startup toy to enterprise default.

### VS Code: TypeScript at desktop scale
A full IDE in TypeScript on Electron, performant enough to dominate its market: process separation (renderer vs extension host), aggressive lazy loading, and profiling-driven optimization. LESSON: "JavaScript can't do big apps" is false with architecture and discipline — and its extension model shows how to design for an ecosystem.

### The event-stream attack (2018): supply chain wake-up call
A burned-out maintainer handed a popular npm package to a stranger, who shipped a payload targeting a bitcoin wallet's build. Millions of downloads carried it. LESSON: your dependencies are your attack surface — lockfiles, audits, and minimal dependency trees are security controls, not chores (see Security).

### Figma: JS where it belongs, WASM where it counts
Figma runs its design canvas in C++ compiled to WebAssembly, with the surrounding product UI in TypeScript/React. LESSON: the senior architecture is JS for product surface area + WASM/native for compute kernels — the same division AI apps use (transformers.js, tokenizers in WASM).
`,

  comparisons: `
| Dimension | JavaScript | TypeScript | Python | Go | Rust (+WASM) |
|-----------|------------|------------|--------|-----|--------------|
| Typing | Dynamic | Static (gradual) | Dynamic + hints | Static | Static, strict |
| Runs in browsers | **Natively** | Via compile to JS | No (Pyodide niche) | No (WASM niche) | Via WASM |
| Concurrency | Event loop; workers | Same | asyncio / GIL story | Goroutines (best) | Threads, fearless |
| Single-thread speed | Fast (JIT) | Same | Slower | Fast | Fastest |
| AI/ML ecosystem | Serving/UI strong | Same | **Training + everything** | Thin | Growing infra |
| Backend maturity | Excellent (Node) | Excellent | Excellent | Excellent | Good |
| Ideal role | UI + IO services | JS at scale | ML, data, glue | Infra services | Kernels, hot paths |

**How seniors choose**: browser work — no choice, it's JS/TS. Full-stack products — TypeScript end to end. ML/data-heavy backends — **Python** (see that skill). High-concurrency infrastructure — **Go**. CPU kernels feeding JS — **Rust** via WASM/native addons. The modern AI stack is typically: Python for models, TypeScript for product, Rust sprinkled where profiling demands it.
`,

  "related-technologies": `
- **TypeScript** — the types layer; the professional default. Learn immediately after this page.
- **Node.js** — the server runtime deep-dive: libuv, streams, cluster, diagnostics.
- **Express / NestJS** — the platform's Node framework skills.
- **React ecosystem** (not a platform skill yet) — the dominant UI library; everything here (closures, immutability, event loop) is its foundation.
- **Deno & Bun** — alternative runtimes: Deno (security sandbox, web standards), Bun (speed, built-in bundler/test runner).
- **WebAssembly** — near-native compute inside the JS sandbox; how in-browser ML (transformers.js) works.
- **SSE / WebSockets** — the streaming transports every AI interface uses; JS is their native habitat.
- **JWT / OAuth 2.0 / Cookies & Sessions** — the auth trio every JS app touches.
- **CDN** — how JS bundles actually reach users fast.

Natural path on this platform: **JavaScript → TypeScript → Node.js → Express/NestJS → SSE/WebSockets**, then loop back to **REST** and **JWT** for API craft.
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check tc39.es/proposals and node.js/en/about/previous-releases for anything newer.

- **ES2023**: immutable array methods — toSorted, toReversed, toSpliced, with; findLast/findLastIndex; hashbang grammar.
- **ES2024**: Object.groupBy / Map.groupBy (finally!), Promise.withResolvers, well-formed Unicode strings, resizable ArrayBuffers, RegExp v flag.
- **Stage-3 pipeline to watch (status as of my cutoff)**: **Temporal** (the datetime API that fixes Date — enormous), **decorators** (shipping in TypeScript already), explicit resource management (using declarations), import attributes.
- **Node.js**: 22 is the active LTS line (native watch mode, stable fetch/WebSocket client, --run); Node 24 expected on the usual cadence in late 2025 — verify.
- **Runtimes**: Bun 1.x maturing fast (test runner, bundler, node-compat); Deno 2 focused on Node/npm compatibility.
- **Tooling shift**: ESLint flat config is now the default; Biome consolidating lint+format for speed; monorepos standardizing on pnpm workspaces.
- **Ecosystem reality**: TypeScript adoption is effectively universal for new professional projects — plain-JS-only codebases are becoming legacy markers.
`,

  "future-roadmap": `
Where the language and ecosystem are heading:

1. **Temporal lands** — the modern date/time API (immutable, timezone-correct) replaces the broken Date for new code; learn it the day it ships to your runtimes.
2. **Types move toward the platform**: the type-annotations proposal (types as ignorable syntax) would let engines run TypeScript-ish code directly; runtimes already execute TS (Deno, Bun, Node --experimental-strip-types). Direction: the TS/JS boundary keeps dissolving.
3. **Edge-first architectures**: V8 isolates at CDN edges (Workers, Vercel) make JS the default language of low-latency personalization and AI routing — request-time compute without servers.
4. **WASM component model**: polyglot modules (Rust/Go/Python) composing with JS seamlessly — JS as the orchestration layer over compiled kernels, in browser and server alike.
5. **AI in the runtime**: in-browser inference (WebGPU + transformers.js/ONNX Runtime Web) matures — private, zero-latency ML in the client, orchestrated by JavaScript.
6. **Signals** (TC39 proposal): reactivity primitives standardizing framework internals — watch it reshape state management.

Career bets: deep async/streaming fluency, TypeScript, and edge/WASM literacy — those separate senior JS engineers for the next five years, exactly as async+typing do for **Python**.
`,

  "cheat-sheet": `
~~~javascript
// --- Variables & types ---
const x = 1; let y = 2;              // never var
typeof v; Array.isArray(a);          // type checks
Number("42"); String(9); Boolean(v); // explicit conversion
// falsy: false 0 "" null undefined NaN

// --- Strings ---
s.includes(t); s.startsWith(t); s.slice(0, 5);
s.trim(); s.split(","); parts.join("-");
s.replaceAll("a", "b"); s.padStart(2, "0");

// --- Arrays ---
a.map(f); a.filter(f); a.reduce(f, init);
a.find(f); a.some(f); a.every(f); a.includes(v);
a.toSorted(cmp); a.toReversed(); a.flat(depth); a.at(-1);
[...a]; Array.from(iter); a.entries();

// --- Objects ---
const { p, q = 1, ...rest } = obj;   // destructure + default
{ ...defaults, ...overrides }         // shallow merge
Object.keys(o); Object.values(o); Object.entries(o);
Object.groupBy(items, f);             // ES2024
structuredClone(o);                   // deep copy (handles cycles)

// --- Functions ---
const f = (a, b = 2) => a + b;
function g(...args) { }               // rest
f.call(ctx, x); f.bind(ctx);          // explicit this

// --- Classes ---
class T extends Base {
  #priv = 0;                          // private field
  static make() { return new T(); }
  get value() { return this.#priv; }
}

// --- Async ---
const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
if (!r.ok) throw new Error("HTTP " + r.status);
const data = await r.json();
await Promise.all([p1, p2]);          // concurrent
await Promise.allSettled(ps);         // tolerate failures
for await (const chunk of stream) { } // async iteration

// --- Modules ---
import def, { named } from "./m.js";
export const a = 1; export default thing;
const mod = await import("./lazy.js");

// --- Essentials toolbelt ---
new Map(); new Set(); new WeakMap();
JSON.parse(s); JSON.stringify(o, null, 2);
new URL(u); new URLSearchParams(q);
crypto.randomUUID(); Intl.NumberFormat();
queueMicrotask(f); performance.now();
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| The six falsy values? | false, 0, "", null, undefined, NaN |
| Microtasks vs macrotasks — who wins? | ALL microtasks (promise callbacks) drain before the next macrotask (setTimeout/events) |
| What is a closure? | A function bundled with the scope variables it captured at creation |
| Arrow function's this? | Lexical — captured from where it was written; no own this |
| The four this rules? | implicit (obj.m()), default (undefined/global), explicit (call/bind), new |
| == vs ===? | == coerces types; === strict. Use === (exception: x == null) |
| Why is fetch(url).then(r => r.json()) not enough? | fetch does not reject on 404/500 — check r.ok; also no default timeout |
| let/const vs var? | Block scope + TDZ vs function scope + hoisted undefined; var is legacy |
| sort() gotcha? | Lexicographic by default AND mutates — use toSorted((a,b) => a-b) |
| Promise.all vs allSettled? | all rejects fast on first failure; allSettled always resolves with statuses |
| What links class syntax and prototypes? | Classes are sugar: methods land on ClassName.prototype; lookup walks the chain |
| Hidden classes matter because…? | Stable object shapes → monomorphic inline caches → JIT-fast property access |
| Cancel an in-flight fetch? | AbortController: pass controller.signal, call controller.abort() |
| WeakMap use case? | Metadata keyed by objects without preventing garbage collection |
| forEach + async = ? | Broken — promises ignored. Use for…of (sequential) or Promise.all(map) |
`,

  mcqs: `
**1. What logs?**

~~~javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
~~~

A) A D C B  B) A D B C  C) A B C D  D) A C D B

**Answer: A** — sync first (A, D), then microtasks (C), then macrotasks (B). Microtasks always drain before the next task.

**2. [10, 9, 1].sort() returns?**

A) [1, 9, 10]  B) [10, 9, 1]  C) [1, 10, 9]  D) TypeError

**Answer: C** — default sort compares STRING representations: "1" < "10" < "9". Pass (a, b) => a - b for numbers.

**3. Which is NOT falsy?**

A) NaN  B) ""  C) []  D) 0

**Answer: C** — empty array is truthy (all objects are). Yet [] == false is true — coercion and truthiness are different systems; use ===.

**4. const user = { name: "A" }; What fails?**

A) user.name = "B"  B) user.age = 1  C) user = {}  D) delete user.name

**Answer: C** — const locks the BINDING, not the object. Mutation is allowed; reassignment throws. Object.freeze(user) locks contents.

**5. What does await actually pause?**

A) The whole thread  B) The event loop  C) Only the enclosing async function  D) All pending promises

**Answer: C** — the function suspends and returns control to the loop; everything else keeps running. The continuation resumes as a microtask.

**6. Extracting a method: const f = obj.getName; f(); — this inside f is?**

A) obj  B) undefined (strict mode)  C) f itself  D) the module

**Answer: B** — the call site lost the object receiver (default binding). Fix with obj.getName(), bind, or an arrow wrapper.
`,

  "revision-notes": `
**Language core in 8 lines**: const/let only; seven primitives + objects; === always; six falsy values memorized. Template literals interpolate; destructuring and spread everywhere. Functions are values; closures capture scope and power everything. Arrays speak map/filter/reduce; objects are hash maps with prototypes behind them. Classes are prototype sugar with #private fields. Optional chaining ?. and nullish ?? kill the undefined-crash class of bugs. ESM (import/export) is the module system.

**Async in 6 lines**: one thread + event loop; tasks run to completion, then ALL microtasks (promise reactions), then next task. async/await is promise sugar — await suspends only its function. Independent work goes through Promise.all; failure-tolerant batches through allSettled. Every network call gets AbortController + timeout because fetch has neither by default and does not reject on HTTP errors. Never block the loop; never float a promise; never put async in forEach.

**Internals in 4 lines**: V8 parses → Ignition bytecode → TurboFan JIT with speculative optimization → deopt on surprise types. Hidden classes make stable object shapes fast; inline caches reward monomorphic code. GC is generational; leaks are forgotten references (timers, detached DOM, unbounded Maps). fetch/DOM/timers are host APIs, not the language.

**Production in 5 lines**: lockfile + npm ci + pinned Node LTS; ESLint (no-floating-promises) + Prettier in CI. Validate all inputs with schemas; XSS/prototype-pollution/supply-chain are the JS attack trio. Monitor RED per route + event-loop delay; structured logs with request IDs. Docker: node:22-slim, multi-stage, non-root, SIGTERM drain. Frontend: bundle budget, code-splitting, CDN.

**Interview reflexes**: event-loop ordering snippets, closures + loop-with-var trap, four this rules, prototype chain walk, ==/=== coercion traps, sort lexicographic, debounce/throttle from scratch, Promise.all from scratch, floating promises, streaming design with SSE + AbortController.
`,

  "learning-roadmap": `
A realistic path to senior-level JavaScript (adjust pace to your background):

**Week 1–2 — Core language.** Beginner Concepts + Lab 1 (DOM task board). Daily: 3 small katas using array methods, no loops-with-indexes allowed. Milestone: build any interactive page with zero copy-paste.

**Week 3–4 — Idiomatic JS + functions deep-dive.** Intermediate Concepts: destructuring, closures, classes, modules. Re-implement debounce, once, memoize from scratch. Milestone: explain closures with your own example, unprompted.

**Week 5–6 — Async mastery.** Promises → async/await → the event loop section until the MCQ-1 style questions feel trivial. Lab 2 (hardened concurrent dashboard). Milestone: whiteboard the microtask/macrotask order of arbitrary snippets correctly.

**Week 7–8 — Internals + advanced.** Advanced Concepts + Internal Working; Lab 3 (event-loop visualizer). Read prototype chains in DevTools. Milestone: explain hidden classes and why shape-stable code is fast.

**Week 9–10 — Production engineering.** Production Usage → Deployment sections; set up ESLint/Vitest/CI on a repo; Lab 4 (LLM streaming client). Milestone: a deployed, tested, streaming AI page on your GitHub.

**Week 11–12 — Interview polish + project.** Interview/Coding Questions; start Real Project 1 (streaming chat app). Milestone: debounce, Promise.all polyfill, and event-loop explanations delivered fluently out loud.

Then continue to **TypeScript** on this platform — it assumes exactly what you now know, and everything after (Node.js, NestJS, and the AI-product stack) builds on both.
`,

  "official-docs": `
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — THE reference for language + web APIs; superbly maintained. Bookmark the JavaScript Guide and Reference.
- [ECMAScript specification](https://tc39.es/ecma262/) — the ground truth; read algorithm steps when semantics are disputed.
- [TC39 proposals](https://github.com/tc39/proposals) — what's coming, by stage; how the language actually evolves.
- [Node.js docs](https://nodejs.org/docs/latest/api/) — runtime APIs; the "stability index" per module matters.
- [javascript.info](https://javascript.info/) — a full modern tutorial; the best structured free curriculum, effectively docs-quality.
- [web.dev](https://web.dev/) — Google's performance/quality guidance (Web Vitals live here).
- [Can I use](https://caniuse.com/) — browser support tables before you adopt a feature.
`,

  books: `
- **Eloquent JavaScript, 4th ed.** — Marijn Haverbeke (free online). The best written introduction; projects included.
- **You Don't Know JS Yet** (series, 2nd ed.) — Kyle Simpson (free on GitHub). Scope/closures and this/prototypes volumes are the deepest treatments in print.
- **JavaScript: The Definitive Guide, 7th ed.** — David Flanagan. The comprehensive reference book; covers Node too.
- **Effective TypeScript, 2nd ed.** — Dan Vanderkam. Read when you take the next platform skill; item-based like Effective Python.
- **Node.js Design Patterns, 3rd ed.** — Casciaro & Mammino. The production Node book: streams, patterns, scalability.
- **JavaScript: The Good Parts** — Douglas Crockford. Historically important (2008); read for perspective, not current guidance — the language outgrew its constraints.
- **Programming TypeScript** — Boris Cherny. Alternative deep TS intro for after this page.
`,

  blogs: `
- **v8.dev/blog** — the engine team explains JIT, GC, and new features; the source for internals sections like this page's.
- **2ality (Dr. Axel Rauschmayer)** — precise, spec-grounded coverage of every new ECMAScript feature.
- **Jake Archibald** (jakearchibald.com) — the event loop, streams, and caching explained by a master explainer.
- **overreacted.io (Dan Abramov)** — mental models for JS/React internals; the closures/rendering posts are canon.
- **JavaScript Weekly** (javascriptweekly.com) — THE newsletter; one email keeps you current.
- **nodejs.org/en/blog** — release lines, security releases, LTS schedule.
- **web.dev/blog + Chrome for Developers** — performance and platform features with data.
- **Deno blog / Bun blog** — where runtime competition (and thus Node's roadmap pressure) is visible.
`,

  "research-papers": `
JavaScript's foundations trace to real research — these are the load-bearing papers:

- **"JavaScript: The First 20 Years"** — Wirfs-Brock & Eich, HOPL IV (2020). The definitive 190-page history of the language's design, by its creator and its spec editor. Essential senior context.
- **"An Efficient Implementation of SELF"** — Chambers, Ungar, Lee (OOPSLA 1989). The maps/hidden-classes and inline-caching techniques V8 uses come directly from Self research.
- **"Optimizing Dynamically-Typed Object-Oriented Languages With Polymorphic Inline Caches"** — Hölzle, Chambers, Ungar (ECOOP 1991). Why monomorphic call sites are fast — the paper behind this page's performance advice.
- **"Bringing the Web up to Speed with WebAssembly"** — Haas et al. (PLDI 2017). The formal design of WASM, JS's compute companion.
- **"JSBench: The Purpose-Built JavaScript Benchmark Suite"**-era papers (Richards et al., "An Analysis of the Dynamic Behavior of JavaScript Programs", PLDI 2010) — how real-world JS defies static assumptions; grounding for why engines speculate.

If you want one: read HOPL's "The First 20 Years" — every quirk on this page has its origin story there.
`,

  videos: `
- **Philip Roberts — "What the heck is the event loop anyway?" (JSConf EU 2014)** — the most-watched JS talk ever; the loop visualized. Watch before the Advanced section, rewatch after.
- **Jake Archibald — "In The Loop" (JSConf.Asia 2018)** — the sequel: tasks, microtasks, and rendering with animations. The two talks together = complete loop mastery.
- **Lydia Hallie — "JavaScript Visualized" series (YouTube)** — animated internals: event loop, promises, closures, prototypes; superb revision material.
- **Franziska Hinkelmann — "JavaScript engines: how do they even?" (JSConf EU 2017)** — V8 pipeline by a V8 engineer; pairs with this page's Internal Working.
- **Ryan Dahl — "Original Node.js presentation" (JSConf 2009)** and **"10 Things I Regret About Node.js" (JSConf EU 2018)** — the birth of server-side JS and its creator's honest retrospective (which launched Deno).
- **Fireship (YouTube)** — "JavaScript in 100 seconds" through deep dives; high signal-per-minute for staying current.
`,

  "github-repos": `
- [getify/You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS) — the book series; the scope & closures volume alone is worth the star.
- [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) — every data structure/algorithm implemented and explained in JS; interview prep gold.
- [leonardomso/33-js-concepts](https://github.com/leonardomso/33-js-concepts) — curated resources for the 33 concepts every developer should know; maps well onto this page.
- [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) — 100+ production Node practices with reasoning; the community's operations bible.
- [airbnb/javascript](https://github.com/airbnb/javascript) — the most-adopted style guide; read the WHY notes, not just the rules.
- [tc39/proposals](https://github.com/tc39/proposals) — track the language's future directly.
- [denoland/deno](https://github.com/denoland/deno) and [oven-sh/bun](https://github.com/oven-sh/bun) — read issues/design docs to understand runtime tradeoffs.
- [lydiahallie/javascript-questions](https://github.com/lydiahallie/javascript-questions) — hundreds of tricky snippets with explained answers; brutal and effective self-testing.
- [sindresorhus/promise-fun](https://github.com/sindresorhus/promise-fun) — small async utilities (p-limit, p-retry) whose sources are masterclasses in promise patterns.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Array fluency*: given order records, produce revenue by customer using only map/filter/reduce (then once more with Object.groupBy). No index loops allowed.
2. *Closures*: implement once(fn), memoize(fn), and a createRateLimiter(n, windowMs) — all closure state, no globals.
3. *this + prototypes*: build a chainable calculator (calc.add(2).mul(3).value) two ways: class-based and Object.create-based; explain the this flow in each.
4. *Event loop*: predict output of 10 snippets mixing setTimeout/promises/queueMicrotask from [lydiahallie/javascript-questions], THEN verify and explain every miss.
5. *Async patterns*: implement withTimeout(promise, ms), retry(fn, attempts, backoff), and a concurrency limiter mapLimit(items, n, fn) — the three utilities every production codebase re-invents.
6. *Streams*: parse an SSE byte stream (data: lines, double-newline delimiters) from a ReadableStream into an async generator of events — the exact code of AI streaming UIs.
7. *Generators*: an infinite ID generator; a take(n, iterable) helper; zip(a, b) — lazy versions of each.
8. *Defensive coding*: harden a deepMerge against prototype pollution and write the test that proves the attack fails.

External sets: **Exercism JavaScript track** (mentored), **LeetCode** (do easy/medium array+hash problems in idiomatic JS), **JavaScript30** (wesbos — 30 DOM projects, zero frameworks), **Advent of Code** (stdlib fluency under time pressure).
`,

  "architecture-diagram": `
The reference architecture for a production JavaScript AI application — the shape this platform's skills compose into:

~~~mermaid
flowchart TB
    U["Browsers / mobile webviews"] --> CDN["CDN edge\nstatic JS/CSS (hashed, immutable)"]
    U -->|HTMX/API/SSE| EDGE["Edge functions (V8 isolates)\nauth, routing, personalization"]
    EDGE --> BFF["Node.js BFF\n(Express/NestJS · SSE proxy)"]
    BFF --> LLM["LLM APIs / model servers"]
    BFF --> PG[("PostgreSQL")]
    BFF --> RD[("Redis\ncache · rate limits · sessions")]
    BFF -->|enqueue| Q["Queue (BullMQ)"]
    Q --> W["worker_threads pool\nembeddings · exports · CPU work"]
    subgraph Obs["Observability"]
        S["Sentry (errors + source maps)"]
        P["Prometheus: RED + loop delay"]
        G["Grafana"]
        WV["Web Vitals RUM"]
    end
    U -.vitals.-> WV
    BFF -.metrics/traces.-> P --> G
    U & BFF -.errors.-> S
~~~

Every box maps to a platform skill: **CDN**, **Express/NestJS**, **SSE**, **Redis**, **PostgreSQL**, **Message Queues**, **Prometheus**, **Grafana** — this diagram is the JavaScript view of the same system the **Python** skill draws from the model side.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((JavaScript))
    Language
      Types & coercion
      Functions & closures
      Objects & prototypes
      Classes & privates
      Destructuring · spread
      Modules ESM
    Async
      Event loop
      Micro vs macrotasks
      Promises
      async/await
      AbortController
      Streams & generators
    Internals
      V8 pipeline · JIT
      Hidden classes · ICs
      GC & memory leaks
      Host APIs vs language
    Production
      npm · lockfiles
      ESLint · Prettier · Vitest
      Bundling · code-splitting
      Docker · SIGTERM
      Security: XSS · supply chain
      Monitoring: RED · loop delay
    Ecosystem
      TypeScript
      Node · Deno · Bun
      Express · NestJS
      WASM
      Edge runtimes
    Career
      Event-loop interviews
      Debounce · Promise.all
      Streaming AI UIs
      Next: TypeScript
~~~
`,
};

export default javascript;
