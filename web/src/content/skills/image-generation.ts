import type { SkillContent } from "../types";

/**
 * Image Generation — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const imageGeneration: SkillContent = {
  overview: `
Image Generation, as this page treats it, means using diffusion-based generative models — accessed either through a hosted API (OpenAI's image models, Midjourney, Stability AI's Stable Diffusion family, Google's Imagen, Black Forest Labs' FLUX, and others) or a self-hosted open-weight checkpoint — to produce new images from a text prompt, an existing image, or a combination of both. This is the "text/image to image" direction of multimodal AI, the structural inverse of the **Vision AI** skill's "image to text" direction, and it is one of the fastest-moving, most commercially visible corners of applied AI: marketing teams generate ad creative, game studios generate concept art and textures, e-commerce platforms generate product photography variants, and consumer apps let users turn a selfie into a stylized avatar, all on top of the same small family of underlying techniques.

For an AI engineer, the practical significance is that "generate an image" is almost never a from-scratch model-training problem in a product context — it is an API-integration and prompt-engineering problem layered on top of infrastructure concerns that look a lot like any other external-service dependency: async job handling, retries, cost control, and — because generated images are a uniquely sensitive output type — content moderation and provenance tracking that have no equivalent in a typical text-generation feature. This page is deliberately application-focused: it explains diffusion models at the conceptual level an engineer needs to reason about behavior, cost, and failure modes, and defers the from-scratch mathematics of training a diffusion model (the forward/reverse SDE formalism, score matching, U-Net or diffusion-transformer architecture design) to the **Deep Learning** skill's diffusion-model-training content.

Key characteristics worth internalizing up front: modern image generation is dominated by diffusion models, which build an image through many small iterative refinement steps rather than producing pixels in one shot the way a classic GAN does; this iterative process is what gives diffusion models their now-familiar controllability (text conditioning, image conditioning, structural conditioning) but also their characteristic cost and latency profile — a single image can take seconds to tens of seconds of compute, quite unlike a single forward pass through a classifier. The other characteristic worth stating plainly up front, because it recurs throughout this page: image generation sits in a genuinely unsettled legal and ethical space around training-data licensing and output ownership, and a competent engineer needs to know that this is disputed territory, not a solved question with one correct answer (see Security and Common Mistakes).
`,

  history: `
Image generation's current diffusion-dominated era followed, and largely superseded, an earlier era dominated by Generative Adversarial Networks (GANs).

| Year | Milestone |
|------|-----------|
| 2014 | Generative Adversarial Networks (GANs) are introduced — a generator and a discriminator trained adversarially, producing the first practical deep-learning approach to realistic image synthesis. StyleGAN and its successors later push GAN-based face and object synthesis to striking quality. |
| 2015 | Deep Unsupervised Learning using Nonequilibrium Thermodynamics introduces the core idea behind diffusion models: learning to reverse a gradual noising process. Largely overlooked at the time relative to GAN progress. |
| 2020 | Denoising Diffusion Probabilistic Models (DDPM) revives and simplifies the diffusion approach, showing it can match or exceed GAN image quality with a more stable, easier-to-train objective — no adversarial min-max game, no mode collapse in the GAN sense. |
| 2021 | OpenAI's GLIDE and CLIP-guided diffusion techniques demonstrate text-conditioned diffusion generation at meaningfully higher fidelity, connecting diffusion models to the same CLIP-style text-image embedding alignment used in Vision AI (see the **Vision AI** skill's history section for CLIP's role there too). |
| 2022 | The field's breakout year: DALL-E 2, Imagen, Midjourney, and Stable Diffusion all ship within months of each other. Stable Diffusion's public release of model weights is a turning point — it moves diffusion-based image generation from "API you can only rent" to "model you can self-host, fine-tune, and modify," seeding an enormous open-source ecosystem (ControlNet, LoRA fine-tunes, custom checkpoints). |
| 2023 | ControlNet and related structural-conditioning techniques give diffusion models fine-grained control over pose, depth, and edge layout, not just text description. Midjourney and DALL-E 3 push prompt-following fidelity and aesthetic quality further; inpainting/outpainting workflows mature into mainstream product features (e.g. Adobe Firefly's Generative Fill). |
| 2024 | Diffusion Transformer (DiT) architectures (replacing the U-Net backbone with a Transformer, as used in Stable Diffusion 3 and related systems) become common, and text rendering inside generated images improves markedly compared to 2022–2023 models, though it remains an active weak point rather than a fully solved problem (see Common Mistakes). |
| 2025 and beyond | Image generation increasingly converges with video generation (extending a diffusion or diffusion-transformer approach across time, covered in the **Video Models** sibling skill) and with unified multimodal models that both understand and generate images in one system. Exact model names, benchmark claims, and which vendor leads on which quality dimension change quickly — this space moves fast enough that any specific "best model" claim should be treated as perishable; verify current state against each vendor's latest release notes. |

The throughline: image generation's history is the story of diffusion models displacing GANs as the dominant paradigm because diffusion's training objective is more stable and scales more predictably, then diffusion itself being made controllable (text conditioning, structural conditioning, editing) and, most recently, architecturally converging with the Transformer backbone that dominates the rest of modern AI.
`,

  "why-it-exists": `
Before diffusion-based text-to-image generation matured, producing a custom image meant one of three things: hiring a human illustrator or photographer, licensing stock photography that was never quite the right fit, or using much more limited generative techniques (GANs conditioned on a narrow class label, or simple image-editing filters) that could not follow an open-ended natural-language description of an arbitrary scene. None of these paths let a product or a single engineer generate an arbitrary, novel image on demand from a plain-English description in seconds.

Image generation exists to close that gap: it gives anyone who can describe a desired image in words (or provide a reference image) a way to produce a genuinely novel image matching that description, without commissioning original artwork or searching a stock library for an approximate match. The text-conditioning mechanism that makes this possible is the same conceptual move that made Vision AI possible in the opposite direction — aligning a text embedding space with an image representation space (originally via CLIP-style contrastive pretraining) — so that a model can be steered by language rather than only by a fixed class label the way early GANs were.

The other half of "why now" is architectural: diffusion models turned out to have a training objective (predict the noise added to an image at each step) that scales far more predictably and stably with data and compute than the adversarial GAN objective, which is notoriously prone to training instability and mode collapse (the generator collapsing onto a narrow set of outputs). That stability is what let the field scale image generation to internet-scale training data and produce the leap in quality and prompt-following seen in 2022's wave of models.
`,

  "problem-it-solves": `
Image generation solves several concrete problems that stock photography, manual illustration, and earlier generative techniques could not solve alone.

**1. On-demand, novel imagery matching an arbitrary description.** A marketing team needing "a golden retriever wearing sunglasses on a surfboard, retro poster style" no longer needs to find or commission that exact image — a well-crafted prompt can produce dozens of candidates in minutes. This collapses the cost and latency of visual content production for use cases where "close enough, fast" beats "exact, slow and expensive."

**2. Targeted editing without full recreation.** Inpainting (regenerating a masked region of an existing image) and outpainting (extending an image beyond its original borders) let a team fix, extend, or restyle part of an existing photo or artwork without recreating the whole thing or hiring a retoucher — see Beginner Concepts and Intermediate Concepts for the mechanics.

**3. Style and structural control beyond a text description's precision.** Text alone is an imprecise way to specify exact pose, layout, or composition. Structural conditioning techniques (ControlNet-style, covered in Advanced Concepts) and reference-image-based style transfer let a user pin down "this exact pose, but in this exact art style" in ways a text prompt alone cannot reliably express.

What image generation deliberately does **not** solve, and this needs to be stated plainly rather than discovered in production: it does not reliably render precise, legible text inside an image (see Common Mistakes and Advanced Concepts) — a genuinely hard problem for the pixel-level diffusion process to solve because rendering correct letterforms requires a kind of exactness the underlying denoising process was never specifically optimized to guarantee. It also does not resolve the licensing and copyright status of either the training data these models learned from or the images they produce (see Security) — that is a real, actively litigated and legislated question, not a settled one, and no responsible answer to "can I use this generated image commercially" is a flat yes or no independent of jurisdiction, specific model license terms, and your own legal counsel.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, at a conceptual level, how a diffusion model turns random noise into a coherent image through iterative denoising, and how text conditioning steers that process, without needing the full training-time mathematics.
2. Distinguish text-to-image generation, image-to-image transformation, inpainting, and outpainting, and choose the right one for a given product requirement.
3. Call an image generation API correctly for both synchronous and asynchronous (polling/webhook) generation patterns, and handle the resulting binary image data safely.
4. Write prompts that reliably control subject, style, composition, and negative constraints, and know the practical limits of prompt-only control.
5. Apply at least one structural conditioning technique (ControlNet-style) to control pose/layout/depth beyond what text description alone can specify.
6. Estimate the cost and latency profile of an image-generation feature at production volume, and design around it (queuing, caching, resolution/step tradeoffs).
7. Build a content-moderation step for generated OUTPUT, not just user-supplied input prompts, and explain why output moderation is a distinct requirement from input moderation.
8. Identify the known weak points of current-generation image models (precise text rendering, exact counting of small repeated objects, hands/anatomy in some model generations) and design a workflow that accounts for them rather than assumes them away.
9. Describe the current, genuinely unsettled state of copyright and licensing debate around generative image models, representing both major positions evenhandedly.
10. Compare major image-generation approaches and providers honestly, without overclaiming which is "best," and know how a senior engineer actually chooses one for a given task.
`,

  prerequisites: `
- **Required**: comfort calling a hosted API from application code (authentication, request/response handling, basic async job polling) — no different from the discipline covered in the **REST APIs** skill.
- **Required**: basic familiarity with prompting a text-based LLM (the same iterative "write a prompt, inspect output, refine" workflow from the **Prompt Engineering** skill transfers directly, with image-specific vocabulary layered on top).
- **Helpful**: the **Vision AI** skill, since it covers the CLIP-style text-image embedding alignment that underlies text conditioning here, and because the two skills are structural mirror images (image-to-text vs. text-to-image) worth understanding together.
- **Helpful**: the **Deep Learning** skill, for anyone who wants the training-time mathematics behind diffusion (forward/reverse noising process, the denoising network's training objective) that this page intentionally does not derive from scratch.
- **Not required but related**: the **Video Models** skill (diffusion techniques extended across time to generate video, a natural next step after this page), and the **Guardrails** and **Cost Optimization** skills, both of which this page's Production Usage, Security, and Performance sections draw on directly.
`,

  "beginner-concepts": `
### What a diffusion model actually does, conceptually

A diffusion model generates an image by starting from pure random noise and running many small "denoising" steps, each of which nudges the noisy canvas slightly closer to a coherent image consistent with a text prompt (or other conditioning signal). Think of it like a sculptor starting from a rough, noisy block and gradually refining it — except at every step the "sculptor" is a neural network that has learned, from millions of training examples, what a slightly-less-noisy version of a noisy image conditioned on a given piece of text should look like. This page treats that denoising network as a capability to condition and control (see Intermediate and Advanced Concepts); the internal architecture and training objective of the network itself are covered step by step in Internal Working, and the from-scratch mathematics is deferred to the **Deep Learning** skill.

The critical intuition to take away: nothing about this process copies pixels from any single training image directly into the output. The model has learned statistical patterns about what images (and image-text pairs) tend to look like across its whole training set, and generation is a genuinely new sample built by that learned denoising process — this distinction matters enormously for the copyright discussion in Security, where "does the model store and reproduce training images" and "did the model learn from copyrighted training images" are different, both relevant, and both actively debated questions.

### Your first text-to-image API call

~~~python
import requests

API_KEY = "your-api-key-here"  # load from a secrets manager in real code, never hardcode

def generate_image(prompt: str, size: str = "1024x1024") -> bytes:
    """Call a hosted image-generation API and return the raw image bytes."""
    response = requests.post(
        "https://api.example-image-provider.com/v1/images/generations",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"prompt": prompt, "size": size, "n": 1},
        timeout=60,  # image generation is slower than a typical text API call
    )
    response.raise_for_status()
    data = response.json()
    image_url = data["data"][0]["url"]
    image_bytes = requests.get(image_url, timeout=30).content
    return image_bytes

result = generate_image("A golden retriever wearing sunglasses on a surfboard, retro poster style")
with open("output.png", "wb") as f:
    f.write(result)
~~~

Note the shape: most providers return either a URL to a temporary hosted copy of the image or a base64-encoded blob directly in the JSON response — check your specific provider's documented response format, since this detail varies and code written against one shape will silently fail against the other.

### The three foundational operations

- **Text-to-image**: generate a wholly new image from a text description alone. This is what most people mean by "AI image generation" by default.
- **Image-to-image**: start from an existing image (instead of pure noise) and a text prompt, and generate a new image that keeps some structure/composition of the original while applying the prompt's requested changes — useful for style transfer or "make this sketch look photorealistic."
- **Inpainting / outpainting**: inpainting regenerates a masked region of an existing image (remove an object, replace a background) while keeping the rest untouched; outpainting extends an image beyond its original canvas, generating plausible new content that blends with the existing edges. Both are covered with code in Intermediate Concepts.

### Reading the response and handling failure

~~~python
def generate_image_safely(prompt: str) -> bytes | None:
    """Wrap the raw call with basic error handling — production code needs this,
    not just the happy path shown above."""
    try:
        return generate_image(prompt)
    except requests.exceptions.Timeout:
        print("Generation timed out — image APIs can be slow under load; consider a retry with backoff.")
        return None
    except requests.exceptions.HTTPError as e:
        # A 400 here often means the prompt was rejected by the provider's own input
        # content filter — inspect e.response.json() for the specific reason before retrying.
        print(f"Generation request failed: {e}")
        return None
~~~
`,

  "intermediate-concepts": `
### Prompting techniques that materially change output quality

Text-to-image prompting has its own vocabulary and structure, distinct from conversational LLM prompting, though the underlying discipline (be specific, iterate, inspect output) is the same one covered in the **Prompt Engineering** skill:

- **Subject, then style, then technical modifiers** is a common, effective prompt structure: describe WHAT is in the image first, then the artistic style ("oil painting," "photorealistic," "retro travel poster"), then technical camera/render modifiers ("85mm lens, shallow depth of field, soft studio lighting").
- **Negative prompts** (supported by many but not all providers/APIs) let you specify what should NOT appear — "no text, no watermark, no extra limbs" — a mechanism with no equivalent in text-only LLM prompting, since it directly suppresses a class of undesired content during the denoising process rather than merely asking politely.
- **Weighting and emphasis syntax** (provider-specific, e.g. parenthesizing or numeric weight annotations in some open-source tooling) can push the model to prioritize certain prompt terms over others when the plain prompt under-emphasizes something important.
- **Reference images alongside text** (where the API supports it) anchor style or composition more reliably than description alone — "generate in this exact art style" is often easier to achieve by attaching a reference image than by trying to describe the style in words precisely enough.

~~~python
def build_prompt(subject: str, style: str, modifiers: list[str], negative: list[str] | None = None) -> dict:
    """Assemble a structured prompt payload following the subject -> style -> modifiers pattern."""
    prompt = f"{subject}, {style}, {', '.join(modifiers)}"
    payload = {"prompt": prompt, "size": "1024x1024", "n": 1}
    if negative:
        # Not every provider supports a negative_prompt field — check your provider's docs;
        # some require negative concepts to be folded into the main prompt instead.
        payload["negative_prompt"] = ", ".join(negative)
    return payload

payload = build_prompt(
    subject="a small coastal town at dawn",
    style="watercolor illustration",
    modifiers=["soft pastel palette", "wide angle"],
    negative=["text", "watermark", "blurry"],
)
~~~

### Image-to-image transformation

~~~python
def transform_image(image_path: str, prompt: str, strength: float = 0.6) -> bytes:
    """Image-to-image: start from an existing image, apply a prompt-guided transformation.
    'strength' controls how much the output is allowed to diverge from the input —
    low strength keeps composition close to the original; high strength allows more change."""
    with open(image_path, "rb") as f:
        response = requests.post(
            "https://api.example-image-provider.com/v1/images/edits",
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"image": f},
            data={"prompt": prompt, "strength": strength},
            timeout=60,
        )
    response.raise_for_status()
    return response.content
~~~

The strength/denoising-amount parameter is the single most important image-to-image control to understand: it sets how many of the iterative denoising steps start from the original image's structure versus from scratch, so a low value preserves composition tightly (good for restyling while keeping layout) and a high value approaches pure text-to-image generation that merely used the input as a loose starting point.

### Inpainting: editing part of an image

~~~python
def inpaint_image(image_path: str, mask_path: str, prompt: str) -> bytes:
    """Inpainting: regenerate only the masked (typically white/transparent) region
    of the image according to the prompt, leaving the rest of the image untouched."""
    with open(image_path, "rb") as img_f, open(mask_path, "rb") as mask_f:
        response = requests.post(
            "https://api.example-image-provider.com/v1/images/inpaint",
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"image": img_f, "mask": mask_f},
            data={"prompt": prompt},
            timeout=60,
        )
    response.raise_for_status()
    return response.content
~~~

A mask is typically a same-dimension image where one color/alpha value marks "regenerate this area" and the rest marks "preserve exactly." Mask quality matters more than most teams expect on first use — a mask with a hard, unfeathered edge often produces a visible seam where generated and original content meet; many production inpainting pipelines feather the mask edge slightly to blend the transition.

### Outpainting: extending beyond the original canvas

Outpainting is inpainting's sibling operation: instead of masking an interior region, you place the original image on a larger canvas and mask the newly added border area, prompting the model to generate content that plausibly continues the scene. The same mask-quality and seam-blending considerations apply, and the model has no way to know what was "really" outside the original frame — it generates a plausible continuation, not a recovery of missing ground truth, which matters for any use case implying the outpainted content is factual (see Common Mistakes).

### Async generation and polling

Many providers treat image generation as an asynchronous job rather than a synchronous request/response call, especially for higher-resolution or batch requests:

~~~python
import time

def generate_async(prompt: str, poll_interval: float = 2.0, max_wait: float = 120.0) -> bytes:
    """Submit an async generation job and poll until it completes or times out."""
    submit = requests.post(
        "https://api.example-image-provider.com/v1/images/jobs",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={"prompt": prompt},
        timeout=30,
    )
    submit.raise_for_status()
    job_id = submit.json()["job_id"]

    waited = 0.0
    while waited < max_wait:
        status = requests.get(
            f"https://api.example-image-provider.com/v1/images/jobs/{job_id}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=30,
        )
        status.raise_for_status()
        body = status.json()
        if body["state"] == "completed":
            return requests.get(body["result_url"], timeout=30).content
        if body["state"] == "failed":
            raise RuntimeError(f"Generation job {job_id} failed: {body.get('error')}")
        time.sleep(poll_interval)
        waited += poll_interval

    raise TimeoutError(f"Generation job {job_id} did not complete within {max_wait}s")
~~~

A webhook-based completion notification (where the provider POSTs to your endpoint when done) is generally preferable to polling at production scale — it avoids the wasted request volume and latency of a polling loop — but polling is simpler to implement first and a reasonable fallback when webhook infrastructure isn't yet in place.
`,

  "advanced-concepts": `
### Iterative denoising and text conditioning, one level deeper (still application-focused, not training math)

The denoising process runs over a fixed number of steps (a hyperparameter you typically control per request — more steps generally means higher quality up to a point of diminishing returns, at a direct cost in latency and compute). At each step, the model predicts what noise to remove from the current canvas, and that prediction is conditioned on a text embedding derived from your prompt (via a text encoder, conceptually similar to the CLIP-style alignment covered in the **Vision AI** skill) so that the denoising trajectory is steered toward images consistent with that text, rather than toward an arbitrary plausible image. A technique called classifier-free guidance (present in most production systems, referred to by different parameter names like "guidance scale" or "CFG scale" across providers) controls how strongly the model weights the text conditioning versus how "free" the generation is to wander — higher guidance generally produces output that follows the prompt more literally, at some cost to naturalness or diversity if pushed too far. This page treats guidance scale as a tunable knob to reason about; the mechanism behind why it works is training-time detail deferred to the **Deep Learning** skill.

### ControlNet-style structural conditioning (hedged: one common approach among several)

A widely used and well-documented technique — popularized by ControlNet and echoed conceptually by other structural-conditioning approaches across the ecosystem, though exact implementations differ by provider and not every production API exposes this level of control — adds an auxiliary conditioning input alongside the text prompt: an edge map, a depth map, a pose skeleton, or a segmentation mask extracted from a reference image. The diffusion process is then steered to respect BOTH the text prompt's content and the structural conditioning's layout, giving control over composition, pose, and spatial arrangement that text description alone cannot reliably specify ("this exact pose, in this exact style" rather than approximating the pose in words).

~~~text
Illustrative structural-conditioning workflow (exact tooling/parameter names vary by
provider/library — verify current API surface before building against a specific one):

1. Extract a control signal from a reference image (e.g. an edge-detection pass,
   or a pose-estimation model producing a skeleton overlay).
2. Pass that control signal alongside your text prompt to a model/pipeline that
   supports structural conditioning.
3. The denoising process is steered to match the control signal's spatial layout
   while following the text prompt for content and style.
~~~

This is genuinely one technique among several in active use (other approaches include IP-Adapter-style image-prompt conditioning for style/subject consistency, and various fine-tuning-based approaches like LoRA for locking in a specific character or style). Treat "ControlNet-style" as a well-documented reference point for building intuition about structural conditioning as a category, not as a claim that every provider implements exactly this mechanism — verify against your specific provider's or library's current documentation before depending on a named technique being available.

### Style and subject consistency across multiple generations

A common production requirement — "generate ten images of the same character/product in different scenes" — is genuinely hard for a stateless, single-call diffusion API, because each generation call is independent unless you deliberately anchor it. Common approaches, none of them a complete solution on their own: reusing the same random seed across calls (nudges output toward similarity but does not guarantee it, especially with different prompts), attaching a consistent reference image via image-to-image or an image-prompt-adapter mechanism where the provider supports it, and fine-tuning a lightweight adapter (LoRA-style) on a small set of reference images of the specific character/product when the API/tooling supports custom fine-tunes. Evaluate this requirement early in a project, because "consistent character across many generations" is a materially harder and more expensive problem than "one good image from one prompt," and the right approach depends heavily on which provider and tooling you've committed to.

### Why precise text rendering remains a known weak point

Even in 2024–2025-generation models where text rendering improved substantially over 2022–2023 models, reliably rendering specific, correctly-spelled, legible text inside a generated image remains a weaker capability than the rest of the generation quality suggests it should be. The conceptual reason connects back to how diffusion models learn: they are optimized to produce visually plausible pixel patterns conditioned on a prompt, and correct letterforms require a kind of exact, discrete correctness (this exact sequence of characters, correctly spelled, correctly kerned) that is a much narrower target than "looks like a plausible painting" or "looks like a plausible photo." Treat any product requirement for precise in-image text (a specific product name on packaging mockups, a specific slogan on a poster) as something to verify empirically against your specific chosen model before committing to it as a workflow, and have a fallback plan (generate the image without text, then compositing exact text with conventional image-editing/typesetting tools) for cases where reliability matters — this is explored further in Common Mistakes.

### Composing generation with conventional image tooling (the senior pattern)

The mature production pattern for tasks needing both generative flexibility and pixel-level precision is not "generate everything with the model" — it's composing generation with conventional, deterministic image tooling: generate the creative/artistic content, then composite exact text, logos, or precisely-positioned elements using standard image libraries (Pillow, ImageMagick) or a design tool's API, exactly mirroring the "VLM for judgment, specialized model for precision" composition pattern covered in the **Vision AI** skill's Advanced Concepts, applied here in the opposite generation direction.
`,

  "internal-working": `
Here is what happens, step by step, when you send a text prompt to a text-to-image diffusion API (the conceptual pipeline shared across most current systems, whether U-Net-based like early Stable Diffusion or diffusion-transformer-based like more recent systems):

~~~mermaid
flowchart LR
    A["Text prompt"] --> B["Text encoder:\nprompt -> text embedding"]
    C["Random noise\n(starting canvas)"] --> D["Denoising network\nstep 1"]
    B --> D
    D --> E["Slightly less\nnoisy canvas"]
    E --> F["Denoising network\nstep 2..N"]
    B --> F
    F --> G["Fully denoised\nlatent representation"]
    G --> H["Decoder:\nlatent -> pixel image"]
    H --> I["Generated image\nreturned to caller"]
~~~

1. **Text encoding**: your prompt is passed through a text encoder (conceptually aligned with image representations the same way CLIP aligns text and image embeddings — see the **Vision AI** skill) producing a text embedding that will condition every subsequent denoising step.
2. **Noise initialization**: generation starts from a canvas of random noise (in most modern systems, this noise lives in a compressed "latent space" produced by a separate autoencoder, rather than raw pixel space — this is why the technique is often called "latent diffusion," and it is a major reason modern diffusion models are computationally tractable at all compared to running the full process in pixel space).
3. **Iterative denoising**: across a configurable number of steps (more steps generally trading latency for quality up to a point of diminishing returns), a trained denoising network predicts and removes a small amount of noise at each step, conditioned on the text embedding via a mechanism like classifier-free guidance (see Advanced Concepts) so the trajectory is steered toward images consistent with the prompt.
4. **Structural/reference conditioning (optional)**: if the request includes an existing image (image-to-image), a mask (inpainting/outpainting), or a structural control signal (ControlNet-style), that information is injected into the denoising process at each step alongside the text conditioning, constraining the trajectory further.
5. **Decoding**: once denoising completes, the final latent representation is passed through a decoder that reconstructs it into a full-resolution pixel image — the counterpart operation to the initial encoding step, and the reason latent-space diffusion needs both an encoder and decoder wrapped around the diffusion process itself.
6. **Post-processing and safety checks**: many production systems run an automated safety/moderation classifier on the output before returning it to the caller (see Security and Production Usage) — this is a distinct step from any input-prompt moderation the provider may also run, and both matter.

The critical mental model to take from this: nothing about this process is "look up the closest matching training image and return it" — every step operates on noise and gradually shapes it under the text (and optional structural) conditioning's steering influence, which is why outputs are genuinely novel combinations rather than retrieved training examples, even though the model's learned denoising behavior was shaped entirely by patterns in its training data — a distinction central to the copyright discussion in Security.
`,

  architecture: `
### Model architecture — recap and framing

The model-internal architecture (U-Net vs. diffusion-transformer backbones, the encoder/decoder pair around the latent diffusion process) is covered conceptually in Internal Working, with the full training-time mathematics deferred to the **Deep Learning** skill. At the system level, thinking about image generation means separating the **generation call** (submit a prompt/parameters, receive image bytes or a job handle) from the **application architecture** wrapped around it — where most engineering effort in a production feature actually lives.

### Application architecture — a production image-generation service

~~~text
image-gen-service/
├── pyproject.toml
├── src/image_gen/
│   ├── api/                       # FastAPI routes: /generate, /jobs/{id}, /health
│   ├── requests/
│   │   ├── validate.py            # prompt length/content checks, size/param validation
│   │   └── build_payload.py       # assembles provider-specific request payload
│   ├── provider/
│   │   ├── client.py              # wraps the vendor SDK/HTTP: retries, timeouts, fallback provider
│   │   └── async_jobs.py          # submit/poll or webhook-receive job completion
│   ├── moderation/
│   │   ├── input_check.py         # optional pre-generation prompt screening
│   │   └── output_check.py        # mandatory post-generation image content moderation
│   ├── storage/
│   │   └── persist.py             # store generated image + prompt + provenance metadata
│   ├── evaluation/                  # offline eval set for prompt-template regression checks
│   └── core/                        # config, logging, cost tracking
└── tests/
~~~

The most consequential architectural decision in an image-generation system is the **output moderation boundary**: every generated image should pass through an automated content-moderation check before it is stored or returned to a user, treated as a mandatory pipeline stage rather than an optional add-on — generated content carries different risk than user-uploaded content because the system itself produced it, and a provider's own input-side prompt filter is not a substitute for checking the actual output (see Security).

### Reference production architecture

~~~mermaid
flowchart TB
    Client["Client app\n(prompt + params)"] --> Gateway["API gateway:\nauth, rate limit,\nprompt validation"]
    Gateway --> Queue["Job queue\n(async generation)"]
    Queue --> Provider["Image-generation\nprovider API"]
    Provider --> Moderate["Output content\nmoderation check"]
    Moderate -->|flagged| Reject["Reject / hold for\nhuman review"]
    Moderate -->|clear| Store["Persist image +\nprovenance metadata"]
    Store --> Response["Response to client\n(webhook or poll result)"]
    Provider -.cost & latency.-> Monitor["Monitoring:\ngeneration cost, latency,\nmoderation flag rate"]
~~~
`,

  "data-flow": `
Tracing one request end to end, from a submitted prompt to a delivered image:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as API gateway
    participant Val as Request validation
    participant Q as Job queue
    participant Provider as Image-gen provider
    participant Mod as Output moderation
    participant Store as Storage

    Client->>API: POST /generate (prompt, size, params)
    API->>Val: validate prompt length, params, auth, rate limit
    Val->>Q: enqueue generation job
    Q->>Provider: submit generation request
    Provider-->>Q: job accepted (async job id)
    Provider->>Provider: iterative denoising (N steps)
    Provider-->>Mod: generated image
    Mod->>Mod: run content-moderation classifier
    Mod-->>Store: (if clear) persist image + metadata
    Mod-->>API: (if flagged) reject, log, route to review
    Store-->>Client: webhook or poll response with result URL
    Provider-.->API: log generation cost, latency, step count
~~~

Two details matter operationally: the moderation step happens AFTER generation but BEFORE the result reaches storage or the client — never let a generated image skip that gate on a fast path — and generation latency (often seconds, sometimes tens of seconds depending on resolution and step count) means most production designs treat this as an async job with a queue from the start, rather than retrofitting async handling after a synchronous design proves too slow under load.
`,

  "production-usage": `
### Tooling and integration patterns

Production image-generation features are typically built directly against a provider's REST API or official SDK (OpenAI's image endpoints, Stability AI's API, or a self-hosted Stable Diffusion/FLUX deployment served via a framework like ComfyUI or a custom inference service) — there is no dominant cross-vendor abstraction layer as mature as the ones that exist for text LLMs, so expect more provider-specific integration code than a typical text-generation feature requires.

~~~bash
uv add requests pillow
uv add --dev pytest
# Example: run a regression check of prompt templates against a fixed evaluation set
uv run python -m image_gen.evaluation.run_eval --dataset golden_prompts/
~~~

### Config and operational defaults

- **Resolution and step count per use case**: define an explicit policy (e.g. "thumbnail previews: lower resolution, fewer steps, fast and cheap; final hero images: full resolution, more steps") rather than always maximizing quality settings — both resolution and step count are direct, near-linear cost and latency levers.
- **Async-first design**: treat generation as a background job with a queue and either webhook callback or polling from day one, rather than blocking a request thread on a call that can take tens of seconds — this affects the whole request-handling architecture, not just this one endpoint.
- **Timeouts and retries**: set generous timeouts appropriate to observed provider latency, and use exponential backoff for transient failures, exactly as for any external API dependency — but be careful not to blindly retry a request that was rejected by the provider's own content policy, since retrying an identical rejected prompt will simply be rejected again.
- **Provider fallback**: maintain a documented fallback (a different model or vendor) for outages or capacity limits, and verify your prompt templates produce acceptable results on the fallback provider too — prompt phrasing is not perfectly portable across providers, similar to the cross-model prompt portability caveat in the **Vision AI** skill.
- **Mandatory output moderation**: run every generated image through an automated content-moderation classifier before storage or delivery, regardless of what moderation the provider claims to run on its own side — treat this as your own system's responsibility, not something to outsource entirely (see Security).
- **Provenance metadata**: store the prompt, parameters, model/version, and generation timestamp alongside every generated image — useful for debugging, for reproducing a result, and increasingly relevant to disclosure requirements in some jurisdictions and platforms (see Latest Updates).
`,

  "industry-examples": `
- **Adobe (Firefly, Generative Fill in Photoshop)**: integrates generative inpainting/outpainting directly into a mainstream creative tool, with an explicit emphasis on training-data licensing (Adobe has stated Firefly is trained on licensed/public-domain content) as a product differentiator addressing the copyright concerns covered in Security.
- **Shopify and e-commerce platforms**: offer merchants generated product photography variants (different backgrounds, staged contexts) from a single base product photo, reducing the cost of producing varied marketing imagery at catalog scale.
- **Game studios (various, using tools built on Stable Diffusion/Midjourney-family models)**: use image generation for concept art, environment texture variation, and rapid pre-production visualization, typically as an early-stage ideation tool rather than final shipped asset production, given IP-ownership and consistency considerations (see Comparisons and Security).
- **Canva and consumer design tools**: embed text-to-image and background-generation features directly into a broader design product, positioning generation as one tool among many rather than the whole product.
- **Getty Images and stock-photography companies**: illustrate the tension in this space directly — Getty has both sued a generative-AI company over alleged use of its images in training data and separately launched its own licensed, "clean-provenance" generative image product, an instructive real-world example of the disputed licensing question from Security playing out commercially.

Exact product names, feature sets, and which vendor's model powers which product change frequently — treat this list as illustrative of the CATEGORY of production use, and verify current specifics before citing any one company's stack as authoritative.
`,

  "best-practices": `
1. **Treat generation as an async job by default**, with a queue and webhook or polling completion — do not design the request path assuming sub-second responses.
2. **Run mandatory content moderation on every generated OUTPUT**, not only on the input prompt — a compliant prompt can still occasionally produce non-compliant output, and this is a distinct check with a distinct failure mode (see Security).
3. **Define an explicit resolution/step-count policy per use case** rather than always maximizing quality settings, and measure the actual cost/latency/quality tradeoff for your specific use cases before picking a default.
4. **Never assume in-image text will render correctly** — verify empirically against your chosen model for any use case needing precise text, and have a compositing fallback (generate art, add text with conventional tools) ready.
5. **Store prompt, parameters, model/version, and timestamp as provenance metadata** with every generated image — useful for debugging, reproducibility, and increasingly relevant to disclosure norms and regulation.
6. **Version and pin prompt templates and the model/version used**, exactly as recommended for vision prompts in the **Vision AI** skill — generation behavior shifts across model versions, sometimes significantly.
7. **Build a golden evaluation set of representative prompts** and re-run it whenever a prompt template, model version, or provider changes, watching for quality regressions and moderation-flag-rate shifts.
8. **Cache or reuse results where a request is plausibly a duplicate** (identical prompt and parameters) — generation cost is high enough per call that avoiding an unnecessary duplicate is a meaningful savings.
9. **Design an explicit human-review path for moderation-flagged or low-confidence outputs** rather than silently discarding or silently allowing them — both failure directions (over-blocking legitimate content, under-blocking problematic content) have real product costs.
10. **Budget cost using realistic resolution, step count, and volume assumptions**, not the cheapest demo settings you tested with — generation cost scales with both resolution and step count, often non-trivially.
11. **Treat structural-conditioning and consistency techniques (ControlNet-style, seed reuse, reference images) as tools with real limits**, not guarantees — verify empirically that a chosen technique achieves the consistency a specific product requirement actually needs before committing an architecture to it.
12. **Get explicit legal guidance on licensing and usage-rights questions for your specific jurisdiction, provider, and use case** rather than relying on general internet consensus — this is genuinely unsettled law, covered evenhandedly in Security, and a general best-practices page cannot substitute for counsel on a specific commercial use.
`,

  "anti-patterns": `
### Skipping output moderation because input was already screened

~~~python
# WRONG — assuming a clean input prompt guarantees clean output, and skipping the output check
image_bytes = generate_image(user_prompt)  # user_prompt already passed input screening
store_and_serve(image_bytes)               # output itself was never checked

# RIGHT — moderate the actual generated output, independent of input screening
image_bytes = generate_image(user_prompt)
moderation_result = moderate_image(image_bytes)  # a separate, mandatory check on the OUTPUT
if moderation_result.flagged:
    route_to_human_review(image_bytes, reason=moderation_result.categories)
else:
    store_and_serve(image_bytes)
~~~

### Other common anti-patterns

- **Assuming precise text will render correctly in a generated image** and shipping a feature (product packaging mockups, posters with a specific slogan) without verifying this empirically first — a near-guaranteed source of visible, embarrassing output errors given this is a known weak point (see Common Mistakes).
- **Building a synchronous request path for generation** and only adding a queue/async handling after production load reveals the design cannot sustain tens-of-seconds response times under concurrent traffic.
- **Always maximizing resolution and step count "for quality"** without measuring whether the use case's actual quality bar needs it — a direct, often substantial, unexamined cost multiplier.
- **Treating seed reuse as a guarantee of character/style consistency** across multiple generation calls, when it is at best a nudge toward similarity, not a guarantee — shipping a "consistent character across scenes" feature on this assumption alone without validating it against your specific provider's behavior.
- **Never storing provenance metadata (prompt, model version, parameters)** with generated images, then being unable to reproduce, debug, or explain a specific output later, or to comply with disclosure requirements that apply in some contexts.
- **Presenting a single, confident legal position on copyright/licensing to stakeholders** ("generated images are always fine to use commercially" or the opposite) instead of flagging this as unsettled and routing the actual decision to legal counsel for the specific use case and jurisdiction.
`,

  performance: `
### Measure first

~~~python
import time

def timed_generation(prompt: str, steps: int, size: str) -> tuple[bytes, float]:
    start = time.perf_counter()
    image_bytes = generate_image(prompt, size=size)  # assume steps passed through params in real call
    elapsed = time.perf_counter() - start
    return image_bytes, elapsed

# Log elapsed time, resolution, and step count together per request from day one —
# generation latency is driven by the interaction of these, not any one alone.
~~~

Log latency, resolution, step count, and cost per request from day one — you cannot optimize a cost or latency problem you haven't measured, and generation cost/latency scale with settings in ways that are easy to under-budget if you only test at the smallest, fastest demo settings.

### The optimization hierarchy (apply in order)

1. **Right-size resolution and step count per use case** — the single biggest lever; a lower-resolution, fewer-step draft/preview tier is often visually adequate for iteration and dramatically cheaper/faster than a final-quality generation.
2. **Use async batching where the workload allows it** — bulk, non-urgent generation (e.g. regenerating a whole product catalog's imagery) can often use a provider's lower-cost batch tier if one is offered, trading latency for cost on workloads that don't need a synchronous response.
3. **Cache or reuse identical requests** — avoid re-paying for a duplicate prompt-plus-parameters combination.
4. **Prefer image-to-image or inpainting over full regeneration** when only part of an image needs to change — a targeted edit is often cheaper and faster than a full new generation, and better preserves the parts of the image that were already correct.
5. **Parallelize independent generation requests** rather than serializing them, subject to provider rate limits — queue depth and concurrency limits matter more than any single request's latency at production volume.
6. **Trim prompt length to what's actually load-bearing** — extremely long, redundant prompts add negligible quality benefit past a point and can slow text-encoding overhead marginally, though this is a smaller lever than resolution/steps.

### Numbers worth knowing (order of magnitude, verify current vendor pricing/docs)

Generation latency commonly ranges from roughly one to tens of seconds depending on resolution, step count, and provider load, and cost scales with the same variables plus resolution — exact figures vary by vendor, model, and change over time, so treat any specific number you find, including illustrative ones on this page, as something to re-verify against current documentation before it drives a budget decision.
`,

  scalability: `
Image-generation features scale primarily as an API-consumption and job-queueing problem when using a hosted provider, and as a GPU-capacity problem when self-hosting an open-weight model — the two stories differ sharply, similar to the split covered in the **Vision AI** skill's scalability section.

### Using a hosted API

- **Horizontal scaling of your own service** (the queue, moderation, storage layers) is standard stateless-service scaling — see the general patterns in the **Kubernetes** and **Load Balancers** skills.
- **The real bottleneck is usually provider rate limits, queue depth, and cost**, not your own infrastructure — production systems need request queuing, backoff, and possibly multiple provider accounts/vendors to sustain high volume, plus hard cost-alerting since a traffic spike directly multiplies spend.
- **Provider-side latency variance under peak load** is common — design for it with generous timeouts, a documented fallback provider, and a queue that can absorb backpressure rather than assuming consistent generation latency.

### Self-hosting an open-weight diffusion model

Self-hosting (e.g. an open Stable Diffusion or FLUX checkpoint) trades API cost for infrastructure cost and operational ownership — GPU capacity planning, batching multiple generation requests for throughput, and a serving framework built for diffusion workloads (ComfyUI, or a custom inference service built on the model's reference implementation) apply here, following broadly similar scaling patterns to self-hosted model serving generally, but with the added complexity that diffusion inference is iterative (many forward passes per image) rather than the single or few forward passes typical of a classifier or a single LLM token.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| Provider API rate limits or queue depth under traffic spikes | Request queuing, backoff, multiple provider accounts, pre-negotiated higher limits for known traffic |
| Cost scaling faster than revenue at high resolution/step count | Resolution/step-count policy per use case, aggressive caching, batch tier for non-urgent workloads |
| Self-hosted GPU throughput ceiling | Dynamic batching across concurrent requests, right-sized model/step-count for the task, dedicated inference-serving framework |
| Moderation pipeline becoming a latency bottleneck at high volume | Scale the moderation service horizontally; ensure it doesn't serialize behind generation unnecessarily |
`,

  security: `
### Image-generation-specific attack surface

1. **Prompt-based generation of prohibited or harmful content**: users can attempt to craft prompts that evade a provider's input-side content filter to produce disallowed imagery (violent, sexual, deceptive, or otherwise policy-violating content). Provider-side input filtering is a real defense but not a complete one — layer your own input screening and, critically, output moderation on top (see below).
2. **Output content that slips past input screening**: even a compliant-looking prompt can occasionally produce non-compliant output due to the probabilistic nature of generation — this is why output moderation is a mandatory, distinct pipeline stage, not a redundant afterthought to input screening (see Production Usage and Anti-Patterns).
3. **Deepfake and impersonation risk**: image-to-image and inpainting techniques can be used to place a real person's likeness into a fabricated scene or alter an existing photo of them deceptively. Products that allow uploading a photo of an identifiable person as generation input should have an explicit policy and technical safeguards (e.g. face-detection-triggered stricter review) appropriate to the risk of their specific use case.
4. **Provenance and disclosure**: some jurisdictions and platforms increasingly require or encourage disclosure that an image is AI-generated (e.g. via visible watermarking or embedded metadata standards like C2PA content credentials) — verify current requirements for your target markets and platforms rather than assuming no disclosure obligation applies, since this area is actively evolving (see Latest Updates).
5. **Training-data and output-licensing exposure**: using a model whose training-data provenance or license terms are unclear, or distributing generated output commercially without understanding a specific provider's terms of service around output ownership, carries legal exposure that is genuinely unresolved in general and specifically dependent on your provider's terms and your jurisdiction (see below).

### Defenses

- Run automated output content moderation on every generated image before storage or delivery, independent of any input-side screening.
- Layer your own input-prompt screening in front of the provider's, especially for open-ended user-facing prompt input, rather than relying solely on the provider's filter.
- Apply stricter review paths for image-to-image or inpainting workflows that accept a photo of an identifiable real person as input.
- Track and apply current disclosure/watermarking/provenance-metadata requirements (e.g. C2PA-style content credentials) relevant to your target platforms and jurisdictions, and revisit this periodically since requirements are still evolving.
- Review your specific provider's terms of service regarding training-data sourcing and commercial-use rights for generated output before shipping a commercial feature, and involve legal counsel for any use case where the answer materially affects the business.

### The copyright and licensing debate — presented evenhandedly

This is a genuinely disputed, unsettled area, and a responsible engineer should represent it that way rather than asserting a confident answer in either direction.

**The "transformative fair use" position** argues that training a generative model on copyrighted images is analogous to a human artist studying many works and learning general stylistic and compositional patterns, that the model does not store or reproduce specific training images, and that the output is a new, transformative work — proponents point to fair-use doctrine's historical tolerance for transformative uses that don't substitute for the original works in the market.

**The "unauthorized derivative work" position** argues that training on copyrighted images without a license, consent, or compensation to the original creators is a use of their protected expression regardless of whether any single output image visually resembles a specific training image, that the resulting model's commercial value was built directly on that uncompensated use, and that artists whose styles or specific works were used to train a model without permission have a legitimate grievance regardless of the technical non-reproduction argument.

Both positions are actively argued in ongoing litigation (multiple lawsuits against major generative-AI companies by artists, stock-photography companies, and publishers were filed and remained unresolved or partially resolved as of this page's knowledge cutoff, with outcomes varying by jurisdiction and specific claim) and in ongoing legislative and regulatory activity in multiple countries. There is no single settled legal answer as of this writing, and the correct guidance for a real commercial decision is: verify your specific provider's training-data sourcing and terms of service, verify current law in your relevant jurisdiction, and consult legal counsel for any use case where the answer materially affects the business — this page intentionally does not take a side, because taking one would misrepresent a genuinely open legal and ethical question as settled.
`,

  testing: `
Testing an image-generation feature spans conventional software testing (the pipeline code) and a genuinely different discipline: evaluating a probabilistic generative model's output against a curated prompt set — both are required, and neither substitutes for the other, mirroring the same split covered in the **Vision AI** skill's testing section.

~~~python
# tests/test_generation_pipeline.py
import pytest
from image_gen.requests.validate import validate_prompt
from image_gen.moderation.output_check import moderate_image

def test_validate_prompt_rejects_empty_string():
    with pytest.raises(ValueError):
        validate_prompt("")

def test_validate_prompt_rejects_over_length():
    with pytest.raises(ValueError):
        validate_prompt("a " * 5000)

def test_moderate_image_flags_known_bad_sample(sample_flagged_image_bytes):
    result = moderate_image(sample_flagged_image_bytes)
    assert result.flagged is True

def test_moderate_image_clears_known_good_sample(sample_clean_image_bytes):
    result = moderate_image(sample_clean_image_bytes)
    assert result.flagged is False
~~~

### The senior testing doctrine for image-generation features

- **Unit test the deterministic pipeline code** (prompt validation, moderation-result handling, storage/provenance logic) like any software — these bugs are fully preventable and cheap to catch.
- **Build a golden evaluation set of representative prompts** covering your product's actual use cases, and score every prompt-template or model/provider change against it before shipping, watching both quality and moderation-flag-rate.
- **Test known weak spots explicitly** — in-image text rendering, dense small repeated objects, and any structural-conditioning or consistency technique you depend on — as their own evaluation slice rather than folding them into an aggregate "looks good" judgment.
- **Test the moderation pipeline with both known-flaggable and known-clean samples**, not only real user-submitted content, to confirm the classifier and pipeline wiring behave correctly before relying on it in production.
- **Regression-test prompt template, model/version, and key parameters (resolution, steps, guidance scale) together** whenever any one changes — they interact, and testing them independently can hide a regression that only appears in combination.
`,

  debugging: `
### Escalation path

1. **Reproduce with the exact prompt and exact parameters** — generation output can be sensitive to resolution, step count, guidance scale, and seed; confirm you can reproduce the issue with the precise request that was actually sent, not an approximately-similar retyped prompt.
2. **Check which parameters were actually used** — log resolution, steps, guidance scale, and seed per request; a surprisingly common "bug" is an unintended default (e.g. a low step count) silently degrading quality.
3. **Inspect the raw generated image and any provider-returned metadata before any downstream processing** — confirm whether the provider itself produced a poor result, refused/flagged the prompt, or your own post-processing (resizing, compositing, moderation) mangled a correct result. These require completely different fixes.
4. **Test the same prompt at a higher step count or with more explicit prompt structure** — if quality improves, you've isolated the issue to a settings or prompt-specificity gap rather than a fundamental model limitation.
5. **Check for a provider-side moderation rejection being mishandled as a generic error** — inspect the actual HTTP status and error body; a content-policy rejection needs different handling (surface to the user or adjust the prompt) than a transient server error (retry).
6. **Compare against a different model or provider on the same prompt** — if every provider struggles equally (e.g. on precise in-image text, or a specific structural request), this is likely a known structural weak point (see Advanced Concepts and Common Mistakes) rather than a prompt-fixable bug, and the fix is architectural (compositing exact elements with conventional tools) rather than further prompt tuning.

~~~python
# Quick diagnostic: log exactly what was requested and what came back
import logging

logger = logging.getLogger("image_gen")

def diagnostic_generate(prompt: str, size: str, steps: int, guidance_scale: float):
    logger.info("generation_request", extra={"size": size, "steps": steps, "guidance_scale": guidance_scale})
    try:
        image_bytes = generate_image(prompt, size=size)
        logger.info("generation_success", extra={"bytes": len(image_bytes)})
        return image_bytes
    except Exception as e:
        logger.error("generation_failure", extra={"error": str(e)})
        raise
~~~
`,

  monitoring: `
Production image-generation features need monitoring at the same three levels as any generative-AI-backed service: the service, the model's output quality, and cost.

### Service-level metrics

~~~python
from prometheus_client import Counter, Histogram

GENERATION_REQUESTS = Counter("image_gen_requests_total", "Requests", ["status", "size_tier"])
GENERATION_LATENCY = Histogram("image_gen_request_seconds", "End-to-end latency", ["size_tier"])
GENERATION_MODERATION_FLAGS = Counter("image_gen_moderation_flags_total", "Flagged outputs", ["category"])

def track_call(size_tier: str, elapsed: float, status: str, moderation_category: str | None = None) -> None:
    GENERATION_REQUESTS.labels(status=status, size_tier=size_tier).inc()
    GENERATION_LATENCY.labels(size_tier=size_tier).observe(elapsed)
    if moderation_category:
        GENERATION_MODERATION_FLAGS.labels(category=moderation_category).inc()
~~~

Track rate/errors/duration (RED) per endpoint as usual, plus generation cost and moderation-flag rate specifically — flag rate is the metric most directly tied to both user experience (over-blocking) and risk (under-blocking), and it should have its own alert threshold separate from a general error-rate alert.

### Output-quality signals

- **Moderation flag rate over time** — a rising rate can indicate a shift in user prompt patterns, a prompt-injection attempt trend, or a provider/model change affecting output distribution; alert on a meaningful jump.
- **Sampled human review of production outputs**, weighted toward flagged or low-confidence results — the only reliable way to catch a quality or safety regression a golden evaluation set didn't anticipate.
- **Cost per accepted (non-flagged, delivered) generation**, tracked alongside quality on the golden set, so a cost-cutting settings change is evaluated against its quality impact rather than shipped on cost savings alone.

### Cost and volume drift

Track generation volume, resolution/step-count distribution, and total spend over time — a sudden shift (a new feature driving unexpectedly high-resolution requests, or a traffic spike) can silently change cost without any code change, exactly as covered for image-token cost in the **Vision AI** skill's monitoring section, applied here to generation settings instead of input resolution.
`,

  deployment: `
### A production Dockerfile for an image-generation orchestration service (API-orchestration layer, not a self-hosted model)

~~~dockerfile
FROM python:3.12-slim AS base
# Slim base is sufficient — this service calls a hosted generation API, it does not run
# GPU diffusion inference itself. Self-hosting a model needs a CUDA-enabled base image instead.

WORKDIR /app

# Install system deps needed by Pillow for common image formats (PNG, WebP, etc.)
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

# Non-root user: this service handles generated image bytes and user-submitted prompts,
# so minimize blast radius if a dependency vulnerability is ever exploited.
RUN useradd -m appuser
USER appuser

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "image_gen.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

### Deployment considerations specific to image generation

- **Secrets management**: provider API keys are high-value secrets — load them from a secrets manager, never bake them into the image or commit them (see the **Secrets Management** skill).
- **Egress rules**: this service needs outbound HTTPS to the generation provider's endpoints; restrict egress to exactly the hosts required rather than leaving it open.
- **Queue and worker infrastructure**: async generation needs a job queue (e.g. a managed queue service or a library like Celery/RQ backed by Redis) and worker processes separate from the request-handling API tier — plan this as core infrastructure from the start, not a later addition.
- **Rollout strategy for prompt/model/provider changes**: treat a prompt-template, model-version, or provider change with the same rollout discipline as a code deploy — canary a small percentage of traffic, watch the golden-set score and moderation-flag rate, then roll forward.
- **Self-hosted model deployment** (if using an open-weight diffusion model instead of a hosted API) needs GPU-provisioned nodes, a diffusion-aware serving framework, and the same model-registry/versioning discipline covered in the **Vision AI** and **Deep Learning** skills' deployment sections — this page assumes the more common hosted-API path above unless self-hosting is a deliberate choice.
`,

  "production-checklist": `
- [ ] Generation is treated as an async job with a queue and webhook/polling completion, not a blocking synchronous call.
- [ ] Every generated image passes a mandatory output content-moderation check before storage or delivery.
- [ ] Input prompt screening exists in addition to (not instead of) output moderation.
- [ ] Resolution and step-count policy is explicit per use case, not left at an unexamined default.
- [ ] Provenance metadata (prompt, parameters, model/version, timestamp) is stored with every generated image.
- [ ] Prompt templates and model/provider version are pinned and version-controlled together.
- [ ] A golden evaluation set of representative prompts exists and is re-run on every prompt/model/provider change.
- [ ] Use cases requiring precise in-image text have been empirically verified against the chosen model, with a compositing fallback available.
- [ ] Character/style consistency requirements have been validated against the chosen technique (seed reuse, reference image, fine-tune), not assumed.
- [ ] Caching or deduplication is in place for identical repeated requests.
- [ ] Cost is estimated and monitored using realistic resolution, step count, and volume, with an alert threshold on spend.
- [ ] Timeouts, retries, and a provider fallback are configured for the generation call, with rejection errors handled distinctly from transient failures.
- [ ] Disclosure/provenance-metadata requirements (e.g. watermarking, content-credential standards) relevant to target platforms/jurisdictions have been reviewed.
- [ ] Legal review has covered training-data licensing and output-usage-rights questions for the specific commercial use case.
- [ ] Monitoring covers latency, cost, moderation-flag rate, and volume/settings drift.
- [ ] Rollout of any prompt, model, or provider change is canaried against the golden set before full traffic.
`,

  "common-mistakes": `
1. **Assuming a compliant input prompt guarantees compliant output** — the WHY is probabilistic: a diffusion model's output is sampled through a stochastic process, so even a benign prompt can occasionally produce output that should be caught by moderation; output moderation is a distinct, mandatory check, not a redundant one.
2. **Not moderating generated content at all**, relying entirely on the provider's own input-side filter — a genuinely common and consequential gap, since the provider is checking the request, not necessarily giving your specific product the guarantee that every possible output is acceptable for your specific audience and context.
3. **Expecting reliable, precise text rendering inside generated images** — the WHY is architectural (see Advanced Concepts): diffusion models optimize for visually plausible pixel patterns, and exact letterforms are a much narrower, harder target than general visual plausibility; this remains a known weak point even in current-generation models.
4. **Ignoring licensing and copyright questions until a legal issue surfaces**, instead of reviewing provider terms of service and getting counsel involved early for any commercially significant use case — this is genuinely unsettled law (see Security), and treating it as a non-issue is a real business risk, not merely a theoretical one.
5. **Assuming seed reuse or a single reference image guarantees consistent characters/style across many generations** — both are nudges, not guarantees, and shipping a feature that depends on strict consistency without validating the specific technique against the specific provider is a common source of visible quality failures.
6. **Not accounting for resolution and step count in cost estimates** — teams frequently budget a generation feature using a demo's cheap default settings and are surprised when production-quality settings (higher resolution, more steps) cost substantially more per image.
7. **Building a synchronous request path and discovering under load that generation latency (seconds to tens of seconds) doesn't fit a typical request-timeout budget** — this should be designed as async from the start, not patched in after a production incident.
8. **Treating outpainted or inpainted content as if it recovers real, factual information** — the model generates a plausible continuation or fill, not a recovery of what was actually there; using outpainting to "restore" a photo in a context implying factual accuracy (e.g. a legal or forensic context) is a misuse of the technology's actual capability.
9. **Not storing provenance metadata**, making it impossible to reproduce, debug, or explain a specific past generation, or to comply with a disclosure requirement that surfaces later.
10. **Taking a confident public stance on the copyright/licensing debate** in product messaging or internal decision-making, rather than acknowledging it as unsettled and routing the actual business decision to counsel for the specific use case and jurisdiction.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| HTTP 400 "prompt rejected" / content policy violation | Prompt matched the provider's input content filter | Do not blindly retry the identical prompt; inspect the rejection reason and adjust the prompt, or route to human review if the rejection seems like a false positive |
| Request timeout on a synchronous generation call | Generation latency (often seconds to tens of seconds) exceeded a client or gateway timeout designed for fast text APIs | Move to an async job/queue pattern with webhook or polling completion instead of a blocking synchronous call |
| Malformed or missing image in response | Assumed response shape (URL vs. base64) doesn't match the provider's actual documented format | Check the specific provider's current response schema; do not assume it matches another provider's shape |
| Visible seam at mask edges after inpainting | Hard, unfeathered mask edge | Feather/soften the mask edge before submitting the inpainting request |
| Inconsistent character/style across a batch of generations | Relied on seed reuse alone without a stronger anchoring technique | Use a reference image, image-prompt adapter, or fine-tuned adapter (LoRA-style) where consistency is a real requirement, and validate empirically |
| Garbled or misspelled text inside a generated image | Precise text rendering is a known weak point of diffusion models | Generate the image without the text, then composite exact text using conventional image/typesetting tools |
| Unexpectedly high generation cost at production volume | Resolution and/or step count left at a high default without a per-use-case policy | Define and enforce an explicit resolution/step-count policy tied to actual quality needs per use case |
| Job never completes / stuck in "processing" state | Provider outage or job-id/webhook wiring bug | Implement a max-wait timeout with a documented fallback provider/model, and alert on jobs exceeding expected duration |
`,

  faqs: `
**Is Stable Diffusion, Midjourney, or DALL-E "the best" image generator?**
This changes fast enough that any specific ranking should be treated as perishable — different models lead on different axes (photorealism, prompt adherence, stylization, cost, self-hostability) at different times, and the honest answer for a specific project is to benchmark your actual use cases against current top candidates rather than trust a generic ranking, including any implied in this page.

**Can I self-host an image-generation model instead of using an API?**
Yes, for open-weight models like Stable Diffusion or FLUX — this trades API cost and simplicity for GPU infrastructure cost and operational ownership (see Scalability), and is a reasonable choice when volume is high enough to justify the fixed infrastructure cost, or when data residency/privacy requirements rule out sending prompts/images to a third-party API.

**Do I own the copyright to an image I generate?**
This depends on your provider's terms of service and your jurisdiction's copyright law, both of which are still evolving and in some cases actively contested — some jurisdictions have held that purely AI-generated content without sufficient human creative input may not be copyrightable at all. Do not assume a definitive answer without checking your specific provider's current terms and, for any commercially significant use, consulting counsel (see Security).

**Why can't the model spell the word I asked for correctly in the image?**
Precise in-image text rendering remains a known weak point of diffusion models even in recent generations, for architectural reasons covered in Advanced Concepts — treat it as an area to verify empirically per model rather than assume, and have a compositing fallback ready for use cases where correct text matters.

**How do I keep a character or product looking the same across many generated images?**
There is no single guaranteed technique — seed reuse, reference images via image-to-image or an image-prompt adapter, and fine-tuned adapters (LoRA-style) are the common approaches, each with real limits, and the right choice depends on your specific provider/tooling and how strict the consistency requirement is (see Advanced Concepts).

**Is it safe to let users submit arbitrary prompts in a public-facing product?**
Only with both input screening and mandatory output moderation in place — provider-side input filters help but are not a complete guarantee, and output moderation catches the cases that slip through (see Security and Production Usage).

**How much does generating an image typically cost?**
It varies by provider, resolution, and step count, and changes over time as providers adjust pricing — verify current pricing directly against your chosen provider's documentation before budgeting a feature, rather than relying on any specific number, including illustrative ones in this page's Performance section.

**Should I use inpainting/outpainting or just regenerate the whole image?**
Prefer a targeted edit (inpainting/outpainting) when only part of an image needs to change — it is typically cheaper, faster, and better preserves the parts of the image that were already correct than a full regeneration.
`,

  "interview-questions": `
### Junior-level

1. **What is the difference between text-to-image and image-to-image generation?**
   Model answer: text-to-image generates a new image purely from a text description, starting from random noise; image-to-image starts from an existing image plus a text prompt, and a "strength" parameter controls how much the output is allowed to diverge from that starting image's structure.

2. **What is inpainting, and how is it different from outpainting?**
   Model answer: inpainting regenerates a masked interior region of an existing image while preserving the rest; outpainting extends an image beyond its original canvas, generating plausible new content that blends with the existing edges. Both use a mask to mark which region should be regenerated.

3. **Why does image generation typically take longer than a text-only LLM API call?**
   Model answer: diffusion models generate an image through many iterative denoising steps, each requiring a forward pass through the denoising network, rather than the single or few forward passes typical of a short text completion — more steps generally means both higher quality and higher latency.

4. **What is a negative prompt, and what does it do?**
   Model answer: a negative prompt (where supported) specifies content that should be actively suppressed from the output during generation ("no text, no watermark"), distinct from simply not mentioning something in the main prompt — it has no direct equivalent in text-only LLM prompting.

5. **Why should generated images be moderated even if the input prompt was already screened?**
   Model answer: generation is a probabilistic process, so even a compliant prompt can occasionally produce non-compliant output; output moderation is a distinct, mandatory check that catches cases input screening cannot.

### Senior-level

6. **Walk through what happens, conceptually, from a text prompt to a final generated image in a latent diffusion system.**
   Model answer should cover: text encoding into an embedding, noise initialization (typically in a compressed latent space), iterative denoising steps conditioned on the text embedding via a guidance mechanism, and a final decoding step from latent space back to pixels — see Internal Working for the full trace.

7. **How would you design a production system to keep a specific character consistent across dozens of generated images?**
   Model answer should discuss the real limits of seed reuse alone, and evaluate reference-image/image-prompt-adapter approaches and fine-tuned adapters (LoRA-style) as stronger but still imperfect options, emphasizing that this requirement should be validated empirically against the chosen provider before committing an architecture to it.

8. **A stakeholder asks whether it's legally safe to sell products featuring AI-generated images commercially. How do you respond?**
   Model answer should explain that this is a genuinely unsettled area (citing both the transformative-fair-use and unauthorized-derivative-work positions evenhandedly), that the concrete next step is reviewing the specific provider's terms of service and involving legal counsel for the jurisdiction and use case in question, and that no general engineering best-practices answer substitutes for that review.

9. **How would you architect a system to reliably put an exact, correctly-spelled product name on a generated packaging mockup?**
   Model answer should identify that precise in-image text rendering is a known weak point of diffusion models, and propose generating the artwork without the text and compositing the exact text with conventional image/typesetting tooling (Pillow, ImageMagick, or a design tool's API) as the reliable approach.

10. **How do you estimate and control the cost of an image-generation feature before it ships?**
    Model answer should cover measuring cost per realistic resolution/step-count combination, defining an explicit per-use-case settings policy, using caching/deduplication, considering a batch tier for non-urgent workloads, and monitoring actual production volume and settings drift rather than relying on demo-time estimates.

11. **What is classifier-free guidance, and what tradeoff does it control?**
    Model answer: a mechanism (referred to by different parameter names across providers, e.g. "guidance scale") that controls how strongly the denoising process is steered toward matching the text conditioning versus how freely it can wander; higher guidance generally increases prompt adherence at some risk of reduced naturalness or diversity if pushed too far.

12. **How would you decide between using a hosted image-generation API and self-hosting an open-weight model?**
    Model answer should weigh API simplicity and no infrastructure ownership against self-hosting's cost efficiency at high volume, data residency/privacy control, and the operational burden of GPU capacity planning and a diffusion-aware serving framework — see Comparisons and Scalability.
`,

  "coding-questions": `
### Problem 1: Async generation with retry and timeout handling

Write a function that submits an async image-generation job, polls for completion, retries transient failures with backoff, and gives up cleanly after a maximum wait time.

~~~python
import time
import random

class GenerationError(Exception):
    pass

def generate_with_retry(prompt: str, max_retries: int = 3, max_wait: float = 90.0) -> bytes:
    """Submit a generation job, poll for completion, and retry transient (not policy) failures
    with exponential backoff. Complexity: O(max_retries * polls_per_attempt) API calls in the
    worst case; each attempt is bounded by max_wait."""
    last_error: Exception | None = None
    for attempt in range(max_retries):
        try:
            return generate_async(prompt, max_wait=max_wait)
        except TimeoutError as e:
            last_error = e
            continue  # transient — retry
        except RuntimeError as e:
            # A RuntimeError here signals a job-level failure (e.g. content policy rejection);
            # retrying an identical prompt against the same policy will simply fail again.
            if "content policy" in str(e).lower() or "rejected" in str(e).lower():
                raise GenerationError(f"Prompt rejected, not retrying: {e}") from e
            last_error = e
        backoff = (2 ** attempt) + random.uniform(0, 1)
        time.sleep(backoff)
    raise GenerationError(f"Generation failed after {max_retries} attempts: {last_error}")
~~~

Follow-ups: how would you distinguish a rate-limit error (worth retrying, perhaps with a longer backoff) from a content-policy rejection (not worth retrying) if the provider returns similarly-shaped error codes for both? How would you add per-attempt jitter to avoid a thundering-herd retry pattern across many concurrent requests?

### Problem 2: Feathered mask generation for inpainting

Write a function that takes a hard-edged binary mask (for inpainting) and returns a feathered version to reduce visible seams at the mask boundary.

~~~python
from PIL import Image, ImageFilter

def feather_mask(mask_path: str, output_path: str, feather_radius: int = 8) -> None:
    """Soften a hard-edged inpainting mask with a Gaussian blur so the transition between
    regenerated and original content blends more naturally. Complexity: O(width * height)
    for the blur pass, same as any single-pass image filter."""
    mask = Image.open(mask_path).convert("L")  # grayscale: white = regenerate, black = preserve
    feathered = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))
    feathered.save(output_path)

# Usage: feather_mask("hard_mask.png", "soft_mask.png", feather_radius=8)
# A larger feather_radius blends a wider transition band; too large can regenerate
# unintended parts of the "preserve" region, so tune against your specific image resolution.
~~~

Follow-ups: how would this interact with a mask drawn at a different resolution than the source image? What happens to feathering quality if the mask has multiple disconnected regions of different sizes?

### Problem 3: Cost estimator for a batch generation job

Write a function that estimates the total cost of generating a batch of images given per-image resolution/step-count pricing tiers, and flags the batch if it exceeds a budget threshold.

~~~python
PRICING_PER_IMAGE = {
    ("512x512", 20): 0.01,
    ("1024x1024", 20): 0.02,
    ("1024x1024", 50): 0.04,
    # Illustrative only — verify current pricing against your provider's actual documentation.
}

def estimate_batch_cost(requests: list[dict], budget: float) -> dict:
    """Estimate total cost for a batch of generation requests and flag if it exceeds budget.
    Each request dict has 'size' and 'steps' keys. Complexity: O(n) in the number of requests."""
    total = 0.0
    unknown = []
    for req in requests:
        key = (req["size"], req["steps"])
        if key not in PRICING_PER_IMAGE:
            unknown.append(key)
            continue
        total += PRICING_PER_IMAGE[key]
    return {
        "estimated_total": round(total, 4),
        "over_budget": total > budget,
        "unpriced_combinations": unknown,  # surfaces gaps in the pricing table rather than silently under-estimating
    }
~~~

Follow-ups: how would you extend this to account for retries (a rejected or failed generation that gets retried still may incur partial cost depending on the provider's billing model)? How would you keep the pricing table current given that provider pricing changes over time?
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Prompt iteration workbench

Build a small script that takes a base prompt, generates images with three different style modifiers appended, and saves all outputs with filenames encoding the exact prompt used. Deliverable: a folder of generated images plus a manifest file mapping filename to full prompt. Skills exercised: basic API integration, prompt structuring, file handling.

### Lab 2 (Intermediate): Inpainting-based object removal tool

Build a tool that accepts an image and a user-drawn mask, and uses inpainting to remove the masked object, filling it with a plausible background continuation. Include mask feathering and a before/after comparison output. Deliverable: a working CLI or small web tool, plus a short write-up of at least three seams/artifacts you encountered and how you addressed them. Skills exercised: inpainting API usage, mask preprocessing, iterative debugging of visible artifacts.

### Lab 3 (Intermediate/Advanced): Async generation service with mandatory output moderation

Build a small backend service (FastAPI or similar) that accepts a generation request, processes it asynchronously via a job queue, runs a content-moderation check on the output before persisting it, and exposes a polling endpoint for job status. Deliverable: a running service with tests covering the moderation gate specifically (using both known-flaggable and known-clean sample images), plus load-tested behavior under concurrent requests. Skills exercised: async job architecture, mandatory moderation-gate design, testing a probabilistic pipeline stage.

### Lab 4 (Production): Cost-aware batch regeneration pipeline

Build a pipeline that regenerates product imagery for a catalog of at least 50 items, using a resolution/step-count policy tuned per item category, with caching to avoid regenerating unchanged items, and a cost report at the end. Deliverable: a pipeline run against a real or synthetic catalog, a cost report showing before/after savings from the policy and caching versus a naive "max settings for everything" baseline, and a short analysis of the quality/cost tradeoff observed. Skills exercised: production cost optimization, caching design, end-to-end pipeline engineering.
`,

  "real-projects": `
### Project 1: Marketing creative generation platform

Build a tool that lets a marketing team submit a product description and generate a batch of ad-creative variants across multiple aspect ratios and styles, with mandatory output moderation, provenance metadata storage, and a human-review queue for flagged content. Engineering requirements: async job architecture, a resolution/style policy per output format, cost tracking per campaign, and a golden evaluation set covering the team's actual recurring creative briefs.

### Project 2: E-commerce product photography variant generator

Build a service that takes a single base product photo and generates multiple contextual variants (different backgrounds/settings) using image-to-image transformation, with a consistency-preserving strategy (reference-image anchoring or a fine-tuned adapter) to keep the product itself visually accurate across variants. Engineering requirements: a measured evaluation of product-fidelity across variants (does the product still look like the same product), cost-per-listing budgeting at catalog scale, and a fallback path for products where generated variants don't meet a quality bar.

### Project 3: Design-tool plugin with inpainting-based editing

Build a plugin (for a design tool or a standalone web app) that lets a user select a region of an uploaded image and describe a change in natural language, using inpainting to apply it, with mask feathering, an undo/version history of edits, and output moderation on every edit. Engineering requirements: a clean mask-drawing UI/UX, before/after comparison, provenance tracking across an edit history (not just the final image), and empirical handling of the "precise text in image" weak point if the tool supports adding text/labels.
`,

  "case-studies": `
### Adobe Firefly's licensed-training-data positioning

Adobe built Firefly with an explicit claim that its training data is licensed, public domain, or Adobe-owned content, directly targeting the copyright-exposure concern covered in Security as a product differentiator for commercial/enterprise customers who need lower legal risk. Lesson: training-data provenance is not just an ethical talking point — it is a real, marketable product differentiator when customers have genuine commercial risk exposure from an alternative provider's uncertain training-data sourcing.

### Getty Images' dual position — litigant and product builder

Getty Images pursued legal action against a generative-AI company over alleged use of its licensed photography in training data, while separately building and launching its own licensed generative image product trained on its own properly-licensed catalog. Lesson: the copyright debate covered in Security is not abstract — it directly shapes competitive and legal strategy for real companies simultaneously, and a company can coherently hold both positions (objecting to unlicensed use of its own content, while building a licensed alternative) without contradiction.

### Stable Diffusion's open-weight release and the ecosystem it created

Stability AI's decision to release Stable Diffusion's model weights publicly (rather than API-only) catalyzed an enormous open-source ecosystem — ControlNet, countless fine-tuned checkpoints, LoRA adapters, and tools like ComfyUI — that would not exist under an API-only distribution model. Lesson: the choice between API-only and open-weight distribution has downstream ecosystem effects far beyond the releasing company's own roadmap, shaping what third-party tooling and techniques (like ControlNet, covered in Advanced Concepts) become possible at all.

### A hypothetical-composite case: an e-commerce team's in-image-text failure

Multiple teams building product-mockup features have independently discovered, after shipping, that a diffusion model reliably produces a plausible-looking but misspelled or garbled version of an intended product name or slogan in generated packaging mockups — a direct, costly instance of the known text-rendering weak point (see Advanced Concepts and Common Mistakes) surfacing in production rather than being caught in testing. Lesson: any use case depending on precise in-image text needs explicit, dedicated testing against that specific requirement before launch, and a compositing fallback plan, rather than assuming general model quality implies text-rendering reliability.
`,

  comparisons: `
| Approach / Provider category | Strengths | Weaknesses | Typical fit |
|---|---|---|---|
| Hosted closed-API models (e.g. OpenAI's image models, Midjourney) | Strong out-of-the-box quality and prompt-following, no infrastructure to manage, frequent model improvements | Less control over exact architecture/fine-tuning, ongoing per-call cost, training-data provenance often less transparent | Product teams wanting fast integration without infrastructure ownership |
| Open-weight self-hosted models (e.g. Stable Diffusion, FLUX family) | Full control, fine-tunable, no per-call API cost once infrastructure exists, large open ecosystem (ControlNet, LoRA, ComfyUI) | Requires GPU infrastructure and ops expertise, quality/ease-of-use can lag the best closed models on some axes | Teams with GPU infrastructure, high volume justifying fixed cost, or a need for fine-tuning/customization |
| Licensed-training-data providers (e.g. Adobe Firefly) | Lower legal/licensing risk profile, positioned for enterprise/commercial use | May trail the very largest models on some quality/style dimensions depending on training-data scale | Commercial use cases where licensing risk is a primary concern |
| GAN-based approaches (largely superseded, still used for some narrow tasks) | Very fast single-pass generation once trained, mature for narrow domains (e.g. face synthesis) | Harder and less stable to train, weaker at open-ended text-conditioned generation than diffusion | Narrow, well-defined generation tasks where diffusion's flexibility isn't needed and single-pass speed matters |

### How seniors actually choose

A senior engineer treats this as a multi-axis decision, not a single "best model" lookup: quality and prompt-following on YOUR specific use cases (benchmarked directly, not taken from generic leaderboards), cost and latency at YOUR expected volume, licensing/legal risk tolerance for the specific commercial context, and whether fine-tuning or self-hosting is worth the operational cost given volume. Because this space changes quickly (see History and Latest Updates), the practical discipline is re-benchmarking periodically against your own golden evaluation set rather than picking once and assuming the choice stays optimal.
`,

  "related-technologies": `
- **Vision AI** — the structural mirror image of this skill (image-to-text instead of text-to-image); read together, both skills reinforce the same CLIP-style text-image embedding alignment concept from two directions.
- **Video Models** — extends diffusion (or diffusion-transformer) techniques across time to generate video; the natural next skill after mastering still-image generation, since many video-generation systems build directly on image-diffusion foundations.
- **Deep Learning** — covers the training-time mathematics behind diffusion models (forward/reverse noising process, the denoising network's training objective, U-Net and diffusion-transformer architecture design) that this page intentionally treats at a conceptual, application-focused level only.
- **Prompt Engineering** — the general prompting discipline (iterate, inspect, refine, use structure) that text-to-image prompting builds on, with image-specific vocabulary (negative prompts, style/technical modifiers, reference-image anchoring) layered on top.
- **Guardrails** — the broader discipline of content moderation, input/output filtering, and safety-pipeline design that this page's Security and Production Usage sections apply specifically to generated image output.
- **Cost Optimization** — the general discipline of measuring and controlling AI-feature cost that this page's Performance section applies specifically to resolution/step-count/batch-tier tradeoffs in image generation.
- **OCR** — a precision-focused sibling for extracting exact text FROM images, relevant here as the composition pattern for the inverse problem (compositing exact text INTO a generated image) discussed in Advanced Concepts and Common Mistakes.
`,

  "latest-updates": `
This page's knowledge cutoff means specific model names, benchmark claims, and provider feature sets should be verified against current documentation before being treated as durable facts — this space changes quickly enough that a specific "current best model" claim has a short shelf life.

Directionally, as of this page's knowledge cutoff: diffusion-transformer architectures (replacing the U-Net backbone with a Transformer, as in Stable Diffusion 3 and comparable systems) had become common across major providers; in-image text rendering had improved substantially compared to 2022-era models but remained an acknowledged weak point rather than a fully solved problem; structural conditioning techniques (ControlNet-style) and reference-image/image-prompt-adapter approaches for style and subject consistency had matured into common production patterns; and provenance/disclosure standards (such as C2PA content credentials) were gaining adoption among major providers and platforms as a response to growing regulatory and public interest in AI-content disclosure. Litigation and legislation around generative-model training data and output rights remained active and unresolved in multiple jurisdictions at this page's knowledge cutoff (see Security) — verify current legal status before relying on any specific claim about where this stands.

Given how fast this space moves, treat any specific vendor comparison, pricing figure, or "current best" claim anywhere on this page as a snapshot to re-verify, not a permanent fact.
`,

  "future-roadmap": `
Several directions look likely to matter for an AI engineer's career investment in this space, stated with appropriate hedging since this is an actively evolving field:

- **Convergence of image and video generation** — diffusion and diffusion-transformer techniques extending across time (see the **Video Models** skill) is already underway and likely to continue, making "image generation" and "video generation" increasingly the same underlying skill set applied to different output shapes.
- **Unified multimodal models that both understand and generate images** — rather than separate "vision" and "generation" models, systems that do both in one architecture are an active research and product direction; if this consolidates, the practical skill of prompting and integrating such a system will likely matter more than knowing separate vision-understanding and image-generation APIs.
- **Maturing provenance and disclosure standards** — content-credential standards (like C2PA) and regulatory disclosure requirements are likely to become a more standard, expected part of production image-generation pipelines rather than an optional add-on, given current regulatory trajectory in multiple jurisdictions.
- **Continued improvement, but not necessarily resolution, of known weak points** — precise text rendering and exact spatial/count control are likely to keep improving incrementally, but betting a product launch date on a specific weak point being "solved" by a certain date is a risky assumption; verify empirically against the current state of your chosen model rather than assuming future improvement on any specific timeline.
- **The copyright/licensing question is likely to be shaped significantly by ongoing litigation and legislation** rather than settling quickly or uniformly — this is worth tracking as a business-relevant development, not just a technical one, for any team building commercial products on generative image models.

Where to invest career time: the durable, transferable skills are prompt-engineering discipline, production system design around an inherently async and probabilistic API (queuing, moderation, cost control), and staying current on the licensing/legal landscape — these transfer across whichever specific model or provider currently leads the field, which is the part most likely to keep changing.
`,

  "cheat-sheet": `
~~~text
IMAGE GENERATION — ESSENTIALS

Core operations:
  text-to-image    prompt -> new image from noise
  image-to-image   existing image + prompt -> transformed image (strength controls how much changes)
  inpainting       existing image + mask + prompt -> regenerate masked region only
  outpainting      existing image on larger canvas + prompt -> extend beyond original borders

Conceptual pipeline (latent diffusion, most common current pattern):
  text prompt -> text embedding
  random noise (in latent space) -> N iterative denoising steps, conditioned on text embedding
  final latent -> decoder -> pixel image
  (guidance scale / classifier-free guidance controls how strongly text conditioning steers the result)

Prompting structure:
  subject -> style -> technical modifiers
  negative prompt: what to suppress (not every provider supports this)
  reference image: anchor style/composition more precisely than text alone

Structural control (ControlNet-style, one common approach among several):
  extract control signal (edge map / depth map / pose) from a reference image
  condition generation on BOTH text prompt and control signal

Style/subject consistency (no single guaranteed technique):
  seed reuse (weak nudge) | reference image / image-prompt adapter | fine-tuned adapter (LoRA-style)

Known weak points (verify per model/version):
  precise in-image text rendering | exact counting of dense/repeated objects | strict multi-image consistency

Production essentials:
  treat generation as ASYNC (queue + webhook/poll), never blocking synchronous
  MANDATORY output content moderation, separate from any input prompt screening
  store provenance metadata: prompt, params, model/version, timestamp
  resolution + step count = primary cost/latency levers; define policy per use case
  pin prompt templates + model version together; canary changes against a golden eval set

Copyright/licensing: genuinely unsettled — "transformative fair use" vs. "unauthorized
derivative work" both actively argued; verify provider terms + get legal counsel per use case,
do not assume a definitive answer either way.
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What is the core mechanism behind modern image-generation models? | Iterative denoising: starting from random noise and gradually refining it into a coherent image over many steps, conditioned on a text (or other) signal. |
| What is "latent diffusion"? | Running the denoising process in a compressed latent space (via an encoder/decoder pair) rather than raw pixel space, making diffusion computationally tractable at scale. |
| What does the "strength" parameter control in image-to-image generation? | How much the output is allowed to diverge from the input image's structure — low strength preserves composition, high strength approaches full text-to-image generation. |
| What is a negative prompt? | A specification of content to actively suppress from the output, distinct from simply not mentioning it in the main prompt. |
| What is ControlNet-style conditioning? | Adding an auxiliary structural signal (edge map, depth map, pose) alongside a text prompt to control composition/layout, one common approach among several for structural control. |
| Why is precise in-image text rendering hard for diffusion models? | The training objective optimizes for visually plausible pixel patterns; correct letterforms require a narrower, more exact target than general visual plausibility. |
| Why should generated image output be moderated even if the input prompt was screened? | Generation is a probabilistic process; a compliant prompt can occasionally produce non-compliant output, so output moderation is a distinct, mandatory check. |
| What does classifier-free guidance / guidance scale control? | How strongly the denoising process is steered toward the text conditioning versus generating more freely; higher values generally increase prompt adherence at some risk to naturalness. |
| Why is async job handling recommended for generation requests? | Generation latency commonly spans seconds to tens of seconds, which does not fit a typical synchronous request-timeout budget at production scale. |
| What are the two main positions in the generative-image copyright debate? | "Transformative fair use" (training is like learning general patterns, output is new) versus "unauthorized derivative work" (training used protected expression without permission or compensation). |
| What is the difference between inpainting and outpainting? | Inpainting regenerates a masked interior region of an existing image; outpainting extends an image beyond its original canvas with plausible new content. |
| Why does mask feathering matter for inpainting quality? | A hard-edged mask often produces a visible seam where regenerated and original content meet; feathering softens that transition. |
| What is a reasonable approach when a use case needs exact, correctly-spelled text in a generated image? | Generate the artwork without the text, then composite exact text using conventional image/typesetting tools rather than relying on the model to render it. |
| Why is seed reuse alone insufficient for guaranteeing character consistency across generations? | It is a nudge toward similarity, not a guarantee, especially when prompts differ across calls; stronger anchoring (reference image, fine-tuned adapter) is usually needed for strict consistency. |
| What replaced the GAN as the dominant image-generation paradigm, and why? | Diffusion models, primarily because their training objective is more stable and scales more predictably than the adversarial GAN objective, which is prone to instability and mode collapse. |
`,

  mcqs: `
**1. What does the "strength" parameter control in image-to-image generation?**
A) The resolution of the output image
B) How much the output is allowed to diverge from the input image's structure
C) The number of images generated per request
D) The content-moderation sensitivity

Answer: B — strength sets how much of the denoising process starts from the original image's structure versus generating more freely from it; low strength preserves composition closely, high strength allows more divergence.

**2. Why is output content moderation necessary even when input prompts are already screened?**
A) Input screening is always unreliable and should not be trusted at all
B) Generation is a probabilistic process, so even a compliant prompt can occasionally produce non-compliant output
C) Output moderation is only needed for image-to-image, not text-to-image
D) It is a legal formality with no real technical justification

Answer: B — this is the core reason output moderation is a distinct, mandatory pipeline stage rather than a redundant check.

**3. What is a well-documented reason precise in-image text rendering remains a weak point for diffusion models?**
A) Providers deliberately disable text rendering for legal reasons
B) Text rendering requires a discrete, exact correctness (correct letterforms and spelling) that is a narrower target than general visual plausibility, which is what the model's training objective optimizes for
C) Text rendering was never attempted by any model
D) It only affects self-hosted, not hosted, models

Answer: B — this connects directly to how diffusion training objectives work, as covered in Advanced Concepts.

**4. Which best characterizes the current state of the copyright/licensing debate around generative image models?**
A) Courts and legislators have universally settled that training on copyrighted images without a license is legal
B) Courts and legislators have universally settled that it is illegal
C) It remains genuinely unsettled, with active litigation and legislation and legitimate arguments on multiple sides
D) The debate is purely theoretical with no real litigation or legislative activity

Answer: C — this page presents both the "transformative fair use" and "unauthorized derivative work" positions evenhandedly because the matter is genuinely unresolved as of its knowledge cutoff.

**5. Why is async job handling (queue plus webhook/polling) generally recommended over a synchronous request for image generation?**
A) Providers do not support synchronous APIs at all
B) Generation latency commonly spans seconds to tens of seconds, which does not fit typical synchronous request-timeout budgets at production scale
C) Async is required by content-moderation regulations
D) Synchronous calls are always more expensive

Answer: B — see Production Usage and Data Flow for the architectural reasoning.

**6. What is the primary purpose of ControlNet-style structural conditioning?**
A) To reduce the cost of a generation request
B) To speed up the denoising process
C) To give control over composition, pose, or layout beyond what a text prompt alone can reliably specify
D) To replace the need for a text prompt entirely

Answer: C — structural conditioning (one common approach among several) adds an auxiliary signal like an edge map, depth map, or pose skeleton alongside the text prompt to constrain spatial layout.
`,

  "revision-notes": `
Image generation, in the application-focused sense this page covers, means using diffusion-based models — accessed via hosted APIs or self-hosted open-weight checkpoints — to produce images from text prompts, existing images, or masked regions of existing images. Diffusion models work by iterative denoising: starting from random noise (typically in a compressed latent space) and gradually refining it over many steps into a coherent image, conditioned on a text embedding via a guidance mechanism. This displaced GANs as the dominant approach because diffusion's training objective is more stable and scales more predictably, even though GANs remain in narrow use for some fast, single-pass generation tasks.

The four foundational operations are text-to-image (generate wholly new from a prompt), image-to-image (transform an existing image, with a "strength" parameter controlling how much structure is preserved), inpainting (regenerate a masked interior region), and outpainting (extend beyond the original canvas). Structural conditioning techniques like ControlNet-style approaches, and reference-image or fine-tuned-adapter techniques for style/subject consistency, extend control beyond what a text prompt alone can specify — but none of these are guarantees, and each should be validated empirically against the specific provider and use case.

Production engineering for image generation centers on treating generation as an async job (given typical multi-second-to-tens-of-seconds latency), running mandatory content moderation on generated OUTPUT (a distinct, non-optional check separate from any input-prompt screening, because generation is probabilistic and can occasionally produce non-compliant output from a compliant prompt), and managing cost through an explicit resolution/step-count policy per use case, since both are direct, often substantial cost and latency levers.

Two things need to be internalized as known, not-fully-solved limitations rather than surprises encountered in production: precise, correctly-spelled in-image text rendering remains a genuine weak point across current-generation models, for architectural reasons tied to how the denoising training objective optimizes for visual plausibility rather than discrete exactness; and the licensing/copyright status of both training data and generated output is a genuinely disputed, actively litigated and legislated area, with legitimate arguments on both the "transformative fair use" and "unauthorized derivative work" sides, and no single settled answer as of this page's knowledge cutoff.

Choosing among providers and self-hosting is a multi-axis decision (quality on your specific use cases, cost/latency at your volume, licensing risk tolerance, and whether fine-tuning/self-hosting is worth the operational cost) that should be re-benchmarked periodically given how fast this space moves, rather than settled once and assumed to remain optimal.
`,

  "learning-roadmap": `
**Week 1 — Foundations and first API calls.** Read Overview through Prerequisites. Make your first text-to-image API call, experiment with prompt structure (subject/style/modifiers), and try a negative prompt if your chosen provider supports one. Milestone: generate ten images across varied prompts and inspect what changes each modifier actually produces.

**Week 2 — Image-to-image, inpainting, and outpainting.** Work through Intermediate Concepts hands-on: transform an existing image with varying strength values, build a masked inpainting request, and try outpainting to extend a photo's canvas. Milestone: complete Lab 2 (inpainting-based object removal tool).

**Week 3 — Structural conditioning and consistency techniques.** Read Advanced Concepts and Internal Working closely. Experiment with a ControlNet-style structural-conditioning workflow if your provider/tooling supports it, and test at least two consistency techniques (seed reuse vs. reference-image anchoring) on a repeated-character generation task, comparing results honestly. Milestone: a short written comparison of which consistency technique worked better for your specific test case, and why.

**Week 4 — Production engineering.** Read Production Usage, Security, Performance, and Monitoring. Build an async generation service with a mandatory output-moderation gate (Lab 3), instrument it with the metrics from Monitoring, and write a resolution/step-count cost estimate for a realistic feature volume. Milestone: complete Lab 3 with passing tests specifically covering the moderation gate.

**Week 5 — Case studies, comparisons, and the licensing landscape.** Read Case Studies, Comparisons, and Security's copyright section closely enough to explain both positions in the debate evenhandedly to a non-technical stakeholder. Milestone: write a one-page internal memo (practice, not for actual legal use) summarizing the licensing landscape and recommending next steps (provider terms review, counsel involvement) for a hypothetical commercial feature.

**Next platform skill**: move to the **Video Models** skill, which extends the diffusion techniques covered here across the time dimension to generate video — the natural continuation of this page's foundation.
`,

  "official-docs": `
- OpenAI's image generation API documentation — covers request/response shapes, size/quality parameters, and content-policy details for OpenAI's hosted image models; verify current parameter names and pricing directly, as these change across model versions.
- Stability AI's API and model documentation — covers Stable Diffusion family model versions, both hosted API and self-hostable open-weight checkpoints, and licensing terms per model version (these differ across Stable Diffusion versions, so check the specific version's license).
- Black Forest Labs' FLUX model documentation — covers the FLUX model family's API and self-hosting options and license terms.
- Google's Imagen documentation (via Vertex AI or related product documentation) — covers Google's hosted image-generation offering and its specific content-policy and usage terms.
- Adobe Firefly documentation — useful specifically for understanding a licensed-training-data-positioned provider's terms of service and generative-fill/inpainting feature set.
- C2PA (Coalition for Content Provenance and Authenticity) specification documentation — the leading content-credential/provenance-metadata standard referenced in Security and Latest Updates; worth reading directly if implementing disclosure/watermarking features.

Verify exact current API parameters, pricing, and content-policy details directly against each provider's documentation before building against it — this page's knowledge cutoff means specific details may have changed.
`,

  books: `
- **Generative Deep Learning by David Foster** — covers GANs, VAEs, and diffusion models with hands-on code, a good bridge between this page's conceptual treatment and the full training-time mathematics deferred to the Deep Learning skill.
- **Dive into Deep Learning (D2L) by Zhang, Lipton, Li, and Smola** — a freely available, code-first deep learning text with strong generative-modeling coverage; useful for grounding the neural-network fundamentals underlying diffusion models.
- **Deep Learning by Goodfellow, Bengio, and Courville** — the classic foundational deep learning text; does not cover diffusion models specifically (predates their popularization) but is the right foundational reference for the underlying neural-network theory referenced throughout this page's Internal Working and Advanced Concepts.
- **Designing Machine Learning Systems by Chip Huyen** — not diffusion-specific, but the best available reference for the production-systems discipline (monitoring, testing, deployment) this page applies specifically to image-generation features.
- **The Hundred-Page Machine Learning Book by Andriy Burkov** — a concise, broad primer useful for readers who want machine-learning fundamentals before tackling generative-model-specific material.

Diffusion-model-specific books are still a thin category relative to how recent the technology is — for the deepest, most current treatment, primary research papers (see Research Papers) and each provider's own technical documentation are the more authoritative source than any book at this page's knowledge cutoff.
`,

  blogs: `
- **Lilian Weng's blog (OpenAI)** — her long-form technical posts on diffusion models are widely regarded as some of the clearest, most rigorous public explanations of the underlying mathematics and are a natural next step after this page's conceptual treatment.
- **Stability AI's official blog** — direct source for Stable Diffusion model release notes, licensing changes, and technique explanations (including ControlNet-adjacent ecosystem developments) from the team most central to the open-weight diffusion ecosystem.
- **Hugging Face's Diffusers library blog and documentation** — high-signal, code-first explanations of diffusion techniques (latent diffusion, various conditioning methods) paired directly with a widely used open-source implementation, useful for readers who want to go from concept to running code quickly.
- **Two Minute Papers (video-adjacent but with an accompanying blog/summary format)** — approachable summaries of new generative-AI research, useful for staying current without reading every paper directly.
- Individual provider technical blogs (OpenAI, Google DeepMind, Black Forest Labs) for release-specific technical detail — check each provider's current blog directly rather than relying on secondary summaries for anything version-specific.

Avoid low-signal listicle-style "best AI image generator" blog content for technical understanding — it is abundant but rarely goes past marketing-level description; prefer the sources above or primary documentation for anything you intend to build against.
`,

  "research-papers": `
- **Denoising Diffusion Probabilistic Models (Ho, Jain, Abbeel, 2020)** — the paper that revived and simplified diffusion models into the form that underlies most current systems; the essential starting point for anyone going beyond this page's conceptual treatment.
- **High-Resolution Image Synthesis with Latent Diffusion Models (Rombach et al., 2022)** — introduces latent diffusion (running the denoising process in a compressed latent space), the technique underlying Stable Diffusion and referenced throughout this page's Internal Working section.
- **Learning Transferable Visual Models From Natural Language Supervision (Radford et al., 2021 — the CLIP paper)** — foundational to text conditioning in image generation via its contrastive text-image embedding alignment; also foundational to the Vision AI skill, making it a genuinely shared prerequisite paper across both skills.
- **Adding Conditional Control to Text-to-Image Diffusion Models (Zhang, Rombach, Agrawala, 2023 — the ControlNet paper)** — the paper behind the structural-conditioning technique covered (hedged, as one approach among several) in Advanced Concepts.
- **Classifier-Free Diffusion Guidance (Ho and Salimans, 2022)** — the paper behind the guidance-scale mechanism covered in Advanced Concepts and Internal Working.
- **Photorealistic Text-to-Image Diffusion Models with Deep Language Understanding (Saharia et al., 2022 — the Imagen paper)** — a foundational large-scale text-to-image diffusion system paper from the 2022 breakout year covered in History.

This is a genuinely active research area with new papers appearing frequently on diffusion-transformer architectures, faster sampling techniques, and consistency/control methods — treat the list above as foundational reading rather than a complete or current survey, and check a current arXiv listing or a recent survey paper for anything past this page's knowledge cutoff.
`,

  videos: `
- **Two Minute Papers (YouTube)** — short, accessible summaries of new generative-AI and diffusion-model research, good for staying broadly current without reading every paper.
- **Yannic Kilcher's paper-explanation videos (YouTube)** — deeper, more technical walkthroughs of individual papers (including diffusion-model and CLIP-adjacent papers), useful once you're ready to go past this page's conceptual level.
- **Hugging Face's Diffusers library video tutorials and course content** — practical, code-first walkthroughs pairing directly with the open-source Diffusers library, good for hands-on learners.
- **Conference talks from CVPR/NeurIPS on diffusion models** (search each conference's official YouTube channel for the specific year's diffusion-model sessions) — the most authoritative, though most technical, source for cutting-edge developments; useful once the conceptual foundation from this page is solid.
- Provider-specific product demo videos (Stability AI, Adobe Firefly, OpenAI) — useful for seeing current feature capabilities in practice, though treat marketing-oriented demo content as illustrative rather than a rigorous technical source.

Verify speaker/creator names and channel details directly, since specific video URLs and channel names can change; search each platform for the creator name plus the specific topic rather than relying on a single hardcoded link.
`,

  "github-repos": `
- **Hugging Face Diffusers** — the most widely used open-source library for running and building on diffusion models (Stable Diffusion, and many others), with strong documentation and active maintenance; a natural first stop for hands-on experimentation.
- **CompVis/stable-diffusion** and **Stability-AI's official Stable Diffusion repositories** — the reference implementations behind the Stable Diffusion model family, useful for understanding the actual reference architecture rather than only a wrapped library's abstraction.
- **lllyasviel/ControlNet** — the reference implementation behind the ControlNet structural-conditioning technique covered in Advanced Concepts, directly from its original author.
- **comfyanonymous/ComfyUI** — a widely used node-based UI and inference engine for diffusion workflows, useful for both experimentation and understanding how a production-adjacent pipeline (multi-step conditioning, custom workflows) is commonly assembled in the open-source ecosystem.
- **AUTOMATIC1111/stable-diffusion-webui** — one of the most widely adopted community UIs for running Stable Diffusion locally, useful for rapid hands-on experimentation without writing pipeline code from scratch.
- **black-forest-labs/flux** — the official repository for the FLUX model family, a more recent diffusion-transformer-based open-weight system.
- **openai/CLIP** — the reference implementation of CLIP, foundational to text conditioning here and shared with the Vision AI skill's ecosystem.

Star counts, maintenance status, and which repositories are considered current "best practice" shift quickly in this ecosystem — verify a repository is still actively maintained before building production dependencies on it.
`,

  "practice-problems": `
1. **Prompt structuring drill**: take five vague product-marketing prompts and rewrite each using the subject/style/modifier structure from Intermediate Concepts, then generate and compare outputs against the original vague versions.
2. **Strength-parameter exploration**: run the same image-to-image transformation at five different strength values and document, with generated samples, exactly where composition preservation breaks down.
3. **Mask-feathering tuning**: implement the feathering function from Coding Questions Problem 2 and tune feather_radius against three images of different resolutions, documenting the visible seam quality at each setting.
4. **Output-moderation pipeline test**: build the moderation gate from Testing's example and run it against a small labeled set of known-flaggable and known-clean sample images, reporting precision/recall.
5. **Cost-estimation exercise**: using the cost-estimator function from Coding Questions Problem 3, estimate the cost of regenerating a 500-item product catalog at three different resolution/step-count policies, and recommend one with justification.
6. **Consistency-technique comparison**: generate the same character across five scenes using seed reuse alone, then again using a reference-image-anchoring approach, and score visual consistency across both sets.
7. External practice: Hugging Face's Diffusers course exercises (hands-on notebooks covering latent diffusion, conditioning, and pipeline customization) for structured, code-first practice beyond this page.
8. External practice: recreate a ControlNet-style structural-conditioning workflow using an open-source pipeline (e.g. via Diffusers or ComfyUI) end to end, from extracting a control signal to generating a conditioned output.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client Layer
        Client["Client app\n(prompt / image / mask + params)"]
    end

    subgraph API Layer
        Gateway["API gateway:\nauth, rate limit,\nprompt/input validation"]
        InputMod["Optional input\nprompt screening"]
    end

    subgraph Async Processing
        Queue["Job queue"]
        Provider["Image-generation provider\n(hosted API or self-hosted model)"]
    end

    subgraph Safety and Storage
        OutputMod["Mandatory output\ncontent moderation"]
        Review["Human review queue\n(flagged content)"]
        Storage["Persist image +\nprovenance metadata"]
    end

    subgraph Observability
        Monitor["Monitoring:\ncost, latency,\nmoderation flag rate"]
    end

    Client --> Gateway
    Gateway --> InputMod
    InputMod --> Queue
    Queue --> Provider
    Provider --> OutputMod
    OutputMod -->|flagged| Review
    OutputMod -->|clear| Storage
    Storage --> Client
    Provider -.-> Monitor
    OutputMod -.-> Monitor
~~~

This reference architecture treats generation as an inherently async, provider-external operation wrapped by two distinct safety gates (input screening, mandatory output moderation) and a provenance-preserving storage layer — the shape that recurs across the marketing-creative, e-commerce, and design-tool project specs in Real Projects.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Image Generation))
    Foundations
      Diffusion models
        Iterative denoising
        Latent space
        Text conditioning
      History
        GANs to diffusion
        CLIP alignment
        2022 breakout year
    Core Operations
      Text-to-image
      Image-to-image
        Strength parameter
      Inpainting
        Mask feathering
      Outpainting
    Control Techniques
      Prompting
        Subject/style/modifiers
        Negative prompts
      ControlNet-style conditioning
      Consistency techniques
        Seed reuse
        Reference images
        Fine-tuned adapters
    Production Engineering
      Async job architecture
      Mandatory output moderation
      Cost and latency
        Resolution
        Step count
      Provenance metadata
    Known Weak Points
      Precise text rendering
      Dense object counting
      Consistency guarantees
    Ecosystem and Ethics
      Provider comparisons
      Self-hosting vs hosted API
      Copyright and licensing debate
        Transformative fair use
        Unauthorized derivative work
      Related skills
        Vision AI
        Video Models
        Deep Learning
        Guardrails
        Cost Optimization
~~~
`,
};

export default imageGeneration;
