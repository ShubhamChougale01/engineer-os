import type { SkillContent } from "../types";

/**
 * Go — full 50-section knowledge page.
 * Code blocks use ~~~ fences. No backticks or dollar-brace sequences needed —
 * Go has no template-literal-style string interpolation syntax.
 */
const go: SkillContent = {
  overview: `
Go (often called Golang) is a statically typed, compiled language designed at Google by Robert Griesemer, Rob Pike, and Ken Thompson, first released publicly in 2009. Its entire design philosophy is simplicity as a feature: a small, orthogonal set of language constructs, extremely fast compilation, a built-in concurrency model, and a single static binary as the deployment artifact. Go deliberately omits things other languages consider essential — generics were absent for a decade, there is no exception mechanism, no classical inheritance — in exchange for a language that is easy to read, easy to reason about, and hard to write subtly wrong code in.

For an AI engineer, Go is the language of the infrastructure UNDER the model: Kubernetes, Docker, Terraform, Prometheus, and most of the cloud-native ecosystem are written in Go. It is also increasingly used to build high-throughput API gateways and inference-adjacent services (routing, rate limiting, caching) in front of Python-based model servers, where Go's low memory footprint and true concurrent execution matter more than ML library availability.

Key characteristics: statically and strongly typed with structural interfaces, garbage-collected, compiled to a single native binary with no runtime dependency, CSP-style concurrency via goroutines and channels ("share memory by communicating"), and a standard library so complete that many production services need zero third-party dependencies for HTTP, JSON, or crypto.
`,

  history: `
Go was designed at Google starting in 2007 by **Robert Griesemer**, **Rob Pike**, and **Ken Thompson** — the latter two also co-created Unix and Plan 9. The trigger was frustration with C++ build times and complexity at Google's scale: a single build could take tens of minutes, and the language offered no help managing concurrency across Google's many-core servers.

| Year | Milestone |
|------|-----------|
| 2007 | Design begins at Google; frustration with C++ build times is the core motivator |
| 2009 | Go announced publicly and open-sourced |
| 2012 | Go 1.0 — the compatibility promise begins: code written for 1.0 still compiles today |
| 2015 | Go 1.5 — the compiler and runtime are rewritten from C into Go itself (self-hosting) |
| 2015 | Docker (already wildly popular, written in Go) cements Go's association with cloud infrastructure |
| 2017 | Kubernetes' explosive growth further cements Go as THE cloud-native language |
| 2018 | Go modules introduced (go.mod) — finally a real, built-in dependency management story |
| 2020 | Go 1.14 — production-ready module support becomes default |
| 2022 | Go 1.18 — **generics** land after years of debate (type parameters, constraints) |
| 2023 | Go 1.21 — the min/max/clear builtins, improved generic type inference |
| 2024 | Go 1.22 — loop variable semantics fixed (each iteration gets its own variable — a decades-old footgun removed) |
| 2025+ | Continued generics ecosystem maturation; iterator functions (range-over-func) stabilizing |

Go's "compatibility promise" (nothing written for Go 1.0 breaks on later 1.x releases) is a deliberate, unusual commitment among modern languages — it trades some evolution speed for near-zero migration pain, the opposite tradeoff from, say, Python 2→3.
`,

  "why-it-exists": `
Go exists because Google, at massive scale, faced a specific triple bind that no existing language solved well simultaneously:

1. **C++**: fast and powerful, but slow to compile at scale (a full Google build could take tens of minutes) and dense with complexity (templates, multiple inheritance, manual memory management) that made large teams slower, not faster, over time.
2. **Java**: better tooling and safety than C++, but a heavyweight runtime (JVM), verbose ceremony, and a concurrency model (threads + locks) that was easy to get wrong.
3. **Python/dynamic languages**: fast to write, but no static types at Google's scale meant refactor risk and no compile-time safety net, plus meaningfully slower execution for infrastructure workloads.

Rob Pike, Ken Thompson, and Robert Griesemer's answer: design a language from first principles for **the actual problem Google engineers faced daily** — building networked, concurrent server software, compiled fast enough that a large team never waits, simple enough that any engineer can read any other engineer's code without decoding clever abstractions.

The concurrency piece deliberately borrows Tony Hoare's **Communicating Sequential Processes (CSP)** — instead of shared memory protected by locks, Go encourages goroutines that communicate over channels: "Do not communicate by sharing memory; instead, share memory by communicating." This single design choice explains most of what makes Go's concurrency model feel different from threads-and-mutexes in Java or C++.
`,

  "problem-it-solves": `
Go solves the **build-speed and cognitive-load-at-scale problem** for networked infrastructure software specifically — not general-purpose "do everything" versatility.

Concretely, Go removes:

- **Slow builds**: Go's dependency model and simple type system compile enormous codebases in seconds, not minutes — a deliberate design constraint, not an accident.
- **Concurrency footguns**: goroutines are cheap (a few KB of stack, growable) compared to OS threads, and channels give a structured, race-detector-friendly way to coordinate them — instead of every engineer hand-rolling locks.
- **Dependency hell and deployment complexity**: a Go binary is a single, statically linked executable with no runtime to install on the target machine — copy it to a server or a scratch Docker image and it just runs.
- **"Too many ways to do it" fatigue**: Go has one loop construct (for), one way to handle errors (explicit return values), no operator overloading, no implicit type conversions — reading unfamiliar Go code is unusually predictable.

What Go deliberately does **not** solve: expressiveness for complex domain modeling (no algebraic data types until you approximate them with interfaces), a rich generics ecosystem to rival Rust's or Haskell's (generics arrived only in 2022 and remain intentionally restrained), or GUI/scientific-computing/ML training workloads, where Python's ecosystem dominates. Go's answer to "I need more expressiveness" is usually "you probably don't, write it plainly" — a genuine design philosophy, not a limitation nobody noticed.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Write idiomatic Go: explicit error handling, interfaces, structs with methods, and Go's specific formatting/naming conventions.
2. Explain goroutines and channels precisely, and design a concurrent program using CSP-style patterns instead of locks-first thinking.
3. Use Go's generics (type parameters and constraints) appropriately, without over-generalizing simple code.
4. Understand how the Go runtime schedules goroutines onto OS threads (the M:N scheduler) and how the garbage collector works.
5. Structure a production Go project: modules, package layout, and the standard project conventions the ecosystem expects.
6. Test with the standard "testing" package (table-driven tests, benchmarks) and profile with pprof.
7. Build and deploy a Go service as a minimal static binary in a scratch or distroless Docker image.
8. Answer senior-level interview questions on the scheduler, channels vs mutexes, interface satisfaction, and escape analysis.
`,

  prerequisites: `
- **Required**: basic programming literacy — variables, loops, functions in any language. Go's syntax is small enough to genuinely start from zero here.
- **Helpful**: command-line basics (see the **Linux** skill) for running go build/go run and managing GOPATH/modules.
- **For internals/concurrency sections**: familiarity with the general idea of threads and concurrency (from any language) makes goroutines and channels click faster, though CSP is explained from first principles here.

Dependency links: **Linux** (shell, processes) → this page → **Docker**, **Kubernetes**, **Concurrency**, and **Distributed Systems** all build directly on Go fluency — it is, not coincidentally, the language most of that infrastructure is written in.
`,

  "beginner-concepts": `
### Your first program and package structure

~~~go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
~~~

Every Go file belongs to a package; package main with a main() function is what go build turns into an executable. There is no build tool config to write for a simple program — go run main.go just works.

### Variables and types

~~~go
var name string = "Ada"
var age int = 36
pi := 3.14159          // := infers the type — the idiomatic local-variable form
active := true

const MaxRetries = 3    // compile-time constant
~~~

Go is statically typed — once name is a string, it can never become an int. Unlike Python, there's no dynamic retyping; unlike Java, var name string = "Ada" can usually be shortened to name := "Ada" and the compiler infers string.

### Core collections

~~~go
langs := []string{"go", "python", "rust"}   // slice — dynamic-length array view
ranks := map[string]int{"go": 1, "python": 2} // map — hash table

langs = append(langs, "zig")     // append returns a NEW slice header — reassign it
ranks["rust"] = 3
value, ok := ranks["java"]        // the "comma ok" idiom — ok is false if missing
~~~

Rule of thumb: slices are the default sequence type (arrays with a fixed size are rare in everyday code); maps are unordered — never rely on iteration order.

### Control flow and functions

~~~go
func describe(n int) string {
    if n < 0 {
        return "negative"
    } else if n == 0 {
        return "zero"
    }
    return "positive"
}

for i := 0; i < 3; i++ {          // the classic C-style for
    fmt.Println(i)
}
for i, lang := range langs {      // range — Go's only iteration keyword
    fmt.Println(i, lang)
}
~~~

Go has exactly one looping keyword: for. There is no while, no do-while — for with no condition is Go's infinite loop, and for with just a condition is Go's while.

### Explicit error handling

~~~go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("cannot divide %v by zero", a)
    }
    return a / b, nil
}

result, err := divide(10, 0)
if err != nil {
    fmt.Println("error:", err)
    return
}
fmt.Println(result)
~~~

Go has no exceptions (well — it has panic/recover for truly exceptional situations, covered in Advanced Concepts, but ordinary errors are just values). Every fallible function returns an error as its last value, and checking if err != nil immediately after the call is the single most common pattern you will type in Go.

### Structs and methods

~~~go
type Point struct {
    X, Y float64
}

func (p Point) Distance(other Point) float64 {   // method with a VALUE receiver
    dx, dy := p.X-other.X, p.Y-other.Y
    return math.Sqrt(dx*dx + dy*dy)
}

p1 := Point{X: 0, Y: 0}
p2 := Point{X: 3, Y: 4}
fmt.Println(p1.Distance(p2))   // 5
~~~

Common beginner trap: forgetting that append can return a different underlying array than the slice you passed in — covered fully in Anti-Patterns.
`,

  "intermediate-concepts": `
### Interfaces — Go's structural typing

~~~go
type Shape interface {
    Area() float64
}

type Circle struct{ Radius float64 }
func (c Circle) Area() float64 { return math.Pi * c.Radius * c.Radius }

type Square struct{ Side float64 }
func (s Square) Area() float64 { return s.Side * s.Side }

func totalArea(shapes []Shape) float64 {
    var sum float64
    for _, s := range shapes {
        sum += s.Area()
    }
    return sum
}
~~~

Interfaces are satisfied **implicitly** — Circle never declares "implements Shape"; it simply has an Area() float64 method, which is enough. This is Go's version of structural typing, and it's the single most important idiom for writing testable, decoupled Go code.

### Goroutines — lightweight concurrency

~~~go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)   // "go" launches a goroutine — a few KB stack, not an OS thread
    }
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)
    for a := 1; a <= 9; a++ {
        fmt.Println(<-results)
    }
}
~~~

A goroutine costs roughly 2KB of stack (growable) versus megabytes for an OS thread — spawning tens of thousands is routine. The Go runtime multiplexes goroutines onto a much smaller number of OS threads (the M:N scheduler, covered in Internal Working).

### Channels and select

~~~go
ch1 := make(chan string)
ch2 := make(chan string)

go func() { ch1 <- "from ch1" }()
go func() { ch2 <- "from ch2" }()

select {
case msg1 := <-ch1:
    fmt.Println(msg1)
case msg2 := <-ch2:
    fmt.Println(msg2)
case <-time.After(1 * time.Second):
    fmt.Println("timeout")
}
~~~

select is Go's multi-way channel operation — it waits on whichever channel becomes ready first, and the time.After pattern is the idiomatic way to add a timeout to any concurrent operation.

### Error wrapping

~~~go
func loadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("loading config from %s: %w", path, err)   // %w wraps the original error
    }
    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parsing config: %w", err)
    }
    return &cfg, nil
}

// callers can inspect the wrapped chain:
if errors.Is(err, os.ErrNotExist) { ... }
var pathErr *fs.PathError
if errors.As(err, &pathErr) { ... }
~~~

%w preserves the original error inside a new one; errors.Is and errors.As walk that chain — this is Go's answer to exception hierarchies, built entirely out of plain values and two stdlib functions.

### Defer, panic, and recover

~~~go
func readFile(path string) (err error) {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()   // guaranteed to run when readFile returns, however it returns

    defer func() {
        if r := recover(); r != nil {   // recover only works inside a deferred function
            err = fmt.Errorf("recovered from panic: %v", r)
        }
    }()
    // ... risky work that might panic ...
    return nil
}
~~~

defer schedules a call to run when the surrounding function returns — the standard tool for cleanup (closing files, unlocking mutexes). panic/recover is Go's rare escape hatch for truly unexpected situations (a corrupted invariant), not a substitute for ordinary error returns.

### JSON and struct tags

~~~go
type User struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email,omitempty"\`
}

data, _ := json.Marshal(User{ID: 1, Name: "Ada"})
// {"id":1,"name":"Ada"}   — Email omitted because omitempty + zero value

var u User
json.Unmarshal(data, &u)
~~~
`,

  "advanced-concepts": `
### Generics (type parameters and constraints)

~~~go
type Number interface {
    ~int | ~int64 | ~float64   // ~ permits any type whose UNDERLYING type matches
}

func Sum[T Number](items []T) T {
    var total T
    for _, item := range items {
        total += item
    }
    return total
}

Sum([]int{1, 2, 3})        // T inferred as int
Sum([]float64{1.5, 2.5})   // T inferred as float64
~~~

Go's generics arrived deliberately late (2022, Go 1.18) and remain intentionally restrained compared to C++ templates or Rust's trait system — constraints are interfaces, and the standard library's slices and maps packages are the canonical example of when generics genuinely reduce duplication (one Sort function instead of one per type).

### The scheduler's GMP model

Go's runtime scheduler multiplexes **G**oroutines onto **M** (OS threads) via **P** (logical processors, one per GOMAXPROCS-configured CPU core):

~~~mermaid
flowchart TB
    subgraph Runtime["Go runtime scheduler"]
        P1["P (processor 1)\nlocal run queue"] --> M1["M (OS thread)"]
        P2["P (processor 2)\nlocal run queue"] --> M2["M (OS thread)"]
        GlobalQ["Global run queue"]
        P1 -.steals work.-> P2
        GlobalQ -.feeds.-> P1
        GlobalQ -.feeds.-> P2
    end
    G1["goroutine"] --> P1
    G2["goroutine"] --> P1
    G3["goroutine"] --> P2
~~~

When a goroutine blocks on a syscall, the runtime detaches its M and hands the P to another available (or newly created) M so other goroutines keep running — this is why blocking I/O in Go doesn't stall unrelated goroutines the way it would in a naive one-thread-per-request model. Work-stealing between P's local queues keeps cores balanced.

### Race conditions and the race detector

~~~go
var counter int
var wg sync.WaitGroup
for i := 0; i < 1000; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        counter++   // DATA RACE — unsynchronized read-modify-write
    }()
}
wg.Wait()
~~~

~~~bash
go test -race ./...   # or: go run -race main.go
~~~

The race detector instruments memory access at runtime and reliably catches this class of bug in tests — running it in CI is close to mandatory for any concurrent Go codebase. The fix is either a sync.Mutex around the shared counter or, more idiomatically, restructuring so only one goroutine owns the counter and others send it updates over a channel.

### Escape analysis

~~~go
func newPoint() *Point {
    p := Point{X: 1, Y: 2}   // does this escape to the heap, or stay on the stack?
    return &p                 // returning its address FORCES a heap allocation
}
~~~

~~~bash
go build -gcflags="-m" main.go   # prints escape analysis decisions
~~~

The compiler decides, per-variable, whether it can safely live on the stack (freed automatically when the function returns) or must escape to the heap (because a pointer to it survives the function, as above) — understanding this is the difference between "why is my hot path allocating so much" and knowing exactly why.

### Context for cancellation and deadlines

~~~go
func fetchWithTimeout(ctx context.Context, url string) ([]byte, error) {
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
    defer cancel()
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}
~~~

context.Context is Go's standard mechanism for propagating cancellation, deadlines, and request-scoped values through a call chain — every well-behaved concurrent or network-facing Go function accepts a ctx as its first parameter.

### Memory model and sync primitives

- **sync.Mutex / sync.RWMutex**: classic locks, used when channels would be more ceremony than the problem warrants (protecting a simple shared counter or cache).
- **sync.WaitGroup**: wait for a fixed set of goroutines to finish.
- **sync.Once**: run initialization exactly once, safely, across concurrent callers.
- **atomic package**: lock-free primitives for simple counters/flags — faster than a mutex for trivial cases, easy to misuse for anything complex.
`,

  "internal-working": `
The Go toolchain turns source into a native binary in stages, all invoked transparently by go build:

~~~mermaid
flowchart LR
    A["source .go files"] --> B["Parser → AST"]
    B --> C["Type checker"]
    C --> D["SSA IR + optimization\n(escape analysis, inlining)"]
    D --> E["Machine code generation\n(per-architecture backend)"]
    E --> F["Linker → single static binary"]
~~~

1. **Parse & type-check**: source becomes an AST, then every expression's type is verified — Go's type checker is comparatively simple (no generics-driven inference explosion like C++ templates), which is a deliberate reason compilation stays fast.
2. **SSA (Static Single Assignment) intermediate representation**: the compiler's own IR, where optimizations like escape analysis, inlining, and dead-code elimination happen.
3. **Code generation**: SSA lowers to machine code for the target architecture (amd64, arm64, and many others) — Go is a genuinely cross-compiling toolchain: GOOS=linux GOARCH=arm64 go build produces a Linux ARM binary from any host, no separate toolchain install needed.
4. **Linking**: by default, Go statically links everything (including the runtime and garbage collector) into one binary — this is why a Go program can run in an empty scratch Docker image with zero shared libraries.

**The garbage collector**: Go uses a concurrent, tri-color mark-and-sweep collector designed to keep pause times in the sub-millisecond range even for large heaps, running concurrently with your program's goroutines rather than stopping everything ("stop-the-world" pauses are now minimized to brief bookkeeping phases). This low-pause-time design is deliberate: Go targets latency-sensitive network services, where a multi-second GC pause is unacceptable.

**The runtime scheduler** (the GMP model from Advanced Concepts) is itself part of what gets compiled into your binary — there is no separate "Go runtime" you install on the target machine; it ships inside your executable.

Other implementations: **gccgo** (GCC-based, sometimes better optimization for specific targets, slower to track new language features), **TinyGo** (targets microcontrollers and WebAssembly with a much smaller runtime footprint).
`,

  architecture: `
A senior engineer thinks about Go at two levels: the **runtime architecture** (how goroutines actually execute) and the **application architecture** (how a Go service is organized).

### Runtime architecture

~~~mermaid
flowchart TB
    subgraph Process["Go process (one OS process)"]
        subgraph Sched["GMP scheduler"]
            P1["P1"] --> M1["OS thread"]
            P2["P2"] --> M2["OS thread"]
        end
        Heap["Shared heap\n(goroutine stacks + heap objects)"]
        GC["Concurrent tri-color GC"]
    end
    G1["thousands of goroutines"] --> Sched
    Sched --> Heap
    GC --> Heap
~~~

Key facts: a single Go process typically runs with GOMAXPROCS set to the number of CPU cores, and the scheduler fans out potentially tens of thousands of goroutines across a small, fixed number of OS threads — true parallelism (not just concurrency) up to your core count, with no explicit thread pool code required from you.

### Application architecture (production Go service)

The standard layout used by mature Go teams (informally called "Standard Go Project Layout"):

~~~
myservice/
├── go.mod                  # module definition + dependency versions
├── cmd/
│   └── myservice/
│       └── main.go         # thin entrypoint: wiring only, no logic
├── internal/                # code only THIS module can import (compiler-enforced)
│   ├── api/                 # HTTP handlers, request/response types
│   ├── service/             # business logic
│   ├── repository/          # data access behind interfaces
│   └── config/              # env parsing
└── pkg/                      # code intended for external import (if any)
~~~

Rules: internal/ is not a convention — the Go compiler literally refuses to let other modules import it, enforcing encapsulation at the language level. Dependencies point inward (api → service → repository), and repositories are interfaces so tests substitute fakes without a mocking framework.
`,

  "data-flow": `
What happens when you run **go run main.go** (or the compiled binary directly):

~~~mermaid
sequenceDiagram
    participant OS
    participant Bin as Go binary
    participant Sched as GMP Scheduler
    participant GC as Garbage Collector

    OS->>Bin: exec ./myservice
    Bin->>Sched: runtime initializes: create Ps (GOMAXPROCS), main goroutine
    Sched->>Sched: schedule main() onto an M
    Bin->>Bin: main() spawns goroutines (go func(){...})
    Sched->>Sched: distribute goroutines across Ps/Ms, work-steal as needed
    Bin->>GC: allocations trigger concurrent GC cycles as needed
    Bin-->>OS: exit code
~~~

For an HTTP request in a Go web service, the data flow is: a TCP connection arrives → net/http's server accepts it, spawning (or reusing) a goroutine to handle it → your handler function runs, potentially spawning more goroutines for concurrent sub-work → the response is written back to the connection. Because net/http gives each request its own goroutine by default, one slow handler does NOT block other requests — a structural advantage over single-threaded event-loop models when your workload has real CPU work interleaved with I/O.

The most misunderstood part for newcomers: **channel closing and range**. Closing a channel (close(ch)) does not delete it or stop goroutines reading from it — it signals "no more values are coming," and a for range over a channel exits cleanly only once the channel is both closed AND drained. Forgetting to close a channel a range loop depends on is the single most common cause of a goroutine leak.
`,

  "production-usage": `
### Modules and dependency management

~~~bash
go mod init github.com/you/myservice   # creates go.mod
go get github.com/gin-gonic/gin@latest
go mod tidy                             # sync go.mod/go.sum with actual imports
go build ./...
go vet ./...                            # static analysis, catches real bugs
~~~

Non-negotiables for production:

1. **go.sum committed** — cryptographic checksums pinning every dependency's exact content, verified on every build.
2. **A specific Go version pinned** in go.mod's go directive — reproducible builds across machines and CI.
3. **go vet and a linter (golangci-lint) in CI** — catches a real class of bugs (unreachable code, suspicious struct tags, shadowed variables) beyond what the compiler alone flags.

### Configuration

Read config from environment variables or flags, validated at startup — fail fast on missing/invalid config, exactly as in any other production language.

### Long-running services

- net/http's default server is production-capable on its own for many services — Go's standard library HTTP server is genuinely used directly in production, unlike, say, Python's development server.
- Always set http.Server timeouts explicitly (ReadTimeout, WriteTimeout, IdleTimeout) — the zero-value defaults are "no timeout," a real production risk.
- Handle SIGTERM for graceful shutdown: http.Server.Shutdown(ctx) drains in-flight requests before exiting.
- GOMAXPROCS should match the container's CPU limit in containerized deployments (Go 1.5+ defaults to the host's core count, which can be wrong inside a cgroup-limited container — the automaxprocs library or Go 1.21+'s cgroup-aware runtime handles this correctly).
`,

  "industry-examples": `
- **Google**: Go's creator and still one of its largest users — significant portions of Google's internal infrastructure and several public products run on Go.
- **Docker**: written entirely in Go; Docker's explosive adoption in the mid-2010s was a major factor in establishing Go as THE language of container tooling.
- **Kubernetes**: also Go, and arguably the single biggest driver of Go adoption industry-wide — nearly every company running Kubernetes ends up with Go-literate infrastructure engineers by necessity.
- **HashiCorp** (Terraform, Consul, Vault, Nomad): their entire infrastructure tooling suite is Go, prized for single-binary distribution and cross-platform builds.
- **Cloudflare**: uses Go extensively for networking-adjacent services where its combination of performance and safety (versus C) and simplicity (versus Java's ceremony) fits well.
- **Uber**: large-scale Go adoption for backend services, and the source of several widely used open-source Go tooling projects (e.g., their style guide and some popular libraries).
- **Netflix, Twitch, Dropbox**: all run significant Go in their infrastructure and backend service layers, typically for high-throughput networked services.

Pattern to notice: Go's adoption is heavily concentrated in **infrastructure and networked-services** roles — the exact niche it was designed for — rather than general application development, data science, or ML training, where Python still dominates.
`,

  "best-practices": `
1. **Check every error immediately** after the call that can produce it — if err != nil is not boilerplate to minimize, it's the core of Go's error-handling philosophy.
2. **Accept interfaces, return concrete types** — a function should ask for the narrowest interface it needs (better testability) but return a concrete struct (clearer for callers).
3. **Keep the internal/ boundary real** — put anything not meant for external import behind it; let the compiler enforce your encapsulation.
4. **Use gofmt and goimports without exception** — Go's tooling formats code identically everywhere; there is no formatting debate to have.
5. **Prefer composition over inheritance** — Go has no classical inheritance; embed structs/interfaces deliberately, not as a reflex.
6. **Pass context.Context explicitly as the first parameter** to any function doing I/O or long-running work; never store it in a struct field.
7. **Design concurrency around channels for coordination, mutexes for simple protected state** — don't reach for goroutines and channels when a plain function call would do.
8. **Table-driven tests** for anything with more than one input/output case — Go's idiomatic test style.
9. **Run go vet, staticcheck (or golangci-lint), and go test -race in CI** on every commit.
10. **Keep functions short and interfaces small** — the standard library's io.Reader (one method) is the canonical example of Go's "small interfaces compose better" philosophy.
`,

  "anti-patterns": `
### The append-aliasing surprise

~~~go
func addItem(items []int, item int) []int {
    return append(items, item)   // MAY or may not reuse the caller's backing array
}

original := make([]int, 3, 5)   // len 3, cap 5 — room to grow without reallocating
modified := addItem(original, 99)
// original's underlying array was just SILENTLY mutated in place, because
// there was spare capacity — a classic source of "who changed this?" bugs

func addItemSafe(items []int, item int) []int {
    result := make([]int, len(items), len(items)+1)
    copy(result, items)
    return append(result, item)
}
~~~

append reuses the existing backing array when there's spare capacity, and allocates a new one when there isn't — this makes slice aliasing bugs load-bearing on capacity, not just length, which is exactly why they're subtle.

### Other production-grade anti-patterns

- **Ignoring errors with a bare underscore** (_, _ = doSomething()) — the compiler lets you discard any error; discipline, not the type system, prevents this.
- **Goroutine leaks**: launching a goroutine that blocks forever on an unbuffered channel nobody will ever send to or close — each leaked goroutine holds memory and (if it's blocked on I/O) potentially a connection, forever.
- **Overusing panic for ordinary error handling** — panic/recover is for truly unexpected situations; using it for expected failure paths (a missing config key) fights the language's own conventions.
- **Interface pollution**: defining an interface before there's a second implementation "just in case" — Go's convention is to define interfaces at the CONSUMER, not the producer, and only once genuinely needed.
- **Copying a struct containing a sync.Mutex** — mutexes must not be copied after first use; copying the struct copies the lock state, producing broken synchronization that compiles fine and fails at runtime.
- **Storing context.Context in a struct field** instead of passing it explicitly through call chains — breaks cancellation propagation and the standard convention.
- **Naked returns in long functions** — return with no values, relying on named return variables set earlier — legal but a genuine readability trap in anything but very short functions.
`,

  performance: `
### Rule zero: measure first

~~~bash
go test -bench=. -benchmem ./...      # microbenchmarks with allocation counts
go tool pprof http://localhost:6060/debug/pprof/profile   # live CPU profile via net/http/pprof
go tool pprof http://localhost:6060/debug/pprof/heap      # live memory profile
~~~

net/http/pprof is a standard-library package you import for its side effect (registering profiling HTTP endpoints) — production-safe, low-overhead, and the standard first step for "why is this Go service slow."

### The performance hierarchy (apply in order)

1. **Better algorithm / data structure** — the same universal rule as any language; a map lookup beats a linear scan regardless of how fast the language is.
2. **Reduce allocations** — check go build -gcflags="-m" or benchmark -benchmem output; every heap allocation is GC pressure. Reuse buffers (sync.Pool), preallocate slices with known capacity (make([]T, 0, n)).
3. **Avoid unnecessary goroutines** for trivial work — goroutine creation and scheduling has real (if small) overhead; don't spawn one per tiny unit of work in a hot loop.
4. **Batch I/O** — fewer, larger reads/writes beat many small ones, exactly as in any language.
5. **Profile-guided optimization (PGO)** — Go 1.21+ supports feeding a production CPU profile back into the compiler to guide inlining decisions for real workload hot paths.
6. **Tune GOGC / GOMEMLIMIT** for GC-heavy workloads — raising GOGC trades memory for fewer GC cycles; GOMEMLIMIT sets a soft memory ceiling the GC respects.

### Micro-level facts worth knowing

- Passing large structs by value copies them; use pointer receivers for methods that mutate or for genuinely large structs.
- String concatenation in a loop should use strings.Builder, not +=, to avoid repeated reallocation.
- Slice capacity growth roughly doubles (for smaller slices) — preallocating with make([]T, 0, expectedLen) avoids repeated reallocation entirely when the size is known upfront.
- Interface values carrying a concrete type incur a small indirection cost versus calling a concrete method directly — usually irrelevant, occasionally worth flattening in a proven hot path.
`,

  scalability: `
Go services scale the same way any networked service does — **horizontally** — with Go-specific strengths in both directions.

### Single machine

~~~mermaid
flowchart LR
    LB["Load balancer"] --> S1["Go binary (process 1)\nGOMAXPROCS = N cores"]
    LB --> S2["Go binary (process 2)"]
    S1 & S2 --> DB[("PostgreSQL")]
    S1 & S2 --> RD[("Redis")]
~~~

Because Go's scheduler already uses all available CPU cores within a single process (unlike Python's GIL-bound single interpreter), a Go service often needs FEWER processes per machine than an equivalent Python/Node service to saturate the hardware — one appropriately-configured Go process can genuinely use every core.

### Beyond one machine

- **Stateless services + externalized state**: same discipline as any language — keep session/cache state in Redis/Postgres so any instance serves any request, then scaling is just more containers behind a load balancer.
- **Goroutines as the concurrency primitive at every layer**: a single Go service instance can hold open tens of thousands of concurrent connections (long-polling, streaming, WebSocket) cheaply — this is a large part of why Go is common for API gateways and proxies sitting in front of slower backend services.
- **gRPC and Protocol Buffers**: Go has first-class, high-performance gRPC support, making it a natural choice for internal service-to-service communication at scale (see the gRPC skill).

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| GC pause impact on P99 latency | Tune GOGC/GOMEMLIMIT; reduce allocation rate; the concurrent GC already minimizes stop-the-world time |
| Too many goroutines blocked on a slow downstream | Bounded worker pools / semaphores (buffered channel as a semaphore) instead of unbounded goroutine-per-request |
| Cross-service calls fanning out | gRPC with connection pooling and deadlines (context.WithTimeout) propagated end to end |
| CPU-bound hot path | Profile with pprof; consider PGO; occasionally hand-optimize with less abstraction in that one path |
`,

  security: `
### Go-specific dangers

1. **Struct tag / reflection-based deserialization surprises**: encoding/json ignores unknown fields silently by default — if you need strict validation, use a decoder with DisallowUnknownFields() or a schema-validation library.
2. **SQL injection**: exactly as dangerous as in any language — always use parameterized queries (database/sql's ? or $1 placeholders), never fmt.Sprintf a query string with user input.
3. **Command injection via os/exec**: exec.Command(name, args...) with args as a slice does NOT go through a shell by default — this is actually SAFER than shell-based invocation in other languages, but exec.Command("sh", "-c", userInput) reintroduces the exact same risk; avoid the shell entirely when possible.
4. **Path traversal**: concatenating user input into a filesystem path (filepath.Join(base, userInput)) can still escape base via ../ sequences — validate/clean paths and check the result stays within the intended directory.
5. **Goroutine-based resource exhaustion**: an HTTP handler that spawns unbounded goroutines per request under attacker-controlled load can exhaust memory — bound concurrency explicitly (worker pools, semaphores).

### Cryptography

- Use the standard library's crypto/* packages directly — Go's crypto stdlib is production-grade and used by significant portions of the internet's TLS infrastructure.
- Never implement your own crypto primitives; crypto/rand (not math/rand) for anything security-sensitive — math/rand is deterministic and unsuitable for tokens/keys.
- golang.org/x/crypto/bcrypt (or argon2) for password hashing — never a raw hash function.

### Supply chain

- go.sum pins exact content hashes for every dependency; go mod verify checks them against the module cache.
- govulncheck (official Go vulnerability scanner) checks your actual call graph against known CVEs — lower false-positive rate than dependency-list-only scanners, since it accounts for whether vulnerable code is actually reachable.
- Beware typosquatted module paths exactly as with any package ecosystem.

See the dedicated **SQL Injection**, **OWASP Top 10**, and **Secrets Management** skills for depth beyond what's Go-specific.
`,

  testing: `
The standard library's **testing** package is the ecosystem default — no third-party test framework is required, though testify is a common addition for richer assertions.

~~~go
// pricing_test.go
package pricing

import "testing"

func TestApplyDiscount(t *testing.T) {
    got := ApplyDiscount(100, 10)
    if got != 90 {
        t.Errorf("ApplyDiscount(100, 10) = %v, want 90", got)
    }
}

func TestApplyDiscountTable(t *testing.T) {
    cases := []struct {
        name           string
        price, percent float64
        want           float64
    }{
        {"no discount", 100, 0, 100},
        {"full discount", 100, 100, 0},
        {"partial", 59.99, 15, 50.99},
    }
    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got := ApplyDiscount(tc.price, tc.percent)
            if math.Abs(got-tc.want) > 0.01 {
                t.Errorf("got %v, want %v", got, tc.want)
            }
        })
    }
}
~~~

**Table-driven tests** (the second example) are THE idiomatic Go testing pattern — one test function, a slice of cases, t.Run for named subtests.

### Benchmarks

~~~go
func BenchmarkApplyDiscount(b *testing.B) {
    for i := 0; i < b.N; i++ {
        ApplyDiscount(100, 10)
    }
}
~~~

~~~bash
go test -bench=. -benchmem
~~~

### The senior testing doctrine

- Test through **exported functions and interfaces**, not internal implementation — survives refactors.
- Prefer **fakes implementing an interface** over mocking frameworks — Go's implicit interface satisfaction makes hand-written fakes trivial and idiomatic.
- go test -race in CI on every commit for anything concurrent — non-negotiable for production Go.
- go test -cover for coverage; aim for meaningful coverage of business logic, not 100% of trivial code.
- httptest.NewServer for testing HTTP clients against a real (local) server without touching the network.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the panic stack trace bottom-up** — like most languages, the deepest frame in YOUR code is usually the actual cause; Go's panic output includes goroutine IDs, useful when several are involved.
2. **fmt.Printf/log.Printf** for quick inspection — Go has no interactive debugger built into the language the way Python has pdb, but:
3. **delve (dlv)** — the standard Go debugger; dlv debug ./cmd/myservice, breakpoints, step, print variables, inspect goroutines.

~~~bash
dlv debug ./cmd/myservice
(dlv) break main.processOrder
(dlv) continue
(dlv) print order
(dlv) goroutines          # list all goroutines — invaluable for concurrency bugs
~~~

4. **go tool pprof** for a live goroutine dump (goroutine profile) — instantly shows every goroutine's stack, the fastest way to diagnose "why is this service hung" (usually: a goroutine blocked forever on a channel nobody will send to).
5. **go test -race** as a debugging tool, not just a CI gate — reproduce a suspected race locally with it enabled.
6. **GODEBUG environment variable** — exposes runtime internals (GC traces via GODEBUG=gctrace=1, scheduler traces) without any code changes.

### Debugging goroutine leaks

- runtime.NumGoroutine() sampled over time in a long-running process — a steadily climbing count with no plateau is a leak.
- The goroutine pprof profile groups goroutines by their current stack — a large group all blocked at the same channel receive line is your leak's exact location.
`,

  monitoring: `
Production Go visibility rests on the same three pillars as any language (see the Observability category for depth), with Go-specific tooling:

### Structured logging

~~~go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
logger.Info("order_placed",
    "order_id", order.ID,
    "user_id", user.ID,
    "amount_cents", order.Total,
)
~~~

log/slog (standard library since Go 1.21) provides structured, leveled, JSON-capable logging without a third-party dependency — before 1.21, zap and zerolog were (and remain) popular for the same reason.

### Metrics (Prometheus)

~~~go
import "github.com/prometheus/client_golang/prometheus"

var requests = prometheus.NewCounterVec(
    prometheus.CounterOpts{Name: "http_requests_total"},
    []string{"route", "status"},
)
requests.WithLabelValues("/checkout", "200").Inc()
~~~

The Prometheus Go client is the de facto standard — unsurprising, since Prometheus itself is written in Go and the ecosystem grew up together.

### Runtime-specific signals to watch

- **Goroutine count** (runtime.NumGoroutine(), or exposed via expvar/pprof) — a leading indicator of leaks.
- **GC pause time and frequency** (GODEBUG=gctrace=1, or the runtime/metrics package) — spikes here directly hit tail latency.
- **GOMAXPROCS vs actual container CPU limit** — a common, easy-to-miss misconfiguration in Kubernetes deployments.

### Tracing (OpenTelemetry)

Go has first-class OpenTelemetry support; combined with context.Context propagation (which every well-written Go function already threads through), distributed tracing integrates naturally into existing code.
`,

  deployment: `
### The standard: multi-stage Docker producing a tiny static binary

~~~dockerfile
# ---- build stage ----
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# CGO_ENABLED=0 -> a fully static binary with no libc dependency
RUN CGO_ENABLED=0 GOOS=linux go build -o /myservice ./cmd/myservice

# ---- runtime stage ----
FROM scratch
COPY --from=builder /myservice /myservice
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
ENTRYPOINT ["/myservice"]
~~~

Why each choice matters: CGO_ENABLED=0 produces a binary with zero dynamic library dependencies, letting the runtime stage be FROM scratch — literally nothing but your binary and CA certificates, an image that can be a few megabytes total and has essentially no attack surface because there's no shell, no package manager, nothing else present to exploit.

### Serving topology

- net/http's server is production-grade directly; a reverse proxy (nginx, or a cloud load balancer) typically sits in front for TLS termination and routing, not because Go's server is inadequate.
- Health endpoints (/healthz, /readyz) wired into Kubernetes liveness/readiness probes, exactly as with any language.
- Graceful shutdown: catch SIGTERM, call server.Shutdown(ctx) to drain in-flight requests before exiting — Kubernetes sends SIGTERM before SIGKILL, and Go services should honor the grace period.

### CI/CD pipeline

vet + lint (golangci-lint) → test (go test -race -cover) → build (cross-compiled if needed via GOOS/GOARCH) → scan (govulncheck, container image scan) → push → deploy with rolling update. See the **CI/CD** and **GitHub Actions** skills.
`,

  "production-checklist": `
Before a Go service takes real traffic:

- [ ] go.mod + committed go.sum; Go version pinned in the go directive
- [ ] go vet, golangci-lint, go test -race all green in CI, enforced on every PR
- [ ] Config from env vars, validated at startup, fail-fast on missing/invalid values
- [ ] Structured JSON logging (log/slog or zap/zerolog) with request/correlation IDs
- [ ] http.Server timeouts explicitly set (ReadTimeout, WriteTimeout, IdleTimeout) — never rely on the zero-value defaults
- [ ] context.Context propagated and honored for cancellation/timeouts on every outbound call
- [ ] /healthz and /readyz endpoints wired to orchestrator probes
- [ ] Graceful SIGTERM handling verified (server.Shutdown, in-flight requests drain)
- [ ] Prometheus metrics: request rate, error rate, p95/p99 latency; goroutine count and GC stats
- [ ] Error tracking (Sentry or equivalent) with release tagging
- [ ] CGO_ENABLED=0 static binary in a scratch/distroless image; govulncheck run in CI
- [ ] No secrets in code/env files in git; vault or platform secret store
- [ ] GOMAXPROCS correctly reflects the container's actual CPU limit
- [ ] Load test done: know your requests/sec ceiling and failure mode
- [ ] Runbook: how to roll back, scale up, and read the dashboards
`,

  "common-mistakes": `
1. **Ignoring the return value of append** — items = append(items, x) is required; append(items, x) alone silently discards the (possibly reallocated) new slice.
2. **The slice-aliasing surprise**: see Anti-Patterns; appending to a slice with spare capacity mutates the caller's backing array.
3. **Copying a struct containing a sync.Mutex** — breaks the mutex; the compiler won't catch it, go vet sometimes will.
4. **Goroutine leaks**: launching a goroutine that blocks forever with nothing left to unblock it — each leak is permanent, cumulative memory/resource loss.
5. **Loop variable capture** (fixed as a language default in Go 1.22, but relevant for anyone reading older code or targeting an older version): pre-1.22, all goroutines launched inside a for loop shared the SAME loop variable, so they'd often all see its final value.
6. **Not checking errors at all**: err is just a value; nothing forces you to check it, and skipping the check is a silent, compiler-invisible bug factory.
7. **Comparing errors with == instead of errors.Is**: wrapped errors (%w) are not == to the original — errors.Is/errors.As walk the chain correctly.
8. **Using panic for ordinary control flow** — reserve it for truly unrecoverable situations; ordinary failures are error returns.
9. **Overusing interfaces "for testability" before there's a real second implementation** — Go convention is define interfaces at the point of use, when actually needed.
10. **Forgetting defer runs at function return, not block end** — deferring inside a loop that runs many iterations accumulates all the deferred calls until the FUNCTION exits, not the loop iteration, which can exhaust resources (e.g., deferred file closes inside a loop over thousands of files).
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| all goroutines are asleep - deadlock! | Every goroutine (including main) is blocked with nothing left to unblock any of them | Trace the channel sends/receives; ensure every send has a corresponding receive and vice versa |
| nil pointer dereference (panic) | Dereferencing a *T that was never initialized (its zero value is nil) | Check for nil before use; ensure constructors always return a valid pointer or an error |
| assignment to entry in nil map | Writing to a map declared but never initialized with make() or a literal | Initialize with make(map[K]V) or a map literal before writing |
| index out of range | Accessing a slice/array index >= its length | Bounds-check before indexing; prefer range iteration when possible |
| fatal error: concurrent map read and map writes | Unsynchronized concurrent access to a plain map from multiple goroutines | Use sync.Map, or protect a plain map with a sync.RWMutex |
| import cycle not allowed | Two packages import each other, directly or transitively | Extract the shared piece into a third package both can import |
| declared and not used | A local variable is declared but never referenced (a compile ERROR in Go, not a warning) | Remove it, or use _ = variable if intentionally unused during development |
| context deadline exceeded | An operation didn't complete before its context's timeout/deadline | Increase the timeout if legitimate, or investigate why the downstream call is slow |
| use of closed channel (panic on send) | Sending to a channel after it was already closed | Only the sender should close a channel, and never send after closing it |
| unexpected EOF / connection reset | A peer closed the connection mid-read/write, common under load or misconfigured timeouts | Set explicit http.Server/http.Client timeouts; handle io.EOF and io.ErrUnexpectedEOF explicitly |

The habit that matters: read the full panic trace (including goroutine IDs for concurrency bugs), reproduce with go test -race when concurrency is involved, and fix the actual synchronization gap rather than adding a sleep to "fix" a race.
`,

  faqs: `
**Q: Is Go a good first language to learn?**
It's an unusually good SECOND or THIRD language — its small, orthogonal design makes it fast to pick up once you already know basic programming concepts from any language, but its explicit error handling and lack of generics-heavy abstraction mean it teaches fewer advanced language concepts than, say, learning Python or JavaScript first would.

**Q: Why does Go make me handle every error explicitly? Isn't that just boilerplate?**
It's a deliberate design choice: errors are ordinary values, visible in every function signature, impossible to silently swallow the way an uncaught exception can slip through in other languages. Many experienced Go engineers consider the "boilerplate" a fair trade for never being surprised by an exception from ten stack frames away.

**Q: Should I use channels or mutexes for concurrency?**
Channels for coordinating and communicating BETWEEN goroutines (pipelines, fan-out/fan-in, signaling completion); mutexes for protecting simple shared state accessed by many goroutines that don't need to communicate, just avoid stepping on each other. Rob Pike's guidance: "Don't communicate by sharing memory; share memory by communicating" — but Go gives you both tools because sometimes a mutex really is simpler.

**Q: Are Go's generics as powerful as Rust's or C++'s?**
No, deliberately. Go's generics (type parameters + interface constraints) cover the common cases (generic containers, generic algorithms like Sort/Map/Filter) without the compile-time metaprogramming power of C++ templates or the trait system depth of Rust — this is an intentional simplicity tradeoff, not an oversight.

**Q: Is Go good for machine learning?**
Not for training — Python's ecosystem (PyTorch, JAX, the entire research tooling stack) is unmatched there. Go shows up around the EDGES of ML systems: serving infrastructure, data pipelines, and API gateways in front of Python-based model servers, where its concurrency model and deployment simplicity shine.

**Q: What Go version should I target?**
The latest stable release for new projects; Go's strong backward-compatibility promise means there's little reason to lag except organizational inertia. Go has no long-term-support branching model — track recent stable releases.
`,

  "interview-questions": `
**Junior/Mid:**

1. *How does Go handle errors, and why no exceptions?* Errors are ordinary return values, checked explicitly with if err != nil; this makes failure paths visible in every signature rather than hidden in an invisible control-flow path, at the cost of more explicit checking code.
2. *What is a goroutine, and how is it different from an OS thread?* A goroutine is a lightweight, runtime-managed unit of concurrent execution with a small growable stack (~2KB start); the Go scheduler multiplexes many goroutines onto far fewer OS threads, so spawning thousands is cheap where thousands of OS threads would not be.
3. *What is a channel, and what's the difference between buffered and unbuffered?* A typed conduit for passing values between goroutines. An unbuffered channel send blocks until a receiver is ready (synchronous handoff); a buffered channel send only blocks once the buffer is full.
4. *How does Go achieve polymorphism without classical inheritance?* Interfaces, satisfied implicitly and structurally — any type with the required methods satisfies the interface, with no explicit "implements" declaration.
5. *What does the := operator do?* Short variable declaration with type inference; only valid inside function bodies, not at package scope, where var is required.

**Senior:**

6. *Explain the GMP scheduler model.* Goroutines (G) are scheduled onto logical processors (P, one per GOMAXPROCS) which run on OS threads (M); when a goroutine blocks on a syscall, its M detaches and the P is handed to another M so unrelated goroutines keep running; work-stealing balances load across P's local run queues.
7. *How does Go's garbage collector work, and why does it matter for latency?* A concurrent, tri-color mark-and-sweep collector designed to minimize stop-the-world pause time, running mostly alongside your program's goroutines; this matters because Go targets latency-sensitive networked services where multi-second GC pauses (common in some other managed runtimes under heavy load) would be unacceptable.
8. *Walk through a subtle slice-aliasing bug.* append reuses the backing array when capacity allows, so a function receiving and appending to a slice can silently mutate the CALLER's underlying array if there was spare capacity — discuss the fix (always allocate a fresh backing array when the function must not have side effects on the caller's slice).
9. *Design choice: rate-limit 10,000 concurrent goroutines calling a downstream API with a max concurrency of 50.* A buffered channel of size 50 used as a semaphore (acquire by sending, release by receiving), or golang.org/x/sync/semaphore/errgroup for a cleaner API with error propagation and cancellation via context.
10. *How would you diagnose a goroutine leak in a running production service?* Sample runtime.NumGoroutine() over time for a steadily rising count; pull the goroutine pprof profile to see stack traces grouped by blocking point; the group with the most goroutines blocked at the same line is almost always the leak's exact source.
11. *What's the difference between a value receiver and a pointer receiver on a method?* A value receiver operates on a COPY of the struct (safe, but mutations don't persist and large structs are copied each call); a pointer receiver operates on the original (mutations persist, no copy overhead) — mixing receiver types on the same type's methods is a common footgun with interface satisfaction.
12. *Explain escape analysis and its performance implications.* The compiler determines, per variable, whether it can stay on the stack (freed automatically, cheap) or must escape to the heap (because a reference to it outlives the function, requiring GC-managed allocation); understanding which of your allocations escape is central to reducing GC pressure in hot paths.
`,

  "coding-questions": `
### 1. Bounded worker pool with a semaphore (tests channels + goroutines)

~~~go
func processAll(urls []string, maxConcurrency int) []Result {
    sem := make(chan struct{}, maxConcurrency)   // buffered channel as a counting semaphore
    results := make([]Result, len(urls))
    var wg sync.WaitGroup

    for i, url := range urls {
        wg.Add(1)
        go func(i int, url string) {
            defer wg.Done()
            sem <- struct{}{}        // acquire
            defer func() { <-sem }() // release
            results[i] = fetch(url)
        }(i, url)
    }
    wg.Wait()
    return results
}
~~~

Complexity discussion: why struct{} (zero bytes) is the idiomatic semaphore token type; follow-up asks how to add per-request timeouts via context.WithTimeout, and how to stop early on the first error.

### 2. LRU cache (tests generics + composition)

~~~go
type node[K comparable, V any] struct {
    key  K
    val  V
    prev, next *node[K, V]
}

type LRUCache[K comparable, V any] struct {
    cap   int
    items map[K]*node[K, V]
    head, tail *node[K, V]   // sentinel nodes simplify edge cases
}

func NewLRUCache[K comparable, V any](capacity int) *LRUCache[K, V] {
    head, tail := &node[K, V]{}, &node[K, V]{}
    head.next, tail.prev = tail, head
    return &LRUCache[K, V]{cap: capacity, items: make(map[K]*node[K, V]), head: head, tail: tail}
}
// Get/Put implementations follow the classic doubly-linked-list + hash map pattern
~~~

Discussion: generic type parameters [K comparable, V any] (K must support == for map keys); follow-up: make it goroutine-safe with a sync.Mutex, being careful not to copy the struct.

### 3. Fan-out/fan-in pipeline (tests channel composition)

~~~go
func fanOut(in <-chan int, n int) []<-chan int {
    outs := make([]<-chan int, n)
    for i := 0; i < n; i++ {
        out := make(chan int)
        outs[i] = out
        go func() {
            defer close(out)
            for v := range in {
                out <- v * v   // square each number, distributed across n workers
            }
        }()
    }
    return outs
}

func fanIn(chans ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for _, c := range chans {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(c)
    }
    go func() { wg.Wait(); close(out) }()
    return out
}
~~~

Discussion: this is the canonical Go concurrency pattern for parallelizing a pipeline stage; follow-up asks about preserving input order (harder — usually means tagging values with their original index).
`,

  "hands-on-labs": `
### Lab 1 — CLI todo app (beginner, ~1h)
Build a todo CLI storing tasks in JSON: add/list/done/delete commands using flag or a small arg parser, structs with json tags, os.ReadFile/WriteFile for storage. Skills: structs, error handling, file I/O, JSON.

### Lab 2 — Concurrent URL checker (intermediate, ~2h)
Fetch the status of 200 URLs three ways: sequential, with a fixed worker pool (channels + goroutines), and with an unbounded goroutine-per-URL approach guarded by a semaphore. Time all three; discuss the tradeoffs. Deliverable: a table of timings and resource usage. Skills: the entire concurrency model, viscerally.

### Lab 3 — Mini HTTP router from scratch (advanced, ~4h)
Implement a small HTTP router: path pattern matching with parameters, middleware chaining, JSON request/response helpers — all on top of net/http, no external router library. You will genuinely understand Gin/Chi/Echo afterward. Skills: interfaces, closures, the http.Handler interface, middleware patterns.

### Lab 4 — Instrument and deploy (production, ~3h)
Take Lab 2's concurrent checker, wrap it in an HTTP service (POST /check), add slog structured logs, Prometheus metrics, /healthz, a scratch-based multi-stage Dockerfile, and run it in Docker with resource limits. Load test with hey or vegeta. Skills: the whole production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Log aggregation and alerting service** — Ingest structured logs over a socket or file tail, parse and aggregate metrics (rolling error rate, latency percentiles) concurrently, expose a small HTTP query API, alert via webhook on threshold breach. Demonstrates: concurrent data processing, channel-based pipelines, production HTTP service design.

2. **A rate-limited LLM API gateway** — A Go service sitting in front of one or more LLM provider APIs: per-client rate limiting (token bucket), request/response logging with cost tracking, circuit-breaking on provider failures, and streaming pass-through of SSE responses. Demonstrates: Go's strength as an infrastructure layer directly in front of AI systems — exactly the role Go plays in real AI-adjacent production stacks.

3. **A distributed job queue from scratch** — Redis-backed job queue: enqueue with priorities, a worker pool consuming jobs concurrently, heartbeat-based dead-worker detection, at-least-once delivery semantics, a small monitoring dashboard. Demonstrates: concurrency, distributed-systems thinking, Redis client usage in Go.

Each project: standard Go project layout (cmd/internal), full go vet + golangci-lint + race-tested test suite, CI via GitHub Actions, README with an architecture diagram. The engineering discipline around the code is what gets senior interviews, exactly as with any language on this platform.
`,

  "case-studies": `
### Docker: the single biggest Go adoption catalyst
Docker's choice of Go (2013) for a tool that needed to ship as one dependency-free binary across countless Linux distributions was close to perfect-fit engineering: static linking meant "download one file, run it," no runtime install, no version conflicts with the host's installed languages. Docker's runaway popularity is widely credited as the single biggest driver of Go's adoption in infrastructure tooling industry-wide. Lesson: a language's deployment model can be as decisive a factor as its syntax or performance.

### Kubernetes: Go at extreme scale and complexity
Kubernetes (Go, 2014) demonstrated Go could handle not just simple CLI tools but a genuinely enormous, deeply concurrent distributed system — the API server, controllers, and scheduler are all Go, coordinating enormous amounts of concurrent state reconciliation. Lesson: Go's simplicity claims held up even as the SYSTEM built with it became one of the most complex pieces of infrastructure software in existence — complexity moved into the architecture, not the language.

### Cloudflare: Go replacing C in the network path
Cloudflare has published extensively about moving performance- and safety-critical networking code from C to Go, citing memory safety (no manual memory management bugs) at a performance cost they found acceptable for most of their workloads, reserving hand-tuned C/assembly only for the very hottest paths. Lesson: "good enough performance with dramatically fewer memory-safety bugs" is frequently the correct engineering tradeoff, even when a faster systems language exists.

### The Go 1.18 generics debate
Go famously shipped without generics for nearly a decade, a deliberate simplicity-first stance that drew constant criticism. When generics finally arrived (2022), the design was notably restrained compared to peers — interface-based constraints, no operator overloading, no specialization tricks. Lesson: a language team can hold a controversial design line for years, then ship the feature anyway, in a form still consistent with the language's original philosophy rather than bolted on reactively.
`,

  comparisons: `
| Dimension | Go | Rust | Java | Python | Node.js |
|-----------|-----|------|------|--------|---------|
| Typing | Static, structural interfaces | Static, powerful (traits, ownership) | Static, verbose, nominal | Dynamic + optional hints | Dynamic (TS fixes it) |
| Memory management | Garbage collected | Ownership/borrowing, no GC | Garbage collected (JVM) | Garbage collected (refcount + GC) | Garbage collected (V8) |
| Concurrency model | Goroutines + channels (CSP), true parallelism | Fearless concurrency via ownership; async or threads | Threads (virtual threads in 21+) | asyncio (GIL-bound) or multiprocessing | Event loop + workers |
| Compile speed | Extremely fast | Slow, especially with heavy generics/macros | Moderate | N/A (interpreted) | N/A (interpreted/JIT) |
| Runtime performance | Fast, near-native | Fastest of these (no GC pauses) | Fast (JVM JIT, warms up) | Slowest of these | Fast (V8 JIT) |
| Deploy artifact | Single static binary | Single static binary | JAR + JVM | Env + interpreter | Bundle + node runtime |
| Best at | Cloud-native infra, networked services, CLIs | Systems programming, safety-critical hot paths | Enterprise scale, mature ecosystems | AI/data, glue, iteration speed | Full-stack JS sharing |

**How seniors choose**: Go for networked infrastructure services, CLIs, and anywhere a small static binary and simple deployment matter; Rust when memory safety AND top-tier performance are both non-negotiable (kernels, embedded, the hottest hot paths); Python when ML/data is involved or iteration speed dominates; Java/JVM languages for large enterprise codebases with deep existing tooling investment. A common real-world shape: Python for model training and orchestration, Go for the infrastructure and API layer around it, occasionally Rust for a specific hand-optimized hot path.
`,

  "related-technologies": `
- **Docker** — written in Go; also the deployment target Go's static-binary model is unusually well suited for.
- **Kubernetes** — written in Go; the single largest reason infrastructure engineers learn Go today.
- **gRPC** — Go has first-class, high-performance support; the standard choice for internal service-to-service RPC in Go shops.
- **Terraform** — HashiCorp's infrastructure-as-code tool, written in Go, another major reason to learn it if working in cloud/DevOps.
- **Prometheus** — written in Go; its official client library is the standard metrics instrumentation choice for Go services.
- **PostgreSQL / Redis drivers** (pgx, go-redis) — the standard data-layer libraries for Go backend services.
- **Protocol Buffers** — Go's protoc-gen-go tooling is mature and commonly paired with gRPC.
- **delve** — the standard Go debugger, essential once fmt.Println debugging stops being enough.
- **golangci-lint** — the de facto standard linter aggregator for Go CI pipelines.

On this platform, the natural next pages: **Docker** → **Kubernetes** → **gRPC** → **Distributed Systems** → **Concurrency**.
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check go.dev/doc/devel/release for anything newer.

- **Go 1.22** (Feb 2024): fixed the decades-old for-loop variable capture footgun — each iteration now gets its own variable by default, eliminating a very common goroutine-in-a-loop bug class; also introduced range-over-integer (for i := range 10) and early support for range-over-func iterators.
- **Go 1.23** (2024): full stabilization of range-over-func iterators (custom iterator types usable directly with for range), and continued generics ecosystem maturation (the slices and maps standard library packages built on generics).
- **Go 1.24** (expected 2025): continued refinement of generic type inference, further tooling and performance improvements to the module system and build cache. Verify specifics on the official release notes.
- **Ecosystem shifts that matter more than individual language features**: log/slog (structured logging, stdlib since 1.21) has reduced reliance on third-party logging libraries for new projects; govulncheck has become a standard CI step; PGO (profile-guided optimization, stable since 1.21) is seeing increasing production adoption for hot-path-heavy services.
- **Support window**: Go officially supports the two most recent major releases; there's no long-term-support branch model — track recent stable releases rather than pinning far behind.
`,

  "future-roadmap": `
Where Go is heading over the next few releases:

1. **Iterators mature further.** Range-over-func (custom iterator types working directly with for range, stabilized in 1.23) opens a new idiom for lazy, composable data processing without needing channels or manually-managed state — expect more of the standard library and popular third-party packages to expose iterator-based APIs.
2. **Generics ecosystem deepens.** The initial 2022 generics release was deliberately restrained; expect continued refinement of type inference ergonomics and gradual growth of genuinely useful generic standard-library and community packages, without the language adopting more exotic generics features (specialization, higher-kinded types) that would compromise Go's compile-speed and simplicity priorities.
3. **PGO (profile-guided optimization) becomes more routine.** As tooling around capturing and feeding back production profiles matures, expect PGO to shift from "advanced technique" to "standard CI step" for performance-sensitive services.
4. **Continued cloud-native centrality.** As Kubernetes, service meshes, and cloud-native tooling keep growing, Go's position as the default language for that entire layer looks structurally secure — this is less about new language features and more about ecosystem gravity compounding.
5. **The compatibility promise holds.** Go's core commitment — code written today keeps compiling on future 1.x releases — is unlikely to change; expect careful, additive evolution rather than any breaking redesign.

For your career: bet on genuinely fluent concurrency (goroutines, channels, the scheduler model, the race detector) and comfort with the cloud-native ecosystem (Kubernetes, gRPC, Docker) — those separate "knows Go syntax" from "senior Go engineer who ships reliable concurrent systems" over the next several years.
`,

  "cheat-sheet": `
~~~go
// --- Variables & types ---
var name string = "Ada"
age := 36                          // type inference, function-local only
const Max = 100

// --- Collections ---
xs := []int{1, 2, 3}; xs = append(xs, 4)
m := map[string]int{"a": 1}
v, ok := m["b"]                    // comma-ok idiom

// --- Functions & multiple returns ---
func divide(a, b float64) (float64, error) {
    if b == 0 { return 0, fmt.Errorf("divide by zero") }
    return a / b, nil
}

// --- Structs, methods, interfaces ---
type Shape interface { Area() float64 }
type Circle struct{ R float64 }
func (c Circle) Area() float64 { return math.Pi * c.R * c.R }

// --- Error handling ---
if err != nil { return fmt.Errorf("context: %w", err) }
errors.Is(err, target); errors.As(err, &target)

// --- Goroutines & channels ---
go doWork()
ch := make(chan int, 10)           // buffered channel
ch <- 1; v := <-ch; close(ch)
for v := range ch { ... }
select {
case v := <-ch1:
case <-time.After(time.Second):
}

// --- Sync primitives ---
var mu sync.Mutex
mu.Lock(); defer mu.Unlock()
var wg sync.WaitGroup
wg.Add(1); go func() { defer wg.Done() }(); wg.Wait()

// --- Context ---
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

// --- Generics ---
func Sum[T int | float64](xs []T) T { ... }

// --- Defer / panic / recover ---
defer f.Close()
defer func() { if r := recover(); r != nil { ... } }()

// --- Toolchain ---
// go run main.go / go build / go test -race -cover ./...
// go vet ./... / go mod tidy / go tool pprof <profile>
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| How does Go handle errors? | Ordinary return values checked with if err != nil — no exceptions for normal control flow |
| What is a goroutine? | A lightweight, runtime-scheduled concurrent function with a small growable stack (~2KB start) |
| Goroutines vs OS threads | Goroutines are far cheaper; the Go scheduler multiplexes many onto few OS threads (GMP model) |
| Channels vs mutexes | Channels coordinate/communicate between goroutines; mutexes protect simple shared state |
| How are interfaces satisfied? | Implicitly and structurally — any type with the required methods satisfies the interface |
| What does append do to capacity? | Reuses the backing array if capacity allows (aliasing risk); allocates new otherwise |
| What's context.Context for? | Propagating cancellation, deadlines, and request-scoped values through a call chain |
| defer runs when? | When the surrounding FUNCTION returns, not at the end of the enclosing block |
| What catches data races? | go test -race / go run -race — instruments memory access at runtime |
| What's CGO_ENABLED=0 for? | Produces a fully static binary with no libc dependency — enables scratch/distroless images |
| Go's one loop keyword | for — no while, no do-while; for alone is the infinite loop |
| What arrived in Go 1.18? | Generics — type parameters and interface-based constraints |
| What did Go 1.22 fix? | For-loop variable capture — each iteration now gets its own variable |
| Comma-ok idiom | value, ok := m[key] — ok is false if the key is absent |
| GC design goal | Concurrent, tri-color mark-and-sweep, minimizing stop-the-world pause time |
`,

  mcqs: `
**1. What happens here?**

~~~go
func addOne(items []int) []int {
    return append(items, 1)
}
a := make([]int, 2, 5)   // len 2, cap 5
b := addOne(a)
~~~

A) b and a always share the same backing array  B) b may share a's backing array because there's spare capacity  C) A compile error — capacity mismatch  D) A always gets copied, never shared

**Answer: B** — with spare capacity, append reuses the existing array; this is exactly the aliasing subtlety covered in Anti-Patterns.

**2. Which statement about goroutines and OS threads is TRUE?**

A) Every goroutine gets its own OS thread  B) The Go scheduler multiplexes many goroutines onto a smaller number of OS threads  C) Goroutines cannot run in true parallel, only concurrently  D) GOMAXPROCS controls the number of goroutines allowed to exist

**Answer: B** — the GMP model does exactly this; GOMAXPROCS controls logical processors (P's), not a goroutine count limit, and goroutines DO run in true parallel across cores.

**3. What does close(ch) do?**

A) Deletes the channel immediately  B) Signals no more values will be sent; a range over it exits once drained  C) Blocks until all goroutines reading from it finish  D) Panics if any goroutine is still reading

**Answer: B** — closing signals completion; reading a closed, drained channel returns the zero value and ok=false, and range exits cleanly.

**4. Which tool detects unsynchronized concurrent access to shared memory?**

A) go vet  B) go build -race  C) go test -race (or go run -race)  D) gofmt

**Answer: C** — the race detector is enabled via the -race flag on test or run (build -race also works, producing a race-instrumented binary).

**5. A struct containing a sync.Mutex is copied by value. What happens?**

A) Nothing — Go automatically deep-copies mutex state safely  B) The copy's lock state is independent and likely broken, since mutexes must not be copied after first use  C) A compile error  D) A runtime panic immediately on copy

**Answer: B** — this compiles fine and fails silently/subtly at runtime; go vet can sometimes catch this specific pattern, but it's not guaranteed.

**6. What is the idiomatic way to add a timeout to an outbound call in Go?**

A) time.Sleep before the call  B) A goroutine racing against time.After with no cancellation  C) context.WithTimeout passed into the call and honored by the callee  D) Retrying in a loop until it succeeds

**Answer: C** — context.Context is the standard, composable mechanism; it propagates through call chains and the callee (e.g. an HTTP client) checks/honors it directly.
`,

  "revision-notes": `
**Language core in 8 lines:** Statically typed, compiled to a single native binary. One loop keyword (for). Errors are explicit return values, checked with if err != nil — no exceptions for normal control flow. Interfaces are satisfied implicitly and structurally — no "implements" keyword. Structs plus methods (value or pointer receivers) replace classical OOP. Slices are the default sequence type; maps are unordered hash tables. defer schedules cleanup at function return. Generics (2022+) use interface-based constraints, deliberately restrained versus other languages.

**Concurrency in 6 lines:** Goroutines are cheap, runtime-scheduled units of concurrency (~2KB starting stack). Channels are typed conduits for communication between goroutines — "share memory by communicating." select waits on multiple channel operations at once. sync.Mutex/WaitGroup handle simple shared-state protection and coordination when channels would be overkill. context.Context propagates cancellation and deadlines through call chains. go test -race is close to mandatory for anything concurrent.

**Runtime in 4 lines:** The GMP scheduler multiplexes goroutines (G) onto OS threads (M) via logical processors (P, one per GOMAXPROCS), work-stealing to balance load. A concurrent, tri-color GC minimizes stop-the-world pause time. Escape analysis decides stack vs heap allocation per variable. Everything (runtime included) statically links into one binary — no separate runtime install.

**Production in 5 lines:** go.mod + committed go.sum, Go version pinned. go vet + golangci-lint + go test -race -cover green in CI. Structured logging (log/slog), explicit http.Server timeouts, context propagated on every outbound call. CGO_ENABLED=0 static binary in a scratch/distroless Docker image. govulncheck for supply-chain scanning.

**Interview reflexes:** GMP scheduler mechanics, channels vs mutexes decision, slice-aliasing via append, escape analysis, error wrapping (%w, errors.Is/As), goroutine leak diagnosis via pprof, value vs pointer receivers, why panic/recover isn't ordinary error handling.
`,

  "learning-roadmap": `
A realistic path to senior-level Go (adjust pace to your background):

**Week 1–2 — Foundations.** Beginner Concepts section + Lab 1. Daily: solve 3 small problems using slices, maps, and structs. Milestone: build any CLI tool you'll actually use, with proper error returns throughout.

**Week 3–4 — Idiomatic Go.** Intermediate Concepts: interfaces, goroutines, channels, error wrapping, JSON. Refactor Week-1 code to use an interface for at least one dependency. Milestone: you write if err != nil without thinking about it, and you've launched your first goroutine.

**Week 5–6 — Concurrency in depth.** Advanced Concepts + Lab 2 (concurrent URL checker). Understand the GMP scheduler well enough to explain it to someone else. Run go test -race until a bug you introduced on purpose gets caught. Milestone: the three-way concurrency benchmark and a paragraph explaining the results.

**Week 7–8 — Internals + architecture.** Internal Working, Architecture, Data Flow sections; Lab 3 (mini HTTP router). Read a small real Go codebase (a popular CLI tool or a small service). Milestone: go build -gcflags="-m" holds no mystery.

**Week 9–10 — Production.** Production Usage → Deployment sections; Lab 4. Milestone: a containerized (scratch-based), instrumented, race-tested service on your GitHub.

**Week 11–12 — Interview polish + first real project.** Interview/Coding Questions sections; start Real Project 2 (rate-limited LLM API gateway). Milestone: explain the GMP scheduler, channels vs mutexes, slice aliasing, and escape analysis out loud, unprompted.

Then continue to **Docker** and **Kubernetes** on this platform — everything here compounds there.
`,

  "official-docs": `
- [go.dev](https://go.dev/) — the official site; "A Tour of Go" is a genuinely good interactive introduction.
- [Effective Go](https://go.dev/doc/effective_go) — the canonical idioms document; read it once early, then again after a few months of writing Go.
- [Go specification](https://go.dev/ref/spec) — precise language semantics, shorter and more readable than most language specs.
- [Standard library documentation](https://pkg.go.dev/std) — skim the full index once; knowing what's already in the stdlib avoids reinventing it.
- [Go release notes](https://go.dev/doc/devel/release) — read every new release's notes; Go's changes are infrequent but consequential.
- [Go blog](https://go.dev/blog/) — official deep dives, including the original concurrency and scheduler design posts.
- [Go Modules Reference](https://go.dev/ref/mod) — dependency management, the thing most tutorials gloss over.
`,

  books: `
- **The Go Programming Language** — Donovan & Kernighan. THE canonical Go book; dense, precise, still the best single reference despite predating generics.
- **Learning Go, 2nd ed.** — Jon Bodner. Modern, thorough, covers generics and recent idioms well; a strong complement to the Donovan/Kernighan classic.
- **Concurrency in Go** — Katherine Cox-Buday. The single best deep dive into goroutines, channels, and Go's concurrency patterns specifically.
- **100 Go Mistakes and How to Avoid Them** — Teiva Harsanyi. Exactly what it sounds like; excellent for the Anti-Patterns and Common Mistakes mindset applied exhaustively.
- **Go in Action** — Kennedy, Ketelsen, St. Martin. Practical, project-driven introduction with a strong concurrency section.
- **Cloud Native Go** — Matthew Titmus. For the infrastructure/distributed-systems angle Go is most used for in industry.
`,

  blogs: `
- **The Go Blog** (go.dev/blog) — official; the original scheduler, GC, and language design posts live here.
- **Dave Cheney's blog** (dave.cheney.net) — one of the most respected independent Go voices; deep performance and idiom posts.
- **Ardan Labs blog** (William Kennedy and team) — training-company blog with excellent internals and concurrency deep dives.
- **Go 101** (go101.org) — extremely thorough, precise coverage of language details many other resources skip.
- **research!rsc** (Russ Cox's blog) — Go's tech lead; module system design, GC, and language evolution insight straight from the source.
- **Uber Engineering Blog** — Go-heavy, with real production war stories and their widely used style guide.
- **Cloudflare Blog (Go tag)** — the C-to-Go migration stories referenced in Case Studies, plus ongoing networking-Go content.
`,

  "research-papers": `
Go-relevant systems literature worth reading as a senior engineer:

- **"Communicating Sequential Processes"** (Tony Hoare, 1978) — the foundational theory behind Go's channel-based concurrency model; reading the original CSP paper makes Go's design philosophy click in a way tutorials alone don't.
- **"Go 1.5 concurrent garbage collector pacing"** and follow-up design documents from the Go team (available via the Go blog/GitHub design docs) — the practical engineering behind Go's low-pause-time GC.
- **"Scalable Go Scheduler Design Doc"** (Dmitry Vyukov, publicly available Google Doc, linked from Go's own source repository) — the primary source for the GMP model's actual design rationale, written by the engineer who designed it.
- **"The Go Programming Language" original design papers/talks** (Pike, Griesemer, Thompson at various venues, 2009–2012) — closer to engineering retrospectives than formal PL-theory papers, but the authoritative source for WHY specific decisions (no exceptions, no generics initially, CSP-based concurrency) were made.
- **"Featherweight Go"** (Griesemer, Hu, Kokke, Lorenzen, Parkinson, Wadler, 2020) — a formal, minimal core calculus modeling Go's generics design, published as part of the actual generics proposal process — a rare case of a mainstream industrial language's feature being formally verified before shipping.

For AI-adjacent engineering specifically: papers on high-throughput API gateway design and load-shedding strategies are more relevant to how Go is actually used in AI infrastructure than any ML-specific paper — Go's role is almost always in the systems layer around models, not in them.
`,

  videos: `
- **Rob Pike — "Concurrency is not Parallelism" (2012)** — the single most-cited Go concurrency talk; clarifies the distinction that underlies the whole language design.
- **Rob Pike — "Go Proverbs" (Gopherfest 2015)** — short, quotable design-philosophy statements ("don't communicate by sharing memory...") straight from a creator.
- **Dmitry Vyukov — scheduler and runtime talks (various GopherCon years)** — the person who designed the GMP scheduler explaining it directly.
- **Kavya Joshi — "The Scheduler Saga" (GopherCon)** — an excellent, accessible deep dive into the scheduler's evolution and mechanics.
- **Bryan Mills — concurrency patterns and context talks (GopherCon)** — practical, idiomatic guidance from a Go team member.
- **JustForFunc (YouTube, Francesc Campoy)** — a large back catalog of practical, well-explained Go topics from basics to advanced.
- **GopherCon (YouTube, official channel)** — the community's annual conference; browse by year for whatever's most current.
`,

  "github-repos": `
- [golang/go](https://github.com/golang/go) — the language and stdlib source; src/runtime is dense but genuinely educational for scheduler/GC internals.
- [golang/example](https://github.com/golang/example) and [go-training](https://github.com/campoy/go-training) — official and community-curated learning examples.
- [uber-go/guide](https://github.com/uber-go/guide) — Uber's widely referenced Go style guide, full of real production reasoning.
- [avelino/awesome-go](https://github.com/avelino/awesome-go) — the canonical curated list of Go libraries and tools by category.
- [gin-gonic/gin](https://github.com/gin-gonic/gin) — a popular, well-structured HTTP framework; good "read a real web framework" target.
- [grpc/grpc-go](https://github.com/grpc/grpc-go) — the official Go gRPC implementation, useful both as a tool and as a study of production-grade Go code.
- [golang/go/wiki/CodeReviewComments](https://github.com/golang/go/wiki/CodeReviewComments) — the Go team's own code review standards, extremely practical.
- [uber-go/zap](https://github.com/uber-go/zap) — a high-performance structured logging library; excellent example of performance-conscious Go design.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Collections fluency*: word-frequency counter over a large text file using a map, then top-K via a min-heap (container/heap).
2. *Goroutines & channels*: a producer/consumer pipeline reading lines from a file, parsing them concurrently across a worker pool, aggregating results through a fan-in channel.
3. *Error handling*: write a retry-with-backoff helper (func retry(attempts int, fn func() error) error) using proper error wrapping for the final failure.
4. *Interfaces*: define a Storage interface with Get/Put methods; implement an in-memory version and a file-backed version; write one test suite that runs against both implementations.
5. *Concurrency correctness*: implement a thread-safe LRU cache, then run it under go test -race with concurrent goroutines hammering it to confirm no races.
6. *Context*: build a function that fans out N HTTP requests concurrently, respects a single overall context.WithTimeout, and returns partial results for whichever completed before the deadline.
7. *Generics*: implement generic Map, Filter, and Reduce functions over slices from scratch (before checking how the stdlib's slices package does it).
8. *Testing*: take problem 3's retry helper and write table-driven tests covering immediate success, eventual success, and permanent failure — using a fake clock, not real sleeps.

External sets: LeetCode (solve in idiomatic Go — good exercise in translating typical algorithmic patterns without generics-heavy shortcuts), Advent of Code (excellent for stdlib fluency), Gophercises (gophercises.com — Go-specific practice exercises).
`,

  "architecture-diagram": `
The reference architecture for a production Go infrastructure service — the shape you'll build repeatedly on this platform, often sitting in front of a Python-based model server:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile/service-to-service)"] --> LB["Load balancer / API gateway"]
    LB --> API1["Go service pod 1\n(net/http, goroutine-per-request)"]
    LB --> API2["Go service pod N"]
    API1 & API2 --> PG[("PostgreSQL\n(pgx driver)")]
    API1 & API2 --> RD[("Redis\ncache · rate limits · queues")]
    API1 & API2 -->|gRPC or HTTP, context-scoped timeouts| Backend["Python model server\n(inference/training services)"]
    subgraph Observability
        PR["Prometheus"] --> GF["Grafana"]
        OT["OpenTelemetry traces"]
        LG["slog JSON logs"]
    end
    API1 -.metrics/traces/logs.-> Observability
    API2 -.metrics/traces/logs.-> Observability
~~~

Every box has a dedicated skill page on this platform; this diagram is the map of how they compose, with Go frequently occupying exactly the gateway/infrastructure layer shown here.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Go))
    Language
      Structs & methods
      Interfaces: implicit satisfaction
      Error values, not exceptions
      Generics (2022+)
      defer/panic/recover
    Concurrency
      Goroutines
      Channels & select
      sync: Mutex, WaitGroup, Once
      context.Context
      Race detector
    Internals
      GMP scheduler
      Concurrent tri-color GC
      Escape analysis
      Static linking, single binary
    Production
      go.mod & modules
      Testing: table-driven, -race
      slog · pprof · delve
      Docker: scratch/distroless
      Security: govulncheck
    Ecosystem
      Docker · Kubernetes
      gRPC · Protocol Buffers
      Prometheus
      Terraform
    Career
      Interview classics
      Concurrency patterns
      Reading path
~~~
`,
};

export default go;
