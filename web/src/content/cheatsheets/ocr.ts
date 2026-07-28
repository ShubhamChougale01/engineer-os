import type { CheatSheetData } from "./types";

const ocr: CheatSheetData = {
  title: "The Ultimate OCR Cheat Sheet",
  subtitle: "Classical pipeline · deep learning · layout understanding · structured extraction",
  sections: [
    {
      title: "Core Concepts",
      color: "violet",
      rows: [
        { term: "OCR", desc: "Optical Character Recognition — converting image pixels into machine-readable text", code: "text = pytesseract.image_to_string(image)" },
        { term: "Printed text OCR", desc: "Regular glyphs, consistent spacing — the easiest recognition tier", code: "Best-served case; clean fonts, high contrast" },
        { term: "Handwriting recognition (HWR)", desc: "Irregular, person-specific glyph shapes — no fixed reference font", code: "Needs more training data; less reliable than printed" },
        { term: "Scene text recognition", desc: "Text in a photographed real-world scene", code: "Hard due to rotation, lighting, occlusion, texture" },
        { term: "Bounding box", desc: "Position of recognized text on the page", code: "{left, top, width, height} per word/line" },
        { term: "Confidence score", desc: "Engine's certainty in a recognized word/field", code: "Track per FIELD, not just per document" },
        { term: "Document layout understanding", desc: "Recovering structure: tables, forms, reading order", code: "Distinct from flat text extraction" },
      ],
    },
    {
      title: "Classical Pipeline",
      color: "blue",
      rows: [
        { term: "Binarization", desc: "Threshold grayscale/color image to pure black/white", code: "cv2.threshold(img, 0, 255,\n  cv2.THRESH_BINARY + cv2.THRESH_OTSU)" },
        { term: "Deskew", desc: "Correct rotation before recognition", code: "estimate angle from text-line contours\nrotate image by -angle" },
        { term: "Layout analysis", desc: "Find text blocks, columns, tables, reading order", code: "Skip this -> multi-column text reads scrambled" },
        { term: "Segmentation", desc: "Isolate lines, then characters, for recognition", code: "Fragile: touching/overlapping chars merge or split wrong" },
        { term: "Recognition", desc: "Classify each segmented unit into text", code: "Hand-engineered features (classical) or\nCNN/ViT + classifier (modern)" },
        { term: "Post-processing", desc: "Dictionary / language-model correction of likely misreads", code: "Constrain to plausible words or formats\n(e.g. invoice-number patterns)" },
        { term: "Compounding error", desc: "Each stage's mistakes break the next stage", code: "Bad binarize -> bad segment -> wrong classify" },
      ],
    },
    {
      title: "Modern Deep Learning",
      color: "emerald",
      rows: [
        { term: "CNN / ViT encoder", desc: "Encodes a text line/region into a feature sequence", code: "See the CNNs skill for encoder internals" },
        { term: "LSTM / Transformer decoder", desc: "Reads the encoded feature sequence", code: "Sequence model over image features" },
        { term: "CTC loss", desc: "Learns input-output alignment without char-level segmentation", code: "No explicit 'which pixel is which char'\nneeded during training" },
        { term: "End-to-end transformer models", desc: "Skip detection+recognition as separate stages entirely", code: "Donut, TrOCR: image in, text/JSON out" },
        { term: "Multimodal LLM OCR", desc: "Prompt a vision-capable LLM to read + reason about a document", code: "See the Vision AI skill for API mechanics" },
        { term: "Debuggability tradeoff", desc: "End-to-end models reduce compounding error but hide WHERE a failure occurred", code: "Vary one input factor at a time to isolate" },
      ],
    },
    {
      title: "Layout: Tables & Forms",
      color: "amber",
      rows: [
        { term: "Table extraction", desc: "Recover row/column cell structure, not just text", code: "textract.analyze_document(\n  FeatureTypes=['TABLES'])" },
        { term: "Form / key-value extraction", desc: "Pair a label with its value", code: "FeatureTypes=['FORMS']\nwalk KEY_VALUE_SET relationships" },
        { term: "Merged cell", desc: "A cell spanning multiple rows/columns", code: "Naive whitespace heuristics break here" },
        { term: "Wrapped cell text", desc: "One logical cell spans two visual lines", code: "Row-grouping-by-position heuristics can\nmisread this as two separate rows" },
        { term: "Multi-column reading order", desc: "Correct sequence across columns, not raw top-to-bottom", code: "Detect column boundaries BEFORE recognizing" },
        { term: "Anti-pattern", desc: "Reconstructing tables from flat text + regex/whitespace", code: "WRONG: line.split() on OCR text\nRIGHT: use a layout-aware table feature" },
      ],
    },
    {
      title: "Structured Extraction Pattern",
      color: "rose",
      rows: [
        { term: "1. Read", desc: "OCR engine or VLM call, with position + confidence", code: "data = pytesseract.image_to_data(img,\n  output_type=Output.DICT)" },
        { term: "2. Parse into schema", desc: "Validate shape with a typed model", code: "class Invoice(BaseModel):\n    total_amount: float\n    vendor: str" },
        { term: "3. Validate values", desc: "Plausibility beyond shape — schema alone misses wrong-but-valid values", code: "@field_validator('total_amount')\ndef check(v): assert 0 < v < 10_000_000" },
        { term: "4. Reconcile", desc: "Cross-check extracted fields against each other", code: "sum(item.qty * item.price) ~= total" },
        { term: "5. Route on confidence", desc: "Low-confidence or failed-validation -> human review", code: "if conf < 0.85 and field in critical:\n    send_to_review()" },
        { term: "Abstain, don't guess", desc: "Prompt LLM extraction to return null on unclear fields", code: "\"Use null if not clearly visible.\n Do not guess.\"" },
      ],
    },
    {
      title: "Engines & Tooling",
      color: "cyan",
      rows: [
        { term: "Tesseract", desc: "Free, open-source, local, offline OCR engine", code: "pytesseract.image_to_string(image)" },
        { term: "Cloud OCR API", desc: "AWS Textract / Google Cloud Vision / Azure Document Intelligence", code: "textract.detect_document_text(\n  Document={'Bytes': image_bytes})" },
        { term: "Self-hosted deep model", desc: "TrOCR, Donut, PaddleOCR, EasyOCR — full control, needs ops", code: "GPU-provisioned serving, own versioning" },
        { term: "Multimodal LLM", desc: "GPT-4o / Claude / Gemini vision — flexible, higher cost/latency", code: "client.chat.completions.create(\n  model='gpt-4o', ...)" },
        { term: "Preprocessing libs", desc: "OpenCV / Pillow for binarize, deskew, resize", code: "cv2.imread(path, cv2.IMREAD_GRAYSCALE)" },
      ],
    },
    {
      title: "Pitfalls & Production",
      color: "violet",
      rows: [
        { term: "Skipping preprocessing", desc: "Skew/low contrast fed raw -> silent accuracy loss, no explicit error", code: "Always binarize + deskew first" },
        { term: "Script/language gap", desc: "Benchmarks skew Latin-script/English; other scripts often worse", code: "Evaluate accuracy PER script/language" },
        { term: "Aggregate confidence trap", desc: "Document-level score hides one wrong critical field", code: "Threshold per FIELD, not per document" },
        { term: "One engine for everything", desc: "Printed/handwriting/scene-text need separate evaluation", code: "Route by document type, not one global engine" },
        { term: "PII / retention", desc: "Documents often contain PII — apply retention policy", code: "Check vendor-side retention terms too" },
        { term: "Golden evaluation set", desc: "Real, hard documents (skewed, low-quality, multi-script)", code: "Re-run on every engine/prompt/preproc change" },
        { term: "Monitoring signals", desc: "Confidence distribution, review-queue rate, input drift", code: "Track resolution/skew/language stats over time" },
      ],
    },
  ],
};

export default ocr;
