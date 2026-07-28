import type { CheatSheetData } from "./types";

const voiceAi: CheatSheetData = {
  title: "The Ultimate Voice AI Cheat Sheet",
  subtitle: "STT, TTS, and speech-to-speech pipelines - latency, prosody, diarization, ethics",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "STT / ASR", desc: "Speech-to-text: audio in, text out", code: "waveform -> spectrogram -> encoder -> decoder -> text" },
        { term: "TTS", desc: "Text-to-speech: text in, audio out", code: "text -> phonemes -> acoustic model -> vocoder -> waveform" },
        { term: "Speech-to-speech (S2S)", desc: "Single model, audio in and out, no text hop", code: "mic audio -> [S2S model] -> speaker audio" },
        { term: "Cascaded pipeline", desc: "STT then LLM then TTS, three separate models", code: "audio -> STT -> text -> LLM -> text -> TTS -> audio" },
        { term: "Sample rate", desc: "Samples per second; must match model expectations", code: "STT common: 16000 Hz\nTTS output: often 22050-24000 Hz" },
        { term: "Log-mel spectrogram", desc: "Time-frequency representation fed to STT models", code: "librosa.feature.melspectrogram(y, sr, n_mels=80)" },
        { term: "Autoregressive generation", desc: "Each token/frame depends on the previous one", code: "token[t] depends on token[0..t-1]\nsequential, cannot parallelize across time" },
        { term: "VAD", desc: "Voice Activity Detection: speech vs silence per frame", code: "vad.is_speech(frame_bytes, sample_rate=16000)" },
      ],
    },
    {
      title: "STT Pipeline",
      color: "blue",
      rows: [
        { term: "Batch transcription", desc: "Send full file, wait for full result", code: "model.transcribe('meeting.wav')" },
        { term: "Streaming transcription", desc: "Send chunks, get incremental partial + final results", code: "async for chunk in mic:\n    ws.send(chunk)\n# receive partial/final events" },
        { term: "Partial result", desc: "Provisional, may still change - do not act on it", code: "if event.type == 'partial': show_only()" },
        { term: "Final result", desc: "Committed segment - safe to trigger actions on", code: "if event.type == 'final': process(event.text)" },
        { term: "Word Error Rate (WER)", desc: "STT accuracy metric", code: "WER = (subs + ins + dels) / reference_words" },
        { term: "Real-time factor (RTF)", desc: "Processing time / audio duration", code: "RTF < 1 means model keeps up with live audio" },
        { term: "Encoder-decoder (Whisper-style)", desc: "Audio encoder + autoregressive text decoder", code: "encoder(spectrogram) -> hidden states\ndecoder attends via cross-attention" },
        { term: "Diarization", desc: "Who spoke when, separate from what was said", code: "[{'speaker': 'A', 'start': 0.0, 'text': '...'}]" },
      ],
    },
    {
      title: "TTS Pipeline",
      color: "emerald",
      rows: [
        { term: "Text/phoneme frontend", desc: "Normalizes text, converts to phonemes", code: "'Dr.' -> 'doctor'\n'2026' -> 'twenty twenty six'" },
        { term: "Acoustic model", desc: "Predicts mel-spectrogram from text/phonemes", code: "text_tokens -> mel_spectrogram" },
        { term: "Vocoder", desc: "Converts spectrogram to playable waveform", code: "mel_spectrogram -> raw_audio_samples" },
        { term: "Autoregressive TTS", desc: "High quality, sequential, slower", code: "frame[t] conditioned on frame[t-1]" },
        { term: "Non-autoregressive TTS", desc: "Parallel generation via duration predictor", code: "duration_predictor(phoneme) -> frame_count\nall frames predicted at once" },
        { term: "Diffusion / flow-matching TTS", desc: "Iteratively denoise toward target audio", code: "noise -> denoise_step x N -> mel_spectrogram" },
        { term: "SSML prosody control", desc: "Explicit pauses, emphasis, rate, pitch", code: "<break time='300ms'/>\n<emphasis level='strong'>word</emphasis>\n<prosody rate='95%' pitch='-2st'>text</prosody>" },
        { term: "Voice cloning", desc: "Speaker embedding conditions TTS to mimic a voice", code: "embedding = enroll(reference_audio)\ntts(text, speaker_embedding=embedding)" },
      ],
    },
    {
      title: "Real-Time Systems",
      color: "amber",
      rows: [
        { term: "Time-to-first-partial", desc: "STT responsiveness metric", code: "measure from speech-start to first partial event" },
        { term: "Time-to-first-audio", desc: "TTS/S2S perceived-latency driver", code: "measure from response-decided to first playback frame" },
        { term: "Barge-in", desc: "User interrupts system mid-speech", code: "on user_speech_detected during playback:\n    cancel_tts(); stop_playback(); listen()" },
        { term: "Turn-taking state machine", desc: "listening / thinking / speaking / interrupted", code: "state: LISTENING -> THINKING -> SPEAKING\n       -> (barge-in) -> LISTENING" },
        { term: "Debounced end-of-utterance", desc: "Sustained silence after speech signals turn end", code: "if silence_ms >= threshold_ms:\n    end_of_utterance()" },
        { term: "Streaming end-to-end", desc: "Never buffer a full stage before forwarding", code: "LLM token stream -> feed TTS per sentence\nTTS audio frames -> play as synthesized" },
        { term: "Latency budget stages", desc: "Sum with streaming overlap, not strict serial sum", code: "capture + VAD + STT-first-partial\n+ LLM-first-token + TTS-first-audio + playback" },
      ],
    },
    {
      title: "Common Mistakes & Fixes",
      color: "rose",
      rows: [
        { term: "No VAD gating", desc: "Wastes cost, risks hallucinated transcripts on noise", code: "WRONG: stream every mic frame\nRIGHT: gate through vad.is_speech() first" },
        { term: "Acting on partials", desc: "Partial text can still change - never trigger irreversible actions", code: "WRONG: charge_card(partial_text)\nRIGHT: charge_card(final_text)" },
        { term: "Buffering full response before TTS", desc: "Adds full LLM generation time to latency", code: "WRONG: audio = tts(await llm.generate(p))\nRIGHT: stream tokens into tts per sentence" },
        { term: "Ignoring diarization", desc: "Multi-speaker transcript becomes an unusable wall of text", code: "WRONG: 'hi how can I help my internet is down'\nRIGHT: [Agent] ... [Customer] ..." },
        { term: "Flat default prosody", desc: "Long-form TTS sounds robotic without explicit control", code: "add SSML breaks/emphasis for anything\nlonger than a short confirmation" },
        { term: "Cloning without consent", desc: "Ethical and often legal failure, not just technical", code: "require verified consent + disclosure\nbefore enrolling any real voice" },
        { term: "No timeout on pipeline calls", desc: "One slow stage hangs the entire conversation", code: "requests.post(url, json=body, timeout=10)" },
        { term: "Sample rate mismatch", desc: "Silently degrades accuracy or produces garbled audio", code: "resample(audio, target_sr=16000)  # before STT" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Common preprocessing lib", desc: "Load, resample, extract spectrogram features", code: "import librosa\ny, sr = librosa.load(path, sr=16000)" },
        { term: "Lightweight VAD lib", desc: "Frame-level speech/silence classification", code: "import webrtcvad\nvad = webrtcvad.Vad(mode=2)" },
        { term: "Open STT baseline", desc: "Run locally for batch transcription", code: "import whisper\nmodel = whisper.load_model('base')\nmodel.transcribe('file.wav')" },
        { term: "Streaming transport", desc: "Real-time audio in browsers/mobile", code: "WebRTC for client audio\nWebSocket for server-to-server legs" },
        { term: "Per-stage instrumentation", desc: "Log latency at every pipeline boundary", code: "log.info('stt.time_to_first_partial_ms=%d', ms)\nlog.info('tts.time_to_first_audio_ms=%d', ms)" },
        { term: "Evaluation discipline", desc: "Measure WER per accent/noise bucket, not just aggregate", code: "for bucket in ['clean', 'noisy', 'accented']:\n    assert wer(bucket) <= ceiling[bucket]" },
        { term: "Fallback pattern", desc: "Graceful degradation on provider outage/rate-limit", code: "try: primary_provider.call()\nexcept RateLimited: secondary_provider.call()" },
        { term: "Production checklist essentials", desc: "The non-negotiables before shipping", code: "VAD + streaming + barge-in + diarization\n+ prosody + timeouts + consent + PII handling" },
      ],
    },
  ],
};

export default voiceAi;
