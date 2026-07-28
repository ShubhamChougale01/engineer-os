import type { SkillContent } from "../types";

/**
 * OCR (Optical Character Recognition) — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const ocr: SkillContent = {
  overview: `
OCR (Optical Character Recognition) is the umbrella term for extracting machine-readable text — and increasingly, machine-readable structure — from images and documents: scanned pages, photographed receipts, PDFs that are really just images of text, screenshots, street signs, and handwritten notes. The core problem sounds simple ("turn pixels into characters") but splits into genuinely different sub-problems depending on what the pixels contain: **printed text** (clean, regular fonts, the "classic" OCR problem), **handwriting recognition** (irregular, person-specific, much harder), and **scene text** (text embedded in a photographed real-world scene — a storefront sign, a license plate — with arbitrary lighting, angle, and occlusion). This page treats all three, plus a fourth problem that most people conflate with plain text extraction but that deserves its own treatment: **document layout understanding** — recovering the structure of a table, a multi-column article, or a form's field-label pairing, not just a flat stream of characters in reading order.

For an AI engineer today, OCR sits at an interesting inflection point. There is a mature, decades-deep lineage of purpose-built OCR engines (Tesseract, commercial SDKs, cloud OCR APIs from AWS/Google/Azure) that do one thing — turn pixels into text and bounding boxes — very well, cheaply, and predictably. Layered on top of that, multimodal large language models (the subject of the sibling **Vision AI** skill) can now be prompted directly to read text out of an image and simultaneously reason about it: extract a total from a receipt, fill a JSON schema from an invoice, summarize a scanned contract. This page's job is to go deep specifically on the **text/document-extraction problem** — the classical pipeline, the modern deep-learning end-to-end models, table and form structure recovery, and the tradeoffs between "call a dedicated OCR engine" and "just ask a vision-capable LLM" — without re-deriving the general vision-language-model architecture, which is covered thoroughly in the **Vision AI** skill and only referenced here.

Key characteristics worth internalizing up front: OCR accuracy is never a single number. It is highly conditional on document quality (skew, contrast, resolution, compression artifacts), script and language (Latin scripts are the best-served; many scripts and mixed-language documents are much harder), and task (reading a clean printed invoice line versus reading a doctor's handwritten note versus reading a rotated street sign are three different difficulty tiers even though all three get called "OCR"). A pipeline that reports "99% accurate" on a clean, well-lit, English printed test set can fall apart on a skewed, low-light photo of a multi-column form in a different script — and this gap between demo accuracy and production accuracy is the single most common way OCR projects go wrong, explored in depth in Common Mistakes and Anti-Patterns below.
`,

  history: `
OCR's history is genuinely long — it predates deep learning by most of a century — which is part of why it has such a rich lineage of purpose-built classical techniques still in production use today.

| Year | Milestone |
|------|-----------|
| 1914 | Emanuel Goldberg builds an early machine that could read characters and convert them into telegraph code — one of the earliest documented "reading machines." |
| 1929–1931 | Gustav Tauschek patents an "optophone"-style reading device; Paul Handel patents related character-recognition ideas — the term "optical character recognition" starts appearing in patents around this period. |
| 1950s | Early commercial OCR (David Shepard's "Gismo" and related machines) reads typewritten text for specific business use cases like postal sorting and bank check processing (MICR fonts, designed to be maximally easy for a machine to read, ship around this time). |
| 1974 | Ray Kurzweil's company demonstrates omni-font OCR — the first system that can read most printed fonts without being tuned to one specific typeface — paired with early text-to-speech to build reading machines for the blind. |
// eslint-disable-next-line no-irregular-whitespace
| 1980s–1990s | OCR becomes a mainstream desktop and enterprise capability; commercial engines (Caere's OmniPage, ABBYY FineReader) mature the classical pipeline — binarization, layout analysis, segmentation, per-character classification — to a strong commercial standard for printed Latin-script documents. |
| 1985 | Tesseract's early development begins at Hewlett-Packard (as an internal research project); it's later open-sourced and eventually maintained by Google starting 2006, becoming the most widely used open-source OCR engine. |
| 2006 | Google acquires and open-sources Tesseract; it becomes the default "free OCR" building block for a generation of projects. |
| 2012–2015 | Deep learning reshapes the field: CNN-based feature extraction (see the **CNNs** skill) replaces hand-engineered character features; recurrent architectures (LSTM) combined with Connectionist Temporal Classification (CTC) loss let models read a whole text LINE end-to-end without needing to segment individual characters first — a major simplification over the classical per-character segmentation pipeline. |
| 2018–2020 | Cloud OCR APIs (Google Cloud Vision, AWS Textract, Azure Computer Vision/Form Recognizer) mature into full document-intelligence products — going beyond flat text extraction to table detection, key-value form-field extraction, and receipt/invoice-specific parsing as first-class API outputs. |
| 2021–2023 | Transformer-based end-to-end OCR and document-understanding models emerge (Donut, TrOCR, LayoutLM family) that skip an explicit text-detection-then-recognition pipeline and instead train a single model, often image-to-sequence, to go straight from a document image to structured or textual output, folding layout understanding into the same model rather than treating it as a separate post-processing pass. |
| 2023–2025 | Multimodal LLMs with vision capability (GPT-4V and successors, Claude's vision capability, Gemini's multimodal models) become usable directly as "OCR by prompting" — read this text, extract this field — without a dedicated OCR engine at all, trading a specialized model's speed and cost predictability for a general model's flexibility and reasoning. Exact accuracy comparisons between dedicated OCR engines and general multimodal LLMs on document tasks continue to shift with each model generation — verify current benchmarks rather than trusting any one comparison as durable. |

The throughline: OCR moved from "recognize this one character shape" (classical, per-glyph) to "recognize this whole line as a sequence" (CTC/LSTM-era) to "understand this whole document, structure and all, in one model call" (modern transformer and multimodal-LLM era) — each step trading more of the pipeline's hand-engineered structure for more of a single learned model's capacity.
`,

  "why-it-exists": `
Before OCR, converting a printed or handwritten page into text usable by a computer meant a human typing it in by hand — slow, expensive, and the single biggest bottleneck to digitizing the huge volume of paper records businesses, libraries, and governments had already accumulated by the time computers became common. Early OCR exists to remove that bottleneck for the narrowest, most tractable case first: clean, printed, single-font text on a scanned page, the kind produced by typewriters and early printers.

The field then had to widen in three directions, each driven by a real gap the earlier narrow solution didn't cover. Omni-font recognition (1970s) existed because early OCR only worked on the specific typeface it was tuned to — a bank's OCR system tuned for its own statements couldn't read a different font without retraining, which was untenable once OCR needed to handle arbitrary incoming documents. Layout-aware OCR existed because flat character-by-character recognition, even done perfectly, gives you the WRONG answer on a two-column newspaper page or a table — reading top-to-bottom straight across a two-column layout interleaves unrelated sentences from each column, and reading a table's cells in raw left-to-right, top-to-bottom pixel order destroys which value belongs to which row and column. Handwriting recognition existed because a huge fraction of real-world documents (forms filled out by hand, historical archives, medical notes) are not printed text at all, and the assumptions that make printed-text OCR tractable (regular glyph shapes, consistent spacing) don't hold.

Modern deep-learning and multimodal-LLM-based OCR exist because the classical pipeline's hand-engineered stages (binarize, deskew, segment characters, classify each one, then bolt on separate layout-analysis logic) each introduce their own error mode, and each error compounds into the next stage — a bad binarization threshold breaks segmentation even if the character classifier itself is excellent. An end-to-end learned model that goes from raw pixels to output text (or structured output) in one differentiable pipeline can, when trained on enough diverse data, sidestep a lot of this compounding-error problem, at the cost of needing much more training data and being harder to debug stage-by-stage when it does fail.
`,

  "problem-it-solves": `
OCR and document understanding solve several concrete problems that no single simpler approach covers on its own.

**1. Converting a fixed image of text into an editable, searchable, queryable representation.** A scanned contract, a photographed receipt, or a screenshot of a table is, to a computer, just a grid of pixel values until OCR turns it into characters a database can index, a script can parse, or a person can copy-paste. This is the foundational unlock: search, full-text indexing, accessibility (screen readers), and any downstream automation all require this conversion first.

**2. Handling text the computer never "typed" in the first place.** Printed OCR handles text that was digitally composed and then printed (so a "ground truth" digital version usually existed once but was lost). Handwriting recognition and scene text handle text that was NEVER digital — a note written by hand, a sign painted on a wall — which is a strictly harder problem because there's no canonical font or spacing to lean on.

**3. Recovering structure, not just characters.** A flat stream of recognized words is often useless for the actual downstream task. An invoice's value is only useful paired with its label ("Total: $482.10", not just the tokens "Total" and "482.10" floating independently); a table's cell values are only useful with their row/column position preserved. Document layout understanding — detecting tables, columns, form key-value pairs, headers, and reading order — turns "here are the words in this image" into "here is the document's actual information architecture," which is what most real business processes (invoice processing, form intake, contract review) actually need.

**4. Structured, schema-validated extraction for automation.** Combining OCR (or a multimodal LLM reading the document) with a defined schema — an invoice has a vendor, a total, line items — turns unstructured documents into structured records a downstream system (accounting software, a database, a workflow engine) can consume reliably, which is the actual business goal behind most "OCR" projects; raw text extraction is a means to that end, not the end itself.

What OCR and document understanding deliberately do **not** solve, and this needs to be stated plainly: they do not guarantee perfect accuracy on any given document, especially outside clean, well-lit, high-resolution, common-script conditions; they do not substitute for source-of-truth validation on anything a real business decision depends on (a misread digit on a check amount is a correctness problem, not a UX inconvenience); and a generic OCR/document-understanding system is not automatically good at every document TYPE — a system tuned for invoices does not automatically transfer to handwritten medical charts or dense multi-column academic papers without evaluation on that specific document type. This gap between "OCR works" and "OCR works reliably on YOUR documents" is the central theme of Common Mistakes and Anti-Patterns below.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain the classical OCR pipeline stage by stage (binarization, deskew, layout analysis, segmentation, recognition, post-processing) and identify where each stage's errors compound into the next.
2. Distinguish printed-text OCR, handwriting recognition, and scene-text recognition as different difficulty tiers, and explain why techniques that work for one often fail for another.
3. Explain how modern deep-learning OCR (CNN+LSTM+CTC, and transformer-based image-to-sequence models) differs architecturally from the classical segment-then-classify pipeline.
4. Distinguish flat text extraction from document layout understanding, and explain why treating a table as plain text loses information a downstream system needs.
5. Run a dedicated OCR engine (Tesseract) and a cloud OCR API against a real image, and compare their outputs including confidence scores and bounding boxes.
6. Prompt a multimodal LLM to perform OCR and structured extraction from a document, and explain concretely where this approach is stronger or weaker than a dedicated OCR engine.
7. Design a structured-extraction pipeline that combines OCR/document reading with a schema (e.g. a Pydantic model) and validates the extracted values, not just their shape.
8. Identify common preprocessing failures (skew, poor contrast, low resolution) and apply the right correction before recognition, rather than after.
9. Reason honestly about language/script coverage gaps and multi-script documents, and design a system that surfaces low-confidence or unsupported-script cases rather than silently guessing.
10. Compare classical OCR engines, cloud OCR APIs, specialized document-understanding models, and multimodal-LLM-based OCR on cost, latency, accuracy characteristics, and structural-understanding capability, and justify a choice for a given production scenario.
`,

  prerequisites: `
- **Required**: basic Python and comfort calling an HTTP API or a Python SDK — the worked examples on this page use Python throughout, in the style of the **Python** skill.
- **Required**: basic image-handling concepts (what a pixel is, what resolution and grayscale/binary mean) — no computer-vision math is assumed, but the vocabulary is used freely.
- **Helpful**: the **CNNs** skill, since deep-learning OCR's recognition stage is typically a CNN or CNN-adjacent encoder (or a Vision Transformer) reading image patches, exactly as covered there.
- **Helpful**: the **Vision AI** skill, which covers the general architecture and API mechanics of multimodal LLMs in depth; this page assumes that background when discussing "using a multimodal LLM for OCR" and focuses instead on what's specific to text/document extraction rather than re-deriving VLM internals.
- **Helpful**: the **Structured Outputs** skill, for the schema-validation half of the "OCR plus structured extraction" pattern covered in Intermediate Concepts and the worked example below.
- **Not required but related**: the **RAG** skill (OCR'd documents are a common ingestion source for retrieval pipelines) and the **Image Generation** skill (the inverse direction: producing images rather than reading them).
`,

  "beginner-concepts": `
### What OCR actually outputs

A common misconception is that OCR gives you "the text" as a single string. Most real OCR engines and APIs actually return a much richer structure: for every recognized word (or line, or character, depending on the engine), you typically get the recognized text, a bounding box (where on the page it was found), and a confidence score (how sure the engine is). Treating OCR output as just a flat string throws away information — the bounding boxes are what later let you reconstruct layout, and the confidence scores are what let you flag likely-wrong reads instead of silently trusting them.

### The three text-recognition problems, and why they're different difficulty tiers

- **Printed text OCR**: text produced by a printer or screen — regular glyph shapes, consistent spacing, usually high contrast against the background. This is the best-served case; engines like Tesseract and cloud OCR APIs handle clean printed Latin-script text well.
- **Handwriting recognition (HWR)**: text written by hand — glyph shapes vary enormously between people (and even within one person's writing), strokes can connect letters together (cursive), and there is no fixed "correct" glyph shape to match against the way a font provides for printed text. HWR models generally need much more training data per unit of accuracy and remain meaningfully less reliable than printed-text OCR, especially on unconstrained (non-form-field) handwriting.
- **Scene text recognition**: text embedded in a photographed real-world scene — a street sign, a product label, a t-shirt logo. The challenge here isn't glyph irregularity so much as environmental variation: arbitrary rotation and perspective distortion, uneven lighting, partial occlusion, and complex or textured backgrounds behind the text, all of which a flat scanned page never has to deal with.

A system built and tuned for one of these three often performs noticeably worse on the others without being retrained or re-evaluated on that specific case — treat "OCR" as a family of related problems, not a single solved capability.

### Your first OCR call — Tesseract (open-source, local)

~~~python
import pytesseract
from PIL import Image

# Tesseract must be installed as a system binary separately from the pytesseract
# Python wrapper (e.g. apt install tesseract-ocr, or brew install tesseract).
image = Image.open("invoice.png")

text = pytesseract.image_to_string(image)
print(text)

# Richer output: word-level text, bounding boxes, and confidence in one call
data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
for i, word in enumerate(data["text"]):
    if word.strip():
        print(word, data["conf"][i], data["left"][i], data["top"][i])
~~~

Note the second call: real production code almost always wants image_to_data (or the equivalent structured call in a cloud API), not the flat image_to_string, precisely so it can inspect confidence and position rather than trusting an opaque string.

### Your first OCR call — a cloud OCR API

~~~python
import boto3

textract = boto3.client("textract", region_name="us-east-1")

with open("invoice.png", "rb") as f:
    image_bytes = f.read()

response = textract.detect_document_text(Document={"Bytes": image_bytes})

for block in response["Blocks"]:
    if block["BlockType"] == "LINE":
        print(block["Text"], block["Confidence"])
~~~

Cloud OCR APIs (AWS Textract shown here; Google Cloud Vision and Azure's Document Intelligence follow a similar shape) typically require no local model management, scale elastically, and — as covered in Intermediate Concepts — often include layout- and form-aware modes beyond flat text detection, at a per-page cost and a network round trip that a fully local engine like Tesseract avoids.

### Preprocessing matters before you even call OCR

~~~python
import cv2

image = cv2.imread("scanned_page.jpg", cv2.IMREAD_GRAYSCALE)

# Binarization: convert grayscale to pure black/white, which classical and many
# modern OCR pipelines expect or perform noticeably better with.
_, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

# Deskew: a scanned page photographed or fed at even a few degrees off
# horizontal measurably hurts recognition accuracy for classical pipelines
# and can hurt deep-learning ones too if the training data was mostly upright.
coords = cv2.findNonZero(255 - binary)
angle = cv2.minAreaRect(coords)[-1]
# (a full deskew implementation rotates the image by the negative of this angle;
# omitted here for brevity — see Common Errors for the pitfall of skipping this step)
~~~
`,

  "intermediate-concepts": `
### Document layout understanding: tables, forms, and multi-column pages

Flat OCR gives you text and, at best, per-word bounding boxes. Document layout understanding is a distinct capability — sometimes a separate model stage, sometimes folded into the same model — that recovers the document's STRUCTURE: which words form a table cell together, which label goes with which form value, and what order to read a multi-column page in.

~~~python
import boto3

textract = boto3.client("textract", region_name="us-east-1")

with open("invoice.png", "rb") as f:
    image_bytes = f.read()

# analyze_document with FeatureTypes requests structure, not just flat text:
# TABLES recovers row/column structure; FORMS recovers label-value pairs.
response = textract.analyze_document(
    Document={"Bytes": image_bytes},
    FeatureTypes=["TABLES", "FORMS"],
)

# Blocks now include KEY_VALUE_SET and TABLE/CELL block types in addition to LINE/WORD,
# each with relationships pointing to the blocks that make up that structure.
for block in response["Blocks"]:
    if block["BlockType"] == "KEY_VALUE_SET" and block.get("EntityTypes") == ["KEY"]:
        pass  # walk block["Relationships"] to pair this key with its value block
~~~

The reason this matters enough to call out on its own: a table read as plain text loses the row/column association entirely. If a table has columns "Item," "Quantity," "Price," reading it as flat left-to-right text per line can still work for a single-row-per-line simple table, but breaks badly the moment a cell wraps to a second line, a column is empty for some rows, or the table spans a page break — cases that are the NORM in real invoices and forms, not the exception. Purpose-built table extraction (Textract's TABLES feature, Azure Document Intelligence's table model, or a layout-aware model like the LayoutLM family) explicitly models cell boundaries and row/column membership, rather than inferring it from text position alone.

### Multi-column reading order

A two-column academic paper or newspaper page, read in raw top-to-bottom pixel order across the full page width, interleaves unrelated sentences from each column. Layout-aware OCR systems detect column (and more generally, block) boundaries first, then determine reading order within and across those blocks, before running recognition — this is a genuinely separate step from "recognize these characters," and skipping it produces text that is technically all "correctly recognized" character-by-character but reads as nonsense.

### Structured extraction: OCR/vision output plus a schema

The pattern nearly every real invoice/receipt/form pipeline converges on is: get text (with position and confidence) from OCR or a vision-capable model, then parse it against a defined schema, then VALIDATE the parsed values — not just their shape. See the full worked example in Coding Questions below; the shape in brief:

~~~python
from pydantic import BaseModel, field_validator

class InvoiceExtraction(BaseModel):
    vendor: str
    invoice_number: str
    total_amount: float
    currency: str

    @field_validator("total_amount")
    @classmethod
    def total_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("total_amount must be positive")
        return v
~~~

A schema alone catches shape errors (a missing field, wrong type); it does not catch a plausible-looking but wrong VALUE (a misread "8" as "3" that still parses as a valid float). Real production pipelines add plausibility checks (does the total roughly match the sum of line items, is the date within a sane range) as a second validation layer beyond the schema itself.

### Multimodal LLMs as an OCR engine

Building on the **Vision AI** skill's API mechanics, a multimodal LLM can be prompted directly to read and extract from a document image:

~~~python
import json
from openai import OpenAI

client = OpenAI()

PROMPT = """
Read this receipt image and return ONLY valid JSON matching this shape:
{"merchant": string, "date": string, "total": number, "line_items": [{"desc": string, "price": number}]}
If a field is not visible or not present, use null. Do not guess a value you cannot see clearly.
"""

def extract_receipt(image_b64: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": PROMPT},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
            ],
        }],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
~~~

This can be remarkably effective because the model reasons about layout and semantics simultaneously (it can infer "this number under the word Total is the total" the way a human would, without an explicit table-detection stage) — but accuracy on any given document type is not guaranteed and varies significantly by document quality, layout complexity, and script; the tradeoffs versus a dedicated OCR engine are covered in full in Comparisons and Advanced Concepts.
`,

  "advanced-concepts": `
### The classical pipeline versus end-to-end deep learning, stage by stage

The classical OCR pipeline is a sequence of separately-engineered stages: **binarization** (convert to black/white), **deskew** (correct rotation), **layout analysis** (find text blocks, columns, tables), **character/line segmentation** (isolate individual characters or lines to recognize), **recognition** (classify each isolated glyph, historically via hand-engineered features and a classifier like a support vector machine, later a CNN), and **post-processing** (dictionary/language-model correction of likely misreads). Each stage's errors compound: a bad binarization threshold under uneven lighting breaks segmentation even with a perfect character classifier downstream, and a bad segmentation (two touching characters merged into one blob) makes even a perfect classifier guess wrong, because it's now looking at the wrong unit of input entirely.

Modern deep-learning OCR removes the explicit segmentation stage for many cases: a CNN (or Vision Transformer) encodes the whole text-line image into a feature sequence, an LSTM (or Transformer) reads that sequence, and a Connectionist Temporal Classification (CTC) loss lets the model learn to output the correct character sequence WITHOUT ever being told exactly which pixels correspond to which character during training — CTC handles the alignment problem internally. This CNN+LSTM/Transformer+CTC recipe (the architecture behind engines like Tesseract 4/5's LSTM mode and many production line-recognition models) is a genuinely different approach from segment-then-classify, and it is considerably more robust to touching characters, unusual spacing, and font variation, because it never depends on a hard segmentation decision being correct first.

The most recent step folds even MORE of the pipeline into one model: transformer-based image-to-sequence architectures (the Donut and TrOCR family, and general-purpose multimodal LLMs used for OCR) skip explicit text detection and per-line recognition as separate stages entirely, training a single model end-to-end from a document image to output text or even structured output (JSON) directly. This further reduces compounding pipeline error but at the cost of needing much larger and more diverse training data to generalize, and it becomes considerably harder to debug WHERE an error came from when the whole pipeline is one opaque model rather than a sequence of separately-inspectable stages — a real production tradeoff, not just an academic one, covered in Debugging below.

### Confidence, uncertainty, and why a single accuracy number is misleading

OCR confidence scores (per-word or per-character) are a genuinely useful signal that most beginner integrations ignore — routing low-confidence reads to human review, rather than trusting every character equally, is one of the highest-leverage production decisions available. But confidence scores from different engines are not directly comparable to each other (a 0.85 from Tesseract and a 0.85 from a cloud API are not the same underlying calibration), and a model can be confidently wrong — especially a multimodal LLM asked to "read" a field it cannot actually see clearly, which will often still produce a plausible-looking guess rather than an explicit "I cannot read this," unless the prompt explicitly instructs it to abstain (see the Intermediate Concepts worked example, which does exactly this).

### Language and script diversity — a real, frequently underestimated gap

Most OCR benchmarks and demos are run on Latin-script, English-language documents, because that's where training data and evaluation sets are richest. Accuracy on other scripts (Arabic, which is written right-to-left and has context-dependent letter shapes; CJK — Chinese, Japanese, Korean — with thousands of characters and no whitespace word boundaries; Devanagari and other Indic scripts, with complex conjunct-character rules) varies widely by engine and is frequently worse than the English-language accuracy the same engine reports elsewhere. Documents mixing multiple scripts or languages on one page (a bilingual form, a menu with an English translation under a native-script line) are harder still, since the engine or model needs to correctly detect a script/language boundary before or during recognition rather than after. A system rolled out globally without evaluating per-script and per-language accuracy separately is a very common way "OCR works" in a demo becomes "OCR silently produces garbage for a third of our users" in production.

### Table extraction as a structurally distinct problem

Recovering a table's structure (not just its text) requires answering questions flat OCR was never designed to answer: where are the cell boundaries, does a cell span multiple rows or columns (a merged cell), is a given line of text a new row or a continuation (wrapped text) of the previous row's cell. Purpose-built table-extraction models and API features (Textract TABLES, Azure Document Intelligence's table model, LayoutLM-family models trained with layout-aware pretraining objectives) treat this as first-class, while treating a table as "just more text to OCR" and then trying to reconstruct rows/columns from whitespace and position heuristics after the fact is fragile — see Anti-Patterns for exactly this failure mode.
`,

  "internal-working": `
Here is the classical pipeline, step by step, followed by how the modern deep-learning path differs at each stage:

~~~mermaid
flowchart TB
    A["Input image"] --> B["Binarization:\nthreshold to black/white"]
    B --> C["Deskew:\ndetect and correct rotation"]
    C --> D["Layout analysis:\nfind text blocks, columns, tables"]
    D --> E["Segmentation:\nisolate lines, then characters"]
    E --> F["Recognition:\nclassify each character/glyph"]
    F --> G["Post-processing:\ndictionary/language-model correction"]
    G --> H["Recognized text\n+ bounding boxes + confidence"]

    A --> I["Modern path: CNN/ViT encoder\nreads the whole line/region as one sequence"]
    I --> J["LSTM or Transformer\nsequence model"]
    J --> K["CTC decoding or\nautoregressive decoding"]
    K --> H
~~~

1. **Binarization**: the input image (often color or grayscale) is thresholded into pure black and white pixels, historically a prerequisite for classical character segmentation because it turns the problem into a clean foreground-versus-background separation. Otsu's method (automatically choosing a threshold from the image's own pixel-intensity histogram) is a common classical technique; poor lighting or shadows can defeat a naive global threshold, which is why adaptive/local thresholding exists for uneven-lighting documents.
2. **Deskew**: if the page or photo is rotated even a few degrees, classical line-segmentation logic (which often assumes roughly horizontal text lines) degrades sharply. Deskew estimates the rotation angle (e.g. via the orientation of detected text-line contours) and rotates the image to correct it before further processing.
3. **Layout analysis**: the page is segmented into regions — paragraphs, columns, tables, images, headers/footers — and a reading order is established across those regions. This stage is what a flat "recognize every character in raster order" approach skips, and skipping it is exactly what produces nonsense output on multi-column or tabular documents (see Advanced Concepts).
4. **Segmentation**: within each recognized text region, individual lines are isolated, then (in the most classical approach) individual characters within each line. Character segmentation is notoriously fragile — touching or overlapping characters (common in cursive handwriting, tight kerning, or low-resolution scans) can merge into one blob or split incorrectly, and this single bad segmentation decision dooms the character classifier downstream no matter how good it is.
5. **Recognition**: each segmented unit (historically a single character; in modern approaches, a whole line or word as a sequence) is classified into the text it represents. Classical engines used hand-engineered features (stroke direction, character contours) with a traditional classifier; modern engines use a CNN or Vision Transformer encoder feeding an LSTM or Transformer sequence model, trained end-to-end with a sequence loss like CTC that avoids needing character-level segmentation as a prerequisite at all.
6. **Post-processing**: a dictionary or language model corrects likely misreads by checking whether the recognized output forms plausible words/phrases in the expected language — this is also where domain-specific correction happens (e.g. constraining output to plausible invoice-number formats).

The critical mental model: every stage in the classical pipeline can fail independently, and failures compound forward (a bad binarization can't be un-done by a great character classifier) — this is precisely the motivation for end-to-end deep-learning approaches that collapse multiple stages into one learned, differentiable model, trading stage-by-stage debuggability for reduced compounding error, as discussed in Advanced Concepts and Debugging.
`,

  architecture: `
### Model architecture — recap and framing

The recognition-model internals are covered in Internal Working. At the system level, a production document-extraction service is an application built AROUND a recognition step (whether that's Tesseract, a cloud OCR API, or a multimodal LLM call), with most of the engineering effort in the surrounding layers.

### Application architecture — a production document-extraction service

~~~text
document-extraction-service/
├── pyproject.toml
├── src/doc_extraction/
│   ├── api/                      # FastAPI routes: /extract, /health
│   ├── ingestion/
│   │   ├── validate.py           # file type, size limits, page-count caps
│   │   └── preprocess.py         # binarize, deskew, denoise before recognition
│   ├── recognition/
│   │   ├── engine_tesseract.py   # local OCR engine adapter
│   │   ├── engine_cloud.py       # cloud OCR API adapter (Textract/Vision/Document Intelligence)
│   │   ├── engine_vlm.py         # multimodal-LLM-based reading adapter
│   │   └── router.py             # picks an engine per document type/quality
│   ├── layout/
│   │   └── structure.py          # table/form/multi-column structure recovery
│   ├── extraction/
│   │   ├── schemas.py            # Pydantic models per document type (invoice, receipt, form)
│   │   └── validate.py           # value-plausibility checks beyond schema shape
│   ├── evaluation/                 # golden document set, per-field accuracy tracking
│   └── core/                       # config, logging, cost tracking
└── tests/
~~~

The most consequential architectural decision is the **recognition/router.py** boundary: choosing, per document (or per document TYPE), whether a fast/cheap dedicated OCR engine is sufficient, whether a cloud API's layout-aware features (tables/forms) are needed, or whether a multimodal LLM call is warranted for documents needing flexible reasoning alongside reading. Treating every document as needing the same engine — usually defaulting to "just call the LLM for everything" or the opposite mistake of "just run Tesseract on everything" — is the most common architecture-level misstep, covered in Anti-Patterns.

### Reference production architecture

~~~mermaid
flowchart TB
    Client["Client app\n(uploads document)"] --> Gateway["API gateway:\nauth, rate limit,\nfile validation"]
    Gateway --> Preprocess["Preprocess:\nbinarize, deskew,\ndenoise"]
    Preprocess --> Router{"Document type\nand quality"}
    Router -->|clean printed, simple layout| Tesseract["Local OCR engine\n(Tesseract)"]
    Router -->|tables/forms, need structure| Cloud["Cloud OCR API\n(layout-aware mode)"]
    Router -->|complex reasoning needed| VLM["Multimodal LLM\n(vision-capable)"]
    Tesseract --> Extract["Structured extraction:\nschema + validation"]
    Cloud --> Extract
    VLM --> Extract
    Extract --> Review{"Low confidence\nor failed validation?"}
    Review -->|yes| Human["Human review queue"]
    Review -->|no| Store["Persist structured record"]
~~~
`,

  "data-flow": `
Tracing one request end to end, from an uploaded document image to a validated structured record:

~~~mermaid
sequenceDiagram
    participant Client
    participant API as API gateway
    participant Pre as Preprocessing
    participant Router as Engine router
    participant Engine as OCR engine / VLM
    participant Layout as Layout/structure recovery
    participant Extract as Schema extraction + validation
    participant Review as Human review queue

    Client->>API: POST /extract (document image, doc type)
    API->>API: validate file type/size, auth, rate limit
    API->>Pre: raw image
    Pre->>Pre: binarize, deskew, denoise
    Pre->>Router: preprocessed image + doc type
    Router->>Engine: route to engine (local/cloud/VLM) per policy
    Engine-->>Layout: recognized text + boxes + confidence
    Layout->>Layout: recover reading order, table cells, form key-value pairs
    Layout->>Extract: structured intermediate representation
    Extract->>Extract: parse against schema, validate values
    Extract->>Review: flag if low confidence or failed validation
    Review-->>Client: final structured record (auto or human-confirmed)
~~~

Two details matter operationally: preprocessing happens BEFORE the engine choice (a badly skewed image can make even the best engine perform worse, so fixing it upstream benefits every downstream path equally), and the review step is not optional for anything a business decision depends on — silently accepting the first extraction result without any confidence or plausibility check is the single most common way an OCR pipeline produces a wrong answer that nobody catches until a customer complains.
`,

  "production-usage": `
### Tooling and integration patterns

Production document-extraction pipelines typically combine three tool categories: a local/open-source engine (Tesseract, or a self-hosted deep-learning model) for cheap, offline, high-volume simple cases; a cloud OCR/document-intelligence API (AWS Textract, Google Cloud Vision/Document AI, Azure Document Intelligence) for layout-aware extraction (tables, forms) without hosting a model yourself; and a multimodal LLM API (via the same SDKs covered in the **Vision AI** skill) for documents needing flexible reasoning or unusual formats a rigid schema-based engine wasn't built for.

~~~bash
uv add pytesseract pillow opencv-python boto3 pydantic
uv add --dev pytest
# Example: run an evaluation harness against a fixed, hand-labeled document test set
uv run python -m doc_extraction.evaluation.run_eval --dataset golden_set/
~~~

### Config and operational defaults

- **Engine choice policy per document type**: define an explicit policy (e.g. "clean printed invoices from known vendors: Tesseract; unfamiliar layouts and forms: cloud Textract with TABLES/FORMS; ambiguous or handwritten documents: multimodal LLM with human review fallback") rather than one engine for every document type.
- **Preprocessing as a mandatory stage, not optional**: binarize, deskew, and denoise before recognition every time — this is cheap and benefits every downstream engine choice equally.
- **Confidence thresholds per field, not just per document**: a document can be 95% "confident" overall while the one field that matters most (the total amount) was read at 60% confidence — route on the field-level signal, not an aggregate.
- **Golden evaluation set of real, hard documents** (not clean demo scans) — skewed photos, low light, unusual layouts, and multiple scripts if your user base is multilingual — re-run whenever the engine, prompt, or preprocessing changes.
- **Human review queue** for low-confidence or validation-failed extractions, with the queue itself feeding back into the evaluation set over time.
`,

  "industry-examples": `
- **Expensify, Ramp, and other expense-management companies**: process photographed receipts at high volume, combining OCR/vision-based reading with schema-based extraction (merchant, amount, date, category) as a core product feature.
- **Banks and check-processing systems**: use OCR variants specifically tuned for MICR (the machine-readable font on checks) and handwritten or printed dollar amounts, a decades-old production use case that predates deep-learning OCR entirely and still uses purpose-built recognition tuned to that narrow, well-defined problem.
- **Google Books and large-scale digitization projects**: use OCR at massive scale to make scanned historical books and documents full-text searchable, handling enormous variation in print quality, fonts, and languages across centuries of source material.
- **Government and postal services**: use OCR (originally one of the earliest large-scale commercial OCR use cases) for automated mail sorting and address reading, and increasingly for digitizing forms and historical records.
- **AWS, Google Cloud, and Microsoft Azure**: each offer document-intelligence products (Textract, Document AI, Document Intelligence) that package OCR with layout/table/form understanding as a managed API, reflecting the industry's shift from "just OCR" to "document understanding" as the productized capability.

Exact accuracy figures, product names, and which vendor leads on which document type change frequently — treat this list as illustrative of the CATEGORY of production use, and verify current vendor documentation before citing any specific benchmark as authoritative.
`,

  "best-practices": `
1. **Always preprocess before recognition** — binarize, deskew, and denoise; a great recognition engine cannot fully compensate for a badly skewed or low-contrast input image.
2. **Never treat OCR output as ground truth without a confidence check** — route low-confidence words or fields to human review rather than silently trusting every character equally.
3. **Choose the engine per document type and quality, not once globally** — a policy that routes clean printed documents to a cheap local engine and ambiguous/complex ones to a cloud API or multimodal LLM beats a single one-size-fits-all choice.
4. **Treat table and form extraction as a structurally distinct problem from flat text extraction** — use a layout-aware API feature or model, don't reconstruct row/column structure from whitespace heuristics after flat OCR.
5. **Validate extracted VALUES, not just schema shape** — a misread digit still parses as a valid number; add plausibility checks (does a total match the sum of line items, is a date in a sane range).
6. **Build a golden evaluation set from real, hard documents** — skewed photos, low light, unusual layouts, multiple scripts — not clean demo scans, and re-run it on every engine, prompt, or preprocessing change.
7. **Evaluate accuracy per language/script separately if your documents are multilingual** — an aggregate accuracy number can hide a script your engine handles far worse than its headline number suggests.
8. **Prompt multimodal-LLM-based OCR to explicitly abstain rather than guess** — "if a field is not clearly visible, use null" measurably reduces confident-but-wrong extractions compared to an open-ended read.
9. **Cache and version your extraction pipeline configuration** (engine, prompt, preprocessing settings) together, since they interact — a regression can appear only in combination, not from any one change alone.
10. **Cap file size, page count, and resolution at ingestion** — an unvalidated document upload is a generic resource-exhaustion attack surface before it's an OCR feature, exactly as covered in the **Vision AI** and **CNNs** skills' security sections.
11. **Design an explicit low-confidence/human-review path from day one** — do not bolt this on after a wrong extraction has already caused a business problem.
12. **Budget cost and latency with your actual document sizes and volumes**, not the smallest demo document tested with — multi-page documents and high-resolution scans both materially change per-document cost.
`,

  "anti-patterns": `
### Treating a table as plain text

~~~python
# WRONG — flat OCR text, then trying to reconstruct table structure with regex/whitespace heuristics
raw_text = pytesseract.image_to_string(table_image)
rows = [line.split()  for line in raw_text.splitlines()]  # breaks on wrapped cells, merged cells, empty cells

# RIGHT — use a layout-aware table extraction feature/model that models cell structure directly
response = textract.analyze_document(Document={"Bytes": image_bytes}, FeatureTypes=["TABLES"])
# walk TABLE/CELL blocks and their row/column indices from the response's relationships
~~~

### Other common anti-patterns

- **Skipping preprocessing and feeding raw, skewed, low-contrast photos straight to an OCR engine** — accuracy silently degrades with no explicit error, and the failure looks like "the OCR engine is bad" when the real cause is upstream image quality.
- **Assuming one engine's accuracy on a clean English demo document generalizes to every language, script, and document type** — a multilingual or handwriting-heavy production workload needs its own evaluation, not an inherited assumption from a different benchmark.
- **Trusting a multimodal LLM's extracted numeric field at face value for a business-critical decision** without a plausibility or reconciliation check — exactly the same failure mode the **Vision AI** skill covers for counting, applied here to reading a specific digit or amount.
- **Parsing free-text OCR/LLM output with regex instead of using a structured extraction schema** — brittle, and breaks silently the moment output phrasing shifts after an engine or model update.
- **Never reviewing low-confidence extractions** — building the confidence signal into your pipeline and then not acting on it anywhere is equivalent to not having it at all.
- **Ignoring reading order on multi-column or complex layouts** — recognizing every character correctly but reading them in the wrong order produces fluent-looking but factually scrambled text, a failure mode that's easy to miss in a spot check of a few words but devastating for full-document understanding.
- **Using the same engine/pipeline for printed text, handwriting, and scene text** without separately evaluating each — these are different difficulty tiers (see Beginner Concepts) and a policy tuned for one commonly underperforms on the others.
`,

  performance: `
### Measure first

~~~python
import time

def timed_ocr_call(engine, image) -> tuple[str, float]:
    start = time.perf_counter()
    result = engine.recognize(image)
    elapsed = time.perf_counter() - start
    return result, elapsed
~~~

Log latency, and for API-based engines, per-document cost, from day one, broken down by document type and page count — a multi-page PDF processed as one "document" can hide a per-page cost multiplier that only becomes visible once you slice the metric that way.

### The optimization hierarchy (apply in order)

1. **Preprocess correctly the first time** — a good binarization/deskew step improves both speed (less rework, fewer failed recognition attempts) and accuracy simultaneously; this is the highest-leverage, lowest-risk optimization available.
2. **Route by document complexity** — send simple, clean, printed documents to a cheap local engine (Tesseract) and reserve a cloud API's layout-aware mode or a multimodal LLM call for documents that actually need that extra capability; this is usually the single biggest cost lever for a mixed document workload.
3. **Cache on document hash plus pipeline version** — avoid re-processing an identical document (a common case in workflows where the same invoice template recurs).
4. **Batch where the vendor offers it** — cloud OCR APIs and multimodal LLM providers frequently offer a batch/async tier at reduced cost for non-time-sensitive workloads (e.g. digitizing an existing archive).
5. **Downscale images to the resolution recognition actually needs**, not the raw camera/scanner resolution — oversized images cost more to transmit and process without improving accuracy past the point where text detail is already fully captured (mirrors the resolution-tier lesson in the **Vision AI** skill).
6. **Parallelize page-level processing for multi-page documents** — pages within one document are usually independent recognition units and can be processed concurrently.

### Numbers worth knowing (order of magnitude, verify current vendor pricing/docs)

Local engines like Tesseract have no per-call API cost but real CPU cost that scales with document count and complexity; cloud OCR APIs charge per page/document, often with a cheaper tier for basic text detection and a pricier tier for layout/form features; multimodal LLM calls incur image-token cost similar to any vision-enabled LLM call (see the **Vision AI** skill's cost discussion) — exact figures vary by vendor and change over time, so treat any specific number as something to re-verify before it drives a budget decision.
`,

  scalability: `
Document-extraction pipelines scale differently depending on whether the bottleneck is a self-hosted local engine or a hosted API.

### Local/self-hosted engines (Tesseract, a self-hosted deep-learning model)

- **Horizontal scaling** is standard stateless-worker scaling — spin up more workers to process more documents concurrently, following the same patterns as the **Kubernetes** skill's general guidance.
- **CPU (or GPU, for deep-learning models) is the real bottleneck** at high volume — capacity-plan around observed per-document processing time, and consider a lighter/faster model tier for simple documents versus a heavier one only where needed.

### Cloud OCR APIs and multimodal LLM APIs

- **The bottleneck is usually vendor rate limits and cost**, not your own infrastructure — the same story as the **Vision AI** skill's scalability section; production systems need request queuing, backoff, and cost alerting.
- **Provider-side latency variance** under peak load should be planned for with generous timeouts and a documented fallback engine, since a single-vendor dependency for a business-critical extraction pipeline is a real availability risk.

### Bottleneck table

| Bottleneck | Answer |
|------------|--------|
| High document volume overwhelming a single local-engine worker | Horizontal worker scaling; route simple documents to the cheapest sufficient engine |
| Vendor API rate limits under traffic spikes | Request queuing, backoff, multiple keys/vendors, pre-negotiated higher limits |
| Multi-page documents processed serially | Parallelize page-level recognition where pages are independent |
| Cost scaling with unnecessary image resolution/detail | Downscale to the resolution the task needs; route by document complexity |
| Human-review queue backing up under volume | Prioritize by confidence/value at risk, not pure FIFO; track queue depth as its own metric |
`,

  security: `
### OCR/document-extraction-specific attack surface

1. **Malicious or malformed file uploads**: an "image" or "PDF" upload endpoint is a generic file-upload attack surface first, an OCR feature second — validate file type, dimensions, page count, and size strictly before any decode/recognition work happens, exactly as covered in the **Vision AI** and **CNNs** skills' security sections.
2. **Prompt injection via document content, when using a multimodal LLM**: text rendered INSIDE a document (embedded instructions in a scanned page, a form field containing something like "ignore previous instructions") can be read by the model and potentially treated as an instruction rather than as data to extract — treat any text read from a document as untrusted data, never as a command your system should act on directly. See the **Vision AI** skill's identical concern for general image content.
3. **Sensitive data exposure in processed documents**: invoices, forms, IDs, and medical records routinely contain PII and financial data — apply the same data handling, retention, and access-control discipline you would to any PII-bearing data, and be deliberate about whether a cloud OCR API or LLM vendor retains uploaded documents, and for how long, per their documented policy.
4. **SSRF via URL-based document input**: if your API fetches a document from a caller-supplied URL, validate and restrict that fetch to prevent probing internal network resources, identical to the concern covered in the **Vision AI** skill.
5. **Extracted-output injection into downstream systems**: if OCR/extracted text is later interpolated into a database query, shell command, or another system's prompt without sanitization, treat it as untrusted input exactly as you would any user-supplied text (see the **OWASP Top 10** skill).

### Defenses

- Validate file type, page count, dimensions, and size strictly at the ingestion boundary before any decode or recognition work.
- Never let extracted "instructions" from a document trigger a privileged action without a validation/allowlist step in between.
- Apply your organization's PII handling and retention policy to processed documents, including provider-side retention terms for any cloud API or LLM vendor used.
- Restrict and audit any outbound URL fetch your backend performs to retrieve a document on a caller's behalf.
- Rate-limit and authenticate the extraction endpoint like any other production API surface handling sensitive data.
`,

  testing: `
Testing an OCR/document-extraction pipeline spans conventional software testing (the deterministic pipeline code) and evaluating a probabilistic recognition step against a curated, hand-labeled document set — both are required.

~~~python
# tests/test_extraction_pipeline.py
import pytest
from doc_extraction.ingestion.preprocess import deskew_image
from doc_extraction.extraction.schemas import InvoiceExtraction

def test_deskew_corrects_rotation():
    from PIL import Image
    rotated = Image.new("L", (800, 600), color=255).rotate(5, expand=True)
    corrected = deskew_image(rotated)
    # A full test would assert the estimated skew angle is near zero after correction;
    # this sketch checks the function runs and returns an image of a sane size.
    assert corrected.size[0] > 0 and corrected.size[1] > 0

def test_schema_rejects_negative_total():
    with pytest.raises(ValueError):
        InvoiceExtraction(vendor="Acme", invoice_number="123", total_amount=-5.0, currency="USD")

def test_schema_accepts_valid_extraction():
    result = InvoiceExtraction(vendor="Acme", invoice_number="123", total_amount=42.5, currency="USD")
    assert result.total_amount == 42.5
~~~

### The senior testing doctrine for OCR/document-extraction features

- **Unit test the deterministic pipeline code** (preprocessing, schema validation) like any software — these bugs are fully preventable and cheap to catch.
- **Build a golden evaluation set of real, hard documents** with known-correct expected field values, covering skewed/low-quality scans, multiple document templates, and every language/script your users actually submit — and score per-field accuracy, not just whole-document exact match.
- **Track per-field accuracy separately**, since a document can be "mostly right" while the one field a business decision depends on is systematically wrong — an aggregate score hides this.
- **Specifically test the known weak spots as their own evaluation slice**: handwriting, low light, unusual layouts, tables with merged/wrapped cells, and multi-script documents — exactly as the **Vision AI** skill recommends slicing evaluation by subgroup rather than trusting an aggregate number.
- **Regression-test the exact combination of preprocessing settings, engine choice, and prompt (if using a multimodal LLM) together** whenever any one changes — they interact, and testing them independently can hide a regression that only appears in combination.
`,

  debugging: `
### Escalation path

1. **Reproduce with the exact document image, not a re-scanned or re-compressed copy** — recognition output can be sensitive to compression artifacts and resolution, so confirm the issue reproduces with the precise bytes actually processed in production.
2. **Check preprocessing output before blaming recognition** — visually inspect the binarized/deskewed intermediate image; a surprisingly common root cause is a bad automatic threshold or an under-corrected skew angle that a human can immediately spot but that isn't logged or surfaced by default.
3. **Inspect confidence scores and bounding boxes per field**, not just the final parsed value — a low-confidence read that happened to parse into a plausible-looking number is a very different bug from a high-confidence engine simply being wrong.
4. **Isolate which pipeline stage is responsible** — for a classical/stage-based pipeline, test binarization, layout analysis, and recognition independently against the same input to find which stage's output first diverges from expected; for an end-to-end model (deep-learning line reader or multimodal LLM), this stage-by-stage isolation isn't possible, so instead vary one input factor at a time (resolution, rotation, prompt wording) to isolate the sensitivity.
5. **Compare against a different engine on the same document** — if a dedicated OCR engine, a cloud API, and a multimodal LLM all struggle equally on a given document, it's likely a genuine document-quality or structural issue (extreme skew, very low resolution, an unusual script) rather than an engine-specific bug, and the fix is upstream (better capture/preprocessing) rather than further engine tuning.
6. **Check for a table/layout misread specifically** — reading order and cell-association bugs often look like "correct words in a nonsensical order" rather than any individually wrong word, which is easy to miss in a quick spot check of individual recognized tokens.

~~~python
# Quick diagnostic: log preprocessing output stats plus raw recognition confidence
import logging

logger = logging.getLogger("doc_extraction")

def diagnostic_recognize(engine, image, doc_id: str):
    logger.info("ocr_preprocess", extra={"doc_id": doc_id, "size": image.size, "mode": image.mode})
    result = engine.recognize(image)
    low_confidence = [w for w in result.words if w.confidence < 0.7]
    logger.info("ocr_result", extra={"doc_id": doc_id, "low_confidence_count": len(low_confidence)})
    return result
~~~
`,

  monitoring: `
Production document-extraction features need monitoring at three levels: the service, the extraction quality, and the input distribution.

### Service-level metrics

~~~python
from prometheus_client import Counter, Histogram

OCR_REQUESTS = Counter("ocr_requests_total", "Requests", ["status", "engine"])
OCR_LATENCY = Histogram("ocr_request_seconds", "End-to-end latency", ["engine"])
OCR_CONFIDENCE = Histogram("ocr_field_confidence", "Per-field confidence score")

def track_call(engine: str, elapsed: float, avg_confidence: float, status: str) -> None:
    OCR_REQUESTS.labels(status=status, engine=engine).inc()
    OCR_LATENCY.labels(engine=engine).observe(elapsed)
    OCR_CONFIDENCE.observe(avg_confidence)
~~~

Track rate/errors/duration per endpoint as usual, plus per-field confidence distribution specifically — a shift toward lower confidence over time is often the earliest signal of a document-quality or template change before it shows up as an outright accuracy drop.

### Extraction-quality signals

- **Human-review queue rate over time** — a rising rate of documents routed to review can indicate a document-quality shift, a new unsupported template, or an engine/prompt regression; alert on a meaningful jump.
- **Sampled human review of auto-accepted extractions**, not just reviewed ones — the only reliable way to catch a quality regression in the cases your confidence threshold let through without review.
- **Per-field accuracy on the golden set**, tracked alongside cost, so a cost-cutting engine or resolution change is evaluated against its quality impact rather than shipped on savings alone.

### Input distribution drift

Track summary statistics of incoming documents (resolution, skew angle, detected language/script, document type) over time — a new client integration or user segment submitting systematically different documents (a new partner's invoice template, a new region's language) can silently change both cost and accuracy without any pipeline code change.
`,

  deployment: `
### A production Dockerfile for a document-extraction service (local engine plus cloud/API fallback)

~~~dockerfile
FROM python:3.12-slim AS base
# Slim base is sufficient for the API-orchestration layer; Tesseract itself is a
# lightweight system binary, not a GPU workload, so no CUDA base image is needed here.

WORKDIR /app

# Install Tesseract and image-format libraries needed by Pillow/OpenCV.
RUN apt-get update && apt-get install -y --no-install-recommends \\
    tesseract-ocr libtesseract-dev libjpeg62-turbo libpng16-16 \\
    && rm -rf /var/lib/apt/lists/*
# Cleaning apt lists keeps the image smaller and avoids shipping stale package indexes.

COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
# --frozen respects the lockfile exactly; --no-dev keeps test-only deps out of the image.

COPY src/ ./src/
ENV PYTHONUNBUFFERED=1
# Unbuffered stdout so logs reach the container runtime immediately, not on buffer flush.

# Non-root user: a document-ingestion endpoint parses untrusted file uploads, so minimize
# blast radius if a parsing library vulnerability is ever exploited.
RUN useradd -m appuser
USER appuser

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "doc_extraction.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

### Deployment considerations specific to document-extraction features

- **Secrets management**: cloud OCR API and LLM vendor API keys are high-value secrets — load them from a secrets manager, never bake them into the image (see the **Secrets Management** skill).
- **Egress rules**: this service needs outbound HTTPS to whichever cloud OCR/LLM vendors are in use; restrict egress to exactly the hosts required.
- **Rollout strategy for engine/prompt/preprocessing changes**: treat any change to the recognition pipeline with the same rollout discipline as a code deploy — canary against the golden set and the human-review-rate metric before rolling forward to full traffic.
- **Self-hosted deep-learning OCR model deployment** (if using an open-weight line-recognition or document-understanding model instead of Tesseract or a cloud API) needs GPU-provisioned nodes and a serving framework, following the same model-registry/versioning discipline covered in the **CNNs** skill's deployment section.
`,

  "production-checklist": `
- [ ] Preprocessing (binarize, deskew, denoise) runs before every recognition call, regardless of engine.
- [ ] Server-side file validation (type, size, page count, dimensions) runs before any decode step.
- [ ] Engine choice is routed per document type/quality via an explicit policy, not a single global default.
- [ ] Table and form extraction uses a layout-aware feature/model, not whitespace-based reconstruction from flat text.
- [ ] Structured output (schema-based extraction) is used for anything downstream code parses.
- [ ] Extracted values are validated for plausibility, not just schema shape.
- [ ] Per-field confidence thresholds route low-confidence extractions to human review.
- [ ] A golden evaluation set of real, hard documents exists, covering skew, low quality, and every language/script in production, and is re-run on every pipeline change.
- [ ] Multimodal-LLM-based extraction prompts explicitly instruct the model to abstain rather than guess on unclear fields.
- [ ] Caching is in place, keyed on document content plus pipeline version.
- [ ] Cost and latency are estimated and monitored using realistic document sizes/volumes.
- [ ] Timeouts, retries, and an engine/vendor fallback are configured for any API-based recognition call.
- [ ] PII handling and retention policy for processed documents is defined and matches organizational policy, including vendor-side retention terms.
- [ ] Monitoring covers latency, per-field confidence distribution, human-review rate, and input-distribution drift.
- [ ] Rollout of any engine, prompt, or preprocessing change is canaried against the golden set before full traffic.
- [ ] Reading order and layout structure are explicitly verified for multi-column and tabular document types, not assumed correct from flat-text spot checks.
`,

  "common-mistakes": `
1. **Feeding raw, skewed, low-contrast images straight into recognition** — the WHY: nearly every recognition engine, classical or deep-learning, was trained or engineered assuming roughly upright, reasonably clean input; skipping preprocessing degrades accuracy silently, with no explicit error to notice.
2. **Treating a table as a flat sequence of words** — the WHY: row/column association is exactly the information flat OCR discards, and reconstructing it from whitespace heuristics breaks on wrapped cells, merged cells, and multi-page tables, which are the norm in real documents, not edge cases.
3. **Assuming one engine's demo accuracy generalizes across languages, scripts, and document types** — the WHY: OCR training data and evaluation are disproportionately Latin-script/English-heavy, and per-script accuracy is rarely reported alongside a headline number.
4. **Ignoring confidence scores entirely** — the WHY: confidence is the cheapest available signal for routing likely-wrong reads to review, and not using it means every character is trusted equally, correct or not.
5. **Trusting a multimodal LLM's read of a specific digit or amount without a plausibility check** — the WHY: a VLM can produce a fluent, confident, wrong answer on an unclear field exactly as covered in the **Vision AI** skill's counting discussion, applied here to reading a single character.
6. **Not accounting for handwriting and scene text as separate, harder problems** — the WHY: a pipeline tuned and evaluated only on printed text will often silently underperform on handwritten forms or photographed signs without anyone re-evaluating it for that different input distribution.
7. **Skipping reading-order recovery on multi-column layouts** — the WHY: every individual word can be recognized correctly while the overall text is scrambled nonsense, a failure that's easy to miss in a quick spot check.
8. **Not versioning the preprocessing settings, engine choice, and prompt together** — the WHY: these interact, and a regression can appear only in a specific combination, hiding from a naive "test each part alone" approach.
9. **Building no human-review path for low-confidence or validation-failed extractions** — the WHY: without a fallback, a wrong extraction flows straight into a downstream business process with no checkpoint.
10. **Assuming "document understanding" and "text extraction" are the same capability** — the WHY: a system that reads text accurately can still fail to recover the document's actual structure (table cells, form field pairing), which is frequently the part the downstream task actually needs.
`,

  "common-errors": `
| Error / Symptom | Typical Cause | Fix |
|---|---|---|
| Garbled or nonsensical output on an otherwise legible document | Skewed or low-contrast input not preprocessed | Apply binarization and deskew before recognition |
| Text recognized correctly but reads in the wrong order | Layout analysis / reading-order recovery skipped on a multi-column or complex layout | Use a layout-aware engine/API feature that establishes block order before flattening to text |
| Table values shifted into the wrong row/column when parsed downstream | Table treated as plain text and reconstructed via whitespace heuristics | Use a layout-aware table extraction feature/model that models cell structure directly |
| High overall confidence but one critical field is wrong | Aggregate confidence masking a low-confidence individual field | Track and threshold confidence per field, not per document |
| Multimodal LLM extraction returns a plausible but incorrect number | No abstention instruction; model guesses on an unclear field | Prompt explicitly to use null/abstain when a value isn't clearly visible; add a plausibility check downstream |
| Accuracy much worse for a specific language/script than reported benchmarks | Engine/model evaluated primarily on Latin-script/English data | Evaluate and, if needed, choose a different engine per script/language rather than assuming one engine covers all |
| JSON parsing fails on a structured-extraction call | Model output not constrained to valid JSON, or a stray natural-language preamble | Use a JSON-mode/schema-constrained output feature; validate and log the raw response on failure rather than crashing silently |
| Recognition dramatically worse on photographed (vs. scanned) documents | Perspective distortion, uneven lighting, or shadow not corrected | Apply scene-text-appropriate preprocessing (perspective correction, adaptive thresholding) rather than scanned-document defaults |
`,

  faqs: `
**Is Tesseract good enough for production?** For clean, printed, well-lit, Latin-script documents, often yes, and it's free and runs locally. For tables/forms needing structure, handwriting, scene text, or non-Latin scripts, it is frequently outperformed by a cloud document-intelligence API or a multimodal LLM — evaluate on your actual documents rather than assuming either direction.

**Should I just use a multimodal LLM for all OCR now?** Not universally. LLM-based reading is flexible and good at combining reading with reasoning, but it is typically higher latency and cost per document than a dedicated OCR engine, and its accuracy on any given document type is not guaranteed — it varies by document quality and layout in ways that are still being actively benchmarked. Many production systems route simple, high-volume, well-understood document types to a cheaper dedicated engine and reserve LLM calls for complex or unusual cases.

**How do I handle a form with both printed and handwritten fields?** Route the document (or even the specific field regions) to different recognition paths if your engine's handwriting accuracy on printed fields, and vice versa, differs meaningfully — some cloud document-intelligence APIs and multimodal LLMs handle mixed printed/handwritten content in one pass reasonably well, but always evaluate on your own documents.

**What's the difference between OCR and "document understanding"?** OCR narrowly means converting image pixels into text. Document understanding is the broader capability of recovering STRUCTURE and MEANING — which text is a table cell, which is a form label versus its value, what order to read a multi-column page in, and how to map recognized content onto a business schema. Modern products (and this page) increasingly treat text extraction as one component of the larger document-understanding problem.

**How much does OCR cost at scale?** Highly variable — a self-hosted engine like Tesseract has essentially no per-call API cost but real compute cost; cloud OCR APIs charge per page/document with layout features often costing more than flat text detection; multimodal LLM calls incur image-token costs similar to any vision-enabled LLM call. Always model cost against your actual document volume and complexity mix, not a single demo case.

**Can OCR handle historical or degraded documents?** Sometimes, with the right preprocessing (denoising, contrast enhancement, sometimes manual region-of-interest cropping) and often lower expected accuracy than modern clean documents — large-scale digitization projects (see Industry Examples) accept and account for a higher error rate on historical material rather than expecting modern-document accuracy.

**Do I need to fine-tune an OCR model for my specific document type?** Often not for well-served cases (standard printed Latin-script invoices), but for a domain with unusual layouts, a specific handwriting style, or a script/language poorly covered by general-purpose engines, fine-tuning or a specialized vendor model can materially improve accuracy — evaluate the gap on your golden set before investing in fine-tuning.
`,

  "interview-questions": `
**Junior level**

1. *What is OCR, and what does it actually output beyond a string of text?* — Model answer: OCR converts image pixels into machine-readable text, and most real engines/APIs return not just text but bounding boxes (position) and confidence scores per word or line, which downstream code should use for validation and layout reconstruction rather than treating output as a single opaque string.
2. *What's the difference between printed text OCR, handwriting recognition, and scene text recognition?* — Model answer: printed text has regular glyph shapes and consistent spacing (easiest); handwriting has person-specific, irregular shapes with no fixed reference glyph (harder); scene text is embedded in a photographed real-world scene with arbitrary rotation, lighting, and occlusion (hard for different, environmental reasons) — a system tuned for one often underperforms on the others.
3. *Why does a scanned document need to be deskewed before OCR?* — Model answer: many recognition pipelines assume roughly horizontal text lines; even a few degrees of rotation degrades line/character segmentation and recognition accuracy, so correcting rotation before recognition improves results.
4. *What is binarization, and why is it a common first preprocessing step?* — Model answer: converting a grayscale/color image to pure black-and-white via a threshold (e.g. Otsu's method), which simplifies foreground-text-versus-background separation for many recognition pipelines, though poor lighting can defeat a naive global threshold.
5. *Why is treating a table as plain text a mistake?* — Model answer: flat text discards row/column association; a table's meaning depends on which value belongs to which row and column, which flat OCR output doesn't preserve, especially once cells wrap or merge.

**Senior level**

6. *Explain how CTC loss lets a deep-learning OCR model skip explicit character segmentation.* — Model answer: CTC allows the model to learn an alignment between a variable-length output sequence (recognized characters) and a fixed-length input sequence (the encoded image/feature sequence) without needing ground-truth per-character segmentation during training, sidestepping the classical pipeline's fragile segment-then-classify dependency.
7. *When would you choose a dedicated OCR engine over a multimodal LLM for a document-extraction feature, and vice versa?* — Model answer: dedicated engines/APIs are typically cheaper, faster, and more predictable for well-defined, high-volume, structurally simple documents (invoices from known templates); a multimodal LLM is preferable when the task needs flexible reasoning alongside reading, unusual or varied document formats, or combining extraction with judgment — the choice should be validated against an evaluation set, not assumed.
8. *How would you design a system to route documents to different recognition engines?* — Model answer: classify documents by type and estimated quality/complexity upfront (template match, resolution/skew heuristics, or a lightweight classifier), then route via an explicit policy — simple/clean to a cheap local engine, tables/forms to a layout-aware cloud API, ambiguous/complex to an LLM with human-review fallback — and monitor per-route accuracy to refine the policy over time.
9. *How do you validate a structured extraction beyond checking that it matches a schema?* — Model answer: add plausibility checks specific to the domain (does an invoice's line-item sum match its stated total, is a date within a sane range, does a vendor name match a known list) as a second validation layer beyond shape/type checking, since a wrong-but-plausible value passes schema validation trivially.
10. *Why might per-language OCR accuracy differ so much from a vendor's headline benchmark number?* — Model answer: most public benchmarks and much training data skew toward Latin-script, English-language documents; scripts with different structural properties (RTL, no whitespace word boundaries, complex conjuncts) are frequently underrepresented, so real accuracy on those scripts should be independently evaluated rather than inferred from an aggregate or English-only benchmark.
11. *What's the architectural difference between a classical OCR pipeline and an end-to-end transformer-based document-understanding model?* — Model answer: the classical pipeline is a sequence of separately engineered, independently-fallible stages (binarize, deskew, layout analysis, segment, recognize, post-process); an end-to-end model collapses multiple stages into one learned, differentiable model trained on raw image-to-output pairs, reducing compounding stage errors at the cost of needing more diverse training data and losing stage-by-stage debuggability.
12. *How would you monitor an OCR/document-extraction pipeline in production beyond simple uptime?* — Model answer: track per-field confidence distribution, human-review queue rate, sampled accuracy on auto-accepted (not just reviewed) extractions, and input-distribution drift (resolution, skew, detected language/script) over time, since a quality regression can occur with zero change in service-level uptime or latency metrics.
`,

  "coding-questions": `
### 1. Structured invoice extraction with validation (full worked example)

Combine an OCR/vision call with a Pydantic schema to extract and validate invoice fields — the pattern nearly every real document-extraction pipeline uses.

~~~python
import base64
import json
from typing import Optional

from openai import OpenAI
from pydantic import BaseModel, ValidationError, field_validator

client = OpenAI()


class LineItem(BaseModel):
    description: str
    quantity: float
    unit_price: float


class InvoiceExtraction(BaseModel):
    vendor: Optional[str]
    invoice_number: Optional[str]
    total_amount: Optional[float]
    currency: Optional[str]
    line_items: list[LineItem] = []

    @field_validator("total_amount")
    @classmethod
    def total_must_be_plausible(cls, v: Optional[float]) -> Optional[float]:
        # Schema validation alone only checks TYPE; this checks a basic plausibility
        # bound so an obviously-wrong OCR misread (e.g. a stray zero) is caught early.
        if v is not None and (v < 0 or v > 10_000_000):
            raise ValueError(f"total_amount {v} is outside a plausible range")
        return v


EXTRACTION_PROMPT = """
Read this invoice image and extract the following fields as JSON:
{
  "vendor": string or null,
  "invoice_number": string or null,
  "total_amount": number or null,
  "currency": string or null,
  "line_items": [{"description": string, "quantity": number, "unit_price": number}]
}
Only report a field if it is clearly visible in the image. Use null for anything
unclear, ambiguous, or not present. Do not guess a value you cannot read confidently.
Return ONLY the JSON object, no other text.
"""


def encode_image(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def extract_invoice(image_path: str) -> InvoiceExtraction:
    image_b64 = encode_image(image_path)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": EXTRACTION_PROMPT},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
            ],
        }],
        response_format={"type": "json_object"},
        max_tokens=800,
    )
    raw = response.choices[0].message.content
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        # Never silently swallow a malformed response — log it and route to retry/review.
        raise ValueError(f"model did not return valid JSON: {raw!r}") from e

    try:
        return InvoiceExtraction.model_validate(parsed)
    except ValidationError as e:
        # A ValidationError here means the shape or a plausibility check failed —
        # route to human review rather than silently accepting a partial extraction.
        raise ValueError(f"extraction failed validation: {e}") from e


def reconcile_total(invoice: InvoiceExtraction, tolerance: float = 0.02) -> bool:
    """Business-logic plausibility check beyond schema validation: does the stated
    total roughly match the sum of line items? A mismatch flags likely misreads
    even when every individual field passed its own validation."""
    if not invoice.line_items or invoice.total_amount is None:
        return True  # nothing to reconcile against
    computed = sum(item.quantity * item.unit_price for item in invoice.line_items)
    return abs(computed - invoice.total_amount) <= tolerance * max(computed, 1.0)
~~~

Complexity: dominated by the network call to the vision-capable model (typically a few seconds), not the local parsing/validation. Follow-ups: how would you extend this to route low-confidence or reconciliation-failed extractions to a human review queue? How would you adapt this to call a dedicated OCR engine (Tesseract or a cloud API) instead of an LLM, and what would change in the validation layer?

### 2. Reconstructing table structure from bounding boxes

Given a list of recognized words with bounding boxes (as a cloud OCR API would return), group them into rows and columns without a dedicated table-extraction feature — illustrating why this is harder than it looks, and why a purpose-built feature is usually preferable.

~~~python
from dataclasses import dataclass


@dataclass
class Word:
    text: str
    left: float
    top: float
    width: float
    height: float


def group_into_rows(words: list[Word], row_tolerance: float = 5.0) -> list[list[Word]]:
    """Group words into rows based on vertical (top) position proximity.
    This is a heuristic, not a guarantee — it breaks on wrapped cell text
    (two lines belonging to the same logical row) and on skewed input where
    'top' position drifts across a row. Purpose-built table extraction models
    this more robustly using detected cell/row structure, not just position."""
    sorted_words = sorted(words, key=lambda w: w.top)
    rows: list[list[Word]] = []
    for word in sorted_words:
        placed = False
        for row in rows:
            if abs(row[0].top - word.top) <= row_tolerance:
                row.append(word)
                placed = True
                break
        if not placed:
            rows.append([word])
    for row in rows:
        row.sort(key=lambda w: w.left)  # order words left-to-right within a row
    return rows


def rows_to_grid(rows: list[list[Word]]) -> list[list[str]]:
    return [[w.text for w in row] for row in rows]
~~~

Complexity: O(n * r) where n is word count and r is the number of rows discovered so far (linear scan per word against existing rows) — acceptable for a typical page's word count, but the real point of this exercise is architectural: notice how many assumptions (constant row height, no skew, no wrapped cells, no merged cells) this heuristic silently depends on. Follow-up: how would a merged cell spanning two rows break this algorithm, and what would a layout-aware model do differently?

### 3. Confidence-based routing to human review

~~~python
from dataclasses import dataclass


@dataclass
class RecognizedField:
    name: str
    value: str
    confidence: float


def needs_human_review(fields: list[RecognizedField], critical_fields: set[str],
                        threshold: float = 0.85) -> bool:
    """Route to review if ANY critical field is below threshold — an aggregate
    confidence average can hide exactly the field that matters most being wrong,
    which is the core lesson of per-field (not per-document) confidence checks."""
    for field in fields:
        if field.name in critical_fields and field.confidence < threshold:
            return True
    return False
~~~

Complexity: O(n) in the number of fields. Follow-up: how would you tune the threshold per field type (e.g. a stricter threshold for a monetary total than for a free-text description), and how would you feed human-review outcomes back into evaluating and improving the threshold over time?
`,

  "hands-on-labs": `
**Lab 1 (Beginner): Tesseract on a clean and a messy document.** Run pytesseract.image_to_string and image_to_data on a clean printed page, then on a deliberately skewed/low-contrast photo of the same page. Compare accuracy and confidence scores. Deliverable: a short report showing before/after accuracy with and without a manual binarize+deskew preprocessing step. Skills exercised: preprocessing, confidence-score interpretation.

**Lab 2 (Intermediate): Cloud OCR API with table extraction.** Use a cloud OCR API's layout-aware mode (AWS Textract TABLES, or an equivalent) against a real invoice or receipt containing a table. Extract the table into a proper row/column structure using the API's cell relationships, and compare the result against naively flattening the same page's plain text output. Deliverable: a script producing a clean CSV/DataFrame from the table feature, plus a written note on what broke in the naive flat-text approach. Skills exercised: layout-aware extraction, structure recovery.

**Lab 3 (Intermediate/Advanced): Structured extraction with validation.** Build the full worked pipeline from Coding Questions #1 — call a multimodal LLM (or a dedicated OCR engine plus your own schema-parsing logic) against 10 real receipt or invoice images, validate with Pydantic, and add a reconciliation check (line items sum to total). Deliverable: a report showing extraction accuracy per field, plus which documents triggered a validation or reconciliation failure and why. Skills exercised: structured extraction, schema validation, plausibility checking.

**Lab 4 (Production): Multi-engine routing with a human-review queue.** Build a small service that routes incoming documents to one of two engines (a local engine and a cloud API or LLM) based on a simple heuristic (e.g. detected skew/resolution), extracts structured fields, and routes low-confidence extractions to a mock "review queue." Deliverable: a working FastAPI service with the /extract endpoint, a golden evaluation set of at least 15 real documents (some deliberately hard), and a report on per-engine accuracy and the review-queue rate. Skills exercised: architecture/routing, evaluation-set discipline, production monitoring hooks.
`,

  "real-projects": `
**1. Receipt-to-expense-report pipeline.** Build a service that accepts a photographed receipt, extracts merchant/date/total/line-items via OCR or a multimodal LLM, validates the extraction against a schema plus a reconciliation check, and produces a structured expense-report entry. Engineering requirements: preprocessing for phone-camera photo quality (skew, uneven lighting), a human-review path for low-confidence extractions, and an evaluation set covering receipts from multiple retailers/formats.

**2. Searchable document archive.** Take a folder of scanned PDFs (mixed quality, some skewed, some low-resolution), OCR them into full-text-searchable documents, and build a simple search index over the extracted text. Engineering requirements: batch processing at volume, per-page confidence tracking, correct multi-column reading order for any academic-paper-style documents, and a fallback for pages the primary engine reads poorly.

**3. Multi-script form-intake system.** Design a form-intake pipeline that must correctly handle at least two different scripts (e.g. Latin and one non-Latin script relevant to your target users), with per-script evaluation and a policy for routing pages by detected language/script to the most accurate available engine for that script. Engineering requirements: language/script detection as an explicit pipeline stage, separate accuracy tracking per script, and a documented policy for scripts the system doesn't yet support well.
`,

  "case-studies": `
**Google Books digitization.** Google's book-scanning project OCR'd an enormous, historically and typographically diverse corpus, needing to handle centuries of font variation, print quality degradation, and many languages at a scale where per-document manual correction was infeasible. Lesson: large-scale OCR at real-world diversity requires accepting and tracking a non-uniform accuracy distribution rather than expecting one clean-document accuracy number to hold everywhere, and post-processing/dictionary correction at scale becomes a first-class part of the pipeline rather than an afterthought.

**Bank check processing and MICR.** Banks solved a narrow but business-critical OCR problem (reading a check's amount and routing number) not primarily by making general OCR better, but by designing the INPUT to be maximally machine-readable in the first place (the MICR font, printed in magnetic ink, engineered for reliable machine reading). Lesson: when you control the document's creation, designing for machine-readability upfront can be a bigger accuracy win than any recognition-algorithm improvement — a lesson that generalizes to any organization designing its own forms for OCR intake.

**Cloud document-intelligence products (Textract/Document AI/Document Intelligence) productizing table and form extraction.** Major cloud vendors moved from offering flat OCR as their primary product to offering table/form/key-value extraction as a first-class, separately-priced feature. Lesson: the industry's own pricing and product structure is direct evidence that structure recovery (not just character recognition) is the harder and more valuable problem for real document-processing use cases — a strong signal for where to invest evaluation and engineering effort on your own pipeline.

**Multimodal LLMs as a general-purpose document reader.** The rapid adoption of vision-capable LLMs for ad hoc document reading and extraction (skipping a dedicated OCR engine entirely for many prototyping and lower-volume use cases) shows how quickly a flexible, no-training-required approach can substitute for a purpose-built pipeline for a wide swath of tasks — while dedicated OCR/document-intelligence products remain the more cost-predictable and often more accurate choice for well-defined, high-volume production workloads. Lesson: this is an actively shifting tradeoff, and the right choice for a given team depends on volume, document diversity, and accuracy requirements re-evaluated periodically rather than decided once and left alone.
`,

  comparisons: `
| Approach | Cost profile | Structure/table support | Flexibility | Setup effort | Best fit |
|---|---|---|---|---|---|
| Tesseract (local, open-source) | Free (compute only) | Basic (layout analysis, no first-class table/form model) | Low — fixed capability set | Low-medium (install binary + wrapper) | High-volume, simple, clean printed documents; offline/no-API-cost requirement |
| Cloud OCR API (Textract/Cloud Vision/Document Intelligence) | Per-page/document | Strong (dedicated table/form/key-value features) | Medium — schema-oriented output | Low (managed API) | Invoices, forms, receipts needing structure without hosting a model |
| Self-hosted deep-learning OCR (TrOCR, Donut, similar) | Infrastructure/GPU cost | Varies by model — some fold layout in, some don't | Medium-high, depending on model | High (hosting, fine-tuning, ops) | Teams needing full data control, a specific domain fine-tune, or offline deployment at scale |
| Multimodal LLM (GPT-4o/Claude/Gemini vision) | Per-call, image-token-based, typically higher than a dedicated OCR call | Strong for reasoning about structure via prompting; not a guaranteed structural model | Highest — arbitrary reasoning alongside reading | Very low (just a prompt) | Complex/varied documents, low-to-medium volume, tasks needing judgment alongside extraction |

### How seniors actually choose

Senior engineers rarely pick one approach exclusively. The typical production decision: start with the cheapest engine that meets an evaluated accuracy bar for a given document type (often a cloud OCR API's layout-aware mode for structured business documents), reserve a multimodal LLM call for the genuinely ambiguous or highly varied long tail, and reserve self-hosting a specialized deep-learning model for cases with clear ROI on control, cost at very high volume, or a domain-specific fine-tune that measurably beats every off-the-shelf option on the team's own golden evaluation set — never on a vendor's marketing benchmark alone.
`,

  "related-technologies": `
- **Vision AI** — the general multimodal-LLM architecture and API mechanics that "OCR by prompting" builds on; this page focuses specifically on text/document extraction and defers general vision-language-model internals there.
- **CNNs** — the recognition-stage architecture (CNN or Vision Transformer encoders) underlying most deep-learning OCR engines; see that skill for the encoder internals this page's Internal Working section references.
- **Structured Outputs** — the schema-validation discipline (JSON mode, Pydantic models, retry-on-validation-failure patterns) that the "OCR plus schema" pattern in Intermediate Concepts and Coding Questions depends on.
- **RAG** — OCR'd documents are a common ingestion source for retrieval pipelines; getting extraction and layout right upstream directly affects retrieval quality downstream.
- **Image Generation** — the inverse direction (text/image to a new image) rather than extracting text from an existing image; a useful contrast for understanding what OCR is NOT.
- **NLP/Language Models generally** — post-processing correction (dictionary/language-model-based correction of likely misreads) draws on the same language-modeling ideas covered in NLP-adjacent skills on this platform.
`,

  "latest-updates": `
This page's knowledge cutoff is January 2026; treat anything below as a snapshot to re-verify against current vendor documentation and recent papers, not a permanent state of the field.

As of that cutoff: multimodal LLMs (GPT-4o/GPT-5-class models, Claude's vision capability, Gemini's multimodal models) are increasingly used directly for document reading and structured extraction, often without a dedicated OCR engine in the loop at all, and this usage pattern has grown rapidly enough that "OCR" as a standalone API call is, for many new products, being folded into a general vision-capable LLM call. At the same time, cloud vendors continue to invest in dedicated document-intelligence products (table/form/key-value extraction) as a separately priced, higher-margin capability distinct from flat OCR, suggesting the two approaches (dedicated engines and general multimodal LLMs) are expected to coexist rather than one fully replacing the other in the near term. Open-weight document-understanding models (in the LayoutLM/Donut/TrOCR lineage and newer successors) continue to close the gap with closed commercial systems on public benchmarks, though exact current standings shift quickly enough that any specific benchmark number here would likely be stale by the time you read it — check a current, dated leaderboard or vendor benchmark page directly.

Given how fast this space moves, verify current model/engine accuracy claims, pricing, and feature sets directly against each vendor's documentation before making a production decision, rather than trusting any single comparison (including this page's Comparisons table, which is directional, not a live benchmark) as durable.
`,

  "future-roadmap": `
The trajectory that seems durable enough to bet some career time on: document understanding continues to fold MORE of the pipeline (detection, recognition, layout, and semantic extraction) into fewer, larger, end-to-end learned models — the multi-decade trend from "many hand-engineered stages" toward "one model that reads and understands" shows no sign of reversing. Skills that remain valuable regardless of which specific engine or model wins in any given year: understanding WHY documents are hard (preprocessing, script diversity, structural complexity) well enough to build a rigorous evaluation set and catch a regression before users do; designing the schema-validation and human-review layer around whichever recognition engine you choose, since that layer's design principles (validate values not just shape, route by confidence, reconcile against business logic) are durable even as the underlying recognition technology changes; and staying comfortable evaluating and switching between a dedicated OCR engine, a cloud document-intelligence API, and a multimodal LLM as their relative accuracy and cost shift, rather than committing permanently to one approach. What's less certain, and worth explicitly hedging on: whether dedicated OCR engines remain meaningfully cheaper and more accurate than general multimodal LLMs for structured business documents indefinitely, or whether that gap continues to narrow to the point where most new products skip dedicated OCR engines entirely — this page's cutoff cannot answer that, and it's worth re-checking the state of that specific tradeoff periodically rather than assuming today's balance holds.
`,

  "cheat-sheet": `
~~~text
OCR / DOCUMENT EXTRACTION — ESSENTIALS

Three text-recognition problems (different difficulty tiers):
  Printed text    -> regular glyphs, best-served case
  Handwriting      -> irregular, person-specific, harder, needs more data
  Scene text       -> photographed real-world text, hard due to rotation/lighting/occlusion

Classical pipeline (stage-by-stage, errors compound forward):
  binarize -> deskew -> layout analysis -> segment -> recognize -> post-process (dictionary correction)

Modern deep-learning path:
  CNN/ViT encoder -> LSTM/Transformer sequence model -> CTC or autoregressive decode
  (skips explicit character segmentation; learns alignment internally)

Flat text extraction vs document layout understanding:
  Flat: text + bounding box + confidence per word/line
  Layout-aware: + table cells (row/col), form key-value pairs, correct multi-column reading order
  RULE: never reconstruct table structure from whitespace heuristics on flat text — use a layout-aware feature/model

Engine choice (route by document type/complexity, don't pick one globally):
  Tesseract (local, free)         -> clean printed docs, high volume, low structure needs
  Cloud OCR API (Textract/etc.)   -> tables/forms needing structure, managed scaling
  Self-hosted deep model          -> domain fine-tune, full data control, offline
  Multimodal LLM                  -> flexible reasoning + reading, varied/ambiguous docs

Structured extraction pattern:
  1. Read (OCR engine or VLM) with position + confidence
  2. Parse into a schema (Pydantic)
  3. Validate SHAPE (schema) AND VALUES (plausibility: totals reconcile, dates sane)
  4. Route low-confidence / failed-validation cases to human review

Common pitfalls:
  - Skipping preprocessing (skew/contrast) -> silent accuracy loss, no explicit error
  - Table as plain text -> loses row/col association
  - Trusting aggregate confidence -> hides one wrong critical field
  - Assuming English/Latin-script accuracy generalizes to other scripts
  - LLM guesses on unclear fields unless prompted to abstain ("use null if unclear")

Production checklist essentials:
  preprocess always -> validate uploads -> route by doc type -> layout-aware tables
  -> validate values not just shape -> per-field confidence threshold -> golden eval set
  -> human review path -> monitor confidence drift + review-queue rate
~~~
`,

  "flash-cards": `
| Question | Answer |
|---|---|
| What are the three text-recognition problem types covered on this page? | Printed text OCR, handwriting recognition, and scene text recognition |
| What does OCR output beyond just recognized text? | Bounding boxes (position) and confidence scores per word/line/character |
| Why must a scanned document be deskewed before recognition? | Rotation degrades line/character segmentation and recognition accuracy in most pipelines |
| What is binarization? | Thresholding a grayscale/color image into pure black and white to simplify text/background separation |
| Why is treating a table as plain text a mistake? | It discards row/column cell association, breaking on wrapped or merged cells |
| What loss function lets deep-learning OCR skip character segmentation? | Connectionist Temporal Classification (CTC), which learns sequence alignment without ground-truth segmentation |
| Name one advantage and one disadvantage of using a multimodal LLM for OCR. | Advantage: flexible reasoning alongside reading; disadvantage: typically higher cost/latency and less predictable accuracy than a dedicated engine |
| Why is per-field confidence more useful than per-document confidence? | An aggregate score can hide one critical field being wrong while the overall document looks high-confidence |
| What's the difference between flat text extraction and document layout understanding? | Flat extraction gives text and position; layout understanding recovers structure — tables, form key-value pairs, correct multi-column reading order |
| Why can OCR accuracy vary so much across languages/scripts? | Training data and benchmarks skew toward Latin-script/English; other scripts (RTL, CJK, complex conjuncts) are often underrepresented |
| What should you add beyond schema validation for structured extraction? | Plausibility checks on the VALUES (e.g. line items reconcile to total, dates are sane), since a wrong value can still pass shape validation |
| What is the MICR check-processing case study's core lesson? | Designing the input to be maximally machine-readable (a magnetic-ink font) can beat recognition-algorithm improvements when you control document creation |
| Why might treating "OCR" and "document understanding" as the same thing cause problems? | A system can read text accurately while still failing to recover the structure (tables, form fields) a downstream task actually needs |
| What should an LLM-based extraction prompt explicitly instruct for unclear fields? | To abstain (return null) rather than guess, reducing confident-but-wrong extractions |
| Why should preprocessing settings, engine choice, and prompt be versioned together? | They interact; a regression can appear only in a specific combination and hide from independent testing |
`,

  mcqs: `
**1. Which of the following is the classical OCR pipeline's correct stage order?**
A) Recognition, segmentation, binarization, layout analysis
B) Binarization, deskew, layout analysis, segmentation, recognition, post-processing
C) Layout analysis, recognition, binarization, deskew
D) Post-processing, recognition, binarization

Answer: B. Binarization and deskew prepare the image; layout analysis finds regions and reading order; segmentation isolates lines/characters; recognition classifies them; post-processing applies dictionary/language-model correction. Each stage's errors compound into the next.

**2. Why does CTC loss matter for deep-learning OCR?**
A) It replaces the need for a vision encoder entirely
B) It lets a model learn sequence alignment between input and output without requiring ground-truth character segmentation
C) It is only used for scene text, never printed text
D) It guarantees 100% accuracy on handwriting

Answer: B. CTC handles the alignment problem internally during training, removing the classical pipeline's dependency on a correct character segmentation step.

**3. What is the main risk of treating a table as flat OCR text?**
A) It runs slower than table-aware extraction
B) It loses the row/column association between cells, breaking on wrapped or merged cells
C) It requires more GPU memory
D) It cannot detect any text at all

Answer: B. Flat text discards structural information; reconstructing rows/columns from whitespace heuristics is fragile and breaks on common real-world table complications.

**4. Why is per-document OCR confidence potentially misleading?**
A) Confidence scores are never provided by OCR engines
B) It can average out and hide one critical field being read with very low confidence
C) It always equals 100% regardless of accuracy
D) It only applies to handwriting recognition

Answer: B. An aggregate score can mask exactly the field a business decision depends on being wrong, which is why field-level confidence thresholds are the production-grade approach.

**5. What is a key tradeoff of using a multimodal LLM directly for OCR instead of a dedicated OCR engine?**
A) LLMs are always cheaper and always more accurate
B) LLMs offer more flexible reasoning alongside reading but are typically higher cost/latency with less predictable accuracy per document type
C) LLMs cannot process images at all
D) Dedicated OCR engines always beat LLMs on every document type

Answer: B. The right choice depends on document type, volume, and evaluated accuracy — neither approach dominates universally, and both should be evaluated on your own documents.

**6. Why can OCR accuracy differ significantly across languages and scripts?**
A) All scripts are recognized with identical accuracy by design
B) Training data and public benchmarks disproportionately emphasize Latin-script/English documents, leaving other scripts less well covered
C) Only handwriting is affected by script differences
D) Script has no effect on OCR accuracy

Answer: B. Scripts with different structural properties (RTL text, no whitespace word boundaries, complex conjunct characters) are frequently underrepresented in training and benchmark data, so real-world accuracy on them should be evaluated independently rather than assumed from an English-only benchmark.
`,

  "revision-notes": `
OCR spans three distinct recognition problems — printed text (easiest, regular glyphs), handwriting (harder, irregular and person-specific), and scene text (hard for environmental reasons: rotation, lighting, occlusion) — and a system tuned for one commonly underperforms on the others without separate evaluation. The classical pipeline (binarize, deskew, layout analysis, segment, recognize, post-process) is a sequence of independently fallible stages whose errors compound forward; modern deep-learning OCR (CNN/ViT encoder plus LSTM/Transformer plus CTC loss) collapses segmentation and recognition into one learned, sequence-aware step, and the most recent transformer/multimodal-LLM approaches fold even more of the pipeline (including layout and semantic understanding) into a single end-to-end model.

Flat text extraction and document layout understanding are genuinely different capabilities: flat OCR gives you text plus position and confidence, while layout understanding recovers a table's row/column structure, a form's label-value pairing, and a multi-column page's correct reading order — treating a table as plain text and reconstructing structure from whitespace heuristics is one of the most common and costly mistakes in real document pipelines, because it breaks on wrapped cells, merged cells, and multi-page tables that are the norm rather than the exception.

Choosing between a dedicated OCR engine (Tesseract, free and local), a cloud document-intelligence API (managed, strong table/form support), a self-hosted deep-learning model (full control, needs ops investment), and a multimodal LLM (most flexible, typically higher cost/latency, accuracy that varies meaningfully by document type) is not a one-time global decision — senior engineers route by document type and complexity, and validate the choice against their own golden evaluation set rather than a vendor benchmark.

The structured-extraction pattern that almost every real invoice/receipt/form pipeline converges on is: read text with position and confidence, parse into a schema, validate both the SHAPE (does it match the schema) and the VALUES (are they plausible — do line items reconcile to a total, is a date sane), and route low-confidence or validation-failed cases to human review. Confidence scores should be tracked and thresholded per field, not per document, since an aggregate score can hide exactly the field that matters most being wrong.

Common pitfalls to actively guard against: skipping preprocessing on skewed or low-contrast images (degrades accuracy with no explicit error), assuming accuracy generalizes across languages and scripts without separate evaluation (most benchmarks skew Latin-script/English), and letting a multimodal LLM guess on an unclear field instead of explicitly prompting it to abstain. These gaps between demo accuracy and production accuracy are the central theme this page keeps returning to, because they are the most common way real OCR projects fail after looking great in a first demo.
`,

  "learning-roadmap": `
**Week 1 — Foundations and your first OCR calls.** Read Overview through Prerequisites. Install Tesseract and run image_to_string and image_to_data on both a clean and a deliberately skewed/low-contrast image. Milestone: you can explain why the messy image performed worse and identify which preprocessing step would help.

**Week 2 — Preprocessing and the classical pipeline.** Work through Beginner and Intermediate Concepts and Internal Working. Implement binarization and a basic deskew step with OpenCV, and re-run OCR on the corrected image to confirm improvement. Milestone: you can trace the classical pipeline stage by stage and explain where a given error was introduced.

**Week 3 — Cloud OCR APIs and layout understanding.** Read Architecture, Data Flow, and Advanced Concepts. Set up a cloud OCR API account and run both flat text detection and a layout-aware mode (TABLES/FORMS) against a real invoice or form. Milestone: you can point to specific structural information (a table cell's row/column) that the layout-aware mode preserves and flat OCR discards.

**Week 4 — Structured extraction and multimodal LLM OCR.** Read Production Usage through Security. Build the full structured-extraction worked example from Coding Questions #1 against a set of real receipts, including the reconciliation check. Milestone: you have a working pipeline with schema validation and can report per-field accuracy on your own small evaluation set.

**Week 5 — Production hardening and evaluation.** Read Testing through Production Checklist and Common Mistakes/Common Errors. Build a golden evaluation set of at least 15 real, hard documents (skewed, low-quality, and if relevant to you, multiple scripts) and score your pipeline against it. Milestone: you have a per-field accuracy report and a documented human-review routing policy based on confidence thresholds.

**Week 6 — Ecosystem, comparisons, and what's next.** Read Comparisons through Future Roadmap and the Revision Toolkit. Write a one-page comparison of which engine/approach you'd choose for three different hypothetical document workloads (high-volume simple invoices, multilingual forms, ad hoc varied documents) and justify each choice. From here, the natural next platform skill is **RAG**, since OCR'd documents are one of the most common real-world ingestion sources for a retrieval pipeline, and getting extraction and layout right upstream directly determines retrieval quality downstream.
`,

  "official-docs": `
- **Tesseract OCR documentation** (tesseract-ocr.github.io) — the open-source engine's official docs, covering installation, language packs, and configuration options; the most direct reference for anything covered in this page's local-engine examples.
- **AWS Textract documentation** — covers detect_document_text (flat OCR) versus analyze_document with FeatureTypes (TABLES, FORMS, and others) — the API this page's layout-aware examples are based on.
- **Google Cloud Vision / Document AI documentation** — Cloud Vision's text detection API and Document AI's specialized document-processor products, including invoice/receipt-specific parsers.
- **Azure AI Document Intelligence documentation** (formerly Form Recognizer) — covers prebuilt models for invoices/receipts/IDs and custom model training for domain-specific forms.
- **OpenAI, Anthropic, and Google vision API documentation** — for the multimodal-LLM-based OCR approach; see also the **Vision AI** skill's Official Docs section for the general API mechanics these build on.

Verify exact API method names, parameters, and feature availability against current vendor documentation, since cloud API surfaces change more frequently than this page's cutoff can track.
`,

  books: `
- **"Handbook of Document Image Processing and Recognition"** (David Doermann and Karl Tombre, eds.) — a comprehensive academic reference covering the classical pipeline and document analysis in real depth; useful if you want the rigorous foundation behind the stages summarized in Internal Working.
- **"Deep Learning" by Ian Goodfellow, Yoshua Bengio, and Aaron Courville** — not OCR-specific, but the standard reference for the CNN/RNN/sequence-modeling foundations that modern OCR architectures (CNN+LSTM+CTC) build on.
- **"Speech and Language Processing" by Dan Jurafsky and James H. Martin** — covers sequence modeling and language-model-based correction ideas relevant to OCR's post-processing stage, and freely available online in updated draft form.
- **"Computer Vision: Algorithms and Applications" by Richard Szeliski** — strong general computer-vision foundation for the image-processing (binarization, geometric correction) side of the classical pipeline; freely available online.

This is a genuinely thinner book landscape than more mainstream software topics — much of the current, fast-moving state of the art (transformer-based document understanding, multimodal-LLM OCR) lives in papers and vendor blogs rather than books, since the field is moving faster than book-publication cycles can track; treat Research Papers and Blogs below as the more current complements to these foundational texts.
`,

  blogs: `
- **Google AI Blog / Google Research Blog** — periodic posts on document understanding and OCR-adjacent research (including work behind Tesseract's LSTM era and later document-understanding models).
- **AWS Machine Learning Blog** — practical Textract usage patterns, including table/form extraction walkthroughs relevant to this page's layout-aware examples.
- **Hugging Face Blog** — coverage of open-weight document-understanding models (Donut, TrOCR, LayoutLM family) with practical fine-tuning walkthroughs.
- **Vendor engineering blogs from document-heavy companies** (fintech/expense-management companies processing receipts at scale) — often the most concrete source of real production lessons on OCR pipeline design, though specific posts age quickly; search for current ones rather than relying on any single post as durable.

High-signal blog content in this space changes quickly; prioritize posts with a clear publication date and verify any benchmark claim against the vendor's current documentation before relying on it.
`,

  "research-papers": `
This page is honest that OCR's academic paper landscape, while real and foundational, is somewhat thinner and more scattered than core deep-learning topics like vision classification or language modeling — much recent progress is documented in vendor technical reports and model cards rather than traditional peer-reviewed venues. The closest foundational and load-bearing papers:

- **"Connectionist Temporal Classification" (Graves et al., 2006)** — introduces CTC, the loss function underlying the segmentation-free sequence recognition approach covered in Advanced Concepts and Internal Working; foundational for essentially all modern line-level deep-learning OCR.
- **"An Image is Worth 16x16 Words" (Dosovitskiy et al., 2020)** — the Vision Transformer (ViT) paper; not OCR-specific, but foundational for the patch-embedding image encoders used in many modern document-understanding models (see the **CNNs** skill for full ViT coverage).
- **LayoutLM family papers (Xu et al., and successors)** — introduce layout-aware pretraining objectives that jointly model text, position, and (in later versions) image features for document understanding, directly relevant to the table/form structure-recovery problem covered in Advanced Concepts.
- **Donut: "OCR-free Document Understanding Transformer" (Kim et al., 2022)** — an end-to-end transformer approach that skips an explicit OCR stage entirely, going straight from document image to structured output; a direct example of the "fold everything into one model" trend discussed in History and Latest Updates.
- **TrOCR: "Transformer-based Optical Character Recognition with Pre-trained Models" (Li et al., 2021)** — an image-to-text transformer OCR model, illustrating the transformer-based line/document recognition approach as an alternative to the CNN+LSTM+CTC recipe.

If your interest is specifically in printed-text OCR fundamentals rather than the newer transformer-based document-understanding lineage, the classical computer-vision and pattern-recognition literature referenced in the Handbook of Document Image Processing and Recognition (see Books) is the closest foundational reading, since OCR predates the modern deep-learning paper era by decades.
`,

  videos: `
- **Andrej Karpathy's deep learning and neural network lecture series** — not OCR-specific, but the CNN and sequence-modeling foundations covered are directly relevant background for understanding modern OCR architectures, taught with unusually clear first-principles intuition.
- **AWS re:Invent talks on Textract** — periodic conference talks covering real production use cases and API deep-dives for layout-aware document extraction; search for the most recent year's talk rather than an older one, since the product surface evolves.
- **Hugging Face model walkthroughs on YouTube** — practical, code-along videos covering open-weight document-understanding models (Donut, LayoutLM, TrOCR) including fine-tuning demonstrations.
- **Two Minute Papers (YouTube)** — short, accessible summaries of relevant computer-vision and document-understanding papers as they're published; useful for staying current without reading every paper in full.

As with blogs, prioritize recently published or recently updated videos in this space — techniques and product capabilities referenced in an older video may already be superseded.
`,

  "github-repos": `
- **tesseract-ocr/tesseract** — the canonical open-source OCR engine referenced throughout this page's local-engine examples; the repository itself includes trained language data and build instructions.
- **madmaze/pytesseract** — the Python wrapper used in this page's beginner code examples, providing a clean interface to the Tesseract binary.
- **clovaai/donut** — the official Donut (OCR-free document understanding transformer) implementation, a concrete example of the end-to-end approach covered in Advanced Concepts and Research Papers.
- **microsoft/unilm** (contains the LayoutLM family) — Microsoft's repository housing LayoutLM and successor models for layout-aware document understanding.
- **microsoft/TrOCR** (also under the unilm umbrella) — the TrOCR transformer-based OCR model implementation referenced in Research Papers.
- **PaddlePaddle/PaddleOCR** — a widely used, actively maintained open-source OCR toolkit with strong multilingual support, a useful alternative or complement to Tesseract for script coverage beyond Latin text.
- **JaidedAI/EasyOCR** — a Python-first open-source OCR library supporting many languages with a simpler API surface than Tesseract, useful for quick prototyping.
- **aws/amazon-textract-textractor** — helper libraries and examples for working with AWS Textract's structured (table/form) output, complementing the raw boto3 calls shown in this page's examples.

Star counts, maintenance activity, and which repos are considered "the" reference implementation shift over time — check recent commit activity and open-issue health before depending on any of these for a production system.
`,

  "practice-problems": `
1. **(Preprocessing focus)** Implement a full deskew pipeline (angle detection plus rotation correction) from scratch using OpenCV, and measure OCR accuracy before and after on a set of deliberately rotated test images.
2. **(Confidence handling focus)** Given a list of recognized words with confidence scores, implement a function that computes both an aggregate document confidence and a per-field confidence for a named subset of "critical" fields, and demonstrate a case where the aggregate would mislead but the per-field check catches a problem.
3. **(Layout/table focus)** Extend the table-reconstruction exercise from Coding Questions #2 to handle a cell that wraps onto two lines (i.e. merge words from two adjacent rows that actually belong to the same logical row), and write a test case that would fail without your fix.
4. **(Structured extraction focus)** Extend the invoice-extraction worked example to also validate that the invoice date is not in the future and not more than some configurable number of years in the past, and add a test for both violations.
5. **(Comparison/evaluation focus)** Build a small evaluation harness that runs the same set of 10 real documents through both Tesseract and a cloud OCR API (or a multimodal LLM), computes per-field accuracy for each, and produces a report recommending which engine to use for that specific document type based on the results.
6. **External practice sets**: search for "OCR benchmark dataset" (e.g. ICDAR competition datasets, which have run scene-text and document-OCR competitions for years) for standardized, labeled test sets to practice against, and check each dataset's current license terms before use.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Ingestion
        Client["Client app\n(uploads document)"] --> Gateway["API gateway:\nauth, rate limit,\nfile validation"]
        Gateway --> Preprocess["Preprocess:\nbinarize, deskew,\ndenoise"]
    end

    subgraph Recognition
        Preprocess --> Router{"Route by\ndocument type\nand complexity"}
        Router -->|simple printed| Tesseract["Local OCR engine\n(Tesseract)"]
        Router -->|tables / forms| Cloud["Cloud OCR API\n(layout-aware mode)"]
        Router -->|ambiguous / complex| VLM["Multimodal LLM\n(vision-capable)"]
    end

    subgraph Structuring
        Tesseract --> Layout["Layout/structure recovery:\nreading order, table cells,\nform key-value pairs"]
        Cloud --> Layout
        VLM --> Layout
        Layout --> Extract["Schema-based extraction\n(Pydantic model)"]
        Extract --> Validate["Value validation:\nplausibility, reconciliation"]
    end

    subgraph QualityGate
        Validate --> Review{"Low confidence or\nfailed validation?"}
        Review -->|yes| Human["Human review queue"]
        Review -->|no| Store["Persist structured record"]
        Human --> Store
    end

    Store --> Monitor["Monitoring:\nconfidence distribution,\nreview-queue rate,\ninput drift"]
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((OCR / Document Extraction))
    Recognition problem types
      Printed text
      Handwriting recognition
      Scene text recognition
    Classical pipeline
      Binarization
      Deskew
      Layout analysis
      Segmentation
      Recognition
      Post-processing
    Modern deep learning
      CNN / ViT encoder
      LSTM / Transformer sequence model
      CTC loss
      End-to-end transformer document models
    Document layout understanding
      Tables (rows / columns / merged cells)
      Forms (key-value pairs)
      Multi-column reading order
    Approaches compared
      Tesseract (local, free)
      Cloud OCR / document-intelligence APIs
      Self-hosted deep-learning models
      Multimodal LLMs
    Structured extraction pattern
      Read with position and confidence
      Parse into schema
      Validate shape and values
      Route low-confidence to human review
    Production concerns
      Preprocessing discipline
      Per-field confidence thresholds
      Language / script coverage evaluation
      Cost and latency tradeoffs
      Security (uploads, PII, prompt injection)
    Common pitfalls
      Skipping preprocessing
      Table treated as plain text
      Trusting aggregate confidence
      Assuming universal language accuracy
      LLM guessing instead of abstaining
~~~
`,
};

export default ocr;
