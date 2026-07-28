import type { SkillContent } from "../types";

/**
 * Voice AI (Speech-to-Text, Text-to-Speech, Speech-to-Speech) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const voiceAi: SkillContent = {
  overview: `
Voice AI is the discipline of building systems that convert speech to text (STT / ASR — automatic speech recognition), text to speech (TTS), or speech directly to speech (S2S), so that a computer can listen to a human, understand or transform what was said, and talk back in a natural voice. It sits at the intersection of signal processing, sequence modeling, and — increasingly — large language models, because modern voice products are rarely "just" a transcriber or "just" a narrator: they are pipelines that turn audio into meaning and meaning back into audio, often in real time, often while a person is actively speaking.

For an AI engineer, Voice AI matters because voice is the oldest and most natural human interface, and the last few years have made it viable as a primary interaction channel for software rather than a fallback for accessibility or IVR menus. Customer support agents, in-car assistants, meeting transcription tools, dictation software, accessibility tooling, language-learning apps, and real-time translation all depend on the same underlying stack: capture audio, transcribe or understand it, decide what to say, and synthesize a voice back. Building any of these well requires understanding not just model accuracy but latency budgets, streaming protocols, turn-taking, and the very real ethical weight of synthetic voices that can sound indistinguishable from a real person.

Key characteristics of the Voice AI stack: it is fundamentally a **streaming, real-time systems problem** as much as a modeling problem — a technically accurate transcript delivered three seconds late is often useless for a live conversation; it composes multiple models with different latency profiles (an STT encoder, an LLM or intent classifier, a TTS vocoder) that must be orchestrated carefully; and it increasingly blurs the line between "cascaded" pipelines (STT then LLM then TTS, each a separate model) and "speech-to-speech" pipelines (a single model that consumes and emits audio directly, skipping the intermediate text representation). This page treats STT, TTS, and S2S as one connected system, because in production they are almost always deployed together. Related platform skills: **Realtime AI** (the general low-latency streaming architecture that Voice AI is the most demanding instance of), **Inference** (the model-serving latency mechanics that determine how fast any one stage in the pipeline can respond), **Streaming** (the transport-layer patterns that carry audio chunks), **RNNs** and **Transformers** (the sequence-modeling foundations both STT and TTS models are built on).
`,

  history: `
Voice AI has three overlapping histories — speech recognition, speech synthesis, and (very recently) end-to-end speech-to-speech — that only started converging into unified "voice AI" products in the last few years.

| Year | Milestone |
|------|-----------|
| 1952 | Bell Labs' "Audrey" recognizes spoken digits 0–9 — the first automatic speech recognizer |
| 1960s | Early formant-based speech synthesizers (e.g. at Bell Labs) produce crude but intelligible robotic speech |
| 1971–1976 | DARPA Speech Understanding Research program; Carnegie Mellon's "Harpy" recognizes ~1,000 words |
| 1980s | Hidden Markov Models (HMMs) become the dominant statistical approach to ASR, paired with n-gram language models |
| 2000s | Concatenative TTS (unit selection — stitching together pre-recorded speech fragments) becomes the state of the art for naturalness |
| 2009–2012 | Deep neural networks begin replacing GMM-HMM acoustic models, dropping word error rates significantly (Hinton, Dahl, Mohamed et al.) |
| 2016 | DeepMind publishes **WaveNet**, an autoregressive neural vocoder that dramatically improves TTS naturalness over concatenative and parametric methods |
| 2017 | Tacotron and Tacotron 2 show end-to-end neural TTS (text to mel-spectrogram, then vocoder to waveform) can match human recordings on some benchmarks |
| 2018 | Google Duplex demonstrates a voice agent that can hold a phone conversation with a human, including disfluencies ("um," "mm-hmm") |
| 2020 | Non-autoregressive and diffusion-adjacent TTS architectures (e.g. Glow-TTS, FastSpeech) target faster, more parallel synthesis |
| Sep 2022 | OpenAI releases **Whisper**, an open, multilingual encoder-decoder STT model trained on 680,000 hours of weakly supervised audio — a step change in robustness across accents and noise |
| 2023 | Commercial low-latency streaming STT/TTS APIs (Deepgram, AssemblyAI, ElevenLabs, ElevenLabs-style voice cloning) mature into production-grade, developer-friendly products |
| 2023–2024 | Diffusion-based and flow-matching TTS models (e.g. research lines following NaturalSpeech, StyleTTS) push prosody and voice-cloning quality further |
| 2024 | OpenAI, Google, and others ship **native speech-to-speech / "advanced voice mode"** style products — models that consume and emit audio directly instead of only cascading STT to LLM to TTS |
| 2024–2025 | Real-time voice agent platforms (built on the **Realtime AI** streaming patterns) become a standard category: sub-second, interruption-aware, multi-turn voice assistants |

The throughline: ASR moved from rule-based, then statistical (HMM/GMM), then deep-learning acoustic models, then large pretrained encoder-decoders (Whisper-style); TTS moved from concatenative splicing to neural vocoders to end-to-end and diffusion-style models; and the frontier now is collapsing the STT-LLM-TTS pipeline into unified speech-to-speech models where that is viable.
`,

  "why-it-exists": `
Before modern Voice AI, "talking to a computer" meant one of two unsatisfying extremes. On one end, rigid IVR phone trees and command-word recognizers ("say 'one' for billing") that could only match a tiny, pre-enumerated vocabulary and broke completely on anything conversational, accented, or ambiguous. On the other end, dictation software that worked reasonably in quiet rooms with a trained single speaker but degraded sharply with background noise, overlapping speakers, or anyone outside its training distribution.

Text-to-speech had a parallel problem: synthesized voices were reliably recognizable as synthetic — flat, monotone, wrong stress patterns — which made them fine for reading out a flight number but exhausting to listen to for anything longer, and unusable for any product that wanted to feel like talking to a person rather than a screen reader.

Voice AI as a modern discipline exists to close both gaps at once, using the same wave of deep learning progress that transformed vision and text: large pretrained encoder-decoder models (Whisper-style) that generalize across accents, noise, and languages far better than hand-tuned HMM pipelines ever could, and neural vocoders and diffusion/autoregressive TTS models that produce prosody and timbre close enough to human speech that listeners often cannot reliably tell the difference in a short clip. The most recent chapter — speech-to-speech models — exists to close a *third* gap: cascaded pipelines lose paralinguistic information (tone, emotion, emphasis, pauses) the moment audio is flattened into text, and they add latency at every hop; a model that reasons directly over audio can, in principle, preserve that information and respond faster.
`,

  "problem-it-solves": `
Voice AI concretely removes:

- **The rigid-vocabulary ceiling**: modern STT understands open, conversational speech instead of matching a fixed command grammar — you can say anything, in your own words, in your own accent.
- **The noisy/real-world degradation problem**: large-scale, diverse training data (Whisper's 680,000 hours across languages and conditions is the reference example) makes models far more robust to background noise, accents, and microphone quality than earlier speaker-tuned systems.
- **Robotic, exhausting synthetic speech**: neural vocoders and modern TTS architectures produce prosody (stress, rhythm, intonation) that is far closer to natural speech, making long-form narration, voice assistants, and accessibility tools genuinely pleasant to listen to.
- **The all-or-nothing wait for a full utterance**: streaming STT and TTS let a system start transcribing or start speaking before the whole input or output is finalized, which is what makes live captioning, real-time translation, and conversational voice agents feel responsive rather than laggy.
- **Text-only interaction**: for hands-busy, eyes-busy, low-literacy, or accessibility contexts (driving, cooking, visual impairment), voice is the only practical interface — Voice AI is what makes that interface viable at scale instead of frustratingly limited.

What Voice AI deliberately does **not** solve, and should not be assumed to solve:

- **Perfect transcription in adversarial acoustic conditions**: heavy cross-talk, extreme background noise, or very strong dialectal variation still meaningfully raise word error rates; no current system is immune to this.
- **Understanding intent or meaning** — STT produces text (or a pipeline produces a response), but reasoning about what the speaker actually wants is an LLM/NLU concern layered on top (see the **LLM Fundamentals** and **Prompt Engineering** skills).
- **Consent and identity questions around synthetic voices**: the technology can clone a voice from a short sample; it does not by itself determine whether doing so is ethical or legal in a given context — that is a governance and product-policy responsibility, discussed in depth later in this page.
- **Zero latency**: every stage in a voice pipeline (audio capture, network transport, model inference, audio playback) takes real time; Voice AI techniques reduce and hide latency, they do not eliminate the physics of it.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Describe the STT pipeline end to end: audio capture, feature extraction (e.g. log-mel spectrograms), encoder-decoder transcription (Whisper-style), and the difference between streaming and batch transcription.
2. Explain the TTS pipeline: text/phoneme frontend, acoustic model (spectrogram prediction), and vocoder (spectrogram to waveform), and contrast autoregressive, non-autoregressive, and diffusion-based approaches at a conceptual level.
3. Contrast cascaded voice pipelines (STT to LLM to TTS) with end-to-end speech-to-speech pipelines, and explain the latency/quality/flexibility tradeoffs of each.
4. Build a latency budget for a full voice pipeline, identifying which stage typically dominates end-to-end response time.
5. Explain the main causes of degraded recognition accuracy — background noise, accent/dialect mismatch, overlapping speakers — and the mitigation techniques for each (noise suppression, accent-diverse training data, diarization).
6. Explain what speaker diarization is, why it matters in multi-speaker contexts, and how it differs from transcription itself.
7. Identify the classic pitfalls that make voice products feel broken: missing silence/no-speech detection, robotic prosody, ignoring turn-taking/interruption handling, and skipping diarization when it's needed.
8. Articulate the ethical dimensions of voice cloning — consent, disclosure, misuse potential (fraud, deepfakes) — and describe practical safeguards.
9. Write a runnable streaming STT client that sends audio chunks and receives incremental transcripts, and a TTS call using prosody controls.
10. Reason about where Voice AI fits relative to the **Realtime AI**, **Inference**, and **Streaming** skills when designing a production voice product.
`,

  prerequisites: `
- **Required**: comfort with basic Python, and the core idea of a neural network taking an input and producing an output (see the **Neural Networks** skill if this is new). No signal-processing background is assumed — the beginner section builds spectrograms and audio basics from zero.
- **Helpful**: the **RNNs** and **Transformers** skills, since both STT and TTS models are built on encoder-decoder sequence-to-sequence architectures descended from the same lineage covered there.
- **Helpful**: the **Inference** skill, for understanding latency mechanics (time-to-first-token equivalents, streaming generation) that map directly onto streaming STT/TTS.
- **Strongly recommended before building anything real-time**: the **Realtime AI** skill, which covers the general low-latency, interruption-aware streaming architecture that voice agents are the flagship example of.

Dependency map: **Neural Networks** / **RNNs** / **Transformers** (sequence modeling foundations) → this page (**Voice AI**) → **Realtime AI** (the streaming/turn-taking layer voice agents are built on) → production voice agent products. Sibling pages that interact with Voice AI: **LLM Fundamentals** (what sits between STT and TTS in a cascaded pipeline), **Streaming** (transport patterns for audio chunks), **Latency** (the general discipline this page's latency-budget section specializes).
`,

  "beginner-concepts": `
### What audio actually is, computationally

A microphone converts sound pressure waves into a continuous electrical signal, which gets **sampled** at a fixed rate (e.g. 16,000 or 44,100 times per second — the sample rate) and **quantized** into discrete integer values (e.g. 16-bit). A one-second clip at 16kHz, 16-bit, mono is 16,000 samples, each a number from -32,768 to 32,767. This raw waveform is the starting point for every STT model.

~~~python
import numpy as np

# A raw waveform is just a 1D array of amplitude samples over time.
sample_rate = 16_000          # samples per second — 16kHz is the STT industry default
duration_s = 1.0
t = np.linspace(0, duration_s, int(sample_rate * duration_s), endpoint=False)

# A 440Hz sine wave (concert A) — this is what "audio data" looks like under the hood.
waveform = 0.5 * np.sin(2 * np.pi * 440 * t)
print(waveform.shape)  # (16000,) — one float per sample
~~~

### From waveform to spectrogram

Raw waveforms are hard for neural networks to learn from directly — too long, too little obvious structure per sample. Almost every STT model first converts audio into a **spectrogram**: a 2D representation of frequency content over time, usually a **log-mel spectrogram** (mel scale approximates human pitch perception; log compresses amplitude the way human loudness perception works).

~~~python
# Conceptual: librosa is the standard library for this preprocessing step.
import librosa

y, sr = librosa.load("clip.wav", sr=16000)               # load + resample
mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=80, hop_length=160)
log_mel = librosa.power_to_db(mel)                        # shape: (80, num_frames)
# This (80, num_frames) matrix — not the raw waveform — is what a Whisper-style
# encoder actually consumes.
~~~

### STT (speech-to-text) at a glance

An STT model takes the spectrogram and produces text. Whisper-style models use an **encoder-decoder Transformer**: the encoder compresses the audio into a sequence of hidden representations, and the decoder generates text tokens autoregressively, attending back to the audio (exactly the cross-attention pattern covered in the **Transformers** skill).

~~~python
# Using OpenAI's Whisper (open-source, runs locally) for batch transcription.
import whisper

model = whisper.load_model("base")           # tiny/base/small/medium/large tradeoffs
result = model.transcribe("meeting.wav")
print(result["text"])
for segment in result["segments"]:
    print(f"[{segment['start']:.1f}s - {segment['end']:.1f}s] {segment['text']}")
~~~

### TTS (text-to-speech) at a glance

TTS runs the process in reverse: text goes in, audio comes out, typically via two stages — an acoustic model that predicts a mel-spectrogram from text, and a **vocoder** that converts that spectrogram into an actual waveform.

~~~python
# Conceptual call against a hosted TTS API (provider-agnostic shape).
import requests

response = requests.post(
    "https://api.example-tts.com/v1/speech",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "text": "Your order has shipped and will arrive Tuesday.",
        "voice": "en-US-standard-female-1",
        "format": "wav",
    },
    timeout=10,   # never make a network call without a timeout
)
response.raise_for_status()
with open("output.wav", "wb") as f:
    f.write(response.content)
~~~

### Silence and no-speech detection (voice activity detection, VAD)

A microphone is always producing samples, even when nobody is talking. **Voice Activity Detection (VAD)** decides which chunks of audio contain speech versus silence or background noise — it is the gate that decides when to start and stop sending audio to an STT model at all.

~~~python
# Conceptual VAD using webrtcvad — a lightweight, widely used VAD library.
import webrtcvad

vad = webrtcvad.Vad(mode=2)  # 0 (least aggressive) to 3 (most aggressive filtering)
frame_ms = 30                  # webrtcvad requires 10/20/30ms frames
is_speech = vad.is_speech(audio_frame_bytes, sample_rate=16000)
if is_speech:
    send_to_transcriber(audio_frame_bytes)
# Skipping this step is one of the most common beginner mistakes — see Common Mistakes.
~~~
`,

  "intermediate-concepts": `
### Streaming vs. batch transcription

**Batch transcription** sends a complete audio file and waits for a complete transcript — simple, but useless for live conversation. **Streaming transcription** sends audio in small chunks (often 100–300ms) as it is captured and receives incremental, partial results that get corrected as more context arrives.

~~~python
# Conceptual streaming STT client over WebSocket (provider-agnostic shape).
import asyncio
import websockets
import json

async def stream_transcribe(audio_chunks):
    uri = "wss://api.example-stt.com/v1/stream?sample_rate=16000"
    async with websockets.connect(uri, extra_headers={"Authorization": "Bearer KEY"}) as ws:
        async def sender():
            async for chunk in audio_chunks:            # e.g. mic frames, ~100ms each
                await ws.send(chunk)
            await ws.send(json.dumps({"type": "end_of_stream"}))

        async def receiver():
            async for message in ws:
                data = json.loads(message)
                if data["type"] == "partial":
                    print("...", data["text"], end="\\r")   # overwrite — still forming
                elif data["type"] == "final":
                    print("FINAL:", data["text"])            # committed segment

        await asyncio.gather(sender(), receiver())
~~~

Partial results can and do change ("I saw a" then "I saw a cat" then correcting to "I saw a car") — a UI or downstream LLM consuming streaming STT must treat partials as provisional and only act on finals, or on partials that have been stable for some minimum time window.

### Prosody control in TTS

Naturalness is not just about vocoder quality — it is about **prosody**: pitch contour, timing, stress, and pauses. Many TTS APIs expose SSML (Speech Synthesis Markup Language) or provider-specific controls to shape this explicitly rather than leaving everything to the model's default guess.

~~~xml
<speak>
  Your appointment is confirmed for <break time="300ms"/>
  <emphasis level="strong">Tuesday at 3 PM</emphasis>.
  <prosody rate="95%" pitch="-2st">We look forward to seeing you.</prosody>
</speak>
~~~

~~~python
# Sending SSML-style markup to a TTS API for explicit prosody control.
payload = {
    "ssml": ssml_string,
    "voice": "en-US-standard-female-1",
    "sample_rate": 24000,
}
response = requests.post(tts_endpoint, json=payload, timeout=10)
~~~

Without any prosody guidance, TTS defaults tend to read every sentence with flat, uniform stress — a major reason synthesized speech still sounds "robotic" even when individual phonemes are crisp; see Anti-Patterns.

### Cascaded vs. speech-to-speech pipelines

A **cascaded pipeline** chains three independent models: STT converts audio to text, an LLM (or business logic) decides what to respond with, and TTS converts that response back to audio. This is the dominant production pattern today because each stage can be swapped, debugged, and improved independently, and because text is a convenient, auditable intermediate representation (you can log it, moderate it, cache it).

A **speech-to-speech (S2S)** pipeline uses a single model that consumes audio and emits audio directly, without ever materializing a full text transcript internally (or treating text as only an internal, non-exposed representation). The appeal: lower end-to-end latency (fewer network/model hops), and the potential to preserve paralinguistic signal — tone, emphasis, laughter, hesitation — that gets flattened away the moment audio becomes plain text.

~~~text
Cascaded:      mic audio -> [STT model] -> text -> [LLM] -> text -> [TTS model] -> speaker audio
                              hop 1                  hop 2              hop 3

Speech-to-speech: mic audio -> [single S2S model] -> speaker audio
                              one hop, but a much harder modeling problem
~~~

The tradeoff is real: cascaded pipelines are easier to build, debug, moderate, and swap components in, but pay a latency and information-loss tax at each hop; S2S pipelines can be faster and more expressive but are harder to control, harder to make deterministic for tool-calling/business-logic, and much less mature tooling-wise as of this writing.

### Diarization: who said what

**Speaker diarization** answers "who spoke when," separate from "what was said" (transcription). A call with two speakers needs both: transcription gives the words, diarization assigns each word/segment to Speaker A or Speaker B.

~~~python
# Conceptual: transcription + diarization combined into a labeled transcript.
segments = transcribe_with_diarization("call.wav")
for seg in segments:
    print(f"[{seg['speaker']}] {seg['start']:.1f}s: {seg['text']}")
# [Speaker A] 0.0s: Thanks for calling support, how can I help?
# [Speaker B] 3.2s: Hi, my internet has been down since this morning.
~~~

Diarization is a genuinely separate model/algorithm from transcription (often clustering speaker-embedding vectors over time), and skipping it in a multi-speaker context (call center recordings, meeting transcripts, podcasts) produces a technically-correct-but-useless wall of undifferentiated text.
`,

  "advanced-concepts": `
### Encoder-decoder STT internals: how Whisper-style models actually work

A Whisper-style model has two Transformer stacks. The **audio encoder** takes the log-mel spectrogram, downsamples it through a couple of convolutional layers, then runs it through self-attention blocks — the output is a sequence of contextualized audio representations, one per short time window (roughly every 20ms of audio after downsampling). The **text decoder** generates output tokens autoregressively (the same mechanism covered in the **Inference** skill for LLMs), attending to the audio encoder's output via cross-attention at every decoding step, and to its own previously generated tokens via causal self-attention.

Special tokens steer behavior: a language token, a task token (transcribe vs. translate), and timestamp tokens that let the model emit segment-level timing directly as part of its output vocabulary rather than needing a separate alignment step. This is why Whisper output naturally comes with per-segment timestamps.

### Non-autoregressive and diffusion-based TTS

Early neural TTS (Tacotron-style) generated mel-spectrogram frames autoregressively, one frame conditioned on the last — accurate but slow, since generation cannot be parallelized across time any more than autoregressive text generation can (the same sequential bottleneck discussed in the **Inference** skill). Non-autoregressive architectures (e.g. FastSpeech-style models) instead predict the full spectrogram in parallel, using a separately trained or heuristic **duration predictor** to decide how many output frames each input phoneme should expand to — trading some flexibility for a large speedup.

Diffusion-based and flow-matching TTS approaches take a different route: start from noise and iteratively denoise toward a mel-spectrogram (or directly toward a waveform) conditioned on the text/phoneme sequence, borrowing the same generative framework used in image diffusion models. These approaches can produce very high naturalness and are well-suited to controllable style/prosody conditioning, at the cost of requiring multiple denoising steps per generation (though modern samplers need far fewer steps than early diffusion work).

### Neural vocoders

Whether the acoustic model is autoregressive, non-autoregressive, or diffusion-based, its direct output is usually a mel-spectrogram, not audio you can play — a separate **vocoder** converts that spectrogram into a raw waveform. WaveNet was the original autoregressive neural vocoder (extremely high quality, extremely slow — sample-by-sample generation). Later vocoders (GAN-based approaches like HiFi-GAN-style architectures, and flow-based vocoders) generate the entire waveform in parallel, making real-time synthesis practical without sacrificing much quality.

### Voice cloning: mechanism and consent

Modern voice cloning systems learn a **speaker embedding** — a vector that captures a specific voice's timbre and characteristics — either from a large amount of enrollment audio (higher fidelity) or from a very short reference clip (few-shot / zero-shot cloning, now common in commercial products). That embedding conditions the TTS model so it synthesizes new, arbitrary text in the cloned voice.

This capability creates a real ethical and legal responsibility that is not automatically handled by the technology: a system that can clone a voice from seconds of audio can also be used to impersonate someone without their knowledge or consent (fraud, harassment, non-consensual deepfakes, fabricated evidence in a legal or political context). Responsible deployment requires, at minimum: explicit, verifiable consent from the person whose voice is being cloned before enrollment; audible or embedded disclosure that a voice is synthetic where legally or ethically warranted; watermarking or provenance signals where the provider supports them; and access controls that prevent cloning an arbitrary public figure's voice from a scraped audio sample. This is covered further in Security.

### Turn-taking, barge-in, and interruption handling

A production voice agent must handle **barge-in**: the user starts speaking while the system is still talking (interrupting it), which requires the system to stop TTS playback promptly, discard or truncate the in-flight response, and immediately start listening. This is a systems problem, not a model problem — it requires full-duplex audio handling (simultaneous send/receive) and a clear state machine (listening / thinking / speaking / interrupted), which is exactly the territory the **Realtime AI** skill covers in depth.

### Decision table: cascaded vs. speech-to-speech

| Dimension | Cascaded (STT to LLM to TTS) | Speech-to-speech |
|---|---|---|
| Latency | Higher — three model hops, each with its own inference latency | Lower in principle — one model, one hop |
| Debuggability | High — text transcript is inspectable/loggable at each stage | Lower — often no clean intermediate text to inspect |
| Moderation/business logic | Easy — apply text-based guardrails and tool-calling on the transcript | Hard — must be built into or around the single model |
| Paralinguistic fidelity | Lost at the STT step (tone, emphasis, hesitation flattened to text) | Potentially preserved |
| Maturity/tooling | Mature, many interchangeable vendors per stage | Newer, fewer mature options, less interchangeable |
| Best fit | Most production voice agents, call centers, transcription products | Highly latency-sensitive, expressive conversational products |
`,

  "internal-working": `
Tracing one utterance end to end through a cascaded voice pipeline makes the moving parts concrete.

~~~mermaid
flowchart TD
    A[Microphone captures raw audio] --> B[VAD: is this speech or silence?]
    B -- silence --> B
    B -- speech detected --> C[Chunk audio into ~100-300ms frames]
    C --> D[Stream frames to STT encoder]
    D --> E[Feature extraction: waveform to log-mel spectrogram]
    E --> F[Audio encoder: contextualized representations]
    F --> G[Text decoder: autoregressive token generation]
    G --> H{Partial or final segment?}
    H -- partial --> I[Emit partial transcript to caller]
    H -- final --> J[Emit final transcript]
    J --> K[LLM / business logic decides response text]
    K --> L[TTS text/phoneme frontend]
    L --> M[Acoustic model: text to mel-spectrogram]
    M --> N[Vocoder: mel-spectrogram to waveform]
    N --> O[Stream audio frames to speaker]
    O --> P{User starts speaking again mid-playback?}
    P -- yes, barge-in --> Q[Stop playback, discard remaining audio, return to listening]
    P -- no --> R[Finish playback, return to listening]
~~~

Internally, the STT stage's audio encoder processes overlapping windows of the spectrogram through convolution and self-attention layers, producing a compressed sequence of vectors far shorter than the raw sample count (16,000 samples per second of 16kHz audio collapse to on the order of tens of encoder positions per second after downsampling). The text decoder then generates tokens one at a time, attending back over that entire encoded audio sequence via cross-attention, exactly analogous to how an LLM decoder attends over a prompt — except the "prompt" here is audio, not text.

On the TTS side, the acoustic model expands each input phoneme into some number of output spectrogram frames (learned or predicted duration), predicting pitch and energy contours per frame to control prosody, and the vocoder then upsamples that low-time-resolution spectrogram into a full-rate waveform (a mel-spectrogram frame every ~10ms expands to hundreds of raw audio samples per frame at typical sample rates).
`,

  architecture: `
A production voice pipeline is best thought of as a small set of independently scalable services connected by low-latency streaming transport, not a monolith.

~~~text
Client (browser / mobile / phone line)
  │  WebRTC or WebSocket, chunked audio frames
  ▼
Media/Signaling Gateway
  │  handles codec negotiation, jitter buffering, reconnection
  ▼
VAD / Turn-taking Service
  │  decides speech vs. silence, detects barge-in, tracks conversation state
  ▼
Streaming STT Service  ───────────────►  Transcript Log / Analytics Store
  │  emits partial + final transcripts
  ▼
Orchestration Layer (LLM / business logic / tool calling)
  │  decides response text, may call external APIs/tools
  ▼
Streaming TTS Service
  │  emits audio frames as they are synthesized, not all at once
  ▼
Media/Signaling Gateway
  │
  ▼
Client speaker output
~~~

Key architectural decisions: STT and TTS are almost always separate horizontally-scalable services (often third-party APIs) fronted by the orchestration layer, because they have very different compute profiles and failure modes; the VAD/turn-taking layer is typically colocated with the media gateway to minimize the round trip needed to detect "user has started/stopped talking"; and the transcript log is written asynchronously so it never sits on the latency-critical path. For products built on a single end-to-end speech-to-speech model, this architecture collapses the STT/orchestration/TTS boxes into one model-serving service, but the media gateway, VAD/turn-taking, and transcript logging layers remain largely the same — see the **Realtime AI** skill for the general pattern this specializes.
`,

  "data-flow": `
~~~mermaid
sequenceDiagram
    participant User
    participant Gateway as Media Gateway
    participant VAD
    participant STT as Streaming STT
    participant LLM as Orchestration/LLM
    participant TTS as Streaming TTS

    User->>Gateway: audio frame (speaking)
    Gateway->>VAD: forward frame
    VAD-->>Gateway: speech detected, start streaming
    Gateway->>STT: audio frames (continuous)
    STT-->>Gateway: partial transcript ("I want to...")
    STT-->>Gateway: partial transcript ("I want to book...")
    STT-->>Gateway: final transcript ("I want to book a flight.")
    Gateway->>LLM: final transcript + conversation context
    LLM-->>Gateway: response text (streamed token by token)
    Gateway->>TTS: response text (as it streams from the LLM)
    TTS-->>Gateway: audio frames (streamed as synthesized)
    Gateway-->>User: audio playback begins before full response is ready
    User->>Gateway: starts speaking (barge-in) mid-playback
    Gateway->>TTS: cancel remaining synthesis
    Gateway-->>User: playback stops, system returns to listening
~~~

The critical latency lever visible in this trace: the system does not wait for the LLM's full response before starting TTS, and does not wait for the full TTS clip before starting playback — every stage streams into the next as soon as it has enough to act on, which is what makes the perceived latency far lower than the sum of each stage's total processing time.
`,

  "production-usage": `
Real voice products are built from a mix of managed APIs and, less commonly, self-hosted open models, chosen per stage based on latency, cost, and language/accent coverage needs.

- **STT**: commercial streaming APIs (chosen for low-latency websocket/gRPC streaming with strong accent robustness) are common for live products; self-hosted Whisper (or Whisper-derived faster inference runtimes) is common for batch transcription workloads (call recording archives, meeting notes) where sub-second latency is not required and cost/control matter more.
- **TTS**: commercial APIs dominate for voice quality and library breadth (many voices, languages, emotional styles); self-hosted open TTS models are chosen when data residency, cost at very high volume, or custom voice requirements make a managed API impractical.
- **Orchestration**: the LLM or business-logic layer is typically the same infrastructure used for any LLM product (see **Inference** and **Serving**), with voice-specific additions: streaming token output timed to feed TTS incrementally, and conversation state that tracks turn boundaries.
- **Transport**: WebRTC is standard for browser/mobile real-time audio (handles jitter, packet loss, codecs); plain WebSockets are common for server-to-server streaming legs of the pipeline.
- **Configuration defaults worth setting explicitly**: sample rate (16kHz is the STT-model-training-time default for most systems; using anything else without resampling silently degrades accuracy), VAD aggressiveness/mode, partial-result debounce time (how long a partial must be stable before treated as actionable), and a hard timeout per pipeline stage so one slow component cannot stall the whole conversation.
- **Project layout**: a typical voice-agent service separates the media/transport layer, the VAD/turn-taking state machine, the STT/TTS client adapters (behind a common interface so providers are swappable), and the orchestration/LLM logic into distinct modules — mirroring the architecture diagram above so each piece can be tested, mocked, and scaled independently.
`,

  "industry-examples": `
- **OpenAI**: ships Whisper as an open STT model widely used across the industry, and separately ships real-time, low-latency speech-to-speech voice modes in its consumer and API products, representing both ends of the cascaded-vs-S2S spectrum.
- **Google**: uses large-scale STT/TTS across Google Assistant, Android's on-device dictation, and YouTube's automatic captioning, and has published foundational TTS research (Tacotron, WaveNet) that shaped the whole field's approach to neural vocoders.
- **Amazon**: Alexa runs a full voice pipeline (wake-word detection, STT, NLU, TTS) at massive device scale, and AWS separately offers STT/TTS as standalone cloud services for third-party developers.
- **Call-center and customer-support platforms**: companies building AI voice agents for support and sales calls combine streaming STT, an LLM for intent/response generation, and TTS, with heavy investment in diarization (to separate agent and customer) and barge-in handling, because call quality directly affects revenue.
- **Meeting-transcription tools**: products that record and transcribe video calls rely heavily on diarization (who said what) layered on top of transcription, since a meeting transcript without speaker labels is far less useful than one with them.
- **Accessibility and assistive technology**: live captioning tools and screen readers depend on STT and TTS respectively as core, not supplementary, functionality — latency and accuracy directly determine whether the tool is usable in real time.
`,

  "best-practices": `
1. **Always run VAD before transcription.** Sending continuous silence to a streaming STT service wastes cost and can produce spurious hallucinated transcript fragments from some models on pure noise or silence.
2. **Treat partial STT results as provisional.** Never trigger irreversible actions (sending a payment, hanging up a call) off a partial transcript — only act on finalized segments, or on partials stable for a defined debounce window.
3. **Set explicit timeouts on every network call in the pipeline** — STT, TTS, and LLM calls should each have a timeout and a defined fallback (retry, degrade to text, or apologize gracefully) rather than hanging the whole conversation.
4. **Stream every stage, don't buffer.** Start TTS synthesis as the LLM's response streams in, and start audio playback as TTS synthesizes, rather than waiting for each stage to fully complete — this is the single biggest lever on perceived latency.
5. **Design explicit turn-taking state.** Model the conversation as a state machine (listening / processing / speaking) rather than ad hoc flags, so barge-in and silence timeouts have one clear place to be handled correctly.
6. **Add prosody control deliberately for anything longer than a short confirmation.** Default TTS output on long-form text tends to sound flat; use SSML-style breaks, emphasis, and rate/pitch adjustment for scripted, high-visibility responses.
7. **Log transcripts and audio (with consent and appropriate retention policy) for debugging and evaluation**, but keep that logging off the latency-critical path — write asynchronously.
8. **Test across accents, noise conditions, and audio codecs explicitly**, not just with clean studio-quality recordings from the development team's own voices — this is where most real-world word-error-rate surprises come from.
9. **Use diarization whenever more than one speaker is plausible.** A transcript without speaker labels in a two-or-more-party context is only half the deliverable.
10. **Get explicit, verifiable consent before cloning any real person's voice**, disclose synthetic voices where required, and prefer providers offering watermarking/provenance features for cloned voices.
11. **Version and A/B your STT/TTS provider choices behind a common interface.** This space moves fast; a swappable adapter layer avoids a painful rewrite when a better model or lower-cost provider appears.
12. **Measure time-to-first-audio (the S2S/TTS equivalent of time-to-first-token), not just total pipeline latency**, since perceived responsiveness is dominated by how quickly something audible starts, not by total completion time.
`,

  "anti-patterns": `
**Anti-pattern: no silence/no-speech detection.**

~~~python
# WRONG — streams every microphone frame to STT regardless of whether
# anyone is speaking, wasting cost and inviting hallucinated transcripts
# on pure background noise.
async def bad_capture_loop(mic_stream, stt_client):
    async for frame in mic_stream:
        await stt_client.send(frame)

# RIGHT — gate frames through VAD; only stream speech, and explicitly
# signal end-of-utterance on a sustained silence window.
async def good_capture_loop(mic_stream, stt_client, vad):
    silence_ms = 0
    async for frame in mic_stream:
        if vad.is_speech(frame):
            silence_ms = 0
            await stt_client.send(frame)
        else:
            silence_ms += frame.duration_ms
            if silence_ms > 700:            # tune per product
                await stt_client.end_of_utterance()
~~~

**Anti-pattern: waiting for the full LLM response before starting TTS.**

~~~python
# WRONG — adds the entire LLM generation time to the latency budget
# before the user hears anything.
full_response = await llm.generate(prompt)          # blocks for seconds
audio = await tts.synthesize(full_response)
play(audio)

# RIGHT — stream LLM tokens into TTS incrementally, sentence by sentence.
buffer = ""
async for token in llm.stream(prompt):
    buffer += token
    if buffer.rstrip().endswith((".", "?", "!")):
        audio_chunk = await tts.synthesize(buffer)
        play_streaming(audio_chunk)
        buffer = ""
~~~

**Anti-pattern: ignoring diarization in multi-speaker audio.**

~~~python
# WRONG — flat transcript, unusable for a two-party call.
transcript = "thanks for calling how can I help hi my internet is down"

# RIGHT — attribute segments to speakers.
segments = [
    {"speaker": "agent", "text": "Thanks for calling, how can I help?"},
    {"speaker": "customer", "text": "Hi, my internet is down."},
]
~~~

**Anti-pattern: no prosody control on long-form TTS**, producing flat, monotone narration that listeners abandon after a few sentences — see Intermediate Concepts for the SSML-based fix.

**Anti-pattern: cloning a voice without consent**, either by scraping public audio of a real person or by allowing end users to upload arbitrary third-party audio for cloning without verification — a governance failure, not just an engineering one; see Security.
`,

  performance: `
Measure before optimizing. The core metrics for a voice pipeline:

- **Time-to-first-transcript (partial)**: how long after speech starts before the first partial STT result appears.
- **Time-to-first-audio**: how long after the system decides to respond before the user hears the first frame of TTS audio — the S2S-pipeline equivalent of time-to-first-token in the **Inference** skill.
- **Word error rate (WER)**: the standard STT accuracy metric — substitutions, insertions, and deletions divided by total reference words. Measure it per accent/noise-condition bucket, not just in aggregate, since aggregate WER can hide large gaps for specific speaker populations.
- **Real-time factor (RTF)**: processing time divided by audio duration; RTF less than 1 means a model can keep up with a live stream (RTF of 0.3 means it processes 1 second of audio in 0.3 seconds — comfortably real time).
- **End-to-end conversational latency**: from the user finishing a sentence to hearing the system's response begin.

Ordered optimization hierarchy, roughly by typical impact:

1. **Stream every stage** (STT partials, LLM tokens, TTS audio frames) instead of buffering full results — this alone often cuts perceived latency by more than any single model swap.
2. **Right-size the STT/TTS model** for the latency budget — a smaller, faster model with slightly higher WER is frequently the correct tradeoff for a live conversational product; batch/offline transcription can afford a larger, slower, more accurate model.
3. **Tune VAD debounce windows** — too short causes premature cutoffs mid-sentence; too long adds dead air before the system responds. This is a UX-tuned parameter, not a fixed constant.
4. **Colocate pipeline stages network-wise** — cross-region hops between the STT service, LLM, and TTS service add fixed latency that no model optimization can remove; keep them in the same region/provider network where possible.
5. **Cache repeated TTS output** for static or frequently repeated phrases (confirmations, disclaimers) instead of re-synthesizing every time.
6. **Use quantized/optimized inference runtimes** for self-hosted STT/TTS models (see the **Inference** skill for the general quantization/batching techniques that apply equally here).
`,

  scalability: `
Voice pipelines scale primarily by treating each stage (media gateway, VAD, STT, orchestration, TTS) as an independently horizontally-scalable service behind a load balancer, since each has different resource profiles: media gateways are connection-count bound, STT/TTS are typically GPU- or accelerator-bound (or rate-limited if using a managed API), and orchestration/LLM calls have their own scaling story (see **Serving**).

| Bottleneck | Symptom | Mitigation |
|---|---|---|
| STT/TTS API rate limits | 429s under concurrent call spikes | Request higher quota tier; queue and shed load gracefully; multi-provider fallback |
| GPU capacity for self-hosted models | Rising real-time factor under load, audio falls behind live | Autoscale GPU workers; batch requests where streaming semantics allow; consider a faster/smaller model |
| Media gateway connection limits | New calls rejected or degraded audio quality under load | Horizontally scale gateway instances behind a load balancer; monitor concurrent connection count |
| Orchestration/LLM latency spikes | TTS starts late even though STT and TTS themselves are fast | Scale/cache the LLM layer independently (see **Serving**, **Inference**) |
| Cross-region network hops | Elevated end-to-end latency despite fast individual stages | Deploy pipeline stages in the same region as the user base; use regional routing |

Vertically, the main lever is GPU/accelerator choice for self-hosted STT/TTS models (throughput and real-time factor both improve with better accelerators); horizontally, the main lever is adding more stateless worker instances per stage behind a queue or load balancer, since most stages (aside from the stateful VAD/turn-taking layer per active call) do not need to share state across instances.
`,

  security: `
Voice AI has attack surface beyond typical web-service concerns, because the payload is a person's actual voice and the output can convincingly mimic one.

- **Voice cloning misuse (deepfake audio)**: the same technology that clones a voice for a legitimate product can be used for fraud (impersonating a family member or executive in a phone scam) or non-consensual synthetic content. Mitigations: require verifiable consent for any voice enrollment, rate-limit and audit cloning API usage, prefer providers with watermarking or provenance signals on generated audio, and consider detection tooling for suspected synthetic audio in high-risk workflows (e.g. financial authorization by phone).
- **Audio data as sensitive PII**: recorded speech can reveal identity (voiceprint), health status (speech patterns), and — via transcription — anything the speaker said, which may include payment details, health information, or other regulated data. Treat recorded audio and transcripts with the same access controls, encryption at rest/in transit, and retention limits as any other sensitive PII; see data-protection guidance in the broader platform's security-focused skills.
- **Prompt injection via transcribed speech**: if a cascaded pipeline feeds STT output directly into an LLM with tool-calling ability, a malicious or careless speaker (or an attacker who can inject audio into the call) can attempt prompt injection through spoken content exactly as they would through typed text — the same defenses (input sanitization, permission scoping on tool calls) apply.
- **Replay and spoofing attacks against voice biometrics**: if a product uses voiceprint matching for authentication, it must defend against recorded-and-replayed audio and increasingly capable synthetic voice attacks — liveness detection and multi-factor authentication should back any voice-based authentication, not replace other factors entirely.
- **Consent and disclosure**: several jurisdictions have or are developing specific legal requirements around disclosing AI-generated voices and obtaining consent for voice cloning; treat this as a compliance requirement to track, not just an ethical nicety, and involve legal review for any product feature that clones or synthesizes a real person's voice.
`,

  testing: `
Voice pipelines need tests at the unit level (individual stage logic), integration level (stages wired together), and audio-specific evaluation level (accuracy and naturalness metrics that don't fit typical assert-based tests).

~~~python
import pytest
from myapp.vad import SimpleVad
from myapp.pipeline import VoicePipeline

def test_vad_detects_silence_as_not_speech():
    vad = SimpleVad(mode=2)
    silence_frame = bytes(320)          # all-zero 20ms frame at 16kHz/16-bit
    assert vad.is_speech(silence_frame) is False

def test_pipeline_does_not_call_tts_on_empty_transcript():
    pipeline = VoicePipeline(stt=FakeSTT(transcript=""), tts=FakeTTS())
    pipeline.handle_utterance(audio=b"...")
    assert pipeline.tts.synthesize_call_count == 0   # guards against silence -> empty response -> wasted TTS call

def test_barge_in_cancels_in_flight_tts():
    pipeline = VoicePipeline(stt=FakeSTT(), tts=SlowFakeTTS())
    pipeline.start_speaking("a long response")
    pipeline.handle_user_speech_detected()             # simulated barge-in
    assert pipeline.tts.was_cancelled is True

@pytest.mark.parametrize("wav_file,expected_wer_ceiling", [
    ("clean_studio.wav", 0.05),
    ("noisy_cafe.wav", 0.15),
    ("accented_speaker.wav", 0.15),
])
def test_word_error_rate_within_bounds(wav_file, expected_wer_ceiling):
    # Senior testing doctrine: don't just test on clean audio — test WER
    # across a labeled evaluation set spanning noise conditions and accents,
    # and fail the build if WER regresses past an agreed ceiling per bucket.
    wer = compute_wer(transcribe(wav_file), reference_transcript(wav_file))
    assert wer <= expected_wer_ceiling
~~~

Senior testing doctrine for voice systems specifically: maintain a labeled evaluation set that spans accents, noise conditions, and speaker counts (not just clean single-speaker studio audio), track WER per bucket over time as a regression gate, and periodically run manual listening tests for TTS naturalness/prosody since automated metrics for "does this sound robotic" are far less mature than WER is for transcription accuracy.
`,

  debugging: `
Escalation path for a voice pipeline that "feels broken" in production:

1. **Reproduce with a recorded audio clip**, not just live testing — capture the exact input audio (with consent/appropriate handling) so the failure is replayable offline.
2. **Check the transcript at the STT boundary first.** Play back the audio and compare it against both partial and final STT output — most "the bot said something weird" bugs trace back to a mis-transcription, not the LLM or TTS.
   ~~~bash
   # Inspect the raw STT service response for a captured clip.
   curl -X POST https://api.example-stt.com/v1/transcribe \\
     -H "Authorization: Bearer $STT_API_KEY" \\
     -F "audio=@captured_clip.wav" | jq .
   ~~~
3. **Check VAD behavior on the clip** if the transcript looks truncated or includes stray noise — verify the VAD correctly identified speech start/end boundaries; a common failure is a debounce window too short, cutting off the tail of an utterance.
4. **Check for barge-in / interruption race conditions** if audio playback sounds cut off or overlapping — inspect the conversation state machine's logs around the timestamp in question.
5. **Isolate the orchestration/LLM stage** by feeding it the exact final transcript directly (bypassing STT) to confirm whether the issue is in transcription or in response generation.
6. **Listen to the raw TTS output directly** (bypassing playback/transport) if audio sounds distorted or cut off — this isolates whether the bug is in synthesis or in the transport/playback layer.
7. **Check network-level metrics** (jitter, packet loss, reconnects) on the media gateway if audio quality issues are intermittent and not reproducible from a static clip — this points to WebRTC/transport issues rather than model issues.
`,

  monitoring: `
Instrument every stage boundary, not just the pipeline's overall success/failure, since voice pipelines fail in stage-specific ways that an aggregate error rate hides.

~~~python
import time
import logging

logger = logging.getLogger("voice_pipeline")

def handle_utterance(audio_chunk, stt, llm, tts):
    t0 = time.monotonic()
    partial_seen_at = None

    for event in stt.stream(audio_chunk):
        if event.type == "partial" and partial_seen_at is None:
            partial_seen_at = time.monotonic()
            logger.info("stt.time_to_first_partial_ms=%d", int((partial_seen_at - t0) * 1000))
        if event.type == "final":
            final_transcript = event.text
            logger.info("stt.final_latency_ms=%d wer_sample_flag=%s",
                        int((time.monotonic() - t0) * 1000), event.low_confidence)

    t_llm_start = time.monotonic()
    response_text = llm.generate(final_transcript)
    logger.info("llm.latency_ms=%d", int((time.monotonic() - t_llm_start) * 1000))

    t_tts_start = time.monotonic()
    first_audio_frame_at = None
    for frame in tts.stream(response_text):
        if first_audio_frame_at is None:
            first_audio_frame_at = time.monotonic()
            logger.info("tts.time_to_first_audio_ms=%d",
                        int((first_audio_frame_at - t_tts_start) * 1000))
        play(frame)

    logger.info("pipeline.total_latency_ms=%d", int((time.monotonic() - t0) * 1000))
~~~

What to alert on: time-to-first-partial and time-to-first-audio exceeding agreed thresholds (these drive perceived responsiveness directly), STT low-confidence-flag rate spiking (an early signal of accuracy degradation, e.g. from a new noisy deployment environment), TTS/STT API error and rate-limit rates, and abandoned-call or premature-hangup rate as a proxy business metric for pipeline quality that pure latency numbers can miss.
`,

  deployment: `
~~~dockerfile
# Production Dockerfile for a self-hosted STT worker (e.g. faster-whisper-style runtime).
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04
# Pinned CUDA base image: matches the accelerator runtime the model needs;
# avoids "works on my machine" GPU driver/library mismatches in production.

RUN apt-get update && apt-get install -y --no-install-recommends \\
        python3.11 python3-pip ffmpeg libsndfile1 \\
    && rm -rf /var/lib/apt/lists/*
# ffmpeg/libsndfile1: required by most audio-loading libraries (librosa, soundfile);
# --no-install-recommends and cleaning apt lists keep the image lean.

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# --no-cache-dir avoids bloating the image with pip's download cache.

COPY . .

ENV MODEL_SIZE=base \\
    SAMPLE_RATE=16000 \\
    LOG_LEVEL=INFO
# Explicit env defaults documented in one place; overridable per environment
# without rebuilding the image.

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
    CMD curl -f http://localhost:8080/health || exit 1
# Orchestrators (Kubernetes, ECS) need this to detect a hung worker
# (e.g. GPU driver crash) and restart it automatically.

EXPOSE 8080
CMD ["python3", "-m", "stt_worker.server"]
~~~

Production notes beyond the Dockerfile: run STT/TTS workers as separate deployments from the orchestration/LLM layer so each can scale on its own metrics (GPU utilization for model workers, request concurrency for orchestration); put a queue in front of self-hosted STT/TTS workers so bursty call volume doesn't directly overload GPU capacity; and always keep a fallback path (a secondary provider, or a "sorry, please repeat that" degraded mode) for when a pipeline stage times out, rather than letting the whole call hang.
`,

  "production-checklist": `
- [ ] VAD is in place and gates all audio sent to STT — no continuous streaming of silence.
- [ ] Streaming is used end to end (STT partials, LLM token stream, TTS audio frames) rather than buffering full results at any stage.
- [ ] Every network call to an STT/TTS/LLM provider has an explicit timeout and a defined fallback behavior.
- [ ] Barge-in / interruption handling is implemented and tested (playback stops promptly when the user starts speaking).
- [ ] Diarization is enabled for any multi-speaker context (calls, meetings, panels).
- [ ] Prosody controls (SSML or provider equivalent) are used for any non-trivial TTS output, not left at default settings.
- [ ] WER is measured across a labeled evaluation set spanning accents and noise conditions, not just clean audio, with a regression gate.
- [ ] Time-to-first-partial and time-to-first-audio are instrumented and alerted on.
- [ ] Voice cloning (if used) requires verified consent and appropriate disclosure; access to cloning is access-controlled and audited.
- [ ] Recorded audio and transcripts are handled as sensitive PII: encrypted, access-controlled, retention-limited.
- [ ] A fallback/degraded mode exists for provider outages or rate limiting (secondary provider, or graceful text-only degradation).
- [ ] Cross-region network hops between pipeline stages have been checked and minimized for the primary user base's geography.
- [ ] Load testing has been done against realistic concurrent-call volume, not just single-session latency testing.
- [ ] Alerting exists on abandoned-call/premature-hangup rate as a business-facing quality signal, not just technical latency metrics.
`,

  "common-mistakes": `
1. **Skipping VAD entirely** — streams every microphone frame regardless of speech presence, wasting STT cost and risking hallucinated output on pure noise; the fix is always gating with VAD (see Beginner Concepts).
2. **Treating partial transcripts as final** — acting on a still-forming partial result causes premature or wrong actions; only act on finalized segments or stability-debounced partials.
3. **Buffering full responses before starting TTS/playback** — adds the entire generation time to perceived latency; stream incrementally instead (see Anti-Patterns).
4. **Assuming one accent/noise profile covers all users** — teams that only test with their own (often clean, native-accent) voices ship systems with much higher real-world WER than their internal testing suggested.
5. **No barge-in handling** — users end up talking over a still-playing response with no way to interrupt it, which feels broken even if every individual model is accurate.
6. **Ignoring diarization in multi-speaker recordings** — a transcript is only half as useful without speaker attribution in a call-center or meeting context.
7. **Leaving TTS at default prosody for long-form content** — flat, monotone narration causes listener drop-off; explicit SSML/prosody control is not optional for anything beyond a short confirmation.
8. **Cloning a voice without consent**, or allowing arbitrary user-uploaded audio to be used for cloning without verification — an ethical and often legal failure, not just a technical oversight.
9. **No timeout on any pipeline stage** — a single slow STT/TTS/LLM call can hang an entire conversation with no fallback.
10. **Not instrumenting per-stage latency** — teams that only measure total pipeline latency cannot tell whether STT, orchestration, or TTS is the actual bottleneck when performance regresses.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|---|---|---|
| Garbled or silent audio output from TTS | Sample rate mismatch between TTS output and playback device/transport expectations | Explicitly match and resample sample rates end to end; verify the codec/format the transport expects |
| STT returns empty or near-empty transcript on clearly audible speech | Wrong sample rate fed to the model, or audio not resampled to the model's expected rate (often 16kHz) | Resample input audio to the STT model's expected sample rate before sending |
| Transcript includes phantom words during silence | No VAD gating, or VAD threshold too permissive, so background noise is sent to STT and hallucinated | Add or tighten VAD; raise the aggressiveness/confidence threshold |
| Playback cuts off mid-sentence | VAD/end-of-utterance debounce window too short, cutting the tail of a user's turn, or premature TTS cancellation logic | Increase silence debounce window; audit barge-in cancellation triggers for false positives |
| High WER only for certain speakers | Accent/dialect underrepresented in the STT model's training distribution | Evaluate WER per speaker/accent bucket; consider a model or provider with broader accent coverage, or accent-specific fine-tuning if available |
| Conversation feels laggy despite "fast" individual model benchmarks | Buffering full results at one or more stages instead of streaming | Audit each stage for buffer-then-forward patterns; convert to streaming end to end |
| 429 / rate-limit errors under load spikes | Concurrent call volume exceeding the STT/TTS provider's quota tier | Request a higher quota tier; queue and shed load; add a secondary provider fallback |
| Two speakers' words merged into one undifferentiated block | No diarization applied | Add a diarization step/model and attribute segments to speakers |
`,

  faqs: `
**Is Whisper still the best STT model as of this writing?**
Whisper (and its faster inference-optimized derivatives) remains a strong, widely used open baseline, especially for offline/batch transcription, but the streaming, low-latency, and commercial-API space moves quickly and multiple providers now compete closely on accuracy and latency. Benchmark against your own accent/noise distribution rather than trusting a single leaderboard number.

**Do I need speech-to-speech, or is cascaded good enough?**
For most production products today, cascaded (STT to LLM to TTS) is the right default: it's more mature, more debuggable, easier to moderate, and the components are swappable. Reach for speech-to-speech when latency is the dominant product requirement and you can tolerate less mature tooling and less business-logic control.

**Why does my TTS output sound robotic even though the model is supposedly high quality?**
Almost always a prosody problem, not a raw model-quality problem — flat pacing, no emphasis, no pauses. Add explicit prosody control (SSML breaks, emphasis, rate/pitch) rather than relying on model defaults for anything beyond a short phrase.

**How much audio do I need to clone a voice, and is that ethical?**
Modern systems can produce a recognizable clone from a very short clip (seconds, in some commercial products), which is exactly why consent and access control matter — the technical barrier to misuse is low. Always require verified consent from the voice's owner and check the provider's and your jurisdiction's disclosure requirements before shipping a cloning feature.

**What sample rate should I use?**
Match whatever your STT/TTS model was trained/optimized for — 16kHz is the common STT default; TTS output is often 22kHz-24kHz or higher. Mismatched or unnecessarily downsampled audio silently degrades accuracy and naturalness.

**How do I handle multiple people talking on one call?**
Add a diarization step; transcription alone tells you the words, not who said them, and most multi-speaker products (call centers, meetings) need both.

**Is real-time voice always necessary, or is batch transcription fine?**
Batch is fine and usually cheaper/more accurate for anything not interactive — meeting notes, podcast transcripts, call archives. Reserve the added complexity and cost of streaming for genuinely live, conversational use cases.

**What's the single biggest latency lever?**
Streaming every stage rather than buffering — this typically outweighs any individual model swap, and is the first thing to audit when a pipeline feels slow.
`,

  "interview-questions": `
**Junior level**

1. **What is the difference between STT and TTS?**
   Model answer: STT (speech-to-text / ASR) converts spoken audio into text; TTS (text-to-speech) converts text into synthesized audio. They are typically separate models with different architectures, often chained together with an LLM in between in a cascaded voice pipeline.

2. **What is a spectrogram and why do STT models use it instead of raw audio?**
   Model answer: A spectrogram represents frequency content over time, usually as a log-mel spectrogram; it compresses a long raw waveform into a more structured 2D representation that neural networks can learn from more efficiently than raw sample sequences.

3. **What is VAD and why is it needed?**
   Model answer: Voice Activity Detection decides whether an audio frame contains speech or silence/noise; it gates what gets sent to STT, avoiding wasted cost and hallucinated transcripts from processing non-speech audio continuously.

4. **What does streaming transcription mean, as opposed to batch?**
   Model answer: Streaming transcription processes audio incrementally as it arrives, returning partial results that get corrected as more context arrives, enabling live/real-time use; batch transcription processes a complete audio file and returns one final result.

5. **What is diarization?**
   Model answer: Diarization determines "who spoke when" in an audio recording — it's a separate task from transcription (which determines "what was said") and is essential for multi-speaker recordings like calls and meetings.

**Senior level**

6. **Walk through the tradeoffs between a cascaded STT-LLM-TTS pipeline and a native speech-to-speech model.**
   Model answer: Cascaded pipelines are more mature, debuggable, and moderable (text is an inspectable intermediate representation) but pay a latency and information-loss tax at each hop, losing paralinguistic signal like tone and hesitation when audio is flattened to text. Speech-to-speech models can be faster (fewer hops) and preserve more expressive signal, but are harder to control, harder to integrate business logic/tool-calling into, and have less mature tooling as of this writing.

7. **Why is naive autoregressive TTS generation slow, and what are two architectural approaches that address it?**
   Model answer: Autoregressive spectrogram generation predicts each frame conditioned on the previous one, which is inherently sequential and cannot be parallelized across time during inference — the same bottleneck autoregressive text generation faces. Non-autoregressive architectures predict the full spectrogram in parallel using a duration predictor; diffusion/flow-matching approaches iteratively denoise toward the target in a (usually smaller) fixed number of parallel steps.

8. **How would you build a latency budget for a real-time voice agent, and which stage typically dominates?**
   Model answer: Sum expected latency at each stage — audio capture/network transport, VAD decision, STT time-to-first-partial/final, orchestration/LLM time-to-first-token, TTS time-to-first-audio, and playback transport — while accounting for streaming overlap between stages (later stages start before earlier ones fully finish). In practice, orchestration/LLM generation time is often the largest single contributor unless carefully streamed, since STT and TTS latencies for short utterances are typically sub-second with modern streaming APIs.

9. **What specific failure modes should you test for beyond a standard clean-audio benchmark?**
   Model answer: Accent and dialect diversity, background noise/multiple noise types, overlapping speakers, low-quality/compressed audio codecs, and barge-in/interruption timing — aggregate WER on clean studio audio hides large accuracy gaps across these real-world conditions.

10. **How do you mitigate the risk of voice cloning being used for fraud or non-consensual content?**
    Model answer: Require verifiable, explicit consent before enrolling any real person's voice; apply access controls and audit logging to cloning APIs; prefer providers offering watermarking or provenance signals; disclose synthetic voice usage where legally or ethically warranted; and consider detection tooling for high-risk workflows like phone-based financial authorization.

11. **Explain how cross-attention works in a Whisper-style encoder-decoder STT model.**
    Model answer: The audio encoder produces a sequence of contextualized representations from the input spectrogram. The text decoder generates tokens autoregressively, using causal self-attention over its own previously generated tokens and cross-attention over the full encoder output at every step, letting each generated token attend to the relevant parts of the audio regardless of position.

12. **What would make you choose a self-hosted STT/TTS model over a managed API in production?**
    Model answer: Data residency or privacy requirements that preclude sending audio to a third party, very high volume where per-call managed-API cost exceeds self-hosting infrastructure cost, need for custom/domain-specific vocabulary or voices not offered by any managed provider, or latency requirements that colocating the model with the rest of the pipeline can meet better than a network hop to an external API.
`,

  "coding-questions": `
**Problem 1: Debounced end-of-utterance detector**

Implement a function that, given a stream of VAD speech/silence flags per audio frame, determines when an utterance has ended (a sustained silence period after speech was detected).

~~~python
from dataclasses import dataclass

@dataclass
class UtteranceState:
    in_utterance: bool = False
    silence_ms: int = 0

def process_frame(state: UtteranceState, is_speech: bool, frame_ms: int,
                   silence_threshold_ms: int = 700) -> tuple[UtteranceState, bool]:
    """
    Returns the updated state and whether this frame triggers end-of-utterance.
    Complexity: O(1) per frame, O(n) over a stream of n frames.
    """
    end_of_utterance = False
    if is_speech:
        state.in_utterance = True
        state.silence_ms = 0
    elif state.in_utterance:
        state.silence_ms += frame_ms
        if state.silence_ms >= silence_threshold_ms:
            end_of_utterance = True
            state.in_utterance = False
            state.silence_ms = 0
    return state, end_of_utterance

# Follow-up: how would you make silence_threshold_ms adaptive per user
# (some people pause longer mid-sentence)? Consider tracking a rolling
# per-user average pause length and adjusting the threshold accordingly,
# with bounds to avoid pathological values.
~~~

**Problem 2: Merge overlapping diarization segments**

Given a list of (speaker, start_time, end_time) segments from a diarization model that may slightly overlap at boundaries, merge consecutive segments from the same speaker.

~~~python
def merge_diarization_segments(segments: list[dict], gap_tolerance_s: float = 0.3) -> list[dict]:
    """
    segments: list of {"speaker": str, "start": float, "end": float}, sorted by start time.
    Merges consecutive segments from the same speaker if the gap between them
    is within gap_tolerance_s (handles minor diarization jitter at boundaries).
    Complexity: O(n) — single pass, since input is already sorted by start time.
    """
    if not segments:
        return []

    merged = [dict(segments[0])]
    for seg in segments[1:]:
        last = merged[-1]
        gap = seg["start"] - last["end"]
        if seg["speaker"] == last["speaker"] and gap <= gap_tolerance_s:
            last["end"] = max(last["end"], seg["end"])   # extend, guard against out-of-order end times
        else:
            merged.append(dict(seg))
    return merged

# Follow-up: what if segments aren't guaranteed sorted by start time?
# Sort first — O(n log n) — before the merge pass, or require the
# diarization service's contract to guarantee sorted output.
~~~

**Problem 3: Streaming transcript stability check**

Given a sequence of partial transcripts for one utterance, determine the longest prefix that has remained unchanged for at least the last k updates (a common technique for deciding what part of a partial transcript is "safe" to act on before the final arrives).

~~~python
def stable_prefix(partials: list[str], k: int = 3) -> str:
    """
    Returns the longest common prefix shared by the last k partial transcripts,
    used as a heuristic for "stable enough to display/act on before final."
    Complexity: O(k * m) where m is the length of the shortest of the last k strings.
    """
    if len(partials) < k:
        return ""
    recent = partials[-k:]
    shortest = min(recent, key=len)
    prefix_len = 0
    for i, ch in enumerate(shortest):
        if all(p[i] == ch for p in recent):
            prefix_len = i + 1
        else:
            break
    return shortest[:prefix_len]

# Follow-up: this is a heuristic, not a guarantee — the STT model can still
# revise a "stable" prefix on rare occasions. Discuss when this tradeoff
# is acceptable (e.g. live captioning) versus when only true finals should
# be trusted (e.g. triggering a payment).
~~~
`,

  "hands-on-labs": `
**Lab 1 (Beginner): Build a batch transcription CLI**
Deliverable: a command-line tool that accepts a WAV file, runs it through an open STT model (e.g. Whisper), and prints the transcript with per-segment timestamps. Skills exercised: audio loading/resampling, running a pretrained STT model, basic CLI design.

**Lab 2 (Intermediate): Streaming STT with live partial display**
Deliverable: a small application that captures microphone audio, applies VAD to gate frames, streams audio to an STT service over a WebSocket, and displays partial transcripts live in the terminal, finalizing on sustained silence. Skills exercised: VAD integration, async streaming, debounce logic for end-of-utterance detection.

**Lab 3 (Intermediate/Advanced): Add TTS with prosody control and measure time-to-first-audio**
Deliverable: extend Lab 2 into a simple round-trip voice loop — transcribe user speech, generate a canned or LLM-based response, synthesize it with explicit SSML-style prosody (pauses, emphasis), and play it back, while logging time-to-first-partial-transcript and time-to-first-audio for every turn. Skills exercised: TTS integration, prosody markup, latency instrumentation.

**Lab 4 (Production): Full barge-in-aware voice agent with diarization on recorded calls**
Deliverable: a production-shaped voice agent service that handles a live conversational loop with barge-in (stopping TTS playback when the user interrupts), plus a separate offline pipeline that runs diarization + transcription on recorded calls and outputs a speaker-labeled transcript. Include a labeled evaluation set (a handful of clips spanning at least two accents/noise conditions) with a WER report. Skills exercised: turn-taking state machine, diarization, evaluation methodology, production instrumentation (per the Monitoring section).
`,

  "real-projects": `
**Project 1: Real-time customer support voice agent**
Build a voice agent that answers common support questions over a simulated phone call: streaming STT, an LLM for intent classification and response generation with tool-calling to a mock knowledge base, streaming TTS with prosody control, and full barge-in handling. Engineering requirements: sub-second time-to-first-audio on simple queries, graceful degradation (hand off to "let me connect you to a human" wording) when the LLM has low confidence, and a full instrumentation dashboard covering per-stage latency and WER on a held-out test set.

**Project 2: Meeting transcription and summarization tool**
Build a tool that ingests a recorded multi-speaker meeting, runs diarization plus transcription to produce a speaker-labeled transcript, and generates a structured summary (action items, decisions, per-speaker talk time) via an LLM. Engineering requirements: correct handling of overlapping speech segments from diarization, a clear speaker-labeling UI/output format, and an evaluation harness comparing diarization + WER accuracy against a hand-labeled reference meeting.

**Project 3: Accessible live-captioning browser extension**
Build a browser extension or web app that captures system/tab audio and displays live captions with under-one-second latency, correctly handling silence (no phantom captions), speaker changes in multi-person video calls, and a fallback mode when the STT service is unavailable. Engineering requirements: WebRTC or Web Audio API integration, VAD tuned for typical video-call audio quality, and a user-facing latency/accuracy tradeoff setting (faster-but-rougher vs. slower-but-more-accurate captions).
`,

  "case-studies": `
**OpenAI Whisper's open release (2022):** Releasing a highly robust, multilingual STT model openly — rather than only as a paid API — rapidly became the de facto baseline the rest of the industry benchmarked against and built derivative, faster inference runtimes on top of. Lesson: open, broadly-trained foundation models can reset an entire field's baseline faster than incremental improvements to any single closed product.

**Google Duplex (2018):** Demonstrating a voice agent that could hold a natural phone conversation, including realistic disfluencies, drew both admiration for the technical achievement and immediate public concern about disclosure — should the person on the other end of the call know they're talking to an AI? Lesson: voice AI's realism creates disclosure and consent obligations that arrive alongside the capability, not after it; product design and policy have to move at the same pace as the model quality.

**Call-center voice AI adoption (2023-2025):** Companies deploying AI voice agents for support and sales calls found that latency and interruption-handling mattered as much as raw transcription/synthesis accuracy — agents with technically accurate STT/TTS still felt unusable to callers if barge-in was mishandled or responses lagged noticeably. Lesson: for conversational products, systems-level UX (turn-taking, latency) is not a secondary concern to model quality; it is frequently the dominant factor in perceived quality.

**Rise of few-shot/zero-shot voice cloning products (2023 onward):** As commercial products made voice cloning possible from just seconds of reference audio, the industry saw both legitimate use cases (personalized assistants, accessibility, media localization/dubbing) and a wave of misuse concerns (fraud calls, non-consensual synthetic audio). Lesson: when a capability's misuse cost is high and its technical barrier is low, consent verification and access control have to be treated as core product requirements, not optional add-ons.
`,

  comparisons: `
| Approach | Latency | Naturalness/Accuracy | Control/Debuggability | Maturity | Best fit |
|---|---|---|---|---|---|
| Batch STT (e.g. offline Whisper) | High (seconds-minutes) | High, can use largest model | High — full audio context available | Mature | Meeting notes, call archives, non-interactive transcription |
| Streaming STT | Low (sub-second partials) | Slightly lower than best batch models at equal size | Moderate — partials require careful handling | Mature | Live captioning, voice agents, dictation |
| Concatenative TTS (legacy) | Low | Low naturalness, limited flexibility | High — literal recorded fragments | Largely superseded | Rarely chosen for new products today |
| Neural autoregressive TTS | Moderate-high (sequential generation) | Very high naturalness | Moderate | Mature | High-quality narration where latency is less critical |
| Non-autoregressive / diffusion TTS | Low-moderate (parallel generation) | High naturalness, strong prosody control | Moderate-high | Maturing quickly | Real-time voice agents needing both speed and quality |
| Cascaded STT-LLM-TTS pipeline | Moderate (multiple hops, mitigated by streaming) | High per-stage, but loses paralinguistic signal at STT step | High — text is inspectable/moderated at each hop | Mature, dominant pattern | Most production voice products today |
| Native speech-to-speech | Potentially lowest (single hop) | Can preserve tone/emotion better | Lower — harder to moderate/tool-call | Early/emerging | Highly latency-sensitive, expressive conversational products |

How seniors choose: they start from the latency and control requirements of the product, not from "which model is newest." A support-call product that must log, moderate, and audit every response almost always chooses cascaded, because text-based auditability is a hard requirement; a consumer companion app chasing the most natural, fluid conversational feel may accept less debuggability for a speech-to-speech model's latency and expressiveness. Provider choice within STT/TTS is treated as swappable behind an adapter interface, re-evaluated periodically, since this space's state of the art shifts on a timescale of months, not years.
`,

  "related-technologies": `
- **Realtime AI**: the general low-latency, streaming, interruption-aware systems architecture that voice agents are the most demanding real-world instance of — read this next for turn-taking and full-duplex streaming patterns in depth.
- **Inference**: the model-serving mechanics (autoregressive generation, streaming, latency budgeting) that both STT decoding and the orchestration LLM in a voice pipeline are built on.
- **Transformers**: the architecture underlying Whisper-style STT encoder-decoders and much of modern TTS acoustic modeling.
- **RNNs**: the historical sequence-modeling foundation that early neural STT/TTS systems were built on before Transformers became dominant; useful background for understanding why streaming-friendly, low-latency architectures still sometimes favor recurrence-like designs.
- **Streaming**: general transport-layer patterns (chunking, backpressure, WebSockets) that carry audio frames between pipeline stages.
- **LLM Fundamentals**: the reasoning/response-generation layer that sits between STT and TTS in a cascaded voice pipeline.
- **Latency**: the general discipline of measuring and reducing end-to-end response time, specialized in this page's Performance section for the voice pipeline case.
- **Guardrails**: content moderation and safety concerns that apply to what an orchestration LLM says in a voice pipeline, equally relevant whether the output is text or synthesized speech.
`,

  "latest-updates": `
This page's knowledge is current as of the author's knowledge cutoff (early 2026) and should be verified against current provider documentation before making architecture decisions, since Voice AI is one of the faster-moving areas of applied AI. Directionally accurate, actively-evolving trends as of this writing:

- **Native speech-to-speech models** are maturing from research demos into production offerings from multiple major providers, narrowing (but not closing) the gap in control/debuggability against cascaded pipelines.
- **Diffusion and flow-matching TTS approaches** continue to push prosody naturalness and controllability, with fewer required denoising steps than early diffusion work, closing the latency gap with non-autoregressive alternatives.
- **Few-shot and zero-shot voice cloning** has become a standard commercial feature across multiple TTS providers, intensifying the urgency around consent-verification and watermarking/provenance tooling — several providers and jurisdictions are actively developing standards here.
- **Streaming STT accuracy and latency** continue to improve incrementally across commercial providers and open runtimes optimized for faster-than-real-time inference on modest hardware.
- **Multilingual and low-resource-language coverage** remains an active area of improvement, with meaningful accuracy gaps still present for many languages/dialects relative to high-resource languages like English.

Given the pace of change, verify any specific model, latency benchmark, or provider claim in this space against current documentation and independent benchmarks rather than treating any single source (including this page) as permanently current.
`,

  "future-roadmap": `
Where Voice AI is heading, and what's worth betting career time on:

- **Convergence toward unified multimodal models** that handle audio (and increasingly other modalities) natively, reducing but likely not eliminating the role of dedicated cascaded pipelines for use cases that need strict auditability and tool-calling control.
- **Real-time, full-duplex conversational voice** becoming a standard expectation for voice products, making the turn-taking/interruption-handling skills covered in **Realtime AI** increasingly essential rather than a specialized niche.
- **Stronger provenance and detection tooling** for synthetic audio, likely accelerating as regulatory attention on voice cloning and deepfakes increases — engineers who understand both the generation and detection sides will be well positioned.
- **Continued narrowing of the accent/dialect/low-resource-language accuracy gap**, driven by more diverse training data and techniques transferred from the broader LLM data-scaling playbook.
- **What to bet on**: deep fluency in latency budgeting and streaming systems design (transfers across STT, TTS, and S2S regardless of which specific model architecture wins), a working understanding of both cascaded and speech-to-speech tradeoffs (rather than betting exclusively on one paradigm), and hands-on familiarity with the ethical/consent tooling around voice cloning, since that governance layer is only going to become more load-bearing as the underlying technology gets better and cheaper.
`,

  "cheat-sheet": `
~~~text
VOICE AI QUICK REFERENCE

PIPELINE STAGES
  Audio capture -> VAD -> STT (streaming/batch) -> [LLM/orchestration] -> TTS -> playback
  Speech-to-speech: single model replaces STT + orchestration + TTS

KEY METRICS
  WER (word error rate)        - STT accuracy: (sub+ins+del) / reference words
  RTF (real-time factor)       - processing time / audio duration; <1 = keeps up live
  Time-to-first-partial        - STT responsiveness
  Time-to-first-audio          - TTS/S2S responsiveness (perceived latency driver)

STT (SPEECH-TO-TEXT)
  Preprocessing: waveform -> log-mel spectrogram (80 mel bins typical)
  Architecture: encoder (audio) + decoder (autoregressive text, cross-attention)
  Streaming: partial results (provisional) -> final results (act on these)

TTS (TEXT-TO-SPEECH)
  Frontend: text/phonemes -> Acoustic model: spectrogram -> Vocoder: waveform
  Autoregressive: sequential, high quality, slower
  Non-autoregressive: parallel, duration-predictor based, faster
  Diffusion/flow-matching: denoise from noise, strong prosody, few steps

CASCADED vs SPEECH-TO-SPEECH
  Cascaded: more hops, more latency, text is auditable/moderable, mature
  S2S: fewer hops, lower latency potential, less controllable, less mature

MUST-HAVES IN PRODUCTION
  VAD gating          - never stream silence to STT
  Streaming end-to-end - never buffer a full stage before forwarding
  Barge-in handling    - stop TTS playback the moment user speaks
  Diarization          - required whenever more than one speaker is possible
  Prosody control      - SSML breaks/emphasis for anything beyond short phrases
  Timeouts + fallback  - every network call, every stage

ETHICS
  Voice cloning requires verified consent + disclosure + access control/audit
  Treat recorded audio + transcripts as sensitive PII
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What does STT stand for and do? | Speech-to-text (ASR) — converts spoken audio into text |
| What does TTS stand for and do? | Text-to-speech — converts text into synthesized audio |
| What is VAD? | Voice Activity Detection — distinguishes speech frames from silence/noise |
| What is a log-mel spectrogram? | A time-frequency representation of audio (mel scale + log amplitude) used as model input instead of raw waveform |
| What is the difference between partial and final STT results? | Partials are provisional and may change; finals are committed and safe to act on |
| What is diarization? | Determining "who spoke when" in multi-speaker audio, separate from transcription |
| What is a vocoder? | The component that converts a spectrogram into a playable raw waveform |
| Why is autoregressive TTS slow? | Each frame depends on the previous frame, making generation sequential and unparallelizable across time |
| What problem does non-autoregressive TTS solve? | Predicts the full spectrogram in parallel using a duration predictor, trading some flexibility for speed |
| What is barge-in? | A user interrupting the system mid-speech, requiring immediate playback stop and return to listening |
| What is the main tradeoff between cascaded and speech-to-speech pipelines? | Cascaded is slower but more debuggable/moderable; S2S is potentially faster but less controllable and less mature |
| What is real-time factor (RTF)? | Processing time divided by audio duration; RTF < 1 means the system can keep up with live audio |
| Why does TTS sound robotic even with a good vocoder? | Usually a prosody problem — flat pacing/stress, not a vocoder-quality problem |
| What consent requirement applies to voice cloning? | Verified, explicit consent from the voice's owner, plus disclosure where required |
| What should you always add to STT/TTS/LLM network calls in a pipeline? | Explicit timeouts and a defined fallback behavior |
`,

  mcqs: `
**1. Why is naive autoregressive generation (in either STT decoding or TTS) inherently sequential?**
A. Because GPUs cannot run neural networks in parallel
B. Because each new token/frame is conditioned on the previous one, which must exist first
C. Because audio files are too large to parallelize
D. Because attention mechanisms require sorted input
**Answer: B.** The dependency is logical, not a hardware limitation — token/frame N+1 needs token/frame N to already exist as input, exactly the same constraint covered in the Inference skill for LLM decoding.

**2. What is the primary purpose of Voice Activity Detection (VAD)?**
A. To improve transcription accuracy on unclear speech
B. To identify which speaker is talking
C. To distinguish speech frames from silence/noise before sending audio downstream
D. To convert text into phonemes for TTS
**Answer: C.** VAD gates what gets sent to STT, avoiding wasted cost and hallucinated output on non-speech audio.

**3. In a cascaded STT-LLM-TTS pipeline, what information is typically lost at the STT step?**
A. The words spoken
B. Paralinguistic signal like tone, emphasis, and hesitation
C. The total duration of the audio
D. The speaker's identity
**Answer: B.** Flattening audio into plain text discards tone/emphasis/hesitation information that a speech-to-speech model could in principle preserve.

**4. What does diarization determine that transcription alone does not?**
A. The exact words spoken
B. Which speaker said which segment
C. The background noise level
D. The language being spoken
**Answer: B.** Diarization answers "who spoke when," a separate task from transcription's "what was said."

**5. What is the single biggest lever for reducing perceived latency in a voice pipeline, according to this page's Performance section?**
A. Switching to a larger STT model
B. Streaming every stage instead of buffering full results
C. Increasing the VAD aggressiveness setting
D. Using a higher audio sample rate
**Answer: B.** Streaming (partials, tokens, audio frames) as soon as available at each stage typically outweighs the impact of any single model swap.

**6. What is a key ethical requirement before deploying a voice-cloning feature?**
A. Ensuring the cloned voice sounds different enough from the original to avoid confusion
B. Verified, explicit consent from the person whose voice is being cloned, plus appropriate disclosure
C. Only allowing cloning of public figures' voices
D. Limiting cloned voices to a single language
**Answer: B.** Consent and disclosure are core requirements given how low the technical barrier to misuse (fraud, non-consensual synthetic content) has become.
`,

  "revision-notes": `
Voice AI covers three connected capabilities: speech-to-text (STT), text-to-speech (TTS), and end-to-end speech-to-speech (S2S). STT converts a raw waveform into a log-mel spectrogram, then runs it through an encoder-decoder model (Whisper-style) where the encoder contextualizes the audio and the decoder autoregressively generates text tokens via cross-attention over the encoded audio — the same cross-attention pattern LLM decoders use over a text prompt. Streaming STT sends audio in small chunks and returns provisional partial results followed by committed final results; only finals (or stability-debounced partials) should trigger irreversible downstream actions.

TTS runs in reverse: a text/phoneme frontend feeds an acoustic model that predicts a mel-spectrogram, which a vocoder then expands into a playable waveform. Autoregressive TTS is high quality but sequential and slow; non-autoregressive architectures predict the full spectrogram in parallel using a duration predictor for speed; diffusion/flow-matching approaches iteratively denoise toward the target and are increasingly competitive on both quality and speed. Naturalness problems ("robotic" TTS) are usually prosody problems — flat pacing and stress — fixable with explicit SSML-style controls (breaks, emphasis, rate/pitch), not vocoder swaps.

Cascaded pipelines (STT to LLM to TTS) remain the dominant production pattern because text is an inspectable, moderable, swappable intermediate representation, at the cost of extra latency hops and lost paralinguistic signal. Native speech-to-speech models collapse this into one hop, potentially faster and more expressive, but less mature and harder to control/audit — choose based on the product's latency versus control requirements, not novelty.

Production-quality voice systems require: VAD gating (never stream silence), end-to-end streaming (never buffer a full stage before forwarding to the next), explicit turn-taking/barge-in handling (stop playback the instant the user interrupts), diarization whenever more than one speaker is possible, and timeouts/fallbacks on every network call. Measure WER per accent/noise-condition bucket (not just aggregate), and instrument time-to-first-partial and time-to-first-audio as the primary perceived-latency signals.

Voice cloning carries real ethical weight: the technical barrier to cloning a convincing voice from a short clip is low, while the misuse potential (fraud, non-consensual synthetic content, deepfakes) is high. Verified consent, disclosure, access control/auditing, and watermarking/provenance support are core product requirements, not optional extras — treat this with the same seriousness as any other sensitive-data or security concern covered elsewhere on this platform.
`,

  "learning-roadmap": `
**Week 1 — Foundations:** Learn what audio is computationally (sampling, waveforms, spectrograms). Run a pretrained Whisper model locally on a few sample clips (Lab 1). Milestone: explain, from a raw WAV file, every transformation up to a log-mel spectrogram, and produce a batch transcript with timestamps.

**Week 2 — Streaming STT and VAD:** Build a streaming STT client with VAD gating and live partial transcript display (Lab 2). Milestone: a working terminal app that transcribes live microphone input with correct end-of-utterance detection.

**Week 3 — TTS and prosody:** Integrate a TTS API, experiment with SSML-style prosody controls, and extend the Week 2 app into a round-trip voice loop with latency instrumentation (Lab 3). Milestone: a voice loop with measured time-to-first-partial and time-to-first-audio for every turn.

**Week 4 — Production concerns:** Add barge-in handling, diarization for a multi-speaker recorded call, and a small WER evaluation harness spanning at least two accent/noise conditions (Lab 4). Milestone: a barge-in-aware voice agent plus a diarized, speaker-labeled transcript pipeline with a documented WER report.

**Next platform skill:** move on to **Realtime AI** to go deeper on the general low-latency, full-duplex, interruption-aware systems architecture that this page's turn-taking and streaming sections only introduced — it is the direct continuation of the production-systems half of Voice AI.
`,

  "official-docs": `
- **OpenAI Whisper (GitHub + model card)**: the reference open STT model and its documented architecture, languages, and usage — a good starting point for understanding STT internals hands-on.
- **W3C Speech Synthesis Markup Language (SSML) specification**: the standard markup for prosody control (breaks, emphasis, rate, pitch) referenced throughout this page's TTS sections; most commercial TTS APIs implement a subset or SSML-compatible variant.
- **WebRTC project documentation**: the standard for real-time audio/video transport in browsers, relevant to the Architecture section's media gateway layer.
- **Provider API documentation for whichever STT/TTS/S2S vendor(s) you adopt**: always treat the vendor's own current docs as the source of truth for exact request/response formats, supported sample rates, and pricing, since these details change faster than this page can track.

Note: this page deliberately avoids naming or ranking specific commercial STT/TTS/S2S providers as "the best," since this space changes quickly — verify current provider comparisons and benchmarks independently before committing to one.
`,

  books: `
- **"Speech and Language Processing" by Daniel Jurafsky and James H. Martin** — the standard academic reference covering both classical and neural speech/NLP techniques; the speech-recognition and synthesis chapters are the deepest textbook treatment available.
- **"Fundamentals of Speech Recognition" by Lawrence Rabiner and Biing-Hwang Juang** — a classic, thorough treatment of the statistical (HMM-era) foundations of ASR; valuable for understanding where the field came from before deep learning.
- **"Deep Learning" by Ian Goodfellow, Yoshua Bengio, and Aaron Courville** — not voice-specific, but the sequence-modeling and generative-modeling chapters (RNNs, attention, generative models) are the direct prerequisite background for understanding modern STT/TTS architectures.
- **"Designing Voice User Interfaces" by Cathy Pearl** — a practical, product-focused book on conversational voice UX (turn-taking, error recovery, prompt design), a useful complement to this page's systems/modeling focus.
`,

  blogs: `
- **The Hugging Face blog and model documentation for Whisper and other open speech models** — high-signal, hands-on technical writeups accompanying widely used open STT/TTS model releases.
- **Individual research labs' publication blogs (e.g. DeepMind, Google Research) covering WaveNet, Tacotron, and related TTS architecture releases** — primary-source explanations of the architectures this page summarizes, generally more rigorous than secondhand tutorials.
- **Engineering blogs from companies operating large-scale voice products** (search for recent posts from major cloud/voice-platform providers on streaming STT/TTS architecture) — practical, production-scale lessons on latency and reliability that academic papers don't cover; verify recency, since specific posts age quickly in this space.
`,

  "research-papers": `
Voice AI research spans decades; the following are foundational, real papers rather than an exhaustive current survey:

- **"Attention Is All You Need" (Vaswani et al., 2017)** — the Transformer architecture underlying Whisper-style STT and much of modern TTS; not voice-specific but the direct architectural foundation.
- **"WaveNet: A Generative Model for Raw Audio" (van den Oord et al., 2016)** — the foundational autoregressive neural vocoder paper that kicked off the modern neural-TTS era.
- **"Natural TTS Synthesis by Conditioning WaveNet on Mel Spectrogram Predictions" (Shen et al., 2017 — Tacotron 2)** — the influential end-to-end neural TTS architecture (text to spectrogram, then vocoder).
- **"Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022 — the Whisper paper)** — the paper behind OpenAI's Whisper model, directly relevant to this page's STT internals section.
- **"Sequence to Sequence Learning with Neural Networks" (Sutskever, Vinyals, Le, 2014)** — the encoder-decoder framework that both STT and TTS architectures descend from.

This topic is thinner on dedicated, widely-cited papers specifically for the newest speech-to-speech and diffusion-TTS approaches as of this writing compared to the STT/TTS foundational literature above; if researching those areas specifically, treat the foundational papers above as prerequisite reading and search current venues (Interspeech, ICASSP, NeurIPS speech workshops) for the latest peer-reviewed work rather than relying solely on this page.
`,

  videos: `
- **Andrej Karpathy's neural network and sequence-modeling lecture series** — not voice-specific, but the clearest available explanation of the autoregressive generation and attention mechanics that both STT decoding and TTS generation rely on.
- **Conference talks from Interspeech and ICASSP** (search for recent keynotes/paper presentations on streaming ASR and neural TTS) — the primary venues for current, peer-reviewed voice AI research presented directly by the researchers.
- **Vendor engineering talks on building real-time voice agents** (search recent conference talks from major voice-platform or LLM-platform engineering teams) — practical systems-design lessons on latency, barge-in, and streaming architecture that complement the academic material above.
`,

  "github-repos": `
- **openai/whisper** — the reference open-source Whisper STT model and inference code; the standard starting point for hands-on STT experimentation.
- **A faster-inference-optimized Whisper runtime** (search for actively maintained CTranslate2-based or similar optimized Whisper implementations) — demonstrates the real-time-factor optimization techniques covered in Performance.
- **webrtc/webrtc** — the reference WebRTC implementation underlying most browser-based real-time audio transport.
- **wiseman/py-webrtcvad** (or an actively maintained equivalent) — a lightweight, widely used VAD library referenced in this page's Beginner Concepts example.
- **A well-maintained open TTS toolkit repository** (search for actively maintained multi-model TTS toolkits supporting multiple architectures) — useful for comparing autoregressive, non-autoregressive, and vocoder implementations side by side.
- **An open diarization toolkit repository** (search for actively maintained speaker-diarization libraries) — reference implementation for the diarization concepts covered in Intermediate Concepts.
- **librosa/librosa** — the standard Python audio analysis library used for spectrogram extraction and general audio preprocessing throughout this page's examples.

Note: specific repository popularity and maintenance status shift quickly in this space — verify current activity/maintenance status before depending on any of the above in production.
`,

  "practice-problems": `
Ordered by skill focus, building on the coding questions above:

1. **Audio preprocessing**: write a function that loads an arbitrary-sample-rate WAV file and resamples it to 16kHz mono, handling the common pitfall of forgetting to convert stereo to mono before resampling.
2. **VAD tuning**: given a labeled dataset of audio frames marked speech/silence, sweep a VAD's aggressiveness parameter and plot precision/recall to find the best operating point for a specific noise environment.
3. **Streaming stability**: extend the "stable prefix" coding question above to handle the edge case where the STT service occasionally revises a previously stable prefix — design a strategy for gracefully correcting already-displayed text.
4. **Diarization evaluation**: given a diarization output and a ground-truth speaker-labeled transcript, implement Diarization Error Rate (DER) calculation.
5. **Latency budgeting**: given per-stage latency distributions (not just averages) for STT, LLM, and TTS, compute the expected end-to-end latency distribution for a pipeline with streaming overlap between stages, and identify the 95th-percentile bottleneck.
6. **External practice sets**: search for publicly available speech recognition benchmark datasets (e.g. LibriSpeech-style corpora) and TTS naturalness evaluation sets to practice building evaluation harnesses against real, standardized data rather than only synthetic test clips.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client
        Mic[Microphone] --> Enc[Audio Encode/Chunk]
    end

    subgraph Gateway["Media/Signaling Gateway"]
        Enc --> WS[WebRTC/WebSocket Transport]
    end

    subgraph RealtimeLayer["VAD & Turn-Taking"]
        WS --> VAD{Speech or Silence?}
        VAD -- silence --> WS
        VAD -- speech --> StateM[Conversation State Machine]
    end

    subgraph STTService["Streaming STT Service"]
        StateM --> Feat[Spectrogram Extraction]
        Feat --> AudioEnc[Audio Encoder]
        AudioEnc --> TextDec[Autoregressive Text Decoder]
        TextDec --> Partials[Partial Transcripts]
        TextDec --> Finals[Final Transcript]
    end

    subgraph Orchestration["Orchestration / LLM Layer"]
        Finals --> LLM[LLM + Tool Calling]
        LLM --> RespText[Streamed Response Text]
    end

    subgraph TTSService["Streaming TTS Service"]
        RespText --> Front[Text/Phoneme Frontend]
        Front --> Acoustic[Acoustic Model]
        Acoustic --> Vocoder[Neural Vocoder]
        Vocoder --> AudioOut[Streamed Audio Frames]
    end

    AudioOut --> WS
    WS --> Speaker[Client Speaker Output]
    StateM -.barge-in signal.-> TTSService

    Finals -.async log.-> Store[(Transcript/Audio Store)]
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Voice AI))
    STT
      Audio Preprocessing
        Sampling
        Log-mel Spectrogram
      Encoder-Decoder Models
        Whisper-style
        Cross-attention
      Streaming vs Batch
        Partial Results
        Final Results
      Robustness
        Accents
        Noise
        Multiple Speakers
    TTS
      Frontend
        Text Normalization
        Phonemes
      Acoustic Models
        Autoregressive
        Non-autoregressive
        Diffusion/Flow-matching
      Vocoders
        WaveNet-style
        Parallel GAN-style
      Prosody
        SSML
        Emphasis/Pauses
      Voice Cloning
        Speaker Embeddings
        Consent and Ethics
    Speech-to-Speech
      Single Model, No Text Hop
      Latency Advantage
      Control Tradeoff
    Systems Layer
      VAD
      Diarization
      Turn-Taking and Barge-in
      Latency Budgeting
      Streaming Transport
    Production Concerns
      Monitoring and Metrics
        WER
        RTF
        Time-to-first-audio
      Security and Ethics
        Voice Cloning Misuse
        PII Handling
      Testing
        Accent/Noise Evaluation Sets
    Related Skills
      Realtime AI
      Inference
      Transformers
      RNNs
      Streaming
~~~
`,
};

export default voiceAi;
