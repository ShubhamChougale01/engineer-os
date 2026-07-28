import type { CheatSheetData } from "./types";

const realtimeAi: CheatSheetData = {
  title: "The Ultimate Realtime AI Cheat Sheet",
  subtitle: "Transports, VAD, turn-taking, interruption handling, latency budgets, and the architecture pattern behind low-latency voice/video AI",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Realtime AI", desc: "Continuous, bidirectional multimodal (usually voice) interaction with an AI model under a sub-second latency budget", code: "# no explicit turn boundary -- unlike submit-based text chat" },
        { term: "Turn-taking", desc: "The protocol deciding who is 'speaking' at any moment and what happens when both sides want to", code: "# implicit in voice; explicit (submit button) in text chat" },
        { term: "Voice activity detection (VAD)", desc: "Continuously analyzes audio to decide: is the speaker talking or silent right now", code: "state = vad.on_audio_chunk(is_speech=True/False)" },
        { term: "Barge-in / interruption", desc: "User starts speaking while the assistant is still mid-response", code: "# must be treated as NORMAL behavior, not an edge case" },
        { term: "Endpointing", desc: "Deciding exactly where an utterance ends -- the specific job VAD performs", code: "# tradeoff: fast = responsive, risks false interrupts" },
        { term: "Half-duplex vs full-duplex", desc: "Strict turn alternation vs genuinely overlapping simultaneous speech", code: "# most production systems: half-duplex + fast interruption" },
        { term: "Perceived vs actual latency", desc: "Streaming changes how fast a response FEELS, not total generation time", code: "# see the Streaming and Latency skills" },
      ],
    },
    {
      title: "Transports: WebSocket vs WebRTC",
      color: "blue",
      rows: [
        { term: "WebSocket", desc: "Persistent, full-duplex TCP connection carrying arbitrary messages (here, audio chunks)", code: "ws = connect('wss://gateway/realtime')\nws.send(audio_chunk)" },
        { term: "WebSocket weaknesses", desc: "No built-in jitter handling; TCP head-of-line blocking -- one lost packet stalls everything behind it", code: "# fine for controlled server-to-server hops" },
        { term: "WebRTC", desc: "Purpose-built for real-time media: jitter buffering, adaptive bitrate, NAT traversal, UDP-based", code: "pc = RTCPeerConnection()\npc.addTrack(audio_track)" },
        { term: "WebRTC strengths", desc: "Tolerates lossy/variable networks (mobile, Wi-Fi) without stalling on one lost packet", code: "# preferred for the uncontrolled client-facing hop" },
        { term: "Common hybrid pattern", desc: "WebRTC client to gateway (messy last mile); WebSocket gateway to model (controlled hop)", code: "client --WebRTC--> gateway --WebSocket--> model" },
        { term: "TURN / relay", desc: "Fallback path when direct peer-to-peer WebRTC connectivity is blocked by NAT/firewall", code: "# monitor relay-fallback rate as its own metric" },
      ],
    },
    {
      title: "Interruption Handling (the hard part)",
      color: "emerald",
      rows: [
        { term: "Three layers to coordinate", desc: "Cancel model generation, stop playback immediately, mark conversation state as interrupted", code: "model.cancel_generation()\nplayer.stop_immediately()\nhistory += ' [interrupted by user]'" },
        { term: "VAD during assistant's turn", desc: "Must run continuously, not just while listening -- otherwise barge-in is architecturally impossible", code: "# listening only between turns = no interruption support" },
        { term: "Half-fixed bug pattern", desc: "Playback stops but generation keeps running -- wastes tokens on a response nobody hears", code: "# test ALL THREE layers, not just audible outcome" },
        { term: "Tool call in flight during interrupt", desc: "Read-only calls can complete and be discarded; state-changing calls need an explicit policy", code: "if tool.is_idempotent: let_complete()\nelse: define_explicit_policy()" },
        { term: "Turn state machine", desc: "IDLE / USER_SPEAKING / ASSISTANT_SPEAKING, with barge-in as a valid transition from ASSISTANT_SPEAKING", code: "if state == ASSISTANT_SPEAKING and user_speech:\n    cancel_assistant(); state = USER_SPEAKING" },
      ],
    },
    {
      title: "Latency Budget & Jitter",
      color: "amber",
      rows: [
        { term: "Sub-second budget", desc: "Natural conversation needs low hundreds of ms to just under a second, end to end", code: "# capture+network+VAD+model TTFA+synth+playback" },
        { term: "VAD decision delay", desc: "A DESIGNED tradeoff, not just a technology limit -- shorter risks false interrupts", code: "# tune against real usage data, not a guessed default" },
        { term: "Jitter", desc: "Variance in arrival/playback timing -- a distinct metric from average latency", code: "jitter_ms = abs(actual_interval - expected_interval)" },
        { term: "Why jitter matters", desc: "Inconsistent timing feels WORSE than consistent-but-slower timing", code: "# track jitter explicitly, don't rely on avg latency alone" },
        { term: "Jitter buffer", desc: "Holds chunks briefly, releases at steady cadence -- trades small fixed delay for smooth playback", code: "release_time = arrival_time + buffer_ms" },
        { term: "Tail latency compounding", desc: "More sequential stages = worse p99, even if each stage's own p99 is fine", code: "# see the Latency skill: fewer stages beats faster stages" },
      ],
    },
    {
      title: "Architecture: Client / Gateway / Model",
      color: "rose",
      rows: [
        { term: "Three-tier pattern", desc: "Client (capture/playback) <-> Media Gateway (your infra) <-> Model Provider", code: "client <-> gateway <-> model_provider" },
        { term: "Why a gateway", desc: "Credential safety, auth, guardrails, provider abstraction, observability -- not optional past prototype", code: "# client should NEVER hold provider API keys directly" },
        { term: "Session affinity", desc: "Route a session's packets to the SAME gateway instance throughout, not round-robin mid-session", code: "# stateful VAD/buffer state breaks under naive load balancing" },
        { term: "Session lifecycle", desc: "Explicit reconnection, idle timeout, and graceful degradation handling for long-lived connections", code: "SESSION_IDLE_TIMEOUT_SECONDS = 300" },
        { term: "Geographic placement", desc: "Deploy gateways close to users -- network distance is a hard latency floor", code: "# same principle as the Latency/Scalability skills" },
      ],
    },
    {
      title: "Pitfalls & Production Checklist",
      color: "cyan",
      rows: [
        { term: "Polling instead of streaming", desc: "Structurally incompatible with realtime conversation -- adds delay and blocks true interruption", code: "# WRONG: while True: poll_is_ready(); sleep(200ms)" },
        { term: "Ignoring jitter/network variance", desc: "Optimizing only average latency misses the metric that actually predicts 'feels broken'", code: "# measure p50/p95/p99 latency AND jitter separately" },
        { term: "No interruption handling", desc: "Makes the system feel like an answering machine regardless of raw speed", code: "# the #1 tell of a turn-based pipeline wearing a voice UI" },
        { term: "Copied VAD threshold", desc: "A threshold tuned for one product's conversational style breaks another's", code: "# re-tune against YOUR real usage recordings" },
        { term: "Client holds provider credentials", desc: "No gateway means no safe place for auth, guardrails, or provider swaps", code: "# fine for a prototype, a liability in production" },
        { term: "Untested tool-interrupt policy", desc: "Assuming an in-flight side-effecting tool call can just be cancelled for free", code: "# define per-tool policy based on idempotency" },
        { term: "Cross-references", desc: "Streaming, Latency, WebSockets (foundations); OpenAI Realtime API, Voice AI (implementations); Tool Calling, Guardrails (agent layer)", code: "# read Streaming + Latency first if unfamiliar" },
      ],
    },
  ],
};

export default realtimeAi;
