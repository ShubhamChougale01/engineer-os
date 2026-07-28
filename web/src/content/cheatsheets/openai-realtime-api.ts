import type { CheatSheetData } from "./types";

const openaiRealtimeApi: CheatSheetData = {
  title: "The Ultimate OpenAI Realtime API Cheat Sheet",
  subtitle: "Persistent connections · VAD & interruption · voice tool-calling · latency toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Realtime API", desc: "Native speech-to-speech over a persistent connection", code: "wss://api.openai.com/v1/realtime?model=..." },
        { term: "vs stitched STT-LLM-TTS pipeline", desc: "Native processing avoids cumulative latency + lost tone/emphasis", code: "one model, one connection\nvs three separate systems + seams" },
        { term: "Persistent connection", desc: "WebSocket or WebRTC, stays open for the whole conversation", code: "not request/response -- a continuous\nbidirectional event stream" },
        { term: "Server-side VAD", desc: "Detects when the user has actually finished speaking", code: "speech_started -> speech_stopped\n(silence past a configured duration)" },
        { term: "Barge-in / interruption", desc: "User talks while assistant is speaking -- natively supported", code: "speech_started mid-response ->\nstop playback + response.cancel" },
        { term: "Output-item-style events", desc: "A stream of typed events, not one flat response", code: "response.audio.delta | function_call\n| speech_started | error" },
        { term: "Paralinguistic signal", desc: "Tone, emphasis, pauses -- preserved with native audio, lost in a transcript", code: "audio in/out, not text-only pipeline" },
      ],
    },
    {
      title: "Session & Connection Building Blocks",
      color: "blue",
      rows: [
        { term: "session.update", desc: "Configure voice, audio format, VAD, tools once at connection start", code: "{'type':'session.update','session':{\n  'voice':'alloy','turn_detection':{...},'tools':[...]}}" },
        { term: "turn_detection (server_vad)", desc: "Tunable turn-taking sensitivity", code: "{'type':'server_vad','threshold':0.5,\n 'silence_duration_ms':500}" },
        { term: "input_audio_buffer.append", desc: "Stream a chunk of the user's mic audio", code: "{'type':'input_audio_buffer.append','audio':b64_chunk}" },
        { term: "response.audio.delta", desc: "An incremental chunk of the model's spoken response", code: "play_audio_chunk(base64.b64decode(event['delta']))" },
        { term: "response.function_call_arguments.done", desc: "A tool the model wants to call, mid-conversation", code: "args = json.loads(event['arguments'])" },
        { term: "conversation.item.create + response.create", desc: "Send a tool's result back and prompt continuation", code: "{'type':'function_call_output','call_id':id,'output':...}\nthen {'type':'response.create'}" },
        { term: "response.cancel", desc: "Stop the model's in-flight response (for barge-in)", code: "await ws.send(json.dumps({'type':'response.cancel'}))" },
      ],
    },
    {
      title: "Everyday Idioms",
      color: "emerald",
      rows: [
        { term: "React to a stream of events", desc: "The core client pattern -- not a single call/response", code: "async for message in ws:\n    event = json.loads(message)\n    dispatch(event['type'], event)" },
        { term: "Interruption handling", desc: "Stop playback the instant speech_started fires mid-response", code: "if audio_player.is_playing():\n    audio_player.stop_immediately()\n    await ws.send({'type':'response.cancel'})" },
        { term: "Voice tool-call = same authorization rules", desc: "Schema-valid args are NOT automatically safe", code: "if not is_authorized(name, args): reject()" },
        { term: "Handle every event type", desc: "Never assume only audio.delta will arrive", code: "handler = handlers.get(event['type'], handle_unknown)" },
        { term: "Measure latency by CONTRIBUTOR", desc: "Network, VAD decision, model first-response, client buffer", code: "each has a DIFFERENT owner and fix --\nnever one aggregate number" },
        { term: "Never crash on an unknown event", desc: "A fast-evolving API adds new event types over time", code: "log and continue, don't raise" },
      ],
    },
    {
      title: "Power Features",
      color: "amber",
      rows: [
        { term: "Voice + tool calling together", desc: "A voice agent can act, not just converse", code: "tools defined in session.update,\nfunction_call events mid-stream" },
        { term: "VAD tuning as a product decision", desc: "silence_duration_ms trades responsiveness vs. false interrupts", code: "quick command app: short duration\nsupport call w/ thinking pauses: longer" },
        { term: "Consequence-tiered tool execution", desc: "Read-only vs. moderate vs. high-stakes actions handled differently", code: "high tier -> ALWAYS requires human approval,\nregardless of caller confidence" },
        { term: "Server-side gateway pattern", desc: "Broker client audio to the API, keep credentials off the client", code: "browser/phone -> your gateway -> Realtime API\n(API key never reaches the client)" },
        { term: "Reconnection / session-resume strategy", desc: "Persistent connections can and will drop", code: "explicit resume-or-restart plan,\nnever an unhandled failure" },
        { term: "Native vs. stitched pipeline tradeoff", desc: "A real build-vs-integrate decision, not strictly better/worse", code: "native: lower latency, less control\nstitched: more control, more latency/complexity" },
      ],
    },
    {
      title: "Pitfalls & Gotchas",
      color: "rose",
      rows: [
        { term: "One aggregate 'voice latency' number", desc: "Hides which specific stage is the actual bottleneck", code: "# WRONG: total_latency only\n# RIGHT: network + VAD + model + buffering, separately" },
        { term: "Generic VAD defaults, untested", desc: "Interrupts thinking pauses or feels sluggish", code: "# tune silence_duration_ms against\n# YOUR use case's real speech patterns" },
        { term: "Only handling response.audio.delta", desc: "Crashes on a tool call, error, or cancellation event", code: "# WRONG: play_audio(event['delta']) always\n# RIGHT: dispatch on event['type'] explicitly" },
        { term: "Voice tool call executed with no auth check", desc: "Voice input is NOT inherently more trustworthy than text", code: "# always check is_authorized() before executing" },
        { term: "'Understood the caller' == 'verified identity'", desc: "A real risk for account-access or consequential actions", code: "# authenticate separately (PIN, account check),\n# independent of the conversational API" },
        { term: "API credentials exposed to the client", desc: "A browser/mobile-exposed key can be extracted and abused", code: "# always broker through a server-side gateway" },
        { term: "No reconnection strategy", desc: "Any dropped connection kills the whole conversation", code: "# plan explicit resume-or-restart behavior" },
        { term: "Weaker moderation for voice than text", desc: "Audio carries adversarial content exactly as well as text does", code: "# same Prompt Injection Defense discipline,\n# no exemption for the voice modality" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Server-side voice gateway", desc: "Brokers client audio, holds credentials, applies auth uniformly", code: "class VoiceGateway:\n    def handle_client_connection(self, client_ws): ..." },
        { term: "Latency-contributor metrics", desc: "Separate histograms, not one aggregate", code: "network_latency_ms\nvad_decision_latency_ms\nmodel_first_response_latency_ms" },
        { term: "Connection-count capacity planning", desc: "Distinct from stateless request-per-second planning", code: "realtime_active_sessions (gauge)" },
        { term: "Interruption / tool-rejection rate", desc: "Track as explicit, separate signals", code: "realtime_interruptions_total\nrealtime_tool_call_rejections_total{tool}" },
        { term: "Telephony integration", desc: "SIP/PSTN gateway needed for actual phone-network deployment", code: "# separate infra layered alongside\n# the Realtime API itself" },
        { term: "Tool Calling / Structured Outputs tie-in", desc: "Shared authorization + schema discipline", code: "# see the Tool Calling and\n# Structured Outputs skills" },
        { term: "Secrets Management tie-in", desc: "Server-side credential handling for the gateway", code: "# see the Secrets Management skill" },
      ],
    },
  ],
};

export default openaiRealtimeApi;
