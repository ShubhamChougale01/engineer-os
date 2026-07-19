import type { SkillContent } from "../types";

/**
 * FastAPI — full 50-section knowledge page.
 * Code blocks use ~~~ fences; no backticks or dollar-brace sequences.
 */
const fastapi: SkillContent = {
  overview: `
FastAPI is a modern Python web framework for building APIs, built on **Starlette** (the ASGI toolkit) and **Pydantic** (runtime validation from type hints). Its signature move: you declare a function with typed parameters, and FastAPI derives everything else — request parsing, validation, serialization, dependency injection, and a complete interactive OpenAPI documentation UI — from those types alone.

For an AI engineer, FastAPI is the default serving layer. It is the framework behind countless LLM gateways, RAG services, and model APIs; vLLM's OpenAI-compatible server and LangServe are built on it. The reasons are structural: async-first design handles thousands of concurrent slow LLM calls and token streams on modest hardware; Pydantic models define tool schemas and structured outputs; and streaming responses (SSE) are first-class. If the **Python** skill is the engine, FastAPI is the chassis you ship it in.

Key characteristics: type-hint-driven (the types ARE the API contract), async-native with sync fallback, automatic /docs (Swagger UI) and /redoc, dependency injection built into the signature, and performance among the fastest Python frameworks thanks to Starlette + Pydantic v2's Rust core.
`,

  history: `
FastAPI was created by **Sebastián Ramírez** (@tiangolo), released in December 2018. He had spent years building APIs with Flask and Django and cataloguing what he wanted: automatic docs, validation from types, async support, great editor completion. After studying every existing framework (his "alternatives, inspiration and comparisons" doc is famous), he combined Starlette's speed with Pydantic's validation.

| Year | Milestone |
|------|-----------|
| 2018 | First release — Starlette + Pydantic + OpenAPI generation |
| 2019 | Explosive GitHub growth; adopted by ML teams for model serving |
| 2020 | Enters the top tier of Python web frameworks in developer surveys |
| 2021 | SQLModel (same author) bridges Pydantic and SQLAlchemy; Ramírez goes full-time on FastAPI |
| 2022 | Used by Microsoft, Uber, Netflix internal services (per their engineers' public accounts) |
| 2023 | FastAPI 0.100 — **Pydantic v2** (Rust core): validation up to ~5–50x faster |
| 2024 | 0.111 — fastapi-cli (fastapi dev / fastapi run); Annotated-first dependency style |
| 2025 | 0.115.x line — richer OpenAPI 3.1, query/header/cookie models; still pre-1.0 but API-stable in practice |

Version caveat: numbers past early 2025 should be checked against fastapi.tiangolo.com/release-notes — the project releases frequently.
`,

  "why-it-exists": `
Before FastAPI, Python API developers chose between compromises:

- **Flask**: minimal and beloved, but synchronous (WSGI), no validation, no docs generation — every project hand-rolled request parsing, serialization, and error formats. See the **Flask** skill.
- **Django + DRF**: batteries included, but heavyweight for pure APIs, serializers duplicated model definitions, and async support arrived late and partially. See the **Django** skill.
- **aiohttp/Sanic**: async, but low-level — still no validation or docs story.

Meanwhile the type-hints era had arrived (PEP 484, 2015) and Pydantic proved types could drive runtime validation. Ramírez's insight was that **one source of truth — the typed function signature — could generate everything**: validation, serialization, documentation, and editor support. No decorators repeating what parameters exist, no schema files drifting from code, no docs written by hand.

FastAPI also arrived exactly when ML serving needed it: data scientists who knew Python type hints could suddenly ship production-quality APIs without learning a framework's parallel schema language. That timing is why it became the AI industry's serving default.
`,

  "problem-it-solves": `
FastAPI removes the three chronic API-development taxes:

1. **Validation boilerplate**: request parsing, type conversion, and error responses are derived from type hints. A wrong field returns a structured 422 with the exact location of the problem — code you never wrote.
2. **Documentation drift**: OpenAPI schema, Swagger UI, and ReDoc are generated from the live code. The docs cannot lie because they ARE the code. Client SDKs can be generated from the same schema.
3. **Concurrency ceiling**: ASGI + async handlers mean one worker holds thousands of concurrent connections — the exact shape of LLM workloads (long, slow, streaming responses). WSGI frameworks hold one request per worker thread.

Plus a quieter fourth: **dependency injection without a container** — shared logic (auth, DB sessions, pagination) declared as function parameters, resolved per-request, overridable in tests.

What it deliberately does NOT solve: it is not full-stack (no ORM, admin, templates bundled — you compose **SQLAlchemy**, etc.), not a task queue (pair with Celery/arq — see **Message Queues**), and not a magic async wand — blocking code in async routes still freezes the event loop (the #1 FastAPI production bug, covered in Anti-Patterns).
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Build a typed CRUD API with path/query/body validation and automatic docs.
2. Model requests and responses with Pydantic v2, including nested models, validators, and response_model filtering.
3. Use the dependency-injection system for auth, DB sessions, and shared parameters — including yield dependencies and test overrides.
4. Decide correctly between async def and def per route, and explain what FastAPI does with each.
5. Stream responses (SSE) for LLM token output; handle WebSockets.
6. Structure a production service: routers, services, repositories, settings, lifespan.
7. Test with TestClient and httpx.AsyncClient using dependency overrides.
8. Deploy with uvicorn workers behind Docker/Kubernetes with health checks, metrics, and graceful shutdown.
9. Answer senior interview questions on ASGI, DI design, and async pitfalls.
`,

  prerequisites: `
- **Required**: the **Python** skill through its intermediate concepts — especially type hints, decorators, and async/await. FastAPI is unusable without them and delightful with them.
- **Required**: HTTP basics — methods, status codes, headers, JSON (the **REST** skill covers this properly).
- **Helpful**: **PostgreSQL**/SQLAlchemy for the persistence examples; **Docker** for deployment; **JWT**/**OAuth 2.0** for the security section.

Dependency links: **Python** → this page → **PostgreSQL** (persistence) → **Docker**/**Kubernetes** (shipping) → **SSE**/**WebSockets** (streaming) → **Prometheus** (operating).
`,

  "beginner-concepts": `
### Install and first app

~~~python
# uv add fastapi "uvicorn[standard]"     (see the Python skill for uv)

# main.py
from fastapi import FastAPI

app = FastAPI(title="My API")

@app.get("/")
def read_root():
    return {"status": "ok"}          # dicts auto-serialize to JSON
~~~

~~~bash
uvicorn main:app --reload            # dev server on :8000
# or with fastapi-cli:  fastapi dev main.py
~~~

Open **/docs** — a full interactive Swagger UI already exists. That page alone explains FastAPI's popularity.

### Path and query parameters — typed and validated

~~~python
@app.get("/items/{item_id}")
def get_item(item_id: int, q: str | None = None, limit: int = 10):
    # item_id comes from the PATH -> converted to int (or 422 error)
    # q and limit come from the QUERY STRING -> ?q=phone&limit=5
    return {"item_id": item_id, "q": q, "limit": limit}
~~~

Send /items/abc and FastAPI returns a structured 422 explaining that item_id must be an integer — validation you never wrote.

### Request bodies with Pydantic

~~~python
from pydantic import BaseModel, Field

class ItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)               # must be positive
    tags: list[str] = []

@app.post("/items", status_code=201)
def create_item(item: ItemIn):
    # item is ALREADY validated and typed here — no manual parsing
    return {"created": item.name, "price": item.price}
~~~

The model appears in /docs with an editable example. Wrong JSON → automatic 422 with per-field errors.

### Status codes and errors

~~~python
from fastapi import HTTPException

@app.get("/users/{user_id}")
def get_user(user_id: int):
    user = fake_db.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
~~~

### The five route decorators

@app.get, @app.post, @app.put, @app.patch, @app.delete — one per HTTP method, mirroring REST semantics (see the **REST** skill for when to use which).

### Interactive docs are a feature, not a toy

/docs (Swagger UI) lets anyone try endpoints live; /redoc renders reference-style docs; /openapi.json is the machine-readable schema that code generators consume. Teams replace Postman collections with this.
`,

  "intermediate-concepts": `
### Response models — the output contract

~~~python
class UserOut(BaseModel):
    id: int
    email: str
    # note: NO password field

@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    user = db_get_user(user_id)      # may contain password_hash internally
    return user                      # response is FILTERED to UserOut fields
~~~

response_model validates output AND strips undeclared fields — your accidental-data-leak safety net.

### Routers — splitting the app

~~~python
# routers/users.py
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}")
def get_user(user_id: int): ...

# main.py
app.include_router(users.router)
app.include_router(orders.router)
~~~

### Dependency injection — FastAPI's superpower

~~~python
from typing import Annotated
from fastapi import Depends

def pagination(skip: int = 0, limit: int = 50):
    return {"skip": skip, "limit": min(limit, 100)}   # enforce a cap

Pagination = Annotated[dict, Depends(pagination)]

@app.get("/items")
def list_items(page: Pagination):
    return db_list(**page)

# Yield dependencies own setup/teardown (like context managers):
def get_db():
    db = SessionLocal()
    try:
        yield db                      # handler runs while suspended here
    finally:
        db.close()                    # ALWAYS runs, even on exceptions

DB = Annotated[Session, Depends(get_db)]
~~~

Dependencies compose (a dependency can depend on others), are cached per-request, and — critically — can be **overridden in tests** (see Testing).

### Auth as a dependency

~~~python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer = HTTPBearer()

def current_user(creds: Annotated[HTTPAuthorizationCredentials, Depends(bearer)]) -> User:
    user = decode_jwt(creds.credentials)       # see the JWT skill
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@app.get("/me")
def me(user: Annotated[User, Depends(current_user)]):
    return user
~~~

The security scheme even appears in /docs with an Authorize button.

### Middleware, CORS, and error handlers

~~~python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],   # never "*" with credentials
    allow_methods=["*"], allow_headers=["*"],
)

@app.exception_handler(DomainError)              # map domain errors -> HTTP
async def domain_error_handler(request, exc: DomainError):
    return JSONResponse(status_code=409, content={"detail": str(exc)})
~~~

### Background tasks and settings

~~~python
from fastapi import BackgroundTasks

@app.post("/signup")
def signup(user: UserIn, tasks: BackgroundTasks):
    create_user(user)
    tasks.add_task(send_welcome_email, user.email)   # after the response
    return {"ok": True}
# For heavy/reliable jobs use a real queue (Celery/arq) — see Message Queues.

# Settings: pydantic-settings, validated at startup (12-factor)
class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
~~~
`,

  "advanced-concepts": `
### async def vs def — what FastAPI actually does

| Route type | Execution | Use when |
|-----------|-----------|----------|
| async def | On the event loop | You await async libraries (httpx, asyncpg) |
| def | In a threadpool (~40 threads default) | Code uses blocking libraries (requests, psycopg2) |

The trap: **async def + blocking call** = the event loop freezes for EVERY request. A def route with blocking code is safe (threadpool); an async route with blocking code is a production incident. When in doubt and your libraries are sync — use def.

~~~python
@app.get("/bad")
async def bad():
    time.sleep(2)          # freezes the WHOLE server for 2s
    return {}

@app.get("/fine")
def fine():
    time.sleep(2)          # blocks one threadpool thread only
    return {}

@app.get("/best")
async def best():
    await asyncio.sleep(2) # yields the loop — thousands can wait together
    return {}
~~~

### Lifespan — startup and shutdown

~~~python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(timeout=10)   # shared pooled client
    yield                                             # app serves requests
    await app.state.http.aclose()                     # graceful cleanup

app = FastAPI(lifespan=lifespan)
~~~

### Streaming responses — LLM token output

~~~python
from fastapi.responses import StreamingResponse

@app.post("/chat")
async def chat(req: ChatIn):
    async def event_stream():
        async for token in llm_stream(req.prompt):     # async generator
            yield "data: " + token + "\\n\\n"           # SSE framing
        yield "data: [DONE]\\n\\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
~~~

This is the exact pattern behind every ChatGPT-style UI (client side in the **JavaScript** skill's labs; protocol details in **SSE**).

### WebSockets

~~~python
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            msg = await ws.receive_text()
            await ws.send_text("echo: " + msg)
    except WebSocketDisconnect:
        pass                                    # client left — clean up
~~~

### Advanced dependency patterns

- **Class dependencies**: a class with __call__ or __init__ params acts as a configurable dependency factory.
- **dependencies=[Depends(verify_key)]** on a router: enforcement without using the value — auth gates for entire route groups.
- **use_cache=False** for per-use fresh values within one request.
- **Global dependencies** (FastAPI(dependencies=[...])) for cross-cutting checks.

### Pydantic v2 power features

~~~python
class Order(BaseModel):
    model_config = ConfigDict(from_attributes=True)   # build from ORM objects

    id: int
    amount: Decimal
    status: Literal["pending", "paid", "failed"]      # enum-tight validation

    @field_validator("amount")
    @classmethod
    def positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("amount must be positive")
        return v

    @computed_field
    @property
    def display(self) -> str:
        return f"Order {self.id} ({self.status})"
~~~

Discriminated unions, TypeAdapter for validating arbitrary shapes, and model_validate_json (fast path straight from bytes) round out the toolkit — Pydantic is half of FastAPI mastery.
`,

  "internal-working": `
FastAPI is a thin, clever layer over two libraries — knowing the split demystifies everything:

~~~mermaid
flowchart TB
    C["Client"] --> U["uvicorn (ASGI server)\nparses HTTP -> ASGI messages"]
    U --> MW["Middleware stack (Starlette)"]
    MW --> R["Starlette router\nmatches path + method"]
    R --> D["FastAPI dependency resolver\nbuilds the dependency graph"]
    D --> V["Pydantic validation\npath/query/body -> typed args"]
    V --> H["Your handler function"]
    H --> S["Pydantic serialization\n(response_model filter)"]
    S --> U2["ASGI response -> bytes"]
~~~

Step by step:

1. **ASGI**: uvicorn translates raw HTTP into ASGI events (an async protocol — the successor to WSGI; this is why async is native, not bolted on).
2. **Starlette** provides routing, middleware, WebSockets, StreamingResponse — FastAPI subclasses Starlette; every Starlette feature works in FastAPI.
3. **At startup (not per request)** FastAPI introspects each route's signature: parameter sources (path/query/body), the dependency DAG, and compiled Pydantic validators. This front-loading is why per-request overhead stays low.
4. **Per request**: resolve dependencies in DAG order (cached per-request), validate inputs (Pydantic v2 validates in compiled Rust code), call the handler (event loop for async def, threadpool via anyio for def), then validate/serialize the response.
5. **OpenAPI**: the same introspection data generates /openapi.json once; Swagger UI and ReDoc are static pages reading it.

The elegant part: there is no magic registry or metaclass — it is type-hint introspection (inspect.signature + Pydantic) executed at import time. The same trick powers the platform's own catalog typing.
`,

  architecture: `
### Runtime architecture

One uvicorn worker = one process = one event loop + a threadpool for def routes. Production runs several workers behind a process manager or orchestrator:

~~~mermaid
flowchart LR
    LB["nginx / K8s Service"] --> W1["uvicorn worker 1\n(event loop + threadpool)"]
    LB --> W2["uvicorn worker 2"]
    LB --> WN["worker N ≈ cores"]
    W1 & W2 & WN --> PG[("PostgreSQL\n(pool per worker)")]
    W1 & W2 & WN --> RD[("Redis")]
    W1 & W2 & WN --> EXT["LLM APIs\n(shared AsyncClient)"]
~~~

Pool math that bites in production: connections = workers × pool_size — keep it under the database's max_connections (see **PostgreSQL**).

### Application architecture

The layered layout (this platform's own api/ follows it):

~~~
app/
├── main.py              # app factory + lifespan + router mounting ONLY
├── core/                # config (pydantic-settings), security, db session
├── api/v1/              # transport layer: routers, request/response schemas
│   ├── users.py
│   └── orders.py
├── services/            # business logic — pure Python, no FastAPI imports
├── repositories/        # data access behind Protocols
└── models/              # SQLAlchemy models / domain objects
~~~

Rules: routers stay thin (parse → call service → shape response); services never import fastapi (testable without HTTP); repositories are swappable (fakes in tests). Schemas (Pydantic) are the transport contract — distinct from ORM models, converted explicitly. This is the same clean architecture the **Python** skill prescribes, specialized for HTTP.
`,

  "data-flow": `
One authenticated POST /orders from wire to response:

~~~mermaid
sequenceDiagram
    participant C as Client
    participant U as uvicorn (ASGI)
    participant M as Middleware
    participant DI as Dependency resolver
    participant P as Pydantic
    participant H as Handler
    participant DB as PostgreSQL

    C->>U: POST /orders (JSON + Bearer token)
    U->>M: ASGI scope + receive/send
    M->>M: CORS check, request-id, timing
    M->>DI: route matched -> resolve deps
    DI->>DI: bearer -> current_user (JWT verify)
    DI->>DB: get_db yields a session
    DI->>P: parse + validate OrderIn body
    P-->>C: 422 with field errors (if invalid)
    DI->>H: call handler(user, db, order)
    H->>DB: INSERT ... (await / threadpool)
    H-->>DI: return ORM object
    DI->>P: response_model validate + filter
    P->>U: JSON bytes, status 201
    Note over DI,DB: get_db finally-block closes the session
    U->>C: response
~~~

Two details worth internalizing: dependency teardown (the code after yield) runs after the response is built — sessions close even when handlers raise; and validation errors short-circuit before your handler ever runs, so handlers can trust their inputs completely.
`,

  "production-usage": `
### Serving

~~~bash
# Production: multiple workers (or 1 per container, replicated by K8s)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
# or: fastapi run app/main.py --workers 4      (fastapi-cli wrapper)
# gunicorn -k uvicorn.workers.UvicornWorker for battle-tested process mgmt
~~~

Cloud-native default: 1 worker per container, scale by replica count (see **Kubernetes**); fat multi-worker containers suit single-VM deployments.

### Operational defaults real teams set

1. **Settings via pydantic-settings**, validated at import — missing config kills the pod at boot, not at request 10,000.
2. **One shared httpx.AsyncClient** created in lifespan — connection pooling; never create a client per request.
3. **Timeouts everywhere**: httpx explicit timeout, DB statement timeouts, and uvicorn --timeout-keep-alive tuned.
4. **API versioning** from day one: /api/v1 prefix on routers — this platform's api/ does exactly this.
5. **/healthz** (liveness) and **/readyz** (checks DB/Redis reachable) endpoints wired to orchestrator probes.
6. **ORJSONResponse as default_response_class** for hot JSON-heavy APIs.
7. Structured logs with a request-id middleware; docs disabled or auth-gated on internal services (docs_url=None).

### The AI-serving stack pattern

FastAPI gateway (auth, rate limits, streaming) → model backends (vLLM/TGI or provider APIs) → Redis for cache/rate-limit state → Celery/arq workers for embeddings and batch jobs. LangServe and most LLM-app templates are precisely this shape — learn it once here, recognize it everywhere.
`,

  "industry-examples": `
- **Microsoft**: FastAPI for ML services and APIs across teams (publicly credited by their engineers; tiangolo later worked with them on Windows dev tooling).
- **Uber**: internal ML/data services on FastAPI — cited among its earliest large adopters in the framework's own testimonials.
- **Netflix**: their open-source crisis-management platform **Dispatch** is built on FastAPI — a full production codebase you can read (see GitHub Repositories).
- **vLLM**: the dominant open-source LLM inference engine exposes its OpenAI-compatible REST server via FastAPI — meaning a large share of self-hosted LLM traffic worldwide flows through FastAPI handlers.
- **LangChain's LangServe**: deploys chains/agents as FastAPI apps — streaming, batching, and playground included.
- **Hugging Face**: multiple inference tooling components and countless Spaces use FastAPI as the HTTP layer.
- **Explosion (spaCy)**: NLP demo/serving infrastructure on FastAPI from its early days.

Pattern: FastAPI dominates exactly where Python must serve models over HTTP with validation, docs, and streaming — the AI engineer's home turf.
`,

  "best-practices": `
1. **Pick async or sync per route honestly**: async def only when every IO call inside is awaited; otherwise def. Mixed teams write it into review checklists.
2. **Schemas ≠ ORM models**: separate Pydantic In/Out models from SQLAlchemy models; convert explicitly (from_attributes). Coupling them leaks columns and breaks migrations.
3. **response_model on every route** — output contract, filtering, and docs in one line.
4. **Thin routers, fat services**: handler = parse, delegate, respond. Business logic lives in plain Python (testable without TestClient).
5. **Yield dependencies for anything with cleanup** (sessions, locks, clients) — exception-safe by construction.
6. **Annotated dependency aliases** (DB = Annotated[Session, Depends(get_db)]) — declared once, reused everywhere, self-documenting signatures.
7. **Version your API** (/api/v1) and never break published contracts; add fields, don't repurpose them.
8. **Auth as a dependency, applied at router level** for whole surfaces (dependencies=[Depends(require_user)]) — impossible to forget on a new route.
9. **Map domain exceptions to HTTP once** with exception handlers — services raise DomainError, never HTTPException (keep HTTP out of business logic).
10. **Disable public docs on internal services**; gate them behind auth on admin surfaces.
11. **Pin FastAPI + Pydantic versions together** in the lockfile; upgrade deliberately (Pydantic majors are breaking).
12. **Load-test streaming endpoints separately** — token streams hold connections open; capacity math differs from request/response routes.
`,

  "anti-patterns": `
### Blocking the event loop — THE FastAPI bug

~~~python
# WRONG — async route, blocking library: freezes every request
@app.get("/report")
async def report():
    data = requests.get("https://slow.example.com").json()  # blocks loop!
    return data

# RIGHT (async lib)
@app.get("/report")
async def report_ok():
    r = await app.state.http.get("https://slow.example.com")
    return r.json()

# ALSO RIGHT (sync route -> threadpool)
@app.get("/report2")
def report_sync():
    return requests.get("https://slow.example.com", timeout=10).json()
~~~

### Returning ORM objects without a contract

~~~python
# WRONG — leaks every column (password_hash, internal flags), couples API to schema
@app.get("/users/{id}")
def get_user(id: int, db: DB):
    return db.get(User, id)

# RIGHT
@app.get("/users/{id}", response_model=UserOut)
def get_user_ok(id: int, db: DB): ...
~~~

### Other classics

- **Business logic in handlers** — 200-line route functions that can only be tested through HTTP.
- **Creating an httpx client (or DB engine!) per request** — connection churn; create once in lifespan.
- **HTTPException raised from services** — HTTP concerns buried in domain code; raise domain errors, map at the edge.
- **Depends used for plain values** — DI is for shared/resource logic, not constants.
- **BackgroundTasks for critical work** — it dies with the process; durable jobs belong in a queue (**Message Queues**).
- **allow_origins=["*"] with credentials** — browsers reject it, and it signals unreviewed CORS (see **CSRF**).
- **One giant main.py** — routers exist; use them from the second endpoint onward.
`,

  performance: `
### Measure first

- **Load**: hey, wrk, or locust against realistic payloads; k6 for scripted scenarios.
- **Profile**: py-spy top --pid on a loaded worker (production-safe) shows where CPU goes; pyinstrument for per-request flame graphs in dev.
- **Loop health**: asyncio debug mode logs slow callbacks; event-loop lag gauges in prod (see Monitoring).

### Optimization hierarchy

1. **Fix blocking-in-async first** — it masquerades as "FastAPI is slow" and is a correctness bug, not a tuning knob.
2. **Async database drivers** for async routes: asyncpg (**PostgreSQL**) is dramatically faster than psycopg2-in-threadpool for high concurrency.
3. **Connection pooling**: shared AsyncClient, SQLAlchemy pool sized to workers × pool < db max.
4. **ORJSONResponse**: orjson serializes large payloads several times faster than stdlib json.
5. **Trim Pydantic work on hot paths**: model_validate_json (bytes → model, one pass), exclude computed fields you don't need.
6. **Cache** at the right layer: Redis for shared results (**Redis** skill), lru_cache for pure in-process lookups.
7. **uvloop** (installed with uvicorn[standard]) — faster event loop, free win.
8. **Workers ≈ cores** for async apps; more only helps if threadpool-bound.

### Reference numbers (order of magnitude, mid-range hardware)

A trivial async JSON route on one worker: tens of thousands of req/s (TechEmpower-class results — FastAPI sits at the top of Python full-frameworks). A realistic DB-backed route: 1–5k req/s per worker, dominated by query cost. Pydantic v2 validation: microseconds for small models — almost never your bottleneck; the database and downstream APIs are.
`,

  scalability: `
FastAPI apps scale exactly like the **Python** skill describes — horizontally, stateless — with async multiplying per-worker concurrency:

- **Concurrency model**: an async worker holds thousands of in-flight requests waiting on IO (LLM streams, DB queries). CPU-bound work does NOT multiplex — offload it (workers, queues) or it serializes the loop.
- **Statelessness**: sessions/state in **Redis**/**PostgreSQL**; any replica serves any request; scaling = replica count behind a **Load Balancer**.
- **Long-lived connections** (SSE/WebSockets) change capacity planning: budget by concurrent connections per worker (thousands) rather than req/s, and use sticky-less designs (tokens carry state) so replicas stay interchangeable.

| Bottleneck | Symptom | Answer |
|------------|---------|--------|
| Event loop blocked | All latencies spike together | Find sync call in async route; py-spy confirms |
| DB pool exhausted | 500s/timeouts under load | Pool sizing, statement timeouts, read replicas |
| Threadpool saturated (def routes) | Queueing at ~40 concurrent | Raise anyio threadpool tokens or go async |
| Downstream LLM latency | Slow responses, healthy CPU | Stream to users, cache, hedge, parallel providers |
| One hot endpoint | Uneven load | Rate limit (Redis), cache, split service |

Background work goes to Celery/arq via **RabbitMQ**/**Redis** — API pods stay latency-focused while worker pools scale independently. For the full distributed picture: **System Design** category.
`,

  security: `
### FastAPI-specific posture

1. **Validation is your first firewall** — typed models reject malformed input before handlers run. Constrain aggressively: Field(max_length=...), Literal enums, strict types. Unbounded str fields accepting megabytes are self-inflicted DoS.
2. **Auth via security dependencies**: OAuth2PasswordBearer / HTTPBearer integrate with docs and centralize verification (**JWT**, **OAuth 2.0 / OIDC** skills). Apply at router level so new endpoints inherit protection.
3. **response_model as leak prevention** — the filter that keeps password_hash and internal fields out of responses even when someone returns the raw ORM object.
4. **SQL injection**: use SQLAlchemy parameter binding — never f-strings into text() (full attack anatomy in **SQL Injection**).
5. **Docs exposure**: /docs and /openapi.json enumerate your entire attack surface — disable or auth-gate on non-public services.
6. **CORS precisely**: explicit origins; wildcard + credentials is both insecure and non-functional.
7. **Rate limiting**: slowapi or a Redis token bucket as middleware/dependency (the **Redis** skill implements one) — LLM endpoints especially, where each request costs real money.
8. **Secrets via pydantic-settings from env/vault** (**Secrets Management**) — never defaults in code for production values.
9. **Trusted hosts + proxy headers**: TrustedHostMiddleware and correct --proxy-headers setup behind load balancers so client IPs and schemes are real.

The rest of the checklist is the **OWASP Top 10** skill applied to any API: security headers, dependency audits, structured authz checks per resource (not just authn).
`,

  testing: `
FastAPI's testability is a design feature: TestClient runs the app in-process (no server), and dependency_overrides swaps real resources for fakes.

~~~python
# tests/test_orders.py
from fastapi.testclient import TestClient
from app.main import create_app
from app.core.db import get_db
from app.api.deps import current_user

app = create_app()

def fake_db():
    yield InMemoryDb()                       # fake repository/session

app.dependency_overrides[get_db] = fake_db
app.dependency_overrides[current_user] = lambda: User(id=1, email="t@x.com")

client = TestClient(app)

def test_create_order():
    r = client.post("/api/v1/orders", json={"item": "gpu", "qty": 2})
    assert r.status_code == 201
    assert r.json()["item"] == "gpu"

def test_validation_error_shape():
    r = client.post("/api/v1/orders", json={"qty": -1})
    assert r.status_code == 422
    fields = {e["loc"][-1] for e in r.json()["detail"]}
    assert {"item", "qty"} <= fields          # both problems reported
~~~

### Async tests and streaming

~~~python
import httpx, pytest

@pytest.mark.asyncio
async def test_stream():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://t") as ac:
        async with ac.stream("POST", "/chat", json={"prompt": "hi"}) as r:
            chunks = [c async for c in r.aiter_text()]
    assert any("data:" in c for c in chunks)
~~~

### Doctrine

Test through the HTTP boundary for contracts (status codes, error shapes, filtering) and at the service layer for business logic (plain pytest, no client). Override dependencies instead of patching internals — that is what the DI system is FOR. Keep a tiny suite of real-database integration tests (testcontainers) for query correctness; everything else runs on fakes in milliseconds. Full testing philosophy: the **Python** skill's testing section.
`,

  debugging: `
### Escalation path

1. **Read the 422 payload** — validation "bugs" are usually the client's payload; detail lists exact locations (body → field → reason).
2. **uvicorn --reload --log-level debug** in dev: request lines, reload triggers.
3. **breakpoint() in a handler** — with TestClient everything is one process; step straight into dependency resolution and services (pdb basics in the **Python** skill).
4. **Print the resolved app**: app.routes to verify what actually mounted (router prefix typos), route.dependant to inspect a route's dependency tree.
5. **Middleware ordering issues**: remember middleware wraps in reverse-add order; log entry/exit to see the true chain.
6. **Frozen server** (the classic): py-spy dump --pid PID — the stack will show a blocking call inside an async route; fix per Anti-Patterns.
7. **Streaming breaks in prod but not dev**: usually a buffering proxy — nginx needs proxy_buffering off (X-Accel-Buffering: no header) for SSE.
8. **Debug 500s**: add an exception-logging middleware that captures request-id + traceback before the JSON error response; never expose tracebacks to clients.

### Async-specific

RuntimeError "Event loop is closed" in tests → mismatched async fixtures (use pytest-asyncio consistently). Un-awaited coroutine warnings → a missing await inside a dependency or handler; the call silently never ran.
`,

  monitoring: `
### Metrics (Prometheus)

~~~python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app, endpoint="/metrics")
# Out of the box: request count/latency by handler+status, in-progress gauge
~~~

Add the two Python-runtime signals that matter (from the **Python** skill's monitoring section): event-loop lag gauge and process memory. For LLM gateways add per-model counters: tokens in/out, upstream latency, cost estimate per route.

### Tracing

~~~python
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
FastAPIInstrumentor.instrument_app(app)
# + httpx / SQLAlchemy instrumentors -> spans across the whole request path
~~~

One request becomes a waterfall: middleware → dependency (DB acquire) → handler → httpx call to LLM → serialization. Slow-request mysteries die here (**OpenTelemetry** skill).

### Logs

Request-id middleware (contextvars-propagated, so it survives awaits), JSON logs with route/status/latency, and the golden rule: log at the edges (request summary, upstream failures), not inside business loops. Alert on p99 latency, 5xx rate, event-loop lag, and pool saturation — symptoms users feel; dashboards in **Grafana**.
`,

  deployment: `
### Production Dockerfile (uv-based, mirrors this platform's api/)

~~~dockerfile
# ---- build ----
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev   # deps layer: cached
COPY app/ app/
RUN uv sync --frozen --no-dev

# ---- runtime ----
FROM python:3.12-slim
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY app/ app/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

Per-line why: slim base (CVE surface), lockfile-frozen deps cached separately from code (fast rebuilds), non-root (container escape mitigation), PYTHONUNBUFFERED (logs stream), exec-form CMD (SIGTERM reaches uvicorn directly — it drains connections gracefully by default).

### Kubernetes essentials

- readinessProbe → /readyz (checks DB/Redis), livenessProbe → /healthz (process up).
- 1 worker per pod; scale replicas; requests/limits sized from load tests.
- terminationGracePeriodSeconds > your longest streaming response, or streams get cut on deploys.
- Behind nginx/ingress: proxy_buffering off for SSE routes; --proxy-headers + forwarded-allow-ips so real client IPs arrive.

Pipeline: ruff + mypy + pytest → build image → scan → push → rolling deploy (**GitHub Actions**, **Docker**, **Kubernetes** skills).
`,

  "production-checklist": `
Before a FastAPI service takes real traffic:

- [ ] Settings validated at startup (pydantic-settings); missing env kills boot
- [ ] Every route has response_model (or explicit response class)
- [ ] No blocking calls in async routes — reviewed AND verified under load with py-spy
- [ ] Shared httpx.AsyncClient + DB engine created in lifespan, closed on shutdown
- [ ] Timeouts: httpx explicit, DB statement timeout, keep-alive tuned
- [ ] Auth dependency applied at router level; docs gated or disabled if internal
- [ ] Domain exceptions mapped to HTTP via handlers; no raw 500 tracebacks to clients
- [ ] CORS locked to explicit origins
- [ ] Rate limiting on expensive endpoints (LLM routes especially)
- [ ] /healthz + /readyz wired to orchestrator probes
- [ ] Graceful shutdown verified: kill a pod mid-stream, confirm drain behavior
- [ ] Prometheus metrics + event-loop lag; OTel tracing to your backend
- [ ] Structured JSON logs with request IDs end-to-end
- [ ] DB pool math: workers × pool_size < max_connections
- [ ] Load test done on BOTH request/response and streaming endpoints
- [ ] FastAPI + Pydantic versions pinned together in the lockfile
`,

  "common-mistakes": `
1. **async def with requests/psycopg2/time.sleep** — freezes every request; the single most common FastAPI incident. Fix: async libs or def routes.
2. **Missing response_model** — leaks ORM internals the day someone returns the raw object.
3. **Mutable default in a dependency signature** (def dep(filters: list = [])) — same Python trap, now shared across requests.
4. **Confusing query vs body params** — a bare str param is a QUERY param; request bodies need a Pydantic model (or Body()). Symptom: mysterious 422s.
5. **Creating engines/clients per request** — connection storms under load; lifespan exists for this.
6. **BackgroundTasks for must-not-lose work** — it vanishes on pod restart; queues are for durability.
7. **Trusting the threadpool infinitely** — def routes share ~40 threads; 41 concurrent slow syncs = queueing. Monitor it.
8. **Catching Exception in handlers to return 500 manually** — you just erased tracebacks and broke exception handlers; let the framework and your handlers do their jobs.
9. **Version drift between Pydantic and FastAPI** — upgrading one without the other breaks in subtle validator ways; pin and upgrade together.
10. **Ignoring 422 contract in clients** — frontends that don't parse detail arrays show users "something went wrong" instead of "price must be positive".
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| 422 Unprocessable Entity | Payload doesn't match the model | Read detail: exact field + reason; fix client or loosen model |
| "field required" on a param you sent | Sent as query when expected in body (or vice versa) | Pydantic model = body; bare params = query/path |
| RuntimeError: no running event loop | Calling async code from sync context | await it, or asyncio.run at entrypoints only |
| 307 Temporary Redirect surprises | Trailing-slash mismatch (/items vs /items/) | Be consistent; redirect_slashes option |
| CORS error in browser | Missing/wrong CORSMiddleware origins | Explicit origins; remember middleware order |
| Depends value is a Depends object | Forgot Depends() wrapper or Annotated | param: Annotated[T, Depends(dep)] |
| psycopg2 in async route "works" then stalls | Blocking driver on the loop | asyncpg / SQLAlchemy async, or def route |
| SSE works locally, buffers in prod | nginx proxy buffering | proxy_buffering off / X-Accel-Buffering: no |
| "Event loop is closed" in tests | Mixed sync/async test fixtures | pytest-asyncio mode=auto; ASGITransport client |
| 500 with Pydantic serialization error | Handler returned object not matching response_model | Convert explicitly; from_attributes=True for ORM |

Debugging order: check /docs for what the route actually expects → read the 422/500 body → reproduce with TestClient in one file.
`,

  faqs: `
**Q: Is FastAPI production-ready if it's still 0.x?**
Yes — it powers Microsoft/Uber/Netflix services and most of the LLM-serving ecosystem. The 0.x reflects semver caution; breaking changes are rare and well-documented. Pin versions like any dependency.

**Q: FastAPI or Flask?**
New APIs: FastAPI — validation, docs, async, DI are free. Flask remains fine for small sync apps and has a huge extension legacy (see the **Flask** skill for its strengths). Migrating Flask → FastAPI is mostly mechanical.

**Q: FastAPI or Django?**
Different jobs. Django for full-stack products wanting ORM+admin+auth batteries (**Django** skill); FastAPI for API-first services, microservices, and ML serving. Plenty of teams run both.

**Q: Do I need async?**
No — def routes run in a threadpool and are perfectly production-ready for moderate concurrency with sync libraries. Go async when concurrency is high or you're streaming; go all-in (async drivers included) when you do.

**Q: Where does the ORM come from?**
You choose: SQLAlchemy (standard), SQLModel (tiangolo's Pydantic+SQLAlchemy bridge), or others. FastAPI is unopinionated — the **PostgreSQL** skill covers the SQLAlchemy path this platform uses.

**Q: How do I serve an actual ML model?**
Small models: load in lifespan, run inference in def routes (CPU-bound → threadpool) or a process pool. LLMs: dedicated inference server (vLLM/TGI) with FastAPI as the gateway — auth, rate limits, streaming passthrough.

**Q: Is Pydantic validation slow?**
v2's Rust core validates small models in microseconds. Your database and LLM calls are thousands of times slower. Measure before blaming it.
`,

  "interview-questions": `
**Junior/Mid:**

1. *Why is FastAPI fast — what is it built on?* Starlette (ASGI, async routing) + Pydantic v2 (Rust-core validation) + uvicorn/uvloop. FastAPI itself is a thin DI + OpenAPI layer.
2. *How does FastAPI know a parameter is path vs query vs body?* Path params match the route template; Pydantic models become the JSON body; remaining scalars default to query params.
3. *What does response_model do?* Validates output, FILTERS to declared fields (leak prevention), and drives the OpenAPI schema.
4. *What is Depends?* Declarative per-request dependency injection: resolved before the handler, cached per request, composable, and overridable in tests.
5. *What happens on invalid input?* Pydantic raises; FastAPI returns 422 with a detail array of locations/messages — the handler never runs.
6. *async def vs def route?* async runs on the event loop (must not block); def runs in a threadpool (safe for blocking libraries).

**Senior:**

7. *Walk through a request's lifecycle.* ASGI server → middleware stack → route match → dependency DAG resolution (with per-request cache) → Pydantic input validation → handler (loop or threadpool) → response validation/serialization → middleware unwind → teardown of yield-deps. (Diagram in Data Flow.)
8. *How would you diagnose "every endpoint got slow at once"?* Classic loop blockage: py-spy dump shows a sync call in an async route; confirm with event-loop lag metric; fix by async client or def route. Discuss prevention: lint rules, review checklist, load tests.
9. *Design the dependency graph for multi-tenant auth.* bearer → decode JWT → load user (cached) → tenant extractor → authorization dep per resource; router-level dependencies for enforcement; overrides for tests; discuss caching identity per request and NOT caching authorization decisions across requests.
10. *How do yield dependencies interact with exceptions?* Code after yield runs during unwinding even when the handler raises — equivalent to context managers; enables session close/rollback patterns; teardown order is reverse of setup.
11. *How would you build an OpenAI-compatible streaming gateway?* POST /v1/chat/completions with a Pydantic model mirroring the spec; StreamingResponse over an async generator proxying the upstream (shared AsyncClient), per-user rate limiting in Redis, token counting middleware, graceful client-disconnect handling (finally block cancels upstream), and buffering-safe deployment (nginx config).
12. *Scaling: 50k concurrent SSE connections — what breaks first?* File descriptors/ulimits, per-connection memory, LB idle timeouts, then worker distribution. Answers: raise limits, budget memory per conn, tune LB timeouts above stream duration, spread across replicas, and consider dedicated streaming pods.
`,

  "coding-questions": `
### 1. Redis-less rate-limit dependency (DI + state + headers)

~~~python
import time
from fastapi import Depends, HTTPException, Request

class RateLimiter:
    """Token bucket per client IP, in-process (single-worker demo).
    Production: same logic with Redis INCR/EXPIRE — see the Redis skill."""
    def __init__(self, rate: float, capacity: int):
        self.rate, self.capacity = rate, capacity
        self.buckets: dict[str, tuple[float, float]] = {}   # ip -> (tokens, ts)

    def __call__(self, request: Request) -> None:
        ip = request.client.host if request.client else "unknown"
        tokens, last = self.buckets.get(ip, (float(self.capacity), time.monotonic()))
        now = time.monotonic()
        tokens = min(self.capacity, tokens + (now - last) * self.rate)
        if tokens < 1:
            raise HTTPException(status_code=429, detail="Rate limit exceeded",
                                headers={"Retry-After": "1"})
        self.buckets[ip] = (tokens - 1, now)

limit_10_per_min = RateLimiter(rate=10 / 60, capacity=10)

@app.get("/expensive", dependencies=[Depends(limit_10_per_min)])
def expensive(): ...
~~~

Follow-ups: multi-worker correctness (shared store), per-user vs per-IP keys, sliding-window comparison.

### 2. Cursor pagination done right (query design + models)

~~~python
from pydantic import BaseModel

class Page(BaseModel):
    items: list[ItemOut]
    next_cursor: int | None       # opaque to clients; id-based here

@app.get("/items", response_model=Page)
def list_items(cursor: int = 0, limit: int = Query(20, le=100), db: DB = ...):
    rows = db.execute(
        select(Item).where(Item.id > cursor).order_by(Item.id).limit(limit + 1)
    ).scalars().all()
    has_more = len(rows) > limit
    items = rows[:limit]
    return Page(items=items, next_cursor=items[-1].id if has_more else None)
~~~

Why cursor beats offset: OFFSET n scans n rows (slow at depth, skips/dupes under writes); the indexed WHERE id > cursor is O(log n) and stable. Follow-ups: compound cursors (created_at, id), encoding cursors opaquely.

### 3. SSE endpoint with disconnect-safe cleanup (streaming + cancellation)

~~~python
@app.post("/chat")
async def chat(req: ChatIn, request: Request):
    async def stream():
        upstream = llm_stream(req.prompt)          # async generator
        try:
            async for token in upstream:
                if await request.is_disconnected():   # user hit stop
                    break
                yield "data: " + token + "\\n\\n"
            else:
                yield "data: [DONE]\\n\\n"
        finally:
            await upstream.aclose()                # cancel upstream — stop paying
    return StreamingResponse(stream(), media_type="text/event-stream",
                             headers={"X-Accel-Buffering": "no"})
~~~

Follow-ups: heartbeat comments for proxy keep-alive, resume tokens, per-stream metrics (TTFT).
`,

  "hands-on-labs": `
### Lab 1 — Typed CRUD from scratch (beginner, ~2h)
Notes API: POST/GET/PATCH/DELETE with Pydantic models, response_model everywhere, proper status codes, and a wrong-payload tour of /docs and 422 bodies. Storage: in-memory dict. Deliverable: the API + a screenshot-worthy /docs. Skills: routing, validation, contracts.

### Lab 2 — Dependencies in anger (intermediate, ~3h)
Add to Lab 1: SQLite via SQLAlchemy with a yield get_db dependency, pagination dependency with caps, API-key auth on a router via dependencies=[...], and a domain-error → HTTP exception handler. Then write TestClient tests that override get_db with a fake. Deliverable: green test suite proving overrides work. Skills: the DI system end to end.

### Lab 3 — Blocking-bug autopsy (advanced, ~2h)
Deliberately write an async route calling time.sleep(2); load test with hey and watch every route stall; capture the py-spy dump showing the culprit; fix three ways (async lib / def route / run_in_executor) and re-measure. Deliverable: before/after latency table + one paragraph on why. Skills: THE production failure mode, experienced safely.

### Lab 4 — Streaming LLM gateway (production, ~4h)
POST /chat that streams from a provider API (or a fake token generator) via SSE: shared AsyncClient in lifespan, rate-limit dependency, request-id logs, Prometheus metrics (+ TTFT histogram), disconnect handling, Dockerfile, and a load test of 100 concurrent streams. Deliverable: the containerized gateway — the exact architecture of Lab 4 in the **JavaScript** skill, from the server side. Skills: everything this page teaches, composed.
`,

  "real-projects": `
1. **Multi-provider LLM gateway** — One OpenAI-compatible API in front of several providers: streaming SSE passthrough, per-user Redis rate limits and token accounting, provider failover with circuit breakers, cost dashboard endpoint, admin router with key management. Engineering bar: dependency-injected provider clients, full test suite with overridden fakes, OTel traces across upstream calls, load-tested streaming. This is a real product category (LiteLLM) — building one teaches the whole AI-serving stack.

2. **RAG service with evaluation hooks** — /ingest (files → chunks → embeddings via background workers), /query (retrieve + generate, streamed), /feedback capture, and an eval endpoint replaying a golden set. Composes **PostgreSQL** + a vector store (**Qdrant**/**Chroma**) + **Message Queues**. Demonstrates the retrieval architecture every AI team runs.

3. **Webhook fan-out platform** — Receive webhooks (HMAC-verified), persist, and reliably deliver to subscriber URLs with retries/backoff and a dead-letter queue; management API + delivery-status SSE feed. Demonstrates: durability thinking, idempotency keys, at-least-once semantics — backend-interview gold.

Each: src layout, uv, typed throughout, CI (ruff+mypy+pytest), README with the architecture diagram. Engineering wrapper > feature count.
`,

  "case-studies": `
### Netflix Dispatch: FastAPI as an internal-tools backbone
Netflix open-sourced Dispatch (crisis management) built on FastAPI + Postgres: thin routers, service layers, Pydantic contracts throughout — and its repo remains one of the best readable examples of FastAPI at organizational scale. LESSON: the patterns on this page are literally how a top engineering org structures FastAPI; read the source (GitHub Repositories).

### vLLM's OpenAI-compatible server: FastAPI at the center of open LLM serving
The highest-throughput open inference engine chose FastAPI for its HTTP layer: Pydantic models mirror the OpenAI spec, StreamingResponse carries tokens, and the heavy lifting stays in the engine. LESSON: FastAPI as thin gateway over a compute core is THE model-serving architecture — validation and streaming at the edge, kernels underneath.

### Uber's early ML adoption
Uber engineers publicly credited FastAPI for ML microservices where iteration speed and docs mattered: data scientists shipped services without a platform team translating for them. LESSON: type-hint-driven APIs collapse the researcher→production gap — the original promise, verified at scale.

### Pydantic v2 migration (2023): the ecosystem stress test
FastAPI 0.100 adopted Pydantic's Rust rewrite; codebases upgrading carelessly hit validator API changes, while those pinning and reading migration guides sailed through — and won 5–50x validation speedups. LESSON: pin framework+validation versions together and upgrade deliberately; the reward for discipline was a free performance tier.
`,

  comparisons: `
| Dimension | FastAPI | Flask | Django/DRF | Express (Node) | NestJS |
|-----------|---------|-------|------------|----------------|--------|
| Language | Python | Python | Python | JavaScript | TypeScript |
| Async | Native (ASGI) | Bolt-on | Partial | Native | Native |
| Validation | Built-in (Pydantic) | DIY/extensions | Serializers | DIY (zod etc.) | Pipes + class-validator |
| Auto docs | Yes (OpenAPI) | No | Partial (DRF) | No | Yes (swagger module) |
| DI system | Built-in | No | No | No | Built-in (decorators) |
| Batteries | Minimal, compose | Minimal | Full (ORM, admin) | Minimal | Structured, opinionated |
| ML/AI serving | **The default** | Legacy common | Rare | Growing | Occasional |
| Sweet spot | APIs, ML serving | Small sync apps | Full-stack products | JS-team APIs | Large TS backends |

**How seniors choose**: Python + API-first or ML → FastAPI. Python + full-stack product with admin → **Django**. Tiny internal tool, sync, team knows it → **Flask**. Team is TypeScript-native → **NestJS**/**Express** (see those skills). The decision is team + workload, not framework benchmarks.
`,

  "related-technologies": `
- **Pydantic** — half of FastAPI's magic; deep fluency pays off everywhere (LLM structured outputs use it too).
- **Starlette** — the ASGI foundation; FastAPI subclasses it, so its docs apply directly.
- **uvicorn / uvloop** — the ASGI server; understand workers and lifecycle.
- **SQLAlchemy + Alembic** — the persistence pair (see **PostgreSQL**); SQLModel if you want Pydantic-native tables.
- **httpx** — async HTTP client that mirrors requests; the outbound half of your service.
- **Celery / arq** — durable background jobs (**Message Queues**, **Redis**).
- **LangServe / LiteLLM / vLLM** — the AI-serving ecosystem built on or around FastAPI.
- **Docker / Kubernetes / GitHub Actions** — the shipping pipeline for everything above.

Platform path from here: **PostgreSQL** (give your API a real database) → **Docker** → **JWT**/**OAuth 2.0** (production auth) → **SSE** (streaming deep-dive) → **Prometheus**/**Grafana** (operate it).
`,

  "latest-updates": `
Verified against my knowledge through mid-2025 — release cadence is high, check fastapi.tiangolo.com/release-notes.

- **FastAPI 0.115.x** (late 2024–2025 line): Query/Header/Cookie parameter models (validate grouped params with one Pydantic model), continued OpenAPI 3.1 refinement, deprecation cleanups.
- **fastapi-cli** (since 0.111): fastapi dev (reload, nice DX) and fastapi run (production defaults) as the blessed entrypoints.
- **Annotated-first style** is now canonical for dependencies and validation metadata — new code should use Annotated[T, Depends(...)] / Annotated[int, Query(le=100)].
- **Pydantic v2.x** keeps shipping performance and typing improvements; v1 compatibility shims are deprecated — new code targets v2 APIs only.
- **Ecosystem**: SQLModel maturing; prominence of FastAPI templates (full-stack-fastapi-template) as official starting points; LiteLLM/LangServe cementing FastAPI as the LLM-gateway substrate.
- **Still pre-1.0**: no announced 1.0 date as of my cutoff; API stability in practice has been strong for years.
`,

  "future-roadmap": `
Where FastAPI and its world are heading:

1. **Toward 1.0**: the public signal is stabilization — settled Annotated idioms, OpenAPI 3.1, cleanup of legacy parameter styles. Expect a formalization of what production users already rely on rather than upheaval.
2. **Pydantic as the AI schema layer**: structured LLM outputs, tool-calling schemas, and agent frameworks standardize on Pydantic models — FastAPI services get native fluency with AI contracts for free. Bet on this convergence.
3. **Deeper async ecosystem**: async SQLAlchemy patterns, async task queues (arq, taskiq) and testing tools keep closing the gaps that once forced sync fallbacks.
4. **AI-gateway pattern consolidation**: rate limiting, token metering, provider routing, and eval hooks are becoming reusable FastAPI middleware/dependencies (LiteLLM's trajectory) — the "LLM BFF" is now a standard architecture role.
5. **Python runtime gains flow through**: free-threading and JIT progress (see the **Python** skill's roadmap) directly raise FastAPI's ceiling — CPU-bound middleware and serialization get faster with zero code changes.

Career bet: FastAPI + Pydantic + streaming + observability is the AI-backend skill bundle — every section of this page compounds toward it.
`,

  "cheat-sheet": `
~~~python
# --- App & routes ---
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query, Request
app = FastAPI(title="API", lifespan=lifespan)
router = APIRouter(prefix="/api/v1/items", tags=["items"])
app.include_router(router)

@router.get("/{item_id}")             # path param
def get_item(item_id: int, q: str | None = None): ...   # q = query param

# --- Models (Pydantic v2) ---
class ItemIn(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)
class ItemOut(ItemIn):
    id: int
    model_config = ConfigDict(from_attributes=True)   # ORM objects OK

@router.post("", response_model=ItemOut, status_code=201)
def create(item: ItemIn): ...          # model param = JSON body

# --- Dependencies ---
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()
DB = Annotated[Session, Depends(get_db)]
router2 = APIRouter(dependencies=[Depends(require_user)])   # gate a router
app.dependency_overrides[get_db] = fake_db                  # in tests

# --- Errors ---
raise HTTPException(status_code=404, detail="Not found")
@app.exception_handler(DomainError)
async def handle(req, exc): return JSONResponse(409, {"detail": str(exc)})

# --- Async rules ---
# async def -> event loop: ONLY awaited IO inside
# def       -> threadpool: blocking libs are safe
# blocking call in async def = frozen server

# --- Streaming (SSE) ---
return StreamingResponse(gen(), media_type="text/event-stream")

# --- Lifespan ---
@asynccontextmanager
async def lifespan(app):
    app.state.http = httpx.AsyncClient(timeout=10)
    yield
    await app.state.http.aclose()

# --- Testing ---
client = TestClient(app)
r = client.post("/api/v1/items", json={"name": "gpu", "price": 999})
assert r.status_code == 201

# --- Run ---
# dev:  fastapi dev app/main.py     (or uvicorn app.main:app --reload)
# prod: uvicorn app.main:app --workers 4
# docs: /docs   /redoc   /openapi.json
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| FastAPI's two foundations? | Starlette (ASGI routing/middleware) + Pydantic (validation/serialization) |
| How are params classified? | Route template → path; Pydantic model → body; leftover scalars → query |
| What does response_model give you? | Output validation + field FILTERING (leak prevention) + docs schema |
| async def route with blocking call → ? | Entire event loop freezes — every request stalls; the #1 FastAPI bug |
| def route runs where? | Threadpool (~40 anyio threads) — blocking libraries are safe there |
| Yield dependency teardown runs when? | After the response, even if the handler raised — context-manager semantics |
| Dependency caching scope? | Per request: same dep used twice resolves once (use_cache=False opts out) |
| Test a route without real DB? | app.dependency_overrides[get_db] = fake — DI is the test seam |
| Invalid body returns…? | 422 with a detail array: location, field, message per error |
| Where do shared clients/engines live? | lifespan — created once, closed on shutdown; never per request |
| SSE response class? | StreamingResponse(gen, media_type="text/event-stream") + proxy buffering off |
| Auto docs URLs? | /docs (Swagger UI), /redoc, /openapi.json (schema) |
| Gate every route in a group? | APIRouter(dependencies=[Depends(check)]) — applied to all its routes |
| BackgroundTasks vs Celery? | BackgroundTasks dies with the process; durable/critical work → real queue |
| Pool sizing rule? | workers × pool_size < database max_connections |
`,

  mcqs: `
**1. A route is declared: def get(user_id: int, limit: int = 10). Where does limit come from?**

A) JSON body  B) Query string  C) Header  D) Path

**Answer: B** — scalars not in the path template default to query parameters; bodies require a Pydantic model (or explicit Body()).

**2. Which route freezes the whole server under load?**

A) def h(): time.sleep(1)  B) async def h(): await asyncio.sleep(1)  C) async def h(): time.sleep(1)  D) def h(): requests.get(url)

**Answer: C** — blocking inside async def stalls the event loop for everyone. A and D block only a threadpool thread; B yields correctly.

**3. response_model=UserOut on a route that returns a full ORM user with password_hash. What happens?**

A) 500 error  B) password_hash is included  C) Output is filtered to UserOut fields  D) Validation error always

**Answer: C** — response_model validates AND strips undeclared fields (with from_attributes for ORM objects). This is the leak-prevention feature.

**4. Code after yield in a dependency runs…**

A) Before the handler  B) Only on success  C) After the response, even on handler exceptions  D) Never in tests

**Answer: C** — yield dependencies behave like context managers; teardown participates in exception unwinding. That's why get_db can always close the session.

**5. The same Depends(get_settings) appears in three places in one request. How many times does it execute?**

A) 3  B) 1  C) 0  D) Depends on async vs sync

**Answer: B** — dependencies are cached per request by default; pass use_cache=False to opt out.

**6. Your SSE endpoint streams perfectly in dev but arrives all-at-once in production. Most likely cause?**

A) Pydantic buffering  B) uvicorn workers  C) Reverse-proxy response buffering  D) HTTP/2

**Answer: C** — nginx (and friends) buffer responses by default; disable proxy buffering or send X-Accel-Buffering: no for streaming routes.
`,

  "revision-notes": `
**Model in 6 lines**: FastAPI = Starlette (ASGI transport) + Pydantic (types → validation/serialization) + a DI system + generated OpenAPI. Typed function signatures are the single source of truth: path/query/body classification, 422 errors, docs, and editor support all derive from them. response_model is the output contract and leak filter. Routers split surfaces; versions live in prefixes. /docs is generated, always current. It's a thin layer — Starlette and Pydantic docs apply directly.

**Async in 4 lines**: async def → event loop, must await everything; def → threadpool, blocking is fine. Blocking inside async def freezes the entire server — the #1 incident, found with py-spy, prevented in review. Shared AsyncClient/engine in lifespan. Streaming = StreamingResponse + async generator + proxy buffering off.

**DI in 3 lines**: Depends builds a per-request DAG, cached, composable. yield dependencies = setup/teardown with context-manager semantics (sessions!). dependency_overrides is the official test seam — fakes over patches, always.

**Production in 5 lines**: pydantic-settings validated at boot; timeouts on every outbound call; auth dependency at router level; domain errors mapped once via handlers. Workers ≈ cores, stateless pods, pool math vs max_connections. /healthz + /readyz, Prometheus + loop-lag, OTel traces, JSON logs with request IDs. Rate-limit expensive (LLM) routes. Pin FastAPI+Pydantic together.

**Interview reflexes**: request lifecycle walk-through, param classification rules, async-vs-def decision, yield-dep teardown timing, override-based testing, blocking-bug diagnosis story, SSE gateway design, cursor-vs-offset pagination.
`,

  "learning-roadmap": `
Assumes the **Python** skill (especially async + typing). Adjust pace freely:

**Week 1 — Fundamentals.** Beginner Concepts + Lab 1. Build the notes CRUD; break payloads on purpose and read every 422. Milestone: you reach for /docs before Postman.

**Week 2 — Contracts and structure.** Intermediate Concepts: response_model everywhere, routers, error handlers, settings. Refactor Lab 1 into the layered layout (api/services/repositories). Milestone: main.py under 30 lines.

**Week 3 — Dependencies deep.** The DI section + Lab 2. Auth dependency, DB session via yield, overrides in tests. Milestone: full test suite runs with zero real resources.

**Week 4 — Async truth.** Advanced Concepts + Lab 3 (blocking autopsy). Learn the failure viscerally, then the three fixes. Milestone: you can explain async-vs-def to a teammate with the latency table to prove it.

**Week 5 — Streaming + production.** Streaming section + Lab 4 (LLM gateway): SSE, rate limits, metrics, Docker. Milestone: 100 concurrent streams load-tested in a container.

**Week 6 — Operations + interview polish.** Monitoring/Deployment/Checklist sections; wire Prometheus + OTel; rehearse the senior interview answers aloud. Milestone: the gateway deployed with dashboards you actually read.

Next on the platform: **PostgreSQL** — your APIs deserve a real database, and the SQLAlchemy patterns there slot directly into the get_db dependency you now understand.
`,

  "official-docs": `
- [FastAPI documentation](https://fastapi.tiangolo.com/) — among the best docs in software; the Tutorial is a course in itself. Read Advanced User Guide after this page.
- [Release notes](https://fastapi.tiangolo.com/release-notes/) — high release cadence; skim before upgrades.
- [Pydantic v2 docs](https://docs.pydantic.dev/latest/) — half your FastAPI skill lives here (validators, ConfigDict, TypeAdapter).
- [Starlette docs](https://www.starlette.io/) — middleware, WebSockets, responses; everything applies to FastAPI directly.
- [Uvicorn docs](https://www.uvicorn.org/) — server flags, workers, proxy headers, lifespan.
- [SQLModel docs](https://sqlmodel.tiangolo.com/) — tiangolo's Pydantic+SQLAlchemy bridge, if you take that path.
- [ASGI specification](https://asgi.readthedocs.io/) — the protocol underneath; short and worth one read.
`,

  books: `
- **FastAPI: Modern Python Web Development** — Bill Lubanovic (O'Reilly, 2023). The thorough FastAPI-first book; good production coverage.
- **Building Data Science Applications with FastAPI, 2nd ed.** — François Voron (Packt, 2023). Strong on the ML-serving angle: async DB, WebSockets, deployment; the closest book to this page's AI focus.
- **Microservice APIs** — José Haro Peralta (Manning, 2023). API design/contracts with FastAPI + Flask; excellent on OpenAPI-first discipline.
- **Architecture Patterns with Python** — Percival & Gregory (free as Cosmic Python). Not FastAPI-specific but THE book for the services/repositories layering this page prescribes.
- **High Performance Python, 3rd ed.** — Gorelick & Ozsvald. When your profiling says Python is the bottleneck.

FastAPI books date quickly — pair any of them with current official docs, and check edition dates against the Pydantic v2 era (mid-2023+).
`,

  blogs: `
- **fastapi.tiangolo.com/blog + @tiangolo's posts** — design rationale and release context straight from the author.
- **Pydantic blog** (pydantic.dev/articles) — v2 internals, performance posts, and the Rust-core story.
- **TestDriven.io** — consistently solid FastAPI tutorials (auth, Celery, Docker, testing) with production framing.
- **Encode (Starlette/uvicorn/httpx) release notes** — the layer beneath; breaking changes surface here first.
- **Netflix Tech Blog** — the Dispatch announcement and follow-ups show FastAPI in an org context.
- **LiteLLM / vLLM blogs** — the AI-gateway ecosystem evolving on top of FastAPI; watch architecture patterns emerge here.
- **Awesome FastAPI list** (see GitHub Repositories) — curated, maintained link hub; better than any single blog for discovery.
`,

  "research-papers": `
Direct FastAPI research is thin (it's an engineering artifact, not an academic one) — the honest list is the foundations:

- **"Architectural Styles and the Design of Network-based Software Architectures"** — Roy Fielding's dissertation (2000). REST itself; chapter 5 is the canon behind every route you declare (see the **REST** skill).
- **ASGI specification** (asgi.readthedocs.io) — not a paper but the protocol design document that made async Python web frameworks possible; short, precise, worth a full read.
- **"The Tail at Scale"** — Dean & Barroso, CACM 2013. Why p99 latency, hedged requests, and timeout discipline matter — the theory behind this page's production sections.
- **"End-to-End Arguments in System Design"** — Saltzer, Reed, Clark (1984). Where validation and reliability logic belong — the intellectual justification for edge validation via Pydantic.
- For the serving-systems side: **"Orca: A Distributed Serving System for Transformer-Based Generative Models"** (OSDI 2022) and the **vLLM paper ("Efficient Memory Management for Large Language Model Serving with PagedAttention", SOSP 2023)** — what actually runs behind your FastAPI gateway in modern LLM stacks.
`,

  videos: `
- **Sebastián Ramírez — framework talks (PyCon / EuroPython, various years)** — design philosophy from the creator; his "FastAPI from the ground up" style walkthroughs are the fastest correct mental model.
- **ArjanCodes — FastAPI series (YouTube)** — clean-architecture FastAPI: DI, services, testing; matches this page's structure advice.
- **TestDriven.io / Patrick Loeber tutorials** — pragmatic build-alongs (auth, Docker, SQLAlchemy) worth coding with, not just watching.
- **"FastAPI in production" conference talks** (search PyCon archives) — real teams on workers, pooling, and the blocking-bug war stories.
- **EncodeOSS / Starlette deep dives** — Tom Christie on ASGI design; understand the layer FastAPI stands on.
- **vLLM / LiteLLM meetup recordings** — the AI-gateway pattern discussed by its builders; watch after Lab 4 to compare choices.
`,

  "github-repos": `
- [fastapi/fastapi](https://github.com/fastapi/fastapi) — the source; readable, and the discussions are a knowledge base of their own.
- [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) — the official production template: SQLModel, auth, Docker, CI; steal its structure.
- [Netflix/dispatch](https://github.com/Netflix/dispatch) — production FastAPI at Netflix; the best large real codebase to read.
- [zhanymkanov/fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices) — battle-tested conventions writeup; agrees with (and extends) this page.
- [mjhea0/awesome-fastapi](https://github.com/mjhea0/awesome-fastapi) — curated ecosystem index.
- [fastapi-users/fastapi-users](https://github.com/fastapi-users/fastapi-users) — full auth solution; read it even if you hand-roll (this platform's api/ hand-rolls a subset).
- [vllm-project/vllm](https://github.com/vllm-project/vllm) — see entrypoints/openai for FastAPI serving LLMs at the ecosystem's core.
- [BerriAI/litellm](https://github.com/BerriAI/litellm) — the multi-provider gateway pattern, productized; compare with your Lab 4.
- [encode/starlette](https://github.com/encode/starlette) — small enough to read fully; you'll understand FastAPI twice as well after.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Contracts*: design In/Out models for a bookstore API (nested authors, Literal genres, computed display fields); make /docs examples look intentional (Field examples).
2. *Validation depth*: a model where end_date must exceed start_date (model_validator), tags are deduplicated (field_validator), and price is Decimal with 2 places — plus tests for each 422 shape.
3. *DI graphs*: build require_role("admin") on top of current_user on top of bearer; apply at router level; test all three layers with overrides.
4. *Async judgment*: given 6 route descriptions (sync ORM, httpx call, CPU crunch, file upload to S3, in-memory lookup, subprocess), pick async def vs def for each and justify — then verify two with a load test.
5. *Error architecture*: services raising NotFoundError/ConflictError/QuotaExceeded; one handler module mapping them to 404/409/429 with a consistent error envelope; tests asserting the envelope.
6. *Streaming*: SSE endpoint emitting progress of a long task with heartbeats every 10s and a resume token; client disconnect must cancel the task (assert via a flag in tests).
7. *Pagination*: implement cursor pagination over a seeded SQLite table; prove stability under concurrent inserts vs an offset version.
8. *Observability*: add a middleware that logs request-id, route, status, duration as JSON; propagate the id into a downstream httpx call header; assert propagation in a test.

External: the official docs' Tutorial exercises (do them typed, no copy-paste), then reproduce endpoints from vLLM's OpenAI-compatible API spec as a contract exercise.
`,

  "architecture-diagram": `
The reference production FastAPI AI service — this platform's target architecture, and the backend view of the **JavaScript** skill's diagram:

~~~mermaid
flowchart TB
    FE["Frontends (JS/TS)\nSSE token streams"] --> IN["Ingress / nginx\nproxy_buffering off (SSE)"]
    IN --> A1["FastAPI pod 1\nuvicorn · async"]
    IN --> A2["FastAPI pod N"]
    A1 & A2 --> AUTH["Auth deps: JWT verify\nrate limit (Redis)"]
    A1 & A2 --> PG[("PostgreSQL\nSQLAlchemy + Alembic")]
    A1 & A2 --> RD[("Redis\ncache · limits · queues")]
    A1 & A2 -->|shared AsyncClient| LLM["vLLM / provider APIs"]
    A1 & A2 -->|enqueue| Q["Celery / arq workers\nembeddings · ingestion"]
    Q --> VDB[("Vector DB\nQdrant / Chroma")]
    subgraph Obs["Observability"]
      P["Prometheus\nRED + loop lag"] --> G["Grafana"]
      T["OpenTelemetry traces"]
      L["JSON logs + request IDs"]
    end
    A1 & A2 -.-> Obs
~~~

Every node is a platform skill — this page is the hub that connects the Python track to databases, streaming, and operations.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((FastAPI))
    Foundations
      Starlette ASGI
      Pydantic v2
      Type-hint contracts
      OpenAPI /docs
    Request handling
      Path · query · body
      response_model
      Routers & versioning
      Errors & handlers
    Dependencies
      Depends DAG
      yield teardown
      Router-level gates
      Test overrides
    Async
      async def vs def
      Threadpool
      Blocking bug
      Streaming SSE
      WebSockets
      Lifespan
    Production
      uvicorn workers
      Settings · timeouts
      Auth: JWT · OAuth
      Rate limiting
      Docker · K8s probes
      Metrics · tracing · logs
    AI serving
      LLM gateway pattern
      vLLM · LangServe
      Token streaming
      Structured outputs
    Next
      PostgreSQL
      Docker
      SSE deep dive
~~~
`,
};

export default fastapi;
