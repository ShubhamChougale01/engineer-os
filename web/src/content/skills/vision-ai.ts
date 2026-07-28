import type { SkillContent } from "../types";

/**
 * Vision AI — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const visionAi: SkillContent = {
  overview: `
Vision AI, in the sense this page uses it, means **multimodal large language models that can see** — systems that accept an image (and often video frames) alongside text and reason about both in one unified model. GPT-4V and later GPT-4o/GPT-5-class models, Claude's vision capability, Google's Gemini multimodal models, and open-weight families like LLaVA and Qwen-VL all belong to this category. This is a different technology from a pure image classifier: instead of outputting a fixed label from a fixed class list, a vision-language model (VLM) can describe an image in free text, answer open-ended questions about it, point at regions, compare two images, read text embedded in a photo, and follow arbitrary natural-language instructions about what it sees.

For an AI engineer, the practical significance is that "add vision" to a product no longer means training a bespoke computer vision model — it increasingly means sending an image to the same API you already use for text, with a prompt describing the task. This collapses a huge amount of previously specialized engineering (dataset collection, label taxonomies, model training, deployment) into a prompting and API-integration problem, at the cost of less control, higher per-call cost, and real accuracy limits that are easy to overestimate if you have only seen cherry-picked demos.

Key characteristics worth internalizing up front: a VLM's "vision" is not a separate module bolted onto a text model as an afterthought in the way a REST API bolts a database onto a web server — in the architectures we understand well (LLaVA-style, described in Internal Working), an image is encoded into a sequence of vector embeddings and projected into the *same token space* the language model already reasons over, so the model attends to image content the same way it attends to preceding text. That gives VLMs their flexibility (any question, in any language, about any image) but also their characteristic failure modes: they are pattern-matching and language-reasoning systems first, not measurement instruments, so tasks like precise counting, exact spatial coordinates, or reading fine print reliably are often weaker than intuition from a few good demos suggests. This page treats VLMs as the primary subject; classic single-purpose computer vision (CNNs for classification/detection, OCR pipelines, image generation models) are covered in depth in their own sibling skills — **CNNs**, **OCR**, and **Image Generation** — and referenced here rather than re-derived.
`,

  history: `
Vision AI as a distinct "chat with an image" product category is recent, but it rests on decades of separate computer vision and language modeling work finally being fused into one model.

| Year | Milestone |
|------|-----------|
| 2012 | AlexNet demonstrates deep CNNs work at scale on ImageNet — the modern computer vision era begins (see the **CNNs** skill for the full lineage). |
| 2015–2017 | Image captioning models (Show and Tell, Show, Attend and Tell) pair a CNN encoder with an RNN/LSTM decoder — an early, narrower ancestor of "image plus text in, text out." |
| 2020 | Vision Transformer (ViT) shows a pure attention architecture can encode images competitively with CNNs, using the same patch-embedding idea VLMs later reuse. |
| 2021 | CLIP (OpenAI) trains an image encoder and a text encoder jointly on image-caption pairs with a contrastive objective, producing a shared embedding space for images and text — a foundational building block for nearly every VLM that follows, including the projection layers described in Internal Working. |
| 2022 | Flamingo (DeepMind) demonstrates a large-scale vision-language model that can be prompted with interleaved images and text for few-shot visual tasks. |
| 2023 | LLaVA and MiniGPT-4 popularize the "frozen CNN/ViT encoder + small trainable projection layer + frozen or lightly fine-tuned LLM" recipe as an efficient, reproducible open-source pattern (see Internal Working). GPT-4V (GPT-4 with vision) ships as a production API capability, bringing image understanding to a mainstream chat/API product for the first time at that quality bar. |
| 2024 | Vision becomes a standard, expected capability across frontier model families — GPT-4o, Claude 3's vision capability, and Gemini 1.5's multimodal (including native long-context video frame) support all ship. Open-weight VLMs (LLaVA-NeXT, Qwen-VL, InternVL, and others) close much of the gap with closed models on public benchmarks. |
| 2025 and beyond | Multimodal models increasingly treat image, video, and audio as native input types rather than bolted-on extensions, and "agentic" use of vision (an agent looking at a screenshot to decide its next action) becomes a common production pattern. Exact model names, benchmark numbers, and which lab leads on which task change quickly — verify current state with each vendor's latest documentation rather than trusting any specific number as durable. |

The throughline: Vision AI did not require a brand-new algorithm so much as it required three separately-mature technologies — strong image encoders (from the CNN/ViT lineage), strong language models (from the Transformer lineage), and a training recipe (CLIP-style contrastive pretraining, then instruction-tuning on image-text pairs) — to be combined at sufficient scale.
`,

  "why-it-exists": `
Before VLMs, "computer vision" and "natural language understanding" were separate engineering disciplines with separate models, separate training pipelines, and separate teams. If a product needed to both classify an image AND answer a free-text question about it, you needed to stitch together a vision model's output (a label, a bounding box, a caption) with a downstream text system that consumed that output — brittle, lossy, and unable to handle any question the original vision model wasn't specifically trained to answer.

Vision AI exists to close that gap by giving one model both perceptual grounding and open-ended language reasoning simultaneously. Instead of "run an object detector, then feed its output labels into a chatbot," a VLM can be asked "is the stove in this kitchen photo left on, and how can you tell?" — a question that requires visual grounding (find the stove, find the indicator) AND commonsense reasoning (what would 'left on' look like) in a single pass, something no classifier-plus-caption pipeline could do without a human designing that exact task in advance.

The other half of "why now" mirrors the CNN story: contrastive pretraining at scale (CLIP and its successors) gave the field a robust way to align image and text representations without needing exhaustively hand-labeled data for every downstream task, and large instruction-tuned language models gave the field a language backbone already capable of following arbitrary natural-language instructions — vision-language fusion just needed to teach that backbone to "read" a new input modality.
`,

  "problem-it-solves": `
Vision AI solves several concrete problems that pure computer vision models or pure text LLMs cannot solve alone.

**1. Open-ended visual questions without a fixed taxonomy.** A traditional image classifier answers exactly the classes it was trained on. A VLM can be asked essentially anything about an image in natural language — "what brand is this laptop," "does this UI screenshot follow our design system's spacing rules," "is anything in this photo a safety hazard" — without retraining or a predefined label set. This is the single biggest practical unlock: product teams can prototype a new vision-dependent feature with a prompt change instead of a training run.

**2. Fusing perception with reasoning and world knowledge.** A VLM can look at a whiteboard photo of a system diagram and explain the architecture in prose, or look at a receipt and compute whether the tip percentage looks right — tasks that require combining what is literally visible with reasoning that a narrow vision model has no mechanism to perform.

**3. Multimodal document and UI understanding.** VLMs can process screenshots, scanned forms, charts, and diagrams as visual input directly, which is why they're increasingly used for UI-testing agents, chart-QA, and document understanding pipelines alongside dedicated **OCR** systems (see Related Technologies for how these overlap and differ).

What Vision AI deliberately does **not** solve, and this needs to be stated plainly rather than discovered in production: it does not give you pixel-perfect measurement, exact counting at scale, or reliable fine-grained spatial coordinates. VLMs are language models that have learned to attend over image tokens; they are not calibrated measurement instruments, and their training objective never explicitly rewarded getting "exactly 47, not 46 or 48" right on a crowd photo. Tasks that need guaranteed-precise counting, measurement, or localization are usually better served by a purpose-built detection/segmentation model (see the **CNNs** skill) or a task-specific pipeline, with a VLM layered on top for language-level interpretation of that pipeline's output — not as a replacement for it. This gap is explored fully in Common Mistakes and Anti-Patterns below because it is the single most common way teams overestimate what a VLM API can reliably do.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, at an architectural level, how an image becomes tokens a language model can attend over, and why this makes VLMs flexible but not measurement-precise.
2. Distinguish captioning, visual question answering (VQA), and grounding/localization as related but distinct vision tasks, and pick the right one for a given product requirement.
3. Send an image to a multimodal LLM API correctly, using both base64-encoded and URL-referenced image inputs, and parse a structured (JSON) response reliably.
4. Reason about image resolution and tiling choices and their direct effect on both output quality and token/dollar cost.
5. Write prompts for vision tasks that reduce hallucination and improve grounding, including asking the model to cite what it sees before concluding.
6. Identify why VLMs are weak at exact counting and measurement, and design a system architecture that routes those subtasks elsewhere.
7. Describe frame-sampling strategies for extracting still images from video for a VLM to reason about, and know when to hand off to a dedicated video model instead.
8. Estimate the cost of a vision-enabled feature at production volume, accounting for image tokens, not just text tokens.
9. Apply production engineering practices (retries, validation, monitoring, security) specifically to a vision-input API surface.
10. Compare the major VLM approaches honestly, without overclaiming which is "best," and know how a senior engineer actually chooses one for a given task.
`,

  prerequisites: `
- **Required**: comfort calling a text-based LLM API (chat completions, message roles, system/user prompts) — see the **Prompt Engineering** skill, which this page builds on directly for the prompting-pattern content.
- **Required**: basic familiarity with what a neural network embedding is (a vector representation of something) — no need for deep math, just the concept that "things get turned into vectors that a model compares."
- **Helpful**: the **CNNs** skill, for background on how images have historically been encoded into features; VLM image encoders are direct descendants of that lineage (often a Vision Transformer, itself a CNN-adjacent idea — see CNNs' section on Vision Transformers).
- **Helpful**: the **Transformers** skill, since the language-model half of every VLM is a Transformer decoder, and understanding attention makes Internal Working below much more intuitive.
- **Not required but related**: the **OCR** skill (text extraction from images — a narrower, often more precise sibling task), the **Image Generation** skill (the inverse direction: text/image to a new image), and the **Video Models** skill (this page only covers video at the conceptual frame-sampling level and defers deep video-specific architecture to that sibling page).
`,

  "beginner-concepts": `
### What "the model can see" actually means

When you attach an image to a prompt sent to a multimodal LLM, you are not attaching a file the way you'd attach a file to an email for a human to open later. The image is converted into a sequence of numeric tokens that get placed directly into the model's input sequence alongside your text tokens, and the model then predicts a text response by attending over all of it — text and image tokens together, in one pass. There's more detail on exactly how in Internal Working; for now, the practical takeaway is: an image "costs" tokens, just like text does, and how many tokens depends on resolution (see Intermediate Concepts).

### The three classic vision-understanding tasks

- **Captioning**: describe an image in a sentence or paragraph. "A golden retriever running across a beach at sunset." Useful for accessibility (alt text), content indexing, and dataset labeling.
- **Visual question answering (VQA)**: answer a specific natural-language question about an image. "How many people are wearing hats in this photo?" "What is the license plate state on this car?" VQA is what most product use cases actually need — captioning is a special case of VQA where the implicit question is "describe this."
- **Grounding / object localization**: identify WHERE something is in an image, typically as a bounding box or point coordinate, not just whether it's present. Some VLMs can return approximate coordinates in their text output when asked; treat these as approximate unless the specific model/API explicitly documents and benchmarks pixel-accurate grounding, because this is one of the weaker, more model-and-version-dependent capabilities (see Common Mistakes).

### Your first vision API call

~~~python
import base64
from openai import OpenAI  # any OpenAI-compatible or vendor SDK follows the same shape

client = OpenAI()

def encode_image(path: str) -> str:
    """Read an image file and return a base64-encoded string for the API."""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

image_b64 = encode_image("receipt.jpg")

response = client.chat.completions.create(
    model="gpt-4o",  # substitute your chosen vision-capable model
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is the total amount on this receipt?"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
                },
            ],
        },
    ],
    max_tokens=300,
)

print(response.choices[0].message.content)
~~~

Note the shape: the "content" of a user message becomes a LIST that mixes a text block and an image block, rather than a single string — this is the API-level signature of a multimodal message, and it is consistent (with minor field-name differences) across most vendor SDKs.

### Image input via URL instead of base64

If your image is already hosted somewhere reachable by the API provider, you can pass a URL instead of encoding bytes yourself:

~~~python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Describe this product image for an e-commerce listing."},
                {"type": "image_url", "image_url": {"url": "https://example.com/product123.jpg"}},
            ],
        },
    ],
)
~~~

URL input is simpler when the image already lives on the public internet or your own CDN; base64 is necessary for local files, user uploads not yet persisted anywhere, or when you need to guarantee the provider never fetches from an external URL (a security consideration covered in Security).

### Reading the response

Most vision-capable chat APIs return a plain text message just like a text-only call — there is nothing special to parse unless you explicitly ask the model to produce structured output (see the worked example in Coding Questions and the Advanced Concepts section on structured extraction).
`,

  "intermediate-concepts": `
### Resolution and tiling: the setting that quietly controls cost and quality

Every major vision-capable API downsamples or tiles the input image before encoding it, and the details differ per vendor and per model version — but the general pattern to understand is consistent enough to reason about:

- A **low-resolution / "low detail"** mode encodes the whole image as a small, fixed number of tokens (cheap, fast, but the model literally cannot see fine detail — small text, distant faces, thin lines will be invisible to it no matter how good the prompt is).
- A **high-resolution / "high detail"** mode splits the image into tiles (e.g. 512x512 px chunks) and encodes each tile as additional tokens on top of a low-res overview, so the model can attend to detail in any region — at a materially higher token cost that scales with image size.

~~~text
Illustrative token-cost shape (exact numbers vary by vendor and model version — verify current
pricing/token docs before budgeting a real feature):

Low-detail mode:   ~85 tokens flat, regardless of image size
High-detail mode:  ~85 base tokens + (tiles_needed x ~170 tokens per tile)
                    A 1024x1024 image might need 4 tiles -> roughly 765 tokens
                    A 2048x2048 image might need 9+ tiles -> well over 1,500 tokens
~~~

The practical implication: resizing a user-uploaded image down to the smallest resolution that still contains the detail your task needs is a real cost lever, not a micro-optimization — at production volume, the difference between always sending full-resolution phone-camera photos (often 3000x4000px or larger) and sending a sensibly downscaled version can be the difference between a sustainable per-request cost and one that makes the feature unviable. It is also a quality lever in the OTHER direction: too aggressive a downscale can silently degrade quality on tasks needing fine detail (reading small text, spotting a hairline crack in a QC photo) without producing any error — the model will just answer confidently and wrong, because it never saw the detail. Always test your chosen resolution setting against your actual hardest real-world cases, not just easy demo images.

### Structured output from a vision call

Many product use cases need the model's answer as structured data (JSON), not prose, so it can be validated and consumed by other code:

~~~python
import json
from openai import OpenAI

client = OpenAI()

SCHEMA_PROMPT = """
Extract the following fields from this invoice image and return ONLY valid JSON
matching this exact shape, with no extra commentary:
{"vendor": string, "invoice_number": string, "total_amount": number, "currency": string}
If a field is not visible or not present, use null for that field.
"""

def extract_invoice_fields(image_b64: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": SCHEMA_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                ],
            },
        ],
        response_format={"type": "json_object"},  # ask the API to constrain output to valid JSON
        max_tokens=500,
    )
    raw = response.choices[0].message.content
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Production code should log the raw response and route to a retry or human review,
        # never silently swallow a malformed extraction.
        raise ValueError(f"Model did not return valid JSON: {raw!r}")
~~~

Using a JSON-mode / structured-output feature (where the API supports it) is materially more reliable than parsing free text with regex, but it still does not guarantee the VALUES are correct — only that the shape parses. Validate values (does total_amount look like a plausible number, is currency a recognized code) as a separate step.

### Multiple images in one request

Many VLM APIs accept several images in a single message, which unlocks comparison and multi-page document tasks:

~~~python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Do these two product photos show the same item? Explain any differences."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_a_b64}"}},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b_b64}"}},
            ],
        },
    ],
)
~~~

Each additional image adds its own token cost on top of the text — a 3-image comparison prompt costs roughly three times the image-token budget of a single-image prompt, which matters when estimating cost at scale.

### Prompting patterns specific to vision tasks

Building on the general prompting techniques in the **Prompt Engineering** skill, vision tasks benefit from a few patterns that don't have a text-only equivalent:

- **Ask the model to describe before it concludes.** "First list every object you can identify in the image, then answer the question" measurably reduces hallucinated answers compared to jumping straight to a conclusion, because it forces the model to ground its reasoning in stated observations you can also inspect.
- **Be explicit about what counts as "visible."** "Only report what is directly visible in the image; if something is unclear or occluded, say so explicitly rather than guessing" reduces confident fabrication on ambiguous images.
- **Specify the output format precisely** for anything downstream code will parse (see Structured output above) rather than trusting free text.
- **Give few-shot examples with images when the task is unusual or the format is strict** — just like text few-shot prompting, showing 1-2 example image-plus-ideal-answer pairs before the real query measurably improves adherence to an odd or highly specific output format.
`,

  "advanced-concepts": `
### The LLaVA-style architecture family (hedged: one common pattern, not the only one)

A widely used and well-documented open-source recipe — popularized by LLaVA and echoed conceptually in many other systems, though exact production architectures from closed labs are not fully public — has three pieces:

1. **A pretrained vision encoder** (commonly a CLIP-style Vision Transformer) that turns an image into a grid of patch embeddings — the same kind of "split the image into patches, embed each patch" idea used in plain Vision Transformers (see the **CNNs** skill's section on ViT).
2. **A small trainable projection layer** (often just one or two linear/MLP layers) that maps those image patch embeddings into the same vector space the language model's own token embeddings live in. This is the piece that is comparatively cheap to train — the vision encoder and the language model can both start from strong pretrained weights and stay mostly or fully frozen, so instruction-tuning the connection between them is far cheaper than training either half from scratch.
3. **A pretrained large language model** that receives the projected image embeddings spliced into its input sequence, positioned alongside the text tokens of the prompt, and then generates a text response by attending over both using the same self-attention mechanism it already uses for text (see the **Transformers** and **Attention** skills).

This is genuinely one architecture family among several actively used in the field, and different vision-language systems make different specific choices (how many image tokens per patch, whether the vision encoder is fine-tuned or fully frozen, whether there's a resampler/cross-attention step instead of a simple linear projection, like Flamingo's approach). Treat "LLaVA-style" as a well-documented reference point for building intuition, not as a claim about exactly how every commercial VLM is built internally — closed-model internals are not fully published, and this page's knowledge cutoff means any specific architectural claim about a current frontier model should be verified against that vendor's own technical documentation.

### Why counting and measurement are structurally hard for this architecture

Once you understand the projection-into-token-space picture above, the counting weakness stops being a mysterious quirk and becomes an expected consequence of the design: the model is attending over a fixed, relatively coarse set of image tokens and reasoning about them the way it reasons about word tokens — via learned pattern association, not via an explicit counting or measurement algorithm. Counting works reasonably well when the count is small and the objects are visually distinct (2 apples vs 3 apples is usually fine); it degrades as scenes get denser, more occluded, or more repetitive (a crowd photo, a spreadsheet of many similar icons, a shelf of near-identical products), because there is no guaranteed mechanism forcing the model to enumerate objects one at a time the way a classical detection-then-count pipeline would. The same logic applies to precise measurement (exact pixel distances, precise angles, exact real-world size) — a VLM can often give a reasonable qualitative estimate ("the box looks roughly twice as tall as it is wide") but should not be trusted for a number that a business decision depends on being exactly right.

### Grounding and coordinate output

Some VLMs and APIs support returning approximate bounding boxes or point coordinates for named objects, either as a first-class API feature or by prompting the model to output coordinates in its text response. Where this is a documented, benchmarked capability of the specific model/API you're using, it can be useful for rough localization (find the roughly-right region of an image to crop and hand to a more precise downstream tool). Where it is not a documented capability, treat any coordinates the model volunteers as unreliable guesses, not measurements — verify against the specific vendor's docs for the model version you're using before building a feature that depends on coordinate accuracy, and prefer a dedicated detection model (see the **CNNs** skill) when real localization precision matters.

### Video understanding: frame sampling, at a conceptual level

Most VLMs that accept "video" today actually work by sampling a sequence of still frames and reasoning over them as a set of images plus their approximate timestamps, rather than having a native, continuous understanding of motion the way a specialized video architecture might. The engineering decision that matters most at this level is the **frame sampling strategy**:

- **Uniform sampling** (e.g. one frame every N seconds) is simple and predictable but can miss a brief but important event that falls between sampled frames, or waste budget on frames from a static, uninteresting stretch of video.
- **Scene-change / keyframe sampling** (sample more densely where the visual content changes a lot) adapts to content but adds a preprocessing step and its own tuning surface.
- **Task-driven sampling** (e.g. sample more densely near a known event timestamp, such as frames around a detected audio cue) trades generality for precision on a known use case.

Every additional sampled frame adds its own image-token cost (see resolution/tiling above), so frame count is a direct cost lever exactly like image resolution is. This page treats video only at this conceptual, frame-extraction level — architectures that model motion and temporal relationships natively (rather than via independent frame sampling) are covered in depth in the **Video Models** sibling skill, and that is the right place to go for anything beyond "which still frames do I send."

### Combining a VLM with a specialized pipeline (the senior pattern)

The mature production pattern for tasks needing both flexibility and precision is not "pick VLM or pick classical CV" — it's composing both: use a dedicated detector/segmenter (CNN-based, see the **CNNs** skill) or **OCR** system to get precise counts, coordinates, or text, and use the VLM as the reasoning layer that interprets those precise outputs in natural language, or as the flexible fallback for the long tail of questions no specialized model was built to answer. This composition pattern recurs throughout Architecture, Anti-Patterns, and Real Projects below.
`,

  "internal-working": `
Here is what happens, step by step, when you send an image and a text prompt to a multimodal LLM (the LLaVA-style pattern, as one well-documented reference architecture — see Advanced Concepts for the hedge on how universal this is):

~~~mermaid
flowchart LR
    A["Input image"] --> B["Resize / tile\naccording to resolution mode"]
    B --> C["Vision encoder\n(ViT/CLIP-style):\nsplit into patches,\nembed each patch"]
    C --> D["Patch embeddings\n(image feature vectors)"]
    D --> E["Projection layer:\nmap image embeddings\ninto LLM token space"]
    E --> F["Splice image tokens\ninto the input sequence\nalongside text tokens"]
    G["Text prompt"] --> H["Tokenize into\ntext token embeddings"]
    H --> F
    F --> I["LLM decoder:\nself-attention over\nimage + text tokens"]
    I --> J["Autoregressive\ntext generation"]
    J --> K["Response returned\nto caller"]
~~~

1. **Preprocessing**: the raw image is resized and possibly split into tiles according to the resolution/detail setting the caller chose (see Intermediate Concepts) — this step alone determines how much visual detail is even physically available to later stages, which is why a too-aggressive downscale degrades quality with no visible error.
2. **Vision encoding**: a pretrained image encoder (commonly a Vision Transformer in the CLIP lineage) splits the (possibly tiled) image into fixed-size patches and produces one embedding vector per patch, in exactly the "split image into patches, embed each" pattern used by plain ViT image classifiers (see the **CNNs** skill).
3. **Projection into token space**: a comparatively small trainable layer maps each patch embedding into the same dimensional space the language model's own word-token embeddings live in. This is the piece instruction-tuning primarily trains in many open recipes — it is what teaches the model to interpret "these numbers" as visual content it should reason about the way it reasons about words.
4. **Sequence splicing**: the resulting image tokens are inserted into the input sequence the language model will process, typically alongside the surrounding text tokens from your prompt (system instructions, user question, any few-shot examples).
5. **Self-attention over a mixed sequence**: the language model's Transformer decoder runs its usual self-attention mechanism (see the **Transformers** and **Attention** skills) over the whole sequence — image tokens and text tokens together — so a text token asking "what color is the car" can attend to whichever image tokens correspond to the car region, purely through learned attention patterns, with no explicit "look here" instruction required.
6. **Autoregressive generation**: the model generates its text response one token at a time, exactly as it would for a text-only prompt, conditioning each new token on everything before it — including the image tokens.

The critical mental model to take from this: there is no separate "vision module" making a decision and handing off a verdict to a "language module." From the point where image tokens enter the sequence onward, it is one unified attention computation — which is exactly why VLMs can answer questions that require BOTH visual grounding and reasoning in one pass, and also why their errors don't look like classic computer-vision errors (misclassified label) so much as they look like classic LLM errors (a fluent, confident, wrong answer).
`,

  architecture: `
### Model architecture — recap and framing

The model-internal architecture is covered step by step in Internal Working. At the system level, thinking about Vision AI means separating the **model call** (a single stateless request: image + prompt in, text out) from the **application architecture** wrapped around it — which is where most of the engineering effort actually lives.

### Application architecture — a production vision-enabled service

~~~text
vision-feature-service/
├── pyproject.toml
├── src/vision_feature/
│   ├── api/                    # FastAPI routes: /analyze, /health
│   ├── ingestion/
│   │   ├── validate.py         # file type, size limits, malware-adjacent checks
│   │   └── preprocess.py       # resize/compress to the resolution tier the task needs
│   ├── vlm/
│   │   ├── client.py           # wraps the vendor SDK: retries, timeouts, model fallback
│   │   ├── prompts.py          # versioned prompt templates (see Prompt Engineering skill)
│   │   └── parse.py            # structured-output parsing + validation
│   ├── pipeline/
│   │   ├── specialized_cv.py   # optional: dedicated detector/OCR call for precision subtasks
│   │   └── orchestrate.py      # decides VLM-only vs VLM+specialized-model composition
│   ├── evaluation/              # offline eval set, golden answers, regression harness
│   └── core/                    # config, logging, cost tracking
└── tests/
~~~

The most consequential architectural decision in a vision-enabled system is the **orchestrate.py** boundary: deciding, per request type, whether a VLM call alone is sufficient (open-ended description, judgment calls, "does this look right") or whether the task needs a specialized model in the loop first (exact count, exact coordinates, exact text extraction) with the VLM layered on top for interpretation. Treating every vision task as "just call the VLM" is the single most common architecture-level mistake covered in Anti-Patterns.

### Reference production architecture

~~~mermaid
flowchart TB
    Client["Client app\n(uploads image)"] --> Gateway["API gateway:\nauth, rate limit,\nfile validation"]
    Gateway --> Preprocess["Preprocess:\nresize to target\nresolution tier"]
    Preprocess --> Router{"Task needs\nprecise count/coords/text?"}
    Router -->|yes| Specialized["Specialized CV model\n(detector / OCR)"]
    Router -->|no| VLM["Multimodal LLM API call"]
    Specialized --> VLM
    VLM --> Validate["Parse + validate\nstructured output"]
    Validate --> Cache["Cache result\n(keyed on image hash + prompt version)"]
    Cache --> Response["Response to client"]
    VLM -.cost & latency.-> Monitor["Monitoring:\ntoken cost, latency,\nconfidence signals"]
~~~
`,

  "data-flow": `
Tracing one request end to end, from an uploaded image to a returned answer:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as API gateway
    participant Pre as Preprocessing
    participant Router as Task router
    participant CV as Specialized CV (optional)
    participant VLM as Multimodal LLM API
    participant Parser as Response parser

    Client->>API: POST /analyze (image bytes, task type)
    API->>API: validate file type/size, auth, rate limit
    API->>Pre: raw image
    Pre->>Pre: resize/compress to target resolution tier
    Pre->>Router: preprocessed image + task metadata
    Router->>CV: (if task needs precise count/coords/text)
    CV-->>Router: structured detections/text
    Router->>VLM: image (base64/URL) + prompt (+ CV output if composed)
    VLM-->>Parser: text or JSON response
    Parser->>Parser: validate shape and plausibility
    Parser-->>Client: final structured/text result
    Parser-->>API: log tokens used, latency, cache result
~~~

Two details matter operationally: the preprocessing step happens BEFORE the router decision (resolution choice affects both paths), and the parser step is not optional even for plain-text responses — at minimum it should check the response isn't empty, isn't a refusal, and doesn't contain an obvious hedge like "I cannot determine this from the image" that calling code should handle explicitly rather than silently passing through as a valid answer.
`,

  "production-usage": `
### Tooling and integration patterns

Production vision-AI features are almost always built on top of the same SDKs used for text LLM calls (OpenAI's Python/Node SDKs, Anthropic's SDK, Google's Gen AI SDK, or an abstraction layer like LangChain/LlamaIndex that normalizes multiple vendors behind one interface) — there is rarely a separate "vision SDK" to learn; vision is a message-content-type extension of the same chat completion API.

~~~bash
uv add openai pillow
uv add --dev pytest
# Example: run an evaluation harness against a fixed image test set before shipping a prompt change
uv run python -m vision_feature.evaluation.run_eval --dataset golden_set/
~~~

### Config and operational defaults

- **Resolution tier per task type**: define an explicit policy (e.g. "product photos: high detail, 1024px max side; document scans: high detail, keep aspect ratio; thumbnail moderation checks: low detail") rather than always defaulting to the highest resolution "to be safe" — that default is the most common unnecessary cost driver.
- **Image preprocessing library**: Pillow (Python) or sharp (Node) for resizing/format conversion before encoding — do this server-side, never trust a client to have already resized correctly.
- **Timeouts and retries**: vision calls are typically higher-latency than text-only calls (more tokens to process on the input side) — set timeouts accordingly and use exponential backoff retries for transient failures, exactly as for any external API dependency.
- **Model fallback**: maintain a documented fallback (a different vision-capable model or vendor) for outages, and test that your prompt still produces a usable response shape on the fallback model — prompts are not perfectly portable across model families.
- **Caching**: cache on a hash of (image content + prompt version + model version) where the same image is plausibly re-analyzed — vision calls are expensive enough that avoiding a duplicate call is a meaningful cost and latency win.
`,

  "industry-examples": `
- **Be My Eyes / Be My AI**: partnered with OpenAI to give blind and low-vision users natural-language descriptions of their surroundings from a phone camera photo — a canonical accessibility use case that plays directly to VLMs' open-ended description strength.
- **Klarna and other e-commerce/fintech companies**: use vision-capable models to process receipts, invoices, and product photos as part of automated support and cataloging workflows, often combining VLM reasoning with structured extraction (see Intermediate Concepts' JSON extraction pattern).
- **GitHub Copilot and coding-agent products**: increasingly use vision to let an agent look at a screenshot of a UI or an error dialog and reason about what changed, closing the loop between "what does the running app actually look like" and "what code produced that."
- **Perplexity, Google, and other search products**: use multimodal input to let users search "by photo" (upload an image, ask a question about it) rather than only by text query, blending VQA-style reasoning into consumer search.
- **Robotics and warehouse automation companies**: increasingly combine VLM-level scene reasoning ("is the shelf area clear enough to place this pallet") with classical, precision-critical perception (LIDAR, dedicated detection models) for the actual physical safety-critical decisions — a direct real-world instance of the "VLM for judgment, specialized model for precision" composition pattern from Advanced Concepts.

Exact product names, feature sets, and which vendor's model powers which product change frequently — treat this list as illustrative of the CATEGORY of production use, and verify current specifics before citing any one company's stack as authoritative.
`,

  "best-practices": `
1. **Choose the lowest resolution tier that still contains the detail your task needs**, and test that choice against your hardest real images, not easy demo images — this is the single biggest cost lever covered on this page.
2. **Never trust a VLM for an exact count or exact measurement your business logic depends on** — route those subtasks to a dedicated detection/measurement model and use the VLM to interpret the result in language, not to produce the number itself.
3. **Ask the model to describe what it sees before concluding**, reducing ungrounded hallucination on ambiguous images (see the prompting pattern in Intermediate Concepts).
4. **Use structured output modes (JSON mode / schema-constrained generation) for anything downstream code parses**, and still validate the VALUES, not just that the shape parsed.
5. **Resize and validate images server-side before they ever reach the model API** — never trust client-supplied resolution or format.
6. **Version your prompts and pin your model version** for any vision feature with a quality bar that matters — vision prompts are often more resolution- and model-version-sensitive than pure text prompts, so an unannounced model upgrade can shift behavior more than expected.
7. **Build a golden evaluation set of real, hard images** (not synthetic or cherry-picked ones) and re-run it whenever you change the prompt, resolution setting, or model version.
8. **Cache aggressively on image content plus prompt/model version** — repeated identical vision calls are pure waste at production volume.
9. **Design an explicit fallback path for refusals and low-confidence answers** — a VLM sometimes declines to answer or hedges heavily; route those cases to a human or a secondary check rather than silently accepting a hedge as a real answer.
10. **Budget cost per feature using realistic image sizes and volumes**, not the smallest demo image you tested with — image tokens dominate cost far more than most text-only cost models account for.
11. **Treat coordinate/grounding output as approximate unless the specific model/API explicitly documents and benchmarks it** — verify before building a feature that depends on localization precision.
12. **Compose VLM and classical CV rather than picking one exclusively** — use the VLM for flexible reasoning and language output, and a dedicated model (see the **CNNs** and **OCR** skills) for anything needing guaranteed precision.
`,

  "anti-patterns": `
### Trusting a VLM's count at face value

~~~python
# WRONG — asking the VLM to count and trusting the number directly for a business decision
response = ask_vlm(image, "How many defective items are in this photo? Reply with just the number.")
defect_count = int(response.strip())
if defect_count > threshold:
    reject_batch()  # a miscounted VLM answer can trigger a wrong, costly decision

# RIGHT — use a dedicated detector for the count, VLM (if at all) only for qualitative commentary
detections = defect_detector.detect(image)               # a purpose-built, evaluated CV model
defect_count = len(detections)
if defect_count > threshold:
    explanation = ask_vlm(image, "Briefly describe the visible defects in this image.")
    reject_batch(count=defect_count, notes=explanation)  # count comes from the trusted source
~~~

### Other common anti-patterns

- **Always sending full-resolution, uncompressed images "to be safe"** — silently multiplies cost with no quality benefit past the point where the task's needed detail is already captured; test your actual resolution floor.
- **Parsing free-text responses with regex instead of using structured/JSON output modes** — brittle, and breaks silently the moment the model phrases something slightly differently after a model update.
- **Never versioning or pinning the model** for a vision feature with a real quality bar, then being surprised when an automatic model upgrade changes output style or accuracy on your golden set.
- **Treating a hedge or refusal as a valid answer** — if the model says "I cannot clearly tell from this image," code that blindly stores that string as the "answer" rather than routing it to a fallback path is a production bug waiting to surface.
- **Skipping an evaluation set entirely and shipping on vibes** — vision task quality is highly sensitive to the exact images you happen to test with; a prompt that looks great on three demo photos can fail badly on the long tail of real user uploads (poor lighting, extreme angles, occlusion).
- **Assuming grounding/coordinate output is pixel-accurate** without checking the specific model/API's documented capability — building a UI that draws a box from unverified model-reported coordinates can visibly misplace it.
- **Ignoring image orientation/EXIF metadata** — some pipelines strip or ignore EXIF rotation data, causing the model to reason about a sideways or upside-down image without anyone noticing until output quality mysteriously degrades for a subset of uploads (commonly phone-camera photos).
`,

  performance: `
### Measure first

~~~python
import time

def timed_vlm_call(client, image_b64: str, prompt: str) -> tuple[str, float]:
    start = time.perf_counter()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
            ],
        }],
    )
    elapsed = time.perf_counter() - start
    usage = response.usage  # inspect prompt_tokens / completion_tokens to see image-token cost
    return response.choices[0].message.content, elapsed
~~~

Log both latency and token usage (specifically the image-token contribution to prompt_tokens) per request from day one — you cannot optimize a cost or latency problem you haven't measured, and vision calls hide their true cost inside a token count that looks unremarkable until you connect it to the resolution setting that produced it.

### The optimization hierarchy (apply in order)

1. **Right-size resolution per task** — the single biggest lever; test the lowest tier that preserves needed detail (see Intermediate Concepts) before touching anything else.
2. **Reduce image count per request** where possible — comparing many images in one call multiplies token cost linearly; only send the images the task genuinely needs.
3. **Cache on image+prompt+model version** — avoid re-paying for identical analysis.
4. **Batch non-urgent requests** where the vendor offers a batch/async API tier at reduced cost, for workloads that don't need synchronous responses (e.g. bulk content moderation of an existing photo library).
5. **Route precision subtasks to a smaller, specialized, cheaper CV model** instead of a large general VLM — a dedicated detector is typically far cheaper per call than a frontier multimodal LLM for the narrow thing it was built to do.
6. **Trim prompt text and reduce max_tokens on the response** where the task allows a short, structured answer rather than open-ended prose — output tokens cost too, and a verbose default response format is easy to leave un-tuned.

### Numbers worth knowing (order of magnitude, verify current vendor pricing/docs)

Image-token overhead is frequently the dominant cost component of a vision-enabled feature, often exceeding the text prompt's token cost by a wide margin at high resolution — exact figures vary by vendor, model, and change over time, so treat any specific number you find (including illustrative ones on this page) as something to re-verify against current documentation before it drives a budget decision.
`,

  scalability: `
Vision-AI features scale primarily as an API-consumption problem rather than a self-hosted-infrastructure problem, when using a hosted multimodal LLM API — the scaling story differs sharply from self-hosting your own model.

### Using a hosted API

- **Horizontal scaling of your own service** (the ingestion/preprocessing/routing layers) is standard stateless-service scaling — see the general patterns in the Kubernetes and Load Balancers skills.
- **The real bottleneck is usually vendor rate limits and cost**, not your own infrastructure — production systems need request queuing, backoff, and possibly multiple API keys/vendors to sustain high volume, plus hard cost-alerting since a traffic spike directly multiplies spend.
- **Provider-side latency variance** at peak load is common with large multimodal models — design for it with generous timeouts and a documented fallback (a smaller/faster model, or a cached/degraded response) rather than assuming consistent low latency.

### Self-hosting an open-weight VLM

Self-hosting (e.g. an open LLaVA-family or similar model) trades API cost for infrastructure cost and operational ownership — GPU capacity planning, batching for throughput, and model-serving frameworks (vLLM and similar, which increasingly support multimodal inputs) apply here, following the same general scaling patterns as self-hosted LLM serving generally.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Vendor API rate limits under traffic spikes | Request queuing, backoff, multiple keys/vendors, pre-negotiated higher limits for known traffic |
| Cost scaling faster than revenue at high resolution | Resolution-tier policy per task, aggressive caching, route precision tasks to cheaper specialized models |
| Preprocessing (resize/encode) becoming a CPU bottleneck at high request volume | Scale the preprocessing tier horizontally; use a fast image library (Pillow-SIMD, sharp) |
| Self-hosted GPU throughput ceiling | Dynamic batching, a serving framework built for multimodal throughput, right-sized model for the task |
`,

  security: `
### Vision-specific attack surface

1. **Server-side request forgery (SSRF) via URL-based image input**: if your API accepts a URL for the provider (or your own backend) to fetch, an attacker can supply an internal/private URL to probe internal network resources. Validate and restrict any URL your own backend fetches on the caller's behalf; be aware of what a vendor's URL-fetch feature is documented to allow and restrict it at your ingestion layer regardless.
2. **Prompt injection via image content**: text rendered INSIDE an image (a photographed note, a screenshot containing instructions) can be read by the model and potentially treated as instructions rather than as data to describe — a real image-input analogue of classic prompt injection. Treat any text a VLM reports from an image as untrusted data, never as a command your system should act on directly.
3. **Sensitive data exposure in uploaded images**: user photos can contain PII (faces, documents, license plates, embedded location metadata in EXIF) — apply the same data handling, retention, and access-control discipline you would to any PII-bearing upload, and be deliberate about whether images are retained by your system or the API vendor, and for how long.
4. **Decompression-bomb / oversized-file resource exhaustion**: validate file type and cap dimensions/file size before decoding, exactly as covered in the **CNNs** skill's security section — an unvalidated "image" upload endpoint is a generic file-upload attack surface first, a vision feature second.
5. **Model-output injection into downstream systems**: if a VLM's text output is later interpolated into a shell command, SQL query, or another LLM's prompt, treat it with the same untrusted-input discipline as any other model-generated or user-generated text (see the **OWASP Top 10** and **Prompt Engineering** skills).

### Defenses

- Validate file type, dimensions, and size strictly at the ingestion boundary, before any resize/decode work happens.
- Never let a VLM's extracted "instructions" from an image content trigger a privileged action without a validation/allowlist step in between.
- Restrict and audit any outbound URL fetch your own backend performs on a caller's behalf.
- Apply your organization's PII handling policy to uploaded images exactly as you would to any other PII-bearing user data, including provider-side retention terms.
- Rate-limit and authenticate the vision endpoint like any other production API surface.
`,

  testing: `
Testing a vision-AI feature spans conventional software testing (the pipeline code) and a genuinely different discipline: evaluating a probabilistic model's answers against a curated image set — both are required, and neither substitutes for the other.

~~~python
# tests/test_vision_pipeline.py
import pytest
from vision_feature.ingestion.preprocess import resize_for_tier
from vision_feature.vlm.parse import parse_invoice_response

def test_resize_respects_max_dimension():
    from PIL import Image
    img = Image.new("RGB", (4000, 3000))
    resized = resize_for_tier(img, tier="high_detail_1024")
    assert max(resized.size) <= 1024

def test_parse_rejects_malformed_json():
    with pytest.raises(ValueError):
        parse_invoice_response("this is not json")

def test_parse_accepts_valid_shape():
    raw = '{"vendor": "Acme", "invoice_number": "123", "total_amount": 42.5, "currency": "USD"}'
    result = parse_invoice_response(raw)
    assert result["vendor"] == "Acme"
    assert isinstance(result["total_amount"], float)
~~~

### The senior testing doctrine for vision-AI features

- **Unit test the deterministic pipeline code** (resize logic, parsing, validation) like any software — these bugs are fully preventable and cheap to catch.
- **Build a golden evaluation set of real, hard images** with known-correct expected answers (or an acceptable answer range for open-ended tasks), and score every prompt/model/resolution change against it before shipping.
- **Evaluate qualitatively where there is no single correct answer** (open-ended descriptions) using a rubric and either human review or a separate LLM-as-judge pass, and be explicit that this is a fuzzier signal than exact-match testing.
- **Specifically test the known weak spots** — dense-object counting, small text, low-light or motion-blurred photos, unusual angles — as their own evaluation slice, not just aggregate accuracy, exactly as the CNNs skill recommends slicing evaluation by subgroup.
- **Regression-test the exact prompt template and resolution setting together** whenever either changes — they interact, and testing them independently can hide a regression that only appears in combination.
`,

  debugging: `
### Escalation path

1. **Reproduce with the exact image and exact prompt** — vision output can be sensitive to resolution and even file format/compression, so first confirm you can reproduce the issue with the precise bytes that were actually sent, not a re-exported copy of the image.
2. **Check the resolution/detail setting actually used** — log it per request; a surprisingly common "bug" is an unintended low-detail default silently discarding the fine detail a task needs.
3. **Inspect the raw text response before any parsing logic** — confirm whether the model itself answered incorrectly, refused, or hedged, versus your own parsing code mangling a correct answer. These require completely different fixes.
4. **Test the same image at higher resolution and with a more explicit prompt** — if quality improves, you've isolated the issue to a resolution or prompt-specificity gap rather than a fundamental model limitation.
5. **Check for EXIF/orientation issues** — render the exact bytes sent to the API as a human would see them; a sideways image is a common, easy-to-miss cause of "wrong" answers that are actually correct answers about a rotated image.
6. **Compare against a different model or vendor on the same input** — if every vision-capable model struggles equally on a given image (dense small objects, extreme blur), this is likely a structural weak spot (see Advanced Concepts) rather than a prompt-fixable bug, and the fix is architectural (route to a specialized model) rather than further prompt tuning.

~~~python
# Quick diagnostic: log exactly what was sent, at what resolution, and the raw response
import logging

logger = logging.getLogger("vision_feature")

def diagnostic_call(client, image_b64: str, prompt: str, resolution_tier: str):
    logger.info("vision_call", extra={"resolution_tier": resolution_tier, "prompt_len": len(prompt)})
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}", "detail": resolution_tier}},
        ]}],
    )
    logger.info("vision_response", extra={"usage": response.usage.model_dump(), "raw": response.choices[0].message.content})
    return response
~~~
`,

  monitoring: `
Production vision-AI features need monitoring at the same three levels as any ML-backed service: the service, the model's answers, and the input distribution.

### Service-level metrics

~~~python
from prometheus_client import Counter, Histogram

VISION_REQUESTS = Counter("vision_requests_total", "Requests", ["status", "resolution_tier"])
VISION_LATENCY = Histogram("vision_request_seconds", "End-to-end latency", ["resolution_tier"])
VISION_IMAGE_TOKENS = Histogram("vision_image_tokens", "Image tokens consumed per request")

def track_call(resolution_tier: str, elapsed: float, image_tokens: int, status: str) -> None:
    VISION_REQUESTS.labels(status=status, resolution_tier=resolution_tier).inc()
    VISION_LATENCY.labels(resolution_tier=resolution_tier).observe(elapsed)
    VISION_IMAGE_TOKENS.observe(image_tokens)
~~~

Track rate/errors/duration (RED) per endpoint as usual, plus image-token consumption specifically — it is the metric most directly tied to runaway cost, and it should have its own alert threshold separate from a general spend alert.

### Answer-quality signals

- **Refusal/hedge rate over time** — a rising rate of "I cannot determine this" responses can indicate a shift in incoming image quality/type, a prompt regression, or a model version change; alert on a meaningful jump.
- **Sampled human review of production answers**, weighted toward low-confidence or hedge-flagged responses — the only reliable way to catch a quality regression that a golden test set didn't anticipate.
- **Cost per resolved request**, tracked alongside accuracy on the golden set, so a cost-cutting resolution change is evaluated against its quality impact rather than shipped on cost savings alone.

### Input distribution drift

Track summary statistics of incoming images (resolution distribution, file size, format) over time — a sudden shift (e.g. a new client app that uploads much larger images, or a new user segment with systematically different photo quality) can silently change both cost and accuracy without any code change.
`,

  deployment: `
### A production Dockerfile for a vision-feature service (API-orchestration layer, not a self-hosted model)

~~~dockerfile
FROM python:3.12-slim AS base
# Slim base is sufficient — this service calls a hosted VLM API, it does not run GPU inference itself.

WORKDIR /app

# Install system deps needed by Pillow for common image formats (JPEG, WebP, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \\
    libjpeg62-turbo libwebp7 \\
    && rm -rf /var/lib/apt/lists/*
# Cleaning apt lists keeps the image smaller and avoids shipping stale package indexes.

COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
# --frozen ensures the lockfile is respected exactly; --no-dev keeps test-only deps out of the image.

COPY src/ ./src/
ENV PYTHONUNBUFFERED=1
# Unbuffered stdout so logs reach the container runtime immediately, not on buffer flush.

# Non-root user: a vision-ingestion endpoint parses untrusted file uploads, so minimize
# blast radius if a parsing library vulnerability is ever exploited.
RUN useradd -m appuser
USER appuser

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "vision_feature.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

### Deployment considerations specific to vision features

- **Secrets management**: vendor API keys are high-value secrets — load them from a secrets manager, never bake them into the image or commit them (see the **Secrets Management** skill).
- **Egress rules**: this service needs outbound HTTPS to the vision-API vendor's endpoints; restrict egress to exactly the hosts required rather than leaving it open.
- **Rollout strategy for prompt/model changes**: treat a prompt template or model-version change with the same rollout discipline as a code deploy — canary a small percentage of traffic, watch the golden-set score and hedge/refusal rate, then roll forward.
- **Self-hosted model deployment** (if using an open-weight VLM instead of a hosted API) needs GPU-provisioned nodes, a serving framework with multimodal support, and the same model-registry/versioning discipline covered in the **CNNs** skill's deployment section — this page assumes the more common hosted-API path above unless self-hosting is a deliberate choice.
`,

  "production-checklist": `
- [ ] Resolution tier is explicitly chosen per task type, not left at an unexamined default.
- [ ] Server-side image validation (type, size, dimensions) runs before any resize/decode step.
- [ ] Structured output (JSON mode or equivalent) is used for anything downstream code parses.
- [ ] Parsed values are validated for plausibility, not just for correct JSON shape.
- [ ] A documented fallback path exists for refusals, hedges, and low-confidence answers.
- [ ] Prompt template and model version are both pinned and version-controlled together.
- [ ] A golden evaluation set of real, hard images exists and is re-run on every prompt/model/resolution change.
- [ ] Tasks needing exact counts, coordinates, or measurements are routed to a specialized CV model, not trusted to the VLM alone.
- [ ] Caching is in place, keyed on image content plus prompt and model version.
- [ ] Cost is estimated and monitored using realistic image sizes and volumes, with an alert threshold on image-token spend.
- [ ] Timeouts, retries, and a model/vendor fallback are configured for the vision API call.
- [ ] URL-based image inputs are validated against SSRF risk if your backend performs the fetch.
- [ ] PII handling and retention policy for uploaded images is defined and matches organizational policy.
- [ ] EXIF orientation is handled correctly before the image reaches the model.
- [ ] Monitoring covers latency, image-token consumption, refusal/hedge rate, and input-distribution drift.
- [ ] Rollout of any prompt or model change is canaried against the golden set before full traffic.
`,

  "common-mistakes": `
1. **Assuming VLMs count accurately at any scale** — the WHY is architectural (see Advanced Concepts): there's no explicit enumeration mechanism, only learned pattern association over a fixed set of image tokens, so accuracy degrades with density and occlusion in a way that isn't obvious from a few easy demo images.
2. **Not accounting for image-token cost when estimating feature cost** — teams frequently budget a vision feature using text-token-style cost intuition and are surprised when a single high-resolution image call costs as much as a long text conversation.
3. **Silently using a low-resolution default that discards needed detail** — the model doesn't error when detail is missing; it just answers confidently based on what little it could see, which is a much harder failure to notice than an explicit error.
4. **Parsing free-text output with brittle string matching** instead of using a structured output mode — breaks the moment the model's phrasing shifts, often after an unannounced model update.
5. **Ignoring EXIF orientation** — a sideways photo silently produces a "wrong" answer that is actually a correct answer about a rotated image, which is confusing to debug if you don't check this first.
6. **Treating a hedge or refusal as a usable answer** — downstream code that stores "I cannot tell from this image" as if it were a real value propagates a non-answer as data.
7. **Skipping a real evaluation set** — a prompt that looks great on cherry-picked demo photos routinely fails on the long tail of real user uploads (poor lighting, blur, unusual angles, occlusion).
8. **Trusting volunteered coordinates as pixel-accurate** without checking whether the specific model/API documents and benchmarks that capability.
9. **Not versioning prompts and models together** — an unannounced model upgrade can shift vision-task behavior more than an equivalent text-task upgrade would, because vision outputs are more resolution- and version-sensitive.
10. **Reaching for a VLM for every vision problem**, including ones a small, cheap, well-evaluated specialized model (see the **CNNs** and **OCR** skills) would handle more precisely and far more cheaply at scale.
`,

  "common-errors": `
| Error / Symptom | Typical Cause | Fix |
|---|---|---|
| Model answers confidently but is factually wrong about fine detail | Resolution/detail tier too low for the task, detail was never visible to the model | Raise resolution tier for this task type; re-test against the golden set |
| API rejects the request with an invalid image error | Malformed base64 encoding, unsupported file format, or file exceeds size limit | Validate format/size server-side before sending; confirm base64 encoding is correct and includes the right MIME prefix |
| JSON parsing fails on the model's response | Response format not constrained (no JSON mode used), or model added commentary around the JSON | Use the API's structured/JSON output mode; add an explicit "return ONLY valid JSON" instruction as a second layer of defense |
| Answer is oddly about a sideways or upside-down scene | EXIF orientation not applied before sending the image | Normalize image orientation using EXIF metadata during preprocessing, before resize/encode |
| Costs are far higher than expected at scale | Full, uncompressed, high-resolution images sent by default regardless of task need | Introduce an explicit per-task resolution-tier policy; measure and cap image dimensions before encoding |
| Model refuses or hedges heavily on a seemingly normal image | Ambiguous, low-quality, or policy-sensitive image content; overly strict system instructions | Review the actual image and prompt together; add a documented fallback path rather than treating the hedge as an application bug |
| Count/measurement task is inconsistent across near-identical repeated calls | Fundamentally weak task for a VLM (dense counting, precise measurement), not a prompt bug | Route the subtask to a specialized detection/measurement model; use the VLM only for qualitative commentary |
| Grounding coordinates don't align with the actual object location | Model/API does not document pixel-accurate grounding for this task, or coordinates were never a first-class supported feature | Verify the vendor's documented grounding capability for this exact model version; fall back to a dedicated detector if precision matters |
`,

  faqs: `
**Q: Can I just ask a VLM to count objects in a photo and trust the number?**
A: Only for small, visually distinct counts on clear images — for anything dense, occluded, or business-critical, route counting to a dedicated detection model and treat the VLM's number as an estimate at best (see Advanced Concepts and Common Mistakes).

**Q: Is base64 or URL image input better?**
A: Use base64 for local files, user uploads not yet hosted anywhere, or when you don't want the provider fetching an external URL; use URL input when the image is already reachable at a stable, provider-accessible location and you want to avoid re-encoding overhead on your own service.

**Q: How much does resolution actually matter for cost?**
A: A lot — resolution/tiling directly drives image-token count, and image tokens frequently dominate the total cost of a vision-enabled request; always test the lowest resolution tier that still preserves the detail your specific task needs (see Intermediate Concepts and Performance).

**Q: Do I still need OCR if I have a VLM?**
A: Often yes for anything requiring reliable, precise text extraction at scale (dense documents, specific field extraction with tight accuracy requirements) — see the **OCR** skill; a VLM can read text reasonably well in many cases but a dedicated OCR pipeline is typically more precise, faster, and cheaper for high-volume, accuracy-critical text extraction.

**Q: How do I handle video with a VLM?**
A: At a conceptual level, sample a set of representative still frames (uniform, scene-change, or task-driven sampling — see Advanced Concepts) and send them as a sequence of images; for architectures that natively model motion and temporal relationships rather than independent frames, see the **Video Models** skill.

**Q: Which VLM is "best"?**
A: There is no durable, universal answer — capability, cost, and quality rank differently by task (captioning vs VQA vs document understanding vs grounding) and change with every model release from every vendor; benchmark your own task against your own golden evaluation set rather than trusting a general leaderboard claim, and re-verify against current documentation before committing to one vendor at scale.

**Q: Can a VLM read handwriting or dense small text reliably?**
A: It varies significantly by model, resolution setting, and image quality, and is generally one of the harder tasks for this architecture family — test on your actual hardest real examples, and consider a dedicated OCR pipeline if reliability at scale matters more than flexibility.

**Q: Is it safe to let a VLM's description of an image drive an automated action?**
A: Only with validation in between — treat any VLM output as untrusted input to your system, the same way you'd treat user-submitted text, especially since text embedded in an image can function as a prompt-injection vector (see Security).
`,

  "interview-questions": `
**Junior level**

1. *What is a vision-language model, and how is it different from a traditional image classifier?*
   Model answer: a classifier outputs one of a fixed set of trained labels; a VLM accepts an image plus an open-ended natural-language prompt and generates a free-text (or structured) response, able to answer arbitrary questions about the image rather than only the specific classes it was trained on.

2. *What are the two common ways to pass an image to a multimodal LLM API?*
   Model answer: base64-encoded image data embedded directly in the request, or a URL the provider fetches — base64 for local/unhosted images, URL when the image is already reachable at a stable location.

3. *Name the three classic vision-understanding tasks discussed on this page.*
   Model answer: captioning (describe the image), visual question answering / VQA (answer a specific question), and grounding/localization (identify where something is, e.g. bounding boxes).

4. *Why does image resolution affect API cost?*
   Model answer: higher resolution/detail settings require more image tokens (often via tiling the image into chunks that are each separately encoded), and providers bill per token, so resolution is a direct cost lever, not just a quality one.

**Senior level**

5. *Explain, at a level suitable for a design review, how an image becomes something a language model can "attend to."*
   Model answer: describe the LLaVA-style pattern — a vision encoder (often ViT/CLIP-based) turns the image into patch embeddings, a projection layer maps those into the LLM's token embedding space, and the resulting image tokens are spliced into the input sequence so the LLM's existing self-attention mechanism processes image and text tokens together; hedge that this is one well-documented architecture family, not a universal claim about every commercial model's internals.

6. *Why are VLMs structurally weak at exact counting, and what's the correct production fix?*
   Model answer: the model reasons over a fixed, relatively coarse set of image tokens via learned pattern association, with no explicit enumeration mechanism, so accuracy degrades with density/occlusion; the fix is architectural, not prompt-level — route counting to a dedicated detection model and use the VLM only for qualitative commentary on the result.

7. *How would you estimate and control cost for a vision feature expected to process millions of images a month?*
   Model answer: define a resolution-tier policy per task type based on the minimum detail needed, cache on image+prompt+model version, route precision subtasks to cheaper specialized models, monitor image-token consumption specifically (not just overall spend), and use batch/async pricing tiers where the workload tolerates non-synchronous processing.

8. *How do you evaluate a vision-AI feature before shipping a prompt change?*
   Model answer: maintain a golden evaluation set of real, hard images (not cherry-picked ones) with known-correct or acceptable-range answers, score every prompt/model/resolution change against it, slice evaluation by known weak spots (dense objects, small text, poor lighting), and canary any change against production traffic before a full rollout.

9. *What's the security concern specific to sending images to a multimodal API, beyond generic file-upload risks?*
   Model answer: text rendered inside an image can function as a prompt-injection vector if the model treats it as instructions rather than content to describe; URL-based image input can also introduce SSRF risk if your own backend performs the fetch on a caller's behalf.

10. *When would you choose a specialized CNN-based detector over a general VLM, and vice versa?*
    Model answer: choose a specialized detector when the task needs guaranteed precision at scale (exact counts, coordinates, or classifications with a known label set) and cost/latency at high volume matters; choose a VLM when the task is open-ended, requires language reasoning combined with perception, or the label space isn't known in advance — and compose both when a task needs both properties.
`,

  "coding-questions": `
### Problem 1: Structured extraction with validation and retry

Write a function that sends an image to a vision-capable LLM, requests structured JSON matching a schema, validates the result, and retries once with a stricter instruction if parsing or validation fails.

~~~python
import json
import base64
from dataclasses import dataclass

@dataclass
class ExtractionResult:
    vendor: str | None
    total_amount: float | None
    currency: str | None

def extract_receipt(client, image_bytes: bytes, max_attempts: int = 2) -> ExtractionResult:
    """
    Extract structured fields from a receipt image, with one retry
    using a stricter prompt if the first attempt fails to parse or validate.

    Complexity: O(1) API calls in the common case, O(max_attempts) in the worst case.
    The real cost driver is image-token size, not this function's own logic.
    """
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    base_prompt = (
        'Extract vendor, total_amount, and currency from this receipt. '
        'Return ONLY JSON: {"vendor": string|null, "total_amount": number|null, "currency": string|null}'
    )

    last_error: Exception | None = None
    for attempt in range(max_attempts):
        prompt = base_prompt if attempt == 0 else (
            base_prompt + " Return valid JSON ONLY, with no markdown formatting or extra text."
        )
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                    ],
                }],
                response_format={"type": "json_object"},
                timeout=30,  # production calls must never hang indefinitely
            )
            raw = response.choices[0].message.content
            data = json.loads(raw)

            # Validate shape and basic plausibility, not just that JSON parsed.
            total = data.get("total_amount")
            if total is not None and (not isinstance(total, (int, float)) or total < 0):
                raise ValueError(f"implausible total_amount: {total!r}")

            return ExtractionResult(
                vendor=data.get("vendor"),
                total_amount=total,
                currency=data.get("currency"),
            )
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            last_error = e
            continue  # try again with the stricter prompt, if attempts remain

    raise RuntimeError(f"Failed to extract structured data after {max_attempts} attempts: {last_error}")
~~~

Follow-ups: how would you change this to fall back to a second vendor/model on a timeout? (Wrap the loop in an outer try/except that swaps the client and model on failure, logging which path served the response.) How would you unit test this without calling a real API? (Inject a fake client whose create() method returns canned responses, including a deliberately malformed one to exercise the retry path.)

### Problem 2: Resolution-aware image preprocessing

Write a function that resizes an image to the correct dimensions for a given resolution tier, preserving aspect ratio, before it is base64-encoded and sent to a vision API.

~~~python
from PIL import Image
import io

RESOLUTION_TIERS = {
    "low_detail": 512,        # small flat token cost, coarse detail only
    "high_detail_1024": 1024, # tiled encoding, good general-purpose detail
    "high_detail_2048": 2048, # maximum detail, materially higher token cost
}

def resize_for_tier(image: Image.Image, tier: str) -> Image.Image:
    """
    Resize an image so its longer side matches the target tier's max dimension,
    preserving aspect ratio. Never upscales a smaller image (upscaling adds
    cost without adding real detail that wasn't already there).
    """
    if tier not in RESOLUTION_TIERS:
        raise ValueError(f"unknown resolution tier: {tier!r}")
    max_dim = RESOLUTION_TIERS[tier]

    longer_side = max(image.size)
    if longer_side <= max_dim:
        return image  # already small enough; do not upscale

    scale = max_dim / longer_side
    new_size = (round(image.width * scale), round(image.height * scale))
    return image.resize(new_size, Image.LANCZOS)  # LANCZOS: good quality for downscaling

def encode_for_api(image: Image.Image, fmt: str = "JPEG", quality: int = 85) -> bytes:
    """Encode to bytes ready for base64, controlling compression quality explicitly."""
    buffer = io.BytesIO()
    image.convert("RGB").save(buffer, format=fmt, quality=quality)
    return buffer.getvalue()
~~~

Complexity: O(pixels) for the resize operation itself, which is the dominant cost; encoding is linear in output size. Follow-ups: how would you decide the tier automatically per task rather than hardcoding it? (Attach a required tier to each task-type config, chosen and tested against the golden evaluation set, rather than inferring it from the image at runtime.) What happens if you always upscale small images "to be safe"? (You add token cost for detail that was never there to begin with — upscaling cannot recover information the original image didn't contain.)

### Problem 3: Frame sampling for a short video clip

Given a local video file, extract a fixed number of evenly-spaced frames to send to a VLM as a sequence of images.

~~~python
import cv2  # opencv-python

def sample_frames_uniform(video_path: str, num_frames: int = 6) -> list:
    """
    Extract num_frames evenly-spaced frames from a video file for VLM analysis.
    Returns a list of frames as numpy arrays (BGR, as OpenCV reads them).

    Production note: this uniform strategy can miss brief but important events
    between sampled frames — see Advanced Concepts for scene-change and
    task-driven alternatives when that risk matters for your use case.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise IOError(f"could not open video file: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        cap.release()
        raise ValueError("video reports zero frames; file may be corrupt")

    indices = [round(i * (total_frames - 1) / max(num_frames - 1, 1)) for i in range(num_frames)]
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        success, frame = cap.read()
        if success:
            frames.append(frame)
    cap.release()

    if not frames:
        raise RuntimeError("no frames could be extracted from the video")
    return frames
~~~

Complexity: O(num_frames) seeks, each roughly O(1) relative to video length for most codecs supporting random access. Follow-ups: how would you adapt sampling density near a known event timestamp? (Bias the indices list toward that timestamp instead of pure even spacing.) What's the token-cost implication of choosing num_frames=6 vs num_frames=20? (Roughly 3-4x more image-token cost, since each frame is billed independently like a separate image.)
`,

  "hands-on-labs": `
### Lab 1 (beginner): Build a basic image-describing endpoint

Build a small FastAPI service with one endpoint that accepts an uploaded image and returns a natural-language description from a vision-capable LLM. Deliverable: a working endpoint, a base64-encoding helper, and three manual test images (including one that should produce a hedge/uncertain response) with their outputs recorded. Skills exercised: basic multimodal API calls, image encoding, prompt writing.

### Lab 2 (intermediate): Structured extraction with validation

Extend Lab 1 (or start fresh) to extract structured JSON fields from a specific document type (a receipt, business card, or ID-style form using only non-sensitive test data), using JSON mode, with validation of returned values and a retry on malformed output. Deliverable: the extraction function, a small test suite (mirroring Coding Questions' Problem 1), and a written note on which fields the model gets wrong most often on your test images. Skills exercised: structured output, validation, error handling.

### Lab 3 (advanced): Resolution-tier cost/quality tradeoff study

Take a set of 15-20 real, varied test images for one task (e.g. reading small text on product labels). Run the same task prompt at low, medium, and high resolution tiers, recording accuracy against ground truth and the image-token cost for each tier. Deliverable: a short report (a table) showing the cost/accuracy tradeoff curve and a recommendation for which tier the task should use in production. Skills exercised: resolution/tiling tradeoffs, evaluation methodology, cost analysis.

### Lab 4 (production): Compose a VLM with a specialized detector

Build a small pipeline that uses a lightweight object detector (a pretrained model from the **CNNs** skill's transfer-learning pattern, or an off-the-shelf detection API) to count objects in an image precisely, then uses a VLM to generate a natural-language summary that references the exact count from the detector rather than asking the VLM to count itself. Deliverable: the orchestration code, a comparison of the VLM's own (unaided) count vs the detector's count on 10 test images demonstrating the accuracy gap, and monitoring hooks (latency, token cost) on both calls. Skills exercised: system composition, the VLM-plus-specialized-model pattern from Advanced Concepts, monitoring.
`,

  "real-projects": `
### Project 1: Visual support-ticket triage

Build a system that accepts a customer-submitted photo (e.g. a damaged product, an error screen, a broken device) alongside a text description, and produces a structured triage output: likely issue category, urgency estimate, and a suggested next step, with a confidence/hedge field the support team can use to route uncertain cases to a human. Engineering requirements: structured output with validation, a golden evaluation set built from real historical tickets (with PII redacted), monitoring for refusal/hedge rate, and a documented fallback for low-confidence cases. This is a strong portfolio project because it forces you to handle real ambiguity and imperfect user photos rather than clean demo images.

### Project 2: Accessible image-description assistant

Build a tool (web or mobile-oriented) that takes a photo and produces a rich, accessible natural-language description suited for a screen-reader-style use case, with adjustable detail level and an explicit "I'm not confident about X" behavior rather than confident guessing on ambiguous content. Engineering requirements: prompt patterns that reduce hallucination (describe-before-concluding, explicit uncertainty), resolution-tier selection tuned for text-in-image legibility, and a latency budget suitable for a responsive assistive tool. Directly comparable to real production accessibility tools (see Industry Examples), which makes this a credible, explainable interview portfolio piece.

### Project 3: Document/receipt data-extraction pipeline with a precision fallback

Build a pipeline that extracts structured fields from scanned documents or receipts, using a VLM for the general case and falling back to (or cross-checking against) a dedicated **OCR** pass for fields where exact character accuracy matters (amounts, dates, ID numbers). Engineering requirements: side-by-side comparison logic between the VLM's read and the OCR pass's read, a disagreement-resolution policy (e.g. trust OCR for numeric fields, trust the VLM for free-text fields), and a cost/accuracy report justifying the composition choice over either method alone. This project demonstrates the senior-level "compose, don't choose" pattern that recurs throughout this page.
`,

  "case-studies": `
### Be My Eyes / Be My AI

Be My Eyes, an app originally connecting blind and low-vision users with sighted volunteers over video, integrated a VLM-powered "Be My AI" feature to provide instant natural-language descriptions of a user's surroundings from a photo, without waiting for a human volunteer. **Lesson**: open-ended natural-language description is exactly the task VLMs are strongest at, and pairing it with a human-in-the-loop fallback (the original volunteer network) for cases the AI handles poorly is a template worth copying for any assistive or high-stakes vision feature.

### Early GPT-4V rollout and documented limitations

When GPT-4V and comparable early production VLMs launched, independent testing and vendor documentation both surfaced consistent weak spots — dense counting, precise spatial reasoning, and reliability on adversarial or unusual images — alongside genuinely strong open-ended description and reasoning capability. **Lesson**: even frontier vision-language models ship with well-documented, structural weaknesses that don't fully disappear with newer versions; a serious production integration reads the vendor's own limitations documentation rather than inferring capability purely from marketing demos.

### E-commerce visual search and cataloging

Multiple e-commerce and marketplace platforms have layered VLM-based description/cataloging on top of existing CNN-based visual search and embedding systems (see the CNNs skill's Industry Examples) rather than replacing them — using the VLM to generate human-readable listing text and moderation flags, while keeping embedding-based nearest-neighbor search (a CNN/ViT-lineage technique) for the actual "visually similar products" retrieval, which needs speed and consistency a general VLM call is not well suited to provide at that volume. **Lesson**: production systems very often layer a VLM on top of an existing, more specialized vision stack rather than replacing it outright — the "compose, don't choose" pattern again.

### Content moderation at scale

Several platforms have explored VLMs as a flexible second-pass reviewer for content flagged by faster, cheaper, purpose-built classifiers — using the VLM's language reasoning to adjudicate ambiguous or borderline cases a narrow classifier can't confidently resolve, rather than running every piece of content through the more expensive VLM call. **Lesson**: cost-aware production systems reserve the more expensive, more flexible model for the subset of cases that actually need that flexibility, funneling the high-volume, clear-cut majority through a cheaper specialized model first.
`,

  comparisons: `
| Approach | Strength | Weakness | When a senior engineer picks it |
|---|---|---|---|
| General multimodal LLM (VLM) API | Open-ended questions, no fixed label set, combines perception with reasoning and world knowledge | Weaker at exact counting/measurement, higher per-call cost, less control over failure modes | Product needs flexible, evolving, or hard-to-enumerate visual questions, and some quality variance is acceptable |
| Dedicated CNN classifier/detector | Fast, cheap at scale, precise for its trained label set, well-understood evaluation | Fixed label set, needs labeled training data and retraining for new categories | Task has a stable, well-defined label/category set and needs precision or high-volume low-cost inference (see the **CNNs** skill) |
| Dedicated OCR pipeline | High accuracy on text extraction specifically, mature tooling, cheaper at volume than a general VLM for pure text reading | Only solves text extraction, not broader visual reasoning | Task is specifically "get exact text out of this image" at meaningful volume (see the **OCR** skill) |
| Self-hosted open-weight VLM | Full control, no per-call vendor cost, data stays in-house | Requires GPU infrastructure, serving/ops expertise, and generally lags frontier closed models on some benchmarks (verify current state) | Data residency/privacy requirements prohibit sending images to a third-party API, or volume is high enough that self-hosting is cheaper than API cost |
| Composed pipeline (VLM + specialized model) | Gets flexibility where needed and precision where needed | More engineering complexity, two systems to maintain and evaluate | Task genuinely needs both — precision on a subtask (count, exact text) plus flexible reasoning/summarization on top (the pattern recommended throughout this page) |

### How seniors actually choose

The decision rarely starts with "which model is best" — it starts with "does this specific subtask need guaranteed precision, or does it need flexible language-level reasoning over open-ended visual content." Precision-critical, well-defined subtasks go to a specialized model; everything else, and the layer that ties precise outputs together into a useful response, goes to a VLM. Cost and data-residency constraints then decide hosted-API vs self-hosted for whichever component uses a large model. Treat any specific "model X beats model Y" claim as perishable — benchmark your own task, because relative rankings shift with nearly every model release.
`,

  "related-technologies": `
- **CNNs** — the architectural lineage behind most vision encoders (including the ViT variant used inside many VLMs); read this first if the encoder half of Internal Working feels unfamiliar.
- **Transformers** and **Attention** — the architectural lineage behind the language-model half of every VLM, and the mechanism that lets image and text tokens interact; essential background for Internal Working and Advanced Concepts.
- **OCR** — a narrower, often more precise sibling task specifically for extracting text from images; frequently composed with a VLM rather than replaced by one (see Comparisons and Real Projects).
- **Image Generation** — the inverse direction of this page's subject: producing a new image from text (or an image), rather than understanding an existing one; shares some architectural ancestry (CLIP-style joint embeddings) but is a distinct model family and task.
- **Video Models** — the sibling skill for architectures that natively model motion and temporal structure, rather than the frame-sampling approach this page covers at a conceptual level; go there for anything beyond "which still frames do I send."
- **Prompt Engineering** — the general prompting techniques (few-shot, chain-of-thought-style reasoning, structured output) that this page's vision-specific prompting patterns build directly on top of.
- **Vector Search** — the retrieval technique that pairs naturally with CNN/CLIP-style image embeddings for visual similarity search, often used alongside (not instead of) a VLM in production vision systems.

Suggested learning path: **CNNs** → **Transformers**/**Attention** → **Vision AI** (this page) → **OCR** and **Image Generation** (adjacent specialized tasks) → **Video Models** (temporal extension).
`,

  "latest-updates": `
This page's knowledge cutoff is January 2026, and vision-language model capability, pricing, and benchmark standings change frequently across every major vendor — treat any specific model name, price, or benchmark number here (or anywhere else) as something to re-verify against current vendor documentation before it drives a production decision.

Directionally, and stated with appropriate hedging: multimodal capability has moved from a distinguishing feature to close to a table-stakes expectation across frontier model families, video understanding via longer native context windows (rather than only manual frame sampling) has been an active area of vendor investment, and open-weight VLMs have continued narrowing the gap with closed models on many public benchmarks, though closed frontier models have generally continued leading on the hardest reasoning-plus-vision tasks as of this page's cutoff. Grounding/localization precision, historically one of the weaker areas, has also been an active area of improvement across vendors — check each vendor's current documentation for what is explicitly benchmarked and supported before relying on it. For anything time-sensitive (current pricing, current best-in-class model for a specific task, current documented limitations), verify with a live web search or the vendor's own current docs rather than trusting this page's specifics as durable.
`,

  "future-roadmap": `
Several directions look likely to matter for an AI engineer investing career time here, stated as reasoned expectation rather than certainty:

- **Native video and audio understanding** (rather than manual still-frame sampling) is likely to keep improving and become a more standard, lower-friction API capability, gradually shrinking the gap between "Vision AI" as covered here and the specialized video architectures in the **Video Models** skill.
- **Grounding and spatial precision** are an active investment area across vendors precisely because they're a well-known current weak point; expect continued, uneven improvement here rather than a single decisive breakthrough — verify current documented capability per model rather than assuming yesterday's limitation still holds.
- **Agentic use of vision** (a model looking at a screenshot to decide its next UI action, a robot using vision to plan a physical action) is a growing production pattern that stresses different qualities (fast, reliable, low-latency perception feeding a decision loop) than open-ended chat-style image description does, and is likely to drive continued investment in cheaper, faster vision-capable models alongside the largest, most capable ones.
- **Composition patterns** (VLM plus specialized CV model) are likely to remain the mature production default for the foreseeable future rather than being fully displaced by an all-in-one model, because the underlying architectural reasons VLMs are weak at precise counting/measurement (see Advanced Concepts) are not obviously solved by scale alone.

What to bet career time on: understanding the composition pattern deeply (when to use a VLM, when to use a specialized model, how to combine them) will likely stay valuable regardless of which specific vendor or model leads next year, because it is a systems-design skill rather than a fact about any one model's current benchmark score.
`,

  "cheat-sheet": `
~~~text
VISION AI — ESSENTIALS

Core tasks:
  Captioning        -> free-text description of an image
  VQA               -> answer a specific question about an image
  Grounding         -> approximate location of an object (hedge: verify precision per model)

Sending an image (OpenAI-compatible shape):
  messages: [{
    role: "user",
    content: [
      {type: "text", text: "..."},
      {type: "image_url", image_url: {url: "data:image/jpeg;base64,<...>"}}  // or a plain URL
    ]
  }]

Resolution/detail tiers (illustrative — verify current vendor docs):
  low    -> flat, small token cost, coarse detail only
  high   -> tiled, cost scales with image size, needed for small text/fine detail

Cost lever priority order:
  1. Right-size resolution per task
  2. Reduce image count per request
  3. Cache on image+prompt+model version
  4. Batch async where possible
  5. Route precision subtasks to a cheaper specialized model

Prompting patterns:
  - "List what you see, then answer" -> reduces hallucination
  - "Only report what is directly visible; say so if unclear" -> reduces confident guessing
  - Ask for JSON with an explicit schema -> use response_format json mode where available
  - Few-shot with images for unusual/strict formats

Known weak points (verify per model/version, do not assume solved):
  - Exact counting, especially dense/occluded scenes
  - Precise measurement / exact coordinates
  - Small text, low light, motion blur, unusual angles
  - EXIF orientation if not normalized before sending

Composition rule of thumb:
  Precise count/coords/text -> specialized CNN/OCR model
  Flexible reasoning/summary -> VLM
  Both needed -> compose: specialized model for the number, VLM for the language

Video (conceptual):
  Sample frames (uniform / scene-change / task-driven) -> send as image sequence
  Deep temporal modeling -> see Video Models skill

Security reminders:
  - Text inside an image can be a prompt-injection vector -> treat VLM output as untrusted
  - URL image input -> validate against SSRF if your backend fetches it
  - Uploaded images can carry PII/EXIF location data -> handle per policy
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What is a VLM? | A model that accepts image and text input together and reasons/generates text (or structured output) over both. |
| What are the three classic vision tasks covered on this page? | Captioning, visual question answering (VQA), and grounding/localization. |
| What does the "detail"/resolution setting control? | How the image is resized/tiled before encoding, directly controlling both image-token cost and how much fine detail the model can actually see. |
| Why are VLMs weak at exact counting? | They reason over a fixed set of image tokens via learned pattern association, with no explicit enumeration mechanism — accuracy degrades with density/occlusion. |
| What is the LLaVA-style architecture pattern? | Vision encoder produces patch embeddings, a projection layer maps them into the LLM's token space, and the LLM attends over image and text tokens together. |
| Why should you not trust volunteered bounding-box coordinates by default? | Grounding precision is model/version-dependent and often not a benchmarked, guaranteed capability — verify before relying on it. |
| What is the biggest cost lever for a vision feature? | Resolution/detail tier — right-sizing it to the minimum needed for the task, since image tokens often dominate total request cost. |
| What prompting pattern reduces hallucination on vision tasks? | Asking the model to list what it observes before concluding, and to explicitly flag anything unclear rather than guessing. |
| Why use structured/JSON output modes instead of regex-parsing free text? | More reliable shape guarantees; free-text parsing breaks silently when phrasing shifts, e.g. after a model update. |
| What's the "compose, don't choose" pattern? | Use a specialized CNN/OCR model for precision-critical subtasks (count, coordinates, exact text) and a VLM for flexible reasoning/summary on top, rather than relying on one approach for everything. |
| How does video get handled at a conceptual level? | By sampling representative still frames (uniform, scene-change, or task-driven) and sending them as an image sequence; deep temporal modeling is a separate, sibling topic. |
| What EXIF-related bug commonly causes wrong-seeming answers? | Orientation metadata not applied before sending, so the model reasons about a sideways/upside-down image without anyone realizing. |
| What is a prompt-injection risk specific to image input? | Text rendered inside the image can be interpreted as instructions rather than content to describe — treat any extracted text as untrusted data. |
| Why should you never assume base64 image size is "free"? | Larger/more images and higher resolution directly and often substantially increase image-token count and therefore cost and latency. |
| What should you check before citing any specific vision-AI benchmark or "best model" claim? | Verify against current vendor documentation — rankings and capabilities change with nearly every model release. |
`,

  mcqs: `
**1. Why do VLMs typically struggle with exact object counting in dense scenes?**
A) They were never trained on any images containing multiple objects
B) They reason over a fixed set of image tokens via learned pattern association with no explicit enumeration mechanism
C) Counting is intentionally disabled by vendors for safety reasons
D) Image tokens cannot represent more than one object at a time

Answer: B — this is a structural consequence of the token-based attention architecture described in Internal Working and Advanced Concepts, not a training gap or an intentional restriction.

**2. What is the main practical effect of choosing a higher image resolution/detail tier?**
A) It only affects response latency, not cost
B) It increases image-token count, raising cost, and can reveal finer detail the model couldn't otherwise see
C) It has no measurable effect on either cost or quality
D) It always reduces cost because fewer tiles are needed

Answer: B — resolution/tiling directly drives image-token count (cost) and determines how much visual detail is available to the model at all (quality).

**3. In the LLaVA-style architecture, what does the projection layer do?**
A) Compresses the LLM's vocabulary to fit image data
B) Converts text tokens into image pixels
C) Maps image patch embeddings into the same vector space as the LLM's text token embeddings
D) Performs the final classification decision

Answer: C — this is the piece that lets image content be spliced into the LLM's input sequence so the existing self-attention mechanism can process it alongside text.

**4. Which task should you route to a dedicated CNN/detector rather than a general VLM?**
A) Writing an accessible description of a photo for a screen reader
B) Answering "does this look like a modern kitchen"
C) Getting an exact, reliable count of items on a warehouse shelf for an inventory decision
D) Summarizing what's happening in an image in a sentence

Answer: C — exact counts feeding a real decision need a specialized, evaluated detection model; the other tasks are open-ended language/reasoning tasks that play to a VLM's strengths.

**5. What is a prompt-injection risk specific to vision input?**
A) The model might refuse to answer questions about cartoons
B) Text rendered inside the image could be interpreted as instructions rather than content to describe
C) Base64 encoding always corrupts image data
D) Vision models cannot process JPEG files

Answer: B — because the model attends over image content the same way it attends over text, embedded text in an image is a real injection surface; treat model output derived from image text as untrusted data.

**6. What is the recommended way to handle a model's hedge ("I cannot clearly tell from this image")?**
A) Store it directly as the final answer value
B) Treat it as an explicit signal to route to a fallback path (retry, alternate model, or human review) rather than a valid answer
C) Ignore it and re-ask the exact same question until a confident answer appears
D) Discard the whole request silently with no logging

Answer: B — a documented fallback path for hedges/refusals is a production-checklist item precisely because silently accepting a hedge as data is a common, costly mistake.
`,

  "revision-notes": `
Vision AI, as covered on this page, means multimodal LLMs that accept images alongside text and reason over both in one model — GPT-4V/4o-class models, Claude's vision capability, Gemini's multimodal models, and open-weight families like LLaVA and Qwen-VL. The practically important architectural picture (one well-documented pattern, not a universal claim) is: a vision encoder turns an image into patch embeddings, a small projection layer maps those into the language model's own token space, and the resulting image tokens get spliced into the input sequence so the LLM's existing self-attention mechanism processes image and text together in one pass — there is no separate "vision decision" handed off to a "language module."

The three classic understanding tasks are captioning (describe), VQA (answer a specific question), and grounding/localization (find where something is, treated as approximate unless a specific model/API documents pixel accuracy). Practically, sending an image means adding an image content block (base64 or URL) alongside a text block in a chat message, and resolution/detail settings directly control both image-token cost and how much fine detail the model can physically see — right-sizing resolution per task is the single biggest cost lever, and an under-sized resolution silently degrades quality with no visible error.

The most important limitation to internalize is that VLMs are language-reasoning systems attending over a fixed, coarse set of image tokens, not calibrated measurement instruments — they are structurally weak at exact counting (especially dense/occluded scenes) and precise measurement/coordinates, and this weakness does not obviously disappear with a better prompt or a newer model version; it needs an architectural fix (route to a specialized detector) rather than a prompting fix. Prompting patterns that help across the board include asking the model to describe before concluding, being explicit about what counts as "visible," and using structured/JSON output modes rather than parsing free text.

Production engineering for vision features follows the same discipline as any ML-backed service — golden evaluation sets built from real, hard images, monitoring of image-token cost and refusal/hedge rate specifically, a documented fallback for uncertain answers, versioned and pinned prompts/models, and security attention to image-borne prompt injection, SSRF via URL inputs, and PII in uploaded photos. The mature senior pattern is composition, not exclusive choice: use a specialized CNN-based detector or OCR pipeline for anything needing guaranteed precision, and a VLM for the flexible, open-ended reasoning layer on top — this composition pattern, more than any single model's benchmark score, is the durable skill worth building here.

Video is covered only conceptually: extract representative still frames (uniform, scene-change, or task-driven sampling) and treat them as an image sequence, with each frame adding its own token cost; deep, native temporal modeling is the subject of the sibling **Video Models** skill. This page's knowledge cutoff is January 2026 — verify any specific model name, price, or benchmark claim against current vendor documentation before it drives a real decision, since this field's specifics change fast even when its underlying architecture and tradeoffs stay stable.
`,

  "learning-roadmap": `
**Week 1 — Foundations and first calls.** Read Overview through Prerequisites. Make your first vision API call (Beginner Concepts) with both base64 and URL image input. Milestone: a working script that sends an image and prompt and prints a text response.

**Week 2 — Core tasks and resolution tradeoffs.** Work through Beginner and Intermediate Concepts. Complete Hands-on Lab 1 (basic describing endpoint) and Lab 3 (resolution-tier cost/quality study). Milestone: a small report showing how accuracy and cost change across resolution tiers on your own test images.

**Week 3 — Structured output and production patterns.** Read Advanced Concepts, Internal Working, and Architecture. Complete Lab 2 (structured extraction with validation) and Coding Question 1. Milestone: a validated JSON-extraction function with a retry path and a small test suite.

**Week 4 — Composition, testing, and operations.** Read Production Usage through Security, Testing through Common Errors. Complete Lab 4 (compose a VLM with a specialized detector) and Coding Question 2. Milestone: a working composed pipeline with a written comparison of VLM-alone vs detector-assisted accuracy.

**Week 5 — Practice, review, and portfolio.** Work through Interview Questions, Coding Question 3 (frame sampling), and one Real Project end to end. Revisit Cheat Sheet, Flash Cards, and MCQs until they feel automatic. Milestone: one portfolio-grade project (from Real Projects) deployed or demoed, with a golden evaluation set and monitoring in place.

Once this roadmap is complete, the natural next platform skill is **Video Models** — it picks up exactly where this page's conceptual frame-sampling coverage leaves off, going deep on architectures that natively model motion and temporal structure rather than treating video as a set of independent images.
`,

  "official-docs": `
- OpenAI's vision/image-input documentation for the Chat Completions and Responses APIs — the canonical reference for message content shapes, resolution/detail settings, and current supported models; verify exact parameter names and pricing here, as they evolve.
- Anthropic's Claude documentation on vision/image inputs — covers supported image formats, size limits, and message content block shapes for Claude's vision capability.
- Google's Gemini API documentation on multimodal input — covers image and video input handling, including native long-context video support details.
- The LLaVA project's official repository and paper page — the most accessible primary source for the open-source vision-language architecture pattern described in Internal Working and Advanced Concepts.
- The CLIP paper and OpenAI's CLIP repository — foundational reading for the contrastive image-text pretraining idea that underlies most modern VLM image encoders.

Always check the "last updated" date and version notes on vendor docs specifically for vision/multimodal features — this is one of the fastest-moving parts of each vendor's API surface.
`,

  books: `
- **"Deep Learning" by Goodfellow, Bengio, and Courville** — no VLM-specific content (predates the field), but the CNN and representation-learning chapters are the load-bearing background for understanding vision encoders.
- **"Dive into Deep Learning" (Zhang, Lipton, Li, Smola, free online)** — has practical, code-first chapters on both CNNs and Transformers/attention, useful for shoring up the two architectural halves this page assumes.
- **"Natural Language Processing with Transformers" by Tunstall, von Werra, and Wolf** — strong on the Transformer/attention side that powers the language half of every VLM, even though its focus is text.
- **"Designing Machine Learning Systems" by Chip Huyen** — not vision-specific, but the best available treatment of the production ML-systems discipline (evaluation, monitoring, data drift) this page applies specifically to vision features.
- There is, as of this page's knowledge cutoff, no single canonical textbook devoted specifically to vision-language models the way there are for CNNs or Transformers individually — the fastest-moving, most current material is in the papers and vendor docs listed in Research Papers and Official Documentation; treat this gap honestly rather than recommending a book that doesn't exist.
`,

  blogs: `
- **OpenAI's official blog and developer changelog** — for GPT-4V/4o-class vision capability announcements and API changes, high-signal and primary-source.
- **Anthropic's blog and release notes** — for Claude's vision capability updates and usage guidance.
- **Google DeepMind's blog** — for Gemini multimodal capability announcements, including video-understanding updates.
- **Hugging Face's blog** — frequently publishes accessible technical explainers on open-weight VLM releases (LLaVA-NeXT, Qwen-VL, InternVL, and others) with architecture summaries.
- **Lil'Log (Lilian Weng's blog)** — historically excellent, technically deep explainer posts on multimodal and vision-language modeling topics, worth checking for a rigorous treatment of the architecture landscape.

Prefer primary vendor sources and well-known technical bloggers with a track record over unattributed aggregator content for anything claiming a specific benchmark number or capability — this space attracts a lot of low-signal, marketing-driven summary content.
`,

  "research-papers": `
This area's research literature is real but comparatively young relative to CNNs or core Transformers, and the fastest-moving current work is often published as vendor technical reports rather than traditional peer-reviewed papers. Foundational and closest-adjacent reading:

- **"Learning Transferable Visual Models From Natural Language Supervision" (CLIP, Radford et al., 2021)** — the contrastive image-text pretraining approach underlying most modern VLM image encoders; arguably the single most load-bearing paper for this whole page.
- **"An Image is Worth 16x16 Words" (Vision Transformer / ViT, Dosovitskiy et al., 2020)** — the patch-embedding idea that vision encoders in most VLMs are built on; see also the **CNNs** skill's treatment of ViT.
- **"Flamingo: a Visual Language Model for Few-Shot Learning" (Alayrac et al., 2022, DeepMind)** — an influential large-scale VLM architecture using cross-attention to fuse vision and language, a useful contrast to the simpler linear-projection LLaVA-style pattern.
- **"Visual Instruction Tuning" (LLaVA, Liu et al., 2023)** — the paper behind the LLaVA architecture and training recipe used as the primary reference architecture in Internal Working and Advanced Concepts.
- **"Show and Tell: A Neural Image Caption Generator" (Vinyals et al., 2015)** — the historical CNN-encoder-plus-RNN-decoder ancestor of modern VLM captioning, useful for appreciating how far the field has moved.

For anything more recent than this page's knowledge cutoff (January 2026), verify with each vendor's own technical report or a current literature search — closed-model technical reports (where published at all) are often the primary source for a given frontier model's specific training and architecture choices, more so than traditional conference papers.
`,

  videos: `
- **Andrej Karpathy's deep-learning and neural-network explainer videos** — not VLM-specific, but his intuition-building style is the best available on-ramp for the attention/Transformer mechanics this page's Internal Working section assumes.
- **Two Minute Papers (YouTube channel)** — short, accessible summaries of individual vision-language model papers as they're published; good for staying current without reading every paper in full.
- **Yannic Kilcher's paper-review videos** — deeper, more critical technical walkthroughs of specific VLM papers (CLIP, Flamingo, LLaVA-style work), useful once you want more than a surface summary.
- **Official vendor developer conference talks** (OpenAI DevDay, Google I/O, Anthropic developer sessions) — for concrete, current API capability walkthroughs rather than pure research explanation; check for the most recent year's talk specifically, since capability claims shift fast.
- **Hugging Face's own YouTube content** — frequently walks through open-weight VLM releases with runnable code, complementing their blog posts.

As with blogs, prefer channels with a demonstrated technical track record over general AI-hype content for anything claiming a specific capability or benchmark result.
`,

  "github-repos": `
- **haotian-liu/LLaVA** — the reference implementation of the LLaVA architecture and training recipe discussed throughout Internal Working and Advanced Concepts; the best hands-on way to see the vision-encoder-plus-projection-plus-LLM pattern in real code.
- **openai/CLIP** — the original CLIP implementation; useful for understanding the contrastive pretraining step that underlies most VLM image encoders.
- **QwenLM/Qwen-VL** — a well-documented, actively maintained open-weight VLM family with strong multilingual and document-understanding support.
- **huggingface/transformers** — includes multiple VLM architectures (LLaVA, BLIP-2, and others) with a consistent, well-documented Python interface, good for experimentation without building from scratch.
- **haotian-liu/LLaVA's evaluation scripts / lmms-eval (EvolvingLMMs-Lab)** — standardized multimodal model evaluation harnesses, useful as a reference for building your own golden-set evaluation pipeline.
- **opencv/opencv (via the opencv-python package)** — the standard library for the frame extraction and image preprocessing code shown in Beginner/Intermediate Concepts and Coding Questions.
- **Vision-CAIR/MiniGPT-4** — another widely referenced open-source VLM implementation, useful for comparing architectural choices against LLaVA's.

Star counts, activity levels, and which repos represent current best practice shift quickly in this space — check recent commit activity and open issues before treating any repo as the current state of the art.
`,

  "practice-problems": `
Ordered by the skill they primarily exercise:

1. **API integration basics**: write a function that sends an image (from a local file) and a text question to a vision-capable API and returns the plain-text answer, with a timeout and one retry on transient failure.
2. **Resolution-tier tuning**: given a folder of test images and a fixed task prompt, measure and plot accuracy against image-token cost across three resolution settings.
3. **Structured extraction**: implement the JSON-extraction-with-validation pattern from Coding Question 1 for a document type of your choosing, including a test suite with at least one deliberately malformed model response.
4. **Prompting for grounding reduction**: take a task prone to hallucination (an ambiguous or cluttered photo) and empirically compare a naive prompt vs a "list what you see, then answer" prompt on a small test set, recording which produces fewer confidently-wrong answers.
5. **Composition pipeline**: implement the VLM-plus-specialized-detector pattern from Hands-on Lab 4 for a counting task, and quantify the accuracy gap between the VLM's own count and the detector-assisted result.
6. **Frame sampling**: implement and compare uniform vs scene-change frame sampling (Coding Question 3 as a starting point) on a short test video, evaluating which strategy better captures a known key event.
7. **External practice sets**: Hugging Face's model hub includes several public VQA and image-captioning benchmark datasets (e.g. VQAv2, COCO Captions) suitable for building your own small evaluation harness against a live API, letting you practice the golden-set evaluation methodology from Testing on realistic, previously-studied data.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client Layer
        Client["Client app\n(image upload)"]
    end

    subgraph Ingestion
        Gateway["API gateway:\nauth, rate limit,\nfile validation"]
        Preprocess["Preprocess:\nEXIF fix, resize to\ntask's resolution tier"]
    end

    subgraph Orchestration
        Router{"Task needs precise\ncount / coords / text?"}
        Specialized["Specialized CV model\n(CNN detector / OCR)"]
        VLM["Multimodal LLM API\n(vision-capable model)"]
    end

    subgraph Response Handling
        Parser["Parse + validate\nstructured output"]
        Cache["Cache\n(image hash + prompt + model version)"]
    end

    subgraph Operations
        Monitor["Monitoring:\nlatency, image tokens,\nrefusal/hedge rate, drift"]
        Eval["Golden evaluation set\n(re-run on prompt/model change)"]
    end

    Client --> Gateway --> Preprocess --> Router
    Router -->|yes| Specialized --> VLM
    Router -->|no| VLM
    VLM --> Parser --> Cache --> Client
    VLM -.-> Monitor
    Monitor -.-> Eval
    Eval -.informs.-> Router
~~~

Every box maps to a page section: Ingestion to Production Usage and Security, Router/Specialized/VLM to Advanced Concepts' composition pattern and Architecture, Parser/Cache to Intermediate Concepts and Performance, and Monitor/Eval to Monitoring and Testing.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Vision AI))
    Core tasks
      Captioning
      Visual question answering
      Grounding / localization
    Architecture
      Vision encoder ViT/CLIP-lineage
      Projection into LLM token space
      Shared self-attention over image+text tokens
      LLaVA-style pattern hedge
    Sending images
      Base64 input
      URL input
      Resolution / detail tiers
      Multiple images per request
    Prompting patterns
      Describe before concluding
      Explicit uncertainty framing
      Structured JSON output
      Few-shot with images
    Known weak points
      Exact counting
      Precise measurement / coordinates
      Small text, low light, blur
      EXIF orientation bugs
    Video (conceptual)
      Uniform frame sampling
      Scene-change sampling
      Task-driven sampling
      Video Models sibling skill
    Production
      Cost: image tokens dominate
      Golden evaluation sets
      Monitoring: latency, hedge rate, drift
      Security: injection, SSRF, PII
    Composition pattern
      Specialized CNN/OCR for precision
      VLM for flexible reasoning
      Compose, don't choose
    Ecosystem
      CNNs prerequisite
      Transformers / Attention prerequisite
      OCR sibling
      Image Generation sibling
      Video Models sibling
~~~
`,
};

export default visionAi;
