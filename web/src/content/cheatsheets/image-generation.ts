import type { CheatSheetData } from "./types";

const imageGeneration: CheatSheetData = {
  title: "The Ultimate Image Generation Cheat Sheet",
  subtitle: "Diffusion models · prompting · editing operations · production toolbelt",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "Diffusion model", desc: "Generates images via iterative denoising from random noise", code: "DDPM, latent diffusion,\nStable Diffusion, FLUX, DiT" },
        { term: "Latent diffusion", desc: "Denoising runs in a compressed latent space, not raw pixels", code: "encoder -> denoise -> decoder\n(tractable at scale)" },
        { term: "Text conditioning", desc: "Text embedding steers the denoising trajectory toward the prompt", code: "text encoder -> embedding\n-> injected at every step" },
        { term: "Guidance scale", desc: "Controls how strongly output follows the text prompt vs. wanders freely", code: "higher = more literal,\nrisk of less natural output" },
        { term: "Step count", desc: "Number of denoising iterations; more steps generally = higher quality", code: "20-50 steps common;\ndirect cost/latency lever" },
        { term: "Seed", desc: "Random starting noise; reusing it nudges similarity, doesn't guarantee it", code: "seed=42 # same seed,\ndifferent prompt != same image" },
      ],
    },
    {
      title: "Core Operations",
      color: "blue",
      rows: [
        { term: "Text-to-image", desc: "Generate a wholly new image from a text description alone", code: "generate_image(prompt)" },
        { term: "Image-to-image", desc: "Transform an existing image + prompt; strength controls divergence", code: "transform_image(img, prompt,\n  strength=0.6)" },
        { term: "Inpainting", desc: "Regenerate only a masked region, preserve the rest", code: "inpaint_image(img, mask,\n  prompt)" },
        { term: "Outpainting", desc: "Extend an image beyond its original canvas with plausible content", code: "place on larger canvas,\nmask the new border area" },
        { term: "Mask feathering", desc: "Soften hard mask edges to avoid a visible seam", code: "ImageFilter.GaussianBlur(\n  radius=8)" },
        { term: "Async job pattern", desc: "Submit generation, poll or receive a webhook on completion", code: "submit -> job_id\npoll /jobs/{id} until done" },
      ],
    },
    {
      title: "Prompting Techniques",
      color: "emerald",
      rows: [
        { term: "Subject -> style -> modifiers", desc: "Standard effective prompt structure", code: "'a fox in a forest,\nwatercolor, soft lighting'" },
        { term: "Negative prompt", desc: "Specify what should NOT appear (not all providers support this)", code: "negative_prompt:\n'text, watermark, blurry'" },
        { term: "Reference image anchoring", desc: "Attach a reference image to pin down style/composition precisely", code: "image_prompt=ref_bytes\n+ text prompt" },
        { term: "Weighting/emphasis syntax", desc: "Push the model to prioritize certain prompt terms (provider-specific)", code: "varies by provider/tool;\ncheck current docs" },
        { term: "ControlNet-style conditioning", desc: "Auxiliary structural signal (edge/depth/pose) controls layout", code: "extract control map ->\ncondition alongside text" },
        { term: "Consistency techniques", desc: "No single guarantee: seed reuse < reference image < fine-tuned adapter", code: "LoRA-style fine-tune for\nstrict character consistency" },
      ],
    },
    {
      title: "Known Weak Points (verify per model)",
      color: "amber",
      rows: [
        { term: "In-image text rendering", desc: "Precise, correctly-spelled text remains a known weak point", code: "composite exact text with\nPillow/ImageMagick instead" },
        { term: "Dense object counting", desc: "Degrades on repetitive, occluded, or crowded scenes", code: "don't trust a count for a\nbusiness decision" },
        { term: "Strict multi-image consistency", desc: "No technique fully guarantees identical character/product across calls", code: "validate empirically before\ncommitting an architecture" },
        { term: "Model/provider drift", desc: "Behavior shifts after an unannounced model update", code: "pin model version + prompt\ntemplate together" },
        { term: "Seam artifacts in edits", desc: "Hard mask edges show visible boundaries", code: "always feather masks before\ninpainting/outpainting" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "rose",
      rows: [
        { term: "Skipping output moderation", desc: "Input screening alone does not guarantee compliant output", code: "WRONG: store(generate(p))\nRIGHT: moderate(generate(p))" },
        { term: "Synchronous request design", desc: "Generation latency (secs-tens of secs) breaks typical timeouts", code: "use async queue + webhook\nfrom the start" },
        { term: "Max settings 'to be safe'", desc: "Always maximizing resolution/steps silently multiplies cost", code: "define resolution/step policy\nper use case" },
        { term: "Trusting outpainting as factual", desc: "Generated fill is plausible, not a recovery of real content", code: "never use for forensic/legal\n'restoration' claims" },
        { term: "No provenance metadata", desc: "Can't reproduce, debug, or meet disclosure requirements later", code: "store prompt, params,\nmodel/version, timestamp" },
        { term: "Confident stance on copyright", desc: "Licensing/copyright status is genuinely unsettled law", code: "review provider ToS +\nget legal counsel per case" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Output moderation gate", desc: "Mandatory check on generated images before storage/delivery", code: "if moderate(img).flagged:\n  route_to_review(img)" },
        { term: "Resolution/step policy", desc: "Explicit per-use-case settings, not an unexamined max default", code: "thumbnails: low-res, few steps\nhero images: high-res, more steps" },
        { term: "Retry vs. reject distinction", desc: "Transient failures retry; content-policy rejections should not", code: "if 'rejected' in error: raise\nelse: retry with backoff" },
        { term: "Caching key", desc: "Avoid re-paying for an identical prompt+params request", code: "key = hash(prompt + params\n  + model_version)" },
        { term: "Monitoring signals", desc: "Track cost, latency, and moderation-flag rate specifically", code: "Histogram('image_gen_seconds')\nCounter('..._moderation_flags')" },
        { term: "Provider fallback", desc: "Documented secondary provider/model for outages or rejections", code: "primary fails ->\nfallback_provider.generate()" },
      ],
    },
  ],
};

export default imageGeneration;
