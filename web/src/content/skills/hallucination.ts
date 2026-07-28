import type { SkillContent } from "../types";

/**
 * Hallucination — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const hallucination: SkillContent = {
  overview: `
Hallucination is the term the field uses for a large language model producing output that is fluent, confident, and grammatically correct, but factually wrong, unsupported by any source, or internally inconsistent with the prompt it was given. A model can invent a legal case that never existed, cite a paper with a plausible-sounding title and a fabricated author list, misstate a function's parameters, or confidently summarize a document with a detail that simply is not in the document. The output looks exactly like a correct answer — same tone, same structure, same apparent authority — which is precisely what makes hallucination dangerous: nothing in the surface form of the text distinguishes a hallucinated claim from a true one.

For an AI engineer, hallucination is not an edge case to patch once and forget — it is a structural property of how autoregressive language models generate text, and it must be designed around in every system that puts LLM output in front of a user or a downstream process making decisions. Understanding hallucination well means understanding three separate things clearly: why it happens (rooted in the training objective and the generation process itself, covered in depth in Internal Working), how to detect it after the fact (self-consistency checks, retrieval grounding with citation verification, uncertainty estimation, covered in Concepts and Production Usage), and how to reduce its rate and blast radius in a real system (RAG grounding, structured constraints, fact-checking pipelines, calibrated abstention — covered in Best Practices and Production Usage). This page is deliberately honest about the fourth thing too: none of the above eliminates hallucination. They reduce its frequency and its cost when it does occur. Any vendor or blog post claiming a technique "solves" hallucination is overstating what the underlying mechanism can actually guarantee.

Key characteristics of hallucination as a phenomenon: it is not random noise you can filter out with a simple heuristic — hallucinated text is often more fluent and more confidently phrased than hedged, correct text, because the model has no internal signal distinguishing "this token sequence is verified" from "this token sequence is merely plausible." It correlates with certain conditions (long-tail facts, out-of-distribution questions, requests that assume a false premise, tasks requiring precise enumeration or citation) but can occur on any generation. It is a spectrum, not a binary — from a wrong date, to a plausible but nonexistent citation, to an entirely fabricated event. And it interacts directly with several sibling skills on this platform: RAG (grounding answers in retrieved text reduces but does not eliminate the problem), Guardrails (enforcing output-level checks and abstention policies), Evaluation (measuring hallucination rate systematically rather than anecdotally), Prompt Engineering (phrasing that encourages calibrated uncertainty), AI Red Teaming (deliberately probing a system to elicit and catalog its hallucination failure modes), and LLM Fundamentals (the next-token prediction mechanics this whole page is built on).
`,

  history: `
Hallucination as a named failure mode predates today's large chat-oriented models — it was observed and studied in neural sequence-to-sequence systems (machine translation, abstractive summarization) years before GPT-3 or ChatGPT existed, under the same name, because the underlying cause (a generative model producing fluent but unfaithful output) is not specific to any one architecture.

| Year | Milestone |
|------|-----------|
| 2018 | Neural abstractive summarization papers document "hallucinated" content — summaries containing facts not present in the source document — as a known, measured failure mode of seq2seq models |
| 2020 | GPT-3's "Language Models are Few-Shot Learners" paper and subsequent community usage make clear that large pretrained language models will confidently generate plausible-sounding but false factual claims, especially on long-tail knowledge |
| 2021 | Survey papers (e.g., work cataloging hallucination in natural language generation) formalize a taxonomy distinguishing intrinsic hallucination (contradicting the given input) from extrinsic hallucination (unverifiable against the input, whether or not it happens to be true) |
| 2022 | InstructGPT and RLHF-tuned models change the shape of the problem: instruction-following models produce confident, well-formatted false statements more readily than raw completion models, because they are optimized to always produce a helpful-sounding answer rather than to leave a task unanswered |
| 2022–2023 | ChatGPT's public release turns hallucination from an academic NLP concern into a mainstream, widely reported public problem — fabricated legal citations, invented biographical facts, and incorrect code libraries become widely shared examples |
| 2023 | Retrieval-augmented generation (RAG) is widely adopted specifically as a mitigation, and papers formalize evaluation benchmarks (e.g., TruthfulQA and hallucination-specific leaderboards) to measure the problem quantitatively rather than anecdotally |
| 2023 | Self-consistency, SelfCheckGPT, and related black-box detection methods are published, showing hallucination can be partially detected without access to model internals by sampling multiple generations and measuring agreement |
| 2024 | Research on "semantic entropy" and internal-state-based uncertainty estimation shows that some hallucinations correlate with measurable internal signals (variance across paraphrased generations, token-level confidence), giving detection methods a stronger theoretical footing than pure black-box sampling |
| 2024–2025 | Reasoning-tuned models and stronger RAG/tool-use pipelines measurably reduce hallucination rates on many benchmarks, but researchers and model providers continue to document that the rate is reduced, not driven to zero, and that some hallucination categories (e.g., confident citation of nonexistent sources) persist even in the strongest available systems |
| 2025–2026 | Hallucination remains an active, unsolved research area; industry focus has shifted from "prompt a model to be truthful" toward system-level mitigation — grounding, verification pipelines, and calibrated abstention — reflecting an emerging consensus that this is a property to manage architecturally, not a bug to patch away with a clever instruction |

The throughline: hallucination was never introduced by chat models — it is a property of generative sequence models broadly — but the shift to confident, instruction-following, publicly deployed chat assistants made it visible, costly, and urgent at a scale the earlier academic literature had not anticipated.
`,

  "why-it-exists": `
Hallucination exists because of a mismatch between what a language model is trained to do and what a user assumes it is doing. A large language model is trained, at its core, to predict the next token given the preceding tokens, using a loss function that rewards assigning high probability to the tokens that actually appeared in its training data. Nothing in that objective directly rewards "only state things that are true" — it rewards "produce the token sequence that a human would plausibly have written next," which for most of the training corpus correlates with truth (humans write true things most of the time) but is not the same signal as truth itself.

Before this was well understood, the world had two adjacent but different technologies whose failure modes people conflated with a language model's:

- **Search engines and databases**: return a specific retrieved document or record; if the record does not exist, the system returns "no results," not a fabricated one. Users came to LLMs with the implicit mental model that a confident, well-formatted answer meant something had been looked up and found.
- **Narrow, fact-constrained NLP systems**: older question-answering systems were often built directly on top of a structured knowledge base or a fixed document set, so their answer space was inherently bounded by what existed in that source — they could fail to find an answer, but had a much harder time inventing a fluent, wrong one from nothing, because their architecture did not generate free-form text the way an LLM does.

The gap hallucination fills — in the sense of being the visible symptom of an underlying gap — is between "the model can produce fluent, confident-sounding text in the shape of a factual answer" and "the model has any mechanism to verify that answer against ground truth before emitting it." An autoregressive model generates its response one token at a time, conditioned only on the tokens so far and the patterns learned during training; it has no separate fact-checking module consulting an authoritative source unless a system built around it explicitly adds one (see RAG, and Internal Working below for exactly why this makes hallucination a structural, not incidental, property).
`,

  "problem-it-solves": `
This section deliberately inverts the usual framing: hallucination is not a problem that "solves" something — it is the problem, and this page's other sections build the discipline of detecting and mitigating it. What is useful here is being precise about what mitigation techniques actually remove or reduce, and what they honestly do not touch.

What good hallucination-mitigation practice removes or reduces:

- **Unverified confident claims presented as fact**: retrieval grounding, citation checking, and calibrated abstention reduce the rate at which a system asserts something with no basis, replacing silent fabrication with either a sourced claim or an explicit "I don't have enough information" response.
- **Silent failure on out-of-scope questions**: without mitigation, a model asked something outside its knowledge or the provided context will often still produce a fluent, wrong-shaped answer rather than declining; explicit "say I don't know" prompting and retrieval-grounding constraints convert this into a detectable, honest non-answer.
- **Undetected drift in high-volume automated pipelines**: self-consistency checks and automated fact-checking passes catch a meaningful fraction of fabrications before they reach a user or a downstream system, where a fully manual review process would not scale.
- **Unbounded blast radius**: guardrails and structured-output constraints (see the Guardrails and Structured Outputs skills) limit what an ungrounded model can assert in the first place — for example, constraining a model to only select from a known-valid set of product IDs rather than free-generating one, which cannot literally hallucinate an ID that does not exist in the constrained set.

What good practice deliberately does **not** claim to solve:

- **Elimination**: no combination of grounding, checking, and constraints reduces hallucination to zero for open-ended natural-language generation; the honest target is a measured, monitored, acceptably low rate for the specific task and risk tolerance, not "solved."
- **Hallucination inside retrieved or provided context itself**: if the retrieved documents in a RAG pipeline are themselves wrong, outdated, or biased, grounding the model in them produces confidently wrong answers that are technically "faithful to the source" — this is a data-quality problem, not something prompting or self-consistency can fix (see RAG and Evaluation).
- **Adversarial or deliberately misleading prompts**: a user or attacker who deliberately constructs a prompt assuming a false premise ("since the moon landing was faked, explain why...") can still elicit confident, unwanted completions unless the system has explicit premise-checking logic — a distinct concern covered in AI Red Teaming.
- **Perfect calibration**: uncertainty-estimation techniques improve the correlation between a model's expressed confidence and its actual correctness, but they do not produce a perfectly calibrated probability the way a well-specified statistical model can; treat calibration scores as a useful signal, not a guarantee.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain, at the mechanistic level, why next-token prediction training gives a language model no built-in signal that distinguishes a true statement from a plausible-but-false one.
2. Distinguish intrinsic hallucination (contradicting the given input/context) from extrinsic hallucination (unverifiable against the input, whether or not it is independently true), and give a concrete example of each.
3. Apply self-consistency checks (sampling multiple generations and measuring agreement) as a black-box hallucination-detection technique, and explain what kind of hallucination it does and does not catch.
4. Build a retrieval-grounding and citation-verification pipeline that flags claims in a generated answer unsupported by the retrieved source material.
5. Apply and evaluate uncertainty-estimation techniques (token-level probability, semantic entropy across paraphrases) as signals for when a model is more likely to be hallucinating.
6. Design and apply mitigation strategies — RAG grounding, structured output constraints, fact-checking pipelines, and "say I don't know" prompting — and correctly state which category of hallucination each one targets.
7. Measure hallucination rate systematically with a benchmark or held-out evaluation set, rather than judging a system's reliability from a handful of anecdotal outputs.
8. Recognize the honest limits of every current mitigation technique and explain, in a technical interview or design review, why "we solved hallucination" is not a claim a rigorous engineer should make.
9. Design a production system's abstention and escalation policy: when a system should answer, when it should hedge, and when it should decline or route to a human.
10. Connect hallucination mitigation to its sibling disciplines on this platform — RAG, Guardrails, Evaluation, Prompt Engineering, and AI Red Teaming — and know which skill owns which part of the overall defense.
`,

  prerequisites: `
- **Required**: basic familiarity with interacting with an LLM (a chat interface or a simple API call) and a general sense that models can sometimes be wrong. Nothing else; this page starts from first principles on why that happens.
- **Strongly recommended before this page**: the **LLM Fundamentals** skill. Understanding tokens, next-token prediction, the training objective, and what instruction-tuning/RLHF actually optimize for is the foundation this entire page is built on — Internal Working assumes it and will not re-derive it.
- **Helpful, deepens several sections**: the **Prompt Engineering** skill (framing techniques used in mitigation), basic Python (for the worked citation-checking example), and basic familiarity with embeddings/similarity search (used in retrieval-grounding and some detection techniques).
- **Directly related platform skills, referenced throughout this page**: **RAG** (the dominant grounding-based mitigation, covered here at the "why it helps and where it stops helping" level, in full pipeline depth there), **Guardrails** (output-level enforcement and abstention policy), **Evaluation** (systematic measurement of hallucination rate, not just spot-checking), **Structured Outputs** (constraining the shape of output to reduce certain hallucination categories), and **AI Red Teaming** (deliberately probing a system to find and catalog its hallucination failure modes before real users do).

Dependency links: **LLM Fundamentals** → **Hallucination** (this page, the failure mode and its mitigations) → **RAG** / **Structured Outputs** (the major grounding and constraint mechanisms applied in full depth) → **Guardrails** (enforcing abstention and output policy in production) → **Evaluation** (measuring whether any of it actually worked) → **AI Red Teaming** (adversarially probing for the gaps that remain).
`,

  "beginner-concepts": `
### What hallucination looks like, concretely

The clearest way to build intuition is to see it side by side with a correct answer, because the two are indistinguishable in tone and formatting.

~~~text
Prompt: "What year did Marie Curie win her second Nobel Prize, and in what field?"

Correct model output: "Marie Curie won her second Nobel Prize in 1911, in Chemistry."
(This is true and verifiable.)

Hallucinated-style output (illustrative, not a specific model's actual output):
"Marie Curie won her second Nobel Prize in 1913, in Physics, becoming the first
person to win in three different scientific fields."
(Wrong year, wrong field, and an entirely fabricated superlative claim —
delivered with exactly the same confident tone as the correct answer.)
~~~

Notice that nothing about the phrasing signals uncertainty in the wrong version — no hedging, no "I believe," no lower confidence marker. That absence of a distinguishing signal is the core beginner insight: you cannot tell hallucinated text from correct text by how it reads.

### Two basic categories: intrinsic vs. extrinsic

- **Intrinsic hallucination**: the output directly contradicts something stated in the input/context the model was given. If a document says a meeting is on Tuesday and the model's summary says Wednesday, that is intrinsic — the ground truth was right there and the model still got it wrong.
- **Extrinsic hallucination**: the output makes a claim that cannot be verified from the given input at all — it may happen to be true, or false, but the model asserted it without the input supporting it either way. A model asked to summarize a short news article that adds "this is part of a broader trend affecting the entire industry" (a claim the article never made) is producing extrinsic hallucination, whether or not the broader trend is real.

~~~text
Context given to model: "The Q3 report shows revenue grew 4% year over year."

Intrinsic hallucination: "The Q3 report shows revenue grew 4% year over year,
which is a decline from Q2." (Nothing in the given context supports "decline" —
it directly invents a comparison contradicting nothing stated, but unsupported.)

Extrinsic hallucination: "The Q3 report shows revenue grew 4% year over year,
driven primarily by strong performance in the Asia-Pacific region."
(The Asia-Pacific detail is not in the context at all — unverifiable from what
was given, whether or not it happens to be true.)
~~~

### Why "the model is lying" is the wrong mental model

Lying implies knowing the truth and choosing to state otherwise. A hallucinating model has no internal "I know this is false" flag it is overriding — it is generating the token sequence its training makes most probable given the prompt, and for questions involving obscure facts, precise numbers, or citations, "the most probable-sounding continuation" and "the true continuation" can diverge without the model having any mechanism to notice the gap. This distinction matters practically: it means you cannot fix hallucination by "asking the model to be honest" alone (though calibrated prompting helps at the margin, see Intermediate Concepts) — you need external grounding and checking, because the model's own generation process has no built-in truth detector.

~~~python
# A minimal illustration: nothing in a standard chat-completion call gives the
# model any signal distinguishing "verified fact" from "plausible guess."
import openai

response = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "What is the population of the town of Little Falls, Minnesota, as of the most recent census?"},
    ],
    timeout=30,
)
# The response may be correct, approximately correct, or confidently wrong --
# and the API gives you no field telling you which. Detecting that requires
# the techniques in Intermediate Concepts and Production Usage.
print(response.choices[0].message.content)
~~~
`,

  "intermediate-concepts": `
### Self-consistency checks — detecting hallucination by disagreement with itself

The core idea: sample the same prompt multiple times (with nonzero temperature) and compare the answers. If the model actually "knows" a fact, most samples will converge on the same answer; if it is confabulating, different samples often diverge because there is no stable underlying fact anchoring the generation, only surface plausibility that varies run to run.

~~~python
# Minimal self-consistency check: sample N times, compare normalized answers.
# Production consideration: cap N (cost multiplies linearly) and normalize
# answers (lowercase, strip punctuation) before comparing to avoid false
# disagreement from formatting differences alone.
from collections import Counter

def self_consistency_check(client, prompt, n=5, model="gpt-4o-mini"):
    answers = []
    for _ in range(n):
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            timeout=30,
        )
        answers.append(resp.choices[0].message.content.strip().lower())
    counts = Counter(answers)
    top_answer, top_count = counts.most_common(1)[0]
    agreement_rate = top_count / n
    # A low agreement_rate is a signal (not a proof) of higher hallucination risk.
    return top_answer, agreement_rate
~~~

The honest limit: self-consistency only catches hallucinations that vary across samples. A model can be **consistently** wrong — confidently generating the same incorrect fact every single time, because that wrong association is strongly and stably encoded from training data — and self-consistency will report perfect agreement on a completely fabricated answer. This is why self-consistency is one signal to combine with retrieval grounding, not a standalone detector.

### Retrieval grounding and citation checking

Retrieval-augmented generation (full mechanics in the RAG skill) mitigates hallucination by giving the model actual source text to condition on, rather than relying purely on parametric knowledge memorized during training. But grounding alone is not enough — a model can still ignore the retrieved context and generate an unsupported claim anyway, or subtly misstate what the source said. Citation checking closes part of that gap: verify, claim by claim, that each factual assertion in the generated answer is actually supported by the retrieved passages it cites.

~~~python
# A basic claim-support checker: for each sentence in a generated answer,
# use an embedding similarity check against the retrieved source chunks to flag
# claims with no close match in the source material. This is a heuristic
# first-pass filter, not a proof of correctness -- see the worked example in
# Advanced Concepts for a more complete version with an LLM-as-judge fallback.
import re

def flag_unsupported_claims(answer_text, source_chunks, embed_fn, threshold=0.55):
    sentences = re.split(r"(?<=[.!?])\\s+", answer_text.strip())
    source_embeddings = [embed_fn(chunk) for chunk in source_chunks]
    flagged = []
    for sentence in sentences:
        if len(sentence.split()) < 4:
            continue  # skip trivial fragments
        sent_emb = embed_fn(sentence)
        best_score = max(cosine_similarity(sent_emb, se) for se in source_embeddings)
        if best_score < threshold:
            flagged.append({"sentence": sentence, "max_similarity": best_score})
    return flagged

def cosine_similarity(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    return dot / (norm_a * norm_b + 1e-9)
~~~

The honest limit: embedding similarity is a proxy for "topically related," not "logically entailed" — a sentence can be semantically close to a source chunk while still misstating a number or reversing a relationship the source described. Production systems typically layer a second, stricter check (natural-language-inference entailment models, or an LLM-as-judge prompted specifically to check entailment) on top of the similarity pre-filter — see the full worked pipeline in Advanced Concepts.

### Uncertainty estimation

Two complementary signals are used in practice:

- **Token-level probability**: most inference APIs can return log-probabilities for generated tokens; unusually low probability on a specific factual token (a name, a number, a date) correlates with higher hallucination risk, though it is a noisy signal and not available at all through every provider or every deployment mode.
- **Semantic entropy across paraphrases**: generate answers to several paraphrased versions of the same question and measure how much the underlying meaning (not just the surface wording) varies. High semantic disagreement across paraphrases that should have the same true answer is a stronger, if more expensive, hallucination-risk signal than raw token probability alone, because it is robust to superficial wording differences that do not change meaning.

### "Say I don't know" prompting

Explicitly instructing a model to decline or hedge when it lacks sufficient information measurably increases the rate of honest abstention on out-of-scope questions, because instruction-tuned models are trained to follow such framing when it is stated clearly and the model itself has some signal of low confidence available in context.

~~~text
Prompt addition: "If you are not confident in the answer, or if the answer is
not clearly supported by the information provided, say 'I don't have enough
information to answer that confidently' rather than guessing."
~~~

The honest limit: this only works when the model has some usable internal signal of its own uncertainty to act on. On questions where the model is confidently wrong (a strongly, stably memorized incorrect association, or a case where the training data itself contained the error), "say I don't know" framing does not help, because the model is not experiencing low confidence at all — it is confidently producing a false statement it has no reason to doubt. This is the same limitation that undermines self-consistency on stable, wrong parametric knowledge, and it is why "just prompt it to be honest" is never sufficient as a sole mitigation strategy.
`,

  "advanced-concepts": `
### A complete worked pipeline: grounded generation with citation verification

The following combines retrieval grounding, citation checking, and an LLM-as-judge entailment fallback into one pipeline — representative of what a production RAG-plus-fact-checking system actually looks like, rather than any single technique in isolation.

~~~python
# Full worked example: answer a question grounded in retrieved documents, then
# verify every claim is actually supported before returning the answer to the
# caller. Flags (rather than silently drops) unsupported claims so a human
# reviewer or an automated policy can decide what to do with them.
#
# Production considerations included: timeouts on every model call, a
# similarity pre-filter to avoid running the expensive LLM-judge check on
# obviously well-grounded sentences, and a defined fallback (flag, don't guess)
# when verification itself is inconclusive.

import re

def answer_with_verification(client, question, retrieved_chunks, embed_fn,
                              sim_threshold=0.55, model="gpt-4o-mini"):
    context = "\\n\\n".join(f"[Source {i+1}] {c}" for i, c in enumerate(retrieved_chunks))
    prompt = (
        "Answer the question using ONLY the sources below. Cite the source "
        "number for each factual claim. If the sources do not contain enough "
        "information, say so explicitly rather than guessing.\\n\\n"
        f"Sources:\\n{context}\\n\\nQuestion: {question}\\nAnswer:"
    )
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        timeout=30,
    )
    answer = resp.choices[0].message.content

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\\s+", answer) if len(s.split()) >= 4]
    source_embeddings = [embed_fn(c) for c in retrieved_chunks]

    flagged = []
    for sentence in sentences:
        sent_emb = embed_fn(sentence)
        best_score = max(_cosine(sent_emb, se) for se in source_embeddings)
        if best_score < sim_threshold:
            # Escalate to a stricter, more expensive entailment check before flagging.
            verdict = _llm_entailment_check(client, sentence, retrieved_chunks, model)
            if verdict != "supported":
                flagged.append({"sentence": sentence, "similarity": best_score, "verdict": verdict})

    return {"answer": answer, "flagged_claims": flagged, "fully_grounded": len(flagged) == 0}


def _llm_entailment_check(client, sentence, source_chunks, model):
    context = "\\n\\n".join(source_chunks)
    judge_prompt = (
        "Given the SOURCE text and a CLAIM, answer with exactly one word: "
        "'supported' if the source text directly supports the claim, "
        "'contradicted' if it contradicts the claim, or 'unverifiable' if the "
        "source text neither confirms nor denies it.\\n\\n"
        f"SOURCE:\\n{context}\\n\\nCLAIM: {sentence}\\n\\nAnswer:"
    )
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": judge_prompt}],
        temperature=0,
        timeout=30,
    )
    return resp.choices[0].message.content.strip().lower()


def _cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    return dot / (na * nb + 1e-9)
~~~

This pipeline is deliberately layered: a cheap similarity pre-filter narrows the set of sentences needing expensive verification, and an LLM-as-judge entailment check handles the cases similarity alone cannot resolve. Even this full pipeline has honest limits: the judge model can itself be wrong (a hallucination-checker is not immune to hallucinating its own verdict), and both stages assume the retrieved source material is itself correct — garbage grounding produces confidently "well-grounded" garbage. Treat pipeline output as a strong risk signal to route (auto-approve, flag for human review, or reject), not as a proof of truth.

### Why hallucination correlates with certain conditions

- **Long-tail and rare facts**: information that appeared rarely (or once) in training data produces a weaker, less stable association than information repeated across thousands of documents — the model's "confidence" (in the sense of probability mass on the correct continuation) is genuinely lower, even though its surface fluency does not signal that.
- **Precise enumeration and citation**: exact counts, exact quotes, and exact bibliographic details are exactly the kind of high-precision, low-redundancy information that next-token prediction is worst at reproducing faithfully, because a plausible-sounding fabricated citation and a real one are drawn from the same distribution of "things that look like citations."
- **False-premise questions**: a question that assumes something untrue ("why did X happen in 1990" when X happened in 1995 or never happened) pressures the model to answer the question as asked rather than to first challenge the premise, unless explicitly prompted or trained to check premises first.
- **Long generations compounding**: in a long, multi-paragraph answer, an early small error can become the premise for later sentences that build on it, compounding a single hallucination into a larger internally-consistent-but-wrong narrative — a pattern sometimes called snowballing.

### Decision table: which mitigation for which hallucination category

| Symptom | Likely mitigation |
|---------|-------------------|
| Model confidently states long-tail or obscure facts wrong | Retrieval grounding (RAG) — give it the actual source instead of relying on parametric memory |
| Model fabricates citations, sources, or quotes | Citation verification pass; never trust a citation the model produced without checking it exists |
| Model answers a false-premise question as if the premise were true | Explicit premise-checking step, or a prompt instruction to verify the premise before answering |
| Model states different facts across repeated calls to the same question | Self-consistency sampling flags this; investigate before trusting either answer |
| Model states the same wrong fact every time | Self-consistency will NOT catch this — needs retrieval grounding or an external fact source |
| Long generation "snowballs" an early error into a larger wrong narrative | Chunk generation and verify incrementally rather than checking only the final output |
| Model answers outside its actual knowledge instead of declining | Calibrated "say I don't know" prompting plus an explicit abstention policy in the system design (see Guardrails) |
`,

  "internal-working": `
Understanding why hallucination is structural, not incidental, requires tracing exactly what a model does and does not have access to during generation.

~~~mermaid
flowchart LR
    A["Training corpus\n(text, no explicit truth labels)"] --> B["Next-token prediction\ntraining objective"]
    B --> C["Learned parameters\n(statistical associations between\ntokens, not a fact database)"]
    C --> D["Prompt at inference time"]
    D --> E["Autoregressive generation\n(one token at a time,\nno verification step)"]
    E --> F["Fluent output\n(no signal distinguishing\nverified vs. plausible tokens)"]
~~~

1. **The training objective has no truth label.** A language model is trained to maximize the probability it assigns to the next token that actually appeared in its training text, given the preceding tokens. There is no separate "true/false" label attached to sentences during this pretraining phase — the model is learning "what token plausibly comes next given this context, based on statistical patterns across a huge corpus," not "what is factually correct." Most of that corpus is true or at least internally consistent, so the model's outputs correlate strongly with truth on well-represented topics — but the mechanism producing the output is pattern completion, not fact retrieval.

2. **Instruction-tuning and RLHF change the shape of the problem, not its root cause.** Fine-tuning on human preference data trains the model to produce responses humans rate highly — typically, confident, complete, helpful-sounding answers. If human raters (during training data collection) rewarded confident answers over honest hedging more often than they should have, the resulting model is pushed toward always producing a fluent answer rather than toward calibrated abstention. This is a widely discussed contributing factor: RLHF can inadvertently make models more prone to confidently wrong answers on topics where honest uncertainty would be the better response, because the training signal rewarded the surface quality of confidence over the accuracy of the underlying claim.

3. **Autoregressive generation has no verification step.** At each generation step, the model computes a probability distribution over the next token and samples from it — there is no built-in pause where the model checks the token it is about to emit against an external fact source. Unless a system architecture adds that check externally (retrieval before generation, or verification after), nothing in the base generation loop can stop a fabricated fact from being emitted with exactly the same fluency as a correct one.

4. **The model has no persistent, queryable "belief state" to introspect.** Concepts like "the model's confidence" are approximations built from proxies — token-level probabilities, or agreement across multiple samples — not a genuine internal ledger of "known facts" versus "guesses" that the model can consult and report on directly. This is why asking a model "are you sure?" is unreliable as a standalone check: the model generates a response to that follow-up question using the same generation process, with no more access to ground truth than it had the first time, and can just as fluently produce a false reassurance as a genuine correction.

5. **Snowballing compounds the problem within a single generation.** Because each new token is conditioned on all prior tokens including the model's own earlier output, an early hallucinated claim becomes part of the context for everything generated after it — later tokens are generated as if the earlier fabrication were established fact, producing a longer, internally consistent, but entirely wrong narrative rather than a single isolated error.

The practical takeaway: every mitigation technique on this page works by adding something external to this loop that the base generation process does not have — retrieved ground truth, an external verification pass, multiple independent samples to check for disagreement, or a calibrated prompt nudging the model toward the abstention behavior it was capable of but not reliably defaulting to.
`,

  architecture: `
Hallucination mitigation is not a single component — it is a set of checks layered around the model call, at different points in the request lifecycle.

~~~mermaid
flowchart TB
    subgraph Input["Input stage"]
        Q["User question"]
        Retr["Retrieval\n(fetch grounding documents)"]
    end
    subgraph Gen["Generation stage"]
        Prompt["Grounded prompt\n(question + sources +\n'cite your sources' instruction)"]
        Model["LLM generation"]
    end
    subgraph Verify["Verification stage"]
        Sim["Similarity pre-filter\n(fast, cheap)"]
        Judge["LLM-as-judge entailment check\n(slower, stricter, on flagged sentences)"]
    end
    subgraph Policy["Decision stage"]
        Route{"Fully grounded?"}
        Accept["Return to user"]
        Flag["Flag for human review\nor return with caveats"]
        Reject["Abstain / escalate"]
    end
    Q --> Retr --> Prompt --> Model --> Sim
    Sim -->|clear| Route
    Sim -->|uncertain| Judge --> Route
    Route -->|yes| Accept
    Route -->|partial| Flag
    Route -->|no, high risk| Reject
~~~

### How applications should be structured around this

- **Grounding happens before generation, not as an afterthought.** The retrieval step (see the RAG skill for full mechanics) needs to run before the prompt is built, and the prompt itself needs an explicit instruction to use only the provided sources and to cite them — an ungrounded model call with no retrieval step has no chance of citation verification working at all.
- **Verification is a distinct module from generation**, with its own cost/latency budget — a cheap similarity pre-filter should absorb most of the traffic, escalating only genuinely ambiguous claims to a slower, more expensive judge model, mirroring the layered pattern used in most production fact-checking pipelines.
- **The decision/policy layer is where Guardrails lives**: what happens to a flagged claim (block it, caveat it, route to a human, silently drop it) is a product and risk decision, not a modeling decision — this page and the RAG/Structured-Outputs skills produce the signal; the Guardrails skill is where the enforcement policy is implemented and owned.
- **Evaluation sits outside this diagram, watching it over time**: hallucination rate is not a one-time check — it needs to be measured continuously against a held-out benchmark and production sampling, which is the full subject of the Evaluation skill.
`,

  "data-flow": `
Tracing one question through a grounded-and-verified pipeline end to end makes concrete exactly where hallucination can be introduced and where each mitigation intervenes.

~~~mermaid
sequenceDiagram
    participant User
    participant Retriever
    participant Builder as Prompt builder
    participant Model as LLM
    participant Verifier
    participant Policy as Abstention policy

    User->>Retriever: question
    Retriever-->>Builder: top-k relevant source chunks
    Builder->>Model: grounded prompt (question + sources + citation instruction)
    Note over Model: Generation has no verification step here --\nan unsupported claim can still be produced.
    Model-->>Verifier: generated answer with citations
    Verifier->>Verifier: similarity pre-filter per sentence
    alt clearly supported
        Verifier-->>Policy: mark sentence supported
    else ambiguous
        Verifier->>Model: LLM-as-judge entailment check
        Model-->>Verifier: supported / contradicted / unverifiable
        Verifier-->>Policy: mark verdict
    end
    Policy->>Policy: aggregate verdicts across all sentences
    alt fully grounded
        Policy-->>User: answer, as generated
    else some claims flagged
        Policy-->>User: answer with caveats / redacted claims,\nor explicit abstention on the flagged part
    end
~~~

The key insight this trace makes visible: hallucination can be introduced at exactly one point — the Model's generation step — but it can be caught at exactly one point too, the Verifier stage, and only if that stage actually exists in the architecture. A system with retrieval but no verification step is grounded in the sense that the model saw real sources, but it is not protected against the model ignoring those sources or subtly misstating them; the sequence above shows why the verification and policy stages are not optional add-ons but the actual load-bearing defense.
`,

  "production-usage": `
### How real teams run hallucination mitigation, not just discuss it

Mature teams do not treat hallucination as a one-time model-selection decision — they treat it as an ongoing operational concern with dedicated tooling and metrics:

- **A hallucination rate is tracked as a first-class metric**, usually measured against a held-out benchmark set plus a sampled slice of real production traffic reviewed periodically by humans, not inferred from user complaints alone.
- **Grounding is mandatory for any answer presented as factual**, with a defined fallback when retrieval returns nothing relevant (abstain, rather than let the model answer from parametric memory alone on a topic the system is supposed to be grounded on).
- **Citation verification runs as a real pipeline stage**, not a one-off script — with its own latency budget, its own test set, and its own on-call ownership, the same operational rigor as any other production service.
- **Abstention has a defined UX**, not just a backend behavior — "I don't have enough information to answer that confidently" needs a designed, tested user-facing form, because a system that abstains constantly is as unusable as one that hallucinates constantly, and the tuning between the two is a genuine product decision.

### Typical project layout

~~~text
myservice/
├── retrieval/
│   ├── retriever.py         # fetch grounding documents (see the RAG skill)
│   └── index/
├── generation/
│   ├── prompts/
│   │   └── grounded_answer_v3.py
│   └── client.py             # model API wrapper with timeouts, retries
├── verification/
│   ├── similarity_filter.py  # cheap pre-filter over generated claims
│   ├── entailment_judge.py   # LLM-as-judge escalation for ambiguous claims
│   └── eval_set/
│       └── hallucination_benchmark.json
├── policy/
│   └── abstention_policy.py  # decision logic: accept / flag / reject
└── monitoring/
    └── hallucination_dashboard.py  # rate over time, by category, by source
~~~

### Operational defaults worth adopting

- **Log the full grounding context alongside every generated answer** — you cannot audit a flagged hallucination without seeing exactly what sources the model had available at generation time.
- **Set temperature near zero for factual/extraction tasks** where consistency and groundedness matter more than variety — see the Prompt Engineering skill for the general practice, applied here specifically to reduce answer-to-answer variance that would otherwise make self-consistency checks noisier than necessary.
- **Version and re-benchmark on every model or prompt change**: a hallucination rate measured against one model snapshot is not guaranteed to hold after a silent provider-side update — re-run the hallucination benchmark on any model version change, the same discipline covered in Prompt Engineering's testing section.
- **Route by risk tier, not uniformly**: a low-stakes internal tool can tolerate a higher hallucination rate with lighter verification; a customer-facing legal, medical, or financial answer needs the full grounding-plus-verification-plus-human-review pipeline — treat verification depth as a configurable, risk-tiered parameter, not a single fixed setting.
`,

  "industry-examples": `
- **Legal research assistants (e.g., tools built on top of case-law databases)**: after widely publicized incidents of models fabricating case citations that do not exist, legal AI products now universally emphasize retrieval-grounded answers with verified, clickable citations back to the actual case text — a direct, high-profile industry response to extrinsic hallucination in a domain where a fabricated citation has severe professional consequences.
- **Search and answer engines (e.g., Perplexity-style products)**: built around mandatory citation of retrieved sources for every factual claim, with the product UI itself designed to make the citation visible and checkable by the user — treating citation-grounding as a core product feature rather than a backend detail, directly addressing the "how would a user even know" problem hallucination creates.
- **Customer support AI platforms**: constrain generation to answer only from an approved knowledge base and explicitly instruct the model to decline or escalate to a human agent when the knowledge base does not cover a question — a production abstention policy in the sense covered in Best Practices, chosen because a support bot confidently inventing a wrong policy is a direct liability and trust cost.
- **Coding assistants (e.g., GitHub Copilot and similar tools)**: hallucinate nonexistent library functions or incorrect API signatures often enough that this specific failure mode has its own informal industry name ("package hallucination"); mitigations in this space lean on grounding completions in the actual open file and project context, plus static-analysis or compiler feedback loops as an external verification layer.
- **Enterprise document Q&A tools (contract analysis, financial report summarization)**: pair retrieval grounding with an explicit "answer only from the provided document, and quote the exact supporting sentence" instruction, precisely because a summarization tool that adds an unsupported detail to a financial or legal document is a direct business risk, not a minor quality issue.

Pattern to notice: every production system above pairs grounding with some form of verification, citation, or explicit abstention — none of them treat "use a good model" alone as sufficient, which is the same honest-limits lesson emphasized throughout this page.
`,

  "best-practices": `
1. **Ground factual answers in retrieved, verifiable source material whenever the answer needs to be trustworthy** — treat unretrieved, purely parametric answers to specific factual questions as inherently higher-risk (see RAG).
2. **Verify citations programmatically, never take a model-produced citation at face value** — a plausible-looking citation is not evidence it exists; check it against the actual source or a real bibliographic lookup.
3. **Use self-consistency sampling on high-stakes, ambiguous questions** where the cost of N samples is justified by the cost of an undetected error — and remember it only catches inconsistency, not stable wrong answers.
4. **Prompt explicitly for calibrated abstention** ("say you don't know if the sources don't support a confident answer") and design a real UX for that abstention path, not just a backend log line.
5. **Constrain output shape wherever the task allows it** — restricting a model to select from a known-valid set (a fixed list of categories, real product IDs, an enum) makes certain hallucination categories structurally impossible rather than merely less likely (see Structured Outputs).
6. **Layer verification by cost**: a cheap similarity or rule-based pre-filter first, an expensive LLM-as-judge or human review only on the fraction flagged as ambiguous — this is the same layered-cost discipline used throughout production ML systems.
7. **Measure hallucination rate on a real benchmark, continuously**, not from anecdotal spot-checks — treat it as a tracked production metric with the same rigor as latency or error rate (see Evaluation).
8. **Tier verification depth by risk**, not uniformly across every use case — a low-stakes internal summarizer and a customer-facing legal answer should not run the same verification budget.
9. **Re-validate after every model or prompt version change** — a hallucination rate measured against one snapshot does not transfer automatically across silent provider updates.
10. **Treat the retrieved source material's own quality as part of the problem** — grounding in stale, wrong, or biased source documents produces confidently "faithful" wrong answers; source curation is a genuine hallucination-mitigation lever, not just a retrieval-quality one.
11. **Design the abstention UX as carefully as the answer UX** — a system that hedges on everything is as unusable as one that hallucinates on everything; tune the threshold deliberately against real user tolerance, not a single default.
12. **Red-team your own system for hallucination deliberately**, including false-premise questions and long-tail factual probes, rather than waiting for production incidents to reveal the gaps (see AI Red Teaming).
`,

  "anti-patterns": `
### Trusting model-generated citations without checking them — the classic

~~~text
WRONG:
"Cite three peer-reviewed sources for this claim."
[citations are inserted into a report as-is, never checked against a real database]
  → a fabricated-but-plausible-looking citation ships in a real document,
    discovered only when a reader tries to look it up and it does not exist.

RIGHT:
"Cite three peer-reviewed sources for this claim."
[each returned citation is checked against a real bibliographic database or
DOI resolver before being included; unverifiable citations are flagged and
either removed or manually confirmed before publication]
~~~

### Other production-grade anti-patterns

- **Treating a bigger or newer model as "solving" hallucination.** Model upgrades measurably reduce hallucination rates on many benchmarks, but they do not eliminate the failure mode; shipping without a verification layer on the assumption that "this model is good enough" is a recurring, costly mistake.
- **Using self-consistency as the only check.** As covered in Intermediate and Advanced Concepts, self-consistency cannot catch a stably, confidently wrong answer — pairing it with retrieval grounding is necessary, not optional, for anything high-stakes.
- **Grounding without verifying the model actually used the ground truth.** Retrieval alone does not guarantee the model's answer is faithful to what was retrieved; skipping the citation/entailment check assumes a behavior the architecture does not enforce.
- **No abstention path at all.** A system designed to always produce a confident-sounding answer, with no "I don't know" option wired into the prompt or the product UX, structurally cannot represent honest uncertainty even when the underlying signal for it exists.
- **Flat, one-size-fits-all verification depth.** Running the same lightweight (or the same expensive) check on every request regardless of stakes wastes budget on low-risk traffic or under-protects high-risk traffic — verification depth should be a risk-tiered configuration, not a constant.
- **Anecdotal "it seemed fine when I tried it" validation.** Judging hallucination rate from a handful of manually tried prompts, rather than a real benchmark and ongoing production sampling, systematically underestimates the true rate because the cases a developer happens to try are rarely the long-tail, adversarial, or false-premise cases where hallucination concentrates.
- **Treating the retrieved source corpus as automatically correct.** Grounding in an unreviewed or stale document set produces confidently wrong answers that pass every faithfulness check, because faithfulness to a wrong source is not the same as correctness.
`,

  performance: `
### Measure first

Before adding verification overhead, instrument what your system's actual hallucination-related costs and rates look like:

~~~python
# Minimal instrumentation around a grounded-answer call: capture whether
# verification ran, how many claims were flagged, and the added latency.
import time

def call_with_verification_metrics(pipeline_fn, question, retrieved_chunks, embed_fn):
    start = time.perf_counter()
    result = pipeline_fn(question, retrieved_chunks, embed_fn)
    elapsed = time.perf_counter() - start
    flagged_count = len(result["flagged_claims"])
    # Production consideration: aggregate these across thousands of requests
    # to track hallucination-flag rate over time, not just print per-call.
    print(f"latency={elapsed:.2f}s flagged_claims={flagged_count} "
          f"fully_grounded={result['fully_grounded']}")
    return result
~~~

### The optimization hierarchy (apply in order)

1. **Cheap pre-filters before expensive judges** — a similarity or rule-based check should absorb the majority of traffic; route only genuinely ambiguous claims to a slower LLM-as-judge pass, the same layered-cost pattern used throughout ML systems.
2. **Batch verification calls where possible** rather than checking one sentence per API call sequentially — reduces overhead and improves throughput on longer generated answers (see the Serving skill for the general batching mechanics).
3. **Cache verification results for repeated or near-duplicate claims** — a frequently asked question grounded in the same source material does not need re-verification from scratch every time.
4. **Right-size verification depth to risk tier** — running the full entailment-judge pipeline on every low-stakes internal query wastes latency and cost that a cheaper similarity check would have sufficed for.
5. **Cap self-consistency sample count deliberately** — N=3 to 5 samples typically captures most of the detectable disagreement signal; going much higher multiplies cost with diminishing additional signal for most tasks.
6. **Reduce snowballing cost by verifying incrementally** on very long generations — checking a multi-page answer only at the end means an early error has already propagated through everything that followed it, wasting both generation and review effort; chunked generation with periodic verification catches errors before they compound.

### Facts worth knowing

- Verification adds real latency and cost on top of the generation call itself — an LLM-as-judge entailment check is effectively a second model call, so a naive "verify everything with a judge" design can roughly double per-request cost; the layered pre-filter approach exists specifically to avoid paying that cost on every claim.
- Self-consistency multiplies generation cost by the sample count N — reserve it for genuinely high-stakes or ambiguous questions rather than applying it uniformly.
- Retrieval grounding itself typically adds modest latency (an index lookup) compared to generation, but produces the largest single reduction in hallucination rate for knowledge-intensive tasks of any technique on this page — it is usually the highest-leverage first investment before reaching for the more expensive verification layers.
`,

  scalability: `
Hallucination mitigation does not "scale" the way infrastructure throughput does, but a poorly designed verification pipeline creates real scaling bottlenecks that a well-designed one avoids.

### Where mitigation design intersects with scale

~~~mermaid
flowchart LR
    Req["Incoming requests"] --> Ground["Retrieval + grounded generation"]
    Ground --> Filter{"Similarity pre-filter\nper claim"}
    Filter -->|clearly supported, majority| Fast["Fast path\nno judge call needed"]
    Filter -->|ambiguous, minority| Judge["LLM-as-judge escalation"]
    Fast --> Out["Response"]
    Judge --> Out
~~~

### Bottleneck table

| Bottleneck | Mitigation-relevant answer |
|------------|-------------------------------------|
| Every generated answer runs a full LLM-as-judge check on every sentence | Use a cheap similarity pre-filter first; escalate only the ambiguous fraction to the judge, keeping judge-call volume a small percentage of total traffic |
| Self-consistency sampling at high request volume | Reserve N-sample majority voting for a narrow, genuinely high-stakes subset of traffic, not the default path for every request |
| Long generations require verifying many claims sequentially | Batch claim-verification calls, or verify incrementally during generation rather than only after a long answer completes |
| Retrieval index grows and lookup latency creeps up | Standard retrieval scaling concerns (indexing strategy, approximate nearest-neighbor search) — see the RAG and Vector Search skills for the dedicated treatment |
| Verification pipeline becomes the new latency bottleneck after grounding is added | Profile the pipeline like any other service; parallelize independent claim checks rather than checking claims strictly sequentially |

### Horizontal scale note

The prompt-and-generation side of hallucination mitigation scales exactly like any other LLM-serving workload (see the Serving and Inference skills). The mitigation-specific scaling contribution is keeping the verification layer's cost proportional to actual risk and ambiguity — a layered, risk-tiered design keeps the expensive checks a small fraction of total request volume, which is what allows verification to scale to production traffic at all without becoming the dominant cost or latency driver.
`,

  security: `
Hallucination intersects with security and trust in ways distinct from, but related to, prompt injection (see the Prompt Injection Defense skill) and general model safety (see Guardrails and AI Red Teaming).

### The core risk

A hallucinated claim delivered with full confidence can be more damaging than an obviously wrong or garbled answer, precisely because a user or downstream system has no surface signal to distinguish it from a correct one. This becomes a security-relevant concern when hallucinated output feeds into: a decision system acting on the claim (an automated pipeline that takes a model's extracted "fact" and uses it downstream without human review), a user-facing product where a fabricated claim about safety, legality, or medical information causes real-world harm, or an adversarial context where an attacker deliberately crafts a prompt designed to elicit a specific false claim (a false-premise question, a leading question implying an untrue fact) to generate misinformation at scale.

~~~text
Adversarial prompt pattern: "Since the FDA recall of [fabricated product] happened
last month, what should affected customers do?"
(The premise itself is invented; a model that does not check the premise may
generate a fluent, seemingly helpful answer that reinforces a fabricated event
as if it were true.)
~~~

### What mitigation can and cannot do about this

- **Retrieval grounding constrains the space of claims the model can plausibly support**, but does not stop a model from generating a confident answer to a false-premise question if the system does not explicitly check premises against the retrieved source before answering.
- **Verification pipelines catch unsupported claims within a single generation**, but they are themselves model-based components that can be fooled by the same adversarial techniques used against the primary model — a verification layer is a stronger defense than none, not an infallible one.
- **This is not a substitute for dedicated red-teaming.** Systematically probing a deployed system for false-premise vulnerability, long-tail factual gaps, and citation-fabrication patterns before real users or attackers find them is the full subject of the AI Red Teaming skill; treat this section as the "why hallucination has a security dimension" framing, not the complete defense.

### Other security-adjacent hallucination concerns

- **Trust calibration in the product UX**: a product that presents every answer with equal visual confidence (regardless of grounding or verification status) trains users to over-trust output that has not actually been checked — surfacing citation and confidence signals in the UI is a genuine mitigation, not just a nicety.
- **Automated pipeline risk**: any system where a model's output is consumed programmatically without human review (auto-filing a generated summary into a record system, auto-populating a field from an extracted "fact") inherits full exposure to unverified hallucination; treat model output feeding an automated decision as requiring the same verification rigor as user-facing output, arguably more, since no human is in the loop to catch an error before it propagates.
`,

  testing: `
Hallucination-mitigation systems should be tested with the same rigor as any other production system — against a held-out benchmark with known ground truth, not a handful of prompts a developer happened to try.

~~~python
# A minimal hallucination-benchmark test harness. Real production suites pull
# from a much larger labeled set (see Production Usage's eval_set layout) and
# typically include long-tail facts, false-premise questions, and adversarial
# citation-fabrication probes, not just easy well-known facts.

import pytest
from myservice.generation.grounded_answer import answer_with_verification

BENCHMARK_CASES = [
    {
        "question": "What is the boiling point of water at sea level in Celsius?",
        "expected_answer_contains": "100",
        "expect_abstention": False,
    },
    {
        "question": "What is the exact court docket number for the case Smith v. Jones "
                     "decided in a jurisdiction that does not use that naming convention?",
        "expected_answer_contains": None,
        "expect_abstention": True,  # a well-designed system should decline, not fabricate a docket number
    },
]

@pytest.mark.parametrize("case", BENCHMARK_CASES)
def test_hallucination_benchmark(case, retriever, embed_fn):
    chunks = retriever.retrieve(case["question"])
    result = answer_with_verification(client=None, question=case["question"],
                                       retrieved_chunks=chunks, embed_fn=embed_fn)
    if case["expect_abstention"]:
        assert "don't have enough information" in result["answer"].lower() or \\
               len(result["flagged_claims"]) > 0, \\
               "expected abstention or a flagged claim, got a confident unflagged answer"
    else:
        assert case["expected_answer_contains"] in result["answer"]
        assert result["fully_grounded"], f"expected fully grounded answer, flags: {result['flagged_claims']}"
~~~

### The senior testing doctrine for hallucination mitigation

- **Include false-premise and adversarial cases deliberately** in the benchmark, not just easy factual lookups — this is exactly where hallucination concentrates and exactly where naive testing misses it.
- **Test the abstention path as its own first-class behavior**, not just the "does it get the answer right" path — a system that never abstains, even on genuinely unanswerable questions, is failing a real requirement even if its answered-question accuracy looks fine.
- **Measure a hallucination rate as a real metric across the benchmark**, not a pass/fail on individual cases alone — track it over time as a trend, the same way you would track latency percentiles, and treat regressions the same as any other production quality regression (see the Evaluation skill for the full methodology).
- **Re-run the full benchmark on every model or prompt version change** — the same discipline as prompt testing generally (see Prompt Engineering), because a hallucination rate measured against one model snapshot does not transfer automatically to the next.
- **Use human-labeled ground truth for the benchmark itself**, and validate any LLM-as-judge component of your verification pipeline against that human-labeled set before trusting it — an unvalidated judge model is itself a source of hallucinated verdicts.
`,

  debugging: `
### The toolbox, in escalation order

1. **Read the exact grounded prompt and retrieved sources, not just the final answer.** A hallucinated claim in the output often traces back to either missing retrieval (the source that would have supported or contradicted the claim was never fetched) or the model simply ignoring the sources it was given — these require different fixes, and you cannot tell which without seeing what was actually retrieved.
2. **Reproduce at temperature zero first** to remove sampling randomness as a variable while diagnosing whether the issue is structural (the model consistently gets this wrong) or stochastic (it only happens on some samples) — this distinction determines whether self-consistency checking is even a relevant tool for this specific case.
3. **Check whether the claim is intrinsic or extrinsic** relative to the retrieved context: does it contradict something the sources said, or does it assert something the sources never addressed at all? The fix differs — a contradiction points to the model ignoring or misreading context; an unaddressed claim points to the model falling back on parametric memory when it should have abstained.
4. **Run the citation-verification step manually on the flagged sentence** and inspect the similarity score and judge verdict directly — a false-positive flag (a true claim flagged as unsupported) and a false-negative miss (a false claim that passed verification) point to different tuning needs: threshold adjustment for the former, a stronger judge prompt or model for the latter.
5. **Check for a false premise in the original question** if the model's answer seems to confidently build on something that was never established — this is a common, non-obvious root cause that a simple "check the model's answer" debugging pass misses, because the error is in accepting the question's framing, not in the factual content of the response itself.
6. **Look for snowballing** on long, multi-paragraph outputs — trace the answer sentence by sentence to find the first unsupported claim; everything after it may be internally consistent with that error rather than independently wrong, which changes how you scope the fix (fix the source of the snowball, not each downstream symptom).
7. **Compare across models/versions** if a previously well-grounded pipeline regresses after a silent model upgrade — re-run the full hallucination benchmark rather than assuming a newer model is strictly better on this specific dimension for your specific task.

### Debugging a verification pipeline giving unreliable verdicts

~~~text
Symptom: the LLM-as-judge entailment check disagrees with human review on a
non-trivial fraction of flagged claims.
Escalation:
1. Pull the disagreement cases and check whether the judge prompt itself is
   ambiguous (does "supported" clearly mean direct entailment, not just topical
   relevance?).
2. Validate the judge against a human-labeled sample before trusting it in
   production -- an unvalidated judge is itself a source of unreliable verdicts.
3. Consider a stronger or differently-prompted judge model specifically for
   entailment checking, since this is a narrower and more precise task than
   open-ended generation.
~~~
`,

  monitoring: `
### What to measure

- **Hallucination flag rate**: the fraction of generated answers with at least one claim flagged by the verification pipeline, tracked over time and segmented by task type, model version, and retrieval source quality.
- **Abstention rate**: how often the system declines or hedges — tracked alongside flag rate, because a system tuned to reduce flags by abstaining more aggressively is trading one metric for another, and both need visibility to catch an over-correction.
- **Self-consistency agreement rate** on a sampled slice of high-stakes traffic, as a lightweight, ongoing proxy signal between full benchmark runs.
- **Verification pipeline latency and cost**, since an expanding judge-escalation rate (more claims needing the expensive check) can signal either a genuine increase in ambiguous content or a degrading similarity pre-filter threshold that needs retuning.
- **Human review outcomes on flagged claims**: what fraction of flagged claims are confirmed as actual hallucinations versus false positives — this closes the loop and is the ground truth your automated metrics should be validated against periodically.

~~~python
# Minimal instrumentation: log structured events for every verification
# outcome so rates can be aggregated on a dashboard, not just eyeballed.
import logging
import time

logger = logging.getLogger("hallucination_monitoring")

def log_verification_event(question, flagged_claims, fully_grounded, latency_s):
    # Production consideration: emit to a metrics/logging backend (not just
    # stdout) with fields structured for aggregation by model version,
    # task type, and time window.
    logger.info({
        "event": "verification_result",
        "timestamp": time.time(),
        "fully_grounded": fully_grounded,
        "flagged_count": len(flagged_claims),
        "latency_s": latency_s,
    })
~~~

### Alerting worth setting up

- Alert on a sustained rise in flag rate for a given task or model version — a genuine signal of either a model regression, a retrieval-quality drop, or a shift in the traffic mix toward harder questions.
- Alert on a sustained rise in abstention rate beyond an expected baseline — a system quietly becoming unusable due to over-cautious tuning is a real regression, just a less visible one than a hallucination spike.
- Periodically sample flagged and unflagged claims alike for human review — verification pipelines can develop blind spots (consistent false negatives on a specific claim type) that only surface through this kind of ongoing audit, not through the automated metrics alone.
`,

  deployment: `
A production-grade deployment for a hallucination-mitigated answering service separates the generation, verification, and policy concerns into distinct, independently scalable stages.

~~~text
# docker-compose.yml (illustrative) -- separate services for generation,
# verification, and the policy/abstention layer, each independently scalable.

version: "3.9"
services:
  retriever:
    build: ./retrieval
    environment:
      - INDEX_PATH=/data/vector_index
    volumes:
      - ./data:/data
    # Production consideration: retrieval is read-heavy and latency-sensitive;
    # scale replicas independently of the generation service.

  generator:
    build: ./generation
    environment:
      - MODEL_API_KEY=(injected via secrets manager, not hardcoded)
      - MODEL_TIMEOUT_S=30
    depends_on:
      - retriever
    # Production consideration: pin the exact model version in config, not
    # "latest" -- a silent model upgrade should be a deliberate, re-benchmarked
    # deploy, not an automatic one.

  verifier:
    build: ./verification
    environment:
      - SIMILARITY_THRESHOLD=0.55
      - JUDGE_MODEL_TIMEOUT_S=30
    depends_on:
      - generator
    # Production consideration: verifier calls a judge model -- give it its
    # own timeout and its own rate limit separate from the primary generator,
    # so a verification slowdown does not starve primary generation traffic.

  policy:
    build: ./policy
    depends_on:
      - verifier
    # Production consideration: abstention thresholds live here as
    # configuration, versioned and reviewable independently of model or
    # prompt changes -- a risk/product decision, not a modeling one.
~~~

Per-line justification: the retriever, generator, verifier, and policy stages are deliberately separate services rather than one monolithic call, because each has a different scaling profile (retrieval is read-heavy, generation is compute-heavy per call, verification is bursty depending on flag rate, and policy is cheap but must be independently auditable). Pinning model versions explicitly in generator config, rather than tracking a provider's "latest," ensures a hallucination-rate regression from a silent model update triggers a deliberate re-benchmark rather than an invisible production quality drop. The API key is deliberately injected via a secrets manager rather than hardcoded in the compose file, consistent with treating credentials the same as any other production secret.
`,

  "production-checklist": `
- [ ] Every factual answer intended to be trustworthy is grounded in retrieved, real source material rather than relying solely on parametric model knowledge.
- [ ] A citation-verification step runs on generated answers, checking each factual claim against the retrieved sources, not just presenting model-produced citations as-is.
- [ ] A defined abstention behavior and UX exist for questions the system cannot confidently answer, tested as its own first-class case, not an afterthought.
- [ ] Self-consistency or another disagreement-based check is applied to genuinely high-stakes or ambiguous questions where the added cost is justified.
- [ ] Verification depth is tiered by risk (low-stakes internal tools vs. customer-facing legal/medical/financial answers use different verification budgets).
- [ ] A real hallucination benchmark exists, including long-tail facts, false-premise questions, and adversarial citation-fabrication probes — not just easy well-known facts.
- [ ] Hallucination flag rate and abstention rate are tracked as ongoing production metrics with alerting on regressions.
- [ ] The full benchmark is re-run on every model version or prompt change before it ships, not assumed to hold from the last validation.
- [ ] The retrieved source corpus itself has a review/freshness process — grounding in stale or wrong sources is treated as a hallucination-mitigation failure, not just a retrieval-quality issue.
- [ ] Any LLM-as-judge component in the verification pipeline has itself been validated against human-labeled ground truth before being trusted in production.
- [ ] Model output consumed by automated downstream systems (no human in the loop) has at least the same verification rigor as user-facing output, given the absence of a human catch point.
- [ ] The system has been red-teamed specifically for hallucination (false premises, fabricated citations, long-tail gaps) before general release, not only for the more commonly tested prompt-injection and safety categories.
- [ ] Product/engineering leadership understands and has signed off on the honest limits: hallucination rate is managed and monitored, not eliminated, and the acceptable rate for this specific use case has been explicitly decided, not left implicit.
`,

  "common-mistakes": `
1. **Assuming a bigger or newer model fixes the problem.** Model quality improvements reduce hallucination rate on many benchmarks but do not eliminate the failure mode — shipping without any verification layer on this assumption is one of the most common and costly mistakes in the field.
2. **Treating self-consistency as sufficient on its own.** It only detects disagreement across samples and structurally cannot catch a stably, confidently wrong answer — a real gap covered in Advanced Concepts that teams repeatedly rediscover the hard way in production.
3. **Trusting model-generated citations without verification.** A plausible-looking citation is not evidence it is real; skipping this check is how fabricated case law and nonexistent papers end up in real documents.
4. **Grounding without checking the model actually used the source.** Retrieval alone does not guarantee faithfulness — teams frequently assume "we added RAG" means "we solved hallucination," which conflates grounding with verification.
5. **No abstention path.** Designing a system that always produces a confident-sounding answer removes the one honest option (declining) that would have been correct on genuinely unanswerable questions.
6. **Anecdotal validation.** Judging a system's hallucination rate from a handful of manually tried prompts systematically misses the long-tail and adversarial cases where the problem actually concentrates.
7. **Ignoring source quality.** Treating retrieval as a solved input rather than an ongoing data-quality concern — a stale or biased source corpus produces confidently "faithful" wrong answers that pass every faithfulness check.
8. **Applying uniform verification depth regardless of stakes.** Running the same lightweight check on a high-stakes legal answer as on a low-stakes internal summary either under-protects the former or wastes budget on the latter.
9. **Not re-validating after model or prompt changes.** A hallucination rate measured once and assumed to hold indefinitely misses regressions introduced by silent provider-side updates or well-intentioned prompt tweaks.
10. **Confusing tone for accuracy.** Assuming a persona prompt ("act as an expert") or a confident writing style is evidence of correctness, rather than recognizing that confident phrasing and factual accuracy are produced by entirely separate mechanisms in the model — see the Prompt Engineering skill's treatment of persona prompting's genuine limits.
`,

  "common-errors": `
| Error / symptom | Typical cause | Fix |
|------------------|----------------|-----|
| Model states a plausible but nonexistent citation, source, or quote | No citation-verification step; model generating from parametric pattern, not a real lookup | Add a citation-verification pass checking every citation against a real source or bibliographic database before it ships |
| Answer contradicts the retrieved context it was given | Model ignoring or misreading provided sources during generation | Add an entailment/faithfulness check between the generated answer and the retrieved sources; consider a stricter "answer only from the following, quote the exact sentence" prompt |
| Same question, different answers across repeated calls | Genuine model uncertainty/instability on this specific fact, likely long-tail knowledge | Flag via self-consistency check; prefer retrieval grounding over trusting either sampled answer |
| Confident wrong answer, consistent every time | Stable, incorrect parametric association (self-consistency will not catch this) | Add retrieval grounding against a real source for this fact class; do not rely on self-consistency alone |
| Model answers a false-premise question as if the premise were true | No premise-checking step in the pipeline | Add an explicit premise-verification step, or prompt the model to flag questionable premises before answering |
| Long answer contains an early error that later sentences build on | Snowballing — later tokens conditioned on the model's own earlier hallucinated claim | Verify incrementally during long generation rather than only at the end; chunk generation with periodic checks |
| Verification pipeline flags a large fraction of true claims (false positives) | Similarity threshold too strict, or judge prompt ambiguous about what counts as "supported" | Tune the threshold against a labeled validation set; clarify the judge prompt's definition of entailment |
| Verification pipeline misses a real hallucination (false negative) | Similarity pre-filter alone is too permissive, or judge model itself is unreliable on this claim type | Escalate more claims to the judge stage; validate the judge against human-labeled ground truth and consider a stronger judge model |
`,

  faqs: `
**Can hallucination be completely eliminated?** No, and treat any claim that it can be as a red flag. Grounding, verification, and calibrated abstention reduce its frequency and its downstream cost substantially, but the underlying generation mechanism (next-token prediction with no built-in truth signal) is not removed by any current mitigation technique — the honest goal is a measured, monitored, acceptably low rate for a given task and risk tolerance, not zero.

**Is RAG enough on its own?** No. Retrieval gives the model real source material to condition on, which meaningfully reduces reliance on possibly-wrong parametric memory, but it does not guarantee the model's answer is faithful to what was retrieved — a citation-verification or entailment-checking step is needed to catch cases where the model ignores or misstates the retrieved context. See the RAG skill for the full grounding pipeline and this page's Intermediate/Advanced Concepts for the verification layer that should sit alongside it.

**Does asking the model to "double-check itself" work?** Partially, and inconsistently. Self-critique catches some errors because a fresh evaluation pass, treating the first answer as an object to check rather than defend, is a genuinely different generation than the original. But the same model, with the same lack of access to ground truth, can just as fluently produce a false reassurance as a genuine correction — treat self-critique as a probabilistic filter to combine with external checks, not a proof of correctness.

**Why do bigger, newer models still hallucinate?** Because the training objective (next-token prediction, later shaped by instruction-tuning and RLHF) has not fundamentally changed — larger or more capable models are generally better calibrated and more accurate on well-represented knowledge, but the mechanism that produces hallucination (no built-in truth-checking step in generation) is architectural, not a capability gap that scale alone closes.

**Is hallucination the same as a prompt injection attack?** No — they are related but distinct concerns. Hallucination is the model producing unsupported or false content from its own generation process; prompt injection is an attacker manipulating the model's behavior via crafted input. A hallucination can occur with no adversarial intent at all, while prompt injection is specifically adversarial. See the Prompt Injection Defense skill for that distinct concern.

**How do I decide how much verification is enough for my use case?** Tier it by risk: estimate the real-world cost of an undetected hallucination for this specific task (a wrong internal summary versus a wrong legal or medical claim), and match verification depth accordingly — a cheap similarity pre-filter may be sufficient for low-stakes internal tools, while customer-facing high-stakes answers warrant the full grounding-plus-entailment-judge-plus-human-review pipeline.

**Can I just fine-tune the model to stop hallucinating?** Fine-tuning can improve calibration and reduce hallucination rate on the specific distribution of tasks and facts it is trained on, but it does not remove the structural gap for out-of-distribution or long-tail questions the fine-tuning data did not cover — it is a genuine lever, covered in the Fine-Tuning skill, but not a substitute for grounding and verification on knowledge-intensive tasks.
`,

  "interview-questions": `
**Junior level**

1. *What is hallucination in the context of large language models?* Model answer sketch: fluent, confident output that is factually wrong, unsupported by the given context, or internally inconsistent — and critically, indistinguishable in tone from a correct answer, which is what makes it dangerous.
2. *Name one technique to detect hallucination and explain briefly how it works.* Model answer sketch: self-consistency — sample the same prompt multiple times and compare answers; disagreement across samples is a signal (not proof) of higher hallucination risk.
3. *Why does grounding a model in retrieved documents (RAG) help with hallucination?* Model answer sketch: it gives the model real source text to condition on instead of relying purely on possibly-wrong parametric memory, though it does not guarantee the model actually uses that source faithfully.
4. *What is the difference between intrinsic and extrinsic hallucination?* Model answer sketch: intrinsic contradicts the given input/context directly; extrinsic makes an unverifiable claim relative to the input, whether or not it happens to be independently true.

**Senior level**

5. *Explain, at the training-objective level, why a language model has no built-in mechanism to distinguish a true statement from a plausible false one.* Model answer sketch: pretraining optimizes next-token prediction probability against training text, with no explicit true/false label; RLHF then further shapes behavior toward confident, helpful-sounding responses, which can bias the model toward answering over abstaining even when uncertain.
6. *Design a hallucination-mitigation pipeline for a legal document Q&A system. What stages would you include and why?* Model answer sketch: retrieval grounding in the actual document set, an explicit "answer only from the following, cite the exact sentence" prompt, a similarity pre-filter plus LLM-as-judge entailment check on generated claims, a defined abstention path for unsupported claims, and continuous benchmarking with human-reviewed ground truth given the high stakes of legal accuracy.
7. *Why can't self-consistency checking catch every hallucination?* Model answer sketch: it only detects disagreement across independent samples; a stably, confidently wrong answer produced identically every time (a strong, stable incorrect association from training) shows perfect agreement and passes the check undetected.
8. *What is snowballing, and why does it make hallucination worse in long generations?* Model answer sketch: because each token is generated conditioned on all prior tokens including the model's own earlier output, an early hallucinated claim becomes context the model treats as established fact for the rest of the generation, compounding one error into a longer, internally consistent but wrong narrative.
9. *How would you decide how much verification budget to allocate to a given production use case?* Model answer sketch: tier by risk — estimate the real cost of an undetected hallucination for that specific task and match verification depth (cheap similarity filter vs. full entailment-judge-plus-human-review) accordingly, rather than applying uniform verification everywhere.
10. *Is it accurate to say a particular mitigation technique "solves" hallucination? Why or why not?* Model answer sketch: no — every current technique reduces frequency or blast radius, none removes the structural gap between fluent generation and verified truth; claiming otherwise misrepresents both the research and the honest engineering tradeoffs involved.
11. *How does hallucination in a retrieval-grounded system differ if the source documents themselves are wrong?* Model answer sketch: the model can produce an answer that is faithful to the source and still factually wrong — a data-quality problem distinct from generation-side hallucination, requiring source curation and freshness review rather than a prompting or verification fix.
12. *What role does calibration play in hallucination mitigation, and what are its limits?* Model answer sketch: calibration techniques (token probability, semantic entropy across paraphrases) improve the correlation between expressed confidence and actual correctness, giving a useful risk signal, but do not produce a perfectly calibrated probability the way a well-specified statistical model can — treat it as a signal to route on, not a guarantee.
`,

  "coding-questions": `
### Problem 1: Self-consistency-based hallucination flagger

Write a function that samples a model N times for a factual question, normalizes the answers, and returns both the majority answer and an agreement score, flagging low agreement as higher hallucination risk.

~~~python
# Solution
from collections import Counter
import re

def normalize_answer(text):
    # Lowercase and strip punctuation/whitespace for fairer comparison across samples.
    return re.sub(r"[^\\w\\s]", "", text.strip().lower())

def self_consistency_flag(client, prompt, n=5, agreement_threshold=0.6, model="gpt-4o-mini"):
    raw_answers = []
    for _ in range(n):
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            timeout=30,  # production consideration: never let a hung call block the batch
        )
        raw_answers.append(resp.choices[0].message.content)

    normalized = [normalize_answer(a) for a in raw_answers]
    counts = Counter(normalized)
    top_norm, top_count = counts.most_common(1)[0]
    agreement = top_count / n
    top_raw = next(a for a, norm in zip(raw_answers, normalized) if norm == top_norm)

    return {
        "answer": top_raw,
        "agreement_rate": agreement,
        "high_risk": agreement < agreement_threshold,
        "all_answers": raw_answers,
    }
~~~

Complexity: O(n) model calls, each independent and parallelizable; O(n) for the counting pass. Follow-ups: how would you handle answers that are semantically identical but lexically different (e.g., "30" vs. "thirty")? (Use a semantic-similarity clustering step instead of exact string matching after normalization.) How would you extend this to numeric or structured answers rather than free text? (Parse to a canonical type before comparing, rather than comparing raw strings.)

### Problem 2: Citation existence verifier

Write a function that extracts citation-like patterns from generated text and checks each against a provided set of known-real sources, flagging any that do not match.

~~~python
# Solution
import re

def extract_citations(text):
    # Simplified pattern: matches "(Author, Year)" style citations.
    # Production consideration: real systems need a much more robust parser
    # covering multiple citation styles -- this is illustrative, not exhaustive.
    return re.findall(r"\\(([A-Z][a-zA-Z]+(?:\\s(?:et al\\.|and\\s[A-Z][a-zA-Z]+))?,\\s\\d{4})\\)", text)

def verify_citations(text, known_sources):
    # known_sources: a set of strings like "Smith, 2020" that are verified real.
    found = extract_citations(text)
    flagged = [c for c in found if c not in known_sources]
    return {
        "citations_found": found,
        "unverified_citations": flagged,
        "all_verified": len(flagged) == 0,
    }

# Example usage:
# known = {"Wei, 2022", "Vaswani, 2017"}
# result = verify_citations(
#     "Chain-of-thought reasoning was introduced by (Wei, 2022) and builds on "
#     "the transformer architecture (Vaswani, 2017), extending earlier work "
#     "(Nonexistent, 2019).",
#     known,
# )
# result["unverified_citations"] == ["Nonexistent, 2019"]
~~~

Complexity: O(m) regex scan over text length m, O(m) lookup checks against a set (O(1) average per lookup). Follow-ups: how would you handle citation styles beyond "(Author, Year)"? (Extend the pattern set or use a dedicated citation-parsing library.) How would you verify against a live database rather than a fixed known-sources set? (Replace the set-membership check with an API call to a bibliographic lookup service, with caching and a timeout.)

### Problem 3: Claim-support scoring against retrieved sources

Given a generated answer and a list of retrieved source chunks, write a function returning a per-sentence support score using simple keyword-overlap as a stand-in for a real embedding-similarity check.

~~~python
# Solution
import re

def sentence_split(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\\s+", text) if s.strip()]

def keyword_overlap_score(sentence, source_text):
    # Simplified stand-in for embedding similarity -- a real production system
    # would use vector similarity (see the flag_unsupported_claims example in
    # Intermediate Concepts) rather than raw keyword overlap.
    sent_words = set(re.findall(r"\\w+", sentence.lower()))
    source_words = set(re.findall(r"\\w+", source_text.lower()))
    if not sent_words:
        return 0.0
    return len(sent_words & source_words) / len(sent_words)

def score_claims(answer_text, source_chunks, threshold=0.3):
    sentences = sentence_split(answer_text)
    combined_source = " ".join(source_chunks)
    results = []
    for sentence in sentences:
        score = keyword_overlap_score(sentence, combined_source)
        results.append({
            "sentence": sentence,
            "support_score": round(score, 3),
            "flagged": score < threshold,
        })
    return results
~~~

Complexity: O(k) sentences times O(w) word-set operations each, roughly O(k*w). Follow-ups: why is keyword overlap a weaker signal than embedding similarity or entailment checking? (It misses paraphrases with no shared words and can be fooled by shared common words with no real semantic support — see the fuller pipeline in Advanced Concepts.) How would you combine this with the self-consistency and citation-verification approaches from Problems 1 and 2 into one pipeline? (Run all three as independent signals and aggregate into a single risk score, escalating to human review above a combined threshold.)
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Reproduce and categorize hallucination

Prompt a model with 10 factual questions spanning well-known facts, long-tail facts, and a deliberately false-premise question. For each response, manually classify it as correct, intrinsic hallucination, extrinsic hallucination, or honest abstention. Deliverable: a short table of question, response, and classification, plus a one-paragraph observation on which question type produced the most hallucination. Skills exercised: recognizing hallucination patterns, distinguishing intrinsic vs. extrinsic categories.

### Lab 2 (Intermediate): Build a self-consistency flagger

Implement the self-consistency check from Coding Questions Problem 1 against a small set of factual questions (some well-known, some long-tail). Run each question N=5 times and report the agreement rate. Deliverable: a script plus a short writeup identifying which questions had low agreement and manually verifying whether those answers were actually more often wrong than the high-agreement ones. Skills exercised: self-consistency detection, understanding its actual predictive power versus its limits.

### Lab 3 (Advanced): Build a grounded-and-verified Q&A pipeline

Implement the full pipeline from Advanced Concepts: retrieval over a small document set you provide, grounded generation with a citation instruction, a similarity pre-filter, and an LLM-as-judge entailment escalation for ambiguous claims. Test it against a mix of in-scope questions (answerable from your documents), out-of-scope questions (not covered by your documents, where the system should abstain), and a deliberately conflicting-context question (where your documents contain contradictory information). Deliverable: the working pipeline, a small benchmark set with expected outcomes, and a report on the pipeline's actual flag/abstention accuracy against your manually labeled expectations. Skills exercised: RAG integration, citation verification, abstention policy design, benchmark construction.

### Lab 4 (Production): Add monitoring and a risk-tiered policy

Extend Lab 3's pipeline with the monitoring instrumentation from the Monitoring section (flag rate, abstention rate, latency) and a risk-tiered policy layer that applies different verification depth based on a configurable risk tag on each incoming question. Deliverable: a small dashboard or structured log output showing flag/abstention rates by risk tier, plus a short design document explaining your tiering rationale. Skills exercised: production monitoring, risk-based system design, connecting this page's techniques to the Guardrails skill's enforcement layer.
`,

  "real-projects": `
### Project 1: Grounded internal knowledge-base assistant

Build a Q&A assistant over a real internal document set (company wiki, product docs, or a public equivalent for a portfolio project) that grounds every answer in retrieved source material, verifies claims against those sources, and has an explicit, tested abstention path for out-of-scope questions. Engineering requirements: a real retrieval index (not a toy in-memory list), a citation-verification stage with both a cheap pre-filter and an escalation path, a benchmark set of at least 30 questions spanning in-scope, out-of-scope, and false-premise cases, and a monitoring dashboard tracking flag rate and abstention rate over a period of test traffic.

### Project 2: Citation-integrity checker for AI-generated content

Build a standalone service that takes any block of AI-generated text containing citations (academic-style or web-link-style) and verifies each citation against a real, queryable source (a bibliographic API, or a curated known-sources set for a scoped version). Engineering requirements: robust citation extraction across at least two citation styles, a real verification backend (not a hardcoded set) with caching and timeouts, a clear flagged-versus-verified output format, and a test suite covering true positives (real citations correctly verified), true negatives (fabricated citations correctly flagged), and edge cases (malformed citation text).

### Project 3: Hallucination benchmark and dashboard for a chosen domain

Pick a domain (legal, medical, financial, or technical documentation) and build a labeled hallucination benchmark of at least 50 question/expected-answer pairs, including long-tail facts, false premises, and citation-heavy questions. Run at least two different models or two different mitigation configurations (e.g., grounded vs. ungrounded, with vs. without verification) against the benchmark and build a small dashboard comparing their hallucination rates. Engineering requirements: a documented labeling methodology, reproducible benchmark-running code, and a written analysis of where each configuration's failures concentrated, connecting findings back to this page's taxonomy (intrinsic vs. extrinsic, snowballing, false-premise handling).
`,

  "case-studies": `
- **Legal citation fabrication incidents**: multiple widely reported cases of legal filings containing AI-generated citations to nonexistent court cases, discovered only when opposing counsel or a judge attempted to look them up. Lesson: a fluent, correctly formatted citation is not evidence it exists — any workflow producing citations for a real document needs a verification step against an actual legal database before those citations are relied upon, and the professional and reputational cost of skipping this step can be severe.
- **Package/library hallucination in coding assistants**: coding assistants have been documented recommending or importing libraries and functions that do not exist, sometimes with plausible-sounding names resembling real packages. Lesson: grounding completions in the actual project's real dependencies and using compiler/static-analysis feedback as an external verification layer catches a category of hallucination that "just trust the suggestion" workflows do not.
- **Customer-support chatbot policy fabrication**: instances of support chatbots confidently stating incorrect refund or warranty policies not present in the actual company policy documents, leading to real customer-facing commitments the company had to honor or walk back. Lesson: constraining a support assistant to answer only from an approved, current knowledge base — with an explicit escalate-to-human path when the knowledge base does not cover a question — is not optional polish, it is the core defense against a direct business liability.
- **Search/answer-engine citation transparency as a market differentiator**: products that visibly cite and link to their retrieved sources for every claim have used that transparency as a core trust-building product feature, in explicit contrast to earlier chat products that provided answers with no visible sourcing at all. Lesson: making groundedness visible to the end user, not just internally verified, is itself a meaningful mitigation for the trust and blast-radius dimension of hallucination — a flagged-but-hidden verification result protects the system's internal metrics but does not protect the user who cannot see it.
`,

  comparisons: `
| Approach | What it actually mitigates | What it does not mitigate | When to use |
|----------|------------------------------|------------------------------|--------------|
| Prompting alone ("say I don't know") | Cases where the model has some internal signal of low confidence to act on | Stable, confidently wrong parametric knowledge with no internal uncertainty signal | Cheap first layer on every system; never sufficient alone for high-stakes use |
| Self-consistency sampling | Disagreement-detectable hallucination (unstable, varying wrong answers) | Consistently wrong answers that sample identically every time | High-stakes or ambiguous questions where the N-times cost is justified |
| Retrieval grounding (RAG) | Reliance on possibly-wrong parametric memory for knowledge-intensive questions | The model ignoring or misstating the retrieved context; wrong or stale source material | Any knowledge-intensive task where trustworthy answers matter — usually the highest-leverage first investment |
| Citation/entailment verification | Unfaithful generation relative to the given sources, after the fact | Errors in the source material itself; the judge model's own unreliability if unvalidated | Any system presenting sourced or cited claims to users or downstream systems |
| Structured output constraints | Hallucinated values outside a known-valid set (IDs, categories, enums) | Free-text factual claims not covered by a constrained schema | Any field where the valid answer space is genuinely bounded and enumerable |
| Fine-tuning on domain data | Calibration and accuracy improvements on the specific trained distribution | Out-of-distribution or long-tail questions the fine-tuning data did not cover | When a narrow, well-defined task has abundant labeled data and stable requirements |

### How seniors choose

Experienced engineers do not pick one technique — they layer several, matched to the specific hallucination category each targets, and explicitly size the investment to the risk of the use case. The default posture for anything user-facing and knowledge-intensive is retrieval grounding plus a verification pass plus a tested abstention path, with self-consistency and fine-tuning reserved for the specific narrower cases (ambiguous/unstable answers, and well-defined narrow domains, respectively) where they add clear marginal value over the default. The one thing seniors consistently avoid is treating any single technique, including a newer or larger model, as sufficient on its own.
`,

  "related-technologies": `
- **RAG** — the dominant grounding-based mitigation; this page covers why grounding helps and where it stops helping, the RAG skill covers the full retrieval-and-generation pipeline mechanics in depth.
- **Vector Search** — the retrieval mechanism underlying most RAG-based grounding; understanding similarity search and indexing is foundational to building the retrieval stage this page's mitigations depend on.
- **Structured Outputs** — constrains generation to a known-valid schema or value set, making certain hallucination categories (an invalid enum value, a malformed field) structurally impossible rather than merely less likely.
- **Guardrails** — owns the enforcement and abstention-policy layer that sits downstream of this page's detection and verification signals; this page produces the risk signal, Guardrails is where the "what do we do about it" policy is implemented.
- **Evaluation** — owns the systematic, ongoing measurement discipline (benchmarks, metrics, regression tracking) that this page's Testing and Monitoring sections apply specifically to hallucination rate.
- **Prompt Engineering** — the phrasing techniques (calibrated abstention prompts, positive framing, chain-of-thought for multi-step factual reasoning) that shape a model's baseline tendency toward hallucination before any external verification layer is added.
- **AI Red Teaming** — the adversarial discipline of deliberately probing a deployed system for false-premise vulnerability, citation fabrication, and long-tail factual gaps before real users or attackers find them.
- **LLM Fundamentals** — the foundational mechanics (next-token prediction, training objective, instruction-tuning) that this page's Internal Working section builds on to explain why hallucination is structural.
- **Fine-Tuning** — a genuine but narrower lever: improves calibration and accuracy on a specific trained distribution, without closing the gap for out-of-distribution or long-tail questions.
`,

  "latest-updates": `
As of this author's knowledge cutoff (early 2026), the field's emphasis has continued shifting from purely prompt-level fixes toward system-level, architecturally enforced mitigation: mandatory retrieval grounding, layered verification pipelines, and calibrated abstention are increasingly treated as standard production requirements for knowledge-intensive applications rather than optional add-ons. Research on internal-state-based uncertainty signals (such as semantic entropy across paraphrased generations, and various internal-activation-based probes) has continued to mature as a complement to purely black-box detection methods like self-consistency, though these remain active research areas rather than settled, universally deployed production tooling as of this writing.

Model providers have continued to report measurable hallucination-rate reductions on their published benchmarks release over release, particularly for reasoning-tuned models on tasks that benefit from explicit intermediate reasoning steps. However, providers and independent researchers alike have also continued to document that specific categories — most notably confident citation of nonexistent sources, and confident answers to false-premise or out-of-distribution questions — persist even in the strongest available systems, reinforcing this page's central honest-limits framing rather than contradicting it.

Given how quickly specific benchmark numbers, named techniques, and provider claims change, verify any specific hallucination-rate statistic or named research result you plan to cite in a production decision or a technical presentation against current, dated sources rather than relying on this page (or any single static reference) for a number precise enough to matter — treat the trend and the mechanisms described here as durable, and treat specific quantitative claims as needing a fresh check.
`,

  "future-roadmap": `
Hallucination is very unlikely to be "solved" in the sense of driven to zero for open-ended natural-language generation, because its root cause — a generative model producing the most probable continuation rather than a verified one — is intrinsic to the current dominant paradigm (large pretrained transformers trained via next-token prediction, then instruction-tuned). Betting career time on "the next model generation eliminates this" is not a well-supported bet based on the trajectory so far; betting on "the tooling and architecture for managing it systematically keeps maturing" is much better supported.

Where the field appears to be heading, and what is worth investing engineering time in: deeper integration of retrieval and tool-use directly into the generation loop (rather than as a separate pre-processing step) so that grounding becomes closer to a default behavior than an add-on; better, more efficient uncertainty-estimation techniques that make calibrated abstention cheaper and more reliable at scale; and increasingly standardized evaluation benchmarks and tooling (see the Evaluation skill) that make hallucination rate a routinely measured, comparable metric across systems the way latency and cost already are, rather than a qualitative impression.

The most durable, transferable skill from this page is not any single specific technique — it is the underlying judgment: knowing which hallucination category you are dealing with (stable vs. unstable, intrinsic vs. extrinsic, false-premise vs. long-tail), knowing which class of mitigation actually targets that category, and being honest with stakeholders about the residual risk that remains after every layer of mitigation is applied. That judgment does not go stale even as the specific benchmark numbers and named techniques continue to evolve.
`,

  "cheat-sheet": `
~~~text
HALLUCINATION -- ESSENTIALS

WHAT IT IS
- Fluent, confident LLM output that is factually wrong, unsupported by given
  context, or internally inconsistent -- indistinguishable in tone from a
  correct answer.
- Intrinsic: contradicts the given input/context directly.
- Extrinsic: unverifiable against the input, whether or not independently true.

WHY IT HAPPENS
- Next-token prediction training has no true/false label -- optimizes for
  plausible continuation, not verified fact.
- RLHF/instruction-tuning can bias toward confident answers over honest
  abstention if human raters rewarded confidence over hedged accuracy.
- Autoregressive generation has no built-in verification step.
- Snowballing: an early error becomes context for everything generated after it.

DETECTION TECHNIQUES
- Self-consistency: sample N times, compare answers. Low agreement = risk
  signal. Does NOT catch stably wrong answers (same wrong answer every time).
- Retrieval + citation verification: check each claim against retrieved
  sources via similarity pre-filter + LLM-as-judge entailment escalation.
- Uncertainty estimation: token-level log-probability, semantic entropy
  across paraphrases.

MITIGATION STRATEGIES
- RAG grounding: condition on real retrieved source text (highest-leverage
  first investment for knowledge-intensive tasks).
- Structured output constraints: restrict to a known-valid set (enum, real
  IDs) -- makes some hallucination categories structurally impossible.
- Fact-checking / verification pipelines: layered cheap-filter then
  expensive-judge escalation.
- "Say I don't know" prompting: works only when model has a real internal
  low-confidence signal to act on.
- Fine-tuning: improves calibration on the trained distribution only.

HONEST LIMITS
- No current technique eliminates hallucination -- all reduce rate/blast
  radius, none remove the structural gap.
- Self-consistency misses stable wrong answers.
- Grounding does not guarantee faithfulness to the source.
- Grounding in wrong/stale sources produces confidently "faithful" wrong
  answers.
- Verification pipelines are themselves model-based and can be fooled or
  wrong (validate judges against human-labeled ground truth).
- Calibration correlates confidence with correctness; it is not a guarantee.

PRODUCTION CHECKLIST (short form)
1. Ground factual answers in real retrieved sources.
2. Verify citations/claims programmatically, layered by cost.
3. Design and test a real abstention path.
4. Tier verification depth by risk/stakes.
5. Benchmark and monitor hallucination + abstention rate continuously.
6. Re-validate on every model/prompt version change.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| What is hallucination? | Fluent, confident LLM output that is factually wrong, unsupported, or inconsistent with the given context — indistinguishable in tone from a correct answer. |
| Intrinsic vs. extrinsic hallucination? | Intrinsic contradicts the given input directly; extrinsic makes an unverifiable claim relative to the input, true or not. |
| Why does next-token prediction cause hallucination? | The training objective rewards plausible continuations, not verified ones — there is no true/false label in standard pretraining. |
| What does self-consistency checking detect? | Disagreement across multiple samples of the same prompt — a signal of instability, not proof of error. |
| What does self-consistency checking miss? | A stably, confidently wrong answer generated identically every time — it shows perfect agreement despite being false. |
| Why doesn't RAG alone solve hallucination? | Retrieval gives real source material, but the model can still ignore or misstate it — faithfulness must be separately verified. |
| What is snowballing? | An early hallucinated claim becomes context for later tokens, compounding into a longer internally-consistent but wrong narrative. |
| What is a false-premise question? | A question assuming something untrue; without premise-checking, models often answer as if the premise were true. |
| What is semantic entropy? | A measure of how much meaning (not just wording) varies across paraphrased generations of the same question — high variance signals risk. |
| Why is "act as an expert" not a hallucination fix? | Persona prompts shift tone and confidence, not underlying factual accuracy — confident wording is not evidence of correctness. |
| What should verification depth depend on? | The real-world risk/cost of an undetected hallucination for that specific use case — tiered, not uniform. |
| Can hallucination be fully eliminated? | No — current techniques reduce frequency and blast radius; none remove the structural gap entirely. |
| What is the honest limit of grounding in retrieved sources? | If the sources themselves are wrong or stale, the answer can be faithful to the source and still factually wrong. |
| Why validate an LLM-as-judge verification component? | The judge model is itself a generative model and can produce unreliable verdicts if not checked against human-labeled ground truth. |
| What is the highest-leverage first mitigation investment for knowledge-intensive tasks? | Retrieval grounding (RAG), typically before adding heavier verification layers. |
`,

  mcqs: `
**1. Which best describes why next-token prediction training causes hallucination?**
A) The model is deliberately trained to lie in ambiguous cases
B) The training objective rewards plausible continuations, with no explicit true/false signal
C) Hallucination only occurs due to insufficient training data volume
D) It is caused exclusively by adversarial user prompts

Answer: B. The training objective optimizes for probability of the next token matching training text, not verified truth — this is the structural root cause covered in Internal Working.

**2. What does a low self-consistency agreement rate across sampled generations indicate?**
A) Proof that the answer is definitely wrong
B) A risk signal of instability, worth further investigation, but not proof
C) That the model has run out of context window
D) That retrieval grounding was not used

Answer: B. Self-consistency is a probabilistic risk signal, not a verdict — and it cannot detect stably, consistently wrong answers at all.

**3. Why is retrieval-augmented generation (RAG) not sufficient on its own to prevent hallucination?**
A) RAG cannot be combined with prompting techniques
B) RAG only works for coding tasks
C) The model can still ignore or misstate the retrieved context, and the retrieved sources themselves might be wrong
D) RAG increases the model's parameter count, which causes more hallucination

Answer: C. Grounding provides real source material but does not guarantee faithful use of it or the correctness of the source itself — a verification step is still needed.

**4. What is the key difference between intrinsic and extrinsic hallucination?**
A) Intrinsic hallucinations are always shorter than extrinsic ones
B) Intrinsic contradicts the given input directly; extrinsic makes an unverifiable claim relative to the input
C) Extrinsic hallucinations only occur in code generation tasks
D) There is no meaningful difference; the terms are interchangeable

Answer: B. This is the standard taxonomy distinction from the hallucination literature, covered in Beginner Concepts.

**5. Which statement about current hallucination-mitigation techniques is most accurate?**
A) A sufficiently large model eliminates hallucination entirely
B) Structured output constraints eliminate all forms of hallucination
C) Every current technique reduces frequency or blast radius but does not eliminate the underlying structural gap
D) Fine-tuning removes hallucination for all out-of-distribution questions

Answer: C. This is the central honest-limits framing of this page — no technique, alone or combined, currently drives hallucination to zero for open-ended generation.

**6. Why should an LLM-as-judge verification component itself be validated against human-labeled ground truth?**
A) It is a legal requirement in most jurisdictions
B) Judge models are themselves generative and can produce unreliable or hallucinated verdicts if unvalidated
C) Validation is only needed for the primary generation model, not the judge
D) It improves the judge model's inference speed

Answer: B. A verification layer built on an unvalidated judge model can itself be a source of undetected errors — treat it with the same rigor as the primary system.
`,

  "revision-notes": `
Hallucination is a language model producing fluent, confident output that is factually wrong, unsupported, or inconsistent with its given context — and the danger is precisely that nothing in its surface form distinguishes it from a correct answer. The root cause is structural: next-token prediction training optimizes for plausible continuations of training text, with no explicit true/false signal, and instruction-tuning/RLHF can further bias models toward confident answers over honest abstention. Autoregressive generation has no built-in verification step, and long generations can snowball an early error into a larger, internally consistent but wrong narrative.

Detection relies on external signals the base generation process does not provide on its own: self-consistency sampling flags disagreement across repeated generations (but misses stably wrong answers), retrieval-grounding-plus-citation-verification checks generated claims against real source material (via a cheap similarity pre-filter escalating ambiguous claims to a stricter LLM-as-judge entailment check), and uncertainty-estimation techniques (token-level probability, semantic entropy across paraphrases) give a probabilistic, not perfectly calibrated, risk signal.

Mitigation layers these signals into real system design: RAG grounding is usually the single highest-leverage investment for knowledge-intensive tasks, structured output constraints make certain hallucination categories (values outside a known-valid set) structurally impossible, calibrated "say I don't know" prompting works only when the model has a genuine internal low-confidence signal to act on, and fine-tuning improves calibration only on the specific distribution it was trained on. None of these, alone or combined, eliminate hallucination — production practice tiers verification depth by the real-world risk of an undetected error, tracks hallucination and abstention rate as ongoing metrics, and re-validates on every model or prompt change.

The honest limits matter as much as the techniques: self-consistency cannot catch stable wrong answers, grounding does not guarantee faithfulness or source correctness, and verification pipelines are themselves model-based components that need their own validation. This page connects directly to RAG (the dominant grounding mechanism), Guardrails (the enforcement and abstention-policy layer), Evaluation (the ongoing measurement discipline), Prompt Engineering (the framing techniques that shape baseline tendency), and AI Red Teaming (adversarially probing for the gaps that remain).

The single most transferable judgment from this page: know which hallucination category you are facing (stable vs. unstable, intrinsic vs. extrinsic, false-premise vs. long-tail), match the mitigation that actually targets that category, and be explicit with stakeholders that the residual risk is managed and monitored, never fully eliminated.
`,

  "learning-roadmap": `
**Week 1 — Foundations and recognition.** Read Overview through Prerequisites, and the LLM Fundamentals skill if you have not already. Do Hands-on Lab 1 (reproduce and categorize hallucination across question types). Milestone: you can confidently classify a given hallucinated example as intrinsic or extrinsic and explain why, in your own words, next-token prediction produces this behavior.

**Week 2 — Detection techniques.** Work through Beginner and Intermediate Concepts in depth. Implement the self-consistency flagger from Coding Questions Problem 1 and run Hands-on Lab 2. Milestone: a working self-consistency script with a written note on which of your test questions it correctly flagged versus missed, and why.

**Week 3 — Grounding and verification.** Study Advanced Concepts' full worked pipeline, and read the RAG skill in parallel for the retrieval mechanics this page assumes. Implement the citation-verification and claim-support scoring functions from Coding Questions Problems 2 and 3. Milestone: a working similarity-pre-filter-plus-judge verification pass over a small set of generated answers with known source material.

**Week 4 — Production system design.** Read Production Usage, Best Practices, Anti-Patterns, Security, and the Production Checklist. Complete Hands-on Lab 3, building the full grounded-and-verified pipeline end to end. Milestone: a working pipeline tested against in-scope, out-of-scope, and conflicting-context questions, with a written report on its actual accuracy against your manual expectations.

**Week 5 — Operating it in production.** Read Testing, Debugging, Monitoring, Deployment, Scalability, and Performance. Complete Hands-on Lab 4, adding monitoring and a risk-tiered policy layer. Milestone: a dashboard or structured log output showing flag/abstention rates by risk tier, and a short design document justifying your tiering choices.

**Week 6 — Interview readiness and honest framing.** Work through Interview Questions and FAQs, and be able to state — clearly and without hedging into vagueness — exactly what each mitigation technique does and does not solve. Next skill to study: **Guardrails**, to learn the full enforcement and abstention-policy layer that sits downstream of everything built in this roadmap.
`,

  "official-docs": `
- **OpenAI documentation on retrieval and factuality guidance** — official developer-facing guidance on grounding responses and reducing unsupported claims; verify the exact current URL and section names at the time you read this, as documentation structure changes over time.
- **Anthropic documentation on reducing hallucinations** — first-party guidance covering prompting techniques (citation requirements, explicit uncertainty framing) and retrieval-based grounding; check the current developer documentation for the latest recommended patterns.
- **Google/DeepMind model documentation on grounding and citations** — official guidance on citation-grounded generation features for their model family's API offerings; confirm current feature names and availability, as these evolve across releases.

Note on hedging: exact URLs, page titles, and feature names for official vendor documentation change frequently enough that this page will not guess at specific links — search each vendor's current developer documentation site directly for "hallucination," "grounding," or "citations" to find the live, current version.
`,

  books: `
- **"Speech and Language Processing" by Daniel Jurafsky and James H. Martin** — the standard NLP textbook; while not solely about hallucination, it provides the grounding in language modeling fundamentals needed to understand why generative models behave this way. Check for the most recent draft/edition, as it is continuously updated online by the authors.
- **"Natural Language Processing with Transformers" by Lewis Tunstall, Leandro von Werra, and Thomas Wunderlich** — practical, code-first coverage of transformer-based generation, useful for understanding the generation mechanics this page's Internal Working section builds on.
- **"Designing Machine Learning Systems" by Chip Huyen** — not hallucination-specific, but its chapters on monitoring, evaluation, and production ML system design directly inform how to operationalize the benchmarking and monitoring practices covered in this page's Testing and Monitoring sections.
- **"Building LLM Applications" (various current titles from major technical publishers, 2023-2025)** — several practical guides on RAG and LLM application architecture have emerged in this period covering grounding and verification patterns in applied depth; verify current editions and reviews before choosing one, as this is a fast-moving publishing category.

Honest note: there is not yet a single, canonical, widely-agreed "the hallucination book" the way there are canonical texts for older, more settled subfields — this remains an active research area better tracked through papers and current documentation than a single stable book reference.
`,

  blogs: `
- **Anthropic's engineering and research blog** — periodic posts on model behavior, honesty, and calibration research directly relevant to this topic; check current posts rather than relying on any single dated post remaining current.
- **OpenAI's research blog** — covers factuality and truthfulness research, including work related to TruthfulQA-style benchmarks and calibration.
- **Individual ML researcher blogs and Twitter/X threads from hallucination-benchmark and interpretability researchers** — often the fastest-moving source for new detection techniques (semantic entropy, internal-state probing) well before they appear in a textbook or even a widely cited paper; treat as high-signal but verify claims against the underlying paper before relying on them.
- **Engineering blogs from companies running production RAG/verification pipelines at scale** (search-and-answer products, legal-tech and enterprise-document-AI companies) — often publish concrete, numbers-backed writeups of their own hallucination-mitigation architecture and lessons learned, which are more directly production-relevant than academic surveys alone.

Honest note: specific blog URLs and authorship change too quickly to list precisely and reliably here — search each organization's current engineering/research blog directly for "hallucination," "factuality," or "faithfulness" to find current, relevant posts.
`,

  "research-papers": `
This is one of the more genuinely well-covered areas in the LLM research literature, so real papers exist across the full taxonomy this page covers:

- **"Survey of Hallucination in Natural Language Generation" (Ji et al., 2022-2023 survey literature)** — a foundational taxonomy paper distinguishing intrinsic and extrinsic hallucination across NLG tasks broadly, predating and framing much of the later chat-model-specific work.
- **"TruthfulQA: Measuring How Models Mimic Human Falsehoods" (Lin et al., 2021)** — a widely used benchmark paper specifically probing models for confidently stated false beliefs, foundational to how the field measures this problem quantitatively.
- **"SelfCheckGPT: Zero-Resource Black-Box Hallucination Detection for Generative Large Language Models" (Manakul et al., 2023)** — the self-consistency-based black-box detection approach covered in this page's Intermediate Concepts, in its original research form.
- **"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Lewis et al., 2020)** — the foundational RAG paper; essential background for understanding why grounding mitigates (without eliminating) hallucination, covered in full depth in the RAG skill.
- **Semantic entropy and uncertainty-estimation papers (various authors, 2023-2024)** — a growing body of work on using internal model signals and paraphrase-based entropy measures to estimate hallucination risk more robustly than surface-level token probability alone; search current literature for the latest specific titles, as this subfield is actively evolving.

Honest note: verify exact author lists, publication venues, and years for any paper you plan to cite precisely (in an interview, a technical document, or a citation of your own) against the actual paper or a reputable indexing service — do not rely on this page's summary as a substitute for reading the source.
`,

  videos: `
- **Conference talks from NeurIPS, ACL, and EMNLP on hallucination and factuality in NLG** — the primary academic venues where this topic is presented in technical depth; search each conference's publicly posted talk recordings for "hallucination" or "faithfulness" sessions from recent years.
- **Anthropic and OpenAI developer-conference talks on building reliable, grounded LLM applications** — first-party engineering talks that typically cover the practical grounding-and-verification patterns this page describes, often with concrete production numbers.
- **Independent ML educator channels covering RAG and hallucination mitigation** (search current, well-reviewed technical YouTube channels focused on applied LLM engineering) — useful for the practical, code-along version of the concepts on this page; verify the creator's technical credibility and recency before treating any specific video as authoritative.

Honest note: specific talk titles, speakers, and years are not listed precisely here because this content changes and is superseded quickly — search the relevant conference's or company's current video archive for the latest, most relevant material.
`,

  "github-repos": `
- **Retrieval-augmented generation reference implementations** (search current, actively maintained RAG framework repositories) — study these for how a mature project structures the retrieval-plus-generation pipeline this page's mitigations sit on top of.
- **SelfCheckGPT reference implementation** (associated with the original research paper) — a concrete, code-level reference for the self-consistency-based detection approach covered in this page.
- **TruthfulQA benchmark repository** (associated with the original research paper) — a real, usable benchmark dataset and evaluation harness for measuring a model's tendency toward confidently stated falsehoods, directly usable for the kind of benchmarking described in Testing.
- **Open-source LLM evaluation frameworks with hallucination-specific metrics** (search current, actively maintained evaluation-framework repositories) — several general-purpose LLM evaluation toolkits include hallucination/faithfulness scoring modules usable directly in the pipeline described in this page's Production Usage section.
- **Citation-verification and fact-checking pipeline examples** (search current open-source fact-checking or claim-verification repositories) — useful reference implementations for the citation and entailment-checking pattern covered in Advanced Concepts.
- **Guardrails-focused open-source frameworks** — several actively maintained projects specifically focused on output validation and constraint enforcement provide directly reusable components for the verification-and-policy layer described in Architecture.

Honest note: specific repository names, star counts, and maintenance status change quickly enough that this page intentionally describes categories rather than naming specific unverified repositories — search GitHub directly for the current, actively maintained, well-starred projects in each category before depending on one in production.
`,

  "practice-problems": `
Ordered by the skill focus each targets:

1. **Classification practice**: given 15 example model outputs (provided by an instructor, a study group, or self-generated), classify each as correct, intrinsic hallucination, extrinsic hallucination, or honest abstention. Focus: pattern recognition from Beginner Concepts.
2. **Self-consistency implementation**: implement and tune the self-consistency flagger from Coding Questions Problem 1 against a self-collected set of 20 factual questions, and manually verify which flagged answers were actually wrong. Focus: detection technique from Intermediate Concepts.
3. **Citation verification implementation**: implement and extend the citation-verification function from Coding Questions Problem 2 to handle at least two citation styles. Focus: verification pipeline mechanics from Advanced Concepts.
4. **Full pipeline build**: implement the complete grounded-and-verified pipeline from Advanced Concepts against a small document set of your choosing, and benchmark it against at least 20 labeled test questions. Focus: end-to-end system design from Architecture and Production Usage.
5. **Debugging scenarios**: given a set of described symptom scenarios (a model contradicting its given context, a citation that turns out to be fabricated, an answer that varies across repeated calls), diagnose the likely root cause and propose a fix using the Debugging section's escalation path. Focus: applied diagnostic reasoning.
6. **External benchmark practice**: run a subset of the TruthfulQA benchmark (see Research Papers and GitHub Repositories) against a model you have API access to, and manually review a sample of the results. Focus: connecting this page's concepts to a real, established, external evaluation standard.

External sets worth exploring: the TruthfulQA benchmark and dataset, and any current, actively maintained LLM evaluation framework's hallucination/faithfulness test suites (see GitHub Repositories) for a larger, pre-built practice corpus beyond what you construct yourself.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph Client["Client / Application"]
        UI["User-facing UI\n(shows citations, confidence, abstention state)"]
    end
    subgraph Retrieval["Retrieval layer"]
        Index["Vector index / knowledge base\n(see RAG, Vector Search skills)"]
        Retriever["Retriever\n(top-k relevant chunks)"]
    end
    subgraph Generation["Generation layer"]
        PromptBuilder["Grounded prompt builder\n(sources + citation instruction +\ncalibrated abstention framing)"]
        LLM["LLM"]
    end
    subgraph Verification["Verification layer"]
        SimFilter["Similarity pre-filter\n(cheap, per-claim)"]
        Judge["LLM-as-judge entailment check\n(escalation for ambiguous claims)"]
    end
    subgraph PolicyLayer["Policy & Guardrails layer"]
        Policy["Abstention / risk-tier policy\n(see Guardrails skill)"]
    end
    subgraph Ops["Ops"]
        Monitor["Monitoring: flag rate,\nabstention rate, latency"]
        Bench["Continuous benchmark\n(see Evaluation skill)"]
    end

    UI --> Retriever
    Retriever --> Index
    Retriever --> PromptBuilder
    PromptBuilder --> LLM
    LLM --> SimFilter
    SimFilter -->|ambiguous| Judge
    SimFilter -->|clear| Policy
    Judge --> Policy
    Policy --> UI
    Policy --> Monitor
    Monitor --> Bench
    Bench -.->|feedback: retune thresholds,\nre-benchmark on model change| PromptBuilder
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Hallucination))
    Why it happens
      Next-token prediction, no truth label
      RLHF bias toward confident answers
      No verification step in generation
      Snowballing across long generations
    Categories
      Intrinsic (contradicts input)
      Extrinsic (unverifiable claim)
      Stable vs unstable wrongness
      False-premise handling
    Detection
      Self-consistency sampling
      Retrieval grounding + citation check
      Similarity pre-filter
      LLM-as-judge entailment
      Uncertainty estimation
        Token-level probability
        Semantic entropy across paraphrases
    Mitigation
      RAG grounding
      Structured output constraints
      Fact-checking pipelines
      Calibrated abstention prompting
      Fine-tuning on domain data
    Production practice
      Risk-tiered verification depth
      Monitoring flag and abstention rate
      Benchmarking and re-validation
      Abstention UX design
    Honest limits
      Cannot be eliminated, only reduced
      Grounding does not guarantee faithfulness
      Verification pipelines can themselves be wrong
      Source-quality dependence
    Related skills
      RAG
      Vector Search
      Structured Outputs
      Guardrails
      Evaluation
      Prompt Engineering
      AI Red Teaming
      LLM Fundamentals
~~~
`,
};

export default hallucination;
