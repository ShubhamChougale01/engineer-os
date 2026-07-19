import type { CheatSheetData } from "./types";

const loadBalancersCheatSheet: CheatSheetData = {
  title: "Load Balancers",
  subtitle: "Distributing traffic across servers",
  sections: [
    {
      title: "Why Load Balancers Exist",
      color: "violet",
      rows: [
        { term: "Single server limit", desc: "Finite capacity + single point of failure" },
        { term: "Horizontal scaling", desc: "Add servers, LB transparently incorporates them" },
        { term: "Stable entry point", desc: "Clients only know the LB's address, not the fleet" },
      ],
    },
    {
      title: "Algorithms",
      color: "blue",
      rows: [
        { term: "Round-robin", desc: "Cycle through servers in fixed order" },
        { term: "Least-connections", desc: "Route to server with fewest active connections" },
        { term: "Weighted variants", desc: "Account for heterogeneous server capacity" },
        {
          term: "Consistent hashing",
          desc: "hash(key) -> ring position -> same server, minimal reshuffle",
          code: "for vnode in virtual_nodes(server):\n    ring[hash(server+vnode)] = server",
        },
      ],
    },
    {
      title: "Layer 4 vs Layer 7",
      color: "emerald",
      rows: [
        { term: "Layer 4", desc: "Routes on IP/port only — fastest, no HTTP visibility" },
        { term: "Layer 7", desc: "Inspects HTTP path/headers/cookies — flexible, modest cost" },
        { term: "Use L7 when", desc: "Routing decision needs actual request content" },
      ],
    },
    {
      title: "Health & Deployment",
      color: "amber",
      rows: [
        { term: "Health check", desc: "Periodic probe (e.g. GET /health) — unhealthy = removed" },
        { term: "Bad health check", desc: "TCP-port-open only — misses app-level failures" },
        { term: "Connection draining", desc: "Stop new traffic, let in-flight requests finish" },
        { term: "Zero-downtime deploy", desc: "Drain -> update -> health check -> rejoin, one at a time" },
      ],
    },
    {
      title: "Sessions & Redundancy",
      color: "rose",
      rows: [
        { term: "Sticky sessions", desc: "Same client -> same server; costs flexibility + blast radius" },
        { term: "Preferred alternative", desc: "Stateless backend + shared session store (Redis)" },
        { term: "LB itself is a SPOF risk", desc: "Unless deployed redundantly (active-passive or cloud-managed)" },
      ],
    },
    {
      title: "Global Scale",
      color: "cyan",
      rows: [
        { term: "GSLB", desc: "Global server load balancing across regions" },
        { term: "Mechanism", desc: "DNS-based routing or Anycast to nearest healthy region" },
      ],
    },
  ],
};

export default loadBalancersCheatSheet;
