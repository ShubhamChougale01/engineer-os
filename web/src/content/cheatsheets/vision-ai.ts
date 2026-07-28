import type { CheatSheetData } from "./types";

const visionAi: CheatSheetData = {
  title: "The Ultimate Vision AI Cheat Sheet",
  subtitle: "Multimodal LLMs · image input · prompting patterns · production toolbelt",
  sections: [
    {
      title: "Core Tasks & Concepts",
      color: "violet",
      rows: [
        { term: "VLM", desc: "Vision-language model: accepts image + text, outputs text/structured data", code: "GPT-4V/4o, Claude vision,\nGemini multimodal, LLaVA, Qwen-VL" },
        { term: "Captioning", desc: "Describe an image in free text", code: "prompt: 'Describe this image.'" },
        { term: "VQA", desc: "Visual question answering — answer a specific question about an image", code: "prompt: 'How many chairs\nare in this photo?'" },
        { term: "Grounding / localization", desc: "Identify WHERE something is (bounding box/point)", code: "hedge: verify pixel accuracy\nis documented per model/version" },
        { term: "Image token", desc: "Unit an image is converted into before entering the LLM's sequence", code: "cost scales with resolution\nand tile count, not file size" },
        { term: "Resolution / detail tier", desc: "Controls how much of the image the model can actually see, and cost", code: "low: flat small cost, coarse\nhigh: tiled, cost scales w/ size" },
        { term: "Frame sampling (video)", desc: "Extract representative still frames instead of native video understanding", code: "uniform / scene-change /\ntask-driven sampling" },
      ],
    },
    {
      title: "Sending Images to an API",
      color: "blue",
      rows: [
        { term: "Message content shape", desc: "Content becomes a LIST mixing text and image blocks", code: "content: [\n  {type: 'text', text: '...'},\n  {type: 'image_url', image_url: {url}}\n]" },
        { term: "Base64 input", desc: "Encode local/unhosted image bytes directly", code: "b64 = base64.b64encode(data).decode()\nurl = f'data:image/jpeg;base64,{b64}'" },
        { term: "URL input", desc: "Reference an already-hosted image", code: "image_url: {url: 'https://cdn/x.jpg'}" },
        { term: "Detail parameter", desc: "Explicitly request low/high detail encoding", code: "image_url: {url: b64_url, detail: 'high'}" },
        { term: "Multiple images", desc: "Send several images in one message for comparison", code: "content: [text, image1, image2]\n# cost multiplies per image" },
        { term: "max_tokens", desc: "Cap the RESPONSE length; does not limit input image cost", code: "max_tokens=300" },
        { term: "JSON mode", desc: "Constrain output to valid JSON for structured extraction", code: "response_format={'type':'json_object'}" },
      ],
    },
    {
      title: "Prompting Patterns",
      color: "emerald",
      rows: [
        { term: "Describe before concluding", desc: "Reduces hallucination by grounding the answer in stated observations", code: "'List every object you see,\nthen answer the question.'" },
        { term: "Explicit uncertainty framing", desc: "Reduces confident guessing on ambiguous images", code: "'Only report what is directly\nvisible; say so if unclear.'" },
        { term: "Schema-constrained extraction", desc: "Ask for an exact JSON shape, null for missing fields", code: "'Return ONLY JSON:\n{vendor, total, currency}\nUse null if not visible.'" },
        { term: "Few-shot with images", desc: "Show example image + ideal answer pairs for odd/strict formats", code: "messages: [ex1_img, ex1_answer,\n           ex2_img, ex2_answer, query]" },
        { term: "Comparison prompting", desc: "Ask the model to compare two images explicitly", code: "'Do these show the same item?\nExplain any differences.'" },
        { term: "Confidence request", desc: "Ask the model to flag low-confidence answers itself", code: "'Include a confidence field:\nhigh / medium / low.'" },
      ],
    },
    {
      title: "Known Weak Points (hedge, verify per model)",
      color: "amber",
      rows: [
        { term: "Exact counting", desc: "Weak on dense, occluded, or repetitive scenes", code: "structural: no enumeration\nmechanism, just token attention" },
        { term: "Precise measurement", desc: "Cannot reliably give exact distances/angles/sizes", code: "qualitative estimate OK,\nnot a number a decision depends on" },
        { term: "Grounding precision", desc: "Bounding boxes/coordinates often approximate, not guaranteed pixel-accurate", code: "verify vendor docs before\nbuilding a feature on it" },
        { term: "Small text / low light / blur", desc: "Degrades silently — model answers confidently anyway", code: "test on real hard images,\nnot easy demo photos" },
        { term: "EXIF orientation", desc: "Sideways photo not corrected before sending -> wrong-seeming answer", code: "normalize orientation during\npreprocessing, before resize" },
        { term: "Model-version drift", desc: "Behavior can shift after an unannounced model update", code: "pin model version + prompt\ntogether in version control" },
      ],
    },
    {
      title: "Common Pitfalls",
      color: "rose",
      rows: [
        { term: "Trusting VLM counts for decisions", desc: "Use a dedicated detector for counts that gate real actions", code: "WRONG: int(vlm_count_reply)\nRIGHT: len(detector.detect(img))" },
        { term: "Full-res images 'to be safe'", desc: "Silently multiplies token cost with no quality benefit", code: "resize_for_tier(img, tier)\nbefore encoding, always" },
        { term: "Regex-parsing free text", desc: "Brittle; breaks silently when phrasing shifts", code: "use response_format json_object\ninstead of string matching" },
        { term: "Treating a hedge as an answer", desc: "'I cannot tell' stored as real data corrupts downstream logic", code: "route hedges to fallback /\nhuman review explicitly" },
        { term: "Skipping a golden eval set", desc: "Demo-image success does not predict real-user-upload accuracy", code: "build eval set from real, hard,\nvaried production-like images" },
        { term: "Text-in-image prompt injection", desc: "Image-embedded text can be read as instructions, not content", code: "treat all VLM-extracted text\nas untrusted data" },
        { term: "SSRF via URL image input", desc: "Attacker supplies an internal URL for your backend to fetch", code: "validate/allowlist any URL\nyour own backend fetches" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Resolution-tier policy", desc: "Explicit per-task-type resolution choice, tested against hard cases", code: "receipts: high, 1024px\nthumbnails: low, flat cost" },
        { term: "Caching key", desc: "Avoid re-paying for identical analysis", code: "key = hash(image_bytes)\n     + prompt_version + model_version" },
        { term: "Retry with stricter prompt", desc: "On malformed JSON, retry once with an explicit format-only instruction", code: "attempt 2: base_prompt +\n'Return JSON only, no markdown.'" },
        { term: "Timeout + fallback model", desc: "Vision calls run slower than text-only; always cap and fall back", code: "timeout=30\n# fallback: secondary vendor/model" },
        { term: "Monitoring signals", desc: "Track beyond RED: image tokens, hedge rate, input drift", code: "Histogram('vision_image_tokens')\nCounter('..._requests', ['status'])" },
        { term: "Composition rule", desc: "Precise subtask -> specialized model; flexible reasoning -> VLM", code: "count/coords/text -> CNN/OCR\nsummary/judgment -> VLM" },
        { term: "Server-side validation", desc: "Never trust client-supplied file type, size, or resolution", code: "check MIME + dimensions + size\nbefore any decode/resize step" },
      ],
    },
  ],
};

export default visionAi;
