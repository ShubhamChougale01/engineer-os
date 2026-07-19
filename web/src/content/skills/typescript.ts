import type { SkillContent } from "../types";

/**
 * TypeScript — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const typescript: SkillContent = {
  overview: `
TypeScript is a strict, structurally typed superset of JavaScript developed and maintained by Microsoft. Every valid JavaScript program is (almost) valid TypeScript — the language adds a static type system, compiled away entirely at build time, that catches an enormous class of bugs before code ever runs. TypeScript does not introduce a new runtime: it compiles ("transpiles") to plain JavaScript and then gets out of the way completely.

For an AI engineer, TypeScript is the backbone of the application layer around models: agent frameworks (Mastra, Vercel AI SDK), full-stack web apps serving LLM features (Next.js, tRPC), browser-side inference (transformers.js, WebGPU), and the SDKs for every major provider (OpenAI, Anthropic) ship first-class TypeScript types. If Python is the language of training and orchestration, TypeScript is increasingly the language of the product surface users actually touch — chat UIs, streaming responses, tool-calling backends, and the glue between a model and a real application.

Key characteristics: structural (not nominal) type system, gradual typing (opt in file by file, and even line by line with any), a type system that is itself Turing-complete (conditional types, recursive types, template literal types), zero runtime cost (types are erased entirely on compile), and near-total JavaScript compatibility — you can rename a .js file to .ts and, modulo strictness settings, it usually still compiles.
`,

  history: `
TypeScript was created by **Anders Hejlsberg** (also the lead architect of C#, Delphi, and Turbo Pascal) at Microsoft, first announced publicly in October 2012. The motivation was structural: JavaScript was becoming the language of huge, multi-year applications (Microsoft's own Office Web Apps, Bing, and Azure portal among them) with no static type checking to catch mistakes at that scale.

| Year | Milestone |
|------|-----------|
| 2012 | TypeScript 0.8 publicly announced by Anders Hejlsberg; met with initial skepticism from the JS community |
| 2014 | TypeScript 1.0 released; Angular 2 (announced same year) commits to TypeScript, a major adoption catalyst |
| 2015 | Compiler rewritten from Managed JS to itself — the "TypeScript compiles itself" milestone; ES2015 (classes, modules) alignment begins |
| 2016 | TypeScript 2.0 — non-nullable types, control flow analysis, the strictNullChecks flag |
| 2018 | TypeScript 3.0 — project references, tuple types in rest/spread |
| 2019 | TypeScript 3.7 — optional chaining (?.) and nullish coalescing (??) land in the language itself |
| 2020 | TypeScript 4.1 — template literal types, a watershed feature enabling type-level string manipulation |
| 2021 | Deno and other runtimes begin executing TypeScript directly (via internal transpilation) |
| 2023 | TypeScript 5.0 — decorators standardized to match the TC39 proposal (not the old experimental ones); "isolatedModules" and per-file compilation improvements |
| 2024 | Node.js ships experimental native "type stripping" (--experimental-strip-types), running .ts files with zero build step |
| 2024–2025 | The compiler itself begins a native Go port (announced by the TypeScript team) targeting 10x faster type-checking, previewed as "tsgo" |
| 2025+ | TypeScript 5.x continues tightening inference (const type parameters, using declarations for resource management) |

The single biggest adoption driver was Angular 2's TypeScript-first design in 2016, followed by React/Redux ecosystems adding first-class TS support, and finally VS Code (also Microsoft, also built on TypeScript's language service) making the developer experience — autocomplete, inline errors, safe refactors — good enough that teams adopted it for the tooling alone, independent of any framework.
`,

  "why-it-exists": `
TypeScript exists because JavaScript, as a dynamically typed language with no compile-time checks, becomes expensive to maintain past a certain codebase size. The problem was never "can you build something in JavaScript" — you obviously can — it was "can 50 engineers change a 500,000-line JavaScript codebase for three years without breaking things they can't see."

Concretely, before TypeScript, large JS codebases suffered from:

1. **Silent typos become runtime crashes**: user.naem instead of user.name fails at 2am in production, not at your desk while typing.
2. **Refactoring was terrifying**: renaming a field meant grep-and-pray; nothing told you every call site that broke.
3. **APIs were undocumented by the code itself**: what shape does this function expect? You read the implementation, or the (often stale) docs.
4. **IDE tooling was shallow**: autocomplete could only guess; "go to definition" and "find all usages" were unreliable across dynamic property access.

Anders Hejlsberg's insight, informed by decades building statically typed languages, was that you don't have to choose between "flexible dynamic language" and "safe statically typed language" — you can add a type system as an optional, erasable layer on top of an existing dynamic language, verified only at compile time and completely absent at runtime. This is the same idea behind Python's type hints (later, and less strict) and Facebook's Flow (contemporaneous, less successful) — but TypeScript executed it with the best tooling and the deepest structural type system, which is why it, not Flow, won.
`,

  "problem-it-solves": `
TypeScript solves the **change-safety-at-scale problem**: as codebases and teams grow, the cost of a change is dominated by the risk of breaking something you can't see, not by the cost of typing it.

Concretely, TypeScript removes or shrinks:

- **A whole category of runtime crashes**: "cannot read property 'x' of undefined" and its relatives — the single most common class of JavaScript production error — are frequently caught before the code ever runs.
- **API ambiguity**: a function's type signature IS its contract. function totalPrice(items: CartItem[]): number tells you everything, instantly, without reading the body.
- **Refactor fear**: rename a field, and the compiler lists every single call site that breaks — instantly, exhaustively, before you deploy.
- **Onboarding cost**: a new engineer can navigate an unfamiliar codebase by following types, not by archaeology through implementations.
- **Editor tooling gaps**: real autocomplete, real "go to definition," real inline documentation — because the editor (via the Language Service) has a genuine model of your program.

What TypeScript deliberately does **not** solve: runtime behavior. Types are erased at compile time — they cannot validate data arriving from outside your program (an HTTP body, a database row, a CLI argument). A JSON payload can lie about its shape and TypeScript will trust it at the type boundary; runtime validation (Zod, io-ts, Valibot) is a distinct, complementary discipline covered in Advanced Concepts and Security. TypeScript also does not make JavaScript faster — it's compiled away, so runtime performance is identical to hand-written JS.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Write idiomatic TypeScript: interfaces vs types, generics, discriminated unions, utility types, and narrowing.
2. Explain structural typing precisely, and why it differs fundamentally from nominal typing (Java, C#).
3. Configure tsconfig.json correctly for a real project (strictness flags, module resolution, target).
4. Use advanced type-level features — conditional types, mapped types, template literal types — to model real domain constraints.
5. Understand how the compiler actually works: parse → type-check → emit, and what "type erasure" really means at the bytecode level.
6. Validate data at runtime boundaries with a schema library and connect that validated shape back to static types.
7. Structure a production TypeScript project (monorepo or single package), configure a build pipeline (esbuild/swc/tsc), and ship it.
8. Debug and test TypeScript effectively, and answer senior-level interview questions on variance, structural typing, and the type system's Turing-completeness.
`,

  prerequisites: `
- **Required**: solid JavaScript fundamentals — this page assumes you already know JS variables, functions, closures, promises, and ES modules. TypeScript is JavaScript plus types; it is not a separate language to learn from zero.
- **Helpful**: the **JavaScript** skill on this platform, read first if JS itself is shaky.
- **For internals sections**: general familiarity with how compilers work (parse → analyze → emit) makes the compiler internals easier, but is not required.

Dependency links: **JavaScript** → this page → **Node.js**, **NestJS**, **React**-adjacent frontend work, and **GraphQL**/**REST** API design all build directly on TypeScript fluency.
`,

  "beginner-concepts": `
### Your first types

~~~typescript
let name: string = "Ada";
let age: number = 36;
let active: boolean = true;
let nothing: null = null;
let notSet: undefined = undefined;

// Type inference: TypeScript infers types WITHOUT annotations most of the time
let inferred = "Ada";      // inferred as string — annotating here is redundant
inferred = 42;             // Error: Type 'number' is not assignable to type 'string'
~~~

Rule of thumb: let the compiler infer obvious types; annotate function boundaries (parameters, return types) explicitly — that's where types do the most work.

### Arrays, tuples, and objects

~~~typescript
const langs: string[] = ["typescript", "go", "rust"];
const point: [number, number] = [3, 4];             // tuple — fixed length AND types

interface User {
  id: number;
  name: string;
  email?: string;        // optional property
}

const u: User = { id: 1, name: "Ada" };             // email omitted — fine, it's optional
~~~

### Functions

~~~typescript
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function with an explicit return type
const multiply = (a: number, b: number): number => a * b;

// Optional and default parameters
function greet(name: string, greeting: string = "Hello"): string {
  return greeting + ", " + name + "!";
}
~~~

### Union types and literal types

~~~typescript
type Status = "pending" | "active" | "done";   // a union of string LITERALS

function setStatus(status: Status): void {
  // status can ONLY be one of the three exact strings — typos are compile errors
}

let id: string | number;    // id can be a string OR a number
id = "abc";                 // fine
id = 42;                    // fine
id = true;                  // Error
~~~

### Type narrowing

~~~typescript
function printLength(value: string | string[]): void {
  if (typeof value === "string") {
    console.log(value.length);       // TS knows value is string here
  } else {
    console.log(value.length);       // TS knows value is string[] here
  }
}
~~~

TypeScript's control-flow analysis tracks the type of a variable through if statements, typeof, instanceof, and equality checks — this is called **narrowing**, and it's the single most important beginner superpower to internalize.

### The any escape hatch

~~~typescript
let danger: any = fetchSomething();  // any DISABLES all type checking for this value
danger.whatever.you.want();          // no error, even though it's almost certainly wrong

// unknown is the safe alternative — forces you to check before use
let safer: unknown = fetchSomething();
if (typeof safer === "string") {
  console.log(safer.toUpperCase());  // fine, narrowed
}
~~~

Common beginner trap: reaching for any whenever a type is annoying to write. This silently disables type checking for that value and everything it touches — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### Interfaces vs type aliases

~~~typescript
interface Point {           // interfaces: extendable, mergeable, the OOP-friendly choice
  x: number;
  y: number;
}
interface Point3D extends Point {
  z: number;
}

type Point2 = { x: number; y: number };   // type aliases: can express unions, tuples, mapped types
type ID = string | number;                 // a union — interfaces cannot do this directly
~~~

Rule of thumb used by most style guides: prefer interface for object shapes that might be extended (public APIs, class contracts); prefer type for unions, tuples, and anything computed from other types.

### Generics

~~~typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}

first([1, 2, 3]);          // T inferred as number
first(["a", "b"]);         // T inferred as string

interface Box<T> {
  value: T;
}
const numberBox: Box<number> = { value: 42 };

// Constrained generics — T must have a "length" property
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}
~~~

Generics are how you write a function or type ONCE that works safely across many concrete types — the type-level equivalent of not repeating yourself.

### Discriminated unions

~~~typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;     // TS knows shape has .radius here
    case "rectangle":
      return shape.width * shape.height;      // and .width/.height here
  }
}
~~~

This is the single most powerful everyday pattern in TypeScript: a shared literal "tag" field (kind) lets the compiler narrow the exact variant inside each branch, with zero casts.

### Utility types

~~~typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;             // every field optional
type UserPreview = Pick<User, "id" | "name">; // just id and name
type UserWithoutEmail = Omit<User, "email">;  // everything except email
type ReadonlyUser = Readonly<User>;           // every field readonly
type UserRecord = Record<string, User>;       // a dictionary of Users
~~~

These built-in "utility types" transform an existing type instead of hand-writing a new one — they're the type-level equivalent of map/filter over an object's shape.

### Async/await and Promise typing

~~~typescript
async function fetchUser(id: number): Promise<User> {
  const response = await fetch("/api/users/" + id);
  const data: User = await response.json();   // NOTE: json() returns any — you're asserting the shape
  return data;
}
~~~

TypeScript cannot verify that the JSON actually matches User — this is the type-erasure boundary problem, solved properly with runtime validation in Advanced Concepts.

### Modules

~~~typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}
export default class Calculator { /* ... */ }

// main.ts
import Calculator, { add } from "./math";
~~~
`,

  "advanced-concepts": `
### Conditional types

~~~typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hi">;      // true
type B = IsString<42>;        // false

// The infer keyword extracts a type from within another type
type ElementType<T> = T extends (infer U)[] ? U : never;
type X = ElementType<string[]>;   // string
~~~

Conditional types make the type system itself a small functional programming language — types can branch on other types.

### Mapped types

~~~typescript
type Optional<T> = { [K in keyof T]?: T[K] };     // this is literally how Partial<T> is defined
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Key remapping (TS 4.1+) — transform the keys, not just the values
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K)}\`]: () => T[K]
};
~~~

### Template literal types

~~~typescript
type EventName = "click" | "hover";
type Handler = \`on\${Capitalize<EventName>}\`;   // "onClick" | "onHover"

type RouteParam<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | RouteParam<Rest>
    : T extends \`\${string}:\${infer Param}\`
      ? Param
      : never;

type Params = RouteParam<"users/:userId/posts/:postId">;   // "userId" | "postId"
~~~

This is how libraries like tRPC and Hono derive fully-typed route parameters from a URL string literal — the type checker parses the string at compile time.

### Variance: covariance and contravariance

TypeScript's structural type system makes function PARAMETERS bivariant by default in method position (a pragmatic, historically debated compromise) but return types are covariant. In practice: a function that returns a MORE specific type is assignable to a function expecting a LESS specific return type; for parameters, a function accepting a WIDER type is safely assignable where a NARROWER-parameter function is expected (contravariance) — TypeScript enforces this correctly for standalone function types under strictFunctionTypes.

~~~typescript
type AnimalHandler = (a: { name: string }) => void;
type DogHandler = (d: { name: string; breed: string }) => void;

let handler: AnimalHandler;
let dogHandler: DogHandler = handler;   // OK — a function that handles ANY animal can handle a dog
~~~

### Declaration merging and module augmentation

~~~typescript
// Extend an existing interface — e.g. adding a custom field to Express's Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;   // now every Express Request has this optional field, project-wide
    }
  }
}
~~~

### The compiler's control flow analysis internals

TypeScript's narrowing is powered by a **control flow graph** built during checking — every branch (if, switch, &&, early return) creates a node, and the type of a variable is computed as the union of its possible types at that graph node. This is why "assigned in a callback, narrowed outside it" often fails: closures break the linear flow the analyzer can track.

### Type-only imports and isolated modules

~~~typescript
import type { User } from "./types";   // guarantees this import is ERASED entirely at compile time
export type { User };                  // re-export only the type, not a value
~~~

isolatedModules (required by fast transpilers like esbuild/swc that process one file at a time, with no cross-file type information) forces every file to be independently transpilable — this is why type-only imports must be explicit under that flag.

### Branded / nominal-style types

TypeScript is structurally typed, so a UserId (string) and an OrderId (string) are interchangeable by default — a common source of "passed the wrong ID" bugs. The community workaround simulates nominal typing:

~~~typescript
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

function getUser(id: UserId): void { /* ... */ }
declare const orderId: OrderId;
getUser(orderId);   // Error — even though both are "just strings" underneath
~~~
`,

  "internal-working": `
The TypeScript compiler (tsc) — itself written in TypeScript — turns your source into plain JavaScript in three conceptual stages:

~~~mermaid
flowchart LR
    A["source .ts"] --> B["Scanner/Lexer\n(tokens)"]
    B --> C["Parser\n(AST)"]
    C --> D["Binder\n(symbols + scopes)"]
    D --> E["Checker\n(type inference + errors)"]
    E --> F["Emitter\n(strips types → .js)"]
~~~

1. **Scan & parse**: source text becomes tokens, then an Abstract Syntax Tree — structurally almost identical to what a plain JavaScript parser (like Acorn or Babel) would produce, plus type-annotation nodes.
2. **Bind**: the AST is walked to build a symbol table — every declaration (variable, function, interface, type) gets a Symbol, and scopes are established. This is what powers "go to definition."
3. **Check**: the type checker walks the AST again, computing (usually lazily, on demand) the type of every expression, verifying assignability, and building the control-flow graph used for narrowing. This is by far the most expensive phase — it's why large projects' "type-check time" dominates over "parse time."
4. **Emit**: types are erased. interface, type alias, and pure type annotations produce ZERO output JavaScript. Only structural things with runtime existence — classes (partially), enums (by default), and the actual logic — survive into the .js file.

~~~typescript
interface User { id: number; name: string }   // emits NOTHING

function greet(user: User): string {           // annotations erased
  return "Hi " + user.name;
}
// compiles to:
// function greet(user) { return "Hi " + user.name; }
~~~

**Type erasure is the single most important internals fact**: at runtime, there is no User type anywhere — it existed only inside the compiler's analysis. This is why you cannot do if (x instanceof SomeInterface) — interfaces have no runtime representation — and why validating untrusted input needs a genuinely runtime mechanism (Zod, manual checks), not TypeScript types.

**Incremental checking**: tsc caches per-file type information (.tsbuildinfo with --incremental) so subsequent builds only re-check files that changed and their dependents — critical for large codebases where a full check can take tens of seconds.

**The Go port**: because tsc is written in TypeScript/JavaScript running on a single-threaded V8, type-checking large monorepos became a real bottleneck. The TypeScript team's native Go port ("tsgo," previewed 2024–2025) reimplements the checker for roughly an order-of-magnitude speedup while keeping identical type-checking semantics — a rare case of a compiler being rewritten in a different language purely for throughput, with zero intended behavior change.
`,

  architecture: `
A senior engineer thinks about TypeScript at two levels: the **build architecture** (how .ts becomes runnable .js) and the **application architecture** (how a TypeScript codebase is organized).

### Build architecture

~~~mermaid
flowchart TB
    subgraph Dev["Development"]
        Src["src/*.ts"] --> TSC1["tsc --noEmit\n(type-check only, watch mode)"]
        Src --> Fast["esbuild / swc\n(fast transpile, NO type-check)"]
        Fast --> Dist1["dist/ or in-memory bundle"]
    end
    subgraph CI["CI / Build"]
        Src2["src/*.ts"] --> TSC2["tsc\n(full type-check + emit .js + .d.ts)"]
        TSC2 --> Dist2["dist/ + type declarations"]
    end
~~~

Modern teams split the two jobs tsc historically did alone: a **fast transpiler** (esbuild, swc, or the Vite/webpack loader) strips types instantly for hot-reload development, while **tsc itself runs separately** (in CI, or as a background watch task) purely for type errors. This is the architecture behind Vite, Next.js, and most modern TypeScript tooling — the person waiting for their dev server doesn't wait for the type checker.

### Application architecture (production TypeScript service)

~~~
myservice/
├── tsconfig.json            # compiler config: strictness, module resolution, paths
├── package.json
├── src/
│   ├── api/                 # transport layer: routes, request/response schemas (Zod)
│   ├── services/            # business logic — framework-agnostic
│   ├── repositories/        # data access behind interfaces
│   ├── domain/               # core types and domain models
│   └── config/               # env parsing and validation
└── tests/                    # mirrors src structure
~~~

Rules: dependencies point inward (api → services → repositories), domain types are the single source of truth that request/response schemas derive from (not duplicated by hand), and repositories are defined as interfaces so tests substitute fakes without mocking frameworks.

### Project references (monorepos)

~~~json
// tsconfig.json in a package that depends on another package in the monorepo
{ "references": [{ "path": "../shared-types" }] }
~~~

Project references let tsc build a dependency graph across packages, type-checking and emitting each one incrementally and in the correct order — the standard mechanism behind large TypeScript monorepos (Nx, Turborepo commonly layer atop this).
`,

  "data-flow": `
What happens when you run **tsc** on a project (or the equivalent in a bundler's dev server):

~~~mermaid
sequenceDiagram
    participant Dev
    participant TSC as tsc / Language Service
    participant FS as File system
    participant Emit as Emitter

    Dev->>TSC: tsc (or save a file in watch mode)
    TSC->>FS: read tsconfig.json (compilerOptions, include/exclude)
    TSC->>FS: resolve and read all .ts/.d.ts files in the program
    TSC->>TSC: parse each file → AST
    TSC->>TSC: bind symbols, build scopes
    TSC->>TSC: type-check: infer types, verify assignability, narrow via control flow
    alt errors found
        TSC-->>Dev: report diagnostics (file:line:col + message)
    else no errors (or noEmitOnError is false)
        TSC->>Emit: strip types, downlevel syntax to target
        Emit->>FS: write .js (+ .d.ts if declaration: true)
    end
~~~

For a request flowing through a running TypeScript backend (already compiled to JS), the data flow is identical to plain JavaScript — Node.js has no idea TypeScript was ever involved. The one place TypeScript re-enters the picture at runtime is a **schema validation layer** (Zod, Valibot) explicitly re-checking incoming request bodies against a runtime schema that's kept in sync with (or generates) the static types — because the compiler cannot protect a boundary it has no visibility into: the network.

The most misunderstood part for newcomers: **the .d.ts files**. When a library is compiled, its .d.ts declaration files ship alongside the .js — they contain ONLY type information (interfaces, function signatures) with the implementation stripped. This is how you get autocomplete and type-checking for a library that itself runs as plain JavaScript at runtime — the types and the executable code are two entirely separate files, produced from the same source.
`,

  "production-usage": `
### tsconfig.json — the file every senior review starts with

~~~json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
~~~

Non-negotiables for production:

1. **"strict": true** — bundles strictNullChecks, noImplicitAny, strictFunctionTypes, and more. Turning it on for a new project costs nothing; retrofitting it onto a large loose codebase is a real, planned migration.
2. **noUncheckedIndexedAccess** — array/object index access (arr[i]) returns T | undefined instead of a bare T; catches an entire class of off-by-one and missing-key bugs strict alone misses.
3. **skipLibCheck: true** — skip type-checking of .d.ts files from node_modules; keeps build times sane without sacrificing checking of YOUR code.
4. **isolatedModules: true** — required whenever a fast transpiler (esbuild/swc) processes files independently of tsc's full-program view.

### The two-tool build pattern

~~~bash
# Development: instant transpile, no type-check blocking the loop
esbuild src/index.ts --bundle --outfile=dist/index.js --platform=node

# Separately, continuously: the actual safety net
tsc --noEmit --watch

# CI: the authoritative gate
tsc --noEmit && vitest run
~~~

### Package structure and publishing

For a library, package.json's "types" (or "exports" map with a "types" condition) field points consumers at your .d.ts files — get this wrong and consumers of your library silently lose type information even though your source was perfectly typed.

### Runtime validation at the boundary

~~~typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;    // static type DERIVED from the runtime schema

function handleRequest(body: unknown): User {
  return UserSchema.parse(body);            // throws if the shape is wrong, AT RUNTIME
}
~~~

This pattern — one schema, both the compile-time type and the runtime check — is the standard production answer to "TypeScript types don't exist at runtime."
`,

  "industry-examples": `
- **Microsoft**: creator and primary maintainer; VS Code itself (one of the largest Electron/TypeScript apps in existence) and Azure's web tooling are TypeScript-first.
- **Slack**: migrated its web client from Flow to TypeScript, citing better tooling, community momentum, and the compiler's structural type system as decisive factors.
- **Airbnb**: adopted TypeScript across its frontend codebase and published influential engineering posts on the migration; cites a measurable drop in a specific class of production bugs after adoption.
- **Google**: while famous for its own internal tooling, several Google web products and open-source projects (Angular itself is written in TypeScript) are TypeScript-based; Angular's TypeScript-first design was a key adoption catalyst industry-wide.
- **Vercel / Next.js**: TypeScript-first framework and tooling ecosystem (also creators of the Vercel AI SDK, heavily used for LLM-powered web apps); their own dashboard and CLI are TypeScript.
- **Anthropic / OpenAI**: both ship official TypeScript SDKs alongside Python, reflecting that the application/product layer around models is now routinely TypeScript.

Pattern to notice: the common thread across large adopters is codebase SIZE and TEAM size — TypeScript's ROI is proportional to how many people touch the code and how long it lives, which is exactly why frontend and platform teams (long-lived, many-contributor codebases) adopted it before, say, one-off scripts did.
`,

  "best-practices": `
1. **Turn on "strict": true from day one.** Retrofitting strictness onto a loose codebase is exponentially more expensive than starting strict.
2. **Prefer unknown over any at boundaries**; narrow explicitly before use. any is a silent hole in the type system that propagates.
3. **Model states as discriminated unions**, not booleans plus optional fields. { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T } prevents impossible states like "error with no message."
4. **Validate all external input at runtime** (Zod/Valibot) and derive static types from the schema — never trust fetch().json() type assertions blindly.
5. **Avoid type assertions (as) except at true boundaries** (e.g., after your own runtime validation) — each as is a promise to the compiler you might be breaking.
6. **Let inference work**; annotate function signatures explicitly, but don't over-annotate obvious local variables.
7. **Use readonly and const assertions** for data that shouldn't mutate — readonly T[], as const on literal objects/arrays.
8. **Keep types close to where they're used**; hoist to a shared types file only once genuinely shared across modules.
9. **Enable noUncheckedIndexedAccess** — it catches a real, common bug class that strict alone misses.
10. **Separate the fast transpiler from the type checker** in your build pipeline — don't make hot reload wait on a full program type-check.
11. **Publish accurate .d.ts files** for anything you ship as a library; verify with a tool like attw (are-the-types-wrong) before publishing.
`,

  "anti-patterns": `
### The any escape hatch, everywhere

~~~typescript
function process(data: any) {           // disables checking for EVERYTHING that touches data
  return data.whatever.you.want;         // no error, ever, even for real bugs
}

function processGood(data: unknown) {
  if (isValidShape(data)) {              // a real type guard
    return data.value;                   // narrowed, safe
  }
  throw new Error("invalid shape");
}
~~~

any is contagious — once a value is any, every expression it touches becomes any too, silently disabling checking downstream. unknown forces you to prove the shape before use.

### Other production-grade anti-patterns

- **Non-null assertions everywhere** (value!.property) — this is a promise to the compiler, not a check; a wrong assertion crashes at runtime exactly like plain JS would, defeating the entire purpose of using TypeScript.
- **Boolean soup instead of discriminated unions**: { isLoading: boolean; isError: boolean; data?: T; error?: string } permits impossible combinations (isLoading AND isError both true). Model it as a union instead.
- **Casting through as unknown as T** to force an incompatible type through — almost always signals a design problem upstream, not a legitimate need.
- **Over-generic APIs**: a function with five type parameters that nobody can read the signature of is worse than a simpler, slightly duplicated concrete version.
- **Ambient any from untyped dependencies** silently spreading through your codebase — install @types packages or write a minimal .d.ts stub rather than letting a dependency's untyped surface become an any-shaped hole.
- **Enums when a union of string literals would do**: numeric enums in particular have surprising bidirectional-mapping runtime behavior; "as const" object unions are usually simpler and fully erasable.
- **Barrel files that re-export everything** (index.ts exporting * from a dozen modules) — great for ergonomics, terrible for build performance and circular-import risk at scale.
`,

  performance: `
### Rule zero: measure before optimizing

~~~bash
tsc --extendedDiagnostics    # per-phase timing: parse, bind, check, emit
tsc --generateTrace ./trace  # produces a trace viewable in about://tracing (Chrome) — find the slow file
~~~

### The performance hierarchy for TYPE-CHECKING (not runtime) speed

1. **Enable "skipLibCheck": true** — usually the single biggest, safest win; stops re-checking every dependency's .d.ts files.
2. **Use project references** for monorepos — incremental, per-package checking instead of one giant program.
3. **Avoid deeply recursive conditional/mapped types** — they can blow up checking time (and occasionally hit the compiler's recursion limits) on large unions.
4. **"isolatedModules" + a fast transpiler for dev** — separate "does it run" (instant) from "is it correct" (runs in the background/CI).
5. **--incremental with a committed .tsbuildinfo cache** in CI — avoid re-checking unchanged files on every run.
6. **Prefer type over interface for very large unions** in hot-checking-path code; measure, since either can win depending on shape.

### Runtime performance

TypeScript imposes ZERO runtime cost by itself — types are fully erased. Runtime performance of compiled output is identical to hand-written JavaScript targeting the same "target" ECMAScript version. The performance work that matters at runtime is JavaScript performance work (see the JavaScript skill): avoid unnecessary allocations, prefer efficient data structures, understand your bundler's tree-shaking.

### Bundle size

- Type-only imports (import type) guarantee zero runtime cost and zero bundle bytes — always use them for type-only symbols so bundlers can safely elide them.
- "verbatimModuleSyntax" (5.0+) makes import/export erasure behavior explicit and consistent across tools, avoiding surprising bundle bloat from ambiguous imports.
`,

  scalability: `
TypeScript's "scalability" story is really two different stories: scaling the TEAM and CODEBASE size the language was built for, and scaling the TYPE-CHECKING compute cost as that codebase grows.

### Scaling the codebase (the original design goal)

~~~mermaid
flowchart LR
    Small["Small team,\nsmall JS codebase"] -->|works fine untyped| OK["No problem"]
    Large["Large team,\nlarge codebase, years"] -->|untyped| Bad["Refactor fear,\nsilent runtime bugs,\nslow onboarding"]
    Large -->|TypeScript| Good["Compiler catches breakage,\nsafe refactors,\ntypes as living docs"]
~~~

This is the core value proposition: TypeScript's benefit scales WITH codebase size and team size and lifespan — a 200-line script gets little from it; a 5-year, 50-engineer codebase gets enormous value.

### Scaling the type-checking itself

- **Project references** partition a monorepo into independently-checkable, incrementally-built packages — the standard technique once a single tsc program becomes too slow.
- **The native Go compiler port ("tsgo")** targets an order-of-magnitude type-checking speedup specifically because very large real-world codebases (tens of thousands of files) were hitting real developer-experience ceilings with the JS-based checker.
- **Separate "does it type-check" from "does it run"** in CI: run the fast build (esbuild/swc, no type info) to unblock tests quickly, and run the full tsc check as a separate, parallel job.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| Full program type-check too slow | Project references; skipLibCheck; the Go-based tsgo compiler |
| Deep recursive/conditional types blow up checking | Simplify the type; cap recursion depth; measure with --generateTrace |
| Monorepo circular package dependencies | Project references enforce and expose the dependency graph — fix real cycles, don't suppress them |
| Editor (Language Service) sluggish in huge files | Split very large files; the language service re-analyzes on every keystroke |
`,

  security: `
### The type-erasure trap

TypeScript's types provide **zero runtime protection**. A type annotation is a promise to the compiler about your OWN code — it says nothing about data arriving from a network request, a file, a database, or a third-party API. Treating a type annotation as a runtime guarantee is the single most dangerous TypeScript-specific misunderstanding.

~~~typescript
interface User { id: number; name: string; isAdmin: boolean }

async function getUser(): Promise<User> {
  const res = await fetch("/api/user");
  return res.json();     // TypeScript TRUSTS this is a User — it has NOT checked anything
}
~~~

If the API is compromised, buggy, or an attacker-controlled endpoint, this "User" could be anything at all, including { isAdmin: true } injected where it shouldn't be. The fix is runtime validation at every trust boundary (network, file, environment variables, message queues):

~~~typescript
import { z } from "zod";
const UserSchema = z.object({ id: z.number(), name: z.string(), isAdmin: z.boolean() });

async function getUserSafe(): Promise<z.infer<typeof UserSchema>> {
  const res = await fetch("/api/user");
  return UserSchema.parse(await res.json());   // throws on mismatch — a REAL check
}
~~~

### Non-null assertions as a security smell

value! silences the compiler without changing runtime behavior — if value is genuinely null at runtime (attacker-influenced input, a race condition), the assertion doesn't stop the crash or the bad access, it just hides the warning that would have flagged it during review.

### Injection and XSS remain JavaScript-level problems

Types do not prevent SQL injection, command injection, or XSS — those are runtime-data problems (see the **SQL Injection**, **XSS**, and **OWASP Top 10** skills). A perfectly-typed string concatenated into a SQL query is exactly as vulnerable as an untyped one; use parameterized queries and proper escaping regardless of the type system.

### Supply chain

- @types packages come from DefinitelyTyped, a large community-maintained repo — a mistyped or malicious .d.ts can't execute code (types are erased) but can hide bugs by asserting an incorrect shape; prefer packages that ship their own types.
- Audit dependencies for known CVEs the same way as any JavaScript project — TypeScript adds no additional attack surface here, but adds no protection either.

See the dedicated **SQL Injection**, **XSS**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond what's TypeScript-specific.
`,

  testing: `
**Vitest** (and Jest, its predecessor as the ecosystem default) are the standard test runners; both understand TypeScript natively via fast transpilation.

~~~typescript
// pricing.test.ts
import { describe, it, expect } from "vitest";
import { applyDiscount, PricingError } from "./pricing";

describe("applyDiscount", () => {
  it("applies a basic percentage discount", () => {
    expect(applyDiscount(100, 10)).toBe(90);
  });

  it.each([
    [100, 0, 100],
    [100, 100, 0],
    [59.99, 15, 50.99],
  ])("discounts %d by %d%% -> %d", (price, pct, expected) => {
    expect(applyDiscount(price, pct)).toBeCloseTo(expected);
  });

  it("rejects an invalid discount", () => {
    expect(() => applyDiscount(100, 150)).toThrow(PricingError);
  });
});
~~~

### Type-level testing

Because the type system is itself a computation, you can (and for library authors, should) test TYPES, not just runtime values:

~~~typescript
import { expectTypeOf } from "vitest";

expectTypeOf(applyDiscount(100, 10)).toBeNumber();
type Result = ReturnType<typeof applyDiscount>;
expectTypeOf<Result>().toEqualTypeOf<number>();
~~~

### The senior testing doctrine

- Test **behavior through public interfaces**, not internal implementation — tests should survive refactors that preserve behavior.
- Prefer **fakes over mocks**: an in-memory repository implementing your interface beats a mock with a dozen stubbed methods.
- Mock at true system boundaries only: HTTP calls, the clock, randomness — not your own modules.
- Type errors ARE a form of test — a codebase with strict: true and zero any effectively gets a huge class of "tests" for free, continuously, on every keystroke.
- Run tsc --noEmit, eslint, and the test suite together in CI; none substitutes for the others.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the compiler error from the top, not the bottom** — TypeScript error messages for generic/nested types can be long; the FIRST line usually names the real mismatch, later lines are often expanded type detail.
2. **Hover in your editor** — the Language Service shows the INFERRED type of any expression on hover; this is the fastest way to understand "why doesn't this narrow" or "what does TypeScript think this is."
3. **"// @ts-expect-error" as a debugging tool**: place it above a line to assert "this line SHOULD error" — if it stops erroring, the compiler now tells you (a build failure), which is a good way to pin down exactly when a type problem resolves during refactors.
4. **tsc --noEmit --pretty** for a clean, colorized full-program error list, independent of any bundler noise.
5. **Debugging the runtime (post-compile) behavior** is identical to JavaScript debugging: source maps (enabled via "sourceMap": true) let browser/Node debuggers step through your ORIGINAL .ts lines even though .js is what's actually running.

~~~json
// tsconfig.json — required for source-mapped debugging
{ "compilerOptions": { "sourceMap": true } }
~~~

### Debugging type-level code specifically

- Break a complex conditional/mapped type into smaller named intermediate types — each one becomes independently hoverable and debuggable.
- type Debug<T> = { [K in keyof T]: T[K] } is a common trick ("expand" a computed type into its resolved shape for hovering) that changes nothing at runtime but makes a hover tooltip readable.
- For "type instantiation is excessively deep" errors: the type is recursing too far; add an explicit depth limit or simplify.
`,

  monitoring: `
Production TypeScript visibility is JavaScript runtime visibility (see the **JavaScript**, **Logging**, **Metrics**, and **Tracing** skills for full depth) — TypeScript itself produces no runtime signal, since it's erased. What's TypeScript-specific is monitoring the DEVELOPMENT and BUILD pipeline health:

### Build-time signal

~~~bash
tsc --noEmit --pretty          # CI gate: fail the build on ANY type error
tsc --extendedDiagnostics       # track check time over time — a growing number signals codebase growth pain
~~~

Track type-check duration in CI dashboards the same way you'd track test suite duration — a steadily rising number is an early warning to invest in project references or skipLibCheck before it becomes a daily-standup complaint.

### Runtime observability of a TypeScript service

Once compiled, add structured logging, RED metrics (Rate, Errors, Duration), and distributed tracing exactly as you would for any Node.js service:

~~~typescript
import pino from "pino";
const log = pino();
log.info({ orderId, userId, amountCents }, "order_placed");
~~~

Type-safety of your logging calls themselves is a real, often-overlooked win: a typed logger (log.info({ orderId: string, ... })) catches a mistyped field name at compile time, before a dashboard silently loses a metric because of a typo in a log key.
`,

  deployment: `
### The standard: multi-stage Docker with a separate build stage

~~~dockerfile
# ---- build stage ----
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ src/
RUN npx tsc                       # type-check AND emit — fails the build on type errors

# ---- runtime stage ----
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev             # only runtime dependencies, no TypeScript itself
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
~~~

Why each choice matters: the build stage runs tsc (the authoritative, if slower, checker) so a broken build never ships; the runtime stage installs only production dependencies — TypeScript, test tooling, and dev-only packages never enter the final image, keeping it small and reducing attack surface; non-root user mitigates container-escape impact.

### Native execution without a build step

~~~bash
node --experimental-strip-types src/index.ts   # Node 22+: runs .ts directly, TYPES STRIPPED not checked
~~~

Node's built-in type stripping removes type ANNOTATIONS syntactically — it does NOT type-check. This is convenient for quick scripts and some deployment shapes, but it does not replace running tsc --noEmit somewhere in your pipeline if you want actual type-safety guarantees before shipping.

### Serving topology

- Same as any Node.js service: process manager or container orchestrator (Kubernetes, ECS), health endpoints, graceful SIGTERM handling.
- Declaration files (.d.ts) matter only if you're publishing a LIBRARY for others to import with type support — an application's compiled output doesn't need them.
- CI/CD pipeline: lint (eslint) → typecheck (tsc --noEmit) → test (vitest) → build → scan → push → deploy; see the **CI/CD** and **GitHub Actions** skills.
`,

  "production-checklist": `
Before a TypeScript service takes real traffic:

- [ ] "strict": true (plus noUncheckedIndexedAccess) in tsconfig.json
- [ ] tsc --noEmit passes with zero errors, enforced on every PR in CI
- [ ] eslint + a TypeScript-aware ruleset (typescript-eslint) green in CI
- [ ] Zero (or an explicitly tracked, shrinking) count of any in the codebase
- [ ] All external inputs (HTTP bodies, env vars, queue messages) validated at runtime with a schema library, not just typed
- [ ] Source maps enabled for production error reporting to map stack traces back to .ts
- [ ] Declaration files (.d.ts) generated and verified if this is a published library
- [ ] Build pipeline separates fast dev transpilation from the authoritative CI type-check
- [ ] package.json "types"/"exports" fields correctly point at emitted declarations
- [ ] Dependency @types packages (or first-party types) present for every untyped runtime dependency
- [ ] No non-null assertions (!) on values that can genuinely be null/undefined at runtime
- [ ] Structured JSON logging with correlation IDs (same discipline as any Node.js service)
- [ ] Error tracking (Sentry or equivalent) wired with source-map upload for readable stack traces
- [ ] Load test done; know your request/sec ceiling and failure mode
- [ ] Runbook: how to roll back, scale up, and read the dashboards
`,

  "common-mistakes": `
1. **Reaching for any instead of unknown or a real type** — see Anti-Patterns; this is the single most common way a TypeScript codebase quietly stops being typed.
2. **Trusting fetch().json() as a typed value** with no runtime validation — the type is an assertion, not a check; a schema library closes this gap.
3. **Overusing non-null assertions (!)** to silence errors instead of fixing the underlying null/undefined possibility.
4. **Confusing structural typing with duck typing being "unsafe"** — structural typing IS checked, at compile time, exhaustively; it's a different (and often more flexible) discipline than nominal typing, not a looser one.
5. **Modeling state with independent booleans** (isLoading, isError, hasData) instead of a discriminated union — permits impossible combinations that then need defensive checks everywhere they're read.
6. **Forgetting "isolatedModules" implications** when using a fast transpiler — const enums, some re-export patterns, and ambient type-only re-exports can silently behave differently (or error) under esbuild/swc versus full tsc.
7. **Not enabling strict from the start**, then facing a painful multi-week migration later once the codebase and team have grown.
8. **Deeply nested generic/conditional types** that are technically correct but unreadable and slow to check — prefer simpler, slightly more verbose types a teammate can understand in ten seconds.
9. **Publishing a library with broken or missing .d.ts files** — consumers get no autocomplete or type errors even though the source was fully typed; verify with a types-checking tool before publishing.
10. **Treating enum the default choice** for a fixed set of values, when a union of string literals is usually simpler, more erasable, and avoids numeric enum's surprising reverse-mapping behavior.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| Object is possibly 'undefined' | strictNullChecks caught a real gap; value can be undefined here | Narrow with an if check, provide a default, or fix the upstream type |
| Type 'X' is not assignable to type 'Y' | The shapes genuinely differ, or a literal type is being widened unexpectedly | Read the FULL diff in the message; check for missing/extra fields |
| Property does not exist on type | Typo, or the value's inferred type is narrower than you assumed | Hover to check the actual inferred type; fix the typo or widen the type |
| Cannot find module or its type declarations | Missing @types package for an untyped dependency | npm install --save-dev @types/pkg-name, or add a minimal .d.ts stub |
| Type instantiation is excessively deep and possibly infinite | A recursive conditional/mapped type has no practical depth limit | Add an explicit recursion depth counter; simplify the type |
| This expression is not callable | Calling a value TypeScript hasn't narrowed to a function type yet | Add a type guard or an explicit type annotation |
| Argument of type 'X' is not assignable to parameter of type 'Y' | Function signature mismatch — often a generic inferred incorrectly | Check inferred generic arguments explicitly: fn<ExplicitType>(arg) |
| Duplicate identifier | Two declarations (often across .ts and .d.ts) collide | Check for accidental duplicate ambient declarations or conflicting @types packages |
| Cannot use JSX unless the '--jsx' flag is provided | tsconfig missing the jsx compiler option for a .tsx file | Set "jsx": "react-jsx" (or the appropriate mode) in tsconfig.json |
| ERR_UNKNOWN_FILE_EXTENSION at runtime | Trying to run .ts directly in Node without a loader/build step | Compile first (tsc), use tsx/ts-node, or Node's --experimental-strip-types |

The habit that matters: read the full compiler message (not just the first line for deeply generic errors), hover the actual inferred type in your editor, and fix the type gap the compiler found rather than silencing it with an assertion.
`,

  faqs: `
**Q: Do I need to learn JavaScript first?**
Yes. TypeScript is JavaScript plus a type system — every runtime concept (closures, promises, prototypes, the event loop) is JavaScript, unchanged. This page assumes that foundation; see the **JavaScript** skill first if it's shaky.

**Q: Does TypeScript make my code faster?**
No. Types are fully erased at compile time; the emitted JavaScript runs exactly as fast as equivalent hand-written JS. TypeScript's value is catching bugs and improving maintainability, not runtime performance.

**Q: interface or type — which should I default to?**
Prefer interface for object shapes you expect to extend or that represent a public contract; prefer type for unions, tuples, and anything computed from other types. Both are checked equally strictly — this is a style, not a safety, choice.

**Q: Is any ever acceptable?**
Rarely, and always as a deliberate, narrow, ideally-commented escape hatch — not a default. unknown plus explicit narrowing is almost always the better choice when the exact shape genuinely isn't known yet.

**Q: Do TypeScript types protect me from bad API responses?**
No — this is the single most important thing to internalize. Types are compile-time-only; they say nothing about data crossing a runtime boundary (network, file, database). Validate with a schema library (Zod, Valibot) at every trust boundary.

**Q: tsc, esbuild, swc, Babel — which do I need?**
In production you typically need TWO tools playing different roles: a fast transpiler (esbuild or swc, used by Vite/Next.js/most modern bundlers) for instant dev builds with NO type-checking, and tsc itself run separately (CI, or a background watch task) as the actual type-checking gate. Babel's TypeScript plugin also strips types without checking — same role as esbuild/swc in this split.

**Q: Is the new native (Go) compiler a different language?**
No — same TypeScript language and (intended) identical checking semantics; only the compiler's own implementation language changed, purely for throughput on very large codebases.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is structural typing, and how does it differ from nominal typing?* TypeScript compares SHAPES: two types with identical members are compatible regardless of name/declaration site (structural). Java/C# compare declared IDENTITY (nominal) — two identically-shaped classes are still incompatible unless one explicitly implements/extends the other.
2. *What does "any" do, and why is "unknown" usually better?* any disables type checking entirely for a value and everything it touches. unknown accepts anything but FORCES a narrowing check before any operation is allowed — same flexibility at the boundary, real safety after.
3. *Explain optional properties vs "| undefined".* user?.name (via interface { name?: string }) means the PROPERTY may be absent; name: string | undefined requires the property to exist but permits undefined as its value — subtly different under exactOptionalPropertyTypes.
4. *What is a discriminated union, and why use one?* A union of object types sharing a common literal "tag" field; switching on the tag lets TypeScript narrow to the exact variant in each branch — models mutually-exclusive states without impossible combinations.
5. *What are generics, and give a simple example.* Type parameters that let a function/type work across many concrete types while preserving the relationship between input and output types, e.g. function first<T>(arr: T[]): T | undefined.

**Senior:**

6. *Explain type erasure and its practical consequences.* All type-only constructs (interfaces, type aliases, pure annotations) produce zero runtime JavaScript. Consequences: you cannot instanceof-check an interface, types cannot validate untrusted runtime data, and a wrongly-typed but syntactically-valid value crashes at runtime exactly like plain JS.
7. *How would you validate an external API response safely?* Define a runtime schema (Zod/Valibot), parse the response through it (throwing/erroring on mismatch), and derive the static type FROM that schema (z.infer) so the compile-time type and the runtime check can never drift apart.
8. *Walk through what happens when tsc compiles a file.* Scan/lex → parse to AST → bind symbols/scopes → type-check (infer + verify assignability + build the control-flow graph for narrowing) → emit, stripping all type-only constructs, down-leveling syntax to the configured target.
9. *Design choice: modeling a network request's lifecycle in a UI.* A discriminated union — {status:"idle"} | {status:"loading"} | {status:"error", message: string} | {status:"success", data: T} — over independent booleans; discuss why this eliminates impossible-state bugs and simplifies exhaustive switch handling.
10. *What is variance, and how does it show up in TypeScript function types?* Whether a subtype relationship between component types implies one between derived compound types (functions, arrays). TypeScript's standalone function types are contravariant in parameters and covariant in return type under strictFunctionTypes; give the animal/dog handler example.
11. *How do conditional and mapped types let a type system do "computation"?* T extends U ? X : Y branches on a type-level condition; { [K in keyof T]: ... } transforms a type's members; combined with infer and template literal types, this makes TypeScript's type system Turing-complete — capable of expressing arbitrary compile-time computation over types.
12. *You inherit a codebase with pervasive "any" — how do you migrate it to strict safely?* Turn on strict incrementally (per-directory via separate tsconfig "extends" chains, or the noImplicitAny/strictNullChecks flags individually first), fix errors file by file starting from leaf modules with no internal dependents, add CI enforcement that the any COUNT can only shrink, never grow, during the migration window.
`,

  "coding-questions": `
### 1. Type-safe event emitter (tests generics + mapped types)

~~~typescript
type EventMap = Record<string, unknown[]>;

class TypedEmitter<Events extends EventMap> {
  private listeners: { [K in keyof Events]?: Array<(...args: Events[K]) => void> } = {};

  on<K extends keyof Events>(event: K, handler: (...args: Events[K]) => void): void {
    (this.listeners[event] ??= []).push(handler);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners[event]?.forEach((handler) => handler(...args));
  }
}

interface AppEvents {
  login: [userId: string];
  logout: [];
}

const bus = new TypedEmitter<AppEvents>();
bus.on("login", (userId) => console.log(userId));   // userId inferred as string
bus.emit("login", "u_123");                          // wrong arg count/type -> compile error
~~~

Discuss: how the mapped type ties each event's handler signature to its declared tuple of argument types — a fully type-safe pub/sub with zero runtime overhead beyond a plain object and arrays.

### 2. Deep readonly (tests recursive conditional/mapped types)

~~~typescript
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

interface Config {
  server: { host: string; ports: number[] };
}

const config: DeepReadonly<Config> = { server: { host: "localhost", ports: [80, 443] } };
config.server.host = "x";        // Error — even nested properties are readonly
config.server.ports.push(8080);  // Error — nested array is ReadonlyArray
~~~

Complexity discussion: recursion depth on deeply nested or cyclic types; follow-up asks how to guard against "excessively deep" instantiation errors on pathological inputs.

### 3. Exhaustiveness checking (tests discriminated unions)

~~~typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function assertNever(x: never): never {
  throw new Error("Unhandled case: " + JSON.stringify(x));
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
    default: return assertNever(shape);   // compile error if a Shape variant is EVER added and unhandled
  }
}
~~~

The trick: assertNever(shape) only compiles if every variant was already handled (shape is narrowed to never in the default branch) — adding a new Shape variant later breaks the build here until it's handled, turning a runtime oversight into a compile-time one.
`,

  "hands-on-labs": `
### Lab 1 — Typed CLI todo app (beginner, ~1h)
Build a todo CLI storing tasks in JSON: add/list/done/delete commands. Model a Task interface, use a discriminated union for command parsing, strict tsconfig from the start. Stretch: validate the JSON file's shape on load with Zod. Skills: interfaces, unions, file I/O, strict mode.

### Lab 2 — Type-safe API client (intermediate, ~2h)
Wrap fetch in a small client where each endpoint's request/response shape is defined once (interface or Zod schema) and the client function's return type is fully inferred from it — calling client.get("/users/:id", {id: 5}) should type-check the params AND the return shape. Skills: generics, template literal types, runtime validation.

### Lab 3 — Mini type-checker for a tiny expression language (advanced, ~4h)
Parse a tiny arithmetic expression language (numbers, +, -, *, variables) into an AST, then write a type-checker over the AST using TypeScript's own discriminated-union-and-exhaustiveness patterns. You'll deeply internalize how TypeScript's OWN checker walks an AST. Skills: discriminated unions, exhaustiveness checking, recursive types.

### Lab 4 — Instrument, build, and deploy (production, ~3h)
Take Lab 2's API client, wrap it in a small Express/Fastify service with Zod-validated routes, add pino structured logging, a strict tsconfig with noUncheckedIndexedAccess, a two-stage Docker build (tsc in the build stage, only dist/ + prod deps in the runtime stage), and a CI pipeline: eslint → tsc --noEmit → vitest → build. Skills: the entire production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Type-safe RPC layer from scratch** — Build a minimal tRPC-like system: a server defines procedures with Zod input/output schemas, and a client gets FULL end-to-end type inference (no code generation step) for every procedure by importing the server's router TYPE only (never its implementation). Demonstrates: advanced generics, template literal types, the type-only import boundary, and a genuinely senior-level grasp of structural typing.

2. **Streaming LLM chat backend** — A Fastify/Express + TypeScript service that proxies chat completions to an LLM API, streams tokens back over SSE, validates every incoming request with Zod, tracks per-request cost/latency metrics, and models the conversation state as a discriminated union (idle/streaming/error/done). Demonstrates: async streams, runtime validation discipline, and the product-layer patterns AI engineering roles specifically screen for.

3. **A small, real type-checker** — Extend Lab 3 into a genuinely useful tool: type-check a real (small) config language or a subset of JSON Schema, with good error messages pointing at source locations. Demonstrates: you understand what TypeScript's OWN compiler does, not just how to use it — a strong signal in senior interviews.

Each project: strict tsconfig, full test suite (vitest) including type-level tests where relevant, CI via GitHub Actions, README with an architecture diagram. The engineering discipline around the code is what gets senior interviews, exactly as with any language on this platform.
`,

  "case-studies": `
### Slack: Flow to TypeScript
Slack's web client began on Facebook's Flow (a contemporaneous structural type checker) and later migrated to TypeScript, citing tooling maturity, community momentum, and editor integration as decisive — a reminder that type-system CORRECTNESS is necessary but not sufficient; ecosystem and tooling gravity often decide which system wins in practice.

### Airbnb: measuring the actual bug reduction
Airbnb's frontend engineering team published data-backed analysis after adopting TypeScript, attributing a meaningful percentage of a specific historical bug category (undefined-is-not-a-function-style errors) as preventable by TypeScript's type system, giving one of the earliest concrete, numbers-based justifications for adoption rather than anecdote alone.

### Angular's TypeScript-first bet (2016)
Angular 2's rewrite committed to TypeScript as the primary authoring language — a bet by a major framework, at a moment when TypeScript itself was still relatively young, that decorators and static types were the right foundation for large enterprise frontend apps. This single decision is widely credited as the tipping point that took TypeScript from "an interesting Microsoft project" to "an ecosystem-wide default."

### The native (Go) compiler port
The TypeScript team's own decision to reimplement the checker in Go rather than continue optimizing the JavaScript implementation is a case study in recognizing a hard architectural ceiling: a single-threaded, JIT-warmed JavaScript program has fundamental throughput limits that a natively-compiled, more parallelizable implementation can bypass — while preserving the SAME language semantics for every user. Lesson: sometimes the fix for "our own tool is too slow" is changing what the tool is written in, not just tuning it.
`,

  comparisons: `
| Dimension | TypeScript | Flow | JSDoc + Python-style hints | Plain JavaScript |
|-----------|-----------|------|---------------------------|-------------------|
| Type system power | Very high (Turing-complete, structural) | Moderate, structural | Limited by comment syntax | None |
| Tooling / editor support | Best-in-class (VS Code, most editors) | Declining, narrower support | Good, piggybacks on TS's checker | Basic |
| Build step required | Yes (or type-stripping at minimum) | Yes | No — comments, zero build | No |
| Ecosystem adoption | Dominant for new JS/Node/web projects | Niche, shrinking | Used for gradual typing of existing JS | Universal baseline |
| Learning curve | Moderate — JS plus a real type system | Similar to TS, smaller community to learn from | Low if JS is known | None (baseline) |
| Runtime cost | Zero — fully erased | Zero — fully erased | Zero — it's comments | N/A |
| Best at | Large, long-lived, multi-engineer codebases | Legacy Flow codebases (mostly Facebook-internal) | Adding light typing to an existing JS codebase without a build step | Prototypes, tiny scripts |

**How seniors choose**: TypeScript for essentially any new JavaScript/Node project expected to live more than a few months or grow past one contributor — the ecosystem consensus is now strong enough that "should we use TypeScript" is rarely debated; the real decisions are strictness level and migration pace for existing JS. JSDoc-based typing is a legitimate middle ground for gradually typing an existing large JS codebase without committing to a build step. Flow is essentially legacy at this point outside of Facebook-internal code.
`,

  "related-technologies": `
- **JavaScript** — the language TypeScript compiles to and is a superset of; required prerequisite, not optional.
- **Zod / Valibot** — runtime schema validation libraries that close TypeScript's type-erasure gap at trust boundaries; the standard companion to any serious TypeScript API.
- **Node.js** — the dominant server runtime TypeScript targets for backend work; see that skill for the runtime model TypeScript's async code executes within.
- **React** (and Next.js) — the dominant frontend framework pairing, with first-class .tsx support for typed component props.
- **NestJS** — a TypeScript-first, decorator-heavy backend framework explicitly modeled on Angular's architecture, popular for structured Node.js APIs.
- **GraphQL** — code-generation tools (GraphQL Code Generator) derive TypeScript types directly from a GraphQL schema, another instance of the "one source of truth, derived static types" pattern.
- **tRPC** — end-to-end type-safe RPC without code generation, built entirely on TypeScript's structural type system and type-only imports — the canonical "advanced TypeScript in production" example.
- **ESLint + typescript-eslint** — the linting layer that catches style and correctness issues the type checker itself doesn't (unused variables, inconsistent patterns).
- **esbuild / swc / Vite** — the fast-transpiler layer that makes modern TypeScript dev loops fast by deliberately skipping type-checking during development.
- **Vercel AI SDK / Mastra** — TypeScript-first agent and LLM-application frameworks — the direct AI-engineering on-ramp from this page.

On this platform, the natural next pages: **Node.js** → **NestJS** or **REST/GraphQL** → **Docker** → **Multi-Agent Systems** (via a TypeScript agent framework).
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2026 — check the TypeScript release notes on the official blog for anything newer.

- **TypeScript 5.x line**: continued tightening of inference — const type parameters (preserving literal types through generic calls without extra annotation), using/await using declarations for deterministic resource cleanup (aligned with the TC39 Explicit Resource Management proposal), and ongoing decorator refinements now that the standard (non-experimental) decorator proposal has stabilized.
- **The native Go compiler port ("tsgo")**: previewed by the TypeScript team as a from-scratch reimplementation of the checker targeting roughly an order-of-magnitude faster type-checking on large codebases, with an explicit goal of IDENTICAL checking semantics to the existing JS-based compiler — this is the single largest infrastructure change to the TypeScript toolchain since its creation, and worth tracking closely if you work in a large monorepo.
- **Node.js native type stripping** (--experimental-strip-types, stabilizing across recent Node releases): running .ts files directly without a separate build step for simple cases, syntactic stripping only — not a replacement for tsc's actual type-checking.
- **Ecosystem shifts that matter more than individual language features**: Zod and similar schema libraries have become the de facto standard for runtime-boundary validation; Vite/esbuild/swc-based dev servers have made "type-check separately from transpile" the default architecture rather than an advanced trick; tRPC-style "no codegen, pure type inference" API layers have gone from novel to mainstream in TypeScript-heavy full-stack teams.
- **Support and versioning**: TypeScript ships frequent minor releases (roughly every few months); there's no long-term-support branching model like some languages — teams generally track recent stable releases rather than pinning far behind.
`,

  "future-roadmap": `
Where TypeScript is heading over the next few releases:

1. **The Go-based compiler goes mainstream.** As "tsgo" matures past preview, expect it to become the default tsc implementation for most tooling, with the dramatic type-checking speedup unlocking type-checking workflows (full-program checks on every save, even in huge monorepos) that are currently too slow to run interactively.
2. **Type-only, build-step-free TypeScript keeps growing.** Node's native type stripping and similar runtime-level support (Deno and Bun already run .ts natively) push toward a world where "just run the .ts file" works for an increasing share of real use cases, while tsc's actual type-CHECKING remains a separate, still-necessary step for genuine safety guarantees.
3. **The type system keeps absorbing TC39 proposals early.** TypeScript has historically implemented forthcoming JavaScript features (optional chaining, decorators, explicit resource management) ahead of or alongside their stage advancement — expect this pattern to continue, with TypeScript often the fastest path to using a new JS feature in production, type-checked, before every runtime ships it.
4. **Schema-first, single-source-of-truth patterns deepen.** The Zod-style "one schema, derive both the runtime check and the static type" pattern is likely to keep spreading into more of the ecosystem (API contracts, config, even build tooling), reducing the surface area where types and runtime behavior can silently drift apart.
5. **AI-assisted development leans further on types.** As LLM coding assistants generate more code, a strict, expressive type system gives BOTH the model and the compiler a much stronger signal to catch generated-code mistakes immediately — a case can be made that typed languages benefit disproportionately from AI-assisted coding precisely because errors surface at compile time instead of silently in production.

For your career: bet on schema-driven type safety (Zod plus inference), a genuinely deep understanding of structural typing and narrowing (not just "type annotations"), and comfort reading advanced type-level code (conditional/mapped/template-literal types) — those three separate "knows TypeScript" from "senior TypeScript engineer" over the next several years.
`,

  "cheat-sheet": `
~~~typescript
// --- Basic types ---
let s: string; let n: number; let b: boolean;
let arr: string[]; let tup: [number, string];
let u: string | number;              // union
let lit: "a" | "b" | "c";            // literal union

// --- Object types ---
interface User { id: number; name: string; email?: string }
type Point = { x: number; y: number };

// --- Functions ---
function f(a: number, b: number = 2): number { return a + b; }
const g = (a: number): number => a * 2;

// --- Generics ---
function first<T>(xs: T[]): T | undefined { return xs[0]; }
interface Box<T> { value: T }

// --- Discriminated unions ---
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };
function area(s: Shape) { switch (s.kind) { case "circle": return Math.PI * s.r ** 2; case "square": return s.side ** 2; } }

// --- Utility types ---
type P = Partial<User>; type Pk = Pick<User, "id" | "name">;
type O = Omit<User, "email">; type R = Readonly<User>;
type Rec = Record<string, User>;

// --- Narrowing ---
function len(v: string | string[]) {
  if (typeof v === "string") return v.length;
  return v.length;
}

// --- Type guards ---
function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null && "id" in x;
}

// --- unknown vs any ---
let ok: unknown;                     // must narrow before use — safe
let bad: any;                        // disables checking entirely — avoid

// --- Async ---
async function fetchUser(id: number): Promise<User> {
  const res = await fetch("/users/" + id);
  return res.json();                 // NOT verified — validate at runtime!
}

// --- Runtime validation (Zod) ---
// const Schema = z.object({ id: z.number(), name: z.string() });
// type Inferred = z.infer<typeof Schema>;
// const safe = Schema.parse(rawData);

// --- Type-only import (erased entirely) ---
import type { User as U2 } from "./types";

// --- tsconfig essentials ---
// "strict": true, "noUncheckedIndexedAccess": true, "skipLibCheck": true,
// "isolatedModules": true, "module": "NodeNext"

// --- Build ---
// tsc --noEmit          (type-check only, no output)
// esbuild src/index.ts --bundle --outfile=dist/index.js   (fast, no type-check)
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is structural typing? | Types compared by SHAPE (members), not by declared name/identity — two identically-shaped types are compatible |
| What does type erasure mean? | All type-only constructs produce zero output JavaScript — nothing about types exists at runtime |
| any vs unknown | any disables checking entirely; unknown requires narrowing before use — same flexibility, real safety |
| What is narrowing? | The compiler tracking a variable's possible type through control flow (typeof, instanceof, equality checks) |
| What is a discriminated union? | A union of object types sharing a literal "tag" field, enabling exhaustive, safe branching |
| interface vs type — when interface? | When the shape might be extended, or represents a public/OOP-style contract |
| What do utility types like Partial/Pick do? | Transform an existing type's shape instead of hand-writing a new one |
| Does TypeScript validate runtime data? | No — it is compile-time only; use a schema library (Zod) at trust boundaries |
| What are conditional types? | Type-level if/else: T extends U ? X : Y, evaluated by the compiler on types themselves |
| What is import type for? | Guarantees an import is type-only and fully erased at compile time |
| What's the compiler pipeline? | Scan/parse → bind → check (infer + narrow) → emit (strip types) |
| Why split tsc and esbuild/swc in a build? | Fast transpile for dev hot-reload; full tsc separately as the authoritative type-check gate |
| What does "strict": true enable? | A bundle of flags including strictNullChecks, noImplicitAny, strictFunctionTypes |
| What's a branded type used for? | Simulating nominal typing (e.g. UserId vs OrderId) in a structurally-typed system |
| Why is a non-null assertion (!) risky? | It silences the compiler without changing runtime behavior — a wrong assertion crashes exactly like plain JS |
`,

  mcqs: `
**1. What does this print (or error) — is it valid TypeScript with strict mode on?**

~~~typescript
interface Animal { name: string }
interface Dog { name: string; breed: string }
let a: Animal;
let d: Dog = { name: "Rex", breed: "Lab" };
a = d;
~~~

A) Compile error — Dog is not an Animal  B) Compiles fine — structural typing  C) Runtime error  D) Only compiles with "any"

**Answer: B** — Dog has every member Animal requires (structural typing), so it's assignable even though neither declares a relationship to the other.

**2. What is the runtime type of a value declared "interface User { id: number }" after compilation?**

A) An object with an id property and a hidden type tag  B) There is no runtime representation at all  C) A JavaScript class  D) A Proxy object

**Answer: B** — interfaces are fully erased; nothing about them exists after compilation.

**3. Given "let x: unknown = getValue();", which line compiles WITHOUT narrowing first?**

A) x.toUpperCase()  B) console.log(x)  C) x + 1  D) x.length

**Answer: B** — unknown permits passing the value around, but any operation ASSUMING a shape requires narrowing first; logging it needs no assumption about its shape.

**4. Which tsconfig flag catches "arr[i] used without checking it might be undefined"?**

A) strict  B) noImplicitAny  C) noUncheckedIndexedAccess  D) skipLibCheck

**Answer: C** — this specific flag adds " | undefined" to indexed access results; strict alone does not include it.

**5. In a discriminated union switch with an exhaustive assertNever(x: never) default branch, what happens if a new union variant is added and NOT handled?**

A) Nothing, it silently falls through at runtime  B) A compile error, because the unhandled variant can't narrow to never  C) A runtime warning only  D) TypeScript auto-generates the missing case

**Answer: B** — this is the exhaustiveness-checking pattern; the unhandled variant fails to narrow to never, so passing it to assertNever is a type error.

**6. What's the safest way to handle an untrusted JSON API response?**

A) Cast it with "as MyType" and move on  B) Trust "res.json(): Promise<any>" implicitly  C) Parse it through a runtime schema (e.g. Zod) and derive the static type from that schema  D) Add "// @ts-ignore" above the usage

**Answer: C** — this is the only option that actually verifies the shape at runtime; A, B, and D all just suppress the compiler without checking anything real.
`,

  "revision-notes": `
**Language core in 10 lines:** TypeScript = JavaScript + a structural, erasable type system. Structural typing compares shapes, not declared identity. Unions and literal types model exact sets of allowed values. Narrowing tracks a variable's type through control flow (typeof/instanceof/equality). Discriminated unions (shared literal tag field) are the go-to pattern for modeling mutually-exclusive states safely. Generics parameterize types/functions over a type variable, preserving relationships between inputs and outputs. Utility types (Partial/Pick/Omit/Record) transform existing shapes. any disables checking entirely and is contagious; unknown is the safe alternative, forcing a narrowing check before use. Conditional, mapped, and template literal types make the type system Turing-complete.

**Runtime in 4 lines:** All type-only constructs (interfaces, type aliases, pure annotations) are ERASED completely — zero runtime cost, zero runtime existence. This means types cannot validate data crossing a real boundary (network, file, DB) — that requires a genuine runtime check. The compiler pipeline is scan/parse → bind → check (infer + build the narrowing control-flow graph) → emit (strip types, down-level syntax).

**Production in 5 lines:** "strict": true (plus noUncheckedIndexedAccess) from day one. Validate every external input with a schema library (Zod) and derive static types from the schema — one source of truth. Split the build: a fast transpiler (esbuild/swc) for dev hot-reload, tsc --noEmit as the separate, authoritative CI gate. Multi-stage Docker: tsc runs in the build stage; only compiled JS and prod dependencies ship in the runtime image. Ship correct .d.ts declaration files for anything published as a library.

**Interview reflexes:** structural vs nominal typing, any vs unknown, discriminated unions + exhaustiveness (assertNever), type erasure and its runtime-validation implications, conditional/mapped/template-literal type mechanics, the compiler's four-stage pipeline, why the build is split into a fast transpiler plus a separate type-check gate.
`,

  "learning-roadmap": `
A realistic path to senior-level TypeScript (adjust pace to your background; assumes solid JavaScript already):

**Week 1 — Foundations.** Beginner Concepts section + Lab 1 (typed CLI todo). Daily: annotate a small existing JS script of yours in TypeScript with strict mode on. Milestone: you can explain narrowing and union types to someone else.

**Week 2 — Idiomatic types.** Intermediate Concepts: interfaces vs type, generics, discriminated unions, utility types. Refactor Week-1 code to use a discriminated union somewhere real. Milestone: you reach for a discriminated union instead of boolean flags without thinking.

**Week 3 — Advanced type-level thinking.** Advanced Concepts + Lab 2 (typed API client). Understand conditional types, mapped types, and template literal types well enough to read (not just write) a library like Zod's or tRPC's type definitions. Milestone: you can explain why "tsc" is Turing-complete at the type level.

**Week 4 — Internals + architecture.** Internal Working, Architecture, Data Flow sections; Lab 3 (mini type-checker). Read a small real TypeScript codebase (Zod or a small tRPC example) end to end. Milestone: you can describe the compiler's four phases from memory.

**Week 5 — Production.** Production Usage → Deployment sections; Lab 4 (instrumented, containerized service). Milestone: a strict-mode, Zod-validated, Dockerized TypeScript service on your GitHub with CI enforcing tsc --noEmit.

**Week 6 — Interview polish + first real project.** Interview/Coding Questions sections; start Real Project 1 (type-safe RPC layer). Milestone: explain structural typing, type erasure, exhaustiveness checking, and the build-split architecture out loud, unprompted.

Then continue to **Node.js** on this platform — everything here compounds there, followed naturally by **NestJS** or a **REST**/**GraphQL** API design page.
`,

  "official-docs": `
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — the official, genuinely excellent reference; start with "The Basics" and "Everyday Types."
- [TypeScript release notes](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html) — every version's new features, explained with examples.
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig) — every compiler option, searchable; read this once end to end.
- [TypeScript Playground](https://www.typescriptlang.org/play) — run and share TypeScript in the browser; shows the emitted JS side by side with your source.
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) — the community @types repository; browse it to see how real libraries are typed.
- [Zod documentation](https://zod.dev/) — the standard runtime validation companion library.
- [TC39 proposals](https://github.com/tc39/proposals) — track upcoming JavaScript features TypeScript often implements early.
`,

  books: `
- **Programming TypeScript** — Boris Cherny. A thorough, practical tour from fundamentals to advanced types; the closest thing to a canonical TypeScript book.
- **Effective TypeScript, 2nd ed.** — Dan Vanderkam. Specific, immediately applicable items (in the "Effective X" series style); excellent for leveling up existing knowledge.
- **Total TypeScript** (totaltypescript.com, Matt Pocock) — not a traditional book but a comprehensive, widely recommended structured course/reference for advanced type-level TypeScript.
- **Learning TypeScript** — Josh Goldberg. A solid, up-to-date, beginner-friendly modern introduction.
- **You Don't Know JS** series — Kyle Simpson. Not TypeScript-specific, but essential JavaScript depth that makes TypeScript's type system make sense (closures, prototypes, async).
- **Domain Modeling Made Functional** — Scott Wlaschin (F#-focused, but directly applicable). Excellent for internalizing why discriminated unions and making illegal states unrepresentable matters — a mindset TypeScript's type system is unusually good at expressing.
`,

  blogs: `
- **TypeScript's own blog** (devblogs.microsoft.com/typescript) — release announcements straight from the team; the primary source for what's new and why.
- **Matt Pocock / totaltypescript.com** — the most prominent advanced-TypeScript educator currently active; consistently excellent deep dives into type-level tricks.
- **Effective TypeScript blog** (effectivetypescript.com) — companion posts to the book, frequently updated with new patterns.
- **Kent C. Dodds** — while broader than TypeScript alone, strong opinions on typed React/testing patterns widely adopted in the ecosystem.
- **2ality (Dr. Axel Rauschmayer)** — deep, precise JavaScript/TypeScript language-feature explainers.
- **Anders Hejlsberg's conference talks and interviews** — not a blog, but recurring, authoritative insight into design decisions straight from the language's creator.
`,

  "research-papers": `
TypeScript's own literature is thinner than, say, a systems language's — it's an industrial engineering project more than an academic research one — but relevant reading exists:

- **"Union Types for Object-Oriented Programming"** (Igarashi & Nagira) and related structural/union-typing literature — the theoretical foundations behind how TypeScript's unions and structural compatibility are formalized.
- **"TypeScript: Modern JavaScript Development"** style engineering retrospectives from the TypeScript team's own conference talks (Anders Hejlsberg's TSConf/Build talks function as the closest thing to primary-source design documents) — read these instead of searching for a formal PL-theory paper, since TypeScript's design was driven by pragmatic industrial constraints more than a single academic paper.
- **Flow's own design papers/blog posts** (Facebook) — useful as a point of comparison; Flow and TypeScript solved a very similar problem with different tradeoffs, and reading both design rationales sharpens understanding of the tradeoffs either made.
- **Gradual typing literature broadly** ("Gradual Typing for Functional Languages," Siek & Taha, 2006) — the academic lineage TypeScript's "opt-in typing, any as an escape hatch" design sits within, even though TypeScript itself is not a strict implementation of gradual-typing soundness theory (it deliberately trades some soundness for ergonomics).

Honestly: for TypeScript specifically, the TypeScript team's own design meeting notes and RFC-style GitHub issues (on the microsoft/TypeScript repo) are more valuable primary sources than formal papers — this is applied language engineering, documented in the open, rather than published research.
`,

  videos: `
- **Anders Hejlsberg — various TSConf and Microsoft Build keynotes** — the language's creator explaining design decisions directly; search for his most recent TSConf talk for current-state thinking.
- **Matt Pocock — "Total TypeScript" YouTube series** — the most widely recommended modern video resource for going from competent to advanced TypeScript.
- **TSConf talks (YouTube, official channel)** — the community's annual conference; recordings cover everything from beginner patterns to compiler internals.
- **Theo (t3.gg)** — practical, opinionated, up-to-date TypeScript and full-stack TypeScript ecosystem content, including type-safe API layer discussions (tRPC and similar).
- **Jack Herrington** — deep dives into advanced TypeScript type-level programming with runnable examples.
- **"Type-Level TypeScript" community talks** (search TSConf archives) — dedicated sessions on conditional/mapped/template-literal type techniques.
`,

  "github-repos": `
- [microsoft/TypeScript](https://github.com/microsoft/TypeScript) — the compiler's own source; the src/compiler directory (checker.ts especially) is dense but genuinely educational reading.
- [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) — thousands of real-world .d.ts files; a great way to see advanced typing patterns applied to real, messy JavaScript libraries.
- [colinhacks/zod](https://github.com/colinhacks/zod) — the standard runtime validation library; its source is a superb example of advanced generic/inference-heavy TypeScript done well.
- [trpc/trpc](https://github.com/trpc/trpc) — end-to-end type-safe RPC without codegen; read this to see template literal types and type-only imports used at their most impressive.
- [type-challenges/type-challenges](https://github.com/type-challenges/type-challenges) — a large collection of type-level programming puzzles, from easy to "extreme" — the single best practice ground for advanced type-level skills.
- [sindresorhus/type-fest](https://github.com/sindresorhus/type-fest) — a curated collection of useful utility types beyond the stdlib's built-ins; excellent for seeing well-designed generic type helpers.
- [total-typescript/ts-reset](https://github.com/total-typescript/ts-reset) — small, focused improvements to some of TypeScript's built-in (occasionally too-loose) type definitions.
- [microsoft/vscode](https://github.com/microsoft/vscode) — one of the largest real-world TypeScript codebases in existence; a genuine "how does a huge, long-lived TS codebase actually look" reference.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Narrowing fluency*: write a function accepting string | number | string[] | null, and return a formatted description for each case using narrowing only (no any, no casts).
2. *Discriminated unions*: model a network-request state machine (idle/loading/success/error) as a union; write an exhaustive render function using assertNever for the impossible-state safety net.
3. *Generics*: write a generic groupBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K): Record<K, T[]> from scratch.
4. *Mapped/conditional types*: implement your own versions of Partial, Pick, and Omit without looking at the stdlib definitions, then compare.
5. *Template literal types*: build a type that extracts route parameters from a URL pattern string like "/users/:id/posts/:postId" into a union of parameter names.
6. *Runtime validation*: take any public JSON API, write a full Zod schema for one endpoint's response, and derive the TypeScript type from it — then deliberately break the schema and confirm parse() throws.
7. *Type-level puzzles*: work through the "easy" and "medium" tiers of the type-challenges GitHub repository — an excellent, self-contained practice set purpose-built for this exact skill.
8. *Compiler internals*: use the TypeScript Compiler API (typescript npm package) to write a small script that lists every exported function name and its parameter types across a directory of .ts files.

External sets: type-challenges (the best TypeScript-specific practice set that exists), LeetCode (solve in TypeScript with real types on inputs/outputs, not any), Advent of Code (great for stdlib and generic-function fluency).
`,

  "architecture-diagram": `
The reference architecture for a production TypeScript AI-application backend — the shape you'll build repeatedly on this platform:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] --> LB["Load balancer / API gateway"]
    LB --> API1["Node.js service pod 1\n(TypeScript, compiled)"]
    LB --> API2["Node.js service pod N"]
    API1 & API2 -->|Zod-validated| PG[("PostgreSQL")]
    API1 & API2 --> RD[("Redis\ncache · rate limits · queues")]
    API1 & API2 -->|typed client, streamed| LLM["LLM APIs\n(OpenAI/Anthropic TS SDKs)"]
    subgraph Build["Build pipeline"]
        Src["src/*.ts"] --> Lint["eslint + typescript-eslint"]
        Lint --> Check["tsc --noEmit (CI gate)"]
        Check --> Bundle["esbuild/swc bundle"]
        Bundle --> Image["Docker image (dist/ + prod deps only)"]
    end
    Image -.deploys.-> API1
    subgraph Observability
        PR["Metrics"] --> GF["Dashboards"]
        OT["Tracing"]
        LG["Structured JSON logs"]
    end
    API1 -.metrics/traces/logs.-> Observability
~~~

Every box has a dedicated skill page on this platform; this diagram is the map of how they compose.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((TypeScript))
    Language
      Basic types & unions
      Interfaces vs type aliases
      Generics
      Discriminated unions
      Narrowing
    Advanced types
      Conditional types
      Mapped types
      Template literal types
      Variance
      Branded types
    Internals
      Scanner & parser
      Binder: symbols/scopes
      Checker: inference + narrowing
      Emitter: type erasure
      The Go compiler port
    Production
      tsconfig & strict mode
      Runtime validation: Zod
      Build split: tsc vs esbuild/swc
      Testing: vitest
      Docker deployment
    Security
      Type erasure boundary
      Runtime validation at trust boundaries
      Non-null assertion risk
    Ecosystem
      Node.js · NestJS
      React · Next.js
      tRPC
      Vercel AI SDK
    Career
      Interview classics
      type-challenges practice
      Reading path
~~~
`,
};

export default typescript;
