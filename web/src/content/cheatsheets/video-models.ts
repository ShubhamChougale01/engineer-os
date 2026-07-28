import type { CheatSheetData } from "./types";

const videoModels: CheatSheetData = {
  title: "The Ultimate Video Models Cheat Sheet",
  subtitle: "Text/image-to-video generation · video understanding · frame sampling · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Video generation", desc: "Text or image in, new video out — diffusion-based, extends Image Generation", code: "Sora, Veo, Runway Gen,\nKling, Luma, Pika (verify current state)" },
        { term: "Video understanding", desc: "Existing video in, answer/summary out — extends Vision AI over sampled frames", code: "action recognition, video QA,\nsummarization" },
        { term: "Temporal consistency", desc: "Objects/physics/identity must stay coherent ACROSS frames, not just within one", code: "the defining hard problem;\nstill an active weak point" },
        { term: "Text-to-video", desc: "Generate video purely from a text prompt", code: "prompt: 'A dog running\non a beach at sunset'" },
        { term: "Image-to-video", desc: "Animate a specific starting image — better composition control", code: "anchor image + motion prompt\n-> more consistent first frame" },
        { term: "Frame sampling", desc: "Extract representative still frames since full-frame processing is too costly", code: "uniform / scene-change /\ntask-driven / hybrid" },
        { term: "Image token cost per frame", desc: "Each sampled frame costs image tokens exactly like a single image (Vision AI)", code: "N frames ~ N x\nsingle-image token cost" },
      ],
    },
    {
      title: "Frame Sampling Strategies",
      color: "blue",
      rows: [
        { term: "Uniform sampling", desc: "Fixed frame every N seconds — simple, predictable", code: "frame_indices = [i*total/n\n  for i in range(n)]" },
        { term: "Scene-change / keyframe", desc: "Sample densely where visuals change a lot", code: "diff = mean(abs(frame - prev))\nif diff > threshold: keyframe" },
        { term: "Task-driven sampling", desc: "Sample densely near a known point of interest", code: "sample near transcript\nkeyword timestamps" },
        { term: "Hybrid (production default)", desc: "Scene-change + transcript-triggered sampling combined", code: "union(scene_changes,\n      transcript_triggers)" },
        { term: "Chunking", desc: "Split long video into time-bounded windows for parallel processing", code: "chunk_seconds = 120..300\n# tune to content density" },
        { term: "Aggregation / merge pass", desc: "Combine per-chunk results into ONE coherent answer — never concatenate", code: "merge_prompt: 'Reconcile\nany overlaps/contradictions'" },
      ],
    },
    {
      title: "Combining Signals",
      color: "emerald",
      rows: [
        { term: "ASR transcript", desc: "Cheap, timestamped text signal — carries dialogue/narration meaning", code: "text tokens << image tokens\nuse it before adding more frames" },
        { term: "Timestamped frame + transcript prompt", desc: "Splice both into one multimodal message for full coverage", code: "content: [text, transcript,\n  frame@12s, frame@18s, ...]" },
        { term: "Visual-only vs audio-only content", desc: "Each channel misses what the other alone would catch", code: "visual: gesture, product shown\naudio: dialogue, alarm sound" },
        { term: "Async generation job", desc: "Submit then poll or receive a webhook — never block synchronously", code: "job_id = submit(prompt)\nwhile not done: poll(job_id)" },
        { term: "Content moderation", desc: "Check both generation input/prompt AND generated output", code: "moderate(prompt) ->\nmoderate(generated_video)" },
        { term: "Human/rubric review gate", desc: "Required before publishing generated video — consistency isn't guaranteed", code: "checklist: object identity,\nphysics plausibility, brand fit" },
      ],
    },
    {
      title: "Known Weak Points (hedge, verify per model/date)",
      color: "amber",
      rows: [
        { term: "Physics implausibility", desc: "Liquids, collisions, deformation often behave wrong across frames", code: "structural: no explicit\nworld-physics mechanism" },
        { term: "Object/character drift", desc: "Shape, clothing, identity can subtly shift across a clip", code: "worse with longer duration,\nmore interacting objects" },
        { term: "Missed brief events (understanding)", desc: "Uniform sampling can skip a fast, important moment entirely", code: "switch to scene-change/\ntask-driven sampling" },
        { term: "\"Native video\" API still samples", desc: "Even vendor video-input APIs sample frames internally at some rate", code: "you often can't fully control\nor inspect that internal rate" },
        { term: "Fast-moving leaderboard", desc: "Which model/vendor leads changes every release cycle", code: "never crown one 'best' model\nwithout a date attached" },
        { term: "Cost/latency underestimation", desc: "Video is dramatically pricier than images; easy to misbudget", code: "budget per MINUTE OF VIDEO,\nnot per API call" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "rose",
      rows: [
        { term: "Shipping generated video with no review", desc: "Physics/consistency errors reach users unreviewed", code: "WRONG: publish(generate())\nRIGHT: publish(review(generate()))" },
        { term: "Naive uniform sampling for rare events", desc: "Security/compliance footage can miss the one moment that matters", code: "use task-driven or\nscene-change sampling instead" },
        { term: "Ignoring the audio channel", desc: "Visual-only sampling misses dialogue/narration entirely", code: "always pair frames\nwith an ASR transcript" },
        { term: "Treating generation as synchronous", desc: "Blocking a request thread on a multi-minute job causes timeouts", code: "always async: submit,\npoll or webhook, retrieve" },
        { term: "Concatenating chunk summaries", desc: "Produces disjointed or self-contradictory final output", code: "run a real aggregation\nLLM call, not string join" },
        { term: "Budgeting with image-call intuition", desc: "Video cost scales with frame count x chunk count x duration", code: "estimate using realistic\nvideo length & volume" },
        { term: "Assuming a demo reel = production quality", desc: "Cherry-picked demos overstate consistency reliability", code: "build a golden set of\nreal, hard, varied videos" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "OpenCV (cv2)", desc: "Frame extraction, scene-change diffing, video I/O", code: "cap = cv2.VideoCapture(path)\ncap.set(CAP_PROP_POS_FRAMES, i)" },
        { term: "ffmpeg", desc: "Chunking, transcoding, audio-track extraction", code: "ffmpeg -i in.mp4 -ss 0 -t 120\n  chunk1.mp4" },
        { term: "Cost-per-minute-of-video metric", desc: "Normalizes cost/latency across videos of different lengths", code: "tokens_per_min = tokens\n  / video_minutes" },
        { term: "Job queue (durable)", desc: "Required for multi-minute async generation jobs", code: "submit -> queue -> worker\n-> webhook/poll -> store" },
        { term: "Caching key", desc: "Avoid re-processing identical video content", code: "key = hash(video_bytes)\n + sampling_version + model_version" },
        { term: "Monitoring signals", desc: "Track beyond RED: tokens/min, hedge rate, regeneration rate, input drift", code: "Histogram('tokens_per_min')\nCounter('regeneration_total')" },
        { term: "Composition rule", desc: "Precision-critical event detection -> purpose-built model; open-ended -> VLM", code: "sports/safety events -> dedicated\nsummary/QA -> frame-sampled VLM" },
      ],
    },
  ],
};

export default videoModels;
