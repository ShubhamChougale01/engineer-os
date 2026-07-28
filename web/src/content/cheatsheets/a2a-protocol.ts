import type { CheatSheetData } from "./types";

const a2aProtocol: CheatSheetData = {
  title: "The Ultimate A2A Protocol Cheat Sheet",
  subtitle: "Agent Cards · task lifecycle · streaming · multi-agent resilience toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "A2A (Agent2Agent)", desc: "Open protocol for independent agents to discover and delegate tasks to each other", code: "Agent A --A2A--> Agent B\n(different frameworks/vendors/orgs)" },
        { term: "A2A vs MCP", desc: "MCP: agent to tools/data. A2A: agent to agent", code: "MCP  = agent  -> tool/database/API\nA2A  = agent  -> another agent" },
        { term: "Agent Card", desc: "JSON document describing an agent's skills, endpoint, auth", code: "GET /.well-known/agent.json\n-> { name, url, skills, authentication }" },
        { term: "Task", desc: "One unit of delegated work with an explicit lifecycle", code: "{ id, status: {state}, message: {...} }" },
        { term: "Skill", desc: "One named capability an agent advertises in its Agent Card", code: "skills: [{ id: 'book-flight', name: 'Book Flight' }]" },
        { term: "Message / Parts", desc: "A task message made of typed pieces: text, data, file", code: "parts: [{type:'text', text:'...'},\n        {type:'data', data:{...}}]" },
        { term: "JSON-RPC 2.0", desc: "The wire format A2A requests/responses use", code: "{ jsonrpc: '2.0', id: 1, method: 'tasks/send', params: {...} }" },
        { term: "Opaque box, transparent contract", desc: "Remote agent's internals stay hidden; only messages/status cross the wire", code: "you see: task status + message parts\nyou never see: remote reasoning/tools" },
        { term: "Linux Foundation governance", desc: "Vendor-neutral home for the spec after Google's original 2025 launch", code: "originated: Google, Apr 2025\ngoverned: Linux Foundation" },
      ],
    },
    {
      title: "Task Lifecycle & Building Blocks",
      color: "blue",
      rows: [
        { term: "submitted", desc: "Task received, processing not yet started", code: "status: { state: 'submitted' }" },
        { term: "working", desc: "Remote agent is actively processing", code: "status: { state: 'working' }" },
        { term: "input-required", desc: "Remote agent needs more info before continuing", code: "status: { state: 'input-required' }\n# client supplies a follow-up message" },
        { term: "completed / failed / canceled", desc: "Terminal states — task is done, one way or another", code: "status: { state: 'completed' }  # or\n'failed' | 'canceled'" },
        { term: "tasks/send", desc: "Submit a task, simple request/response", code: "method: 'tasks/send'\nparams: { id, message }" },
        { term: "tasks/sendSubscribe", desc: "Submit a task and open an SSE stream of updates", code: "method: 'tasks/sendSubscribe'\n# server streams status events" },
        { term: "tasks/get", desc: "Poll for a task's current status", code: "method: 'tasks/get'\nparams: { id: 'task-123' }" },
        { term: "Push notifications", desc: "Webhook callback on terminal state instead of polling/streaming", code: "capabilities: { pushNotifications: true }\n# register a callback URL" },
        { term: "Authentication schemes", desc: "Standard web auth advertised by the Agent Card", code: "authentication: { schemes: ['Bearer'] }\n# reuses OAuth2/Bearer, no new crypto" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "Discover then call", desc: "Fetch the Agent Card before sending any real task", code: "card = get('/.well-known/agent.json')\nendpoint = card['url']" },
        { term: "Submit a task", desc: "Minimal JSON-RPC request", code: "post(endpoint, json={\n  'jsonrpc':'2.0','id':1,'method':'tasks/send',\n  'params':{'id':tid,'message':msg}})" },
        { term: "Consume an SSE stream", desc: "Read incremental updates until a terminal state", code: "for line in stream:\n    if line.startswith('data:'):\n        event = json.loads(line[5:])\n        if event['status']['state'] in TERMINAL: break" },
        { term: "Handle input-required", desc: "Send a follow-up message on the same task id", code: "if state == 'input-required':\n    send_task(endpoint, task_id=tid, message=followup)" },
        { term: "Cache the Agent Card", desc: "Avoid refetching a document that rarely changes", code: "if cache.expired(agent_url):\n    cache.set(agent_url, fetch_card(agent_url), ttl=3600)" },
        { term: "Always set a timeout", desc: "A hung remote agent should never hang your process", code: "client.send_task(endpoint, task, timeout=10)" },
        { term: "Graceful capability check", desc: "Read advertised capabilities, don't assume them", code: "if card['capabilities'].get('streaming'):\n    stream_task(...)\nelse:\n    poll_task(...)" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Multi-agent orchestration", desc: "One front agent delegates sub-tasks to specialist agents", code: "orchestrator -> research_agent (A2A)\norchestrator -> booking_agent (A2A)" },
        { term: "Per-agent circuit breaker", desc: "Stop calling a consistently failing remote agent temporarily", code: "if breaker.allow_call():\n    try: call(); breaker.record_success()\n    except: breaker.record_failure()" },
        { term: "Bounded concurrency delegation", desc: "Fan out to several agents at once, capped", code: "semaphore = Semaphore(5)\nawait gather(*(call(a) for a in agents))" },
        { term: "Correlation id across hops", desc: "Trace a multi-hop delegation chain (A -> B -> C)", code: "log(correlation_id=cid, hop='B', task_id=tid)\n# same cid propagated to every hop" },
        { term: "Data parts for machine actions", desc: "Return structured JSON, not just prose, when the caller must act on it", code: "{'type':'data','data':{'options':[...]}}\n# see Structured Outputs skill" },
        { term: "Versioned Agent Card", desc: "Communicate breaking changes to known callers", code: "card['version'] = '2.0.0'\n# notify integrators before removing a skill" },
        { term: "Human-in-the-loop via input-required", desc: "Relay a clarifying question to a real user mid-task", code: "state == 'input-required' ->\n  relay message to user -> resume task" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "Confusing A2A with MCP", desc: "Exposing a plain tool call as an 'agent' over A2A", code: "# WRONG: A2A for a fixed SQL query function\n# RIGHT: MCP for tools, A2A for autonomous agents" },
        { term: "No timeout on delegated tasks", desc: "A hung remote agent stalls your whole orchestrator", code: "# WRONG: client.send_task(endpoint, task)\n# RIGHT: client.send_task(endpoint, task, timeout=10)" },
        { term: "Hardcoding capabilities", desc: "Assuming every remote agent supports streaming", code: "# WRONG: always call stream_task()\n# RIGHT: check card['capabilities']['streaming'] first" },
        { term: "Trusting remote content blindly", desc: "Feeding unvalidated remote output into a downstream LLM prompt", code: "# WRONG: prompt = f'Given: {remote_result}...'\n# RIGHT: validate_schema(remote_result) first" },
        { term: "Ignoring input-required", desc: "Only handling completed/failed, dropping clarification tasks", code: "# WRONG: if state == 'completed': ...\n# RIGHT: handle every documented state explicitly" },
        { term: "In-process-only task state", desc: "Breaks tasks/get behind a load-balanced server", code: "# WRONG: tasks = {}  # dict in one process\n# RIGHT: store tasks in Redis/Postgres, shared" },
        { term: "Stale cached Agent Card", desc: "Missing a partner's capability or endpoint change", code: "# re-fetch on auth/capability errors,\n# not only on a fixed long TTL" },
        { term: "No circuit breaker on a flaky agent", desc: "One failing specialist cascades into failing everything", code: "# WRONG: retry the same failing agent forever\n# RIGHT: circuit breaker + documented fallback" },
        { term: "No accountability across delegation chains", desc: "Can't trace which hop caused a bad outcome", code: "# always log task_id + correlation_id\n# at EVERY hop, not just the origin" },
        { term: "Full autonomy on high-stakes actions", desc: "No human checkpoint before payments/irreversible changes", code: "# gate consequential actions behind\n# explicit human approval, not full autonomy" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Official A2A SDKs", desc: "Reference client/server implementations across languages", code: "# check github.com/a2aproject for current\n# supported languages -- verify before betting" },
        { term: "Framework integrations", desc: "LangGraph, CrewAI and others adding A2A support", code: "# use your framework's built-in A2A\n# client/server rather than hand-rolling it" },
        { term: "FastAPI A2A server pattern", desc: "Serve the Agent Card + task endpoint + SSE stream", code: "@app.get('/.well-known/agent.json')\n@app.post('/a2a')\n@app.post('/a2a/stream')  # SSE" },
        { term: "Shared task store", desc: "Redis/Postgres backing task state across replicas", code: "await task_store.create(task_id, state='submitted')\nawait task_store.subscribe(task_id)  # for SSE" },
        { term: "Monitoring per remote agent", desc: "Completion rate, duration, failure breakdown, NOT aggregate-only", code: "A2A_TASKS.labels(remote_agent, final_state).inc()\nA2A_TASK_DURATION.labels(remote_agent).observe(dt)" },
        { term: "Security review tie-in", desc: "Validate Agent Cards and remote content like any untrusted input", code: "# see AI Red Teaming + Prompt Injection\n# Defense skills for the adversarial playbook" },
        { term: "Secrets management tie-in", desc: "Bearer/OAuth2 tokens per remote agent, least privilege", code: "# short-lived tokens, rotation,\n# no secrets in logs -- see Secrets Management" },
      ],
    },
  ],
};

export default a2aProtocol;
