import type { SkillContent } from "../types";

/**
 * Python — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const python: SkillContent = {
  overview: `
Python is a high-level, dynamically typed, garbage-collected programming language that has become the default language of AI engineering, data science, automation, and a huge share of backend development. Its design philosophy — readability counts, there should be one obvious way to do it — makes it the fastest language to go from idea to working software.

For an AI engineer, Python is not optional. Every major ML framework (PyTorch, TensorFlow, JAX), every LLM SDK (OpenAI, Anthropic), every agent framework (LangChain, LangGraph, CrewAI) and most production AI services (FastAPI backends, Celery workers, Airflow pipelines) are Python-first. Mastering Python deeply — not just syntax, but internals, the GIL, async, packaging, and production practices — is the highest-leverage investment on this entire platform.

Key characteristics: interpreted (compiled to bytecode, executed by a VM), dynamically but strongly typed, multi-paradigm (procedural, OOP, functional), batteries-included standard library, and an ecosystem of over 500,000 PyPI packages.
`,

  history: `
Python was created by **Guido van Rossum** at CWI in the Netherlands, as a successor to the ABC language. He wanted ABC's readability without its rigidity, plus real extensibility and OS-level access.

| Year | Milestone |
|------|-----------|
| 1989 | Guido starts Python as a Christmas hobby project |
| 1991 | Python 0.9.0 released — already had classes, exceptions, functions |
| 1994 | Python 1.0 — lambda, map, filter, reduce |
| 2000 | Python 2.0 — list comprehensions, garbage collection of reference cycles |
| 2008 | Python 3.0 — the big breaking cleanup: text vs bytes, print() as function |
| 2008–2020 | The painful 2→3 migration decade |
| 2015 | Python 3.5 — async/await lands, type hints (PEP 484) |
| 2018 | Guido steps down as BDFL; Steering Council governance begins |
| 2020 | Python 2 end of life |
| 2022 | Python 3.11 — the "Faster CPython" project ships 25–60% speedups |
| 2023 | Python 3.12 — per-interpreter GIL groundwork, better error messages |
| 2024 | Python 3.13 — experimental free-threaded (no-GIL) build and a basic JIT |
| 2025+ | Python 3.14 — deferred annotations (PEP 649), template strings (PEP 750) |

The 2→3 migration is a case study in ecosystem management: a technically correct breaking change that took over a decade because migration cost was underestimated. Modern Python evolves incrementally with deprecation windows instead.
`,

  "why-it-exists": `
Python exists because in the late 1980s there was a gap between two worlds:

- **C**: fast, powerful, but slow to write, easy to crash, manual memory management.
- **Shell scripts / ABC**: quick to write, but limited, unscalable, and (for ABC) closed to extension.

Guido's goal was a language for programmers who are not full-time programmers — scientists, sysadmins, engineers — that was:

1. **Readable**: indentation-based blocks force visually honest code.
2. **Extensible**: written in C, so performance-critical parts can drop to C. This single decision is why NumPy, PyTorch, and the whole scientific stack exist — Python is the friendly steering wheel over C/C++/CUDA engines.
3. **Practical over pure**: real file IO, OS access, and pragmatic compromises instead of academic purity.

That extensibility explains Python's dominance in AI: the heavy math runs in optimized C++/CUDA kernels while Python orchestrates. You get 95% of the performance with 10% of the development cost.
`,

  "problem-it-solves": `
Python solves the **development velocity problem**: most software cost is engineering time, not CPU time.

Concretely, Python removes:

- **Boilerplate**: no type declarations required, no compile step, no manual memory management. A working HTTP API is 5 lines.
- **The two-language problem (partially)**: prototype and production can be the same codebase. Research code in a notebook becomes a service with modest refactoring.
- **Glue-code pain**: Python is the best language ever made for connecting systems — files, APIs, databases, queues, subprocesses — thanks to its standard library and ecosystem.
- **Domain-expert barrier**: a data scientist or ML researcher can be productive without a CS degree; the language gets out of the way.

What Python deliberately does **not** solve: raw single-thread compute speed and CPU-bound parallelism (the GIL). Its answer is to delegate — C extensions, vectorization, multiprocessing, or a sidecar service in Go/Rust when truly necessary. Knowing when to delegate is a senior-engineer skill covered in the Performance and Scalability sections.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Write idiomatic Python: comprehensions, generators, context managers, decorators, dataclasses, pattern matching.
2. Explain how CPython executes code: source → AST → bytecode → eval loop, and what the GIL actually locks.
3. Use the typing system (type hints, generics, Protocols) to build large maintainable codebases.
4. Build async programs with asyncio and know precisely when async beats threads beats processes.
5. Structure a production Python project: uv, pyproject.toml, src layout, lockfiles, entry points.
6. Test with pytest (fixtures, parametrize, mocking) and debug with pdb and structured logging.
7. Package and deploy Python in Docker with production-grade images.
8. Answer senior-level interview questions on GIL, memory management, MRO, descriptors, and async internals.
`,

  prerequisites: `
- **Required**: basic programming literacy — variables, loops, functions in any language. Nothing else; this page starts from zero Python.
- **Helpful**: command-line basics (see the **Linux** skill) for virtual environments and running scripts.
- **For internals sections**: passing familiarity with C concepts (pointers, heap/stack) makes the CPython internals easier, but is not required.

Dependency links: **Linux** (shell, processes) → this page → **FastAPI**, **Django**, **Concurrency**, **Docker** all build directly on Python fluency.
`,

  "beginner-concepts": `
### Variables and types

Python variables are **names bound to objects** — not typed boxes. The object carries the type; the name is just a label.

~~~python
name = "Ada"        # str
age = 36            # int
pi = 3.14159        # float
active = True       # bool
nothing = None      # NoneType — Python's null

# Dynamic but STRONG typing: types don't silently coerce
"1" + 1             # TypeError, not "11"
~~~

### Core collections

~~~python
langs = ["python", "go", "rust"]          # list  — ordered, mutable
point = (3, 4)                            # tuple — ordered, immutable
ranks = {"python": 1, "go": 2}            # dict  — key/value, insertion-ordered
seen = {"a", "b"}                         # set   — unique, unordered

langs.append("zig")
ranks["rust"] = 3
first, second = point                     # tuple unpacking
~~~

Rule of thumb: dict and set lookups are O(1) (hash tables); list membership tests are O(n). Choosing the right collection is the first performance skill.

### Control flow and functions

~~~python
def describe(n: int) -> str:
    """Docstrings document; type hints clarify (and enable tooling)."""
    if n < 0:
        return "negative"
    elif n == 0:
        return "zero"
    return "positive"

for lang in langs:              # iterate values, not indexes
    print(lang)

for i, lang in enumerate(langs):  # need the index? enumerate
    print(i, lang)

total = sum(x * x for x in range(10) if x % 2 == 0)
~~~

### Strings and f-strings

~~~python
user = "shubham"
greeting = f"Hello, {user.title()}!"   # f-strings: fast, readable formatting
multi = """Triple quotes
span lines."""
~~~

### Files, errors, and truthiness

~~~python
# Context manager guarantees the file closes even on exceptions
with open("data.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

try:
    value = int("not a number")
except ValueError as exc:
    print(f"Bad input: {exc}")
finally:
    print("always runs")

# Truthiness: empty things are falsy
if not langs:
    print("empty list")
~~~

Common beginner trap: **mutable default arguments** — covered in Anti-Patterns. Read it before writing your first library.
`,

  "intermediate-concepts": `
### Comprehensions and generators

~~~python
squares = [x * x for x in range(10)]                 # list comprehension
by_name = {u["name"]: u for u in users}              # dict comprehension

# Generators produce values lazily — constant memory for any size input
def read_large_file(path: str):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.strip()

# Generator expression: like a list comprehension that never materializes
total_bytes = sum(len(line) for line in read_large_file("huge.log"))
~~~

Generators are THE tool for pipelines over large data: each item flows through the whole chain before the next is read.

### Decorators

A decorator is a function that wraps another function — the mechanism behind Flask routes, pytest fixtures, FastAPI endpoints, and retry logic everywhere.

~~~python
import functools
import time

def timed(func):
    @functools.wraps(func)            # preserves name/docstring of func
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(f"{func.__name__} took {time.perf_counter() - start:.3f}s")
    return wrapper

@timed
def slow_op():
    time.sleep(0.5)
~~~

### Context managers

~~~python
from contextlib import contextmanager

@contextmanager
def db_transaction(conn):
    conn.begin()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
~~~

Anything with setup/teardown semantics (locks, transactions, temp files, timers) should be a context manager.

### Typing, dataclasses, and Protocols

~~~python
from dataclasses import dataclass, field
from typing import Protocol

@dataclass(frozen=True, slots=True)     # immutable, memory-efficient
class User:
    id: int
    name: str
    tags: tuple[str, ...] = field(default_factory=tuple)

class Repository(Protocol):             # structural typing — duck typing, checked
    def get(self, user_id: int) -> User | None: ...
    def save(self, user: User) -> None: ...

def promote(repo: Repository, user_id: int) -> None:
    ...  # works with ANY object matching the Protocol — no inheritance needed
~~~

Type hints don't change runtime behavior; they power mypy/pyright, IDE autocomplete, and frameworks like FastAPI and Pydantic that read annotations at runtime.

### Error handling done right

~~~python
class PaymentError(Exception):
    """Domain-specific base — callers catch THIS, not bare Exception."""

class InsufficientFunds(PaymentError): ...

def charge(amount: int) -> None:
    if amount > balance:
        raise InsufficientFunds(f"need {amount}, have {balance}")
~~~

Principles: raise specific exceptions, catch narrowly, never swallow silently, use exception chaining (raise X from exc) to preserve causes.

### Pattern matching (3.10+)

~~~python
def handle(event: dict) -> str:
    match event:
        case {"type": "message", "text": str(text)}:
            return f"msg: {text}"
        case {"type": "reaction", "emoji": emoji}:
            return f"react: {emoji}"
        case _:
            return "unknown"
~~~
`,

  "advanced-concepts": `
### The GIL — what it actually is

The Global Interpreter Lock is a mutex in CPython that allows only one thread to execute Python bytecode at a time. Consequences:

- **CPU-bound** work does NOT speed up with threads. Use multiprocessing or C extensions.
- **IO-bound** work DOES benefit from threads: the GIL is released during blocking IO (sockets, disk, DB drivers).
- C extensions (NumPy, PyTorch) release the GIL during heavy computation — that's why data loaders use threads effectively.
- Python 3.13+ offers an **experimental free-threaded build** (PEP 703) that removes the GIL; the ecosystem is migrating gradually.

### asyncio — cooperative concurrency

~~~python
import asyncio
import httpx

async def fetch(client: httpx.AsyncClient, url: str) -> int:
    resp = await client.get(url)          # yields control while waiting
    return resp.status_code

async def main() -> None:
    async with httpx.AsyncClient() as client:
        # 100 requests concurrently on ONE thread
        results = await asyncio.gather(*(fetch(client, u) for u in urls))

asyncio.run(main())
~~~

Mental model: one thread, one event loop, thousands of paused coroutines. await marks the exact points where a task can be suspended. Rules that prevent 90% of async bugs:

1. Never call blocking functions (time.sleep, requests.get, heavy CPU) inside a coroutine — use await asyncio.sleep, an async client, or loop.run_in_executor.
2. A single un-awaited blocking call freezes EVERY task on the loop.
3. Use asyncio.TaskGroup (3.11+) for structured concurrency — no orphaned tasks.

### Concurrency decision table

| Workload | Tool | Why |
|----------|------|-----|
| Many network calls | asyncio | Thousands of concurrent sockets, one thread |
| Blocking IO, few tasks | threads | Simple; GIL released during IO |
| CPU-bound | multiprocessing / C extension | Sidesteps the GIL |
| CPU-bound + shared memory | free-threaded 3.13+ (experimental) | True parallel threads |

### Descriptors — how attributes really work

Descriptors are objects with __get__/__set__ that live on classes. They are the mechanism behind @property, methods, classmethod, and ORM fields (Django's Model fields, SQLAlchemy columns).

~~~python
class Positive:
    def __set_name__(self, owner, name):
        self.name = f"_{name}"
    def __get__(self, obj, objtype=None):
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} must be positive")
        setattr(obj, self.name, value)

class Order:
    amount = Positive()   # validation logic attached to the attribute itself
~~~

### Metaclasses and __init_subclass__

A metaclass is the type of a class — it controls class creation. Pydantic, Django models, and ABCs use this to collect fields and enforce contracts at class-definition time. For 95% of use cases, prefer the simpler __init_subclass__ hook:

~~~python
class PluginBase:
    registry: dict[str, type] = {}
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        PluginBase.registry[cls.__name__] = cls   # auto-register plugins
~~~

### Memory management

- **Reference counting** is the primary mechanism: every object tracks how many names/containers point to it; at zero it is freed immediately.
- A **cyclic garbage collector** handles reference cycles (a→b→a) in generations.
- **Interning**: small ints (-5..256) and many strings are shared singletons — this is why "is" comparisons on ints/strings are a bug except against None.
- __slots__ (or slotted dataclasses) removes the per-instance __dict__, cutting memory 3–5x for large object counts.

### MRO — method resolution order

Multiple inheritance resolves with the C3 linearization. Inspect it with ClassName.__mro__. super() follows the MRO, not "the parent" — which is why cooperative multiple inheritance requires every class in the chain to call super().__init__().
`,

  "internal-working": `
CPython (the reference implementation) executes your code in four stages:

~~~mermaid
flowchart LR
    A["source .py"] --> B["Tokenizer"]
    B --> C["Parser → AST"]
    C --> D["Compiler → bytecode (.pyc cache)"]
    D --> E["Eval loop (ceval.c) executes bytecode"]
    E --> F["Object space: PyObject* on heap,\nref-counting + cyclic GC"]
~~~

1. **Tokenize & parse**: source becomes an Abstract Syntax Tree (inspect with the ast module).
2. **Compile**: the AST compiles to bytecode — instructions for Python's stack-based virtual machine. Cached in __pycache__/*.pyc keyed by source mtime.
3. **Evaluate**: the eval loop is a giant switch over opcodes. See it yourself:

~~~python
import dis

def add(a, b):
    return a + b

dis.dis(add)
#  LOAD_FAST  a
#  LOAD_FAST  b
#  BINARY_OP  +
#  RETURN_VALUE
~~~

4. **Everything is a PyObject**: every value is a heap-allocated C struct with a refcount and a type pointer. Attribute access, addition, calls — all dispatch through the type's slot tables, which is the fundamental reason pure-Python arithmetic is ~50x slower than C, and why NumPy (one dispatch for a million elements) wins.

**Modern speedups**: 3.11+ added the specializing adaptive interpreter — hot bytecode rewrites itself into faster specialized forms (e.g. BINARY_OP becomes a direct float-add when it keeps seeing floats). 3.13 added an experimental copy-and-patch JIT. Free-threading (PEP 703) replaces refcount-under-GIL with biased reference counting so threads can truly parallelize.

Other implementations: **PyPy** (tracing JIT, often 5–20x faster on pure Python), **MicroPython** (microcontrollers), **GraalPy** (JVM).
`,

  architecture: `
A senior engineer thinks about Python at two levels: the **runtime architecture** and the **application architecture**.

### Runtime architecture

~~~mermaid
flowchart TB
    subgraph Process["CPython process"]
        GIL["GIL (per interpreter)"]
        subgraph Interp["Interpreter state"]
            Modules["sys.modules (import cache)"]
            Builtins["builtins"]
        end
        subgraph Threads["OS threads"]
            T1["Thread 1 — bytecode"]
            T2["Thread 2 — waiting on GIL / doing IO"]
        end
        Heap["Shared object heap (PyObject*)"]
        GC["Ref-counting + generational cycle GC"]
    end
    T1 --> Heap
    T2 --> Heap
    GIL -.serializes bytecode.-> Threads
    GC --> Heap
~~~

Key facts: threads share the heap (cheap data sharing, GIL-serialized execution); processes each get their own interpreter, GIL, and heap (true parallelism, data must be serialized between them).

### Application architecture (production Python service)

The standard layered layout used by mature Python teams:

~~~
myservice/
├── pyproject.toml          # single source of project truth (uv-managed)
├── src/myservice/
│   ├── api/                # transport layer: FastAPI routers, schemas
│   ├── services/           # business logic — pure, framework-free
│   ├── repositories/       # data access behind Protocols
│   ├── models/             # domain models (dataclasses / Pydantic)
│   ├── core/               # config, logging, DI wiring
│   └── workers/            # Celery/background tasks
└── tests/                  # mirrors src structure
~~~

Rules: dependencies point inward (api → services → repositories), the domain never imports the framework, and repositories are Protocols so tests swap in fakes without patching.
`,

  "data-flow": `
What happens when you run **python main.py**:

~~~mermaid
sequenceDiagram
    participant OS
    participant Py as CPython
    participant Imp as Import system
    participant VM as Eval loop

    OS->>Py: exec python main.py
    Py->>Py: initialize interpreter, sys.path, builtins
    Py->>Imp: import dependencies of main
    Imp->>Imp: check sys.modules cache
    Imp->>Imp: find module (finders) → load (loaders)
    Imp->>VM: execute module body top-to-bottom
    Note over Imp,VM: import = "run the file once, cache the namespace"
    Py->>VM: execute main.py bytecode
    VM->>VM: call functions, allocate objects, refcount
    VM-->>OS: exit code
~~~

The most misunderstood part is **imports**: importing a module executes it, exactly once per process, and caches the resulting module object in sys.modules. Everything that follows — circular import errors, why module-level code is "free" singleton state, why if __name__ == "__main__" exists, why celery workers re-import your app — falls out of this one rule.

For a request in a Python web service, the data flow is: socket bytes → ASGI/WSGI server (uvicorn/gunicorn) parses HTTP → framework routes to your handler → your handler awaits DB/API calls (event loop interleaves other requests) → response serialized back to bytes. The event loop's single thread means one blocking call stalls every in-flight request — the number one production async bug.
`,

  "production-usage": `
### Environment and dependency management with uv

**uv** (by Astral, written in Rust) has become the standard tool — it replaces pip, virtualenv, pyenv, pip-tools, and poetry, and is 10–100x faster.

~~~bash
uv init myservice            # scaffold pyproject.toml
uv add fastapi "uvicorn[standard]"
uv add --dev pytest ruff mypy
uv sync                      # create .venv + install from lockfile
uv run pytest                # run inside the env without activating
uv python install 3.12      # manage interpreters too
~~~

Non-negotiables for production:

1. **pyproject.toml** is the single source of truth — no requirements.txt drift.
2. **uv.lock committed** — byte-identical environments on every machine and in CI.
3. **src layout** (src/myservice/) — prevents accidentally importing the uninstalled working directory.
4. Pin the Python version in .python-version.

### Configuration

Read config from environment variables, validated at startup with pydantic-settings. Fail fast at boot on missing config — never at request time.

### Long-running services

- ASGI apps: uvicorn workers managed by gunicorn (or uvicorn --workers).
- Worker count for CPU-bound WSGI: 2×cores+1; for async ASGI: 1 per core.
- Always set timeouts on EVERY outbound call (httpx default is no timeout for requests — set one).
- Handle SIGTERM for graceful shutdown: stop accepting, drain in-flight work, exit.
`,

  "industry-examples": `
- **Instagram**: the largest Django deployment in the world — hundreds of millions of daily users on Python, scaled via horizontal sharding and aggressive C-level optimization (they run a patched CPython and pioneered disabling GC for memory savings in forked workers).
- **Dropbox**: stored exabytes with a Python core for years; Guido van Rossum worked there. Their migration of performance hotspots to Go/Rust while keeping Python for product logic is the canonical "delegate the hot path" story. They also built mypy to manage a 4M+ line codebase.
- **OpenAI / Anthropic**: model training orchestration, evals, APIs and SDKs are Python-first; PyTorch (Python front end over C++/CUDA) trains the frontier models.
- **Netflix**: Python for chaos engineering (Chaos Monkey tooling), data pipelines, and their machine-learning platform (Metaflow, open-sourced).
- **Spotify**: backend services in Python for years, plus Luigi (workflow orchestration) born there.
- **Reddit, Pinterest, Lyft**: Python web/service cores at massive scale.

Pattern to notice: nobody serious "rewrites away" Python entirely — they keep Python where iteration speed matters (product logic, ML, glue) and surgically move proven hotspots to compiled languages.
`,

  "best-practices": `
1. **Let tools enforce style**: ruff (lint + format, replaces black/flake8/isort) in pre-commit and CI. Zero style debates.
2. **Type-hint all public interfaces**; run mypy or pyright in CI. Untyped Python beyond ~10k lines becomes archaeology.
3. **Prefer composition and Protocols over inheritance** — inheritance across module boundaries is a maintenance trap.
4. **Immutable by default**: frozen dataclasses, tuples over lists for fixed data. Shared mutable state causes the worst bugs.
5. **Raise exceptions, don't return error codes/None** for failures; reserve None for genuine absence.
6. **Dependency injection by constructor** — pass collaborators in; never import a database connection at module scope.
7. **One virtual env per project, lockfile committed, uv-managed.**
8. **Structured logging** (JSON in production) with correlation IDs — never bare print.
9. **Small functions, early returns**, guard clauses over nested ifs.
10. **Read PEP 8 once, then let ruff remember it for you.**
`,

  "anti-patterns": `
### Mutable default arguments — the classic

~~~python
def append_bad(item, items=[]):     # ONE list shared across ALL calls
    items.append(item)
    return items

append_bad(1)   # [1]
append_bad(2)   # [1, 2]  ← surprise!

def append_good(item, items=None):
    items = items if items is not None else []
~~~

Defaults are evaluated **once at function definition**, not per call.

### Other production-grade anti-patterns

- **Bare except:** — swallows KeyboardInterrupt, SystemExit, and every bug. Catch specific exceptions; at worst except Exception with logging and re-raise.
- **Module-level side effects**: opening connections or reading files at import time makes imports slow, order-dependent, and untestable.
- **God objects / util.py dumping grounds** — a utils module over ~200 lines is a design smell; extract cohesive modules.
- **Boolean flag parameters** (do_thing(data, True, False)) — unreadable at call sites; use keyword-only args or separate functions.
- **isinstance ladders** instead of polymorphism or match.
- **Premature async**: async code is harder to write, debug, and profile — if you handle 20 requests/second of blocking DB work, threads are simpler and just as fast.
- **String-building SQL** — injection risk and broken escaping; always parameterize (see Security).
- **from module import *** — invisible names, shadowing, broken tooling.
`,

  performance: `
### Rule zero: measure first

~~~bash
python -m cProfile -s cumulative app.py     # where does time go?
uv add --dev py-spy && py-spy top --pid 123 # live profiling, prod-safe
~~~

py-spy is the production workhorse: it samples a running process from outside with near-zero overhead — no code changes, works on live services.

### The performance hierarchy (apply in order)

1. **Better algorithm / data structure** — O(n²)→O(n log n) beats any micro-optimization. set/dict membership instead of list scans.
2. **Do less work** — cache (functools.lru_cache), batch DB/API calls, avoid recomputing.
3. **Vectorize** — NumPy/pandas/polars push loops into C: often 50–200x.
4. **Concurrency for IO** — asyncio/threads overlap waiting.
5. **Multiprocessing for CPU** — one process per core.
6. **Compile the hotspot** — Cython, mypyc, or rewrite one module in Rust (PyO3). Modern teams reach for Rust here.
7. **Upgrade Python** — 3.11+ is 25–60% faster than 3.10 for free.

### Micro-level facts worth knowing

- Function calls are expensive (~50–100ns); inlining hot inner loops matters.
- String concatenation in a loop is O(n²); use "".join(parts).
- Attribute lookups cost; bind obj.method to a local before a tight loop.
- generators trade CPU for memory — for huge data, memory wins.
- __slots__ / slotted dataclasses: 3–5x memory reduction for millions of instances.
`,

  scalability: `
Python scales the same way any language does — **horizontally** — with a few Python-specific twists.

### Single machine

~~~mermaid
flowchart LR
    LB["nginx / load balancer"] --> G["gunicorn master"]
    G --> W1["uvicorn worker (process 1)"]
    G --> W2["uvicorn worker (process 2)"]
    G --> W3["uvicorn worker (process N)"]
    W1 & W2 & W3 --> DB[("PostgreSQL")]
    W1 & W2 & W3 --> R[("Redis")]
~~~

Because of the GIL, Python services scale on one box by **running one process per core**. The process manager (gunicorn) forks workers; the OS balances connections.

### Beyond one machine

- **Stateless services**: keep sessions/state in Redis/Postgres so any worker can serve any request; then scaling = more containers behind a load balancer (see the Kubernetes and Load Balancers skills).
- **Background work**: move slow tasks (emails, embeddings, video processing) to Celery/RQ/arq workers reading from Redis/RabbitMQ — scale worker pools independently of the API.
- **The async advantage**: an async FastAPI worker holds thousands of concurrent slow client connections (LLM streaming!) where a sync worker holds one each. This is why AI APIs are async-first.

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| CPU-bound request path | C extension, Rust module, or a compiled sidecar service |
| Memory per process × workers | slots, smaller worker counts with async, shared memory (multiprocessing.shared_memory) |
| Cold start (serverless) | slim images, lazy imports, provisioned concurrency |
| One slow blocking call in async | run_in_executor, or fix the driver (use asyncpg, not psycopg2) |
`,

  security: `
### Python-specific dangers

1. **pickle is code execution.** Never unpickle untrusted data — a crafted pickle runs arbitrary code on load. This includes many model file formats! Use safetensors for ML weights, JSON for data.
2. **eval/exec on user input** — obviously RCE; also beware indirect forms (importing user-named modules, format-string gadgets).
3. **YAML**: yaml.load without SafeLoader can construct arbitrary objects — always yaml.safe_load.
4. **subprocess with shell=True** + user input = shell injection. Pass argument lists: subprocess.run([cmd, arg]).
5. **SQL injection**: parameterize, always. cursor.execute("SELECT * FROM users WHERE id = %s", (uid,)) — the driver escapes; f-strings into SQL never do.

### Supply chain

- Audit dependencies: uv tooling / pip-audit against known CVEs in CI.
- Beware **typosquatting** (requests vs reqeusts) — PyPI is attacked constantly.
- Pin exact versions via lockfile; review diffs on upgrades.

### Secrets and crypto

- Secrets from env vars or a vault (see Secrets Management skill) — never in code or git history.
- Passwords: bcrypt/argon2 via passlib — never raw hashlib for password storage.
- Use the secrets module (not random) for tokens: secrets.token_urlsafe(32).
- TLS everywhere; verify certificates (never verify=False in production).

See the dedicated **SQL Injection**, **OWASP Top 10**, and **Secrets Management** skills for depth.
`,

  testing: `
**pytest** is the ecosystem standard: plain functions, assert statements, powerful fixtures.

~~~python
# tests/test_pricing.py
import pytest
from myservice.pricing import apply_discount, PricingError

def test_basic_discount():
    assert apply_discount(100, percent=10) == 90

@pytest.mark.parametrize("price,pct,expected", [
    (100, 0, 100),
    (100, 100, 0),
    (59.99, 15, 50.99),
])
def test_discount_matrix(price, pct, expected):
    assert apply_discount(price, percent=pct) == pytest.approx(expected)

def test_invalid_discount_raises():
    with pytest.raises(PricingError, match="percent"):
        apply_discount(100, percent=150)
~~~

### Fixtures — dependency injection for tests

~~~python
import pytest

@pytest.fixture
def db(tmp_path):
    """Fresh SQLite db per test; tmp_path is a built-in fixture."""
    conn = create_test_db(tmp_path / "test.db")
    yield conn
    conn.close()

def test_saves_user(db):
    repo = UserRepo(db)
    repo.save(User(id=1, name="ada"))
    assert repo.get(1).name == "ada"
~~~

### The senior testing doctrine

- Test **behavior through public interfaces**, not implementation details — tests should survive refactors.
- Prefer **fakes over mocks**: an in-memory repository beats a mock with 12 patched methods. Design with Protocols so fakes slot in.
- Use mocking (unittest.mock / pytest-mock) at true system boundaries only — HTTP, clocks, randomness.
- Coverage: aim ~80%+ on business logic; 100% coverage of trivial code is theater.
- Async tests: pytest-asyncio with @pytest.mark.asyncio.
- Property-based testing with **hypothesis** finds edge cases you can't imagine — superb for parsers and pure functions.

Run in CI on every commit: uv run pytest -x -q plus ruff check and mypy.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the traceback bottom-up** — the last frame in YOUR code is usually the culprit. Python 3.11+ tracebacks point at the exact expression.
2. **breakpoint()** — drops into pdb right there (PYTHONBREAKPOINT=0 disables in prod).

~~~text
(Pdb) p variable        # print
(Pdb) pp obj.__dict__   # pretty print
(Pdb) l                 # show code
(Pdb) u / d             # walk up/down the stack
(Pdb) c                 # continue
~~~

3. **Logging beats print** — you can raise verbosity in production without code edits:

~~~python
import logging
logger = logging.getLogger(__name__)
logger.debug("cart=%s user=%s", cart_id, user_id)   # lazy formatting
~~~

4. **py-spy dump --pid N** — instant stack of every thread in a LIVE process. The fastest answer to "why is production hung?" (Answer is usually: a blocking call in async code, or a lock.)
5. **tracemalloc** for memory leaks: snapshot, run, snapshot, compare_to — shows exactly which lines allocated the growth.
6. **faulthandler** enabled in prod (PYTHONFAULTHANDLER=1) prints Python stacks even on segfaults from C extensions.

### Debugging async

- Enable debug mode: asyncio.run(main(), debug=True) — warns on slow callbacks (>100ms) and un-awaited coroutines.
- "My async app is frozen" → py-spy dump; look for a synchronous call sitting in a coroutine.
- Un-awaited coroutine warnings mean you forgot await — the call never ran.
`,

  monitoring: `
Production Python visibility rests on three pillars (see the Observability category for depth):

### Structured logging

~~~python
import structlog

log = structlog.get_logger()
log.info("order_placed", order_id=order.id, user_id=user.id,
         amount_cents=order.total, latency_ms=elapsed)
~~~

JSON logs with consistent keys → searchable in Loki/ELK/Datadog. Include a **correlation/request ID** in every log line (contextvars propagates it through async code cleanly).

### Metrics (Prometheus)

~~~python
from prometheus_client import Counter, Histogram

REQUESTS = Counter("http_requests_total", "Requests", ["route", "status"])
LATENCY = Histogram("http_request_seconds", "Latency", ["route"])

@LATENCY.labels(route="/checkout").time()
def checkout(): ...
~~~

Track the RED trio per endpoint: Rate, Errors, Duration (p50/p95/p99). Alert on symptoms users feel (error rate, p99), not causes (CPU).

### Tracing (OpenTelemetry)

Auto-instrumentation covers FastAPI, httpx, SQLAlchemy, Celery, Redis with two lines of setup — spans show exactly where a slow request spent its time across services.

### Python-specific things to watch

- Worker memory growth (leaks or fragmentation) → restart policy (gunicorn max_requests with jitter) as a stopgap, tracemalloc for diagnosis.
- Event-loop lag (asyncio) — measure with a heartbeat task; lag means something is blocking the loop.
- GC pauses in latency-critical paths: gc.freeze() after warmup in forked workers reduces copy-on-write churn (the Instagram trick).
`,

  deployment: `
### The standard: multi-stage Docker with uv

~~~dockerfile
# ---- build stage ----
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
# Install deps first — this layer caches until deps change
RUN uv sync --frozen --no-install-project --no-dev
COPY src/ src/
RUN uv sync --frozen --no-dev

# ---- runtime stage ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "myservice.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Why each choice matters: slim base (smaller attack surface), deps layer cached separately from code (fast rebuilds), non-root user (container escape mitigation), PYTHONUNBUFFERED (logs stream immediately), lockfile-frozen install (reproducible).

### Serving topology

- **ASGI (FastAPI)**: uvicorn workers; scale replicas in Kubernetes rather than fat multi-worker containers — 1 process per container is the cloud-native norm.
- **WSGI (Django/Flask)**: gunicorn with (2×cores)+1 workers.
- Health endpoints: /healthz (liveness — process up) and /readyz (readiness — dependencies reachable); wire into K8s probes and load balancers.
- Graceful shutdown on SIGTERM: uvicorn/gunicorn drain by default — make sure YOUR background tasks also cancel cleanly.

### CI/CD pipeline (GitHub Actions sketch)

lint (ruff) → typecheck (mypy) → test (pytest) → build image → scan (trivy) → push → deploy with rolling update. Every step gated; see the CI/CD and GitHub Actions skills.
`,

  "production-checklist": `
Before a Python service takes real traffic:

- [ ] pyproject.toml + committed uv.lock; Python version pinned
- [ ] ruff + mypy + pytest green in CI, enforced on every PR
- [ ] Config from env vars, validated at startup (pydantic-settings), fail-fast
- [ ] Structured JSON logging with request/correlation IDs
- [ ] Timeouts on EVERY outbound call (HTTP, DB, Redis, LLM APIs)
- [ ] Retries with exponential backoff + jitter on idempotent calls only
- [ ] /healthz and /readyz endpoints wired to orchestrator probes
- [ ] Graceful SIGTERM handling verified (kill a pod, watch requests drain)
- [ ] Prometheus metrics: request rate, error rate, p95/p99 latency per route
- [ ] Error tracking (Sentry or equivalent) with release tagging
- [ ] Non-root container, slim image, dependency CVE scan in CI
- [ ] No secrets in code/env files in git; vault or platform secret store
- [ ] DB connection pool sized: pool × workers < db max_connections
- [ ] Load test done: know your requests/sec ceiling and failure mode
- [ ] Runbook: how to roll back, scale up, and read the dashboards
`,

  "common-mistakes": `
1. **Mutable default arguments** — see Anti-Patterns; the interview classic that's also a real bug factory.
2. **Blocking the event loop**: calling requests.get or time.sleep inside async def. Symptoms: mysterious latency spikes across ALL endpoints.
3. **is vs ==**: is checks identity, == checks equality. Only use is for None/True/False singletons. Small-int interning makes wrong code pass tests then fail in prod.
4. **Late-binding closures in loops**: functions created in a loop all see the final loop value. Fix: def f(x=x) default-arg capture.
5. **Modifying a list while iterating it** — skips elements silently. Iterate a copy or build a new list.
6. **Circular imports** from module-level imports both ways — restructure, or import inside the function.
7. **Catching Exception to "keep the service up"** and silently corrupting state; crash-and-restart beats limping.
8. **Timezone-naive datetimes**: always datetime.now(tz=timezone.utc); naive datetimes in a database are a slow-motion disaster.
9. **Float for money** — 0.1 + 0.2 != 0.3. Use int cents or decimal.Decimal.
10. **Assuming dict/set iteration order semantics you didn't verify** — dicts preserve insertion order (3.7+); sets do NOT.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| ModuleNotFoundError | Wrong env active; src layout not installed | uv sync; uv run …; check which python |
| ImportError (circular) | Two modules import each other at top level | Move import into function; extract shared module |
| TypeError: 'NoneType' has no attribute | Function returned None unexpectedly | Check the return path; type hints + mypy catch these |
| UnboundLocalError | Assigning to a name makes it local for the WHOLE function | Declare nonlocal/global, or restructure |
| RuntimeError: event loop already running | asyncio.run inside a running loop (Jupyter!) | await directly, or nest_asyncio in notebooks |
| RuntimeWarning: coroutine never awaited | Called async function without await | Add await |
| ResourceWarning: unclosed file/socket | No context manager | with open(...); async with client |
| MemoryError / OOM-killed | Loading whole dataset; leak | Generators/chunking; tracemalloc |
| SSL: CERTIFICATE_VERIFY_FAILED | Missing CA bundle (common on macOS) | Install certifi / OS certs — never verify=False |
| pickle.UnpicklingError | Version/class mismatch across services | Don't use pickle across trust or version boundaries |

The habit that matters: read the FULL traceback, reproduce in the smallest possible script, then fix the cause rather than the symptom.
`,

  faqs: `
**Q: Is Python too slow for production?**
No — Instagram, Dropbox, OpenAI, and Netflix run planet-scale Python. The tail latency of most services is IO (databases, APIs), not the interpreter. Where CPU is truly the bottleneck, Python delegates (NumPy, Rust extensions) or you extract that one service. Engineering time saved usually dwarfs compute cost.

**Q: Should I learn Python 2?**
No. Dead since 2020. If you inherit legacy code, learn the differences then, not now.

**Q: Threads, asyncio, or multiprocessing?**
IO-bound + huge concurrency → asyncio. IO-bound + modest concurrency → threads. CPU-bound → multiprocessing or native extensions. See the decision table in Advanced Concepts.

**Q: Are type hints worth it?**
For anything beyond scripts, emphatically yes — they catch bugs pre-runtime, power IDEs, and are required by FastAPI/Pydantic. They're documentation that can't go stale.

**Q: uv, poetry, pip, conda — which?**
In 2026: **uv** for almost everything (speed, lockfiles, Python management). conda only when you need non-Python binaries pip can't provide (specific CUDA setups, geospatial stacks). Plain pip survives inside Docker where env isolation comes from the container.

**Q: Will removing the GIL change everything?**
Gradually. Free-threaded CPython (3.13+, experimental) allows real parallel threads, but C extensions must be made thread-safe, and single-thread performance has some overhead. Expect years of transition; multiprocessing knowledge stays relevant.

**Q: What Python version should I target?**
Latest stable minus one for libraries; latest stable for applications you control. Never below the oldest supported release (security patches).
`,

  "interview-questions": `
**Junior/Mid:**

1. *List vs tuple?* Mutability (list mutable), tuples hashable → dict keys, tuples signal fixed structure; minor perf/memory edge to tuples.
2. *How does Python pass arguments?* Pass-by-object-reference: the reference is copied, the object is shared. Mutating a passed list is visible to the caller; rebinding the parameter is not.
3. *What are *args and **kwargs?* Capture extra positional/keyword arguments as tuple/dict; used for forwarding and flexible APIs.
4. *Explain list comprehension vs generator expression.* Eager list in memory vs lazy one-pass iterator; choose by whether you need the whole result.
5. *What is a decorator?* A callable transforming a callable; syntax sugar for f = deco(f). Follow up with functools.wraps.

**Senior:**

6. *Explain the GIL and its consequences.* One thread executes bytecode at a time per interpreter; IO releases it, C extensions can; CPU parallelism needs processes; 3.13 free-threading changes the game. Strong answers cover WHY it exists (refcounting thread safety, C API simplicity).
7. *How does memory management work?* Refcounting (immediate) + generational cycle collector; obmalloc arenas for small objects; implications: predictable destruction (mostly), cycles need GC, __del__ pitfalls.
8. *Walk through method resolution with multiple inheritance.* C3 linearization, __mro__, cooperative super() — every class calls super(), signatures must be compatible.
9. *How would you find a memory leak in a running service?* tracemalloc snapshots diff, py-spy/memray profiles, objgraph for reference chains; common causes: caches without bounds, closures capturing large objects, C-extension leaks.
10. *Design choice: you must call 50 APIs per request within 200ms — how?* asyncio.gather with per-call timeouts, connection pooling (shared AsyncClient), circuit breakers, and hedged requests if p99 matters; discuss failure budget.
11. *What happens exactly when you write "import foo"?* sys.modules check → finders locate → loader executes module in fresh namespace → cached; module-level code runs once; circular import behavior falls out.
12. *Descriptors: how does @property work?* Class attribute with __get__/__set__ intercepts instance attribute access via the type's lookup order — the same machinery as bound methods.
`,

  "coding-questions": `
### 1. LRU cache (asked constantly, tests dict + linked-list thinking)

~~~python
from collections import OrderedDict

class LRUCache:
    """O(1) get/put using an ordered dict (hash map + doubly linked list)."""
    def __init__(self, capacity: int):
        self.cap = capacity
        self.data: OrderedDict[int, int] = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.data:
            return -1
        self.data.move_to_end(key)          # mark as recently used
        return self.data[key]

    def put(self, key: int, value: int) -> None:
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.cap:
            self.data.popitem(last=False)   # evict least recently used
~~~

Complexity: O(1) both operations. Follow-up they'll ask: make it thread-safe (wrap with threading.Lock), or TTL-based eviction.

### 2. Flatten arbitrarily nested lists (tests recursion + generators)

~~~python
from collections.abc import Iterable

def flatten(items):
    for item in items:
        if isinstance(item, Iterable) and not isinstance(item, (str, bytes)):
            yield from flatten(item)
        else:
            yield item

assert list(flatten([1, [2, [3, [4]], 5]])) == [1, 2, 3, 4, 5]
~~~

The str/bytes guard is the trap — strings are iterable and recurse forever without it.

### 3. Rate limiter — token bucket (production-flavored)

~~~python
import time

class TokenBucket:
    """Allow rate r/sec with bursts up to capacity."""
    def __init__(self, rate: float, capacity: int):
        self.rate, self.capacity = rate, capacity
        self.tokens = float(capacity)
        self.last = time.monotonic()        # monotonic: immune to clock changes

    def allow(self) -> bool:
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
~~~

Discussion points: monotonic clock choice, distributed version (Redis + Lua for atomicity), sliding-window alternatives.
`,

  "hands-on-labs": `
### Lab 1 — CLI todo app (beginner, ~1h)
Build a todo CLI storing tasks in JSON: add/list/done/delete commands with argparse, dataclasses for tasks, pathlib for storage. Stretch: rich for pretty tables. Skills: files, JSON, dataclasses, CLI structure.

### Lab 2 — Concurrent scraper (intermediate, ~2h)
Fetch 200 URLs three ways: sequential (requests), threaded (ThreadPoolExecutor), async (httpx + asyncio.gather). Time all three; add a semaphore for politeness and per-request timeouts. Deliverable: a table of timings + one paragraph explaining WHY async wins. Skills: the entire concurrency model, viscerally.

### Lab 3 — Mini web framework (advanced, ~4h)
Implement a toy WSGI framework: route decorator, path parameters, JSON responses, middleware chain. Run it under gunicorn. You will genuinely understand Flask afterward. Skills: decorators, closures, WSGI protocol, HTTP.

### Lab 4 — Instrument and deploy (production, ~3h)
Take Lab 2's async scraper, wrap it in FastAPI (POST /scrape), add structlog JSON logs, Prometheus metrics, /healthz, a multi-stage Dockerfile with uv, and run it in Docker with resource limits. Load test with hey/locust. Skills: the whole production section, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each maps to skills employers screen for):

1. **Log intelligence pipeline** — Ingest nginx/app logs (generators, streaming parse), aggregate stats, detect anomalies (rolling z-score), expose a FastAPI query API, ship to Docker. Demonstrates: streaming data handling, memory discipline, API design, packaging.

2. **Async LLM gateway** — A FastAPI service that fans one prompt out to multiple LLM providers concurrently, streams the fastest response via SSE, tracks per-provider cost/latency metrics, retries with backoff, circuit-breaks failing providers. Demonstrates: asyncio mastery, streaming, resilience patterns — directly relevant to AI engineering roles.

3. **Distributed task queue from scratch** — Redis-backed job queue: enqueue with priorities and retries, worker pool via multiprocessing, heartbeat-based dead-worker detection, at-least-once semantics, a small monitoring dashboard. Demonstrates: concurrency, distributed-systems thinking, Redis. (Then read Celery's source and write a comparison.)

Each project: src layout, uv, full type hints, pytest suite with >80% coverage on core logic, CI via GitHub Actions, README with architecture diagram. The engineering around the code is what gets senior interviews.
`,

  "case-studies": `
### Instagram: Django at half a billion DAU
Instagram runs (a heavily tuned) Django. Notable engineering: they disabled the cyclic GC in web workers to preserve copy-on-write memory shared from the forked parent (uWSGI pre-fork model) — GC touching objects dirtied pages and exploded memory. Result: ~10% memory savings fleet-wide, later contributed upstream as gc.freeze(). Lesson: understanding runtime internals (refcounts, GC, fork COW) translates directly into millions of dollars at scale.

### Dropbox: 4M lines of typed Python
Dropbox hit the limits of untyped Python at millions of lines and built **mypy**, then annotated the codebase incrementally. They also moved their sync-engine hotspot from Python to Rust — but kept Python everywhere else. Lesson: types are what let dynamic languages scale organizationally; rewrite hotspots, not systems.

### The Faster CPython project (Microsoft-backed)
A dedicated team (including Guido) made 3.11 25–60% faster via the specializing adaptive interpreter, and continues with the 3.13 JIT. Lesson for interviews: Python performance is improving ~15-30%/release — "Python is slow" is a decade-stale take worth nuancing.

### OpenAI: Python as the AI control plane
Training orchestration, evals, and APIs are Python controlling C++/CUDA compute. The pattern — Python as the high-productivity control plane over compiled data planes — is the architecture of essentially every AI company today.
`,

  comparisons: `
| Dimension | Python | JavaScript/Node | Go | Rust | Java |
|-----------|--------|-----------------|-----|------|------|
| Typing | Dynamic + optional hints | Dynamic (TS fixes it) | Static, simple | Static, powerful | Static, verbose |
| Single-thread speed | Slowest of these | Fast (V8 JIT) | Fast | Fastest | Fast (JVM JIT) |
| Parallelism | Processes (GIL); 3.13 free-threading | Event loop + workers | Goroutines (best-in-class) | Threads, fearless | Threads, mature |
| Concurrency ergonomics | asyncio (decent) | async native | Excellent | Steep but safe | Virtual threads (21+) |
| ML/AI ecosystem | **Unmatched** | Growing (inference) | Thin | Growing (infra) | Moderate |
| Web frameworks | FastAPI/Django | Express/Nest | Gin/stdlib | Axum | Spring |
| Deploy artifact | Env + interpreter | Bundle + node | Single binary | Single binary | JAR + JVM |
| Best at | AI, data, glue, velocity | Full-stack sharing | Cloud infra, services | Systems, hot paths | Enterprise scale |

**How seniors choose**: Python when ML/data is involved or iteration speed dominates; Go for high-concurrency network services with small teams; Rust for the 1% of code where performance/safety is existential; TypeScript when one team owns front and back. Most real AI stacks: Python services + Rust/C++ kernels + TypeScript frontends.
`,

  "related-technologies": `
- **FastAPI / Django / Flask** — the Python web triad; learn FastAPI next if you're AI-focused.
- **Pydantic** — runtime validation from type hints; the data backbone of modern Python APIs and LLM structured outputs.
- **NumPy / pandas / polars** — vectorized data; polars is the modern high-performance choice.
- **PyTorch** — the deep-learning framework; Python front, C++/CUDA back.
- **uv / ruff** — Astral's Rust toolchain that modernized Python packaging and linting.
- **Celery / arq** — background task queues (see Message Queues).
- **SQLAlchemy + Alembic** — the ORM + migrations standard (see PostgreSQL).
- **Cython / PyO3+maturin** — compile hotspots; PyO3 is the modern Rust route.
- **Jupyter** — exploratory computing; where most AI work starts.
- **mypy / pyright** — static type checkers; pyright powers VS Code's Python IntelliSense.

On this platform, the natural next pages: **FastAPI** → **PostgreSQL** → **Docker** → **Concurrency** → **LLM Fundamentals**.
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — check python.org/downloads for anything newer.

- **Python 3.13** (Oct 2024): experimental **free-threaded build** (PEP 703 — the no-GIL future), experimental copy-and-patch **JIT**, dramatically better interactive REPL (colors, multiline editing), improved error messages.
- **Python 3.12** (2023): per-interpreter GIL groundwork (PEP 684), f-string formalization (arbitrary nesting), 2x faster comprehensions via inlining, buffer protocol in pure Python.
- **Python 3.14** (expected Oct 2025): **deferred evaluation of annotations** (PEP 649/749 — ends the from __future__ import annotations era), **template strings** (PEP 750), and continued JIT/free-threading maturation. Verify final contents on python.org.
- **Ecosystem shifts that matter more than language features**: uv has effectively won packaging; ruff has consolidated linting/formatting; Pydantic v2 (Rust core) made validation 5–50x faster; polars is displacing pandas for new performance-sensitive work.
- **Support window**: each minor release gets ~2 years of bugfixes, 5 years of security fixes. 3.9 hit end-of-life in late 2025 — audit your production versions.
`,

  "future-roadmap": `
Where Python is heading over the next few releases:

1. **Free-threading goes mainstream.** PEP 703's no-GIL build graduates from experimental as C extensions certify thread safety (NumPy, PyTorch actively working on it). Expect "supports free-threaded" to become a standard package badge, and true multi-core Python servers to follow.
2. **JIT maturation.** The copy-and-patch JIT (3.13+) is conservative today; the roadmap targets meaningful speedups as it learns more specializations. Combined with the adaptive interpreter, pure-Python performance keeps closing the gap.
3. **Subinterpreters** (PEP 734): multiple isolated interpreters per process, each with its own GIL — a middle path between threads and processes, exposed in the stdlib.
4. **Typing keeps deepening**: TypedDict/Protocol refinements, variadic generics adoption, and better inference — Python's gradual-typing story is converging on "typed by default" for serious codebases.
5. **Packaging convergence**: pyproject.toml + lockfile standardization (PEP 751) ends the decade of tool fragmentation; uv is the de facto reference implementation.

For your career: bet on async + typing + free-threading knowledge — those three are where "knows Python" separates from "senior Python engineer" over the next five years.
`,

  "cheat-sheet": `
~~~python
# --- Collections ---
xs = [1, 2, 3]; xs.append(4); xs[-1]; xs[1:3]     # list
d = {"a": 1}; d.get("b", 0); d.setdefault("c", []) # dict
s = {1, 2}; s & other; s | other                   # set ops
t = (1, 2); a, b = t                               # tuple unpack

# --- Comprehensions ---
[x*x for x in xs if x > 1]
{k: v for k, v in pairs}
(x for x in huge)                # generator — lazy

# --- Functions ---
def f(a, b=2, *args, kw_only=None, **kwargs): ...
lambda x: x * 2
from functools import lru_cache, partial, wraps, reduce

# --- Classes ---
from dataclasses import dataclass
@dataclass(frozen=True, slots=True)
class Point: x: float; y: float

# --- Errors ---
try: risky()
except (ValueError, KeyError) as e: handle(e)
else: only_if_no_error()
finally: always()
raise RuntimeError("msg") from original

# --- Files / paths ---
from pathlib import Path
text = Path("f.txt").read_text(encoding="utf-8")
with open("f.txt") as fh: ...

# --- Async ---
import asyncio
async def main():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(coro())
asyncio.run(main())

# --- Typing quickies ---
def g(x: int | None, xs: list[str]) -> dict[str, int]: ...
from typing import Protocol, TypeVar, Generic

# --- Stdlib gold ---
collections: defaultdict, Counter, deque, OrderedDict
itertools: chain, groupby, islice, product, batched
functools: cache, cached_property, singledispatch
json, csv, sqlite3, subprocess, secrets, datetime (use tz!)

# --- Env (uv) ---
# uv init / uv add pkg / uv sync / uv run cmd / uv run pytest
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What does the GIL lock? | Bytecode execution — one thread at a time per interpreter; released during IO and by many C extensions |
| list vs tuple | Mutable vs immutable; tuples hashable → usable as dict keys |
| How are default args evaluated? | Once, at function definition — never per call (hence the mutable-default bug) |
| is vs == | Identity vs equality; is only for None/True/False |
| Generator's superpower | Lazy evaluation — constant memory over any size stream |
| What makes something a context manager? | __enter__ and __exit__ (or @contextmanager) |
| Refcounting + what else for memory? | Generational cyclic GC for reference cycles |
| MRO algorithm | C3 linearization; inspect via __mro__ |
| async def function returns…? | A coroutine object — nothing runs until awaited |
| Threads help CPU-bound work? | No (GIL) — processes or C extensions; 3.13 free-threaded build changes this |
| Import executes the module how many times? | Once per process; cached in sys.modules |
| Money type? | int cents or decimal.Decimal — never float |
| Safe secret token? | secrets.token_urlsafe(32) — never the random module |
| Modern package/env tool | uv (pyproject.toml + uv.lock) |
| What is a descriptor? | Class attribute with __get__/__set__ — powers property, methods, ORM fields |
`,

  mcqs: `
**1. What prints?**

~~~python
def f(x, acc=[]):
    acc.append(x)
    return acc
f(1); print(f(2))
~~~

A) [2]  B) [1, 2]  C) [2, 1]  D) TypeError

**Answer: B** — the default list is created once and shared across calls.

**2. Which speeds up a CPU-bound pure-Python loop on standard CPython 3.12?**

A) threading  B) asyncio  C) multiprocessing  D) more await

**Answer: C** — the GIL blocks A; B/D only help IO-bound work.

**3. x = (1); type(x) is…?**

A) tuple  B) int  C) list  D) frozenset

**Answer: B** — parentheses alone don't make a tuple; the comma does: (1,).

**4. Which statement about import is TRUE?**

A) Modules re-execute on every import  B) sys.modules caches modules per process  C) Circular imports always crash  D) Imports are lazy by default

**Answer: B** — one execution per process; circular imports fail only when a needed name isn't yet bound.

**5. In async code, which call is safe on the event loop thread?**

A) time.sleep(1)  B) requests.get(url)  C) await asyncio.sleep(1)  D) heavy_numpy_crunch()

**Answer: C** — A, B and D block the loop, stalling every task.

**6. dict lookup average complexity, and the requirement on keys?**

A) O(n), keys sorted  B) O(1), keys hashable  C) O(log n), keys comparable  D) O(1), keys immutable

**Answer: B** — hash tables; note hashable usually means immutable, but it's hashability that's required.
`,

  "revision-notes": `
**Language core in 10 lines:** Everything is an object; names bind to objects. Dynamic but strong typing. Indentation defines blocks. Collections: list/tuple/dict/set — know their Big-O. Functions are objects; closures capture variables (late binding!). Defaults evaluate once. Exceptions for errors, specific and chained. Iterators/generators power lazy pipelines. Context managers own setup/teardown. Decorators wrap callables.

**Runtime in 5 lines:** Source → AST → bytecode → stack-VM eval loop. Refcounting frees immediately; cyclic GC catches cycles. GIL = one thread runs bytecode; IO releases it. Imports execute once and cache in sys.modules. 3.11+ adaptive interpreter specializes hot code; 3.13 adds JIT + optional free-threading.

**Concurrency in 4 lines:** asyncio for massive IO concurrency (one thread, cooperative). Threads for modest blocking IO. Processes for CPU. Never block the event loop.

**Production in 5 lines:** uv + pyproject.toml + committed lockfile. src layout, type hints, ruff + mypy + pytest in CI. Structured JSON logs, correlation IDs, RED metrics. Timeouts on all outbound calls; graceful SIGTERM. Multi-stage Docker, non-root, slim.

**Interview reflexes:** GIL nuance (IO vs CPU), mutable defaults, is vs ==, MRO/C3, descriptors → property, generators vs lists, import semantics, memory model, float-money trap, monotonic clocks for timing.
`,

  "learning-roadmap": `
A realistic path to senior-level Python (adjust pace to your background):

**Week 1–2 — Foundations.** Beginner Concepts section + Lab 1. Daily: solve 3 small problems (strings, dicts, files). Milestone: build any CLI tool you'll actually use.

**Week 3–4 — Idiomatic Python.** Intermediate Concepts: comprehensions, generators, decorators, context managers, dataclasses, typing. Refactor Week-1 code idiomatically. Milestone: you reach for a generator without thinking.

**Week 5–6 — Concurrency.** Advanced Concepts + Lab 2. Understand the GIL well enough to explain it to someone else. Milestone: the three-way scraper benchmark and a paragraph explaining the results.

**Week 7–8 — Internals + architecture.** Internal Working, Architecture, Data Flow sections; Lab 3 (mini framework). Read a small real codebase (httpx or FastAPI internals). Milestone: dis.dis holds no fear.

**Week 9–10 — Production.** Production Usage → Deployment sections; Lab 4. Milestone: a containerized, instrumented, tested service on your GitHub.

**Week 11–12 — Interview polish + first real project.** Interview/Coding Questions sections; start Real Project 2 (async LLM gateway). Milestone: explain GIL, MRO, descriptors, and async internals out loud, unprompted.

Then continue to **FastAPI** on this platform — everything here compounds there.
`,

  "official-docs": `
- [Python official documentation](https://docs.python.org/3/) — the reference; the tutorial section is genuinely good.
- [The Python Language Reference](https://docs.python.org/3/reference/) — precise semantics (data model chapter = descriptors, dunders).
- [The Python Standard Library](https://docs.python.org/3/library/) — skim the full index once; knowing what exists is half the skill.
- [PEP index](https://peps.python.org/) — read PEP 8 (style), PEP 20 (Zen), PEP 484 (typing), PEP 703 (free-threading).
- [What's New in Python](https://docs.python.org/3/whatsnew/) — release-by-release changes; read every new one.
- [uv documentation](https://docs.astral.sh/uv/) — modern packaging workflow.
- [typing documentation](https://typing.python.org/) — the typing spec and best practices.
`,

  books: `
- **Fluent Python, 2nd ed.** — Luciano Ramalho. THE book for going from writing Python to thinking in Python. Read after 3–6 months of practice.
- **Architecture Patterns with Python** — Percival & Gregory (free online as "Cosmic Python"). Repository pattern, service layers, DDD, event-driven — exactly the production architecture this platform teaches.
- **Effective Python, 3rd ed.** — Brett Slatkin. 90+ specific, immediately applicable best practices.
- **High Performance Python, 3rd ed.** — Gorelick & Ozsvald. Profiling, NumPy, Cython, concurrency — the performance section of this page, book-length.
- **Robust Python** — Patrick Viafore. Type-driven design for large codebases.
- **CPython Internals** — Anthony Shaw. Guided tour of the C source; for the "how does it REALLY work" itch.
- **Python Distilled** — David Beazley. Concise, senior-flavored core-language coverage.
`,

  blogs: `
- **Real Python** (realpython.com) — consistently high-quality tutorials at every level.
- **Astral blog** (astral.sh/blog) — uv/ruff releases; where packaging's future is announced.
- **PyCoder's Weekly** (pycoders.com) — the newsletter; the easiest way to stay current.
- **Brett Cannon** (snarky.ca) — core developer; packaging and language evolution insight.
- **Łukasz Langa** (lukasz.langa.pl) — CPython developer-in-residence; free-threading and release insight.
- **Seth Larson** (sethmlarson.dev) — Python security ecosystem.
- **Instagram Engineering / Dropbox Tech Blog** — the large-scale Python war stories cited in Case Studies.
- **Python Insider** (blog.python.org) — official release announcements.
`,

  "research-papers": `
Python-relevant systems papers worth reading as a senior engineer:

- **"The (lack of) Semantics of Python" discussions aside — start with PEP 703** (Sam Gross, 2023): the no-GIL design doc is effectively a systems paper: biased reference counting, immortalization, stop-the-world phases.
- **"Copy-and-Patch Compilation"** (Xu & Kjolstad, 2021) — the technique behind CPython 3.13's JIT.
- **"Tracing the Meta-Level: PyPy's Tracing JIT"** (Bolz et al., 2009) — how PyPy makes dynamic Python fast; foundational JIT thinking.
- **"Quantitative Overhead Analysis for Python"** (Barany, 2014) and **"Why do Programs Suffer from Interpretation Overhead?"**-style analyses — where interpreter time actually goes.
- **"Terra Incognita: On the Practicality of User-Space File Systems"**-class systems papers matter less than reading **CPython's own design docs**: the "Faster CPython" plans on GitHub (faster-cpython/ideas) are the living research agenda.

For AI engineers specifically: the PyTorch 2 paper (**"PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation"**, ASPLOS 2024) shows torch.compile intercepting Python bytecode — a beautiful applied use of the internals covered on this page.
`,

  videos: `
- **David Beazley — "Python Concurrency From the Ground Up" (PyCon 2015)** — builds an event loop live on stage; the single best concurrency talk ever given. Also his GIL talks (2010) remain the clearest GIL explanations.
- **Raymond Hettinger — "Beyond PEP 8" and "Transforming Code into Beautiful, Idiomatic Python"** — idiomatic thinking from a core developer.
- **James Powell — "So you want to be a Python expert?" (PyData 2017)** — data model, decorators, generators, context managers in one arc.
- **Łukasz Langa — free-threading talks (PyCon 2024/2025)** — the no-GIL transition from the inside.
- **Brandt Bucher — "A JIT Compiler for CPython" (CPython core sprints / PyCon 2024)** — the 3.13 JIT explained by its author.
- **ArjanCodes (YouTube)** — software design in Python; consistently solid for architecture habits.
- **CoreySchafer's series** — still the best free structured beginner-to-intermediate path.
`,

  "github-repos": `
- [python/cpython](https://github.com/python/cpython) — the source; read Lib/ modules (pure Python) like dataclasses.py — superbly educational.
- [astral-sh/uv](https://github.com/astral-sh/uv) and [astral-sh/ruff](https://github.com/astral-sh/ruff) — the modern toolchain.
- [pydantic/pydantic](https://github.com/pydantic/pydantic) — validation library powering FastAPI; study its typing usage.
- [encode/httpx](https://github.com/encode/httpx) — a beautifully structured async+sync codebase; great first "read a real library" target.
- [tiangolo/fastapi](https://github.com/tiangolo/fastapi) — see how decorators + type hints become a framework.
- [faif/python-patterns](https://github.com/faif/python-patterns) — design patterns in idiomatic Python.
- [satwikkansal/wtfpython](https://github.com/satwikkansal/wtfpython) — surprising behaviors; each one teaches a real semantics lesson.
- [cosmicpython/book](https://github.com/cosmicpython/book) — Architecture Patterns with Python, free.
- [TheAlgorithms/Python](https://github.com/TheAlgorithms/Python) — algorithm implementations for practice reference.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Collections fluency*: word-frequency counter over a large text file (Counter, generators) → top-K with heapq.
2. *Generators*: an infinite Fibonacci generator; then itertools.islice a window; then a pipeline: read → parse → filter → aggregate over a 1GB fake log without exceeding 50MB RAM.
3. *Decorators*: write @retry(times=3, backoff=2.0) with exponential backoff and exception filtering; then a @memoize with TTL.
4. *Context managers*: a Timer context manager; then one that acquires two locks in a deadlock-safe order.
5. *OOP/descriptors*: a TypedField descriptor enforcing types on assignment; mini-ORM row class using it.
6. *Concurrency*: producer/consumer with queue.Queue and threads; the same with asyncio.Queue; explain behavioral differences under load.
7. *Async*: fetch 100 URLs with a concurrency limit of 10 (semaphore) and per-request timeout, collecting partial failures without cancelling the batch.
8. *Testing*: take problem 3's retry decorator and test it thoroughly — including "time" without sleeping (mock the clock).

External sets: LeetCode (filter: hash table, two pointers — do them in idiomatic Python), Advent of Code (superb for stdlib fluency), exercism.org Python track (mentored feedback).
`,

  "architecture-diagram": `
The reference architecture for a production Python AI service — the shape you'll build repeatedly on this platform:

~~~mermaid
flowchart TB
    Client["Clients (web/mobile)"] --> LB["Load balancer / API gateway"]
    LB --> API1["FastAPI pod 1\n(uvicorn, async)"]
    LB --> API2["FastAPI pod N"]
    API1 & API2 --> PG[("PostgreSQL\nSQLAlchemy + Alembic")]
    API1 & API2 --> RD[("Redis\ncache · rate limits · queues")]
    API1 & API2 -->|enqueue| Q["Task queue (Celery/arq)"]
    Q --> W1["Worker pod(s)\nembeddings · emails · batch"]
    W1 --> PG
    API1 & API2 -->|async httpx| LLM["LLM APIs / model servers"]
    subgraph Observability
        PR["Prometheus"] --> GF["Grafana"]
        OT["OpenTelemetry traces"]
        LG["JSON logs → Loki/ELK"]
    end
    API1 -.metrics/traces/logs.-> Observability
    W1 -.metrics/traces/logs.-> Observability
~~~

Every box has a dedicated skill page on this platform; this diagram is the map of how they compose.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Python))
    Language
      Syntax & collections
      Functions & closures
      OOP · dataclasses
      Typing & Protocols
      Pattern matching
    Internals
      Bytecode & eval loop
      GIL
      Memory: refcount + GC
      Import system
      MRO & descriptors
    Concurrency
      asyncio
      Threads
      Multiprocessing
      Free-threading 3.13+
    Production
      uv & pyproject
      Testing: pytest
      Logging · metrics · tracing
      Docker deployment
      Security
    Ecosystem
      FastAPI · Django
      NumPy · PyTorch
      Pydantic
      Celery
    Career
      Interview classics
      Projects & labs
      Reading path
~~~
`,
};

export default python;
