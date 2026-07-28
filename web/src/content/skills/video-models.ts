import type { SkillContent } from "../types";

/**
 * Video Models — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const videoModels: SkillContent = {
  overview: `
Video Models, as this page uses the term, covers the two directions of AI systems that work with moving images: **video generation** (producing new video from a text prompt, a starting image, or both — text-to-video and image-to-video diffusion models) and **video understanding** (having a model watch and reason about existing video — action recognition, video question answering, and summarization). These are related but genuinely distinct problems that happen to share one hard constraint neither image-only systems ever had to face: the **temporal dimension**. A generated video is not just one good frame — it is dozens of frames that must remain consistent with each other in a way that respects physics, object permanence, and motion, and an understood video is not just one representative frame — it is a sequence a model must sample from intelligently because almost no production system can afford to feed every single frame into a language model.

For an AI engineer, the practical significance of this page is twofold. On the generation side, text-to-video and image-to-video models (Runway's Gen family, OpenAI's Sora, Google's Veo, Kling, Luma's Dream Machine, Pika, and a fast-moving set of others) have gone from research curiosities producing a few seconds of blurry motion to tools that can produce increasingly convincing short clips — but this is one of the fastest-moving corners of AI in 2025 to 2026, and any specific claim about "the best model" or "solved" limitations should be treated as perishable. On the understanding side, feeding video into a multimodal LLM (building on the **Vision AI** skill's foundation of image-token encoding) means solving a sampling problem: which frames, at what density, combined with what other signal (audio transcript, scene metadata) actually let a model answer a real question about a video that might be minutes or hours long.

Key characteristics worth internalizing up front: **temporal consistency is the problem that defines this whole field**, on both the generation and understanding sides. A generation model must keep an object's shape, a character's identity, and the rules of physics stable across every frame it produces — and this remains an active, only partially solved weak point even in leading models, visible as objects that subtly warp, physically implausible motion, or fingers and text that fall apart on close inspection. An understanding model must extract meaning from a sequence without literally attending to every frame, because the compute cost of doing so is often prohibitive — so frame sampling strategy is not an implementation detail, it is the central design decision. This page treats classic single-frame image generation and image understanding as prerequisites covered by the sibling **Image Generation** and **Vision AI** skills, and focuses specifically on what changes when time enters the picture.
`,

  history: `
Video models inherited two separate lineages — generative modeling and video understanding — that only converged into today's practical toolset recently, and the pace of change since 2022 has been unusually fast even by AI standards.

| Year | Milestone |
|------|-----------|
| 2014–2017 | Early video understanding models pair CNNs (per-frame feature extraction, see the **CNNs** skill) with recurrent networks (RNN/LSTM) or 3D convolutions to model motion across frames — action recognition on benchmarks like UCF-101 and Kinetics becomes the dominant research problem. |
| 2017 | The Transformer architecture (see the **Transformers** skill) is introduced for language; video researchers begin adapting attention mechanisms to spatiotemporal data over the following years. |
| 2020–2021 | Video Transformer architectures (e.g. TimeSformer, ViViT) demonstrate that attention-based models, treating video as a sequence of spacetime patches, can match or beat 3D-convolution approaches for action recognition and classification. |
| 2021–2022 | Diffusion models prove highly effective for image generation (see the **Image Generation** skill); researchers begin extending the same denoising process across a temporal dimension, generating short low-resolution video clips as an early proof of concept (e.g. early text-to-video research systems). |
| 2022 | Make-A-Video (Meta) and Imagen Video (Google) demonstrate text-to-video generation from large-scale models, producing short clips with recognizable but still visibly inconsistent motion and structure — establishing that the image-diffusion recipe could be extended to video, at real but early quality. |
| 2023 | Runway's Gen-2 and Pika Labs bring text-to-video and image-to-video generation to broadly accessible commercial products for the first time, and video quality improves rapidly quarter over quarter. Multimodal LLMs with native video-frame understanding (Gemini 1.5's long-context video support, GPT-4o's multimodal input) begin treating video as a first-class input type rather than an image-model workaround. |
| 2024 | OpenAI's Sora demonstrates markedly improved temporal consistency and duration for generated video, and Google's Veo, Kling (Kuaishou), and Luma's Dream Machine all ship or preview competing systems — this becomes a genuinely multi-player commercial race rather than one lab's research demo. |
| 2025 and into 2026 | Video generation quality, duration, and controllability continue to improve quickly across multiple vendors, and video understanding context windows (how much video a model can natively process) keep expanding. Exactly which model leads on which axis (realism, physics correctness, duration, cost, controllability) changes with each release cycle — this page deliberately avoids crowning a single "best" model, because any such claim would likely be stale within months. Verify current state against each vendor's latest release notes and independent benchmarks rather than trusting a fixed ranking. |

The throughline: video generation followed image generation's diffusion recipe with a temporal extension bolted on, and video understanding followed image understanding's token-based multimodal recipe with a frame-sampling strategy bolted on — in both cases, the "bolt-on" (handling time) turned out to be the genuinely hard, still-unsolved part of the problem, not an afterthought.
`,

  "why-it-exists": `
Before dedicated video models, there was no way to produce a novel video clip except by filming it, animating it by hand, or stitching together stock footage — and there was no scalable way to have a machine "watch" a video and answer an open-ended question about it, only narrow classifiers trained for one specific task (e.g. "is there a person in this frame," "classify this action into one of 400 categories").

Video generation exists to close the first gap the same way image generation closed it for still images: turning a text description (or a starting image, for image-to-video) into new visual content without a camera, a set, actors, or manual animation. This matters commercially for advertising, previsualization, game asset prototyping, and content creation broadly — the same economic pressure that drove demand for text-to-image generation, extended to moving content.

Video understanding exists to close the second gap: giving a single flexible model the ability to answer arbitrary natural-language questions about video content — "what happened right before the person fell," "summarize this hour of security footage," "does this cooking video ever add salt" — instead of requiring a bespoke classifier trained in advance for every possible question. This mirrors exactly why Vision AI (multimodal LLMs for images) replaced narrow image classifiers for many product use cases: open-ended natural-language reasoning over perceptual content is far more flexible than a fixed taxonomy of outputs, at the cost of less precision and (for video specifically) a much higher compute bill per unit of content analyzed.

The reason both problems remained hard well after their image-only counterparts were largely solved is temporal consistency: an image model only has to get one frame internally coherent, while a video model has to get every frame coherent both individually AND in relation to its neighbors — object identity, physics, lighting, and motion all have to hold across time, which is a fundamentally larger and less-constrained problem than single-frame coherence.
`,

  "problem-it-solves": `
Video models solve concrete problems that neither still-image models nor pre-video-era classifiers could address, and it is equally important to be explicit about what they deliberately do not yet solve.

**1. Producing novel video content without filming it.** Text-to-video and image-to-video generation let a team produce a short clip — a product shot, a stylized b-roll segment, a storyboard previsualization — from a prompt or a still image, collapsing what used to require a camera, actors, and editing into a generation call plus iteration. This is genuinely useful today for previsualization, rough drafts, and stylized/abstract content where perfect realism is not the bar.

**2. Answering open-ended questions about existing video without a bespoke classifier.** Video question answering and summarization let a product ask "what is this video about," "at what point does X happen," or "does this meet our content policy" without training a narrow model for each specific question — the same flexibility unlock that Vision AI provides for images, extended to a temporal signal.

**3. Making very long video tractable to process at all.** Frame sampling and chunking strategies (see Beginner and Intermediate Concepts) let a system process an hour of footage using a bounded, affordable number of model calls, rather than requiring impossibly expensive frame-by-frame analysis of every single frame.

What Video Models deliberately do **not** solve yet, stated plainly rather than discovered after a costly production mistake: generated video does not reliably respect physics or maintain perfect object/character consistency across a long clip — this remains an active, only partially solved research problem even in the strongest models available at this page's knowledge cutoff, and it should be assumed to still be a live weak point when you read this, not something to verify has been "fixed" by checking a single demo reel. Video understanding does not give a model the ability to notice every frame-level detail unless the sampling strategy specifically surfaces it — a model asked about a fast, brief event that fell between two sampled frames may simply never have "seen" it, and will not always warn you that it might have missed something. Neither direction is a substitute for purpose-built systems where guarantees matter: a video generation model is not a simulation engine, and a video understanding model is not a substitute for exhaustive human review where compliance or safety genuinely require frame-perfect coverage.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain why temporal consistency is structurally harder for a generative model than single-frame coherence, and describe how diffusion-based video generation attempts to address it.
2. Distinguish text-to-video, image-to-video, and video-to-video generation, and pick the right one for a given creative or product requirement.
3. Explain the difference between action recognition and video question answering as understanding tasks, and know which one a given product requirement actually needs.
4. Design a frame-sampling strategy (uniform, scene-change/keyframe, task-driven) appropriate to a specific video-understanding use case, and articulate the tradeoffs of each.
5. Estimate why video workloads cost dramatically more than equivalent image workloads, for both generation and understanding, and reason about that cost before committing to an architecture.
6. Build a practical pipeline that chunks long video, extracts keyframes at scene boundaries, combines them with an ASR transcript, and feeds the combination to a multimodal LLM for summarization or QA.
7. Identify the common pitfalls specific to video workloads: assuming generated video respects physics, naive uniform sampling that misses key moments, and underestimating latency/cost at production scale.
8. Compare the current landscape of video generation and understanding providers honestly, without overclaiming which one is "best," while hedging appropriately given how fast this space moves.
9. Apply production engineering practices (chunking strategy, async processing, cost monitoring, content moderation) specific to a video-workload API surface.
10. Describe where this field is heading and what capabilities are worth betting career time on versus treating as still-unproven.
`,

  prerequisites: `
- **Required**: the **Vision AI** skill, in full — this page assumes you already understand how a still image becomes tokens a multimodal LLM can reason over, resolution/tiling cost tradeoffs, and VQA-style prompting; video understanding is that same foundation extended across a sequence of sampled frames, and this page does not re-derive it.
- **Required**: the **Image Generation** skill, for the diffusion-model fundamentals (denoising process, latent space, conditioning on text) that video generation extends across a temporal dimension.
- **Helpful**: the **CNNs** and **Transformers** skills, for background on how spatial features (CNNs, Vision Transformers) and attention over sequences (Transformers) each contribute to modern video architectures.
- **Helpful**: basic familiarity with audio transcription (ASR / speech-to-text), since production video-understanding pipelines almost always combine visual frame sampling with a transcript — see Production Usage and the worked example in Coding Questions.
- **Not required but related**: the **Cost Optimization** and **Latency** skills, since video workloads make cost and latency problems that are merely inconvenient for text or images into first-order architectural constraints you cannot ignore.
`,

  "beginner-concepts": `
### Two different problems that share one name

"Video Models" bundles together two directions that beginners frequently conflate:

- **Video generation**: text (or an image) goes in, a new video comes out. The model is creating pixels that never existed.
- **Video understanding**: an existing video goes in, a label, answer, or summary comes out. The model is interpreting pixels that already existed.

These use different architectures, different APIs, different cost structures, and fail in different ways — a generation model failure looks like a physically implausible clip; an understanding model failure looks like a wrong or incomplete answer about real footage. Keep them mentally separate even though this page covers both.

### What makes video different from a pile of images (the core idea)

A video is not conceptually different from a sequence of images — it literally is one, typically 24 to 60 individual frames per second. The problem that makes video models a distinct field, rather than "just run an image model many times," is **temporal consistency**: each frame must remain coherent with its neighbors. If you generated every frame of a video independently with an image model, you would get a slideshow of unrelated images with the same rough subject — not a video, because nothing would move smoothly, objects would flicker and change shape, and lighting would jump around randomly frame to frame. Solving "make consecutive frames agree with each other" — while still allowing things to actually move, which is the entire point of video — is the hard problem this whole page is organized around.

### Your first text-to-video generation call

Video generation APIs follow a similar submit-then-poll shape across vendors, because generation takes materially longer than an image call (often tens of seconds to minutes rather than sub-second-to-a-few-seconds):

~~~python
import time
import requests

API_KEY = "your-api-key"  # load from a secrets manager in real code, never hardcode
BASE_URL = "https://api.example-video-vendor.com/v1"  # illustrative; consult your chosen vendor's actual docs

def generate_video(prompt: str, duration_seconds: int = 4) -> str:
    """Submit a text-to-video generation job and return its job id.
    Video generation is asynchronous almost everywhere because it is
    computationally heavy relative to a text or single-image call."""
    response = requests.post(
        f"{BASE_URL}/generations",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"prompt": prompt, "duration_seconds": duration_seconds},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["job_id"]

def poll_until_done(job_id: str, max_wait_seconds: int = 300) -> str:
    """Poll for completion, since generation is not synchronous.
    Always cap total wait time — a stuck or slow job should not hang a caller forever."""
    start = time.time()
    while time.time() - start < max_wait_seconds:
        status = requests.get(f"{BASE_URL}/generations/{job_id}", timeout=30).json()
        if status["state"] == "completed":
            return status["video_url"]
        if status["state"] == "failed":
            raise RuntimeError(f"Generation job {job_id} failed: {status.get('error')}")
        time.sleep(5)
    raise TimeoutError(f"Generation job {job_id} did not complete within {max_wait_seconds}s")

job_id = generate_video("A golden retriever running along a beach at sunset, cinematic")
video_url = poll_until_done(job_id)
print(video_url)
~~~

Note the shape: submit a job, get an id back immediately, then poll (or, on some vendors, receive a webhook callback) until the job finishes. This async pattern is close to universal for video generation because synchronous request-response does not fit a job that can take minutes.

### Your first video-understanding call: sampling frames

Because almost no multimodal LLM API accepts a raw video file the way it accepts an image, the most common pattern (absent a vendor-specific native video API) is to extract still frames yourself and send them as a set of images, exactly as covered in the **Vision AI** skill's multi-image pattern:

~~~python
import cv2  # OpenCV, a standard library for video frame extraction
import base64

def extract_uniform_frames(video_path: str, num_frames: int = 8) -> list[str]:
    """Extract num_frames evenly spaced frames from a video and return them
    as base64-encoded JPEGs, ready to send to a multimodal LLM as image blocks."""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        cap.release()
        raise ValueError(f"Could not read any frames from {video_path}")

    frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]
    encoded_frames = []
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        success, frame = cap.read()
        if not success:
            continue
        _, buffer = cv2.imencode(".jpg", frame)
        encoded_frames.append(base64.b64encode(buffer).decode("utf-8"))
    cap.release()
    return encoded_frames
~~~

This is **uniform sampling** — simple, predictable, and the right starting point, but it has a real weakness covered in Intermediate Concepts and Common Mistakes: it can miss a brief but important event that falls between two sampled frames.
`,

  "intermediate-concepts": `
### Frame sampling strategies, compared

Uniform sampling from Beginner Concepts is the baseline, but production systems usually need something smarter once the video is long or the important content is unevenly distributed in time:

- **Uniform sampling** (one frame every N seconds, or a fixed count evenly spaced): simple, deterministic, cheap to reason about. Weakness: wastes budget on static stretches and can entirely miss a fast, important event that falls between two sampled frames.
- **Scene-change / keyframe sampling**: detect where the visual content changes significantly (a cut, a new shot, a large pixel-difference between consecutive frames) and sample more densely there, less densely during a static shot. Better content coverage per frame spent, at the cost of an extra preprocessing step and a threshold to tune.
- **Task-driven sampling**: sample densely around a known point of interest — for example, frames surrounding a timestamp flagged by an audio transcript ("frames within 2 seconds of the word 'accident' in the transcript") or a motion-detection spike. Highest precision for a known use case, least general-purpose.
- **Hybrid (the common production pattern)**: scene-change sampling for broad coverage, combined with a transcript-driven pass to guarantee frames exist near any moment the audio explicitly calls out — this is the pattern used in the worked example in Coding Questions.

### Scene-change detection, concretely

~~~python
import cv2
import numpy as np

def detect_scene_changes(video_path: str, threshold: float = 30.0) -> list[int]:
    """Return frame indices where the visual content changes significantly,
    using mean absolute pixel difference between consecutive frames as a
    cheap, dependency-light proxy for a scene cut or major visual change.
    A production system might swap this for a dedicated shot-boundary
    detection library, but this illustrates the underlying idea."""
    cap = cv2.VideoCapture(video_path)
    scene_change_indices = []
    prev_frame = None
    idx = 0
    while True:
        success, frame = cap.read()
        if not success:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if prev_frame is not None:
            diff = np.mean(cv2.absdiff(gray, prev_frame))
            if diff > threshold:
                scene_change_indices.append(idx)
        prev_frame = gray
        idx += 1
    cap.release()
    return scene_change_indices
~~~

### Chunking long video

Most multimodal LLM APIs have a hard limit on how many images (or how much video) a single request can contain, and even where a large context window exists, cost scales with what you send. For anything beyond a few minutes, chunk the video into segments (e.g. 2 to 5 minute windows), process each chunk independently (sampling frames plus its transcript slice), and then combine per-chunk summaries with a final aggregation pass — the same map-reduce pattern used for long-document summarization with text LLMs, applied to time instead of token count.

### Combining visual frames with ASR transcripts

Visual frame sampling alone misses everything conveyed through speech or sound (dialogue, narration, an alarm going off) and a transcript alone misses everything purely visual (a gesture, a product on screen, a chart shown without being described aloud). Production video understanding almost always combines both signals:

~~~python
def build_understanding_prompt(frames_with_timestamps: list[tuple[float, str]], transcript: str) -> list[dict]:
    """Combine timestamped keyframes and a transcript into one multimodal
    prompt, so the model can reason using both what was said and what
    was shown, and can correlate the two by approximate time."""
    content = [{"type": "text", "text": (
        "You are given a transcript and a series of timestamped video frames. "
        "Use both to answer questions about the full video, and note when "
        "something is only evident from the visuals or only from the audio.\\n\\n"
        f"Transcript:\\n{transcript}"
    )}]
    for timestamp, frame_b64 in frames_with_timestamps:
        content.append({"type": "text", "text": f"[Frame at {timestamp:.1f}s]"})
        content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{frame_b64}"}})
    return content
~~~

### Image-to-video: using generation to extend a still image

A large share of practical video generation today is image-to-video rather than pure text-to-video: start from a specific still image (a product photo, a piece of concept art, a selected frame) and have the model animate it, which gives far more control over the exact starting composition than a text prompt alone can guarantee.

~~~python
def generate_from_image(image_path: str, motion_prompt: str) -> str:
    """Submit an image-to-video job: the still image anchors composition
    and identity, and the prompt guides the motion applied to it."""
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    response = requests.post(
        f"{BASE_URL}/image-to-video",
        headers={"Authorization": f"Bearer {API_KEY}"},
        files={"image": image_bytes},
        data={"motion_prompt": motion_prompt},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["job_id"]
~~~

Image-to-video generally produces more temporally consistent results than pure text-to-video for the FIRST frame's content, because the model does not have to hallucinate the starting composition — it only has to animate forward from a fixed, known anchor. It does not solve consistency for everything AFTER the first frame; drift, warping, and physics errors can still accumulate as the clip progresses.
`,

  "advanced-concepts": `
### Why diffusion-based video generation is hard: extending denoising across time (hedged)

Image diffusion models (see the **Image Generation** skill) work by learning to reverse a noise-adding process: start from pure noise and iteratively denoise toward a coherent image, conditioned on a text prompt. Extending this to video means the model must jointly denoise a whole sequence of frames such that each is individually coherent AND consistent with its neighbors — commonly approached (in publicly documented research directions, though closed-lab production architectures are not fully public) via architectures that add a temporal attention or temporal convolution dimension on top of a spatial diffusion backbone, so the model can attend across frames as well as across pixels within a frame. Treat this as a well-documented conceptual direction rather than a claim about exactly how any specific current commercial model (Sora, Veo, Kling, Runway's latest, or others) is built internally — vendors do not fully disclose architecture details, and this page's knowledge cutoff means any specific technical claim about a current frontier video model should be verified against that vendor's own technical reports where available.

The structural reason this remains hard: a text-to-image model only has to satisfy constraints within one frame (this is genuinely one still, coherent scene). A text-to-video model has to satisfy the same per-frame constraints for every frame, PLUS a much larger set of cross-frame constraints (object permanence, consistent lighting, plausible physics, consistent character identity and clothing) that have no simple analogue on the image side and are much less directly supervised by typical training data and objectives. This is why "temporal consistency" recurs throughout this page as the defining unsolved problem rather than one weakness among many — it is the axis along which video generation quality is most visibly still behind image generation quality, and it should be assumed to remain a live, only partially mitigated weak point rather than something to check off as "solved" based on any single vendor's demo reel.

### Physics and object permanence as the visible symptom

The practical, visible symptom of imperfect temporal consistency is generated video that looks locally plausible frame-by-frame but is subtly or overtly wrong when watched as motion: an object that changes shape slightly as it moves, a hand that gains or loses a finger between frames, liquid that does not behave like liquid, a character's clothing pattern that shifts, or a background element that flickers in and out. These are not edge-case bugs to be patched away with a better prompt — they are the direct, expected consequence of a model that has learned strong frame-level visual priors without a fully robust world model of physical causality. Longer clips and more complex scenes with multiple interacting objects make this measurably worse, which is why generated clip lengths have grown gradually (a few seconds, then longer) rather than jumping straight to arbitrary-length coherent video — consistency degrades as duration and scene complexity increase, and every vendor's stated maximum reliable duration should be treated as an upper bound to test, not a guarantee.

### The compute cost gap between video and images, quantified conceptually

Both video generation and video understanding cost dramatically more than their image-only equivalents, and understanding why clarifies where the money actually goes:

- **Generation**: a single video "frame" of comparable resolution to a generated image is roughly as expensive to produce as that image — and a short clip contains dozens to hundreds of frames that must ALSO be jointly denoised with temporal consistency constraints, which is more expensive per frame than independent per-frame generation would be even before counting the sheer frame multiplication. A 4-second clip at 24 frames per second is on the order of 100 frames' worth of coupled generation work, not "one image's worth."
- **Understanding**: every sampled frame sent to a multimodal LLM costs image tokens exactly as in the **Vision AI** skill's resolution/tiling model — so an 8-frame sample of a video costs roughly 8x a single-image call, and a naively frame-dense sampling strategy (e.g. one frame per second of a 10-minute video, 600 frames) can be enormous before you have even added a transcript. This is why frame sampling strategy (Intermediate Concepts) is a cost decision as much as a quality decision.

### Decision table: which sampling and chunking approach for which use case

| Use case | Sampling strategy | Chunking | Why |
|----------|-------------------|----------|-----|
| Short clip (under 1 min), general summary | Uniform, 5–10 frames | None needed | Content is short enough that even coarse sampling usually captures the gist |
| Long lecture/meeting video, need summary + Q&A | Scene-change + transcript-driven | Yes, by time window | Coverage matters more than density in any one section; ASR carries most of the meaning |
| Security/compliance footage, need to catch rare events | Motion-triggered or anomaly-triggered dense sampling | Yes, event-centered | Uniform sampling can miss the exact rare event the whole system exists to catch |
| Sports/action recognition | Denser uniform sampling or a dedicated action-recognition model | Per-clip/per-play | Fast motion needs higher temporal resolution than a VLM-frame-sampling approach typically provides economically |

### Video-native versus frame-sampling understanding models

Some systems (increasingly, frontier multimodal LLMs with long native video context) are moving toward accepting video more natively rather than requiring the caller to pre-extract frames — but even where a vendor's API accepts a video file directly, it is virtually always still sampling frames (at some rate and strategy chosen by the vendor, not fully disclosed) under the hood, because processing literally every pixel of every frame at full resolution remains prohibitively expensive for any current architecture. Understanding your OWN sampling strategy remains valuable even when using a "native video" API, both because you often cannot fully control or inspect the vendor's internal sampling choice, and because pre-processing (chunking, keyframe extraction) still helps manage cost and context-window limits on your side.
`,

  "internal-working": `
Here is what happens, step by step, for each direction — generation and understanding — since they are architecturally distinct pipelines that happen to share this page.

### Video generation pipeline (diffusion-based, one documented approach)

~~~mermaid
flowchart LR
    A["Text prompt\n(and/or starting image)"] --> B["Text encoder:\nembed the prompt"]
    B --> C["Initialize noisy\nlatent frame sequence"]
    C --> D["Denoising loop:\nspatial + temporal\nattention across frames"]
    D --> E{"More denoising\nsteps needed?"}
    E -->|yes| D
    E -->|no| F["Decode latents\nto pixel-space frames"]
    F --> G["Assemble frames\ninto a video file"]
    G --> H["Return video\nto caller"]
~~~

1. **Prompt/image encoding**: the text prompt is embedded (and, for image-to-video, the starting image is encoded) to condition the generation process, following the same conditioning principle as text-to-image diffusion (see the **Image Generation** skill).
2. **Latent sequence initialization**: instead of a single noisy latent (as in image diffusion), the model initializes a SEQUENCE of noisy latents, one per frame (or per group of frames, depending on architecture), representing the video's evolution over time.
3. **Joint spatiotemporal denoising**: across many iterative steps, the model predicts and removes noise from the frame sequence, using attention or convolution mechanisms that operate BOTH within each frame (spatial) and across frames (temporal) — this joint step is what tries to keep an object consistent from frame to frame rather than merely plausible within any one frame.
4. **Decoding to pixel space**: the denoised latent sequence is decoded (often through a learned decoder, mirroring the encoder-decoder structure common in latent diffusion) into actual pixel frames.
5. **Assembly**: frames are assembled into a playable video file at the target frame rate, and post-processing (upscaling, interpolation for smoother motion) may be applied depending on the vendor's pipeline.

### Video understanding pipeline (frame-sampling based, the common pattern)

~~~mermaid
flowchart LR
    A["Raw video file"] --> B["Extract audio\n-> ASR transcript"]
    A --> C["Frame sampling:\nuniform / scene-change /\ntask-driven"]
    C --> D["Selected keyframes\n+ timestamps"]
    B --> E["Combine transcript\n+ timestamped frames\ninto one prompt"]
    D --> E
    E --> F["Multimodal LLM:\nimage tokens + text tokens,\nself-attention over both"]
    F --> G["Text/structured\nresponse"]
~~~

1. **Audio extraction and transcription**: the video's audio track is extracted and run through an ASR system to produce a timestamped transcript — this is frequently the single richest, cheapest-per-informative-unit signal available, since text tokens cost far less than image tokens.
2. **Frame sampling**: a subset of frames is selected according to the chosen strategy (see Intermediate Concepts), each retaining an approximate timestamp so it can be correlated with the transcript.
3. **Prompt assembly**: the transcript and the sampled, timestamped frames are combined into one multimodal prompt (exactly the pattern from the worked example in Intermediate Concepts), giving the model both what was said and what was shown.
4. **Multimodal reasoning**: the underlying model processes this exactly as described in the **Vision AI** skill's Internal Working section — image tokens and text tokens spliced into one sequence, with self-attention over all of it jointly — there is no separate "video-specific" reasoning step once the frames are in token form; from the model's point of view it is answering a question over a set of images plus text, and does not inherently know it is "watching a video" rather than being shown several unrelated photos, unless the prompt or timestamps make that structure explicit.
5. **Response generation**: the model produces its answer autoregressively, exactly as for any multimodal LLM call.

The critical mental model to take from both diagrams: generation's hard problem is enforcing consistency ACROSS frames during creation, while understanding's hard problem is choosing WHICH frames to even show the model in the first place — they are inverse problems, but both are fundamentally about how to handle a long, information-dense time axis under real compute constraints.
`,

  architecture: `
### Recap and framing

The model-internal pipelines are covered in Internal Working. At the system level, most of the real engineering effort in a production video-model feature goes into the layers wrapped around the model call: preprocessing (chunking, sampling, transcription) for understanding, and job orchestration (async submission, polling, storage) for generation.

### Application architecture — a production video-understanding service

~~~text
video-understanding-service/
├── pyproject.toml
├── src/video_understanding/
│   ├── api/                       # FastAPI routes: /analyze, /jobs/{id}, /health
│   ├── ingestion/
│   │   ├── validate.py            # file type, duration, size limits
│   │   └── chunk.py               # split long video into time-bounded segments
│   ├── audio/
│   │   └── transcribe.py          # ASR call, timestamped transcript output
│   ├── sampling/
│   │   ├── uniform.py
│   │   ├── scene_change.py
│   │   └── task_driven.py         # e.g. transcript-keyword-triggered sampling
│   ├── vlm/
│   │   ├── client.py              # wraps the multimodal LLM SDK: retries, timeouts
│   │   ├── prompts.py             # versioned prompt templates (see Prompt Engineering skill)
│   │   └── parse.py               # structured-output parsing + validation
│   ├── aggregation/
│   │   └── merge_chunks.py        # map-reduce: per-chunk summaries -> final answer
│   ├── evaluation/                 # golden video set, expected answers, regression harness
│   └── core/                       # config, logging, cost tracking
└── tests/
~~~

### Application architecture — a production video-generation service

~~~text
video-generation-service/
├── src/video_generation/
│   ├── api/                       # POST /generate (async job), GET /jobs/{id}
│   ├── jobs/
│   │   ├── submit.py               # submit to the vendor's generation API
│   │   ├── poll_or_webhook.py      # poll for completion or receive a webhook callback
│   │   └── store.py                # persist the resulting video to object storage
│   ├── moderation/
│   │   └── content_check.py        # pre-submission prompt moderation, post-generation review
│   └── core/                        # config, cost tracking, vendor fallback
└── tests/
~~~

### Reference production architecture (understanding pipeline)

~~~mermaid
flowchart TB
    Client["Client app\n(uploads video / provides URL)"] --> Gateway["API gateway:\nauth, rate limit,\nfile validation"]
    Gateway --> Chunk["Chunk into\ntime-bounded segments"]
    Chunk --> ASR["ASR: timestamped\ntranscript per segment"]
    Chunk --> Sample["Frame sampling per segment:\nscene-change + task-driven"]
    ASR --> Combine["Combine transcript\n+ keyframes per segment"]
    Sample --> Combine
    Combine --> VLM["Multimodal LLM call\nper segment"]
    VLM --> Aggregate["Map-reduce:\nmerge per-segment results\ninto final answer"]
    Aggregate --> Response["Response to client"]
    VLM -.cost & latency.-> Monitor["Monitoring:\nimage+text tokens,\nlatency, cost per minute of video"]
~~~
`,

  "data-flow": `
Tracing one video-understanding request end to end, chunked and sampled, matches the architecture above:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as API gateway
    participant Chunk as Chunking
    participant ASR as ASR service
    participant Sampler as Frame sampler
    participant VLM as Multimodal LLM API
    participant Agg as Aggregator

    Client->>API: POST /analyze (video file/URL, question)
    API->>API: validate file type/duration/size, auth, rate limit
    API->>Chunk: raw video
    Chunk->>Chunk: split into N time-bounded segments
    par per segment
        Chunk->>ASR: segment audio
        ASR-->>Chunk: timestamped transcript slice
        Chunk->>Sampler: segment frames
        Sampler-->>Chunk: selected keyframes + timestamps
    end
    Chunk->>VLM: transcript + keyframes per segment + question
    VLM-->>Agg: per-segment answer/summary
    Agg->>Agg: merge into one coherent final answer
    Agg-->>Client: final response
    Agg-->>API: log tokens used (image+text), latency, cost per segment
~~~

Tracing one video-generation request end to end:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as API gateway
    participant Mod as Moderation
    participant Vendor as Generation vendor API
    participant Store as Object storage

    Client->>API: POST /generate (prompt, optional image, duration)
    API->>Mod: pre-submission content check
    Mod-->>API: approved / rejected
    API->>Vendor: submit generation job
    Vendor-->>API: job_id (async)
    loop poll or webhook
        API->>Vendor: GET /jobs/{id}
        Vendor-->>API: state: queued/running/completed/failed
    end
    Vendor-->>API: completed video URL
    API->>Store: persist video (own storage, not just vendor URL)
    Store-->>Client: final video URL + metadata
~~~

Two details matter operationally on the understanding side: chunking and sampling can run in parallel per segment (materially reducing wall-clock latency for long videos), and the aggregation step is not optional — a naive concatenation of per-segment summaries reads poorly and can contradict itself across segment boundaries, so the merge step should itself be a model call that resolves overlaps and produces one coherent answer.
`,

  "production-usage": `
### Tooling and integration patterns

Video generation and understanding both build on tooling you likely already use elsewhere: OpenCV or ffmpeg for frame extraction and chunking, a standard ASR API (or a self-hosted model) for transcription, and the same multimodal LLM SDKs covered in the **Vision AI** skill for the actual reasoning call. There is rarely a distinct "video SDK" separate from these building blocks, except for the generation-specific vendor APIs themselves (Runway, Sora, Veo, Kling, Luma, Pika, and others — verify current API shapes against each vendor's own docs, since this is a fast-changing surface).

~~~bash
uv add opencv-python-headless ffmpeg-python openai
uv add --dev pytest
# Example: run an evaluation harness against a fixed golden video set before shipping a sampling-strategy change
uv run python -m video_understanding.evaluation.run_eval --dataset golden_videos/
~~~

### Config and operational defaults

- **Chunk length**: pick a chunk size (commonly 2 to 5 minutes) that balances parallelism (shorter chunks parallelize better) against context coherence (longer chunks need less cross-chunk aggregation) — tune against your actual video length distribution, not a single assumed value.
- **Sampling density per chunk**: define an explicit policy per use case (see the decision table in Advanced Concepts) rather than a single fixed frame count applied everywhere.
- **ASR provider and language coverage**: confirm your chosen ASR system's language and accent coverage matches your actual content — a transcript with high error rates silently degrades the whole downstream pipeline's answer quality.
- **Async job handling for generation**: always treat generation as asynchronous — submit, then poll with backoff or receive a webhook, never block a request thread waiting synchronously for a multi-minute job.
- **Timeouts and retries**: both directions need generous timeouts (generation jobs can run minutes; long-video understanding pipelines run many chained calls) plus retry logic with backoff for transient failures, exactly as for any external API dependency — see the **Latency** skill for general timeout-budgeting practice.
- **Storage**: persist generated videos and extracted keyframes to your own object storage rather than relying solely on a vendor-hosted URL that may expire.
`,

  "industry-examples": `
- **Runway**: one of the earliest companies to bring text-to-video and image-to-video generation to a broad commercial audience (the Gen model family), used heavily in advertising, music video production, and film previsualization workflows.
- **Adobe (Firefly video features) and other creative-suite vendors**: integrate video generation and editing assistance directly into existing professional video-editing tools, targeting working video editors rather than only prompt-first creators.
- **Content moderation and trust-and-safety teams at major platforms**: use video understanding (frame sampling plus transcript analysis) to flag policy-violating content at a scale that makes exhaustive human review of every uploaded video infeasible — a direct, high-stakes instance of the chunk-and-sample pattern in this page.
- **Sports analytics companies**: use action-recognition-style video understanding (often purpose-built models rather than general multimodal LLMs, given the precision and latency demands) to track plays, player movement, and event detection in broadcast footage.
- **Security and surveillance-analytics vendors**: combine motion-triggered sampling with video question answering to let operators query long stretches of footage in natural language ("show me when a vehicle entered this area after hours") rather than scrubbing through raw video manually.
- **Advertising and marketing agencies**: increasingly use image-to-video generation to animate existing product photography into short promotional clips, valuing the composition control that starting from a real image provides over pure text-to-video.

Exact product names, feature sets, and which vendor's model powers which product change quickly in this space — treat this list as illustrative of the CATEGORY of production use, and verify current specifics before citing any one company's stack as authoritative.
`,

  "best-practices": `
1. **Never assume generated video respects physics or maintains perfect consistency** — review every generated clip for the failure modes described in Advanced Concepts before using it in anything client-facing, especially for longer or more complex scenes.
2. **Default to a hybrid frame-sampling strategy** (scene-change plus transcript- or task-driven) rather than naive uniform sampling, once a use case has any real cost of missing a moment.
3. **Always combine visual frames with an ASR transcript** for understanding tasks where dialogue or narration carries meaningful content — visual sampling alone systematically misses audio-only information.
4. **Chunk long video and use a map-reduce aggregation pass**, not a single giant multimodal call — this bounds per-call cost/context and enables parallelism, but requires a genuine aggregation step, not naive concatenation.
5. **Treat video generation as asynchronous by default** — submit, then poll with backoff or use a webhook; never architect a synchronous request path around a multi-minute generation job.
6. **Budget cost using realistic video length and volume**, not a short demo clip — image-token cost per sampled frame multiplies quickly across a real video length, and generation cost multiplies with duration and resolution.
7. **Build a golden evaluation set of real, hard videos** (varied lighting, motion, length, audio quality) for understanding tasks, and a review process (human or rubric-based) for generation quality, and re-run both on every pipeline or prompt change.
8. **Version and pin your sampling strategy, chunk size, and model/vendor version together** for any feature with a real quality bar — these interact, and an isolated change to one can silently shift output quality.
9. **Apply content moderation both before submission (prompt) and after generation (output)** for any generation feature exposed to end users — generated video carries the same misuse risk surface as generated images, at higher visual fidelity and persuasive power.
10. **Prefer image-to-video over pure text-to-video when composition control matters** — anchoring on a specific starting image reduces (though does not eliminate) first-frame ambiguity and gives more predictable results.
11. **Route precision-critical understanding subtasks to a dedicated model** (a purpose-built action-recognition or object-tracking model) rather than a general multimodal LLM, exactly as the **Vision AI** skill recommends for images — general VLMs reasoning over sparse sampled frames are not a substitute for dense, purpose-built temporal models where precision genuinely matters.
12. **Hedge explicitly in any user-facing claim about video-model capability or quality** — this field changes fast enough that a confident claim about "the best" model or a "solved" limitation risks being wrong within a single release cycle.
`,

  "anti-patterns": `
### Assuming generated video is production-ready without review

~~~python
# WRONG — generating and shipping a video with no quality gate
video_url = generate_video(prompt="A chef plating a dish in a busy kitchen")
publish_to_website(video_url)  # physics/consistency errors ship straight to users

# RIGHT — generate, then require an explicit review gate before publishing
video_url = generate_video(prompt="A chef plating a dish in a busy kitchen")
review_result = queue_for_human_review(video_url, checklist=[
    "object/character consistency across the clip",
    "no obviously implausible physics or deformation",
    "matches brand/content guidelines",
])
if review_result.approved:
    publish_to_website(video_url)
else:
    regenerate_or_escalate(review_result.notes)
~~~

### Other common anti-patterns

- **Naive uniform frame sampling for content with rare, brief important events** — a security or compliance use case sampling one frame every 10 seconds can entirely miss a 1-second event; use scene-change or task-driven sampling once missing a moment has real cost.
- **Ignoring audio entirely** — sampling only visual frames on a video where the meaning is carried mostly by dialogue or narration produces a confidently wrong or badly incomplete answer with no obvious error signal.
- **Treating a video-generation job as synchronous** — blocking a request thread or, worse, a user-facing HTTP request on a multi-minute generation call causes timeouts and a poor user experience; always go async.
- **Budgeting video features using image-call cost intuition** — teams that estimate cost per "one frame" and forget to multiply by frame count, chunk count, and transcript volume are routinely surprised by the actual bill at production scale.
- **Concatenating per-chunk summaries without an aggregation pass** — produces a disjointed, sometimes self-contradictory final answer; always run a genuine merge/reconciliation step, ideally itself a model call that sees all chunk summaries together.
- **Assuming a "long context video" API call is not still sampling frames internally** — even native-video APIs are virtually always sampling under the hood at some rate the vendor controls; do not assume literal every-pixel processing just because the API accepts a raw video file.
- **Citing a specific model as definitively "the best" for video generation or understanding without a date** — this field changes fast enough that an unqualified claim is a liability the moment it is written down; always attach a date or explicit "as of" qualifier, and expect it to be verified again before being repeated.
`,

  performance: `
### Measure first

~~~python
import time

def timed_video_understanding_call(client, content_blocks: list[dict]) -> tuple[str, float, dict]:
    start = time.perf_counter()
    response = client.chat.completions.create(
        model="gpt-4o",  # substitute your chosen multimodal model
        messages=[{"role": "user", "content": content_blocks}],
    )
    elapsed = time.perf_counter() - start
    usage = response.usage  # inspect prompt_tokens to see the frame-count-driven image-token cost
    return response.choices[0].message.content, elapsed, usage.model_dump()
~~~

Log latency and token usage per request, broken out by chunk, from day one — for video understanding specifically, track a derived metric of **cost/latency per minute of source video**, since that normalizes across videos of different lengths and makes cost scaling visible before it becomes a budget surprise.

### The optimization hierarchy (apply in order) — understanding

1. **Right-size sampling density per use case** — the single biggest lever; test the sparsest sampling strategy that still reliably catches what the task needs (see the decision table in Advanced Concepts) before touching anything else.
2. **Lean on the transcript wherever possible** — text tokens are far cheaper than image tokens; if a question can be answered from ASR text alone, skip frame sampling for that portion entirely.
3. **Chunk in parallel, not serially** — process independent segments concurrently to reduce wall-clock latency, then aggregate.
4. **Cache per-segment results** keyed on video content hash plus sampling/prompt/model version, since re-analysis of the same video (or overlapping chunks across requests) is pure waste.
5. **Route precision-critical subtasks to a smaller, purpose-built model** (dedicated action recognition, object tracking) rather than a large general multimodal LLM, mirroring the same composition principle from the **Vision AI** skill.

### The optimization hierarchy — generation

1. **Generate at the lowest resolution/duration that satisfies the actual use case** (a previsualization draft does not need final-render settings) before iterating on prompt quality.
2. **Use image-to-video with a fixed starting image** where composition control matters, reducing wasted generations spent re-rolling an acceptable first frame.
3. **Batch non-urgent generation requests** where a vendor offers a lower-cost asynchronous/batch tier, for workloads that do not need immediate results.
4. **Cache and reuse successful generations** rather than regenerating a near-identical clip from scratch.

### Numbers worth knowing (order of magnitude, verify current vendor pricing/docs)

Video generation cost typically scales with both resolution and duration, and can be an order of magnitude or more above a comparable single-image generation call — exact figures vary by vendor and change frequently, so treat any specific number as something to re-verify against current documentation before it drives a budget decision. Video understanding cost scales roughly linearly with frames sampled at a given resolution (following the **Vision AI** skill's per-image token model), so a dense sampling strategy on a long video can add up to a cost far exceeding what a similarly "impressive-sounding" text or single-image feature would cost.
`,

  scalability: `
Video-model features scale primarily as an API-consumption and orchestration problem when using hosted vendor APIs for both generation and understanding, but the orchestration layer itself (chunking, sampling, aggregation) is genuinely more complex than an equivalent text or image feature's orchestration layer.

### Understanding pipelines

- **Horizontal scaling of the chunking/sampling/orchestration layer** follows standard stateless-service scaling patterns (see the **Kubernetes** and **Load Balancers** skills) — this layer is typically CPU-bound (frame extraction, scene-change detection) rather than GPU-bound when using a hosted multimodal LLM API.
- **Parallelism across chunks is the main scalability lever** for long-video latency — process independent chunks concurrently rather than serially, bounded by your own worker pool size and the vendor's rate limits.
- **Vendor rate limits and cost are usually the real ceiling**, not your own infrastructure — request queuing, backoff, and possibly multiple API keys/vendors are needed to sustain high volume, exactly as for any hosted-API-dependent system.

### Generation pipelines

- **Async job queues scale naturally** — generation jobs are inherently long-running and asynchronous, so a standard job-queue architecture (submit, track, notify on completion) fits without much adaptation.
- **Self-hosting an open-weight video generation model** trades API cost for very substantial infrastructure ownership — video generation is markedly more GPU-and-memory-intensive than image generation or text inference, and self-hosting at production quality/scale is a much bigger commitment than self-hosting an open-weight image or text model; most teams should default to hosted vendor APIs unless there is a specific, well-justified reason to self-host.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Long video processing latency (understanding) | Parallel chunk processing, transcript-first triage before deciding sampling density |
| Vendor rate limits under traffic spikes (both directions) | Request queuing, backoff, multiple keys/vendors, pre-negotiated higher limits |
| Cost scaling faster than value at high sampling density or generation duration | Explicit sampling/duration policy per use case, aggressive caching |
| Generation job queue backlog under burst load | Priority tiers, user-facing progress/ETA communication, autoscaled worker pool for the orchestration layer |
| Self-hosted GPU throughput ceiling (if self-hosting) | Dynamic batching, right-sized model, and a strong justification this is genuinely needed over a hosted API |
`,

  security: `
### Video-specific attack surface

1. **Prompt injection via video content**: text visible in a video frame (a sign, a screen recording, a document shown on camera) or spoken in the audio track can be read by a video-understanding pipeline and potentially treated as instructions rather than as content to describe — the same risk as image-embedded text in the **Vision AI** skill, extended to both the visual and audio channels. Treat any text a pipeline reports from a video as untrusted data, never as a command your system should act on directly.
2. **Malicious or oversized file uploads**: an unvalidated "video upload" endpoint is a generic file-upload attack surface first, a video feature second — validate file type, duration, and size strictly before any decode, chunking, or transcription work runs, mirroring the same discipline covered in the **CNNs** and **Vision AI** skills' security sections.
3. **Deepfake and likeness-misuse risk (generation)**: image-to-video and increasingly realistic text-to-video generation raise a real misuse surface around generating video of real, identifiable people without consent — apply content moderation on both the input (does this prompt/image request a real person's likeness in a problematic way) and be aware of your vendor's and jurisdiction's policies on this, since this is an active area of both product policy and regulation.
4. **Sensitive data exposure in uploaded video**: uploaded video can contain PII (faces, license plates, visible documents, embedded location/device metadata) at least as readily as a still image, and additionally through spoken content — apply the same data handling, retention, and access-control discipline as for any PII-bearing upload.
5. **SSRF via URL-based video input**: as with image URL input in the **Vision AI** skill, if your backend fetches a video from a caller-supplied URL, validate and restrict that fetch to avoid an attacker probing internal network resources.

### Defenses

- Validate file type, duration, and size strictly at the ingestion boundary, before any decode/chunk/transcribe work happens.
- Run content moderation on both generation prompts/input images and on generated output before it reaches end users.
- Never let text or speech extracted from a video trigger a privileged action without a validation/allowlist step in between.
- Apply your organization's PII handling policy to uploaded and generated video exactly as to any other PII-bearing data, including provider-side retention terms.
- Restrict and audit any outbound URL fetch your own backend performs on a caller's behalf.
- Rate-limit and authenticate both the generation and understanding endpoints like any other production API surface, with particular attention to the higher per-call cost making abuse more expensive to absorb than for text or image endpoints.
`,

  testing: `
Testing video-model features spans conventional software testing (the pipeline code: chunking, sampling, aggregation) and evaluating probabilistic model output against a curated video set — both are required.

~~~python
# tests/test_video_pipeline.py
import pytest
from video_understanding.sampling.scene_change import detect_scene_changes
from video_understanding.vlm.parse import parse_summary_response

def test_scene_change_detects_a_hard_cut(synthetic_video_with_cut):
    changes = detect_scene_changes(synthetic_video_with_cut, threshold=30.0)
    assert len(changes) >= 1

def test_scene_change_ignores_gradual_lighting_drift(synthetic_video_stable_scene):
    changes = detect_scene_changes(synthetic_video_stable_scene, threshold=30.0)
    assert len(changes) == 0

def test_parse_rejects_malformed_summary_json():
    with pytest.raises(ValueError):
        parse_summary_response("not valid json")

def test_parse_accepts_valid_summary_shape():
    raw = '{"summary": "A cooking demonstration.", "key_moments": [{"timestamp": 12.5, "description": "Chef adds salt"}]}'
    result = parse_summary_response(raw)
    assert "summary" in result
    assert isinstance(result["key_moments"], list)
~~~

### The senior testing doctrine for video-model features

- **Unit test the deterministic pipeline code** (chunking boundaries, scene-change thresholds, parsing/validation) like any software — these bugs are fully preventable.
- **Build a golden evaluation set of real, varied videos** (different lengths, lighting, motion speed, audio quality, and languages if relevant) with known-correct or acceptable-range expected answers, and score every sampling/prompt/model change against it before shipping.
- **Specifically test the known weak spots** — brief events between sampled frames, audio-only content with no visual correlate, long videos requiring aggregation across many chunks — as their own evaluation slice, not just aggregate accuracy.
- **For generation, build a human-review rubric** (consistency, physics plausibility, prompt adherence, content-policy compliance) since there is rarely a single "correct" generated video to exact-match against, and be explicit that this is a fuzzier, more subjective signal than deterministic pipeline testing.
- **Regression-test sampling strategy, chunk size, and model/vendor version together** whenever any one changes — they interact, and testing them independently can hide a regression that only appears in combination.
`,

  debugging: `
### Escalation path

1. **Reproduce with the exact video file and exact pipeline configuration** — video-understanding output can be sensitive to sampling density, chunk boundaries, and even video encoding/compression, so confirm you can reproduce the issue with the precise inputs actually used.
2. **Check which frames were actually sampled** — log frame indices/timestamps per request; a surprisingly common "bug" is a sampling strategy that never came close to the moment the question is actually about.
3. **Inspect the transcript independently of the visual pipeline** — confirm whether missing information was available in the audio but never surfaced by the visual sampling, versus genuinely absent from both channels; these require different fixes (sampling strategy versus a real content gap).
4. **Inspect each chunk's raw response before the aggregation step** — confirm whether a wrong final answer originated in one chunk's analysis or was introduced/lost during the merge step, since these need different fixes.
5. **Test the same video with denser or task-driven sampling** — if quality improves, you have isolated the issue to a sampling-density gap rather than a fundamental model limitation.
6. **For generation, compare the same prompt across multiple models/vendors** — if every model shows the same consistency failure on a given prompt (rapid multi-object interaction, fine hand detail), this likely reflects the field's current structural weak point (see Advanced Concepts) rather than a prompt-fixable bug.

~~~python
# Quick diagnostic: log exactly which frames were sampled and why, plus the raw per-chunk response
import logging

logger = logging.getLogger("video_understanding")

def diagnostic_chunk_call(client, chunk_id: str, sampled_timestamps: list[float], content_blocks: list[dict]):
    logger.info("chunk_call", extra={"chunk_id": chunk_id, "sampled_timestamps": sampled_timestamps})
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": content_blocks}],
    )
    logger.info("chunk_response", extra={
        "chunk_id": chunk_id,
        "usage": response.usage.model_dump(),
        "raw": response.choices[0].message.content,
    })
    return response
~~~
`,

  monitoring: `
Production video-model features need monitoring at the same three levels as any ML-backed service: the service, the model's answers/generations, and the input distribution — with video-specific metrics layered on top.

### Service-level metrics

~~~python
from prometheus_client import Counter, Histogram

VIDEO_REQUESTS = Counter("video_requests_total", "Requests", ["direction", "status"])
VIDEO_LATENCY_PER_MINUTE = Histogram("video_latency_seconds_per_source_minute", "Latency normalized by source video length")
VIDEO_TOKENS_PER_MINUTE = Histogram("video_tokens_per_source_minute", "Image+text tokens consumed, normalized by source video length")
GENERATION_JOB_DURATION = Histogram("generation_job_duration_seconds", "Wall-clock time from submission to completion")

def track_understanding_call(elapsed: float, video_minutes: float, tokens: int, status: str) -> None:
    VIDEO_REQUESTS.labels(direction="understanding", status=status).inc()
    VIDEO_LATENCY_PER_MINUTE.observe(elapsed / max(video_minutes, 0.01))
    VIDEO_TOKENS_PER_MINUTE.observe(tokens / max(video_minutes, 0.01))
~~~

Normalizing latency and token cost by source-video length (rather than raw per-request numbers) is the single most useful monitoring adjustment specific to this domain — raw numbers are hard to compare across videos of wildly different lengths, while per-minute figures reveal cost/latency scaling problems immediately.

### Answer/generation-quality signals

- **Sampled human review of production outputs** — for understanding, weighted toward answers flagged low-confidence or hedged; for generation, weighted toward clips featuring multiple interacting objects or longer durations, where consistency failures are most likely.
- **Refusal/hedge rate over time** (understanding) — a rising rate can indicate a shift in incoming video type/quality, a sampling regression, or a model version change.
- **Regeneration/rejection rate** (generation) — track how often generated output fails a review gate and needs a retry, as a proxy for real-world quality that a golden set alone may not fully capture.

### Input distribution drift

Track summary statistics of incoming videos (length distribution, resolution, language mix, source type) over time — a shift (a new client integration uploading much longer videos, a new market with a different primary language) can silently change both cost and accuracy without any code change.
`,

  deployment: `
### A production Dockerfile for a video-understanding orchestration service (API layer, not a self-hosted model)

~~~dockerfile
FROM python:3.12-slim AS base
# Slim base is sufficient — this service calls hosted ASR and multimodal LLM APIs,
# it does not run GPU inference itself.

WORKDIR /app

# ffmpeg is required for robust video decoding/chunking across formats/codecs.
RUN apt-get update && apt-get install -y --no-install-recommends \\
    ffmpeg libgl1 \\
    && rm -rf /var/lib/apt/lists/*
# libgl1 is a common OpenCV runtime dependency; cleaning apt lists keeps the image smaller.

COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
# --frozen respects the lockfile exactly; --no-dev keeps test-only deps out of the image.

COPY src/ ./src/
ENV PYTHONUNBUFFERED=1
# Unbuffered stdout so logs reach the container runtime immediately.

# Non-root user: this service parses untrusted uploaded video files, so minimize
# blast radius if a parsing library vulnerability is ever exploited.
RUN useradd -m appuser
USER appuser

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "video_understanding.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

### Deployment considerations specific to video features

- **Secrets management**: vendor API keys (video generation, ASR, multimodal LLM) are high-value secrets — load from a secrets manager, never bake into the image (see the **Secrets Management** skill).
- **Egress rules**: restrict outbound HTTPS to exactly the vendor endpoints required (generation vendor, ASR vendor, multimodal LLM vendor), not left open.
- **Storage lifecycle**: define retention policy for uploaded source videos, extracted keyframes, and generated output videos — video files are large, and unbounded retention becomes a real storage cost and a data-governance liability.
- **Rollout strategy for sampling/prompt/model changes**: canary a small percentage of traffic, watch the golden-set score and cost-per-minute-of-video metric, then roll forward, exactly as for any prompt or model change in the **Vision AI** skill.
- **Job queue infrastructure for generation**: a durable queue (not an in-memory one) is required given multi-minute job durations, so that a service restart does not silently lose in-flight generation jobs.
`,

  "production-checklist": `
- [ ] Frame sampling strategy is explicitly chosen per use case (uniform/scene-change/task-driven), not left at a naive default.
- [ ] ASR transcript is combined with visual frames for any use case where audio carries meaningful content.
- [ ] Long videos are chunked, processed in parallel, and merged through a genuine aggregation pass, not naive concatenation.
- [ ] Video generation is treated as fully asynchronous, with polling or webhook completion, never a blocking synchronous call.
- [ ] Server-side validation (file type, duration, size) runs before any decode/chunk/transcribe/generation work.
- [ ] Structured output (JSON mode or equivalent) is used for anything downstream code parses.
- [ ] A documented fallback path exists for refusals, hedges, and low-confidence answers.
- [ ] A human or rubric-based review gate exists before any generated video reaches end users.
- [ ] Sampling strategy, chunk size, prompt template, and model/vendor version are pinned and version-controlled together.
- [ ] A golden evaluation set of real, varied videos exists and is re-run on every pipeline change.
- [ ] Cost is estimated and monitored per minute of source video, with an alert threshold on spend.
- [ ] Timeouts, retries, and a model/vendor fallback are configured for both generation and understanding calls.
- [ ] Content moderation runs on generation prompts/inputs and on generated output.
- [ ] URL-based video inputs are validated against SSRF risk if your backend performs the fetch.
- [ ] PII and likeness-misuse handling policy for uploaded and generated video is defined and matches organizational policy.
- [ ] Monitoring covers latency-per-minute, tokens-per-minute, refusal/hedge/regeneration rate, and input-distribution drift.
`,

  "common-mistakes": `
1. **Assuming generated video respects physics or maintains perfect consistency** — the WHY is architectural (see Advanced Concepts): temporal consistency remains an active, only partially solved problem, and it is easy to overestimate based on a small number of cherry-picked demo clips.
2. **Naive uniform frame sampling for content with rare, brief important events** — the WHY is that uniform sampling has no mechanism to notice it is missing something; it samples on a fixed schedule regardless of content.
3. **Underestimating cost and latency for video workloads** — teams frequently budget using image-call or text-call cost intuition and are surprised when a video feature's actual bill scales with frame count, duration, and transcript volume all at once.
4. **Ignoring the audio channel entirely** — a purely visual sampling pipeline misses everything conveyed only through speech or sound, producing confidently incomplete answers with no obvious error signal.
5. **Treating video generation as synchronous** — architecting a request path that blocks on a multi-minute generation job causes timeouts and poor user experience; this should always be async.
6. **Skipping a review gate for generated content** — shipping generated video directly to users without human or rubric-based review misses consistency failures and content-policy issues that automated checks alone will not reliably catch today.
7. **Concatenating per-chunk understanding results without a real aggregation step** — produces disjointed or self-contradictory final answers; a genuine merge pass is required, not string concatenation.
8. **Assuming a native-video API is not still sampling frames internally** — even vendor APIs that accept raw video files are virtually always sampling at some internal rate; assuming full-frame processing leads to wrong expectations about what the model actually "saw."
9. **Making an unhedged claim about which model is "the best"** — this field's leaderboard changes fast enough that a specific, undated claim is likely to be wrong or stale soon after it is written.
10. **Not validating uploaded video files at the ingestion boundary** — treating a video-upload endpoint as anything other than a generic, security-sensitive file-upload surface first invites the same attacks any unvalidated upload endpoint invites.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|----------------|-----|
| Generation job stuck in "queued"/"running" indefinitely | Vendor-side queue backlog, or a malformed prompt silently failing to start | Implement a max-wait timeout with alerting; check vendor status page; validate prompt against vendor constraints before submission |
| Frame extraction returns zero frames | Corrupted video file, unsupported codec, or wrong file path | Validate file integrity and codec support at ingestion; use ffmpeg's own probe tools to confirm the file is readable before processing |
| Multimodal LLM call fails with a context/size limit error | Too many sampled frames or too-high resolution per chunk | Reduce sampling density or resolution per chunk; chunk into smaller time windows |
| Understanding answer is confidently wrong about a specific moment | Important event fell between sampled frames | Switch to scene-change or task-driven sampling; add a targeted resampling pass near the moment in question |
| Final summary contradicts itself across sections | Per-chunk summaries concatenated without a real aggregation/merge pass | Add a genuine aggregation model call that reconciles all chunk summaries together |
| Generated video shows an object warping or changing shape mid-clip | Structural temporal-consistency limitation of current generation models | Prefer image-to-video for composition-critical content; shorten target duration; add a human review gate |
| ASR transcript has systematically high error rate for a specific dataset | Language/accent/audio-quality mismatch with the chosen ASR provider | Evaluate alternate ASR providers/models for the specific content type; consider a domain-adapted or higher-quality tier |
| Unexpectedly high bill for a video feature | Sampling density or resolution not tuned per use case; no caching | Apply the optimization hierarchy in Performance; add caching keyed on video content + pipeline version |
`,

  faqs: `
**Is video generation "good enough" for production use today?** It depends heavily on the use case. For previsualization, stylized content, and short clips where perfect physical realism is not the bar, results can be genuinely useful today. For anything requiring guaranteed consistency, precise control, or long durations, treat current models as still actively improving rather than a finished, reliable tool — and always add a human review gate.

**Which video generation model is best?** This page deliberately does not name a single winner, because the honest answer changes with each release cycle across multiple actively competing vendors. Evaluate candidates against your own use case and current benchmarks/demos at the time you need to decide, rather than relying on any fixed ranking.

**Can I just feed an entire video file into a multimodal LLM?** Some vendor APIs accept a video file directly, but under the hood they are virtually always sampling frames at some rate you may not fully control — for anything beyond a short clip, you generally get better cost control and quality by managing chunking and sampling yourself.

**How many frames should I sample from a video?** There is no universal number — it depends on video length, content density, and what the task needs to notice. Start from the decision table in Advanced Concepts and validate against your own golden evaluation set rather than picking a number by intuition.

**Why is video understanding so much more expensive than image understanding?** Because each sampled frame costs image tokens exactly as a single image would (see the **Vision AI** skill), and a video requires many sampled frames rather than one — cost scales with frame count, and a naive dense-sampling strategy multiplies quickly.

**Do I need a transcript if the video has no dialogue?** Not necessarily — if a video genuinely has no meaningful audio content, ASR adds cost with little benefit. But verify this assumption; background audio, ambient cues, or captions burned into frames can carry more information than expected.

**How do I evaluate a video-understanding pipeline without a single "correct" answer?** Use a golden set with either exact-match answers for factual questions or an acceptable-range/rubric for open-ended ones, and supplement with sampled human review, exactly as recommended for the **Vision AI** skill's open-ended tasks.

**Is it safe to let end users generate video of real people?** Treat this as a real misuse and policy risk, not a hypothetical one — apply content moderation on prompts and inputs, be aware of vendor and jurisdictional policy on likeness generation, and default to restrictive rather than permissive where policy is unclear.
`,

  "interview-questions": `
**Junior level**

1. *What is the difference between video generation and video understanding?* Model answer: generation produces new video from a text prompt or image (the model creates pixels that didn't exist); understanding analyzes existing video to answer questions or produce labels/summaries (the model interprets pixels that already existed) — different problems, different architectures, different failure modes.
2. *Why can't you just feed every frame of a video into a multimodal LLM?* Model answer: cost and context limits — each frame costs image tokens like a still image, and a video contains far more frames than most budgets or context windows can accommodate, so a sampling strategy is required.
3. *What is temporal consistency, and why does it matter for video generation?* Model answer: it's the requirement that objects, characters, lighting, and motion remain coherent across consecutive frames, not just within any single frame; it matters because without it, a "video" looks like a slideshow of unrelated images rather than smooth, plausible motion.
4. *Name two frame-sampling strategies and one weakness of each.* Model answer: uniform sampling (simple, but can miss brief important events between samples) and scene-change sampling (adapts to content, but needs a tunable threshold and adds a preprocessing step).
5. *Why would you combine an ASR transcript with visual frame sampling for video understanding?* Model answer: visual sampling alone misses anything conveyed only through speech or sound, and a transcript alone misses anything purely visual, so combining both gives more complete coverage.

**Senior level**

6. *Explain, structurally, why video generation quality lags image generation quality on consistency.* Model answer: image diffusion only has to satisfy within-frame constraints; video diffusion must satisfy the same constraints per-frame PLUS a much larger set of cross-frame constraints (object permanence, physics, identity) that current training objectives and architectures only partially capture — this is a structurally harder problem, not a maturity gap that will close on the same timeline as image generation did.
7. *Design a system to summarize a 2-hour lecture video with acceptable cost and quality. What are the key architectural decisions?* Model answer: chunk into time-bounded segments for parallelism; use scene-change plus transcript-triggered sampling per segment (lectures are mostly static visually, so lean on ASR); process chunks in parallel; run a genuine aggregation pass to merge segment summaries into a coherent whole; cache per-segment results; evaluate against a golden set of real lecture videos.
8. *How would you evaluate whether a change to your sampling strategy improved or regressed quality?* Model answer: maintain a golden set of real, varied videos with known-correct or acceptable-range answers, specifically including a slice testing known weak spots (brief events, audio-only content), and score every sampling change against it before shipping, alongside a cost/latency-per-minute-of-video metric to catch regressions in the other direction.
9. *A stakeholder asks you to guarantee that a video-understanding feature will never miss an important event. How do you respond?* Model answer: be honest that no sampling strategy can offer an absolute guarantee short of processing every frame (which is usually cost-prohibitive); propose a task-driven sampling strategy tuned to the specific known risk, quantify the residual risk with an evaluation set, and recommend a human-in-the-loop check for the highest-stakes cases rather than promising perfection.
10. *When would you choose a purpose-built action-recognition model over a general multimodal LLM for video understanding?* Model answer: when the task needs high precision on fast, fine-grained motion (sports plays, safety-critical event detection) where sparse frame sampling into a general VLM is either too imprecise or too expensive at the needed frame density — a dedicated model trained specifically for that motion pattern is usually both more accurate and cheaper per call for that narrow task.
11. *How do you architect a production pipeline to keep generation and understanding cost from spiraling at scale?* Model answer: for generation, default to the lowest resolution/duration that satisfies the use case, use image-to-video to reduce wasted re-rolls, and batch non-urgent jobs; for understanding, tune sampling density per use case, lean on cheaper ASR text wherever it substitutes for visual sampling, cache aggressively, and route precision subtasks to cheaper specialized models — monitor cost per minute of video as the primary derived metric in both directions.
12. *Why is it risky to make a definitive claim about "the best" video generation model in a document or codebase?* Model answer: the field's competitive ranking changes with each release cycle across multiple actively shipping vendors, so an undated, unhedged claim is likely to become stale or wrong quickly — better practice is to date any such claim explicitly or avoid making it in favor of pointing to a process for evaluating current options.
`,

  "coding-questions": `
### Problem 1: Uniform vs. scene-change frame sampling comparison

Write a function that samples frames from a video using BOTH a uniform strategy and a scene-change strategy, and returns a comparison of which strategy captured frames closer to a set of known "important" timestamps.

~~~python
import cv2
import numpy as np

def uniform_sample(video_path: str, num_frames: int) -> list[float]:
    """Return timestamps (seconds) of num_frames evenly spaced samples."""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    duration = total_frames / fps if fps else 0
    return [i * duration / num_frames for i in range(num_frames)]

def scene_change_sample(video_path: str, threshold: float = 30.0) -> list[float]:
    """Return timestamps (seconds) where a significant visual change occurs."""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 1.0
    prev_gray = None
    timestamps = []
    idx = 0
    while True:
        success, frame = cap.read()
        if not success:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if prev_gray is not None:
            diff = np.mean(cv2.absdiff(gray, prev_gray))
            if diff > threshold:
                timestamps.append(idx / fps)
        prev_gray = gray
        idx += 1
    cap.release()
    return timestamps

def closest_distance(sampled_timestamps: list[float], important_timestamps: list[float]) -> float:
    """Average distance from each important moment to its nearest sampled frame —
    lower is better (the sampling strategy captured moments closer to what mattered)."""
    if not sampled_timestamps:
        return float("inf")
    total = 0.0
    for t in important_timestamps:
        total += min(abs(t - s) for s in sampled_timestamps)
    return total / len(important_timestamps)

def compare_strategies(video_path: str, important_timestamps: list[float], num_uniform_frames: int = 10):
    uniform_ts = uniform_sample(video_path, num_uniform_frames)
    scene_ts = scene_change_sample(video_path)
    return {
        "uniform_avg_distance": closest_distance(uniform_ts, important_timestamps),
        "scene_change_avg_distance": closest_distance(scene_ts, important_timestamps),
    }
~~~

**Complexity**: both sampling functions are O(n) in the number of frames read; the comparison step is O(m x k) for m important timestamps and k sampled timestamps, which is negligible for realistic sizes. **Follow-ups**: how would you combine both strategies (union of timestamps, deduplicated within some minimum gap)? How would you extend this to weight scene changes by MAGNITUDE of the difference, not just a binary threshold crossing?

### Problem 2: Chunked video summarization with aggregation

Write a function that chunks a long transcript-plus-frame-timestamp list into time-bounded windows, summarizes each independently, and merges the summaries into one coherent final summary.

~~~python
def chunk_by_time(items: list[tuple[float, str]], chunk_seconds: float) -> list[list[tuple[float, str]]]:
    """Group timestamped items (e.g. transcript lines or frame descriptions)
    into chunk_seconds-wide windows."""
    if not items:
        return []
    chunks = []
    current_chunk = []
    chunk_start = items[0][0]
    for timestamp, text in items:
        if timestamp - chunk_start >= chunk_seconds and current_chunk:
            chunks.append(current_chunk)
            current_chunk = []
            chunk_start = timestamp
        current_chunk.append((timestamp, text))
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

def summarize_chunk(llm_client, chunk: list[tuple[float, str]]) -> str:
    """Summarize one chunk's worth of timestamped text via an LLM call.
    In production this would also include sampled frame images, following
    the Intermediate Concepts pattern; simplified here to text-only for clarity."""
    text_block = "\\n".join(f"[{t:.1f}s] {text}" for t, text in chunk)
    response = llm_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Summarize this video segment concisely:\\n{text_block}"}],
        max_tokens=200,
    )
    return response.choices[0].message.content

def aggregate_summaries(llm_client, chunk_summaries: list[str]) -> str:
    """The critical, often-skipped step: merge chunk summaries into ONE
    coherent narrative, resolving overlaps and contradictions, rather
    than naive concatenation."""
    joined = "\\n\\n".join(f"Segment {i+1}: {s}" for i, s in enumerate(chunk_summaries))
    response = llm_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": (
            "Merge these segment summaries of one continuous video into a single, "
            "coherent overall summary. Resolve any overlaps or apparent contradictions "
            f"between segments:\\n\\n{joined}"
        )}],
        max_tokens=400,
    )
    return response.choices[0].message.content
~~~

**Complexity**: chunking is O(n) in the number of timestamped items; summarization cost is O(number of chunks) LLM calls, parallelizable; aggregation is one additional call whose input size grows with chunk count. **Follow-ups**: how would you handle a chunk boundary that splits a single continuous event awkwardly? How would you decide chunk_seconds dynamically based on content density rather than a fixed constant?
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Extract and inspect uniformly sampled frames

Using OpenCV, write a script that extracts 8 evenly spaced frames from a short (under 2 minute) sample video, saves them as JPEGs with their timestamps in the filename, and sends them to a multimodal LLM asking it to describe what happens in the video. **Deliverable**: the extracted frames, the model's description, and a short written note on anything you believe the description missed based on watching the full video yourself. **Skills exercised**: frame extraction, multimodal API basics (builds on the **Vision AI** skill).

### Lab 2 (Intermediate): Build a scene-change-aware sampler and compare it to uniform sampling

Implement scene-change detection (following the Coding Questions pattern) on a video with several distinct visual segments, and compare the frames it selects against a fixed-count uniform sample on the same video. **Deliverable**: a short report showing which strategy better captured a specific event you define in advance (e.g. "the moment a new object appears"), including the actual timestamps each strategy selected. **Skills exercised**: scene-change detection, sampling-strategy evaluation, quantitative comparison design.

### Lab 3 (Intermediate/Advanced): Combine ASR transcript and visual sampling for video QA

Take a video with meaningful dialogue (a short interview or tutorial clip), run it through an ASR system to get a timestamped transcript, combine it with scene-change-sampled keyframes into one multimodal prompt, and ask the model 3 questions that require BOTH signals to answer correctly (one visual-only, one audio-only, one requiring both). **Deliverable**: the combined prompt, the model's answers, and an analysis of which question type it handled best/worst and why. **Skills exercised**: multi-signal prompt construction, ASR integration, evaluation design.

### Lab 4 (Production): Build a chunked, cost-monitored video-understanding service

Build a small FastAPI service that accepts a video upload, chunks it into time-bounded segments, processes each chunk in parallel (transcript plus scene-change sampling), aggregates the results into one final summary, and logs cost and latency normalized per minute of source video. Include at least one deliberately long test video (10+ minutes) to validate the chunking and aggregation actually hold together at that length. **Deliverable**: the running service, a load test against at least 3 videos of varying length, and a short cost-per-minute-of-video report. **Skills exercised**: the full production architecture from this page — chunking, parallel processing, aggregation, monitoring.
`,

  "real-projects": `
### Project 1: Long-form content moderation assistant

Build a system that ingests uploaded long-form video (10+ minutes), applies a hybrid frame-sampling strategy (scene-change plus flagged-keyword-triggered sampling from the transcript) to flag potential policy-violating segments, and produces a reviewer-facing report with timestamps and reasoning for each flagged segment rather than a single pass/fail verdict. **Engineering requirements**: chunked parallel processing, a documented sampling policy with a rationale for its density choices, an evaluation set of known violating and non-violating videos with measured recall/precision, and an explicit escalation path to human review for low-confidence flags — this should never auto-reject content based solely on the model's verdict without a review gate for anything but the most clear-cut cases.

### Project 2: Product photo to marketing clip pipeline

Build a pipeline that takes a product photo, generates a short image-to-video marketing clip via a generation vendor API, applies an automated pre-check (does the output plausibly match brand guidelines) plus a human review gate, and only then publishes the approved clip. **Engineering requirements**: fully asynchronous job handling with proper timeout/retry logic, a content-moderation step on both the input image and the generated output, a versioned prompt/motion-template library, and a cost-tracking dashboard broken out by clip duration and resolution tier.

### Project 3: Meeting/lecture video QA assistant

Build a service that ingests a long meeting or lecture recording, produces a chunked, ASR-plus-frame-sampled understanding pipeline, and exposes a natural-language QA interface ("what did we decide about the Q3 budget," "at what point does the professor introduce backpropagation") backed by the aggregated understanding of the full video. **Engineering requirements**: parallel chunk processing with a genuine aggregation/merge step, a golden evaluation set of real recordings with known-correct answers to representative questions, monitoring of latency and cost per minute of source video, and a clear fallback message when a question cannot be confidently answered from the available sampling rather than a fabricated guess.
`,

  "case-studies": `
### Runway and the commercialization of generative video

Runway was among the first companies to bring text-to-video and image-to-video generation to a broad, non-research audience, iterating through successive model generations with visibly improving quality each release. **Lesson**: bringing a fast-moving research capability to a real product means committing to continuous model upgrades as the baseline expectation, not a one-time integration — the "state of the art" a product ships against shifts every few months in this category, and product and pricing decisions need to accommodate that pace rather than assume a stable baseline.

### Trust-and-safety video moderation at platform scale

Large content platforms handling enormous volumes of user-uploaded video cannot exhaustively human-review every upload, and have built layered systems combining automated frame/audio sampling with human review reserved for flagged or ambiguous cases. **Lesson**: the "flag for human review" pattern, rather than "fully automate the decision," is the mature production answer for any high-stakes video-understanding task — automated sampling triages volume down to a size human review can handle, rather than replacing human judgment entirely for consequential decisions.

### Sora's demonstration of longer, more consistent generated video

OpenAI's Sora, when previewed and released, notably pushed generated clip length and visual consistency further than prior systems, while still exhibiting the same class of physics/consistency errors (objects deforming, implausible interactions) that this page describes as structural rather than incidental. **Lesson**: progress in this field tends to extend the DURATION and fidelity over which consistency holds, rather than eliminating the underlying problem outright — teams should expect continued improvement on this axis but should not assume any specific release has "solved" temporal consistency, and should re-verify current model behavior against their own use case rather than assuming a marketing claim transfers directly.

### Live sports analytics and the limits of general-purpose video understanding

Sports analytics vendors handling fast-motion event detection (a goal, a foul, a specific play type) have generally found that general multimodal LLMs reasoning over sparsely sampled frames are not precise or fast enough for real-time or near-real-time event detection at the accuracy bar the domain requires, and have continued to rely on purpose-built, densely-sampled or continuous video models trained specifically for that motion pattern. **Lesson**: general-purpose video understanding via frame-sampled multimodal LLMs is not a universal replacement for purpose-built video models — it is one tool in a toolkit, best suited to open-ended, less time-critical reasoning tasks rather than fast, precision-critical event detection.
`,

  comparisons: `
| Approach | Best for | Weaker for | Notes |
|----------|----------|------------|-------|
| Frame-sampled multimodal LLM (video understanding) | Open-ended QA, summarization, flexible natural-language tasks | Fast/rare event detection, exact temporal precision | Cost and coverage both scale with sampling density; the flexible, general-purpose choice |
| Purpose-built action-recognition/video-classification model | High-precision, well-defined tasks at scale (sports events, specific action categories) | Open-ended questions outside its trained taxonomy | Cheaper per call and more precise for its narrow task, but inflexible to novel questions |
| Text-to-video generation | Creative/stylized content where exact composition control matters less | Precise composition, brand-critical first-frame control | Most flexible generation mode, least anchored, most prone to compositional surprises |
| Image-to-video generation | Product shots, brand-critical composition, animating an existing asset | Content with no natural single "anchor image" | Better first-frame control; consistency after the first frame still not guaranteed |
| Native "long video context" multimodal API | Simplicity, less pipeline code to own | Full visibility/control into what was actually sampled internally | Still sampling under the hood at a vendor-controlled rate; convenient but less controllable |
| Fully self-hosted open-weight video generation model | Full control, no per-call vendor cost, data residency requirements | Almost every team, given the very high infrastructure and ops cost | Rarely the right default; justify carefully before choosing this over a hosted API |

### How seniors actually choose

A senior engineer starts from the precision requirement, not the model's marketing description: if a business decision depends on catching a specific, well-defined event reliably (a safety violation, a scoring play), they reach for a purpose-built model or a task-driven sampling strategy with a measured recall against a golden set — never a general VLM's unverified confidence. If the task is genuinely open-ended (summarize, answer arbitrary questions, describe what's happening), a frame-sampled multimodal LLM is the pragmatic default, with sampling density tuned against cost and an explicit acknowledgment of what naive sampling might miss. For generation, seniors default to image-to-video whenever a specific starting composition matters, reserve pure text-to-video for genuinely open creative exploration, and always insert a human review gate rather than trusting output straight to production, given the field's current, honestly-acknowledged consistency limitations.
`,

  "related-technologies": `
- **Vision AI** — the direct foundation this page builds on for image-token encoding, resolution/cost tradeoffs, and VQA-style prompting; video understanding is that same foundation applied across sampled frames.
- **Image Generation** — the direct foundation for the diffusion-based generation recipe (denoising, latent space, text conditioning) that video generation extends across a temporal dimension.
- **CNNs** — background on convolutional and Vision Transformer image encoders that underlie both video understanding's frame encoding and video generation's spatial backbone.
- **Transformers** — background on the attention mechanism that both spatiotemporal video-generation architectures and frame-sampled understanding pipelines rely on.
- **Prompt Engineering** — the general prompting techniques (few-shot, explicit uncertainty framing, structured output requests) that transfer directly to both video generation prompts and video-understanding queries.
- **Cost Optimization** — general cost-management practice that becomes non-optional at the scale video workloads' token/compute cost demands.
- **Latency** — general latency-budgeting practice, especially relevant given video generation's inherently async, multi-minute job durations and long-video understanding's many chained calls.
- **Speech Recognition / ASR** (where covered as its own platform skill) — the transcript-generation half of the combined visual-plus-audio understanding pattern central to this page's production approach.

### Learning path

A reasonable sequence: **Vision AI** and **Image Generation** first (both prerequisites for this page), then this **Video Models** page for the temporal extension of both, then **Cost Optimization** and **Latency** to harden a video feature for production scale.
`,

  "latest-updates": `
This page's knowledge cutoff is January 2026, and the video-model space — both generation and understanding — has been moving unusually fast even by AI-industry standards; treat anything below as a snapshot to re-verify, not a durable ranking.

As of this writing, multiple vendors (OpenAI's Sora, Google's Veo, Runway's Gen family, Kuaishou's Kling, Luma's Dream Machine, Pika, and others) are actively shipping and iterating on text-to-video and image-to-video generation, with visible quarter-over-quarter improvements in clip duration, resolution, and — the axis this page emphasizes most — temporal consistency, though consistency remains an acknowledged, only partially solved weak point across the field rather than a solved problem for any single vendor. On the understanding side, native long-context video support in frontier multimodal LLMs (extending the pattern Gemini's long-context video handling established) has continued to expand how much video can be processed per call, though the underlying frame-sampling-at-some-rate reality described in Advanced Concepts still applies even where a vendor's API accepts a raw video file directly.

Given the pace of change, the durable takeaways to carry forward rather than any specific model name or benchmark number are: temporal consistency is the axis to watch for real progress on the generation side, frame-sampling strategy and cost-per-minute-of-video are the axes that matter most on the understanding side, and any specific "current best" claim should be re-verified against current vendor documentation, release notes, and independent benchmarks at the time you need to make a real decision — not assumed from this page or any single source that may already be dated by the time you read it.
`,

  "future-roadmap": `
Several directions look likely to matter over the next few years, stated with appropriate hedging given how fast this field moves:

- **Longer, more consistent generated video**: expect continued incremental progress on both clip duration and temporal consistency, following the trajectory from a few seconds of visibly inconsistent motion toward longer clips with fewer visible physics/identity errors — but expect this to remain a gradual improvement curve rather than a single point where the problem is declared "solved."
- **Tighter generation controllability**: expect continued investment in giving creators more precise control over generated video (camera motion, specific object behavior, character consistency across multiple shots) rather than only prompt-level steering, closing the gap between generative video and traditional production control.
- **Native, longer video context for understanding**: expect multimodal LLM context windows for video to keep expanding, reducing (though likely not eliminating) the need for aggressive external chunking for moderate-length videos, while very long videos will likely still benefit from chunking and task-driven sampling for cost reasons even as raw context limits rise.
- **Better fusion of audio and visual signal by default**: expect vendors to increasingly bake transcript/audio understanding into their video APIs natively rather than leaving it to the caller to combine ASR output with visual sampling manually, though building this combination yourself remains a valuable, portable skill regardless of how much a given vendor automates.
- **Real-time or near-real-time video generation and understanding**: an active research direction with clear demand (live avatar generation, real-time video analysis) that remains meaningfully harder than the offline case covered throughout this page — worth watching but not yet a safe assumption for production planning at this page's knowledge cutoff.

Where to bet career time: understanding the FUNDAMENTALS in this page (why temporal consistency is hard, how to design a sampling strategy, how to reason about video's cost structure) is more durable than memorizing any specific vendor's current capabilities, precisely because the field's specifics change quickly while these underlying tradeoffs persist across model generations.
`,

  "cheat-sheet": `
~~~text
VIDEO MODELS — ESSENTIALS

TWO DIRECTIONS
  Generation: text/image -> new video (diffusion-based, temporal extension of Image Generation)
  Understanding: existing video -> answer/summary (frame sampling + multimodal LLM, extension of Vision AI)

THE CORE HARD PROBLEM
  Temporal consistency: objects/characters/physics must stay coherent ACROSS frames, not just within one frame
  Remains an active, only partially solved weak point in generation — verify current state, do not assume "solved"

FRAME SAMPLING STRATEGIES (understanding)
  Uniform          - simple, can miss brief important events
  Scene-change      - denser where visuals change, adds preprocessing
  Task-driven       - densest near a known point of interest (e.g. transcript keyword)
  Hybrid (default)  - scene-change + transcript-triggered, the common production pattern

WHY VIDEO COSTS SO MUCH MORE THAN IMAGES
  Generation: dozens-hundreds of frames, JOINTLY denoised with temporal constraints, not independent
  Understanding: every sampled frame costs image tokens like Vision AI; N frames ~ N x single-image cost

PRODUCTION PATTERN (understanding)
  1. Chunk long video into time-bounded segments
  2. Per segment: ASR transcript (cheap) + sampled keyframes (sampling strategy above)
  3. Combine transcript + timestamped frames into one multimodal prompt
  4. Process chunks in PARALLEL
  5. Aggregate per-chunk results with a genuine merge pass (never naive concatenation)

PRODUCTION PATTERN (generation)
  1. Treat every generation call as ASYNC (submit -> poll/webhook -> retrieve)
  2. Prefer image-to-video when composition/first-frame control matters
  3. Content-moderate input AND output
  4. Require a human/rubric review gate before publishing generated video

COMMON PITFALLS
  - Assuming generated video respects physics / stays consistent -> always review before shipping
  - Naive uniform sampling on content with rare key moments -> switch to scene-change/task-driven
  - Underestimating cost/latency -> budget per MINUTE OF VIDEO, not per call
  - Ignoring audio -> combine ASR transcript with visual sampling
  - Trusting a "native video" API to not be sampling internally -> it almost always still is

HEDGE ALWAYS
  Never crown a single "best" model — this field's ranking shifts every release cycle.
  Date any specific capability claim; re-verify before repeating it.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is the single hardest problem distinguishing video generation from image generation? | Temporal consistency — keeping objects, characters, physics, and lighting coherent across frames, not just within one frame. |
| What are the two broad directions covered by "Video Models"? | Video generation (text/image to new video) and video understanding (existing video to answer/summary). |
| Why can't most systems feed every frame of a video into a multimodal LLM? | Cost and context limits — each frame costs image tokens like a still image, and a video contains far more frames than most budgets or windows allow. |
| Name three frame-sampling strategies. | Uniform, scene-change/keyframe, task-driven (and their hybrid combination). |
| What is the main weakness of naive uniform frame sampling? | It can miss a brief but important event that falls between two sampled frames. |
| Why should ASR transcripts be combined with visual frame sampling? | Visual sampling misses audio-only content (dialogue, narration); a transcript misses purely visual content — together they cover more of the video's meaning. |
| Why is video generation typically handled as an asynchronous job rather than a synchronous call? | Generation can take from tens of seconds to minutes, which does not fit a blocking request-response pattern. |
| What does image-to-video generation improve over pure text-to-video? | Better control over the exact starting composition/identity, since the model anchors on a real image rather than hallucinating the first frame. |
| Why does chunking long video need a genuine aggregation step rather than concatenation? | Naive concatenation of per-chunk summaries can read disjointedly or contradict itself across chunk boundaries; a merge pass reconciles overlaps. |
| What metric normalizes cost/latency comparisons across videos of different lengths? | Cost or latency per minute of source video. |
| Why should generated video always go through a review gate before publishing? | Temporal consistency and physics errors remain an active, only partially solved weak point, so automated generation alone cannot be trusted for quality without review. |
| Why is it risky to name one "best" video generation model in written documentation? | The competitive ranking in this field changes with each release cycle across multiple vendors, so an undated claim risks becoming stale or wrong quickly. |
| What is a common security risk specific to video-understanding pipelines? | Prompt injection via text visible in frames or spoken in audio being treated as instructions rather than untrusted content. |
| When should you route a video-understanding subtask to a purpose-built model instead of a general multimodal LLM? | When the task needs high precision on fast, fine-grained motion (e.g. sports plays, safety-critical events) that sparse frame sampling cannot economically or reliably capture. |
| What does even a "native video" multimodal API typically still do internally? | Sample frames at some vendor-controlled rate — full-pixel, every-frame processing remains prohibitively expensive for current architectures. |
`,

  mcqs: `
**1. What is the primary factor that makes video generation structurally harder than image generation?**
A) Video files are larger to store
B) Temporal consistency across frames, not just coherence within one frame
C) Video requires a different programming language
D) Video generation cannot use diffusion models

*Answer: B.* Explanation: an image model only needs one frame to be internally coherent; a video model needs every frame coherent AND consistent with its neighbors — a fundamentally larger constraint set, as detailed in Advanced Concepts.

**2. Which frame-sampling strategy is most likely to miss a brief, important event in a video?**
A) Scene-change / keyframe sampling
B) Task-driven sampling
C) Uniform sampling
D) Hybrid sampling

*Answer: C.* Explanation: uniform sampling follows a fixed schedule regardless of content, so a fast event falling between two scheduled samples can be entirely missed.

**3. Why does video understanding typically cost much more than image understanding via a multimodal LLM?**
A) Video requires a special, more expensive API key
B) Each sampled frame costs image tokens like a single image, and a video requires many sampled frames
C) Video files must be converted to a proprietary format first
D) Multimodal LLMs cannot process video at all

*Answer: B.* Explanation: per the **Vision AI** skill's token-cost model extended here, each sampled frame adds its own image-token cost, so N frames cost roughly N times a single-image call.

**4. What is the recommended default architecture for handling video generation jobs?**
A) Synchronous, blocking calls that wait for completion
B) Asynchronous submission with polling or webhook-based completion
C) Direct database writes with no API call
D) Client-side generation in the browser

*Answer: B.* Explanation: generation jobs commonly take tens of seconds to minutes, which does not fit a blocking request-response pattern — submit-then-poll or webhook callback is the near-universal pattern.

**5. Why should generated video always pass through a review gate before reaching end users?**
A) It is a legal requirement in all jurisdictions
B) Generated video files are too large without compression review
C) Temporal consistency and physics plausibility remain an active, only partially solved weak point
D) Review gates are only needed for text-to-video, not image-to-video

*Answer: C.* Explanation: as covered in Advanced Concepts and Anti-Patterns, current generation models can still produce inconsistent or physically implausible results, so a human or rubric-based review step is a necessary production safeguard, not an optional nicety.

**6. What is the main reason to combine an ASR transcript with visual frame sampling in a video-understanding pipeline?**
A) ASR transcripts are required by law for all video processing
B) Visual sampling alone misses audio-only information, and a transcript alone misses purely visual information
C) Transcripts make frame sampling unnecessary entirely
D) Combining them reduces the total token cost to near zero

*Answer: B.* Explanation: the two signals are complementary — the production pattern in Intermediate Concepts combines both specifically because each covers what the other misses.
`,

  "revision-notes": `
Video Models covers two related but distinct problems: video generation (text/image to new video, extending the diffusion recipe from Image Generation across a temporal dimension) and video understanding (existing video to an answer or summary, extending the multimodal-token approach from Vision AI across a sequence of sampled frames). The single idea that organizes this entire page is temporal consistency — the requirement that objects, characters, physics, and lighting stay coherent not just within one frame but across every frame in relation to its neighbors. This is structurally harder than single-frame image coherence, remains an active, only partially solved weak point in even the strongest generation models at this page's knowledge cutoff, and should be assumed to still be true unless freshly verified against current vendor documentation.

On the understanding side, the central engineering decision is frame sampling strategy: uniform sampling is simple but can miss brief important events; scene-change sampling adapts to visual content changes; task-driven sampling targets known points of interest (often guided by an ASR transcript); and a hybrid of scene-change plus transcript-triggered sampling is the common production default. Combining visual frame sampling with an audio transcript is essential wherever meaningful content is conveyed through speech, since the two signals are complementary rather than redundant.

Both directions are dramatically more expensive than their image-only counterparts: generation must jointly denoise dozens to hundreds of coupled frames rather than one independent image, and understanding pays image-token cost for every sampled frame, so cost scales with frame count in a way that is easy to underestimate using image-call cost intuition. Production architecture for long videos requires chunking into time-bounded segments, parallel processing per chunk, and — critically — a genuine aggregation/merge step rather than naive concatenation of chunk-level results, since disjointed or self-contradictory summaries are a direct consequence of skipping that step.

Common pitfalls recur across both directions: assuming generated video is physically plausible and consistent without review, naive uniform sampling that misses key moments, ignoring the audio channel entirely, treating generation as synchronous, and underestimating cost and latency at production scale. Given how fast this field moves — new vendors and model versions shipping and improving quarter over quarter — this page deliberately avoids crowning any specific model as "the best," and any specific capability or benchmark claim, including anything stated here, should be re-verified against current documentation before being relied upon.

The durable skills to take forward are architectural rather than model-specific: designing a sampling strategy appropriate to a use case's risk of missing something, combining audio and visual signal, chunking and aggregating long content, and budgeting cost per minute of video rather than per call — these principles will likely outlast any specific model generation this page could name.
`,

  "learning-roadmap": `
**Week 1 — Foundations and prerequisites.** Complete (or review) the **Vision AI** and **Image Generation** skills if not already solid, since this page assumes both. Read Overview through Prerequisites here, and run the beginner code examples (a basic text-to-video generation call and a uniform-frame-extraction-plus-multimodal-call). Milestone: you can explain, in your own words, why temporal consistency is the defining hard problem for both directions.

**Week 2 — Core concepts and sampling strategies.** Work through Beginner, Intermediate, and Advanced Concepts. Implement scene-change detection yourself (Coding Questions problem 1) and compare it against uniform sampling on a real short video. Milestone: you can design an appropriate sampling strategy for at least three different use cases (short clip summary, long lecture QA, rare-event detection).

**Week 3 — Architecture and production patterns.** Study Internal Working, Architecture, and Data Flow, then build Hands-on Lab 3 (combined ASR-plus-visual video QA). Read Production Usage, Best Practices, and Anti-Patterns closely. Milestone: you understand the full chunk-sample-combine-aggregate pattern well enough to explain it in an interview.

**Week 4 — Production hardening and portfolio project.** Build Hands-on Lab 4 (a chunked, cost-monitored video-understanding service) or one of the Real Projects specs. Work through Performance, Scalability, Security, Testing, Monitoring, and the Production Checklist, applying each to your own build. Milestone: a working, monitored, cost-aware video pipeline you can discuss end to end, plus honest answers to the Interview Questions above.

**Next skill on the platform**: with both static image (Vision AI, Image Generation) and temporal video (this page) covered, a natural next step is the **Cost Optimization** skill, to formalize the cost-management discipline this page repeatedly points to, or the **Speech Recognition/ASR** skill if you want to deepen the transcript half of the combined understanding pattern used throughout this page.
`,

  "official-docs": `
- **OpenAI platform documentation** — vision and multimodal input API reference; check for current video-input support and any Sora-related API documentation, since availability and shape have been evolving quickly.
- **Google AI / Gemini API documentation** — multimodal input reference, including native video-frame handling details for Gemini models, and Veo-related generation documentation where publicly available.
- **Anthropic API documentation** — vision input reference for Claude models; consult directly for current video-frame-input support, since this page's knowledge cutoff may predate feature changes.
- **Runway documentation** — Gen-family text-to-video and image-to-video API reference, a useful concrete example of a dedicated video-generation vendor API shape.
- **OpenCV documentation** — the standard reference for frame extraction, video I/O, and basic computer-vision operations (cv2.VideoCapture, cv2.absdiff) used throughout this page's code examples.
- **ffmpeg documentation** — the standard reference for video chunking, transcoding, and audio extraction, widely used underneath higher-level video-processing libraries.

Vendor API shapes and capabilities in this space change quickly — always confirm against the current version of each vendor's docs rather than assuming a code sample here matches today's exact API surface.
`,

  books: `
- **"Deep Learning" by Goodfellow, Bengio, and Courville** — foundational neural network and generative modeling theory underlying both the CNN/ViT encoders and diffusion processes this page builds on; does not cover video-specific architectures directly but is essential grounding.
- **"Dive into Deep Learning" (D2L, free online, Zhang et al.)** — includes practical treatment of convolutional and sequence architectures with runnable code, useful for the encoder and temporal-modeling building blocks referenced here.
- **"Computer Vision: Algorithms and Applications" by Richard Szeliski** — a comprehensive classical and modern computer vision reference; useful background for the perception side of video understanding, though predates the LLM-multimodal era covered on this page.
- **"Generative Deep Learning" by David Foster** — practical treatment of generative model families including diffusion models, useful as a bridge from image generation fundamentals toward the temporal extensions this page describes.

This page's topic (video generation and multimodal video understanding specifically) is young enough that dedicated, comprehensive books lag behind the pace of the actual field — treat the above as strong conceptual foundations, and rely on Research Papers, official docs, and current blogs/videos for the fast-moving specifics.
`,

  blogs: `
- **OpenAI's official blog and technical reports** — for Sora and related multimodal capability announcements; read the technical report accompanying any release, not just marketing copy, for the honest capability and limitation discussion.
- **Google DeepMind's blog** — for Veo and Gemini multimodal video capability announcements and technical detail.
- **Runway's research blog** — publishes technical detail alongside product announcements for its Gen-family models, often with more architectural discussion than typical product marketing.
- **Papers with Code (video generation and video understanding leaderboards)** — a high-signal way to track which models are currently benchmarked as leading on specific tasks, useful precisely because this page avoids naming a fixed "best" model.
- **Hugging Face blog and model cards** for open-weight video models — useful for understanding what is available for self-hosting or fine-tuning, with more architectural transparency than closed commercial APIs typically provide.

Treat any blog post's specific benchmark claims as a snapshot in time; cross-check against at least one independent source before treating a vendor's own announcement as the full picture.
`,

  "research-papers": `
This is a genuinely fast-moving research area, and closed commercial systems (Sora, Veo, Runway's latest Gen models, Kling) do not always publish full architectural papers — where this page discusses a real published paper, treat it as a foundational or illustrative reference point rather than a description of any specific current commercial system's exact internals.

- **"Make-A-Video: Text-to-Video Generation without Text-Video Data" (Meta, 2022)** — an early, influential demonstration of extending image diffusion/generation techniques toward video, illustrating the core "extend a trained image model across a temporal dimension" idea this page describes conceptually.
- **"Imagen Video: High Definition Video Generation with Diffusion Models" (Google, 2022)** — a parallel early large-scale text-to-video diffusion effort, useful alongside Make-A-Video for understanding the field's starting point before the 2023-2024 quality jump.
- **"Video Diffusion Models" (Ho et al., 2022)** — a foundational paper on extending the diffusion framework itself to video data, a useful technical reference for the joint spatiotemporal denoising idea in Internal Working.
- **"ViViT: A Video Vision Transformer" (Google, 2021)** — foundational work applying Transformer-based attention to video classification/understanding, a conceptual ancestor of frame-sequence reasoning approaches.
- **"Learning Transferable Visual Models From Natural Language Supervision" (CLIP, OpenAI, 2021)** — not video-specific, but the foundational image-text alignment work underlying the encoders used across both the **Vision AI** skill and video-understanding frame encoding here.

For anything beyond these foundational and illustrative papers, search current preprint servers (arXiv) and vendor technical reports directly — this page's knowledge cutoff means any paper published closer to that date or after should be independently verified rather than assumed to be reflected accurately here.
`,

  videos: `
- **Two Minute Papers (YouTube channel)** — regularly covers new video generation model releases with a clear-eyed discussion of both capabilities and visible failure modes, useful for tracking the field's fast pace without relying solely on vendor marketing.
- **Official demo/technical presentation videos from OpenAI, Google DeepMind, and Runway** for their respective video generation model releases — watch specifically for the failure-mode examples they choose to show (or don't), since what a vendor omits is often as informative as what it demonstrates.
- **Conference talks on video understanding and multimodal LLMs** from venues like CVPR and NeurIPS (searchable on their respective YouTube channels/proceedings) — useful for the more rigorous, less marketing-driven technical discussion of frame-sampling and video-language model approaches.
- **Hugging Face's video/multimodal model walkthroughs** — practical, code-along style content for working with open-weight video understanding and generation models directly.

Given the pace of this field, prefer recently dated talks and demos over older ones when evaluating current capability claims, and cross-check any specific claim against at least one other independent source.
`,

  "github-repos": `
- **opencv/opencv** — the core library used throughout this page's frame-extraction and scene-change-detection code examples; essential for any hands-on video-processing pipeline work.
- **FFmpeg/FFmpeg** — the standard tool for video chunking, transcoding, and audio-track extraction that underlies most production video-preprocessing pipelines.
- **openai/openai-python** (and equivalent official SDKs for other vendors) — the client libraries used for the multimodal LLM calls in this page's understanding-pipeline examples.
- **Stanford or major-lab open-source video understanding benchmarks/codebases** (e.g. repositories accompanying ViViT, TimeSformer, or similar published video Transformer work) — useful for studying video-understanding architecture beyond the frame-sampling-into-a-general-VLM pattern this page emphasizes for production use.
- **Hugging Face "diffusers" library** — includes video diffusion pipeline implementations for several open-weight text-to-video models, useful for hands-on experimentation with the generation side without building a diffusion pipeline from scratch.
- **Open-weight video generation model repositories** (e.g. those accompanying published open text-to-video models as they are released) — check current Hugging Face and GitHub listings, since the open-weight video generation landscape has been changing quickly and any specific repository named here risks being outdated.
- **whisper (OpenAI)** — a widely used open ASR model/repository, directly relevant to the transcript half of the combined video-understanding pattern in Intermediate Concepts.

Search GitHub and Hugging Face directly for the current state of open-weight video generation repositories before committing to one for a real project, since this list will age faster than most other sections on this page.
`,

  "practice-problems": `
1. **Frame extraction basics**: write a script that extracts every Nth frame from a video file and saves them as numbered image files — practice the OpenCV fundamentals from Beginner Concepts.
2. **Scene-change threshold tuning**: given a video with known scene-cut timestamps, tune the threshold parameter in the scene-change detector from Coding Questions to maximize detection accuracy without excessive false positives — practice reasoning about a real precision/recall tradeoff.
3. **Cost estimation exercise**: given a hypothetical video-understanding feature (video length distribution, target sampling density, chosen model's per-image-token pricing), calculate the estimated monthly cost at a stated request volume — practice the cost-reasoning skill from Performance.
4. **Chunking boundary edge cases**: extend the chunk_by_time function from Coding Questions to handle a chunk boundary that would otherwise split a single continuous spoken sentence awkwardly — practice production-grade edge-case handling.
5. **Sampling strategy design exercise**: given three different hypothetical use cases (rare-event security footage, long lecture summarization, short social-media clip captioning), design and justify an appropriate sampling strategy for each, referencing the decision table in Advanced Concepts.
6. **External practice sets**: search Papers with Code's video generation and video understanding benchmark leaderboards for current, hands-on evaluation datasets (e.g. action-recognition benchmarks like Kinetics, or video-QA benchmarks) to practice against real, standardized data rather than only synthetic examples.
7. **Aggregation quality exercise**: given three deliberately overlapping or slightly contradictory chunk summaries (write them yourself to practice the failure mode), write and test an aggregation prompt that produces one coherent, contradiction-free final summary.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Ingestion
        Client["Client app"] --> Gateway["API gateway:\nauth, rate limit, validation"]
    end

    subgraph Understanding_Path["Video Understanding Path"]
        Gateway --> Chunk["Chunk into\ntime-bounded segments"]
        Chunk --> ASR["ASR:\ntimestamped transcript"]
        Chunk --> Sample["Frame sampling:\nscene-change + task-driven"]
        ASR --> Combine["Combine transcript\n+ keyframes per segment"]
        Sample --> Combine
        Combine --> VLM["Multimodal LLM\nper segment"]
        VLM --> Aggregate["Aggregation:\nmerge segment results"]
        Aggregate --> RespU["Response to client"]
    end

    subgraph Generation_Path["Video Generation Path"]
        Gateway --> Mod["Pre-submission\ncontent moderation"]
        Mod --> Submit["Submit async job\nto generation vendor"]
        Submit --> Poll["Poll / webhook\nfor completion"]
        Poll --> Store["Persist video\nto object storage"]
        Store --> Review["Human/rubric\nreview gate"]
        Review --> RespG["Publish or\nescalate for regeneration"]
    end

    VLM -.tokens & latency.-> Monitor["Monitoring:\ncost/latency per minute of video,\nhedge rate, input drift"]
    Submit -.job duration & cost.-> Monitor
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Video Models))
    Generation
      Text-to-video
      Image-to-video
      Diffusion + temporal attention
      Temporal consistency problem
        Physics plausibility
        Object/character identity
        Still an active weak point
    Understanding
      Action recognition
      Video question answering
      Frame sampling strategies
        Uniform
        Scene-change / keyframe
        Task-driven
        Hybrid (production default)
      Combining ASR transcript + visual frames
    Compute cost
      Generation: many coupled frames
      Understanding: tokens per sampled frame
      Cost per minute of video as the key metric
    Production patterns
      Chunking long video
      Parallel per-chunk processing
      Aggregation / merge step
      Async job handling for generation
      Review gate before publishing
    Pitfalls
      Assuming perfect physics/consistency
      Naive uniform sampling misses events
      Ignoring audio channel
      Underestimating cost and latency
      Treating generation as synchronous
      Crowning a single "best" model
    Related skills
      Vision AI
      Image Generation
      CNNs
      Transformers
      Cost Optimization
      Latency
~~~
`,
};

export default videoModels;
