import type { SkillContent } from "../types";

const guardrails: SkillContent = {
  overview: `
Guardrails are the mechanisms — input filtering, output validation, and policy enforcement — that constrain an LLM-powered application's behavior to stay within safe, intended, and appropriate bounds, addressing the broader safety and reliability challenges beyond hallucination specifically (covered in the immediately preceding skill). Where hallucination mitigation focuses on factual accuracy, guardrails address the full spectrum of production safety concerns: preventing harmful, inappropriate, or off-topic content generation; blocking prompt injection and jailbreak attempts; enforcing output format and content policies; and providing a genuine last line of defense before an LLM's output reaches an end user or a downstream system.

This is the final skill in the platform's LLMs category, and it directly synthesizes the practical concerns from every earlier skill in this category — a production LLM application needs guardrails specifically because prompting (covered earlier) can be circumvented, fine-tuning (covered earlier) doesn't guarantee perfect behavior, and even a well-evaluated, hallucination-mitigated system (covered in the two immediately preceding skills) can still occasionally produce genuinely unsafe or inappropriate output that must be caught before it causes real harm. Guardrails directly connect to and set up the platform's later, more specialized **Prompt Injection Defense** and **AI Red Teaming** skills.

Key characteristics: **input guardrails**, filtering or flagging potentially malicious, off-topic, or policy-violating user input before it even reaches the model; **output guardrails**, validating, filtering, or blocking a model's generated response before it reaches the end user, checking for safety violations, format compliance, or policy adherence; **defense in depth**, layering multiple, independent guardrail mechanisms rather than relying on any single check, directly connecting to the **OWASP Top 10** skill's own security-layering principles; and **the fundamental tension between safety and usefulness**, a genuine, deliberate tradeoff requiring careful calibration rather than maximizing restriction universally.
`,

  history: `
| Year | Milestone |
|------|-----------|
| 2022 | As ChatGPT and similar conversational AI systems reach mainstream use, early, well-publicized incidents of users successfully "jailbreaking" models into producing harmful or policy-violating content directly motivate serious industry investment in guardrail systems |
| 2023 | **NVIDIA's NeMo Guardrails** and similar open-source frameworks are released, providing structured, reusable tooling specifically for building programmable guardrails around LLM applications |
| 2023 | **Content moderation APIs** (OpenAI's Moderation API, and similar) become standard, widely-adopted tools for automatically flagging potentially harmful content in both user input and model output |
| 2023 | Widespread, well-documented **prompt injection** attacks (directly connecting to the platform's later, dedicated **Prompt Injection Defense** skill) demonstrate that LLM applications face a genuinely new class of security vulnerability distinct from traditional injection attacks (SQL injection, XSS, covered in the **Security** category) |
| 2023–2024 | **Structured output validation** (covered generally in the **Prompt Engineering** skill) becomes explicitly incorporated into guardrail frameworks, ensuring generated output conforms to expected schemas before being trusted by downstream systems |
| 2024–2025 | **Guardrail frameworks mature significantly**, incorporating increasingly sophisticated combinations of rule-based filtering, classifier models, and LLM-based content evaluation, becoming standard, expected infrastructure for any production LLM application |

Guardrails' history reflects the industry's direct, practical response to LLM applications' genuinely new safety and security challenges — as these systems moved from research demos to mainstream, high-volume production use, the real, demonstrated risks of jailbreaking, harmful content generation, and prompt injection directly motivated the development of dedicated, purpose-built defensive tooling and practices.
`,

  "why-it-exists": `
Guardrails exist because an LLM's underlying safety training (whatever alignment was instilled via the RLHF/DPO techniques covered in the **Fine-Tuning** skill) is genuinely NOT a perfect, unbreakable guarantee — a sufficiently determined user can often find prompts ("jailbreaks") that circumvent a model's trained-in safety behavior, and even without any deliberate adversarial intent, a model can occasionally generate output that's off-topic, inappropriate, factually problematic, or fails to conform to an application's required format, simply as an ordinary consequence of its fundamentally probabilistic generation process (covered throughout this category).

Guardrails exist specifically to provide an ADDITIONAL, independent safety layer OUTSIDE the model's own internal behavior — checking and constraining both what goes INTO the model (input guardrails, catching malicious or off-topic requests before they're even processed) and what comes OUT of it (output guardrails, catching and blocking problematic generated content before it reaches an end user or a downstream system) — directly analogous to the **OWASP Top 10** skill's own defense-in-depth principle: never relying on a single point of protection, since any single mechanism (including the model's own trained-in alignment) can potentially fail or be circumvented.
`,

  "problem-it-solves": `
Guardrails solve the **"how do we constrain an LLM-powered application's behavior to stay reliably within safe, appropriate, and intended bounds, given that the model's own trained-in behavior alone isn't a perfect guarantee"** problem.

Concretely, they provide:

- **Input filtering**, catching malicious prompts (jailbreak attempts, prompt injection, directly connecting to the platform's later **Prompt Injection Defense** skill), off-topic requests, or policy-violating content before it's even processed by the model.
- **Output validation**, checking a model's generated response for safety violations, format compliance (directly connecting to the **Prompt Engineering** skill's own structured-output treatment), or policy adherence before it reaches an end user or downstream system.
- **Defense in depth**, layering multiple, independent checks (rule-based filters, classifier models, LLM-based evaluation) rather than relying on any single mechanism, directly reusing the **OWASP Top 10** skill's own security-layering principle.
- **A genuine last line of defense**, catching problems that survive despite the model's own trained-in alignment, prompt engineering safeguards, and hallucination mitigation — none of which, individually or even combined, provide an absolute guarantee.

What guardrails do **not** solve, or solve only partially: guardrails cannot make an LLM application PERFECTLY safe — a sufficiently sophisticated, adversarial attempt can sometimes still circumvent even well-designed guardrails, directly motivating the platform's later, dedicated **AI Red Teaming** skill's own adversarial-testing treatment; and overly aggressive, poorly-calibrated guardrails can genuinely degrade an application's usefulness (false-positive blocking of entirely legitimate requests), meaning guardrail design requires the same careful, deliberate calibration the **Hallucination** skill's own safety-versus-usefulness tension demands.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain input guardrails and output guardrails, and how they complement each other.
2. Explain defense-in-depth as applied to LLM application safety, directly connecting to the OWASP Top 10 skill.
3. Explain content moderation approaches (rule-based, classifier-based, LLM-based) and their respective tradeoffs.
4. Explain structured output validation as a specific, practical guardrail mechanism.
5. Recognize guardrail anti-patterns: relying on a single guardrail layer, overly aggressive filtering degrading usefulness, ignoring guardrail evaluation.
6. Compare guardrail implementation approaches and identify which fits a given application's risk profile.
7. Answer senior-level interview questions on guardrail architecture design and the safety-usefulness calibration tradeoff.
`,

  prerequisites: `
- **Required**: the **Hallucination** skill (covered immediately before this one) — guardrails address the broader safety concerns beyond factual accuracy specifically.
- **Required**: the **Prompt Engineering** and **Evaluation** skills — guardrail design and validation directly build on techniques covered there.
- **Very helpful**: the **OWASP Top 10** skill — guardrails directly apply general application-security defense-in-depth principles to LLM-specific concerns.

Dependency chain: **Hallucination** → this page (Guardrails), the final skill in this category, directly connecting to the platform's later **Prompt Injection Defense** and **AI Red Teaming** skills.
`,

  "beginner-concepts": `
### Input guardrails: filtering before the model even sees a request

~~~python
def input_guardrail(user_message):
    if contains_prohibited_content(user_message):
        return False, "This request cannot be processed."
    if is_off_topic(user_message):
        return False, "I can only help with product-related questions."
    return True, None
~~~

Input guardrails check a user's request BEFORE it's even sent to the model, catching obviously problematic or off-topic requests early, avoiding both wasted model computation and the risk of the model being manipulated by a malicious input.

### Output guardrails: validating before a response reaches the user

~~~python
def output_guardrail(model_response):
    if contains_unsafe_content(model_response):
        return False, "I cannot provide that information."
    if not matches_expected_format(model_response):
        return False, None  # trigger a retry
    return True, model_response
~~~

Output guardrails check a model's GENERATED response before it's delivered, catching problems that might have emerged during generation despite input filtering and the model's own trained-in alignment.

### A simple content moderation example

~~~python
moderation_result = moderation_api.check(user_message)
if moderation_result.flagged:
    return "This request violates our content policy."
~~~

Many LLM providers offer a dedicated content moderation API, specifically designed to flag potentially harmful categories of content (violence, self-harm, and others) in either input or output.

### Defense in depth: layering multiple checks

~~~
A single guardrail check is a single point of failure. Layering
MULTIPLE, independent checks (input filtering + the model's
own trained-in alignment + output validation + a final
content-moderation pass) directly reuses the OWASP Top 10
skill's own defense-in-depth principle -- if one layer misses
a problem, another layer has a genuine chance of catching it.
~~~
`,

  "intermediate-concepts": `
### Rule-based versus classifier-based versus LLM-based guardrails

~~~
Rule-based: simple, explicit pattern matching (keyword lists,
    regular expressions) -- fast, cheap, fully predictable, but
    genuinely brittle and easily circumvented by even simple
    rephrasing.
Classifier-based: a dedicated, smaller machine learning model
    (directly connecting to the Machine Learning skill's own
    classification treatment) trained specifically to detect
    a particular category of problematic content -- faster and
    cheaper than a full LLM call, reasonably robust to rephrasing.
LLM-based: using a capable LLM itself to evaluate whether
    content violates a policy -- most flexible and nuanced,
    but the SLOWEST and most expensive option, and itself
    subject to the same reliability limitations (directly
    connecting to the Hallucination skill) as any other LLM call.
~~~

### Structured output validation as a specific guardrail

~~~python
def validate_structured_output(response_text, expected_schema):
    try:
        parsed = json.loads(response_text)
        validate_against_schema(parsed, expected_schema)
        return True, parsed
    except (json.JSONDecodeError, SchemaValidationError):
        return False, None
~~~

Directly reusing the **Prompt Engineering** skill's own structured-output treatment, explicitly validating that generated output conforms to an expected schema BEFORE it's trusted by a downstream system is itself a genuine, essential guardrail — malformed or unexpected output reaching a downstream system untested can cause genuine application failures.

### Policy-specific guardrails for a given application domain

~~~
Different applications need DIFFERENT specific guardrail
policies -- a medical information assistant needs guardrails
specifically preventing it from providing definitive diagnoses
or treatment recommendations (directing users to consult a
genuine medical professional instead); a customer support
chatbot needs guardrails preventing it from making unauthorized
promises (refunds, discounts) beyond its actual authority.
~~~

### Balancing false positives and false negatives

~~~
A guardrail too AGGRESSIVE (low threshold for flagging content)
produces FALSE POSITIVES -- blocking legitimate, safe requests,
directly degrading usefulness. A guardrail too PERMISSIVE
(high threshold) produces FALSE NEGATIVES -- letting genuinely
problematic content through undetected. This is a genuine,
deliberate calibration tradeoff, directly analogous to the
Machine Learning skill's own precision/recall tradeoff
treatment, requiring careful tuning matched to the specific
application's actual risk tolerance.
~~~
`,

  "advanced-concepts": `
### NeMo Guardrails and programmable guardrail frameworks

~~~
Dedicated guardrail frameworks (NVIDIA's NeMo Guardrails, and
similar) let developers define explicit, structured RULES and
FLOWS constraining a conversational AI's behavior -- specifying
which topics are permitted, what specific actions require
additional confirmation, and how the system should respond to
detected policy violations -- providing a more STRUCTURED,
maintainable approach than scattered, ad-hoc guardrail
checks implemented inconsistently across an application's codebase.
~~~

### Guardrails for tool-use and agentic actions

~~~
Directly foreshadowing the platform's later AI Agents category
-- when an LLM-powered system can take genuine ACTIONS (calling
external APIs, executing code, modifying data) rather than
just generating text, guardrails must extend beyond content
filtering to ACTION-LEVEL constraints: which specific actions
an agent is permitted to take autonomously, which require
explicit human confirmation first, and what safeguards exist
against a compromised or hallucinating agent taking a
genuinely harmful, hard-to-reverse action.
~~~

### The genuine limits of guardrails against sophisticated adversarial attempts

~~~
Even well-designed, multi-layered guardrails can sometimes be
circumvented by sufficiently sophisticated, deliberately
adversarial prompts (directly connecting to the platform's
later Prompt Injection Defense and AI Red Teaming skills) --
guardrails significantly RAISE the difficulty and reduce the
FREQUENCY of successful circumvention, but genuinely
security-critical applications should never assume guardrails
alone provide an absolute, unconditional guarantee.
~~~

### Continuous guardrail evaluation and improvement

~~~
Directly reusing the Evaluation skill's own rigorous
methodology, a mature guardrail practice CONTINUOUSLY measures
both false-positive rate (legitimate requests incorrectly
blocked) and false-negative rate (problematic content that
slipped through), using real-world incidents and red-teaming
findings (covered in the platform's later AI Red Teaming
skill) to iteratively refine and strengthen guardrail rules
over time, rather than treating guardrail design as a
one-time, "set it and forget it" implementation task.
~~~
`,

  "internal-working": `
Tracing a request through a complete, layered guardrail system, illustrating exactly where input and output checks occur relative to the model itself:

~~~mermaid
sequenceDiagram
    participant User
    participant InputGuardrail as Input Guardrail\n(rule-based + classifier)
    participant Model as Language Model\n(trained-in alignment)
    participant OutputGuardrail as Output Guardrail\n(content check + format validation)
    participant Response as Final Response

    User->>InputGuardrail: user message
    InputGuardrail->>InputGuardrail: check for prohibited\ncontent, off-topic requests,\nprompt injection patterns
    alt Input flagged
        InputGuardrail->>User: request rejected,\nwith an explanation
    else Input passes
        InputGuardrail->>Model: forward to the model
        Model->>OutputGuardrail: generated response
        OutputGuardrail->>OutputGuardrail: check for safety\nviolations, format\ncompliance, policy adherence
        alt Output flagged
            OutputGuardrail->>Response: response blocked/\nmodified, or a fallback\nresponse substituted
        else Output passes
            OutputGuardrail->>Response: response delivered\nto the user
        end
    end
~~~

1. **The input guardrail checks the user's message BEFORE it ever reaches the model**, catching obviously problematic requests early and avoiding both wasted computation and potential model manipulation.
2. **If the input passes, the model generates a response**, relying on its own trained-in alignment (RLHF/DPO, covered in the **Fine-Tuning** skill) as one layer of protection, but not the ONLY layer.
3. **The output guardrail checks the generated response BEFORE it's delivered to the user**, catching problems that emerged during generation despite input filtering and the model's own alignment.

**Why this matters**: this concrete trace demonstrates DEFENSE IN DEPTH directly applied to LLM applications — multiple, INDEPENDENT layers (input filtering, model alignment, output validation) each provide a genuine chance to catch a problem the other layers might miss, rather than relying on any single mechanism to be perfectly, unconditionally reliable.
`,

  architecture: `
A senior AI engineer thinks about guardrail architecture in terms of layering multiple, independent defense mechanisms, calibrating guardrail strictness to the application's genuine risk profile, and treating guardrail evaluation as an ongoing, iterative practice rather than a one-time implementation.

### Layering multiple, independent guardrail mechanisms

~~~mermaid
flowchart TB
    Request["A request"] --> Layer1["Layer 1: Rule-based\nfiltering (fast, cheap)"]
    Layer1 --> Layer2["Layer 2: Classifier-based\ndetection (moderate cost)"]
    Layer2 --> Layer3["Layer 3: Model's own\ntrained-in alignment"]
    Layer3 --> Layer4["Layer 4: LLM-based or\nhuman review for\ngenuinely high-stakes cases"]
~~~

### Calibrating guardrail strictness to genuine risk profile

A senior practitioner explicitly considers the application's actual risk profile (a children's educational tool needs meaningfully stricter guardrails than an internal developer tool) when calibrating false-positive/false-negative tradeoffs, rather than applying one uniform strictness level universally regardless of context.

### Treating guardrail evaluation as an ongoing, iterative practice

~~~mermaid
flowchart LR
    RealWorldIncidents["Real-world incidents +\nred-teaming findings"] --> RefineGuardrails["Iteratively refine\nand strengthen\nguardrail rules"]
    RefineGuardrails --> ContinuousEval["Continuously evaluate\nfalse-positive/false-\nnegative rates\n(Evaluation skill)"]
    ContinuousEval --> RealWorldIncidents
`,

  "data-flow": `
Tracing a request through a guardrail system combined with content moderation and structured output validation, illustrating how multiple guardrail TYPES work together:

~~~mermaid
sequenceDiagram
    participant User
    participant Moderation as Moderation API\n(input check)
    participant Model as Language Model
    participant SchemaValidator as Structured Output\nValidator
    participant ContentCheck as Output Content\nModeration
    participant Response as Final Response

    User->>Moderation: user message
    Moderation->>Moderation: flag for prohibited\ncontent categories
    Moderation->>Model: (if not flagged) forward\nto model
    Model->>SchemaValidator: generated response\n(expected to be structured JSON)
    SchemaValidator->>SchemaValidator: validate against\nexpected schema
    SchemaValidator->>ContentCheck: (if valid) check content\nfor safety/policy issues
    ContentCheck->>Response: deliver validated,\ncontent-checked response
~~~

The critical detail: FORMAT validation (does the output conform to the expected structure) and CONTENT validation (does the output violate any safety/policy concerns) are genuinely DISTINCT checks, each catching a different class of problem — a response could be perfectly safe content-wise but fail to conform to a required JSON schema, or conform perfectly to the schema while containing genuinely unsafe content — both checks are needed, not either alone.
`,

  "production-usage": `
### A representative layered guardrail implementation (conceptual)

~~~python
def process_request_with_guardrails(user_message, model, moderation_api, schema):
    if moderation_api.check(user_message).flagged:
        return {"error": "Request violates content policy."}

    response = model.generate(user_message)

    if moderation_api.check(response).flagged:
        return {"error": "Unable to provide a response to this request."}

    try:
        validated = validate_schema(response, schema)
    except SchemaValidationError:
        return {"error": "Response format error, please retry."}

    return {"result": validated}
~~~

### Non-negotiables for production LLM applications

1. **Layer multiple, independent guardrail mechanisms**, never relying on the model's own trained-in alignment alone.
2. **Implement both input AND output guardrails**, since each catches genuinely different classes of problems.
3. **Validate structured output format explicitly**, directly reusing the **Prompt Engineering** skill's own treatment of this concern.
4. **Calibrate guardrail strictness to the application's genuine risk profile**, avoiding both under-protection and unnecessarily degraded usefulness.
5. **Continuously evaluate and refine guardrails**, directly reusing the **Evaluation** skill's own rigorous, ongoing measurement methodology.

### Common production patterns

- **Content moderation APIs** for both input and output, catching broad categories of harmful content.
- **Structured output schema validation** as a standard guardrail for any application requiring parseable, machine-readable output.
- **Programmable guardrail frameworks** (NeMo Guardrails, and similar) for structured, maintainable policy definition.
- **Human review escalation** for genuinely high-stakes or ambiguous cases that automated guardrails alone can't confidently resolve.
`,

  "industry-examples": `
- **NVIDIA's NeMo Guardrails**: a widely-adopted, open-source framework for defining programmable, structured guardrails around conversational AI applications.
- **OpenAI's Moderation API**: a widely-used content moderation service directly integrated into countless production LLM applications for both input and output filtering.
- **Guardrails AI**: an open-source library specifically focused on structured output validation and correction for LLM applications.
- **Major AI labs' own published safety and alignment practices**: extensive, publicly-documented guardrail and safety-testing methodologies applied to their own flagship products.
`,

  "best-practices": `
1. **Layer multiple, independent guardrail mechanisms**, directly reusing the **OWASP Top 10** skill's own defense-in-depth principle.
2. **Implement both input AND output guardrails**, since each catches genuinely different problem classes.
3. **Validate structured output format explicitly** before trusting it in a downstream system.
4. **Calibrate guardrail strictness to the application's genuine risk profile**, avoiding uniform strictness applied without context.
5. **Continuously evaluate false-positive and false-negative rates**, directly reusing the **Evaluation** skill's own methodology.
6. **Use a programmable guardrail framework** for structured, maintainable policy definition rather than scattered, ad-hoc checks.
7. **Extend guardrails to action-level constraints** for any system capable of taking genuine actions (tool use, agentic behavior), not just content filtering.
8. **Treat guardrail design as an ongoing, iterative practice**, refined based on real-world incidents and red-teaming findings.
`,

  "anti-patterns": `
### Relying on a single guardrail layer

~~~
# WRONG — trusting the model's own trained-in alignment
# (RLHF/DPO) alone, with no additional input/output validation
# layer, assuming this single mechanism is sufficient
# RIGHT — layer multiple, independent guardrail mechanisms,
# directly reusing the OWASP Top 10 skill's defense-in-depth principle
~~~

### Overly aggressive filtering degrading legitimate usefulness

~~~
# WRONG — an excessively strict guardrail flagging and
# blocking a substantial fraction of entirely legitimate,
# benign requests, frustrating users and eroding trust in
# the application
# RIGHT — calibrate guardrail strictness deliberately,
# balancing false-positive and false-negative rates matched
# to the application's genuine risk profile
~~~

### Not continuously evaluating guardrail effectiveness

~~~
# WRONG — implementing guardrails once at launch and never
# revisiting or measuring their actual false-positive/
# false-negative rates over time
# RIGHT — continuously evaluate and iteratively refine
# guardrails, directly reusing the Evaluation skill's own
# ongoing measurement methodology
~~~

### Other production-grade anti-patterns

- **Only implementing content-based guardrails for a system capable of taking genuine actions**, missing necessary action-level constraints for agentic behavior.
- **Not validating structured output format explicitly**, risking downstream system failures from malformed responses.
- **Assuming guardrails provide an absolute, unconditional safety guarantee**, rather than recognizing they significantly raise difficulty without eliminating all risk.
`,

  performance: `
### Rule zero: layering multiple guardrail checks is a deliberate, worthwhile latency/cost tradeoff for meaningfully improved safety

Each additional guardrail layer (rule-based, classifier, content moderation API call) adds some latency and cost, but this is a genuine, deliberate tradeoff for defense-in-depth's substantial safety benefit, directly analogous to the **OWASP Top 10** skill's own security-versus-performance tradeoff treatment.

### The performance hierarchy (apply in order)

1. **Use fast, cheap rule-based filtering first**, catching the most obvious violations before more expensive checks.
2. **Use classifier-based detection next**, providing more robust, rephrasing-resistant detection at moderate cost.
3. **Reserve LLM-based content evaluation for genuinely ambiguous or high-stakes cases**, given its higher latency/cost.
4. **Escalate to human review only for the most genuinely uncertain or high-stakes cases**, given its highest cost and latency.

### Micro-level facts worth knowing

- Rule-based guardrails are the fastest and cheapest but the most easily circumvented by even simple rephrasing, making them best suited as a first, coarse filtering layer rather than a sole defense.
- Content moderation API calls add real latency to a request pipeline, a genuine, deliberate tradeoff for the safety benefit they provide.
- Structured output validation failures should trigger a RETRY (regenerating the response) rather than simply failing the entire request outright, where practical, preserving usefulness while still enforcing format compliance.
`,

  scalability: `
A well-designed, layered guardrail architecture directly determines how confidently an organization can scale an LLM-powered application to a genuinely broad, diverse, and potentially adversarial user base.

### How layered guardrails enable confident scaling to broader, more adversarial usage

~~~mermaid
flowchart LR
    LayeredGuardrails["Multiple, independent\nguardrail layers"] --> ReducedRisk["Meaningfully reduced\nrisk of harmful/\ninappropriate output\nreaching users"]
    ReducedRisk --> ConfidentScaling["Confident scaling to a\nbroader, more diverse,\npotentially adversarial\nuser base"]
~~~

### Known ceilings and answers

| Bottleneck | Answer |
|------------|--------|
| A single guardrail layer being circumvented | Layer additional, independent guardrail mechanisms |
| Overly aggressive filtering degrading usefulness at scale | Calibrate strictness explicitly against measured false-positive rate |
| Guardrails not addressing action-level risk for agentic systems | Extend guardrails to explicit action-level constraints, not just content filtering |
| Guardrail effectiveness degrading over time as new circumvention techniques emerge | Continuous evaluation and iterative refinement, informed by red-teaming |
`,

  security: `
### Guardrails as a genuinely essential, foundational AI safety practice

~~~
Guardrails directly connect to and are a core component of
the platform's broader AI safety treatment -- they provide the
concrete, practical mechanism implementing an organization's
actual safety and content policies, directly setting up the
platform's later, dedicated Prompt Injection Defense and AI
Red Teaming skills' own more specialized treatment of
adversarial attacks against LLM systems specifically.
~~~

### Essential guardrail-related security practices

1. **Layer multiple, independent guardrail mechanisms**, directly reusing the **OWASP Top 10** skill's own defense-in-depth principle, since no single guardrail layer alone is unconditionally reliable.
2. **Extend guardrails to action-level constraints** for any system capable of taking genuine, consequential actions, not just text generation.
3. **Continuously red-team and evaluate guardrail effectiveness**, directly connecting to the platform's later **AI Red Teaming** skill's own adversarial testing treatment.
4. **Never assume guardrails alone provide an absolute, unconditional safety guarantee** for genuinely high-stakes applications.

See the **OWASP Top 10** skill for the broader application-security context this connects to, and the platform's later **Prompt Injection Defense** and **AI Red Teaming** skills for the dedicated, more specialized treatment of these concerns.
`,

  testing: `
### Testing guardrail effectiveness (true positive rate)

~~~python
def test_guardrail_blocks_known_harmful_content():
    known_harmful_examples = load_harmful_content_test_set()
    blocked_count = sum(1 for ex in known_harmful_examples if guardrail_check(ex).flagged)
    detection_rate = blocked_count / len(known_harmful_examples)
    assert detection_rate > ACCEPTABLE_DETECTION_THRESHOLD
~~~

### Testing for false positives (legitimate content incorrectly blocked)

~~~python
def test_guardrail_does_not_block_legitimate_content():
    known_legitimate_examples = load_legitimate_content_test_set()
    false_positive_count = sum(1 for ex in known_legitimate_examples if guardrail_check(ex).flagged)
    false_positive_rate = false_positive_count / len(known_legitimate_examples)
    assert false_positive_rate < ACCEPTABLE_FALSE_POSITIVE_THRESHOLD
~~~

### The senior testing doctrine

- Test guardrails against BOTH known-harmful and known-legitimate content explicitly, measuring both detection rate and false-positive rate.
- Test structured output validation against both well-formed and deliberately malformed responses.
- Periodically red-team guardrails with novel, creatively adversarial inputs, directly connecting to the platform's later **AI Red Teaming** skill.
- Test action-level guardrails explicitly for any system capable of taking genuine actions, not just content-filtering guardrails.
`,

  debugging: `
### The toolbox, in escalation order

1. **Check which specific guardrail layer flagged (or failed to flag) a given case first**, when investigating an unexpected block or an unexpected pass-through.
2. **Check false-positive rate on a representative legitimate-content sample** if users report excessive, frustrating blocking of benign requests.
3. **Check false-negative rate on a representative harmful-content sample** if a genuinely problematic output was observed to slip through undetected.
4. **Check for a new, previously-unseen circumvention technique** if a specific attack pattern repeatedly bypasses existing guardrails.

### Debugging common guardrail-related symptoms

- "Legitimate requests are being blocked too often" — measure false-positive rate explicitly; recalibrate guardrail strictness.
- "A harmful response got through despite guardrails" — investigate which specific layer(s) failed to catch it; consider adding an additional, complementary layer.
- "Structured output validation keeps failing" — check whether the prompt's format instructions are sufficiently clear, and whether retry logic is correctly implemented.
- "A specific attack pattern keeps circumventing guardrails" — this may indicate a genuinely new circumvention technique warranting dedicated investigation, directly connecting to the platform's later **Prompt Injection Defense** skill.
`,

  monitoring: `
### Key signals to track

- **Guardrail flag rate** (input and output, separately), a direct signal of how often guardrails are actually triggering.
- **False-positive rate on legitimate content**, directly measuring usefulness degradation from overly aggressive filtering.
- **User-reported incidents of inappropriate content reaching them**, a genuine, real-world signal complementing internal, automated measurement.
- **Structured output validation failure rate**, a direct signal of format-compliance reliability.

### Tools

Content moderation API dashboards (OpenAI's Moderation API, and similar); programmable guardrail framework monitoring (NeMo Guardrails, and similar); standard experiment tracking for comparing guardrail configuration effectiveness over time.

### Alerting priorities

Alert on a significant increase in guardrail flag rate (a potential signal of an emerging attack pattern or a genuine content-policy issue), and on user-reported incidents of inappropriate content reaching them despite guardrails, both warranting immediate investigation.
`,

  deployment: `
### A representative programmable guardrail configuration (conceptual, NeMo Guardrails-style)

~~~yaml
rails:
  input:
    flows:
      - check jailbreak attempt
      - check off-topic request
  output:
    flows:
      - check harmful content
      - check factual grounding
~~~

### CI/CD pipeline considerations

Treat guardrail rules and thresholds as genuine, version-controlled application configuration, with automated testing against both known-harmful and known-legitimate content sets as a deployment gate before any guardrail configuration change reaches production. See the platform's later **LLMOps** skill for the general deployment depth this connects to.
`,

  "production-checklist": `
Before a production LLM application's guardrails are considered adequate:

- [ ] Multiple, independent guardrail layers implemented, not relying on the model's own alignment alone
- [ ] Both input AND output guardrails implemented, each catching genuinely different problem classes
- [ ] Structured output format validation explicitly implemented for any application requiring parseable output
- [ ] Guardrail strictness calibrated to the application's genuine risk profile, with measured false-positive/false-negative rates
- [ ] Action-level guardrails implemented for any system capable of taking genuine, consequential actions
- [ ] Continuous evaluation of guardrail effectiveness in place, not a one-time implementation
- [ ] Human review escalation available for genuinely high-stakes or ambiguous cases
`,

  "common-mistakes": `
1. **Relying on a single guardrail layer** (typically the model's own trained-in alignment alone), rather than layering defense in depth.
2. **Overly aggressive filtering that degrades legitimate usefulness**, without measuring and calibrating actual false-positive rate.
3. **Not continuously evaluating guardrail effectiveness**, treating implementation as a one-time task.
4. **Only implementing content-based guardrails for a system capable of taking genuine actions**, missing necessary action-level constraints.
5. **Not validating structured output format explicitly**, risking downstream system failures from malformed responses.
6. **Assuming guardrails provide an absolute, unconditional safety guarantee** rather than a significant, but not perfect, risk reduction.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|-------|---------------|-----|
| Legitimate requests frequently blocked | Overly aggressive guardrail thresholds, uncalibrated false-positive rate | Measure and recalibrate strictness against a legitimate-content test set |
| Harmful content occasionally reaches users | A single guardrail layer failed with no complementary check | Add additional, independent guardrail layers (defense in depth) |
| Downstream system failures from malformed LLM output | Missing explicit structured output validation | Add schema validation with retry logic for non-compliant output |
| A specific attack pattern repeatedly bypasses guardrails | A genuinely new circumvention technique not covered by existing rules | Investigate and add specific detection; consider dedicated red-teaming |
| Agentic system takes an unauthorized, harmful action | Guardrails only cover content, not action-level constraints | Extend guardrails to explicit action-level permission checks |
| Guardrail effectiveness degrades over time | No ongoing evaluation/refinement practice | Implement continuous monitoring and periodic red-teaming |
`,

  faqs: `
**What are input guardrails versus output guardrails?**
Input guardrails filter or flag a user's request BEFORE it reaches the model, catching malicious or off-topic content early; output guardrails validate a model's generated response BEFORE it reaches the end user, catching problems that emerged during generation.

**Why is defense in depth important for LLM guardrails?**
Because no single guardrail mechanism (including the model's own trained-in alignment) is unconditionally reliable — layering multiple, independent checks means a problem missed by one layer has a genuine chance of being caught by another, directly reusing the OWASP Top 10 skill's own security principle.

**What's the difference between rule-based, classifier-based, and LLM-based guardrails?**
Rule-based guardrails use simple, explicit pattern matching (fast, cheap, but easily circumvented); classifier-based guardrails use a dedicated, smaller ML model (more robust, moderate cost); LLM-based guardrails use a capable LLM to evaluate content (most flexible/nuanced, but slowest and most expensive).

**Why can overly aggressive guardrails be a genuine problem, not just an inconvenience?**
Because excessive false-positive blocking of entirely legitimate requests directly degrades an application's usefulness and user trust, a genuine cost that must be deliberately balanced against the safety benefit of stricter filtering — guardrail calibration is a real, deliberate tradeoff, not a "more restriction is always better" decision.

**Do guardrails provide an absolute safety guarantee?**
No — guardrails significantly raise the difficulty and reduce the frequency of harmful or inappropriate output reaching users, but a sufficiently sophisticated, adversarial attempt can sometimes still circumvent even well-designed guardrails, directly motivating ongoing red-teaming and continuous guardrail refinement.

**How do guardrails need to change for an agentic system that can take genuine actions?**
Guardrails must extend beyond content filtering to ACTION-LEVEL constraints — explicitly defining which actions an agent can take autonomously versus which require human confirmation first, directly foreshadowing the platform's later AI Agents category's own treatment of this concern.
`,

  "interview-questions": `
### Junior level

1. **What is a guardrail in the context of LLM applications?**
   Model answer: a mechanism (input filtering, output validation, or policy enforcement) that constrains an LLM application's behavior to stay within safe, intended bounds.

2. **What's the difference between an input guardrail and an output guardrail?**
   Model answer: input guardrails check a request before it reaches the model; output guardrails check the model's generated response before it reaches the user.

3. **Why is defense in depth important for guardrail design?**
   Model answer: no single guardrail mechanism is unconditionally reliable, so layering multiple, independent checks increases the chance of catching a problem that any single layer might miss.

4. **What is a content moderation API?**
   Model answer: a service that automatically flags potentially harmful categories of content in either user input or model output.

### Senior level

5. **Explain why relying solely on a model's own trained-in alignment (from RLHF/DPO) is insufficient as a production application's only safety mechanism.**
   Model answer: RLHF/DPO-based alignment (covered in the **Fine-Tuning** skill) trains a model's GENERAL tendency to behave helpfully and safely across a broad range of inputs, but this training is not a perfect, unconditional guarantee — it's a statistical tendency learned from a finite set of human preference examples, and a sufficiently determined, adversarial user can often discover specific prompts ("jailbreaks") that fall outside the distribution the alignment training genuinely covered, circumventing the model's typical safe behavior; additionally, even without any deliberate adversarial intent, a model can occasionally generate problematic output simply as an ordinary consequence of its fundamentally probabilistic generation process; relying solely on this single mechanism means ANY circumvention, whether deliberate or incidental, has no additional safety net catching it before reaching a real user or downstream system — directly analogous to the **OWASP Top 10** skill's own defense-in-depth principle, a genuinely robust production system needs INDEPENDENT input and output guardrail layers specifically because the model's own alignment, while genuinely valuable, cannot be assumed to be the ONLY necessary safety mechanism.

6. **A team's customer support chatbot guardrails are blocking approximately 15% of legitimate customer questions, causing significant user frustration, while a recent incident review also found the same guardrails missed a genuinely inappropriate response that reached a customer. Diagnose this situation and propose a fix.**
   Model answer: this describes a genuinely poorly-calibrated guardrail system exhibiting BOTH excessive false positives (15% of legitimate questions blocked) AND a false negative (a genuinely inappropriate response that slipped through) simultaneously — this specific combination suggests the guardrail's underlying detection mechanism (whether rule-based, classifier-based, or LLM-based) may be fundamentally mismatched to the actual content patterns this application encounters, rather than simply being set at "too strict" or "too lenient" on a single dimension; the fix requires a genuinely data-driven recalibration: first, collect and analyze the SPECIFIC legitimate questions being incorrectly blocked, looking for a common pattern (e.g., certain keywords or phrasings triggering an overly broad rule) that could be more precisely targeted rather than broadly restricted; second, analyze the specific missed inappropriate response to understand exactly why it wasn't caught, and add a complementary, INDEPENDENT guardrail layer (defense in depth) specifically addressing this gap, rather than simply tightening the existing mechanism further (which risks worsening the false-positive problem instead); this combination of false positives and false negatives together is a strong signal that the CURRENT guardrail approach needs a genuinely more sophisticated, better-calibrated mechanism (potentially combining rule-based, classifier-based, and LLM-based layers, each catching different specific patterns) rather than simply adjusting a single threshold in either direction.

7. **Explain the specific guardrail considerations that change when moving from a pure text-generation chatbot to an agentic system capable of executing real actions (e.g., processing refunds, modifying account settings).**
   Model answer: for a pure text-generation chatbot, guardrails are fundamentally about CONTENT — ensuring the generated TEXT itself doesn't violate safety or policy concerns, since the ultimate "harm" from a guardrail failure is limited to inappropriate or incorrect information being displayed to a user; for an agentic system capable of taking genuine ACTIONS, guardrails must additionally address ACTION-LEVEL risk — a hallucinating or manipulated agent that decides to "process a refund" or "modify an account setting" based on an incorrect or adversarially-induced conclusion can cause GENUINE, potentially hard-to-reverse real-world harm, well beyond what a purely textual response could cause; this requires explicit ACTION-LEVEL guardrails — defining which specific actions an agent is permitted to take fully autonomously (e.g., low-risk, easily-reversible actions) versus which specific actions genuinely require explicit human confirmation before execution (e.g., high-value refunds, account-security-relevant changes), directly foreshadowing the platform's later AI Agents category's own treatment of autonomy levels and human-in-the-loop patterns — content guardrails alone, however well-designed, are structurally insufficient for this genuinely expanded risk surface.

8. **Compare rule-based, classifier-based, and LLM-based guardrail approaches, and design a layered strategy combining all three for a content moderation pipeline.**
   Model answer: rule-based guardrails (explicit keyword/pattern matching) are extremely fast and cheap but genuinely brittle — easily circumvented by simple rephrasing, misspellings, or synonym substitution, making them best suited as a FIRST, coarse filtering pass catching only the most obvious, unambiguous violations; classifier-based guardrails (a dedicated, smaller trained model specifically for detecting a content category) are meaningfully more robust to rephrasing than pure rule-matching, at a moderate computational cost, making them well-suited as a SECOND layer catching more subtly-phrased violations the rule-based layer missed; LLM-based guardrails (using a capable LLM to evaluate content against a nuanced policy description) are the most flexible and contextually nuanced, capable of catching genuinely subtle or context-dependent policy violations that neither simpler approach could reliably detect, but at the HIGHEST latency and cost, making them best reserved as a THIRD, more selective layer — perhaps only invoked for content that the first two layers flag as borderline/uncertain (rather than running on every single request), balancing thoroughness against the genuine cost of running an LLM call on every piece of content; this specific ordering (cheap/fast rule-based first, moderate-cost classifier second, expensive/nuanced LLM-based reserved for uncertain cases) reflects a deliberate COST-EFFICIENT layering strategy, applying the most expensive, thorough check only where the cheaper layers' own uncertainty genuinely warrants it.

9. **Explain the genuine tension between guardrail strictness and application usefulness, and describe how you would determine the "right" calibration for a specific new application.**
   Model answer: guardrail strictness and application usefulness exist in a genuine, deliberate tradeoff — an EXCESSIVELY strict guardrail configuration minimizes false negatives (harmful content slipping through) but at the direct cost of increased false positives (legitimate, benign requests incorrectly blocked), directly degrading user experience, trust, and the application's actual practical value; conversely, an excessively PERMISSIVE configuration preserves usefulness but at genuine, increased safety risk; there is NO universal "correct" calibration point — the right balance depends entirely on the SPECIFIC application's actual risk profile and consequences of each error type: an application serving children, or operating in a genuinely high-stakes domain (medical, legal, financial), should reasonably accept a HIGHER false-positive rate (more legitimate requests occasionally blocked or flagged for review) in exchange for a correspondingly LOWER false-negative rate, given the more severe consequences of a safety failure in that context; an internal developer tool or a genuinely low-stakes creative-writing assistant can reasonably accept a HIGHER false-negative tolerance in exchange for meaningfully preserved usefulness and reduced friction; to determine the specific calibration for a new application, I would explicitly quantify (even if only qualitatively/directionally) the actual real-world COST of each error type for THIS specific application and its specific user base, then tune guardrail thresholds empirically against representative test sets (directly reusing the **Evaluation** skill's own methodology) to achieve a deliberately-chosen, justified balance point — rather than defaulting to either a maximally-strict or maximally-permissive configuration without this genuine, application-specific analysis.

10. **Design a guardrail architecture for a public-facing AI writing assistant that must prevent generating clearly harmful content (e.g., detailed instructions for creating weapons) while still supporting genuinely legitimate creative writing (e.g., a novelist writing a thriller involving a weapon).**
    Model answer: this is a genuinely challenging, context-dependent calibration problem, since the SAME surface-level content (detailed technical information) could be either a clear policy violation (a genuine, actionable how-to guide) or entirely legitimate creative content (fictional narrative context) depending on GENUINE CONTEXT and intent, which simple rule-based or even classifier-based approaches often struggle to distinguish reliably; design a layered approach where rule-based/classifier-based guardrails handle the CLEAREST, least-ambiguous cases (unambiguous requests for actionable harmful instructions with no genuine creative framing at all) as a fast, cheap first pass; for content flagged as BORDERLINE or genuinely ambiguous by these faster layers, escalate to an LLM-based guardrail SPECIFICALLY prompted to consider genuine creative/narrative CONTEXT (e.g., "is this request part of a clearly fictional narrative, or does it read as a genuine, actionable request for harmful information regardless of any fictional framing?") rather than judging the surface content alone; additionally, consider OUTPUT-level guardrails checking whether the GENERATED response itself crosses from legitimate narrative description into genuinely actionable, specific technical detail (a narrative can reference "the character built a weapon" without the RESPONSE itself needing to provide step-by-step, real-world-usable technical instructions) — this distinction between narratively APPROPRIATE reference and technically ACTIONABLE detail is a genuinely useful, practical guardrail principle for this specific creative-writing-versus-harm-instruction tension; finally, given this is a genuinely hard, context-dependent calibration problem, plan for ONGOING refinement based on real user feedback and red-teaming findings (directly connecting to the platform's later **AI Red Teaming** skill) rather than expecting to get this exact calibration perfectly right from initial launch alone.
`,

  "coding-questions": `
### 1. Implement a simple layered input guardrail

~~~python
def input_guardrail(user_message, prohibited_patterns, classifier):
    for pattern in prohibited_patterns:
        if pattern in user_message.lower():
            return False, "rule_based_block"
    classification = classifier.predict(user_message)
    if classification == "prohibited":
        return False, "classifier_block"
    return True, None
# Follow-up: why is it valuable to return WHICH specific layer
# blocked a request (rather than just a simple True/False),
# from the perspective of ongoing guardrail monitoring and improvement?
~~~

### 2. Implement a structured output validator with retry logic

~~~python
def generate_with_validated_output(model, prompt, schema, max_retries=2):
    for attempt in range(max_retries + 1):
        response = model.generate(prompt)
        try:
            return validate_against_schema(json.loads(response), schema)
        except (json.JSONDecodeError, SchemaValidationError):
            if attempt < max_retries:
                prompt = f"{prompt}\\n\\nYour previous response did not match the required format. Please respond with ONLY valid JSON matching the schema."
            else:
                raise
# Follow-up: how does this pattern directly connect to and
# reuse the retry-on-parsing-failure approach covered in the
# Prompt Engineering skill?
~~~

### 3. Implement a false-positive/false-negative rate calculator for guardrail evaluation

~~~python
def evaluate_guardrail(guardrail_fn, harmful_test_set, legitimate_test_set):
    true_positives = sum(1 for ex in harmful_test_set if guardrail_fn(ex).flagged)
    false_negatives = len(harmful_test_set) - true_positives
    false_positives = sum(1 for ex in legitimate_test_set if guardrail_fn(ex).flagged)

    detection_rate = true_positives / len(harmful_test_set)
    false_positive_rate = false_positives / len(legitimate_test_set)
    return {"detection_rate": detection_rate, "false_positive_rate": false_positive_rate}
# Follow-up: if you could only improve ONE of these two rates
# for a children's educational application, which would you
# prioritize, and why, connecting your answer to this page's
# own treatment of risk-profile-based calibration?
~~~
`,

  "hands-on-labs": `
### Lab 1 (Beginner): Implement basic input and output guardrails
Build a simple rule-based input guardrail and a content-moderation-API-based output guardrail for a sample chatbot application, and test them against a range of legitimate and problematic inputs. Deliverable: a working, tested guardrail implementation. Skills exercised: basic guardrail implementation.

### Lab 2 (Intermediate): Measure and calibrate false-positive/false-negative rates
Given a guardrail implementation and representative harmful/legitimate test sets, measure detection rate and false-positive rate, then adjust thresholds to achieve a deliberately-chosen calibration point. Deliverable: a documented calibration analysis. Skills exercised: applied guardrail calibration.

### Lab 3 (Advanced): Build a layered, defense-in-depth guardrail pipeline
Implement rule-based, classifier-based, and LLM-based guardrail layers combined into a single pipeline, and measure the resulting combined detection rate compared to any single layer alone. Deliverable: a documented layered-defense effectiveness comparison. Skills exercised: applied defense-in-depth guardrail architecture.

### Lab 4 (Production): Implement action-level guardrails for a simulated agentic system
Given a simulated agent capable of taking several distinct actions (some low-risk, some high-risk), implement action-level permission guardrails requiring explicit confirmation for high-risk actions, and test the resulting behavior. Deliverable: a working, tested action-level guardrail implementation. Skills exercised: applied action-level guardrail design.
`,

  "real-projects": `
### 1. A layered, defense-in-depth content moderation pipeline
Engineering requirements: rule-based, classifier-based, and LLM-based guardrail layers combined, with continuously measured and calibrated false-positive/false-negative rates.

### 2. A structured-output-validated API integration layer
Engineering requirements: explicit schema validation with retry logic for any LLM-generated output feeding a downstream system, directly connecting to the Prompt Engineering skill's own treatment.

### 3. An action-level guardrail system for an agentic application
Engineering requirements: explicit permission tiers for autonomous versus human-confirmation-required actions, directly foreshadowing the platform's AI Agents category.
`,

  "case-studies": `
### Early, well-publicized jailbreak incidents directly motivating guardrail investment
Widely-reported early incidents of users successfully "jailbreaking" conversational AI systems into producing policy-violating content directly and rapidly motivated serious, dedicated industry investment in guardrail systems and frameworks — a clear, direct example of real-world incidents driving concrete engineering practice and tooling investment. Lesson: sometimes the clearest, most effective motivation for investing in a defensive engineering practice is direct, concrete, publicly-documented evidence of the failure mode it's meant to address, rather than purely theoretical risk analysis alone.

### NeMo Guardrails' structured, programmable approach as a response to ad-hoc guardrail implementation
NVIDIA's NeMo Guardrails framework directly addressed the genuine problem of guardrail logic being implemented ad-hoc, inconsistently, and often un-maintainably scattered across an application's codebase, by providing a structured, declarative way to define conversational flows and policy rules — directly improving guardrail maintainability and consistency compared to informal, scattered implementation. Lesson: as a genuinely important engineering practice (guardrails) matures from an ad-hoc afterthought into standard, expected infrastructure, dedicated, structured tooling frameworks often emerge specifically to make that practice more maintainable, consistent, and reliable, rather than every team reinventing it independently and inconsistently.

### The recurring lesson that guardrail calibration requires genuine, application-specific judgment
Many organizations deploying guardrails have independently discovered, through real user feedback and incident review, that neither "maximally strict" nor "maximally permissive" is a genuinely correct universal default — the right calibration is deeply application-specific, depending on actual risk profile and user base, a lesson that keeps recurring across genuinely different organizations and applications. Lesson: some engineering decisions (like guardrail calibration) fundamentally resist a universal "best practice" answer and instead require genuine, deliberate, context-specific judgment — recognizing this is itself an important, mature engineering insight, rather than searching for a single correct universal threshold that doesn't actually exist.
`,

  comparisons: `
| Aspect | Rule-Based Guardrails | Classifier-Based Guardrails | LLM-Based Guardrails |
|--------|----------------------------|-----------------------------------|----------------------------|
| Speed/cost | Fastest, cheapest | Moderate | Slowest, most expensive |
| Robustness to rephrasing | Low — easily circumvented | Moderate | Highest — most contextually nuanced |
| Best fit | First-pass, obvious violations | Second-layer, more robust detection | Ambiguous/borderline cases requiring nuance |

| Aspect | Input Guardrails | Output Guardrails |
|--------|------------------------|--------------------------|
| Timing | Before the model processes the request | After the model generates a response |
| Catches | Malicious/off-topic requests, prompt injection attempts | Problems emerging during generation despite input filtering |
| Both needed? | Yes — each catches genuinely different problem classes | Yes |

**How seniors choose**: layer rule-based (fast, first-pass), classifier-based (robust, second-layer), and LLM-based (nuanced, reserved for ambiguous cases) guardrails together; always implement both input AND output guardrails; calibrate strictness explicitly to the application's genuine risk profile, never applying a universal default without deliberate analysis.
`,

  "related-technologies": `
- **Hallucination** — the immediately preceding skill, covering factual-accuracy-specific mitigation that guardrails complement with broader safety concerns.
- **Prompt Engineering** — structured output validation directly reuses techniques covered there.
- **Evaluation** — the rigorous measurement methodology guardrail effectiveness assessment directly builds on.
- **OWASP Top 10** — the general application-security defense-in-depth principles guardrails directly apply to LLM-specific concerns.
- **Prompt Injection Defense**, **AI Red Teaming** (platform's later category) — the dedicated, more specialized treatment of adversarial attacks against LLM systems this page directly connects to and sets up.

Learning path: **Hallucination** → this page (Guardrails), completing this category, directly connecting to the platform's later **Prompt Injection Defense** and **AI Red Teaming** skills.
`,

  "latest-updates": `
Knowledge cutoff for this page: January 2026. As of that cutoff:

- Programmable guardrail frameworks (NeMo Guardrails, and similar) continue maturing as standard, expected infrastructure for production LLM applications.
- Continued industry emphasis on action-level guardrails specifically for agentic systems, directly connecting to the growing AI Agents ecosystem.
- Growing standardization of continuous guardrail evaluation and red-teaming as expected, ongoing engineering practice, rather than a one-time implementation task.
- Given continued evolution in this space, verify current best-practice guardrail frameworks and content moderation tooling against up-to-date documentation.
`,

  "future-roadmap": `
Where guardrail technology is heading, and what's worth betting career time on:

- **Continued maturity of programmable, structured guardrail frameworks** as standard, expected infrastructure rather than ad-hoc implementation.
- **Continued growth of action-level guardrails** specifically for increasingly autonomous, agentic AI systems.
- **Continued standardization of continuous, red-teaming-informed guardrail evaluation** as ongoing, expected engineering practice.
- **What to bet on**: deeply understanding defense-in-depth principles, the genuine safety-usefulness calibration tradeoff, and the distinct roles of input versus output guardrails — these foundational architectural concepts transfer directly to any current or future guardrail framework/tooling, a far more durable investment than familiarity with any single current tool's specific configuration syntax.
`,

  "cheat-sheet": `
~~~
# ---- Why guardrails exist ----
Model's own trained-in alignment (RLHF/DPO) is NOT a perfect
    guarantee -- jailbreaks and ordinary generation quirks
    can still produce unsafe/inappropriate output.
~~~

~~~
# ---- Input vs output guardrails ----
Input:  filter BEFORE the model sees the request
    (malicious/off-topic/injection attempts)
Output: validate BEFORE the response reaches the user
    (safety violations, format compliance, policy adherence)
BOTH needed -- each catches DIFFERENT problem classes.
~~~

~~~
# ---- Defense in depth (directly from OWASP Top 10) ----
Never rely on ONE layer. Layer:
rule-based (fast/cheap) -> classifier-based (robust) ->
    model's own alignment -> LLM-based/human review (nuanced,
    reserved for ambiguous/high-stakes cases)
~~~

~~~
# ---- Rule-based vs classifier vs LLM-based ----
Rule-based:  fastest, cheapest, easily circumvented
Classifier:  moderate cost, more robust to rephrasing
LLM-based:   slowest/priciest, most nuanced/contextual
~~~

~~~
# ---- Structured output validation ----
Validate schema BEFORE trusting output downstream.
Failure -> RETRY with a corrective prompt, don't just fail outright.
~~~

~~~
# ---- The calibration tradeoff ----
Too strict -> false positives -> blocks legitimate requests,
    degrades usefulness
Too permissive -> false negatives -> harmful content slips through
Calibrate to the APPLICATION'S genuine risk profile -- no
    universal "correct" threshold exists.
~~~

~~~
# ---- Agentic systems need MORE than content guardrails ----
Action-level constraints: which actions are autonomous vs
    require human confirmation first (foreshadows AI Agents).
~~~

~~~
# ---- Guardrails are NOT an absolute guarantee ----
They raise difficulty/reduce frequency of failures --
    continuous evaluation + red-teaming required, ongoing.
~~~
`,

  "flash-cards": `
| Question | Answer |
|----------|--------|
| Why aren't guardrails redundant given RLHF alignment? | Alignment isn't a perfect guarantee — jailbreaks and generation quirks still occur. |
| Input vs output guardrails? | Input: filter before the model. Output: validate before reaching the user. |
| What is defense in depth for guardrails? | Layer multiple independent checks — no single layer is fully reliable. |
| Rule-based vs classifier vs LLM-based guardrails? | Fast/cheap/brittle -> robust/moderate cost -> nuanced/slow/expensive. |
| Structured output validation failure — what to do? | Retry with a corrective prompt, don't just fail outright. |
| What is a false positive in guardrails? | Legitimate content incorrectly blocked — degrades usefulness. |
| What is a false negative in guardrails? | Harmful content that slips through undetected. |
| Is there one universal "correct" guardrail strictness? | No — calibrate to the specific application's genuine risk profile. |
| What do agentic systems need beyond content guardrails? | Action-level constraints — autonomous vs human-confirmation-required actions. |
| Do guardrails provide an absolute safety guarantee? | No — they reduce risk significantly but require ongoing evaluation/red-teaming. |
`,

  mcqs: `
1. Why are guardrails needed even though a model has RLHF-based safety alignment?
   A) RLHF doesn't actually exist  B) Alignment is a statistical tendency, not a perfect guarantee — jailbreaks and ordinary generation quirks can still produce unsafe output  C) Guardrails replace the need for any alignment training  D) Guardrails are only needed for very old models
   **Answer: B** — a genuine, additional independent safety layer beyond the model's own trained behavior.

2. What is the key difference between input and output guardrails?
   A) They are identical  B) Input guardrails filter before the model processes a request; output guardrails validate the response before it reaches the user  C) Only one is ever needed  D) Output guardrails run before the model, input guardrails run after
   **Answer: B** — each catches genuinely different classes of problems.

3. Why does defense in depth matter for guardrail architecture?
   A) It doesn't — one strong layer is always sufficient  B) No single guardrail mechanism is unconditionally reliable, so multiple independent layers increase the chance of catching a missed problem  C) It only applies to network security  D) It makes guardrails slower with no benefit
   **Answer: B** — directly reusing the OWASP Top 10 skill's own security principle.

4. What is a false positive in the context of guardrails?
   A) Harmful content that slips through undetected  B) Legitimate, benign content incorrectly flagged/blocked  C) A guardrail that never triggers  D) A type of prompt injection attack
   **Answer: B** — directly degrades application usefulness, requiring careful calibration.

5. Why do agentic systems need guardrails beyond simple content filtering?
   A) They don't — content guardrails are always sufficient  B) Agents can take genuine, consequential actions, requiring explicit action-level constraints (autonomous vs human-confirmation-required)  C) Agentic systems never generate text  D) Content guardrails work identically for agents and chatbots
   **Answer: B** — a hallucinating or manipulated agent taking a harmful real-world action is a genuinely expanded risk beyond text alone.
`,

  "revision-notes": `
Guardrails are the mechanisms — input filtering, output validation, and policy enforcement — constraining an LLM-powered application's behavior to stay within safe, intended bounds, addressing the BROADER safety concerns beyond hallucination specifically (covered in the immediately preceding skill). They exist because a model's own trained-in alignment (RLHF/DPO, covered in the **Fine-Tuning** skill) is genuinely NOT a perfect, unconditional guarantee — jailbreak attempts can circumvent it, and ordinary probabilistic generation can occasionally produce inappropriate output even without deliberate adversarial intent.

INPUT GUARDRAILS filter or flag a user's request BEFORE it reaches the model (catching malicious prompts, prompt injection attempts, or off-topic requests early); OUTPUT GUARDRAILS validate a model's generated response BEFORE it reaches the end user (catching safety violations, format non-compliance, or policy issues that emerged during generation). Both are genuinely necessary, since each catches DISTINCT classes of problems that the other cannot.

The central, frequently-tested architectural principle is DEFENSE IN DEPTH, directly reusing the **OWASP Top 10** skill's own security-layering guidance: never rely on any single guardrail mechanism (including the model's own alignment) alone — layer multiple, INDEPENDENT checks so a problem missed by one layer has a genuine chance of being caught by another. Three distinct implementation approaches, each with genuine tradeoffs, are commonly LAYERED together: RULE-BASED guardrails (explicit keyword/pattern matching — fastest, cheapest, but genuinely brittle and easily circumvented by rephrasing); CLASSIFIER-BASED guardrails (a dedicated, smaller trained ML model — moderate cost, more robust to rephrasing); and LLM-BASED guardrails (using a capable LLM itself to evaluate content against a nuanced policy — most flexible and contextually nuanced, but slowest and most expensive, best reserved for genuinely ambiguous or borderline cases the cheaper layers flag).

STRUCTURED OUTPUT VALIDATION (directly reusing the **Prompt Engineering** skill's own treatment) is itself a genuine, essential guardrail — explicitly validating that generated output conforms to an expected schema BEFORE it's trusted by a downstream system, with parsing/validation FAILURES triggering a RETRY (regenerating with a corrective prompt) rather than simply failing outright, where practical.

A critical, frequently-tested calibration tension exists between guardrail STRICTNESS and application USEFULNESS — an overly strict guardrail configuration minimizes FALSE NEGATIVES (harmful content slipping through) but directly increases FALSE POSITIVES (legitimate, benign requests incorrectly blocked, degrading usefulness and user trust); an overly permissive configuration preserves usefulness at increased genuine safety risk. There is NO universal "correct" calibration point — the right balance is genuinely, deliberately APPLICATION-SPECIFIC, depending on actual risk profile (a children's educational tool warrants meaningfully stricter guardrails, accepting more false positives, than a low-stakes internal developer tool) — directly analogous to the **Machine Learning** skill's own precision/recall tradeoff treatment and the **Hallucination** skill's own safety-versus-usefulness calibration guidance.

A genuinely important, forward-looking consideration directly foreshadowing the platform's later AI Agents category: for systems capable of taking genuine ACTIONS (not just generating text), guardrails must extend beyond content filtering to ACTION-LEVEL CONSTRAINTS — explicitly defining which specific actions an agent can take fully autonomously versus which genuinely require explicit human confirmation first, since a hallucinating or manipulated agent taking a real, consequential, potentially hard-to-reverse action represents a genuinely expanded risk surface beyond what pure content guardrails address.

A senior AI engineer NEVER assumes guardrails provide an absolute, unconditional safety guarantee — they significantly RAISE the difficulty and REDUCE the frequency of harmful output reaching users, but a sufficiently sophisticated, adversarial attempt can sometimes still circumvent even well-designed guardrails, directly motivating the platform's later, dedicated **AI Red Teaming** skill's own adversarial-testing treatment. A mature guardrail practice treats evaluation as an ONGOING, ITERATIVE discipline (directly reusing the **Evaluation** skill's own methodology) — continuously measuring both false-positive and false-negative rates, and refining guardrail rules based on real-world incidents and red-teaming findings, rather than treating guardrail design as a one-time, "set it and forget it" implementation task. This completes the platform's LLMs category, directly connecting to and setting up the more specialized **Prompt Injection Defense** and **AI Red Teaming** skills covered later in the platform.
`,

  "learning-roadmap": `
**Week 1 — Fundamentals**: understanding input/output guardrails and implementing a basic layered guardrail system. Milestone: complete Lab 1, with a working, tested implementation.

**Week 2 — Calibration**: measuring and calibrating false-positive/false-negative rates. Milestone: complete Lab 2, with a documented calibration analysis.

**Week 3 — Defense in depth**: building a full layered pipeline combining rule-based, classifier-based, and LLM-based guardrails. Milestone: complete Lab 3, with a documented layered-defense comparison.

**Week 4 — Action-level guardrails**: implementing action-level permission constraints for a simulated agentic system. Milestone: complete Lab 4, with a working, tested implementation.

This completes the LLMs category's skill sequence: **LLM Fundamentals** → **Prompt Engineering** → **Fine-Tuning** → **Inference** → **Serving** → **Evaluation** → **Hallucination** → **Guardrails**. Next platform category: **AI Agents**, beginning with **Agent Fundamentals**, directly building on this category's entire foundation.
`,

  "official-docs": `
- **NVIDIA's official NeMo Guardrails documentation** — the authoritative, widely-used reference for programmable, structured guardrail frameworks.
- **OpenAI's official Moderation API documentation** — a widely-used content moderation service reference.
- **Guardrails AI's official documentation** — an open-source library specifically focused on structured output validation.
`,

  books: `
- **"Building Machine Learning Powered Applications" — Emmanuel Ameisen** — covers production ML safety and reliability considerations broadly relevant to guardrail design.
- **"Designing Machine Learning Systems" — Chip Huyen** — covers evaluation and safety considerations directly relevant to this page's treatment.
`,

  blogs: `
- **The official NVIDIA NeMo Guardrails blog and documentation** — practical, framework-specific guidance on programmable guardrail design.
- **Various AI safety-focused blogs (Anthropic's, OpenAI's official safety research blogs)** — extensive, detailed coverage of alignment and guardrail-related safety practices.
- **Simon Willison's blog on prompt injection and LLM security** — widely-referenced, accessible, technically rigorous coverage directly relevant to guardrail design against adversarial attacks.
`,

  "research-papers": `
- **Rebedea, T. et al. — "NeMo Guardrails: A Toolkit for Controllable and Safe LLM Applications with Programmable Rails"** (2023) — the foundational NeMo Guardrails paper.
- General AI safety and alignment research on content moderation and safe deployment practices from major AI labs.
`,

  videos: `
- **Conference talks on NeMo Guardrails and programmable guardrail design** — detailed technical walkthroughs from the framework's own maintainers.
- **Practical tutorials on implementing content moderation and structured output validation** from various AI engineering educational content providers.
- **AI safety conference talks on real-world guardrail incidents and lessons learned** from major AI labs and safety-focused organizations.
`,

  "github-repos": `
- **NVIDIA/NeMo-Guardrails** — the official NeMo Guardrails source repository.
- **guardrails-ai/guardrails** — the official Guardrails AI source repository, focused on structured output validation.
- **openai/openai-python** (including Moderation API client) — the official OpenAI Python client, including content moderation API integration.
`,

  "practice-problems": `
Ordered by skill focus:

1. **Guardrail layer selection**: given a described content type and risk profile, choose and justify an appropriate combination of rule-based, classifier-based, and LLM-based guardrails.
2. **Calibration analysis**: given described false-positive and false-negative rates, recommend a recalibration strategy matched to a described application's risk profile.
3. **Defense-in-depth design**: given a described guardrail failure incident, design an additional, complementary layer addressing the specific gap.
4. **Action-level guardrail design**: given a described agentic system's capabilities, design an appropriate action-level permission tiering scheme.
5. **External practice sets**: NeMo Guardrails' official tutorials and example configurations for hands-on programmable guardrail practice.
`,

  "architecture-diagram": `
~~~mermaid
flowchart TB
    subgraph InputLayer["Input Guardrails"]
        RuleInput["Rule-Based Filter"]
        ClassifierInput["Classifier-Based Detection"]
    end
    subgraph ModelLayer["Model Layer"]
        Model["Language Model\n(RLHF/DPO Aligned)"]
    end
    subgraph OutputLayer["Output Guardrails"]
        SchemaVal["Structured Output\nValidation"]
        ContentMod["Content Moderation"]
        LLMJudgeGuard["LLM-Based Review\n(ambiguous cases)"]
    end
    subgraph Escalation["Escalation"]
        HumanReview["Human Review\n(high-stakes cases)"]
    end
    RuleInput --> ClassifierInput --> Model
    Model --> SchemaVal --> ContentMod --> LLMJudgeGuard
    LLMJudgeGuard -.->|"uncertain"| HumanReview
~~~
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Guardrails))
    Foundations
      Overview
      History NeMo Guardrails Moderation API
      Why it exists
      Problem it solves
    Guardrail Types
      Input guardrails
      Output guardrails
      Both needed
    Implementation Approaches
      Rule based
      Classifier based
      LLM based
    Defense in Depth
      OWASP Top 10 connection
      Layering multiple checks
      No single point of failure
    Structured Output Validation
      Schema validation
      Retry on failure
    Calibration
      False positives
      False negatives
      Risk profile matching
    Agentic Extensions
      Action level constraints
      Autonomous vs human confirmation
    Limits
      Not an absolute guarantee
      Continuous evaluation
      Red teaming
    Practice
      Interview questions
      Coding problems
      Hands-on labs
      Real projects
~~~
`,
};

export default guardrails;
