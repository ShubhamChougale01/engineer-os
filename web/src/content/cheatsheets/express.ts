import type { CheatSheetData } from "./types";

const express: CheatSheetData = {
  title: "The Ultimate Express Cheat Sheet",
  subtitle: "Routing & middleware · error handling · async patterns · production toolbelt",
  sections: [
    {
      title: "Core Routing",
      color: "violet",
      rows: [
        { term: "Minimal app", desc: "A complete Express app in a few lines", code: "const app = express();\napp.get('/', (req, res) => res.send('Hello!'));\napp.listen(3000);" },
        { term: "Route parameters", desc: "Captured segments available on req.params", code: "app.get('/greet/:name', (req, res) =>\n  res.send('Hi ' + req.params.name));" },
        { term: "Query & body", desc: "Query string vs. parsed JSON body", code: "req.query.q\nreq.body.title  // needs express.json() first" },
        { term: "Body parsing", desc: "Without this, req.body is undefined", code: "app.use(express.json());\napp.use(express.urlencoded({ extended: true }));" },
        { term: "Response helpers", desc: "Explicit status codes for API responses", code: "res.status(201).json({ id: 1 });\nres.redirect('/new-page');" },
        { term: "Router", desc: "Mountable mini-app for grouping routes", code: "const router = express.Router();\nrouter.get('/', (req, res) => res.send('list'));\napp.use('/posts', router);" },
      ],
    },
    {
      title: "Middleware Pattern",
      color: "blue",
      rows: [
        { term: "Middleware shape", desc: "Must call next() or send a response — or it hangs", code: "function logger(req, res, next) {\n  console.log(req.method, req.path);\n  next();\n}\napp.use(logger);" },
        { term: "Execution order", desc: "Runs in EXACT registration order, straight-line pipeline", code: "app.use(a); app.use(b); app.get('/x', c);\n// order: a -> b -> c" },
        { term: "Error-handling middleware", desc: "Recognized by ARITY: exactly 4 params, registered LAST", code: "app.use((err, req, res, next) => {\n  res.status(500).json({ error: err.message });\n});" },
        { term: "Forwarding an error", desc: "Skips to the first error-handling middleware", code: "app.get('/x', (req, res, next) => {\n  try { risky(); } catch (e) { next(e); }\n});" },
      ],
    },
    {
      title: "Async & Node Concurrency",
      color: "emerald",
      rows: [
        { term: "Express 4 async gotcha", desc: "A rejected Promise is NOT caught automatically", code: "// WRONG in v4: app.get('/x', async (req, res) => {\n//   const d = await mightReject(); res.json(d);\n// });" },
        { term: "asyncHandler wrapper", desc: "The standard Express 4 fix", code: "const wrap = fn => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);" },
        { term: "Express 5", desc: "Catches rejected Promises from async handlers natively", code: "// No wrapper needed in Express 5" },
        { term: "Event loop blocking", desc: "Sync CPU-bound code stalls EVERY concurrent request", code: "// Offload to worker_threads or a separate service,\n// never a tight synchronous loop in a handler" },
        { term: "Streaming responses", desc: "res is a writable stream — pipe directly", code: "res.setHeader('Content-Type', 'text/event-stream');\nres.write('data: ' + chunk + '\\n\\n');" },
      ],
    },
    {
      title: "Data & Validation",
      color: "amber",
      rows: [
        { term: "Prisma query", desc: "Express has no built-in ORM opinion", code: "const posts = await prisma.post.findMany({\n  include: { author: true }\n});" },
        { term: "Input validation", desc: "Nothing is validated by default — must add explicitly", code: "body('email').isEmail(),\nbody('title').isLength({ min: 5 })" },
        { term: "Custom error class", desc: "Carry a status code through to the error handler", code: "class ApiError extends Error {\n  constructor(code, msg) { super(msg); this.statusCode = code; }\n}" },
        { term: "Env config", desc: "The standard Node.js configuration pattern", code: "require('dotenv').config();\nconst PORT = process.env.PORT || 3000;" },
      ],
    },
    {
      title: "Security (all opt-in)",
      color: "rose",
      rows: [
        { term: "Security headers", desc: "NOT set by default — helmet must be added", code: "app.use(require('helmet')());" },
        { term: "CORS", desc: "Specific origin, never a wildcard for credentialed requests", code: "app.use(require('cors')({ origin: 'https://myapp.com' }));" },
        { term: "Rate limiting", desc: "Essential on auth/abuse-prone endpoints", code: "app.use(require('express-rate-limit')({ windowMs: 60000, max: 100 }));" },
        { term: "trust proxy", desc: "Needed for correct req.ip behind a load balancer", code: "app.set('trust proxy', 1);" },
        { term: "No CSRF by default", desc: "Add a scheme explicitly for cookie-based sessions", code: "// csurf (legacy) or a custom double-submit-cookie scheme" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Process management", desc: "One Node process = one CPU core, always", code: "pm2 start server.js -i max" },
        { term: "Testing", desc: "HTTP-level integration tests against the app object", code: "const r = await request(app).get('/api/posts/1');\nexpect(r.status).toBe(200);" },
        { term: "Structured logging", desc: "JSON logs, not console.log strings", code: "const logger = require('pino')();\nlogger.info({ path: req.path }, 'request');" },
        { term: "Diagnose event-loop lag", desc: "The earliest warning sign of a blocking bug", code: "npx clinic doctor -- node server.js" },
        { term: "Production env", desc: "Several ecosystem libs change behavior on this", code: "NODE_ENV=production node server.js" },
      ],
    },
  ],
};

export default express;
