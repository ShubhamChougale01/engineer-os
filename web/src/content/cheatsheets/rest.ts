import type { CheatSheetData } from "./types";

const rest: CheatSheetData = {
  title: "The Ultimate REST Cheat Sheet",
  subtitle: "Resources & verbs · status codes · caching · Richardson Maturity Model",
  sections: [
    {
      title: "Resource-Oriented Design",
      color: "violet",
      rows: [
        { term: "URLs are nouns, not verbs", desc: "The #1 REST anti-pattern is baking actions into URLs", code: "GET /users/42        -- YES\nPOST /createUser       -- NO" },
        { term: "Standard method set", desc: "GET/POST/PUT/PATCH/DELETE cover almost everything", code: "POST /users -> 201\nPUT /users/42 -> 200 (replace)\nPATCH /users/42 -> 200 (partial)" },
        { term: "Idempotent methods", desc: "Same call twice = same end state", code: "// GET, PUT, DELETE are idempotent. POST is NOT by default." },
        { term: "Nest sparingly", desc: "One or two levels max -- deeper nesting gets brittle", code: "GET /users/42/orders/7   -- fine\n// avoid /users/42/orders/7/items/3/tags" },
      ],
    },
    {
      title: "Status Codes That Matter",
      color: "blue",
      rows: [
        { term: "Success", desc: "200 OK, 201 Created, 204 No Content", code: "// 201 for POST that creates a resource, 204 for DELETE with no body" },
        { term: "Client errors", desc: "400/401/403/404/409/422/429", code: "401 = not authenticated\n403 = authenticated but not allowed\n404 = doesn't exist\n409 = conflict" },
        { term: "NEVER return 200 for everything", desc: "Burying errors in the body discards info generic HTTP tooling relies on", code: "// WRONG: 200 OK {'success': false, 'error': '...'}" },
      ],
    },
    {
      title: "Caching (REST's Free Superpower)",
      color: "emerald",
      rows: [
        { term: "Cache-Control", desc: "Lets CDNs/proxies serve repeats without hitting origin", code: "Cache-Control: max-age=300" },
        { term: "ETag + conditional GET", desc: "304 Not Modified avoids re-transferring unchanged data", code: "ETag: \"33a64df551\"\nIf-None-Match: \"33a64df551\"" },
        { term: "Why GraphQL/gRPC don't get this free", desc: "A single POST endpoint defeats URL-based HTTP caching", code: "// REST's resource-per-URL model maps natively onto HTTP caching semantics" },
      ],
    },
    {
      title: "Pagination, Versioning, Idempotency",
      color: "amber",
      rows: [
        { term: "Cursor-based pagination", desc: "More robust than offset-based under concurrent writes", code: "GET /users?cursor=eyJpZCI6MTAwfQ&limit=50" },
        { term: "URL path versioning", desc: "Most widely adopted in practice -- decide EARLY, not under pressure", code: "GET /v1/users" },
        { term: "Idempotency-Key header", desc: "Safe retries for non-idempotent POSTs (payments!)", code: "POST /payments\nIdempotency-Key: a1b2c3d4-..." },
      ],
    },
    {
      title: "Richardson Maturity Model",
      color: "rose",
      rows: [
        { term: "Level 0", desc: "One URL, one method -- essentially RPC-over-HTTP", code: "// The 'Swamp of POX'" },
        { term: "Level 1", desc: "Multiple resource URLs, still mostly one method", code: "" },
        { term: "Level 2", desc: "Correct verbs + status codes -- where MOST prod APIs live", code: "// Calling this 'REST' is the pragmatic industry norm" },
        { term: "Level 3", desc: "Full HATEOAS -- hypermedia links in responses, rarely implemented", code: "{\"links\": [{\"rel\": \"cancel\", \"href\": \"/orders/42/cancel\"}]}" },
      ],
    },
    {
      title: "Security Essentials",
      color: "cyan",
      rows: [
        { term: "Always HTTPS/TLS", desc: "Never transmit tokens or credentials over plain HTTP", code: "" },
        { term: "Bearer tokens (JWT)", desc: "Preserves statelessness -- no server-side session lookup", code: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." },
        { term: "Check AUTHORIZATION, not just authentication", desc: "IDOR: forgetting to verify resource OWNERSHIP is a serious, common bug", code: "if order.user_id != current_user.id: raise Forbidden(403)" },
        { term: "Never put sensitive data in URLs", desc: "URLs get logged by proxies/browsers routinely", code: "// Sensitive data belongs in body/headers, not query params" },
      ],
    },
  ],
};

export default rest;
