import type { CheatSheetData } from "./types";

const fastapi: CheatSheetData = {
  title: "The Ultimate FastAPI Cheat Sheet",
  subtitle: "Routing · validation · dependencies · async · production serving",
  sections: [
    {
      title: "App & Routing",
      color: "violet",
      rows: [
        { term: "Minimal app", desc: "One file, auto docs at /docs", code: "from fastapi import FastAPI\napp = FastAPI(title='API')\n\n@app.get('/')\ndef root():\n    return {'ok': True}" },
        { term: "Run it", desc: "Dev with reload; prod with workers", code: "fastapi dev main.py\nuvicorn main:app --reload\nuvicorn main:app --workers 4" },
        { term: "Path params", desc: "From the URL template — typed + validated", code: "@app.get('/items/{item_id}')\ndef get(item_id: int): ...\n# /items/abc -> automatic 422" },
        { term: "Query params", desc: "Bare scalars not in the path", code: "def list(q: str | None = None,\n         limit: int = Query(20, le=100)):\n    ...  # ?q=gpu&limit=50" },
        { term: "Routers", desc: "Split the app; version from day one", code: "router = APIRouter(\n  prefix='/api/v1/users', tags=['users'])\n\n@router.get('/{id}')\ndef get_user(id: int): ...\n\napp.include_router(router)" },
        { term: "The 5 methods", desc: "One decorator per HTTP verb", code: "@app.get     # read\n@app.post    # create (201)\n@app.put     # replace\n@app.patch   # partial update\n@app.delete  # remove (204)" },
        { term: "Status codes", desc: "Declare intent in the decorator", code: "@app.post('/items',\n          status_code=201)\ndef create(item: ItemIn): ..." },
        { term: "Docs URLs", desc: "Generated, always current", code: "/docs          # Swagger UI\n/redoc         # reference style\n/openapi.json  # machine schema\n# disable: FastAPI(docs_url=None)" },
      ],
    },
    {
      title: "Validation (Pydantic)",
      color: "blue",
      rows: [
        { term: "Body model", desc: "Pydantic model param = JSON body", code: "class ItemIn(BaseModel):\n    name: str = Field(min_length=1)\n    price: float = Field(gt=0)\n    tags: list[str] = []\n\n@app.post('/items')\ndef create(item: ItemIn): ..." },
        { term: "response_model", desc: "Output contract + leak filter", code: "class UserOut(BaseModel):\n    id: int\n    email: str   # no password field!\n\n@app.get('/users/{id}',\n         response_model=UserOut)" },
        { term: "From ORM objects", desc: "Build models from attributes", code: "class UserOut(BaseModel):\n    model_config = ConfigDict(\n        from_attributes=True)" },
        { term: "Field validators", desc: "Custom per-field rules", code: "@field_validator('amount')\n@classmethod\ndef positive(cls, v):\n    if v <= 0:\n        raise ValueError('must be > 0')\n    return v" },
        { term: "Model validators", desc: "Cross-field rules", code: "@model_validator(mode='after')\ndef check_dates(self):\n    if self.end < self.start:\n        raise ValueError('end < start')\n    return self" },
        { term: "Tight types", desc: "Constrain aggressively at the edge", code: "status: Literal['pending', 'paid']\nemail: EmailStr\nid: UUID\nwhen: datetime" },
        { term: "422 anatomy", desc: "What clients get on bad input", code: "{'detail': [{\n  'loc': ['body', 'price'],\n  'msg': 'greater than 0',\n  'type': 'greater_than'}]}" },
        { term: "Errors", desc: "HTTPException + custom handlers", code: "raise HTTPException(404,\n    detail='Not found')\n\n@app.exception_handler(DomainError)\nasync def h(req, exc):\n    return JSONResponse(409, ...)" },
      ],
    },
    {
      title: "Dependencies",
      color: "amber",
      rows: [
        { term: "Basic Depends", desc: "Shared logic as a parameter", code: "def pagination(skip: int = 0,\n               limit: int = 50):\n    return {'skip': skip,\n            'limit': min(limit, 100)}\n\ndef list(p = Depends(pagination)): ..." },
        { term: "Annotated style", desc: "Declare once, reuse everywhere (canonical)", code: "Page = Annotated[dict,\n    Depends(pagination)]\n\ndef list(page: Page): ..." },
        { term: "yield = teardown", desc: "Context-manager semantics", code: "def get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()  # runs even on errors" },
        { term: "Auth dependency", desc: "Verify once, require everywhere", code: "bearer = HTTPBearer()\ndef current_user(c = Depends(bearer)):\n    user = decode_jwt(c.credentials)\n    if not user:\n        raise HTTPException(401)\n    return user" },
        { term: "Router-level gate", desc: "Protect a whole surface", code: "router = APIRouter(\n  dependencies=[Depends(current_user)])\n# every route now requires auth" },
        { term: "Per-request cache", desc: "Same dep resolves once per request", code: "# default: cached\nDepends(get_settings)\n# fresh every use:\nDepends(get_val, use_cache=False)" },
        { term: "Test overrides", desc: "THE testing seam — fakes, not patches", code: "app.dependency_overrides[get_db] = \\\n    fake_db\napp.dependency_overrides[\n    current_user] = lambda: test_user" },
      ],
    },
    {
      title: "Async & Streaming",
      color: "cyan",
      rows: [
        { term: "The golden rule", desc: "Match the route type to your libraries", code: "async def + await httpx  # loop\ndef + requests           # threadpool\nasync def + requests     # DISASTER:\n#   freezes every request" },
        { term: "Decision table", desc: "Choose per route, honestly", code: "awaited IO (httpx, asyncpg) -> async def\nblocking libs (psycopg2)    -> def\nCPU-heavy                   -> def\n  (or offload to a queue)" },
        { term: "Lifespan", desc: "Shared clients: create once, close once", code: "@asynccontextmanager\nasync def lifespan(app):\n    app.state.http = httpx.AsyncClient(\n        timeout=10)\n    yield\n    await app.state.http.aclose()" },
        { term: "SSE streaming", desc: "LLM token output — the AI pattern", code: "async def gen():\n    async for tok in llm_stream(p):\n        yield 'data: ' + tok + '\\n\\n'\nreturn StreamingResponse(gen(),\n  media_type='text/event-stream')" },
        { term: "Client disconnect", desc: "Stop paying when the user hits stop", code: "if await request.is_disconnected():\n    break\n# + finally: await upstream.aclose()" },
        { term: "WebSockets", desc: "Bidirectional channels", code: "@app.websocket('/ws')\nasync def ws(sock: WebSocket):\n    await sock.accept()\n    while True:\n        msg = await sock.receive_text()\n        await sock.send_text(msg)" },
        { term: "Background tasks", desc: "Fire-after-response; NOT durable", code: "def signup(u: UserIn,\n           t: BackgroundTasks):\n    t.add_task(send_email, u.email)\n# critical work -> Celery/arq queue" },
      ],
    },
    {
      title: "Gotchas",
      color: "rose",
      rows: [
        { term: "Blocking in async", desc: "The #1 FastAPI production incident", code: "# every route stalls together?\n# py-spy dump --pid <worker>\n# -> find sync call in async route" },
        { term: "Body vs query 422", desc: "Bare str param is a QUERY param", code: "def f(text: str)   # ?text=...\ndef f(body: TextIn) # JSON body\n# 'field required' = wrong location" },
        { term: "Raw ORM returns", desc: "Leaks columns without response_model", code: "# BAD: return db.get(User, id)\n# GOOD:\n@app.get('/u/{id}',\n    response_model=UserOut)" },
        { term: "Client per request", desc: "Connection churn under load", code: "# BAD: httpx.AsyncClient() in handler\n# GOOD: app.state.http from lifespan" },
        { term: "Trailing slash 307", desc: "/items vs /items/ redirect surprises", code: "# pick ONE convention and\n# keep route defs consistent" },
        { term: "SSE buffered in prod", desc: "Reverse proxy buffering", code: "# nginx: proxy_buffering off;\n# or header:\n# X-Accel-Buffering: no" },
        { term: "Pool exhaustion", desc: "Workers multiply connections", code: "workers x pool_size\n  < db max_connections" },
        { term: "Version drift", desc: "FastAPI and Pydantic move together", code: "# pin both in the lockfile;\n# upgrade together, read\n# release notes first" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "emerald",
      rows: [
        { term: "Settings", desc: "Validated at boot — fail fast", code: "class Settings(BaseSettings):\n    model_config = SettingsConfigDict(\n        env_prefix='APP_')\n    database_url: str\n    jwt_secret: str" },
        { term: "CORS", desc: "Explicit origins, never * with credentials", code: "app.add_middleware(CORSMiddleware,\n  allow_origins=['https://app.x.com'],\n  allow_methods=['*'],\n  allow_headers=['*'])" },
        { term: "Health probes", desc: "Liveness vs readiness (K8s)", code: "@app.get('/healthz')  # process up\ndef live(): return {'ok': True}\n\n@app.get('/readyz')   # deps reachable\ndef ready(db: DB): db.execute(...)" },
        { term: "Metrics", desc: "Prometheus in two lines", code: "Instrumentator().instrument(app)\\\n    .expose(app, endpoint='/metrics')\n# + event-loop lag gauge" },
        { term: "Tracing", desc: "OpenTelemetry auto-instrumentation", code: "FastAPIInstrumentor\\\n    .instrument_app(app)\n# + httpx/SQLAlchemy instrumentors" },
        { term: "Testing", desc: "TestClient + overrides, in-process", code: "client = TestClient(app)\nr = client.post('/items',\n    json={'name': 'gpu', 'price': 1})\nassert r.status_code == 201" },
        { term: "Async test client", desc: "For streaming and async fixtures", code: "transport = httpx.ASGITransport(app=app)\nasync with httpx.AsyncClient(\n    transport=transport,\n    base_url='http://t') as ac: ..." },
        { term: "Docker CMD", desc: "Exec form so SIGTERM drains gracefully", code: "CMD [\"uvicorn\", \"app.main:app\",\n     \"--host\", \"0.0.0.0\",\n     \"--port\", \"8000\"]" },
        { term: "ORJSON", desc: "Faster JSON for hot APIs", code: "app = FastAPI(\n  default_response_class=\n      ORJSONResponse)" },
      ],
    },
  ],
};

export default fastapi;
