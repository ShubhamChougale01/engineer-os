import type { CheatSheetData } from "./types";

const websockets: CheatSheetData = {
  title: "The Ultimate WebSockets Cheat Sheet",
  subtitle: "Full-duplex persistent connections · heartbeat · stateful scaling · security",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Handshake: HTTP -> Upgrade", desc: "Starts as normal HTTP, switches to WS frames on HTTP 101", code: "GET /chat  Upgrade: websocket  Connection: Upgrade\n-> HTTP/1.1 101 Switching Protocols" },
        { term: "Full-duplex, unprompted", desc: "The SERVER can push a message at any time -- no request needed", code: "socket.send(JSON.stringify({type: 'notification', text: '...'}))" },
        { term: "Always wss:// in production", desc: "Never plaintext ws:// beyond local development", code: "const socket = new WebSocket('wss://example.com/chat');" },
        { term: "No built-in message typing", desc: "Define your OWN envelope -- WS gives you raw frames only", code: "{\"type\": \"chat_message\", \"payload\": {...}}" },
      ],
    },
    {
      title: "Connection Health (non-negotiable)",
      color: "blue",
      rows: [
        { term: "Heartbeat / ping-pong", desc: "Detects connections that die silently, no close event fired", code: "socket.on('pong', () => socket.isAlive = true)\nsetInterval(() => { if (!s.isAlive) s.terminate(); s.ping(); }, 30000)" },
        { term: "Client reconnection + backoff", desc: "Network drops are common -- never assume the connection stays up", code: "socket.onclose = () => setTimeout(reconnect, backoffDelay());" },
        { term: "Close codes matter", desc: "1000 normal, 1006 abnormal, 1008 policy violation (auth/origin)", code: "" },
      ],
    },
    {
      title: "The #1 Challenge: Stateful Scaling",
      color: "emerald",
      rows: [
        { term: "Connections are bound to ONE instance", desc: "Unlike REST's stateless \"any instance handles any request\"", code: "// A client's connection lives on exactly one server process" },
        { term: "Sticky sessions", desc: "Simpler, but fragile on deploys/instance failure", code: "upstream ws_backend { ip_hash; server a; server b; }" },
        { term: "Pub/sub backplane (preferred at scale)", desc: "Redis lets ANY instance reach a client on a DIFFERENT instance", code: "publisher.publish('chat:room1', JSON.stringify(payload))\nsubscriber.on('message', forwardToLocalConnections)" },
      ],
    },
    {
      title: "Security",
      color: "amber",
      rows: [
        { term: "Authenticate at handshake time", desc: "No per-message Authorization header exists in WebSockets", code: "const socket = new WebSocket('wss://x.com/chat?token=' + authToken);" },
        { term: "Validate Origin header", desc: "Prevents cross-site WebSocket hijacking (CSRF-like risk)", code: "if (!ALLOWED_ORIGINS.includes(req.headers.origin)) socket.close(1008);" },
        { term: "Re-check authorization for sensitive actions", desc: "A long-lived connection's permissions can go stale", code: "// Don't trust handshake auth forever for every subsequent action" },
      ],
    },
    {
      title: "Production Concerns",
      color: "rose",
      rows: [
        { term: "Backpressure", desc: "A slow client can't keep up -> bufferedAmount grows unbounded", code: "if (socket.bufferedAmount > threshold) pauseOrCoalesce();" },
        { term: "Binary frames for binary data", desc: "Don't base64 audio/video into text frames -- real overhead cost", code: "socket.send(audioBufferAsArrayBuffer);   // not JSON.stringify" },
        { term: "Graceful shutdown on deploy", desc: "Restarting an instance abruptly drops ALL its connections", code: "// Stop accepting new conns, notify clients to reconnect, then close" },
      ],
    },
    {
      title: "When to Use WebSockets vs Alternatives",
      color: "cyan",
      rows: [
        { term: "Use WebSockets for", desc: "BOTH sides need frequent, unprompted messages -- chat, collab editing, voice", code: "" },
        { term: "Use Server-Sent Events instead for", desc: "One-directional server-to-client only (notifications, LLM streaming)", code: "// SSE is simpler -- no stateful-connection scaling complexity at all" },
        { term: "Popular abstraction library", desc: "Socket.IO adds reconnection, rooms, long-polling fallback", code: "" },
      ],
    },
  ],
};

export default websockets;
