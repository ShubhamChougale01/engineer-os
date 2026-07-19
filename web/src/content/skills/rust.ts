import type { SkillContent } from "../types";

/**
 * Rust — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences needed —
 * Rust's string interpolation macros use braces, not backtick-delimited templates.
 */
const rust: SkillContent = {
  overview: `
Rust is a statically typed, compiled systems programming language that guarantees memory safety and thread safety WITHOUT a garbage collector, by enforcing an ownership and borrowing model at compile time. Created originally at Mozilla and now stewarded by an independent Rust Foundation, Rust's core promise is unusual among languages: the performance and control of C/C++, with entire classes of bugs (use-after-free, data races, null pointer dereferences) made impossible to compile, not just unlikely at runtime.

For an AI engineer, Rust shows up at the performance-critical edges of the stack: tokenizers (Hugging Face's tokenizers library), inference engines and their bindings (candle, llama.cpp-adjacent tooling, parts of PyTorch's ecosystem), high-throughput serving infrastructure (some vector databases like Qdrant are Rust-native), and increasingly as the implementation language for Python's own tooling — uv and ruff, the modern Python package manager and linter, are both written in Rust specifically because Python's own performance ceiling wasn't sufficient for those tools. Rust is rarely where you train a model; it is increasingly where you make everything AROUND the model fast and safe.

Key characteristics: no garbage collector — memory is freed deterministically when its owner goes out of scope; the borrow checker enforces exactly one mutable reference OR any number of immutable references to a value at a time, at compile time; zero-cost abstractions (high-level code compiles to the same machine code as hand-written low-level equivalents); and a famously steep initial learning curve traded for an unusually low rate of a specific, painful category of production bugs.
`,

  history: `
Rust began as a personal project by **Graydon Hoare** in 2006, and was adopted and sponsored by **Mozilla** starting in 2009, driven by the practical need for a systems language that could power a new, safer browser engine without the memory-safety bugs that plagued C++ codebases like Firefox's.

| Year | Milestone |
|------|-----------|
| 2006 | Graydon Hoare starts Rust as a personal project |
| 2009 | Mozilla begins officially sponsoring Rust's development |
| 2010 | Rust publicly announced |
| 2012 | Servo, an experimental browser engine, begins — Rust's first serious real-world proving ground |
| 2015 | Rust 1.0 released — the stability promise begins, alongside the now-famous ownership/borrowing model |
| 2016–2020 | Rust wins "most loved language" in Stack Overflow's annual survey every year — an unusual, sustained signal of developer satisfaction |
| 2018 | Rust 2018 edition — non-lexical lifetimes (a major borrow-checker ergonomics improvement), the module system overhauled |
| 2019 | Firefox's Quantum project ships Rust-written components (Stylo, the CSS engine) in production, a major real-world validation |
| 2020 | Mozilla lays off the core Rust team amid broader cuts; the **Rust Foundation** is formed by Mozilla, AWS, Google, Microsoft, and Huawei to steward the language independently |
| 2021 | Rust 2021 edition — disjoint closure captures, IntoIterator for arrays |
| 2022 | The Linux kernel accepts Rust as a second implementation language alongside C — a landmark systems-programming endorsement |
| 2023 | async fn in traits stabilizes incrementally; the Rust project publishes its first formal specification effort |
| 2024 | Rust 2024 edition preparations; continued growth in AI/ML tooling (candle, tokenizers) and adoption by major cloud providers for critical infrastructure |
| 2025+ | Continued maturation of async ecosystem, GATs (generic associated types), and const generics |

The formation of the independent Rust Foundation in 2020, after Mozilla's own team cuts, is a notable case study: a language whose primary corporate sponsor stepped back nonetheless continued thriving because enough OTHER large companies (AWS, Google, Microsoft) had independently bet on it for their own infrastructure.
`,

  "why-it-exists": `
Rust exists because of a problem that had persisted, unsolved, for decades: **memory-unsafety bugs in C and C++ cause a hugely disproportionate share of real-world security vulnerabilities**. Microsoft and Google have both separately published data attributing roughly 70% of their serious security vulnerabilities over many years to memory-safety issues — use-after-free, buffer overflows, null pointer dereferences, data races — the exact class of bug that manual memory management makes possible.

The prior landscape offered an unsatisfying choice:

1. **C/C++**: maximum performance and control, but memory safety is entirely the programmer's responsibility, enforced by discipline and tooling (static analyzers, sanitizers) that catch bugs AFTER they're written, not before compilation.
2. **Garbage-collected languages (Java, Go, C#)**: memory safety, but at the cost of GC pause times, higher memory overhead, and reduced control over exactly when memory is freed — unacceptable for some systems-programming use cases (embedded, kernels, hard-real-time).

Rust's insight, drawing on decades of academic work in linear/affine type systems and region-based memory management, was that a compiler COULD verify memory safety statically, with zero runtime cost, if the language enforced strict rules about ownership: every value has exactly one owner, and the compiler tracks when that owner goes out of scope to free the memory deterministically — no garbage collector needed, and the whole class of use-after-free/double-free bugs becomes a compile error instead of a runtime crash or security vulnerability.
`,

  "problem-it-solves": `
Rust solves the **memory-safety-without-garbage-collection problem**: how do you get C/C++'s performance and control while eliminating the specific bug class that costs the industry the most in security vulnerabilities and debugging time?

Concretely, Rust removes:

- **Use-after-free and double-free bugs**: the ownership system makes it a COMPILE ERROR to use a value after it's been moved or dropped — not a runtime crash discovered in production or by an attacker.
- **Data races**: the borrow checker's rule (one mutable reference XOR many immutable references, enforced across threads too via the Send/Sync traits) makes a whole class of concurrency bugs impossible to compile, not just hard to trigger.
- **Null pointer dereferences**: there is no null in safe Rust; absence is modeled explicitly with Option<T>, and the compiler forces you to handle the None case before you can use the value.
- **Manual memory management errors**: no malloc/free pairing to get wrong — ownership and the Drop trait handle deterministic cleanup automatically.
- **Undefined behavior from uninitialized memory**: variables must be initialized before use, enforced at compile time.

What Rust deliberately does **not** solve: development velocity for quick scripts or prototypes (the borrow checker's learning curve and Rust's verbosity relative to Python make it a poor choice for one-off exploratory code), nor does it eliminate ALL bugs — logic errors, panics from array-index-out-of-bounds, and unsafe-block misuse remain entirely possible. Rust's guarantee is specifically about memory and data-race safety in "safe" Rust code, a large and deliberately chosen subset of what bugs exist.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain ownership, borrowing, and lifetimes precisely enough to predict whether a given piece of code will compile.
2. Write idiomatic Rust: pattern matching, Option/Result, traits, iterators, and closures.
3. Use generics and trait bounds to write reusable, statically-dispatched code, and know when dynamic dispatch (dyn Trait) is the right tool instead.
4. Build concurrent programs safely using threads, channels, and async/await, leveraging the compiler to prevent data races.
5. Understand how the borrow checker works internally well enough to fix its errors quickly instead of fighting it.
6. Structure a production Rust project with Cargo, manage dependencies, and understand the crate ecosystem.
7. Test with cargo test, benchmark with criterion, and profile with standard tooling.
8. Answer senior-level interview questions on ownership, the Send/Sync traits, zero-cost abstractions, and unsafe Rust's actual guarantees.
`,

  prerequisites: `
- **Required**: solid programming fundamentals in at least one other language — variables, functions, basic data structures. Rust's concepts (ownership especially) are genuinely novel, but the page assumes general programming literacy.
- **Helpful**: some exposure to a systems language (C or C++) makes memory-related concepts (stack vs heap, pointers) click faster, though not required — this page explains them from scratch.
- **For the async/concurrency sections**: general familiarity with the idea of concurrent execution (from any language) helps, though Rust's specific safety guarantees are explained fully here.

Dependency links: general **Computer Science** fundamentals (particularly memory/stack-vs-heap concepts) → this page → **Concurrency**, **Systems Fundamentals**, and performance-critical portions of **AI Frameworks** (tokenizers, inference engines) all build on Rust fluency.
`,

  "beginner-concepts": `
### Your first program and variables

~~~rust
fn main() {
    println!("Hello, Rust!");

    let x = 5;           // immutable by default!
    let mut y = 10;       // must explicitly opt into mutability
    y += 1;

    let name: String = String::from("Ada");
    let age: u32 = 36;
}
~~~

The single biggest surprise for newcomers: variables are **immutable by default**. You must write let mut to allow reassignment — a deliberate design choice that makes accidental mutation a compile error rather than a hidden bug.

### Basic types and ownership's first rule

~~~rust
let s1 = String::from("hello");
let s2 = s1;              // s1 is MOVED into s2 — s1 is no longer valid
// println!("{}", s1);    // COMPILE ERROR: value borrowed after move

let n1 = 5;                // integers implement Copy — this is a COPY, not a move
let n2 = n1;
println!("{} {}", n1, n2); // fine — both are valid
~~~

This is ownership's core rule: a value has exactly one owner. Assigning a String (heap-allocated) to another variable MOVES ownership, invalidating the original — unlike simple stack-only types (integers, booleans) which implement the Copy trait and are duplicated instead.

### Structs and enums

~~~rust
struct User {
    name: String,
    age: u32,
}

let user = User { name: String::from("Ada"), age: 36 };

enum Status {
    Pending,
    Active(u32),          // enum VARIANTS can carry data
    Done { reason: String },
}

let s = Status::Active(42);
~~~

Rust enums are far more powerful than in most languages — each variant can carry different data, making them the natural way to model "one of several distinct shapes," the same role discriminated unions play in TypeScript.

### Option and Result — no null, explicit errors

~~~rust
fn find_user(id: u32) -> Option<User> {
    if id == 1 {
        Some(User { name: String::from("Ada"), age: 36 })
    } else {
        None
    }
}

fn parse_age(input: &str) -> Result<u32, String> {
    input.parse::<u32>().map_err(|_| format!("invalid age: {}", input))
}

match find_user(1) {
    Some(user) => println!("Found: {}", user.name),
    None => println!("Not found"),
}
~~~

There is no null in safe Rust. Absence is Option<T> (Some or None); fallibility is Result<T, E> (Ok or Err). The compiler FORCES you to handle both cases before extracting the value — the entire "forgot to null-check" bug class disappears.

### Control flow and pattern matching

~~~rust
let n = 7;
if n % 2 == 0 {
    println!("even");
} else {
    println!("odd");
}

for i in 0..5 {              // range, exclusive of 5
    println!("{}", i);
}

let description = match n {
    0 => "zero",
    1..=9 => "single digit",
    _ => "large",             // _ is the required catch-all
};
~~~

match must be exhaustive — the compiler refuses to compile a match missing a case, unlike a switch statement in most other languages that silently falls through.

Common beginner trap: fighting the borrow checker by cloning everything to make errors go away — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### Borrowing — references without taking ownership

~~~rust
fn calculate_length(s: &String) -> usize {   // & means "borrow, don't take ownership"
    s.len()
}

let s1 = String::from("hello");
let len = calculate_length(&s1);   // s1 is BORROWED, still valid after the call
println!("{} has length {}", s1, len);

fn add_exclamation(s: &mut String) {   // a MUTABLE borrow
    s.push_str("!");
}
let mut s2 = String::from("hi");
add_exclamation(&mut s2);
~~~

The borrowing rule enforced at COMPILE TIME: at any point, you may have either exactly one mutable reference, OR any number of immutable references — never both at once. This single rule is what prevents data races and use-after-free without a garbage collector.

### Traits — Rust's interfaces

~~~rust
trait Shape {
    fn area(&self) -> f64;
    fn describe(&self) -> String {           // default method implementation
        format!("A shape with area {:.2}", self.area())
    }
}

struct Circle { radius: f64 }
impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn print_area(shape: &impl Shape) {          // generic over any Shape implementor
    println!("{}", shape.describe());
}
~~~

Traits define shared behavior; unlike Go's implicit interfaces, Rust requires an explicit impl Trait for Type block — but like Go, the trait can be defined separately from the type (even for types you don't own, subject to the "orphan rule").

### Iterators and closures

~~~rust
let numbers = vec![1, 2, 3, 4, 5];

let sum: i32 = numbers.iter().sum();
let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
let evens: Vec<&i32> = numbers.iter().filter(|&&x| x % 2 == 0).collect();

let add = |a: i32, b: i32| a + b;    // a closure — captures its environment
println!("{}", add(2, 3));
~~~

Rust's iterators are lazy (nothing runs until you call collect, sum, for_each, etc.) and compile to code as fast as a hand-written loop — the "zero-cost abstraction" promise made concrete.

### Error handling with ? and custom errors

~~~rust
use std::fmt;

#[derive(Debug)]
struct ParseError(String);
impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "parse error: {}", self.0)
    }
}

fn parse_config(raw: &str) -> Result<u32, ParseError> {
    raw.trim().parse::<u32>().map_err(|_| ParseError(raw.to_string()))
}

fn load_and_double(raw: &str) -> Result<u32, ParseError> {
    let n = parse_config(raw)?;      // ? propagates the error early, unwraps Ok otherwise
    Ok(n * 2)
}
~~~

The ? operator is Rust's ergonomic answer to error propagation: if the Result is Err, ? returns it immediately from the enclosing function; if Ok, it unwraps and continues — dramatically less boilerplate than manual match on every fallible call.

### Collections: Vec, HashMap, and slices

~~~rust
let mut scores: std::collections::HashMap<String, i32> = std::collections::HashMap::new();
scores.insert(String::from("Ada"), 95);
scores.entry(String::from("Ada")).or_insert(0);   // insert only if absent

let v = vec![1, 2, 3, 4, 5];
let slice: &[i32] = &v[1..3];    // a borrowed VIEW, no copy
~~~

### Lifetimes — making borrow relationships explicit

~~~rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
~~~

'a is a lifetime parameter — it doesn't change how long anything lives, it tells the compiler "the returned reference is valid for as long as BOTH input references are." Most lifetimes are inferred; you write them explicitly only when the compiler can't figure out the relationship on its own.
`,

  "advanced-concepts": `
### The borrow checker's actual model: NLL and the aliasing rule

Modern Rust (post-2018 edition, "non-lexical lifetimes") tracks borrows by their ACTUAL last use, not the enclosing lexical scope — a major ergonomics improvement over early Rust:

~~~rust
let mut v = vec![1, 2, 3];
let first = &v[0];           // immutable borrow starts
println!("{}", first);       // last use of "first" — borrow effectively ends HERE
v.push(4);                    // fine under NLL; would have errored in pre-2018 Rust
~~~

The fundamental rule the checker enforces, always: **aliasing XOR mutability** — you can have many readers, or one writer, never both simultaneously, for any given piece of data. This single invariant is what makes Rust's "fearless concurrency" claim literally true: the compiler refuses to compile code that could race.

### Send and Sync — concurrency safety as trait bounds

~~~rust
use std::thread;
use std::sync::{Arc, Mutex};

let counter = Arc::new(Mutex::new(0));   // Arc: atomic ref-counted shared ownership
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;
    }));
}
for handle in handles { handle.join().unwrap(); }
~~~

Send (safe to transfer ownership across threads) and Sync (safe to share a reference across threads) are marker traits the compiler checks automatically — a type that isn't Send simply CANNOT be moved into thread::spawn's closure; this is a compile error, not a runtime race waiting to happen. Arc<Mutex<T>> is the idiomatic pattern for shared mutable state across threads.

### Smart pointers: Box, Rc, and RefCell

~~~rust
let boxed: Box<i32> = Box::new(5);              // heap allocation, single owner

use std::rc::Rc;
let shared = Rc::new(String::from("shared"));    // reference-counted, single-threaded
let shared2 = Rc::clone(&shared);                 // increments the count, no deep copy

use std::cell::RefCell;
let cell = RefCell::new(5);                       // interior mutability — checked at RUNTIME
*cell.borrow_mut() += 1;                          // panics if already borrowed elsewhere
~~~

RefCell moves the borrow-checking rule from compile time to runtime — useful for the rare cases where the compiler's static analysis is too conservative for a pattern you know is actually safe; the cost is a panic instead of a compile error if you get it wrong.

### Traits objects and dynamic dispatch

~~~rust
fn total_area(shapes: &[Box<dyn Shape>]) -> f64 {   // dyn Shape: dynamic dispatch via vtable
    shapes.iter().map(|s| s.area()).sum()
}
// vs. static dispatch (monomorphization) — a separate copy compiled per concrete type:
fn print_area<T: Shape>(shape: &T) { println!("{}", shape.describe()); }
~~~

Generic functions with trait bounds (fn foo<T: Shape>) are monomorphized — the compiler generates a specialized copy for each concrete type used, zero runtime dispatch cost, larger binary. dyn Trait uses a vtable (like C++ virtual functions) — one compiled copy, small runtime dispatch cost, smaller binary, and it's the only option when you need a heterogeneous collection of different types behind one interface.

### Unsafe Rust — the deliberate escape hatch

~~~rust
unsafe fn dangerous() -> i32 {
    let ptr = 0x1234 as *const i32;
    *ptr    // raw pointer dereference — the compiler cannot verify this is safe
}
~~~

unsafe does NOT disable the borrow checker or type system — it unlocks five specific additional capabilities (raw pointer dereference, calling unsafe functions, mutable statics, implementing unsafe traits, accessing union fields) that the compiler cannot verify are safe, moving the safety burden explicitly onto the programmer for that block only. Idiomatic Rust wraps unsafe code in a safe API at the module boundary — this is exactly how Vec, String, and most of the standard library's own internals work.

### Async/await and Futures

~~~rust
async fn fetch_user(id: u32) -> Result<User, Error> {
    let response = reqwest::get(format!("https://api.example.com/users/{}", id)).await?;
    response.json().await
}
~~~

Unlike Go's goroutines (green threads scheduled by the runtime automatically), Rust's async fn compiles to a state machine that does NOTHING until polled by an executor (tokio being the dominant one) — Rust deliberately ships no built-in async runtime, keeping the core language usable in embedded/no-std contexts while letting the ecosystem choose its own executor.
`,

  "internal-working": `
The Rust compiler (rustc) turns source into native machine code through several IR (intermediate representation) stages, each doing progressively more specific analysis:

~~~mermaid
flowchart LR
    A["source .rs"] --> B["AST (parser)"]
    B --> C["HIR — High-level IR\n(desugared, name-resolved)"]
    C --> D["MIR — Mid-level IR\n(borrow checking happens HERE)"]
    D --> E["LLVM IR"]
    E --> F["Native machine code\n(via LLVM backend)"]
~~~

1. **Parse to AST**: source becomes an Abstract Syntax Tree.
2. **HIR (High-level IR)**: the AST is desugared (for loops become iterator calls, ? becomes explicit match-and-return) and names are resolved.
3. **MIR (Mid-level IR)**: a simplified, control-flow-graph-based representation — THIS is where the borrow checker actually runs, analyzing every borrow's region (span of code where it's valid) against the aliasing rule.
4. **LLVM IR and codegen**: MIR lowers to LLVM's intermediate representation, and LLVM (the same backend used by Clang for C/C++) does the heavy optimization and generates native machine code for the target architecture.

**Monomorphization**: generic functions are NOT compiled once and dispatched dynamically by default — each concrete type used with a generic function gets its own fully-specialized compiled copy, generated at compile time. This is the mechanical basis of Rust's "zero-cost abstractions" claim: a generic Vec<T>::push call compiles down to the exact same machine code as if you'd hand-written a specialized push for that specific type, with zero runtime overhead for the abstraction — the cost is paid at compile time (longer builds, larger binaries) instead.

**Ownership and drop**: the compiler statically determines, for every value, the exact point where its owner goes out of scope, and inserts a call to that type's Drop implementation (destructor) right there — deterministic, compile-time-scheduled cleanup with zero garbage collector, zero runtime tracing, and zero pause times.

**Why compile times are slow**: LLVM's optimization passes, combined with monomorphization generating many specialized copies of generic code, are the primary reasons Rust compiles noticeably slower than Go for equivalent-sized codebases — a real, often-cited tradeoff for the safety and performance guarantees.
`,

  architecture: `
A senior engineer thinks about Rust at two levels: the **compilation/runtime architecture** (what actually exists once your program runs) and the **application architecture** (how a Rust codebase is organized with Cargo).

### Runtime architecture

~~~mermaid
flowchart TB
    subgraph Binary["Compiled Rust binary"]
        Stack["Stack\n(per-thread, ownership-tracked,\nautomatic deterministic cleanup)"]
        Heap["Heap\n(Box/Vec/String — freed via Drop\nwhen the owner scope ends)"]
        NoGC["NO garbage collector,\nNO runtime tracing"]
    end
    Stack -->|owns| Heap
    NoGC -.-> Heap
~~~

Key fact: unlike Go, Java, or Python, there is no separate managed runtime inside a Rust binary — memory is freed by ordinary function calls (Drop implementations) the compiler inserted at compile time, exactly where ownership ends. This is why Rust binaries have effectively zero GC-related latency variance.

### Application architecture (production Rust service)

The standard Cargo-based layout used by mature Rust teams:

~~~
myservice/
├── Cargo.toml               # dependencies, package metadata
├── Cargo.lock               # exact resolved dependency versions — always commit this
├── src/
│   ├── main.rs              # thin entrypoint
│   ├── lib.rs                # the library crate other binaries/tests can depend on
│   ├── api/                  # HTTP handlers, request/response types
│   ├── domain/                # core types, business logic — framework-agnostic
│   └── repository/            # data access behind traits
└── tests/                     # integration tests (unit tests live alongside src/ modules)
~~~

Rules: dependencies point inward (api → domain → repository), repositories are defined as traits so tests substitute fakes without a mocking framework, and a workspace (multiple crates under one Cargo.toml [workspace]) is the standard way to split a large system into independently-buildable pieces.
`,

  "data-flow": `
What happens when you run **cargo run** (or the compiled binary directly):

~~~mermaid
sequenceDiagram
    participant OS
    participant Bin as Rust binary
    participant Stack as Call stack
    participant Heap as Heap allocator

    OS->>Bin: exec ./myservice
    Bin->>Stack: main() begins; local variables pushed
    Bin->>Heap: Box::new/Vec::new/String::from allocate heap memory
    Note over Stack,Heap: ownership tracked entirely at compile time
    Bin->>Bin: as scopes end, compiler-inserted Drop calls free heap memory HERE
    Bin-->>OS: exit code (stack fully unwound, all Drops run)
~~~

For an HTTP request in a Rust web service (typically built on tokio + axum or actix-web), the data flow is: a TCP connection arrives → the async runtime (tokio) polls the connection's future when data is ready → your async handler runs, potentially .await-ing further I/O (database, downstream API) which yields control back to the runtime while waiting → the response is written back. Because Rust's async model has NO garbage collector and futures are zero-cost state machines, a Rust async service typically handles extremely high connection counts with very low, predictable memory and CPU overhead per connection.

The most misunderstood part for newcomers: **moves vs borrows in function calls**. Passing a String by value moves it (the caller loses access); passing &String borrows it (the caller keeps access, the callee cannot mutate it); passing &mut String mutably borrows it (the caller keeps access, but cannot use it again until the borrow ends, and no other reference can exist simultaneously). Nearly every "why won't this compile" question for a Rust beginner traces back to correctly identifying which of these three is happening at a given call site.
`,

  "production-usage": `
### Cargo — the build tool and package manager

~~~bash
cargo new myservice          # scaffold a new binary crate
cargo add tokio --features full
cargo add axum serde --features serde/derive
cargo build --release        # optimized build — always use for production
cargo run
cargo test
~~~

Non-negotiables for production:

1. **Cargo.lock committed** for binaries (not for libraries, by convention) — byte-identical dependency resolution on every machine and in CI.
2. **cargo build --release** — the default (debug) build has NO optimizations and can be 10-100x slower; never ship a debug build.
3. **A workspace** for multi-crate projects — shares a single Cargo.lock and target/ build cache across all member crates.
4. **Pin the Rust edition** (2021, 2024, etc.) in Cargo.toml — editions are opt-in, backward-compatible language evolution boundaries.

### Configuration

Read config from environment variables, validated at startup — the config crate or manual std::env::var calls with proper error handling; fail fast on missing/invalid config.

### Async runtime choice

- **tokio** is the dominant async runtime for production services — multi-threaded work-stealing scheduler, a huge ecosystem of compatible crates.
- Choose a web framework built on it: **axum** (from the tokio team, type-safe extractors, currently the most idiomatic choice) or **actix-web** (mature, historically very fast, actor-based internals).
- Always set explicit timeouts on outbound calls (reqwest's default has no timeout either, exactly like many other HTTP clients across languages) — set one explicitly.
`,

  "industry-examples": `
- **Mozilla**: Rust's birthplace; Firefox's Quantum project shipped Rust components (Stylo CSS engine) in production, proving the language at real browser scale.
- **Microsoft**: uses Rust for security-critical Windows components, citing the elimination of memory-safety CVEs as the primary driver; publishes data attributing roughly 70% of their historical CVEs to memory-safety issues that Rust structurally prevents.
- **AWS**: Firecracker (the microVM technology underlying AWS Lambda and Fargate) is written in Rust specifically for its combination of performance and memory safety in multi-tenant, security-critical infrastructure.
- **Discord**: rewrote performance-critical backend services (notably their "Read States" service) from Go to Rust, publishing a widely cited engineering post about eliminating GC-pause-related latency spikes.
- **Cloudflare**: uses Rust extensively for networking-critical infrastructure (alongside Go, per the case study in the Go skill), citing memory safety plus performance as decisive.
- **The Linux kernel**: accepted Rust as a supported second implementation language (2022) for new driver code — one of the most conservative, safety-critical codebases in the world making this bet is a significant industry signal.
- **Hugging Face**: the tokenizers library (used by essentially every modern LLM's text preprocessing) is written in Rust for raw throughput, with Python bindings — a directly AI-relevant example.

Pattern to notice: Rust adoption clusters around **security-critical infrastructure** and **latency-sensitive systems where GC pauses are unacceptable** — precisely the niche its design targets, rather than general application development.
`,

  "best-practices": `
1. **Let the compiler guide you** — a Rust compile error is usually precise and actionable; read it fully (including the "help" suggestions) before reaching for a workaround.
2. **Prefer borrowing over cloning** — reach for &T/&mut T first; .clone() is a legitimate escape hatch, not a default reflex to silence the borrow checker.
3. **Model states with enums, not booleans + optional fields** — the same discriminated-union principle as TypeScript, expressed natively via Rust's enum + match.
4. **Use ? for error propagation**, not manual match-and-return on every fallible call.
5. **Prefer static dispatch (generics) by default**; reach for dyn Trait only when you genuinely need heterogeneous types or to avoid excessive monomorphization-driven binary bloat.
6. **Keep unsafe blocks small and wrapped in a safe API** — the module containing unsafe code should expose only safe functions to its callers, exactly as the standard library does internally.
7. **Run cargo clippy** (the official linter) in CI — it catches idiom violations and common mistakes go vet-style, well beyond what the compiler alone flags.
8. **cargo fmt without exception** — like gofmt, there is no formatting debate to have.
9. **Write tests alongside the code they test** (#[cfg(test)] modules) for unit tests; use tests/ for integration tests exercising the public API.
10. **Choose Arc<Mutex<T>> for simple shared state across threads**; reach for channels (via std::sync::mpsc or tokio::sync::mpsc) when the pattern is genuinely about passing ownership of work between tasks, not just protecting a value.
`,

  "anti-patterns": `
### Cloning everything to silence the borrow checker

~~~rust
fn process(data: &Vec<String>) -> Vec<String> {
    let mut result = Vec::new();
    for item in data {
        result.push(item.clone());   // cloning every item just to avoid dealing with borrows
    }
    result
}

// Often what's actually needed is simply returning references with a lifetime,
// or restructuring so ownership transfers cleanly instead of being fought:
fn process_better(data: &[String]) -> Vec<&String> {
    data.iter().collect()   // borrow, don't clone, if the caller can accept references
}
~~~

Reaching for .clone() the instant the borrow checker complains is the single most common beginner anti-pattern — it "works" (compiles) but frequently signals a design that hasn't yet internalized ownership, and can hide real performance costs in a hot path.

### Other production-grade anti-patterns

- **.unwrap() everywhere in production code**: unwrap() panics immediately on None/Err with no context — fine in throwaway scripts and tests, a production liability in real services; use ? or explicit match with proper error handling instead.
- **Stringly-typed errors** (Result<T, String>) instead of a proper error enum implementing std::error::Error — loses structure callers might need to match on programmatically.
- **Overusing Rc<RefCell<T>>** to route around the borrow checker for patterns that would be cleaner with a redesigned ownership structure — legitimate for graphs/trees with shared mutable nodes, overused as a general "make the compiler stop complaining" hammer.
- **Blocking calls inside async functions**: calling std::thread::sleep or a synchronous, blocking I/O call inside an async fn stalls the ENTIRE async executor thread it's running on — use the async equivalent (tokio::time::sleep) or spawn_blocking for genuinely CPU-bound work.
- **Excessive generic trait bounds** that make a function signature unreadable — sometimes a concrete type or a dyn Trait parameter is genuinely clearer than a five-line where clause.
- **Ignoring clippy warnings** — many flag genuine correctness or performance issues, not just style preferences.
- **Premature unsafe** for a performance win that hasn't been measured — unsafe should be a last resort after profiling shows safe Rust genuinely isn't fast enough, not a first instinct.
`,

  performance: `
### Rule zero: measure first

~~~bash
cargo build --release                 # ALWAYS profile release builds, never debug
cargo install flamegraph
cargo flamegraph --bin myservice       # visual CPU profile
cargo bench                            # requires the criterion crate for stable benchmarking
~~~

Debug builds have no optimizations and can be an order of magnitude slower — profiling a debug build tells you almost nothing useful about production performance.

### The performance hierarchy (apply in order)

1. **Better algorithm / data structure** — identical to any language; Rust's speed doesn't fix an O(n²) algorithm.
2. **Avoid unnecessary allocations and clones** — check for .clone() calls in hot paths; prefer borrowing; use Vec::with_capacity when the size is known upfront to avoid repeated reallocation.
3. **Leverage iterators, don't fight them** — Rust's iterator chains (map/filter/fold) compile to code as fast as hand-written loops (zero-cost abstraction); breaking a chain into manual index-based loops rarely helps and often hurts readability for no gain.
4. **Choose the right collection**: Vec for sequences, HashMap/HashSet for O(1) average lookup, BTreeMap when sorted iteration order matters.
5. **Parallelize with rayon** for CPU-bound data-parallel work — turning a .iter() into a .par_iter() is often a one-line change that uses all available cores.
6. **Profile before reaching for unsafe** — most performance problems are algorithmic or allocation-related, not something unsafe fixes; reserve unsafe for the rare, measured, genuine hot-path win.

### Micro-level facts worth knowing

- String concatenation in a loop should use String::push_str into a pre-allocated buffer, not repeated + which reallocates each time.
- &str (borrowed string slice) avoids allocation entirely when you don't need ownership; String (owned, heap-allocated) is for when you genuinely need to own or mutate the data.
- Box<dyn Trait> incurs a small vtable indirection versus a monomorphized generic — usually irrelevant, occasionally worth flattening in a proven hot path.
- #[inline] hints (rarely needed — LLVM's inliner is generally excellent) can help in specific measured cases for small, hot functions.
`,

  scalability: `
Rust services scale the same way any networked service does — **horizontally** — with Rust-specific strengths from its GC-free, low-overhead-per-connection model.

### Single machine

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["Rust service (process 1)\ntokio multi-threaded runtime"]
    LB --> S2["Rust service (process N)"]
    S1 & S2 --> DB[("PostgreSQL\n(sqlx/tokio-postgres)")]
    S1 & S2 --> RD[("Redis")]
~~~

Because Rust has no garbage collector, per-connection memory overhead and worst-case latency variance are both lower than in GC'd languages under heavy concurrent load — a single Rust service instance frequently handles a very high number of concurrent connections (tens of thousands with async I/O) with predictable, low tail latency.

### Beyond one machine

- **Stateless services + externalized state**: identical discipline to any language — Redis/Postgres hold shared state, scaling is more containers behind a load balancer.
- **rayon for CPU-bound parallel work**: data-parallel workloads (batch processing, embedding computation on the CPU) scale near-linearly across cores with minimal code change.
- **tokio's work-stealing scheduler**: distributes async tasks across a thread pool automatically, similar in spirit to Go's GMP model but built entirely as a library rather than baked into the language runtime.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| CPU-bound hot path in an otherwise I/O-bound service | tokio::task::spawn_blocking to avoid stalling the async executor, or rayon for genuinely parallel CPU work |
| Excessive monomorphization bloating binary size / compile time | Use dyn Trait at the boundary where heterogeneity is needed instead of deeply generic call chains everywhere |
| Lock contention on a shared Mutex under high concurrency | Shard the lock (multiple mutexes over partitions of the data), or use a lock-free structure (crossbeam, dashmap) |
| Slow compile times in a large workspace | Split into more, smaller crates so unaffected crates skip recompilation; sccache for shared build caching in CI |
`,

  security: `
### What Rust's type system already prevents

Memory-safety vulnerabilities (buffer overflows, use-after-free, double-free, uninitialized memory reads) are the single largest category Rust structurally eliminates in SAFE code — this is Rust's primary, most-cited security value proposition, backed by Microsoft's and Google's own published CVE-attribution data.

### What Rust does NOT automatically prevent

1. **Logic bugs and injection attacks remain entirely possible**: SQL injection, command injection, and XSS are data-handling problems, not memory-safety problems — Rust's type system doesn't protect a raw string concatenated into a SQL query any more than any other language's would (see the **SQL Injection** and **OWASP Top 10** skills).
2. **unsafe blocks reintroduce the exact risks safe Rust eliminates** — a bug inside an unsafe block can cause the same use-after-free or buffer overflow C/C++ code can. This is why auditing unsafe usage (cargo geiger lists it) is a real security practice for Rust codebases.
3. **Panics as a denial-of-service vector**: unwrap()/expect() calls that panic on unexpected input can crash a service if that input is attacker-controlled and unvalidated — treat any panic reachable from untrusted input as a bug.
4. **Dependency supply chain**: exactly the same risk as any package ecosystem — a malicious or compromised crate can execute arbitrary code, since Rust's safety guarantees are about MEMORY safety, not about what code you've chosen to run.

### Cryptography and secrets

- Use well-audited crates (ring, rustls) rather than implementing cryptographic primitives — the same universal rule as any language.
- Secrets from environment variables or a vault, never hardcoded.
- rustls is increasingly preferred over OpenSSL bindings specifically because it's memory-safe Rust rather than a C library, removing an entire class of historical OpenSSL CVEs from that particular dependency.

### Supply chain

- Cargo.lock pins exact dependency versions; cargo audit checks against the RustSec advisory database for known vulnerabilities in your dependency tree.
- cargo geiger reports how much unsafe code exists across your dependency tree — a useful signal for auditing third-party crates.

See the dedicated **SQL Injection**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond what's Rust-specific.
`,

  testing: `
Rust's testing support is built into the language and Cargo directly — no third-party test framework is required for the basics.

~~~rust
fn apply_discount(price: f64, percent: f64) -> f64 {
    price * (1.0 - percent / 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn basic_discount() {
        assert_eq!(apply_discount(100.0, 10.0), 90.0);
    }

    #[test]
    #[should_panic(expected = "invalid")]
    fn rejects_over_100_percent() {
        // ... calls a function that panics on invalid input, asserting it does
    }
}
~~~

~~~bash
cargo test                    # runs all unit + integration tests
cargo test -- --nocapture     # show println! output even for passing tests
~~~

### Table-driven-style tests and property-based testing

~~~rust
#[test]
fn discount_matrix() {
    let cases = [(100.0, 0.0, 100.0), (100.0, 100.0, 0.0), (59.99, 15.0, 50.99)];
    for (price, pct, expected) in cases {
        assert!((apply_discount(price, pct) - expected).abs() < 0.01);
    }
}
~~~

The **proptest** crate brings property-based testing (à la Python's hypothesis) — generating many random inputs and checking invariants hold, excellent for finding edge cases in parsers and pure functions.

### The senior testing doctrine

- Unit tests live alongside the code they test (#[cfg(test)] modules); integration tests in tests/ exercise the crate's PUBLIC API only.
- Prefer trait-based fakes over mocking frameworks — Rust's traits make hand-written test doubles idiomatic and simple.
- criterion for real benchmarking — it accounts for statistical noise and warm-up in a way naive timing doesn't.
- cargo clippy and cargo fmt --check in CI alongside cargo test — none substitutes for the others.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the compiler error fully** — rustc's error messages are famously detailed, often including a specific "help:" suggestion that's the actual fix; resist the urge to skim past them.
2. **println! / dbg! for quick inspection** — the dbg! macro prints the expression, its value, AND its file/line location, then returns the value unchanged so it can be inserted inline without restructuring code.

~~~rust
let x = dbg!(compute_something());   // prints "[src/main.rs:12] compute_something() = 42"
~~~

3. **rust-gdb / rust-lldb** — Rust-aware wrappers around the standard native debuggers; set breakpoints, inspect variables, step through exactly like debugging C/C++.
4. **cargo expand** — shows the fully macro-expanded source, invaluable when a derive macro (#[derive(Debug)], serde's macros) is producing confusing behavior.
5. **RUST_BACKTRACE=1 cargo run** — prints a full stack trace on panic, essential for tracking down WHERE an unwrap()/expect() actually failed in a larger call chain.
6. **Miri** (cargo +nightly miri run) — an interpreter that catches undefined behavior (including inside unsafe blocks) that even the borrow checker can't statically verify — the gold-standard tool for auditing unsafe code.

### Debugging the borrow checker specifically

- Read the error's suggested fix first — often it's exactly right (add a lifetime, clone here, restructure this borrow).
- If truly stuck, temporarily .clone() to get something compiling, then work backward to remove the clone once the logic is correct — a legitimate debugging technique, not a production pattern.
- rust-analyzer (the language server) shows inferred types and lifetime hints inline in most editors, often clarifying WHY a borrow conflict exists before you even hit compile.
`,

  monitoring: `
Production Rust visibility rests on the same three pillars as any language (see the Observability category for depth), with Rust-specific tooling built around the async ecosystem:

### Structured logging and tracing

~~~rust
use tracing::{info, instrument};

#[instrument]                          // auto-instruments this function with a tracing span
async fn place_order(order_id: u64, user_id: u64) -> Result<(), Error> {
    info!(order_id, user_id, "processing order");
    // ...
    Ok(())
}
~~~

The **tracing** crate (not to be confused with distributed tracing generally, though it integrates with OpenTelemetry) is the ecosystem standard — structured, leveled, span-based logging that's aware of async task boundaries, which plain log-crate-based logging is not.

### Metrics (Prometheus)

~~~rust
use metrics::{counter, histogram};

counter!("http_requests_total", "route" => "/checkout", "status" => "200").increment(1);
histogram!("http_request_duration_seconds", "route" => "/checkout").record(elapsed.as_secs_f64());
~~~

The metrics crate (with a Prometheus exporter) is the common choice, tracking the same RED metrics (Rate, Errors, Duration) as any production service.

### Rust-specific signals to watch

- **Allocator behavior**: switching to a faster allocator (mimalloc, jemalloc) can materially change throughput under high allocation pressure — worth benchmarking for allocation-heavy services.
- **tokio-console**: a purpose-built live debugger/monitor for async tasks — shows which tasks are running, blocked, or stuck, invaluable for diagnosing async-specific issues that don't map cleanly onto traditional profiling tools.
- **Panic rate**: any panic reaching production on unexpected input is a bug; track panic occurrences as a first-class alert, not just a crash log line.

### Tracing (OpenTelemetry)

The tracing crate has first-class OpenTelemetry integration (tracing-opentelemetry), so distributed tracing spans propagate naturally through async call chains.
`,

  deployment: `
### The standard: multi-stage Docker producing a tiny static-ish binary

~~~dockerfile
# ---- build stage ----
FROM rust:1.78 AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
# Build dependencies first — this layer caches until Cargo.toml/lock changes
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
COPY src/ src/
RUN touch src/main.rs && cargo build --release

# ---- runtime stage ----
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/myservice /usr/local/bin/myservice
USER nobody
EXPOSE 8080
CMD ["myservice"]
~~~

Why each choice matters: the "build dependencies first with a dummy main.rs" trick caches the (usually slow) dependency compilation step separately from your actual code, so most rebuilds only recompile your crate, not every dependency; a slim Debian base (rather than scratch) is common because Rust binaries are dynamically linked against glibc by default (unless you target musl for a truly static binary), needing SOME base system libraries; non-root user mitigates container-escape impact.

### Fully static binaries (optional, for scratch/distroless images)

~~~bash
rustup target add x86_64-unknown-linux-musl
cargo build --release --target x86_64-unknown-linux-musl
~~~

Building against the musl libc target produces a genuinely static binary with zero dynamic library dependencies, enabling a truly minimal FROM scratch runtime image — the same deployment story as Go, achievable in Rust with an extra explicit step.

### Serving topology

- axum or actix-web on tokio serve production traffic directly; a reverse proxy (nginx, or a cloud load balancer) typically handles TLS termination in front.
- Health endpoints (/healthz, /readyz) wired to orchestrator probes, exactly as with any language.
- Graceful shutdown: handle SIGTERM, stop accepting new connections, let in-flight requests complete before exiting (axum/tokio provide hooks for this).

### CI/CD pipeline

cargo fmt --check → cargo clippy -- -D warnings → cargo test → cargo audit → build (release, possibly cross-compiled) → scan → push → deploy with rolling update. See the **CI/CD** and **GitHub Actions** skills.
`,

  "production-checklist": `
Before a Rust service takes real traffic:

- [ ] Cargo.lock committed; Rust edition and MSRV (minimum supported Rust version) documented
- [ ] cargo fmt --check, cargo clippy -- -D warnings, and cargo test all green in CI, enforced on every PR
- [ ] Built with --release for any performance-sensitive deployment — never ship a debug build
- [ ] Config from env vars, validated at startup, fail-fast on missing/invalid values
- [ ] Structured logging/tracing (the tracing crate) with request/correlation IDs and async-aware spans
- [ ] Explicit timeouts on every outbound HTTP/DB call (reqwest and most clients default to none)
- [ ] No unwrap()/expect() reachable from untrusted/external input in production code paths
- [ ] /healthz and /readyz endpoints wired to orchestrator probes
- [ ] Graceful SIGTERM handling verified (in-flight requests drain before exit)
- [ ] Prometheus metrics: request rate, error rate, p95/p99 latency; panic count as a first-class alert
- [ ] cargo audit run in CI against the RustSec advisory database
- [ ] Any unsafe code audited and, ideally, run under Miri at least once in CI or during development
- [ ] No secrets in code/env files in git; vault or platform secret store
- [ ] Load test done: know your requests/sec ceiling and failure mode
- [ ] Runbook: how to roll back, scale up, and read the dashboards
`,

  "common-mistakes": `
1. **Reaching for .clone() the instant the borrow checker complains** — see Anti-Patterns; often signals a design that hasn't internalized ownership yet, and can hide real costs.
2. **.unwrap()/.expect() in production code paths** reachable from untrusted input — a controllable panic is a denial-of-service vector, not just an inconvenience.
3. **Fighting lifetimes instead of restructuring** — a function returning a reference tied to a temporary value is often better solved by returning an owned value, not by adding more lifetime annotations.
4. **Blocking the async executor**: calling a synchronous, blocking operation inside an async fn stalls that executor thread, silently degrading throughput for every OTHER task scheduled on it.
5. **Overusing Rc<RefCell<T>>** as a general-purpose escape from ownership discipline, rather than reserving it for the specific graph/tree-with-shared-mutable-nodes cases it's actually suited for.
6. **Ignoring cargo clippy warnings** — many flag genuine bugs (needless clones, inefficient patterns, likely-incorrect comparisons), not just style nitpicks.
7. **Shipping debug builds to production** by forgetting --release — an order-of-magnitude performance difference, easy to overlook in a rushed deployment.
8. **Stringly-typed errors** instead of a proper error enum — loses the ability for callers to match on specific failure kinds programmatically.
9. **Premature generics** that make function signatures unreadable before there's a genuine second use case needing the abstraction.
10. **Treating unsafe as a performance shortcut** without profiling first — most performance problems in Rust are algorithmic or allocation-related, solvable in safe Rust.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| value borrowed here after move | Using a value after ownership was moved elsewhere | Clone if a copy is genuinely needed, or restructure so the original isn't moved (borrow instead) |
| cannot borrow as mutable because it is also borrowed as immutable | Violating the aliasing XOR mutability rule | Ensure the immutable borrow's last use ends before the mutable borrow begins (NLL usually handles this automatically once code is restructured slightly) |
| cannot move out of borrowed content | Trying to take ownership of something you only have a reference to | Clone it, or change the function to take ownership (&T to T) if that's actually intended |
| missing lifetime specifier | The compiler can't infer how a returned reference's lifetime relates to the inputs | Add an explicit lifetime parameter connecting the return type to the relevant input |
| the trait bound is not satisfied | A generic function is called with a type that doesn't implement the required trait | Implement the trait for your type, or use a type that already does |
| called Option::unwrap() on a None value (panic) | Extracting a value from Option/Result without checking first | Use ? for propagation, match/if let for explicit handling, or unwrap_or/unwrap_or_else for a fallback |
| use of moved value (in a loop) | A value moved in iteration N is referenced again in iteration N+1 | Clone per-iteration if genuinely needed, or restructure to avoid the repeated move |
| mismatched types: expected &str, found String | Rust's two string types aren't interchangeable in every position | Use &my_string or my_string.as_str() to convert as needed |
| deadlock (hangs, no panic) | Two mutexes locked in inconsistent order across threads, or locking the same mutex twice on one thread | Establish and follow a consistent lock ordering; avoid re-locking an already-held mutex |
| linking with cc failed | Missing system linker/build tools, common on a fresh machine | Install build-essential (Linux) or the platform's C toolchain — Rust itself needs a system linker |

The habit that matters: read the FULL compiler error including its help suggestion, understand which of move/borrow/mutable-borrow is actually happening at the flagged line, and fix the ownership structure rather than reaching for .clone() as a first response.
`,

  faqs: `
**Q: Is Rust too hard to learn for a first systems language?**
It has a genuinely steep initial learning curve — the borrow checker rejects code that would compile fine (if unsafely) in C++, and beginners often "fight the compiler" for the first few weeks. Most engineers report the curve flattens noticeably once ownership genuinely clicks, typically after building a few real (if small) projects.

**Q: Do I need to understand lifetimes deeply to be productive?**
Not immediately — most lifetimes are inferred automatically, and you can be productive writing plenty of real Rust before you need to write an explicit lifetime annotation yourself. Explicit lifetimes become necessary mainly when a function returns a reference whose validity the compiler can't infer alone.

**Q: Is Rust actually as fast as C/C++?**
Generally yes, for equivalent algorithms and optimization effort — Rust and C++ both compile through LLVM and achieve comparable machine code for comparable code, with Rust's safety guarantees adding zero runtime cost in safe code. Some highly hand-tuned C code with specific compiler intrinsics can still edge out equivalent safe Rust in narrow cases, but the general performance parity claim holds up well in practice.

**Q: When should I reach for unsafe?**
Rarely, and only after profiling proves safe Rust genuinely isn't fast enough for a specific measured hot path, or when implementing a low-level primitive (a custom allocator, an FFI boundary) that fundamentally requires it — and even then, wrap it in a safe API so callers never touch unsafe directly.

**Q: Rust or Go for a new infrastructure project?**
Go for faster development velocity, simpler onboarding, and when GC pauses (now quite minimal in modern Go) are acceptable; Rust when memory safety AND top-tier, GC-pause-free performance are both genuinely required (security-critical systems, extremely latency-sensitive services, or anywhere Rust's ecosystem already dominates, like WASM or embedded).

**Q: Is Rust good for AI/ML work?**
Rarely for TRAINING — Python's ecosystem is unmatched there. Rust shows up at the performance-critical edges: tokenizers, inference engines (candle), and infrastructure around models (some vector databases, high-throughput serving layers) where its speed and safety matter more than ML library breadth.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is ownership, in one sentence?* Every value has exactly one owner; when that owner goes out of scope, the value is dropped (freed) automatically and deterministically — no garbage collector needed.
2. *What's the difference between moving and borrowing?* Moving transfers ownership (the original becomes invalid); borrowing (&T or &mut T) grants temporary access without transferring ownership, and the original remains valid.
3. *Why doesn't Rust have null?* Absence is modeled explicitly with Option<T> (Some/None); the compiler forces handling both cases before extraction, eliminating null-pointer-dereference bugs entirely in safe code.
4. *What is the ? operator?* Ergonomic error propagation — if the expression evaluates to Err, ? returns it immediately from the enclosing function; if Ok, it unwraps and continues.
5. *Explain match's exhaustiveness requirement.* The compiler refuses to compile a match that doesn't cover every possible variant of the matched type — unlike a switch statement that can silently fall through an unhandled case in many other languages.

**Senior:**

6. *State the core borrowing rule and explain why it prevents data races.* At any point, a value may have either exactly one mutable reference, or any number of immutable references, never both — enforced at compile time. This directly prevents data races because a race requires at least one writer overlapping with another reader or writer to the same memory, which the rule makes uncompilable.
7. *Explain monomorphization and its tradeoffs.* Generic functions get a fully specialized compiled copy per concrete type used (at compile time), yielding zero-cost dispatch identical to hand-written specialized code, at the cost of longer compile times and larger binaries versus a single dynamically-dispatched implementation.
8. *When would you use dyn Trait instead of a generic (impl Trait / <T: Trait>)?* When you need a heterogeneous collection of different concrete types behind one interface (e.g., Vec<Box<dyn Shape>>), or to avoid excessive monomorphization bloating compile time/binary size for a function called with many different types.
9. *Walk through Send and Sync.* Marker traits the compiler checks automatically: Send means a type's ownership can be safely transferred to another thread; Sync means a reference to it can be safely shared across threads. A type that isn't Send simply cannot compile if moved into thread::spawn's closure — compile-time-enforced thread safety.
10. *Design choice: share mutable state across 100 concurrent async tasks.* Arc<Mutex<T>> (or Arc<RwLock<T>> for read-heavy workloads) for simple shared state; channels (tokio::sync::mpsc) when the pattern is really about passing ownership of discrete units of work between tasks rather than protecting a persistent shared value; discuss lock granularity/sharding if contention becomes a bottleneck.
11. *What does unsafe actually unlock, and what does it NOT disable?* It unlocks five specific capabilities (raw pointer deref, calling unsafe fns, mutable statics, unsafe trait impls, union field access) that the compiler can't verify are safe; it does NOT disable the type system, borrow checker syntax, or turn off safety checks globally — the burden of proof for that specific unsafe operation moves to the programmer.
12. *How would you diagnose a deadlock in a multi-threaded Rust service?* No convenient built-in "list all locks" tool like Go's goroutine dump; typically requires a debugger (gdb/lldb) attached to inspect each thread's stack, or instrumentation added ahead of time (tracing spans around lock acquisition) — discuss establishing a consistent lock-ordering convention as the actual prevention strategy.
`,

  "coding-questions": `
### 1. Thread-safe counter with Arc<Mutex<T>> (tests ownership + concurrency)

~~~rust
use std::sync::{Arc, Mutex};
use std::thread;

fn concurrent_increment(n_threads: usize, increments_per_thread: usize) -> usize {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..n_threads {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            for _ in 0..increments_per_thread {
                let mut num = counter.lock().unwrap();
                *num += 1;
            }
        }));
    }
    for handle in handles {
        handle.join().unwrap();
    }
    *counter.lock().unwrap()
}
~~~

Discussion: why Arc (atomic reference counting, safe to share across threads) is required instead of Rc (single-threaded only — the compiler REJECTS moving an Rc into a spawned thread); follow-up asks about reducing lock contention (sharding the counter, or using an atomic integer type instead for this specific simple case).

### 2. A generic, type-safe stack using ownership (tests generics + Option)

~~~rust
struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Stack { items: Vec::new() }
    }
    fn push(&mut self, item: T) {
        self.items.push(item);
    }
    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }
    fn peek(&self) -> Option<&T> {
        self.items.last()
    }
}

let mut s: Stack<i32> = Stack::new();
s.push(1); s.push(2);
assert_eq!(s.pop(), Some(2));
assert_eq!(s.peek(), Some(&1));
~~~

Discussion: why pop returns Option<T> (owned) but peek returns Option<&T> (borrowed) — matching the actual ownership semantics each operation needs; follow-up: make it iterable by implementing the Iterator trait.

### 3. Rate limiter — token bucket (production-flavored, tests traits + time)

~~~rust
use std::time::Instant;

struct TokenBucket {
    rate: f64,
    capacity: f64,
    tokens: f64,
    last: Instant,
}

impl TokenBucket {
    fn new(rate: f64, capacity: u32) -> Self {
        TokenBucket { rate, capacity: capacity as f64, tokens: capacity as f64, last: Instant::now() }
    }

    fn allow(&mut self) -> bool {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last).as_secs_f64();
        self.tokens = (self.tokens + elapsed * self.rate).min(self.capacity);
        self.last = now;
        if self.tokens >= 1.0 {
            self.tokens -= 1.0;
            true
        } else {
            false
        }
    }
}
~~~

Discussion: Instant (monotonic, immune to system clock changes) versus SystemTime; follow-up asks for a thread-safe version (Arc<Mutex<TokenBucket>>) and a distributed version (Redis + a Lua script for atomicity, same idea as the token-bucket problem in other language pages on this platform).
`,

  "hands-on-labs": `
### Lab 1 — CLI todo app (beginner, ~1h)
Build a todo CLI storing tasks in JSON: add/list/done/delete commands, structs with serde derive macros for serialization, std::fs for storage, proper Result-based error handling throughout (no unwrap() in the main logic). Skills: structs, enums, Option/Result, serde, file I/O.

### Lab 2 — Concurrent web scraper (intermediate, ~2h)
Fetch the status of 200 URLs three ways: sequential (reqwest, blocking), threaded (std::thread + a bounded thread pool), and async (tokio + reqwest's async client with a concurrency limit via a semaphore). Time all three; discuss why async wins for I/O-bound work at this scale. Skills: the entire concurrency landscape, viscerally.

### Lab 3 — A tiny key-value store with a trait-based storage backend (advanced, ~4h)
Define a Storage trait (get/put/delete), implement an in-memory HashMap-backed version and a file-persisted version, wrap it behind a small HTTP API (axum). You'll genuinely understand trait objects and dependency inversion in Rust afterward. Skills: traits, generics vs dyn Trait, axum basics.

### Lab 4 — Instrument, containerize, and deploy (production, ~3h)
Take Lab 2's async scraper, wrap it in an axum service (POST /scrape), add tracing structured logs, Prometheus metrics via the metrics crate, /healthz, a multi-stage Dockerfile (musl target for a fully static binary), and run it in Docker with resource limits. Load test with a tool like oha or drill. Skills: the whole production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **A CLI log-analysis tool** — Parse large log files with zero-copy string slicing where possible, aggregate stats concurrently with rayon, produce a summary report; benchmark against a naive single-threaded version to demonstrate the speedup. Demonstrates: performance-conscious Rust, data parallelism, benchmarking discipline.

2. **An async LLM API gateway** — An axum service that proxies requests to one or more LLM provider APIs, streams responses back over SSE, tracks per-provider cost/latency metrics, retries with backoff, and circuit-breaks on repeated provider failures. Demonstrates: Rust's growing role in high-throughput infrastructure directly adjacent to AI systems — exactly where Rust shows up in real AI-engineering-adjacent stacks.

3. **A from-scratch mini tokenizer** — Implement byte-pair encoding (BPE) tokenization (the algorithm underlying most modern LLM tokenizers) from scratch, benchmark it against Hugging Face's tokenizers crate, and write up where your implementation is slower and why. Demonstrates: genuine understanding of both Rust performance techniques AND a directly AI-relevant algorithm — an unusually strong signal for an AI-engineering-adjacent Rust role.

Each project: proper Cargo workspace structure if multi-crate, cargo clippy and cargo fmt --check clean, a real test suite (cargo test, possibly with proptest for the tokenizer), CI via GitHub Actions, README with an architecture diagram and benchmark numbers. The engineering discipline and the benchmark numbers are what get senior interviews for a Rust-adjacent role specifically — showing you measured, not just claimed, performance matters here more than in most languages.
`,

  "case-studies": `
### Discord: Go to Rust for the Read States service
Discord publicly documented rewriting a latency-sensitive backend service from Go to Rust after observing periodic latency spikes correlated with Go's garbage collector pauses under their specific workload and data-structure shape (a very large LRU cache). The Rust rewrite eliminated the GC-pause-driven tail latency entirely, at the cost of a longer, more involved development process. Lesson: even a well-optimized GC (Go's is genuinely low-pause by industry standards) can still be the wrong tool for a workload with a specific, unusual memory-access pattern — sometimes the fix really is removing the garbage collector, not tuning it.

### Microsoft: memory safety by the numbers
Microsoft's own security engineering team published data attributing roughly 70% of the CVEs they patch annually in C/C++ code to memory-safety issues specifically — a striking, concrete justification (rather than an abstract argument) for adopting Rust in new security-critical Windows components. Lesson: when a company can quantify exactly which bug CLASS costs them the most, "the language prevents that class by construction" becomes a far stronger argument than general performance or ergonomics claims.

### The Linux kernel accepts Rust (2022)
One of computing's most conservative, safety-critical, decades-old C codebases agreeing to accept Rust as a second implementation language for new drivers is a landmark validation — not because the whole kernel is being rewritten (it isn't, and largely won't be), but because a community famously resistant to new tooling concluded Rust's specific safety guarantees were worth the integration cost for NEW, greenfield driver code where memory-safety bugs are historically common and costly. Lesson: adoption in the most conservative corners of an industry is often the strongest signal a technology's core value proposition is real, not hype.

### AWS Firecracker: security-critical infrastructure choosing Rust from day one
AWS built Firecracker (the microVM technology behind Lambda and Fargate's multi-tenant isolation) in Rust from the start, rather than migrating to it — a deliberate bet that memory safety was non-negotiable for infrastructure running untrusted, multi-tenant workloads at that scale. Lesson: for genuinely new, security-critical infrastructure, starting in Rust rather than retrofitting it later is increasingly the default choice at major cloud providers.
`,

  comparisons: `
| Dimension | Rust | Go | C++ | Python |
|-----------|------|-----|-----|--------|
| Memory management | Ownership/borrowing, no GC | Garbage collected | Manual (or smart pointers) | Garbage collected (refcount + GC) |
| Memory safety | Compile-time guaranteed (safe code) | GC prevents use-after-free/leaks, not races by default | Programmer's responsibility entirely | GC prevents most memory bugs |
| Concurrency safety | Compile-time enforced (Send/Sync) — "fearless concurrency" | Runtime-detectable races (go test -race), not compile-time prevented | Entirely programmer's responsibility | GIL limits true parallelism; no compile-time race prevention |
| Compile speed | Slow (monomorphization + LLVM optimization) | Extremely fast | Slow, especially with heavy templates | N/A (interpreted) |
| Runtime performance | Fastest of these (no GC, zero-cost abstractions) | Fast, GC pauses possible under load | Fastest possible with expert tuning | Slowest of these |
| Learning curve | Steep initially (ownership/borrowing) | Gentle | Steep (manual memory + templates) | Gentle |
| Best at | Security-critical systems, performance-critical infra, WASM | Networked services, cloud-native infra, CLIs | Maximum-control systems programming, existing large codebases | AI/data, glue, iteration speed |

**How seniors choose**: Rust when memory safety AND top-tier performance are BOTH non-negotiable (security-critical systems, the hottest performance-sensitive hot paths, embedded/WASM contexts); Go when development velocity and simple deployment matter more than squeezing out the last increment of performance, and GC pauses (now quite minimal) are acceptable; C++ mainly for existing large codebases or specific ecosystems (game engines, some ML training internals) where the switching cost outweighs Rust's safety benefits; Python when ML/data dominates or iteration speed is paramount. A common real-world AI-adjacent shape: Python for training/orchestration, Rust for the specific hot-path components (tokenizers, some inference engines) where both speed and safety genuinely matter.
`,

  "related-technologies": `
- **Cargo** — Rust's build tool and package manager; essentially inseparable from learning the language itself.
- **tokio** — the dominant async runtime; required knowledge for any production async Rust service.
- **axum / actix-web** — the leading web frameworks, both built on tokio.
- **serde** — the de facto standard serialization framework (JSON, and many other formats via the same derive macros) — nearly every Rust project touching structured data uses it.
- **rayon** — data-parallelism made trivial (.iter() to .par_iter()); the standard choice for CPU-bound parallel work.
- **clippy** — the official linter; effectively mandatory in any serious Rust CI pipeline.
- **candle / tokenizers (Hugging Face)** — the direct AI-engineering on-ramp: Rust-based ML tooling with Python bindings.
- **WebAssembly (WASM)** — Rust is one of the best-supported languages for compiling to WASM, a significant and growing use case (browser-side inference, edge compute).
- **Go** — worth comparing directly (see the Go skill); the two languages are frequently discussed together as the leading modern systems/infrastructure languages with very different tradeoffs.

On this platform, the natural next pages: **Concurrency** → **Systems Fundamentals** → **Docker** → whichever **AI Frameworks** page covers Rust-based inference tooling.
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check the Rust blog (blog.rust-lang.org) for anything newer.

- **Rust 2024 edition**: the newest edition boundary, bringing refinements to async ergonomics, lifetime capture rules in return-position impl Trait, and continued cleanup of edge cases accumulated since the 2021 edition — editions remain fully backward-compatible opt-ins, not breaking changes.
- **async fn in traits**: continued stabilization work — a long-requested feature (defining async methods directly in traits without external crate workarounds) that's been landing incrementally rather than all at once, reflecting the genuine complexity of getting the feature right.
- **GATs (Generic Associated Types)**: stabilized, enabling more expressive trait definitions (associated types that are themselves generic) — primarily relevant to library authors building advanced abstractions rather than everyday application code.
- **Ecosystem shifts that matter more than individual language features**: the Rust Foundation's continued independent governance (post-2020) has proven durable, with AWS, Google, Microsoft, and Huawei all maintaining active investment; the Linux kernel's Rust support continues expanding gradually rather than stalling; Hugging Face's tokenizers and candle continue deepening Rust's footprint specifically in AI-adjacent tooling.
- **Compile-time improvements**: ongoing incremental compilation and parallel front-end work continue chipping away at Rust's historically slow build times, though it remains meaningfully slower than Go for comparable codebase sizes.
- **Support and versioning**: Rust ships a new stable release roughly every six weeks; there's no long-term-support branch model — most teams track recent stable releases, pinning a Minimum Supported Rust Version (MSRV) per project rather than a specific exact version.
`,

  "future-roadmap": `
Where Rust is heading over the next few releases:

1. **Async ergonomics keep improving.** async fn in traits and related async-trait ecosystem gaps continue closing, reducing the need for external crates (async-trait) that previously papered over missing language support — expect writing async trait-based abstractions to feel progressively more natural.
2. **Compile times remain a focus area.** Incremental compilation, parallel front-end work, and tooling like sccache continue chipping away at Rust's biggest, most consistently-cited developer-experience complaint — expect steady, not dramatic, improvement here rather than a single fix.
3. **Continued growth in AI-adjacent tooling.** candle, tokenizers, and similar Hugging Face-backed Rust projects signal a durable, growing role for Rust specifically at the performance-critical edges of AI infrastructure (tokenization, some inference paths) rather than displacing Python for training — expect this niche to deepen, not disappear.
4. **The Linux kernel's Rust support expands gradually.** More driver subsystems are likely to gain Rust support over time, a slow but structurally significant validation that compounds rather than a single dramatic rewrite.
5. **WebAssembly remains a growth area.** Rust's strong WASM toolchain support positions it well as browser-side and edge-compute inference (running small models client-side) becomes more common — a genuinely AI-relevant growth vector for the language.

For your career: bet on genuinely internalized ownership/borrowing intuition (not just memorized rules), comfort with the async ecosystem (tokio specifically), and — if AI-adjacent work interests you — familiarity with where Rust already sits in ML tooling (tokenizers, candle) as the most directly relevant entry point. Those separate "knows Rust syntax" from "senior Rust engineer" over the next several years.
`,

  "cheat-sheet": `
~~~rust
// --- Variables & ownership ---
let x = 5;              // immutable by default
let mut y = 10;          // must opt into mutability
let s1 = String::from("hi");
let s2 = s1;              // MOVE — s1 is now invalid

// --- Borrowing ---
fn len(s: &String) -> usize { s.len() }     // immutable borrow
fn push(s: &mut String) { s.push('!'); }     // mutable borrow

// --- Option & Result — no null, explicit errors ---
fn find(id: u32) -> Option<User> { ... }
fn parse(s: &str) -> Result<u32, String> { ... }
match opt { Some(v) => ..., None => ... }
let n = fallible()?;       // propagate Err early, unwrap Ok

// --- Structs & enums ---
struct Point { x: f64, y: f64 }
enum Status { Pending, Active(u32), Done { reason: String } }

// --- Traits ---
trait Shape { fn area(&self) -> f64; }
impl Shape for Circle { fn area(&self) -> f64 { ... } }
fn f(s: &impl Shape) { ... }        // static dispatch (generic)
fn g(s: &dyn Shape) { ... }         // dynamic dispatch (vtable)

// --- Iterators & closures ---
let doubled: Vec<i32> = xs.iter().map(|x| x * 2).collect();
let evens: Vec<&i32> = xs.iter().filter(|&&x| x % 2 == 0).collect();
let add = |a: i32, b: i32| a + b;

// --- Collections ---
let v: Vec<i32> = vec![1, 2, 3];
let mut m: std::collections::HashMap<String, i32> = Default::default();
m.entry(key).or_insert(0);

// --- Concurrency ---
use std::sync::{Arc, Mutex};
use std::thread;
let data = Arc::new(Mutex::new(0));
let d2 = Arc::clone(&data);
thread::spawn(move || { *d2.lock().unwrap() += 1; });

// --- Async ---
async fn fetch() -> Result<Data, Error> { client.get(url).await?.json().await }
// requires an executor, e.g. #[tokio::main] async fn main() { ... }

// --- Smart pointers ---
Box<T>          // heap allocation, single owner
Rc<T>           // reference counted, single-threaded
Arc<T>          // atomic reference counted, thread-safe
RefCell<T>      // interior mutability, checked at runtime

// --- unsafe (rare, deliberate) ---
unsafe { *raw_ptr }

// --- Toolchain ---
// cargo new / cargo build --release / cargo run / cargo test
// cargo clippy / cargo fmt / cargo bench / cargo audit
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| Ownership's core rule | Every value has exactly one owner; it's dropped automatically when that owner goes out of scope |
| Move vs borrow | Move transfers ownership (original invalid); borrow (&T/&mut T) grants temporary access, original stays valid |
| The borrowing rule | One mutable reference XOR any number of immutable references, never both at once, at compile time |
| Why no null in Rust? | Absence is Option<T> (Some/None) — the compiler forces handling both cases |
| What does ? do? | Propagates an Err immediately from the enclosing function; unwraps Ok and continues |
| What is monomorphization? | Generic functions get a fully specialized compiled copy per concrete type — zero-cost, larger binary |
| impl Trait vs dyn Trait | Static dispatch (compiled per type, no runtime cost) vs dynamic dispatch (one copy, vtable, needed for heterogeneous collections) |
| Send / Sync | Marker traits: Send = safe to move ownership across threads; Sync = safe to share a reference across threads |
| What does unsafe actually unlock? | 5 specific capabilities (raw pointer deref, unsafe fn calls, mutable statics, unsafe trait impls, union fields) — not a global safety-off switch |
| Arc<Mutex<T>> is for... | Sharing mutable state safely across multiple threads |
| Rc vs Arc | Rc: single-threaded reference counting; Arc: atomic, thread-safe reference counting |
| What catches undefined behavior in unsafe code? | Miri (cargo +nightly miri run) |
| Why are Rust compile times slow? | LLVM's heavy optimization passes plus monomorphization generating many specialized copies |
| No garbage collector — so what frees memory? | Compiler-inserted Drop calls at the exact point an owner goes out of scope |
| Debug vs release build | Debug: no optimizations, fast compile, slow runtime; release (--release): optimized, slower compile, fast runtime |
`,

  mcqs: `
**1. What happens here?**

~~~rust
let s1 = String::from("hello");
let s2 = s1;
println!("{}", s1);
~~~

A) Prints "hello"  B) Compile error — s1 was moved into s2  C) Runtime panic  D) Prints an empty string

**Answer: B** — assigning a String moves ownership; using s1 afterward is a compile-time error, not a runtime issue.

**2. Which of these violates Rust's borrowing rule and fails to compile?**

A) Two immutable references to the same value at once  B) One mutable reference and no other references  C) One mutable reference AND one immutable reference to the same value at the same time  D) A value with zero active references

**Answer: C** — aliasing XOR mutability: you cannot have a mutable reference coexisting with any other reference (mutable or immutable) to the same data.

**3. What does the ? operator do inside a function returning Result<T, E>?**

A) Ignores errors silently and continues  B) Converts the function into an async function  C) Returns the Err immediately if the expression is Err; otherwise unwraps the Ok value and continues  D) Panics immediately on any Err

**Answer: C** — this is Rust's ergonomic error-propagation operator, not a panic mechanism.

**4. A type does NOT implement the Send trait. What happens if you try to move a value of that type into thread::spawn's closure?**

A) It works fine at runtime but may crash later  B) A compile error — the compiler refuses to compile it  C) A runtime panic on the first access from the new thread  D) It silently clones the value instead of moving it

**Answer: B** — Send/Sync are compile-time-checked marker traits; violating them is a compile error, not a runtime risk.

**5. Which is the correct characterization of dyn Trait vs a generic <T: Trait> parameter?**

A) dyn Trait is always faster  B) Generics use monomorphization (one compiled copy per concrete type, zero-cost); dyn Trait uses a vtable (one copy, small dispatch cost) and is needed for heterogeneous collections  C) They are exactly equivalent in every way  D) dyn Trait cannot be used with structs, only functions

**Answer: B** — this is the core static-vs-dynamic dispatch tradeoff in Rust.

**6. What does unsafe { ... } actually do?**

A) Disables the type system entirely inside the block  B) Disables the borrow checker entirely inside the block  C) Unlocks five specific additional capabilities the compiler cannot verify are safe (e.g., raw pointer dereference), without disabling the rest of Rust's checks  D) Compiles the block with a different, faster but unchecked backend

**Answer: C** — unsafe is a scalpel, not an off switch; ordinary type checking and most borrow-checking still apply inside the block.
`,

  "revision-notes": `
**Language core in 8 lines:** Statically typed, compiled, zero-cost abstractions. Variables immutable by default; let mut opts in. Ownership: one owner per value, freed deterministically via Drop when the owner's scope ends — no garbage collector. Borrowing rule: one mutable reference XOR many immutable references, enforced at compile time. No null — Option<T> models absence explicitly. Errors are Result<T, E>, propagated ergonomically with ?. Enums carry data per variant, matched exhaustively. Traits define shared behavior, implemented explicitly per type.

**Concurrency in 5 lines:** Send/Sync marker traits make thread-safety violations a COMPILE error, not a runtime race — "fearless concurrency" made literal. Arc<Mutex<T>> is the standard pattern for shared mutable state across threads. Channels (std::sync::mpsc, tokio::sync::mpsc) pass ownership of work between threads/tasks. async fn compiles to a state machine requiring an executor (tokio is dominant) — Rust ships no runtime by default. rayon trivially parallelizes CPU-bound iterator chains across cores.

**Internals in 4 lines:** Compiler pipeline: AST → HIR (desugared) → MIR (borrow checking happens HERE) → LLVM IR → native code. Generic functions are monomorphized — one specialized compiled copy per concrete type, zero runtime dispatch cost, larger binary/slower compile as the tradeoff. No garbage collector; Drop calls are inserted by the compiler at the exact point ownership ends.

**Production in 5 lines:** Cargo.lock committed; always --release for performance-sensitive builds. cargo clippy + cargo fmt --check + cargo test green in CI. No unwrap()/expect() reachable from untrusted input. tokio + axum (or actix-web) for async services; explicit timeouts on every outbound call. Multi-stage Docker; musl target for a fully static binary if a scratch image is wanted. cargo audit for supply-chain scanning.

**Interview reflexes:** ownership/move/borrow distinctions, the aliasing-XOR-mutability rule, Option/Result instead of null/exceptions, monomorphization vs dyn Trait dispatch, Send/Sync as compile-time thread-safety, what unsafe actually unlocks (not a global off-switch), why Rust has no GC yet is memory-safe.
`,

  "learning-roadmap": `
A realistic path to senior-level Rust (adjust pace to your background; expect the first few weeks to feel genuinely harder than most languages):

**Week 1–2 — Foundations and ownership.** Beginner Concepts section + Lab 1. Daily: solve small problems using structs, enums, and Option/Result — deliberately hit borrow-checker errors and read the compiler's suggestions fully rather than reaching for .clone(). Milestone: you can explain moves vs borrows to someone else without hedging.

**Week 3–4 — Idiomatic Rust.** Intermediate Concepts: traits, iterators, closures, the ? operator, lifetimes. Refactor Week-1 code to use iterator chains instead of manual loops where natural. Milestone: a borrow-checker error stops feeling mysterious and starts feeling like useful, specific feedback.

**Week 5–6 — Concurrency.** Advanced Concepts + Lab 2 (concurrent scraper). Build something with Arc<Mutex<T>> and something with async/tokio; understand Send/Sync well enough to predict which types can cross a thread boundary. Milestone: the three-way scraper benchmark and a paragraph explaining the results.

**Week 7–8 — Internals + architecture.** Internal Working, Architecture, Data Flow sections; Lab 3 (trait-based key-value store). Read a small real Rust codebase (a popular CLI tool's source). Milestone: you can explain monomorphization and why Rust compiles slower than Go.

**Week 9–10 — Production.** Production Usage → Deployment sections; Lab 4. Milestone: a containerized (ideally musl-static), instrumented service on your GitHub with clippy/fmt/test all green in CI.

**Week 11–12 — Interview polish + first real project.** Interview/Coding Questions sections; start Real Project 2 (async LLM API gateway) or Real Project 3 (mini tokenizer, if AI-focused). Milestone: explain ownership, the borrow checker's aliasing rule, Send/Sync, and monomorphization out loud, unprompted.

Then continue to **Concurrency** and **Systems Fundamentals** on this platform, or the **AI Frameworks** pages covering Rust-based ML tooling if that's your specific direction.
`,

  "official-docs": `
- [The Rust Programming Language ("The Book")](https://doc.rust-lang.org/book/) — the official, genuinely excellent free book; start here, it's better than most paid alternatives.
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) — a runnable-example-driven companion to the Book.
- [The Rustonomicon](https://doc.rust-lang.org/nomicon/) — the deep dive into unsafe Rust specifically; read once you're genuinely working with unsafe code.
- [Standard library documentation](https://doc.rust-lang.org/std/) — thorough, example-rich, and the primary reference for day-to-day work.
- [Rust reference](https://doc.rust-lang.org/reference/) — precise language semantics for when the Book's explanations aren't specific enough.
- [Async Book](https://rust-lang.github.io/async-book/) — the official deep dive into async/await and Futures specifically.
- [This Week in Rust](https://this-week-in-rust.org/) — the community newsletter; the easiest way to track ongoing ecosystem developments.
`,

  books: `
- **The Rust Programming Language** — Steve Klabnik & Carol Nichols. The official book; free online, also published in print; genuinely the best starting point.
- **Programming Rust, 2nd ed.** — Blandy, Orendorff, Tindall. Denser and more systems-programming-focused than the official book; excellent second read.
- **Rust for Rustaceans** — Jon Gjengset. The best "intermediate to advanced" book available; assumes you already know the basics and goes deep on traits, generics, and unsafe.
- **Zero To Production In Rust** — Luca Palmieri. A project-driven, production-web-service-focused book — closest to this page's own Production section, book-length.
- **Rust Atomics and Locks** — Mara Bos. A focused, precise deep dive into low-level concurrency primitives; excellent once you're past the basics and want the real mechanics.
- **Command-Line Rust** — Ken Youens-Clark. Practical CLI-tool-building as a vehicle for learning idiomatic Rust.
`,

  blogs: `
- **The Rust Blog** (blog.rust-lang.org) — official release announcements and language-team retrospectives.
- **This Week in Rust** (this-week-in-rust.org) — the community's weekly digest; the single best way to stay current.
- **fasterthanlime** (fasterthanli.me) — exceptionally clear, deep, and entertaining long-form Rust internals and ecosystem writing.
- **Jon Gjengset's blog and "Crust of Rust" video series** — advanced, precise, systems-level content from the author of Rust for Rustaceans.
- **Amos (fasterthanlime) and Niko Matsakis' blog** (smallcultfollowing.com) — Niko is a core Rust language team member; deep insight into borrow-checker and language-design decisions straight from the source.
- **Discord Engineering Blog** — the Go-to-Rust migration post referenced in Case Studies, plus ongoing Rust production content.
- **AWS Open Source Blog (Rust tag)** — Firecracker and other AWS Rust infrastructure writeups.
`,

  "research-papers": `
Rust-relevant literature worth reading as a senior engineer:

- **"RustBelt: Securing the Foundations of the Rust Programming Language"** (Jung, Jourdan, Krebbers, Dreyer, POPL 2018) — a formal proof that Rust's type system, INCLUDING common unsafe patterns used in the standard library, is actually sound — the closest thing to a rigorous academic validation of Rust's core safety claims.
- **Region-based memory management literature** (Tofte & Talpin's foundational work on regions, 1990s) — the academic lineage Rust's ownership/lifetime system draws on, predating Rust by over a decade.
- **"Oxide: The Essence of Rust"** (Weiss, Patterson, Matsakis, Ahmed, 2019) — a formal core calculus modeling ownership and borrowing, useful for understanding the borrow checker's rules with mathematical precision rather than just intuition.
- **Microsoft Security Response Center's memory-safety data** (published blog posts and talks, not a single formal paper, but widely cited) — the empirical "~70% of CVEs are memory-safety issues" data point that underlies much of Rust's industry adoption argument.
- **"Understanding and Evolving the Rust Programming Language"** (Ralf Jung's PhD thesis, 2020) — a comprehensive, rigorous treatment of Rust's semantics by one of the RustBelt authors; the closest thing to a complete formal account of the language as it actually exists.

For AI-adjacent engineering specifically: papers on high-performance tokenization and inference-serving architecture are more directly relevant to how Rust is actually used in AI infrastructure than general PL-theory papers — Rust's role is almost always at these specific performance-critical edges, not in model architecture itself.
`,

  videos: `
- **Jon Gjengset — "Crust of Rust" series (YouTube)** — long-form, code-along deep dives into specific Rust concepts (lifetimes, subtyping, smart pointers); widely considered some of the best advanced Rust content available for free.
- **Niko Matsakis — various RustConf/language-design talks** — a core Rust language team member explaining borrow-checker and language-evolution decisions directly.
- **"Rust Fundamentals" and "Async Rust"-style talks from RustConf (YouTube, official channel)** — the community's annual conference; browse by year for current-state deep dives.
- **Ryan Levick — Microsoft's Rust content** — practical, well-explained intermediate content, especially around traits and generics.
- **Let's Get Rusty (YouTube)** — accessible, consistently well-produced coverage from beginner through intermediate topics.
- **No Boilerplate (YouTube)** — short, high-production-value videos on specific Rust concepts and ecosystem tools.
`,

  "github-repos": `
- [rust-lang/rust](https://github.com/rust-lang/rust) — the compiler and standard library's own source; genuinely readable in many places, especially for understanding how core types like Vec and Option are implemented.
- [rust-lang/rustlings](https://github.com/rust-lang/rustlings) — small, guided exercises fixing broken code — an excellent, official, hands-on way to build ownership intuition.
- [tokio-rs/tokio](https://github.com/tokio-rs/tokio) — the dominant async runtime; its own source is a masterclass in production-grade async Rust.
- [tokio-rs/axum](https://github.com/tokio-rs/axum) — a well-structured, idiomatic web framework; a good "read a real framework" target.
- [huggingface/tokenizers](https://github.com/huggingface/tokenizers) — the directly AI-relevant example: production tokenization in Rust with Python bindings.
- [huggingface/candle](https://github.com/huggingface/candle) — a minimalist ML framework in Rust, worth reading if AI-adjacent Rust work interests you.
- [BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep) — the famously fast search tool; excellent example of performance-conscious, idiomatic Rust CLI code.
- [rust-unofficial/awesome-rust](https://github.com/rust-unofficial/awesome-rust) — the canonical curated list of Rust libraries and tools by category.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Ownership fluency*: implement a function that takes ownership of a Vec<String>, filters and transforms it, and returns a new Vec<String> — then a second version that borrows instead and returns references, comparing the two designs.
2. *Enums & pattern matching*: model a simple state machine (e.g., a traffic light, or an order lifecycle) as an enum, with a transition function using match that the compiler forces to be exhaustive.
3. *Traits*: define a Serializer trait with a serialize method; implement it for at least two different types; write one function generic over the trait that works with both.
4. *Concurrency*: implement a bounded work queue using std::sync::mpsc channels and a fixed pool of worker threads; then reimplement the same idea with tokio and async tasks, comparing the two.
5. *Error handling*: design a proper error enum (implementing std::error::Error) for a small parser, with distinct variants for different failure kinds, and write code that matches on the specific variant.
6. *Iterators*: implement a custom iterator (impl Iterator for YourType) for a simple data structure (e.g., a linked list or a ring buffer) from scratch.
7. *Unsafe (careful, deliberate practice)*: implement a tiny subset of Vec's functionality (push/pop/get) using raw pointers and manual allocation, then run it under Miri to confirm no undefined behavior.
8. *Testing*: take problem 5's parser and write a proptest-based property test confirming that parsing then re-serializing any valid input round-trips correctly.

External sets: exercism.org's Rust track (excellent mentored feedback specifically calibrated to Rust idioms), Advent of Code (great for algorithmic fluency plus a natural excuse to try iterators/generics), rustlings (official, guided, hands-on).
`,

  "architecture-diagram": `
The reference architecture for a production Rust service sitting at a performance-critical edge of an AI system — the shape you'll build repeatedly if working in this niche:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile/service-to-service)"] --> LB["Load balancer / API gateway"]
    LB --> API1["Rust service pod 1\n(axum on tokio)"]
    LB --> API2["Rust service pod N"]
    API1 & API2 -->|sqlx, async| PG[("PostgreSQL")]
    API1 & API2 --> RD[("Redis\ncache · rate limits")]
    API1 & API2 -->|streamed, timeouts via context| LLM["LLM APIs /\nRust-based inference (candle)"]
    subgraph Build["Build pipeline"]
        Src["src/*.rs"] --> Fmt["cargo fmt --check"]
        Fmt --> Clippy["cargo clippy -- -D warnings"]
        Clippy --> Test["cargo test + cargo audit"]
        Test --> Rel["cargo build --release\n(musl target for static binary)"]
    end
    Rel -.deploys.-> API1
    subgraph Observability
        PR["Prometheus metrics"] --> GF["Dashboards"]
        TR["tracing spans"]
        LG["Structured JSON logs"]
    end
    API1 -.metrics/traces/logs.-> Observability
~~~

Every box has a dedicated skill page on this platform; this diagram is the map of how they compose, with Rust frequently occupying exactly this performance-critical infrastructure layer.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Rust))
    Language
      Ownership & moves
      Borrowing rules
      Option & Result
      Enums & pattern matching
      Traits
    Advanced
      Generics & monomorphization
      dyn Trait & vtables
      Send & Sync
      Smart pointers: Box/Rc/Arc/RefCell
      unsafe & the Nomicon
    Internals
      AST -> HIR -> MIR -> LLVM
      Borrow checker in MIR
      Drop & deterministic cleanup
      No garbage collector
    Concurrency
      Threads: Arc<Mutex<T>>
      Channels: mpsc
      async/await & tokio
      rayon data parallelism
    Production
      Cargo & crates.io
      Testing: cargo test, proptest
      clippy & fmt
      Docker: musl static binary
      cargo audit
    Ecosystem
      axum · actix-web
      serde
      tokenizers · candle
      WebAssembly
    Career
      Interview classics
      Benchmarking discipline
      Reading path
~~~
`,
};

export default rust;
