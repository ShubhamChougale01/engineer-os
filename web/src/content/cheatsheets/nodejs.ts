import type { CheatSheetData } from "./types";

const nodejs: CheatSheetData = {
  title: "The Ultimate Node.js Cheat Sheet",
  subtitle: "Event loop & streams · modules · concurrency · production toolbelt",
  sections: [
    {
      title: "Core Modules & Modules System",
      color: "violet",
      rows: [
        { term: "Raw HTTP server", desc: "What Express is built on top of", code: "const http = require('http');\nhttp.createServer((req, res) => res.end('hi')).listen(3000);" },
        { term: "CommonJS", desc: "Node's original, synchronous module system", code: "const fs = require('fs');\nmodule.exports = { greet };" },
        { term: "ES Modules", desc: "Modern standard, native support, needs \"type\": \"module\"", code: "import fs from 'fs';\nexport function greet(name) { ... }" },
        { term: "File system (async)", desc: "Non-blocking by default — never use *Sync in servers", code: "await fs.promises.readFile('f.txt', 'utf8');" },
        { term: "Buffer", desc: "Raw binary data, used throughout Node's I/O APIs", code: "Buffer.from('hello', 'utf8')" },
      ],
    },
    {
      title: "Async Patterns",
      color: "blue",
      rows: [
        { term: "Callback (legacy pattern)", desc: "Function passed to run once an async op completes", code: "fs.readFile('f.txt', 'utf8', (err, data) => { ... });" },
        { term: "Promise", desc: "An object representing a future value", code: "fetch(url).then(r => r.json()).catch(handleErr);" },
        { term: "async/await", desc: "Syntactic sugar over Promises — linear-looking async code", code: "const data = await fs.promises.readFile('f.txt', 'utf8');" },
        { term: "Handle every rejection", desc: "Unhandled rejections can crash the process", code: "try { await risky(); } catch (e) { handle(e); }" },
        { term: "Promise.race for timeouts", desc: "Resolves/rejects with whichever settles first", code: "Promise.race([promise, timeoutPromise])" },
      ],
    },
    {
      title: "Event Loop & Concurrency",
      color: "emerald",
      rows: [
        { term: "Execution order rule", desc: "Sync code -> ALL microtasks -> next macrotask", code: "// Promise.then() ALWAYS runs before setTimeout(fn, 0)" },
        { term: "libuv thread pool", desc: "Handles fs, some crypto, DNS — default 4 threads", code: "process.env.UV_THREADPOOL_SIZE = 8;  // tune if contended" },
        { term: "NEVER block the event loop", desc: "One sync call stalls EVERY concurrent request", code: "// WRONG: fs.readFileSync() in a request handler" },
        { term: "worker_threads", desc: "Genuine parallel JS execution for CPU-bound work", code: "const { Worker } = require('worker_threads');\nnew Worker('./cpu-task.js', { workerData: { n } });" },
        { term: "Streams + backpressure", desc: "Process data larger than memory, in chunks", code: "readStream.pipe(writeStream);  // pipe handles backpressure automatically" },
      ],
    },
    {
      title: "Scaling to Multi-Core",
      color: "amber",
      rows: [
        { term: "One process = one core", desc: "Always, regardless of the machine's core count", code: "// A single node server.js run uses exactly 1 CPU core" },
        { term: "Cluster mode (PM2)", desc: "Fork one worker process per CPU core", code: "pm2 start server.js -i max" },
        { term: "Native cluster module", desc: "Same idea, no external tool needed", code: "if (cluster.isPrimary) { for (...) cluster.fork(); }" },
        { term: "Shared state across processes", desc: "In-process cache/session doesn't share automatically", code: "// Externalize to Redis pub/sub the moment there's > 1 process" },
      ],
    },
    {
      title: "Security & npm",
      color: "rose",
      rows: [
        { term: "Reproducible installs", desc: "Exact locked versions, use in CI/production", code: "npm ci   # NOT npm install" },
        { term: "Dependency audit", desc: "npm's huge ecosystem = real supply-chain risk", code: "npm audit" },
        { term: "Command injection risk", desc: "exec() invokes a shell — sanitize or avoid entirely", code: "execFile('ls', [userDir]);  // NOT exec('ls ' + userDir)" },
        { term: "Prototype pollution", desc: "A JS-specific vuln from merging unsanitized input", code: "// Validate/sanitize before Object.assign or deep-merging user JSON" },
        { term: "ReDoS", desc: "A bad regex + malicious input can block the event loop for ages", code: "// Avoid catastrophic-backtracking-prone regex patterns on user input" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Diagnose event-loop blocking", desc: "The standard tool for \"why is this app unresponsive\"", code: "npx clinic doctor -- node server.js" },
        { term: "Structured logging", desc: "JSON logs, not console.log strings", code: "const logger = require('pino')();\nlogger.info({ userId }, 'login');" },
        { term: "Event-loop lag metric", desc: "The single most Node-specific health signal", code: "// perf_hooks.monitorEventLoopDelay() or prom-client defaults" },
        { term: "Graceful shutdown", desc: "Drain in-flight requests before the process exits", code: "process.on('SIGTERM', () => server.close(() => process.exit(0)));" },
        { term: "Pin the runtime version", desc: "Avoid version-drift bugs across environments", code: "// .nvmrc, package.json \"engines\", or a pinned Docker base image" },
      ],
    },
  ],
};

export default nodejs;
