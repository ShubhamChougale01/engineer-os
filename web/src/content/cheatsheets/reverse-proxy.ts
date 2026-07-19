import type { CheatSheetData } from "./types";

const reverseProxyCheatSheet: CheatSheetData = {
  title: "Reverse Proxy",
  subtitle: "Nginx & friends: the front door of services",
  sections: [
    {
      title: "Core Concept",
      color: "violet",
      rows: [
        { term: "Reverse proxy", desc: "Sits in front of backends, forwards requests, hides topology" },
        { term: "vs Forward proxy", desc: "Forward acts for the client; reverse acts for the server" },
      ],
    },
    {
      title: "NGINX Directives",
      color: "blue",
      rows: [
        { term: "proxy_pass", desc: "Forward to a backend", code: "proxy_pass http://backend;" },
        {
          term: "X-Forwarded-*",
          desc: "Preserve real client IP/protocol",
          code: "proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\nproxy_set_header X-Forwarded-Proto $scheme;",
        },
      ],
    },
    {
      title: "Routing Patterns",
      color: "emerald",
      rows: [
        { term: "Path-based", desc: "location /api/ { } vs location /static/ { }" },
        { term: "Host-based", desc: "server_name api.example.com; vs www.example.com;" },
        { term: "Strangler-fig", desc: "Route new paths to new services, rest to legacy monolith" },
      ],
    },
    {
      title: "Cross-Cutting Concerns",
      color: "amber",
      rows: [
        { term: "TLS termination", desc: "Decrypt once at proxy, plain HTTP to trusted backend" },
        { term: "Compression", desc: "gzip/brotli applied centrally" },
        { term: "Response caching", desc: "proxy_cache + proxy_cache_valid for cacheable paths" },
        { term: "Security headers", desc: "CSP, X-Frame-Options enforced centrally" },
      ],
    },
    {
      title: "WebSockets & Buffering",
      color: "rose",
      rows: [
        {
          term: "WebSocket proxying",
          desc: "Needs explicit Upgrade handling",
          code: "proxy_http_version 1.1;\nproxy_set_header Upgrade $http_upgrade;\nproxy_set_header Connection \"upgrade\";",
        },
        { term: "Buffering", desc: "Proxy absorbs slow clients, frees backend capacity sooner" },
      ],
    },
    {
      title: "Non-Negotiables",
      color: "cyan",
      rows: [
        { term: "Private backends", desc: "Never expose backend servers directly to the internet" },
        { term: "Redundant proxy", desc: "Single instance = new SPOF; deploy active-passive or managed" },
      ],
    },
  ],
};

export default reverseProxyCheatSheet;
