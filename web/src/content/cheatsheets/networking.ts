import type { CheatSheetData } from "./types";

const networking: CheatSheetData = {
  title: "The Ultimate Networking Cheat Sheet",
  subtitle: "TCP/IP layers · DNS/TLS handshakes · systematic debugging · resilience patterns",
  sections: [
    {
      title: "The Layered Model",
      color: "violet",
      rows: [
        { term: "Layers, top to bottom", desc: "Each only needs to understand the layer immediately below/above", code: "Application (HTTP, DNS) -> Transport (TCP/UDP) -> Network (IP) -> Link -> Physical" },
        { term: "IP + Port = a socket", desc: "IP gets you to the MACHINE, port gets you to the SERVICE", code: "192.168.1.42:443" },
        { term: "Packet switching", desc: "Data broken into independently-routed packets, not a dedicated circuit", code: "// No single router knows the FULL path -- only the next hop" },
      ],
    },
    {
      title: "TCP vs UDP",
      color: "blue",
      rows: [
        { term: "TCP handshake", desc: "Must complete before ANY application data flows", code: "SYN -> SYN-ACK -> ACK" },
        { term: "TCP: reliable + ordered", desc: "Higher overhead -- APIs, databases, most everything", code: "// Lost packets auto-retransmitted, out-of-order packets reassembled" },
        { term: "UDP: unreliable + unordered", desc: "Lower overhead -- when a late packet is better dropped than resent", code: "// DNS queries, real-time audio/video, HTTP/3's QUIC" },
        { term: "TCP congestion control", desc: "Packet loss = congestion signal -> sender backs off, then ramps up again", code: "// Additive increase, multiplicative decrease" },
      ],
    },
    {
      title: "DNS & TLS",
      color: "emerald",
      rows: [
        { term: "DNS resolution hierarchy", desc: "Recursive resolver -> root -> TLD -> authoritative nameserver", code: "dig example.com; dig +trace example.com" },
        { term: "TTL controls propagation speed", desc: "Lower TTL BEFORE a planned DNS cutover", code: "// Cached at every level -- changes aren't instant everywhere" },
        { term: "TLS handshake happens ON TOP of TCP", desc: "This is WHY HTTPS has more round trips than HTTP", code: "ClientHello -> ServerHello+cert -> verify -> derive session key -> encrypted data" },
        { term: "TLS provides three things", desc: "Confidentiality (encryption), integrity (tamper detection), authentication (identity)", code: "" },
      ],
    },
    {
      title: "Systematic Debugging (ALWAYS this order)",
      color: "amber",
      rows: [
        { term: "1. Does DNS resolve?", desc: "", code: "dig api.example.com" },
        { term: "2. Basic reachability", desc: "ICMP only -- does NOT confirm the app is healthy", code: "ping 203.0.113.10" },
        { term: "3. Is the specific TCP port open?", desc: "Isolates firewall/connectivity from app issues", code: "nc -zv 203.0.113.10 443" },
        { term: "4. Full DNS+TCP+TLS+HTTP in one shot", desc: "The verbose flag shows every phase", code: "curl -v https://api.example.com/health" },
      ],
    },
    {
      title: "HTTP Evolution & Why It Changed",
      color: "rose",
      rows: [
        { term: "HTTP/2: multiplexed over ONE TCP conn", desc: "But one lost packet blocks ALL streams (TCP-level head-of-line blocking)", code: "" },
        { term: "HTTP/3: QUIC over UDP", desc: "Each stream gets INDEPENDENT loss recovery -- fixes that exact problem", code: "// Moving off TCP entirely was the actual fix, not an HTTP-layer tweak" },
        { term: "Connection reuse matters", desc: "Avoids repaying DNS+TCP+TLS setup cost on every request", code: "// Keep-alive, connection pooling, HTTP/2 multiplexing, TLS session resumption" },
      ],
    },
    {
      title: "Production Resilience & Security",
      color: "cyan",
      rows: [
        { term: "ALWAYS set explicit timeouts", desc: "Never rely on an unbounded default -- one hung dep can block everything", code: "requests.get(url, timeout=5)" },
        { term: "Retry-with-backoff, RETRYABLE errors only", desc: "A 400 will NEVER succeed on retry -- don't waste attempts on it", code: "time.sleep(2 ** attempt)   # exponential backoff" },
        { term: "Default-deny firewalls + network segmentation", desc: "Database tier reachable ONLY from the app tier, never public", code: "ufw default deny incoming; ufw allow 443/tcp" },
        { term: "NAT lets many devices share one public IP", desc: "Delayed IPv4 exhaustion's urgency for decades", code: "" },
      ],
    },
  ],
};

export default networking;
